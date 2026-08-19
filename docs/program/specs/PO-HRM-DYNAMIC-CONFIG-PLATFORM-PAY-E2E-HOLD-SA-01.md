# PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-E2E-HOLD-SA-01 — Option/F.1 · `payroll_e2e_ready` honesty HOLD (W7.5 residual)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-E2E-HOLD-SA-01` |
| **Parent** | W7.5 board line **`payroll_e2e_ready`** · **DENIED invent flip** · after **`FE-ADMIN-REOPEN-GATE-BA-02`** SEALED (SPEC 20278) · peer **`CTR-PRINTABLE-HOLD-SA-01`** SEALED (`R-PLT-CTR-PRINTABLE-01`) |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` · U88 continuous governance |
| **lane** | governance · sa · **docs-only** · **NO** `apps/**` |
| **change_mode** | **ADD** Option/F.1 disposition for program honesty flag **`payroll_e2e_ready=false`** — formalize LIVE PAY catalog/CNS/FE-ADMIN **slices** vs **forbidden** payroll module e2e / module UAT claims |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · **ACCEPT_AS_IS_P2 HOLD** forever-until-sponsor · mint **`R-PLT-PAY-E2E-01`** · ba-process **HOLD** (no new AC pack) · **DENY** flip `payroll_e2e_ready=true` · **DENY** reopen PAY CNS as unlock |
| **residual_id** | **`R-PLT-PAY-E2E-01`** *(minted this seat — consolidates W7.5 payroll e2e honesty + PAY slice stamps + FE-ADMIN HOLD cite + formula/J-HRM-07 denial taxonomy)* |
| **peer_cite_printable** | [`CTR-PRINTABLE-HOLD-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-PRINTABLE-HOLD-SA-01.md) **`R-PLT-CTR-PRINTABLE-01`** · **`contracts_printable_ready=false`** — **RETAIN · FORBIDDEN bundle flip with payroll** |
| **peer_cite_fe_admin** | [`PAY-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-FE-ADMIN-NOTES-SA-01.md) **`R-PLT-PAY-FE-ADMIN-01`** — **RETAIN HOLD · FORBIDDEN reopen as payroll e2e unlock** |
| **peer_cite_cns** | PAY-CATALOG CNS QC-01 **GWC** stamp **`PAYCNSQA-MSJ6E3QM`** · CNS-BE jest 54 · CNS-FE vitest READY — **SEAL RETAIN · FORBIDDEN reopen as FAIL pretext** |
| **Honesty** | **`payroll_e2e_ready=false`** · **`contracts_printable_ready=false`** (orthogonal peer) · formula LIVE **DENIED** · J-HRM-07 module e2e **DENIED DONE** · `hrm_personnel_uat_ready=false` · **`C-SLICE-≠-MODULE`** · U65 · **DENIED** module PAY UAT · Phase1 DONE · AMIS parity DONE · seed · flip payroll · reopen PAY CNS · bundle printable flip |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

> **HARD EXIT GATE:** NFD path · UTF-8 **no BOM** · Shell **Length ≥ 8192** verified before CONFIRMED. Empty turn = INVALID.

---

## 1. Decision context (ADR option pack §1)

| | |
|--|--|
| **Decision title** | Formalize W7.5 open item: **`payroll_e2e_ready=false`** HOLD vs sponsor-gated payroll e2e UF wave vs invent flip / reopen PAY CNS / claim module PAY UAT |
| **Requestor** | pm · U88 after FE-ADMIN-REOPEN-GATE-BA-02 SEALED |
| **Decision owner** | sa |
| **Related** | FR-UC-BP-PAY-* · AC-PAY-HIRE-* · AC-PLT-PAY-01* · J-HRM-07 · UF-HRM-PAY-* · AMIS parity waves · formula-run-gap program · peer CTR printable HOLD |
| **Template** | `.cursor/templates/ADR_OPTION_TEMPLATE.md` §§1–7 + **§11 F.1** |
| **Board** | `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` § Still open W7.5 · row `…-PAY-E2E-HOLD-SA-01` |

### 1.1 Problem — what W7.5 and resume K1–K6 left open after many PAY GWC slices

Multiple execution waves under U65 already **proved narrow payroll slices** (catalog CNS invent KEY, wire Chi trả, list totals, J07 spine spot UF, Settings TAX/SI/POS, ESS payslips, process-post on fresh periods) while **every** QC/QA evidence file repeats **`payroll_e2e_ready=false`**. PM board W7.5 pairs printable and payroll e2e under **DENIED invent flip**:

| W7.5 line | PM instruction | This seat |
|-----------|----------------|-----------|
| **`payroll_e2e_ready`** | **DENIED invent flip** | **Primary subject** · mint **`R-PLT-PAY-E2E-01`** |
| **`contracts_printable_ready`** (peer) | Same row — CTR SA sealed | **Cite only** · **DENY** bundled flip |

**Historical nuance (bus grep):** A **narrow** `payroll_e2e_ready=true` appeared briefly on hire-enroll slice evidence — explicitly labeled **slice only · module UAT DENIED**. Program honesty registry **superseded** to **`false`** for all module claims. This seat **locks false** as SoT — no silent re-promotion from stale hire QA footnotes.

**Question for F.1:** Should SA recommend flipping **`payroll_e2e_ready=true`** because J07 FULL / wire / list-totals / CNS slices passed QC GWC, or **LOCK Option A HOLD** until sponsor opens a **named payroll e2e UF wave** with full matrix + QC gate?

**Answer (LOCKED):** **Option A** — slice LIVE **≠** honesty flag true. **UNLOCK flag flip only** when sponsor message opens payroll e2e UAT with explicit UF/J-HRM-07 inventory + QC GO on **module** scope — else **HOLD forever-until-sponsor**.

### 1.2 LIVE inventory (READ-ONLY — what ships today)

These surfaces are **LIVE** and **RETAIN** — they are **not** arguments to flip **`payroll_e2e_ready`**:

| Layer | Surface / stamp | Evidence class | Verdict |
|-------|-----------------|----------------|---------|
| **Platform catalog CNS** | Invent consumer KEY **`HRM-SC-COMP-KEY`** · admin CREATE **201** | QA **`PAYCNSQA-MSJ6E3QM`** · QC GWC CNS | **LIVE slice SEALED** · **must_keep** |
| **Nest salary_components SoT** | Option B catalog · F-PLT-PAY-COMP-01..04 | PAY-CATALOG SA/BA · CNS-BE jest 54 | **LIVE API SoT** · **≠** payroll e2e module |
| **FE-ADMIN SC tab** | `SalaryComponentsTab` on Payroll · CRUD LIVE | PAY-FE-ADMIN SA **`R-PLT-PAY-FE-ADMIN-01`** HOLD | **LIVE admin** · P2 NOTE · **not** e2e unlock |
| **DOCS** | SRS v0.25 CH09 · HDSD payroll catalog | PAY-CATALOG-DOCS ACCEPT | **RETAIN** |
| **Wire Chi trả** | POST wire **201** `HRM-PAY-WIRE-201` | QA-03 · QC GWC · **`R-PAY-WIRE-FE` CLOSED** | **LIVE slice** |
| **List totals** | Period list `total_*` vs payslip SUM | QC GWC **`PAYLISTTOTQA-MSIZ6H4F`** | **LIVE slice** |
| **Summary cards** | Gross/Net match line | QC GWC · R-PAY-W3-FE-SUMMARY-ZERO CLOSED | **LIVE slice** |
| **Period bind / template** | AC-PAY-TPL-03 | QA **`PAYBINDQA2-IT9Y27`** | **LIVE slice** |
| **Process POST** | Fresh period POST **201** (spot) | QA **`PAYW3PROC2-MSIT867S`** · formula residuals | **LIVE spot** · **≠** formula LIVE |
| **J-HRM-07 spine spot** | ATT→bind→enroll→process→cards | QA **`PAYJ07FULL-MSIYSHHY`** GWC | **LIVE C-SLICE** · **≠** J-HRM-07 module DONE |
| **Settings TAX/SI/POS** | Defaults UF browser | QC Settings GWC K6.3 | **LIVE slice** |
| **ESS payslips** | Mobile JWT me/payslips | ESS QA L1 PASS | **LIVE slice** · **≠** module UAT |
| **Formula author panel** | Preview stub / 412 honest | QC-02 · **`payroll_e2e_ready=false` badge** | **NOT LIVE evaluator** · RETAIN denial |
| **Advance input pack** | Thêm NV POST **201** | QA **`PAYINPQA3-IT3RY3`** | **LIVE slice** |

**Critical discrimination:**

| Claim | Allowed? | Why |
|-------|----------|-----|
| «CNS consumer invent KEY slice passed QC» | **YES** | **`PAYCNSQA-MSJ6E3QM`** C-SLICE |
| «Wire / list-totals / J07 spot UF GWC on named period» | **YES** | Evidence-backed **C-SLICE** |
| «Salary_components Nest admin CRUD on Payroll tab» | **YES** | LIVE FE-ADMIN + peer HOLD note |
| «**Module** payroll **e2e UAT ready**» | **NO** | Honesty flag **false** · formula LIVE open · full UF matrix open |
| «Set **`payroll_e2e_ready=true`** on board» | **NO** | **DENIED invent flip** (mission + all QC gates) |
| «J-HRM-07 **DONE** / AMIS parity **DONE** from spot spine» | **NO** | **`C-SLICE-≠-MODULE`** |
| «Phase 1 DONE / product GO from PAY work» | **NO** | Program gates open |

### 1.3 FORBIDDEN by honesty flag (what `payroll_e2e_ready=false` blocks)

| Blocked claim | Detection | Mitigation |
|---------------|-----------|------------|
| Module PAY UAT GO | PM matrix / SERVICE_READINESS | Cite this SPEC + QC honesty tables |
| Flip flag without sponsor UF wave | Bus diff on honesty JSON | SA **REJECT** · Option C |
| Reopen **PAY-CATALOG CNS** GWC as FAIL to force e2e | QA invent reopen | **FORBIDDEN** — **`PAYCNSQA-MSJ6E3QM` RETAIN** |
| Reopen **`R-PLT-PAY-FE-ADMIN-01`** as payroll e2e unlock | Dispatch dev-fe from FE HOLD | **FORBIDDEN** — orthogonal FE-ADMIN NOTE class |
| Bundle flip with **`contracts_printable_ready=true`** | Single bus promote both flags | **FORBIDDEN** — peer **`R-PLT-CTR-PRINTABLE-01`** separate wave |
| Claim formula evaluator **LIVE** from preview stub | Formula QC evidence | **DENIED** · badge + **`R-PAY-F-EVAL`** class |
| Use seed to «complete» payroll matrix | U65 violation | **DENIED** |
| API-only PASS without browser UF for e2e promotion | qa-fe-outside-browser-gate | **DENIED** |

### 1.4 Companion flag: `contracts_printable_ready` (W7.5 peer — cite only)

| Flag | AS-IS | This seat |
|------|-------|-----------|
| **`contracts_printable_ready`** | **false** (`R-PLT-CTR-PRINTABLE-01` SEALED) | **RETAIN false** · **DENY** bundled flip |
| **`payroll_e2e_ready`** | **false** (program LOCK) | **Primary subject** · mint **`R-PLT-PAY-E2E-01`** |

Printable UAT closure is **orthogonal** — do **not** bundle into payroll e2e HOLD unlock. PM dispatches **separate** printable waves per CTR SA spec when sponsor opens.

### 1.5 READ-ONLY apps cite (payroll spine — no edit)

| Symbol | Path (read-only) | Role |
|--------|------------------|------|
| Payroll shell | `apps/web/hrm/src/pages/Payroll.tsx` | Tabs: SC, batches, formulas |
| SC admin | `apps/web/hrm/src/components/payroll/SalaryComponentsTab.tsx` | FE-ADMIN CRUD |
| SC API | `apps/web/hrm/src/integrations/hrmApi.ts` | Nest salary_components |
| Batches / process | `apps/web/hrm/src/components/payroll/*` | Period enroll/process UX |
| Nest payroll module | `apps/api/hrm-api/src/payroll/*` | Periods, process, wire, formulas |

Audit finding: **Substantial PAY stack is LIVE** for **spot slices** already GWC — yet **every** QC/QA evidence in grep chain repeats **`payroll_e2e_ready=false`**. SA **confirms** intentional honesty (formula LIVE denial + module matrix open), not stale typo.

### 1.6 Constraints

- Docs-only · **no** `apps/**` · **no** seed (U65)
- **DENY** `payroll_e2e_ready=true` without sponsor payroll e2e UF wave
- **DENY** reopen **`PAYCNSQA-MSJ6E3QM`** · PAY-CATALOG CNS QC GWC as unlock pretext
- **DENY** reopen **`R-PLT-PAY-FE-ADMIN-01`** as e2e unlock
- **DENY** bundle flip with **`contracts_printable_ready`**
- **RETAIN** all PAY GWC stamps · CNS SEAL · FE-ADMIN HOLD · honesty false · **C-SLICE**
- **UNLOCK** honesty flag **only** if sponsor **explicit** payroll e2e UF wave + UF/J-* list in **same** governance cycle + QC GO

### 1.7 Decision heuristic

| Rule | Application |
|------|-------------|
| Slice GWC + flag false on evidence | **Option A HOLD** — formalize, do not flip |
| Sponsor opens «payroll e2e UAT wave» + UF | **Future Option B** — out of this seat default |
| «J07 spot PASS ⇒ flip flag» | **Option C REJECT** — violates all QC gates |
| «CNS GWC ⇒ reopen CNS as FAIL for dev-fe» | **REJECT** — seal loss |
| «FE-ADMIN HOLD blocks e2e ⇒ unlock dev-fe» | **REJECT** — P2 NOTE, not e2e gate |

---

## 2. Problem to solve (ADR §2)

### 2.1 Current state

| Layer | AS-IS | Honesty reading |
|-------|-------|-----------------|
| PAY platform catalog CNS | Invent KEY + admin CREATE proven | **Slice LIVE** |
| PAY operational slices | Wire, totals, bind, process spot, J07 spine | **Slice LIVE** |
| Formula evaluator | Preview stub / honest 412 · **`R-PAY-F-EVAL`** residual class | **NOT LIVE** · flag false correct |
| Module payroll e2e matrix | **Not closed** — AMIS depth · full J-HRM-07 · PO-UAT-PAY open | **Flag false correct** |
| PAY FE-ADMIN HOLD | **`R-PLT-PAY-FE-ADMIN-01`** P2 NOTE | **Does not block** slice evidence · **does not require** flag true |
| Program W7.5 | PM **DENIED invent flip** (payroll leg) | **Needs SA mint** **`R-PLT-PAY-E2E-01`** |

### 2.2 Failure impact if mis-governed

| Risk | Impact |
|------|--------|
| Flip flag from J07 spot GWC alone | False UAT-ready · QC NO-GO · sponsor trust loss |
| Reopen PAY CNS as e2e unlock | Scope creep · duplicate dev · violates CNS seal |
| Claim AMIS DONE from slices | Violates parity honesty program |
| Bundle printable + payroll flip | Violates peer CTR SA lock |
| Ignore W7.5 payroll line | PM board drift · U88 incomplete |

---

## 3. Options (ADR §3)

### Option A — ACCEPT_AS_IS_P2 HOLD forever-until-sponsor — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Mint **`R-PLT-PAY-E2E-01`** documenting: (1) **LIVE** PAY catalog/CNS/operational slices with stamp table §1.2; (2) **`payroll_e2e_ready=false`** **correct** until sponsor opens named payroll e2e UF wave; (3) **DENY** flip/reopen/invent paths §6.3; (4) **RETAIN** peer FE HOLD + CNS GWC + all GWC stamps. |
| **Benefits** | Aligns resume K1–K6 + W8 PAY evidence · closes W7.5 SA payroll leg without code · preserves U88 bandwidth |
| **Costs** | Full payroll e2e UAT deferred until sponsor |
| **Risks** | HOLD misread as «payroll broken» → mitigations **L-PAY-E2E-*** |
| **Gate** | Evidence chain grep **`payroll_e2e_ready=false`** consistent |

### Option B — UNLOCK honesty flag / «payroll e2e ready» (default reject)

| | |
|--|--|
| **Description** | Set **`payroll_e2e_ready=true`** because J07/wire/CNS slices passed. |
| **Benefits** | None on current evidence — contradicts QC |
| **Costs** | Honesty violation · false module GO |
| **Risks** | **DENIED** mission line |
| **Gate** | **REJECT** unless sponsor + UF matrix + QC sign-off in future wave |

### Option C — REJECT invent / reopen / flip

| | |
|--|--|
| **Description** | Flip flag · reopen PAY CNS · reopen PAY FE HOLD as unlock · claim payroll module UAT · invent formula LIVE · bundle printable flip · seed · `apps/**` from this seat. |
| **Benefits** | None |
| **Costs** | Seal loss |
| **Risks** | **DENY** all mission FORBIDDEN lines |

---

## 4. Trade-off matrix (ADR §4)

| Criteria | Weight | Option A HOLD | Option B flip | Option C invent |
|---|--:|--:|--:|--:|
| QC/QA honesty chain integrity | 5 | **5** | 0 | 0 |
| W7.5 PM instruction compliance | 5 | **5** | 0 | 0 |
| Clarity LIVE slice vs module e2e UAT | 5 | **5** | 1 | 0 |
| Sponsor trust | 4 | **5** | 0 | 0 |
| Time to full payroll e2e UAT | 3 | 3 | **4** | 1 |
| Delivery cost now | 4 | **5** | 2 | 0 |
| **Weighted tendency** | | **Dominates** | Reject | Reject |

---

## 5. Failure modes and mitigation (ADR §5)

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | «J07 GWC ⇒ flip flag» argument | Bus promote without UF | Cite PAYJ07FULL honesty § + this SPEC |
| A | User thinks SC admin missing | Support ticket | Cite LIVE tab + **`R-PLT-PAY-FE-ADMIN-01`** HOLD ≠ absent |
| A | PM drops W7.5 payroll leg | Board scan | **`R-PLT-PAY-E2E-01`** mint |
| B | False SERVICE_READINESS | QC audit | NO-GO · revert flag |
| C | Reopen CNS GWC | Duplicate QA FAIL | FORBIDDEN · **`PAYCNSQA-MSJ6E3QM` RETAIN** |
| C | Bundle printable flip | Dual flag promote | Cite **`R-PLT-CTR-PRINTABLE-01`** |

---

## 6. Decision (ADR §6)

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_P2 HOLD** |
| **Why** | PAY **slices** are **LIVE and GWC** — but **every** gate evidence requires **`payroll_e2e_ready=false`**. W7.5 explicitly **DENIED invent flip**. Formula LIVE and full module e2e require sponsor UF wave — not satisfied. PAY FE HOLD and CNS SEAL are **orthogonal** — **not** unlock paths for flag flip. |
| **Assumptions** | Sponsor did not open «payroll e2e UAT wave» with UF list in this message. |
| **Rejected** | **Option B** flag flip · **Option C** full DENY list |

### 6.1 Unlock gates (Option A does not open)

| Question | Answer |
|----------|--------|
| Flip **`payroll_e2e_ready=true`** now? | **NO** |
| Flip **`contracts_printable_ready`** via this seat? | **NO** — peer CTR SA only |
| Reopen PAY-CATALOG CNS GWC? | **FORBIDDEN** |
| Reopen PAY FE-ADMIN HOLD? | **FORBIDDEN** |
| Dispatch dev-fe/dev-be for «payroll e2e» from HOLD? | **NO** default |
| Claim formula evaluator LIVE? | **NO** |

### 6.2 Sponsor-gated narrow alternate (not default)

```text
entry: sponsor message explicit «mở wave payroll e2e UAT» + named UF-IDs (J-HRM-07 full matrix, PO-UAT-PAY rows) + persona matrix + formula LIVE criteria if in scope
retain: all prior PAY GWC stamps · CNS SEAL · FE-ADMIN HOLD · honesty false until QC closes wave
scope_allowed: QA browser matrix per UF · QC module gate · THEN pm may set payroll_e2e_ready=true with QC sign-off
scope_FORBIDDEN: flip flag from single J07 spot · reopen CNS as pretext · reopen FE HOLD · seed · API-only · bundle printable flip
exit: R-PLT-PAY-E2E-01 may CLOSE or narrow; requires QC GO on full e2e scope — not slice alone
```

### 6.3 Architecture boundary (text diagram)

```text
  PAY-CATALOG CNS invent KEY (U65)          --> LIVE (PAYCNSQA-MSJ6E3QM GWC)
  Nest salary_components SoT + SC admin tab --> LIVE + R-PLT-PAY-FE-ADMIN-01 HOLD
  Wire / list-totals / summary-cards GWC    --> LIVE slices (named stamps)
  J-HRM-07 spot spine UF (fresh period)     --> LIVE C-SLICE (PAYJ07FULL-MSIYSHHY)
  Formula preview / evaluator               --> NOT LIVE (stub/412 honest)
  Module payroll e2e UAT matrix             --> OPEN (honesty)
  payroll_e2e_ready                         --> false RETAIN (R-PLT-PAY-E2E-01)
  contracts_printable_ready (peer)          --> false RETAIN (orthogonal)
  C-SLICE-≠-MODULE                          --> RETAIN
```

---

## 7. Implementation and validation plan (ADR §7)

| Step | Owner | Action |
|------|-------|--------|
| 1 | pm | Seal board row **CONFIRMED** · append **`R-PLT-PAY-E2E-01`** HOLD P2 |
| 2 | pm | **Do not** set **`payroll_e2e_ready=true`** · **Do not** dispatch payroll e2e unlock from this seat |
| 3 | pm | Keep W7.5 payroll leg until sponsor opens UF wave — then **new** work_item (not silent flip) |
| 4 | qc | Any future flag promote requires **full** payroll e2e UF evidence — not slice alone |
| Rollback | sa | If flag flipped wrongly — CORRECTION bus · restore false · cite this SPEC |
| Validation | qa | E2e wave must be U65 browser UF matrix when sponsor opens |
| Success | pm | SPEC_LEN ≥8192 NFD · PASS_TO_PM · honesty unchanged |

---

## 8. Locks (L-PAY-E2E-*)

| Lock | Rule |
|------|------|
| **L-PAY-E2E-01 HOLD ≠ WAIVE** | ACCEPT_AS_IS_P2 does not delete PAY slice ACs · deferred **module** e2e UAT only |
| **L-PAY-E2E-02 Slice LIVE** | CNS/wire/totals/J07 spot **RETAIN** — HOLD does not negate slice evidence |
| **L-PAY-E2E-03 Flag false** | **DENY** PM/dev flip without sponsor UF wave + QC |
| **L-PAY-E2E-04 CNS orthogonality** | **DENY** reopen **`PAYCNSQA-MSJ6E3QM`** / CNS QC GWC as e2e unlock |
| **L-PAY-E2E-05 FE-ADMIN orthogonality** | **DENY** reopen **`R-PLT-PAY-FE-ADMIN-01`** as e2e unlock |
| **L-PAY-E2E-06 Printable peer** | **`contracts_printable_ready`** **RETAIN false** — **DENY** bundled flip |
| **L-PAY-E2E-07 Formula** | **DENY** claim formula LIVE from preview stub |
| **L-PAY-E2E-08 Honesty** | **C-SLICE-≠-MODULE** RETAIN · **DENY** Phase1 DONE · AMIS DONE from slices |
| **L-PAY-E2E-09 Path lock** | UTF-8 no BOM NFD write gate |

---

## 9. F.1 physical notes (API_DESIGN alignment — read-only)

| Function / area | Mục đích (VI) | Slice status today | Honesty impact |
|-----------------|---------------|--------------------|----------------|
| **F-PLT-PAY-COMP-01..04** | Danh mục thành phần lương Nest (list/effective/admin CRUD) | **LIVE** CNS + admin | **≠** payroll e2e module ready |
| **F-PAY-PERIOD-*** | Kỳ lương · enroll · process · close | **LIVE** spot UF | **≠** flag true |
| **F-PAY-WIRE-*** | Chi trả / wire payslip batch | **LIVE** GWC slice | **≠** flag true |
| **F-PAY-FORMULA-*** | Preview / author công thức | **STUB/412 honest** | **Supports flag false** |
| **F-PAY-ESS-*** | Phiếu lương ESS mobile | **LIVE** L1 slice | **≠** module e2e |
| **F-PAY-TPL-BIND-*** | Gắn mẫu bảng lương kỳ | **LIVE** bind slice | **≠** flag true |
| **F-PAY-SETTINGS-TAX-SI-POS** | Mặc định thuế/BH/chức danh | **LIVE** Settings UF | **≠** flag true |

No new API_DESIGN rows required this seat — **disposition + honesty governance only**.

---

## 10. Evidence index (RETAIN — grep-backed)

| Evidence path | Stamp / verdict | Honesty line |
|---------------|-----------------|--------------|
| `docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-cns-qa-01.md` | **`PAYCNSQA-MSJ6E3QM`** PASS | `payroll_e2e_ready=false` |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-cns-fe-01.md` | CNS-FE vitest READY | false RETAIN |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-FE-ADMIN-NOTES-SA-01.md` | **`R-PLT-PAY-FE-ADMIN-01`** HOLD | honesty false |
| `docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qa-03.md` | Wire U65 GWC | false LOCKED |
| `docs/qa/evidence/po-hrm-payroll-period-list-totals-qc-01.md` | **`PAYLISTTOTQA-MSIZ6H4F`** GWC | false LOCKED |
| `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-02.md` | Formula stub honest | false · LIVE DENIED |
| `docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-qa-01.md` | **`PAYBINDQA2-IT9Y27`** | false |
| `docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qa-process-post-01.md` | Process POST proven | false |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-PRINTABLE-HOLD-SA-01.md` | **`R-PLT-CTR-PRINTABLE-01`** | payroll companion false |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-FE-ADMIN-REOPEN-GATE-BA-02.md` | SPEC 20278 SEALED | reopen-gate ADD only |
| `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` | W7.5 **DENIED invent flip** | board SoT |

---

## 11. Trace to program board (W8)

| Board row | Status | Action |
|-----------|--------|--------|
| W7.5 payroll e2e | open → **this seat** | Option A mint **`R-PLT-PAY-E2E-01`** |
| PAY-FE-ADMIN-NOTES-SA-01 | CONFIRMED HOLD | **RETAIN** · **DENY** reopen as e2e unlock |
| PAY-CATALOG CNS chain | GWC SEAL | **RETAIN** · **DENY** reopen |
| CTR-PRINTABLE-HOLD-SA-01 | SEALED | peer printable false RETAIN |
| FE-ADMIN-REOPEN-GATE-BA-02 | SEALED 20278 | prior chain RETAIN |
| **PAY-E2E-HOLD-SA-01** | **this seat** | Option A LOCK |

---

## 12. Discrimination matrix (PM / QC)

| Evidence | Flip `payroll_e2e_ready`? | Why |
|----------|---------------------------|-----|
| CNS **`PAYCNSQA-MSJ6E3QM`** | **NO** | C-SLICE |
| Wire / list-totals GWC | **NO** | Operational slice |
| J07 spot **`PAYJ07FULL-MSIYSHHY`** | **NO** | Spot spine ≠ module DONE |
| SC FE-ADMIN LIVE + HOLD | **NO** | P2 NOTE · not flag gate |
| Formula preview stub | **NO** | Supports false |
| Sponsor payroll e2e UF wave + QC GO | **YES** (future) | §6.2 only |

---

## 13. RETAIN stamps (PAY slices · peers · honesty)

| Stamp / residual | Action |
|------------------|--------|
| **`PAYCNSQA-MSJ6E3QM`** CNS QA | **SEAL RETAIN** |
| PAY-CATALOG CNS QC GWC | **SEAL RETAIN** |
| **`R-PLT-PAY-FE-ADMIN-01`** | **HOLD RETAIN** |
| **`R-PLT-PAY-E2E-01`** | **HOLD mint this seat** |
| **`R-PLT-CTR-PRINTABLE-01`** (peer) | **HOLD RETAIN** |
| Wire / totals / bind / process stamps | **SEAL RETAIN** (named QA/QC) |
| **`payroll_e2e_ready`** | **false RETAIN** |
| **`contracts_printable_ready`** | **false RETAIN** (peer) |
| **`C-SLICE-≠-MODULE`** | **RETAIN** |

---

## 14. Non-goals (explicit)

1. Do not set **`payroll_e2e_ready=true`**.
2. Do not set **`contracts_printable_ready=true`** from this seat.
3. Do not reopen PAY-CATALOG CNS GWC as payroll e2e unlock.
4. Do not reopen **`R-PLT-PAY-FE-ADMIN-01`** as e2e unlock.
5. Do not claim module PAY UAT · J-HRM-07 DONE · AMIS DONE · formula LIVE.
6. Do not dispatch dev-fe/dev-be for e2e closure without sponsor UF wave.
7. Do not seed payroll matrix (U65).
8. Do not edit `apps/**` in this seat.

---

## 15. Handback packet (mandatory)

| Field | Value |
|-------|--------|
| **completion_report** | W7.5 **`payroll_e2e_ready`** formalized as Option **A LOCKED** · mint **`R-PLT-PAY-E2E-01`** ACCEPT_AS_IS_P2 HOLD · documented **LIVE** PAY CNS (`PAYCNSQA-MSJ6E3QM`) · operational GWC slices · SC FE-ADMIN LIVE vs **`R-PLT-PAY-FE-ADMIN-01` HOLD RETAIN** · formula **NOT LIVE** · **DENY** flag flip · **DENY** reopen CNS/FE-ADMIN as unlock · **`contracts_printable_ready=false`** peer cite · no `apps/**`. |
| **selected_option** | **Option A** — ACCEPT_AS_IS_P2 HOLD |
| **residual** | **`R-PLT-PAY-E2E-01`** = **HOLD** |
| **SPEC_LEN** | Verified NFD UTF-8 no BOM · gate ≥8192 bytes |
| **next_owner** | **pm** — seal W8 row CONFIRMED · **do not** flip honesty · U88 next vertical per board (not payroll e2e unlock) |
| **next_dispatch_prompt** | `work_item_id: PO-HRM-CONTINUOUS-W8-PM-SEAL-PAY-E2E-HOLD-01` · from_role: pm · to_role: pm · lane: governance · entry: SA PASS `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-E2E-HOLD-SA-01` Option A · evidence `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-E2E-HOLD-SA-01.md` · mint `R-PLT-PAY-E2E-01` HOLD on W8 board + honesty registry · exit: row CONFIRMED · RETAIN `payroll_e2e_ready=false` · RETAIN `contracts_printable_ready=false` · C-SLICE · **cấm** dispatch dev-* payroll e2e unlock · **cấm** flip flag · **cấm** reopen PAYCNSQA · ack PASS_TO_PM internal seal |
| **evidence_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-E2E-HOLD-SA-01.md` |
| **ack_status** | **PASS_TO_PM** |

---

## 16. SA KB append (reference)

| Context | W7.5 payroll e2e honesty after PAY GWC slices |
| Action | Option A LOCK · mint R-PLT-PAY-E2E-01 · LIVE vs flag false taxonomy |
| Outcome | PASS_TO_PM · no apps/** |
| Evidence | This SPEC path |
| Reuse-tag | pay-e2e-honesty-hold, r-plt-pay-e2e-01, slice-live-neq-module-uat, deny-invent-flip, w75-retain, paycnsqa-retain, pay-fe-admin-hold-retain, ctr-printable-peer-retain, path-lock-nfd |

---

## 17. Extended governance notes (honesty registry cross-reference)

Program honesty flags on W8 continuous board are **independent** of slice GWC stamps. PM **`PO_HRM_CONTINUOUS_W8_20260807.md`** § Still open from W7.5 lists printable + payroll e2e with **DENIED invent flip**. After CTR SA sealed **`R-PLT-CTR-PRINTABLE-01`**, the payroll leg required its own SA seat — this document — so PM does not interpret «one of two flags formalized» as permission to flip the other.

**FE-ADMIN-REOPEN-GATE-BA-02 (SPEC 20278):** BA ADD inventory for reopen-gate defers **leave + printable + engine** residuals — **not** an unlock of **`payroll_e2e_ready`**. Payroll e2e HOLD is **downstream SA disposition**, not BA AC pack expansion.

**Narrow true superseded:** Any bus line citing `payroll_e2e_ready=true (slice only)` is **historical audit** only. Module promotion requires **QC GO on full scope** after sponsor wave — current SoT **`false`**.

**Resume plan K1–K6:** Chain CLOSED as **slice GWC** with honesty **LOCKED false** at REC-QC-02 seal. This seat **does not** reopen K1–K6; it **formalizes** why CLOSED slices did not flip the flag.

**QC coaching:** When auditing PAY evidence, QC must copy honesty line from evidence header — if missing, **FAIL spec_gap** to QA author. SA does not waive missing honesty on module promotion discussions.

**Dev coaching:** `dev-be` / `dev-fe` must not interpret J07 spot or CNS KEY as ticket to update honesty JSON in program docs without PM + QC after sponsor wave.

**BA coaching:** No new AC-PLT-PAY pack required for HOLD. Future sponsor wave may request BA delta for **full** e2e UF — separate work_item.

**TM/QC block:** Recommend **NO-GO** on any release narrative claiming payroll module UAT while **`R-PLT-PAY-E2E-01=HOLD`** and flag false.

---

*End of SPEC — PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-E2E-HOLD-SA-01*
