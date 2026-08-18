# PO-HRM-UI-BRAND-W4-REC-A-FIX-01-QA — Jobs title retest (STALL #3)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-REC-A-FIX-01-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **stall** | **#3** — RUN harness NOW (seat EXECUTE + WRITE) |
| **Lane** | execution · U65 zero-seed · browser-only · U76 hdsd_align |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **FE base** | `http://127.0.0.1:5173` (portal) · `hrm_fe :8080` also **200** |
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805` **§16** · S3=A · B4 no purple AI |
| **Prior FAIL** | Jobs h2 **17.5px** Source Sans (`text-xl`) — DEF R04 |
| **FE fix** | `docs/qa/evidence/po-hrm-ui-brand-w4-rec-a-fix.md` READY_FOR_QA |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** (AC1 Jobs ≥20 Montserrat + R12/R15/Reports/theme hold) |
| **attendance_closed** | **false** |
| **face_live** | **false** |
| **remaster_program_done** | **false** |
| **ocr_invented** | **false** |
| **seed_used** | **false** |
| **commit** | `dc930c5` |
| **Harness exit** | **0** |
| **startedAt / endedAt** | `2026-08-05T07:24:24.628Z` → `2026-08-05T07:25:22.476Z` |

---

## 1. Entry / L0

| Check | Result |
|-------|--------|
| HRM API `:28001` | **200** `/api/hrm` |
| XBOS API `:28002` | **200** `/api/xbos` |
| Portal `:5173` | **200** — BASE (`PORTAL_MODE=true`) |
| Portal `:8088` | ECONNREFUSED |
| HRM FE `:8080` | **200** `/hr/` |
| Seed / API invent | **None** (U65) — mutates=**0** |
| Face LIVE / ATT CLOSED / remaster DONE | **Not claimed** |

---

## 2. Theme contrast (AC #5)

```text
pnpm run verify:xevn:theme-contrast -- --strict
→ exit 0
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] STRICT PASS — 0 pale hits
```

Harness also re-ran theme-contrast → exit **0**.

---

## 3. Browser execution (STALL #3 — EXECUTE NOW)

**Script:** `node scripts/qa/_tmp-po-hrm-ui-brand-w4-rec-a-qa.mjs`  
**QA_OUT_JSON (isolate):** `docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-rec-a-fix-qa-S3.FINAL.json`  
**Harness exit:** **0** · `verdict: PASS` · `ack_status: PASS_TO_PM`  
**Theme log:** `docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-rec-a-fix-qa-theme.txt`

Click path (U65):
1. Auth inject `ceo@xe.vn` → `/hr/recruitment?tab=…&tenantId=xevn&companyId=main`
2. Deep-link tabs: dashboard → requisitions → jd-library → **jobs** → candidates → interviews → reports
3. Measure page titles ≥20/700 Montserrat · purple class = 0
4. Reports honesty banner S3=A
5. Jobs → Tạo tin → R12 dialog chrome → **Hủy**
6. Candidates → Đã tuyển → R15 Hire dialog chrome → **Hủy**

Screens: `docs/qa/evidence/screens/po-hrm-ui-brand-w4-rec-a-qa/` (00–10).

---

## 4. Exit checks matrix

| # | AC | Prior | STALL #3 retest | Evidence |
|---|-----|-------|-----------------|----------|
| 1 | Jobs «Tin tuyển dụng» ≥20/700 Montserrat | **FAIL 17.5px** Source Sans | **PASS 20px / 700 / Montserrat** | `checks.tabs_titles_no_purple.tabs.jobs` |
| 2 | All other REC tab titles ≥20 · no purple | PASS | **PASS** (7/7) | dashboard…reports all 20/700 Montserrat · purple=0 |
| 3 | Job create R12 chrome | PASS | **PASS** | bar **4px** `rgb(30,64,175)` · wordmark · glass blur(12px) · title 20/700 · maxWidth **920px** |
| 4 | Hire→Employee R15 chrome | PASS | **PASS** | bar 4px primary · wordmark · glass · title 20/700 «Gắn hồ sơ nhân viên» · cancel only |
| 5 | Reports campaign honesty S3=A | PASS | **PASS** | «Chỉ số chiến dịch — ngoài MVP» · R07 OUT |
| 6 | theme-contrast `--strict` | PASS | **PASS** | exit **0** · pale=0 |
| 7 | Zero mutates (U65) | PASS | **PASS** | mutates=**0** |

**Score:** **7/7 AC PASS** · overall **PASS**.

---

## 5. Jobs title delta (blocking AC closed)

| Metric | Prior FAIL | STALL #3 FIX retest |
|--------|------------|---------------------|
| text | Tin tuyển dụng | Tin tuyển dụng |
| fontSize | **17.5px** | **20px** |
| fontWeight | 700 | **700** |
| fontFamily | Source Sans 3 | **Montserrat, system-ui, sans-serif** |
| purple class | 0 | 0 |
| Verdict | FAIL | **PASS** |

FE root cause closed: `JobPostingsTab` page title `xevn-type-title font-display text-[20px] font-bold` inside `rec-jobs-tab-precision`; shell `text-xl` h2 removed from `Recruitment.tsx`.

---

## 6. Tab titles (computed)

| Tab | Title | fs | weight | family | Verdict |
|-----|-------|-----|--------|--------|---------|
| Dashboard | Dashboard Tuyển dụng | 20px | 700 | Montserrat | PASS |
| YCTD | Yêu cầu tuyển dụng | 20px | 700 | Montserrat | PASS |
| JD | Thư viện mô tả công việc (JD) | 20px | 700 | Montserrat | PASS |
| **Jobs** | Tin tuyển dụng | **20px** | **700** | **Montserrat** | **PASS** |
| Candidates | Quản lý ứng viên | 20px | 700 | Montserrat | PASS |
| Interviews | Quản lý lịch phỏng vấn | 20px | 700 | Montserrat | PASS |
| Reports | Báo cáo tuyển dụng | 20px | 700 | Montserrat | PASS |

---

## 7. Dialog chrome spot (R12 + R15)

### R12 — `rec-job-create-edit-dialog-precision`

| Metric | Value | Verdict |
|--------|-------|---------|
| beforeH / beforeBg | **4px** / `rgb(30, 64, 175)` | PASS |
| wordmark | present | PASS |
| glass | blur(12px) | PASS |
| title | «Tạo tin tuyển dụng mới» 20px/700 Montserrat | PASS |
| maxWidth | 920px | PASS |

### R15 — `rec-hire-employee-link-dialog-precision`

| Metric | Value | Verdict |
|--------|-------|---------|
| beforeH / beforeBg | **4px** / `rgb(30, 64, 175)` | PASS |
| wordmark | present | PASS |
| glass | blur(12px) | PASS |
| title | «Gắn hồ sơ nhân viên» 20px/700 Montserrat | PASS |
| mutate | cancel only · POST/PUT=0 | PASS |

---

## 8. Honesty / residuals

| Claim | Status |
|-------|--------|
| remaster program DONE | **false** — not claimed |
| Face LIVE | **false** |
| Attendance CLOSED | **false** |
| OCR invent | **false** |
| Seed | **false** |
| S3=A honesty | **held** |

**Residuals:** none P0/P1 for FIX-01 scope.

**not promoted:** remaster DONE · Face LIVE · Attendance CLOSED · REC-B / R07 campaigns remaster.

---

## 9. completion_report

**Closed:** STALL #3 retest of `PO-HRM-UI-BRAND-W4-REC-A-FIX-01` — harness exit 0; Jobs title **20px/700 Montserrat** PASS (was 17.5px); R12+R15 dialog chrome hold PASS; Reports honesty PASS; theme-contrast `--strict` exit 0; mutates=0; U65 zero-seed.

**Residual:** none for this work_item.

**ack_status:** PASS_TO_PM  
**next_owner:** pm  
**evidence_path:** `docs/qa/evidence/po-hrm-ui-brand-w4-rec-a-fix-qa.md`  
**machine_json:** `docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-rec-a-fix-qa-S3.FINAL.json`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-UI-BRAND-W4-REC-A-FIX-01-QC
from_role: pm
to_role: qc
priority: P1
entry_criteria: QA PASS_TO_PM @ docs/qa/evidence/po-hrm-ui-brand-w4-rec-a-fix-qa.md · STALL #3 harness exit 0 · Jobs 20/700 Montserrat · R12+R15 chrome PASS · theme-contrast --strict exit 0 · JSON docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-rec-a-fix-qa-S3.FINAL.json
exit_criteria:
  1) Audit evidence vs prior FAIL (17.5px Source Sans) → CLOSED
  2) Confirm honesty flags: remaster DONE / Face LIVE / ATT CLOSED = false
  3) GO or GWC with residual list · WRITE docs/qa/evidence/po-hrm-ui-brand-w4-rec-a-fix-qc.md
cấm: seed · invent remaster DONE · Face LIVE · Attendance CLOSED
```
