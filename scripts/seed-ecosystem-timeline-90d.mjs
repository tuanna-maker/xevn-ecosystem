import pg from 'pg';
import { randomUUID } from 'node:crypto';

const { Client } = pg;

const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.HRM_DB_NAME || 'xevn_hrm',
  ssl: false,
});

const companyUuidMap = {
  holding: '10000000-0000-4000-8000-000000000001',
  trsport: '10000000-0000-4000-8000-000000000002',
  logistics: '10000000-0000-4000-8000-000000000003',
  finance: '10000000-0000-4000-8000-000000000004',
  services: '10000000-0000-4000-8000-000000000005',
};

function dayIso(daysAgo) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

async function main() {
  await client.connect();
  try {
    await client.query('BEGIN');
    const empRes = await client.query(`
      SELECT id, company_id, employee_code, full_name
      FROM public.employees
      WHERE company_id IN ('holding','trsport','logistics','finance','services')
      ORDER BY employee_code
      LIMIT 100
    `);
    const employees = empRes.rows;
    if (employees.length === 0) throw new Error('No employees found. Run seed:ecosystem:full first.');

    // Clean last 90 days window to keep idempotent behavior.
    await client.query(
      `DELETE FROM public.attendance_records WHERE attendance_date >= $1::date AND company_id = ANY($2::uuid[])`,
      [dayIso(89), Object.values(companyUuidMap)],
    );
    await client.query(
      `DELETE FROM public.service_requests WHERE request_date >= $1::date AND company_id = ANY($2::uuid[])`,
      [dayIso(89), Object.values(companyUuidMap)],
    );
    await client.query(
      `DELETE FROM public.hrm_tasks WHERE due_date >= $1::date AND company_id = ANY($2::uuid[])`,
      [dayIso(89), Object.values(companyUuidMap)],
    );

    let attendanceInserted = 0;
    let serviceInserted = 0;
    let tasksInserted = 0;
    let requisitionsInserted = 0;
    let candidatesInserted = 0;
    let interviewsInserted = 0;
    let payrollInserted = 0;

    for (let i = 0; i < 90; i += 1) {
      const date = dayIso(i);
      const isWeekend = new Date(`${date}T00:00:00Z`).getUTCDay() % 6 === 0;
      for (const [idx, e] of employees.entries()) {
        const compUuid = companyUuidMap[e.company_id];
        if (!compUuid) continue;
        if (isWeekend && idx % 5 !== 0) continue;
        const status = idx % 19 === 0 ? 'leave' : idx % 23 === 0 ? 'absent' : 'present';
        const checkIn = status === 'present' ? `${date}T08:${String((idx * 3) % 60).padStart(2, '0')}:00Z` : null;
        const checkOut = status === 'present' ? `${date}T17:${String((idx * 7) % 60).padStart(2, '0')}:00Z` : null;
        await client.query(
          `
          INSERT INTO public.attendance_records
            (id, company_id, employee_id, attendance_date, check_in_at, check_out_at, status, note, created_by, updated_at)
          VALUES
            ($1::uuid, $2::uuid, $3::uuid, $4::date, $5::timestamptz, $6::timestamptz, $7, $8, 'timeline-seed', NOW())
          `,
          [randomUUID(), compUuid, e.id, date, checkIn, checkOut, status, 'Timeline seed 90d'],
        );
        attendanceInserted += 1;
      }

      if (i % 7 === 0) {
        for (const [company, compUuid] of Object.entries(companyUuidMap)) {
          await client.query(
            `
            INSERT INTO public.service_requests
              (id, company_id, service_type, employee_id, employee_name, employee_code, department, request_date, status, notes, meal_type, meal_date, meal_quantity)
            VALUES
              ($1::uuid,$2::uuid,'meal',NULL,$3,$4,'Vận hành',$5::date,'pending','Yêu cầu suất ăn theo ca','Trưa',$5::date,20),
              ($6::uuid,$2::uuid,'vehicle',NULL,$7,$8,'Kinh doanh',$5::date,'approved','Đi công tác khách hàng',NULL,NULL,NULL)
            `,
            [randomUUID(), compUuid, `NV ${company.toUpperCase()} A`, `REQ-${company}-A-${i}`, date, randomUUID(), `NV ${company.toUpperCase()} B`, `REQ-${company}-B-${i}`],
          );
          serviceInserted += 2;
        }
      }

      if (i % 10 === 0) {
        for (const [company, compUuid] of Object.entries(companyUuidMap)) {
          await client.query(
            `
            INSERT INTO public.hrm_tasks
              (id, company_id, title, description, priority, status, due_date, updated_at)
            VALUES
              ($1::uuid,$2::uuid,$3,$4,'high','in_progress',$5::date,NOW()),
              ($6::uuid,$2::uuid,$7,$8,'medium','todo',$9::date,NOW())
            `,
            [
              randomUUID(),
              compUuid,
              `Rà soát KPI tuần ${date}`,
              `Checklist KPI và năng suất cho ${company}`,
              dayIso(Math.max(i - 3, 0)),
              randomUUID(),
              `Cập nhật lịch điều phối ${date}`,
              `Điều phối ca vận hành cho ${company}`,
              dayIso(Math.max(i - 2, 0)),
            ],
          );
          tasksInserted += 2;
        }
      }

      if (i % 15 === 0) {
        for (const [, compUuid] of Object.entries(companyUuidMap)) {
          const reqId = randomUUID();
          await client.query(
            `
            INSERT INTO public.job_requisitions
              (id, company_id, title, department, employment_type, status, updated_at)
            VALUES
              ($1::uuid,$2::uuid,'Nhân viên điều phối','Vận hành','full-time','open',NOW())
            `,
            [reqId, compUuid],
          );
          requisitionsInserted += 1;
          const candidateId = randomUUID();
          await client.query(
            `
            INSERT INTO public.recruitment_candidates
              (id, company_id, requisition_id, full_name, email, source, status, updated_at)
            VALUES
              ($1::uuid,$2::uuid,$3::uuid,$4,$5,'linkedin','interview',NOW())
            `,
            [candidateId, compUuid, reqId, `Ứng viên timeline ${i}`, `timeline.${i}.${candidateId.slice(0, 6)}@mail.com`],
          );
          candidatesInserted += 1;
          await client.query(
            `
            INSERT INTO public.recruitment_interviews
              (id, company_id, candidate_id, scheduled_at, interviewer, status, updated_at)
            VALUES
              ($1::uuid,$2::uuid,$3::uuid,$4::timestamptz,'Interviewer Timeline','scheduled',NOW())
            `,
            [randomUUID(), compUuid, candidateId, `${date}T09:00:00Z`],
          );
          interviewsInserted += 1;
        }
      }

      if (i % 30 === 0) {
        for (const [, compUuid] of Object.entries(companyUuidMap)) {
          await client.query(
            `
            INSERT INTO public.payroll_periods
              (id, company_id, period_label, start_date, end_date, status, created_by, processed_at, updated_at)
            VALUES
              ($1::uuid,$2::uuid,$3,$4::date,$5::date,'processed','timeline-seed',NOW(),NOW())
            `,
            [randomUUID(), compUuid, `Payroll timeline ${date}`, dayIso(i + 29), date],
          );
          payrollInserted += 1;
        }
      }
    }

    await client.query('COMMIT');
    console.log(
      JSON.stringify(
        {
          success: true,
          timeline_days: 90,
          inserted: {
            attendance: attendanceInserted,
            service_requests: serviceInserted,
            tasks: tasksInserted,
            requisitions: requisitionsInserted,
            candidates: candidatesInserted,
            interviews: interviewsInserted,
            payroll_periods: payrollInserted,
          },
        },
        null,
        2,
      ),
    );
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ success: false, error: error.message }, null, 2));
  process.exit(1);
});

