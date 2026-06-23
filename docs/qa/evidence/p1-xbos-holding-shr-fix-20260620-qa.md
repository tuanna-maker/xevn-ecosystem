# P1-XBOS-HOLDING-SHR-01-QA — UF-XBOS-05 retest

**work_item_id:** P1-XBOS-HOLDING-SHR-01-QA  
**role:** qa  
**date:** 2026-06-20  
**matrix:** UF-XBOS-05  
**dev_handoff:** `docs/qa/evidence/p1-xbos-holding-shr-fix-20260620.md`

## Environment

| Item | Value |
|------|-------|
| Portal | `http://127.0.0.1:5173` |
| Account | `ceo@xe.vn` / `Xevn@2026` |
| L0 | `pnpm run qc:dev-stack` → **exit 0** (hrm-api 28001, xbos-api 28002, portal 5173) |
| Path | Command Center → Cài đặt → Đơn vị thành viên → **TẬP ĐOÀN** (holding root) → Danh sách Cổ đông |

## Results summary

| Step | Expected | Actual | Verdict |
|------|----------|--------|---------|
| L0 stack | exit 0 | exit 0 | **PASS** |
| Login + navigate TẬP ĐOÀN | Form opens, shareholders hydrate | `Đơn vị thành viên - TẬP ĐOÀN`; 5+ rows loaded from GET | **PASS** |
| Green check POST | POST shareholders **2xx** | Toast «Đã lưu cổ đông lên hệ thống.»; API GET confirms row | **PASS** |
| F5 persist | Row survives reload | After full navigation reload, `QA-UF05-F5-20260620` visible in table | **PASS** |
| Amber banner (no silent fail) | Banner when entity UUID unresolved | Persisted holding: **no** amber (entity resolved). Unit test + error toast on bad POST (see §4) | **PASS** |
| `legalEntityProfileScope` regression | vitest 7/7 | 7/7 PASS | **PASS** |

**UF-XBOS-05 Local column:** 🟢

## 1. L0 — `qc:dev-stack`

```text
✓ hrm-api: HTTP 200 ← http://127.0.0.1:28001/api/hrm
✓ xbos-api: HTTP 200 ← http://127.0.0.1:28002/api/xbos
✓ web-portal: HTTP 200 ← http://127.0.0.1:5173
exit 0
```

## 2. Browser — add shareholder (green check)

**Click path:** CC → CÀI ĐẶT HỆ THỐNG → Đơn vị thành viên → list row `TẬP ĐOÀN / Tập đoàn XeVN` → Chỉnh sửa → + Thêm cổ đông → fill row → ✓ Submit.

| Field | Value |
|-------|-------|
| holderName | `QA-UF05-F5-20260620` |
| identityCode | `079893000001` |
| ratioPercent | `2.5` |

**UI feedback:** «Đã lưu cổ đông lên hệ thống.»

## 3. Network / API trace

**Resolved legal entity UUID (holding):** `bad45b73-55b3-4898-baae-d55c5ac2cc2a`  
(UI id `xbos-group-holding-root` → API id via `resolveLegalProfileScopeFromState` / `fetchHoldingLegalEntities`)

| Request | Method | Status | Notes |
|---------|--------|--------|-------|
| `/api/xbos/org-foundation/legal-entities/bad45b73-55b3-4898-baae-d55c5ac2cc2a/shareholders` | POST | **201** | `XBOS-SHR-201`; created id `c04d9be9-6c10-43a7-b19c-b2f505a59a46` |
| Same path | GET | **200** | `holder_name: QA-UF05-F5-20260620` present after POST |
| POST (empty row, accidental submit) | POST | **400** | UI: `legal-entity.shareholders.create failed: holderName is required (HTTP 400)` — **not silent** |

## 4. Amber banner / no silent fail

| Scenario | Observation |
|----------|-------------|
| Holding **with** persisted UUID (this env) | No amber banner in shareholder section — `resolveLegalProfileScope().entityId` resolved |
| Holding **without** UUID (spec) | `legalProfileScopePersistMessage(GROUP_HOLDING_ROOT_ID)` → «Chưa có hồ sơ tập đoàn trên XBOS — nhấn «Lưu thay đổi»…» — **vitest PASS** (`legalEntityProfileScope.test.ts`) |
| API validation failure | Visible publish message with HTTP status (400 holderName) |

## 5. F5 persistence

After `browser_navigate` reload of `?settings=company_member_units` and re-open **TẬP ĐOÀN** form:

- Shareholder row `QA-UF05-F5-20260620` / `079893000001` / `2.5%` still rendered (hydrated from GET).

## 6. Automated regression

```bash
pnpm exec vitest run src/integrations/legalEntityProfileScope.test.ts
# 7/7 PASS
```

## Residual / not promoted

| Item | Owner | Notes |
|------|-------|-------|
| `:8088` pilot retest | qa | Local `:5173` PASS; nip.io wave separate |
| Duplicate `TẬP ĐOÀN` probe rows in seed | devops/data | List has probe legal entities; does not block UF-XBOS-05 |
| `Lưu thay đổi` batch sync path | — | Not re-tested this wave; per-row green check path **PASS** |

## ack_status

**PASS_TO_PM**
