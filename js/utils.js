export const $ = (selector) => document.querySelector(selector);

const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

const pad = (value) => String(value).padStart(2, '0');

export const formatPeso = (amount) => pesoFormatter.format(amount);

export const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

export function formatClock(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatDuration(ms) {
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return `${minutes} min`;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

export const formatTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });

export const formatDateTime = (timestamp) =>
  new Date(timestamp).toLocaleString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export const isToday = (timestamp) =>
  new Date(timestamp).toDateString() === new Date().toDateString();

export const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);