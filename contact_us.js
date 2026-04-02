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
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const overlay    = document.getElementById('mobile-menu-overlay');

function openMobileMenu() {
  mobileMenu.classList.add('open');
  overlay.classList.add('open');
  hamburger.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  overlay.classList.remove('open');
  hamburger.classList.remove('open');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
});

overlay.addEventListener('click', closeMobileMenu);

document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', closeMobileMenu));

/* ---- Hero canvas — animated particle grid ---- */
(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildParticles();
  }

  function buildParticles() {
    const count = Math.floor((W * H) / 14000);
    particles = Array.from({ length: count }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r:  Math.random() * 1.5 + 0.5,
      a:  Math.random(),
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,212,255,${0.12 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${p.a * 0.7})`;
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });

    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize);
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
