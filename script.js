/* ═══════════════════════════════════════════════════════════════════════
   TAKE OFF — script.js
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── NAVBAR SCROLL ──────────────────────────────────────────────── */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', scrollY > 8);
  }, { passive: true });

  /* ─── HAMBURGER ──────────────────────────────────────────────────── */
  const ham = document.getElementById('ham');
  const mob = document.getElementById('mob');
  let mOpen = false;

  ham.addEventListener('click', () => {
    mOpen = !mOpen;
    ham.classList.toggle('open', mOpen);
    mob.classList.toggle('open', mOpen);
  });

  window.closeMob = function () {
    mOpen = false;
    ham.classList.remove('open');
    mob.classList.remove('open');
  };

  document.addEventListener('click', e => {
    if (mOpen && !nav.contains(e.target) && !mob.contains(e.target)) closeMob();
  });

  /* ─── SCROLL REVEAL ──────────────────────────────────────────────── */
  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
    });
  }, { threshold: .08, rootMargin: '0px 0px -32px 0px' });

  document.querySelectorAll('.rv, .rv-scale').forEach(el => ro.observe(el));

  /* ─── SMOOTH SCROLL ──────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - 72, behavior: 'smooth' });
      }
    });
  });

  /* ─── FAQ ACCORDION ──────────────────────────────────────────────── */
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ─── CARD TILT ──────────────────────────────────────────────────── */
  document.querySelectorAll('.port-card').forEach(c => {
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      c.style.transform = `translateY(-6px) rotateX(${-y * 2}deg) rotateY(${x * 2}deg)`;
    });
    c.addEventListener('mouseleave', () => { c.style.transform = ''; });
  });

  /* ─── METRICS COUNTER ────────────────────────────────────────────── */
  function animateCounters() {
    document.querySelectorAll('.res-metric-val[data-target]').forEach(el => {
      const target = +el.dataset.target;
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      let startTime = null;

      function step(ts) {
        if (!startTime) startTime = ts;
        const p = Math.min((ts - startTime) / 1200, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.floor(ease * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  const metricsEl = document.querySelector('.res-metrics');
  if (metricsEl) {
    const mObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { animateCounters(); mObs.disconnect(); }
    }, { threshold: .3 });
    mObs.observe(metricsEl);
  }

  /* ═══════════════════════════════════════════════════════════════════
     FLOW ROCKET ANIMATION
     ─────────────────────────────────────────────────────────────────
     Rocket travels L→R along the flow line. As it passes each step:
     - Line LIGHTS UP in its wake (with trail decay)
     - Card ACTIVATES on arrival, DEACTIVATES on departure
     - Final step: rocket accelerates off-screen with smoke burst
     - 3s pause → restarts
     ═══════════════════════════════════════════════════════════════════ */
  function initRocketFlow() {
    if (window.matchMedia('(max-width: 768px)').matches) return;
    const track     = document.getElementById('flowTrack');
    const rocket    = document.getElementById('flowRocket');
    const lineFill  = document.getElementById('flowLineFill');
    const smokeEl   = document.getElementById('flowSmoke');
    const steps     = Array.from(document.querySelectorAll('#flowDesktop .flow-step'));

    if (!track || !rocket || !steps.length) return;

    const STEP_DURATION  = 1500;
    const DWELL_TIME     = 350;
    const LAUNCH_SPEED   = 380;
    const PAUSE_AFTER    = 3000;

    let currentStep = 0;
    let running     = false;
    let stepping    = false;

    function getStepX(idx) {
      const trackRect = track.getBoundingClientRect();
      const stepRect  = steps[idx].getBoundingClientRect();
      return stepRect.left + stepRect.width / 2 - trackRect.left;
    }

    function setRocketX(x) { rocket.style.left = x + 'px'; }

    function setLine(fromX, toX, alpha) {
      lineFill.style.left    = fromX + 'px';
      lineFill.style.width   = Math.max(0, toX - fromX) + 'px';
      lineFill.style.opacity = Math.max(0, Math.min(1, alpha));
    }

    function clearLine() {
      lineFill.style.transition = 'opacity 250ms ease';
      lineFill.style.opacity = '0';
      setTimeout(() => {
        lineFill.style.transition = '';
        lineFill.style.width = '0px';
        lineFill.style.left  = '0px';
        lineFill.style.opacity = '';
      }, 300);
    }

    function activateStep(idx, on) {
      if (steps[idx]) steps[idx].classList.toggle('active', on);
    }

    function deactivateAll() { steps.forEach(s => s.classList.remove('active')); }

    function showSmoke() {
      if (!smokeEl) return;
      const rRect = rocket.getBoundingClientRect();
      smokeEl.style.left = (rRect.left + rRect.width  / 2) + 'px';
      smokeEl.style.top  = (rRect.top  + rRect.height / 2) + 'px';
      smokeEl.classList.remove('visible');
      void smokeEl.offsetWidth;
      smokeEl.classList.add('visible');
    }

    function hideRocket() {
      rocket.style.transition = 'opacity .2s, transform .2s';
      rocket.style.opacity    = '0';
      rocket.style.transform  = 'translateY(-50%) scale(0.5)';
    }

    function showRocket() {
      rocket.style.transition = 'none';
      rocket.style.opacity    = '1';
      rocket.style.transform  = 'translateY(-50%) scale(1)';
    }

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    function easeIn(t)  { return t * t * t; }
    function lerp(a, b, t) { return a + (b - a) * t; }

    function doStep() {
      if (stepping) return;
      stepping = true;

      const fromX  = currentStep === 0 ? getStepX(0) - 72 : getStepX(currentStep - 1);
      const toX    = getStepX(currentStep);
      const startX = getStepX(0) - 72;
      const start  = performance.now();

      function tick(now) {
        const t  = Math.min((now - start) / STEP_DURATION, 1);
        const et = easeOut(t);
        const rx = lerp(fromX, toX, et);

        setRocketX(rx);
        setLine(startX, rx, 1);
        if (t > 0.7) activateStep(currentStep, true);

        if (t < 1) { requestAnimationFrame(tick); return; }

        setTimeout(() => {
          activateStep(currentStep, false);
          clearLine();
          currentStep++;
          stepping = false;
          currentStep >= steps.length ? doLaunch() : doStep();
        }, DWELL_TIME);
      }

      requestAnimationFrame(tick);
    }

    function doLaunch() {
      const fromX  = getStepX(steps.length - 1);
      const exitX  = track.offsetWidth + 100;
      const startX = getStepX(0) - 72;
      const start  = performance.now();

      function tick(now) {
        const t  = Math.min((now - start) / LAUNCH_SPEED, 1);
        const et = easeIn(t);
        const rx = lerp(fromX, exitX, et);

        setRocketX(rx);
        setLine(startX, rx, 1 - et);

        if (t < 1) { requestAnimationFrame(tick); return; }

        showSmoke();
        hideRocket();
        deactivateAll();
        clearLine();

        setTimeout(() => {
          currentStep = 0;
          stepping    = false;
          showRocket();
          setRocketX(getStepX(0) - 72);
          lineFill.style.opacity = '0';
          lineFill.style.width   = '0';
          doStep();
        }, PAUSE_AFTER);
      }

      requestAnimationFrame(tick);
    }

    const flowCard = document.querySelector('.flow-card');
    if (!flowCard) return;

    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !running) {
          running = true;
          showRocket();
          setRocketX(getStepX(0) - 72);
          lineFill.style.opacity = '0';
          doStep();
        }
      });
    }, { threshold: 0.2 }).observe(flowCard);
  }

  /* ═══════════════════════════════════════════════════════════════════
     CTA ROCKET — foguete diagonal a cada 6s
     ═══════════════════════════════════════════════════════════════════ */
  function initCtaRocket() {
    const canvas = document.getElementById('ctaRocketCanvas');
    if (!canvas) return;

    const ctx      = canvas.getContext('2d');
    const INTERVAL = 6000;
    const DURATION = 1800;
    const TRAIL_LEN = 90;

    let W, H;

    function resize() {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W * window.devicePixelRatio;
      canvas.height = H * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener('resize', resize);

    function getPos(t) {
      const ease = t < .5 ? 2*t*t : -1+(4-2*t)*t;
      const sx = -60,     sy = H + 40;
      const ex = W + 60,  ey = -40;
      const cx = W * .35, cy = H * .45;
      const mt = ease;
      const x = (1-mt)*(1-mt)*sx + 2*(1-mt)*mt*cx + mt*mt*ex;
      const y = (1-mt)*(1-mt)*sy + 2*(1-mt)*mt*cy + mt*mt*ey;
      const dt = .01, mt2 = Math.min(t+dt,1);
      const e2 = mt2<.5?2*mt2*mt2:-1+(4-2*mt2)*mt2;
      const x2 = (1-e2)*(1-e2)*sx + 2*(1-e2)*e2*cx + e2*e2*ex;
      const y2 = (1-e2)*(1-e2)*sy + 2*(1-e2)*e2*cy + e2*e2*ey;
      return { x, y, angle: Math.atan2(y2-y, x2-x) + Math.PI/2 };
    }

    const trail = [];

    function drawRocket(x, y, angle) {
      const s = Math.min(W, H) * .038;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = .28;

      const f1 = ctx.createRadialGradient(0,s*.9,0, 0,s*1.8,s*1.5);
      f1.addColorStop(0,'rgba(255,220,100,.9)'); f1.addColorStop(.3,'rgba(255,100,20,.6)'); f1.addColorStop(1,'rgba(240,61,0,0)');
      ctx.beginPath(); ctx.ellipse(0,s*1.1,s*.45,s*1.4,0,0,Math.PI*2); ctx.fillStyle=f1; ctx.fill();

      const bg = ctx.createLinearGradient(-s*.4,0,s*.4,0);
      bg.addColorStop(0,'#1c1c1c'); bg.addColorStop(.5,'#2e2e2e'); bg.addColorStop(1,'#181818');
      ctx.beginPath(); ctx.ellipse(0,0,s*.4,s*1.0,0,0,Math.PI*2); ctx.fillStyle=bg; ctx.fill();

      const ng = ctx.createLinearGradient(-s*.4,-s*.6,s*.4,-s*.6);
      ng.addColorStop(0,'#a02800'); ng.addColorStop(.5,'#f03d00'); ng.addColorStop(1,'#a02800');
      ctx.beginPath();
      ctx.moveTo(-s*.4,-s*.6);
      ctx.bezierCurveTo(-s*.4,-s*1.1,-s*.12,-s*1.4,0,-s*1.5);
      ctx.bezierCurveTo(s*.12,-s*1.4,s*.4,-s*1.1,s*.4,-s*.6);
      ctx.fillStyle=ng; ctx.fill();

      ctx.beginPath(); ctx.arc(0,-s*.2,s*.22,0,Math.PI*2); ctx.fillStyle='#0a0a0a'; ctx.fill();
      ctx.beginPath(); ctx.arc(0,-s*.2,s*.13,0,Math.PI*2); ctx.fillStyle='rgba(240,61,0,.3)'; ctx.fill();

      ctx.beginPath(); ctx.moveTo(-s*.4,s*.44); ctx.lineTo(-s*1.0,s*1.15); ctx.lineTo(-s*.4,s*.85); ctx.closePath(); ctx.fillStyle='#f03d00'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(s*.4,s*.44);  ctx.lineTo(s*1.0,s*1.15);  ctx.lineTo(s*.4,s*.85);  ctx.closePath(); ctx.fillStyle='#f03d00'; ctx.fill();

      ctx.restore();
    }

    function drawTrail() {
      if (trail.length < 2) return;
      for (let i = 1; i < trail.length; i++) {
        const r = i / trail.length;
        const p = trail[i], pp = trail[i-1];
        ctx.beginPath(); ctx.moveTo(pp.x,pp.y); ctx.lineTo(p.x,p.y);
        ctx.strokeStyle = `rgba(240,61,0,${r*.22})`; ctx.lineWidth = r*3; ctx.lineCap = 'round'; ctx.stroke();
        if (r > .6) {
          ctx.beginPath(); ctx.moveTo(pp.x,pp.y); ctx.lineTo(p.x,p.y);
          ctx.strokeStyle = `rgba(255,160,60,${r*.15})`; ctx.lineWidth = r*1.2; ctx.stroke();
        }
      }
    }

    let flying = false, startTime = null;

    function fly(ts) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const t = Math.min(elapsed / DURATION, 1);

      ctx.clearRect(0, 0, W, H);

      const { x, y, angle } = getPos(t);
      trail.push({ x, y });
      if (trail.length > TRAIL_LEN) trail.shift();

      drawTrail();
      drawRocket(x, y, angle);

      if (t < 1) {
        requestAnimationFrame(fly);
      } else {
        flying = false; startTime = null; trail.length = 0;
        ctx.clearRect(0, 0, W, H);
        setTimeout(launch, INTERVAL);
      }
    }

    function launch() {
      if (flying) return;
      flying = true; trail.length = 0;
      requestAnimationFrame(fly);
    }

    const ctaBox = document.querySelector('.cta-box');
    if (!ctaBox) return;

    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { setTimeout(launch, 800); }
      });
    }, { threshold: .3 }).observe(ctaBox);
  }

  /* ═══════════════════════════════════════════════════════════════════
     FLOW ROCKET — MOBILE VERTICAL
     Rocket travels bottom→top through the 5 stages (column-reverse layout).
     Visitante is visually at the bottom, Cliente at the top.
     ═══════════════════════════════════════════════════════════════════ */
  function initMobileRocketFlow() {
    if (!window.matchMedia('(max-width: 768px)').matches) return;

    const container  = document.getElementById('flowMobile');
    const rocket     = document.getElementById('flowRocketMobile');
    const lineFill   = document.getElementById('flowLineFillMobile');
    const smokeEl    = document.getElementById('flowSmoke');
    const steps      = Array.from(container.querySelectorAll('.flow-m-step'));

    if (!container || !rocket || !steps.length) return;

    const STEP_DURATION = 1500;
    const DWELL_TIME    = 350;
    const LAUNCH_SPEED  = 500;
    const PAUSE_AFTER   = 3000;

    let currentStep = 0;
    let running     = false;
    let stepping    = false;

    /* Y center of step[idx] relative to container top.
       With column-reverse: steps[0] (Visitante) has the largest Y (bottom). */
    function getStepY(idx) {
      const cr = container.getBoundingClientRect();
      const sr = steps[idx].getBoundingClientRect();
      return sr.top + sr.height / 2 - cr.top;
    }

    /* rocket SVG is 36×22. margin-left:-18px centers it on the line.
       top = yCenter - svgHeight/2 (11px) to center vertically. */
    function setRocketY(yCenter) {
      rocket.style.top = (yCenter - 11) + 'px';
    }

    function setLineFill(yCenter) {
      const h = Math.max(0, container.offsetHeight - yCenter);
      lineFill.style.height  = h + 'px';
      lineFill.style.opacity = '1';
    }

    function clearLineFill() {
      lineFill.style.transition = 'opacity 250ms ease';
      lineFill.style.opacity = '0';
      setTimeout(() => {
        lineFill.style.transition = '';
        lineFill.style.height = '0';
        lineFill.style.opacity = '';
      }, 300);
    }

    function activateStep(idx, on) {
      if (steps[idx]) steps[idx].classList.toggle('active', on);
    }

    function deactivateAll() { steps.forEach(s => s.classList.remove('active')); }

    function showSmoke() {
      if (!smokeEl) return;
      const r = rocket.getBoundingClientRect();
      smokeEl.style.left = (r.left + r.width  / 2) + 'px';
      smokeEl.style.top  = (r.top  + r.height / 2) + 'px';
      smokeEl.classList.remove('visible');
      void smokeEl.offsetWidth;
      smokeEl.classList.add('visible');
    }

    function hideRocket() {
      rocket.style.transition = 'opacity .2s';
      rocket.style.opacity = '0';
    }

    function showRocket() {
      rocket.style.transition = 'none';
      rocket.style.opacity = '1';
    }

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    function easeIn(t)  { return t * t * t; }
    function lerp(a, b, t) { return a + (b - a) * t; }

    function doStep() {
      if (stepping) return;
      stepping = true;

      /* first step: start 40px below Visitante (enters from bottom) */
      const fromY = currentStep === 0
        ? getStepY(0) + 40
        : getStepY(currentStep - 1);
      const toY   = getStepY(currentStep);
      const start = performance.now();

      function tick(now) {
        const t  = Math.min((now - start) / STEP_DURATION, 1);
        const et = easeOut(t);
        const ry = lerp(fromY, toY, et);

        setRocketY(ry);
        setLineFill(ry);
        if (t > 0.7) activateStep(currentStep, true);

        if (t < 1) { requestAnimationFrame(tick); return; }

        setTimeout(() => {
          activateStep(currentStep, false);
          clearLineFill();
          currentStep++;
          stepping = false;
          currentStep >= steps.length ? doLaunch() : doStep();
        }, DWELL_TIME);
      }

      requestAnimationFrame(tick);
    }

    function doLaunch() {
      const fromY  = getStepY(steps.length - 1);   /* Cliente Y (top) */
      const exitY  = -60;                            /* above container */
      const fixedH = Math.max(0, container.offsetHeight - fromY);
      const start  = performance.now();

      function tick(now) {
        const t     = Math.min((now - start) / LAUNCH_SPEED, 1);
        const et    = easeIn(t);
        const ry    = lerp(fromY, exitY, et);

        setRocketY(ry);
        lineFill.style.height  = fixedH + 'px';
        lineFill.style.opacity = (1 - et).toString();

        if (t < 1) { requestAnimationFrame(tick); return; }

        showSmoke();
        hideRocket();
        deactivateAll();
        lineFill.style.opacity = '0';
        lineFill.style.height  = '0';

        setTimeout(() => {
          currentStep = 0;
          stepping    = false;
          showRocket();
          setRocketY(getStepY(0) + 40);
          doStep();
        }, PAUSE_AFTER);
      }

      requestAnimationFrame(tick);
    }

    const flowCard = document.querySelector('.flow-card');
    if (!flowCard) return;

    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !running) {
          running = true;
          showRocket();
          setRocketY(getStepY(0) + 40);
          doStep();
        }
      });
    }, { threshold: 0.2 }).observe(flowCard);
  }

  /* ─── INIT ───────────────────────────────────────────────────────── */
  initRocketFlow();
  initMobileRocketFlow();
  initCtaRocket();

})();
