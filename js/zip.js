/* Unzip intro (homepage), drawn with WebGL.
   The Lakeshore Shell is a mesh of about 15,000 points. Scrolling, or dragging the zip pull, moves
   the pull down the zip, and only the fabric near the zip moves:
     - Above the pull the two edges part in a soft curve: closed at the pull, widest at the collar.
     - The sleeves and shoulders stay still; the fabric in between bunches up and darkens like a fold.
     - Each opened edge shows its facing (the inside of the front panel) and its zipper teeth.
     - Through the opening you see the quilted lining with the woven neck label.
   The camera follows the pull down the jacket. Once it is unzipped, the camera flies into the
   opening, the lining fills the screen and Collection 01 rises out of it.
   The scroll position is the only source of truth: dragging the pull just scrolls the page. */
(() => {
  const zip = document.querySelector('[data-zip]');
  if (!zip) return;
  const q = s => zip.querySelector(s);
  const pin = q('.zip-pin'), canvas = q('.zip-gl'), src = q('.zip-src'), pull = q('.zip-pull'), hint = q('.zip-hint');
  const cue = q('.zip-cue'), word = q('.zip-word'), head = q('.zi-head'), all = q('.zi-all'), items = [...zip.querySelectorAll('.zi-item')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches && !/[?&]motion=1/.test(location.search);
  const gl = !reduce && canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true });
  if (!gl) { zip.classList.add('zip-still'); return; }

  /* ---------- Geometry of the jacket (measured on the cut-out) ---------- */
  const AR = 931 / 1312;               // image width / height
  const SEAM = 0.5;                    // the zip runs down the middle
  const TOP = 0.13, BOTTOM = 0.92;     // where the zip starts and ends (share of the height)
  const UNZIP_END = 0.55;              // share of the scroll used to unzip
  const PULL_FROM = 0.24, PULL_TO = 0.8;    // the pull travels from 24% to 80% of the screen height

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const out = t => 1 - Math.pow(1 - t, 3);
  const inOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;
  const even = t => t * t * (3 - 2 * t);     // a steady pull: eases in and out, even in the middle

  /* ---------- Shaders ---------- */
  const GAP = `
    uniform float uS, uTop, uCapPx, uSlope, uBoxW, uBoxH;
    // Half the opening at height y, in texture units: zero at the pull, growing above it and
    // levelling off at uCapPx. Above the zip (the hood) nothing opens.
    float gapAt(float y) {
      float d = max(uS - y, 0.0) * uBoxH;
      float g = uCapPx * (1.0 - exp(-uSlope * d / max(uCapPx, 1.0)));
      return g / uBoxW * smoothstep(uTop - 0.05, uTop + 0.01, y);
    }`;
  const VS_JACKET = `
    attribute vec2 aUV; attribute float aSide;
    uniform vec4 uBox; uniform vec2 uRes; uniform float uW;
    varying vec2 vUV; varying float vDisp; varying float vFold;
    ${GAP}
    float fall(float u) { return 1.0 - smoothstep(0.0, uW, u); }
    void main() {
      float u = abs(aUV.x - 0.5);
      float g = gapAt(aUV.y);
      float f = fall(u);
      vec2 px = uBox.xy + vec2(aUV.x + aSide * g * f, aUV.y) * uBox.zw;
      gl_Position = vec4((px / uRes * 2.0 - 1.0) * vec2(1.0, -1.0), 0.0, 1.0);
      vUV = aUV; vDisp = g * f;
      vFold = g * (f - fall(u + 0.02)) / 0.02;      // how much the fabric bunches here
    }`;
  const FS_JACKET = `
    precision mediump float;
    uniform sampler2D uTex; uniform float uCapUV;
    varying vec2 vUV; varying float vDisp; varying float vFold;
    void main() {
      vec4 c = texture2D(uTex, vUV);
      float u = abs(vUV.x - 0.5);
      float open = clamp(vDisp / 0.01, 0.0, 1.0);
      // Facing: a narrow band along each opened edge shows the inside of the front panel.
      float facing = (1.0 - smoothstep(0.016, 0.034, u)) * open;
      c.rgb = mix(c.rgb, vec3(0.80, 0.83, 0.87) * c.a, facing * 0.9);
      // Zipper teeth on the very edge.
      float teeth = (1.0 - smoothstep(0.006, 0.012, u)) * open;
      float f = fract(vUV.y * 210.0);
      float stripe = smoothstep(0.35, 0.5, f) * (1.0 - smoothstep(0.75, 0.9, f));
      c.rgb = mix(c.rgb, mix(vec3(0.16, 0.18, 0.21), vec3(0.74, 0.77, 0.81), stripe) * c.a, teeth);
      // Fold: bunched fabric turns away from the light.
      c.rgb *= 1.0 - clamp(vFold / max(uCapUV, 0.001), 0.0, 1.0) * 0.32;
      gl_FragColor = c;
    }`;
  const VS_QUAD = `
    attribute vec2 aUV; uniform vec4 uBox; uniform vec2 uRes; varying vec2 vUV;
    void main() { vec2 px = uBox.xy + aUV * uBox.zw; gl_Position = vec4((px / uRes * 2.0 - 1.0) * vec2(1.0, -1.0), 0.0, 1.0); vUV = aUV; }`;
  const FS_LINING = `
    precision mediump float;
    uniform sampler2D uTex, uLabel; uniform vec4 uLabelRect;
    varying vec2 vUV;
    ${GAP}
    void main() {
      float a = texture2D(uTex, vUV).a;
      if (a < 0.01) { gl_FragColor = vec4(0.0); return; }
      vec2 p = vUV * vec2(uBoxW, uBoxH);
      float cell = uBoxW * 0.045;                                  // quilt diamonds scale with the jacket
      float q1 = abs(fract((p.x + p.y) / cell) - 0.5), q2 = abs(fract((p.x - p.y) / cell) - 0.5);
      float seam = 1.0 - smoothstep(0.46, 0.5, max(q1, q2));
      vec3 col = vec3(0.905, 0.92, 0.94) - seam * 0.07 + (0.5 - min(q1, q2)) * 0.05;
      // Depth: the lining is in shadow close to the edges of the opening.
      float e = gapAt(vUV.y) - abs(vUV.x - 0.5);
      col *= 1.0 - 0.5 * (1.0 - smoothstep(0.0, 0.045, e));
      vec2 lp = (vUV - uLabelRect.xy) / uLabelRect.zw;
      if (lp.x > 0.0 && lp.x < 1.0 && lp.y > 0.0 && lp.y < 1.0) col = texture2D(uLabel, lp).rgb;
      gl_FragColor = vec4(col * a, a);
    }`;
  function program(vs, fs) {
    const p = gl.createProgram();
    [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]].forEach(([t, s]) => {
      const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
      gl.attachShader(p, sh);
    });
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const loc = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(p, i).name; loc[name] = gl.getUniformLocation(p, name); }
    return { p, loc, aUV: gl.getAttribLocation(p, 'aUV'), aSide: gl.getAttribLocation(p, 'aSide') };
  }
  let jacketProg, liningProg;
  try { jacketProg = program(VS_JACKET, FS_JACKET); liningProg = program(VS_QUAD, FS_LINING); }
  catch (err) { console.warn('Unzip intro fell back:', err); zip.classList.add('zip-still'); return; }

  /* ---------- Mesh: two halves that meet at the seam, with more columns close to the zip ---------- */
  const COLS = 44, ROWS = 170;
  const verts = [], idx = [];
  [-1, 1].forEach(side => {
    const base = verts.length / 3;
    for (let r = 0; r <= ROWS; r++) {
      for (let c = 0; c <= COLS; c++) verts.push(SEAM + side * Math.pow(c / COLS, 1.35) * SEAM, r / ROWS, side);
    }
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const i = base + r * (COLS + 1) + c;
      idx.push(i, i + 1, i + COLS + 1, i + 1, i + COLS + 2, i + COLS + 1);
    }
  });
  const meshBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, meshBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  const idxBuf = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
  const quadBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);

  /* ---------- Textures: the jacket, and the woven neck label drawn on a 2D canvas ---------- */
  function texture(source) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]
      .forEach(([k, v]) => gl.texParameteri(gl.TEXTURE_2D, k, v));
    return t;
  }
  function labelCanvas() {
    const c = document.createElement('canvas'); c.width = 440; c.height = 140;
    const x = c.getContext('2d');
    x.fillStyle = '#2F3F53'; x.fillRect(0, 0, 440, 140);
    x.strokeStyle = 'rgba(255, 255, 255, .35)'; x.lineWidth = 2; x.strokeRect(10, 10, 420, 120);
    x.fillStyle = '#fff'; x.textAlign = 'center';
    x.font = '700 54px "Finlandica Headline", "Arial Narrow", Arial, sans-serif'; x.fillText('CHIACTIVE', 220, 72);
    x.font = '500 20px "Google Sans", Arial, sans-serif'; x.fillText('COLLECTION 01  ·  CHICAGO', 220, 108);
    return c;
  }
  let jacketTex = null, labelTex = null;
  const ready = () => {
    jacketTex = texture(src);
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { labelTex = texture(labelCanvas()); render(cur); });
    zip.classList.add('zip-gl-on');
    render(cur);
  };

  /* ---------- Layout and scroll geometry ---------- */
  let vw = 0, vh = 0, W0 = 0, H0 = 0;
  const size = () => {
    vw = pin.clientWidth; vh = pin.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
    H0 = vh * 1.32; W0 = H0 * AR;                                // big: the jacket is taller than the screen
    if (W0 > vw * 1.08) { W0 = vw * 1.08; H0 = W0 / AR; }       // phones: a touch wider than the screen
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  let start = 0, span = 1;
  const measure = () => {
    start = zip.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(pin).top) || 0);
    span = Math.max(1, zip.offsetHeight - pin.offsetHeight);
  };
  const target = () => clamp((scrollY - start) / span);

  function render(p) {
    if (!vw) return;
    const u = even(seg(p, 0, UNZIP_END));         // act 1: unzip
    const z = inOut(seg(p, 0.5, 0.8));            // act 2: fly into the opening
    const S = lerp(TOP, BOTTOM, u);
    // Camera, act 1: the jacket slides up so the pull stays in view.
    const pullY = lerp(PULL_FROM, PULL_TO, u) * vh;
    let bx = (vw - W0) / 2, by = pullY - S * H0, bw = W0, bh = H0;
    // Camera, act 2: zoom into the opening, which glides to the centre of the screen.
    if (z > 0) {
      const s = Math.exp(Math.log(7) * z), fy = 0.5;
      const sy = lerp(by + fy * H0, vh * 0.5, z);
      bw = W0 * s; bh = H0 * s; bx = vw / 2 - 0.5 * bw; by = sy - fy * bh;
    }
    const capPx = bw * (0.11 + 0.17 * z);         // the opening widens as we fly in
    const slope = 0.3 + 0.3 * z;
    const fallW = 0.34 + 0.12 * z;

    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    if (jacketTex) {
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      const use = prog => {
        gl.useProgram(prog.p);
        const L = prog.loc;
        gl.uniform4f(L.uBox, bx, by, bw, bh); gl.uniform2f(L.uRes, vw, vh);
        gl.uniform1f(L.uS, S); gl.uniform1f(L.uTop, TOP); gl.uniform1f(L.uCapPx, capPx); gl.uniform1f(L.uSlope, slope);
        gl.uniform1f(L.uBoxW, bw); gl.uniform1f(L.uBoxH, bh);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, jacketTex); gl.uniform1i(L.uTex, 0);
      };
      // 1. The lining, under everything.
      use(liningProg);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, labelTex || jacketTex); gl.uniform1i(liningProg.loc.uLabel, 1);
      gl.uniform4f(liningProg.loc.uLabelRect, labelTex ? 0.415 : -1, 0.135, 0.17, 0.054);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
      gl.enableVertexAttribArray(liningProg.aUV); gl.vertexAttribPointer(liningProg.aUV, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disableVertexAttribArray(liningProg.aUV);
      // 2. The jacket, unzipped.
      use(jacketProg);
      gl.uniform1f(jacketProg.loc.uW, fallW); gl.uniform1f(jacketProg.loc.uCapUV, capPx / bw);
      gl.bindBuffer(gl.ARRAY_BUFFER, meshBuf); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
      gl.enableVertexAttribArray(jacketProg.aUV); gl.vertexAttribPointer(jacketProg.aUV, 2, gl.FLOAT, false, 12, 0);
      gl.enableVertexAttribArray(jacketProg.aSide); gl.vertexAttribPointer(jacketProg.aSide, 1, gl.FLOAT, false, 12, 8);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
      gl.disableVertexAttribArray(jacketProg.aUV); gl.disableVertexAttribArray(jacketProg.aSide);
    }

    // DOM pieces around the canvas.
    pull.style.transform = `translate3d(${(vw / 2).toFixed(1)}px, ${pullY.toFixed(1)}px, 0)`;
    pull.style.opacity = 1 - seg(p, 0.5, 0.56);
    pull.setAttribute('aria-valuenow', Math.round(u * 100));
    hint.style.opacity = 1 - seg(p, 0, 0.03);
    cue.style.opacity = 1 - seg(p, 0, 0.04);
    canvas.style.opacity = 1 - seg(p, 0.8, 0.93);
    word.style.opacity = 1 - seg(p, 0.48, 0.64);
    word.style.transform = `translate(-50%, -54%) scale(${(1 + 0.08 * z).toFixed(4)})`;
    // Act 3: the collection rises out of the lining, one jacket at a time.
    const h = out(seg(p, 0.68, 0.86));
    head.style.opacity = h; head.style.transform = `translate3d(0, ${((1 - h) * 24).toFixed(1)}px, 0)`;
    items.forEach((el, i) => {
      const k = out(seg(p, 0.7 + i * 0.025, 0.9 + i * 0.02));
      el.style.opacity = k; el.style.transform = `translate3d(0, ${((1 - k) * 70).toFixed(1)}px, 0)`;
    });
    all.style.opacity = out(seg(p, 0.88, 0.99));
    zip.classList.toggle('zip-in', p > 0.82);
  }

  /* ---------- One rAF loop: ease the drawn progress toward the scroll progress ---------- */
  let cur = 0, raf = 0;
  const tick = () => {
    const t = target();
    cur += (t - cur) * (window.CX && CX.smooth ? 0.4 : 0.2);   // the motion engine already eases the scroll
    if (Math.abs(t - cur) < 0.0004) cur = t;
    render(cur);
    raf = cur === t ? 0 : requestAnimationFrame(tick);
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };
  addEventListener('scroll', wake, { passive: true });
  addEventListener('resize', () => { size(); measure(); render(cur); });
  addEventListener('load', () => { measure(); wake(); });
  size(); measure(); cur = target();
  if (src.complete && src.naturalWidth) ready(); else src.addEventListener('load', ready, { once: true });
  render(cur);

  /* ---------- The pull: drag it down (or use the keyboard) ---------- */
  const scrollToProgress = (p, smooth) => (window.CX
    ? CX.scrollTo(start + p * span, { immediate: !smooth })
    : window.scrollTo({ top: start + p * span, behavior: smooth ? 'smooth' : 'instant' }));
  const pFromPull = u => {                                               // inverse of even(), by bisection
    u = clamp(u); let a = 0, b = 1;
    for (let i = 0; i < 24; i++) { const m = (a + b) / 2; if (even(m) < u) a = m; else b = m; }
    return (a + b) / 2 * UNZIP_END;
  };
  let dragging = false;
  pull.addEventListener('pointerdown', e => {
    dragging = true; pull.setPointerCapture(e.pointerId); zip.classList.add('zip-drag'); measure(); e.preventDefault();
  });
  pull.addEventListener('pointermove', e => {
    if (!dragging) return;
    const r = pin.getBoundingClientRect();
    const u = ((e.clientY - r.top) / vh - PULL_FROM) / (PULL_TO - PULL_FROM);
    scrollToProgress(pFromPull(u), false);
  });
  const release = () => {
    if (!dragging) return;
    dragging = false; zip.classList.remove('zip-drag');
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
