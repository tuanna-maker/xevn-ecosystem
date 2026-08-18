# Evidence — PO-HRM-MVP-GD1-REC-00-CLUSTER-BA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-00-CLUSTER-BA-01` |
| **lane** | governance · ba-process |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **uc_ids** | `UC-BP-REC-00` |
| **Date** | 2026-08-09 |
| **depends_on** | SA-01 Option A CONFIRMED · `docs/program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-SA-01.md` · `docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-sa-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-BA-01.md` |
| **ack_status** | **PASS_TO_PM** · O1–O7 **CONFIRMED** |
| **change_mode** | ADD AC pack · **NO** `apps/**` · **no seed** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| AC pack FR-UC-BP-REC-00 against Option A | **PASS** |
| Physical Nest `/recruitment/job-templates*` + paper F-REC-JD-01 alias | **PASS** O1 |
| CONFIRM O1–O7 | **PASS** — all CONFIRMED |
| Diễn biến #1 list · #2 save/publish · #3 YCTD Hiệu lực · Ngừng history · F5 · Network · VAL · J-* DRAFT | **PASS** |
| must_keep W1–W4 · soft FK · F-YCTD-JD · L3 · HRM-REC-JD-POS · U19 | **PASS** §6 |
| DENY Nest `/rec` dual · second SoT · postings · seed · honesty flip · reopen W1–W4 · invent · apps/** | **PASS** |
| Flip `jd_dynamic_done` / `recruitment_uat_ready` | **DENIED** |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| SA-01 | Option A LOCKED · O1–O7 open → this seat closes |
| SRS | `SRS_HRM_ENTERPRISE.md` FR-UC-BP-REC-00 · BR-BP-JD-01 · Diễn biến #1–#3 · status Nháp/Hiệu lực/Ngừng |
| WBS | WBS-REC-00 · REQ_REC_003 |
| YCTD-REF | soft FK · F-YCTD-JD · STATUS · J-HRM-JD-YCTD-01 PASS |
| JD-DYNAMIC | ARCH-02 Option A · L3 GWC · HOLD `jd_dynamic_done=false` |
| AS-IS (read-only) | `job_description_templates.is_active` boolean — gap vs 3-state |
| Peers BA | REC-06A / REC-08 style |

---

## 3. O1–O7 confirmation summary

| ID | Decision |
|----|----------|
| **O1** | Physical `/job-templates*` only; `/rec/job-descriptions*` alias |
| **O2** | **ADD** `status` `draft\|active\|retired` + `is_active` bridge — **REJECT** boolean-only MVP |
| **O3** | Publish Nháp→Hiệu lực = required-on-layout gate → 4xx if fail |
| **O4** | Code UQ → 409 |
| **O5** | YCTD Hiệu lực only · Ngừng history · F-YCTD-JD must_keep |
| **O6** | 00a/00b/00c RETAIN peer — no redefine |
| **O7** | Honesty false · C-SLICE |

---

## 4. Deliverables inventory

| Artifact | Path |
|----------|------|
| BA AC pack | `docs/program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-BA-01.md` |
| Journey DRAFT | `PROGRAM_JOURNEY_MAP.md` · J-HRM-REC-JD-00-01..04 |
| BA trace | `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` §30 |
| AC IDs | AC-REC-JD-00-01..05 · P01..P05 · ALT · EX · VAL-REC-JD-01..20 |
| J-* | J-HRM-REC-JD-00-01..04 DRAFT |
| UF | UF-HRM-REC-JD-00 DRAFT |

---

## 5. Honesty / DENY footer

| Flag / claim | Status |
|--------------|--------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** RETAIN HOLD |
| Module REC UAT / Phase1 DONE | **DENIED** |
| Seed in evidence | **DENIED** |
| Nest `/rec` dual SoT | **DENIED** |
| Second JD master table | **DENIED** |
| `job_postings` as JD SoT | **DENIED** |
| Reopen W1–W4 seals | **DENIED** |
| `apps/**` this seat | **NONE** |
| C-SLICE | **YES** |

---

## completion_report

- **Closed:** BA AC pack CONFIRMED O1–O7 for UC-BP-REC-00 against SA Option A; Diễn biến FE U65; VAL; J-* DRAFT; journey + BA_TRACE append; DENY dual/seed/honesty.
- **Residual:** **ba-data** status column DOC-DELTA (O2) → **sa** API F.1 publish/status → Dev after contracts → QA U65.
- **next_owner:** **ba-data** (then **sa** API)
- **ack_status:** **PASS_TO_PM**

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-00-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-00
depends_on: BA-01 O1–O7 CONFIRMED — docs/program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-BA-01.md · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-ba-01.md · SA-01 Option A LOCKED

MISSION: DOC-DELTA physical DB on job_description_templates ONLY — ADD status draft|active|retired + CHK; is_active bridge (active⇒true; draft|retired⇒false); backfill rule for legacy is_active=false; RETAIN soft FK job_template_id · code UQ · values_json/layout_snapshot · rec_jd_* peers; DENY second JD table · Nest dual · job_postings SoT · seed · honesty flip · reopen W1–W4 · apps/**.
Cite: BR-BP-JD-01 · AC-REC-JD-00-* · O2 · YCTD-REF DV-YCTD-JD-* · paper rec_job_description = alias.
exit: docs/program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-DATA-01.md · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-data-01.md · PASS_TO_PM · next_dispatch_prompt sa API F.1 residual publish/status DTO (F-JD-01..04 depth) · append bus
```
