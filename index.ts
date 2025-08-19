import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { getLastLessons, getCustomerInterfaceData, getCustomerTariffs } from './bumesApi';


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

const server = http.createServer(app);


server.listen(port, () => {
  console.log(`🚀 Сервер запущен на порту ${port}`);

});


