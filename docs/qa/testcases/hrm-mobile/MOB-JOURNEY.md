# Menu TC Pack — `MOB-JOURNEY` · Mobile Hành trình làm việc (Home timeline + màn đầy đủ)

| Meta | Value |
|------|--------|
| **menu_id** | `MOB-JOURNEY` |
| **surface** | `hrm-mobile` |
| **route(s)** | Home `JourneyTimelineCard` · ProfileStack `Journey` · `JourneyScreen` · entry tile `home-action-tile-journey` |
| **HDSD** | Mobile ESS Home § Hành trình · `docs/program/MOBILE_PERSONA_UX_MATRIX.md` §4.1 lớp 7 · `MOBILE_APPLE_HIG_ESS_PROGRAM.md` MOB-UX-13g |
| **SRS / FR / UC** | **UC-MOB-PERS-08** (Hành trình / văn hóa) · UC-HRM-MOB hub compose · **AC-PERS-TILE-JRN-01** (design) |
| **TechSpec** | `MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` · `journeyTimeline.ts` · `JourneyScreen.tsx` · `JourneyTimelineCard.tsx` |
| **API_CONTRACT** | **Read-only compose** — không endpoint riêng `/journey`; nguồn: `GET /home/summary` + employee `hired_at` + inbox rows + payslip teaser + attendance today (cùng slice Dashboard) |
| **UF / J-*** | **UC-MOB-PERS-08** · **MOB-UX-13g** · **J-MOB-08** culture strip regression (cross-ref **MOB-HOME**) · L2.5 **Home → Journey → Back** |
| **Catalog neo** | roster `MOB-JOURNEY` · Wave C · prior GWC **GWC-13G-01** (device backlog) |
| **author** | qa · `PO-ECO-TC-MOB-JOURNEY-01` |
| **work_item_id** | `PO-ECO-TC-MOB-JOURNEY-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |
| **Persona lock** | NV **`uat.nv0003@xe.vn`** · MGR **`uat.nv0001@xe.vn`** · LDR slice khi có account leader pilot |
| **Locks** | U65 zero-seed · U76 HDSD · U78 test-log when executed · **cấm** UAT DONE |

> Chuẩn: IEEE 829 / ISO 29119 lean — pack **thiết kế** TC; execution device = wave sau.  
> **Màn read-only:** không mutate · không seed inbox để «có timeline» — precond «data từ FE» sau login + home load (U65).  
> **Culture strip (`HomeCelebrationRow`):** cùng wave **13g** — matrix tại đây; regression **J-MOB-08** vẫn owned **MOB-HOME** §4.3.

---

## 0. Spec read ack (inventory source)

| Source | Path | Sections used |
|--------|------|----------------|
| Full screen | `apps/mobile/hrm-mobile/src/features/journey/JourneyScreen.tsx` | hero · SectionList by year · empty card |
| Home card | `apps/mobile/hrm-mobile/src/components/home/JourneyTimelineCard.tsx` | preview max 3 · header/footer nav |
| Compose logic | `apps/mobile/hrm-mobile/src/utils/journeyTimeline.ts` | kinds · milestones · dedupe · groupByYear |
| Culture strip | `apps/mobile/hrm-mobile/src/components/ui/HomeCelebrationRow.tsx` | chips birthday+tenure |
| Dashboard wiring | `apps/mobile/hrm-mobile/src/features/dashboard/DashboardScreen.tsx` | `buildJourneyFeedParams` · `goJourney` · section `journey_timeline` |
| Nav | `apps/mobile/hrm-mobile/src/navigation/profileStackNav.ts` · `RootNavigator.tsx` | `navigateToJourney` · title `vi.journey` |
| Params type | `apps/mobile/hrm-mobile/src/navigation/types.ts` | `JourneyFeedParams` |
| Grid tile | `apps/mobile/hrm-mobile/src/utils/homePortal.ts` | tile `journey` · not stub |
| Persona order | `apps/mobile/hrm-mobile/src/utils/dashboardPersonaLayout.ts` | `culture_strip` · `journey_timeline` tail |
| Vitest SoT | `apps/mobile/hrm-mobile/src/utils/__tests__/journeyTimeline.test.ts` | MOB-UX-13g |
| Persona AC | `docs/program/MOBILE_PERSONA_UX_MATRIX.md` | §4.1 · UC-MOB-PERS-08 |
| Program | `docs/program/MOBILE_APPLE_HIG_ESS_PROGRAM.md` | MOB-UX-13g |
| Roster | `docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md` | MOB-JOURNEY |
| Cross-pack | `docs/qa/testcases/hrm-mobile/MOB-HOME.md` | SCR-HOME-JOURNEY entry · J-MOB-08 REG |
| Cross-pack | `docs/qa/testcases/hrm-mobile/MOB-PROFILE.md` | Journey screen OOS wave C → **this pack** |

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| SCR-JRN-HOME-CARD | inline card | Home section `journey_timeline` | Preview timeline (≤3 rows) | hidden when 0 events · content |
| SCR-JRN-HOME-HDR | chrome | `HomeSectionHeader` on card | «Hành trình» + «Xem tất cả» | action press |
| SCR-JRN-HOME-ROW | inline | `JourneyTimelineRow` | title · subtitle · date cột phải | 1..3 rows |
| SCR-JRN-HOME-FT | inline | footer `Pressable` | «Xem toàn bộ hành trình» | chevron · a11y button |
| SCR-CULT-STRIP | inline | Home section `culture_strip` | Avatar ngang sinh nhật + thâm niên | hidden empty · scroll |
| SCR-JRN-FULL | page | ProfileStack `Journey` | Timeline đầy đủ theo năm | empty · grouped list |
| SCR-JRN-HERO | inline | top `JourneyScreen` | «Hành trình làm việc» + subtitle tên NV | displayName fallback «bạn» |
| SCR-JRN-YEAR-HDR | inline | `SectionList` sticky header | Nhãn năm (vd. `2026`) | sticky scroll |
| SCR-JRN-EVENT-ROW | inline | `JourneyEventRow` | Icon kind · title · subtitle · date | divider giữa rows |
| SCR-JRN-EMPTY | inline | empty card on full screen | «Chưa có dữ liệu hành trình» + hint VI | feed missing or 0 events |
| SCR-JRN-NAV-BACK | chrome | stack header | «Hành trình» large title · back | iOS/Android back |
| ENTRY-GRID-JRN | tile | `QuickAccessGrid` id `journey` | Icon «Hành trình» | same nav as card |

**Stack cross-ref (entry only):** `TabDashboard` load → **MOB-HOME** precond J-MOB-01.

**Đếm in-scope surfaces:** home card block=4 · culture strip=1 · full page block=5 · nav/tile entry=2 → **12** ids

---

## 2. Field dictionary (display + controls)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API / source | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|--------------|--------|-------|
| F-CARD-TESTID | (automation) | SCR-JRN-HOME-CARD | container | N | | — | | `home-journey-timeline-card` |
| F-SEC-TITLE | Hành trình | SCR-JRN-HOME-HDR | text | Y | MOB-UX-13g | constant | VI | section header |
| F-SEC-ACTION | Xem tất cả | SCR-JRN-HOME-HDR | text button | N | ≥44 tap | nav Journey | | `onActionPress` |
| F-ROW-TITLE | Tiêu đề sự kiện | SCR-JRN-HOME-ROW | text | Y | not raw event_type | compose | plain VI | numberOfLines=2 |
| F-ROW-SUB | Mô tả phụ | SCR-JRN-HOME-ROW | text | Y | | compose | VI | |
| F-ROW-DATE | Ngày sự kiện | SCR-JRN-HOME-ROW | text | Y | **vi-VN date** | `formatJourneyEventDate` | dd/MM/yyyy | |
| F-FT-LABEL | Xem toàn bộ hành trình | SCR-JRN-HOME-FT | button | N | a11y label | nav Journey | | minH 44 |
| F-CULT-TESTID | (automation) | SCR-CULT-STRIP | container | N | | | | `home-celebration-row` |
| F-CULT-NAME | Tên đồng nghiệp | SCR-CULT-STRIP | text | Y | no UUID | celebrations/tenure | VI | under avatar |
| F-CULT-CHIP | Sinh nhật / N năm | SCR-CULT-STRIP | text | Y | `chipLabel` VI | `mergeCelebrationChips` | | tenure ★ badge |
| F-CULT-MORE | Xem thêm | SCR-CULT-STRIP | chip | N | hasMore | | | optional |
| F-HERO-TITLE | Hành trình làm việc | SCR-JRN-HERO | text | Y | | constant | VI | largeTitle stack |
| F-HERO-SUB | Cột mốc thâm niên… | SCR-JRN-HERO | text | Y | inject `{displayName}` | feed.displayName | VI | fallback «bạn» |
| F-YEAR-LABEL | Năm (section) | SCR-JRN-YEAR-HDR | text | Y | desc sort | `groupJourneyEventsByYear` | yyyy | sticky |
| F-EV-TITLE | Tiêu đề full row | SCR-JRN-EVENT-ROW | text | Y | kind-specific copy | see §2.1 | VI | |
| F-EV-SUB | Phụ đề full row | SCR-JRN-EVENT-ROW | text | Y | | inbox datetime sub | VI | |
| F-EV-DATE | Ngày full row | SCR-JRN-EVENT-ROW | text | Y | | dateIso | dd/MM/yyyy | |
| F-EV-ICON | Icon loại sự kiện | SCR-JRN-EVENT-ROW | icon | N | map kind→Ionicons | KIND_ICON | | decorative hidden a11y |
| F-EMPTY-TITLE | Chưa có dữ liệu hành trình | SCR-JRN-EMPTY | text | Y | honest empty | — | VI | |
| F-EMPTY-HINT | Hint khi có data sau | SCR-JRN-EMPTY | text | Y | | — | VI | |
| F-GRID-LABEL | Hành trình | ENTRY-GRID-JRN | tile label | Y | not stub | `homePortal` | VI | `home-action-tile-journey` |
| F-FEED-NAME | displayName param | (nav) | param | Y | trim | snap.greetingName | plain | JourneyFeedParams |
| F-FEED-HIRE | hiredAt param | (nav) | param | N | parse date | employee profile | ISO→display | milestones |
| F-FEED-CHK-SUM | checkInSummary | (nav) | param | N | BR-ATT-JRN-01 | attendance today | VI time | |
| F-FEED-CHK-STAT | checkInStatus | (nav) | param | N | `neutral` → no row | status enum | | |
| F-FEED-PAY | payslipTeaser | (nav) | param | N | | payslip list pick | period VI | |
| F-FEED-INBOX | inboxRows | (nav) | param | N | max 8 map | inbox hub | | workflow/payslip kinds |
| F-FEED-CELEB | celebrations | (nav) | param | N | max 3 | home summary | | birthday events |
| F-FEED-TENURE | tenureToday | (nav) | param | N | max 3 | employees filter | | colleague tenure |

### 2.1 Event kind labels (read-only — BR-JRN-KIND)

| kind | Title pattern (VI) | Icon |
|------|-------------------|------|
| `tenure_join` | Gia nhập công ty | flag-outline |
| `tenure_milestone` | `{n} năm gắn bó` / colleague tenure | ribbon-outline |
| `birthday` | Sinh nhật {name} | gift-outline |
| `attendance` | Chấm công hôm nay | time-outline |
| `payslip` | Phiếu lương {period} | wallet-outline |
| `workflow` | resolveInboxEventTypeVi | document-text-outline |

**Đếm fields:** **28** (+ kind table)

---

## 3. Function inventory

| fn_id | UI (nút/menu) | screen_id | precond | API / nav | success FE + reopen | fail / edge | HDSD |
|-------|---------------|-----------|---------|-----------|---------------------|-------------|------|
| FN-JRN-SHOW-HOME | Hiện section Home | SCR-JRN-HOME-CARD | ≥1 composed event | compose only | card visible · testID | hidden when [] | UC-MOB-PERS-08 |
| FN-JRN-HIDE-HOME | Ẩn section Home | SCR-JRN-HOME-CARD | 0 events | | section absent · no «sắp có» stub | stub text = FAIL | GWC-13G-01 |
| FN-JRN-PREVIEW-CAP | Giới hạn 3 dòng | SCR-JRN-HOME-ROW | >3 events | `limitJourneyPreview(3)` | exactly 3 on home | >3 on home = FAIL | |
| FN-JRN-NAV-HEADER | Xem tất cả (header) | SCR-JRN-HOME-HDR | card visible | `navigateToJourney(feed)` | Journey full hero | no feed → empty | |
| FN-JRN-NAV-FOOTER | Xem toàn bộ (footer) | SCR-JRN-HOME-FT | card visible | same | same | | |
| FN-JRN-NAV-GRID | Tile Hành trình | ENTRY-GRID-JRN | tile in persona grid | `goJourney()` | Journey screen | reports-style stub = FAIL | Home grid |
| FN-JRN-NAV-BACK | Quay lại | SCR-JRN-NAV-BACK | on Journey | pop stack | Home prior scroll | crash = FAIL | L2.5 back |
| FN-JRN-COMPOSE | Build events | (logic) | feed params | client compose | sorted desc · dedupe id | duplicate ids | vitest |
| FN-JRN-TENURE-SELF | Cột mốc bản thân | SCR-JRN-EVENT-ROW | hiredAt valid | `buildSelfTenureMilestones` | join + 1/3/5/10/15/20y past | future milestone hidden | BR-TENURE-01 |
| FN-JRN-ATT-TODAY | Row chấm công | SCR-JRN-*-ROW | status ≠ neutral | checkIn slice | title «Chấm công hôm nay» | neutral → no row | |
| FN-JRN-PAY-TEASER | Row phiếu lương | SCR-JRN-*-ROW | payslipTeaser | teaser id | kind payslip | no teaser → no row | cross MOB-PAYSLIP |
| FN-JRN-INBOX-MAP | Inbox → timeline | SCR-JRN-*-ROW | inbox rows | max 8 | VI title not raw key | missing created_at skip | |
| FN-JRN-YEAR-GROUP | Nhóm theo năm | SCR-JRN-YEAR-HDR | full screen | `groupJourneyEventsByYear` | years desc | single year OK | |
| FN-JRN-EMPTY-FULL | Empty full screen | SCR-JRN-EMPTY | no feed or 0 events | | empty card copy | fake rows = FAIL | |
| FN-JRN-READONLY | Row tap | SCR-JRN-EVENT-ROW | | **no navigation** | no nav change | opens detail = spec_gap | read-only stub |
| FN-CULT-SHOW | Culture strip | SCR-CULT-STRIP | chips>0 | summary | `home-celebration-row` | English chipLabel FAIL | J-MOB-08 adj |
| FN-CULT-MERGE | Birthday+tenure chips | SCR-CULT-STRIP | API data | `mergeCelebrationChips` | max 10 · VI labels | raw keys FAIL | |

**Đếm functions:** **17**

---

## 4. Test case matrix

### Quy ước

- **TC-ID:** `TC-MOB-JRN-<area>-<nnn>` · Type: `HP` · `FD` · `BD` · `AU` · `UX` · `NAV` · `REG` · `UNIT`
- **Layer:** DEVICE · VITEST · MANUAL (design)
- **Status:** `PLANNED` (design pack — chưa device run wave này)
- **Precond U65:** login FE → Home load → **không** seed script

### 4.1 UC-MOB-PERS-08 · Home preview card

| TC-ID | Type | Covers | Persona | Precond | Steps (HDSD) | Expected | Automate | Status |
|-------|------|--------|---------|---------|--------------|----------|----------|--------|
| TC-MOB-JRN-HOME-HP-001 | HP | FN-JRN-SHOW-HOME | uat.nv0003 | NV có `hired_at` hoặc activity compose | Login → Trang chủ → scroll tới **Hành trình** | `home-journey-timeline-card` visible · ≥1 row · title/subtitle VI · date dd/MM/yyyy | DEVICE | PLANNED |
| TC-MOB-JRN-HOME-HP-002 | HP | FN-JRN-PREVIEW-CAP | uat.nv0003 | compose >3 events | Count rows on card | **≤3** rows · footer link present | DEVICE | PLANNED |
| TC-MOB-JRN-HOME-HP-003 | HP | FN-JRN-NAV-HEADER | uat.nv0003 | card visible | Tap **Xem tất cả** | Journey full · hero «Hành trình làm việc» · subtitle có tên NV | DEVICE | PLANNED |
| TC-MOB-JRN-HOME-HP-004 | HP | FN-JRN-NAV-FOOTER | uat.nv0003 | card visible | Tap **Xem toàn bộ hành trình** | Same as header nav | DEVICE | PLANNED |
| TC-MOB-JRN-HOME-FD-001 | FD | FN-JRN-HIDE-HOME | uat.nv0003 | pilot: no hire + no activity (honest) | Open Home scroll | **No** journey card · **no** «Hành trình — sắp có» stub | DEVICE | PLANNED |
| TC-MOB-JRN-HOME-UX-001 | UX | F-ROW-DATE | uat.nv0003 | | Inspect dates on card | dd/MM/yyyy · not epoch 01/01/1970 | DEVICE | PLANNED |
| TC-MOB-JRN-HOME-REG-001 | REG | FN-JRN-NAV-GRID | uat.nv0003 | | Tap grid **Hành trình** | Journey screen · same feed as card | DEVICE | PLANNED |

### 4.2 Full screen · Journey stack

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-JRN-FULL-HP-001 | HP | FN-JRN-YEAR-GROUP | uat.nv0003 | events span 2+ years (hire old) | Open Journey from Home | Sticky year headers · years **descending** · rows grouped in cards | DEVICE | PLANNED |
| TC-MOB-JRN-FULL-HP-002 | HP | FN-JRN-TENURE-SELF | uat.nv0003 | hiredAt ≥1y ago | Find tenure rows | «Gia nhập công ty» + milestone «n năm gắn bó» VI | DEVICE | PLANNED |
| TC-MOB-JRN-FULL-HP-003 | HP | FN-JRN-ATT-TODAY | uat.nv0003 | checked in today | Row chấm công | Title «Chấm công hôm nay» · subtitle matches home summary | DEVICE | PLANNED |
| TC-MOB-JRN-FULL-HP-004 | HP | FN-JRN-PAY-TEASER | uat.nv0003 | payslip teaser on home | Journey list | Row «Phiếu lương …» · kind icon wallet | DEVICE | PLANNED |
| TC-MOB-JRN-FULL-HP-005 | HP | FN-JRN-INBOX-MAP | uat.nv0003 | ≥1 inbox notification FE-created | Journey list | Workflow row · title VI (`resolveInboxEventTypeVi`) · not raw `payslip.published` | DEVICE | PLANNED |
| TC-MOB-JRN-FULL-FD-001 | FD | FN-JRN-EMPTY-FULL | uat.nv0003 | deep link Journey without feed (QA harness) | Open Journey empty params | Empty card title+hint VI · no crash | DEVICE | PLANNED |
| TC-MOB-JRN-FULL-AU-001 | AU | FN-JRN-READONLY | uat.nv0003 | on Journey | Tap random event row | **No** navigation to Leave/Payslip/Inbox detail | DEVICE | PLANNED |
| TC-MOB-JRN-FULL-NAV-001 | NAV | FN-JRN-NAV-BACK | uat.nv0003 | from Home | Journey → system back | Returns Home · card state preserved | DEVICE | PLANNED |
| TC-MOB-JRN-FULL-UX-001 | UX | F-HERO-SUB | uat.nv0003 | | Read hero | Contains employee display name · not UUID | DEVICE | PLANNED |

### 4.3 Culture strip (MOB-UX-13g companion)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-JRN-CULT-HP-001 | HP | FN-CULT-SHOW | uat.nv0003 | birthdays in summary | Scroll **culture_strip** above/below journey | `home-celebration-row` · avatars horizontal · «Sinh nhật» chip | DEVICE | PLANNED |
| TC-MOB-JRN-CULT-HP-002 | HP | FN-CULT-MERGE | uat.nv0001 | tenure colleagues today | Observe chips | Tenure chip «n năm» · ★ badge · a11y «Thâm niên …» | DEVICE | PLANNED |
| TC-MOB-JRN-CULT-FD-001 | FD | FN-CULT-SHOW | uat.nv0003 | no celebrations | Home scroll | Strip **absent** · no placeholder English | DEVICE | PLANNED |
| TC-MOB-JRN-CULT-REG-001 | REG | J-MOB-08 | uat.nv0003 | same as MOB-HOME HUB-REG-008 | Sinh nhật strip | **Cross-ref** MOB-HOME — no birth year leak · no regress when journey ship | DEVICE | PLANNED |

### 4.4 Persona layout · MOBILE_PERSONA_UX_MATRIX §4.1

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-JRN-PERS-HP-001 | HP | section order EMP | uat.nv0003 | | Scroll below fold | `culture_strip` before `journey_timeline` per layout tail | DEVICE | PLANNED |
| TC-MOB-JRN-PERS-HP-002 | HP | MGR journey content | uat.nv0001 | mgr home load | Journey full | Self tenure + inbox/workflow rows allowed · VI only | DEVICE | PLANNED |
| TC-MOB-JRN-PERS-AU-001 | AU | grid tile | uat.nv0003 | employee grid | Inventory tiles | **Hành trình** present · not manager-only | DEVICE | PLANNED |

### 4.5 Vitest · journeyTimeline (no device)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-JRN-UNIT-001 | HP | tenure years floor | — | | `vitest journeyTimeline.test.ts` | resolveTenureYears cases PASS | VITEST | PLANNED |
| TC-MOB-JRN-UNIT-002 | HP | compose feed | — | | same | attendance+payslip+join kinds | VITEST | PLANNED |
| TC-MOB-JRN-UNIT-003 | HP | groupByYear desc | — | | same | 2026 before 2024 | VITEST | PLANNED |
| TC-MOB-JRN-UNIT-004 | HP | preview cap 3 | — | | same | limitJourneyPreview length 3 | VITEST | PLANNED |
| TC-MOB-JRN-UNIT-005 | HP | hide section empty | — | | same | shouldShowJourneySection false on [] | VITEST | PLANNED |
| TC-MOB-JRN-UNIT-006 | HP | tile not stub | — | | `homePortal.test.ts` | resolveQuickAccessTile('journey').stub undefined | VITEST | PLANNED |

### 4.6 Fail-deep · display & compose edge

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-JRN-FD-KEY-001 | FD | inbox title VI | uat.nv0003 | inbox row | Journey row title | No raw `event_type` string on UI | DEVICE | PLANNED |
| TC-MOB-JRN-FD-ATT-001 | FD | BR-ATT-JRN-01 | uat.nv0003 | checkInStatus=neutral | Compose | No «Chấm công hôm nay» row | VITEST+DEVICE | PLANNED |
| TC-MOB-JRN-FD-HIRE-001 | FD | missing hire | account no hired_at | Home/Journey | | Tenure join may absent · empty/full honest · no crash | DEVICE | PLANNED |
| TC-MOB-JRN-FD-DEDUPE-001 | FD | FN-JRN-COMPOSE | — | duplicate ids input | vitest/manual | dedupeAndSortJourneyEvents unique ids | VITEST | PLANNED |

### Coverage check

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions ≥1 HP | 17 | 17 | 0 |
| Nav paths (header/footer/grid/back) | 4 | HOME-HP-003/004 · REG-001 · FULL-NAV-001 | 0 |
| Read-only AU | 1 | FULL-AU-001 | 0 |
| UC-MOB-PERS-08 | 1 | HOME-HP-001 + CULT-* | 0 |
| Culture strip 13g | 2 | CULT-HP-001/002 | 0 |
| Vitest MOB-UX-13g | 6 | UNIT-001..006 | 0 |
| Empty/honest states | 3 | HOME-FD-001 · FULL-FD-001 · CULT-FD-001 | 0 |
| Event kinds spot (6) | 6 | FULL-HP-002..005 + UNIT-002 | 0 |

**TC count:** **38** PLANNED (design)

---

## 5. Traceability

| TC-ID | SRS / UC | TechSpec / doc | API compose slice | Catalog / J-* | HDSD |
|-------|----------|----------------|-------------------|---------------|------|
| TC-MOB-JRN-HOME-HP-001 | UC-MOB-PERS-08 | MOB-UX-13g | home summary + employee | **UC-MOB-PERS-08** | Trang chủ → Hành trình |
| TC-MOB-JRN-HOME-REG-001 | portal tile | homePortal | — | grid **Hành trình** | Icon grid |
| TC-MOB-JRN-FULL-NAV-001 | L2.5 cross-nav | JourneyScreen | feed params | **Home→Journey→Back** | Xem tất cả |
| TC-MOB-JRN-CULT-REG-001 | celebrations | MOB-UX-13g | celebrations API | **J-MOB-08** xref MOB-HOME | Sinh nhật strip |
| TC-MOB-JRN-FULL-HP-005 | inbox display | dashboardEss | inbox hub rows | notify bell path xref | Workflow label VI |
| TC-MOB-JRN-UNIT-006 | tile map | homePortal.test | — | not stub vs reports | |

---

## 6. Out of scope / cross-pack

| Item | Owner pack | TC in MOB-JOURNEY |
|------|------------|-------------------|
| Home load · portal shell · FAB | **MOB-HOME** | precond J-MOB-01 only |
| Payslip detail mutate / list E2E | **MOB-PAYSLIP** / payslip tab | FULL-HP-004 teaser row only |
| Inbox mark-read · deep link approve | **MOB-PROFILE** Notifications | inbox **display** on timeline only |
| Check-in POST / GPS | **MOB-ATTENDANCE** | attendance **summary row** only |
| Leave wizard / approve | **MOB-LEAVE-APPR** | workflow labels only |
| Performance widget «Đánh giá kỳ» | Phase 2 / future 13g | **SPEC_GAP** — not in code inventory |
| Row tap → detail navigation | Future UC | FULL-AU-001 expect **no** nav today |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-mob-journey-01.md
next_owner: qa-synth (dedupe vs MOB-HOME SCR-HOME-JOURNEY · roster MOB-JOURNEY PLANNED→SYNTHED)
counts: screens=12 fields=28 functions=17 tcs=38 (all PLANNED design)
catalog_map: UC-MOB-PERS-08 · MOB-UX-13g · GWC-13G-01 device backlog · L2.5 Home→Journey→Back
cross_ref: MOB-HOME (preview entry + J-MOB-08) · MOB-PROFILE (Journey depth moved here)
```

*PO-ECO-TC-MOB-JOURNEY-01 · WORLD-STANDARD depth pack · no UAT execution claim*
