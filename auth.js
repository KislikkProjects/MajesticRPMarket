// Работа с localStorage для хранения пользователей
class Auth {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('majestic_users')) || [];
        this.currentUser = JSON.parse(sessionStorage.getItem('majestic_current_user')) || null;
    }

    register(username, email, password) {
        // Проверка на существующего пользователя
        if (this.users.find(u => u.email === email)) {
            throw new Error('Пользователь с таким email уже существует');
        }
        
        if (this.users.find(u => u.username === username)) {
            throw new Error('Игровой никнейм уже занят');
        }
        
        if (password.length < 6) {
            throw new Error('Пароль должен содержать минимум 6 символов');
        }
        
        const newUser = {
            id: Date.now(),
            username,
            email,
            password: btoa(password), // Простое шифрование для демо
            joinDate: new Date().toISOString() // Добавляем дату регистрации
        };
        
        this.users.push(newUser);
        localStorage.setItem('majestic_users', JSON.stringify(this.users));
        
        return { success: true, message: 'Регистрация успешна!' };
    }
    
    login(email, password) {
        const user = this.users.find(u => u.email === email && atob(u.password) === password);
        
        if (!user) {
            throw new Error('Неверный email или пароль');
        }
        
        this.currentUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            joinDate: user.joinDate
        };
        
        sessionStorage.setItem('majestic_current_user', JSON.stringify(this.currentUser));
        
        return { success: true, user: this.currentUser };
    }
    
    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('majestic_current_user');
        window.location.href = 'index.html';
    }
    
    isAuthenticated() {
        return this.currentUser !== null;
    }
}

const auth = new Auth();

// Обработка формы регистрации
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Пароли не совпадают!');
            return;
        }
        
        try {
            const result = auth.register(username, email, password);
            alert(result.message);
            window.location.href = 'index.html';
        } catch (error) {
            alert(error.message);
        }
    });
}

// Обработка формы входа
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const result = auth.login(email, password);
            alert(`Добро пожаловать, ${result.user.username}!`);
            window.location.href = 'catalog.html';
        } catch (error) {
            alert(error.message);
        }
    });
}

// Проверка авторизации на странице каталога
if (window.location.pathname.includes('catalog.html') || window.location.pathname.includes('profile.html')) {
    if (!auth.isAuthenticated()) {
        window.location.href = 'index.html';
    }
}