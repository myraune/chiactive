/* The rail (homepage opening).
   Six jackets hang from a metal rail in front of the giant CHIACTIVE wordmark. The section is a tall
   scroll track with a pinned stage: scrolling pulls the rail sideways, and each jacket is a real
   pendulum. Its swing is a damped spring that leans away from the direction the rail moves, kicked
   by how fast you scroll, with a tiny breeze on top. Nothing but transforms and opacity changes per frame.

   Entrance: when the loading screen lifts (html.cx-ready) the jackets drop onto the rail one by one
   and swing to a stop. The jacket nearest the middle is the one in focus; the others step back. */
(() => {
  const CX = window.CX;
  const rack = document.querySelector('[data-rack]');
  if (!CX || !rack) return;
  const pin = rack.querySelector('[data-stage]');
  const track = rack.querySelector('.rk-track');
  const word = rack.querySelector('.rk-word');
  const count = rack.querySelector('[data-rk-n]');
  const els = [...rack.querySelectorAll('.rk-item')];
  const n = els.length;

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const items = els.map((el, i) => ({
    el, i,
    sway: el.querySelector('.rk-sway'),
    cap: el.querySelector('.rk-cap'),
    k: 0.030 + (i % 3) * 0.006,     // a stiffer or looser "string" per jacket, so they never swing in sync
    c: 0.068 + (i % 2) * 0.012,     // damping
    a: 0, w: 0,                     // angle (degrees) and angular velocity
    ph: i * 1.9,                    // breeze phase
  }));

  let pitch = 300, x = 0, last = performance.now(), kicked = false;
  const measure = () => { pitch = els[0].offsetWidth || 300; };
  measure();
  addEventListener('resize', measure);

  const kick = () => {            // the drop onto the rail sets every jacket swinging
    kicked = true;
    items.forEach(o => { o.a = (o.i % 2 ? 1 : -1) * (14 + o.i * 1.6); o.w = 0; });
  };

  CX.scene(rack, p => {
    const now = performance.now();
    const dt = clamp((now - last) / 16.667, 0.25, 2.5);        // frames since the last update (1 at 60 Hz)
    last = now;
    if (!kicked && document.documentElement.classList.contains('cx-ready')) kick();

    // The rail: rests for the first 5% and the last 5% of the scroll, moves in between.
    const pe = clamp((p - 0.05) / 0.9);
    const c = pe * (n - 1);                                    // which jacket is in the middle (0 .. n-1)
    const nx = -c * pitch;
    const v = (nx - x) / dt;                                   // rail speed, px per frame
    x = nx;
    track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
    word.style.transform = `translate(-50%, -50%) translate3d(${(-pe * 5).toFixed(2)}vw, 0, 0)`;

    const lean = clamp(v * 0.36, -11, 11);                     // jackets trail behind the rail
    for (const o of items) {
      const breeze = Math.sin(now * 0.0011 + o.ph) * 0.9 + Math.sin(now * 0.0023 + o.ph * 2) * 0.35;
      o.w += (o.k * (lean + breeze - o.a) - o.c * o.w) * dt;
      o.a += o.w * dt;
      o.sway.style.transform = `rotate(${o.a.toFixed(3)}deg)`;

      const d = o.i - c;                                       // 0 = in the middle
      const k = Math.min(1, Math.abs(d));
      o.el.style.transform = `scale(${(1 - 0.13 * k).toFixed(4)})`;
      o.el.style.opacity = (1 - 0.55 * k * k).toFixed(3);
      o.cap.style.opacity = clamp(1 - Math.abs(d) * 1.7).toFixed(3);
    }
    count.textContent = String(Math.round(c) + 1).padStart(2, '0');
  }, { always: true });

  // Hovering a jacket nudges it, so the rail answers the pointer too.
  items.forEach(o => o.el.addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse') o.w += clamp(e.movementX * 0.035, -1.2, 1.2);
  }));

  // Keyboard: focusing a jacket that is off to the side brings it to the middle.
  items.forEach(o => o.el.querySelector('a').addEventListener('focus', () => {
    const top = rack.getBoundingClientRect().top + scrollY;
    const span = rack.offsetHeight - pin.offsetHeight;
    CX.scrollTo(top + (0.05 + 0.9 * o.i / (n - 1)) * span);
  }));
})();
