# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-07 |
| **change_mode** | ADD / CONFIRM · docs-only · **no** `apps/**` · **no** migrate · **no** seed |
| **honesty** | `contracts_printable_ready=false` — **không** claim printable UAT / Phase1 DONE |
| **must_keep** | UF-HRM-02 · print-spine · soft-delete · XBOS legal-body boundary · U65 · DYNAMIC-LOCK / CORR (no CHK IN 8) · JD Option A |

---

## 1. spec_read_ack

| Artifact | Đọc / dùng |
|----------|------------|
| TechSpec platform | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md` §1 I* · §3 CTR · §5 keyword_map · §6 F-PLT-TOK · §10 cascade |
| ADR | `ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md` Option B · L1–L7 |
| BA | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md` BR-PLT-01..06 · AC-PLT-CTR-* |
| CTR DATA spine | `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md` · `DATA-02.md` |
| XEVN TPL DATA | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DATA-01.md` **@CHANGE CORR** — no CHK IN 8 · keyword_map |
| Print-spine Tech | `PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md` must_keep |
| REC | `PO-HRM-JD-DYNAMIC-DATA-01.md` — adapter note only |

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md) | **CONFIRMED** physical — ADD `hrm_merge_tokens` · ICatalogRow/IFormSchema/IMergeToken → CTR tables · REC adapter note · CTR open catalog confirm (FORBIDDEN CHK IN 8) · keyword_map coexistence resolve order · VAL-PLT-* · F-PLT-TOK DTO↔column hints |

**Không đụng:** `apps/**` · seed · wipe DATA-01/02 / XEVN-TPL · invent mega-EAV · claim printable UAT · reopen Q-CTR.

---

## 3. Verdict stamps (summary)

| Topic | Stamp |
|-------|--------|
| MergeToken SoT | **ADD** `public.hrm_merge_tokens` |
| CTR Catalog | Existing `hrm_contract_templates` (open) — no second catalog table |
| CTR FormSchema | `layout_json` must_keep |
| CHK IN (8) | **FORBIDDEN** (reconfirm CORR) |
| keyword_map | Coexist; registry **wins**; empty → fallback |
| REC | Adapter note — no wipe `rec_jd_*` |
| CTR-first | EXPAND OK; MergeToken same DATA wave |
| Honesty | **false** |

---

## 4. Quality gates (ba-data)

| Check | Result |
|-------|--------|
| Physical MergeToken table + UQ/CHK/soft-delete | **PASS** |
| I* → domain map CTR first + REC adapter | **PASS** |
| No CHK IN 8 / open catalog align CORR | **PASS** |
| keyword_map coexistence deterministic | **PASS** |
| F-PLT-TOK DTO↔column hints for SA | **PASS** |
| must_keep print-spine / UF-02 / XBOS legal / U65 | **PASS** |
| No apps/** / no seed / printable=false | **PASS** |
| scope_parity list↔get-by-id noted | **PASS** |

---

## 5. completion_report

**Closed:** Physical DB_DESIGN delta for platform Option B — CONFIRMED ADD `hrm_merge_tokens` (columns, UQ, ring/origin/domain CHKs, soft-delete); mapped `ICatalogRow`/`IFormSchema`/`IMergeToken` → CTR domain tables first; REC `rec_jd_*` adapter note (no wipe); reconfirmed CTR open catalog **FORBIDDEN** `CHK code IN (8)`; keyword_map coexistence resolve order (registry wins); VAL-PLT-01..10 + TOK-01..05; F-PLT-TOK DTO↔column hints for SA deepen; must_keep UF-HRM-02 · print-spine · soft-delete · XBOS legal-body · U65 · DYNAMIC-LOCK; `contracts_printable_ready=false`; no `apps/**`.

**Residual:** SA API deepen F-PLT-TOK F.1 (exact paths + Mục đích/bước SRS) → Dev only after DATA+API; EMP token hook / PAY-ATT catalog waves later; holding publish tokens optional GĐ1.5; client DOC-DELTA pointer. **Không** claim printable UAT.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **sa** (API deepen F-PLT-TOK) — PM dispatch

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01
from_role: pm
to_role: sa
lane: governance
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-01
change_mode: ADD / EXPAND
sponsor_confirm: Option B CONFIRMED 2026-08-07

## read_first
1. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md (§3 hrm_merge_tokens · §5 resolve · §7 F-PLT-TOK DTO)
2. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md §6 F-PLT-TOK · error taxonomy
3. docs/architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md L1–L7
4. docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md §5 F.1 PREV/VER (must_keep spine)
5. docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01.md (CORR open catalog — no enum reject)
6. docs/qa/evidence/po-hrm-dynamic-config-platform-data-01.md

## task
API_DESIGN deepen F.1 for F-PLT-TOK-01..03 (list / upsert-register / resolve preview):
- Mỗi function: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS/AC (AC-PLT-CTR-05 · BR-PLT-01) · Request/Response → cột DB · lỗi HRM-PLT-*
- Cite DATA §5.2 resolve order (registry wins over keyword_map; empty registry fallback)
- CTR PREV/VER must_keep — deepen merge call, không redesign PDF
- Open catalog: cấm API reject 9th as closed enum
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-api-01.md
- Honesty: contracts_printable_ready=false · no apps/** · no UAT flip

## exit
PASS_TO_PM · next_dispatch → dev-be ensureSchema MergeToken + open TPL (after API CONFIRMED) · Dev HOLD until DATA+API F.1
must_keep: UF-HRM-02 · print-spine · soft-delete · XBOS legal-body · U65 · DYNAMIC-LOCK
```

---

## 7. Handoff fields

| Field | Value |
|-------|--------|
| **completion_report** | See §5 |
| **next_owner** | sa |
| **next_dispatch_prompt** | See §6 (copy-ready) |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-data-01.md` |
| **ack_status** | **PASS_TO_PM** |
| **pm_dispatch_hint** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01` — sa F-PLT-TOK F.1 deepen |
