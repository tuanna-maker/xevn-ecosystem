# P1-QA-UI-LABEL-BROWSER-8088-R2 — UI label fidelity retest (:8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-QA-UI-LABEL-BROWSER-8088-R2` |
| **role** | qa |
| **executed_at** | 2026-06-20T16:45+07 |
| **portal** | http://14.225.217.232:8088/ |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **entry** | Post-deploy `P1-DEPLOY-UI-LABEL-FIDELITY-8088` (`docs/ops/evidence/p1-deploy-ui-label-fidelity-8088-20260620.md`) |
| **rule** | U65 zero-seed · browser-only · parallel lane (not UF-09/15 chain) |
| **prior** | R1 `p1-qa-ui-label-browser-8088-20260620.md` — FAIL (pre-deploy) |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

**PASS_TO_PM** (QA cycle complete) — **G1 deploy verification CLOSED** after `P1-DEPLOY-UI-LABEL-FIDELITY-8088`: CC home widgets show Vietnamese titles **Việc cần xử lý** / **Chỉ số KPI tập đoàn** / **Cảnh báo hệ thống**; raw keys `Task_Counter` / `KPI_Sparkline` / `Alert_List` **absent**. Catalog governance **wf_* id CLOSED** (Vietnamese workflow line). **Residual G2/G3 FAIL** → dispatch **dev-fe wave 2**: production still shows **Seed quy trình (dev)** (VPS likely `IS_DEV_BUILD`); Action Cards expose 7 raw `task.subtitle` workflow keys including **`catalog_governance`**.

---

## Gate table

| # | Criterion | Verdict | User-visible evidence |
|---|-----------|---------|------------------------|
| **G1** | CC widgets — Việc cần xử lý / Chỉ số KPI tập đoàn / Cảnh báo hệ thống | **🟢 PASS** | Snapshot refs e45/e48/e51; CDP `bad: []`; count **13** under Việc cần xử lý |
| **G2** | Catalog governance prod UI — no Seed dev button, no wf_* id | **🟡 PARTIAL / 🔴 FAIL** | Title **Duyệt danh mục HRM** ✅; status **Quy trình: Phê duyệt bổ sung danh mục — CT Du lịch → Tập đoàn** ✅; **no wf_* in body** ✅; button **Seed quy trình (dev)** still visible 🔴 |
| **G3** | Action cards — no raw module/workflow codes as primary subtitle | **🔴 FAIL** | 13 cards; 7 unique snake_case subtitles (see list below) |

---

## G1 — Command Center home

- **URL / click path:** Login → `/command-center`
- **Network:** Shell **200**; session `ceo@xe.vn`
- **FE (sponsor sees):**
  - **Việc cần xử lý** — 13 · breakdown TÀI CHÍNH/KẾ TOÁN/KINH DOANH/NHÂN SỰ/VẬN HÀNH
  - **Chỉ số KPI tập đoàn** — — · Tổng hợp tập đoàn
  - **Cảnh báo hệ thống** — list «Phê duyệt bổ sung danh mục HRM — X.E Du lịch VN» (×12)
- **Negative check:** `Task_Counter`, `KPI_Sparkline`, `Alert_List` — **not in DOM text** (CDP)
- **Deploy ref:** matches `p1-deploy-ui-label-fidelity-8088-20260620.md` grep smoke
- **Verdict:** 🟢 **PASS**

---

## G2 — Catalog governance (`CÀI ĐẶT HỆ THỐNG` → **Duyệt danh mục HRM**)

- **Click path:** Nav **CÀI ĐẶT HỆ THỐNG** → sidebar **Duyệt danh mục HRM**
- **Network:** Inbox load implicit — **Hộp thư (0)**
- **FE post-load:**
  - Heading **Duyệt danh mục HRM** ✅
  - Empty: «Không có tác vụ chờ duyệt.»
  - Footer: «Quy trình: Phê duyệt bổ sung danh mục — CT Du lịch → Tập đoàn · Danh mục HRM hiệu lực: **76** nhóm / **289** mục» ✅
  - **wf_* regex:** `wfIds: []` (CDP) — **improvement vs R1** (`wf_hrm_catalog_extension_xe_du_lich` gone)
  - **Seed quy trình (dev)** button ref e70 — **still visible** 🔴 (code gates on `IS_DEV_BUILD`; VPS build behaves as DEV)
- **Verdict:** 🔴 **FAIL** (Seed button); wf_* sub-criterion **PASS**

---

## G3 — Action Cards module / workflow codes

- **Location:** `/command-center` → section **Action Cards** (13 cards)
- **Binding:** `task.subtitle` rendered verbatim (`CommandCenterPage.tsx` ~9935–9938)
- **Unique raw codes observed (subtitle line):**

| Code | Count | Example card title |
|------|-------|-------------------|
| `workflow_definition_review` | 2 | DevOps Inbox Spawn 1781934428730 |
| `fleet_ops` | 1 | Quy trình demo inbox Command Center |
| `finance_expense` | 2 | Quy trình demo inbox Command Center |
| `hrm_recruitment` | 2 | Quy trình demo inbox Command Center |
| `general` | 2 | Quy trình demo inbox Command Center |
| **`catalog_governance`** | 2 | Quy trình demo inbox Command Center |
| `hrm_payroll` | 2 | Quy trình demo inbox Command Center |

- **Expected (wave 2 dev-fe):** Vietnamese labels via resolver (same pattern as `catalogDisplayLabels.ts` / workflow definition display map); raw key only in tooltip if needed
- **Verdict:** 🔴 **FAIL** — list above for **P1-UI-LABEL-FIDELITY-8088-W2** / dev-fe

---

## Delta vs R1 (2026-06-20 baseline)

| Area | R1 | R2 |
|------|----|----|
| CC widget keys | 🔴 Task_Counter / KPI_Sparkline / Alert_List | 🟢 Vietnamese titles |
| Catalog wf_* footer | 🔴 wf_hrm_catalog_extension_xe_du_lich | 🟢 Vietnamese process line |
| Seed (dev) button | 🔴 visible | 🔴 still visible |
| Action card subtitles | 🔴 snake_case | 🔴 unchanged (7 codes) |

---

## Residual (PM dispatch)

| ID | Item | Owner | Priority |
|----|------|-------|----------|
| R-LABEL-W2-ACTION | Map `task.subtitle` workflow keys → Vietnamese on Action Cards | dev-fe | P1 |
| R-LABEL-W2-SEED | Hide **Seed quy trình (dev)** on `:8088` — prod build / `IS_DEV_BUILD=false` | devops + dev-fe | P1 |
| R-CAT-INBOX-UI | Catalog governance inbox **(0)** — out of scope this lane; other QA owns UF-09/15 | dev-be | P0 (parallel) |

---

## completion_report

- **Closed:** G1 deploy verification PASS; G2 wf_* id fix verified; browser evidence R2 documented with CDP + MCP snapshots; delta vs R1 recorded.
- **Open:** G2 Seed dev button; G3 all Action Card subtitle codes — **dev-fe wave 2** list attached.

## next_owner

`pm` → `dev-fe` (wave 2) + `devops` (prod build mode)

## next_dispatch_prompt

```
Role: dev-fe
work_item_id: P1-UI-LABEL-FIDELITY-8088-W2
from_role: qa
to_role: dev-fe
priority: P1
entry_criteria: P1-QA-UI-LABEL-BROWSER-8088-R2 PASS_TO_PM — G1 PASS; G3 FAIL 7 workflow subtitle keys on Action Cards (catalog_governance, workflow_definition_review, fleet_ops, finance_expense, hrm_recruitment, general, hrm_payroll); G2 Seed button still visible on :8088
exit_criteria: CommandCenterPage Action Cards — resolve task.subtitle via Vietnamese workflow label map (no snake_case primary text); verify CatalogGovernancePanel Seed hidden when not DEV; pnpm build portal; READY_FOR_QA P1-QA-UI-LABEL-BROWSER-8088-R3
evidence_path: docs/qa/evidence/p1-qa-ui-label-browser-8088-r2-20260620.md
spec_ref: docs/qa/evidence/p1-ui-label-fidelity-8088-fe-20260620.md §Action Cards gap
ack_status: READY_FOR_QA
pm_dispatch_hint: Parallel devops P1-DEPLOY-UI-LABEL-W2-8088 — vite production build on VPS so IS_DEV_BUILD=false hides Seed button
```

## evidence_path

`docs/qa/evidence/p1-qa-ui-label-browser-8088-r2-20260620.md`

## ack_status

**PASS_TO_PM**

## pm_dispatch_hint

G1 **promote** UF-XBOS-01/10 widget label rows; dispatch **dev-fe W2** for G3 + **devops** prod-mode redeploy for G2 Seed; UF-09/15 chain remains other QA lane.
