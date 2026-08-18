# Evidence — PO-HRM-PAY-CNTT-BA-PROCESS-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-BA-PROCESS-01` |
| **parent** | `PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P0 |
| **date** | 2026-08-11 |
| **change_mode** | ADD-only |
| **ack_status** | **PASS_TO_PM** |
| **honesty** | `payroll_e2e_ready=false` · **cấm** claim UAT/module LIVE · **cấm** `apps/**` · U65 zero-seed |
| **no_prompt_echo** | PASS — team doc only |

---

## 0. Read ack (ordered)

| # | Artifact | Used |
|---|----------|------|
| 1 | `PO_HRM_PAY_XEVN_CUSTOMER_CNTT_INTAKE_01.md` | 7 mô hình · 67 files inventory · gap rollup |
| 2 | `PO_HRM_AMIS_PARITY_RESEARCH_01.md` §3 | Spine 1–7 · precedence · target template |
| 3 | `po-hrm-payroll-formula-run-gap-ba-01.md` | Formula/engine GAP · AC reuse · honesty |
| 4 | `PO-HRM-PAY-CNTT-POLICY-READ-METHOD.md` | CHUNG/RIÊNG · fragment method |
| 5 | `po-hrm-amis-parity-pay-depth-01.md` · TPL/INPUT paper | AC-PAY-TPL/SRC · F-STP cross-ref |
| 6 | Pack `docs/từ khách hàng/Gửi P.CNTT/` | **NOT MOUNTED** in workspace — inventory-only this seat |

**Sample xlsx (intake names — ba-data đọc khi mount):**

| Mô hình | File đại diện 1 | File đại diện 2 |
|---------|-----------------|-----------------|
| ĐPHH | BP ĐPHH | DLL CPN |
| TĐHK | TĐHK done | KPI/BCC/PCCV T5 |
| TG | VP Hà Nội | — |
| LX-T | LX tuyến T06 | BCC/CPSC sheets (trong pack) |
| LX-TR | LXT t5 | DT/tạm ứng sheets |
| VP-T | 6 tỉnh T05 | Chi phí VP |

---

## 1. Deliverable summary

| # | Output | Path | Status |
|---|--------|------|--------|
| 1 | Capability matrix AMIS 1–7 × 7 mô hình | `docs/program/specs/PO-HRM-PAY-CNTT-BA-PROCESS-01.md` §2 | **DONE** |
| 2 | P0 setup functions F-STP-01..08 | Same §4 | **DONE** |
| 3 | UC Thiết lập ADD UC-BP-PAY-STP-01..12 | Same §5 | **DONE** |
| 4 | BR + AC mẫu Thiết lập | Same §6–§7 | **DONE** |
| 5 | Handoff ba-data / sa | Same §8 | **DONE** |

**Matrix scale:** 7 AMIS steps × 7 customer models = **49 cells** (bước 5–7 gộp «Tất cả» where runtime ≠ Thiết lập).

**Verdict rollup (Thiết lập bước 1–4 only):**

| Verdict | Count (cells B1–B4) | % |
|---------|---------------------|---|
| **GAP** | 22 | ~79% |
| **PARTIAL** | 6 | ~21% |
| **OK** | 0 | 0% |
| **BETTER** | 0 | 0% (BETTER reserved for scope/JWT — not per-model setup) |

**P0 blockers (top 4):** F-STP-01 mẫu đa OU · F-STP-03 policy bind · F-STP-04 input pack types · F-STP-02 catalog TP.

---

## 2. Key findings (sponsor-facing)

1. **XeVN khách = 6+ mẫu bảng song song** — product thiếu toàn bộ lớp mẫu (bước 3) và policy bind (bước 1).
2. **Input pack typed** (DLL CPN · KPI TĐHK · CPSC/CLDV · DT) là **GAP đồng đều** — paper `pay_period_input_lines` chưa có taxonomy theo mô hình.
3. **CHUNG vs RIÊNG** phải tách UC (STP-01 vs STP-02) — cấm gộp theo sponsor lock policy read method.
4. **Runtime lập bảng (bước 5)** vẫn **GAP** engine — Thiết lập P0 không đủ để claim payroll UAT; honesty giữ `payroll_e2e_ready=false`.
5. **Không hardcode** 6 mô hình — dùng `applicability` + `payroll_group` (PAY-09) + `input_pack_type` metadata.

---

## 3. Residual (open)

| ID | Mô tả | Owner |
|----|--------|-------|
| R-CNTT-PDF | Đọc từng PDF → fragment catalog | `PO-HRM-PAY-CNTT-BA-POLICY-DECOMPOSE-01` (parallel) |
| R-CNTT-XLSX | Map cột chi tiết 38 xlsx | `PO-HRM-PAY-CNTT-BA-DATA-01` |
| R-CNTT-ADR | Multi-template + policy layer ADR | `PO-HRM-PAY-CNTT-SA-01` |
| R-CNTT-MOUNT | Mount pack P.CNTT vào repo hoặc path lock | PM / sponsor |
| R-CNTT-SRS | Delta SRS khách sau confirm | ba-docs (W1) |

---

## completion_report

### Closed

1. Ma trận capability **49 ô** (AMIS spine × mô hình XeVN) với 4 cột: khách · XeVN · verdict · UC ADD.
2. Rollup theo mô hình + **8 chức năng Thiết lập P0** (F-STP-01..08).
3. **12 UC** module Thiết lập lương (ADD-only) + **8 BR** + **5 AC** mẫu U65.
4. Handoff ba-data/sa/qa/ba-docs; rủi ro mount pack.
5. Không `apps/**` · không prompt-echo · không claim UAT.

### Residual

- Fragment catalog PDF (parallel decompose).
- Physical column map (ba-data).
- SA ADR + API unlock STP.
- Sponsor confirm delta SRS scope trước Dev lớn.

---

## next_owner

**pm** — synth với `PO-HRM-PAY-CNTT-BA-DATA-01` + `PO-HRM-PAY-CNTT-SA-01` (đã DISPATCHED per TEAM_WORKING_NOW)

---

## next_dispatch_prompt

### A — ba-data (sync — nếu chưa verdict)

```text
work_item_id: PO-HRM-PAY-CNTT-BA-DATA-01
from_role: pm
to_role: ba-data
lane: governance
parent: PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01
priority: P0

## Goal
Map cột Excel mẫu (BP ĐPHH · TĐHK done · VP HN · LX tuyến T06 · LXT t5 · 6 tỉnh T05) → entity/field · FK ATT/EMP/C&B · input_pack_type grain.

## read_first
1. docs/program/specs/PO-HRM-PAY-CNTT-BA-PROCESS-01.md §2–§4 (matrix + F-STP)
2. docs/program/PO_HRM_PAY_XEVN_CUSTOMER_CNTT_INTAKE_01.md
3. docs/program/specs/PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-DATA-01.md
4. docs/program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md (alias pack≠mẫu)
5. docs/từ khách hàng/Gửi P.CNTT/ (when mounted)

## Deliverable
docs/qa/evidence/po-hrm-pay-cntt-ba-data-01.md
- Per-model column map + component_code proposal
- input_pack_type vocabulary aligned STP-12
- VAL rules; migration need YES/NO
exit: PASS_TO_PM · no apps/** · payroll_e2e_ready=false
```

### B — sa (sync — nếu chưa verdict)

```text
work_item_id: PO-HRM-PAY-CNTT-SA-01
from_role: pm
to_role: sa
lane: governance
parent: PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01
priority: P0

## Goal
ADR multi-template + policy_bind layer: CHUNG/RIÊNG · applicability (OU/BP/tỉnh) · cấm hardcode 6 models; unlock API STP after DATA.

## read_first
1. docs/program/specs/PO-HRM-PAY-CNTT-BA-PROCESS-01.md
2. docs/program/PO_HRM_AMIS_PARITY_RESEARCH_01.md §3
3. docs/program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md
4. po-hrm-amis-parity-sa-01.md §4 Option B
5. po-hrm-payroll-formula-run-gap-api-01.md (CONFIRMED — cite only)

## Deliverable
docs/qa/evidence/po-hrm-pay-cntt-sa-01.md
- ADR sketch: pay_policy_pack · applicability · template picker
- API delta F-STP vs existing F-PAY-SHEET-TPL
- Wave unlock order: STP paper → DATA → API → Dev
exit: PASS_TO_PM · no apps/** · payroll_e2e_ready=false
```

---

## evidence_path

- Spec: `docs/program/specs/PO-HRM-PAY-CNTT-BA-PROCESS-01.md`
- Evidence: `docs/qa/evidence/po-hrm-pay-cntt-ba-process-01.md`
