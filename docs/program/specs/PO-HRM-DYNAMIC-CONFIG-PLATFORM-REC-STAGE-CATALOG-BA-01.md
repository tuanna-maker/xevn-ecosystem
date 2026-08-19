# BA AC/BR — REC stage catalog Option B · admin open N+1 vs consumer picker (Nest EFF ≠ empty)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01` **CONFIRMED** Option **B** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | ba-process |
| **lane** | governance |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — AC pack implementation-ready · ba-data **HOLD** (no EXPAND) · BE consumer-deepen **UNLOCK only for BA-listed gaps** · APP-02 assert **RETAIN** · FE EFF bind on CandidatesTab/Form/JobDialog **RETAIN (verify)** · kanban column SoT **GAP FE** · UV pool create assert **GAP BE** · IV allow soft-gate **GAP** (in-scope soft) · REC UAT / UX process / JD / IV one-active reopen **DENIED** |
| **change_mode** | **ADD** (deepen SA §7 · **no** wipe platform BA-01 / REC-VERTICAL / REC-QC-01/02 seals) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01.md) L-REC-STAGE-01..10 · §7 AC/VAL |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-rec-stage-catalog-sa-01.md`](../../qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-sa-01.md) |
| **ref_vertical** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md) **F-REC-CAT-STG/EFF** · **AC-PLT-REC-02..05** |
| **ref_platform_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) **BR-PLT-02/04/05/06** · REC §2.2 |
| **ref_peer_att** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md) **AC-PLT-ATT-LEAVE-01*** (named peer) |
| **ref_peer_pay** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md) **AC-PLT-PAY-01*** (named peer) |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **FR-UC-BP-REC-05 / 05a / 06 / 06a / 07** · JD **00a–00c OUT** |
| **ref_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §2.4a `rec_pipeline_stage` · §2.5 `application.stage` · §2.6 history |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · REC UX QC process / JD DnD / IV one-active **SEAL RETAIN** · REC-QC-01/02 **SEAL RETAIN** · EMP·DEC·PAY·ATT·EXT·CTR·LIST-TOTALS **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 · DENY module REC UAT |
| **Cấm** | `apps/**` · seed · ba-data second stage catalog table · Settings MD / starter-six = sole picker SoT · invent UAT / reopen UX process·JD·IV · reopen peer seals |

---

## 0. Process objective & actors

### Objective

Khóa **AC/BR đo được** cho Option **B** (SA LOCKED):

1. **Catalog admin** (`F-REC-CAT-STG-02`) = **open CREATE N+1** — mã slug HR đặt OK (**BR-PLT-05** · **AC-PLT-REC-02** · **AC-PLT-REC-STAGE-01d** · REC-QC-02 retain stamp `RECPLATQA2-MSIXNFE2`).
2. **Consumers** khi Nest/EFF **effective active count > 0** = **picker/FK only** từ **`GET /api/hrm/recruitment/pipeline-stages/effective`** (**F-REC-CAT-EFF-01**) — **cấm** Input free-text / Settings MD density / hardcode six làm SoT mã (**BR-PLT-02** · **AC-PLT-REC-STAGE-01** · **AC-PLT-REC-04**).
3. Invent unknown `to_stage` / `stage` → **4xx** **`HRM-REC-STAGE-UNKNOWN`** (**AC-PLT-REC-STAGE-01b** · **VAL-REC-CNS-01** · ≡ **AC-PLT-REC-04**).
4. Empty EFF → empty picker + VI / CTA admin; soft-allow starter display **chỉ** khi EFF=0; **cấm** seed/fake density (**AC-PLT-REC-STAGE-01c** · **L-REC-STAGE-04**).
5. **DENY** `recruitment_uat_ready` flip · REC UX QC process / JD DnD / IV one-active reopen · Settings-MD/six-only SoT · second stage table.

### Actors

| Actor | Role |
|-------|------|
| HCNS Settings — tab **Giai đoạn REC** | CRUD Nest `rec_pipeline_stage` (mở N+1) · retire soft · flags hire/IV allow |
| HCNS / QL tuyển — **Ứng viên** | Đổi trạng thái · tạo UV · kanban · hire gắn EMP |
| HCNS — **Phỏng vấn** (soft-gate) | Lịch PV chỉ khi stage hiện tại `allows_interview_schedule=true` (nếu flag in-scope) |
| Group CEO | Scope rollup `main` / member — cùng resolve list↔assert (**U19**) |
| System | Effective catalog · soft-delete hide · `HRM-REC-STAGE-UNKNOWN` · hiredOutcomeKey |
| SA / Dev-BE / Dev-FE / QA | F.1 cite · assert retain/deepen · picker source · U65 browser |

### Scope

| In (this seat) | Out |
|----------------|-----|
| AC-PLT-REC-STAGE-01 / 01b / 01c / 01d / 01H · VAL-REC-CNS-* · BR-PLT-REC-STAGE-* · surface matrix + UF/J-* click paths | Impl `apps/**` / migration / seed |
| Enumerate: APP-02 transition · UV initial stage · kanban · hire · IV allow soft-gate | Claim module REC UAT / flip `recruitment_uat_ready` |
| Cross-ref AC-PLT-REC-02..05 · peer ATT-LEAVE / PAY · SRS FR-UC-BP-REC-05..07 | Reopen REC UX QC process / JD DnD / IV one-active |
| ba-data **HOLD** (already physical · flags typed) | JD FormSchema · YCTD flags · REC-03 · eval template · WF ops map as SoT |
| Align AC-PLT-REC-04 ≡ invent rule stamped as **01b** browser | Wipe vertical AC-02..05 GWC |

---

## 1. As-is vs to-be

| | AS-IS | TO-BE (Option B) |
|---|-------|------------------|
| Code SoT | Nest `rec_pipeline_stage` + **F-REC-CAT-EFF-01** LIVE; Settings **Giai đoạn REC** + CandidatesTab/Form/JobDialog bind `useRecPipelineStagesEffective` when `catalogCount>0`; starter helpers remain soft-fallback | Code SoT = Nest via **F-REC-CAT-STG-01 / F-REC-CAT-EFF-01**; MD / six alone **REJECT** as picker SoT |
| Admin create | Settings open N+1 (**REC-QC-02** stamp `RECPLATQA2-MSIXNFE2`) | **Retain** open N+1 (**AC-PLT-REC-STAGE-01d** · **AC-PLT-REC-02**) — **≠** consumer free-text ban |
| APP-02 transition | BE `updateCandidateApplicationStage` / pool stage PATCH asserts ∈ EFF → `HRM-REC-STAGE-UNKNOWN` | Named pack **AC-PLT-REC-STAGE-01/01b** + browser U65; assert **RETAIN** |
| UV create initial `stage` | FE FormDialog picker EFF when >0; **BE `createCandidatePool` chưa assert** membership khi EFF>0 | **GAP BE** → **VAL-REC-CNS-02** deepen assert (same KEY) |
| Kanban columns | `Recruitment.tsx` **hardcode** six `{applied…rejected}` column ids | When EFF>0 columns/picker SoT = EFF keys (**GAP FE** · **VAL-REC-CNS-04**) |
| Hire | `hiredOutcomeKey` from EFF · hire dialog · F-REC-HIRE-01 | **RETAIN** AC-PLT-REC-05 · spot in pack |
| IV allow flag | Column + Settings toggle LIVE; **consumer schedule chưa soft-gate** | **IN-SCOPE soft** · **VAL-REC-CNS-05** deepen FE/BE — **≠** reopen IV one-active core |
| Honesty | Slice GWC risk misread module GO | `recruitment_uat_ready=false` · **`C-SLICE-≠-MODULE`** · UX/JD/IV seals retain |

---

## 2. Platform locks (reuse)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-02** | Nest/EFF active **>0** | Consumer SoT = picker/FK `stage`/`to_stage` ∈ effective | Free-text invent → **4xx** `HRM-REC-STAGE-UNKNOWN` |
| **BR-PLT-04** | Retire / `archived_at` | Soft-delete | Picker default ẩn; history `from_stage`/`to_stage` + past stage còn key (**AC-PLT-REC-03**) |
| **BR-PLT-05** | Admin CREATE | Open slug N+1 · format/UQ only | **FORBIDDEN** ceiling / «must pick existing only» on **F-REC-CAT-STG-02** |
| **BR-PLT-06** | Dual SoT | Tenant Nest writer = SoT; WF `wf_task_type_key` = ops map | **FORBIDDEN** dual master write / MD/six sole SoT |
| **L-REC-STAGE-01** | Admin path vs consumer path | Split AC/VAL | Mis-apply invent ban lên admin = **FAIL process** |
| **L-REC-STAGE-02** | Picker SoT | Nest F-REC-CAT-EFF-01 | Settings MD / starter-six alone **REJECT** |
| **L-REC-STAGE-04** | Active count =0 | Empty picker + VI / CTA admin; soft-allow starter display only | **FORBIDDEN** fake/seed density UF |
| **L-REC-STAGE-06** | Scope | list ↔ get-by-id ↔ consumer assert | Same `resolveHrmListScope` (**U19**) |
| **L-REC-STAGE-07** | Invent KEY | Membership check | Format-only **không** bypass |
| **L-REC-STAGE-08..10** | Ops OUT / seals / honesty | OUT / RETAIN / false | See §8 |

---

## 3. REC stage-specific business rules

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-REC-STAGE-01** | Surface = **catalog admin** (`POST/PUT` F-REC-CAT-STG-02) | Cho phép mã mới hợp lệ slug (N+1) | **2xx/201** · list + F5 còn — **không** yêu cầu «đã có trong picker» |
| **BR-PLT-REC-STAGE-02** | Surface ∈ **consumer set** (§4) **và** EFF active **>0** | Body/field `stage` / `to_stage` **phải** ∈ effective active (default picker) | Ngoài set → **`HRM-REC-STAGE-UNKNOWN`** — format-only **không** bypass |
| **BR-PLT-REC-STAGE-03** | EFF active **=0** trên consumer | Empty picker + VI/CTA «Cài đặt → Giai đoạn REC»; soft-allow starter **display** only; **không** bắt buộc invent | Seed/fake rows để pass UF = **FAIL U65** |
| **BR-PLT-REC-STAGE-04** | Settings MD / starter-six hardcode | Allowed **label/color fallback** / empty soft-allow | **FORBIDDEN** sole SoT cho consumer picker / kanban columns when EFF >0 |
| **BR-PLT-REC-STAGE-05** | **FR-UC-BP-REC-05** APP-02 transition | PATCH/Select `to_stage` ∈ EFF; history append-only | Invent → **4xx** · **cấm** 2xx orphan |
| **BR-PLT-REC-STAGE-06** | **FR-UC-BP-REC-05a** UV create/update initial stage | Form picker EFF; **BE create/update pool** assert ∈ EFF when >0 | Invent initial stage → **UNKNOWN** |
| **BR-PLT-REC-STAGE-07** | Kanban / funnel columns | When EFF >0: column ids / move target ∈ EFF (display-ready) | Hardcode-six-only columns hiding N+1 keys = **FAIL** AC-PLT-REC-STAGE-01 |
| **BR-PLT-REC-STAGE-08** | **FR-UC-BP-REC-07** hire | Target = `is_hired_outcome` / `hiredOutcomeKey` ∈ EFF · EMP soft-link | Break hire spine = FAIL must_keep (**AC-PLT-REC-05**) |
| **BR-PLT-REC-STAGE-09** | **FR-UC-BP-REC-06a** IV schedule soft-gate | If application.current stage has `allows_interview_schedule=false` → block schedule (deterministic 4xx / FE disable) | **≠** invent reopen IV one-active lifecycle core |
| **BR-PLT-REC-STAGE-10** | ba-data | `public.rec_pipeline_stage` đã physical (flags typed) | **HOLD** — **FORBIDDEN** second catalog table (**no EXPAND** this seat) |

**Align (no conflict):**

| Vertical / peer | This pack |
|-----------------|-----------|
| **AC-PLT-REC-02** admin create → F5 → picker | **RETAIN** · stamped as **AC-PLT-REC-STAGE-01d** (admin open) |
| **AC-PLT-REC-03** retire hide · history | **RETAIN** · must_keep |
| **AC-PLT-REC-04** invent 4xx when catalog >0 | **≡ AC-PLT-REC-STAGE-01b** browser + **VAL-REC-CNS-01** (L1+browser SEAL retain; deepen gaps only) |
| **AC-PLT-REC-05** hire → hired-outcome · EMP | **RETAIN** · spot **AC-PLT-REC-STAGE-07** |
| **AC-PLT-ATT-LEAVE-01*** / **AC-PLT-PAY-01*** | Named peer pattern (admin open ≠ consumer picker Nest SoT) |

**SUPERSEDED / FORBIDDEN:** Option A Settings-MD / starter-six-only picker SoT · invent `recruitment_uat_ready=true` · reopen REC UX QC process / JD DnD / IV one-active · claim module REC UAT · hard-delete stage còn history · fold JD FormSchema / YCTD flags / REC-03 into this pack.

---

## 4. Consumer surface inventory (authoritative)

> **Admin ≠ consumer.** Mọi AC «picker khi EFF ≠ empty» áp **consumer rows** dưới đây — **không** áp lên F-REC-CAT-STG-02.

| Surf ID | Surface (product) | Route / UI anchor (AS-IS) | Field SoT | Mutate / bind path | FE bind source (AS-IS) | Class | SRS |
|---------|-------------------|--------------------------|-----------|-------------------|------------------------|-------|-----|
| **S-REC-ADM-01** | Nest pipeline-stage **admin** create/edit/retire | Settings → tab **Giai đoạn REC** (`RecPipelineStageSettingsPanel` · `settings-tab-rec-pipeline-stages`) | `stage_key` open N+1 | **F-REC-CAT-STG-02** | Admin Nest list (not consumer picker) | **ADMIN** | AC-PLT-REC-02 |
| **S-REC-CNS-01** | **Ứng viên — Đổi trạng thái** (APP-02) | `/hr/recruitment` → **Ứng viên** (`CandidatesTab`) stage Select · `JobCandidatesDialog` | `to_stage` / `stage` | PATCH pool/app stage · assert ∈ EFF | **EFF** when `catalogCount>0` via `useRecPipelineStagesEffective`; starter soft-allow when =0 | **CONSUMER** (primary) | **FR-UC-BP-REC-05** |
| **S-REC-CNS-02** | **Thêm / sửa UV — giai đoạn ban đầu** | `CandidateFormDialog` create/edit | `stage` initial | POST/PATCH candidates pool · **must** assert ∈ EFF when >0 | **EFF** picker when >0; starter soft-allow when =0 | **CONSUMER** | **FR-UC-BP-REC-05a** |
| **S-REC-CNS-03** | **Kanban / cột giai đoạn** | `Recruitment.tsx` board columns + drag/move → same transition TXN | Column id / move `to_stage` | Move → PATCH stage (CNS-01 TXN) | **AS-IS hardcode six** column list — **GAP** vs EFF when >0 | **CONSUMER** (display+move) | **FR-UC-BP-REC-05** |
| **S-REC-CNS-04** | **Hire / accept offer** | Hire dialog `rec-hire-employee-link-dialog-precision` · hired-outcome key | Hired-outcome `stage` | F-REC-HIRE-01 + stage assert | `hiredOutcomeKey` from **EFF** | **CONSUMER** | **FR-UC-BP-REC-07** |
| **S-REC-CNS-05** | **IV schedule soft-gate** | Interviews / Schedule dialog · current application stage flag | Gate on `allows_interview_schedule` of **current** stage ∈ EFF | Soft-block schedule when false | Flag on catalog row; **consumer gate AS-IS missing** | **CONSUMER-SOFT** (in-scope) | **FR-UC-BP-REC-06a** |
| **S-REC-REF-01** | Starter-six / MD label helpers | `getStageOptions` · `REC_PIPELINE_STAGE_STARTER_KEYS` · labelMaps | Label/color only | — | Allowed fallback **only** when EFF=0 or unknown historical key display | **REF only** — **not** picker SoT when EFF>0 | Dual SoT BR-PLT-06 |
| **S-REC-OUT-01** | JD FormSchema DnD · IV one-active core · YCTD flags · REC-03 | JD / IV / YCTD tabs | — | — | — | **OUT** · **SEAL RETAIN** | L-REC-STAGE-08 |
| **S-REC-OUT-02** | WF task-type codes / canvas ops map | XBOS WF | — | — | — | **OUT** ops ≠ SoT | L-REC-STAGE-03 |

**Pointer:** Funnel charts / reports / `CandidateDetailView` static label maps = **display** for known keys — **FAIL** only if used as **sole mutate/column SoT** excluding EFF N+1 keys (**VAL-REC-CNS-04**).

---

## 5. Use-case catalog (process)

| UC ID | Name | Happy | Alternate | Exception |
|-------|------|-------|-----------|-----------|
| **UC-PLT-REC-STAGE-01** | Admin — CREATE Nest stage N+1 | Settings Giai đoạn REC → mã mới hợp lệ → Lưu **2xx** → list có row → **F5** còn → UV picker thấy mã | Sửa label/flags hire/IV | Format invalid · UQ · hired-dup · scope 409 · «must pick only» sai áp |
| **UC-PLT-REC-STAGE-02** | Consumer — APP-02 pick EFF | EFF ≥1 → Ứng viên → Select Network GET `…/pipeline-stages/effective` → chọn mã → PATCH **2xx** → F5 stage ∈ catalog | WF-locked → 409 class | Free-text SoT · MD/six-only SoT · invent → **4xx** `HRM-REC-STAGE-UNKNOWN` |
| **UC-PLT-REC-STAGE-03** | UV create initial stage | Thêm UV → picker stage ∈ EFF → POST **2xx** · F5 | Update UV stage field | Invent initial → **UNKNOWN** (BE gap close) |
| **UC-PLT-REC-STAGE-04** | Kanban move / columns | EFF ≥1 → board columns = EFF (hoặc union display-ready) → kéo/chọn cột ∈ EFF → cùng APP-02 assert | Empty EFF soft-allow starter columns | Six-only columns hide N+1 · invent move 2xx |
| **UC-PLT-REC-STAGE-05** | Hire outcome | Chọn hired-outcome ∈ EFF → dialog EMP → PATCH **2xx** soft-link | Missing EMP → hire 400 class | Break hire spine / invent UAT |
| **UC-PLT-REC-STAGE-06** | IV soft-gate | Stage `allows_interview_schedule=false` → schedule disabled / 4xx; `true` → schedule OK (one-active **RETAIN**) | Admin toggles flag on Settings | Reopen IV one-active as wipe · invent schedule bypass |
| **UC-PLT-REC-STAGE-07** | Empty EFF | Active=0 → picker empty/soft-starter + CTA admin; admin vẫn CREATE | — | Seed fake density / MD-only green |
| **UC-PLT-REC-STAGE-08** | Scope parity | List EFF scope X = assert mutate scope X | Member 409 OOS | Drift list vs assert |

```mermaid
sequenceDiagram
  autonumber
  actor Admin as HCNS catalog admin
  actor HR as HCNS/QL tuyển
  participant Nest as Nest rec_pipeline_stage
  participant Eff as F-REC-CAT-EFF-01
  participant Cons as APP-02 / UV / kanban / hire / IV soft

  Admin->>Nest: POST/PUT F-REC-CAT-STG-02 stage_key N+1 (open)
  alt Ceiling / must-pick-only sai áp admin
    Nest-->>Admin: FAIL — vi phạm BR-PLT-05 / L-REC-STAGE-01
  else 2xx
    Nest-->>Admin: Row active; F5 còn
  end
  HR->>Eff: GET pipeline-stages/effective (picker SoT)
  alt Active count = 0
    Eff-->>HR: Empty / soft-starter display + CTA admin; cấm seed
  else Active count > 0
    HR->>Cons: Pick stage ∈ EFF (transition / create / kanban / hire)
    alt stage invent / OOS
      Cons-->>HR: 4xx HRM-REC-STAGE-UNKNOWN
    else OK
      Cons-->>HR: 2xx; F5 stage ∈ catalog
    end
    opt IV soft-gate (S-REC-CNS-05)
      Note over Cons: allows_interview_schedule on current stage
    end
  end
  Note over Cons: REC UX process / JD / IV one-active / recruitment_uat OUT
```

---

## 6. Acceptance criteria (measurable · U65)

> Browser-only khi surface FE tồn tại · zero-seed · FE sau 2xx/4xx quan sát được + **F5** · probe/API **không** 🟢 UF.  
> Honesty flags **giữ false**.  
> **Không** wipe sealed REC-QC / UX process / JD / IV / EMP·DEC·PAY·ATT·EXT·CTR·LIST-TOTALS.

### 6.1 Core AC pack (SA §7)

| ID | Surface | Đạt khi | Không đạt khi |
|----|---------|---------|----------------|
| **AC-PLT-REC-STAGE-01** | **S-REC-CNS-01** (primary) | EFF active **≥1** (từ admin — **không** seed): `/hr/recruitment` → **Ứng viên** → đổi trạng thái → UI = **picker** nguồn **Network GET** `/api/hrm/recruitment/pipeline-stages/effective` → chọn mã Nest/EFF → PATCH **2xx** → list/chip đúng stage → **F5** còn ∈ catalog | Free-text Input là SoT · picker chỉ Settings MD / hardcode six · 2xx với mã không ∈ EFF · chỉ API PASS |
| **AC-PLT-REC-STAGE-01b** | **S-REC-CNS-01** invent | EFF **≥1**: cố ý nhập/PATCH `to_stage`/`stage` **không** ∈ effective → FE chặn và/hoặc Network **4xx** **`HRM-REC-STAGE-UNKNOWN`** → **không** persist sau F5 | 2xx invent · silent accept · format-only bypass · claim conflict với **AC-PLT-REC-04** |
| **AC-PLT-REC-STAGE-01c** | **S-REC-CNS-01** khi EFF **=0** | Picker **empty** hoặc soft-allow starter **display** + VI/CTA Settings **Giai đoạn REC**; **không** fake density chỉ để pass UF; admin **S-REC-ADM-01** vẫn CREATE được | Seed/script density · claim Nest SoT khi EFF=0 via MD alone |
| **AC-PLT-REC-STAGE-01d** | **S-REC-ADM-01** | Catalog admin CREATE mã **#N+1** (slug hợp lệ) → Network **2xx** `F-REC-CAT-STG-02` → list có row → **F5** còn → consumer picker thấy mã — **không** reject «must pick existing only» · **REC-QC-02 RETAIN** | Áp invent ban lên admin · ceiling starter six · reopen REC-QC-02 as wipe |
| **AC-PLT-REC-STAGE-01H** | Honesty / seals | Evidence ghi rõ: `recruitment_uat_ready=false` · `jd_dynamic_done=false` · REC UX QC process / JD DnD / IV one-active **SEAL RETAIN** · REC-QC-01/02 · EMP·DEC·PAY·ATT·EXT·CTR·LIST-TOTALS **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 zero-seed · DENY module REC UAT | Flip ready · reopen process/JD/IV · reopen peer seals · claim module REC UAT / Phase1 |

### 6.2 Surface deepen AC (same pack · SRS enumerate)

| ID | Surface | Đạt khi | Không đạt khi |
|----|---------|---------|----------------|
| **AC-PLT-REC-STAGE-05a** | **S-REC-CNS-02** | Thêm UV → stage Select nguồn **EFF** (khi >0) → Lưu **2xx** → list + **F5** stage ∈ catalog; invent → **01b** | Free-text SoT · BE accept invent pool create |
| **AC-PLT-REC-STAGE-05k** | **S-REC-CNS-03** | EFF ≥1: kanban/cột hiển thị (và cho phép move tới) key ∈ EFF gồm N+1; move = APP-02 assert | Six-hardcode-only columns · N+1 invisible · invent move 2xx |
| **AC-PLT-REC-STAGE-07** | **S-REC-CNS-04** | Hired-outcome ∈ EFF → hire dialog → EMP soft-link **2xx** · **AC-PLT-REC-05 RETAIN** | Break hire / invent EMP UAT |
| **AC-PLT-REC-STAGE-06a** | **S-REC-CNS-05** | Stage flag `allows_interview_schedule=false` → không mở/gửi lịch PV (FE disable và/hoặc 4xx); `true` → được schedule; IV one-active **unchanged** | Silent schedule khi flag false · reopen IV one-active core |

### 6.3 Consumer VAL (BE/QA measurable)

| ID | Surface | Input | Expect | AC / BR | BA gap stamp |
|----|---------|-------|--------|---------|--------------|
| **VAL-REC-CNS-01** | APP-02 / pool stage **S-REC-CNS-01** | `to_stage` OOS khi EFF >0 | **4xx** `HRM-REC-STAGE-UNKNOWN` | AC-PLT-REC-STAGE-01b · AC-PLT-REC-04 · BR-PLT-REC-STAGE-02 | **RETAIN** existing BE assert + jest APP-02 wire / VAL-REC-STG-12 — **no mandatory CNS-BE** unless regression FAIL |
| **VAL-REC-CNS-02** | UV create/update initial **S-REC-CNS-02** | `stage` invent on POST pool / update when EFF >0 | **4xx** UNKNOWN **hoặc** picker-only (no invent UI) | BR-PLT-REC-STAGE-06 · AC-PLT-REC-STAGE-05a | **GAP BE** — `createCandidatePool` (và update pool stage path nếu thiếu) **must** call `assertStageInEffectiveCatalog` when EFF>0 · unlock **CNS-BE** |
| **VAL-REC-CNS-03** | Scope | List EFF scope ≠ assert mutate scope | jest **FAIL** scope_parity · runtime 409/4xx deterministic | L-REC-STAGE-06 · U19 | **RETAIN** REC scope specs; deepen only if FAIL |
| **VAL-REC-CNS-04** | Kanban / MD/six-only SoT | FE columns/picker bind hardcode six **without** EFF when EFF >0 | **FAIL** AC-PLT-REC-STAGE-01 / 05k | L-REC-STAGE-02 · BR-PLT-REC-STAGE-04/07 | **GAP FE** — rebind `Recruitment.tsx` columns (và mọi column SoT) to EFF when >0; soft-allow six **only** when EFF=0 |
| **VAL-REC-CNS-05** | IV soft-gate **S-REC-CNS-05** | Schedule when current stage `allows_interview_schedule=false` | FE block và/hoặc **4xx** deterministic (code riêng ≠ UNKNOWN) | BR-PLT-REC-STAGE-09 · AC-PLT-REC-STAGE-06a | **GAP FE (+ optional BE)** — soft-gate only; **FORBIDDEN** reopen IV one-active |
| **VAL-REC-CNS-06** | Retire | Transition/create với mã retired (default picker) | Reject / not in default picker; history còn | BR-PLT-04 · AC-PLT-REC-03 | **RETAIN** |
| **VAL-REC-STG-*** | Admin **S-REC-ADM-01** | Code N+1 / format / UQ / hired flags | Per REC-DATA/BE VAL | AC-PLT-REC-STAGE-01d · BR-PLT-05 | **RETAIN** REC-QC |

### 6.4 must_keep / regression pointers (không AC mới)

| Pointer | Pass | Fail |
|---------|------|------|
| **MK-REC-QC-01** | REC-QC-01 L1 GWC retained | Reopen/wipe L1 |
| **MK-REC-QC-02** | REC-QC-02 browser AC-PLT-REC-02..05 stamp `RECPLATQA2-MSIXNFE2` retained | Reopen as wipe |
| **MK-REC-UX-01** | `po-hrm-rec-ux-qc-process-01` process NO-GO **SEAL RETAIN** | Reopen without warrant |
| **MK-REC-JD-01** | JD FormSchema DnD / `jd_dynamic_done=false` retained | Fold into stage AC / flip jd_dynamic |
| **MK-REC-IV-01** | IV one-active core retained | Reopen as wipe to «pass» soft-gate |
| **MK-REC-EFF-01** | CandidatesTab / FormDialog / JobDialog EFF path retained when Network = EFF | Force MD/six-only SoT |
| **MK-REC-HIRE-01** | Hire→EMP spine / AC-PLT-REC-05 retained | Break soft-link |
| **MK-SEAL-PEER-01** | EMP · DEC · PAY · ATT · EXT · CTR · LIST-TOTALS seals retain | Reopen peer seals |
| **MK-OPS-WF-01** | WF task-type ops map — not second SoT | Treat WF codes as stage catalog SoT |

### 6.5 Journey / UF map (QA + ba-docs) — exact click paths

| ID | Click path (U65) | Maps AC | FE bind expect | Notes |
|----|------------------|---------|----------------|-------|
| **UF-REC-STAGE-ADM-01** | Login `ceo@xe.vn` → **Cài đặt** → tab **Giai đoạn REC** (`settings-tab-rec-pipeline-stages`) → nhập `stage_key` N+1 → **Tạo/Lưu** → Network 2xx → **F5** → row còn | **01d** · AC-PLT-REC-02 | Admin Nest CRUD | REC-QC-02 path **RETAIN** — retest spot OK, cấm wipe |
| **UF-REC-STAGE-CNS-01** | Sau ADM (hoặc EFF đã ≥1): **Tuyển dụng** → **Ứng viên** → mở stage Select trên row → DevTools **GET** `…/pipeline-stages/effective` → chọn mã Nest → PATCH **2xx** → chip/list đúng → **F5** | **01** | **EFF** (`useRecPipelineStagesEffective`) | Primary consumer |
| **UF-REC-STAGE-CNS-01b** | EFF ≥1: ép PATCH/`to_stage` mã lạ (DevTools rewrite hoặc UI bypass) → **400** `HRM-REC-STAGE-UNKNOWN` · F5 không đổi sang mã lạ | **01b** · AC-PLT-REC-04 | EFF assert BE | Align vertical invent |
| **UF-REC-STAGE-CNS-01c** | Tenant/scope EFF active =0 (không seed): picker empty/soft-starter + CTA Settings; admin vẫn CREATE được | **01c** | Soft-allow starter **only** if EFF=0 | U65 |
| **UF-REC-STAGE-CNS-02** | **Ứng viên** → **Thêm** (`CandidateFormDialog`) → SELECT stage ∈ EFF → gắn YCTD nếu spine → Lưu **2xx** → list + **F5**; invent stage → 4xx | **05a** · VAL-REC-CNS-02 | EFF picker | Cross **J-HRM-REC-UV-01** RETAIN (YCTD) — **không** reopen as UAT |
| **UF-REC-STAGE-CNS-03** | Board/kanban: cột hiện key EFF (gồm N+1) → move card sang cột ∈ EFF → PATCH 2xx; move invent → 4xx | **05k** · VAL-REC-CNS-04 | **Must** EFF columns when >0 | AS-IS hardcode = **FAIL until FE** |
| **UF-REC-STAGE-CNS-04** | Chọn hired-outcome ∈ EFF → Hire dialog → chọn EMP → PATCH **2xx** soft-link → F5 | **07** · AC-PLT-REC-05 | `hiredOutcomeKey` from EFF | must_keep |
| **UF-REC-STAGE-CNS-05** | Settings tắt `allows_interview_schedule` trên stage hiện tại → F5 → Ứng viên/IV → mở Schedule → **blocked**; bật lại → schedule OK (one-active rules unchanged) | **06a** · VAL-REC-CNS-05 | Flag from EFF/catalog row | Soft-gate only |
| **Proposed `J-HRM-REC-STAGE-CAT-01`** | ADM CREATE N+1 → F5 → UV picker thấy mã (**01d**→**01**) | Pack core | EFF | ba-docs ADD after CONFIRM / QA stamp |
| **Proposed `J-HRM-REC-STAGE-CAT-02`** | Invent transition → 4xx UNKNOWN (**01b**) | Align AC-PLT-REC-04 | — | |
| **Proposed `J-HRM-REC-STAGE-CAT-03`** | EFF=0 empty/soft + admin CREATE (**01c**) | | | |
| **Proposed `J-HRM-REC-STAGE-CAT-04`** | UV create stage ∈ EFF + kanban N+1 visible + hire spot | Deepen | | |
| Reuse | **J-HRM-05** · **J-HRM-REC-UV-01** · **J-HRM-JD-YCTD-01** · **J-REC-WF-*** | List→detail / YCTD / WF | — | **RETAIN**; **cấm** reopen / claim `recruitment_uat_ready` |
| Matrix | **UF-HRM-12** (requisition) · **UF-HRM-MENU-06** | Adjacent | — | **RETAIN** — **≠** this stage SoT AC |

**Persona:** Group CEO `ceo@xe.vn` (rollup `companyId=main`) + member HCNS khi test scope 409 — AC ghi rõ scope expect.

**HDSD ids (from REC-QA-02 — reuse):** `settings-tab-rec-pipeline-stages` · `settings-rec-pipeline-stages` · `hdsd-rec-pipeline-stage-key|name|save|reload|retire-*` · `hdsd-rec-pipeline-stage-hired-outcome` · stage Select Ứng viên · `rec-hire-employee-link-dialog-precision`.

---

## 7. Error taxonomy (deterministic)

| Code | When | HTTP | FE |
|------|------|------|-----|
| **`HRM-REC-STAGE-UNKNOWN`** | Consumer invent / OOS `stage`/`to_stage` khi EFF active >0 | **4xx** (400 class) | Banner/field VI — không toast success |
| `HRM-PLT-CAT-CODE-INVALID` | Admin format only | 4xx | Admin form |
| `HRM-PLT-CAT-CODE-CONFLICT` / `HRM-REC-STG-HIRED-DUP` | Admin UQ / hired-outcome conflict | 4xx | Admin form |
| Hire codes (`HRM-REC-HIRE-400/409`…) | Hire spine | 4xx/409 | **≠** invent KEY — keep separate |
| IV soft-gate (new or existing) | Schedule khi `allows_interview_schedule=false` | 4xx class **hoặc** FE-only disable | **≠** UNKNOWN · **≠** one-active reopen |
| `HRM-REC-WF-LOCKED` | WF lock transition | 409 | Honest banner |
| Scope mismatch | Consumer assert company ≠ token scope | 409 class | Honest empty/banner |

**Cấm:** 2xx + orphan stage; 500 trên invent; FE format-pass bỏ qua membership; nhầm hire/IV codes với UNKNOWN.

---

## 8. Honesty / non-claims / seals

| Flag / seal | Rule |
|-------------|------|
| `recruitment_uat_ready` | **false** — **DENIED** flip |
| `jd_dynamic_done` | **false** — retained |
| REC UX QC process / JD DnD / IV one-active | **SEAL RETAIN** — **DENIED** reopen |
| Module REC UAT / Phase1 | **DENIED** — slice AC ≠ module GO |
| `payroll_e2e_ready` / printable / personnel / attendance | **Unchanged false** — out of seat |
| REC-QC-01 · REC-QC-02 · EMP · DEC · PAY · ATT · EXT · CTR · LIST-TOTALS | **SEAL RETAIN** |
| `C-SLICE-≠-MODULE` | Stage catalog AC pack ≠ module REC UAT |
| Seed | **DENIED** (U65) |
| ba-data | **HOLD** — **no EXPAND** (columns incl. `allows_interview_schedule` already typed) |

---

## 9. DOC-DELTA flag (optional ba-docs)

| Flag | Need? | Note |
|------|-------|------|
| Client SRS admin vs consumer wording | **OPTIONAL** | FR-UC-BP-REC-05/05a đã «danh mục pipeline đơn vị»; ADD-only sentence «SoT = Nest `rec_pipeline_stage` / effective; starter-six / MD ≠ sole SoT» **if** sponsor ambiguity — **không** wipe 7-mục FR |
| Journey rows J-HRM-REC-STAGE-CAT-* | **OPTIONAL** after QA stamp | Map §6.5 |
| ba-data EXPAND | **NO** | Physical exists · **no column gap proven** |

---

## 10. Handoff expectations

| Role | Expect | Done when |
|------|--------|-----------|
| **pm** | Seal BA CONFIRMED · unlock **dev-be** (CNS gaps) + **dev-fe** (kanban + IV soft) **trước** QA full; hoặc QA spot RETAIN surfaces song song | Bus DISPATCHED |
| **dev-be** | **RETAIN** APP-02 / pool stage assert; **ADD** `assertStageInEffectiveCatalog` on **createCandidatePool** (+ update pool stage if missing) · optional IV soft-gate assert; jest VAL-REC-CNS-02 | READY_FOR_QA |
| **dev-fe** | **RETAIN** CandidatesTab/Form/JobDialog EFF bind if Network proves; **rebind** kanban columns `Recruitment.tsx` to EFF when >0; **ADD** IV schedule soft-gate UX | READY_FOR_QA |
| **qa** | U65 AC-PLT-REC-STAGE-01/01b/01c/01d/01H (+ 05a/05k/07/06a) · zero-seed · no UAT flip · seals untouched | PASS_TO_PM / FAIL |
| **qc** | Slice GWC only · honesty false · seals retain | GWC ≠ module GO |
| **ba-data** | **HOLD** | No Task unless EXPAND reopen (none flagged) |
| **ba-docs** | Optional DOC-DELTA / journey §9 | After PM if flagged |

---

## 11. Open risks / clarifications

| # | Item | Disposition |
|---|------|-------------|
| R1 | Starter helpers (`getStageOptions`, `REC_PIPELINE_STAGE_STARTER_KEYS`) vẫn trong FE | Allowed empty soft-allow / label fallback; **must not** drive picker/column SoT when EFF >0 (**VAL-REC-CNS-04**) |
| R2 | `createCandidatePool` thiếu assert | **GAP BE** stamped — unlock CNS-BE |
| R3 | Kanban hardcode six | **GAP FE** stamped — unlock FE |
| R4 | IV soft-gate chưa wire consumer | **IN-SCOPE soft** GAP — không reopen IV one-active; có thể ship sau CNS-01 nếu PM tách wave |
| Q1 | Exact IV soft-gate error code | Dev-BE chọn deterministic code (≠ UNKNOWN) · document in QA evidence |

**Unresolved needing sponsor:** none for Option B AC — architecture LOCKED by SA.

---

## 12. Completion

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **ba-data** | **HOLD** (no EXPAND) |
| **BE** | APP-02 assert **RETAIN** · deepen **VAL-REC-CNS-02** (+ optional **05**) after this CONFIRMED |
| **FE** | EFF bind CNS-01/02 **RETAIN verify** · kanban **GAP** · IV soft **GAP** |
| **next_owner** | **pm** → **dev-be** (+ **dev-fe** parallel) then **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-ba-01.md` |
