# 📋 ContactFormLibrary - Библиотека контактной формы

Библиотека для создания современных анимированных контактных форм с валидацией, отправкой данных на сервер и интеграцией с CRM системами.

## 📦 Установка

### Вариант 1: Подключение через CDN (скоро)
```html
<script src="https://cdn.jsdelivr.net/npm/contact-form-library@latest/dist/contact-form.min.js"></script>
```

### Вариант 2: Локальное подключение
```html
<!DOCTYPE html>
<html>
<head>
    <script src="contact-form.js"></script>
</head>
<body>
    <!-- Ваш контент -->
    <script>
        const form = new ContactFormLibrary({/* настройки */});
        form.init();
    </script>
</body>
</html>
```

## 🚀 Быстрый старт

### Минимальная настройка
```javascript
const contactForm = new ContactFormLibrary({
    apiEndpoint: 'https://ваш-сервер.com/api/contact'
});

contactForm.init();
```

### Базовая настройка с валидацией
```javascript
const contactForm = new ContactFormLibrary({
    apiEndpoint: 'https://ваш-сервер.com/api/contact',
    apiHeaders: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-token'
    },
    validatePhone: true,
    validateEmail: true,
    debug: true
});

contactForm.init();
```

## ⚙️ Настройки

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| **`apiEndpoint`** | `string` | `null` | URL для отправки данных |
| **`apiMethod`** | `string` | `'POST'` | HTTP метод |
| **`apiHeaders`** | `object` | `{'Content-Type': 'application/json'}` | Заголовки запроса |
| **`validatePhone`** | `boolean` | `false` | Валидация телефона |
| **`validateEmail`** | `boolean` | `true` | Валидация email |
| **`theme`** | `string` | `'light'` | Тема: `'light'` или `'dark'` |
| **`animation`** | `boolean` | `true` | Анимации формы |
| **`autoShow`** | `boolean` | `true` | Автопоказ формы |
| **`autoSaveToLocal`** | `boolean` | `true` | Сохранение в localStorage |
| **`debug`** | `boolean` | `false` | Режим отладки |
| **`formKey`** | `string` | `'user_contact_data'` | Ключ для хранения данных |
| **`userId`** | `number` | `1` | ID пользователя |
| **`extraData`** | `object` | `{}` | Дополнительные данные |

## 📤 Отправляемые данные

При отправке формы на сервер отправляется JSON:

```json
{
    "name": "Иван Петров",
    "phone": "+7 (999) 123-45-67",
    "email": "ivan@example.com",
    "contact_methods": ["email", "phone"],
    "privacyAgreement": true,
    "submitted_at": "2024-12-17T10:30:00.000Z",
    "user_id": 1,
    "theme": "light",
    "page_url": "https://ваш-сайт.com",
    "user_agent": "Mozilla/5.0...",
    "_metadata": {
        "source": "contact-form-library",
        "version": "1.0.0",
        "formKey": "user_contact_data"
    }
}
```

## 🔌 Колбэки (обратные вызовы)

```javascript
const contactForm = new ContactFormLibrary({
    apiEndpoint: 'https://ваш-сервер.com/api/contact',
    
    // Перед отправкой
    onBeforeSend: function(data) {
        console.log('Данные перед отправкой:', data);
        // Модифицируем данные если нужно
        data.phone = data.phone.replace(/\D/g, '');
        return data;
    },
    
    // При успешной отправке
    onSuccess: function(response, data) {
        console.log('Успешный ответ:', response);
        console.log('Отправленные данные:', data);
        // Интеграция с аналитикой, CRM и т.д.
    },
    
    // При ошибке
    onError: function(error, data) {
        console.error('Ошибка:', error);
        console.log('Данные при ошибке:', data);
        // Отправка ошибок в систему мониторинга
    },
    
    // После завершения (всегда)
    onComplete: function() {
        console.log('Запрос завершен');
    }
});
```

## 📱 Методы API

### Основные методы
```javascript
// Показать форму
contactForm.show();

// Скрыть форму
contactForm.hide();

// Принудительно показать
contactForm.forceShow();

// Получить статус формы
const status = await contactForm.getStatus();
console.log(status); // {completed: true, data: {...}, shown: true}

// Получить сохраненные данные
const savedData = await contactForm.getSavedData();

// Очистить данные
contactForm.clearData();

// Изменить тему
contactForm.setTheme('dark'); // или 'light'

// Обновить конфигурацию
contactForm.updateConfig({theme: 'dark', debug: true});
```

### Утилиты
```javascript
// Тестирование соединения с сервером
const connection = await contactForm.testConnection();
console.log(connection); // {connected: true, status: 200}

// Экспорт данных
const jsonData = contactForm.exportData('json'); // 'json', 'csv', 'xml'
const csvData = contactForm.exportData('csv');
const xmlData = contactForm.exportData('xml');
```

## 🛠 Интеграция с сервером

### Пример PHP сервера
```php
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

// Получаем email (библиотека отправляет как 'email')
$email = $data['email'] ?? null;

if (empty($data['name']) || empty($email)) {
    http_response_code(400);
    echo json_encode(["error" => "Недостаточно данных"]);
    exit;
}

// Сохранение в базу данных
// $db->saveLead($data);

http_response_code(200);
echo json_encode([
    "success" => true,
    "message" => "Данные получены",
    "server_time" => date('Y-m-d H:i:s')
]);
?>
```

### Пример Node.js сервера
```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/contact', (req, res) => {
    const formData = req.body;
    
    // 1. Сохранить в БД
    // 2. Создать сделку в CRM
    // 3. Отправить уведомление
    
    res.json({
        success: true,
        message: 'Данные получены',
        received_at: new Date().toISOString()
    });
});

app.listen(3000);
```

## 🔗 Интеграция с CRM

### Битрикс24
```javascript
// В колбэке onSuccess или отдельно
async function createBitrixDeal(formData) {
    const bitrixUrl = 'https://ваш-портал.bitrix24.ru/rest/1/ваш-код/';
    
    const dealData = {
        fields: {
            TITLE: `Заявка от ${formData.name}`,
            NAME: formData.name,
            PHONE: [{ VALUE: formData.phone }],
            EMAIL: [{ VALUE: formData.email }],
            COMMENTS: `Страница: ${formData.page_url}`,
            SOURCE_ID: 'WEB'
        }
    };
    
    const response = await fetch(bitrixUrl + 'crm.deal.add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(dealData)
    });
    
    return await response.json();
}
```

## 📱 События

Библиотека генерирует кастомные события:

```javascript
// Подписка на события
window.addEventListener('contactForm:formSaved', (event) => {
    console.log('Форма сохранена:', event.detail);
});

window.addEventListener('contactForm:serverResponse', (event) => {
    console.log('Ответ сервера:', event.detail);
});

window.addEventListener('contactForm:dataCleared', () => {
    console.log('Данные очищены');
});
```

## 🎨 Кастомизация

### Изменение темы
```javascript
const contactForm = new ContactFormLibrary({
    theme: 'dark' // 'light' или 'dark'
});

// Или динамически
contactForm.setTheme('dark');
```

### Добавление дополнительных данных
```javascript
const contactForm = new ContactFormLibrary({
    extraData: {
        source: 'landing-page',
        campaign: 'promo-2024',
        utm_source: 'google',
        product_id: 123
    }
});
```

## 🐛 Отладка

```javascript
const contactForm = new ContactFormLibrary({
    debug: true, // Включить логи в консоль
    apiEndpoint: 'https://ваш-сервер.com/api/contact'
});

// Все действия будут логироваться
// [ContactForm] Инициализация библиотеки...
// [ContactForm] Данные отправлены: {...}
// [ContactForm] Ответ сервера: {...}
```

## ⚠️ Обработка ошибок

Библиотека автоматически обрабатывает:
- ❌ Потерю интернет-соединения
- ⏱️ Таймауты запросов
- 📱 Офлайн режим (данные сохраняются и отправляются позже)
- ✅ Валидацию полей формы

---

## 🚀 Пример полной интеграции

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Мой сайт</title>
    <script src="contact-form.js"></script>
</head>
<body>
    <h1>Добро пожаловать!</h1>
    
    <script>
        // Инициализация формы
        const contactForm = new ContactFormLibrary({
            apiEndpoint: 'https://мой-сервер.com/api/leads',
            theme: 'light',
            validatePhone: true,
            validateEmail: true,
            extraData: {
                source: 'main-website',
                campaign: 'default'
            },
            onSuccess: function(response) {
                alert('Спасибо! Мы скоро свяжемся с вами.');
                // Интеграция с Яндекс.Метрикой
                if (window.ym) {
                    ym(123456, 'reachGoal', 'form_submit');
                }
            }
        });
        
        // Автоматическая инициализация
        contactForm.init();
        
        // Показать форму через 5 секунд
        setTimeout(() => {
            contactForm.forceShow();
        }, 5000);
    </script>
</body>
</html>
```