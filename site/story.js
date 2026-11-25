// Scroll story: Lenis smooth scroll + GSAP ScrollTrigger. Every section is pinned and scrubbed,
// so scrolling plays the page like a video (and scrolling back rewinds it).
(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, k) => a + (b - a) * k;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: .085, wheelMultiplier: .9 }); window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  let sto; lenis.on('scroll', () => { window.__scrolling = true; clearTimeout(sto); sto = setTimeout(() => { window.__scrolling = false; }, 140); });

  // split headings into letters (for the heavy "drop in" type)
  $$('.split').forEach(h => { const t = h.textContent; h.setAttribute('aria-label', t); h.innerHTML = t.split(' ').map(w => `<span style="display:inline-block;white-space:nowrap" aria-hidden="true">${[...w].map(c => `<span class="ch">${c}</span>`).join('')}</span>`).join(' '); });
  const dropLetters = (tl, sel, at, dur) => tl.from(sel, { yPercent: -340, rotate: () => gsap.utils.random(-35, 35), opacity: 0, ease: 'bounce.out', stagger: { each: dur / 30 }, duration: dur * .55 }, at);
  const end1 = tl => tl.to({}, { duration: 0 }, 1);   // every pinned timeline runs 0..1
  const impact = (el, k) => { if (RM) return; el.classList.remove('shk'); void el.offsetWidth; el.classList.add('shk'); window.heroAPI && heroAPI.sfx.impact(k); navigator.vibrate && navigator.vibrate(30); };

  // ---------- 1. hero: scroll lifts the watch, slams it into the page, then the page tips back ----------
  const HW = { lift: 0, drop: 0, after: 0, tip: 0 };
  function renderHero() {
    const L = window.heroL; if (!L) return;
    const z = HW.lift * (1 - HW.drop);                       // height above the page, 0..1
    const s = 1 + .3 * z, y = -innerHeight * .07 * z, r = -7 * z;
    $('#watch').style.transform = `translate3d(${L.cx - L.ww * .503}px,${L.cy - L.ww * .826 + y}px,0) rotate(${r}deg) scale(${s})`;
    $('#watch').style.transformOrigin = '50.3% 48.2%';
    const sw = L.ww * (1.05 + .9 * z), sh = $('#shadow');
    sh.style.width = sw + 'px'; sh.style.height = sw * .8 + 'px';
    sh.style.transform = `translate3d(${L.cx - sw / 2 + z * 46}px,${L.cy - sw * .4 + z * 90}px,0)`; sh.style.opacity = (.85 - .55 * z).toFixed(3); sh.style.filter = `blur(${(8 + 30 * z).toFixed(1)}px)`;
    window.__heroCalm = 1 - HW.tip;
    if (HW.drop > .995 && HW.lift > .5) heroAPI.impact(); else if (HW.drop < .9) heroAPI.heal();
    const af = $('#after'); af.style.top = (L.cy + L.ww * .887 + 16) + 'px'; af.style.opacity = HW.after; af.querySelector('div span').style.transform = `skewX(-9deg) translateY(${(1 - HW.after) * 100}%)`;
    $('#cue').style.opacity = cl(1 - HW.lift * 3);
    $('#tilt').style.transform = HW.tip > 0 ? `perspective(1100px) rotateX(${62 * HW.tip}deg) translateY(${10 * HW.tip}%) scale(${1 - .2 * HW.tip})` : '';
    $('#dim').style.opacity = .72 * HW.tip;
  }
  const heroTL = gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=170%', scrub: .5, pin: true, onRefresh: () => renderHero() } });
  heroTL.to(HW, { lift: 1, duration: .22, ease: 'power2.out' }, .03)
    .to(HW, { drop: 1, duration: .1, ease: 'power3.in' }, .3)
    .to(HW, { after: 1, duration: .12, ease: 'power2.out' }, .46)
    .to(HW, { tip: 1, duration: .28, ease: 'power2.in' }, .72);
  end1(heroTL); heroTL.eventCallback('onUpdate', renderHero);
  addEventListener('hero-ready', renderHero); renderHero();

  // ---------- 2. why it survives: exploded view on a scrubbed timeline ----------
  const LY = window.LAYERS, stack = $('#stack'), labs = $('#labs'), svg = $('#whySvg');
  const parts = LY.parts.map((p, i) => { const im = new Image(); im.src = p.src; im.alt = ''; im.style.zIndex = 4 - i; stack.appendChild(im); return { ...p, im, i }; });
  const asm = new Image(); asm.src = LY.assembled.src; asm.alt = 'The watch, assembled'; asm.style.zIndex = 5; stack.appendChild(asm);
  const LABELS = [['Tough glass', 'Takes the hit up top'], ['The module', 'The core that keeps going'], ['Shock guard', 'Soaks up and spreads the impact'], ['Resin case', 'A tough shell around it all']];
  const labEls = LABELS.map(([b, t]) => { const d = document.createElement('div'); d.className = 'lab'; d.innerHTML = `<b>${b.toUpperCase()}</b><span>${t}</span>`; labs.appendChild(d); return d; });
  const lines = LABELS.map(() => { const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); svg.appendChild(p); return p; });
  let S = 1, SW = 0, SH = 0;
  function layoutWhy() {
    const vw = innerWidth, vh = innerHeight; SH = Math.min(vh * .62, vw * 1.25); S = SH / LY.H; SW = LY.W * S;
    stack.style.width = SW + 'px'; stack.style.height = SH + 'px';
    for (const p of parts) { p.im.style.width = p.w * S + 'px'; p.im.style.left = p.x * S + 'px'; p.im.style.top = '0px'; }
    const a = LY.assembled; asm.style.width = a.w * S + 'px'; asm.style.left = a.x * S + 'px'; asm.style.top = a.y * S + 'px';
    svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
  }
  const P = { show: 0, ex: 0, tag: 0 }; let lastEx = 0, armed = false;
  function renderWhy(prog) {
    const r = stack.getBoundingClientRect(), vw = innerWidth;
    const zoom = lerp(.82, 1, P.show) * (1 + .05 * cl((prog - .48) / .2) * (1 - cl((prog - .68) / .1)));
    stack.style.transform = `translate(-50%,-50%) scale(${zoom})`; stack.style.opacity = P.show;
    const fade = cl(P.ex / .04);
    asm.style.opacity = 1 - fade;
    const active = Math.min(3, Math.floor(cl((prog - .14) / .52) * 4));   // one label at a time, top to bottom
    parts.forEach(p => {
      const y = lerp(p.ay, p.y, P.ex) * S, rot = (p.i - 1.5) * 2.2 * P.ex;
      p.im.style.opacity = fade; p.im.style.transform = `translateY(${y}px) rotate(${rot}deg)`;
      // label sits on alternating sides at the layer's exploded height; its leader line follows the moving layer
      const seen = cl((P.ex - .2) / .15), on = p.i === active ? 1 : 0, op = seen * on * (prog < .66 ? 1 : 1 - cl((prog - .66) / .04));
      const lab = labEls[p.i], right = p.i % 2 === 0, ly = r.top + (p.y + p.h * .5) * S * zoom;
      lab.style.opacity = op; lab.style.top = (ly - 26) + 'px'; lab.style.left = right ? 'auto' : '14px'; lab.style.right = right ? '14px' : 'auto';
      const px = r.left + (right ? (p.x + p.w * .82) : (p.x + p.w * .18)) * S * zoom, py = r.top + (y + p.h * .5 * S) * zoom;
      const lx = right ? vw - 14 - lab.offsetWidth : 14 + lab.offsetWidth;
      lines[p.i].setAttribute('d', `M${px},${py} L${(px + lx) / 2},${ly} L${lx},${ly}`); lines[p.i].style.opacity = op;
    });
    // the rebuild slams shut: shake + flash once, on the way down only
    if (P.ex > .25) armed = true;
    if (armed && lastEx > .02 && P.ex <= .02 && prog > .7) { armed = false; impact($('#why'), .55); if (!RM) gsap.fromTo('#whyFlash', { opacity: .9 }, { opacity: 0, duration: .22, ease: 'power2.out' }); }
    lastEx = P.ex; $('#still').style.opacity = P.tag; $('#still').style.transform = `skewX(-8deg) scale(${lerp(1.4, 1, P.tag)})`;
  }
  const inWhy = gsap.timeline({ scrollTrigger: { trigger: '#why', start: 'top 85%', end: 'top 5%', scrub: .4 } });
  dropLetters(inWhy, '#why .ch', 0, 1); inWhy.from('#why .rule', { scaleX: 0, transformOrigin: '0 50%', duration: .3, ease: 'power3.out' }, .7)
    .to(P, { show: 1, duration: .4, ease: 'power2.out', onUpdate: () => renderWhy(0) }, .6);
  const whyTL = gsap.timeline({ scrollTrigger: { trigger: '#why', start: 'top top', end: '+=220%', scrub: .5, pin: true, onRefresh: () => renderWhy(whyTL.progress()) } });
  whyTL.eventCallback('onUpdate', () => renderWhy(whyTL.progress()));
  whyTL.to(P, { ex: 1, duration: .38, ease: 'power2.inOut' }, .08)
    .to(P, { ex: 0, duration: .1, ease: 'power4.in' }, .7)
    .to(P, { tag: 1, duration: .06, ease: 'back.out(3)' }, .82);
  end1(whyTL);

  // ---------- 3. pick your colour: circular wipes from the watch + a card-flip swap ----------
  const COLS = [{ name: 'STEALTH MODE.', ink: '#F3EC00', rule: '#E8202A', burst: '#1d1d1d' }, { name: 'CLEAN SLATE.', ink: '#0B0B0B', rule: '#E8202A', burst: '#F3EC00' },
    { name: 'LOUD ON PURPOSE.', ink: '#0B0B0B', rule: '#F3EC00', burst: '#F3EC00' }, { name: "YOU CAN'T MISS IT.", ink: '#0B0B0B', rule: '#E8202A', burst: '#ffffff' }];
  const bgs = $$('#colour .bgc'), imgs = $$('#flip img'), sws = $$('#sw button'), tag = $('#tagline');
  // comic starburst behind the watch
  (() => { let d = ''; const n = 22; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, r = i % 2 ? 62 : 98 - (i % 4 === 0 ? 8 : 0); d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ',' + (Math.sin(a) * r).toFixed(1); } $('#burstP').setAttribute('d', d + 'Z'); })();
  const seg = p => { const S = [[0, .1, 0, 0], [.1, .3, 0, 1], [.3, .4, 1, 1], [.4, .6, 1, 2], [.6, .7, 2, 2], [.7, .9, 2, 3], [.9, 1.01, 3, 3]]; for (const [a, b, c0, c1] of S) if (p < b) return lerp(c0, c1, gsap.parseEase('power2.inOut')(cl((p - a) / (b - a)))); return 3; };
  let curNear = -1;
  function renderColour(prog) {
    const c = seg(prog), i = Math.min(2, Math.floor(c)), f = c - i, near = Math.round(c);
    bgs.forEach((b, k) => { const rr = k === 0 ? 150 : k <= Math.floor(c + 1e-6) ? 150 : k === i + 1 ? f * 150 : 0; b.style.clipPath = `circle(${rr}% at 50% 54%)`; });
    imgs.forEach(im => { im.style.opacity = 0; });
    const fl = $('#flip'); let show = near, ry = 0;
    if (f > 0 && f < 1 && c < 3) { if (f < .5) { show = i; ry = f * 2 * 90; } else { show = i + 1; ry = -90 + (f - .5) * 2 * 90; } }
    imgs[show].style.opacity = 1;
    fl.style.transform = `translate(-50%,-50%) perspective(900px) rotateY(${ry}deg) scale(${1 + .1 * Math.sin(Math.PI * (f % 1))})`;
    $('.burst').style.transform = `translate(-50%,-50%) rotate(${prog * 220}deg) scale(${1 + .06 * Math.sin(Math.PI * f)})`;
    if (near !== curNear) { curNear = near; const C = COLS[near]; $('#colour .head').style.color = C.ink; $('#colour .rule').style.background = C.rule; tag.style.color = C.ink; $('#burstP').setAttribute('fill', C.burst);
      gsap.fromTo(tag, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .35, ease: 'power3.out', onStart: () => { tag.textContent = C.name; } }); sws.forEach((b, k) => b.classList.toggle('on', k === near)); }
  }
  const inCol = gsap.timeline({ scrollTrigger: { trigger: '#colour', start: 'top 85%', end: 'top 5%', scrub: .4 } });
  dropLetters(inCol, '#colour .ch', 0, 1); inCol.from('#colour .rule', { scaleX: 0, transformOrigin: '0 50%', duration: .3 }, .7)
    .from('#flip,.burst', { opacity: 0, duration: .5, ease: 'power2.out' }, .4);
  const colTL = gsap.timeline({ scrollTrigger: { trigger: '#colour', start: 'top top', end: '+=280%', scrub: .5, pin: true, onRefresh: () => renderColour(colTL.progress()) } });
  colTL.eventCallback('onUpdate', () => renderColour(colTL.progress()));
  end1(colTL);
  sws.forEach((b, k) => b.addEventListener('click', () => { const st = colTL.scrollTrigger, stops = [.05, .35, .65, .95]; lenis.scrollTo(st.start + (st.end - st.start) * stops[k], { duration: 1.2 }); }));

  // ---------- 4. the end: one more drop, played once when you get there ----------
  const endSvg = $('#endSvg'); let crackPaths = [];
  function buildCracks() {
    const sec = $('#end'), w = sec.offsetWidth, h = sec.offsetHeight, we = $('#endWatch');
    const cx = we.offsetLeft + we.offsetWidth / 2, cy = we.offsetTop + we.offsetHeight * .55;   // layout position, not the mid-drop transform
    endSvg.setAttribute('viewBox', `0 0 ${w} ${h}`); endSvg.innerHTML = ''; crackPaths = [];
    let seed = 3; const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let j = 0; j < 16; j++) { let a = j / 16 * Math.PI * 2 + R() * .3, x = cx, y = cy, d = `M${x.toFixed(1)},${y.toFixed(1)}`; const len = (R() * .5 + .5) * Math.max(w, h) * .55;
      for (let s = 0; s < 7; s++) { a += (R() - .5) * .5; x += Math.cos(a) * len / 7; y += Math.sin(a) * len / 7; d += `L${x.toFixed(1)},${y.toFixed(1)}`; }
      for (const [col, wd] of [['#E8202A', 5], ['#0B0B0B', 2]]) { const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); p.setAttribute('stroke', col); p.setAttribute('stroke-width', wd); endSvg.appendChild(p); const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; crackPaths.push(p); } }
  }
  const endTL = gsap.timeline({ paused: true });
  endTL.from('#end .h2 span', { xPercent: -120, skewX: 30, duration: .55, ease: 'power4.out', stagger: .09 })
    .fromTo('#endWatch', { y: () => -innerHeight * .9, scale: 1.7, opacity: 1, rotate: -40 }, { y: 0, scale: 1, rotate: -16, opacity: 1, duration: .42, ease: 'power3.in' }, .2)
    .add(() => { impact($('#end'), .8); gsap.to(crackPaths, { strokeDashoffset: 0, duration: .4, ease: 'power2.out', stagger: .006 }); }, '>');
  ScrollTrigger.create({ trigger: '#end', start: 'top 45%', onEnter: () => { buildCracks(); endTL.restart(); }, onLeaveBack: () => { endTL.pause(0); gsap.set(crackPaths, { strokeDashoffset: (i, el) => el.getTotalLength() }); } });
  $('#again').addEventListener('click', () => { window.heroAPI && heroAPI.wake(); lenis.scrollTo(0, { duration: 1.8, easing: t => 1 - Math.pow(1 - t, 4) }); });

  addEventListener('resize', () => { layoutWhy(); ScrollTrigger.refresh(); });
  Promise.all([...parts.map(p => p.im.decode().catch(() => {})), asm.decode().catch(() => {})]).then(() => { layoutWhy(); ScrollTrigger.refresh(); });
  layoutWhy();
})();
