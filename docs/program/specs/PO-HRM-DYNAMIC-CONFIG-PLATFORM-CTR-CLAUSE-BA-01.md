# PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-BA-01 — AC pack · contract clause **body-as-data** (`hrm_contract_clauses.body_vi`)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-BA-01` |
| **lane** | governance · ba-process |
| **change_mode** | **ADD** (AC wording only) — **no code** `apps/**` · **no seed** (U65) · **no wipe** · **RETAIN** LIVE clause library + print-spine |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-SA-01` — **CONFIRMED Option B (RETAIN + narrow clarify)** |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` · U88 continuous next-vertical |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — AC pack authored · ba-data **HOLD confirmed (no history trigger)** · BE/FE **HOLD (no GAP)** |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-SA-01.md) §10 draft stubs · §4.1 gates · §5 locks · §9 ba-data HOLD |
| **ref_ba_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) §3.3 clause library · **AC-PLT-CTR-02** · **BR-CTR-CL-01..04** |
| **ref_lock** | [`PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md) |
| **ref_code (verified LIVE)** | `apps/api/hrm-api/src/contracts-insurance/contract-legal-print.service.ts` (`createClause` L1343 · `updateClause` L1412 · `clauseHasIssuedSnapshot` L1473) · `contracts-insurance.controller.ts` (routes `contract-clauses*` L549-617) · `migrations/20260806_contract_legal_print.sql` · `apps/web/hrm/src/components/settings/ContractLegalPrintSettingsPanel.tsx` (clause CRUD + `body_vi` form LIVE) |
| **Honesty** | `contracts_printable_ready=false` · `payroll_e2e_ready=false` · **DENIED** module CTR UAT / Phase1 · **`C-SLICE-≠-MODULE`** · U65 zero-seed |
| **must_keep** | `hrm_contract_print_versions.clauses_snapshot_json` immutable · `updateClause` version-bump guard · UF-HRM-02 nullable template · library publish/pull · leave-balance CNS-WIRE/FE-01g Conditions · ATT L1 seals |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

> **HARD EXIT GATE self-check:** this file + evidence written to disk and Shell byte-verified before CONFIRMED (see evidence header for byte sizes). Empty turn is INVALID.

---

## 1. Process objective and actors

**Objective:** Định nghĩa acceptance criteria (đo được) cho việc **quản trị nội dung điều khoản hợp đồng dạng dữ liệu** (`body_vi`) trên nền hạ tầng LIVE — không di trú SoT, không physicalize thừa, không hardcode body ở FE. Phạm vi là **AC wording cho luồng U65 (browser, zero-seed)**, không phải build mới.

| Actor | Vai trò trong luồng |
|-------|----------------------|
| **HCNS / Settings admin** | Tạo/sửa điều khoản (`body_vi`), gắn vào pack/template, kích hoạt version, soft-retire |
| **Người soạn HĐ (drafter)** | Xem preview draft, phát hành (issue) bản in → freeze snapshot |
| **Consumer (preview / issue / PDF renderer)** | Resolve body từ clause row hoặc `clauses_snapshot_json` — **không** hardcode |
| **Group publisher** | Publish thư viện điều khoản xuống member (RETAIN — ngoài phạm vi AC edit này) |

**Boundaries:**
- **IN:** edit `body_vi` (draft in-place vs issued version-bump), CREATE N+1 clause, token `{{x}}`, snapshot freeze verification, soft-retire, scope parity, FE resolve-not-hardcode.
- **OUT:** DnD clause reorder (cite peer **AC-PLT-CTR-03**), DOCX GĐ2, flip `contracts_printable_ready`, mega-EAV / second body SoT, reopen leave-balance/ATT L1, module CTR UAT, seed.

---

## 2. As-is vs to-be process

| Bước | AS-IS (LIVE evidence) | TO-BE (AC lock) |
|------|-----------------------|-----------------|
| Body store | `hrm_contract_clauses.body_vi TEXT NOT NULL` + `version INT DEFAULT 1` (migration `20260806`) | **RETAIN** làm body SoT duy nhất |
| Edit draft | `updateClause` cập nhật `body_vi` tại chỗ khi chưa issued | AC-PLT-CTR-CL-01 khóa happy-path 2xx→F5 |
| Edit issued | `updateClause` soft-block `HRM-CTR-CL-CODE-CONFLICT` khi active + đã có snapshot issued | AC-PLT-CTR-CL-02 khóa version-bump path |
| Freeze | `hrm_contract_print_versions.clauses_snapshot_json` giữ body tại thời điểm issue; `clauseHasIssuedSnapshot()` quét | AC-PLT-CTR-CL-03 khóa snapshot immutable |
| FE admin | `ContractLegalPrintSettingsPanel.tsx` có form `body_vi` + create/update/activate/retire LIVE | AC-PLT-CTR-CL-04/05/06 khóa hành vi FE |
| Token | `defaultXevnKeywordMap` dùng cú pháp `{{token}}` | **`{{x}}`** LOCK (Q-PLT-01) — một cú pháp / template |

**Kết luận GAP:** BE routes (`GET/POST/GET:id/PATCH/POST:activate contract-clauses`) + FE Settings panel + snapshot freeze **đều LIVE**. **Không có GAP build** → BE/FE **HOLD**. AC pack chỉ khóa nghiệm thu nghiệp vụ U65.

---

## 3. Use-case flows (happy · alternate · exception)

### UC-CTR-CL-EDIT-DRAFT (AC-PLT-CTR-CL-01)
```mermaid
sequenceDiagram
    actor Admin as HCNS/Settings admin
    participant FE as Settings clause panel
    participant API as PATCH /contract-clauses/:id
    participant DB as hrm_contract_clauses
    Admin->>FE: Mở clause draft/not-issued → sửa body_vi (đổi câu)
    FE->>API: PATCH { body_vi }
    API->>DB: UPDATE body_vi (version giữ nguyên/bump tùy chọn)
    DB-->>API: row updated
    API-->>FE: 200 HRM-CTR-CL-200
    FE-->>Admin: toast + list cập nhật
    Admin->>FE: F5
    FE-->>Admin: body mới hiển thị; preview draft dùng body mới
```
- **Alternate:** clause chưa từng issued → luôn edit in-place, không cần version bump.
- **Exception:** body_vi rỗng/thiếu → `HRM-CTR-CL-REQUIRED` (BE `assertClauseRequired`).

### UC-CTR-CL-EDIT-ISSUED (AC-PLT-CTR-CL-02)
```mermaid
sequenceDiagram
    actor Admin
    participant API as PATCH /contract-clauses/:id
    participant SNAP as clauseHasIssuedSnapshot()
    Admin->>API: PATCH body_vi (clause active + đã issued)
    API->>SNAP: kiểm tra snapshot issued
    SNAP-->>API: issued = true
    API-->>Admin: soft-block HRM-CTR-CL-CODE-CONFLICT (yêu cầu activate/version bump)
    Admin->>API: POST /contract-clauses/:id/activate (version++)
    API-->>Admin: 200 — version mới active; HĐ issued cũ giữ body cũ (snapshot)
```
- **Exception:** cố ghi đè im lặng (không qua activate) → phải bị chặn (VAL-CTR-CL-01).

### UC-CTR-CL-CREATE-N+1 (AC-PLT-CTR-CL-04)
- Happy: admin CREATE clause mới (mã tự do, `{{token}}` trong body) gắn `apply_to_packs` → `POST /contract-clauses` 201 → F5 list có row.
- Exception: trùng code active → `HRM-CTR-CL-CODE-CONFLICT` (UQ `(company_id, lower(code)) WHERE active`).

---

## 4. Acceptance criteria (measurable pass/fail — U65 browser, zero-seed)

| ID | Persona / UF · J-* | Precondition | Action (FE) | PASS (đo được) | FAIL |
|----|--------------------|--------------|-------------|----------------|------|
| **AC-PLT-CTR-CL-01** | HCNS · UF-CTR-CL-EDIT-DRAFT · J-HRM-CTR-CL-01 | Clause draft/active-not-issued tồn tại | Settings → mở clause → sửa `body_vi` (đổi câu, **không** paste full HĐ) → Lưu | Network `PATCH …/contract-clauses/:id` → **200 `HRM-CTR-CL-200`**; toast; list cập nhật; **F5** body mới còn; preview draft dùng body mới | FE body hardcode · Lưu OK nhưng F5 body cũ · chỉ API PASS không kiểm F5 |
| **AC-PLT-CTR-CL-02** | HCNS · UF-CTR-CL-EDIT-ISSUED · J-HRM-CTR-CL-02 | Clause active đã gắn ≥1 HĐ issued | Sửa `body_vi` → Lưu → nhận soft-block → bấm Kích hoạt (version bump) | PATCH → **`HRM-CTR-CL-CODE-CONFLICT`** (soft-block, không 500); sau activate → version mới active; **HĐ issued cũ mở lại giữ body cũ** | Ghi đè im lặng · HĐ issued đổi body hồi tố · lỗi 500 thay vì soft-block |
| **AC-PLT-CTR-CL-03** | Drafter · UF-CTR-CL-ISSUE-FREEZE · J-HRM-CTR-CL-03 | 1 template + mandatory clause | Issue print version → sau đó admin sửa body clause → mở lại **issued version** | Issued version body **không đổi** (snapshot freeze); draft mới dùng body mới | `clauses_snapshot_json` bị mutate khi edit sau issue |
| **AC-PLT-CTR-CL-04** | HCNS · UF-CTR-CL-CREATE · J-HRM-CTR-CL-04 | — | CREATE clause mới (mã tự do, `{{token}}` trong body) gắn pack → Lưu | `POST …/contract-clauses` **201 `HRM-CTR-CL-201`**; **F5** list có row mới; picker theo pack thấy clause | Từ chối admin như "invent" · danh sách clause đóng cứng · seed để có row |
| **AC-PLT-CTR-CL-05** | Consumer/render · BR-CTR-CL-03 | Clause có body | Preview / issue / PDF render | Body **resolve từ clause row / snapshot**; grep FE **không** có chuỗi body luật hardcode | FE hardcode body luật dài · Settings/XBOS là body SoT thứ 2 |
| **AC-PLT-CTR-CL-06** | HCNS · UF-CTR-CL-RETIRE · J-HRM-CTR-CL-05 | Clause active không mandatory | Soft-retire clause | `POST …/retire` 2xx; picker ẩn clause; **snapshot/HĐ issued cũ vẫn OK**; F5 giữ trạng thái retired | Hard-delete làm mồ côi snapshot · retire xong HĐ issued lỗi render |
| **AC-PLT-CTR-CL-H** | Governance honesty | — | — | `contracts_printable_ready=false`; **không** module CTR UAT; **không** reopen seals; **không** DnD/DOCX seat này; U65; **`C-SLICE-≠-MODULE`** ghi rõ trong evidence | Flip flags · reopen seals · scope creep · claim module DONE |

### 4.1 Validation matrix

| VAL | Điều kiện | Kỳ vọng | FAIL |
|-----|-----------|---------|------|
| **VAL-CTR-CL-01** | Sửa body clause đã issued không qua version bump | soft-block `HRM-CTR-CL-CODE-CONFLICT` | Silent accept / hồi tố |
| **VAL-CTR-CL-02** | Scope: `list` vs `get-by-id` vs consumer resolve | cùng scope resolver (`toHrmListScopeContext`) — jest `scope_parity` PASS | Drift list↔get-by-id (U19/L-CTR-CL-08) |
| **VAL-CTR-CL-03** | Token dual (`{{}}` + `#x#`) cùng template | reject / một cú pháp | Chấp nhận dual |
| **VAL-CTR-CL-04** | `body_vi` rỗng khi create/update | `HRM-CTR-CL-REQUIRED` | 500 / lưu rỗng |
| **VAL-CTR-CL-05** | Trùng `code` active | `HRM-CTR-CL-CODE-CONFLICT` (UQ) | Tạo trùng active |

---

## 5. Business rule table (condition → action → outcome)

| BR | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-CTR-CL-01** | Clause active đã có snapshot issued + đổi `body_vi` | Chặn edit in-place → yêu cầu activate/version++ | HĐ cũ giữ body qua snapshot; version mới cho HĐ mới |
| **BR-CTR-CL-02** | Issue print version thiếu mandatory clause | Chặn In (`HRM-CTR-ISSUE-BLOCKED`) | Không phát hành thiếu điều khoản bắt buộc |
| **BR-CTR-CL-03** | FE cần hiển thị body luật | Resolve từ clause row / snapshot | **Cấm** hardcode body luật ở FE (QA/lint FAIL) |
| **BR-CTR-CL-04** | Group publish thư viện clause | RETAIN publish/pull versioned + lineage | Member nhận bản versioned, không SoT mới |
| **BR-CTR-CL-05 (token)** | Token trong `body_vi` | Dùng `{{x}}` (Q-PLT-01) | Một cú pháp merge / template; map qua `keyword_map` |

---

## 6. Token syntax decision

**Confirmed `{{x}}` LOCK (Q-PLT-01).** Bằng chứng LIVE: `defaultXevnKeywordMap` + `keyword_map` per template dùng `{{token}}`. AC cấm dual-syntax trong một template (VAL-CTR-CL-03). Không phát sinh cú pháp thứ 2 (`#x#`, `${x}`) trong CTR.

---

## 7. Conditional ba-data trigger — DECISION: **NO (ba-data stays HOLD)**

| Câu hỏi (SA §9) | Phân tích BA | Kết luận |
|------------------|--------------|----------|
| Có yêu cầu **admin xem lịch sử body cũ** vượt ngoài print snapshot không? | Nhu cầu nghiệp vụ hiện tại: (a) HĐ issued cũ phải giữ body cũ → **snapshot `clauses_snapshot_json` đã phục vụ đủ**; (b) admin cần biết version hiện tại → `version` cột đã có; (c) chưa có AC nào yêu cầu duyệt/khôi phục body draft cũ theo dòng thời gian. | **Không kích hoạt** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-DATA-01`. Không thêm `hrm_contract_clause_versions`. ba-data **HOLD** giữ nguyên. |

> Trigger để mở lại (future): nếu sponsor/PO yêu cầu màn "lịch sử chỉnh sửa điều khoản" (audit body draft theo thời gian, khôi phục bản nháp cũ) mà snapshot issued không đáp ứng → khi đó mới ADD append-only `hrm_contract_clause_versions` (soft FK, immutable). **FORBIDDEN** mega-EAV / body SoT thứ 2.

---

## 8. GAP analysis — BE/FE HOLD (no build)

| Surface | LIVE evidence | GAP? |
|---------|---------------|------|
| BE list/get/create/update/activate/retire clause | `contracts-insurance.controller.ts` L549–617 + service `createClause`/`updateClause`/`clauseHasIssuedSnapshot` | **NO GAP** |
| BE snapshot freeze | `clauses_snapshot_json` JSONB + `clauseHasIssuedSnapshot()` | **NO GAP** |
| FE admin body_vi form + CRUD + activate + retire | `ContractLegalPrintSettingsPanel.tsx` (`body_vi` form, `createContractClause`/`updateContractClause`/`activateContractClause`/`retireContractClause`) | **NO GAP** |
| Scope parity | `toHrmListScopeContext` áp cho list; get-by-id dùng cùng context | Xác nhận qua VAL-CTR-CL-02 (QA jest) — **no build**, chỉ verify |

**Kết luận:** không mở dev-be/dev-fe cho seat này. Việc kế = **QA** chạy AC-PLT-CTR-CL-01..06 trên browser U65 (nếu PM muốn nghiệm thu slice), giữ honesty flags false.

---

## 9. Handoff package (SA/Dev/QA expectations)

| Người nhận | Kỳ vọng | Done criteria |
|-----------|---------|---------------|
| **PM** | Nhận AC pack; quyết định mở QA slice hay giữ HOLD | AC pack CONFIRMED; ba-data HOLD; BE/FE HOLD ghi bus |
| **QA (nếu PM mở)** | Chạy AC-PLT-CTR-CL-01..06 + VAL-CTR-CL-01..05 browser U65 zero-seed; evidence có URL + click path + Network 2xx + F5 | Verdict mỗi AC 🟢/🟡/🔴; không seed; không flip printable |
| **ba-data** | **HOLD** — không physicalize | Chỉ mở nếu future history trigger (§7) |
| **dev-be/dev-fe** | **HOLD** — no GAP | Chỉ mở nếu QA phát hiện wiring gap cụ thể |

---

## 10. Assumptions · dependencies · open clarifications

- **Assumption:** `clauses_snapshot_json` bảo toàn body issued (đã verify trong `clauseHasIssuedSnapshot`); `{{x}}` nhất quán với `keyword_map`.
- **Dependency:** print-spine GWC slice **RETAIN** — AC này **không** mở lại.
- **Open (non-blocking):** màn "lịch sử body" chưa có AC → theo dõi; nếu sponsor yêu cầu → mở ba-data theo §7.

---

## 11. Honesty

| Flag | Value |
|------|-------|
| `contracts_printable_ready` | **false** |
| `payroll_e2e_ready` | **false** |
| Module CTR UAT / Phase1 | **DENIED** |
| DnD reorder / DOCX GĐ2 | **OUT** (cite peer AC-PLT-CTR-03) |
| `C-SLICE-≠-MODULE` | **RETAIN** |
| Seals reopened | **NONE** (leave-balance / ATT-CODE/WS/SHIFT / EMP / SI / PAY / DEC / MergeToken) |
| This seat | Docs-only AC pack (ADD) |

---

## 12. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-ba-01.md` |
| **next_owner** | **pm** → (optional) **qa** browser slice · ba-data & BE/FE **HOLD** |
| **completion_report** | AC pack AC-PLT-CTR-CL-01..06 + AC-PLT-CTR-CL-H + VAL-CTR-CL-01..05 authored from SA Option B stubs. Token `{{x}}` LOCK confirmed. Conditional ba-data trigger evaluated → **NO** (snapshot serves; ba-data HOLD). GAP analysis → **NO build GAP** (BE routes + FE Settings panel + snapshot freeze all LIVE) → BE/FE HOLD. DnD reorder + DOCX GĐ2 OUT (cite peer AC-PLT-CTR-03). Honesty flags false; seals retained; no `apps/**`; U65 zero-seed. |
| **next_dispatch_prompt** | See evidence §Next dispatch |