# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-FE-01G-SA-01` (R2)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-FE-01G-SA-01` |
| **dispatch_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-FE-01G-SA-01-R2` |
| **r2_note** | Prior SA INVALID (empty transcript) — this seat **re-wrote** Option/F.1 on NFD `.git`+`apps` True via WriteAllText |
| **from_role** | `sa` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — Option/F.1 **FE 01g HOLD** residual only · **not** module ATT UAT |
| **priority** | P2 |
| **program** | `PO_HRM_CONTINUOUS_W8_20260807` |
| **parent** | ATT-LEAVE-BALANCE **QC-02 GWC** · CNS-WIRE CLOSED · FE 01g HOLD · U88 after ATT-COMP-TYPE QC-FE GWC OTC-03 CLOSED |
| **change_mode** | **ADD** docs-only disposition · **no** `apps/**` · **no** seed · **no** wipe seals |
| **portal_url** | N/A — SA docs seat (no browser UF invent) |
| **journey_l25** | **N/A deferred** — J-HRM-ATT-LVRULE-06 / UF-ATT-LEAVE-PANEL **not** promoted · `C-SLICE-≠-MODULE` |
| **crud_or_matrix** | AC-PLT-ATT-LEAVE-BAL-01g · VAL-ATT-LVRULE-CNS-08 · R-PLT-ATT-LVRULE-FE-01g · peer R-PLT-ATT-OTC-FE-ADMIN |
| **Verdict** | **CONFIRMED** — Option **B** **LOCKED** · **ACCEPT_AS_IS_P2 HOLD** · ba-process **HOLD** · FE/BE **HOLD** until sponsor FE-wave · honesty false · engine HOLD · DENY invent OT FE-ADMIN · DENY reopen COMP OTC-03 |
| **ack_status** | `PASS_TO_PM` |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-FE-01G-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-FE-01G-SA-01.md) |
| **qc_ref** | [`po-hrm-dynamic-config-platform-att-leave-balance-qc-02.md`](po-hrm-dynamic-config-platform-att-leave-balance-qc-02.md) GWC · FE 01g KEEP HOLD |
| **ba_ref** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01.md) AC-01g RETAIN |
| **sa_prior** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md) Option B Nest rule SoT RETAIN |
| **peer_cite** | COMP QC-FE GWC · **R-PLT-ATT-OTC-FE-ADMIN HOLD RETAIN** — cite ≠ invent OT FE-ADMIN |
| **U65** | zero-seed · SA observe/docs only |
| **OS honesty** | `C-SLICE-≠-MODULE` — ACCEPT HOLD ≠ attendance UAT / Phase1 / engine LIVE / invent FE |

### Honesty locks (mandatory — RETAIN)

| Flag / seal | Value | SA note |
|-------------|-------|---------|
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote |
| **F-ATT-LEAVE-04 engine LIVE** | **HOLD** | **DENIED** claim LIVE |
| **formula LIVE** | **HOLD / false** | COMP/OT formula RETAIN HOLD |
| Admin L1 `ATTLVRULEQA-MSK6G783` | **SEAL RETAIN** | **cấm reopen** |
| KEY Network `ATTLVRULEQA2-MSK79F2F` | **SEAL RETAIN** | CNS-WIRE CLOSED RETAIN |
| **R-PLT-ATT-LVRULE-FE-01g** | **ACCEPT_AS_IS_P2 HOLD** | Condition **KEEP** — not CLOSED · not WAIVED |
| COMP OTC-03 CLOSED · L1 `ATTCOMPQA-MSKARXQU` · QA-FE `ATTCOMPQAFE-MSKBBEJW` | **SEAL RETAIN** | **cấm reopen** |
| **R-PLT-ATT-OTC-FE-ADMIN** | **HOLD RETAIN** | **DENY invent** OT-comp FE-ADMIN this seat |
| OT-TYPE L1/FE · ATT CODE/WS/SHIFT/leave-type | **SEAL RETAIN** | **cấm reopen** |
| DOCS CH05e / CH05g · SRS v0.37 / v0.41 | **ACCEPT RETAIN** | no wipe |
| Module ATT UAT / Phase1 / UF 🟢 | **DENIED** | Slice ≠ module |
| Seed | **DENIED** (U65) | |

---

## Verdict summary

**CONFIRMED Option B LOCKED — ACCEPT_AS_IS_P2 HOLD** for residual **R-PLT-ATT-LVRULE-FE-01g** (R2).

Read: W8 board rows leave-balance QC-02 · FE 01g HOLD · QC-02 evidence · BA-01 AC-01g / VAL-CNS-08 · prior SA Option B Nest policy · peer COMP FE-ADMIN HOLD · R2 code audit BE `MVP_LEAVE_BALANCE_TYPES` panel + FE `resolveLeaveBalanceTypeCodes` catalog prefer + LeaveTab Nest type picker + ABSENT admin accrual FE.

**HOLD surfaces (named):**
1. Consumer **panel quỹ** — BE panel still fixed five MVP codes as sole response set when open EFF catalog exists (AC-01g / VAL-CNS-08 deferred).
2. Admin FE «**Quy tắc quỹ phép**» — ABSENT; L1 admin proven Network-only (peer FE-ADMIN class).
3. Grant/adjust **product** FE bind — invent KEY proven on gated assert-consumer only; product grant UI OUT.

**Not HOLD / SEALED:** Nest `att_leave_accrual_policy` admin L1 · invent `HRM-ATT-LVRULE-KEY` Network · leave-type UNKNOWN orthogonal · ledger read path · DOCS CH05e.

**Option A** (unlock BA→FE now) rejected as **default** — retain as **sponsor-gated** alternate only.  
**Option C** rejected — invent OT FE-ADMIN / waive AC / reopen COMP / flip ready.

**DENIED:** invent FE 01g Task mandatory · invent OT-comp FE-ADMIN · reopen COMP OTC-03 · reopen LVRULE L1/KEY · flip ready · engine LIVE · module ATT UAT · seed · claim AC-01g PASS · treat ACCEPT HOLD as Condition CLOSED.

| Gate item | Evidence | SA |
|-----------|----------|-----|
| Residual ID matches QC-02 | R-PLT-ATT-LVRULE-FE-01g P2 HOLD | 🟢 |
| AC-01g already in BA-01 | §6.1 / VAL-CNS-08 | 🟢 RETAIN — no new BA pack |
| Peer FE-ADMIN class | COMP R-PLT-ATT-OTC-FE-ADMIN HOLD | 🟢 cite |
| BE panel MVP-five | leave-balance.service.ts L50–58 · getLeaveBalancePanel uses fixed five | 🟢 AS-IS gap |
| FE catalog prefer partial | leaveBalance.ts resolveLeaveBalanceTypeCodes | 🟢 partial ≠ AC PASS |
| Admin FE ABSENT | no Quy tắc quỹ phép CRUD UI | 🟢 HOLD |
| Option B LOCKED | Spec §5 | 🟢 CONFIRMED R2 |
| Honesty / C-SLICE | ready=false · engine HOLD | 🟢 |
| apps/** / seed | none | 🟢 |
| NFD WriteAllText R2 | `.git`+`apps` True · Lengths ≥3072 | 🟢 |

---

## Options snapshot (for PM)

| Option | One-liner | Unlock? | Verdict |
|--------|-----------|---------|---------|
| **A** | ba-process FE inventory → FE (+BE panel EFF) now | Yes (mandatory wave) | **REJECT default** · sponsor-gated only |
| **B** | ACCEPT_AS_IS_P2 HOLD until sponsor opens FE wave | No | **LOCKED** |
| **C** | Invent OT FE-ADMIN / waive / reopen / flip | Destructive | **REJECT** |

**Weighted:** A 54 · **B 112** · C 8 (see spec §3).

---

## Condition disposition

| ID | Prior (QC-02) | After this SA (R2) |
|----|---------------|---------------------|
| **R-PLT-ATT-LVRULE-CNS-WIRE** | CLOSED | **RETAIN CLOSED** — not reopened |
| **R-PLT-ATT-LVRULE-FE-01g** | KEEP HOLD P2 · DENY invent FE | **ACCEPT_AS_IS_P2 HOLD** · Condition **KEEP** · unlock only on sponsor FE-wave |
| **F-ATT-LEAVE-04** | HOLD | **RETAIN HOLD** |
| COMP OTC-03 / FE-ADMIN OT | CLOSED / HOLD | **RETAIN** · **DENY invent FE-ADMIN** |
| Admin L1 / KEY Network | SEAL | **SEAL RETAIN** |

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| QC-02 DENY invent FE + peer FE-ADMIN HOLD | PRODUCT PROCESS | Yes → Option B |
| AC-01g already locked in BA-01 | PRODUCT SPEC | Yes → no ba-process unlock |
| BE MVP panel + ABSENT admin FE | PRODUCT GAP P2 | Yes → HOLD KEEP (not CLOSED) |
| L1 + KEY Network LIVE | PRODUCT PASS prior | Yes → integrity OK without FE |
| Invent OT FE-ADMIN / ready flip | PRODUCT DENIED | Yes → Option C REJECT |

---

## Residual (after SA)

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **R-PLT-ATT-LVRULE-FE-01g** | P2 **ACCEPT_AS_IS HOLD** | **pm** (board) · later **dev-fe**/**dev-be** only if sponsor opens FE wave | Keep HOLD stamp · **DENY invent** FE/BA/OT-ADMIN now |
| **F-ATT-LEAVE-04** | OUT HOLD | — | Accrue engine LIVE **DENIED** |
| Honesty / C-SLICE | — | **pm** | ready=false · no module ATT UAT |
| Peer COMP FE-ADMIN | HOLD RETAIN | — | **do not invent** |
| **U88 continuous** | — | **pm** | Next vertical/governance — **not** invent LVRULE FE |

**No residual P0/P1** opened by this seat. No ba-process/FE dispatch required.

---

## Evidence pack checklist

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `…-ATT-LVRULE-FE-01G-SA-01` (+ R2 dispatch) |
| 2 | Spec written NFD `.git` | ✅ program/specs/…-FE-01G-SA-01.md |
| 3 | Option A/B/C + trade-off | ✅ Option B LOCKED |
| 4 | HOLD surface inventory | ✅ panel · admin FE · grant product FE |
| 5 | DENY list | ✅ OT FE-ADMIN · COMP reopen · ready · engine · seed · module UAT |
| 6 | Honesty locks | ✅ |
| 7 | next_dispatch_prompt | ✅ ACCEPT HOLD → pm |
| 8 | ack_status | ✅ PASS_TO_PM |
| 9 | R2 path prove | ✅ WriteAllText Lengths |

---

## Path prove (WriteAllText NFD)

| Check | Expect |
|-------|--------|
| Root | NFD `Tài liệu` leaf where `.git` AND `apps` True |
| CLAUDE.md L1 | `hello claude abc abc abc` (sanity) |
| Spec Length | ≥ 3072 |
| Evidence Length | ≥ 3072 |
| NFC shadow write | **DENIED** |
| Encoding | UTF-8 no BOM |

---

## completion_report

**Closed:** SA Option/F.1 narrow pack for leave-balance **FE 01g** residual — **R2** NFD rewrite · HOLD surfaces named · Option **B ACCEPT_AS_IS_P2 HOLD LOCKED** · AC-01g RETAIN deferred · no ba-process unlock · no FE invent · DENY OT-comp FE-ADMIN invent · DENY reopen COMP OTC-03 / LVRULE L1 · honesty false · C-SLICE · docs-only on NFD git toplevel.

**Open:** Condition **R-PLT-ATT-LVRULE-FE-01g** remains HOLD P2 on board; engine HOLD; sponsor-gated Option A path documented in spec §5.2.

**next_owner:** **pm**

**ack_status:** **PASS_TO_PM**

**evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-att-lvrule-fe-01g-sa-01.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-FE-01G-SA-01-R2
from_role: sa
to_role: pm
lane: governance · U88 after ATT-COMP-TYPE QC-FE GWC
ack_status: PASS_TO_PM
verdict: Option B LOCKED — ACCEPT_AS_IS_P2 HOLD on R-PLT-ATT-LVRULE-FE-01g
PM actions (same session):
  1) Update PO_HRM_CONTINUOUS_W8 board: FE 01g = ACCEPT_AS_IS_P2 HOLD (KEEP Condition — not CLOSED / not WAIVED)
  2) DENY invent ba-process · DENY invent FE-01g · DENY invent OT-comp FE-ADMIN
  3) RETAIN seals: LVRULE L1+KEY · COMP OTC-03 CLOSED · OT-TYPE · ATT L1 · FE-ADMIN OT HOLD · honesty false · engine HOLD · C-SLICE
  4) Continue U88 next vertical/governance from continuous board (do not idle on this HOLD)
sponsor reopen only: message must say explicit «mở FE wave LVRULE 01g» → then optional BA ADD click-path → BE panel EFF/policy-bound → FE LeaveTab/admin → QA VAL-CNS-08 / UF-ATT-LEAVE-PANEL
spec: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-FE-01G-SA-01.md
evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-lvrule-fe-01g-sa-01.md
```

**PASS_TO_PM** — **CONFIRMED Option B ACCEPT_AS_IS_P2 HOLD** · NOT module ATT UAT · NOT Phase1 DONE · NOT invent FE.