import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { getLastLessons, getCustomerInterfaceData, getCustomerTariffs, getCustomerRegularLessons, getClientTokenByAdmin, getLessonAvailableSlotsWithClientToken, updateLessonWithClientToken } from './bumesApi';
import { getAdminConfig } from './apiConfig';


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

// Middleware для проверки API токена
const authenticateApiToken = (req: any, res: any, next: any) => {
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
  res.send('TEST API AI BOT!!!')
});

//ping
app.get('/ping', (req, res) => {
  res.send('PONG');
});

// API для генерации JWT токена
app.post('/api/generate-token', async (req, res) => {
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
    console.warn("====== getCustomerDataByToken ======", token);
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

// API для получения календаря клиента
app.get('/api/customer-calendar', async (req, res) => {
  try {
    const { customerId, from, to, env } = req.query;
    
    if (!customerId || !from || !to) {
      return res.status(400).json({
        success: false,
        error: 'customerId, from and to parameters are required'
      });
    }

    // Импортируем функцию прямо здесь
    const { getCustomerCalendar } = await import('./bumesApi');
    let apiConfig = getAdminConfig(env as string);
    const calendarData = await getCustomerCalendar(customerId as string, from as string, to as string, apiConfig);
    
    if (calendarData.success === false) {
      return res.status(500).json(calendarData);
    }

    res.json(calendarData);
  } catch (error) {
    console.error('Error in customer-calendar endpoint:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// API для получения свободных слотов урока с прямыми параметрами
app.get('/api/lesson-available-slots/:lessonId/:customerId/:customerHash/:env', async (req, res) => {
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
    let apiConfig = getAdminConfig(env as string);
    const clientTokenResult = await getClientTokenByAdmin(customerId, customerHash, apiConfig);
    if (!clientTokenResult.success || !clientTokenResult.data?.token) {
      return res.status(500).json({
        success: false,
        error: 'Failed to get client token'
      });
    }

    const clientToken = clientTokenResult.data.token;

    // Получаем свободные слоты для урока используя метод из bumesApi
    const slotsData = await getLessonAvailableSlotsWithClientToken(lessonId, clientToken, apiConfig);
    
    if (!slotsData.success) {
      return res.status(500).json(slotsData);
    }

    res.json(slotsData);
  } catch (error) {
    console.error('Error in lesson-available-slots-direct endpoint:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// API для обновления урока (изменение времени/даты)
app.put('/api/update-lesson/:lessonId/:customerId/:customerHash/:env', async (req, res) => {
  try {
    const { lessonId, customerId, customerHash, env } = req.params;
    const lessonData = req.body;
    let apiConfig = getAdminConfig(env as string);

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
    const clientTokenResult = await getClientTokenByAdmin(customerId, customerHash, apiConfig);
    if (!clientTokenResult.success || !clientTokenResult.data?.token) {
      return res.status(500).json({
        success: false,
        error: 'Failed to get client token'
      });
    }

    const clientToken = clientTokenResult.data.token;

    // Обновляем урок используя метод из bumesApi
    const updateResult = await updateLessonWithClientToken(lessonId, lessonData, clientToken, apiConfig);
    
    if (!updateResult.success) {
      return res.status(500).json(updateResult);
    }

    res.json(updateResult);
  } catch (error) {
    console.error('Error in update-lesson-direct endpoint:', error);
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


