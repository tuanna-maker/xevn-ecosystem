# BA AC/BR — ATT work-sites catalog Option B · admin open N+1 vs consumer geofence (Nest F-ATT-CAT-WS ≠ empty)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01` **CONFIRMED** Option **B** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | ba-process |
| **lane** | governance |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — AC pack implementation-ready · ba-data **HOLD** · BE deepen **HOLD→UNLOCK** after this BA · FE deepen only for BA-listed gaps · ATT UAT / ATT-LEAVE reopen **DENIED** |
| **change_mode** | **ADD** (deepen SA §7 · **no** wipe platform BA-01 / ATT-VERTICAL / ATT-LEAVE GWC / AC-PLT-ATT-04) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01.md) L-ATT-WS-01..10 · §7 AC/VAL |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-att-worksite-catalog-sa-01.md`](../../qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-sa-01.md) |
| **ref_peer_att_leave** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md) admin≠consumer pattern · work-sites **OUT** that pack |
| **ref_vertical** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md) **F-ATT-CAT-WS-01/02** · **AC-PLT-ATT-04** |
| **ref_platform_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) **BR-PLT-02/04/05/06** · ATT §2.3 |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **FR-UC-BP-ATT-03d** (GPS work-sites) · punch/check-in geofence class |
| **ref_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §4.3 / §4.4c `attendance_work_sites` |
| **ref_adr** | [`ADR-HRM-ATTENDANCE-CFG-PERSIST`](../../architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) **D3** · [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B |
| **Honesty** | `attendance_uat_ready=false` · ATT-LEAVE-CATALOG GWC **SEAL RETAIN** · leave WAIVE / sign / **J-HRM-06c** **SEAL RETAIN** · SI type L1 · SI insurer L1 · CTR · enrollment **SEAL RETAIN** · EMP·DEC·PAY·REC·EXT·LIST-TOTALS **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 · DENY module ATT UAT |
| **Cấm** | `apps/**` · seed · `ensureDefaultWorkSite` · ba-data second sites table · fold into leave · Settings/`gps_locations` sole SoT · invent UAT · reopen ATT-LEAVE GWC · reopen WAIVE/sign/J-06c · flip ready · mega-EAV · `work_shifts` catalog fold |

---

## 0. Process objective & actors

### Objective

Khóa **AC/BR đo được** cho Option **B** (SA LOCKED):

1. **Catalog admin** (`F-ATT-CAT-WS-02`) = **open CREATE N+1** — site name/coords HR đặt OK (**BR-PLT-05** · **AC-PLT-ATT-04** · **AC-PLT-ATT-WORKSITE-01d**).
2. **Consumers** khi Nest **active site count > 0** **và** `gps_enabled` = geofence membership only — punch/check-in **lat/lon ∈** active site radii (**BR-PLT-02** · **AC-PLT-ATT-WORKSITE-01**).
3. Invent OOS coords → **4xx** **`HRM-ATT-GEO-001`** (**AC-PLT-ATT-WORKSITE-01b** · **VAL-ATT-WS-CNS-01**).
4. Empty active → skip geofence assert + VI/CTA admin; **cấm** seed/ensureDefault (**AC-PLT-ATT-WORKSITE-01c** · **L-ATT-WS-04** · ADR D3).
5. Soft-retire prefer **`active=false`** (**BR-PLT-04** · **VAL-ATT-WS-CNS-04**); list default active filter deepen (**VAL-ATT-WS-CNS-03b**).
6. GPS method without lat/lon when enforce on → **FAIL closed** — **FORBIDDEN** silent 201 as PASS (**VAL-ATT-WS-CNS-05**).
7. **DENY** fold into leave · reopen ATT-LEAVE GWC · flip `attendance_uat_ready` · Settings/`gps_locations` sole SoT · mega-EAV · `work_shifts` catalog.

### Actors

| Actor | Role |
|-------|------|
| HCNS — Attendance **Quy tắc / GPS** (Settings CFG) | CRUD Nest `attendance_work_sites` (mở N+1) · retire soft · bật `gps_enabled` |
| NV / QL — clock GPS (portal) / mobile check-in | Gửi lat/lon ∈ geofence khi enforce |
| Group CEO | Scope rollup `main` / member — cùng resolve list↔assert (**U19**) |
| System | Active sites filter · soft-delete hide · `HRM-ATT-GEO-001` · empty skip (ADR D3) |
| SA / Dev-BE / Dev-FE / QA | F.1 deepen · soft-retire · list filter · lat/lon wire · U65 browser |

### Scope

| In (this seat) | Out |
|----------------|-----|
| AC-PLT-ATT-WORKSITE-01 / 01b / 01c / 01d / 01H · VAL-ATT-WS-CNS-01..05 · BR-PLT-ATT-WS-* · surface matrix | Impl `apps/**` / migration / seed |
| Enumerate UF: Settings GPS CRUD · portal GPS punch · mobile GPS check-in | Claim module ATT UAT / flip `attendance_uat_ready` |
| Cross-ref **AC-PLT-ATT-04** · peer **AC-PLT-ATT-LEAVE-01*** · SRS FR-UC-BP-ATT-03d | Reopen ATT-LEAVE GWC · WAIVE / sheet-sign / J-HRM-06c |
| ba-data **HOLD** (already physical LIVE) | Leave-type pack · work_shifts ops · second sites table · `site_code` GĐ1.5 |
| Align AC-PLT-ATT-04 ≡ CRUD+geofence row stamped via WORKSITE-01* | Wipe vertical AC-04 / CFG M1 seals |

---

## 1. As-is vs to-be

| | AS-IS (evidence) | TO-BE (Option B · this pack) |
|---|------------------|------------------------------|
| Sites SoT | Nest `attendance_work_sites` LIVE · FE `useAttendanceRules` binds Nest — **not** MD sole | SoT = Nest via **F-ATT-CAT-WS-01/02**; Settings MD / `gps_locations` alone **REJECT** |
| Admin create | POST work-sites open N+1 (CFG GPS UI) | **Retain** open N+1 (**01d** · **AC-PLT-ATT-04**) — **≠** consumer invent ban |
| Consumer punch | `assertWithinWorkSite` when lat/lon + gps_enabled · active sites >0 → **GEO-001**; empty → skip | Named pack **01/01b/01c** + browser U65; GEO assert **RETAIN** |
| Soft-delete | PATCH `active` exists; **DELETE = hard** `DELETE FROM` | Prefer retire `active=false` (**BR-PLT-04**); hard DELETE = residual when no refs |
| List filter | Returns **all** rows (no default `active`) | Default exclude inactive unless `include_inactive=true` |
| Punch no lat/lon | BE skips assert → possible **silent 201** | GPS method + enforce → **FAIL closed** (CNS-05); manual clock soft-skip **documented** |
| `work_site_id` body | **No** in-scope consumer bind (UUID id identity admin only) | **SITE-UNKNOWN** = **GĐ1.5 HOLD** until surface binds id |
| Honesty | Slice deepen risk misread module GO | `attendance_uat_ready=false` · **`C-SLICE-≠-MODULE`** · ATT-LEAVE seals retain |

---

## 2. Platform locks (reuse)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-02** | Nest active sites **>0** ∧ `gps_enabled` | Consumer SoT = geofence ∈ active radii (lat/lon) | OOS coords → **4xx** `HRM-ATT-GEO-001` |
| **BR-PLT-04** | Retire site | Soft `active=false` prefer | Geofence/list default ẩn; history punches remain |
| **BR-PLT-05** | Admin CREATE | Open N+1 name/coords · VAL only | **FORBIDDEN** closed site enum / «must pick existing only» on F-ATT-CAT-WS-02 |
| **BR-PLT-06** | Dual SoT risk | `gps_locations` JSON / MD = REF/legacy only | **FORBIDDEN** sole write/enforcement SoT (ADR D3) |
| **L-ATT-WS-01** | Admin path vs consumer path | Split AC/VAL | Mis-apply invent ban lên admin = **FAIL process** |
| **L-ATT-WS-02** | Sites SoT | Nest F-ATT-CAT-WS | Settings/`gps_locations` alone **REJECT** |
| **L-ATT-WS-04** | Active count =0 | Skip geofence + VI/CTA | **FORBIDDEN** ensureDefault/seed |
| **L-ATT-WS-06** | Scope | list ↔ get-by-id ↔ mutate ↔ geofence | Same `resolveHrmListScope` (**U19**) |
| **L-ATT-WS-08..10** | Fold leave / seals / honesty | OUT / RETAIN / false | See §8 |

---

## 3. ATT work-sites-specific business rules

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-ATT-WS-01** | Surface = **catalog admin** (`POST/PATCH` F-ATT-CAT-WS-02) | Cho phép site mới (name/coords/radius hợp lệ) | **2xx/201** · list + F5 còn — **không** «must pick existing» |
| **BR-PLT-ATT-WS-02** | Surface ∈ **GPS consumer set** (§4) **và** active sites **>0** **và** `gps_enabled` | Body **phải** có finite lat/lon ∈ ≥1 active site radius | Ngoài vùng → **`HRM-ATT-GEO-001`**; format-only UUID **không** bypass geofence |
| **BR-PLT-ATT-WS-03** | Active sites **=0** (gps on hoặc off) | Skip geofence assert (ADR D3) + VI/CTA admin CREATE; admin vẫn CREATE | Seed/ensureDefault để pass UF = **FAIL U65** |
| **BR-PLT-ATT-WS-04** | Settings MD / `attendance_rules.gps_locations` | Legacy/REF only — **không** enforcement SoT | Bind Nest work-sites only for SoT |
| **BR-PLT-ATT-WS-05** | Retire | PATCH `active=false` → site không còn trong geofence active set | Hard DELETE chỉ khi no refs + admin explicit — **không** SoT retire path |
| **BR-PLT-ATT-WS-06** | List F-ATT-CAT-WS-01 | Default `active=true` filter; `include_inactive=true` cho admin audit | Inactive lộ mặc định vào geofence picker = **FAIL** |
| **BR-PLT-ATT-WS-07** | GPS method surface (portal GPS / mobile GPS) + enforce on + sites >0 | **Bắt buộc** gửi lat/lon numeric | Missing lat/lon → **FAIL** (FE gate và/hoặc BE 4xx) — **FORBIDDEN** silent 201 claimed PASS |
| **BR-PLT-ATT-WS-08** | Manual clock (`CheckInOutWidget` string location only) | Soft-skip geofence **documented** (không phải GPS method) | **Không** dùng silent-skip để claim **01/01b** PASS |
| **BR-PLT-ATT-WS-09** | Identity GĐ1 | Consumer geofence = lat/lon vs active sites; admin identity = UUID `id` | Optional `site_code` = **GĐ1.5 HOLD** — **no** ba-data EXPAND this seat |
| **BR-PLT-ATT-WS-10** | `work_site_id` on consumer body | **No** in-scope UF binds today | **`HRM-ATT-SITE-UNKNOWN`** = **HOLD GĐ1.5** until surface binds; **≠** alias of admin **`HRM-ATT-SITE-404`** |
| **BR-PLT-ATT-WS-11** | ba-data | `public.attendance_work_sites` already LIVE | **HOLD** — **FORBIDDEN** second table · **FORBIDDEN** fold into `att_leave_type` |
| **BR-PLT-ATT-WS-12** | `work_shifts` | Ops lock ADR D1 | **FORBIDDEN** fold into this catalog pack |

**Align (no conflict):**

| Vertical / peer | This pack |
|-----------------|-----------|
| **AC-PLT-ATT-04** Settings GPS CRUD → F5 → geofence uses new site | **RETAIN** · stamped admin via **01d** + consumer via **01** |
| **AC-PLT-ATT-LEAVE-01*** | Named peer pattern — **≠** same SoT; leave GWC **OUT reopen** |
| **AC-PLT-SI-INSURER-01*** / PAY | Pattern cite only |

**Error code lock (deterministic):**

| Code | Use | Not |
|------|-----|-----|
| **`HRM-ATT-GEO-001`** | Consumer invent OOS coords when enforce | Soft empty / seed |
| **`HRM-ATT-SITE-VAL`** | Admin radius/coords invalid | Consumer invent |
| **`HRM-ATT-SITE-404`** | Admin get/mutate OOS / not found (**U19**) | Synonym of GEO invent |
| **`HRM-ATT-SITE-UNKNOWN`** | Consumer invent `work_site_id` ∉ catalog (**GĐ1.5 HOLD** — no surface yet) | Alias of SITE-404 |

**SUPERSEDED / FORBIDDEN:** Option A Settings/`gps_locations`-only SoT · invent `attendance_uat_ready=true` · reopen ATT-LEAVE GWC · claim module ATT UAT · seed default site · fold into leave · mega-EAV · fold `work_shifts`.

---

## 4. Consumer surface inventory (authoritative)

> **Admin ≠ consumer.** AC geofence/invent áp **consumer rows** — **không** áp lên F-ATT-CAT-WS-02 admin CREATE.

| Surf ID | Surface (product) | Route / UI anchor (AS-IS) | Field SoT | Mutate / bind path | Class | SRS / J |
|---------|-------------------|--------------------------|-----------|-------------------|-------|---------|
| **S-ATT-WS-ADM-01** | Nest work-sites **admin** create/edit/retire | Attendance → Quy tắc / GPS card (`useAttendanceRules` · work-sites API) | name/lat/lon/radius open N+1 · `id` UUID | **F-ATT-CAT-WS-02** | **ADMIN** | FR-UC-BP-ATT-03d · **AC-PLT-ATT-04** |
| **S-ATT-WS-CNS-01** | **Portal GPS check-in** | Attendance clock method GPS (`GPSAttendance` · `data-testid=clock-in-gps-widget`) | `latitude`+`longitude` numeric | POST attendance records · `assertWithinWorkSite` | **CONSUMER** (primary portal) | FR-UC-BP-ATT-03d / punch |
| **S-ATT-WS-CNS-02** | **Mobile GPS check-in** | Mobile `CheckInScreen` · `checkInLocation` body lat/lon | same | POST records · GEO-001 map | **CONSUMER** (mobile) | **J-MOB-02** (geofence assert class — retain AC-PERS-LOC-01 no raw UUID UI) |
| **S-ATT-WS-CNS-03** | Manual web clock | `CheckInOutWidget` · string `check_in_location` only | no lat/lon | Soft-skip geofence | **SOFT-SKIP DOC** — **not** invent PASS path | Manual class |
| **S-ATT-WS-REF-01** | `gps_locations` JSON / Settings MD | Rules payload legacy | REF only | **FORBIDDEN** sole SoT | **REF** | ADR D3 |
| **S-ATT-WS-OUT-01** | Leave types / Nghỉ phép / WAIVE / sheet sign / J-HRM-06c | LeaveTab · inbox · sheets | — | — | **OUT** · **SEAL RETAIN** | ATT-LEAVE pack |
| **S-ATT-WS-OUT-02** | `work_shifts` | ATT CFG shifts | — | — | **OPS LOCK OUT** | ADR D1 |
| **S-ATT-WS-HOLD-01** | Consumer body `work_site_id` picker | **None AS-IS** | — | — | **GĐ1.5 HOLD** | SITE-UNKNOWN |

**Pointer:** QR / Face clock — Face GĐ2 HOLD; QR if sends lat/lon → same CNS-01 rule; if string-only → same as CNS-03 soft-skip (must not claim GEO PASS).

---

## 5. Use-case catalog (process)

| UC ID | Name | Happy | Alternate | Exception |
|-------|------|-------|-----------|-----------|
| **UC-PLT-ATT-WS-01** | Admin — CREATE Nest site N+1 | GPS CFG → site mới (name/coords/radius) → Lưu **201** → list có row → **F5** còn → punch trong bán kính 2xx | PATCH label/radius · retire `active=false` | VAL radius · scope 409 · «closed list only» sai áp |
| **UC-PLT-ATT-WS-02** | Consumer — GPS punch inside | active≥1 · gps_enabled → GPS clock → lat/lon ∈ radius → **2xx** → F5 record | Mobile J-MOB-02 same | OOS → **GEO-001** · missing lat/lon → CNS-05 FAIL |
| **UC-PLT-ATT-WS-03** | Invent OOS coords | active≥1 · gps_enabled → coords ngoài mọi site | — | **4xx** `HRM-ATT-GEO-001` · không persist |
| **UC-PLT-ATT-WS-04** | Empty active | active=0 → punch không GEO fail; VI/CTA admin; admin vẫn CREATE | — | ensureDefault/seed |
| **UC-PLT-ATT-WS-05** | Soft-retire | PATCH active=false → geofence bỏ site; punch tại tọa độ cũ không còn match site đó | include_inactive admin view | Hard-delete-only retire |
| **UC-PLT-ATT-WS-06** | Scope parity | List sites scope X = geofence assert scope X | Member 409 OOS | Drift list vs assert |

```mermaid
sequenceDiagram
  autonumber
  actor Admin as HCNS GPS catalog admin
  actor Emp as NV GPS clock / mobile
  participant Nest as Nest attendance_work_sites
  participant Rules as gps_enabled rules
  participant Punch as createRecord assertWithinWorkSite

  Admin->>Nest: POST F-ATT-CAT-WS-02 site N+1 (open)
  alt Ceiling / must-pick-only sai áp admin
    Nest-->>Admin: FAIL — vi phạm BR-PLT-05 / L-ATT-WS-01
  else 201
    Nest-->>Admin: Row active; F5 còn
  end
  Emp->>Rules: gps_enabled?
  Emp->>Punch: POST lat/lon (GPS method)
  alt Active count = 0
    Punch-->>Emp: Skip geofence (ADR D3); cấm seed
  else Active >0 and gps on
    alt Missing lat/lon on GPS method
      Punch-->>Emp: FAIL CNS-05 (cấm silent 201 PASS)
    else Coords OOS all radii
      Punch-->>Emp: 4xx HRM-ATT-GEO-001
    else Inside radius
      Punch-->>Emp: 2xx; F5 Nest still SoT
    end
  end
  Note over Punch: Leave / WAIVE / J-06c / attendance_uat OUT
```

---

## 6. Acceptance criteria (measurable · U65)

> Browser-only khi surface FE tồn tại · zero-seed · FE sau 2xx/4xx quan sát được + **F5** · probe/API **không** 🟢 UF.  
> Honesty flags **giữ false**.  
> **Không** wipe ATT-LEAVE GWC · WAIVE/sign/J-06c · SI · CTR · enrollment · peer seals.

### 6.1 Core AC pack (SA §7)

| ID | Surface | Đạt khi | Không đạt khi |
|----|---------|---------|----------------|
| **AC-PLT-ATT-WORKSITE-01** | **S-ATT-WS-CNS-01** (primary) · spot **CNS-02** | Nest active **≥1** (từ admin — **không** seed) · `gps_enabled`: GPS clock → Network POST có **latitude+longitude** ∈ radius → **2xx** → FE sau 2xx · **F5** sites SoT vẫn Nest work-sites | `gps_locations` JSON sole SoT · free invent OOS coords 2xx · chỉ API PASS · string-only location claimed green |
| **AC-PLT-ATT-WORKSITE-01b** | **S-ATT-WS-CNS-01** invent GEO | active **≥1** · gps on: cố ý coords **ngoài** mọi active radius → FE chặn và/hoặc Network **4xx** **`HRM-ATT-GEO-001`** → **không** persist sau F5 | 2xx invent · silent accept · claim SITE-404 synonym |
| **AC-PLT-ATT-WORKSITE-01c** | Empty active | active **=0**: empty list soft · skip geofence · VI/CTA admin; **S-ATT-WS-ADM-01** vẫn CREATE; **không** ensureDefault/seed | Seed/script density · fake default site |
| **AC-PLT-ATT-WORKSITE-01d** | **S-ATT-WS-ADM-01** | Catalog admin CREATE site **#N+1** → Network **2xx/201** F-ATT-CAT-WS-02 → list có row → **F5** còn → consumer geofence dùng site mới (**AC-PLT-ATT-04 RETAIN**) — **không** reject «closed site list only» | Áp invent ban lên admin · ceiling starter |
| **AC-PLT-ATT-WORKSITE-01H** | Honesty / seals | Evidence: `attendance_uat_ready=false` · ATT-LEAVE GWC **SEAL RETAIN** · WAIVE/sign/**J-HRM-06c** **SEAL RETAIN** · SI type/insurer L1 · CTR · enrollment · EMP·DEC·PAY·REC·EXT·LIST-TOTALS **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 zero-seed · DENY module ATT UAT | Flip ready · reopen ATT-LEAVE · reopen WAIVE/sign/J-06c · claim module ATT UAT / Phase1 |

### 6.2 Retain vertical AC

| ID | Surface | Đạt khi | Không đạt khi |
|----|---------|---------|----------------|
| **AC-PLT-ATT-04** | **S-ATT-WS-ADM-01** → CNS | Work site CRUD Settings/CFG → 2xx → F5 → punch geofence dùng site mới (when gps_enabled) | Fake save stub · scope mismatch — **RETAIN**; deepen stamp via WORKSITE-01* |

### 6.3 Consumer VAL (BE/QA measurable)

| ID | Surface | Input | Expect | AC / BR | BA gap stamp |
|----|---------|-------|--------|---------|--------------|
| **VAL-ATT-WS-CNS-01** | Punch GPS **CNS-01/02** | Coords OOS khi sites >0 + gps on | **4xx** `HRM-ATT-GEO-001` | 01b · BR-PLT-ATT-WS-02 | **RETAIN** `assertWithinWorkSite` — deepen jest only if FAIL |
| **VAL-ATT-WS-CNS-02** | Invent `work_site_id` | Body id ∉ scoped catalog | **4xx** `HRM-ATT-SITE-UNKNOWN` | 01b KEY | **HOLD GĐ1.5** — no in-scope surface; **cấm** invent BE assert without UF |
| **VAL-ATT-WS-CNS-03** | Scope | List sites scope ≠ geofence assert scope | jest **FAIL** scope_parity · 409/4xx deterministic | L-ATT-WS-06 · U19 | **RETAIN** list↔mutate specs; deepen if FAIL |
| **VAL-ATT-WS-CNS-03b** | List default | GET list without include_inactive | Default **active only** (inactive hidden from geofence set) | BR-PLT-ATT-WS-06 · F-ATT-CAT-WS-01 | **BE GAP** — AS-IS returns all rows |
| **VAL-ATT-WS-CNS-04** | Retire | PATCH `active=false` rồi punch tại tọa độ site cũ | Geofence **không** còn match site retired; soft path OK | BR-PLT-04 · BR-PLT-ATT-WS-05 | **BE GAP** prefer soft over hard DELETE as product retire |
| **VAL-ATT-WS-CNS-05** | GPS method missing lat/lon | gps on · sites >0 · GPS/mobile surface omit lat/lon | **FAIL closed** (FE block và/hoặc BE 4xx) — **FORBIDDEN** silent 201 as PASS | BR-PLT-ATT-WS-07 | **FE/BE GAP** — AS-IS BE silent-skip; GPSAttendance AS-IS sends lat/lon (**RETAIN verify**); manual CNS-03 soft-skip **DOC only** |
| **VAL-ATT-WS-ADM-*** | Admin **ADM-01** | Create N+1 / VAL radius / SITE-404 OOS | Per ATT-DATA/BE | 01d · ATT-04 | **RETAIN** + soft-retire deepen |

### 6.4 must_keep / regression pointers (không AC mới)

| Pointer | Pass | Fail |
|---------|------|------|
| **MK-ATT-LEAVE-01** | ATT-LEAVE-CATALOG GWC retained | Reopen/wipe leave pack |
| **MK-ATT-WAIVE-01** | Leave WAIVE / sign / **J-HRM-06c** **SEAL RETAIN** | Reopen without warrant |
| **MK-ATT-04-01** | AC-PLT-ATT-04 / CFG work-sites CRUD retained | Fake stub regress |
| **MK-GEO-01** | `HRM-ATT-GEO-001` taxonomy retained | Rename wipe / silent accept |
| **MK-SI-CTR-01** | SI type/insurer L1 · CTR · enrollment seals retain | Reopen peers |
| **MK-OPS-SHIFT-01** | `work_shifts` ops lock — not folded | Treat shifts as sites catalog |
| **MK-MOB-PERS-01** | AC-PERS-LOC-01 no raw GPS UUID field invent on mobile UI | Contradict J-MOB-02 lat/lon wire (assert ≠ display UUID) |

### 6.5 Journey / UF map (QA + ba-docs)

| ID | Maps | Notes |
|----|------|-------|
| **Proposed `J-HRM-ATT-WS-CAT-01`** | Admin CREATE N+1 → F5 → GPS punch inside radius (**01d** → **01**) | ba-docs ADD journey after CONFIRM / QA |
| **Proposed `J-HRM-ATT-WS-CAT-02`** | Invent OOS coords → 4xx GEO-001 (**01b**) | |
| **Proposed `J-HRM-ATT-WS-CAT-03`** | active=0 skip geofence + admin still CREATE (**01c**) | U65 no seed |
| **Proposed `J-HRM-ATT-WS-CAT-04`** | Soft-retire active=false → geofence ignores site (**CNS-04**) | |
| Reuse | **J-MOB-02** mobile GPS check-in spot | Geofence assert; retain AC-PERS-LOC-01 |
| Reuse | **J-HRM-06b/06c** sheet/sign | **OUT** · **SEAL RETAIN** — **cấm** reopen / claim UAT |
| Cross-nav U19 | Sites list → edit → F5 · punch after admin create | AC list mutate kèm F5 |

**Persona:** Group CEO `ceo@xe.vn` (rollup) + member HCNS khi test scope 409 — AC ghi rõ scope expect.

---

## 7. Error taxonomy (deterministic)

| Code | When | HTTP | FE |
|------|------|------|-----|
| **`HRM-ATT-GEO-001`** | Consumer OOS coords khi active>0 ∧ gps on ∧ lat/lon present | **4xx** | Banner VI — không toast success |
| **`HRM-ATT-SITE-VAL`** | Admin radius/coords invalid | 4xx | Admin form |
| **`HRM-ATT-SITE-404`** | Admin get/mutate not found / OOS | 404 class | Honest empty/banner |
| **`HRM-ATT-SITE-UNKNOWN`** | Consumer invent `work_site_id` (**HOLD** until surface) | 4xx | **≠** SITE-404 |
| Scope mismatch | Assert company ≠ token scope | 409 class | Honest empty/banner |

**Cấm:** 2xx + OOS coords khi enforce; 500 trên invent; silent 201 GPS method without lat/lon claimed PASS; nhầm SITE-404 với GEO-001.

---

## 8. Honesty / non-claims / seals

| Flag / seal | Rule |
|-------------|------|
| `attendance_uat_ready` | **false** — **DENIED** flip |
| ATT-LEAVE-CATALOG GWC | **SEAL RETAIN** — **DENIED** reopen |
| Leave WAIVE / sign / J-HRM-06c | **SEAL RETAIN** — **DENIED** reopen |
| SI type L1 · SI insurer L1 · CTR · enrollment | **SEAL RETAIN** |
| Module ATT UAT / Phase1 | **DENIED** — slice AC ≠ module GO |
| `payroll_e2e_ready` / printable / personnel | **Unchanged false** — out of seat |
| EMP · DEC · PAY · REC · EXT · LIST-TOTALS | **SEAL RETAIN** |
| `C-SLICE-≠-MODULE` | Work-sites AC pack ≠ module ATT UAT |
| Seed / ensureDefaultWorkSite | **DENIED** (U65 · ADR D3) |
| ba-data | **HOLD** — **no EXPAND** this seat (`site_code` GĐ1.5 only if later prove) |
| Fold into leave / work_shifts catalog | **FORBIDDEN** |

---

## 9. DOC-DELTA flag (optional ba-docs)

| Flag | Need? | Note |
|------|-------|------|
| Client SRS admin vs consumer geofence wording | **OPTIONAL** | FR-UC-BP-ATT-03d đã có GPS sites; ADD-only «SoT = Nest attendance_work_sites; gps_locations ≠ sole SoT; empty = skip no seed» **if** sponsor ambiguity |
| Journey rows J-HRM-ATT-WS-CAT-* | **OPTIONAL** after QA stamp | Map §6.5 · update `PILOT_BUSINESS_FLOW_BA_TRACE` |
| ba-data EXPAND | **NO** | Physical LIVE · no second table |

---

## 10. Handoff expectations

| Role | Expect | Done when |
|------|--------|-----------|
| **pm** | Seal BA CONFIRMED · unlock **dev-be** deepen (soft-retire · list active filter · CNS-05 if needed) then FE verify · QA browser | Bus DISPATCHED |
| **ba-data** | **HOLD** | No Task unless EXPAND reopen (`site_code`) |
| **dev-be** | After BA: soft-retire prefer · list default active · GEO jest retain · **cấm** SITE-UNKNOWN invent without UF · **cấm** ensureDefault | READY_FOR_QA |
| **dev-fe** | Verify GPSAttendance lat/lon retain; Settings Nest bind retain; only fix if JSON sole / GPS omit lat/lon | READY_FOR_QA / idle-ok |
| **qa** | U65 AC-PLT-ATT-WORKSITE-01/01b/01c/01d/01H · zero-seed · no UAT flip · ATT-LEAVE seals untouched | PASS_TO_PM / FAIL |
| **qc** | Slice GWC only · honesty false · seals retain | GWC ≠ module GO |
| **ba-docs** | Optional DOC-DELTA / journey §9 | After PM if flagged |

---

## 11. Open risks / clarifications

| # | Item | Disposition |
|---|------|-------------|
| R1 | Hard DELETE still on API | Product retire path = soft; hard DELETE residual guarded — BE deepen |
| R2 | List returns inactive | BE GAP CNS-03b |
| R3 | Manual clock soft-skip | Documented — **not** GEO PASS evidence |
| R4 | `work_site_id` consumer | HOLD — no UF; do not invent KEY assert |
| R5 | Mobile AC-PERS-LOC-01 vs geofence | Assert lat/lon OK; **cấm** raw UUID site field invent on UI |
| Q1 | Exact live GEO string | BE emits `HRM-ATT-GEO-001` — document in QA evidence |

**Unresolved needing sponsor:** none for Option B AC — architecture LOCKED by SA.

---

## 12. Completion

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **ba-data** | **HOLD** (no EXPAND) |
| **BE** | **UNLOCK** deepen after this BA — soft-retire · list active filter · CNS-05 optional · GEO retain · SITE-UNKNOWN HOLD |
| **next_owner** | **pm** → **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BE-01` |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-ba-01.md` |
