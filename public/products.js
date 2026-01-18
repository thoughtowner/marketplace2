function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function loadProducts() {
    try {
        const data = await apiRequest('/products');
        displayProducts(data.products);
    } catch (error) {
        showMessage('Ошибка загрузки товаров: ' + error.message, 'error');
    }
}

function displayProducts(products) {
    const productsList = document.getElementById('products-list');
    if (!productsList) return;

    if (products.length === 0) {
        productsList.innerHTML = '<p>Товары не найдены</p>';
        return;
    }

    productsList.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <h3>${escapeHtml(product.title)}</h3>
            <p class="price">${parseFloat(product.price).toFixed(2)} ₽</p>
            <p class="quantity">В наличии: ${product.availableQuantity || 0}</p>
            <p>Магазин: ${product.store && product.store.id ? `<a href="/stores.html?storeId=${product.store.id}">${escapeHtml(product.store.title)}</a>` : escapeHtml(product.store?.title || 'Неизвестно')}</p>
            <button class="btn-primary btn-view" data-product-id="${product.id}">Подробнее</button>
        </div>
    `).join('');

    productsList.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.productId, 10);
            if (!Number.isNaN(id)) viewProduct(id);
        });
    });
}

async function viewProduct(productId) {
    try {
        const data = await apiRequest(`/products/${productId}`);
        showProductDetails(data);
    } catch (error) {
        showMessage('Ошибка загрузки товара: ' + error.message, 'error');
    }
}

function showProductDetails(product) {
    const user = storage.getUser();
    const isConsumer = user && user.role === 'consumer';
    
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;';
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 500px; width: 90%;">
            <h2>${escapeHtml(product.title)}</h2>
            <p class="price">${parseFloat(product.price).toFixed(2)} ₽</p>
            <p>В наличии: ${product.availableQuantity || 0}</p>
            <p>Магазин: ${escapeHtml(product.store?.title || 'Неизвестно')}</p>
            ${isConsumer ? `
                <div class="form-group" style="margin-top: 1rem;">
                    <label>Количество:</label>
                    <input type="number" class="add-quantity" min="1" value="1" max="${product.availableQuantity || 0}">
                </div>
                <button class="btn-primary btn-add-to-cart" data-product-id="${product.id}">Добавить в корзину</button>
            ` : ''}
            <button class="btn-secondary btn-close-modal" style="margin-top: 1rem;">Закрыть</button>
        </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.btn-close-modal');
    if (closeBtn) closeBtn.addEventListener('click', () => modal.remove());

    const addBtn = modal.querySelector('.btn-add-to-cart');
    if (addBtn) {
        addBtn.addEventListener('click', async () => {
            const qtyInput = modal.querySelector('.add-quantity');
            const qty = qtyInput ? parseInt(qtyInput.value, 10) : 1;
            if (!qty || qty <= 0) {
                showMessage('Введите корректное количество', 'error');
                return;
            }

            try {
                await apiRequest('/consumer/cart', {
                    method: 'POST',
                    body: JSON.stringify({ productId: product.id, quantity: qty })
                });
                showMessage('Товар добавлен в корзину', 'success');

                const cardQtyElem = document.querySelector(`.product-card[data-product-id="${product.id}"] .quantity`);
                if (cardQtyElem) {
                    const match = cardQtyElem.textContent.match(/\d+/);
                    const current = match ? parseInt(match[0], 10) : (product.availableQuantity || 0);
                    const newVal = Math.max(0, current - qty);
                    cardQtyElem.textContent = `В наличии: ${newVal}`;
                }

                modal.remove();
            } catch (error) {
                showMessage('Ошибка: ' + error.message, 'error');
            }
        });
    }
}

async function addToCart(productId) {
    const quantity = parseInt(document.getElementById('add-quantity').value);
    const user = storage.getUser();
    
    if (!user || user.role !== 'consumer') {
        showMessage('Необходимо войти как покупатель', 'error');
        return;
    }

    try {
        await apiRequest('/consumer/cart', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });
        showMessage('Товар добавлен в корзину', 'success');
        document.querySelector('div[style*="position: fixed"]')?.remove();
    } catch (error) {
        showMessage('Ошибка: ' + error.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', loadProducts);
