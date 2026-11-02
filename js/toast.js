import { $ } from './utils.js';

const TOAST_DURATION_MS = 6000;

let hideTimer = null;

export function hideToast() {
  $('#toast').hidden = true;
}

export function showToast(message, onUndo) {
  $('#toastMessage').textContent = message;
  $('#toastUndo').onclick = () => {
    hideToast();
    onUndo();
  };
  $('#toast').hidden = false;

  clearTimeout(hideTimer);
  hideTimer = setTimeout(hideToast, TOAST_DURATION_MS);
}