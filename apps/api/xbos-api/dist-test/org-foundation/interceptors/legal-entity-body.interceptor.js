"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegalEntityBodyInterceptor = void 0;
const common_1 = require("@nestjs/common");
const legal_entity_body_util_1 = require("../legal-entity-body.util");
/** Runs before ValidationPipe so PUT/POST bodies with only payload.companyForm still validate. */
let LegalEntityBodyInterceptor = class LegalEntityBodyInterceptor {
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const method = req.method?.toUpperCase();
        const path = req.originalUrl ?? req.url ?? '';
        if ((method === 'PUT' || method === 'POST') && path.includes('legal-entities')) {
            if (typeof req.body === 'string' && req.body.trim()) {
                try {
                    req.body = JSON.parse(req.body);
                }
                catch {
                    /* ValidationPipe handles invalid JSON */
                }
            }
            req.body = (0, legal_entity_body_util_1.enrichLegalEntityRequestBody)(req.body);
        }
        return next.handle();
    }
};
exports.LegalEntityBodyInterceptor = LegalEntityBodyInterceptor;
exports.LegalEntityBodyInterceptor = LegalEntityBodyInterceptor = __decorate([
    (0, common_1.Injectable)()
], LegalEntityBodyInterceptor);
