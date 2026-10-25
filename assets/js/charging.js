/* charging: this month's charged energy only (kWh): home (flat plan), Supercharger, Other (non-Tesla public) */
'use strict';
function renderCharging(d) {
  const c = d.charging || {};
  const tot = c.total_kwh != null ? c.total_kwh : (c.home_kwh || 0) + (c.sc_kwh || 0) + (c.other_kwh || 0);
  $('charging').innerHTML = card('Charging',
    `<p class="big">${num(tot, 1)}<small>kWh</small></p>` +
    row('Home', `${num(c.home_kwh || 0, 1)} kWh`) +
    row('Supercharger', `${num(c.sc_kwh || 0, 1)} kWh`) +
    row('Other', `${num(c.other_kwh || 0, 1)} kWh`));
}
