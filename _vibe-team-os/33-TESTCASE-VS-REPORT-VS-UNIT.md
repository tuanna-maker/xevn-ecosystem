# 33 — Test Case · Test Report · Unit Test (cách viết + tư duy kiểm thử sản phẩm)

**Sponsor training (2026-08-03):** Đúc kết cho mọi PM/PO — phân biệt rõ **ba lớp artifact**, cách viết từng lớp, lesson từ thực chiến (XeVN U78–U84), và **tư duy mở rộng** để kiểm thử được sản phẩm thật — không chỉ “có file test”.

**Đọc kèm:** `30` (HDSD + case matrix) · `31` (Test Log khi **chạy**) · `13` § unit plan sau API_DESIGN · `16` (squad khi khối lớn) · template `templates/PM_DETAILED_DISPATCH.md`.

---

## 0. Một câu phân biệt (học thuộc)

| Artifact | Là gì | Trả lời câu hỏi | Khi nào “xong” |
|----------|--------|-----------------|----------------|
| **Test Case (TC)** | **Thiết kế kiểm thử** — kịch bản quan sát được, bám Spec/HDSD | *Sẽ kiểm gì, ai, bước nào, kỳ vọng gì?* | Catalog/pack đủ coverage theo DoD thiết kế — **chưa** = sản phẩm PASS |
| **Unit Test** | **Mã tự động** (jest/vitest…) chứng minh **một đơn vị** (hàm/service/DTO) đúng BR | *Input X → output/throw Y theo BR?* | Spec file xanh + map endpoint/BR COVERED |
| **Test Report** | **Báo cáo trạng thái** — rollup TC × evidence × gap theo thời gian | *Đã chạy đến đâu? PASS/FAIL/BLOCKED bao nhiêu? Rủi ro còn lại?* | Cập nhật sau mỗi wave; **không** thay Test Log từng lần chạy |
| **Test Log (OS 31)** | **Nhật ký lần chạy** (IEEE LTL lean + JSON) | *Hôm nay ai bấm gì, lúc mấy giờ, network ra sao?* | Bắt buộc mỗi lần QA browser/device |

```text
Spec (SRS/TechSpec/API/DB)
   → Test Case Catalog / Menu Packs     ← thiết kế (U82/U83)
   → Unit Test Plan → Dev viết unit     ← tự động hóa lớp nhỏ
   → Chạy UI/API/Device + U78 Test Log  ← nghiệm thu thao tác
   → Test Report rollup                 ← PO/PM/QC nhìn tổng
```

**Cấm nhầm lớp:** viết xong 1500 TC catalog ≠ UAT DONE · unit xanh ≠ UF 🟢 · report “% cao” ≠ Journey J-* PASS.

---

## 1. Test Case — cách viết (chi tiết)

### 1.1 Mục đích

TC là **hợp đồng kiểm thử** giữa BA/PO/QA/Dev: đủ để người khác (hoặc agent khác) **chạy lại được** mà không hỏi lại chat.

### 1.2 Hai hình thức SoT (cùng chuẩn cột)

| Hình thức | Khi dùng | Ví dụ path |
|-----------|----------|------------|
| **Master Catalog** | Spine E2E, cross-module, API+UI chung một bảng | `docs/qa/PO_SPEC_TEST_CASE_CATALOG.md` |
| **Menu / Matrix Pack** | 1 menu hoặc 1 ma trận (process×company) | `docs/qa/testcases/**/*.md` + template `_TEMPLATE_MENU_TC_PACK.md` |

Khối lớn (≥ ~40 UC / nhiều menu) → **squad 1 agent / pack** (`16`) rồi **Synth** dedupe TC-ID.

### 1.3 Cột tối thiểu mỗi TC (bắt buộc)

| Cột | Viết như thế nào |
|-----|------------------|
| `TC-ID` | Ổn định, unique toàn repo: `TC-<DOMAIN>-<AREA>-<nnn>` |
| `UC / FR` | Trỏ SRS thật — không “theo cảm tính” |
| `TechSpec` / `API` | METHOD path + mã lỗi nghiệp vụ nếu có |
| `Layer` | `UNIT` · `API` · `UI` · `MOBILE` — một TC một layer chính |
| `Type` | `HP` happy · `FD` fail-deep · `BD` boundary · `AU` auth/scope · `UX` state |
| `Persona` | Account/role thật (vd. group CEO vs member CEO) |
| `Precond` | Trạng thái trước bước 1 — **U65: không giả định seed** |
| `Steps` | Đánh số; UI = đúng nút/menu HDSD; API = request tóm tắt |
| `Expected` | Quan sát được: HTTP + **FE sau 2xx** + F5 / list cập nhật |
| `Automate` | `jest path` / `MANUAL` / `device` |
| `Status` | `PLANNED` · `AUTOMATED` · `EVIDENCED` · `BLOCKED` · `SPEC_GAP` |

### 1.4 Depth pack (menu) — thứ tự viết trong file

1. **Screen inventory** — page, tab, dialog, drawer, sheet, confirm (kể cả popup “nhỏ”).
2. **Field dictionary** — mọi field user thấy (kể cột bảng).
3. **Function inventory** — mọi nút/menu có side-effect hoặc điều hướng nghiệp vụ.
4. **TC matrix** — mỗi function mutate ≥1 HP + ≥1 FD; required field ≥1 FD/BD; mỗi dialog ≥ open/cancel/submit.
5. **Trace** — SRS/HDSD/API/UF/J-*.
6. **Coverage check table** — đếm gap; gap = còn việc, không giấu.

### 1.5 Thứ tự ưu tiên case (tư duy nghiệp vụ — `30`)

```text
Fail-deep (quyền, validate, scope, empty apply)
  → Happy path HDSD (login → menu → nhập → Lưu → thấy kết quả)
    → Logic / BR (công thức, trạng thái SM, dual-plane, WF ladder)
```

Auth/quyền ≤ vài case — **không** dừng ở “chưa login thì fail”.

### 1.6 Ma trận mở rộng (khi sản phẩm đa CT / WF)

Khi sponsor hỏi “quy trình × công ty × danh mục”, TC generic designer **không đủ**. Thêm cột:

- `process_id` · `co_key` · `catalog_key`
- Primary vs Spot theo company
- AS-IS code vs `SPEC_GAP` / `CANDIDATE` — **cấm bịa workflowCode**

### 1.7 Done của lớp TC (thiết kế)

- Pack/catalog đủ DoD depth hoặc spine columns  
- Synth dedupe TC-ID  
- **Explicit:** `uat_done: false` cho đến khi có Test Log + Report EVIDENCED  

---

## 2. Unit Test — cách viết (chi tiết)

### 2.1 Mục đích

Chứng minh **quy tắc trong Service/DTO/pure function** đúng và ổn định — chạy nhanh, lặp lại mỗi PR. Unit **không** thay browser UAT.

### 2.2 Unit Test Plan (trước khi Dev claim COVERED)

Mỗi endpoint / BR P0 một hàng:

| Endpoint / symbol | Bước SRS / BR | Cases (input → expect) | File `*.spec.ts` | Gap |
|-------------------|---------------|------------------------|------------------|-----|
| `POST …/leave` | VAL-ATT · Diễn biến # | thiếu ngày → 4xx mã X; overlap → … | `leave.spec.ts` | COVERED / MISSING |

**Plan** nằm ở `docs/qa/PO_SPEC_UNIT_TEST_PLAN.md` (hoặc tương đương project). **Code test** nằm cạnh module.

### 2.3 Cách đặt case unit (practical)

1. **Happy** — input hợp lệ → DTO/service trả shape đúng.  
2. **Fail-deep** — từng rule validate / BR (thiếu field, sai enum, vượt ngưỡng).  
3. **Auth/scope** — companyId lệch token → 409/403 deterministic.  
4. **Boundary** — 0, max, timezone ngày `dd/MM/yyyy`, tiền không group sai.  
5. **Idempotency / state** — approve 2 lần, status illegal transition.  

**Arrange–Act–Assert** rõ; tên test = hành vi nghiệp vụ tiếng Anh kỹ thuật + comment VI nếu nhánh phức tạp (`04`).

### 2.4 Cấm / giới hạn

| Cấm | Vì sao |
|-----|--------|
| Unit mock hết rồi claim UF 🟢 | U63/U65 — user chưa bấm FE |
| Test “implementation detail” dễ gãy khi rename private | Test hành vi public |
| Bỏ qua mã lỗi nghiệp vụ ổn định | FE/QA phụ thuộc code |
| Coi coverage % = chất lượng | Coverage cao vẫn miss BR |

### 2.5 Handoff Dev

`READY_FOR_QA` P0 mutate: Unit Plan row **COVERED** + (nếu UI) sẵn sàng browser. Thiếu unit P0 → residual Dev, không đẩy “QA hãy bỏ qua”.

---

## 3. Test Report — cách viết (chi tiết)

### 3.1 Mục đích

**Một trang sự thật** cho sponsor/QC: tiến độ kiểm thử theo TC-ID, không theo cảm xúc wave.

Path mẫu: `docs/qa/reports/PO_SPEC_TEST_REPORT.md`

### 3.2 Cấu trúc khuyến nghị

1. **Executive §1** — số TC catalog · số EVIDENCED · unit MISSING · verdict UAT/Phase (**honest**).  
2. **Spine / P0 table** — TC-ID · Layer · Status · evidence path · test-log path.  
3. **Depth / matrix sections** — rollup packs (claimed vs unique IDs) — **tách** khỏi spine EVIDENCED.  
4. **Gaps & residuals** — SPEC_GAP, BLOCKED (env), owner WI.  
5. **Change log** — mỗi wave APPEND một dòng (ngày · WI · delta).  

### 3.3 Quy tắc cập nhật

| Sau sự kiện | Report làm gì |
|-------------|----------------|
| Synth pack | Tăng claimed/unique; **không** tăng EVIDENCED |
| QA browser PASS + U78 log | TC → EVIDENCED + link log |
| Unit PR merge | Unit Plan COVERED → report % unit |
| FAIL | Giữ FAIL + incident; không xóa lịch sử |

### 3.4 Report ≠ Test Log ≠ Catalog

- Catalog: “cần chạy”  
- Log: “đã chạy lần này”  
- Report: “tính đến nay, toàn chương trình”

---

## 4. Khi nào dùng lớp nào (decision tree)

```text
Có Spec mới / UC mới?
  ├─ Chưa có TC trong catalog/pack → viết TC trước (BA/QA design)
  ├─ BR nằm trong service/DTO → Unit Plan + Dev unit
  └─ User thao tác FE/Mobile → browser/device + Test Log (31)
         └─ xong wave → cập nhật Test Report
```

**Product acceptance (UF/J-*):** bắt buộc lớp UI/Mobile + log. Unit/API chỉ là **chống thoái hóa** và bắt lỗi sớm.

---

## 5. Tư duy mở rộng — kiểm thử được sản phẩm thật

### 5.1 Năm lớp sẵn sàng (đừng dừng ở L2)

| Lớp | Ý | PASS khi |
|-----|---|----------|
| L0 | Stack sống | Health 200 |
| L1 | API contract | Auth/scope/mã lỗi đúng |
| L2 | Route/tab load | Không banner ERROR storm |
| **L2.5** | Journey click | List→detail→save→F5→còn data |
| L3 | QC gate | GO/GWC + residual có owner |

L2 PASS + L2.5 FAIL = **FAIL** sản phẩm.

### 5.2 Mở rộng bề mặt (PO mindset)

1. **Menu depth** — mọi màn/popup/field/function (không chỉ spine).  
2. **Persona ladder** — group CEO / member CEO / HRBP / NV / approver.  
3. **Multi-company** — Primary/Spot process × catalog apply/pull.  
4. **Cross-system** — XBOS định nghĩa → HRM instance → Inbox approve → Mobile.  
5. **Data plane** — org id ≠ workforce slug (`21`).  
6. **Empty & storm** — empty hợp lệ ≠ spinner/reload vô hạn.  
7. **HDSD** — đúng chữ nút/menu khách dùng (`30`).  
8. **No fake** — cấm seed/inbox giả để “có cái bấm Duyệt” (U65).  

### 5.3 Chiến lược “đủ” vs “xong catalog”

| Mục tiêu sponsor | Artifact đủ |
|------------------|-------------|
| Thiết kế kiểm thử toàn hệ | Roster + packs + synth |
| Chống regress code | Unit Plan COVERED P0 |
| Nghiệm thu thao tác | Test Log + UF/J-* EVIDENCED |
| Ra quyết định UAT/Prod | Test Report + QC GO + SERVICE_READINESS |

PM/PO **nói rõ** đang ở mục tiêu nào — tránh overclaim.

---

## 6. Lesson learn (thực chiến → luật)

| # | Lesson | Hệ quả |
|---|--------|--------|
| L1 | Catalog depth 1000+ TC vẫn là **PLANNED** | Report phải tách “claimed design” vs “EVIDENCED” |
| L2 | Pack generic WF designer ≠ process×company matrix | U84: taxonomy + matrix + TC riêng |
| L3 | HTTP 200 / mount Vite ≠ nghiệp vụ | L2.5 + FE sau 2xx + F5 |
| L4 | Seed inbox để có task duyệt = fake | U65; Inbox trống = BLOCKED hoặc tạo từ FE |
| L5 | Console clean + bảng trống mãi = FAIL | Empty hợp lệ phải có AC; auto-reload storm = defect |
| L6 | Unit/vitest PASS không invent UF 🟢 | `31` reject rule |
| L7 | Prompt ngắn cho subagent → pack nông / sai SoT | **Dispatch kiểu training** (§7) |
| L8 | 1 agent ôm cả hệ → thiếu popup/field | Squad + synth (`16`) |
| L9 | CANDIDATE process bịa code = nợ giả | SPEC_GAP + SA lock |
| L10 | GWC slice ≠ Phase1 DONE | Report executive nói thẳng |

**Incident class liên quan:** idle sau PASS_TO_PM · codes thay dispatch · dual-plane stub count — xem `incidents/`.

---

## 7. PM/PO — giao việc subagent kiểu “training” (bắt buộc)

Subagent **không** nhớ hội thoại sponsor. Prompt phải chứa **bối cảnh + tầm nhìn + ranh giới + định nghĩa xong**, giống đang train người mới.

### 7.1 Thiếu sót thường gặp

- Chỉ ghi: “viết testcase menu X”  
- Không nói catalog ≠ UAT  
- Không `read_first` có thứ tự  
- Không cột bắt buộc / DoD đếm  
- Không cấm (seed, apps/**, bịa code)  
- Không `next_dispatch_prompt`  

### 7.2 Bộ khung prompt (dùng template)

SoT copy-ready: **`templates/PM_DETAILED_DISPATCH.md`**

Mỗi Task tối thiểu:

1. **Mission + why** — sponsor muốn kiểm được gì ở sản phẩm  
2. **Vision / non-goal** — lớp artifact nào; cái gì *không* claim  
3. **read_first ordered** — Spec → matrix → template → pack XREF  
4. **entry / exit criteria** đo được  
5. **Shape of deliverable** — path file + bảng cột  
6. **Locks** — U65/U76/U78… · `allowed_paths` / `forbidden_paths`  
7. **Examples** — 1–2 TC mẫu hoặc neo pack tốt  
8. **Handoff** — `completion_report` · `next_owner` · `next_dispatch_prompt` · `evidence_path`  

### 7.3 Độ dài

Ưu tiên **rõ và đủ** hơn ngắn. Prompt 1–2 trang có cấu trúc > 3 câu mơ hồ. Squad song song: mỗi seat một Mission hẹp, Synth seat có neo-map dedupe.

---

## 8. Checklist nhanh trước khi bảo “đã test”

- [ ] TC tồn tại cho UC/menu/process đang nói?  
- [ ] Unit P0 COVERED cho BR mutate?  
- [ ] Đã chạy UI/device với Test Log md+json?  
- [ ] Report §1 honest (design vs evidenced)?  
- [ ] J-* / UF liên quan có click path?  
- [ ] Residual có owner WI?  
- [ ] Không seed / không overclaim UAT?

---

## 9. Ánh xạ chuẩn quốc tế (lean)

| Chuẩn | Artifact OS |
|-------|-------------|
| IEEE 829 Test Case specification | §1 Test Case / packs |
| IEEE 829 Test Log + Anomaly | `31` Test Log |
| IEEE 829 Test Summary / Report | §3 Test Report |
| ISO/IEC/IEEE 29119-3 | Cột TC + log steps + result |
| xUnit / JUnit practice | §2 Unit Test |

---

## 10. Đăng ký & liên kết project

| OS | Project (XeVN ví dụ) |
|----|----------------------|
| File này `33` | `docs/program/PO_SPEC_TEST_SUITE_PROGRAM.md` · U82–U85 |
| `31` | `docs/qa/WORLD_STANDARD_TEST_LOG.md` |
| Menu template | `docs/qa/testcases/_TEMPLATE_MENU_TC_PACK.md` |
| Report | `docs/qa/reports/PO_SPEC_TEST_REPORT.md` |

Rule pointer: `rules/pm-detailed-subagent-dispatch.mdc` · `rules/qa-testcase-report-unit-clarity.mdc`.

---

## 11. Change log (OS)

| Date | Note |
|------|------|
| 2026-08-03 | v1 — sponsor training: TC vs Report vs Unit + lessons U78–U84 + detailed dispatch |
