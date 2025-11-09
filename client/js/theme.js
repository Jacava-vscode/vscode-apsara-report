'use strict';

(function () {
  const STORAGE_KEY = 'apsara-theme';
  const TOGGLE_SELECTOR = '[data-theme-toggle]';

  const translate = (key, fallback) => {
    if (window.I18n) {
      return I18n.t(key, { fallback });
    }
    return fallback;
  };

  const safeGetItem = (key) => {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  };

  const safeSetItem = (key, value) => {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      /* storage unavailable */
    }
  };

  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const currentTheme = () => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  const updateToggleLabel = (theme) => {
    const toggle = document.querySelector(TOGGLE_SELECTOR);
    if (!toggle) {
      return;
    }

    const isDark = theme === 'dark';
    const textKey = isDark ? 'theme.toggle.light' : 'theme.toggle.dark';
    const ariaKey = isDark ? 'theme.toggle.lightAria' : 'theme.toggle.darkAria';
    toggle.textContent = translate(textKey, isDark ? '☀️ Light Mode' : '🌙 Dark Mode');
    toggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    toggle.setAttribute('aria-label', translate(ariaKey, isDark ? 'Switch to light mode' : 'Switch to dark mode'));
    toggle.setAttribute('title', translate('theme.toggle.title', 'Toggle color theme'));
  };

  const setTheme = (theme) => {
    applyTheme(theme);
    safeSetItem(STORAGE_KEY, theme);
    updateToggleLabel(theme);
  };

  const toggleTheme = () => {
    const nextTheme = currentTheme() === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const handlePreferenceChange = (event) => {
    if (safeGetItem(STORAGE_KEY)) {
      return;
    }
    const theme = event.matches ? 'dark' : 'light';
    applyTheme(theme);
    updateToggleLabel(theme);
  };

  document.addEventListener('DOMContentLoaded', () => {
    const storedTheme = safeGetItem(STORAGE_KEY);

    if (storedTheme) {
      applyTheme(storedTheme);
    } else if (!document.documentElement.hasAttribute('data-theme')) {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }

    updateToggleLabel(currentTheme());

    const toggle = document.querySelector(TOGGLE_SELECTOR);
    if (toggle) {
      toggle.addEventListener('click', toggleTheme);
    }

    if (window.I18n) {
      I18n.onChange(() => {
        updateToggleLabel(currentTheme());
      });
    }

    if (window.matchMedia) {
      const preferenceQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (preferenceQuery.addEventListener) {
        preferenceQuery.addEventListener('change', handlePreferenceChange);
      } else if (preferenceQuery.addListener) {
        preferenceQuery.addListener(handlePreferenceChange);
      }
    }
  });
})();
