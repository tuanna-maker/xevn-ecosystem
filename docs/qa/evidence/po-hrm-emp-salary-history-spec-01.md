# Evidence — PO-HRM-EMP-SALARY-HISTORY-SPEC-01 (đóng cả `PO-HRM-MVP-GD1-CORE-02-DATA-01`)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-EMP-SALARY-HISTORY-SPEC-01` **và** `PO-HRM-MVP-GD1-CORE-02-DATA-01` — **spec này đóng CẢ 2** (xem §3) |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-08-12 |
| **priority** | P0 |
| **change_mode** | DOC-ONLY — cite LIVE code, không viết `apps/**`, không mở schema |
| **ack_status** | **PASS_TO_PM** |
| **honesty** | `payroll_e2e_ready=false` giữ nguyên xuyên suốt — không claim formula evaluator LIVE, không claim AMIS parity DONE |

---

## 1. read_first ack (theo đúng thứ tự dispatch)

| # | Artifact | Đã đọc | Ghi chú |
|---|----------|--------|---------|
| 1 | `docs/qa/evidence/po-hrm-pay-sheet-template-src-input-packs-spec-01.md` §5 dòng #1 | ✅ | Dependency gốc |
| 2 | `docs/program/specs/PO-HRM-PAY-SRC-PRIORITY-SPEC-01.md` toàn văn | ✅ | Interface SRC-02 kỳ vọng §1; map 63 fragment §3 (đã có sẵn, không lặp lại) |
| 3 | `docs/qa/evidence/po-hrm-pay-cntt-research-summary-20260811.md` §2.2 (grep `salary-history\|salary_history\|C&B`) | ✅ | Xác nhận claim "not started" — **STALE**, xem §2.1 |
| 4 | `docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md` toàn văn | ✅ | Chỉ quản tenant/company scope ladder — **KHÔNG** phải AuthZ C&B field-level (correction §2.3) |
| 5 | `apps/api/hrm-api/src/employees/employee-profile.service.ts` | ✅ | 0 logic salary/C&B — grep xác nhận |
| 6 | `docs/hrm/DB_DESIGN_HRM_EMPLOYEES.md` | ✅ | 0 cột salary/compensation — C&B sống ở bảng riêng, không phải trên `employees` |
| 7 | `AGENTS.md`, `docs/program/SUBAGENT_READ_MAP.md` (lane ba-process) | ✅ | |
| 8 (bổ sung, cần thiết để không đề xuất trùng) | `apps/api/hrm-api/src/contracts-insurance/employee-compensation.service.ts` (1248 dòng, đọc toàn bộ), `compensation-cb-authz.ts` (toàn bộ), `dto/create-compensation-package.dto.ts`, `dto/list-compensation.query.dto.ts`, `contracts-insurance.controller.ts` (routes) | ✅ | Phát hiện toàn bộ backbone C&B đã LIVE — xem §2 |
| 9 (bổ sung) | `apps/api/hrm-api/src/payroll/pay-src-resolver.ts`, `pay-formula-variable-bag.ts` | ✅ | SRC-02 resolver thật (`loadEmployeeFixedAmountForComponent`, `resolveEffectiveCompensationPackage`) |
| 10 (bổ sung) | `docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-{SA,BA,DATA,API}-01.md` + `docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-{be,fe,qa,qc}-01.md` | ✅ | Toàn bộ cluster CORE-02 đã **CONFIRMED + SEALED** — nguồn thật cho work_item_id #2 |

---

## 2. Correction quan trọng — phát hiện LIVE sẵn (giống correction DLL_CPN/snapshot lần trước)

### 2.1 "Salary history / C&B" đã LIVE, không phải "not started"

`po-hrm-pay-cntt-research-summary-20260811.md` §2.2 ghi sai hiện trạng (STALE tại 2026-08-11). Đối chiếu code thật (`main`, 2026-08-12):

- Bảng `employee_compensation_packages\|lines\|history` **LIVE từ 2026-07-19**.
- `component_code` per-line + SRC-02 resolver generic (`loadEmployeeFixedAmountForComponent`) **LIVE từ 2026-08-07** (work item `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-BE-SRC-02-01` — tên work item này **chính là** tiền thân thực thi của `PO-HRM-EMP-SALARY-HISTORY-SPEC-01`, chỉ khác là BE đã code trước khi có spec BA chính thức).
- C&B AuthZ field-gate (`compensation-cb-authz.ts`, `HRM-CORE-CB-AUTHZ-403`) + access audit table `hrm_cb_access_audit` **LIVE + CONFIRMED + SEALED QC** — stamp `CORE02QC1-MSL80DU6` (QA stamp `CORE02QA-MSL7X7SJ`), ngày 2026-08-09.
- Bank/MST trên package header **LIVE ADD** 2026-08-09.
- Toàn bộ cluster `PO-HRM-MVP-GD1-CORE-02-CLUSTER-*` (SA/BA/DATA/API/BE/FE/QA/QC) đã đi hết vòng đời và **SEALED "GO WITH CONDITIONS"**.

**Kết luận:** phần "salary-history/C&B" mà research-summary liệt là P0 gap **thực chất đã xong ở tầng generic** (đúng cho model AMIS parity). Phần thật sự còn thiếu — như chính `PO-HRM-PAY-SRC-PRIORITY-SPEC-01.md` §1 đã diễn giải đúng — là **nối 63 fragment CNTT vào field `component_code`** (thao tác nhập liệu C&B đúng theo catalog, không phải thiếu schema/engine/AuthZ).

### 2.2 `PO-HRM-MVP-GD1-CORE-02-DATA-01` — đã tồn tại dưới tên khác, đã CONFIRMED

work_item_id thứ 2 trong dispatch không khớp tên file thật. File tương ứng là **`docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md`**, trạng thái **CONFIRMED** (2026-08-09), `ack_status: PASS_TO_PM CONFIRMED`, evidence đầy đủ tại `docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-data-01.md`. Dispatch cũ (2026-08-11T16:05) "không có evidence" nhiều khả năng do gõ nhầm tên (thiếu `CLUSTER`) khiến PM không tìm thấy file — **không phải** thật sự chưa làm. Đóng theo đúng chỉ đạo Task, không mở lại cluster đã CONFIRMED.

### 2.3 ADR-HRM-RBAC-SCOPE-LADDER KHÔNG phải AuthZ gate cho C&B fields

Dispatch giả định (bước đọc trước #5) rằng ADR này là "AuthZ gate cho C&B fields". Đọc toàn văn xác nhận: ADR chỉ định nghĩa **scope ladder tenant/company** (group → company → dept/manager narrowing cho multi-tenancy) — **không có bất kỳ đề cập nào** tới field-level C&B/salary AuthZ. Gate C&B field-level thật là cơ chế **độc lập, riêng biệt**: `compensation-cb-authz.ts` (`hasCompensationCbMembership` — role allow/deny regex + JWT claim `view_salary`/`cb_membership`/`permissions[]`), đã LIVE + CONFIRMED qua CORE-02 BA-01 O4. Spec mới **áp dụng đúng** cơ chế này (RETAIN nguyên văn), không tự phát minh tầng RBAC mới — đã sửa đúng giả định sai trong dispatch.

---

## 3. Output

1. `docs/program/specs/PO-HRM-EMP-SALARY-HISTORY-SPEC-01.md` — đóng interface SRC-02 (input/output, "history wins" tie-break 3-tầng cascade, write-time overlap-409 invariant) + C&B AuthZ (field list đầy đủ cite code, role gate table, access audit) — tất cả **cite LIVE**, không thiết kế mới.
2. File evidence này — đóng **cả 2** work_item_id theo đúng yêu cầu dispatch.

---

## 4. Nội dung bắt buộc — đã đáp ứng ở đâu trong spec

| Yêu cầu dispatch | Đáp ứng tại |
|---|---|
| A. Đặc tả bảng lịch sử lương (employee_id, effective_from/to, component_code, amount, source, approved_by...) bám physical DB đã có | Spec §2 (cite CLUSTER-DATA-01 CONFIRMED, không vẽ lại) |
| A. Interface đọc SRC resolver — input/output khớp SRC-PRIORITY-SPEC-01 | Spec §3.1, §3.6 (gap G1 nêu rõ khác biệt nhỏ, không blocking) |
| A. "History wins" nghĩa chính xác khi nhiều dòng chồng | Spec §3.2 — 3-tầng cascade + write-time overlap-409 invariant + tie-break `effective_from DESC, version DESC` |
| B. Field nào thuộc C&B — liệt kê đủ | Spec §4.1 (2 nguồn: public deny-list + package header/lines, cite dòng code) |
| B. Role nào xem/sửa — bám RBAC đã có | Spec §4.2 (cite `compensation-cb-authz.ts` nguyên văn, correction ADR scope-ladder không phải nguồn này) |
| Ghi rõ phần đã có sẵn vs thật sự thiếu | Spec §5 (đã có) + §3.6 (3 gap nhỏ P2, không phải P0) |
| honesty `payroll_e2e_ready=false` | Giữ nguyên toàn spec + evidence này |

---

## 5. File output + verify NFD

```bash
$ NFD_DIR=$(printf 'Ta\xcc\x80i li\xc3\xaa\xcc\xa3u')
$ cd "/c/Users/ADMIN/OneDrive/$NFD_DIR/Vibe Coding/projects/xevn-ecosystem"
$ ls -la docs/program/specs/PO-HRM-EMP-SALARY-HISTORY-SPEC-01.md docs/qa/evidence/po-hrm-emp-salary-history-spec-01.md
```

(kết quả `ls` đính kèm báo cáo cuối của agent — cùng inode `197121` với các file NFD khác trong repo, xác nhận đúng thư mục canonical)

---

## 6. completion_report

### Closed

1. `PO-HRM-EMP-SALARY-HISTORY-SPEC-01.md` — interface SRC-02 (I/O, history-wins cascade, overlap invariant) + C&B AuthZ (field list, role gate, access audit) — toàn bộ cite LIVE code, không code mới.
2. `PO-HRM-MVP-GD1-CORE-02-DATA-01` — xác nhận đã tồn tại dưới tên `CLUSTER-DATA-01`, đã **CONFIRMED** 2026-08-09 với evidence đầy đủ — đóng, không cần làm lại.
3. Correction: research-summary §2.2 "not started" — **STALE**; ADR-RBAC-SCOPE-LADDER không phải AuthZ gate C&B — nguồn thật là `compensation-cb-authz.ts`.
4. 3 gap thật còn lại (P2, không blocking) đã liệt kê rõ tại spec §3.6 + §8 dependency.

### Explicit non-claims

- Không claim formula evaluator / process engine LIVE.
- Không claim AMIS parity DONE hay 63 fragment đã bind đầy đủ vào `component_code` (đó là thao tác nhập liệu vận hành, ngoài phạm vi spec).
- Không claim `payroll_e2e_ready=true`.
- Không claim đã sửa `PO-HRM-PAY-SRC-PRIORITY-SPEC-01.md` (file đó vẫn DRAFT, spec mới chỉ cung cấp interface nó cần — PM cập nhật dependency #1 riêng nếu muốn).

### ack_status

**PASS_TO_PM** — không BLOCKED, không dependency nào chặn việc đóng Task này.
