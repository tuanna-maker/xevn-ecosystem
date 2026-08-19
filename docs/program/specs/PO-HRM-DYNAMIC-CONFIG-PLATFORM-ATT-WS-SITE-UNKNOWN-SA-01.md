# PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WS-SITE-UNKNOWN-SA-01 — Option/F.1 · ATT work-site SITE-UNKNOWN residual

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WS-SITE-UNKNOWN-SA-01` |
| **Parent** | [`ATT-WORKSITE-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-FE-ADMIN-NOTES-SA-01.md) **Option A LOCKED** · `R-PLT-ATT-WS-FE-ADMIN-01` HOLD sealed · ATT-WORKSITE QC-02 GWC · **CNS-05 CLOSED** · L1 **`ATTWSQA-MSJC3IN9` RETAIN** · QA-02 **`ATTWSQA2-MSJCG47P`** |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa · **docs-only** · **NO** `apps/**` |
| **change_mode** | **ADD** Option/F.1 disposition for **`HRM-ATT-SITE-UNKNOWN`** / consumer **`work_site_id`** bind surface — **no seed** (U65) · **no wipe** sealed peers |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · **ACCEPT_AS_IS_P2 HOLD** forever-until-sponsor names consumer UF that posts `work_site_id` · ba-process **HOLD** (no new AC pack for GĐ1.5) · BE/FE **HOLD** on SITE-UNKNOWN assert · invent Face LIVE **DENY** · reopen CNS-05 **DENY** · reopen WORKSITE/SHIFT FE-ADMIN as unlock **DENY** |
| **residual_id** | **`R-PLT-ATT-WS-SITE-UNKNOWN-01`** *(minted this seat — dedicated board stamp for consumer `work_site_id` / `HRM-ATT-SITE-UNKNOWN` class; peer cite `R-PLT-ATT-WS-SITE-UNKNOWN` note inside `R-PLT-ATT-WS-FE-ADMIN-01` pack **RETAIN** · not duplicate invent)* |
| **error_code** | **`HRM-ATT-SITE-UNKNOWN`** — reserved for consumer invent `work_site_id` ∉ Nest `attendance_work_sites` when a **named UF surface binds and posts** `work_site_id` on punch or record mutate |
| **Honesty** | `hrm_attendance_uat_ready=false` · `attendance_e2e_linkage_ready=false` · **`C-SLICE-≠-MODULE`** · U65 · **DENIED** module ATT UAT · Phase1 DONE · seed · flip attendance ready · invent SITE-UNKNOWN FAIL as mandatory QA · invent ensureDefaultWorkSite |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option pack §1)

| | |
|--|--|
| **Decision title** | Disposition for ATT **SITE-UNKNOWN** (`HRM-ATT-SITE-UNKNOWN`) after WORKSITE catalog wave + FE-ADMIN NOTES HOLD sealed — ACCEPT_AS_IS HOLD vs unlock BE/FE `work_site_id` consumer bind vs invent SITE-UNKNOWN FAIL / reopen CNS-05 / reopen FE-ADMIN HOLDs / flip attendance UAT |
| **Requestor** | pm · U88 continuous · after `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-FE-ADMIN-NOTES-SA-01` PASS (`R-PLT-ATT-WS-FE-ADMIN-01` · SPEC 61773) |
| **Decision owner** | sa |
| **Related** | Nest `public.attendance_work_sites` SoT (Option B · ADR D3) · GEO-001 / GEO-REQ **LIVE** (lat/lon geofence — **≠** SITE-UNKNOWN) · CNS-05 CLOSED (`check_in_method=gps`) · BA VAL-ATT-WS-CNS-02 **HOLD GĐ1.5** · API_DESIGN SITE-UNKNOWN HOLD · `attendance.service.ts` CODE-MEMORY **no work_site_id assert** · FE grep **no `work_site_id`** on punch path |
| **Template** | `.cursor/templates/ADR_OPTION_TEMPLATE.md` §§1–7 + **§11 F.1** |
| **Board** | `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` row `…-ATT-WS-SITE-UNKNOWN-SA-01` |

### 1.1 Problem — what SITE-UNKNOWN means vs what is already CLOSED

ATT-WORKSITE catalog delivered **Nest SoT** for work sites, **admin CRUD LIVE** on Attendance Settings GPS card, **consumer GPS method wire CLOSED** (CNS-05), and **geofence discipline LIVE** via latitude/longitude + `HRM-ATT-GEO-001` / `HRM-ATT-GEO-REQ`. What remains is a **deferred consumer contract** class, not a defect in admin or GPS punch:

| Concept | AS-IS (proven) | SITE-UNKNOWN class (deferred) |
|---------|----------------|------------------------------|
| **Geofence (GEO-001)** | When `gps_enabled` and active sites >0, punch with coords outside all radii → **`HRM-ATT-GEO-001`** | **LIVE RETAIN** · QA-02 proved wire even when geofence rejects |
| **GPS coords required (GEO-REQ)** | `check_in_method=gps` + enabled + active sites >0 + omit lat/lon → **`HRM-ATT-GEO-REQ`** | **LIVE RETAIN** · CNS-05 CLOSED |
| **Admin site CRUD** | F-ATT-CAT-WS create/update/delete + FE GPS card | **LIVE RETAIN** · packed in `R-PLT-ATT-WS-FE-ADMIN-01` HOLD |
| **Consumer `work_site_id` on punch/record** | **Not bound** — `CreateAttendanceRecordDto` has lat/lon + `check_in_method` · **no** `work_site_id` field | **`HRM-ATT-SITE-UNKNOWN`** reserved when UF posts id ∉ catalog |
| **FE picker / mobile site id** | No `work_site_id` in `apps/web/hrm` grep on consumer paths | GĐ1.5 UF — **HOLD** until sponsor names surface |

**Critical discrimination:**

| Mistake | Truth |
|---------|-------|
| «SITE-UNKNOWN FAIL = GPS geofence broken» | GEO-001 is **separate** · proven LIVE · SITE-UNKNOWN is **id bind** not lat/lon |
| «Must implement SITE-UNKNOWN BE now to close ATT-WORKSITE» | Catalog wave exit = CNS-05 + L1 + DOCS · BA explicitly **HOLD GĐ1.5** for `work_site_id` |
| «Invent SITE-UNKNOWN FAIL in QA without UF» | **DENY** — creates fake FAIL / seed-like assert without FE post path (U65) |
| «Unlock WORKSITE FE-ADMIN to fix SITE-UNKNOWN» | FE-ADMIN **LIVE** · SITE-UNKNOWN is **consumer bind** · **FORBIDDEN** conflate (peer seat sealed) |
| «Reopen CNS-05 because site id missing» | CNS-05 scope = **method + coords** · **CLOSED** · **FORBIDDEN reopen** |

### 1.2 READ-ONLY evidence inventory (no edit)

| Layer | Evidence | Verdict |
|-------|----------|---------|
| **BA** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-ba-01.md` — VAL-ATT-WS-CNS-02 **HOLD GĐ1.5** · `HRM-ATT-SITE-UNKNOWN` consumer invent · `work_site_id` picker HOLD | **RETAIN HOLD** |
| **SA catalog** | ATT-WORKSITE-CATALOG-SA-01 — invent → GEO-001 / SITE-UNKNOWN lock synonym with SITE-404 admin | **RETAIN** |
| **BE CODE-MEMORY** | `attendance.service.ts` — SITE-UNKNOWN HOLD (no work_site_id assert) · GEO-REQ/GEO-001 LIVE | **HOLD RETAIN** |
| **BE admin** | `attendance-config.service.ts` — `HRM-ATT-SITE-404` admin get/mutate · GEO-001 assert · SITE-UNKNOWN HOLD | **RETAIN** |
| **DTO punch** | `create-attendance-record.dto.ts` — lat/lon · check_in_method · **no work_site_id** | **No bind surface** |
| **FE consumer** | `GPSAttendance.tsx` · `useAttendanceRecords` — CNS-05 wire · no work_site_id | **SEAL RETAIN** |
| **FE grep** | `apps/web/hrm` — no consumer `work_site_id` binding | **No closable FE gap without new UF** |
| **QC-02** | `po-hrm-dynamic-config-platform-att-worksite-catalog-qa-02.md` — DENY SITE-UNKNOWN invent FAIL | **RETAIN** |
| **FE-ADMIN seat** | WORKSITE FE-ADMIN NOTES — `R-PLT-ATT-WS-SITE-UNKNOWN` cite inside pack · invent FAIL **DENY** | **Peer RETAIN** · this seat **owns** dedicated residual stamp |

**Audit conclusion:** No **closable** BE/FE gap exists today because **no product surface posts `work_site_id`**. Implementing assert + `HRM-ATT-SITE-UNKNOWN` without UF would be **speculative API** (Option C class) or **invent FAIL** for QA. Residual = **ACCEPT_AS_IS_P2 HOLD** on minted **`R-PLT-ATT-WS-SITE-UNKNOWN-01`**.

### 1.3 Constraints (DENY list)

- Docs-only · **no** `apps/**` · **no** seed (U65)
- **DENY** invent Face LIVE · QR LIVE · ensureDefaultWorkSite · Nest dual work-sites admin
- **DENY** reopen CNS-05 CLOSED · QA-02 `ATTWSQA2-MSJCG47P` · L1 `ATTWSQA-MSJC3IN9` as FAIL
- **DENY** reopen `R-PLT-ATT-WS-FE-ADMIN-01` · `R-PLT-ATT-SHIFT-FE-ADMIN-01` · `R-PLT-ATT-FE-ADMIN-01` **as unlock for SITE-UNKNOWN**
- **DENY** invent SITE-UNKNOWN mandatory QA FAIL · probe-only PASS/FAIL without FE post path
- **DENY** flip `hrm_attendance_uat_ready` · claim module ATT UAT · Phase1 DONE
- **DENY** fold SITE-UNKNOWN into leave/work_shifts/code catalogs
- must_keep: **GEO-001/GEO-REQ LIVE** · **CNS-05 CLOSED** · **Nest SoT** · **SITE-UNKNOWN HOLD** · **honesty false** · **C-SLICE**

### 1.4 Decision heuristic

| Rule | Application |
|------|-------------|
| Consumer UF absent for field X | Do not implement reject code X assert until UF binds X |
| GEO-001 LIVE | Do not treat geofence as SITE-UNKNOWN substitute |
| BA GĐ1.5 HOLD | No ba-process AC pack unlock without sponsor UF message |
| Closable gap = named surface + symptom | Audit: **no surface** → Option A |
| Unlock BE/FE only if sponsor names UF or audit finds bind defect on existing field | Default **pm** not dev-be/dev-fe |

---

## 2. Problem to solve (ADR §2)

- **Current state:** Platform reserves **`HRM-ATT-SITE-UNKNOWN`** for future consumer paths that POST/PATCH a **`work_site_id`** referencing Nest catalog `attendance_work_sites`. Punch path today validates **coordinates** and **check_in_method** only. Admin path validates site existence for admin mutations via **`HRM-ATT-SITE-404`**.
- **Constraints:** U65 FE-only acceptance for UF closure · CNS-05 sealed · WORKSITE FE-ADMIN HOLD sealed · no seed invent ids · honesty flags false.
- **Failure impact if mis-disposed:** Premature BE assert without FE → QA probe FAIL invent · reopen CNS-05 · false attendance UAT claim · duplicate admin work · sponsor trust loss on GWC seals.

---

## 3. Options (ADR §3)

### Option A — ACCEPT_AS_IS_P2 HOLD on `R-PLT-ATT-WS-SITE-UNKNOWN-01` — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Mint board residual **`R-PLT-ATT-WS-SITE-UNKNOWN-01`** = **P2 HOLD** documenting: (1) **`HRM-ATT-SITE-UNKNOWN`** reserved · **not** exercised until consumer UF binds `work_site_id`; (2) **GEO-001/GEO-REQ** remain the **live** geolocation contract for GĐ1; (3) **no** mandatory dev-be/dev-fe Task until sponsor opens GĐ1.5 UF (picker/mobile/explicit API field on punch) **or** audit finds existing surface already posts `work_site_id` but assert missing. **Do not** invent QA FAIL. **Do not** reopen WORKSITE FE-ADMIN. |
| **Benefits** | Matches BA GĐ1.5 · honors QC-02 DENY invent · zero seal churn · clear separation GEO vs SITE-ID · U88 bandwidth · peer consistency with deferred KEY classes |
| **Costs** | Site-level attribution on punch deferred; payroll/audit reports cannot rely on `work_site_id` on record until UF |
| **Risks** | HOLD misread as «never implement» → mitigations **L-ATT-WS-SU-*** · sponsor-gated GĐ1.5 entry in §5.2 |
| **Gate** | No UF · no bind surface · CNS-05 CLOSED · GEO LIVE |

### Option B — UNLOCK BE/FE only if closable bind gap

| | |
|--|--|
| **Description** | Unlock **`dev-be`** to add `work_site_id` to DTO + assert ∈ active catalog → `HRM-ATT-SITE-UNKNOWN` **only when** **`dev-fe`** (or mobile) **already ships** or concurrently ships UF that **posts** `work_site_id` on punch/record with U65 evidence. Optional **`ba-process`** ADD-only AC for GĐ1.5 UF inventory. |
| **Benefits** | Would close end-to-end id bind when sponsor prioritizes site attribution |
| **Costs** | On AS-IS: **no FE post path** → BE-only = dead assert or probe cheat · violates U65 if QA without FE |
| **Risks** | Invent FAIL · reopen CNS-05 · conflate with FE-ADMIN polish · seed ids |
| **Gate** | **Reject as default** — requires sponsor UF message + paired FE/BE dispatch |

### Option C — REJECT invent FAIL / reopen seals / flip UAT / Face / ensureDefault

| | |
| **Description** | Mandate SITE-UNKNOWN QA FAIL now · implement assert without DTO field · reopen CNS-05 · unlock WORKSITE FE-ADMIN as SITE-UNKNOWN fix · invent Face LIVE · ensureDefaultWorkSite · flip attendance ready · Nest dual admin |
| **Benefits** | None for honesty |
| **Costs** | Seal churn · U65 violation · false ready |
| **Risks** | **REJECT** all §1.3 DENY |

---

## 4. Trade-off matrix (ADR §4)

| Criteria | Weight | **A HOLD** | B Unlock bind | C Invent/reopen |
|----------|-------:|----------:|--------------:|----------------:|
| Honesty / no invent FAIL | 5 | **5** | 2 | 0 |
| Seal safety (CNS-05 · L1 · FE-ADMIN HOLDs) | 5 | **5** | 3 | 0 |
| BA GĐ1.5 alignment | 5 | **5** | 4 | 0 |
| U65 FE closure discipline | 4 | **5** | 2 | 0 |
| Business value (true bind gap) | 3 | 2 | **5** *(if UF)* | 1 |
| U88 bandwidth | 4 | **5** | 2 | 0 |
| Complexity / blast radius | 4 | **5** | 3 | 0 |
| **Weighted** | | **≈120** | ≈55 | 3 |

---

## 5. Failure modes and mitigation (ADR §5)

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| **A** | HOLD read as waive forever | PM removes board row without sponsor | **L-ATT-WS-SU-01** Condition KEEP |
| **A** | QA invent SITE-UNKNOWN FAIL via curl | Evidence without click path | **DENY** · U65 · cite this spec |
| **A** | Dispatch dev-be assert-only | Bus dev-be SITE-UNKNOWN without FE | **Reject** · Option B paired only |
| **A** | Reopen CNS-05 for site id | GPS stamp reopen | **L-ATT-WS-SU-05** CNS-05 frozen |
| **A** | Reopen FE-ADMIN HOLD as unlock | WORKSITE polish cited for SITE-UNKNOWN | Cite §1.1 discrimination |
| **B** | BE before FE | DTO field without UI | Sponsor UF + paired Task |
| **C** | Ready flip | honesty matrix | **NO-GO** |

---

## 6. Decision (ADR §6)

| | |
|--|--|
| **Selected** | **Option A** — architecture **LOCKED** |
| **Disposition** | **ACCEPT_AS_IS_P2 HOLD** on **`R-PLT-ATT-WS-SITE-UNKNOWN-01`** |
| **Why A** | No consumer surface posts `work_site_id`; BA VAL-ATT-WS-CNS-02 HOLD GĐ1.5; BE CODE-MEMORY explicitly defers assert; GEO-001/GEO-REQ LIVE covers geofence; CNS-05 CLOSED; WORKSITE FE-ADMIN sealed with SITE-UNKNOWN cite — this seat **formalizes** dedicated residual without invent FAIL or unlock without UF. |
| **Rejected** | **B** default · **C** all DENY |
| **Assumptions** | Sponsor message does not open GĐ1.5 `work_site_id` UF; mobile J-MOB site bind remains OOS unless separately dispatched. |
| **next_owner** | **pm** (not `dev-be` / not `dev-fe`) |

### 6.1 Unlock gates (Option A does not open)

| Question | Answer |
|----------|--------|
| Unlock dev-be assert now? | **HOLD** — no DTO bind · no UF |
| Unlock dev-fe picker now? | **HOLD** — no sponsor UF |
| Unlock ba-process GĐ1.5 pack? | **HOLD** — until sponsor names UF |
| Invent SITE-UNKNOWN QA FAIL? | **FORBIDDEN** |
| Reopen CNS-05 / L1 / DOCS? | **FORBIDDEN** |
| Reopen WORKSITE/SHIFT/CODE FE-ADMIN? | **FORBIDDEN** as SITE-UNKNOWN unlock |
| Flip attendance UAT ready? | **NO** |

### 6.2 Sponsor-gated GĐ1.5 entry (narrow — not default)

```text
entry: sponsor message explicitly opens «GĐ1.5 ATT work_site_id UF»
       (e.g. punch picker · mobile check-in site · record detail bind)
       AND names persona + menu + field posting work_site_id
retain: CNS-05 CLOSED · GEO-001/GEO-REQ · Nest SoT · R-PLT-ATT-WS-FE-ADMIN-01 HOLD
        · honesty false · U65 browser proof
sequence:
  1) ba-process ADD-only AC inventory (VAL-ATT-WS-CNS-02 promote from HOLD)
  2) ba-data optional KEY/site_code if in scope — separate dispatch
  3) dev-fe: bind picker/post work_site_id on named surface
  4) dev-be: DTO + assert active catalog → HRM-ATT-SITE-UNKNOWN when ∉ catalog
  5) qa: U65 FE post → 4xx HRM-ATT-SITE-UNKNOWN on invent id · F5 RETAIN
FORBIDDEN: BE-only assert · seed ids · reopen CNS-05 · probe-only PASS
exit: R-PLT-ATT-WS-SITE-UNKNOWN-01 may narrow/CLOSE per QC; honesty false RETAIN
```

### 6.3 Architecture boundary (text diagram)

```text
  Nest attendance_work_sites (SoT)     --> LIVE admin + list (F-ATT-CAT-WS)
  Punch lat/lon + check_in_method      --> LIVE GEO-001 / GEO-REQ (CNS-05 CLOSED)
  Punch work_site_id field             --> ABSENT on DTO + FE (GĐ1.5 HOLD)
  HRM-ATT-SITE-404                     --> LIVE admin mutate not-found
  HRM-ATT-SITE-UNKNOWN                 --> RESERVED · assert HOLD until UF binds id
  R-PLT-ATT-WS-SITE-UNKNOWN-01         --> ACCEPT_AS_IS_P2 HOLD (this seat)
  R-PLT-ATT-WS-FE-ADMIN-01           --> HOLD RETAIN (orthogonal FE-ADMIN pack)
  hrm_attendance_uat_ready             --> false · C-SLICE
```

---

## 7. Implementation and validation plan (ADR §7)

- **Rollout:** PM seals **`R-PLT-ATT-WS-SITE-UNKNOWN-01`** on W8 board · no execution Task · update honesty matrix RETAIN false.
- **Rollback:** N/A (docs disposition only).
- **Validation checkpoints:** SPEC_LEN ≥8192 NFD; Option A LOCKED; residual minted; DENY lines explicit.
- **Success criteria:** PM accepts PASS_TO_PM · no dev-be/dev-fe dispatch for SITE-UNKNOWN until §6.2.

---

## 8. Locks (L-ATT-WS-SU-*)

| Lock | Rule |
|------|------|
| **L-ATT-WS-SU-01** | HOLD ≠ WAIVED · ACCEPT_AS_IS_P2 keeps Condition on board |
| **L-ATT-WS-SU-02** | **FORBIDDEN** invent SITE-UNKNOWN QA FAIL without FE post path |
| **L-ATT-WS-SU-03** | **FORBIDDEN** BE-only `work_site_id` assert without paired FE UF |
| **L-ATT-WS-SU-04** | GEO-001/GEO-REQ **LIVE** — do not regress geofence under SITE-UNKNOWN narrative |
| **L-ATT-WS-SU-05** | CNS-05 CLOSED frozen — **FORBIDDEN** reopen for site id |
| **L-ATT-WS-SU-06** | WORKSITE/SHIFT/CODE FE-ADMIN HOLD — **FORBIDDEN** reopen as SITE-UNKNOWN unlock |
| **L-ATT-WS-SU-07** | **FORBIDDEN** ensureDefaultWorkSite · Face LIVE · Nest dual admin |
| **L-ATT-WS-SU-08** | Honesty false · C-SLICE · **FORBIDDEN** flip attendance module UAT |
| **L-ATT-WS-SU-09** | Admin **HRM-ATT-SITE-404** ≠ consumer **HRM-ATT-SITE-UNKNOWN** — do not merge codes |
| **L-ATT-WS-SU-10** | Path lock UTF-8 no BOM NFD canonical tree |

---

## 9. Impacted systems and dependencies

| System | Impact |
|--------|--------|
| `hrm-api` attendance punch | **No change** — HOLD assert |
| `hrm-api` attendance-config admin | **RETAIN** SITE-404 · GEO assert |
| Web HRM GPS consumer | **RETAIN** CNS-05 seal |
| Mobile punch | **OOS** unless J-MOB UF separately opened |
| BA AC pack | **HOLD** GĐ1.5 until sponsor |
| QC honesty matrix | **RETAIN** false · SITE-UNKNOWN row HOLD |
| Peer `R-PLT-ATT-WS-FE-ADMIN-01` | **RETAIN** — sub-note cite not replaced |

---

## 10. Peer seal RETAIN (FORBIDDEN reopen)

| Seal | Id / stamp | Action |
|------|------------|--------|
| CNS-05 GPS method wire | `ATTWSQA2-MSJCG47P` | RETAIN |
| L1 work-sites + GEO | `ATTWSQA-MSJC3IN9` | RETAIN |
| DOCS SRS v0.30 CH05b | ACCEPT | RETAIN |
| DATA EXPAND soft-retire | CONFIRMED | RETAIN |
| WORKSITE FE-ADMIN HOLD | `R-PLT-ATT-WS-FE-ADMIN-01` | RETAIN |
| SHIFT/CODE/OT/COMP FE-ADMIN | peer HOLD packs | RETAIN |
| VAL-ATT-WS-CNS-02 GĐ1.5 | ba HOLD | RETAIN until §6.2 |

---

## 11. F.1 API / DB disposition notes (governance — no physical unlock)

| Layer | Disposition |
|-------|-------------|
| **DB** | No schema change for SITE-UNKNOWN seat · `attendance_work_sites` RETAIN · optional future column on `attendance_records.work_site_id` **not opened** without ba-data + sponsor |
| **API admin** | F-ATT-CAT-WS **RETAIN LIVE** · `HRM-ATT-SITE-404` on admin OOS id |
| **API consumer punch** | GEO-001 · GEO-REQ **RETAIN** · **`work_site_id` not in DTO** · **`HRM-ATT-SITE-UNKNOWN` assert HOLD** |
| **API_DESIGN** | Function SITE-UNKNOWN documented as HOLD — mục đích: reject consumer invent site id when UF posts; tham chiếu SRS GĐ1.5 deferred |
| **FE** | No picker · no post · **HOLD** |
| **F.1 completeness** | Disposition **complete** for residual class; physical API+FE **deferred** to GĐ1.5 sponsor wave |

### 11.1 F.1 function map (disposition)

| Function | Path / trigger | Mục đích (VI) | Nghiệp vụ xử lý (BE) | Tham chiếu SRS/BA | Disposition |
|----------|----------------|---------------|----------------------|-------------------|-------------|
| F-ATT-CAT-WS-01 | GET work-sites | Liệt kê điểm làm việc admin | Scope + active filter | CH05b | **RETAIN LIVE** |
| F-ATT-PUNCH-GEO-001 | POST records + coords | Geofence ngoài vùng | assertWithinWorkSite | VAL-ATT-WS | **RETAIN LIVE** |
| F-ATT-PUNCH-GEO-REQ | POST gps omit coords | Bắt buộc tọa độ GPS | HRM-ATT-GEO-REQ | CNS-05 | **RETAIN LIVE** |
| F-ATT-PUNCH-SITE-ID | POST/PATCH `work_site_id` | Từ chối id không thuộc catalog | Lookup active site → else UNKNOWN | VAL-ATT-WS-CNS-02 GĐ1.5 | **HOLD** — no DTO field |
| SITE-UNKNOWN | Consumer invent id | Báo lỗi nghiệp vụ site lạ | `HRM-ATT-SITE-UNKNOWN` | BA ba-01 | **HOLD RETAIN** |
| SITE-404 admin | Admin mutate | Site admin không tồn tại | `HRM-ATT-SITE-404` | Admin path | **RETAIN LIVE** |

### 11.2 Error taxonomy (must_keep)

| Code | Layer | When | This seat |
|------|-------|------|-----------|
| `HRM-ATT-GEO-001` | Consumer punch | Coords OOS geofence | **LIVE** · ≠ SITE-UNKNOWN |
| `HRM-ATT-GEO-REQ` | Consumer punch | GPS method missing coords | **LIVE** · ≠ SITE-UNKNOWN |
| `HRM-ATT-SITE-404` | Admin CRUD | Admin id not found | **LIVE** · admin only |
| `HRM-ATT-SITE-VAL` | Admin CRUD | Invalid radius/coords | **LIVE** |
| `HRM-ATT-SITE-UNKNOWN` | Consumer punch/record | Posted `work_site_id` ∉ catalog | **HOLD** until UF |

---

## 12. References

| Artifact | Role |
|----------|------|
| [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-FE-ADMIN-NOTES-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-FE-ADMIN-NOTES-SA-01.md) | Parent seal · peer SITE-UNKNOWN cite |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-ba-01.md` | GĐ1.5 HOLD · VAL-ATT-WS-CNS-02 |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-qa-02.md` | DENY SITE-UNKNOWN invent |
| `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` | Board row |
| `apps/api/hrm-api/src/attendance/dto/create-attendance-record.dto.ts` | READ-ONLY — no work_site_id |
| `apps/api/hrm-api/src/attendance/attendance.service.ts` | READ-ONLY — SITE-UNKNOWN HOLD comment |
| `.cursor/templates/ADR_OPTION_TEMPLATE.md` | Template §1–7 |

---

## 13. Handback (completion contract)

| Field | Value |
|-------|--------|
| **selected_option** | **Option A** — **ACCEPT_AS_IS_P2 HOLD** |
| **residual** | **`R-PLT-ATT-WS-SITE-UNKNOWN-01` = HOLD** (minted) |
| **next_owner** | **pm** |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **evidence_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WS-SITE-UNKNOWN-SA-01.md` |

### completion_report

**Closed:** SA Option/F.1 for ATT **SITE-UNKNOWN** (`HRM-ATT-SITE-UNKNOWN`) after WORKSITE FE-ADMIN NOTES HOLD sealed — READ-ONLY audit confirms **no consumer `work_site_id` bind** on punch DTO or FE paths; GEO-001/GEO-REQ **LIVE** and **orthogonal**; BA GĐ1.5 **HOLD**; CNS-05 **CLOSED**; **no closable BE/FE gap** without sponsor UF. Option **A LOCKED**; minted **`R-PLT-ATT-WS-SITE-UNKNOWN-01`** HOLD; **DENY** invent FAIL · reopen CNS-05 · reopen FE-ADMIN HOLDs · Face · ensureDefault · flip attendance ready. Docs-only · no `apps/**`.

**Open / residual:** `R-PLT-ATT-WS-SITE-UNKNOWN-01` remains **HOLD P2** until sponsor §6.2 GĐ1.5 UF; honesty flags **false**; **C-SLICE**.

**RETAIN:** CNS-05 · L1 · DOCS · DATA EXPAND · GEO LIVE · `R-PLT-ATT-WS-FE-ADMIN-01` · SHIFT/CODE FE-ADMIN HOLDs · VAL-ATT-WS-CNS-02 HOLD.

### next_dispatch_prompt (copy-ready for PM)

```text
work_item_id: PO-HRM-CONTINUOUS-W8-PM-SEAL-SITE-UNKNOWN-01
from_role: pm
to_role: pm
lane: governance
action: Seal SA PASS PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WS-SITE-UNKNOWN-SA-01 on W8 board — stamp R-PLT-ATT-WS-SITE-UNKNOWN-01 ACCEPT_AS_IS_P2 HOLD · honesty false RETAIN · C-SLICE
entry_criteria: evidence_path docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WS-SITE-UNKNOWN-SA-01.md SPEC_LEN>=8192 · Option A LOCKED
exit_criteria: bus INTAKE + TEAM_WORKING_NOW row closed DISPATCHED→DONE for SA seat · no dev-be/dev-fe Task for SITE-UNKNOWN unless sponsor opens GĐ1.5 UF (§6.2)
next_vertical: U88 governance — sa/ba-process for next ATT catalog residual OR platform vertical per PO_HRM_CONTINUOUS_W8_20260807.md (not SITE-UNKNOWN execution)
cấm: invent SITE-UNKNOWN QA FAIL · dispatch dev-be assert-only · reopen CNS-05 · reopen WORKSITE FE-ADMIN as unlock
evidence: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WS-SITE-UNKNOWN-SA-01.md
```