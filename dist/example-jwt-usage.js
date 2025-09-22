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
const bumesApi_1 = require("./bumesApi");
// Пример использования нового метода generateCustomerToken
function exampleUsage() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Установите JWT_SECRET в переменных окружения
            // process.env.JWT_SECRET = 'your-secret-key-here';
            const customerId = "123";
            const customerHash = "abc123";
            const env = "production";
            const result = yield (0, bumesApi_1.generateCustomerToken)(customerId, customerHash, env);
            if (result.success) {
                console.log("Токен успешно сгенерирован:");
                console.log("Token:", result.token);
                console.log("URL:", result.url);
            }
            else {
                console.error("Ошибка:", result.error);
            }
        }
        catch (error) {
            console.error("Ошибка выполнения:", error);
        }
    });
}
// Запуск примера
exampleUsage();
