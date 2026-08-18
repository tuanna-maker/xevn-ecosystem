# PO-HRM-UI-P0-LOGO-FONT-TITLE-01-QA — Browser U65

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-P0-LOGO-FONT-TITLE-01-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-06 |
| **Lane** | execution · U65 zero-seed · browser-only · mutates=**0** |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **FE base** | `http://127.0.0.1:5173` (portal) · HRM embed `/hr/recruitment` |
| **FE READY** | `docs/qa/evidence/po-hrm-ui-p0-logo-font-title-01.md` |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** |
| **remaster_program_done** | **false** (not claimed) |
| **seed_used** | **false** |
| **jd_dynamic_drag** | **out of scope** (not tested) |
| **commit** | `dc930c5` |
| **Harness exit** | **0** |
| **startedAt / endedAt** | `2026-08-06T04:02:57.066Z` → `2026-08-06T04:03:29.429Z` |

---

## 1. Entry / L0

| Check | Result |
|-------|--------|
| HRM API `:28001` | **200** `/api/hrm` |
| XBOS API `:28002` | **200** `/api/xbos` |
| Portal `:5173` | **200** — BASE |
| Portal `:8088` | ECONNREFUSED |
| HRM FE `:8080` | **200** `/hr/` |
| Seed / API invent | **None** (U65) — mutates=**0** |
| remaster DONE / JD drag | **Not claimed / not in scope** |

**Harness:** `node scripts/qa/_tmp-po-hrm-ui-p0-logo-font-title-01-qa.mjs`  
**JSON:** `docs/qa/evidence/_tmp-po-hrm-ui-p0-logo-font-title-01-qa.FINAL.json`  
**Screens:** `docs/qa/evidence/screens/po-hrm-ui-p0-logo-font-title-01-qa/` (00–04)

---

## 2. HDSD inventory (U76)

| # | Menu / màn / nút | Exercised |
|---|------------------|-----------|
| 1 | Tuyển dụng → Tin tuyển dụng → **Tạo tin tuyển dụng** | Yes · Hủy |
| 2 | Nhân sự → Employees → row ⋮ → **Xóa** (AlertDialog) → **Hủy** | Yes · cancel only |
| 3 | Tuyển dụng → Thư viện JD → **Thêm JD** | Yes · Hủy |
| 4 | Tuyển dụng → Yêu cầu tuyển dụng → **Thêm yêu cầu** | Yes · Hủy |

Note: Jobs list empty (`Chưa có tin tuyển dụng`) — delete-job AlertDialog not available; used SoftDel AlertDialog (same `AlertDialogHeader` wordmark primitive).

---

## 3. Exit checks matrix

| # | AC | Result | Evidence |
|---|-----|--------|----------|
| 1 | Create-job wordmark pad **white** `rgb(255,255,255)` — NOT black | **PASS** | `[data-testid=xevn-dialog-wordmark]` · `backgroundColor: rgb(255, 255, 255)` · class `xevn-dialog-wordmark !bg-white` · 32×32 |
| 2 | AlertDialog wordmark same white pad | **PASS** | path=`employees-softdel-cancel` · `[data-testid=xevn-alert-dialog-wordmark]` · `rgb(255, 255, 255)` · Cancel only |
| 3 | `document.documentElement` font-size **16px** | **PASS** | `htmlFontSize: 16px` · `bodyFontSize: 16px` |
| 4a | Create-job title-first | **PASS** | first label **Tiêu đề *** · `rec-job-form-title` first interactive |
| 4b | JD template title-first (before Mã JD) | **PASS** | labels: Tiêu đề → Mã JD → Chức danh… |
| 4c | YCTD title-first (before JD picker) | **PASS** | Tiêu đề → JD từ thư viện · `hdsd-requisition-title` before `hdsd-requisition-job-template` |
| 5 | Font readable / body sharper | **PASS + OBS** | `bodyFontWeight: 500` — sharper floor present (not soft/400) |
| 6 | Zero mutates U65 | **PASS** | mutates=**0** |

**Score:** **6/6 required AC PASS** · overall **PASS**.

---

## 4. Computed probes (JSON excerpt)

### Wordmark (create-job Dialog)

```json
{
  "testId": "xevn-dialog-wordmark",
  "backgroundColor": "rgb(255, 255, 255)",
  "isWhite": true,
  "isBlack": false,
  "width": "32px",
  "height": "32px"
}
```

### Wordmark (AlertDialog SoftDel)

```json
{
  "testId": "xevn-alert-dialog-wordmark",
  "backgroundColor": "rgb(255, 255, 255)",
  "isWhite": true,
  "isBlack": false
}
```

### Root font

```json
{
  "htmlFontSize": "16px",
  "bodyFontSize": "16px",
  "bodyFontWeight": "500",
  "bodyFontFamily": "\"Source Sans 3\", \"Source Sans Pro\", system-ui, sans-serif"
}
```

---

## 5. Screenshots

| File | Content |
|------|---------|
| `00-jobs-shell.png` | Tin tuyển dụng shell (empty list) |
| `01-create-job-dialog.png` | Create-job · white wordmark + Tiêu đề first |
| `02-alert-delete-confirm.png` | SoftDel AlertDialog · white wordmark · cancel |
| `03-jd-template-create.png` | Thêm JD · Tiêu đề before Mã JD |
| `04-yctd-create.png` | YCTD · Tiêu đề before JD picker |

---

## 6. Residuals / honesty

| Item | Status |
|------|--------|
| remaster_program_done | **false** — not claimed |
| JD dynamic TopCV drag builder | **out of scope** |
| Jobs delete AlertDialog | OBS: jobs empty under U65 — verified same AlertDialog primitive via Employees SoftDel cancel |
| Body soft type | OBS closed — weight **500** |

**not promoted:** none for this P0 UI seat.

---

## completion_report

**Closed:** Browser U65 AC for dialog/AlertDialog wordmark white SURFACE pad; html root **16px**; title-first on create-job + JD template + YCTD; body weight 500 sharper OBS; zero mutates.

**Residual:** none blocking. Jobs-list delete AlertDialog not exercised (empty list) — SoftDel AlertDialog path used instead (same primitive). JD dynamic drag still with BA/SA — not this seat.

---

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-P0-LOGO-FONT-TITLE-01-QC (or intake PASS)
role: pm → optional qc spot if release-touching; else close seat + continue JD dynamic BA/SA wave
entry: QA PASS_TO_PM @ docs/qa/evidence/po-hrm-ui-p0-logo-font-title-01-qa.md · JSON FINAL · screens 00-04
verdict: PASS · mutates=0 · remaster_program_done=false
residual: jobs delete AlertDialog not opened (empty list) — SoftDel AlertDialog white pad verified
cấm: remaster_program_done claim · seed · invent JD drag DONE
action: INTAKE bus; if gate wave → Task qc narrow P0 UI chrome; else dispatch next open backlog (JD dynamic SPEC/BA) without reopening closed P0
```

**ack_status:** `PASS_TO_PM`
