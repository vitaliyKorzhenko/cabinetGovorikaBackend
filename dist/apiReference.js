"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = void 0;
var Language;
(function (Language) {
    Language["UK"] = "uk";
    Language["RU"] = "ru";
    Language["PL"] = "pl";
    Language["EN"] = "en";
})(Language || (Language = {})); // Желательно иметь именно такой перечень языков
var Environment;
(function (Environment) {
    Environment["GOVORIKA"] = "govorika";
    Environment["PROMOVA"] = "promova";
    Environment["POLAND"] = "poland";
})(Environment || (exports.Environment = Environment = {}));
var SubscriptionType;
(function (SubscriptionType) {
    SubscriptionType["NATIVE_SPEECH"] = "native_speech";
})(SubscriptionType || (SubscriptionType = {}));
var LessonType;
(function (LessonType) {
    LessonType["PRIVATE"] = "private";
    LessonType["GROUP"] = "group";
})(LessonType || (LessonType = {}));
var LessonStatus;
(function (LessonStatus) {
    LessonStatus["ACTIVE"] = "active";
    LessonStatus["FREEZE"] = "freeze";
    LessonStatus["SCHEDULED"] = "scheduled";
})(LessonStatus || (LessonStatus = {}));
