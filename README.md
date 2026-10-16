# Work Calendar PWA

Минималистичный офлайн-first календарь на Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, Lucide React и date-fns.

## Возможности

- Представления: месяц, неделя, день и повестка.
- Создание, редактирование и удаление событий.
- Категории, приоритеты, описание и теги.
- Поиск по названию, описанию и тегам.
- IndexedDB для локального хранения событий.
- Импорт и экспорт JSON с проверкой структуры.
- Светлая и тёмная тема.
- Адаптивная мобильная навигация и свайпы.
- PWA manifest и Service Worker для кэширования оболочки.

## Требования

Node.js 18.17+ (рекомендуется Node.js 20).

## Запуск

```bash
npm install
npm run dev
```

Откройте http://localhost:3000.

## Production

```bash
npm run build
npm run start
```

Service Worker работает на localhost и HTTPS. Для проверки офлайн-режима сначала откройте приложение онлайн, затем в DevTools отключите сеть.

## Публикация на GitHub

1. Создайте пустой репозиторий на GitHub.
2. Распакуйте архив.
3. В терминале в корне проекта выполните:

```bash
git init
git add .
git commit -m "Initial Work Calendar PWA"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

Замените `USERNAME/REPOSITORY` на путь своего репозитория.

## Важно

Это клиентский календарь: события хранятся в IndexedDB конкретного браузера и не синхронизируются между устройствами. Для командной синхронизации потребуется серверная БД и аутентификация. Иконки PWA — SVG-заготовки; для широкого охвата установок можно дополнительно подготовить PNG 192×192 и 512×512.
