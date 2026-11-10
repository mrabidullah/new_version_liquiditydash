/* Shared, persistent light/dark theme control across the static pages. */
(function () {
  var root = document.documentElement;
  var storageKey = 'dbt-theme-v2';

  function isDark() {
    return root.dataset.theme === 'dark';
  }

  function syncControls() {
    var dark = isDark();
    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      button.setAttribute('title', dark ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  root.dataset.theme = 'dark';
  try {
    var saved = localStorage.getItem(storageKey);
    if (saved === 'dark' || saved === 'light') root.dataset.theme = saved;
  } catch (error) {
    // Theme still follows the operating system when storage is unavailable.
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest && event.target.closest('[data-theme-toggle]');
    if (!button) return;
    var next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem(storageKey, next); } catch (error) {}
    syncControls();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncControls, { once: true });
  } else {
    syncControls();
  }
})();
