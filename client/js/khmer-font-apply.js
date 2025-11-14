/* Wrap Khmer-script runs in inline spans so we can apply the Khmer font reliably.
   This finds text nodes containing Khmer Unicode characters and wraps those runs
   in a span.khmer-text which the stylesheet maps to the selected --khmer-font.
*/
(function () {
  'use strict';

  const KHMER_RE = /[\u1780-\u17FF]+/g;

  function wrapKhmerInTextNode(textNode) {
    const text = textNode.nodeValue;
    if (!text || !KHMER_RE.test(text)) return;
    KHMER_RE.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0;
    let m;
    while ((m = KHMER_RE.exec(text)) !== null) {
      const start = m.index;
      const end = KHMER_RE.lastIndex;
      if (start > last) {
        frag.appendChild(document.createTextNode(text.slice(last, start)));
      }
      const span = document.createElement('span');
      span.className = 'khmer-text';
      span.textContent = text.slice(start, end);
      frag.appendChild(span);
      last = end;
    }
    if (last < text.length) {
      frag.appendChild(document.createTextNode(text.slice(last)));
    }
    textNode.parentNode.replaceChild(frag, textNode);
  }

  function walk(node) {
    // don't walk into these tags
    if (!node || node.nodeType === Node.COMMENT_NODE) return;
    if (node.nodeType === Node.TEXT_NODE) {
      wrapKhmerInTextNode(node);
      return;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName;
      if (['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA', 'INPUT'].includes(tag)) return;
      // iterate on a static snapshot because we may modify children
      const children = Array.from(node.childNodes);
      for (const c of children) walk(c);
    }
  }

  function applyKhmerWrapping() {
    try {
      walk(document.body);
    } catch (e) {
      // Fail silently
      console.warn('khmer-font-apply: error applying khmer wrapping', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyKhmerWrapping);
  } else {
    applyKhmerWrapping();
  }
})();
