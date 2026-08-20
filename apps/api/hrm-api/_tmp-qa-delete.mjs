import { Client } from 'pg';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv(path) {
  try {
    const content = readFileSync(path, 'utf-8');
    for (const line of content.split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) {
        let v = m[2].trim();
        if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
        process.env[m[1]] = v;
      }
    }
  } catch {}
}
loadEnv(resolve(process.cwd(), '../../../deploy/xevn-ecosystem/.env'));
loadEnv(resolve(process.cwd(), '.env'));

const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'xevn_hrm',
  ssl: false,
});
await client.connect();

// Same table list + same text columns as the audit, to delete EXACTLY the 219 rows shown
const targets = [
  ["hrm_merge_tokens", "company_id,token_key,source_path,ring,domain,label_vi,status,origin,extension_field_ref,created_by,updated_by"],
  ["att_attendance_code", "company_id,code,name_vi,symbol,counts_as,color,status"],
  ["emp_document_type", "company_id,document_type_key,name_vi,status"],
  ["emp_employment_type", "company_id,employment_type_key,name_vi,status"],
  ["rec_pipeline_stage", "company_id,stage_key,name_vi,wf_task_type_key,color_token,status"],
  ["pay_payroll_group", "company_id,code,name_vi,status"],
  ["pay_sheet_templates", "company_id,code,name,description,status,applicability_scope,ou_id,position_key,created_by,updated_by,business_line_tag"],
  ["job_requisitions", "company_id,title,department,employment_type,status,job_description,requirements,job_template_id,rejected_reason,wf_callback_fingerprint,headcount_mode,department_key,position_key,hire_reason,out_of_plan_reason,approval_matrix_key,approved_by,job_grade_key"],
  ["pay_policy_pack", "company_id,code,name_vi,status,scope,business_line_tag,created_by,updated_by"],
  ["pay_sheet_template_lines", "company_id,component_code,display_label,group_key"],
  ["payroll_periods", "company_id,period_label,status,created_by"],
  ["att_leave_type", "company_id,leave_type_key,name_vi,category,status,unit"],
  ["att_ot_comp_type", "company_id,code,name_vi,name_en,color,status"],
  ["att_ot_type", "company_id,code,name_vi,name_en,color,status"],
  ["pay_input_pack_profile", "company_id,code,name_vi,status,created_by,updated_by"],
  ["si_insurance_type", "company_id,insurance_type_key,name_vi,status"],
  ["si_insurer", "company_id,insurer_key,name_vi,status"],
  ["hr_decision_type", "company_id,decision_type_key,name_vi,wh_event_type,color_token,status"],
  ["hrm_catalog_extension_items", "tenant_id,company_id,catalog_key,code,label,unit,status"],
  ["job_description_templates", "company_id,code,title,position_name,job_description,requirements,notes,position_code,status"],
  ["recruitment_candidates", "company_id,full_name,email,source,status,offer_accepted_by"],
  ["emp_employment_status", "company_id,status_key,name_vi,status"],
  ["synced_catalogs", "catalog_key,source_system,checksum,tenant_id,company_id"],
  ["hrm_contract_clauses", "company_id,code,title_vi,body_vi,clause_group,status,created_by,updated_by,origin,origin_company_id,lineage_code"],
  ["salary_components", "company_id,code,name,component_type,nature,value_type,formula,description,applied_to"],
  ["emp_status_reason", "company_id,reason_key,name_vi,status"],
  ["employee_work_timeline", "company_id,title,description,event_type,status,contract_code,department,position,notes,position_key,department_key,source_module"],
  ["employees", "company_id,employee_code,email,full_name,job_title_key,status,avatar_url"],
];

// Delete order: children before parents to respect FK. Reorder based on known deps:
// lines before templates; requisitions before candidates (candidates may ref requisition); templates/packs before groups if referenced.
const order = [
  "employee_work_timeline",
  "recruitment_candidates",
  "job_requisitions",
  "pay_sheet_template_lines",
  "pay_sheet_templates",
  "pay_payroll_group",
  "pay_policy_pack",
  "pay_input_pack_profile",
  "hrm_merge_tokens",
  "hrm_catalog_extension_items",
  "rec_pipeline_stage",
  "att_attendance_code",
  "att_leave_type",
  "att_ot_comp_type",
  "att_ot_type",
  "emp_document_type",
  "emp_employment_type",
  "emp_employment_status",
  "emp_status_reason",
  "si_insurance_type",
  "si_insurer",
  "hr_decision_type",
  "hrm_contract_clauses",
  "salary_components",
  "job_description_templates",
  "synced_catalogs",
  "employees",
];

const map = Object.fromEntries(targets);

await client.query('BEGIN');
let totalDeleted = 0;
const report = [];
try {
  for (const t of order) {
    const colsStr = map[t];
    const cols = colsStr.split(',');
    const textColsQuery = await client.query(
      `select column_name, data_type from information_schema.columns where table_schema='public' and table_name=$1 and column_name = ANY($2)`,
      [t, cols]
    );
    const textCols = textColsQuery.rows.filter(r => ['character varying','text','character'].includes(r.data_type)).map(r=>r.column_name);
    const orClauses = textCols.map(c => `"${c}" ilike '%QA%'`).join(' or ');
    const del = await client.query(`delete from "${t}" where ${orClauses} returning 1`);
    report.push({ table: t, deleted: del.rowCount });
    totalDeleted += del.rowCount;
  }
  console.log(JSON.stringify(report, null, 1));
  console.log('TOTAL DELETED:', totalDeleted);
  await client.query('COMMIT');
  console.log('COMMITTED');
} catch (e) {
  await client.query('ROLLBACK');
  console.log('ERROR, ROLLED BACK:', e.message);
  console.log('Partial report before error:', JSON.stringify(report, null, 1));
}
await client.end();
