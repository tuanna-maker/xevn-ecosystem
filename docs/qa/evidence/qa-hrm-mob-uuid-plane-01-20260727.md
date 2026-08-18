# QA-HRM-MOB-UUID-PLANE-01 — Mobile attendance `company_uuid` Plane B′ (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-MOB-UUID-PLANE-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution · L1 live + source · U65 zero-seed |
| **date** | `2026-07-27` (ICT) |
| **entry** | `SA-G-INT-03-PLANE-A-BRIDGE-01` PASS_TO_PM · DATA_LINKAGE §6.2#4 |
| **read_first** | SA bridge evidence · DATA_LINKAGE §6 · ADR-PLANE-A-BRIDGE §4.3 · ADR-HRM-RBAC-SCOPE-LADDER §4 |
| **must_keep** | CO-HC / OP / MD GWC · U65 · no LE as attendance `company_uuid` |
| **ack_status** | **FAIL_TO_PM** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **deploy** | **HOLD_DEPLOY** · NOT `:8088` |
| **device / browser** | **Not available** — L1 + source honesty (U65) |

---

## 1. Scope / cấm

| In | Out |
|----|-----|
| Mobile/attendance POST body UUID vs JWT `company_uuid` · Plane B′ map | `pnpm seed:*` / attendance seed |
| LE UUID body → 409 (plane or SCOPE) — not 2xx silent | Reopen CO-HC / OP / MD GWC |
| Document issuance: B′ ∈ `HRM_COMPANY_UUID_BY_SLUG` vs hash/LE | Product patches in `apps/**` for test |
| L1 live + Jest + source | Device visual UF claim |

---

## 2. Environment (L0)

| Probe | Result |
|-------|--------|
| `GET :28001/api/hrm` | **200** |
| `GET :28002/api/xbos` | **200** (dist start:prod) |
| Seed this wave | **none** (U65) |
| Workspace | `C:\xevn-ecosystem` |
| adb / emulator | **empty / not used** |

**Plane B′ map (code):**

| slug | UUID |
|------|------|
| holding | `10000000-0000-4000-8000-000000000001` |
| trsport | `…0002` |
| logistics | `…0003` |
| finance | `…0004` |
| services | `…0005` |

**Representative Plane A LE:** `78b8a663-f5e5-4f4d-a020-b8f950ec2037` (∉ map)

**Holding SHA256 fallback** (`hrm-scope:xevn:holding`): `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` (∉ map)

---

## 3. Source / JWT contract (honesty)

| Artifact | Fact |
|----------|------|
| ADR bridge §4.3.3 | OP/MD/**mobile** UUID columns = Plane **B′** only; LE → `HRM-PLANE-409` |
| ADR ladder §4 | Mobile `company_uuid` = attendance row key; body must match JWT claim |
| `createRecord` | `resolveScopeContext` then `resolveHrmOperationsPersistCompanyId` → **`assertHrmMappedCompanyUuidOrThrow`** on UUID body |
| `mobile-auth.service.ts` `resolveCompanyUuid` | Prefer `custom_fields.attendance_company_uuid`; else **SHA256** `hrm-scope:{tenant}:{company_id}` — **does not** resolve `HRM_COMPANY_UUID_BY_SLUG` |
| Mobile FE `p1-phase1-mob-p5-jwt.test.ts` | Treats holding wire UUID as **hash** `6efaa5d6-…` (not B′ `…0001`) |
| Mobile FE `resolveWireCompanyId` | Echoes store/JWT `company_uuid` as body/`x-company-id` |

---

## 4. Exit criteria matrix

### EC-1 — Body UUID = JWT claim B′ map (∈ `HRM_COMPANY_UUID_BY_SLUG`)

| Case | Auth | Body `company_id` | HTTP | `code` | Verdict |
|------|------|-------------------|------|--------|---------|
| Minted JWT `companyId=holding` + `company_uuid=B′` | internal HS256 | B′ holding | **201** | `HRM-ATT-201` · persist `…0001` | **PASS** (control — when claim is B′) |
| **Live** `POST /auth/mobile/login` `uat.nv0001@xe.vn` | real mobile | issued UUID | — | claim = **hash** `6efaa5d6-…` **∉ map** | **FAIL** issuance |
| Live token + body = issued hash | mobile Bearer | hash | **409** | **`HRM-PLANE-409`** | **FAIL** happy path broken |
| Live token + body = B′ map | mobile Bearer | `…0001` | **409** | `SCOPE_CONTEXT_MISMATCH` | expected (claim≠map) — proves cannot “just send B′” without JWT fix |
| Live `uat.nv1000@xe.vn` | mobile login | — | 201 login | `company_uuid` = services hash `7af56bab-…` ∉ map | **FAIL** same class |

**EC-1 overall: FAIL** — real mobile JWT does **not** carry B′ map UUID; check-in POST with issued claim → plane 409.

### EC-2 — Body = Plane A LE → 409 (not 2xx silent)

| Case | Auth | Body | HTTP | `code` | Verdict |
|------|------|------|------|--------|---------|
| JWT B′ claim + LE body | minted holding+B′ | LE | **409** | `SCOPE_CONTEXT_MISMATCH` (+ `tokenCompanyUuid` B′) | **PASS** fail-closed |
| JWT `company_uuid=LE` + LE body | minted holding+LE claim | LE | **409** | **`HRM-PLANE-409`** | **PASS** plane guard |
| JWT B′ + LE list query | minted | GET `company_id=LE` | **409** | `SCOPE_CONTEXT_MISMATCH` | **PASS** |
| Portal `main` / no uuid claim + LE body | group_ceo | LE | **409** | `SCOPE_CONTEXT_MISMATCH` | **PASS** |

**EC-2 overall: PASS**

### EC-3 — Evidence + honesty

| Item | Result |
|------|--------|
| Evidence path this file | **PASS** |
| Device/browser UF | **not claimed** (adb empty) — L1+source per exit #4 |
| U65 zero-seed | **PASS** — login/POST only; no seed scripts |
| CO-HC / OP / MD | **not reopened** |

---

## 5. Jest (supporting — not greenwash)

```text
cd apps/api/hrm-api
pnpm exec jest --testPathPatterns=scope-context.spec \
  --testPathPatterns=hrm-list-scope.spec \
  --testPathPatterns=mobile-auth.service.spec --no-coverage
→ Test Suites: 4 passed · Tests: 62 passed · EXIT 0
```

Note: suites prove scope match + map helpers; they **do not** assert mobile login UUID ∈ `HRM_COMPANY_UUID_BY_SLUG`. `mobile-auth.service.spec` still uses non-map `attendance_company_uuid` examples.

---

## 6. DATA_LINKAGE §6.4 add-on

| Check | Result |
|-------|--------|
| Identify key plane | Attendance persist UUID = **B′** required by `resolveHrmOperationsPersistCompanyId` |
| Network never LE silent 2xx | LE → **409** SCOPE or `HRM-PLANE-409` |
| B′ paths UUID ∈ map only | Persist enforces map — **but mobile JWT not B′** |
| Mobile: `company_uuid` claim present when body UUID | Claim present — value is **hash**, not map |
| No reopen CO-HC GWC | **Confirmed** |

---

## 7. Defect / residual

| ID | Sev | Finding | Owner |
|----|-----|---------|-------|
| **D-MOB-UUID-BPRIME-01** | **P0** | Live mobile JWT `company_uuid` = SHA256 slug hash (or custom field), **not** `HRM_COMPANY_UUID_BY_SLUG`. After OP/ATT persist plane guard, `POST /attendance/records` with real mobile token → **409 `HRM-PLANE-409`**. Minted B′ JWT works (control). | **dev-be** (`mobile-auth.service.ts` `resolveCompanyUuid` → map by slug; reject LE in `attendance_company_uuid`) + **dev-mobile** FE tests/wire expecting hash (`p1-phase1-mob-p5-jwt.test.ts`) |
| Info | Info | Historical `attendance_records.company_id` rows include hash UUID (list under B′ JWT still returns workforce via slug normalize) — may need backfill/read-compat when JWT moves to B′ | dev-be on fix wave |
| Device UF | Info | No adb session this WI | qa-device later if PM opens |

**Root cause class:** Plane B′ guard on attendance persist landed (correct per ADR §4.3) **before** mobile JWT issuance was locked to the same map → happy path fail-closed.

---

## completion_report

**Closed (verified):** LE body on attendance POST/list → **409** `SCOPE_CONTEXT_MISMATCH` or **`HRM-PLANE-409`** — not 2xx silent (EC-2 PASS). Control minted JWT with B′ map → **201** persist `…0001`. Jest scope/list/mobile-auth **62/62**. U65. CO-HC/OP/MD not reopened. Device not claimed.

**Open (FAIL):** EC-1 — live mobile login (`uat.nv0001@xe.vn` / `uat.nv1000@xe.vn`) issues hash `company_uuid` ∉ map; live token POST attendance → **409 `HRM-PLANE-409`**. Source: `resolveCompanyUuid` hash/custom, not `HRM_COMPANY_UUID_BY_SLUG`.

### next_owner

`dev-be` (primary) · follow-up `dev-mobile` after BE claim map

### next_dispatch_prompt

```text
work_item_id: D-HRM-MOB-UUID-BPRIME-01
role: dev-be
lane: execution · U65 zero-seed
change_mode: FIX
entry_criteria: QA-HRM-MOB-UUID-PLANE-01 FAIL_TO_PM — docs/qa/evidence/qa-hrm-mob-uuid-plane-01-20260727.md
read_first:
  - docs/qa/evidence/qa-hrm-mob-uuid-plane-01-20260727.md
  - docs/architecture/ADR-HRM-XBOS-PLANE-A-BRIDGE-4LE-5SLUG-20260727.md §4.3
  - docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md §6.1–6.2#4
  - apps/api/hrm-api/src/auth/mobile-auth.service.ts resolveCompanyUuid
  - apps/api/hrm-api/src/common/hrm-list-scope.ts HRM_COMPANY_UUID_BY_SLUG
must_keep: CO-HC / OP / MD GWC; LE body still 409; U65 no seed
forbidden_paths: reopen CO-HC; weaken assertHrmMappedCompanyUuidOrThrow for LE
exit_criteria:
  1) resolveCompanyUuid for operating slugs returns HRM_COMPANY_UUID_BY_SLUG[slug] (main→holding map)
  2) attendance_company_uuid custom: accept only map UUID; LE/unknown → map-by-slug or reject at login/select-membership
  3) Live uat.nv0001 login company_uuid = …0001; POST /attendance/records with that claim → 2xx (or documented non-duplicate path); LE body still 409
  4) Jest: mobile-auth + attendance createRecord map claim; evidence be-hrm-mob-uuid-bprime-01-YYYYMMDD.md → READY_FOR_QA
  5) Handoff note for dev-mobile: update p1-phase1-mob-p5-jwt / wire tests from hash to B′ map
parallel_ok: after BE READY_FOR_QA → Task qa QA-HRM-MOB-UUID-PLANE-01 retest; optional Task dev-mobile FE test align
```

### evidence_path

`docs/qa/evidence/qa-hrm-mob-uuid-plane-01-20260727.md`

### ack_status

**FAIL_TO_PM**
