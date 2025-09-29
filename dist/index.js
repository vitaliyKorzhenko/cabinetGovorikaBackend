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
// API для получения данных клиента (токен + тарифы)
app.get('/api/customer-data/:customerId/:customerHash', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId, customerHash } = req.params;
        if (!customerId || !customerHash) {
            return res.status(400).json({
                success: false,
                error: 'Customer ID and Customer Hash are required'
            });
        }
        const customerData = yield (0, bumesApi_1.getCustomerTariffs)(customerId, customerHash);
        if (!customerData.success) {
            return res.status(404).json(customerData);
        }
        res.json(customerData);
    }
    catch (error) {
        console.error('Error in customer-data endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}));
// API для получения последних уроков
app.get('/api/last-lessons/:customerId/:customerHash', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId, customerHash } = req.params;
        if (!customerId || !customerHash) {
            return res.status(400).json({
                success: false,
                error: 'Customer ID and Customer Hash are required'
            });
        }
        const lessonsData = yield (0, bumesApi_1.getLastLessons)(customerId, customerHash);
        if (!lessonsData) {
            return res.status(404).json({
                success: false,
                error: 'Failed to get last lessons'
            });
        }
        res.json({
            success: true,
            data: lessonsData
        });
    }
    catch (error) {
        console.error('Error in last-lessons endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}));
// API для получения данных интерфейса клиента
app.get('/api/customer-info/:customerId/:customerHash', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId, customerHash } = req.params;
        if (!customerId || !customerHash) {
            return res.status(400).json({
                success: false,
                error: 'Customer ID and Customer Hash are required'
            });
        }
        const interfaceData = yield (0, bumesApi_1.getCustomerInterfaceData)(customerId, customerHash);
        res.json({
            success: true,
            data: interfaceData
        });
    }
    catch (error) {
        console.error('Error in customer-info endpoint:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
}));
// API для получения регулярных уроков клиента по предмету
app.get('/api/customer-regular-lessons/:customerId/:customerHash/:subjectId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId, customerHash, subjectId } = req.params;
        if (!customerId || !customerHash) {
            return res.status(400).json({
                success: false,
                error: 'Customer ID and Customer Hash are required'
            });
        }
        const subjectIdNum = parseInt(subjectId);
        if (isNaN(subjectIdNum)) {
            return res.status(400).json({
                success: false,
                error: 'Subject ID must be a valid number'
            });
        }
        // Сначала получаем клиентский токен
        const { getClientToken } = yield Promise.resolve().then(() => __importStar(require('./bumesApi')));
        const tokenData = yield getClientToken(customerId, customerHash);
        if (!tokenData || !tokenData.token) {
            return res.status(401).json({
                success: false,
                error: 'Failed to get client token'
            });
        }
        // Получаем регулярные уроки
        const regularLessons = yield (0, bumesApi_1.getCustomerRegularLessons)(customerId, subjectIdNum, tokenData.token);
        if (!regularLessons) {
            return res.status(404).json({
                success: false,
                error: 'Failed to get regular lessons'
            });
        }
        res.json({
            success: true,
            data: regularLessons
        });
    }
    catch (error) {
        console.error('Error in customer-regular-lessons endpoint:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
}));
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
// API для получения данных клиента по JWT токену
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
        const { customerId, from, to } = req.query;
        if (!customerId || !from || !to) {
            return res.status(400).json({
                success: false,
                error: 'customerId, from and to parameters are required'
            });
        }
        // Импортируем функцию прямо здесь
        const { getCustomerCalendar } = yield Promise.resolve().then(() => __importStar(require('./bumesApi')));
        const calendarData = yield getCustomerCalendar(customerId, from, to);
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
const server = http_1.default.createServer(app);
server.listen(port, () => {
    console.log(`🚀 Сервер запущен на порту ${port}`);
});
