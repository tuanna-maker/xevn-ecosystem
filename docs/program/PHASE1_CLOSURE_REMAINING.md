# Phase 1 — Việc còn lại để ĐÓNG (machine list)

**Updated:** 2026-06-09T12:00 · **PM rule:** Sponsor lock — **không hỏi** chọn wave; PM dispatch `P1-PHASE1-CLOSE-WAVE-01` đến G3/G4/G6/G8 đóng → W6 pack → QC GO.

## Exit criteria Phase 1 (tất cả phải TRUE)

| # | Gate | Owner | Status |
|---|------|-------|--------|
| G1 | `verify:product:completion` exit 0 **+** L0 stack up | DevOps/QA | **PASS** L0+fe-be-health 13/13 (2026-06-09) |
| G2 | L1 `test:system:uat` exit 0 | QA | **PASS** 37/0 |
| G3 | L2 P-CC 13/13 + L2.5 J-HRM/J-MOB | QA | **GWC** nip.io L2 23/23 J-HRM 7/7 + J-MOB batch GWC |
| G4 | Mobile partner slice QC GO | QC | **IN FLIGHT** → `MOB-PARTNER-QC-01` |
| G5 | `test:hrm-mobile` + `test:mobile:user-copy` exit 0 | Dev/QA | **PASS** 429/429 |
| G6 | Ecosystem parity mobile↔web↔API | QC | **GWC PASS** R2 — 29/32 `qc-p1-g6-r2-20260609.md` |
| G7 | Sponsor `PCOMP-W6-SP-01` sign-off | Sponsor | **PACK READY** `pcomp-w6-uat-session-pack-20260609.md` |
| **G8** | **ILA layout ≥16/20** + `verify:mobile:layout` | QC | **GWC** 9/10≥16 avg ~16.3; MOB-UX-17 QC GWC |

## Execution queue — dispatch NOW

| work_item_id | Owner | Blocker class |
|--------------|-------|---------------|
| P1-L0-STACK | devops | L0 down |
| MOB-UX-15-QC | qc | Sanitization gate |
| MOB-UX-14-R5 | dev-mobile | Home iPhone SE/ProMax |
| MOB-UX-15d | dev-mobile | check_in_out raw copy |
| MOB-PARITY-01 | qa | Ecosystem label/API |
| MOB-ECOSYSTEM-UAT | qa | L1+L2+L2.5 full regression @ nip.io |
| MOB-UX-13-EFG-QA | qa-device | Persona/swipe/journey |
| MOB-UX-14-UNIFIED-QA-R6 | qa-device | Home responsive matrix R6 APK |
| **MOB-UX-16a** | dev-mobile | Home ILA-01/03/06 → ≥16/20 |
| **MOB-UX-16b** | dev-mobile | Leave+Approvals ILA-02 spacing |
| **MOB-UX-16c** | dev-mobile | `verify:mobile:layout` gate |
| **MOB-UX-16-QA** | qa-device | ILA scorecard 10 màn + screenshots |
| **MOB-UX-16-QC** | qc | Layout GO trước MOB-PARTNER-QC-01 |
| PCOMP-W7-MOB-LEAVE-DOC | dev-mobile | **QA PASS** R3 EA9BD74F — QC in flight |
| PCOMP-W7-MOB-LEAVE-BAL | dev-be+mobile | BE scope fix DONE — device J-MOB-25 PASS |
| **R-W7-MOB-LEAVE-NAV-01-R4** | dev-mobile | **P0** manager approve tile blank nv0002 |
| PCOMP-W7-MOB-PROFILE-FULL | dev-mobile | W7 open |
| MOB-PARTNER-QC-01 | qc | Final mobile partner GO |
| PCOMP-W6-SP-01 | sponsor | Human sign-off |

## Đánh giá PM (căn cứ — không cảm tính)

| Dimension | Artifact | Method |
|-----------|----------|--------|
| Nghiệp vụ | `HRM_MENU_DATA_LINKAGE_MATRIX`, SRS, `MOBILE_PERSONA_UX_MATRIX` | UC→API→test trace |
| UI/UX benchmark | `MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION`, `MOBILE_HRM_ESS_UX_BENCHMARK`, Apple HIG § | Device screenshot vs AC |
| **UI layout composition** | **`MOBILE_UI_LAYOUT_COMPOSITION_AUDIT.md` (ILA rubric 10 tiêu chí)** | Điểm /20 per screen; sponsor screenshot → ILA-xx |
| Chức năng chạy | `PROGRAM_JOURNEY_MAP` J-* | qa-device adb + nip.io |
| Hệ sinh thái | `test:system:uat`, scope 409 probes, XBOS catalog sync | L1 API + L2 embed |
| Sponsor intent | Screenshots + chat | FAIL = new work_item same day |

**UI/UX vs mong muốn sponsor:** **CHƯA ĐẠT** — ILA trung bình **~14.5/20** (ngưỡng partner **16**). Notifications **18** ✅; Home **12**, Leave **14**, Approvals **13** — gap có mã ILA + work_item MOB-UX-16. Benchmark docs có; **bố cục cấu phần** chưa đạt căn cứ đo được.

**Chức năng chạy hết:** **CHƯA** — core ESS ~80% device PASS; W7 leave-doc/bal/profile-full `[ ]`; performance/recruitment mobile backlog.

**Thông hệ sinh thái:** **Một phần** — API L1 PASS; mobile↔web label parity OPEN; PROD 🔴.
