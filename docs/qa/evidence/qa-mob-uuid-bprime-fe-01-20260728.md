# QA-MOB-UUID-BPRIME-FE-01 — Plane B′ display spot-check (2026-07-28)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-MOB-UUID-BPRIME-FE-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution · U65 zero-seed · HOLD_DEPLOY · LOCAL ONLY |
| **date** | `2026-07-28` (ICT) |
| **entry** | `D-MOB-UUID-BPRIME-FE-01` READY_FOR_QA · `docs/qa/evidence/d-mob-uuid-bprime-fe-01-20260728.md` |
| **prior_gwc** | `docs/qa/evidence/qc-hrm-mob-uuid-plane-01-20260727.md` (P2 FE hash fixtures / display) |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** — P2 FE fixtures + display polish closed (unit + resolver AC) |
| **deploy** | **HOLD_DEPLOY** · NOT `:8088` |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **device_uf_claim** | **NO** — no adb |

---

## 1. Scope / locks

| In scope | Explicitly out |
|----------|----------------|
| Vitest web `employeeCompanyDisplayName` + `hrmMetadataCompany` | Phase1 / PROD / `:8088` |
| Vitest mobile `companyDisplayVi` + `p1-phase1-mob-p5-jwt` (+ related fixture suite) | Seed · invent device UF |
| Display AC: never raw UUID; B′ → VI label; unknown LE → `—` | Reopen BE dual-plane / CO-HC / OP / MD |
| Confirm this WI did not reopen BE dual-plane | Device J-MOB visual 🟢 |

**must_keep:** OP/MD/INF dual-plane GWC · LE body 409 · U65 · HOLD_DEPLOY · no BE reopen from FE lane

---

## 2. Command table

| Command | Result | Class |
|---------|--------|-------|
| `cd apps/web/hrm && pnpm exec vitest run src/lib/employeeCompanyDisplayName.test.ts src/lib/hrmMetadataCompany.test.ts` | **PASS** — Test Files **2** · Tests **17/17** · EXIT **0** | PRODUCT |
| `cd apps/mobile/hrm-mobile && pnpm exec vitest run` … `companyDisplayVi` + `p1-phase1-mob-p5-jwt` + 6 fixture files | **PASS** — Test Files **8** · Tests **66/66** · EXIT **0** | PRODUCT |
| `rg 6efaa5d6 apps/web/hrm/src apps/mobile/hrm-mobile/src` | **PASS** — **0** matches (legacy hash fixtures cleared) | PRODUCT |
| `GET http://127.0.0.1:28001/api/hrm` | **200** L0 up | ENV |
| `GET http://127.0.0.1:5173/` | **200** portal up | ENV |
| Browser L2 company-column click path | **SKIPPED** — no browser MCP in this QA seat; AC covered by vitest resolvers | PROCESS |
| Device adb J-MOB visual | **NOT claimed** | OUT |
| `POST …/auth/mobile/login` `uat.nv0001@xe.vn` (spot) | **201** `HRM-AUTH-200` but `company_uuid=6efaa5d6-…` (legacy hash) — see §5 residual | ENV / **out of FE WI** |

---

## 3. Display AC matrix

| Case | Input | Expected | Result | Evidence |
|------|-------|----------|--------|----------|
| Holding slug | `holding` | `Tập đoàn XeVN` | **PASS** | web + mobile vitest |
| Plane B′ holding UUID | `10000000-…0001` | `Tập đoàn XeVN` | **PASS** | `employeeCompanyDisplayName` · `companyDisplayVi` |
| Plane B′ services UUID | `…0005` | `Khối Dịch vụ X.E` (mobile registry) | **PASS** | `companyDisplayVi` |
| Unknown LE UUID | `78b8a663-…` | `—` (never print UUID) | **PASS** | web + mobile |
| Legacy hash UUID (display) | `6efaa5d6-…` | `—` (unknown UUID path) | **PASS** | resolver logic + uuid→`—` branch |
| P5 JWT wire fixture | expect `…0001` not hash | **PASS** | `p1-phase1-mob-p5-jwt.test.ts` |

**Never raw UUID on touched resolvers:** **PASS**.

---

## 4. Dual-plane / must_keep (this WI)

| Check | Result | Note |
|-------|--------|------|
| FE WI touched BE dual-plane guards? | **NO** | Entry evidence: display/fixtures only; QA did not reopen BE |
| OP/MD/INF GWC reopen? | **NO** | must_keep — not in allowed_paths of this WI |
| LE body 409 product retest | **Not claimed this packet** | Probe body incomplete → `400 HRM-VAL-001` (invalid probe, not product FAIL); prior QC GWC still SoT for LE 409 |
| Accidental BE reopen by FE polish | **PASS** | No BE reopen required / performed |

---

## 5. Residual

| ID | Sev | Status | Owner | Note |
|----|-----|--------|-------|------|
| **P2 FE hash fixtures / B′ display** | P2 | **CLOSED** this WI | — | Vitest 17+66; fixtures `…0001`; resolvers B′→VI / LE→`—` |
| Live `:28001` login JWT still hash `6efaa5d6-…` | **P1 ENV** | **OPEN** — **separate** from FE polish PASS | `pm` → `devops` / `dev-be` if stack not on B′ build | QC GWC 2026-07-27 saw `…0001`; current process returns hash again. **Do not reopen BE from this FE QA FAIL.** HOLD_DEPLOY. |
| Browser visual company column | Info | Deferred | human / optional FE browser | L0 portal **200**; no browser MCP this seat |
| Device J-MOB visual | Info | Deferred | `qa-device` if PM opens | no adb |

---

## 6. L2.5 / device

| J-ID | Status |
|------|--------|
| J-MOB-* device UF | **Not claimed** |
| Web embed company column browser | **Unit-backed PASS**; browser click **SKIPPED** (no MCP) |

---

## 7. Decision

### **PASS** → **PASS_TO_PM**

- **Closed:** QC GWC P2 condition (FE hash fixtures + Plane B′ display polish) — independent vitest re-run green; grep no `6efaa5d6` under web/mobile src; display AC never raw UUID.
- **QC:** **optional close P2** only — **not** required re-gate of dual-plane BE (no FE regress; must_keep intact).
- **Do not** claim Phase1/PROD/:8088/device UF.
- **Separate residual:** live mobile login hash — track outside this WI (devops restart / BE issuance process), not FE FAIL.

---

## Handoff

### completion_report

**Closed:** `QA-MOB-UUID-BPRIME-FE-01` — re-ran vitest web **17/17** + mobile **66/66** EXIT 0; fixtures expect Plane B′ `…0001` (no legacy hash in src); company display B′→«Tập đoàn XeVN» / OU VI, unknown LE/hash UUID→«—»; dual-plane BE not reopened by this WI; U65; HOLD_DEPLOY; device UF not claimed.

**Open / residual:** Live `:28001` login currently emits hash JWT again (**P1 ENV**, out of FE slice) — PM may dispatch devops/dev-be separately; browser visual Info deferred; device deferred.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QA-MOB-UUID-BPRIME-FE-01
from_role: qa
to_role: pm
lane: governance intake · HOLD_DEPLOY · U65
entry_criteria: QA-MOB-UUID-BPRIME-FE-01 PASS_TO_PM · docs/qa/evidence/qa-mob-uuid-bprime-fe-01-20260728.md
verdict: PASS — P2 FE fixtures + B′ display polish CLOSED (vitest 17+66)
action:
  1) Optional close P2 on QC-HRM-MOB-UUID-PLANE-01 GWC condition track — NO mandatory QC re-gate (no FE regress / no BE reopen)
  2) SEPARATE residual P1 ENV: live POST /auth/mobile/login still returns company_uuid=6efaa5d6-… (not …0001) — Task devops restart hrm-api on B′ build OR narrow L1 re-probe; do NOT treat as FE FAIL; do NOT reopen OP/MD/INF GWC
  3) Do NOT claim Phase1/PROD/:8088 · do NOT claim device UF without adb
ack_status target: INTAKE · optional P2 close
```

### evidence_path

`docs/qa/evidence/qa-mob-uuid-bprime-fe-01-20260728.md`

### ack_status

**PASS_TO_PM**
