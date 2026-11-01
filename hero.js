(function () {
  var hero = document.getElementById('vh');
  if (!hero) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TAU = Math.PI * 2;

  /* ---------- embers, mouse parallax, rotating word ---------- */
  var px = 0, py = 0;
  var box = document.getElementById('embers');
  if (box && !reduce) {
    var n = window.innerWidth < 768 ? 8 : 18;
    for (var i = 0; i < n; i++) {
      var e = document.createElement('span');
      e.className = 'ember';
      var s = 3 + Math.random() * 7;
      e.style.cssText = 'left:' + (Math.random() * 100) + '%;width:' + s + 'px;height:' + s + 'px;animation-duration:' + (9 + Math.random() * 10) + 's;animation-delay:-' + (Math.random() * 14) + 's;--dx:' + ((Math.random() * 120) - 60) + 'px';
      box.appendChild(e);
    }
  }
  if (!reduce && window.matchMedia('(pointer:fine)').matches) {
    hero.addEventListener('mousemove', function (ev) {
      var r = hero.getBoundingClientRect();
      px = (ev.clientX - r.left) / r.width * 2 - 1;
      py = (ev.clientY - r.top) / r.height * 2 - 1;
      hero.style.setProperty('--px', px.toFixed(3));
      hero.style.setProperty('--py', py.toFixed(3));
    });
  }
  var words = document.querySelectorAll('#words b'), w = 0;
  if (words.length && !reduce) setInterval(function () {
    words[w].classList.remove('on'); w = (w + 1) % words.length; words[w].classList.add('on');
  }, 2300);

  /* ---------- the swimming squid ---------- */
  var canvas = document.getElementById('vhCanvas');
  var anchor = hero.querySelector('.vh-squid');
  if (!canvas || !canvas.getContext || !anchor) return;

  var ctx = canvas.getContext('2d');
  var off = document.createElement('canvas');
  var octx = off.getContext('2d');
  var img = new Image();
  var alpha = parseFloat(hero.getAttribute('data-alpha') || '1');
  var nodesWanted = hero.getAttribute('data-nodes') !== 'off';
  var chips = Array.prototype.slice.call(hero.querySelectorAll('.sys'));

  var SLICES = window.innerWidth < 768 ? 60 : 96;
  var dpr = 1, W = 0, H = 0, sq = { x: 0, y: 0, w: 0, h: 0 }, margin = 0;
  var links = [];            // tendrils
  var running = false, visible = true, t0 = performance.now();

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(a, b, v) { v = clamp((v - a) / (b - a), 0, 1); return v * v * (3 - 2 * v); }
  function easeOut(v) { return 1 - Math.pow(1 - v, 3); }
  function pulseAt(t) { return Math.pow(Math.max(0, Math.sin(TAU * t / 4.6)), 3); }

  /* horizontal displacement (css px) for a body slice at depth u (0 = tip, 1 = tentacle ends) */
  function disp(u, t, s) {
    var b = smooth(0.5, 1, u);
    var amp = Math.pow(b, 1.35) * 52 * s * (1 - 0.35 * pulseAt(t));
    var d = amp * Math.sin(TAU * (0.42 * t - 1.5 * u)) + 0.35 * amp * Math.sin(TAU * (0.8 * t - 2.7 * u + 0.3));
    d += Math.sin(TAU * 0.14 * t - u * 1.2) * 7 * s * (1 - 0.25 * u);
    return d;
  }
  function widthScale(u, t) {
    var body = 1 - smooth(0.5, 0.62, u);
    var fin = smooth(0.26, 0.3, u) * (1 - smooth(0.5, 0.54, u));
    return 1 - 0.045 * pulseAt(t) * body + 0.03 * fin * Math.sin(TAU * (0.9 * t - 3 * u));
  }

  function measure() {
    var hr = hero.getBoundingClientRect();
    W = hr.width; H = hr.height;
    dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    var ar = anchor.getBoundingClientRect();
    sq.x = ar.left - hr.left; sq.y = ar.top - hr.top; sq.w = ar.width; sq.h = ar.height;
    margin = sq.w * 0.22;
    off.width = Math.round((sq.w + margin * 2) * dpr);
    off.height = Math.round(sq.h * dpr);

    links = [];
    var show = nodesWanted && window.innerWidth >= 1000 && chips.length;
    chips.forEach(function (c, i) {
      c.style.transform = '';
      if (!show) return;
      var r = c.getBoundingClientRect();
      var cx = r.left - hr.left + r.width / 2, cy = r.top - hr.top + r.height / 2;
      var left = cx < sq.x + sq.w / 2;
      var order = parseInt(c.getAttribute('data-i') || i, 10);
      links.push({
        el: c, cx: cx, cy: cy, hw: r.width / 2, left: left,
        rootX: left ? 0.34 + (order % 3) * 0.05 : 0.66 - (order % 3) * 0.05,
        rootU: 0.60 + (order % 3) * 0.03,
        delay: 0.9 + order * 0.5, seed: order * 1.7, linked: false
      });
    });
  }

  function drawSquid(t, s, pulse) {
    var dw = sq.w * dpr, dh = off.height / SLICES, mx = margin * dpr;
    var sw = img.naturalWidth, sh = img.naturalHeight, sliceH = sh / SLICES;
    octx.setTransform(1, 0, 0, 1, 0, 0);
    octx.globalCompositeOperation = 'source-over';
    octx.clearRect(0, 0, off.width, off.height);
    for (var i = 0; i < SLICES; i++) {
      var u = (i + 0.5) / SLICES;
      var sc = widthScale(u, t);
      var x = mx + (dw - dw * sc) / 2 + disp(u, t, s) * dpr;
      var sy = i * sliceH;
      octx.drawImage(img, 0, sy, sw, Math.min(sliceH + 1, sh - sy), x, i * dh, dw * sc, dh + 1);
    }
    var g = octx.createLinearGradient(0, 0, 0, off.height);
    g.addColorStop(0, '#FFD36B'); g.addColorStop(0.42, '#F2A93B'); g.addColorStop(0.78, '#E8782F'); g.addColorStop(1, '#D9462B');
    octx.globalCompositeOperation = 'source-in';
    octx.fillStyle = g; octx.fillRect(0, 0, off.width, off.height);
    // travelling light sweep
    var phase = (t % 7.5) / 7.5;
    if (phase < 0.6) {
      var bx = (-0.3 + phase / 0.6 * 1.6) * off.width, bw = off.width * 0.28;
      var sg = octx.createLinearGradient(bx - bw, 0, bx + bw, off.height * 0.35);
      sg.addColorStop(0, 'rgba(255,250,215,0)'); sg.addColorStop(0.5, 'rgba(255,250,215,0.85)'); sg.addColorStop(1, 'rgba(255,250,215,0)');
      octx.globalCompositeOperation = 'source-atop';
      octx.fillStyle = sg; octx.fillRect(0, 0, off.width, off.height);
    }
    octx.globalCompositeOperation = 'source-over';
  }

  function ribbon(pts, w0, w1, fill) {
    var L = [], R = [], k, p, q, nx, ny, len, wd;
    for (k = 0; k < pts.length; k++) {
      p = pts[Math.max(0, k - 1)]; q = pts[Math.min(pts.length - 1, k + 1)];
      nx = -(q.y - p.y); ny = q.x - p.x; len = Math.sqrt(nx * nx + ny * ny) || 1;
      wd = (w0 + (w1 - w0) * (k / (pts.length - 1))) / 2;
      L.push({ x: pts[k].x + nx / len * wd, y: pts[k].y + ny / len * wd });
      R.push({ x: pts[k].x - nx / len * wd, y: pts[k].y - ny / len * wd });
    }
    ctx.beginPath(); ctx.moveTo(L[0].x, L[0].y);
    for (k = 1; k < L.length; k++) ctx.lineTo(L[k].x, L[k].y);
    for (k = R.length - 1; k >= 0; k--) ctx.lineTo(R[k].x, R[k].y);
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
  }

  function drawLinks(t, s, gx, gy) {
    links.forEach(function (L, i) {
      var g = easeOut(clamp((t - L.delay) / 1.5, 0, 1));
      var bob = Math.sin(t * 0.9 + L.seed) * 5;
      L.el.style.transform = 'translateY(' + bob.toFixed(2) + 'px)';
      if (g <= 0) return;
      var u = L.rootU;
      var P0 = { x: sq.x + gx + L.rootX * sq.w + disp(u, t, s), y: sq.y + gy + u * sq.h };
      var P3 = { x: L.cx + (L.left ? L.hw - 6 : -L.hw + 6), y: L.cy + bob };
      var wx = Math.sin(t * 1.3 + L.seed) * 22 * s, wy = Math.cos(t * 1.1 + L.seed) * 16 * s;
      var P1 = { x: P0.x + (P3.x - P0.x) * 0.3 + wx, y: P0.y + 70 * s + wy };
      var P2 = { x: P3.x + (P0.x - P3.x) * 0.25 - wx * 0.6, y: P3.y + 90 * s - wy };
      var pts = [], K = 30, k, tt, m, a, b, c, d;
      for (k = 0; k <= K; k++) {
        tt = g * k / K; m = 1 - tt;
        a = m * m * m; b = 3 * m * m * tt; c = 3 * m * tt * tt; d = tt * tt * tt;
        pts.push({ x: a * P0.x + b * P1.x + c * P2.x + d * P3.x, y: a * P0.y + b * P1.y + c * P2.y + d * P3.y });
      }
      var wRoot = 15 * Math.max(0.7, s), wTip = 4.5 * Math.max(0.7, s);
      ribbon(pts, wRoot + 5, wTip + 4, 'rgba(70,6,14,0.55)');
      var gr = ctx.createLinearGradient(P0.x, P0.y, P3.x, P3.y);
      gr.addColorStop(0, '#FFE08A'); gr.addColorStop(1, '#F2A93B');
      ribbon(pts, wRoot, wTip, gr);
      if (g >= 1) {
        if (!L.linked) { L.linked = true; L.el.classList.add('linked'); }
        var pr = 0.5 + 0.5 * Math.sin(t * 2 + L.seed);
        ctx.beginPath(); ctx.arc(P3.x, P3.y, 9 + pr * 3, 0, TAU);
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,224,138,' + (0.55 + pr * 0.4) + ')'; ctx.stroke();
      }
    });
  }

  function frame(now) {
    if (!running) return;
    var t = (now - t0) / 1000;
    render(t);
    requestAnimationFrame(frame);
  }

  function render(t) {
    var s = sq.h / 1000;
    var pulse = pulseAt(t);
    var gx = Math.sin(t * 0.55) * 10 * s + px * 14;
    var gy = Math.sin(t * 0.4) * 16 * s - pulse * 22 * s + py * 10;
    drawSquid(t, s, pulse);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = alpha * (window.innerWidth < 768 ? 0.55 : 1);
    ctx.drawImage(off, sq.x - margin + gx, sq.y + gy, off.width / dpr, off.height / dpr);
    ctx.globalAlpha = 1;
    if (links.length) drawLinks(t, s, gx, gy);
  }

  function start() {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }

  function init() {
    hero.classList.add('has-canvas');
    t0 = performance.now();
    measure();
    if (reduce) {
      links.forEach(function (L) { L.delay = -5; });
      render(2.2);
      links.forEach(function (L) { L.el.classList.add('linked'); });
      return;
    }
    start();
  }

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { measure(); if (reduce) render(2.2); }, 150);
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (reduce) return;
      if (visible) start(); else running = false;
    }, { threshold: 0 }).observe(hero);
  }

  img.onload = init;
  img.src = hero.getAttribute('data-squid') || 'squid.png';
})();
