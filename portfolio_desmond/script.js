/* ============================================================
   DESMOND ZAMBOGUNAA — script.js
   ============================================================ */

/* ════════════════════════════════════════════════════════════
   0. SECURITY HARDENING
   ════════════════════════════════════════════════════════════ */

(function blockDevTools() {
  const threshold = 160;
  const check = () => {
    if (
      window.outerWidth  - window.innerWidth  > threshold ||
      window.outerHeight - window.innerHeight > threshold
    ) {
      document.body.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:monospace;color:#63d8ab;background:#080c10;font-size:1.1rem;">⚠ Unauthorised access attempt detected.</div>';
    }
  };
  window.addEventListener('resize', check);
})();

document.addEventListener('contextmenu', e => e.preventDefault());

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

function sanitise(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

let submitCount = 0;
const MAX_SUBMITS = 3;

/* ════════════════════════════════════════════════════════════
   1. SLIDE NAVIGATION SYSTEM
   ════════════════════════════════════════════════════════════ */

const SLIDE_DURATION = 600;
let isSliding = false;
let currentSectionId = 'hero';

const sectionOrder = Array.from(document.querySelectorAll('section[id]'))
  .map(s => s.getAttribute('id'));

function slideTo(targetId, direction = 'left') {
  if (isSliding || targetId === currentSectionId) return;
  isSliding = true;

  const currentSection = document.getElementById(currentSectionId);
  const targetSection  = document.getElementById(targetId);
  if (!currentSection || !targetSection) { isSliding = false; return; }

  const allSlideClasses = [
    'slide-exit-left', 'slide-exit-right',
    'slide-enter-from-right', 'slide-enter-from-left',
    'slide-active'
  ];
  allSlideClasses.forEach(c => {
    currentSection.classList.remove(c);
    targetSection.classList.remove(c);
  });

  targetSection.classList.add(
    direction === 'left' ? 'slide-enter-from-right' : 'slide-enter-from-left'
  );
  targetSection.classList.add('slide-active');

  void targetSection.offsetWidth;

  currentSection.classList.add(
    direction === 'left' ? 'slide-exit-left' : 'slide-exit-right'
  );

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      targetSection.classList.remove('slide-enter-from-right', 'slide-enter-from-left');
    });
  });

  setTimeout(() => {
    currentSection.classList.remove('slide-active', 'slide-exit-left', 'slide-exit-right');
    currentSectionId = targetId;
    isSliding = false;
    history.replaceState(null, '', '#' + targetId);
    triggerReveal(targetSection);
    updateNavActive(targetId);
    updateDots();
    updateArrows();
  }, SLIDE_DURATION);
}

function getDirection(fromId, toId) {
  return sectionOrder.indexOf(toId) > sectionOrder.indexOf(fromId) ? 'left' : 'right';
}

/* ════════════════════════════════════════════════════════════
   2. INITIALISE SECTIONS
   ════════════════════════════════════════════════════════════ */

function initSlides() {
  const hash = window.location.hash.replace('#', '');
  currentSectionId = sectionOrder.includes(hash) ? hash : 'hero';

  sectionOrder.forEach(id => {
    const sec = document.getElementById(id);
    if (!sec) return;
    sec.classList.add('slide-panel');
    if (id === currentSectionId) sec.classList.add('slide-active');
  });

  const startSec = document.getElementById(currentSectionId);
  if (startSec) triggerReveal(startSec);
}

/* ════════════════════════════════════════════════════════════
   3. PROGRESS DOTS + ARROW HINTS
   ════════════════════════════════════════════════════════════ */

const sectionLabels = {
  hero:        'Home',
  about:       'About',
  education:   'Education',
  skills:      'Skills',
  projects:    'Projects',
  internships: 'Internship',
  community:   'Volunteer',
  contact:     'Contact',
};

function buildDotsAndArrows() {
  const bar = document.createElement('div');
  bar.className = 'slide-progress';
  bar.setAttribute('aria-label', 'Page navigation');

  sectionOrder.forEach(id => {
    const dot = document.createElement('button');
    dot.className = 'slide-dot';
    dot.dataset.target = id;
    dot.setAttribute('aria-label', sectionLabels[id] || id);
    dot.title = sectionLabels[id] || id;
    if (id === currentSectionId) dot.classList.add('active');
    dot.addEventListener('click', () => {
      slideTo(id, getDirection(currentSectionId, id));
    });
    bar.appendChild(dot);
  });

  document.body.appendChild(bar);

  const prevBtn = document.createElement('button');
  prevBtn.className = 'slide-hint prev';
  prevBtn.innerHTML = '&#8592;';
  prevBtn.setAttribute('aria-label', 'Previous section');
  prevBtn.addEventListener('click', () => {
    const idx = sectionOrder.indexOf(currentSectionId);
    if (idx > 0) slideTo(sectionOrder[idx - 1], 'right');
  });

  const nextBtn = document.createElement('button');
  nextBtn.className = 'slide-hint next';
  nextBtn.innerHTML = '&#8594;';
  nextBtn.setAttribute('aria-label', 'Next section');
  nextBtn.addEventListener('click', () => {
    const idx = sectionOrder.indexOf(currentSectionId);
    if (idx < sectionOrder.length - 1) slideTo(sectionOrder[idx + 1], 'left');
  });

  document.body.appendChild(prevBtn);
  document.body.appendChild(nextBtn);

  updateArrows();
}

function updateDots() {
  document.querySelectorAll('.slide-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.target === currentSectionId);
  });
}

function updateArrows() {
  const idx = sectionOrder.indexOf(currentSectionId);
  const prev = document.querySelector('.slide-hint.prev');
  const next = document.querySelector('.slide-hint.next');
  if (prev) prev.classList.toggle('hidden', idx === 0);
  if (next) next.classList.toggle('hidden', idx === sectionOrder.length - 1);
}

/* ════════════════════════════════════════════════════════════
   4. KEYBOARD NAVIGATION
   ════════════════════════════════════════════════════════════ */

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    const idx = sectionOrder.indexOf(currentSectionId);
    if (idx < sectionOrder.length - 1) slideTo(sectionOrder[idx + 1], 'left');
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    const idx = sectionOrder.indexOf(currentSectionId);
    if (idx > 0) slideTo(sectionOrder[idx - 1], 'right');
  }
});

/* ════════════════════════════════════════════════════════════
   5. TOUCH / SWIPE SUPPORT
   ════════════════════════════════════════════════════════════ */
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;
  const idx = sectionOrder.indexOf(currentSectionId);
  if (dx < 0 && idx < sectionOrder.length - 1) slideTo(sectionOrder[idx + 1], 'left');
  else if (dx > 0 && idx > 0) slideTo(sectionOrder[idx - 1], 'right');
}, { passive: true });

/* ════════════════════════════════════════════════════════════
   6. NAV LINK WIRING
   ════════════════════════════════════════════════════════════ */

function wireNavLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href').replace('#', '');
      if (!sectionOrder.includes(targetId)) return;
      e.preventDefault();
      slideTo(targetId, getDirection(currentSectionId, targetId));
    });
  });
}

/* ════════════════════════════════════════════════════════════
   7. NAV ACTIVE STATE
   ════════════════════════════════════════════════════════════ */

function updateNavActive(activeId) {
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.style.color = '';
    link.classList.remove('nav-active');
    if (link.getAttribute('href') === '#' + activeId) {
      link.style.color = 'var(--accent)';
      link.classList.add('nav-active');
    }
  });
}

/* ════════════════════════════════════════════════════════════
   8. SCROLL REVEAL (within-section stagger)
   ════════════════════════════════════════════════════════════ */

function triggerReveal(container) {
  setTimeout(() => {
    container.querySelectorAll('.reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 70);
    });
  }, 80);
}

/* ════════════════════════════════════════════════════════════
   9. CURSOR GLOW
   ════════════════════════════════════════════════════════════ */
const glow = document.getElementById('glow');

document.addEventListener('mousemove', e => {
  glow.style.left = e.clientX + 'px';
  glow.style.top  = e.clientY + 'px';
});

/* ════════════════════════════════════════════════════════════
   10. CONTACT FORM SUBMIT
   ════════════════════════════════════════════════════════════ */
function handleSubmit(e) {
  e.preventDefault();

  if (submitCount >= MAX_SUBMITS) {
    alert('Too many submissions. Please try again later.');
    return;
  }

  const honeypot = e.target.querySelector('[name="honeypot"]');
  if (honeypot && honeypot.value !== '') return;

  const nameVal    = sanitise(e.target.querySelector('[placeholder="Your name"]').value.trim());
  const emailVal   = sanitise(e.target.querySelector('[type="email"]').value.trim());
  const messageVal = sanitise(e.target.querySelector('.form-textarea').value.trim());

  if (nameVal.length > 120 || emailVal.length > 254 || messageVal.length > 2000) {
    alert('One or more fields exceed the maximum allowed length.');
    return;
  }

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
    setTimeout(() => { btn.textContent = 'Send Message →'; }, 3000);
  }, 1200);
}

/* ════════════════════════════════════════════════════════════
   11. TYPING EFFECT
   ════════════════════════════════════════════════════════════ */
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

/* ════════════════════════════════════════════════════════════
   12. BOOT
   ════════════════════════════════════════════════════════════ */
initSlides();
buildDotsAndArrows();
wireNavLinks();
updateNavActive(currentSectionId);