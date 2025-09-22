"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_CONFIG = void 0;
// Конфигурация для JWT токенов
exports.JWT_CONFIG = {
    SECRET: 'govorika-super-secret-jwt-key-2024-very-secure-random-string-12345',
    // Альтернативно, можно использовать переменную окружения:
    // SECRET: process.env.JWT_SECRET || 'govorika-super-secret-jwt-key-2024-very-secure-random-string-12345'
};
