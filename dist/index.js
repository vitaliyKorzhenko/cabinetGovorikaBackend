"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const bumesApi_1 = require("./bumesApi");
const apiConfig_1 = require("./apiConfig");
// спсбио а дайте его логин пароль
// aleks.evdokimov+ai-bot-client-dogim@gmail.com
// 1234567
// Инициализируем dotenv
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4048;
// Подключаем middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Middleware для проверки API токена
const authenticateApiToken = (req, res, next) => {
    const apiToken = req.headers['authorization'] || req.headers['x-api-token'];
    const validToken = process.env.API_TOKEN;
    // Проверяем, что это не базовые endpoints (ping, root)
    if (req.path === '/' || req.path === '/ping') {
        return next();
    }
    if (!apiToken || !validToken) {
        return res.status(401).json({
            success: false,
            error: 'API token is required'
        });
    }
    // Убираем 'Bearer ' если есть
    const token = apiToken.replace('Bearer ', '');
    if (token !== validToken) {
        return res.status(401).json({
            success: false,
            error: 'Invalid API token'
        });
    }
    next();
};
// Применяем middleware ко всем API routes
app.use('/api', authenticateApiToken);
//default get route
app.get('/', (req, res) => {
    res.send('TEST API AI BOT!!!');
});
//ping
app.get('/ping', (req, res) => {
    res.send('PONG');
});
// API для генерации JWT токена
app.post('/api/generate-token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId, customerHash, env = "govorika" } = req.body;
        console.warn("====== generate-token ======", req.body);
        if (!customerId || !customerHash) {
            return res.status(400).json({
                success: false,
                error: 'Customer ID and Customer Hash are required'
            });
        }
        // Импортируем функцию прямо здесь
        const { generateCustomerToken } = yield Promise.resolve().then(() => __importStar(require('./bumesApi')));
        const tokenResult = yield generateCustomerToken(customerId, customerHash, env);
        if (!tokenResult.success) {
            return res.status(500).json(tokenResult);
        }
        res.json(tokenResult);
    }
    catch (error) {
        console.error('Error in generate-token endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}));
// API для получения данных клиента по JWT токену (из URL параметра)
app.get('/api/customer-info-token/:token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Token is required'
            });
        }
        // Импортируем функцию прямо здесь
        const { getCustomerDataByToken } = yield Promise.resolve().then(() => __importStar(require('./bumesApi')));
        console.warn("====== getCustomerDataByToken ======", token);
        const customerData = yield getCustomerDataByToken(token);
        res.json({
            success: true,
            data: customerData
        });
    }
    catch (error) {
        console.error('Error in customer-info-token endpoint:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
}));
// API для получения календаря клиента
app.get('/api/customer-calendar', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId, from, to, env } = req.query;
        if (!customerId || !from || !to) {
            return res.status(400).json({
                success: false,
                error: 'customerId, from and to parameters are required'
            });
        }
        // Импортируем функцию прямо здесь
        const { getCustomerCalendar } = yield Promise.resolve().then(() => __importStar(require('./bumesApi')));
        let apiConfig = (0, apiConfig_1.getAdminConfig)(env);
        const calendarData = yield getCustomerCalendar(customerId, from, to, apiConfig);
        if (calendarData.success === false) {
            return res.status(500).json(calendarData);
        }
        res.json(calendarData);
    }
    catch (error) {
        console.error('Error in customer-calendar endpoint:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
}));
// API для получения свободных слотов урока с прямыми параметрами
app.get('/api/lesson-available-slots/:lessonId/:customerId/:customerHash/:env', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { lessonId, customerId, customerHash, env } = req.params;
        if (!lessonId || !customerId || !customerHash) {
            return res.status(400).json({
                success: false,
                error: 'Lesson ID, Customer ID and Customer Hash are required'
            });
        }
        console.warn("====== lesson-available-slots-direct ======", lessonId, customerId, customerHash);
        // Получаем клиентский токен через админский токен
        let apiConfig = (0, apiConfig_1.getAdminConfig)(env);
        const clientTokenResult = yield (0, bumesApi_1.getClientTokenByAdmin)(customerId, customerHash, apiConfig);
        if (!clientTokenResult.success || !((_a = clientTokenResult.data) === null || _a === void 0 ? void 0 : _a.token)) {
            return res.status(500).json({
                success: false,
                error: 'Failed to get client token'
            });
        }
        const clientToken = clientTokenResult.data.token;
        // Получаем свободные слоты для урока используя метод из bumesApi
        const slotsData = yield (0, bumesApi_1.getLessonAvailableSlotsWithClientToken)(lessonId, clientToken, apiConfig);
        if (!slotsData.success) {
            return res.status(500).json(slotsData);
        }
        res.json(slotsData);
    }
    catch (error) {
        console.error('Error in lesson-available-slots-direct endpoint:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
}));
// API для обновления урока (изменение времени/даты)
app.put('/api/update-lesson/:lessonId/:customerId/:customerHash/:env', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { lessonId, customerId, customerHash, env } = req.params;
        const lessonData = req.body;
        let apiConfig = (0, apiConfig_1.getAdminConfig)(env);
        if (!lessonId || !customerId || !customerHash) {
            return res.status(400).json({
                success: false,
                error: 'Lesson ID, Customer ID and Customer Hash are required'
            });
        }
        if (!lessonData || Object.keys(lessonData).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Lesson data is required in request body'
            });
        }
        console.warn("====== update-lesson-direct ======", lessonId, customerId, customerHash, lessonData);
        // Получаем клиентский токен через админский токен
        const clientTokenResult = yield (0, bumesApi_1.getClientTokenByAdmin)(customerId, customerHash, apiConfig);
        if (!clientTokenResult.success || !((_a = clientTokenResult.data) === null || _a === void 0 ? void 0 : _a.token)) {
            return res.status(500).json({
                success: false,
                error: 'Failed to get client token'
            });
        }
        const clientToken = clientTokenResult.data.token;
        // Обновляем урок используя метод из bumesApi
        const updateResult = yield (0, bumesApi_1.updateLessonWithClientToken)(lessonId, lessonData, clientToken, apiConfig);
        if (!updateResult.success) {
            return res.status(500).json(updateResult);
        }
        res.json(updateResult);
    }
    catch (error) {
        console.error('Error in update-lesson-direct endpoint:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
}));
const server = http_1.default.createServer(app);
server.listen(port, () => {
    console.log(`🚀 Сервер запущен на порту ${port}`);
});
