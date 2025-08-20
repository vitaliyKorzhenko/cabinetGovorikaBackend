enum Language {
    UK = 'uk',
    RU = 'ru',
    PL = 'pl',
    EN = 'en',
  } // Желательно иметь именно такой перечень языков
  
  export enum Environment {
    GOVORIKA = 'govorika', // Значения|Названия - зависят от реальных
    PROMOVA = 'promova', // Значения|Названия - зависят от реальных
    POLAND = 'poland', // Значения|Названия - зависят от реальных
  }
  
  enum SubscriptionType {
    NATIVE_SPEECH = 'native_speech', // Вариант для примера
  }
  
  enum LessonType {
    PRIVATE = 'private', // Значения|Названия - зависят от реальных
    GROUP = 'group', // Значения|Названия - зависят от реальных
  }
  
  enum LessonStatus {
    ACTIVE = 'active', // Значения|Названия - зависят от реальных
    FREEZE = 'freeze', // Значения|Названия - зависят от реальных
    SCHEDULED = 'scheduled', // Значения|Названия - зависят от реальных
  }
  
  interface Teacher {
    id: number;
    name: string;
  }
  
  interface AvailableLesson {
    id: number;
    type: LessonType; // Тип уроков
    total: number; // Количество доступных уроков в абонементе
    actual: number; // Количество пройденых уроков
  }
  
  interface NextLesson {
    id: number;
    type: number; // Тип урока
    start: string;
    start_customer: string
    start_customer_day: string;
    teacher: Teacher; // Преподаватель
    zoom_link: string; // Ссылка на урок в Zoom
    status: LessonStatus; // Статус урока
    time_to: string; // Время до урока
    lesson_language_id: string
  }
  
  interface LastLessonRecord {
    id: number;
    link: string; // Ссылка на запись урока
    link_to_all_records: string; // Ссылка на все записи
    lesson_date: Date; // Дата урока
    lesson_id: number; // Идентификатор урока
    lesson_type: LessonType; // Тип урока
  }
  
  interface RecommendedCourse {
    id: number;
    title: string; // Название курса/группового занятия
    description: string; // Описание курса/группового занятия
    banner: string; // Ссылка на банер курса/группового занятия
    duration: number; // Продолжительность одного урока курса/группового занятия
    price: number; // Цена (в долларах) курса/группового занятия
  }
  
  interface AvailableSubscription {
    id: number;
    type: SubscriptionType; // Скорее всего у абонемента есть тип, нужен перечень всех типов.
    duration: number; // Продолжительность одного занятия
    frequency: number; // Количество занятий в неделю
    name: string; // Название тарифа
    price: string; // Цена тарифа
    lessons_count: number; // Количество уроков в тарифе
    added: string; // Дата добавления тарифа
  }
  
  interface Subscription extends AvailableSubscription {
    id: number;
    start_date: Date; // Дата начала срока действия абонемента
    end_date: Date; // Дата конца срока действия абонемента
    is_active: boolean; // Статус активности абонемента
    teacher: Teacher; // Педагог который прикреплен к абонементу
    available_lessons: AvailableLesson[]; // Список доступных уроков в абонементе
  }


  export interface Tariff {
    id: number;
    template_id: number;
    name: string;
    begin_date: string;
    end_date: string;
    duration: number;
    custom_ind_period_limit: number;

  }
  
  export interface Child {
    id: number;
    name: string;
    age: number; // Возраст ребенка
    language: Language; // Язык ребенка
    balance: number; // Остаток на счету
    birthday: string; // Дата рождения ребенка
    email: string[]; // Email ребенка
    phone: string[]; // Телефон ребенка
    environment: Environment; // Окружение|Сервер - Добавить если дети могут находится в разных env-ах
    subscriptions: Subscription[] | null; // Список всех абонементов ребенка
    available_subscriptions: AvailableSubscription[] | null; // Список доступных абонементов к продаже
    next_lesson: NextLesson,
    last_record: LastLessonRecord | null; // Запись крайнего урока
    recommended_courses: RecommendedCourse[] | null; // Рекомендованные груповые занятия, и/или индивидуальные курсы для ребенка
    active_tariffs: Tariff[] | null; // Активные тарифы ребенка
    main_tariff: Tariff | null; // Основной тариф ребенка
    hobby:  string | null; // Хобби ребенка
    real_timezone: string | null; // Часовой пояс ребенка
    timezone: string;
  }
  
  interface ClientResponse {
    language: Language | null; // Язык клиента
    environment: Environment | null; // Окружение|Сервер - Добавить если дети не могут находится в разных env-ах
    children: Child[];
  }
  
  export default ClientResponse;
  