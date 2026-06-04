# P1-QUAL-QC-PROGRAM-02 — Phase 1 Program UAT-ready (quality-first)

| Field | Value |
|-------|--------|
| **work_item_id** | P1-QUAL-QC-PROGRAM-02 |
| **from_role** | qc |
| **to_role** | pm |
| **date** | 2026-05-30 |
| **sponsor_lock** | `docs/program/PHASE1_QUALITY_FIRST.md` Q1–Q7 |
| **Verdict (quality-first Program UAT-ready)** | **GO WITH CONDITIONS** |
| **Verdict (corporate Production / PROD-READY)** | **NOT MET** |
| **Verdict (373 UC manual closure / unconditional Program DONE)** | **NOT IN SCOPE** |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Scope

| In scope | Out of scope |
|----------|--------------|
| Consolidated adjudication **Q1–Q7** from quality wave chain | Claiming **373 UC** bấm tay UAT |
| Audit: `p1-qual-qa-w3`, `p1-qual-qa-w4`, `p1-qual-qa-mob-01`, `p1-qual-tm-01`, `p1-qual-be-w3-scope`, `p1-qual-be-seed-01` | Corporate **PROD-READY** / **PROD-LIVE** |
| Cross-reference **G2** `p1-100-qc-g2-01` (104/104) | Replacing full **G1–G9** program sign-off (`p1-r4-qc-01` baseline still applies for G7/G8/G9/PROD) |
| Cross-reference **G7/G8/G9** baseline `p1-r4-qc-01-20260529.md` | `phase1:gate --strict` full re-run (not required per PM dispatch) |
| Issue **C-QUAL-*** conditions with owners | Unconditional **GO** (residuals remain) |

**Entry:** PM dispatch `P1-QUAL-QC-PROGRAM-02` after QA W3/W4/MOB + TM Q5 + Dev-BE scope/seed waves.

---

## 2. Evidence chain audited

| Artifact | Role | QC finding |
|----------|------|------------|
| `p1-qual-qa-w3-20260530.md` | qa | **Valid** — Q1 PASS (0 `notifyHrmApiGap` callers); Q4 PASS; L2 P-CC-03..08 |
| `p1-qual-qa-w4-20260530.md` | qa | **Valid** — Q2 PASS J-HRM **7/7**; Q6 PASS `du-lich.ceo`; L1 **37/37** |
| `p1-qual-qa-mob-01-20260530.md` | qa | **Valid** — Q3 PASS device J-MOB-03..05; empty-state detail documented |
| `p1-qual-tm-01-20260530.md` | tm | **Valid** — Q5 **GWC**; CE-01..05 logged |
| `p1-qual-be-w3-scope-20260530.md` | dev-be | **Valid** — SCOPE-01..03 closed; SCOPE-04/05 **deferred** |
| `p1-qual-be-seed-01-20260530.md` + probe JSON | dev-be | **Valid** — sales/bonus **200** post seed |
| `p1-100-qc-g2-01-20260530.md` | qc | **Valid** — G2 **104/104** strict GO (orthogonal metric) |
| `p1-r4-qc-01-20260529.md` | qc | **Valid** — G7/G8/G9 GWC + PROD **NOT MET** baseline |

**Handoff contract:** All upstream QA/TM/BE files include `completion_report`, `next_owner`, `evidence_path`, `ack_status` — **valid** (mob-01 `next_dispatch_prompt` present).

---

## 3. Q1–Q7 adjudication (PHASE1_QUALITY_FIRST)

| # | Criterion | Verdict | Primary evidence | QC notes |
|---|-----------|---------|------------------|----------|
| **Q1** | Không lừa user — 0 `notifyHrmApiGap` callers | **MET** | `p1-qual-qa-w3` | 1 file export only; **0** call sites; P-CC-03..08 no 54321 |
| **Q2** | L2.5 J-HRM-* mandatory | **MET** | `p1-qual-qa-w4` | **7/7** list→detail **200** `ceo@xe.vn` @ `:5175`; J-CC-* prior R2/R4 waves |
| **Q3** | Mobile J-MOB-03..05 device | **MET (GWC)** | `p1-qual-qa-mob-01` | Emulator + API **200**; **empty** leave/payslip → detail N/A — **C-QUAL-03** |
| **Q4** | Stack 8/8 | **MET** | W3/W4/MOB | `qc:dev-stack` + `qc:fe-be-health` exit **0** each wave |
| **Q5** | Scope parity list vs GET-by-id | **MET (GWC)** | TM-01 + BE-W3-SCOPE | CE-01..03 **closed**; **SCOPE-04/05 deferred** — **C-QUAL-01/02** |
| **Q6** | Persona `ceo` + `du-lich.ceo` | **MET** | `p1-qual-qa-w4` | Member negatives 403/409 + P-CC-03..08 **200**; HRBP not re-run — **C-QUAL-07** |
| **Q7** | QC Program GO/GWC + residuals | **MET (GWC)** | This file | Conditions table below |

### 3.1 L2.5 / U19 journey coverage (mandatory audit)

| Journey set | Tested PASS | Deferred / GWC |
|-------------|-------------|----------------|
| **J-HRM-01..07** (`ceo@xe.vn`) | **7/7** | — |
| **J-MOB-03..05** (device) | List + screen **PASS**; detail row tap | Empty DB → **C-QUAL-03**; approve POST — **C-QUAL-04** |
| **J-CC-*** (Q2 text) | Prior R2/R4 HTTPS/local | Not re-run W4 — acceptable per QA scope |
| **Member CEO full 7/7 browser** | Spot J-HRM-02 only | **C-QUAL-06** optional |

**QC rule (U19):** L2 PASS without L2.5 is **FAIL** — **not applicable** here; W4 + W3 provide executable J-HRM paths.

### 3.2 Related program gates (informational — do not conflate)

| Gate | Status vs this gate |
|------|---------------------|
| **G2** 104/104 | **MET** per `p1-100-qc-g2-01` — does not imply Q1–Q7 or portal J-* |
| **G7/G8/G9** | **MET (GWC)** per `p1-r4-qc-01` — strict gate + personas; carry C-P1R4QC-* |
| **G1** 245/245 | Matrix closure — **not** manual 373-screen UAT |
| **Production** | **NOT MET** — **C-QUAL-05** |

---

## 4. QC spot checks (2026-05-30)

| Check | Result | Notes |
|-------|--------|-------|
| Evidence file presence (chain §2) | **PASS** | All paths exist |
| `PHASE1_QUALITY_FIRST.md` alignment | **GWC** | J-MOB row stale pre-close — PM refresh via `P1-QUAL-PM-CLOSE-01` |
| PROD columns `SERVICE_READINESS_UAT_PRODUCTION.md` | **🔴** | No QC override |
| `test:uc:catalog` recount | **Not run** | Per PM — not blocking quality-first |

---

## 5. Options considered

| Option | Rationale | QC decision |
|--------|-----------|-------------|
| **GO** unconditional Program DONE | Q1–Q6 largely green | **Rejected** — PROD 🔴; SCOPE-04/05 open; mobile detail/approve gaps |
| **NO-GO** | Residuals exist | **Rejected** — regresses verified W3/W4/MOB closure vs sponsor «chất lượng trước» |
| **GO WITH CONDITIONS** | Honest **UAT-ready (quality-first)** line | **Selected** |

---

## 6. Verdict

### **GO WITH CONDITIONS — Phase 1 Program UAT-ready (quality-first)**

**PM may claim (with conditions table):**

- **Quality-first Q1–Q6:** sponsor criteria **MET** or **MET (GWC)** per §3 — embed không gap toast; J-HRM **7/7**; mobile device slice; stack **8/8**; persona member CEO signed.
- **UAT-ready slice:** Group CEO Command Center HRM embed (`ceo@xe.vn`) + bounded mobile APK/emulator (`du-lich.ceo@xe.vn`) + catalog-extensions seed paths **200**.
- **G2 (related):** **104/104** `e2e_pass` per `p1-100-qc-g2-01` when discussing XBOS Khối A only.

**PM must NOT claim:**

- «Phase 1 Program DONE» unconditional / «373 UC xong» / full matrix bấm tay.
- **PROD-READY** or corporate Production LIVE (**C-QUAL-05**).
- Q5 **unconditional PASS** while **SCOPE-04/05** open.
- Mobile **detail row tap** proven when lists empty without seed (**C-QUAL-03**).

### Production (separate line)

**NOT MET** — VPS pilot may remain **GO** per `p1-r3-qc-01-r1`; **SERVICE_READINESS** PROD columns stay **🔴**.

---

## 7. Conditions register (C-QUAL-*)

| ID | Condition | Owner | Priority | Trigger to close |
|----|-----------|-------|----------|------------------|
| **C-QUAL-01** | **SCOPE-04** — `POST catalog-extensions/files/upload`: bind `company_id`, scoped storage path (TM CE-04) | **dev-be** | P1 | JWT + path prefix + negative cross-tenant probe |
| **C-QUAL-02** | **SCOPE-05** — profile asset mutate row-level `assertResourceInHrmScope` (TM CE-05) | **dev-be** | P3 | jest + TM spot on corrupt-row scenario |
| **C-QUAL-03** | Mobile **leave/payslip detail row tap** when list empty — contract verified via empty UI only; re-test with seeded rows for `du-lich.ceo` or `uat.nv####` | **dev-be** / seed + **qa** | P2 | Seed leave/payslip rows → device L2.5 detail **200** + screenshot |
| **C-QUAL-04** | **J-MOB-05** manager **Duyệt** approve POST not exercised (pending filter empty vs dashboard count) | seed + **qa** | P2 | Pending row on device → approve POST **200** |
| **C-QUAL-05** | **Corporate Production NOT MET** — `SERVICE_READINESS_UAT_PRODUCTION.md` PROD **🔴**; runbook Phases B/F/G, corp DNS/TLS | **devops** + **qc** re-gate | P0 release | `verify:production-env` on target corp env + QC prod GO |
| **C-QUAL-06** | Member CEO **full J-HRM-01..07** browser clicks (optional parity) | **qa** | P3 | PM requests parity beyond W4 spot |
| **C-QUAL-07** | `du-lich.hr@xe.vn` HRBP persona row not re-run this quality wave | **qa** | P3 | HRBP matrix row in `PILOT_SCOPE_DATA_MATRIX.md` |
| **C-QUAL-08** | Sponsor communication: quality-first **≠** 373 UC manual UAT **≠** unconditional Program DONE | **pm** | — | `PROJECT_STATUS_REPORT.md` honest line |
| **C-QUAL-09** | Formal `p1-g9-qa-01` file still absent (carry **C-P1R4QC-02**) | **qa** | P2 | Publish G9 PASS mirroring catalog **0** none |

**Waived this gate:** None. **Bulk waive** of SCOPE-04/05 or mobile detail gaps — **rejected**.

---

## 8. Traceability summary

| Layer | Owner | Status |
|-------|-------|--------|
| L0 Stack | QA | **PASS** |
| L1 API UAT | QA W4 | **PASS** 37/37 |
| L2 P-CC embed | QA W3 | **PASS** |
| L2.5 J-HRM | QA W4 | **PASS** 7/7 |
| L2.5 J-MOB | QA MOB-01 | **GWC** (empty detail) |
| L3 QC | This gate | **GWC** |

---

## 9. Completion contract

### completion_report

- **Closed:** Consolidated **Q1–Q7** quality-first program gate; **GO WITH CONDITIONS** for **Phase 1 Program UAT-ready (quality-first)**; evidence chain complete; **C-QUAL-01..09** registered.
- **Open:** SCOPE-04/05; mobile detail/approve seed paths; PROD corp; optional member/HRBP parity; G9 formal QA file.

### next_owner

**pm** → `P1-QUAL-PM-CLOSE-01` (refresh `PHASE1_QUALITY_FIRST.md`, `PROJECT_STATUS_REPORT.md`, `USER_SERVICE_STATUS` / SERVICE_READINESS honest lines).

### next_dispatch_prompt

```
work_item_id: P1-QUAL-PM-CLOSE-01
from_role: pm
Entry: docs/qa/evidence/p1-qual-qc-program-02-20260530.md — QC GO WITH CONDITIONS quality-first UAT-ready; NOT PROD corp; NOT 373 UC.
exit_criteria: Update PHASE1_QUALITY_FIRST.md § Hiện trạng (Q3 PASS, Q5 GWC, Q7 GWC); PROJECT_STATUS_REPORT sponsor line; bus PM -> USER summary with C-QUAL-01..09 table; do not claim PROD-READY or Program DONE unconditional.
evidence_path: docs/program/PROJECT_STATUS_REPORT.md (delta section) + bus entry
ack_status: PASS_TO_USER when docs synced
residual_auto_fix: true — dispatch dev-be P1-QUAL-BE-W3-SCOPE-04 when PM prioritizes upload tenancy (C-QUAL-01 P1)
```

### evidence_path

`docs/qa/evidence/p1-qual-qc-program-02-20260530.md`

### ack_status

**PASS_TO_PM**

---

## 10. References

- Sponsor: `docs/program/PHASE1_QUALITY_FIRST.md`
- Journeys: `docs/program/PROGRAM_JOURNEY_MAP.md`
- Matrix: `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md`
- UAT plan: `docs/program/UAT_PRODUCTION_OPERATING_PLAN.md` §3
- Prior program: `docs/qa/evidence/p1-r4-qc-01-20260529.md`
- G2 strict: `docs/qa/evidence/p1-100-qc-g2-01-20260530.md`
