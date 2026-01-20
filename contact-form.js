class ContactFormLibrary {
    constructor(options = {}) {
        this.config = {
            formKey: 'user_contact_data',
            userId: 1,
            autoShow: true,
            debug: false,
            theme: 'light',
            animation: true,
            autoFillUser: options.autoFillUser || false,
            // Новые параметры для отправки на сервер
            apiEndpoint: options.apiEndpoint || null,
            apiMethod: options.apiMethod || 'POST',
            apiHeaders: options.apiHeaders || {
                'Content-Type': 'application/json',
            },
            apiCredentials: options.apiCredentials || 'same-origin',
            // Колбэки для обработки событий
            onBeforeSend: options.onBeforeSend || null,
            onSuccess: options.onSuccess || null,
            onError: options.onError || null,
            onComplete: options.onComplete || null,
            // Валидация
            validatePhone: options.validatePhone || true, // Включаем валидацию телефона по умолчанию
            validateEmail: options.validateEmail || true,
            // Дополнительные данные
            extraData: options.extraData || {},
            // Автосохранение в localStorage
            autoSaveToLocal: options.autoSaveToLocal !== false,
            // Таймаут запроса
            requestTimeout: options.requestTimeout || 30000,
            ...options
        };

        this.initialized = false;
        this.formShown = false;
        this.isSubmitting = false;
        this.offlineMode = false;
    }

    async init() {
        if (this.initialized) return this;

        this.log('Инициализация библиотеки...');
        this.createFormHTML();

        if (document.readyState !== 'loading') {
            await this.setupForm();
        } else {
            document.addEventListener('DOMContentLoaded', () => this.setupForm());
        }

        this.initialized = true;
        this.log('Библиотека инициализирована');
        return this;
    }

    log(...args) {
        if (this.config.debug) {
            console.log('[ContactForm]', ...args);
        }
    }

    createFormHTML() {
        const isDark = this.config.theme === 'dark';
        const bgColor = isDark ? '#1a1a2e' : 'white';
        const textColor = isDark ? '#ffffff' : '#333333';
        const borderColor = isDark ? '#2d3748' : '#e0e0e0';
        const cardBg = isDark ? '#16213e' : 'white';

        const formHTML = `
            <div id="contactFormOverlay" class="contact-form-overlay" style="display: none;">
                <div class="contact-form-container">
                    <div class="contact-form-header">
                        <div class="header-icon">📞</div>
                        <div class="header-content">
                            <h3>Регистрация пользователя на получение технической поддержки</h3>
                            <p>После регистрации вы сможете обращаться за консультациями, получать помощь по настройке и эксплуатации приложения</p>
                        </div>
                        <button class="close-form">&times;</button>
                    </div>
                    
                    <form id="contactForm">
                        <div class="form-group">
                            <label for="userName" class="form-label">
                                <span class="label-icon">👤</span>
                                <span>Имя:</span>
                            </label>
                            <div class="input-wrapper">
                                <input type="text" id="userName" placeholder="Введите ваше имя" required>
                                <div class="input-border"></div>
                                <div class="error-message"></div>
                            </div>
                        </div>
                        
                        <!-- Поле телефона с маской -->
                        <div class="form-group">
                            <label for="userPhone" class="form-label">
                                <span class="label-icon">📱</span>
                                <span>Телефон:</span>
                            </label>
                            <div class="input-wrapper">
                                <input type="tel" id="userPhone" placeholder="+7 (___) ___-__-__" required maxlength="18">
                                <div class="input-border"></div>
                                <div class="error-message phone-error-message"></div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="userEmail" class="form-label">
                                <span class="label-icon">✉️</span>
                                <span>Email:</span>
                            </label>
                            <div class="input-wrapper">
                                <input type="email" id="userEmail" placeholder="example@domain.com" required>
                                <div class="input-border"></div>
                                <div class="error-message"></div>
                            </div>
                        </div>
                        
                        <!-- Поле "Роль в компании" -->
                        <div class="form-group">
                            <label for="userRole" class="form-label">
                                <span class="label-icon">👔</span>
                                <span>Роль в компании:</span>
                            </label>
                            <div class="input-wrapper">
                                <select id="userRole" required>
                                    <option value="" disabled selected>Выберите вашу роль</option>
                                    <option value="integrator">Интегратор</option>
                                    <option value="owner">Собственник</option>
                                    <option value="manager">Руководитель</option>
                                    <option value="employee">Сотрудник</option>
                                </select>
                                <div class="input-border"></div>
                                <div class="error-message"></div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">
                                <span class="label-icon">💬</span>
                                <span>Удобный способ связи:</span>
                            </label>
                            <div class="contact-methods">
                                <label class="contact-method">
                                    <input type="checkbox" name="contact_method" value="email" checked>
                                    <div class="method-content">
                                        <span class="method-icon">📧</span>
                                        <span class="method-text">Email</span>
                                    </div>
                                </label>
                                <label class="contact-method">
                                    <input type="checkbox" name="contact_method" value="phone" checked>
                                    <div class="method-content">
                                        <span class="method-icon">📞</span>
                                        <span class="method-text">Телефон</span>
                                    </div>
                                </label>
                                <label class="contact-method">
                                    <input type="checkbox" name="contact_method" value="whatsapp">
                                    <div class="method-content">
                                        <span class="method-icon">
<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="32" height="32" viewBox="0 0 48 48">
<path fill="#fff" d="M4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5c5.1,0,9.8,2,13.4,5.6	C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19c0,0,0,0,0,0h0c-3.2,0-6.3-0.8-9.1-2.3L4.9,43.3z"></path><path fill="#fff" d="M4.9,43.8c-0.1,0-0.3-0.1-0.4-0.1c-0.1-0.1-0.2-0.3-0.1-0.5L7,33.5c-1.6-2.9-2.5-6.2-2.5-9.6	C4.5,13.2,13.3,4.5,24,4.5c5.2,0,10.1,2,13.8,5.7c3.7,3.7,5.7,8.6,5.7,13.8c0,10.7-8.7,19.5-19.5,19.5c-3.2,0-6.3-0.8-9.1-2.3	L5,43.8C5,43.8,4.9,43.8,4.9,43.8z"></path><path fill="#cfd8dc" d="M24,5c5.1,0,9.8,2,13.4,5.6C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19h0c-3.2,0-6.3-0.8-9.1-2.3	L4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5 M24,43L24,43L24,43 M24,43L24,43L24,43 M24,4L24,4C13,4,4,13,4,24	c0,3.4,0.8,6.7,2.5,9.6L3.9,43c-0.1,0.3,0,0.7,0.3,1c0.2,0.2,0.4,0.3,0.7,0.3c0.1,0,0.2,0,0.3,0l9.7-2.5c2.8,1.5,6,2.2,9.2,2.2	c11,0,20-9,20-20c0-5.3-2.1-10.4-5.8-14.1C34.4,6.1,29.4,4,24,4L24,4z"></path><path fill="#40c351" d="M35.2,12.8c-3-3-6.9-4.6-11.2-4.6C15.3,8.2,8.2,15.3,8.2,24c0,3,0.8,5.9,2.4,8.4L11,33l-1.6,5.8	l6-1.6l0.6,0.3c2.4,1.4,5.2,2.2,8,2.2h0c8.7,0,15.8-7.1,15.8-15.8C39.8,19.8,38.2,15.8,35.2,12.8z"></path><path fill="#fff" fill-rule="evenodd" d="M19.3,16c-0.4-0.8-0.7-0.8-1.1-0.8c-0.3,0-0.6,0-0.9,0	s-0.8,0.1-1.3,0.6c-0.4,0.5-1.7,1.6-1.7,4s1.7,4.6,1.9,4.9s3.3,5.3,8.1,7.2c4,1.6,4.8,1.3,5.7,1.2c0.9-0.1,2.8-1.1,3.2-2.3	c0.4-1.1,0.4-2.1,0.3-2.3c-0.1-0.2-0.4-0.3-0.9-0.6s-2.8-1.4-3.2-1.5c-0.4-0.2-0.8-0.2-1.1,0.2c-0.3,0.5-1.2,1.5-1.5,1.9	c-0.3,0.3-0.6,0.4-1,0.1c-0.5-0.2-2-0.7-3.8-2.4c-1.4-1.3-2.4-2.8-2.6-3.3c-0.3-0.5,0-0.7,0.2-1c0.2-0.2,0.5-0.6,0.7-0.8	c0.2-0.3,0.3-0.5,0.5-0.8c0.2-0.3,0.1-0.6,0-0.8C20.6,19.3,19.7,17,19.3,16z" clip-rule="evenodd"></path>
</svg>
                                        </span>
                                        <span class="method-text">WhatsApp</span>
                                    </div>
                                </label>
                                <label class="contact-method">
                                    <input type="checkbox" name="contact_method" value="telegram">
                                    <div class="method-content">
                                        <span class="method-icon">
<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="32" height="32" viewBox="0 0 48 48">
<path fill="#29b6f6" d="M24 4A20 20 0 1 0 24 44A20 20 0 1 0 24 4Z"></path><path fill="#fff" d="M33.95,15l-3.746,19.126c0,0-0.161,0.874-1.245,0.874c-0.576,0-0.873-0.274-0.873-0.274l-8.114-6.733 l-3.97-2.001l-5.095-1.355c0,0-0.907-0.262-0.907-1.012c0-0.625,0.933-0.923,0.933-0.923l21.316-8.468 c-0.001-0.001,0.651-0.235,1.126-0.234C33.667,14,34,14.125,34,14.5C34,14.75,33.95,15,33.95,15z"></path><path fill="#b0bec5" d="M23,30.505l-3.426,3.374c0,0-0.149,0.115-0.348,0.12c-0.069,0.002-0.143-0.009-0.219-0.043 l0.964-5.965L23,30.505z"></path><path fill="#cfd8dc" d="M29.897,18.196c-0.169-0.22-0.481-0.26-0.701-0.093L16,26c0,0,2.106,5.892,2.427,6.912 c0.322,1.021,0.58,1.045,0.58,1.045l0.964-5.965l9.832-9.096C30.023,18.729,30.064,18.416,29.897,18.196z"></path>
</svg>
                                        </span>
                                        <span class="method-text">Telegram</span>
                                    </div>
                                </label>
                                <label class="contact-method">
                                    <input type="checkbox" name="contact_method" value="max-messenger">
                                    <div class="method-content">
                                        <span class="method-icon">
                                        <img src="https://logo-teka.com/wp-content/uploads/2025/07/max-messenger-sign-logo.png" alt="Max Messenger" style="width:32px; height:32px;">
                                        </span>
                                        <span class="method-text">MAX</span>
                                    </div>
                                </label>
                            </div>
                            <div class="error-message contact-methods-error"></div>
                        </div>
                        
                        <!-- Соглашение на обработку данных и рассылки -->
                        <div class="form-footer">
                            <div class="privacy-notice">
                                <input type="checkbox" id="privacyAgreement" required>
                                <label for="privacyAgreement">
                                    Я согласен на обработку персональных данных в соответствии с <a href="https://app.lead-space.ru/privacy.html?app_code=leadspace.robot_find_file&app_name=Сохранение файла из результата задачи в элемент CRM" target="_blank">Политикой конфиденциальности</a>
                                </label>
                                <div class="error-message"></div>
                            </div>
                            
                            <div class="privacy-notice" style="margin-top: 10px;">
                                <input type="checkbox" id="marketingAgreement">
                                <label for="marketingAgreement">
                                    Согласен(на) на получение рекламных и информационных рассылок в соответствии с <a href="https://app.lead-space.ru/reklama.html" target="_blank">Политикой рассылки</a>
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="cancel-form">
                                <span class="btn-icon">←</span>
                                <span class="btn-text">Отмена</span>
                            </button>
                            <button type="submit" class="submit-form">
                                <span class="btn-text">Отправить</span>
                                <span class="btn-icon">→</span>
                            </button>
                        </div>
                        
                        <div class="form-status">
                            <div class="offline-indicator" style="display: none;">
                                <span class="offline-icon">📶</span>
                                <span class="offline-text">Работаем в офлайн-режиме</span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <style>
                /* Анимации */
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                @keyframes slideDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                /* Основные стили */
                .contact-form-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(5px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    animation: fadeIn 0.3s ease-out;
                }
                
                .contact-form-container {
                    background: linear-gradient(145deg, ${cardBg}, ${isDark ? '#0f3460' : '#f8f9fa'});
                    border-radius: 20px;
                    padding: 40px;
                    width: 90%;
                    max-width: 600px;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
                    border: 1px solid ${borderColor};
                    animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    transform-origin: center;
                    max-height: 900px;
                    overflow-y: auto;
                }
                
                /* Шапка формы */
                .contact-form-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 15px;
                    margin-bottom: 30px;
                    position: relative;
                }
                
                .header-icon {
                    font-size: 36px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .header-content h3 {
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0 0 5px 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .header-content p {
                    font-size: 14px;
                    color: ${isDark ? '#a0aec0' : '#718096'};
                    margin: 0;
                }
                
                .close-form {
                    position: absolute;
                    top: 0;
                    right: 0;
                    background: ${isDark ? '#2d3748' : '#f7fafc'};
                    border: 1px solid ${borderColor};
                    color: ${isDark ? '#a0aec0' : '#718096'};
                    font-size: 24px;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                
                .close-form:hover {
                    background: ${isDark ? '#4a5568' : '#e2e8f0'};
                    transform: rotate(90deg);
                    color: ${textColor};
                }
                
                /* Поля формы */
                .form-group {
                    margin-bottom: 25px;
                }
                
                .form-label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    color: ${textColor};
                }
                
                .label-icon {
                    font-size: 18px;
                    opacity: 0.8;
                }
                
                .input-wrapper {
                    position: relative;
                }
                
                .input-wrapper input {
                    width: 100%;
                    padding: 16px 12px;
                    background: ${isDark ? '#2d3748' : '#f7fafc'};
                    border: 2px solid ${borderColor};
                    border-radius: 12px;
                    font-size: 16px;
                    color: ${textColor};
                    transition: all 0.3s ease;
                }
                
                .input-wrapper input:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }
                
                .input-wrapper input::placeholder {
                    color: ${isDark ? '#718096' : '#a0aec0'};
                }
                
                .input-wrapper input.validation-error {
                    border-color: #f56565;
                    background-color: ${isDark ? 'rgba(245, 101, 101, 0.1)' : 'rgba(245, 101, 101, 0.05)'};
                    animation: shake 0.5s ease-in-out;
                }
                
                /* Стили для select */
                .input-wrapper select {
                    width: 100%;
                    padding: 16px 12px;
                    background: ${isDark ? '#2d3748' : '#f7fafc'};
                    border: 2px solid ${borderColor};
                    border-radius: 12px;
                    font-size: 16px;
                    color: ${textColor};
                    transition: all 0.3s ease;
                    cursor: pointer;
                    appearance: none;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
                    background-repeat: no-repeat;
                    background-position: right 12px center;
                    background-size: 16px;
                    padding-right: 40px;
                }
                
                .input-wrapper select:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }
                
                .input-wrapper select option {
                    background: ${isDark ? '#2d3748' : '#f7fafc'};
                    color: ${textColor};
                    padding: 12px;
                }
                
                .input-wrapper select.validation-error {
                    border-color: #f56565;
                    background-color: ${isDark ? 'rgba(245, 101, 101, 0.1)' : 'rgba(245, 101, 101, 0.05)'};
                }
                
                .input-border {
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 0;
                    height: 2px;
                    background: linear-gradient(90deg, #667eea, #764ba2);
                    transition: width 0.3s ease;
                }
                
                .input-wrapper input:focus ~ .input-border,
                .input-wrapper select:focus ~ .input-border {
                    width: 100%;
                }
                
                .error-message {
                    color: #f56565;
                    font-size: 12px;
                    margin-top: 5px;
                    min-height: 18px;
                    animation: fadeIn 0.3s ease;
                }
                
                .contact-methods-error {
                    margin-top: 10px;
                }
                
                /* Способы связи */
                .contact-methods {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(85px, 1fr));
                    gap: 12px;
                    margin-top: 10px;
                }
                
                .contact-method {
                    position: relative;
                    cursor: pointer;
                }
                
                .contact-method input {
                    position: absolute;
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                
                .method-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 15px 10px;
                    background: ${isDark ? '#2d3748' : '#f7fafc'};
                    border: 2px solid ${borderColor};
                    border-radius: 12px;
                    transition: all 0.3s ease;
                }
                
                .method-icon {
                    font-size: 24px;
                    transition: all 0.3s ease;
                }
                
                .method-text {
                    font-size: 12px;
                    font-weight: 500;
                    color: ${textColor};
                    transition: all 0.3s ease;
                }
                
                .contact-method:hover .method-content {
                    border-color: #667eea;
                    transform: translateY(-2px);
                }
                
                .contact-method input:checked + .method-content {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-color: transparent;
                }
                
                .contact-method input:checked + .method-content .method-text {
                    color: white;
                }
                
                /* Согласие на обработку данных */
                .form-footer {
                    margin: 25px 0;
                    padding: 15px;
                    background: ${isDark ? 'rgba(45, 55, 72, 0.3)' : 'rgba(247, 250, 252, 0.5)'};
                    border-radius: 10px;
                    border: 1px solid ${borderColor};
                }
                
                .privacy-notice {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                }
                
                .privacy-notice input {
                    margin-top: 3px;
                    min-width: 18px;
                    height: 18px;
                    cursor: pointer;
                }
                
                .privacy-notice label {
                    font-size: 14px;
                    color: ${textColor};
                    line-height: 1.4;
                    cursor: pointer;
                    flex: 1;
                }
                
                /* Кнопки */
                .form-actions {
                    display: flex;
                    gap: 15px;
                    margin-top: 30px;
                }
                
                .cancel-form, .submit-form {
                    flex: 1;
                    padding: 18px 24px;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s ease;
                    border: none;
                }
                
                .cancel-form {
                    background: ${isDark ? '#2d3748' : '#f7fafc'};
                    color: ${isDark ? '#a0aec0' : '#718096'};
                    border: 2px solid ${borderColor};
                }
                
                .cancel-form:hover {
                    background: ${isDark ? '#4a5568' : '#e2e8f0'};
                    transform: translateY(-2px);
                }
                
                .submit-form {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    position: relative;
                    overflow: hidden;
                }
                
                .submit-form::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.2),
                        transparent
                    );
                    transition: 0.5s;
                }
                
                .submit-form:hover::before {
                    left: 100%;
                }
                
                .submit-form:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
                }
                
                .submit-form:active {
                    transform: translateY(0);
                }
                
                .submit-form:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none !important;
                }
                
                .btn-icon {
                    font-size: 18px;
                    transition: transform 0.3s ease;
                }
                
                .cancel-form:hover .btn-icon {
                    transform: translateX(-3px);
                }
                
                .submit-form:hover .btn-icon {
                    transform: translateX(3px);
                }
                
                /* Статус формы */
                .form-status {
                    margin-top: 20px;
                    text-align: center;
                }
                
                .offline-indicator {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: ${isDark ? 'rgba(237, 137, 54, 0.2)' : 'rgba(237, 137, 54, 0.1)'};
                    border: 1px solid ${isDark ? '#ed8936' : '#dd6b20'};
                    border-radius: 8px;
                    color: ${isDark ? '#ed8936' : '#c05621'};
                    font-size: 14px;
                    animation: slideDown 0.3s ease;
                }
                
                .offline-icon {
                    font-size: 16px;
                }
                
                /* Анимация для отправки */
                .submit-loading {
                    position: relative;
                }
                
                .submit-loading .btn-text {
                    opacity: 0;
                }
                
                .submit-loading::after {
                    content: '';
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                /* Адаптивность */
                @media (max-width: 480px) {
                    .contact-form-container {
                        padding: 25px;
                        border-radius: 15px;
                    }
                    
                    .contact-form-header {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                        gap: 10px;
                    }
                    
                    .header-icon {
                        font-size: 32px;
                    }
                    
                    .header-content h3 {
                        font-size: 20px;
                    }
                    
                    .contact-methods {
                        grid-template-columns: repeat(3, 1fr);
                    }
                    
                    .form-actions {
                        flex-direction: column;
                    }
                    
                    .form-group {
                        margin-bottom: 20px;
                    }
                    
                    .input-wrapper input,
                    .input-wrapper select {
                        padding: 14px 12px;
                    }
                    
                    .privacy-notice label {
                        font-size: 13px;
                    }
                }
            </style>
        `;

        document.body.insertAdjacentHTML('beforeend', formHTML);
    }

    async setupForm() {
        document.querySelector('.close-form').addEventListener('click', () => this.hide());
        document.querySelector('.cancel-form').addEventListener('click', () => this.hide());
        document.getElementById('contactForm').addEventListener('submit', (e) => this.handleSubmit(e));

        this.setupCheckboxAnimation();
        await this.prefillForm();
        this.setupConnectionCheck();
        
        // Добавляем маску телефона
        this.setupPhoneMask();
        
        // Добавляем валидацию для поля "Роль в компании"
        this.setupRoleValidation();

        if (this.config.autoShow) {
            setTimeout(() => this.checkAndShow(), 500);
        }
    }

    setupPhoneMask() {
        const phoneInput = document.getElementById('userPhone');
        
        // Функция форматирования телефона
        const formatPhoneNumber = (value) => {
            // Удаляем все нецифры
            let numbers = value.replace(/\D/g, '');
            
            // Ограничиваем до 11 цифр
            numbers = numbers.substring(0, 11);
            
            // Если введен только +7 или 8, добавляем код
            if (numbers.length === 1) {
                if (numbers === '7' || numbers === '8') {
                    numbers = '7';
                } else {
                    numbers = '7' + numbers;
                }
            }
            
            // Форматируем номер
            let formatted = '+7';
            
            if (numbers.length > 1) {
                const areaCode = numbers.substring(1, 4);
                formatted += ` (${areaCode}`;
            }
            
            if (numbers.length >= 4) {
                const firstPart = numbers.substring(4, 7);
                formatted += `) ${firstPart}`;
            }
            
            if (numbers.length >= 7) {
                const secondPart = numbers.substring(7, 9);
                formatted += `-${secondPart}`;
            }
            
            if (numbers.length >= 9) {
                const thirdPart = numbers.substring(9, 11);
                formatted += `-${thirdPart}`;
            }
            
            return formatted;
        };
        
        // Обработчик ввода
        phoneInput.addEventListener('input', (e) => {
            const cursorPosition = e.target.selectionStart;
            let value = e.target.value;
            
            // Сохраняем положение курсора
            const isDeleting = e.inputType === 'deleteContentBackward' || 
                              e.inputType === 'deleteContentForward';
            
            // Форматируем номер
            const unformatted = value.replace(/\D/g, '');
            const formatted = formatPhoneNumber(unformatted);
            
            e.target.value = formatted;
            
            // Восстанавливаем положение курсора
            if (!isDeleting) {
                let newCursorPosition = cursorPosition;
                
                // Если добавляем цифру в середине маски, сдвигаем курсор вперед
                if (formatted.length > value.length) {
                    newCursorPosition += (formatted.length - value.length);
                }
                
                // Корректируем позицию курсора, чтобы не попасть в символы маски
                const beforeCursor = formatted.substring(0, newCursorPosition);
                const maskChars = beforeCursor.match(/[^\d]/g) || [];
                newCursorPosition = Math.min(formatted.length, newCursorPosition + maskChars.length);
                
                e.target.setSelectionRange(newCursorPosition, newCursorPosition);
            }
        });
        
        // Обработчик удаления
        phoneInput.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' || e.key === 'Delete') {
                const cursorPosition = e.target.selectionStart;
                const value = e.target.value;
                
                // Если курсор находится на символе маски, перемещаем его на предыдущую цифру
                if (cursorPosition > 0 && !/\d/.test(value[cursorPosition - 1])) {
                    e.preventDefault();
                    e.target.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
                }
            }
        });
        
        // Валидация при потере фокуса
        phoneInput.addEventListener('blur', () => {
            const value = phoneInput.value.replace(/\D/g, '');
            if (value.length === 11 || (value.length === 1 && value === '7')) {
                // Номер валиден или введен только +7
                phoneInput.classList.remove('validation-error');
                const errorElement = phoneInput.parentElement.querySelector('.phone-error-message');
                if (errorElement) {
                    errorElement.textContent = '';
                }
            } else if (value.length > 0) {
                // Номер неполный
                this.showValidationError('userPhone', 'Введите полный номер телефона');
            }
        });
    }

    setupRoleValidation() {
        const roleSelect = document.getElementById('userRole');
        const errorElement = roleSelect.parentElement.querySelector('.error-message');
        
        roleSelect.addEventListener('change', () => {
            if (roleSelect.value) {
                roleSelect.classList.remove('validation-error');
                if (errorElement) {
                    errorElement.textContent = '';
                }
            }
        });
    }

    setupCheckboxAnimation() {
        const checkboxes = document.querySelectorAll('.contact-method input');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                const methodContent = this.parentElement.querySelector('.method-content');
                if (this.checked) {
                    methodContent.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        methodContent.style.transform = 'scale(1)';
                    }, 150);
                }
            });
        });
    }

    async prefillForm() {
        try {
            // Пробуем загрузить из localStorage
            const savedData = localStorage.getItem(this.config.formKey);
            if (savedData) {
                const data = JSON.parse(savedData);
                document.getElementById('userName').value = data.name || '';
                document.getElementById('userPhone').value = data.phone || '';
                document.getElementById('userEmail').value = data.email || '';
                
                // Восстанавливаем роль
                if (data.role) {
                    document.getElementById('userRole').value = data.role;
                }

                // Восстанавливаем выбранные способы связи
                if (data.contact_methods) {
                    document.querySelectorAll('.contact-method input').forEach(checkbox => {
                        checkbox.checked = data.contact_methods.includes(checkbox.value);
                    });
                }

                if (data.privacyAgreement) {
                    document.getElementById('privacyAgreement').checked = true;
                }
                
                if (data.marketingAgreement) {
                    document.getElementById('marketingAgreement').checked = true;
                }
            }

            // Пробуем загрузить из Bitrix24
            if (this.config.autoFillUser == true){
            const userData = await this.getUserData(this.config.userId);
            if (userData) {
                if (!document.getElementById('userName').value) {
                    document.getElementById('userName').value = userData.name || '';
                }
                if (!document.getElementById('userPhone').value) {
                    document.getElementById('userPhone').value = userData.phone || '';
                }
                if (!document.getElementById('userEmail').value) {
                    document.getElementById('userEmail').value = userData.email || '';
                }
            }
        }
        } catch (error) {
            this.log('Не удалось загрузить данные пользователя:', error);
        }
    }

    async getUserData(userId) {
        return new Promise((resolve) => {
            if (typeof BX24 === 'undefined') {
                resolve(null);
                return;
            }

            BX24.callMethod(
                "user.get",
                {
                    filter: {
                        ID: userId
                    }
                },
                function (result) {
                    if (result.error()) {
                        console.error('Ошибка получения данных пользователя:', result.error());
                        resolve(null);
                    } else {
                        const users = result.data();

                        if (Array.isArray(users) && users.length > 0) {
                            const user = users[0];
                            resolve({
                                name: (user.NAME || '') + ' ' + (user.LAST_NAME || ''),
                                phone: user.PERSONAL_PHONE || user.WORK_PHONE || '',
                                email: user.EMAIL || user.WORK_EMAIL || ''
                            });
                        } else {
                            console.log('Пользователь с ID ' + userId + ' не найден');
                            resolve(null);
                        }
                    }
                }
            );
        });
    }

    async checkAndShow() {
        const isCompleted = await this.isFormCompleted();
        if (!isCompleted && !this.formShown) {
            this.show();
        }
    }

    async isFormCompleted() {
        try {
            if (typeof BX24 === 'undefined') {
                // Проверяем localStorage
                return !!localStorage.getItem(this.config.formKey);
            }

            const result = await new Promise((resolve) => {
                BX24.callMethod('app.option.get', {}, (result) => {
                    resolve(result.error() ? null : result.data());
                });
            });

            return !!(result && result[this.config.formKey]);
        } catch (error) {
            this.log('Ошибка проверки формы:', error);
            return false;
        }
    }

    show() {
        const overlay = document.getElementById('contactFormOverlay');
        overlay.style.display = 'flex';

        if (this.config.animation) {
            overlay.style.animation = 'fadeIn 0.3s ease-out';
            const container = overlay.querySelector('.contact-form-container');
            container.style.animation = 'slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        }

        this.formShown = true;
        this.log('Форма показана');

        setTimeout(() => {
            document.getElementById('userName')?.focus();
        }, 300);
    }

    hide() {
        const overlay = document.getElementById('contactFormOverlay');
        if (this.config.animation) {
            overlay.style.animation = 'fadeIn 0.3s ease-out reverse';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        } else {
            overlay.style.display = 'none';
        }
        this.log('Форма скрыта');
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (this.isSubmitting) {
            this.log('Форма уже отправляется...');
            return;
        }

        this.isSubmitting = true;
        const submitBtn = document.querySelector('.submit-form');
        const btnText = submitBtn.querySelector('.btn-text');
        const originalText = btnText.textContent;

        submitBtn.classList.add('submit-loading');
        submitBtn.disabled = true;
        btnText.textContent = 'Отправка...';

        try {
            // Валидация формы
            const formData = this.getFormData();
            if (!this.validateFormData(formData)) {
                throw new Error('Валидация не пройдена');
            }

            // Проверка согласия на обработку данных
            if (!document.getElementById('privacyAgreement').checked) {
                this.showValidationError('privacyAgreement', 'Необходимо согласие на обработку данных');
                throw new Error('Требуется согласие на обработку данных');
            }

            // Сохраняем в localStorage
            if (this.config.autoSaveToLocal) {
                localStorage.setItem(this.config.formKey, JSON.stringify(formData));
                this.log('Данные сохранены в localStorage');
            }

            // Сохраняем в Bitrix24 (если доступно)
            let bitrixSaved = true;
            if (typeof BX24 !== 'undefined') {
                bitrixSaved = await this.saveFormData(formData);
                if (!bitrixSaved) {
                    this.log('Не удалось сохранить в Bitrix24');
                }
            }

            // Отправляем на сервер (если указан endpoint)
            let serverResponse = null;
            if (this.config.apiEndpoint && !this.offlineMode) {
                try {
                    serverResponse = await this.sendToServer(formData);
                    this.log('Данные успешно отправлены на сервер:', serverResponse);
                } catch (serverError) {
                    // Если офлайн режим, сохраняем для отправки позже
                    if (this.offlineMode || !navigator.onLine) {
                        this.saveForLater(formData);
                        this.log('Данные сохранены для отправки позже');
                    } else {
                        throw serverError;
                    }
                }
            }

            // Успешное завершение
            submitBtn.style.background = 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)';
            btnText.textContent = 'Успешно!';

            setTimeout(() => {
                const message = this.offlineMode
                    ? '✅ Данные сохранены (офлайн режим)'
                    : '✅ Данные успешно отправлены!';
                this.showNotification(message);
                this.hide();

                this.triggerEvent('formSaved', formData);
                if (serverResponse) {
                    this.triggerEvent('serverResponse', serverResponse);
                }

                // Очищаем localStorage после успешной отправки
                if (!this.offlineMode) {
                    localStorage.removeItem(this.config.formKey);
                    localStorage.removeItem(`${this.config.formKey}_pending`);
                }
            }, 500);

        } catch (error) {
            this.log('Ошибка отправки:', error);

            let errorMessage = '❌ Ошибка отправки';
            if (error.message.includes('Валидация')) {
                errorMessage = '❌ Проверьте правильность заполнения полей';
            } else if (error.name === 'AbortError') {
                errorMessage = '⏱️ Превышено время ожидания';
            } else if (error.message.includes('Требуется согласие')) {
                errorMessage = '❌ Требуется согласие на обработку данных';
            }

            this.showNotification(errorMessage, 'error');

            if (typeof this.config.onError === 'function') {
                this.config.onError(error);
            }

        } finally {
            setTimeout(() => {
                submitBtn.classList.remove('submit-loading');
                submitBtn.disabled = false;
                btnText.textContent = originalText;
                submitBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                this.isSubmitting = false;
            }, 1000);
        }
    }

    getFormData() {
        const methods = Array.from(
            document.querySelectorAll('.contact-method input:checked')
        ).map(input => input.value);

        const uniqueMethods = [...new Set(methods)];
        return {
            name: document.getElementById('userName').value.trim(),
            phone: document.getElementById('userPhone').value.trim(),
            email: document.getElementById('userEmail').value.trim(),
            role: document.getElementById('userRole').value,
            contact_methods: uniqueMethods,
            privacyAgreement: document.getElementById('privacyAgreement').checked,
            marketingAgreement: document.getElementById('marketingAgreement').checked,
            submitted_at: new Date().toISOString(),
            user_id: this.config.userId,
            theme: this.config.theme,
            page_url: window.location.href,
            user_agent: navigator.userAgent
        };
    }

    async saveFormData(data) {
        return new Promise((resolve) => {
            if (typeof BX24 === 'undefined') {
                resolve(false);
                return;
            }

            const saveData = {};
            saveData[this.config.formKey] = JSON.stringify(data);

            BX24.callMethod('app.option.set', saveData, (result) => {
                resolve(!result.error());
            });
        });
    }

    async sendToServer(formData) {
        if (!this.config.apiEndpoint) {
            this.log('API endpoint не указан. Пропускаем отправку на сервер.');
            return { success: true, skipped: true };
        }

        // Подготовка данных
        let payload = {
            ...formData,
            ...this.config.extraData,
            _metadata: {
                source: 'contact-form-library',
                version: '1.0.0',
                formKey: this.config.formKey,
                timestamp: new Date().toISOString()
            }
        };

        // Колбэк перед отправкой
        if (typeof this.config.onBeforeSend === 'function') {
            const modifiedPayload = this.config.onBeforeSend(payload);
            if (modifiedPayload) {
                payload = modifiedPayload;
            }
        }

        // Создаем контроллер для таймаута
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.requestTimeout);

        try {
            this.log('Отправка данных на сервер:', payload);

            const response = await fetch(this.config.apiEndpoint, {
                method: this.config.apiMethod,
                headers: this.config.apiHeaders,
                credentials: this.config.apiCredentials,
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            this.log('Ответ сервера:', responseData);

            // Колбэк при успехе
            if (typeof this.config.onSuccess === 'function') {
                this.config.onSuccess(responseData, payload);
            }

            return {
                success: true,
                data: responseData,
                status: response.status
            };

        } catch (error) {
            clearTimeout(timeoutId);
            this.log('Ошибка отправки на сервер:', error);

            // Колбэк при ошибке
            if (typeof this.config.onError === 'function') {
                this.config.onError(error, payload);
            }

            throw error;
        } finally {
            // Колбэк при завершении
            if (typeof this.config.onComplete === 'function') {
                this.config.onComplete();
            }
        }
    }

    validateFormData(data) {
        let isValid = true;

        // Валидация email
        if (this.config.validateEmail && data.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                this.showValidationError('userEmail', 'Введите корректный email');
                isValid = false;
            }
        }

        // Валидация телефона
        if (this.config.validatePhone && data.phone) {
            const cleanPhone = data.phone.replace(/\D/g, '');
            if (cleanPhone.length !== 11 || !cleanPhone.startsWith('7')) {
                this.showValidationError('userPhone', 'Введите корректный номер телефона в формате +7 (XXX) XXX-XX-XX');
                isValid = false;
            }
        }

        // Проверка обязательных полей
        const requiredFields = [
            { id: 'userName', name: 'Имя' },
            { id: 'userPhone', name: 'Телефон' },
            { id: 'userEmail', name: 'Email' },
            { id: 'userRole', name: 'Роль в компании' }
        ];

        requiredFields.forEach(field => {
            const fieldElement = document.getElementById(field.id);
            let fieldValue = '';
            
            if (field.id === 'userRole') {
                fieldValue = fieldElement.value;
            } else {
                fieldValue = data[field.id.replace('user', '').toLowerCase()];
            }
            
            if (!fieldValue || fieldValue.trim() === '' || (field.id === 'userRole' && fieldValue === '')) {
                this.showValidationError(field.id, `Поле "${field.name}" обязательно для заполнения`);
                isValid = false;
            }
        });

        // Проверка способов связи
        if (!data.contact_methods || data.contact_methods.length === 0) {
            const errorElement = document.querySelector('.contact-methods-error');
            if (errorElement) {
                errorElement.textContent = 'Выберите хотя бы один способ связи';
            }
            isValid = false;
        } else {
            const errorElement = document.querySelector('.contact-methods-error');
            if (errorElement) {
                errorElement.textContent = '';
            }
        }

        return isValid;
    }

    showValidationError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('validation-error');

            let errorElement;
            if (fieldId === 'userPhone') {
                errorElement = field.parentElement.querySelector('.phone-error-message');
            } else {
                errorElement = field.parentElement.querySelector('.error-message');
            }
            
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = fieldId === 'userPhone' ? 'error-message phone-error-message' : 'error-message';
                field.parentElement.appendChild(errorElement);
            }
            errorElement.textContent = message;

            field.focus();

            field.addEventListener('input', function onInput() {
                field.classList.remove('validation-error');
                if (errorElement) errorElement.textContent = '';
                field.removeEventListener('input', onInput);
            }, { once: true });
        }
    }

    setupConnectionCheck() {
        const updateOnlineStatus = () => {
            this.offlineMode = !navigator.onLine;
            const offlineIndicator = document.querySelector('.offline-indicator');

            if (this.offlineMode) {
                if (offlineIndicator) {
                    offlineIndicator.style.display = 'inline-flex';
                }
                this.log('Офлайн режим активирован');
            } else {
                if (offlineIndicator) {
                    offlineIndicator.style.display = 'none';
                }
                // Пробуем отправить данные, сохраненные в офлайн режиме
                this.sendPendingData();
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        updateOnlineStatus();
    }

    saveForLater(data) {
        const pendingData = JSON.parse(localStorage.getItem(`${this.config.formKey}_pending`) || '[]');
        pendingData.push({
            ...data,
            saved_at: new Date().toISOString(),
            attempt_count: 0
        });
        localStorage.setItem(`${this.config.formKey}_pending`, JSON.stringify(pendingData));
    }

    async sendPendingData() {
        const pendingData = JSON.parse(localStorage.getItem(`${this.config.formKey}_pending`) || '[]');

        for (let i = pendingData.length - 1; i >= 0; i--) {
            const data = pendingData[i];
            try {
                await this.sendToServer(data);
                pendingData.splice(i, 1);
                this.log('Отправлены данные из офлайн-режима');
            } catch (error) {
                data.attempt_count = (data.attempt_count || 0) + 1;
                if (data.attempt_count >= 3) {
                    pendingData.splice(i, 1);
                    this.log('Превышено количество попыток отправки, данные удалены');
                }
            }
        }

        localStorage.setItem(`${this.config.formKey}_pending`, JSON.stringify(pendingData));
    }

    showNotification(message, type = 'success') {
        if (typeof BX24 !== 'undefined' && BX24.showNotify) {
            BX24.showNotify(message, type, 5000);
        } else {
            const notification = document.createElement('div');
            notification.className = 'form-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                background: ${type === 'success' ? '#48bb78' : type === 'warning' ? '#ed8936' : '#f56565'};
                color: white;
                border-radius: 10px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                z-index: 10000;
                animation: slideDown 0.3s ease;
                font-weight: 500;
                max-width: 300px;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = 'slideDown 0.3s ease reverse';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    }

    triggerEvent(eventName, data) {
        const event = new CustomEvent(`contactForm:${eventName}`, { detail: data });
        window.dispatchEvent(event);
    }

    async getSavedData() {
        try {
            // Пробуем получить из localStorage
            const localData = localStorage.getItem(this.config.formKey);
            if (localData) {
                return JSON.parse(localData);
            }

            // Пробуем получить из Bitrix24
            if (typeof BX24 !== 'undefined') {
                const result = await new Promise((resolve) => {
                    BX24.callMethod('app.option.get', {}, (result) => {
                        resolve(result.error() ? null : result.data());
                    });
                });

                if (result && result[this.config.formKey]) {
                    return JSON.parse(result[this.config.formKey]);
                }
            }

            return null;
        } catch (error) {
            this.log('Ошибка получения данных:', error);
            return null;
        }
    }

    forceShow() {
        this.show();
    }

    async getStatus() {
        const isCompleted = await this.isFormCompleted();
        const savedData = isCompleted ? await this.getSavedData() : null;

        // Проверяем наличие ожидающих отправки данных
        const pendingData = JSON.parse(localStorage.getItem(`${this.config.formKey}_pending`) || '[]');

        return {
            completed: isCompleted,
            data: savedData,
            shown: this.formShown,
            offline: this.offlineMode,
            pendingCount: pendingData.length,
            initialized: this.initialized
        };
    }

    setTheme(theme) {
        this.config.theme = theme;
        if (this.initialized) {
            document.getElementById('contactFormOverlay')?.remove();
            this.createFormHTML();
            this.setupForm();
        }
    }

    // Новые публичные методы
    async testConnection() {
        if (!this.config.apiEndpoint) {
            return { connected: false, error: 'API endpoint не указан' };
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(this.config.apiEndpoint, {
                method: 'HEAD',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            return {
                connected: response.ok,
                status: response.status
            };
        } catch (error) {
            return {
                connected: false,
                error: error.message
            };
        }
    }

    exportData(format = 'json') {
        const savedData = localStorage.getItem(this.config.formKey);
        if (!savedData) return null;

        const data = JSON.parse(savedData);

        switch (format.toLowerCase()) {
            case 'csv':
                return this.convertToCSV(data);
            case 'xml':
                return this.convertToXML(data);
            case 'json':
            default:
                return JSON.stringify(data, null, 2);
        }
    }

    convertToCSV(data) {
        const headers = ['Поле', 'Значение'];
        const rows = Object.entries(data).map(([key, value]) => {
            if (Array.isArray(value)) {
                return [key, value.join(', ')];
            }
            if (typeof value === 'object' && value !== null) {
                return [key, JSON.stringify(value)];
            }
            return [key, value];
        });

        return [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');
    }

    convertToXML(data) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<contact-form>\n';

        for (const [key, value] of Object.entries(data)) {
            if (Array.isArray(value)) {
                xml += `  <${key}>\n`;
                value.forEach(item => {
                    xml += `    <item>${this.escapeXML(String(item))}</item>\n`;
                });
                xml += `  </${key}>\n`;
            } else if (typeof value === 'object' && value !== null) {
                xml += `  <${key}>${this.escapeXML(JSON.stringify(value))}</${key}>\n`;
            } else {
                xml += `  <${key}>${this.escapeXML(String(value))}</${key}>\n`;
            }
        }

        xml += '</contact-form>';
        return xml;
    }

    escapeXML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    clearData() {
        localStorage.removeItem(this.config.formKey);
        localStorage.removeItem(`${this.config.formKey}_pending`);

        if (typeof BX24 !== 'undefined') {
            BX24.callMethod('app.option.set', { [this.config.formKey]: '' }, () => {
                this.log('Данные очищены');
            });
        }

        this.triggerEvent('dataCleared');
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.log('Конфигурация обновлена:', this.config);
    }
}

// Инициализация библиотеки
if (typeof window !== 'undefined') {
    window.ContactForm = new ContactFormLibrary();

    if (typeof BX24 !== 'undefined') {
        BX24.ready(async function () {
            await window.ContactForm.init();
        });
    } else {
        window.addEventListener('DOMContentLoaded', async function () {
            await window.ContactForm.init();
        });
    }
}

// Экспорт для использования в модульных системах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContactFormLibrary;
}