enum Language {
    UK = 'uk',
    RU = 'ru',
    PL = 'pl',
    EN = 'en',
  } // Желательно иметь именно такой перечень языков
  
  enum Role {
    USER = 'user',
    ADMIN = 'admin',
  }
  
  enum Environment {
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
    type: LessonType; // Тип урока
    start_date: Date; // Дата начала урока
    teacher: Teacher; // Преподаватель
    zoom_link: string; // Ссылка на урок в Zoom
    status: LessonStatus; // Статус урока
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
  
  
  
  interface Subscription {
    id: number;
    start_date: Date; // Дата начала срока действия абонемента
    end_date: Date; // Дата конца срока действия абонемента
    is_active: boolean; // Статус активности абонемента
    teacher: Teacher; // Педагог который прикреплен к абонементу
    type: SubscriptionType; // Скорее всего у абонемента есть тип, нужен перечень всех типов.
    available_lessons: AvailableLesson[]; // Список доступных уроков в абонементе
    duration: number; // Продолжительность одного занятия
    frequency: number; // Количество занятий в неделю
  }
  
  interface Child {
    id: number;
    name: string;
    age: number; // Возраст ребенка
    language: Language; // Язык ребенка
    balance: number; // Остаток на счету
    environment: Environment; // Окружение|Сервер - Добавить если дети могут находится в разных env-ах
    subscriptions: Subscription[]; // Список всех абонементов ребенка
    next_lesson: NextLesson[]; // Ближайший урок
    last_record: LastLessonRecord; // Запись крайнего урока
    recommended_courses: RecommendedCourse[]; // Рекомендованные груповые занятия, и/или индивидуальные курсы для ребенка
  }
  
  interface ClientResponse {
    id: number;
    name: string;
    language: Language; // Язык клиента
    environment: Environment; // Окружение|Сервер - Добавить если дети не могут находится в разных env-ах
    role: Role;
    children: Child[];
  }
  
  export default ClientResponse;
  