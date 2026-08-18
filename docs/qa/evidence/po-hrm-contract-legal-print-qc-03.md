# Evidence — `PO-HRM-CONTRACT-LEGAL-PRINT-QC-03`

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-QC-03` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | L3 narrow gate — **library Publish/Pull/Apply browser slice** (`C-SLICE-≠-MODULE`) |
| **priority** | P0 · close FE-04 SWC + QA-03 retest · honesty lock · deny printable module UAT |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` |
| **Verdict** | **GO WITH CONDITIONS** — PUB/PULL/APPLY U65 **SEALED**; `contracts_printable_ready=false` **LOCKED**; module printable UAT **DENIED** |
| **ack_status** | `PASS_TO_PM` |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-QA-03` `PASS_TO_PM` retest stamp **`CTR3-J0T6L2`** |
| **qa_ref** | [`po-hrm-contract-legal-print-qa-03.md`](po-hrm-contract-legal-print-qa-03.md) |
| **fe_ref** | [`po-hrm-contract-legal-print-fe-04.md`](po-hrm-contract-legal-print-fe-04.md) · **D-CTR-FE-HRMAPI-COMMENT-SWC CLOSED** |
| **machine** | [`_tmp-po-hrm-contract-legal-print-qa-03.FINAL.json`](_tmp-po-hrm-contract-legal-print-qa-03.FINAL.json) · stamp **`CTR3-J0T6L2`** |
| **must_keep_parents** | QC-01 print-spine GWC · QC-02 PDF binary GWC · UF-HRM-02 · Wave A work_location · FE-01 DnD |
| **screens** | `docs/qa/evidence/screens/po-hrm-contract-legal-print-qa-03/` (00–10) |
| **program** | `PO-HRM-CONTINUOUS-W7-20260807` (W7.5) · peer W8 continuous |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — library PUB/PULL/APPLY ≠ contracts printable module UAT |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **contracts_printable_ready** | **false** | **DENIED** flip / invent printable UAT |
| **Module printable UAT / DONE** | **DENIED** | Slice GWC ≠ module GO |
| **product_go / production GO** | **DENIED** | Out of scope |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Machine `denied[]` + QA stamp |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT close of browser library Publish → member Pull/Apply slice after FE-04 SWC fix + QA-03 retest stamp **`CTR3-J0T6L2`**.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Holding Phát hành POST 201 + F5 row v6 | Machine `AC-HOLDING-PUBLISH` · PNG 01/02 · `HRM-CTR-PUB-201` | 🟢 **ACCEPT** |
| Member Pull/Apply trsport 201 | Machine `AC-MEMBER-PULL-APPLY` · PNG 03–05 · `HRM-CTR-PULL-200` / `HRM-CTR-APPLY-200` | 🟢 **ACCEPT** |
| Origin 4-field badges | `fourFieldOk=true` · CL=12 TPL=13 · PNG 06 | 🟢 **ACCEPT** |
| `company_id` query-only n=3 | `AC-COMPANY-ID-QUERY-ONLY` allQueryOnly | 🟢 **ACCEPT** |
| UF-HRM-02 + print-spine smoke | `HD-0U66Z` · spineVisible · PNG 09/10 · work_location stamp | 🟢 **ACCEPT** must_keep |
| Honesty stamp visible | Settings + edit spine orange line `contracts_printable_ready=false` | 🟢 **RETAIN** |
| D-CTR-FE-HRMAPI-COMMENT-SWC | FE-04 READY + Vite `hrmApi.ts` 200 + QA retest | 🟢 **CLOSED** |
| must_keep wipe | print-spine / PDF BE-02 / Wave A / FE-01 DnD / prior GWC | 🟢 **not wiped** |
| Process | dndStorm=0 · uncaught=0 · pageErr=0 · console 400 expected (NEG apply) | 🟢 **ACCEPT** |

**Cấm:** `contracts_printable_ready=true` · printable module UAT/DONE · invent GO full contracts · Phase 1 DONE · seed · reopen must_keep GWC without defect.

**Scope note:** This seal **only** closes library PUB/PULL/APPLY browser + SWC defect. Parent QC-01 print-spine + QC-02 PDF binary GWC remain binding. **NOT** Phase 1 DONE. **NOT** contracts printable module UAT-ready. **J-HRM-CTR-04..07** remain DRAFT paper (deferred — ≠ this slice).

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QA-03 prior FAIL | `po-hrm-contract-legal-print-qa-03.md` §1 stamp `CTR3-J0BWZL` | FAIL_TO_PM · SWC blank Settings | **ACCEPT** audit trail |
| FE-04 FIX | `po-hrm-contract-legal-print-fe-04.md` | READY_FOR_QA · D-CTR CLOSED | **ACCEPT** |
| QA-03 retest | same MD § RETEST + FINAL JSON | PASS_TO_PM · `CTR3-J0T6L2` | **ACCEPT** U65 |

### Machine JSON spot (stamp `CTR3-J0T6L2`)

| Signal | Value | QC |
|--------|-------|-----|
| `env.STAMP` | `CTR3-J0T6L2` | 🟢 |
| `persona.member` | **`trsport`** (not portal alias `du-lich`) | 🟢 |
| `l0` portal/hrm/xbos | 200 | 🟢 |
| `honesty.contracts_printable_ready` | **false** · `claimed=false` · `seed_used=false` | 🟢 |
| `denied[]` | ready=true · seed · invent_printable_uat · claim_module_DONE | 🟢 |
| Publish | POST **201** `HRM-CTR-PUB-201` v6 · body `{label_vi}` only | 🟢 |
| Pull | POST **201** `HRM-CTR-PULL-200` trsport · upserted=25 · skip/conflict `[]` | 🟢 |
| Apply | POST **201** `HRM-CTR-APPLY-200` · fourFieldOk **true** | 🟢 |
| company_id query-only | n=3 · bodyHasCompanyId=false | 🟢 |
| UF-HRM-02 | PASS · code **`HD-0U66Z`** · spineChrome=true | 🟢 |
| NEG finance apply | **400** `HRM-CTR-PUB-NOTHING-TO-APPLY` | 🟢 |
| `AC-NEG-CODE-CONFLICT` | **OBS** (U65 no invent collide) | 🟡 OBS idle-ok |
| `residuals` | `[]` | 🟢 product slice |
| `overall` / `ack_status` | **PASS** / **PASS_TO_PM** | 🟢 |

### Screenshot visual spot (QC)

| File | QC observation |
|------|----------------|
| `00-holding-settings.png` | Holding Phát hành chrome · honesty **false** orange line · versions table |
| `02-publish-row-f5.png` / history | v6 `QA-03 FE phát hành CTR3-J0T6L2` published |
| `06-origin-badges.png` | Member zone · v6 selected · Kéo gói / Áp dụng · DnD must_keep tab |
| `09-uf02-after-save.png` | Contract **HD-0U66Z** saved |
| `10-print-spine-chrome.png` | Edit HD-0U66Z · work_location `… CTR3-J0T6L2` · print-spine · honesty **false** |
| Screens dir | **11/11** primary PNGs present (00–10) |

---

## Gate AC audit (browser 1–5)

| # | AC / Check | Spec / dispatch | QA-03 retest | QC |
|---|------------|-----------------|--------------|-----|
| 1 | Holding Phát hành → POST 2xx → versions + F5 | U65 library | 🟢 | 🟢 **ACCEPT** → **SEAL** |
| 2 | Member Pull → 2xx · skip/conflict when returned | U65 · OU `trsport` | 🟢 (empty arrays → UI N/A OK) | 🟢 **ACCEPT** |
| 3 | Member Apply → origin 4 overlay fields | U65 | 🟢 fourFieldOk | 🟢 **ACCEPT** |
| 4 | `company_id` query only | contract | 🟢 n=3 | 🟢 **ACCEPT** |
| 5 | Smoke UF-HRM-02 + print-spine · honesty false | must_keep | 🟢 | 🟢 **ACCEPT** / honesty **LOCKED** |
| — | D-CTR-FE-HRMAPI-COMMENT-SWC | FE-04 | CLOSED | 🟢 **CLOSED** |
| — | Wipe must_keep GWC | cấm | not touched | 🟢 **RETAIN** |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this seal | QC |
|---------|-------------------|-----|
| **J-HRM-03** | Host list→edit UF-HRM-02 smoke (`HD-0U66Z`) + print-spine chrome | 🟢 **PASS** re-smoke (this stamp) |
| **UF-HRM-02** | Contract create/save must_keep | 🟢 **PASS** |
| Print-spine AC (QC-01 GWC) | Retained · not re-opened | 🟢 host retained |
| PDF binary (QC-02 GWC) | Retained · not re-opened | 🟢 host retained |
| **J-HRM-CTR-04..07** | Template matrix / open catalog paper DRAFT | ⬜ **DEFERRED** — ≠ library PUB/PULL/APPLY slice · **≠** printable UAT |
| Module contracts printable UAT | Out of scope | **DENIED** |

---

## Commands (gate / spot)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-contract-legal-print-qa-03.md` | **FAIL** 4/8 (`command_table` · `journey_l25` · `crud_or_matrix` · `residual_section`) | **PROCESS OBS** — not product demote; QC consolidates this file |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-contract-legal-print-qc-03.md` | **PASS** exit **0** (8/8) — after this write | PRODUCT gate OK |
| QA cited `pnpm run qc:dev-stack` + `qc:fe-be-health` | ALL PASS at capture | ENV OK at capture |
| QA harness `node scripts/qa/_tmp-po-hrm-contract-legal-print-qa-03.mjs` | exit **0** · stamp `CTR3-J0T6L2` · PASS_TO_PM | PRODUCT OK |
| FE-04 mount Vite `hrmApi.ts` | **200** · PASS_MOUNT | PRODUCT OK (defect closed) |

### L2.5 / CRUD matrix (QC consolidated)

| Row | Type | Result |
|-----|------|--------|
| J-HRM-03 list→edit HD-0U66Z + spine | L2.5 host | **PASS** |
| UF-HRM-02 save | CRUD mutate FE | **PASS** |
| Holding publish v6 | CRUD mutate FE | **PASS** |
| Member pull/apply trsport | CRUD mutate FE | **PASS** |
| Origin 4-field overlay | read after apply | **PASS** |
| company_id query-only | contract | **PASS** |
| J-HRM-CTR-04..07 | L2.5 paper | **DEFERRED** (not in this seal) |

---

## Classification

| Item | Class | Disposition |
|------|-------|-------------|
| Library PUB/PULL/APPLY browser AC 1–5 | PRODUCT | **CLOSED** this gate (stamp CTR3-J0T6L2) |
| D-CTR-FE-HRMAPI-COMMENT-SWC | PRODUCT | **CLOSED** (FE-04 + retest) |
| Q-CTR-01 group publish path (browser) | PRODUCT | **CLOSED** this seal (was OPEN on QC-02) |
| AC-NEG-CODE-CONFLICT not exercised | PROCESS OBS | Idle-ok under U65 (no invent collide) |
| Skip/conflict UI empty arrays | PROCESS OBS | Idle-ok — API returned `[]`; UI not required |
| OU alias `du-lich` ≠ HRM slug | PROCESS OBS / harness | Fixed to `trsport` — lesson retained |
| QA pack verify 4/8 | **PROCESS OBS** | QC file consolidates 8/8 |
| Honesty / module UAT | GOVERNANCE | **DENIED** ready=true |
| J-HRM-CTR-04..07 DRAFT | GOVERNANCE / backlog | Deferred — not reopen this GWC |

---

## Conditions (GWC — bounded)

1. **Library PUB/PULL/APPLY browser** — **CLOSED / SEALED** (this QC-03 · stamp `CTR3-J0T6L2`).
2. **D-CTR-FE-HRMAPI-COMMENT-SWC** — **CLOSED** (FE-04).
3. **Honesty** — `contracts_printable_ready=false` **LOCKED**; **NOT** Phase 1 DONE; **NOT** printable module UAT-ready; **NOT** invent GO full contracts.
4. **must_keep retained** — print-spine QC-01 GWC · PDF QC-02 GWC · UF-HRM-02 · Wave A work_location · FE-01 DnD — **cấm reopen without defect**.
5. **Deferred (not blockers for this seal):** J-HRM-CTR-04..07 DRAFT; MergeToken `custom.emp`; DEC client API DOC-DELTA (R-PLT-DEC-02) — continuous wave U88.
6. **OBS idle-ok:** CODE-CONFLICT NEG without seed invent; skip/conflict chrome when API empty.

---

## Residual

| ID | Sev | Owner | Status |
|----|-----|-------|--------|
| Library PUB/PULL/APPLY browser | P0 was | — | **CLOSED** (QA-03 + this QC) |
| D-CTR-FE-HRMAPI-COMMENT-SWC | P0 was | — | **CLOSED** |
| Q-CTR-01 group publish (browser path) | P2 was | — | **CLOSED** this seal |
| Printable module UAT | — | — | **DENIED** (`contracts_printable_ready=false`) |
| J-HRM-CTR-04..07 paper DRAFT | P2 backlog | ba-docs / qa later | **DEFERRED** — ≠ this seal |
| MergeToken `custom.emp` | residual program | sa / ba after DEC·EMP | **OPEN** continuous W8 |
| R-PLT-DEC-02 client API DOC-DELTA F-DEC-CAT-* | P2 governance | **ba-docs** | **OPEN** — U88 next |
| AC-NEG-CODE-CONFLICT UI | OBS | qa optional | Idle-ok U65 |

**No P0/P1 open on this library publish slice → GWC allowed.**

---

## completion_report

QC L3 narrow gate **GO WITH CONDITIONS**: library Publish/Pull/Apply browser **SEALED**. Audited QA-03 RETEST MD + FINAL JSON stamp **`CTR3-J0T6L2`** + FE-04 READY + PNGs 00/06/10. Proven: Holding POST **201** `HRM-CTR-PUB-201` v6+F5; member **trsport** pull/apply **201**; origin 4-field **PASS**; company_id query-only n=3; UF-HRM-02 **`HD-0U66Z`** + print-spine + work_location must_keep; honesty **false** visible; **D-CTR-FE-HRMAPI-COMMENT-SWC CLOSED**; must_keep prior GWC **not wiped**. QA pack 4/8 = PROCESS OBS; this QC pack targets 8/8. No seed · no apps/** · **DENIED** `contracts_printable_ready=true` / invent printable module UAT / Phase 1 DONE / claim printable DONE. **NOT** module GO.

## next_owner

**pm** — bus INTAKE + U88 governance: dispatch **ba-docs** DEC API DOC-DELTA (or MergeToken residual) — **do not** flip `contracts_printable_ready`.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DOCS-01
from_role: pm
to_role: ba-docs
lane: governance
parent: PO-HRM-CONTRACT-LEGAL-PRINT-QC-03 GO WITH CONDITIONS (CTR3-J0T6L2)
program: PO-HRM-CONTINUOUS-W8-20260807
spec_ref: R-PLT-DEC-02 · docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01.md · DEC-VERTICAL-SA-01
honesty: all *_ready=false · C-SLICE-≠-MODULE · contracts_printable_ready=false LOCKED
must_keep: CTR library PUB/PULL/APPLY QC-03 GWC · print-spine QC-01 · PDF QC-02 · EMP DOC/ET L1 · DEC WH spine

entry_criteria:
- QC-03 GWC sealed: docs/qa/evidence/po-hrm-contract-legal-print-qc-03.md
- DEC SA/BA/DATA CONFIRMED chain on W8 board
- residual R-PLT-DEC-02 client API DOC-DELTA F-DEC-CAT-* open

exit_criteria:
1) ADD-only client API/DB DOC-DELTA for F-DEC-CAT-TYP/EFF (mục đích · nghiệp vụ · bước SRS) — no wipe
2) Evidence docs/qa/evidence/po-hrm-dynamic-config-platform-dec-docs-01.md · PASS_TO_PM
3) DENY invent QSĐ MergeToken print GĐ2 · DENY flip any *_ready
4) next_dispatch_prompt → DEC-BE-01 if unlocked OR MergeToken custom.emp SA residual

cấm: seed · apps/** code · wipe CTR/EMP seals · claim printable/personnel/payroll ready
```

---

## Residual (explicit for pack gate)

No residual P0/P1 on sealed library PUB/PULL/APPLY slice. Residual program (deferred): J-HRM-CTR-04..07 DRAFT; MergeToken `custom.emp`; R-PLT-DEC-02 ba-docs — owners above. Honesty: `contracts_printable_ready=false` LOCKED.
