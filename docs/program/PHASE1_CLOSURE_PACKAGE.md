# Phase 1 — Gói đóng gói (245 UC — G1)

**Ngày:** 2026-05-29  
**Owner:** PM  
**Đối tượng:** Sponsor / khách UAT slice tập đoàn

---

## 1. Kết luận đóng gói

| Câu hỏi | Trả lời |
|---------|---------|
| **245 UC trong Phase 1 đã đóng trạng thái ma trận?** | **Có** — `243` `e2e_pass` + `2` `waived` = **245/245** |
| Nguồn | `docs/ecosystem/phase1-impl-status.json` · `docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · `docs/qa/PHASE1_GATE_REPORT.md` |
| **Phase 1 Program DONE (G1–G9 + Production)?** | **Chưa** — xem [`PHASE1_TEAM_WBS.md`](./PHASE1_TEAM_WBS.md) mục residual |
| **UAT khách slice CEO tập đoàn?** | **Sẵn sàng có điều kiện** — local/VPS + HTTPS pilot evidence |
| **373 UC toàn SRS?** | **Không** — ngoài scope Phase 1 |

---

## 2. Nội dung gói (copy cho khách / audit)

| # | Artifact | Path |
|---|----------|------|
| 1 | Ma trận UC × SRS × TechSpec | `docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md` |
| 2 | Trạng thái impl | `docs/ecosystem/phase1-impl-status.json` |
| 3 | Gate report | `docs/qa/PHASE1_GATE_REPORT.md` |
| 4 | Báo cáo PM | `docs/program/PROJECT_STATUS_REPORT.md` |
| 5 | UAT / Production matrix | `docs/program/SERVICE_READINESS_UAT_PRODUCTION.md` |
| 6 | Journey + pilot flows | `docs/program/PROGRAM_JOURNEY_MAP.md` · `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` |
| 7 | HTTPS pilot (2026-05) | `docs/qa/evidence/qc-https-p-cc-01-jwt-01-20260529.md` (probe 23/23) |
| 8 | Evidence index | `docs/program/EVIDENCE_INDEX.md` |
| 9 | SRS khách | `docs/client-delivery/02_SRS_XeVN_OS.html` |

---

## 3. Waiver (2 UC)

Chi tiết mã + lý do: cột `impl_status=waived` trong ma trận + `docs/qa/evidence/p1-ex-ba-waiver-01-20260527.md` (nếu áp dụng sponsor waiver).

---

## 4. Điều kiện khi bàn giao UAT (không phải Production)

1. Stack: `pnpm run qc:dev-stack` + seed chain (`HUONG_DAN_DANG_NHAP_PILOT.md`).
2. Tài khoản: `ceo@xe.vn` / scope `main` (tập đoàn).
3. HTTPS pilot (tuỳ chọn): `https://14-225-217-232.nip.io` — evidence QC GWC đã có.

---

## 5. Explicitly NOT in this package

- Production cutover / domain chính thức
- 128 UC Logistics (Phase 2)
- UAT đầy đủ mọi persona công ty thành viên (HRBP/member CEO) — WBS residual
- Cam kết «mọi màn hình khách bấm tay 245 UC» — ma trận = catalog + automation; UAT tay theo matrix pilot

---

## 6. Chữ ký đề xuất (governance)

| Role | G1 ma trận 245/245 | UAT baseline | Production |
|------|-------------------|--------------|------------|
| PM | Đề xuất đóng G1 | GWC | Chưa |
| QC | — | GWC pilot | NO-GO |
| SA | Review drift (trigger) | — | — |
| Dev-BE Lead | Jest/catalog | — | — |

**QC program GO** chỉ sau residual WBS = 0 hoặc GWC đóng hết (`PHASE1_TEAM_WBS.md`).
