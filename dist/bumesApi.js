"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerInterfaceData = exports.getCustomerData = exports.getLastLessons = exports.getCustomerTariffs = exports.getClientToken = exports.triggerN8nWebhook = exports.getTaskQuickly = exports.getTask = exports.loginToAdminPanel = exports.clearToken = exports.setCurrentToken = exports.getCurrentToken = exports.setCredentials = void 0;
const MAIN_URL = 'https://main.okk24.com';
const BASE_URL = MAIN_URL;
// Константы для авторизации
const ADMIN_EMAIL = 'aleks.evdokimov+ai-bot-lid-dogim@gmail.com';
const ADMIN_PASSWORD = '1234567';
const triggerWebhookUrl = 'https://govorikavitaliydev.app.n8n.cloud/webhook/govorikaLead';
let currentToken = null;
let credentials = null;
const setCredentials = (email, password) => {
    credentials = { email, password };
};
exports.setCredentials = setCredentials;
const getCurrentToken = () => {
    return currentToken;
};
exports.getCurrentToken = getCurrentToken;
const setCurrentToken = (token) => {
    currentToken = token;
};
exports.setCurrentToken = setCurrentToken;
const clearToken = () => {
    currentToken = null;
};
exports.clearToken = clearToken;
const loginToAdminPanel = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (email = ADMIN_EMAIL, password = ADMIN_PASSWORD) {
    try {
        const response = yield fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': BASE_URL,
                'Referer': `${BASE_URL}/login`
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        const data = yield response.json();
        if (!data.token) {
            return {
                success: false,
                error: data.message || 'Login failed'
            };
        }
        (0, exports.setCurrentToken)({
            token: data.token,
            token_type: data.token_type,
            expires_in: data.expires_in
        });
        (0, exports.setCredentials)(ADMIN_EMAIL, ADMIN_PASSWORD);
        return {
            success: true,
            data
        };
    }
    catch (error) {
        console.error('Error during login:', error);
        return {
            success: false,
            error: 'Failed to connect to server'
        };
    }
});
exports.loginToAdminPanel = loginToAdminPanel;
// https://main.okk24.com/bumess/api/task/get
//get Task
const getTask = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loginResponse = yield (0, exports.loginToAdminPanel)();
        if (!loginResponse.success) {
            return null;
        }
        const token = (0, exports.getCurrentToken)();
        if (!token) {
            return null;
        }
        const response = yield fetch(`${BASE_URL}/bumess/api/task/get`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token.token}`,
                'Accept': 'application/json',
                'Origin': BASE_URL,
                'Referer': `${BASE_URL}/login`
            }
        });
        if (!response) {
            return null;
        }
        const data = yield response.json();
        return data;
    }
    catch (error) {
        return null;
    }
});
exports.getTask = getTask;
// https://main.okk24.com/bumess/api/task/get_quickly - get Task Quickly
const getTaskQuickly = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loginResponse = yield (0, exports.loginToAdminPanel)();
        if (!loginResponse.success) {
            return null;
        }
        const token = (0, exports.getCurrentToken)();
        if (!token) {
            return null;
        }
        const response = yield fetch(`${BASE_URL}/bumess/api/task/get_quickly`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token.token}`,
                'Accept': 'application/json',
                'Origin': BASE_URL,
                'Referer': `${BASE_URL}/login`
            }
        });
        if (!response) {
            return null;
        }
        const data = yield response.json();
        console.log('getTaskQuickly', data);
        return data;
    }
    catch (error) {
        return null;
    }
});
exports.getTaskQuickly = getTaskQuickly;
const triggerN8nWebhook = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch(triggerWebhookUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        console.log('Webhook triggered successfully:', data);
        return data;
    }
    catch (error) {
        console.error('Error triggering n8n webhook:', error);
        return null;
    }
});
exports.triggerN8nWebhook = triggerN8nWebhook;
// Получение клиентского токена
const getClientToken = (customerId, customerHash) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Сначала получаем админский токен
        const adminLoginResponse = yield (0, exports.loginToAdminPanel)();
        if (!adminLoginResponse.success) {
            return null;
        }
        const adminToken = (0, exports.getCurrentToken)();
        if (!adminToken) {
            return null;
        }
        // Получаем клиентский токен используя админский токен
        const response = yield fetch(`${BASE_URL}/govorikaalfa/api/login/${customerId}/${customerHash}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminToken.token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': BASE_URL,
                'Referer': `${BASE_URL}/login`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        console.log('Client token received:', data);
        return data;
    }
    catch (error) {
        console.error('Error getting client token:', error);
        return null;
    }
});
exports.getClientToken = getClientToken;
// Получение тарифов клиента
const getCustomerTariffs = (customerId, clientToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch(`${BASE_URL}/api/customer_tariff_customer/all/${customerId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${clientToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': BASE_URL,
                'Referer': `${BASE_URL}/login`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        console.log('Customer tariffs received:', data);
        return data;
    }
    catch (error) {
        console.error('Error getting customer tariffs:', error);
        return null;
    }
});
exports.getCustomerTariffs = getCustomerTariffs;
// Получение последних уроков
const getLastLessons = (customerId, customerHash) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Сначала получаем клиентский токен
        const tokenData = yield (0, exports.getClientToken)(customerId, customerHash);
        if (!tokenData || !tokenData.token) {
            return {
                success: false,
                error: 'Failed to get client token'
            };
        }
        // Получаем последние уроки используя клиентский токен
        const response = yield fetch(`${BASE_URL}/govorikaalfa/api/last_lessons`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenData.token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': BASE_URL,
                'Referer': `${BASE_URL}/login`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        console.log('Last lessons received:', data);
        return data;
    }
    catch (error) {
        console.error('Error getting last lessons:', error);
        return null;
    }
});
exports.getLastLessons = getLastLessons;
// Комбинированная функция для получения токена и тарифов
const getCustomerData = (customerId, customerHash) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Сначала получаем клиентский токен
        const tokenData = yield (0, exports.getClientToken)(customerId, customerHash);
        if (!tokenData || !tokenData.token) {
            return {
                success: false,
                error: 'Failed to get client token'
            };
        }
        // Затем получаем тарифы клиента
        const tariffsData = yield (0, exports.getCustomerTariffs)(customerId, tokenData.token);
        if (!tariffsData) {
            return {
                success: false,
                error: 'Failed to get customer tariffs'
            };
        }
        return {
            success: true,
            data: tariffsData
        };
    }
    catch (error) {
        console.error('Error getting customer data:', error);
        return {
            success: false,
            error: 'Failed to get customer data'
        };
    }
});
exports.getCustomerData = getCustomerData;
// Получение структурированных данных клиента для интерфейса
const getCustomerInterfaceData = (customerId, customerHash) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Сначала получаем клиентский токен
        const tokenData = yield (0, exports.getClientToken)(customerId, customerHash);
        if (!tokenData || !tokenData.token) {
            throw new Error('Failed to get client token');
        }
        // Получаем данные клиента и уроков
        const lessonsData = yield (0, exports.getLastLessons)(customerId, customerHash);
        if (!lessonsData) {
            throw new Error('Failed to get customer data');
        }
        console.log('lessonsData structure:', JSON.stringify(lessonsData, null, 2));
        // Структурируем данные для интерфейса
        const customer = (_a = lessonsData[0]) === null || _a === void 0 ? void 0 : _a.customer;
        const nextLesson = lessonsData[0]; // Берем первый урок из массива
        const teacher = nextLesson === null || nextLesson === void 0 ? void 0 : nextLesson.teacher;
        console.log('customer:', customer);
        console.log('nextLesson:', nextLesson);
        if (!customer || !nextLesson) {
            throw new Error('Customer or lesson data not found');
        }
        // Форматируем данные для интерфейса согласно CustomerInterfaceData
        const interfaceData = {
            customer: {
                name: customer.name,
                id: customer.id,
                game_url: nextLesson.game_url || ''
            },
            balance: {
                balance: customer.balance,
                balance_status: customer.balance_status,
                balance_status_updated: customer.balance_status_updated
            },
            nextLesson: {
                start_customer: nextLesson.start_customer,
                start_customer_day: nextLesson.start_customer_day,
                time_to: nextLesson.time_to,
                web_join_url: nextLesson.web_join_url,
                can_move: nextLesson.can_move,
                free_cancelation: nextLesson.free_cancelation,
                subject_id: nextLesson.subject_id
            },
            teacher: {
                name: (teacher === null || teacher === void 0 ? void 0 : teacher.name) || 'Не указан',
                id: (teacher === null || teacher === void 0 ? void 0 : teacher.id) || 0
            }
        };
        return interfaceData;
    }
    catch (error) {
        console.error('Error getting customer interface data:', error);
        throw error;
    }
});
exports.getCustomerInterfaceData = getCustomerInterfaceData;
