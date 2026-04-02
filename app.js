/* ============================================================
   THE FUSION FUNDED — app.js
   ============================================================ */

(function () {
  'use strict';

  /* ===================================================
     1. FRAME ANIMATION ENGINE
        Uses the 193 frames as a canvas-drawn animation
        with parallax scroll effect
     =================================================== */
  const FIRST_FRAME = 88;
  const TOTAL_FRAMES = 193;
  const FRAME_BASE = './parallax_asset/ezgif-frame-';
  const FPS = 24;

  // Preload all frames
  const frames = [];
  let framesLoaded = 0;
  let animationReady = false;
  let currentFrame = 0;
  let targetFrame = 0;       // scroll sets this; RAF lerps toward it
  let isParallaxMode = false;

  function padNum(n) {
    return String(n).padStart(3, '0');
  }

  const FRAME_COUNT = TOTAL_FRAMES - FIRST_FRAME + 1;

  function preloadFrames(onComplete) {
    for (let i = FIRST_FRAME; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.onload = () => {
        framesLoaded++;
        if (framesLoaded === FRAME_COUNT) {
          animationReady = true;
          onComplete();
        }
      };
      img.onerror = () => {
        framesLoaded++;
        if (framesLoaded === FRAME_COUNT) {
          animationReady = true;
          onComplete();
        }
      };
      img.src = FRAME_BASE + padNum(i) + '.jpg';
      frames[i - FIRST_FRAME] = img;
    }
  }

  /* ---------- Hero Canvas ---------- */
  const heroCanvas = document.getElementById('hero-canvas');
  const heroCtx = heroCanvas ? heroCanvas.getContext('2d') : null;
  if (heroCtx) { heroCtx.imageSmoothingEnabled = true; heroCtx.imageSmoothingQuality = 'high'; }

  function resizeHeroCanvas() {
    if (!heroCanvas) return;
    heroCanvas.width = window.innerWidth;
    heroCanvas.height = window.innerHeight;
    if (heroCtx) { heroCtx.imageSmoothingEnabled = true; heroCtx.imageSmoothingQuality = 'high'; }
  }

  function drawHeroFrame(index) {
    if (!heroCtx || !frames[index] || !frames[index].complete) return;
    const img = frames[index];
    const cw = heroCanvas.width;
    const ch = heroCanvas.height;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;
    heroCtx.clearRect(0, 0, cw, ch);
    heroCtx.drawImage(img, sx, sy, sw, sh);
  }

  /* ---------- Divider Canvas ---------- */
  const dividerCanvas = document.getElementById('divider-canvas');
  const dividerCtx = dividerCanvas ? dividerCanvas.getContext('2d') : null;

  function resizeDividerCanvas() {
    if (!dividerCanvas) return;
    dividerCanvas.width = dividerCanvas.offsetWidth || window.innerWidth;
    dividerCanvas.height = dividerCanvas.offsetHeight || window.innerHeight * 0.7;
  }

  function drawDividerFrame(index) {
    if (!dividerCtx || !frames[index] || !frames[index].complete) return;
    const img = frames[index];
    const cw = dividerCanvas.width;
    const ch = dividerCanvas.height;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;
    dividerCtx.clearRect(0, 0, cw, ch);
    dividerCtx.drawImage(img, sx, sy, sw, sh);
  }

  /* ---------- Animation Loop ----------
     Scroll sets targetFrame. Each RAF tick lerps currentFrame toward it,
     only repainting when the frame actually changes.               */
  let rafId = null;
  let lastDrawnFrame = -1;

  function animate() {
    rafId = requestAnimationFrame(animate);
    if (!animationReady) return;

    // Smooth lerp: 0.55 snaps quickly without feeling instant
    const diff = targetFrame - currentFrame;
    if (Math.abs(diff) > 0.1) {
      currentFrame += diff * 0.55;
    } else {
      currentFrame = targetFrame;
    }

    const frameIdx = Math.round(currentFrame);
    if (frameIdx === lastDrawnFrame) return;   // skip if nothing changed
    lastDrawnFrame = frameIdx;

    drawHeroFrame(frameIdx);
    drawDividerFrame(frameIdx);
  }

  /* ---------- Parallax Frame Scrub ---------- */
  function handleParallaxScroll() {
    const hero = document.getElementById('hero');
    if (!hero) return;
    const heroH = hero.offsetHeight;
    const scrollY = window.scrollY;

    // Get fixed elements
    const canvas = document.getElementById('hero-canvas');
    const overlay = document.querySelector('.hero-overlay');
    const grid = document.querySelector('.grid-overlay');
    const scrollInd = document.querySelector('.scroll-indicator');

    // Hide fixed parallax layers once user scrolls past first viewport
    const visible = scrollY < window.innerHeight;
    const fadeAlpha = visible ? 1 : Math.max(0, 1 - (scrollY - window.innerHeight) / (window.innerHeight * 0.4));
    [canvas, overlay, grid].forEach(el => {
      if (el) el.style.opacity = fadeAlpha;
    });
    if (scrollInd) {
      scrollInd.style.opacity = scrollY < window.innerHeight ? '1' : '0';
      scrollInd.style.pointerEvents = scrollY < window.innerHeight ? 'auto' : 'none';
    }

    // Scrub all frames within the first viewport height of scroll
    if (scrollY < heroH) {
      isParallaxMode = true;
      const scrubZone = Math.min(heroH, window.innerHeight);
      const progress = Math.min(scrollY / scrubZone, 1);
      targetFrame = Math.min(Math.floor(progress * (FRAME_COUNT - 1)), FRAME_COUNT - 1);
    } else {
      isParallaxMode = false;
    }
  }

  /* ===================================================
     2. SMOOTH SCROLL FOR NAV LINKS
     =================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ===================================================
     3. NAVBAR SCROLL BEHAVIOR
     =================================================== */
  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link update
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 100;
      if (window.scrollY >= top) current = sec.getAttribute('id');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  /* ===================================================
     3. HAMBURGER MOBILE MENU
     =================================================== */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      hamburger.children[0].style.transform = isOpen ? 'rotate(45deg) translate(5px,5px)' : '';
      hamburger.children[1].style.opacity = isOpen ? '0' : '';
      hamburger.children[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px,-5px)' : '';
    });
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.children[0].style.transform = '';
        hamburger.children[1].style.opacity = '';
        hamburger.children[2].style.transform = '';
      });
    });
  }

  /* ===================================================
     4. SCROLL REVEAL — re-triggers on every enter/leave
     =================================================== */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = (entry.target.dataset.delay || 0) * 120;
        setTimeout(() => entry.target.classList.add('revealed'), delay);
      } else {
        entry.target.classList.remove('revealed');
      }
    });
  }, { threshold: 0.15 });

  let revealIdx = 0;
  document.querySelectorAll('[data-reveal], [data-reveal-left], [data-reveal-right], [data-reveal-scale]').forEach((el) => {
    el.dataset.delay = revealIdx % 4;
    revealIdx++;
    revealObs.observe(el);
  });

  /* ===================================================
     5. COUNTER ANIMATION
     =================================================== */
  function formatStat(num, prefix, suffix) {
    if (num >= 1000000) return prefix + (num / 1000000).toFixed(1) + 'M' + suffix;
    if (num >= 1000) return prefix + (num / 1000).toFixed(0) + 'K' + suffix;
    return prefix + num + suffix;
  }

  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const block = entry.target;
      const target = +block.dataset.count;
      const prefix = block.dataset.prefix || '';
      const suffix = block.dataset.suffix || '';
      const valueEl = block.querySelector('.stat-value');
      if (!valueEl) return;
      let start = 0;
      const duration = 2000;
      const startTime = performance.now();
      function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out expo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const val = Math.floor(eased * target);
        valueEl.textContent = formatStat(val, prefix, suffix);
        if (progress < 1) requestAnimationFrame(update);
        else valueEl.textContent = formatStat(target, prefix, suffix);
      }
      requestAnimationFrame(update);
      counterObs.unobserve(block);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));

  /* ===================================================
     5b. COMPARE SECTION — RE-TRIGGER ANIMATION ON EVERY ENTER/LEAVE
     =================================================== */
  const compareGlassWrap = document.querySelector('.compare-glass-wrap');
  if (compareGlassWrap) {
    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          compareGlassWrap.classList.add('revealed');
          // Re-trigger border draw animation
          const rect = compareGlassWrap.querySelector('.compare-border-rect');
          if (rect) {
            rect.style.animation = 'none';
            rect.offsetHeight;
            rect.style.animation = 'cgBorderDraw 1.8s cubic-bezier(0.4,0,0.2,1) forwards, cgBorderPulse 4s 1.8s ease-in-out infinite';
          }
        } else {
          compareGlassWrap.classList.remove('revealed');
        }
      });
    }, { threshold: 0.2 }).observe(compareGlassWrap);
  }

  /* ===================================================
     6. PLAN TAB SWITCHING
     =================================================== */
  const planTabs = document.querySelectorAll('.plan-tab');
  const planWraps = document.querySelectorAll('.plan-table-wrap');

  planTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      planTabs.forEach(t => t.classList.remove('active'));
      planWraps.forEach(w => w.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById('plan-' + tab.dataset.plan);
      if (target) target.classList.add('active');
    });
  });

  /* ===================================================
     7. SMOOTH PARALLAX for DIVIDER
     =================================================== */
  function handleDividerParallax() {
    const divider = document.querySelector('.parallax-divider');
    if (!divider || !dividerCanvas) return;
    const rect = divider.getBoundingClientRect();
    const viewH = window.innerHeight;
    if (rect.top < viewH && rect.bottom > 0) {
      // shift canvas vertically for parallax feel
      const progress = 1 - (rect.bottom / (viewH + rect.height));
      const offset = progress * 60 - 30; // -30 to +30
      dividerCanvas.style.transform = `translateY(${offset}px) scale(1.1)`;
    }
  }

  /* ===================================================
     8. NEON CURSOR TRAIL
     =================================================== */
  const trailCanvas = document.createElement('canvas');
  trailCanvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:9999;width:100%;height:100%;';
  document.body.appendChild(trailCanvas);
  const trailCtx = trailCanvas.getContext('2d');
  trailCanvas.width = window.innerWidth;
  trailCanvas.height = window.innerHeight;

  const trail = [];
  const MAX_TRAIL = 18;
  let mouseX = -999, mouseY = -999;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    trail.push({ x: mouseX, y: mouseY, age: 0 });
    if (trail.length > MAX_TRAIL) trail.shift();
  });

  function drawTrail() {
    trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    for (let i = 0; i < trail.length; i++) {
      const t = trail[i];
      t.age++;
      const alpha = Math.max(0, 1 - t.age / MAX_TRAIL) * 0.5;
      const radius = (i / trail.length) * 6 + 1;
      trailCtx.beginPath();
      trailCtx.arc(t.x, t.y, radius, 0, Math.PI * 2);
      trailCtx.fillStyle = `rgba(0,212,255,${alpha})`;
      trailCtx.shadowColor = '#00d4ff';
      trailCtx.shadowBlur = 12;
      trailCtx.fill();
    }
    requestAnimationFrame(drawTrail);
  }

  /* ===================================================
     9. INIT
     =================================================== */
  window.addEventListener('resize', () => {
    resizeHeroCanvas();
    resizeDividerCanvas();
    trailCanvas.width = window.innerWidth;
    trailCanvas.height = window.innerHeight;
  });

  window.addEventListener('scroll', () => {
    handleParallaxScroll();
    handleNavbarScroll();
    handleDividerParallax();
  }, { passive: true });

  // Initial setup
  resizeHeroCanvas();
  resizeDividerCanvas();
  handleNavbarScroll();

  // Show loading state then begin
  preloadFrames(() => {
    drawHeroFrame(0);
    drawDividerFrame(0);
    lastDrawnFrame = 0;
    rafId = requestAnimationFrame(animate);
  });

  // Graceful fallback
  setTimeout(() => {
    if (!animationReady) {
      animationReady = true;
      if (!rafId) rafId = requestAnimationFrame(animate);
    }
  }, 3000);

  drawTrail();

  /* ===================================================
     10. BREATHING GRADIENT — autonomous, mouse softly distorts
     =================================================== */
  (function initLiquidBg() {
    const canvas = document.getElementById('liquid-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H;
    let targetX = 0.5, targetY = 0.5;
    let smoothX = 0.5, smoothY = 0.5;

    // Each orb breathes autonomously; mouse adds a tiny nudge
    const orbs = [
      { bx:0.18, by:0.22, r:0.55, color:[0,180,255],  a:0.22, speed:0.00018, phase:0,   influence:0.04 },
      { bx:0.82, by:0.35, r:0.50, color:[0,80,220],   a:0.18, speed:0.00022, phase:2.1, influence:0.03 },
      { bx:0.50, by:0.72, r:0.60, color:[0,212,255],  a:0.16, speed:0.00015, phase:4.2, influence:0.05 },
      { bx:0.25, by:0.80, r:0.40, color:[0,50,180],   a:0.14, speed:0.00028, phase:1.0, influence:0.02 },
      { bx:0.75, by:0.65, r:0.45, color:[0,160,255],  a:0.13, speed:0.00020, phase:3.3, influence:0.03 },
    ];

    document.addEventListener('mousemove', e => {
      targetX = e.clientX / W;
      targetY = e.clientY / H;
    });

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function draw(ts) {
      const t = ts * 0.001;
      // Very slow mouse lerp — subtle distortion only
      smoothX += (targetX - smoothX) * 0.012;
      smoothY += (targetY - smoothY) * 0.012;

      ctx.clearRect(0, 0, W, H);

      orbs.forEach(o => {
        // Autonomous breathing drift
        const drift  = Math.sin(t * o.speed * 1000 + o.phase);
        const drift2 = Math.cos(t * o.speed * 800  + o.phase + 1);
        // Breathing scale + alpha pulse
        const breathe = 1 + 0.10 * Math.sin(t * o.speed * 600 + o.phase + 2);
        const alphaPulse = o.a * (0.7 + 0.3 * Math.sin(t * o.speed * 400 + o.phase + 3));
        // Mouse adds only a tiny nudge on top of the autonomous motion
        const mx = o.bx + drift * 0.12 + (smoothX - 0.5) * o.influence;
        const my = o.by + drift2 * 0.10 + (smoothY - 0.5) * o.influence;
        const cx = mx * W, cy = my * H;
        const radius = o.r * breathe * Math.max(W, H);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        const [r, g2, b] = o.color;
        g.addColorStop(0,   `rgba(${r},${g2},${b},${alphaPulse})`);
        g.addColorStop(0.4, `rgba(${r},${g2},${b},${alphaPulse * 0.5})`);
        g.addColorStop(1,   `rgba(${r},${g2},${b},0)`);
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  })();

  /* ===================================================
     11. FULL-PAGE CIRCUIT BOARD BACKGROUND
     =================================================== */
  (function initCircuitBg() {
    const canvas = document.getElementById('circuit-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const NEON = 'rgba(0,212,255,', NEON2 = 'rgba(0,100,255,';
    let nodes = [], edges = [];

    function build() {
      nodes = []; edges = [];
      const W = canvas.width, H = canvas.height;
      const cols = 18, rows = 12, gx = W/cols, gy = H/rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() < 0.35) {
            nodes.push({
              x: gx*c+gx*0.5+(Math.random()-0.5)*gx*0.5,
              y: gy*r+gy*0.5+(Math.random()-0.5)*gy*0.5,
              r: Math.random()<0.18?3.5:1.6,
              bright: Math.random()<0.12, pad: Math.random()<0.2,
              pulse: Math.random()*Math.PI*2, pulseSpeed:0.015+Math.random()*0.025,
            });
          }
        }
      }
      const used = new Set();
      nodes.forEach((n,i) => {
        nodes.map((m,j)=>({j,d:Math.hypot(m.x-n.x,m.y-n.y)}))
          .filter(({j,d})=>j!==i&&d<100&&!used.has(i+'-'+j))
          .sort((a,b)=>a.d-b.d).slice(0,2+Math.floor(Math.random()*2))
          .forEach(({j})=>{
            used.add(i+'-'+j); used.add(j+'-'+i);
            edges.push({ a:nodes[i],b:nodes[j], corner:Math.random()<0.5?'h':'v',
              alpha:0.06+Math.random()*0.1,
              packet:Math.random()<0.12?{t:Math.random(),speed:0.002+Math.random()*0.004,dir:Math.random()<0.5?1:-1}:null });
          });
      });
    }

    function lPos(edge,t){
      const{a,b,corner}=edge,mx=corner==='h'?b.x:a.x,my=corner==='h'?a.y:b.y;
      const s1=Math.hypot(mx-a.x,my-a.y),s2=Math.hypot(b.x-mx,b.y-my),tot=(s1+s2)||1,d=t*tot;
      if(d<=s1){const r=s1?d/s1:0;return{x:a.x+(mx-a.x)*r,y:a.y+(my-a.y)*r};}
      const r=s2?(d-s1)/s2:0;return{x:mx+(b.x-mx)*r,y:my+(b.y-my)*r};
    }

    let lastDrawTime = 0;
    function draw(ts){
      if (ts - lastDrawTime < 33) { requestAnimationFrame(draw); return; }
      lastDrawTime = ts;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      edges.forEach(e=>{
        ctx.beginPath(); ctx.moveTo(e.a.x,e.a.y);
        if(e.corner==='h'){ctx.lineTo(e.b.x,e.a.y);ctx.lineTo(e.b.x,e.b.y);}
        else{ctx.lineTo(e.a.x,e.b.y);ctx.lineTo(e.b.x,e.b.y);}
        ctx.strokeStyle=NEON+e.alpha+')'; ctx.lineWidth=1; ctx.stroke();
        if(e.packet){
          const p=e.packet; p.t+=p.speed*p.dir;
          if(p.t>=1){p.t=1;p.dir=-1;} if(p.t<=0){p.t=0;p.dir=1;}
          const pos=lPos(e,p.t);
          const g=ctx.createRadialGradient(pos.x,pos.y,0,pos.x,pos.y,9);
          g.addColorStop(0,NEON+'1)');g.addColorStop(0.35,NEON2+'0.55)');g.addColorStop(1,'rgba(0,0,0,0)');
          ctx.beginPath();ctx.arc(pos.x,pos.y,9,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
          ctx.beginPath();ctx.arc(pos.x,pos.y,1.8,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,0.95)';ctx.fill();
        }
      });
      nodes.forEach(node=>{
        node.pulse+=node.pulseSpeed;
        const glow=0.5+0.5*Math.sin(node.pulse),alpha=node.bright?0.65+0.35*glow:0.18+0.12*glow;
        if(node.bright){
          const g=ctx.createRadialGradient(node.x,node.y,0,node.x,node.y,node.r*6);
          g.addColorStop(0,NEON+(alpha*0.9)+')');g.addColorStop(1,'rgba(0,0,0,0)');
          ctx.beginPath();ctx.arc(node.x,node.y,node.r*6,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
        }
        ctx.beginPath();ctx.arc(node.x,node.y,node.r,0,Math.PI*2);
        ctx.fillStyle=NEON+alpha+')';ctx.shadowColor='#00d4ff';ctx.shadowBlur=node.bright?12:5;
        ctx.fill();ctx.shadowBlur=0;
        if(node.pad){ctx.strokeStyle=NEON+(alpha*0.5)+')';ctx.lineWidth=0.8;ctx.strokeRect(node.x-5,node.y-5,10,10);}
      });
      requestAnimationFrame(draw);
    }

    function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;build();}
    resize();
    window.addEventListener('resize',resize);
    draw();
  })();

})();
