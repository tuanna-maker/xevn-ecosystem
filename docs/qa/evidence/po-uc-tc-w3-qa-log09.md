# Evidence — PO-UC-TC-W3-QA-LOG09

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W3-QA-LOG09` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **date** | 2026-08-04 |
| **ack_status** | **PASS_TO_PM** |
| **u65_zero_seed** | true (no `pnpm seed:*`, no DB clear for empty dest) |
| **uat_done** | **false** — design≠UAT; API spot only; FE wizard not wired |
| **Leave L2** | **not touched** |

---

## 1. Scope & honesty

| Layer | Verdict | Note |
|-------|---------|------|
| L0 stack | **PASS** (API) | `xbos-api :28002` **200** · `hrm-api :28001` **200**; portal `:5173` not required for API-only |
| API LOG-09 | **PASS** | HP/FD/AU below |
| FE wizard / F5 UI | **PARTIAL / GAP** | Grep `apps/web` — no `clone-bundle` / «Sao chép bộ» wire |
| UAT / Phase1 DONE | **not claimed** | |

**Precond honesty:** Dest `logistics` already had `log_dm_*` keys → empty-dest HP-001 with `onConflict=fail` correctly returned **XBOS-CFG-009**. Success path proven with contract-allowed `onConflict=overwrite` → **XBOS-CFG-205** (no seed).

---

## 2. Environment

| Item | Value |
|------|--------|
| Persona | `ceo@xe.vn` / `Xevn@2026` → `group_ceo` · `tenant=xevn` · `company=main` |
| Member AU | `du-lich.ceo@xe.vn` → `subsidiary_ceo` · `tenant=xe-du-lich` |
| Endpoint | `POST http://127.0.0.1:28002/api/xbos/config-sync/catalogs/clone-bundle` |
| Spec | by-uc `XBOS-DM-LOG-09` · BE evidence `po-uc-tc-w3-be-log09.md` · TECHSPEC_M03 §2 |

---

## 3. Test log (API)

### L0

| Check | Result |
|-------|--------|
| `GET :28002/api/xbos` | **200** `XBOS-HEALTH-200` |
| `GET :28001/api/hrm` | **200** |
| Login CEO | **201/200** `XBOS-AUTH-200` · token issued |

### TC-DM-LOG-09-COPY-BUNDLE-HP-001 (success path)

| Step | Result |
|------|--------|
| Body | `sourceCompanyId=main` (resolves **holding**), `destCompanyId=logistics`, `domains=['logistics']`, `onConflict=overwrite` |
| HTTP / code | **2xx** · **`XBOS-CFG-205`** |
| Payload | `matchedCount=92` · `copiedCount=92` · `skippedCount=0` |
| Source scope | `{ tenantId: xevn, companyId: holding }` |
| Dest scope | `{ tenantId: xevn, companyId: logistics }` |
| Sample copied | `log_dm_1` v2 domain=`logistics`; `log_dm_10` v2; `log_dm_11` v2 |
| Dest has keys | `GET …/catalog/log_dm_1?companyId=logistics` (internal key) → **ver=2** checksum `sha256:8c97c9c3…` |
| Source unchanged | Clone publishes **dest only**; GET holding `log_dm_1` still **XBOS-CFG-004** checksum mismatch **before and after** (pre-existing data integrity; not introduced by clone) |
| Empty-dest + fail | Env not empty → `onConflict=fail` → **409 XBOS-CFG-009** (correct guard; not HP empty-dest) |

### TC-DM-LOG-09-COPY-BUNDLE-FD-002 (conflict · no half-copy)

| Step | Result |
|------|--------|
| `onConflict=fail` holding→logistics | **409** · **`XBOS-CFG-009`** |
| Details | `conflictKeys` lists `log_dm_1`…`log_dm_91` (~91 keys); hint skip\|overwrite |
| Half-copy | **None** — exception before publish loop when fail+conflicts |

### TC-DM-LOG-09-COPY-BUNDLE-FD-006 (contract)

| Case | Result |
|------|--------|
| `domains=[]` | **400** · `XBOS-VAL-001` (min 1 element) |
| source==dest `holding`→`holding` | **400** · **`XBOS-VAL-013`** |

### TC-DM-LOG-09-COPY-BUNDLE-AU-004 / AU-008

| Case | Result |
|------|--------|
| Member JWT `du-lich.ceo` | **403** · **`XBOS-AUTH-003`** (group catalog admin required) |
| Anonymous (no Authorization) | **401** · **`XBOS-AUTH-001`** |

### Not executed / residual

| Item | Status |
|------|--------|
| UX-005 async progress UI | **N/A FE** |
| BD-003 large-bundle UX/timeout | Sync OK for 92 keys (~50s overwrite); no UI progress |
| FE HDSD / wizard F5 | **GAP** → `dev-fe` |
| GET list/get holding logistics catalogs | Pre-existing **XBOS-CFG-004** checksum mismatch on `log_dm_1` — residual P2 data integrity (not LOG-09 clone logic) |
| Leave L2 | untouched |

---

## 4. by-uc update

- `docs/qa/professional/by-uc/XBOS-DM-LOG-09.md` → execution note QA API PASS · FE PARTIAL · `uat_done: false`

---

## 5. Verdict matrix

| TC-ID | Layer | Verdict |
|-------|-------|---------|
| HP-001 | API | **PASS** (overwrite success CFG-205; empty-dest fail-path env-blocked → CFG-009) |
| FD-002 | API | **PASS** |
| FD-006 | API | **PASS** |
| AU-004 | API | **PASS** |
| AU-008 | API | **PASS** |
| UX-005 | UI | **GAP** |
| FE mutate+F5 | UI | **PARTIAL** — not fake PASS |

**Overall:** **PASS_TO_PM** — API contract LOG-09 **PASS**; FE **PARTIAL**; **not** UAT 🟢.

---

## 6. completion_report

**Closed:** L0 API health; CEO login; clone-bundle HP (CFG-205 overwrite, 92 logistics keys holding→logistics); FD conflict CFG-009; FD VAL-001/013; AU AUTH-001/003; by-uc note; evidence this file. Zero seed.

**Open:** FE wizard wire + HDSD (U76); async UX-005; optional CFG-004 checksum repair on holding catalogs (separate).

---

## 7. Handoff

| Field | Value |
|-------|--------|
| next_owner | **pm** |
| ack_status | **PASS_TO_PM** |
| evidence_path | `docs/qa/evidence/po-uc-tc-w3-qa-log09.md` |
