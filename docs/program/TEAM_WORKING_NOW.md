# Team — Current lanes and blockers

**Cập nhật:** 2026-06-01T10:20+07:00

## Đã đóng

| Wave | Verdict | Evidence |
|---|---|---|
| W12 QC FINAL | **GO WITH CONDITIONS** | `docs/qa/evidence/p1-p100-w12-qc-final-20260531.md` |
| W13 QA (partner prep) | **PASS_TO_PM** | `docs/qa/evidence/p1-p100-w13-qa-01-20260531.md` |
| W13 QA metrics | **PASS_TO_PM** (`C-W12QC-08` closure recommendation) | `docs/qa/evidence/p1-p100-w13-qa-metrics-01-20260601.md` |
| W14 QC prod gate (interim host) | **GO WITH CONDITIONS** | `docs/qa/evidence/p1-p100-w14-qc-prod-20260601.md` |

## Đang chạy

| Lane | work_item_id | Owner | Current status |
|---|---|---|---|
| Corp domain unblock | `P1-P100-W14-DO-DOMAIN-01` | PM + DevOps | **BLOCKED** (DNS/TLS prerequisite for `portal.xe.vn`) |
| Mobile residual closure | `C-W12QC-01` / `P1-P100-W10-DEVICE-04` | dev-mobile + dev-be + qa-device | Open |
| Contracts density closure | `C-W12QC-02` | dev-be + devops seed + qa | Open |
| PM documentation closure | `P1-P100-W12-PM-CLOSE-R1` | pm | In progress (this update) |

## Remaining blockers

1. `portal.xe.vn` currently NXDOMAIN, so corp-domain PROD-LIVE cannot be declared.
2. Mobile P5 JWT attendance residual is still open (`C-W12QC-01`).
3. Contracts ratio residual is still open (`C-W12QC-02`).

## P0 INCIDENT (user screenshot 2026-06-01)

| ID | Issue | Owner |
|----|-------|-------|
| **P1-INC-P0-HRM-DASH-01** | P0 **CLOSED** nip.io (QC-02 GWC) — crash/1970 fixed; open: FE merge main, iframe P2 | dev-fe P1 |

**QA/QC lesson:** API probe PASS ≠ runtime UI PASS. Bắt buộc console check trên route user thật.

## PM next dispatch focus

- Close P0 dashboard crash trước khi nói PROD/UAT PASS.
- Corp domain `portal.xe.vn` vẫn BLOCKED (DNS).
