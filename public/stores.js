// JavaScript для страницы магазинов

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
async function loadStores() {
    try {
        const data = await apiRequest('/stores');
        displayStores(data.stores);
    } catch (error) {
        showMessage('Ошибка загрузки магазинов: ' + error.message, 'error');
    }
}

function displayStores(stores) {
    const storesList = document.getElementById('stores-list');
    if (!storesList) return;

    if (stores.length === 0) {
        storesList.innerHTML = '<p>Магазины не найдены</p>';
        return;
    }

    storesList.innerHTML = stores.map(store => `
        <div class="store-card" data-store-id="${store.id}">
            <h3>${escapeHtml(store.title)}</h3>
            <p>Продавец: ${escapeHtml(store.seller?.user?.login || 'Неизвестно')}</p>
            <button class="btn-primary btn-view" data-store-id="${store.id}">Посмотреть товары</button>
        </div>
    `).join('');

    // Навешиваем обработчики на кнопки просмотра товаров
    storesList.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.storeId, 10);
            if (!Number.isNaN(id)) viewStoreProducts(id);
        });
    });
}

async function viewStoreProducts(storeId) {
    try {
        const data = await apiRequest(`/stores/${storeId}/products`);
        showStoreProducts(data);
    } catch (error) {
        showMessage('Ошибка загрузки товаров: ' + error.message, 'error');
    }
}

function showStoreProducts(data) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; overflow-y: auto;';
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 800px; width: 90%; margin: 2rem;">
            <h2>Товары магазина: ${escapeHtml(data.store.title)}</h2>
            <div class="products-grid" style="margin-top: 1rem;">
                ${data.products.map(product => `
                    <div class="product-card">
                        <h3>${escapeHtml(product.product?.title || product.title)}</h3>
                        <p class="price">${parseFloat(product.product?.price || product.price).toFixed(2)} ₽</p>
                        <p class="quantity">В наличии: ${product.availableQuantity || product.quantity || 0}</p>
                    </div>
                `).join('')}
            </div>
            <button class="btn-secondary close-modal" style="margin-top: 1rem;">Закрыть</button>
        </div>
    `;
    document.body.appendChild(modal);

    // Навешиваем обработчик на кнопку закрытия модального окна
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) closeBtn.addEventListener('click', () => modal.remove());
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadStores();
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('storeId');
    if (sid) {
        const id = parseInt(sid, 10);
        if (!Number.isNaN(id)) viewStoreProducts(id);
    }
});
