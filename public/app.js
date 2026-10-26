/* Accessible interactions for the Maya Steel Works website. No analytics or data storage. */
document.documentElement.classList.add('js');
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const nav = $('#mobile-menu');
  const menuButton = $('#menu-toggle');
  const header = $('#site-header');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const closeMenu = () => {
    if (!nav || !menuButton) return;
    nav.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  };
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.hidden;
      nav.hidden = !open;
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    $$('a', nav).forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
    document.addEventListener('click', event => {
      if (!nav.hidden && !nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
  }
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  $('#year').textContent = String(new Date().getFullYear());
  const revealNodes = $$('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealNodes.forEach(node => node.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      for (const item of entries) {
        if (!item.isIntersecting) continue;
        item.target.classList.add('visible');
        observer.unobserve(item.target);
      }
    }, { threshold: 0.08, rootMargin: '0px 0px 50px 0px' });
    revealNodes.forEach(node => observer.observe(node));
  }
  // Hide inaccessible image cards on a photo CDN failure instead of leaving broken icons.
  $$('.gallery-item img').forEach(image => {
    image.addEventListener('error', () => {
      const item = image.closest('.gallery-item');
      if (item) item.classList.add('image-unavailable');
      image.style.opacity = '0';
    });
  });
  const filters = $$('.filter');
  const cards = $$('.gallery-item');
  filters.forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.filter;
    filters.forEach(other => { other.classList.toggle('active', other === button); other.setAttribute('aria-pressed', String(other === button)); });
    cards.forEach(card => { card.hidden = key !== 'all' && card.dataset.category !== key; });
  }));
  const galleryDialog = $('#gallery-dialog');
  const dialogImage = $('#dialog-image');
  const dialogTitle = $('#dialog-title');
  const dialogCount = $('#dialog-count');
  let galleryIndex = 0;
  let galleryOpener = null;
  const activeCards = () => cards.filter(card => !card.hidden);
  const displayImage = () => {
    const visible = activeCards();
    if (!visible.length) return;
    galleryIndex = (galleryIndex + visible.length) % visible.length;
    const card = visible[galleryIndex];
    dialogImage.src = card.dataset.img;
    dialogImage.alt = card.querySelector('img').alt;
    dialogTitle.textContent = card.dataset.title;
    dialogCount.textContent = String(galleryIndex + 1).padStart(2, '0') + ' / ' + String(visible.length).padStart(2, '0');
    $('#dialog-quote').dataset.service = card.dataset.service;
  };
  cards.forEach(card => card.addEventListener('click', () => {
    if (!galleryDialog || !galleryDialog.showModal) return;
    galleryOpener = card;
    galleryIndex = activeCards().indexOf(card);
    displayImage();
    galleryDialog.showModal();
    document.body.classList.add('modal-open');
  }));
  const closeDialog = () => {
    if (galleryDialog.open) galleryDialog.close();
  };
  $('#dialog-close').addEventListener('click', closeDialog);
  $('#dialog-prev').addEventListener('click', () => { galleryIndex--; displayImage(); });
  $('#dialog-next').addEventListener('click', () => { galleryIndex++; displayImage(); });
  galleryDialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    dialogImage.removeAttribute('src');
    if (galleryOpener) galleryOpener.focus();
  });
  galleryDialog.addEventListener('click', event => { if (event.target === galleryDialog) closeDialog(); });
  galleryDialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); galleryIndex--; displayImage(); }
    if (event.key === 'ArrowRight') { event.preventDefault(); galleryIndex++; displayImage(); }
  });
  const quoteForm = $('#quote-form');
  const serviceSelect = $('#service');
  const focusQuote = service => {
    if (service && Array.from(serviceSelect.options).some(option => option.value === service)) serviceSelect.value = service;
    closeDialog();
    document.querySelector('#quote').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    window.setTimeout(() => serviceSelect.focus({ preventScroll: true }), reducedMotion ? 0 : 550);
  };
  $$('.service-button').forEach(button => button.addEventListener('click', () => focusQuote(button.dataset.service)));
  $('#dialog-quote').addEventListener('click', event => focusQuote(event.currentTarget.dataset.service));
  const review = $('#review-dialog');
  const preview = $('#review-message');
  const whatsappLink = $('#send-whatsapp');
  const makeMessage = data => {
    const lines = [
      'Hello Maya Steel Works, I would like a free quotation.',
      '',
      'Name: ' + data.get('name').trim(),
      'Phone: ' + data.get('phone').trim(),
      'Service: ' + data.get('service')
    ];
    const addOptional = (key, label) => {
      const value = (data.get(key) || '').trim();
      if (value) lines.push(label + ': ' + value);
    };
    addOptional('measurements', 'Measurements');
    addOptional('quantity', 'Quantity');
    addOptional('details', 'Project details');
    lines.push('', 'Please let me know the pricing and next steps. Thank you.');
    return lines.join('\n');
  };
  quoteForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!quoteForm.reportValidity()) return;
    const data = new FormData(quoteForm);
    const message = makeMessage(data);
    preview.textContent = message;
    whatsappLink.href = 'https://wa.me/256757742177?text=' + encodeURIComponent(message);
    if (review.showModal) {
      review.showModal();
      document.body.classList.add('modal-open');
    } else {
      window.open(whatsappLink.href, '_blank', 'noopener,noreferrer');
    }
  });
  const closeReview = () => { if (review.open) review.close(); };
  $('#review-close').addEventListener('click', closeReview);
  $('#back-edit').addEventListener('click', () => { closeReview(); $('#name').focus(); });
  review.addEventListener('click', event => { if (event.target === review) closeReview(); });
  review.addEventListener('close', () => document.body.classList.remove('modal-open'));
  whatsappLink.addEventListener('click', () => closeReview());
})();
