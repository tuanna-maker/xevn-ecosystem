# BA AC/BR — SI insurers catalog Option B · admin open N+1 vs consumer picker (Nest EFF ≠ empty)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01` **CONFIRMED** Option **B** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | ba-process |
| **lane** | governance |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — AC pack implementation-ready · ba-data **UNLOCK** (parallel `…-SI-INSURER-CATALOG-DATA-01` · Nest **absent**) · BE **HOLD** until BA **+** DATA · FE Settings-MD picker **GAP** (rebind after Nest EFF) · policy MD assert **MIGRATE** to Nest EFF · optional records soft-key **MIGRATE** · printable / personnel invent **DENIED** · SI type L1 **SEAL RETAIN** (do not reopen) |
| **change_mode** | **ADD** (deepen SA §7 · **no** wipe platform BA-01 · peer SI-INS type BA · CTR legal-print · SI enrollment EMP-BE-02 · EMP/DEC/PAY/ATT/REC/EXT/LIST-TOTALS) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01.md) L-SI-INR-01..10 · §7 AC/VAL |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-si-insurer-catalog-sa-01.md`](../../qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-sa-01.md) |
| **ref_peer_si_type_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01.md) **AC-PLT-SI-INS-01*** — **SEAL RETAIN · do not reopen L1** |
| **ref_platform_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) **BR-PLT-02/04/05/06** |
| **ref_peer_att** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md) **AC-PLT-ATT-LEAVE-01*** (pattern) |
| **ref_peer_pay** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md) **AC-PLT-PAY-01*** (pattern) |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **FR-UC-BP-CORE-10** · E3 **AC-INS-02** (insurer soft-ref) · **AC-INS-01/03..05** retain |
| **ref_tech** | [`TECHSPEC_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/TECHSPEC_HRM_ENTERPRISE.md) · [`docs/hrm/TECHSPEC.md`](../../hrm/TECHSPEC.md) E-INS-DEPTH · `HRM-INS-INSURER-KEY` |
| **ref_api** | [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) **F-CORE-SI-01** · DOC-DELTA pointer **F-SI-CAT-INS-*** · type F-SI-CAT-TYP/EFF **cite OUT reopen** |
| **ref_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §3.6 / §3.6a type · policy `insurer_key` text soft · **no** `si_insurer` yet (**DATA EXPAND** §3.6b) · **FORBIDDEN** fold into §3.6a |
| **Honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · SI type L1 GWC **SEAL RETAIN** · CTR legal-print / SI enrollment **SEAL RETAIN** · EMP·DEC·PAY·ATT·REC·EXT·LIST-TOTALS **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 · **DENY** module SI/CTR UAT |
| **Cấm** | `apps/**` · seed · Settings MD `insurers` = sole picker SoT · fold into `si_insurance_type` · reopen SI-INS L1 · reopen CTR legal-print · invent printable/personnel · rewrite `employee_insurances` schema · BE before DATA CONFIRMED · Phase1 DONE |

---

## 0. Process objective & actors

### Objective

Khóa **AC/BR đo được** cho Option **B** (SA LOCKED):

1. **Catalog admin** (`F-SI-CAT-INS-02`) = **open CREATE N+1** — mã slug nhà bảo hiểm HR đặt OK (**BR-PLT-05** · **AC-PLT-SI-INSURER-01d**).
2. **Consumers** khi Nest/EFF **effective active count > 0** = **picker/FK only** từ **`GET /api/hrm/contracts-insurance/insurers/effective`** (**F-SI-CAT-INS-EFF-01**) — **cấm** Input free-text / Settings MD density làm SoT mã (**BR-PLT-02** · **AC-PLT-SI-INSURER-01**).
3. Invent unknown insurer key → **4xx** **`HRM-INS-INSURER-KEY`** (E3 retain; peer UNKNOWN class — optional alias `HRM-SI-INSURER-UNKNOWN` **without** breaking E3 matrix) (**AC-PLT-SI-INSURER-01b** · **VAL-SI-INR-CNS-***).
4. Empty EFF → empty picker + VI / CTA admin; **cấm** seed/fake density (**AC-PLT-SI-INSURER-01c** · **L-SI-INR-04**).
5. **DENY** Settings-MD-alone SoT · fold into SI type · reopen SI-INS L1 · CTR legal-print reopen · `contracts_printable_ready` / `hrm_personnel_uat_ready` invent · module SI/CTR UAT.
6. **Cross-ref** E3 **AC-INS-02** · **J-HRM-INS-E3-01** deepen **insurer** path — type SoT remain **separate sealed** (`HRM-INS-TYPE-KEY` ≠ `HRM-INS-INSURER-KEY`).

### Actors

| Actor | Role |
|-------|------|
| HCNS Settings — tab **Nhà BH / Insurers** (Nest admin) | CRUD Nest `si_insurer` (mở N+1) · retire soft |
| HCNS / C&B — **Bảo hiểm** policy master | Chọn `insurer_key` ∈ EFF · tạo/sửa policy (**AC-INS-02** / **J-HRM-INS-E3-01**) |
| HCNS — legacy **employee insurance records** (optional UF) | Tạo/sửa soft `insurer_key` ∈ EFF khi mutate path in-scope |
| Group CEO | Scope rollup `main` / member — cùng resolve list↔assert (**U19**) |
| System | Effective union (Nest wins vs group REF) · soft-delete hide · `HRM-INS-INSURER-KEY` |
| SA / ba-data / Dev-BE / Dev-FE / QA | F.1 · physical ADD · assert migrate · picker rebind · U65 |

### Scope

| In (this seat) | Out |
|----------------|-----|
| AC-PLT-SI-INSURER-01 / 01b / 01c / 01d / 01H · VAL-SI-INR-CNS-01..06 · BR-PLT-SI-INR-* · surface matrix + UF/J-* | Impl `apps/**` / migration / seed |
| Enumerate consumers: **policy `insurer_key`** · **optional records soft `insurer_key`** | Claim module SI/CTR UAT · flip printable/personnel |
| Cross-ref **AC-INS-02** · **J-HRM-INS-E3-01** (insurer deepen) · **FR-UC-BP-CORE-10** cite · peer SI type BA **RETAIN** | Fold into `si_insurance_type` · reopen SI-INS L1 · insurance **type** picker · enrollment `type` · rate-cfg type key · CTR print · SI-TL actions · ATT work-sites |
| ba-data **UNLOCK** pointer (Nest absent) | Rewrite enrollment ONE SoT schema · mega EAV · second type table |
| Align E3 invent insurer with **01b** (`HRM-INS-INSURER-KEY`) | Wipe EMP-BE-02 / CTR legal-print GWC / SI type L1 GWC |

---

## 1. As-is vs to-be

| | AS-IS | TO-BE (Option B) |
|---|-------|------------------|
| Code SoT | Settings MD partition **`insurers`** (+ aliases `insurance_providers` / `bhxh_providers`) via `settingsCatalogs.assertCodeInEffectiveCatalog`; **no** Nest `si_insurer` | Nest **`public.si_insurer`** via **F-SI-CAT-INS-01 / F-SI-CAT-INS-EFF-01**; MD = **group REF merge-read only** |
| Admin create | Settings Master Data items (open-ish) — **not** named Nest admin AC | Settings insurers tab / **F-SI-CAT-INS-02** open N+1 (**AC-PLT-SI-INSURER-01d**) |
| Policy consumer | `assertInsurerKey` → MD · `HRM-INS-INSURER-KEY` when MD ≠ empty; FE `catalogSearchPicker` Settings | Assert ∈ Nest EFF when count>0; FE Network **GET `…/insurers/effective`** |
| Records soft consumer | `createInsuranceRecord` / update call `assertInsurerKey` on optional `insurer_key` | When EFF>0 and key present: ∈ Nest EFF (**VAL-SI-INR-CNS-02**) — **optional UF** deepen |
| SI type Nest | L1 sealed F-SI-CAT-TYP/EFF · `HRM-INS-TYPE-KEY` | **SEPARATE SEAL RETAIN** — **FORBIDDEN** fold / reopen |
| Enrollment `type` | Nest type consumer (peer SI-INS BA) | **OUT** this pack — type SoT |
| Honesty | Risk flip printable/personnel / reopen CTR / reopen type L1 | Flags **false** · seals **RETAIN** · **`C-SLICE-≠-MODULE`** |

---

## 2. Platform locks (reuse)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-02** | Nest/EFF active **>0** | Consumer SoT = picker/FK insurer key ∈ effective | Free-text invent → **4xx** `HRM-INS-INSURER-KEY` |
| **BR-PLT-04** | Retire / `archived_at` | Soft-delete | Picker default ẩn; past policy/record keys còn (**history**) |
| **BR-PLT-05** | Admin CREATE | Open slug N+1 · format/UQ only | **FORBIDDEN** ceiling / «must pick existing only» on **F-SI-CAT-INS-02** |
| **BR-PLT-06** | Dual SoT | Nest tenant writer = SoT; Settings/XBOS `insurers` = REF merge-read; Nest wins collision | **FORBIDDEN** dual master write / MD sole SoT |
| **L-SI-INR-01** | Admin path vs consumer path | Split AC/VAL | Mis-apply invent ban lên admin = **FAIL process** |
| **L-SI-INR-02** | Picker SoT | Nest F-SI-CAT-INS-EFF-01 | Settings MD alone **REJECT** |
| **L-SI-INR-04** | Active count =0 | Empty picker + VI / CTA admin | **FORBIDDEN** fake/seed density UF |
| **L-SI-INR-06** | Scope | list ↔ get-by-id ↔ consumer assert | Same `resolveHrmListScope` (**U19**) |
| **L-SI-INR-07** | Invent KEY | Membership check | Format-only **không** bypass |
| **L-SI-INR-08..10** | Adjacent OUT / seals / honesty | OUT / RETAIN / false | See §8 |

---

## 3. SI insurers business rules

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-SI-INR-01** | Surface = **catalog admin** (`POST/PUT` F-SI-CAT-INS-02) | Cho phép mã mới hợp lệ slug (N+1) | **2xx/201** · list + F5 còn — **không** yêu cầu «đã có trong picker» |
| **BR-PLT-SI-INR-02** | Surface ∈ **consumer set** (§4) **và** EFF active **>0** | Body/field `insurer_key` **phải** ∈ effective active | Ngoài set → **`HRM-INS-INSURER-KEY`** — format-only **không** bypass |
| **BR-PLT-SI-INR-03** | EFF active **=0** trên consumer | Empty picker + VI/CTA «Cài đặt → Nhà BH»; **không** bắt buộc invent | Seed/fake rows để pass UF = **FAIL U65** |
| **BR-PLT-SI-INR-04** | Settings MD / REF `insurers` density | Merge-read into EFF only | **FORBIDDEN** sole SoT cho consumer picker |
| **BR-PLT-SI-INR-05** | **E3 AC-INS-02** · policy create/update | Picker Nest EFF · POST/PATCH `insurer_key` ∈ EFF | Invent → **4xx** KEY · **cấm** MD-only green khi Nest live |
| **BR-PLT-SI-INR-06** | Legacy **employee_insurance_records** create/update khi gửi `insurer_key` | Khi EFF>0: soft key ∈ EFF | Invent → **KEY** · **≠** enrollment `type` · **≠** rewrite enrollment SoT |
| **BR-PLT-SI-INR-07** | SI type Nest / enrollment type / rate-cfg type | Cite peer SI-INS BA | **OUT** this pack — **SEAL RETAIN** type L1 |
| **BR-PLT-SI-INR-08** | **F-CORE-SI-03** actions Đóng/Ngừng/Tạm hoãn | Lifecycle trên enrollment ONE SoT | **OUT** insurer catalog — **RETAIN** EMP-BE-02 · **AC-SI-TL** separate |
| **BR-PLT-SI-INR-09** | Retire còn FK history | Soft-delete; consumer **không** chọn retired trên create mới | History policy/record cũ vẫn đọc được key |
| **BR-PLT-SI-INR-10** | ba-data | Nest **absent** | **UNLOCK EXPAND** `public.si_insurer` — **FORBIDDEN** fold into `si_insurance_type` / second mega catalog / rewrite `employee_insurances` |

**Align (no conflict):**

| Vertical / peer / E3 | This pack |
|----------------------|-----------|
| **AC-INS-01** policy CRUD/SM | **RETAIN** · insurer field SoT deepen via **AC-PLT-SI-INSURER-01** |
| **AC-INS-02** insurer picker | **≡ deepen** to Nest EFF · invent ≡ **01b** `HRM-INS-INSURER-KEY` |
| **AC-INS-03** insurance type picker | **OUT** this pack — peer SI-INS BA / type L1 **SEAL** · KEY `HRM-INS-TYPE-KEY` |
| **AC-INS-04/05** participant / end | **RETAIN** — not insurer catalog |
| **AC-PLT-SI-INS-01*** | Peer type catalog — **SEAL RETAIN · do not reopen L1** |
| **AC-SI-TL-01..06** | Lifecycle OUT fold · must_keep separate |
| **AC-PLT-ATT-LEAVE-01*** / **AC-PLT-PAY-01*** / EMP·DEC | Named peer pattern (admin open ≠ consumer picker Nest SoT) |

**SUPERSEDED / FORBIDDEN:** Option A Settings-MD-only picker SoT · invent `contracts_printable_ready=true` / `hrm_personnel_uat_ready=true` · reopen CTR legal-print GWC · reopen SI-INS L1 · fold insurers into `si_insurance_type` · claim module SI/CTR UAT · hard-delete insurer còn history · rewrite enrollment schema.

---

## 4. Consumer surface inventory (authoritative)

> **Admin ≠ consumer.** Mọi AC «picker khi EFF ≠ empty» áp **consumer rows** dưới đây — **không** áp lên F-SI-CAT-INS-02.

| Surf ID | Surface (product) | Route / UI anchor (AS-IS → TO-BE) | Field SoT | Mutate / bind path | Class | SRS / AC |
|---------|-------------------|----------------------------------|-----------|-------------------|-------|----------|
| **S-SI-INR-ADM-01** | Nest insurers **admin** create/edit/retire | Settings → tab **Nhà BH / Insurers** (Nest panel — **ADD** after DATA/BE) · API Nest | `insurer_key` open N+1 | **F-SI-CAT-INS-02** | **ADMIN** | Catalog (01d) |
| **S-SI-INR-CNS-01** | **Policy** create/update — nhà BH | HRM → **Bảo hiểm** → dialog policy (`CatalogSearchPicker` AS-IS Settings) | `insurer_key` | POST/PATCH `…/insurance-policies` · assert ∈ EFF | **CONSUMER** (primary) | **AC-INS-02** · **J-HRM-INS-E3-01** |
| **S-SI-INR-CNS-02** | Legacy **employee_insurance_records** create/update soft key | Bảo hiểm / records path (AS-IS `createInsuranceRecord`) | `insurer_key` (optional on body) | POST/PATCH records · assert ∈ EFF when present + EFF>0 | **CONSUMER** (optional UF) | E3 soft link · **≠** enrollment |
| **S-SI-INR-REF-01** | Settings MD / group REF `insurers` | Settings Master Data / catalog-sync | REF items | Merge-read into EFF only | **REF only** — **not** picker SoT | Dual SoT BR-PLT-06 |
| **S-SI-INR-OUT-01** | Insurance **type** Nest catalog | Policy/enrollment type picker | `insurance_type` / `type` | F-SI-CAT-TYP/EFF | **OUT** · **SEAL RETAIN** SI-INS L1 | **AC-INS-03** · **AC-PLT-SI-INS-01*** |
| **S-SI-INR-OUT-02** | Enrollment timeline `type` | Hồ sơ NV SI timeline | `type` | F-CORE-SI-02 | **OUT** type SoT | Peer SI-INS BA |
| **S-SI-INR-OUT-03** | SI lifecycle actions Đóng/Ngừng/Tạm hoãn | Timeline action buttons | status / mức | **F-CORE-SI-03** | **OUT** · **SEAL RETAIN** EMP-BE-02 | **AC-SI-TL-*** |
| **S-SI-INR-OUT-04** | CTR legal-print / template / clause / library | Contracts print spine | — | — | **OUT** · **SEAL RETAIN** | printable **false** |
| **S-SI-INR-OUT-05** | ATT work-sites Nest | Attendance GPS sites | — | F-ATT-CAT-WS | **OUT** pattern cite only | ≠ insurers table |
| **S-SI-INR-OUT-06** | Participant attach / end policy | Policy participants | — | — | **OUT** insurer SoT (retain AC-INS-04/05) | E3 |

**Pointer:** Load-only **UF-HRM-04** / **J-HRM-04** — retain host; mutate depth = **J-HRM-INS-E3-01** (insurer deepen) + proposed CAT journeys — **cấm** claim personnel UAT from load-only.

---

## 5. Use-case catalog (process)

| UC ID | Name | Happy | Alternate | Exception |
|-------|------|-------|-----------|-----------|
| **UC-PLT-SI-INR-01** | Admin — CREATE Nest insurer N+1 | Settings Nhà BH → mã mới hợp lệ → Lưu **201** → list có row → **F5** còn → consumer picker thấy mã | Sửa label / sort | Format invalid · UQ · scope 409 · «must pick only» sai áp |
| **UC-PLT-SI-INR-02** | Consumer — policy pick EFF | EFF ≥1 → Bảo hiểm → Tạo policy → **picker** Network GET `…/insurers/effective` → chọn mã → Lưu **2xx** → F5 key ∈ catalog | Filter retired hidden | Free-text SoT · MD-only SoT · invent → **4xx** `HRM-INS-INSURER-KEY` |
| **UC-PLT-SI-INR-03** | Consumer — records soft key (optional) | EFF ≥1 → records mutate với `insurer_key` ∈ EFF → **2xx** → F5 | Omit key (null OK if DTO optional) | Invent key → **KEY** · conflate enrollment type |
| **UC-PLT-SI-INR-04** | Empty EFF | Active=0 → picker empty + CTA admin; admin vẫn CREATE | Optional REF sync CTA | Seed fake density / MD-only green |
| **UC-PLT-SI-INR-05** | Scope parity | List EFF scope X = assert consumer scope X | Member 409 OOS | Drift list vs assert |

```mermaid
sequenceDiagram
  autonumber
  actor Admin as HCNS catalog admin
  actor Cnb as HCNS/C&B consumer
  participant Nest as Nest si_insurer
  participant Eff as F-SI-CAT-INS-EFF-01
  participant Pol as Policy / optional records

  Admin->>Nest: POST F-SI-CAT-INS-02 mã N+1 (open)
  alt Ceiling / must-pick-only sai áp admin
    Nest-->>Admin: FAIL — vi phạm BR-PLT-05 / L-SI-INR-01
  else 201
    Nest-->>Admin: Row active; F5 còn
  end
  Cnb->>Eff: GET insurers/effective (picker SoT)
  alt Active count = 0
    Eff-->>Cnb: Empty + CTA admin; cấm seed
  else Active count > 0
    Cnb->>Pol: Chọn insurer_key ∈ EFF; Lưu
    alt insurer invent / OOS
      Pol-->>Cnb: 4xx HRM-INS-INSURER-KEY
    else OK
      Pol-->>Cnb: 2xx; F5 key ∈ catalog
    end
  end
  Note over Pol: type Nest L1 / enrollment type / CTR print / SI-TL / printable invent OUT
```

---

## 6. Acceptance criteria (measurable · U65)

> Browser-only khi surface FE tồn tại · zero-seed · FE sau 2xx/4xx quan sát được + **F5** · probe/API **không** 🟢 UF.  
> Honesty flags **giữ false**.  
> **Không** wipe sealed SI type L1 / CTR legal-print / SI enrollment / EMP·DEC·PAY·ATT·REC·EXT·LIST-TOTALS.  
> **BE HOLD** until DATA CONFIRMED — AC dưới đây = **gate cho unlock** execution (không claim LIVE trước Nest).

### 6.1 Core AC pack (SA §7)

| ID | Surface | Đạt khi | Không đạt khi |
|----|---------|---------|----------------|
| **AC-PLT-SI-INSURER-01** | **S-SI-INR-CNS-01** (primary) | EFF active **≥1** (từ admin — **không** seed): mở policy → UI = **picker** nguồn **Network GET** `/api/hrm/contracts-insurance/insurers/effective` → chọn mã Nest/EFF → Lưu **2xx** → list hiện đúng insurer → **F5** còn ∈ catalog | Free-text Input là SoT · picker chỉ Settings MD `insurers` · 2xx với mã không ∈ EFF · chỉ API PASS |
| **AC-PLT-SI-INSURER-01b** | **S-SI-INR-CNS-01** invent (+ optional **S-SI-INR-CNS-02**) | EFF **≥1**: cố ý nhập/POST `insurer_key` **không** ∈ effective → FE chặn và/hoặc Network **4xx** **`HRM-INS-INSURER-KEY`** → **không** persist sau F5 | 2xx invent · silent accept · format-only bypass · conflict với E3 **AC-INS-02** · nhầm sang `HRM-INS-TYPE-KEY` |
| **AC-PLT-SI-INSURER-01c** | Consumers khi EFF **=0** | Picker **empty** + VI/CTA Settings **Nhà BH**; **không** fake starter chỉ để pass UF; admin **S-SI-INR-ADM-01** vẫn CREATE được | Seed/script density · fake rows · MD-only «green» khi Nest/EFF=0 |
| **AC-PLT-SI-INSURER-01d** | **S-SI-INR-ADM-01** | Catalog admin CREATE mã **#N+1** (slug hợp lệ) → Network **2xx/201** `F-SI-CAT-INS-02` → list có row → **F5** còn → consumer picker thấy mã — **không** reject «must pick existing only» | Áp invent ban lên admin · ceiling starter · closed enum CHK IN |
| **AC-PLT-SI-INSURER-01H** | Honesty / seals | Evidence ghi rõ: `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · SI type L1 GWC **SEAL RETAIN** · CTR legal-print / SI enrollment EMP-BE-02 **SEAL RETAIN** · EMP·DEC·PAY·ATT·REC·EXT·LIST-TOTALS **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 zero-seed · **DENY** module SI/CTR UAT · **DENY** fold into type | Flip ready · reopen SI-INS L1 · reopen CTR print · invent personnel UAT · reopen peer seals · claim module SI/CTR UAT / Phase1 |

### 6.2 Surface deepen AC (same pack · SRS enumerate)

| ID | Surface | Đạt khi | Không đạt khi |
|----|---------|---------|----------------|
| **AC-PLT-SI-INSURER-POL** | **S-SI-INR-CNS-01** | Align **AC-INS-02** + **J-HRM-INS-E3-01** (insurer deepen): insurer picker Nest EFF; invent → **KEY**; type path **OUT** this pack (AC-INS-03 / peer SI-INS BA retain) | MD-only insurer SoT · invent insurer 2xx · fold type into insurer seat |
| **AC-PLT-SI-INSURER-REC** | **S-SI-INR-CNS-02** (optional) | Khi UF records mutate in-scope và gửi `insurer_key`: key ∈ EFF khi >0 · invent → **KEY** | Treat records as enrollment type SoT · rewrite `employee_insurances` |

### 6.3 Consumer VAL (BE/QA measurable)

| ID | Surface | Input | Expect | AC / BR | BA gap stamp |
|----|---------|-------|--------|---------|--------------|
| **VAL-SI-INR-CNS-01** | Policy **S-SI-INR-CNS-01** | `insurer_key` OOS khi EFF >0 | **4xx** `HRM-INS-INSURER-KEY` | AC-PLT-SI-INSURER-01b · AC-INS-02 · BR-PLT-SI-INR-05 | **MIGRATE** assert off MD-only → Nest EFF after DATA+BE unlock |
| **VAL-SI-INR-CNS-02** | Records **S-SI-INR-CNS-02** | invent `insurer_key` khi present + EFF >0 | **4xx** KEY | AC-PLT-SI-INSURER-01b · BR-PLT-SI-INR-06 | **MIGRATE** same assert helper — **OPTIONAL UF** deepen (endpoint may already assert MD) |
| **VAL-SI-INR-CNS-03** | Settings-only SoT | FE bind MD `insurers` **without** EFF when EFF >0 | **FAIL** AC-PLT-SI-INSURER-01 | L-SI-INR-02 · BR-PLT-SI-INR-04 | **GAP FE** rebind EFF |
| **VAL-SI-INR-CNS-04** | Scope | List EFF scope ≠ assert consumer scope | jest **FAIL** scope_parity · runtime 409/4xx deterministic | L-SI-INR-06 · U19 | After Nest: list↔assert same resolver |
| **VAL-SI-INR-CNS-05** | Retire | Create với mã retired (default picker) | Reject / not in default picker; history còn | BR-PLT-04 · BR-PLT-SI-INR-09 | After Nest soft-delete |
| **VAL-SI-INR-CNS-06** | KEY taxonomy | Invent insurer vs invent type | Insurer → **`HRM-INS-INSURER-KEY`**; type → **`HRM-INS-TYPE-KEY`** — **không** lẫn | L-SI-INR-07 · peer SI-INS BA | Regression both keys on J-HRM-INS-E3-01 |

### 6.4 must_keep / regression pointers (không AC mới)

| Pointer | Pass | Fail |
|---------|------|------|
| **MK-SI-TYPE-L1-01** | SI-INS-CATALOG-QC-01 L1 type GWC **SEAL RETAIN** · F-SI-CAT-TYP/EFF untouched | Reopen L1 / fold insurers into type table |
| **MK-SI-ENR-01** | Enrollment ONE SoT `employee_insurances` · EMP-BE-02 **SEAL RETAIN** | Rewrite schema / dual enrollment SoT |
| **MK-SI-ACT-01** | F-CORE-SI-03 / **AC-SI-TL** lifecycle **RETAIN** | Fold Đóng/Ngừng/Tạm hoãn into insurer catalog |
| **MK-CTR-PRINT-01** | CTR legal-print QC-01/02 · library QC-03 **SEAL RETAIN** | Reopen without warrant |
| **MK-E3-INS-01** | AC-INS-01..05 matrix retain (insurer deepen only on **02**) | Wipe E3 / invent type into insurer seat |
| **MK-UF-LOAD-01** | UF-HRM-04 / J-HRM-04 load host retain | Claim personnel UAT from load-only |
| **MK-SEAL-PEER-01** | EMP · DEC · PAY · ATT · REC · EXT · LIST-TOTALS seals retain | Reopen peer seals |
| **MK-HONESTY-01** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` | Flip flags |

### 6.5 Journey / UF map (QA + ba-docs)

| ID | Maps | Notes |
|----|------|-------|
| **Reuse `J-HRM-INS-E3-01`** | Policy create (`insurers`+`insurance_types`) → attach → PATCH/end · invent insurer → 400 | **Deepen**: insurer SoT = Nest EFF (not MD alone); type SoT remain peer Nest (separate KEY) |
| **Proposed `J-HRM-SI-INR-CAT-01`** | Admin CREATE N+1 → F5 → policy picker thấy mã (**01d** → **01**) | ba-docs ADD after Nest LIVE |
| **Proposed `J-HRM-SI-INR-CAT-02`** | Invent insurer trên policy → 4xx `HRM-INS-INSURER-KEY` (**01b**) | Align AC-INS-02 |
| **Proposed `J-HRM-SI-INR-CAT-03`** | EFF=0 empty picker + admin still CREATE (**01c**) | U65 zero-seed |
| **Proposed `J-HRM-SI-INR-CAT-04`** | Optional records invent soft key → KEY | Spot if records UF in wave |
| Reuse | **J-HRM-04** · **UF-HRM-04** | Load / list — **RETAIN**; **cấm** UAT flip |
| Peer type journeys | **J-HRM-SI-INS-CAT-*** | **RETAIN** — do not reopen / redefine this seat |
| Cross-nav U19 | Policy list→detail · F5 · employee deep link | AC mỗi list mutate kèm deep link/F5 |

**Persona:** Group CEO `ceo@xe.vn` (rollup) + member HCNS khi test scope 409 — AC ghi rõ scope expect.

---

## 7. Error taxonomy (deterministic)

| Code | When | HTTP | FE |
|------|------|------|-----|
| **`HRM-INS-INSURER-KEY`** | Consumer invent / OOS insurer key khi EFF active >0 (policy · optional records) | **4xx** (E3 retain) | Banner/field VI — không toast success · không persist |
| `HRM-SI-INSURER-UNKNOWN` | Optional **alias** same class (docs/QA synonym) | Same | **MUST NOT** diverge semantics from `HRM-INS-INSURER-KEY` |
| `HRM-INS-TYPE-KEY` | Type invent (**OUT** this pack · peer SI-INS) | 4xx | Keep separate — **≠** insurer KEY |
| `HRM-PLT-CAT-CODE-INVALID` | Admin format only | 4xx | Admin form |
| `HRM-PLT-CAT-CODE-CONFLICT` | Admin UQ | 4xx | Admin form |
| Scope mismatch | Consumer assert company ≠ token scope | 409 class | Honest empty/banner |

**Cấm:** 2xx + orphan insurer; 500 trên invent; FE format-pass bỏ qua membership; nhầm type KEY với insurer KEY; nhầm AC-SI-TL action errors với insurer invent.

---

## 8. Honesty / non-claims / seals

| Flag / seal | Rule |
|-------------|------|
| `contracts_printable_ready` | **false** — **DENIED** flip |
| `hrm_personnel_uat_ready` | **false** — **DENIED** flip |
| SI type L1 GWC | **SEAL RETAIN** — **DENIED** reopen / fold |
| CTR legal-print / library | **SEAL RETAIN** — **DENIED** reopen |
| SI enrollment EMP-BE-02 | **SEAL RETAIN** — **DENIED** reopen / rewrite |
| Module SI/CTR UAT / Phase1 | **DENIED** — slice AC ≠ module GO |
| `payroll_e2e_ready` / ATT/REC ready | **Unchanged false** — out of seat |
| EMP · DEC · PAY · ATT · REC · EXT · LIST-TOTALS | **SEAL RETAIN** |
| `C-SLICE-≠-MODULE` | SI insurer catalog AC pack ≠ module SI/CTR UAT |
| Seed | **DENIED** (U65) |
| ba-data | **UNLOCK** parallel DATA-01 — **no** mega-EAV / fold into type / enrollment rewrite |
| BE | **HOLD** until BA **+** DATA CONFIRMED |

---

## 9. DOC-DELTA flag (optional ba-docs)

| Flag | Need? | Note |
|------|-------|------|
| Client SRS Nest SoT wording | **OPTIONAL** | E3 AC-INS-02: ADD-only sentence «danh mục nhà BH chuẩn = Nest `si_insurer` / effective; Settings `insurers` ≠ sole SoT» — **không** wipe FR / AC-SI-TL / type Nest |
| Journey rows J-HRM-SI-INR-CAT-* | **OPTIONAL** after Nest LIVE + QA stamp | Map §6.5 · update `PILOT_BUSINESS_FLOW_BA_TRACE.md` |
| ba-data EXPAND | **YES** parallel | Nest absent — DATA-01 |

---

## 10. Handoff expectations

| Role | Expect | Done when |
|------|--------|-----------|
| **pm** | Seal BA CONFIRMED · ensure DATA parallel · **HOLD BE** until DATA CONFIRMED · then unlock BE→FE→QA | Bus DISPATCHED |
| **ba-data** | **UNLOCK** ADD-plan `public.si_insurer` ICatalogRow peer `si_insurance_type` / ATT/EMP — no CHK IN · soft FK text · **FORBIDDEN** fold into type | CONFIRMED DATA |
| **dev-be** | After BA+DATA: Nest ensureSchema + F-SI-CAT-INS-* · migrate `assertInsurerKey` → Nest EFF · optional records assert · jest VAL-SI-INR-CNS-* | READY_FOR_QA |
| **dev-fe** | After BE: rebind policy insurer picker to EFF Nest; **REJECT** MD-alone SoT | READY_FOR_QA |
| **qa** | U65 AC-PLT-SI-INSURER-01/01b/01c/01d/01H · CNS-01 (+ optional REC) · zero-seed · no printable/personnel flip · SI type L1 + CTR/enrollment seals untouched | PASS_TO_PM / FAIL |
| **qc** | Slice GWC only · honesty false · seals retain · type L1 retain | GWC ≠ module GO |
| **ba-docs** | Optional DOC-DELTA / journey §9 | After Nest LIVE if flagged |

---

## 11. Open risks / clarifications

| # | Item | Disposition |
|---|------|-------------|
| R1 | FE `catalogSearchPicker` still Settings `insurers` | Allowed REF/label until Nest live; **must** rebind EFF when EFF >0 (**VAL-SI-INR-CNS-03**) |
| R2 | Policy assert still MD AS-IS | **Mandatory MIGRATE** VAL-SI-INR-CNS-01 after Nest live |
| R3 | Records soft key path | Optional UF deepen — same KEY taxonomy; BE assert helper shared |
| R4 | Dual error string KEY vs UNKNOWN alias | Document synonym — **do not** emit conflicting codes for same invent |
| R5 | Confusion with type Nest KEY | **VAL-SI-INR-CNS-06** — keep KEY taxonomy split |
| Q1 | Exact Nest admin tab label VI | Dev-FE product copy — process: «Nhà BH / Insurers» Settings |

**Unresolved needing sponsor:** none for Option B AC — architecture LOCKED by SA.

---

## 12. Completion

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **ba-data** | **UNLOCK** (parallel `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-DATA-01`) |
| **BE** | **HOLD** until BA **+** DATA CONFIRMED |
| **next_owner** | **pm** → seal + ensure **ba-data** complete → then **dev-be** (after DATA) |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-ba-01.md` |
