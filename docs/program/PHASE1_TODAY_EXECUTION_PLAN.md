# Phase 1 — Hoàn thiện trong hôm nay (24/05/2026)

**Lệnh user (U18):** Kéo deadline → **hết ngày 24/05/2026 (ICT)**. **Mục tiêu: Phase 1 DONE (G1–G9)**.

**Mô hình mới:** Nếu nghiệp vụ **đã có** trong SRS/TechSpec → **SA + BA + TA + Dev Lead** đọc lại, **chủ động** bổ sung delta vào SRS/TechSpec nếu thiếu → **tự chia việc** → Dev+QA thực thi.

---

## Deadline

| Mốc | Thời điểm |
|-----|-----------|
| Bắt đầu U18 | 2026-05-24T09:06 ICT |
| **Deadline** | **2026-05-24T23:59:59+07:00** |
| Baseline | 30 e2e_pass, 63 planned, 31/245 closed |

---

## Luồng hôm nay

```
09:00–11:00  GOV WAVE: SA + BA-P + BA-D + TA + Dev-BE Lead → SRS/TechSpec delta + backlog chia việc
11:00–18:00  EXEC WAVE 1: Dev-BE ‖ Dev-FE ‖ QA (khối A be→e2e, config/WF/CC)
18:00–21:00  EXEC WAVE 2: Dev-BE ‖ Dev-FE ‖ Dev-Mobile + QA (HRM 119, DM-LOG)
21:00–23:00  S5: QA-02 promotion + TM + QC + phase1:gate --strict + PM sign-off
```

---

## Governance wave (chủ động — không chờ defect)

| Role | Việc | Output |
|------|------|--------|
| **SA** | Rà TechSpec/OpenAPI vs impl; gap kiến trúc | ADR hoặc TechSpec § delta |
| **BA-P** | Rà UC matrix vs pilot flows; AC thiếu | Delta rows `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` |
| **BA-D** | Rà contract field / catalog 183 | Data contract note |
| **TA (TM+QC)** | Đánh giá G1–G9 gap; waiver policy | Gap list + owner |
| **Dev-BE Lead** | Map API thiếu vs SRS | Backlog BE waves (A→C→B) |

**Quy tắc:** Chỉ **bổ sung** SRS/TechSpec (delta), không viết lại toàn bộ. Mọi delta ghi `spec_ref` trên bus.

---

## Execution waves (Dev + QA)

| Wave | Mục tiêu G | Owner |
|------|-----------|-------|
| A | G2: 104/104 XBOS e2e_pass | dev-be, dev-fe, qa |
| C | G3: 119/119 HRM | dev-be, dev-fe, dev-mobile, qa |
| B | G4 + G5: DM-LOG + 183 catalog | dev-be, devops, qa |
| S5 | G1,G7,G8,G9 + QC GO | qa, qc, pm |

---

## Không claim trước QC

Phase 1 DONE chỉ khi `P1-S5-QC-01` re-run **GO** (hoặc GWC đóng hết) + `phase1:gate --strict` exit 0.

Evidence index: `docs/program/EVIDENCE_INDEX.md` · Bus: `AGENT_MESSAGE_BUS.md`
