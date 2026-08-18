# Evidence — PO-HRM-BP-ATT-SIGN-QC-01-UF07

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-QC-01-UF07` |
| **from_role** | qc |
| **to_role** | pm |
| **date** | 2026-08-05 |
| **lane** | L3 observe-only — **AC-ATT-SIGN-UF-07** condition closure |
| **parent_gate** | [`po-hrm-bp-att-sign-qc-01.md`](po-hrm-bp-att-sign-qc-01.md) **GO WITH CONDITIONS** |
| **entry** | QA [`po-hrm-bp-att-sign-qa-07-neg-01.md`](po-hrm-bp-att-sign-qa-07-neg-01.md) **PASS_TO_PM** |
| **spec_ref** | AC-ATT-SIGN-UF-07 · [`po-hrm-bp-att-sign-uf-ba-01.md`](po-hrm-bp-att-sign-uf-ba-01.md) |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed |
| **runtime_commit** | `dc930c5` (aligned with QA-07-NEG) |
| **attendance_closed** | **false** |
| **product_go** | **false** |
| **remaster_program_done** | **false** |
| **ack_status** | **PASS_TO_PM** |

---

## Forbidden claims (QC hard lock — unchanged)

| Claim | Status |
|-------|--------|
| **product GO** / product UAT DONE / Phase 1 DONE | **NOT claimed** |
| **Attendance CLOSED** (module / program) | **NOT claimed** |
| **remaster DONE** / remaster_program_done | **NOT claimed** |
| **Full QC GO** (product / Attendance module) | **NOT claimed** |
| **Unconditional UF browser 🟢** (all conditions cleared) | **NOT claimed** — parent **GWC** persists |

---

## 1. Executive summary

**Condition C-UF-07-NEG: CLOSED** — QC audited QA seat `PO-HRM-BP-ATT-SIGN-QA-07-NEG-01` and **ACCEPT 🟢** for **UF-07** (incomplete ladder · close blocked FE + **409** BE).

**Parent gate verdict:** remains **GO WITH CONDITIONS** on [`po-hrm-bp-att-sign-qc-01.md`](po-hrm-bp-att-sign-qc-01.md) until **C-DRAFT-SUBMIT-FE** closes (or time-boxed waiver with owner+expiry). **C-DRAFT-SUBMIT-FE** stays **OPEN** — no draft FE submit evidence on file; QC did **not** waive or close it.

---

## 2. Entry audit (QA handoff)

| Check | Result |
|-------|--------|
| QA artifact path | **present** — `po-hrm-bp-att-sign-qa-07-neg-01.md` |
| ack_status | **PASS_TO_PM** |
| Supporting JSON | **present** — [`_tmp-po-hrm-bp-att-sign-qa-07-neg-01-browser.json`](_tmp-po-hrm-bp-att-sign-qa-07-neg-01-browser.json) |
| Screens | **cited** — `docs/qa/evidence/screens/po-hrm-bp-att-sign-qa-07-neg-01/` |
| U65 honesty flags | **PASS** — `attendance_closed` / `product_go` / `remaster_program_done` = false |
| Forbidden claims in QA | **PASS** — no Attendance CLOSED / product GO / remaster DONE |
| L0 cited | QA pre-run `qc:fe-be-health` exit **0** — **ACCEPT** (supporting, not re-run by QC) |

---

## 3. AC-ATT-SIGN-UF-07 — QC stamp

| AC-ID | QA verdict | QC audit | **QC stamp** |
|-------|------------|----------|--------------|
| **UF-07** | 🟢 incomplete ladder | FE `att-sign-close-sheet` **disabled** (`can_close=false`); no proxy POST `/close`; direct POST **409** `HRM-ATT-SIGN-INCOMPLETE`; sheet **`submitted`** after attempt | **ACCEPT 🟢** |

**Interpretation:** Primary guard (FE must not enable Chốt when mandatory steps incomplete) **verified**. Secondary guard (BE **409**, not **500**) **verified**. Aligns with BA `must_keep` on sign panel.

**Regression note:** QA-05 happy close **201** on complete ladder **not re-run** this seat (reopen reset ladder) — **ACCEPT** as documented; QA-05 chain remains authoritative for UF-05/06.

---

## 4. Condition registry (this seat)

| ID | Prior (QC-01) | **After UF07 QC** | Owner | Notes |
|----|---------------|-------------------|-------|-------|
| **C-UF-07-NEG** | OPEN / CONDITION | **CLOSED** | — | Closed on QA-07-NEG evidence + this QC stamp |
| **C-DRAFT-SUBMIT-FE** | OPEN | **OPEN** (unchanged) | qa (+ pm env) | No draft FE chain evidence — **not** closed by this seat |
| **C-ATT-SIGN-04-BR** | OPEN | **OPEN** | qc / pm | Manifest bundle still **GWC** until draft submit closed/waived |
| **C-SCOPE-PARITY-LINK** | LINKED GWC | **LINKED** (unchanged) | pm / sa | Orthogonal to UF-07 |

---

## 5. Process observation — reopen path (not a GWC blocker)

| ID | Observation | QC classification |
|----|-------------|-------------------|
| **OBS-REOPEN-FE** | Env prep used **POST reopen** (F-ATT-SHEET-03) — **no FE «Hủy chốt»** in build `:5173` | **OBS** — optional **dev-fe** if product wants U65 reopen without API; **does not** block **C-UF-07-NEG** closure or UF-07 🟢 |

Reopen via authenticated API is documented SRS mutate (archives prior sign steps), not seed — **ACCEPT** for negative-test prep under observe-only audit.

---

## 6. Parent gate delta (QC-01 refresh pointer)

PM / QC may update parent §3 UF-07 row and §5 **C-UF-07-NEG** when consolidating gates:

| Parent item | Update |
|-------------|--------|
| UF-07 QC stamp | **CONDITION 🟡** → **ACCEPT 🟢** (via this file) |
| **C-UF-07-NEG** | → **CLOSED** |
| Parent **Verdict** | **GWC** until **C-DRAFT-SUBMIT-FE** (and **C-ATT-SIGN-04-BR** policy) |

**not promoted:** product GO · Attendance CLOSED · remaster DONE · full browser lane unconditional GO.

---

## 7. completion_report

**Closed:** **C-UF-07-NEG**; QC **ACCEPT 🟢** **AC-ATT-SIGN-UF-07** on observe-only audit of QA-07-NEG.

**Open (parent GWC):** **C-DRAFT-SUBMIT-FE** · **C-ATT-SIGN-04-BR** · linked scope GWC · OBS-L0-UV-EXIT · OBS-BOTH-SHEETS-CLOSED.

**Optional residual:** **OBS-REOPEN-FE** — FE reopen control; no dispatch required for UF-07 closure.

---

## 8. Handoff contract

```yaml
work_item_id: PO-HRM-BP-ATT-SIGN-QC-01-UF07
from_role: qc
to_role: pm
entry_criteria: QA PO-HRM-BP-ATT-SIGN-QA-07-NEG-01 PASS_TO_PM · C-UF-07-NEG close request from QC-01 GWC
exit_criteria: C-UF-07-NEG stamped CLOSED · UF-07 ACCEPT 🟢 · parent GWC unchanged except UF-07 condition · forbidden flags false
evidence_path: docs/qa/evidence/po-hrm-bp-att-sign-qc-01-uf07.md
needed_by: same-session PM intake
ack_status: PASS_TO_PM
pm_dispatch_hint: PO-HRM-BP-ATT-SIGN-QA-DRAFT-SUBMIT-01 — close C-DRAFT-SUBMIT-FE (P1); optional dev-fe OBS-REOPEN-FE
completion_report: |
  C-UF-07-NEG closed on QA negative evidence. UF-07 ACCEPT. Parent PO-HRM-BP-ATT-SIGN-QC-01 remains GWC until draft FE submit condition closes.
next_owner: pm
next_dispatch_prompt: |
  PM intake PASS_TO_PM PO-HRM-BP-ATT-SIGN-QC-01-UF07 — merge UF-07 stamp into QC-01 if consolidating;
  dispatch QA PO-HRM-BP-ATT-SIGN-QA-DRAFT-SUBMIT-01 for C-DRAFT-SUBMIT-FE only.
  Do not claim attendance_closed / product_go / remaster_program_done.
```

**Verdict (this seat):** **C-UF-07-NEG CLOSED** · **UF-07 ACCEPT 🟢** · parent **GO WITH CONDITIONS** unchanged.

**PASS_TO_PM**

---

*End evidence PO-HRM-BP-ATT-SIGN-QC-01-UF07 · ack_status: **PASS_TO_PM***
