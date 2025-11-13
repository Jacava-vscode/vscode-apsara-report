'use strict';

(function () {
  const manager = window.BackgroundManager;
  if (!manager) {
    return;
  }

  const optionsContainer = document.querySelector('[data-background-options]');
  const previewContainer = document.querySelector('[data-background-preview]');
  const previewChip = document.querySelector('[data-preview-chip]');
  const saveButton = document.getElementById('saveBackgroundBtn');
  const resetButton = document.getElementById('resetBackgroundBtn');
  const alertBox = document.getElementById('settingsAlert');

  if (!optionsContainer || !previewContainer || !saveButton || !resetButton || !alertBox) {
    return;
  }

  const FALLBACK_THEME_TEXT = {
    default: {
      title: 'Classic Gradient',
      description: 'Keeps the original calming gradient backdrop.'
    },
    techLoop: {
      title: 'Tech Loop',
      description: 'Pulsing blues flow like circulating data.'
    },
    techWorld: {
      title: 'Global Grid',
      description: 'Teal currents sweep across a connected world.'
    },
    futuristicHud: {
      title: 'Futuristic HUD',
      description: 'Neon grids and sweeping scanner lights.'
    },
    signalTech: {
      title: 'Signal Matrix',
      description: 'Emerald waves ripple with telemetry pulses.'
    },
    smartCity: {
      title: 'Smart City Lights',
      description: 'Vertical light trails inspired by skyline beacons.'
    },
    blueData: {
      title: 'Blue Data Stream',
      description: 'Azure gradients layered with floating highlights.'
    },
    shootingStars: {
      title: 'Shooting Stars',
      description: 'Light streaks race across a midnight sky.'
    },
    blueParticles: {
      title: 'Blue Particles',
      description: 'Gentle particle glow over a deep blue canvas.'
    }
  };

  const FALLBACK_TEXT = {
    optionSelectedTag: 'Active',
    optionInstantApply: 'Applies instantly',
    previewChip: 'Selected theme: {{name}}',
    buttons: {
      save: 'Save selection',
      saving: 'Saving...',
      saved: 'Saved',
      reset: 'Reset to default'
    },
    alerts: {
      saved: 'Background updated successfully.',
      reset: 'Background reset to default.',
      error: 'Unable to update the background. Please try again.'
    }
  };

  const formatWithParams = (text, params) => {
    if (!text || !params) {
      return text;
    }
    return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) => {
      if (Object.prototype.hasOwnProperty.call(params, name)) {
        return params[name];
      }
      return '';
    });
  };

  const translate = (key, fallback, params) => {
    if (window.I18n && typeof window.I18n.t === 'function') {
      return window.I18n.t(key, { fallback, params });
    }
    if (typeof fallback === 'string') {
      return formatWithParams(fallback, params);
    }
    return key;
  };

  const themes = manager.getThemes();
  const themeRefs = new Map();
  let selectedThemeId = manager.getCurrentTheme();
  let appliedThemeId = selectedThemeId;
  let saveState = 'default';

  const hideAlert = () => {
    alertBox.classList.add('is-hidden');
    alertBox.classList.remove('alert-success', 'alert-info', 'alert-error');
    alertBox.textContent = '';
  };

  const showAlert = (type, key, fallback) => {
    alertBox.classList.remove('alert-success', 'alert-info', 'alert-error', 'is-hidden');
    if (type === 'success') {
      alertBox.classList.add('alert', 'alert-success');
    } else if (type === 'info') {
      alertBox.classList.add('alert', 'alert-info');
    } else {
      alertBox.classList.add('alert', 'alert-error');
    }
    alertBox.textContent = translate(key, fallback);
  };

  const updateSaveButtonLabel = (state) => {
    saveState = state;
    let key = 'settings.buttons.save';
    let fallback = FALLBACK_TEXT.buttons.save;
    if (state === 'saving') {
      key = 'settings.buttons.saving';
      fallback = FALLBACK_TEXT.buttons.saving;
    } else if (state === 'saved') {
      key = 'settings.buttons.saved';
      fallback = FALLBACK_TEXT.buttons.saved;
    }
    saveButton.textContent = translate(key, fallback);
    saveButton.disabled = state === 'saving';
  };

  const updateResetButtonLabel = () => {
    resetButton.textContent = translate('settings.buttons.reset', FALLBACK_TEXT.buttons.reset);
  };

  const updatePreviewChip = () => {
    if (!previewChip) {
      return;
    }
    const theme = manager.getTheme(selectedThemeId);
    const fallback = FALLBACK_THEME_TEXT[theme.id] || {};
    const name = translate(theme.labelKey, fallback.title || theme.id);
    const text = translate('settings.preview.chip', FALLBACK_TEXT.previewChip, { name });
    previewChip.textContent = text;
  };

  const updatePreview = () => {
    manager.applyPreview(selectedThemeId, previewContainer);
    updatePreviewChip();
  };

  const updateSelectionState = () => {
    themeRefs.forEach((refs, themeId) => {
      const isActive = themeId === selectedThemeId;
      refs.button.classList.toggle('is-active', isActive);
      refs.button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const updateOptionContent = (refs) => {
    const { theme, titleEl, descriptionEl, badgeEl, button } = refs;
    const fallback = FALLBACK_THEME_TEXT[theme.id] || {};
    const titleText = translate(theme.labelKey, fallback.title || theme.id);
    const descriptionText = translate(theme.descriptionKey, fallback.description || '');
    titleEl.textContent = titleText;
    titleEl.dataset.i18n = theme.labelKey;
    descriptionEl.textContent = descriptionText;
    descriptionEl.dataset.i18n = theme.descriptionKey;

    const badgeText = translate('settings.option.selectedTag', FALLBACK_TEXT.optionSelectedTag);
    badgeEl.textContent = badgeText;
    badgeEl.dataset.i18n = 'settings.option.selectedTag';

    const instantText = translate('settings.option.instantApply', FALLBACK_TEXT.optionInstantApply);
    const ariaLabelParts = [titleText];
    if (descriptionText) {
      ariaLabelParts.push(descriptionText);
    }
    ariaLabelParts.push(instantText);
    button.setAttribute('aria-label', ariaLabelParts.join('. '));
  };

  const updateAllOptionContent = () => {
    themeRefs.forEach((refs) => updateOptionContent(refs));
  };

  const buildOptionElement = (theme) => {
    const wrapper = document.createElement('button');
    wrapper.type = 'button';
    wrapper.className = 'background-option';
    wrapper.dataset.themeId = theme.id;

    const badge = document.createElement('span');
    badge.className = 'background-option-badge';
    wrapper.appendChild(badge);

    const preview = document.createElement('div');
    preview.className = 'background-option-preview';
    wrapper.appendChild(preview);
    manager.applyPreview(theme.id, preview);

    const titleEl = document.createElement('div');
    titleEl.className = 'background-option-title';
    wrapper.appendChild(titleEl);

    const descriptionEl = document.createElement('div');
    descriptionEl.className = 'background-option-description';
    wrapper.appendChild(descriptionEl);

    wrapper.addEventListener('click', () => {
      if (selectedThemeId === theme.id) {
        return;
      }
      selectedThemeId = theme.id;
      hideAlert();
      updateSelectionState();
      updatePreview();
    });

    const refs = { theme, button: wrapper, badgeEl: badge, previewEl: preview, titleEl, descriptionEl };
    themeRefs.set(theme.id, refs);
    updateOptionContent(refs);

    return wrapper;
  };

  const renderOptions = () => {
    optionsContainer.innerHTML = '';
    themes.forEach((theme) => {
      const el = buildOptionElement(theme);
      optionsContainer.appendChild(el);
    });
    updateSelectionState();
  };

  const handleSave = () => {
    hideAlert();
    updateSaveButtonLabel('saving');
    window.setTimeout(() => {
      try {
        const appliedId = manager.applyTheme(selectedThemeId);
        appliedThemeId = appliedId;
        updateSaveButtonLabel('saved');
        showAlert('success', 'settings.alerts.saved', FALLBACK_TEXT.alerts.saved);
        window.setTimeout(() => {
          updateSaveButtonLabel('default');
        }, 1200);
      } catch (error) {
        console.error('Failed to save background theme', error);
        updateSaveButtonLabel('default');
        showAlert('error', 'settings.alerts.error', FALLBACK_TEXT.alerts.error);
      }
    }, 100);
  };

  const handleReset = () => {
    hideAlert();
    selectedThemeId = manager.resetTheme();
    appliedThemeId = selectedThemeId;
    updateSelectionState();
    updatePreview();
    updateSaveButtonLabel('default');
    showAlert('info', 'settings.alerts.reset', FALLBACK_TEXT.alerts.reset);
  };

  const handleBeforeUnload = () => {
    if (selectedThemeId !== appliedThemeId) {
      manager.applyTheme(appliedThemeId);
    }
  };

  renderOptions();
  updatePreview();
  updateSaveButtonLabel('default');
  updateResetButtonLabel();

  saveButton.addEventListener('click', handleSave);
  resetButton.addEventListener('click', handleReset);
  window.addEventListener('beforeunload', handleBeforeUnload);

  // --- Font selection support ---
  const FONT_KEY = 'apsara-font';
  const fontSelect = document.getElementById('fontSelect');
  const fontPreview = document.getElementById('fontPreview');
  const saveFontBtn = document.getElementById('saveFontBtn');
  const resetFontBtn = document.getElementById('resetFontBtn');

  // Attempt to load a fonts manifest generated server-side (client/fonts/fonts.json).
  // Manifest format: [{ id, label, family, filename }] where filename is relative to /fonts/.
  const DEFAULT_FONT_OPTIONS = [
    { id: 'battambang', label: 'Kh Battambang', family: "'Battambang', 'Noto Sans Khmer', serif" },
    { id: 'bokor', label: 'Kh Bokor', family: "'Bokor', 'Noto Sans Khmer', serif" },
    { id: 'writhand', label: 'Kh Writhand', family: "'Writhand', 'Noto Sans Khmer', serif" },
    { id: 'khmer-s4', label: 'Khmer S4', family: "'Khmer S4', 'Noto Sans Khmer', serif" },
    { id: 'sbbic-serif', label: 'Khmer SBBIC Serif', family: "'Khmer SBBIC Serif', 'Noto Serif', serif" },
    { id: 'arial', label: 'Arial', family: "Arial, Helvetica, sans-serif" },
    { id: 'times-new-roman', label: 'Times New Roman', family: "'Times New Roman', Times, serif" }
  ];

  // Candidate Khmer / local fonts to probe on the user's system
  const CANDIDATE_SYSTEM_KHMER_FONTS = [
    'Battambang', 'Bokor', 'Noto Sans Khmer', 'Khmer OS System', 'Khmer OS', 'Khmer OS Siemreap',
    'Khmer OS Muol', 'Khmer OS Muol Light', 'Khmer SBBIC Serif', 'Khmer S4', 'Writhand',
    'Kantumruy', 'Khmer UI', 'Moul', 'Limon', 'Hanuman'
  ];

  // Check whether a font is available on the system/browser.
  // Prefer FontFaceSet.check if available, otherwise use a width-measurement fallback.
  const isFontAvailable = (fontName) => {
    try {
      if (document.fonts && typeof document.fonts.check === 'function') {
        // check will return true for available local or loaded fonts
        return document.fonts.check(`12px "${fontName}"`);
      }
    } catch (e) {
      // ignore and fallback
    }

    // Fallback measurement technique: compare widths between target font and generic fallback
    try {
      const testString = 'បុរីគុជអាស៊ី';
      const span = document.createElement('span');
      span.style.position = 'absolute';
      span.style.left = '-9999px';
      span.style.fontSize = '48px';
      span.style.fontFamily = `${fontName}, monospace`;
      span.textContent = testString;
      document.body.appendChild(span);
      const widthWithFont = span.getBoundingClientRect().width;
      span.style.fontFamily = 'monospace';
      const widthWithMono = span.getBoundingClientRect().width;
      document.body.removeChild(span);
      return Math.abs(widthWithFont - widthWithMono) > 0.1;
    } catch (err) {
      return false;
    }
  };

  // Probe a list of candidate fonts and return those available on the system
  const detectAvailableFonts = (candidates) => {
    const found = [];
    if (!Array.isArray(candidates)) return found;
    for (const name of candidates) {
      try {
        if (isFontAvailable(name)) {
          found.push(name);
        }
      } catch (e) {
        // continue
      }
    }
    return found;
  };

  const applyFont = (fontId, family) => {
    if (!fontId) {
      document.documentElement.removeAttribute('data-font');
      if (fontPreview) fontPreview.style.fontFamily = '';
      // remove any previously-set CSS variables so fallback applies
      document.documentElement.style.removeProperty('--app-font');
      document.documentElement.style.removeProperty('--khmer-font');
      return;
    }
    document.documentElement.setAttribute('data-font', fontId);
    if (fontPreview && family) {
      fontPreview.style.fontFamily = family;
    }
    // set CSS variables so the font applies globally and in print immediately
    if (family) {
      document.documentElement.style.setProperty('--app-font', family);
      document.documentElement.style.setProperty('--khmer-font', family);
    }
  };

  const populateFontSelect = (options) => {
    if (!fontSelect) return;
    fontSelect.innerHTML = '';
    options.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt.id;
      o.textContent = opt.label || opt.id;
      o.dataset.family = opt.family || '';
      fontSelect.appendChild(o);
    });
    const stored = localStorage.getItem(FONT_KEY) || '';
    if (stored) {
      fontSelect.value = stored;
      const selected = options.find(o => o.id === stored);
      if (selected) applyFont(stored, selected.family);
    }

    fontSelect.addEventListener('change', (e) => {
      const id = e.target.value;
      const family = e.target.selectedOptions[0].dataset.family;
      applyFont(id, family);
      // Auto-save selection so it applies across pages and browser sessions immediately
      try {
        if (id) {
          localStorage.setItem(FONT_KEY, id);
        } else {
          localStorage.removeItem(FONT_KEY);
        }
      } catch (err) {
        // ignore storage errors
        console.warn('Failed to auto-save font selection', err);
      }
    });
  };

  // Try to load a generated manifest `fonts/fonts.json` placed in client/fonts/.
  async function loadFontsManifest() {
    try {
      const resp = await fetch('fonts/fonts.json', { cache: 'no-store' });
      if (!resp.ok) throw new Error('No manifest');
      const list = await resp.json();
      // Expected list entries: { id, label, family, filename }
      const opts = list.map(f => ({ id: f.id, label: f.label || f.id, family: f.family || f.label || f.id }));

      // Detect system-installed Khmer fonts and add them if not already present
      try {
        const detected = detectAvailableFonts(CANDIDATE_SYSTEM_KHMER_FONTS);
        detected.forEach(name => {
          const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          if (!opts.find(o => o.id === id) && !DEFAULT_FONT_OPTIONS.find(o => o.id === id)) {
            opts.push({ id, label: name, family: `"${name}", 'Noto Sans Khmer', serif` });
          }
        });
      } catch (err) {
        // non-fatal
        console.warn('Font detection failed', err);
      }

      populateFontSelect(opts.length ? opts : DEFAULT_FONT_OPTIONS);
    } catch (err) {
      // Fallback to built-in defaults
      // If manifest not found, still augment defaults with detected system fonts
      try {
        const detected = detectAvailableFonts(CANDIDATE_SYSTEM_KHMER_FONTS);
        const augmented = DEFAULT_FONT_OPTIONS.slice();
        detected.forEach(name => {
          const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          if (!augmented.find(o => o.id === id)) {
            augmented.push({ id, label: name, family: `"${name}", 'Noto Sans Khmer', serif` });
          }
        });
        populateFontSelect(augmented);
      } catch (e) {
        populateFontSelect(DEFAULT_FONT_OPTIONS);
      }
    }
  }

  // load on init
  loadFontsManifest();

  // Support manual refresh (button) so users can copy fonts into client/fonts/ and refresh without reloading page
  const refreshFontsBtn = document.getElementById('refreshFontsBtn');
  if (refreshFontsBtn) {
    refreshFontsBtn.addEventListener('click', async () => {
      try {
        refreshFontsBtn.disabled = true;
        await loadFontsManifest();
        showAlert('success', 'settings.alerts.saved', FALLBACK_TEXT.alerts.saved);
      } catch (err) {
        console.error('Failed to refresh fonts manifest', err);
        showAlert('error', 'settings.alerts.error', FALLBACK_TEXT.alerts.error);
      } finally {
        refreshFontsBtn.disabled = false;
      }
    });
  }

  if (saveFontBtn) {
    saveFontBtn.addEventListener('click', () => {
      const id = fontSelect ? fontSelect.value : '';
      try {
        if (id) {
          localStorage.setItem(FONT_KEY, id);
        } else {
          localStorage.removeItem(FONT_KEY);
        }
        showAlert('success', 'settings.alerts.saved', FALLBACK_TEXT.alerts.saved);
      } catch (err) {
        console.error('Failed to save font setting', err);
        showAlert('error', 'settings.alerts.error', FALLBACK_TEXT.alerts.error);
      }
    });
  }

  if (resetFontBtn) {
    resetFontBtn.addEventListener('click', () => {
      try {
        localStorage.removeItem(FONT_KEY);
        if (fontSelect) fontSelect.value = '';
        applyFont('');
        showAlert('info', 'settings.alerts.reset', FALLBACK_TEXT.alerts.reset);
      } catch (err) {
        console.error('Failed to reset font setting', err);
        showAlert('error', 'settings.alerts.error', FALLBACK_TEXT.alerts.error);
      }
    });
  }

  if (window.I18n && typeof window.I18n.onChange === 'function') {
    window.I18n.onChange(() => {
      updateAllOptionContent();
      updatePreviewChip();
      updateSaveButtonLabel(saveState);
      updateResetButtonLabel();
    });
  }
})();
