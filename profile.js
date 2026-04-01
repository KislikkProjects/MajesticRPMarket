// Проверка авторизации
const currentUser = JSON.parse(sessionStorage.getItem('majestic_current_user'));
if (!currentUser) {
    window.location.href = 'index.html';
}

// Загрузка данных пользователя
let users = JSON.parse(localStorage.getItem('majestic_users')) || [];
let userData = users.find(u => u.id === currentUser.id);

// Если у пользователя нет даты регистрации, добавляем её
if (!userData.joinDate) {
    userData.joinDate = new Date(userData.id).toISOString();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    users[userIndex] = userData;
    localStorage.setItem('majestic_users', JSON.stringify(users));
}

// Функция для загрузки заказов
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem(`orders_${currentUser.id}`)) || [];
    return orders;
}

// Функция для сохранения заказов
function saveOrders(orders) {
    localStorage.setItem(`orders_${currentUser.id}`, JSON.stringify(orders));
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Форматирование даты регистрации
function formatJoinDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Отображение информации профиля (сразу при загрузке)
function displayProfileInfo() {
    const usernameElement = document.getElementById('profileUsername');
    const emailElement = document.getElementById('profileEmail');
    const joinDateElement = document.getElementById('joinDate');
    
    if (usernameElement) usernameElement.textContent = userData.username;
    if (emailElement) emailElement.textContent = userData.email;
    
    // Отображаем дату регистрации
    if (joinDateElement) {
        const joinDate = userData.joinDate ? formatJoinDate(userData.joinDate) : formatJoinDate(userData.id);
        joinDateElement.textContent = joinDate;
    }
}

// Обновление статистики
function updateStats() {
    const orders = loadOrders();
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    
    // Заказы за последние 30 дней
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthOrders = orders.filter(order => new Date(order.date) > monthAgo).length;
    
    const totalOrdersElement = document.getElementById('totalOrders');
    const totalSpentElement = document.getElementById('totalSpent');
    const monthOrdersElement = document.getElementById('monthOrders');
    
    if (totalOrdersElement) totalOrdersElement.textContent = totalOrders;
    if (totalSpentElement) totalSpentElement.textContent = totalSpent.toLocaleString() + ' ₽';
    if (monthOrdersElement) monthOrdersElement.textContent = monthOrders;
}

// Отображение заказов с фильтрацией
function displayOrders(filter = 'all') {
    const ordersContainer = document.getElementById('ordersContainer');
    const orders = loadOrders();
    
    if (!ordersContainer) return;
    
    let filteredOrders = orders;
    if (filter === 'delivered') {
        filteredOrders = orders.filter(order => order.status === 'delivered');
    } else if (filter === 'processing') {
        filteredOrders = orders.filter(order => order.status === 'processing');
    }
    
    if (filteredOrders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-orders">
                <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>У вас пока нет заказов</p>
                <a href="catalog.html" class="auth-btn" style="display: inline-block; margin-top: 1rem; text-decoration: none;">
                    Перейти в магазин
                </a>
            </div>
        `;
        return;
    }
    
    ordersContainer.innerHTML = filteredOrders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <span class="order-id">Заказ #${order.id}</span>
                    <span class="order-date">${formatDate(order.date)}</span>
                </div>
                <span class="order-status status-${order.status}">
                    ${order.status === 'delivered' ? '✅ Доставлен' : '⏳ В обработке'}
                </span>
            </div>
            <div class="order-items">
                ${order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
            </div>
            <div class="order-total">
                💰 Итого: ${order.total.toLocaleString()} ₽
            </div>
        </div>
    `).join('');
}

// Добавление нового заказа
function addOrder(cart, total) {
    const orders = loadOrders();
    
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
    saveOrders(orders);
    
    // Обновляем отображение
    const activeFilter = document.querySelector('.filter-btn.active');
    displayOrders(activeFilter ? activeFilter.dataset.filter : 'all');
    updateStats();
    
    // Симуляция доставки через 2 секунды
    setTimeout(() => {
        const currentOrders = loadOrders();
        const orderToUpdate = currentOrders.find(o => o.id === newOrder.id);
        if (orderToUpdate) {
            orderToUpdate.status = 'delivered';
            saveOrders(currentOrders);
            displayOrders(activeFilter ? activeFilter.dataset.filter : 'all');
            updateStats();
            
            // Показываем уведомление если страница активна
            if (document.visibilityState === 'visible') {
                showToast('Ваш заказ доставлен! 🎉');
            }
        }
    }, 2000);
    
    return newOrder;
}

// Показать уведомление
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-bell"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Редактирование профиля
const editProfileBtn = document.getElementById('editProfileBtn');
if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
        const editUsername = document.getElementById('editUsername');
        const editEmail = document.getElementById('editEmail');
        if (editUsername) editUsername.value = userData.username;
        if (editEmail) editEmail.value = userData.email;
        const editModal = document.getElementById('editProfileModal');
        if (editModal) editModal.style.display = 'flex';
    });
}

const closeEditModal = document.getElementById('closeEditModal');
if (closeEditModal) {
    closeEditModal.addEventListener('click', () => {
        const editModal = document.getElementById('editProfileModal');
        if (editModal) editModal.style.display = 'none';
    });
}

const editProfileForm = document.getElementById('editProfileForm');
if (editProfileForm) {
    editProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newUsername = document.getElementById('editUsername').value.trim();
        const newEmail = document.getElementById('editEmail').value.trim();
        
        if (!newUsername || !newEmail) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        // Проверка уникальности
        if (newUsername !== userData.username && users.find(u => u.username === newUsername)) {
            alert('Этот никнейм уже занят');
            return;
        }
        
        if (newEmail !== userData.email && users.find(u => u.email === newEmail)) {
            alert('Этот email уже используется');
            return;
        }
        
        // Обновление данных
        userData.username = newUsername;
        userData.email = newEmail;
        
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        users[userIndex] = userData;
        localStorage.setItem('majestic_users', JSON.stringify(users));
        
        // Обновление сессии
        currentUser.username = newUsername;
        currentUser.email = newEmail;
        sessionStorage.setItem('majestic_current_user', JSON.stringify(currentUser));
        
        displayProfileInfo();
        const editModal = document.getElementById('editProfileModal');
        if (editModal) editModal.style.display = 'none';
        showToast('Профиль успешно обновлен! ✅');
    });
}

// Фильтрация заказов
const filterBtns = document.querySelectorAll('.filter-btn');
if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            displayOrders(btn.dataset.filter);
        });
    });
}

// Выход
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('majestic_current_user');
        window.location.href = 'index.html';
    });
}

// Функции для корзины
let cart = JSON.parse(localStorage.getItem(`cart_${currentUser.id}`)) || [];

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.textContent = totalItems;
}

function saveCart() {
    localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(cart));
}

function renderCartModal() {
    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotalBlock = document.getElementById('cartTotalBlock');
    
    if (!cartItemsList) return;
    
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
    cartTotalBlock.innerHTML = `<strong>💰 Итого к оплате:</strong> ${total.toLocaleString()} ₽`;
    
    // Добавляем обработчики
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.removeEventListener('click', handleQtyChange);
        btn.addEventListener('click', handleQtyChange);
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.removeEventListener('click', handleRemoveItem);
        btn.addEventListener('click', handleRemoveItem);
    });
}

function handleQtyChange(e) {
    const btn = e.currentTarget;
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
}

function handleRemoveItem(e) {
    const btn = e.currentTarget;
    const id = btn.dataset.id;
    cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartUI();
    renderCartModal();
}

// Оформление заказа
function checkout() {
    if (cart.length === 0) {
        showToast('Корзина пуста! 🛒');
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
        
        // Закрываем модалку
        const modal = document.getElementById('cartModal');
        if (modal) modal.style.display = 'none';
        
        // Показываем сообщение об успехе
        showToast('✅ Заказ успешно оформлен! Смотрите историю в профиле');
        
        // Обновляем статистику и заказы
        setTimeout(() => {
            updateStats();
            const activeFilter = document.querySelector('.filter-btn.active');
            displayOrders(activeFilter ? activeFilter.dataset.filter : 'all');
        }, 100);
    }
}

// Модальное окно корзины
const modal = document.getElementById('cartModal');
const openCartBtn = document.getElementById('openCartBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const checkoutBtn = document.getElementById('checkoutBtn');

if (openCartBtn) {
    openCartBtn.addEventListener('click', () => {
        renderCartModal();
        if (modal) modal.style.display = 'flex';
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        if (modal) modal.style.display = 'none';
    });
}

if (checkoutBtn) {
    checkoutBtn.addEventListener('click', checkout);
}

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

// Инициализация страницы - сразу отображаем все данные
document.addEventListener('DOMContentLoaded', () => {
    displayProfileInfo();
    updateStats();
    displayOrders('all');
    updateCartUI();
    
    // Проверяем обновления из других вкладок
    window.addEventListener('storage', (e) => {
        if (e.key === `orders_${currentUser.id}`) {
            updateStats();
            const activeFilter = document.querySelector('.filter-btn.active');
            displayOrders(activeFilter ? activeFilter.dataset.filter : 'all');
            showToast('📦 История заказов обновлена');
        }
    });
});

// Дополнительная проверка, если DOM уже загружен
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {});
} else {
    displayProfileInfo();
    updateStats();
    displayOrders('all');
    updateCartUI();
}