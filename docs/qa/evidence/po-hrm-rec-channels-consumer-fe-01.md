# PO-HRM-REC-CHANNELS-CONSUMER-FE-01

**work_item_id:** `PO-HRM-REC-CHANNELS-CONSUMER-FE-01`  
**role:** dev-fe  
**date:** 2026-08-11  
**U65:** browser QA only — no seed in evidence  
**ack_status:** `READY_FOR_QA`

## spec_read_ack

| Field | Value |
|-------|--------|
| srs | `docs/program/specs/BA-HRM-REC-CHANNELS-CONSUMER-01.md` · FR-HRM-SC-CH-01 · AC-SET-CONSUMER-CH-REC-01..03 |
| tech_spec | `docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.2 |
| db_design | `docs/hrm/DB_DESIGN_HRM_SETTINGS_E1B.md` §6 `Candidate.source` |
| api_design | `GET /api/hrm/settings-catalogs` (cached overview) · `POST/PATCH …/candidates-pool` `source` = code |
| uc_ids | AC-SET-CONSUMER-CH-REC-01..03 (UF-HRM-10 consumer slice only) |
| change_mode | ADD |
| must_keep | DEPTCONREG1 sealed · YCTD SELECT · pipeline stage EFF · G-DB-01 hire link |

## Delivered

| AC | Implementation |
|----|----------------|
| AC-REC-01 | `CandidateFormDialog` — `useSettingsCatalogsOverview` + `candidateSourcePickerOptions`; POST `source` = catalog **code** when EFF>0; EFF=0 → legacy list + honest empty CTA + link `/settings` |
| AC-REC-02 | `CandidatesTab` — `candidateSourceFilterValues` + `resolveCandidateSourceDisplayLabel` on filter chips |
| AC-REC-03 | List badge + `CandidateDetailView` contact/info source rows use same resolve |

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/catalogSearchPicker.ts` | `recruitmentChannelOptionsFromCatalog` · `resolveRecruitmentChannelLabel` |
| `apps/web/hrm/src/lib/candidateRecruitmentChannelUi.ts` | Picker/label/filter helpers + legacy fallback |
| `apps/web/hrm/src/components/recruitment/CandidateFormDialog.tsx` | Wire source field |
| `apps/web/hrm/src/components/recruitment/CandidatesTab.tsx` | Filter + list badge |
| `apps/web/hrm/src/components/recruitment/CandidateDetailView.tsx` | Detail source label |

**Not claimed:** UF-HRM-10 full PASS · `CandidateSourceStats` (P1 residual) · BE `VAL-REC-CH-BE-01`

## Verify (dev)

```bash
pnpm --filter @xevn/hrm-web exec vitest run \
  src/lib/catalogSearchPicker.test.ts \
  src/lib/candidateRecruitmentChannelUi.test.ts \
  src/lib/po-hrm-rec-channels-consumer-fe-01.test.ts \
  src/components/recruitment/CandidateFormDialog.source.test.ts \
  --reporter=dot
```

## QA entry (U65 FE)

- Persona: `ceo@xe.vn` / Command Center → HRM → Tuyển dụng → tab **Ứng viên**
- Preconditions: `hrm-api` up; Settings → đồng bộ **Kênh tuyển dụng** (EFF > 0) từ XBOS qua luồng FE (no seed)
- UF slice: Tạo/sửa UV → trường **Nguồn** chỉ hiện mã catalog → Lưu → Network POST/PATCH `source` = **code** → F5 list/detail label khớp
- Filter: lọc theo nguồn dùng cùng label map
- Regression: YCTD bắt buộc create · stage catalog · hire soft-link unchanged

## completion_report

**Closed:** recruitment_channels consumer on UV form + filter/list/detail display; vitest source locks.  
**Open:** `CandidateSourceStats` P1; BE catalog assert optional `VAL-REC-CH-BE-01`; legacy DB values migration.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-PO-HRM-REC-CHANNELS-CONSUMER-01
role: qa
entry_criteria: PO-HRM-REC-CHANNELS-CONSUMER-FE-01 READY_FOR_QA; hrm-api + portal up; U65 zero-seed
exit_criteria:
  - Browser: login ceo@xe.vn → HRM REC tab Ứng viên → sync kênh TD từ Settings FE → Tạo UV → chọn Nguồn catalog → Lưu 2xx → F5 label list/detail
  - Network: POST/PATCH candidates-pool source = catalog code (not VI label)
  - Filter nguồn + badge list khớp resolve label (AC-REC-02/03)
  - Regression: YCTD create · stage EFF · không claim UF-HRM-10 full PASS
evidence_path: docs/qa/evidence/qa-po-hrm-rec-channels-consumer-01.md
cấm: seed; probe-only PASS
```
