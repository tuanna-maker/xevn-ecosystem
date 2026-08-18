# D-HRM-MOB-UUID-BPRIME-01 — Mobile JWT `company_uuid` → Plane B′ map (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-MOB-UUID-BPRIME-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution · U65 zero-seed |
| **change_mode** | FIX · preserve_default |
| **date** | `2026-07-27` (ICT) |
| **entry** | `QA-HRM-MOB-UUID-PLANE-01` FAIL_TO_PM |
| **ack_status** | **READY_FOR_QA** |
| **deploy** | **HOLD_DEPLOY** · NOT `:8088` |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |

---

## 1. Root cause (closed)

`MobileAuthService.resolveCompanyUuid` preferred any UUID-shaped `attendance_company_uuid`, else SHA256 `hrm-scope:{tenant}:{company_id}` — values **∉** `HRM_COMPANY_UUID_BY_SLUG`. After OP/ATT persist `assertHrmMappedCompanyUuidOrThrow`, live mobile POST attendance with issued claim → **409 `HRM-PLANE-409`**.

---

## 2. Fix (preserve)

| Behavior | After |
|----------|--------|
| Operating slug (`holding`…`services`) | `HRM_COMPANY_UUID_BY_SLUG[slug]` |
| `main` | → `holding` B′ `…0001` |
| `attendance_company_uuid` custom | Accept **only** if `isHrmMappedCompanyUuid`; LE/hash → map-by-slug |
| Unknown company_id | `HRM-AUTH-409` (fail-closed) |
| Refresh | Re-resolve B′ from employee row (upgrades legacy hash claims) |

**must_keep verified:** `assertHrmMappedCompanyUuidOrThrow` unchanged; LE body still 409; CO-HC/OP/MD not reopened; U65 (login/POST only, no seed).

**Files:**

- `apps/api/hrm-api/src/auth/mobile-auth.service.ts` (+ CODE-MEMORY APPEND)
- `apps/api/hrm-api/src/auth/mobile-auth.service.spec.ts`

---

## 3. Exit criteria

| # | Criteria | Result |
|---|----------|--------|
| 1 | `resolveCompanyUuid` operating slugs → map (`main`→holding) | **PASS** (Jest) |
| 2 | Custom map-only; LE/unknown → map-by-slug or reject | **PASS** (Jest) |
| 3 | Live `uat.nv0001` login `company_uuid=…0001`; POST claim → 2xx; LE → 409 | **PASS** (L1) |
| 4 | Jest + this evidence → READY_FOR_QA | **PASS** |
| 5 | Mobile FE note: hash → B′ | See §6 |

---

## 4. Live L1 (U65 — no seed)

| Step | Result |
|------|--------|
| `GET :28001/api/hrm` | **200** |
| `POST /auth/mobile/login` `uat.nv0001@xe.vn` / `xevn-uat-2026` | **200** `HRM-AUTH-200` · `company_id=holding` · **`company_uuid=10000000-0000-4000-8000-000000000001`** |
| `POST /attendance/records` body=`company_id`=claim B′ | **201** `HRM-ATT-201` · persist `…0001` |
| `POST /attendance/records` body=LE `78b8a663-…` | **409** `SCOPE_CONTEXT_MISMATCH` (`tokenCompanyUuid` B′) |

---

## 5. Jest

```text
cd apps/api/hrm-api
pnpm exec jest --testPathPatterns=mobile-auth.service.spec \
  --testPathPatterns=scope-context.spec \
  --testPathPatterns=hrm-list-scope.spec --no-coverage
→ Test Suites: 4 passed · Tests: 67 passed · EXIT 0
```

New / updated cases: holding/main/services map; custom B′ accept; LE custom → holding map; unknown → `HRM-AUTH-409`; refresh upgrades hash → trsport B′.

---

## 6. Handoff note — **dev-mobile** (after QA green)

Client stores / echoes JWT `company_uuid` as attendance body and `x-company-id`.

| Was (hash / test fixture) | Now (Plane B′) |
|---------------------------|----------------|
| holding `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` | `10000000-0000-4000-8000-000000000001` |
| services `7af56bab-…` (hash) | `…0005` |
| trsport hash | `…0002` |

Update: `p1-phase1-mob-p5-jwt.test.ts` and any wire expecting SHA256 `hrm-scope:…` — expect `HRM_COMPANY_UUID_BY_SLUG` values. Runtime FE that only echoes JWT claim needs **no** body rewrite if it re-logins after this BE deploy.

---

## 7. Residual

| ID | Sev | Note | Owner |
|----|-----|------|-------|
| Historical `attendance_records.company_id` hash rows | Info | List under B′ JWT may still rely on slug normalize / workforce scope — backfill optional later | defer |
| Device UF | Info | Not in this WI | qa-device if PM opens |
| FE test hash fixtures | P2 | Align after QA R2 | **dev-mobile** |

---

## completion_report

**Closed:** Mobile JWT issuance locked to Plane B′ map; live `uat.nv0001` claim `…0001`; attendance POST with claim **201**; LE body **409**; Jest 67/67; CODE-MEMORY APPEND; U65; must_keep OP plane guard intact.

**Open for QA:** Retest `QA-HRM-MOB-UUID-PLANE-01-R2` EC-1 live happy path.

### next_owner

`qa`

### next_dispatch_prompt

```text
work_item_id: QA-HRM-MOB-UUID-PLANE-01-R2
role: qa
lane: execution · L1 live + source · U65 zero-seed
entry_criteria: D-HRM-MOB-UUID-BPRIME-01 READY_FOR_QA — docs/qa/evidence/be-hrm-mob-uuid-bprime-01-20260727.md
read_first:
  - docs/qa/evidence/be-hrm-mob-uuid-bprime-01-20260727.md
  - docs/qa/evidence/qa-hrm-mob-uuid-plane-01-20260727.md (prior FAIL)
  - docs/architecture/ADR-HRM-XBOS-PLANE-A-BRIDGE-4LE-5SLUG-20260727.md §4.3
must_keep: CO-HC / OP / MD GWC; LE body 409; U65 no seed
exit_criteria:
  1) Live POST /auth/mobile/login uat.nv0001 → company_uuid = 10000000-0000-4000-8000-000000000001 (∈ HRM_COMPANY_UUID_BY_SLUG)
  2) POST /attendance/records with body company_id = issued claim → 2xx HRM-ATT-201 (not HRM-PLANE-409)
  3) LE UUID body → 409 (SCOPE_CONTEXT_MISMATCH or HRM-PLANE-409) — not 2xx
  4) Optional: uat.nv1000 company_uuid = services …0005
  5) Evidence qa-hrm-mob-uuid-plane-01-r2-YYYYMMDD.md → PASS_TO_PM or FAIL_TO_PM
  6) If PASS: note PM may dispatch dev-mobile to align p1-phase1-mob-p5-jwt hash fixtures → B′ map
cấm: pnpm seed:* · claim device UF without adb · reopen CO-HC
```

### evidence_path

`docs/qa/evidence/be-hrm-mob-uuid-bprime-01-20260727.md`

### ack_status

**READY_FOR_QA**
