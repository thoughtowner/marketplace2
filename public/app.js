// Базовый JavaScript для работы с API и аутентификацией

const API_BASE_URL = '/api';

// Утилиты для работы с localStorage
const storage = {
    getToken: () => localStorage.getItem('token'),
    setToken: (token) => localStorage.setItem('token', token),
    removeToken: () => localStorage.removeItem('token'),
    getUser: () => JSON.parse(localStorage.getItem('user') || 'null'),
    setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
    removeUser: () => localStorage.removeItem('user')
};

// Функция для выполнения API запросов
async function apiRequest(endpoint, options = {}) {
    const token = storage.getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Ошибка запроса');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Инициализация страницы
function initPage() {
    const token = storage.getToken();
    const user = storage.getUser();

    if (token && user) {
        showAuthenticatedUI(user);
    } else {
        showUnauthenticatedUI();
    }

    // Обработка выхода
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Обработка вкладок аутентификации
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });

    // Обработка форм входа и регистрации
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

function showAuthenticatedUI(user) {
    const authSection = document.getElementById('auth-section');
    const dashboard = document.getElementById('dashboard');
    const userInfo = document.getElementById('user-info');
    const logoutBtn = document.getElementById('logout-btn');

    if (authSection) authSection.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';
    if (userInfo) userInfo.textContent = `${user.login} (${user.role})`;
    if (logoutBtn) logoutBtn.style.display = 'block';

    // Показываем соответствующие ссылки в зависимости от роли
    if (user.role === 'consumer') {
        const cartLink = document.getElementById('cart-link');
        if (cartLink) cartLink.style.display = 'block';
    }

    if (user.role === 'seller') {
        const sellerLink = document.getElementById('seller-link');
        if (sellerLink) sellerLink.style.display = 'block';
    }

    if (user.role === 'admin') {
        const adminLink = document.getElementById('admin-link');
        if (adminLink) adminLink.style.display = 'block';
    }
}

function showUnauthenticatedUI() {
    const authSection = document.getElementById('auth-section');
    const dashboard = document.getElementById('dashboard');
    const userInfo = document.getElementById('user-info');
    const logoutBtn = document.getElementById('logout-btn');

    if (authSection) authSection.style.display = 'block';
    if (dashboard) dashboard.style.display = 'none';
    if (userInfo) userInfo.textContent = '';
    if (logoutBtn) logoutBtn.style.display = 'none';
}

function switchTab(tab) {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.auth-form');

    tabBtns.forEach(btn => {
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    forms.forEach(form => {
        if (form.id === `${tab}-form`) {
            form.classList.add('active');
        } else {
            form.classList.remove('active');
        }
    });
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ login: email, password })
        });

        storage.setToken(data.token);
        storage.setUser(data.user);
        showMessage('Вход выполнен успешно', 'success');
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;

    try {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ login: email, password, role })
        });

        storage.setToken(data.token);
        storage.setUser(data.user);
        showMessage('Регистрация выполнена успешно', 'success');
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

function logout() {
    storage.removeToken();
    storage.removeUser();
    window.location.href = '/';
}

function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(messageDiv, container.firstChild);
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initPage);

