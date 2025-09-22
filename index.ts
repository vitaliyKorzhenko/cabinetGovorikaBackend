import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { getLastLessons, getCustomerInterfaceData, getCustomerTariffs, getCustomerRegularLessons } from './bumesApi';


// спсбио а дайте его логин пароль


// aleks.evdokimov+ai-bot-client-dogim@gmail.com
// 1234567

// Инициализируем dotenv
dotenv.config();

const app = express();
const port = process.env.PORT || 4048;


// Подключаем middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));



//default get route
app.get('/', (req, res) => {
  res.send('TEST API AI BOT!!!')
});

//ping
app.get('/ping', (req, res) => {
  res.send('PONG');
});

// API для получения данных клиента (токен + тарифы)
app.get('/api/customer-data/:customerId/:customerHash', async (req, res) => {
  try {
    const { customerId, customerHash } = req.params;
    
    if (!customerId || !customerHash) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID and Customer Hash are required'
      });
    }

    const customerData = await getCustomerTariffs(customerId, customerHash);
    
    if (!customerData.success) {
      return res.status(404).json(customerData);
    }

    res.json(customerData);
  } catch (error) {
    console.error('Error in customer-data endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// API для получения последних уроков
app.get('/api/last-lessons/:customerId/:customerHash', async (req, res) => {
  try {
    const { customerId, customerHash } = req.params;
    
    if (!customerId || !customerHash) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID and Customer Hash are required'
      });
    }

    const lessonsData = await getLastLessons(customerId, customerHash);
    
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
  } catch (error) {
    console.error('Error in last-lessons endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// API для получения данных интерфейса клиента
app.get('/api/customer-info/:customerId/:customerHash', async (req, res) => {
  try {
    const { customerId, customerHash } = req.params;
    
    if (!customerId || !customerHash) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID and Customer Hash are required'
      });
    }

    const interfaceData = await getCustomerInterfaceData(customerId, customerHash);
    
    res.json({
      success: true,
      data: interfaceData
    });
  } catch (error) {
    console.error('Error in customer-info endpoint:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// API для получения регулярных уроков клиента по предмету
app.get('/api/customer-regular-lessons/:customerId/:customerHash/:subjectId', async (req, res) => {
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
    const { getClientToken } = await import('./bumesApi');
    const tokenData = await getClientToken(customerId, customerHash);
    
    if (!tokenData || !tokenData.token) {
      return res.status(401).json({
        success: false,
        error: 'Failed to get client token'
      });
    }

    // Получаем регулярные уроки
    const regularLessons = await getCustomerRegularLessons(customerId, subjectIdNum, tokenData.token);
    
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
  } catch (error) {
    console.error('Error in customer-regular-lessons endpoint:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// API для генерации JWT токена
app.post('/api/generate-token', async (req, res) => {
  try {
    const { customerId, customerHash, env = "govorika" } = req.body;
    
    if (!customerId || !customerHash) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID and Customer Hash are required'
      });
    }

    // Импортируем функцию прямо здесь
    const { generateCustomerToken } = await import('./bumesApi');
    const tokenResult = await generateCustomerToken(customerId, customerHash, env);
    
    if (!tokenResult.success) {
      return res.status(500).json(tokenResult);
    }

    res.json(tokenResult);
  } catch (error) {
    console.error('Error in generate-token endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// API для получения данных клиента по JWT токену
app.get('/api/customer-info-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }

    // Импортируем функцию прямо здесь
    const { getCustomerDataByToken } = await import('./bumesApi');
    const customerData = await getCustomerDataByToken(token);
    
    res.json({
      success: true,
      data: customerData
    });
  } catch (error) {
    console.error('Error in customer-info-token endpoint:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

const server = http.createServer(app);


server.listen(port, () => {
  console.log(`🚀 Сервер запущен на порту ${port}`);

});


