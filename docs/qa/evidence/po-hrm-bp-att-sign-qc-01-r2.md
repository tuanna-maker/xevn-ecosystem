# Evidence — PO-HRM-BP-ATT-SIGN-QC-01-R2

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-QC-01-R2` |
| **from_role** | qc |
| **to_role** | pm |
| **date** | 2026-08-05 |
| **lane** | L3 gate — **UF-HRM-ATT-SIGN / UC-BP-ATT-11 browser** (observe-only) |
| **parent_gate** | [`po-hrm-bp-att-sign-qc-01.md`](po-hrm-bp-att-sign-qc-01.md) **GO WITH CONDITIONS** → **superseded for UF browser lane** by this R2 stamp |
| **entry** | QA-05 happy [`po-hrm-bp-att-sign-qa-05.md`](po-hrm-bp-att-sign-qa-05.md) · **C-DRAFT-SUBMIT-FE** [`po-hrm-bp-att-sign-qa-draft-submit-01.md`](po-hrm-bp-att-sign-qa-draft-submit-01.md) **PASS_TO_PM** · **C-UF-07-NEG** [`po-hrm-bp-att-sign-qa-07-neg-01.md`](po-hrm-bp-att-sign-qa-07-neg-01.md) **PASS_TO_PM** · prior UF-07 observe [`po-hrm-bp-att-sign-qc-01-uf07.md`](po-hrm-bp-att-sign-qc-01-uf07.md) |
| **spec_ref** | FR-UC-BP-ATT-11 · AC-ATT-SIGN-UF-01..07 · AC-ATT-SIGN-04 (Manifest bundle) · J-HRM-06c · [`po-hrm-bp-att-sign-uf-ba-01.md`](po-hrm-bp-att-sign-uf-ba-01.md) |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed |
| **runtime_commit** | `dc930c5` |
| **attendance_closed** | **false** |
| **product_go** | **false** |
| **remaster_program_done** | **false** |
| **Verdict** | **GO** |
| **scope** | **UF-HRM-ATT-SIGN browser lane only** — not product / Attendance module |
| **ack_status** | **PASS_TO_PM** |

---

## Forbidden claims (QC hard lock — unchanged)

| Claim | Status |
|-------|--------|
| **product GO** / product UAT DONE / **Phase 1 DONE** | **NOT claimed** (`product_go: false`) |
| **Attendance CLOSED** (module / program) | **NOT claimed** (`attendance_closed: false`) |
| **remaster DONE** / remaster_program_done | **NOT claimed** (`false`) |
| **Face LIVE** / D7 signed | **NOT claimed** |
| **Full QC GO** (product / Attendance module / all HRM) | **NOT claimed** — **UF browser lane GO** only |
| **scope_parity_ack** product-wide re-stamp | **NOT re-opened** — remains **GWC** on [`po-hrm-bp-att-sign-qc-scope-01.md`](po-hrm-bp-att-sign-qc-scope-01.md) |

---

## 1. Executive verdict

**GO** — **UF-HRM-ATT-SIGN / UC-BP-ATT-11** browser lane (U65 · `:5173` embed · `ceo@xe.vn` / `main`).

Parent **GO WITH CONDITIONS** ([`po-hrm-bp-att-sign-qc-01.md`](po-hrm-bp-att-sign-qc-01.md)) is **superseded for this lane** now that **C-DRAFT-SUBMIT-FE** and **C-UF-07-NEG** are **CLOSED** on the UF GWC ledger below. Residual items are **OBS / linked API GWC** only — they **do not** downgrade UF browser **GO**.

| Layer | QA source | QC stamp |
|-------|-----------|----------|
| L0 stack | QA-05 · QA-draft-submit · QA-07-neg (fe-be-health **0**) | **ACCEPT** (supporting) |
| L2 UF load / panel | QA-05 UF-01 | **ACCEPT 🟢** |
| L2 mutate sign ladder | QA-05 UF-02..04 | **ACCEPT 🟢** |
| L2 close + FE post-mutation | QA-05 UF-05..06 · sheet `3934591a-…` | **ACCEPT 🟢** |
| L2 draft → submit FE | QA-draft-submit · sheet `ae71f0b0-…` | **ACCEPT 🟢** — **C-DRAFT-SUBMIT-FE CLOSED** |
| L2 UF-07 negative | QA-07-neg | **ACCEPT 🟢** — **C-UF-07-NEG CLOSED** |
| L2.5 J-HRM-06c | Legs split QA-05 + QA-draft-submit | **ACCEPT 🟢** with **OBS-J-HRM-06c-FULL-E2E** (see §4) |
| Manifest **AC-ATT-SIGN-04** (UF bundle) | UF-01..07 closed on evidence | **ACCEPT 🟢** (browser bundle for this WI) |
| API scope_parity | QC-SCOPE-01 GWC | **LINKED** — orthogonal |

---

## 2. UF GWC ledger — condition closure (R2)

| Condition ID | QC-01 status | QA closure seat | **R2 ledger** |
|--------------|--------------|-----------------|---------------|
| **C-DRAFT-SUBMIT-FE** | OPEN (P1) | [`po-hrm-bp-att-sign-qa-draft-submit-01.md`](po-hrm-bp-att-sign-qa-draft-submit-01.md) · **Thêm bảng** → **Gửi chờ ký** **201** → **`att-sign-panel`** + F5 **`submitted`** | **CLOSED** |
| **C-UF-07-NEG** | OPEN (P2) | [`po-hrm-bp-att-sign-qa-07-neg-01.md`](po-hrm-bp-att-sign-qa-07-neg-01.md) · disabled Chốt · **409** `HRM-ATT-SIGN-INCOMPLETE` | **CLOSED** |
| **C-ATT-SIGN-04-BR** | OPEN | UF-01..07 + draft submit + UF-07 neg on file | **CLOSED** (browser manifest bundle) |
| **C-SCOPE-PARITY-LINK** | LINKED GWC | Unchanged — API seat only | **OPEN (linked)** — not UF browser blocker |
| **OBS-L0-UV-EXIT** | OBS | Windows exit **3221226505** after `qc:dev-stack` | **OBS** — P2 |
| **OBS-BOTH-SHEETS-CLOSED** | OBS | Mitigated by draft-submit **Thêm bảng** U65 path | **OBS** — informational |
| **OBS-REOPEN-FE** | — | QA-07 prep via POST reopen; no FE control | **OBS** — optional dev-fe |
| **OBS-J-HRM-06c-FULL-E2E** | — | New sheet `ae71f0b0-…` submit only; sign→close not one session | **OBS** — see §4 |

---

## 3. AC-ATT-SIGN-UF-01..07 — QC stamp (consolidated)

| AC-ID | Primary evidence | **QC stamp** |
|-------|------------------|--------------|
| **UF-01** | QA-05 S0–S1 · `att-sign-panel` · GET signatures **200** | **ACCEPT 🟢** |
| **UF-02** | QA-05 S3 · NV POST **201** | **ACCEPT 🟢** |
| **UF-03** | QA-05 S3 · QL POST **201** | **ACCEPT 🟢** |
| **UF-04** | QA-05 S3 · HCNS **201** · `canCloseHint=true` | **ACCEPT 🟢** |
| **UF-05** | QA-05 S4 · close **201** · **Đã chốt** | **ACCEPT 🟢** |
| **UF-06** | QA-05 S5 · F5 **`closed`** | **ACCEPT 🟢** |
| **UF-07** | QA-07-neg · FE disabled · BE **409** · stays **submitted** | **ACCEPT 🟢** |

**Draft submit (UF funnel leg, not separate AC row):** QA-draft-submit — **ACCEPT 🟢** (closes prior GWC gap on J-HRM-06c submit step).

Supporting artifacts on disk: `_tmp-po-hrm-bp-att-sign-qa-05-browser.json` · `_tmp-po-hrm-bp-att-sign-qa-draft-submit-01-browser.json` · `_tmp-po-hrm-bp-att-sign-qa-07-neg-01-browser.json` — **present**.

---

## 4. J-HRM-06c — QC stamp

| Step | Evidence | **QC stamp** |
|------|----------|--------------|
| List → detail (L2.5) | QA-05 | **ACCEPT 🟢** |
| Draft obtain (SRS add sheet) | QA-draft-submit run 1 **201** | **ACCEPT 🟢** |
| FE **Gửi chờ ký** → submitted | QA-draft-submit run 2 · `ae71f0b0-…` | **ACCEPT 🟢** |
| Sign ladder NV→QL→HCNS | QA-05 · `3934591a-…` | **ACCEPT 🟢** |
| Close → F5 closed | QA-05 | **ACCEPT 🟢** |

### OBS-J-HRM-06c-FULL-E2E (optional — not a GWC blocker)

**Observation:** Single browser session **draft → submit → sign → close → F5** on **one** sheet (`ae71f0b0-…`) was **not** re-run end-to-end after draft-submit (sign/close authoritative on `3934591a-…` via QA-05).

**QC classification:** **OBS** (P3) — legs are **independently ACCEPT** on U65 paths; combined spine is **compositionally covered**. PM may schedule one optional QA hygiene run; **not required** to maintain UF browser **GO**.

---

## 5. Entry audit (R2 handoff chain)

| Artifact | ack | QC |
|----------|-----|-----|
| `po-hrm-bp-att-sign-qa-05.md` | **PASS_TO_PM** | **ACCEPT** — happy sign + close + F5 |
| `po-hrm-bp-att-sign-qa-draft-submit-01.md` | **PASS_TO_PM** | **ACCEPT** — **C-DRAFT-SUBMIT-FE** |
| `po-hrm-bp-att-sign-qa-07-neg-01.md` | **PASS_TO_PM** | **ACCEPT** — **C-UF-07-NEG** |
| `po-hrm-bp-att-sign-qc-01.md` | **PASS_TO_PM** GWC | **SUPERSEDED** for UF browser verdict by this R2 **GO** |
| `po-hrm-bp-att-sign-qc-01-uf07.md` | **PASS_TO_PM** | **MERGED** into R2 UF-07 stamp |
| `po-hrm-bp-att-sign-qc-scope-01.md` | API GWC | **LINKED** unchanged |
| `po-hrm-bp-att-sign-uf-ba-01.md` | BA AC authority | **ACCEPT** |

Honesty flags on all QA seats (`attendance_closed` / `product_go` / `remaster_program_done` = false) — **PASS**.

---

## 6. Regression closure (unchanged from QC-01)

| Defect | Status |
|--------|--------|
| **P0-CLOSE-500-SCHEMA** (QA-04 → QA-05) | **CLOSED** — do not re-open without new FAIL |
| Submit/sign **404** (QA-03 class) | **CLOSED** on QA-04/05 chain |

---

## 7. Matrix / journey (QC instruction)

| Artifact | QC instruction |
|----------|----------------|
| `USER_FLOW_OPERABILITY_MATRIX.md` **UF-HRM-ATT-SIGN** | May stamp **🟢** for Dev8088 browser lane with footnote: **QC GO R2** · scope = UC-BP-ATT-11 embed · not product Attendance |
| `PROGRAM_JOURNEY_MAP.md` **J-HRM-06c** | May promote to **🟢** with **OBS-J-HRM-06c-FULL-E2E** footnote |
| Attendance module **CLOSED** | **false** |
| **product_go** | **false** |
| **Phase 1 DONE** | **false** |
| **remaster_program_done** | **false** |
| **Face LIVE** | **false** |

---

## 8. What remains NOT claimed (explicit)

Even with **GO** on **UF-HRM-ATT-SIGN browser lane**, QC **does not** claim:

1. **Attendance CLOSED** — chấm công module / program sign-off.
2. **product GO** — product-wide UAT or release readiness.
3. **remaster_program_done** — UI remaster / excellence program complete.
4. **Face LIVE** / D7 — mobile face or signed mobile lane.
5. **Phase 1 DONE** — program exit / QC S5 product gate.
6. **Full HRM / full Attendance QC GO** — other UF rows, payroll, leave, etc.
7. **API scope_parity full GO** — [`po-hrm-bp-att-sign-qc-scope-01.md`](po-hrm-bp-att-sign-qc-scope-01.md) **GWC** remains until PM/SA closes separately.

---

## 9. completion_report

**Closed:** QC seat `PO-HRM-BP-ATT-SIGN-QC-01-R2` — audited QA-05 + QA-draft-submit + QA-07-neg **PASS_TO_PM**; **UF GWC ledger** **C-DRAFT-SUBMIT-FE** and **C-UF-07-NEG** **CLOSED**; **AC-ATT-SIGN-UF-01..07** and **AC-ATT-SIGN-04** browser bundle **ACCEPT 🟢**; verdict **GO** for **UF-HRM-ATT-SIGN browser lane only**.

**Open (non-blocking):** **C-SCOPE-PARITY-LINK** (API GWC) · **OBS-L0-UV-EXIT** · **OBS-REOPEN-FE** · **OBS-J-HRM-06c-FULL-E2E** (optional hygiene).

**not promoted:** product GO · Attendance CLOSED · remaster DONE · Face LIVE · Phase 1 DONE · full product QC GO.

---

## 10. next_owner / next_dispatch_prompt

| Field | Value |
|-------|--------|
| **next_owner** | **pm** |
| **residual_auto_fix** | false for P0 UF browser — lane **GO**; optional OBS only |

**No mandatory `next_dispatch_prompt`** for UF-HRM-ATT-SIGN browser closure.

Optional (PM discretion — not required for this **GO**):

```text
ROLE: qa · work_item_id: PO-HRM-BP-ATT-SIGN-QA-06c-FULL-E2E-01
priority: P3 (optional hygiene)
INTAKE: QC R2 OBS-J-HRM-06c-FULL-E2E — one U65 session on ae71f0b0 (or new draft): submit → sign → close → F5.
entry_criteria: qc:fe-be-health PASS; zero-seed
exit_criteria: Single-sheet browser JSON + screens; ack PASS_TO_PM; still cấm Attendance CLOSED / product GO
evidence_path: docs/qa/evidence/po-hrm-bp-att-sign-qa-06c-full-e2e-01.md
```

```text
ROLE: devops · work_item_id: PO-HRM-BP-ATT-SIGN-OBS-L0-UV-01
priority: P2 (optional)
INTAKE: OBS-L0-UV-EXIT Windows 3221226505 after qc:dev-stack
exit_criteria: Root cause or documented waiver · exit 0 on Windows CI/agent
```

---

## 11. Handoff contract

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-QC-01-R2` |
| **from_role** | qc |
| **to_role** | pm |
| **entry_criteria** | QA-05 + QA-draft-submit + QA-07-neg PASS_TO_PM · parent QC-01 GWC · forbidden flags false |
| **exit_criteria** | **GO** UF browser lane · GWC ledger conditions closed · OBS documented · **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-bp-att-sign-qc-01-r2.md` |
| **needed_by** | same-session PM intake |
| **ack_status** | **PASS_TO_PM** |

**Verdict:** **GO** — **UF-HRM-ATT-SIGN / UC-BP-ATT-11 browser lane** (not product Attendance CLOSED).

**PASS_TO_PM**

---

*End evidence PO-HRM-BP-ATT-SIGN-QC-01-R2 · ack_status: **PASS_TO_PM***
