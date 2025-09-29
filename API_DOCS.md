# API Документация

## Авторизация

Все API endpoints (кроме `/` и `/ping`) требуют авторизации через API токен.

**API Token:** `govorika-api-secure-token-2024-very-secure-random-string-xyz789`

### Способы передачи токена:

1. **Header Authorization:**
   ```
   Authorization: Bearer govorika-api-secure-token-2024-very-secure-random-string-xyz789
   ```

2. **Header X-API-Token:**
   ```
   X-API-Token: govorika-api-secure-token-2024-very-secure-random-string-xyz789
   ```

## Endpoints

### 1. Генерация JWT токена
**POST** `/api/generate-token`

**Body:**
```json
{
  "customerId": "51678",
  "customerHash": "05b68216fe909f3bf782c0e276617be1",
  "env": "production"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "url": "https://example.com/callback?token=..."
}
```

### 2. Получение данных клиента по ID и Hash
**GET** `/api/customer-info/:customerId/:customerHash`

**Example:**
```
GET /api/customer-info/51678/05b68216fe909f3bf782c0e276617be1
```

### 3. Получение данных клиента по JWT токену
**GET** `/api/customer-info-token/:token`

**Example:**
```
GET /api/customer-info-token/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Другие endpoints
- `GET /api/customer-data/:customerId/:customerHash`
- `GET /api/last-lessons/:customerId/:customerHash`
- `GET /api/customer-regular-lessons/:customerId/:customerHash/:subjectId`

## Примеры использования

### cURL с Authorization header:
```bash
curl -X GET "http://localhost:4048/api/customer-info/51678/05b68216fe909f3bf782c0e276617be1" \
  -H "Authorization: Bearer govorika-api-secure-token-2024-very-secure-random-string-xyz789"
```

### cURL с X-API-Token header:
```bash
curl -X GET "http://localhost:4048/api/customer-info/51678/05b68216fe909f3bf782c0e276617be1" \
  -H "X-API-Token: govorika-api-secure-token-2024-very-secure-random-string-xyz789"
```

### JavaScript fetch:
```javascript
fetch('http://localhost:4048/api/customer-info/51678/05b68216fe909f3bf782c0e276617be1', {
  headers: {
    'Authorization': 'Bearer govorika-api-secure-token-2024-very-secure-random-string-xyz789'
  }
})
```
