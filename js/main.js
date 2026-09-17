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
