# Evidence — PO-HRM-JD-DYNAMIC-BE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-JD-DYNAMIC-BE-02` |
| **role** | `dev-be` |
| **date** | 2026-08-06 |
| **ack_status** | `READY_FOR_QA` |
| **change_mode** | FIX · preserve_default · code_memory_required |
| **u65** | no seed · no dual-write `job_postings` |
| **closes** | QA residual **BE-COMPILE-BLOCK** (`po-hrm-jd-dynamic-qa-01.md`) |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs / group-spec** | `docs/program/specs/PO-HRM-JD-GROUP-SPEC-01.md` §9.2 fail-closed · AC-JD-GRP-10 (`job_family=IT` → `PACK_IT_OFFICE`) · AC-JD-GRP-27 CORP fallback |
| **srs (dynamic)** | `docs/program/specs/PO-HRM-JD-DYNAMIC-SPEC-01.md` UC-00a/b CFG surface |
| **tech_spec** | `docs/program/specs/PO-HRM-JD-DYNAMIC-ARCH-02.md` §2 F-JD-* · §4 scope_parity |
| **tech_spec (group)** | `docs/program/specs/PO-HRM-JD-GROUP-ARCH-01.md` §3.6 resolve · snapshot v2 |
| **qa fail** | `docs/qa/evidence/po-hrm-jd-dynamic-qa-01.md` §API probe + residual BE-COMPILE-BLOCK |
| **prior BE** | `docs/qa/evidence/po-hrm-jd-dynamic-be-01.md` (READY stamp; live Nest stuck) |
| **must_keep** | no dual-write `job_postings` · `layout_snapshot_json` v2 · pack resolve fail-closed · list↔get scope parity |

---

## Root cause

`enrichLayout` / `enrichGroup` / `enrichPack` returned `{ ...Record<string, unknown>, … }`. TypeScript erased index-signature keys from the inferred return → callers saw only `{ fields }` / `{ items }` / pack missing `id`/`label`. Nest `--watch` stuck on **4 TS errors** → stale dist → all JD CFG/resolve **404**.

---

## Fix (delta)

| File | Change |
|------|--------|
| `jd-dynamic.service.ts` | Explicit types `JdFormLayoutDetail` · `JdGroupDefDetail` · `JdDefaultPackDetail` · `JdPackGroupDetail`; enrich* build typed objects (no bare spread) |
| `recruitment-catalog.service.ts` | Explicit fields on `getJobDescriptionTemplateById` return (same TS erase class; scope-parity consumer) |
| `recruitment.controller.ts` | `@HttpCode(HttpStatus.OK)` on `POST jd-pack-rules/resolve` (Nest default was 201) |
| CODE-MEMORY | APPEND `@CODE-MEMORY-CHANGE` BE-02 |

**Forbidden checks:** no seed · no `job_postings` dual-write · no architecture rewrite · no remaster / face_live claims.

---

## Verification

### Compile / nest watch

```text
npx tsc --noEmit -p tsconfig.build.json  → exit 0
terminal 823585 @ 11:31:47 — Found 0 errors. Watching for file changes.
NestApplication successfully started @ 11:31:52
```

### Live probe (`ceo@xe.vn` · `company_id=main` · hrm-api `:28001`)

| Endpoint | HTTP | Note |
|----------|------|------|
| `GET …/jd-field-defs?company_id=main` | **200** | was 404 |
| `GET …/jd-group-defs?company_id=main` | **200** | was 404 |
| `GET …/jd-default-packs?company_id=main` | **200** | was 404 |
| `GET …/jd-pack-rules?company_id=main` | **200** | was 404 |
| `POST …/jd-pack-rules/resolve` `{company_id, job_family:IT}` | **200** | `pack_code=PACK_IT_OFFICE` · `code=HRM-JD-RUL-200` |

### Jest

```bash
npx jest src/recruitment/jd-dynamic.scope-parity.spec.ts --no-coverage
```

**Result:** **8/8 PASS**

---

## completion_report

**Closed:** BE-COMPILE-BLOCK — nest watch 0 errors + reload; JD CFG GETs 200; pack resolve IT → `PACK_IT_OFFICE` 200; scope-parity 8/8; CODE-MEMORY APPEND; FE-02 already READY on bus (HDSD testids).

**Residual / open:** none for BE compile. Business J-HRM-JD-01..03 browser retest → QA-02. OBS Driver `job_family=DRIVER` after resolve live (QA note).

**ack_status:** `READY_FOR_QA`

**next_owner:** `qa`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-JD-DYNAMIC-QA-02
role: qa
entry_criteria:
  - BE-02 READY: docs/qa/evidence/po-hrm-jd-dynamic-be-02.md (nest 0 errors; CFG/resolve 200; jest 8/8)
  - FE-02 READY: docs/qa/evidence/po-hrm-jd-dynamic-fe-02.md (jdForm*/jdLibrary* HDSD testids)
  - U65 · browser-only · zero-seed · no API mutate as UF evidence
read_first:
  - docs/qa/evidence/po-hrm-jd-dynamic-qa-01.md (prior FAIL — retest same journeys)
  - docs/qa/evidence/po-hrm-jd-dynamic-be-02.md
  - docs/qa/evidence/po-hrm-jd-dynamic-fe-02.md
exit_criteria:
  - L0 qc:dev-stack PASS
  - API smoke: GET jd-field-defs/group-defs/default-packs/pack-rules?company_id=main → 200; POST resolve job_family=IT → 200 PACK_IT_OFFICE
  - J-HRM-JD-01 Settings CFG → Lưu → F5 (fields/groups/packs/rules persist)
  - J-HRM-JD-02 Thêm JD → pack resolve IT → DnD optional → Lưu snapshot v2 → F5 row
  - J-HRM-JD-03 Xem hierarchy from new snapshot; G4 đổi chức danh confirm
  - OBS Driver: resolve job_family=DRIVER → PACK_DRIVER_OPS (or document CORP fallback)
  - evidence: docs/qa/evidence/po-hrm-jd-dynamic-qa-02.md
  - hdsd_align inventory includes hdsd-jd-form-* / hdsd-jd-library-*
ack_status: PASS_TO_PM | FAIL_TO_PM
```
