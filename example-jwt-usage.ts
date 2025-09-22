import { generateCustomerToken } from './bumesApi';

// Пример использования нового метода generateCustomerToken
async function exampleUsage() {
    try {
        // Установите JWT_SECRET в переменных окружения
        // process.env.JWT_SECRET = 'your-secret-key-here';
        
        const customerId = "123";
        const customerHash = "abc123";
        const env = "production";
        
        const result = await generateCustomerToken(customerId, customerHash, env);
        
        if (result.success) {
            console.log("Токен успешно сгенерирован:");
            console.log("Token:", result.token);
            console.log("URL:", result.url);
        } else {
            console.error("Ошибка:", result.error);
        }
    } catch (error) {
        console.error("Ошибка выполнения:", error);
    }
}

// Запуск примера
exampleUsage();
