# W6 Sponsor UAT Session Pack — PCOMP-W6-SP-01

**Ngày chuẩn bị gốc:** 2026-06-09 · **PM:** P1-L0-W6-UAT-PACK  
**Refresh SoT (2026-07-28):** [`docs/qa/evidence/pcomp-w6-qa-uat-prep-02-20260728.md`](../../qa/evidence/pcomp-w6-qa-uat-prep-02-20260728.md) — **dùng file này cho phiên sponsor.**  
Prior: [`pcomp-w6-qa-uat-prep-01-20260725.md`](../../qa/evidence/pcomp-w6-qa-uat-prep-01-20260725.md)

**Mục đích:** Bước duy nhất sponsor phải làm bằng tay — ký nhận UAT browser (localhost). Mọi gate kỹ thuật do team chạy trước.

## Sponsor locks (2026-07-25)

| ID | Decision |
|----|----------|
| 1B | **LOCAL ONLY** — không assert `:8088` làm host UAT |
| 2B | Theme commit không bắt buộc |
| 3A | UAT W6 soon — pack đã refresh |
| 4C | `portal.xe.vn` **OUT OF SCOPE** |
| 5A | **Không** claim Phase1 / PROD |
| U65 | Zero-seed · FE-only |
| HOLD_DEPLOY | Không deploy để nghiệm thu W6 |

## URL & stack (localhost)

| Dịch vụ | URL |
|---------|-----|
| Web portal | http://localhost:5173 |
| HRM API | http://localhost:28001 |
| XBOS API | http://localhost:28002 |

**L0 (2026-07-28 prep):** **BLOCKED** — hrm `:28001` + xbos `:28002` + portal `:5173` all down. Sponsor session **sau** `qc:dev-stack` exit 0. Chi tiết: evidence QA 20260728 §1. Coord: `PCOMP-W6-DO-LOCAL-STACK-02`.

## Tài khoản

| Persona | Email | Mật khẩu | Kỳ vọng |
|---------|-------|----------|---------|
| CEO tập đoàn | ceo@xe.vn | Xevn@2026 | Full rollup CC + HRM embed |
| CEO ĐVTV | du-lich.ceo@xe.vn | Xevn@2026 | Chỉ scope công ty; 403/409 rollup |

## Checklist bắt buộc

Xem bảng đầy đủ + ô đánh dấu trong:

**[`pcomp-w6-qa-uat-prep-02-20260728.md`](../../qa/evidence/pcomp-w6-qa-uat-prep-02-20260728.md)** §3

Tóm tắt:

- **L2** P-CC-01..09 — tab load; không banner đỏ / 409 scope / 54321
- **L2.5** J-HRM-01..07 — list → detail / back; không 404 scope
- **GWC closed (không re-open trừ regress):** company-col local · JWT `C-JCC03-01`

## Mobile (không bắt buộc phiên sponsor web)

- APK / `uat.nv####` = team lane riêng nếu cần — không gate W6 web pack này.

## Ký nhận

| Field | Value |
|-------|-------|
| Verdict | [ ] UAT-PASS [ ] UAT-FAIL [ ] BLOCKED (L0) |
| Ghi chú defect | |
| Ngày | |
| Pack | `docs/qa/evidence/pcomp-w6-qa-uat-prep-02-20260728.md` |

Ghi verdict vào bus: `PCOMP-W6-SP-01 | sponsor -> pm | verdict`
