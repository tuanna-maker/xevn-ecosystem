# PO-HRM-UI-BRAND-W4-REC-A — Recruitment MVP spine remaster

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-REC-A` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **Date** | 2026-08-05 |
| **Program** | `PO-HRM-UI-BRAND-REMASTER-01` · W4 REC-A (not remaster DONE) |
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805` **§16 LOCKED** (Montserrat + Source Sans 3 · S3=A · B4 cấm AI) |
| **Inventory** | `HRM_UI_BRAND_SCREEN_INVENTORY.md` **W3-REC-A** · R01–R05, R08, R11–R12, R15 |
| **Neo SoT** | `docs/client-delivery/hrm-enterprise-blueprint/ui-neo/styles.css` · Dialog foundation FE-DIALOG-01 |
| **change_mode** | `UPGRADE` · preserve_default · code_memory APPEND · NO API invent |
| **ack_status** | **READY_FOR_QA** |
| **stall** | **n=1 CLOSE** — prior seat evidence/bus race; this seat re-verified chrome + `theme-contrast --strict` + **REWRITE** evidence |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| ADR §16 | Fonts Montserrat + Source Sans 3 · S3=A · B4 no purple/cream/glow AI |
| ADR §10 / §15.4 | Modal brand bar `#1E40AF` · glass header · title ≥20 · wordmark left |
| Inventory | R01 dashboard · R02 YCTD · R03 JD · R04 jobs · R05 candidates · R08 interviews · R11 reports · R12 job create/edit · R15 Hire→Employee |
| Dialog foundation | Shared `DialogHeader` glass + wordmark + `::before` 4px primary (FE-DIALOG-01) |
| must_keep | Tab ids · Hire bind G-DB-01 · CatalogSearchPicker · ViMoneyInput · WF submit · U65 zero-seed |
| forbidden | seed · remaster DONE · Attendance CLOSED · Face LIVE · invent OCR · Nest/API invent · R07 campaign remaster LIVE |

---

## 1. Surfaces remastered (10)

| surface_id | Path(s) | Change summary |
|------------|---------|----------------|
| R01 | `pages/Recruitment.tsx` | Dashboard title Montserrat ≥20 · primary CTA · `rec-dashboard-tab-precision` · tab chrome primary lock · orange shell KPI → `text-warning` DNA |
| R02 | `JobRequisitionsTab.tsx` | Title ≥20 · sharp secondary · error/WF-lock honesty → warning DNA · `rec-requisitions-tab-precision` |
| R03 | `JobTemplatesTab.tsx` | Title ≥20 · error honesty warning DNA · `rec-jd-library-tab-precision` |
| R04 | `JobPostingsTab.tsx` | KPI primary/success/neutral/accent · DNA status/priority (no amber AI) · `rec-jobs-tab-precision` |
| R05 | `CandidatesTab.tsx` | Stage/source chips DNA · title ≥20 · star warning DNA · `rec-candidates-tab-precision` |
| R08 | `InterviewsTab.tsx` | KPI DNA borders · status/result chips Precision · title ≥20 · `rec-interviews-tab-precision` |
| R11 | `RecruitmentReportsTab.tsx` | Chart hex `#1E40AF`/`#06B6D4` · kill indigo/violet · KPI sharp · **S3=A honesty** campaigns OUT |
| R12 | `JobPostingsTab.tsx` form Dialog | `sm:max-w-[920px]` · glass/wordmark · compact fields · `rec-job-create-edit-dialog-precision` |
| R15 | `HireEmployeeLinkDialog.tsx` | Glass/wordmark · title ≥20 · compact select · sticky CTA · `rec-hire-employee-link-dialog-precision` |
| (shell) | Top tabs | Primary active · font-semibold · no rainbow AI |

**S3=A honesty:** Reports Alert `rec-reports-campaign-honesty` — R07 campaigns OUT; metric «Chiến dịch đang chạy» not claimed LIVE hub.

**Cấm honored:** no seed · Face not LIVE · Attendance not CLOSED · no remaster DONE · no OCR invent · no Nest/API invent.

---

## 2. Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/pages/Recruitment.tsx` | CODE-MEMORY APPEND · dashboard chrome · orange→warning DNA |
| `apps/web/hrm/src/components/recruitment/JobPostingsTab.tsx` | KPI + DNA badges + create/edit dialog + `rec-jobs-tab-precision` |
| `apps/web/hrm/src/components/recruitment/HireEmployeeLinkDialog.tsx` | R15 dialog remaster |
| `apps/web/hrm/src/components/recruitment/CandidatesTab.tsx` | Stage/source DNA · title · search icon muted |
| `apps/web/hrm/src/components/recruitment/InterviewsTab.tsx` | KPI/status DNA · title · result chips |
| `apps/web/hrm/src/components/recruitment/RecruitmentReportsTab.tsx` | Chart palette + campaign honesty + sharp insights |
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | Title + honesty warning DNA |
| `apps/web/hrm/src/components/recruitment/JobTemplatesTab.tsx` | Title + error honesty warning DNA |

---

## 3. Verify log (reproducible — this seat)

```text
> pnpm run verify:xevn:theme-contrast -- --strict
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563 · muted-fg OK (portal+HRM+TW)
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] STRICT PASS — 0 pale hits
exit 0
```

Pale/AI grep on REC-A paths: **0** `purple-|indigo-|#6366f1|#8b5cf6|bg-amber-100|text-orange-500`.

---

## 4. QA browser checklist (U65 · zero-seed)

| Check | Persona / path | Expect |
|-------|----------------|--------|
| R01 | `ceo@xe.vn` → HRM → Tuyển dụng → Dashboard | Title ≥20 · primary CTA · funnel sharp |
| R02–R05 | Tabs YCTD / JD / Jobs / Candidates | Titles ≥20 · no purple KPI/chips |
| R08 | Phỏng vấn | DNA KPI borders · warning DNA OK (not orange AI) |
| R11 | Báo cáo | Honesty banner campaigns OUT · charts primary/cyan |
| R12 | Jobs → Tạo / Sửa tin | Brand bar `#1E40AF` · logo left · glass · title ≥20 · compact fields · primary CTA |
| R15 | Candidates → chốt hired (hire picker) | Same dialog chrome · compact select |
| Fonts | DevTools | Title Montserrat · body Source Sans 3 |
| F5 | After open dialog | Chrome persists |

**testids:** `rec-dashboard-tab-precision` · `rec-requisitions-tab-precision` · `rec-jd-library-tab-precision` · `rec-jobs-tab-precision` · `rec-candidates-tab-precision` · `rec-interviews-tab-precision` · `rec-reports-tab-precision` · `rec-reports-campaign-honesty` · `rec-job-create-edit-dialog-precision` · `rec-hire-employee-link-dialog-precision` · `xevn-dialog-wordmark`

---

## 5. Residual / not claimed

| Item | Status |
|------|--------|
| W3-REC-B (R06, R09–R10, R13–R14, R16–R17) | **OUT** — next wave (shell orange→warning hygiene only on R09/R10 KPI) |
| R07 Campaigns remaster | **SKIP** — honesty only on reports metric |
| Remaster DONE / Attendance CLOSED / Face LIVE | **OUT** |
| Browser screenshot this seat | **QA** — L0 stack not asserted here |
| API invent / OCR invent | **OUT** |

---

## Handoff

```yaml
work_item_id: PO-HRM-UI-BRAND-W4-REC-A
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w4-rec-a.md
next_owner: qa
next_dispatch_prompt: |
  Task qa PO-HRM-UI-BRAND-W4-REC-A-QA — browser U65 zero-seed ceo@xe.vn;
  HRM Tuyển dụng: Dashboard + YCTD + JD + Jobs + Candidates + Interviews + Reports;
  assert titles>=20 · no purple/indigo AI · Job create/edit dialog brand bar+logo+glass+compact;
  Hire→Employee dialog same chrome; Reports campaign honesty S3=A;
  theme-contrast --strict already exit 0 on FE seat;
  evidence docs/qa/evidence/po-hrm-ui-brand-w4-rec-a-qa.md;
  cấm seed / Face LIVE / Attendance CLOSED / remaster DONE / invent OCR
```
