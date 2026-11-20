/** ui.js — мелкие UI-утилиты: DOM-хелперы, тост, конфетти. */

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

export function initials(name) {
  return String(name || '?').trim().slice(0, 2).toUpperCase();
}

let toastTimer = null;
export function toast(message) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = el('div', { class: 'toast', role: 'status', 'aria-live': 'polite' });
    document.body.append(t);
  }
  t.textContent = message;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

const CONFETTI_COLORS = ['#22d3ee', '#f472b6', '#a3e635', '#fbbf24', '#c084fc'];

export function confetti(count = 90) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = el('div', { class: 'confetti-layer', 'aria-hidden': 'true' });
  for (let i = 0; i < count; i++) {
    const piece = el('i', { class: 'confetti-piece' });
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    piece.style.animationDuration = 1.6 + Math.random() * 1.4 + 's';
    piece.style.animationDelay = Math.random() * 0.35 + 's';
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    layer.append(piece);
  }
  document.body.append(layer);
  setTimeout(() => layer.remove(), 3600);
}