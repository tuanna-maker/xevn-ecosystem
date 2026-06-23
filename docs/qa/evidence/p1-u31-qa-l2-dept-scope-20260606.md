# P1-CC-DEPT-TPL-SCOPE-01 — U31 L2 browser final retest (:8088 post portal sync)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-CC-DEPT-TPL-SCOPE-01-L2-FINAL` |
| **Date** | 2026-06-06 |
| **Environment** | `http://14.225.217.232:8088` (authoritative SoT — **only**) |
| **Account** | `ceo@xe.vn` / `Xevn@2026` |
| **Prior evidence** | `docs/qa/evidence/p1-qa-u31-vps-retest-20260606.md` (L2 FAIL Vite 500) · `docs/qa/evidence/p1-u31-portal-sync-smoke-20260606.md` (DevOps portal FE sync) |
| **ack_status** | **READY_FOR_QC** |
| **Phase 1 / PROD** | **Not claimed** |

## Executive summary

Post portal-sync (`OrgGradeOrgChartEditor.tsx` + `orgGradeLayout.ts` on VPS), **L2 browser retest PASS** on all three mandatory UI cases plus CEO JWT probe **exit 0**. Command Center renders with `#root` children, no Vite error overlay. Settings → **Hệ thống Phòng/Ban** → tab **Danh mục khung** shows **2 rows** with **DB (business-master)** source label. Infrastructure settings save via **Lưu danh mục nền** succeeds with success toast — **no 400 / XBOS-VAL banner**.

---

## Pre-check — CEO JWT probe (required)

```powershell
$env:PORTAL_DEV_URL='http://14.225.217.232:8088'
node scripts/tmp-p1-qa-u31-dept-infra-probe.mjs
```

**Exit code:** `0` — **VERDICT PASS**

| Check | Result |
|-------|--------|
| login ceo@xe.vn | PASS HTTP 201 |
| GET dept-system-templates | PASS HTTP 200 partition=holding **count=2** `[q@main, PB-ORG-XEVN-01@xevn]` |
| PUT infrastructure/settings (array payload) | PASS HTTP 200 `XBOS-INFRA-201` |
| GET infrastructure/settings | PASS foundationCategories count=1 |
| PUT customFieldDefsByEntity | PASS HTTP 200 |
| GET customFieldDefsByEntity.main persisted | PASS defs=1 |

---

## L2 browser retest (MCP — mandatory)

### TC-L2-01 — Login → Command Center renders

| Step | Click path | Result |
|------|------------|--------|
| 1 | `GET http://14.225.217.232:8088/login` | PASS — session present; auto-redirect `/command-center` within 3s |
| 2 | `#root` children | PASS — `rootChildren=1` |
| 3 | Vite error overlay | PASS — `viteOverlay=false` |
| 4 | CC shell content | PASS — `Task_Counter` **6**, Action Cards, module rail (BOD, GROUP, CÀI ĐẶT HỆ THỐNG, …) |
| 5 | Console (spot) | PASS — no `Failed to resolve import …OrgGradeOrgChartEditor` |

**Note:** Informational KPI line `Không tải KPI rollup (JWT companyId=main)` — not a U31 blocker (out of scope).

| Verdict | **PASS** |

---

### TC-L2-02 — Settings → Phòng/Ban → tab **Danh mục khung**

| Step | Click path | Result |
|------|------------|--------|
| 1 | CC → **CÀI ĐẶT HỆ THỐNG** | PASS — settings rail opens |
| 2 | **Hệ thống Phòng/Ban** | PASS — heading + tabs visible |
| 3 | Tab **Danh mục khung** (default selected) | PASS |
| 4 | Source label | PASS — `Nguồn dữ liệu: DB (business-master) · 2 khung` |
| 5 | Table rows ≥1 | PASS — **2 rows**: `q` (1 pháp nhân, cấp 9), `PB-ORG-XEVN-01` / Khung phòng/ban & chức danh chuẩn XeVN (3 pháp nhân, cấp 9) |
| 6 | Actions per row | PASS — **Chi tiết**, **Xóa** buttons render |

**GWC (non-blocking):** On first cold visit to tab after settings open, label briefly showed `trống` before async fetch; **Làm mới từ DB** or re-navigation loaded 2 rows without error. Second visit auto-loaded. Recommend Dev-FE prefetch on tab mount (optional polish).

| Verdict | **PASS** |

---

### TC-L2-03 — Infrastructure settings save (no 400 banner)

| Step | Click path | Result |
|------|------------|--------|
| 1 | Settings → **Hạ tầng cơ sở** | PASS — danh mục nền list with `QA-U31` row |
| 2 | **Chi tiết & cấu hình** on `QA-U31` | PASS — form opens (mã, tên, mô tả, phạm vi pháp nhân) |
| 3 | Edit mô tả → `QA U31 L2 browser save retest 20260606` | PASS |
| 4 | **Lưu danh mục nền** | PASS — toast `Đã lưu danh mục nền và phạm vi áp dụng.` |
| 5 | Error banner / 400 / XBOS-VAL | PASS — **none** (`has400=false`, `banners=[]`) |

| Verdict | **PASS** |

---

## Gate summary

| Gate | Layer | Result |
|------|-------|--------|
| CEO JWT probe | API | **PASS** exit 0 |
| TC-L2-01 CC render | L2 browser | **PASS** |
| TC-L2-02 Dept Danh mục khung | L2 browser | **PASS** |
| TC-L2-03 Infra save | L2 browser | **PASS** |
| L2.5 J-* (this wave) | — | **N/A** — U31 scope is CC settings dept/infra only |
| Phase 1 / PROD | — | **Not claimed** |

**Overall verdict:** **PASS** — promote to **READY_FOR_QC**.

---

## Residual / PM dispatch

| ID | Severity | Item | Owner |
|----|----------|------|-------|
| GWC-U31-DEPT-PREFETCH | P3 | Dept tab cold-load shows `trống` briefly before fetch completes | dev-fe (optional) |
| INFO-KPI-ROLLUP | P3 | CC KPI rollup message for `companyId=main` | existing backlog `D-8088-KPI-01` |

No P0/P1 defects opened for this wave.

---

## Handoff

- **completion_report:** U31 L2 final browser retest on VPS :8088 after portal sync — all 3 UI TCs + API probe PASS. Prior L2 FAIL (Vite 500 missing `OrgGradeOrgChartEditor`) closed.
- **next_owner:** `qc`
- **next_dispatch_prompt:** See below.
- **evidence_path:** `docs/qa/evidence/p1-u31-qa-l2-dept-scope-20260606.md`
- **ack_status:** **READY_FOR_QC**
