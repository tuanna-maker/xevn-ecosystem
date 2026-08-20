"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAttendanceSheetDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_attendance_sheet_dto_1 = require("./create-attendance-sheet.dto");
class UpdateAttendanceSheetDto extends (0, mapped_types_1.PartialType)(create_attendance_sheet_dto_1.CreateAttendanceSheetDto) {
}
exports.UpdateAttendanceSheetDto = UpdateAttendanceSheetDto;
//# sourceMappingURL=update-attendance-sheet.dto.js.map