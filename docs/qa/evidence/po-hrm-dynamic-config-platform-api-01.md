# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-07 |
| **change_mode** | ADD / EXPAND · docs-only · **no** `apps/**` · **no** seed |
| **honesty** | `contracts_printable_ready=false` — **không** claim printable UAT / Phase1 DONE |
| **must_keep** | UF-HRM-02 · print-spine · soft-delete · XBOS legal-body · U65 · DYNAMIC-LOCK / CORR (no reject 9th) |

---

## 1. spec_read_ack

| Artifact | Đọc / dùng |
|----------|------------|
| DATA platform | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md` §3 `hrm_merge_tokens` · **§5.2 resolve** · §7 F-PLT-TOK DTO — **CONFIRMED** |
| TechSpec platform | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md` §1.1C · §3.5 · §6 F-PLT-TOK · error taxonomy |
| ADR | `ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md` Option B · L1–L7 |
| BA | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md` **BR-PLT-01** · **AC-PLT-CTR-05** · BR-PLT-03/04/05 |
| CTR PREV/VER spine | `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md` §5.9–5.12 |
| Open catalog API | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01.md` CORR — no enum reject 9th |
| DATA evidence | `docs/qa/evidence/po-hrm-dynamic-config-platform-data-01.md` |

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md) | **CONFIRMED** F.1 — F-PLT-TOK-01 list/get · F-PLT-TOK-02 upsert/register · F-PLT-TOK-03 resolve-preview · PREV/VER merge deepen cite §5.2 · HRM-PLT-* · open catalog lock · cascade unlock Dev |

**Không đụng:** `apps/**` · seed · wipe print-spine / DATA-01/02 / XEVN-TPL · redesign PDF · claim printable UAT · reopen Q-CTR.

---

## 3. Verdict stamps (summary)

| Topic | Stamp |
|-------|--------|
| Path prefix TOK | **ADD** `/api/hrm/merge-tokens` (closes R-PLT-DATA-01) |
| F-PLT-TOK-01 | List/get · scope_parity · display-ready · empty 200 |
| F-PLT-TOK-02 | Upsert BR-PLT-01 · format-only INVALID · soft retire |
| F-PLT-TOK-03 | Resolve §5.2 · registry wins · empty→keyword_map · no persist |
| PREV/VER | **EXPAND** merge call shared resolver — PDF path unchanged |
| Open catalog | **FORBIDDEN** reject 9th as closed enum |
| Honesty | **false** |

---

## 4. Quality gates (sa API F.1)

| Check | Result |
|-------|--------|
| Mỗi F-PLT-TOK: Mục đích · Nghiệp vụ · bước SRS/AC · DTO↔DB · lỗi | **PASS** |
| Cite DATA §5.2 registry wins / empty fallback | **PASS** |
| PREV/VER deepen merge, no PDF redesign | **PASS** |
| Open catalog / no API reject 9th | **PASS** |
| AC-PLT-CTR-05 · BR-PLT-01 mapped | **PASS** |
| must_keep UF-02 · print-spine · soft-delete · XBOS · U65 · DYNAMIC-LOCK | **PASS** |
| No apps/** / printable=false | **PASS** |
| scope_parity list↔get↔mutate | **PASS** |

---

## 5. completion_report

**Closed:** API_DESIGN F.1 CONFIRMED for platform MergeToken — F-PLT-TOK-01 (GET list/get `/api/hrm/merge-tokens`), F-PLT-TOK-02 (POST/PUT/PATCH/retire register · BR-PLT-01), F-PLT-TOK-03 (POST resolve-preview · DATA §5.2); error taxonomy `HRM-PLT-*`; EXPAND F-CORE-CTR-PREV/VER to call shared resolver (registry wins; empty registry → keyword_map); open-catalog lock (cấm reject 9th); must_keep UF-HRM-02 · print-spine · soft-delete · XBOS legal-body · U65 · DYNAMIC-LOCK; `contracts_printable_ready=false`; no `apps/**`.

**Residual:** EMP extension-item same-txn hook (R-PLT-API-01); holding publish tokens GĐ1.5; client DOC-DELTA pointer. **Không** claim printable UAT.

**Unlock:** DATA+API F.1 complete → **dev-be** may ensureSchema `hrm_merge_tokens` + wire PREV/VER (was HOLD).

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **dev-be** — PM dispatch after this PASS_TO_PM

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-BE-01
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-01
change_mode: ADD
sponsor_confirm: Option B CONFIRMED · DATA-01 CONFIRMED · API-01 CONFIRMED 2026-08-07

## read_first
1. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md §3 hrm_merge_tokens · §5.2 resolve
2. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md F-PLT-TOK-01..03 · §4 PREV/VER deepen
3. docs/architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md L1–L7
4. docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01.md CORR (omit CHK IN 8)
5. docs/qa/evidence/po-hrm-dynamic-config-platform-api-01.md

## task
ensureSchema ADD public.hrm_merge_tokens (+ UQ/CHK/indexes DATA §3); Nest F-PLT-TOK-01..03 under /api/hrm/merge-tokens; shared IMergeToken resolver §5.2; wire F-CORE-CTR-PREV/VER to resolver (empty registry → keyword_map); FORBIDDEN closed XEVN code CHECK / API reject 9th; soft-delete only; jest scope_parity + resolve order (registry wins / fallback); @CODE-MEMORY; no seed for UF evidence (U65).
Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-be-01.md
Honesty: contracts_printable_ready=false · no UAT flip

## exit
READY_FOR_QA · next qa AC-PLT-CTR-05 smoke (browser) after FE or BE-only list/upsert probe as L1 only
must_keep: UF-HRM-02 · print-spine · soft-delete · XBOS legal-body · U65 · DYNAMIC-LOCK
```

---

## 7. Handoff fields

| Field | Value |
|-------|--------|
| **completion_report** | §5 |
| **next_owner** | **pm** → **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BE-01` |
| **next_dispatch_prompt** | §6 copy-ready |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-api-01.md` |
| **ack_status** | **PASS_TO_PM** |
| **pm_dispatch_hint** | DATA+API F.1 unlocked — Task **dev-be** ensureSchema MergeToken same session |
