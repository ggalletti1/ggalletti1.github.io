/* software: installed build + FSD, the next North America build, past updates */
'use strict';
function renderSoftware(d) {
  const s = d.software || {}, n = s.next, cur = (s.history || []).find(b => b.current);
  let h = `<p class="big">${esc(s.current || '—')}</p><p class="sub">FSD ${esc(s.current_fsd || '—')}${cur && cur.date ? ` · installed ${day(cur.date)}` : ''}</p>`;
  if (s.pending) h += row('Coming to your car', `${esc(s.pending.version)} <i>${esc(s.pending.label || '')}</i>`);
  else if (n && n.build) h += row('Next update', `${esc(n.build)}${n.fsd ? ` <i>FSD ${esc(n.fsd)}</i>` : ''}`) +
    row('Rolled out to', `${num(n.share, 1)}% of cars`);
  else h += row('Next update', 'You’re up to date');
  const past = (s.history || []).filter(b => !b.current);
  if (past.length) h += '<ol class="hist">' + past.map(b => `<li><span>${esc(b.version)}${b.fsd ? ` <i>FSD ${esc(b.fsd)}</i>` : ''}</span><time>${b.date ? day(b.date) : ''}</time></li>`).join('') + '</ol>';
  $('software').innerHTML = card('Software', h);
}
