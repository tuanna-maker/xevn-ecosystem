# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BA-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-SA-01` HOLD-WITH-RATIONALE · Option **B′ LOCKED** |
| **Date** | 2026-08-07 |
| **change_mode** | ADD |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BA-01.md) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-SA-01.md) §5–§7 |
| **ref_qc_peer** | [`po-hrm-dynamic-config-platform-merge-token-emp-qc-01.md`](./po-hrm-dynamic-config-platform-merge-token-emp-qc-01.md) · stamp **`EMPTOKQA-MSJ290VB`** · GĐ1 DOC/ET SEAL retain |
| **U65** | zero-seed · no `apps/**` · no ba-data EXPAND · **DENIED** invent `custom.emp` LIVE |

### Honesty locks (mandatory)

| Flag | Value |
|------|-------|
| `hrm_personnel_uat_ready` | **false** LOCKED |
| `employees_e2e_linkage_ready` | **false** LOCKED |
| `contracts_printable_ready` | **false** LOCKED |
| **`custom.emp.*` LIVE** | **DENIED** until QA AC-04 PASS + narrow QC |
| MERGE-TOKEN-EMP GWC · EMP-QC · DEC · CTR · LIST-TOTALS | **SEAL RETAIN** — **cấm reopen** |
| `C-SLICE-≠-MODULE` | retained |
| ba-data EXPAND | **HOLD / FORBIDDEN** |

---

## 1. read_first ack

| # | Artifact | Used |
|---|----------|------|
| 1 | EXT-SA-01 | Option B′ LOCKED · §5 allow-list · §6 F-EMP-TOK-03 · §7 AC-04 stubs · L-EMP-EXT-* |
| 2 | MERGE-TOKEN-EMP-SA-01 | **F-EMP-TOK-03** · AC-PLT-EMP-TOK-04 stub · GĐ1 DOC/ET |
| 3 | PLATFORM-API-01 | **F-PLT-TOK-02** · BR-PLT-01 shape `custom.emp.<code>` |
| 4 | PLATFORM-BA-01 | **BR-PLT-01** · **AC-PLT-CTR-05** class |
| 5 | MERGE-TOKEN-EMP-QC-01 | GWC · CONDITION R-EMP-TOK-EXT · stamp `EMPTOKQA-MSJ290VB` |
| 6 | MERGE-TOKEN-EMP-DATA-01 | VAL-EMP-TOK-05 · `origin=extension_field` already in CHK |

**no_prompt_echo:** team-internal AC pack — không dán chat Sponsor vào tài liệu khách.

---

## 2. Deliverable

| Path | Content |
|------|---------|
| Spec | AC-PLT-EMP-TOK-04 / 04b / 04c · UC-PLT-EMP-TOK-04* · BR-PLT-EMP-TOK-01..06 · VAL-EMP-TOK-05* · allow-list · sequenceDiagram · unlock BE-01 |
| This evidence | CONFIRMED stamp · handoff · honesty |

**Không đụng:** `apps/**` · seed · ba-data EXPAND · invent LIVE · reopen GWC/EMP-QC/DEC/CTR/LIST-TOTALS.

---

## 3. AC stamp summary

| ID | Intent | Cite |
|----|--------|------|
| **AC-PLT-EMP-TOK-04** | Settings EMP field catalog allow-list → append extension-item → Lưu 2xx → F5 `merge-tokens?domain=EMP` → `custom.emp.<code>` · `origin=extension_field` · active; retire hide | F-EMP-TOK-03 · F-PLT-TOK-02 · BR-PLT-01 · EXT-SA §5–§7 |
| **AC-PLT-EMP-TOK-04b** | Non-allow-list catalog save → **no** `custom.emp.*` | L-EMP-EXT-04 · EXT-SA §5.1 |
| **AC-PLT-EMP-TOK-04c** | Employee `custom_fields` PATCH alone → **no** token | L-EMP-EXT-01 · BR-PLT-EMP-TOK-04 |
| **AC-PLT-EMP-TOK-04H** | Honesty false · DENIED LIVE/UAT/Phase1 · seals retain | QC peer · C-SLICE-≠-MODULE |

### Click path (AC-04 — copy for QA)

```text
Login → Settings → EMP field catalog ∈ {hrm_employee_basic_fields|personal|work|finance (+aliases)}
  → Append extension-item (code + label vi, active) → Lưu → FE after 2xx
  → F5 / GET /api/hrm/merge-tokens?domain=EMP
  → Expect custom.emp.<code> origin=extension_field status=active
Negative-04b: non-allow-list catalog → no custom.emp
Negative-04c: employee custom_fields value Lưu alone → no token
```

---

## 4. Quality gates (ba-process)

| Check | Result |
|-------|--------|
| Align EXT-SA Option B′ · no invent LIVE | **PASS** |
| Cite F-EMP-TOK-03 · F-PLT-TOK-02 · BR-PLT-01 · EXT-SA §5–§7 | **PASS** |
| Allow-list + negatives 04b/04c | **PASS** |
| U65 browser click path measurable | **PASS** |
| ba-data HOLD (no EXPAND) | **PASS** |
| GĐ1 DOC/ET · EMP-QC · DEC · CTR · LIST-TOTALS retain | **PASS** |
| No apps/** · no seed · honesty false | **PASS** |
| Unlock next = EXT-BE-01 only | **PASS** |

---

## 5. completion_report

**Closed:** CONFIRMED BA AC pack for **R-EMP-TOK-EXT** execution unlock — **AC-PLT-EMP-TOK-04 / 04b / 04c** with U65 click paths, allow-list BR-PLT-EMP-TOK-01..06, VAL-EMP-TOK-05*, citations to **F-EMP-TOK-03 · F-PLT-TOK-02 · BR-PLT-01 · EXT-SA §5–§7**, honesty DENIED LIVE, seals retain, ba-data HOLD.

**Residual / open:** **dev-be** wire F-EMP-TOK-03 side-effect on SettingsCatalogs extension-items (allow-list) → jest VAL-EMP-TOK-05* → QA U65 → QC narrow. **Not closed:** `custom.emp` LIVE product claim · personnel UAT · printable · Phase1 · module EMP DONE.

**Forbidden claims:** invent LIVE · reopen MERGE-TOKEN-EMP GWC · EMP-QC · seed · ba-data EXPAND · `C-SLICE=MODULE`.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **pm** → **dev-be**

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BE-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BA-01 CONFIRMED · EXT-SA-01 Option B′ LOCKED
program: PO-HRM-CONTINUOUS-W8-20260807
change_mode: ADD
ref_ba: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BA-01.md
ref_sa: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-SA-01.md
ref_qc_peer: docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-qc-01.md
stamp_peer: EMPTOKQA-MSJ290VB · GĐ1 DOC/ET SEAL retain

## entry_criteria
EXT-BA-01 AC CONFIRMED; EXT-SA Option B′ LOCKED; ba-data HOLD (no EXPAND); U65; honesty LOCKED false; cấm invent custom.emp LIVE; cấm reopen MERGE-TOKEN-EMP GWC / EMP-QC

## task
Wire F-EMP-TOK-03 side-effect on SettingsCatalogs extension-item create/upsert/retire when catalog_key ∈ allow-list:
  hrm_employee_basic_fields | personal | work | finance (+aliases)
Same TX → F-PLT-TOK-02 upsert custom.emp.<code> origin=extension_field domain=EMP ring=custom extension_field_ref=<code>
Retire → soft-retire token; token fail → rollback
Jest: VAL-EMP-TOK-05 / 05b / 05c (non-allow-list no token; employee custom_fields PATCH alone no token)
Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-ext-be-01.md
READY_FOR_QA with AC-PLT-EMP-TOK-04/04b/04c

## must_keep / cấm
single hrm_merge_tokens · DOC/ET register · F-PLT-TOK paths · keyword_map fallback · soft-delete · seals GWC/EMP-QC/DEC/CTR/LIST-TOTALS · ready=false · printable=false · DENY LIVE claim · no seed · no ba-data EXPAND · C-SLICE-≠-MODULE

## exit
READY_FOR_QA · completion_report · next_owner qa · next_dispatch_prompt · evidence_path · ack_status
```

---

## 7. Handoff contract

| Field | Value |
|-------|--------|
| **completion_report** | §5 above |
| **next_owner** | pm → **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BE-01` |
| **next_dispatch_prompt** | §6 copy-ready block |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-ext-ba-01.md` |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
