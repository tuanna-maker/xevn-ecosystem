/**
 * W1-HRM-QC-CLEAN-GATE — L2.5 J-HRM-01..07 + decisions probe
 * Account context: group CEO · company_id=main
 */
import { loadDeployEnv } from './seed-env-loader.mjs';
import { authHeaders, hrmApiBase, portalLogin } from './lib/uat-http.mjs';

loadDeployEnv();

const HRM = hrmApiBase();
const email = process.env.UAT_PORTAL_EMAIL ?? 'ceo@xe.vn';
const password = process.env.PORTAL_DEV_PASSWORD ?? 'Xevn@2026';

const session = await portalLogin(email, password);
const headers = {
  ...authHeaders(session),
  accept: 'application/json',
};

async function get(path) {
  const url = `${HRM}${path}`;
  const res = await fetch(url, { headers });
  let body;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { url, status: res.status, body };
}

function code(body) {
  return body?.error?.code ?? body?.code ?? (body?.id ? 'HRM-EMP-200' : null);
}

/** Nest list wrappers use `{ data: { data: [...] } }` or `{ data: [...] }`. */
function firstRow(body) {
  const inner = body?.data;
  if (Array.isArray(inner)) return inner[0];
  if (inner && Array.isArray(inner.data)) return inner.data[0];
  return undefined;
}

const results = { journeys: {}, decisions: null, errors: [] };

try {
  // J-HRM-01 contracts → employee
  const contracts = await get('/contracts-insurance/contracts?company_id=main');
  const cRow = firstRow(contracts.body);
  let j01 = { list: contracts.status, listCode: code(contracts.body) };
  if (cRow?.employee_id) {
    const emp = await get(`/employees/${cRow.employee_id}?company_id=main`);
    j01 = { ...j01, employee_id: cRow.employee_id, getStatus: emp.status, getCode: code(emp.body) };
    j01.pass = contracts.status === 200 && emp.status === 200;
  } else {
    j01.pass = false;
    j01.reason = 'no contract row';
  }
  results.journeys['J-HRM-01'] = j01;

  // J-HRM-02 employees list → detail
  const emps = await get('/employees?company_id=main&page_size=5');
  const eRow = firstRow(emps.body);
  let j02 = { list: emps.status };
  if (eRow?.id) {
    const emp = await get(`/employees/${eRow.id}?company_id=main`);
    j02 = { ...j02, employee_id: eRow.id, getStatus: emp.status, getCode: code(emp.body) };
    j02.pass = emps.status === 200 && emp.status === 200;
  } else {
    j02.pass = false;
  }
  results.journeys['J-HRM-02'] = j02;

  // J-HRM-03 contract row has id + employee_id
  results.journeys['J-HRM-03'] = {
    pass: Boolean(cRow?.id && cRow?.employee_id),
    contract_id: cRow?.id,
    employee_id: cRow?.employee_id,
  };

  // J-HRM-04 insurance → employee
  const ins = await get('/contracts-insurance/insurance?company_id=main');
  const iRow = firstRow(ins.body);
  let j04 = { list: ins.status };
  const insEmpId = iRow?.employee_id ?? iRow?.employeeId;
  if (insEmpId) {
    const emp = await get(`/employees/${insEmpId}?company_id=main`);
    j04 = { ...j04, employee_id: insEmpId, getStatus: emp.status, getCode: code(emp.body) };
    j04.pass = ins.status === 200 && emp.status === 200;
  } else {
    j04.pass = false;
  }
  results.journeys['J-HRM-04'] = j04;

  // J-HRM-05 recruitment candidates (was 400 UUID)
  const reqs = await get('/recruitment/requisitions?company_id=main&page_size=5');
  const cand = await get('/recruitment/candidates?company_id=main&page_size=5');
  results.journeys['J-HRM-05'] = {
    requisitions: { status: reqs.status, code: code(reqs.body) },
    candidates: { status: cand.status, code: code(cand.body) },
    pass: reqs.status === 200 && cand.status === 200,
  };

  // J-HRM-06 attendance → employee
  const att = await get('/attendance/records?company_id=main&page_size=5');
  const aRow = firstRow(att.body);
  let j06 = { list: att.status };
  const attEmpId = aRow?.employee_id ?? aRow?.employeeId;
  if (attEmpId) {
    const emp = await get(`/employees/${attEmpId}?company_id=main`);
    j06 = { ...j06, employee_id: attEmpId, getStatus: emp.status, getCode: code(emp.body) };
    j06.pass = att.status === 200 && emp.status === 200;
  } else {
    j06.pass = att.status === 200;
  }
  results.journeys['J-HRM-06'] = j06;

  // J-HRM-07 payslip → employee (was scope_parity 404)
  const pays = await get('/payroll/payslips?company_id=main&page_size=5');
  const pRow = firstRow(pays.body);
  let j07 = { list: pays.status, listCode: code(pays.body) };
  const payEmpId = pRow?.employee_id ?? pRow?.employeeId;
  if (payEmpId) {
    const emp = await get(`/employees/${payEmpId}?company_id=main`);
    j07 = {
      ...j07,
      payslip_id: pRow?.id,
      employee_id: payEmpId,
      getStatus: emp.status,
      getCode: code(emp.body),
    };
    j07.pass = pays.status === 200 && emp.status === 200;
  } else {
    j07.pass = false;
    j07.reason = 'no payslip row';
  }
  results.journeys['J-HRM-07'] = j07;

  // Decisions probe
  const dec = await get('/decisions?company_id=main');
  results.decisions = { status: dec.status, code: code(dec.body), total: dec.body?.total };
} catch (e) {
  results.errors.push(String(e));
}

const journeyIds = Object.keys(results.journeys);
const passCount = journeyIds.filter((k) => results.journeys[k].pass).length;
const decPass = results.decisions?.status === 200;

results.summary = {
  journeysPass: passCount,
  journeysTotal: journeyIds.length,
  decisionsPass: decPass,
  allJourneysPass: passCount === journeyIds.length,
  overallPass: passCount === journeyIds.length && decPass,
};

console.log(JSON.stringify(results, null, 2));
process.exit(results.summary.overallPass ? 0 : 1);
