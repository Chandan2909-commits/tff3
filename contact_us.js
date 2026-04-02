/* ============================================================
   THE FUSION FUNDED — contact_us.js
   Standalone JS for the Contact Us page.
   Mirrors interaction patterns from the main app.js.
   ============================================================ */

/* ---- Neon Cursor Trail (matches main site) ---- */
(function initCursorTrail() {
  const trailCanvas = document.createElement('canvas');
  trailCanvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:9999;width:100%;height:100%;';
  document.body.appendChild(trailCanvas);
  const trailCtx = trailCanvas.getContext('2d');

  function resizeTrail() {
    trailCanvas.width  = window.innerWidth;
    trailCanvas.height = window.innerHeight;
  }
  resizeTrail();
  window.addEventListener('resize', resizeTrail);

  const trail = [];
  const MAX_TRAIL = 18;

  document.addEventListener('mousemove', (e) => {
    trail.push({ x: e.clientX, y: e.clientY, age: 0 });
    if (trail.length > MAX_TRAIL) trail.shift();
  });

  function drawTrail() {
    trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    for (let i = 0; i < trail.length; i++) {
      const t = trail[i];
      t.age++;
      const alpha  = Math.max(0, 1 - t.age / MAX_TRAIL) * 0.5;
      const radius = (i / trail.length) * 6 + 1;
      trailCtx.beginPath();
      trailCtx.arc(t.x, t.y, radius, 0, Math.PI * 2);
      trailCtx.fillStyle   = `rgba(0,212,255,${alpha})`;
      trailCtx.shadowColor = '#00d4ff';
      trailCtx.shadowBlur  = 12;
      trailCtx.fill();
    }
    requestAnimationFrame(drawTrail);
  }
  drawTrail();
})();

/* ---- Navbar scroll effect ---- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

/* ---- Hamburger / Mobile Menu ---- */
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
   GLOBAL LIQUID GRADIENT BG — autonomous, mouse softly distorts
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

/* ---- Scroll Reveal ---- */
(function initReveal() {
  const els = document.querySelectorAll('[data-reveal], [data-reveal-right]');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  els.forEach(el => io.observe(el));
})();

/* ---- Contact Form Submission ---- */
(function initForm() {
  const form     = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  const submitBtn= document.getElementById('btn-submit');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    feedback.className = 'form-feedback';
    feedback.textContent = '';

    // Basic validation
    const firstName = form.first_name.value.trim();
    const lastName  = form.last_name.value.trim();
    const email     = form.email.value.trim();
    const message   = form.message.value.trim();

    if (!firstName || !lastName || !email || !message) {
      feedback.textContent = '⚠ Please fill in all required fields.';
      feedback.classList.add('error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      feedback.textContent = '⚠ Please enter a valid email address.';
      feedback.classList.add('error');
      return;
    }

    // Simulate submission (replace this block with your real API call)
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Sending…';

    await new Promise(r => setTimeout(r, 1400)); // simulate network

    /*
    // Example: real API call
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, subject: form.subject.value, message }),
    });
    if (!res.ok) throw new Error('Server error');
    */

    submitBtn.disabled = false;
    submitBtn.querySelector('span').textContent = 'Send Message';

    feedback.textContent = '✓ Thank you! Your message has been sent. We\'ll be in touch within 50 seconds.';
    feedback.classList.add('success');
    form.reset();
  });
})();
