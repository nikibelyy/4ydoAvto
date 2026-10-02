const nav=document.querySelector('.nav');
const progress=document.querySelector('.scroll-progress span');
const menu=document.querySelector('.menu');
const reveals=document.querySelectorAll('.reveal');

const io=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}})
},{threshold:.12});
reveals.forEach((el,i)=>{el.style.transitionDelay=Math.min(i%5*55,220)+'ms';io.observe(el)});

function scrollUI(){
  const y=window.scrollY, h=document.documentElement.scrollHeight-innerHeight;
  nav.classList.toggle('scrolled',y>18);
  progress.style.width=(h>0?Math.min(100,y/h*100):0)+'%';
}
scrollUI(); window.addEventListener('scroll',scrollUI,{passive:true});

menu?.addEventListener('click',()=>{
  const open=nav.classList.toggle('open');
  menu.setAttribute('aria-expanded',open);
});
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const id=a.getAttribute('href');
    if(id.length>1){e.preventDefault();document.querySelector(id)?.scrollIntoView({behavior:'smooth',block:'start'});}
  });
});

// Small purposeful parallax on the hero network, disabled for touch/reduced motion.
const scene=document.querySelector('.network-scene');
if(scene && matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches){
  scene.addEventListener('pointermove',e=>{
    const r=scene.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    scene.style.transform=`perspective(1000px) rotateY(${x*2}deg) rotateX(${y*-1.5}deg)`;
  });
  scene.addEventListener('pointerleave',()=>scene.style.transform='');
}
