/* ============================================================
   stArt — js/sky.js
   Canvas engines: 背景の星屑 / 生成アート署名（journey進行に連動して星がドリフト）
   公開API: window.SkyFX
   ============================================================ */
(function () {
  "use strict";

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SPECTRA = window.DATA.SPECTRA;

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function hexA(hex, a) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  /* ---------- background starfield ---------- */
  const bg = document.getElementById("bgfx");
  const bctx = bg.getContext("2d");
  let BW = 0, BH = 0, DPR = 1;
  let stars = [], shoots = [], bursts = [];
  let px = 0, py = 0, pxs = 0, pys = 0;
  let mrx = -9999, mry = -9999, msx = -9999, msy = -9999; // カーソル実座標（レンズ効果用）
  let driftT = 0, driftS = 0; // journey進行に応じた横ドリフト

  function bgResize() {
    DPR = clamp(devicePixelRatio || 1, 1, 2);
    BW = innerWidth; BH = innerHeight;
    bg.width = BW * DPR; bg.height = BH * DPR;
    bctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const n = clamp(Math.round(BW * BH / 11000), 60, 200);
    const rnd = mulberry32(20260729);
    stars = Array.from({ length: n }, () => ({
      x: rnd() * BW, y: rnd() * BH,
      z: .3 + rnd() * .7,
      r: .4 + rnd() * 1.5,
      tw: rnd() * Math.PI * 2, ts: .4 + rnd() * 1.6,
      c: SPECTRA[Math.floor(rnd() * SPECTRA.length)]
    }));
  }
  bgResize();
  addEventListener("resize", bgResize);
  addEventListener("start:journey-progress", e => { driftT = e.detail.progress * -60; });
  addEventListener("pointermove", e => {
    px = (e.clientX / BW - .5); py = (e.clientY / BH - .5);
    mrx = e.clientX; mry = e.clientY;
  }, { passive: true });
  addEventListener("pointerdown", e => {
    if (e.target.closest("button,a,.mcard,input")) return;
    spawnBurst(e.clientX, e.clientY, 10);
  }, { passive: true });

  function spawnBurst(x, y, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = .6 + Math.random() * 2.2;
      bursts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - .4, l: 1, c: Math.random() < .3 ? "#ffd98a" : "#eef1fb", r: .6 + Math.random() * 1.4 });
    }
    if (bursts.length > 260) bursts.splice(0, bursts.length - 260);
  }

  let lastShoot = 0;
  function bgFrame(t, dt) {
    bctx.clearRect(0, 0, BW, BH);
    pxs = lerp(pxs, px, .04); pys = lerp(pys, py, .04);
    driftS = lerp(driftS, driftT, .06);
    if (mrx > -9000) {
      if (msx < -9000) { msx = mrx; msy = mry; }
      else { msx = lerp(msx, mrx, .09); msy = lerp(msy, mry, .09); }
    }
    const sy = scrollY;
    for (const s of stars) {
      const tw = REDUCED ? .8 : (0.55 + 0.45 * Math.sin(s.tw + t * 0.001 * s.ts));
      const ox = -pxs * 26 * s.z + driftS * (0.35 + 0.65 * s.z), oy = -pys * 18 * s.z - (sy * 0.05 * s.z) % (BH + 40);
      let yy = s.y + oy; yy = ((yy % (BH + 40)) + (BH + 40)) % (BH + 40) - 20;
      let xx = s.x + ox; xx = ((xx % (BW + 40)) + (BW + 40)) % (BW + 40) - 20;
      // カーソル周りのレンズ効果：近くの星は押し退けられ、明るくまたたく
      let boost = 0;
      if (msx > -9000) {
        const ddx = xx - msx, ddy = yy - msy;
        const dd = Math.hypot(ddx, ddy);
        if (dd < 170 && dd > .5) {
          const f = 1 - dd / 170;
          const push = f * f * 30 * s.z;
          xx += ddx / dd * push; yy += ddy / dd * push;
          boost = f * .45;
        }
      }
      bctx.globalAlpha = Math.min(1, tw * (.35 + .65 * s.z) + boost);
      bctx.fillStyle = s.c;
      bctx.beginPath(); bctx.arc(xx, yy, s.r, 0, 7); bctx.fill();
      if (s.r > 1.4) { bctx.globalAlpha = tw * .14; bctx.beginPath(); bctx.arc(xx, yy, s.r * 3.4, 0, 7); bctx.fill(); }
    }
    bctx.globalAlpha = 1;
    if (!REDUCED && t - lastShoot > 6000 + Math.random() * 9000 && document.visibilityState === "visible") {
      lastShoot = t;
      const fromTop = Math.random() < .7;
      shoots.push({
        x: Math.random() * BW * .9 + BW * .05, y: fromTop ? -20 : Math.random() * BH * .3,
        vx: -(2.4 + Math.random() * 3.4), vy: (1.4 + Math.random() * 2), l: 1
      });
    }
    for (const s of shoots) {
      s.x += s.vx * dt * .06; s.y += s.vy * dt * .06; s.l -= dt * .0006;
      const tail = 22;
      const g = bctx.createLinearGradient(s.x, s.y, s.x - s.vx * tail, s.y - s.vy * tail);
      g.addColorStop(0, "rgba(255,255,255," + (.85 * s.l) + ")");
      g.addColorStop(1, "rgba(160,190,255,0)");
      bctx.strokeStyle = g; bctx.lineWidth = 1.4; bctx.lineCap = "round";
      bctx.beginPath(); bctx.moveTo(s.x, s.y); bctx.lineTo(s.x - s.vx * tail, s.y - s.vy * tail); bctx.stroke();
    }
    shoots = shoots.filter(s => s.l > 0 && s.x > -60 && s.y < BH + 60);
    for (const b of bursts) {
      b.x += b.vx; b.y += b.vy; b.vy += .015; b.l -= .016;
      bctx.globalAlpha = Math.max(b.l, 0);
      bctx.fillStyle = b.c;
      bctx.beginPath(); bctx.arc(b.x, b.y, b.r * b.l + .2, 0, 7); bctx.fill();
    }
    bctx.globalAlpha = 1;
    bursts = bursts.filter(b => b.l > 0);
  }

  /* ---------- generative signatures ---------- */
  function drawSignature(ctx, w, ww, hh, t) {
    const rnd = mulberry32(w.id * 1013 + 5);
    const col = w.col;
    ctx.clearRect(0, 0, ww, hh);
    const cx = ww / 2, cy = hh / 2;
    const mode = w.id % 5;
    ctx.save();
    if (mode === 0) {
      const rings = 3 + Math.floor(rnd() * 3);
      for (let i = 0; i < rings; i++) {
        const rx = (ww * .09) + (i + 1) * (ww * .055), ry = rx * (.32 + rnd() * .2);
        const rot = rnd() * Math.PI, sp = (.00012 + rnd() * .0002) * (i % 2 ? 1 : -1);
        ctx.strokeStyle = hexA(col, .16 + .08 * i);
        ctx.lineWidth = .8;
        ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, rot, 0, 7); ctx.stroke();
        const a = t * sp * 1000 + i * 2.1;
        const pxx = cx + Math.cos(a) * rx * Math.cos(rot) - Math.sin(a) * ry * Math.sin(rot);
        const pyy = cy + Math.cos(a) * rx * Math.sin(rot) + Math.sin(a) * ry * Math.cos(rot);
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(pxx, pyy, 2.2, 0, 7); ctx.fill();
        ctx.fillStyle = hexA(col, .25); ctx.beginPath(); ctx.arc(pxx, pyy, 6, 0, 7); ctx.fill();
      }
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, 7); ctx.fill();
    } else if (mode === 1) {
      const A = 2 + Math.floor(rnd() * 3), B = 3 + Math.floor(rnd() * 3), N = 64;
      for (let i = 0; i < N; i++) {
        const p = i / N * Math.PI * 2, ph = t * .0004;
        const x = cx + Math.sin(p * A + ph) * ww * .34, y = cy + Math.sin(p * B) * hh * .34;
        ctx.fillStyle = hexA(col, .25 + .6 * (i / N));
        ctx.beginPath(); ctx.arc(x, y, 1.5 + (i % 5 === 0 ? 1.4 : 0), 0, 7); ctx.fill();
      }
    } else if (mode === 2) {
      const M = 26;
      for (let i = 0; i < M; i++) {
        const a = (i / M) * Math.PI * 2 + Math.sin(t * .0003 + i) * .14;
        const L = (hh * .16) + rnd() * hh * .3 * (0.75 + 0.25 * Math.sin(t * .0009 + i * 1.7));
        const g = ctx.createLinearGradient(cx, cy, cx + Math.cos(a) * L, cy + Math.sin(a) * L);
        g.addColorStop(0, hexA(col, .5)); g.addColorStop(1, hexA(col, 0));
        ctx.strokeStyle = g; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 6, cy + Math.sin(a) * 6);
        ctx.lineTo(cx + Math.cos(a) * L, cy + Math.sin(a) * L); ctx.stroke();
      }
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(cx, cy, 2.6, 0, 7); ctx.fill();
    } else if (mode === 3) {
      for (let i = 0; i < 4; i++) {
        const p = ((t * .00022) + (i / 4)) % 1;
        ctx.strokeStyle = hexA(col, (1 - p) * .4);
        ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.arc(cx, cy, 4 + p * Math.min(ww, hh) * .52, 0, 7); ctx.stroke();
      }
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, 7); ctx.fill();
    } else {
      const N = 12; const pts = [];
      let x = ww * .16, y = hh * .5;
      for (let i = 0; i < N; i++) {
        pts.push([x, y]);
        x += ww * .07 + rnd() * ww * .045;
        y = clamp(y + (rnd() - .5) * hh * .55, hh * .12, hh * .88);
      }
      ctx.strokeStyle = hexA(col, .3); ctx.lineWidth = .9;
      ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
      pts.forEach((p, i) => {
        const tw = .5 + .5 * Math.sin(t * .002 + i * 1.4);
        ctx.fillStyle = hexA(i % 3 ? col : "#ffffff", .35 + .65 * tw);
        ctx.beginPath(); ctx.arc(p[0], p[1], i % 4 === 0 ? 2.6 : 1.6, 0, 7); ctx.fill();
      });
    }
    ctx.restore();
  }

  /* ---------- main loop ---------- */
  let lastT = 0;
  function frame(t) {
    const dt = Math.min(t - lastT, 50); lastT = t;
    if (document.visibilityState === "visible") bgFrame(t, dt);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  window.SkyFX = {
    DPR: () => DPR,
    spawnBurst,
    drawSignature,
  };
})();
