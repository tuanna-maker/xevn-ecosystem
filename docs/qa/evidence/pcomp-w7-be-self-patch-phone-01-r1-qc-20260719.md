# PCOMP-W7-BE-SELF-PATCH-PHONE-01-R1 — QC gate (API ESS self-patch)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-BE-SELF-PATCH-PHONE-01-R1` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-07-19 |
| **decision** | **GO WITH CONDITIONS** — **API ESS self-patch slice only** (Option A) |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded)

| In scope | Out of scope |
|----------|--------------|
| PATCH self ESS allowlist when `jwt.employee_id === :id` even if JWT has `manager`\|`hr_manager` | Phase 1 DONE / `verify:product:completion` |
| Mandated persona `uat.nv0001` — phones 2xx+stick; `full_name` / gender-only → `HRM-EMP-403`; avatar 2xx | PROD cutover / UF promote from API alone |
| Control `uat.nv0016` employee-only — no regression | Device APK / browser J-MOB-12 click path (WAVE-APK) |
| Jest `employee-update-policy` + `employees.service.spec` 39/39 | Open-all-fields / Option B persona waive |
| Prior FAIL root-cause closure (CEO `deriveRoles` bypass) | Full MOB-12 profile ESS UI (W7-6) |

**Upstream QA:** `docs/qa/evidence/pcomp-w7-be-self-patch-phone-01-r1-qa-20260719.md`  
**Dev R1:** `docs/qa/evidence/pcomp-w7-be-self-patch-phone-01-r1-20260719.md`  
**Prior FAIL:** `docs/qa/evidence/pcomp-w7-be-self-patch-phone-01-qa-20260719.md`  
**spec_ref:** `docs/hrm/MOBILE_W7_SRS_DELTA.md` §4.5 UC-HRM-MOB-12 · AC-ESS-01 · BR-ESS-01 · TechSpec §3.1

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/pcomp-w7-be-self-patch-phone-01-r1-qa-20260719.md
# exit 1 — 1/8 checks (2026-07-19 QC audit)
# FAIL: portal_url
```

**QC adjudication:** **PROCESS — not product NO-GO.**

| Failed check | QC ruling |
|--------------|-----------|
| `portal_url` | **Out-of-slice / format** — wave is local `hrm-api` `:28001` L1 API AC; no portal or nip.io device pack required for this bounded gate. Material matrix + JWT roles + command exit + Residual + date present (7/8). |

Material pack content auditable: exit matrix 4/4 both personas, JWT role proof, live session excerpts, jest 39/39, residual owners, U65 zero-seed — **accepted for API-slice GWC**.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| `GET /api/hrm` → `HRM-HEALTH-200` on `:28001` | ENV | **PASS** (QA) |
| No `pnpm seed:*` in evidence chain | Process / U65 | **PASS** |
| Prior FAIL: `uat.nv0001` full_name/gender → **200** (manager bypass) | PRODUCT | **CLOSED** by Option A R1 |
| R1 QA: phones PATCH **200** + GET stick | PRODUCT / AC-ESS-01 | **PASS** |
| R1 QA: full_name → **403** `HRM-EMP-403` (mandated + control) | PRODUCT / BR-ESS-01 | **PASS** |
| R1 QA: gender-only CF → **403**; CF not wiped | PRODUCT / merge | **PASS** |
| R1 QA: avatar_url → **200** + stick | PRODUCT | **PASS** |
| Control `uat.nv0016` employee-only — no regression | PRODUCT | **PASS** |
| Jest 39/39 (policy + service) | PRODUCT / regression | **PASS** |
| Avatar QA URL `cdn.example.invalid/*` | P3 cosmetic | **Not blocking** |
| Device J-MOB-12 browser/APK | Process / deferred | **COND OPEN** — WAVE-APK |

**Product NO-GO avoided:** Prior mandated-persona FAIL is closed with live 403 evidence + jest covering manager|hr_manager self deny.

---

## L2.5 / journey audit

| Journey | Layer | QA | QC | Notes |
|---------|-------|----|----|-------|
| UC-HRM-MOB-12 / AC-ESS-01 API (self phone+avatar allowlist) | L1 API | PASS | **PASS** | Mandated `uat.nv0001` + control `uat.nv0016` |
| **J-MOB-12** device ESS UI | L2.5 device | deferred | **DEFERRED (process)** | After WAVE-APK — PM exit allows; **does not block** API-slice GWC |
| Portal ESS parity AC-ESS-03 | Web | not in wave | **OUT OF SCOPE** | W7-6 / separate work item |

**J-* tested PASS (API contract):** self-patch AC matrix (phones / deny full_name / deny gender / avatar).  
**J-* deferred:** device **J-MOB-12** (WAVE-APK).

---

## Conditions (must remain explicit)

| ID | Status | Owner | Expiry / trigger |
|----|--------|-------|------------------|
| `COND-W7-ESS-PACK-PORTAL-URL` | **OPEN (process)** | qa (next API pack) | Add `api_base` or `:28001` note matching verifier — optional format |
| `COND-W7-ESS-JMOB12-DEVICE` | **OPEN (process)** | qa-device | After WAVE-APK — device ESS self phone click path |
| Phase 1 / PROD claim from this gate | **FORBIDDEN** | pm | Until program gates + device journeys close |

---

## Decision

**GO WITH CONDITIONS** for **API ESS self-patch (Option A) slice only**.

- Prior FAIL `PCOMP-W7-BE-SELF-PATCH-PHONE-01` **CLOSED** for mandated CEO/manager JWT self path.
- Residual device **J-MOB-12** = process condition OK (not product blocker for this slice).
- **NOT Phase 1 DONE. NOT PROD-READY.**

---

## Handoff

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `pm`
- **evidence_path:** `docs/qa/evidence/pcomp-w7-be-self-patch-phone-01-r1-qc-20260719.md`

### next_dispatch_prompt

```text
work_item_id: PCOMP-W7-BE-SELF-PATCH-PHONE-01-R1
from_role: pm
to_role: pm
lane: governance
residual_auto_fix: true

## Entry
QC GO WITH CONDITIONS: docs/qa/evidence/pcomp-w7-be-self-patch-phone-01-r1-qc-20260719.md
API ESS self-patch Option A CLOSED (uat.nv0001 403 on full_name/gender; phones+avatar 2xx; nv0016 OK; jest 39/39).
COND-W7-ESS-JMOB12-DEVICE OPEN → qa-device after WAVE-APK (process; not product blocker).

## Exit
1) Promote/close PCOMP-W7-BE-SELF-PATCH-PHONE-01 / R1 on bus + TODO as API-slice GWC (not Phase1/PROD).
2) Optional later: Task qa-device J-MOB-12 after WAVE-APK.
3) Continue next PCOMP open backlog (pm:idle:check).

## Cấm
seed; claim Phase1/PROD from this GWC; reopen Option B persona waive; treat pack portal_url gap as product NO-GO
```
