# Evidence — PO-HRM-JD-DYNAMIC-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-JD-DYNAMIC-FE-01` |
| **role** | `dev-fe` |
| **date** | 2026-08-06 |
| **change_mode** | ADD · preserve_default · code_memory_required |
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | `qa` *(when BE also READY_FOR_QA)* |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `docs/program/specs/PO-HRM-JD-GROUP-SPEC-01.md` — UC-BP-REC-00d/e/f/g/h · AC-JD-GRP-01..08 · Q1 Settings / Q6 snapshot · G4 confirm |
| **tech_spec** | `docs/program/specs/PO-HRM-JD-GROUP-ARCH-01.md` §1 runtime · §2 FG1–3 / FW / FV · §3.6 API · §3.7 snapshot v2 |
| **world** | `docs/program/specs/PO-HRM-JD-WORLD-BENCHMARK-01.md` §3.6 view order · §4 group catalog |
| **db_design** | `docs/program/specs/PO-HRM-JD-DYNAMIC-ARCH-02.md` §3 + GROUP-DATA pointer; snapshot on `job_description_templates` |
| **api_design** | ARCH-02 §2 F-JD-DEF/LAY/01..04 · GROUP-ARCH §3.6 F-JD-GRP/PCK/RUL + resolve · GROUP-DATA §11 stubs aligned under `/api/hrm/recruitment/*` |
| **slice** | `docs/program/slices/PO-HRM-JD-DYNAMIC-TOPCV.md` |
| **sponsor_confirm** | ARCH-02 A/Q1/Q6 LOCKED · GROUP triad unlock (ARCH+SPEC+DATA on disk) |
| **uc_ids** | UC-BP-REC-00a..h · spine FR-UC-BP-REC-00 |
| **change_mode** | ADD |
| **must_keep** | position_code catalog · YCTD soft FK · no job_postings dual-write · U65 · creative_extra=none · remaster_program_done=false |

---

## Closed (FE)

| Surface | Implementation |
|---------|----------------|
| **Settings FG1–FG3 + F1/F2** | `JdDynamicSettingsPanel` tab **Cấu hình JD** on `/settings` — fields · groups · packs · rules · L1 layout publish |
| **Thư viện writer** | `JdTemplateWriterDialog` — `resolveJdPack` API → always_on groups; optional group DnD (`@hello-pangea/dnd`); title-first; save `layout_snapshot` v2 + `values_json` |
| **View TopCV** | `JdTemplateViewPanel` — render by snapshot `groups[].sort_order` (meta chips → sections); XEVN tokens only |
| **G4** | AlertDialog «Áp pack mới?» — `mergePackOntoCanvas` giữ values trùng key, detach groups không wipe |
| **API client** | `hrmApi`: DEF/LAY/GRP/PCK/RUL + `resolveJdPack` + `getJobDescriptionTemplate` |
| **Pure helpers** | `jdDynamicSnapshot.ts` — build/merge/order; **no PACK_* selection logic** |

### Tests

```text
pnpm exec vitest run src/lib/jdDynamicSnapshot.test.ts src/lib/jobTemplatesPositionCode.test.ts
→ 2 files · 9 tests PASS
```

### Forbidden checks

- JobPostingsTab **not** used as JD master write path
- No TopCV purple / invent brand
- No `remaster_program_done` claim
- Pack selection only via `POST …/jd-pack-rules/resolve`

---

## Residual

| Item | Owner |
|------|--------|
| BE endpoints not yet in `hrm-api` tree at FE cut — Settings/writer show honest error + L1/legacy flat fallback until BE READY | `dev-be` PO-HRM-JD-DYNAMIC-BE-01 |
| Browser U65 J-HRM-JD-01..03 / GRP journeys | `qa` after BE READY |
| Path alias DATA `/settings/jd-*` vs ARCH `/recruitment/jd-*` — FE locked to **recruitment** prefix (ARCH-02 / GROUP-ARCH) | BE must expose same; SA if façade needed |

---

## Files touched

- `apps/web/hrm/src/pages/Settings.tsx`
- `apps/web/hrm/src/components/settings/JdDynamicSettingsPanel.tsx` *(new)*
- `apps/web/hrm/src/components/recruitment/JobTemplatesTab.tsx`
- `apps/web/hrm/src/components/recruitment/JdTemplateWriterDialog.tsx` *(new)*
- `apps/web/hrm/src/components/recruitment/JdTemplateViewPanel.tsx` *(new)*
- `apps/web/hrm/src/hooks/useJobTemplates.ts`
- `apps/web/hrm/src/integrations/hrmApi.ts`
- `apps/web/hrm/src/lib/jdDynamicSnapshot.ts` *(new)* + `.test.ts`
- `apps/web/hrm/src/lib/jobTemplatesPositionCode.test.ts`
- `docs/program/slices/PO-HRM-JD-DYNAMIC-TOPCV.md`
- `docs/qa/evidence/po-hrm-jd-dynamic-fe-01.md`

---

## Handoff

| Field | Value |
|-------|--------|
| **ack_status** | `READY_FOR_QA` |
| **next_owner** | `qa` |
| **evidence_path** | `docs/qa/evidence/po-hrm-jd-dynamic-fe-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-JD-DYNAMIC-QA-01
role: qa
entry_criteria:
  - FE READY_FOR_QA: docs/qa/evidence/po-hrm-jd-dynamic-fe-01.md
  - BE READY_FOR_QA: docs/qa/evidence/po-hrm-jd-dynamic-be-01.md (required — APIs live)
  - U65 browser-only · zero-seed
read_first:
  - docs/qa/evidence/po-hrm-jd-dynamic-fe-01.md
  - docs/program/specs/PO-HRM-JD-GROUP-SPEC-01.md AC-JD-GRP-*
  - docs/program/PROGRAM_JOURNEY_MAP.md J-HRM-JD-* / GRP
exit_criteria:
  - J-HRM-JD-01 Settings groups/packs/rules → Lưu → F5
  - J-HRM-JD-02 Thư viện Thêm → resolve pack → optional DnD → Lưu snapshot v2 → F5
  - J-HRM-JD-03 Xem hierarchy §3.6 from snapshot
  - G4 đổi chức danh → confirm · values kept
  - No JobPostingsTab JD write · no seed
evidence_path: docs/qa/evidence/po-hrm-jd-dynamic-qa-01.md
ack_status: PASS_TO_PM
```
