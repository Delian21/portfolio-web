/* ============================================================
   Portfolio — Main Script
   ----------------------------------------------------------------
   Contact form handling.

   DELIVERY: The form POSTs to a Formspree endpoint. To activate
   it, create a free form at https://formspree.io, then replace
   FORMSPREE_FORM_ID below with your form ID (e.g. "xwkgabcd").

   FALLBACK: If the endpoint isn't configured (or the network
   request fails), the form opens the visitor's mail client with
   a pre-filled message addressed to the site owner.
   ============================================================ */

const CONTACT_EMAIL = 'okechukwua06@gmail.com';

// Replace with your Formspree form ID to enable direct delivery.
// Leave as null to always use the mailto: fallback.
const FORMSPREE_FORM_ID = 'xeaoqwqj';

// ----------------------------------------------------------------
// Spam protection
//   1. Honeypot: a "Company" input hidden from humans. Bots that
//      autofill every field get caught and the send is silently
//      dropped (we fake success so bots don't adapt).
//   2. Time trap: submissions faster than MIN_FILL_SECONDS are
//      treated as bots — humans can't complete the form that fast.
// ----------------------------------------------------------------
const MIN_FILL_SECONDS = 3;
let formOpenedAt = 0;

function initContactForm() {
  const form = document.getElementById('contact-form');
  // The form lives in a partial injected by js/includes.js; that script
  // dispatches 'partials:loaded' once injection finishes, so if the form
  // isn't in the DOM yet we wait for that event instead.
  if (!form) {
    document.addEventListener('partials:loaded', initContactForm, { once: true });
    return;
  }
  if (form.dataset.bound) return; // guard against double-binding
  form.dataset.bound = 'true';

  // Start the time-trap clock as soon as the user interacts with
  // the form (focus or input on any field).
  formOpenedAt = Date.now();
  form.addEventListener('focusin', () => {
    if (!formOpenedAt) formOpenedAt = Date.now();
  }, { once: true });

  const submitBtn = document.getElementById('contact-submit');
  const submitLabel = document.getElementById('contact-submit-label');

  // "Something else" service: show a brief-description field only when
  // that option is selected, and make it required while visible.
  const serviceSelect = document.getElementById('contact-service');
  const otherWrap = document.getElementById('service-other-wrap');
  const otherInput = document.getElementById('contact-service-other');
  if (serviceSelect && otherWrap && otherInput) {
    serviceSelect.addEventListener('change', () => {
      const isOther = serviceSelect.value === 'other';
      otherWrap.classList.toggle('hidden', !isOther);
      otherInput.required = isOther;
      if (!isOther) otherInput.value = '';
    });
  }

  // ----------------------------------------------------------------
  // Email domain autocomplete: once the visitor types "@", suggest
  // common providers filtered by what they've typed after it.
  // Pick with mouse, arrow keys + Enter, or Tab. Dismiss with Esc
  // or by deleting the "@". Purely client-side; no data leaves the page.
  // ----------------------------------------------------------------
  const EMAIL_DOMAINS = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
    'icloud.com', 'proton.me', 'aol.com', 'live.com',
    'mail.com', 'zoho.com', 'yandex.com', 'gmx.com'
  ];
  let hideEmailSuggestions = null; // set below; used by showSuccess()
  const emailInput = document.getElementById('contact-email');
  if (emailInput) {
    // Suggestion list lives right below the email input, absolutely positioned.
    const list = document.createElement('ul');
    list.id = 'email-suggestions';
    list.className = 'email-suggestions';
    list.setAttribute('role', 'listbox');
    emailInput.setAttribute('autocomplete', 'email');
    emailInput.setAttribute('aria-autocomplete', 'list');
    emailInput.insertAdjacentElement('afterend', list);

    let activeIndex = -1; // highlighted suggestion; -1 = none

    function currentDomainQuery(value) {
      const at = value.lastIndexOf('@');
      if (at === -1) return null;
      return { at, typed: value.slice(at + 1) };
    }

    function matches(value) {
      const q = currentDomainQuery(value);
      if (!q) return [];
      const typed = q.typed.toLowerCase();
      // Show all domains right after "@", then filter as they type.
      return EMAIL_DOMAINS.filter(d => d.startsWith(typed)).slice(0, 6);
    }

    function hide() {
      list.classList.remove('show');
      list.innerHTML = '';
      activeIndex = -1;
      emailInput.removeAttribute('aria-activedescendant');
    }

    function apply(domain) {
      const q = currentDomainQuery(emailInput.value);
      if (!q) return;
      emailInput.value = emailInput.value.slice(0, q.at + 1) + domain;
      hide();
      emailInput.focus();
      // Put the caret at the end so typing continues smoothly.
      emailInput.setSelectionRange(emailInput.value.length, emailInput.value.length);
    }

    function render() {
      const items = matches(emailInput.value);
      if (items.length === 0) { hide(); return; }
      const q = currentDomainQuery(emailInput.value);
      const typed = q.typed.toLowerCase();
      // A full domain already typed (e.g. "test@gmail.com") needs no help.
      if (typed && EMAIL_DOMAINS.includes(typed)) { hide(); return; }
      list.innerHTML = '';
      items.forEach((d, i) => {
        const li = document.createElement('li');
        li.id = `email-suggestion-${i}`;
        li.setAttribute('role', 'option');
        // Highlight the part the user hasn't typed yet (the completion).
        li.innerHTML = `@${d.slice(0, typed.length)}<span class="suggest-hint">${d.slice(typed.length)}</span>`;
        li.addEventListener('mousedown', (e) => {
          // mousedown (not click) so the input doesn't blur before we apply.
          e.preventDefault();
          apply(d);
        });
        list.appendChild(li);
      });
      list.classList.add('show');
    }

    function highlight(index) {
      const items = [...list.children];
      if (!items.length) return;
      activeIndex = (index + items.length) % items.length;
      items.forEach((li, i) => li.classList.toggle('active', i === activeIndex));
      emailInput.setAttribute('aria-activedescendant', items[activeIndex].id);
    }

    emailInput.addEventListener('input', () => {
      activeIndex = -1;
      render();
    });

    emailInput.addEventListener('keydown', (e) => {
      const open = list.classList.contains('show');
      if (!open) return;
      const count = list.children.length;
      if (e.key === 'ArrowDown') { e.preventDefault(); highlight(activeIndex + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); highlight(activeIndex - 1); }
      else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        apply(list.children[activeIndex].textContent.replace('@', ''));
      } else if (e.key === 'Tab' && activeIndex >= 0) {
        // Tab accepts the highlighted completion but still moves focus on.
        apply(list.children[activeIndex].textContent.replace('@', ''));
      } else if (e.key === 'Escape') {
        hide();
      }
    });

    emailInput.addEventListener('blur', () => setTimeout(hide, 120));
    // form.reset() clears the input without firing an "input" event,
    // so close the dropdown explicitly after resets and successful sends.
    form.addEventListener('reset', hide);
    form.addEventListener('submit', hide);
    hideEmailSuggestions = hide;
  }

  function effectiveService(data) {
    // Replace the generic 'other' value with the visitor's brief so the
    // notification and email subject stay meaningful.
    if (data.service === 'other' && data.service_other) {
      return data.service_other;
    }
    return data.service;
  }

  function setSubmitting(isSubmitting) {
    if (submitBtn) submitBtn.disabled = isSubmitting;
    if (submitLabel) {
      submitLabel.textContent = isSubmitting ? 'Sending...' : 'Send Inquiry';
    }
  }

  function buildMailto(data, service) {
    const subject = `Portfolio inquiry: ${service} — ${data.name}`;
    const body = [
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Service: ${service}`,
      '',
      data.message
    ].join('\n');
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function showSuccess() {
    showToast('Message sent — thank you! I\'ll get back to you at ' + CONTACT_EMAIL + ' shortly.');
    form.reset();
    formOpenedAt = 0; // restart the time-trap clock for the next submission
    // Close the email autocomplete and fold the "Something else" field
    // back to its default hidden state (reset() restores markup defaults,
    // but our toggles were made via JS, not markup).
    hideEmailSuggestions?.();
    if (otherWrap && otherInput && serviceSelect) {
      otherWrap.classList.add('hidden');
      otherInput.required = false;
    }
  }

  function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) {
      // Toast element missing (e.g. stale index.html) — fall back to alert.
      alert(message);
      return;
    }
    toast.textContent = message;
    toast.classList.toggle('toast-error', isError);
    toast.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.remove('show'), 5000);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Native HTML5 validation (novalidate is set so we control timing).
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());

    // --- Spam checks (run before any network request) ---

    // 1. Honeypot filled in → almost certainly a bot. Pretend it
    //    succeeded so bots don't learn the form is protected.
    if (data.company) {
      console.info('[contact] Honeypot triggered — submission dropped.');
      showSuccess();
      return;
    }

    // 2. Too fast → likely a bot script. Same silent-drop behavior.
    const fillSeconds = (Date.now() - formOpenedAt) / 1000;
    if (formOpenedAt && fillSeconds < MIN_FILL_SECONDS) {
      console.info(`[contact] Filled in ${fillSeconds.toFixed(1)}s — below ${MIN_FILL_SECONDS}s minimum, treated as spam.`);
      showSuccess();
      return;
    }

    // Never send the honeypot field to the endpoint.
    delete data.company;

    // Fold the "Something else" brief into the reported service.
    const service = effectiveService(data);
    delete data.service_other;

    setSubmitting(true);

    try {
      if (FORMSPREE_FORM_ID) {
        const res = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ ...data, service })
        });
        if (!res.ok) throw new Error(`Formspree responded ${res.status}`);
        showSuccess();
        return;
      }

      // No endpoint configured — mailto fallback.
      window.location.href = buildMailto(data, service);
      showSuccess();
    } catch (err) {
      console.error('[contact] Delivery failed:', err);
      showToast(
        `Sorry, something went wrong sending your message. ` +
        `Please email me directly at ${CONTACT_EMAIL} and I'll get right back to you.`,
        true
      );
    } finally {
      setSubmitting(false);
    }
  }

  form.addEventListener('submit', handleSubmit);
}

// Start as soon as the DOM is ready; initContactForm waits for
// 'partials:loaded' internally if the form partial hasn't landed yet.
document.addEventListener('DOMContentLoaded', initContactForm);

// ============================================================
// Header: compact on scroll down, restore on scroll up.
// The header is sticky; instead of sliding away it shrinks — the
// inner row loses height and the tagline fades out — while the
// visitor scrolls down, and expands back when they scroll up.
//
// Flicker prevention (the header used to "struggle" on slow
// scrolls): three guards work together.
//   1. Run-length switching — a state change requires ~14px of
//      committed movement in ONE direction, so trackpad momentum
//      jitter (+5/-5 alternating) can't flip the state every frame.
//   2. Hysteresis thresholds — compacting needs y > 140, restoring
//      happens below 100 or on a committed up-run; there is no
//      single edge where both states fight.
//   3. lastY updates on every event — so slow scrolls are tracked
//      accurately instead of accumulating against a stale anchor.
// Guard 2 also breaks the layout-shift feedback loop near the
// bottom of the page (compact shrinks the document, the browser
// clamps scrollY, the clamp looks like an up-scroll).
// ============================================================
function initHeaderScroll() {
  const header = document.querySelector('header');
  if (!header) {
    // Header partial not injected yet — wait like initContactForm does.
    document.addEventListener('partials:loaded', initHeaderScroll, { once: true });
    return;
  }

  header.classList.add('scroll-compact-enabled');

  let lastY = window.scrollY;
  let ticking = false;
  let mode = 'expanded';
  let runDown = 0; // px of committed downward movement
  let runUp = 0;   // px of committed upward movement

  const COMPACT_THRESHOLD = 140; // must be past this to compact at all
  const RESTORE_THRESHOLD = 100; // always expanded near the top
  const DELTA = 4;               // ignore micro-scrolls entirely
  const SWITCH_PX = 14;          // committed movement needed to switch state

  function setMode(next) {
    if (mode === next) return;
    mode = next;
    header.classList.toggle('is-compact', next === 'compact');
  }

  function update() {
    ticking = false;
    const y = window.scrollY;
    const diff = y - lastY;
    lastY = y; // track on every event — no stale-anchor accumulation

    if (Math.abs(diff) < DELTA) return;

    if (diff > 0) {
      runDown += diff;
      runUp = 0;
    } else {
      runUp -= diff;
      runDown = 0;
    }

    // Near the top: always expanded, regardless of direction.
    if (y <= RESTORE_THRESHOLD) {
      setMode('expanded');
      return;
    }

    if (runDown >= SWITCH_PX && y > COMPACT_THRESHOLD) {
      setMode('compact');
    } else if (runUp >= SWITCH_PX) {
      setMode('expanded');
    }
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
}

initHeaderScroll();

// ============================================================
// Floating action button (FAB): toggles the section-link fan.
// Clicking the trigger opens/closes the actions; clicking a link
// or anywhere else on the page (or pressing Esc) closes it. The
// actions are inert while closed (tabindex=-1, pointer-events:
// none) so keyboard users can't land on hidden links.
// ============================================================
function initFab() {
  const root = document.getElementById('fab');
  const trigger = document.getElementById('fab-trigger');
  if (!root || !trigger) return;

  const actions = [...root.querySelectorAll('.fab-action')];

  function setOpen(open) {
    root.classList.toggle('fab-open', open);
    trigger.setAttribute('aria-expanded', String(open));
    trigger.setAttribute('aria-label', open ? 'Close section navigation' : 'Open section navigation');
    actions.forEach(a => a.setAttribute('tabindex', open ? '0' : '-1'));
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!root.classList.contains('fab-open'));
  });

  // Close after choosing a destination, and when clicking elsewhere.
  actions.forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('click', (e) => {
    if (root.classList.contains('fab-open') && !root.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('fab-open')) setOpen(false);
  });
}

initFab();

// ============================================================
// Active-section highlighting: as the visitor scrolls, highlight
// the nav link whose section is currently in view. Applies to
// desktop header links and (when enabled) the side rail.
// ============================================================
function initScrollSpy() {
  const first = document.getElementById('work');
  if (!first) {
    // Sections live in partials injected by js/includes.js — wait for
    // its 'partials:loaded' event like initContactForm does.
    document.addEventListener('partials:loaded', initScrollSpy, { once: true });
    return;
  }

  const sections = ['work', 'skills', 'experience', 'about', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  if (!sections.length) return;

  const links = [...document.querySelectorAll('.header-link')];
  if (!links.length) return;

  const spy = () => {
    const probe = window.innerHeight * 0.35; // focus line ~35% down the viewport
    let current = null;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= probe) current = section;
      else break; // sections are in DOM order
    }
    links.forEach(link => {
      link.classList.toggle('is-active', !!current && link.getAttribute('href') === `#${current.id}`);
    });
  };

  window.addEventListener('scroll', spy, { passive: true });
  spy();
}

initScrollSpy();
