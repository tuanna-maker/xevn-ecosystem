# Evidence — PO-UC-TC-W4-QA-IM03-AU-MEMBER-MAIN-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-IM03-AU-MEMBER-MAIN-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-04 |
| **u65_zero_seed** | true |
| **hdsd_align** | true (Import/Export NV — CH06 §5; not BH) |
| **tc_scope** | **TC-HRM-IM-03-SCOPE-AU only** |
| **persona** | `du-lich.ceo@xe.vn` / `Xevn@2026` · must_keep `ceo@xe.vn` |
| **be_handoff** | `docs/qa/evidence/po-uc-tc-w4-be-au-member-main-scope-01.md` |
| **prior_seat** | `docs/qa/evidence/po-uc-tc-w4-qa-b1-hrm-im-rollup.md` |
| **runtime_json** | `docs/qa/evidence/_tmp-po-uc-tc-w4-qa-im03-au-member-main-01.json` |
| **spec_ref** | `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE` §5 · `ADR-HRM-RBAC-SCOPE-LADDER` |
| **seat_verdict** | **PASS** |

> CẤM: seed · invent Leave L2 · claim UAT DONE. IM-01/02/04 UI_PASS **untouched** this seat.

---

## L0 + fe-be-health

| Probe | Result |
|-------|--------|
| `qc:dev-stack` hrm / xbos / portal | **200** (Windows UV close noise after PASS — health lines green) |
| `qc:fe-be-health` | **ALL PASS** |
| Seed | **không** chạy `pnpm seed:*` |

---

## Corrected AU matrix (live retest)

| Case | Request | Expect | Actual | Verdict |
|------|---------|--------|--------|---------|
| **AU-1** | Bearer member · `company_id=holding` · `x-company-id=holding` · `x-tenant-id=xe-du-lich` | **409** | **409** `SCOPE_CONTEXT_MISMATCH` · `companyId mismatches token scope` | 🟢 PASS |
| **AU-2** | Bearer member · `company_id=main` · `x-company-id=main` · `x-tenant-id=xevn` | **409** | **409** `SCOPE_CONTEXT_MISMATCH` · `tenantId mismatches token scope` | 🟢 PASS |
| **AU-3** | Bearer member · `company_id=main` · `x-company-id=main` · `x-tenant-id=xe-du-lich` | **200** · no holding leak · total ≠ group CEO | **200** `HRM-EMP-200` · **total=0** · `holdingLeak=false` · companies=[] | 🟢 PASS |
| **must_keep** | Bearer `ceo@xe.vn` · `company_id=main` · `x-tenant-id=xevn` | **200** rollup | **200** `HRM-EMP-200` · **total=59** · sample `company_id=holding` (group rollup OK) | 🟢 PASS |

### JWT claims (login 201, no secrets)

```text
du-lich.ceo@xe.vn → tenantId=xe-du-lich companyId=main roleCode=subsidiary_ceo
ceo@xe.vn         → tenantId=xevn       companyId=main roleCode=group_ceo
```

### Leak check

| Check | Result |
|-------|--------|
| Member total vs group CEO total | **0 ≠ 59** — not holding/group rollup |
| Member page items include holding/trsport/logistics | **false** |
| Rejecting own `main` with 409 | **would break** ADR §5 subsidiary bucket — **not** expected |

---

## Residual

| ID | Prior | Now | Note |
|----|-------|-----|------|
| **R-W4-B1-AU-MEMBER-MAIN-200** | OPEN → dev-be | **CLOSED** | Prior PARTIAL used wrong expect (member own `main` → 403/409). Live proves ADR-WAIVER §5: own bucket **200**; vượt scope = holding / xevn headers → **409**. |

No reopen — no holding leak proof.

---

## must_keep / untouched

| Lock | Touched? |
|------|----------|
| IM-01 / IM-02 / IM-04 UI_PASS | **no** (not re-run) |
| Group CEO `main` rollup 200 | **PASS** (total=59) |
| Leave L2 | **not invented** |
| AT-12 / CREATE-CATALOG / CI01 / BR-WF-04 | **no** |
| Phase1 / UAT DONE | **not claimed** (`uat_done: false`) |

---

## by-uc update

`docs/qa/professional/by-uc/HRM-IM-03.md`:

| Field | Before | After |
|-------|--------|-------|
| execution | UI_PARTIAL (AU false-negative) | **UI_PASS** (export HP prior + SCOPE-AU corrected matrix PASS) |
| uat_done | false | **false** |
| work_item_id | PO-UC-TC-W4-QA-B1-HRM-IM | + this seat evidence |

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-QA-IM03-AU-MEMBER-MAIN-01
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-im03-au-member-main-01.md
next_owner: pm
uat_done: false
seat_verdict: PASS
residual_closed: R-W4-B1-AU-MEMBER-MAIN-200
```

### next_dispatch_prompt

```
work_item_id: PO-UC-TC-W4-QC-IM03-AU-MEMBER-MAIN-01
from_role: pm
to_role: qc
lane: governance
ack_status_target: PASS_TO_PM
priority: P1
u65_zero_seed: true

Gate audit TC-HRM-IM-03-SCOPE-AU after QA PASS.
READ: docs/qa/evidence/po-uc-tc-w4-qa-im03-au-member-main-01.md
+ BE: docs/qa/evidence/po-uc-tc-w4-be-au-member-main-scope-01.md
Confirm: AU-1/2 → 409; AU-3 own main → 200 total=0 ≠ group 59; must_keep group CEO 200; residual R-W4-B1-AU-MEMBER-MAIN-200 CLOSED; IM-01/02/04 untouched; uat_done false.
CẤM: seed · invent Leave L2 · claim UAT DONE
```
