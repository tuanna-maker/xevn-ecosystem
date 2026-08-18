# Evidence — `PO-HRM-ALLOWANCE-CATALOG-SYNC-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-ALLOWANCE-CATALOG-SYNC-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **L1 API allowance catalog sync** (AC5 retire + retained QA-01 create/mirror/409) · **not** browser UF · **not** J-* promote · **not** module UAT |
| **priority** | P1 |
| **parent** | `PO-HRM-ALLOWANCE-CATALOG-SYNC-QA-02` |
| **prior_be** | `PO-HRM-ALLOWANCE-CATALOG-SYNC-BE-02` READY_FOR_QA (SAVEPOINT FIX) |
| **prior_qa01** | `PO-HRM-ALLOWANCE-CATALOG-SYNC-QA-01` FAIL AC5 · create/mirror/409 **PASS retained** |
| **prior_qa02** | `PO-HRM-ALLOWANCE-CATALOG-SYNC-QA-02` PASS_TO_PM · stamps `ALLOWCAT2-1C1D7DE0` / recheck `ALLOWCAT2-815CDFFA` |
| **closes** | **D-ALLOW-CAT-QA-01** (P0 retire 500 aborted TX) · L1 AC5 soft-retire seat |
| **portal_url** | `http://127.0.0.1:5173` (L0 observe) · HRM `:28001` · XBOS `:28002` · **api_base** `http://127.0.0.1:28001/api/hrm` |
| **journey_l25** | **N/A deferred** — L1 API seat only · **no** J-* promote · `C-SLICE-≠-MODULE` |
| **crud_or_matrix** | L1 AC matrix: QA-01 AC1–AC4/AC6 + QA-02 AC5 (see § Gate AC audit) |
| **Verdict** | **GO WITH CONDITIONS** — L1 AC5 ACCEPT · CONDITIONS: **`OBS-ALLOW-CAT-QA-02-HTTP`** (waive / P3 optional) · **`C-SLICE-≠-MODULE`** · **`OBS-ALLOW-CAT-QA-01`** (pay_types prereq carry) |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-allowance-catalog-sync-qa-02.md`](po-hrm-allowance-catalog-sync-qa-02.md) |
| **qa01_ref** | [`po-hrm-allowance-catalog-sync-qa-01.md`](po-hrm-allowance-catalog-sync-qa-01.md) |
| **be_ref** | [`po-hrm-allowance-catalog-sync-be-02.md`](po-hrm-allowance-catalog-sync-be-02.md) |
| **machine** | [`_tmp-po-hrm-allowance-catalog-sync-qa-02.json`](_tmp-po-hrm-allowance-catalog-sync-qa-02.json) |
| **spec_ref** | API-01 **F-ALLOW-CAT-04** · VAL-ALLOW-07/09 · BR-PLT-04 · create/mirror/409: F-ALLOW-CAT-01..05 · VAL-ALLOW-13/14/15 |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — L1 GWC ≠ AMIS DONE / payroll module UAT / Phase1 DONE / J-* |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **AMIS parity DONE** | **DENIED** | Catalog sync L1 only |
| **Browser UF / J-* / module UAT** | **DENIED** this seat | L1 API only |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Settings product path for pay_types only (QA-01) |
| **Module payroll UAT** | **DENIED** | Seat GWC ≠ module GO |
| **UF promote** | **DENIED** | No Settings PC/KT browser this wave |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT L1 allowance catalog sync soft-retire (AC5) after BE-02 SAVEPOINT fix + QA-02 retest against F-ALLOW-CAT-04 / VAL-ALLOW-09. Audited QA-02 MD + machine JSON stamp `ALLOWCAT2-1C1D7DE0` (`overall_pass=true` · `D_ALLOW_CAT_QA_01=CLOSED` · `payroll_e2e_ready=false` · failCount=0) + BE-02 jest 17/17 + QA-01 create/mirror/409 dual-write **PASS retained**. Proven at QA stamp: create → retire envelope **`HRM-ALLOW-CAT-200`** · `status=retired` · **not** `HRM-ALLOW-CAT-500-SYNC` · default list hide · `include_retired` · SC `is_active=false` · merge token `retired` · prior FAIL id `197d2fa2-…` also retires. **OBS-ALLOW-CAT-QA-02-HTTP** (Nest `@Post` raw HTTP **201** vs business envelope `HRM-ALLOW-CAT-200`) = **CONDITION OK / WAIVE** — P0 gate is not-500 + soft `retired`; optional P3 `@HttpCode(HttpStatus.OK)` only if sponsor requires literal HTTP 200. QA pack verify **1/8** (`journey_l25` missing) = **PROCESS OBS** for L1-only MD — this QC consolidates **8/8** with explicit **N/A deferred J-***. Live QC spot `qc:dev-stack` at gate time: HRM `:28001` **ENV down** — class **ENV** (does not reopen product AC5; QA L0 at stamp was PASS). Remaining CONDITIONS: **`OBS-ALLOW-CAT-QA-02-HTTP`** · **`OBS-ALLOW-CAT-QA-01`** · **`C-SLICE-≠-MODULE`**. **DENIED** AMIS DONE · `payroll_e2e_ready=true` · Phase1 DONE · module UAT · J-* / UF promote. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| D-ALLOW-CAT-QA-01 CLOSED | QA-02 AC5 2/2 + old id · machine CLOSED | 🟢 **ACCEPT CLOSED** |
| AC5 retire not 500 | envelope `HRM-ALLOW-CAT-200` · `status=retired` | 🟢 **ACCEPT** |
| AC5 picker hide / historical / get / SC / token | QA-02 §3 matrix all 🟢 | 🟢 **ACCEPT** |
| QA-01 create + SC mirror + merge token | QA-01 AC1 PASS retained | 🟢 **RETAIN PASS** |
| QA-01 PAY dual-write 409 | `HRM-ALLOW-CAT-409-DUAL-WRITE` phu_cap/khau_tru | 🟢 **RETAIN PASS** |
| QA-01 scope_parity / list / overview | AC2/AC6 PASS retained | 🟢 **RETAIN PASS** |
| BE-02 SAVEPOINT FIX | jest 17/17 · CODE-MEMORY BE-02 | 🟢 **ACCEPT** |
| Honesty `payroll_e2e_ready=false` | MD + machine | 🟢 **DENIED promote** |
| OBS Nest HTTP 201 vs envelope 200 | OBS-ALLOW-CAT-QA-02-HTTP | 🟡 **CONDITION OK — WAIVE** (P3 optional) |
| OBS pay_types prereq | OBS-ALLOW-CAT-QA-01 | 🟡 **CONDITION OK — carry** |
| QA pack 1/8 journey_l25 | L1 seat · no J-* | 🟡 **PROCESS OBS** — QC consolidates |
| Live L0 at QC gate | hrm-api fetch failed | 🟡 **ENV OBS** — not product reopen |
| AMIS DONE / module UAT / Phase1 / ready / J-* | Explicit DENIED | 🟢 |

**Cấm:** invent AMIS DONE · `payroll_e2e_ready=true` · Phase1 DONE · claim J-* / UF · claim module payroll UAT · reopen D-ALLOW-CAT-QA-01 as open · seed.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · L1 catalog sync ≠ LIVE process / module UAT · no UF/J-* |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim L1 AC5 / D-ALLOW-CAT-QA-01 CLOSED? | **YES** — this seat GWC |
| May PM claim QA-01 create/mirror/409 dual-write retained PASS? | **YES** |
| May PM claim AMIS DONE / module UAT / Phase1 / J-* / Settings UF? | **NO** |
| Forced residual dispatch this turn? | **NO** — idle-ok L1 AC5 · optional P3 `@HttpCode(200)` backlog only |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QA-01 L1 | `po-hrm-allowance-catalog-sync-qa-01.md` | FAIL_TO_PM (AC5) · AC1–4/6 PASS | **ACCEPT retained PASS**; AC5 superseded by QA-02 |
| BE-02 FIX | `po-hrm-allowance-catalog-sync-be-02.md` | READY_FOR_QA | **ACCEPT** SAVEPOINT / ROLLBACK TO |
| QA-02 L1 retest | `po-hrm-allowance-catalog-sync-qa-02.md` | PASS_TO_PM | **ACCEPT** stamps `ALLOWCAT2-*` |
| Machine | `_tmp-…-qa-02.json` | overall_pass · CLOSED | **ACCEPT** |
| Pack verify QA-02 | `verify:qc:evidence-pack` | exit **1** · **1/8** | 🟡 **PROCESS OBS** — L1; QC consolidates |
| Spec F-ALLOW-CAT-04 / VAL-ALLOW-09 | API-01 | CONFIRMED | **TRACE OK** |

### Machine JSON spot (`ALLOWCAT2-1C1D7DE0`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` / `code` | `ALLOWCAT2-1C1D7DE0` / `PC_RET_1C1D7DE0` | 🟢 |
| `payroll_e2e_ready` | **false** | 🟢 |
| `D_ALLOW_CAT_QA_01` | **CLOSED** | 🟢 |
| `overall_pass` / `failCount` | true / **0** | 🟢 |
| `AC5-RETIRE` | HTTP 201 · envelope `HRM-ALLOW-CAT-200` · `status=retired` | 🟢 *(OBS HTTP OK)* |
| `AC5-LIST-HIDE` / include / get / SC / token | pass | 🟢 |
| `ack_status` | **PASS_TO_PM** | 🟢 |

---

## Gate AC audit

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| AC1 | Create + SC + merge token | QA-01 **201** retained | 🟢 **RETAIN** |
| AC2 | List + get scope_parity | QA-01 PASS retained | 🟢 **RETAIN** |
| AC3 | PAY dual-write 409 | QA-01 **409** retained | 🟢 **RETAIN** |
| AC4 | PAY mirror list | QA-01 PASS retained | 🟢 **RETAIN** |
| **AC5** | Soft retire + hide + SC inactive + token | QA-02 **PASS** · D CLOSED | 🟢 **ACCEPT** |
| AC6 | Empty honest + overview | QA-01 PASS retained | 🟢 **RETAIN** |
| — | AMIS DONE / module UAT / J-* / Phase1 / ready | Explicit non-claim | 🟢 **DENIED** |

---

## Defect / OBS disposition

| ID | Prior | QC disposition |
|----|-------|----------------|
| **D-ALLOW-CAT-QA-01** | P0 retire 500 aborted TX | **CLOSED** — do not reopen |
| **OBS-ALLOW-CAT-QA-02-HTTP** | Nest POST raw **201** vs envelope `HRM-ALLOW-CAT-200` | **WAIVE** as CONDITION OK · optional P3 ticket `@HttpCode(200)` — **no forced BE dispatch** |
| **OBS-ALLOW-CAT-QA-01** | pay_types `phu_cap`/`khau_tru` prereq | **CARRY** CONDITION OK · product Settings path · not seat FAIL |
| **ENV** hrm-api down at QC wall-clock | Spot `qc:dev-stack` FAIL HRM | **ENV OBS** — restart SOP before next live probe; **does not** reopen AC5 product |

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| AC5 soft-retire PASS · D CLOSED | PRODUCT PASS | Yes → GWC ACCEPT |
| Nest HTTP 201 vs envelope 200 | PRODUCT OBS P3 | CONDITION OK / waive |
| QA pack missing journey_l25 | PROCESS OBS | No — L1 seat; QC consolidates |
| hrm-api down at QC gate time | ENV | No product NO-GO |

---

## Evidence pack (QC consolidates 8/8)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `PO-HRM-ALLOWANCE-CATALOG-SYNC-QC-01` |
| 2 | portal_url | ✅ `:5173` + api_base `:28001` |
| 3 | journey_l25 | ✅ **N/A deferred** — L1 only · no J-* promote |
| 4 | crud_or_matrix | ✅ AC1–AC6 table above |
| 5 | Classification | ✅ PRODUCT / PROCESS / ENV |
| 6 | Honesty locks | ✅ `payroll_e2e_ready=false` · DENIED flips |
| 7 | Defect disposition | ✅ D CLOSED · OBS waive/carry |
| 8 | Verdict + ack | ✅ **GO WITH CONDITIONS** · `PASS_TO_PM` |

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-allowance-catalog-sync-qa-02.md` | exit **1** · **1/8** (`journey_l25`) | **PROCESS OBS** — L1 seat |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-allowance-catalog-sync-qc-01.md` | exit **0** · **PASS** · **8/8** | QC pack SoT |
| `pnpm run qc:dev-stack` | HRM fetch failed · XBOS **200** · portal **200** | **ENV OBS** — not product reopen |
| BE-02 `pnpm --filter hrm-api exec jest --testPathPatterns=allowance-catalog-sync.service.spec` | **PASS** · 17/17 (cited BE-02) | PRODUCT OK (cited) |
| QA-02 L1 stamp `ALLOWCAT2-1C1D7DE0` | **PASS** · D CLOSED · failCount=0 | PRODUCT OK (cited) |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON audit.

**L2.5 / journey:** No J-* in-scope this seat — **deferred** (cross-nav Settings PC/KT UF not promoted). Explicit: **J-HRM-07** and all program J-* rows = **N/A / not tested** for this L1 gate.

---

## Scope statement (bounded)

**IN scope ACCEPT:** L1 F-ALLOW-CAT create/list/get/retire soft path · PAY dual-write 409 · SC mirror inactive on retire · merge token retire · D-ALLOW-CAT-QA-01 CLOSED · BE-02 SAVEPOINT integrity.

**OUT of scope / DENIED:** Settings browser UF · J-* L2.5 · `payroll_e2e_ready=true` · AMIS DONE · module payroll UAT · Phase 1 DONE · formula/process LIVE.

**NOT Phase 1 DONE.**

---

## completion_report

### Closed

1. Narrow QC gate on allowance catalog sync wave complete.
2. **D-ALLOW-CAT-QA-01 CLOSED** (QA-02 AC5 PASS; not 500).
3. Honesty acknowledged: `payroll_e2e_ready=false` · L1 only · no UF/J-* promote.
4. OBS Nest POST HTTP 201 vs envelope `HRM-ALLOW-CAT-200` — **WAIVE** (CONDITION OK); optional P3 `@HttpCode(200)` backlog only.
5. QA-01 create / mirror / 409 dual-write PASS **retained**.
6. Verdict **GO WITH CONDITIONS** (L1 AC5 + retained QA-01 slice) — not full module GO.

### Residual

- `C-SLICE-≠-MODULE` · browser UF deferred · pay_types OBS carry · ENV hrm restart before next live probe · optional P3 HttpCode polish.

---

## next_owner

**pm**

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-ALLOWANCE-CATALOG-SYNC-PM-INTAKE-01
from_role: qc
to_role: pm
lane: governance
priority: P2
parent: PO-HRM-ALLOWANCE-CATALOG-SYNC-QC-01
ref_qc: docs/qa/evidence/po-hrm-allowance-catalog-sync-qc-01.md

## task
INTAKE QC GWC for allowance catalog sync L1:
- CLOSE D-ALLOW-CAT-QA-01 on bus (do not reopen).
- Keep payroll_e2e_ready=false; DENY AMIS DONE / module UAT / UF/J-* promote.
- OBS Nest 201 vs HRM-ALLOW-CAT-200 = WAIVE (optional P3 HttpCode backlog — idle-ok, no forced BE).
- Update TEAM_WORKING_NOW / bus: L1 allowance catalog sync seat GWC; next product wave per program backlog (not this seat).
- Restart hrm-api before any new live L1 probe (ENV OBS at QC wall-clock).
```

---

## evidence_path

`docs/qa/evidence/po-hrm-allowance-catalog-sync-qc-01.md`

## ack_status

**GO WITH CONDITIONS**

## payroll_e2e_ready

**false**
