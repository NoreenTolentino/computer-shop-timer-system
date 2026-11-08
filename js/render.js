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
import {
  COIN_VALUES,
  getMinutesPerPeso,
  getPcStatus,
  getProgress,
  getRemaining,
} from './billing.js';

const STATUS_LABELS = {
  available: 'Available',
  running: 'In use',
  low: 'Low time',
  expired: "Time's up",
};

const HOURS_IN_DAY = 24;

export const getTodaySales = (state) => state.sales.filter((sale) => isToday(sale.at));

export function renderAll(state) {
  renderStats(state);
  renderChart(state);
  renderStations(state);
  renderActivity(state);
}

export function renderClock() {
  $('#clock').textContent = formatDateTime(Date.now());
}

export function fillSettings({ ratePerHour, shopName }) {
  const minutes = +getMinutesPerPeso(ratePerHour).toFixed(1);
  $('#shopName').value = shopName;
  $('#ratePerHour').value = ratePerHour;
  $('#rateHint').textContent = `${formatPeso(1)} adds ${minutes} min`;
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

function renderChart(state) {
  const revenueByHour = Array(HOURS_IN_DAY).fill(0);
  getTodaySales(state).forEach((sale) => {
    revenueByHour[new Date(sale.at).getHours()] += sale.amount;
  });

  const peak = Math.max(...revenueByHour, 1);
  const currentHour = new Date().getHours();

  $('#bars').innerHTML = revenueByHour.map((amount, hour) => {
    const height = Math.max((amount / peak) * 100, 5);
    const label = `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}: ${formatPeso(amount)}`;
    return `<span class="bar ${hour === currentHour ? 'now' : ''}" style="height:${height}%" title="${label}"></span>`;
  }).join('');
}

function renderStations(state) {
  $('#stationGrid').innerHTML = state.pcs.map((pc) => renderStation(pc, state.settings)).join('');
}

function renderStation(pc, settings) {
  const status = getPcStatus(pc);
  const isIdle = status === 'available';
  const minutesPerPeso = +getMinutesPerPeso(settings.ratePerHour).toFixed(1);

  const coins = COIN_VALUES.map((value) => `
    <button class="coin" data-id="${pc.id}" data-amount="${value}" aria-label="Add ${formatPeso(value)} to ${escapeHtml(pc.name)}">
      ${formatPeso(value)}
    </button>`).join('');

  const caption = {
    available: 'Ready',
    running: `Ends ${formatTime(pc.endsAt)}`,
    low: `Ends ${formatTime(pc.endsAt)}`,
    expired: `Ended ${formatTime(pc.endsAt)}`,
  }[status];

  return `
    <article class="station ${status}">
      <header class="station-head">
        <input class="station-name" data-id="${pc.id}" value="${escapeHtml(pc.name)}" maxlength="16" aria-label="Workstation name">
        <span class="chip">${STATUS_LABELS[status]}</span>
      </header>
      <div class="dial">
        <div class="ring" data-ring="${pc.id}" style="--p:${getProgress(pc)}"></div>
        <div class="dial-text">
          <span class="time" data-timer="${pc.id}">${isIdle ? '--:--:--' : formatClock(getRemaining(pc))}</span>
          <span class="caption">${caption}</span>
        </div>
      </div>
      <p class="paid">${isIdle ? `${formatPeso(1)} = ${minutesPerPeso} min` : `Paid ${formatPeso(pc.sessionPaid)} this session`}</p>
      <div class="coins">${coins}</div>
      <button class="end" data-action="end" data-id="${pc.id}">End session</button>
    </article>`;
}

export function updateTimers(state) {
  state.pcs.filter((pc) => pc.endsAt !== null).forEach((pc) => {
    $(`[data-timer="${pc.id}"]`).textContent = formatClock(getRemaining(pc));
    $(`[data-ring="${pc.id}"]`).style.setProperty('--p', getProgress(pc));
  });
}

function renderActivity(state) {
  const sales = getTodaySales(state).sort((a, b) => b.at - a.at);

  $('#activity').innerHTML = sales.map((sale) => `
    <li class="activity-item">
      <span class="dot ${sale.isNewSession ? 'new' : ''}"></span>
      <div class="activity-main">
        <strong>${escapeHtml(sale.pcName)}</strong>
        <span>${sale.isNewSession ? 'New session' : 'Added time'}, ${formatDuration(sale.addedMs)}</span>
      </div>
      <div class="activity-side">
        <strong>${formatPeso(sale.amount)}</strong>
        <span>${formatTime(sale.at)}</span>
      </div>
    </li>`).join('');

  $('#activityEmpty').hidden = sales.length > 0;
}