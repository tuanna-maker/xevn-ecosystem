# PO-HRM-UI-BRAND-W4-REC-A-QA — Recruitment MVP spine remaster

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-REC-A-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Lane** | execution · U65 zero-seed · browser-only · U76 hdsd_align |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **FE base** | `http://127.0.0.1:5173` (portal restored) · fallback `hrm_fe :8080` also **200** |
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805` **§16** · S3=A · B4 no purple AI |
| **FE handoff** | `docs/qa/evidence/po-hrm-ui-brand-w4-rec-a.md` READY_FOR_QA |
| **FE fix** | `docs/qa/evidence/po-hrm-ui-brand-w4-rec-a-fix.md` · FIX-01 Jobs title |
| **Retest evidence** | `docs/qa/evidence/po-hrm-ui-brand-w4-rec-a-fix-qa.md` |
| **Inventory** | W3-REC-A · R01–R05, R08, R11–R12, R15 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** (Jobs title retest closed prior 17.5px FAIL) |
| **attendance_closed** | **false** |
| **face_live** | **false** |
| **remaster_program_done** | **false** |
| **ocr_invented** | **false** |
| **commit** | `dc930c5` |
| **Harness exit** | **0** |

> **History:** First seat **FAIL_TO_PM** on AC1 Jobs h2 **17.5px** (`text-xl`). FE FIX-01 moved title into `JobPostingsTab` (`font-display text-[20px]`). Retest **PASS** — this file rewritten to PASS per PM AC5.

---

## 1. Entry / L0

| Check | Result |
|-------|--------|
| HRM API `:28001` | **200** `/api/hrm` |
| XBOS API `:28002` | **200** `/api/xbos` · login **201** |
| Portal `:5173` | **200** — used as BASE (Vite restored this seat) |
| Portal `:8088` | ECONNREFUSED |
| HRM FE `:8080` | **200** `/hr/` (fallback available) |
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

---

## 3. HDSD inventory (U76)

| # | Surface | Menu / path | testid | Present |
|---|---------|-------------|--------|---------|
| R01 | Dashboard | Tuyển dụng → Dashboard | `rec-dashboard-tab-precision` | 🟢 |
| R02 | YCTD | Yêu cầu tuyển dụng | `rec-requisitions-tab-precision` | 🟢 |
| R03 | JD | Thư viện JD | `rec-jd-library-tab-precision` | 🟢 |
| R04 | Jobs | Tin Tuyển dụng | `rec-jobs-tab-precision` + h2 ≥20 | 🟢 |
| R05 | Candidates | Ứng viên | `rec-candidates-tab-precision` | 🟢 |
| R08 | Interviews | Phỏng vấn | `rec-interviews-tab-precision` | 🟢 |
| R11 | Reports | Báo cáo | `rec-reports-tab-precision` + honesty | 🟢 |
| R12 | Job create | Jobs → Tạo tin tuyển dụng | `rec-job-create-edit-dialog-precision` | 🟢 |
| R15 | Hire→Employee | Candidates → stage Đã tuyển | `rec-hire-employee-link-dialog-precision` | 🟢 |
| Wordmark | Dialog headers | `xevn-dialog-wordmark` | 🟢 Job + Hire |

---

## 4. Browser click path (U65)

1. Auth inject `ceo@xe.vn` → `/hr/recruitment?tab=dashboard&tenantId=xevn&companyId=main`
2. Deep-link each tab: `dashboard` → `requisitions` → `jd-library` → `jobs` → `candidates` → `interviews` → `reports`
3. Measure h2 title fontSize/weight/family + purple/indigo class scan
4. Reports: assert `rec-reports-campaign-honesty` banner (S3=A / campaigns OUT)
5. Jobs → **Tạo tin tuyển dụng** → measure dialog chrome → **Hủy** (no mutate)
6. Candidates → stage select → **Đã tuyển** → Hire dialog → measure → **Hủy** (no mutate)

**Script:** `scripts/qa/_tmp-po-hrm-ui-brand-w4-rec-a-qa.mjs`  
**JSON (retest):** `docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-rec-a-fix-qa-browser.FINAL.json`  
**Harness exit:** **0**

---

## 5. Exit checks matrix

| # | AC | Result | Evidence |
|---|-----|--------|----------|
| 1 | Tabs titles ≥20 · no purple AI | **PASS** | **7/7** tabs **20px/700 Montserrat** · Jobs closed prior 17.5px FAIL · purple=**0** |
| 2 | Job create/edit dialog brand bar + logo + glass + compact ~920 | **PASS** | bar **4px** `rgb(30,64,175)` · wordmark · glass blur(12px) · title **20px/700** · maxWidth **920px** |
| 3 | Hire→Employee dialog same chrome | **PASS** | bar 4px primary · logo · glass · title **20px/700** «Gắn hồ sơ nhân viên» · cancel only |
| 4 | Reports campaign honesty S3=A | **PASS** | Banner «Chỉ số chiến dịch — ngoài MVP» · R07 OUT · title 20/700 |
| 5 | theme-contrast `--strict` | **PASS** | exit **0** · pale=0 |
| 6 | Evidence WRITE | **PASS** | this file + `po-hrm-ui-brand-w4-rec-a-fix-qa.md` |

**Score:** **6/6 AC PASS** · overall **PASS**.

---

## 6. Tab title measurements (Playwright computed — retest)

| Tab | Title text | fontSize | weight | family | purple class | Verdict |
|-----|------------|----------|--------|--------|--------------|---------|
| Dashboard | Dashboard Tuyển dụng | **20px** | 700 | Montserrat | 0 | PASS |
| YCTD | Yêu cầu tuyển dụng | **20px** | 700 | Montserrat | 0 | PASS |
| JD | Thư viện mô tả công việc (JD) | **20px** | 700 | Montserrat | 0 | PASS |
| **Jobs** | Tin tuyển dụng | **20px** | 700 | Montserrat | 0 | **PASS** |
| Candidates | Quản lý ứng viên | **20px** | 700 | Montserrat | 0 | PASS |
| Interviews | Quản lý lịch phỏng vấn | **20px** | 700 | Montserrat | 0 | PASS |
| Reports | Báo cáo tuyển dụng | **20px** | 700 | Montserrat | 0 | PASS |

**Fix verified:** `JobPostingsTab` h2 inside `rec-jobs-tab-precision` uses `font-display text-[20px] font-bold` (no shell `text-xl`).

---

## 7. Dialog chrome (measured)

### Job create — `rec-job-create-edit-dialog-precision`

| Metric | Value |
|--------|--------|
| `::before` height | **4px** |
| `::before` bg | **rgb(30, 64, 175)** = `#1E40AF` |
| Glass header | **true** · `blur(12px)` |
| Wordmark | **true** |
| Title | «Tạo tin tuyển dụng mới» · **20px** · **700** · Montserrat |
| maxWidth | **920px** |
| Compact fields | line · date · select-md/sm · num |

### Hire — `rec-hire-employee-link-dialog-precision`

| Metric | Value |
|--------|--------|
| `::before` height | **4px** |
| `::before` bg | **rgb(30, 64, 175)** |
| Glass + wordmark | **true** |
| Title | «Gắn hồ sơ nhân viên» · **20px** · **700** · Montserrat |
| Compact | `xevn-field-name` select |
| Confirm | **not clicked** (U65) |

---

## 8. Screens

| # | Path |
|---|------|
| 00 | `docs/qa/evidence/screens/po-hrm-ui-brand-w4-rec-a-qa/00-recruitment-shell.png` |
| 01 | `…/01-dashboard.png` |
| 02 | `…/02-yctd.png` |
| 03 | `…/03-jd.png` |
| 04 | `…/04-jobs.png` |
| 05 | `…/05-candidates.png` |
| 06 | `…/06-interviews.png` |
| 07 | `…/07-reports.png` |
| 08 | `…/08-reports-honesty.png` |
| 09 | `…/09-job-create-dialog.png` |
| 10 | `…/10-hire-employee-dialog.png` |

**Visual review (QA):** Job/Hire dialogs show blue top brand bar, left wordmark, glass header, bold ≥20 title; Reports honesty banner visible; Jobs page h2 now matches sibling tabs at 20px Montserrat.

---

## 9. Network / mutates

| Item | Result |
|------|--------|
| Mutating methods (POST/PUT/PATCH/DELETE) | **0** |
| Seed | **None** |
| Hire confirm / Job save | **Not executed** (Hủy only) |

---

## 10. Residuals

| Item | Severity | Owner | Note |
|------|----------|-------|------|
| Jobs page h2 17.5px | **CLOSED** | — | FIX-01 + retest PASS |
| W3-REC-B / R07 campaigns remaster | OUT | — | Honesty only — not claimed |
| Remaster DONE / ATT CLOSED / Face LIVE | OUT | — | **false** |

---

## 11. Honesty locks (cấm honored)

| Claim | Status |
|-------|--------|
| Face LIVE | **false** |
| Attendance CLOSED | **false** |
| Remaster program DONE | **false** |
| OCR invent | **false** |
| Seed in evidence | **false** |
| S3=A | **held** (campaigns OUT honesty) |

---

## Handoff

```yaml
work_item_id: PO-HRM-UI-BRAND-W4-REC-A-QA
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
verdict: PASS
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w4-rec-a-qa.md
fix_retest: docs/qa/evidence/po-hrm-ui-brand-w4-rec-a-fix-qa.md
browser_json: docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-rec-a-fix-qa-browser.FINAL.json
harness: scripts/qa/_tmp-po-hrm-ui-brand-w4-rec-a-qa.mjs
checks: 6/6
blocking: none
next_owner: pm
next_dispatch_prompt: |
  Task pm — intake PASS_TO_PM PO-HRM-UI-BRAND-W4-REC-A (+ FIX-QA);
  DEF R04 Jobs title CLOSED (20px Montserrat); dialogs+Reports+theme-contrast PASS;
  do not claim remaster DONE / Face LIVE / Attendance CLOSED;
  dispatch next W4 brand wave from backlog (or QC spot if gate wave).
```

---

## completion_report

**Closed:** Browser U65 QA on Tuyển dụng for W4-REC-A — theme-contrast strict 0; all 7 tab titles ≥20 Montserrat (Jobs retest closed 17.5px); Job create + Hire dialog chrome PASS; Reports campaign honesty S3=A PASS; mutates=0.

**Residual:** None blocking. Not remaster DONE / Face LIVE / Attendance CLOSED.
