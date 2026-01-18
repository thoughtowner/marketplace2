// JavaScript для страницы корзины

let consumerBalance = 0;

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

async function loadCart() {
    const user = storage.getUser();
    if (!user || user.role !== 'consumer') {
        window.location.href = '/';
        return;
    }

    try {
        const cartData = await apiRequest('/consumer/cart');
        displayCart(cartData.cartItems);

        // Показать баланс покупателя (берём из ответа сервера)
        const balanceElem = document.getElementById('balance');
        if (balanceElem) {
            const bal = parseFloat(cartData.balance || 0);
            balanceElem.textContent = bal.toFixed(2) + ' ₽';
        }
    } catch (error) {
        showMessage('Ошибка загрузки корзины: ' + error.message, 'error');
    }
}

function displayCart(cartItems) {
    const cartItemsDiv = document.getElementById('cart-items');
    const purchaseBtn = document.getElementById('purchase-btn');
    
    if (!cartItemsDiv) return;

    if (cartItems.length === 0) {
        cartItemsDiv.innerHTML = '<p>Корзина пуста</p>';
        if (purchaseBtn) purchaseBtn.style.display = 'none';
        updateTotal(0);
        return;
    }

    let total = 0;
    cartItemsDiv.innerHTML = cartItems.map(item => {
        const itemTotal = parseFloat(item.product.price) * item.quantity;
        total += itemTotal;
        return `
            <div class="cart-item" data-product-id="${item.productId}">
                <div>
                    <h4>${escapeHtml(item.product.title)}</h4>
                    <p>${parseFloat(item.product.price).toFixed(2)} ₽ × ${item.quantity}</p>
                </div>
                <div>
                    <input type="number" id="quantity-${item.productId}" value="${item.quantity}" min="1" style="width: 60px; margin-right: 10px;">
                    <button class="btn-primary btn-update" data-product-id="${item.productId}">Обновить</button>
                    <button class="btn-danger btn-remove" data-product-id="${item.productId}">Удалить</button>
                </div>
            </div>
        `;
    }).join('');

    // Навешиваем обработчики на кнопки обновления и удаления
    cartItemsDiv.querySelectorAll('.btn-update').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.productId, 10);
            if (!Number.isNaN(id)) updateCartQuantity(id);
        });
    });

    cartItemsDiv.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.productId, 10);
            if (!Number.isNaN(id)) removeFromCart(id);
        });
    });

    if (purchaseBtn) {
        purchaseBtn.style.display = 'block';
        purchaseBtn.removeAttribute('onclick');
        purchaseBtn.addEventListener('click', purchaseCart);
    }

    updateTotal(total);
}

function updateTotal(total) {
    const totalCost = document.getElementById('total-cost');
    if (totalCost) {
        totalCost.textContent = total.toFixed(2) + ' ₽';
    }
}

async function updateCartQuantity(productId) {
    const quantity = parseInt(document.getElementById(`quantity-${productId}`).value);
    
    try {
        await apiRequest(`/consumer/cart/${productId}`, {
            method: 'PATCH',
            body: JSON.stringify({ quantity })
        });
        showMessage('Количество обновлено', 'success');
        loadCart();
    } catch (error) {
        showMessage('Ошибка: ' + error.message, 'error');
    }
}

async function removeFromCart(productId) {
    if (!confirm('Удалить товар из корзины?')) return;

    try {
        await apiRequest(`/consumer/cart/${productId}`, {
            method: 'DELETE'
        });
        showMessage('Товар удалён из корзины', 'success');
        loadCart();
    } catch (error) {
        showMessage('Ошибка: ' + error.message, 'error');
    }
}

async function purchaseCart() {
    if (!confirm('Подтвердите покупку всех товаров из корзины')) return;

    try {
        await apiRequest('/consumer/cart/purchase', {
            method: 'POST'
        });
        showMessage('Покупка выполнена успешно!', 'success');
        setTimeout(() => {
            loadCart();
        }, 1000);
    } catch (error) {
        showMessage('Ошибка: ' + error.message, 'error');
    }
}

async function depositMoney() {
    const amount = parseFloat(document.getElementById('deposit-amount').value);
    
    if (!amount || amount <= 0) {
        showMessage('Введите корректную сумму', 'error');
        return;
    }

    try {
        const data = await apiRequest('/consumer/deposit', {
            method: 'POST',
            body: JSON.stringify({ amount })
        });
        showMessage('Счёт пополнен успешно', 'success');
        document.getElementById('deposit-amount').value = '';
        document.getElementById('balance').textContent = parseFloat(data.balance).toFixed(2) + ' ₽';
    } catch (error) {
        showMessage('Ошибка: ' + error.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    
    const depositBtn = document.getElementById('deposit-btn');
    if (depositBtn) {
        depositBtn.addEventListener('click', depositMoney);
    }
});

