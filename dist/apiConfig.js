"use strict";
// ADMIN FOR MAIN SOURCE
Object.defineProperty(exports, "__esModule", { value: true });
exports.polandAdminPassword = exports.polandAdminEmail = exports.polandUrl = exports.promovaAdminPassword = exports.promovaAdminEmail = exports.promovaUrl = exports.adminPassword = exports.adminEmail = exports.mainUrl = void 0;
exports.getAdminConfig = getAdminConfig;
function getAdminConfig(source) {
    switch (source) {
        case 'govorika':
            return { url: exports.mainUrl, email: exports.adminEmail, password: exports.adminPassword };
        case 'promova':
            return { url: exports.promovaUrl, email: exports.promovaAdminEmail, password: exports.promovaAdminPassword };
        case 'poland':
            return { url: exports.polandUrl, email: exports.polandAdminEmail, password: exports.polandAdminPassword };
    }
    //for default return main config
    return { url: exports.mainUrl, email: exports.adminEmail, password: exports.adminPassword };
    ;
}
exports.mainUrl = 'https://main.okk24.com';
exports.adminEmail = 'aleks.evdokimov+ai-bot-lid-dogim@gmail.com';
exports.adminPassword = '1234567';
// ADMIN FOR PROMOVA SOURCE  server.okk24.com
exports.promovaUrl = 'https://server.okk24.com';
exports.promovaAdminEmail = 'aleks.evdokimov+ai-bot-client-otmena@gmail.com';
exports.promovaAdminPassword = '1234567';
//POLAND SOURCE test.okk24.com
exports.polandUrl = 'https://test.okk24.com';
exports.polandAdminEmail = 'aleks.evdokimov+ai-bot-clientPL@gmail.com';
exports.polandAdminPassword = '1234567';
