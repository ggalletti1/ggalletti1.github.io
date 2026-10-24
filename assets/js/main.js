/* main: load data, render each section; dates only */
'use strict';
loadStats().then(d => {
  const mm = Number((d.month || d.last_updated || '').slice(5, 7));
  $('updated').innerHTML = (mm ? `<b>${MONTH[mm - 1]}</b> · ` : '') + `Updated ${day(d.last_updated)}`;
  [renderRings, renderSoftware, renderCharging, renderCost].forEach(f => { try { f(d); } catch (e) { console.error(e); } });
}).catch(() => { $('updated').textContent = 'Data unavailable'; });
