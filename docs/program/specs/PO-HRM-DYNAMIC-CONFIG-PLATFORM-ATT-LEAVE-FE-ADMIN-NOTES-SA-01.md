# PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-FE-ADMIN-NOTES-SA-01 — Option/F.1 · ATT leave-type open catalog FE-ADMIN notes residual

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-FE-ADMIN-NOTES-SA-01` |
| **Parent** | ATT-LEAVE-CATALOG-QC-01 **GWC SEAL** · QA **`ATTLEAVEQA-MSJ7CPJH`** 9/9 PASS · DOCS **ACCEPT** SRS v0.26 CH05 · after **`ATT-LVRULE-ENGINE-SA-01`** Option **B LOCKED** · `R-PLT-ATT-LVRULE-ENGINE-01` · SPEC **22246** |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` · U88 continuous governance |
| **lane** | governance · sa · **docs-only** · **NO** `apps/**` |
| **change_mode** | **ADD** Option/F.1 disposition for **Nest `att_leave_type` / leave-types** FE-ADMIN notes · **peer seat NOT in** [`FE-ADMIN-PACK-SYNTH-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-FE-ADMIN-PACK-SYNTH-SA-01.md) §4 inventory (leave catalog wave orthogonal to CODE/OT/COMP pack) |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · **ACCEPT_AS_IS_P2 HOLD** forever-until-sponsor · ba-process **HOLD** (no new AC pack) · FE/BE **HOLD** · invent Nest dual leave-type admin **DENY** · reopen LVRULE engine / FE 01g **DENY** |
| **residual_id** | **`R-PLT-ATT-LEAVE-FE-ADMIN-01`** *(minted this seat — consolidates Nest leave-type Settings + Attendance sidebar FE-ADMIN LIVE notes + Settings MD REF-deny notes + QC OBS 01c idle-ok RETAIN)* |
| **prior_consumer_fe** | ATT-LEAVE-CATALOG-QA-01 **PASS** `ATTLEAVEQA-MSJ7CPJH` · QC-01 **GWC** · LeaveTab picker EFF · invent `HRM-LEAVE-TYPE-UNKNOWN` — **FORBIDDEN reopen consumer as FAIL** |
| **prior_l1_admin** | QA evidence admin Settings **Loại phép ATT** CREATE `hr_leave_cat_msj7cpjh` → **PUT 200** → F5 row (AC-PLT-ATT-LEAVE-01d · ATT-QC-02 retain class) — **RETAIN** |
| **prior_catalog** | [`ATT-LEAVE-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md) Option **B** Nest `public.att_leave_type` SoT · BA AC-PLT-ATT-LEAVE-01* — **SEAL RETAIN** |
| **peer_cite_hold_live** | [`ATT-SHIFT-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-FE-ADMIN-NOTES-SA-01.md) **`R-PLT-ATT-SHIFT-FE-ADMIN-01`** · [`ATT-WORKSITE-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-FE-ADMIN-NOTES-SA-01.md) **`R-PLT-ATT-WS-FE-ADMIN-01`** · DEC/REC/SI/PAY FE-ADMIN LIVE HOLD pack — **cite class (LIVE twin)** |
| **peer_cite_hold_absent_contrast** | [`ATT-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01.md) **`R-PLT-ATT-FE-ADMIN-01`** (CODE/OT/COMP **ABSENT** admin) — **FORBIDDEN fold leave-type into CODE/OT/COMP pack · FORBIDDEN reopen ABSENT pack as unlock for leave** |
| **peer_cite_lvrule** | [`ATT-LVRULE-FE-01G-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-FE-01G-SA-01.md) **`R-PLT-ATT-LVRULE-FE-01g`** · [`ATT-LVRULE-ENGINE-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-ENGINE-SA-01.md) **`R-PLT-ATT-LVRULE-ENGINE-01`** — **HOLD RETAIN · DENY reopen as unlock path for leave-type FE-ADMIN** |
| **Honesty** | `hrm_attendance_uat_ready=false` · `attendance_e2e_linkage_ready=false` · **`C-SLICE-≠-MODULE`** · U65 · **DENIED** module ATT UAT · Phase1 DONE · seed · flip attendance ready · invent Nest dual · reopen LVRULE engine/01g |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option pack §1)

| | |
|--|--|
| **Decision title** | Disposition for ATT **leave-type** (`att_leave_type` / F-ATT-CAT-LVT-*) **FE-ADMIN notes** after leave catalog wave sealed (Nest SoT LIVE · Settings + Attendance admin CRUD LIVE · consumer EFF QA PASS · QC GWC) — ACCEPT_AS_IS HOLD vs unlock FE-ADMIN deepen vs invent Nest dual / reopen LVRULE / flip attendance |
| **Requestor** | pm · U88 after `ATT-LVRULE-ENGINE-SA-01` SEALED |
| **Decision owner** | sa |
| **Related** | Nest `public.att_leave_type` Option B · **F-ATT-CAT-LVT-01/02** admin · **F-ATT-CAT-EFF-01** consumer · `AttLeaveTypeSettingsPanel` · `LeaveTab` + `useAttLeaveTypesEffective` · BR-PLT-02/04/05 · AC-PLT-ATT-LEAVE-01* |
| **Template** | `.cursor/templates/ADR_OPTION_TEMPLATE.md` §§1–7 + **§11 F.1** |
| **Board** | `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` row `…-ATT-LEAVE-FE-ADMIN-NOTES-SA-01` |

### 1.1 Problem — what residual remains after ATT-LEAVE-CATALOG GWC

ATT leave-type catalog consumer + admin wave is **SEALED** at QC narrow GWC: QA U65 **9/9 PASS** stamp **`ATTLEAVEQA-MSJ7CPJH`**; admin CREATE on Settings **Loại phép ATT** proven **PUT 200** + F5; LeaveTab binds **GET `/attendance/leave-types/effective`**; invent unknown key → **400 `HRM-LEAVE-TYPE-UNKNOWN`**. DOCS SRS v0.26 CH05 **ACCEPT**. What remains is **not** another closable consumer picker residual — it is the **FE-ADMIN notes pack class** for **leave-type catalog alone** (explicitly **OUT** of FE-ADMIN-PACK-SYNTH 13-row inventory because that synth predates / excludes this vertical seat):

| Residual / note | Severity | Surface inventory (AS-IS) | Proven already (RETAIN) |
|-----------------|----------|---------------------------|-------------------------|
| **`R-PLT-ATT-LVT-ADM-FE`** | **P2 HOLD NOTE** | Nest «Loại phép ATT» **FE-ADMIN LIVE** — `AttLeaveTypeSettingsPanel` mounted **`pages/Settings.tsx`** tab + **`pages/Attendance.tsx`** sidebar **Quy tắc nghỉ phép** · `listAttLeaveTypes` / `upsertAttLeaveType` / `retireAttLeaveType` **LIVE** in `hrmApi.ts` | QA 01d admin PUT 200 + F5 · CODE-MEMORY F-ATT-CAT-LVT-01/02 |
| **`R-PLT-ATT-LVT-MD-REF`** | **P2 HOLD NOTE** | Settings Master Data partition **`leave_types`** = **group REF read merge** only — **FORBIDDEN** as sole consumer picker SoT (peer PAY O4 / L-ATT-LEAVE-02 class) | ATT-LEAVE-CATALOG-SA Option B · VAL-ATT-CNS-04 MD-alone=false |
| **`R-PLT-ATT-LVT-OBS-01c`** | **P2 HOLD NOTE** | QC **OBS-01c** empty-EFF branch = **idle-ok** when live EFF≥1 — **≠** closable mount gap · **≠** mandatory empty-state UF FAIL | QC-01 GWC · honesty false RETAIN |
| **`R-PLT-ATT-LVT-ACC-OUT`** | **P2 HOLD NOTE RETAIN** | Accrual policy admin / engine **OUT** of leave-type catalog — cite **`R-PLT-ATT-LVRULE-FE-01g`** + **`R-PLT-ATT-LVRULE-ENGINE-01`** **HOLD** · **DENY** bundle accrual unlock into this seat | LVRULE QC-02 CNS-WIRE CLOSED · engine HOLD |
| **`R-PLT-ATT-LEAVE-FE-ADMIN-01`** *(mint this seat)* | **P2 HOLD NOTE pack** | **Consolidation** of rows above · **does not** invent new surface · **does not** reopen ATTLEAVEQA consumer · **does not** reopen CODE/OT/COMP FE-ADMIN ABSENT pack · **does not** reopen LVRULE engine/01g | GWC seal · 9/9 QA · DOCS ACCEPT |

**Critical discrimination vs ATT CODE/OT/COMP FE-ADMIN ABSENT and vs LVRULE HOLD:**

| Catalog family | FE-ADMIN mount | FE-ADMIN persist client | Consumer FE | Residual class |
|----------------|----------------|-------------------------|-------------|----------------|
| **ATT** CODE/OT/COMP | **ABSENT** | GET `listEffective*` only | CLOSED | HOLD ABSENT — **`R-PLT-ATT-FE-ADMIN-01`** · **OUT of this seat** |
| **ATT** leave-type | Settings + Attendance sidebar **LIVE** | upsert/retire **LIVE** | QA PASS `ATTLEAVEQA-MSJ7CPJH` | HOLD LIVE twin — **THIS seat** |
| **ATT** LVRULE accrual policy | Settings admin **ABSENT** (Network L1) | assert-consumer KEY **LIVE** | CNS-WIRE CLOSED | **OUT** — **`R-PLT-ATT-LVRULE-FE-01g`** + engine HOLD |
| **ATT** work_shifts / work-sites | Attendance **LIVE** | CRUD **LIVE** | CNS CLOSED | Peer LIVE HOLD cite only |

**Discrimination (must not confuse with consumer UNLOCK / LVRULE reopen):**

| Class | When used | Leave-type catalog | This seat |
|-------|-----------|-------------------|-----------|
| **Consumer EFF picker + invent KEY** | EFF≥1 → picker → Lưu 2xx → F5 | **SEALED** QA 9/9 | **OUT** — **FORBIDDEN reopen** |
| **FE-ADMIN LIVE + no mount/persist gap** | Panel mount + upsert/retire wired + browser admin CREATE proven | **LIVE** AS-IS | **Option A ACCEPT_AS_IS_P2 HOLD** |
| **FE-ADMIN ABSENT** | Network L1 only | **NOT leave-type AS-IS** | Cite CODE/OT/COMP contrast only |
| **LVRULE engine / 01g deepen** | Policy panel / accrue job | Orthogonal catalog | **FORBIDDEN reopen as unlock** |
| **Invent / flip** | Nest dual admin · flip attendance ready | REJECT | **Option C REJECT** |

### 1.2 READ-ONLY apps/web audit (cited — no edit)

| Surface | Path | Kind | Verdict |
|---------|------|------|---------|
| FE-ADMIN panel | `apps/web/hrm/src/components/settings/AttLeaveTypeSettingsPanel.tsx` | Settings CRUD catalog | **LIVE** — loadRows GET list · onSave PUT upsert · onRetire POST retire · invalidate `ATT_LEAVE_TYPES_EFFECTIVE_QUERY_KEY` |
| FE-ADMIN mount Settings | `apps/web/hrm/src/pages/Settings.tsx` | `<AttLeaveTypeSettingsPanel />` | **LIVE** — mount gap **NONE** |
| FE-ADMIN mount Attendance | `apps/web/hrm/src/pages/Attendance.tsx` | sidebar leave-rules → `<AttLeaveTypeSettingsPanel />` | **LIVE** — dual surface (peer ATT-SHIFT Ca tab pattern) |
| API admin client | `apps/web/hrm/src/integrations/hrmApi.ts` §6887–7042 | `listAttLeaveTypes` · `upsertAttLeaveType` · `createAttLeaveType` · `patchAttLeaveType` · `retireAttLeaveType` | **LIVE** — **≠** ATT-CODE/OT/COMP GET-only ABSENT class |
| Consumer EFF hook | `apps/web/hrm/src/hooks/useAttLeaveTypesEffective.ts` | effective picker SoT | **LIVE** — QA proven · **FORBIDDEN reopen** |
| Consumer form | `apps/web/hrm/src/components/attendance/LeaveTab.tsx` | picker bind EFF | **LIVE** — SEAL RETAIN |
| Catalog helpers | `apps/web/hrm/src/lib/attLeaveTypeCatalog.ts` | display-ready · key normalize | **LIVE** — RETAIN |
| Nest admin CRUD BE | `apps/api/hrm-api/src/attendance/attendance.controller.ts` `@Get/Post/Put/Patch/Post retire leave-types*` | SoT API | **LIVE** — out of scope edit · cite read-only |

**Audit finding:** Leave-type ships **full FE-ADMIN twin** (Settings + Attendance admin panel + full mutate clients + consumer EFF). Browser QA already proved **admin CREATE persist** and **consumer picker** on the same catalog. Residual = **P2 NOTE / polish / REF-deny / OBS idle-ok** class — **same as ATT-SHIFT / ATT-WORKSITE / SI / PAY LIVE FE-ADMIN HOLD**, **not** ABSENT deepen like CODE/OT/COMP. **No named closable mount/persist gap** → Option **A** default · **Option B dev-fe reject**.

### 1.3 Constraints

- Docs-only · **no** `apps/**` · **no** seed (U65)
- **DENY** reopen **`R-PLT-ATT-LVRULE-ENGINE-01`** · **`R-PLT-ATT-LVRULE-FE-01g`** as unlock for leave-type FE-ADMIN
- **DENY** reopen **`R-PLT-ATT-FE-ADMIN-01`** CODE/OT/COMP ABSENT pack as leave-type unlock
- **DENY** invent Nest **dual** leave-type admin (second writer outside sealed panel paths)
- **DENY** flip `hrm_attendance_uat_ready` · claim module ATT UAT · Phase1 DONE
- **RETAIN** stamp **`ATTLEAVEQA-MSJ7CPJH`** · ATT-CODE/WS/SHIFT/LVRULE CNS seals on board
- must_keep: **leave catalog GWC** · **engine HOLD** · **01g HOLD** · **honesty false** · **C-SLICE**

### 1.4 Decision heuristic

| Rule | Application |
|------|-------------|
| FE-ADMIN LIVE + L1/browser admin CREATE OK + consumer SEALED | **Option A HOLD NOTE** — peer SHIFT/WS/DEC class |
| FE-ADMIN ABSENT + Network L1 only | CODE/OT/COMP class — **not** leave-type |
| Unlock dev-fe only if **closable mount/persist defect** on existing UF | Audit: panel + clients + QA 01d → **no gap** |
| LVRULE engine ≠ leave-type catalog admin | **DENY** bundle unlock |

---

## 2. Problem to solve (ADR §2)

### 2.1 Current state

| Layer | AS-IS | Seat reading |
|-------|-------|--------------|
| Nest SoT | `att_leave_type` CRUD/effective/retire | **LIVE** · Option B LOCKED |
| FE-ADMIN | `AttLeaveTypeSettingsPanel` dual mount | **LIVE** · no mount gap |
| FE persist | upsert + retire clients | **LIVE** · no persist gap |
| Consumer | LeaveTab EFF picker + invent 4xx | **SEALED** QA/QC |
| MD REF | `leave_types` partition read merge | **REF-deny NOTE** · not gap |
| Accrual | policy/engine | **HOLD** separate residuals |

### 2.2 Failure impact if mis-governed

| Risk | Impact |
|------|--------|
| Treat LIVE admin as ABSENT → dispatch dev-fe invent panel | Duplicate work · seal churn · billing waste |
| Reopen LVRULE engine as leave-type FE-ADMIN unlock | Scope creep · violates ENGINE SA Option B |
| Fold into CODE/OT/COMP pack | Wrong taxonomy · synth inventory corruption |
| Flip attendance UAT from catalog GWC | Honesty violation · QC NO-GO class |

---

## 3. Options (ADR §3)

### Option A — ACCEPT_AS_IS_P2 HOLD forever-until-sponsor — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Mint **`R-PLT-ATT-LEAVE-FE-ADMIN-01`** as **P2 HOLD NOTE pack** for leave-type FE-ADMIN **LIVE** surface: (1) dual-mount Settings + Attendance admin **RETAIN**; (2) MD `leave_types` REF-deny **NOTE**; (3) QC OBS-01c idle-ok **RETAIN**; (4) accrual/engine orthogonality **RETAIN** cite. **Do not** dispatch `dev-fe` without sponsor-named polish wave. Unlock **only** if future audit finds **named closable gap** (missing mount, broken persist on existing panel UF, regression vs `ATTLEAVEQA-MSJ7CPJH`). |
| **Benefits** | Matches peer LIVE FE-ADMIN HOLD · honors QA/QC seal · preserves U88 bandwidth · honesty intact |
| **Costs** | Optional UX polish (empty EFF copy, HDSD depth) deferred until sponsor |
| **Risks** | HOLD misread as «no admin» → mitigations **L-ATT-LVT-FE-ADMIN-*** |
| **Gate** | QA 9/9 · admin PUT 200 proven · panel LIVE |

### Option B — UNLOCK `dev-fe` FE-ADMIN deepen (default reject)

| | |
|--|--|
| **Description** | Dispatch dev-fe to build or fix leave-type admin because «catalog wave done». |
| **Benefits** | None on AS-IS — panel + clients already LIVE |
| **Costs** | Invent duplicate admin · reopen consumer under «polish» |
| **Risks** | Violates closable-gap gate · C-SLICE confusion |
| **Gate** | **REJECT default** — no closable mount/persist gap in READ-ONLY audit §1.2 |

### Option C — REJECT invent / reopen / flip

| | |
|--|--|
| **Description** | Invent Nest dual leave-type admin; reopen LVRULE engine / 01g; reopen CODE/OT/COMP FE-ADMIN; reopen ATTLEAVEQA consumer; flip attendance ready; seed; `apps/**` from this seat. |
| **Benefits** | None |
| **Costs** | Seal loss · trust · honesty |
| **Risks** | **DENY** all mission FORBIDDEN lines |

---

## 4. Trade-off matrix (ADR §4)

| Criteria | Weight | Option A HOLD | Option B unlock | Option C invent |
|---|--:|--:|--:|--:|
| Seal integrity (ATTLEAVEQA · LVRULE engine HOLD) | 5 | **5** | 2 | 0 |
| Match peer LIVE FE-ADMIN class (SHIFT/WS/SI) | 5 | **5** | 2 | 0 |
| Honesty / C-SLICE | 5 | **5** | 3 | 0 |
| PM clarity (residual mint vs dev-fe noise) | 4 | **5** | 2 | 0 |
| Operator UX polish (deferred) | 3 | 3 | **4** | 1 |
| Delivery cost | 4 | **5** | 1 | 0 |
| **Weighted tendency** | | **Dominates** | Reject | Reject |

---

## 5. Failure modes and mitigation (ADR §5)

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | HOLD misread as «no Settings admin for leave» | User expects CRUD missing | Cite `AttLeaveTypeSettingsPanel` LIVE · QA 01d PUT 200 |
| A | PM dispatches dev-fe without gap | Bus without sponsor FE-ADMIN message | Reject; cite §1.2 audit |
| A | Bundle LVRULE engine unlock | Diff accrual policy admin | DENY · engine HOLD RETAIN |
| B | Duplicate panel / second writer | Two admin routes for same catalog | FORBIDDEN Nest dual |
| C | Reopen ATTLEAVEQA as FAIL | QA regression dispatch | FORBIDDEN · stamp RETAIN |

---

## 6. Decision (ADR §6)

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_P2 HOLD** |
| **Why** | Leave-type FE-ADMIN is **LIVE twin** (panel mounted · upsert/retire clients · browser admin CREATE proven). Consumer catalog **SEALED**. No closable mount/persist gap. LVRULE engine/01g are **orthogonal HOLD** — not unlock paths. CODE/OT/COMP ABSENT pack is **different class** — do not fold. Option B would invent work without defect. |
| **Assumptions** | Sponsor did not open «mở FE wave leave-type FE-ADMIN polish» in this message; ATTLEAVEQA seal remains valid. |
| **Rejected** | **Option B** default unlock · **Option C** full DENY list |

### 6.1 Unlock gates (Option A does not open)

| Question | Answer |
|----------|--------|
| Unlock `dev-fe` mandatory? | **NO** — no closable gap |
| Unlock ba-process new AC? | **HOLD** — AC-PLT-ATT-LEAVE-01* locked |
| Reopen LVRULE engine / 01g? | **FORBIDDEN** |
| Reopen ATTLEAVEQA consumer? | **FORBIDDEN** |
| Flip `hrm_attendance_uat_ready`? | **NO** |
| Add to FE-ADMIN-PACK-SYNTH inventory retroactively? | **Optional PM note only** — this seat **standalone** mint |

### 6.2 Sponsor-gated narrow alternate (not default)

```text
entry: sponsor message explicit «mở FE wave loại phép ATT FE-ADMIN polish» OR audit names closable gap (mount missing / persist broken on AttLeaveTypeSettingsPanel UF)
retain: ATTLEAVEQA-MSJ7CPJH SEAL · LVRULE engine HOLD · 01g HOLD · CODE/OT/COMP FE-ADMIN HOLD · honesty false
scope_allowed: UX polish on AttLeaveTypeSettingsPanel / Attendance sidebar copy / empty EFF helper text (OBS-01c deepen) — NO new Nest SoT · NO second admin writer
scope_FORBIDDEN: reopen consumer FAIL · accrue engine LIVE · invent Nest dual · seed · flip attendance ready
exit: R-PLT-ATT-LEAVE-FE-ADMIN-01 may narrow or CLOSE; honesty false RETAIN
```

### 6.3 Architecture boundary (text diagram)

```text
  Nest att_leave_type L1 + admin API          --> LIVE (F-ATT-CAT-LVT-01/02)
  AttLeaveTypeSettingsPanel Settings+ATT      --> LIVE (FE-ADMIN)
  LeaveTab useAttLeaveTypesEffective          --> SEALED (ATTLEAVEQA-MSJ7CPJH)
  Settings MD leave_types REF merge           --> REF-deny NOTE (not sole SoT)
  att_leave_accrual_policy / F-ATT-LEAVE-04   --> HOLD (R-PLT-ATT-LVRULE-ENGINE-01)
  LVRULE panel 01g Settings admin ABSENT      --> HOLD (R-PLT-ATT-LVRULE-FE-01g)
  ATT CODE/OT/COMP Nest admin FE              --> ABSENT HOLD (R-PLT-ATT-FE-ADMIN-01) -- orthogonal
  R-PLT-ATT-LEAVE-FE-ADMIN-01                 --> ACCEPT_AS_IS_P2 HOLD (this seat)
  hrm_attendance_uat_ready                    --> false RETAIN · C-SLICE
```

---

## 7. Implementation and validation plan (ADR §7)

| Step | Owner | Action |
|------|-------|--------|
| 1 | pm | Seal board row **CONFIRMED** · append residual **`R-PLT-ATT-LEAVE-FE-ADMIN-01`** HOLD P2 |
| 2 | pm | **Do not** dispatch `dev-fe` from this seat (no closable gap) |
| 3 | pm | U88 next vertical per continuous board — **not** LVRULE engine reopen |
| 4 | qc | Audit cites this SPEC on any future «leave admin missing» claim — redirect to LIVE inventory §1.2 |
| Rollback | sa | If wrongly dispatched dev-fe — CORRECTION bus · cite Option A LOCK |
| Validation | qa | Any reopen requires **regression** vs `ATTLEAVEQA-MSJ7CPJH` + admin 01d PUT 200 |
| Success | pm | SPEC_LEN ≥8192 NFD · PASS_TO_PM · honesty false unchanged |

---

## 8. Locks (L-ATT-LVT-FE-ADMIN-*)

| Lock | Rule |
|------|------|
| **L-ATT-LVT-FE-ADMIN-01 HOLD ≠ WAIVE** | ACCEPT_AS_IS_P2 does not delete AC-PLT-ATT-LEAVE-01* · deferred polish only |
| **L-ATT-LVT-FE-ADMIN-02 Consumer SEALED** | **FORBIDDEN reopen** ATTLEAVEQA consumer as FAIL without regression evidence |
| **L-ATT-LVT-FE-ADMIN-03 LIVE ≠ ABSENT** | Do not classify leave-type as CODE/OT/COMP ABSENT pack |
| **L-ATT-LVT-FE-ADMIN-04 LVRULE orthogonality** | **DENY** reopen engine / 01g as this seat unlock |
| **L-ATT-LVT-FE-ADMIN-05 Nest dual DENY** | No second leave-type admin writer |
| **L-ATT-LVT-FE-ADMIN-06 MD REF** | Settings `leave_types` **≠** sole picker SoT — RETAIN |
| **L-ATT-LVT-FE-ADMIN-07 Honesty** | **DENY** flip attendance ready · C-SLICE RETAIN |
| **L-ATT-LVT-FE-ADMIN-08 Condition KEEP** | HOLD P2 on board · ACCEPT_AS_IS ≠ CLOSED product UC |
| **L-ATT-LVT-FE-ADMIN-09 Path lock** | UTF-8 no BOM NFD write gate |

---

## 9. F.1 physical notes (API_DESIGN alignment — read-only)

| Function | Mục đích (VI) | FE-ADMIN bind today | Residual |
|----------|---------------|---------------------|----------|
| **F-ATT-CAT-LVT-01** | Liệt kê loại phép ATT (admin list) | `listAttLeaveTypes` in panel loadRows | **LIVE** — NOTE only |
| **F-ATT-CAT-LVT-02** | Tạo/sửa/retire catalog mở N+1 | `upsertAttLeaveType` · `retireAttLeaveType` | **LIVE** — QA 01d |
| **F-ATT-CAT-EFF-01** | Picker consumer effective union | `useAttLeaveTypesEffective` · LeaveTab | **SEALED** — out of FE-ADMIN seat |
| **F-ATT-LEAVE-02** | Invent type key 4xx | BE `HRM-LEAVE-TYPE-UNKNOWN` | **RETAIN** — consumer class |

No new API_DESIGN rows required this seat — disposition only.

---

## 10. Impacted systems & dependencies

| System | Impact |
|--------|--------|
| `apps/web/hrm` AttLeaveTypeSettingsPanel | **None** (docs-only) |
| Nest `att_leave_type` | **None** |
| ATT-LEAVE-CATALOG QA/QC seals | **RETAIN** |
| LVRULE vertical | **HOLD cite only** |
| FE-ADMIN-PACK-SYNTH | **Not a member of §4 13-pack** — optional future synth row ADD by pm |

---

## 11. Trace to program board (W8)

| Board row | Status | Action |
|-----------|--------|--------|
| ATT-LEAVE-CATALOG-SA-01 | CONFIRMED Option B | RETAIN |
| ATT-LEAVE-CATALOG-BA-01 | CONFIRMED | RETAIN |
| ATT-LEAVE-CATALOG-QA-01 | PASS `ATTLEAVEQA-MSJ7CPJH` | RETAIN |
| ATT-LEAVE-CATALOG-QC-01 | GWC | RETAIN OBS-01c |
| ATT-LEAVE-CATALOG-DOCS-01 | ACCEPT SRS v0.26 | RETAIN |
| ATT-LVRULE-ENGINE-SA-01 | Option B HOLD | RETAIN · DENY reopen |
| ATT-LVRULE-FE-01G-SA-01 | Option B HOLD | RETAIN |
| **ATT-LEAVE-FE-ADMIN-NOTES-SA-01** | **this seat** | Option A HOLD mint |

---

## 12. Discrimination matrix (unlock gate)

| Evidence | Unlock dev-fe? | Why |
|----------|----------------|-----|
| `AttLeaveTypeSettingsPanel` in Settings + Attendance | **NO** | Mount LIVE |
| `upsertAttLeaveType` / `retireAttLeaveType` wired | **NO** | Persist LIVE |
| QA admin PUT 200 + F5 | **NO** | Proven UF |
| QC OBS-01c idle-ok | **NO** | Not mount gap |
| LVRULE engine HOLD | **NO** | Orthogonal |
| Sponsor «mở FE wave polish loại phép» | **YES narrow** | §6.2 only |
| Future regression: panel 500 on Lưu | **YES (hotfix)** | Named defect · not this seat default |

---

## 13. RETAIN stamps (ATTLEAVEQA · peers)

| Stamp / residual | Action |
|------------------|--------|
| `ATTLEAVEQA-MSJ7CPJH` | **SEAL RETAIN** |
| `R-PLT-ATT-LVRULE-ENGINE-01` | **HOLD RETAIN** |
| `R-PLT-ATT-LVRULE-FE-01g` | **HOLD RETAIN** |
| `R-PLT-ATT-FE-ADMIN-01` (CODE/OT/COMP) | **HOLD RETAIN** · do not fold |
| ATT-CODE/WS/SHIFT/LVRULE CNS L1 | **SEAL RETAIN** |
| Honesty flags false | **RETAIN** |
| **`C-SLICE-≠-MODULE`** | **RETAIN** |

---

## 14. Non-goals (explicit)

1. Do not invent Nest dual leave-type admin.
2. Do not reopen LVRULE accrual engine or 01g as leave-type FE-ADMIN unlock.
3. Do not reopen ATTLEAVEQA consumer catalog as FAIL.
4. Do not reopen CODE/OT/COMP FE-ADMIN ABSENT pack.
5. Do not flip `hrm_attendance_uat_ready` or claim module ATT UAT.
6. Do not seed catalog rows for evidence (U65).
7. Do not edit `apps/**` in this seat.
8. Do not add leave-type to FE-ADMIN-PACK-SYNTH as mandatory unlock.

---

## 15. Handback packet (mandatory)

| Field | Value |
|-------|--------|
| **completion_report** | READ-ONLY audit confirms leave-type FE-ADMIN **LIVE twin** (`AttLeaveTypeSettingsPanel` Settings + Attendance · full upsert/retire clients) · consumer **SEALED** `ATTLEAVEQA-MSJ7CPJH` · **no closable mount/persist gap** · Option **A LOCKED** · mint **`R-PLT-ATT-LEAVE-FE-ADMIN-01`** ACCEPT_AS_IS_P2 HOLD · LVRULE engine/01g **RETAIN HOLD** · not in FE-ADMIN-PACK-SYNTH 13-pack · no `apps/**`. |
| **selected_option** | **Option A** — ACCEPT_AS_IS_P2 HOLD |
| **residual** | **`R-PLT-ATT-LEAVE-FE-ADMIN-01`** = **HOLD** |
| **SPEC_LEN** | Verified NFD UTF-8 no BOM · gate ≥8192 bytes |
| **next_owner** | **pm** (seal board · U88 next vertical — **not** `dev-fe`) |
| **next_dispatch_prompt** | See §16 |
| **evidence_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-FE-ADMIN-NOTES-SA-01.md` |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 16. next_dispatch_prompt (copy-ready for pm)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-FE-ADMIN-NOTES-PM-SEAL-01
from_role: pm
to_role: pm
lane: governance
INTAKE: SA PASS_TO_PM CONFIRMED — ATT leave-type FE-ADMIN NOTES Option A LOCKED · R-PLT-ATT-LEAVE-FE-ADMIN-01 HOLD P2 · SPEC docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-FE-ADMIN-NOTES-SA-01.md
action:
  1) Seal board row PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-FE-ADMIN-NOTES-SA-01 CONFIRMED · Condition KEEP HOLD
  2) Do NOT dispatch dev-fe (no closable gap; panel LIVE · ATTLEAVEQA-MSJ7CPJH RETAIN)
  3) RETAIN R-PLT-ATT-LVRULE-ENGINE-01 + R-PLT-ATT-LVRULE-FE-01g + leave catalog GWC + honesty false + C-SLICE
  4) U88 dispatch next governance/execution vertical per PO_HRM_CONTINUOUS_W8_20260807.md tail (not LVRULE engine reopen)
exit: bus PM->ALL seal note + TEAM_WORKING_NOW one line
ack_status: PASS_TO_PM
```

---

## 17. Glossary

| Term | Meaning here |
|------|--------------|
| FE-ADMIN LIVE | Product UI mounts Nest create/update/retire for leave-type catalog |
| FE-ADMIN ABSENT | GET effective only — CODE/OT/COMP class |
| ACCEPT_AS_IS_P2 HOLD | Board residual NOTE · not product defect · not dev-fe default |
| Peer NOT in pack synth | Leave-type seat orthogonal to 13-row FE-ADMIN-PACK-SYNTH inventory |

---

*End of SA Option/F.1 — ATT leave-type FE-ADMIN NOTES — Option A LOCKED ACCEPT_AS_IS_P2 HOLD · R-PLT-ATT-LEAVE-FE-ADMIN-01 · PASS_TO_PM · next_owner=pm*
