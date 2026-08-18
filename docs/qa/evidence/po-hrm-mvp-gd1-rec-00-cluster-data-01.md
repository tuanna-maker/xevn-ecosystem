# Evidence — PO-HRM-MVP-GD1-REC-00-CLUSTER-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-00-CLUSTER-DATA-01` |
| **lane** | governance · ba-data |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **uc_ids** | `UC-BP-REC-00` |
| **Date** | 2026-08-09 |
| **depends_on** | BA-01 O1–O7 CONFIRMED · SA-01 Option A LOCKED |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-DATA-01.md` |
| **ack_status** | **PASS_TO_PM** · DATA **CONFIRMED** |
| **change_mode** | DOC-DELTA physical · **NO** `apps/**` · **no migrate run** · **no seed** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| DOC-DELTA on `job_description_templates` **ONLY** | **PASS** |
| ADD `status` `draft`\|`active`\|`retired` + CHK | **PASS** §4.2/4.4 |
| `is_active` bridge active⇒true; draft\|retired⇒false | **PASS** §4.3 + bridge CHK |
| Backfill rule for legacy `is_active=false` | **PASS** §5 — YCTD EXISTS → `retired` else `draft`; true → `active` |
| RETAIN soft FK `job_template_id` · code UQ · values_json/layout_snapshot · `rec_jd_*` | **PASS** §2/§4.1 |
| Cite BR-BP-JD-01 · AC-REC-JD-00-* · O2 · DV-YCTD-JD-* · paper alias | **PASS** §7–§8 |
| DENY second JD table · Nest dual · job_postings SoT · seed · honesty flip · reopen W1–W4 · apps/** | **PASS** §1/§9 |
| Flip `jd_dynamic_done` / `recruitment_uat_ready` | **DENIED** |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| BA-01 | O2 ADD status CONFIRMED · AC-REC-JD-00-* · VAL-REC-JD-05/06/08 · backfill open → closed here |
| SA-01 | Option A LOCKED · physical `job_description_templates` · paper alias |
| YCTD-REF DB | ONE soft FK · DV-YCTD-JD-12/13/14 · STATUS gate |
| JD-DYNAMIC ARCH/DATA | §3.4 values/layout RETAIN · SoT templates |
| AS-IS Nest (read-only) | `recruitment-catalog.service.ts` CREATE + `is_active` + UQ `(company_id,code)` · bindable `is_active=TRUE` |
| Paper DB | §2.1 `rec_job_description.status` draft\|active\|retired = alias target |
| Style peer | `PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md` |

---

## 3. Physical decisions summary

| Topic | Decision |
|-------|----------|
| SoT | UPGRADE `public.job_description_templates` only |
| ADD | `status TEXT` + CHK IN (draft,active,retired) + bridge CHK |
| RETAIN | `is_active` as bridge slave · code UQ · JSONB dynamic · soft FK |
| Backfill | true→active; false+YCTD ref→retired; false+no ref→draft |
| Create default | `draft` + `is_active=false` |
| Bindable | `status='active'` ∧ `is_active=true` |
| Soft-retire | `retired` only · hard DELETE FORBIDDEN |
| Paper | `rec_job_description` alias only |

---

## 4. Deliverables inventory

| Artifact | Path |
|----------|------|
| DATA DOC-DELTA | `docs/program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-DATA-01.md` |
| This evidence | `docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-data-01.md` |
| Bus | `docs/program/AGENT_MESSAGE_BUS.md` append |

---

## 5. Honesty / DENY footer

| Flag / claim | Status |
|--------------|--------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** RETAIN HOLD |
| Module REC UAT / Phase1 DONE | **DENIED** |
| Seed / migrate run / apps/** | **NONE this seat** |
| Nest `/rec` dual SoT | **DENIED** |
| Second JD master table | **DENIED** |
| `job_postings` as JD SoT | **DENIED** |
| Reopen W1–W4 | **DENIED** |
| C-SLICE | **YES** |

---

## completion_report

- **Closed:** Physical DOC-DELTA CONFIRMED for UC-BP-REC-00 O2 — `status` + CHK + `is_active` bridge + deterministic backfill; RETAIN YCTD soft FK / code UQ / dynamic JSONB / `rec_jd_*`; DENY dual SoT / Nest dual / seed / honesty / apps/**.
- **Residual:** **sa** API F.1 residual publish/status DTO (F-JD-01..04 depth) + PUB mint + bindable prefer `status='active'`.
- **next_owner:** **sa**
- **ack_status:** **PASS_TO_PM**

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-00-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-00
depends_on: DATA-01 CONFIRMED — docs/program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-DATA-01.md · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-data-01.md · BA-01 O1–O7 · SA-01 Option A LOCKED

MISSION: API_DESIGN F.1 residual on physical Nest /api/hrm/recruitment/job-templates* ONLY (F-JD-01 list · F-JD-02 create · F-JD-03 get-by-id · F-JD-04 patch/publish/retire) — ADD display-ready status draft|active|retired + is_active bridge contract; publish Nháp→Hiệu lực transition + required-on-layout 4xx mint (HRM-JD-* / HRM-REC-JD-PUB-*); bindable filter status=active (RETAIN HRM-JD-YCTD-STATUS); code UQ 409; U19 list=get=mutate; paper F-REC-JD-01 /rec/job-descriptions* = alias only.
Cite: DATA-01 §4–§7 · BR-BP-JD-01 · AC-REC-JD-00-* · O1–O5 · DV-YCTD-JD-* · F-YCTD-JD RETAIN.
DENY: Nest /rec dual SoT · second JD table · job_postings SoT · seed · honesty flip · reopen W1–W4 · apps/** · boolean-only MVP.
exit: docs/program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-API-01.md · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-api-01.md · PASS_TO_PM · next_dispatch_prompt Dev-BE/FE after API CONFIRMED · append bus
```
