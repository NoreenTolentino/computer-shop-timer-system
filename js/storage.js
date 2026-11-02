const STORAGE_KEY = 'pc-timer-v3';
const WORKSTATION_COUNT = 8;
const DEFAULT_SETTINGS = { ratePerHour: 10 };

function createDefaultState() {
  return {
    settings: { ...DEFAULT_SETTINGS },
    pcs: Array.from({ length: WORKSTATION_COUNT }, (_, index) => ({
      id: `pc-${index + 1}`,
      name: `PC ${String(index + 1).padStart(2, '0')}`,
      endsAt: null,
      sessionPaid: 0,
    })),
    sales: [],
  };
}

export function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.settings && Array.isArray(saved.pcs) && Array.isArray(saved.sales)) {
      return saved;
    }
  } catch {
    return createDefaultState();
  }
  return createDefaultState();
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}