const fs = require('fs');
const file = 'apps/web/hrm/src/pages/Attendance.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<SelectContent>/g, '<SelectContent portalScope="iframe">');
content = content.replace(/<SelectContent className="bg-xevn-surface z-50">/g, '<SelectContent portalScope="iframe" className="bg-xevn-surface z-50">');
content = content.replace(/<DropdownMenuContent align="start"/g, '<DropdownMenuContent portalScope="iframe" align="start"');

fs.writeFileSync(file, content);
console.log('Replaced SelectContent successfully');
