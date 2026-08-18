# Evidence — PO-HRM-MVP-GD1-REC-00-CLUSTER-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-00-CLUSTER-SA-01` |
| **lane** | governance · sa |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **uc_ids** | `UC-BP-REC-00` |
| **Date** | 2026-08-09 |
| **depends_on** | Wave-4 QC-02 GWC `REC06AQC2-MSKZAM58` · `po-hrm-mvp-gd1-rec-06a-cluster-qc-02.md` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-SA-01.md` |
| **ack_status** | **PASS_TO_PM** · Option **A** **CONFIRMED** |
| **change_mode** | ADD Option/F.1 · **NO** `apps/**` · **no seed** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| Option A/B/C for JD master vs AS-IS Nest job-templates / jd-dynamic | **PASS** — Option **A** LOCKED |
| F.1 disposition physical prefer | **PASS** — F-JD-01..04 RETAIN; F-REC-JD-01 alias only |
| must_keep REC-01/02/08/06a sealed | **PASS** — §6.3 cite stamps |
| DENY Nest `/rec` dual · second JD SoT · honesty flip · seed | **PASS** — §5/§6.2 |
| Unlock BA AC after CONFIRMED · cấm code until CONFIRMED | **PASS** — next ba-process; no Dev unlock |
| Template ADR_OPTION §§1–7 | **PASS** |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| Board | `PO_HRM_MVP_GD1_CONTINUOUS.md` #7 WAVE-5 |
| SRS | `SRS_HRM_ENTERPRISE.md` FR-UC-BP-REC-00 · BR-BP-JD-01 · Diễn biến #1–#3 |
| WBS | `WBS_HRM_ENTERPRISE.md` WBS-REC-00 · REQ_REC_003 |
| JD-DYNAMIC | ARCH-02 Option A · DATA-01 · L3 QC-01 GWC |
| Honesty HOLD | `…-JD-DYNAMIC-DONE-HOLD-SA-01` · `jd_dynamic_done=false` |
| YCTD-REF | soft FK `job_template_id` · F-YCTD-JD-* |
| AS-IS code (read-only) | `recruitment.controller.ts` job-templates* · `recruitment-catalog.service.ts` `listJobDescriptionTemplates` · `jd-dynamic.service.ts` · `job_description_templates` |
| Peers SA | REC-01/02/08/06A Option A pattern |

---

## 3. Decision summary

| | |
|--|--|
| **Selected** | **Option A** — ACCEPT_AS_IS_UPGRADE on `job_description_templates` + jd-dynamic CFG |
| **Rejected B** | Greenfield `rec_job_description` + Nest `/rec/job-descriptions` dual |
| **Rejected C** | HOLD / claim L3 = FR-00 DONE / flip honesty |
| **Physical SoT** | `public.job_description_templates` |
| **Physical API** | `/api/hrm/recruitment/job-templates*` (+ jd-field-defs / layouts peers) |
| **Paper** | `rec_job_description` · F-REC-JD-01 `/rec/job-descriptions*` = **alias only** |
| **YCTD** | ONE soft FK `job_template_id` RETAIN |
| **Honesty** | `jd_dynamic_done=false` · `recruitment_uat_ready=false` · C-SLICE |

---

## 4. Residual unlocked for BA (not Dev yet)

| ID | Residual |
|----|----------|
| O2 | Status 3-state (Nháp/Hiệu lực/Ngừng) vs `is_active` boolean bridge |
| O3 | Publish gate required-on-layout |
| O1/O4–O7 | Path cite · code UQ · YCTD must_keep · peers · honesty footer |

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
| Reopen W1–W4 seals | **DENIED** |
| `apps/**` this seat | **NONE** |

---

## completion_report

- **Closed:** SA Option A CONFIRMED for UC-BP-REC-00 JD master MVP; F.1 path lock; must_keep/DENY; BA unlock.
- **Residual:** BA AC pack; optional status column DOC-DELTA; Dev after AC+contracts.
- **next_owner:** **ba-process**
- **ack_status:** **PASS_TO_PM**

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-00-CLUSTER-BA-01
lane: governance · ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-00
depends_on: SA-01 Option A CONFIRMED — docs/program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-SA-01.md · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-sa-01.md

MISSION: BA AC pack FR-UC-BP-REC-00 against Option A — physical Nest /api/hrm/recruitment/job-templates* + job_description_templates + rec_jd_* peers RETAIN; paper F-REC-JD-01 /rec/job-descriptions = alias only.
CONFIRM O1–O7 (path · status 3-state vs is_active bridge · publish gate · code UQ · YCTD bind must_keep · 00a/00b/00c peer scope · honesty).
AC: Diễn biến #1 list · #2 save/publish · #3 YCTD chọn Hiệu lực · Ngừng history · F5 · Network physical · VAL · J-* DRAFT.
must_keep: W1–W4 seals · soft FK job_template_id · F-YCTD-JD-* · JD-DYNAMIC L3 · HRM-REC-JD-POS · U19.
DENY: Nest /rec dual · second JD SoT · job_postings SoT · seed · flip jd_dynamic_done / recruitment_uat_ready · reopen W1–W4 · invent beyond SRS · apps/**.
exit: docs/program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-BA-01.md · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-ba-01.md · PASS_TO_PM · next sa/ba-data API|DATA residual if O2 needs status column else unlock API F.1 depth / Dev after contracts.
```
