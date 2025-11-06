/* assets/js/testimonials-modal.js */
(function () {
  // Idempotent init guard
  if (window.__AAK_TSMODAL_INIT__) return;
  window.__AAK_TSMODAL_INIT__ = true;

  // Utils
  const qs  = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const setHidden = (el, hidden) => el && el.setAttribute('aria-hidden', hidden ? 'true' : 'false');

  const veil   = qs('#mdVeil');
  const headEl = qs('#mdHead');
  const bodyEl = qs('#mdBody');
  if (!veil || !headEl || !bodyEl) return; // fail-safe

  const dialog  = veil.querySelector('.md-dialog');
  const closeBtn = veil.querySelector('.md-close');

  let lastFocused = null;

  function openModal(htmlHead, fullText) {
    // Inject content
    headEl.innerHTML = htmlHead || '';
    bodyEl.textContent = ''; // clear
    bodyEl.textContent = fullText || '';

    // Show + lock scroll
    lastFocused = document.activeElement;
    document.body.style.overflow = 'hidden';
    setHidden(veil, false);

    if (dialog) dialog.setAttribute('tabindex', '-1');
    dialog && dialog.focus();
  }

  function closeModal() {
    setHidden(veil, true);
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  function handleKeydown(e) {
    if (veil.getAttribute('aria-hidden') === 'true') return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key === 'Tab') {
      const focusables = qsa('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])', dialog)
        .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last  = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function handleVeilClick(e) {
    if (e.target === veil) closeModal();
  }

  function extractHeadHTML(card) {
    const headTpl = card.querySelector('template.tm-full-head');
    if (headTpl) {
      // Prefer template.content; fallback to innerHTML/textContent
      if (headTpl.content && headTpl.content.firstElementChild) {
        return headTpl.content.firstElementChild.outerHTML;
      }
      if (headTpl.content) {
        return headTpl.content.textContent || '';
      }
      return headTpl.innerHTML || '';
    }
    const tsHead = card.querySelector('.ts-head');
    return tsHead ? tsHead.outerHTML : '';
  }

  function extractBodyText(card) {
    const bodyTpl = card.querySelector('template.tm-full');
    if (bodyTpl) {
      // Use textContent to preserve line breaks (white-space: pre-line in CSS)
      if (bodyTpl.content) return bodyTpl.content.textContent || '';
      return bodyTpl.textContent || '';
    }
    const excerpt = card.querySelector('.ts-excerpt');
    return excerpt ? excerpt.textContent : '';
  }

  function handleRailClick(e) {
    const btn = e.target.closest('.ts-open');
    if (!btn) return;
    const card = btn.closest('.ts-card');
    if (!card) return;

    const htmlHead = extractHeadHTML(card);
    const fullText = extractBodyText(card);
    openModal(htmlHead, fullText);
  }

  // Smooth scroll helpers for arrows
  function getCardWidth(rail){
    const card = rail.querySelector('.ts-card');
    return card ? card.getBoundingClientRect().width + 20 /*gap*/ : 320;
  }
  function updateArrows(rail){
    const wrap = rail.closest('.ts-wrap');
    const prev = wrap?.querySelector('.ts-prev');
    const next = wrap?.querySelector('.ts-next');
    if(!prev || !next) return;
    const max = rail.scrollWidth - rail.clientWidth - 1;
    prev.disabled = rail.scrollLeft <= 2;
    next.disabled = rail.scrollLeft >= max;
  }
  function snapToNearest(rail){
    const cardW = getCardWidth(rail);
    const target = Math.round(rail.scrollLeft / cardW) * cardW;
    rail.scrollTo({ left: target, behavior: 'smooth' });
  }

  // Bindings
  qsa('.ts-rail').forEach(rail => {
    rail.addEventListener('click', handleRailClick, { passive: true });
    rail.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.ts-open')) {
        e.preventDefault();
        e.target.click();
      }
    });
    // Arrows
    const wrap = rail.closest('.ts-wrap');
    const prev = wrap?.querySelector('.ts-prev');
    const next = wrap?.querySelector('.ts-next');
    if(prev && next){
      const step = () => getCardWidth(rail);
      prev.addEventListener('click', () => {
        rail.scrollBy({ left: -step(), behavior: 'smooth' });
      });
      next.addEventListener('click', () => {
        rail.scrollBy({ left: step(), behavior: 'smooth' });
      });
      rail.addEventListener('scroll', () => updateArrows(rail), { passive: true });
      // Snap after manual scroll ends
      let t;
      rail.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(()=>snapToNearest(rail), 120); }, { passive: true });
      // Init
      updateArrows(rail);
    }
  });

  veil.addEventListener('click', handleVeilClick);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  document.addEventListener('keydown', handleKeydown);
})();
