import ClientResponse, { Child, Environment, Parent, Role, Tariff } from "./apiReference";
import jwt from "jsonwebtoken";

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

interface JwtPayload {
    clientId: string;
    hash: string;
    env: string;
}

interface JwtTokenResponse {
    success: boolean;
    token?: string;
    url?: string;
    error?: string;
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
       
        
        // Маппинг данных в формат Subscription с regular_lessons
        let tarrifData = data.data;
        let  mappedTariffs;
        if ( tarrifData && Array.isArray(tarrifData)) {
            mappedTariffs = tarrifData.map((tariff: any) => ({
                id: tariff.id,
                type: tariff.type,
                name: tariff.name,
                price: tariff.price,
                duration: tariff.duration || 30, // По умолчанию 30 минут
                start_date: tariff.begin_date_c,
                end_date: tariff.end_date_c,
                is_active: tariff.is_active === 1,
                custom_ind_period_limit: tariff.custom_ind_period_limit ? tariff.custom_ind_period_limit : 0,
                is_expire_soon: tariff.is_expire_soon == '1' ? true : false,
                tariff_type: tariff.tariff ? tariff.tariff.tariff_type : '',
                regular_lessons: tariff.regular_lessons ? tariff.regular_lessons.map((lesson: any) => ({
                    id: lesson.id,
                    alfa_customer_id: lesson.alfa_customer_id,
                    lesson_type_id: lesson.lesson_type_id,
                    subject_id: lesson.subject_id,
                    day: lesson.day,
                    teacher_id: lesson.teacher_id,
                    external_id: lesson.external_id,
                    b_date: lesson.b_date,
                    e_date: lesson.e_date,
                    time_from: lesson.time_from,
                    time_to: lesson.time_to,
                    created_at: lesson.created_at,
                    updated_at: lesson.updated_at,
                    is_active: lesson.is_active,
                    need_prolong: lesson.need_prolong,
                    parent_id: lesson.parent_id,
                    created_by: lesson.created_by,
                    expired: lesson.expired,
                    customerString: lesson.customerString,
                    adminString: lesson.adminString,
                    beginLocalHuman: lesson.beginLocalHuman,
                    endLocalHuman: lesson.endLocalHuman
                })) : [] // Расписание регулярных урок с нужными полями
            }));
            
            return mappedTariffs;
        }
        return mappedTariffs;
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
            
            return mappedTariffs;
        }
        
        return data;
    } catch (error) {
        console.error('Error getting available tariffs:', error);
        return null;
    }
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


        if (!lessonsData) {
            throw new Error('Failed to get customer data');
        }

        // Извлекаем данные детей из массива уроков
        let parent: Parent | null = null;
        //first lesson data log
        const children: Child[] = await Promise.all(lessonsData.map(async (lesson: any) => {
            // console.warn("====== lesson ======", lesson);
            const customer = lesson.customer;
            const teacher = lesson.teacher;
           
            // Получаем тарифы клиента с расписанием через API
            const customerTariffs = await getCustomerTariffs(customer.id.toString(), tokenData.token);

            // Получаем доступные тарифы для ученика
            const availableTariffs = await getAvailableTariffs(customer.id.toString());

            // Получаем встречи клиента (используем индивидуальный c_hash каждого customer)
            const customerSpecificHash = customer.c_hash || customerHash; // Fallback на общий hash если нет индивидуального
            const meetingsData = await getCustomerMeetings(customer.id.toString(), customerSpecificHash);

            // Обрабатываем данные встреч
            let lastRecord = null;
            let allRecords = [];
            
            if (meetingsData && meetingsData.success !== false && meetingsData.meetings && Array.isArray(meetingsData.meetings)) {
                allRecords = meetingsData.meetings;
                // Берем последнюю запись (первую в массиве, если отсортированы по дате)
                lastRecord = meetingsData.meetings.length > 0 ? meetingsData.meetings[0] : null;
            }

            parent = {
                id: customer.parent_id,
                name: customer.kid_parent_name
            };

            return {
                
                id: customer.id,
                game_url: lesson.game_url,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                c_hash: customer.c_hash,
                customer_hash: customer.customer_hash,
                custom_hash: customer.custom_hash,
                calendar_hash: customer.calendar_hash,
                birthday: customer.birthday,
                real_timezone: customer.timezone,
                timezone: customer.timezone,
                hobby: customer.hobby,
                age: customer.custom_age ? parseFloat(customer.custom_age) : 0,
                language: null, // Пока оставляем null, так как в данных нет информации о языке
                balance: customer.balance || 0,
                environment: Environment.GOVORIKA,
               // available_subscriptions: availableTariffs, // Помещаем доступные тарифы
                last_record: lastRecord,
                all_records: allRecords,
                recommended_courses: null,
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
                },
                subscriptions: customerTariffs, // Помещаем тарифы с расписанием из API
            };
        }));

        return {
            environment: Environment.GOVORIKA,
            parent: parent,
            role: Role.USER,
            children: children
        };

    } catch (error) {
        console.error('Error getting customer interface data:', error);
        throw error;
    }
}

// Генерация JWT токена для клиента
export const generateCustomerToken = async (
    customerId: string, 
    customerHash: string, 
    env: string = "production"
): Promise<JwtTokenResponse> => {
    try {
        const secretKey = process.env.JWT_SECRET;
        
        if (!secretKey) {
            return {
                success: false,
                error: 'JWT_SECRET не установлен в переменных окружения'
            };
        }

        const payload: JwtPayload = {
            clientId: customerId,
            hash: customerHash,
            env: env
        };

        // Генерируем токен без срока истечения (вечный токен)
        const token = jwt.sign(payload, secretKey);

        // Формируем URL для фронта
        const url = `https://example.com/callback?token=${token}`;

        return {
            success: true,
            token: token,
            url: url
        };
    } catch (error) {
        console.error('Error generating customer token:', error);
        return {
            success: false,
            error: 'Ошибка при генерации токена'
        };
    }
}

// Расшифровка JWT токена
export const decodeCustomerToken = (token: string): { success: boolean; data?: JwtPayload; error?: string } => {
    try {
        const secretKey = process.env.JWT_SECRET;
        
        if (!secretKey) {
            return {
                success: false,
                error: 'JWT_SECRET не установлен в переменных окружения'
            };
        }

        const decoded = jwt.verify(token, secretKey) as JwtPayload;
        
        return {
            success: true,
            data: decoded
        };
    } catch (error) {
        console.error('Error decoding customer token:', error);
        return {
            success: false,
            error: 'Неверный или истекший токен'
        };
    }
}

// Получение данных клиента по JWT токену
export const getCustomerDataByToken = async (token: string): Promise<ClientResponse> => {
    try {
        // Расшифровываем токен
        const tokenData = decodeCustomerToken(token);
        
        if (!tokenData.success || !tokenData.data) {
            throw new Error(tokenData.error || 'Ошибка расшифровки токена');
        }

        const { clientId: customerId, hash: customerHash } = tokenData.data;
        
        // Получаем данные клиента используя существующую функцию
        return await getCustomerInterfaceData(customerId, customerHash);
        
    } catch (error) {
        console.error('Error getting customer data by token:', error);
        throw error;
    }
}

// Получение календаря клиента
export const getCustomerCalendar = async (customerId: string, startDate: string, endDate: string): Promise<any> => {
    try {
        const url = `${BASE_URL}/api2/alfa_calendars?customerId=${customerId}&from=${startDate}&to=${endDate}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'da120237-3293-4017-a2d6-d5b31c873d38',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('Error getting customer calendar:', error);
        return {
            success: false,
            error: 'Failed to get customer calendar'
        };
    }
}

// Получение встреч клиента
export const getCustomerMeetings = async (customerId: string, customerHash: string): Promise<any> => {
    try {
        // Сначала получаем клиентский токен
        const tokenData = await getClientToken(customerId, customerHash);
        if (!tokenData || !tokenData.token) {
            return {
                success: false,
                error: 'Failed to get client token'
            };
        }

        // Получаем встречи клиента
        const response = await fetch(`${BASE_URL}/govorikaalfa/api/customer/${customerId}/${customerHash}/meetings`, {
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
        console.error('Error getting customer meetings:', error);
        return {
            success: false,
            error: 'Failed to get customer meetings'
        };
    }
}


