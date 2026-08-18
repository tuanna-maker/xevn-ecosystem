# QA-UX-PERMISSION-FALLBACK-01 — PermissionFallback Wave B browser retest

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-UX-PERMISSION-FALLBACK-01` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-07-28 |
| **dev_handoff** | `docs/qa/evidence/d-ux-permission-fallback-fe-01-20260728.md` (**READY_FOR_QA**) |
| **ack_status** | **PASS_TO_PM** |
| **locks** | U65 zero-seed · HOLD_DEPLOY · browser-only · no seed · no deploy · portal bypass kept |
| **Account** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Host** | `http://127.0.0.1:5173` (+ HRM `:8080` deny attempt) |
| **Runtime** | `docs/qa/evidence/_tmp-qa-ux-permission-fallback-01-runtime.json` |
| **Console log** | `docs/qa/evidence/_tmp-qa-ux-permission-fallback-01-console.txt` |
| **Script** | `scripts/qa/qa-ux-permission-fallback-01-browser.mjs` |
| **Screens** | `docs/qa/evidence/screens/qa-ux-permission-fallback-01/` |
| **Journey** | **J-HRM-01** list→profile · UX-07 PermissionFallback |
| **spec_ref** | `docs/program/UX-UI-ERP-ANALYSIS.md` § PermissionFallback / Wave B · UX-07 |

---

## Spec / DoD

| AC | Result |
|----|--------|
| Salary + insurance + financial cards + CMND — no silent null (PermissionFallback wiring / testids) | **PASS** — 5× `view_salary` gates → `PermissionFallback`; 0 `fallback={null}`; CMND `variant="compact"`; SoT VI+mailto+testids |
| Browser ceo@xe.vn portal: salary non-blank (bypass OK) | **PASS** — salary tab content visible; `blankRoot=false`; `fallback` not shown (bypass by design) |
| General financial + insurance + CMND non-blank under CEO | **PASS** — all three card groups present; `fallbackCount=0` |
| Optional standalone deny → permission-fallback + «Liên hệ HR» mailto | **BLOCKED-ENV** — keep **R-C2-01 P3** (portal JWT bypass; cấm remove bypass) |
| must_keep Profile C2 groups | **PASS** |
| must_keep Payroll D5 Zod | **PASS** — 3 VI FormMessage |
| must_keep P0-c Advance cancel-reopen | **PASS** — reopen inputs `["","Tháng 7/2026"]` no stale |
| must_keep Clock-In C1 | **PASS** |
| Seed / deploy | **None** |

---

## L0 / unit (supporting)

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM/XBOS/portal **200** (UV close flake after report — non-blocking) |
| `pnpm run qc:fe-be-health` | **ALL PASS** exit 0 |
| vitest `PermissionFallback` + `PermissionGate` | **10/10 PASS** |
| Seed | **None** (U65) |

---

## Browser execution (U65)

### Click path

```text
login ceo@xe.vn (portal JWT inject)
 → /hr/employees?portal=1&tenantId=xevn&companyId=main
 → row click → /hr/employees/dbdbece0-6572-401a-b4eb-56781493a75f (J-HRM-01)
 → Core: Thông tin chung — financial + insurance + CMND visible (non-blank)
 → Core: Lương — salaryish content (bypass; not silent null)
 → Group Nhân sự → Bảo hiểm — non-blank
 → deny attempt: bare HRM :8080 + portal URL without portal QS → no deny DOM (BLOCKED-ENV)
 → must_keep: Clock-In wizard · D5 Zod Add · Advance Hủy→reopen
```

### UF / J-* results

| UF-ID | Verdict | Evidence |
|-------|---------|----------|
| UF-PF-source-wiring | 🟢 | fallbackCount=5 · silentNull=false · compact · SoT · bypassKept |
| J-HRM-list | 🟢 | employees list loaded |
| J-HRM-01-detail | 🟢 | profile id=`dbdbece0-…` |
| UF-PF-general-cards-ceo | 🟢 | financial+insurance+cmnd; blank=false |
| UF-PF-salary-ceo-nonblank | 🟢 | hasSalaryish; blankRoot=false |
| UF-PF-insurance-ceo-nonblank | 🟢 | panel non-blank |
| UF-PF-deny-live | 🟡 BLOCKED-ENV | keep R-C2-01 P3; live=null |
| must_keep-C2-groups | 🟢 | Core + HR/Career/Personal |
| must_keep-C1-clock-in | 🟢 | wizard + method/manual |
| must_keep-payroll-mount | 🟢 | rootLen=3017290 |
| must_keep-D5-zod-add | 🟢 | 3 VI msgs |
| must_keep-P0c-advance-cancel-reopen | 🟢 | no `QA_PF_ADV_STALE` |
| console-no-TypeError | 🟢 | count=0 |
| **UF-PF-overall** | 🟢 | hardFails=[] |

Screens: `01-employees-list` … `09-advance-reopen`

### Runtime truth

```json
{
  "verdict": "PASS",
  "hardFails": [],
  "residual": { "R-C2-01": "P3 KEEP — deny persona BLOCKED-ENV (portal bypass)" }
}
```

---

## Residual

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| **R-C2-01** | **P3** | Live deny DOM + mailto CTA not exercised under portal JWT / `shouldBypassHrmPermissionGate` (by design; GWC-HRM-REC-UF12-01). Unit + source wiring + CEO non-blank close UX-07 product AC. Optional close only with non-portal deny persona. **Do not remove bypass.** | pm / ba (optional) |
| R-C2-02 | Info | Other locales (zh/my/lo/km) still defaultValue until i18n sweep | defer |

**not promoted:** deploy · seed · EmptyState Wave B sibling · remove portal bypass

---

## completion_report

Closed **QA-UX-PERMISSION-FALLBACK-01**: browser U65 Wave B PermissionFallback — source wiring 5 gates + SoT VI/mailto/testids (no silent null / compact CMND); CEO portal salary + financial/insurance/CMND non-blank; deny path **BLOCKED-ENV** → keep **R-C2-01 P3**; must_keep C2 groups · Clock-In · D5 Zod · P0-c Advance cancel-reopen all PASS; vitest 10/10; fe-be-health PASS; hardFails=[]. HOLD_DEPLOY · U65 · no seed.

## next_owner

pm → qc (optional gate) or next UX residual

## next_dispatch_prompt

```text
work_item_id: QC-UX-PERMISSION-FALLBACK-01
from_role: pm
to_role: qc
lane: governance
residual_auto_fix: true
entry_criteria: QA-UX-PERMISSION-FALLBACK-01 PASS_TO_PM @ docs/qa/evidence/qa-ux-permission-fallback-01-20260728.md
read_first:
  - docs/qa/evidence/qa-ux-permission-fallback-01-20260728.md
  - docs/qa/evidence/_tmp-qa-ux-permission-fallback-01-runtime.json (hardFails must be [])
  - docs/qa/evidence/d-ux-permission-fallback-fe-01-20260728.md
locks: U65 zero-seed · HOLD_DEPLOY · cấm seed · cấm remove portal bypass
scope:
  - Audit browser evidence UX-07 wiring + CEO non-blank + must_keep C2/D5/P0-c/Clock-In
  - Accept R-C2-01 P3 KEEP if deny BLOCKED-ENV (do not NO-GO solely for missing deny DOM under portal bypass)
  - Runtime truth over MD if conflict
exit_criteria: GO or GWC with R-C2-01 P3 listed; evidence docs/qa/evidence/qc-ux-permission-fallback-01-20260728.md
cấm: seed · deploy · Phase1/PROD DONE claim
```

## ack_status

**PASS_TO_PM**
