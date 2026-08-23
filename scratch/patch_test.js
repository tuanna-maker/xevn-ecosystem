const fs = require('fs');
const path = 'd:\\xevn-ecosystem\\apps\\web\\hrm\\src\\components\\payroll\\policy-pack\\PolicyPackSetupScreen.test.ts';
let content = fs.readFileSync(path, 'utf8');

// 1. In 'tạo mới CHUNG hợp lệ', 'validate field bắt buộc', 'hiệu lực đến trước', 'KPI ngoài range':
// We need to insert `fireEvent.click(screen.getByTestId('pay-policy-pack-add'));`
const testAddStr = `render(createElement(PolicyPackSetupScreen));\n    fireEvent.click(screen.getByTestId('pay-policy-pack-add'));`;

content = content.replace(/render\(createElement\(PolicyPackSetupScreen\)\);\n    typeInto\(screen\.getByLabelText\('Mã gói'\)/g, `${testAddStr}\n    typeInto(screen.getByLabelText('Mã gói')`);

content = content.replace(/render\(createElement\(PolicyPackSetupScreen\)\);\n    fireEvent\.click\(screen\.getByText\('Lưu gói chính sách'\)\);/g, `${testAddStr}\n    fireEvent.click(screen.getByText('Tạo mới gói'));`);

// 2. Change 'Lưu gói chính sách' to 'Tạo mới gói'
content = content.replace(/getByText\('Lưu gói chính sách'\)/g, `getByText('Tạo mới gói')`);

// 3. Change 'Cập nhật' to 'Lưu thay đổi'
content = content.replace(/getByText\('Cập nhật'\)/g, `getByText('Lưu thay đổi')`);
content = content.replace(/getByText\(\/Cập nhật gói\/\)/g, `getByText(/Cập nhật chính sách/)`);

// 4. In DEF-PAY-STP-SEARCH-ARIA-P2, it checks for form labels, which are not present initially.
// We must open the form first.
content = content.replace(/render\(createElement\(PolicyPackSetupScreen\)\);\n\n    \/\/ Substring/g, `${testAddStr}\n\n    // Substring`);

fs.writeFileSync(path, content);
console.log('Test file patched!');
