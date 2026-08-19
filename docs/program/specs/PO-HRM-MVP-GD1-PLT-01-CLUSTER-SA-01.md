# PO-HRM-MVP-GD1-PLT-01-CLUSTER-SA-01 — Option/F.1 · Nền tảng cấu hình động (catalog · schema · trường trộn) — RETAIN LIVE

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PLT-01-CLUSTER-SA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual invent · **DENY** wipe CORE-10/09/07 seals · **DENY** invent PAY/ATT/printable DONE · **DENY** honesty flip · **DENY** claim catalog/CRUD/LIVE alone = PLT-01 / CORE-10 DONE · **C-SLICE** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** AC → (ba-data HOLD default) → API/FE residual only if BA proves closable gap → Dev |
| **depends_on** | QC-01 GWC Wave-23 UC-BP-CORE-10 **SEALED** — stamp `CORE10QC1-MSLP0EJB` · evidence `docs/qa/evidence/po-hrm-mvp-gd1-core-10-cluster-qc-01.md` · QA `CORE10QA1-MSLOTSWO` · must_keep CORE-09 `CORE09QC1-MSLNBA89` (**printable false** · ≠ CORE-09 DONE) · CORE-07 `CORE07QC1-KZJTSHNT` (GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE) · soft≠CORE-06 DONE · peers CORE-05/03/02b/09d..01 · EMP DOC/ET · TOK · EMP-CF · SI type/insurer · ATT/PAY/DEC/REC catalog peers **RETAIN cite** · catalog/CRUD/LIVE≠CORE-10 DONE · BH≠CORE-07 · PAY-06 OUT · Nest `/core` **ABSENT** |
| **uc_ids** | `UC-BP-PLT-01` · `FR-UC-BP-PLT-01` |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#26** after CORE-10 (#25 SEALED GWC) · ATT / PAY remain **QUEUED** · PAY/ATT OUT invent DONE |
| **ref_sa_spine** | CORE-10 [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-SA-01.md) · CORE-09 fill [`…-09-…`](./PO-HRM-MVP-GD1-CORE-09-CLUSTER-SA-01.md) · CORE-07 [`…-07-…`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-SA-01.md) · CORE-02b EMP-CF [`…-02B-…`](./PO-HRM-MVP-GD1-CORE-02B-CLUSTER-SA-01.md) · CORE-03 DOC [`…-03-…`](./PO-HRM-MVP-GD1-CORE-03-CLUSTER-SA-01.md) · CORE-09d TPL [`…-09D-…`](./PO-HRM-MVP-GD1-CORE-09D-CLUSTER-SA-01.md) · platform ADR [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option **B** · API F.1 [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md) · MergeToken EMP [`…-MERGE-TOKEN-EMP-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-SA-01.md) · EMP-CF [`…-EMP-CUSTOM-FIELD-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-SA-01.md) · honesty packs **RETAIN false** — **DENY reopen sealed J-HRM-CORE-10/09/07/06/05/03/02B/09D..01 without regression** |
| **ref_honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · ATT/PAY/EMP/REC/CTR module UAT **false** · product_go **false** · **DENY claim peer catalog seals = PLT-01 DONE** · **DENY claim merge-tokens LIVE = platform UAT** · **DENY invent PAY/ATT/printable DONE** · **DENY claim CORE-10/09/07 DONE** · **C-SLICE** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PLT-01** · Diễn biến **#1–#5 + Thành công** · **BR-PLT-01..06** · AC principle **AC-PLT-SET/CAT/REC/PAY/EMP*/ATT*/CTR*** · peers CORE-09d/02b/03 · REC-00 JD · ATT/PAY OUT invent DONE this seat |
| **ref_inventory** | `UC_INVENTORY.md` `UC-BP-PLT-01` — **ADD** · MVP · WBS-CORE-02 |
| **ref_adr** | ADR-HRM-DYNAMIC-CONFIG-PLATFORM Option **B** (Catalog + FormSchema + MergeToken) · Nest physical prefer · paper `/core` alias only · U19 scope parity · soft-delete · open catalog BR-PLT-05 · **DENY** mega-EAV · **DENY** Nest `/core` dual |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-PLT-TOK-01..03** · **F-EMP-TOK-*** · **F-EMP-CF-*** · **F-EMP-CAT-*** · **F-SI-CAT-*** · **F-ATT-CAT-*** · **F-PLT-PAY-COMP-*** · **F-REC-CAT-*** · **F-CORE-CTR-TPL/PREV/VER** · settings-catalogs physical · Nest `@Controller('core')` **ABSENT** |
| **ref_db** | LIVE `hrm_merge_tokens` · `hrm_catalog_extension_items` · domain Nest catalogs (DOC/ET · SI type/insurer · ATT code/shift/OT · salary_components · stages · CTR TPL…) · XBOS sync via catalog-sync / settings-catalogs · Nest `@Controller('core')` **ABSENT** |
| **ref_code** | `merge-tokens.controller` `@Controller('merge-tokens')` · `settings-catalogs.controller` · `catalog-sync.controller` · `emp-merge-token-register` · domain catalog services (att-ot-type · attendance-catalog · si-insurance-type · payroll-catalog · …) · FE Settings panels · **read-only cite** · CoreModule = DB export only |
| **OUT** | Nest `/core` dual platform · wipe CORE-10/09/07 · wipe EMP-CF / TOK / DOC seals · invent mega-EAV / Nest `emp_custom_field` · invent PAY DONE · invent ATT DONE · invent printable/Word DONE · claim catalog alone = PLT DONE · claim CRUD/LIVE alone = PLT or CORE-10 DONE · claim CORE-10/09/07 DONE · reopen sealed peers · seed · honesty flip · apps/** this seat |
| **Honesty** | all ready flags **false** · **C-SLICE** · U65 zero-seed · **printable false RETAIN** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-24 architecture unlock: **dynamic platform config** (FR-UC-BP-PLT-01 — danh mục · schema · trường trộn) vs AS-IS LIVE Nest platform/catalog/schema/merge surfaces — **gap-only** under U89 |
| **Requestor** | PM · program `PO-HRM-MVP-GD1-CONTINUOUS` · U89 after CORE-10 QC-01 GWC (`CORE10QC1-MSLP0EJB`) |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-PLT-01 · BR-PLT-01..06 · AC-PLT-* principle pack · ADR Option B three-layer · F-PLT-TOK · F-EMP-CF/TOK/CAT · peer vertical catalogs · must_keep CORE-10/09/07 · Nest `/core` DENY · U19 · soft≠CORE-06 DONE · PAY-06 OUT |

### 1.1 Three-layer lock (PLT-01 vocabulary)

| Layer | Paper meaning (GĐ1 LOCK) | LIVE SoT (cite — prefer RETAIN) |
|-------|--------------------------|----------------------------------|
| **(1) Catalog** | Dòng cấu hình mở (mã · nhãn · trạng thái · phạm vi); N+1 ≠ trần; soft-retire; consumer ∈ EFF when EFF>0 | Domain Nest catalogs + `settings-catalogs` / `catalog-sync` · **admin ≠ consumer** |
| **(2) Schema / FormSchema** | Metadata form · bố cục · thứ tự · bắt buộc — lưu cấu hình, không khóa cứng màn nghiệp vụ | JD `rec_jd_*` · EMP-CF four allow-list groups + `sort_order` · CTR clause/canvas consumers — **interfaces**, not mega-EAV |
| **(3) Trường trộn / MergeToken** | Registry tên trường điền sẵn cho xem trước / in / xuất | `hrm_merge_tokens` via physical **`/api/hrm/merge-tokens`** (F-PLT-TOK-01..03) + EMP side-effects DOC/ET/CF |

**DENY** invent Nest `@Controller('core')` as primary three-layer SoT when physical surfaces above already carry the spine.  
**Paper `/api/hrm/core/…`** for catalog/schema/token = **alias only** (documentation) — Nest dual **ABSENT** (grep 2026-08-09: no `@Controller('core')`).

### 1.2 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **CORE-10 SEALED (`CORE10QC1-MSLP0EJB`):** SI lifecycle actions LIVE · Nest `/core` SI **0** · catalog/CRUD/LIVE≠DONE · BH≠CORE-07 · printable **false** · must_keep CORE-09/07 · soft≠CORE-06 · PAY-06 OUT · **≠** claim CORE-10 DONE. **Platform AS-IS (PRESENT):** (1) **MergeToken** Nest `@Controller('merge-tokens')` GET/POST/PATCH/retire + `resolve-preview` · SoT `hrm_merge_tokens` · F-PLT-TOK F.1 CONFIRMED · EMP TOK EXT seals. (2) **Catalog admin** `settings-catalogs` (+ extension-items EMP-CF) · `catalog-sync` · domain Nest (DOC/ET · SI type/insurer · ATT code/shift/OT · leave · PAY components · DEC · REC stages · CTR TPL open). (3) **Schema instances** JD dynamic (REC-00 companion · `jd_dynamic_done=false`) · EMP-CF field groups (CORE-02b SEALED) · CTR clause/PREV merge consumers (CORE-09* printable false). (4) ADR-HRM-DYNAMIC-CONFIG-PLATFORM Option **B** already selected for platform; many vertical DOC-DELTA / QA stamps **RETAIN cite**. (5) **ABSENT:** Nest `@Controller('core')` platform dual · Nest `emp_custom_field` mega-EAV. |
| **Paper target** | FR-UC-BP-PLT-01: khóa ba lớp chung; Cài đặt lưu catalog/schema/token → F5 còn; consumer chọn từ EFF; ban hành đóng băng ảnh chụp; **không** thay sổ HĐ; **không** mở mọi mã lifecycle thành CRUD; **không** claim module UAT. |
| **Gap class** | **GĐ1 continuous AC + U65 journey residual on LIVE three-layer spine** — **not** greenfield Nest `/core` platform: (1) board #26 needs Option lock mapping PLT-01 ↔ LIVE F-PLT-* / vertical peers; (2) risk invent Nest `/core` / mega-EAV / wipe CORE-10/09/07; (3) risk claim peer catalog or merge LIVE = PLT-01 / platform UAT DONE; (4) risk invent PAY/ATT/printable DONE; (5) risk honesty flip from C-SLICE. |
| **Constraints** | U89 continuous · **preserve** CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY · C-SLICE · DENY seed · **cấm code until Option CONFIRMED** · gap-only · **DENY** honesty flip · **DENY** invent PAY/ATT/printable/Word DONE · **DENY** claim CORE-10/09/07 DONE |
| **Failure impact if unresolved** | Board #26 stalls or Dev invents Nest `/core` dual; false claim catalog=PLT DONE; wipe CORE seals; PAY/ATT open early; honesty flip |

### 1.3 Architecture diagram (target — Option A)

```text
  UC-BP-CORE-01..10 + CORE-02b/03/05/06/07/09* (SEALED must_keep)
  Nest /core DENY · printable false · catalog/CRUD/LIVE≠CORE-10 DONE
  BH≠CORE-07 · soft≠CORE-06 DONE · C-SLICE · honesty false
       │
       │  must_keep RETAIN — DENY reopen J-HRM-CORE-10/09/07/06/05/03/02B/09D..01
       ▼
  ┌────────────── FR-UC-BP-PLT-01 (this seat — gap-only RETAIN three-layer) ────────┐
  │                                                                                │
  │  L1 CATALOG = domain Nest + settings-catalogs + catalog-sync (RETAIN cite)     │
  │    Admin N+1 OK · consumer KEY when EFF>0 · soft-retire BR-PLT-04              │
  │    Peers: EMP DOC/ET/CF · SI · ATT · PAY · DEC · REC · CTR TPL                 │
  │    ≠ claim any single catalog seal = PLT-01 DONE                               │
  │                                                                                │
  │  L2 FORMSCHEMA = specialized UIs (RETAIN cite instances)                       │
  │    JD rec_jd_* · EMP-CF allow-list groups · CTR clause/canvas                  │
  │    Shared interfaces — DENY mega-EAV / Nest emp_custom_field                   │
  │    jd_dynamic_done=false RETAIN                                                │
  │                                                                                │
  │  L3 MERGETOKEN = F-PLT-TOK-01..03 LIVE                                         │
  │    Physical /api/hrm/merge-tokens* · SoT hrm_merge_tokens                      │
  │    EMP side-effect F-EMP-TOK-* · resolve order registry>keyword_map            │
  │    paper /core/…/merge* = ALIAS ONLY                                           │
  │                                                                                │
  │  AS-IS platform LIVE = RETAIN path                                             │
  │    ≠ PLT-01 / platform module DONE without U65 AC principle journeys           │
  │                                                                                │
  │  PAY/ATT vertical deepen = QUEUED seats · OUT invent DONE this seat            │
  │  must_keep CORE-10/09/07 · Nest /core DENY · printable false                   │
  └────────────────────────────────────────────────────────────────────────────────┘
       │
       │  OUT this seat
       ▼
  Nest /core dual platform                   = DENY
  Wipe CORE-10/09/07 seals                   = DENY
  soft = CORE-06 DONE                        = DENY
  Invent PAY/ATT/printable/Word DONE         = DENY
  Claim catalog/CRUD/LIVE alone = PLT DONE   = DENY
  Claim merge LIVE = platform UAT            = DENY
  Claim CORE-10/09/07 DONE                   = DENY
  Mega-EAV / emp_custom_field invent         = DENY
  Flip personnel / printable / recruit       = DENY
  C-SLICE ≠ module PLT / CORE / ATT / PAY UAT

  Honesty: C-SLICE ≠ hrm_personnel_uat_ready · ≠ contracts_printable_ready
           ≠ jd_dynamic_done · ≠ product_go
```

**Label lock:** Board «Nền tảng cấu hình động (danh mục · schema · trường trộn)» GĐ1 = **RETAIN cite LIVE three-layer Nest physical surfaces** — **not** Nest `/core` dual; **not** any single vertical catalog = FR-PLT DONE; **not** merge-tokens LIVE alone = platform UAT.  
**Spine lock:** Physical prefer `/api/hrm/merge-tokens*` + `/settings-catalogs*` + domain catalog controllers — paper `/core/…` = **alias only** — **DENY** Nest `/core` second SoT.  
**Honesty lock:** Slice GWC later **≠** auto-flip ready flags · **≠** claim CORE-10/09/07 DONE · **≠** invent PAY/ATT/printable DONE · **C-SLICE**.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / API / ADR) | AS-IS LIVE | Verdict |
|------------|-------------------------|------------|---------|
| Catalog open N+1 | BR-PLT-02/05 · AC-PLT-CAT / EMP / ATT / CTR | Domain Nest + settings-catalogs + sync | **RETAIN cite peers** · ≠ PLT DONE alone |
| Soft-retire | BR-PLT-04 | archived_at / status inactive patterns | **RETAIN must_keep** |
| FormSchema / layout | BR-PLT · AC-PLT-REC · CORE-02b | JD + EMP-CF + CTR canvas | **RETAIN cite instances** · DENY mega-EAV |
| MergeToken registry | F-PLT-TOK-01..03 · BR-PLT-01 | `/merge-tokens*` · `hrm_merge_tokens` | **RETAIN must_keep** |
| EMP token side-effect | F-EMP-TOK · AC-PLT-EMP-TOK | DOC/ET/CF → F-PLT-TOK-02 | **RETAIN cite** |
| Resolve preview / CTR | F-PLT-TOK-03 · F-CORE-CTR-PREV | LIVE resolve order | **RETAIN** · printable false |
| Freeze on issue | BR-PLT-03 | VER merged_fields snapshot | **RETAIN peer** CORE-09c |
| Paper `/core` platform | API paper paths | Nest `@Controller('core')` **ABSENT** | **paper = alias only** |
| CORE-10 SI lifecycle | Peer | SEALED `CORE10QC1-MSLP0EJB` · catalog≠DONE | **must_keep RETAIN** |
| CORE-09 fill/registry | Peer | SEALED `CORE09QC1-MSLNBA89` · printable false | **must_keep RETAIN** |
| CORE-07 activate | Peer | SEALED `CORE07QC1-KZJTSHNT` | **must_keep RETAIN** |
| PAY/ATT deepen | AC-PLT-PAY / ATT-* | QUEUED board #27+ | **OUT invent DONE** |
| Module / honesty | program | C-SLICE | **DENY flip** |

---

## 3. Options A / B / C

### Option A — ACCEPT_AS_IS_RETAIN three-layer LIVE spine (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** LIVE Catalog (domain Nest + settings-catalogs + catalog-sync) + FormSchema instances (JD · EMP-CF · CTR) + MergeToken (`/api/hrm/merge-tokens*` · `hrm_merge_tokens` · F-PLT-TOK-01..03) as GĐ1 SoT for FR-UC-BP-PLT-01. Paper `/core/…` catalog/schema/token = **alias only**. Cite vertical peer seals (EMP/SI/ATT/PAY/DEC/REC/CTR) — **explicit ≠ PLT-01 DONE alone**. Unlock BA for **U65 AC-PLT principle journeys** + O1–O12 fidelity (admin≠consumer · open N+1 · soft-retire · token register · freeze cite) without inventing Nest dual. **must_keep** CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest `/core` DENY. PAY/ATT/printable/Word **OUT invent DONE**. |
| **Scope** | Gap-only docs lock · **no** `apps/**` this seat |
| **Complexity** | Low–medium (spine LIVE; residual = AC packaging + journey selection across layers) |
| **Risk** | Low if BA does not invent Nest dual / claim catalog=DONE / invent PAY·ATT |
| **Cost / timeline** | BA → ba-data HOLD → API cite RETAIN → FE residual only if gap · QA U65 |
| **Pros** | Matches ADR Option B already in repo; preserves W10–W23 seals; unlocks board #26; avoids dual SoT |
| **Cons** | Not full platform UAT; ATT/PAY catalog deepen still QUEUED seats |
| **Failure modes** | BA over-scopes Nest `/core` · mega-EAV · claim peer seal=PLT DONE · invent PAY/ATT · wipe CORE-10/09/07 |
| **Mitigation** | O1–O12 locks · DENY invent · peers OUT explicit · ≠DONE footers · C-SLICE |

### Option B — Nest `/core` dual platform + wipe / re-home physical spines (REJECT)

| | |
|--|--|
| **Summary** | Stand up Nest `@Controller('core')` as primary Catalog/FormSchema/MergeToken SoT; dual-write or migrate off `/merge-tokens` + settings-catalogs + domain Nest; invent mega-EAV FormSchema table |
| **Pros** | Paper path literal match |
| **Cons** | Dual SoT · violates U89 preserve · high blast · regression CORE-10/09/07 + platform seals |
| **Failure modes** | Dual-write · Nest `/core` non-404 SoT · honesty flip · wipe TOK/CF/DOC |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim peer LIVE = PLT-01 DONE / honesty (REJECT)

| | |
|--|--|
| **Summary** | Declare seat DONE because merge-tokens or any catalog panel exists; flip jd_dynamic / personnel / printable / product_go; invent PAY/ATT DONE; reopen sealed CORE peers; claim CORE-10 catalog=DONE |
| **Pros** | Fast chat claim |
| **Cons** | Violates AC-PLT U65 · C-SLICE · peer must_keep · ADR honesty |
| **Failure modes** | False UAT · sponsor distrust · continuous program stall |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (RETAIN three-layer) | B (Nest dual+wipe) | C (HOLD/claim DONE) |
|-----------|-------:|-----------------------:|-------------------:|--------------------:|
| Business value (FR-PLT-01) | 5 | **5** | 2 | 0 |
| Time to deliver | 4 | **5** | 1 | Fake PASS |
| Complexity (lower=better) | 3 | **4** | 1 | — |
| Security / scope U19 | 4 | **5** | 2 | Honesty breach |
| Reliability / preserve seals | 5 | **5** | 1 | High defect |
| Maintainability | 4 | **5** | 1 | Spec lie |
| Fit ADR Option B + preserve | 5 | **5** | 0 | 0 |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_RETAIN**: LIVE Catalog + FormSchema instances + MergeToken (`/merge-tokens*` · `hrm_merge_tokens`); paper `/core` = alias only; unlock BA AC-PLT U65 + peer cite ≠ DONE; **RETAIN** CORE-10/09/07 · soft≠CORE-06 · Nest `/core` DENY · vertical peers; **DENY** Nest dual · mega-EAV · wipe CORE-10/09/07/06/05/03/02b/09d..01 · invent PAY/ATT/printable/Word DONE · claim catalog/CRUD/LIVE alone = PLT or CORE-10 DONE · claim CORE-10/09/07 DONE · honesty flip · reopen seals · seed · apps/** |
| **Why selected** | AS-IS already implements ADR Option B three-layer spine (API-01 F-PLT-TOK + settings-catalogs + domain catalogs + EMP-CF/JD/CTR schema consumers); remaining gap is **U65 principle AC packaging + journey fidelity + honesty footers** — not greenfield Nest `/core`, not wipe CORE-10/09/07; preserves W10–W23 must_keep; unlocks board #26 |
| **Assumptions** | CORE-10 **`CORE10QC1-MSLP0EJB` RETAIN** · QA `CORE10QA1-MSLOTSWO` · catalog/CRUD/LIVE≠DONE · BH≠CORE-07 · PAY-06 OUT · ≠ CORE-10 DONE. CORE-09 **`CORE09QC1-MSLNBA89` RETAIN** · printable false · ≠ CORE-09 DONE. CORE-07 **`CORE07QC1-KZJTSHNT` RETAIN** · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · ≠ CORE-07 DONE. soft≠CORE-06 DONE **RETAIN**. Nest `@Controller('core')` **ABSENT** (grep). `hrm_merge_tokens` + `/merge-tokens` **PRESENT**. `hrm_personnel_uat_ready=false` · `contracts_printable_ready=false` · `jd_dynamic_done=false` · `recruitment_uat_ready=false` · product_go **false**. |
| **Rejected** | **B** — Nest `/core` dual / wipe / mega-EAV · **C** — HOLD / claim peer LIVE = PLT DONE / invent PAY·ATT / honesty flip / reopen sealed |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | Catalog SoT | Domain Nest + settings-catalogs + sync — cite peers | Admin N+1 ≠ consumer invent KEY when EFF>0 |
| O2 | FormSchema | JD + EMP-CF + CTR instances — **no** mega-EAV | Schema AC journeys without claiming jd_dynamic_done |
| O3 | MergeToken | F-PLT-TOK physical `/merge-tokens` ONE SoT | List F5 + register side-effect + resolve-preview AC |
| O4 | Paper `/core` | Alias only | DENY Nest dual in AC/evidence |
| O5 | Freeze BR-PLT-03 | Cite CORE-09 VER snapshot | ≠ printable DONE |
| O6 | Soft-retire | BR-PLT-04 patterns RETAIN | No hard-delete AC |
| O7 | CORE-10/09/07 | must_keep stamps | ≠ reopen · ≠ claim DONE |
| O8 | PAY/ATT | OUT invent DONE · QUEUED | Trace-only in AC if needed |
| O9 | Honesty | All false · C-SLICE | Footer ≠DONE on every AC |
| O10 | Seed | U65 zero-seed | Empty catalog = soft-allow CTA · no seed |
| O11 | Journey mint | Prefer J-HRM-PLT-01-* DRAFT spanning L1/L2/L3 | Narrow · not full ATT/PAY module |
| O12 | Closable gap | Default ba-data HOLD · API RETAIN | Only wire-only if BA proves gap |

---

## 5. F.1 outline (paper alias · Nest physical prefer)

> Full F.1 deepen = later **sa API** seat after BA — this outline **locks disposition only**.

| F-id (cite) | Physical METHOD/path | Paper `/core` | Mục đích (VI) | Bước SRS |
|-------------|----------------------|---------------|---------------|----------|
| **F-PLT-TOK-01** | `GET /api/hrm/merge-tokens` · `GET …/:tokenId` | alias only | Liệt kê trường trộn hiệu lực | Diễn biến #3/#4 · AC-PLT-EMP-TOK / CTR-05 |
| **F-PLT-TOK-02** | `POST/PUT /merge-tokens` · `PATCH` · `POST …/retire` | alias only | Đăng ký / nghỉ trường trộn | BR-PLT-01/04 |
| **F-PLT-TOK-03** | `POST /merge-tokens/resolve-preview` | alias only | Giải trộn xem trước | BR-PLT-01 · CORE-09 PREV |
| **F-EMP-CF-01..03** | `GET/POST …/settings-catalogs/{key}/…` | alias only | Schema nhóm field NS | CORE-02b · AC-PLT-EMP-CUSTOM |
| **F-EMP-CAT-DOC/ET** | DOC/ET Nest catalogs | alias only | Catalog giấy tờ / loại thuê + TOK side-effect | AC-PLT-EMP-TOK · CORE-03 |
| **F-SI-CAT-*** | SI type/insurer Nest | alias only | Catalog BH peers | CORE-10 AC-SI-CAT · ≠ CORE-10 DONE |
| **F-ATT-CAT-*** / **F-PLT-PAY-COMP-*** | ATT/PAY Nest | alias only | Catalog công / lương peers | AC-PLT-ATT/PAY · OUT invent DONE |
| **F-CORE-CTR-TPL/PREV/VER** | `/contracts-insurance*` | alias only | Schema HĐ + freeze | CORE-09* · printable false |

**DENY:** invent new Nest `/core` controllers for these F-ids as primary SoT.

---

## 6. Failure modes & mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | BA invents Nest `/core` dual | Spec path `/core` as SoT · Dev opens CoreController | O4 DENY · QC Nest SoT 0 |
| A | Claim EMPCF/TOK/SI catalog = PLT DONE | Evidence footer missing ≠DONE | O9 · C-SLICE |
| A | Wipe CORE-10/09/07 | Diff touches sealed J-* | must_keep stamps · regression |
| A | Invent PAY/ATT DONE | AC claims payroll/attendance UAT | O8 OUT |
| B | Dual-write / mega-EAV | New tables + `/core` non-404 | **REJECT B** |
| C | Honesty flip / false DONE | Ready flags true without UF wave | **REJECT C** |

---

## 7. Implementation & validation plan

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + bus PASS_TO_PM |
| 2. BA O1–O12 AC pack + mint J-HRM-PLT-01-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data HOLD default (RETAIN tables) | ba-data | HOLD unless closable gap |
| 4. sa API F.1 cite RETAIN | sa | API-01 delta only if gap |
| 5. FE residual wire-only if BA proves | dev-fe | READY_FOR_QA |
| 6. QA U65 J-HRM-PLT-01-* | qa | PASS_TO_PM |
| 7. QC GWC C-SLICE | qc | ≠ module PLT UAT · ≠ honesty flip |

**Rollback:** Docs-only seat — delete/supersede this Option if sponsor REJECT; **no** product code to roll back.  
**Success criteria:** Option A locked · BA unlocked · CORE-10/09/07 stamps untouched · Nest `/core` still DENY · honesty false · apps/** untouched.

---

## 8. must_keep / DENY checklist (copy into BA)

| Lock | Rule |
|------|------|
| CORE10QC1-MSLP0EJB | RETAIN · catalog/CRUD/LIVE≠CORE-10 DONE · BH≠CORE-07 · PAY-06 OUT |
| CORE09QC1-MSLNBA89 | RETAIN · printable **false** · ≠ CORE-09 DONE |
| CORE07QC1-KZJTSHNT | RETAIN · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE |
| soft≠CORE-06 DONE | RETAIN |
| Nest `/core` | **DENY** dual invent · paper alias only |
| PAY/ATT/printable/Word | **OUT invent DONE** |
| Honesty | **DENY** flip · **C-SLICE** |
| apps/** | **CẤM** until Option CONFIRMED (this seat already CONFIRMED for BA only — still **cấm** Dev until contracts) |
| Seed | **DENY** U65 |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Option **A** CONFIRMED for UC-BP-PLT-01: RETAIN LIVE Catalog + FormSchema instances + MergeToken (`/merge-tokens*`); paper `/core` alias only; F.1 outline cite F-PLT-TOK + peers; must_keep CORE-10/09/07; DENY Nest dual · invent PAY/ATT/printable · honesty flip · claim catalog=DONE; **no** `apps/**`. |
| **next_owner** | `ba-process` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PLT-01-CLUSTER-SA-01.md` |
| **next_dispatch_prompt** | see §10 |

---

## 10. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PLT-01-CLUSTER-BA-01
role: ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-24 seat #26)
entry_criteria: SA-01 Option A CONFIRMED @ docs/program/specs/PO-HRM-MVP-GD1-PLT-01-CLUSTER-SA-01.md · depends CORE10QC1-MSLP0EJB · must_keep CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PLT-01-CLUSTER-SA-01.md (Option A · O1–O12 · F.1 outline)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-PLT-01
  - docs/architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md (F-PLT-TOK-01..03)
exit_criteria:
  - BA AC pack O1–O12 CONFIRMED for UC-BP-PLT-01 three-layer (catalog · schema · merge)
  - Mint J-HRM-PLT-01-* DRAFT (U65 browser) spanning L1/L2/L3 — narrow · not full ATT/PAY module
  - Explicit ≠ PLT-01 DONE · ≠ catalog/CRUD/LIVE = CORE-10 DONE · ≠ CORE-09/07 DONE · printable false · C-SLICE
  - ba-data HOLD default · DENY Nest /core dual · DENY mega-EAV · DENY invent PAY/ATT/printable DONE · DENY seed · DENY apps/**
  - evidence: docs/program/specs/PO-HRM-MVP-GD1-PLT-01-CLUSTER-BA-01.md
  - ack_status PASS_TO_PM · next ba-data HOLD (or sa API if closable gap ONLY)
cấm: apps/** · seed · Nest /core invent · wipe CORE-10/09/07 · honesty flip · claim peer seals = PLT DONE
```

---

*End SA-01 · Option A LOCKED · 2026-08-09*
