# QC Re-audit — HDSD XBOS Ch.4 Dashboard (`HDSD-QC-XBOS-DASH-02`)

| Field | Value |
|-------|-------|
| **work_item_id** | HDSD-QC-XBOS-DASH-02 |
| **program** | HDSD-P2-FULL-01 |
| **from_role** | ba-docs |
| **to_role** | qc |
| **auditor** | QC |
| **date** | 2026-07-30 |
| **ack_status** | PASS_TO_PM |
| **source_doc** | `docs/client-delivery/hdsd/xbos/HDSD_XBOS_CH04_DASHBOARD_VAN_HANH.md` |
| **prior_gate** | `qc-hdsd-driven-gate-20260730.md` §10 (HDSD-QC-XBOS-DASH-01 GWC) |

## Verdict

**GO (doc slice)** — C-DASH-1..3 **closed**. Ch.4 Dashboard MD đủ điều kiện đưa vào XBOS HTML bundle rebuild; **không** còn component symbol trong prose khách.

**NOT:** Phase 2 DONE · PNG inline 114/114 · HTML/PDF sign-off · Phase 1 product DONE · PROD-READY.

---

## Classification

| Class | Items |
|-------|-------|
| **DOC** | C-DASH closure re-audit — no runtime/product defect |
| **INFO** | L2.5 browser J-* retest remains on QA HDSD wave (UF-XBOS-10 cited in §4.1 source) |
| **ENV** | N/A — doc-only slice |

---

## Audit commands

| Command | Purpose | Result |
|---------|---------|--------|
| Read `HDSD_XBOS_CH04_DASHBOARD_VAN_HANH.md` §4.0–4.3 | C-DASH-1..3 manual audit | **PASS** |
| `rg "CapabilityActionButton\|PageHeader" docs/client-delivery/hdsd/xbos/HDSD_XBOS_CH04_DASHBOARD_VAN_HANH.md` | C-DASH-3 component symbols | **exit 0** (no matches) |
| `rg "Sponsor\|work_item\|DISPATCH\|AS-IS\|TO-BE\|Draft for Sponsor\|mồ côi" docs/client-delivery/hdsd/xbos/HDSD_XBOS_CH04_DASHBOARD_VAN_HANH.md` | Prompt-echo scan | **exit 0** (no matches) |
| Count `\| [0-9]+ \|` rows in §4.0 table (STT 1–16) | C-DASH-1 inventory | **16 rows PASS** |

**Portal context (HDSD program):** `http://127.0.0.1:5173` — routes `/cockpit`, `/dashboard/*`, `/catalog-governance` per §4.0.

---

## C-DASH condition closure matrix

| ID | Condition (from §10.4) | Re-audit | Evidence in source |
|----|------------------------|----------|-------------------|
| C-DASH-1 | §4.0 inventory **16 dòng** route (tách 8 settings) | **PASS** | §4.0 lines STT 1–16; 8 settings routes riêng; không gộp `settings/*` |
| C-DASH-2 | §4.2 bảng widget/cột; §4.3 [Hình] partners | **PASS** | §4.2 «Bảng widget tổng hợp» + «Bảng Sơ đồ cơ cấu»; §4.3 `[Hình XBOS.4.3b — Dashboard Đối tác]` + cột bổ sung partners trong blockquote |
| C-DASH-3 | Không `CapabilityActionButton` / `PageHeader` trong prose | **PASS** | §4.6 dùng «**Tiêu đề trang**»; grep 0 hit component symbols |

---

## §4.0 route inventory (QC count = 16)

| STT | Route | § |
|-----|-------|---|
| 1 | `/cockpit` | 4.1 |
| 2 | `/dashboard/organization` | 4.2 |
| 3 | `/dashboard/customers` | 4.3 |
| 4 | `/dashboard/partners` | 4.3 |
| 5 | `/dashboard/kpi-policy` | 4.4.1 |
| 6 | `/dashboard/kpi-dashboard` | 4.4.2 |
| 7 | `/catalog-governance` | 4.5 |
| 8–15 | `/dashboard/settings/{positions,departments,regions,vehicles,vendors,expense-categories,kpi-metrics,kpi-formulas}` | 4.6 |
| 16 | `/dashboard/hr` | 4.7 |

---

## Prompt-echo scan

| Pattern | Result |
|---------|--------|
| Sponsor / work_item / DISPATCH / pipeline meta | **PASS** (0 hit) |
| AS-IS / TO-BE / Draft for Sponsor | **PASS** (0 hit) |
| Component dev symbols in user prose | **PASS** (0 hit) |

**Note:** §4.7 heading «HR Dashboard stub» và bảng lỗi «Mock fallback» là thuật ngữ vận hành nội bộ — **không** thuộc prompt-echo class; chấp nhận cho MD team slice (pre-HTML export).

---

## L2.5 / journey (doc slice scope)

| Journey | Scope | Result |
|---------|-------|--------|
| UF-XBOS-10 (Cockpit KPI rollup) | Cited §4.1 source MD | **PASS** doc reference |
| J-* cross-nav browser | QA HDSD wave | **Deferred** — not blocking doc slice GO |

Doc slice GO does **not** promote browser L2.5 — PM retains QA dispatch for HDSD UAT waves.

---

## Residual

**No residual** on C-DASH-1..3 for this slice.

| ID | Item | Severity | Owner |
|----|------|----------|-------|
| — | — | — | — |

Program-level residuals unchanged from `QC-HDSD-P2-GATE-01` (PNG inline, PDF, W2a/mobile/W4 QA).

---

## Traceability

| Requirement | Implementation | Test |
|-------------|----------------|------|
| C-DASH-1 §4.0 16 routes | `HDSD_XBOS_CH04_DASHBOARD_VAN_HANH.md` §4.0 | QC row count 16 |
| C-DASH-2 §4.2 widgets + §4.3 partners [Hình] | §4.2 tables + §4.3 blockquote | QC manual read |
| C-DASH-3 Vietnamese UI labels | No component symbols; «Tiêu đề trang» | QC grep |
| HDSD-BA-XBOS-DASH-02 handoff | ba-docs INTAKE 2026-07-31 | This re-audit |

---

## completion_report

- **Closed:** C-DASH-1 (§4.0 16 rows), C-DASH-2 (§4.2 widget tables + §4.3 partners [Hình]), C-DASH-3 (no component symbols), prompt-echo PASS.
- **Open (program, out of slice):** Phase 2 PNG/PDF/QA waves per `QC-HDSD-P2-GATE-01`.

## next_owner

PM — trigger `pnpm run hdsd:build` HTML rebuild including Ch.4; parallel HDSD-P2-SCREEN-01 / QA waves unchanged.

## next_dispatch_prompt

```
work_item_id: HDSD-P2-HTML-REBUILD-01
from_role: pm | to_role: ba-docs
entry_criteria: HDSD-QC-XBOS-DASH-02 GO doc slice; CH04 delta merged
exit_criteria: pnpm run hdsd:build exit 0; artifacts/HDSD_XEVN_ECOSYSTEM_v1.html includes Ch.4 §4.0 inventory; evidence path in bus
read_first: docs/client-delivery/hdsd/xbos/HDSD_XBOS_CH04_DASHBOARD_VAN_HANH.md · qc-hdsd-xbos-dash-02-20260730.md
ack_status: PASS_TO_PM
```
