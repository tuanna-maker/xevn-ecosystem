# PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-FE-ADMIN-NOTES-SA-01 — Option/F.1 · PAY FE-ADMIN notes pack residual

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-FE-ADMIN-NOTES-SA-01` |
| **Parent** | PAY-CATALOG-CNS-QC-01 **GWC** · invent KEY **`PAYCNSQA-MSJ6E3QM`** · CNS-FE-01 **READY** (vitest) absorbed by QA-01 · DOCS **ACCEPT** SRS **v0.25** · HDSD **CH09** · prior EMP-CUSTOM-FIELD-FE-SA-01 Option **B** HOLD sealed (**`R-PLT-EMP-CF-FE-01`** · SPEC 38846) |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa · **docs-only** · **NO** `apps/**` |
| **change_mode** | **ADD** Option/F.1 disposition for consolidated PAY **FE-ADMIN notes** residual after salary_components catalog CNS wave · **no seed** · **no wipe** sealed peers |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — Option **A** **LOCKED** · **ACCEPT_AS_IS_P2 HOLD** forever-until-sponsor · ba-process **HOLD** (no new AC pack) · FE/BE **HOLD** · invent Nest dual PAY admin **DENY** · reopen CNS GWC as FAIL **DENY** |
| **residual_id** | **`R-PLT-PAY-FE-ADMIN-01`** *(minted this seat — consolidates Nest salary_components FE-ADMIN + Settings C&B REF notes)* |
| **prior_cns** | CNS-QA-01 PASS stamp **`PAYCNSQA-MSJ6E3QM`** · CNS-QC-01 **GWC** · CNS-BE-01 jest 54 · CNS-FE-01 vitest READY absorbed — **FORBIDDEN reopen as FAIL** |
| **prior_catalog** | PAY-CATALOG SA Option **B** Nest SoT · BA AC-PLT-PAY-01* · API F-PLT-PAY-COMP-01..04 · PAY-CATALOG QC GWC **SEAL RETAIN** |
| **prior_docs** | PAY-CATALOG-DOCS-01 **ACCEPT** · SRS v0.25 FR-UC-BP-PAY-02 · HDSD CH09 — **RETAIN** |
| **peer_cite_hold** | [`SI-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-FE-ADMIN-NOTES-SA-01.md) **Option A ACCEPT_AS_IS_P2 HOLD · `R-PLT-SI-FE-ADMIN-01`** (SPEC 40113) · [`ATT-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01.md) **Option A · `R-PLT-ATT-FE-ADMIN-01`** (SPEC 31734) · [`EMP-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-ADMIN-NOTES-SA-01.md) **Option A · `R-PLT-EMP-FE-ADMIN-01`** · EMP-CF-FE **`R-PLT-EMP-CF-FE-01` HOLD** — **cite class (twin pack)** |
| **peer_cite_consumer** | PAY-CATALOG CNS consumer assert **SEAL ACCEPT** · Nest picker rebind READY — **≠** this residual class · **FORBIDDEN reopen CNS GWC** |
| **Honesty** | `payroll_e2e_ready=false` · formula LIVE **DENIED** · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · **`C-SLICE-≠-MODULE`** · U65 · **DENIED** module PAY UAT · Phase1 DONE · seed · flip printable/personnel/payroll ready · invent Nest dual PAY admin · invent LVRULE · reopen EMP-CF/FE-ADMIN HOLDs as unlock · reopen CNS as FAIL |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option pack)

| | |
|--|--|
| **Decision title** | Disposition for PAY **FE-ADMIN notes pack** after salary_components CNS wave (KEY LIVE · admin open N+1 proven · consumer invent KEY proven) — ACCEPT_AS_IS HOLD vs unlock FE-ADMIN deepen vs invent Nest dual / reopen CNS |
| **Requestor** | pm · U88 continuous · after EMP-CUSTOM-FIELD-FE-SA-01 Option B HOLD sealed (`R-PLT-EMP-CF-FE-01` · SPEC 38846) · PAY-CATALOG CNS QC-01 GWC · DOCS ACCEPT |
| **Decision owner** | sa |
| **Related** | Nest `public.salary_components` SoT LIVE · Payroll `SalaryComponentsTab` FE-ADMIN LIVE · CNS consumer pickers READY/absorbed · Settings C&B extension REF · SI/ATT/EMP FE-ADMIN HOLD peers · LVRULE 01g HOLD · OBS C&B picker idle-ok P2 |
| **Template** | `.cursor/templates/ADR_OPTION_TEMPLATE.md` §§1–7 + F.1 notes |
| **Board** | `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` row `…-PAY-FE-ADMIN-NOTES-SA-01` **DISPATCHED** |

### 1.1 Problem — what residual remains after CNS GWC

PAY-CATALOG CNS consumer assert is **SEAL ACCEPT** (QC GWC · stamp `PAYCNSQA-MSJ6E3QM`). Catalog Option B Nest SoT is **LOCKED**. DOCS SRS v0.25 / HDSD CH09 **ACCEPT**. What remains is **not** another closable CNS consumer KEY residual — it is the **FE-ADMIN notes pack class** (peer SI / ATT / EMP FE-ADMIN NOTES):

| Residual / note | Severity | Surface inventory (AS-IS) | Proven already (RETAIN) |
|-----------------|----------|---------------------------|-------------------------|
| **`R-PLT-PAY-SC-FE-ADMIN`** | **P2 HOLD NOTE** | Nest «Thành phần lương / salary_components» Payroll admin CRUD FE **LIVE** — `SalaryComponentsTab` mounted on `Payroll.tsx` · `useSalaryComponents` create/update/delete · `hrmApi` `createSalaryComponent` / `updateSalaryComponent` / `deleteSalaryComponent` · browser admin CREATE **201** `HRM-SC-201` (`CNSQA_J6E3O4`) · F5 total proven | Nest SC L1 + PAY-CATALOG QC · CNS AC-PLT-PAY-01c · invent KEY consumer closed at CNS |
| **`R-PLT-PAY-SETTINGS-CB-REF`** | **P2 HOLD NOTE** | Settings C&B / catalogs extension keys `salary_components` / `payroll_components` = **REF/alias only** (Option A picker SoT **REJECT**) · `SettingsCatalogsTab` / `mdBucketRegistry` / `CatalogSearchPicker` aliases — **≠** Nest SoT · **≠** second admin writer | L-PAY-AC-02 · BR-PLT-PAY-04 · O4 Settings-only REJECT RETAIN |
| **`R-PLT-PAY-FE-ADMIN-01`** *(mint this seat)* | **P2 HOLD NOTE pack** | **Consolidation** of the two rows above into one board residual for U88 continuity — **does not** invent new product surface · **does not** reopen CNS GWC | CNS GWC · DOCS ACCEPT · Nest SoT RETAIN |

**Critical discrimination vs ATT FE-ADMIN ABSENT and vs SI LIVE:**

| Catalog family | FE-ADMIN mount | FE-ADMIN persist client | Consumer FE / CNS | Residual class this seat |
|----------------|----------------|-------------------------|-------------------|--------------------------|
| **ATT** CODE/OT/COMP | **ABSENT** (GET `listEffective*` only) | **ABSENT** create/update client | CLOSED | HOLD = deepen ABSENT Nest admin until sponsor |
| **EMP** ST Nest | **ABSENT** Nest ST admin | Network L1 only | CLOSED | HOLD = Nest ST admin ABSENT |
| **SI** INS + INSURER | Settings Nest admin tabs **LIVE** | `upsert*` / `retire*` **LIVE** | CLOSED | HOLD = **no closable mount/persist gap** · NOTE pack |
| **PAY** salary_components | Payroll tab **LIVE** (`SalaryComponentsTab`) | `create/update/deleteSalaryComponent` **LIVE** | CNS SEAL ACCEPT (`PAYCNSQA-MSJ6E3QM`) | HOLD = **no closable mount/persist gap** · NOTE pack (SI-class inventory) |

**Discrimination (must not confuse with consumer UNLOCK / CNS reopen):**

| Class | When used | PAY salary_components | This seat (FE-ADMIN notes) |
|-------|-----------|----------------------|----------------------------|
| **Consumer CNS / picker invent KEY** | Nest SoT + BE assert + FE rebind · AC-PAY-COMP-01 | CNS-QA/QC → **GWC SEAL** · KEY LIVE | **OUT** — already SEALED · **FORBIDDEN reopen as FAIL** |
| **FE-ADMIN / deepen ABSENT Nest admin panel** | Network L1 OK · product Nest admin CRUD FE OUT | **NOT PAY AS-IS** — Payroll admin tab **LIVE** | Cite ATT peer class only for *pack structure* — PAY audit ≠ ABSENT |
| **FE-ADMIN LIVE + no mount/persist gap** | Payroll tab mount + CRUD wire + CNS admin CREATE proven | Admin shipped · AC-PLT-PAY-01c browser PASS | **THIS residual** → Option **A ACCEPT_AS_IS_P2 HOLD** |
| **OBS C&B picker idle-ok** | Panel not opened in CNS QA · BE KEY proven | CONDITION idle-ok P2 (QC) | **NOTE RETAIN** — **≠** closable FE-ADMIN mount/persist gap · **≠** unlock trigger |
| **Invent / reopen / flip** | Invent second Nest PAY admin path · reopen CNS as FAIL · LVRULE unlock · flip payroll ready | REJECT | **Option C REJECT** |

**Board audit (closable CNS residual still OPEN? closable FE-ADMIN mount/persist gap?)**

| Candidate | Board / seal | Verdict for this seat |
|-----------|--------------|------------------------|
| PAY-CATALOG CNS consumer invent KEY | QC-01 GWC · `PAYCNSQA-MSJ6E3QM` SEAL ACCEPT | **SEALED** — **FORBIDDEN reopen as FAIL** |
| PAY-CATALOG CNS-FE-01 Nest picker rebind | READY vitest · QA-01 absorbs | **RETAIN** — not reopen as mandatory `dev-fe` |
| PAY-CATALOG CNS-BE-01 VAL assert | jest 54 READY | **RETAIN** |
| PAY-CATALOG DOCS | ACCEPT SRS v0.25 · HDSD CH09 | **RETAIN** |
| PAY-CATALOG QC (admin catalog prior) | GWC SEAL RETAIN | **RETAIN** — not reopen |
| Nest SC FE-ADMIN mount `SalaryComponentsTab` | `Payroll.tsx` tab → panel LIVE | **LIVE** — **no mount gap** |
| Nest SC FE-ADMIN persist | `useSalaryComponents` · create/update/delete · browser **201** | **LIVE** — **no persist gap** |
| Settings `salary_components` extension | REF/alias only · not sole SoT | **REF RETAIN** — DENY revive Option A |
| OBS C&B picker | QC CONDITION idle-ok P2 | **HOLD NOTE** — not unlock gap |
| SI FE-ADMIN pack | `R-PLT-SI-FE-ADMIN-01` ACCEPT_AS_IS_P2 HOLD | **HOLD RETAIN** — twin LIVE class |
| ATT FE-ADMIN pack | `R-PLT-ATT-FE-ADMIN-01` ACCEPT_AS_IS_P2 HOLD | **HOLD RETAIN** — **FORBIDDEN reopen as unlock** |
| EMP FE-ADMIN / EMP-CF FE | `R-PLT-EMP-FE-ADMIN-01` · `R-PLT-EMP-CF-FE-01` HOLD | **HOLD RETAIN** — DENY reopen as unlock |
| LVRULE FE-01g | ACCEPT_AS_IS_P2 HOLD | **HOLD RETAIN** — DENY invent unlock |

**Conclusion:** No named closable **CNS consumer** residual remains OPEN as FAIL. READ-ONLY audit finds **no closable FE-ADMIN mount/persist gap** (Payroll `SalaryComponentsTab` mounted + Nest CRUD clients wired + CNS browser admin CREATE proven). Residual class = **FE-ADMIN notes pack after LIVE admin + CNS SEAL** → prefer Option **A** · residual stays **HOLD** (not UNLOCK to `dev-fe`).

### 1.2 READ-ONLY apps/web audit (cited — no edit)

| Surface | Path | Kind | Verdict |
|---------|------|------|---------|
| Nest SC list API client | `apps/web/hrm/src/integrations/hrmApi.ts` · `listSalaryComponents` · `HrmSalaryComponentRow` (~5190–5205) | GET F-PLT-PAY-COMP-01 | **LIVE** RETAIN |
| Nest SC admin CRUD clients | `hrmApi.ts` · `createSalaryComponent` · `updateSalaryComponent` · `deleteSalaryComponent` (~5216–5240) · categories (~5245–5256) | FE-ADMIN CRUD client | **LIVE** |
| Admin hook | `apps/web/hrm/src/hooks/useSalaryComponents.ts` | list/create/update/delete TX | **LIVE** persist path |
| Admin panel | `apps/web/hrm/src/components/payroll/SalaryComponentsTab.tsx` | Payroll «Thành phần lương» CRUD · Zod+RHF | **LIVE mount+persist** |
| Payroll shell mount | `apps/web/hrm/src/pages/Payroll.tsx` · import + render `<SalaryComponentsTab />` | product admin route | **MOUNTED LIVE** |
| Consumer EFF hook | `apps/web/hrm/src/hooks/useSalaryComponentsEffective.ts` | Nest effective cache for pickers | CNS READY RETAIN |
| Catalog helpers | `apps/web/hrm/src/lib/salaryComponentCatalog.ts` · `.test.ts` | display-ready · soft warn · Nest SoT note | RETAIN |
| Form schema admin≠consumer | `apps/web/hrm/src/components/payroll/salaryComponentFormSchema.ts` | admin open N+1 · optional consumer invent-ban helper | RETAIN · L-PAY-AC-01 |
| Consumer C&B panel | `apps/web/hrm/src/components/employee/EmployeeCompensationPanel.tsx` | Nest EFF picker · invent VI | CNS RETAIN · OBS idle-ok ≠ gap |
| Consumer template lines | `apps/web/hrm/src/components/payroll/SalaryTemplatesTab.tsx` · `PaySheetTemplateSettingsPanel.tsx` | Nest picker / empty VI AC-01b | CNS RETAIN |
| Formula soft refs | `apps/web/hrm/src/components/payroll/PayFormulaAuthorPanel.tsx` | soft · formula LIVE DENIED | RETAIN |
| Settings catalogs REF | `apps/web/hrm/src/components/settings/SettingsCatalogsTab.tsx` · `pages/Settings.tsx` | extension overview | **REF** ≠ sole SoT |
| Settings defaults / C&B bind | `apps/web/hrm/src/components/settings/SettingsDefaultsPanel.tsx` | may call `listSalaryComponents` | REF/consumer-soft RETAIN |
| CatalogSearchPicker aliases | `apps/web/hrm/src/lib/catalogSearchPicker.ts` · `catalogDisplayLabels.ts` · `mdBucketRegistry.ts` | `salary_components` / `payroll_components` aliases | **REF only** · DENY sole SoT revive |
| Domain UI reducer | `apps/web/hrm/src/components/payroll/payrollDomainUi.ts` | edit/delete dialog state for SC | LIVE admin UX RETAIN |

**Audit finding (unlock gate):** Unlike ATT CODE/OT/COMP (GET `listEffective*` **only**, **no** create/update admin client, **no** admin panel), PAY ships **full FE-ADMIN path**: Payroll tab mount + `SalaryComponentsTab` CRUD + Nest create/update/delete clients. CNS wave already proved admin CREATE N+1 browser (**201** `HRM-SC-201`) and consumer invent KEY (**422** `HRM-SC-COMP-KEY`). OBS C&B picker idle-ok is **not** a missing mount/persist of admin. **No closable FE-ADMIN mount/persist gap** → Option A HOLD · **do not** `next_owner=dev-fe`.

### 1.3 Constraints

- Docs-only · **no** `apps/**` · **no** seed (U65)
- **DENY** invent Nest dual PAY admin FE as *new* mandatory continuous Task (admin already LIVE on Payroll — invent would be dual/polish without sponsor)
- **DENY** reopen PAY-CATALOG CNS QC-01 GWC as FAIL · reopen CNS-QA stamp · reopen CNS-BE/FE READY as FAIL
- **DENY** invent LVRULE 01g unlock · reopen EMP-CF FE HOLD / EMP FE-ADMIN HOLD / SI FE-ADMIN HOLD / ATT FE-ADMIN HOLD **as unlock**
- **DENY** reopen sealed EMP/ATT/SI consumer FE CLOSED · flip `contracts_printable_ready` / `hrm_personnel_uat_ready` / `payroll_e2e_ready`
- **DENY** claim module PAY UAT · formula LIVE · Phase1 DONE · UF 🟢 whole PAY
- BA AC packs for PAY-CATALOG **already locked** (BA-01) · DOCS ACCEPT — this seat is **disposition**, not redefine Nest Option B SoT
- must_keep: **CNS GWC `PAYCNSQA-MSJ6E3QM`** · **Nest SC SoT** · **SalaryComponentsTab LIVE** · **Settings ≠ sole SoT** · **SI/ATT/EMP FE-ADMIN HOLD** · **LVRULE HOLD** · **honesty false** · **C-SLICE**

### 1.4 Decision heuristic

| Rule | Application |
|------|-------------|
| CNS SEAL + Nest is SoT + FE-ADMIN mount+persist LIVE + admin CREATE proven | FE-ADMIN invent deepen = **Option B/C reject**; note = HOLD pack |
| Closable FE-ADMIN mount/persist gap found? | Audit: **NO** → residual **HOLD** · next_owner **pm** (not `dev-fe`) |
| OBS C&B idle-ok alone? | **Not** a mount/persist gap → **does not** unlock Option B |
| Unlock FE-ADMIN only if sponsor explicitly opens polish wave OR audit finds mount/persist gap | Board + audit: no gap · no sponsor FE-ADMIN polish message → **Option A** |
| No open closable CNS FAIL residual | Prefer **A**; do not invent LVRULE / reopen EMP-CF/FE-ADMIN HOLDs / flip printable |

---

## 2. Options

### Option A — ACCEPT_AS_IS_P2 HOLD forever-until-sponsor for PAY FE-ADMIN notes — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Mint / stamp board residual **`R-PLT-PAY-FE-ADMIN-01`** as **P2 HOLD / NOTE pack** consolidating: (1) **`R-PLT-PAY-SC-FE-ADMIN`** Nest salary_components Payroll admin FE **LIVE** notes (mount+persist RETAIN · no further mandatory deepen); (2) **`R-PLT-PAY-SETTINGS-CB-REF`** Settings C&B extension REF-only notes (DENY sole SoT revive). **Do not** invent `dev-fe` dual Nest admin panels. **Do not** invent ba-process AC pack. **Do not** reopen CNS GWC as FAIL. Peer *pack structure* = SI FE-ADMIN NOTES `R-PLT-SI-FE-ADMIN-01` + ATT/EMP FE-ADMIN NOTES — **PAY AS-IS inventory matches SI LIVE class** (not ATT ABSENT). Unlock PAY FE-ADMIN polish **only** if sponsor later explicitly opens «mở FE wave PAY FE-ADMIN polish / quản trị Thành phần lương» **or** a future audit finds a **named closable** mount/persist defect. OBS C&B idle-ok remains CONDITION NOTE — optional click-path only under sponsor, **not** default unlock. |
| **Benefits** | Honors peer FE-ADMIN HOLD pack class · matches U88 bandwidth · honesty / C-SLICE intact · no seal churn · FE-ADMIN already covers Nest SC CRUD · CNS SEAL RETAIN · Settings REF discipline RETAIN |
| **Costs** | Optional HDSD / UX polish for admin tab / C&B picker click-path remains deferred until sponsor; Condition KEEP on board (HOLD ≠ CLOSED) |
| **Risks** | Misread HOLD as «waive PAY admin forever» or as permission to invent second Nest admin «to complete admin» or to reopen CNS «while polishing admin» or to flip `payroll_e2e_ready` → mitigations **L-PAY-FE-ADMIN-*** |
| **Gate** | CNS GWC SEAL · DOCS ACCEPT · Nest SoT RETAIN · FE-ADMIN LIVE (no gap) · honesty false |

### Option B — UNLOCK narrow FE-ADMIN deepen (`dev-fe`) if closable mount/persist gap

| | |
|--|--|
| **Description** | Unlock `dev-fe` **only if** READ-ONLY audit proves a **named closable** FE-ADMIN defect: Payroll tab **not mounted**, `SalaryComponentsTab` **missing**, or create/update/delete **unwired** / persist fail class. Optionally narrow polish for OBS C&B picker **only** when sponsor names click-path UF. |
| **Benefits** | Would close a true product admin hole if one existed; would close OBS C&B browser UF if sponsor prioritizes. |
| **Costs** | On AS-IS audit: tab **mounted**, panel **LIVE**, CRUD **wired**, CNS admin CREATE **201 LIVE**, consumer KEY **422 LIVE**. Unlocking now invents polish / dual work **without gap** — same risk as invent ATT Nest admin without sponsor. Treating OBS idle-ok as unlock forces bandwidth without mount/persist defect. |
| **Risks** | Scope creep · reopen CNS as FAIL «while wiring admin» · flip payroll ready · duplicate BA seat · confuse Settings REF with Nest admin. |
| **Gate** | **Reject as default** — audit finds **no** closable mount/persist gap. Retain B only if future audit/sponsor names an explicit gap or sponsor opens C&B click-path polish. |

### Option C — REJECT invent Nest dual PAY admin / invent LVRULE unlock / reopen CNS as FAIL / flip printable / reopen EMP-CF·FE-ADMIN HOLDs

| | |
|--|--|
| **Description** | Invent second Nest PAY admin CRUD surface (e.g. Settings dual master) as mandatory continuous Task; invent LVRULE 01g unlock; reopen CNS GWC as FAIL; reopen EMP-CF / EMP / SI / ATT FE-ADMIN HOLD as unlock; flip `payroll_e2e_ready` / printable / personnel / claim module PAY UAT / Phase1 / seed / formula LIVE. |
| **Benefits** | None for GĐ1 honesty. |
| **Costs** | Seal churn · sponsor trust · C-SLICE violation · dual admin path confusion · Settings vs Nest SoT regression (O4 class). |
| **Risks** | **REJECT** — all DENY lines in §1.3. |

---

## 3. Trade-off matrix

| Criteria | Weight | **A ACCEPT HOLD P2** | B Unlock FE-ADMIN gap | C Invent/reopen/flip |
|----------|-------:|---------------------:|----------------------:|---------------------:|
| Honesty / DENY invent Nest dual PAY admin | 5 | **5** | 2 | 0 |
| Seal safety (CNS GWC · DOCS · PAY-CATALOG · EMP-CF/SI/ATT HOLD · LVRULE) | 5 | **5** | 3 | 0 |
| Match peer FE-ADMIN NOTES pack class (SI LIVE twin) | 5 | **5** | 1 | 0 |
| Business value (close true mount/persist gap) | 3 | 2 | **4** *(if gap)* / 1 *(no gap)* | 1 |
| U88 continuous bandwidth | 4 | **5** | 1 | 0 |
| Complexity / blast radius | 4 | **5** | 2 | 0 |
| Maintainability (Nest SoT + LIVE Payroll admin + Settings REF) | 4 | **5** | 2 | 0 |
| **Weighted** | | **128** | ≤52 | 3 |

*(Weighted = Σ weight×score; A dominates when audit shows no gap.)*

---

## 4. Failure modes and mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| **A** | HOLD misread as AC waive / PAY admin «N/A forever without stamp» | Evidence claims PAY FE-ADMIN waived | Stamp **ACCEPT_AS_IS_P2 HOLD** · AC RETAIN deferred · Condition KEEP on board |
| **A** | Silent invent second Nest PAY admin «to finish admin» (Settings dual) | Diff Settings dual CRUD / duplicate panels | **FORBIDDEN** · L-PAY-FE-ADMIN-03 Nest dual DENY · Settings REF RETAIN |
| **A** | Reopen CNS GWC as FAIL under «admin polish» | Diff CNS evidence / stamp reopen | Cite `PAYCNSQA-MSJ6E3QM` SEAL · DENY |
| **A** | Invent LVRULE 01g / reopen EMP-CF·FE-ADMIN HOLDs as unlock / flip printable | Diff LeaveTab / EMP-CF / ATT admin / CTR print | DENY · peers HOLD RETAIN · printable false |
| **A** | Mis-equate PAY LIVE admin with ATT ABSENT admin → dispatch invent FE | Bus invents PAY admin Task citing ATT ABSENT | Cite §1.1 discrimination · PAY LIVE ≠ ATT ABSENT (SI-class) |
| **A** | Treat OBS C&B idle-ok as closable FE-ADMIN gap | Bus DISPATCHED `dev-fe` from OBS alone | L-PAY-FE-ADMIN-13 · OBS ≠ mount/persist gap |
| **A** | Flip `payroll_e2e_ready` because CNS GWC | Honesty matrix | DENY · C-SLICE · AC-PLT-PAY-01H RETAIN |
| B | Unlock without mount/persist gap | Bus DISPATCHED `dev-fe` PAY FE-ADMIN without gap evidence | Prefer A; B only gap-or-sponsor |
| C | Ready flip / Nest invent / CNS reopen as FAIL | Honesty matrix / seals | DENY · NO-GO process |

---

## 5. Decision

| | |
|--|--|
| **Selected** | **Option A** — architecture **LOCKED** |
| **Seat verdict** | **CONFIRMED** |
| **Disposition** | **ACCEPT_AS_IS_P2 HOLD** on **`R-PLT-PAY-FE-ADMIN-01`** (pack includes `R-PLT-PAY-SC-FE-ADMIN` + `R-PLT-PAY-SETTINGS-CB-REF`) |
| **Why A** | CNS GWC SEAL (`PAYCNSQA-MSJ6E3QM`); Nest is SoT (Option B catalog); Network/browser admin CREATE **LIVE**; Payroll FE-ADMIN panel **LIVE** (mount + create/update/delete persist) — audit finds **no closable FE-ADMIN mount/persist gap**. OBS C&B idle-ok ≠ gap. Residual = NOTE pack peer SI FE-ADMIN HOLD *structure + LIVE inventory*, not ATT ABSENT invent. Option B unlock **not** gap-evidenced. Option C DENY. |
| **Rejected** | **B** as default unlock · **C** invent Nest dual / reopen CNS as FAIL / flip / reopen HOLDs |
| **Assumptions** | Sponsor has **not** opened PAY FE-ADMIN polish wave in this message; SI/ATT/EMP/EMP-CF FE-ADMIN HOLD remain HOLD; LVRULE 01g remains HOLD; honesty flags remain false; CNS GWC remains ACCEPT. |
| **residual** | **`R-PLT-PAY-FE-ADMIN-01` = HOLD** (not UNLOCK) |
| **next_owner** | **pm** (not `dev-fe`) |

### 5.1 Unlock gates (what Option A does **not** open)

| Question | Answer |
|----------|--------|
| Unlock ba-process new AC pack? | **HOLD** — PAY-CATALOG BA-01 already locked · **no** duplicate BA seat for admin invent |
| Unlock ba-data / new Nest tables? | **FORBIDDEN** — `salary_components` already LIVE (Option B) · no schema change · no second catalog |
| Unlock PAY FE-ADMIN mandatory `dev-fe`? | **HOLD** — audit shows LIVE mount+persist · no closable gap |
| Unlock / reopen CNS GWC as FAIL? | **FORBIDDEN** |
| Unlock OBS C&B click-path as mandatory? | **HOLD** — idle-ok CONDITION · sponsor-gated only |
| Unlock LVRULE 01g / reopen EMP-CF·SI·ATT·EMP FE-ADMIN HOLD as unlock? | **FORBIDDEN** |
| May PM flip `payroll_e2e_ready` / printable / personnel / claim module PAY UAT? | **NO** |
| May PM remove Condition from board as CLOSED? | **NO** — keep **HOLD P2** stamp · ACCEPT_AS_IS ≠ CLOSED Condition · ≠ WAIVED |

### 5.2 When sponsor later opens PAY FE-ADMIN polish wave (narrow alternate — not default)

```text
entry: sponsor message contains explicit «mở FE wave PAY FE-ADMIN polish / quản trị Thành phần lương»
   OR future READ-ONLY audit cites named closable mount/persist gap with path+symptom
   OR sponsor explicitly opens «OBS C&B picker click-path UF» (narrow — not mount invent)
retain: PAYCNSQA-MSJ6E3QM CNS GWC SEAL · DOCS SRS v0.25 / HDSD CH09 ACCEPT
       · PAY-CATALOG QC · Nest Option B SoT · SI/ATT/EMP/EMP-CF FE-ADMIN HOLD · LVRULE HOLD · honesty false
scope_allowed:
  1) optional ba-process ADD-only UF inventory for Payroll SalaryComponentsTab polish — NOT redefine Nest Option B schema
  2) dev-fe: narrow polish on SalaryComponentsTab / C&B consumer click-path ONLY (already LIVE admin)
scope_FORBIDDEN:
  - new Nest tables / schema change (salary_components already SoT)
  - Settings extension as sole picker SoT revive (Option A REJECT forever)
  - reopen CNS GWC as FAIL · reopen CNS-BE/FE as FAIL
  - invent LVRULE 01g · reopen EMP-CF/SI/ATT/EMP FE-ADMIN HOLD as unlock · flip printable/payroll ready
  - formula LIVE · module PAY UAT / Phase1 / seed
exit: R-PLT-PAY-*-FE-ADMIN may CLOSE; R-PLT-PAY-FE-ADMIN-01 pack may narrow; honesty false RETAIN · C-SLICE
```

### 5.3 Architecture boundary diagram (text)

```text
  Nest public.salary_components L1 + PAY-CATALOG QC     --> SEALED RETAIN
  F-PLT-PAY-COMP-01 list (picker SoT)                   --> LIVE Nest
  F-PLT-PAY-COMP-02 admin CREATE open N+1               --> LIVE (browser 201 CNS)
  CNS consumer invent KEY HRM-SC-COMP-KEY               --> SEAL ACCEPT (PAYCNSQA-MSJ6E3QM)
  CNS-FE Nest picker rebind                             --> READY absorbed · RETAIN
  DOCS SRS v0.25 / HDSD CH09                            --> ACCEPT RETAIN

  PAY Nest admin FE Payroll tab
       SalaryComponentsTab + create/update/delete       --> LIVE (no mount/persist gap) · NOTE HOLD

  Settings salary_components / payroll_components
       SettingsCatalogsTab / CatalogSearchPicker alias  --> REF only · ≠ sole SoT · NOTE HOLD

  R-PLT-PAY-FE-ADMIN-01 (pack of the 2 NOTE rows)       --> ACCEPT_AS_IS_P2 HOLD
  SI/ATT/EMP/EMP-CF FE-ADMIN / LVRULE / CTR FE          --> HOLD RETAIN (FORBIDDEN reopen-as-unlock)
  payroll_e2e_ready / printable / personnel             --> false RETAIN · C-SLICE

  DISCRIMINATION: ATT FE-ADMIN ABSENT ≠ PAY FE-ADMIN LIVE (SI-class)
  both packs end HOLD — different inventory reasons
```

---

## 6. Locks (L-PAY-FE-ADMIN-*)

| Lock | Rule |
|------|------|
| **L-PAY-FE-ADMIN-01 HOLD ≠ WAIVE** | ACCEPT_AS_IS_P2 **does not** delete AC-PLT-PAY-01* / AC-PAY-COMP-01 · admin polish AC remains deferred FAIL-if-claimed until sponsor wave |
| **L-PAY-FE-ADMIN-02 CNS SEAL frozen** | `PAYCNSQA-MSJ6E3QM` · CNS-QC-01 GWC · CNS-BE/FE READY **FORBIDDEN reopen as FAIL** |
| **L-PAY-FE-ADMIN-03 Nest dual DENY** | No invent second Nest PAY admin CRUD FE / Settings dual-master without sponsor polish wave / named gap |
| **L-PAY-FE-ADMIN-04 Settings ≠ sole SoT** | Extension `salary_components` / `payroll_components` remain **REF** — Option A picker SoT **REJECT RETAIN** (O4) |
| **L-PAY-FE-ADMIN-05 Printable / personnel / payroll ready frozen** | DENY flip `contracts_printable_ready` · `hrm_personnel_uat_ready` · `payroll_e2e_ready` · formula LIVE |
| **L-PAY-FE-ADMIN-06 Peer HOLD RETAIN** | DENY reopen SI/ATT/EMP FE-ADMIN HOLD · EMP-CF FE HOLD **as unlock** |
| **L-PAY-FE-ADMIN-07 LVRULE HOLD** | DENY invent LVRULE 01g unlock |
| **L-PAY-FE-ADMIN-08 Honesty** | DENY flip ready flags · C-SLICE RETAIN · DENY module PAY UAT |
| **L-PAY-FE-ADMIN-09 Condition KEEP** | ACCEPT_AS_IS ≠ CLOSED ≠ WAIVED — keep HOLD P2 on board |
| **L-PAY-FE-ADMIN-10 LIVE ≠ ABSENT** | PAY Payroll admin LIVE must not be narrated as ATT-style ABSENT invent trigger |
| **L-PAY-FE-ADMIN-11 Nest SoT RETAIN** | Nest `salary_components` remain Option B SoT — Settings MD REF only · no Settings-sole SoT revert |
| **L-PAY-FE-ADMIN-12 Admin ≠ consumer** | L-PAY-AC-01 RETAIN — invent KEY applies to consumers · admin open N+1 RETAIN |
| **L-PAY-FE-ADMIN-13 OBS ≠ gap** | OBS C&B picker idle-ok **≠** closable FE-ADMIN mount/persist gap · not default unlock |
| **L-PAY-FE-ADMIN-14 Path lock** | UTF-8 no BOM on NFD `.git`+`apps` True tree |
| **L-PAY-FE-ADMIN-15 DOCS RETAIN** | SRS v0.25 · HDSD CH09 ACCEPT — no wipe client wording |

---

## 7. Impacted systems & non-goals

| In scope (docs disposition) | OUT / FORBIDDEN |
|-----------------------------|-----------------|
| Board residual `R-PLT-PAY-FE-ADMIN-01` ACCEPT_AS_IS_P2 HOLD | `apps/**` edits · migration · seed |
| Option A/B/C + LOCKED A · next_dispatch PM | Invent Nest PAY dual admin CRUD FE |
| Cite peer SI/ATT/EMP FE-ADMIN HOLD pack class | Reopen CNS GWC as FAIL |
| Consolidate FE-ADMIN + Settings REF NOTES into pack | Invent LVRULE 01g · reopen EMP-CF HOLD as unlock · flip printable |
| U88 PM continue next vertical/governance | Flip payroll ready · formula LIVE · module PAY UAT · Phase1 DONE |
| Nest SC SoT + LIVE Payroll admin RETAIN | Revive Settings as sole picker SoT |

---

## 8. Validation / acceptance evidence plan

| Checkpoint | PASS when |
|------------|-----------|
| Spec ≥8KB on NFD `.git` toplevel | This file Length verified (≥8192; target peer ≥25KB) |
| Status | **CONFIRMED** · Option **A** **LOCKED** |
| Residual | `R-PLT-PAY-FE-ADMIN-01` minted · **HOLD** P2 (not CLOSED · not WAIVED · not UNLOCK) |
| next_dispatch | ACCEPT HOLD seal to **pm** — **not** invent ba-process/FE Nest dual · **not** `dev-fe` |
| Honesty | ready=false · C-SLICE · DENY Nest dual invent · DENY CNS reopen as FAIL · DENY LVRULE invent · DENY flip printable/payroll |
| Peer seals | CNS GWC · DOCS · PAY-CATALOG · SI/ATT/EMP/EMP-CF FE-ADMIN HOLD · LVRULE HOLD RETAIN |
| Audit | Mount LIVE + persist LIVE cited — no closable gap used to force Option B |

---

## 9. Peer seal RETAIN checklist (FORBIDDEN reopen)

| Seal / HOLD | Stamp / id | Action |
|-------------|------------|--------|
| PAY CNS invent KEY / admin open | `PAYCNSQA-MSJ6E3QM` · CNS-QC-01 GWC | RETAIN · DENY reopen as FAIL |
| PAY CNS-BE VAL | jest 54 · CNS-BE-01 | RETAIN |
| PAY CNS-FE picker | vitest READY · QA absorbs | RETAIN |
| PAY DOCS | SRS v0.25 · HDSD CH09 ACCEPT | RETAIN |
| PAY-CATALOG QC prior | GWC SEAL | RETAIN |
| SI FE-ADMIN | `R-PLT-SI-FE-ADMIN-01` HOLD (SPEC 40113) | RETAIN · twin LIVE class |
| ATT FE-ADMIN | `R-PLT-ATT-FE-ADMIN-01` HOLD (SPEC 31734) | RETAIN · DENY reopen-as-unlock |
| EMP FE-ADMIN | `R-PLT-EMP-FE-ADMIN-01` HOLD | RETAIN · twin class |
| EMP-CF FE | `R-PLT-EMP-CF-FE-01` HOLD (SPEC 38846) | RETAIN · DENY reopen-as-unlock |
| LVRULE 01g | ACCEPT_AS_IS_P2 HOLD | RETAIN · DENY invent unlock |
| CTR-TEMPLATE FE | HOLD · printable not flipped | RETAIN |
| EMP consumer FE | STATUS/POS/DEPT CLOSED stamps | RETAIN |
| ATT consumer FE | CODE/OT/COMP CLOSED stamps | RETAIN |
| SI consumer FE | SIINS/SIINR CLOSED stamps | RETAIN |

---

## 10. completion_report

**Closed:** SA Option/F.1 for PAY **FE-ADMIN notes pack** after salary_components CNS wave — READ-ONLY apps/web audit shows Payroll `SalaryComponentsTab` **mounted**, `useSalaryComponents` create/update/delete **LIVE**, `hrmApi` Nest SC CRUD clients **LIVE** (contrast ATT GET-only ABSENT admin; match SI LIVE class); CNS GWC stamp **`PAYCNSQA-MSJ6E3QM`** SEAL ACCEPT; DOCS SRS v0.25 / HDSD CH09 ACCEPT; Settings extension REF ≠ sole SoT; board audit shows **no** open closable CNS FAIL residual and **no** closable FE-ADMIN mount/persist gap (OBS C&B idle-ok ≠ gap); class = FE-ADMIN NOTES pack after LIVE admin + CNS SEAL (peer SI FE-ADMIN HOLD *structure + LIVE inventory*); Option **A/B/C** evaluated; **Option A LOCKED ACCEPT_AS_IS_P2 HOLD**; mint **`R-PLT-PAY-FE-ADMIN-01`** (packs SC FE-ADMIN + Settings C&B REF); residual **HOLD** (not UNLOCK); ba-process/FE **HOLD**; DENY invent Nest dual · invent LVRULE · reopen CNS as FAIL · reopen EMP-CF/SI/ATT/EMP FE-ADMIN HOLD as unlock · flip printable/payroll ready · formula LIVE; honesty false · C-SLICE · docs-only · no `apps/**`.

**Open / residual:** Condition **`R-PLT-PAY-FE-ADMIN-01`** remains **HOLD P2** on W8 board until sponsor opens PAY FE-ADMIN polish wave (or future named mount/persist gap); OBS C&B idle-ok remains CONDITION NOTE; ready flags false.

**next_owner:** **pm**

**ack_status:** **PASS_TO_PM** · **CONFIRMED** · Option **A** **LOCKED**

**evidence_path:** `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-FE-ADMIN-NOTES-SA-01.md`

### next_dispatch_prompt (copy-ready — U88 next peer)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-FE-ADMIN-NOTES-SA-01
from_role: sa
to_role: pm
lane: governance · U88
ack_status: PASS_TO_PM
verdict: Option A LOCKED — ACCEPT_AS_IS_P2 HOLD on R-PLT-PAY-FE-ADMIN-01
selected_option: A
residual: R-PLT-PAY-FE-ADMIN-01 = HOLD (not UNLOCK)
action:
  1) Seal board residual R-PLT-PAY-FE-ADMIN-01 = ACCEPT_AS_IS_P2 HOLD (Condition KEEP — not CLOSED; not WAIVED; not UNLOCK to dev-fe)
     · pack includes R-PLT-PAY-SC-FE-ADMIN + R-PLT-PAY-SETTINGS-CB-REF
     · AS-IS: Payroll Nest admin LIVE (SalaryComponentsTab mount+persist) — no closable FE-ADMIN gap
     · Settings salary_components extension = REF only (DENY sole SoT revive)
  2) DENY invent ba-process / Nest dual PAY admin FE / new salary_components tables Tasks from this residual
  3) RETAIN: PAYCNSQA-MSJ6E3QM CNS GWC · CNS-BE/FE READY · DOCS SRS v0.25 / HDSD CH09 ACCEPT
     · PAY-CATALOG QC SEAL · Nest Option B SoT
     · SI FE-ADMIN HOLD R-PLT-SI-FE-ADMIN-01 · ATT FE-ADMIN HOLD R-PLT-ATT-FE-ADMIN-01
     · EMP FE-ADMIN HOLD R-PLT-EMP-FE-ADMIN-01 · EMP-CF FE HOLD R-PLT-EMP-CF-FE-01
     · LVRULE 01g HOLD · OBS C&B idle-ok NOTE · honesty false · C-SLICE
  4) Continue U88 next vertical/governance peer per continuous board
     — DENY invent LVRULE unlock · DENY reopen CNS as FAIL
     — DENY reopen EMP-CF/SI/ATT/EMP FE-ADMIN HOLD as unlock
     — DENY flip payroll_e2e_ready / contracts_printable_ready / hrm_personnel_uat_ready · DENY formula LIVE
sponsor_gated_reopen_only: explicit «mở FE wave PAY FE-ADMIN polish / quản trị Thành phần lương»
  OR future audit cites named closable mount/persist gap
  OR sponsor opens «OBS C&B picker click-path UF» narrow
  → then narrow polish on existing SalaryComponentsTab / C&B picker ONLY (Nest Option B schema RETAIN · no new tables · no CNS reopen as FAIL · Settings ≠ sole SoT)
evidence: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-FE-ADMIN-NOTES-SA-01.md
```

**DENY alternate:** invent Nest PAY dual admin CRUD FE · invent LVRULE 01g · reopen CNS GWC as FAIL · reopen EMP-CF/SI/ATT/EMP FE-ADMIN HOLD as unlock · flip `payroll_e2e_ready` · flip printable/personnel · claim module PAY UAT / Phase1 DONE · formula LIVE · seed · apps/** · next_owner=dev-fe without gap.

---

## 11. F.1 API / DB disposition notes (governance — no physical unlock)

| Layer | Disposition |
|-------|-------------|
| **DB** | No ADD table · Nest `public.salary_components` remain **LIVE SoT (Option B)** — this seat does **not** open ba-data · no schema change · no second catalog |
| **API** | No new Nest admin CRUD routes required; F-PLT-PAY-COMP-01..04 already proven (PAY-CATALOG + CNS admin CREATE + consumer KEY) — RETAIN; FE clients create/update/delete RETAIN |
| **FE consumer** | CNS SEAL RETAIN — **out of scope reopen** (`useSalaryComponentsEffective` · EmployeeCompensationPanel · SalaryTemplatesTab · PaySheetTemplateSettingsPanel · PayFormulaAuthorPanel soft) |
| **FE admin** | Payroll Nest SC admin **LIVE RETAIN** — **HOLD** polish / dual invent |
| **Settings REF** | Extension keys REF/alias RETAIN — **FORBIDDEN** sole picker SoT |
| **F.1 completeness** | Disposition complete for residual class; physical F.1 for PAY FE-ADMIN polish deferred until sponsor wave or named gap (optional BA ADD click-path only) |

### 11.1 F.1 surface map (admin ≠ consumer)

| Surface id | Role | SoT | Status this seat |
|------------|------|-----|------------------|
| S-PAY-ADM-01 | Payroll tab Thành phần lương | Nest `salary_components` via F-PLT-PAY-COMP-02/03/04 | LIVE admin · NOTE HOLD |
| S-PAY-CNS-01 | Pay sheet template lines | Nest EFF / F-PLT-PAY-COMP-01 | CNS SEAL RETAIN |
| S-PAY-CNS-02 | Period / batch packs | Nest codes | CNS SEAL RETAIN |
| S-PAY-CNS-03 | Employee compensation lines | Nest EFF | CNS SEAL · OBS idle-ok NOTE |
| S-PAY-CNS-04 | Compensation history lines | Nest | CNS SEAL RETAIN |
| S-PAY-CNS-05 | Formula author soft refs | Nest soft · formula LIVE DENIED | RETAIN |
| S-PAY-REF-01 | Settings extension salary_components | REF merge-read only | NOTE HOLD · ≠ sole SoT |
| S-PAY-REF-02 | Allowance PC→SC mirror | ADD writer into Nest | peer RETAIN · not wipe |

### 11.2 Capability pointer (cite — do not duplicate API-01)

| Cap | Path / rule | This seat |
|-----|-------------|-----------|
| List picker SoT | F-PLT-PAY-COMP-01 `GET /api/hrm/payroll/salary-components` | RETAIN · CNS |
| Admin create open | F-PLT-PAY-COMP-02 — N+1 slug OK | RETAIN · LIVE FE admin |
| Consumer assert | `HRM-SC-COMP-KEY` when Nest >0 | RETAIN · CNS SEAL |
| Nature REF | `pay_types` | dual SoT layer 2 RETAIN |
| Formula | staged · not LIVE | DENY invent LIVE |

---

## 12. References

| Artifact | Role |
|----------|------|
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md` | Option B Nest SoT LOCKED · L-PAY-AC-* |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md` | AC-PLT-PAY-01* · admin≠consumer · surface inventory |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-FE-ADMIN-NOTES-SA-01.md` | Twin ACCEPT_AS_IS_P2 HOLD pack LIVE admin (`R-PLT-SI-FE-ADMIN-01` · SPEC 40113) |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01.md` | Twin ACCEPT_AS_IS_P2 HOLD pack ABSENT admin (`R-PLT-ATT-FE-ADMIN-01` · SPEC 31734) |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-ADMIN-NOTES-SA-01.md` | Twin ACCEPT_AS_IS_P2 HOLD pack (`R-PLT-EMP-FE-ADMIN-01`) |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-FE-SA-01.md` | Prior U88 Option B HOLD (`R-PLT-EMP-CF-FE-01` · SPEC 38846) |
| `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` | Continuous board · PAY-CATALOG rows · PAY FE-ADMIN NOTES row |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-cns-qc-01.md` | CNS GWC · `PAYCNSQA-MSJ6E3QM` · OBS C&B idle-ok |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-docs-01.md` | DOCS ACCEPT SRS v0.25 · HDSD CH09 |
| `apps/web/hrm/src/pages/Payroll.tsx` | READ-ONLY: SalaryComponentsTab mount |
| `apps/web/hrm/src/components/payroll/SalaryComponentsTab.tsx` | READ-ONLY: LIVE admin CRUD |
| `apps/web/hrm/src/hooks/useSalaryComponents.ts` | READ-ONLY: persist client |
| `apps/web/hrm/src/integrations/hrmApi.ts` §5190–5256 | READ-ONLY: list + create/update/delete |
| `apps/web/hrm/src/hooks/useSalaryComponentsEffective.ts` | READ-ONLY: consumer EFF |
| `apps/web/hrm/src/components/settings/SettingsCatalogsTab.tsx` | READ-ONLY: Settings REF surface |
| `.cursor/templates/ADR_OPTION_TEMPLATE.md` | Option evaluation structure |

---

## 13. Expanded rationale (audit trail for PM / QC)

### 13.1 Why this is not CNS UNLOCK / reopen class

PAY-CATALOG-CNS shipped **consumer assert** (BE KEY + FE Nest picker rebind) and **admin open N+1** browser UF. Those Conditions were executed by `dev-be` / `dev-fe` / `qa` / `qc` and SEALED at CNS-QC-01 GWC with stamp `PAYCNSQA-MSJ6E3QM`. DOCS ACCEPT followed. This seat owns **only** the remaining **FE-ADMIN notes pack** class. Treating FE-ADMIN as another mandatory `dev-fe` wave without a mount/persist gap would violate DENY invent lines and risk narrating CNS GWC as FAIL «while polishing».

### 13.2 Why PAY FE-ADMIN LIVE still ends HOLD (not CLOSED Condition)

FE-ADMIN panel being LIVE does **not** auto-CLOSE the board residual. Per SI/ATT/EMP FE-ADMIN NOTES peers, the pack residual is stamped **ACCEPT_AS_IS_P2 HOLD** as a durable U88 NOTE: Condition KEEP · not WAIVED · not CLOSED. LIVE inventory means **do not unlock invent** — it does **not** mean «remove residual and claim module PAY admin UAT». Honesty / C-SLICE remain false. `payroll_e2e_ready` remains **false**.

### 13.3 Why PAY LIVE ≠ ATT ABSENT (same HOLD outcome, different reason) — SI twin

| | ATT FE-ADMIN NOTES | PAY FE-ADMIN NOTES (this seat) | SI FE-ADMIN NOTES |
|--|--------------------|--------------------------------|-------------------|
| Admin panel component | ABSENT | LIVE (`SalaryComponentsTab`) | LIVE (`Si*SettingsPanel`) |
| Admin CRUD client | ABSENT (GET effective only) | LIVE create/update/delete | LIVE upsert/retire |
| Product mount | ABSENT | LIVE Payroll tab | LIVE Settings tabs |
| Why HOLD | Optional Nest admin invent deferred to sponsor | No closable gap · polish deferred · NOTE pack | No closable gap · polish deferred · NOTE pack |
| Unlock default? | No (sponsor FE-ADMIN wave) | No (no gap · sponsor polish only) | No |
| next_owner | pm | **pm** | pm |

PM must **not** copy ATT «ABSENT → invent admin FE later» narrative onto PAY as an automatic `dev-fe` Task. PAY already has the admin FE ATT lacks (SI-class).

### 13.4 Why Nest SoT (not Settings-MD sole) shapes this pack

PAY-CATALOG chose **Option B = Nest `salary_components` as code SoT**. Settings extension remains REF/alias (Option A REJECT · O4). FE-ADMIN Payroll panel is **Nest-backed** CRUD (not a Settings-MD-only SoT). Therefore there is **no** Settings-gap unlock, and **no** ATT-style «admin ABSENT» invent. The residual is a consolidation NOTE after CNS SEAL. Pack explicitly includes Settings REF row so PM does not misread «Settings C&B» as missing Nest admin.

### 13.5 OBS C&B picker idle-ok — why not Option B

CNS-QC stamped **OBS-FE-CB-PICKER** as CONDITION idle-ok P2: BE invent KEY proven; EmployeeCompensationPanel picker not opened in that browser session. That is an **evidence coverage note**, not a missing `SalaryComponentsTab` mount or unwired create/update/delete. Using OBS alone to unlock `dev-fe` would invent a mandatory click-path wave without sponsor and without FE-ADMIN mount/persist gap — **DENY as default** (L-PAY-FE-ADMIN-13). Sponsor may later open narrow C&B click-path UF under §5.2.

### 13.6 Honesty / C-SLICE statement

Closing CNS Conditions and stamping FE-ADMIN HOLD **must not** flip:

- `payroll_e2e_ready`
- `contracts_printable_ready`
- `hrm_personnel_uat_ready`

Nor claim formula LIVE, module PAY UAT, Phase1 DONE, or UF 🟢 for whole PAY. **`C-SLICE-≠-MODULE`** remains true: many GWC slices ≠ module GO.

### 13.7 U88 continuity after this seat

PM should:

1. Seal `R-PLT-PAY-FE-ADMIN-01` HOLD on W8 board.
2. **Not** dispatch `dev-fe` / ba-process for PAY FE-ADMIN invent (HOLD · no gap).
3. Continue next vertical / governance peer without inventing LVRULE unlock, reopening CNS as FAIL, reopening EMP-CF/SI/ATT/EMP FE-ADMIN HOLD as unlock, or flipping payroll/printable/personnel.
4. Keep peer FE-ADMIN HOLDs RETAIN — **do not** reopen-as-unlock.

### 13.8 Seal citation block (mission seals)

| Seal | Role |
|------|------|
| `PAYCNSQA-MSJ6E3QM` | PAY CNS QA-01 invent KEY + admin open · QC-01 GWC SEAL ACCEPT |
| CNS-FE-01 READY | Nest picker rebind vitest · absorbed by QA-01 |
| DOCS ACCEPT | SRS v0.25 FR-UC-BP-PAY-02 · HDSD CH09 |
| `R-PLT-EMP-CF-FE-01` | Prior U88 EMP-CF FE Option B HOLD · SPEC 38846 — DENY reopen as unlock |
| `R-PLT-SI-FE-ADMIN-01` | Peer LIVE FE-ADMIN HOLD pack · SPEC 40113 |

### 13.9 W8 board PAY rows (context — disposition only)

| Board row | Role status (AS-IS) | This seat effect |
|-----------|---------------------|------------------|
| PAY-CATALOG SA→BA→API→BE→QA→QC | CONFIRMED / GWC | RETAIN |
| PAY-CATALOG CNS-BE→FE→QA→QC | READY / PASS / GWC `PAYCNSQA-MSJ6E3QM` | RETAIN · FORBIDDEN reopen as FAIL |
| PAY-CATALOG DOCS-01 | ACCEPT SRS v0.25 · HDSD CH09 | RETAIN |
| PAY-FE-ADMIN-NOTES-SA-01 | DISPATCHED → this CONFIRMED A HOLD | Mint `R-PLT-PAY-FE-ADMIN-01` HOLD |

---

## 14. Residual ID registry (mint)

| ID | Severity | Status after this seat | Owner next |
|----|----------|------------------------|------------|
| **R-PLT-PAY-FE-ADMIN-01** | P2 | **ACCEPT_AS_IS_P2 HOLD** (KEEP Condition) | pm (board seal) |
| R-PLT-PAY-SC-FE-ADMIN | P2 | **HOLD ⊆ pack** (not CLOSED) · LIVE admin NOTE | sponsor-gated polish / named gap only |
| R-PLT-PAY-SETTINGS-CB-REF | P2 | **HOLD ⊆ pack** · Settings REF NOTE · DENY sole SoT | sponsor-gated docs/UX only |
| OBS-FE-CB-PICKER | P2 | **CONDITION idle-ok RETAIN** · ≠ mount gap | sponsor-gated click-path only |
| CNS invent KEY / admin open | — | **SEAL ACCEPT** RETAIN (`PAYCNSQA-MSJ6E3QM`) | — |

---

## 15. RETAIN list (must_keep for next owners)

1. Nest `salary_components` Option B SoT LIVE + F-PLT-PAY-COMP-01..04
2. Payroll FE-ADMIN `SalaryComponentsTab` LIVE (mount + create/update/delete) — do not invent dual
3. CNS GWC stamp `PAYCNSQA-MSJ6E3QM` · CNS-BE/FE READY — DENY reopen as FAIL
4. DOCS SRS v0.25 · HDSD CH09 ACCEPT
5. Settings extension REF ≠ sole picker SoT (O4 / Option A REJECT)
6. SI FE-ADMIN HOLD `R-PLT-SI-FE-ADMIN-01` · ATT FE-ADMIN HOLD `R-PLT-ATT-FE-ADMIN-01` · EMP FE-ADMIN HOLD · EMP-CF FE HOLD `R-PLT-EMP-CF-FE-01`
7. LVRULE 01g ACCEPT_AS_IS_P2 HOLD
8. `payroll_e2e_ready=false` · formula LIVE DENIED · printable/personnel false
9. U65 zero-seed · `C-SLICE-≠-MODULE` · no module PAY UAT claim
10. Admin ≠ consumer (L-PAY-AC-01) · open N+1 admin ≠ invent KEY consumer
11. OBS C&B idle-ok NOTE ≠ FE-ADMIN gap
12. Path lock NFD WriteAllText UTF-8 no BOM

---

## 16. Option evaluation appendix (template §§1–7 coverage map)

| Template § | This document |
|------------|---------------|
| §1 Decision Context | Header table + §1 |
| §2 Problem to Solve | §1.1–1.4 |
| §3 Options A/B/C | §2 |
| §4 Trade-off Matrix | §3 |
| §5 Failure Modes | §4 |
| §6 Decision | §5 |
| §7 Implementation / Validation | §5.2 · §7 · §8 · §10 · §11 |
| F.1 notes | §11 + §11.1 + §11.2 |

---

## 17. QA/QC evidence pointers (read-only cite)

| Evidence | Stamp / verdict | Use |
|----------|-----------------|-----|
| `docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-cns-qc-01.md` | GWC · `PAYCNSQA-MSJ6E3QM` · OBS idle-ok | CNS SEAL RETAIN |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-cns-qa-01.md` | PASS invent KEY + admin open | SEAL cite |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-cns-fe-01.md` | READY vitest | absorbed RETAIN |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-cns-be-01.md` | jest 54 | VAL RETAIN |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-docs-01.md` | ACCEPT SRS v0.25 · HDSD CH09 | DOCS RETAIN |
| SI FE-ADMIN NOTES SPEC | Length 40113 · Option A HOLD | Peer LIVE depth COPY |
| ATT FE-ADMIN NOTES SPEC | Length 31734 · Option A HOLD | Peer ABSENT contrast |

---

## 18. Explicit non-claims (process honesty)

This seat **does not** claim:

- Module PAY UAT READY
- `payroll_e2e_ready=true`
- Formula LIVE / evaluator GO
- Module CTR printable READY / personnel UAT READY
- Phase 1 DONE
- UF 🟢 for whole payroll pillar
- FE-ADMIN Condition CLOSED (it is HOLD)
- Permission to reopen EMP-CF / SI / ATT / EMP FE-ADMIN HOLD as unlock
- Permission to invent LVRULE unlock
- Permission to reopen CNS GWC as FAIL
- Closable FE-ADMIN mount/persist gap (audit negative)
- OBS C&B idle-ok as mount/persist defect

---

## 19. Scope parity / U19 note (SA proactive)

List `GET /api/hrm/payroll/salary-components`, get-by-id, admin mutate, and consumer assert paths must continue to share **`resolveHrmListScope`** (L-PAY-AC-06 · CNS-BE scope_parity jest). This seat **does not** reopen scope work; any future polish wave must **retain** scope_parity tests. **No** J-* L2.5 promote from this disposition.

---

## 20. Program journey / honesty flags (U19)

| Flag / journey | State after this seat |
|----------------|----------------------|
| `payroll_e2e_ready` | **false** RETAIN |
| Formula LIVE | **DENIED** |
| J-HRM-07 FULL GWC | **not flipped** · RETAIN deferred |
| `C-SLICE-≠-MODULE` | **true** |
| printable / personnel | **false** RETAIN |
| Missing J-* for PAY FE-ADMIN polish | Documented as **sponsor-gated** — not architecture gap forcing unlock |

---

## 21. BA governance notes (for future sponsor wave only)

If sponsor opens §5.2 polish:

1. **ba-process** ADD-only UF inventory for `SalaryComponentsTab` polish — **do not** redefine Nest Option B / AC-PLT-PAY-01*.
2. Keep admin≠consumer split explicit in any new AC rows.
3. Settings REF remains non-SoT — any Settings UX polish must not revive Option A picker SoT.
4. OBS C&B click-path = separate narrow UF if named — not bundled as Nest dual invent.
5. QA evidence must remain U65 FE-only · no seed.

Until then: **ba-process HOLD** this residual.

---

## 22. Risk register (compressed)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| PM unlocks `dev-fe` without gap | Med | Med | Option A LOCK · next_owner pm · L-PAY-FE-ADMIN-03/10 |
| CNS narrated FAIL during polish talk | Low | High | L-PAY-FE-ADMIN-02 · seal checklist §9 |
| Settings sole SoT revive | Med | High | L-PAY-FE-ADMIN-04 · pack Settings REF row |
| payroll_e2e_ready flip | Med | High | L-PAY-FE-ADMIN-05/08 · §18 non-claims |
| ATT ABSENT narrative copied to PAY | Med | Med | §13.3 discrimination table |
| EMP-CF HOLD reopened as unlock | Low | High | L-PAY-FE-ADMIN-06 · mission DENY |

---

## 23. Write protocol verification block

| Check | Expected |
|-------|----------|
| Path | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-FE-ADMIN-NOTES-SA-01.md` |
| Encoding | UTF-8 **no BOM** via `[System.IO.File]::WriteAllText(..., UTF8Encoding($false))` |
| Tree | NFD `.git`+`apps` True (canonical) |
| Length | **MUST ≥ 8192** (peer target ≥25KB) |
| Lane | docs-only · **no** `apps/**` · **no** `packages/**` |

---

*End of SA Option/F.1 — PAY FE-ADMIN NOTES — Option A LOCKED ACCEPT_AS_IS_P2 HOLD · R-PLT-PAY-FE-ADMIN-01 = HOLD · PASS_TO_PM · next_owner pm · selected_option A*