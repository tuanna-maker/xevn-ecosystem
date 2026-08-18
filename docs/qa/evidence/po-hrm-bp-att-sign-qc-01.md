# Evidence — PO-HRM-BP-ATT-SIGN-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-QC-01` |
| **from_role** | qc |
| **to_role** | pm |
| **date** | 2026-08-05 |
| **lane** | L3 gate — **UF-HRM-ATT-SIGN / UC-BP-ATT-11 browser** (observe-only) |
| **entry** | QA [`po-hrm-bp-att-sign-qa-05.md`](po-hrm-bp-att-sign-qa-05.md) **PASS_TO_PM** · prior [`po-hrm-bp-att-sign-qa-04.md`](po-hrm-bp-att-sign-qa-04.md) **PASS_WITH_OBS** · API [`po-hrm-bp-att-sign-qc-scope-01.md`](po-hrm-bp-att-sign-qc-scope-01.md) **GWC scope_parity** |
| **spec_ref** | FR-UC-BP-ATT-11 · AC-ATT-SIGN-UF-01..07 · AC-ATT-SIGN-04 (Manifest bundle) · J-HRM-06c · [`po-hrm-bp-att-sign-uf-ba-01.md`](po-hrm-bp-att-sign-uf-ba-01.md) |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed |
| **runtime_commit** | `dc930c5` (QA-04/05) |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |

---

## Forbidden claims (QC hard lock)

| Claim | Status |
|-------|--------|
| **product GO** / product UAT DONE / Phase 1 DONE | **NOT claimed** (`product_go: false`) |
| **Attendance CLOSED** (module / program) | **NOT claimed** (`attendance_closed: false`) |
| **remaster DONE** / remaster_program_done | **NOT claimed** (`false`) |
| **Face LIVE** / D7 signed | **NOT claimed** |
| **Full QC GO** (product / Attendance module) | **NOT claimed** — browser lane **GWC** only |
| **scope_parity_ack** re-stamp | **NOT re-opened** — remains on [`po-hrm-bp-att-sign-qc-scope-01.md`](po-hrm-bp-att-sign-qc-scope-01.md) |

---

## 1. Executive verdict

**GO WITH CONDITIONS** — **UF-HRM-ATT-SIGN / UC-BP-ATT-11** browser lane (U65 · `:5173` embed · `ceo@xe.vn` / `main`).

| Layer | QA source | QC stamp |
|-------|-----------|----------|
| L0 stack | QA-05 PASS (`qc:dev-stack` checks + `qc:fe-be-health` exit 0) | **ACCEPT** (supporting) |
| L2 UF load / panel | QA-05 UF-01 🟢 | **ACCEPT** |
| L2 mutate sign ladder | QA-05 UF-02..04 🟢 · NV→QL→HCNS **3×201** | **ACCEPT** |
| L2 close + FE post-mutation | QA-05 UF-05 🟢 · POST close **201** · **Đã chốt** | **ACCEPT** (P0 regression from QA-04 **closed**) |
| L2 F5 persist | QA-05 UF-06 🟢 · `status=closed` | **ACCEPT** |
| L2.5 J-HRM-06c | QA-05 list→detail · sign→close→F5 🟢 | **ACCEPT** (close leg promoted) |
| UF-07 negative | QA-05 🟡 not run | **CONDITION** — see **C-UF-07-NEG** |
| FE **Gửi chờ ký** click | QA-04/05 skipped (no draft) | **CONDITION** — see **C-DRAFT-SUBMIT-FE** |
| API scope_parity (prior seat) | QC-SCOPE-01 GWC | **LINKED** — does not substitute UF GWC closure |

**Không** nâng GWC browser lane thành product GO · Attendance CLOSED · remaster DONE · Face LIVE.

---

## 2. Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `po-hrm-bp-att-sign-qa-05.md` | **PASS_TO_PM** · UF-01..06 🟢 · UF-07 🟡 · close **201** + F5 | **ACCEPT** primary browser evidence |
| `po-hrm-bp-att-sign-qa-04.md` | **PASS_WITH_OBS** · sign 🟢 · close **500** (schema) | **ACCEPT** regression baseline; UF-05/06 remediated in QA-05 |
| `po-hrm-bp-att-sign-qc-scope-01.md` | **GWC** API TR-CM-16 / SP-ATT-SIGN-01..04 only | **ACCEPT** — orthogonal; C-scope linkage below |
| `po-hrm-bp-att-sign-uf-ba-01.md` | AC definitions · J-HRM-06c · U65 rules | **ACCEPT** stamp authority |
| FE / BE delivery refs (PM entry) | fe-01 · fe-submit-01 · be-runtime · be-close-schema | **ACCEPT** as cited by QA; QC did not re-run Dev seats |

Honesty flags on QA-05 (`attendance_closed` / `product_go` / `remaster_program_done` = false) — **PASS** process.

Supporting artifact on disk: `docs/qa/evidence/_tmp-po-hrm-bp-att-sign-qa-05-browser.json` — **present**.

---

## 3. AC-ATT-SIGN-UF-01..07 — QC stamp (from QA-04 / QA-05)

| AC-ID | QA-04 | QA-05 | **QC stamp** | Evidence path |
|-------|-------|-------|--------------|---------------|
| **UF-01** | 🟢 | 🟢 | **ACCEPT 🟢** | QA-05 S0–S1 · `att-sign-panel` · GET signatures **200** |
| **UF-02** | 🟢 | 🟢 | **ACCEPT 🟢** | QA-05 S3 · NV POST **201** · `att-sign-confirm-employee` |
| **UF-03** | 🟢 | 🟢 | **ACCEPT 🟢** | QA-05 S3 · QL POST **201** · `direct_manager` |
| **UF-04** | 🟢 | 🟢 | **ACCEPT 🟢** | QA-05 S3 · HCNS **201** · `canCloseHint=true` |
| **UF-05** | 🔴 close **500** | 🟢 close **201** · **Đã chốt** | **ACCEPT 🟢** | QA-05 S4 · schema fix verified vs QA-04 P0 |
| **UF-06** | 🔴 not demonstrated | 🟢 F5 **`closed`** | **ACCEPT 🟢** | QA-05 S5 · badge + API persist |
| **UF-07** | 🟡 happy only | 🟡 negative **not run** | **CONDITION 🟡** | **C-UF-07-NEG** — not waived to 🟢 |

**Manifest AC-ATT-SIGN-04 (UF bundle):** **GWC** — compiler bundle **not** closed 🟢 until **C-UF-07-NEG** closed or time-boxed waiver with owner+expiry.

---

## 4. J-HRM-06c — QC stamp

| Step | QA-04 | QA-05 | **QC stamp** |
|------|-------|-------|--------------|
| List → detail (L2.5) | 🟢 | 🟢 | **ACCEPT 🟢** |
| Submit (FE **Gửi chờ ký**) | 🟡 skipped | 🟡 skipped | **CONDITION** — **C-DRAFT-SUBMIT-FE** |
| Sign ladder | 🟢 | 🟢 | **ACCEPT 🟢** |
| Close → F5 | 🔴 / partial | 🟢 | **ACCEPT 🟢** |

Journey **L2.5 close spine:** **ACCEPT** for sign→close→F5 on sheet `3934591a-50ec-452b-940f-7f29ede50272`. Full journey **GWC** until draft-submit FE leg documented or waived.

---

## 5. Conditions (must remain open or close via follow-up)

| ID | Condition | Owner | Priority | Close when |
|----|-----------|-------|----------|------------|
| **C-UF-07-NEG** | Negative «Chốt thiếu NV» — **409** + FE message; no bypass close | **qa** | P2 | Browser evidence on sheet with incomplete ladder · U65 · no seed |
| **C-DRAFT-SUBMIT-FE** | FE click **Gửi chờ ký** (`att-sheet-submit`) not executed — env had no **draft** row | **qa** (+ pm env) | P1 | New **draft** via SRS UF-HRM-16 FE chain → click submit → **201** + FE post-mutation + F5 |
| **C-SCOPE-PARITY-LINK** | API `scope_parity_ack` from **QC-SCOPE-01** — separate from UF browser | **pm** / **sa** | — | Already **GWC**; UF browser GWC **does not** demote API ack |
| **C-ATT-SIGN-04-BR** | Manifest **AC-ATT-SIGN-04** browser bundle | **qc** (later) or **pm** | P1 | UF-07 + draft submit closed or waived · then promote AC-ATT-SIGN-04 |
| **OBS-L0-UV-EXIT** | Windows node exit **3221226505** after `qc:dev-stack` | **devops** | P2 | Exit 0 on Windows or documented env waiver |
| **OBS-BOTH-SHEETS-CLOSED** | Pilot env: both sheets **closed** — repeat close needs reopen/new period | **pm** | P2 | U65 data path for next regression wave |

---

## 6. Regression closure (QA-04 → QA-05)

| Defect | QA-04 | QA-05 | QC |
|--------|-------|-------|-----|
| **P0-CLOSE-500-SCHEMA** (`closed_at` missing) | 🔴 POST close **500** | 🟢 POST close **201** | **CLOSED** on evidence chain — do not re-open without new FAIL |
| Submit/sign **404** (QA-03 class) | fixed QA-04 | stable QA-05 | **ACCEPT** closed |

---

## 7. Matrix / journey (QC instruction — not full promote)

| Artifact | QC instruction |
|----------|----------------|
| `USER_FLOW_OPERABILITY_MATRIX.md` UF-HRM-ATT-SIGN | May move toward **🟢** **happy path** with **GWC footnote** (UF-07 + draft submit) — **not** unconditional 🟢 |
| `PROGRAM_JOURNEY_MAP.md` J-HRM-06c | **🟡 GWC** — close leg promoted; submit FE leg open |
| Attendance module **CLOSED** | **false** |
| **product_go** | **false** |

---

## 8. Classification

| Class | Items |
|-------|-------|
| **PRODUCT (this WI — browser lane)** | UC-BP-ATT-11 happy path UF-01..06 + J-HRM-06c close spine |
| **CONDITION / OPEN** | C-UF-07-NEG · C-DRAFT-SUBMIT-FE · C-ATT-SIGN-04-BR |
| **LINKED (prior GWC)** | C-SCOPE-PARITY-LINK · `po-hrm-bp-att-sign-qc-scope-01.md` |
| **PROCESS OBS** | OBS-L0-UV-EXIT · OBS-BOTH-SHEETS-CLOSED |
| **FORBIDDEN** | product GO · Attendance CLOSED · remaster DONE · Face LIVE · full UF 🟢 without conditions |

---

## 9. completion_report

**Closed:** QC seat `PO-HRM-BP-ATT-SIGN-QC-01` — audited QA-05 **PASS_TO_PM** against UF-BA AC table and QA-04 regression context; **GO WITH CONDITIONS** for **UF-HRM-ATT-SIGN / UC-BP-ATT-11 browser lane**; stamped UF-01..06 and J-HRM-06c close leg **ACCEPT**; UF-07 and draft FE submit remain **CONDITION**; P0 close schema regression **CLOSED** on evidence.

**Open:** **C-UF-07-NEG** · **C-DRAFT-SUBMIT-FE** · **C-ATT-SIGN-04-BR** · OBS items.

**not promoted:** product GO · Attendance CLOSED · remaster DONE · Face LIVE · unconditional UF PASS · full product QC GO.

---

## 10. next_owner / next_dispatch_prompt

| Field | Value |
|-------|--------|
| **next_owner** | **pm** |
| **residual_auto_fix** | true — schedule QA only for open **CONDITION** rows |

### next_dispatch_prompt — qa (residuals only)

```text
ROLE: qa · work_item_id: PO-HRM-BP-ATT-SIGN-QA-07-NEG-01
from_role: pm
priority: P2
INTAKE: QC PO-HRM-BP-ATT-SIGN-QC-01 GWC — close C-UF-07-NEG only.
read_first: docs/qa/evidence/po-hrm-bp-att-sign-qc-01.md · po-hrm-bp-att-sign-uf-ba-01.md §6 UF-07
entry_criteria: U65 sheet submitted with NV step still pending (reopen sheet or new period via FE — zero-seed); qc:fe-be-health PASS
exit_criteria: Attempt Chốt before NV → POST close/sign guard **409** HRM-ATT-SIGN-INCOMPLETE (or spec code); FE shows business message; not 🟢 bypass
u65_zero_seed: true
cấm: seed · claim Attendance CLOSED / product GO / remaster DONE
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-bp-att-sign-qa-07-neg-01.md
```

### next_dispatch_prompt — qa (draft submit FE — P1)

```text
ROLE: qa · work_item_id: PO-HRM-BP-ATT-SIGN-QA-DRAFT-SUBMIT-01
from_role: pm
priority: P1
INTAKE: QC PO-HRM-BP-ATT-SIGN-QC-01 GWC — close C-DRAFT-SUBMIT-FE.
read_first: docs/qa/evidence/po-hrm-bp-att-sign-qc-01.md · po-hrm-bp-att-sign-qa-05.md OBS-NO-DRAFT-FE-SUBMIT
entry_criteria: FE UF-HRM-16 chain yields sheet status=draft or open eligible for Gửi chờ ký; att-sheet-submit visible; zero-seed
exit_criteria: Browser click Gửi chờ ký → POST submit **2xx**; FE post-mutation (submitted state); F5 persist; screenshot + Network
u65_zero_seed: true
cấm: seed · API-only submit without FE click
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-bp-att-sign-qa-draft-submit-01.md
```

**No dispatch** required for P0 browser happy path — already **ACCEPT** on QA-05. PM may defer P2 **C-UF-07-NEG** until env has incomplete ladder.

---

## 11. Handoff contract

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-QC-01` |
| **from_role** | qc |
| **to_role** | pm |
| **entry_criteria** | QA-05 PASS_TO_PM · evidence paths exist · forbidden flags false |
| **exit_criteria** | Verdict **GO WITH CONDITIONS** · AC stamped · conditions listed · PASS_TO_PM |
| **evidence_path** | `docs/qa/evidence/po-hrm-bp-att-sign-qc-01.md` |
| **needed_by** | same-session PM intake |
| **ack_status** | **PASS_TO_PM** |

**Verdict:** **GO WITH CONDITIONS** — **UF-HRM-ATT-SIGN / UC-BP-ATT-11 browser lane** (not product Attendance CLOSED).

**PASS_TO_PM**

---

*End evidence PO-HRM-BP-ATT-SIGN-QC-01 · ack_status: **PASS_TO_PM***
