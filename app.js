(() => {
  'use strict';
  const WHATSAPP_NUMBER = '5561999681544'; // IMPORTANTE: substitua pelo número oficial com código do país e DDD.
  const form = document.getElementById('f');
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.textContent = isOpen ? 'Fechar' : 'Menu';
    });
    siteNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.textContent = 'Menu';
    }));
  }
  const lightbox = document.createElement('div');
  lightbox.className = 'lb';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Imagem ampliada');
  const enlarged = document.createElement('img');
  enlarged.alt = '';
  lightbox.appendChild(enlarged);
  document.body.appendChild(lightbox);

  function openWhatsApp(message) {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    const tab = window.open(url, '_blank', 'noopener,noreferrer');
    if (!tab) window.location.href = url;
  }

  if (form) {
    const phone = form.elements.namedItem('tel');
    if (phone) {
      phone.addEventListener('input', () => {
        const digits = phone.value.replace(/\D/g, '').slice(0, 11);
        if (digits.length <= 2) phone.value = digits;
        else if (digits.length <= 7) phone.value = `(${digits.slice(0,2)}) ${digits.slice(2)}`;
        else phone.value = `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
      });
    }
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const name = String(data.get('nome') || '').trim().slice(0, 100);
      const tel = String(data.get('tel') || '').trim().slice(0, 30);
      const interest = String(data.get('int') || 'Moradia').trim().slice(0, 40);
      const message = `Olá! Meu nome é ${name}. Tenho interesse no Recanto dos Canários (${interest}). Gostaria de receber informações.`;
      openWhatsApp(message);
    });
  }

  function closeLightbox() {
    lightbox.classList.remove('on');
    enlarged.removeAttribute('src');
  }
  lightbox.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeLightbox(); });
  document.querySelectorAll('.zoom img').forEach((img) => {
    img.style.cursor = 'zoom-in';
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `Ampliar imagem: ${img.alt || 'foto do empreendimento'}`);
    const open = () => { enlarged.src = img.currentSrc || img.src; enlarged.alt = img.alt || 'Imagem ampliada'; lightbox.classList.add('on'); };
    img.addEventListener('click', open);
    img.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
  });
})();
