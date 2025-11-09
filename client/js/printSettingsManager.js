'use strict';

(function () {
  const STORAGE_KEY = 'apsara-print-settings';

  const BOOLEAN_KEYS = [
    'includeMeta',
    'includeNotes',
    'includeComputerSpecs',
    'includePrinterSpecs',
    'includeAttachments',
    'includeFooter'
  ];

  const PAPER_SIZES = ['auto', 'a4', 'letter'];

  const DEFAULT_SETTINGS = {
    includeMeta: true,
    includeNotes: true,
    includeComputerSpecs: true,
    includePrinterSpecs: true,
    includeAttachments: true,
    includeFooter: true,
    paperSize: 'auto'
  };

  const safeStorage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        /* storage unavailable */
      }
    },
    remove(key) {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        /* storage unavailable */
      }
    }
  };

  const sanitize = (raw) => {
    const next = { ...DEFAULT_SETTINGS };
    if (raw && typeof raw === 'object') {
      BOOLEAN_KEYS.forEach((key) => {
        next[key] = Boolean(raw[key]);
      });
      if (Object.prototype.hasOwnProperty.call(raw, 'paperSize')) {
        const value = typeof raw.paperSize === 'string' ? raw.paperSize.toLowerCase() : '';
        next.paperSize = PAPER_SIZES.includes(value) ? value : DEFAULT_SETTINGS.paperSize;
      }
    }
    return next;
  };

  const load = () => {
    const stored = safeStorage.get(STORAGE_KEY);
    if (!stored) {
      return { ...DEFAULT_SETTINGS };
    }
    try {
      const parsed = JSON.parse(stored);
      return sanitize(parsed);
    } catch (error) {
      return { ...DEFAULT_SETTINGS };
    }
  };

  let currentSettings = load();

  const getSettings = () => ({ ...currentSettings });

  const saveSettings = (settings) => {
    currentSettings = sanitize(settings);
    if (JSON.stringify(currentSettings) === JSON.stringify(DEFAULT_SETTINGS)) {
      safeStorage.remove(STORAGE_KEY);
    } else {
      safeStorage.set(STORAGE_KEY, JSON.stringify(currentSettings));
    }
    return getSettings();
  };

  const resetSettings = () => saveSettings(DEFAULT_SETTINGS);

  window.PrintSettingsManager = {
    getSettings,
    getDefaults: () => ({ ...DEFAULT_SETTINGS }),
    save: saveSettings,
    reset: resetSettings,
    getPaperSizes: () => [...PAPER_SIZES]
  };
})();
