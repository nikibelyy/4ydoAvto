(()=>{'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const today=new Date();today.setHours(12,0,0,0);
const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const parse=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,12)};
const money=n=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(n)+' ₽';
const fmt=(d,o={day:'numeric',month:'long'})=>new Intl.DateTimeFormat('ru-RU',o).format(d);
const months=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
let anchor=localStorage.getItem('wc_anchor')||key(today);
let daily=Number(localStorage.getItem('wc_daily')||8300);
let manualDays=localStorage.getItem('wc_days')===null?15:Number(localStorage.getItem('wc_days'));
let extras=JSON.parse(localStorage.getItem('wc_extras')||'[]');
let month=new Date(today.getFullYear(),today.getMonth(),1),selected=new Date(today),installPrompt=null;
$('#anchorDate').value=anchor;$('#dailyInput').value=daily;$('#daysInput').value=manualDays;$('#extraMonth').value=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;
function work(d){const a=parse(anchor),b=new Date(d.getFullYear(),d.getMonth(),d.getDate());const diff=Math.round((b-new Date(a.getFullYear(),a.getMonth(),a.getDate()))/86400000);return ((diff%4)+4)%4<2}
function monthKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function countWork(d){let n=0;const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();for(let i=1;i<=last;i++)if(work(new Date(d.getFullYear(),d.getMonth(),i,12)))n++;return n}
function extraTotal(k){return extras.filter(x=>x.month===k).reduce((s,x)=>s+Number(x.amount),0)}
function calc(d,daysOverride=null){const days=daysOverride===null?countWork(d):daysOverride;const base=days*daily,extra=extraTotal(monthKey(d));return {days,base,extra,total:base+extra}}
function toast(s){const t=$('#toast');t.textContent=s;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2400)}
function save(){localStorage.setItem('wc_anchor',anchor);localStorage.setItem('wc_daily',String(daily));localStorage.setItem('wc_days',String(manualDays));localStorage.setItem('wc_extras',JSON.stringify(extras))}
function plural(n){return n%10===1&&n%100!==11?'день':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'дня':'дней'}
function nav(id){$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.go===id));if(id==='calendar')renderCalendar();if(id==='salary')renderSalary();window.scrollTo({top:0,behavior:'smooth'})}
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>nav(b.dataset.go)));
function renderHome(){
 $('#statusText').textContent=work(today)?'Сегодня и завтра у тебя рабочие дни':'Сегодня у тебя выходной';
 $('#dailyHero').textContent=money(daily);
 const list=$('#nextDays');list.innerHTML='';
 for(let i=0;i<4;i++){const d=new Date(today);d.setDate(d.getDate()+i);const w=work(d),el=document.createElement('div');el.className='day-card '+(w?'':'off');el.innerHTML=`<div class="day-icon">${w?'▣':'☾'}</div><div><small class="date">${i===0?'Сегодня':i===1?'Завтра':fmt(d,{weekday:'short'})} · ${fmt(d,{day:'numeric',month:'short'})}</small><strong>${w?'Рабочая смена':'День отдыха'}</strong><small>${w?money(daily)+' за день':'Отдых по графику 2/2'}</small></div>`;list.append(el)}
 const c=calc(today,manualDays);$('#monthWorkDays').textContent=manualDays+' дн.';$('#monthBasePay').textContent=money(c.base);$('#monthExtraPay').textContent=money(c.extra);$('#monthTotal').textContent=money(c.total);
}
function renderCalendar(){
 $('#monthLabel').textContent=months[month.getMonth()]+' '+month.getFullYear();const grid=$('#calendarGrid');grid.innerHTML='';
 const first=new Date(month.getFullYear(),month.getMonth(),1),offset=(first.getDay()+6)%7;
 for(let i=0;i<offset;i++){const e=document.createElement('div');e.className='cell empty';grid.append(e)}
 for(let n=1;n<=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();n++){const d=new Date(month.getFullYear(),month.getMonth(),n,12),w=work(d),b=document.createElement('button');b.className='cell '+(w?'':'off')+(key(d)===key(today)?' today':'')+(key(d)===key(selected)?' selected':'');b.innerHTML=`<span class="num">${n}</span><i class="mark"></i>`;b.setAttribute('aria-label',`${fmt(d)}, ${w?'рабочий день':'выходной'}`);b.addEventListener('click',()=>{selected=d;renderCalendar()});grid.append(b)}
 const w=work(selected);$('#selectedCard').innerHTML=`<div class="selected-num">${selected.getDate()}</div><div class="selected-text"><b>${fmt(selected,{weekday:'long',day:'numeric',month:'long'})}</b><small>${w?'Рабочая смена по графику 2/2':'Выходной по графику 2/2'}</small></div><span class="status-badge ${w?'':'off'}">${w?'Работа':'Отдых'}</span>`;
}
function renderSalary(){
 const d=calc(today,manualDays);$('#dailyBig').textContent=money(daily);$('#salaryMonthTitle').textContent=months[today.getMonth()]+' '+today.getFullYear();$('#calcDays').textContent=manualDays+' дн.';$('#calcBase').textContent=money(d.base);$('#calcExtras').textContent=money(d.extra);$('#calcTotal').textContent=money(d.total);
 const list=$('#extrasList');list.innerHTML='';const current=monthKey(today),filtered=extras.filter(x=>x.month===current);
 if(!filtered.length){list.innerHTML='<div class="empty-state">В этом месяце доплат пока нет. Добавь премию, бонус или другую выплату выше.</div>';return}
 filtered.forEach(x=>{const el=document.createElement('div');el.className='extra-item';const desc=document.createElement('div');desc.className='extra-desc';const b=document.createElement('b');b.textContent=x.name;const sm=document.createElement('small');sm.textContent=x.month;desc.append(b,sm);const val=document.createElement('strong');val.className='extra-value';val.textContent='+'+money(Number(x.amount));const del=document.createElement('button');del.className='delete-extra';del.textContent='Удалить';del.setAttribute('aria-label','Удалить доплату '+x.name);del.addEventListener('click',()=>{extras=extras.filter(a=>a.id!==x.id);save();renderSalary();renderHome();toast('Доплата удалена')});el.append(Object.assign(document.createElement('div'),{className:'extra-symbol',textContent:'+'}),desc,val,del);list.append(el)})
}
$('#prevMonth').addEventListener('click',()=>{month.setMonth(month.getMonth()-1);renderCalendar()});$('#nextMonth').addEventListener('click',()=>{month.setMonth(month.getMonth()+1);renderCalendar()});
$('#savePay').addEventListener('click',()=>{const d=Number($('#dailyInput').value),n=Number($('#daysInput').value);if(!Number.isFinite(d)||d<0||!Number.isInteger(n)||n<0||n>31){toast('Проверь ставку и количество рабочих дней');return}daily=d;manualDays=n;save();renderSalary();renderHome();toast('Расчёт зарплаты сохранён')});
$('#addExtra').addEventListener('click',()=>{const name=$('#extraName').value.trim(),amount=Number($('#extraAmount').value),m=$('#extraMonth').value;if(!name){toast('Укажи название доплаты');$('#extraName').focus();return}if(!Number.isFinite(amount)||amount<=0){toast('Введи сумму больше нуля');$('#extraAmount').focus();return}if(!m){toast('Выбери месяц для доплаты');return}extras.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),name,amount,month:m});save();$('#extraName').value='';$('#extraAmount').value='';renderSalary();renderHome();toast('Доплата добавлена к выбранному месяцу')});
$('#saveAnchor').addEventListener('click',()=>{if(!$('#anchorDate').value){toast('Выбери дату');return}anchor=$('#anchorDate').value;save();renderHome();renderCalendar();toast('График 2/2 обновлён')});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#installHint').textContent='Можно установить приложение на устройство';$('#installBtn').textContent='Установить сейчас'});
$('#installBtn').addEventListener('click',async()=>{if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null}else toast('Открой меню браузера и выбери «Установить приложение» или «Добавить на главный экран»')});
if('serviceWorker'in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
renderHome();renderCalendar();renderSalary();setTimeout(()=>$('#splash').classList.add('hide'),1350);
})();