import http from 'http';

const args = process.argv.slice(2);
let month = '08';
let year = '2026';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--month' && args[i + 1]) month = args[i + 1].padStart(2, '0');
  if (args[i] === '--year' && args[i + 1]) year = args[i + 1];
}

const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  'x-tenant-id': 'main',
  'x-company-id': 'main',
  'x-internal-api-key': 'xevn-dev-internal-key'
};

function fetchEmployees() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:28001/api/hrm/employees?company_id=main', { headers: COMMON_HEADERS }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body).data.data);
        } else {
          reject(new Error(`Failed to fetch employees: ${res.statusCode} ${body}`));
        }
      });
    }).on('error', reject);
  });
}

function postData(path, payload) {
  return new Promise((resolve, reject) => {
    const dataString = JSON.stringify(payload);
    const options = {
      hostname: 'localhost',
      port: 28001,
      path: path,
      method: 'POST',
      headers: { ...COMMON_HEADERS, 'Content-Length': Buffer.byteLength(dataString) },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(dataString);
    req.end();
  });
}

async function seedTimesheets() {
  console.log(`Seeding Timesheets for ${month}/${year}...`);
  try {
    const employees = await fetchEmployees();
    if (!employees || employees.length === 0) {
      console.log('No employees found. Please run seed-hrm-employees.mjs first.');
      return;
    }
    console.log(`Found ${employees.length} employees to map.`);

    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const endDate = `${year}-${month}-${lastDay}`;

    // Create Timesheet
    const sheetPayload = {
      company_id: 'main',
      name: `Bảng chấm công Tháng ${month}/${year}`,
      start_date: startDate,
      end_date: endDate
    };

    let sheetRes;
    try {
       sheetRes = await postData('/api/hrm/attendance/attendance-sheets', sheetPayload);
       console.log(`[SUCCESS] Created Attendance Sheet: ${sheetRes.data.id}`);
    } catch (e) {
       console.error(`[ERROR] Failed to create sheet: ${e.message}`);
       return;
    }

    // Create 1 attendance record per employee for the first day of the month as an example seed
    for (const emp of employees) {
      const recordPayload = {
        company_id: emp.company_uuid || 'main',
        employee_id: emp.id,
        attendance_date: startDate,
        check_in_at: `${startDate}T08:00:00Z`,
        check_out_at: `${startDate}T17:00:00Z`,
        status: 'p',
        note: 'Seeded record'
      };

      try {
        await postData('/api/hrm/attendance/records', recordPayload);
        console.log(`  -> [SUCCESS] Created attendance record for ${emp.employee_code}`);
      } catch (e) {
        console.error(`  -> [ERROR] Failed to create record for ${emp.employee_code}: ${e.message}`);
      }
    }
    console.log('\nTimesheet seeding complete!');
  } catch (error) {
    console.error('Fatal error:', error.message);
  }
}

seedTimesheets();
