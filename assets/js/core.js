/* core: helpers, theme menu (System / Light / Dark), data load */
'use strict';
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const day = s => { if (!s) return '—'; const [y, m, d] = s.split('-').map(Number); return `${MON[m - 1]} ${d}`; };
const usd = (v, dp = 0) => v == null ? '—' : (v < 0 ? '−' : '') + '$' + Math.abs(v).toLocaleString('en-US', {minimumFractionDigits: dp, maximumFractionDigits: dp});
const num = (v, dp = 0) => v == null ? '—' : Number(v).toLocaleString('en-US', {minimumFractionDigits: dp, maximumFractionDigits: dp});
const row = (k, v, cls = '') => `<div class="row ${cls}"><span>${esc(k)}</span><b>${v}</b></div>`;
const card = (title, body) => `<h2>${esc(title)}</h2>${body}`;
(function theme() {
  const root = document.documentElement, btn = $('theme'), menu = $('theme-menu'), wrap = $('theme-wrap');
  if (!btn) return;
  const mq = window.matchMedia ? matchMedia('(prefers-color-scheme: light)') : null;
  let mode = 'system'; try { const s = localStorage.getItem('theme'); if (s === 'light' || s === 'dark') mode = s; } catch (e) {}
  const items = [...menu.querySelectorAll('[data-mode]')];
  function apply() {
    const t = mode === 'system' ? (mq && mq.matches ? 'light' : 'dark') : mode;
    root.dataset.mode = mode; root.dataset.theme = t; root.style.colorScheme = t;
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = t === 'light' ? '#f5f5f7' : '#050506';
    const label = mode[0].toUpperCase() + mode.slice(1);
    btn.title = 'Theme: ' + label; btn.setAttribute('aria-label', 'Theme: ' + label);
    items.forEach(i => i.setAttribute('aria-checked', String(i.dataset.mode === mode)));
  }
  const open = () => { wrap.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); (items.find(i => i.dataset.mode === mode) || items[0]).focus(); };
  const close = f => { wrap.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); if (f) btn.focus(); };
  btn.addEventListener('click', e => { e.stopPropagation(); wrap.classList.contains('open') ? close() : open(); });
  items.forEach(i => i.addEventListener('click', () => { mode = i.dataset.mode; try { mode === 'system' ? localStorage.removeItem('theme') : localStorage.setItem('theme', mode); } catch (e) {} apply(); close(true); }));
  menu.addEventListener('keydown', e => {
    const k = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(k + 1) % items.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(k - 1 + items.length) % items.length].focus(); }
    else if (e.key === 'Escape') close(true);
  });
  document.addEventListener('click', e => { if (!wrap.contains(e.target)) close(); });
  if (mq) (mq.addEventListener ? mq.addEventListener('change', apply) : mq.addListener(apply));
  apply();
})();
async function loadStats() {
  const r = await fetch('data/stats.json?nc=' + Date.now(), {cache: 'no-store'});
  if (!r.ok) throw new Error('stats ' + r.status);
  return r.json();
}
