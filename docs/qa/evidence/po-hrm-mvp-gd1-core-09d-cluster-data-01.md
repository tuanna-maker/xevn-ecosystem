# Evidence — PO-HRM-MVP-GD1-CORE-09D-CLUSTER-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09D-CLUSTER-DATA-01` |
| **lane** | governance · ba-data |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-16 seat #18) |
| **uc_ids** | `UC-BP-CORE-09d` |
| **Date** | 2026-08-09 |
| **depends_on** | BA-01 O1–O12 CONFIRMED · SA-01 Option A LOCKED · peer `CORE09CQC1-MSLBXMUT` · must_keep `CORE09BQC1-MSLB05DZ` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-DATA-01.md` |
| **ack_status** | **PASS_TO_PM** · DATA **CONFIRMED HOLD** |
| **change_mode** | DOC-DELTA HOLD/RETAIN · **NO** `apps/**` · **no migrate run** · **no seed** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| CONFIRM HOLD — no ADD schema / mega-EAV / second TPL store / Nest `/core` table / wipe open catalog / reinstate `CHK code IN (8)`; RETAIN LIVE `hrm_contract_templates` + `hrm_contract_template_clauses` | **PASS** — DATA §1 HOLD · §4 RETAIN |
| Cite physical columns already LIVE for open catalog + matrix (`code` · `pack_code` · duration · `title_print_vi` · `matrix_family` · `status`) + junction `clause_ids` bind | **PASS** — §3 Nest cite · §4.1–§4.2 (+ term · layout/keyword · lineage · soft archive) |
| Conditional UNLOCK ONLY if BA/QA proves TPL matrix/bind column gap — default = NOT unlock | **PASS** — §4.4 HOLD · gap NOT proven |
| RETAIN CORE-09c VER/PDF · CORE-09b PACK+PREV ephemeral · CORE-09a clause body SoT · CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY · CORR-01/DYNAMIC-LOCK | **PASS** — §1/§8 |
| DENY closed enum · claim CORE-09c VER/PDF = printable UAT · invent printable DONE · claim closed-8 TPL DONE · `contracts_printable_ready` · reopen J-HRM-CORE-09C/09B/09A/08/02/01 · seed · honesty flip · apps/** | **PASS** — §8 DENY |
| OBS `R-QA-CORE-09B-CLAUSE-FP-EMPTY` disposition RETAIN junction SoT (no seed) | **PASS** — §8 OBS |
| Unlock next: sa API-01 HOLD/RETAIN cite F-CORE-CTR-TPL-01/02 (+ CFG-01) — not Dev invent | **PASS** — §10 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| BA-01 | HOLD default · O1 path · O2 open catalog · O3 CODE-INVALID format-only · O4 matrix · O5 OBS junction · O6 FE F5 · O7 registry · O8 peers OUT · O9 CORE-09c ≠ printable · O10 honesty · O11 display-ready · O12 J-* · AC-CORE-09D-* · VAL-CORE-TPL-* |
| SA-01 | Option A LOCKED · LIVE GET/POST/PATCH contract-templates* + PUT clauses · CORR-01/DYNAMIC-LOCK · REJECT B/C |
| AS-IS Nest (read-only) | `contract-legal-print.service.ts` ensureSchema CREATE `hrm_contract_templates` + `hrm_contract_template_clauses` · ADD matrix cols · DROP closed-8 CHK · pack/term/matrix CHK · `replaceTemplateClauses` · no Nest `/core` TPL SoT |
| CORR / DYNAMIC-LOCK | starter 8 examples · FORBIDDEN CHK IN(8) · CODE-INVALID format-only |
| Paper API | F-CORE-CTR-TPL-01/02 · CFG-01 RETAIN · VER/PDF/PACK/PREV/CL must_keep |
| CORE-09c/09b/09a/08/02/01 DATA | must_keep · ≠ printable · Nest `/core` DENY |

---

## 3. Physical decisions (summary)

1. **HOLD / RETAIN:** LIVE `hrm_contract_templates` + `hrm_contract_template_clauses` — **no ADD** schema / mega-EAV / second TPL / Nest `/core` / wipe / reinstate closed-8.
2. **LIVE cols cited:** `code` · `name_vi` · `pack_code` · `default_term_type` · `default_duration_days` · `default_duration_months` · `title_print_vi` · `matrix_family` · `status` · `layout_json`/`keyword_map` · soft `archived_at` · lineage; junction `template_id`·`clause_id`·`sort_order`.
3. **Unlock:** TPL matrix/bind column gap **NOT proven** → **NOT unlock**.
4. **Path:** physical `/contracts-insurance/contract-templates*` · `/core` alias only.
5. **OBS:** RETAIN junction SoT · no seed · ≠ printable DONE.
6. **must_keep:** CORE-09c/09b/09a/08/02/01 · CORR-01 · Nest `/core` DENY · honesty false · C-SLICE.

---

## 4. Honesty

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| `contracts_printable_ready` | **false** · **DENY** flip |
| CORE / personnel / CTR UAT | **false** |
| Claim CORE-09c VER/PDF = printable DONE | **DENIED** |
| Claim closed-8 TPL DONE | **DENIED** |
| Invent printable DONE | **DENIED** |
| C-SLICE | GWC later ≠ module UAT ≠ printable ready |
| OBS | `R-QA-CORE-09B-CLAUSE-FP-EMPTY` → junction RETAIN · no seed |

---

## 5. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **sa** |
| **next_work_item** | `PO-HRM-MVP-GD1-CORE-09D-CLUSTER-API-01` |
| **Dev** | **HOLD** until API CONFIRMED RETAIN · then FE Settings/picker + clause bind fidelity residual only |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09D-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09d
depends_on: DATA-01 CONFIRMED HOLD · docs/program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-DATA-01.md · BA-01 O1–O12 · SA-01 Option A · peer CORE09CQC1-MSLBXMUT · must_keep CORE09BQC1-MSLB05DZ
spec_ref: F-CORE-CTR-TPL-01 · F-CORE-CTR-TPL-02 (+ PUT …/clauses · activate) · F-CORE-CTR-CFG-01 RETAIN cite · must_keep F-CORE-CTR-VER-01/02 + F-CORE-CTR-PDF-01 · F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 ephemeral · F-CORE-CTR-CL-01..04 · physical /contracts-insurance/* · paper /core alias only · CORR-01/DYNAMIC-LOCK · OBS junction RETAIN

MISSION — API F.1 lock (docs-only · HOLD/RETAIN):
1) RETAIN cite LIVE GET/POST/PATCH …/contract-templates* + GET …/:id + POST …/activate + PUT …/:id/clauses — F.1 mỗi fn: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS (FR-09d Diễn biến #) · DTO↔DB cols from DATA-01 · lỗi HRM-CTR-TPL-* (CODE-INVALID format-only · KEY · NONE · PACK-MISMATCH · 404) · CL-404
2) LOCK: open catalog · Settings 9+ · matrix=xevn=matrix_family only · junction clause_ids bind SoT · U19 scope_parity list=get=create=put-clauses · CORR starter≠ceiling
3) DENY Nest /core dual TPL SoT · DENY invent new endpoints/schema · DENY reinstate closed-8 · DENY claim CORE-09c VER/PDF = printable UAT · DENY invent printable DONE · DENY claim closed-8 TPL DONE
4) RETAIN must_keep CORE-09c/09b/09a/08/02/01 seals · OBS R-QA-CORE-09B-CLAUSE-FP-EMPTY disposition via PUT clauses (no seed)
5) Honesty: contracts_printable_ready=false · C-SLICE · no apps/** · no seed
6) Unlock next: Dev-FE Settings/picker + clause bind fidelity residual ONLY — Dev-BE HOLD unless residual wire gap proven — not Dev invent

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-API-01.md · PASS_TO_PM
```

---

## 6. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | ba-data **CONFIRMED HOLD** UC-BP-CORE-09d: RETAIN LIVE open TPL + junction; cite matrix cols; NOT unlock; OBS junction RETAIN (no seed); must_keep CORE-09c..01 · CORR; DENY closed-8 / printable claims / apps/**; next sa API RETAIN cite TPL-01/02 (+CFG-01). |
| **next_owner** | **sa** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-data-01.md` · `docs/program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-DATA-01.md` |
