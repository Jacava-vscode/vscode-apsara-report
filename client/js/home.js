'use strict';

(function () {
    const AUTH_STATE_KEY = 'apsara-auth-state';
    const AUTH_PROFILE_KEY = 'apsara-auth-profile';
    const AUTH_TOKEN_STORAGE_KEY = 'apsara-auth-token';
    const ADMIN_PAGE_URL = 'admin.html';

    let recentItemsData = [];
    let authToken = null;
    let currentProfile = null;

    const sessionStore = (() => {
        try {
            return window.sessionStorage;
        } catch (error) {
            return null;
        }
    })();

    const translate = (key, options) => {
        if (window.I18n && typeof window.I18n.t === 'function') {
            return window.I18n.t(key, options);
        }
        if (options && typeof options.fallback === 'string') {
            return options.fallback;
        }
        return key;
    };

    const safeJsonParse = (raw) => {
        if (!raw) {
            return null;
        }
        try {
            return JSON.parse(raw);
        } catch (error) {
            return null;
        }
    };

    const readSessionItem = (key) => (sessionStore ? sessionStore.getItem(key) : null);

    const writeSessionItem = (key, value) => {
        if (!sessionStore) {
            return;
        }
        try {
            sessionStore.setItem(key, value);
        } catch (error) {
            /* storage unavailable */
        }
    };

    const removeSessionItem = (key) => {
        if (!sessionStore) {
            return;
        }
        sessionStore.removeItem(key);
    };

    const persistAuthState = (profile, token) => {
        writeSessionItem(AUTH_STATE_KEY, 'true');
        writeSessionItem(AUTH_PROFILE_KEY, JSON.stringify(profile));
        writeSessionItem(AUTH_TOKEN_STORAGE_KEY, token);
    authToken = token;
    currentProfile = profile;
    };

    const clearAuthState = () => {
        removeSessionItem(AUTH_STATE_KEY);
        removeSessionItem(AUTH_PROFILE_KEY);
        removeSessionItem(AUTH_TOKEN_STORAGE_KEY);
    authToken = null;
    currentProfile = null;
    };

    const setLoginLoading = (isLoading) => {
        const submitButton = document.querySelector('.btn-login');
        if (!submitButton) {
            return;
        }
        if (isLoading) {
            if (!submitButton.dataset.defaultLabel) {
                submitButton.dataset.defaultLabel = submitButton.textContent;
            }
            submitButton.disabled = true;
            submitButton.textContent = translate('login.loading', { fallback: 'Signing in...' });
        } else {
            submitButton.disabled = false;
            if (submitButton.dataset.defaultLabel) {
                submitButton.textContent = submitButton.dataset.defaultLabel;
            }
        }
    };

    const setNavAdminVisibility = (visible) => {
        const navLink = document.getElementById('navAdminLink');
        if (!navLink) {
            return;
        }
        if (visible) {
            navLink.classList.remove('is-hidden');
        } else {
            navLink.classList.add('is-hidden');
        }
    };

    const setAdminControlsState = (canAccessAdmin) => {
        setNavAdminVisibility(canAccessAdmin);
        const adminButton = document.getElementById('openAdminPage');
        const storageRefresh = document.getElementById('refreshStorageBtn');
        if (adminButton) {
            adminButton.disabled = !canAccessAdmin;
            adminButton.setAttribute('aria-disabled', canAccessAdmin ? 'false' : 'true');
        }
        if (storageRefresh) {
            storageRefresh.disabled = !canAccessAdmin;
            storageRefresh.setAttribute('aria-disabled', canAccessAdmin ? 'false' : 'true');
        }
    };

    const updateAdminPanel = (profile) => {
        currentProfile = profile;
        const nameField = document.getElementById('adminName');
        const roleField = document.getElementById('adminRole');
        const initialsField = document.getElementById('adminInitials');
        const metaField = document.getElementById('adminMeta');

        if (!profile) {
            if (roleField) {
                roleField.textContent = 'Administrator';
            }
            if (nameField) {
                nameField.textContent = 'Administrator';
            }
            if (initialsField) {
                initialsField.textContent = 'AD';
            }
            if (metaField) {
                metaField.textContent = translate('index.adminMeta', { fallback: 'Signed in with elevated privileges.' });
            }
            return;
        }

        const { name, role, signedInAt } = profile;
        if (roleField) {
            roleField.textContent = role || 'Administrator';
        }
        if (nameField) {
            nameField.textContent = name || 'Administrator';
        }
        if (initialsField) {
            const safeName = name || 'Administrator';
            const initials = safeName
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((segment) => segment[0]?.toUpperCase() || '')
                .join('');
            initialsField.textContent = initials || 'AD';
        }
        if (metaField) {
            const signedInDate = signedInAt ? new Date(signedInAt) : new Date();
            const formatted = signedInDate.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
            metaField.textContent = translate('index.adminMetaSignedIn', {
                fallback: `Signed in on ${formatted}`,
                params: { timestamp: formatted }
            });
        }
    };

    const renderRecentItems = (items) => {
        const container = document.getElementById('recentItems');
        if (!container) {
            return;
        }

        if (!items || items.length === 0) {
            container.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">${translate('index.noEquipmentHtml', { fallback: 'No equipment registered yet. <a href="form.html">Add your first entry</a>' })}</p>`;
            return;
        }

        const headerLabels = [
            { key: 'common.labels.type', fallback: 'Type' },
            { key: 'common.labels.brand', fallback: 'Brand' },
            { key: 'common.labels.model', fallback: 'Model' },
            { key: 'common.labels.status', fallback: 'Status' },
            { key: 'common.labels.dateAdded', fallback: 'Date Check-in' }
        ];

        const headerRow = headerLabels
            .map((label) => `<th>${translate(label.key, { fallback: label.fallback })}</th>`)
            .join('');

        const rows = items.map((item) => {
            const typeLabel = translate(`types.${item.type}`, { fallback: item.type });
            const statusLabel = translate(`status.${item.status}`, { fallback: item.status });
            const badgeClass =
                item.status === 'working' || item.status === 'done'
                    ? 'success'
                    : item.status === 'maintenance'
                        ? 'warning'
                        : 'danger';
            return `
                <tr>
                    <td><span class="badge badge-info">${typeLabel}</span></td>
                    <td>${item.brand}</td>
                    <td>${item.model}</td>
                    <td><span class="badge badge-${badgeClass}">${statusLabel}</span></td>
                    <td>${Utils.formatDate(item.checkInDate || item.createdAt)}</td>
                </tr>
            `;
        }).join('');

        container.innerHTML = `
            <table>
                <thead>
                    <tr>${headerRow}</tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    };

    const loadQuickStats = async () => {
        try {
            const stats = await API.getStats();
            const totalEl = document.getElementById('totalEquipment');
            const computersEl = document.getElementById('totalComputers');
            const printersEl = document.getElementById('totalPrinters');
            if (totalEl) {
                totalEl.textContent = stats.total;
            }
            if (computersEl) {
                computersEl.textContent = stats.computers;
            }
            if (printersEl) {
                printersEl.textContent = stats.printers;
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const loadRecentItems = async () => {
        try {
            const equipment = await API.getEquipment();
            recentItemsData = equipment.slice(-5).reverse();
            renderRecentItems(recentItemsData);
        } catch (error) {
            console.error('Error loading recent items:', error);
            const container = document.getElementById('recentItems');
            if (container) {
                container.innerHTML = `<p class="alert alert-error">${translate('messages.loadRecentItemsError', { fallback: 'Failed to load recent items' })}</p>`;
            }
        }
    };

    const resetDashboardWidgets = () => {
        const totalEl = document.getElementById('totalEquipment');
        const computersEl = document.getElementById('totalComputers');
        const printersEl = document.getElementById('totalPrinters');
        if (totalEl) {
            totalEl.textContent = '0';
        }
        if (computersEl) {
            computersEl.textContent = '0';
        }
        if (printersEl) {
            printersEl.textContent = '0';
        }
        const container = document.getElementById('recentItems');
        if (container) {
            container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        }
    };

    const toggleAppVisibility = (isAuthenticated, profile) => {
        const overlay = document.getElementById('loginOverlay');
        const shell = document.getElementById('appContent');
        if (!overlay || !shell) {
            return;
        }

        if (isAuthenticated) {
            overlay.classList.add('is-hidden');
            shell.classList.remove('is-hidden');
            shell.classList.add('is-active');
            updateAdminPanel(profile);
            const hasAdminAccess = Boolean(profile?.permissions?.admin);
            setAdminControlsState(hasAdminAccess);
            loadQuickStats();
            loadRecentItems();
            if (window.StorageMonitor && typeof window.StorageMonitor.load === 'function') {
                window.StorageMonitor.load();
            }
        } else {
            overlay.classList.remove('is-hidden');
            shell.classList.add('is-hidden');
            shell.classList.remove('is-active');
            updateAdminPanel(null);
            setAdminControlsState(false);
            recentItemsData = [];
            resetDashboardWidgets();
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.reset();
                const usernameField = loginForm.querySelector('#loginUsername');
                if (usernameField && typeof usernameField.focus === 'function') {
                    usernameField.focus();
                }
            }
            const loginError = document.getElementById('loginError');
            if (loginError) {
                loginError.textContent = '';
            }
        }
    };

    const hydrateExistingSession = async () => {
        const storedToken = readSessionItem(AUTH_TOKEN_STORAGE_KEY);
        if (!storedToken) {
            clearAuthState();
            toggleAppVisibility(false);
            return;
        }

        try {
            const result = await API.auth.me(storedToken);
            const nextToken = result.token || storedToken;
            persistAuthState(result.user, nextToken);
            toggleAppVisibility(true, result.user);
        } catch (error) {
            console.warn('Session restoration failed:', error);
            clearAuthState();
            toggleAppVisibility(false);
        }
    };

    const attachLoginInteractions = () => {
        const loginForm = document.getElementById('loginForm');
        const loginError = document.getElementById('loginError');
        const logoutButton = document.getElementById('logoutBtn');
        const openAdminButton = document.getElementById('openAdminPage');

        if (loginForm) {
            loginForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                setLoginLoading(true);
                const formData = new FormData(loginForm);
                const username = (formData.get('username') || '').toString().trim();
                const password = (formData.get('password') || '').toString();

                if (!username || !password) {
                    if (loginError) {
                        loginError.textContent = translate('login.error.missingFields', { fallback: 'Enter your username and password to continue.' });
                    }
                    setLoginLoading(false);
                    return;
                }

                try {
                    const result = await API.auth.login(username, password);
                    persistAuthState(result.user, result.token);
                    toggleAppVisibility(true, result.user);
                    if (loginError) {
                        loginError.textContent = '';
                    }
                    loginForm.reset();
                } catch (error) {
                    console.error('Login failed:', error);
                    if (loginError) {
                        if (error?.status === 503) {
                            loginError.textContent = translate('login.error.clusterUnavailable', { fallback: 'Role directory cluster is unavailable. Try again shortly.' });
                        } else if (error?.status === 401) {
                            loginError.textContent = translate('login.error.invalid', { fallback: 'Invalid username or password. Try again.' });
                        } else if (error?.status === 0 || error?.message === 'Failed to fetch') {
                            loginError.textContent = translate('login.error.serverUnavailable', { fallback: 'Unable to reach the server. Check your connection.' });
                        } else {
                            loginError.textContent = error?.message || translate('login.error.generic', { fallback: 'Login failed. Please try again.' });
                        }
                    }
                    clearAuthState();
                    toggleAppVisibility(false);
                }
                setLoginLoading(false);
            });
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', async () => {
                try {
                    await API.auth.logout(authToken);
                } catch (error) {
                    console.warn('Logout request failed:', error);
                }
                clearAuthState();
                toggleAppVisibility(false);
            });
        }

        if (openAdminButton) {
            openAdminButton.addEventListener('click', () => {
                if (!authToken) {
                    toggleAppVisibility(false);
                    return;
                }
                if (!currentProfile || !currentProfile.permissions || !currentProfile.permissions.admin) {
                    window.alert(translate('adminConsole.error.forbidden', { fallback: 'Administrator permissions are required to open the admin console.' }));
                    return;
                }
                window.location.href = ADMIN_PAGE_URL;
            });
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        attachLoginInteractions();
        toggleAppVisibility(false);
        hydrateExistingSession().catch(() => {});

        if (window.I18n && typeof window.I18n.onChange === 'function') {
            window.I18n.onChange(() => {
                renderRecentItems(recentItemsData);
                const storedProfile = safeJsonParse(readSessionItem(AUTH_PROFILE_KEY));
                if (storedProfile) {
                    updateAdminPanel(storedProfile);
                    setAdminControlsState(Boolean(storedProfile.permissions?.admin));
                } else {
                    setAdminControlsState(false);
                }
            });
        }
    });

    window.addEventListener('apsara:unauthorized', () => {
        clearAuthState();
        toggleAppVisibility(false);
    });
})();
