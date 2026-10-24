/* charging: this month's measured kWh, home (flat plan) vs Supercharger */
'use strict';
function renderCharging(d) {
  const c = d.charging || {};
  const tot = (c.home_kwh || 0) + (c.sc_kwh || 0);
  $('charging').innerHTML = card('Charging',
    `<p class="big">${num(tot, 1)}<small>kWh</small></p>` +
    row('Home', `${num(c.home_kwh, 1)} kWh <i>${usd(c.home_cost)} plan</i>`) +
    row('Supercharger', `${num(c.sc_kwh, 1)} kWh <i>${usd(c.sc_cost, 2)}</i>`));
}
