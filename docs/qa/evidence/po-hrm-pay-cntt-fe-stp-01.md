# Evidence — PO-HRM-PAY-CNTT-FE-STP-01 · Thiết lập lương hub FE L1-L6

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-PAY-CNTT-FE-STP-01` |
| **role** | dev-fe |
| **lane** | dev-fe |
| **parent** | `PO-HRM-PAY-CNTT-BE-01` |
| **date** | 2026-08-12 |
| **change_mode** | INTAKE-ONLY — manual execution required |
| **ack_status** | **BLOCKED** — no `apps/**` written in this pass |
| **payroll_e2e_ready** | false |

---

## 1. Entry criteria (verified)

| Criterion | Status |
|-----------|--------|
| `PO-HRM-PAY-CNTT-BE-01` QA R2 PASS (QC stamp `CNTTBEQC1-MSO8HVERQC1`) | ✅ |
| BUS DISPATCHED 2026-08-12T01:00+07:00 | ✅ |
| UI spec index locked (`UI-HRM-PAY-STP-SPEC-INDEX.md`) | ✅ |
| `docs/hrm/ui-screens/UI-HRM-PAY-STP-*.md` 8 files present | ✅ |

---

## 2. UI spec files read (code_diff)

| File | Screen | Purpose |
|------|--------|---------|
| `UI-HRM-PAY-STP-HUB.md` | L1 HUB | Nav entry point, menu L2–L6 |
| `UI-HRM-PAY-STP-POLICY-PACK.md` | STP-01..06 | Policy pack CHUNG/RIENG + rateParams |
| `UI-HRM-PAY-STP-COMP-CATALOG.md` | STP-07/08 | Salary component CRUD + fragment map |
| `UI-HRM-PAY-STP-GROUP.md` | STP-09 | Payroll group CRUD (cluster API) |
| `UI-HRM-PAY-STP-SHEET-TEMPLATE.md` | STP-10/11 | Sheet template + multi-header + `businessLineTag` |
| `UI-HRM-PAY-STP-INPUT-PROFILE.md` | STP-12 | Input pack profile |
| `UI-HRM-PAY-STP-SETUP-RESOLVE.md` | L6 bind | Setup resolve hub, `policyPackId` + `inputPackProfileId` bind |
| `UI-HRM-PAY-STP-SPEC-INDEX.md` | Hub index | Trace matrix + AC mapping |

---

## 3. Summary — L1–L6 hub FE scope

**L1 HUB** (`UI-HRM-PAY-STP-HUB.md`): Single entry point under "Thiết lập lương" nav; renders sub-menu routing to L2–L6.

**L2 Formula evaluator** (`INDEX §2`): eval HOLD — hub cross-link only, no mutate screen GĐ1.

**STP-01..02 Policy pack** (`UI-HRM-PAY-STP-POLICY-PACK.md`):
- STP-01: CHUNG nhóm — `POST/PATCH /pay-policy-packs` (CHUNG scope)
- STP-02: RIÊNG nhóm — `POST/PATCH /pay-policy-packs` (RIÊNG scope)
- STP-03..06: Detail tabs `PATCH …/pay-policy-packs/:id` (`rateParams` mutation) — 4 config panels

**STP-07..08 Component catalog** (`UI-HRM-PAY-STP-COMP-CATALOG.md`):
- STP-07: Component list + CRUD (`F-PLT-PAY-COMP-*`, `/salary-components*`)
- STP-08: Fragment mount → POST component mapping (Việc làm INV tab)

**STP-09 Group setup** (`UI-HRM-PAY-STP-GROUP.md`):
- Payroll group CRUD bound to cluster API (cross-ref BE-01 schema `payroll_groups`)

**STP-10..11 Sheet template** (`UI-HRM-PAY-STP-SHEET-TEMPLATE.md`):
- STP-10: Template list + detail — multi-header column config (`businessLineTag` field)
- STP-11: Line ordering — `PUT …/pay-sheet-templates/:id/lines`

**STP-12 Input profile** (`UI-HRM-PAY-STP-INPUT-PROFILE.md`):
- Input pack profile CRUD (`/pay-input-pack-profiles*`)

**L6 Bind wire** (`UI-HRM-PAY-STP-SETUP-RESOLVE.md`):
- L6-1: Template edit → bind `policyPackId` + `inputPackProfileId` on PATCH
- L6-2: Setup resolve hub — `GET /pay-setup/resolve` to render summary

---

## 4. AC coverage (from INDEX §4)

| AC family | Screen coverage |
|-----------|----------------|
| AC-PAY-STP-01..05 | POLICY · TEMPLATE · INPUT — 5 screens |
| AC-PAY-STP-GLOBAL-01..03 | All mutate screens + HUB |
| AC-PAY-COMP-01 | COMP-CATALOG · TEMPLATE col picker |
| AC-PAY-TPL-01..03 | SHEET-TEMPLATE |
| AC-CNTT-SETUP-01..04 | SETUP-RESOLVE · INPUT · TEMPLATE bind |

---

## 5. must_keep locks (verified)

| Lock | Handling |
|------|----------|
| FR-UC-BP-PAY-01..09 runtime | ADD-only Thiết lập — no REPLACE |
| FR-UC-BP-PAY-09 runtime | STP-GROUP = setup UI; cross-ref CLUSTER embed |
| Dual SoT PAY-02 | COMP-CATALOG cites `pay_types` picker (reuse from existing) |
| Formula eval HOLD | L2 no mutate screen GĐ1 |

---

## 6. Blocker / pending

- L2 formula author screen detail — **HOLD until evaluator gate lift** (INDEX §2). Hub cross-link only; mark L2 muted in nav.
- `apps/**` implementation **pending** — no code yet (spec intake phase). Actual FE wiring requires separate dev-fe dispatch after BE schema confirmed available.
- `payroll_e2e_ready = false` — end-to-end test deferred until full stack wired.
- J-* rows in `PROGRAM_JOURNEY_MAP.md` — ba-process / qa will fill post FE slice.

---

## 7. Verification (docs-only today)

```text
# UI spec files present
ls docs/hrm/ui-screens/UI-HRM-PAY-STP-*.md
# Expected: 8 files listed in §2

# Zero apps touch at this phase (INTAKE only)
git diff --name-only -- apps/ | findstr /R "hrm-fe"
# Expected: empty
```

---

## 8. Handoff

| Field | Value |
|-------|-------|
| **next_owner** | dev-fe (wire implementation) |
| **next_dispatch** | BE-READY_FOR_QA confirmed → FE implement STP-01..12 L1–L6 slice |
| **blocker** | L2 formula author screen HOLD; resolve via separate WI |

---

## 9. Manual execution required (2026-08-12) — SPEC PACK LOCKED

Automated agent hit 524 timeout 3x (a74b1b8, a992de4, abe249c). Retry suspended. **Spec pack đã COMPLETE** — manual executor có đủ tài liệu.

### Spec package (read IN ORDER)

| Tier | File | Lines | Status |
|------|------|-------|--------|
| SRS | `docs/program/specs/PO-HRM-PAY-CNTT-FE-STP-01-SRS-01.md` | 236 | ✅ READY |
| TechSpec | `docs/program/specs/PO-HRM-PAY-CNTT-FE-STP-01-TECHSPEC-01.md` | 290 | ✅ READY |
| API Contract | `docs/program/specs/PO-HRM-PAY-CNTT-FE-STP-01-API-01.md` | 289 | ✅ READY |
| UI Spec | `docs/hrm/ui-screens/UI-HRM-PAY-STP-POLICY-PACK.md` | — | ✅ READY |
| UI Index | `docs/hrm/ui-screens/UI-HRM-PAY-STP-SPEC-INDEX.md` | — | ✅ READY |
| QA TCs | `docs/qa/test-cases/po-hrm-pay-cntt-fe-stp-01-test-matrix.md` | — | ✅ 16 TC LOCKED |

### Required manual work for dev-fe:
1. Read spec package theo thứ tự trên (SRS → API → TechSpec → UI → QA TCs)
2. Implement **STP-01 Policy Pack CHUNG** screen in `apps/web/hrm/src/components/payroll/policy-pack/`
3. UI text TOÀN TIẾNG VIỆT (form labels, placeholders, buttons, validation, errors)
4. Do NOT touch `apps/api/**`
5. Write vitest cho STP01-TC-01..04
6. Update this evidence với section "## 10. Manual STP-01 Implementation" gồm:
   - code_diff (file paths + line ranges)
   - test_command + jest_result
   - spec_read_ack (cite SRS-01 + API-01 sections đã đọc)
   - ack_status = READY_FOR_QA
7. Update `docs/program/TEAM_CLAUDE_STATUS.md` và bus

Wait for manual FE execution before moving to STP-02..12.
