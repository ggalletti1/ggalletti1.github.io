/* rings: three gradient rings in SVG (outer Cybercab gold = update (full + 'Up to date' when the car has the newest build; empty + 'Learning' until a verified inclusion sets the anchors), middle Glacier Blue = gas break-even, inner Ultra Red = plan value: public-only cost / this month's total, 1x = full).
   Gradient arcs (many small segments, so it works in every browser), rounded caps, a dimmer track that follows the theme,
   past 100% the ring keeps looping and its tip overlaps the start; the leading cap (one solid end-colour circle) covers the start cleanly and casts a soft shadow that fades forward along the ring band, and each ring has a small Apple-style icon at 12 o'clock. The viewBox is fixed (100x100), so it never stretches. */
'use strict';
const RINGS = [   // gradients: [start, end, rgb for the track]
  ['#B8913F', '#F3DFA2', '217,180,100'],   // Update odds: Cybercab gold
  ['#5FA8D9', '#B3E0FF', '127,190,232'],   // Gas break-even: Tesla Glacier Blue
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
function drawRings(svg, fills, t) {
  const light = document.documentElement.dataset.theme === 'light';
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  const defs = el('defs', {}); svg.appendChild(defs);
  // Apple-style tip shadow: a dark arc cast forward from the leading cap, fading smoothly along the ring, lightly blurred
  // (filter region = the whole viewBox, so it is never cut) and clipped to the ring's own curved band.
  const f = el('filter', {id: 'tipsh', filterUnits: 'userSpaceOnUse', x: 0, y: 0, width: 100, height: 100});
  f.appendChild(el('feGaussianBlur', {stdDeviation: W * 0.12})); defs.appendChild(f);
  fills.forEach((f0, i) => {
    const [a, b, rgb] = RINGS[i], r = 50 - W / 2 - i * (W + GAP), v = Math.max(0, (f0 || 0) * t);
    svg.appendChild(el('circle', {cx: 50, cy: 50, r, fill: 'none', 'stroke-width': W, stroke: `rgba(${rgb},${light ? .18 : .26})`}));
    if (v <= 0.002) { glyph(svg, i, r); return; }
    const end = TOP + 2 * Math.PI * v, from = v > 1 ? end - 2 * Math.PI : TOP, span = end - from;
    const n = Math.max(2, Math.ceil(span / (Math.PI / 120)));
    const colAt = ang => mix(a, b, Math.min(1, Math.max(0, (ang - from) / span)));   // gradient colour at an angle
    const seg = (s0, s1, c, extra = {}) => el('path', {d: arc(r, s0, s1), fill: 'none', 'stroke-width': W, stroke: c, ...extra});
    for (let k = 0; k < n; k++) {   // gradient along the arc: start colour at the tail, end colour at the tip
      const s0 = from + span * k / n, s1 = from + span * (k + 1) / n + (k < n - 1 ? 0.012 : 0);
      svg.appendChild(seg(s0, s1, colAt((s0 + s1) / 2)));
    }
    if (v <= 1) { const [x, y] = pt(r, from); svg.appendChild(el('circle', {cx: x, cy: y, r: W / 2, fill: a})); }   // rounded tail
    // tip shadow (always; stronger when the ring laps itself past 100%, like Apple Activity)
    const cp = el('clipPath', {id: `band${i}`});
    const ro = r + W / 2, ri = r - W / 2;
    cp.appendChild(el('path', {'clip-rule': 'evenodd', d: `M${50 + ro} 50A${ro} ${ro} 0 1 0 ${50 - ro} 50A${ro} ${ro} 0 1 0 ${50 + ro} 50ZM${50 + ri} 50A${ri} ${ri} 0 1 0 ${50 - ri} 50A${ri} ${ri} 0 1 0 ${50 + ri} 50Z`}));
    defs.appendChild(cp);
    const op = v > 1 ? (light ? .26 : .6) : (light ? .12 : .32), L = Math.min(0.75, W * 2.6 / r), sn = 24;
    const sh = el('g', {filter: 'url(#tipsh)'});
    for (let k = 0; k < sn; k++) {   // smooth fall-off: dense at the cap, fading to nothing
      const s0 = end + L * k / sn, s1 = end + L * (k + 1) / sn + 0.01, q = 1 - (k + .5) / sn;
      sh.appendChild(seg(s0, s1, '#000', {'stroke-opacity': (op * q * q).toFixed(3)}));
    }
    const shg = el('g', {'clip-path': `url(#band${i})`}); shg.appendChild(sh); svg.appendChild(shg);
    if (v > 0.9) {   // at/after a full lap: redraw the last stretch so the tip sits above the start of the same ring;
      // the part hidden under the cap uses the cap colour exactly, so no edge can show through the cap's rim
      const Lt = 0.35, m2 = 8, capA = (W / 2) / r;
      for (let k = 0; k < m2; k++) { const s0 = end - Lt + Lt * k / m2, s1 = Math.min(end - Lt + Lt * (k + 1) / m2 + 0.012, end);
        svg.appendChild(seg(s0, s1, s0 >= end - capA ? b : colAt((s0 + s1) / 2))); }
    }
    const [x, y] = pt(r, end);
    svg.appendChild(el('circle', {cx: x, cy: y, r: W / 2, fill: b}));   // rounded tip: one solid circle in the end colour, on top of everything
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
