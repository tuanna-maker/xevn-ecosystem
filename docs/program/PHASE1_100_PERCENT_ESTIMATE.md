# Phase 1 — Ước lượng khối lượng đóng 100%

**Ngày:** 2026-05-31 · **Owner:** PM  
**Baseline ma trận:** `phase1-impl-status.json` — **244 `e2e_pass` + 1 `waived` = 245/245 (G1 catalog)**

> **245/245 impl_status ≠ Phase 1 DONE 100%** theo `PHASE1_COMPLETION_PLAN.md` G1–G9 + `PHASE1_QUALITY_FIRST.md` Q1–Q7 + TM/SA + PROD.

---

## Ba mức «100%» (tránh hiểu nhầm)

| Mức | Định nghĩa | % hiện tại (ước) | Còn lại (agent-days*) |
|-----|------------|------------------|------------------------|
| **A — UAT chất lượng** | Q1–Q7 PASS/GWC đóng hết trên pilot; J-MOB device; L0–L2.5 | **~88%** | **4–6** |
| **B — Program Phase 1** | G1–G9 evidence + QC **GO** (cho phép GWC có owner); TM/SA sign-off | **~72%** | **8–12** |
| **C — Production corp** | PROD-READY/LIVE + runbook + QC prod | **~15%** | **5–8** |

\* *agent-days = 1 role chạy full 1 ngày; wall-clock ~3–7 ngày nếu 3–4 lane song song.*

**Tổng A→B→C (tuần tự logic):** **~17–26 agent-days** · song song tối đa **~10–14 ngày lịch**.

---

## Ma trận G1–G9 — gap còn mở

| Gate | Đích | Hiện trạng | Việc còn | Owner | Ước lượng |
|------|------|------------|----------|-------|-----------|
| **G1** | 245 UC e2e/waived | **Đóng** | Regression spot | QA | 0.5d |
| **G2** | XBOS 104/104 e2e | **103+1 waived** | MASTER-01 implement hoặc giữ waiver có expiry | Dev-BE + PM | 0.5–2d |
| **G3** | HRM 119 QA sign-off | L2.5 **7/7** pilot | Formal sign-off file + member slice | QA + BA | 1–2d |
| **G4** | DM-LOG 22/22 | Chưa audit đủ | Checklist + evidence pack | QA + Dev-BE | 1–2d |
| **G5** | 183 catalog publish | Seed đã có slice | Verify publish version E2E | Dev-BE + DevOps | 1d |
| **G6** | Mobile 15/15 | API PASS; device GWC | APK MOB-HEADER + adb J-MOB-03..05 | Dev-Mobile + qa-device | 1–2d |
| **G7** | `phase1:gate --strict` | PASS trên VPS/repo | Re-run sau mỗi wave | QA | 0.25d |
| **G8** | L0→L3 zero-defect | Pilot HTTPS PASS slice | J-HRM-06 browser; full matrix refresh | QA + QC | 1–2d |
| **G9** | Traceability 245 | none=0/245 | File formal + regression | QA | 0.25d |

| **Q1–Q7** | Chất lượng sản phẩm | Q1,Q2,Q6 **PASS**; Q3 device; Q5 GWC scope | Wave 10–11 | Mixed | **3–4d** |
| **TM/SA** | S5 sign-off | **Chưa** | Audit G1–G9 vs evidence | TM + SA | **1–2d** |
| **PROD** | PROD-READY | **🔴** | TLS, deploy, backup, QC prod GO | DevOps + QC | **5–8d** |

---

## Wave PM (W10→W14) — thứ tự tự động

### Wave 10 — Đóng P0 chất lượng (song song, **đang dispatch**)

| ID | Owner | Exit |
|----|-------|------|
| P1-P100-W10-APK-01 | Dev-Mobile | Release APK MOB-HEADER |
| P1-P100-W10-DO-01 | DevOps | Pilot reseed + `qc:dev-stack` / prod-readiness scan |
| P1-P100-W10-DEVICE-01 | qa-device | J-MOB-03/04/05 row tap + Duyệt |
| P1-P100-W10-QA-01 | QA | J-HRM-06 browser + L2.5 sweep + `test:system:uat` + gate |
| P1-P100-W10-TM-01 | TM | G1–G9 gap list + scope parity residual |
| P1-P100-W10-BE-SCOPE-01 | Dev-BE | C-QUAL upload/assets + MASTER-02 nếu TM flag |

### Wave 11 — Governance + formal sign-off

| ID | Owner | Exit |
|----|-------|------|
| P1-P100-W11-SA-01 | SA | ADR/NFR sign-off note S5 |
| P1-P100-W11-BA-01 | ba-process | UAT-PASS script gap delta |
| P1-P100-W11-QA-02 | QA | G3/G4/G9 formal evidence files |
| P1-P100-W11-QC-01 | QC | Interim GO/GWC trên W10 |

### Wave 12 — Program close

| ID | Owner | Exit |
|----|-------|------|
| P1-P100-W12-QC-FINAL | QC | **GO** hoặc **GWC** có expiry — Phase 1 Program |
| P1-P100-W12-PM-CLOSE | PM | `PROJECT_STATUS_REPORT` + `USER_SERVICE_STATUS` |

### Wave 13–14 — PROD (sau B đóng)

| ID | Owner | Exit |
|----|-------|------|
| P1-P100-W13-DO-PROD | DevOps | Cutover runbook + smoke |
| P1-P100-W14-QC-PROD | QC | PROD-READY GO |

---

## North star sponsor (2026-05-31)

**Đích cuối = PROD LIVE cho đối tác** — 4 wave còn: W10 đuôi → W11 → W12 → **W13–14**.

| Wave | Mục tiêu đối tác |
|------|------------------|
| W10 đuôi | Mobile header fix + device (không chặn PROD web) |
| W11 | Formal sign-off + QC interim |
| W12 | Program QC FINAL |
| **W13** | Cutover VPS/domain/TLS/secrets (`PRODUCTION_ENABLE_RUNBOOK.md`) |
| **W14** | QC **PROD-LIVE** GO |

## Cam kết trung thực với sponsor

| Có thể nói khi xong **B** (W12) | Chỉ nói khi xong **C** (W14) |
|--------------------------------|------------------------------|
| Phase 1 Program QC GO/GWC | **Production LIVE** cho đối tác |
| UAT-PASS pilot HTTPS | Domain corp + vận hành |
| J-HRM + persona signed | Mọi 377 UC Phase 2 |

---

*PM cập nhật file này sau mỗi wave QC PASS.*
