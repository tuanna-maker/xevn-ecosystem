# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01` |
| **from_role** | `sa` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — Option/F.1 narrow **AC-PLT-ATT-WORKSITE-01** (Nest `attendance_work_sites` deepen · admin open ≠ consumer invent) |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-QC-01` **GWC** · U88 · prior residual work-sites **OUT** from ATT-LEAVE-CATALOG |
| **ref_peer_att_leave** | ATT leave Nest Option B · work-sites OUT (`L-ATT-LEAVE-08`) |
| **ref_peer_si_insurer** | SI insurers Nest Option B — pattern cite only |
| **ref_vertical** | ATT-VERTICAL F-ATT-CAT-WS-01/02 · ATT-DATA §3 LIVE EXPAND note |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01.md) |
| **Verdict** | **CONFIRMED** — Option **B** LOCKED |
| **ack_status** | `PASS_TO_PM` |
| **change_mode** | ADD Option/F.1 · docs-only · **no** `apps/**` · **no** seed |
| **U65** | zero-seed · no UF invent · **cấm** ensureDefaultWorkSite |
| **OS honesty** | `C-SLICE-≠-MODULE` · `attendance_uat_ready=false` · DENY reopen ATT-LEAVE GWC · DENY leave WAIVE/sign/J-06c · DENY reopen SI type/insurer L1 · CTR · enrollment · EMP·DEC·PAY·REC · DENY module ATT UAT |

### Honesty locks (mandatory)

| Flag | Value | SA note |
|------|-------|---------|
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **ATT-LEAVE-CATALOG GWC** | **SEAL RETAIN** | **cấm reopen** |
| **Leave WAIVE / sign / J-HRM-06c** | **SEAL RETAIN** | **cấm reopen** |
| **SI type L1 · SI insurer L1** | **SEAL RETAIN** | **cấm reopen** |
| **CTR legal-print · enrollment** | **SEAL RETAIN** | **cấm reopen** |
| **`payroll_e2e_ready` · printable · personnel** | **`false`** | retained |
| **EMP · DEC · PAY · REC · EXT · LIST-TOTALS** | **SEAL RETAIN** | **cấm reopen** |
| **Module ATT UAT / Phase1** | **DENIED** | Slice Option ≠ module GO |
| **Seed / ensureDefaultWorkSite** | **DENIED** (U65 · ADR D3) | |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | Nest deepen ≠ module ATT UAT |

---

## 1. spec_read_ack

| Artifact | Used |
|----------|------|
| ATT leave catalog SA (OUT work-sites) | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md` §4.2 · `L-ATT-LEAVE-08` |
| ATT vertical F.1 | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md` **F-ATT-CAT-WS-01/02** · **AC-PLT-ATT-04** · `L-ATT-CAT-04` |
| ATT DATA | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md` §3 EXPAND LIVE · no column gap GĐ1 |
| SI insurer QC (U88 parent) | `po-hrm-dynamic-config-platform-si-insurer-catalog-qc-01.md` GWC · honesty false |
| SI insurer SA (pattern) | Option B Nest DEFINE — **≠** ATT physical |
| Platform BA | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md` BR-PLT-02/04/05/06 · ATT §2.3 |
| SRS | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-03d** |
| DB | `DB_DESIGN_HRM_ENTERPRISE.md` §4.3 / §4.4c |
| ADR | `ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md` Option B · `ADR-HRM-ATTENDANCE-CFG-PERSIST` **D3** |
| Nest AS-IS | `attendance-config.service.ts` work-sites CRUD LIVE · hard DELETE · list no default active filter · `attendance.service.ts` `assertWithinWorkSite` → `HRM-ATT-GEO-001` · empty sites skip |
| FE AS-IS | `useAttendanceRules` Nest work-sites bind · `GPSAttendance` risk: string-only location skips assert |
| Parent U88 | SI-INSURER-QC-01 GWC → this ATT work-sites catalog SA |

**Prior note:** ATT-VERTICAL/DATA already confirmed Nest LIVE + F.1 EXPAND. ATT-LEAVE stamped work-sites **OUT**. This seat owns **AC-PLT-ATT-WORKSITE-01 Option B deepen** — does **not** reopen leave GWC / invent second table / flip UAT.

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01.md) | Option A/B/C · trade-off · **B LOCKED** · L-ATT-WS-01..10 · F.1 deepen · AC/VAL matrix · ba-data HOLD · ba-process UNLOCK · BE HOLD |

**Không đụng:** `apps/**` · seed · flip `attendance_uat_ready` · reopen ATT-LEAVE · fold into leave-types · mega-EAV · reopen SI/CTR/enrollment seals.

---

## 3. Option summary

| Option | Verdict |
|--------|---------|
| **A** Settings MD / `gps_locations` JSON = sole geofence SoT | **REJECT** — ADR D3 / Nest orphan class |
| **B** Nest `attendance_work_sites` via F-ATT-CAT-WS = SoT; admin CREATE open N+1; consumer geofence/KEY when ≠ empty; invent → `HRM-ATT-GEO-001` / `HRM-ATT-SITE-UNKNOWN` | **LOCKED / CONFIRMED** |
| **C** Invent attendance_uat / reopen ATT-LEAVE / fold into leave / mega table / seed | **REJECT** |

**Weighted score:** A 62 · **B 111** · C 24.

---

## 4. Architecture locks (machine-readable)

| Lock | Rule |
|------|------|
| L-ATT-WS-01 | Admin open N+1 ≠ consumer invent |
| L-ATT-WS-02 | Nest F-ATT-CAT-WS = SoT · FORBIDDEN Settings/`gps_locations` sole |
| L-ATT-WS-03 | GĐ1 identity = UUID id (+ geofence) · site_code GĐ1.5 HOLD |
| L-ATT-WS-04 | Empty active → skip geofence · no ensureDefault/seed |
| L-ATT-WS-05 | Soft `active=false` prefer · hard DELETE residual |
| L-ATT-WS-06 | scope_parity U19 |
| L-ATT-WS-07 | Invent → GEO-001 / SITE-UNKNOWN |
| L-ATT-WS-08 | FORBIDDEN fold leave · reopen ATT-LEAVE · fold work_shifts |
| L-ATT-WS-09 | Seals retain (leave · SI · CTR · enrollment · peers) |
| L-ATT-WS-10 | honesty false · C-SLICE-≠-MODULE |

---

## 5. AS-IS → deepen residual (for BA/BE — not this seat code)

| Gap | Class | Gate |
|-----|-------|------|
| Hard DELETE vs soft `active=false` | BR-PLT-04 | BE HOLD until BA |
| List default include inactive | F-ATT-CAT-WS-01 | BE HOLD until BA |
| Punch without lat/lon silent skip | VAL-ATT-WS-CNS-05 | BA enumerate · FE if needed |
| Named AC-PLT-ATT-WORKSITE-01* pack | consumer invent | **ba-process UNLOCK** |
| Optional `site_code` | GĐ1.5 | ba-data HOLD unless BA proves |
| New Nest table / fold into leave | physical | **FORBIDDEN** |

---

## 6. Gates after this seat

| Gate | Status |
|------|--------|
| ba-process ATT-WORKSITE-CATALOG-BA-01 | **UNLOCK** |
| ba-data | **HOLD** |
| BE deepen | **HOLD** until BA CONFIRMED |
| FE | After BA only if gap |
| attendance_uat_ready | **false LOCKED** |
| ATT-LEAVE GWC | **SEAL RETAIN** |

---

## 7. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | CONFIRMED Option **B** LOCK for AC-PLT-ATT-WORKSITE-01: Nest `attendance_work_sites` LIVE = SoT (F-ATT-CAT-WS deepen); admin open N+1 ≠ consumer invent; invent GEO-001 / SITE-UNKNOWN; reject Settings/`gps_locations` sole SoT + fold into leave + reopen ATT-LEAVE GWC + invent UAT + seed + mega-EAV; ba-data HOLD; unlock ba-process; BE HOLD; honesty `attendance_uat_ready=false` · C-SLICE-≠-MODULE; seals ATT-LEAVE · SI type/insurer · CTR · enrollment · peers RETAIN; no apps/**. |
| **next_owner** | **ba-process** |
| **next_dispatch_prompt** | See §8 |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-sa-01.md` |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 8. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01
from_role: pm
to_role: ba-process
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01 CONFIRMED Option B

## entry_criteria
- Read SA: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01.md (Option B LOCK · L-ATT-WS-* · AC-PLT-ATT-WORKSITE-01*)
- Read evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-sa-01.md
- Peer: ATT-LEAVE-CATALOG-BA-01 pattern (admin open ≠ consumer invent) · AC-PLT-ATT-04 retain
- Honesty false · C-SLICE-≠-MODULE
- RETAIN: ATT-LEAVE GWC · SI type/insurer L1 · CTR · enrollment · leave WAIVE/sign/J-06c — do not reopen

## task (governance — NO apps/**)
Confirm AC pack AC-PLT-ATT-WORKSITE-01 / 01b / 01c / 01d / 01H + VAL-ATT-WS-CNS-*:
- Nest F-ATT-CAT-WS = SoT; Settings/`gps_locations` alone REJECT
- Admin CREATE open N+1 (01d); consumers punch/check-in when active>0 + gps_enabled
- Invent → HRM-ATT-GEO-001 and/or HRM-ATT-SITE-UNKNOWN (lock synonym with SITE-404)
- Empty active = skip geofence + no seed/ensureDefault (01c)
- Soft-retire active=false preference; enumerate UF/J-* surfaces (Settings GPS · punch lat/lon · mobile if in-scope)
- Explicit OUT: fold into leave-types · reopen ATT-LEAVE · flip attendance_uat_ready · seed · mega-EAV · work_shifts catalog
- ba-data remains HOLD unless you prove column gap; BE HOLD until this BA CONFIRMED

## evidence_path
docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-ba-01.md
Spec: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01.md

## cấm
apps/** · seed · flip ready · invent module ATT UAT · reopen ATT-LEAVE GWC · Phase1 DONE

## exit
CONFIRMED AC pack · PASS_TO_PM · completion_report · next_owner · next_dispatch_prompt · ack_status
```

---

## 9. Non-claims

- No `apps/**` / seed / migration.
- No `attendance_uat_ready=true` · no module ATT UAT · no Phase1 DONE.
- No reopen ATT-LEAVE-CATALOG GWC · leave WAIVE/sign/J-06c · SI type/insurer L1 · CTR · enrollment.
- No ba-data UNLOCK this seat (Nest LIVE — peer ATT-LEAVE HOLD class).
- Nest work-sites deepen ≠ module ATT GO (`C-SLICE-≠-MODULE`).
