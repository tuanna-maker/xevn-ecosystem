import http from 'http';

const EMPLOYEES = [
  { company_id: 'main', employee_code: 'NV001', full_name: 'Nguyễn Văn A', email: 'nva@xevn.com', phone_number: '0901234561' },
  { company_id: 'main', employee_code: 'NV002', full_name: 'Trần Thị B', email: 'ttb@xevn.com', phone_number: '0901234562' },
  { company_id: 'main', employee_code: 'NV003', full_name: 'Lê Văn C', email: 'lvc@xevn.com', phone_number: '0901234563' },
  { company_id: 'main', employee_code: 'NV004', full_name: 'Phạm Thị D', email: 'ptd@xevn.com', phone_number: '0901234564' },
  { company_id: 'main', employee_code: 'NV005', full_name: 'Hoàng Văn E', email: 'hve@xevn.com', phone_number: '0901234565' },
];

function postData(data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 28001,
      path: '/api/hrm/employees',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'x-tenant-id': 'main',
        'x-internal-api-key': 'xevn-dev-internal-key'
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(payload);
    req.end();
  });
}

async function seed() {
  console.log('Seeding Employees...');
  for (const emp of EMPLOYEES) {
    try {
      const res = await postData(emp);
      console.log(`[SUCCESS] Created ${emp.employee_code} - ${emp.full_name}`);
    } catch (e) {
      console.error(`[ERROR] Failed to create ${emp.employee_code}: ${e.message}`);
    }
  }
  console.log('Done seeding employees.');
}

seed();
