# Slice — PO-HRM-JD-DYNAMIC-TOPCV

**Sponsor:** 2026-08-06 — JD trường động + view kiểu TopCV; popup logo trắng; font hệ thống to/nét; title-first.

## sponsor_literal
1. Logo trong **popup/dialog** không nền đen (trắng/surface trắng) — login đã OK, popup còn sai.
2. Cấu hình trường JD động ở **Cài đặt** → lúc thêm JD **kéo** trường vào → popup thêm JD **dynamic** theo → màn **view JD** hiện đại (TopCV / nền tảng tuyển VN).
3. Font toàn hệ **to hơn, nét hơn** — tìm root (html 87.5% / density) rồi chỉnh đúng chuẩn enterprise.
4. Popup thêm mới: **trường tiêu đề đầu tiên**.
5. Members rà soát theo chuẩn HRM enterprise — không invent creative ngoài literal.

## Waves
| Wave | Owner | work_item_id |
|------|-------|----------------|
| P0 UI | dev-fe | `PO-HRM-UI-P0-LOGO-FONT-TITLE-01` |
| Spec process | ba-process | `PO-HRM-JD-DYNAMIC-SPEC-01` |
| Spec data | ba-data | `PO-HRM-JD-DYNAMIC-DATA-01` |
| Arch option | sa | `PO-HRM-JD-DYNAMIC-ARCH-01` |
| Arch deepen (sponsor A/Q1/Q6) | sa | `PO-HRM-JD-DYNAMIC-ARCH-02` **PASS** — unlock Dev |
| Impl BE | dev-be | `PO-HRM-JD-DYNAMIC-BE-01` |
| Impl FE | dev-fe | `PO-HRM-JD-DYNAMIC-FE-01` |
| QA/QC | qa → qc | `PO-HRM-JD-DYNAMIC-QA-01` after both READY_FOR_QA |

## must_keep
- U65 zero-seed · dialog center R2 CLOSED · login logo white pad
- face_live=false · remaster_program_done=false
- JD master FR-UC-BP-REC-00 spine (không xóa YCTD linkage)

## creative_extra
`none` — TopCV = **quality bar / layout hierarchy** sponsor named; không tự thêm brand màu lạ ngoài token XEVN.

## allowed_paths (FE-01 unlock — ADD 2026-08-06)
- `apps/web/hrm/src/pages/Settings.tsx`
- `apps/web/hrm/src/components/settings/JdDynamicSettingsPanel.tsx`
- `apps/web/hrm/src/components/recruitment/JobTemplatesTab.tsx`
- `apps/web/hrm/src/components/recruitment/JdTemplateWriterDialog.tsx`
- `apps/web/hrm/src/components/recruitment/JdTemplateViewPanel.tsx`
- `apps/web/hrm/src/hooks/useJobTemplates.ts`
- `apps/web/hrm/src/integrations/hrmApi.ts` (JD dynamic client + template extend)
- `apps/web/hrm/src/lib/jdDynamicSnapshot.ts` (+ `.test.ts`)
- `apps/web/hrm/src/lib/jobTemplatesPositionCode.test.ts`
- `docs/qa/evidence/po-hrm-jd-dynamic-fe-01.md`

## allowed_paths (FE-02 — FIX HDSD testids 2026-08-06)
- `apps/web/hrm/src/lib/hdsdMutateTestIds.ts` (+ `.test.ts`)
- `docs/qa/evidence/po-hrm-jd-dynamic-fe-02.md`
- *(components already wire `HDSD_MUTATE_TEST_IDS.jdForm*` / `jdLibrary*` from FE-01 — no behavior change)*

## allowed_paths (FE-03 — FIX resolve groups map + rules PUT strip 2026-08-06)
- `apps/web/hrm/src/lib/jdPackClientNormalize.ts` (+ `.test.ts`)
- `apps/web/hrm/src/integrations/hrmApi.ts` (`resolveJdPack` normalize · `putJdPackRules` strip)
- `apps/web/hrm/src/components/recruitment/JdTemplateWriterDialog.tsx` (applyResolve comment/source)
- `apps/web/hrm/src/components/settings/JdDynamicSettingsPanel.tsx` (onSaveRules note)
- `docs/qa/evidence/po-hrm-jd-dynamic-fe-03.md`

## forbidden_paths
- `JobPostingsTab` as JD master write
- invent TopCV brand / purple gradients
- `remaster_program_done` claim
