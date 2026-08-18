# Evidence — `PO-UAT-REC-JD-DND-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UAT-REC-JD-DND-QA-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | execution · U65 zero-seed · browser-only |
| **parent** | `PO-UAT-REC-JD-DND-FE-01` `READY_FOR_QA` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **portal_url** | `http://127.0.0.1:5173` · HRM embed `/hr` · Thư viện JD |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** — UF-JD-DND-01 · storm=0 · process CLEAN |
| **stamp** | **`JDDND-IEAW8L`** |
| **commit** | `dc930c5` |
| **harness exit** | **0** |
| **startedAt / endedAt** | `2026-08-07T03:38:49.653Z` → `2026-08-07T03:39:05.051Z` |

### Honesty locks (mandatory)

| Flag | Value |
|------|-------|
| **recruitment_uat_ready** | **false** (DENIED invent) |
| **jd_dynamic_done** | **false** (DENIED invent — QC may certify **DnD slice only**) |
| **Seed** | **DENIED** (U65 · no `pnpm seed:*`) |
| **Phase 1 DONE** | **NOT claimed** |
| **product GO / module UAT** | **DENIED** |

---

## Goal

Browser-certify JD writer DnD after FE-01: **zero** `@hello-pangea/dnd` drag-handle invariants on writer path; Uncaught=0; UTF-8 VI OK; hand QC for JD DnD slice certify.

---

## 1. Entry / L0

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM+XBOS+portal **200** (node UV assert noise on exit; endpoints OK) |
| `pnpm run qc:fe-be-health` | **PASS** · ALL PASS |
| HRM `:28001` / XBOS `:28002` / portal `:5173` | **200** |
| Seed / invent mutate Lưu | **None** — dialog closed via **Hủy**; only resolve POST |
| Persist job-templates POST | **None** |

**Harness:** `node scripts/qa/_tmp-po-uat-rec-jd-dnd-qa-01.mjs`  
**JSON:** `docs/qa/evidence/_tmp-po-uat-rec-jd-dnd-qa-01.FINAL.json`  
**Screens:** `docs/qa/evidence/screens/po-uat-rec-jd-dnd-qa-01/`

---

## 2. HDSD inventory (U76)

| # | Menu / màn / nút | Exercised |
|---|------------------|-----------|
| 1 | Tuyển dụng → **Thư viện JD** | Yes |
| 2 | **Thêm JD** (`hdsd-jd-library-add-btn`) | Yes |
| 3 | Chọn chức danh → wait `jd-writer-dnd-surface` | Yes · `CEO Tổng Giám đốc` |
| 4 | Drag palette → canvas | Yes · groups **6→7** |
| 5 | **Hủy** (no Lưu) | Yes |

---

## 3. UF-JD-DND-01 matrix

| AC | Result | Evidence |
|----|--------|----------|
| Writer opens (Thêm JD) | 🟢 **PASS** | `hdsd-jd-form-dialog` |
| `jd-writer-dnd-surface` after chức danh | 🟢 **PASS** | deferred DnD mount visible |
| Canvas groups present | 🟢 **PASS** | groups=**6** before |
| Drag canvas and/or palette→canvas | 🟢 **PASS** | mode=`palette-to-canvas` · groups **6→7** · ok=true |
| Writer usable after drop | 🟢 **PASS** | dialog + `hdsd-jd-form-submit` still up |
| `Unable to find drag handle` = 0 | 🟢 **PASS** | singular=**0** |
| `Unable to find any drag handles` = 0 | 🟢 **PASS** | plural=**0** · dndHits=**0** · storm=false |
| Uncaught / ReferenceError = 0 | 🟢 **PASS** | `pageErrors=[]` · ref=0 · type=0 |
| UTF-8 VI labels OK | 🟢 **PASS** | Thêm JD / kéo nhóm tùy chọn / chức danh · no true mojibake |

**Score:** **10/10 checks PASS** · overall **PASS**.

### DnD detail (machine)

```json
{
  "dndMode": "palette-to-canvas",
  "groupsBefore": 6,
  "groupsAfter": 7,
  "writerStillUsable": true,
  "position": "CEO Tổng Giám đốc",
  "resolve": "POST jd-pack-rules/resolve 200"
}
```

---

## 4. Process FAIL-immediate (CLEAN)

| Gate | Count | Verdict |
|------|-------|---------|
| DnD storm (`Unable to find drag handle` / `any drag handles`) | **0** / **0** | 🟢 CLEAN |
| Mojibake (true UTF-8→Latin-1) | **0** | 🟢 CLEAN |
| Uncaught / ReferenceError / TypeError | **0** | 🟢 CLEAN |
| `process_gates.verdict` | — | 🟢 **PASS** |

Sponsor baseline (process NO-GO): **384** DnD class hits — **not reproduced** on this FE-01 surface after hard refresh.

---

## 5. Console excerpt

```text
unable_find_drag_handle          = 0
unable_find_any_drag_handles     = 0
uncaught_reference               = 0
uncaught_typeerror               = 0
pageErrors                       = []
consoleErrors                    = []
```

Console noise only: vite connecting · React DevTools · i18next promo — **no** hello-pangea invariants.

---

## 6. Screens

| File | What |
|------|------|
| `01-jd-library.png` | Thư viện JD |
| `02-jd-writer-before-dnd.png` | Writer + canvas groups before drag |
| `03-jd-writer-after-dnd.png` | After palette→canvas (groups +1) |
| `04-jd-writer-closed.png` | After Hủy |

---

## 7. Honesty / residual

| Item | Status |
|------|--------|
| Browser storm=0 proof | 🟢 **CLOSED** this seat |
| JD DnD QC certify | 🟡 **OPEN** → `PO-UAT-REC-JD-DND-QC-01` |
| `recruitment_uat_ready` / `jd_dynamic_done` | remain **false** — **cấm invent** |
| Soft OBS CMP/IV | CLOSED prior — must_keep |
| `C-SLICE-≠-MODULE` | retained — this PASS ≠ full recruitment UAT |

**ENV vs PRODUCT:** PRODUCT FE-01 fix verified live on `:5173` + `:28001` — not ENV drift.

---

## 8. Commands

| Command | Result |
|---------|--------|
| `pnpm run qc:fe-be-health` | **PASS** · exit **0** |
| `node scripts/qa/_tmp-po-uat-rec-jd-dnd-qa-01.mjs` | **PASS** · exit **0** · stamp `JDDND-IEAW8L` |

---

## Handoff

```yaml
work_item_id: PO-UAT-REC-JD-DND-QA-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-uat-rec-jd-dnd-qa-01.md
machine: docs/qa/evidence/_tmp-po-uat-rec-jd-dnd-qa-01.FINAL.json
stamp: JDDND-IEAW8L
next_owner: qc
```

### `next_dispatch_prompt` (copy-ready)

```text
work_item_id: PO-UAT-REC-JD-DND-QC-01
from_role: pm
to_role: qc
parent: PO-UAT-REC-JD-DND-QA-01 PASS_TO_PM
goal: Certify JD writer DnD slice storm=0 (NOT invent recruitment_uat_ready / jd_dynamic_done)
read_first:
  - docs/qa/evidence/po-uat-rec-jd-dnd-qa-01.md
  - docs/qa/evidence/_tmp-po-uat-rec-jd-dnd-qa-01.FINAL.json
  - docs/qa/evidence/po-uat-rec-jd-dnd-fe-01.md
  - docs/qa/evidence/po-hrm-rec-ux-qc-process-01.md
  - docs/qa/evidence/po-uat-rec-soft-obs-qc-01.md (JD NON-CERTIFIED residual)
entry_criteria: QA PASS stamp JDDND-IEAW8L; U65 observe-only; no apps/**; no seed
exit_criteria:
  - Accept or reject QA storm=0 + palette→canvas evidence
  - If ACCEPT: mark JD DnD CERTIFIED on soft-OBS residual; keep recruitment_uat_ready=false · jd_dynamic_done=false
  - Wording: GWC/GO on DnD slice only — NOT full-module recruitment UAT
cấm: invent recruitment_uat_ready · invent jd_dynamic_done · seed · claim Phase1 · over-read as module GO
evidence_path: docs/qa/evidence/po-uat-rec-jd-dnd-qc-01.md
```

---

## completion_report

**Closed:** UF-JD-DND-01 browser certify — palette→canvas drag exercised; dndHits=0; Uncaught=0; UTF-8 VI OK; process CLEAN; honesty flags remain false.

**Open:** QC `PO-UAT-REC-JD-DND-QC-01` certify DnD slice; full `recruitment_uat_ready` / `jd_dynamic_done` still DENIED.
