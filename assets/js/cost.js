/* cost: this month's energy total (home plan + Supercharger + Other) vs the same miles in a gas car and the same kWh
   at the public reference rate (Public only / Total = cyan Plan value ring); plus other Tesla costs */
'use strict';
function renderCost(d) {
  const c = d.cost || {}, a = c.assumptions || {};
  $('cost').innerHTML = card('Cost',
    `<p class="big">${usd(c.total, 2)}</p>` +
    row('Home plan', usd(c.home_plan, 2)) +
    row('Supercharger + Other', `${usd(c.sc_cost || 0, 2)} + ${usd(c.other_cost || 0, 2)}`) +
    row('Gas car', usd(c.gas_total, 2)) +
    row('Public only', usd(c.public_only, 2)) +
    `<p class="note">Same miles · Gas ${usd(a.gas_price, 2)}/gal · Public ${usd(a.public_rate, 2)}/kWh in California</p>`);
  const e = d.expenses || {};
  $('expenses').innerHTML = card('Other costs',
    `<p class="big">${usd(e.total, 2)}</p>` +
    (e.by_category || []).map(x => row(x.category[0].toUpperCase() + x.category.slice(1), usd(x.total, 2))).join(''));
}
