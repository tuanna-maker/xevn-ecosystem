"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiException = void 0;
const common_1 = require("@nestjs/common");
class ApiException extends common_1.HttpException {
    code;
    details;
    constructor(code, message, status, details) {
        super({ code, message, details }, status);
        this.code = code;
        this.details = details;
    }
}
exports.ApiException = ApiException;
