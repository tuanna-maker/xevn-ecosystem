"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDecisionDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_decision_dto_1 = require("./create-decision.dto");
class UpdateDecisionDto extends (0, mapped_types_1.PartialType)(create_decision_dto_1.CreateDecisionDto) {
}
exports.UpdateDecisionDto = UpdateDecisionDto;
//# sourceMappingURL=update-decision.dto.js.map