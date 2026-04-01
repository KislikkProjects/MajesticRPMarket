// Проверка авторизации
const currentUser = JSON.parse(sessionStorage.getItem('majestic_current_user'));
if (!currentUser) {
    window.location.href = 'index.html';
}

// Отображение имени пользователя
document.getElementById('userName').textContent = currentUser.username;

// Кнопка выхода
document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('majestic_current_user');
    window.location.href = 'index.html';
});

// Каталог товаров
const products = [
    { id: "mco1", name: "🪙 250 MCO", desc: "Базовая валюта для покупок в городе", price: 190, category: "currency", icon: "💰" },
    { id: "mco2", name: "⭐ 750 MCO", desc: "Стартовый набор + бонус 50 MCO", price: 490, category: "currency", icon: "💎" },
    { id: "mco3", name: "✨ 2000 MCO", desc: "VIP доступ к эксклюзивным аукционам", price: 1190, category: "currency", icon: "👑" },
    { id: "mco4", name: "🔥 5000 MCO", desc: "Мега-пак + уникальный автомобильный скин", price: 2790, category: "currency", icon: "⚡" },
    { id: "prop1", name: "🏡 Коттедж в Рокфорд Хиллс", desc: "3 этажа, гараж, вид на океан", price: 12500, category: "property", icon: "🏠" },
    { id: "prop2", name: "🏢 Офисный центр", desc: "Пассивный доход, фракционные возможности", price: 24900, category: "property", icon: "🏢" },
    { id: "prop3", name: "🚤 Элитный причал", desc: "Водный транспорт и складское место", price: 8900, category: "property", icon: "⛵" },
    { id: "prop4", name: "🔫 Оружейный склад", desc: "Улучшенная стойка для оружия", price: 5400, category: "property", icon: "🔧" },
    { id: "acc1", name: "🏍️ Байк 'NightShadow'", desc: "Максимальная скорость + неон", price: 7300, category: "accessory", icon: "🏍️" },
    { id: "acc2", name: "🚗 Суперкар 'Majestic GT'", desc: "Роскошный спорткар", price: 18900, category: "accessory", icon: "🚗" },
    { id: "acc3", name: "💼 Легендарный кейс", desc: "Оружие, броня и редкий скин", price: 2950, category: "accessory", icon: "🎁" },
    { id: "acc4", name: "👔 Премиум гардероб", desc: "Уникальные костюмы и маски", price: 3700, category: "accessory", icon: "👕" }
];

let cart = JSON.parse(localStorage.getItem(`cart_${currentUser.id}`)) || [];

// Функция для добавления заказа
function addOrder(cart, total) {
    let orders = JSON.parse(localStorage.getItem(`orders_${currentUser.id}`)) || [];
    
    const newOrder = {
        id: Date.now(),
        date: new Date().toISOString(),
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        total: total,
        status: 'processing'
    };
    
    orders.unshift(newOrder);
    localStorage.setItem(`orders_${currentUser.id}`, JSON.stringify(orders));
    
    // Симуляция доставки через 2 секунды
    setTimeout(() => {
        const currentOrders = JSON.parse(localStorage.getItem(`orders_${currentUser.id}`)) || [];
        const orderToUpdate = currentOrders.find(o => o.id === newOrder.id);
        if (orderToUpdate) {
            orderToUpdate.status = 'delivered';
            localStorage.setItem(`orders_${currentUser.id}`, JSON.stringify(currentOrders));
            showToast('🎉 Ваш заказ доставлен! Проверьте профиль');
        }
    }, 2000);
    
    return newOrder;
}

// Функции для работы с корзиной
function saveCart() {
    localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(cart));
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-bell"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
    
    if (document.getElementById('cartModal').style.display === 'flex') {
        renderCartModal();
    }
}

function renderCartModal() {
    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotalBlock = document.getElementById('cartTotalBlock');
    
    if (cart.length === 0) {
        cartItemsList.innerHTML = '<div class="empty-cart"><i class="fas fa-bag-shopping"></i> Корзина пуста</div>';
        cartTotalBlock.innerHTML = '';
        return;
    }
    
    let itemsHtml = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        itemsHtml += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">${item.price.toLocaleString()} ₽ × ${item.quantity}</span>
                </div>
                <div class="cart-item-qty">
                    <button class="qty-btn" data-id="${item.id}" data-change="-1">−</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" data-id="${item.id}" data-change="1">+</button>
                    <i class="fas fa-trash-alt remove-item" data-id="${item.id}"></i>
                </div>
            </div>
        `;
    });
    
    cartItemsList.innerHTML = itemsHtml;
    cartTotalBlock.innerHTML = `<strong>💰 Итого:</strong> ${total.toLocaleString()} ₽`;
    
    // Добавляем обработчики
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.dataset.id;
            const change = parseInt(btn.dataset.change);
            const item = cart.find(i => i.id === id);
            if (item) {
                item.quantity += change;
                if (item.quantity <= 0) {
                    cart = cart.filter(i => i.id !== id);
                }
                saveCart();
                updateCartUI();
                renderCartModal();
            }
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.dataset.id;
            cart = cart.filter(i => i.id !== id);
            saveCart();
            updateCartUI();
            renderCartModal();
        });
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);
    
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    showToast(`${product.name} добавлен в корзину 🛒`);
}

// Рендер продуктов
function renderProducts() {
    const currencyContainer = document.getElementById('currencyProducts');
    const propertyContainer = document.getElementById('propertyProducts');
    const accessoryContainer = document.getElementById('accessoryProducts');
    
    const currencyItems = products.filter(p => p.category === 'currency');
    const propertyItems = products.filter(p => p.category === 'property');
    const accessoryItems = products.filter(p => p.category === 'accessory');
    
    currencyContainer.innerHTML = currencyItems.map(prod => `
        <div class="product-card">
            <div class="product-icon"><span style="font-size: 2rem;">${prod.icon}</span></div>
            <div class="product-title">${prod.name}</div>
            <div class="product-desc">${prod.desc}</div>
            <div class="product-price">💰 ${prod.price.toLocaleString()} ₽</div>
            <button class="btn-add" onclick="addToCart('${prod.id}')">
                <i class="fas fa-cart-plus"></i> В корзину
            </button>
        </div>
    `).join('');
    
    propertyContainer.innerHTML = propertyItems.map(prod => `
        <div class="product-card">
            <div class="product-icon"><span style="font-size: 2rem;">${prod.icon}</span></div>
            <div class="product-title">${prod.name}</div>
            <div class="product-desc">${prod.desc}</div>
            <div class="product-price">💰 ${prod.price.toLocaleString()} ₽</div>
            <button class="btn-add" onclick="addToCart('${prod.id}')">
                <i class="fas fa-cart-plus"></i> В корзину
            </button>
        </div>
    `).join('');
    
    accessoryContainer.innerHTML = accessoryItems.map(prod => `
        <div class="product-card">
            <div class="product-icon"><span style="font-size: 2rem;">${prod.icon}</span></div>
            <div class="product-title">${prod.name}</div>
            <div class="product-desc">${prod.desc}</div>
            <div class="product-price">💰 ${prod.price.toLocaleString()} ₽</div>
            <button class="btn-add" onclick="addToCart('${prod.id}')">
                <i class="fas fa-cart-plus"></i> В корзину
            </button>
        </div>
    `).join('');
}

// Модальное окно корзины
const modal = document.getElementById('cartModal');
document.getElementById('openCartBtn').addEventListener('click', () => {
    renderCartModal();
    modal.style.display = 'flex';
});
document.getElementById('closeModalBtn').addEventListener('click', () => {
    modal.style.display = 'none';
});
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

// Оформление заказа
document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (cart.length === 0) {
        showToast('Корзина пуста! Добавьте товары 🛒');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsList = cart.map(item => `${item.name} x${item.quantity}`).join('\n');
    
    if (confirm(`Оформить заказ?\n\n${itemsList}\n\n💰 Итого: ${total.toLocaleString()} ₽\n\nТовары будут доставлены в игру!`)) {
        // Добавляем заказ в историю
        addOrder(cart, total);
        
        // Очищаем корзину
        cart = [];
        saveCart();
        updateCartUI();
        modal.style.display = 'none';
        
        showToast('✅ Заказ успешно оформлен! Проверьте историю в профиле');
    }
});

// Инициализация
renderProducts();
updateCartUI();

window.addToCart = addToCart;