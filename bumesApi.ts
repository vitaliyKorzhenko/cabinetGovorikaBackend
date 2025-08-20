import ClientResponse, { Child, Environment, Tariff } from "./apiReference";

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

// Получение расписания тарифа клиента
export const getCustomerTariffSchedule = async (tariffId: string, clientToken: string): Promise<any> => {
    try {
        const response = await fetch(`${BASE_URL}/api/customer_tariff/${tariffId}/schedule`, {
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
        console.log('Customer tariff schedule received:', data);
        return data;
    } catch (error) {
        console.error('Error getting customer tariff schedule:', error);
        return null;
    }
}

// Получение расписания регулярных уроков клиента
export const getRegularLessonsSchedule = async (customerId: string, clientToken: string): Promise<any> => {
    try {
        const response = await fetch(`${BASE_URL}/api/regular_lessons/schedule/${customerId}`, {
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
        console.log('Regular lessons schedule received:', data);
        return data;
    } catch (error) {
        console.error('Error getting regular lessons schedule:', error);
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

// Получение регулярных уроков клиента по предмету
export const getCustomerRegularLessons = async (
    customerId: string, 
    subjectId: number, 
    clientToken: string
): Promise<any> => {
    try {
        let url: string;
        
        if (subjectId === 0) {
            // Если subjectId = 0, получаем все предметы
            url = `${BASE_URL}/api/customer_regular_lessons/${customerId}`;
        } else {
            // Если указан конкретный предмет
            url = `${BASE_URL}/api/customer_regular_lessons/${customerId}/${subjectId}`;
        }

        const response = await fetch(url, {
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
        console.log(`Regular lessons for customer ${customerId}, subject ${subjectId}:`, data);
        return data;
    } catch (error) {
        console.error('Error getting customer regular lessons:', error);
        return null;
    }
}

// Получение доступных тарифов для клиента
export const getAvailableTariffs = async (customerId: string): Promise<any> => {
    try {
        const response = await fetch(`${BASE_URL}/api/tariff?customer_id=${customerId}`, {
            method: 'GET',
            headers: {
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
        console.log(`Available tariffs for customer ${customerId}:`, data);
        
        // Маппинг данных в формат AvailableSubscription
        if (Array.isArray(data)) {
            const mappedTariffs = data.map((tariff: any) => ({
                id: tariff.id,
                type: tariff.type,
                duration: tariff.duration,
                frequency: tariff.lessons_count || 1, // Используем lessons_count как frequency
                name: tariff.name,
                price: tariff.price,
                lessons_count: tariff.lessons_count,
                added: tariff.added
            }));
            
            console.log(`Mapped tariffs for customer ${customerId}:`, mappedTariffs);
            return mappedTariffs;
        }
        
        return data;
    } catch (error) {
        console.error('Error getting available tariffs:', error);
        return null;
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
export const getCustomerInterfaceData = async (customerId: string, customerHash: string): Promise<ClientResponse> => {
    try {
        // Сначала получаем клиентский токен
        const tokenData = await getClientToken(customerId, customerHash);
        if (!tokenData || !tokenData.token) {
            throw new Error('Failed to get client token');
        }

        // Получаем данные клиента и уроков
        const lessonsData = await getLastLessons(customerId, customerHash);

        console.log('lessonsData', lessonsData);

        if (!lessonsData) {
            throw new Error('Failed to get customer data');
        }

        // Извлекаем данные детей из массива уроков
        const children: Child[] = await Promise.all(lessonsData.map(async (lesson: any) => {
            const customer = lesson.customer;
            const teacher = lesson.teacher;
            const active_tariffs = customer.active_tariffs;
            let main_tariff = customer.main_tariff ? customer.main_tariff : null;

            const active_tariffs_data: Tariff[] = active_tariffs.map((tariff: any) => {
                return {
                    id: tariff.id,
                    template_id: tariff.tariff.id,
                    name: tariff.name,
                    begin_date: tariff.begin_date,
                    end_date: tariff.end_date,
                    duration: tariff.duration,
                    custom_ind_period_limit: tariff.custom_ind_period_limit
                }
            });

            // Получаем доступные тарифы для ученика
            const availableTariffs = await getAvailableTariffs(customer.id.toString());

            return {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                birthday: customer.birthday,
                real_timezone: customer.timezone,
                timezone: customer.timezone,
                hobby: customer.hobby,
                age: customer.custom_age ? parseFloat(customer.custom_age) : 0,
                language: null, // Пока оставляем null, так как в данных нет информации о языке
                balance: customer.balance || 0,
                environment: Environment.GOVORIKA,
                available_subscriptions: availableTariffs, // Помещаем доступные тарифы
                last_record: null,
                recommended_courses: null,
                subscriptions: active_tariffs_data,
                next_lesson: {
                    id: lesson.id,
                    type: lesson.type,
                    start: lesson.start,
                    start_customer: lesson.start_customer,
                    start_customer_day: lesson.start_customer_day,
                    teacher: {
                        id: teacher.id,
                        name: teacher.name
                    },
                    zoom_link: lesson.web_join_url,
                    time_to: lesson.time_to,
                    lesson_language_id: lesson.lesson_language_id
                }
            };
        }));

        return {
            language: null,
            environment: Environment.GOVORIKA,
            children: children
        };

    } catch (error) {
        console.error('Error getting customer interface data:', error);
        throw error;
    }
}


