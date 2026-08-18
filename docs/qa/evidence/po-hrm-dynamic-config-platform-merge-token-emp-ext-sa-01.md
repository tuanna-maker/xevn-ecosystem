# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-SA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-SA-01` |
| **from_role** | `sa` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — F.1 `custom.emp.*` · **not** module EMP UAT · **not** printable · **DENIED** invent LIVE |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-QC-01` GWC · residual **R-EMP-TOK-EXT** |
| **change_mode** | **ADD** Option B′ deepen · **REFINE** residual · **NO** ba-data · **NO** `apps/**` · **no seed** |
| **Verdict** | **HOLD-WITH-RATIONALE** — architecture Option **B′** **LOCKED** · execution LIVE **DENIED** |
| **ack_status** | `PASS_TO_PM` |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-SA-01.md) |
| **stamp_peer** | `EMPTOKQA-MSJ290VB` · MERGE-TOKEN-EMP GWC · GĐ1 DOC/ET SEAL retain |
| **U65** | docs-only · zero-seed · no mutate product |

### Honesty locks (mandatory)

| Flag | Value |
|------|-------|
| `hrm_personnel_uat_ready` | **false** |
| `employees_e2e_linkage_ready` | **false** |
| `contracts_printable_ready` | **false** |
| **`custom.emp.*` LIVE** | **DENIED** (HOLD) |
| MERGE-TOKEN-EMP GWC · EMP-QC · DEC | **SEAL RETAIN** |
| Module EMP UAT / Phase1 | **DENIED** |
| `C-SLICE-≠-MODULE` | retained |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **ref_sa_gđ1** | MERGE-TOKEN-EMP-SA-01 · F-EMP-TOK-03 · L-EMP-TOK-01 single SoT · register matrix |
| **ref_data** | MERGE-TOKEN-EMP-DATA-01 · platform `extension_field` already in CHK · **no** new EXPAND |
| **ref_api** | PLATFORM-API-01 F-PLT-TOK-01..03 · BR-PLT-01 `custom.emp.<code>` |
| **ref_qc** | MERGE-TOKEN-EMP-QC-01 GWC · CONDITION R-EMP-TOK-EXT · stamp EMPTOKQA-MSJ290VB |
| **AS-IS code** | `MERGE_TOKEN_ORIGINS` includes `extension_field` · `emp-merge-token-register` DOC/ET only · Settings `hrm_catalog_extension_items` · EmployeeFormDialog `buildDynamicFields` on `hrm_employee_*_fields` |
| **sponsor_confirm** | pm dispatch EXT-SA-01 · change_mode ADD |

---

## Decision package (summary)

### Options

| Opt | Summary | Result |
|-----|---------|--------|
| **A** | Close residual / claim LIVE without producer register | **REJECT** |
| **B′** | Settings EMP field catalog extension-item → F-PLT-TOK-02 upsert `custom.emp.*` · `origin=extension_field` · single `hrm_merge_tokens` | **LOCKED** |
| **C** | Dual EMP token table / mega-EAV | **REJECT** (L-EMP-TOK-01 / ADR L3) |
| **D** | Register on employee value save / seed | **REJECT** (invent LIVE · U65) |

### ba-data

| Gate | Result |
|------|--------|
| Physical EXPAND for `extension_field`? | **NO** |
| Unlock ba-data? | **HOLD** |

### Residual refine

| ID | After |
|----|-------|
| **R-EMP-TOK-EXT** | **ARCHITECTURE_LOCKED** · **EXECUTION_HOLD** · close only after BE + QA AC-PLT-EMP-TOK-04 · still DENY personnel UAT |

### Producer SoT locked

Allow-list: `hrm_employee_{basic|personal|work|finance}_fields` (+ aliases). Trigger = definition save/retire only — **not** employee `custom_fields` PATCH.

---

## Deliverables

| # | Path | Status |
|---|------|--------|
| 1 | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-SA-01.md` | **Written** |
| 2 | This evidence | **Written** |
| 3 | `apps/**` | **untouched** |

---

## must_keep check

| Item | Status |
|------|--------|
| Single `hrm_merge_tokens` | **LOCKED** |
| GĐ1 DOC/ET SEAL / MERGE-TOKEN-EMP GWC | **retain** |
| F-PLT-TOK · EMP-QC · DEC · CTR · LIST-TOTALS | **untouched** |
| ready=false · printable=false | **LOCKED** |
| DENY custom.emp LIVE | **yes** |
| No seed · no second token table | **yes** |

---

## completion_report

### Closed

1. Option matrix evaluated — **B′ LOCKED**; A/C/D **REJECT**.
2. F.1 deepen for **F-EMP-TOK-03**: producer SoT = Settings EMP field catalog extension-items → **F-PLT-TOK-02** · `origin=extension_field`.
3. **ba-data HOLD** — no physical EXPAND (`extension_field` already present).
4. **R-EMP-TOK-EXT** refined: ARCHITECTURE_LOCKED · EXECUTION_HOLD (not invent LIVE).
5. GĐ1 DOC/ET / MERGE-TOKEN-EMP GWC / EMP-QC / DEC / CTR / LIST-TOTALS seals **retained**.
6. Honesty flags **false** · `C-SLICE-≠-MODULE` · no `apps/**`.

### Residual

- **R-EMP-TOK-EXT** EXECUTION_HOLD → ba-process AC-04 pack → dev-be wire → QA U65.
- Personnel / printable / module UAT / Phase1 still **DENIED**.

---

## next_owner

**pm** → dispatch **ba-process** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BA-01`

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BA-01
from_role: pm
to_role: ba-process
lane: governance
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-SA-01 HOLD-WITH-RATIONALE · Option B′ LOCKED
program: PO-HRM-CONTINUOUS-W8-20260807
change_mode: ADD
ref_sa: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-SA-01.md
ref_qc_peer: docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-qc-01.md
stamp_peer: EMPTOKQA-MSJ290VB · GĐ1 DOC/ET SEAL retain

## entry_criteria
EXT-SA-01 HOLD-WITH-RATIONALE; ba-data HOLD (no EXPAND); U65; honesty LOCKED false; cấm invent custom.emp LIVE

## task
AC pack for AC-PLT-EMP-TOK-04 / 04b / 04c:
- Click path: Settings EMP field catalog (allow-list hrm_employee_*_fields) → append extension-item → Lưu → F5 merge-tokens domain=EMP expects custom.emp.<code> origin=extension_field
- Negative: non-allow-list catalog → no custom.emp; employee custom_fields PATCH alone → no token
- Cite F-EMP-TOK-03 · F-PLT-TOK-02 · BR-PLT-01 · EXT-SA §5–§7
- Unlock next: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BE-01 (dev-be) after AC CONFIRMED
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-ext-ba-01.md
- Spec delta (if needed): docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BA-01.md

## must_keep / cấm
MERGE-TOKEN-EMP GWC · EMP-QC · DEC · CTR · LIST-TOTALS · single hrm_merge_tokens · ready=false · printable=false · no apps/** · no seed · no ba-data EXPAND · DENY claim LIVE · C-SLICE-≠-MODULE

## exit
PASS_TO_PM · CONFIRMED AC pack · completion_report · next_owner pm→dev-be · next_dispatch_prompt · evidence_path · ack_status
```

---

## evidence_path

`docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-ext-sa-01.md`

## ack_status

**PASS_TO_PM** · **HOLD-WITH-RATIONALE**
