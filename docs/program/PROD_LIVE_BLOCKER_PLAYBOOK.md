# PROD LIVE — C-* blocker map & vận hành (Phase 1)

## North star
Đích cuối để **đối tác chạy được** là `PROD-LIVE` sau **W14**. Mọi việc trước đó chỉ là ramp (UAT / prep / program).

## Blocker đếm theo `C-W12QC-*` (Phase 1 W12 QC FINAL SoT)

### A) Blocker “hard” để lift `PROD LIVE` (đúng nghĩa chặn W14)
1. `C-W12QC-05` — `W13-DO` production cutover theo runbook (Owner: DevOps)
2. `C-W12QC-06` — `W14` QC gate `PROD-LIVE` (Owner: QC)
3. `C-W12QC-08` — VPS `XBOS Prometheus text format` (Owner: DevOps, thực thi trong W13-DO rebuild)

=> Khi còn thiếu 1 trong 3 mục trên thì **không được** coi là `PROD LIVE`.

### B) C-* conditions còn mở (tổng) — đảm bảo “đủ chất lượng đối tác” cho mobile/menu demo
- `C-W12QC-01` — Mobile UAT P5 37/0 (mobile-jwt attendance record UUID scope) (Owner: Dev-Mobile/Dev-BE)
- `C-W12QC-03` — `J-HRM-06` browser fresh capture (Owner: QA, optional nhưng nên đóng để dọn backlog GWC)
- `C-W12QC-04` — `P1-P100-W10-DEVICE-03` sau MOB-FIX APK (Owner: qa-device)
- `C-W12QC-07` — Sync `PROJECT_STATUS_REPORT` / `SERVICE_READINESS` (Owner: PM)

> Ghi chú: `C-W12QC-01/04` có thể **không chặn web PROD runway**, nhưng vẫn là phần “đủ chất lượng” để mobile partner demo không bị hụt.

## Vận hành để “không đứng im”

### Quy tắc intake (áp dụng cho PM/composer)
1. Khi thấy evidence mới từ member với `ack_status: PASS_TO_PM | READY_FOR_QA`:
   - PM phải dispatch ngay task kế (QA retest / QC gate / DevOps tiếp theo) trong cùng phiên.
2. Khi member báo `ERROR`:
   - PM **re-dispatch đúng lane nhưng thu hẹp phạm vi** (ví dụ W13-DO: chỉ rebuild xbos metrics text, bỏ corp DNS nếu chưa có).
   - Đồng thời dispatch các lane **không phụ thuộc** (device/API seeding/mobile wires).
3. Với `provider error`/resource not found:
   - Không spam retry vô hạn.
   - Ghi “fallback decision”: nếu nip.io partner smoke vẫn PASS, có thể proceed `W14` với note GWC metrics format; còn nếu QC PROD yêu cầu strict thì chờ W13-DO PASS.

## Quality gates cho sprint tiếp theo
### Partner prep smoke (nip.io)
- Không ERROR banner / không `409` / không `54321` trên load paths.
- API L2/L2.5 journeys: list → detail `200`.

### PROD smoke (sau cutover)
- portal/CC `/hr/` và `/api/*/metrics?format=prometheus` đáp ứng kỳ vọng.
- `verify:production-env` (nếu script bị chặn do tool thiếu `dotenv` thì QC dùng manual equivalent, nhưng phải ghi evidence).

## Evidence paths bắt buộc
- `docs/qa/evidence/p1-p100-w12-qc-final-20260531.md` (C map gốc)
- `docs/ops/evidence/p1-p100-w13-prep-20260531.md`
- `docs/ops/evidence/p1-p100-w13-do-prod-*.md` (W13 cutover)
- `docs/qa/evidence/p1-p100-w14-qc-prod-*.md` (W14 QC final)

