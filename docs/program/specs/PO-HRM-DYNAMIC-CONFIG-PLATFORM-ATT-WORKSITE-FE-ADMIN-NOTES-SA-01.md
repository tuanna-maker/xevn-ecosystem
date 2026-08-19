# PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-FE-ADMIN-NOTES-SA-01 — Option/F.1 · ATT work-sites FE-ADMIN notes residual

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-FE-ADMIN-NOTES-SA-01` |
| **Parent** | ATT-WORKSITE-CATALOG-QC-02 **GWC SEALED** · **CNS-05 CLOSED** · QA-02 **`ATTWSQA2-MSJCG47P`** · L1 **`ATTWSQA-MSJC3IN9` RETAIN** · DOCS **ACCEPT** SRS **v0.30** · **CH05b** · DATA **EXPAND soft-retire CONFIRMED** |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa · **docs-only** · **NO** `apps/**` |
| **change_mode** | **ADD** Option/F.1 disposition for **ATT work-sites FE-ADMIN notes** residual after GPS consumer CNS-05 CLOSED · **no seed** (U65) · **no wipe** sealed peers · **no reopen** ATT-SHIFT / CODE/OT/COMP FE-ADMIN HOLDs |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · **ACCEPT_AS_IS_P2 HOLD** forever-until-sponsor · ba-process **HOLD** (no new AC pack) · FE/BE **HOLD** · invent Nest dual work-sites admin **DENY** · reopen CNS-05 CLOSED **DENY** · reopen ATT-SHIFT / CODE/OT/COMP FE-ADMIN HOLD as unlock **DENY** · invent SITE-UNKNOWN FAIL **DENY** |
| **residual_id** | **`R-PLT-ATT-WS-FE-ADMIN-01`** *(minted this seat — consolidates Nest `attendance_work_sites` Attendance Settings GPS FE-ADMIN LIVE notes + gps_locations JSON REF-deny notes + SITE-UNKNOWN HOLD RETAIN note)* |
| **prior_consumer_fe** | ATT-WORKSITE-CATALOG-FE-01 READY · QA-02 **PASS** `ATTWSQA2-MSJCG47P` · QC-02 **GWC** · **CNS-05 CLOSED** (`R-PLT-ATT-WS-FE-CNS-05` · GPSAttendance `check_in_method=gps`) — **FORBIDDEN reopen** |
| **prior_l1** | ATT-WORKSITE-CATALOG-QA-01 **PASS** `ATTWSQA-MSJC3IN9` · QC-01 GWC L1 SEAL — **RETAIN** |
| **prior_docs** | ATT-WORKSITE-CATALOG-DOCS-01 **ACCEPT** SRS v0.30 CH05b — **RETAIN** |
| **prior_data** | ATT-WORKSITE-CATALOG-DATA-01 **CONFIRMED EXPAND** soft-retire · no second table — **RETAIN** |
| **prior_catalog** | ATT-WORKSITE-CATALOG-SA-01 **CONFIRMED** Option **B** Nest `public.attendance_work_sites` SoT · BA AC-PLT-ATT-WORKSITE-01* · BE soft-retire + GEO-001/GEO-REQ — **SEAL RETAIN** |
| **peer_cite_hold_live** | [`ATT-SHIFT-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-FE-ADMIN-NOTES-SA-01.md) **Option A · `R-PLT-ATT-SHIFT-FE-ADMIN-01`** (SPEC 53359 · LIVE class) · [`DEC-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-ADMIN-NOTES-SA-01.md) **Option A · `R-PLT-DEC-FE-ADMIN-01`** (SPEC 61534) · [`REC-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-ADMIN-NOTES-SA-01.md) · [`PAY-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-FE-ADMIN-NOTES-SA-01.md) · [`SI-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-FE-ADMIN-NOTES-SA-01.md) — **cite class (LIVE twin pack)** |
| **peer_cite_hold_absent_contrast** | [`ATT-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01.md) **Option A · `R-PLT-ATT-FE-ADMIN-01`** (SPEC 31734 · CODE/OT/COMP **ABSENT** admin) — **cite pack structure only · FORBIDDEN reopen as unlock · FORBIDDEN fold WORKSITE into CODE/OT/COMP pack** |
| **peer_cite_consumer** | GPSAttendance Nest wire CNS-05 CLOSED (`ATTWSQA2-MSJCG47P`) · ATT-SHIFT CNS-02 CLOSED (`ATTSHIFTQAFE-MSK6AJ8Z`) **cite peer CLOSED · do not invent reopen** · → **≠** this residual class |
| **SITE-UNKNOWN** | **`HRM-ATT-SITE-UNKNOWN` HOLD RETAIN** — cite board/BE/DOCS note only · **FORBIDDEN invent unlock / invent FAIL** (consumer `work_site_id` surface not bound) |
| **Honesty** | `hrm_attendance_uat_ready=false` · `attendance_e2e_linkage_ready=false` · `payroll_e2e_ready=false` · `contracts_printable_ready=false` · **`C-SLICE-≠-MODULE`** · U65 · **DENIED** module ATT UAT · Phase1 DONE · seed · flip attendance ready · invent Nest dual work-sites admin · invent LVRULE · reopen ATT-SHIFT/CODE/OT/COMP FE-ADMIN HOLD as unlock · reopen CNS-05 · invent SITE-UNKNOWN FAIL |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option pack)

| | |
|--|--|
| **Decision title** | Disposition for ATT **work-sites FE-ADMIN notes** after ATT-WORKSITE catalog wave (Nest SoT LIVE · Attendance Settings GPS admin CRUD LIVE · CNS-05 CLOSED · L1 invent/GEO RETAIN · DOCS CH05b ACCEPT · DATA soft-retire EXPAND) — ACCEPT_AS_IS HOLD vs unlock FE-ADMIN deepen vs invent Nest dual / reopen CNS-05 / reopen SHIFT·CODE·OT·COMP FE-ADMIN / invent SITE-UNKNOWN FAIL |
| **Requestor** | pm · U88 continuous · after ATT-SHIFT-FE-ADMIN-NOTES-SA-01 Option A HOLD sealed (`R-PLT-ATT-SHIFT-FE-ADMIN-01` · SPEC 53359) · ATT-WORKSITE QC-02 GWC · CNS-05 CLOSED |
| **Decision owner** | sa |
| **Related** | Nest `public.attendance_work_sites` SoT LIVE (Option B · ADR D3) · Attendance Settings **GPS** FE-ADMIN LIVE (`useAttendanceRules` · `att-gps-sites-card` · create/update/delete) · `attendance_rules.gps_locations` JSON **DENY sole SoT** · consumer GPSAttendance CNS-05 SEAL · invent GEO-001/GEO-REQ · soft-retire deepen · SITE-UNKNOWN HOLD · ATT-SHIFT FE-ADMIN HOLD peer (LIVE twin) · ATT CODE/OT/COMP FE-ADMIN HOLD peer (ABSENT contrast) · LVRULE 01g HOLD |
| **Template** | `.cursor/templates/ADR_OPTION_TEMPLATE.md` §§1–7 + F.1 notes |
| **Board** | `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` row `…-ATT-WORKSITE-FE-ADMIN-NOTES-SA-01` **DISPATCHED** |

### 1.1 Problem — what residual remains after ATT-WORKSITE CNS-05 CLOSED

ATT-WORKSITE catalog consumer FE Condition **CNS-05** is **CLOSED**: QA-02 U65 browser GPSAttendance POST `check_in_method=gps` + lat/lon **PASS** (`ATTWSQA2-MSJCG47P`) · QC-02 **GWC SEALED**. Catalog Option B Nest SoT (`public.attendance_work_sites`) is **LOCKED** (ATT-WORKSITE-CATALOG-SA/BA/BE/DATA). L1 soft-retire + GEO invent `ATTWSQA-MSJC3IN9` **RETAIN**. DOCS SRS v0.30 CH05b **ACCEPT**. DATA EXPAND soft-retire **CONFIRMED**. What remains is **not** another closable consumer GPS-method residual — it is the **FE-ADMIN notes pack class** for the **WORKSITE catalog alone** (orthogonal to ATT-SHIFT FE-ADMIN HOLD already sealed · orthogonal to ATT CODE/OT/COMP FE-ADMIN ABSENT pack):

| Residual / note | Severity | Surface inventory (AS-IS) | Proven already (RETAIN) |
|-----------------|----------|---------------------------|-------------------------|
| **`R-PLT-ATT-WS-ADM-FE`** | **P2 HOLD NOTE** | Nest «Điểm làm việc / vùng GPS» **FE-ADMIN LIVE** on Attendance → Settings → **Ứng dụng / GPS** card — `Attendance.tsx` mounts `att-gps-sites-card` · `att-gps-add-open` · `att-gps-*-dialog` · `useAttendanceRules` CRUD (`listAttendanceWorkSites` / `createAttendanceWorkSite` / `updateAttendanceWorkSite` / `deleteAttendanceWorkSite`) · admin open N+1 AC-PLT-ATT-WORKSITE-01d class | Nest work-sites L1 + GEO · GPS card CRUD LIVE · DOCS CH05b |
| **`R-PLT-ATT-WS-JSON-REF`** | **P2 HOLD NOTE** | UI state field `gps_locations[]` on rules form = **display merge of Nest work-sites** — **FORBIDDEN** PATCH `attendance_rules.gps_locations` JSON as sole SoT (ADR D3 · BR-PLT · L-ATT-WS) | ADR D3 · must_keep · BA REF lock |
| **`R-PLT-ATT-WS-SITE-UNKNOWN`** | **P2 HOLD NOTE RETAIN** | Consumer invent `work_site_id` ∉ catalog → `HRM-ATT-SITE-UNKNOWN` — **HOLD until surface binds id** (DOCS/API/DB cite) · **≠** closable FE-ADMIN mount gap · **≠** unlock trigger | BE/DOCS SITE-UNKNOWN HOLD · QC-02 RETAIN |
| **`R-PLT-ATT-WS-FE-ADMIN-01`** *(mint this seat)* | **P2 HOLD NOTE pack** | **Consolidation** of the rows above into one board residual for U88 continuity · **does not** invent new product surface · **does not** reopen CNS-05 · **does not** reopen ATT-SHIFT/CODE/OT/COMP FE-ADMIN HOLD · **does not** invent SITE-UNKNOWN FAIL | QC-02 GWC · CNS-05 CLOSED · L1 RETAIN · DOCS ACCEPT · DATA EXPAND |

**Critical discrimination vs ATT CODE/OT/COMP FE-ADMIN ABSENT and vs ATT-SHIFT/DEC/REC/SI/PAY LIVE:**

| Catalog family | FE-ADMIN mount | FE-ADMIN persist client | Consumer FE / picker | Residual class this seat |
|----------------|----------------|-------------------------|----------------------|--------------------------|
| **ATT** CODE/OT/COMP | **ABSENT** (GET `listEffective*` only) | **ABSENT** create/update client | CLOSED | HOLD = deepen ABSENT Nest admin until sponsor — **OUT of this seat** (already packed in `R-PLT-ATT-FE-ADMIN-01`) |
| **ATT** work_shifts | Attendance tab **Ca** **LIVE** | `useWorkShifts` CRUD **LIVE** | CNS-02 CLOSED | HOLD LIVE twin — **OUT** (`R-PLT-ATT-SHIFT-FE-ADMIN-01` HOLD · **FORBIDDEN reopen**) |
| **ATT** WORKSITE | Attendance Settings **GPS** card **LIVE** (`att-gps-sites-card`) | `createAttendanceWorkSite` / `updateAttendanceWorkSite` / `deleteAttendanceWorkSite` **LIVE** via `useAttendanceRules` | CNS-05 CLOSED (`ATTWSQA2-MSJCG47P`) | HOLD = **no closable mount/persist gap** — NOTE pack (**SHIFT/DEC/REC/SI/PAY-class inventory**) |
| **DEC** decision-types | Settings tab **LIVE** | upsert/retire **LIVE** | CLOSED | HOLD LIVE twin cite |
| **EMP** ST Nest | **ABSENT** Nest ST admin | Network L1 only | CLOSED | HOLD ABSENT contrast cite only |

**Discrimination (must not confuse with consumer UNLOCK / CNS-05 reopen / SHIFT·CODE·OT·COMP FE-ADMIN unlock):**

| Class | When used | ATT work-sites | This seat (FE-ADMIN notes) |
|-------|-----------|----------------|----------------------------|
| **Consumer GPS CNS-05** | Nest SoT + GEO invent + FE `check_in_method=gps` wire | FE-01 → QA-02 `ATTWSQA2-MSJCG47P` → **QC-02 GWC** · **CNS-05 CLOSED** | **OUT** — already SEALED — **FORBIDDEN reopen** |
| **FE-ADMIN / deepen ABSENT Nest admin panel** | Network L1 OK · product Nest admin CRUD FE OUT | **NOT WORKSITE AS-IS** — GPS card admin **LIVE** | Cite CODE/OT/COMP peer class only for *pack structure contrast* — WORKSITE audit → LIVE |
| **FE-ADMIN LIVE + no mount/persist gap** | GPS card mount + CRUD wire + L1/browser admin CREATE proven | Admin shipped · AC-PLT-ATT-WORKSITE-01d class | **THIS residual** → Option **A ACCEPT_AS_IS_P2 HOLD** |
| **gps_locations JSON REF-deny** | Display merge · PATCH JSON sole SoT DENY | REF-deny RETAIN (ADR D3) | **NOTE RETAIN** — **≠** closable FE-ADMIN mount gap — **≠** unlock trigger · **≠** sole SoT |
| **SITE-UNKNOWN HOLD** | Consumer `work_site_id` invent when surface binds id | HOLD RETAIN on board | **NOTE RETAIN** — **FORBIDDEN invent unlock / invent FAIL** |
| **Invent / reopen / flip** | Invent second Nest work-sites admin · reopen CNS-05 · reopen SHIFT/CODE/OT/COMP FE-ADMIN as unlock · invent LVRULE · invent SITE-UNKNOWN FAIL · flip attendance ready | REJECT | **Option C REJECT** |

**Board audit (closable consumer FE still OPEN? closable FE-ADMIN mount/persist gap?)**

| Candidate | Board / seal | Verdict for this seat |
|-----------|--------------|------------------------|
| ATT-WORKSITE consumer CNS-05 GPS method wire | QC-02 GWC · `ATTWSQA2-MSJCG47P` · **CNS-05 CLOSED** | **SEALED** — **FORBIDDEN reopen** |
| ATT-WORKSITE L1 soft-retire + GEO | `ATTWSQA-MSJC3IN9` · QC-01 GWC | **SEALED** — RETAIN |
| ATT-WORKSITE DOCS SRS v0.30 CH05b | DOCS-01 ACCEPT | **RETAIN** |
| ATT-WORKSITE-CATALOG-DATA-01 EXPAND soft-retire | CONFIRMED · no second table | **RETAIN** |
| ATT-WORKSITE-CATALOG-SA/BA/BE Option B | CONFIRMED · Nest SoT | **RETAIN** — not reopen |
| Nest work-sites FE-ADMIN mount Attendance GPS | `Attendance.tsx` Settings GPS · `data-testid="att-gps-sites-card"` · `att-gps-add-open` · `useAttendanceRules` enabled | **LIVE** — **no mount gap** |
| Nest work-sites FE-ADMIN persist | `hrmApi` `createAttendanceWorkSite` / `updateAttendanceWorkSite` / `deleteAttendanceWorkSite` · hook add/update/remove GPS | **LIVE** — **no persist gap** |
| `gps_locations` JSON | Display merge · dual-write DENY | **REF-deny RETAIN** — DENY sole SoT |
| SITE-UNKNOWN | HOLD on board / API_DESIGN / DB_DESIGN | **HOLD RETAIN** — cite only · **do not invent unlock** |
| ATT-SHIFT FE-ADMIN pack | `R-PLT-ATT-SHIFT-FE-ADMIN-01` HOLD (SPEC 53359) | **HOLD RETAIN** — **FORBIDDEN reopen as unlock** |
| ATT CODE/OT/COMP FE-ADMIN pack | `R-PLT-ATT-FE-ADMIN-01` HOLD (SPEC 31734) | **HOLD RETAIN** — **FORBIDDEN reopen as unlock** · **FORBIDDEN fold WORKSITE into that pack** |
| LVRULE FE-01g | ACCEPT_AS_IS_P2 HOLD | **HOLD RETAIN** — DENY invent unlock |
| DEC/REC/PAY/SI FE-ADMIN packs | HOLD LIVE class peers | **HOLD RETAIN** — twin LIVE cite |

**Conclusion:** No named closable **ATT-WORKSITE consumer** residual remains OPEN (CNS-05 CLOSED). READ-ONLY audit finds **no closable FE-ADMIN mount/persist gap** (Attendance Settings GPS `att-gps-sites-card` mounted + Nest CRUD clients wired via `useAttendanceRules`). SITE-UNKNOWN remains **HOLD RETAIN** (not closable FE-ADMIN gap). Residual class = **FE-ADMIN notes pack after LIVE admin + consumer CNS SEAL** → prefer Option **A** — residual stays **HOLD** (not UNLOCK to `dev-fe`).

### 1.2 READ-ONLY apps/web audit (cited — no edit)

| Surface | Path | Kind | Verdict |
|---------|------|------|---------|
| Nest work-sites list client | `apps/web/hrm/src/integrations/hrmApi.ts` — `listAttendanceWorkSites` (~5634) → `GET /api/hrm/attendance/work-sites` | GET F-ATT-CAT-WS-01 admin list | **LIVE** RETAIN |
| Nest work-sites admin persist clients | `hrmApi.ts` — `createAttendanceWorkSite` (~5643 · POST) · `updateAttendanceWorkSite` (~5655 · PATCH) · `deleteAttendanceWorkSite` (~5673 · DELETE) | FE-ADMIN persist client | **LIVE** |
| Nest work-sites type | `hrmApi.ts` — `HrmWorkSiteRow` (~5624) | DTO display | **LIVE** |
| Admin CRUD hook | `apps/web/hrm/src/hooks/useAttendanceRules.ts` — `addGPSLocation` / `updateGPSLocation` / `removeGPSLocation` → Nest create/update/delete · callers Attendance.tsx | FE-ADMIN mutate | **LIVE mount+persist** |
| Rules merge map | `useAttendanceRules.ts` — `mapWorkSiteRow` · `listAttendanceWorkSites` into `gps_locations` display | Display merge ≠ JSON SoT | **LIVE** · DENY JSON sole SoT |
| Attendance GPS FE-ADMIN shell | `apps/web/hrm/src/pages/Attendance.tsx` — Settings GPS card (~2458) · `data-testid="att-gps-sites-card"` · `att-gps-add-open` (~2469) · `att-gps-row-*` · `att-gps-edit-*` · `att-gps-remove-*` · `att-gps-add-dialog` / `att-gps-edit-dialog` · submit (~2618) · save path `addGPSLocation`/`updateGPSLocation` (~1870–1872) | product admin route | **MOUNTED LIVE** |
| Consumer GPS punch | `apps/web/hrm/src/components/attendance/GPSAttendance.tsx` — `check_in_method: 'gps'` + lat/lon on checkIn | Nest punch CNS-05 SEAL | SEAL RETAIN |
| Consumer payload builder | `apps/web/hrm/src/hooks/useAttendanceRecords.ts` — `buildAttendanceCheckInApiPayload` forwards `check_in_method` | CNS-05 wire | SEAL RETAIN |
| Consumer vitest | `apps/web/hrm/src/hooks/useAttendanceRecords.test.ts` — CNS-05 `check_in_method` cases · GPSAttendance source regex | regression | RETAIN |
| Settings MD worksite bucket | `apps/web/hrm/src/lib/mdBucketRegistry.ts` | **ABSENT** worksite/gps bucket (grep no match) | **N/A** — Nest Attendance GPS is SoT · **≠** Settings sole SoT gap |
| Face / QR honesty | Attendance Face GĐ1 HOLD · PROP-03e QR SKIP | honesty HOLD | RETAIN · ≠ GPS admin gap |

**Audit finding (unlock gate):** Unlike ATT CODE/OT/COMP (GET `listEffective*` **only**, **no** create/update admin client, **no** admin panel) — which remain packed under **`R-PLT-ATT-FE-ADMIN-01` HOLD ABSENT** — ATT **work-sites** ships **full FE-ADMIN path**: Attendance Settings GPS card mount + `useAttendanceRules` CRUD + Nest create/update/delete clients. Consumer CNS-05 already proved GPS method wire + GEO invent discipline. `gps_locations` is **display merge**, not a missing Nest admin. SITE-UNKNOWN is **HOLD RETAIN** (consumer id-bind surface), **not** a FE-ADMIN mount/persist defect. Soft empty CTA `att-gps-add-open` RETAIN (U65 no ensureDefault). **No closable FE-ADMIN mount/persist gap** → Option A HOLD · **do not** `next_owner=dev-fe`.

### 1.3 Constraints

- Docs-only · **no** `apps/**` · **no** seed (U65)
- **DENY** invent Nest dual work-sites admin FE as *new* mandatory continuous Task (admin already LIVE on Attendance GPS — invent would be dual/polish without sponsor)
- **DENY** reopen CNS-05 CLOSED · reopen QA-02 `ATTWSQA2-MSJCG47P` · reopen L1 `ATTWSQA-MSJC3IN9` as FAIL · reopen DOCS CH05b ACCEPT · reopen DATA EXPAND
- **DENY** reopen ATT-SHIFT FE-ADMIN HOLD (`R-PLT-ATT-SHIFT-FE-ADMIN-01`) **as unlock**
- **DENY** reopen ATT CODE/OT/COMP FE-ADMIN HOLD (`R-PLT-ATT-FE-ADMIN-01`) **as unlock** · fold WORKSITE residual into CODE/OT/COMP ABSENT invent
- **DENY** invent SITE-UNKNOWN FAIL / invent SITE-UNKNOWN unlock (HOLD RETAIN cite only)
- **DENY** invent LVRULE 01g unlock · `gps_locations` JSON sole SoT · invent Face LIVE / ensureDefaultWorkSite
- **DENY** flip `hrm_attendance_uat_ready` · `attendance_e2e_linkage_ready` · `payroll_e2e_ready` · `contracts_printable_ready`
- **DENY** claim module ATT UAT · Phase1 DONE · UF 🟢 whole attendance pillar
- BA AC packs for ATT-WORKSITE **already locked** (ATT-WORKSITE-CATALOG-BA-01) · this seat is **disposition**, not redefine Nest Option B SoT
- must_keep: **QC-02 GWC · CNS-05 CLOSED** · **L1 `ATTWSQA-MSJC3IN9`** · **Nest `attendance_work_sites` SoT** · **Attendance GPS FE-ADMIN LIVE** · **gps_locations JSON DENY sole SoT** · **ADR D3** · **SITE-UNKNOWN HOLD** · **ATT-SHIFT FE-ADMIN HOLD** · **ATT CODE/OT/COMP FE-ADMIN HOLD** · **LVRULE HOLD** · **honesty false** · **C-SLICE**

### 1.4 Decision heuristic

| Rule | Application |
|------|-------------|
| Consumer CNS CLOSED + Nest is SoT + FE-ADMIN mount+persist LIVE | FE-ADMIN invent deepen = **Option B/C reject**; note = HOLD pack |
| Closable FE-ADMIN mount/persist gap found? | Audit: **NO** → residual **HOLD** · next_owner **pm** (not `dev-fe`) |
| `gps_locations` JSON display alone? | **Not** a Nest FE-ADMIN mount/persist gap → **does not** unlock Option B |
| SITE-UNKNOWN HOLD alone? | RETAIN note · **not** FE-ADMIN CRUD gap → **does not** unlock |
| Unlock FE-ADMIN only if sponsor explicitly opens polish wave OR audit finds mount/persist gap | Board + audit: no gap · no sponsor FE-ADMIN polish message → **Option A** |
| No open closable ATT-WORKSITE consumer FAIL residual | Prefer **A**; do not invent LVRULE / reopen SHIFT·CODE·OT·COMP FE-ADMIN / invent SITE-UNKNOWN FAIL / flip attendance |

---

## 2. Options

### Option A — ACCEPT_AS_IS_P2 HOLD forever-until-sponsor for ATT-WORKSITE FE-ADMIN notes — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Mint / stamp board residual **`R-PLT-ATT-WS-FE-ADMIN-01`** as **P2 HOLD / NOTE pack** consolidating: (1) **`R-PLT-ATT-WS-ADM-FE`** Nest work-sites Attendance Settings GPS FE-ADMIN **LIVE** notes (mount+persist RETAIN · no further mandatory deepen); (2) **`R-PLT-ATT-WS-JSON-REF`** `gps_locations` display-merge / JSON sole-SoT DENY notes (ADR D3); (3) **`R-PLT-ATT-WS-SITE-UNKNOWN`** SITE-UNKNOWN **HOLD RETAIN** cite (do not invent unlock). **Do not** invent `dev-fe` dual Nest admin panels. **Do not** invent ba-process AC pack. **Do not** reopen CNS-05 CLOSED. **Do not** reopen ATT-SHIFT / CODE/OT/COMP FE-ADMIN HOLD as unlock. Peer *pack structure + LIVE inventory* = ATT-SHIFT/DEC/REC/PAY/SI FE-ADMIN NOTES · **WORKSITE AS-IS ≠ CODE/OT/COMP ABSENT**. Unlock ATT-WORKSITE FE-ADMIN polish **only** if sponsor later explicitly opens «mở FE wave ATT-WORKSITE FE-ADMIN polish / quản trị điểm làm việc GPS» **or** a future audit finds a **named closable** mount/persist defect. |
| **Benefits** | Honors peer FE-ADMIN HOLD pack class · matches U88 bandwidth · honesty / C-SLICE intact · no seal churn · FE-ADMIN already covers Nest work-sites CRUD · GPS CNS SEAL RETAIN · ADR D3 discipline RETAIN · SHIFT/CODE/OT/COMP HOLD untouched · SITE-UNKNOWN HOLD cite intact |
| **Costs** | Optional HDSD / UX polish for GPS card / soft-retire copy / SITE-UNKNOWN consumer bind remains deferred until sponsor; Condition KEEP on board (HOLD ≠ CLOSED) |
| **Risks** | Misread HOLD as «waive worksite admin forever» or as permission to invent second Nest admin «to complete admin» or to reopen CNS-05 «while polishing admin» or to reopen SHIFT/CODE/OT/COMP FE-ADMIN as unlock or to invent SITE-UNKNOWN FAIL or to flip `hrm_attendance_uat_ready` → mitigations **L-ATT-WS-FE-ADMIN-*** |
| **Gate** | QC-02 GWC SEAL · CNS-05 CLOSED · L1 SEAL · Nest SoT RETAIN · FE-ADMIN LIVE (no gap) · SITE-UNKNOWN HOLD RETAIN · honesty false |

### Option B — UNLOCK narrow FE-ADMIN deepen (`dev-fe`) if closable mount/persist gap

| | |
|--|--|
| **Description** | Unlock `dev-fe` **only if** READ-ONLY audit proves a **named closable** FE-ADMIN defect: Attendance GPS card **not mounted**, `att-gps-sites-card` / `att-gps-add-open` **missing**, or create/update/delete **unwired** / persist fail class. Optionally narrow polish for soft-retire UI copy / HDSD / SITE-UNKNOWN consumer bind **only** when sponsor names click-path UF. |
| **Benefits** | Would close a true product admin hole if one existed; would close polish UF if sponsor prioritizes. |
| **Costs** | On AS-IS audit: GPS card **mounted**, `useAttendanceRules` **LIVE**, CRUD **wired** (`createAttendanceWorkSite`/`updateAttendanceWorkSite`/`deleteAttendanceWorkSite`), L1 admin CREATE proven (`ATTWSQA-MSJC3IN9`), consumer GPS method **LIVE** (CNS-05 CLOSED). Unlocking now invents polish / dual work **without gap** — same risk as invent SHIFT Nest dual without sponsor. Treating SITE-UNKNOWN HOLD or JSON display as unlock forces bandwidth without mount/persist defect. |
| **Risks** | Scope creep · reopen CNS-05 as FAIL «while wiring admin» · reopen SHIFT/CODE/OT/COMP FE-ADMIN · invent SITE-UNKNOWN FAIL · flip attendance ready · duplicate BA seat · confuse JSON display with Nest admin · invent Face LIVE / ensureDefault. |
| **Gate** | **Reject as default** — audit finds **no** closable mount/persist gap. Retain B only if future audit/sponsor names an explicit gap or sponsor opens polish UF. |

### Option C — REJECT invent Nest dual work-sites admin / invent LVRULE / reopen CNS-05 / reopen SHIFT·CODE·OT·COMP FE-ADMIN as unlock / invent SITE-UNKNOWN FAIL / flip attendance UAT

| | |
|--|--|
| **Description** | Invent second Nest work-sites admin CRUD surface (e.g. Settings MD dual-write master or parallel admin outside GPS card) as mandatory continuous Task; invent LVRULE 01g unlock; reopen CNS-05 CLOSED / QA-02 stamp as FAIL; reopen ATT-SHIFT / CODE/OT/COMP FE-ADMIN HOLD as unlock; invent SITE-UNKNOWN FAIL; treat `gps_locations` JSON as sole SoT; invent Face LIVE / ensureDefaultWorkSite; flip `hrm_attendance_uat_ready` / claim module ATT UAT / Phase1 / seed. |
| **Benefits** | None for G→1 honesty. |
| **Costs** | Seal churn · sponsor trust · C-SLICE violation · dual admin path confusion · ADR D3 breach · SHIFT/CODE HOLD reopen · SITE-UNKNOWN invent · attendance ready false claim. |
| **Risks** | **REJECT** — all DENY lines in §1.3. |

---

## 3. Trade-off matrix

| Criteria | Weight | **A ACCEPT HOLD P2** | B Unlock FE-ADMIN gap | C Invent/reopen/flip |
|----------|-------:|---------------------:|----------------------:|---------------------:|
| Honesty / DENY invent Nest dual work-sites admin | 5 | **5** | 2 | 0 |
| Seal safety (CNS-05 CLOSED · L1 · SHIFT FE-ADMIN HOLD · CODE/OT/COMP FE-ADMIN HOLD · SITE-UNKNOWN HOLD · LVRULE · DEC peers) | 5 | **5** | 3 | 0 |
| Match peer FE-ADMIN NOTES pack class (SHIFT/DEC/REC/SI/PAY LIVE twin) | 5 | **5** | 1 | 0 |
| Business value (close true mount/persist gap) | 3 | 2 | **4** *(if gap)* / 1 *(no gap)* | 1 |
| U88 continuous bandwidth | 4 | **5** | 1 | 0 |
| Complexity / blast radius | 4 | **5** | 2 | 0 |
| Maintainability (Nest SoT + LIVE GPS admin + ADR D3 + SITE-UNKNOWN HOLD) | 4 | **5** | 2 | 0 |
| **Weighted** | | **128** | ≈52 | 3 |

*(Weighted = Σ weight×score; A dominates when audit shows no gap.)*

---

## 4. Failure modes and mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| **A** | HOLD misread as AC waive / worksite admin «N/A forever without stamp» | Evidence claims ATT-WORKSITE FE-ADMIN waived | Stamp **ACCEPT_AS_IS_P2 HOLD** · AC RETAIN deferred · Condition KEEP on board |
| **A** | Silent invent second Nest work-sites admin «to finish admin» (Settings MD dual-write / dual master) | Diff dual CRUD / JSON PATCH sole SoT / duplicate panels | **FORBIDDEN** · L-ATT-WS-FE-ADMIN-03 Nest dual DENY · GPS admin LIVE RETAIN · ADR D3 RETAIN |
| **A** | Reopen CNS-05 CLOSED / QA-02 stamp under «admin polish» | Diff GPSAttendance / useAttendanceRecords sealed paths / stamp reopen | Cite `ATTWSQA2-MSJCG47P` SEAL · DENY |
| **A** | Reopen ATT-SHIFT FE-ADMIN HOLD as unlock under «ATT FE-ADMIN wave» | Bus invents SHIFT polish citing this seat | Cite §1.1 discrimination · WORKSITE OWN · L-ATT-WS-FE-ADMIN-06 |
| **A** | Reopen ATT CODE/OT/COMP FE-ADMIN HOLD as unlock (ABSENT invent) | Bus invents CODE/OT/COMP admin citing this seat | Cite LIVE ≠ ABSENT · L-ATT-WS-FE-ADMIN-07 |
| **A** | Invent SITE-UNKNOWN FAIL / invent SITE-UNKNOWN unlock | Diff punch body / honesty matrix | DENY · HOLD RETAIN cite · L-ATT-WS-FE-ADMIN-14 |
| **A** | Invent LVRULE / flip attendance ready | Diff LeaveTab / honesty matrix | DENY · LVRULE HOLD · ready false |
| **A** | Mis-equate WORKSITE LIVE admin with CODE/OT/COMP ABSENT → dispatch invent FE for wrong catalogs | Bus invents att-code admin citing WORKSITE | Cite ATT-FE-ADMIN pack HOLD RETAIN · WORKSITE seat OWN only |
| **A** | Treat `gps_locations` JSON mutate as ops SoT PASS | Diff rules PATCH body including gps_locations | L-ATT-WS-FE-ADMIN-04 · ADR D3 |
| **A** | Invent Face LIVE / ensureDefaultWorkSite under FE-ADMIN polish | Diff Face / seed paths | L-ATT-WS-FE-ADMIN-11 · Face HOLD · U65 |
| B | Unlock without mount/persist gap | Bus DISPATCHED `dev-fe` ATT-WORKSITE FE-ADMIN without gap evidence | Prefer A; B only gap-or-sponsor |
| C | Ready flip / Nest invent / CNS-05 reopen / SHIFT·CODE unlock / SITE-UNKNOWN invent | Honesty matrix / seals | DENY · NO-GO process |

---

## 5. Decision

| | |
|--|--|
| **Selected** | **Option A** — architecture **LOCKED** |
| **Seat verdict** | **CONFIRMED** |
| **Disposition** | **ACCEPT_AS_IS_P2 HOLD** on **`R-PLT-ATT-WS-FE-ADMIN-01`** (pack includes `R-PLT-ATT-WS-ADM-FE` + `R-PLT-ATT-WS-JSON-REF` + `R-PLT-ATT-WS-SITE-UNKNOWN`) |
| **Why A** | ATT-WORKSITE QC-02 GWC SEAL · CNS-05 **CLOSED** (`ATTWSQA2-MSJCG47P`); L1 `ATTWSQA-MSJC3IN9` SEAL RETAIN; DOCS SRS v0.30 CH05b ACCEPT; DATA EXPAND soft-retire CONFIRMED; Nest is SoT (Option B `attendance_work_sites` · ADR D3); Attendance Settings GPS FE-ADMIN panel **LIVE** (`useAttendanceRules` mount + create/update/delete persist) — audit finds **no closable FE-ADMIN mount/persist gap**. `gps_locations` JSON display ≠ gap. SITE-UNKNOWN HOLD ≠ gap. Residual = NOTE pack peer ATT-SHIFT/DEC/REC/SI/PAY FE-ADMIN HOLD *structure + LIVE inventory*, not CODE/OT/COMP ABSENT invent. Option B unlock **not** gap-evidenced. Option C DENY. |
| **Rejected** | **B** as default unlock · **C** invent Nest dual / reopen CNS-05 / reopen SHIFT·CODE·OT·COMP FE-ADMIN / invent SITE-UNKNOWN FAIL / flip |
| **Assumptions** | Sponsor has **not** opened ATT-WORKSITE FE-ADMIN polish wave in this message; ATT-SHIFT FE-ADMIN HOLD remain HOLD; ATT CODE/OT/COMP FE-ADMIN HOLD remain HOLD; LVRULE 01g remains HOLD; SITE-UNKNOWN remains HOLD; honesty flags remain false; CNS-05 CLOSED remains SEAL. |
| **residual** | **`R-PLT-ATT-WS-FE-ADMIN-01` = HOLD** (not UNLOCK) |
| **next_owner** | **pm** (not `dev-fe`) |

### 5.1 Unlock gates (what Option A does **not** open)

| Question | Answer |
|----------|--------|
| Unlock ba-process new AC pack? | **HOLD** — ATT-WORKSITE-CATALOG-BA-01 already locked · **no** duplicate BA seat for admin invent |
| Unlock ba-data / new Nest tables? | **FORBIDDEN** — `attendance_work_sites` already LIVE (Option B · DATA EXPAND) · no schema change · no second sites table · no fold into att_attendance_code / leave / work_shifts |
| Unlock ATT-WORKSITE FE-ADMIN mandatory `dev-fe`? | **HOLD** — audit shows LIVE mount+persist · no closable gap |
| Unlock / reopen CNS-05 CLOSED / QA-02 / L1 as FAIL? | **FORBIDDEN** |
| Unlock ATT-SHIFT FE-ADMIN HOLD as invent polish? | **FORBIDDEN** — separate LIVE pack · RETAIN HOLD |
| Unlock ATT CODE/OT/COMP FE-ADMIN HOLD as invent admin? | **FORBIDDEN** — separate ABSENT pack · RETAIN HOLD |
| Invent SITE-UNKNOWN FAIL / unlock SITE-UNKNOWN? | **FORBIDDEN** — HOLD RETAIN cite only |
| Invent LVRULE 01g / JSON sole SoT / Face LIVE / ensureDefault? | **FORBIDDEN** |
| May PM flip `hrm_attendance_uat_ready` / claim module ATT UAT? | **NO** |
| May PM remove Condition from board as CLOSED? | **NO** — keep **HOLD P2** stamp · ACCEPT_AS_IS ≠ CLOSED Condition · ≠ WAIVED |

### 5.2 When sponsor later opens ATT-WORKSITE FE-ADMIN polish wave (narrow alternate — not default)

```text
entry: sponsor message contains explicit «mở FE wave ATT-WORKSITE FE-ADMIN polish / quản trị điểm làm việc GPS»
   OR future READ-ONLY audit cites named closable mount/persist gap with path+symptom
   OR sponsor explicitly opens «ATT-WORKSITE soft-retire / HDSD / SITE-UNKNOWN consumer bind UF» (narrow — not mount invent)
retain: ATTWSQA2-MSJCG47P CNS-05 CLOSED · ATTWSQA-MSJC3IN9 L1 SEAL · DOCS CH05b ACCEPT · DATA EXPAND
       · ATT-WORKSITE-CATALOG Option B SoT · ADR D3 · gps_locations JSON DENY sole SoT
       · R-PLT-ATT-SHIFT-FE-ADMIN-01 HOLD · R-PLT-ATT-FE-ADMIN-01 CODE/OT/COMP HOLD
       · SITE-UNKNOWN HOLD (unless sponsor names bind UF) · LVRULE HOLD · honesty false
scope_allowed:
  1) optional ba-process ADD-only UF inventory for Attendance GPS card polish · NOT redefine Nest Option B schema
  2) dev-fe: narrow polish on Attendance.tsx / useAttendanceRules UX copy ONLY (already LIVE admin)
  3) optional SITE-UNKNOWN consumer bind ONLY if sponsor names surface that posts work_site_id
scope_FORBIDDEN:
  - new Nest tables / schema change (attendance_work_sites already SoT) · fold into code/leave/shifts
  - gps_locations JSON sole SoT / dual-write (ADR D3 REJECT forever)
  - reopen CNS-05 CLOSED · reopen L1 / DOCS / DATA as FAIL
  - reopen ATT-SHIFT FE-ADMIN HOLD as unlock · reopen CODE/OT/COMP FE-ADMIN HOLD as unlock
  - invent SITE-UNKNOWN FAIL without bind surface · invent LVRULE 01g · invent Face LIVE · ensureDefault · flip attendance ready
  - module ATT UAT / Phase1 / seed
exit: R-PLT-ATT-WS-*-FE-ADMIN may CLOSE; R-PLT-ATT-WS-FE-ADMIN-01 pack may narrow; honesty false RETAIN · C-SLICE
```

### 5.3 Architecture boundary diagram (text)

```text
  Nest public.attendance_work_sites L1 + soft-retire ATTWSQA-MSJC3IN9 --> SEALED RETAIN (Option B SoT · ADR D3)
  F-ATT-CAT-WS-01 list (admin SoT · active filter)                     --> LIVE Nest
  F-ATT-CAT-WS-02 admin create/update/delete open N+                  --> LIVE (GPS card + Network L1)
  F-ATT-PUNCH GEO-001 / GEO-REQ                                       --> LIVE Nest (consumer SoT)
  GPSAttendance consumer CNS-05 check_in_method=gps                   --> CLOSED SEAL (ATTWSQA2-MSJCG47P)
  DOCS SRS v0.30 CH05b                                                --> ACCEPT RETAIN
  DATA EXPAND soft-retire                                             --> CONFIRMED RETAIN

  ATT Nest admin FE Attendance Settings GPS
       useAttendanceRules + att-gps-sites-card + att-gps-add-open     --> LIVE (no mount/persist gap) · NOTE HOLD

  gps_locations UI display merge
       mapWorkSiteRow / rules form field                              --> display only · JSON sole SoT DENY · NOTE HOLD

  SITE-UNKNOWN HRM-ATT-SITE-UNKNOWN
       consumer work_site_id invent when surface binds id             --> HOLD RETAIN (cite · do not invent unlock)

  R-PLT-ATT-WS-FE-ADMIN-01 (pack ADM-FE + JSON-REF + SITE-UNKNOWN)    --> ACCEPT_AS_IS_P2 HOLD
  R-PLT-ATT-SHIFT-FE-ADMIN-01 LIVE pack                               --> HOLD RETAIN (FORBIDDEN reopen-as-unlock)
  R-PLT-ATT-FE-ADMIN-01 CODE/OT/COMP ABSENT pack                      --> HOLD RETAIN (FORBIDDEN reopen-as-unlock)
  LVRULE / DEC·REC·PAY·SI FE-ADMIN                                    --> HOLD RETAIN
  hrm_attendance_uat_ready / payroll / printable                      --> false RETAIN · C-SLICE

  DISCRIMINATION: CODE/OT/COMP FE-ADMIN ABSENT ≠ WORKSITE FE-ADMIN LIVE (SHIFT/DEC/REC/SI/PAY-class)
  all packs end HOLD · different inventory reasons · WORKSITE seat does NOT reopen SHIFT/CODE/OT/COMP
```

---

## 6. Locks (L-ATT-WS-FE-ADMIN-*)

| Lock | Rule |
|------|------|
| **L-ATT-WS-FE-ADMIN-01 HOLD ≠ WAIVE** | ACCEPT_AS_IS_P2 **does not** delete AC-PLT-ATT-WORKSITE-01* · admin polish AC remains deferred FAIL-if-claimed until sponsor wave |
| **L-ATT-WS-FE-ADMIN-02 CNS-05 SEAL frozen** | `ATTWSQA2-MSJCG47P` · QC-02 GWC · **CNS-05 CLOSED** · L1 `ATTWSQA-MSJC3IN9` · DOCS CH05b ACCEPT · DATA EXPAND **FORBIDDEN reopen as FAIL** |
| **L-ATT-WS-FE-ADMIN-03 Nest dual DENY** | No invent second Nest work-sites admin CRUD FE / Settings MD dual-write master without sponsor polish wave / named gap |
| **L-ATT-WS-FE-ADMIN-04 JSON ≠ sole SoT** | `gps_locations` remain **display merge** · JSON sole SoT / PATCH gps_locations as ops SoT **REJECT RETAIN** (ADR D3) |
| **L-ATT-WS-FE-ADMIN-05 Attendance ready frozen** | DENY flip `hrm_attendance_uat_ready` · `attendance_e2e_linkage_ready` · `payroll_e2e_ready` · `contracts_printable_ready` |
| **L-ATT-WS-FE-ADMIN-06 SHIFT FE-ADMIN HOLD RETAIN** | DENY reopen `R-PLT-ATT-SHIFT-FE-ADMIN-01` **as unlock** |
| **L-ATT-WS-FE-ADMIN-07 CODE/OT/COMP FE-ADMIN HOLD RETAIN** | DENY reopen `R-PLT-ATT-FE-ADMIN-01` **as unlock** · DENY fold WORKSITE into CODE/OT/COMP ABSENT invent |
| **L-ATT-WS-FE-ADMIN-08 LVRULE HOLD** | DENY invent LVRULE 01g unlock |
| **L-ATT-WS-FE-ADMIN-09 Honesty** | DENY flip ready flags · C-SLICE RETAIN · DENY module ATT UAT |
| **L-ATT-WS-FE-ADMIN-10 Condition KEEP** | ACCEPT_AS_IS ≠ CLOSED ≠ WAIVED · keep HOLD P2 on board |
| **L-ATT-WS-FE-ADMIN-11 Face / ensureDefault must_keep** | Face GĐ1 HOLD · soft CTA · **FORBIDDEN** invent Face LIVE / `ensureDefaultWorkSite` under catalog polish |
| **L-ATT-WS-FE-ADMIN-12 Nest SoT RETAIN** | Nest `attendance_work_sites` remain Option B SoT · no second table · no fold into code/leave/shifts |
| **L-ATT-WS-FE-ADMIN-13 Admin ≠ consumer CNS** | GPS CNS-05 sealed CLOSED; admin open N+ RETAIN · consumer READY ≠ FE-ADMIN mount gap |
| **L-ATT-WS-FE-ADMIN-14 SITE-UNKNOWN HOLD cite** | `HRM-ATT-SITE-UNKNOWN` HOLD RETAIN — cite peer only · **FORBIDDEN invent unlock / invent FAIL** |
| **L-ATT-WS-FE-ADMIN-15 Path lock** | UTF-8 no BOM on NFD `.git`+`apps` True tree |
| **L-ATT-WS-FE-ADMIN-16 Peer LIVE HOLD RETAIN** | DENY reopen DEC/REC/PAY/SI FE-ADMIN HOLD as unlock |
| **L-ATT-WS-FE-ADMIN-17 LIVE ≠ ABSENT** | WORKSITE Attendance GPS admin LIVE must not be narrated as CODE/OT/COMP-style ABSENT invent trigger |

---

## 7. Impacted systems & non-goals

| In scope (docs disposition) | OUT / FORBIDDEN |
|-----------------------------|-----------------|
| Board residual `R-PLT-ATT-WS-FE-ADMIN-01` ACCEPT_AS_IS_P2 HOLD | `apps/**` edits · migration · seed |
| Option A/B/C + LOCKED A → next_dispatch PM | Invent Nest work-sites dual admin CRUD FE |
| Cite peer SHIFT/DEC/REC/PAY/SI FE-ADMIN HOLD LIVE pack class | Reopen CNS-05 CLOSED / L1 / DOCS / DATA as FAIL |
| Consolidate FE-ADMIN LIVE + JSON REF-deny + SITE-UNKNOWN HOLD into pack | Reopen SHIFT/CODE/OT/COMP FE-ADMIN HOLD as unlock · invent LVRULE · invent SITE-UNKNOWN FAIL · flip attendance |
| U88 PM continue next vertical/governance | Flip attendance ready · module ATT UAT · Phase1 DONE |
| Nest work-sites SoT + LIVE GPS admin + ADR D3 RETAIN | JSON sole SoT · invent Face LIVE · ensureDefault · fold into code/leave/shifts |

---

## 8. Validation / acceptance evidence plan

| Checkpoint | PASS when |
|------------|-----------|
| Spec ≥8KB on NFD `.git` toplevel | This file Length verified (≥8192; target peer ≥25KB) |
| Status | **CONFIRMED** · Option **A** **LOCKED** |
| Residual | `R-PLT-ATT-WS-FE-ADMIN-01` minted · **HOLD** P2 (not CLOSED · not WAIVED · not UNLOCK) |
| next_dispatch | ACCEPT HOLD seal to **pm** · **not** invent ba-process/FE Nest dual · **not** `dev-fe` |
| Honesty | ready=false · C-SLICE · DENY Nest dual invent · DENY CNS-05 reopen · DENY SHIFT/CODE/OT/COMP FE-ADMIN unlock · DENY SITE-UNKNOWN invent · DENY LVRULE invent · DENY flip attendance |
| Peer seals | CNS-05 CLOSED · L1 · DOCS CH05b · DATA EXPAND · SHIFT FE-ADMIN HOLD · CODE/OT/COMP FE-ADMIN HOLD · SITE-UNKNOWN HOLD · LVRULE HOLD · DEC LIVE HOLD RETAIN |
| Audit | Mount LIVE + persist LIVE cited · no closable gap used to force Option B |

---

## 9. Peer seal RETAIN checklist (FORBIDDEN reopen)

| Seal / HOLD | Stamp / id | Action |
|-------------|------------|--------|
| ATT-WORKSITE consumer CNS-05 GPS method | `ATTWSQA2-MSJCG47P` · QC-02 GWC · **CNS-05 CLOSED** | RETAIN · DENY reopen |
| ATT-WORKSITE L1 soft-retire + GEO | `ATTWSQA-MSJC3IN9` · QC-01 GWC | RETAIN |
| ATT-WORKSITE DOCS SRS v0.30 CH05b | DOCS-01 ACCEPT | RETAIN |
| ATT-WORKSITE-CATALOG-DATA-01 EXPAND | CONFIRMED soft-retire · no second table | RETAIN |
| ATT-WORKSITE-CATALOG-SA/BA/BE Option B | CONFIRMED Nest SoT · ADR D3 | RETAIN |
| Attendance GPS FE-ADMIN LIVE | `useAttendanceRules` · `att-gps-sites-card` · CRUD clients | RETAIN · NOTE HOLD (no gap) |
| gps_locations JSON | sole SoT DENY · ADR D3 | RETAIN |
| SITE-UNKNOWN | `HRM-ATT-SITE-UNKNOWN` HOLD | RETAIN · cite only · DENY invent unlock/FAIL |
| ATT-SHIFT FE-ADMIN pack | `R-PLT-ATT-SHIFT-FE-ADMIN-01` HOLD (SPEC 53359) | RETAIN · DENY reopen-as-unlock |
| ATT CODE/OT/COMP FE-ADMIN pack | `R-PLT-ATT-FE-ADMIN-01` HOLD (SPEC 31734) | RETAIN · DENY reopen-as-unlock |
| LVRULE 01g | ACCEPT_AS_IS_P2 HOLD | RETAIN · DENY invent unlock |
| DEC FE-ADMIN | `R-PLT-DEC-FE-ADMIN-01` HOLD | RETAIN · twin LIVE class |
| REC/PAY/SI FE-ADMIN | HOLD packs | RETAIN · twin LIVE class |
| EMP FE-ADMIN / EMP-CF FE | HOLD packs | RETAIN · DENY reopen-as-unlock |
| Face GĐ1 / soft CTA | featureHold · `att-gps-add-open` | RETAIN · ≠ GPS admin gap |

---

## 10. completion_report

**Closed:** SA Option/F.1 for ATT **work-sites FE-ADMIN notes** after ATT-WORKSITE catalog CNS-05 CLOSED — READ-ONLY apps/web audit shows Attendance Settings **GPS** FE-ADMIN **mounted** (`att-gps-sites-card` · `att-gps-add-open` · `att-gps-*-dialog`), `useAttendanceRules` add/update/remove GPS **LIVE** → Nest create/update/delete, `hrmApi` Nest work-sites clients list/create/update/delete **LIVE** (~5634–5677) (contrast CODE/OT/COMP GET-only ABSENT admin; match ATT-SHIFT/DEC/REC/SI/PAY LIVE class); QC-02 GWC · **CNS-05 CLOSED** · QA-02 **PASS** `ATTWSQA2-MSJCG47P`; L1 `ATTWSQA-MSJC3IN9` **RETAIN**; DOCS SRS v0.30 CH05b **ACCEPT**; DATA EXPAND soft-retire **CONFIRMED**; `gps_locations` display merge ≠ sole SoT (ADR D3); SITE-UNKNOWN **HOLD RETAIN** cite (do not invent unlock); Settings MD worksite bucket ABSENT (N/A — Nest GPS SoT); board audit shows **no** open closable ATT-WORKSITE consumer FAIL residual and **no** closable FE-ADMIN mount/persist gap; class = FE-ADMIN NOTES pack after LIVE admin + CNS SEAL (peer ATT-SHIFT FE-ADMIN HOLD *structure + LIVE inventory*); Option **A/B/C** evaluated; **Option A LOCKED ACCEPT_AS_IS_P2 HOLD**; mint **`R-PLT-ATT-WS-FE-ADMIN-01`** (packs WS-ADM-FE + WS-JSON-REF + WS-SITE-UNKNOWN); residual **HOLD** (not UNLOCK); ba-process/FE **HOLD**; DENY invent Nest dual · invent LVRULE · reopen CNS-05 · reopen ATT-SHIFT FE-ADMIN HOLD as unlock · reopen CODE/OT/COMP FE-ADMIN HOLD as unlock · invent SITE-UNKNOWN FAIL · JSON sole SoT · invent Face LIVE · ensureDefault · flip attendance ready; honesty false · C-SLICE · docs-only · no `apps/**`.

**Open / residual:** Condition **`R-PLT-ATT-WS-FE-ADMIN-01`** remains **HOLD P2** on W8 board until sponsor opens ATT-WORKSITE FE-ADMIN polish wave (or future named mount/persist gap); SITE-UNKNOWN remains **HOLD RETAIN**; ready flags false.

**RETAIN:** L1 `ATTWSQA-MSJC3IN9` · CNS-05 CLOSED · DOCS CH05b · DATA EXPAND · SITE-UNKNOWN HOLD · `R-PLT-ATT-SHIFT-FE-ADMIN-01` HOLD · `R-PLT-ATT-FE-ADMIN-01` CODE/OT/COMP HOLD · LVRULE HOLD · DEC/REC/PAY/SI FE-ADMIN HOLD · honesty false · C-SLICE.

**next_owner:** **pm**

**ack_status:** **PASS_TO_PM** · **CONFIRMED** · Option **A** **LOCKED**

**evidence_path:** `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-FE-ADMIN-NOTES-SA-01.md`

### next_dispatch_prompt (copy-ready — U88 next peer)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-FE-ADMIN-NOTES-SA-01
from_role: sa
to_role: pm
lane: governance · U88
ack_status: PASS_TO_PM
verdict: Option A LOCKED — ACCEPT_AS_IS_P2 HOLD on R-PLT-ATT-WS-FE-ADMIN-01
selected_option: A
residual: R-PLT-ATT-WS-FE-ADMIN-01 = HOLD (not UNLOCK · not CLOSED · not WAIVED)
next_owner: pm (NOT dev-fe — no closable FE-ADMIN mount/persist gap)
action:
  1) Seal board residual R-PLT-ATT-WS-FE-ADMIN-01 = ACCEPT_AS_IS_P2 HOLD (Condition KEEP — not CLOSED; not WAIVED)
     · pack includes R-PLT-ATT-WS-ADM-FE (Attendance Settings GPS Nest CRUD LIVE · no gap)
     · + R-PLT-ATT-WS-JSON-REF (gps_locations display merge · JSON sole SoT DENY · ADR D3)
     · + R-PLT-ATT-WS-SITE-UNKNOWN (HRM-ATT-SITE-UNKNOWN HOLD RETAIN — cite only · do not invent unlock)
  2) DENY invent ba-process / Nest dual admin / JSON sole SoT / Face LIVE / ensureDefault Tasks from this residual
  3) RETAIN: ATTWSQA2-MSJCG47P CNS-05 CLOSED · L1 ATTWSQA-MSJC3IN9 · DOCS SRS v0.30 CH05b ACCEPT · DATA EXPAND
     · R-PLT-ATT-SHIFT-FE-ADMIN-01 HOLD (FORBIDDEN reopen as unlock)
     · R-PLT-ATT-FE-ADMIN-01 CODE/OT/COMP HOLD (FORBIDDEN reopen as unlock)
     · SITE-UNKNOWN HOLD · LVRULE 01g HOLD · DEC/REC/PAY/SI FE-ADMIN HOLD
     · honesty false · C-SLICE
  4) Continue U88 next vertical/governance peer per continuous board
     — DENY invent LVRULE unlock · DENY reopen CNS-05 · DENY reopen SHIFT/CODE/OT/COMP FE-ADMIN HOLD as unlock
     — DENY invent SITE-UNKNOWN FAIL · DENY flip hrm_attendance_uat_ready
sponsor_gated_reopen_only: explicit «mở FE wave ATT-WORKSITE FE-ADMIN polish / quản trị điểm làm việc GPS»
  → then narrow Attendance GPS card polish ONLY (Nest Option B schema RETAIN · no new tables · no SHIFT/CODE invent · SITE-UNKNOWN only if sponsor names bind UF)
evidence: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-FE-ADMIN-NOTES-SA-01.md
```

**DENY alternate:** invent Nest dual work-sites admin · `gps_locations` JSON sole SoT · invent LVRULE 01g · reopen CNS-05 CLOSED · reopen ATT-SHIFT FE-ADMIN HOLD as unlock · reopen ATT CODE/OT/COMP FE-ADMIN HOLD as unlock · invent SITE-UNKNOWN FAIL · invent Face LIVE · ensureDefaultWorkSite · flip `hrm_attendance_uat_ready` · claim module ATT UAT / Phase1 DONE · seed · apps/**.

---

## 11. F.1 API / DB disposition notes (governance — no physical unlock)

| Layer | Disposition |
|-------|-------------|
| **DB** | No ADD table · Nest `public.attendance_work_sites` remain **LIVE SoT (Option B · ADR D3 · DATA EXPAND soft-retire)** — this seat does **not** open ba-data · no schema change · no second sites table · no fold into `att_attendance_code` / leave / work_shifts |
| **API** | No new Nest admin CRUD FE routes required; BE CREATE/PATCH/DELETE admin endpoints already proven at **Network L1** (`ATTWSQA-MSJC3IN9`) + GPS card FE (RETAIN); GEO-001/GEO-REQ consumers RETAIN; **SITE-UNKNOWN HOLD RETAIN** |
| **FE consumer** | CNS-05 CLOSED RETAIN — **out of scope** (`GPSAttendance` · `useAttendanceRecords` · check_in_method=gps) |
| **FE admin** | Nest work-sites Attendance GPS CRUD **LIVE HOLD NOTE** (no closable mount/persist gap) — polish deferred until sponsor |
| **JSON display** | `gps_locations` **display merge only** · sole SoT DENY RETAIN |
| **F.1 completeness** | Disposition complete for residual class; physical F.1 for Nest work-sites admin polish deferred until sponsor FE-ADMIN polish wave (optional BA ADD click-path only) |

### 11.1 F.1 function map (disposition — no new contract)

| Function | Path | Mục đích | Nghiệp vụ xử lý | Tham chiếu bước SRS | Disposition |
|----------|------|----------|-----------------|---------------------|-------------|
| F-ATT-CAT-WS-01 list | `GET /api/hrm/attendance/work-sites` | Admin list Nest sites | Scope by company · active/inactive per soft-retire deepen | SRS CH05b · AC-PLT-ATT-WORKSITE-01d admin | **RETAIN LIVE** |
| F-ATT-CAT-WS-02 create | `POST /api/hrm/attendance/work-sites` | Admin open N+1 | Open name/coords/radius · no closed site enum | AC-PLT-ATT-WORKSITE-01d | **RETAIN LIVE** |
| F-ATT-CAT-WS-02 update | `PATCH /api/hrm/attendance/work-sites/:id` | Admin edit | Name/coords/radius · soft-retire active | CH05b | **RETAIN LIVE** |
| F-ATT-CAT-WS-02 delete | `DELETE /api/hrm/attendance/work-sites/:id` | Admin remove/retire path | Prefer soft-retire deepen · hard DELETE residual noted in catalog SA/DATA | L1 RETAIN | **RETAIN** · polish HOLD |
| F-ATT-PUNCH GEO-001 | POST records + lat/lon | Reject out-of-range GPS | assertWithinWorkSite when active sites >0 | VAL-ATT-WS · CNS | **RETAIN SEAL** |
| F-ATT-PUNCH GEO-REQ | POST records method=gps omit coords | Reject missing coords on GPS path | HRM-ATT-GEO-REQ | VAL-ATT-WS-CNS-05 · CNS-05 CLOSED | **RETAIN SEAL** |
| SITE-UNKNOWN | Consumer work_site_id invent | Reject invent id when surface binds | HRM-ATT-SITE-UNKNOWN | API_DESIGN HOLD | **HOLD RETAIN** · do not invent unlock |

### 11.2 DB physical (disposition — no unlock)

| Table / object | Role | Disposition |
|----------------|------|-------------|
| `public.attendance_work_sites` | Nest ops SoT (ADR D3) | **RETAIN LIVE** · no ADD · no second table · soft-retire EXPAND RETAIN |
| `attendance_rules.gps_locations` JSON | Legacy/display · not ops SoT | **DENY sole SoT** RETAIN |
| `work_shifts` | Orthogonal ATT catalog | **OUT** — SHIFT FE-ADMIN HOLD · **FORBIDDEN fold** |
| `att_attendance_code` / `att_ot_type` / `att_ot_comp_type` | Orthogonal ATT catalogs | **OUT** — CODE/OT/COMP FE-ADMIN HOLD pack · **FORBIDDEN fold** |

---

## 12. References

| Artifact | Role |
|----------|------|
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-FE-ADMIN-NOTES-SA-01.md` | Twin ACCEPT_AS_IS_P2 HOLD LIVE class (`R-PLT-ATT-SHIFT-FE-ADMIN-01` · SPEC 53359) — depth mirror |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01.md` | CODE/OT/COMP ABSENT pack HOLD (SPEC 31734) — contrast · FORBIDDEN reopen |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01.md` | Catalog Option B Nest SoT · ADR D3 |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01.md` | AC-PLT-ATT-WORKSITE-01* · admin≠consumer |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DATA-01.md` | EXPAND soft-retire CONFIRMED |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-qc-02.md` | QC-02 GWC · CNS-05 CLOSED · SITE-UNKNOWN HOLD |
| `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` | Continuous board · ATT-WORKSITE rows · FE-ADMIN NOTES DISPATCHED |
| `apps/web/hrm/src/pages/Attendance.tsx` | READ-ONLY audit: GPS FE-ADMIN LIVE mount |
| `apps/web/hrm/src/hooks/useAttendanceRules.ts` | READ-ONLY audit: admin CRUD LIVE |
| `apps/web/hrm/src/components/attendance/GPSAttendance.tsx` | READ-ONLY audit: CNS-05 consumer |
| `apps/web/hrm/src/hooks/useAttendanceRecords.ts` | READ-ONLY audit: check_in_method wire |
| `apps/web/hrm/src/integrations/hrmApi.ts` §5624–5677 | READ-ONLY audit: admin clients LIVE |
| `.cursor/templates/ADR_OPTION_TEMPLATE.md` | Option evaluation structure |

---

## 13. Expanded rationale (audit trail for PM / QC)

### 13.1 Why this is not consumer UNLOCK class

ATT-WORKSITE-CATALOG shipped a **consumer** FE binding (GPSAttendance `check_in_method=gps` + lat/lon — VAL-ATT-WS-CNS-05). That consumer Condition (CNS-05 / `R-PLT-ATT-WS-FE-CNS-05`) was executed by dev-fe, verified by QA-02 (U65 browser Network GEO-001 prove wire), and CLOSED at QC-02 GWC (`ATTWSQA2-MSJCG47P`). This seat owns **only** the remaining **FE-ADMIN notes** class for the WORKSITE catalog. Treating FE-ADMIN as another mandatory `dev-fe` wave without a mount/persist gap would invent polish bandwidth and risk reopening CNS-05 — violating DENY lines already stamped on ATT-WORKSITE QC-02 and on ATT-SHIFT/DEC/REC/SI/PAY FE-ADMIN HOLD peers.

### 13.2 Why WORKSITE FE-ADMIN is LIVE (not CODE/OT/COMP ABSENT)

`ATT-FE-ADMIN-NOTES-SA-01` correctly HOLDs CODE/OT/COMP because those catalogs ship **GET `listEffective*` only** with **no** create/update FE client and **no** admin panel (Network L1 is the admin path). ATT **work-sites** is a different inventory: Attendance Settings **GPS** already binds Nest CRUD via `useAttendanceRules` (`listAttendanceWorkSites`/`createAttendanceWorkSite`/`updateAttendanceWorkSite`/`deleteAttendanceWorkSite`) with UI chrome (`att-gps-sites-card`, `att-gps-add-open`, edit/remove dialogs). Therefore WORKSITE must be disposed as **LIVE FE-ADMIN NOTE pack** (ATT-SHIFT/DEC/REC/SI/PAY-class), **not** as ABSENT invent unlock. **This seat must not reopen CODE/OT/COMP HOLD as unlock. This seat must not reopen ATT-SHIFT FE-ADMIN HOLD as unlock.**

### 13.3 Why Nest SoT (ADR D3) + JSON REF-deny shapes this pack

Catalog Option B + ADR D3 lock ops SoT = Nest `attendance_work_sites`; `attendance_rules.gps_locations` JSON = display merge only. FE must_keep forbids PATCH gps_locations as SoT. Therefore there is **no** «Settings JSON path missing» unlock and **no** permission to treat JSON mutate as ops SoT PASS. The admin SoT path is Nest itself via Attendance GPS card (LIVE). Residual = NOTE pack, not JSON gap unlock.

### 13.4 Why Nest work-sites admin FE stays HOLD (not invent deepen)

GPS card admin CREATE/PATCH/DELETE is LIVE; L1 soft-retire + GEO LIVE; consumer CNS-05 CLOSED; DOCS ACCEPT; DATA EXPAND CONFIRMED. The remaining items are optional polish (soft-retire UX copy, HDSD depth, SITE-UNKNOWN consumer bind when sponsor names surface) — identical to ATT-SHIFT FE-ADMIN LIVE + HOLD NOTE after CNS CLOSED. Per PM preferred Option A and SHIFT/DEC twin, **ACCEPT_AS_IS_P2 HOLD** until sponsor opens FE-ADMIN polish wave — **not** ba-process invent now · **not** `dev-fe` without gap.

### 13.5 SITE-UNKNOWN HOLD — cite only (do not invent unlock)

`HRM-ATT-SITE-UNKNOWN` remains **HOLD** on board / API_DESIGN / DB_DESIGN because consumer punch surfaces do not yet bind `work_site_id` as a product picker. This seat **cites** HOLD as RETAIN note inside the pack. **Forbidden** to invent SITE-UNKNOWN FAIL evidence or invent a SITE-UNKNOWN unlock Task from FE-ADMIN NOTES. Unlock SITE-UNKNOWN only when sponsor later names a consumer bind UF (see §5.2).

### 13.6 ATT-SHIFT / CODE/OT/COMP FE-ADMIN — cite only

ATT-SHIFT FE-ADMIN HOLD (`R-PLT-ATT-SHIFT-FE-ADMIN-01` · SPEC 53359) and CODE/OT/COMP FE-ADMIN HOLD (`R-PLT-ATT-FE-ADMIN-01` · SPEC 31734) are orthogonal sealed peers. This seat may **cite** them as class peers. **Forbidden** to reopen either as unlock from WORKSITE FE-ADMIN NOTES.

### 13.7 Honesty / C-SLICE statement

Closing CNS-05 and stamping FE-ADMIN HOLD **must not** flip:

- `hrm_attendance_uat_ready`
- `attendance_e2e_linkage_ready`
- `payroll_e2e_ready`
- `contracts_printable_ready`

Nor claim module ATT UAT, Phase1 DONE, or UF 🟢 for whole ATT. **`C-SLICE-≠-MODULE`** remains true: many GWC slices ≠ module GO.

### 13.8 U88 continuity after this seat

PM should:

1. Seal `R-PLT-ATT-WS-FE-ADMIN-01` HOLD on W8 board.
2. **Not** dispatch ba-process AC pack for FE-ADMIN invent (HOLD).
3. **Not** dispatch `dev-fe` (no closable mount/persist gap).
4. Continue next vertical / governance peer without inventing LVRULE unlock, reopening CNS-05, reopening SHIFT/CODE/OT/COMP FE-ADMIN HOLD as unlock, inventing SITE-UNKNOWN FAIL, or flipping attendance ready.
5. Keep ATT-SHIFT FE-ADMIN pack HOLD RETAIN · ATT CODE/OT/COMP FE-ADMIN pack HOLD RETAIN · SITE-UNKNOWN HOLD RETAIN.

---

## 14. Residual ID registry (mint)

| ID | Severity | Status after this seat | Owner next |
|----|----------|------------------------|------------|
| **R-PLT-ATT-WS-FE-ADMIN-01** | P2 | **ACCEPT_AS_IS_P2 HOLD** (KEEP Condition) | pm (board seal) |
| R-PLT-ATT-WS-ADM-FE | P2 | **HOLD ⊆ pack** (LIVE admin · no gap · not CLOSED) | sponsor-gated polish wave |
| R-PLT-ATT-WS-JSON-REF | P2 | **HOLD ⊆ pack** (JSON display · sole SoT DENY) | sponsor-gated polish wave |
| R-PLT-ATT-WS-SITE-UNKNOWN | P2 | **HOLD ⊆ pack** (SITE-UNKNOWN RETAIN cite) | sponsor-gated bind UF only |
| CNS-05 / R-PLT-ATT-WS-FE-CNS-05 | — | **CLOSED ACCEPT** RETAIN (`ATTWSQA2-MSJCG47P`) | — |
| L1 ATT-WORKSITE | — | **SEAL RETAIN** (`ATTWSQA-MSJC3IN9`) | — |
| R-PLT-ATT-SHIFT-FE-ADMIN-01 | P2 | **HOLD RETAIN** (FORBIDDEN reopen-as-unlock) | — |
| R-PLT-ATT-FE-ADMIN-01 (CODE/OT/COMP) | P2 | **HOLD RETAIN** (ABSENT pack · FORBIDDEN reopen-as-unlock) | — |

---

## 15. Scope boundary vs ATT-SHIFT / ATT-FE-ADMIN NOTES (explicit)

| Item | ATT-SHIFT-FE-ADMIN-NOTES | ATT-FE-ADMIN-NOTES | This seat ATT-WORKSITE-FE-ADMIN-NOTES |
|------|--------------------------|--------------------|---------------------------------------|
| Catalogs covered | work_shifts only | att_attendance_code · att_ot_type · att_ot_comp_type | **attendance_work_sites only** |
| FE-ADMIN inventory | **LIVE** (Attendance Ca CRUD) | **ABSENT** (GET effective only) | **LIVE** (Attendance Settings GPS CRUD) |
| Residual mint | `R-PLT-ATT-SHIFT-FE-ADMIN-01` | `R-PLT-ATT-FE-ADMIN-01` | `R-PLT-ATT-WS-FE-ADMIN-01` |
| May reopen the other packs? | N/A | N/A | **FORBIDDEN** reopen SHIFT or CODE/OT/COMP HOLD as unlock |
| May fold WORKSITE into other packs? | N/A | N/A | **FORBIDDEN** |
| Selected option | A ACCEPT_AS_IS_P2 HOLD | A ACCEPT_AS_IS_P2 HOLD | A ACCEPT_AS_IS_P2 HOLD |
| next_owner | pm | pm | pm (not dev-fe) |

---

## 16. QA/QC reading guide (what this seat is / is not)

| Claim | Allowed? |
|-------|----------|
| «CNS-05 CLOSED + L1 RETAIN + DOCS ACCEPT + DATA EXPAND → FE-ADMIN NOTES HOLD» | **YES** — this seat |
| «FE-ADMIN mount missing → dispatch dev-fe» | **NO** — audit shows LIVE |
| «CODE/OT/COMP also need invent admin now» | **NO** — separate HOLD pack ABSENT · FORBIDDEN reopen-as-unlock from this seat |
| «SHIFT FE-ADMIN polish now because WORKSITE NOTES» | **NO** — SHIFT HOLD RETAIN · FORBIDDEN reopen |
| «SITE-UNKNOWN unlock because FE-ADMIN NOTES» | **NO** — HOLD RETAIN cite only · do not invent unlock |
| «attendance_uat_ready=true because WORKSITE GWC» | **NO** — honesty false · C-SLICE |
| «gps_locations JSON mutate = ops SoT PASS» | **NO** — display merge · ADR D3 |

---

## 17. Option scoring detail (expanded)

| Criterion detail | A | B (no gap) | C |
|------------------|---|------------|---|
| Preserves CNS-05 seal | 5 | 3 | 0 |
| Preserves SHIFT FE-ADMIN HOLD | 5 | 2 | 0 |
| Preserves CODE/OT/COMP FE-ADMIN HOLD | 5 | 2 | 0 |
| Preserves SITE-UNKNOWN HOLD | 5 | 2 | 0 |
| Matches SHIFT LIVE FE-ADMIN NOTE class | 5 | 1 | 0 |
| Avoids JSON sole-SoT regression | 5 | 2 | 0 |
| Avoids LVRULE invent | 5 | 3 | 0 |
| Bandwidth for U88 next vertical | 5 | 1 | 0 |
| Operator polish UX (if gap existed) | 2 | 4 | 1 |

**Interpretation:** Without a named mount/persist gap, Option B’s «business value» column collapses; Option A dominates on seal safety + peer class match + honesty.

---

## 18. Rollout / checkpoint / rollback (governance)

### 18.1 Rollout steps (PM after PASS_TO_PM)

1. Stamp W8 board: `R-PLT-ATT-WS-FE-ADMIN-01 = ACCEPT_AS_IS_P2 HOLD`.
2. Append bus INTAKE from this evidence · seal seat.
3. Do **not** Task `dev-fe` / `ba-process` for invent admin.
4. Dispatch U88 next governance/execution peer from continuous board (not invent LVRULE / SITE-UNKNOWN FAIL / SHIFT·CODE admin).

### 18.2 Rollback plan

- If future audit finds true mount/persist gap: PM opens Option B narrow with path+symptom evidence — **does not** silently reopen CNS-05 or SHIFT/CODE/OT/COMP HOLD or invent SITE-UNKNOWN FAIL.
- If sponsor opens polish wave: follow §5.2 scope_allowed / scope_FORBIDDEN.

### 18.3 Validation checkpoints

| CP | Owner | PASS |
|----|-------|------|
| SPEC_LEN ≥8192 NFD | sa | This file |
| Option A LOCKED recorded | pm | Board + bus |
| Residual HOLD KEEP | pm | Condition not CLOSED/WAIVED |
| Seals RETAIN | qa/qc audit | CNS-05 · L1 · SHIFT pack · CODE pack · SITE-UNKNOWN HOLD |

### 18.4 Success criteria

- Residual minted HOLD · next_owner pm · no apps/** · honesty false · SHIFT/CODE HOLD untouched · SITE-UNKNOWN not invented unlock · CNS-05 not reopened.

---

## 19. Non-goals (explicit list)

1. Do not invent Nest dual work-sites admin outside Attendance Settings GPS.
2. Do not PATCH `gps_locations` JSON as ops SoT.
3. Do not reopen CNS-05 / L1 / DOCS / DATA as FAIL.
4. Do not reopen `R-PLT-ATT-SHIFT-FE-ADMIN-01` as unlock.
5. Do not reopen `R-PLT-ATT-FE-ADMIN-01` CODE/OT/COMP as unlock.
6. Do not invent SITE-UNKNOWN FAIL or invent SITE-UNKNOWN unlock without sponsor bind UF.
7. Do not invent LVRULE 01g unlock.
8. Do not invent Face LIVE / ensureDefaultWorkSite.
9. Do not flip attendance / payroll / printable ready flags.
10. Do not claim module ATT UAT / Phase1 DONE.
11. Do not seed catalog rows for evidence.
12. Do not fold attendance_work_sites into att_attendance_code / leave / work_shifts tables.
13. Do not edit `apps/**` / `packages/**` in this seat.

---

## 20. Trace to program board rows (W8)

| Board row | Status at this seat | Action |
|-----------|---------------------|--------|
| ATT-WORKSITE-CATALOG-SA-01 | CONFIRMED Option B | RETAIN |
| ATT-WORKSITE-CATALOG-BA-01 | CONFIRMED | RETAIN |
| ATT-WORKSITE-CATALOG-BE-01 | READY · SITE-UNKNOWN HOLD | RETAIN |
| ATT-WORKSITE-CATALOG-DATA-01 | CONFIRMED EXPAND soft-retire | RETAIN |
| ATT-WORKSITE-CATALOG-QA-01 | PASS `ATTWSQA-MSJC3IN9` | RETAIN L1 |
| ATT-WORKSITE-CATALOG-QC-01 | GWC SEALED | RETAIN |
| ATT-WORKSITE-CATALOG-DOCS-01 | ACCEPT SRS v0.30 CH05b | RETAIN |
| ATT-WORKSITE-CATALOG-FE-01 | READY (CNS-05 wire) | RETAIN |
| ATT-WORKSITE-CATALOG-QA-02 | PASS `ATTWSQA2-MSJCG47P` | RETAIN |
| ATT-WORKSITE-CATALOG-QC-02 | GWC SEALED CNS-05 CLOSED | RETAIN · DENY reopen |
| ATT-WORKSITE-FE-ADMIN-NOTES-SA-01 | **this seat** | Option A HOLD mint residual |
| ATT-SHIFT-FE-ADMIN-NOTES-SA-01 | HOLD LIVE | RETAIN · DENY reopen-as-unlock |
| ATT-FE-ADMIN-NOTES-SA-01 | HOLD CODE/OT/COMP | RETAIN · DENY reopen-as-unlock |

---

## 21. Soft-retire / empty CTA / Face honesty notes (RETAIN)

| Note | Status | Why in this pack |
|------|--------|------------------|
| Soft-retire `active=false` | DATA EXPAND + BE deepen **RETAIN** | FE-ADMIN polish copy optional · **≠** mount gap |
| Soft empty CTA `att-gps-add-open` | RETAIN · no ensureDefault | U65 · QC-02 SOFT-CTA-RETAIN |
| Face GĐ1 HOLD | RETAIN | **≠** GPS admin gap · DENY invent Face LIVE |
| PROP-03e QR SKIP | RETAIN | Orthogonal honesty |
| J-MOB-02 OOS | RETAIN | DENY invent mobile FAIL from this seat |

---

## 22. Cross-walk to ADR D3 / FR-UC-BP-ATT-03d

| Spec anchor | Seat reading |
|-------------|--------------|
| ADR-HRM-ATTENDANCE-CFG-PERSIST **D3** geofence SoT = Nest work-sites | **RETAIN** · FE-ADMIN LIVE binds Nest · JSON DENY sole SoT |
| FR-UC-BP-ATT-03d GPS work-sites CRUD | **LIVE** on Attendance Settings GPS · NOTE HOLD (no gap) |
| BR-PLT admin open N+1 ≠ consumer invent coords | Admin open RETAIN · GEO invent RETAIN · SITE-UNKNOWN HOLD |
| Empty active catalog → skip assert | ADR D3 RETAIN · soft CTA RETAIN · no seed |

---

## 23. Discrimination matrix (unlock gate — one page)

| Evidence | Unlock FE-ADMIN? | Why |
|----------|------------------|-----|
| `att-gps-sites-card` PRESENT | **NO** | Mount LIVE |
| `createAttendanceWorkSite` wired | **NO** | Persist LIVE |
| CNS-05 CLOSED | **NO** | Consumer sealed · not admin gap |
| SITE-UNKNOWN HOLD | **NO** | Cite RETAIN · not mount gap |
| CODE/OT/COMP ABSENT peer | **NO** | Different catalog · FORBIDDEN reopen |
| SHIFT FE-ADMIN HOLD peer | **NO** | Different catalog · FORBIDDEN reopen |
| Named missing `att-gps-add-open` in future audit | **YES (Option B)** | Closable mount gap |
| Sponsor «mở FE wave ATT-WORKSITE FE-ADMIN polish» | **YES (narrow)** | §5.2 only |

---

## 24. Glossary (seat terms)

| Term | Meaning here |
|------|--------------|
| FE-ADMIN LIVE | Product UI mounts Nest create/update/delete for catalog |
| FE-ADMIN ABSENT | Only GET effective clients · no admin panel |
| ACCEPT_AS_IS_P2 HOLD | Residual stamped HOLD · not CLOSED · not WAIVED · not UNLOCK |
| SITE-UNKNOWN HOLD | Error class reserved until consumer binds work_site_id · not invent FAIL |
| C-SLICE | Many GWC slices ≠ module ATT UAT / Phase1 |

---

*End of SA Option/F.1 — ATT-WORKSITE FE-ADMIN NOTES — Option A LOCKED ACCEPT_AS_IS_P2 HOLD · R-PLT-ATT-WS-FE-ADMIN-01 · PASS_TO_PM · next_owner=pm*