/* rings: three gradient rings in SVG (outer Cybercab gold = update (full + 'Up to date' when the car has the newest build; empty + 'Learning' until a verified inclusion sets the anchors), middle Quicksilver = gas break-even, inner Ultra Red = plan value: public-only cost / this month's total, 1x = full).
   Smooth conic gradient per ring (canvas createConicGradient, fine-wedge fallback) masked to the arc; one lap = start colour -> end colour, rounded caps, a dimmer track that follows the theme,
   past 100% the ring keeps looping and its tip overlaps the start; the leading cap (one solid end-colour circle) covers the start cleanly and casts a soft shadow that fades forward along the ring band, and each ring has a small Apple-style icon at 12 o'clock. The viewBox is fixed (100x100), so it never stretches. */
'use strict';
const RINGS = [   // gradients: [start, end, rgb for the track]
  ['#B8913F', '#F3DFA2', '217,180,100'],   // Update odds: Cybercab gold
  ['#9EA2A8', '#DCDFE3', '192,195,199'],   // Gas break-even: Tesla Quicksilver
  ['#C8102E', '#FF3B4A', '232,33,50'],     // Plan value: Tesla Ultra Red
];
const NS = 'http://www.w3.org/2000/svg';
const W = 10.6, GAP = 1.3, TOP = -Math.PI / 2;
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((x, i) => Math.round(x + (B[i] - x) * t)).join(',')})`; };
const pt = (r, a) => [50 + r * Math.cos(a), 50 + r * Math.sin(a)];
function arc(r, a0, a1) { const [x0, y0] = pt(r, a0), [x1, y1] = pt(r, a1); return `M${x0.toFixed(3)} ${y0.toFixed(3)}A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(3)} ${y1.toFixed(3)}`; }
function el(tag, attrs) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; }
// Apple-style glyphs: thin black monoline icons (24x24 grid, stroke 1.0, round caps), upright on each ring's start cap at 12 o'clock,
// drawn after the arc so they stay on top when a ring is full or loops past 100%; an empty ring (Learning) shows its icon on the track.
const GLYPHS = [
  'M12 5.725v11.5M7 12.225l5 5 5-5M6 18.225h12',                       // Update odds: software update (download arrow whose tip touches the line below)
  'M6 19.5V6A1.5 1.5 0 0 1 7.5 4.5h5A1.5 1.5 0 0 1 14 6V19.5M4.5 19.5h11M6 10h8M14 11.5h2a1 1 0 0 1 1 1v3.5a1.25 1.25 0 0 0 2.5 0V8.5l-2.5-3', // Gas break-even: gas pump
  'M13.5 3 6 13.5h5.5L10.5 21 18 10.5h-5.5z',               // Plan value: lightning bolt
];
function glyph(svg, i, r) {   // ~82% of the cap width
  const s = W * 0.82 / 24, [x, y] = pt(r, TOP);
  const g = el('g', {transform: `translate(${(x - 12 * s).toFixed(3)} ${(y - 12 * s).toFixed(3)}) scale(${s.toFixed(4)})`, 'aria-hidden': 'true'});
  g.appendChild(el('path', {d: GLYPHS[i], fill: 'none', stroke: '#000', 'stroke-width': 1.0, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'}));
  svg.appendChild(g);
}
const CONIC = {};
function conic(i, a, b) {   // 0 deg = 3 o'clock, clockwise (same as SVG); rotated into place with a transform; cached per ring
  if (CONIC[i]) return CONIC[i];
  const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
  if (x.createConicGradient) { const g = x.createConicGradient(0, 256, 256); g.addColorStop(0, a); g.addColorStop(1, b); x.fillStyle = g; x.fillRect(0, 0, 512, 512); }
  else for (let k = 0; k < 720; k++) {   // fallback: fine wedges, slightly overlapping
    x.fillStyle = mix(a, b, (k + .5) / 720); x.beginPath(); x.moveTo(256, 256);
    x.arc(256, 256, 400, 2 * Math.PI * k / 720, 2 * Math.PI * (k + 1.6) / 720); x.closePath(); x.fill(); }
  return (CONIC[i] = c.toDataURL());
}
let UID = 0;
function drawRings(svg, fills, t) {
  const u = svg.dataset.uid || (svg.dataset.uid = 'r' + (++UID));   // unique ids per svg
  const light = document.documentElement.dataset.theme === 'light';
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  const defs = el('defs', {}); svg.appendChild(defs);
  // Apple-style tip shadow: a dark arc cast forward from the leading cap, fading smoothly along the ring, lightly blurred
  // (filter region = the whole viewBox, so it is never cut) and clipped to the ring's own curved band.
  const f = el('filter', {id: `tipsh${u}`, filterUnits: 'userSpaceOnUse', x: 0, y: 0, width: 100, height: 100});
  f.appendChild(el('feGaussianBlur', {stdDeviation: W * 0.12})); defs.appendChild(f);
  fills.forEach((f0, i) => {
    const [a, b, rgb] = RINGS[i], r = 50 - W / 2 - i * (W + GAP), v = Math.max(0, (f0 || 0) * t);
    svg.appendChild(el('circle', {cx: 50, cy: 50, r, fill: 'none', 'stroke-width': W, stroke: `rgba(${rgb},${light ? .18 : .26})`}));
    if (v <= 0.002) { glyph(svg, i, r); return; }
    const end = TOP + 2 * Math.PI * v, from = v > 1 ? end - 2 * Math.PI : TOP;
    const colAt = ang => mix(a, b, Math.min(1, Math.max(0, (ang - from) / (2 * Math.PI))));   // one lap = start -> end colour
    const ro = r + W / 2, ri = r - W / 2;
    // body: one smooth conic gradient (canvas, start colour at `from`, end colour a full lap later), masked to the arc
    const m = el('mask', {id: `body${u}${i}`, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 100, height: 100});
    m.appendChild(v >= 1 ? el('circle', {cx: 50, cy: 50, r, fill: 'none', stroke: '#fff', 'stroke-width': W})
                         : el('path', {d: arc(r, from, end), fill: 'none', stroke: '#fff', 'stroke-width': W}));
    defs.appendChild(m);
    const img = el('image', {x: 0, y: 0, width: 100, height: 100, preserveAspectRatio: 'none', mask: `url(#body${u}${i})`});
    img.setAttribute('href', conic(i, a, b));
    const rot = el('g', {transform: `rotate(${(from * 180 / Math.PI).toFixed(3)} 50 50)`}); rot.appendChild(img);
    const body = el('g', {mask: `url(#body${u}${i})`}); img.removeAttribute('mask'); body.appendChild(rot); svg.appendChild(body);
    if (v < 1) { const [x, y] = pt(r, from); svg.appendChild(el('circle', {cx: x, cy: y, r: W / 2, fill: a})); }   // rounded start, exactly the start colour
    if (v > 0.9) {   // tip shadow only when the tip laps or sits close to the start (Apple Activity)
      const cp = el('clipPath', {id: `band${u}${i}`});
      cp.appendChild(el('path', {'clip-rule': 'evenodd', d: `M${50 + ro} 50A${ro} ${ro} 0 1 0 ${50 - ro} 50A${ro} ${ro} 0 1 0 ${50 + ro} 50ZM${50 + ri} 50A${ri} ${ri} 0 1 0 ${50 - ri} 50A${ri} ${ri} 0 1 0 ${50 + ri} 50Z`}));
      defs.appendChild(cp);
      const op = light ? .26 : .55, L = Math.min(0.75, W * 2.6 / r), sn = 24, sh = el('g', {filter: `url(#tipsh${u})`});
      for (let k = 0; k < sn; k++) {   // smooth fall-off: dense at the cap, fading to nothing
        const q = 1 - (k + .5) / sn;
        sh.appendChild(el('path', {d: arc(r, end + L * k / sn, end + L * (k + 1) / sn + 0.01), fill: 'none', 'stroke-width': W, stroke: '#000', 'stroke-opacity': (op * q * q).toFixed(3)}));
      }
      const shg = el('g', {'clip-path': `url(#band${u}${i})`}); shg.appendChild(sh); svg.appendChild(shg);
    }
    const [x, y] = pt(r, end);
    svg.appendChild(el('circle', {cx: x, cy: y, r: W / 2, fill: colAt(end)}));   // leading cap: one full circle in the colour at the tip
    glyph(svg, i, r);
  });
}
function renderRings(d) {
  const R = d.rings || {}, u = R.update || {}, g = R.breakeven || {}, c = R.plan_value || {};
  const fills = [u.fill || 0, g.fill || 0, c.fill || 0], svg = $('rings');
  const pct = v => v == null ? '—' : `${num(v, v < 10 ? 1 : 0)}%`;
  const rows = [
    ['r', 'Update odds', u.state === 'up_to_date' ? 'Up to date' : u.state === 'learning' ? 'Learning' : pct(u.value)],
    ['g', 'Gas break-even', g.target ? `${num(g.miles)}/${num(g.target)}<small>mi</small>` : '—'],
    ['c', 'Plan value', c.value != null ? `${num(c.value, 2)}x` : '—'],
  ];
  $('legend').innerHTML = rows.map(([k, l, v]) => `<li class="lg-${k}"><span class="lg-l">${l}</span><span class="lg-v">${v}</span></li>`).join('');
  svg.setAttribute('aria-label', rows.map(r => `${r[1]} ${r[2].replace(/<[^>]+>/g, ' ')}`).join(', '));
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t0 = null; const dur = 1400;
  const step = ts => { if (t0 == null) t0 = ts; const p = Math.min(1, (ts - t0) / dur);
    drawRings(svg, fills, 1 - Math.pow(1 - p, 3)); if (p < 1) requestAnimationFrame(step); };
  reduce ? drawRings(svg, fills, 1) : requestAnimationFrame(step);
  new MutationObserver(() => drawRings(svg, fills, 1)).observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
}
