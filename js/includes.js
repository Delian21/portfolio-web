/* ============================================================
   Portfolio — HTML Include Loader
   ----------------------------------------------------------------
   Loads section partials from /partials/*.html into elements
   marked with a `data-include` attribute.

   Usage (in index.html):
     <div data-include="partials/header.html"></div>

   Requires being served over HTTP (VS Code Live Server, python
   -m http.server, GitHub Pages, etc.) — file:// will block the
   fetch() calls due to CORS.
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  const slots = document.querySelectorAll('[data-include]');
  await Promise.all(
    Array.from(slots).map(async (slot) => {
      try {
        const res = await fetch(slot.dataset.include);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        slot.innerHTML = await res.text();
        // Fade the section in once its content is in place.
        slot.classList.add('is-loaded');
      } catch (err) {
        console.error(`[includes] Failed to load "${slot.dataset.include}":`, err);
        slot.innerHTML = `<p style="color:#ffb4ab">Failed to load section: ${slot.dataset.include}</p>`;
        // Still reveal the slot so the error message is visible.
        slot.classList.add('is-loaded');
      }
    })
  );
  // Signal to other scripts (e.g. the contact form binder in
  // main.js) that all partial content is now in the DOM.
  document.dispatchEvent(new CustomEvent('partials:loaded'));
});
