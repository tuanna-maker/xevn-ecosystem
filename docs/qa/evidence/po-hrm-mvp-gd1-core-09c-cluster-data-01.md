# Evidence — PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01` |
| **lane** | governance · ba-data |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-15 seat #17) |
| **uc_ids** | `UC-BP-CORE-09c` |
| **Date** | 2026-08-09 |
| **depends_on** | BA-01 O1–O12 CONFIRMED · SA-01 Option A LOCKED · peer `CORE09BQC1-MSLB05DZ` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01.md` |
| **ack_status** | **PASS_TO_PM** · DATA **CONFIRMED HOLD** |
| **change_mode** | DOC-DELTA HOLD/RETAIN · **NO** `apps/**` · **no migrate run** · **no seed** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| CONFIRM HOLD — no ADD schema / mega-EAV / second VER store / Nest `/core` table / wipe print_versions; RETAIN LIVE hrm_contract_print_versions + denorm cols | **PASS** — DATA §1 HOLD · §4 RETAIN |
| Cite physical columns already LIVE for issued VER snapshots (merged_fields_json · clauses_snapshot_json · compensation_snapshot_json · version_no · pack_code · status issued/superseded · pdf_artifact_ref) | **PASS** — §3 Nest cite · §4.1–§4.2 (+ template_* · issued_at/by · archived_at) |
| Conditional UNLOCK ONLY if BA/QA proves VER/PDF field column gap — default = NOT unlock | **PASS** — §4.4 HOLD · gap NOT proven |
| RETAIN CORE-09b PACK+PREV ephemeral · CORE-09a clause body SoT + snapshot · CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY | **PASS** — §1/§8 |
| DENY invent 09d TPL as CORE-09c DONE · claim CORE-09b=printable · contracts_printable_ready · reopen J-HRM-CORE-09B/09A/08/02/01 · seed · honesty flip · apps/** | **PASS** — §8 DENY |
| Carry OBS R-QA-CORE-09B-CLAUSE-FP-EMPTY → peer 09d | **PASS** — §8 Carry |
| Unlock next: sa API-01 HOLD/RETAIN cite F-CORE-CTR-VER-01/02 + F-CORE-CTR-PDF-01 — not Dev invent | **PASS** — §10 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| BA-01 | HOLD default · O1 path · O2 can_issue · O3 snapshot freeze · O4 amend supersede · O5 PREV ephemeral · O6 FE F5 · O7 registry · O8 peers OUT · O9 must_keep · O10 honesty · AC-CORE-09C-* · VAL-CORE-VER-* |
| SA-01 | Option A LOCKED · LIVE POST/GET print-versions* + GET pdf · paper `/core` alias · REJECT B/C |
| AS-IS Nest (read-only) | `contract-legal-print.service.ts` ensureSchema CREATE `hrm_contract_print_versions` + ADD `template_code` · expand denorm on `employee_contracts` · createPrintVersion supersede+INSERT issued · renderPrintVersionPdf from snapshot · no Nest `/core` VER SoT |
| Paper DB | LEGAL-PRINT-DATA-01 §3.3 · DATA-02 lineage RETAIN |
| Paper API | F-CORE-CTR-VER-01/02 · PDF-01 RETAIN · PACK/PREV/CL must_keep · TPL OUT invent |
| CORE-09b/09a/08/02/01 DATA | must_keep · ≠ printable · Nest `/core` DENY |

---

## 3. Physical decisions (summary)

1. **HOLD / RETAIN:** LIVE `hrm_contract_print_versions` + denorm pack/template on `employee_contracts` — **no ADD** schema / mega-EAV / second VER / Nest `/core` / wipe.
2. **LIVE cols cited:** `merged_fields_json` · `clauses_snapshot_json` · `compensation_snapshot_json` · `version_no` · `pack_code` · `template_id`/`template_code`/`template_version` · `status` issued/superseded (CHK also draft_preview) · `issued_at`/`issued_by` · `pdf_artifact_ref` · `archived_at`.
3. **Unlock:** VER/PDF field column gap **NOT proven** → **NOT unlock**.
4. **Path:** physical `/contracts-insurance/*` VER/PDF · `/core` alias only.
5. **must_keep:** CORE-09b/09a/08/02/01 · Nest `/core` DENY · honesty false · C-SLICE · OBS → 09d.

---

## 4. Honesty

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| `contracts_printable_ready` | **false** · **DENY** flip |
| CORE / personnel / CTR UAT | **false** |
| Claim CORE-09b = printable DONE | **DENIED** |
| Invent 09d TPL DONE here | **DENIED** |
| C-SLICE | GWC later ≠ module UAT ≠ printable ready |
| Carry OBS | `R-QA-CORE-09B-CLAUSE-FP-EMPTY` → **09d** |

---

## 5. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **sa** |
| **next_work_item** | `PO-HRM-MVP-GD1-CORE-09C-CLUSTER-API-01` |
| **Dev** | **HOLD** until API CONFIRMED RETAIN · then FE save/PDF fidelity residual only |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09C-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09c
depends_on: DATA-01 CONFIRMED HOLD · docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01.md · BA-01 O1–O12 · SA-01 Option A · peer CORE09BQC1-MSLB05DZ
spec_ref: F-CORE-CTR-VER-01 · F-CORE-CTR-VER-02 · F-CORE-CTR-PDF-01 RETAIN cite · must_keep F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 ephemeral · F-CORE-CTR-CL-01..04 · physical /contracts-insurance/* · paper /core alias only

MISSION — API F.1 lock (docs-only · HOLD/RETAIN):
1) RETAIN cite LIVE POST/GET …/contracts/:id/print-versions* + GET …/print-versions/:versionId/pdf — F.1 mỗi fn: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS (FR-09c Diễn biến #) · DTO↔DB cols from DATA-01 · lỗi HRM-CTR-VER/ISSUE/PDF*
2) LOCK: server re-preview + can_issue gate · snapshot freeze · amend supersede · PDF-from-snapshot only · U19 scope_parity list=get=create=pdf
3) DENY Nest /core dual VER/PDF SoT · DENY invent new endpoints/schema · DENY rewrite PREV→INSERT VER · DENY invent 09d TPL as this WI DONE
4) RETAIN must_keep CORE-09b/09a/08/02/01 seals · carry R-QA-CORE-09B-CLAUSE-FP-EMPTY → 09d
5) Honesty: contracts_printable_ready=false · C-SLICE · DENY claim CORE-09b=printable · no apps/** · no seed
6) Unlock next: Dev-FE save VER + PDF U65 fidelity residual ONLY — Dev-BE HOLD unless residual wire gap proven — not Dev invent

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-API-01.md · PASS_TO_PM
```

---

*Evidence DATA-01 · Wave-15 CORE-09c · 2026-08-09*