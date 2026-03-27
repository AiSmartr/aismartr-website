/* ============================================================
   AI SMARTR — Shared JavaScript
   ============================================================ */

/* ── Navigation scroll effect ──────────────────────────────── */
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
}

/* ── Mobile nav toggle ──────────────────────────────────────── */
const mobileBtn  = document.querySelector('.nav-mobile-btn');
const navLinks   = document.querySelector('.nav-links');
if (mobileBtn && navLinks) {
  mobileBtn.addEventListener('click', () => {
    mobileBtn.classList.toggle('open');
    navLinks.classList.toggle('mobile-open');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileBtn.classList.remove('open');
      navLinks.classList.remove('mobile-open');
    });
  });
}

/* ── Active nav link ────────────────────────────────────────── */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

/* ── Intersection Observer — fade-up animations ─────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

/* ── Hero Canvas Particles ──────────────────────────────────── */
const canvas = document.getElementById('hero-canvas');
if (canvas) {
  const ctx    = canvas.getContext('2d');
  let particles = [];
  let animId;

  const resize = () => {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const PARTICLE_COUNT = 60;
  const MAX_DIST       = 140;

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x  = Math.random() * canvas.width;
      this.y  = initial ? Math.random() * canvas.height : canvas.height + 10;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = -(Math.random() * 0.4 + 0.1);
      this.r  = Math.random() * 1.5 + 0.5;
      this.a  = Math.random() * 0.6 + 0.2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y < -10 || this.x < -20 || this.x > canvas.width + 20) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 180, 255, ${this.a})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  const drawLines = () => {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 180, 255, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  };

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    animId = requestAnimationFrame(animate);
  };
  animate();
}

/* ── Animated counter ───────────────────────────────────────── */
const counters = document.querySelectorAll('[data-count]');
if (counters.length) {
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el    = entry.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const dur    = 1800;
        let start    = null;
        const step   = (ts) => {
          if (!start) start = ts;
          const pct  = Math.min((ts - start) / dur, 1);
          const ease = 1 - Math.pow(1 - pct, 3);
          el.textContent = Math.floor(ease * target) + suffix;
          if (pct < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        countObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => countObserver.observe(c));
}

/* ── Contact Form ───────────────────────────────────────────── */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn  = contactForm.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Message Sent!';
    btn.style.background = 'linear-gradient(135deg, #00C853, #00A040)';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      btn.disabled = false;
      contactForm.reset();
    }, 4000);
  });
}
