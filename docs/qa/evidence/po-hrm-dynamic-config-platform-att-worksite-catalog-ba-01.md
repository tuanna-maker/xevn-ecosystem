# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — AC pack **AC-PLT-ATT-WORKSITE-01*** (Nest F-ATT-CAT-WS deepen · admin open ≠ consumer invent) |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01` **CONFIRMED** Option **B** |
| **ref_peer** | ATT-LEAVE-CATALOG-BA-01 pattern · **AC-PLT-ATT-04** retain |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01.md) |
| **Verdict** | **CONFIRMED** — AC-PLT-ATT-WORKSITE-01 / 01b / 01c / 01d / 01H + VAL-ATT-WS-CNS-* |
| **ack_status** | `PASS_TO_PM` |
| **change_mode** | ADD AC/BR · docs-only · **no** `apps/**` · **no** seed |
| **U65** | zero-seed · **cấm** ensureDefaultWorkSite |
| **OS honesty** | `C-SLICE-≠-MODULE` · `attendance_uat_ready=false` · DENY reopen ATT-LEAVE GWC · DENY WAIVE/sign/J-06c · DENY SI/CTR/enrollment reopen · DENY module ATT UAT |

### Honesty locks (mandatory)

| Flag | Value | BA note |
|------|-------|---------|
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **ATT-LEAVE-CATALOG GWC** | **SEAL RETAIN** | **cấm reopen** |
| **Leave WAIVE / sign / J-HRM-06c** | **SEAL RETAIN** | **cấm reopen** |
| **SI type L1 · SI insurer L1** | **SEAL RETAIN** | **cấm reopen** |
| **CTR legal-print · enrollment** | **SEAL RETAIN** | **cấm reopen** |
| **`payroll_e2e_ready` · printable · personnel** | **`false`** | retained |
| **EMP · DEC · PAY · REC · EXT · LIST-TOTALS** | **SEAL RETAIN** | **cấm reopen** |
| **Module ATT UAT / Phase1** | **DENIED** | Slice AC ≠ module GO |
| **Seed / ensureDefaultWorkSite** | **DENIED** (U65 · ADR D3) | |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | Nest deepen ≠ module ATT UAT |
| **Fold into leave / work_shifts catalog** | **FORBIDDEN** | L-ATT-WS-08 |

---

## 1. spec_read_ack

| Artifact | Used |
|----------|------|
| SA Option B LOCK | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01.md` L-ATT-WS-01..10 · §7 |
| SA evidence | `po-hrm-dynamic-config-platform-att-worksite-catalog-sa-01.md` |
| Peer ATT-LEAVE BA | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md` admin≠consumer · work-sites OUT |
| ATT vertical | F-ATT-CAT-WS-01/02 · **AC-PLT-ATT-04** |
| Platform BA | BR-PLT-02/04/05/06 · ATT §2.3 |
| SRS | FR-UC-BP-ATT-03d |
| DB | §4.3 / §4.4c `attendance_work_sites` |
| ADR | D3 geofence SoT · Option B |
| Nest AS-IS | `attendance-config.service.ts` CRUD LIVE · hard DELETE · list no default active filter · `attendance.service.ts` `assertWithinWorkSite` → GEO-001 · empty skip · no `work_site_id` on createRecord |
| FE AS-IS | `useAttendanceRules` Nest bind · `GPSAttendance` sends lat/lon · `CheckInOutWidget` string-only soft-skip |
| Mobile AS-IS | `CheckInScreen` / `checkInLocation` lat/lon when granted · **J-MOB-02** |

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01.md) | Objective · AS-IS/TO-BE · BR-PLT-ATT-WS-* · surface inventory · UC · AC-PLT-ATT-WORKSITE-01* · VAL-ATT-WS-CNS-* · honesty · handoff |

**Không đụng:** `apps/**` · seed · flip `attendance_uat_ready` · reopen ATT-LEAVE · fold into leave · mega-EAV · ba-data EXPAND.

---

## 3. AC pack verdict (CONFIRMED)

| ID | Verdict | Note |
|----|---------|------|
| **AC-PLT-ATT-WORKSITE-01** | **CONFIRMED** | Nest active≥1 · gps_enabled · GPS punch inside radius 2xx · Nest SoT |
| **AC-PLT-ATT-WORKSITE-01b** | **CONFIRMED** | Invent OOS coords → **`HRM-ATT-GEO-001`** |
| **AC-PLT-ATT-WORKSITE-01c** | **CONFIRMED** | Empty active → skip geofence · no seed/ensureDefault |
| **AC-PLT-ATT-WORKSITE-01d** | **CONFIRMED** | Admin CREATE open N+1 · AC-PLT-ATT-04 retain |
| **AC-PLT-ATT-WORKSITE-01H** | **CONFIRMED** | honesty false · seals retain · C-SLICE |
| **AC-PLT-ATT-04** | **RETAIN** | Cross-ref · no conflict |
| **VAL-ATT-WS-CNS-01** | **CONFIRMED** | GEO-001 OOS · BE assert RETAIN |
| **VAL-ATT-WS-CNS-02** | **HOLD GĐ1.5** | No `work_site_id` consumer surface — SITE-UNKNOWN not unlocked |
| **VAL-ATT-WS-CNS-03** | **CONFIRMED** | scope_parity U19 |
| **VAL-ATT-WS-CNS-03b** | **CONFIRMED as BE GAP** | List default active filter |
| **VAL-ATT-WS-CNS-04** | **CONFIRMED as BE GAP** | Soft `active=false` prefer vs hard DELETE |
| **VAL-ATT-WS-CNS-05** | **CONFIRMED** | GPS method missing lat/lon = FAIL closed — silent 201 ≠ PASS |

### Error code lock

| Code | Lock |
|------|------|
| **`HRM-ATT-GEO-001`** | Canonical invent OOS coords |
| **`HRM-ATT-SITE-404`** | Admin get/mutate OOS — **≠** invent synonym |
| **`HRM-ATT-SITE-UNKNOWN`** | Consumer invent site id — **HOLD** until UF binds |
| **`HRM-ATT-SITE-VAL`** | Admin radius/coords VAL retain |

---

## 4. Surface inventory (summary)

| Surf | Class | In pack |
|------|-------|---------|
| Settings/CFG GPS work-sites CRUD | ADMIN | **01d** / ATT-04 |
| Portal `GPSAttendance` | CONSUMER primary | **01** / **01b** / CNS-05 |
| Mobile GPS check-in (J-MOB-02) | CONSUMER | spot **01** / GEO |
| Manual `CheckInOutWidget` | Soft-skip DOC | **not** invent PASS |
| Leave / WAIVE / J-06c / sheet | OUT SEAL | DENY reopen |
| `work_shifts` | OPS LOCK OUT | DENY fold |
| `work_site_id` picker | HOLD GĐ1.5 | no SITE-UNKNOWN BE yet |

---

## 5. AS-IS deepen residuals (unlock BE after this BA)

| Gap | Class | Gate |
|-----|-------|------|
| Hard DELETE vs soft `active=false` | BR-PLT-04 · CNS-04 | **dev-be** |
| List default include inactive | F-ATT-CAT-WS-01 · CNS-03b | **dev-be** |
| Punch without lat/lon silent skip on GPS method | CNS-05 | **dev-fe** verify GPSAttendance retain · BE optional harden |
| Named AC pack browser stamp | 01* | **qa** after BE/FE |
| Optional `site_code` / SITE-UNKNOWN UF | GĐ1.5 | ba-data **HOLD** · BE KEY **HOLD** |
| New Nest table / fold into leave | physical | **FORBIDDEN** |

---

## 6. Gates after this seat

| Gate | Status |
|------|--------|
| ba-process ATT-WORKSITE-CATALOG-BA-01 | **CONFIRMED** (this seat) |
| ba-data | **HOLD** |
| BE deepen | **UNLOCK** (soft-retire · list filter · GEO retain · SITE-UNKNOWN HOLD) |
| FE | Verify lat/lon Nest bind; fix only if gap |
| QA U65 | After BE (and FE if gap) |
| attendance_uat_ready | **false LOCKED** |
| ATT-LEAVE GWC | **SEAL RETAIN** |

---

## 7. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | CONFIRMED AC-PLT-ATT-WORKSITE-01/01b/01c/01d/01H + VAL-ATT-WS-CNS-*: Nest F-ATT-CAT-WS = SoT; admin CREATE open N+1 (01d · ATT-04 retain) ≠ consumer invent; invent OOS coords → HRM-ATT-GEO-001; empty active = skip geofence no seed (01c); soft-retire active=false + list default active = BE GAP; GPS method missing lat/lon = FAIL closed (CNS-05); SITE-UNKNOWN HOLD (no work_site_id UF); Settings/`gps_locations` sole REJECT; OUT fold leave · reopen ATT-LEAVE GWC · flip attendance_uat_ready · seed · mega-EAV · work_shifts catalog; ba-data HOLD; BE UNLOCK deepen; honesty false · C-SLICE-≠-MODULE; seals ATT-LEAVE · SI · CTR · enrollment · WAIVE/sign/J-06c RETAIN; no apps/**. |
| **next_owner** | **pm** → **dev-be** |
| **next_dispatch_prompt** | See §8 |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-ba-01.md` |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 8. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BE-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01 CONFIRMED

## entry_criteria
- Read BA: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01.md
- Read evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-ba-01.md
- Read SA: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01.md Option B
- Honesty false · C-SLICE-≠-MODULE
- RETAIN: ATT-LEAVE GWC · SI type/insurer L1 · CTR · enrollment · WAIVE/sign/J-06c
- ba-data HOLD — NO second table · NO fold into att_leave_type · NO site_code EXPAND unless prove

## task
Deepen Nest F-ATT-CAT-WS only (paths KEEP):
1) Soft-retire: product retire path prefer PATCH active=false (VAL-ATT-WS-CNS-04); hard DELETE residual/guarded — not sole SoT retire
2) List F-ATT-CAT-WS-01: default exclude inactive unless include_inactive=true (VAL-ATT-WS-CNS-03b)
3) Retain assertWithinWorkSite → HRM-ATT-GEO-001; empty active skip (ADR D3); cấm ensureDefaultWorkSite
4) SITE-UNKNOWN / work_site_id assert: HOLD — do not invent without consumer UF
5) Optional CNS-05: fail-closed when gps_enabled + active>0 and GPS path omits lat/lon (coordinate with FE if FE already wires)
6) Jest: soft-retire hide from geofence · list active filter · GEO-001 · scope_parity
7) CODE-MEMORY + spec_read_ack SRS FR-UC-BP-ATT-03d · SA/BA WORKSITE

## cấm
seed · ensureDefault · flip attendance_uat_ready · reopen ATT-LEAVE GWC · fold leave · mega-EAV · work_shifts catalog · apps outside attendance work-sites deepen · Phase1 DONE

## evidence_path
docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-be-01.md

## exit
READY_FOR_QA · completion_report · next_owner qa · next_dispatch_prompt · ack_status
```

---

## 9. Non-claims

- No `apps/**` / seed / migration this seat.
- No `attendance_uat_ready=true` · no module ATT UAT · no Phase1 DONE.
- No reopen ATT-LEAVE-CATALOG GWC · leave WAIVE/sign/J-06c · SI type/insurer L1 · CTR · enrollment.
- No ba-data UNLOCK (Nest LIVE — peer ATT-LEAVE HOLD class).
- Nest work-sites AC pack ≠ module ATT GO (`C-SLICE-≠-MODULE`).
- SITE-UNKNOWN not promoted to mandatory BE without UF.
