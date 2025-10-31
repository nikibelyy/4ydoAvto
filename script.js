document.addEventListener('DOMContentLoaded', () => {
  // Год в футере
  document.getElementById('year').textContent = new Date().getFullYear();

  // Бургер-меню
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');

  if (burger) {
    burger.addEventListener('click', () => {
      nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', nav.classList.contains('open'));
    });
  }

  // Плавный скролл по якорям
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        window.scrollTo({
          top: target.offsetTop - 60,
          behavior: 'smooth'
        });
        nav.classList.remove('open');
      }
    });
  });

  // Фейковая отправка формы
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      alert('Спасибо! Мы скоро вам перезвоним.');
      form.reset();
    });
  }
});
