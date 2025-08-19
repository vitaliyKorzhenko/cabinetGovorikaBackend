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
exports.getCustomerInterfaceData = exports.getCustomerData = exports.getLastLessons = exports.getRegularLessonsSchedule = exports.getCustomerTariffSchedule = exports.getCustomerTariffs = exports.getClientToken = exports.loginToAdminPanel = exports.clearToken = exports.setCurrentToken = exports.getCurrentToken = exports.setCredentials = void 0;
const apiReference_1 = require("./apiReference");
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
// Получение расписания тарифа клиента
const getCustomerTariffSchedule = (tariffId, clientToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch(`${BASE_URL}/api/customer_tariff/${tariffId}/schedule`, {
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
        console.log('Customer tariff schedule received:', data);
        return data;
    }
    catch (error) {
        console.error('Error getting customer tariff schedule:', error);
        return null;
    }
});
exports.getCustomerTariffSchedule = getCustomerTariffSchedule;
// Получение расписания регулярных уроков клиента
const getRegularLessonsSchedule = (customerId, clientToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch(`${BASE_URL}/api/regular_lessons/schedule/${customerId}`, {
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
        console.log('Regular lessons schedule received:', data);
        return data;
    }
    catch (error) {
        console.error('Error getting regular lessons schedule:', error);
        return null;
    }
});
exports.getRegularLessonsSchedule = getRegularLessonsSchedule;
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
    try {
        // Сначала получаем клиентский токен
        const tokenData = yield (0, exports.getClientToken)(customerId, customerHash);
        if (!tokenData || !tokenData.token) {
            throw new Error('Failed to get client token');
        }
        // Получаем данные клиента и уроков
        const lessonsData = yield (0, exports.getLastLessons)(customerId, customerHash);
        console.log('lessonsData', lessonsData);
        if (!lessonsData) {
            throw new Error('Failed to get customer data');
        }
        // Извлекаем данные детей из массива уроков
        const children = yield Promise.all(lessonsData.map((lesson) => __awaiter(void 0, void 0, void 0, function* () {
            const customer = lesson.customer;
            const teacher = lesson.teacher;
            const active_tariffs = customer.active_tariffs;
            let main_tariff = customer.main_tariff ? customer.main_tariff : null;
            const active_tariffs_data = active_tariffs.map((tariff) => {
                return {
                    id: tariff.id,
                    template_id: tariff.tariff.id,
                    name: tariff.name,
                    begin_date: tariff.begin_date,
                    end_date: tariff.end_date,
                    duration: tariff.duration,
                    custom_ind_period_limit: tariff.custom_ind_period_limit
                };
            });
            return {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                birthday: customer.birthday,
                age: customer.custom_age ? parseFloat(customer.custom_age) : 0,
                language: null, // Пока оставляем null, так как в данных нет информации о языке
                balance: customer.balance || 0,
                environment: apiReference_1.Environment.GOVORIKA,
                subscriptions: null,
                available_subscriptions: null,
                last_record: null,
                recommended_courses: null,
                active_tariffs: active_tariffs_data,
                main_tariff: main_tariff ? {
                    id: main_tariff.id,
                    template_id: main_tariff.tariff.id,
                    name: main_tariff.name,
                    begin_date: main_tariff.begin_date,
                    end_date: main_tariff.end_date,
                    duration: main_tariff.duration,
                    custom_ind_period_limit: main_tariff.custom_ind_period_limit
                } : null,
                next_lesson: {
                    id: lesson.id,
                    type: lesson.type,
                    start_date: lesson.start,
                    teacher: {
                        id: teacher.id,
                        name: teacher.name
                    },
                    zoom_link: lesson.web_join_url,
                    time_to: lesson.time_to
                }
            };
        })));
        return {
            language: null,
            environment: apiReference_1.Environment.GOVORIKA,
            children: children
        };
    }
    catch (error) {
        console.error('Error getting customer interface data:', error);
        throw error;
    }
});
exports.getCustomerInterfaceData = getCustomerInterfaceData;
