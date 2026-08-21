"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegalEntityEnrichPipe = void 0;
const common_1 = require("@nestjs/common");
const legal_entity_body_util_1 = require("../legal-entity-body.util");
const upsert_legal_entity_dto_1 = require("../dto/upsert-legal-entity.dto");
/** Merge Command Center `payload.companyForm` into top-level code/name before ValidationPipe. */
let LegalEntityEnrichPipe = class LegalEntityEnrichPipe {
    transform(value, metadata) {
        if (metadata.type !== 'body' || metadata.metatype !== upsert_legal_entity_dto_1.UpsertLegalEntityDto) {
            return value;
        }
        return (0, legal_entity_body_util_1.enrichLegalEntityRequestBody)(value);
    }
};
exports.LegalEntityEnrichPipe = LegalEntityEnrichPipe;
exports.LegalEntityEnrichPipe = LegalEntityEnrichPipe = __decorate([
    (0, common_1.Injectable)()
], LegalEntityEnrichPipe);
