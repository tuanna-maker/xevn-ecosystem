# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-FE-04

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-FE-04` |
| **role** | dev-fe |
| **lane** | execution · change_mode **FIX** |
| **date** | 2026-08-07 |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-QA-03` **FAIL_TO_PM** |
| **defect** | **D-CTR-FE-HRMAPI-COMMENT-SWC** P0 |
| **honesty** | `contracts_printable_ready=false` · **DENIED** invent printable UAT · no flip · no module DONE |
| **ack_status** | **READY_FOR_QA** |

---

## 0. Spec / root cause

| | |
|--|--|
| **spec says** | CODE-MEMORY / block comments must not contain the two-char sequence that terminates `/** … */` |
| **code did** | FE-03 line: `solid_convention_ack: display-ready origin*/publish meta from BE` — substring `*/` closed the LEGAL-PRINT CODE-MEMORY early → SWC `Expected ';', '}' or <eof>` at ~3069 → Vite `GET /hr/src/integrations/hrmApi.ts` **500** → Settings `#root` empty |
| **fix** | Reword to `origin-star and publish` + APPEND `@CODE-MEMORY-CHANGE` FE-04 documenting never write star-slash inside block comments |

**must_keep preserved:** print-spine GWC · UF-HRM-02 · PDF BE-02 · Wave A work_location · FE-01 DnD · PUB/PULL/APPLY clients · honesty false.

**forbidden not done:** seed · wipe GWC · flip `contracts_printable_ready` · claim printable DONE.

---

## 1. Diff (narrow)

**File:** `apps/web/hrm/src/integrations/hrmApi.ts`

- Replaced `origin*/publish` → `origin-star and publish` in FE-03 CODE-MEMORY `solid_convention_ack`
- Renamed narrative `origin*` → `origin-star` in same CHANGE What-line (avoid ambiguity)
- APPEND FE-04 `@CODE-MEMORY-CHANGE` (FIX · D-CTR-FE-HRMAPI-COMMENT-SWC)

No product UI / API client behavior change.

---

## 2. Exit criteria

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Reword CODE-MEMORY — no `*/` inside block comments | 🟢 | local grep `origin\*/` = **0** matches |
| 2 | `GET /hr/src/integrations/hrmApi.ts` → **200** | 🟢 | Vite status **200** · `hasSwcSyntaxError=false` · network `hrmApi.ts` **200** |
| 3 | `/hr/settings?tab=contract-legal` mounts `ctr-library-publish-panel` | 🟢 | `hasPanel=true` · `hasSettingsPrint=true` · `rootChildCount=4` · textLen 4919 |
| 4 | Evidence this file | 🟢 | + mount JSON + screenshot |
| 5 | READY_FOR_QA → QA-03 retest | 🟢 | see `next_dispatch_prompt` |
| 6 | Handoff contract fields | 🟢 | below |

---

## 3. Runtime proof

**Harness:** `scripts/qa/_tmp-po-hrm-contract-legal-print-fe-04-mount.mjs`  
**JSON:** `docs/qa/evidence/_tmp-po-hrm-contract-legal-print-fe-04-mount.json`  
**Screen:** `docs/qa/evidence/screens/po-hrm-contract-legal-print-fe-04/settings-contract-legal.png`

| Check | Value |
|-------|--------|
| Vite `hrmApi.ts` | **200** · len ~682k · no SWC Syntax Error body |
| Login | portal `/api/xbos/auth/login` **201** · `ceo@xe.vn` · `companyId=main` |
| Settings URL | `http://127.0.0.1:5173/hr/settings?…&tab=contract-legal` |
| `#root` | childCount **4** (was **0** on QA-03 FAIL) |
| `ctr-library-publish-panel` | **visible** |
| Console / page errors | **[]** |
| Verdict mount | **PASS_MOUNT** (dev-fe smoke — **not** UF 🟢 / not printable UAT) |

---

## 4. Honesty / process

| Check | Result |
|-------|--------|
| Seed | **DENIED** / not used |
| `contracts_printable_ready` | **false** LOCKED |
| Printable module DONE | **DENIED** |
| GWC / UF-HRM-02 / FE-01 / Wave A | **not wiped** |
| Scope of this wave | Comment syntax FIX only — Publish/Pull/Apply browser AC still for **QA-03 retest** |

---

## 5. Handoff

### completion_report

**Closed:** D-CTR-FE-HRMAPI-COMMENT-SWC — premature `*/` in LEGAL-PRINT CODE-MEMORY fixed; Vite serves `hrmApi.ts` 200; Settings `contract-legal` mounts `ctr-library-publish-panel` again (PASS_MOUNT).

**Residual (open for QA):** Full U65 browser AC-HOLDING-PUBLISH / member pull-apply / origin 4-field / company_id query-only from QA-03 — **not** re-run in this FE wave. Honesty printable remains false.

### next_owner

`qa`

### ack_status

`READY_FOR_QA`

### evidence_path

`docs/qa/evidence/po-hrm-contract-legal-print-fe-04.md`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-QA-03
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-CONTRACT-LEGAL-PRINT-FE-04 READY_FOR_QA
retest: QA-03 U65 browser after D-CTR-FE-HRMAPI-COMMENT-SWC FIX
honesty: contracts_printable_ready=false — DENIED invent printable UAT · no flip · no seed

entry_criteria:
- docs/qa/evidence/po-hrm-contract-legal-print-fe-04.md READY_FOR_QA
- GET /hr/src/integrations/hrmApi.ts → 200 (SWC comment defect closed)
- Settings contract-legal mounts ctr-library-publish-panel (FE-04 PASS_MOUNT)

exit_criteria:
1) Holding Settings → Phát hành → POST 2xx → versions row + F5
2) Member → Kéo gói → pull 2xx · skipped/conflicts UI when returned
3) Member → Áp dụng → origin badges 4 overlay fields
4) company_id query only on pub/pull/apply (no body company_id)
5) Smoke UF-HRM-02 + print-spine · honesty false LOCKED
6) Evidence update QA-03 (or qa-03-retest) · PASS_TO_PM or FAIL with residual
7) must_keep: print-spine GWC · UF-HRM-02 · PDF BE-02 · Wave A work_location · FE-01 DnD · PUB/PULL/APPLY

cấm: seed · wipe GWC · flip contracts_printable_ready · claim module printable DONE · api_only as UF 🟢
```
