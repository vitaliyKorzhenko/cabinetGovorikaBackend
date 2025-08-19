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
const server = http_1.default.createServer(app);
server.listen(port, () => {
    console.log(`🚀 Сервер запущен на порту ${port}`);
});
