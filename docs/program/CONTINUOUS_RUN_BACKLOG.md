# Continuous run — backlog (CLOSED 2026-05-29)

**Chính sách:** PM dispatch liên tục — **đã chạy xong** các hàng bắt buộc.

| # | Epic | ID | Owner | Trạng thái |
|---|------|-----|-------|------------|
| 1 | Supabase W4 | P1-SUPA-W4-DO | devops | **DONE** |
| 2 | Supabase W4 | P1-SUPA-W4-BE | dev-be | **DONE** |
| 3 | Supabase W4 | P1-SUPA-W4-FE | dev-fe | **DONE** (+ FE-R2 shift/advance) |
| 4 | Supabase W4 | P1-SUPA-QA-04 | qa | **DONE** |
| 5 | Supabase W4 | P1-SUPA-QC-04 | qc | **DONE** (program exit GWC) |
| 6 | Supabase W4 | P1-SUPA-W4-DO-R2 | devops | **DONE** (lockfile scrub) |
| 7 | Phase 1 G9 | P1-G9-QA-01 | qa | **DONE** |
| 8 | Phase 1 | P1-R4-QC-01 | qc | **DONE** (Program GWC) |
| 9 | Phase 1 | P1-R4-PM-01 | pm | **DONE** (PSR refresh below) |

## Kết luận sponsor

| Mục | Verdict |
|-----|---------|
| **Supabase** | Runtime + repo cleanup **GWC** — không còn folder `supabase/`, không import client, 0 network 54321 pilot |
| **Phase 1 Program** | **GO WITH CONDITIONS** — G1 245/245; UAT GWC; **Production chưa** |
| **G2** | 103/104 e2e + 1 waiver — không nói 104/104 |

## Evidence index

`docs/qa/evidence/p1-supa-*` · `p1-g9-qa-01` · `p1-r4-qc-01` · `docs/ops/evidence/p1-supa-do-02`

## Residual tùy chọn (không chặn đóng continuous run)

- Advance approve/reject Nest (BE R3) + FE gap toast
- `apps/web/hrm/package-lock.json` / `bun.lock` supabase strings (cosmetic)
- Corporate PROD DNS/TLS (P1-R3)
- RACI member 409 nếu user báo lại
