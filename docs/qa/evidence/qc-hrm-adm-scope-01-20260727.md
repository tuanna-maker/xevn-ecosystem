# QC Gate — QC-HRM-ADM-SCOPE-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-ADM-SCOPE-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance · GWC local · HOLD_DEPLOY · gate **G-ADM-SCOPE-01** Option A |
| **date** | `2026-07-27` (ICT) |
| **decision** | **GO WITH CONDITIONS** — **G-ADM-SCOPE-01 CLOSED** (SoT **Option A** platform-only) |
| **scope_claim** | Policy + unit/source: non-platform → **403** `HRM-AUTH-002`; platform path → **HRM-ADMIN-202**; invite non-platform/no-bearer → **403**/401; **no** `resolveHrmListScope` / invent **409** on admin mutates |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY · NOT `:8088` |
| **deploy** | **HOLD_DEPLOY** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — no seed · no invent live company-admin mutate · no Option B BE · no UF admin browser claim |

---

## Scope (bounded — policy + unit/contract GWC)

| In scope | Explicitly out (cấm) |
|----------|----------------------|
| Formal close **G-ADM-SCOPE-01** Option A after BA CLOSED + QA PASS + QC spot | Invent **Option B** / `company_admin` + `resolveHrmListScope` |
| Audit AC-ADM-SCOPE-01..03 vs SoT platform-only | Invent live HTTP mutate PASS while `:28001` DOWN |
| Confirm QA did **not** expect list-scope **409** on admin mutates | Phase 1 DONE / PROD-READY / `:8088` |
| Confirm no seed · no Phase1/PROD claim in QA pack | Reopen G-ADM-SCOPE-01 without sponsor CR |
| Accept jest + source as privilege-gate proof (L0 DOWN honesty) | Treat stack DOWN as product NO-GO when unit+SoT PASS |

**Spec SoT:** `docs/hrm/API_DESIGN_HRM_ADMIN.md` Policy lock G-ADM-SCOPE-01 · `docs/hrm/SRS.md` `AC-ADM-SCOPE-01..03` · `BR-ADM-SCOPE-01` · BA `ba-hrm-adm-scope-01-20260727.md` · QA `qa-hrm-adm-scope-01-20260727.md`.

---

## Micro-checklist (exit_criteria)

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Audit AC-ADM-SCOPE-01..03 evidence vs SoT Option A (platform-only) | **PASS** — AC-01/03 unit 403/401; AC-02 source + unit platform gate + prior privilege cite; matches BA Policy lock |
| 2 | Confirm QA did NOT invent Option B / `resolveHrmListScope` expectation | **PASS** — QA §1 Out + §3 `resolveHrmListScope` **ABSENT**; fail = **403** not **409** |
| 3 | Confirm no seed · no Phase1/PROD claim | **PASS** — QA §2 Seed none · §6 Phase1/PROD Out · HOLD_DEPLOY |
| 4 | GO or GWC; this evidence → PASS_TO_PM | **PASS** — **GWC** |
| 5 | Append bus | **PASS** (same session) |

---

## Evidence chain audited

| Artifact | Gap / role | Verdict | Closed |
|----------|------------|---------|--------|
| `docs/qa/evidence/ba-hrm-adm-scope-01-20260727.md` | Option A KEEP platform-only · AC/BR delta | **CLOSED** policy | G-ADM-SCOPE-01 SoT |
| `docs/qa/evidence/qa-hrm-adm-scope-01-20260727.md` | AC-01..03 unit/source · no Option B invent | **PASS** · PASS_TO_PM | AC matrix |
| `docs/hrm/API_DESIGN_HRM_ADMIN.md` Policy lock | Option A · reject Option B · residual CLOSED | **CLOSED** cite BA | Policy |
| `docs/hrm/SRS.md` BR/AC-ADM-SCOPE | Diễn biến #3 = platform gate | **ALIGNED** | BR + AC |
| Runtime `hrm-admin.service.ts` | `assertPlatformAdmin` → `HRM-AUTH-002` 403 | **PASS** QC grep | Privilege gate |
| Runtime `hrm-admin.controller.ts` | `ok(..., 'HRM-ADMIN-202', …)` | **PASS** QC grep | AC-02 envelope |
| `src/hrm-admin/**` | `resolveHrmListScope` | **ABSENT** QC rg | No invent list-scope |

**must_keep:** Option A platform-only · Diễn biến #3 = `HRM-AUTH-002` · **no** `resolveHrmListScope` on FR-02..05 mutates · Option B HOLD sponsor CR · U65 · HOLD_DEPLOY · **no** Phase1/PROD/:8088 · **no** invent live mutate PASS.

---

## Spot verify (QC)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm --filter hrm-api exec jest --testPathPatterns=hrm-admin --no-coverage` | **PASS** exit **0** — Suites **3/3** · Tests **21/21** (QC re-run 2026-07-27) | PRODUCT (unit) |
| `rg resolveHrmListScope apps/api/hrm-api/src/hrm-admin` | **ABSENT** (rg exit **1**) | PRODUCT |
| Grep `assertPlatformAdmin` → `HRM-AUTH-002` `HttpStatus.FORBIDDEN` | **Present** (`hrm-admin.service.ts`) | PRODUCT |
| Grep controller `HRM-ADMIN-202` company-admin wrap | **Present** | PRODUCT |
| API_DESIGN Policy lock Option A + SRS AC-ADM-SCOPE-01..03 | **Present** / **ALIGNED** | PRODUCT (contract) |
| BA Option A CLOSED · Option B HOLD | **Present** | PRODUCT (governance) |
| Health `:28001` / live non-platform JWT → company-admin 403 | **SKIPPED** — DOWN (QA honesty) | ENV — Info condition |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-adm-scope-01-20260727.md` | **FAIL** 4/8 (`command_table`, `portal_url`, `journey_l25`, `crud_or_matrix`) | PROCESS — unit/contract QA pack (expected P3) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-adm-scope-01-20260727.md` | **PASS** exit **0** (8/8) — this QC pack | PROCESS |

**Portal URL / PORTAL_DEV_URL:** N/A for unit/contract G-ADM-SCOPE-01 gate — no browser UF in slice (`PORTAL_DEV_URL` not required; portal `127.0.0.1:5175` not exercised).

### Read-only / contract matrix (admin privilege Option A)

| Module / AC | Create | Read | Update | Delete | Note |
|-------------|--------|------|--------|--------|------|
| AC-ADM-SCOPE-01 non-platform → company-admin **403** `HRM-AUTH-002` | **PASS** unit | N/A | N/A | N/A | SoT Option A |
| AC-ADM-SCOPE-02 platform → **HRM-ADMIN-202** | **PASS** gate (source+unit; live mutate SKIPPED U65) | N/A | N/A | N/A | no invent write |
| AC-ADM-SCOPE-03 invite non-platform / no Bearer → **403**/401 | **PASS** unit | N/A | N/A | N/A | service-role exception documented |
| `resolveHrmListScope` on admin mutates | **ABSENT** | — | — | — | Forbidden expectation |
| Invent **409** list-scope on admin mutates | **ABSENT** | — | — | — | Fail = 403 |
| Option B membership admin | — | — | — | — | **HOLD** sponsor CR |
| Admin UF browser mutate | — | **not claimed** | — | — | U65 · out of slice |
| Live wire non-platform JWT | — | — | **deferred** | — | ENV L1-live-scope-wire |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| G-ADM-SCOPE-01 Option A platform-only | PRODUCT | **PASS** — CLOSED via BA SoT + QA AC + QC jest/source |
| Non-platform → 403 `HRM-AUTH-002` (not 409) | PRODUCT | **PASS** |
| No `resolveHrmListScope` invent on admin mutates | PRODUCT | **PASS** |
| Option B invent / BE reopen | PRODUCT anti-goal | **PASS** — not invented; HOLD CR |
| Seed / Phase1 / PROD / `:8088` | OUT OF SLICE | **NOT claimed** · HOLD_DEPLOY |
| Live L1 HTTP with member JWT (`:28001` DOWN) | ENV | **Info condition** — **not** product NO-GO |
| QA pack 4/8 missing portal/J-*/crud tokens | PROCESS | **OPEN P3** — expected unit/contract pack; QC pack 8/8 |

---

## L2.5 journey coverage

| J-ID / slice | Status | Note |
|--------------|--------|------|
| Admin UF / FR-03..05 browser journey | **N/A** this packet | Policy + unit/contract gate — L2.5 browser **not in entry criteria** |
| J-HRM-ADMIN mutate (if mapped later) | **not claimed** | Contract/unit PASS ≠ UF browser PASS (U65) |
| G-ADM-SCOPE-01 Option A privilege path | **PASS** | BA Policy lock + QA AC-01..03 + QC jest 21/21 + `resolveHrmListScope` ABSENT |

**QC:** No L2.5 product NO-GO — browser journey coverage **out of scope** for this unit/contract GWC. Do **not** promote admin UF mutate or invent live L1 from this evidence.

---

## Residual / Conditions

| ID | Severity | Status | Owner |
|----|----------|--------|-------|
| ~~**G-ADM-SCOPE-01**~~ | — | **CLOSED** Option A | This GWC · BA-HRM-ADM-SCOPE-01 + QA-HRM-ADM-SCOPE-01 + QC unit/SoT |
| **Option B** membership admin | HOLD | OPEN (condition) | Sponsor CR only — **cấm** reopen without CR |
| **L1-live-scope-wire** | Info | OPEN (condition) | `qa` optional when L0 up — observe real HTTP 403; **not** reopen G-ADM-SCOPE-01 without FAIL |
| **G-ADM-04** | P2 | OPEN | Invite temp-password channel — separate WI (sibling) |
| **C-ADM-SCOPE-QA-PACK-01** | P3 PROCESS | OPEN | QA optional — enrich future unit packs for Layer B 8/8 (`PORTAL_DEV_URL` N/A + journey N/A + CRUD matrix tokens) |
| Phase1 / PROD / `:8088` | — | **NOT claimed** | HOLD_DEPLOY |

---

## Verdict

**GO WITH CONDITIONS**

- **Closed:** Soft residual **G-ADM-SCOPE-01** — SoT **Option A** platform-only for `POST …/company-admin` · `invite-employee` · `reset-user-password`; Diễn biến #3 = non-platform → **403** `HRM-AUTH-002`; platform path → **HRM-ADMIN-202**; **no** `resolveHrmListScope` / invent **409**; BA policy CLOSED; QA AC-01..03 PASS; QC re-run `hrm-admin` **21/21** + rg ABSENT.
- **Conditions:** HOLD_DEPLOY; Option B HOLD (sponsor CR); **L1-live-scope-wire** Info (ENV stack was down); **NOT** Phase 1 DONE; **NOT** PROD-READY; **NOT** `:8088`; no UF admin mutate claim.
- **cấm honored:** no seed · no Option B BE · no invent `resolveHrmListScope` expectation · no reopen without sponsor CR · no Phase1/PROD/:8088 · no invent live mutate PASS.

---

## Handoff

### completion_report

**Closed:** QC gate **GO WITH CONDITIONS** for `QC-HRM-ADM-SCOPE-01`. Independent audit confirms **G-ADM-SCOPE-01 CLOSED** Option A: BA Policy lock + SRS AC/BR + QA AC-01..03 (no Option B / no `resolveHrmListScope` invent) + QC re-run `hrm-admin` jest **21/21** + `resolveHrmListScope` **ABSENT** in `src/hrm-admin/**`. Live L1 deferred as **Info ENV** (not product NO-GO). QC evidence-pack **8/8**. U65 · HOLD_DEPLOY · **NOT** Phase1/PROD/:8088 · **no** seed · **no** Option B BE · **no** reopen without sponsor CR.

**Residual:** Option B HOLD; L1-live-scope-wire Info; G-ADM-04 sibling OPEN; C-ADM-SCOPE-QA-PACK-01 P3 PROCESS; no product P0/P1 on Option A path.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QC-HRM-ADM-SCOPE-01
from_role: qc
to_role: pm
lane: governance intake · G-ADM-SCOPE-01 Option A close
priority: P2

entry_criteria:
- QC-HRM-ADM-SCOPE-01 = GO WITH CONDITIONS
- evidence: docs/qa/evidence/qc-hrm-adm-scope-01-20260727.md
- QA PASS: docs/qa/evidence/qa-hrm-adm-scope-01-20260727.md
- BA CLOSED: docs/qa/evidence/ba-hrm-adm-scope-01-20260727.md
- SoT: docs/hrm/API_DESIGN_HRM_ADMIN.md Policy lock G-ADM-SCOPE-01

action:
1. Bus INTAKE: mark G-ADM-SCOPE-01 QC-verified CLOSED (Option A platform-only)
2. Keep Option B HOLD — do NOT dispatch BE for resolveHrmListScope on admin mutates without sponsor CR
3. Keep L1-live-scope-wire as optional Info retest when L0 up — do NOT reopen G-ADM-SCOPE-01 without FAIL
4. Continue G-ADM-04 (invite channel) as separate WI if in flight — do NOT reopen SCOPE
5. Keep HOLD_DEPLOY; do NOT claim Phase1/PROD/:8088
cấm: seed · Option B BE · resolveHrmListScope invent on admin mutates · reopen G-ADM-SCOPE-01 without sponsor CR · Phase1/PROD/:8088 · treat unit PASS as UF browser PASS
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/qc-hrm-adm-scope-01-20260727.md`

### pm_dispatch_hint

`PM-INTAKE` — GWC closes G-ADM-SCOPE-01 Option A only; Option B HOLD; L1-live-scope-wire Info; HOLD_DEPLOY · NOT Phase1/PROD/:8088.
