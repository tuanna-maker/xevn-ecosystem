# Evidence — PO-HRM-UI-HEADER-JD-DND-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-HEADER-JD-DND-QA-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-06 |
| **lane** | execution · U65 zero-seed · browser-only |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **portal_url** | `http://127.0.0.1:5173` · hard refresh via `_qa` cache-bust + reload |
| **FE READY** | `docs/qa/evidence/po-hrm-ui-header-jd-dnd-fe-01.md` (5/5) |
| **process context** | `docs/qa/evidence/po-hrm-rec-ux-qc-process-01.md` (NO-GO process — prior GWC ≠ module) |
| **sponsor baseline** | `docs/qa/evidence/sponsor-console-20260806-recruitment.log` |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** (4/4 UF · narrow retest of FE-01 residuals only) |
| **commit** | `dc930c5` |
| **harness exit** | **0** |
| **startedAt / endedAt** | `2026-08-06T08:06:18.675Z` → `2026-08-06T08:06:43.067Z` |
| **jd_dynamic_done** | **false** (not claimed) |
| **remaster_program_done** | **false** |
| **recruitment_uat_ready** | **false** |
| **product_go** | **false** |
| **seed_used** | **false** |

---

## 1. Entry / L0

| Check | Result |
|-------|--------|
| `pnpm run qc:fe-be-health` | **PASS** · ALL PASS |
| HRM API `:28001` | **200** `/api/hrm` |
| XBOS API `:28002` | **200** `/api/xbos` |
| Portal `:5173` | **200** — BASE |
| HRM FE `:8080` | **200** `/hr/` |
| Seed / API invent / inbox seed | **None** (U65) |
| Persist mutate (POST job-templates / interview) | **None** — resolve-only POST; dialogs closed via Hủy/Esc |

**Harness:** `node scripts/qa/_tmp-po-hrm-ui-header-jd-dnd-qa-01.mjs`  
**JSON:** `docs/qa/evidence/_tmp-po-hrm-ui-header-jd-dnd-qa-01.FINAL.json`  
**Screens:** `docs/qa/evidence/screens/po-hrm-ui-header-jd-dnd-qa-01/` (01–07)

---

## 2. HDSD inventory (U76)

| # | Menu / màn / nút | Exercised |
|---|------------------|-----------|
| 1 | Portal → `/command-center` · TopHeader + `cc-persona-bar` (BOD / Quản lý / Nhân viên) | Yes · click pills |
| 2 | Tuyển dụng → Thư viện JD → **Thêm JD** → pick chức danh → **drag canvas reorder** → Hủy | Yes · no Lưu |
| 3 | Tuyển dụng → Ứng viên → row → **Lên lịch phỏng vấn** dialog → Hủy | Yes · no submit |

---

## 3. Retest matrix (🟢/🔴)

| # | UF / AC | Result | Evidence |
|---|---------|--------|----------|
| 1 | **UF-CC-HEADER-01** — single TopHeader `portal-brand-mark`; NO duplicate «XeVN OS / Command Center» page strip; persona BOD/Quản lý/Nhân viên usable | 🟢 **PASS** | brandMarkCount=**1** · duplicateStrips=[] · personaLabels=`BOD\|Quản lý\|Nhân viên` · clicked · `docs/qa/evidence/screens/po-hrm-ui-header-jd-dnd-qa-01/01-cc-shell.png` · `docs/qa/evidence/screens/po-hrm-ui-header-jd-dnd-qa-01/02-cc-persona.png` |
| 2 | **UF-JD-DND-01** — drag ≥1 canvas group OR palette→canvas; writer usable after drop; ZERO Unable-to-find-drag-handle invariants | 🟢 **PASS** | mode=`canvas-reorder` · groups **6→6** · writer+submit still up · singular=**0** plural=**0** · `docs/qa/evidence/screens/po-hrm-ui-header-jd-dnd-qa-01/04-jd-writer-before-dnd.png` · `docs/qa/evidence/screens/po-hrm-ui-header-jd-dnd-qa-01/05-jd-writer-after-dnd.png` |
| 3 | **UF-REC-INTERVIEW-UTF-01** — dialog «Lên lịch phỏng vấn» đúng dấu; labels Ngày/Giờ/Thời lượng/Hình thức/Địa điểm; zero mojibake | 🟢 **PASS** | title + all 5 labels UTF-8 · no mojibake · `docs/qa/evidence/screens/po-hrm-ui-header-jd-dnd-qa-01/07-interview-schedule-dialog.png` |
| 4 | **UF-REFERROR-01** — zero `getDialogPortalContainer is not defined` · zero `LayoutDashboard is not defined` on tested paths | 🟢 **PASS** | class counts all **0** · `pageErrors=[]` · `consoleErrors=[]` |

**Score:** **4/4 PASS** · overall **PASS** (narrow FE-01 residual retest).

---

## 4. L2.5 / journey honesty

| Journey / UF | This seat | Notes |
|--------------|-----------|-------|
| **UF-CC-HEADER-01** (shell) | **PASS** | Not a PROGRAM_JOURNEY_MAP J-* id — shell integrity UF from process NO-GO |
| **UF-JD-DND-01** (DnD interaction) | **PASS** | Completes L2.5 gap called out in `po-hrm-rec-ux-qc-process-01` (prior create-only OBS) |
| **UF-REC-INTERVIEW-UTF-01** | **PASS** | Locale UF missing from prior JD QC-01 pack |
| **J-HRM-JD-01..03** / G4 | **not re-run** | Prior slice separate; this pack does **not** re-certify CFG/create/snapshot |
| Recruitment UAT-ready / product GO | **Denied** | Honesty flags false |

---

## 5. Console excerpt (after FE-01)

```text
unable_find_drag_handle          = 0
unable_find_any_drag_handles     = 0
getDialogPortalContainer         = 0
LayoutDashboard                  = 0
pageErrors                       = []
consoleErrors                    = []
```

Sponsor baseline (pre-fix): **384** DnD class + **14** ReferenceError — **not reproduced** on this session after hard refresh.

DnD detail (JSON):

```json
{
  "dndMode": "canvas-reorder",
  "groupsBefore": 6,
  "groupsAfter": 6,
  "writerStillUsable": true,
  "position": "CEO Tổng Giám đốc",
  "pack": "PACK_CORP_DEFAULT (resolve 200)"
}
```

Interview dialog text (excerpt): `Lên lịch phỏng vấn` · `Ngày phỏng vấn` · `Giờ phỏng vấn` · `Thời lượng` · `Hình thức` · `Địa điểm phỏng vấn` — UTF-8 OK.

---

## 6. Commands

| Command | Result |
|---------|--------|
| `pnpm run qc:fe-be-health` | **PASS** · exit **0** |
| `node scripts/qa/_tmp-po-hrm-ui-header-jd-dnd-qa-01.mjs` | **PASS** · exit **0** · 20/20 checks |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-header-jd-dnd-qa-01.md --check-assets` | **PASS** · exit **0** · pack **8/8** |

---

## 7. Screens

| File | What |
|------|------|
| `docs/qa/evidence/screens/po-hrm-ui-header-jd-dnd-qa-01/01-cc-shell.png` | Single TopHeader + persona pills; no duplicate brand strip |
| `docs/qa/evidence/screens/po-hrm-ui-header-jd-dnd-qa-01/02-cc-persona.png` | Persona switcher after clicks |
| `docs/qa/evidence/screens/po-hrm-ui-header-jd-dnd-qa-01/03-jd-library.png` | Thư viện JD |
| `docs/qa/evidence/screens/po-hrm-ui-header-jd-dnd-qa-01/04-jd-writer-before-dnd.png` | Writer open + canvas groups |
| `docs/qa/evidence/screens/po-hrm-ui-header-jd-dnd-qa-01/05-jd-writer-after-dnd.png` | After canvas-reorder drag |
| `docs/qa/evidence/screens/po-hrm-ui-header-jd-dnd-qa-01/06-candidates.png` | Candidates list |
| `docs/qa/evidence/screens/po-hrm-ui-header-jd-dnd-qa-01/07-interview-schedule-dialog.png` | «Lên lịch phỏng vấn» UTF-8 |

---

## 8. Residual

**No residual** on the four in-scope FE-01 defects (header / DnD storm / interview mojibake / named ReferenceErrors).

**Explicitly NOT closed by this PASS:**

| Item | Owner |
|------|-------|
| Full recruitment UAT-ready / module «chạy được» end-to-end | PM program — still **false** |
| `jd_dynamic_done` / remaster / Face LIVE / product GO | Denied — do not promote |
| J-HRM-JD-01..03 + G4 re-gate (if PM wants QC stamp refresh) | QC after PM |
| BA YCTD-REF / other REC residuals outside FE-01 | Separate lanes |
| Process gate rule text (console-storm FAIL) adoption | PM governance |

**ENV vs PRODUCT:** defects closed are **PRODUCT** fixes verified on live `:5173` + `:28001` — not ENV drift.

---

## 9. Honesty

- PASS = FE-01 **five residuals** closed in browser U65.
- **Does not** overturn process NO-GO wording that GWC slice ≠ recruitment UAT.
- **Does not** claim remaster / `jd_dynamic_done` / product GO.
- Mutates: only incidental `POST …/jd-pack-rules/resolve` (read-side resolve) — no job-template create, no interview schedule POST.

---

## completion_report

**Closed:** Browser retest UF-CC-HEADER-01 + UF-JD-DND-01 + UF-REC-INTERVIEW-UTF-01 + UF-REFERROR-01 — all 🟢; console DnD/ReferenceError class counts 0; evidence MD + screens + FINAL JSON; U65 zero-seed.

**Open:** QC re-gate of this narrow pack; recruitment UAT / jd_dynamic_done / remaster / product GO remain **false**.

**ack_status:** `PASS_TO_PM`

**next_owner:** `qc`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-UI-HEADER-JD-DND-QC-01
role: qc
lane: governance — re-gate FE-01 residuals only
entry_criteria:
  - QA PASS: docs/qa/evidence/po-hrm-ui-header-jd-dnd-qa-01.md · harness exit 0 · 4/4 UF 🟢
  - Process honesty: docs/qa/evidence/po-hrm-rec-ux-qc-process-01.md still applies for module UAT claims
  - portal http://127.0.0.1:5173 · ceo@xe.vn · company_id=main
exit_criteria:
  - Audit QA evidence + spot-check screens 01/05/07
  - Confirm console class counts 0 for drag-handle + getDialogPortalContainer + LayoutDashboard
  - Verdict GO WITH CONDITIONS or GO on THIS pack only — MUST deny recruitment UAT-ready / jd_dynamic_done / remaster / product GO
  - verify:qc:evidence-pack on QA evidence 8/8
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-ui-header-jd-dnd-qc-01.md
```
