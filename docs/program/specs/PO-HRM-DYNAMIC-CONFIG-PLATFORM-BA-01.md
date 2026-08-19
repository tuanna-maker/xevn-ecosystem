# BA capability matrix — Nền tảng cấu hình động HR (MISA / Base principles)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01` |
| **Program** | [`PO_HRM_DYNAMIC_CONFIG_PLATFORM_01.md`](../PO_HRM_DYNAMIC_CONFIG_PLATFORM_01.md) |
| **from_role** | ba-process |
| **lane** | governance |
| **Date** | 2026-08-07 |
| **Status** | **BA LOCKED (capability map)** — chờ sponsor CONFIRM → ba-docs / SA ADR synth |
| **Honesty** | `contracts_printable_ready=false` · không claim module UAT / Phase1 DONE · U65 zero-seed |
| **Cấm** | `apps/**` · paste full body HĐ · closed enum 8 mã · seed body để «đủ catalog» |
| **Align** | [`XEVN-TPL-DYNAMIC-LOCK`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md) · [`CORR-01`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md) · FR-UC-BP-CORE-09 / 09a–09d · JD-DYNAMIC pattern |

---

## 0. Process objective & actors

### Objective

Khóa **capability map** nghiệp vụ: mọi cấu hình HR hướng người dùng (mẫu văn bản, điều khoản, trường mở rộng, danh mục vận hành, schema form) là **dữ liệu Settings/catalog** — không compile-time enum / FE hardcode body — theo nguyên tắc công khai MISA AMIS (mẫu + `#merge#` + custom field) và Base HRM (loại HĐ CRUD + `${variables}` + field theo loại).

**Vertical đầu tiên (đã in-flight):** Hợp đồng — template CRUD · clause library · `layout_json` · version freeze on issue · merge tokens. Các domain khác **cùng pattern**, specialized UI.

### Actors

| Actor | Role |
|-------|------|
| HCNS / Settings admin | CRUD catalog, schema, clause, template, pack rules |
| HCNS nghiệp vụ (NS / TD / Công / Lương / HĐ) | Dùng picker từ catalog; soạn layout; preview/merge |
| Group CEO (holding) | Publish/pull catalog/library versioned (DATA-02 class) |
| System | Resolve active rows · merge · freeze snapshot · soft-delete · scope |
| SA | ADR Option A/B/C (metadata platform) |
| ba-docs | DOC-DELTA Enterprise SRS sau sponsor CONFIRM |

### Scope

| In (Phase 1 research → vertical HĐ) | Out (Phase 1 non-goals) |
|-------------------------------------|-------------------------|
| Capability matrix 7 domain | Full MISA AI template generation |
| Contract vertical AC U65 (9th template, clause edit, reorder, F5, merge custom field) | Claim `contracts_printable_ready=true` / module UAT |
| Open catalog CORR-01 | Closed enum / `CHK IN (8)` |
| Shared pattern: catalog · schema · merge · clause | DOCX binary upload as **default** (may be GĐ2 if SA Option chọn) |
| Starter bootstrap rows (optional) | Seed mutate / fake inbox for AC |
| Align JD-DYNAMIC / salary_components / packs | Redesign PDF engine đã GWC |

---

## 1. Platform pattern (shared — 4 layer)

Mọi domain config-facing dùng **cùng 4 lớp** (chuyên biệt UI, không chuyên biệt nền):

| Layer | Meaning | Example CTR | Example REC (JD) | Example PAY |
|-------|---------|-------------|------------------|-------------|
| **Catalog** | Rows Settings: code + label + status + scope | `hrm_contract_templates` open | JD field defs · packs | `salary_components` · `pay_types` |
| **Schema** | Form / layout metadata (order, required, type) | `layout_json` clause_ids | JD layout DnD | Formula form GĐ1 order (kéo-thả GĐ2) |
| **Merge** | Token registry SoT + custom → print/preview/DOCX | `{{employee_full_name}}` · custom | JD public view blocks | Payslip line labels from catalog |
| **Clause / body-as-data** | Versioned text units | `hrm_contract_clause` | Group pack text sections | (N/A hoặc policy text) |

**BR-PLT-01:** Thêm custom field Settings (phân hệ) → **auto-register** merge token (MISA: mở rộng khi thêm trường).  
**BR-PLT-02:** Consumer form SoT = picker / FK catalog khi catalog có items hiệu lực — **cấm** free-text SoT (class BR-HRM-MD-01).  
**BR-PLT-03:** Ban hành / issue / publish → **freeze** snapshot (template_code + layout + clause versions + merged values) — F5 không đổi.  
**BR-PLT-04:** Soft-delete only; tenant/OU scope parity list↔get-by-id.  
**BR-PLT-05:** Starter rows = bootstrap ví dụ — **không** ceiling (CORR-01).

---

## 2. Capability matrix by domain

Legend AS-IS risk: **H** = hardcode / closed enum · **F** = free-text SoT · **O** = orphan (catalog tồn tại, consumer không bind) · **S** = stub / honesty · **OK** = đã catalog-driven đủ Phase1 intent.

### 2.1 EMP — Nhân sự / hồ sơ / QSĐ / lịch sử

| Config surface | AS-IS (hardcode risk) | TO-BE dynamic | Layer | Priority Phase1 |
|----------------|----------------------|---------------|-------|-----------------|
| Chức danh / phòng ban | Catalog picker nhiều chỗ; WH còn free-text position (**F**) | Picker `position_key` / dept bắt buộc; empty → CTA Settings | Catalog | P0 align E2E-EMP |
| Metadata hồ sơ (CORE-02b class) | Một phần field cố định + risk C&B trên form NV (**O**/spine) | Custom field catalog theo phân hệ NS; C&B chỉ surface CORE-02 | Catalog + Schema | GĐ1 custom field register; C&B surface lock parallel |
| Loại QSĐ / quyết định | Catalog types (partial) | Open catalog types + schema form theo loại | Catalog + Schema | After CTR vertical |
| Merge / print QSĐ | FE text / export client (**S**) | Template + merge tokens (optional GĐ2) | Merge | GĐ2 |
| Employment status / reason codes | Mix enum FE | Catalog Settings | Catalog | GĐ1 nếu còn hardcode list |

**AS-IS class stamps:** EMP-D2 free-text WH · D1 C&B on public form · D6 QSĐ optional employee_id — **không** giải bằng platform wave này một mình; platform **cung cấp** catalog/schema; spine E2E vẫn owner riêng.

### 2.2 REC — Tuyển dụng

| Config surface | AS-IS | TO-BE | Layer | Priority |
|----------------|-------|-------|-------|----------|
| JD field catalog + layout DnD | **JD-DYNAMIC in flight / SPEC** — pattern chuẩn | Giữ; trở thành **reference vertical #2** sau CTR | Catalog + Schema + Merge(view) | Parallel must_keep |
| JD Group / Pack | GROUP-SPEC packs | Pack = catalog rows + rules | Catalog | must_keep |
| Pipeline stages / interview status | Partial enum + badge gaps | Stages catalog Settings; cardinality BR riêng | Catalog | After JD |
| YCTD ↔ JD | Spine REC-00/02 | **must_keep** — platform không đổi quan hệ | — | — |
| Candidate form fields | Mix fixed + free-text position risk | Custom fields + picker locks | Catalog + Schema | Align BR-HRM-MD-01 |
| Offer / mail templates | Hardcode / stub risk | Document templates + merge (MISA class) | Merge + Catalog | GĐ2 |

### 2.3 ATT — Chấm công / nghỉ / bảng công

| Config surface | AS-IS | TO-BE | Layer | Priority |
|----------------|-------|-------|-------|----------|
| Leave types / balance rules | Config service + rules tabs; một phần stub device (**S**) | Leave type catalog + rule schema versioned | Catalog + Schema | GĐ1 deepen |
| Attendance codes / work sites | Catalog partial | Open catalog codes + sites CRUD Settings | Catalog | GĐ1 |
| Sheet sign roles / WF | XBOS WF + sheet | Keep WF SoT; sheet metadata config | Catalog | must_keep SIGN spine |
| Column customize sheet | Non-persist UI (**O**) | Optional saved layout schema per OU | Schema | GĐ2 |
| Export templates | Client XLSX (**S**) | Template catalog GĐ2 | Merge | GĐ2 |
| Face / device rules | Product stub honesty | **OUT** invent LIVE; config catalog only when product opens | — | OUT Phase1 product |

### 2.4 PAY — Lương / thành phần / kỳ / phiếu

| Config surface | AS-IS | TO-BE | Layer | Priority |
|----------------|-------|-------|-------|----------|
| `salary_components` Settings | Catalog exists; TX create **free-text code/name** (**O**/**F**) | Instance **phải** chọn từ catalog khi có items (AC-PAY-COMP-01) | Catalog | P0 queue PAY |
| `pay_types` / nature | Picker OK | Keep | Catalog | OK |
| Payroll formula form | GĐ1 form; DnD GĐ2 (sponsor) | Schema order + component refs — **không** FE invent formula engine | Schema | GĐ1 form / GĐ2 DnD |
| Payslip / period templates | Period shell orphan risk | Template lines → catalog codes; enroll rules | Catalog + Merge | After components lock |
| Allowance / deduction types | Mix | Open catalog | Catalog | With components |

### 2.5 CTR — Hợp đồng (vertical #1 — chi tiết §3)

| Config surface | AS-IS | TO-BE | Layer | Priority |
|----------------|-------|-------|-------|----------|
| Template catalog | Risk **closed 8** SUPERSEDED by CORR-01; print-spine GWC slice | **Open catalog** + starter 8 X.E · CRUD 9+ | Catalog | **P0 now** |
| Clause library | Settings + DnD; FE **cấm** hardcode body (**BR-CTR-CL-03**) | Versioned `body_vi` + `{{keyword}}` | Clause | P0 |
| Layout structure | `layout_json` / clause_ids order | HR reorder DnD → F5 → print uses new structure (draft only) | Schema | P0 |
| Pack `GENERAL`/`IT_OFFICE`/`DRIVER` | Configured packs | Pack ∈ configured; starter neo keep | Catalog | must_keep |
| Merge tokens | Keyword map + GPLX + orgSuffix CFG | Registry SoT + **custom field → token** | Merge | P0 |
| Version freeze | `print_versions` freeze `template_code` | Freeze code + layout snapshot + clause versions on issue | Merge + Clause | must_keep print-spine |
| Group publish/pull | DATA-02 Q-CTR-01 CLOSED | Members nhận mẫu mới qua library — **không** hardcode list | Catalog | must_keep |
| UF-HRM-02 registry | CRUD không bắt buộc template | Keep nullable template_* | — | must_keep |

### 2.6 CATALOG — Danh mục tập đoàn / tenant

| Config surface | AS-IS | TO-BE | Layer | Priority |
|----------------|-------|-------|-------|----------|
| XBOS publish → HRM pull | Catalog-sync SoT group | **Keep** — platform consumes rows; **cấm** invent dual SoT | Catalog | must_keep |
| Tenant extension rows | Partial | Allow tenant ADD rows where ADR allows; group SoT immutable soft | Catalog | SA ADR |
| Display labels | Display-ready fields BE | Keep; custom field labels vi-VN | Catalog | OK pattern |
| Closed product enums (status machine) | Runtime status ≠ config catalog | **Không** mở mọi enum thành CRUD (lifecycle code vẫn code) | — | Clarify SA |

**BR-PLT-06:** Catalog tập đoàn (XBOS) = SoT khung; HRM Settings = consumer + tenant extensions theo ADR — **không** hardcode list FE thay sync.

### 2.7 SETTINGS — Cài đặt công ty / hệ

| Config surface | AS-IS | TO-BE | Layer | Priority |
|----------------|-------|-------|-------|----------|
| `hrm_company_settings` keys | CFG keys (vd. org_suffix số HĐ) | Key registry + typed values; **cấm** FE hardcode magic | Catalog (KV) | P0 CTR-related |
| Module feature flags | Mix | Settings rows / ADR — honesty stub ≠ LIVE | Catalog | Continuous |
| Document / email templates (cross-module) | Sparse | MISA-class template types by subsystem | Catalog + Merge | After CTR |
| Custom field definitions | Partial / planned CORE-02b | Per-module field catalog → merge registry | Catalog + Schema + Merge | Platform core |
| Number patterns / org suffix | CFG-01 path | Settings mount — not FE constant | Catalog | must_keep CTR |

---

## 3. Contract vertical — process detail (TO-BE)

### 3.1 Actors & happy path

```text
Settings admin
  → CRUD template (code, name, pack, term defaults, title)
  → CRUD clause (title, body_vi with tokens, group, packs, mandatory)
  → DnD reorder layout_json.clause_ids trên mẫu
  → (optional) publish holding → member pull/apply

HCNS HĐ
  → Tạo/sửa HĐ (UF-HRM-02) ± chọn template active (bất kỳ mã HR tạo)
  → Preview merge (SoT + custom tokens)
  → Issue / lưu print version → freeze snapshot
  → PDF/In → F5 còn cùng version + template_code + structure lúc ban hành
```

### 3.2 Template CRUD (open catalog — CORR-01)

| Capability | Rule | Ref |
|------------|------|-----|
| List | API open `status=active` (+ soft-deleted hidden) | BR-CTR-TPL-DYN-01 |
| Create 9+ | code format/slug + UQ `(company_id, lower(code))` + pack ∈ configured | AC-CTR-XEVN-11 · BR-DYN-03/04 |
| Starter 8 | Optional ensure upsert `XEVN_*` — **not** max | BR-DYN-02 · DYNAMIC-LOCK |
| Update metadata | Draft/active editable per policy; issued contracts không đổi snapshot | BR-CTR-TPL-02 |
| Retire | Soft-delete / retired — picker ẩn; history giữ FK | Soft-delete |
| **FORBIDDEN** | `CHK IN (8)` · API reject 9th vì «không thuộc 8» · FE list cứng 8 | CORR-01 |

### 3.3 Clause library

| Capability | Rule |
|------------|------|
| CRUD clause | `title_vi` · `body_vi` · `clause_group` · `apply_to_packs` · `mandatory` · `status` |
| Edit body | Active clause đã từng gắn HĐ issued → **version++** mới; HĐ cũ giữ snapshot (BR-CTR-CL-01) |
| Tokens in body | `{{token}}` / `#token#` policy — SA lock syntax one style GĐ1 |
| Resolve | Pack + template layout → ordered clauses; thiếu mandatory → chặn In (BR-CTR-CL-02) |
| FE | **Cấm** hardcode body luật dài (BR-CTR-CL-03) |

### 3.4 Layout structure over time

| State | Behavior |
|-------|----------|
| Template draft / active, **no** new issue yet | Reorder DnD `layout_json` → Lưu 2xx → F5 → preview/print **dùng cấu trúc mới** |
| After print version issued | Snapshot frozen; sửa layout template **không** đổi bản đã ban hành; bản mới / amend dùng layout hiện tại |
| Holding publish | Versioned library payload includes layout + clause refs — member apply activates version |

### 3.5 Version freeze on issue

| Freeze set (minimum) | Note |
|----------------------|------|
| `template_code` | Column wins over mirror (API-01) |
| `layout_json` snapshot / clause_ids order | Structure at issue |
| Clause `version` ids + body snapshot | BR-CTR-CL-01 |
| Merged field values (Đ.21 + GPLX + org) | Preview parity PDF |
| `pack_code` | Pack at issue |

**F5:** list print versions >0; reopen version → same structure + code.

### 3.6 Merge tokens

| Source | Examples (logical) | Register rule |
|--------|-------------------|---------------|
| Employee SoT | full_name, DOB, CCCD, phone | Built-in registry |
| Contract SoT | contract_number, effective_from/to, job_title | Built-in |
| Company / OU | legal_name, unit_label, org_suffix pattern | CFG + company |
| C&B | base_salary, allowances (mask by RBAC) | Snapshot at issue |
| DRIVER | GPLX quartet | Mandatory pack DRIVER |
| **Custom field** | `custom_<module>_<code>` | **BR-PLT-01** — xuất hiện trong danh sách trường trộn ngay sau Lưu field Settings 2xx + F5 |

Syntax GĐ1: SA chọn **một** convention (`{{x}}` Base-like **hoặc** `#x#` MISA-like) — BA không khóa syntax trong matrix này; cấm dual syntax trong cùng template GĐ1.

---

## 4. Acceptance criteria — U65 examples (platform + CTR vertical)

> Browser-only · zero-seed · FE sau 2xx + F5 · probe không 🟢.  
> `contracts_printable_ready` **vẫn false** đến QC sau impl đầy đủ.

| ID | Domain | Đạt khi | Không đạt khi |
|----|--------|---------|----------------|
| **AC-PLT-CTR-01** | CTR | Settings → **Tạo mẫu** thứ **9** (code HR đặt, pack ∈ configured) → Network **2xx** → list có row → **F5** còn → form HĐ/preview **chọn được** mã 9 | Reject vì «không thuộc 8» · FE hardcode 8 · mất sau F5 |
| **AC-PLT-CTR-02** | CTR | Settings → mở clause → **sửa `body_vi`** (đổi câu, không paste full HĐ copyright) → Lưu **2xx** → F5 còn nội dung mới; preview draft dùng body mới | FE body hardcode · Lưu OK nhưng F5 cũ · chỉ API PASS |
| **AC-PLT-CTR-03** | CTR | Trên mẫu: **DnD reorder** cấu trúc (`clause_ids`) → Lưu **2xx** → F5 → **Mở** mẫu → thứ tự mới; preview/print draft **theo cấu trúc mới** | OrderAfter=[] · nút nhầm Sửa vs Mở · print vẫn order cũ trên draft |
| **AC-PLT-CTR-04** | CTR | Issue print version trên HĐ gắn mẫu → đổi layout template sau đó → F5 **version cũ** giữ structure freeze; bản draft mới mới theo layout mới | Version issued đổi theo edit template |
| **AC-PLT-CTR-05** | CTR | Settings thêm **custom field** phân hệ HĐ (hoặc NS dùng trên merge) → Lưu **2xx** → F5 → danh sách merge token **có** token field mới → gắn vào clause/body hoặc keyword_map → preview hiện giá trị khi có data | Token không xuất hiện · phải deploy code · FE list cứng token |
| **AC-PLT-CTR-06** | CTR | Starter 8 (nếu bootstrap) **có thể** hiện; catalog **>8** sau AC-01 **PASS**; soft warn thiếu starter **không** chặn thêm | Soft warn / UI chặn thêm vì ≠8 |
| **AC-PLT-PAY-01** | PAY | Khi `salary_components` có items: tạo TP **phải** chọn code catalog (không Input mã SoT tự do) → 2xx + F5 | Free-text mã là SoT khi catalog ≠ rỗng |
| **AC-PLT-REC-01** | REC | Giữ AC JD-DYNAMIC: thêm field catalog → kéo layout → form JD động → F5 (must_keep) | Invent brand / wipe REC-00 |
| **AC-PLT-EMP-01** | EMP | WH create: position = catalog picker; reject free-text SoT | Input position SoT |
| **AC-PLT-CAT-01** | CATALOG | Picker consumer load từ sync/API rows — không FE fixed enum danh mục tập đoàn | Hardcode list FE |
| **AC-PLT-SET-01** | SETTINGS | Đổi key CFG (vd. org_suffix) trên Settings → 2xx → F5 → preview số HĐ dùng giá trị mới | Magic constant FE |

**Journey đề xuất (ba-docs):** `J-HRM-CTR-07` (CORR AC-11) · reuse `J-HRM-CTR-04..06` · JD `J-HRM-JD-*` · PAY picker journey khi ba-docs mở.

**Map CORR:** AC-PLT-CTR-01 ≡ **AC-CTR-XEVN-11**; AC-PLT-CTR-06 ≡ revised **AC-CTR-XEVN-01**.

---

## 5. Business rules (platform + CTR pointer)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-01** | Custom field saved active | Register merge token | Token list + clause body resolve |
| **BR-PLT-02** | Catalog effectiveItems > 0 | Consumer SoT = picker/FK | Reject free-text SoT |
| **BR-PLT-03** | Print/issue/publish | Freeze snapshot | F5 immutable issued |
| **BR-PLT-04** | Delete config | Soft-delete | History FK intact |
| **BR-PLT-05** | Starter bootstrap | Upsert examples | Not ceiling |
| **BR-PLT-06** | Group vs tenant catalog | XBOS SoT + tenant extend per ADR | No dual hardcode SoT |
| **BR-CTR-TPL-DYN-01..07** | CTR open catalog | As CORR-01 | Authoritative CTR |
| **BR-CTR-CL-01..04** | Clause library | As SPEC-01 | must_keep |
| **BR-CTR-TPL-01..07** | Type multi-map, amend, GPLX… | Keep SPEC XEVN-TPL | must_keep |

**SUPERSEDED (do not implement):** closed enum 8 · `CHK IN (8)` · VAL-XEVN-06 reject unknown XEVN_% · FE fixed 8.

---

## 6. Non-goals Phase 1 (explicit)

| Non-goal | Rationale |
|----------|-----------|
| Full **MISA AI** / auto-generate template from law text | Research principle only — no product claim |
| **DOCX binary upload** as default path | May be **GĐ2** nếu SA Option B/C chọn DOCX engine; GĐ1 = structured layout_json + PDF spine đã có |
| Claim printable module UAT / `contracts_printable_ready=true` | Slice GWC ≠ module |
| Paste / ship full copyright HĐ body in docs or seed | Body = tenant Settings only |
| Open **every** lifecycle enum to CRUD | Status machines remain code; config = types/templates/fields |
| Replace XBOS catalog SoT by HRM invent | Publish/pull must_keep |
| ATT Face LIVE / device rules fake | Honesty stub |
| REC-03 campaign / public career site | OUT / GĐ2 prior locks |

---

## 7. As-is vs to-be (program)

| | AS-IS | TO-BE (platform) |
|---|-------|------------------|
| Config truth | Mix: Settings rows + FE constants + closed matrix risk + free-text SoT | Catalog-driven + schema + merge registry + clause data |
| HĐ templates | Print-spine + risk ceiling 8 | Open catalog + starter 8 + CRUD 9+ (CORR-01) |
| Cross-domain | Mỗi module invent pattern riêng | One metadata platform; specialized UIs |
| Custom fields | Sparse | Auto merge token registration |
| Issue | Freeze partial | Freeze template + layout + clause versions + merges |

---

## 8. Dependencies & open questions

### Dependencies

| Dep | Owner |
|-----|-------|
| SA ADR Option A/B/C (storage: JSON schema vs tables vs hybrid; DOCX GĐ1/GĐ2) | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SA-01` |
| CTR dynamic BE/FE already in flight | Contract lane CORR + Dev |
| JD-DYNAMIC must_keep | REC lane |
| Sponsor CONFIRM capability map | PM → sponsor |
| ba-docs DOC-DELTA FR-09d «8 mẫu» → «catalog động + starter 8» | After CONFIRM |

### Open questions (for SA / sponsor — không block BA matrix)

| ID | Question | Default until answered |
|----|----------|------------------------|
| **Q-PLT-01** | Merge syntax `{{x}}` vs `#x#` GĐ1? | SA picks one in ADR |
| **Q-PLT-02** | DOCX upload GĐ1 hay GĐ2? | **GĐ2** default (non-goal §6) |
| **Q-PLT-03** | Custom fields shared table vs per-module tables? | SA Option |
| **Q-PLT-04** | Tenant may ADD group-catalog codes? | ADR group vs tenant |
| **Q-PLT-05** | Rollout order after CTR: PAY components vs EMP custom fields? | PM recommends **PAY-COMP catalog bind** then EMP custom field |

---

## 9. Handoff package

| To | Expectation | Done when |
|----|-------------|-----------|
| **PM** | Intake PASS_TO_PM; queue sponsor CONFIRM | Bus + program wave status |
| **SA** | ADR synth Option A/B/C using this matrix + MISA/Base principles | ADR path + recommended option |
| **ba-docs** | After CONFIRM: DOC-DELTA FR-09d wording + optional FR-PLT-* stub index | SRS ADD-only · no wipe · printable false |
| **Dev** | **Not** unlocked by this seat alone — wait CONFIRM + TechSpec/DB/API platform | — |
| **QA** | Later: AC-PLT-CTR-01..06 U65 browser | Evidence UF/J |

---

## 10. Honesty

| Flag | Value |
|------|-------|
| `contracts_printable_ready` | **false** |
| Platform Phase1 DONE | **false** |
| This seat | Docs only — capability matrix |
| CORR-01 open catalog | **Aligned — not contradicted** |

---

## 11. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ba-01.md` |
| **next_owner** | **pm** → **sa** ADR synth **or** **ba-docs** after sponsor CONFIRM |
