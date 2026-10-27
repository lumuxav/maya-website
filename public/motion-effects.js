/* Motion enhancements are progressive: the website stays usable when external
   animation libraries cannot load. Mobile keeps native scrolling and safe areas. */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine)');
const desktop = window.matchMedia('(min-width: 901px)');
const dataSaver = navigator.connection?.saveData === true;
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;

if (!reduced.matches && !dataSaver) {
  if (gsap && ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const fast = { duration: .93, ease: 'power3.out' };
    gsap.fromTo('.cinema-eyebrow', { autoAlpha: .25, x: -12 }, { autoAlpha: 1, x: 0, duration: .65, ease: 'power2.out' });
    gsap.fromTo('.cinema-copy h1', { autoAlpha: 0.2, y: 38 }, { autoAlpha: 1, y: 0, delay: 0.13, ...fast });
    gsap.fromTo('.cinema-lead', { autoAlpha: .25, y: 20 }, { autoAlpha: 1, y: 0, delay: .3, duration: .78, ease: 'power2.out' });
    gsap.fromTo('.cinema-actions', { autoAlpha: .2, y: 15 }, { autoAlpha: 1, y: 0, delay: .46, duration: .75, ease: 'power2.out' });
    gsap.fromTo('.cinema-proof', { autoAlpha: .3 }, { autoAlpha: 1, delay: .65, duration: 1 });
    const sections = document.querySelectorAll('.axis-material-frame, .service-card, .process-step, .gallery-item, .contact-card, .intro-content');
    sections.forEach((node, index) => {
      gsap.fromTo(node,
        { opacity: .78, y: 22 },
        { opacity: 1, y: 0, duration: .8, delay: (index % 3) * .1, ease: 'power2.out',
          scrollTrigger: { trigger: node, start: 'top 94%', once: true } });
    });
    if (desktop.matches) {
      gsap.to('.cinema-scene-art', {
        yPercent: 5, scale: 1.05, ease: 'none',
        scrollTrigger: { trigger: '.cinema-hero', start: 'top top', end: 'bottom top', scrub: .85 },
      });
      // Gentle motion on the company's material photographs; never on touch.
      document.querySelectorAll('.maya-photo-section').forEach(section => {
        const photo = section.querySelector('.maya-photo-stage img');
        if (!photo) return;
        gsap.to(photo, {
          yPercent: 4, scale: 1.09, ease: 'none',
          scrollTrigger: {
            trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1.2,
          },
        });
      });
      gsap.to('.maya-feature-panel', {
        y: -18, rotation: -5, ease: 'none',
        scrollTrigger: { trigger: '.axis-feature', start: 'top bottom', end: 'bottom top', scrub: .6 },
      });
      gsap.to('.maya-feature-cutout', {
        y: 15, rotation: 10, ease: 'none',
        scrollTrigger: { trigger: '.axis-feature', start: 'top bottom', end: 'bottom top', scrub: .8 },
      });
    }
    // Do not hijack mobile gestures or scrolling. Lenis is desktop-only.
    if (desktop.matches && finePointer.matches && window.Lenis) {
      try {
        const lenis = new window.Lenis({ duration: 1.07, smoothWheel: true, syncTouch: false });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
      } catch (error) {
        console.info('Native scroll retained:', error);
      }
    }
  }

  // Motion's vanilla JavaScript API, not its React-only package, animates
  // taps without requiring a React framework migration.
  import('https://cdn.jsdelivr.net/npm/motion@12.23.24/+esm')
    .then(({ animate }) => {
      document.querySelectorAll('.axis-whatsapp-order, .axis-service-order, .cinema-button, .button-accent, .nav-cta, .service-button')
        .forEach(element => {
          element.addEventListener('pointerdown', () => animate(element, { scale: [.98, 1] }, { duration: .28 }), { passive: true });
        });
    }).catch(() => { /* Native focus, hover and tap states remain available. */ });

  // Anime.js handles a very small looping visual cue, rather than another
  // full-page animation scheduler.
  import('https://cdn.jsdelivr.net/npm/animejs@4.5.0/+esm')
    .then(({ animate }) => {
      const dot = document.querySelector('.cinema-ember');
      if (dot) animate(dot, { opacity: [.55, 1], scale: [1, 1.25],
        duration: 1600, alternate: true, loop: true, ease: 'inOutSine' });
    }).catch(() => {});

  // Actual workshop photographs receive only lightweight GSAP movement.
  // No synthetic 3D objects are rendered in the site artwork.

}
