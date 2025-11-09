'use strict';

(function () {
    const AUTH_STATE_KEY = 'apsara-auth-state';
    const AUTH_PROFILE_KEY = 'apsara-auth-profile';
    const AUTH_TOKEN_STORAGE_KEY = 'apsara-auth-token';

    const PERMISSION_KEYS = ['view', 'add', 'edit', 'delete', 'admin'];
    const PERMISSION_ID_MAP = Object.freeze({
        view: 'permView',
        add: 'permAdd',
        edit: 'permEdit',
        delete: 'permDelete',
        admin: 'permAdmin'
    });
    const PERMISSION_PRESETS = Object.freeze({
        Administrator: { view: true, add: true, edit: true, delete: true, admin: true },
        'Storage Analyst': { view: true, add: true, edit: true, delete: false, admin: false },
        Viewer: { view: true, add: false, edit: false, delete: false, admin: false },
        Custom: null
    });

    let authToken = null;
    let adminUsers = [];
    let editingUser = null;
    let activeAdmin = null;
    let panelSubmitButton = null;

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

    const escapeHtml = (value) => String(value ?? '')
        .replace(/[&<>"']/g, (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[char]);

    const sessionStore = (() => {
        try {
            return window.sessionStorage;
        } catch (error) {
            return null;
        }
    })();

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
        activeAdmin = profile || null;
    };

    const clearAuthState = () => {
        removeSessionItem(AUTH_STATE_KEY);
        removeSessionItem(AUTH_PROFILE_KEY);
        removeSessionItem(AUTH_TOKEN_STORAGE_KEY);
        authToken = null;
        activeAdmin = null;
        editingUser = null;
    };

    const getPermissionCheckbox = (key) => {
        const elementId = PERMISSION_ID_MAP[key];
        return elementId ? document.getElementById(elementId) : null;
    };

    const setPermissionCheckbox = (key, value) => {
        const checkbox = getPermissionCheckbox(key);
        if (checkbox) {
            checkbox.checked = Boolean(value);
        }
    };

    const sanitizePermissions = (input = {}) => {
        const base = { view: false, add: false, edit: false, delete: false, admin: false };
        PERMISSION_KEYS.forEach((key) => {
            if (input[key]) {
                base[key] = true;
            }
        });
        if (base.admin) {
            base.view = true;
            base.add = true;
            base.edit = true;
            base.delete = true;
        }
        return base;
    };

    const formatDate = (iso) => {
        if (!iso) {
            return '-';
        }
        const date = new Date(iso);
        if (Number.isNaN(date.getTime())) {
            return iso;
        }
        return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    };

    const buildPermissionBadges = (permissions) => {
        const normalized = sanitizePermissions(permissions);
        if (normalized.admin) {
            return `<span class="permission-badge admin">${translate('adminConsole.badge.admin', { fallback: 'Administrator' })}</span>`;
        }

        const badges = [];
        if (normalized.view) {
            badges.push(`<span class="permission-badge">${translate('adminConsole.badge.view', { fallback: 'View' })}</span>`);
        }
        if (normalized.add) {
            badges.push(`<span class="permission-badge">${translate('adminConsole.badge.add', { fallback: 'Add Data' })}</span>`);
        }
        if (normalized.edit) {
            badges.push(`<span class="permission-badge">${translate('adminConsole.badge.edit', { fallback: 'Edit' })}</span>`);
        }
        if (normalized.delete) {
            badges.push(`<span class="permission-badge">${translate('adminConsole.badge.delete', { fallback: 'Delete' })}</span>`);
        }

        if (!badges.length) {
            badges.push(`<span class="permission-badge">${translate('adminConsole.badge.none', { fallback: 'No Access' })}</span>`);
        }
        return badges.join('');
    };

    const renderAdminUsers = () => {
        const tableBody = document.getElementById('panelUserTableBody');
        const countLabel = document.getElementById('panelUserCount');
        if (!tableBody) {
            return;
        }

        if (!adminUsers.length) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 1.75rem; color: var(--text-secondary);">${translate('adminConsole.table.empty', { fallback: 'No users yet. Add your first teammate.' })}</td></tr>`;
            if (countLabel) {
                countLabel.textContent = '0';
            }
            return;
        }

        const rows = adminUsers.map((user) => {
            const usernameRaw = user.username || '';
            const username = escapeHtml(usernameRaw);
            const displayName = escapeHtml(user.displayName || user.username || '');
            const role = escapeHtml(user.role || 'Custom');
            const permissions = buildPermissionBadges(user.permissions);
            const created = escapeHtml(formatDate(user.createdAt));
            const isCurrentUser = Boolean(activeAdmin && activeAdmin.username && activeAdmin.username.toLowerCase() === usernameRaw.toLowerCase());
            const isEditing = Boolean(editingUser && editingUser.toLowerCase() === usernameRaw.toLowerCase());
            const cannotDeleteMessage = translate('adminConsole.action.cannotDeleteSelf', { fallback: 'You cannot delete the account you are signed in with.' });
            const deleteDisabledAttributes = isCurrentUser
                ? ' disabled aria-disabled="true" title="' + escapeHtml(cannotDeleteMessage) + '"'
                : '';
            const editLabel = translate('buttons.edit', { fallback: 'Edit' });
            const deleteLabel = translate('buttons.delete', { fallback: 'Delete' });
            const rowClass = isEditing ? ' class="is-editing"' : '';

            return `
                <tr${rowClass}>
                    <td>
                        <div style="font-weight: 600;">${username}</div>
                        <div style="color: var(--text-secondary); font-size: 0.85rem;">${displayName}</div>
                    </td>
                    <td><span class="badge badge-secondary">${role}</span></td>
                    <td>${permissions}</td>
                    <td>${created}</td>
                    <td>
                        <div class="action-buttons">
                            <button type="button" class="btn btn-sm btn-secondary js-edit-user" data-action="edit-user" data-username="${username}" aria-label="${escapeHtml(editLabel)} ${username}">${escapeHtml(editLabel)}</button>
                            <button type="button" class="btn btn-sm btn-danger js-delete-user" data-action="delete-user" data-username="${username}"${deleteDisabledAttributes}>${escapeHtml(deleteLabel)}</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        tableBody.innerHTML = rows;
        if (countLabel) {
            countLabel.textContent = String(adminUsers.length);
        }
    };

    const setPanelMessage = (message, isError = false) => {
        const messageEl = document.getElementById('panelMessage');
        if (!messageEl) {
            return;
        }
        messageEl.textContent = message || '';
        if (isError) {
            messageEl.classList.add('error');
        } else {
            messageEl.classList.remove('error');
        }
    };

    const collectPermissionState = () => {
        const permissions = PERMISSION_KEYS.reduce((acc, key) => {
            acc[key] = Boolean(getPermissionCheckbox(key)?.checked);
            return acc;
        }, {});
        if (permissions.admin) {
            permissions.view = true;
            permissions.add = true;
            permissions.edit = true;
            permissions.delete = true;
        }
        return permissions;
    };

    const applyPermissionPreset = (role) => {
        const preset = PERMISSION_PRESETS[role];
        if (!preset) {
            return;
        }
        PERMISSION_KEYS.forEach((key) => setPermissionCheckbox(key, preset[key]));
    };

    const resetPanelForm = () => {
        const usernameInput = document.getElementById('panelUsername');
        const displayInput = document.getElementById('panelDisplayName');
        const roleSelect = document.getElementById('panelRole');
        const passwordInput = document.getElementById('panelPassword');

        editingUser = null;

        if (usernameInput) {
            usernameInput.value = '';
            usernameInput.disabled = false;
            usernameInput.removeAttribute('aria-readonly');
            usernameInput.removeAttribute('data-original-username');
            usernameInput.focus();
        }
        if (displayInput) {
            displayInput.value = '';
        }
        if (roleSelect) {
            roleSelect.value = 'Administrator';
        }
        if (passwordInput) {
            passwordInput.value = '';
            const defaultPlaceholder = passwordInput.getAttribute('data-default-placeholder') || 'Set a password';
            passwordInput.setAttribute('placeholder', defaultPlaceholder);
        }
        applyPermissionPreset('Administrator');
        if (panelSubmitButton) {
            panelSubmitButton.textContent = translate('adminConsole.addUser', { fallback: 'Add User' });
            panelSubmitButton.setAttribute('data-i18n', 'adminConsole.addUser');
        }
        setPanelMessage('');
    };

    const updateAdminPanel = (profile) => {
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

    const setPermissionCheckboxesFromUser = (permissions) => {
        const sanitized = sanitizePermissions(permissions);
        PERMISSION_KEYS.forEach((key) => setPermissionCheckbox(key, sanitized[key]));
    };

    const beginEditingUser = (user) => {
        if (!user) {
            return;
        }

        const usernameInput = document.getElementById('panelUsername');
        const displayInput = document.getElementById('panelDisplayName');
        const roleSelect = document.getElementById('panelRole');
        const passwordInput = document.getElementById('panelPassword');

        editingUser = user.username || null;

        if (usernameInput) {
            usernameInput.value = user.username || '';
            usernameInput.disabled = true;
            usernameInput.setAttribute('aria-readonly', 'true');
            usernameInput.setAttribute('data-original-username', user.username || '');
            usernameInput.focus();
        }
        if (displayInput) {
            displayInput.value = user.displayName || '';
        }
        if (roleSelect) {
            const availableRoles = Object.keys(PERMISSION_PRESETS);
            const targetRole = availableRoles.includes(user.role) ? user.role : 'Custom';
            roleSelect.value = targetRole;
        }
        if (passwordInput) {
            passwordInput.value = '';
            const defaultPlaceholder = passwordInput.getAttribute('data-default-placeholder') || 'Set a password';
            const placeholder = translate('adminConsole.placeholder.passwordEdit', { fallback: 'Leave blank to keep current password' });
            passwordInput.setAttribute('placeholder', placeholder || defaultPlaceholder);
        }

        setPermissionCheckboxesFromUser(user.permissions);

        if (panelSubmitButton) {
            panelSubmitButton.textContent = translate('adminConsole.updateUser', { fallback: 'Update User' });
            panelSubmitButton.setAttribute('data-i18n', 'adminConsole.updateUser');
        }

        const editingMessage = translate('adminConsole.message.editingUser', {
            fallback: `Editing ${user.username}. Update details and save to apply changes.`,
            params: { username: user.username || '' }
        });
        setPanelMessage(editingMessage);

        document.getElementById('panelUserForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const showLoading = () => {
        document.getElementById('adminLoading')?.classList.remove('is-hidden');
        document.getElementById('adminError')?.classList.add('is-hidden');
        document.getElementById('adminShell')?.classList.add('is-hidden');
    };

    const showError = (message, options = {}) => {
        const errorCard = document.getElementById('adminError');
        const messageEl = document.getElementById('adminErrorMessage');
        const retryButton = document.getElementById('adminRetryBtn');
        document.getElementById('adminLoading')?.classList.add('is-hidden');
        document.getElementById('adminShell')?.classList.add('is-hidden');
        if (messageEl) {
            messageEl.textContent = message;
        }
        if (retryButton) {
            if (options.hideRetry) {
                retryButton.classList.add('is-hidden');
            } else {
                retryButton.classList.remove('is-hidden');
            }
        }
        if (errorCard) {
            errorCard.classList.remove('is-hidden');
        }
    };

    const showConsole = () => {
        document.getElementById('adminLoading')?.classList.add('is-hidden');
        document.getElementById('adminError')?.classList.add('is-hidden');
        document.getElementById('adminShell')?.classList.remove('is-hidden');
    };

    const handleEditUser = (username) => {
        const normalized = String(username || '').trim().toLowerCase();
        if (!normalized) {
            setPanelMessage(translate('adminConsole.error.usernameRequired', { fallback: 'Enter a username to continue.' }), true);
            return;
        }

        const target = adminUsers.find((user) => user.username.toLowerCase() === normalized);
        if (!target) {
            setPanelMessage(translate('adminConsole.error.userNotFound', { fallback: 'User not found. Refresh the list and try again.' }), true);
            return;
        }

        beginEditingUser(target);
    };

    const handleDeleteUser = async (username) => {
        const normalized = String(username || '').trim().toLowerCase();
        if (!normalized) {
            return;
        }

        const target = adminUsers.find((user) => user.username.toLowerCase() === normalized);
        if (!target) {
            setPanelMessage(translate('adminConsole.error.userNotFound', { fallback: 'User not found. Refresh the list and try again.' }), true);
            return;
        }

        if (activeAdmin && activeAdmin.username && activeAdmin.username.toLowerCase() === normalized) {
            setPanelMessage(translate('adminConsole.action.cannotDeleteSelf', { fallback: 'You cannot delete the account you are signed in with.' }), true);
            return;
        }

        if (!authToken) {
            setPanelMessage(translate('adminConsole.error.sessionRequired', { fallback: 'Session expired. Sign in again.' }), true);
            return;
        }

        const confirmationMessage = translate('adminConsole.confirm.deleteUser', { fallback: 'Are you sure you want to delete this user? This action cannot be undone.' });
        const confirmed = window.confirm(confirmationMessage);
        if (!confirmed) {
            return;
        }

        try {
            await API.auth.deleteUser(target.username, authToken);
            if (editingUser && editingUser.toLowerCase() === normalized) {
                resetPanelForm();
            }
            setPanelMessage(translate('adminConsole.success.deleted', { fallback: 'User deleted successfully.' }));
            await refreshAdminUsers({ silent: true });
        } catch (error) {
            console.error('Error deleting user:', error);
            const status = error?.status || 400;
            if (status === 401) {
                clearAuthState();
                showError(translate('adminConsole.error.sessionRequired', { fallback: 'Session expired. Please return to the homepage and sign in again.' }));
                return;
            }
            if (status === 403) {
                clearAuthState();
                showError(translate('adminConsole.error.forbidden', { fallback: 'Administrator permissions required. Please return to the homepage and sign in with an administrator account.' }), { hideRetry: true });
                return;
            }
            setPanelMessage(error?.message || translate('adminConsole.error.deleteFailed', { fallback: 'Unable to delete user.' }), true);
        }
    };

    const refreshAdminUsers = async (options = {}) => {
        if (!authToken) {
            adminUsers = [];
            renderAdminUsers();
            setPanelMessage(translate('adminConsole.error.sessionRequired', { fallback: 'Session expired. Sign in again.' }), true);
            return;
        }

        try {
            const users = await API.auth.listUsers(authToken);
            adminUsers = Array.isArray(users) ? users : [];
            renderAdminUsers();
            if (editingUser) {
                const normalized = editingUser.toLowerCase();
                const exists = adminUsers.some((user) => user.username.toLowerCase() === normalized);
                if (!exists) {
                    resetPanelForm();
                }
            }
            if (!options.silent) {
                setPanelMessage('');
            }
        } catch (error) {
            console.error('Error loading admin users:', error);
            if (error.status === 401) {
                clearAuthState();
                showError(translate('adminConsole.error.sessionRequired', { fallback: 'Session expired. Please return to the homepage and sign in again.' }));
                return;
            }
            if (error.status === 403) {
                clearAuthState();
                showError(translate('adminConsole.error.forbidden', { fallback: 'Administrator permissions required. Please return to the homepage and sign in with an administrator account.' }), { hideRetry: true });
                return;
            }
            setPanelMessage(error?.message || translate('adminConsole.error.loadUsers', { fallback: 'Unable to load user list right now.' }), true);
        }
    };

    const handlePanelFormSubmit = async (event) => {
        event.preventDefault();
        if (!authToken) {
            setPanelMessage(translate('adminConsole.error.sessionRequired', { fallback: 'Session expired. Sign in again.' }), true);
            return;
        }

        const usernameInput = document.getElementById('panelUsername');
        const displayInput = document.getElementById('panelDisplayName');
        const roleSelect = document.getElementById('panelRole');
        const passwordInput = document.getElementById('panelPassword');

        const usernameValue = (usernameInput?.value || '').trim();
        if (!usernameValue) {
            setPanelMessage(translate('adminConsole.error.usernameRequired', { fallback: 'Enter a username to continue.' }), true);
            usernameInput?.focus();
            return;
        }

        const normalizedUsername = usernameValue.toLowerCase();
        const existingUser = adminUsers.find((user) => user.username.toLowerCase() === normalizedUsername);
        const sanitizedPassword = (passwordInput?.value || '').trim();

        if (!existingUser && !sanitizedPassword) {
            setPanelMessage(translate('adminConsole.error.passwordRequired', { fallback: 'Assign a password before creating the account.' }), true);
            passwordInput?.focus();
            return;
        }

        const payload = {
            username: usernameValue,
            displayName: (displayInput?.value || '').trim() || usernameValue,
            role: roleSelect?.value || 'Custom',
            permissions: collectPermissionState(),
            isActive: true
        };

        if (sanitizedPassword) {
            payload.password = sanitizedPassword;
        }

        try {
            await API.auth.upsertUser(payload, authToken);
            const successMessage = existingUser
                ? translate('adminConsole.success.updated', { fallback: 'User updated successfully.' })
                : translate('adminConsole.success.added', { fallback: 'User added successfully.' });
            setPanelMessage(successMessage, false);
            await refreshAdminUsers({ silent: true });
            resetPanelForm();
        } catch (error) {
            console.error('Error saving user:', error);
            const status = error?.status || 400;
            if (status === 401) {
                clearAuthState();
                showError(translate('adminConsole.error.sessionRequired', { fallback: 'Session expired. Please return to the homepage and sign in again.' }));
                return;
            }
            if (status === 403) {
                clearAuthState();
                showError(translate('adminConsole.error.forbidden', { fallback: 'Administrator permissions required. Please return to the homepage and sign in with an administrator account.' }), { hideRetry: true });
                return;
            }
            setPanelMessage(error?.message || translate('adminConsole.error.saveFailed', { fallback: 'Failed to save user.' }), true);
        }
    };

    const attachEventHandlers = () => {
        const panelForm = document.getElementById('panelUserForm');
        const resetButton = document.getElementById('panelResetForm');
        const roleSelect = document.getElementById('panelRole');
        const refreshButton = document.getElementById('refreshUsersBtn');
        const backButton = document.getElementById('backToHomeBtn');
        const logoutButton = document.getElementById('logoutBtn');
        const retryButton = document.getElementById('adminRetryBtn');
        const tableBody = document.getElementById('panelUserTableBody');

        if (panelForm) {
            panelForm.addEventListener('submit', handlePanelFormSubmit);
        }
        if (resetButton) {
            resetButton.addEventListener('click', () => resetPanelForm());
        }
        if (roleSelect) {
            roleSelect.addEventListener('change', (event) => {
                const value = event?.target?.value || 'Custom';
                if (PERMISSION_PRESETS[value]) {
                    applyPermissionPreset(value);
                }
            });
        }
        Object.values(PERMISSION_ID_MAP).forEach((id) => {
            const checkbox = document.getElementById(id);
            if (!checkbox) {
                return;
            }
            checkbox.addEventListener('change', (event) => {
                const target = event.target;
                if (!(target instanceof HTMLInputElement)) {
                    return;
                }
                if (target.id === PERMISSION_ID_MAP.admin) {
                    PERMISSION_KEYS.filter((key) => key !== 'admin').forEach((key) => setPermissionCheckbox(key, target.checked));
                    return;
                }
                if (!target.checked) {
                    setPermissionCheckbox('admin', false);
                } else {
                    const allChecked = PERMISSION_KEYS
                        .filter((key) => key !== 'admin')
                        .every((key) => Boolean(getPermissionCheckbox(key)?.checked));
                    if (allChecked) {
                        setPermissionCheckbox('admin', true);
                    }
                }
            });
        });
        if (refreshButton) {
            refreshButton.addEventListener('click', () => refreshAdminUsers({ silent: false }));
        }
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.location.href = 'index.html';
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
                window.location.href = 'index.html';
            });
        }
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                showLoading();
                hydrateSession().catch(() => {});
            });
        }
        if (tableBody) {
            tableBody.addEventListener('click', (event) => {
                const target = event.target;
                if (!(target instanceof HTMLElement)) {
                    return;
                }
                const actionElement = target.closest('[data-action]');
                if (!(actionElement instanceof HTMLElement)) {
                    return;
                }
                const action = actionElement.getAttribute('data-action');
                const username = actionElement.getAttribute('data-username');
                if (!username) {
                    return;
                }
                event.preventDefault();
                if (action === 'edit-user') {
                    handleEditUser(username);
                } else if (action === 'delete-user') {
                    handleDeleteUser(username);
                }
            });
        }
    };

    const hydrateSession = async () => {
        const storedToken = readSessionItem(AUTH_TOKEN_STORAGE_KEY);
        if (!storedToken) {
            clearAuthState();
            showError(translate('adminConsole.error.sessionRequired', { fallback: 'Session not found. Please return to the homepage and sign in again.' }));
            return;
        }

        try {
            const result = await API.auth.me(storedToken);
            const user = result.user;
            if (!user || !user.permissions || !user.permissions.admin) {
                clearAuthState();
                showError(translate('adminConsole.error.forbidden', { fallback: 'Administrator permissions required. Please return to the homepage and sign in with an administrator account.' }), { hideRetry: true });
                return;
            }

            const nextToken = result.token || storedToken;
            persistAuthState(user, nextToken);
            updateAdminPanel(user);
            showConsole();
            applyPermissionPreset('Administrator');
            await refreshAdminUsers({ silent: true });
        } catch (error) {
            console.warn('Session verification failed:', error);
            clearAuthState();
            showError(translate('adminConsole.error.sessionRequired', { fallback: 'Session expired. Please return to the homepage and sign in again.' }));
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        panelSubmitButton = document.getElementById('panelSubmitBtn');
        attachEventHandlers();
        showLoading();
        hydrateSession().catch(() => {});

        if (window.I18n && typeof window.I18n.onChange === 'function') {
            window.I18n.onChange(() => {
                renderAdminUsers();
                const storedProfile = safeJsonParse(readSessionItem(AUTH_PROFILE_KEY));
                if (storedProfile && storedProfile.permissions?.admin) {
                    updateAdminPanel(storedProfile);
                } else if (storedProfile && !storedProfile.permissions?.admin) {
                    showError(translate('adminConsole.error.forbidden', { fallback: 'Administrator permissions required. Please return to the homepage and sign in with an administrator account.' }), { hideRetry: true });
                } else {
                    showError(translate('adminConsole.error.sessionRequired', { fallback: 'Session not found. Please return to the homepage and sign in again.' }));
                }
            });
        }
    });

    window.addEventListener('apsara:unauthorized', () => {
        clearAuthState();
        window.location.href = 'index.html';
    });
})();
