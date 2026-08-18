# QA R2 — QA-PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01-R2

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01-R2` |
| **parent** | `PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01` |
| **retest_of** | FAIL `PAYPPQA-MSPX1M4T` (`qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01.md`) |
| **restore_ref** | `D-PAY-CNTT-FE-POLICY-PACK-RESTORE-01` (dev-fe READY_FOR_QA, vitest 20/20) |
| **from_role** | `qa` → **to_role** `pm` |
| **date** | 2026-08-12 |
| **ack_status** | **`PASS_TO_PM`** |
| **stamp** | **`PAYPPQAR2-MSPXZL1G`** |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · `tenantId=xevn` |
| **commit** | `5ccb26e` |
| **u65** | zero-seed · **browser-only** · no `pnpm seed:*` · no DB write — mọi row test tạo **từ FE** |
| **honesty** | `payroll_e2e_ready=false` (không flip) · formula evaluator **HOLD** · **≠** UF-HRM-10 · **≠** RIÊNG/STP-02/05/06 |

---

## L0 / môi trường

| Gate | Result |
|------|--------|
| Portal `:5173` / HRM FE `:8080` | both **HTTP 200** |
| xbos-api `:28002` login `ceo@xe.vn` | **201** + accessToken |
| hrm-api `:28001` `pay-policy-packs` | reachable (list GET **200** trên cả 2 mode) |
| Console (page errors) | **0** trên cả portal + standalone |
| Chạy từ đường dẫn canonical NFD (không junction ASCII) | ✔ |

---

## Modes (U65 — browser)

| Mode | URL | Hub + list | Verdict |
|------|-----|------------|---------|
| **portal embed** | `http://127.0.0.1:5173/hr/payroll/setup?portal=1&tenantId=xevn&companyId=main&section=policy-pack` | `pay-stp-hub-root` + `pay-policy-pack-list` · honesty banner «Thiết lập đã lưu ≠ chạy bảng lương kỳ — payroll_e2e_ready=false» | **PASS** |
| **standalone** | `http://127.0.0.1:8080/hr/payroll/setup?section=policy-pack&companyId=main&tenantId=xevn` | same | **PASS** |

Click path (cả hai): inject session `ceo@` → `/hr/payroll/setup` → nav **Gói chính sách** → `pay-policy-pack-list` visible.

---

## AC matrix (exit criteria) — cả 2 mode PASS

| AC | Click path (persona `ceo@` · `company_id=main`) | Trước mutate | Action | Network | FE sau 2xx | F5 | Verdict |
|----|------|------|------|---------|------------|-----|---------|
| **AC-PAY-STP-01-01** tạo CHUNG | Gói chính sách → `+ Thêm gói` → form TẠO → Mã/Tên/Hiệu lực từ 01/07/2026 (+KPI 70 +BCC 5.000.000) → **Lưu gói chính sách** | list N gói | submit create | `POST /api/hrm/payroll/pay-policy-packs` → **201** · body `{code, nameVi, scope:"CHUNG", effectiveFrom:"2026-07-01", status:"draft", rateParams{...}}` | dòng mới `pay-policy-pack-row-qar2porxzl1g` (portal) / `…-qar2staxzl1g` (standalone) xuất hiện | dòng **còn** sau reload | 🟢 **PASS** |
| **AC-PAY-STP-01-02** sửa KPI+BCC persist | click dòng → KPI 85 + BCC 5.000.000 → **Cập nhật** → F5 → mở lại dòng | KPI/BCC prefill | edit submit | `PATCH …/{id}` → **200** · body `rateParams.kpi_threshold=85`, `bcc_std=5000000` | form cập nhật | KPI F5=**85**, BCC F5=**5.000.000** | 🟢 **PASS** |
| **AC-PAY-STP-01-03** archive (regression) | click dòng → **Ngưng áp dụng** | dòng hiển thị | archive | `POST …/{id}/archive?company_id=main` → **201** | dòng ẩn | ẩn khỏi list mặc định sau F5 | 🟢 **PASS** |
| **AC-PAY-STP-01-05** ngày sai thứ tự | click dòng → Hiệu lực từ 01/06/2026, đến 01/01/2026 → **Cập nhật** | — | submit đảo ngày | **NONE** (không request) | message VI «Hiệu lực đến phải sau hiệu lực từ» | N/A (client validation) | 🟢 **PASS** |
| **AC-PAY-STP-03-01** KPI=150 | click dòng → KPI 150 → **Cập nhật** | — | submit KPI ngoài dải | **NONE** (client chặn) | ô KPI **viền đỏ** + «KPI threshold phải từ 0 đến 100» | N/A | 🟢 **PASS** |
| **AC-PAY-STP-04-01** BCC 5000000 | click dòng → BCC gõ `5000000` → **Cập nhật** | — | edit BCC | `PATCH …/{id}` → **200** · `rateParams.bcc_std=5000000` (**number thuần**, không chuỗi/không dấu chấm) | hiển thị **5.000.000** (nhóm nghìn vi-VN) | verified với 01-02 | 🟢 **PASS** |

---

## testid registry (live — cả 2 mode)

| testid | Live |
|--------|------|
| `pay-policy-pack-list` | 🟢 present |
| `pay-policy-pack-save` | 🟢 present trên **cả** form Tạo (create POST) **và** form Sửa (edit PATCH) |
| `pay-policy-pack-archive` | 🟢 archive POST 201 |
| `pay-params-kpi-threshold` | 🟢 present; string 0–100; 150 → viền đỏ |
| `pay-params-bcc-std` | 🟢 present; nhóm nghìn vi-VN; body number thuần |
| `pay-policy-pack-row-{code}` | 🟢 `pay-policy-pack-row-qar2porxzl1g` / `…-qar2staxzl1g` (BE lowercase code) |

---

## Console / quality gate

- **Uncaught / page errors:** 0 (cả portal + standalone).
- **Mojibake tiếng Việt:** không — «Thiết lập lương», «Gói chính sách CHUNG», «Ngưng áp dụng», «Cập nhật» hiển thị đúng dấu.
- **Duplicate shell header:** không — một thanh brand/scope duy nhất.
- **GET storm:** không — mỗi mutate = **một** GET refresh list; không auto-reload lặp.
- **Honesty banner:** hiển thị `payroll_e2e_ready=false` — không bị gỡ (must_keep giữ nguyên).

---

## Ghi chú trung thực (side effect)

- Tất cả dòng dùng cho edit/archive được **tạo từ FE** trong phiên test (U65 — **không seed**, không ghi DB trực tiếp).
- BE **lowercase** mã gói khi lưu (`QAR2PORXZL1G` → `qar2porxzl1g`); testid dòng bám `item.code` trả về → không phải defect.
- Dòng leftover FE-created từ lần chạy harness trước (mismatch casing, đã 201): `qar2porxwdp4`, `qar2staxwdp4` còn ở trạng thái `draft` (chưa archive). Là data tạo qua FE, **không** phải seed. PM có thể để dev/QA dọn qua nút «Ngưng áp dụng» nếu cần density sạch — không chặn verdict.

---

## Đối chiếu defect FAIL cũ (PAYPPQA-MSPX1M4T) — đã đóng

| Defect cũ | Sev | Trạng thái R2 |
|-----------|-----|----------------|
| `DEF-PAY-STP-CREATE-FORM-MISSING` | P0 | ✅ Fixed — `+ Thêm gói` mở form TẠO, POST 201 |
| `DEF-PAY-STP-DATE-ONCHANGE` | P0 | ✅ Fixed — ViDateField `onValueChange`; ngày commit ISO; AC-01-05 fire đúng |
| `DEF-PAY-STP-BCC-ONCHANGE` | P0 | ✅ Fixed — ViMoneyInput `onValueChange`; nhóm nghìn + number thuần |
| `DEF-PAY-STP-BCC-TESTID-MISSING` | P1 | ✅ Fixed — `pay-params-bcc-std` live |
| `DEF-PAY-STP-KPI-TYPE` | P0 | ✅ Fixed — KPI string 0–100, viền đỏ + MSG_KPI_RANGE |
| `DEF-PAY-STP-STATUS-LABEL` | P1 | ✅ Fixed — `POLICY_PACK_STATUS_LABEL_VI` cho option; dropdown «Nháp/Đang áp dụng/Đã ngưng» |
| `DEF-PAY-STP-VITEST-STALE` | P1 | ✅ Fixed — restore đưa vitest 20/20 PASS (dev-fe evidence) |

> **Ghi chú harness (không phải defect sản phẩm):** hai lần chạy đầu FAIL do lỗi harness — (1) `getByLabel('Tên gói')` trùng aria-label ô tìm kiếm «Tìm mã hoặc tên gói» → tên gõ nhầm vào ô search; (2) tra dòng theo mã UPPER trong khi BE lowercase. Đã sửa harness (fill trong phạm vi `form`, resolve mã từ POST response) → PASS ổn định cả 2 mode.

---

## Artifacts

| Artifact | Path |
|----------|------|
| Evidence (this) | `docs/qa/evidence/qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01-r2.md` |
| Runtime JSON | `docs/qa/evidence/_tmp-qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01-r2.json` |
| Screens | `docs/qa/evidence/screens/qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01-r2/` |
| Harness (v2b, passing) | `scripts/qa/_tmp-qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01-r2b.mjs` |
| Restore handoff | `docs/qa/evidence/d-pay-cntt-fe-policy-pack-restore-01.md` |
| FAIL đóng | `docs/qa/evidence/qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01.md` (PAYPPQA-MSPX1M4T) |

Key screenshots: `*-03-after-create.png` (row mới), `*-04-create-f5.png` (F5 giữ), `*-05-kpi-150.png` (viền đỏ + message), `*-07-bcc-patch.png` (5.000.000 + PATCH), `*-08-patch-f5.png` (KPI 85 persist), `*-09-archive-f5.png` (ẩn sau archive).

---

## Verdict

**PASS_TO_PM** — 6/6 AC exit criteria PASS trên **cả** portal embed (:5173) **và** standalone (:8080); testid registry đầy đủ live; console sạch (0 error, không mojibake, không duplicate header, không GET storm); FAIL pack `PAYPPQA-MSPX1M4T` đóng hoàn toàn. Scope giữ **CHUNG-only** · `payroll_e2e_ready=false` không flip · RIÊNG/STP-02/05/06 **không** claim.

---

## completion_report

**Closed:** Retest R2 CHUNG policy pack sau restore — create (POST 201 + F5), edit KPI+BCC persist (PATCH 200 + F5), archive (POST 201 + hide), date-order block FE, KPI 0–100 red-border, BCC vi-VN grouping + number thuần. Cả 2 mode PASS; 7 defect P0/P1 cũ đóng. must_keep (hub root, honesty banner, archive POST, CHUNG-only) giữ nguyên.

**Open / residual:**
- `R-PAY-STP-RIENG` — Tab RIÊNG + BP filter + geo/VP allowance (STP-02/05/06) — **chưa mở** (FE follow-up).
- `formula HOLD` — FE không eval công thức.
- `payroll_e2e_ready=false` — không claim UAT kỳ lương / UF-HRM-10.
- Data hygiene (tùy chọn, không chặn): dọn 2 dòng FE-created leftover `qar2porxwdp4`/`qar2staxwdp4` qua «Ngưng áp dụng».

## next_owner

`pm` → **`qc`** gate cho slice POLICY-PACK-01 (GO/GWC), rồi dispatch **`dev-fe`** mở RIÊNG/STP-02.

## next_dispatch_prompt

```text
work_item_id: QC-PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01
role: qc
lane: governance
read_first:
  - docs/qa/evidence/qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01-r2.md   # QA PASS_TO_PM (PAYPPQAR2-MSPXZL1G)
  - docs/qa/evidence/d-pay-cntt-fe-policy-pack-restore-01.md             # restore READY_FOR_QA, vitest 20/20
  - docs/qa/evidence/qc-po-hrm-pay-cntt-be-01.md                         # BE GWC CNTTBEQC1-MSO8HVERQC1
entry_criteria: QA R2 PASS_TO_PM cả portal :5173 + standalone :8080; 6/6 AC PASS; console clean; U65 zero-seed
gate_scope:
- Xác nhận 6 AC (create/edit/archive/date-order/KPI-range/BCC-locale) PASS FROM FE, không seed
- Xác nhận honesty giữ: payroll_e2e_ready=false; formula HOLD; scope CHUNG-only; ≠ RIÊNG/STP-02/05/06; ≠ UF-HRM-10
- GO chỉ cho slice CHUNG POLICY-PACK-01; residual RIÊNG/STP-02/05/06 = out-of-scope (không tính vào GO)
exit_criteria: GO | GO WITH CONDITIONS (liệt kê residual) ; ghi qc evidence + bus
cấm: promote payroll module DONE; flip payroll_e2e_ready; claim RIÊNG/STP-02/05/06
evidence_path: docs/qa/evidence/qc-po-hrm-pay-cntt-fe-stp-01-policy-pack-01.md
ack_status target: PASS_TO_PM
```

**ack_status:** `PASS_TO_PM`
**evidence_path:** `docs/qa/evidence/qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01-r2.md`

---

## Cleanup + a11y observation

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01-R2-CLEANUP` |
| **resume** | after `SPONSOR_PAUSE` 2026-08-12 |
| **date** | 2026-08-12 |
| **stamp** | `PAYPPCLEAN-MSQ36WW7` |
| **u65** | zero-seed � browser-only � **no SQL** � **no direct API mutate** � archive ch? qua FE �Ng�ng �p d?ng� |
| **persona** | `ceo@xe.vn` � `company_id=main` � `tenantId=xevn` |
| **L0** | `qc:dev-stack` HRM+XBOS+portal **200** tr�?c harness |
| **ack_status** | **`PASS_TO_PM`** |

> **Note:** Section n�y **APPEND-only** � kh�ng s?a / kh�ng �?ng verdict R2 `PAYPPQAR2-MSPXZL1G` ? tr�n.

### 1) Archive leftover rows (FE)

Click path (portal embed :5173): inject session `ceo@` ? `/hr/payroll/setup?portal=1&�&section=policy-pack` ? `pay-policy-pack-list` ? click row ? **Ng�ng �p d?ng** ? F5.

| Code | Mode | Before | Action | Network | FE sau 2xx | F5 default list | Verdict |
|------|------|--------|--------|---------|------------|-----------------|---------|
| `qar2porxwdp4` | portal | row visible `pay-policy-pack-row-qar2porxwdp4` | click ? **Ng�ng �p d?ng** | `POST �/pay-policy-packs/75ae95fa-�/archive?company_id=main` ? **201** | row ?n | **gone** | ?? |
| `qar2staxwdp4` | portal | row visible `pay-policy-pack-row-qar2staxwdp4` | click ? **Ng�ng �p d?ng** | `POST �/pay-policy-packs/ae0a0113-�/archive?company_id=main` ? **201** | row ?n | **gone** | ?? |
| c? 2 m? | standalone :8080 | � | confirm list m?c �?nh | � | � | **kh�ng** c?n trong list (�? archive t? portal; c�ng BE) | ?? |

`remainingAfterF5` (portal + standalone): **[]**

### 2) a11y observation (optional � QC opened `DEF-PAY-STP-SEARCH-ARIA-P2`)

Live capture tr�n portal (form t?o + list):

| Control | Observed accessible name | Notes |
|---------|--------------------------|-------|
| Search input | `aria-label="T?m ki?m trong danh s�ch g�i"` � placeholder `T?m m?/t�n�` | **Kh�ng** c?n substring �T�n g�i� trong aria-label (kh�c snapshot QC c? �T?m m? ho?c t�n g�i�) |
| Name field | `<Label htmlFor="nameVi">T�n g�i (VI)</Label>` ? `#nameVi` | Kh�ng c� `aria-label` ri�ng � name qua label |
| Playwright `getByLabel(/T�n g�i/i)` | **match_count = 1** (ch? `#nameVi`) | Observation � kh�ng PASS/FAIL a11y ? WI cleanup; QC quy?t �?nh ��ng `DEF-PAY-STP-SEARCH-ARIA-P2` |

### Artifacts (cleanup)

| Artifact | Path |
|----------|------|
| Runtime JSON | `docs/qa/evidence/_tmp-qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01-r2-cleanup.json` |
| Screens | `docs/qa/evidence/screens/qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01-r2-cleanup/` |
| Harness | `scripts/qa/_tmp-qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01-r2-cleanup.mjs` |

### Cleanup verdict

**PASS_TO_PM** � c? hai leftover `qar2porxwdp4` + `qar2staxwdp4` �? archive t? FE (portal POST archive **201** �2) v� **kh�ng** c?n tr�n default list sau F5 (portal + standalone confirm). a11y search/name ghi nh?n cho QC (DEF-PAY-STP-SEARCH-ARIA-P2). Scope kh�ng m? r?ng; R2 verdict g?c **kh�ng �?i**.
