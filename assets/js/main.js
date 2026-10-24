/* main: load data, render each section; dates only */
'use strict';
loadStats().then(d => {
  $('updated').textContent = `Updated ${day(d.last_updated)}` + (d.last_reading && d.last_reading !== d.last_updated ? ` · car ${day(d.last_reading)}` : '');
  [renderRings, renderSoftware, renderCharging, renderCost].forEach(f => { try { f(d); } catch (e) { console.error(e); } });
}).catch(() => { $('updated').textContent = 'Data unavailable'; });
