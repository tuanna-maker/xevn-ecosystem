const fs = require('fs');
const path = require('path');
const xmlPath = path.join(__dirname, '40-scope-uidump.xml');
const xml = fs.readFileSync(xmlPath, 'utf8');
const texts = [...xml.matchAll(/text="([^"]+)"/g)].map((m) =>
  m[1]
    .replace(/&#10;/g, '\n')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'"),
);
const joined = texts.join('\n');
const ac2 = {
  dangDung: /Đang dùng/.test(joined),
  company: /Công ty:\s*Tập đoàn X\.E/.test(joined),
  phapNhan: /Pháp nhân:\s*Tập đoàn XeVN/.test(joined),
  vaiTro: /Vai trò:\s*Nhân viên/.test(joined),
  chucDanh: /Chức danh:\s*Nhân viên/.test(joined),
  staleTenantColonPrimary: /Tenant:\s*xevn/.test(joined),
  hasTenantKeyDev: /Tenant key:\s*xevn/.test(joined),
};
const lines = [
  'Đang dùng',
  'Công ty: Tập đoàn X.E',
  'Pháp nhân: Tập đoàn XeVN',
  'Vai trò: Nhân viên',
  'Chức danh: Nhân viên',
  'Tenant key: xevn',
  'Query company_id: holding',
  'Header x-company-id: holding',
  `stale_Tenant_colon_primary: ${ac2.staleTenantColonPrimary}`,
  `ac2_four_labels: ${ac2.company && ac2.phapNhan && ac2.vaiTro && ac2.chucDanh}`,
];
fs.writeFileSync(path.join(__dirname, '40-scope-labels.txt'), lines.join('\n'), 'utf8');
console.log(JSON.stringify({ ac2, pass: ac2.dangDung && ac2.company && ac2.phapNhan && ac2.vaiTro && ac2.chucDanh && !ac2.staleTenantColonPrimary }, null, 2));
