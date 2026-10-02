/* Unzip intro (homepage).
   Scrolling, or dragging the zip pull, unzips the Lakeshore Shell. Three acts:
     1. Unzip  - the pull slides down the zip and the upper halves open into a V. Through the gap
                 you see the quilted lining and the woven neck label.
     2. Doors  - both halves swing out like doors while the lining grows to fill the screen:
                 you are now inside the jacket.
     3. Inside - Collection 01 rises out of the lining, and the page carries on below.
   The scroll position is the only source of truth: dragging the pull just scrolls the page.
   Every frame writes only transforms, clip-paths and opacity, so it stays smooth. */
(() => {
  const zip = document.querySelector('[data-zip]');
  if (!zip) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches && !/[?&]motion=1/.test(location.search)) {
    zip.classList.add('zip-still');
    return;
  }
  const q = s => zip.querySelector(s);
  const pin = q('.zip-pin'), jacket = q('.zip-jacket'), cam = q('.zip-cam'), word = q('.zip-word');
  const lt = q('.zj-lt'), rt = q('.zj-rt'), lb = q('.zj-lb'), rb = q('.zj-rb');
  const lining = q('.zip-lining'), pull = q('.zip-pull'), hint = q('.zip-hint'), cue = q('.zip-cue');
  const head = q('.zi-head'), all = q('.zi-all'), items = [...zip.querySelectorAll('.zi-item')];
  const TOP = 12, BOTTOM = 92;          // the zip line, in % of the jacket's height (measured on the cut-out)
  const UNZIP_END = 0.5;                // share of the scroll used by act 1

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const out = t => 1 - Math.pow(1 - t, 3);
  const inOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  /* Scroll geometry: progress 0 when the section reaches the header, 1 when it is about to unpin. */
  let start = 0, span = 1;
  const measure = () => {
    const top = parseFloat(getComputedStyle(pin).top) || 0;
    start = zip.getBoundingClientRect().top + scrollY - top;
    span = Math.max(1, zip.offsetHeight - pin.offsetHeight);
  };
  const target = () => clamp((scrollY - start) / span);

  function render(p) {
    const u = out(seg(p, 0, UNZIP_END));          // act 1
    const d = inOut(seg(p, 0.48, 0.78));          // act 2
    const S = TOP + (BOTTOM - TOP) * u;           // where the pull is, % of jacket height
    const a = 13 * u;                             // how wide the V is, degrees
    const doorX = d * window.innerWidth * 0.62, doorY = d * 58;

    const upper = `${S}%`;
    lt.style.clipPath = `polygon(0 0, 50% 0, 50% ${upper}, 0 ${upper})`;
    rt.style.clipPath = `polygon(50% 0, 100% 0, 100% ${upper}, 50% ${upper})`;
    lb.style.clipPath = `polygon(0 ${upper}, 50% ${upper}, 50% 100%, 0 100%)`;
    rb.style.clipPath = `polygon(50% ${upper}, 100% ${upper}, 100% 100%, 50% 100%)`;
    [lt, rt, lb, rb].forEach(el => { el.style.transformOrigin = `50% ${upper}`; });
    lt.style.transform = `translate3d(${-doorX}px, 0, 0) rotateY(${doorY}deg) rotate(${-a}deg)`;
    rt.style.transform = `translate3d(${doorX}px, 0, 0) rotateY(${-doorY}deg) rotate(${a}deg)`;
    lb.style.transform = `translate3d(${-doorX}px, 0, 0) rotateY(${doorY}deg)`;
    rb.style.transform = `translate3d(${doorX}px, 0, 0) rotateY(${-doorY}deg)`;
    const halves = 1 - seg(p, 0.62, 0.76);
    [lt, rt, lb, rb].forEach(el => { el.style.opacity = halves; });

    pull.style.top = upper;
    pull.style.opacity = 1 - seg(p, 0.46, 0.54);
    pull.setAttribute('aria-valuenow', Math.round(u * 100));
    zip.style.setProperty('--open', u.toFixed(3));
    cue.style.opacity = 1 - seg(p, 0, 0.04);
    hint.style.opacity = 1 - seg(p, 0, 0.03);

    // Camera: a slow push in while the doors open; the lining grows until it fills the screen.
    cam.style.transform = `scale(${1 + 0.16 * d})`;
    lining.style.transform = `scale(${1 + 9 * Math.pow(d, 2.2)})`;
    lining.style.opacity = 1 - seg(p, 0.8, 0.94);
    word.style.opacity = 1 - seg(p, 0.5, 0.68);
    word.style.transform = `translate(-50%, -54%) scale(${1 + 0.08 * d})`;

    // Act 3: the collection rises out of the lining, one jacket at a time.
    const h = out(seg(p, 0.66, 0.84));
    head.style.opacity = h; head.style.transform = `translate3d(0, ${(1 - h) * 24}px, 0)`;
    items.forEach((el, i) => {
      const k = out(seg(p, 0.68 + i * 0.025, 0.88 + i * 0.025));
      el.style.opacity = k;
      el.style.transform = `translate3d(0, ${(1 - k) * 70}px, 0)`;
    });
    const f = out(seg(p, 0.86, 0.98));
    all.style.opacity = f;
    zip.classList.toggle('zip-in', p > 0.8);      // the collection only takes clicks once it is there
  }

  /* One rAF loop: ease the drawn progress toward the scroll progress (14% per frame). */
  let cur = target(), raf = 0;
  const tick = () => {
    const t = target();
    cur += (t - cur) * (window.CX && CX.smooth ? 0.4 : 0.2);   // the motion engine already eases the scroll
    if (Math.abs(t - cur) < 0.0005) cur = t;
    render(cur);
    raf = cur === t ? 0 : requestAnimationFrame(tick);
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };
  addEventListener('scroll', wake, { passive: true });
  addEventListener('resize', () => { measure(); wake(); });
  addEventListener('load', () => { measure(); wake(); });
  measure();
  render(cur);

  /* Pull: drag it down (or use the keyboard). Dragging maps the pointer to a pull position and
     scrolls the page to match; letting go near the bottom finishes the entrance by itself. */
  const scrollToProgress = (p, smooth) => (window.CX
    ? CX.scrollTo(start + p * span, { immediate: !smooth })
    : window.scrollTo({ top: start + p * span, behavior: smooth ? 'smooth' : 'instant' }));
  const pFromPull = u => (1 - Math.cbrt(1 - clamp(u))) * UNZIP_END;   // inverse of out() for act 1
  let dragging = false;
  pull.addEventListener('pointerdown', e => {
    dragging = true;
    pull.setPointerCapture(e.pointerId);
    zip.classList.add('zip-drag');
    measure();
    e.preventDefault();
  });
  pull.addEventListener('pointermove', e => {
    if (!dragging) return;
    const r = jacket.getBoundingClientRect();
    const u = ((e.clientY - r.top) / r.height * 100 - TOP) / (BOTTOM - TOP);
    scrollToProgress(pFromPull(u), false);
  });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    zip.classList.remove('zip-drag');
    if (target() > UNZIP_END * 0.8) scrollToProgress(1, true);
  };
  pull.addEventListener('pointerup', release);
  pull.addEventListener('pointercancel', release);
  pull.addEventListener('keydown', e => {
    const p = target();
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { scrollToProgress(Math.min(1, p + 0.05), true); e.preventDefault(); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { scrollToProgress(Math.max(0, p - 0.05), true); e.preventDefault(); }
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'End') { scrollToProgress(1, true); e.preventDefault(); }
  });
})();
