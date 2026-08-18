# Evidence — PO-UC-TC-W4-QA-DEPT-VAL-RET-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-DEPT-VAL-RET-01` |
| **date** | 2026-08-04 |
| **role** | qa |
| **ack_status** | `PASS_TO_PM` |
| **u65_zero_seed** | true |
| **hdsd_align** | true |
| **prior** | `PO-UC-TC-W4-DEV-BE-DEPT-VAL-01` READY_FOR_QA · closes residual `R-W4E1-DEPT-EMPTY-201` |
| **scope** | Focused DEPT FD+HP only — **not** full E1 retest |

## Environment

| Check | Result |
|-------|--------|
| L0 xbos `:28002` | HTTP **200** |
| L0 portal `:5173` | HTTP **200** |
| Persona | `ceo@xe.vn` / `Xevn@2026` |
| Seed | **none** (U65) |
| Harness | `scripts/qa/_tmp-po-uc-tc-w4-qa-dept-val-ret.mjs` |
| Runtime JSON | `docs/qa/evidence/_tmp-po-uc-tc-w4-qa-dept-val-ret.json` |
| Screens | `docs/qa/evidence/screens/po-uc-tc-w4-qa-dept-val-ret/` |

## HDSD inventory (U76)

| # | Menu / control | Used |
|---|----------------|------|
| 1 | Login → Command Center | ✓ |
| 2 | Deep-link `?settings=tenant_departments` (Phòng/Ban pháp nhân) | ✓ |
| 3 | Nút **Thêm dòng phòng ban** | ✓ |
| 4 | Inputs `aria-label` Mã / Tên phòng ban | ✓ |
| 5 | Nút **Lưu dòng** (`title="Lưu dòng"`) | ✓ |
| 6 | F5 / navigate lại Phòng/Ban | ✓ |

## Click path

1. Clear storage → login CEO → land `/command-center` (`XBOS-AUTH-200`).
2. Open `http://127.0.0.1:5173/command-center?settings=tenant_departments`.
3. **FD:** Thêm dòng → leave mã/tên `""` → Lưu dòng.
4. **HP:** Thêm dòng → fill `QA-DEPT-W4DEPT-1HS3X` / `QA Dept W4DEPT-1HS3X` → Lưu → F5 sticky.
5. Best-effort DELETE cleanup of HP row (not scored).

## TC results

| TC-ID | Verdict | Evidence |
|-------|---------|----------|
| `TC-CC-P0-03-DEPT-TREE-HP-001` | **PASS** | UI Phòng/Ban + Thêm dòng visible |
| `TC-CC-P0-03-DEPT-ADD-FD-001` | **PASS** | Network `POST /api/xbos/org-foundation/org-units` → **400** `XBOS-VAL-014` «Mã và tên phòng ban là bắt buộc»; **no 2xx**; blank state `code="" name=""` (FE no invent `PB-*` / «Phòng ban») |
| `TC-CC-P0-03-DEPT-ADD-HP-001` | **PASS** | Network `POST` → **201** `XBOS-ORG-201` «Org unit saved»; F5 body still contains stamp code |

### Network excerpt (no secrets)

| Step | Method | Status | code |
|------|--------|-------:|------|
| Login | POST `/auth/login` | 201 | `XBOS-AUTH-200` |
| FD empty Lưu | POST `/org-foundation/org-units` | **400** | **`XBOS-VAL-014`** |
| HP valid Lưu | POST `/org-foundation/org-units` | **201** | **`XBOS-ORG-201`** |

## Residual

| id | status |
|----|--------|
| `R-W4E1-DEPT-EMPTY-201` | **CLOSED** this wave |

Out of scope (unchanged from E1 rollup): inbox spawn, canvas depth, SHR VAL spot — not retested here.

## Verdict

**PASS** — browser U65 FD+HP for UC-CC-P0-03 empty-org-unit validation.

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-QA-DEPT-VAL-RET-01
next_owner: pm
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-dept-val-ret-01.md
uat_done: false
```
