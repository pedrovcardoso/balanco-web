let sequence = 0;
export function generateId(prefix = 'bc') { sequence += 1; return `${prefix}-${sequence}`; }
export function focusElement(target) { requestAnimationFrame(() => target?.focus()); }
export function announceToSR(message) {
  const element = document.createElement('div');
  element.className = 'sr-only'; element.setAttribute('role', 'status'); element.setAttribute('aria-live', 'polite');
  document.body.appendChild(element); element.textContent = message;
  window.setTimeout(() => element.remove(), 1500);
}
