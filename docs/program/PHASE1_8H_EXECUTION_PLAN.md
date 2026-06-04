# Phase 1 — Kế hoạch 8 giờ (deadline user)

**Lệnh user (U17):** Sau **8 giờ** kể từ khi ghi nhận → **Phase 1 hoàn thiện** (G1–G9 trong `PHASE1_COMPLETION_PLAN.md`).

| Mốc | Thời điểm |
|-----|-----------|
| **Bắt đầu** | 2026-05-24T25:30:00Z |
| **Deadline** | **2026-05-25T09:30:00Z** (08:30 ICT ngày 25/05) |
| **Baseline gate** | 111 `planned`, 54 `be`, 15 `e2e_pass`, 1 `waived` |

**Điều phối:** U16 execution = Dev+QA only · Governance = PM/SA/BA/TA sau mỗi wave.

---

## Định nghĩa “hoàn thiện” (không đổi)

| Gate | Đích | Evidence |
|------|------|----------|
| G1 | 245 UC `e2e_pass` hoặc `waived` có path | `phase1-impl-status.json` |
| G2 | 104/104 XBOS | `verify:capabilities` exit 0 |
| G3 | 119/119 HRM sign-off | UAT matrix + embed audit |
| G4 | 22/22 DM-LOG | XBOS-DM-LOG-19 |
| G5 | 183 DM publish+seed | seed scripts |
| G6 | 15/15 mobile | regression smoke |
| G7 | `phase1:gate --strict` exit 0 | `PHASE1_GATE_REPORT.md` |
| G8 | L0–L3 + P-CC-01..08 PASS | `docs/qa/evidence/*` |
| G9 | 245 UC test ≥ partial | `test:uc:catalog` |

**Chiến lược 8h:** Nén S2→S5 **song song tối đa** (3 Task execution + stack DevOps), không chờ hook; governance chỉ ở cửa QC/TM.

---

## Timeline (giờ)

| Giờ | Execution (Dev/QA/DevOps) | Governance (ngắn) | Gate kỳ vọng |
|-----|---------------------------|-------------------|--------------|
| **H0–H1** | `qc:dev-stack` · **P1-S2-FE-01** · **P1-S2-BE-WAVE-01** · fix capability path Unicode | SA ADR C2 nếu block scope | Stack up; ↓20 `planned`→`be` |
| **H1–H2** | **P1-S2-QA-01** · `verify:capabilities` · `test:uc:catalog` | TM spot S2 | G2 tiến (~40+ e2e_pass khối A) |
| **H2–H4** | **P1-S3-BE-01/02** · **P1-S3-FE-01** · **P1-S3-QA-01** (HRM 119) | BA delta chỉ `spec_gap` | G3 path; embed 8/8 |
| **H4–H5** | **P1-S4-DO-01** seeds · **P1-S4-BE-01** · **P1-S4-QA-01** | — | G5 seeds |
| **H5–H6** | **P1-S4-QA-01** DM-LOG · mobile regression | QC khối B | G4 |
| **H6–H8** | **P1-S5-QA-01/02** · `phase1:gate --strict` | **P1-S5-QC-01** · PM **P1-S5-PM-01** | **G1–G9** |

> **Waiver:** Chỉ PM+QC ký `waived` có `evidence_path`+expiry cho UC không kịp implement — **không** waiver hàng loạt không log.

---

## Song song tối đa (mỗi cửa sổ)

```
H0: Dev-FE-01 ‖ Dev-BE-WAVE-01 ‖ DevOps stack
H1: QA-S2 ‖ (BE tiếp nếu còn planned A)
H2: Dev-BE-S3 ‖ Dev-FE-S3 ‖ QA prep HRM UAT
H4: DevOps seed ‖ Dev-BE-S4
H6: QA-S5 full regression ‖ QC
```

Hook: **STOP** · Bus tag: `lane: execution` · `deadline: PHASE1_8H`.

---

## Rủi ro đã biết

| Rủi ro | Mitigation |
|--------|------------|
| `verify:capabilities` fail path Unicode Windows | Chạy từ `pnpm` script root; short path hoặc `node scripts/...` tuyệt đối |
| 111 `planned` → 245 đóng trong 8h | Batch impl_status + automation e2e; waiver có kiểm soát cho UC không UI-critical |
| API down | H0 bắt buộc `qc:dev-stack` trước mọi wave |

---

## PM checkpoint (báo user)

| Checkpoint | Thời điểm | Artifact |
|------------|-----------|----------|
| CP1 | H+2 | `SPRINT_STATUS_AT_A_GLANCE.md` + gate counts |
| CP2 | H+4 | `PROJECT_STATUS_REPORT.md` PSR-8H-mid |
| CP3 | H+8 | `P1-S5-QC-01` + `phase1:gate --strict` + **Phase 1 DONE** hoặc GWC có owner |

**Theo dõi:** `PHASE1_SPRINT_RUNNER.json` → `deadline_phase1_8h`
