# P1-QA-UI-LABEL-BROWSER-8088-R3 — UI label fidelity W2 retest (:8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-QA-UI-LABEL-BROWSER-8088-R3` |
| **role** | qa |
| **executed_at** | 2026-06-20T15:05+07 |
| **portal** | http://14.225.217.232:8088/ |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **entry** | Post `P1-UI-LABEL-FIDELITY-8088-W2` dev-fe READY_FOR_QA |
| **rule** | U65 zero-seed · browser-only · parallel lane (not UF-09/15 chain) |
| **prior** | R2 `p1-qa-ui-label-browser-8088-r2-20260620.md` — G1 PASS; G2/G3 FAIL |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

**PASS_TO_PM** — W2 deploy verified on VPS `:8088`: **G1 regression PASS** (CC widgets Vietnamese); **G2 PASS** (no `Seed quy trình (dev)` on catalog governance; no `wf_*` in panel); **G3 PASS** (Action Cards subtitles Vietnamese — all 7 R2 snake_case keys absent from DOM; Vietnamese labels present including **Quản trị danh mục**, **Vận hành đội xe**, **Chi phí & thanh toán**, **Tuyển dụng**, **Tiền lương**, **Nghiệp vụ chung**, **Duyệt định nghĩa quy trình**, **Phê duyệt danh mục HRM**).

---

## Gate table

| # | Criterion | Verdict | User-visible evidence |
|---|-----------|---------|------------------------|
| **G1** | CC widgets — Việc cần xử lý / Chỉ số KPI tập đoàn / Cảnh báo hệ thống | **🟢 PASS** | CDP `widgetTitles` all `ok:true`; task count **110**; raw keys absent |
| **G2** | Catalog governance — no Seed dev button, no wf_* id | **🟢 PASS** | `?settings=hrm_catalog_governance`; `seedButtons: 0`; `wfIds: []`; footer Vietnamese line |
| **G3** | Action Cards — Vietnamese subtitles, no snake_case codes | **🟢 PASS** | `badFound: []` for 7 R2 keys; 8 Vietnamese labels in DOM; 110 card blocks |

---

## G1 — Command Center home (regression)

- **URL / click path:** Login → `/command-center`
- **Network:** Shell **200**; session `ceo@xe.vn`
- **FE (sponsor sees):**
  - **Việc cần xử lý** — **110**
  - **Chỉ số KPI tập đoàn** — — · Tổng hợp tập đoàn
  - **Cảnh báo hệ thống** — catalog approval alerts (Vietnamese titles)
- **Negative check (CDP):** `Task_Counter`, `KPI_Sparkline`, `Alert_List` — **not in DOM**
- **Verdict:** 🟢 **PASS** (regression vs R2 unchanged)

---

## G2 — Catalog governance

- **Click path:** Nav **CÀI ĐẶT HỆ THỐNG** → **Duyệt danh mục HRM** (direct URL `?settings=hrm_catalog_governance`)
- **FE post-load:**
  - Heading **Duyệt danh mục HRM** ✅
  - **Hộp thư (99)** — inbox populated (out of scope UF-09 chain; label check only)
  - Footer: «Quy trình: Phê duyệt bổ sung danh mục — CT Du lịch → Tập đoàn · Danh mục HRM hiệu lực: **76** nhóm / **290** mục» ✅
  - **Seed quy trình (dev):** CDP `seedButtons: 0`, `allButtons: []` ✅ (R2 had ref e70 visible)
  - **wf_* regex:** `wfIds: []` ✅
- **Verdict:** 🟢 **PASS** — G2 residual from R2 **CLOSED**

---

## G3 — Action Cards subtitles

- **Location:** `/command-center` → section **Action Cards**
- **CDP probe:**
  - `badFound: []` for `catalog_governance`, `workflow_definition_review`, `fleet_ops`, `finance_expense`, `hrm_recruitment`, `general`, `hrm_payroll`
  - `vnFound`: Quản trị danh mục · Vận hành đội xe · Chi phí & thanh toán · Tuyển dụng · Tiền lương · Nghiệp vụ chung · Duyệt định nghĩa quy trình · Phê duyệt danh mục HRM
  - **110** cards with «Mở chi tiết» affordance
- **Snapshot examples (MCP a11y tree):**
  - «Quy trình demo inbox Command Center **Quản trị danh mục**»
  - «… **Vận hành đội xe**»
  - «… **Chi phí & thanh toán**»
  - «… **Tuyển dụng**»
- **Verdict:** 🟢 **PASS** — G3 residual from R2 **CLOSED**

---

## Delta vs R2

| Area | R2 | R3 |
|------|----|----|
| G1 CC widgets | 🟢 PASS | 🟢 PASS (regression) |
| G2 Seed (dev) button | 🔴 visible | 🟢 absent |
| G2 wf_* footer | 🟢 PASS | 🟢 PASS |
| G3 Action card subtitles | 🔴 7 snake_case codes | 🟢 Vietnamese labels |

---

## Out of scope (parallel lanes — not promoted here)

| Item | Note |
|------|------|
| UF-09 catalog approve POST 409 | Other QA agent `P1-BROWSER-E2E-UF09-UF15-8088-R7` |
| UF-15 HRM settings-catalogs | Same parallel browser chain |
| Catalog inbox assignee drift | Functional — labels only in this work_item |

---

## completion_report

- **Closed:** G1 regression PASS; G2 Seed button hidden + wf_* absent; G3 all Action Card subtitle snake_case keys replaced with Vietnamese on `:8088`; W2 dev-fe acceptance complete.
- **Open:** None for label-fidelity scope. UF-09/15 functional defects remain in parallel QA lanes.

## next_owner

`pm` — promote G1–G3 🟢 on label matrix; no dev-fe residual for W2.

## next_dispatch_prompt

```
Role: pm
work_item_id: P1-QA-UI-LABEL-BROWSER-8088-R3
from_role: qa
to_role: pm
summary: UI label fidelity W2 CLOSED on :8088 — G1/G2/G3 all PASS; promote label rows; UF-09/15 chain remains separate QA lane
evidence_path: docs/qa/evidence/p1-qa-ui-label-browser-8088-r3-20260620.md
ack_status: PASS_TO_PM
pm_dispatch_hint: No dev-fe W3 for labels; continue UF-09/15 browser chain agent; optional qc audit G1–G3 on next XBOS wave gate
```

## evidence_path

`docs/qa/evidence/p1-qa-ui-label-browser-8088-r3-20260620.md`

## ack_status

**PASS_TO_PM**

## pm_dispatch_hint

Promote **P1-UI-LABEL-FIDELITY-8088-W2** 🟢; label lane complete — do not re-dispatch dev-fe for G2/G3. UF-09/15 functional QA continues independently.
