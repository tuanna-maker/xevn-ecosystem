# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | execution — **inventory only** (no mutate UAT invent) |
| **priority** | P0 |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **program_sot** | [`docs/program/PO_HRM_PAYROLL_FORMULA_AND_RUN_GAP_01.md`](../../program/PO_HRM_PAYROLL_FORMULA_AND_RUN_GAP_01.md) |
| **ack_status** | **`PASS_TO_PM`** |
| **verdict** | **INVENTORY COMPLETE** — gaps honest; **no** module UAT claim |
| **U65** | zero-seed · probe ≠ UF · cấm invent `payroll_e2e_ready` |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | Program / customer-ready. Historical **narrow** `true` on ATT-CLOSE QA-03/QC (AC-PAY-HIRE-04∧05 enroll only) is **slice seal ≠** formula+run customer-ready — **not promoted** here. |
| **Payroll module UAT** | **DENIED** | No `PO-UAT-PAY*` evidence exists (2026-08-07). |
| **Formula product fidelity** | **NOT_READY** | F-PAY-FORMULA-* author/publish **HOLD**; no browser UF for author/preview/evaluate. |
| **Phase 1 DONE / product GO** | **DENIED** | Out of scope. |
| Seed / fake DB | **DENIED** | Inventory read-only + L0 spot. |

---

## L0 stack note (spot-check 2026-08-07)

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM `:28001` **200** · XBOS `:28002` **200** · portal `:5173` **200** |
| Node exit | Windows `UV_HANDLE_CLOSING` assert after healthy print — **treat health rows as PASS**; not used as UF evidence |

**No** browser mutate run this seat. L0 ≠ UF PASS.

---

## Matrix — payroll QA/QC evidence inventory

| Area | Evidence path | Verdict | UF browser? | Blocks customer-ready? | Owner hint |
|------|---------------|---------|-------------|------------------------|------------|
| **Formula author / publish / preview** | [`po-hrm-bp-adr-q-pay-formula-01.md`](po-hrm-bp-adr-q-pay-formula-01.md) (ADR Option A only) · [`po-hrm-bp-synth-pay-tech-01.md`](po-hrm-bp-synth-pay-tech-01.md) / [`po-hrm-bp-synth-pay-api-01.md`](po-hrm-bp-synth-pay-api-01.md) (F-PAY-FORMULA **HOLD**) · [`po-hrm-bp-synth-pay-db-01.md`](po-hrm-bp-synth-pay-db-01.md) (`pay_formula_*` DRAFT opaque) | **UNTESTED** (product) · governance only | **No** | **Yes — P0** | sa unlock → ba-docs FR → **dev-be/fe** GĐ1 form |
| **Formula evaluate on period process** | No dedicated QA/QC UF · ATT-412 notes Gross/Net **0 ₫** OBS ([`po-hrm-e2e-link-pay-att-412-qa-01.md`](po-hrm-e2e-link-pay-att-412-qa-01.md) · [`…-qc-01.md`](po-hrm-e2e-link-pay-att-412-qc-01.md)) · brand P18 FormulaInput = chrome validate-only ([`po-hrm-ui-brand-w4-pay-a.md`](po-hrm-ui-brand-w4-pay-a.md)) | **UNTESTED** / product **FAIL fidelity** (process without proven engine bind) | **No** (0₫ OBS only) | **Yes — P0** | **dev-be** engine bind + **qa** browser after unlock |
| **Create payroll period / batch (Lập bảng lương)** | [`po-hrm-e2e-link-pay-hire-qa-05.md`](po-hrm-e2e-link-pay-hire-qa-05.md) PASS · QC GWC [`…-hire-qc-01.md`](po-hrm-e2e-link-pay-hire-qc-01.md) / R2 [`…-qc-01-r2.md`](po-hrm-e2e-link-pay-hire-qc-01-r2.md) · FE-04 month Select + auto detail | **PASS (slice)** | **Yes** (create→detail) | **No** alone (spine OK; not formula) | retain; retest after formula wave |
| **Eligibility + enroll after closed sheet** | Chain: J-06c [`…-att-close-qa-02.md`](po-hrm-e2e-link-pay-att-close-qa-02.md) → enroll [`…-att-close-qa-03.md`](po-hrm-e2e-link-pay-att-close-qa-03.md) → QC GWC [`…-att-close-qc-01.md`](po-hrm-e2e-link-pay-att-close-qc-01.md) · prior hire WAIVE until close [`…-hire-qa-05.md`](po-hrm-e2e-link-pay-hire-qa-05.md) | **PASS (slice)** AC-PAY-HIRE-04/05 · `C-SLICE-≠-MODULE` | **Yes** (Path A deep-link) | **Partial** — enroll OK; **≠** customer formula-ready | retain seal; Path B soft OBS open |
| **ATT close precondition (J-HRM-06c)** | Pay chain QA-02 PASS · full mutate [`po-uat-att-j06c-full-01.md`](po-uat-att-j06c-full-01.md) PASS · QC GWC att-close retained | **PASS** (ATT slice; `attendance_uat_ready=false`) | **Yes** | **No** for enroll gate (closed) | att module UAT still DENIED separately |
| **Process → payslip lines / components** | Process/close browser PASS [`…-att-412-qa-01.md`](po-hrm-e2e-link-pay-att-412-qa-01.md) · QC GWC [`…-att-412-qc-01.md`](po-hrm-e2e-link-pay-att-412-qc-01.md) · **lines/components from formula: UNTESTED** · amounts **0 ₫** OBS | **PARTIAL** — lifecycle PASS · **component/formula lines FAIL/UNTESTED** | **Yes** process; **No** line-level AC | **Yes — P0** | **dev-be** + **qa** (payslip line AC) |
| **Soft OBS / mock payroll overview** | Brand PAY-A/B chrome [`po-hrm-ui-brand-w4-pay-a-qa.md`](po-hrm-ui-brand-w4-pay-a-qa.md) · [`…-pay-b-qa.md`](po-hrm-ui-brand-w4-pay-b-qa.md) · QC [`…-pay-b-qc-01.md`](po-hrm-ui-brand-w4-pay-b-qc-01.md) mutates=**0** · TC catalog only [`po-eco-tc-hrm-payroll-01.md`](po-eco-tc-hrm-payroll-01.md) (no browser UAT) · density H17/H18 2026-06 (seed-era fidelity, **≠** U65 UF) | **PASS chrome / slice-only** · soft OBS (Q5 live-payslips branch, P17 approve, Path B) | **Chrome yes** · mutate **no** | **No** for brand; **Yes** if mistaken for UAT | do not promote as payroll UAT |
| **Print payslip** | PAY-A Q7 **source-floor** only — dialog **not opened** U65 ([`po-hrm-ui-brand-w4-pay-a-qa.md`](po-hrm-ui-brand-w4-pay-a-qa.md)) · FE remaster [`…-pay-a.md`](po-hrm-ui-brand-w4-pay-a.md) | **UNTESTED** browser print · OBS | **No** (open print) | **Yes — P1/P2** print path | **qa** after printable row exists U65 |

---

## UF / Journey / Matrix cross-walk

| Artifact | What it says | Inventory reading |
|----------|--------------|-------------------|
| `USER_FLOW_OPERABILITY_MATRIX` **UF-HRM-06** | 🟢 Dev8088 R4 — payroll **onboarding shell** | **Shell/load ≠** formula author · lập bảng end-to-end · process lines. **Do not** treat as formula/run UAT. |
| **UF-HRM-MENU-08** | 🟢 load `/payroll`, no `hrm-api` label | L2 load only. |
| `PROGRAM_JOURNEY_MAP` **J-HRM-07** | ✅ PASS W5B L2.5 + H1–H7 2026-06 | List→payslip detail historical; **≠** Q-PAY-FORMULA engine · **≠** PO-UAT-PAY. |
| **J-HRM-06c** | ✅ PASS pay-att-close + full UAT-ATT | Precondition for enroll — **closed** for hire link; still ≠ payroll module UAT. |
| **PO-UAT-PAY\*** | *(none found)* | Confirms program §2: 08-07 UAT waves skipped PAY formula/run. |

---

## Evidence corpus index (grep 2026-08-07)

### Hire → enroll → process (execution)

| Path | Role verdict (latest useful) |
|------|------------------------------|
| `po-hrm-e2e-link-pay-hire-qa-01`…`qa-04` | FAIL chain (404 / crash / scope) — superseded by QA-05 |
| `po-hrm-e2e-link-pay-hire-qa-05` | PASS_TO_PM · AC-04/05 **WAIVED-U65** · `payroll_e2e_ready=false` |
| `po-hrm-e2e-link-pay-hire-qc-01` + `-r2` | GWC slice · ELIG-UI CLOSED on R2 · ready **false** |
| `po-hrm-e2e-link-pay-att-close-01` → `qa-02` FAIL nav → `qa-03` PASS enroll | Enroll F5 PASS |
| `po-hrm-e2e-link-pay-att-close-qc-01` | GWC · narrow ready **true** (AC-04∧05 only) · module DENIED |
| `po-hrm-e2e-link-pay-att-412-qa-01` + `qc-01` | Process 201 + close OBS · **0 ₫** OBS · residual ATT-412 **CLOSED** |

### Formula / blueprint (governance — not UF)

| Path | Note |
|------|------|
| `po-hrm-bp-adr-q-pay-formula-01` | Option A ADR — **no apps/** |
| `po-hrm-bp-synth-pay-{tech,api,db}-01` | F-PAY-FORMULA **HOLD** · DRAFT DB |
| `po-hrm-e2e-link-pay-cfg-docs-01` / `pay-enroll-docs-01` / hire tech+db | Spec spine hire — not formula runtime |

### Brand / soft OBS / catalog

| Path | Note |
|------|------|
| `po-hrm-ui-brand-w4-pay-a*` / `pay-b*` | Chrome GWC · **mutates=0** · P18 formula GĐ2 **OUT** · print Q7 OBS |
| `po-eco-tc-hrm-payroll-01` | TC **catalog** READY_FOR_SYNTH — **explicit no browser UAT** |
| `p1-hrm-h17` / `h18` payslip density 2026-06 | Fidelity density — **seed-era**; not U65 formula UF |
| `r-dash-payroll-chart-*` | Dashboard chart — out of formula/run spine |

### ATT peer (precondition only)

| Path | Note |
|------|------|
| `po-uat-att-j06c-full-01` (+ qc) | Full sign→Chốt PASS · **≠** payroll UAT |

---

## Ranked P0 residuals (program honesty)

| Rank | Residual ID | Why | Blocks |
|------|-------------|-----|--------|
| **1** | **R-PAY-FORMULA-AUTHOR-UNTESTED** | No FE/BE UF for soạn → phát hành → preview; API F-PAY-FORMULA **HOLD** | Customer config without fork |
| **2** | **R-PAY-FORMULA-EVAL-ON-PROCESS** | Process/close proven; payslip **Gross/Net 0 ₫**; no component/line bind from published formula | Customer-ready run |
| **3** | **R-PAY-MODULE-UAT-MISSING** | No `PO-UAT-PAY` pack; UF-HRM-06 🟢 = shell; J-HRM-07 ≠ formula | Module seal |
| P1 | **R-PAY-PRINT-UF-UNTESTED** | PayslipPrintDialog source-floor only | Print path |
| Soft | Path B list nav · P17 advance approve · Q5 batches testid branch | Documented OBS | Not P0 formula |

**Supersession note:** Do **not** set program `payroll_e2e_ready=true` from ATT-CLOSE/ATT-412 narrow seals. Those prove **enroll + Khóa lifecycle** under U65 after ATT close — **not** Q-PAY-FORMULA / FR-UC-BP-PAY-02 runtime.

---

## completion_report

### Closed (this seat)

- Honest inventory of payroll-related QA/QC evidence across formula · lập bảng · enroll · ATT close · process/close · payslip · brand soft OBS · print.
- Cross-walk UF-HRM-06 / J-HRM-07 / J-HRM-06c vs product gaps.
- L0 spot: HRM+XBOS+portal 200.
- **`payroll_e2e_ready=false`** locked for program.
- No seed · no invented module UAT · no UF PASS claimed without browser mutate for open formula areas.

### Residual (open)

- P0 formula author/publish/preview **UNTESTED**.
- P0 formula evaluate → payslip component lines **UNTESTED** (0 ₫ OBS after process).
- P0 module UAT pack **missing**.
- P1 print payslip browser **UNTESTED**.

### Explicit non-claims

- Not `payroll_e2e_ready=true`.
- Not payroll / formula module UAT-ready.
- Not Phase 1 DONE.
- MergeToken / CTR platform GWC ≠ lương.

---

## next_owner

**pm** (dispatch W0 peers / W1 unlock — then Dev+QA)

## next_dispatch_prompt (top 3 — copy-ready)

### 1 — P0 BA gap matrix (if W0 BA not closed)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BA-01
from_role: pm
to_role: ba-process
lane: governance
priority: P0
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01

## Mission
Ma trận gap FR-UC-BP-PAY-02 (formula 7 mục) + FR-UC-BP-PAY-06 (hire/enroll) vs code vs QA inventory.
Cite: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-01.md — Formula author/evaluate = UNTESTED; enroll+process lifecycle = slice PASS; payslip lines 0₫ OBS.

## read_first
1. docs/program/PO_HRM_PAYROLL_FORMULA_AND_RUN_GAP_01.md
2. docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-01.md
3. DECISION_PACKET_Q_PAY_FORMULA / ADR 4-pillar §10 Option A
4. docs/qa/evidence/po-hrm-bp-adr-q-pay-formula-01.md

## Exit
- AC còn mở ranked P0; PASS_TO_PM
- cấm: apps/** · claim payroll_e2e_ready · invent UAT
evidence_path: docs/qa/evidence/po-hrm-payroll-formula-run-gap-ba-01.md
```

### 2 — P0 SA unlock path (formula + PAY platform)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-SA-01
from_role: pm
to_role: sa
lane: governance
priority: P0
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01

## Mission
Unlock path F-PAY-FORMULA-* author/publish/preview/evaluate + platform PAY vertical (salary_components) vs Option A.
QA inventory: product UNTESTED; HOLD remains; process 201 with 0₫ lines = fidelity gap.

## read_first
1. docs/program/PO_HRM_PAYROLL_FORMULA_AND_RUN_GAP_01.md
2. docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-01.md
3. docs/architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md (PAY vertical)
4. po-hrm-bp-synth-pay-api-01 / tech-01 HOLD notes

## Exit
- Decision packet: what unlocks Dev GĐ1 form; API/DB F.1 gaps; PASS_TO_PM
- cấm: apps/** · claim customer-ready
evidence_path: docs/qa/evidence/po-hrm-payroll-formula-run-gap-sa-01.md
```

### 3 — P0 after unlock: formula evaluate + payslip lines (execution)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-EVAL-BE-01
from_role: pm
to_role: dev-be
lane: execution
priority: P0
entry_criteria: SA/BA W0 unlock + TechSpec/API F-PAY-FORMULA not HOLD for GĐ1 scope
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01

## Mission
Bind published formula metadata on period process → payslip lines/components non-stub.
Must_keep: U65 no seed; no FE net calc; ATT closed sheet vars only (Q-PAY-F-3); hire enroll seals AC-04/05.

## read_first
1. docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-01.md (R-PAY-FORMULA-EVAL-ON-PROCESS)
2. docs/qa/evidence/po-hrm-e2e-link-pay-att-412-qa-01.md (0₫ OBS)
3. SRS FR-UC-BP-PAY-02 + unlocked API_DESIGN F-PAY-FORMULA-*

## Exit
- READY_FOR_QA with jest + contract notes
- evidence: docs/qa/evidence/po-hrm-payroll-formula-eval-be-01.md
- cấm: payroll_e2e_ready=true; FE formula invent
forbidden_paths: apps/web/** (except display-ready fields if SA says)

After READY_FOR_QA → Task qa:
work_item_id: PO-HRM-PAYROLL-FORMULA-EVAL-QA-01
U65 browser: publish/preview (if FE) → process → assert payslip component lines + F5; Path A Jan chain if needed.
honesty: payroll_e2e_ready=false until AC formula+lines PASS and PM promotes.
```

---

## evidence_path

`docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-01.md`

## ack_status

**`PASS_TO_PM`**
