require('dotenv').config();
const jwt = require('jsonwebtoken');

console.log('JWT_SECRET из .env:', process.env.JWT_SECRET);

const payload = { 
    clientId: "123", 
    hash: "abc123", 
    env: "production" 
};

const token = jwt.sign(payload, process.env.JWT_SECRET);
console.log('Сгенерированный токен:', token);

const url = `https://example.com/callback?token=${token}`;
console.log('Ссылка для фронта:', url);
