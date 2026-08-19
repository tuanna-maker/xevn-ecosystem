# PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-ADMIN-NOTES-SA-01 — Option/F.1 — DEC FE-ADMIN notes pack residual

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-ADMIN-NOTES-SA-01` |
| **Parent** | DEC / QSĐ decision-types catalog · DEC-VERTICAL-SA-01 **CONFIRMED** Option B → DEC-DATA-01 **CONFIRMED** (`hr_decision_type`) → DEC-BE-01 **READY** → DEC-DEVOPS-01 **READY** `DECPLATDEVOPS-MSJ1K9XZ` → DEC-QA-01 **PASS** `DECPLATQA-MSJ1FB3D` 12/12 (L1 VAL-DEC-CAT/CNS) → DEC-QC-01 **GWC** L1-SEAL unlock FE → DEC-FE-01 **READY** closes wire `R-PLT-DEC-FE-01` → DEC-QA-02 **PASS** `DECPLATQA2-MSJ21R6Z` **21/21** · `R-PLT-DEC-FE-01` **CLOSED** → DEC-QC-02 **GWC** · `R-PLT-DEC-FE-01` CLOSED · L1 retain |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa · **docs-only** · **NO** `apps/**` |
| **change_mode** | **ADD** Option/F.1 disposition for consolidated DEC **FE-ADMIN notes** residual after decision-types catalog FE CLOSED · **no seed** (U65) · **no wipe** sealed peers · **no wipe** F-CORE-DEC / WH spine |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · **ACCEPT_AS_IS_P2 HOLD** forever-until-sponsor · ba-process **HOLD** (no new AC pack) · FE/BE **HOLD** · invent Nest dual DEC admin **DENY** · reopen DEC-QC-02 GWC as FAIL **DENY** · reopen `R-PLT-DEC-FE-01` CLOSED **DENY** |
| **residual_id** | **`R-PLT-DEC-FE-ADMIN-01`** *(minted this seat — consolidates Nest `hr_decision_type` Settings FE-ADMIN + starter/HRD REF + person-bound/WH flag display notes)* |
| **prior_fe** | DEC-FE-01 **READY** closes wire `R-PLT-DEC-FE-01` · DEC-QA-02 U65 browser Settings DEC + picker **PASS** `DECPLATQA2-MSJ21R6Z` **21/21** · DEC-QC-02 **GWC** · `R-PLT-DEC-FE-01` **CLOSED** — **FORBIDDEN reopen as FAIL** |
| **prior_l1** | DEC-QA-01 L1 VAL-DEC-CAT/CNS **PASS** `DECPLATQA-MSJ1FB3D` 12/12 · DEC-QC-01 GWC L1-SEAL — **RETAIN** |
| **prior_catalog** | DEC-VERTICAL SA Option **B** Nest SoT `hr_decision_type` · DEC-BA AC-PLT-DEC-01..06 · DEC-DATA physical · F-DEC-CAT-TYP/EFF · **SEAL RETAIN** |
| **peer_cite_hold** | [`REC-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-ADMIN-NOTES-SA-01.md) **Option A · `R-PLT-REC-FE-ADMIN-01`** (SPEC 55083) · [`PAY-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-FE-ADMIN-NOTES-SA-01.md) **Option A · `R-PLT-PAY-FE-ADMIN-01`** (SPEC 49325) · [`SI-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-FE-ADMIN-NOTES-SA-01.md) **Option A · `R-PLT-SI-FE-ADMIN-01`** (SPEC 40113) · [`ATT-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01.md) **Option A · `R-PLT-ATT-FE-ADMIN-01`** (SPEC 31734 · ABSENT class) · [`EMP-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-ADMIN-NOTES-SA-01.md) **Option A · `R-PLT-EMP-FE-ADMIN-01`** (SPEC 28353) — **cite class (twin pack)** |
| **peer_cite_consumer** | DEC picker / Decisions.tsx consumer assert **SEAL ACCEPT** (`DECPLATQA2-MSJ21R6Z` 21/21) · F-CORE-DEC-01/02 WH spine **must_keep** · → **≠** this residual class · **FORBIDDEN reopen DEC-QC-02 GWC** |
| **Honesty** | `hrm_personnel_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `payroll_e2e_ready=false` · `attendance_uat_ready=false` · `recruitment_uat_ready=false` · UC-HRM-27 product DONE **unchanged** · **`C-SLICE-≠-MODULE`** · U65 · **DENIED** module DEC/QSĐ UAT · Phase1 DONE · seed · flip printable/personnel/payroll/recruitment ready · invent Nest dual DEC admin · invent LVRULE · reopen PAY/SI/ATT/REC/EMP FE-ADMIN HOLDs as unlock · reopen DEC-QC-02 as FAIL · reopen `R-PLT-DEC-FE-01` CLOSED · cut F-CORE-DEC / WH spine |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option pack)

| | |
|--|--|
| **Decision title** | Disposition for DEC **FE-ADMIN notes pack** after `hr_decision_type` catalog wave (Nest SoT LIVE · Settings admin open N+1 proven · picker consumer + person-bound/WH flag proven) — ACCEPT_AS_IS HOLD vs unlock FE-ADMIN deepen vs invent Nest dual / reopen DEC FE |
| **Requestor** | pm · U88 continuous · after REC-FE-ADMIN-NOTES-SA-01 Option A HOLD sealed (`R-PLT-REC-FE-ADMIN-01` · SPEC 55083) · DEC-QC-02 GWC · `R-PLT-DEC-FE-01` CLOSED |
| **Decision owner** | sa |
| **Related** | Nest `public.hr_decision_type` SoT LIVE (Option B) · Settings `DecDecisionTypeSettingsPanel` FE-ADMIN LIVE · consumers (Decisions.tsx picker / person-bound gate / decisionListUi / useDecDecisionTypesEffective) SEAL · starter/HRD REF · F-CORE-DEC-01/02 WH spine must_keep · REC/PAY/SI/ATT/EMP FE-ADMIN HOLD peers · LVRULE 01g HOLD |
| **Template** | `.cursor/templates/ADR_OPTION_TEMPLATE.md` §§1–7 + F.1 notes |
| **Board** | `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` row `…-DEC-FE-ADMIN-NOTES-SA-01` **DISPATCHED** |

### 1.1 Problem — what residual remains after DEC FE CLOSED

DEC decision-types catalog FE is **CLOSED**: DEC-QA-02 U65 browser Settings DEC + picker **PASS** (`DECPLATQA2-MSJ21R6Z` 21/21) · DEC-QC-02 **GWC** · wire `R-PLT-DEC-FE-01` **CLOSED**. Catalog Option B Nest SoT (`hr_decision_type`) is **LOCKED** (DEC-VERTICAL / DEC-DATA CONFIRMED). L1 VAL-DEC-CAT/CNS `DECPLATQA-MSJ1FB3D` 12/12 **RETAIN**. What remains is **not** another closable FE wire residual — it is the **FE-ADMIN notes pack class** (peer REC / PAY / SI / ATT / EMP FE-ADMIN NOTES):

| Residual / note | Severity | Surface inventory (AS-IS) | Proven already (RETAIN) |
|-----------------|----------|---------------------------|-------------------------|
| **`R-PLT-DEC-TYP-FE-ADMIN`** | **P2 HOLD NOTE** | Nest «Loại quyết định DEC» Settings admin CRUD FE **LIVE** — `DecDecisionTypeSettingsPanel` mounted on `Settings.tsx` tab `dec-decision-types` (testid `settings-tab-dec-decision-types`) · `upsertDecDecisionType` (PUT) / `retireDecDecisionType` (POST retire) · `hrmApi` list/effective/upsert/retire (~7526–7629) · DEC-QA-02 browser admin CREATE N+ + F5 list proven | Nest DEC L1 + DEC-QA-01/02 · DEC-QC-01/02 · wire `R-PLT-DEC-FE-01` CLOSED |
| **`R-PLT-DEC-STARTER-REF`** | **P2 HOLD NOTE** | Starter/HRD bootstrap keys (`appointment`, `transfer`, `HRD_01`…`HRD_03`) + label maps + person-bound/WH flag display helpers (`decDecisionTypeCatalog.ts` · `decisionPersonBound.ts` · `decisionListUi.ts`) = **REF/label + display fallback only** (closed enum picker SoT **REJECT**) — flags `is_person_bound`/`writes_work_history` sourced from BE effective, **not** FE closed Set (`solid_convention_ack`) · **≠** Nest SoT · **≠** second admin writer | L-DEC-CAT-01/03 · BR-PLT-05 · starter ≠ ceiling · hardcoded Set retire RETAIN |
| **`R-PLT-DEC-FE-ADMIN-01`** *(mint this seat)* | **P2 HOLD NOTE pack** | **Consolidation** of the two rows above into one board residual for U88 continuity · **does not** invent new product surface · **does not** reopen DEC-QC-02 GWC · **does not** cut F-CORE-DEC / WH spine | DEC-QC-02 GWC · wire CLOSED · Nest SoT RETAIN |

**Critical discrimination vs ATT/EMP FE-ADMIN ABSENT and vs REC/SI/PAY LIVE:**

| Catalog family | FE-ADMIN mount | FE-ADMIN persist client | Consumer FE / picker | Residual class this seat |
|----------------|----------------|-------------------------|----------------------|--------------------------|
| **ATT** CODE/OT/COMP | **ABSENT** (GET `listEffective*` only) | **ABSENT** create/update client | CLOSED | HOLD = deepen ABSENT Nest admin until sponsor |
| **EMP** ST Nest | **ABSENT** Nest ST admin | Network L1 only | CLOSED | HOLD = Nest ST admin ABSENT |
| **SI** INS + INSURER | Settings Nest admin tabs **LIVE** | `upsert*` / `retire*` **LIVE** | CLOSED | HOLD = **no closable mount/persist gap** — NOTE pack |
| **PAY** salary_components | Payroll tab **LIVE** | create/update/delete **LIVE** | CNS SEAL | HOLD = **no closable mount/persist gap** — NOTE pack |
| **REC** pipeline-stages | Settings tab **LIVE** | `upsert` / `retire` **LIVE** | CNS SEAL | HOLD = **no closable mount/persist gap** — NOTE pack |
| **DEC** decision-types | Settings tab **LIVE** (`DecDecisionTypeSettingsPanel`) | `upsertDecDecisionType` / `retireDecDecisionType` **LIVE** | picker SEAL (`DECPLATQA2-MSJ21R6Z` 21/21) | HOLD = **no closable mount/persist gap** — NOTE pack (REC/SI/PAY-class inventory) |

**Discrimination (must not confuse with consumer/wire UNLOCK / DEC FE reopen):**

| Class | When used | DEC decision-types | This seat (FE-ADMIN notes) |
|-------|-----------|--------------------|----------------------------|
| **Consumer picker / wire FE** | Nest SoT + BE assert + FE picker bind → AC-PLT-DEC-01..06 | DEC-FE-01 READY → QA-02 21/21 → **GWC SEAL** · wire `R-PLT-DEC-FE-01` **CLOSED** | **OUT** — already SEALED — **FORBIDDEN reopen as FAIL** |
| **FE-ADMIN / deepen ABSENT Nest admin panel** | Network L1 OK · product Nest admin CRUD FE OUT | **NOT DEC AS-IS** — Settings admin tab **LIVE** | Cite ATT/EMP peer class only for *pack structure* — DEC audit → LIVE |
| **FE-ADMIN LIVE + no mount/persist gap** | Settings tab mount + CRUD wire + DEC-QA-02 admin CREATE proven | Admin shipped · AC-PLT-DEC-01 browser PASS | **THIS residual** → Option **A ACCEPT_AS_IS_P2 HOLD** |
| **Spine F-CORE-DEC / WH** | Create → approve/sign → effective → WH `decision_id` | must_keep · L1 VAL-DEC-CNS SEAL | **NOTE RETAIN** — **≠** closable FE-ADMIN mount/persist gap — **≠** unlock trigger |
| **Invent / reopen / flip** | Invent second Nest DEC admin path · reopen DEC-QC-02 as FAIL · LVRULE unlock · flip printable/personnel/payroll ready | REJECT | **Option C REJECT** |

**Board audit (closable FE wire residual still OPEN? closable FE-ADMIN mount/persist gap?)**

| Candidate | Board / seal | Verdict for this seat |
|-----------|--------------|------------------------|
| DEC FE wire consumer picker | DEC-QC-02 GWC · `DECPLATQA2-MSJ21R6Z` 21/21 · `R-PLT-DEC-FE-01` **CLOSED** | **SEALED** — **FORBIDDEN reopen as FAIL** |
| DEC L1 VAL-DEC-CAT/CNS | `DECPLATQA-MSJ1FB3D` 12/12 · DEC-QC-01 GWC | **SEALED** — RETAIN |
| DEC-BE ensureSchema + F-DEC-CAT-TYP/EFF | READY | **RETAIN** |
| DEC-DEVOPS rebuild dist | READY `DECPLATDEVOPS-MSJ1K9XZ` · residual CLOSED | **RETAIN** |
| DEC-VERTICAL / DEC-BA / DEC-DATA | CONFIRMED Option B · AC pack · physical | **RETAIN** — not reopen |
| Nest DEC FE-ADMIN mount `DecDecisionTypeSettingsPanel` | `Settings.tsx` tab → panel LIVE · testid `settings-tab-dec-decision-types` | **LIVE** — **no mount gap** |
| Nest DEC FE-ADMIN persist | `upsertDecDecisionType` · `retireDecDecisionType` · panel `onSave`/`onRetire` | **LIVE** — **no persist gap** |
| Starter/HRD + person-bound/WH flag display | REF/label only · flags from BE effective · not sole SoT | **REF RETAIN** — DENY closed-enum revive |
| F-CORE-DEC-01/02 WH spine | must_keep · L1 VAL-DEC-CNS SEAL | **RETAIN** — not FE-ADMIN gap · not reopen |
| REC FE-ADMIN pack | `R-PLT-REC-FE-ADMIN-01` HOLD (SPEC 55083) | **HOLD RETAIN** — twin LIVE class — **FORBIDDEN reopen as unlock** |
| PAY FE-ADMIN pack | `R-PLT-PAY-FE-ADMIN-01` HOLD (SPEC 49325) | **HOLD RETAIN** — twin LIVE class |
| SI FE-ADMIN pack | `R-PLT-SI-FE-ADMIN-01` HOLD (SPEC 40113) | **HOLD RETAIN** — twin LIVE class |
| ATT FE-ADMIN pack | `R-PLT-ATT-FE-ADMIN-01` HOLD (SPEC 31734) | **HOLD RETAIN** — **FORBIDDEN reopen as unlock** |
| EMP FE-ADMIN / EMP-CF FE | `R-PLT-EMP-FE-ADMIN-01` (SPEC 28353) · `R-PLT-EMP-CF-FE-01` HOLD | **HOLD RETAIN** — DENY reopen as unlock |
| LVRULE FE-01g | ACCEPT_AS_IS_P2 HOLD | **HOLD RETAIN** — DENY invent unlock |

**Conclusion:** No named closable **DEC FE wire** residual remains OPEN as FAIL (`R-PLT-DEC-FE-01` CLOSED). READ-ONLY audit finds **no closable FE-ADMIN mount/persist gap** (Settings `DecDecisionTypeSettingsPanel` mounted + Nest upsert/retire clients wired + DEC-QA-02 browser admin CREATE proven). Residual class = **FE-ADMIN notes pack after LIVE admin + FE SEAL** → prefer Option **A** — residual stays **HOLD** (not UNLOCK to `dev-fe`).

### 1.2 READ-ONLY apps/web audit (cited — no edit)

| Surface | Path | Kind | Verdict |
|---------|------|------|---------|
| Nest DEC type record type | `apps/web/hrm/src/integrations/hrmApi.ts` — `HrmDecDecisionTypeRecord` (~7533) · `UpsertDecDecisionTypePayload` (~7554) | type contract | **LIVE** RETAIN |
| Nest DEC list client | `hrmApi.ts` — `listDecDecisionTypes` (~7569) → `GET /api/hrm/decisions/decision-types` (~7586) | GET F-DEC-CAT-TYP-01 | **LIVE** RETAIN |
| Nest DEC effective client | `hrmApi.ts` — `listEffectiveDecDecisionTypes` (~7595) → `GET …/decision-types/effective` (~7606) | GET F-DEC-CAT-EFF-01 | **LIVE** consumer SoT |
| Nest DEC admin persist clients | `hrmApi.ts` — `upsertDecDecisionType` (~7615 · PUT) · `retireDecDecisionType` (~7625 · POST retire) | FE-ADMIN persist client | **LIVE** |
| Admin panel | `apps/web/hrm/src/components/settings/DecDecisionTypeSettingsPanel.tsx` — «Loại quyết định» CRUD · `onSave`→upsert (~151/189) · `onRetire`→retire (~220/227) · retire testid `hdsd-dec-decision-type-retire-*` (~462) | Settings CRUD | **LIVE mount+persist** |
| Settings shell mount | `apps/web/hrm/src/pages/Settings.tsx` — import (~97) + TabsTrigger `dec-decision-types` (~131/249) + `<DecDecisionTypeSettingsPanel />` (~583/584) · testid `settings-tab-dec-decision-types` (~251) | product admin route | **MOUNTED LIVE** |
| Consumer EFF hook | `apps/web/hrm/src/hooks/useDecDecisionTypesEffective.ts` | Nest effective cache for picker | picker SEAL RETAIN |
| Catalog helpers | `apps/web/hrm/src/lib/decDecisionTypeCatalog.ts` · `.test.ts` | display-ready · starter REF · retire history option · flags from BE effective (`solid_convention_ack`) | RETAIN |
| Person-bound helper | `apps/web/hrm/src/lib/decisionPersonBound.ts` · `.test.ts` | require employee_id gate display from catalog flag | RETAIN |
| Consumer picker / list | `apps/web/hrm/src/pages/Decisions.tsx` · `apps/web/hrm/src/lib/decisionListUi.ts` · `.test.ts` | Nest EFF picker · list label | SEAL RETAIN |
| Error toast map | `apps/web/hrm/src/lib/apiError.ts` — `HRM-DEC-TYPE-UNKNOWN` (~119) · `HRM-DEC-TYP-404` (~121) · `HRM-DEC-TYP-WH-REQUIRED` (~122) | consumer/admin | SEAL RETAIN |

**Audit finding (unlock gate):** Unlike ATT CODE/OT/COMP (GET `listEffective*` **only**, **no** create/update admin client, **no** admin panel) and EMP ST (ABSENT Nest admin), DEC ships **full FE-ADMIN path**: Settings tab mount + `DecDecisionTypeSettingsPanel` CRUD + Nest upsert/retire clients. DEC FE wave already proved consumer picker (Decisions.tsx), person-bound gate (catalog flag → require `employee_id`), retire hide + history key retain, and admin CREATE N+ + F5 (DEC-QA-02 21/21). F-CORE-DEC/WH spine is a **must_keep** sealed consumer, **not** a missing mount/persist of admin. **No closable FE-ADMIN mount/persist gap** → Option A HOLD · **do not** `next_owner=dev-fe`.

### 1.3 Constraints

- Docs-only · **no** `apps/**` · **no** seed (U65)
- **DENY** invent Nest dual DEC admin FE as *new* mandatory continuous Task (admin already LIVE on Settings — invent would be dual/polish without sponsor)
- **DENY** reopen DEC-QC-02 GWC as FAIL · reopen `R-PLT-DEC-FE-01` CLOSED · reopen DEC-QA-01/02 stamps · reopen DEC-BE/DEVOPS READY as FAIL
- **DENY** cut / redesign **F-CORE-DEC-01/02** create→approve→effective→WH spine · **must_keep** WH `decision_id` soft FK
- **DENY** invent LVRULE 01g unlock · reopen REC/PAY/SI/ATT/EMP FE-ADMIN HOLD **as unlock**
- **DENY** revive closed decision-type enum / hardcoded `PERSON_BOUND_DECISION_TYPES` / `WORK_HISTORY_NEO_DECISION_TYPES` Set as SoT (BR-PLT-05 · L-DEC-CAT-01/03)
- **DENY** absorb `contract_types` (CTR domain) into DEC · reopen EMP DOC/ET L1 SEAL
- **DENY** flip `hrm_personnel_uat_ready` · `contracts_printable_ready` · `payroll_e2e_ready` · `attendance_uat_ready` · `recruitment_uat_ready` · `jd_dynamic_done`
- **DENY** claim module DEC/QSĐ UAT · UC-HRM-27 DONE · Phase1 DONE · UF 🟢 whole decisions pillar
- BA AC packs for DEC catalog **already locked** (DEC-BA-01) · this seat is **disposition**, not redefine Nest Option B SoT
- must_keep: **DEC-QC-02 GWC** · **wire `R-PLT-DEC-FE-01` CLOSED** · **L1 `DECPLATQA-MSJ1FB3D`** · **Nest `hr_decision_type` SoT** · **DecDecisionTypeSettingsPanel LIVE** · **F-CORE-DEC/WH spine** · **starter/HRD ≠ ceiling** · **flags from BE effective** · **REC/PAY/SI/ATT/EMP FE-ADMIN HOLD** · **LVRULE HOLD** · **honesty false** · **C-SLICE**

### 1.4 Decision heuristic

| Rule | Application |
|------|-------------|
| FE SEAL + Nest is SoT + FE-ADMIN mount+persist LIVE + admin CREATE proven | FE-ADMIN invent deepen = **Option B/C reject**; note = HOLD pack |
| Closable FE-ADMIN mount/persist gap found? | Audit: **NO** → residual **HOLD** · next_owner **pm** (not `dev-fe`) |
| Spine F-CORE-DEC/WH sealed alone? | **Not** a mount/persist gap → **does not** unlock Option B |
| Unlock FE-ADMIN only if sponsor explicitly opens polish wave OR audit finds mount/persist gap | Board + audit: no gap · no sponsor FE-ADMIN polish message → **Option A** |
| No open closable DEC FE FAIL residual | Prefer **A**; do not invent LVRULE / reopen PAY/SI/ATT/REC/EMP FE-ADMIN HOLDs / flip personnel |

---

## 2. Options

### Option A — ACCEPT_AS_IS_P2 HOLD forever-until-sponsor for DEC FE-ADMIN notes — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Mint / stamp board residual **`R-PLT-DEC-FE-ADMIN-01`** as **P2 HOLD / NOTE pack** consolidating: (1) **`R-PLT-DEC-TYP-FE-ADMIN`** Nest decision-types Settings admin FE **LIVE** notes (mount+persist RETAIN · no further mandatory deepen); (2) **`R-PLT-DEC-STARTER-REF`** starter/HRD + person-bound/WH flag display REF-only notes (DENY closed-enum sole SoT revive · flags from BE effective). **Do not** invent `dev-fe` dual Nest admin panels. **Do not** invent ba-process AC pack. **Do not** reopen DEC-QC-02 GWC as FAIL / `R-PLT-DEC-FE-01` CLOSED. **Do not** cut F-CORE-DEC/WH spine. Peer *pack structure* = REC/PAY/SI FE-ADMIN NOTES · **DEC AS-IS inventory matches REC/SI/PAY LIVE class** (not ATT/EMP ABSENT). Unlock DEC FE-ADMIN polish **only** if sponsor later explicitly opens «mở FE wave DEC FE-ADMIN polish / quản trị Loại quyết định» **or** a future audit finds a **named closable** mount/persist defect. |
| **Benefits** | Honors peer FE-ADMIN HOLD pack class · matches U88 bandwidth · honesty / C-SLICE intact · no seal churn · FE-ADMIN already covers Nest DEC CRUD · FE picker SEAL RETAIN · starter/HRD + flags REF discipline RETAIN · WH spine must_keep intact |
| **Costs** | Optional HDSD / UX polish for admin tab / flag copy remains deferred until sponsor; Condition KEEP on board (HOLD ≠ CLOSED) |
| **Risks** | Misread HOLD as «waive DEC admin forever» or as permission to invent second Nest admin «to complete admin» or to reopen DEC FE «while polishing admin» or to cut WH spine or to flip `hrm_personnel_uat_ready` → mitigations **L-DEC-FE-ADMIN-*** |
| **Gate** | DEC-QC-02 GWC SEAL · wire `R-PLT-DEC-FE-01` CLOSED · L1 SEAL · Nest SoT RETAIN · FE-ADMIN LIVE (no gap) · honesty false |

### Option B — UNLOCK narrow FE-ADMIN deepen (`dev-fe`) if closable mount/persist gap

| | |
|--|--|
| **Description** | Unlock `dev-fe` **only if** READ-ONLY audit proves a **named closable** FE-ADMIN defect: Settings tab **not mounted**, `DecDecisionTypeSettingsPanel` **missing**, or upsert/retire **unwired** / persist fail class. Optionally narrow polish for flag/label copy **only** when sponsor names click-path UF. |
| **Benefits** | Would close a true product admin hole if one existed; would close flag-copy UF if sponsor prioritizes. |
| **Costs** | On AS-IS audit: tab **mounted** (`dec-decision-types`), panel **LIVE**, CRUD **wired** (`upsertDecDecisionType`/`retireDecDecisionType`), DEC-QA-02 admin CREATE **21/21**, consumer picker **LIVE**, person-bound gate **LIVE**. Unlocking now invents polish / dual work **without gap** — same risk as invent ATT Nest admin without sponsor. Treating WH spine as unlock forces bandwidth without mount/persist defect. |
| **Risks** | Scope creep · reopen DEC FE as FAIL «while wiring admin» · flip personnel ready · duplicate BA seat · confuse starter/HRD REF with Nest admin · cut WH spine. |
| **Gate** | **Reject as default** — audit finds **no** closable mount/persist gap. Retain B only if future audit/sponsor names an explicit gap or sponsor opens flag-copy polish. |

### Option C — REJECT invent Nest dual DEC admin / invent LVRULE unlock / reopen DEC FE as FAIL / flip printable–personnel / reopen PAY–SI–ATT–REC–EMP FE-ADMIN HOLDs / cut WH spine

| | |
|--|--|
| **Description** | Invent second Nest DEC admin CRUD surface (e.g. dual master outside Settings) as mandatory continuous Task; invent LVRULE 01g unlock; reopen DEC-QC-02 GWC as FAIL / `R-PLT-DEC-FE-01` CLOSED; reopen PAY/SI/ATT/REC/EMP FE-ADMIN HOLD as unlock; revive closed decision-type enum; cut F-CORE-DEC/WH spine; flip `hrm_personnel_uat_ready` / printable / payroll / claim module DEC UAT / UC-HRM-27 DONE / Phase1 / seed. |
| **Benefits** | None for G→1 honesty. |
| **Costs** | Seal churn · sponsor trust · C-SLICE violation · dual admin path confusion · closed-enum vs Nest SoT regression · WH spine break (F-CORE-DEC-02). |
| **Risks** | **REJECT** — all DENY lines in §1.3. |

---

## 3. Trade-off matrix

| Criteria | Weight | **A ACCEPT HOLD P2** | B Unlock FE-ADMIN gap | C Invent/reopen/flip |
|----------|-------:|---------------------:|----------------------:|---------------------:|
| Honesty / DENY invent Nest dual DEC admin | 5 | **5** | 2 | 0 |
| Seal safety (DEC-QC-02 GWC · wire CLOSED · L1 · REC/PAY/SI/ATT/EMP HOLD · LVRULE · WH spine) | 5 | **5** | 3 | 0 |
| Match peer FE-ADMIN NOTES pack class (REC/SI/PAY LIVE twin) | 5 | **5** | 1 | 0 |
| Business value (close true mount/persist gap) | 3 | 2 | **4** *(if gap)* / 1 *(no gap)* | 1 |
| U88 continuous bandwidth | 4 | **5** | 1 | 0 |
| Complexity / blast radius | 4 | **5** | 2 | 0 |
| Maintainability (Nest SoT + LIVE Settings admin + starter/flag REF + WH spine) | 4 | **5** | 2 | 0 |
| **Weighted** | | **128** | ≈52 | 3 |

*(Weighted = Σ weight×score; A dominates when audit shows no gap.)*

---

## 4. Failure modes and mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| **A** | HOLD misread as AC waive / DEC admin «N/A forever without stamp» | Evidence claims DEC FE-ADMIN waived | Stamp **ACCEPT_AS_IS_P2 HOLD** · AC RETAIN deferred · Condition KEEP on board |
| **A** | Silent invent second Nest DEC admin «to finish admin» (dual master) | Diff dual CRUD / duplicate panels | **FORBIDDEN** · L-DEC-FE-ADMIN-03 Nest dual DENY · Settings admin LIVE RETAIN |
| **A** | Reopen DEC-QC-02 GWC as FAIL / `R-PLT-DEC-FE-01` CLOSED under «admin polish» | Diff DEC evidence / stamp reopen | Cite `DECPLATQA2-MSJ21R6Z` 21/21 SEAL · DENY |
| **A** | Cut / redesign F-CORE-DEC / WH spine under «catalog polish» | Diff decisions.service / WH UPSERT | **FORBIDDEN** · L-DEC-FE-ADMIN-11 · must_keep spine |
| **A** | Invent LVRULE 01g / reopen PAY–SI–ATT–REC–EMP FE-ADMIN HOLDs as unlock / flip printable–personnel | Diff LeaveTab / PAY/SI/ATT/REC admin / CTR print / personnel flag | DENY · peers HOLD RETAIN · printable/personnel false |
| **A** | Mis-equate DEC LIVE admin with ATT/EMP ABSENT admin → dispatch invent FE | Bus invents DEC admin Task citing ATT ABSENT | Cite §1.1 discrimination · DEC LIVE ≠ ATT/EMP ABSENT (REC/SI/PAY-class) |
| **A** | Revive closed decision-type enum / hardcoded person-bound Set as SoT | Diff FE closed Set / API reject Nth key | L-DEC-FE-ADMIN-04 · BR-PLT-05 · flags from BE effective |
| **A** | Flip `hrm_personnel_uat_ready` because DEC FE GWC | Honesty matrix | DENY · C-SLICE · UC-HRM-27 DONE gate separate |
| B | Unlock without mount/persist gap | Bus DISPATCHED `dev-fe` DEC FE-ADMIN without gap evidence | Prefer A; B only gap-or-sponsor |
| C | Ready flip / Nest invent / DEC FE reopen as FAIL / WH cut | Honesty matrix / seals | DENY · NO-GO process |

---

## 5. Decision

| | |
|--|--|
| **Selected** | **Option A** — architecture **LOCKED** |
| **Seat verdict** | **CONFIRMED** |
| **Disposition** | **ACCEPT_AS_IS_P2 HOLD** on **`R-PLT-DEC-FE-ADMIN-01`** (pack includes `R-PLT-DEC-TYP-FE-ADMIN` + `R-PLT-DEC-STARTER-REF`) |
| **Why A** | DEC-QC-02 GWC SEAL (`DECPLATQA2-MSJ21R6Z` 21/21); wire `R-PLT-DEC-FE-01` **CLOSED**; L1 `DECPLATQA-MSJ1FB3D` 12/12 SEAL; Nest is SoT (Option B `hr_decision_type`); Network/browser admin CREATE **LIVE** (DEC-QA-02); Settings FE-ADMIN panel **LIVE** (`DecDecisionTypeSettingsPanel` mount + upsert/retire persist) — audit finds **no closable FE-ADMIN mount/persist gap**. F-CORE-DEC/WH spine ≠ gap (must_keep sealed). Residual = NOTE pack peer REC/SI/PAY FE-ADMIN HOLD *structure + LIVE inventory*, not ATT/EMP ABSENT invent. Option B unlock **not** gap-evidenced. Option C DENY. |
| **Rejected** | **B** as default unlock · **C** invent Nest dual / reopen DEC FE as FAIL / cut WH spine / flip / reopen HOLDs |
| **Assumptions** | Sponsor has **not** opened DEC FE-ADMIN polish wave in this message; REC/PAY/SI/ATT/EMP FE-ADMIN HOLD remain HOLD; LVRULE 01g remains HOLD; honesty flags remain false; DEC-QC-02 GWC + wire CLOSED remain SEAL. |
| **residual** | **`R-PLT-DEC-FE-ADMIN-01` = HOLD** (not UNLOCK) |
| **next_owner** | **pm** (not `dev-fe`) |

### 5.1 Unlock gates (what Option A does **not** open)

| Question | Answer |
|----------|--------|
| Unlock ba-process new AC pack? | **HOLD** — DEC-BA-01 already locked · **no** duplicate BA seat for admin invent |
| Unlock ba-data / new Nest tables? | **FORBIDDEN** — `hr_decision_type` already LIVE (Option B) · no schema change · no second catalog · no absorb `contract_types` |
| Unlock DEC FE-ADMIN mandatory `dev-fe`? | **HOLD** — audit shows LIVE mount+persist · no closable gap |
| Unlock / reopen DEC-QC-02 GWC / `R-PLT-DEC-FE-01` CLOSED as FAIL? | **FORBIDDEN** |
| Cut / redesign F-CORE-DEC / WH spine? | **FORBIDDEN** — must_keep |
| Unlock LVRULE 01g / reopen PAY–SI–ATT–REC–EMP FE-ADMIN HOLD as unlock? | **FORBIDDEN** |
| May PM flip `hrm_personnel_uat_ready` / printable / payroll / claim module DEC UAT / UC-HRM-27 DONE? | **NO** |
| May PM remove Condition from board as CLOSED? | **NO** — keep **HOLD P2** stamp · ACCEPT_AS_IS ≠ CLOSED Condition · ≠ WAIVED |

### 5.2 When sponsor later opens DEC FE-ADMIN polish wave (narrow alternate — not default)

```text
entry: sponsor message contains explicit «mở FE wave DEC FE-ADMIN polish / quản trị Loại quyết định»
   OR future READ-ONLY audit cites named closable mount/persist gap with path+symptom
   OR sponsor explicitly opens «DEC flag/label copy polish UF» (narrow — not mount invent)
retain: DECPLATQA2-MSJ21R6Z DEC FE GWC SEAL · R-PLT-DEC-FE-01 CLOSED · DECPLATQA-MSJ1FB3D L1 SEAL
       · DEC-VERTICAL/DEC-BA/DEC-DATA Option B SoT · F-CORE-DEC/WH spine must_keep
       · REC/PAY/SI/ATT/EMP FE-ADMIN HOLD · LVRULE HOLD · honesty false
scope_allowed:
  1) optional ba-process ADD-only UF inventory for Settings DecDecisionTypeSettingsPanel polish · NOT redefine Nest Option B schema
  2) dev-fe: narrow polish on DecDecisionTypeSettingsPanel / flag-label display copy ONLY (already LIVE admin)
scope_FORBIDDEN:
  - new Nest tables / schema change (hr_decision_type already SoT) · absorb contract_types
  - closed decision-type enum / hardcoded person-bound|WH Set as sole SoT revive (BR-PLT-05 REJECT forever)
  - reopen DEC-QC-02 GWC as FAIL · reopen R-PLT-DEC-FE-01 CLOSED · reopen DEC-BE/DEVOPS/L1 as FAIL
  - cut / redesign F-CORE-DEC / WH spine
  - invent LVRULE 01g · reopen PAY/SI/ATT/REC/EMP FE-ADMIN HOLD as unlock · flip printable/personnel/payroll ready
  - module DEC UAT / UC-HRM-27 DONE / Phase1 / seed
exit: R-PLT-DEC-*-FE-ADMIN may CLOSE; R-PLT-DEC-FE-ADMIN-01 pack may narrow; honesty false RETAIN · C-SLICE
```

### 5.3 Architecture boundary diagram (text)

```text
  Nest public.hr_decision_type L1 + DEC-QA-01/02          --> SEALED RETAIN (Option B SoT)
  F-DEC-CAT-TYP-01 list (admin SoT)                        --> LIVE Nest
  F-DEC-CAT-EFF-01 effective (picker SoT)                  --> LIVE Nest
  F-DEC-CAT-TYP-02 admin create/upsert/retire open N+      --> LIVE (browser DEC-QA-02 21/21)
  DEC consumer picker Decisions.tsx + person-bound gate    --> SEAL (R-PLT-DEC-FE-01 CLOSED)
  F-CORE-DEC-01/02 create->approve->effective->WH          --> must_keep SEAL RETAIN (spine, not FE-ADMIN gap)
  DEC L1 VAL-DEC-CAT/CNS DECPLATQA-MSJ1FB3D                --> SEAL RETAIN

  DEC Nest admin FE Settings tab
       DecDecisionTypeSettingsPanel + upsert/retire        --> LIVE (no mount/persist gap) · NOTE HOLD

  Starter/HRD + person-bound/WH flag display copy
       decDecisionTypeCatalog / decisionPersonBound        --> REF only · flags from BE effective · NOTE HOLD

  R-PLT-DEC-FE-ADMIN-01 (pack of the 2 NOTE rows)          --> ACCEPT_AS_IS_P2 HOLD
  REC/PAY/SI/ATT/EMP FE-ADMIN / LVRULE / CTR FE            --> HOLD RETAIN (FORBIDDEN reopen-as-unlock)
  hrm_personnel_uat_ready / printable / payroll            --> false RETAIN · C-SLICE

  DISCRIMINATION: ATT/EMP FE-ADMIN ABSENT ≠ DEC FE-ADMIN LIVE (REC/SI/PAY-class)
  all packs end HOLD · different inventory reasons
```

---

## 6. Locks (L-DEC-FE-ADMIN-*)

| Lock | Rule |
|------|------|
| **L-DEC-FE-ADMIN-01 HOLD ≠ WAIVE** | ACCEPT_AS_IS_P2 **does not** delete AC-PLT-DEC-01..06 · admin polish AC remains deferred FAIL-if-claimed until sponsor wave |
| **L-DEC-FE-ADMIN-02 DEC FE SEAL frozen** | `DECPLATQA2-MSJ21R6Z` 21/21 · DEC-QC-02 GWC · wire `R-PLT-DEC-FE-01` CLOSED · L1 `DECPLATQA-MSJ1FB3D` · DEC-BE/DEVOPS READY **FORBIDDEN reopen as FAIL** |
| **L-DEC-FE-ADMIN-03 Nest dual DENY** | No invent second Nest DEC admin CRUD FE / dual-master without sponsor polish wave / named gap |
| **L-DEC-FE-ADMIN-04 Starter/enum ≠ sole SoT** | Starter/HRD + person-bound/WH flag display remain **REF** · closed enum picker SoT **REJECT RETAIN** (BR-PLT-05 · L-DEC-CAT-01/03) · flags from BE effective (`solid_convention_ack`) |
| **L-DEC-FE-ADMIN-05 Printable / personnel / payroll ready frozen** | DENY flip `contracts_printable_ready` · `hrm_personnel_uat_ready` · `payroll_e2e_ready` · `attendance_uat_ready` · `recruitment_uat_ready` · `jd_dynamic_done` |
| **L-DEC-FE-ADMIN-06 Peer HOLD RETAIN** | DENY reopen REC/PAY/SI/ATT/EMP FE-ADMIN HOLD · EMP-CF FE HOLD **as unlock** |
| **L-DEC-FE-ADMIN-07 LVRULE HOLD** | DENY invent LVRULE 01g unlock |
| **L-DEC-FE-ADMIN-08 Honesty** | DENY flip ready flags · C-SLICE RETAIN · DENY module DEC/QSĐ UAT · UC-HRM-27 DONE |
| **L-DEC-FE-ADMIN-09 Condition KEEP** | ACCEPT_AS_IS ≠ CLOSED ≠ WAIVED · keep HOLD P2 on board |
| **L-DEC-FE-ADMIN-10 LIVE ≠ ABSENT** | DEC Settings admin LIVE must not be narrated as ATT/EMP-style ABSENT invent trigger |
| **L-DEC-FE-ADMIN-11 WH spine must_keep** | F-CORE-DEC-01/02 · WH `decision_id` soft FK · person-bound gate · position key gate — **FORBIDDEN** cut/redesign under catalog polish |
| **L-DEC-FE-ADMIN-12 Nest SoT RETAIN** | Nest `hr_decision_type` remain Option B SoT · starter/HRD REF only · no closed-enum revert · no `contract_types` absorb |
| **L-DEC-FE-ADMIN-13 Admin ≠ consumer/wire** | DEC-FE wire consumer picker sealed (R-PLT-DEC-FE-01 CLOSED); admin open N+ RETAIN · FE picker READY ≠ FE-ADMIN mount gap |
| **L-DEC-FE-ADMIN-14 Path lock** | UTF-8 no BOM on NFD `.git`+`apps` True tree |
| **L-DEC-FE-ADMIN-15 EMP/ATT/REC/CTR seals** | DENY reopen EMP DOC/ET L1 SEAL · ATT leave-types · REC pipeline-stages · CTR `contract_types` OUT |

---

## 7. Impacted systems & non-goals

| In scope (docs disposition) | OUT / FORBIDDEN |
|-----------------------------|-----------------|
| Board residual `R-PLT-DEC-FE-ADMIN-01` ACCEPT_AS_IS_P2 HOLD | `apps/**` edits · migration · seed |
| Option A/B/C + LOCKED A → next_dispatch PM | Invent Nest DEC dual admin CRUD FE |
| Cite peer REC/PAY/SI/ATT/EMP FE-ADMIN HOLD pack class | Reopen DEC-QC-02 GWC / wire CLOSED as FAIL |
| Consolidate FE-ADMIN + starter/flag REF NOTES into pack | Cut F-CORE-DEC / WH spine · invent LVRULE · reopen PAY/SI HOLD as unlock · flip printable/personnel |
| U88 PM continue next vertical/governance | Flip personnel ready · module DEC UAT · UC-HRM-27 DONE · Phase1 DONE |
| Nest DEC SoT + LIVE Settings admin + WH spine RETAIN | Revive closed decision-type enum as sole picker SoT · absorb contract_types |

---

## 8. Validation / acceptance evidence plan

| Checkpoint | PASS when |
|------------|-----------|
| Spec ≥8KB on NFD `.git` toplevel | This file Length verified (≥8192; target peer ≥25KB) |
| Status | **CONFIRMED** · Option **A** **LOCKED** |
| Residual | `R-PLT-DEC-FE-ADMIN-01` minted · **HOLD** P2 (not CLOSED · not WAIVED · not UNLOCK) |
| next_dispatch | ACCEPT HOLD seal to **pm** · **not** invent ba-process/FE Nest dual · **not** `dev-fe` |
| Honesty | ready=false · C-SLICE · DENY Nest dual invent · DENY DEC FE reopen as FAIL · DENY WH cut · DENY LVRULE invent · DENY flip printable/personnel |
| Peer seals | DEC-QC-02 GWC · wire CLOSED · L1 · REC/PAY/SI/ATT/EMP FE-ADMIN HOLD · LVRULE HOLD RETAIN |
| Audit | Mount LIVE + persist LIVE cited · no closable gap used to force Option B |

---

## 9. Peer seal RETAIN checklist (FORBIDDEN reopen)

| Seal / HOLD | Stamp / id | Action |
|-------------|------------|--------|
| DEC FE consumer picker / wire | `DECPLATQA2-MSJ21R6Z` 21/21 · DEC-QC-02 GWC · `R-PLT-DEC-FE-01` CLOSED | RETAIN · DENY reopen as FAIL |
| DEC L1 VAL-DEC-CAT/CNS | `DECPLATQA-MSJ1FB3D` 12/12 · DEC-QC-01 GWC | RETAIN |
| DEC-BE ensureSchema + F-DEC-CAT | READY | RETAIN |
| DEC-DEVOPS rebuild dist | `DECPLATDEVOPS-MSJ1K9XZ` · residual CLOSED | RETAIN |
| DEC-VERTICAL / DEC-BA / DEC-DATA | CONFIRMED Option B · AC · physical | RETAIN |
| F-CORE-DEC-01/02 + WH `decision_id` | spine must_keep | RETAIN · DENY cut |
| REC FE-ADMIN | `R-PLT-REC-FE-ADMIN-01` HOLD (SPEC 55083) | RETAIN · twin LIVE class · DENY reopen-as-unlock |
| PAY FE-ADMIN | `R-PLT-PAY-FE-ADMIN-01` HOLD (SPEC 49325) | RETAIN · twin LIVE class |
| SI FE-ADMIN | `R-PLT-SI-FE-ADMIN-01` HOLD (SPEC 40113) | RETAIN · twin LIVE class |
| ATT FE-ADMIN | `R-PLT-ATT-FE-ADMIN-01` HOLD (SPEC 31734) | RETAIN · ABSENT contrast · DENY reopen-as-unlock |
| EMP FE-ADMIN / EMP-CF FE | `R-PLT-EMP-FE-ADMIN-01` (SPEC 28353) · `R-PLT-EMP-CF-FE-01` HOLD | RETAIN · DENY reopen-as-unlock |
| LVRULE 01g | ACCEPT_AS_IS_P2 HOLD | RETAIN · DENY invent unlock |
| CTR `contract_types` / template FE | OUT / HOLD · printable not flipped | RETAIN |
| EMP DOC/ET · ATT leave · REC stages | prior seals | RETAIN |

---

## 10. completion_report

**Closed:** SA Option/F.1 for DEC **FE-ADMIN notes pack** after decision-types catalog FE CLOSED — READ-ONLY apps/web audit shows Settings `DecDecisionTypeSettingsPanel` **mounted** (`settings-tab-dec-decision-types`), `upsertDecDecisionType` (PUT) / `retireDecDecisionType` (POST retire) **LIVE** (onSave/onRetire), `hrmApi` Nest DEC clients list/effective/upsert/retire **LIVE** (~7526–7629) (contrast ATT/EMP GET-only ABSENT admin; match REC/SI/PAY LIVE class); DEC-QC-02 GWC · wire `R-PLT-DEC-FE-01` **CLOSED** · DEC-QA-02 U65 browser Settings DEC + picker **PASS** `DECPLATQA2-MSJ21R6Z` **21/21**; L1 `DECPLATQA-MSJ1FB3D` 12/12 **RETAIN**; starter/HRD + person-bound/WH flag display REF-only (flags from BE effective · `solid_convention_ack`) ≠ sole SoT; F-CORE-DEC/WH spine **must_keep** sealed (≠ FE-ADMIN gap); board audit shows **no** open closable DEC FE FAIL residual and **no** closable FE-ADMIN mount/persist gap; class = FE-ADMIN NOTES pack after LIVE admin + FE SEAL (peer REC/SI/PAY FE-ADMIN HOLD *structure + LIVE inventory*); Option **A/B/C** evaluated; **Option A LOCKED ACCEPT_AS_IS_P2 HOLD**; mint **`R-PLT-DEC-FE-ADMIN-01`** (packs DEC-TYP FE-ADMIN + starter/HRD/flag REF); residual **HOLD** (not UNLOCK); ba-process/FE **HOLD**; DENY invent Nest dual · invent LVRULE · reopen DEC-QC-02 as FAIL · reopen wire CLOSED · cut WH spine · reopen PAY/SI/ATT/REC/EMP FE-ADMIN HOLD as unlock · revive closed enum · absorb contract_types · flip printable/personnel/payroll ready; honesty false · C-SLICE · docs-only · no `apps/**`.

**Open / residual:** Condition **`R-PLT-DEC-FE-ADMIN-01`** remains **HOLD P2** on W8 board until sponsor opens DEC FE-ADMIN polish wave (or future named mount/persist gap); ready flags false.

**next_owner:** **pm**

**ack_status:** **PASS_TO_PM** · **CONFIRMED** · Option **A** **LOCKED**

**evidence_path:** `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-ADMIN-NOTES-SA-01.md`

### next_dispatch_prompt (copy-ready — U88 next peer)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-ADMIN-NOTES-SA-01
from_role: sa
to_role: pm
lane: governance · U88
ack_status: PASS_TO_PM
verdict: Option A LOCKED · ACCEPT_AS_IS_P2 HOLD on R-PLT-DEC-FE-ADMIN-01
selected_option: A
residual: R-PLT-DEC-FE-ADMIN-01 = HOLD (not UNLOCK)
action:
  1) Seal board residual R-PLT-DEC-FE-ADMIN-01 = ACCEPT_AS_IS_P2 HOLD (Condition KEEP · not CLOSED; not WAIVED; not UNLOCK to dev-fe)
     · pack includes R-PLT-DEC-TYP-FE-ADMIN + R-PLT-DEC-STARTER-REF
     · AS-IS: Settings Nest admin LIVE (DecDecisionTypeSettingsPanel mount + upsert/retire persist) · no closable FE-ADMIN gap
     · Starter/HRD + person-bound/WH flag display = REF only (DENY closed-enum sole SoT revive; flags from BE effective)
  2) DENY invent ba-process / Nest dual DEC admin FE / new hr_decision_type tables Tasks from this residual
  3) RETAIN: DECPLATQA2-MSJ21R6Z DEC FE GWC · R-PLT-DEC-FE-01 CLOSED · DECPLATQA-MSJ1FB3D L1 SEAL · DEC-BE/DEVOPS READY
     · DEC-VERTICAL/DEC-BA/DEC-DATA Option B Nest SoT · F-CORE-DEC/WH spine must_keep
     · REC FE-ADMIN HOLD R-PLT-REC-FE-ADMIN-01 · PAY FE-ADMIN HOLD R-PLT-PAY-FE-ADMIN-01
     · SI FE-ADMIN HOLD R-PLT-SI-FE-ADMIN-01 · ATT FE-ADMIN HOLD R-PLT-ATT-FE-ADMIN-01 · EMP FE-ADMIN HOLD R-PLT-EMP-FE-ADMIN-01
     · LVRULE 01g HOLD · honesty false · C-SLICE
  4) Continue U88 next vertical/governance peer per continuous board
     · DENY invent LVRULE unlock · DENY reopen DEC-QC-02 as FAIL · DENY cut WH spine
     · DENY reopen PAY/SI/ATT/REC/EMP FE-ADMIN HOLD as unlock
     · DENY flip hrm_personnel_uat_ready / contracts_printable_ready / payroll_e2e_ready / attendance_uat_ready / recruitment_uat_ready
sponsor_gated_reopen_only: explicit «mở FE wave DEC FE-ADMIN polish / quản trị Loại quyết định»
  OR future audit cites named closable mount/persist gap
  OR sponsor opens «DEC flag/label copy polish UF» narrow
  → then narrow polish on existing DecDecisionTypeSettingsPanel / flag display ONLY (Nest Option B schema RETAIN · no new tables · no DEC FE reopen as FAIL · no WH cut · closed enum ≠ sole SoT)
evidence: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-ADMIN-NOTES-SA-01.md
```

**DENY alternate:** invent Nest DEC dual admin CRUD FE · invent LVRULE 01g · reopen DEC-QC-02 GWC as FAIL · reopen `R-PLT-DEC-FE-01` CLOSED · cut F-CORE-DEC/WH spine · reopen PAY/SI/ATT/REC/EMP FE-ADMIN HOLD as unlock · flip `hrm_personnel_uat_ready` · flip printable/payroll · claim module DEC UAT / UC-HRM-27 DONE / Phase1 DONE · revive closed enum · absorb contract_types · seed · apps/** · next_owner=dev-fe without gap.

---

## 11. F.1 API / DB disposition notes (governance — no physical unlock)

| Layer | Disposition |
|-------|-------------|
| **DB** | No ADD table · Nest `public.hr_decision_type` remain **LIVE SoT (Option B)** · this seat does **not** open ba-data · no schema change · no second catalog · no `contract_types` absorb |
| **API** | No new Nest admin CRUD routes required; F-DEC-CAT-TYP-01/02 + F-DEC-CAT-EFF-01 already proven (DEC-QA-01/02 + admin CREATE) · RETAIN; FE clients upsert/retire RETAIN |
| **FE consumer** | Picker / wire SEAL RETAIN · **out of scope reopen** (`useDecDecisionTypesEffective` · `Decisions.tsx` picker · `decisionPersonBound` gate · `decisionListUi` label) |
| **FE admin** | Settings Nest DEC admin **LIVE RETAIN** · **HOLD** polish / dual invent |
| **Spine** | F-CORE-DEC-01/02 create→approve→effective→WH `decision_id` **must_keep** · **FORBIDDEN** cut |
| **Starter / flag REF** | Starter/HRD + person-bound/WH flag display REF/alias RETAIN · **FORBIDDEN** closed-enum sole picker SoT when effective>0 |
| **F.1 completeness** | Disposition complete for residual class; physical F.1 for DEC FE-ADMIN polish deferred until sponsor wave or named gap (optional BA ADD click-path only) |

### 11.1 F.1 surface map (admin ↔ consumer ↔ spine)

| Surface id | Role | SoT | Status this seat |
|------------|------|-----|------------------|
| S-DEC-ADM-01 | Settings tab Loại quyết định | Nest `hr_decision_type` via F-DEC-CAT-TYP-02 | LIVE admin · NOTE HOLD |
| S-DEC-CNS-01 | Decisions picker (chọn loại QSĐ) | Nest EFF / F-DEC-CAT-EFF-01 | SEAL RETAIN (wire CLOSED) |
| S-DEC-CNS-02 | Person-bound gate (require employee_id) | catalog flag `is_person_bound` | SEAL RETAIN |
| S-DEC-CNS-03 | Decisions list / retire history label | `decisionListUi` · retired key display | SEAL RETAIN |
| S-DEC-SPINE-01 | Create→approve→effective→WH | F-CORE-DEC-01/02 · `wh_event_type` · `decision_id` | must_keep RETAIN · ≠ FE-ADMIN |
| S-DEC-REF-01 | Starter/HRD + flag display copy | REF label/display only | NOTE HOLD · ≠ sole SoT |
| S-DEC-OUT-01 | QSĐ FormSchema by type (GĐ1.5) · MergeToken print (GĐ2) · CTR contract_types | separate residual / OUT | OUT · SEAL/RESIDUAL RETAIN |

### 11.2 Capability pointer (cite — do not duplicate DEC-VERTICAL)

| Cap | Path / rule | This seat |
|-----|-------------|-----------|
| List / admin SoT | F-DEC-CAT-TYP-01 `GET /api/hrm/decisions/decision-types` | RETAIN · DEC-QA |
| Effective picker SoT | F-DEC-CAT-EFF-01 `GET …/decision-types/effective` | RETAIN · picker |
| Admin create/upsert/retire open | F-DEC-CAT-TYP-02 · N+ slug OK | RETAIN · LIVE FE admin |
| Consumer assert | `HRM-DEC-TYPE-UNKNOWN` when effective>0 | RETAIN · SEAL |
| Person-bound gate | `HRM-DEC-EMP-REQUIRED` (F-CORE-DEC-01) | must_keep RETAIN |
| WH write on effective | F-CORE-DEC-02 · `wh_event_type` · `decision_id` UPSERT | must_keep RETAIN |
| Retire WH-required guard | `HRM-DEC-TYP-WH-REQUIRED` | RETAIN |
| FormSchema by type / Merge print / contract_types | OUT reopen | DENY |

---

## 12. References

| Artifact | Role |
|----------|------|
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01.md` | Option B Nest SoT `hr_decision_type` · L-DEC-CAT-* · F-DEC-CAT-* · WH flags |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BA-01.md` | AC-PLT-DEC-01..06 · BR-PLT-DEC-* · person-bound · dual SoT |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DATA-01.md` | Physical `hr_decision_type` |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-ADMIN-NOTES-SA-01.md` | Twin ACCEPT_AS_IS_P2 HOLD pack LIVE admin (`R-PLT-REC-FE-ADMIN-01` · SPEC 55083) — structure mirror |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-FE-ADMIN-NOTES-SA-01.md` | Twin ACCEPT_AS_IS_P2 HOLD pack LIVE admin (`R-PLT-PAY-FE-ADMIN-01` · SPEC 49325) |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-FE-ADMIN-NOTES-SA-01.md` | Twin ACCEPT_AS_IS_P2 HOLD pack LIVE admin (`R-PLT-SI-FE-ADMIN-01` · SPEC 40113) |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01.md` | Twin ACCEPT_AS_IS_P2 HOLD pack ABSENT admin (`R-PLT-ATT-FE-ADMIN-01` · SPEC 31734) |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-ADMIN-NOTES-SA-01.md` | Twin ACCEPT_AS_IS_P2 HOLD pack (`R-PLT-EMP-FE-ADMIN-01` · SPEC 28353) |
| `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` | Continuous board · DEC rows (28–37) · DEC FE-ADMIN NOTES row (208) |
| `apps/web/hrm/src/pages/Settings.tsx` | READ-ONLY: DecDecisionTypeSettingsPanel mount |
| `apps/web/hrm/src/components/settings/DecDecisionTypeSettingsPanel.tsx` | READ-ONLY: LIVE admin CRUD |
| `apps/web/hrm/src/integrations/hrmApi.ts` ~7526–7629 | READ-ONLY: list + effective + upsert/retire |
| `apps/web/hrm/src/hooks/useDecDecisionTypesEffective.ts` | READ-ONLY: consumer EFF |
| `apps/web/hrm/src/pages/Decisions.tsx` · `apps/web/hrm/src/lib/decisionListUi.ts` · `decisionPersonBound.ts` · `decDecisionTypeCatalog.ts` | READ-ONLY: consumer + starter/flag REF |
| `.cursor/templates/ADR_OPTION_TEMPLATE.md` | Option evaluation structure |

---

## 13. Expanded rationale (audit trail for PM / QC)

### 13.1 Why this is not DEC FE wire UNLOCK / reopen class

DEC decision-types shipped **consumer picker** (Decisions.tsx bind effective), **person-bound gate** (catalog flag → require `employee_id`), **retire hide + history key retain**, and **admin open N+** was proven at DEC-QA-02. Those Conditions were executed by `dev-be` / `dev-fe` / `qa` / `qc` and SEALED at DEC-QC-02 GWC with stamp `DECPLATQA2-MSJ21R6Z` (21/21), wire `R-PLT-DEC-FE-01` **CLOSED**. L1 SEAL followed. This seat owns **only** the remaining **FE-ADMIN notes pack** class. Treating FE-ADMIN as another mandatory `dev-fe` wave without a mount/persist gap would violate DENY invent lines and risk narrating DEC-QC-02 GWC as FAIL «while polishing».

### 13.2 Why DEC FE-ADMIN LIVE still ends HOLD (not CLOSED Condition)

FE-ADMIN panel being LIVE does **not** auto-CLOSE the board residual. Per REC/PAY/SI/ATT/EMP FE-ADMIN NOTES peers, the pack residual is stamped **ACCEPT_AS_IS_P2 HOLD** as a durable U88 NOTE: Condition KEEP · not WAIVED · not CLOSED. LIVE inventory means **do not unlock invent** · it does **not** mean «remove residual and claim module DEC admin UAT». Honesty / C-SLICE remain false. `hrm_personnel_uat_ready` remains **false**; UC-HRM-27 product DONE gate is separate.

### 13.3 Why DEC LIVE ≠ ATT/EMP ABSENT (same HOLD outcome, different reason) — REC/PAY/SI twin

| | ATT FE-ADMIN NOTES | EMP FE-ADMIN NOTES | DEC FE-ADMIN NOTES (this seat) | REC / PAY / SI FE-ADMIN NOTES |
|--|--------------------|--------------------|--------------------------------|-------------------------------|
| Admin panel component | ABSENT | ABSENT (ST) | LIVE (`DecDecisionTypeSettingsPanel`) | LIVE |
| Admin CRUD client | ABSENT (GET effective only) | ABSENT / L1 only | LIVE upsert/retire | LIVE create/update/retire |
| Product mount | ABSENT | ABSENT | LIVE Settings tab `dec-decision-types` | LIVE Settings/Payroll tab |
| Why HOLD | Optional Nest admin invent deferred to sponsor | Nest ST admin deferred | No closable gap · polish deferred · NOTE pack | No closable gap · polish deferred · NOTE pack |
| Unlock default? | No (sponsor FE-ADMIN wave) | No (sponsor wave) | No (no gap · sponsor polish only) | No |
| next_owner | pm | pm | **pm** | pm |

PM must **not** copy ATT/EMP «ABSENT → invent admin FE later» narrative onto DEC as an automatic `dev-fe` Task. DEC already has the admin FE ATT/EMP lack (REC/PAY/SI-class).

### 13.4 Why Nest SoT (not closed enum) shapes this pack

DEC-VERTICAL chose **Option B = Nest `hr_decision_type` as code SoT** with typed flags (`is_person_bound`, `writes_work_history`, `wh_event_type`, `requires_position_key`) replacing hardcoded `PERSON_BOUND_DECISION_TYPES` / `WORK_HISTORY_NEO_DECISION_TYPES` Sets. Starter/HRD keys + FE flag display remain REF/label (closed enum REJECT · L-DEC-CAT-01/03 · `solid_convention_ack`: FE format only, flags from BE effective). FE-ADMIN Settings panel is **Nest-backed** CRUD (not a closed-enum-only SoT). Therefore there is **no** Settings-gap unlock, and **no** ATT/EMP-style «admin ABSENT» invent. The residual is a consolidation NOTE after FE SEAL. Pack explicitly includes starter/flag REF row so PM does not misread «starter HRD_*» as missing Nest admin.

### 13.5 Why WH spine — why not Option B unlock

F-CORE-DEC-01/02 (create → approve/sign → effective → WH `decision_id` UPSERT · person-bound gate · position-key gate) is a **must_keep sealed spine** validated at L1 VAL-DEC-CNS (`DECPLATQA-MSJ1FB3D` 12/12) and consumer at DEC-QA-02. That is a **transaction spine**, not a missing `DecDecisionTypeSettingsPanel` mount or unwired upsert/retire. Using WH spine to unlock `dev-fe` would invent a mandatory polish/redesign wave without sponsor and without FE-ADMIN mount/persist gap · **DENY as default** (L-DEC-FE-ADMIN-11). Any future catalog polish must **retain** the WH spine intact.

### 13.6 Honesty / C-SLICE statement

Closing DEC FE Conditions and stamping FE-ADMIN HOLD **must not** flip:

- `hrm_personnel_uat_ready`
- `contracts_printable_ready`
- `payroll_e2e_ready`
- `attendance_uat_ready`
- `recruitment_uat_ready`
- `jd_dynamic_done`

Nor claim module DEC/QSĐ UAT, UC-HRM-27 product DONE, Phase1 DONE, or UF 🟢 for whole decisions pillar. **`C-SLICE-≠-MODULE`** remains true: many GWC slices ≠ module GO.

### 13.7 U88 continuity after this seat

PM should:

1. Seal `R-PLT-DEC-FE-ADMIN-01` HOLD on W8 board.
2. **Not** dispatch `dev-fe` / ba-process for DEC FE-ADMIN invent (HOLD · no gap).
3. Continue next vertical / governance peer without inventing LVRULE unlock, reopening DEC-QC-02 as FAIL, cutting WH spine, reopening PAY/SI/ATT/REC/EMP FE-ADMIN HOLD as unlock, or flipping personnel/printable/payroll.
4. Keep peer FE-ADMIN HOLDs RETAIN · **do not** reopen-as-unlock.

### 13.8 Seal citation block (mission seals)

| Seal | Role |
|------|------|
| `DECPLATQA2-MSJ21R6Z` | DEC FE QA-02 U65 browser Settings DEC + picker 21/21 → DEC-QC-02 GWC · wire `R-PLT-DEC-FE-01` CLOSED |
| `DECPLATQA-MSJ1FB3D` | DEC L1 VAL-DEC-CAT/CNS 12/12 → DEC-QC-01 GWC L1-SEAL · RETAIN |
| `DECPLATDEVOPS-MSJ1K9XZ` | DEC-DEVOPS rebuild dist F-DEC-CAT · residual CLOSED |
| `R-PLT-REC-FE-ADMIN-01` | Prior U88 REC FE-ADMIN Option A HOLD · SPEC 55083 · structure mirror · DENY reopen as unlock |
| `R-PLT-PAY-FE-ADMIN-01` | Peer LIVE FE-ADMIN HOLD pack · SPEC 49325 |
| `R-PLT-SI-FE-ADMIN-01` | Peer LIVE FE-ADMIN HOLD pack · SPEC 40113 |

### 13.9 W8 board DEC rows (context — disposition only)

| Board row | Role status (AS-IS) | This seat effect |
|-----------|---------------------|------------------|
| DEC-VERTICAL SA → DEC-BA → DEC-DATA | CONFIRMED Option B · AC · physical | RETAIN |
| DEC-BE → DEC-DEVOPS | READY · `DECPLATDEVOPS-MSJ1K9XZ` | RETAIN |
| DEC-QA-01 → DEC-QC-01 | PASS `DECPLATQA-MSJ1FB3D` 12/12 · GWC L1-SEAL | RETAIN · FORBIDDEN reopen as FAIL |
| DEC-FE-01 → DEC-QA-02 → DEC-QC-02 | READY · PASS `DECPLATQA2-MSJ21R6Z` 21/21 · GWC · `R-PLT-DEC-FE-01` CLOSED | RETAIN · FORBIDDEN reopen as FAIL |
| DEC-FE-ADMIN-NOTES-SA-01 | DISPATCHED → this CONFIRMED A HOLD | Mint `R-PLT-DEC-FE-ADMIN-01` HOLD |

---

## 14. Residual ID registry (mint)

| ID | Severity | Status after this seat | Owner next |
|----|----------|------------------------|------------|
| **R-PLT-DEC-FE-ADMIN-01** | P2 | **ACCEPT_AS_IS_P2 HOLD** (KEEP Condition) | pm (board seal) |
| R-PLT-DEC-TYP-FE-ADMIN | P2 | **HOLD → pack** (not CLOSED) · LIVE admin NOTE | sponsor-gated polish / named gap only |
| R-PLT-DEC-STARTER-REF | P2 | **HOLD → pack** · starter/HRD/flag REF NOTE · DENY closed-enum sole SoT | sponsor-gated docs/UX only |
| R-PLT-DEC-FE-01 (wire) | — | **CLOSED** (DEC-QA-02 · DEC-QC-02 GWC) | — · FORBIDDEN reopen as FAIL |
| DEC L1 / picker / person-bound / WH spine | — | **SEAL** RETAIN (`DECPLATQA-MSJ1FB3D` · `DECPLATQA2-MSJ21R6Z`) | — · must_keep |

---

## 15. RETAIN list (must_keep for next owners)

1. Nest `hr_decision_type` Option B SoT LIVE + F-DEC-CAT-TYP/EFF
2. Settings FE-ADMIN `DecDecisionTypeSettingsPanel` LIVE (mount + upsert/retire) · do not invent dual
3. DEC FE SEAL `DECPLATQA2-MSJ21R6Z` 21/21 · DEC-QC-02 GWC · wire `R-PLT-DEC-FE-01` CLOSED · DENY reopen as FAIL
4. DEC L1 `DECPLATQA-MSJ1FB3D` 12/12 · DEC-QC-01 GWC L1-SEAL · DEC-BE/DEVOPS READY
5. F-CORE-DEC-01/02 create→approve→effective→WH `decision_id` spine · person-bound + position-key gate · **must_keep** — DENY cut
6. Starter/HRD + person-bound/WH flag display REF ≠ closed-enum sole picker SoT (BR-PLT-05 · L-DEC-CAT-01/03 · `solid_convention_ack`)
7. REC FE-ADMIN HOLD `R-PLT-REC-FE-ADMIN-01` · PAY `R-PLT-PAY-FE-ADMIN-01` · SI `R-PLT-SI-FE-ADMIN-01` · ATT `R-PLT-ATT-FE-ADMIN-01` · EMP `R-PLT-EMP-FE-ADMIN-01` · EMP-CF FE HOLD
8. LVRULE 01g ACCEPT_AS_IS_P2 HOLD
9. `hrm_personnel_uat_ready=false` · printable/payroll/attendance/recruitment false · UC-HRM-27 DONE unchanged
10. U65 zero-seed · `C-SLICE-≠-MODULE` · no module DEC/QSĐ UAT claim
11. CTR `contract_types` OUT (CTR domain) · EMP DOC/ET L1 SEAL · ATT leave · REC stages sealed
12. Dual SoT: settings `hr_decision_types` REF ↔ tenant writer `hr_decision_type` (tenant wins) · alias `decision_types`
13. Path lock NFD WriteAllText UTF-8 no BOM

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
| `docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qc-02.md` *(or board row)* | GWC · `R-PLT-DEC-FE-01` CLOSED · L1 retain | DEC FE SEAL RETAIN |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qa-02.md` *(or board row)* | PASS `DECPLATQA2-MSJ21R6Z` 21/21 U65 browser | SEAL cite |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qc-01.md` *(or board row)* | GWC L1-SEAL | RETAIN |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qa-01.md` *(or board row)* | PASS `DECPLATQA-MSJ1FB3D` 12/12 VAL-DEC-CAT/CNS | L1 RETAIN |
| REC FE-ADMIN NOTES SPEC | Length 55083 · Option A HOLD | Peer LIVE depth mirror |
| PAY FE-ADMIN NOTES SPEC | Length 49325 · Option A HOLD | Peer LIVE depth |
| SI FE-ADMIN NOTES SPEC | Length 40113 · Option A HOLD | Peer LIVE depth |
| ATT FE-ADMIN NOTES SPEC | Length 31734 · Option A HOLD | Peer ABSENT contrast |
| EMP FE-ADMIN NOTES SPEC | Length 28353 · Option A HOLD | Peer ABSENT contrast |

---

## 18. Explicit non-claims (process honesty)

This seat **does not** claim:

- Module DEC / QSĐ UAT READY
- `hrm_personnel_uat_ready=true`
- UC-HRM-27 product DONE
- Module CTR printable READY / payroll READY / attendance READY / recruitment READY
- Phase 1 DONE
- UF 🟢 for whole decisions pillar
- FE-ADMIN Condition CLOSED (it is HOLD)
- Permission to reopen PAY/SI/ATT/REC/EMP FE-ADMIN HOLD as unlock
- Permission to invent LVRULE unlock
- Permission to reopen DEC-QC-02 GWC as FAIL / `R-PLT-DEC-FE-01` CLOSED
- Permission to cut / redesign F-CORE-DEC / WH spine
- Permission to revive closed decision-type enum / absorb contract_types
- Closable FE-ADMIN mount/persist gap (audit negative)
- WH spine as mount/persist defect

---

## 19. Scope parity / U19 note (SA proactive)

List `GET /api/hrm/decisions/decision-types`, get-by-id, admin mutate (`upsertDecDecisionType`/`retireDecDecisionType`), effective, and consumer assert paths must continue to share **`resolveHrmListScope`** + `assertResourceInHrmScope` (L-DEC-CAT-09). This seat **does not** reopen scope work; any future polish wave must **retain** scope_parity tests. **No** J-HRM-DEC* L2.5 promote from this disposition.

---

## 20. Program journey / honesty flags (U19)

| Flag / journey | State after this seat |
|----------------|----------------------|
| `hrm_personnel_uat_ready` | **false** RETAIN |
| UC-HRM-27 product DONE | **unchanged** — catalog/FE slice ≠ module DONE |
| J-HRM-DEC* L2.5 promote | **DENIED / deferred** |
| `C-SLICE-≠-MODULE` | **true** |
| printable / payroll / attendance / recruitment | **false** RETAIN |
| Missing J-* for DEC FE-ADMIN polish | Documented as **sponsor-gated** · not architecture gap forcing unlock |

---

## 21. BA governance notes (for future sponsor wave only)

If sponsor opens §5.2 polish:

1. **ba-process** ADD-only UF inventory for `DecDecisionTypeSettingsPanel` polish · **do not** redefine Nest Option B / AC-PLT-DEC-01..06.
2. Keep admin ↔ consumer ↔ spine split explicit in any new AC rows.
3. Starter/HRD + flags REF remains non-SoT · any flag/label UX polish must not revive closed decision-type enum picker SoT.
4. WH spine (F-CORE-DEC-02) must remain intact · any polish must regression-test WH `decision_id`.
5. QA evidence must remain U65 FE-only · no seed.
6. DENY reopen DEC-QC-02 GWC / wire CLOSED / EMP DOC-ET / ATT / REC seals as side-effect of polish.

Until then: **ba-process HOLD** this residual.

---

## 22. Risk register (compressed)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| PM unlocks `dev-fe` without gap | Med | Med | Option A LOCK · next_owner pm · L-DEC-FE-ADMIN-03/10 |
| DEC FE narrated FAIL during polish talk | Low | High | L-DEC-FE-ADMIN-02 · seal checklist §9 |
| Closed decision-type enum sole SoT revive | Med | High | L-DEC-FE-ADMIN-04 · pack REF row · BR-PLT-05 |
| WH spine cut under catalog polish | Low | High | L-DEC-FE-ADMIN-11 · §13.5 · must_keep |
| personnel/printable/payroll flip | Med | High | L-DEC-FE-ADMIN-05/08 · §18 non-claims |
| ATT/EMP ABSENT narrative copied to DEC | Med | Med | §13.3 discrimination table |
| PAY/SI/REC FE-ADMIN HOLD reopened as unlock | Low | High | L-DEC-FE-ADMIN-06 · mission DENY |
| contract_types absorbed into DEC | Low | High | L-DEC-FE-ADMIN-12/15 |

---

## 23. Write protocol verification block

| Check | Expected |
|-------|----------|
| Path | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-ADMIN-NOTES-SA-01.md` |
| Encoding | UTF-8 **no BOM** via `[System.IO.File]::WriteAllText(..., UTF8Encoding($false))` |
| Tree | NFD `.git`+`apps` True (canonical) |
| Length | **MUST ≥ 8192** (peer target ≥25KB) |
| Lane | docs-only · **no** `apps/**` · **no** `packages/**` |

---

## 24. Admin vs consumer vs spine boundary (mission cover)

| Axis | Settings admin (FE-ADMIN) | Decisions consumer picker | Decisions spine (WH) |
|------|---------------------------|----------------------------|-----------------------|
| SoT | Nest `hr_decision_type` via F-DEC-CAT-TYP list/mutate | Nest EFF via F-DEC-CAT-EFF-01 | F-CORE-DEC-01/02 · WH `decision_id` |
| UI | `DecDecisionTypeSettingsPanel` · Settings tab | `Decisions.tsx` picker + `decisionPersonBound` + `decisionListUi` | decisions create→approve→effective |
| Create N+ | **OPEN** admin (BR-PLT-05 · AC-PLT-DEC-01) | **FORBIDDEN** invent type key when effective>0 | N/A |
| Assert | slug format only | **400** `HRM-DEC-TYPE-UNKNOWN` | `HRM-DEC-EMP-REQUIRED` · WH on effective |
| This seat | LIVE · HOLD NOTE pack | SEAL RETAIN (wire CLOSED) · FORBIDDEN reopen | must_keep RETAIN · FORBIDDEN cut |
| Misread risk | Treat as ABSENT → invent dual | Treat as reopen DEC FE to «finish admin» | Treat catalog polish as license to redesign WH |

**Architecture rule:** Admin Settings CRUD, consumer picker, and WH spine are **orthogonal surfaces** of one Nest SoT. DEC FE picker READY **does not** imply FE-ADMIN mount gap. FE-ADMIN LIVE **does not** imply DEC FE reopen or WH redesign. Residual is NOTES HOLD only.

---

## 25. Cross-vertical FE-ADMIN HOLD registry (U88 continuity)

| Residual | Vertical | Inventory class | Status |
|----------|----------|-----------------|--------|
| `R-PLT-ATT-FE-ADMIN-01` | ATT | ABSENT Nest admin | HOLD RETAIN |
| `R-PLT-EMP-FE-ADMIN-01` | EMP | ST ABSENT / POS–DEPT Settings | HOLD RETAIN |
| `R-PLT-SI-FE-ADMIN-01` | SI | LIVE Settings Nest admin | HOLD RETAIN |
| `R-PLT-PAY-FE-ADMIN-01` | PAY | LIVE Payroll Nest admin | HOLD RETAIN |
| `R-PLT-REC-FE-ADMIN-01` | REC | LIVE Settings Nest admin | HOLD RETAIN |
| **`R-PLT-DEC-FE-ADMIN-01`** | **DEC** | **LIVE Settings Nest admin** | **HOLD minted this seat** |
| LVRULE 01g | ATT leave | ABSENT product FE | HOLD RETAIN · DENY invent |

All of the above end as **ACCEPT_AS_IS_P2 HOLD** for U88 · unlock only on sponsor polish wave or named closable gap. **DENY** reinterpret any HOLD as unlock because a peer vertical sealed FE/consumer.

---

## 26. Final stamp (SA)

| Field | Value |
|-------|--------|
| **selected_option** | **A** |
| **residual** | **`R-PLT-DEC-FE-ADMIN-01` = HOLD** |
| **next_owner** | **pm** |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **SPEC path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-ADMIN-NOTES-SA-01.md` |
| **RETAIN** | DEC-QC-02 GWC · wire CLOSED · L1 · Nest SoT · Settings admin LIVE · F-CORE-DEC/WH spine · REC/PAY/SI/ATT/EMP FE-ADMIN HOLD · LVRULE HOLD · honesty false · C-SLICE |
