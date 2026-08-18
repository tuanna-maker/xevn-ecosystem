# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-QA-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-QA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution · **L1 secondary only** |
| **prior** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BE-01` READY_FOR_QA |
| **date** | 2026-08-07 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **env** | portal `:5173` · hrm `:28001` · xbos `:28002` |
| **stamp** | `PLTQA-MSIEQLQ8` |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-qa-01.FINAL.json` |
| **harness** | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-qa-01.mjs` |
| **honesty** | `contracts_printable_ready=false` — **DENIED** invent / printable UAT / Phase1 |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Label (mandatory honesty)

| Claim | Status |
|-------|--------|
| **L1 secondary** MergeToken API surface | ✅ verified |
| **UF 🟢** / browser AC-PLT-CTR-05 | ❌ **NOT claimed** — FE-01 still **DISPATCHED**, no FE evidence |
| **Printable UAT** / `contracts_printable_ready` | ❌ **DENIED** (remains **false**) |
| Seed in evidence | **none** (U65) |

> This wave is **L1 secondary only**. Probe 2xx ≠ UF 🟢. AC-PLT-CTR-05 browser is **OPEN** until FE token picker lands.

---

## 1. L0 / health

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM / XBOS / portal **200** (Windows UV assert noise after PASS — health OK) |
| `pnpm run qc:fe-be-health` | **ALL PASS** (login + employees + catalog-sync + portal proxy) |
| Seed | **none** |

---

## 2. FE gate (AC-PLT-CTR-05)

| Signal | Status |
|--------|--------|
| `TEAM_WORKING_NOW` FE-01 | **DISPATCHED** — Settings merge-token picker |
| FE evidence `po-hrm-dynamic-config-platform-fe-01.md` | **absent** |
| Mid-wave recheck | still DISPATCHED · no READY_FOR_QA |
| **AC-PLT-CTR-05 browser** | ⬜ **SKIP** — entry not met |

---

## 3. Verdict matrix (L1)

| ID | Verdict | Evidence |
|----|---------|----------|
| **F-PLT-TOK-01** GET list `company_id=main` | 🟢 **PASS** | HTTP **200** `HRM-PLT-TOK-200` · `items=[]` `total=0` (empty OK) |
| **F-PLT-TOK-03** resolve-preview | 🟢 **PASS** | POST HTTP **201** envelope `HRM-PLT-TOK-200` · empty registry + overrides path operable (Nest POST→201; business code OK) |
| **F-PLT-TOK-02** upsert open catalog | 🟢 **PASS** | PUT custom key `custom.emp.qa_plt_*` → **200** — **not** rejected as «not in starter N» |
| **VAL format-only** | 🟢 **PASS** | `BadKey-With-Dash` → **400** `HRM-PLT-CAT-CODE-INVALID` |
| **U19 get-by-id** | 🟢 **PASS** | GET `/:tokenId?company_id=main` → **200** after upsert |
| **Soft-delete retire** | 🟢 **PASS** | POST retire → **201**/`HRM-PLT-TOK-200` · default list hides retired |
| **DYNAMIC-LOCK MergeToken** | 🟢 **PASS** | No closed `token_key` enum reject · format-only INVALID |
| **DYNAMIC-LOCK TPL 9th (peer)** | ⬜ **DEFER_PEER** | See §5 — not MergeToken regression |
| **jest merge-token** | 🟢 **PASS** | 2 suites / **12** tests |
| **jest print-spine** | 🟢 **PASS** | `contract-legal-print.service.spec` **17** tests |
| **AC-PLT-CTR-05 browser** | ⬜ **SKIP** | FE not ready |
| **Honesty** | 🟢 | printable **false** retained |

---

## 4. L1 step detail (not UF)

### 4.1 GET `/api/hrm/merge-tokens?company_id=main`
- Auth: portal `/api/xbos/auth/login` → Bearer · `x-tenant-id=xevn`
- Response: `{ items: [], total: 0 }` · code `HRM-PLT-TOK-200`
- Spec: empty **200** OK (API-01 §3.1)

### 4.2 POST `/api/hrm/merge-tokens/resolve-preview`
- Body: `companyId=main`, `domain=CTR`, `tokenKeys=[employee.full_name, contract.code]`, `fieldOverrides`, `strict=false`
- Result: envelope success · `HRM-PLT-TOK-200` «Merge resolve preview»
- Note: HTTP status **201** on POST (Nest convention) — treated **2xx PASS** for L1; not UF

### 4.3 Upsert → get → retire (soft-delete smoke)
- PUT open key under `custom.emp.qa_plt_*` meta `{ qa_l1_secondary: true }` → retire immediately
- Default list after retire: token **not** active — soft-delete must_keep
- **Not** claimed as UF or seed density — L1 cleanup only

### 4.4 DYNAMIC-LOCK / CORR-01 (this surface)
- Bad format → `HRM-PLT-CAT-CODE-INVALID` only
- Custom «9th-style» token key accepted
- jest ensureSchema: no `token_key IN (` / no `chk_hrm_ctr_tpl_xevn_code` in MergeToken schema (BE-01 + retest 12 PASS)

---

## 5. Peer residual (not blocking this L1)

| ID | Note | Owner |
|----|------|-------|
| **XEVN-TPL AC-11** | Prior QA FAIL: create #9 → **400** `HRM-VAL-001` (DTO whitelist / stale dist) — **not** `CODE-INVALID` «not in 8» | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-BE-02` (already DISPATCHED) |
| **AC-PLT-CTR-05** | Browser register → F5 list → PREV registry wins | After **FE-01** READY → re-dispatch QA |
| **R-PLT-API-01** | EMP extension-item → TOK-02 same-txn hook | residual BE (non-blocking) |

**MergeToken BE-01 did not reintroduce closed 9th template reject.**

---

## 6. must_keep

| Keep | Status |
|------|--------|
| UF-HRM-02 | not reopened by this L1 |
| print-spine | jest **17** PASS |
| soft-delete | retire hide PASS |
| U65 zero-seed | no seed scripts; L1 cleanup retired |
| DYNAMIC-LOCK | MergeToken open catalog PASS; TPL peer deferred |

---

## 7. Honesty

| Flag | Value |
|------|-------|
| `contracts_printable_ready` | **false** |
| UF 🟢 from probe | **DENIED** |
| Phase1 / module UAT flip | **none** |

---

## 8. completion_report

**Closed (L1 secondary):** Live stack L0 PASS; F-PLT-TOK-01 list empty 200; F-PLT-TOK-03 resolve-preview 2xx; F-PLT-TOK-02 upsert open catalog + format INVALID + U19 get + soft retire hide; DYNAMIC-LOCK on MergeToken (no closed enum); jest merge-token 12 + print-spine 17 PASS; honesty printable=false; U65 no seed claim UF.

**Residual / open:** **AC-PLT-CTR-05 browser SKIP** (FE-01 still DISPATCHED); peer XEVN-TPL AC-11 BE-02; R-PLT-API-01 EMP hook.

**not promoted:** UF 🟢 · printable UAT · AC-PLT-CTR-05 · J-HRM-CTR-07.

---

## 9. next_owner / next_dispatch_prompt

**next_owner:** **pm**

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-QA-02
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-01
entry_criteria: FE-01 READY_FOR_QA · L0 · U65 zero-seed · prior QA-01 L1 PASS (evidence po-hrm-dynamic-config-platform-qa-01.md)
read_first:
  - docs/qa/evidence/po-hrm-dynamic-config-platform-qa-01.md
  - docs/qa/evidence/po-hrm-dynamic-config-platform-fe-01.md (when present)
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md AC-PLT-CTR-05
task:
  - Browser AC-PLT-CTR-05: Settings register/upsert token → F5 list shows token → PREV uses registry when present (VAL-PLT-TOK-01)
  - Empty registry fallback keyword_map still operable (VAL-PLT-TOK-02)
  - Soft-delete hide from picker · must_keep UF-HRM-02 · print-spine · U65 · DYNAMIC-LOCK
  - Honesty: contracts_printable_ready=false — DENIED invent
exit: PASS_TO_PM|FAIL_TO_PM · evidence docs/qa/evidence/po-hrm-dynamic-config-platform-qa-02.md
If FE-01 not READY yet: hold QA-02; do not invent UF from L1.
```

Parallel (unchanged peer): continue `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-BE-02` for AC-11 VAL-001/dist — not owned by this MergeToken L1.

---

## 10. ack_status

**PASS_TO_PM** — L1 secondary MergeToken surface verified; **not** UF 🟢; **not** printable UAT; AC-PLT-CTR-05 deferred to FE+QA-02.
