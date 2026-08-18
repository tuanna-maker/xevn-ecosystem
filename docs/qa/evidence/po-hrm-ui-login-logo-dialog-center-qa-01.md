# QA — PO-HRM-UI-PORTAL-LOGIN-LOGO-01 + PO-HRM-UI-DIALOG-CENTER-01

**date:** 2026-08-06  
**role:** qa  
**ack_status:** **FAIL_TO_PM**  
**U65:** browser-only · zero-seed · mutates=0  
**locks:** face_live=false · remaster_program_done=false · no product GO

## Per work item

| work_item_id | Verdict | Evidence |
|--------------|---------|----------|
| PO-HRM-UI-PORTAL-LOGIN-LOGO-01 | **PASS** | `po-hrm-ui-portal-login-logo-01.md` § QA verdict |
| PO-HRM-UI-DIALOG-CENTER-01 | **FAIL** | `po-hrm-ui-dialog-center-01.md` § QA verdict |

**Wave rollup:** FAIL_TO_PM (dialog P0 blocks wave PASS).

## Env / harness

- portal `:5173` · hrm-api `:28001` · xbos `:28002`
- account `ceo@xe.vn` / `Xevn@2026` (FE login)
- `scripts/qa/_tmp-po-hrm-ui-login-logo-dialog-center-qa.mjs` exit **2**
- JSON: `_tmp-po-hrm-ui-login-logo-dialog-center-qa.json`
- screens: `docs/qa/evidence/screens/po-hrm-ui-login-logo-dialog-center-01/`

## Defect (P0)

**D-PO-HRM-UI-DIALOG-CENTER-01:** Create job dialog opens with overlay but panel `boundingBox.y=900` (vh=900) — off-screen. Classes include `fixed inset-0 m-auto` but computed `position: relative`, `overflowY: hidden`.

## next_owner

`dev-fe`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-DIALOG-CENTER-01-R2
role: dev-fe
change_mode: FIX
entry: QA FAIL_TO_PM — docs/qa/evidence/po-hrm-ui-dialog-center-01.md § QA verdict
symptom: CC embed /command-center/hrm/recruitment → Tin Tuyển dụng → Tạo tin tuyển dụng
  — overlay OK, dialog panel boundingBox.y=900 (off-screen); computed position=relative
  despite class "fixed inset-0 m-auto h-fit max-h-[90vh] overflow-y-auto"
must_keep: DialogHeader glass/wordmark · Escape · portal a11y mirror · JobPostings mutate wires
verify: runtime getComputedStyle(position)==='fixed'; panel fully in viewport; vertical center;
  overflow-y auto scroll; Save/Cancel visible; Escape closes
U65: no seed · evidence append R2 · READY_FOR_QA
forbidden: remaster_program_done claim · Face LIVE
```
