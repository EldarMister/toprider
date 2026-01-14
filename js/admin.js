// Админ-панель для статического сайта

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    if (typeof products === 'undefined') {
        alert('Ошибка: файл data/products.js не найден или поврежден!');
        return;
    }
    renderTable();
    // Добавляем первое поле для изображения
    addImageField();
    // Инициализация баннеров
    initBanners();
});

function initBanners() {
    if (typeof banners !== 'undefined') {
        updateBannerPreview('mainBanner', banners.mainBanner);
        updateBannerPreview('promoBanner', banners.promoBanner);
        document.getElementById('url-mainBanner').value = banners.mainBanner.startsWith('data:') ? '' : banners.mainBanner;
        document.getElementById('url-promoBanner').value = banners.promoBanner.startsWith('data:') ? '' : banners.promoBanner;
    }
}

// Навигация
function showSection(sectionId) {
    document.getElementById('section-list').classList.add('hidden');
    document.getElementById('section-add').classList.add('hidden');
    document.getElementById('section-banners').classList.add('hidden');

    document.getElementById(`section-${sectionId}`).classList.remove('hidden');

    if (sectionId === 'add') {
        resetForm();
    } else if (sectionId === 'banners') {
        initBanners();
    } else {
        renderTable();
    }
}
window.showSection = showSection;

// Рендер таблицы
function renderTable() {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '';

    document.getElementById('total-count').innerText = products.length;

    products.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <img src="${product.image}" class="h-10 w-10 object-cover rounded">
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${product.title}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${getCategoryName(product.category)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${product.price.toLocaleString()} с.
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="editProduct(${product.id})" class="text-indigo-600 hover:text-indigo-900 mr-3">✏️</button>
                <button onclick="deleteProduct(${product.id})" class="text-red-600 hover:text-red-900">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Удаление
function deleteProduct(id) {
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
        const index = products.findIndex(p => p.id === id);
        if (index > -1) {
            products.splice(index, 1);
            renderTable();
        }
    }
}
window.deleteProduct = deleteProduct;

// Редактирование
window.editProduct = function (id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('form-title').innerText = 'Редактировать товар';
    document.getElementById('edit-id').value = product.id;

    document.getElementById('inp-title').value = product.title;
    document.getElementById('inp-category').value = product.category;
    document.getElementById('inp-brand').value = product.brand || '';
    document.getElementById('inp-price').value = product.price;
    document.getElementById('inp-oldPrice').value = product.oldPrice || '';
    document.getElementById('inp-video').value = product.video || '';
    document.getElementById('inp-description').value = product.description || '';

    // Изображения
    const imagesContainer = document.getElementById('images-container');
    imagesContainer.innerHTML = '';
    const images = product.images && product.images.length > 0 ? product.images : [product.image];
    images.forEach(img => {
        if (img) {
            // Определяем, это base64 или URL
            const isBase64 = img.startsWith('data:image/');
            addImageField(img, isBase64);
        }
    });

    // Основные характеристики
    if (product.detailedSpecs) {
        document.getElementById('spec-motor').value = product.detailedSpecs.motor || '';
        document.getElementById('spec-speed').value = product.detailedSpecs.speed || '';
        document.getElementById('spec-battery').value = product.detailedSpecs.battery || '';
        document.getElementById('spec-range').value = product.detailedSpecs.range || '';
    } else {
        clearSpecs();
    }

    // Полные характеристики
    if (product.fullSpecs) {
        document.getElementById('fullspec-battery').value = product.fullSpecs.battery || '';
        document.getElementById('fullspec-motor').value = product.fullSpecs.motor || '';
        document.getElementById('fullspec-peakPower').value = product.fullSpecs.peakPower || '';
        document.getElementById('fullspec-speed').value = product.fullSpecs.speed || '';
        document.getElementById('fullspec-range').value = product.fullSpecs.range || '';
        document.getElementById('fullspec-brakes').value = product.fullSpecs.brakes || '';
        document.getElementById('fullspec-wheels').value = product.fullSpecs.wheels || '';
        document.getElementById('fullspec-suspension').value = product.fullSpecs.suspension || '';
        document.getElementById('fullspec-maxLoad').value = product.fullSpecs.maxLoad || '';
        document.getElementById('fullspec-chargeTime').value = product.fullSpecs.chargeTime || '';
        document.getElementById('fullspec-steeringDamper').value = product.fullSpecs.steeringDamper || '';
        document.getElementById('fullspec-alarm').value = product.fullSpecs.alarm || '';
        document.getElementById('fullspec-gps').value = product.fullSpecs.gps || '';
        document.getElementById('fullspec-display').value = product.fullSpecs.display || '';
        document.getElementById('fullspec-lighting').value = product.fullSpecs.lighting || '';
        document.getElementById('fullspec-turnSignals').value = product.fullSpecs.turnSignals || '';
        document.getElementById('fullspec-emergencyLights').value = product.fullSpecs.emergencyLights || '';
    } else {
        clearFullSpecs();
    }

    showSection('add');
};

// Сброс формы
function resetForm() {
    document.getElementById('form-title').innerText = 'Добавить товар';
    document.getElementById('edit-id').value = '';
    document.getElementById('product-form').reset();
    clearSpecs();
    clearFullSpecs();

    // Сброс изображений
    const imagesContainer = document.getElementById('images-container');
    imagesContainer.innerHTML = '';
    addImageField();
}

function clearSpecs() {
    document.getElementById('spec-motor').value = '';
    document.getElementById('spec-speed').value = '';
    document.getElementById('spec-battery').value = '';
    document.getElementById('spec-range').value = '';
}

// Управление изображениями
function addImageField(value = '', isBase64 = false) {
    const container = document.getElementById('images-container');
    const index = container.children.length;
    const div = document.createElement('div');
    div.className = 'flex gap-2 items-center';

    // Определяем, это base64 или URL
    const imageSrc = isBase64 ? value : value;
    const displayValue = isBase64 ? '[Загружено из галереи]' : value;

    div.innerHTML = `
        <input type="${isBase64 ? 'hidden' : 'url'}" class="flex-1 border border-gray-300 rounded-md p-2 image-input" 
               placeholder="https://..." value="${displayValue}" 
               ${isBase64 ? 'data-base64="' + value + '"' : ''}
               onchange="updateImagePreview(this)">
        <button type="button" onclick="removeImageField(this)" class="text-red-600 hover:text-red-800 px-2">
            ✕
        </button>
        <div class="image-preview w-16 h-16 border border-gray-300 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
            ${imageSrc ? `<img src="${imageSrc}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<span class=\\'text-xs text-gray-400\\'>Нет фото</span>'">` : '<span class="text-xs text-gray-400">Нет фото</span>'}
        </div>
    `;
    container.appendChild(div);
}
window.addImageField = addImageField;

// Обработка загрузки файлов из галереи
function handleFileUpload(event) {
    const files = event.target.files;
    if (files.length === 0) return;

    // Предупреждение о размере
    const maxSize = 2 * 1024 * 1024; // 2MB на файл
    const oversizedFiles = Array.from(files).filter(f => f.size > maxSize);
    if (oversizedFiles.length > 0) {
        const names = oversizedFiles.map(f => f.name).join(', ');
        if (!confirm(`Внимание! Файлы ${names} больше 2MB. Рекомендуется сжать изображения перед загрузкой.\n\nПродолжить загрузку? (Файл products.js может стать очень большим)`)) {
            event.target.value = '';
            return;
        }
    }

    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
            alert(`Файл ${file.name} не является изображением!`);
            return;
        }

        // Показываем индикатор загрузки
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'flex gap-2 items-center p-2 bg-blue-50 rounded';
        loadingDiv.innerHTML = `
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span class="text-sm text-gray-600">Обработка ${file.name}...</span>
        `;
        const container = document.getElementById('images-container');
        container.appendChild(loadingDiv);

        const reader = new FileReader();
        reader.onload = function (e) {
            const base64 = e.target.result;

            // Оптимизация: сжимаем изображение если оно слишком большое
            compressImage(base64, file.name).then(optimizedBase64 => {
                loadingDiv.remove();
                // Добавляем изображение как base64
                addImageField(optimizedBase64, true);

                // Показываем размер
                const sizeKB = Math.round(optimizedBase64.length / 1024);
                if (sizeKB > 500) {
                    console.warn(`Изображение ${file.name} занимает ${sizeKB}KB после оптимизации`);
                }
            });
        };
        reader.onerror = function () {
            loadingDiv.remove();
            alert(`Ошибка при чтении файла ${file.name}`);
        };
        reader.readAsDataURL(file);
    });

    // Очищаем input, чтобы можно было выбрать те же файлы снова
    event.target.value = '';
}
window.handleFileUpload = handleFileUpload;

// Сжатие изображения (улучшенное качество)
function compressImage(base64, filename, maxWidth = 4000, quality = 0.98) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Определяем формат изображения по расширению файла
            const isPng = filename.toLowerCase().endsWith('.png') || base64.startsWith('data:image/png');
            const format = isPng ? 'image/png' : 'image/jpeg';

            // Уменьшаем размер только если действительно очень большой
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');

            // Улучшаем качество рендеринга
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            ctx.drawImage(img, 0, 0, width, height);

            // Конвертируем обратно в base64 с максимальным качеством
            const compressedBase64 = format === 'image/png'
                ? canvas.toDataURL('image/png') // PNG без сжатия
                : canvas.toDataURL('image/jpeg', quality); // JPEG с высоким качеством
            resolve(compressedBase64);
        };
        img.onerror = function () {
            // Если не удалось обработать, возвращаем оригинал
            resolve(base64);
        };
        img.src = base64;
    });
}

function removeImageField(button) {
    const container = document.getElementById('images-container');
    if (container.children.length > 1) {
        button.closest('div').remove();
    } else {
        alert('Должно быть хотя бы одно изображение!');
    }
}
window.removeImageField = removeImageField;

function updateImagePreview(input) {
    const preview = input.nextElementSibling.nextElementSibling;
    const url = input.value;
    if (url) {
        preview.innerHTML = `<img src="${url}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<span class=\\'text-xs text-red-400\\'>Ошибка</span>'">`;
    } else {
        preview.innerHTML = '<span class="text-xs text-gray-400">Нет фото</span>';
    }
}
window.updateImagePreview = updateImagePreview;

function getAllImages() {
    const inputs = document.querySelectorAll('#images-container .image-input');
    const images = Array.from(inputs)
        .map(input => {
            // Если это base64 изображение
            if (input.dataset.base64) {
                return input.dataset.base64;
            }
            // Иначе это URL
            return input.value.trim();
        })
        .filter(img => img.length > 0);
    return images;
}

function clearFullSpecs() {
    document.getElementById('fullspec-battery').value = '';
    document.getElementById('fullspec-motor').value = '';
    document.getElementById('fullspec-peakPower').value = '';
    document.getElementById('fullspec-speed').value = '';
    document.getElementById('fullspec-range').value = '';
    document.getElementById('fullspec-brakes').value = '';
    document.getElementById('fullspec-wheels').value = '';
    document.getElementById('fullspec-suspension').value = '';
    document.getElementById('fullspec-maxLoad').value = '';
    document.getElementById('fullspec-chargeTime').value = '';
    document.getElementById('fullspec-steeringDamper').value = '';
    document.getElementById('fullspec-alarm').value = '';
    document.getElementById('fullspec-gps').value = '';
    document.getElementById('fullspec-display').value = '';
    document.getElementById('fullspec-lighting').value = '';
    document.getElementById('fullspec-turnSignals').value = '';
    document.getElementById('fullspec-emergencyLights').value = '';
}

function getFullSpecs() {
    const fullSpecs = {};

    const battery = document.getElementById('fullspec-battery').value.trim();
    const motor = document.getElementById('fullspec-motor').value.trim();
    const peakPower = document.getElementById('fullspec-peakPower').value.trim();
    const speed = document.getElementById('fullspec-speed').value.trim();
    const range = document.getElementById('fullspec-range').value.trim();
    const brakes = document.getElementById('fullspec-brakes').value.trim();
    const wheels = document.getElementById('fullspec-wheels').value.trim();
    const suspension = document.getElementById('fullspec-suspension').value.trim();
    const maxLoad = document.getElementById('fullspec-maxLoad').value.trim();
    const chargeTime = document.getElementById('fullspec-chargeTime').value.trim();
    const steeringDamper = document.getElementById('fullspec-steeringDamper').value.trim();
    const alarm = document.getElementById('fullspec-alarm').value.trim();
    const gps = document.getElementById('fullspec-gps').value.trim();
    const display = document.getElementById('fullspec-display').value.trim();
    const lighting = document.getElementById('fullspec-lighting').value.trim();
    const turnSignals = document.getElementById('fullspec-turnSignals').value.trim();
    const emergencyLights = document.getElementById('fullspec-emergencyLights').value.trim();

    if (battery) fullSpecs.battery = battery;
    if (motor) fullSpecs.motor = motor;
    if (peakPower) fullSpecs.peakPower = peakPower;
    if (speed) fullSpecs.speed = speed;
    if (range) fullSpecs.range = range;
    if (brakes) fullSpecs.brakes = brakes;
    if (wheels) fullSpecs.wheels = wheels;
    if (suspension) fullSpecs.suspension = suspension;
    if (maxLoad) fullSpecs.maxLoad = maxLoad;
    if (chargeTime) fullSpecs.chargeTime = chargeTime;
    if (steeringDamper) fullSpecs.steeringDamper = steeringDamper;
    if (alarm) fullSpecs.alarm = alarm;
    if (gps) fullSpecs.gps = gps;
    if (display) fullSpecs.display = display;
    if (lighting) fullSpecs.lighting = lighting;
    if (turnSignals) fullSpecs.turnSignals = turnSignals;
    if (emergencyLights) fullSpecs.emergencyLights = emergencyLights;

    return Object.keys(fullSpecs).length > 0 ? fullSpecs : null;
}

// Сохранение формы
document.getElementById('product-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const id = document.getElementById('edit-id').value;
    const title = document.getElementById('inp-title').value;
    const category = document.getElementById('inp-category').value;
    const brand = document.getElementById('inp-brand').value;
    const price = parseInt(document.getElementById('inp-price').value);
    const oldPrice = document.getElementById('inp-oldPrice').value ? parseInt(document.getElementById('inp-oldPrice').value) : null;
    const video = document.getElementById('inp-video').value;
    const description = document.getElementById('inp-description').value;

    // Получаем все изображения
    const images = getAllImages();
    if (images.length === 0) {
        alert('Добавьте хотя бы одно изображение!');
        return;
    }
    const image = images[0]; // Первое изображение - основное

    // Основные характеристики для карточки
    const detailedSpecs = {
        motor: document.getElementById('spec-motor').value.trim(),
        speed: document.getElementById('spec-speed').value.trim(),
        battery: document.getElementById('spec-battery').value.trim(),
        range: document.getElementById('spec-range').value.trim()
    };

    // Полные характеристики для таблицы
    const fullSpecs = getFullSpecs();

    if (id) {
        // Редактирование
        const product = products.find(p => p.id == id);
        if (product) {
            product.title = title;
            product.category = category;
            product.brand = brand;
            product.price = price;
            product.oldPrice = oldPrice;
            product.image = image;
            product.images = images;
            product.video = video || undefined;
            product.description = description;
            product.detailedSpecs = detailedSpecs;
            if (fullSpecs) {
                product.fullSpecs = fullSpecs;
            } else {
                delete product.fullSpecs;
            }
        }
    } else {
        // Новый товар
        const newProduct = {
            id: Date.now(), // Генерируем уникальный ID
            title,
            category,
            brand: brand || undefined,
            price,
            oldPrice: oldPrice || undefined,
            image,
            images,
            video: video || undefined,
            description: description || undefined,
            detailedSpecs,
            rating: 0,
            reviews: 0,
            isNew: true,
            inStock: true
        };
        if (fullSpecs) {
            newProduct.fullSpecs = fullSpecs;
        }
        products.push(newProduct);
    }

    alert('Товар сохранен в памяти! Не забудьте нажать "Сохранить изменения" в меню слева.');
    showSection('list');
});

// Скачивание файлов
window.downloadData = function () {
    // 1. products.js
    const productsData = "const products = " + JSON.stringify(products, null, 4) + ";";
    downloadFile(productsData, "products.js");

    // 2. banners.js
    if (typeof banners !== 'undefined') {
        const bannersData = "const banners = " + JSON.stringify(banners, null, 4) + ";";
        setTimeout(() => {
            downloadFile(bannersData, "banners.js");
        }, 500);
    }
};

function downloadFile(content, filename) {
    const blob = new Blob([content], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

// Управление баннерами
window.handleBannerUpload = function (event, type) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const base64 = e.target.result;
        compressImage(base64, file.name).then(optimizedBase64 => {
            updateBannerPreview(type, optimizedBase64);
            document.getElementById(`url-${type}`).value = ''; // Очищаем поле URL
        });
    };
    reader.readAsDataURL(file);
};

window.updateBannerPreview = function (type, src) {
    const preview = document.getElementById(`preview-${type}`);
    if (src) {
        preview.innerHTML = `<img src="${src}" class="w-full h-full object-cover">`;
        preview.dataset.src = src;
    } else {
        preview.innerHTML = '<span class="text-xs text-gray-400">Нет фото</span>';
        delete preview.dataset.src;
    }
};

window.saveBannersToMemory = function () {
    const mainBanner = document.getElementById('preview-mainBanner').dataset.src || document.getElementById('url-mainBanner').value.trim();
    const promoBanner = document.getElementById('preview-promoBanner').dataset.src || document.getElementById('url-promoBanner').value.trim();

    if (!mainBanner || !promoBanner) {
        alert('Заполните оба баннера!');
        return;
    }

    if (typeof banners !== 'undefined') {
        banners.mainBanner = mainBanner;
        banners.promoBanner = promoBanner;
    }

    alert('Настройки баннеров сохранены в памяти! Не забудьте нажать "Сохранить изменения" слева для скачивания файла.');
};

// Хелпер
function getCategoryName(cat) {
    const map = {
        'electro_scooters': 'Электросамокаты',
        'electro_bikes': 'Электровелосипеды',
        'bicycles': 'Велосипеды',
        'kids': 'Детские',
        'road': 'Шоссейные',
        'mountain': 'Горные',
        'accessories': 'Аксессуары'
    };
    return map[cat] || cat;
}
