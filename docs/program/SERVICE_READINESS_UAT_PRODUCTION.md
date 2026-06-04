# Sẵn sàng dịch vụ — UAT & Production

**Cập nhật:** 2026-06-01  
**Mục tiêu sync:** chốt C-W12QC-07 theo W12 QC FINAL + W13 QA PASS, bỏ baseline cũ kiểu "111 planned".

---

## 1) Status line chính thức

- **Program closure baseline:** W12 QC FINAL = **GO WITH CONDITIONS** (`PASS_TO_PM`).
- **Partner perimeter QA:** W13 QA = **PASS_TO_PM** (L2/L2.5 in-scope PASS).
- **Metrics format:** W13 QA metrics xác nhận XBOS/HRM trả Prometheus text (`# HELP`) và đề xuất đóng `C-W12QC-08`.
- **QC prod gate:** W14 QC = **GO WITH CONDITIONS** trên host interim nip.io.
- **Production fully live:** **chưa đạt** vì corp domain `portal.xe.vn` còn `BLOCKED` (DNS/TLS prerequisite).

---

## 2) Service readiness matrix (current)

| ID | Dịch vụ/slice | UAT status | Production status | Evidence mới nhất |
|---|---|---|---|---|
| SVC-01 | XBOS API metrics + core APIs | PASS (W13 QA) | GWC (interim nip.io) | `docs/qa/evidence/p1-p100-w13-qa-metrics-01-20260601.md`, `docs/ops/evidence/p1-p100-w13-do-prod-r2-20260601.md` |
| SVC-02 | HRM API metrics + list/detail | PASS (W13 QA) | GWC (interim nip.io) | `docs/qa/evidence/p1-p100-w13-qa-01-20260531.md`, `docs/qa/evidence/p1-p100-w14-qc-prod-20260601.md` |
| SVC-03 | Portal `/`, `/command-center`, `/hr/` | PASS (W13 QA) | GWC (interim nip.io) | `docs/qa/evidence/p1-p100-w13-qa-01-20260531.md`, `docs/qa/evidence/p1-p100-w14-qc-prod-20260601.md` |
| SVC-04 | L2.5 J-CC/J-HRM in-scope journeys | PASS (W13 + W14 probe) | GWC (interim nip.io) | `docs/qa/evidence/p1-p100-w13-qa-01-20260531.md`, `docs/qa/evidence/p1-p100-w14-qc-prod-20260601.md` |
| SVC-05 | Mobile P5 attendance JWT write path | Residual open (`C-W12QC-01`) | Not promoted | `docs/qa/evidence/p1-p100-w12-qc-final-20260531.md` |
| SVC-06 | Contracts density ratio >= 0.85 | Residual open (`C-W12QC-02`) | Not promoted | `docs/qa/evidence/p1-p100-w12-qc-final-20260531.md` |
| SVC-07 | Corporate domain `portal.xe.vn` | N/A | **BLOCKED** (NXDOMAIN/TLS not ready) | `docs/ops/evidence/p1-p100-w14-do-domain-01-20260601.md` |

---

## 3) Production definition for this wave

| Level | Meaning | Current verdict |
|---|---|---|
| Interim partner production | Dùng host `https://14-225-217-232.nip.io` với QC GWC | **YES (GWC)** |
| Corporate production | Dùng `https://portal.xe.vn` với DNS + TLS + QC re-gate | **NO (BLOCKED)** |
| Fully live production claim | Cho phép tuyên bố fully live không điều kiện | **NO** |

---

## 4) Open conditions before full production claim

1. Close DNS/TLS blocker `portal.xe.vn` (`P1-P100-W14-DO-DOMAIN-01`).
2. Promote/confirm closure `C-W12QC-08` in QC packet with W13 metrics PASS evidence.
3. Close mobile residual `C-W12QC-01` and contracts density `C-W12QC-02`.
4. QC re-gate after domain lane is unblocked.

---

## 5) Source evidence set

- `docs/qa/evidence/p1-p100-w12-qc-final-20260531.md`
- `docs/qa/evidence/p1-p100-w13-qa-01-20260531.md`
- `docs/qa/evidence/p1-p100-w13-qa-metrics-01-20260601.md`
- `docs/ops/evidence/p1-p100-w13-do-prod-r2-20260601.md`
- `docs/qa/evidence/p1-p100-w14-qc-prod-20260601.md`
- `docs/ops/evidence/p1-p100-w14-do-domain-01-20260601.md`
