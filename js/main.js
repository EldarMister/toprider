// Основная логика сайта

// Глобальные переменные
let currentCategory = 'all';
let allProducts = [];
let filterState = {
    category: 'all',
    priceMin: 0,
    priceMax: 10000000,
    search: '',
    specs: {
        speed: [], // array of values
        motor: []  // array of values
    }
};

// Корзина
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Функция для загрузки корзины из localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            cart = [];
        }
    } else {
        cart = [];
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем товары из глобальной переменной products (из products.js)
    if (typeof products !== 'undefined') {
        allProducts = products;
    }
    
    // Загружаем корзину из localStorage
    loadCart();
    
    // Инициализация UI
    setupHeader();
    updateCartCount();
    
    // Рендер начального списка (по умолчанию все или первая категория)
    // Если нужно показать все сразу:
    renderProducts(allProducts);
});

// Helper: Get Category Name
function getCategoryName(cat) {
    const names = {
        'bicycles': 'Велосипеды',
        'electro_scooters': 'Электросамокаты',
        'electro_bikes': 'Электробайки',
        'accessories': 'Аксессуары',
        'winter': 'Зимние товары'
    };
    return names[cat] || cat;
}

// Функция инициализации хедера
function setupHeader() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mobilePanel = document.getElementById('mobileMenu');

    if (!menuBtn || !mobilePanel) return;

    function setOpen(isOpen) {
        mobilePanel.classList.toggle('hidden', !isOpen);
    }

    menuBtn.addEventListener('click', function () {
        const isHidden = mobilePanel.classList.contains('hidden');
        setOpen(isHidden);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setOpen(false);
    });
}

// Логика футера для мобильных
function toggleFooter(button) {
    const content = button.nextElementSibling;
    if (content) {
        content.classList.toggle('hidden');
    }
    button.classList.toggle('active');
}
window.toggleFooter = toggleFooter;

// Лайк (визуально)
function toggleLike(btn) {
    btn.classList.toggle('text-red-500');
    const svg = btn.querySelector('svg');
    if (btn.classList.contains('text-red-500')) {
        svg.setAttribute('fill', 'currentColor');
    } else {
        svg.setAttribute('fill', 'none');
    }
}
window.toggleLike = toggleLike;

// Корзина: Добавить
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        // Проверяем, нет ли уже этого товара в корзине
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            // Если товар уже есть, увеличиваем количество
            if (!existingItem.quantity) existingItem.quantity = 1;
            existingItem.quantity += 1;
        } else {
            // Если товара нет, добавляем с количеством 1
            cart.push({...product, quantity: 1});
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        // Показываем уведомление
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all';
        notification.textContent = `Товар "${product.title}" добавлен в корзину!`;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
}
window.addToCart = addToCart;

// Корзина: Обновить счетчик
function updateCartCount() {
    const el = document.getElementById('cart-count');
    const mobileEl = document.getElementById('cart-count-mobile');
    const modalCount = document.getElementById('cart-modal-count');
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    if (el) el.textContent = totalItems;
    if (mobileEl) {
        mobileEl.textContent = totalItems;
        mobileEl.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    if (modalCount) modalCount.textContent = totalItems;
}

// Корзина: Открыть
function openCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        renderCart();
    }
}
window.openCart = openCart;

// Корзина: Закрыть
function closeCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}
window.closeCart = closeCart;

// Корзина: Отобразить товары
function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <p class="text-gray-500 text-lg mb-2">Корзина пуста</p>
                <p class="text-gray-400 text-sm">Добавьте товары из каталога</p>
            </div>
        `;
        if (totalEl) totalEl.textContent = '0 сом';
        return;
    }

    let total = 0;
    let itemsHtml = '';

    cart.forEach((item, index) => {
        const quantity = item.quantity || 1;
        const itemTotal = item.price * quantity;
        total += itemTotal;

        itemsHtml += `
            <div class="flex gap-4 pb-6 mb-6 border-b border-gray-200 last:border-0">
                <div class="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                    <img src="${item.image}" alt="${item.title}" class="w-full h-full object-contain">
                </div>
                <div class="flex-1">
                    <h3 class="font-bold text-gray-900 mb-1">${item.title}</h3>
                    <p class="text-sm text-gray-500 mb-2">${getCategoryName(item.category)}</p>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <button onclick="updateCartQuantity(${index}, -1)" class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
                            </button>
                            <span class="w-12 text-center font-bold">${quantity}</span>
                            <button onclick="updateCartQuantity(${index}, 1)" class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                            </button>
                        </div>
                        <div class="text-right">
                            <div class="font-bold text-lg text-gray-900">${itemTotal.toLocaleString()} сом</div>
                            <div class="text-sm text-gray-500">${item.price.toLocaleString()} сом × ${quantity}</div>
                        </div>
                    </div>
                    <button onclick="removeFromCart(${index})" class="mt-2 text-red-500 hover:text-red-700 text-sm flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Удалить
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = itemsHtml;
    if (totalEl) totalEl.textContent = `${total.toLocaleString()} сом`;
}
window.renderCart = renderCart;

// Корзина: Обновить количество
function updateCartQuantity(index, change) {
    if (index < 0 || index >= cart.length) return;
    
    const item = cart[index];
    const newQuantity = (item.quantity || 1) + change;
    
    if (newQuantity <= 0) {
        removeFromCart(index);
    } else {
        item.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
    }
}
window.updateCartQuantity = updateCartQuantity;

// Корзина: Удалить товар
function removeFromCart(index) {
    if (index < 0 || index >= cart.length) return;
    
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}
window.removeFromCart = removeFromCart;

// Корзина: Очистить
function clearCart() {
    if (confirm('Вы уверены, что хотите очистить корзину?')) {
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
    }
}
window.clearCart = clearCart;

// Корзина: Оформить заказ
function checkoutCart() {
    if (cart.length === 0) {
        alert('Корзина пуста!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    
    // Формируем сообщение для WhatsApp
    let message = 'Здравствуйте! Хочу оформить заказ:\n\n';
    cart.forEach((item, index) => {
        const quantity = item.quantity || 1;
        message += `${index + 1}. ${item.title}\n`;
        message += `   Количество: ${quantity}\n`;
        message += `   Цена: ${item.price.toLocaleString()} сом\n`;
        message += `   Сумма: ${(item.price * quantity).toLocaleString()} сом\n\n`;
    });
    message += `Итого: ${total.toLocaleString()} сом`;

    // Открываем WhatsApp
    const whatsappUrl = `https://wa.me/996508708408?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}
window.checkoutCart = checkoutCart;

// --- ФИЛЬТРАЦИЯ ---

// Фильтр цены (клик по лейблу)
function setPriceFilter(element, min, max) {
    // Сброс визуального выделения в группе
    const group = element.closest('#filter-price');
    if (group) {
        const labels = group.querySelectorAll('label');
        labels.forEach(l => {
            const span = l.querySelector('.bg-blue-600');
            if (span) {
                span.classList.add('opacity-0');
                span.classList.remove('opacity-100');
            }
        });
    }

    // Выделение текущего
    const activeSpan = element.querySelector('.bg-blue-600');
    if (activeSpan) {
        activeSpan.classList.remove('opacity-0');
        activeSpan.classList.add('opacity-100');
    }

    filterState.priceMin = min;
    filterState.priceMax = max;
    applyFilters();
}
window.setPriceFilter = setPriceFilter;

// Фильтр характеристик (чекбоксы)
function toggleSpecFilter(element, type, value) {
    // Checkbox visual behavior
    const checkbox = element.querySelector('svg');
    const isChecked = !checkbox.classList.contains('hidden');

    if (isChecked) {
        checkbox.classList.add('hidden');
        // Remove from state
        filterState.specs[type] = filterState.specs[type].filter(v => v !== value);
    } else {
        checkbox.classList.remove('hidden');
        // Add to state
        filterState.specs[type].push(value);
    }
    applyFilters();
}
window.toggleSpecFilter = toggleSpecFilter;

// Поиск
const searchInput = document.getElementById('search-input-desktop');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        filterState.search = e.target.value.toLowerCase();
        applyFilters();
    });
}

function handleSearch() {
   applyFilters(); // Вызывается кнопкой лупы, хотя input event уже делает это
}
window.handleSearch = handleSearch;


// Главная функция применения фильтров
function applyFilters() {
    showCatalog();

    let filtered = allProducts.filter(p => {
        // 1. Категория
        if (filterState.category !== 'all' && p.category !== filterState.category) return false;

        // 2. Цена
        if (p.price < filterState.priceMin || p.price > filterState.priceMax) return false;

        // 3. Поиск
        if (filterState.search && !p.title.toLowerCase().includes(filterState.search)) return false;

        // 4. Спецификации (Motor, Speed) - частичное совпадение строки
        // Если выбрано несколько значений (например 250W и 500W), показываем любой из них (OR logic)
        
        // Motor
        if (filterState.specs.motor.length > 0) {
            const pMotor = p.detailedSpecs?.motor || '';
            // Проверяем, содержит ли мотор товара ОДНО ИЗ выбранных значений
            const match = filterState.specs.motor.some(val => pMotor.includes(val));
            if (!match) return false;
        }
        
        // Speed
        if (filterState.specs.speed.length > 0) {
            const pSpeed = p.detailedSpecs?.speed || '';
            const match = filterState.specs.speed.some(val => pSpeed.includes(val));
            if (!match) return false;
        }

        return true;
    });

    renderProducts(filtered);
    
    // Обновляем текст "Показано X товаров"
    const countEl = document.querySelector('.text-sm.text-gray-400.pl-2');
    if (countEl) countEl.textContent = `Показано ${filtered.length} товаров`;
}

// Выбор категории (из меню или грида)
function filterByCategory(category) {
    filterState.category = category;
    
    // Сброс фильтров при смене категории? Обычно нет, но можно.
    // Оставим фильтры цены и спеков активными, это удобно.
    
    applyFilters();
    
    // Обновляем заголовок
    const title = document.querySelector('#catalog-page h1.text-4xl');
    if (title) {
        title.textContent = getCategoryName(category) === 'all' ? 'Каталог товаров' : getCategoryName(category);
    }
    
    // Скролл
    const grid = document.getElementById('products-grid');
    if (grid) {
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
window.filterByCategory = filterByCategory;

// Показать каталог, скрыть товар
function showCatalog() {
    document.getElementById('catalog-page').classList.remove('hidden');
    document.getElementById('product-page').classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.showCatalog = showCatalog;

// Открыть страницу товара
function showProduct(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    const catalogPage = document.getElementById('catalog-page');
    const productPage = document.getElementById('product-page');

    catalogPage.classList.add('hidden');
    productPage.classList.remove('hidden');

    // Рендер страницы товара
    renderProductPage(product, productPage);
    window.scrollTo({ top: 0, behavior: 'instant' });
}
window.showProduct = showProduct;

// Быстрый просмотр
function openQuickView(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    const modal = document.getElementById('quick-view-modal');
    const content = document.getElementById('quick-view-content');
    
    content.innerHTML = '';
    renderProductPage(product, content, true);

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}
window.openQuickView = openQuickView;

function closeQuickView() {
    const modal = document.getElementById('quick-view-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}
window.closeQuickView = closeQuickView;

// Хелпер для YouTube ID
function getYoutubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Рендер детальной страницы (или модалки)
function renderProductPage(product, container, isModal = false) {
    const images = product.images && product.images.length > 0 ? product.images : [product.image];
    const thumbnailsHtml = images.map((img, index) => `
        <div class="cursor-pointer border-2 ${index === 0 ? 'border-blue-500' : 'border-transparent'} hover:border-blue-500 rounded overflow-hidden aspect-square" onclick="changeMainImage(this, '${img}')">
            <img src="${img}" class="w-full h-full object-cover">
        </div>
    `).join('');

    // Таблица технических характеристик
    let specsTableHtml = '';
    if (product.detailedSpecs || product.fullSpecs) {
        const specs = product.fullSpecs || {};
        const detailed = product.detailedSpecs || {};
        
        // Формируем список характеристик на основе шаблона
        const specItems = [];
        
        // Основные характеристики из detailedSpecs и fullSpecs
        if (detailed.battery || specs.battery) specItems.push({ icon: '🔋', label: 'Батарея', value: detailed.battery || specs.battery });
        if (detailed.motor || specs.motor) specItems.push({ icon: '⚡', label: 'Мощность двигателя', value: detailed.motor || specs.motor });
        if (specs.peakPower) specItems.push({ icon: '♨', label: 'Пиковая мощность', value: specs.peakPower });
        if (detailed.speed || specs.speed) specItems.push({ icon: '🔝', label: 'Максимальная скорость', value: detailed.speed || specs.speed });
        if (detailed.range || specs.range) specItems.push({ icon: '⛽', label: 'Запас хода', value: detailed.range || specs.range });
        if (specs.brakes || detailed.brakes) specItems.push({ icon: '🔗', label: 'Тормоза', value: specs.brakes || detailed.brakes });
        if (specs.wheels || detailed.wheels) specItems.push({ icon: '🛞', label: 'Колеса', value: specs.wheels || detailed.wheels });
        if (specs.suspension || detailed.suspension) specItems.push({ icon: '♾', label: 'Амортизаторы', value: specs.suspension || detailed.suspension });
        if (specs.maxLoad || detailed.maxLoad) specItems.push({ icon: '🔢', label: 'Максимальная нагрузка', value: specs.maxLoad || detailed.maxLoad });
        if (specs.chargeTime || detailed.chargeTime) specItems.push({ icon: '🕕', label: 'Время полной зарядки', value: specs.chargeTime || detailed.chargeTime });
        
        // Дополнительные характеристики
        const additionalItems = [];
        if (specs.steeringDamper) additionalItems.push({ icon: '🪄', label: 'Рулевой демфер', value: specs.steeringDamper });
        if (specs.alarm) additionalItems.push({ icon: '🔒', label: 'Сигнализация', value: specs.alarm });
        if (specs.gps) additionalItems.push({ icon: '🖲', label: 'GPS', value: specs.gps });
        if (specs.display) additionalItems.push({ icon: '📟', label: 'Дисплей', value: specs.display });
        if (specs.lighting) additionalItems.push({ icon: '🔥', label: 'Подсветка', value: specs.lighting });
        if (specs.turnSignals) additionalItems.push({ icon: '↔', label: 'Поворотники', value: specs.turnSignals });
        if (specs.emergencyLights) additionalItems.push({ icon: '🚨', label: 'Аварийки', value: specs.emergencyLights });
        
        if (specItems.length > 0) {
            let tableRows = '';
            specItems.forEach((item, index) => {
                const bgClass = index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
                tableRows += `
                    <tr class="${bgClass}">
                        <td class="px-4 py-3 font-bold text-gray-900">${item.icon} ${item.label}</td>
                        <td class="px-4 py-3 text-gray-600 italic">${item.value}</td>
                    </tr>
                `;
            });
            
            let additionalRows = '';
            if (additionalItems.length > 0) {
                additionalRows = `
                    <tr class="bg-green-50">
                        <td colspan="2" class="px-4 py-3 font-bold text-green-600 text-center">
                            ✴ ДОПОЛНИТЕЛЬНО ✴
                        </td>
                    </tr>
                `;
                additionalItems.forEach((item, index) => {
                    const bgClass = index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
                    additionalRows += `
                        <tr class="${bgClass}">
                            <td class="px-4 py-3 font-bold text-gray-900">${item.icon} ${item.label}</td>
                            <td class="px-4 py-3 text-gray-600 italic">${item.value}</td>
                        </tr>
                    `;
                });
            }
            
            specsTableHtml = `
                <div class="mt-8 mb-6">
                    <div class="w-full bg-green-50 px-4 py-3 rounded-t-lg border border-green-200">
                        <h3 class="text-lg font-bold text-green-600 flex items-center gap-2">
                            <span>ДЕТАЛИ</span>
                        </h3>
                    </div>
                    <div class="specs-table-content border border-green-200 border-t-0 rounded-b-lg overflow-hidden">
                        <table class="w-full">
                            <tbody>
                                ${tableRows}
                                ${additionalRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
    }
    
    // Видео (если есть, показываем отдельно)
    let videoHtml = '';
    if (product.video) {
        const videoId = getYoutubeId(product.video);
        if (videoId) {
            videoHtml = `
                <div class="mt-8 mb-6">
                    <h3 class="text-lg font-bold text-gray-900 mb-2">Видеообзор</h3>
                    <div class="relative w-full" style="padding-bottom: 56.25%">
                        <iframe class="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg" 
                                src="https://www.youtube.com/embed/${videoId}" 
                                title="YouTube video player" frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen></iframe>
                    </div>
                </div>
            `;
        }
    }


    // Хлебные крошки
    const breadcrumbs = isModal ? '' : `
        <div class="text-sm text-gray-500 mb-6 flex items-center gap-2">
            <a href="#" onclick="showCatalog()" class="hover:text-blue-600">Главная</a>
            <span>/</span>
            <a href="#" onclick="showCatalog()" class="hover:text-blue-600">Каталог</a>
            <span>/</span>
            <a href="#" onclick="filterByCategory('${product.category}')" class="hover:text-blue-600">${getCategoryName(product.category)}</a>
            <span>/</span>
            <span class="text-gray-900 truncate max-w-[200px]">${product.title}</span>
        </div>
    `;

    const wrapperClass = isModal ? 'p-6 lg:p-10' : 'container-custom';

    container.innerHTML = `
        <div class="${wrapperClass}">
            ${breadcrumbs}

            <div class="lg:grid lg:grid-cols-2 lg:gap-12">
                <!-- Left: Images -->
                <div class="mb-8 lg:mb-0">
                    <div class="relative bg-white border border-gray-100 rounded-lg overflow-hidden mb-4 group">
                        <img id="main-product-image-${isModal ? 'modal' : 'page'}" src="${images[0]}" class="w-full h-auto object-contain max-h-[500px]" alt="${product.title}">
                    </div>
                    
                    <div class="grid grid-cols-4 gap-4">
                        ${thumbnailsHtml}
                    </div>

                    <div class="hidden lg:block">
                        ${specsTableHtml}
                        ${videoHtml}
                    </div>
                </div>

                <!-- Right: Details -->
                <div>
                    <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">${product.title}</h1>
                    
                    <div class="flex items-center gap-4 mb-6">
                        <span class="text-3xl font-bold text-gray-900">${product.price.toLocaleString()} сом</span>
                        ${product.oldPrice ? `<span class="text-xl text-gray-400 line-through">${product.oldPrice.toLocaleString()} сом</span>` : ''}
                    </div>

                    ${product.inStock ? '<div class="text-green-600 font-bold mb-6 flex items-center gap-2"><span class="w-2 h-2 bg-green-600 rounded-full"></span> In Stock</div>' : ''}

                    ${product.brand ? `<div class="mb-6"><span class="text-2xl font-black text-gray-900 italic">${product.brand}</span></div>` : ''}

                    <div class="prose prose-sm text-gray-600 mb-8 max-h-[200px] overflow-y-auto ${isModal ? '' : 'lg:max-h-none'}">
                        ${product.description || 'Описание отсутствует.'}
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-wrap gap-4 mb-6">
                        <button onclick="addToCart(${product.id})" class="flex-1 bg-[#00a0a0] hover:bg-[#008080] text-white font-bold py-3 px-6 rounded uppercase transition shadow-md">
                            В корзину
                        </button>
                    </div>

                    <a href="https://wa.me/996508708408?text=Здравствуйте, хочу купить ${encodeURIComponent(product.title)}" target="_blank" class="block w-full bg-[#66CC33] hover:bg-[#57b32c] text-white font-bold py-4 rounded text-lg uppercase flex items-center justify-center gap-3 transition shadow-lg hover:shadow-xl mb-6">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    НАПИСАТЬ НА WHATSAPP
                </a>

                <div class="lg:hidden">
                    ${specsTableHtml}
                    ${videoHtml}
                </div>
            </div>
        </div>
    </div>
    `;
}

// Смена главного изображения
function changeMainImage(thumb, src) {
    const mainImgPage = document.getElementById('main-product-image-page');
    const mainImgModal = document.getElementById('main-product-image-modal');
    
    if (mainImgPage) mainImgPage.src = src;
    if (mainImgModal) mainImgModal.src = src;
    
    const thumbnails = thumb.parentElement.children;
    for (let t of thumbnails) {
        t.classList.remove('border-blue-500');
        t.classList.add('border-transparent');
    }
    thumb.classList.remove('border-transparent');
    thumb.classList.add('border-blue-500');
}
window.changeMainImage = changeMainImage;

// Переключение таблицы характеристик
function toggleSpecsTable(button) {
    const content = button.nextElementSibling;
    const svg = button.querySelector('svg');
    
    if (content) {
        const isHidden = content.classList.contains('hidden');
        if (isHidden) {
            content.classList.remove('hidden');
            if (svg) svg.style.transform = 'rotate(180deg)';
        } else {
            content.classList.add('hidden');
            if (svg) svg.style.transform = 'rotate(0deg)';
        }
    }
}
window.toggleSpecsTable = toggleSpecsTable;

// Рендер грида товаров
function renderProducts(productsToRender) {
    const container = document.getElementById('products-grid');
    if (!container) return;

    if (productsToRender.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-10 text-gray-500">Товары не найдены</div>';
        return;
    }

    const bannerHtml = `
        <div class="col-span-full bg-[#FFD700] py-3 px-4 text-center font-black text-black text-xs md:text-base uppercase tracking-tight w-full" style="background: #FFD700;">
            <span>Забери самокат сейчас и плати всего 299с в день!</span>
        </div>
    `;

    let finalHtml = '';
    
    productsToRender.forEach((product, index) => {
        // Звезды
        const rating = Math.round(product.rating || 0);
        const stars = Array(5).fill(0).map((_, i) => 
            `<svg class="w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}" ${i < rating ? 'fill="currentColor"' : ''} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`
        ).join('');

        const productHtml = `
        <div onclick="showProduct(${product.id})" class="product-card cursor-pointer group bg-white flex flex-col">
            <!-- Image Section -->
            <div class="relative bg-white overflow-hidden" style="aspect-ratio: 1 / 1;">
                <img src="${product.image}" alt="${product.title}" class="w-full h-full object-contain object-center p-3 group-hover:scale-105 transition-transform duration-300">
                
                <!-- Quick View Button -->
                <button onclick="event.stopPropagation(); openQuickView(${product.id})" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-gray-800 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#66CC33] hover:text-white z-10" title="Быстрый просмотр">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                </button>
            </div>
            
            <!-- Content Section -->
            <div class="p-3 flex flex-col flex-1">
                <!-- Category -->
                <div class="mb-1 text-[10px] text-gray-500 uppercase tracking-wider">${getCategoryName(product.category)}</div>
                
                <!-- Title -->
                <h3 class="text-[13px] font-medium text-gray-900 mb-2 leading-tight line-clamp-2 min-h-[36px]">${product.title}</h3>
                
                <!-- Rating -->
                <div class="flex items-center justify-center gap-1 mb-2">
                    ${stars}
                    <span class="text-[10px] text-gray-400">(${product.reviews || 0})</span>
                </div>
                
                <!-- Price -->
                <div class="mb-3 text-center">
                    <div class="text-lg font-bold text-black mb-0.5">${product.price.toLocaleString()} сом</div>
                    ${product.oldPrice ? `<div class="text-xs text-gray-400 line-through">${product.oldPrice.toLocaleString()} сом</div>` : ''}
                    ${product.discount || product.oldPrice ? `<div class="text-[10px] font-bold text-green-600 uppercase mt-1">Скидка</div>` : ''}
                </div>
                
                <!-- Action Buttons -->
                <div class="mt-auto space-y-2">
                    <div class="flex justify-center">
                        <button onclick="event.stopPropagation(); addToCart(${product.id})" class="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded transition shadow-sm" title="В корзину">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </button>
                    </div>
                    <a href="https://wa.me/996508708408?text=Здравствуйте, интересует ${encodeURIComponent(product.title)}" target="_blank" onclick="event.stopPropagation()" class="block bg-[#66CC33] hover:bg-[#57b32c] text-white font-bold py-2 px-2 rounded text-[10px] md:text-xs transition uppercase flex items-center justify-center gap-1.5 w-full">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        <span>НАПИСАТЬ НА WHATSAPP</span>
                    </a>
                </div>
            </div>
        </div>
        `;
        
        finalHtml += productHtml;

        // Insert banner after every 4th item (index 3, 7, 11...)
        if ((index + 1) % 4 === 0 && (index + 1) !== productsToRender.length) {
            finalHtml += bannerHtml;
        }
    });

    container.innerHTML = finalHtml;
}
