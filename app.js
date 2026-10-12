(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const ru = new Intl.DateTimeFormat('ru-RU');
  const money = n => new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(n) + ' ₽';
  const dateKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const parseDate = s => { const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d,12); };
  const today = new Date(); today.setHours(12,0,0,0);
  let salary = Number(localStorage.getItem('wc_salary') || 8300);
  let anchor = localStorage.getItem('wc_anchor') || dateKey(today);
  let month = new Date(today.getFullYear(),today.getMonth(),1);
  let selected = new Date(today);
  let deferredInstall = null;
  const daysRu = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
  const monthsRu = ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
  function isWork(d) {
    const a=parseDate(anchor); const diff=Math.round((new Date(d.getFullYear(),d.getMonth(),d.getDate())-new Date(a.getFullYear(),a.getMonth(),a.getDate()))/86400000);
    return ((diff%4)+4)%4 < 2;
  }
  function sameDay(a,b){return dateKey(a)===dateKey(b)}
  function fmt(d, opts={day:'numeric',month:'long'}) { return new Intl.DateTimeFormat('ru-RU',opts).format(d); }
  function showToast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove('show'),2600)}
  function nav(name){$$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${name}`));$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.nav===name)); if(name==='calendar')renderCalendar();if(name==='salary')renderSalary();window.scrollTo({top:0,behavior:document.body.classList.contains('reduce-motion')?'auto':'smooth'});}
  $$('[data-nav]').forEach(b=>b.addEventListener('click',()=>nav(b.dataset.nav)));
  function renderHome(){
    const work=isWork(today);
    $('#todayStatus').textContent=work?'Сегодня рабочий день':'Сегодня выходной';
    $('#todayHeading').textContent=work?'Сегодня и завтра на смене':'Сегодня отдыхаешь';
    $('#heroSalary').textContent=money(salary);
    const days=$('#nextDays');days.innerHTML='';
    for(let i=0;i<2;i++){
      const d=new Date(today);d.setDate(d.getDate()+i);const w=isWork(d);
      const card=document.createElement('div');card.className='shift-card '+(w?'':'off');
      card.innerHTML=`<div class="shift-icon">${w?'▣':'☾'}</div><div><div class="shift-date">${i===0?'Сегодня':i===1?'Завтра':fmt(d,{weekday:'long'})}, ${fmt(d,{day:'numeric',month:'short'})}</div><strong>${w?'Рабочая смена':'День отдыха'}</strong><small>${w?'График 2/2 · рабочий день':'Время восстановиться'}</small></div><span class="day-status">${w?'Работа':'Отдых'}</span>`;
      days.appendChild(card);
    }
    const p=getNextPay();$('#nextPayTitle').textContent=fmt(p.date,{day:'numeric',month:'long'});$('#nextPayAmount').textContent=money(salary/2);$('#nextPayLabel').textContent=p.label;
    const diff=Math.ceil((new Date(p.date.getFullYear(),p.date.getMonth(),p.date.getDate())-new Date(today.getFullYear(),today.getMonth(),today.getDate()))/86400000);
    $('#nextPayDesc').textContent=diff===0?'Выплата сегодня':`До выплаты: ${diff} ${plural(diff,['день','дня','дней'])}`;
  }
  function plural(n,forms){n=Math.abs(n)%100;const n1=n%10;return n>10&&n<20?forms[2]:n1>1&&n1<5?forms[1]:n1===1?forms[0]:forms[2]}
  function getNextPay(){
    const d=new Date(today);let day,label;
    if(today.getDate()<10){day=10;label='Вторая половина прошлого месяца'}
    else if(today.getDate()<25){day=25;label='Первая половина текущего месяца'}
    else {d.setMonth(d.getMonth()+1);day=10;label='Вторая половина прошлого месяца'}
    d.setDate(day);return {date:d,label};
  }
  function renderCalendar(){
    $('#monthLabel').textContent=monthsRu[month.getMonth()]+' '+month.getFullYear();
    const grid=$('#calendarGrid');grid.innerHTML='';
    const first=new Date(month.getFullYear(),month.getMonth(),1);let offset=(first.getDay()+6)%7;
    for(let i=0;i<offset;i++){const e=document.createElement('div');e.className='calendar-day empty';grid.appendChild(e)}
    const count=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
    for(let n=1;n<=count;n++){
      const d=new Date(month.getFullYear(),month.getMonth(),n,12);const w=isWork(d);
      const b=document.createElement('button');b.className='calendar-day '+(w?'work':'off')+(sameDay(d,today)?' today':'')+(sameDay(d,selected)?' selected':'');
      b.setAttribute('aria-label',`${fmt(d,{day:'numeric',month:'long'})}, ${w?'рабочий день':'выходной'}`);
      b.innerHTML=`<span class="num">${n}</span><i class="day-mark"></i>`;
      b.addEventListener('click',()=>{selected=d;renderCalendar()});grid.appendChild(b);
    }
    const w=isWork(selected);$('#selectedDayCard').innerHTML=`<div class="selected-date-big">${selected.getDate()}</div><div class="selected-details"><strong>${fmt(selected,{weekday:'long',day:'numeric',month:'long'})}</strong><small>${w?'Твоя рабочая смена по графику 2/2':'Запланирован выходной'}</small></div><span class="selected-badge ${w?'':'off'}">${w?'Работа':'Отдых'}</span>`;
  }
  function renderSalary(){
    const half=salary/2;['#salaryPageAmount','#heroSalary'].forEach(s=>$(s).textContent=money(salary));
    ['#split10','#split25','#payout10','#payout25','#nextPayAmount'].forEach(s=>$(s).textContent=money(half));
    $('#salaryInput').value=salary;
  }
  $('#prevMonth').addEventListener('click',()=>{month.setMonth(month.getMonth()-1);renderCalendar()});
  $('#nextMonth').addEventListener('click',()=>{month.setMonth(month.getMonth()+1);renderCalendar()});
  $('#saveSalary').addEventListener('click',()=>{const v=Number($('#salaryInput').value);if(!Number.isFinite(v)||v<0){showToast('Введи корректную сумму');return}salary=v;localStorage.setItem('wc_salary',String(salary));renderSalary();renderHome();showToast('Зарплата обновлена')});
  $('#anchorDate').value=anchor;
  $('#saveAnchor').addEventListener('click',()=>{if(!$('#anchorDate').value){showToast('Выбери дату');return}anchor=$('#anchorDate').value;localStorage.setItem('wc_anchor',anchor);renderHome();renderCalendar();showToast('График 2/2 сохранён')});
  $('#themeBtn').addEventListener('click',()=>{document.body.classList.toggle('light');localStorage.setItem('wc_theme',document.body.classList.contains('light')?'light':'dark')});
  if(localStorage.getItem('wc_theme')==='light')document.body.classList.add('light');
  $('#motionToggle').addEventListener('change',e=>{document.body.classList.toggle('reduce-motion',!e.target.checked);localStorage.setItem('wc_motion',e.target.checked?'on':'off')});
  if(localStorage.getItem('wc_motion')==='off'){$('#motionToggle').checked=false;document.body.classList.add('reduce-motion')}
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('#installHint').textContent='Приложение готово к установке';$('#installBtn').textContent='Установить'});
  $('#installBtn').addEventListener('click',async()=>{if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null}else showToast('В браузере выбери «Добавить на главный экран» или «Установить приложение»')});
  window.addEventListener('appinstalled',()=>showToast('Приложение установлено!'));
  renderHome();renderCalendar();renderSalary();
  setTimeout(()=>$('#splash').classList.add('hide'),1350);
  if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();