# Evidence — PO-ECO-TC-HRM-GUIDE-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-ECO-TC-HRM-GUIDE-01` |
| **from_role** | qa |
| **to_role** | qa-synth (PM) |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **evidence_path** | `docs/qa/evidence/po-eco-tc-hrm-guide-01.md` |
| **pack_path** | `docs/qa/testcases/hrm-web/HRM-GUIDE.md` |
| **u65_zero_seed** | true (admin mutate precond «từ FE» only) |
| **hdsd_align** | true (sidebar · CC CTA · platform admin paths) |
| **uat_done** | **false** — catalog only; no browser execution |

## Scope

World-standard **catalog** TC depth cho menu **Hướng dẫn / User Guide** (`/guide`) + **CC embed** `XBOS-HRM-EMBED-GUIDE` + mobile nav entry + **Platform Admin** tab quản lý overlay. Inventory từ `UserGuide.tsx` · `guideSections.ts` · `GuideManagementPage.tsx` · `GuideStepEditor.tsx` · `catalog-extensions.controller.ts` · `HrmWorkspacePanel.tsx`. **Không** chạy browser UAT; **không** seed; **không** claim UAT/Phase1 DONE.

| Trace | Ref |
|-------|-----|
| Journey | **J-HRM-MENU-SWEEP** (static leaf) |
| Roster | **HRM-GUIDE** · **XBOS-HRM-EMBED-GUIDE** · Wave C |
| Program | `PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` §2 · U82/U83 · U65/U76/U78 |
| Matrix | `HRM_MENU_DATA_LINKAGE_MATRIX.md` · `ECOSYSTEM_MENU_ROSTER.md` |
| Prior spot | `p1-hrm-h12-journey-qa-20260606.md` CC guide **PASS GWC** (static) — not re-run |

## Method (read_first)

| # | Source | Use |
|---|--------|-----|
| 1 | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` §2 | DoD depth gate |
| 2 | `docs/qa/testcases/_TEMPLATE_MENU_TC_PACK.md` | Pack structure §1–§7 |
| 3 | `docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md` | HRM-GUIDE rows |
| 4 | `apps/web/hrm/src/pages/UserGuide.tsx` | Read UI · search · accordion |
| 5 | `apps/web/hrm/src/data/guideSections.ts` | 11 sections · 28 steps |
| 6 | `apps/web/hrm/src/components/platform/GuideManagementPage.tsx` | Admin grid · edit |
| 7 | `apps/web/hrm/src/components/guide/GuideStepEditor.tsx` | Dialog mutate |
| 8 | `apps/web/hrm/src/hooks/useGuideContent.ts` | React query · upsert/delete |
| 9 | `apps/api/hrm-api/src/catalog-extensions/catalog-extensions.controller.ts` | GET/POST/DELETE guide-content |
| 10 | `apps/web/web-portal/src/modules/hrm/HrmWorkspacePanel.tsx` | CC CTA case `guide` |
| 11 | `apps/web/hrm/src/App.tsx` L153 | **Public** `/guide` route note |

## Depth gate (DoD)

| Gate | Result |
|------|--------|
| Screen inventory | ☑ 12 `screen_id` + §1.1 section link table (11×28 steps) |
| Field dictionary | ☑ 22 `field_id` |
| Function inventory | ☑ 18 `fn_id` |
| TC matrix HP/FD/BD/AU/UX/STUB/OOS | ☑ **42** TC · coverage check **0 GAP** |
| Trace SRS/matrix/API/HDSD | ☑ §5 pack (+ SPEC_GAP noted) |
| thin_ui STUB flag | ☑ no testids on UserGuide — MANUAL automate |
| CC embed AS-IS (CTA not iframe) | ☑ TC-GUIDE-L-HP-002/003 |
| U65 precond wording | ☑ admin save from FE |
| No apps/** changes | ☑ docs-only |

## Coverage check summary (mirror pack §4)

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions ≥1 HP | 18 | 18 | 0 |
| Mutate fn ≥1 FD | 3 | 3 | 0 |
| Dialog submit/cancel | 1 | AD-HP-001 + AD-UX-001 | 0 |
| CC embed | 1 | L-HP-002/003 | 0 |

## Inventory highlights (synth)

| Area | Count / note |
|------|----------------|
| Static sections | 11 (`getting-started` … `settings`) |
| Accordion steps | 28 total |
| API codes | `HRM-GUIDE-200/201` |
| Public route | `/guide` outside `ProtectedRoute` — TC-GUIDE-L-HP-005 |
| Image upload | `hrmStorageUploadStub` — STUB |
| HTML overlay | `dangerouslySetInnerHTML` — TC-GUIDE-OV-STUB-001 |

## Residual / notes for synth

| Item | Note |
|------|------|
| Dedupe vs spine | No spine TC for guide — synth adds roster link only |
| SPEC_GAP SRS FR | BA may add FR-HRM-GUIDE-* later; pack cites matrix Static |
| Cross-menu HDSD | Section ids map to other HRM-* packs (inventory only) |
| Attendance `viewGuide` | OOS — inline modals not `/guide` |
| Execution | All **PLANNED** until U78 browser test-log wave |

## completion_report

- **Closed:** Full menu TC pack `HRM-GUIDE.md` (inventory + **42** TC); trace roster HRM-GUIDE · CC embed · platform admin overlay; **thin_ui STUB** documented.
- **Open:** No browser execution; synth dedupe + rollup; optional BA SRS delta for help CMS.

## next_owner

`qa-synth` (dedupe + rollup `PO_SPEC_TEST_REPORT.md` ecosystem depth section)

## next_dispatch_prompt

```text
work_item_id: PO-ECO-TC-SYNTH-WAVE-C-01 (or next synth WI on bus)
from_role: pm
to_role: qa-synth
read_first: docs/qa/testcases/hrm-web/HRM-GUIDE.md · docs/qa/evidence/po-eco-tc-hrm-guide-01.md · docs/qa/testcases/README.md · docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md
task: Dedupe TC-GUIDE-* vs catalog; mark HRM-GUIDE / XBOS-HRM-EMBED-GUIDE roster PACK_READY; merge counts into ecosystem depth rollup; no UAT execution.
exit_criteria: Synth note in docs/qa/evidence/po-eco-tc-synth-*.md · ack PASS_TO_PM or READY_FOR_PM
ack_status target: PASS_TO_PM
```

## ack_status

**READY_FOR_SYNTH**
