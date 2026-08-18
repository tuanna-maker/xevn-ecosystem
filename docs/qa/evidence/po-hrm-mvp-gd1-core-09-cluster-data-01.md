# Evidence — PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01` |
| **lane** | governance · ba-data |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-22 seat #24) |
| **uc_ids** | `UC-BP-CORE-09` |
| **Date** | 2026-08-09 |
| **depends_on** | BA-01 O1–O12 CONFIRMED · SA Option A · R-CORE-09-REG/FILL/ZERO-TPL/MANDATORY/ADD≠DONE · printable false · Word/DOCX OUT · `CORE07QC1-KZJTSHNT` · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · ≠ CORE-07 DONE · `CORE06QC1-MSLID363` soft≠DONE · `CORE05QC1-MSLGVT40` · `CORE03QC1-MSLFJH0K` · `CORE02BQC1-MSLEFQC1` · peer `CORE09DQC1-MSLDR8I3`..`CORE01QC1-MSL6WMS7` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01.md` |
| **ack_status** | **PASS_TO_PM** · DATA **CONFIRMED HOLD** |
| **change_mode** | **HOLD** registry + keyword_map + merge_tokens · **HOLD must_keep** peer VER/CL/TPL · **OUT** Word/DOCX · **NO** `apps/**` · **no migrate** · **no seed** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| CONFIRM HOLD — no invent/change LIVE `employee_contracts` registry SoT | **PASS** §1/§4.1 |
| CONFIRM HOLD — `keyword_map` JSONB + `hrm_merge_tokens` RETAIN — DENY invent Word/DOCX binary primary GĐ1 | **PASS** §4.2 · AS-IS §3 |
| CONFIRM HOLD — peer print-versions / clauses / templates must_keep — DENY wipe 09c/09a/09d | **PASS** §4.3 |
| Cite display-ready PREV/VER DTO: `merged_fields` · `missing_fields` · `can_issue` · `cb_masked` · `template_code` · `statusLabelVi` | **PASS** §5 |
| RETAIN CORE-07 GATE 409 · ACT-400 · Nest `/core` DENY · checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 · CORE-05/03/02b · CORE-09d..01 | **PASS** §9 |
| DENY wipe CORE-07..01 / invent PAY·ATT·printable DONE / claim 09a–d=DONE / registry=DONE / CORE-07 DONE / printable/closed-8 / Word / honesty / reopen / seed / apps/** | **PASS** §9.2 |
| Unlock sa API-01 RETAIN cite F-CORE-CTR-01 + PREV + VER/TPL/CL — paper `/core` alias — residual wire ONLY if closable gap — PAY/ATT OUT | **PASS** §12 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| BA-01 | O1–O12 · §1.1–1.6 HOLD dispositions · AC-CORE-09-* · O11 DTO |
| SA-01 | Option A LOCKED · registry+fill RETAIN · Word OUT · 09a–d ≠ DONE |
| AS-IS | `contracts-insurance.service` / `contract-legal-print.service` ensureSchema · `merge-tokens.service` · `PreviewResult` fields · `@Controller('core')` **0** |
| Peers | CORE-07..01 / 09D..09A DATA seals must_keep |

---

## 3. Physical decisions (summary)

1. **Registry:** **HOLD RETAIN** LIVE `public.employee_contracts` — **≠** CORE-09 DONE alone.
2. **Fill:** **HOLD RETAIN** `keyword_map` JSONB + `hrm_merge_tokens` — **OUT** Word/DOCX primary.
3. **Peers:** **HOLD must_keep** print_versions · clauses · templates(+junction) — **DENY wipe** 09c/09a/09d.
4. **DTO:** Cite PREV/VER display-ready O11 fields — `statusLabelVi` = wire/derive · **HOLD** schema invent.
5. **Honesty:** printable false · 09a–d ≠ DONE · registry ≠ DONE · CORE-07/06 ≠ DONE · PAY/ATT OUT.

---

## 4. LIVE proof (read-only)

| Probe | Result |
|-------|--------|
| `CREATE TABLE … employee_contracts` | PRESENT (`contracts-insurance.service.ts`) + expand cols in legal-print |
| `keyword_map JSONB` on templates | PRESENT (`contract-legal-print.service.ts` ensureSchema) |
| `CREATE TABLE … hrm_merge_tokens` | PRESENT (`merge-tokens.service.ts`) |
| `PreviewResult` | `merged_fields` · `missing_fields` · `can_issue` · `cb_masked` · `template_code` PRESENT |
| `hrm_contract_print_versions` / clauses / templates | PRESENT ensureSchema — peer must_keep |
| `Controller('core')` in hrm-api src | **0** matches |
| `.docx` / DOCX merge SoT in contracts-insurance | **ABSENT** as primary store |

---

## 5. Honesty

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| `contracts_printable_ready` | **false RETAIN** |
| `hrm_personnel_uat_ready` | **false** |
| CORE / personnel / CTR UAT | **false** |
| C-SLICE | GWC later ≠ module UAT |
| 09a–d ADD = CORE-09 DONE | **DENIED** |
| registry alone = CORE-09 DONE | **DENIED** |
| CORE-07 DONE / checklist / free PATCH = DONE | **DENIED** |
| soft = CORE-06 DONE | **DENIED** |
| PAY / ATT / printable / closed-8 DONE | **DENIED** |
| Word/DOCX invent | **DENIED** |

---

## 6. Residual for next owner

| Item | Owner | Note |
|------|-------|------|
| API RETAIN cite F-CORE-CTR-01 + PREV + VER/TPL/CL | **sa** | paper `/core` alias only |
| Wire-only if closable gap (e.g. `statusLabelVi` envelope) | **sa** | **not** Dev invent · **not** schema ADD this DATA seat |
| PAY / ATT | OUT invent DONE | — |
| J-HRM-CORE-09-01..06 | DRAFT from BA | after API/FE — **DENY** reopen sealed peers |

---

## 7. Handoff contract

```yaml
work_item_id: PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01
from_role: ba-data
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-core-09-cluster-data-01.md
spec_path: docs/program/specs/PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01.md
next_owner: sa
next_dispatch_prompt: |
  work_item_id: PO-HRM-MVP-GD1-CORE-09-CLUSTER-API-01
  lane: governance · sa
  uc_ids: UC-BP-CORE-09
  depends_on: DATA-01 CONFIRMED HOLD · BA-01 O1–O12 · SA Option A · CORE07QC1-KZJTSHNT · printable false · Word/DOCX OUT
  MISSION: RETAIN cite F-CORE-CTR-01 physical /contracts-insurance/contracts* + F-CORE-CTR-PREV-01 + peers VER/TPL/CL/PACK — paper /core alias only — residual wire ONLY if closable gap proven — DENY Nest /core dual · Word invent · claim 09a–d/registry = CORE-09 DONE · invent PAY/ATT/printable DONE · wipe CORE-07 GATE/ACT-400 · soft≠CORE-06 · reopen seals · seed · apps/**
  exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-09-CLUSTER-API-01.md · PASS_TO_PM
```

---

*ba-data · 2026-08-09 · CONFIRMED HOLD · PASS_TO_PM*
