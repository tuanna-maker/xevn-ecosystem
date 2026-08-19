# PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-FE-ADMIN-NOTES-SA-01 — Option/F.1 · ATT work_shifts FE-ADMIN notes residual

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-FE-ADMIN-NOTES-SA-01` |
| **Parent** | ATT-SHIFT-CATALOG-QC-02 **GWC SEALED** · **CNS-02 CLOSED** · QA-FE **`ATTSHIFTQAFE-MSK6AJ8Z`** · L1 **`ATTSHIFTQA-MSK5FXP3` RETAIN** · DOCS **ACCEPT** SRS **v0.36** · **CH05d** |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa · **docs-only** · **NO** `apps/**` |
| **change_mode** | **ADD** Option/F.1 disposition for **ATT work_shifts FE-ADMIN notes** residual after ShiftChange consumer CNS-02 CLOSED · **no seed** (U65) · **no wipe** sealed peers · **no reopen** ATT CODE/OT/COMP FE-ADMIN HOLD pack |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · **ACCEPT_AS_IS_P2 HOLD** forever-until-sponsor · ba-process **HOLD** (no new AC pack) · FE/BE **HOLD** · invent Nest dual work_shifts admin **DENY** · reopen CNS-02 CLOSED **DENY** · reopen ATT CODE/OT/COMP FE-ADMIN HOLD as unlock **DENY** |
| **residual_id** | **`R-PLT-ATT-SHIFT-FE-ADMIN-01`** *(minted this seat — consolidates Nest `work_shifts` Attendance Ca-tab FE-ADMIN LIVE notes + Settings/XBOS `shifts` REF-only notes)* |
| **prior_consumer_fe** | ATT-SHIFT-CATALOG-FE-01 READY · QA-FE **PASS** `ATTSHIFTQAFE-MSK6AJ8Z` · QC-02 **GWC** · **CNS-02 CLOSED** (ShiftChange Nest EFF picker) — **FORBIDDEN reopen** |
| **prior_l1** | ATT-SHIFT-CATALOG-QA-01 **PASS** `ATTSHIFTQA-MSK5FXP3` · QC-01 GWC L1 SEAL — **RETAIN** |
| **prior_docs** | ATT-SHIFT-CATALOG-DOCS-01 **ACCEPT** SRS v0.36 CH05d — **RETAIN** |
| **prior_catalog** | ATT-SHIFT-CATALOG-SA-01 **CONFIRMED** Option **B** Nest `public.work_shifts` SoT · BA AC-PLT-ATT-SHIFT-01* · BE soft-retire + invent `HRM-ATT-SHIFT-KEY` — **SEAL RETAIN** |
| **peer_cite_hold_live** | [`DEC-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-ADMIN-NOTES-SA-01.md) **Option A · `R-PLT-DEC-FE-ADMIN-01`** (SPEC 61534 · LIVE class) · [`REC-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-ADMIN-NOTES-SA-01.md) **Option A · `R-PLT-REC-FE-ADMIN-01`** (SPEC 55083) · [`PAY-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-FE-ADMIN-NOTES-SA-01.md) **Option A · `R-PLT-PAY-FE-ADMIN-01`** (SPEC 49325) · [`SI-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-FE-ADMIN-NOTES-SA-01.md) **Option A · `R-PLT-SI-FE-ADMIN-01`** (SPEC 40113) — **cite class (LIVE twin pack)** |
| **peer_cite_hold_absent_contrast** | [`ATT-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01.md) **Option A · `R-PLT-ATT-FE-ADMIN-01`** (SPEC 31734 · CODE/OT/COMP **ABSENT** admin) — **cite pack structure only · FORBIDDEN reopen as unlock · FORBIDDEN fold SHIFT into CODE/OT/COMP pack** |
| **peer_cite_consumer** | ShiftChange Nest EFF rebind **SEAL ACCEPT** (`ATTSHIFTQAFE-MSK6AJ8Z` · CNS-02 CLOSED) · WORKSITE CNS-05 CLOSED (`ATTWSQA2-MSJCG47P`) **cite peer CLOSED · do not invent WORKSITE unlock** · → **≠** this residual class |
| **Honesty** | `hrm_attendance_uat_ready=false` · `attendance_e2e_linkage_ready=false` · `payroll_e2e_ready=false` · `contracts_printable_ready=false` · **`C-SLICE-≠-MODULE`** · U65 · **DENIED** module ATT UAT · Phase1 DONE · seed · flip attendance ready · invent Nest dual work_shifts admin · invent LVRULE · reopen ATT CODE/OT/COMP FE-ADMIN HOLD as unlock · reopen CNS-02 · invent WORKSITE unlock |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option pack)

| | |
|--|--|
| **Decision title** | Disposition for ATT **work_shifts FE-ADMIN notes** after ATT-SHIFT catalog wave (Nest SoT LIVE · Attendance Ca-tab admin CRUD LIVE · ShiftChange CNS-02 CLOSED · L1 invent KEY RETAIN · DOCS CH05d ACCEPT) — ACCEPT_AS_IS HOLD vs unlock FE-ADMIN deepen vs invent Nest dual / reopen CNS-02 / reopen CODE·OT·COMP FE-ADMIN |
| **Requestor** | pm · U88 continuous · after DEC-FE-ADMIN-NOTES-SA-01 Option A HOLD sealed (`R-PLT-DEC-FE-ADMIN-01` · SPEC 61534) · ATT-SHIFT QC-02 GWC · CNS-02 CLOSED |
| **Decision owner** | sa |
| **Related** | Nest `public.work_shifts` SoT LIVE (Option B · ADR D1) · Attendance tab **Ca** FE-ADMIN LIVE (`useWorkShifts` · `shifts-table` · create/update/delete) · Settings/XBOS `shifts` REF only (MD dual-write DENY) · consumer ShiftChangeRequestTab Nest EFF SEAL · invent `HRM-ATT-SHIFT-KEY` · soft-retire deepen · ATT CODE/OT/COMP FE-ADMIN HOLD peer (ABSENT contrast) · WORKSITE CNS-05 CLOSED peer cite · LVRULE 01g HOLD |
| **Template** | `.cursor/templates/ADR_OPTION_TEMPLATE.md` §§1–7 + F.1 notes |
| **Board** | `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` row `…-ATT-SHIFT-FE-ADMIN-NOTES-SA-01` **DISPATCHED** |

### 1.1 Problem — what residual remains after ATT-SHIFT CNS-02 CLOSED

ATT-SHIFT catalog consumer FE Condition **CNS-02** is **CLOSED**: QA-FE U65 browser Nest ShiftChange picker **PASS** (`ATTSHIFTQAFE-MSK6AJ8Z`) · QC-02 **GWC SEALED**. Catalog Option B Nest SoT (`public.work_shifts`) is **LOCKED** (ATT-SHIFT-CATALOG-SA/BA/BE). L1 invent KEY + soft-retire `ATTSHIFTQA-MSK5FXP3` **RETAIN**. DOCS SRS v0.36 CH05d **ACCEPT**. What remains is **not** another closable consumer picker residual — it is the **FE-ADMIN notes pack class** for the **SHIFT catalog alone** (orthogonal to ATT CODE/OT/COMP FE-ADMIN pack already HOLD):

| Residual / note | Severity | Surface inventory (AS-IS) | Proven already (RETAIN) |
|-----------------|----------|---------------------------|-------------------------|
| **`R-PLT-ATT-SHIFT-ADM-FE`** | **P2 HOLD NOTE** | Nest «Ca làm việc» **FE-ADMIN LIVE** on Attendance → tab **Ca** / submenu **Danh sách ca** — `Attendance.tsx` mounts `shifts-table` · `att-shifts-add` · `useWorkShifts` CRUD (`listWorkShifts` / `createWorkShift` / `updateWorkShift` / `deleteWorkShift` / `bulkDeleteShifts`) · admin open N+1 AC-PLT-ATT-SHIFT-01d class | Nest work_shifts L1 + invent KEY · Ca-tab CRUD LIVE · DOCS CH05d |
| **`R-PLT-ATT-SHIFT-MD-REF`** | **P2 HOLD NOTE** | Settings MasterData bucket `shifts` (`mdBucketRegistry` · `MasterDataSettingsPanel`) = **REF merge-read only** — description explicitly «không đồng ghi bảng Attendance work_shifts» · **FORBIDDEN** dual-write / sole SoT (ADR D1 · BR-PLT-06 · L-ATT-SHIFT-03) | ADR D1 · MD must_keep · BA REF lock |
| **`R-PLT-ATT-SHIFT-FE-ADMIN-01`** *(mint this seat)* | **P2 HOLD NOTE pack** | **Consolidation** of the two rows above into one board residual for U88 continuity · **does not** invent new product surface · **does not** reopen CNS-02 · **does not** reopen ATT CODE/OT/COMP FE-ADMIN HOLD · **does not** invent WORKSITE unlock | QC-02 GWC · CNS-02 CLOSED · L1 RETAIN · DOCS ACCEPT |

**Critical discrimination vs ATT CODE/OT/COMP FE-ADMIN ABSENT and vs DEC/REC/SI/PAY LIVE:**

| Catalog family | FE-ADMIN mount | FE-ADMIN persist client | Consumer FE / picker | Residual class this seat |
|----------------|----------------|-------------------------|----------------------|--------------------------|
| **ATT** CODE/OT/COMP | **ABSENT** (GET `listEffective*` only) | **ABSENT** create/update client | CLOSED | HOLD = deepen ABSENT Nest admin until sponsor — **OUT of this seat** (already packed in `R-PLT-ATT-FE-ADMIN-01`) |
| **ATT** work_shifts | Attendance tab **Ca** **LIVE** (`shifts-table` · `att-shifts-add`) | `createWorkShift` / `updateWorkShift` / `deleteWorkShift` **LIVE** via `useWorkShifts` | CNS-02 CLOSED (`ATTSHIFTQAFE-MSK6AJ8Z`) | HOLD = **no closable mount/persist gap** — NOTE pack (**DEC/REC/SI/PAY-class inventory**) |
| **ATT** WORKSITE | FE wire CNS-05 CLOSED | Nest work-sites admin (prior wave) | CNS-05 CLOSED | **Cite CLOSED peer only** — **do not invent unlock** |
| **DEC** decision-types | Settings tab **LIVE** | upsert/retire **LIVE** | CLOSED | HOLD LIVE twin cite |
| **EMP** ST Nest | **ABSENT** Nest ST admin | Network L1 only | CLOSED | HOLD ABSENT contrast cite only |

**Discrimination (must not confuse with consumer UNLOCK / CNS-02 reopen / CODE·OT·COMP FE-ADMIN unlock):**

| Class | When used | ATT work_shifts | This seat (FE-ADMIN notes) |
|-------|-----------|-----------------|----------------------------|
| **Consumer ShiftChange EFF / CNS-02** | Nest SoT + invent KEY + FE Nest EFF rebind | FE-01 → QA-FE `ATTSHIFTQAFE-MSK6AJ8Z` → **QC-02 GWC** · **CNS-02 CLOSED** | **OUT** — already SEALED — **FORBIDDEN reopen** |
| **FE-ADMIN / deepen ABSENT Nest admin panel** | Network L1 OK · product Nest admin CRUD FE OUT | **NOT SHIFT AS-IS** — Attendance Ca-tab admin **LIVE** | Cite CODE/OT/COMP peer class only for *pack structure contrast* — SHIFT audit → LIVE |
| **FE-ADMIN LIVE + no mount/persist gap** | Attendance Ca mount + CRUD wire + L1/browser admin CREATE proven | Admin shipped · AC-PLT-ATT-SHIFT-01d class | **THIS residual** → Option **A ACCEPT_AS_IS_P2 HOLD** |
| **Settings MD `shifts` REF** | Group REF merge-read · dual-write DENY | REF RETAIN (ADR D1) | **NOTE RETAIN** — **≠** closable FE-ADMIN mount gap — **≠** unlock trigger · **≠** sole SoT |
| **GĐ2 roster / schedule / OT submenu HOLD** | `shifts-schedule-hold` · `shifts-overtime-hold` featureInDev | must_keep honesty · no invent roster API | **NOTE RETAIN** — **≠** Ca-list FE-ADMIN gap · **≠** unlock Ca CRUD |
| **Invent / reopen / flip** | Invent second Nest work_shifts admin · reopen CNS-02 · reopen CODE/OT/COMP FE-ADMIN as unlock · invent LVRULE · invent WORKSITE unlock · flip attendance ready | REJECT | **Option C REJECT** |

**Board audit (closable consumer FE still OPEN? closable FE-ADMIN mount/persist gap?)**

| Candidate | Board / seal | Verdict for this seat |
|-----------|--------------|------------------------|
| ATT-SHIFT consumer CNS-02 ShiftChange Nest EFF | QC-02 GWC · `ATTSHIFTQAFE-MSK6AJ8Z` · **CNS-02 CLOSED** | **SEALED** — **FORBIDDEN reopen** |
| ATT-SHIFT L1 invent KEY + soft-retire | `ATTSHIFTQA-MSK5FXP3` · QC-01 GWC | **SEALED** — RETAIN |
| ATT-SHIFT DOCS SRS v0.36 CH05d | DOCS-01 ACCEPT | **RETAIN** |
| ATT-SHIFT-CATALOG-SA/BA/BE Option B | CONFIRMED · Nest SoT | **RETAIN** — not reopen |
| Nest work_shifts FE-ADMIN mount Attendance Ca | `Attendance.tsx` tab `shifts` · `data-testid="shifts-table"` · `att-shifts-add` · `useWorkShifts` enabled | **LIVE** — **no mount gap** |
| Nest work_shifts FE-ADMIN persist | `hrmApi` `createWorkShift` / `updateWorkShift` / `deleteWorkShift` · hook create/update/delete/bulkDelete | **LIVE** — **no persist gap** |
| Settings MD `shifts` | REF only · dual-write DENY | **REF RETAIN** — DENY sole SoT / dual-write |
| GĐ2 schedule/OT submenu | HOLD badge · featureInDev | **HOLD RETAIN** — not Ca-list gap |
| ATT CODE/OT/COMP FE-ADMIN pack | `R-PLT-ATT-FE-ADMIN-01` HOLD (SPEC 31734) | **HOLD RETAIN** — **FORBIDDEN reopen as unlock** · **FORBIDDEN fold SHIFT into that pack** |
| ATT-WORKSITE CNS-05 | `ATTWSQA2-MSJCG47P` CLOSED | **CLOSED cite** — **do not invent unlock** |
| LVRULE FE-01g | ACCEPT_AS_IS_P2 HOLD | **HOLD RETAIN** — DENY invent unlock |
| DEC/REC/PAY/SI FE-ADMIN packs | HOLD LIVE class peers | **HOLD RETAIN** — twin LIVE cite |

**Conclusion:** No named closable **ATT-SHIFT consumer** residual remains OPEN (CNS-02 CLOSED). READ-ONLY audit finds **no closable FE-ADMIN mount/persist gap** (Attendance Ca-tab `shifts-table` mounted + Nest CRUD clients wired via `useWorkShifts`). Residual class = **FE-ADMIN notes pack after LIVE admin + consumer CNS SEAL** → prefer Option **A** — residual stays **HOLD** (not UNLOCK to `dev-fe`).

### 1.2 READ-ONLY apps/web audit (cited — no edit)

| Surface | Path | Kind | Verdict |
|---------|------|------|---------|
| Nest work_shifts list client | `apps/web/hrm/src/integrations/hrmApi.ts` — `listWorkShifts` (~5402) → `GET /api/hrm/attendance/work-shifts` | GET F-ATT-CAT-SHIFT-01 admin list | **LIVE** RETAIN |
| Nest work_shifts admin persist clients | `hrmApi.ts` — `createWorkShift` (~5411 · POST) · `updateWorkShift` (~5418 · PATCH) · `deleteWorkShift` (~5427 · DELETE) | FE-ADMIN persist client | **LIVE** |
| Nest work_shifts effective client | `hrmApi.ts` — `listEffectiveWorkShifts` (~5462) → `GET …/work-shifts/effective` | GET F-ATT-CAT-SHIFT EFF consumer SoT | **LIVE** consumer |
| Admin CRUD hook | `apps/web/hrm/src/hooks/useWorkShifts.ts` — create/update/delete/bulkDelete · callers Attendance.tsx | FE-ADMIN mutate | **LIVE mount+persist** |
| Attendance Ca-tab shell | `apps/web/hrm/src/pages/Attendance.tsx` — tab `shifts` (~489) · `useWorkShifts({ enabled: activeTab === 'shifts' \|\| …})` (~569–570) · `data-testid="shifts-table"` (~3689) · `att-shifts-add` (~3626) · bulk delete dialog | product admin route | **MOUNTED LIVE** |
| Consumer EFF hook | `apps/web/hrm/src/hooks/useWorkShiftsEffective.ts` | Nest effective cache for ShiftChange | CNS-02 SEAL RETAIN |
| Catalog helpers | `apps/web/hrm/src/lib/workShiftCatalog.ts` · `.test.ts` | display-ready · bootstrap fallback EFF=0 only · resolve label | RETAIN |
| Consumer ShiftChange | `apps/web/hrm/src/components/attendance/ShiftChangeRequestTab.tsx` — Nest EFF when `activeCount > 0` else bootstrap fallback | Nest picker SEAL | SEAL RETAIN |
| Settings MD `shifts` REF | `apps/web/hrm/src/lib/mdBucketRegistry.ts` bucket `shifts` (~126–134) · `MasterDataSettingsPanel.tsx` must_keep «cấm work_shifts dual-write» · `.test.ts` asserts no upsertWorkShift dual-write | REF only | **REF RETAIN** · DENY sole SoT |
| GĐ2 schedule/OT hold | `Attendance.tsx` `shifts-schedule-hold` / `shifts-overtime-hold` · featureInDev | honesty HOLD | RETAIN · ≠ Ca-list gap |

**Audit finding (unlock gate):** Unlike ATT CODE/OT/COMP (GET `listEffective*` **only**, **no** create/update admin client, **no** admin panel) — which remain packed under **`R-PLT-ATT-FE-ADMIN-01` HOLD ABSENT** — ATT **work_shifts** ships **full FE-ADMIN path**: Attendance tab Ca mount + `useWorkShifts` CRUD + Nest create/update/delete clients. Consumer ShiftChange CNS-02 already proved Nest EFF picker + invent KEY discipline. Settings MD `shifts` is **REF**, not a missing Nest admin. GĐ2 roster submenu HOLD is honesty, **not** a Ca-list mount/persist defect. **No closable FE-ADMIN mount/persist gap** → Option A HOLD · **do not** `next_owner=dev-fe`.

### 1.3 Constraints

- Docs-only · **no** `apps/**` · **no** seed (U65)
- **DENY** invent Nest dual work_shifts admin FE as *new* mandatory continuous Task (admin already LIVE on Attendance Ca — invent would be dual/polish without sponsor)
- **DENY** reopen CNS-02 CLOSED · reopen QA-FE `ATTSHIFTQAFE-MSK6AJ8Z` · reopen L1 `ATTSHIFTQA-MSK5FXP3` as FAIL · reopen DOCS CH05d ACCEPT
- **DENY** reopen ATT CODE/OT/COMP FE-ADMIN HOLD (`R-PLT-ATT-FE-ADMIN-01`) **as unlock** · fold SHIFT residual into CODE/OT/COMP ABSENT invent
- **DENY** invent WORKSITE unlock (CNS-05 CLOSED peer cite only)
- **DENY** invent LVRULE 01g unlock · Settings/`shifts` sole SoT · MD dual-write · invent GĐ2 roster API as mandatory
- **DENY** flip `hrm_attendance_uat_ready` · `attendance_e2e_linkage_ready` · `payroll_e2e_ready` · `contracts_printable_ready`
- **DENY** claim module ATT UAT · Phase1 DONE · UF 🟢 whole attendance pillar
- BA AC packs for ATT-SHIFT **already locked** (ATT-SHIFT-CATALOG-BA-01) · this seat is **disposition**, not redefine Nest Option B SoT
- must_keep: **QC-02 GWC · CNS-02 CLOSED** · **L1 `ATTSHIFTQA-MSK5FXP3`** · **Nest `work_shifts` SoT** · **Attendance Ca FE-ADMIN LIVE** · **Settings `shifts` REF only** · **ADR D1** · **ATT CODE/OT/COMP FE-ADMIN HOLD** · **WORKSITE CNS-05 CLOSED** · **LVRULE HOLD** · **honesty false** · **C-SLICE**

### 1.4 Decision heuristic

| Rule | Application |
|------|-------------|
| Consumer CNS CLOSED + Nest is SoT + FE-ADMIN mount+persist LIVE | FE-ADMIN invent deepen = **Option B/C reject**; note = HOLD pack |
| Closable FE-ADMIN mount/persist gap found? | Audit: **NO** → residual **HOLD** · next_owner **pm** (not `dev-fe`) |
| Settings MD `shifts` REF alone? | **Not** a Nest FE-ADMIN mount/persist gap → **does not** unlock Option B |
| GĐ2 schedule/OT HOLD alone? | Honesty must_keep · **not** Ca-list CRUD gap → **does not** unlock |
| Unlock FE-ADMIN only if sponsor explicitly opens polish wave OR audit finds mount/persist gap | Board + audit: no gap · no sponsor FE-ADMIN polish message → **Option A** |
| No open closable ATT-SHIFT consumer FAIL residual | Prefer **A**; do not invent LVRULE / reopen CODE·OT·COMP FE-ADMIN / invent WORKSITE / flip attendance |

---

## 2. Options

### Option A — ACCEPT_AS_IS_P2 HOLD forever-until-sponsor for ATT-SHIFT FE-ADMIN notes — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Mint / stamp board residual **`R-PLT-ATT-SHIFT-FE-ADMIN-01`** as **P2 HOLD / NOTE pack** consolidating: (1) **`R-PLT-ATT-SHIFT-ADM-FE`** Nest work_shifts Attendance Ca-tab FE-ADMIN **LIVE** notes (mount+persist RETAIN · no further mandatory deepen); (2) **`R-PLT-ATT-SHIFT-MD-REF`** Settings/XBOS `shifts` REF-only notes (DENY dual-write / sole SoT). **Do not** invent `dev-fe` dual Nest admin panels. **Do not** invent ba-process AC pack. **Do not** reopen CNS-02 CLOSED. **Do not** reopen ATT CODE/OT/COMP FE-ADMIN HOLD as unlock. **Do not** invent WORKSITE unlock. Peer *pack structure + LIVE inventory* = DEC/REC/PAY/SI FE-ADMIN NOTES · **SHIFT AS-IS ≠ CODE/OT/COMP ABSENT**. Unlock ATT-SHIFT FE-ADMIN polish **only** if sponsor later explicitly opens «mở FE wave ATT-SHIFT FE-ADMIN polish / quản trị Ca làm việc» **or** a future audit finds a **named closable** mount/persist defect. |
| **Benefits** | Honors peer FE-ADMIN HOLD pack class · matches U88 bandwidth · honesty / C-SLICE intact · no seal churn · FE-ADMIN already covers Nest work_shifts CRUD · ShiftChange CNS SEAL RETAIN · Settings REF discipline RETAIN · CODE/OT/COMP HOLD untouched · WORKSITE CLOSED cite intact |
| **Costs** | Optional HDSD / UX polish for Ca-tab / soft-retire copy / GĐ2 roster remains deferred until sponsor; Condition KEEP on board (HOLD ≠ CLOSED) |
| **Risks** | Misread HOLD as «waive shift admin forever» or as permission to invent second Nest admin «to complete admin» or to reopen CNS-02 «while polishing admin» or to reopen CODE/OT/COMP FE-ADMIN as unlock or to flip `hrm_attendance_uat_ready` → mitigations **L-ATT-SHIFT-FE-ADMIN-*** |
| **Gate** | QC-02 GWC SEAL · CNS-02 CLOSED · L1 SEAL · Nest SoT RETAIN · FE-ADMIN LIVE (no gap) · honesty false |

### Option B — UNLOCK narrow FE-ADMIN deepen (`dev-fe`) if closable mount/persist gap

| | |
|--|--|
| **Description** | Unlock `dev-fe` **only if** READ-ONLY audit proves a **named closable** FE-ADMIN defect: Attendance Ca tab **not mounted**, `shifts-table` / `att-shifts-add` **missing**, or create/update/delete **unwired** / persist fail class. Optionally narrow polish for soft-retire UI copy / HDSD **only** when sponsor names click-path UF. |
| **Benefits** | Would close a true product admin hole if one existed; would close polish UF if sponsor prioritizes. |
| **Costs** | On AS-IS audit: Ca tab **mounted**, `useWorkShifts` **LIVE**, CRUD **wired** (`createWorkShift`/`updateWorkShift`/`deleteWorkShift`), L1 admin CREATE proven (`ATTSHIFTQA-MSK5FXP3`), consumer Nest EFF **LIVE** (CNS-02 CLOSED). Unlocking now invents polish / dual work **without gap** — same risk as invent DEC Nest dual without sponsor. Treating GĐ2 roster HOLD or Settings REF as unlock forces bandwidth without mount/persist defect. |
| **Risks** | Scope creep · reopen CNS-02 as FAIL «while wiring admin» · reopen CODE/OT/COMP FE-ADMIN · flip attendance ready · duplicate BA seat · confuse Settings REF with Nest admin · invent roster API. |
| **Gate** | **Reject as default** — audit finds **no** closable mount/persist gap. Retain B only if future audit/sponsor names an explicit gap or sponsor opens polish UF. |

### Option C — REJECT invent Nest dual work_shifts admin / invent LVRULE / reopen CNS-02 / reopen CODE·OT·COMP FE-ADMIN as unlock / invent WORKSITE unlock / flip attendance UAT

| | |
|--|--|
| **Description** | Invent second Nest work_shifts admin CRUD surface (e.g. Settings dual-write master or parallel admin outside Ca tab) as mandatory continuous Task; invent LVRULE 01g unlock; reopen CNS-02 CLOSED / QA-FE stamp as FAIL; reopen ATT CODE/OT/COMP FE-ADMIN HOLD as unlock; invent WORKSITE unlock; treat Settings `shifts` as sole SoT; invent GĐ2 roster API as mandatory; flip `hrm_attendance_uat_ready` / claim module ATT UAT / Phase1 / seed. |
| **Benefits** | None for G→1 honesty. |
| **Costs** | Seal churn · sponsor trust · C-SLICE violation · dual admin path confusion · ADR D1 breach · CODE/OT/COMP HOLD reopen · WORKSITE invent · attendance ready false claim. |
| **Risks** | **REJECT** — all DENY lines in §1.3. |

---

## 3. Trade-off matrix

| Criteria | Weight | **A ACCEPT HOLD P2** | B Unlock FE-ADMIN gap | C Invent/reopen/flip |
|----------|-------:|---------------------:|----------------------:|---------------------:|
| Honesty / DENY invent Nest dual work_shifts admin | 5 | **5** | 2 | 0 |
| Seal safety (CNS-02 CLOSED · L1 · CODE/OT/COMP FE-ADMIN HOLD · WORKSITE CLOSED · LVRULE · DEC peers) | 5 | **5** | 3 | 0 |
| Match peer FE-ADMIN NOTES pack class (DEC/REC/SI/PAY LIVE twin) | 5 | **5** | 1 | 0 |
| Business value (close true mount/persist gap) | 3 | 2 | **4** *(if gap)* / 1 *(no gap)* | 1 |
| U88 continuous bandwidth | 4 | **5** | 1 | 0 |
| Complexity / blast radius | 4 | **5** | 2 | 0 |
| Maintainability (Nest SoT + LIVE Ca admin + Settings REF + ADR D1) | 4 | **5** | 2 | 0 |
| **Weighted** | | **128** | ≈52 | 3 |

*(Weighted = Σ weight×score; A dominates when audit shows no gap.)*

---

## 4. Failure modes and mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| **A** | HOLD misread as AC waive / shift admin «N/A forever without stamp» | Evidence claims ATT-SHIFT FE-ADMIN waived | Stamp **ACCEPT_AS_IS_P2 HOLD** · AC RETAIN deferred · Condition KEEP on board |
| **A** | Silent invent second Nest work_shifts admin «to finish admin» (Settings dual-write / dual master) | Diff dual CRUD / MD upsertWorkShift / duplicate panels | **FORBIDDEN** · L-ATT-SHIFT-FE-ADMIN-03 Nest dual DENY · Ca-tab admin LIVE RETAIN · MD REF RETAIN |
| **A** | Reopen CNS-02 CLOSED / QA-FE stamp under «admin polish» | Diff ShiftChangeRequestTab sealed paths / stamp reopen | Cite `ATTSHIFTQAFE-MSK6AJ8Z` SEAL · DENY |
| **A** | Reopen ATT CODE/OT/COMP FE-ADMIN HOLD as unlock (ABSENT invent) under «ATT FE-ADMIN wave» | Bus invents CODE/OT/COMP admin citing this seat | Cite §1.1 discrimination · SHIFT LIVE ≠ CODE/OT/COMP ABSENT · L-ATT-SHIFT-FE-ADMIN-06 |
| **A** | Invent WORKSITE unlock / invent LVRULE / flip attendance ready | Diff WorkSite / LeaveTab / honesty matrix | DENY · CNS-05 CLOSED cite · LVRULE HOLD · ready false |
| **A** | Mis-equate SHIFT LIVE admin with CODE/OT/COMP ABSENT → dispatch invent FE for wrong catalogs | Bus invents att-code admin citing SHIFT | Cite ATT-FE-ADMIN pack HOLD RETAIN · SHIFT seat OWN only |
| **A** | Treat Settings MD `shifts` mutate as ops SoT PASS / dual-write | Diff MD panel wiring to Nest work_shifts | L-ATT-SHIFT-FE-ADMIN-04 · ADR D1 · BR-PLT-06 |
| **A** | Invent GĐ2 roster/schedule API under FE-ADMIN polish | Diff Attendance schedule submenu | L-ATT-SHIFT-FE-ADMIN-11 · featureInDev HOLD RETAIN |
| B | Unlock without mount/persist gap | Bus DISPATCHED `dev-fe` ATT-SHIFT FE-ADMIN without gap evidence | Prefer A; B only gap-or-sponsor |
| C | Ready flip / Nest invent / CNS-02 reopen / CODE·OT·COMP unlock | Honesty matrix / seals | DENY · NO-GO process |

---

## 5. Decision

| | |
|--|--|
| **Selected** | **Option A** — architecture **LOCKED** |
| **Seat verdict** | **CONFIRMED** |
| **Disposition** | **ACCEPT_AS_IS_P2 HOLD** on **`R-PLT-ATT-SHIFT-FE-ADMIN-01`** (pack includes `R-PLT-ATT-SHIFT-ADM-FE` + `R-PLT-ATT-SHIFT-MD-REF`) |
| **Why A** | ATT-SHIFT QC-02 GWC SEAL · CNS-02 **CLOSED** (`ATTSHIFTQAFE-MSK6AJ8Z`); L1 `ATTSHIFTQA-MSK5FXP3` SEAL RETAIN; DOCS SRS v0.36 CH05d ACCEPT; Nest is SoT (Option B `work_shifts` · ADR D1); Attendance Ca-tab FE-ADMIN panel **LIVE** (`useWorkShifts` mount + create/update/delete persist) — audit finds **no closable FE-ADMIN mount/persist gap**. Settings MD `shifts` REF ≠ gap. GĐ2 schedule/OT HOLD ≠ gap. Residual = NOTE pack peer DEC/REC/SI/PAY FE-ADMIN HOLD *structure + LIVE inventory*, not CODE/OT/COMP ABSENT invent. Option B unlock **not** gap-evidenced. Option C DENY. |
| **Rejected** | **B** as default unlock · **C** invent Nest dual / reopen CNS-02 / reopen CODE·OT·COMP FE-ADMIN / invent WORKSITE / flip |
| **Assumptions** | Sponsor has **not** opened ATT-SHIFT FE-ADMIN polish wave in this message; ATT CODE/OT/COMP FE-ADMIN HOLD remain HOLD; LVRULE 01g remains HOLD; WORKSITE CNS-05 remains CLOSED; honesty flags remain false; CNS-02 CLOSED remains SEAL. |
| **residual** | **`R-PLT-ATT-SHIFT-FE-ADMIN-01` = HOLD** (not UNLOCK) |
| **next_owner** | **pm** (not `dev-fe`) |

### 5.1 Unlock gates (what Option A does **not** open)

| Question | Answer |
|----------|--------|
| Unlock ba-process new AC pack? | **HOLD** — ATT-SHIFT-CATALOG-BA-01 already locked · **no** duplicate BA seat for admin invent |
| Unlock ba-data / new Nest tables? | **FORBIDDEN** — `work_shifts` already LIVE (Option B) · no schema change · no second shifts table · no fold into att_attendance_code / leave / worksite |
| Unlock ATT-SHIFT FE-ADMIN mandatory `dev-fe`? | **HOLD** — audit shows LIVE mount+persist · no closable gap |
| Unlock / reopen CNS-02 CLOSED / QA-FE / L1 as FAIL? | **FORBIDDEN** |
| Unlock ATT CODE/OT/COMP FE-ADMIN HOLD as invent admin? | **FORBIDDEN** — separate ABSENT pack · RETAIN HOLD |
| Invent WORKSITE unlock / LVRULE 01g / Settings sole SoT / GĐ2 roster API? | **FORBIDDEN** |
| May PM flip `hrm_attendance_uat_ready` / claim module ATT UAT? | **NO** |
| May PM remove Condition from board as CLOSED? | **NO** — keep **HOLD P2** stamp · ACCEPT_AS_IS ≠ CLOSED Condition · ≠ WAIVED |

### 5.2 When sponsor later opens ATT-SHIFT FE-ADMIN polish wave (narrow alternate — not default)

```text
entry: sponsor message contains explicit «mở FE wave ATT-SHIFT FE-ADMIN polish / quản trị Ca làm việc»
   OR future READ-ONLY audit cites named closable mount/persist gap with path+symptom
   OR sponsor explicitly opens «ATT-SHIFT soft-retire / HDSD polish UF» (narrow — not mount invent)
retain: ATTSHIFTQAFE-MSK6AJ8Z CNS-02 CLOSED · ATTSHIFTQA-MSK5FXP3 L1 SEAL · DOCS CH05d ACCEPT
       · ATT-SHIFT-CATALOG Option B SoT · ADR D1 · Settings shifts REF
       · R-PLT-ATT-FE-ADMIN-01 CODE/OT/COMP HOLD · WORKSITE CNS-05 CLOSED · LVRULE HOLD · honesty false
scope_allowed:
  1) optional ba-process ADD-only UF inventory for Attendance Ca-tab polish · NOT redefine Nest Option B schema
  2) dev-fe: narrow polish on Attendance.tsx / useWorkShifts UX copy ONLY (already LIVE admin)
scope_FORBIDDEN:
  - new Nest tables / schema change (work_shifts already SoT) · fold into code/leave/worksite
  - Settings/`shifts` sole SoT / MD dual-write (ADR D1 REJECT forever)
  - reopen CNS-02 CLOSED · reopen L1 / DOCS as FAIL
  - reopen ATT CODE/OT/COMP FE-ADMIN HOLD as unlock · invent CODE/OT/COMP Nest admin
  - invent WORKSITE unlock · invent LVRULE 01g · invent GĐ2 roster API · flip attendance ready
  - module ATT UAT / Phase1 / seed
exit: R-PLT-ATT-SHIFT-*-FE-ADMIN may CLOSE; R-PLT-ATT-SHIFT-FE-ADMIN-01 pack may narrow; honesty false RETAIN · C-SLICE
```

### 5.3 Architecture boundary diagram (text)

```text
  Nest public.work_shifts L1 + invent KEY ATTSHIFTQA-MSK5FXP3 --> SEALED RETAIN (Option B SoT · ADR D1)
  F-ATT-CAT-SHIFT-01 list (admin SoT)                         --> LIVE Nest
  F-ATT-CAT-SHIFT EFF /work-shifts/effective                  --> LIVE Nest (consumer SoT)
  F-ATT-CAT-SHIFT-02 admin create/update/delete open N+       --> LIVE (Ca-tab + Network L1)
  ShiftChange consumer Nest EFF CNS-02                        --> CLOSED SEAL (ATTSHIFTQAFE-MSK6AJ8Z)
  DOCS SRS v0.36 CH05d                                        --> ACCEPT RETAIN

  ATT Nest admin FE Attendance tab Ca
       useWorkShifts + shifts-table + att-shifts-add          --> LIVE (no mount/persist gap) · NOTE HOLD

  Settings/XBOS shifts MD bucket
       mdBucketRegistry / MasterDataSettingsPanel             --> REF only · dual-write DENY · NOTE HOLD

  GĐ2 schedule / OT submenu
       shifts-schedule-hold / shifts-overtime-hold            --> honesty HOLD RETAIN (≠ Ca-list gap)

  R-PLT-ATT-SHIFT-FE-ADMIN-01 (pack of ADM-FE + MD-REF)       --> ACCEPT_AS_IS_P2 HOLD
  R-PLT-ATT-FE-ADMIN-01 CODE/OT/COMP ABSENT pack              --> HOLD RETAIN (FORBIDDEN reopen-as-unlock)
  WORKSITE CNS-05 / LVRULE / DEC·REC·PAY·SI FE-ADMIN          --> CLOSED/HOLD RETAIN
  hrm_attendance_uat_ready / payroll / printable              --> false RETAIN · C-SLICE

  DISCRIMINATION: CODE/OT/COMP FE-ADMIN ABSENT ≠ SHIFT FE-ADMIN LIVE (DEC/REC/SI/PAY-class)
  all packs end HOLD · different inventory reasons · SHIFT seat does NOT reopen CODE/OT/COMP
```

---

## 6. Locks (L-ATT-SHIFT-FE-ADMIN-*)

| Lock | Rule |
|------|------|
| **L-ATT-SHIFT-FE-ADMIN-01 HOLD ≠ WAIVE** | ACCEPT_AS_IS_P2 **does not** delete AC-PLT-ATT-SHIFT-01* · admin polish AC remains deferred FAIL-if-claimed until sponsor wave |
| **L-ATT-SHIFT-FE-ADMIN-02 CNS-02 SEAL frozen** | `ATTSHIFTQAFE-MSK6AJ8Z` · QC-02 GWC · **CNS-02 CLOSED** · L1 `ATTSHIFTQA-MSK5FXP3` · DOCS CH05d ACCEPT **FORBIDDEN reopen as FAIL** |
| **L-ATT-SHIFT-FE-ADMIN-03 Nest dual DENY** | No invent second Nest work_shifts admin CRUD FE / Settings dual-write master without sponsor polish wave / named gap |
| **L-ATT-SHIFT-FE-ADMIN-04 Settings REF ≠ sole SoT** | Settings/XBOS `shifts` remain **REF** · dual-write / sole SoT **REJECT RETAIN** (ADR D1 · BR-PLT-06 · L-ATT-SHIFT-03) |
| **L-ATT-SHIFT-FE-ADMIN-05 Attendance ready frozen** | DENY flip `hrm_attendance_uat_ready` · `attendance_e2e_linkage_ready` · `payroll_e2e_ready` · `contracts_printable_ready` |
| **L-ATT-SHIFT-FE-ADMIN-06 CODE/OT/COMP FE-ADMIN HOLD RETAIN** | DENY reopen `R-PLT-ATT-FE-ADMIN-01` **as unlock** · DENY fold SHIFT into CODE/OT/COMP ABSENT invent |
| **L-ATT-SHIFT-FE-ADMIN-07 LVRULE HOLD** | DENY invent LVRULE 01g unlock |
| **L-ATT-SHIFT-FE-ADMIN-08 Honesty** | DENY flip ready flags · C-SLICE RETAIN · DENY module ATT UAT |
| **L-ATT-SHIFT-FE-ADMIN-09 Condition KEEP** | ACCEPT_AS_IS ≠ CLOSED ≠ WAIVED · keep HOLD P2 on board |
| **L-ATT-SHIFT-FE-ADMIN-10 LIVE ≠ ABSENT** | SHIFT Attendance Ca admin LIVE must not be narrated as CODE/OT/COMP-style ABSENT invent trigger |
| **L-ATT-SHIFT-FE-ADMIN-11 GĐ2 roster must_keep** | schedule/OT submenu featureInDev HOLD — **FORBIDDEN** invent roster API under catalog polish |
| **L-ATT-SHIFT-FE-ADMIN-12 Nest SoT RETAIN** | Nest `work_shifts` remain Option B SoT · Settings REF only · no second table · no fold into code/leave/worksite |
| **L-ATT-SHIFT-FE-ADMIN-13 Admin ≠ consumer CNS** | ShiftChange CNS-02 sealed CLOSED; admin open N+ RETAIN · consumer READY ≠ FE-ADMIN mount gap |
| **L-ATT-SHIFT-FE-ADMIN-14 WORKSITE CLOSED cite** | CNS-05 CLOSED (`ATTWSQA2-MSJCG47P`) — cite peer only · **FORBIDDEN invent WORKSITE unlock** |
| **L-ATT-SHIFT-FE-ADMIN-15 Path lock** | UTF-8 no BOM on NFD `.git`+`apps` True tree |
| **L-ATT-SHIFT-FE-ADMIN-16 Peer LIVE HOLD RETAIN** | DENY reopen DEC/REC/PAY/SI FE-ADMIN HOLD as unlock |

---

## 7. Impacted systems & non-goals

| In scope (docs disposition) | OUT / FORBIDDEN |
|-----------------------------|-----------------|
| Board residual `R-PLT-ATT-SHIFT-FE-ADMIN-01` ACCEPT_AS_IS_P2 HOLD | `apps/**` edits · migration · seed |
| Option A/B/C + LOCKED A → next_dispatch PM | Invent Nest work_shifts dual admin CRUD FE |
| Cite peer DEC/REC/PAY/SI FE-ADMIN HOLD LIVE pack class | Reopen CNS-02 CLOSED / L1 / DOCS as FAIL |
| Consolidate FE-ADMIN LIVE + Settings REF NOTES into pack | Reopen CODE/OT/COMP FE-ADMIN HOLD as unlock · invent LVRULE · invent WORKSITE unlock · flip attendance |
| U88 PM continue next vertical/governance | Flip attendance ready · module ATT UAT · Phase1 DONE |
| Nest work_shifts SoT + LIVE Ca admin + Settings REF RETAIN | Settings sole SoT · MD dual-write · invent GĐ2 roster · fold into code/leave/worksite |

---

## 8. Validation / acceptance evidence plan

| Checkpoint | PASS when |
|------------|-----------|
| Spec ≥8KB on NFD `.git` toplevel | This file Length verified (≥8192; target peer ≥25KB) |
| Status | **CONFIRMED** · Option **A** **LOCKED** |
| Residual | `R-PLT-ATT-SHIFT-FE-ADMIN-01` minted · **HOLD** P2 (not CLOSED · not WAIVED · not UNLOCK) |
| next_dispatch | ACCEPT HOLD seal to **pm** · **not** invent ba-process/FE Nest dual · **not** `dev-fe` |
| Honesty | ready=false · C-SLICE · DENY Nest dual invent · DENY CNS-02 reopen · DENY CODE/OT/COMP FE-ADMIN unlock · DENY WORKSITE invent · DENY LVRULE invent · DENY flip attendance |
| Peer seals | CNS-02 CLOSED · L1 · DOCS CH05d · CODE/OT/COMP FE-ADMIN HOLD · WORKSITE CNS-05 CLOSED · LVRULE HOLD · DEC LIVE HOLD RETAIN |
| Audit | Mount LIVE + persist LIVE cited · no closable gap used to force Option B |

---

## 9. Peer seal RETAIN checklist (FORBIDDEN reopen)

| Seal / HOLD | Stamp / id | Action |
|-------------|------------|--------|
| ATT-SHIFT consumer CNS-02 ShiftChange Nest EFF | `ATTSHIFTQAFE-MSK6AJ8Z` · QC-02 GWC · **CNS-02 CLOSED** | RETAIN · DENY reopen |
| ATT-SHIFT L1 invent KEY + soft-retire | `ATTSHIFTQA-MSK5FXP3` · QC-01 GWC | RETAIN |
| ATT-SHIFT DOCS SRS v0.36 CH05d | DOCS-01 ACCEPT | RETAIN |
| ATT-SHIFT-CATALOG-SA/BA/BE Option B | CONFIRMED Nest SoT · ADR D1 | RETAIN |
| Attendance Ca FE-ADMIN LIVE | `useWorkShifts` · `shifts-table` · CRUD clients | RETAIN · NOTE HOLD (no gap) |
| Settings MD `shifts` REF | dual-write DENY | RETAIN |
| ATT CODE/OT/COMP FE-ADMIN pack | `R-PLT-ATT-FE-ADMIN-01` HOLD (SPEC 31734) | RETAIN · DENY reopen-as-unlock |
| ATT-WORKSITE CNS-05 | `ATTWSQA2-MSJCG47P` CLOSED | RETAIN · cite only · DENY invent unlock |
| LVRULE 01g | ACCEPT_AS_IS_P2 HOLD | RETAIN · DENY invent unlock |
| DEC FE-ADMIN | `R-PLT-DEC-FE-ADMIN-01` HOLD (SPEC 61534) | RETAIN · twin LIVE class |
| REC FE-ADMIN | `R-PLT-REC-FE-ADMIN-01` HOLD (SPEC 55083) | RETAIN · twin LIVE class |
| PAY FE-ADMIN | `R-PLT-PAY-FE-ADMIN-01` HOLD (SPEC 49325) | RETAIN · twin LIVE class |
| SI FE-ADMIN | `R-PLT-SI-FE-ADMIN-01` HOLD (SPEC 40113) | RETAIN · twin LIVE class |
| EMP FE-ADMIN / EMP-CF FE | HOLD packs | RETAIN · DENY reopen-as-unlock |
| GĐ2 schedule/OT submenu | featureInDev HOLD | RETAIN · ≠ Ca-list gap |

---

## 10. completion_report

**Closed:** SA Option/F.1 for ATT **work_shifts FE-ADMIN notes** after ATT-SHIFT catalog CNS-02 CLOSED — READ-ONLY apps/web audit shows Attendance tab **Ca** FE-ADMIN **mounted** (`shifts-table` · `att-shifts-add`), `useWorkShifts` create/update/delete/bulkDelete **LIVE**, `hrmApi` Nest work_shifts clients list/create/update/delete **LIVE** (~5400–5431) + effective consumer client (~5462) (contrast CODE/OT/COMP GET-only ABSENT admin; match DEC/REC/SI/PAY LIVE class); QC-02 GWC · **CNS-02 CLOSED** · QA-FE **PASS** `ATTSHIFTQAFE-MSK6AJ8Z`; L1 `ATTSHIFTQA-MSK5FXP3` **RETAIN**; DOCS SRS v0.36 CH05d **ACCEPT**; Settings MD `shifts` REF-only (dual-write DENY · ADR D1) ≠ sole SoT; GĐ2 schedule/OT HOLD ≠ FE-ADMIN gap; board audit shows **no** open closable ATT-SHIFT consumer FAIL residual and **no** closable FE-ADMIN mount/persist gap; class = FE-ADMIN NOTES pack after LIVE admin + CNS SEAL (peer DEC/REC/SI/PAY FE-ADMIN HOLD *structure + LIVE inventory*); Option **A/B/C** evaluated; **Option A LOCKED ACCEPT_AS_IS_P2 HOLD**; mint **`R-PLT-ATT-SHIFT-FE-ADMIN-01`** (packs SHIFT-ADM-FE + SHIFT-MD-REF); residual **HOLD** (not UNLOCK); ba-process/FE **HOLD**; DENY invent Nest dual · invent LVRULE · reopen CNS-02 · reopen CODE/OT/COMP FE-ADMIN HOLD as unlock · invent WORKSITE unlock · Settings sole SoT · invent GĐ2 roster · flip attendance ready; honesty false · C-SLICE · docs-only · no `apps/**`.

**Open / residual:** Condition **`R-PLT-ATT-SHIFT-FE-ADMIN-01`** remains **HOLD P2** on W8 board until sponsor opens ATT-SHIFT FE-ADMIN polish wave (or future named mount/persist gap); ready flags false.

**RETAIN:** L1 `ATTSHIFTQA-MSK5FXP3` · CNS-02 CLOSED · DOCS CH05d · `R-PLT-ATT-FE-ADMIN-01` CODE/OT/COMP HOLD · WORKSITE CNS-05 CLOSED · LVRULE HOLD · DEC/REC/PAY/SI FE-ADMIN HOLD · honesty false · C-SLICE.

**next_owner:** **pm**

**ack_status:** **PASS_TO_PM** · **CONFIRMED** · Option **A** **LOCKED**

**evidence_path:** `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-FE-ADMIN-NOTES-SA-01.md`

### next_dispatch_prompt (copy-ready — U88 next peer)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-FE-ADMIN-NOTES-SA-01
from_role: sa
to_role: pm
lane: governance · U88
ack_status: PASS_TO_PM
verdict: Option A LOCKED — ACCEPT_AS_IS_P2 HOLD on R-PLT-ATT-SHIFT-FE-ADMIN-01
selected_option: A
residual: R-PLT-ATT-SHIFT-FE-ADMIN-01 = HOLD (not UNLOCK · not CLOSED · not WAIVED)
next_owner: pm (NOT dev-fe — no closable FE-ADMIN mount/persist gap)
action:
  1) Seal board residual R-PLT-ATT-SHIFT-FE-ADMIN-01 = ACCEPT_AS_IS_P2 HOLD (Condition KEEP — not CLOSED; not WAIVED)
     · pack includes R-PLT-ATT-SHIFT-ADM-FE (Attendance Ca-tab Nest CRUD LIVE · no gap)
     · + R-PLT-ATT-SHIFT-MD-REF (Settings/XBOS shifts REF only · dual-write DENY · ADR D1)
  2) DENY invent ba-process / Nest dual admin / Settings sole SoT / GĐ2 roster Tasks from this residual
  3) RETAIN: ATTSHIFTQAFE-MSK6AJ8Z CNS-02 CLOSED · L1 ATTSHIFTQA-MSK5FXP3 · DOCS SRS v0.36 CH05d ACCEPT
     · R-PLT-ATT-FE-ADMIN-01 CODE/OT/COMP HOLD (FORBIDDEN reopen as unlock)
     · WORKSITE CNS-05 CLOSED ATTWSQA2-MSJCG47P (cite only — do not invent unlock)
     · LVRULE 01g HOLD · DEC/REC/PAY/SI FE-ADMIN HOLD
     · honesty false · C-SLICE
  4) Continue U88 next vertical/governance peer per continuous board
     — DENY invent LVRULE unlock · DENY reopen CNS-02 · DENY reopen CODE/OT/COMP FE-ADMIN HOLD as unlock
     — DENY invent WORKSITE unlock · DENY flip hrm_attendance_uat_ready
sponsor_gated_reopen_only: explicit «mở FE wave ATT-SHIFT FE-ADMIN polish / quản trị Ca làm việc»
  → then narrow Attendance Ca-tab polish ONLY (Nest Option B schema RETAIN · no new tables · no CODE/OT/COMP invent)
evidence: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-FE-ADMIN-NOTES-SA-01.md
```

**DENY alternate:** invent Nest dual work_shifts admin · Settings/`shifts` sole SoT · MD dual-write · invent LVRULE 01g · reopen CNS-02 CLOSED · reopen ATT CODE/OT/COMP FE-ADMIN HOLD as unlock · invent WORKSITE unlock · invent GĐ2 roster API · flip `hrm_attendance_uat_ready` · claim module ATT UAT / Phase1 DONE · seed · apps/**.

---

## 11. F.1 API / DB disposition notes (governance — no physical unlock)

| Layer | Disposition |
|-------|-------------|
| **DB** | No ADD table · Nest `public.work_shifts` remain **LIVE SoT (Option B · ADR D1)** — this seat does **not** open ba-data · no schema change · no second shifts table · no fold into `att_attendance_code` / leave / worksite |
| **API** | No new Nest admin CRUD FE routes required; BE CREATE/PATCH/DELETE admin endpoints already proven at **Network L1** (`ATTSHIFTQA-MSK5FXP3`) + Ca-tab FE (RETAIN); `GET /effective` consumers RETAIN |
| **FE consumer** | CNS-02 CLOSED RETAIN — **out of scope** (`useWorkShiftsEffective` · `ShiftChangeRequestTab` · `workShiftCatalog`) |
| **FE admin** | Nest work_shifts Attendance Ca CRUD **LIVE HOLD NOTE** (no closable mount/persist gap) — polish deferred until sponsor |
| **Settings MD** | `shifts` bucket **REF only** · dual-write DENY RETAIN |
| **F.1 completeness** | Disposition complete for residual class; physical F.1 for Nest work_shifts admin polish deferred until sponsor FE-ADMIN polish wave (optional BA ADD click-path only) |

### 11.1 F.1 function map (disposition — no new contract)

| Function | Path | Mục đích | Nghiệp vụ xử lý | Tham chiếu bước SRS | Disposition |
|----------|------|----------|-----------------|---------------------|-------------|
| F-ATT-CAT-SHIFT-01 list | `GET /api/hrm/attendance/work-shifts` | Admin list Nest shifts | Scope by company · active/inactive per soft-retire deepen | SRS CH05d · AC-PLT-ATT-SHIFT-01d admin | **RETAIN LIVE** |
| F-ATT-CAT-SHIFT EFF | `GET /api/hrm/attendance/work-shifts/effective` | Consumer picker SoT | Active-only display-ready | VAL-ATT-SHIFT-CNS-02 · CNS-02 CLOSED | **RETAIN SEAL** |
| F-ATT-CAT-SHIFT-02 create | `POST /api/hrm/attendance/work-shifts` | Admin open N+1 | Open `code` · no closed morning/afternoon ceiling | AC-PLT-ATT-SHIFT-01d | **RETAIN LIVE** |
| F-ATT-CAT-SHIFT-02 update | `PATCH /api/hrm/attendance/work-shifts/:id` | Admin edit | Times/coeff/name · soft-retire status | CH05d | **RETAIN LIVE** |
| F-ATT-CAT-SHIFT-02 delete | `DELETE /api/hrm/attendance/work-shifts/:id` | Admin remove/retire path | Prefer soft-retire deepen · hard DELETE residual noted in catalog SA | L1 RETAIN | **RETAIN** · polish HOLD |
| Invent KEY | ShiftChange create | Reject invent when EFF>0 | `HRM-ATT-SHIFT-KEY` | VAL-ATT-SHIFT-CNS · L1 | **RETAIN SEAL** |

### 11.2 DB physical (disposition — no unlock)

| Table / object | Role | Disposition |
|----------------|------|-------------|
| `public.work_shifts` | Nest ops SoT (ADR D1) | **RETAIN LIVE** · no ADD · no second table |
| Settings/XBOS `shifts` partition | Group REF merge-read | **REF RETAIN** · dual-write DENY |
| `att_attendance_code` / `att_ot_type` / `att_ot_comp_type` | Orthogonal ATT catalogs | **OUT** — CODE/OT/COMP FE-ADMIN HOLD pack · **FORBIDDEN fold** |
| `attendance_work_sites` | Orthogonal worksite | **OUT** — CNS-05 CLOSED cite only |

---

## 12. References

| Artifact | Role |
|----------|------|
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-ADMIN-NOTES-SA-01.md` | Twin ACCEPT_AS_IS_P2 HOLD LIVE class (`R-PLT-DEC-FE-ADMIN-01` · SPEC 61534) |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-ADMIN-NOTES-SA-01.md` | Twin LIVE FE-ADMIN HOLD (SPEC 55083) |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01.md` | CODE/OT/COMP ABSENT pack HOLD (SPEC 31734) — contrast · FORBIDDEN reopen |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-SA-01.md` | Catalog Option B Nest SoT · ADR D1 |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BA-01.md` | AC-PLT-ATT-SHIFT-01* · admin≠consumer |
| `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` | Continuous board · ATT-SHIFT rows · FE-ADMIN NOTES DISPATCHED |
| `apps/web/hrm/src/pages/Attendance.tsx` | READ-ONLY audit: Ca-tab LIVE mount |
| `apps/web/hrm/src/hooks/useWorkShifts.ts` | READ-ONLY audit: admin CRUD LIVE |
| `apps/web/hrm/src/hooks/useWorkShiftsEffective.ts` | READ-ONLY audit: consumer EFF SEAL |
| `apps/web/hrm/src/components/attendance/ShiftChangeRequestTab.tsx` | READ-ONLY audit: CNS-02 consumer |
| `apps/web/hrm/src/integrations/hrmApi.ts` §5400–5468 | READ-ONLY audit: admin+eff clients LIVE |
| `apps/web/hrm/src/lib/mdBucketRegistry.ts` · `MasterDataSettingsPanel.tsx` | READ-ONLY audit: Settings `shifts` REF |
| `.cursor/templates/ADR_OPTION_TEMPLATE.md` | Option evaluation structure |

---

## 13. Expanded rationale (audit trail for PM / QC)

### 13.1 Why this is not consumer UNLOCK class

ATT-SHIFT-CATALOG shipped a **consumer** FE binding (EFF hook + ShiftChangeRequestTab Nest rebind — VAL-ATT-SHIFT-CNS-02). That consumer Condition (CNS-02) was executed by dev-fe, verified by QA-FE (U65 browser Nest picker + invent KEY discipline), and CLOSED at QC-02 GWC (`ATTSHIFTQAFE-MSK6AJ8Z`). This seat owns **only** the remaining **FE-ADMIN notes** class for the SHIFT catalog. Treating FE-ADMIN as another mandatory `dev-fe` wave without a mount/persist gap would invent polish bandwidth and risk reopening CNS-02 — violating DENY lines already stamped on ATT-SHIFT QC-02 and on DEC/REC/SI/PAY FE-ADMIN HOLD peers.

### 13.2 Why SHIFT FE-ADMIN is LIVE (not CODE/OT/COMP ABSENT)

`ATT-FE-ADMIN-NOTES-SA-01` correctly HOLDs CODE/OT/COMP because those catalogs ship **GET `listEffective*` only** with **no** create/update FE client and **no** admin panel (Network L1 is the admin path). ATT **work_shifts** is a different inventory: Attendance tab **Ca** already binds Nest CRUD via `useWorkShifts` (`listWorkShifts`/`createWorkShift`/`updateWorkShift`/`deleteWorkShift`) with UI chrome (`shifts-table`, `att-shifts-add`, bulk delete). Therefore SHIFT must be disposed as **LIVE FE-ADMIN NOTE pack** (DEC/REC/SI/PAY-class), **not** as ABSENT invent unlock. **This seat must not reopen CODE/OT/COMP HOLD as unlock.**

### 13.3 Why Nest SoT (ADR D1) + Settings REF shapes this pack

Catalog Option B + ADR D1 lock ops SoT = Nest `work_shifts`; Settings/XBOS partition `shifts` = group REF only. MasterDataSettingsPanel must_keep forbids dual-write. Therefore there is **no** «Settings path missing» unlock and **no** permission to treat MD mutate as ops SoT PASS. The admin SoT path is Nest itself via Attendance Ca-tab (LIVE). Residual = NOTE pack, not Settings gap unlock.

### 13.4 Why Nest work_shifts admin FE stays HOLD (not invent deepen)

Ca-tab admin CREATE/PATCH/DELETE is LIVE; L1 invent KEY LIVE; consumer CNS-02 CLOSED; DOCS ACCEPT. The remaining items are optional polish (soft-retire UX copy, HDSD depth, GĐ2 roster honesty) — identical to DEC FE-ADMIN LIVE + HOLD NOTE after wire CLOSED. Per PM preferred Option A and DEC/REC/SI/PAY twin, **ACCEPT_AS_IS_P2 HOLD** until sponsor opens FE-ADMIN polish wave — **not** ba-process invent now · **not** `dev-fe` without gap.

### 13.5 WORKSITE CNS-05 CLOSED — cite only

ATT-WORKSITE CNS-05 CLOSED (`ATTWSQA2-MSJCG47P`) is an orthogonal sealed peer. This seat may **cite** it as CLOSED peer (do not invent reopen). **Forbidden** to mint WORKSITE unlock from SHIFT FE-ADMIN NOTES.

### 13.6 Honesty / C-SLICE statement

Closing CNS-02 and stamping FE-ADMIN HOLD **must not** flip:

- `hrm_attendance_uat_ready`
- `attendance_e2e_linkage_ready`
- `payroll_e2e_ready`
- `contracts_printable_ready`

Nor claim module ATT UAT, Phase1 DONE, or UF 🟢 for whole ATT. **`C-SLICE-≠-MODULE`** remains true: many GWC slices ≠ module GO.

### 13.7 U88 continuity after this seat

PM should:

1. Seal `R-PLT-ATT-SHIFT-FE-ADMIN-01` HOLD on W8 board.
2. **Not** dispatch ba-process AC pack for FE-ADMIN invent (HOLD).
3. **Not** dispatch `dev-fe` (no closable mount/persist gap).
4. Continue next vertical / governance peer without inventing LVRULE unlock, reopening CNS-02, reopening CODE/OT/COMP FE-ADMIN HOLD as unlock, inventing WORKSITE unlock, or flipping attendance ready.
5. Keep ATT CODE/OT/COMP FE-ADMIN pack HOLD RETAIN — orthogonal ABSENT class.

---

## 14. Residual ID registry (mint)

| ID | Severity | Status after this seat | Owner next |
|----|----------|------------------------|------------|
| **R-PLT-ATT-SHIFT-FE-ADMIN-01** | P2 | **ACCEPT_AS_IS_P2 HOLD** (KEEP Condition) | pm (board seal) |
| R-PLT-ATT-SHIFT-ADM-FE | P2 | **HOLD ⊆ pack** (LIVE admin · no gap · not CLOSED) | sponsor-gated polish wave |
| R-PLT-ATT-SHIFT-MD-REF | P2 | **HOLD ⊆ pack** (Settings REF · dual-write DENY) | sponsor-gated polish wave |
| CNS-02 | — | **CLOSED ACCEPT** RETAIN (`ATTSHIFTQAFE-MSK6AJ8Z`) | — |
| L1 ATT-SHIFT | — | **SEAL RETAIN** (`ATTSHIFTQA-MSK5FXP3`) | — |
| R-PLT-ATT-FE-ADMIN-01 (CODE/OT/COMP) | P2 | **HOLD RETAIN** (ABSENT pack · FORBIDDEN reopen-as-unlock) | — |
| WORKSITE CNS-05 | — | **CLOSED** cite only (`ATTWSQA2-MSJCG47P`) | — |

---

## 15. Scope boundary vs ATT-FE-ADMIN-NOTES-SA-01 (explicit)

| Item | ATT-FE-ADMIN-NOTES-SA-01 | This seat ATT-SHIFT-FE-ADMIN-NOTES-SA-01 |
|------|--------------------------|------------------------------------------|
| Catalogs covered | att_attendance_code · att_ot_type · att_ot_comp_type | **work_shifts only** |
| FE-ADMIN inventory | **ABSENT** (GET effective only) | **LIVE** (Attendance Ca CRUD) |
| Residual mint | `R-PLT-ATT-FE-ADMIN-01` | `R-PLT-ATT-SHIFT-FE-ADMIN-01` |
| May reopen the other pack? | N/A | **FORBIDDEN** reopen CODE/OT/COMP HOLD as unlock |
| May fold SHIFT into CODE pack? | N/A | **FORBIDDEN** |
| Selected option | A ACCEPT_AS_IS_P2 HOLD | A ACCEPT_AS_IS_P2 HOLD |
| next_owner | pm | pm (not dev-fe) |

---

## 16. QA/QC reading guide (what this seat is / is not)

| Claim | Allowed? |
|-------|----------|
| «CNS-02 CLOSED + L1 RETAIN + DOCS ACCEPT → FE-ADMIN NOTES HOLD» | **YES** — this seat |
| «FE-ADMIN mount missing → dispatch dev-fe» | **NO** — audit shows LIVE |
| «CODE/OT/COMP also need invent admin now» | **NO** — separate HOLD pack ABSENT · FORBIDDEN reopen-as-unlock from this seat |
| «WORKSITE next unlock because SHIFT NOTES» | **NO** — CNS-05 CLOSED cite only |
| «attendance_uat_ready=true because SHIFT GWC» | **NO** — honesty false · C-SLICE |
| «Settings MD shifts mutate = ops SoT PASS» | **NO** — REF only · ADR D1 |

---

## 17. Option scoring detail (expanded)

| Criterion detail | A | B (no gap) | C |
|------------------|---|------------|---|
| Preserves CNS-02 seal | 5 | 3 | 0 |
| Preserves CODE/OT/COMP FE-ADMIN HOLD | 5 | 2 | 0 |
| Matches DEC LIVE FE-ADMIN NOTE class | 5 | 1 | 0 |
| Avoids Settings dual-write regression | 5 | 2 | 0 |
| Avoids WORKSITE invent | 5 | 3 | 0 |
| Avoids LVRULE invent | 5 | 3 | 0 |
| Bandwidth for U88 next vertical | 5 | 1 | 0 |
| Operator polish UX (if gap existed) | 2 | 4 | 1 |

**Interpretation:** Without a named mount/persist gap, Option B’s «business value» column collapses; Option A dominates on seal safety + peer class match + honesty.

---

## 18. Rollout / checkpoint / rollback (governance)

### 18.1 Rollout steps (PM after PASS_TO_PM)

1. Stamp W8 board: `R-PLT-ATT-SHIFT-FE-ADMIN-01 = ACCEPT_AS_IS_P2 HOLD`.
2. Append bus INTAKE from this evidence · seal seat.
3. Do **not** Task `dev-fe` / `ba-process` for invent admin.
4. Dispatch U88 next governance/execution peer from continuous board (not invent LVRULE / WORKSITE / CODE admin).

### 18.2 Rollback plan

- If future audit finds true mount/persist gap: PM opens Option B narrow with path+symptom evidence — **does not** silently reopen CNS-02 or CODE/OT/COMP HOLD.
- If sponsor opens polish wave: follow §5.2 scope_allowed / scope_FORBIDDEN.

### 18.3 Validation checkpoints

| CP | Owner | PASS |
|----|-------|------|
| SPEC_LEN ≥8192 NFD | sa | This file |
| Option A LOCKED recorded | pm | Board + bus |
| Residual HOLD KEEP | pm | Condition not CLOSED/WAIVED |
| Seals RETAIN | qa/qc audit | CNS-02 · L1 · CODE pack · WORKSITE |

### 18.4 Success criteria

- Residual minted HOLD · next_owner pm · no apps/** · honesty false · CODE/OT/COMP HOLD untouched · WORKSITE not invented · CNS-02 not reopened.

---

## 19. Non-goals (explicit list)

1. Do not invent Nest dual work_shifts admin outside Attendance Ca.
2. Do not dual-write Settings MD `shifts` → Nest `work_shifts`.
3. Do not reopen CNS-02 / L1 / DOCS as FAIL.
4. Do not reopen `R-PLT-ATT-FE-ADMIN-01` CODE/OT/COMP as unlock.
5. Do not invent WORKSITE unlock.
6. Do not invent LVRULE 01g unlock.
7. Do not invent GĐ2 roster/schedule API.
8. Do not flip attendance / payroll / printable ready flags.
9. Do not claim module ATT UAT / Phase1 DONE.
10. Do not seed catalog rows for evidence.
11. Do not fold work_shifts into att_attendance_code / leave / worksite tables.
12. Do not edit `apps/**` / `packages/**` in this seat.

---

## 20. Trace to program board rows (W8)

| Board row | Status at this seat | Action |
|-----------|---------------------|--------|
| ATT-SHIFT-CATALOG-SA-01 | CONFIRMED Option B | RETAIN |
| ATT-SHIFT-CATALOG-BA-01 | CONFIRMED | RETAIN |
| ATT-SHIFT-CATALOG-BE-01 | READY (prior) | RETAIN |
| ATT-SHIFT-CATALOG-QA-01 | PASS `ATTSHIFTQA-MSK5FXP3` | RETAIN L1 |
| ATT-SHIFT-CATALOG-QC-01 | GWC SEALED | RETAIN |
| ATT-SHIFT-CATALOG-FE-01 | READY (prior) | RETAIN |
| ATT-SHIFT-CATALOG-QA-FE-01 | PASS `ATTSHIFTQAFE-MSK6AJ8Z` | RETAIN |
| ATT-SHIFT-CATALOG-QC-02 | GWC SEALED CNS-02 CLOSED | RETAIN · DENY reopen |
| ATT-SHIFT-CATALOG-DOCS-01 | ACCEPT SRS v0.36 CH05d | RETAIN |
| ATT-SHIFT-FE-ADMIN-NOTES-SA-01 | **this seat** | Option A HOLD mint residual |
| ATT-FE-ADMIN-NOTES-SA-01 | HOLD CODE/OT/COMP | RETAIN · DENY reopen-as-unlock |
| ATT-WORKSITE … QC-02 | CNS-05 CLOSED | Cite only |

---

*End of SA Option/F.1 — ATT-SHIFT FE-ADMIN NOTES — Option A LOCKED ACCEPT_AS_IS_P2 HOLD · R-PLT-ATT-SHIFT-FE-ADMIN-01 · PASS_TO_PM · next_owner=pm*