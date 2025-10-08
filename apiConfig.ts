
// ADMIN FOR MAIN SOURCE

export interface AdminConfig {
    url: string;
    email: string;
    password: string;
}

export function getAdminConfig(source: string): AdminConfig  {
    switch (source) {
        case 'govorika':
            return { url: mainUrl, email: adminEmail, password: adminPassword };
        case 'promova':
            return { url: promovaUrl, email: promovaAdminEmail, password: promovaAdminPassword };
        case 'poland':
            return { url: polandUrl, email: polandAdminEmail, password: polandAdminPassword };
    }
    //for default return main config
    return { url: mainUrl, email: adminEmail, password: adminPassword };;
}


export const mainUrl = 'https://main.okk24.com';

export const adminEmail = 'aleks.evdokimov+ai-bot-lid-dogim@gmail.com';
export const adminPassword = '1234567';



// ADMIN FOR PROMOVA SOURCE  server.okk24.com
export const promovaUrl = 'https://server.okk24.com';
export const promovaAdminEmail = 'aleks.evdokimov+ai-bot-client-otmena@gmail.com';
export const promovaAdminPassword = '1234567';


//POLAND SOURCE test.okk24.com
export const polandUrl = 'https://test.okk24.com';
export const polandAdminEmail = 'aleks.evdokimov+ai-bot-clientPL@gmail.com';
export const polandAdminPassword = '1234567';






