/* ============================================================
   DESMOND ZAMBOGUNAA — script.js
   ============================================================ */

/* ════════════════════════════════════════════════════════════
   0. SECURITY HARDENING
   ════════════════════════════════════════════════════════════ */

// ── 0a. Block DevTools snooping (production deterrent) ──────
(function blockDevTools() {
  const threshold = 160;
  const check = () => {
    if (
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold
    ) {
      document.body.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:monospace;color:#63d8ab;background:#080c10;font-size:1.1rem;">⚠ Unauthorised access attempt detected.</div>';
    }
  };
  window.addEventListener('resize', check);
})();

// ── 0b. Disable right-click context menu ────────────────────
document.addEventListener('contextmenu', e => e.preventDefault());

// ── 0c. Block common keyboard shortcuts (F12, Ctrl+U, Ctrl+Shift+I/J/C) ──
document.addEventListener('keydown', e => {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.key === 'u') ||
    (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))
  ) {
    e.preventDefault();
    return false;
  }
});

// ── 0d. Sanitise any user-supplied string before DOM insertion ──
function sanitise(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── 0e. Rate-limit form submissions (max 3 per session) ─────
let submitCount = 0;
const MAX_SUBMITS = 3;

/* ------------------------------------------------------------
   1. CURSOR GLOW
   ------------------------------------------------------------ */
const glow = document.getElementById('glow');

document.addEventListener('mousemove', (e) => {
  glow.style.left = e.clientX + 'px';
  glow.style.top  = e.clientY + 'px';
});

/* ------------------------------------------------------------
   2. SCROLL REVEAL
   ------------------------------------------------------------ */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

revealElements.forEach(el => revealObserver.observe(el));

/* ------------------------------------------------------------
   3. NAV ACTIVE STATE
   ------------------------------------------------------------ */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';

  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) {
      current = sec.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.style.color = '';
    if (link.getAttribute('href') === '#' + current) {
      link.style.color = 'var(--accent)';
    }
  });
});

/* ------------------------------------------------------------
   4. CONTACT FORM SUBMIT (honeypot + rate-limit + validation)
   ------------------------------------------------------------ */
function handleSubmit(e) {
  e.preventDefault();

  // Rate-limit: block after MAX_SUBMITS per session
  if (submitCount >= MAX_SUBMITS) {
    alert('Too many submissions. Please try again later.');
    return;
  }

  // Honeypot check — bots fill hidden fields, humans don't
  const honeypot = e.target.querySelector('[name="honeypot"]');
  if (honeypot && honeypot.value !== '') return;

  // Grab & sanitise inputs
  const nameVal    = sanitise(e.target.querySelector('[placeholder="Your name"]').value.trim());
  const emailVal   = sanitise(e.target.querySelector('[type="email"]').value.trim());
  const messageVal = sanitise(e.target.querySelector('.form-textarea').value.trim());

  // Length guards (prevent payload stuffing)
  if (nameVal.length > 120 || emailVal.length > 254 || messageVal.length > 2000) {
    alert('One or more fields exceed the maximum allowed length.');
    return;
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(emailVal)) {
    alert('Please enter a valid email address.');
    return;
  }

  submitCount++;

  const btn = document.getElementById('submit-btn');
  btn.textContent = 'Sending...';
  btn.style.opacity = '0.7';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = 'Message Sent ✓';
    btn.style.opacity = '1';
    btn.disabled = false;
    e.target.reset();
    setTimeout(() => {
      btn.textContent = 'Send Message →';
    }, 3000);
  }, 1200);
}

/* ------------------------------------------------------------
   5. TYPING EFFECT
   ------------------------------------------------------------ */
const roleEl = document.querySelector('.hero-role');

if (roleEl) {
  const fullText   = roleEl.innerHTML;
  roleEl.innerHTML = '';
  let charIndex    = 0;

  const type = () => {
    if (charIndex <= fullText.length) {
      const cursor = charIndex < fullText.length
        ? '<span style="color: var(--accent);">|</span>'
        : '';
      roleEl.innerHTML = fullText.slice(0, charIndex) + cursor;
      charIndex++;
      setTimeout(type, 35);
    }
  };

  setTimeout(type, 800);
}