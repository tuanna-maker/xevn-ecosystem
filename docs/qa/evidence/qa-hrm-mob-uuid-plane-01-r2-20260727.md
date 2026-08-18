# QA-HRM-MOB-UUID-PLANE-01-R2 — Mobile JWT Plane B′ retest (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-MOB-UUID-PLANE-01-R2` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution · L1 live · U65 zero-seed |
| **date** | `2026-07-27` (ICT) |
| **entry** | `D-HRM-MOB-UUID-BPRIME-01` READY_FOR_QA — `docs/qa/evidence/be-hrm-mob-uuid-bprime-01-20260727.md` |
| **prior** | `QA-HRM-MOB-UUID-PLANE-01` **FAIL_TO_PM** — hash JWT → `HRM-PLANE-409` |
| **read_first** | BE evidence · prior FAIL · ADR-PLANE-A-BRIDGE §4.3 |
| **must_keep** | CO-HC / OP / MD GWC · LE body 409 · U65 no seed |
| **ack_status** | **PASS_TO_PM** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **deploy** | **HOLD_DEPLOY** · NOT `:8088` |
| **device / browser** | **Not used** — L1 API only (adb empty; no UF claim) |

---

## 1. Scope / cấm

| In | Out |
|----|-----|
| Live mobile login `company_uuid` ∈ `HRM_COMPANY_UUID_BY_SLUG` | `pnpm seed:*` |
| `POST /attendance/records` body = issued claim → **not** `HRM-PLANE-409` | Device visual UF / adb |
| LE UUID body → **409** (not 2xx) | Reopen CO-HC / OP / MD GWC |
| Optional services map for `uat.nv1000` | Product patches in `apps/**` |

---

## 2. Environment (L0)

| Probe | Result |
|-------|--------|
| `GET :28001/api/hrm` | **200** `HRM-HEALTH-200` |
| Workspace | `C:\xevn-ecosystem` |
| Seed this wave | **none** (U65) |
| adb / emulator | **not used** |

**Plane B′ map:**

| slug | UUID |
|------|------|
| holding | `10000000-0000-4000-8000-000000000001` |
| services | `…0005` |

**Plane A LE (reject):** `78b8a663-f5e5-4f4d-a020-b8f950ec2037`  
**Legacy hash (reject vs new claim):** `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013`

---

## 3. Exit criteria matrix

### EC-1 — Live login `uat.nv0001` → `company_uuid` = holding B′

| Step | Result | Verdict |
|------|--------|---------|
| `POST /auth/mobile/login` `uat.nv0001@xe.vn` / `xevn-uat-2026` | **201** `HRM-AUTH-200` · `default_company_id=holding` · **`company_uuid=10000000-0000-4000-8000-000000000001`** · memberships[0] same · JWT claim `company_uuid=…0001` | **PASS** |

Prior FAIL class (hash `6efaa5d6-…`) **cleared**.

### EC-2 — POST attendance body = issued claim → 2xx `HRM-ATT-201`

| Case | Body `company_id` | HTTP | `code` | Persist | Verdict |
|------|-------------------|------|--------|---------|---------|
| Claim B′ · date `2026-07-28` (unique) | `…0001` | **201** | **`HRM-ATT-201`** | `company_id=…0001` · id `90ddfeee-…` | **PASS** |
| Claim B′ · date today (already punched by BE L1) | `…0001` | **400** | `HRM-ATT-001` duplicate unique | — | Honesty: **not** `HRM-PLANE-409` (plane gate passed; constraint only) |

### EC-3 — LE UUID body → 409 (not 2xx)

| Case | Body | HTTP | `code` | Verdict |
|------|------|------|--------|---------|
| LE `78b8a663-…` + Bearer B′ claim | LE | **409** | **`SCOPE_CONTEXT_MISMATCH`** · `tokenCompanyUuid=…0001` | **PASS** |
| Legacy hash `6efaa5d6-…` ≠ claim | hash | **409** | `SCOPE_CONTEXT_MISMATCH` | **PASS** (fail-closed; not silent 2xx) |

### EC-4 — Optional `uat.nv1000` → services B′

| Step | Result | Verdict |
|------|--------|---------|
| `POST /auth/mobile/login` `uat.nv1000@xe.vn` | **201** `HRM-AUTH-200` · `default_company_id=services` · **`company_uuid=10000000-0000-4000-8000-000000000005`** | **PASS** |

### EC-5 — Evidence + honesty

| Item | Result |
|------|--------|
| This evidence path | **PASS** |
| U65 zero-seed | **PASS** — login/POST only |
| Device UF | **not claimed** |
| CO-HC / OP / MD | **not reopened** |

---

## 4. Jest (supporting)

```text
cd apps/api/hrm-api
pnpm exec jest --testPathPatterns=mobile-auth.service.spec \
  --testPathPatterns=scope-context.spec \
  --testPathPatterns=hrm-list-scope.spec --no-coverage
→ Test Suites: 4 passed · Tests: 67 passed · EXIT 0
```

---

## 5. ADR §4.3 check

| Invariant | Result |
|-----------|--------|
| §4.3.3 OP/MD/**mobile** UUID = Plane B′ only | Login issues B′ map; ATT persist `…0001` |
| LE → fail-closed (409) | **PASS** `SCOPE_CONTEXT_MISMATCH` (not 2xx) |
| Prior hash issuance closed | **PASS** live claim ≠ SHA256 |

---

## 6. Residual

| ID | Sev | Note | Owner |
|----|-----|------|-------|
| FE test hash fixtures | **P2** | `p1-phase1-mob-p5-jwt.test.ts` (and wire expecting SHA256 `hrm-scope:…`) still expect holding hash `6efaa5d6-…` — align to `HRM_COMPANY_UUID_BY_SLUG` | **dev-mobile** |
| Historical ATT rows with hash UUID | Info | List under B′ may rely on slug normalize — backfill optional | defer |
| Device UF check-in visual | Info | No adb this WI | qa-device if PM opens |
| Same-day duplicate `HRM-ATT-001` | Info | Expected uniqueness; not a plane defect | — |

**not promoted:** device L2.5 / browser UF · deploy `:8088` · Phase1 DONE

---

## completion_report

**Closed:** Retest after `D-HRM-MOB-UUID-BPRIME-01` — live `uat.nv0001` JWT **`company_uuid=…0001`**; `POST /attendance/records` with claim → **201 `HRM-ATT-201`** persist B′ (prior `HRM-PLANE-409` **cleared**); LE body → **409** `SCOPE_CONTEXT_MISMATCH`; optional `uat.nv1000` → **`…0005`**; Jest **67/67**; U65; must_keep intact.

**Open:** P2 FE hash fixtures → **dev-mobile**; device UF not in scope.

### next_owner

`pm` → dispatch **`qc`** gate this WI **and/or** **`dev-mobile`** hash→B′ fixture align

### next_dispatch_prompt

```text
work_item_id: QC-HRM-MOB-UUID-PLANE-01
role: qc
lane: governance · HOLD_DEPLOY
entry_criteria: QA-HRM-MOB-UUID-PLANE-01-R2 PASS_TO_PM — docs/qa/evidence/qa-hrm-mob-uuid-plane-01-r2-20260727.md
read_first:
  - docs/qa/evidence/qa-hrm-mob-uuid-plane-01-r2-20260727.md
  - docs/qa/evidence/be-hrm-mob-uuid-bprime-01-20260727.md
  - docs/qa/evidence/qa-hrm-mob-uuid-plane-01-20260727.md (prior FAIL closed)
  - docs/architecture/ADR-HRM-XBOS-PLANE-A-BRIDGE-4LE-5SLUG-20260727.md §4.3
must_keep: CO-HC / OP / MD GWC; LE body 409; U65; HOLD_DEPLOY
exit_criteria:
  1) Audit L1: login B′ …0001; ATT claim 201; LE 409 — GO or GWC
  2) Residual P2 FE fixtures → condition or parallel D-MOB-UUID-BPRIME-FE-01
  3) Evidence qc-hrm-mob-uuid-plane-01-YYYYMMDD.md → PASS_TO_PM
cấm: seed · claim device UF · reopen CO-HC · promote :8088 without sponsor

--- parallel (after QC intake or same wave if PM prefers) ---
work_item_id: D-MOB-UUID-BPRIME-FE-01
role: dev-mobile
lane: execution · U65
change_mode: FIX · preserve_default
entry_criteria: QA-HRM-MOB-UUID-PLANE-01-R2 PASS — BE issues Plane B′ in JWT
read_first:
  - docs/qa/evidence/be-hrm-mob-uuid-bprime-01-20260727.md §6
  - docs/qa/evidence/qa-hrm-mob-uuid-plane-01-r2-20260727.md
  - apps mobile p1-phase1-mob-p5-jwt.test.ts (hash fixtures)
must_keep: echo JWT company_uuid as body; LE still reject; no seed
exit_criteria:
  1) Replace expected holding hash 6efaa5d6-… with 10000000-…0001 (and services …0005)
  2) Vitest green; evidence be-mob-uuid-bprime-fe-01-YYYYMMDD.md → READY_FOR_QA
```

### evidence_path

`docs/qa/evidence/qa-hrm-mob-uuid-plane-01-r2-20260727.md`

### ack_status

**PASS_TO_PM**
