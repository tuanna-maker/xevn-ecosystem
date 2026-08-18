# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DOCS-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DOCS-01` |
| **parent** | U88 after DEC-QC-01 GWC · residual **R-EMP-TOK-DOCS** from MERGE-TOKEN-EMP-DATA-01 |
| **from_role** | ba-docs |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **change_mode** | **ADD** client DOC-DELTA (API F.1 + DB/SRS pointers) |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-07 |
| **honesty** | All `*_ready=false` · `contracts_printable_ready=false` **LOCKED** · no Phase1 DONE · `C-SLICE-≠-MODULE` · U65 |
| **no_prompt_echo** | **true** — client VI clean (no work_item / pipeline meta in SRS body) |

---

## 1. read_first ack

| Artifact | Used |
|----------|------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-SA-01.md` | Option B · §5 register matrix · §7 F-EMP-TOK-01..05 · §9 DOC-DELTA · L-EMP-TOK locks |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01.md` | EXPAND origin `emp_catalog` · DTO↔column · VAL-EMP-TOK · resolve §5.2 |
| `po-hrm-dynamic-config-platform-merge-token-emp-data-01.md` | DATA CONFIRMED · unlock BE · residual R-EMP-TOK-DOCS |
| Peer DEC-DOCS-01 / EMP-DOCS-01 | ADD-only F.1 pattern · footer stamp · no wipe |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md` | Peer **F-PLT-TOK-01..03** paths `/api/hrm/merge-tokens` |
| Client `API_DESIGN_HRM_ENTERPRISE.md` | F-EMP-CAT-* · F-CORE-CTR-PREV · DEC/EMP seals |

---

## 2. Deliverables (client — no `apps/**`)

| Path | Change |
|------|--------|
| [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) | **ADD** F-EMP-TOK-01..05 (Mục đích · Nghiệp vụ · bước SRS · DTO↔`hrm_merge_tokens` via F-PLT-TOK-02) · **EXPAND** F-EMP-CAT-DOC-02 / ET-02 register-on-save · **EXPAND** F-CORE-CTR-PREV-01 resolve bag · §7.1/7.3 · header/footer stamp **DOC-DELTA CONFIRMED** |
| [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) | **ADD** footer pointer: origin CHK **`emp_catalog`** + register matrix · API F-EMP-TOK · **KEEP** EMP DOC/ET §3.0a–b SEALED — **no** second token table |
| [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) | **EXPAND** FR-UC-BP-PLT-01 (BR-PLT-01 + luồng + AC-PLT-EMP-TOK-01..03) · CORE-03 note · version **0.24** — no new FR |

**Forbidden touched:** none of `apps/**` · no seed · no invent QSĐ MergeToken print GĐ2 LIVE · no flip `*_ready` / printable · no wipe EMP-QC / DEC L1 / CTR / LIST-TOTALS.

---

## 3. F.1 coverage checklist (OS 13 §F.1)

| F-id | Path class | Mục đích | Nghiệp vụ | Bước SRS | DTO↔cột |
|------|------------|----------|-----------|----------|---------|
| F-EMP-TOK-01 | Side-effect DOC-02 → F-PLT-TOK-02 | ✓ | ✓ | PLT-01 · CORE-03 · AC-PLT-EMP-TOK-01 | ✓ `hrm_merge_tokens` · `emp.doc.*` · `origin=emp_catalog` |
| F-EMP-TOK-02 | Side-effect ET-02 → F-PLT-TOK-02 | ✓ | ✓ | AC-PLT-EMP-TOK-02 | ✓ `emp.et.*` · `emp_catalog` |
| F-EMP-TOK-03 | Side-effect extension → F-PLT-TOK-02 | ✓ | ✓ | AC-PLT-EMP-TOK-04 / HOLD R-EMP-TOK-EXT | ✓ `custom.emp.*` · `extension_field` |
| F-EMP-TOK-04 | Prefer F-PLT-TOK-01 `domain=EMP` | ✓ | ✓ | AC-PLT-EMP-TOK-03 | ✓ read |
| F-EMP-TOK-05 | EXPAND resolve bag / PREV | ✓ | ✓ | CORE-09/09b · AC-PLT-EMP-TOK-03 | ✓ labels from effective DOC/ET |

**Peer cite:** F-PLT-TOK-01..03 — single SoT; **no** duplicate write path.

---

## 4. Register matrix (client stamp)

| Trigger | `token_key` | `origin` |
|---------|-------------|----------|
| DOC create/upsert active | `emp.doc.<document_type_key>` | **`emp_catalog`** |
| ET create/upsert active | `emp.et.<employment_type_key>` | **`emp_catalog`** |
| Extension field save active | `custom.emp.<code>` | **`extension_field`** |

GĐ1 mandatory = DOC/ET hooks; extension = desired (HOLD if producer incomplete — does not block DOC/ET).

---

## 5. must_keep / DENY verify

| Rule | Result |
|------|--------|
| EMP-QC-01 L1 + EMP-QC-02 browser seals | **PASS** — F-EMP-CAT-* kept; seals not reopened |
| DEC L1 SEAL · F-DEC-CAT-* | **PASS** — untouched |
| CTR print spine · LIST-TOTALS | **PASS** — PREV EXPAND resolve only · printable **false** |
| Single `hrm_merge_tokens` SoT | **PASS** — no second token table |
| **DENY** invent QSĐ MergeToken print GĐ2 LIVE | **PASS** — stated FORBIDDEN / OUT |
| **DENY** flip any `*_ready` · `contracts_printable_ready` | **PASS** — remain **false** |
| XBOS position/dept OUT | **PASS** — AC-PLT-EMP-01 retained |
| `C-SLICE-≠-MODULE` | **PASS** — no module EMP UAT / Phase1 claim |

---

## 6. Residual

| ID | Item | Owner |
|----|------|-------|
| **R-EMP-TOK-DOCS** | Client API/DB/SRS DOC-DELTA F-EMP-TOK-* | **CLOSED** (this seat) |
| **R-EMP-TOK-EXT** | Extension-field producer wire | **dev-be** / fe — P2 HOLD; not block DOC/ET GĐ1 |
| MERGE-TOKEN-EMP-BE-01 | ensureSchema `emp_catalog` + side-effect DOC/ET (+03 if ready) + F-EMP-TOK-05 bag | **dev-be** next |
| AC-PLT-EMP-TOK-* QA | L1 then browser U65 zero-seed | **qa** after BE READY_FOR_QA |
| DEC MergeToken print | GĐ2 | **DENY invent** this wave |

---

## 7. completion_report

**Closed:** ADD-only client DOC-DELTA for EMP MergeToken register-on-save F.1 (`F-EMP-TOK-01..05`) citing peer **F-PLT-TOK-01..03**; families `emp.doc.*` / `emp.et.*` (`origin=emp_catalog`) + `custom.emp.*` (`extension_field`); EXPAND DOC/ET writers + CTR PREV resolve footnote; DB footer origin CHK + matrix pointer (no second table); SRS PLT-01/CORE-03 v0.24 AC-PLT-EMP-TOK-01..03; closes **R-EMP-TOK-DOCS**; honesty / printable flags remain false; no apps/**; no wipe EMP-QC / DEC / CTR / LIST-TOTALS; DENY QSĐ MergeToken print GĐ2 invent.

**Still open:** MERGE-TOKEN-EMP-BE-01 execution; R-EMP-TOK-EXT if extension producer incomplete; QA AC-PLT-EMP-TOK-* after BE.

---

## 8. next_owner / next_dispatch_prompt

**next_owner:** **pm** → **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-BE-01`

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-BE-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1
change_mode: ADD
prior: MERGE-TOKEN-EMP-SA-01 CONFIRMED · DATA-01 CONFIRMED · DOCS-01 PASS
spec_ref: F-EMP-TOK-01..05 · F-PLT-TOK-02 · DATA EXPAND emp_catalog · AC-PLT-EMP-TOK-01..05

entry_criteria:
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-docs-01.md
- API_DESIGN F-EMP-TOK-* + DATA origin CHK contract
- U65 zero-seed; no reopen EMP-QC / DEC / CTR seals
- must_keep: single hrm_merge_tokens · keyword_map fallback · contracts_printable_ready=false
- DENY: second token table · invent QSĐ MergeToken print GĐ2 · flip *_ready

scope:
- ensureSchema EXPAND chk_hrm_merge_tok_origin + emp_catalog · MERGE_TOKEN_ORIGINS
- Side-effect F-EMP-TOK-01/02 on DOC/ET writers same TX (+ F-EMP-TOK-03 if extension ready)
- F-EMP-TOK-05 resolve bag labels from effective DOC/ET
- jest VAL-EMP-TOK / scope_parity

exit_criteria:
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-be-01.md
- ack_status: READY_FOR_QA
- honesty flags remain false
```

---

## 9. handoff contract

| Field | Value |
|-------|--------|
| **completion_report** | See §7 |
| **next_owner** | **pm** → **dev-be** MERGE-TOKEN-EMP-BE-01 |
| **next_dispatch_prompt** | See §8 copy-ready block |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-docs-01.md` |
| **ack_status** | **PASS_TO_PM** |
