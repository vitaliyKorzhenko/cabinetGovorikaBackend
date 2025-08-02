
const MAIN_URL =  'https://main.okk24.com';

const BASE_URL = MAIN_URL;

// Константы для авторизации
const ADMIN_EMAIL = 'aleks.evdokimov+ai-bot-lid-dogim@gmail.com';
const ADMIN_PASSWORD = '1234567';

const triggerWebhookUrl = 'https://govorikavitaliydev.app.n8n.cloud/webhook/govorikaLead';


interface TokenData {
    token: string;
    token_type: string;
    expires_in: number;
}

interface Credentials {
    email: string;
    password: string;
}

let currentToken: TokenData | null = null;
let credentials: Credentials | null = null;

export const setCredentials = (email: string, password: string): void => {
    credentials = { email, password };
};

export const getCurrentToken = (): TokenData | null => {
    return currentToken;
};

export const setCurrentToken = (token: TokenData): void => {
    currentToken = token;
};

export const clearToken = (): void => {
    currentToken = null;
};



export const loginToAdminPanel = async (
    email: string = ADMIN_EMAIL,
    password: string = ADMIN_PASSWORD
): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> => {
    try {
        const response = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': BASE_URL,
                'Referer': `${BASE_URL}/login`
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!data.token) {
            return {
                success: false,
                error: data.message || 'Login failed'
            };
        }

        setCurrentToken({
            token: data.token,
            token_type: data.token_type,
            expires_in: data.expires_in
        });
        setCredentials(ADMIN_EMAIL, ADMIN_PASSWORD);

        return {
            success: true,
            data
        };
    } catch (error) {
        console.error('Error during login:', error);
        return {
            success: false,
            error: 'Failed to connect to server'
        };
    }
};

                  

// https://main.okk24.com/bumess/api/task/get

//get Task

export const getTask = async (): Promise<any> => {
    try {
        const loginResponse = await loginToAdminPanel();
        if (!loginResponse.success) {
            return null;
        }   

        const token = getCurrentToken();
        if (!token) {
            return null;
        }

        const response = await fetch(`${BASE_URL}/bumess/api/task/get`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token.token}`,
                'Accept': 'application/json',
                'Origin': BASE_URL,
                'Referer': `${BASE_URL}/login`
            }
        });
  
        if (!response) {
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return null;
    }
}

// https://main.okk24.com/bumess/api/task/get_quickly - get Task Quickly
export const getTaskQuickly = async (): Promise<any> => {
    try {
        const loginResponse = await loginToAdminPanel();
        if (!loginResponse.success) {
            return null;
        }
        const token = getCurrentToken();
        if (!token) {
            return null;
        }
        const response = await fetch(`${BASE_URL}/bumess/api/task/get_quickly`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token.token}`,
                'Accept': 'application/json',
                'Origin': BASE_URL,
                'Referer': `${BASE_URL}/login`
            }
        });
  
        if (!response) {
            return null;
        }

        const data = await response.json();
        console.log('getTaskQuickly', data);
        return data;
    } catch (error) {
        return null;
    }
}

export const triggerN8nWebhook = async (): Promise<any> => {
    try {
        const response = await fetch(triggerWebhookUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Webhook triggered successfully:', data);
        return data;
    } catch (error) {
        console.error('Error triggering n8n webhook:', error);
        return null;
    }
}

// Получение клиентского токена
export const getClientToken = async (customerId: string, customerHash: string): Promise<any> => {
    try {
        // Сначала получаем админский токен
        const adminLoginResponse = await loginToAdminPanel();
        if (!adminLoginResponse.success) {
            return null;
        }

        const adminToken = getCurrentToken();
        if (!adminToken) {
            return null;
        }

        // Получаем клиентский токен используя админский токен
        const response = await fetch(`${BASE_URL}/govorikaalfa/api/login/${customerId}/${customerHash}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminToken.token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': BASE_URL,
                'Referer': `${BASE_URL}/login`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Client token received:', data);
        return data;
    } catch (error) {
        console.error('Error getting client token:', error);
        return null;
    }
}

// Получение тарифов клиента
export const getCustomerTariffs = async (customerId: string, clientToken: string): Promise<any> => {
    try {
        const response = await fetch(`${BASE_URL}/api/customer_tariff_customer/all/${customerId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${clientToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': BASE_URL,
                'Referer': `${BASE_URL}/login`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Customer tariffs received:', data);
        return data;
    } catch (error) {
        console.error('Error getting customer tariffs:', error);
        return null;
    }
}

// Получение последних уроков
export const getLastLessons = async (customerId: string, customerHash: string): Promise<any> => {
    try {
        // Сначала получаем клиентский токен
        const tokenData = await getClientToken(customerId, customerHash);
        if (!tokenData || !tokenData.token) {
            return {
                success: false,
                error: 'Failed to get client token'
            };
        }

        // Получаем последние уроки используя клиентский токен
        const response = await fetch(`${BASE_URL}/govorikaalfa/api/last_lessons`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenData.token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': BASE_URL,
                'Referer': `${BASE_URL}/login`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Last lessons received:', data);
        return data;
    } catch (error) {
        console.error('Error getting last lessons:', error);
        return null;
    }
}

// Комбинированная функция для получения токена и тарифов
export const getCustomerData = async (customerId: string, customerHash: string): Promise<any> => {
    try {
        // Сначала получаем клиентский токен
        const tokenData = await getClientToken(customerId, customerHash);
        if (!tokenData || !tokenData.token) {
            return {
                success: false,
                error: 'Failed to get client token'
            };
        }

        // Затем получаем тарифы клиента
        const tariffsData = await getCustomerTariffs(customerId, tokenData.token);
        if (!tariffsData) {
            return {
                success: false,
                error: 'Failed to get customer tariffs'
            };
        }

        return {
            success: true,
            data: tariffsData
        };
    } catch (error) {
        console.error('Error getting customer data:', error);
        return {
            success: false,
            error: 'Failed to get customer data'
        };
    }
}


interface CustomerInterfaceData {
    customer: {
        name: string;
        id: number;
        game_url: string;    
    };
    balance: {
        balance: number;
        balance_status: string;
        balance_status_updated: string;
    }
    nextLesson: {
        start_customer: string;
        start_customer_day: string;
        time_to: string;
        web_join_url: string;
        can_move: boolean;
        free_cancelation: boolean;
        subject_id: number;
    };
    teacher: {
        name: string;
        id: number;
    };
}

// Получение структурированных данных клиента для интерфейса
export const getCustomerInterfaceData = async (customerId: string, customerHash: string): Promise<CustomerInterfaceData> => {
    try {
        // Сначала получаем клиентский токен
        const tokenData = await getClientToken(customerId, customerHash);
        if (!tokenData || !tokenData.token) {
            throw new Error('Failed to get client token');
        }

        // Получаем данные клиента и уроков
        const lessonsData = await getLastLessons(customerId, customerHash);

        if (!lessonsData) {
            throw new Error('Failed to get customer data');
        }

        console.log('lessonsData structure:', JSON.stringify(lessonsData, null, 2));

        // Структурируем данные для интерфейса
        const customer = lessonsData[0]?.customer;
        const nextLesson = lessonsData[0]; // Берем первый урок из массива
        const teacher = nextLesson?.teacher;

        console.log('customer:', customer);
        console.log('nextLesson:', nextLesson);

        if (!customer || !nextLesson) {
            throw new Error('Customer or lesson data not found');
        }

        // Форматируем данные для интерфейса согласно CustomerInterfaceData
        const interfaceData: CustomerInterfaceData = {
            customer: {
                name: customer.name,
                id: customer.id,
                game_url: nextLesson.game_url || ''
            },
            balance: {
                balance: customer.balance,
                balance_status: customer.balance_status,
                balance_status_updated: customer.balance_status_updated
            },
            nextLesson: {
                start_customer: nextLesson.start_customer,
                start_customer_day: nextLesson.start_customer_day,
                time_to: nextLesson.time_to,
                web_join_url: nextLesson.web_join_url,
                can_move: nextLesson.can_move,
                free_cancelation: nextLesson.free_cancelation,
                subject_id: nextLesson.subject_id
            },
            teacher: {
                name: teacher?.name || 'Не указан',
                id: teacher?.id || 0
            }
        };

        return interfaceData;
    } catch (error) {
        console.error('Error getting customer interface data:', error);
        throw error;
    }
}


