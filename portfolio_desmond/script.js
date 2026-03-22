/* ============================================================
   DESMOND ZAMBOGUNAA — script.js
   ============================================================ */

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
   4. CONTACT FORM SUBMIT (with honeypot bot protection)
   ------------------------------------------------------------ */
function handleSubmit(e) {
  e.preventDefault();

  // Honeypot check — bots fill hidden fields, humans don't
  const honeypot = e.target.querySelector('[name="honeypot"]');
  if (honeypot && honeypot.value !== '') return;

  const btn = document.getElementById('submit-btn');
  btn.textContent = 'Sending...';
  btn.style.opacity = '0.7';

  setTimeout(() => {
    btn.textContent = 'Message Sent ✓';
    btn.style.opacity = '1';
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