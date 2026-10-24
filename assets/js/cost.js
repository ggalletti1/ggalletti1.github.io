/* cost: this month's cost per mile vs gas and break-even (same math as the green ring), other Tesla costs */
'use strict';
function renderCost(d) {
  const c = d.cost || {}, a = c.assumptions || {};
  $('cost').innerHTML = card('Cost',
    `<p class="big">${c.ev_cpm == null ? '—' : usd(c.ev_cpm, 2)}<small>per mile</small></p><p class="sub">Gas car ${usd(c.gas_cpm, 2)}/mi</p>` +
    row('Charging cost', usd(c.ev_total, 2)) +
    row('Same miles in a gas car', usd(c.gas_total, 2)) +
    row('Break-even', `${num(c.miles)} of ${num(c.break_even_miles)} mi`) +
    `<p class="note">Gas ${usd(a.gas_price, 2)}/gal in California</p>`);
  const e = d.expenses || {};
  $('expenses').innerHTML = card('Other costs',
    `<p class="big">${usd(e.total, 2)}</p>` +
    (e.by_category || []).map(x => row(x.category[0].toUpperCase() + x.category.slice(1), usd(x.total, 2))).join(''));
}
