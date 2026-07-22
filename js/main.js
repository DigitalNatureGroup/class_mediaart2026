/* ============================================================
   stArt — js/main.js
   preloader / Lenis smooth scroll / GSAP ScrollTrigger 演出
   ticker / modal / filters / cursor / menu
   ============================================================ */
(function () {
  "use strict";

  const { W, CLUSTERS, CATS } = window.DATA;
  const FX = window.SkyFX;
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const HAS = !!(window.gsap && window.ScrollTrigger && window.Lenis) && !REDUCED;

  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ============================================================
     Lenis smooth scroll
     ============================================================ */
  let lenis = null;
  if (HAS) {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop(); // ロード中はスクロールしない
  }
  function scrollLock(on) {
    if (lenis) { on ? lenis.stop() : lenis.start(); }
    document.body.style.overflow = on ? "hidden" : "";
  }
  function scrollToEl(target, extra) {
    // 常に絶対Y座標に解決してから渡す（Lenis内部状態とのズレに強い）
    let y;
    if (typeof target === "number") y = target + (extra || 0);
    else {
      const el = typeof target === "string" ? $(target) : target;
      if (!el) return;
      y = el.getBoundingClientRect().top + window.scrollY + (extra || 0);
    }
    y = Math.max(0, y);
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else scrollTo({ top: y, behavior: REDUCED ? "auto" : "smooth" });
  }

  /* ============================================================
     char split helper
     ============================================================ */
  function splitChars(el) {
    if (el.dataset.splitDone) return el.querySelectorAll(".ch");
    el.dataset.splitDone = "1";
    const frag = document.createDocumentFragment();
    Array.from(el.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        for (const ch of node.textContent) {
          if (ch === "\n") continue;
          const w = document.createElement("span");
          w.style.cssText = "display:inline-block;overflow:hidden;vertical-align:bottom;";
          const c = document.createElement("span");
          c.className = "ch";
          c.textContent = ch === " " ? "\u00A0" : ch;
          w.appendChild(c);
          frag.appendChild(w);
        }
      } else {
        frag.appendChild(node.cloneNode(true)); // <br> などの要素はそのまま残す
      }
    });
    el.textContent = "";
    el.appendChild(frag);
    return el.querySelectorAll(".ch");
  }

  /* ============================================================
     preloader
     ============================================================ */
  const loader = $("#loader");
  let arrived = false;

  function heroIntro(fast) {
    if (arrived) return;
    arrived = true;
    document.body.classList.add("arrived");
    scrollLock(false);
    if (HAS && !fast) {
      gsap.timeline()
        .from(".h-tag", { y: 14, autoAlpha: 0, duration: .9, ease: "power3.out" }, .1)
        .from(".h-logo", { scale: .93, autoAlpha: 0, filter: "blur(12px)", duration: 1.4, ease: "power3.out" }, .25)
        .from(".h-jp", { y: 12, autoAlpha: 0, duration: .9, ease: "power3.out" }, .7)
        .from(".h-meta > *", { y: 16, autoAlpha: 0, duration: .9, stagger: .09, ease: "power3.out" }, .9)
        .from(".scrollcue, .h-credit", { autoAlpha: 0, duration: 1 }, 1.5);
      FX.spawnBurst(innerWidth / 2, innerHeight * .42, 14);
    }
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  function runLoader() {
    if (!loader) { heroIntro(true); return; }
    if (REDUCED || !HAS) { loader.remove(); heroIntro(true); return; }

    scrollLock(true); // オープニング中はスクロール不可（中断されない）
    let skipped = false;
    const numEl = $("#loader .ld-num b");
    const state = { v: 0, target: 0 };
    let done = 0;

    // --- 実アセットの読込を追跡 ---
    const jobs = [];
    const track = p => jobs.push(p.catch(() => {}).then(() => {
      done++;
      state.target = Math.round(done / jobs.length * 100);
    }));
    const withTimeout = (p, ms) => Promise.race([p, new Promise(r => setTimeout(r, ms))]);

    const vid = $("#bgVideo");
    track(withTimeout(new Promise(r => {
      if (!vid || vid.readyState >= 3) return r();
      vid.addEventListener("canplaythrough", r, { once: true });
      vid.addEventListener("error", r, { once: true });
    }), 4000));
    ["#heroLogo img", ".kv-rot img", ".cheki img", ".flip s img"].forEach(sel => {
      const im = $(sel);
      track(im && im.decode ? withTimeout(im.decode(), 3000) : Promise.resolve());
    });
    track(withTimeout(document.fonts ? document.fonts.ready : Promise.resolve(), 2500));

    // --- カウンタ描画 ---
    const cntTick = gsap.ticker.add(() => {
      state.v = lerp(state.v, state.target, .08);
      if (numEl) numEl.textContent = String(Math.round(state.v)).padStart(3, "0");
      gsap.set("#loader .ld-line", { scaleX: state.v / 100 });
    });

    const minWait = new Promise(r => setTimeout(r, 1500));

    function outro() {
      if (skipped) return;
      state.target = 100;
      const tl = gsap.timeline({ onComplete: finish });
      loader._tl = tl;
      tl.to(state, { v: 100, duration: .5, ease: "power2.out" }, 0)
        .to("#loader .ld-num, #loader .ld-label", { yPercent: 30, autoAlpha: 0, duration: .7, ease: "power3.in" }, .35)
        .to("#loader .ld-tag", { autoAlpha: 0, y: -16, duration: .8, ease: "power2.inOut" }, .4);
      // ステートメント2行：クロスフェード（前の行がふわっと昇って消えながら、次の行が重なって現れる）
      $$("#loader .ld-stage").forEach((st, i) => {
        const chars = [];
        st.querySelectorAll("p").forEach(p => { splitChars(p).forEach(c => chars.push(c)); });
        tl.fromTo(st, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .9, ease: "power2.out" }, i ? "-=.55" : "+=0")
          .from(chars, { autoAlpha: 0, yPercent: 36, duration: 1.0, stagger: .026, ease: "power3.out" }, "<.05")
          .to(st, { autoAlpha: 0, y: -30, duration: .9, ease: "power2.inOut" }, "+=1.05");
      });
      tl.to(loader, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "power4.inOut" }, "-=.15")
        .add(() => heroIntro(false), "-=.75");
    }

    function finish() {
      gsap.ticker.remove(cntTick);
      loader.remove();
    }
    function skip() {
      if (skipped || arrived) return;
      skipped = true;
      if (loader._tl) loader._tl.kill();
      gsap.killTweensOf(loader);
      gsap.ticker.remove(cntTick);
      loader.remove();
      heroIntro(true);
      document.body.classList.add("arrived");
    }
    // スキップは右上の SKIP ボタンのみ（スクロールでは中断しない）
    $("#opSkip").addEventListener("click", skip);

    Promise.all([Promise.all(jobs), minWait]).then(outro);
    gsap.set(loader, { clipPath: "inset(0 0 0% 0)" });
  }

  /* ============================================================
     background video
     ============================================================ */
  (function () {
    const v = $("#bgVideo");
    if (!v) return;
    v.playbackRate = .85;
    if (REDUCED) { v.pause(); return; }
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    document.addEventListener("visibilitychange", () => {
      document.hidden ? v.pause() : tryPlay();
    });
    // 初回タップでの解禁（自動再生がブロックされた場合の保険）
    addEventListener("pointerdown", tryPlay, { once: true, passive: true });
  })();

  /* ============================================================
     scroll-driven 演出 (GSAP ScrollTrigger)
     ============================================================ */
  function initScrollFX() {
    if (!HAS) return;

    // 進捗ヘアライン
    ScrollTrigger.create({
      start: 0, end: () => ScrollTrigger.maxScroll(window),
      onUpdate: self => gsap.set("#pbar", { scaleX: self.progress })
    });

    // ヒーロー：スクロールで文字が沈み、写真がわずかに寄る（通常の縦スクロール演出）
    gsap.to(".hero-in", {
      yPercent: -14, autoAlpha: .05, ease: "none",
      scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom 30%", scrub: true }
    });
    gsap.fromTo(".kv", { scale: 1 }, {
      scale: 1.08, ease: "none",
      scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true }
    });

    // 見出し（文字分割リビール／.tline があれば行単位で分割）
    $$("h2.ttl").forEach(el => {
      const lines = el.querySelectorAll(".tline");
      const chars = [];
      (lines.length ? Array.from(lines) : [el]).forEach(t => splitChars(t).forEach(c => chars.push(c)));
      gsap.from(chars, {
        yPercent: 115, duration: .9, stagger: .03, ease: "power4.out",
        scrollTrigger: { trigger: el, start: "top 82%", once: true }
      });
    });
    $$(".eyebrow, .ttl-en").forEach(el => {
      gsap.from(el, {
        y: 16, autoAlpha: 0, duration: .8, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 86%", once: true }
      });
    });

    // 巨大インデックス番号のパララックス
    $$(".bigidx").forEach(el => {
      gsap.fromTo(el, { yPercent: 26 }, {
        yPercent: -26, ease: "none",
        scrollTrigger: { trigger: el.closest("section"), start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    // 数式
    gsap.from(".eq", {
      scale: .92, autoAlpha: 0, duration: 1.1, ease: "power3.out",
      scrollTrigger: { trigger: ".eq", start: "top 80%", once: true }
    });

    // ステートメント（段落ごとに行マスク）
    $$(".stmt p").forEach(p => {
      gsap.from(p.querySelectorAll(".ln span"), {
        yPercent: 118, duration: 1.05, stagger: .09, ease: "power4.out",
        scrollTrigger: { trigger: p, start: "top 84%", once: true }
      });
    });

    // チェキと指導教員
    gsap.from(".cheki", {
      rotate: -9, y: 60, autoAlpha: 0, duration: 1.2, ease: "power3.out",
      scrollTrigger: { trigger: "#supervisor", start: "top 70%", once: true }
    });
    gsap.from(".sv-label, .sv-role, .sv-name, .sv-romaji, .sv-title", {
      y: 26, autoAlpha: 0, duration: .9, stagger: .1, ease: "power3.out",
      scrollTrigger: { trigger: ".sv-grid", start: "top 72%", once: true }
    });


    // works コントロール
    gsap.from(".w-controls, .w-hint", {
      y: 18, autoAlpha: 0, duration: .8, stagger: .12, ease: "power3.out",
      scrollTrigger: { trigger: "#works", start: "top 76%", once: true }
    });

    // visit 行
    $$(".v-row, .v-map").forEach((el, i) => {
      gsap.from(el, {
        y: 28, autoAlpha: 0, duration: .85, delay: (i % 6) * .05, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });

    // フッターの巨大ロゴ
    gsap.fromTo("footer .flogo", { scale: .86, y: 70, autoAlpha: .25 }, {
      scale: 1, y: 0, autoAlpha: 1, ease: "none",
      scrollTrigger: { trigger: "footer", start: "top 96%", end: "bottom bottom", scrub: true }
    });

  }

  /* ============================================================
     marquee tickers（スクロール速度に反応）
     ============================================================ */
  const tickerTweens = [];
  function buildTicker(el, unitHTML, dur, dir) {
    const trk = el.querySelector(".trk");
    trk.innerHTML = "";
    const half = document.createElement("div");
    half.style.display = "inline-flex";
    half.innerHTML = unitHTML.repeat(3);
    trk.appendChild(half);
    trk.appendChild(half.cloneNode(true));
    if (HAS) {
      const tw = gsap.to(trk, { xPercent: dir * -50, ease: "none", duration: dur, repeat: -1 });
      tickerTweens.push({ tw, dir });
    }
  }
  function initTickers() {
    const mainUnit =
      '<span class="unit"><em>stArt</em><span class="s">✦</span>MEDIA ART EXHIBITION 2026' +
      '<span class="s">✦</span>7.29 WED — 7.31 FRI<span class="s">✦</span>9:00–18:00' +
      '<span class="s">✦</span>KASUGA AREA, UNIV. OF TSUKUBA<span class="s">✦</span>FREE ADMISSION<span class="s">✦</span></span>';
    buildTicker($("#tickerHero"), mainUnit, 26, 1);

    if (HAS && lenis) {
      let cur = 1;
      lenis.on("scroll", e => {
        const v = clamp(1 + Math.abs(e.velocity) * .12, 1, 3.4) * (e.velocity < 0 ? -1 : 1);
        cur = lerp(cur, v, .2);
        tickerTweens.forEach(({ tw }) => tw.timeScale(cur));
      });
    }
  }

  /* ============================================================
     equation flip (A ↔ 星PNG)
     ============================================================ */
  const eqFlip = $(".eq .flip");
  if (eqFlip && !REDUCED) setInterval(() => eqFlip.classList.toggle("go"), 3000);

  // 「A」のグリフのベースラインを、ロゴ画像の文字ベースライン(=flip下端)に正確に合わせる。
  // フォントメトリクスは環境依存なので、非表示クローンで実測して補正する。
  function alignEqA() {
    const flip = $(".eq .flip"), b = flip && flip.querySelector("b");
    if (!b) return;
    const clone = b.cloneNode(true);
    clone.style.cssText = "position:absolute;inset:0;visibility:hidden;transform:none;transition:none;";
    const probe = document.createElement("i");
    probe.style.cssText = "display:inline-block;width:0;height:0;";
    clone.appendChild(probe);
    flip.appendChild(clone);
    const d = clone.getBoundingClientRect().bottom - probe.getBoundingClientRect().top;
    clone.remove();
    if (isFinite(d)) b.style.bottom = (-d) + "px"; // ボックスをズラしてグリフの底=ベースラインに
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignEqA);
  alignEqA();
  addEventListener("resize", alignEqA);

  /* ============================================================
     star journey：縦スクロール→星座の横断＋セクションの左右スライド
     ============================================================ */
  const STOPS = ["hero", "concept", "supervisor", "works", "visit"]
    .map(id => document.getElementById(id));
  const JPX = [0, 14, -11, 13, -8];   // 各セクションのカメラ位置X(vw)
  const JPY = [28, 68, 36, 66, 30];   // 星座トラック上の各星のY(vh)
  const JSEG = 54, JFY = 26;          // 星の間隔(vw)とフォーカスY(vh)
  const jTrack = $("#jyTrack");
  const jStars = $$(".jy-star");
  const smoothStep = v => v * v * (3 - 2 * v);
  let jActive = -1, jFrame = null;

  function journeyProgress() {
    const vc = scrollY + innerHeight / 2;
    const cs = STOPS.map(el => el.offsetTop + el.offsetHeight / 2);
    if (vc <= cs[0]) return 0;
    const L = cs.length - 1;
    if (vc >= cs[L]) return L;
    for (let i = 0; i < L; i++) {
      if (vc <= cs[i + 1]) {
        return i + smoothStep(clamp((vc - cs[i]) / Math.max(cs[i + 1] - cs[i], 1), 0, 1));
      }
    }
    return L;
  }

  function journeyUpdate() {
    jFrame = null;
    const p = journeyProgress();
    const i0 = Math.floor(p), i1 = Math.min(i0 + 1, STOPS.length - 1), lp = p - i0;
    const camX = lerp(JPX[i0], JPX[i1], lp);
    const camY = lerp(JPY[i0], JPY[i1], lp);
    const closest = Math.round(p);
    const mob = innerWidth < 768 ? 0.24 : 1;
    if (!REDUCED) STOPS.forEach((el, i) => {
      el.style.setProperty("--jpx", (clamp(JPX[i] - camX, -32, 32) * mob) + "vw");
      el.style.setProperty("--jps", String(1 - Math.min(Math.abs(i - p), 1) * .015));
    });
    if (jTrack) {
      jTrack.style.setProperty("--jtx", (p * -JSEG) + "vw");
      jTrack.style.setProperty("--jty", (JFY - camY) + "vh");
    }
    jStars.forEach((s, i) => { s.dataset.active = String(i === closest); });
    if (closest !== jActive) {
      jActive = closest;
      $$("nav.gnav a").forEach(a => a.classList.toggle("act", a.dataset.spy === STOPS[closest].id));
      window.dispatchEvent(new CustomEvent("start:journey-change", { detail: { index: closest } }));
    }
    window.dispatchEvent(new CustomEvent("start:journey-progress", { detail: { progress: p } }));
  }
  function journeyRequest() { if (jFrame === null) jFrame = requestAnimationFrame(journeyUpdate); }

  function initJourney() {
    if (!jTrack) return;
    journeyUpdate();
    addEventListener("scroll", journeyRequest, { passive: true });
    addEventListener("resize", journeyRequest);
    addEventListener("start:journey-force", journeyUpdate); // 同期更新用（検証・保険）
    if (lenis) lenis.on("scroll", journeyRequest);

    // スナップ補助：スクロールが静止したら、近くのセクション頭へそっと吸着
    if (lenis && !REDUCED) {
      let snapT = null, snapping = false;
      lenis.on("scroll", e => {
        if (snapping) return;
        if (Math.abs(e.velocity) > .2) { if (snapT) { clearTimeout(snapT); snapT = null; } return; }
        if (snapT) return;
        snapT = setTimeout(() => {
          snapT = null;
          let best = null, bd = 1e9;
          STOPS.forEach(el => {
            const d = Math.abs(scrollY - el.offsetTop);
            if (d < bd) { bd = d; best = el.offsetTop; }
          });
          if (best !== null && bd > 3 && bd < innerHeight * .3) {
            snapping = true;
            lenis.scrollTo(best, { duration: .9, onComplete: () => { snapping = false; } });
            setTimeout(() => { snapping = false; }, 1400);
          }
        }, 260);
      });
    }
  }

  /* ============================================================
     works marquee：作品がめぐる回廊（2列・逆方向・無限ループ）
     ============================================================ */
  function makeCard(w, dup) {
    const el = document.createElement(dup ? "div" : "button");
    el.className = "card";
    if (!dup) {
      el.type = "button";
      el.addEventListener("click", () => openModal(w.id));
    }
    el.innerHTML = `
      <span class="thumb"><canvas data-wid="${w.id}" width="10" height="10"></canvas>
        <span class="no">No.${w.no}</span><span class="rm">${w.m}</span></span>
      <span class="body">
        <span class="t">${w.t}</span>
        <span class="e">${w.e}</span>
        <span class="meta"><i class="st" style="color:${w.col};background:${w.col}"></i>${w.a}<span class="cat">${CATS[w.c]}</span></span>
      </span>`;
    return el;
  }

  function buildMarquee() {
    const rowsEl = $("#mqRows");
    if (!rowsEl) return;
    rowsEl.innerHTML = "";
    const rows = [W.filter((_, i) => i % 2 === 0), W.filter((_, i) => i % 2 === 1)];
    rows.forEach((list, ri) => {
      const row = document.createElement("div");
      row.className = "mq-row";
      row.dataset.direction = ri % 2 ? "reverse" : "forward";
      const trk = document.createElement("div");
      trk.className = "mq-trk";
      [false, true].forEach(dup => {
        const grp = document.createElement(dup ? "div" : "ol");
        grp.className = "mq-grp";
        if (dup) { grp.setAttribute("aria-hidden", "true"); grp.inert = true; }
        list.forEach(w => {
          const item = document.createElement(dup ? "div" : "li");
          item.className = "mq-item";
          item.appendChild(makeCard(w, dup));
          grp.appendChild(item);
        });
        trk.appendChild(grp);
      });
      row.appendChild(trk);
      rowsEl.appendChild(row);
    });
    // 生成アートのサムネイルを一度だけ描画
    requestAnimationFrame(() => {
      $$("#mqRows canvas").forEach(cv => {
        const w = W[+cv.dataset.wid - 1];
        const r = cv.getBoundingClientRect();
        const wd = Math.max(r.width, 240), hg = Math.max(r.height, 140);
        const dpr = FX.DPR();
        cv.width = wd * dpr; cv.height = hg * dpr;
        const c = cv.getContext("2d");
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        FX.drawSignature(c, w, wd, hg, 5200 + w.id * 777);
      });
    });
  }

  const mqToggle = $("#mqToggle");
  if (mqToggle) mqToggle.addEventListener("click", () => {
    const mq = $("#mq");
    const paused = mq.dataset.paused === "true";
    mq.dataset.paused = String(!paused);
    mqToggle.setAttribute("aria-pressed", String(!paused));
    mqToggle.querySelector("span").textContent = paused ? "自動移動を停止" : "自動移動を再生";
  });

  /* ============================================================
     modal
     ============================================================ */
  const modal = $("#modal"), sig = $("#sigCanvas");
  let curId = 0, sigRAF = 0, lastFocus = null;
  const filtered = () => W;

  function openModal(id) {
    const w = W.find(x => x.id === id); if (!w) return;
    curId = id;
    $("#mNo").textContent = "WORK No." + w.no;
    $("#mChips").innerHTML =
      `<span class="c-star"><i style="color:${w.col};background:${w.col}"></i>SPECTRAL ${["B", "A", "O", "F", "G", "K"][w.s] || "A"}型</span>` +
      `<span>${CATS[w.c]}</span><span>${w.m} 展示室</span>`;
    $("#mTitle").textContent = w.t;
    $("#mEn").textContent = w.e;
    $("#mArtist").textContent = w.a;
    $("#mDept").textContent = w.g;
    $("#mDesc").textContent = w.d;
    modal.classList.add("open");
    scrollLock(true);
    lastFocus = document.activeElement;
    $("#mClose").focus({ preventScroll: true });
    cancelAnimationFrame(sigRAF);
    const r = sig.parentElement.getBoundingClientRect();
    const dpr = FX.DPR();
    sig.width = r.width * dpr; sig.height = r.height * dpr;
    const c = sig.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const loop = t => { FX.drawSignature(c, w, r.width, r.height, t); if (!REDUCED) sigRAF = requestAnimationFrame(loop); };
    sigRAF = requestAnimationFrame(loop);
  }
  function closeModal() {
    modal.classList.remove("open");
    scrollLock(false);
    cancelAnimationFrame(sigRAF);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  modal.addEventListener("click", e => { if (e.target.hasAttribute("data-close")) closeModal(); });
  function step(d) {
    const list = filtered();
    const i = list.findIndex(w => w.id === curId);
    const nx = list[(i + d + list.length) % list.length];
    openModal(nx.id);
  }
  $("#mPrev").addEventListener("click", () => step(-1));
  $("#mNext").addEventListener("click", () => step(1));
  addEventListener("keydown", e => {
    if (!modal.classList.contains("open")) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  /* ============================================================
     header / menu / anchors
     ============================================================ */
  const hd = $("#hd");
  function onScrollHead() { hd.classList.toggle("scrolled", scrollY > 40); }
  if (lenis) lenis.on("scroll", onScrollHead);
  addEventListener("scroll", onScrollHead, { passive: true });

  $("#menuBtn").addEventListener("click", () => document.body.classList.toggle("menuOpen"));
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      e.preventDefault();
      document.body.classList.remove("menuOpen");
      scrollToEl(id, -62);
    });
  });
  $("#toTop").addEventListener("click", () => scrollToEl(0));

  /* ============================================================
     cheki tilt / magnetic / cursor
     ============================================================ */
  const cheki = $("#cheki"), tilt = cheki.querySelector(".tilt");
  if (FINE) {
    cheki.addEventListener("pointermove", e => {
      const r = cheki.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
      tilt.style.transform = `rotateY(${dx * 14}deg) rotateX(${-dy * 12}deg)`;
    });
    cheki.addEventListener("pointerleave", () => { tilt.style.transform = ""; });

    // magnetic
    $$(".mapbtn, #toTop, #mqToggle").forEach(el => {
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${clamp(dx * .18, -7, 7)}px, ${clamp(dy * .18, -6, 6)}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });

    // ---- ヒーローロゴの立体チルト（慣性つき） ----
    if (window.gsap) {
      const hero = $("#hero"), limg = $("#heroLogo img");
      gsap.set(limg, { transformPerspective: 700 });
      const rqx = gsap.quickTo(limg, "rotationX", { duration: .7, ease: "power3" });
      const rqy = gsap.quickTo(limg, "rotationY", { duration: .7, ease: "power3" });
      const rqz = gsap.quickTo(limg, "z", { duration: .7, ease: "power3" });
      hero.addEventListener("pointermove", e => {
        const r = hero.getBoundingClientRect();
        rqy(((e.clientX - r.left) / r.width - .5) * 11);
        rqx(-((e.clientY - r.top) / r.height - .5) * 8);
        rqz(18);
      });
      hero.addEventListener("pointerleave", () => { rqx(0); rqy(0); rqz(0); });
      // 到着後のアイドル浮遊
      gsap.to("#heroLogo", { y: 9, duration: 3.4, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 2.4 });
    }

    // ---- カーソル：移動速度で伸び縮みするリング ----
    const cur = $("#cursor"), ring = $("#cursorRing");
    let mx = -100, my = -100, rx = mx, ry = my;
    addEventListener("pointermove", e => {
      mx = e.clientX; my = e.clientY;
      cur.style.left = mx + "px"; cur.style.top = my + "px";
      const hot = e.target.closest("a,button,.card,.cheki");
      ring.classList.toggle("hot", !!hot);
    }, { passive: true });
    (function loop() {
      const dx = mx - rx, dy = my - ry;
      rx = lerp(rx, mx, .16); ry = lerp(ry, my, .16);
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      const sp = Math.min(Math.hypot(dx, dy), 90);
      const ang = Math.atan2(dy, dx);
      ring.style.transform =
        `translate(-50%,-50%) rotate(${ang}rad) scale(${1 + sp * .0042}, ${1 - Math.min(sp * .0021, .2)}) rotate(${-ang}rad)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ============================================================
     countdown chip
     ============================================================ */
  (function () {
    const chip = $("#countChip");
    const open = new Date("2026-07-29T00:00:00+09:00");
    const close = new Date("2026-07-31T18:00:00+09:00");
    const now = new Date();
    if (now < open) {
      const d = Math.ceil((open - now) / 864e5);
      chip.innerHTML = `<span class="dot"></span>開幕まで あと${d}日`;
    } else if (now <= close) {
      chip.innerHTML = `<span class="dot"></span>ただいま開催中`;
    } else {
      chip.textContent = "全日程終了 — Thank you";
    }
  })();

  /* ============================================================
     boot
     ============================================================ */
  $("#heroLogo").addEventListener("click", e => FX.spawnBurst(e.clientX, e.clientY, 16));

  initTickers();
  initScrollFX();
  buildMarquee();
  initJourney();
  runLoader();
})();
