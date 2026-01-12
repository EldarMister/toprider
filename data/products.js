const products = [
    {
        "id": 4,
        "title": "Электросамокат Kugoo M4 Pro",
        "category": "electro_scooters",
        "price": 35000,
        "oldPrice": 42000,
        "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGT55pkYMjzqshVFvtMw7cgQPTPcpVm6lOAQ&s",
        "images": [
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGT55pkYMjzqshVFvtMw7cgQPTPcpVm6lOAQ&s"
        ],
        "rating": 4.5,
        "reviews": 12,
        "isNew": true,
        "inStock": true,
        "discount": 17,
        "brand": "Kugoo",
        "description": "Популярный электросамокат для города.",
        "detailedSpecs": {
            "motor": "600W",
            "speed": "45КМ/ЧАС",
            "battery": "18AH",
            "range": "45КМ"
        }
    },
    {
        "id": 1768185706086,
        "title": "Samebike RS-A08",
        "category": "electro_bikes",
        "price": 30000,
        "image": "https://velo.kg/wp-content/uploads/2025/11/1-5.png",
        "images": [
            "https://velo.kg/wp-content/uploads/2025/11/1-5.png",
            "https://velo.kg/wp-content/uploads/2025/11/2-5.png",
            "https://velo.kg/wp-content/uploads/2025/11/4-5.png"
        ],
        "description": "🚵‍♂️ Samebike RS-A08 — 1000W Мощный Электровелосипед ⚡🔥\n\nSamebike RS-A08 — это мощный внедорожный электровел с настоящим характером.\nС мотором 1000W он тянет любые подъёмы и легко держит высокую скорость 💨💪",
        "detailedSpecs": {
            "motor": "",
            "speed": "",
            "battery": "",
            "range": ""
        },
        "rating": 0,
        "reviews": 0,
        "isNew": true,
        "inStock": true
    },
    {
        "id": 1768185796705,
        "title": "DUOTS  OneSport OT-08 (1000W)",
        "category": "electro_bikes",
        "brand": "DEMO",
        "price": 30000,
        "oldPrice": 40000,
        "image": "https://velo.kg/wp-content/uploads/2025/11/1-2.png",
        "images": [
            "https://velo.kg/wp-content/uploads/2025/11/1-2.png",
            "https://velo.kg/wp-content/uploads/2025/11/2-2.png"
        ],
        "description": "Электровелосипед Duotts OneSport OT-08",
        "detailedSpecs": {
            "motor": "",
            "speed": "",
            "battery": "",
            "range": ""
        },
        "rating": 0,
        "reviews": 0,
        "isNew": true,
        "inStock": true
    },
    {
        "id": 1768185958037,
        "title": "Gestalt Phantom 29″ 1×10 ",
        "category": "electro_bikes",
        "brand": "DEMO",
        "price": 45000,
        "image": "https://velo.kg/wp-content/uploads/2025/10/gestalt-phantom1.png",
        "images": [
            "https://velo.kg/wp-content/uploads/2025/10/gestalt-phantom1.png",
            "https://velo.kg/wp-content/uploads/2025/10/gestalt-phantom2.png",
            "https://velo.kg/wp-content/uploads/2025/10/gestalt-phantom3-3.png"
        ],
        "description": "Gestalt Phantom — это идеальный выбор для любителей бездорожья и активных поездок. Современная геометрия, качественные компоненты и агрессивный стиль делают его настоящим партнёром в любых условиях — от лесных троп до городских улиц.",
        "detailedSpecs": {
            "motor": "",
            "speed": "",
            "battery": "",
            "range": ""
        },
        "rating": 0,
        "reviews": 0,
        "isNew": true,
        "inStock": true
    },
    {
        "id": 1768186053872,
        "title": " FOREVER FS 100",
        "category": "electro_bikes",
        "brand": "SOBACHINI",
        "price": 20000,
        "oldPrice": 23000,
        "image": "https://velo.kg/wp-content/uploads/2025/10/1-6.png",
        "images": [
            "https://velo.kg/wp-content/uploads/2025/10/1-6.png",
            "https://velo.kg/wp-content/uploads/2025/10/2-6.png",
            "https://velo.kg/wp-content/uploads/2025/10/4-6.png"
        ],
        "description": "Шоссейный 🚲 Велосипед FOREVER FS 100\n\nИдеальный выбор для города и активных поездок!\n💪 Прочная алюминиевая рама — лёгкая, надёжная и устойчивая к нагрузкам\n⚙️ 16 скоростей — легко под любой рельеф\n🛞 Колёса 700×28 — обеспечивают лёгкий ход и отличную скорость по асфальту\n🧱 Дисковые тормоза — уверенное торможение в любую погоду\n🪶 Комфортное седло и эргономичная посадка\n✨ Современный дизайн и плавное управление",
        "detailedSpecs": {
            "motor": "",
            "speed": "",
            "battery": "",
            "range": ""
        },
        "rating": 0,
        "reviews": 0,
        "isNew": true,
        "inStock": true
    },
    {
        "id": 1768186133076,
        "title": "Gestalt Friday",
        "category": "electro_bikes",
        "brand": "Proverka",
        "price": 15000,
        "image": "https://velo.kg/wp-content/uploads/2025/10/1-3.png",
        "images": [
            "https://velo.kg/wp-content/uploads/2025/10/1-3.png",
            "https://velo.kg/wp-content/uploads/2025/10/2-2.png",
            "https://velo.kg/wp-content/uploads/2025/10/4-2.png"
        ],
        "description": "🏋️‍♂️ Вес: всего 13 кг — очень лёгкий для MTB/гибридов!\n🛞 Колёса: 26″ — отлично для манёвренности в городе и на просёлках\n🧱 Рама: алюминиевая — лёгкая, прочная и не ржавеет\n🛑 Тормоза: гидравлические дисковые — мощные и надёжные, работают даже в дождь\n⚙️ Скорости: передачи 9скоростей ,переключатели — LTWOO или Shimano (в",
        "detailedSpecs": {
            "motor": "",
            "speed": "",
            "battery": "",
            "range": ""
        },
        "rating": 0,
        "reviews": 0,
        "isNew": true,
        "inStock": true
    }
];