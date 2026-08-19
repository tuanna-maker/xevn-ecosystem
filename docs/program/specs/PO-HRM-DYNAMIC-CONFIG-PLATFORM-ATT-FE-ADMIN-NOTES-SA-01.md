# PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01 — Option/F.1 · ATT FE-ADMIN notes pack residual

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01` |
| **Parent** | ATT-CODE-CATALOG-QC-FE-01 **GWC** seal **`ATTCODEQAFE-MSKCJA95`** · **R-PLT-ATT-CODE-FE-01 CLOSED** · OT-TYPE-CATALOG-QC-FE **GWC** seal **`ATTOTQAFE-MSK9TJDM`** · **FE-01 CLOSED** · ATT-COMP-TYPE-CATALOG-QC-FE-01 **GWC** seal **`ATTCOMPQAFE-MSKBBEJW`** · **OTC-03 CLOSED** |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa · **docs-only** · **NO** `apps/**` |
| **change_mode** | **ADD** Option/F.1 disposition for consolidated ATT **FE-ADMIN notes** residual after consumer FE CLOSED · **no seed** · **no wipe** sealed peers |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — Option **A** **LOCKED** · **ACCEPT_AS_IS_P2 HOLD** forever-until-sponsor · ba-process **HOLD** (no new AC pack) · FE/BE **HOLD** · Nest FE-ADMIN CRUD **DENY** |
| **residual_id** | **`R-PLT-ATT-FE-ADMIN-01`** *(minted this seat — consolidates ATT-CODE + OT-TYPE + OT-COMP-TYPE FE-ADMIN HOLD notes)* |
| **prior_consumer_fe** | ATT-CODE FE CLOSED `ATTCODEQAFE-MSKCJA95` (R-PLT-ATT-CODE-FE-01) · OT-TYPE FE CLOSED `ATTOTQAFE-MSK9TJDM` (FE-01) · ATT-COMP-TYPE FE CLOSED `ATTCOMPQAFE-MSKBBEJW` (OTC-03) — **FORBIDDEN reopen** |
| **prior_l1** | ATT-CODE `ATTCODEQA-MSK4T1A5` · OT-TYPE `ATTOTQA-MSK8VETU` · OT-COMP-TYPE Nest `att_ot_comp_type` L1 CREATE/PATCH Network (COMP QA) — **RETAIN** |
| **peer_cite_hold** | [`ATT-LVRULE-FE-01G-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-FE-01G-SA-01.md) **ACCEPT_AS_IS_P2 HOLD** · [`EMP-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-ADMIN-NOTES-SA-01.md) **Option A ACCEPT_AS_IS_P2 HOLD `R-PLT-EMP-FE-ADMIN-01`** — **cite class (twin pack)** |
| **peer_cite_consumer_unlock** | [`ATT-CODE-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01.md) / [`OT-TYPE-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01.md) / [`ATT-COMP-TYPE-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01.md) Option B (Nest SoT) · consumer FE **already CLOSED** — **≠** this residual class |
| **peer_cite_ctr** | [`CTR-TEMPLATE-FE-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-FE-SA-01.md) FE **HOLD** · printable **not flipped** — RETAIN |
| **Honesty** | `hrm_attendance_uat_ready=false` · `attendance_e2e_linkage_ready=false` · `contracts_printable_ready=false` · **`C-SLICE-≠-MODULE`** · U65 · **DENIED** module ATT UAT · Phase1 DONE · seed · flip attendance · invent Nest FE-ADMIN CRUD · invent LVRULE · flip printable · reopen sealed consumer FE · reopen EMP/CTR HOLD |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option pack)

| | |
|--|--|
| **Decision title** | Disposition for ATT **FE-ADMIN notes pack** after ATT-CODE / OT-TYPE / OT-COMP-TYPE **consumer FE CLOSED** — ACCEPT_AS_IS HOLD vs unlock admin FE vs invent Nest CRUD |
| **Requestor** | pm · U88 continuous · after ATT-CODE/OT/COMP QC-FE GWC CLOSED |
| **Decision owner** | sa |
| **Related** | `R-PLT-ATT-CODE-FE-ADMIN` (implied HOLD NOTE from ATT-CODE QC-FE) · `R-PLT-ATT-OT-FE-ADMIN` (OT-TYPE FE-ADMIN) · `R-PLT-ATT-COMP-FE-ADMIN` (OTC compensation FE-ADMIN) · Nest `att_attendance_code` / `att_ot_type` / `att_ot_comp_type` SoT LIVE · LVRULE 01g HOLD · EMP FE-ADMIN HOLD twin |
| **Template** | `.cursor/templates/ADR_OPTION_TEMPLATE.md` |
| **Board** | `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` row `…-ATT-FE-ADMIN-NOTES-SA-01` |

### 1.1 Problem — what residual remains after consumer FE CLOSED

Three ATT catalog consumer FE Conditions are **CLOSED ACCEPT** (QC-FE GWC). What remains is **not** another closable consumer picker/EFF residual — it is the **FE-ADMIN / Nest-admin ABSENT notes class** (twin of EMP FE-ADMIN NOTES + peer LVRULE 01g HOLD):

| Residual / note | Severity | Surface inventory (AS-IS) | Proven already (RETAIN) |
|-----------------|----------|---------------------------|-------------------------|
| **`R-PLT-ATT-CODE-FE-ADMIN`** | **P2 HOLD** | Nest «Mã chấm công» admin CRUD FE **ABSENT** — only `listEffectiveAttAttendanceCodes` GET client; L1 CREATE/PATCH proven via Network (`ATTCODEQA-MSK4T1A5`) · consumer EFF rebind CLOSED | Nest att_attendance_code L1 + invent KEY · consumer FE CLOSED `ATTCODEQAFE-MSKCJA95` |
| **`R-PLT-ATT-OT-FE-ADMIN`** | **P2 HOLD** | Nest «Loại tăng ca (OT type)» admin CRUD FE **ABSENT** — only `listEffectiveAttOtTypes` GET; L1 CREATE via Network (`ATTOTQA-MSK8VETU`, admin N+1) · consumer OvertimeRequestTab EFF CLOSED | Nest att_ot_type L1 + invent KEY · consumer FE CLOSED `ATTOTQAFE-MSK9TJDM` |
| **`R-PLT-ATT-COMP-FE-ADMIN`** | **P2 HOLD** | Nest «Loại hình chi trả OT (comp type)» admin CRUD FE **ABSENT** — only `listEffectiveAttOtCompTypes` GET; L1 via Network · consumer OvertimeRequestTab compensation EFF (OTC-03) CLOSED | Nest att_ot_comp_type L1 · consumer FE CLOSED `ATTCOMPQAFE-MSKBBEJW` |
| **`R-PLT-ATT-FE-ADMIN-01`** *(mint this seat)* | **P2 HOLD NOTE pack** | **Consolidation** of the three rows above into one board residual for U88 continuity — **does not** invent new product surface | Consumer FE trio CLOSED · L1 trio RETAIN |

**Discrimination (must not confuse with consumer UNLOCK):**

| Class | When used | ATT-CODE / OT-TYPE / COMP-TYPE consumer | This seat (FE-ADMIN notes) |
|-------|-----------|-----------------------------------------|----------------------------|
| **Consumer EFF / picker deepen** | Surface LIVE + KEY LIVE + AC EFF locked · Nest EFF rebind / Edit PATCH / display-ready nameVi | FE / QA-FE → **CLOSED** (GWC) | **OUT** — already CLOSED · **FORBIDDEN reopen** |
| **FE-ADMIN / deepen ABSENT Nest admin panel** | Network L1 OK (CREATE/PATCH) · product Nest admin CRUD FE OUT · Nest is SoT (no Settings dual-master) | Named HOLD NOTE only during consumer wave | **THIS residual** → Option **A ACCEPT_AS_IS_P2 HOLD** |
| **Invent / reopen / flip** | Invent Nest admin CRUD as mandatory Task · reopen sealed consumer FE · LVRULE unlock · flip printable · attendance ready | REJECT | **Option C REJECT** |

**Board audit (closable consumer FE still OPEN?)**

| Candidate | Board / seal | Verdict for this seat |
|-----------|--------------|------------------------|
| ATT-CODE FE `R-PLT-ATT-CODE-FE-01` | QC-FE GWC · `ATTCODEQAFE-MSKCJA95` CLOSED | **CLOSED** — not reopen |
| OT-TYPE FE `FE-01` | QC-FE GWC · `ATTOTQAFE-MSK9TJDM` CLOSED | **CLOSED** — not reopen |
| OT-COMP-TYPE FE `OTC-03` | QC-FE GWC · `ATTCOMPQAFE-MSKBBEJW` CLOSED | **CLOSED** — not reopen |
| ATT-WORKSITE FE CNS-05 | QC-02 GWC · `ATTWSQA2-MSJCG47P` CLOSED | **CLOSED** — do not invent reopen |
| LVRULE FE-01g | ACCEPT_AS_IS_P2 HOLD | **HOLD RETAIN** — DENY invent unlock |
| EMP FE-ADMIN pack | `R-PLT-EMP-FE-ADMIN-01` ACCEPT_AS_IS_P2 HOLD | **HOLD RETAIN** — twin class cite |
| CTR-TEMPLATE FE | HOLD · printable not flipped | **HOLD RETAIN** — do not flip printable |
| Nest att_* admin CRUD FE path | ABSENT (Network L1 only) | Same FE-ADMIN HOLD class as EMP-STATUS ST/STR — **ACCEPT HOLD**, not invent panel |

**Conclusion:** No named closable **consumer** FE residual remains OPEN on ATT-CODE / OT-TYPE / OT-COMP-TYPE. Residual class = **deepen ABSENT Nest admin CRUD panel** (Network L1 already LIVE) → prefer Option **A**.

### 1.2 READ-ONLY apps/web audit (cited — no edit)

| Surface | Path | Kind | Verdict |
|---------|------|------|---------|
| ATT-CODE consumer EFF hook | `apps/web/hrm/src/hooks/useAttAttendanceCodesEffective.ts` (+`.test.ts`) | consumer read/EFF | CLOSED — RETAIN |
| OT-TYPE consumer EFF hook | `apps/web/hrm/src/hooks/useAttOtTypesEffective.ts` (+`.test.ts`) | consumer read/EFF | CLOSED — RETAIN |
| OT-COMP consumer EFF hook | `apps/web/hrm/src/hooks/useAttOtCompTypesEffective.ts` (+`.test.ts`) | consumer read/EFF | CLOSED — RETAIN |
| OT request consumer form | `apps/web/hrm/src/components/attendance/OvertimeRequestTab.tsx` | consumer picker (OT + COMP EFF) | CLOSED — RETAIN |
| ATT-CODE consumer table/edit | `apps/web/hrm/src/components/attendance/AttendanceRecordsTable.tsx` · `pages/Attendance.tsx` | consumer EFF Edit rebind | CLOSED — RETAIN |
| API client (catalogs) | `apps/web/hrm/src/integrations/hrmApi.ts` §5480–5591 | **GET `listEffective*` only** — **no** `create/update/delete` admin client for att-code / ot-type / ot-comp-type | **FE-ADMIN CRUD ABSENT** → HOLD class confirmed |
| Nest admin CRUD FE component | *(none found)* | product admin panel | **ABSENT** — Network L1 is SoT admin path today |

**Audit finding:** The FE ships only *effective* (GET) consumers for the three catalogs; there is **no** FE-ADMIN CRUD component and **no** `create*/update*` catalog client. Admin CREATE/PATCH is proven via **Network/API L1** only. This is the identical shape to EMP-STATUS Nest ST/STR (Network L1 OK, admin FE ABSENT) → **FE-ADMIN HOLD**, not a closable consumer gap.

### 1.3 Constraints

- Docs-only · **no** `apps/**` · **no** seed (U65)
- **DENY** invent Nest `att_attendance_code` / `att_ot_type` / `att_ot_comp_type` admin CRUD FE as mandatory continuous Task
- **DENY** invent LVRULE 01g unlock · reopen ATT-CODE / OT-TYPE / OT-COMP-TYPE consumer FE CLOSED · reopen ATT-WORKSITE CNS-05
- **DENY** reopen EMP FE-ADMIN HOLD / EMP consumer FE CLOSED · reopen CTR FE HOLD · flip `contracts_printable_ready`
- **DENY** flip `hrm_attendance_uat_ready` · claim module ATT UAT · Phase1 DONE · UF 🟢 whole ATT
- BA AC packs for ATT-CODE / OT-TYPE / OT-COMP-TYPE **already locked** — this seat is **disposition**, not redefine catalog Option B SoT
- must_keep: **ATT-CODE/OT/COMP consumer FE CLOSED** · **invent KEYs** · **EMP FE CLOSED + EMP FE-ADMIN HOLD** · **CTR FE HOLD** · **LVRULE HOLD** · **honesty false** · **C-SLICE**

### 1.4 Decision heuristic

| Rule | Application |
|------|-------------|
| Consumer FE CLOSED + Nest is SoT + admin CRUD FE ABSENT + Network L1 OK | Nest admin invent = **Option C reject**; note = HOLD pack |
| Nest L1 Network OK + admin FE ABSENT | Peer FE-ADMIN HOLD / LVRULE / EMP-STATUS ST-admin ACCEPT_AS_IS — **Option A** |
| Unlock FE-ADMIN only if sponsor explicitly opens FE-ADMIN wave | Board audit: no sponsor FE-ADMIN message in this dispatch → **Option B reject default** |
| No open closable consumer FE on board | Prefer **A**; do not invent ATT-WORKSITE / LVRULE / sealed EMP / CTR |

---

## 2. Options

### Option A — ACCEPT_AS_IS_P2 HOLD forever-until-sponsor for ATT FE-ADMIN notes — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Mint / stamp board residual **`R-PLT-ATT-FE-ADMIN-01`** as **P2 HOLD / NOTE pack** consolidating: (1) **`R-PLT-ATT-CODE-FE-ADMIN`** Nest attendance-code admin CRUD FE ABSENT (Network L1 RETAIN); (2) **`R-PLT-ATT-OT-FE-ADMIN`** Nest ot-type admin CRUD FE ABSENT (Network L1 RETAIN); (3) **`R-PLT-ATT-COMP-FE-ADMIN`** Nest ot-comp-type admin CRUD FE ABSENT (Network L1 RETAIN). **Do not** invent `dev-fe` Nest admin CRUD panels. **Do not** invent ba-process AC pack. **Do not** reopen consumer FE CLOSED. Peer class = LVRULE FE-01g ACCEPT_AS_IS_P2 + EMP FE-ADMIN NOTES `R-PLT-EMP-FE-ADMIN-01` HOLD (twin). Unlock Nest att_* admin CRUD FE **only** if sponsor later explicitly opens «mở FE wave ATT FE-ADMIN / quản trị danh mục chấm công-OT». |
| **Benefits** | Honors peer FE-ADMIN HOLD · matches LVRULE + EMP FE-ADMIN class · preserves U88 bandwidth · honesty / C-SLICE intact · no seal churn · Network L1 already covers catalog admin |
| **Costs** | Nest att catalog admin remains API/Network-only until sponsor opens FE-ADMIN wave; HDSD may show REF-only / API for the admin screen |
| **Risks** | Misread HOLD as «waive att admin forever» or as permission to invent Nest admin CRUD «to complete admin» → mitigations **L-ATT-FE-ADMIN-*** |
| **Gate** | Consumer FE trio CLOSED · L1 trio RETAIN · Nest SoT LIVE · honesty false |

### Option B — UNLOCK narrow docs-only FE-ADMIN surface (sponsor-named wave)

| | |
|--|--|
| **Description** | Unlock ba-process ADD-only FE-ADMIN inventory + later `dev-fe` **only if** sponsor names an explicit FE-ADMIN wave for operator CRUD of att-code / ot-type / ot-comp-type from UI (today done via Network). |
| **Benefits** | Would ship an operator-friendly admin CRUD UI for the three Nest catalogs if sponsor prioritizes it. |
| **Costs** | On AS-IS audit: consumer FE CLOSED, Network L1 CREATE/PATCH already LIVE; unlocking now invents Nest admin CRUD FE **without sponsor** — same risk as LVRULE invent. No named product defect on the *consumer* path. |
| **Risks** | Scope creep into new admin surface · reopen consumer FE «while wiring admin» · flip attendance ready · duplicate BA seat. |
| **Gate** | **Reject as default** — PM packet: «unlikely». Retain B only if sponsor names an explicit ATT FE-ADMIN wave in the same message. |

### Option C — REJECT invent Nest admin CRUD / invent LVRULE unlock / reopen sealed consumer FE / flip attendance UAT / flip printable

| | |
|--|--|
| **Description** | Invent Nest `att_attendance_code` / `att_ot_type` / `att_ot_comp_type` admin CRUD FE as mandatory continuous Task; invent LVRULE 01g unlock; reopen ATT-CODE / OT-TYPE / OT-COMP-TYPE / ATT-WORKSITE consumer FE CLOSED; reopen EMP / CTR HOLD; flip `hrm_attendance_uat_ready` / `contracts_printable_ready` / claim module ATT UAT / Phase1 / seed. |
| **Benefits** | None for GĐ1 honesty. |
| **Costs** | Seal churn · sponsor trust · C-SLICE violation · dual admin path confusion. |
| **Risks** | **REJECT** — all DENY lines in §1.3. |

---

## 3. Trade-off matrix

| Criteria | Weight | **A ACCEPT HOLD P2** | B Unlock FE-ADMIN | C Invent/reopen/flip |
|----------|-------:|---------------------:|------------------:|---------------------:|
| Honesty / DENY invent Nest admin | 5 | **5** | 2 | 0 |
| Seal safety (CODE/OT/COMP FE CLOSED · L1 · LVRULE · EMP · CTR) | 5 | **5** | 3 | 0 |
| Match peer FE-ADMIN / LVRULE / EMP HOLD class | 5 | **5** | 1 | 0 |
| Business value (operator admin CRUD UI) | 3 | 2 | **4** | 1 |
| U88 continuous bandwidth | 4 | **5** | 1 | 0 |
| Complexity / blast radius | 4 | **5** | 2 | 0 |
| Maintainability (Nest SoT + Network L1) | 4 | **5** | 2 | 0 |
| **Weighted** | | **128** | 52 | 3 |

*(Weighted = Σ weight×score; A dominates.)*

---

## 4. Failure modes and mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| **A** | HOLD misread as AC waive / att admin «N/A forever without stamp» | Evidence claims att FE-ADMIN waived | Stamp **ACCEPT_AS_IS_P2 HOLD** · AC RETAIN deferred · Condition KEEP on board |
| **A** | Silent invent Nest att admin CRUD «to finish admin» | Diff Nest routes / new FE admin component | **FORBIDDEN** · L-ATT-FE-ADMIN-03 Nest admin DENY |
| **A** | Reopen consumer FE CLOSED under «admin polish» | Diff OvertimeRequestTab / AttendanceRecordsTable sealed paths | Cite seals CLOSED · DENY |
| **A** | Invent LVRULE 01g / ATT-WORKSITE FE / flip printable | Diff LeaveTab / WorkSite / CTR print | DENY · LVRULE HOLD · CNS-05 CLOSED · printable false |
| B | Unlock without sponsor FE-ADMIN wave | Bus DISPATCHED FE-ADMIN without sponsor message | Prefer A; B only sponsor-named wave |
| C | Ready flip / Nest invent / seal reopen | Honesty matrix / seals | DENY · NO-GO process |

---

## 5. Decision

| | |
|--|--|
| **Selected** | **Option A** — architecture **LOCKED** |
| **Seat verdict** | **CONFIRMED** |
| **Disposition** | **ACCEPT_AS_IS_P2 HOLD** on **`R-PLT-ATT-FE-ADMIN-01`** (pack includes `R-PLT-ATT-CODE-FE-ADMIN` + `R-PLT-ATT-OT-FE-ADMIN` + `R-PLT-ATT-COMP-FE-ADMIN`) |
| **Why A** | Consumer FE ATT-CODE / OT-TYPE / OT-COMP-TYPE **CLOSED** (GWC); Nest is SoT for all three (Option B catalog); Network L1 CREATE/PATCH **LIVE**; Nest admin CRUD FE **ABSENT** = peer FE-ADMIN HOLD class (same as EMP-STATUS ST/STR admin, LVRULE 01g). No named closable consumer FE residual OPEN; ATT-WORKSITE CNS-05 CLOSED — do not invent. Option B unlock **not** sponsor-evidenced. |
| **Rejected** | **B** as default unlock · **C** invent Nest / reopen / flip |
| **Assumptions** | Sponsor has **not** opened ATT FE-ADMIN wave in this message; LVRULE 01g remains HOLD; EMP/CTR HOLD RETAIN; honesty flags remain false. |

### 5.1 Unlock gates (what Option A does **not** open)

| Question | Answer |
|----------|--------|
| Unlock ba-process new AC pack? | **HOLD** — CODE/OT/COMP AC already locked · **no** duplicate BA seat for admin invent |
| Unlock ba-data / new Nest tables? | **FORBIDDEN** — att_* tables already LIVE (Option B) · no schema change |
| Unlock Nest att admin CRUD FE mandatory? | **HOLD** until sponsor opens FE-ADMIN wave |
| Unlock / reopen consumer FE CLOSED? | **FORBIDDEN** |
| Unlock LVRULE 01g / ATT-WORKSITE FE / flip printable? | **FORBIDDEN** |
| May PM flip `hrm_attendance_uat_ready` / claim module ATT UAT? | **NO** |
| May PM remove Condition from board as CLOSED? | **NO** — keep **HOLD P2** stamp · ACCEPT_AS_IS ≠ CLOSED Condition · ≠ WAIVED |

### 5.2 When sponsor later opens ATT FE-ADMIN wave (narrow alternate — not default)

```text
entry: sponsor message contains explicit «mở FE wave ATT FE-ADMIN / quản trị danh mục chấm công · OT · loại chi trả»
retain: ATTCODEQAFE-MSKCJA95 · ATTOTQAFE-MSK9TJDM · ATTCOMPQAFE-MSKBBEJW CLOSED · L1 trio · LVRULE HOLD · EMP/CTR HOLD · honesty false
scope_allowed:
  1) optional ba-process ADD-only UF inventory for Nest att-code / ot-type / ot-comp-type admin CRUD FE — NOT redefine Nest Option B schema
  2) dev-fe: Nest att_* admin CRUD surface ONLY (Network L1 already LIVE)
scope_FORBIDDEN:
  - new Nest tables / schema change (att_* already SoT)
  - reopen consumer FE CLOSED
  - invent LVRULE 01g / ATT-WORKSITE FE / flip printable
  - flip attendance ready / module ATT UAT / seed
exit: R-PLT-ATT-*-FE-ADMIN may CLOSE; R-PLT-ATT-FE-ADMIN-01 pack may narrow; honesty false RETAIN · C-SLICE
```

### 5.3 Architecture boundary diagram (text)

```text
  ATT-CODE Nest att_attendance_code L1 + invent KEY   --> SEALED (ATTCODEQA-MSK4T1A5)
  ATT-CODE consumer EFF Edit rebind FE                --> CLOSED (ATTCODEQAFE-MSKCJA95)
  ATT-CODE Nest admin CRUD FE                         --> ABSENT HOLD (R-PLT-ATT-CODE-FE-ADMIN)

  OT-TYPE Nest att_ot_type L1 + invent KEY           --> SEALED (ATTOTQA-MSK8VETU)
  OT-TYPE consumer OvertimeRequestTab EFF FE         --> CLOSED (ATTOTQAFE-MSK9TJDM)
  OT-TYPE Nest admin CRUD FE                         --> ABSENT HOLD (R-PLT-ATT-OT-FE-ADMIN)

  OT-COMP-TYPE Nest att_ot_comp_type L1              --> SEALED (Network L1)
  OT-COMP consumer OvertimeRequestTab comp EFF FE    --> CLOSED (ATTCOMPQAFE-MSKBBEJW / OTC-03)
  OT-COMP Nest admin CRUD FE                         --> ABSENT HOLD (R-PLT-ATT-COMP-FE-ADMIN)

  R-PLT-ATT-FE-ADMIN-01 (pack of the 3 ABSENT rows)  --> ACCEPT_AS_IS_P2 HOLD
  LVRULE FE-01g / EMP FE-ADMIN / CTR FE              --> HOLD RETAIN (peer class)
  ATT-WORKSITE CNS-05                                --> CLOSED — do not invent
  hrm_attendance_uat_ready / contracts_printable     --> false RETAIN · C-SLICE
```

---

## 6. Locks (L-ATT-FE-ADMIN-*)

| Lock | Rule |
|------|------|
| **L-ATT-FE-ADMIN-01 HOLD ≠ WAIVE** | ACCEPT_AS_IS_P2 **does not** delete AC-PLT-ATT-CODE / AC-PLT-ATT-OT / AC-PLT-ATT-OTC · Nest att admin AC remains deferred FAIL-if-claimed until FE-ADMIN wave |
| **L-ATT-FE-ADMIN-02 Consumer CLOSED frozen** | ATTCODEQAFE-MSKCJA95 · ATTOTQAFE-MSK9TJDM · ATTCOMPQAFE-MSKBBEJW **FORBIDDEN reopen** |
| **L-ATT-FE-ADMIN-03 Nest admin DENY** | No invent Nest att-code / ot-type / ot-comp-type admin CRUD FE without sponsor FE-ADMIN wave |
| **L-ATT-FE-ADMIN-04 LVRULE HOLD** | DENY invent LVRULE 01g unlock |
| **L-ATT-FE-ADMIN-05 Printable frozen** | DENY flip `contracts_printable_ready` · CTR FE HOLD RETAIN |
| **L-ATT-FE-ADMIN-06 EMP twin RETAIN** | DENY reopen EMP FE CLOSED / EMP FE-ADMIN HOLD (`R-PLT-EMP-FE-ADMIN-01`) |
| **L-ATT-FE-ADMIN-07 Honesty** | DENY flip `hrm_attendance_uat_ready` / `attendance_e2e_linkage_ready` · C-SLICE RETAIN |
| **L-ATT-FE-ADMIN-08 Condition KEEP** | ACCEPT_AS_IS ≠ CLOSED ≠ WAIVED — keep HOLD P2 on board |
| **L-ATT-FE-ADMIN-09 Nest SoT ≠ Settings gap** | Nest att_* is SoT (no dual-master); FE-ADMIN ABSENT is Nest admin deepen, not a Settings-path unlock |
| **L-ATT-FE-ADMIN-10 Path lock** | UTF-8 no BOM on NFD `.git`+`apps` True tree |

---

## 7. Impacted systems & non-goals

| In scope (docs disposition) | OUT / FORBIDDEN |
|-----------------------------|-----------------|
| Board residual `R-PLT-ATT-FE-ADMIN-01` ACCEPT_AS_IS_P2 HOLD | `apps/**` edits · migration · seed |
| Option A/B/C + LOCKED A · next_dispatch PM | Invent Nest att-code / ot-type / ot-comp-type admin CRUD FE |
| Cite peer LVRULE / EMP FE-ADMIN HOLD class | Reopen ATT-CODE / OT-TYPE / OT-COMP-TYPE consumer FE CLOSED |
| Consolidate 3 FE-ADMIN NOTES into pack | Invent LVRULE 01g · ATT-WORKSITE FE · flip printable |
| U88 PM continue next vertical/governance | Flip attendance ready · module ATT UAT · Phase1 DONE |
| Nest att_* SoT + Network L1 admin RETAIN | Reopen EMP / CTR HOLD |

---

## 8. Validation / acceptance evidence plan

| Checkpoint | PASS when |
|------------|-----------|
| Spec ≥8KB on NFD `.git` toplevel | This file Length verified |
| Status | **CONFIRMED** · Option **A** **LOCKED** |
| Residual | `R-PLT-ATT-FE-ADMIN-01` minted · HOLD P2 (not CLOSED · not WAIVED) |
| next_dispatch | ACCEPT HOLD seal to **pm** — **not** invent ba-process/FE Nest admin |
| Honesty | ready=false · C-SLICE · DENY Nest invent · DENY sealed FE reopen · DENY LVRULE invent · DENY flip printable |
| Peer seals | CODE/OT/COMP FE CLOSED · L1 · LVRULE HOLD · EMP FE-ADMIN HOLD · CTR FE HOLD RETAIN |
| Board | No open closable ATT consumer FE residual used to force Option B |

---

## 9. Peer seal RETAIN checklist (FORBIDDEN reopen)

| Seal / HOLD | Stamp / id | Action |
|-------------|------------|--------|
| ATT-CODE FE | `ATTCODEQAFE-MSKCJA95` CLOSED | RETAIN |
| OT-TYPE FE | `ATTOTQAFE-MSK9TJDM` CLOSED | RETAIN |
| OT-COMP-TYPE FE | `ATTCOMPQAFE-MSKBBEJW` CLOSED (OTC-03) | RETAIN |
| L1 ATT-CODE | `ATTCODEQA-MSK4T1A5` | RETAIN |
| L1 OT-TYPE | `ATTOTQA-MSK8VETU` | RETAIN |
| L1 OT-COMP-TYPE | Nest att_ot_comp_type Network L1 | RETAIN |
| LVRULE 01g | ACCEPT_AS_IS_P2 HOLD | RETAIN · DENY invent unlock |
| EMP FE-ADMIN | `R-PLT-EMP-FE-ADMIN-01` HOLD | RETAIN · twin class |
| EMP consumer FE | `EMPSTQAFE2-MSKE3NV1` · `EMPPOSQCFE-8DEF5536` · `EMPDEPTQCFE-MSKH2Q7P` CLOSED | RETAIN |
| CTR-TEMPLATE FE | HOLD · printable not flipped | RETAIN |
| ATT-WORKSITE CNS-05 | `ATTWSQA2-MSJCG47P` CLOSED | RETAIN · do not invent |

---

## 10. completion_report

**Closed:** SA Option/F.1 for ATT **FE-ADMIN notes pack** after ATT-CODE / OT-TYPE / OT-COMP-TYPE consumer FE CLOSED — READ-ONLY apps/web audit shows only `listEffective*` GET clients and **no** FE-ADMIN CRUD component/client for the three Nest catalogs (admin via Network L1); board audit shows **no** open closable consumer FE residual; class = deepen ABSENT Nest admin CRUD (peer LVRULE + EMP FE-ADMIN twin); Option **A/B/C** evaluated; **Option A LOCKED ACCEPT_AS_IS_P2 HOLD**; mint **`R-PLT-ATT-FE-ADMIN-01`** (packs CODE + OT + COMP FE-ADMIN); ba-process/FE **HOLD**; DENY invent Nest att admin CRUD · invent LVRULE · reopen sealed consumer FE · reopen EMP/CTR HOLD · flip printable · flip attendance ready; honesty false · C-SLICE · docs-only · no `apps/**`.

**Open / residual:** Condition **`R-PLT-ATT-FE-ADMIN-01`** remains **HOLD P2** on W8 board until sponsor opens ATT FE-ADMIN wave (Nest att_* admin CRUD FE only); ready flags false.

**next_owner:** **pm**

**ack_status:** **PASS_TO_PM** · **CONFIRMED** · Option **A** **LOCKED**

**evidence_path:** `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01.md`

### next_dispatch_prompt (copy-ready — U88 next peer)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01
from_role: sa
to_role: pm
lane: governance · U88
ack_status: PASS_TO_PM
verdict: Option A LOCKED — ACCEPT_AS_IS_P2 HOLD on R-PLT-ATT-FE-ADMIN-01
action:
  1) Seal board residual R-PLT-ATT-FE-ADMIN-01 = ACCEPT_AS_IS_P2 HOLD (Condition KEEP — not CLOSED; not WAIVED)
     · pack includes R-PLT-ATT-CODE-FE-ADMIN + R-PLT-ATT-OT-FE-ADMIN + R-PLT-ATT-COMP-FE-ADMIN (Nest admin CRUD FE ABSENT · Network L1 SoT)
  2) DENY invent ba-process / Nest admin CRUD FE / new att_* tables Tasks from this residual
  3) RETAIN: ATTCODEQAFE-MSKCJA95 · ATTOTQAFE-MSK9TJDM · ATTCOMPQAFE-MSKBBEJW CLOSED
     · L1 ATTCODEQA-MSK4T1A5 · ATTOTQA-MSK8VETU · att_ot_comp_type Network L1
     · LVRULE 01g HOLD · EMP FE CLOSED · EMP FE-ADMIN HOLD (R-PLT-EMP-FE-ADMIN-01) · CTR FE HOLD
     · honesty false · C-SLICE · ATT-WORKSITE CNS-05 CLOSED
  4) Continue U88 next vertical/governance peer per continuous board
     — DENY invent LVRULE unlock · DENY reopen sealed ATT/EMP consumer FE · DENY flip contracts_printable_ready · DENY flip hrm_attendance_uat_ready
sponsor_gated_reopen_only: explicit «mở FE wave ATT FE-ADMIN / quản trị danh mục chấm công · OT · loại chi trả»
  → then narrow Nest att_* admin CRUD FE only (Nest Option B schema RETAIN · no new tables)
evidence: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01.md
```

**DENY alternate:** invent Nest att-code / ot-type / ot-comp-type admin CRUD FE · invent LVRULE 01g · reopen ATT-CODE/OT-TYPE/OT-COMP-TYPE consumer FE CLOSED · reopen ATT-WORKSITE CNS-05 · reopen EMP/CTR HOLD · flip `contracts_printable_ready` · flip `hrm_attendance_uat_ready` · claim module ATT UAT / Phase1 DONE · seed · apps/**.

---

## 11. F.1 API / DB disposition notes (governance — no physical unlock)

| Layer | Disposition |
|-------|-------------|
| **DB** | No ADD table · Nest `att_attendance_code` / `att_ot_type` / `att_ot_comp_type` remain **LIVE SoT (Option B)** — this seat does **not** open ba-data · no schema change |
| **API** | No new Nest admin CRUD FE routes required; BE CREATE/PATCH admin endpoints already proven at **Network L1** (RETAIN); `GET /effective` consumers RETAIN |
| **FE consumer** | CLOSED RETAIN — **out of scope** (`useAtt*Effective` hooks · OvertimeRequestTab · AttendanceRecordsTable) |
| **FE admin** | Nest att_* admin CRUD **HOLD** (ABSENT — Network L1 is admin path today) |
| **F.1 completeness** | Disposition complete for residual class; physical F.1 for Nest att admin CRUD FE deferred until sponsor FE-ADMIN wave (optional BA ADD click-path only) |

---

## 12. References

| Artifact | Role |
|----------|------|
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-ADMIN-NOTES-SA-01.md` | Twin ACCEPT_AS_IS_P2 HOLD class (`R-PLT-EMP-FE-ADMIN-01`) |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-FE-01G-SA-01.md` | Peer ACCEPT_AS_IS_P2 HOLD class |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-FE-SA-01.md` | CTR FE HOLD · printable not flipped |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01.md` | Consumer catalog Option B (Nest SoT) · L1 KEY |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01.md` | Consumer catalog Option B · OvertimeRequestTab EFF |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01.md` | Consumer catalog Option B · OTC-03 |
| `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` | Continuous board · ATT FE-ADMIN NOTES row |
| `apps/web/hrm/src/integrations/hrmApi.ts` §5480–5591 | READ-ONLY audit: GET `listEffective*` only · no admin CRUD client |
| `.cursor/templates/ADR_OPTION_TEMPLATE.md` | Option evaluation structure |

---

## 13. Expanded rationale (audit trail for PM / QC)

### 13.1 Why this is not consumer UNLOCK class

ATT-CODE-CATALOG, OT-TYPE-CATALOG, and OT-COMP-TYPE-CATALOG each shipped a **consumer** FE binding (EFF hooks + OvertimeRequestTab / AttendanceRecordsTable Edit rebind). Those consumer Conditions (R-PLT-ATT-CODE-FE-01, OT-TYPE FE-01, OTC-03) were executed by dev-fe, verified by QA-FE (U65 browser Nest Edit + PATCH), and CLOSED at QC-FE GWC. This seat owns **only** the remaining **FE-ADMIN / Nest admin CRUD ABSENT** class. Treating FE-ADMIN as another mandatory `dev-fe` wave would violate the same DENY invent FE-ADMIN lines already stamped on CODE/OT/COMP QC-FE evidence and on the EMP FE-ADMIN + LVRULE HOLD peers.

### 13.2 Why Nest SoT (not Settings) shapes this pack

Unlike EMP-POSITION / EMP-DEPT (Settings/XBOS SoT → Nest DENY dual-master), the three ATT catalogs chose **Option B = Nest platform tables as SoT** (att_attendance_code, att_ot_type, att_ot_comp_type). Therefore there is **no** Settings dual-master concern and **no** «Settings path missing» unlock (Option B EMP-style). The admin SoT is Nest itself, and admin CREATE/PATCH is already exercised at Network L1. The only missing piece is an *optional* operator FE-ADMIN CRUD panel — identical to EMP-STATUS Nest ST/STR admin FE ABSENT (Network L1 OK) → HOLD.

### 13.3 Why Nest att admin CRUD FE stays HOLD (not invent)

Catalog Option B made Nest att_* the SoT with L1 invent KEY + CREATE/PATCH proven via Network. Consumer form EFF bindings are CLOSED. The remaining gap is an **optional** Nest admin UI for operators who today use API/Network. That is identical to ATT leave-accrual L1 (Network OK) + FE-ADMIN ABSENT HOLD (LVRULE 01g), and to EMP-STATUS ST/STR admin FE ABSENT HOLD. Per PM preferred Option A and the LVRULE + EMP FE-ADMIN twin, **ACCEPT_AS_IS_P2 HOLD** until sponsor opens FE-ADMIN wave — **not** ba-process invent now.

### 13.4 Honesty / C-SLICE statement

Closing consumer FE Conditions and stamping FE-ADMIN HOLD **must not** flip:

- `hrm_attendance_uat_ready`
- `attendance_e2e_linkage_ready`
- `contracts_printable_ready`

Nor claim module ATT UAT, Phase1 DONE, or UF 🟢 for whole ATT. **`C-SLICE-≠-MODULE`** remains true: many GWC slices ≠ module GO.

### 13.5 U88 continuity after this seat

PM should:

1. Seal `R-PLT-ATT-FE-ADMIN-01` HOLD on W8 board.
2. **Not** dispatch ba-process AC pack for FE-ADMIN (HOLD).
3. Continue next vertical / governance peer (other open board rows) without inventing LVRULE unlock, reopening sealed ATT/EMP consumer FE, or flipping printable.
4. Keep ATT-WORKSITE CNS-05 CLOSED — do not invent as «next FE».

---

## 14. Residual ID registry (mint)

| ID | Severity | Status after this seat | Owner next |
|----|----------|------------------------|------------|
| **R-PLT-ATT-FE-ADMIN-01** | P2 | **ACCEPT_AS_IS_P2 HOLD** (KEEP Condition) | pm (board seal) |
| R-PLT-ATT-CODE-FE-ADMIN | P2 | **HOLD ⊆ pack** (not CLOSED) | sponsor-gated FE-ADMIN wave |
| R-PLT-ATT-OT-FE-ADMIN | P2 | **HOLD ⊆ pack** (not CLOSED) | sponsor-gated FE-ADMIN wave |
| R-PLT-ATT-COMP-FE-ADMIN | P2 | **HOLD ⊆ pack** (not CLOSED) | sponsor-gated FE-ADMIN wave |
| R-PLT-ATT-CODE-FE-01 | — | **CLOSED ACCEPT** RETAIN (`ATTCODEQAFE-MSKCJA95`) | — |
| OT-TYPE FE-01 | — | **CLOSED ACCEPT** RETAIN (`ATTOTQAFE-MSK9TJDM`) | — |
| OTC-03 | — | **CLOSED ACCEPT** RETAIN (`ATTCOMPQAFE-MSKBBEJW`) | — |

---

*End of SA Option/F.1 — ATT FE-ADMIN NOTES — Option A LOCKED ACCEPT_AS_IS_P2 HOLD · R-PLT-ATT-FE-ADMIN-01 · PASS_TO_PM*