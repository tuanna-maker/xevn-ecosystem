# Evidence — PO-ECO-TC-HRM-INSURANCE-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-ECO-TC-HRM-INSURANCE-01` |
| **role** | qa |
| **date** | 2026-08-03 |
| **deliverable** | `docs/qa/testcases/hrm-web/HRM-INSURANCE.md` |
| **ack_status** | `READY_FOR_SYNTH` |

## Summary counts (inventory)

| Artifact | Count | Notes |
|----------|------:|-------|
| Pages / embed | 1 + P-CC-05 | `Insurance.tsx` · `HrmWorkspacePanel` insurance view |
| Sections (policy/summary/filters/alert) | 4 | E3 master panel on-page |
| Dialogs / confirms | 4 + 2 | Add/Edit/View/Import · single+bulk delete |
| **Fields (dictionary rows)** | **62** | list · filters · DLG participant · policy master · import · view · CC embed |
| **Functions (inventory rows)** | **39** | 18 read/nav · 21 mutate |
| **Test cases (matrix rows)** | **87** | PLANNED — **no U65 execution this wave** |

## Coverage gate (pack self-check)

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions với ≥1 HP | 39 | 39 | 0 |
| Functions mutate với ≥1 FD | 21 | 21 | 0 |
| Required fields với ≥1 FD/BD | 8 | 8 | 0 |
| Dialogs với ≥1 open/cancel/submit TC | 6 | 6 | 0 |

## HDSD / U76

| Item | Path |
|------|------|
| Menu inventory | **MENU-04** · UF-HRM-04 · UF-HRM-MENU-04 |
| General HR HDSD | `docs/client-delivery/03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md` §4 |
| Mutate chain (policy → enroll) | `docs/qa/evidence/qa-hdsd-bf-03-bh-ret-01-20260801.md` · `d-hdsd-bf-03-bh-fe-picker-01-20260801.md` |
| SPEC_GAP | Chưa có HDSD leaf riêng «Bảo hiểm» — TC ghi menu label + URL `/hr/insurance` |

## Residual / OOS

| ID | Item | Status |
|----|------|--------|
| OOS-BHXH-GATE | Cổng BHXH điện tử / TNCN | SRS §16.6 out GĐ1 |
| XREF-EMP-INS | Profile tab BHXH | Pack **HRM-EMPLOYEES** · TC-INS-PROF-X-001 spot only |
| SPEC_GAP-BHTN-COL | BHTN không cột list (có export) | Ghi §6 pack |

## Sources read (read_first)

- `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` §2
- `docs/qa/testcases/_TEMPLATE_MENU_TC_PACK.md`
- `docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md` (HRM-INSURANCE · MENU-04)
- `apps/web/hrm/src/pages/Insurance.tsx`
- `apps/web/hrm/src/components/insurance/*` · `hooks/useInsuranceList.ts`
- `docs/hrm/SRS.md` UC-HRM-25 · §16.6 E3 INS · delta `BA_ERP_E3_SRS_01_20260728.md`
- `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` UF-HRM-04 · UF-HRM-MENU-04
- `docs/program/PROGRAM_JOURNEY_MAP.md` J-HRM-04 · J-HRM-INS-E3-01

## Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-hrm-insurance-01.md
next_owner: qa-synth
counts: screens=13 fields=62 functions=39 tcs=87
completion_report: World-standard menu TC pack HRM Insurance delivered — full screen/field/function inventories + 87 PLANNED TCs (HP/FD/BD/AU/UX); HDSD U76 traced; zero pack coverage GAP; no apps/** · no seed · not UAT DONE.
next_dispatch_prompt: qa-synth — Merge `TC-INS-*` into ecosystem rollup `docs/qa/reports/PO_SPEC_TEST_REPORT.md` § depth; dedupe vs HRM-EMPLOYEES profile insurance TCs; update roster row HRM-INSURANCE status READY_FOR_SYNTH; flag J-HRM-04 + J-HRM-INS-E3-01 for cross-menu synth trace.
```
