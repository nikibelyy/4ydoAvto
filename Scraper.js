// scraper.js
// Запускает headless-браузер, открывает публичную страницу Яндекс.Пробок по Воронежу,
// извлекает события типа "accident" и шлёт новые в Telegram через Bot API.

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

/**
 * === НАСТРОЙКИ: ВСТАВЬ СЮДА СВОИ ЗНАЧЕНИЯ ===
 */
const TELEGRAM_BOT_TOKEN = "8219557838:AAE18HofoNDD6gpn9LqbNtfMiEIOV3HPLF8";
const TELEGRAM_CHAT_ID = "7523840597"; // например, "-1001234567890" для канала или "12345678" для пользователя
// Публичная страница пробок для Воронежа — используем региональную страницу
const YANDEX_PROBKI_URL = "https://yandex.ru/maps/51/voronezh/?ll=39.181225%2C51.703947&z=12&l=trf";

/**
 * Путь к файлу, где храним уже отправлённые id/хэши
 */
const SEEN_FILE = path.join(__dirname, 'seen.json');

let seen = new Set();
try {
  const raw = fs.readFileSync(SEEN_FILE, 'utf8');
  const arr = JSON.parse(raw);
  arr.forEach(x => seen.add(x));
} catch (e) {
  console.log('Не удалось прочитать seen.json — будет создан новый.');
}

/**
 * Сохраняем seen в файл
 */
function saveSeen() {
  try {
    fs.writeFileSync(SEEN_FILE, JSON.stringify(Array.from(seen)), 'utf8');
  } catch (e) {
    console.error('Ошибка сохранения seen.json', e);
  }
}

/**
 * Отправка сообщения в Telegram
 */
async function sendTelegram(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = {
    chat_id: TELEGRAM_CHAT_ID,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: false
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body)
  });
  const j = await res.json();
  if (!j.ok) {
    console.error('Ошибка отправки в Telegram:', j);
  }
  return j;
}

/**
 * Функция извлечения событий ДТП со страницы Yandex.Пробки
 */
async function extractAccidentsFromPage(page) {
  // выполняем на странице JS, чтобы найти JSON/состояние
  const result = await page.evaluate(() => {
    // Попробуем найти скрипт, где есть window.__state__ (часто именно там лежит JSON)
    const scripts = Array.from(document.querySelectorAll('script'));
    for (const s of scripts) {
      if (s.textContent && s.textContent.includes('window.__state__')) {
        const text = s.textContent;
        const start = text.indexOf('window.__state__ = ');
        if (start !== -1) {
          const jsonStart = start + 'window.__state__ = '.length;
          const semicolon = text.indexOf(';', jsonStart);
          if (semicolon !== -1) {
            const jsonText = text.slice(jsonStart, semicolon).trim();
            try {
              const obj = JSON.parse(jsonText);
              return {source: 'window.__state__', data: obj};
            } catch (e) {
              // parse error
            }
          }
        }
      }
    }

    // Альтернативный путь: иногда данные подгружаются в других переменных, попробуем найти 'traffic' в тексте скриптов.
    for (const s of scripts) {
      const t = s.textContent || '';
      if (t.includes('"traffic"') && t.length < 500000) {
        try {
          const idx = t.indexOf('{');
          const jsonText = t.slice(idx);
          const obj = JSON.parse(jsonText);
          return {source: 'script-json', data: obj};
        } catch (e) {
          // ignore
        }
      }
    }

    // Если ничего не нашли, попробуем найти в DOM метки пробок (но это ненадёжно)
    // Возвращаем null
    return {source: 'none', data: null};
  });

  if (!result || !result.data) return [];

  // Теперь попытаемся из result.data найти объекты пробок/маячков.
  // Структура может меняться; будем искать рекурсивно объекты с ключом "features" или "traffic".
  function findTrafficNodes(obj) {
    if (!obj || typeof obj !== 'object') return [];
    const out = [];
    if (Array.isArray(obj)) {
      for (const item of obj) out.push(...findTrafficNodes(item));
      return out;
    }
    // если нашли node с features где элементы содержат geometry/properties/event
    if (Array.isArray(obj.features)) {
      out.push(obj);
    }
    for (const k of Object.keys(obj)) {
      out.push(...findTrafficNodes(obj[k]));
    }
    return out;
  }

  const nodes = findTrafficNodes(result.data);
  const accidents = [];

  for (const node of nodes) {
    for (const f of node.features || []) {
      try {
        const props = f.properties || {};
        const ev = props.event || props.events || props;
        const type = ev && ev.type ? ev.type : (props.type || null);
        if (type === 'accident' || (props && props.event && props.event.type === 'accident')) {
          let coords = null;
          if (f.geometry && Array.isArray(f.geometry.coordinates)) {
            // coordinates often [lon, lat]
            coords = f.geometry.coordinates;
          } else if (f.center && Array.isArray(f.center)) {
            coords = f.center;
          }
          const address = props.name || props.title || (props.address && props.address.full) || 'Неизвестный адрес';
          accidents.push({
            id: props.id || props.hash || JSON.stringify([address, coords]),
            address,
            coords,
            raw: props
          });
        }
      } catch (e) {
        // ignore
      }
    }
  }

  // Удалим дубликаты по id
  const unique = {};
  accidents.forEach(a => {
    unique[a.id] = a;
  });
  return Object.values(unique);
}

/**
 * Главный цикл
 */
(async () => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Пожалуйста, заполните TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в файле scraper.js');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // Установим юзерагент, чтобы снизить шанс блокировки
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36');

  // Интервал проверки в миллисекундах
  const CHECK_INTERVAL = 60 * 1000 * 2; // каждые 2 минуты — можно увеличить до 5 минут (300000)

  console.log('Запуск цикла проверки ДТП...');

  while (true) {
    try {
      console.log(new Date().toISOString(), 'Открываю страницу пробок...');
      await page.goto(YANDEX_PROBKI_URL, {waitUntil: 'networkidle2', timeout: 60000});
      // Подождём чуть-чуть, чтобы JS полностью подгрузил данные
      await page.waitForTimeout(2500);

      const accidents = await extractAccidentsFromPage(page);
      console.log('Найдено ДТП:', accidents.length);

      for (const a of accidents) {
        const uniqueId = String(a.id);
        if (!seen.has(uniqueId)) {
          // формируем сообщение
          let mapLink = 'https://yandex.ru/maps/probki';
          if (a.coords && Array.isArray(a.coords)) {
            // coords может быть [lon, lat] или [lat, lon] — попробуем проверить размер
            let lon = a.coords[0], lat = a.coords[1];
            // если координаты выглядят не как долгота/широта, не менять
            mapLink = `https://yandex.ru/maps/probki/?ll=${lon},${lat}&z=16&l=trf%2Ctrfe&trf=info`;
          }
          const message = `🚗 <b>ДТП</b>\n${a.address}\nКарта: ${mapLink}`;
          console.log('Отправляю в Telegram:', message);
          await sendTelegram(message);
          // отметим как отправленное
          seen.add(uniqueId);
        } else {
          // уже отправлено
        }
      }

      // сохраняем seen на диск
      saveSeen();

    } catch (err) {
      console.error('Ошибка в цикле проверки:', err);
    }

    // ждем интервал
    console.log('Ожидание перед следующей проверкой...');
    await new Promise(res => setTimeout(res, CHECK_INTERVAL));
  }

  // await browser.close();
})();
