# Evidence — PO-HRM-PAY-CNTT-UI-SCREEN-01 · Thiết lập lương UI_SCREEN_SPEC pack

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-UI-SCREEN-01` |
| **role** | ba-process |
| **lane** | governance |
| **parent** | `PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01` |
| **date** | 2026-08-11 |
| **change_mode** | ADD-only UI specs — **no** `apps/**` |
| **honesty** | `payroll_e2e_ready=false` |
| **no_prompt_echo** | true |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Entry criteria (verified)

| Criterion | Status |
|-----------|--------|
| `PO-HRM-PAY-CNTT-SRS-DELTA-01` PASS_TO_PM · sponsor 2026-08-11 | ✅ |
| `PO-HRM-PAY-CNTT-API-01` PASS — DB/API physical locked | ✅ |
| `forbidden_paths: apps/**` respected | ✅ |

---

## 2. Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| **Index + trace matrix** | `docs/hrm/ui-screens/UI-HRM-PAY-STP-SPEC-INDEX.md` | ✅ |
| Hub L1–L6 nav | `docs/hrm/ui-screens/UI-HRM-PAY-STP-HUB.md` | ✅ |
| L4 Policy pack STP-01..06 | `docs/hrm/ui-screens/UI-HRM-PAY-STP-POLICY-PACK.md` | ✅ |
| L1 Catalog STP-07/08 | `docs/hrm/ui-screens/UI-HRM-PAY-STP-COMP-CATALOG.md` | ✅ |
| L3+L6 Sheet template STP-10/11 | `docs/hrm/ui-screens/UI-HRM-PAY-STP-SHEET-TEMPLATE.md` | ✅ |
| L5 Input profile STP-12 | `docs/hrm/ui-screens/UI-HRM-PAY-STP-INPUT-PROFILE.md` | ✅ |
| L6 Setup resolve hub | `docs/hrm/ui-screens/UI-HRM-PAY-STP-SETUP-RESOLVE.md` | ✅ |
| STP-09 Groups setup | `docs/hrm/ui-screens/UI-HRM-PAY-STP-GROUP.md` | ✅ |
| Evidence (this file) | `docs/qa/evidence/po-hrm-pay-cntt-ui-screen-01.md` | ✅ |

**L2 formula:** documented in INDEX §2 — eval **HOLD** — hub cross-link only; no mutate screen GĐ1.

---

## 3. Trace matrix summary (STP-01..12)

| STP | Screen ID | Primary endpoint |
|-----|-----------|------------------|
| 01 | STP-POLICY-PACK | `POST/PATCH /api/hrm/payroll/pay-policy-packs` (CHUNG) |
| 02 | STP-POLICY-PACK | `POST/PATCH /pay-policy-packs` (RIENG) |
| 03–06 | STP-POLICY-PACK | `PATCH …/pay-policy-packs/:id` (`rateParams`) |
| 07 | STP-COMP-CATALOG | F-PLT-PAY-COMP-* `/salary-components*` |
| 08 | STP-COMP-CATALOG | Fragment map → POST component |
| 09 | STP-GROUP | Payroll group CRUD (cluster API) |
| 10 | STP-SHEET-TEMPLATE | `/pay-sheet-templates*` + `PUT …/lines` |
| 11 | STP-SHEET-TEMPLATE | Multi header + `businessLineTag` |
| 12 | STP-INPUT-PROFILE | `/pay-input-pack-profiles*` |
| L6 bind | STP-SHEET-TEMPLATE | `policyPackId` · `inputPackProfileId` on template PATCH |
| L6 resolve | STP-SETUP-RESOLVE | `GET /pay-setup/resolve` |

Full matrix: INDEX §4.

---

## 4. AC FE U65 coverage (per screen §7)

| AC family | Screens bound |
|-----------|---------------|
| AC-PAY-STP-01..05 | POLICY · TEMPLATE · INPUT |
| AC-PAY-STP-GLOBAL-01..03 | All mutate screens + HUB |
| AC-PAY-COMP-01 | COMP-CATALOG · TEMPLATE col picker |
| AC-PAY-TPL-01..03 | SHEET-TEMPLATE |
| AC-CNTT-SETUP-01..04 | SETUP-RESOLVE · INPUT · TEMPLATE bind |

---

## 5. must_keep verified

| Lock | Handling |
|------|----------|
| FR-UC-BP-PAY-01..09 runtime 🟢 | ADD-only Thiết lập — no REPLACE |
| FR-UC-BP-PAY-09 runtime | STP-GROUP = setup UI; cross-ref CLUSTER embed |
| Dual SoT PAY-02 | COMP-CATALOG cites pay_types picker |
| Formula eval HOLD | L2 no mutate spec |

---

## 6. Residual / not promoted

| Item | Owner | Trigger |
|------|-------|---------|
| `apps/**` implementation | dev-fe | Post `PO-HRM-PAY-CNTT-BE-01` READY_FOR_QA |
| L2 formula author screen detail | dev-fe + sa | Evaluator gate lift |
| J-* rows in `PROGRAM_JOURNEY_MAP.md` | ba-process / qa | Post FE slice |
| `PILOT_BUSINESS_FLOW_BA_TRACE.md` STP rows | ba-process | Next governance wave |
| XLSX fragment mount INV | ba-data | Pack P.CNTT mount |

---

## 7. Verification commands (docs-only)

```text
# File count
ls docs/hrm/ui-screens/UI-HRM-PAY-STP-*.md

# No apps touch
git diff --name-only -- apps/
# (expected: empty for this WI)
```

---

## 8. Handoff

| Field | Value |
|-------|--------|
| **next_owner** | `pm` → `dev-be` then `dev-fe` |
| **next_dispatch** | `PO-HRM-PAY-CNTT-BE-01` ensureSchema + CRUD (if not in-flight) → `PO-HRM-PAY-CNTT-FE-STP-01` |
| **evidence_path** | `docs/qa/evidence/po-hrm-pay-cntt-ui-screen-01.md` |
