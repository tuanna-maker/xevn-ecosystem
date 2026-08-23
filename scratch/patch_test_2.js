const fs = require('fs');
const path = 'd:\\xevn-ecosystem\\apps\\web\\hrm\\src\\components\\payroll\\policy-pack\\PolicyPackSetupScreen.test.ts';
let content = fs.readFileSync(path, 'utf8');

// Fix empty state text
content = content.replace(/Chưa có gói — tạo từ nút Thêm/g, 'Chưa có gói chính sách nào. Bấm "+ Thêm chính sách" để tạo mới.');

// Fix DEF-PAY-STP-SEARCH-ARIA-P2 to click first
content = content.replace(/render\(createElement\(PolicyPackSetupScreen\)\);\n\n    \/\/ Substring/g, `render(createElement(PolicyPackSetupScreen));\n    fireEvent.click(screen.getByTestId('pay-policy-pack-add'));\n\n    // Substring`);

fs.writeFileSync(path, content);
console.log('Test file patched completely!');
