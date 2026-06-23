# P1-QA-UI-LABEL-BROWSER-8088 — UI label fidelity gate (:8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-QA-UI-LABEL-BROWSER-8088` |
| **role** | qa |
| **executed_at** | 2026-06-20T14:30+07 |
| **portal** | http://14.225.217.232:8088/ |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **entry** | Dev-FE `P1-UI-LABEL-FIDELITY-8088` **READY_FOR_QA** (code) — **not deployed** on VPS (baseline retest) |
| **rule** | U65 zero-seed · browser-only · UI fidelity gate (not HTTP 200 alone) |
| **ack_status** | **FAIL_TO_PM** |

---

## Executive summary

**FAIL_TO_PM** — VPS `:8088` still serves **pre-label-fidelity** portal build. Command Center home exposes developer widget keys **`Task_Counter`**, **`KPI_Sparkline`**, **`Alert_List`** as primary card titles. Catalog governance shows production **`Seed quy trình (dev)`** + raw **`wf_hrm_catalog_extension_xe_du_lich`**. Action cards show raw workflow keys (`catalog_governance`, `workflow_definition_review`, `fleet_ops`, …). Group HR catalog detail dialog uses raw block keys (`address`, `personal`, `work`, …) as primary labels. HRM embed **Danh mục (XBOS + HRM)** tab not reachable in narrow iframe (icon-only tabs); direct `/hr/settings-catalogs` → **404**. UF-09/15 approve chain **BLOCKED** — inbox **(0)** (S2S probe spawnPass true but inbox UI empty).

Dev-FE fix exists locally (`docs/qa/evidence/p1-ui-label-fidelity-8088-fe-20260620.md`) — **deploy gap**, not spec gap.

---

## Gate table

| # | Criterion | Verdict | User-visible labels (FE post-mutation) |
|---|-----------|---------|----------------------------------------|
| **G1** | CC home — no raw widget keys | **🔴 FAIL** | Cards titled **`Task_Counter`**, **`KPI_Sparkline`**, **`Alert_List`**; subtext OK (Việc đang xử lý…, Tổng hợp tập đoàn, Phê duyệt bổ sung danh mục HRM…) |
| **G2** | UF-09 catalog governance — Vietnamese catalog names | **🔴 FAIL** | Screen title **Duyệt danh mục HRM** ✅; inbox **(0)** — no card/detail; footer shows **`wf_hrm_catalog_extension_xe_du_lich`**; CC Action Cards show **`catalog_governance`** under demo title |
| **G3** | UF-15 HRM settings catalogs — Mã + Nhãn | **🔴 FAIL** | Embed tab **Danh mục (XBOS + HRM)** not activated (iframe icon-only); `/hr/settings-catalogs` **404 Trang không tồn tại**; group HR **Cấu hình chi tiết** dialog: blocks **`address`/`personal`/`work`** as primary labels (not **Địa chỉ** / **Thông tin cá nhân**) |
| **G4** | UF-09/15 chain extension → inbox ≥1 → Duyệt → F5 | **🟡 BLOCKED** | Inbox **(0)**; S2S deploy evidence spawnPass **true** (`docs/ops/evidence/p1-deploy-cat-s2s-auth-8088-20260620.md`) — UI inbox still empty; no Duyệt path |
| **G5** | No snake_case primary labels in-scope | **🔴 FAIL** | See raw keys above + action card subtitles |

---

## UF blocks

### G1 — UF-XBOS-01 / UF-XBOS-10 (Command Center home)

- **URL / click path:** `/command-center` (session `ceo@xe.vn`)
- **Network:** CC shell load **200**; KPI rollup implicit
- **FE post-mutation (sponsor sees):** Widget headers **`Task_Counter`** (count **13**), **`KPI_Sparkline`** (—), **`Alert_List`** (list «Phê duyệt bổ sung danh mục HRM — X.E Du lịch VN»). Action Cards subtitle keys: `workflow_definition_review`, `fleet_ops`, `finance_expense`, `hrm_recruitment`, `catalog_governance`, `hrm_payroll`, `general`.
- **Expected after deploy:** **Việc cần xử lý** · **Chỉ số KPI tập đoàn** · **Cảnh báo hệ thống** (per dev-fe evidence)
- **Screenshot:** MCP `page-2026-06-20T07-31-12-079Z.png` · CDP `rawKeys visible: true` for all three widget keys
- **Verdict:** 🔴 **FAIL** label fidelity

### G2 — UF-XBOS-09 (Catalog governance)

- **Click path:** **CÀI ĐẶT HỆ THỐNG** → **Duyệt danh mục HRM**
- **Network:** GET inbox implicit — **Hộp thư (0)**
- **FE post-mutation:** Title **Duyệt danh mục HRM** ✅; empty state «Không có tác vụ chờ duyệt»; status line contains **`wf_hrm_catalog_extension_xe_du_lich`**; button **Seed quy trình (dev)** visible on production `:8088`
- **Screenshot:** MCP catalog-governance inbox-0 capture (session)
- **Verdict:** 🔴 **FAIL** — raw wf id + dev seed button; cannot verify **Chức danh** detail (no inbox row)

### G3 — UF-XBOS-15 / UF-HRM-10 (Settings catalogs)

- **Paths tried:**
  1. CC → **NHÂN SỰ** → **Cấu hình HRM** → iframe tab `#radix-:r0:-trigger-catalogs` — click did not switch panel (icon-only viewport)
  2. Direct `http://14.225.217.232:8088/hr/settings-catalogs?portal=1&companyId=main` → **404** «Trang không tồn tại»
  3. CC → **Danh mục hồ sơ nhân sự** → **Cấu hình chi tiết** — field preview **Vietnamese** (Họ tên, Ngày sinh, …) ✅ but block list shows **`address`**, **`personal`**, **`work`**, **`contact`**, **`insurance`** as primary labels 🔴
- **FE post-mutation:** No table with **Mã + Nhãn** columns observed on HRM settings catalogs tab; group HR dialog fails block-label rule
- **Screenshot:** `p1-qa-ui-label-ghr-detail-raw-keys-8088.png` · `p1-qa-ui-label-hrm-catalogs-tab-8088.png`
- **Verdict:** 🔴 **FAIL**

### G4 — UF-09/15 chain (U65 no seed)

- **Action:** No extension POST this session (baseline label gate); inbox already **(0)**
- **S2S reference:** `p1-deploy-cat-s2s-auth-8088-20260620.md` — extension **201** `HRM-SET-209`, `spawnPass: true`, inbox probe 0→0
- **Verdict:** 🟡 **BLOCKED** — cannot execute Duyệt → F5 without inbox ≥1

---

## Deploy vs code delta

| Artifact | State |
|----------|-------|
| `P1-UI-LABEL-FIDELITY-8088` dev-fe | **READY_FOR_QA** in repo — Vietnamese labels in `CommandCenterPage.tsx`, `CatalogGovernancePanel.tsx`, `SettingsCatalogsTab.tsx` |
| VPS `:8088` runtime | **Old build** — grep-equivalent: browser still shows `Task_Counter` / `KPI_Sparkline` / `Alert_List` |

---

## Matrix impact (Dev8088)

| UF | Prior | After label QA |
|----|-------|----------------|
| UF-XBOS-01 | 🟢 | **🔴** label fidelity FAIL (downgrade until deploy+retest) |
| UF-XBOS-10 | 🟢 | **🔴** same widget keys on CC home |
| UF-XBOS-09 | 🟡 BLOCKED | **🔴** label + inbox (0) |
| UF-XBOS-15 | 🟡 BLOCKED | **🔴** label + inbox (0) + HRM catalogs UI blocked |
| UF-HRM-10 | 🔴 404 | **🔴** confirmed 404 direct route; embed tab not verified |

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| R-LABEL-DEPLOY | Deploy portal-fe + hrm embed with `P1-UI-LABEL-FIDELITY-8088` to `:8088` | devops |
| R-LABEL-RETQA | Re-run this work_item after deploy | qa |
| R-CAT-INBOX-UI | Catalog governance inbox **(0)** despite S2S 201 | dev-be |
| R-HRM-SC-ROUTE | `/hr/settings-catalogs` SPA route 404 on VPS | dev-fe/devops |

---

## completion_report

- **Closed:** Baseline browser UI fidelity audit on `:8088` per U65; documented raw keys with screenshots; confirmed dev-fe fix **not** on VPS; UF-09 inbox empty; UF-15/HRM-10 blocked.
- **Open:** All G1–G5 exit criteria; UF-09/15 approve chain; matrix 🟢 rows for UF-01/10 need downgrade until deploy.

## next_owner

`pm` → `devops` then `qa`

## next_dispatch_prompt

```
Role: devops
work_item_id: P1-DEPLOY-UI-LABEL-FIDELITY-8088
from_role: qa
to_role: devops
priority: P0
entry_criteria: P1-QA-UI-LABEL-BROWSER-8088 FAIL_TO_PM — :8088 still shows Task_Counter/KPI_Sparkline/Alert_List; dev-fe READY docs/qa/evidence/p1-ui-label-fidelity-8088-fe-20260620.md not on VPS
exit_criteria: pscp/rebuild portal-fe+hrm on 14.225.217.232:8088; smoke /command-center shows Việc cần xử lý / Chỉ số KPI tập đoàn / Cảnh báo hệ thống; ack READY_FOR_QA for P1-QA-UI-LABEL-BROWSER-8088-R2
evidence_path: docs/ops/evidence/p1-deploy-ui-label-fidelity-8088-20260620.md
ack_status: READY_FOR_QA
pm_dispatch_hint: After deploy qa P1-QA-UI-LABEL-BROWSER-8088-R2 + parallel dev-be P1-BROWSER-E2E-CAT-INBOX-SPAWN-8088-R6 for UF-09/15 inbox≥1
```

## evidence_path

`docs/qa/evidence/p1-qa-ui-label-browser-8088-20260620.md`

## ack_status

**FAIL_TO_PM**

## pm_dispatch_hint

Deploy `P1-UI-LABEL-FIDELITY-8088` to `:8088` (devops) before re-QA; UF-09/15 inbox spawn remains P0 (`P1-BROWSER-E2E-CAT-INBOX-SPAWN-8088-R6`).
