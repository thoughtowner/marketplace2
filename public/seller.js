async function loadSellerData() {
    const user = storage.getUser();
    if (!user || user.role !== 'seller') {
        window.location.href = '/';
        return;
    }

    try {
        const data = await apiRequest('/seller/products');
        displayStoreInfo(data.store);
        displayProducts(data.products);
    } catch (error) {
        if (error.message.includes('Store not found')) {
            document.getElementById('create-store-form').style.display = 'block';
        } else {
            showMessage('Ошибка загрузки данных: ' + error.message, 'error');
        }
    }
}

function displayStoreInfo(store) {
    const storeInfo = document.getElementById('store-info');
    if (store) {
        storeInfo.innerHTML = `
            <p><strong>Название:</strong> ${store.title}</p>
            <p><strong>ID:</strong> ${store.id}</p>
        `;
        document.getElementById('create-store-form').style.display = 'none';
    }
}

function displayProducts(products) {
    const productsList = document.getElementById('seller-products-list');
    if (!productsList) return;

    if (!products || products.length === 0) {
        productsList.innerHTML = '<p>Товары не найдены</p>';
        return;
    }

    productsList.innerHTML = products.map(item => {
        const product = item.product || item;
        const available = item.quantity || 0;
        return `
            <div class="product-card" data-product-id="${product.id}">
                <h3>${escapeHtml(product.title)}</h3>
                <p class="price">${parseFloat(product.price).toFixed(2)} ₽</p>
                <p class="quantity">В наличии: ${available}</p>
                <div style="margin-top: 1rem;">
                    <input type="number" id="increase-${product.id}" placeholder="Количество" min="1" style="width: 100px; margin-right: 10px;">
                    <button class="btn-primary btn-increase" data-product-id="${product.id}">Увеличить</button>
                    <button class="btn-secondary btn-edit" data-product-id="${product.id}" data-product-title="${escapeAttr(product.title)}" data-product-price="${product.price}">Изменить</button>
                    <button class="btn-danger btn-delete" data-product-id="${product.id}">Удалить</button>
                </div>
            </div>
        `;
    }).join('');

    productsList.querySelectorAll('.btn-increase').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.productId, 10);
            increaseQuantity(id);
        });
    });

    productsList.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.productId, 10);
            const title = btn.dataset.productTitle || '';
            const price = parseFloat(btn.dataset.productPrice);
            editProduct(id, title, price);
        });
    });

    productsList.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.productId, 10);
            deleteProduct(id);
        });
    });
}

function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
function escapeAttr(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

async function createStore() {
    const title = document.getElementById('store-title').value;
    
    try {
        await apiRequest('/seller/store', {
            method: 'POST',
            body: JSON.stringify({ title })
        });
        showMessage('Магазин создан успешно', 'success');
        loadSellerData();
    } catch (error) {
        showMessage('Ошибка: ' + error.message, 'error');
    }
}

async function addProduct() {
    const title = document.getElementById('product-title').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const quantity = parseInt(document.getElementById('product-quantity').value) || 0;

    try {
        await apiRequest('/seller/products', {
            method: 'POST',
            body: JSON.stringify({ title, price, quantity })
        });
        showMessage('Товар добавлен успешно', 'success');
        document.getElementById('add-product-form').style.display = 'none';
        document.getElementById('addProductForm').reset();
        loadSellerData();
    } catch (error) {
        showMessage('Ошибка: ' + error.message, 'error');
    }
}

async function increaseQuantity(productId) {
    const quantity = parseInt(document.getElementById(`increase-${productId}`).value);
    
    if (!quantity || quantity <= 0) {
        showMessage('Введите корректное количество', 'error');
        return;
    }

    try {
        await apiRequest(`/seller/products/${productId}/quantity`, {
            method: 'POST',
            body: JSON.stringify({ quantity })
        });
        showMessage('Количество увеличено', 'success');
        document.getElementById(`increase-${productId}`).value = '';
        loadSellerData();
    } catch (error) {
        showMessage('Ошибка: ' + error.message, 'error');
    }
}

async function editProduct(productId, currentTitle, currentPrice) {
    const newTitle = prompt('Новое название:', currentTitle);
    const newPrice = parseFloat(prompt('Новая цена:', currentPrice));

    if (!newTitle || !newPrice || newPrice <= 0) {
        return;
    }

    try {
        await apiRequest(`/seller/products/${productId}`, {
            method: 'PATCH',
            body: JSON.stringify({ title: newTitle, price: newPrice })
        });
        showMessage('Товар обновлён', 'success');
        loadSellerData();
    } catch (error) {
        showMessage('Ошибка: ' + error.message, 'error');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Удалить товар из магазина?')) return;

    try {
        await apiRequest(`/seller/products/${productId}`, {
            method: 'DELETE'
        });
        showMessage('Товар удалён', 'success');
        loadSellerData();
    } catch (error) {
        showMessage('Ошибка: ' + error.message, 'error');
    }
}

async function withdrawMoney() {
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    
    if (!amount || amount <= 0) {
        showMessage('Введите корректную сумму', 'error');
        return;
    }

    try {
        const data = await apiRequest('/seller/withdraw', {
            method: 'POST',
            body: JSON.stringify({ amount })
        });
        showMessage('Деньги выведены успешно', 'success');
        document.getElementById('withdraw-amount').value = '';
        document.getElementById('seller-balance').textContent = parseFloat(data.balance).toFixed(2) + ' ₽';
    } catch (error) {
        showMessage('Ошибка: ' + error.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadSellerData();

    const createStoreForm = document.getElementById('createStoreForm');
    if (createStoreForm) {
        createStoreForm.addEventListener('submit', (e) => {
            e.preventDefault();
            createStore();
        });
    }

    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addProduct();
        });
    }

    const addProductBtn = document.getElementById('add-product-btn');
    const addProductFormDiv = document.getElementById('add-product-form');
    const cancelBtn = document.getElementById('cancel-add-product');

    if (addProductBtn && addProductFormDiv) {
        addProductBtn.addEventListener('click', () => {
            addProductFormDiv.style.display = addProductFormDiv.style.display === 'none' ? 'block' : 'none';
        });
    }

    if (cancelBtn && addProductFormDiv) {
        cancelBtn.addEventListener('click', () => {
            addProductFormDiv.style.display = 'none';
        });
    }

    const withdrawBtn = document.getElementById('withdraw-btn');
    if (withdrawBtn) {
        withdrawBtn.addEventListener('click', withdrawMoney);
    }
});

