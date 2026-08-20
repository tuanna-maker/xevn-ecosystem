"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = ok;
function ok(data, code = 'OK', message = 'Success') {
    return {
        success: true,
        code,
        message,
        data,
        timestamp: new Date().toISOString(),
    };
}
