# Evidence — PO-HRM-MVP-GD1-REC-00-CLUSTER-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-00-CLUSTER-API-01` |
| **lane** | governance · sa |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **uc_ids** | `UC-BP-REC-00` |
| **Date** | 2026-08-09 |
| **depends_on** | DATA-01 CONFIRMED · BA-01 O1–O7 · SA-01 Option A LOCKED |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-API-01.md` |
| **ack_status** | **PASS_TO_PM** · API **CONFIRMED** |
| **change_mode** | DOC-DELTA F.1 · **NO** `apps/**` · **no seed** · **no honesty flip** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| Physical Nest `/api/hrm/recruitment/job-templates*` ONLY | **PASS** §1/§3 |
| F-JD-01 list · F-JD-02 create · F-JD-03 get · F-JD-04 patch/publish/retire | **PASS** §6 |
| Display-ready `status` draft\|active\|retired + `is_active` bridge | **PASS** §4 · cite DATA-01 |
| Publish Nháp→Hiệu lực + required-on-layout 4xx mint `HRM-REC-JD-PUB-*` | **PASS** §6.4.2 · §8 |
| Bindable filter prefer `status=active` · RETAIN `HRM-JD-YCTD-STATUS` | **PASS** §6.1/§6.5 |
| Code UQ 409 `HRM-JD-CODE-DUP` | **PASS** §8 · O4 |
| U19 list=get=mutate=publish=retire=bindable | **PASS** §10 |
| Paper F-REC-JD-01 `/rec/job-descriptions*` = alias only | **PASS** §3 |
| Each API: Mục đích · Nghiệp vụ · Tham chiếu bước SRS | **PASS** §6 |
| DENY Nest `/rec` dual · second JD table · job_postings SoT · seed · honesty · reopen W1–W4 · apps/** · boolean-only | **PASS** §1/§12 |
| ba-data NOT REQUIRED | **PASS** §9 — DATA-01 CONFIRMED |
| Unlock Dev-BE/FE | **PASS** §14 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| DATA-01 | §4–§7 status+bridge+backfill · error pointer · lifecycle |
| BA-01 | O1–O7 · AC-REC-JD-00-* · P01–P05 · VAL-REC-JD-* · BR-REC-JD-PUB |
| SA-01 | Option A LOCKED · physical job-templates · paper alias |
| AS-IS Nest (read-only) | `recruitment.controller` job-templates CRUD · `recruitment-catalog.service` list/create/patch/delete · create `is_active!==false` gap · delete soft false-only · bindable `is_active=TRUE` · `yctd-jd-bind.ts` STATUS |
| JdDynamic | `validateSnapshotAndValues` required loop → PUB gate reuse |
| YCTD-REF API | F-YCTD-JD-* RETAIN · codes STATUS/REQUIRED/NOT-FOUND |
| Peer style | REC-01/06A CLUSTER-API-01 F.1 physical prefer |
| SRS | FR-UC-BP-REC-00 Diễn biến #1–#3 · BR-BP-JD-01 |

---

## 3. Decisions summary

| Topic | Decision |
|-------|----------|
| Path | Physical `/recruitment/job-templates*` · paper `/rec/job-descriptions*` alias |
| Status DTO | ADD `status` + bridge `is_active` — boolean-only REJECTED |
| Create | Force `draft`/`false` (fix AS-IS auto-active) |
| Publish | ADD `POST …/:id/publish` · mint PUB-REQUIRED / PUB-LAYOUT-EMPTY / PUB-STATE |
| Retire | DELETE → `retired`+`is_active=false` |
| Bindable | `status=active AND is_active=true` · RETAIN HRM-JD-YCTD-STATUS |
| Reactivate | HOLD → HRM-REC-JD-REACTIVATE-HOLD |
| F-YCTD-JD | RETAIN contracts · dual-assert upgrade only |

---

## 4. Deliverables inventory

| Artifact | Path |
|----------|------|
| API F.1 DOC | `docs/program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-API-01.md` |
| This evidence | `docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-api-01.md` |
| Bus | `docs/program/AGENT_MESSAGE_BUS.md` append |

---

## 5. Honesty / DENY footer

| Flag / claim | Status |
|--------------|--------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** RETAIN HOLD |
| Module REC UAT / Phase1 DONE | **DENIED** |
| Seed / apps/** this seat | **NONE** |
| Nest `/rec` dual SoT | **DENIED** |
| Second JD master table | **DENIED** |
| `job_postings` as JD SoT | **DENIED** |
| Boolean-only MVP | **DENIED** |
| Reopen W1–W4 | **DENIED** |
| C-SLICE | **YES** |

---

## completion_report

- **Closed:** API F.1 residual CONFIRMED for UC-BP-REC-00 — physical job-templates F-JD-01..04 with status+bridge DTO, publish+PUB mint, bindable status=active, U19, paper alias; DENY dual Nest/SoT/seed/honesty/boolean-only/apps/**.
- **Residual:** **dev-be** (migrate status + create draft + publish + bindable dual-assert + retire) · **dev-fe** (chips VI + Phát hành + Network physical path) · then QA U65.
- **next_owner:** **pm**
- **ack_status:** **PASS_TO_PM**

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-00-CLUSTER-BE-01
lane: execution · dev-be
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-00
depends_on: API-01 CONFIRMED — docs/program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-API-01.md · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-api-01.md · DATA-01 CONFIRMED

MISSION: Implement Option A UPGRADE on Nest /api/hrm/recruitment/job-templates* ONLY —
(1) ensureSchema/migrate ADD status draft|active|retired + CHK + is_active bridge + backfill per DATA-01 §4–§5;
(2) F-JD-01 list return status + filter; bindable/for=yctd → status=active AND is_active=true;
(3) F-JD-02 create force draft/is_active=false (DENY auto-active);
(4) F-JD-03 get include status; preview=yctd STATUS on non-active;
(5) ADD POST …/:id/publish — required-on-layout gate mint HRM-REC-JD-PUB-REQUIRED|LAYOUT-EMPTY|STATE; set active+true;
(6) DELETE soft-retire → retired+false; UPGRADE yctd-jd-bind isYctdJdBindable dual-assert;
(7) RETAIN HRM-JD-CODE-DUP 409 · HRM-JD-YCTD-STATUS · HRM-REC-JD-POS · F-YCTD-JD contracts · U19 resolveHrmListScope list=get=mutate;
(8) jest: create draft · publish PASS/FAIL · bindable · code dup · scope parity · retire.
Cite: API-01 §4–§8 · DATA-01 · BA AC-REC-JD-00-* · BR-BP-JD-01.
DENY: Nest /rec dual controller · second JD table · job_postings dual-write · seed · honesty flip · reopen W1–W4 · boolean-only · FE invent.
allowed_paths: apps/api/hrm-api/src/recruitment/** (catalog · controller · yctd-jd-bind · specs) · related ensureSchema only
forbidden_paths: apps/web/** · Nest /rec SoT · rec_job_description physical CREATE
exit: evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-be-01.md · READY_FOR_QA or PASS_TO_PM with next_dispatch_prompt FE-01 · append bus
spec_read_ack required: srs FR-UC-BP-REC-00 · API-01 · DATA-01 · YCTD-REF
code_memory_required: true · change_mode: UPGRADE · preserve_default: true

--- parallel after BE contract started / same session if safe ---
work_item_id: PO-HRM-MVP-GD1-REC-00-CLUSTER-FE-01
lane: execution · dev-fe
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-00
depends_on: API-01 CONFIRMED · BE-01 READY_FOR_QA or contract stubs agreed

MISSION: Thư viện JD FE on physical /api/hrm/recruitment/job-templates* —
chips Nháp/Hiệu lực/Ngừng from DTO status (FAIL boolean-only);
create/save → draft; Phát hành → POST …/publish + toast PUB-*;
retire soft; YCTD picker bindable=true only Hiệu lực; Network assert path /recruitment/job-templates;
map HRM-JD-CODE-DUP / HRM-JD-YCTD-STATUS / HRM-REC-JD-PUB-* toasts VI;
F5 list+detail retain status; U19 persona scope.
DENY: call Nest /rec/job-descriptions as SoT · seed · honesty · Campaign/REC-03 · reopen W1–W4.
exit: evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-fe-01.md · READY_FOR_QA · append bus
```
