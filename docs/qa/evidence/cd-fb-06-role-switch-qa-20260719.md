# QA — CD-FB-06 Role / company switch (F3) — 2026-07-19

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-06-ROLE-SWITCH` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **entry** | `docs/qa/evidence/cd-fb-06-role-switch-fe-20260719.md` READY_FOR_QA |
| **spec_ref** | `docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md` §3 F3 · AC-CD-F3-01..06 · `J-HRM-INT-05` |
| **sponsor_lock** | U65 zero-seed · no Phase1/PROD claim |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-07-19 |

---

## Verdict

**PASS_TO_PM** — Browser L2 + L2.5 on `:5173` for `ceo@xe.vn` and `du-lich.ceo@xe.vn`. Chips visible (legal name + role); OU filter refetch with JWT `companyId=main` stable; member isolation (no group rollup; `holding` → **409**); **J-HRM-INT-05** 4-tab `trsport` + `holding` sweeps **0×409**. Multi-hat JWT switch **N/A** (both personas single membership in session). Residual P2 only: member role chip English (`subsidiary ceo` — missing `subsidiary_ceo` in `formatRoleCodeVi`).

**Not** Phase 1 DONE / **not** PROD-READY.

---

## Environment

| Item | Value |
|------|-------|
| L0 | `pnpm run qc:dev-stack` **exit 0** — hrm `:28001` + xbos `:28002` + portal `:5173` **200** |
| Portal | `http://localhost:5173` |
| Personas | `ceo@xe.vn` / `Xevn@2026` · `du-lich.ceo@xe.vn` / `Xevn@2026` |
| Seed | **None** (U65) |

---

## AC matrix

| AC | Expect | Evidence | Verdict |
|----|--------|----------|---------|
| **AC-CD-F3-01** | Context chips ĐVTV + role (not UUID) | Parent `hrm-embed-scope-chip-tenant` = **Tập đoàn XeVN** · role **Tổng giám đốc tập đoàn**; iframe `Ngữ cảnh` + role | **PASS** |
| **AC-CD-F3-02** | OU filter refetch + «Đang xem» | Click **Khối Vận tải X.E** → count **1107→220**; Network `GET .../employees?company_id=trsport`; banner **Đang xem: Khối Vận tải X.E**; rows `VTH-*` only | **PASS** |
| **AC-CD-F3-03** | JWT stable on embed filter | After `trsport` select: JWT `companyId=main` · `roleCode=group_ceo`; hint AC-CD-F3-03 visible | **PASS** |
| **AC-CD-F3-04** | Membership → `select-membership` JWT | `ceo@xe.vn` session: no `portal-membership-switcher` (tenants ≤1); multi-hat not present | **N/A** (single-hat) — not FAIL |
| **AC-CD-F3-05** | Member static / no group OU | `du-lich.ceo`: **no** «Đơn vị thành viên» OU filter; chips legal name member | **PASS** |
| **AC-CD-F3-06** | Member no group rollup | Count **18** (not 1107); `company_id=holding` → **409** `SCOPE_CONTEXT_MISMATCH`; codes `DL-*` / member | **PASS** |
| **J-HRM-INT-05** | 4-tab slug sweep 0×409 | Session fetch employees/contracts/insurance/attendance for `trsport` + `holding` — all **200** (`HRM-EMP/CON/ATT-200`); **count409=0** | **PASS** |

---

## Click paths (U65 browser)

### A. Group CEO — chips + OU filter

1. Session already authenticated as `ceo@xe.vn` (BOD / Command Center).
2. Navigate `http://localhost:5173/command-center/hrm/employees`.
3. **Observe** portal bar: `Ngữ cảnh HRM: Tập đoàn XeVN` · `Tổng giám đốc tập đoàn` · JWT `xevn / main`.
4. Open HRM top-level (same-origin) `http://localhost:5173/hr/employees?portal=1&tenantId=xevn&companyId=main` for Select interaction.
5. Combobox **Lọc đơn vị vận hành** → **Khối Vận tải X.E**.
6. **FE after:** banner `Đang xem: Khối Vận tải X.E`; list **220**; Network `company_id=trsport`; JWT still `main`.

### B. J-HRM-INT-05 (in-session, post-filter)

With Bearer from portal session + `x-company-id: main`:

| Slug | employees | contracts | insurance | attendance | 409? |
|------|-----------|-----------|-----------|------------|------|
| `trsport` | 200 HRM-EMP-200 | 200 HRM-CON-200 | 200 HRM-CON-200 | 200 HRM-ATT-200 | **0** |
| `holding` | 200 | 200 | 200 | 200 | **0** |

Soft-nav portal URLs employees→contracts→insurance→attendance kept scope chips + `Đang xem: Khối Vận tải X.E` (filter sessionStorage).

### C. Member CEO — isolation

1. Clear storage → login `du-lich.ceo@xe.vn` → `/command-center/hrm/employees`.
2. Chips: **Công ty TNHH Du lịch X.E Việt Nam** · JWT `xe-du-lich / main · Công ty thành viên`.
3. List **18** NV; no OU rollup filter.
4. Probe `GET /api/hrm/employees?company_id=holding` → **409** `SCOPE_CONTEXT_MISMATCH`.

---

## Residual

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| **R-CD-FB-06-01** | P2 | Role chip member shows `subsidiary ceo` (fallback) — map `subsidiary_ceo` → VI in `scopeRoleLabels.ts` (key exists as `member_ceo` only) | optional `dev-fe` |
| **R-CD-FB-06-02** | Info | AC-CD-F3-04 multi-hat JWT switch not exercised — no ≥2 memberships on pilot personas | defer until multi-hat persona available (no seed) |

---

## completion_report

Closed CD-FB-06 QA: AC-CD-F3-01..03 + 05..06 **PASS**; AC-CD-F3-04 **N/A** single-hat; **J-HRM-INT-05 PASS**. Residual = P2 VI label for `subsidiary_ceo` + multi-hat defer. No seed. No Phase1/PROD claim.

## next_owner

pm

## next_dispatch_prompt

```text
work_item_id: CD-FB-06-ROLE-SWITCH
from_role: pm
to_role: qc
entry_criteria: docs/qa/evidence/cd-fb-06-role-switch-qa-20260719.md PASS_TO_PM; AC-CD-F3-01..06 + J-HRM-INT-05
exit_criteria: QC GO/GWC; optional note R-CD-FB-06-01 P2 label; do not claim Phase1/PROD
evidence_path: docs/qa/evidence/cd-fb-06-role-switch-qc-20260719.md
ack_status: PASS_TO_PM
cấm: seed · reopen AC already PASS without regression
```

Optional parallel (non-blocking):

```text
work_item_id: CD-FB-06-ROLE-LABEL-VI
from_role: pm
to_role: dev-fe
entry: R-CD-FB-06-01 — add subsidiary_ceo → «TGĐ công ty thành viên» in scopeRoleLabels.ts + vitest
exit: READY_FOR_QA smoke chip VI on du-lich.ceo
evidence: docs/qa/evidence/cd-fb-06-role-label-vi-fe-20260719.md
```

**ack_status:** **PASS_TO_PM**
