# PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01 — Option/F.1 · AC-PLT-ATT-WORKSITE-01 Nest work-sites deepen

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-QC-01` **GWC** · U88 continuous · prior residual **work-sites OUT** from [`ATT-LEAVE-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md) (`L-ATT-LEAVE-08` / §4.2) · expand note [`ATT-VERTICAL-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md) **F-ATT-CAT-WS-*** · [`ATT-DATA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md) §3 LIVE |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 narrow **AC-PLT-ATT-WORKSITE-01** · **DEEPEN** F-ATT-CAT-WS-* on Nest **already LIVE** · **NO** new physical table · **NO CODE** `apps/**` · **no seed** · **no wipe** ATT leave catalog GWC · leave WAIVE / sign / J-HRM-06c · SI type/insurer L1 · CTR · enrollment · EMP/DEC/PAY/REC/EXT/LIST-TOTALS |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — Option **B** **LOCKED** · ba-data **HOLD** · ba-process **UNLOCK** · BE consumer/admin deepen **HOLD** until BA AC pack |
| **prior_vertical** | ATT-VERTICAL F-ATT-CAT-WS-01/02 **CONFIRMED** · ATT-DATA EXPAND note **CONFIRMED** · CFG P0 work-sites slug **GWC** (M1) · **≠** leave-type AC pack |
| **prior_seals** | ATT-LEAVE-CATALOG QC GWC **RETAIN** · ATT WAIVE / sign / J-HRM-06c **RETAIN** · SI type L1 + SI insurer L1 **RETAIN** · CTR legal-print · enrollment EMP-BE-02 **RETAIN** · EMP/DEC/PAY/REC/EXT/LIST-TOTALS **RETAIN** |
| **ref_peer_att_leave** | Nest leave Option B · [`ATT-LEAVE-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md) **AC-PLT-ATT-LEAVE-01** — work-sites stamped **OUT** |
| **ref_peer_si_insurer** | Nest insurers Option B · [`SI-INSURER-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01.md) — pattern cite only (**≠** ATT table) |
| **ref_peer_pay** | PAY Nest `salary_components` Option B · admin open ≠ consumer invent |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · L1 Catalog · L6 soft-delete · §7 ATT · [`ADR-HRM-ATTENDANCE-CFG-PERSIST`](../../architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) **D3** geofence SoT |
| **ref_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) **BR-PLT-02/04/05/06** · ATT §2.3 · vertical **AC-PLT-ATT-04** |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **FR-UC-BP-ATT-03d** (GPS work-sites) · punch/check-in geofence class |
| **ref_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §4.3 / §4.4c `attendance_work_sites` |
| **Honesty** | `attendance_uat_ready=false` · **DENIED** invent ATT UAT · **DENIED** reopen ATT-LEAVE GWC · **DENIED** reopen leave WAIVE / sign / J-HRM-06c · **DENIED** reopen SI type/insurer L1 · CTR · enrollment · EMP/DEC/PAY/REC · `payroll_e2e_ready=false` · **`C-SLICE-≠-MODULE`** · U65 |
| **must_keep** | Nest `attendance_work_sites` physical LIVE · F-ATT-CAT-WS paths · `work_shifts` ops lock · geofence `HRM-ATT-GEO-001` · leave F-ATT-CAT-LVT/EFF seals · soft-delete class · scope_parity U19 · open catalog no closed site enum · ADR D3 empty-sites skip-assert |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option pack)

| | |
|--|--|
| **Decision title** | AC-PLT-ATT-WORKSITE-01 — Nest work-sites SoT deepen · admin open CREATE N+1 · consumer geofence / site-ref assert when catalog ≠ empty · invent typed KEY/GEO class |
| **Requestor** | pm · U88 after SI-INSURER-CATALOG-QC-01 GWC · residual work-sites OUT from ATT-LEAVE |
| **Decision owner** | sa |
| **Related** | FR-UC-BP-ATT-03d · ADR D3 · BR-PLT-02/04/05/06 · **AC-PLT-ATT-04** · F-ATT-CAT-WS-01/02 · peer AC-PLT-ATT-LEAVE-01 / SI-INSURER-01 |

### 1.1 Problem — AS-IS vs target

| Current state (AS-IS evidence) | Gap / target |
|--------------------------------|--------------|
| Nest **`public.attendance_work_sites` LIVE** — `AttendanceConfigService.ensureWorkSitesSchema` + CRUD `GET/POST/PATCH/DELETE /api/hrm/attendance/work-sites*` | Catalog **admin** UF ≠ named **consumer invent** AC pack peer leave/insurers (**AC-PLT-ATT-WORKSITE-01*** deepen **AC-PLT-ATT-04**) |
| FE Settings GPS (`useAttendanceRules`) already binds Nest work-sites — **not** Settings MD partition as sole SoT | Risk of regressing to **`attendance_rules.gps_locations` JSON** or Settings-only as SoT (ADR D3 / Option A class) |
| Punch `assertWithinWorkSite`: when **active sites >0** + coords → out-of-range **`HRM-ATT-GEO-001`**; **empty sites → skip assert** (ADR D3) | Empty vs invent coords not stamped as **AC-PLT-ATT-WORKSITE-01***; FE path sending **string-only** `check_in_location` without lat/lon may **silent-skip** geofence — BA must enumerate |
| DELETE = **hard** `DELETE FROM …` | Platform **BR-PLT-04** / F-ATT-CAT-WS-02 soft-retire (`active=false`) deepen residual — **not** new table |
| List returns **all** rows (no default `active` filter) | F-ATT-CAT-WS-01: default exclude inactive unless `include_inactive=true` — deepen |
| No open `site_code` slug (UUID PK + `name`) | Optional GĐ1.5 — **HOLD** unless BA proves picker needs code SoT; GĐ1 consumer identity = **`id` UUID** + geofence coords |
| ATT-LEAVE pack explicitly **OUT** work-sites | This seat **OWN** — **FORBIDDEN** fold into leave-types / reopen leave GWC |

**Failure if unresolved:** Settings/`gps_locations` treated as sole SoT; admin CREATE blocked as «must pick existing»; hard-delete orphans punch history; PM flips `attendance_uat_ready` / reopens ATT-LEAVE; ba-data invents second sites table / mega-EAV; leave and work-sites SoT collide.

### 1.2 Constraints

- Docs-only this seat · **no** `apps/**` · **no** seed (U65)
- **DENY** `attendance_uat_ready=true` · module ATT UAT · Phase1
- **SEAL RETAIN:** ATT-LEAVE-CATALOG GWC · ATT WAIVE / sign / J-HRM-06c · SI type L1 · SI insurer L1 · CTR legal-print · enrollment · EMP/DEC/PAY/REC/EXT/LIST-TOTALS
- Cite existing `/api/hrm/attendance/work-sites*` — **cấm** invent `/api/hrm/platform/att/*` mega catalog
- **FORBIDDEN** fold work-sites into `att_leave_type` / reopen ATT-LEAVE GWC
- **FORBIDDEN** treat `work_shifts` as platform Catalog duplicate (ops lock ADR D1)

---

## 2. Options

### Option A — Settings MD / `gps_locations` JSON = sole geofence SoT

| | |
|--|--|
| **Description** | Consumer punch / GPS UI bind only Settings Master Data or `attendance_rules.gps_locations` JSON; Nest `attendance_work_sites` remains admin orphan or dual-write chaos. |
| **Benefits** | Matches older dual-write era; zero deepen. |
| **Costs** | Contradicts ADR **D3** (work-sites = enforcement SoT) · ATT-VERTICAL F-ATT-CAT-WS · FE already Nest-bound · peer leave/insurers Nest SoT. |
| **Risks** | AC green on JSON while punch asserts Nest — **REJECT** as primary SoT. |

### Option B — Nest `attendance_work_sites` (F-ATT-CAT-WS-01/02) = authoritative work-sites catalog · deepen admin open + consumer assert — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Peer **ATT leave · SI insurers · EMP/DEC/PAY**: single open work-sites catalog = Nest **`public.attendance_work_sites`** via **F-ATT-CAT-WS-01** list + **F-ATT-CAT-WS-02** mutate (paths **KEEP** — deepen only). When **active site count > 0** and GPS enforcement on (`gps_enabled`), consumer check-in **must** satisfy geofence ∈ active sites (**BR-PLT-02** · **AC-PLT-ATT-WORKSITE-01** · aligns **AC-PLT-ATT-04** / **`HRM-ATT-GEO-001`**). Catalog **admin** CREATE N+1 remains **open** (new site name/coords — **BR-PLT-05** · no closed site enum). FE Settings GPS binds Nest work-sites — **FORBIDDEN** Settings MD / `gps_locations` alone as SoT. Invent class: (1) coords outside all active sites → **`HRM-ATT-GEO-001`**; (2) consumer body invents `work_site_id` ∉ scoped catalog (when surface binds id) → **`HRM-ATT-SITE-UNKNOWN`** (or retain **`HRM-ATT-SITE-404`** synonym — BA locks one code). Empty active catalog → skip geofence assert + VI guidance (**ADR D3** · U65 no seed default site). Soft-retire prefer `active=false` over hard DELETE when history may reference (**BR-PLT-04** deepen). |
| **Benefits** | Aligns ATT-VERTICAL/DATA LIVE · ADR D3 · peer admin≠consumer pattern · no new table · closes leave-OUT residual without reopening leave GWC. |
| **Costs** | ba-process AC surface matrix (Settings GPS CRUD · punch/check-in · mobile if in-scope) + optional BE deepen (soft-retire · list filter · KEY assert · lat/lon wire). |
| **Risks** | Misread as reopen ATT-LEAVE / flip UAT / fold into leave-types → **L-ATT-WS-08/09/10**. Misread empty-sites skip as «allow invent always» → **L-ATT-WS-04**. |

### Option C — Invent attendance_uat_ready / reopen ATT-LEAVE GWC / fold into leave-types / mega EAV / seed default site

| | |
|--|--|
| **Description** | Flip `attendance_uat_ready`; reopen leave catalog GWC / WAIVE; fold sites into `att_leave_type`; ADD `hrm_att_catalog_rows`; or `ensureDefaultWorkSite` for UF density. |
| **Benefits** | Fake module green / one-table illusion. |
| **Costs** | Honesty breach · seal churn · leave/sites SoT collision · U65 breach. |
| **Risks** | **REJECT** — DENY invent UAT · DENY seal reopen · DENY mega-EAV (ADR Q-PLT-03) · DENY fold into leave · DENY seed default site (ADR D3). |

---

## 3. Trade-off matrix

| Criteria | Weight | A Settings/`gps_locations` SoT | **B Nest F-ATT-CAT-WS** | C Invent / fold / reopen |
|----------|-------:|-------------------------------:|------------------------:|-------------------------:|
| Business value (FR-UC-BP-ATT-03d / ADR D3 / BR-PLT-02) | 5 | 1 | **5** | 0 |
| Honesty / seal safety | 5 | 3 | **5** | 0 |
| Single work-sites SoT reliability | 5 | 1 | **5** | 1 |
| Time to deliver | 4 | 4 | **3** | 5 |
| Complexity | 4 | 3 | **4** | 1 |
| Maintainability (peer leave / insurers / EMP/DEC/PAY) | 4 | 1 | **5** | 0 |
| **Weighted** | | 62 | **111** | 24 |

---

## 4. Decision

| | |
|--|--|
| **Selected** | **Option B** — architecture **LOCKED** |
| **Seat verdict** | **CONFIRMED** |
| **Why B** | Nest work-sites already LIVE + ADR D3 SoT + FE Nest-bound; residual is **named AC pack + F.1 deepen** (admin≠consumer · soft-retire · invent GEO/KEY · list active filter) — **not** missing physicalize / Settings sole SoT / UAT invent. |
| **Rejected** | **A** Settings/`gps_locations`-only SoT · **C** invent UAT / reopen ATT-LEAVE / fold into leave / mega table / seed |
| **Assumptions** | Leave F-ATT-CAT-LVT/EFF + WAIVE/sign/J-06c + SI seals stay must_keep — **not** this AC; `work_shifts` stays ops. |

### 4.1 Physical / DATA / BA / BE gates

| Question | Answer |
|----------|--------|
| New ba-data physicalize? | **HOLD** — `attendance_work_sites` already LIVE (ATT-DATA §3) · **FORBIDDEN** second sites table · **FORBIDDEN** fold into `att_leave_type` |
| Unlock ba-process? | **YES** — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01` AC pack (**AC-PLT-ATT-WORKSITE-01***) |
| Unlock ba-data? | **NO** this seat — EXPAND only if BA proves column gap (e.g. optional `site_code` / `archived_at` GĐ1.5) |
| Unlock BE deepen? | **HOLD** until BA AC pack CONFIRMED — then narrow: soft-retire vs hard DELETE · list default active · invent KEY if BA surfaces bind `work_site_id` · lat/lon assert retain |
| Unlock FE? | After BA — only if BA finds `gps_locations` JSON sole bind or punch missing lat/lon; Settings GPS Nest bind **RETAIN** when already correct |
| ATT UAT / ATT-LEAVE GWC / WAIVE / SI / CTR? | **FORBIDDEN** invent reopen / flip from this seat |

### 4.2 Peer / adjacent (cite — do not reopen)

| Catalog / ops | Nest / SoT | This seat |
|---------------|------------|-----------|
| Leave types | Nest `att_leave_type` · F-ATT-CAT-LVT/EFF · **ATT-LEAVE GWC SEAL** | **OUT reopen** — **≠** work-sites SoT |
| **Work sites** | Nest `attendance_work_sites` · **F-ATT-CAT-WS-*** deepen | **OWN** AC-PLT-ATT-WORKSITE-01 |
| Work shifts | `work_shifts` ops (ADR D1) | **OPS LOCK** — **FORBIDDEN** catalog duplicate |
| Punch / records | `assertWithinWorkSite` · `HRM-ATT-GEO-001` | Consumer of active sites |
| SI insurers | Nest `si_insurer` (peer pattern) | Pattern cite only — different domain |
| Rules flags | `gps_enabled` on `attendance_rules` | Gate for geofence enforce — **not** sites SoT |

---

## 5. Locks (L-ATT-WS-*)

| Lock | Rule |
|------|------|
| **L-ATT-WS-01 Admin ≠ consumer** | **Catalog admin** POST/PATCH F-ATT-CAT-WS-02 = **open N+1** new site (name/coords — BR-PLT-05 · **AC-PLT-ATT-04** retain). **Consumers** (punch/check-in · any mutate binding `work_site_id` when in-scope) when **active sites >0** (+ `gps_enabled` for GEO) = **picker/FK or geofence membership only** (BR-PLT-02 · **AC-PLT-ATT-WORKSITE-01**). |
| **L-ATT-WS-02 Code SoT** | Authoritative work-sites list = Nest `attendance_work_sites` via **F-ATT-CAT-WS-01/02** — **FORBIDDEN** Settings MD alone · **FORBIDDEN** `attendance_rules.gps_locations` as sole write/enforcement SoT (ADR D3) |
| **L-ATT-WS-03 Identity GĐ1** | Consumer identity = scoped **`id` UUID** (+ lat/lon geofence). Optional open `site_code` = **GĐ1.5 HOLD** unless BA proves — **FORBIDDEN** invent closed enum of site names |
| **L-ATT-WS-04 Empty catalog** | Active count **=0** → geofence **skip-assert** (ADR D3) + VI guidance / admin CREATE CTA; **FORBIDDEN** `ensureDefaultWorkSite` / seed density in UF (U65); admin CREATE still allowed |
| **L-ATT-WS-05 Soft-delete** | Retire prefer **`active=false`** (picker/geofence hide); history punches remain (**BR-PLT-04**); hard DELETE deepen = residual when no refs — **FORBIDDEN** silent orphan churn as product SoT |
| **L-ATT-WS-06 Scope** | list ↔ get-by-id ↔ mutate ↔ geofence assert same `resolveHrmListScope` (**U19**) |
| **L-ATT-WS-07 Invent KEY / GEO** | (a) catalog ≠ empty ∧ coords outside all active sites ∧ GPS on → **`HRM-ATT-GEO-001`**; (b) body `work_site_id` ∉ scoped active catalog → **`HRM-ATT-SITE-UNKNOWN`** (BA may alias **`HRM-ATT-SITE-404`**) — format-only UUID **does not** bypass membership |
| **L-ATT-WS-08 Fold / leave OUT** | **FORBIDDEN** fold work-sites into `att_leave_type` / leave AC pack; **FORBIDDEN** reopen ATT-LEAVE-CATALOG GWC; **FORBIDDEN** fold `work_shifts` into this pack |
| **L-ATT-WS-09 Seals retain** | **FORBIDDEN** reopen ATT-LEAVE · WAIVE/sign/J-06c · SI type/insurer L1 · CTR · enrollment · EMP · DEC · PAY · REC · EXT · LIST-TOTALS without warrant |
| **L-ATT-WS-10 Honesty** | `attendance_uat_ready=false` · payroll false · printable/personnel false (cited peers) · **`C-SLICE-≠-MODULE`** · DENY module ATT UAT |

```text
  attendance_rules.gps_locations / Settings MD alone ──► NOT sole SoT (Option A REJECT)
           │
  F-ATT-CAT-WS CRUD ──► public.attendance_work_sites (SoT LIVE)
           │
           ▼
  Consumers (when active count>0 + gps_enabled):
    · POST attendance records / check-in with lat/lon ∈ site radii
    · Optional work_site_id ∈ scoped catalog (BA enumerate)
           │
  invent coords OOS ──► HRM-ATT-GEO-001
  invent site id     ──► HRM-ATT-SITE-UNKNOWN (or SITE-404 alias)
  empty active       ──► skip geofence (ADR D3) · no seed
  ATT leave / WAIVE / SI / CTR ──► OUT this seat
```

---

## 6. F.1 capability deepen (cite ATT-VERTICAL — ADD locks only)

| Cap | Path / rule | AC |
|-----|-------------|-----|
| List / admin SoT | **F-ATT-CAT-WS-01** `GET /api/hrm/attendance/work-sites` · get-by-id — **DEEPEN:** default `active=true` filter; display-ready; **cấm** ensureDefault on U65 | **AC-PLT-ATT-WORKSITE-01** · AC-PLT-ATT-04 |
| Admin create open | **F-ATT-CAT-WS-02** POST — N+1 site OK (name/coords) | **AC-PLT-ATT-WORKSITE-01d** · AC-PLT-ATT-04 |
| Admin update / retire | **F-ATT-CAT-WS-02** PATCH `active=false` preferred; DELETE hard = residual deepen | AC-PLT-ATT-04 · BR-PLT-04 |
| Consumer geofence | Existing punch `assertWithinWorkSite` — **RETAIN** `HRM-ATT-GEO-001` | **AC-PLT-ATT-WORKSITE-01** / **01b** |
| Consumer site-id assert | EXPAND if BA lists surfaces binding `work_site_id` → ∈ catalog when count>0 | **AC-PLT-ATT-WORKSITE-01b** KEY |
| Rules GPS flag | `gps_enabled` gate — cite ADR D3 — **not** sites catalog | OUT redesign |
| Leave / sheet / WAIVE | **must_keep** — **OUT** | DENY reopen |

**Error (consumer invent):**

| Condition | Code |
|-----------|------|
| active sites >0 ∧ GPS on ∧ lat/lon outside all radii | **`HRM-ATT-GEO-001`** (400) |
| `work_site_id` provided ∧ ∉ scoped catalog (when BA in-scope) | **`HRM-ATT-SITE-UNKNOWN`** (400) — alias SITE-404 OK if BA stamps |
| radius/coords invalid on admin | **`HRM-ATT-SITE-VAL`** (retain) |
| OOS get/mutate | **`HRM-ATT-SITE-404`** / scope 409 (retain · U19) |

---

## 7. AC / validation matrix (for ba-process deepen)

| ID | Condition | Expected PASS | FAIL |
|----|-----------|---------------|------|
| **AC-PLT-ATT-WORKSITE-01** | Nest active ≥1 · gps_enabled · consumer check-in inside radius | 2xx · FE after 2xx · F5 sites still SoT Nest | `gps_locations` JSON sole SoT · free invent coords succeed |
| **AC-PLT-ATT-WORKSITE-01b** | Same · invent coords outside **or** invent unknown `work_site_id` | **4xx** `HRM-ATT-GEO-001` / `HRM-ATT-SITE-UNKNOWN` | 2xx invent |
| **AC-PLT-ATT-WORKSITE-01c** | Nest active =0 | Empty list soft · skip geofence · admin may CREATE · **no** seed default site | ensureDefault / seed for UF |
| **AC-PLT-ATT-WORKSITE-01d** | Catalog admin CREATE N+1 | **2xx** open site (ATT-04 retain) | Reject as «closed site list only» |
| **AC-PLT-ATT-WORKSITE-01H** | Honesty | `attendance_uat_ready=false` · ATT-LEAVE GWC retain · no module UAT | Flip flags / reopen leave GWC |
| **AC-PLT-ATT-04** | (retain) Settings GPS CRUD → F5 → geofence uses new site | Already vertical/M1 class — **RETAIN** deepen stamp via WORKSITE-01* | Fake save stub |
| **VAL-ATT-WS-CNS-01** | Punch OOS when sites >0 + GPS | 4xx GEO-001 | Silent accept |
| **VAL-ATT-WS-CNS-02** | Invent `work_site_id` OOS (if BA in-scope) | 4xx UNKNOWN/404 | Silent accept |
| **VAL-ATT-WS-CNS-03** | List picker scope ≠ assert scope | jest FAIL scope_parity | Drift |
| **VAL-ATT-WS-CNS-04** | Retire `active=false` → geofence ignores site | Punch no longer matches retired | Hard-delete required for retire |
| **VAL-ATT-WS-CNS-05** | Punch without lat/lon when GPS on + sites >0 | BA locks: fail closed **or** documented soft — **FORBIDDEN** silent 201 as PASS | Silent skip claimed green |

**Consumer surface inventory (ba-process must enumerate exact UF/J-*):** Settings/CFG GPS work-sites CRUD (FR-UC-BP-ATT-03d) · portal punch/check-in with lat/lon · mobile check-in if in-scope · **not** leave-type create · **not** sheet close/sign · **not** work_shifts · **not** ATT-LEAVE invent KEY.

**Align note:** **AC-PLT-ATT-WORKSITE-01** = named peer of **AC-PLT-ATT-LEAVE-01** / **AC-PLT-SI-INSURER-01**; vertical **AC-PLT-ATT-04** remains the CRUD/geofence row — BA pack must cross-ref both (no duplicate conflicting rules).

---

## 8. Failure modes

| Option / path | Failure mode | Detection | Mitigation |
|---------------|--------------|-----------|------------|
| A | JSON/`gps_locations` green · Nest orphan | FE write path ≠ work-sites API | Reject A; bind Nest |
| B | FE punch omits lat/lon → silent skip | Network 201 without GEO when OOS | VAL-ATT-WS-CNS-05 · FE wire |
| B | BE treats admin CREATE as invent | Admin N+1 4xx | L-ATT-WS-01 · 01d |
| B | Hard DELETE as only retire | History orphan / QA fail BR-PLT-04 | Soft `active=false` deepen |
| C | Claim attendance_uat / reopen ATT-LEAVE | Honesty / seal audit | DENY |
| Any | Seed / ensureDefault for picker | U65 / ADR D3 audit | FAIL QA |

---

## 9. Rollout / validation

| Step | Owner | Exit |
|------|-------|------|
| 1 This SA Option B LOCK | sa | **CONFIRMED** (this file) |
| 2 AC pack consumer + admin surfaces | **ba-process** | CONFIRMED AC-PLT-ATT-WORKSITE-01* click paths |
| 3 ba-data | **HOLD** unless BA proves physical EXPAND | No second table · no fold into leave |
| 4 BE deepen | **dev-be** HOLD→unlock after BA | soft-retire · list filter · KEY/GEO jest only for BA gaps |
| 5 FE fix | **dev-fe** only if BA flags JSON sole / missing lat/lon | Nest Settings GPS retain when OK |
| 6 QA U65 invent + admin open | qa | browser · zero-seed · no UAT flip · no leave reopen |
| 7 QC slice GWC | qc | `C-SLICE-≠-MODULE` · `attendance_uat_ready=false` · ATT-LEAVE seal retain |

**Rollback:** retain Nest CRUD + GEO-001; revert FE bind only — no DDL drop.

**Success (this seat):** Option B locked · ba-data HOLD · ba-process unlocked · BE HOLD · honesty false · seals retained · ATT-LEAVE / leave WAIVE / SI / CTR **not** reopened.

---

## 10. Non-claims

- No `apps/**` / migration / seed.
- No `attendance_uat_ready=true` · no module ATT UAT · no Phase1 · no invent ATT-LEAVE GWC reopen · no leave WAIVE / J-HRM-06c / sheet-sign reopen.
- No reopen SI type/insurer L1 · CTR legal-print · enrollment · EMP · DEC · PAY · REC · EXT · LIST-TOTALS.
- No claim payroll e2e / printable / personnel.
- Prior ATT-VERTICAL / ATT-DATA / CFG work-sites **remain CONFIRMED** — this file owns **AC-PLT-ATT-WORKSITE-01 Option/F.1 deepen** (peer ATT-LEAVE-CATALOG-SA-01), not a second physicalize / not leave catalog redesign.

---

## 11. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **next_owner** | **pm** → **ba-process** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01` |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-sa-01.md` |
| **ba-data** | **HOLD** |
| **BE** | **HOLD** until BA AC pack |
