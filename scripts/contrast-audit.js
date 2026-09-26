/** Contrast audit with a canvas-based colour resolver.
 *  Handles oklab/color()/alpha correctly by compositing the real pixel stack,
 *  so measured ratios match what the eye sees. Returns a JS expression. */
export const CONTRAST_AUDIT = `
(() => {
  // Resolve any CSS colour string to [r,g,b,a] using a canvas.
  const CV = document.createElement('canvas');
  CV.width = CV.height = 1;
  const CX = CV.getContext('2d', { willReadFrequently: true });
  const cache = new Map();
  window.__rgb = (s) => {
    if (!s) return null;
    if (cache.has(s)) return cache.get(s);
    CX.clearRect(0, 0, 1, 1);
    CX.fillStyle = '#000';
    CX.fillStyle = s;               // normalises oklab/color()/rgba
    CX.globalAlpha = 1;
    CX.fillRect(0, 0, 1, 1);
    const d = CX.getImageData(0, 0, 1, 1).data;
    const v = [d[0], d[1], d[2], d[3] / 255];
    cache.set(s, v);
    return v;
  };

  // Composite an element's background stack onto white, honouring alpha.
  const over = (fg, bg) => [
    fg[0] * fg[3] + bg[0] * (1 - fg[3]),
    fg[1] * fg[3] + bg[1] * (1 - fg[3]),
    fg[2] * fg[3] + bg[2] * (1 - fg[3]),
    1,
  ];
  window.__bgOf = (el) => {
    const stack = [];
    let n = el;
    while (n && n !== document.documentElement) {
      const c = window.__rgb(getComputedStyle(n).backgroundColor);
      if (c && c[3] > 0) {
        stack.push(c);
        if (c[3] >= 0.999) break;
      }
      n = n.parentElement;
    }
    let base = [255, 255, 255, 1];
    for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
    return base;
  };

  window.__audit = () => {
    const lum = (c) => {
      const [r, g, b] = c.map((v) => v / 255).map((v) =>
        v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const hidden = (el) => {
      const cs = getComputedStyle(el);
      if (cs.clipPath !== 'none' || cs.clip !== 'auto') return true;
      const r = el.getBoundingClientRect();
      return r.width <= 2 || r.height <= 2;
    };
    const out = [];
    document.querySelectorAll('body *').forEach((el) => {
      const own = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
      if (!own.length || el.offsetParent === null || hidden(el)) return;
      const txt = own.map((n) => n.textContent.trim()).join(' ');
      const cs = getComputedStyle(el);
      const fg = window.__rgb(cs.color);
      if (!fg) return;
      const bg = window.__bgOf(el);
      // composite the text colour over its background too
      const eff = [
        fg[0] * fg[3] + bg[0] * (1 - fg[3]),
        fg[1] * fg[3] + bg[1] * (1 - fg[3]),
        fg[2] * fg[3] + bg[2] * (1 - fg[3]),
      ];
      const L1 = lum(eff), L2 = lum(bg);
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const size = parseFloat(cs.fontSize);
      const bold = parseInt(cs.fontWeight) >= 700;
      const req = (size >= 24 || (bold && size >= 18.66)) ? 3.0 : 4.5;
      if (ratio < req) {
        out.push({
          txt: txt.slice(0, 38),
          fg: 'rgb(' + eff.map(Math.round).join(',') + ')',
          bg: 'rgb(' + bg.map(Math.round).join(',') + ')',
          ratio: +ratio.toFixed(2), req,
          cls: el.tagName + '.' + (el.className || '').toString().slice(0, 44),
        });
      }
    });
    return out;
  };
  return 'ok';
})()
`;
