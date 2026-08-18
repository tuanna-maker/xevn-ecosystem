# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | L3 gate — **MergeToken Settings browser slice** (`C-SLICE-≠-MODULE`) |
| **priority** | Certify **AC-PLT-CTR-05** UF · honesty DENIED printable / Phase1 |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` |
| **Verdict** | **GO WITH CONDITIONS** — AC-PLT-CTR-05 Settings MergeToken UF CERTIFIED |
| **ack_status** | `PASS_TO_PM` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` |
| **qa_ref** | [`po-hrm-dynamic-config-platform-qa-02.md`](po-hrm-dynamic-config-platform-qa-02.md) stamp **`PLTQA2-IEWURI`** |
| **qa_l1_secondary** | [`po-hrm-dynamic-config-platform-qa-01.md`](po-hrm-dynamic-config-platform-qa-01.md) — AC-05 **SUPERSEDED** by QA-02 |
| **fe_ref** | [`po-hrm-dynamic-config-platform-fe-01.md`](po-hrm-dynamic-config-platform-fe-01.md) READY_FOR_QA |
| **be_ref** | [`po-hrm-dynamic-config-platform-be-01.md`](po-hrm-dynamic-config-platform-be-01.md) READY_FOR_QA |
| **spec_ref** | API-01 / BA **AC-PLT-CTR-05** · F-PLT-TOK-01..03 |
| **machine** | [`_tmp-po-hrm-dynamic-config-platform-qa-02.FINAL.json`](_tmp-po-hrm-dynamic-config-platform-qa-02.FINAL.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-qa-02/` (**7** PNG) |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — Settings UF GWC ≠ full printable contracts UAT / Phase1 DONE |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **contracts_printable_ready** | **false** | **DENIED** invent / promote — **PM must not set true** |
| **Printable / module UAT** | **DENIED** | Slice ≠ full ContractPrintSpine PREV live + printable catalog |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Machine `seed_used=false` · `denied[]` includes seed |
| **QA-01 L1 as UF** | **DENIED** | Probe ≠ UF; browser claim only from QA-02 |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT browser **AC-PLT-CTR-05** on Settings → tab **Điều khoản HĐ** → card **Token merge hợp đồng**: upsert → Network **PUT** `/api/hrm/merge-tokens` **200** `HRM-PLT-TOK-200` → FE row with **labelVi** + `{{tokenKey}}` (not raw-key-only) → **F5** còn → resolve-preview **source=registry** → soft-delete retire hide. QA-01 L1-only **SKIP** for this AC is **SUPERSEDED**. must_keep UF-HRM-02 · print-spine · soft-delete · U65 · DYNAMIC-LOCK **held**. Residual **OBS**: full Contracts PREV live registry consume — **CONDITION** (non-blocking Settings UF; **not** printable UAT).

| Gate item | Evidence | QC |
|-----------|----------|-----|
| **AC-PLT-CTR-05** browser UF | QA-02 · stamp `PLTQA2-IEWURI` · PUT **200** · FE after 2xx + F5 labelVi | 🟢 **ACCEPT / CERTIFIED** |
| F-PLT-TOK-02 via UI | PUT upsert custom key | 🟢 **ACCEPT** |
| F-PLT-TOK-01 via UI after F5 | Row + braces + labelVi | 🟢 **ACCEPT** |
| F-PLT-TOK-03 resolve registry | POST **201** · `source=registry` · badge Registry | 🟢 **ACCEPT** |
| DYNAMIC-LOCK open custom key | `custom.emp.qa_plt_*` accepted | 🟢 **ACCEPT** |
| Soft-delete retire | Retire **201** · active list hide | 🟢 **ACCEPT** |
| QA-01 AC-05 L1 SKIP | Superseded by QA-02 | 🟢 **CONFIRMED SUPERSEDED** |
| Contracts PREV deep live registry | Surface smoke only | 🟡 **CONDITION OBS** — not promoted |
| Honesty printable=false | MD + machine + UI banner + this QC | 🟢 **DENIED promote** |
| Seed / Phase1 DONE | DENIED / NOT claimed | 🟢 |

**Cấm:** `contracts_printable_ready=true` · invent printable UAT · invent Phase1 DONE · claim UF from QA-01 L1 · reopen print-spine / UF-HRM-02 without evidence gap · seed.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `contracts_printable_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · PREV deep live registry **OBS** · prior CTR printable pack already GWC with soft OBS · this seat certifies **Settings MergeToken UF only** |
| Recommended flag state | keep **`contracts_printable_ready=false`** |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| BE-01 MergeToken Nest | `po-hrm-dynamic-config-platform-be-01.md` | READY_FOR_QA | **ACCEPT** prior |
| FE-01 Settings panel | `po-hrm-dynamic-config-platform-fe-01.md` | READY_FOR_QA | **ACCEPT** prior |
| QA-01 L1 secondary | `po-hrm-dynamic-config-platform-qa-01.md` | PASS_TO_PM | **ACCEPT as L1 only** · AC-05 SKIP **superseded** |
| QA-02 browser UF | `po-hrm-dynamic-config-platform-qa-02.md` | PASS_TO_PM | **ACCEPT** stamp `PLTQA2-IEWURI` |
| Machine QA-02 | `_tmp-po-hrm-dynamic-config-platform-qa-02.FINAL.json` | PASS | **ACCEPT** |
| Pack verify QA-02 | `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-qa-02.md` | **8/8 PASS** exit 0 | 🟢 |

### Machine JSON spot

| Signal | Value | QC |
|--------|-------|-----|
| `env.STAMP` | `PLTQA2-IEWURI` | 🟢 |
| `TOKEN_KEY` / `LABEL_VI` | `custom.emp.qa_plt_pltqa2_iewuri` · `Nhãn QA Token Merge PLTQA2-IEWURI` | 🟢 |
| `ac.AC-PLT-CTR-05.verdict` | **PASS** · upsertStatus **200** · code `HRM-PLT-TOK-200` | 🟢 |
| `feAfter2xx` / `feAfterF5` | visible · hasLabel · hasTokenBrace | 🟢 |
| `optional.RESOLVE_REGISTRY` | status **201** · source=`registry` | 🟢 |
| `optional.DYNAMIC-LOCK_OPEN_KEY` | **PASS** | 🟢 |
| `optional.SOFT_DELETE_RETIRE` | **PASS** · network retire **201** · list itemCount 0 | 🟢 |
| `honesty.contracts_printable_ready` | **false** · `denied[]` ready/seed/Phase1 | 🟢 |
| `must_keep` | UF-HRM-02 / print-spine **NOT_REOPENED** · soft_delete PASS · u65 seed false | 🟢 |
| `process` | pageErrors=0 · consoleErrors=0 · dndStorm=0 · uncaught=0 | 🟢 |
| `overall` | **PASS** | 🟢 |
| `must_keep.dynamic_lock` field | `"n/a"` while optional DYNAMIC-LOCK PASS | 🟡 **PROCESS OBS** — not product demote |

### Screenshot visual spot

| File | QC observation |
|------|----------------|
| `03-after-upsert.png` | Toast «Đã đăng ký token merge» · row **Nhãn QA Token Merge PLTQA2-IEWURI** + `{{custom.emp.qa_plt_pltqa2_iewuri}}` · honesty banner printable=false |
| `04-after-f5.png` | Same row **Hiệu lực** after reload · labelVi + braces persist · AC-PLT-CTR-05 F5 ACCEPT |
| `05-resolve-preview.png` | Resolve preview «1/1 token lấy từ registry» · order registry→keyword_map |
| Screens dir | **7** PNG on disk (`01`–`07`) |

---

## Gate AC audit

| # | AC / Check | Evidence | QC |
|---|------------|----------|-----|
| 1 | L0 stack (portal/hrm/xbos 200) | QA-02 §1 · machine `l0` | 🟢 |
| 2 | AC-PLT-CTR-05 upsert → PUT 2xx → FE labelVi | QA-02 UF · machine · PNG 03 | 🟢 **CERTIFIED** |
| 3 | F5 list still shows token + label | PNG 04 · feAfterF5 | 🟢 |
| 4 | Resolve source=registry | PNG 05 · optional RESOLVE | 🟢 |
| 5 | DYNAMIC-LOCK open custom key | optional + upsert accepted | 🟢 |
| 6 | Soft-delete retire hide | machine retire + list 0 | 🟢 |
| 7 | QA-01 AC-05 SKIP superseded | QA-02 §0/§4 · this QC | 🟢 |
| 8 | must_keep UF-HRM-02 · print-spine | NOT_REOPENED | 🟢 |
| 9 | U65 zero-seed | seed_used=false · browser mutate | 🟢 |
| 10 | Honesty flag stay false | MD + machine + UI + QC | 🟢 **DENIED promote** |
| 11 | Module printable / Phase1 | Explicit DENIED / NOT claimed | 🟢 |
| 12 | Contracts PREV deep live | OBS smoke only | 🟡 **CONDITION** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-02 | QC |
|-----------------|-------|-------|-----|
| **AC-PLT-CTR-05 Settings MergeToken UF** (in-scope) | QA-01 SKIP | 🟢 browser PASS | 🟢 **PASS / CERTIFIED** |
| Resolve-preview registry (Settings) | — | 🟢 PASS | 🟢 **PASS** |
| **J-HRM-CTR-07** (9th template open catalog) | ⬜ DRAFT journey map | **not this slice** | ⬜ **NOT IN SCOPE** — not claimed |
| Contracts PREV live registry-on-HĐ | print-spine must_keep | surface smoke · deep **OBS** | 🟡 **DEFERRED OBS** — CONDITION |
| UF-HRM-02 / print-spine PDF | prior CTR GWC | not reopened | 🟢 must_keep |

**U19 note:** This gate certifies the **Settings UF slice** named in dispatch — **not** a claim that mandatory CTR journeys (J-HRM-03 / J-HRM-CTR-07 / printable PREV) are newly GO. Missing deep PREV does **not** NO-GO Settings UF; it **forces GWC CONDITION** and keeps printable=false.

### CRUD / mutate matrix (slice)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| MergeToken upsert (PUT) | Create/Update | **PASS** |
| MergeToken list after F5 | Read | **PASS** |
| Resolve-preview registry | Read | **PASS** |
| MergeToken retire soft-delete | Delete (soft) | **PASS** |
| Contracts PREV deep live values | Read (print) | **OBS / not promoted** |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| QA-02 pack verify **8/8** | **PROCESS OK** | Entry gate PASS |
| Machine `dynamic_lock: n/a` vs optional PASS | **PROCESS OBS** | Harness field incomplete — product key accepted; **not** demote |
| Contracts PREV deep OBS | **OBS / SCOPE** | CONDITION for GWC · blocks ready=true · **not** Settings product NO-GO |
| Portal `:5173` | **ENV OK** | L0 200 on evidence port |
| No P0/P1 product residual on Settings UF | **PRODUCT OK** | AC-PLT-CTR-05 CERTIFIED |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **OBS-CTR-PREV-LIVE-REGISTRY** | soft OBS | qa (later wave) | **OPEN CONDITION** | Full ContractPrintSpine PREV with registry-bound live HĐ values — **not** blocking Settings UF; **DENIED** invent printable |
| **R-PLT-API-01** EMP extension→TOK-02 same-txn | P2 residual | `dev-be` | **OPEN** (prior BE) | Non-blocking this gate |
| Peer XEVN-TPL AC-11 | peer | peer WI | **OUT OF SEAL** | Outside MergeToken Settings slice |
| `contracts_printable_ready` | honesty | pm | **LOCKED false** | Explicit **NO** promote |
| Print-spine / UF-HRM-02 | — | — | **SEALED must_keep** | Do not reopen |

**P0/P1 residuals for this WI:** none.

**CONDITION for GWC:** OBS-CTR-PREV-LIVE-REGISTRY + C-SLICE-≠-MODULE honesty — sufficient to deny `contracts_printable_ready=true` and deny clean full printable / Phase1 GO; **not** product NO-GO for certified Settings UF.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-qa-02.md` | **8/8 PASS** exit **0** | PROCESS OK |
| Read QA-02 / QA-01 / FE-01 / BE-01 / API AC-05 | Audited | — |
| Spot machine FINAL + PNG 03/04/05 | ACCEPT stamp + F5 + registry | PRODUCT OK |
| U65 recheck mutate | **not run** (observe-only · entry met) | — |

---

## must_keep confirmation

| Keep | QC |
|------|-----|
| UF-HRM-02 | **not reopened** |
| print-spine | **not reopened** (PREV deep OBS only) |
| soft-delete | retire hide **PASS** |
| U65 zero-seed | **PASS** · no seed claim |
| DYNAMIC-LOCK | open custom key **PASS** |

---

## completion_report

**Closed:** L3 certify **AC-PLT-CTR-05** MergeToken Settings browser UF — ACCEPT QA-02 stamp `PLTQA2-IEWURI` (PUT 200 → FE labelVi → F5 → resolve `source=registry` → soft-delete); confirm QA-01 L1 SKIP for AC-05 **superseded**; pack verify 8/8; must_keep held; honesty `contracts_printable_ready=false` · no Phase1 DONE · no seed; **C-SLICE-≠-MODULE**.

**Residual / CONDITION:** OBS full Contracts PREV live registry consume (non-blocking Settings); R-PLT-API-01 EMP hook prior; peer TPL OOS; **DENIED** invent printable UAT.

**Verdict:** **GO WITH CONDITIONS** — Settings MergeToken UF **CERTIFIED**; **NOT** printable module UAT · **NOT** Phase1 DONE.

---

## next_owner

**pm**

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-PM-INTAKE-01
from_role: qc
to_role: pm
lane: governance
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-01
residual_auto_fix: true
entry_criteria: QC-01 GO WITH CONDITIONS · evidence docs/qa/evidence/po-hrm-dynamic-config-platform-qc-01.md
read_first:
  - docs/qa/evidence/po-hrm-dynamic-config-platform-qc-01.md
  - docs/qa/evidence/po-hrm-dynamic-config-platform-qa-02.md
task:
  - INTAKE QC-01: AC-PLT-CTR-05 Settings MergeToken UF CERTIFIED (GWC)
  - LOCK contracts_printable_ready=false — DENIED invent / promote from this slice
  - Do NOT claim Phase1 DONE · C-SLICE-≠-MODULE
  - Optional later (non-blocking): QA wave OBS-CTR-PREV-LIVE-REGISTRY — Contracts PREV with registry-bound live HĐ (U65 browser; no seed; still printable=false unless full printable gate)
  - Prior residual R-PLT-API-01 EMP→TOK-02 same-txn remains BE backlog if program continues platform depth
  - Update bus + TEAM_WORKING_NOW; do not flip SERVICE_READINESS printable
exit: bus INTAKE recorded · flag stays false · next platform wave only if backlog requires
```

---

## ack_status

**PASS_TO_PM** — **GO WITH CONDITIONS** · AC-PLT-CTR-05 Settings UF CERTIFIED · `contracts_printable_ready=false` · NOT Phase1 DONE.
