# Evidence — HDSD P2 Testcase Matrix Expansion

**work_item_id:** `HDSD-P2-TC-MATRIX-01`  
**program:** `HDSD-P2-FULL-01`  
**role:** ba-process  
**date:** 2026-07-30  
**ack_status:** PASS_TO_PM

---

## completion_report

### Closed

1. **Full HDSD scan** — 16 content MD under `docs/client-delivery/hdsd/` (ecosystem, xbos, hrm); mỗi `###` section / tab / dialog → ≥1 TC row.
2. **Matrix v2** — [`docs/qa/HDSD_SRS_TESTCASE_MATRIX.md`](../HDSD_SRS_TESTCASE_MATRIX.md):
   - `TC-ECO-*` (11 incl. W4 INT)
   - `TC-XBOS-HDSD-*` (139 incl. W5 M01)
   - `TC-HRM-HDSD-*` (177 incl. W5 M01) — cột **Entry: standalone | embed | both**
   - `TC-MOB-*` (33)
   - **Tổng: 360 TC** (target 120–200+ ✅)
3. **SRS map** — mỗi TC có cột UF (`USER_FLOW_OPERABILITY_MATRIX`) + FR (UC catalog).
4. **Coverage summary** — bảng theo bộ XBOS/HRM/Mobile + breakdown theo file HDSD.
5. **UAT scenario** — [`docs/qa/HDSD_DRIVEN_UAT_SCENARIO.md`](../HDSD_DRIVEN_UAT_SCENARIO.md) wave checklist gắn TC ID ranges v2.

### Residual

| # | Item | Owner | Trigger |
|---|------|-------|---------|
| R1 | Verdict ⬜ — chưa chạy QA browser trên 360 TC | qa | PM dispatch W0–W3 |
| R2 | UF map heuristic — một số TC dashboard/settings có UF `—` | qa | Gắn UF khi evidence; không block matrix |
| R3 | `HDSD_XBOS_CH04_DASHBOARD_VAN_HANH.md` v1.0 — 17 TC; có thể mở rộng khi ba-docs bổ sung ### con | ba-docs | Dashboard depth wave |

---

## Scan methodology

```text
Input: docs/client-delivery/hdsd/**/*.md (exclude *INDEX*)
Rule:  ### title → 1 TC row; ## numbered section without ### children → 1 TC row
ID:    sequential TC-ECO-NNN | TC-XBOS-HDSD-NNN | TC-HRM-HDSD-NNN | TC-MOB-NNN
Map:   keyword → UF band; filename → FR spine
Manual: +5 integration/scope TC (W4/W5)
```

### Inventory cross-check (`HDSD_ECOSYSTEM_INDEX`)

| Nhóm | Index STT | TC coverage |
|------|-----------|-------------|
| XBOS A1–A10 | 11 nhóm màn | 139 TC (Ch.1–4 + legacy CC) |
| HRM B1–B8 + 17 menu | 17 sidebar | 177 TC (Ch.0–11) |
| Mobile D1 | 7 màn nhóm | 33 TC (Ch.12) |
| Cổng C | login/shell | 11 TC |

---

## Coverage summary (snapshot)

| Bộ | TC | PASS | Blocker |
|----|-----|------|---------|
| Ecosystem | 11 | 0 | — |
| XBOS | 139 | 0 | — |
| HRM Web | 177 | 0 | — |
| Mobile | 33 | 0 | — |
| **Total** | **360** | **0** | QA not started |

---

## next_owner

**qa** (Wave W0 smoke + matrix verdict promotion)

---

## next_dispatch_prompt

```text
work_item_id: HDSD-P2-QA-W0-SMOKE-01
program: HDSD-P2-FULL-01
from_role: ba-process
to_role: qa

read_first:
- docs/qa/HDSD_SRS_TESTCASE_MATRIX.md (v2 — 360 TC)
- docs/qa/HDSD_DRIVEN_UAT_SCENARIO.md (wave checklist + TC ranges)
- docs/qa/USER_FLOW_OPERABILITY_MATRIX.md §3–4

entry_criteria:
- L0 PASS: pnpm run qc:dev-stack + qc:fe-be-health exit 0
- Matrix v2 published (this evidence)

exit_criteria:
- W0: TC-ECO-001..008 + TC-HRM-HDSD-001..005 — browser evidence blocks per UAT template
- Update matrix Verdict ⬜→🟢/🔴 for executed TC only
- ack_status: PASS_TO_PM with evidence docs/qa/evidence/hdsd-uat-eco-20260730.md
- U65: no seed; login→click→Lưu→F5 where mutate applicable

cấm: pnpm seed:* · API-only PASS without FE observation
evidence_path: docs/qa/evidence/hdsd-uat-eco-20260730.md
```
