// Основная логика сайта

// Глобальные переменные
let productsData = [];

// Применяем баннеры из конфига
document.addEventListener('DOMContentLoaded', () => {
    if (typeof banners !== 'undefined') {
        const mainBannerImg = document.getElementById('main-banner-img');
        const promoBannerImg = document.getElementById('promo-banner-img');
        if (mainBannerImg) mainBannerImg.src = banners.mainBanner;
        if (promoBannerImg) promoBannerImg.src = banners.promoBanner;
    }
});
let currentCategory = 'all';
let allProducts = [];
let filteredProducts = [];
let filterState = {
    category: 'all',
    priceMin: 0,
    priceMax: 10000000,
    search: '',
    specs: {
        speed: [], // array of values
        motor: [], // array of values
        frameSize: [], // Размер рамы
        wheelDiameter: [], // Диаметр колес
        range: [], // Запас хода
        gender: [], // Пол
        brand: [], // Бренд
        speeds: [], // Количество скоростей
        weight: [], // Вес
        color: [], // Цвет
        brakes: [], // Тормоза
        frameMaterial: [], // Материал рамы
        equipment: [] // Уровень оборудования
    }
};

// Пагинация и отображение
let currentPage = 1;
const itemsPerPage = 4; // User requested strict 4 items per page
let viewMode = 'grid'; // 'grid' or 'list'
let sortBy = 'newest'; // 'newest', 'price-asc', 'price-desc', 'name-asc'

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
        // Загружаем и дедуплицируем товары (на случай дублей в products.js)
        const uniqueIds = new Set();
        allProducts = products.filter(p => {
            if (uniqueIds.has(p.id)) return false;
            uniqueIds.add(p.id);
            return true;
        });
        filteredProducts = allProducts;
        console.log('Loaded products:', allProducts.length);
    }

    // Загружаем корзину из localStorage
    loadCart();

    // Инициализация UI
    setupHeader();
    updateCartCount();
    setupViewControls();
    setupSortControls();
    setupCategorySelect();
    setupMobileFilters();
    initializeAllFilters();

    // Проверяем параметры из URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    const categoryFromUrl = urlParams.get('category');

    // Если есть ID товара в URL, показываем страницу товара
    if (productId) {
        const product = allProducts.find(p => p.id === parseInt(productId));
        if (product) {
            const catalogPage = document.getElementById('catalog-page');
            const productPage = document.getElementById('product-page');

            if (catalogPage) catalogPage.classList.add('hidden');
            if (productPage) {
                productPage.classList.remove('hidden');
                renderProductPage(product, productPage);
            }
        }
    } else if (categoryFromUrl) {
        // Если есть категория, но нет товара
        filterState.category = categoryFromUrl;
        // Скрываем карточки категорий, когда выбрана конкретная категория
        const categoriesGrid = document.getElementById('categories-grid');
        if (categoriesGrid) {
            categoriesGrid.classList.add('hidden');
        }
        // Рендер начального списка с учетом категории из URL
        applyFilters();
        // Прокрутка к каталогу товаров при переходе на категорию из URL
        // setTimeout(() => {
        //     const grid = document.getElementById('products-grid');
        //     if (grid) {
        //         grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        //     }
        // }, 100);
    } else {
        // Если категория не указана в URL, показываем карточки категорий и не показываем товары
        filterState.category = 'all';
        const categoriesGrid = document.getElementById('categories-grid');
        if (categoriesGrid) {
            categoriesGrid.classList.remove('hidden');
        }
        // Рендер начального списка
        applyFilters();
    }
});

// Helper: Get Category Name
function getCategoryName(cat) {
    const names = {
        'bicycles': 'Электровелосипеды',
        'electro_scooters': 'Электросамокаты',
        'electro_bikes': 'Электробайки',
        'accessories': 'Аксессуары',
        'repair': 'Ремонт',
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
            cart.push({ ...product, quantity: 1 });
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
        if (filterState.specs[type]) {
            filterState.specs[type] = filterState.specs[type].filter(v => v !== value);
        }
    } else {
        checkbox.classList.remove('hidden');
        // Add to state
        if (!filterState.specs[type]) {
            filterState.specs[type] = [];
        }
        filterState.specs[type].push(value);
    }
    applyFilters();
}
window.toggleSpecFilter = toggleSpecFilter;

// Генерация HTML для опций фильтра
function generateFilterOption(type, value, count = null) {
    const countHtml = count !== null ? `<span class="text-xs text-gray-400">${count}</span>` : '';
    return `
        <label class="flex items-center justify-between cursor-pointer group" onclick="toggleSpecFilter(this, '${type}', '${value.replace(/'/g, "\\'")}')">
            <div class="flex items-center gap-3">
                <div class="h-5 w-5 border border-gray-300 bg-white rounded-sm group-hover:border-blue-500 flex items-center justify-center">
                    <svg class="w-3 h-3 text-blue-600 hidden" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                </div>
                <span class="text-sm text-gray-600">${value}</span>
            </div>
            ${countHtml}
        </label>
    `;
}

// Генерация множественных опций
function generateFilterOptions(type, values, counts = []) {
    return values.map((value, index) => {
        const count = counts[index] !== undefined ? counts[index] : null;
        return generateFilterOption(type, value, count);
    }).join('');
}
window.generateFilterOptions = generateFilterOptions;

// Инициализация всех фильтров при загрузке
function initializeAllFilters() {
    // Функция для заполнения контейнера
    const fillContainer = (selector, type, values, counts) => {
        const containers = document.querySelectorAll(selector);
        containers.forEach(container => {
            if (container) {
                // Проверяем, пустой ли контейнер или содержит только комментарий
                const content = container.innerHTML.trim();
                const isEmpty = content === '' ||
                    content.includes('will be generated') ||
                    content.includes('<!--') ||
                    content === '<!-- Options will be generated by JS -->';
                if (isEmpty) {
                    container.innerHTML = generateFilterOptions(type, values, counts);
                }
            }
        });
    };

    // Диаметр колес
    fillContainer('#filter-wheel-diameter .space-y-3', 'wheelDiameter',
        ['12"', '13"', '14"', '16"', '18"', '19 x 2" MTB', '20"', '20х4', '22"', '24"', '26"', '26"4', '26x3.0', '27.5"', '28"', '29"', '700*28C', '700c', '700C*32'],
        [13, 9, 2, 3, 1, 10, 5, 1, 3, 38, 4, 1, 17, 4, 26, 3, 4, 3]);

    // Запас хода
    fillContainer('#filter-range .space-y-3', 'range',
        ['100-120км', '110-250км', '30-40', '30-50', '30-55', '40-45', '40-65', '40+40 км', '50-55', '50-80', '60-70'],
        [1, 1, 2, 1, 1, 1, 2, 3, 2, 2, 5]);

    // Пол
    fillContainer('#filter-gender .space-y-3', 'gender',
        ['Детский', 'Женский', 'Мужской', 'Юнисекс'],
        [25, 37, 61, 61]);

    // Бренд
    fillContainer('#filter-brand .space-y-3', 'brand',
        ['Activation', 'Bluvall', 'Champion', 'Dook', 'DUOTTS', 'Easy-try', 'EKX', 'ETank', 'Falcon', 'Forever', 'Frike', 'Galaxy', 'Gestalt', 'GL', 'GRAY', 'Hiland', 'Hiper', 'HuntAway', 'HX', 'Kaimarte', 'Kono', 'LAUX', 'Mettler', 'Mexller', 'Mognoose', 'NewSpeed', 'ONESPORT', 'Panther', 'PEXMOR', 'PHILLIPS', 'Phoniex', 'Samebike', 'Skillmax', 'Syige', 'Timetay', 'TimeTry', 'TRINX', 'Tsunami', 'TWITTER', 'Zeegr', 'Барс', 'Гельштат'],
        [2, 2, 1, 1, 5, 1, 1, 1, 5, 2, 2, 1, 16, 1, 1, 3, 1, 2, 3, 2, 3, 8, 1, 1, 3, 1, 1, 1, 3, 9, 2, 15, 9, 1, 1, 5, 8, 1, 1, 4, 1, 1]);

    // Количество скоростей
    fillContainer('#filter-speeds .space-y-3', 'speeds',
        ['1', '10', '11', '12', '16', '17', '18', '21', '24', '27', '30', '7', '8', '9'],
        [24, 10, 2, 1, 5, 1, 5, 40, 9, 6, 3, 27, 3, 4]);

    // Вес
    fillContainer('#filter-weight .space-y-3', 'weight',
        ['10', '11 кг', '12', '13кг', '14', '15', '16', '17', '18', '20', '22', '23', '25 кг', '26', '27', '28', '30', '32', '33,5', '34', '38', '41', '6', '60', '8', '9,8'],
        [3, 3, 7, 10, 11, 27, 9, 3, 1, 3, 7, 1, 1, 3, 4, 3, 2, 8, 4, 5, 2, 3, 16, 2, 5, 1]);

    // Цвет
    fillContainer('#filter-color .space-y-3', 'color',
        ['Баклажан', 'Бежевый', 'Белый', 'Голубой', 'Желтый', 'Зеленый', 'Красно-синий', 'Красный', 'Лазурный', 'Маренго', 'Металлик', 'оранжево-черный', 'Оранжевый', 'Розовый', 'Салатовый', 'Светло серый', 'Светло-бирюзовый', 'Светло-зеленый', 'Серебряный', 'Серный', 'Серо-бордовый', 'Серо-голубой', 'Серо-оранжевый', 'Серый', 'Сине-зеленый', 'Синий', 'Темно-зеленый', 'Темно-серый', 'Фиолетовый', 'Хаки', 'Черно-красный', 'Черный'],
        [2, 1, 13, 2, 2, 3, 1, 13, 3, 5, 1, 1, 4, 12, 1, 1, 1, 1, 3, 1, 1, 2, 1, 16, 1, 13, 8, 5, 5, 4, 6, 48]);

    // Тормоза
    fillContainer('#filter-brakes .space-y-3', 'brakes',
        ['Без тормозов', 'Дисковые гидравлические', 'Дисковые механические', 'Ножные', 'Ободные механические'],
        [2, 57, 65, 1, 24]);

    // Материал рамы
    fillContainer('#filter-frame-material .space-y-3', 'frameMaterial',
        ['Алюминий', 'Карбон', 'Сталь'],
        [133, 1, 14]);

    // Уровень оборудования
    fillContainer('#filter-equipment .space-y-3', 'equipment',
        ['Logan', 'LTWOO', 'MAXXIS', 'Shimano', 'Sram Rival', 'X-Spark', 'Xpark', 'Китай'],
        [3, 12, 1, 78, 1, 3, 1, 0]);
}

// Поиск
const searchInput = document.getElementById('search-input-desktop');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        filterState.search = e.target.value.toLowerCase();
        applyFilters();
    });
}

const searchInputMobile = document.getElementById('search-input-mobile');
if (searchInputMobile) {
    searchInputMobile.addEventListener('input', (e) => {
        filterState.search = e.target.value.toLowerCase();
        applyFilters();
    });
}

function handleSearch() {
    // Получаем значение из десктопного или мобильного поля поиска
    const desktopInput = document.getElementById('search-input-desktop');
    const mobileInput = document.getElementById('search-input-mobile');

    if (desktopInput && desktopInput.value) {
        filterState.search = desktopInput.value.toLowerCase();
    } else if (mobileInput && mobileInput.value) {
        filterState.search = mobileInput.value.toLowerCase();
    }

    applyFilters();
}
window.handleSearch = handleSearch;


// Главная функция применения фильтров
function applyFilters() {
    // Если категория не выбрана (all), показываем главную страницу с категориями
    if (filterState.category === 'all') {
        showHome();
        return;
    }

    // Иначе показываем каталог товаров
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

        // Frame Size
        if (filterState.specs.frameSize && filterState.specs.frameSize.length > 0) {
            const pFrameSize = p.detailedSpecs?.frameSize || p.fullSpecs?.frameSize || '';
            const match = filterState.specs.frameSize.some(val => pFrameSize.includes(val));
            if (!match) return false;
        }

        // Wheel Diameter
        if (filterState.specs.wheelDiameter && filterState.specs.wheelDiameter.length > 0) {
            const pWheel = p.detailedSpecs?.wheels || p.fullSpecs?.wheels || '';
            const match = filterState.specs.wheelDiameter.some(val => pWheel.includes(val));
            if (!match) return false;
        }

        // Range
        if (filterState.specs.range && filterState.specs.range.length > 0) {
            const pRange = p.detailedSpecs?.range || p.fullSpecs?.range || '';
            const match = filterState.specs.range.some(val => pRange.includes(val));
            if (!match) return false;
        }

        // Gender
        if (filterState.specs.gender && filterState.specs.gender.length > 0) {
            const pGender = p.detailedSpecs?.gender || p.fullSpecs?.gender || '';
            const match = filterState.specs.gender.some(val => pGender.includes(val));
            if (!match) return false;
        }

        // Brand
        if (filterState.specs.brand && filterState.specs.brand.length > 0) {
            const pBrand = p.brand || '';
            const match = filterState.specs.brand.some(val => pBrand.toLowerCase().includes(val.toLowerCase()));
            if (!match) return false;
        }

        // Speeds
        if (filterState.specs.speeds && filterState.specs.speeds.length > 0) {
            const pSpeeds = p.detailedSpecs?.speeds || p.fullSpecs?.speeds || '';
            const match = filterState.specs.speeds.some(val => pSpeeds.includes(val));
            if (!match) return false;
        }

        // Weight
        if (filterState.specs.weight && filterState.specs.weight.length > 0) {
            const pWeight = p.detailedSpecs?.weight || p.fullSpecs?.weight || '';
            const match = filterState.specs.weight.some(val => pWeight.includes(val));
            if (!match) return false;
        }

        // Color
        if (filterState.specs.color && filterState.specs.color.length > 0) {
            const pColor = p.detailedSpecs?.color || p.fullSpecs?.color || '';
            const match = filterState.specs.color.some(val => pColor.toLowerCase().includes(val.toLowerCase()));
            if (!match) return false;
        }

        // Brakes
        if (filterState.specs.brakes && filterState.specs.brakes.length > 0) {
            const pBrakes = p.detailedSpecs?.brakes || p.fullSpecs?.brakes || '';
            const match = filterState.specs.brakes.some(val => pBrakes.toLowerCase().includes(val.toLowerCase()));
            if (!match) return false;
        }

        // Frame Material
        if (filterState.specs.frameMaterial && filterState.specs.frameMaterial.length > 0) {
            const pMaterial = p.detailedSpecs?.frameMaterial || p.fullSpecs?.frameMaterial || '';
            const match = filterState.specs.frameMaterial.some(val => pMaterial.toLowerCase().includes(val.toLowerCase()));
            if (!match) return false;
        }

        // Equipment
        if (filterState.specs.equipment && filterState.specs.equipment.length > 0) {
            const pEquipment = p.detailedSpecs?.equipment || p.fullSpecs?.equipment || '';
            const match = filterState.specs.equipment.some(val => pEquipment.toLowerCase().includes(val.toLowerCase()));
            if (!match) return false;
        }

        return true;
    });

    // Сортировка
    // Сортировка
    filtered = sortProducts(filtered, sortBy);

    // Сохраняем отфильтрованные товары (полный список)
    filteredProducts = filtered;

    // Сбрасываем на первую страницу при изменении фильтров
    currentPage = 1;

    // Treat null/undefined/empty category as 'all'
    if (!filterState.category) filterState.category = 'all';

    render();

    // Обновляем заголовок на основе категории
    const title = document.getElementById('page-title');
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');
    const catalogControls = document.getElementById('catalog-controls');
    const catalogHeader = document.getElementById('catalog-header');
    const repairContent = document.getElementById('repair-content');
    const productsGrid = document.getElementById('products-grid');
    const paginationContainer = document.querySelector('.mt-12.flex.items-center.justify-center.gap-2');

    if (filterState.category === 'repair') {
        if (catalogControls) catalogControls.classList.add('hidden');
        if (catalogHeader) catalogHeader.classList.add('hidden');

        // Show Repair Content
        if (repairContent) repairContent.classList.remove('hidden');

        // Hide Grid and Pagination - FORCE HIDE due to !important in CSS
        if (productsGrid) productsGrid.style.setProperty('display', 'none', 'important');
        if (paginationContainer) paginationContainer.style.setProperty('display', 'none', 'important');

        // Update Breadcrumb and Title for Repair
        if (title) title.textContent = 'Ремонт';
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Ремонт';

        // Hide "Products not found" text (product count)
        const countEl = document.querySelector('.text-sm.text-gray-400.pl-2');
        if (countEl) countEl.style.display = 'none';

        return; // Stop here for repair page
    } else {
        if (catalogControls) catalogControls.classList.remove('hidden');
        if (catalogHeader) catalogHeader.classList.remove('hidden');

        // Show Repair Content
        if (repairContent) repairContent.classList.add('hidden');

        // Show Grid and Pagination (will be handled by render functions)
        if (productsGrid) productsGrid.style.removeProperty('display');
        if (paginationContainer) paginationContainer.style.removeProperty('display');

        // Ensure "Products not found" / count text is visible for other categories
        const countEl = document.querySelector('.text-sm.text-gray-400.pl-2');
        if (countEl) countEl.style.display = '';
    }

    if (title) {
        title.textContent = filterState.category === 'all' ? 'Категории' : getCategoryName(filterState.category);
    }
    if (breadcrumbCurrent) {
        breadcrumbCurrent.textContent = getCategoryName(filterState.category);
    }

    // Обновляем текст "Показано X товаров"
    const countEl = document.querySelector('.text-sm.text-gray-400.pl-2');
    if (countEl) {
        if (filtered.length === 0) {
            countEl.textContent = 'Товары не найдены';
        } else {
            const start = (currentPage - 1) * itemsPerPage + 1;
            const end = Math.min(currentPage * itemsPerPage, filtered.length);
            countEl.textContent = `Показано ${start}–${end} из ${filtered.length} товаров`;
        }
    }
}

// Выбор категории (из меню или грида) - переход на новую страницу
function filterByCategory(category) {
    // Переход на новую страницу с параметром категории в URL
    const baseUrl = window.location.origin + window.location.pathname;
    const newUrl = baseUrl + '?category=' + encodeURIComponent(category);
    window.location.href = newUrl;
}
window.filterByCategory = filterByCategory;

// Показать каталог, скрыть товар
// Показать главную страницу с категориями
function showHome() {
    document.getElementById('catalog-page').classList.remove('hidden');
    document.getElementById('product-page').classList.add('hidden');

    // Показать товары и грид категорий (на главной показываем всё)
    const categoriesGrid = document.getElementById('categories-grid');
    const productsGrid = document.getElementById('products-grid');
    const breadcrumbs = document.getElementById('breadcrumbs');
    const underline = document.getElementById('title-underline');
    const sidebar = document.querySelector('aside');

    if (categoriesGrid) categoriesGrid.classList.remove('hidden');
    if (productsGrid) productsGrid.classList.remove('hidden');
    if (breadcrumbs) breadcrumbs.classList.add('hidden');
    // if (underline) underline.classList.remove('hidden'); // Removed title underline
    if (sidebar) sidebar.classList.add('hidden');

    // Show reviews on home
    const reviewsSection = document.getElementById('reviews-section');
    if (reviewsSection) reviewsSection.classList.remove('hidden');

    // Show Why Us on home
    const whyUsSection = document.getElementById('why-us-section');
    if (whyUsSection) whyUsSection.classList.remove('hidden');

    // Сбросить фильтр категории и обновить отображение
    filterState.category = 'all';
    currentPage = 1;
    // initializeAllFilters(); // Это не нужно вызывать здесь, фильтры и так инициализированы
    applyFilters();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.showHome = showHome;

// Показать каталог товаров
function showCatalog() {
    // Обновляем URL, убирая параметр product
    const url = new URL(window.location.href);
    url.searchParams.delete('product');
    window.history.pushState({}, '', url.toString());

    document.getElementById('catalog-page').classList.remove('hidden');
    document.getElementById('product-page').classList.add('hidden');

    // Показать товары и скрыть грид категорий
    const categoriesGrid = document.getElementById('categories-grid');
    const productsGrid = document.getElementById('products-grid');
    const breadcrumbs = document.getElementById('breadcrumbs');
    const sidebar = document.querySelector('aside');

    if (categoriesGrid) categoriesGrid.classList.add('hidden');
    if (productsGrid) productsGrid.classList.remove('hidden');
    if (breadcrumbs) breadcrumbs.classList.remove('hidden');
    if (sidebar) sidebar.classList.remove('hidden');

    // Hide reviews in catalog
    const reviewsSection = document.getElementById('reviews-section');
    if (reviewsSection) reviewsSection.classList.add('hidden');

    // Hide Why Us in catalog
    const whyUsSection = document.getElementById('why-us-section');
    if (whyUsSection) whyUsSection.classList.add('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.showCatalog = showCatalog;

// Открыть страницу товара
function showProduct(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    // Обновляем URL без перезагрузки страницы
    const url = new URL(window.location.href);
    url.searchParams.set('product', id);
    window.history.pushState({ productId: id }, '', url.toString());

    const catalogPage = document.getElementById('catalog-page');
    const productPage = document.getElementById('product-page');

    catalogPage.classList.add('hidden');
    productPage.classList.remove('hidden');

    // Рендер страницы товара
    renderProductPage(product, productPage);
    window.scrollTo({ top: 0, behavior: 'instant' });
}
window.showProduct = showProduct;

// Вернуться назад
function goBack() {
    const url = new URL(window.location.href);
    url.searchParams.delete('product');
    window.history.pushState({}, '', url.toString());

    const catalogPage = document.getElementById('catalog-page');
    const productPage = document.getElementById('product-page');

    productPage.classList.add('hidden');
    catalogPage.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.goBack = goBack;

// Обработчик кнопки "Назад" в браузере
window.addEventListener('popstate', function (event) {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');

    if (productId) {
        const product = allProducts.find(p => p.id === parseInt(productId));
        if (product) {
            const catalogPage = document.getElementById('catalog-page');
            const productPage = document.getElementById('product-page');

            catalogPage.classList.add('hidden');
            productPage.classList.remove('hidden');
            renderProductPage(product, productPage);
        }
    } else {
        const catalogPage = document.getElementById('catalog-page');
        const productPage = document.getElementById('product-page');

        productPage.classList.add('hidden');
        catalogPage.classList.remove('hidden');
    }
});

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
// Глобальные переменные для галереи изображений
let currentImageIndex = 0;
let productImages = [];

function renderProductPage(product, container, isModal = false) {
    const images = product.images && product.images.length > 0 ? product.images : [product.image];
    productImages = images; // Сохраняем для навигации
    currentImageIndex = 0;

    const thumbnailsHtml = images.map((img, index) => `
        <div class="cursor-pointer border-2 ${index === 0 ? 'border-blue-500' : 'border-transparent'} hover:border-blue-500 rounded overflow-hidden aspect-square" onclick="changeMainImage(this, '${img}', ${index})">
            <img src="${img}" class="w-full h-full object-cover">
        </div>
    `).join('');

    // Стрелки навигации (показываем только если больше 1 фото)
    const arrowsHtml = images.length > 1 ? `
        <button onclick="prevImage()" class="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition z-10">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <button onclick="nextImage()" class="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition z-10">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
    ` : '';

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
            <button onclick="goBack()" class="hover:text-blue-600 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Назад
            </button>
            <span>/</span>
            <a href="#" onclick="goBack(); return false;" class="hover:text-blue-600">Каталог</a>
            <span>/</span>
            <a href="#" onclick="goBack(); filterByCategory('${product.category}'); return false;" class="hover:text-blue-600">${getCategoryName(product.category)}</a>
            <span>/</span>
            <span class="text-gray-900 truncate max-w-[200px]">${product.title}</span>
        </div>
    `;

    const wrapperClass = isModal ? 'p-6 lg:p-10' : 'container-custom';
    const isInStock = product.inStock !== false;
    const availabilityHtml = isInStock
        ? '<div class="text-green-600 font-bold mb-6 flex items-center gap-2"><span class="w-2 h-2 bg-green-600 rounded-full"></span> В наличии</div>'
        : '<div class="text-orange-500 font-bold mb-6 flex items-center gap-2"><span class="w-2 h-2 bg-orange-500 rounded-full"></span> На заказ</div>';

    container.innerHTML = `
        <div class="${wrapperClass}">
            ${breadcrumbs}

            <div class="lg:grid lg:grid-cols-2 lg:gap-12">
                <!-- Left: Images -->
                <div class="mb-8 lg:mb-0">
                    <div class="relative bg-white border border-gray-100 rounded-lg overflow-hidden mb-4 group">
                        ${arrowsHtml}
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

                    ${availabilityHtml}

                    ${product.brand ? `<div class="mb-6"><span class="text-2xl font-black text-gray-900 italic">${product.brand}</span></div>` : ''}

                    <div class="prose prose-sm text-gray-600 mb-8 max-h-[200px] overflow-y-auto ${isModal ? '' : 'lg:max-h-none'}" style="word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">
                        ${product.description || 'Описание отсутствует.'}
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-wrap gap-4 mb-6">
                        <button onclick="addToCart(${product.id})" class="flex-1 bg-[#00a0a0] hover:bg-[#008080] text-white font-bold py-3 px-6 rounded uppercase transition shadow-md">
                            В корзину
                        </button>
                    </div>

                    <a href="https://wa.me/996508708408?text=Здравствуйте, хочу купить ${encodeURIComponent(product.title)}" target="_blank" class="block w-full bg-[#82D84C] hover:bg-[#72c73b] text-white font-bold py-4 rounded-lg text-lg uppercase flex items-center justify-center gap-3 transition shadow-lg hover:shadow-xl mb-6">
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
function changeMainImage(thumb, src, index = null) {
    const mainImgPage = document.getElementById('main-product-image-page');
    const mainImgModal = document.getElementById('main-product-image-modal');

    if (mainImgPage) mainImgPage.src = src;
    if (mainImgModal) mainImgModal.src = src;

    // Обновляем индекс если передан
    if (index !== null) {
        currentImageIndex = index;
    }

    const thumbnails = thumb.parentElement.children;
    for (let t of thumbnails) {
        t.classList.remove('border-blue-500');
        t.classList.add('border-transparent');
    }
    thumb.classList.remove('border-transparent');
    thumb.classList.add('border-blue-500');
}
window.changeMainImage = changeMainImage;

// Навигация по изображениям - предыдущее
function prevImage() {
    if (productImages.length <= 1) return;

    currentImageIndex--;
    if (currentImageIndex < 0) {
        currentImageIndex = productImages.length - 1;
    }

    updateMainImage();
}
window.prevImage = prevImage;

// Навигация по изображениям - следующее
function nextImage() {
    if (productImages.length <= 1) return;

    currentImageIndex++;
    if (currentImageIndex >= productImages.length) {
        currentImageIndex = 0;
    }

    updateMainImage();
}
window.nextImage = nextImage;

// Навигация по изображениям на карточке товара (в каталоге)
function changeProductImage(productId, direction) {
    const imageElement = document.getElementById(`product-image-${productId}`);
    if (!imageElement) return;

    const images = JSON.parse(imageElement.getAttribute('data-images') || '[]');
    if (images.length <= 1) return;

    let currentIndex = parseInt(imageElement.getAttribute('data-current-index') || '0');

    // Изменяем индекс в зависимости от направления (-1 для влево, 1 для вправо)
    currentIndex += direction;

    // Обрабатываем зацикливание
    if (currentIndex < 0) {
        currentIndex = images.length - 1;
    } else if (currentIndex >= images.length) {
        currentIndex = 0;
    }

    // Обновляем изображение и индекс
    imageElement.src = images[currentIndex];
    imageElement.setAttribute('data-current-index', currentIndex.toString());
}
window.changeProductImage = changeProductImage;

// Обновление главного изображения и миниатюр
function updateMainImage() {
    const mainImgPage = document.getElementById('main-product-image-page');
    const mainImgModal = document.getElementById('main-product-image-modal');

    const src = productImages[currentImageIndex];

    if (mainImgPage) mainImgPage.src = src;
    if (mainImgModal) mainImgModal.src = src;

    // Обновляем выделение миниатюр
    const thumbnailContainers = document.querySelectorAll('.grid.grid-cols-4.gap-4');
    thumbnailContainers.forEach(container => {
        const thumbnails = container.children;
        for (let i = 0; i < thumbnails.length; i++) {
            if (i === currentImageIndex) {
                thumbnails[i].classList.remove('border-transparent');
                thumbnails[i].classList.add('border-blue-500');
            } else {
                thumbnails[i].classList.remove('border-blue-500');
                thumbnails[i].classList.add('border-transparent');
            }
        }
    });
}

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

// Сортировка товаров
function sortProducts(products, sortType) {
    const sorted = [...products];

    switch (sortType) {
        case 'price-asc':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-desc':
            return sorted.sort((a, b) => b.price - a.price);
        case 'name-asc':
            return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
        case 'newest':
        default:
            // По умолчанию - по ID (новые первыми)
            return sorted.sort((a, b) => b.id - a.id);
    }
}

// Рендер грида товаров
function renderProducts() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    container.innerHTML = '';

    const allProductsToRender = filteredProducts;
    if (!allProductsToRender || allProductsToRender.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-10 text-gray-500">Товары не найдены</div>';
        // renderPagination(0); // Called separately in applyFilters/setItemsPerPage
        return;
    }

    // Применяем пагинацию
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const visibleItems = allProductsToRender.slice(startIndex, endIndex);

    // Применяем вид отображения
    if (viewMode === 'list') {
        container.classList.add('list-view');
        container.classList.remove('grid-view');
    } else {
        container.classList.add('grid-view');
        container.classList.remove('list-view');
    }

    const bannerHtml = `
        <div class="col-span-full w-full">
            <img src="assets/images/banner.png" alt="Promo Banner" class="w-full h-auto object-cover">
        </div>
    `;

    let finalHtml = '';

    visibleItems.forEach((product, index) => {
        // globalIndex helps track overall position if needed, but for banner logic on *page* index 
        // we might stick to local 'index'. User asked: "banner after 2nd item on homepage".
        // This implies visual position 2 on the current page.

        // Получаем массив изображений товара
        const productImages = product.images && product.images.length > 0 ? product.images : [product.image];
        const hasMultipleImages = productImages.length > 1;
        const imageContainerId = `product-image-${product.id}`;

        // Стрелки навигации (показываем только если больше 1 фото)
        const arrowsHtml = hasMultipleImages ? `
            <button onclick="event.stopPropagation(); changeProductImage(${product.id}, -1)" class="product-arrow-left absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-1.5 shadow-lg transition opacity-0 group-hover:opacity-100 z-20">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <button onclick="event.stopPropagation(); changeProductImage(${product.id}, 1)" class="product-arrow-right absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-1.5 shadow-lg transition opacity-0 group-hover:opacity-100 z-20">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
        ` : '';

        const productHtml = `
        <div onclick="showProduct(${product.id})" class="product-card cursor-pointer group bg-white flex flex-col">
            <!-- Image Section -->
            <div class="relative bg-white overflow-hidden product-image-container" style="aspect-ratio: 1 / 1;" ontouchstart="this.classList.add('touching')" ontouchend="setTimeout(() => this.classList.remove('touching'), 300)">
                ${arrowsHtml}
                <img id="${imageContainerId}" src="${productImages[0]}" alt="${product.title}" class="w-full h-full object-contain object-center" data-images='${JSON.stringify(productImages)}' data-current-index="0">
                
                <!-- Quick View Button -->
                <button onclick="event.stopPropagation(); openQuickView(${product.id})" class="product-quick-view absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white/95 hover:bg-white text-gray-800 px-2 md:px-3 py-1.5 rounded shadow-lg transition flex items-center gap-1.5 z-10" title="Быстрый просмотр">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    <span class="quick-view-text font-bold uppercase hidden md:inline text-[10px]">БЫСТРЫЙ ПРОСМОТР</span>
                </button>
            </div>
            
            <!-- Content Section -->
            <div class="p-2 flex flex-col flex-1">
                <!-- Category -->
                <div class="mb-0.5 text-[9px] text-gray-500 uppercase tracking-wider text-center">${getCategoryName(product.category)}</div>
                
                <!-- Title -->
                <h3 class="text-[12px] font-medium text-gray-900 mb-1 leading-tight line-clamp-2 text-center">${product.title}</h3>
                
                <!-- Price -->
                <div class="mb-2 text-center">
                    <div class="text-base font-bold text-black mb-0.5">${product.price.toLocaleString()} сом</div>
                    ${product.oldPrice ? `<div class="text-[10px] text-gray-400 line-through">${product.oldPrice.toLocaleString()} сом</div>` : ''}
                    ${product.discount || product.oldPrice ? `<div class="text-[9px] font-bold text-green-600 uppercase mt-0.5">Скидка</div>` : ''}
                </div>
                
                <!-- Action Buttons -->
                <div class="mt-auto space-y-1.5">
                    <div class="flex justify-center">
                        <button onclick="event.stopPropagation(); addToCart(${product.id})" class="bg-gray-100 hover:bg-gray-200 text-gray-800 p-1.5 rounded transition shadow-sm" title="В корзину">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </button>
                    </div>
                    <a href="https://wa.me/996508708408?text=Здравствуйте, интересует ${encodeURIComponent(product.title)}" target="_blank" onclick="event.stopPropagation()" class="block bg-[#82D84C] hover:bg-[#72c73b] text-white font-bold py-4 px-3 rounded-lg transition flex items-center justify-center gap-3 w-full">
                        <svg class="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        <div class="flex flex-col leading-tight text-center">
                            <span class="text-[11px] md:text-[12px] uppercase font-bold">НАПИСАТЬ НА</span>
                            <span class="text-[13px] md:text-[14px] uppercase font-black">WHATSAPP</span>
                        </div>
                    </a>
                </div>
            </div>
        </div>
        `;

        finalHtml += productHtml;

        // Insert banner after 2nd item on homepage (visual index on current page)
        if (filterState.category === 'all' && viewMode === 'grid' && (index + 1) === 2) {
            finalHtml += bannerHtml;
        }

        // Insert banner after every 4th item for other categories (if needed, or simplify)
        // Keeping it consistent with previous requests: only homepage gets special 2nd item banner
        // If categories use different logic:
        if (filterState.category !== 'all' && viewMode === 'grid' && (index + 1) % 4 === 0 && (index + 1) < visibleItems.length) {
            finalHtml += bannerHtml;
        }
    });

    container.innerHTML = finalHtml;
}

// Пагинация: Переключение страницы
function goToPage(page) {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    render();

    // Скролл к началу списка товаров
    const grid = document.getElementById('products-grid');
    if (grid) {
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
window.goToPage = goToPage;

// Пагинация: Рендер пагинации
// Пагинация: Рендер пагинации
function renderPagination(totalPages) {
    const paginationContainer = document.querySelector('.mt-12.flex.items-center.justify-center.gap-2');

    // Safety check if container exists
    if (!paginationContainer) return;

    // Clear existing pagination
    paginationContainer.innerHTML = '';

    const totalItems = filteredProducts.length;

    // Hide if 0 or 1 page
    if (totalItems === 0 || totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }

    // Ensure container is visible
    paginationContainer.style.display = 'flex';
    paginationContainer.style.removeProperty('display'); // Reset any inline 'none' causing issues

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    pages.forEach((pageNumber) => {
        const btn = document.createElement('button');
        btn.type = 'button';

        const isActive = pageNumber === currentPage;
        let classes = 'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors';
        classes += isActive ? ' bg-[#00a0a0] text-white' : ' text-gray-600 hover:bg-gray-100';

        btn.className = classes;
        btn.textContent = pageNumber;

        if (!isActive) {
            btn.addEventListener('click', () => {
                currentPage = pageNumber;
                render();
                const grid = document.getElementById('products-grid');
                if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }

        paginationContainer.appendChild(btn);
    });
}


function render() {
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (currentPage > totalPages) {
        currentPage = Math.max(1, totalPages);
    }
    if (currentPage < 1) currentPage = 1;

    renderProducts();
    renderPagination(totalPages);
}
// Переключение вида отображения (Grid/List)
function setViewMode(mode) {
    viewMode = mode;

    // Обновляем визуальное состояние кнопок
    const gridBtn = document.querySelector('.view-grid-btn');
    const listBtn = document.querySelector('.view-list-btn');

    if (gridBtn && listBtn) {
        if (mode === 'grid') {
            gridBtn.classList.remove('text-gray-400');
            gridBtn.classList.add('text-[#00c2c2]');
            listBtn.classList.remove('text-[#00c2c2]');
            listBtn.classList.add('text-gray-400');
        } else {
            listBtn.classList.remove('text-gray-400');
            listBtn.classList.add('text-[#00c2c2]');
            gridBtn.classList.remove('text-[#00c2c2]');
            gridBtn.classList.add('text-gray-400');
        }
    }

    render();
}
window.setViewMode = setViewMode;

// Инициализация кнопок вида отображения
function setupViewControls() {
    const gridBtn = document.querySelector('.view-grid-btn');
    const listBtn = document.querySelector('.view-list-btn');

    if (gridBtn) {
        gridBtn.addEventListener('click', () => setViewMode('grid'));
    }
    if (listBtn) {
        listBtn.addEventListener('click', () => setViewMode('list'));
    }

    // Устанавливаем начальное состояние
    setViewMode('grid');
}

// Обработчик изменения количества товаров на странице
function setItemsPerPage(count) {
    currentPage = 1;
    render();

    // Обновляем текст "Показано X товаров"
    const countEl = document.querySelector('.text-sm.text-gray-400.pl-2');
    if (countEl) {
        const start = 1;
        const end = Math.min(itemsPerPage, filteredProducts.length);
        countEl.textContent = `Показано ${start}–${end} из ${filteredProducts.length} товаров`;
    }
}
window.setItemsPerPage = setItemsPerPage;

// Обработчик изменения сортировки
function setSortBy(sortType) {
    sortBy = sortType;
    currentPage = 1;
    applyFilters();
}
window.setSortBy = setSortBy;

// Инициализация селектов сортировки
function setupSortControls() {
    const itemsPerPageSelect = document.querySelector('select[data-items-per-page]');
    const sortSelect = document.querySelector('select[data-sort]');

    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', (e) => {
            setItemsPerPage(e.target.value);
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            setSortBy(e.target.value);
        });
    }
}

// Обработчик выбора категории из селекта - переход на новую страницу
function handleCategorySelect(category) {
    const selectedCategory = (category === 'all' || category === '') ? 'all' : category;

    // Переход на новую страницу с параметром категории в URL
    const url = new URL(window.location.href);
    if (selectedCategory === 'all') {
        url.searchParams.delete('category');
    } else {
        url.searchParams.set('category', selectedCategory);
    }
    window.location.href = url.toString();
}
window.handleCategorySelect = handleCategorySelect;

// Инициализация селекта категории
function setupCategorySelect() {
    const categorySelect = document.querySelector('select[data-category]');

    if (categorySelect) {
        // Получаем текущую категорию из URL
        const urlParams = new URLSearchParams(window.location.search);
        const currentCategory = urlParams.get('category') || 'all';

        // Заполняем опции
        const categories = [
            { value: 'all', name: 'Все категории' },
            { value: 'bicycles', name: 'Электровелосипеды' },
            { value: 'electro_scooters', name: 'Электросамокаты' },
            { value: 'electro_bikes', name: 'Электробайки' },
            { value: 'accessories', name: 'Аксессуары' },
            { value: 'repair', name: 'Ремонт' },
            { value: 'winter', name: 'Зимние товары' }
        ];

        categorySelect.innerHTML = categories.map(cat =>
            `<option value="${cat.value}" ${cat.value === currentCategory ? 'selected' : ''}>${cat.name}</option>`
        ).join('');

        categorySelect.addEventListener('change', (e) => {
            handleCategorySelect(e.target.value);
        });
    }
}

// Мобильные фильтры: Инициализация
function setupMobileFilters() {
    // Копируем содержимое сайдбара в модальное окно
    const desktopSidebar = document.querySelector('aside.hidden.space-y-10.lg\\:block');
    const mobileFiltersContent = document.getElementById('mobile-filters-content');

    if (desktopSidebar && mobileFiltersContent) {
        // Клонируем содержимое сайдбара
        const clonedContent = desktopSidebar.cloneNode(true);
        clonedContent.classList.remove('hidden', 'lg:block');
        clonedContent.classList.add('block');
        mobileFiltersContent.innerHTML = clonedContent.innerHTML;

        // Инициализируем селект категории в модальном окне
        const mobileCategorySelect = mobileFiltersContent.querySelector('select[data-category]');
        if (mobileCategorySelect) {
            // Получаем текущую категорию из URL
            const urlParams = new URLSearchParams(window.location.search);
            const currentCategory = urlParams.get('category') || 'all';

            const categories = [
                { value: 'all', name: 'Все категории' },
                { value: 'bicycles', name: 'Электровелосипеды' },
                { value: 'electro_scooters', name: 'Электросамокаты' },
                { value: 'electro_bikes', name: 'Электробайки' },
                { value: 'accessories', name: 'Аксессуары' },
                { value: 'repair', name: 'Ремонт' },
                { value: 'winter', name: 'Зимние товары' }
            ];

            mobileCategorySelect.innerHTML = categories.map(cat =>
                `<option value="${cat.value}" ${cat.value === currentCategory ? 'selected' : ''}>${cat.name}</option>`
            ).join('');

            mobileCategorySelect.addEventListener('change', (e) => {
                handleCategorySelect(e.target.value);
                closeMobileFilters();
            });
        }

        // Инициализируем все фильтры в модальном окне после копирования
        // Не нужно вызывать initializeAllFilters здесь, так как она уже вызывается в основном коде
        // и использует querySelectorAll для поиска всех контейнеров
    }
}

// Мобильные фильтры: Открыть
function openMobileFilters() {
    const modal = document.getElementById('mobile-filters-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Убеждаемся, что все фильтры заполнены в модальном окне
        initializeAllFilters();

        // Небольшая задержка для плавной анимации
        setTimeout(() => {
            const panel = modal.querySelector('.fixed.right-0');
            if (panel) {
                panel.style.transform = 'translateX(0)';
            }
        }, 10);
    }
}
window.openMobileFilters = openMobileFilters;

// Мобильные фильтры: Закрыть
function closeMobileFilters() {
    const modal = document.getElementById('mobile-filters-modal');
    if (modal) {
        const panel = modal.querySelector('.fixed.right-0');
        if (panel) {
            panel.style.transform = 'translateX(100%)';
        }
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }
}
window.closeMobileFilters = closeMobileFilters;
