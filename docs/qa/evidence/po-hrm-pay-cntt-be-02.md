# Evidence — PO-HRM-PAY-CNTT-BE-02

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-PAY-CNTT-BE-02` |
| **parent** | `PO-HRM-PAY-CNTT-API-FRAGMENT-MAP-02` |
| **from_role** | pm (recording pre-existing state) |
| **to_role** | pm / qa |
| **date** | 2026-08-12 |
| **priority** | P0 |
| **honesty** | `payroll_e2e_ready=false` |
| **ack_status** | **DONE — evidence only** |

## 1. Section observed (no write)

`apps/api/hrm-api/src/payroll/pay-sheet-template.service.ts` `ensureSchema()` L207–306:

| Check | Result |
|-------|--------|
| `pay_sheet_templates` table exists | ✅ present in service baseline |
| `applicability_province_code` column | ✅ ADD COLUMN TEXT NULL guarded by `IF NOT EXISTS` |
| Unique index `uq_pay_sheet_templates_company_line_province_active` | ✅ partial index on `(company_id, business_line_tag, applicability_province_code) WHERE archived_at IS NULL AND applicability_province_code IS NOT NULL` |
| Status CHECK `chk_pay_sheet_tpl_status` | ✅ draft/active/retired |
| `pay_sheet_template_lines` table + unique index | ✅ present |

Fragments: `payroll/data/pay-fragment-catalog.json` present on disk — treated as runtime catalog read by FE/process, not schema migration; early code review shows it is consumed read-only.

## 2. conclusion

No code delta required for BE-02 schema scope (§8.7). Ticket state recorded so subsequent PM queue/status reads do not replay the same WI as open. No running tests or DB migrations performed.
