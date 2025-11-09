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

  if (window.I18n && typeof window.I18n.onChange === 'function') {
    window.I18n.onChange(() => {
      updateAllOptionContent();
      updatePreviewChip();
      updateSaveButtonLabel(saveState);
      updateResetButtonLabel();
    });
  }
})();
