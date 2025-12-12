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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTarifStats = exports.getCustomerWithClientToken = exports.updateLessonWithClientToken = exports.getLessonAvailableSlotsWithClientToken = exports.getClientTokenByAdmin = exports.getCustomerMeetings = exports.countLessonsCustomerCalendar = exports.getCustomerCalendar = exports.getCustomerDataByToken = exports.decodeCustomerToken = exports.generateCustomerToken = exports.getCustomerInterfaceData = exports.getAvailableTariffs = exports.getCustomerRegularLessons = exports.getCustomerData = exports.getLastLessons = exports.getRegularLessonsSchedule = exports.getCustomerTariffSchedule = exports.getCustomerTariffs = exports.getClientToken = exports.loginToAdminPanel = exports.clearToken = exports.setCurrentToken = exports.getCurrentToken = exports.setCredentials = void 0;
const apiConfig_1 = require("./apiConfig");
const apiReference_1 = require("./apiReference");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
const loginToAdminPanel = (apiConfig) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch(`${apiConfig.url}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': apiConfig.url,
                'Referer': `${apiConfig.url}/login`
            },
            body: JSON.stringify({
                email: apiConfig.email,
                password: apiConfig.password
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
        (0, exports.setCredentials)(apiConfig.email, apiConfig.password);
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
const getClientToken = (customerId, customerHash, apiConfig) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Сначала получаем админский токен
        const adminLoginResponse = yield (0, exports.loginToAdminPanel)(apiConfig);
        if (!adminLoginResponse.success) {
            return null;
        }
        const adminToken = (0, exports.getCurrentToken)();
        if (!adminToken) {
            return null;
        }
        // Получаем клиентский токен используя админский токен
        const response = yield fetch(`${apiConfig.url}/govorikaalfa/api/login/${customerId}/${customerHash}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminToken.token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': apiConfig.url,
                'Referer': `${apiConfig.url}/login`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        return data;
    }
    catch (error) {
        console.error('Error getting client token:', error);
        return null;
    }
});
exports.getClientToken = getClientToken;
// Получение тарифов клиента
const getCustomerTariffs = (customerId, clientToken, apiConfig) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch(`${apiConfig.url}/api/customer_tariff_customer/all/${customerId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${clientToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': apiConfig.url,
                'Referer': `${apiConfig.url}/login`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        // Маппинг данных в формат Subscription с regular_lessons
        let tarrifData = data.data;
        let mappedTariffs;
        if (tarrifData && Array.isArray(tarrifData)) {
            // Получаем текущую дату в формате 2025-09-01T00:00:00
            const today = new Date().toISOString().split('.')[0]; // Формат: 2025-09-01T00:00:00
            mappedTariffs = yield Promise.all(tarrifData.map((tariff) => __awaiter(void 0, void 0, void 0, function* () {
                // Считаем уроки от начала тарифа до сегодня
                const lessons = yield (0, exports.getCustomerCalendar)(customerId, tariff.begin_date_c, tariff.end_date_c, apiConfig);
                console.log('===== from ======', tariff.begin_date_c);
                console.log('===== to ======', tariff.end_date_c);
                console.log('===== lessonsCount ======', lessons[0]);
                let countFinishedLessons = 0;
                let countNewLessons = 0;
                if (lessons && lessons.length > 0) {
                    for (let lesson of lessons) {
                        // Считаем прошедшие уроки до сегодняшнего дня
                        if (lesson.start < today && lesson.status == 3 && !lesson.reason_id) {
                            countFinishedLessons++;
                        }
                        if (lesson.start >= today) {
                            if (lesson.status == 1 || lesson.status == 4) {
                                countNewLessons++;
                            }
                        }
                    }
                }
                //custom_ind_period_limit коливо укроков для абонементов по периоду 
                const totalLessons = Number(tariff.custom_ind_period_limit) || 0;
                const finished = Number(countFinishedLessons) || 0;
                const countBonusLessons = Math.max(finished - totalLessons - countNewLessons, 0);
                console.warn('totalLessons =', totalLessons);
                console.warn('finished =', finished);
                console.warn('countNewLessons =', countNewLessons);
                console.warn('countBonusLessons =', countBonusLessons);
                // Получаем статистику тарифа
                let tariffStatsData = null;
                if (tariff.id) {
                    try {
                        const tariffStats = yield (0, exports.getTarifStats)(tariff.id, apiConfig);
                        console.log('===== tariffStats for tariff', tariff.id, '=====', JSON.stringify(tariffStats, null, 2));
                        if (tariffStats && tariffStats.success && tariffStats.data) {
                            tariffStatsData = tariffStats.data;
                            console.log('===== tariffStatsData extracted =====', JSON.stringify(tariffStatsData, null, 2));
                        }
                        else {
                            console.warn('===== tariffStats failed or no data for tariff', tariff.id, '=====', tariffStats);
                        }
                    }
                    catch (error) {
                        console.error('===== Error getting tariff stats for', tariff.id, '=====', error);
                    }
                }
                const tariffObject = {
                    id: tariff.id,
                    type: tariff.type,
                    name: tariff.name,
                    price: tariff.price,
                    duration: tariff.duration || 30, // По умолчанию 30 минут
                    start_date: tariff.begin_date_c,
                    end_date: tariff.end_date_c,
                    is_active: tariff.is_active,
                    custom_ind_period_limit: totalLessons,
                    is_expire_soon: tariff.is_expire_soon == '1' ? true : false,
                    tariff_type: tariff.tariff ? tariff.tariff.tariff_type : '',
                };
                // Добавляем статистику если есть
                if (tariffStatsData) {
                    tariffObject.total_lesson_count = tariffStatsData.total_lesson_count;
                    tariffObject.lessons_done_count = tariffStatsData.lessons_done_count;
                    tariffObject.less_lessons = tariffStatsData.less_lessons;
                    tariffObject.bonus = tariffStatsData.bonus;
                    console.log('===== Added stats to tariff', tariff.id, '=====', {
                        total_lesson_count: tariffStatsData.total_lesson_count,
                        lessons_done_count: tariffStatsData.lessons_done_count,
                        less_lessons: tariffStatsData.less_lessons,
                        bonus: tariffStatsData.bonus
                    });
                }
                else {
                    console.warn('===== No stats data for tariff', tariff.id, '=====');
                }
                return Object.assign(Object.assign({}, tariffObject), { regular_lessons: tariff.regular_lessons ? tariff.regular_lessons.map((lesson) => ({
                        id: lesson.id,
                        alfa_customer_id: lesson.alfa_customer_id,
                        lesson_type_id: lesson.lesson_type_id,
                        subject_id: lesson.subject_id,
                        day: lesson.day,
                        teacher_id: lesson.teacher_id,
                        external_id: lesson.external_id,
                        b_date: lesson.b_date,
                        e_date: lesson.e_date,
                        time_from: lesson.time_from,
                        time_to: lesson.time_to,
                        created_at: lesson.created_at,
                        updated_at: lesson.updated_at,
                        is_active: lesson.is_active,
                        need_prolong: lesson.need_prolong,
                        parent_id: lesson.parent_id,
                        created_by: lesson.created_by,
                        expired: lesson.expired,
                        customerString: lesson.customerString,
                        adminString: lesson.adminString,
                        beginLocalHuman: lesson.beginLocalHuman,
                        endLocalHuman: lesson.endLocalHuman
                    })) : [] // Расписание регулярных урок с нужными полями
                 });
            })));
            return mappedTariffs;
        }
    }
    catch (error) {
        console.error('Error getting customer tariffs:', error);
        return null;
    }
});
exports.getCustomerTariffs = getCustomerTariffs;
// Получение расписания тарифа клиента
const getCustomerTariffSchedule = (tariffId, clientToken, apiConfig) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch(`${apiConfig.url}/api/customer_tariff/${tariffId}/schedule`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${clientToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': apiConfig.url,
                'Referer': `${apiConfig.url}/login`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        return data;
    }
    catch (error) {
        console.error('Error getting customer tariff schedule:', error);
        return null;
    }
});
exports.getCustomerTariffSchedule = getCustomerTariffSchedule;
// Получение расписания регулярных уроков клиента
const getRegularLessonsSchedule = (customerId, clientToken, apiConfig) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch(`${apiConfig.url}/api/regular_lessons/schedule/${customerId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${clientToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': apiConfig.url,
                'Referer': `${apiConfig.url}/login`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        return data;
    }
    catch (error) {
        console.error('Error getting regular lessons schedule:', error);
        return null;
    }
});
exports.getRegularLessonsSchedule = getRegularLessonsSchedule;
// Получение последних уроков
const getLastLessons = (customerId, customerHash, apiConfig) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Сначала получаем клиентский токен
        const tokenData = yield (0, exports.getClientToken)(customerId, customerHash, apiConfig);
        if (!tokenData || !tokenData.token) {
            return {
                success: false,
                error: 'Failed to get client token'
            };
        }
        // Получаем последние уроки используя клиентский токен
        const response = yield fetch(`${apiConfig.url}/govorikaalfa/api/last_lessons`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenData.token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': apiConfig.url,
                'Referer': `${apiConfig.url}/login`
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
const getCustomerData = (customerId, customerHash, apiConfig) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Сначала получаем клиентский токен
        const tokenData = yield (0, exports.getClientToken)(customerId, customerHash, apiConfig);
        if (!tokenData || !tokenData.token) {
            return {
                success: false,
                error: 'Failed to get client token'
            };
        }
        // Затем получаем тарифы клиента
        const tariffsData = yield (0, exports.getCustomerTariffs)(customerId, tokenData.token, apiConfig);
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
// Получение регулярных уроков клиента по предмету
const getCustomerRegularLessons = (customerId, subjectId, clientToken, apiConfig) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let url;
        if (subjectId === 0) {
            // Если subjectId = 0, получаем все предметы
            url = `${apiConfig.url}/api/customer_regular_lessons/${customerId}`;
        }
        else {
            // Если указан конкретный предмет
            url = `${apiConfig.url}/api/customer_regular_lessons/${customerId}/${subjectId}`;
        }
        const response = yield fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${clientToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': apiConfig.url,
                'Referer': `${apiConfig}/login`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        return data;
    }
    catch (error) {
        console.error('Error getting customer regular lessons:', error);
        return null;
    }
});
exports.getCustomerRegularLessons = getCustomerRegularLessons;
// Получение доступных тарифов для клиента
const getAvailableTariffs = (customerId, apiConfig) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch(`${apiConfig.url}/api/tariff?customer_id=${customerId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': apiConfig.url,
                'Referer': `${apiConfig.url}/login`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        // Маппинг данных в формат AvailableSubscription
        if (Array.isArray(data)) {
            const mappedTariffs = data.map((tariff) => ({
                id: tariff.id,
                type: tariff.type,
                duration: tariff.duration,
                frequency: tariff.lessons_count || 1, // Используем lessons_count как frequency
                name: tariff.name,
                price: tariff.price,
                lessons_count: tariff.lessons_count,
                added: tariff.added
            }));
            return mappedTariffs;
        }
        return data;
    }
    catch (error) {
        console.error('Error getting available tariffs:', error);
        return null;
    }
});
exports.getAvailableTariffs = getAvailableTariffs;
// Получение структурированных данных клиента для интерфейса
const getCustomerInterfaceData = (customerId, customerHash, apiConfig) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Сначала получаем клиентский токен
        const tokenData = yield (0, exports.getClientToken)(customerId, customerHash, apiConfig);
        if (!tokenData || !tokenData.token) {
            throw new Error('Failed to get client token');
        }
        // Получаем данные клиента и уроков
        const lessonsData = yield (0, exports.getLastLessons)(customerId, customerHash, apiConfig);
        if (!lessonsData) {
            throw new Error('Failed to get customer data');
        }
        // Извлекаем данные детей из массива уроков
        let parent = null;
        //first lesson data log
        const children = yield Promise.all(lessonsData.map((lesson) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            //console.warn("====== lesson ======", lesson);
            const customer = lesson.customer;
            const teacher = lesson.teacher;
            //console.warn("====== teacher ======", teacher);
            // console.warn("====== customer ======", customer);
            // Получаем тарифы клиента с расписанием через API
            const customerTariffs = yield (0, exports.getCustomerTariffs)(customer.id.toString(), tokenData.token, apiConfig);
            //console.warn("====== customerTariffs ======", customerTariffs);
            // Получаем встречи клиента (используем индивидуальный c_hash каждого customer)
            const customerSpecificHash = customer.c_hash || customerHash; // Fallback на общий hash если нет индивидуального
            const meetingsData = yield (0, exports.getCustomerMeetings)(customer.id.toString(), customerSpecificHash, apiConfig);
            // Обрабатываем данные встреч
            let lastRecord = null;
            let allRecords = [];
            if (meetingsData && meetingsData.success !== false && meetingsData.meetings && Array.isArray(meetingsData.meetings)) {
                allRecords = meetingsData.meetings;
                // Берем последнюю запись (первую в массиве, если отсортированы по дате)
                lastRecord = meetingsData.meetings.length > 0 ? meetingsData.meetings[0] : null;
            }
            parent = {
                id: customer.parent_id,
                name: customer.kid_parent_name
            };
            let customerLanguage = null;
            let customerInfoUseToken = yield (0, exports.getCustomerWithClientToken)(tokenData.token, apiConfig);
            if (customerInfoUseToken.success) {
                let customerInfo = customerInfoUseToken.data;
                console.error(" ======== FULL CUSTOMER DATA ======", customerInfo);
                customerLanguage = ((_b = (_a = customerInfo === null || customerInfo === void 0 ? void 0 : customerInfo.bumess_chat) === null || _a === void 0 ? void 0 : _a.sub_project) === null || _b === void 0 ? void 0 : _b.language_iso2) || '';
            }
            return {
                id: customer.id,
                game_url: lesson.game_url,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                c_hash: customer.c_hash,
                customer_hash: customer.customer_hash,
                custom_hash: customer.custom_hash,
                calendar_hash: customer.calendar_hash,
                birthday: customer.birthday,
                real_timezone: customer.real_timezone,
                timezone: customer.timezone,
                hobby: customer.hobby,
                age: customer.custom_age ? parseFloat(customer.custom_age) : 0,
                language: customerLanguage, // Пока оставляем null, так как в данных нет информации о языке
                balance: customer.balance || 0,
                environment: apiReference_1.Environment.GOVORIKA,
                // available_subscriptions: availableTariffs, // Помещаем доступные тарифы
                last_record: lastRecord,
                all_records: allRecords,
                recommended_courses: null,
                next_lesson: {
                    id: lesson.id,
                    type: lesson.type,
                    start: lesson.start,
                    start_customer: lesson.start_customer,
                    start_customer_day: lesson.start_customer_day,
                    teacher: {
                        id: teacher ? teacher.id : null,
                        name: teacher ? teacher.name : ''
                    },
                    zoom_link: lesson.web_join_url,
                    time_to: lesson.time_to,
                    lesson_language_id: lesson.lesson_language_id
                },
                subscriptions: customerTariffs, // Помещаем тарифы с расписанием из API
            };
        })));
        return {
            environment: apiReference_1.Environment.GOVORIKA,
            parent: parent,
            role: apiReference_1.Role.USER,
            children: children
        };
    }
    catch (error) {
        console.error('Error getting customer interface data:', error);
        throw error;
    }
});
exports.getCustomerInterfaceData = getCustomerInterfaceData;
// Генерация JWT токена для клиента
const generateCustomerToken = (customerId_1, customerHash_1, ...args_1) => __awaiter(void 0, [customerId_1, customerHash_1, ...args_1], void 0, function* (customerId, customerHash, env = "production") {
    try {
        const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            return {
                success: false,
                error: 'JWT_SECRET не установлен в переменных окружения'
            };
        }
        const payload = {
            clientId: customerId,
            hash: customerHash,
            env: env
        };
        // Генерируем токен без срока истечения (вечный токен)
        const token = jsonwebtoken_1.default.sign(payload, secretKey);
        // Формируем URL для фронта
        const url = `https://client.slideedu.com/callback?token=${token}`;
        return {
            success: true,
            token: token,
            url: url
        };
    }
    catch (error) {
        console.error('Error generating customer token:', error);
        return {
            success: false,
            error: 'Ошибка при генерации токена'
        };
    }
});
exports.generateCustomerToken = generateCustomerToken;
// Расшифровка JWT токена
const decodeCustomerToken = (token) => {
    try {
        const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            return {
                success: false,
                error: 'JWT_SECRET не установлен в переменных окружения'
            };
        }
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        return {
            success: true,
            data: decoded
        };
    }
    catch (error) {
        console.error('Error decoding customer token:', error);
        return {
            success: false,
            error: 'Неверный или истекший токен'
        };
    }
};
exports.decodeCustomerToken = decodeCustomerToken;
// Получение данных клиента по JWT токену
const getCustomerDataByToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Расшифровываем токен
        const tokenData = (0, exports.decodeCustomerToken)(token);
        console.warn("====== DECODE tokenData ======", tokenData);
        let env = ((_a = tokenData === null || tokenData === void 0 ? void 0 : tokenData.data) === null || _a === void 0 ? void 0 : _a.env) || '';
        console.warn("====== env ======", env);
        let apiConfig = (0, apiConfig_1.getAdminConfig)(env);
        console.warn("====== apiConfig ======", apiConfig);
        if (!tokenData.success || !tokenData.data) {
            throw new Error(tokenData.error || 'Failed to decode token');
        }
        console.warn("====== tokenData ======", tokenData);
        const { clientId: customerId, hash: customerHash } = tokenData.data;
        console.warn("====== customerId ======", customerId);
        console.warn("====== customerHash ======", customerHash);
        // Получаем данные клиента используя существующую функцию
        return yield (0, exports.getCustomerInterfaceData)(customerId, customerHash, apiConfig);
    }
    catch (error) {
        console.error('Error getting customer data by token:', error);
        throw error;
    }
});
exports.getCustomerDataByToken = getCustomerDataByToken;
// Получение календаря клиента
const getCustomerCalendar = (customerId, startDate, endDate, apiConfig) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = `${apiConfig.url}/api2/alfa_calendars?customerId=${customerId}&from=${startDate}&to=${endDate}`;
        const response = yield fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'da120237-3293-4017-a2d6-d5b31c873d38',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        // Если есть поле data, возвращаем только его содержимое
        return data.data || data;
    }
    catch (error) {
        console.error('Error getting customer calendar:', error);
        return {
            success: false,
            error: 'Failed to get customer calendar'
        };
    }
});
exports.getCustomerCalendar = getCustomerCalendar;
const countLessonsCustomerCalendar = (customerId, startDate, endDate, apiConfig) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = `${apiConfig.url}/api2/alfa_calendars?customerId=${customerId}&from=${startDate}&to=${endDate}`;
        const response = yield fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'da120237-3293-4017-a2d6-d5b31c873d38',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        console.warn("====== data ======", data);
        console.warn("=====LESSONS COUNT ======");
        return data;
    }
    catch (error) {
        console.error('Error getting customer calendar:', error);
        return {
            success: false,
            error: 'Failed to get customer calendar'
        };
    }
});
exports.countLessonsCustomerCalendar = countLessonsCustomerCalendar;
// Получение встреч клиента
const getCustomerMeetings = (customerId, customerHash, apiConfig) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Сначала получаем клиентский токен
        const tokenData = yield (0, exports.getClientToken)(customerId, customerHash, apiConfig);
        if (!tokenData || !tokenData.token) {
            return {
                success: false,
                error: 'Failed to get client token'
            };
        }
        // Получаем встречи клиента
        const response = yield fetch(`${apiConfig.url}/govorikaalfa/api/customer/${customerId}/${customerHash}/meetings`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenData.token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': apiConfig.url,
                'Referer': `${apiConfig.url}/login`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        return data;
    }
    catch (error) {
        console.error('Error getting customer meetings:', error);
        return {
            success: false,
            error: 'Failed to get customer meetings'
        };
    }
});
exports.getCustomerMeetings = getCustomerMeetings;
// Получение клиентского токена через админский токен
const getClientTokenByAdmin = (customerId, customerHash, apiConfig) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Сначала получаем админский токен
        const adminLoginResponse = yield (0, exports.loginToAdminPanel)(apiConfig);
        if (!adminLoginResponse.success) {
            return {
                success: false,
                error: 'Failed to get admin token'
            };
        }
        const adminToken = (0, exports.getCurrentToken)();
        if (!adminToken) {
            return {
                success: false,
                error: 'Admin token not available'
            };
        }
        // Получаем клиентский токен используя админский токен
        const response = yield fetch(`${apiConfig.url}/govorikaalfa/api/login/${customerId}/${customerHash}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminToken.token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': apiConfig.url
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        return {
            success: true,
            data: data
        };
    }
    catch (error) {
        console.error('Error getting client token by admin:', error);
        return {
            success: false,
            error: 'Failed to get client token'
        };
    }
});
exports.getClientTokenByAdmin = getClientTokenByAdmin;
// Получение свободных слотов для переноса урока с клиентским токеном
const getLessonAvailableSlotsWithClientToken = (lessonId, clientToken, apiConfig) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Получаем свободные слоты для урока используя клиентский токен
        const response = yield fetch(`${apiConfig.url}/govorikaalfa/api/last_lesson/${lessonId}/next_times`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${clientToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': apiConfig.url
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        return {
            success: true,
            data: data
        };
    }
    catch (error) {
        console.error('Error getting lesson available slots with client token:', error);
        return {
            success: false,
            error: 'Failed to get lesson available slots'
        };
    }
});
exports.getLessonAvailableSlotsWithClientToken = getLessonAvailableSlotsWithClientToken;
// Обновление урока (изменение времени/даты) с клиентским токеном
const updateLessonWithClientToken = (lessonId, lessonData, clientToken, apiConfig) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Обновляем урок используя клиентский токен
        const response = yield fetch(`${apiConfig.url}/govorikaalfa/api/last_lesson/${lessonId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${clientToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': apiConfig.url
            },
            body: JSON.stringify(lessonData)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        return {
            success: true,
            data: data
        };
    }
    catch (error) {
        console.error('Error updating lesson with client token:', error);
        return {
            success: false,
            error: 'Failed to update lesson'
        };
    }
});
exports.updateLessonWithClientToken = updateLessonWithClientToken;
// Получение данных клиента с клиентским токеном
const getCustomerWithClientToken = (clientToken, apiConfig) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Получаем данные клиента используя клиентский токен
        const response = yield fetch(`${apiConfig.url}/govorikaalfa/api/customer`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${clientToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': apiConfig.url
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        return {
            success: true,
            data: data
        };
    }
    catch (error) {
        console.error('Error getting customer with client token:', error);
        return {
            success: false,
            error: 'Failed to get customer data'
        };
    }
});
exports.getCustomerWithClientToken = getCustomerWithClientToken;
// Получение статистики тарифа с API Key
const getTarifStats = (tariffId, apiConfig) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Получаем статистику тарифа используя API Key
        const response = yield fetch(`${apiConfig.url}/api2/customer_tariff/stat/${tariffId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'da120237-3293-4017-a2d6-d5b31c873d38',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = yield response.json();
        // API возвращает { success: true, message: "OK", data: { total_lesson_count, lessons_done_count, ... } }
        const statsData = responseData.data || responseData;
        return {
            success: true,
            data: statsData
        };
    }
    catch (error) {
        console.error('Error getting tariff stats:', error);
        return {
            success: false,
            error: 'Failed to get tariff stats'
        };
    }
});
exports.getTarifStats = getTarifStats;
