# Evidence — PO-HRM-MVP-GD1-REC-04-CLUSTER-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-04-CLUSTER-API-01` |
| **lane** | governance · sa |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-6) |
| **uc_ids** | `UC-BP-REC-04` |
| **Date** | 2026-08-09 |
| **depends_on** | BA-01 O1–O8 CONFIRMED · SA-01 Option A LOCKED |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-04-CLUSTER-API-01.md` |
| **ack_status** | **PASS_TO_PM** · API **CONFIRMED** |
| **change_mode** | DOC-DELTA F.1 · **NO** `apps/**` · **no seed** · **no honesty flip** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| Physical prefer GET candidates-pool (+ YCTD context) | **PASS** §5.1 |
| POST …/internal-scan OR PATCH pipeline-flags with `internal_scan_*` | **PASS** §5.2–§5.4 |
| Gate `posted` until done\|skip | **PASS** §4 · §5.4 · BR-BP-CV-01 |
| DTO display-ready `internal_scan_done\|skipped\|at\|skip_reason` on YCTD | **PASS** §4 · §6.1 |
| RETAIN `posted`/`has_cv`/`interview_started`/`cv_intake_allowed` | **PASS** §4 · §6.1 |
| Mint `HRM-REC-CV-SCAN-*` | **PASS** §7 |
| F.1 Mục đích · Nghiệp vụ · bước SRS Diễn biến #1–#2 | **PASS** §5.1–§5.4 |
| U19 scope_parity | **PASS** §8 |
| Paper `/rec` = alias only | **PASS** §3 |
| ba-data NOT REQUIRED (O2 JSON keys) | **PASS** §9 |
| DENY second CV table · Nest `/rec` dual · REC-03 · scan event sole SoT · seed · honesty · reopen REC-00 | **PASS** §1/§11 |
| Unlock Dev-BE/FE | **PASS** §12 · §14 |
| No invent beyond BA/SRS · no apps/** | **PASS** |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| BA-01 | O1–O8 · AC-REC-CV-04-* · VAL-REC-CV-* · flag dictionary · error family draft |
| SA-01 | Option A LOCKED · F-REC-CV-SCAN-01..03 disposition · DENY dual SoT |
| REC-02 API-01 | F-REC-YCTD-04 LIVE baseline · PipelineFlagsDto RETAIN |
| UV-YCTD API | F-REC-UV-YCTD-* · CMP RETAIN |
| SRS | FR-UC-BP-REC-04 Diễn biến #1–#2 · BR-BP-CV-01 · 0-hits/skip |
| AS-IS Nest (read-only) | `GET candidates-pool` stage-only filter · `PatchRequisitionPipelineFlagsDto` 4 booleans · `PipelineFlags` in `yctd-requisition-gates.ts` · no internal-scan route · `public.candidates` position/notes |
| Peer style | REC-00/02/06A/08 CLUSTER-API-01 F.1 physical prefer |

---

## 3. Decisions summary

| Topic | Decision |
|-------|----------|
| Path | Physical `/recruitment/*` · paper `/rec/*` alias |
| Kho | Lane B `candidates-pool` UPGRADE criteria (O3/O4) |
| Complete/skip preferred | **ADD** `POST …/internal-scan` |
| Synonym | **UPGRADE** `PATCH …/pipeline-flags` + posted gate |
| Persist | JSON keys on `pipeline_flags_json` — ba-data **NOT REQUIRED** |
| Attach | Cite UV-YCTD only — **no** redefine 05a |
| External GĐ1 | `posted` readiness — **DENY** REC-03 |
| Skill field | Map LIVE (`position`/`notes`/…) — **Q-REC-CV-SKILL-FIELD** · DENY mega-EAV |

---

## 4. Deliverables inventory

| Artifact | Path |
|----------|------|
| API F.1 DOC | `docs/program/specs/PO-HRM-MVP-GD1-REC-04-CLUSTER-API-01.md` |
| This evidence | `docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-api-01.md` |
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
| Second CV person table | **DENIED** |
| Scan event sole SoT | **DENIED** |
| REC-03 / `job_postings` as kênh ngoài SoT | **DENIED** |
| Reopen REC-00 / W1–W5 rewrite | **DENIED** |
| C-SLICE | **YES** |

---

## completion_report

- **Closed:** API F.1 residual CONFIRMED for UC-BP-REC-04 — physical candidates-pool scan + internal-scan/pipeline-flags UPGRADE, display-ready `internal_scan_*`, posted gate, mint `HRM-REC-CV-SCAN-*`, U19, paper alias; ba-data NOT REQUIRED; DENY dual Nest/CV SoT/REC-03/scan-event-sole/seed/honesty/apps/**.
- **Residual:** **dev-be** + **dev-fe** residual Quét kho · then QA U65 J-HRM-REC-CV-04-01..04 · QC GWC C-SLICE.
- **next_owner:** **pm**
- **ack_status:** **PASS_TO_PM**

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-04-CLUSTER-BE-01
lane: execution · dev-be
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-04
depends_on: API-01 CONFIRMED — docs/program/specs/PO-HRM-MVP-GD1-REC-04-CLUSTER-API-01.md · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-api-01.md · BA-01 O1–O8 · SA Option A

MISSION: Implement Option A residual on Nest /api/hrm/recruitment/* ONLY —
(1) Extend PipelineFlags parse/merge/DTO with internal_scan_done|skipped|at|skip_reason defaults — RETAIN posted/has_cv/interview_started/cv_intake_allowed (no wipe);
(2) ADD POST …/requisitions/:id/internal-scan action=complete|skip writing same JSON keys; skip reason+HR|TP → HRM-REC-CV-SCAN-SKIP-REASON|FORBIDDEN; receivable → SCAN-YCTD;
(3) UPGRADE PATCH …/pipeline-flags — accept scan keys + DENY posted=true until done|skip → HRM-REC-CV-SCAN-REQUIRED;
(4) UPGRADE GET candidates-pool — YCTD context + title+skill/exp criteria (O4); map LIVE fields (Q-REC-CV-SKILL-FIELD); empty 200;
(5) YCTD list/get return display-ready pipeline_flags incl. scan keys;
(6) U19 jest list=get=scan=flags=attach; 0-hits done; skip; posted gate; regression W2/UV-YCTD/JD.
Cite: API-01 §4–§8 · BA AC-REC-CV-04-* · FR-UC-BP-REC-04 · BR-BP-CV-01.
cấm: Nest /rec dual · second CV table · scan event sole SoT · REC-03 · seed · honesty flip · reopen REC-00 · apps outside recruitment slice
exit: evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-be-01.md · READY_FOR_QA · bus

PARALLEL (after BE contracts stable or same wave per 26):
work_item_id: PO-HRM-MVP-GD1-REC-04-CLUSTER-FE-01
lane: execution · dev-fe
MISSION: YCTD open_for_hire → Quét kho UI (title+skill/exp) → GET /recruitment/candidates-pool; attach UV-YCTD RETAIN; Hoàn tất/Skip → internal-scan|flags; block posted until done|skip; F5 flags; Network physical /recruitment/ only; DENY Campaign/REC-03/Nest /rec.
exit: docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-fe-01.md · READY_FOR_QA
```

---

## next_owner

**pm** — dispatch **dev-be** (`…-BE-01`) + **dev-fe** (`…-FE-01`) same session (U43/U69).
