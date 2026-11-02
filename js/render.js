import {
  $,
  escapeHtml,
  formatClock,
  formatDateTime,
  formatDuration,
  formatPeso,
  formatTime,
  isToday,
} from './utils.js';
import { COIN_VALUES, getMinutesPerPeso, getPcStatus, getRemaining } from './billing.js';

const STATUS_LABELS = {
  available: 'Available',
  running: 'In use',
  low: 'Low time',
  expired: "Time's up",
};

export const getTodaySales = (state) => state.sales.filter((sale) => isToday(sale.at));

export function renderAll(state) {
  renderStats(state);
  renderPcList(state);
  renderSales(state);
}

export function renderClock() {
  $('#clock').textContent = formatDateTime(Date.now());
}

export function fillSettings({ ratePerHour }) {
  const minutes = +getMinutesPerPeso(ratePerHour).toFixed(1);
  $('#ratePerHour').value = ratePerHour;
  $('#rateHint').textContent = `${formatPeso(1)} adds ${minutes} minutes.`;
}

function renderStats(state) {
  const sales = getTodaySales(state);
  const income = sales.reduce((total, sale) => total + sale.amount, 0);
  const sessions = sales.filter((sale) => sale.isNewSession).length;
  const active = state.pcs.filter((pc) => ['running', 'low'].includes(getPcStatus(pc))).length;

  $('#statIncome').textContent = formatPeso(income);
  $('#statSessions').textContent = sessions;
  $('#statActive').textContent = `${active} of ${state.pcs.length}`;
  $('#statAverage').textContent = formatPeso(sessions ? Math.round(income / sessions) : 0);
}

function renderPcList(state) {
  $('#pcList').innerHTML = state.pcs.map(renderRow).join('');
}

function renderRow(pc) {
  const status = getPcStatus(pc);
  const isIdle = status === 'available';

  const coins = COIN_VALUES.map((value) => `
    <button class="coin" data-id="${pc.id}" data-amount="${value}" aria-label="Add ${formatPeso(value)} to ${escapeHtml(pc.name)}">
      ${formatPeso(value)}
    </button>`).join('');

  return `
    <li class="pc-row ${status}">
      <div class="c-name">
        <input class="pc-name" data-id="${pc.id}" value="${escapeHtml(pc.name)}" maxlength="16" aria-label="Workstation name">
      </div>
      <div class="c-status"><span class="status">${STATUS_LABELS[status]}</span></div>
      <div class="c-time"><span class="time" data-timer="${pc.id}">${isIdle ? '&ndash;' : formatClock(getRemaining(pc))}</span></div>
      <div class="c-paid">${isIdle ? '&ndash;' : formatPeso(pc.sessionPaid)}</div>
      <div class="c-coins"><div class="coins">${coins}</div></div>
      <div class="c-end">${isIdle ? '' : `<button class="link" data-action="end" data-id="${pc.id}">End</button>`}</div>
    </li>`;
}

export function updateTimers(state) {
  state.pcs.filter((pc) => pc.endsAt !== null).forEach((pc) => {
    $(`[data-timer="${pc.id}"]`).textContent = formatClock(getRemaining(pc));
  });
}

function renderSales(state) {
  const sales = getTodaySales(state).sort((a, b) => b.at - a.at);

  $('#salesRows').innerHTML = sales.map((sale) => `
    <tr>
      <td>${formatTime(sale.at)}</td>
      <td>${escapeHtml(sale.pcName)}</td>
      <td>${formatDuration(sale.addedMs)}</td>
      <td class="num">${formatPeso(sale.amount)}</td>
    </tr>`).join('');

  $('#salesEmpty').hidden = sales.length > 0;
}