/* software: the car's build (installed, or pending: downloading / waiting to install) + FSD, the next North America build, past updates */
'use strict';
function renderSoftware(d) {
  // title = the car's build (mine once pending); sub = downloading / waiting to install until installed (then the install day)
  const s = d.software || {}, n = s.next, cur = (s.history || []).find(b => b.current);
  const st = s.status ? ` · ${esc(s.status)}` : (cur && cur.date ? ` · installed ${day(cur.date)}` : '');
  let h = `<p class="big">${esc(s.current || '—')}</p><p class="sub">FSD ${esc(s.current_fsd || '—')}${st}</p>`;
  if (n && n.build) h += row('Next update', `${esc(n.build)}${n.fsd ? ` <i>FSD ${esc(n.fsd)}</i>` : ''}`) +
    row('Rolled out to', `${num(n.share, 1)}% of cars`);
  else if (s.mine) h += row('Next update', 'Not available') + (s.mine_share != null ? row('Rolled out to', `${num(s.mine_share, 1)}% of cars`) : '');
  else h += row('Next update', 'You’re up to date');
  const past = (s.history || []).filter(b => !b.current).slice(0, 2);   // the 2 most recent builds before the installed one
  if (past.length) h += '<ol class="hist">' + past.map(b => `<li><span>${esc(b.version)}${b.fsd ? ` <i>FSD ${esc(b.fsd)}</i>` : ''}</span><time>${b.date ? day(b.date) : ''}</time></li>`).join('') + '</ol>';
  $('software').innerHTML = card('Software', h);
}
