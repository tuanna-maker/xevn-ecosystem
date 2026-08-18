# Evidence — PO-HRM-JD-DYNAMIC-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-JD-DYNAMIC-BE-01` |
| **role** | `dev-be` |
| **date** | 2026-08-06 |
| **ack_status** | `READY_FOR_QA` |
| **change_mode** | ADD · preserve_default · code_memory_required |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `docs/program/specs/PO-HRM-JD-DYNAMIC-SPEC-01.md` UC-00a/b/c · `docs/program/specs/PO-HRM-JD-GROUP-SPEC-01.md` UC-00d..00h · spine FR-UC-BP-REC-00 |
| **tech_spec** | `docs/program/specs/PO-HRM-JD-DYNAMIC-ARCH-02.md` §2 API F.1 · §3 DB · §4 scope_parity · §12 group pointer |
| **tech_spec (group)** | `docs/program/specs/PO-HRM-JD-GROUP-ARCH-01.md` §1 rule order · §3 entities/API · §3.7 snapshot v2 |
| **db_design** | ARCH-02 §3 (`rec_jd_field_def` / layout / items · ALTER `job_description_templates`) · GROUP-DATA-01 §4 ALIGNED-BENCHMARK (`rec_jd_group_def` · `group_field` · `default_pack` · `pack_group` · `pack_rule`) |
| **api_design** | ARCH-02 §2 F-JD-DEF/LAY/01..04 · GROUP-ARCH §3.6 F-JD-GRP/PCK/RUL/RESOLVE |
| **slice** | `docs/program/slices/PO-HRM-JD-DYNAMIC-TOPCV.md` |
| **benchmark codes** | `PO-HRM-JD-WORLD-BENCHMARK-01.md` §4 · PACK_IT_OFFICE / PACK_DRIVER_OPS / PACK_CORP_DEFAULT |

---

## Implemented

### Schema (`ensureSchema` + migration)

- `rec_jd_field_def` · `rec_jd_form_layout` · `rec_jd_form_layout_item`
- `rec_jd_group_def` · `rec_jd_group_field`
- `rec_jd_default_pack` · `rec_jd_pack_group` · `rec_jd_pack_rule`
- ALTER `job_description_templates`: `values_json` · `layout_snapshot_json` · `layout_version`
- File: `apps/api/hrm-api/migrations/20260806_rec_jd_dynamic_group_pack.sql`
- Runtime: `JdDynamicService.ensureSchema()` (+ catalog `ensureWave2Schema` ALTER)

### Config bootstrap (≠ UAT seed / U65)

- Lazy `ensureCompanyBootstrap(companyId)` on first Settings list: system fields (`title`/`code`/`position_code`/…) · WORLD §4 groups · PACK_IT_OFFICE / DRIVER_OPS / CORP_DEFAULT · job_family rules + fallback
- **Not** used as QA evidence seed density

### APIs (`/api/hrm/recruitment/…`)

| F-id | Path |
|------|------|
| F-JD-DEF-01..04 + GET :id | `jd-field-defs` |
| F-JD-LAY-01..04 | `jd-form-layouts` (+ `/default`) |
| F-JD-GRP-01..04 | `jd-group-defs` |
| F-JD-PCK-01..03 | `jd-default-packs` / `:code` |
| F-JD-RUL-01..03 | `jd-pack-rules` · `POST …/resolve` |
| F-JD-01..04 | `job-templates` + **GET `:id`** (AS-IS gap) · create/update snapshot v2 |

### Pack resolve fail-closed

- Rule priority ASC → first match
- Else `is_company_fallback` / `PACK_CORP_DEFAULT`
- Alias `PACK_COMPANY_DEFAULT` → `PACK_CORP_DEFAULT`
- No fallback → **400** `HRM-JD-PACK-FALLBACK`

### must_keep

- YCTD `job_template_id` soft FK untouched
- `HRM-REC-JD-POS` position catalog assert kept
- **FORBIDDEN** dual-write `job_postings` for JD values/layout
- Soft-delete / archive only on field defs
- Display-ready `sections[]` on GET template (OS 28)

---

## Tests

```bash
pnpm --filter hrm-api exec jest --testPathPatterns=jd-dynamic.scope-parity --no-cache
```

**Result:** 8/8 PASS (`jd-dynamic.scope-parity.spec.ts`)

Also: `recruitment.controller.spec` + `recruitment-catalog.service.spec` PASS with JdDynamic provider mock.

Coverage:

- Field/layout/group list ↔ get scope_parity (group CEO `main` → holding row)
- Member CEO out-of-scope get → 404
- Job templates list ↔ GET `:id` + display `sections`
- Resolve → CORP_DEFAULT fallback · HRM-JD-PACK-FALLBACK when missing
- COMPANY_DEFAULT alias normalize

---

## Files touched (allowlist)

- `apps/api/hrm-api/src/recruitment/jd-dynamic.constants.ts` (new)
- `apps/api/hrm-api/src/recruitment/jd-dynamic.service.ts` (new)
- `apps/api/hrm-api/src/recruitment/jd-dynamic.scope-parity.spec.ts` (new)
- `apps/api/hrm-api/src/recruitment/dto/create-jd-*.ts` · `update-jd-*.ts` · `put-jd-*.ts` · `resolve-jd-pack.dto.ts`
- `apps/api/hrm-api/src/recruitment/dto/create-job-template.dto.ts` · `update-job-template.dto.ts` (extend)
- `apps/api/hrm-api/src/recruitment/recruitment-catalog.service.ts` (GET by id + JSONB)
- `apps/api/hrm-api/src/recruitment/recruitment.controller.ts` (routes)
- `apps/api/hrm-api/src/recruitment/recruitment.controller.spec.ts`
- `apps/api/hrm-api/src/app.module.ts`
- `apps/api/hrm-api/migrations/20260806_rec_jd_dynamic_group_pack.sql`

---

## Residual

| Item | Owner |
|------|--------|
| FE Settings FG1–FG3 + writer resolve/DnD + TopCV view | `PO-HRM-JD-DYNAMIC-FE-01` |
| Browser U65 J-HRM-JD-* / J-HRM-JD-GRP-* after both READY | QA |
| OpenAPI publish delta (optional) | devops / SA follow-up |
| Live DB migrate on deploy | devops |

---

## solid_convention_ack (FE–BE)

- GET template returns **display-ready** `sections[]` (group order × values)
- FE must submit flat DTO (`values` + `layout_snapshot`); **no** invent nested write aggregate from multi-GET join
- Pack/group codes loaded from CFG/resolve — not hardcoded in FE for runtime resolve

---

## completion_report

**Closed:** Field catalog + L1 layout + group/pack/rules schema & APIs; GET job-templates/:id; create/update snapshot v2 + values bridge; pack resolve fail-closed CORP/COMPANY_DEFAULT; scope_parity jest; CODE-MEMORY; U65 config bootstrap only.

**Residual:** FE wave + QA browser U65 after FE READY.

**ack_status:** `READY_FOR_QA`
