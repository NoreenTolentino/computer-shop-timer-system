import { $, formatPeso, generateId } from './utils.js';
import { loadState, saveState } from './storage.js';
import { addTime, getPcStatus } from './billing.js';
import {
  fillSettings,
  getTodaySales,
  renderAll,
  renderClock,
  updateTimers,
} from './render.js';
import { showToast } from './toast.js';

const TICK_INTERVAL_MS = 1000;
const DEFAULT_SHOP_NAME = 'Computer Shop';

const state = loadState();
let renderedStatuses = '';

const findPc = (id) => state.pcs.find((pc) => pc.id === id);
const snapshotStatuses = () => state.pcs.map((pc) => getPcStatus(pc)).join();
const snapshotPc = (pc) => ({
  endsAt: pc.endsAt,
  sessionPaid: pc.sessionPaid,
  sessionTotalMs: pc.sessionTotalMs,
});

function refresh() {
  renderAll(state);
  renderedStatuses = snapshotStatuses();
}

function persistAndRefresh() {
  saveState(state);
  refresh();
}

function insertCoin(pc, amount) {
  const previous = snapshotPc(pc);
  const { addedMs, isNewSession } = addTime(pc, amount, state.settings.ratePerHour);
  const sale = { id: generateId(), pcName: pc.name, at: Date.now(), amount, addedMs, isNewSession };
  state.sales.push(sale);
  persistAndRefresh();

  showToast(`${formatPeso(amount)} added to ${pc.name}`, () => {
    Object.assign(pc, previous);
    state.sales = state.sales.filter((item) => item.id !== sale.id);
    persistAndRefresh();
  });
}

function endSession(pc) {
  const previous = snapshotPc(pc);
  Object.assign(pc, { endsAt: null, sessionPaid: 0, sessionTotalMs: 0 });
  persistAndRefresh();

  showToast(`${pc.name} session ended`, () => {
    Object.assign(pc, previous);
    persistAndRefresh();
  });
}

function handleGridClick(event) {
  const coin = event.target.closest('button[data-amount]');
  if (coin) return insertCoin(findPc(coin.dataset.id), Number(coin.dataset.amount));

  const end = event.target.closest('button[data-action="end"]');
  if (end) endSession(findPc(end.dataset.id));
}

function handleGridChange(event) {
  if (!event.target.matches('.station-name')) return;

  const name = event.target.value.trim();
  if (name) findPc(event.target.dataset.id).name = name;
  persistAndRefresh();
}

function handleRateChange() {
  const ratePerHour = Number($('#ratePerHour').value);
  if (ratePerHour > 0) state.settings.ratePerHour = ratePerHour;
  fillSettings(state.settings);
  persistAndRefresh();
}

function handleShopNameChange() {
  state.settings.shopName = $('#shopName').value.trim() || DEFAULT_SHOP_NAME;
  fillSettings(state.settings);
  saveState(state);
}

function clearTodayLog() {
  const todaySales = getTodaySales(state);
  if (!todaySales.length) return;
  if (!confirm("Clear all of today's sales records?")) return;

  const todayIds = new Set(todaySales.map((sale) => sale.id));
  state.sales = state.sales.filter((sale) => !todayIds.has(sale.id));
  persistAndRefresh();
}

function tick() {
  const isEditing = document.activeElement?.matches('.station-name, #shopName');

  if (snapshotStatuses() !== renderedStatuses && !isEditing) refresh();
  else updateTimers(state);

  renderClock();
}

function init() {
  fillSettings(state.settings);
  refresh();
  renderClock();

  $('#stationGrid').addEventListener('click', handleGridClick);
  $('#stationGrid').addEventListener('change', handleGridChange);
  $('#settings').addEventListener('change', handleRateChange);
  $('#shopName').addEventListener('change', handleShopNameChange);
  $('#clearLog').addEventListener('click', clearTodayLog);

  setInterval(tick, TICK_INTERVAL_MS);
}

init();