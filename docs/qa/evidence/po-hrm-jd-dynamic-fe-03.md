# Evidence — PO-HRM-JD-DYNAMIC-FE-03

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-JD-DYNAMIC-FE-03` |
| **role** | `dev-fe` |
| **date** | 2026-08-06 |
| **change_mode** | FIX · preserve_default · U65 no seed · no dual-write · no remaster/face_live |
| **entry** | QA FAIL `docs/qa/evidence/po-hrm-jd-dynamic-qa-02.md` · BE-02 LIVE OK |
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | `qa` · `PO-HRM-JD-DYNAMIC-QA-03` |

---

## Residuals closed

| ID | Priority | Fix |
|----|----------|-----|
| **FE-RESOLVE-GROUPS-MAP** | P0 | `normalizeJdPackResolveResult` maps `always_on_groups \|\| groups \|\| pack.groups(always_on)` → `groups[]`; wired in `resolveJdPack` |
| **FE-RULES-PUT-STRIP** | P1 | `stripJdPackRulesForPut` keeps DTO-only (`priority`, `match_type`, `match_value`, `pack_id`/`pack_code`, `condition_json`, `is_active`); wired in `putJdPackRules` |

**Not in this seat:** OBS-IT-POSITION-CONFIG (catalog / job_family) · OBS-DRIVER-UI-PREVIEW (soft).

---

## Contract (spec says / code does)

| Topic | Spec / BE | FE before | FE after |
|-------|-----------|-----------|----------|
| Resolve body | `always_on_groups` (+ nested `pack.groups`) | Writer `res.groups` → `[]` → empty canvas → create 400 `HRM-JD-LAYOUT-EMPTY` | `resolveJdPack` returns normalized `groups[]` ≥1 when API has always_on |
| Rules PUT | `PutJdPackRulesDto` / `JdPackRuleItemDto` whitelist | Settings Lưu sent full GET objects → 400 `HRM-VAL-001` | PUT body strips id/company_id/created_at/pack_label/… |

---

## Files touched

- `apps/web/hrm/src/lib/jdPackClientNormalize.ts` (**new** pure helpers)
- `apps/web/hrm/src/lib/jdPackClientNormalize.test.ts` (**new** — 5 tests)
- `apps/web/hrm/src/integrations/hrmApi.ts` — `resolveJdPack` normalize · `putJdPackRules` strip · `HrmJdPackRule` fields
- `apps/web/hrm/src/components/recruitment/JdTemplateWriterDialog.tsx` — applyResolve uses normalized groups
- `apps/web/hrm/src/components/settings/JdDynamicSettingsPanel.tsx` — onSaveRules note (strip in API client)
- `docs/program/slices/PO-HRM-JD-DYNAMIC-TOPCV.md` — FE-03 allowed_paths
- `docs/qa/evidence/po-hrm-jd-dynamic-fe-03.md` (this file)

---

## must_keep verified

| Item | Status |
|------|--------|
| Settings Cấu hình JD mount | kept |
| HDSD testids (`hdsd-jd-*`) from FE-02 | untouched |
| No JobPostingsTab JD write | untouched |
| TopCV view from snapshot | untouched |
| `remaster_program_done` / `face_live` claimed | **false** |
| Seed | **false** |

---

## Unit tests

```text
pnpm exec vitest run src/lib/jdPackClientNormalize.test.ts src/lib/jdDynamicSnapshot.test.ts
→ 2 files · 10 tests PASS
```

Coverage asserts:
1. `always_on_groups` → `groups[]` with `source=pack_always_on`
2. empty `groups` + non-empty `always_on_groups` → prefers always_on
3. fallback `groups` when always_on absent
4. fallback `pack.groups` always_on + optional_groups
5. rules strip drops id/company_id/created_at/pack_label; keeps DTO fields

---

## Expected QA browser AC (not claimed here — U65 FE-only seat unit+wire)

| AC | Expect after QA-03 |
|----|--------------------|
| After pick position | `jd-writer-group-*` ≥1 |
| Lưu JD | `POST …/job-templates` **2xx** · `layout_snapshot.groups` non-empty |
| Settings Rule Lưu | `PUT …/jd-pack-rules` **2xx** |
| G4 | confirm dialog when canvas has groups + change position |

---

## completion_report

**Closed:** P0 resolve groups map + P1 rules PUT DTO strip; vitest 5 new + snapshot regression PASS; Settings/HDSD/JobPostings/TopCV must_keep preserved.

**Open / residual for QA:** browser J01 rules + J02 create+F5 + J03 wave snapshot + G4; OBS-IT-POSITION-CONFIG remains catalog (not FE wire).

**ack_status:** `READY_FOR_QA`

**next_owner:** `qa`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-JD-DYNAMIC-QA-03
role: qa
entry_criteria:
  - FE-03 READY_FOR_QA: docs/qa/evidence/po-hrm-jd-dynamic-fe-03.md
  - prior FAIL: docs/qa/evidence/po-hrm-jd-dynamic-qa-02.md
  - U65 · browser-only · zero-seed · no dual-write job_postings · no remaster/face_live
read_first:
  - docs/qa/evidence/po-hrm-jd-dynamic-fe-03.md
  - docs/qa/evidence/po-hrm-jd-dynamic-qa-02.md residuals FE-RESOLVE-GROUPS-MAP + FE-RULES-PUT-STRIP
persona: ceo@xe.vn / Xevn@2026 · company_id=main · portal :5173
exit_criteria:
  - J-HRM-JD-01: Settings Rule Lưu → PUT jd-pack-rules 2xx + F5 rules persist (field create still PASS)
  - J-HRM-JD-02: Thêm JD → pick position → jd-writer-group-* ≥1 → Lưu → POST job-templates 2xx · layout_snapshot.groups non-empty → F5 row
  - J-HRM-JD-03: Xem on wave-created row → jd-view-group-* ≥1 hierarchy §3.6
  - G4: đổi chức danh with non-empty canvas → jd-writer-pack-confirm · merge keeps values
  - HDSD hdsd-jd-* still undefined=0
  - evidence: docs/qa/evidence/po-hrm-jd-dynamic-qa-03.md
  - cấm: seed · API-only PASS · dual-write job_postings
ack_status: PASS_TO_PM | FAIL_TO_PM
```
