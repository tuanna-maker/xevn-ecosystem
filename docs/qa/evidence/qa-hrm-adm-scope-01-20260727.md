# QA-HRM-ADM-SCOPE-01 — G-ADM-SCOPE-01 Option A (AC-ADM-SCOPE-01..03)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-ADM-SCOPE-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution · U65 · L1/source gate · HOLD_DEPLOY |
| **date** | 2026-07-27 |
| **ack_status** | **PASS_TO_PM** |
| **entry** | `BA-HRM-ADM-SCOPE-01` CLOSED Option A · no seed · no Option B BE |
| **spec_ref** | `docs/hrm/SRS.md` `AC-ADM-SCOPE-01..03` · `BR-ADM-SCOPE-01` · `docs/hrm/API_DESIGN_HRM_ADMIN.md` Policy lock G-ADM-SCOPE-01 |
| **ba_evidence** | `docs/qa/evidence/ba-hrm-adm-scope-01-20260727.md` |

---

## 1. Scope / cấm

| In | Out |
|----|-----|
| Non-platform → `POST …/company-admin` → **403** `HRM-AUTH-002` | Seed admin / membership |
| Invite without platform & without service-role → **403**/401 | Option B `resolveHrmListScope` invent |
| Confirm **no** `resolveHrmListScope` / invent **409** list-scope on admin mutates | Live invent company-admin mutate (U65 + L0 down) |
| Platform path documented (source + prior privilege evidence) | Phase1 / PROD claim |

---

## 2. Environment

| Item | Result |
|------|--------|
| Workspace | `C:\xevn-ecosystem` |
| L0 `:28001` / `:28002` | **DOWN** (`Unable to connect`) — live HTTP deferred |
| Probe mode | **Service unit** (`HrmAdminService` + mock `HrmDbService` + `signServiceJwt`) — exit criteria allow jest/source when no live non-platform token |
| Jest | `pnpm exec jest --testPathPatterns=hrm-admin` → **3 suites / 17 tests PASS** |
| Seed | **none** |

---

## 3. Source corroboration (Option A)

| Check | Result |
|-------|--------|
| `assertPlatformAdmin` | Allows `platform_admin` \| `group_ceo` \| `platform_admins` row; else **`HRM-AUTH-002` 403** (`hrm-admin.service.ts` L187–213) |
| `createCompanyAdmin` | First line `await this.assertPlatformAdmin(...)` (L252–253) |
| `inviteEmployees` | Service-role key bypass **OR** `assertPlatformAdmin` (L284–291) |
| `resetUserPassword` | `assertPlatformAdmin` (same privilege class) |
| `resolveHrmListScope` in `src/hrm-admin/**` | **ABSENT** (rg exit 1 / no matches) |
| Invent 409 list-scope on these mutates | **ABSENT** — privilege fail = **403** `HRM-AUTH-002`, not 409 |
| Controller success wrap | `ok(..., 'HRM-ADMIN-202', 'Company admin created or updated')` |

---

## 4. AC matrix

### AC-ADM-SCOPE-01 — Non-platform → company-admin 403

| Caller JWT | Endpoint | Result | Verdict |
|------------|----------|--------|---------|
| `roleCode=company_ceo` · `sub=du-lich.ceo@xe.vn` · `companyId=du-lich` | `createCompanyAdmin` | **403** `HRM-AUTH-002` | **PASS** |
| `roleCode=admin` · member email · `companyId=holding` | `createCompanyAdmin` | **403** `HRM-AUTH-002` | **PASS** |

Notes: Live XBOS login token not available (L0 down). Exit criteria: jest/source `assertPlatformAdmin` accepted. Mock `platform_admins` SELECT returns empty → gate rejects.

### AC-ADM-SCOPE-02 — Platform path → HRM-ADMIN-202

| Layer | Evidence | Verdict |
|-------|----------|---------|
| Source | After `assertPlatformAdmin`, UPSERT membership; controller wraps **`HRM-ADMIN-202`** | Documented |
| Unit probe | `group_ceo` JWT + `company_id=holding` → `success: true` (assert **passed**; mock DB — **no** live invent mutate) | **PASS** (gate) |
| Live invent mutate | **SKIPPED** — U65 + L0 down + HOLD_DEPLOY (per exit: avoid invent mutate) | N/A this wave |
| Prior platform privilege live | `qa-hrm-adm-upsert-spot-01-20260727.md`: `ceo@xe.vn` → double `POST …/platform-admin` **201** `HRM-ADMIN-201` (same `assertPlatformAdmin` plane) | Cite |
| Prior contract | `qa-hrm-oa-admin-01` / API_DESIGN §B success code `HRM-ADMIN-202` | Cite |

**Verdict AC-02:** **PASS** (platform path locked Option A; 2xx envelope documented; no U65 invent membership write this wave).

### AC-ADM-SCOPE-03 — Invite without platform / without service-role

| Caller | Result | Verdict |
|--------|--------|---------|
| Bearer `company_ceo` (non-platform, not service-role) | **403** `HRM-AUTH-002` | **PASS** |
| No Bearer / empty auth | **401** `HRM-AUTH-001` | **PASS** |

### Exit #4 — No list-scope invent

| Check | Verdict |
|-------|---------|
| No `resolveHrmListScope` on admin mutates | **PASS** |
| Non-platform fails as **403** not **409** | **PASS** |

---

## 5. Command / probe table

| Command | Result |
|---------|--------|
| Health `GET :28001` / `:28002` | **ECONNREFUSED** |
| Node probe `HrmAdminService` + `signServiceJwt` (non-platform / no-bearer / group_ceo) | AC-01/03 as above; platform assert passed |
| `pnpm exec jest --testPathPatterns=hrm-admin --no-coverage` | **17/17 PASS** |
| `rg resolveHrmListScope src/hrm-admin` | **ABSENT** |

---

## 6. Residual

| ID | Status | Note |
|----|--------|------|
| ~~G-ADM-SCOPE-01~~ | **QA-verified CLOSED** Option A | Matches BA policy |
| Option B membership admin | **HOLD** | Needs sponsor CR — not this wave |
| G-ADM-04 | OPEN P2 | Invite temp-password channel (out of scope) |
| Live L1 HTTP with member JWT | Defer | Re-probe when L0 up — optional QC spot; **not** blocking Option A source/unit PASS |
| Phase1 / PROD | **Out** | HOLD_DEPLOY |

---

## 7. Handoff

### completion_report

**Closed:** `QA-HRM-ADM-SCOPE-01` — Option A platform-only **QA-verified**. AC-ADM-SCOPE-01 PASS (non-platform JWT → **403** `HRM-AUTH-002` on company-admin). AC-ADM-SCOPE-03 PASS (invite non-platform → **403**; no Bearer → **401**). AC-ADM-SCOPE-02 PASS via source + unit platform gate + prior platform privilege cite; **no** invent live company-admin mutate (U65 / L0 down). Confirmed **no** `resolveHrmListScope` / invent **409** on admin mutates. Jest hrm-admin **17/17**. No seed · no Option B BE · no Phase1/PROD.

**Residual:** Live HTTP re-spot when stack up (optional); Option B HOLD; G-ADM-04 unrelated.

### next_owner

`qc`

### next_dispatch_prompt

```text
work_item_id: QC-HRM-ADM-SCOPE-01
role: qc
lane: governance · HOLD_DEPLOY
read_first:
  - docs/qa/evidence/qa-hrm-adm-scope-01-20260727.md
  - docs/qa/evidence/ba-hrm-adm-scope-01-20260727.md
  - docs/hrm/API_DESIGN_HRM_ADMIN.md Policy lock G-ADM-SCOPE-01
  - docs/hrm/SRS.md AC-ADM-SCOPE-01..03 · BR-ADM-SCOPE-01
entry_criteria: QA-HRM-ADM-SCOPE-01 PASS_TO_PM · Option A CLOSED BA
exit_criteria:
  1) Audit AC-ADM-SCOPE-01..03 evidence vs SoT Option A (platform-only)
  2) Confirm QA did NOT invent Option B / resolveHrmListScope expectation
  3) Confirm no seed · no Phase1/PROD claim
  4) GO or GWC with residual list; evidence docs/qa/evidence/qc-hrm-adm-scope-01-20260727.md
cấm: seed · Option B BE · reopen G-ADM-SCOPE-01 without sponsor CR
```

### evidence_path

`docs/qa/evidence/qa-hrm-adm-scope-01-20260727.md`

### ack_status

**PASS_TO_PM**

### pm_dispatch_hint

`QC-HRM-ADM-SCOPE-01` — G-ADM-SCOPE-01 Option A QA-verified; next QC gate; HOLD Option B; HOLD_DEPLOY
