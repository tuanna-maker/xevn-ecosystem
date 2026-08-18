# QC Gate — QC-HRM-MOB-UUID-PLANE-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-MOB-UUID-PLANE-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance · HOLD_DEPLOY · U65 |
| **date** | `2026-07-27` (ICT) |
| **decision** | **GO WITH CONDITIONS** — prior FAIL hash JWT → `HRM-PLANE-409` **CLOSED**; L1 B′ login + ATT claim **201** + LE **409** verified; P2 FE hash fixtures = condition |
| **scope_claim** | Mobile JWT Plane B′ L1 API only — **not** device UF · **not** Phase1/PROD/:8088 |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY · NOT `:8088` |
| **deploy** | **HOLD_DEPLOY** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — login/POST only · no seed · no invent device UF |

---

## Scope (bounded — L1 Plane B′ issuance)

| In scope | Explicitly out (cấm) |
|----------|----------------------|
| Audit QA R2 + BE B′ fix: live login `company_uuid` ∈ `HRM_COMPANY_UUID_BY_SLUG` | Phase 1 DONE / PROD / `:8088` |
| `POST /attendance/records` body = issued claim → **201** `HRM-ATT-201` (not `HRM-PLANE-409`) | Seed · invent attendance rows for UF |
| LE / legacy hash body → **409** fail-closed | Reopen CO-HC / OP / MD GWC without FAIL |
| P2 FE hash fixtures as **condition** (optional `D-MOB-UUID-BPRIME-FE-01`) | Claim device J-MOB-02 visual PASS from this packet |

**must_keep:** CO-HC / OP / MD GWC · LE body 409 · U65 · HOLD_DEPLOY

**QA entry:** `docs/qa/evidence/qa-hrm-mob-uuid-plane-01-r2-20260727.md`  
**BE entry:** `docs/qa/evidence/be-hrm-mob-uuid-bprime-01-20260727.md`  
**Prior FAIL (closed):** `docs/qa/evidence/qa-hrm-mob-uuid-plane-01-20260727.md`

---

## Micro-checklist (exit_criteria)

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Audit L1 B′ login + ATT 201 + LE 409 → GO/GWC | **PASS** — QA R2 + QC independent spot → **GWC** |
| 2 | Residual P2 FE hash fixtures as condition OK | **PASS** — condition · optional `D-MOB-UUID-BPRIME-FE-01` |
| 3 | Evidence this path → PASS_TO_PM | **PASS** |
| 4 | NOT Phase1/PROD · HOLD_DEPLOY | **PASS** |

---

## Evidence chain audited

| Artifact | Gap / role | Verdict | Closed |
|----------|------------|---------|--------|
| `qa-hrm-mob-uuid-plane-01-20260727.md` | Prior FAIL — live JWT hash `6efaa5d6-…` → ATT `HRM-PLANE-409` | **FAIL_TO_PM** (superseded) | Issuance defect class |
| `be-hrm-mob-uuid-bprime-01-20260727.md` | `resolveCompanyUuid` → `HRM_COMPANY_UUID_BY_SLUG` | **READY_FOR_QA** | BE FIX CLOSED |
| `qa-hrm-mob-uuid-plane-01-r2-20260727.md` | Retest EC-1..4 live | **PASS** · PASS_TO_PM | Happy path cleared |
| ADR-PLANE-A-BRIDGE §4.3 | OP/MD/mobile = B′ only; LE fail-closed | **PASS** cite | Invariant |

---

## Spot verify (QC independent)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-mob-uuid-plane-01-r2-20260727.md` | **FAIL** 3/8 (`command_table`, `portal_url`, `residual_section`) | PROCESS — L1 API QA pack expected P3; **not** product NO-GO (same class as ADM L1-live) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-mob-uuid-plane-01-20260727.md` | **PASS** exit **0** (8/8) — this QC pack | PROCESS |
| `node` fetch `GET http://127.0.0.1:28001/api/hrm` | **PASS** **200** | ENV (L0) |
| `node` fetch `POST …/auth/mobile/login` `uat.nv0001@xe.vn` | **PASS** **201** `HRM-AUTH-200` · `company_uuid=10000000-0000-4000-8000-000000000001` · `default_company_id=holding` | PRODUCT |
| `node` fetch `POST …/attendance/records` body=`company_id`=claim B′ · `employee_id` from login · date `2026-08-02` | **PASS** **201** `HRM-ATT-201` · persist `company_id=…0001` · id `61c5b6b1-…` | PRODUCT |
| `node` fetch ATT body LE `78b8a663-…` | **PASS** **409** `SCOPE_CONTEXT_MISMATCH` · `tokenCompanyUuid=…0001` | PRODUCT |
| `node` fetch ATT body legacy hash `6efaa5d6-…` | **PASS** **409** `SCOPE_CONTEXT_MISMATCH` | PRODUCT |
| `node` fetch login `uat.nv1000@xe.vn` | **PASS** **201** · `company_uuid=…0005` (services) | PRODUCT |
| QA cite Jest mobile-auth + scope-context + hrm-list-scope | **PASS** 67/67 exit **0** (accepted cite) | PRODUCT supporting |

**Portal URL / PORTAL_DEV_URL:** `http://127.0.0.1:5173/` (dev portal health context) — this WI is **L1 mobile API only**; browser UF / device adb **not claimed**. Mobile `api_base` local: `http://127.0.0.1:28001/api/hrm`.

### Read-only / L1 matrix (Plane B′)

| Module / AC | Create | Read | Update | Delete | Note |
|-------------|--------|------|--------|--------|------|
| Mobile login JWT `company_uuid` B′ | N/A | **PASS** holding `…0001` | N/A | N/A | Prior hash FAIL cleared |
| `POST /attendance/records` claim body | **PASS** 201 | — | N/A | N/A | Not `HRM-PLANE-409` |
| ATT body Plane A LE | **409** must_keep | — | — | — | `SCOPE_CONTEXT_MISMATCH` |
| ATT body legacy hash ≠ claim | **409** fail-closed | — | — | — | not silent 2xx |
| Optional nv1000 services B′ | N/A | **PASS** `…0005` | N/A | N/A | EC-4 |
| Device UF check-in visual | — | **not claimed** | — | — | U65 / no adb |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| Live login B′ `…0001` (was hash) | PRODUCT | **PASS** — prior FAIL CLOSED |
| ATT claim → 201 `HRM-ATT-201` persist B′ | PRODUCT | **PASS** |
| LE / hash body → 409 | PRODUCT | **PASS** must_keep |
| L0 `:28001` 200 | ENV | **PASS** — stack up |
| QA pack verify 3/8 | PROCESS P3 | Expected L1-only pack — **not** product NO-GO |
| FE test hash fixtures `6efaa5d6-…` | PRODUCT P2 residual | **OPEN condition** — optional FE align |
| Device J-MOB-02 adb | OUT OF SLICE | **Deferred** — do not promote UF 🟢 |
| CO-HC / OP / MD GWC | must_keep | **Not reopened** |
| Phase1 / PROD / `:8088` | OUT OF SLICE | **NOT claimed** · HOLD_DEPLOY |

---

## L2.5 journey coverage

| J-ID / slice | Status | Note |
|--------------|--------|------|
| **J-MOB-01** Login → scope | **Deferred** this packet | L1 login API PASS; device visual **not** retested |
| **J-MOB-02** Check-in GPS | **Deferred** this packet | L1 ATT POST PASS; device UF **not claimed** |
| L1 Plane B′ issuance / plane guard | **PASS** | EC-1..3 QC spot + QA R2 |

**QC:** No L2.5 product NO-GO — device journeys **explicitly out of entry criteria** for this L1 WI. Do **not** promote J-MOB-02 🟢 from this evidence. Prior umbrella MOB device gates remain as-is until PM opens device retest.

---

## Residual

| ID | Sev | Status | Owner | Note |
|----|-----|--------|-------|------|
| **FE hash fixtures** | P2 | **OPEN condition** | **dev-mobile** | `p1-phase1-mob-p5-jwt.test.ts` still expect SHA256 `6efaa5d6-…` — align to `HRM_COMPANY_UUID_BY_SLUG` (`D-MOB-UUID-BPRIME-FE-01`) |
| Historical ATT rows with hash UUID | Info | defer | — | List under B′ may rely on slug normalize — backfill optional |
| Device UF check-in visual | Info | OPEN if PM opens | qa-device | No adb this WI |
| Same-day duplicate `HRM-ATT-001` | Info | expected | — | Uniqueness — not plane defect |

**Conditions for GWC:**
1. **HOLD_DEPLOY** — no `:8088` / PROD promote from this packet
2. **NOT Phase 1 DONE** / NOT PROD-READY
3. P2 FE hash fixtures OPEN — optional parallel `D-MOB-UUID-BPRIME-FE-01` (does **not** reopen BE)
4. Device J-MOB-* visual deferred — no UF 🟢 claim
5. must_keep CO-HC / OP / MD GWC — do not reopen without FAIL

---

## Decision

### **GO WITH CONDITIONS**

- **Closed:** Live mobile JWT Plane B′ issuance (`…0001` / `…0005`); attendance POST with claim → **201** `HRM-ATT-201` (prior `HRM-PLANE-409` **cleared**); LE + legacy hash body → **409** `SCOPE_CONTEXT_MISMATCH`; ADR §4.3.3 OP/MD/mobile B′ invariant; U65; must_keep intact.
- **Deploy:** **HOLD_DEPLOY**
- **Claims forbidden:** Phase1 DONE · PROD-READY · `:8088` · device UF 🟢 · seed · reopen CO-HC/OP/MD
- **No Dev-BE reopen** without new product FAIL — FE fixture align is P2 condition only

---

## Handoff

### completion_report

**Closed:** `QC-HRM-MOB-UUID-PLANE-01` — audited prior FAIL + BE B′ FIX + QA R2 PASS; independent L1 spot: login B′ **201**, ATT claim **201** persist `…0001`, LE/hash **409**; QC evidence pack **8/8**; HOLD_DEPLOY; NOT Phase1/PROD; must_keep CO-HC/OP/MD.

**Residual / conditions:** P2 FE hash fixtures → optional `D-MOB-UUID-BPRIME-FE-01`; device J-MOB deferred; historical hash ATT Info defer.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QC-HRM-MOB-UUID-PLANE-01
from_role: qc
to_role: pm
lane: governance intake · HOLD_DEPLOY
entry_criteria: QC-HRM-MOB-UUID-PLANE-01 PASS_TO_PM · evidence docs/qa/evidence/qc-hrm-mob-uuid-plane-01-20260727.md
decision: GO WITH CONDITIONS — L1 B′ login + ATT 201 + LE 409 CLOSED · prior HRM-PLANE-409 FAIL cleared · HOLD_DEPLOY · NOT Phase1/PROD/:8088
action:
  1) Mark mobile JWT Plane B′ issuance QC-verified CLOSED on residual trackers / bus — do NOT reopen BE without FAIL
  2) Optional parallel: Task D-MOB-UUID-BPRIME-FE-01 (dev-mobile) — align p1-phase1-mob-p5-jwt hash fixtures → HRM_COMPANY_UUID_BY_SLUG (…0001 / …0005)
  3) Device J-MOB-02 visual only if PM opens qa-device — do NOT claim UF 🟢 from this L1 gate
  4) Do NOT claim Phase1/PROD/:8088 · do NOT reopen CO-HC/OP/MD GWC
ack_status target: INTAKE then next execution/governance dispatch
```

### evidence_path

`docs/qa/evidence/qc-hrm-mob-uuid-plane-01-20260727.md`

### ack_status

**PASS_TO_PM**
