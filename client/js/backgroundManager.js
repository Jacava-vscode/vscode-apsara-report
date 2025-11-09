'use strict';

(function () {
  const STORAGE_KEY = 'apsara-background-theme';
  const DEFAULT_THEME_ID = 'default';

  const THEMES = [
    {
      id: 'default',
      classes: [],
      previewClasses: ['bg-theme-default'],
      labelKey: 'settings.options.default.title',
      descriptionKey: 'settings.options.default.description'
    },
    {
      id: 'techLoop',
      classes: ['bg-animated', 'bg-theme-tech-loop'],
      previewClasses: ['bg-animated', 'bg-theme-tech-loop'],
      labelKey: 'settings.options.techLoop.title',
      descriptionKey: 'settings.options.techLoop.description'
    },
    {
      id: 'techWorld',
      classes: ['bg-animated', 'bg-theme-tech-world'],
      previewClasses: ['bg-animated', 'bg-theme-tech-world'],
      labelKey: 'settings.options.techWorld.title',
      descriptionKey: 'settings.options.techWorld.description'
    },
    {
      id: 'futuristicHud',
      classes: ['bg-animated', 'bg-theme-futuristic-hud'],
      previewClasses: ['bg-animated', 'bg-theme-futuristic-hud'],
      labelKey: 'settings.options.futuristicHud.title',
      descriptionKey: 'settings.options.futuristicHud.description'
    },
    {
      id: 'signalTech',
      classes: ['bg-animated', 'bg-theme-signal-tech'],
      previewClasses: ['bg-animated', 'bg-theme-signal-tech'],
      labelKey: 'settings.options.signalTech.title',
      descriptionKey: 'settings.options.signalTech.description'
    },
    {
      id: 'smartCity',
      classes: ['bg-animated', 'bg-theme-smart-city'],
      previewClasses: ['bg-animated', 'bg-theme-smart-city'],
      labelKey: 'settings.options.smartCity.title',
      descriptionKey: 'settings.options.smartCity.description'
    },
    {
      id: 'blueData',
      classes: ['bg-animated', 'bg-theme-blue-data'],
      previewClasses: ['bg-animated', 'bg-theme-blue-data'],
      labelKey: 'settings.options.blueData.title',
      descriptionKey: 'settings.options.blueData.description'
    },
    {
      id: 'shootingStars',
      classes: ['bg-animated', 'bg-theme-shooting-stars'],
      previewClasses: ['bg-animated', 'bg-theme-shooting-stars'],
      labelKey: 'settings.options.shootingStars.title',
      descriptionKey: 'settings.options.shootingStars.description'
    },
    {
      id: 'blueParticles',
      classes: ['bg-animated', 'bg-theme-blue-particles'],
      previewClasses: ['bg-animated', 'bg-theme-blue-particles'],
      labelKey: 'settings.options.blueParticles.title',
      descriptionKey: 'settings.options.blueParticles.description'
    }
  ];

  const themeMap = THEMES.reduce((accumulator, theme) => {
    accumulator[theme.id] = theme;
    return accumulator;
  }, {});

  const classPool = Array.from(new Set(THEMES.flatMap((theme) => {
    const collect = [];
    if (Array.isArray(theme.classes)) {
      collect.push(...theme.classes);
    }
    if (Array.isArray(theme.previewClasses)) {
      collect.push(...theme.previewClasses);
    }
    return collect;
  })));

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

  let appliedThemeId = DEFAULT_THEME_ID;

  const removeThemeClasses = (element) => {
    if (!element || !classPool.length) {
      return;
    }
    element.classList.remove(...classPool);
  };

  const applyThemeClasses = (element, themeClasses) => {
    if (!element) {
      return;
    }
    removeThemeClasses(element);
    element.classList.remove('bg-animated');
    if (Array.isArray(themeClasses) && themeClasses.length > 0) {
      element.classList.add(...themeClasses);
    }
  };

  const getStoredThemeId = () => {
    const stored = safeStorage.get(STORAGE_KEY);
    if (stored && Object.prototype.hasOwnProperty.call(themeMap, stored)) {
      return stored;
    }
    return DEFAULT_THEME_ID;
  };

  const syncTheme = (theme) => {
    const targets = [];
    if (document.body) {
      targets.push(document.body);
    }
    const overlay = document.getElementById('loginOverlay');
    if (overlay) {
      targets.push(overlay);
    }
    targets.forEach((target) => {
      applyThemeClasses(target, theme.classes);
    });
    appliedThemeId = theme.id;
  };

  const persistTheme = (themeId) => {
    if (themeId === DEFAULT_THEME_ID) {
      safeStorage.remove(STORAGE_KEY);
    } else {
      safeStorage.set(STORAGE_KEY, themeId);
    }
  };

  const setTheme = (themeId) => {
    const theme = themeMap[themeId] || themeMap[DEFAULT_THEME_ID];
    persistTheme(theme.id);
    syncTheme(theme);
    return theme.id;
  };

  const applyInitialTheme = () => {
    const initialId = getStoredThemeId();
    const theme = themeMap[initialId] || themeMap[DEFAULT_THEME_ID];
    syncTheme(theme);
  };

  const applyPreview = (themeId, element) => {
    if (!element) {
      return;
    }
    const theme = themeMap[themeId] || themeMap[DEFAULT_THEME_ID];
    const previewClasses = Array.isArray(theme.previewClasses) && theme.previewClasses.length > 0
      ? theme.previewClasses
      : theme.classes;
    applyThemeClasses(element, previewClasses);
  };

  const getThemeDefinition = (themeId) => themeMap[themeId] || themeMap[DEFAULT_THEME_ID];

  const getThemes = () => THEMES.map((theme) => ({ ...theme }));

  const resetTheme = () => setTheme(DEFAULT_THEME_ID);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyInitialTheme, { once: true });
  } else {
    applyInitialTheme();
  }

  window.BackgroundManager = {
    getThemes,
    getTheme: getThemeDefinition,
    getCurrentTheme: () => appliedThemeId,
    applyTheme: setTheme,
    resetTheme,
    applyPreview
  };
})();
