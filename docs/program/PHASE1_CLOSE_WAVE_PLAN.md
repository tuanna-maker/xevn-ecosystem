# Phase 1 Close Wave Plan — PM orchestration (2026-06-05)

**Mục tiêu sponsor:** UAT-READY đủ bàn giao khách + QC program **GO** (GWC tối thiểu) · **PROD** riêng khi `portal.xe.vn` unblock.

**Hiện trạng gate (SoT `PHASE1_GATE_REPORT.md`):**

| Gate | Status |
|------|--------|
| G1–G4, G6–G7, G9 | **MET** (tracking/matrix) |
| G5 | **MET** (pilot) |
| G8 | **NOT MET** |
| PROD | **BLOCKED** (NXDOMAIN) |

---

## Ước lượng tổng

| | Số wave | Sub-agent runs (ước) | Calendar |
|---|--------:|---------------------:|----------|
| Có thể agent tự chạy | **8** | **~32–40** | ~2–3 tuần |
| Cần user (DNS / git commit) | **2** | **~6–8** | phụ thuộc user |
| **Tổng đến bàn giao UAT** | **10** | **~38–48** | ~3–4 tuần |
| **Đã chạy phiên 2026-06-05** | W6+W8+W10 | **~15** sub-agent | W6 ✅ · W8 G8 MET · W10 docs ✅ |
| **Còn lại ước tính** | W7+W9+W10-QC+W11 | **~12–18** | W7/W11 cần user |
| PROD corp domain | +1 | +4–6 | sau DNS |

---

## Wave manifest (thứ tự PM)

### W6 — Residual P0 closure (**~90% done** 2026-06-05)

| Closed | Evidence |
|--------|----------|
| C-W12QC-02 contracts-ratio | `p1-phase1-qc-contracts-ratio-20260605.md` |
| C-MEMCC-01 member CC | `qc-p1-w6-memcc-close-20260605.md` |
| C-JCC03-01 P-CC-01-jwt | `p1-ex-qc-jwt-close-20260605.md` |
| C-W12QC-01 mobile P5 | **in QA** |

### W6 — Residual P0 closure (manifest)

| ID | Role | work_item_id | Exit |
|----|------|--------------|------|
| W6-1 | dev-be | `P1-PHASE1-BE-CONTRACTS-RATIO-01` | `verify:hrm:menu-density` contracts-ratio ≥ 0.85 |
| W6-2 | dev-fe | `P1-PHASE1-FE-MEMCC-01` | C-MEMCC-01 member CC iframe PASS |
| W6-3 | qa | `P1-EX-QA-JWT-CLOSE-01` | C-JCC03-01 closed; probe exit 0 |
| W6-4 | dev-mobile | `P1-PHASE1-MOB-P5-JWT-01` | C-W12QC-01 mobile attendance JWT |
| W6-5 | qa | `P1-W6-QA-RESIDUAL-01` | L2.5 retest MEMCC + density |
| W6-6 | qc | `P1-W6-QC-RESIDUAL-01` | GWC residuals adjudication |

### W7 — Git parity + deploy chuẩn (**USER gate: commit**)

| ID | Role | work_item_id | Exit |
|----|------|--------------|------|
| W7-1 | dev-be | `P1-S5-BE-GIT-PARITY-01` | 22 files committed (user OK) |
| W7-2 | devops | `P1-W7-DO-STANDARD-DEPLOY-01` | VPS = origin/main, không pscp drift |
| W7-3 | qa | `P1-W7-QA-SCOPE-REGRESS-01` | TM-S5-P0 + J-XBOS regression |
| W7-4 | qc | `P1-W7-QC-GIT-PARITY-01` | C-S5SCOPEQC-01 closed |

### W8 — G8 program zero-defect (nip.io SoT)

| ID | Role | work_item_id | Exit |
|----|------|--------------|------|
| W8-1 | devops | `P1-W8-DO-L0-LOCAL-01` | `qc:dev-stack` local exit 0 hoặc runbook |
| W8-2 | qa | `P1-W8-QA-G8-01` | P-CC-01..08 + J-* matrix PASS |
| W8-3 | qa | `P1-W8-QA-STRICT-GATE-01` | `phase1:gate --strict` exit 0 nip.io |
| W8-4 | qc | `P1-W8-QC-G8-01` | G8 **MET** adjudication |

### W9 — Excellence / persona (T2–T5)

| ID | Role | work_item_id | Exit |
|----|------|--------------|------|
| W9-1 | qa | `P1-EX-QA-01` | 3 persona UAT (group/member/HRBP) |
| W9-2 | dev-fe | `P1-EX-FE-01` | P0 UX empty states / tabs |
| W9-3 | technical-manager | `P1-EX-TM-01` | Security/NFR GO |
| W9-4 | qc | `P1-EX-QC-01` | T1–T6 excellence gate |

### W10 — Bàn giao khách

| ID | Role | work_item_id | Exit |
|----|------|--------------|------|
| W10-1 | ba-docs | `P1-HANDOFF-BA-01` | BRD/SRS HTML deliverable |
| W10-2 | qc | `P1-PHASE1-QC-FINAL-01` | Program **GO** UAT handoff |
| W10-3 | pm | `P1-PHASE1-PM-CLOSE-01` | PSR signed · Phase 1 DONE (UAT) |

### W11 — PROD (sau user DNS)

| ID | Role | work_item_id | Exit |
|----|------|--------------|------|
| W11-1 | devops | `P1-P100-W14-DO-DOMAIN-01` | `portal.xe.vn` TLS live |
| W11-2 | devops | `P1-EX-DO-01` | `verify:production-env` exit 0 |
| W11-3 | qc | `P1-W14-QC-PROD-FINAL-01` | PROD-READY **GO** |

---

## Blockers cần user

1. **「commit scope parity」** — mở W7 (22 file BE).
2. **DNS `portal.xe.vn`** — mở W11 (không agent tự làm được).

## PM policy

- Song song tối đa **3** Task/lượt.
- Mỗi Dev → QA → QC trước khi promote gate.
- Không claim Phase 1 DONE cho đến W10-2 QC **GO**.
