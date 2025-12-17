
class ContactFormLibrary {
    constructor(options = {}) {
        
        this.config = {
            formKey: 'user_contact_data',
            userId: 1,
            autoShow: true,
            debug: false,
            theme: 'light', 
            animation: true,
            ...options
        };
        
        this.initialized = false;
        this.formShown = false;
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
                            <h3>Контактная информация</h3>
                            <p>Заполните данные для связи</p>
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
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="userPhone" class="form-label">
                                <span class="label-icon">📱</span>
                                <span>Телефон:</span>
                            </label>
                            <div class="input-wrapper">
                                <input type="tel" id="userPhone" placeholder="+7 (999) 123-45-67" required>
                                <div class="input-border"></div>
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
                                        <span class="method-icon"><img src="icons/whatsapp.png"></span>
                                        <span class="method-text">WhatsApp</span>
                                    </div>
                                </label>
                                <label class="contact-method">
                                    <input type="checkbox" name="contact_method" value="telegram">
                                    <div class="method-content">
                                        <span class="method-icon"><img src="icons/telegram.png"></span>
                                        <span class="method-text">Telegram</span>
                                    </div>
                                </label>
                                <label class="contact-method">
                                    <input type="checkbox" name="contact_method" value="viber">
                                    <div class="method-content">
                                        <span class="method-icon"><img src="icons/viber.png"></span>
                                        <span class="method-text">Viber</span>
                                    </div>
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
                    max-width: 480px;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
                    border: 1px solid ${borderColor};
                    animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    transform-origin: center;
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
                    padding: 16px 0px;
                    background: ${isDark ? '#2d3748' : '#f7fafc'};
                    border: 2px solid ${borderColor};
                    border-radius: 12px;
                    font-size: 16px;
                    color: ${textColor};
                    text-indent: 10px;
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
                
                .input-wrapper input:focus ~ .input-border {
                    width: 100%;
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
                    color: white;
                }
                
                .contact-method input:checked + .method-content .method-text {
                    color: white;
                }
                
                /* Кнопки */
                .form-actions {
                    display: flex;
                    gap: 15px;
                    margin-top: 40px;
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
                    
                    .input-wrapper input {
                        padding: 14px 16px;
                    }
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
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
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
        
        
        if (this.config.autoShow) {
            setTimeout(() => this.checkAndShow(), 500);
        }
    }

    
    setupCheckboxAnimation() {
        const checkboxes = document.querySelectorAll('.contact-method input');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
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
            
            const userData = await this.getUserData(this.config.userId);
            if (userData) {
                document.getElementById('userName').value = userData.name || '';
                document.getElementById('userPhone').value = userData.phone || '';
                document.getElementById('userEmail').value = userData.email || '';
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

            BX24.callMethod('user.get', { ID: userId }, (result) => {
                if (result.error()) {
                    this.log('Ошибка получения данных:', result.error());
                    resolve(null);
                } else {
                    const user = result.data();
                    resolve({
                        name: user.NAME + ' ' + user.LAST_NAME,
                        phone: user.PERSONAL_PHONE || user.WORK_PHONE || '',
                        email: user.EMAIL || user.WORK_EMAIL || ''
                    });
                }
            });
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
            if (typeof BX24 === 'undefined') return false;
            
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
        
        const submitBtn = document.querySelector('.submit-form');
        const btnText = submitBtn.querySelector('.btn-text');
        const originalText = btnText.textContent;
        
        
        submitBtn.classList.add('submit-loading');
        submitBtn.disabled = true;
        btnText.textContent = 'Сохранение...';

        try {
            const formData = this.getFormData();
            const saved = await this.saveFormData(formData);
            
            if (saved) {
                
                submitBtn.style.background = 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)';
                btnText.textContent = 'Успешно!';
                
                setTimeout(() => {
                    this.showNotification('✅ Контактные данные сохранены!');
                    this.hide();
                    
                    
                    this.triggerEvent('formSaved', formData);
                }, 500);
            } else {
                this.showNotification('❌ Ошибка сохранения', 'error');
            }
        } catch (error) {
            this.log('Ошибка отправки:', error);
            this.showNotification('❌ Ошибка отправки', 'error');
        } finally {
            setTimeout(() => {
                submitBtn.classList.remove('submit-loading');
                submitBtn.disabled = false;
                btnText.textContent = originalText;
                submitBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }, 1000);
        }
    }

    
    getFormData() {
        return {
            name: document.getElementById('userName').value,
            phone: document.getElementById('userPhone').value,
            email: document.getElementById('userEmail').value,
            contact_methods: Array.from(
                document.querySelectorAll('.contact-method input:checked')
            ).map(input => input.value),
            submitted_at: new Date().toISOString(),
            user_id: this.config.userId,
            theme: this.config.theme
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

    
    showNotification(message, type = 'success') {
        if (typeof BX24 !== 'undefined' && BX24.showNotify) {
            BX24.showNotify(message, type, 5000);
        } else {
            
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                background: ${type === 'success' ? '#48bb78' : '#f56565'};
                color: white;
                border-radius: 10px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                z-index: 10000;
                animation: slideUp 0.3s ease;
                font-weight: 500;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideUp 0.3s ease reverse';
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
            if (typeof BX24 === 'undefined') return null;
            
            const result = await new Promise((resolve) => {
                BX24.callMethod('app.option.get', {}, (result) => {
                    resolve(result.error() ? null : result.data());
                });
            });
            
            if (result && result[this.config.formKey]) {
                return JSON.parse(result[this.config.formKey]);
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
        
        return {
            completed: isCompleted,
            data: savedData,
            shown: this.formShown
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
}


window.ContactForm = new ContactFormLibrary();


if (typeof BX24 !== 'undefined') {
    BX24.ready(async function() {
        await window.ContactForm.init();
    });
} else {
    window.addEventListener('DOMContentLoaded', async function() {
        await window.ContactForm.init();
    });
}