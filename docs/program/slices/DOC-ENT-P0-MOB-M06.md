# Slice — DOC-ENT-P0-MOB-M06

| Field | Value |
| --- | --- |
| **Story** | DOC-ENT-P0-MOB-M06 |
| **Epic / lane** | DOC-ENT P0 · Offline idempotency |
| **Owner** | W1-B Team Claude → Cursor review |
| **UC / FR** | **FR-UC-M06** · UC-M06 |
| **AC** | Diễn biến #3–4 · **AC-HRM-MOB-J06** · MG-05 |
| **Flow test** | Offline queue leave POST → replay → một bản ghi server · 409 idempotent |
| **change_mode** | UPGRADE |
| **work_item_id** | OS-STD-W1-A-SLICE-01 |
| **status** | DRAFT |
| **W1-B priority** | **P0-6** (cùng/ngay sau leave mobile) |

## spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_NEW.md v1.1 §3.2 · FR-UC-M06 · AC-HRM-MOB-J06
- tech_spec: TECH_SPEC_NEW.md v1.1 · offline/idempotency
- db_design: DB_DESIGN_NEW.md §5 — **không bảng P0 mới** (header middleware TTL)
- api_design: API_CONTRACT_NEW.md v1.1 §9 — Idempotency-Key header-only
- slice: docs/program/slices/DOC-ENT-P0-MOB-M06.md
- change_mode: UPGRADE
```

## A. Spec / docs

| Path | Delta | Neo |
| --- | --- | --- |
| API §9 · DB §5 | READ | honesty: no new table P0 |
| This slice | ADD | DOC-DELTA 2026-08-03 |

## B. Code paths (proposed)

| Layer | Path | Neo tag | must_keep | Owner |
| --- | --- | --- | --- | --- |
| BE middleware | `apps/api/hrm-api/src/common/idempotency.middleware.ts` (+ module wire Touch-only-if) | @CODE-MEMORY | TTL dedupe → `HRM-IDEMPOTENCY-409`; không chạy handler lần 2 | dev-be |
| Mobile queue | `apps/mobile/hrm-mobile/src/integrations/offlineQueue.ts` · `hooks/useOfflineWriteGuard.ts` · `components/OfflineBanner.tsx` · `OfflineSync.tsx` · `storage/asyncKeys.ts` | @CODE-MEMORY | queue → replay một side-effect | dev-mobile |
| Consumer leave POST | leave create client paths (coord DOC-ENT-P0-HRM-LEAVE) | @CODE-MEMORY | luôn gửi `Idempotency-Key` khi offline replay | dev-mobile |

### API behavior

| Rule | Detail |
| --- | --- |
| Header | `Idempotency-Key` on mobile `POST\|PUT\|PATCH` nghiệp vụ |
| Typical P0 | `POST /api/hrm/attendance/leave-requests` |
| Error | `HRM-IDEMPOTENCY-409` |
| DB | **No** new P0 table — in-memory/TTL middleware |

## C. Ops

| Path | Neo | Note |
| --- | --- | --- |
| — | — | Không persist secret keys |

## D. Forbidden

- Invent P0 DDL for idempotency keys without SA/DB delta
- Fake replay bằng DB seed
- apps/** ngoài B · rewrite NEW docs

## E. Residual

| id | Mô tả | ack |
| --- | --- | --- |
| R-M06-TTL-STORE | TTL store in-memory vs Redis — ops scale residual | OPEN (non-blocking P0 doc honesty) |

## F. Verify (W1-B)

- [ ] AC-HRM-MOB-J06: offline → sync → một dòng server
- [ ] Second replay same key → 409, no duplicate leave
- [ ] diff ⊆ slice

## Team Claude note

```text
Header-only contract — do not add Prisma/table. Coordinate with leave slice.
Draft → Cursor REVIEW. 28 DISPLAY-READY override until C-OS-29-NAME-01.
```
