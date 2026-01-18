// JavaScript для админ-панели

// Утилита для безопасной вставки текста в HTML
function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function initAdmin() {
    const user = storage.getUser();
    if (!user || user.role !== 'admin') {
        window.location.href = '/';
        return;
    }

    setupTabs();
    loadUsers();
}

function setupTabs() {
    const tabBtns = document.querySelectorAll('.admin-tabs .tab-btn');
    const tabContents = document.querySelectorAll('.admin-tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const content = document.getElementById(`${tab}-tab`);
            if (content) content.classList.add('active');

            if (tab === 'products') {
                loadAdminProducts();
            } else if (tab === 'stores') {
                loadAdminStores();
            }
        });
    });
}

async function loadUsers() {
    // В реальном приложении нужен эндпоинт для получения списка пользователей
    // Пока показываем заглушку
    const usersList = document.getElementById('users-list');
    if (usersList) {
        usersList.innerHTML = '<p>Функционал получения списка пользователей требует дополнительного эндпоинта API</p>';
    }
}

async function loadAdminProducts() {
    try {
        const data = await apiRequest('/products');
        displayAdminProducts(data.products);
    } catch (error) {
        showMessage('Ошибка загрузки товаров: ' + error.message, 'error');
    }
}

function displayAdminProducts(products) {
    const productsList = document.getElementById('admin-products-list');
    if (!productsList) return;

    if (products.length === 0) {
        productsList.innerHTML = '<p>Товары не найдены</p>';
        return;
    }

    productsList.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <h3>${escapeHtml(product.title)}</h3>
            <p class="price">${parseFloat(product.price).toFixed(2)} ₽</p>
            <p>Магазин: ${escapeHtml(product.store?.title || 'Неизвестно')}</p>
            <button class="btn-danger btn-admin-delete-product" data-product-id="${product.id}">Удалить</button>
        </div>
    `).join('');

    productsList.querySelectorAll('.btn-admin-delete-product').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.productId, 10);
            if (!Number.isNaN(id)) adminDeleteProduct(id);
        });
    });
}

async function adminDeleteProduct(productId) {
    if (!confirm('Удалить товар? Это действие нельзя отменить.')) return;

    try {
        await apiRequest(`/admin/products/${productId}`, {
            method: 'DELETE'
        });
        showMessage('Товар удалён', 'success');
        loadAdminProducts();
    } catch (error) {
        showMessage('Ошибка: ' + error.message, 'error');
    }
}

async function loadAdminStores() {
    try {
        const data = await apiRequest('/stores');
        displayAdminStores(data.stores);
    } catch (error) {
        showMessage('Ошибка загрузки магазинов: ' + error.message, 'error');
    }
}

function displayAdminStores(stores) {
    const storesList = document.getElementById('admin-stores-list');
    if (!storesList) return;

    if (stores.length === 0) {
        storesList.innerHTML = '<p>Магазины не найдены</p>';
        return;
    }

    storesList.innerHTML = stores.map(store => `
        <div class="store-card" data-store-id="${store.id}">
            <h3>${escapeHtml(store.title)}</h3>
            <p>Продавец: ${escapeHtml(store.seller?.user?.login || 'Неизвестно')}</p>
            <button class="btn-danger btn-admin-delete-store" data-store-id="${store.id}">Удалить</button>
        </div>
    `).join('');

    storesList.querySelectorAll('.btn-admin-delete-store').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.storeId, 10);
            if (!Number.isNaN(id)) adminDeleteStore(id);
        });
    });
}

async function adminDeleteStore(storeId) {
    if (!confirm('Удалить магазин? Это действие нельзя отменить. Все товары магазина также будут удалены.')) return;

    try {
        await apiRequest(`/admin/stores/${storeId}`, {
            method: 'DELETE'
        });
        showMessage('Магазин удалён', 'success');
        loadAdminStores();
    } catch (error) {
        showMessage('Ошибка: ' + error.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', initAdmin);

