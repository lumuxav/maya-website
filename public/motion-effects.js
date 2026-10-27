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
      gsap.to('.axis-feature-image img', {
        y: -28, rotation: -8, ease: 'none',
        scrollTrigger: { trigger: '.axis-feature', start: 'top bottom', end: 'bottom top', scrub: .7 },
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

  // A small, optional 3D precision-rings accent, desktop-only. No WebGL
  // work is loaded on phones, touch devices, reduced-motion or data saver.
  if (desktop.matches && finePointer.matches) {
    const canvas = document.querySelector('.cinema-feature-canvas');
    const container = document.querySelector('.cinema-feature-art');
    if (canvas && container) {
      import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js')
        .then(THREE => {
          let renderer;
          try {
            renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
          } catch (_) { return; }
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(45, 1, .1, 100);
          camera.position.z = 5;
          const rings = new THREE.Group();
          for (let i = 0; i < 3; i++) {
            const geometry = new THREE.TorusGeometry(1.05 + i * .21, .009, 6, 94);
            const material = new THREE.MeshBasicMaterial({ color: i % 2 ? 0xbfc9cc : 0xfb6744,
              transparent: true, opacity: .23 - i * .035, depthWrite: false });
            const ring = new THREE.Mesh(geometry, material);
            ring.rotation.set(.25 + i * .38, .2 + i * .5, .1 + i * .2);
            rings.add(ring);
          }
          scene.add(rings);
          const resize = () => {
            const width = Math.max(1, container.clientWidth), height = Math.max(1, container.clientHeight);
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
          };
          resize();
          const ro = new ResizeObserver(resize);
          ro.observe(container);
          let visible = true, frame = 0, tick = 0;
          const draw = () => {
            frame = 0;
            if (!visible || document.hidden || reduced.matches || !desktop.matches) return;
            rings.rotation.x += .0006; rings.rotation.y += .001;
            renderer.render(scene, camera);
            if (++tick % 2 === 0) frame = requestAnimationFrame(draw);
            else frame = requestAnimationFrame(draw);
          };
          const io = new IntersectionObserver(entries => {
            visible = entries[0]?.isIntersecting ?? false;
            if (visible && !frame) frame = requestAnimationFrame(draw);
            else if (!visible && frame) { cancelAnimationFrame(frame); frame = 0; }
          }, { threshold: .01 });
          io.observe(container);
          document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !frame) frame = requestAnimationFrame(draw); });
          reduced.addEventListener?.('change', () => {
            if (reduced.matches) { if (frame) cancelAnimationFrame(frame); frame = 0; renderer.clear(); }
          });
          desktop.addEventListener?.('change', () => {
            if (!desktop.matches) { if (frame) cancelAnimationFrame(frame); frame = 0; renderer.clear(); }
            else { resize(); if (visible && !frame) frame = requestAnimationFrame(draw); }
          });
          window.addEventListener('pagehide', () => { if (frame) cancelAnimationFrame(frame); io.disconnect(); ro.disconnect(); renderer.dispose(); }, { once: true });
        }).catch(() => { /* WebGL is optional; the photo remains the hero. */ });
    }
  }
}
