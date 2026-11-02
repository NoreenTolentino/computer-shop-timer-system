const MS_PER_HOUR = 60 * 60 * 1000;

export const COIN_VALUES = [1, 5, 10, 20];
export const LOW_TIME_MS = 5 * 60 * 1000;

export const getMinutesPerPeso = (ratePerHour) => 60 / ratePerHour;

export const getTimeForAmount = (amount, ratePerHour) =>
  Math.round((amount / ratePerHour) * MS_PER_HOUR);

export const getRemaining = (pc, now = Date.now()) =>
  pc.endsAt === null ? 0 : Math.max(pc.endsAt - now, 0);

export function getPcStatus(pc, now = Date.now()) {
  if (pc.endsAt === null) return 'available';

  const remaining = pc.endsAt - now;
  if (remaining <= 0) return 'expired';
  return remaining <= LOW_TIME_MS ? 'low' : 'running';
}

export function addTime(pc, amount, ratePerHour, now = Date.now()) {
  const addedMs = getTimeForAmount(amount, ratePerHour);
  const status = getPcStatus(pc, now);
  const isNewSession = status === 'available' || status === 'expired';

  if (isNewSession) {
    pc.sessionPaid = 0;
    pc.endsAt = now + addedMs;
  } else {
    pc.endsAt += addedMs;
  }

  pc.sessionPaid += amount;
  return { addedMs, isNewSession };
}