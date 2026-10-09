// The visitor's settings: read from this browser's storage when the page
// opens, written back when one changes. Each setting is a form control that
// the rest of the page already listens to, so applying a saved value means
// setting the control and sending the event it would have sent.

const KEY = 'bahura_settings';

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? {}; } catch { return {}; }
}
function write(values) {
  // Storage can be full or refused; the page works without it.
  try { localStorage.setItem(KEY, JSON.stringify(values)); } catch { /* not saved */ }
}

// `controls` maps a setting's name to { el, event, fallback }. `fallback` is
// the value used when nothing has been saved, and may be a function.
export function initSettings(controls) {
  const saved = read();
  const valueOf = el => (el.type === 'checkbox' ? el.checked : Number(el.value));
  for (const [name, { el, event, fallback }] of Object.entries(controls)) {
    const value = name in saved ? saved[name] : typeof fallback === 'function' ? fallback() : fallback;
    if (el.type === 'checkbox') el.checked = Boolean(value); else el.value = value;
    el.dispatchEvent(new Event(event));
    // Saved only once the visitor changes something, so a setting that follows
    // the system keeps following it until then.
    el.addEventListener(event, () => write(Object.fromEntries(Object.entries(controls).map(([n, c]) => [n, valueOf(c.el)]))));
  }
}
