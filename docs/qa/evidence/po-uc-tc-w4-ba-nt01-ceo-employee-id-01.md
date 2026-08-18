# Evidence — `PO-UC-TC-W4-BA-NT01-CEO-EMPLOYEE-ID-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-BA-NT01-CEO-EMPLOYEE-ID-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | governance |
| **priority** | P2 |
| **ack_status** | **PASS_TO_PM** |
| **U65** | honored — triage only · no seed · no invent Leave L2 PASS |
| **trigger** | Residual `R-W4-B3-NT01-CEO-EMPLOYEE-ID-GAP` · QA W4-B3 NT-01 BLOCKED under `ceo@xe.vn` |
| **prior** | [`po-uc-tc-w4-qa-b3-hrm-nt-rollup.md`](po-uc-tc-w4-qa-b3-hrm-nt-rollup.md) · by-uc [`HRM-NT-01.md`](../professional/by-uc/HRM-NT-01.md) |
| **uat_done** | **false** |

---

## 1. Mission

Clarify AC for **holding Group CEO** (`ceo@xe.vn`) when JWT membership has **no `employee_id`**: Option A empty-by-design vs B broadcast-only vs C ops mapping. Lock HP persona for NT-01 execution. **Cấm** apps/** · seed · invent Leave L2 PASS · claim UAT DONE.

---

## 2. Spec read (process truth)

| Source | Rule | Notes |
|--------|------|-------|
| `docs/hrm/SRS.md` **UC-HRM-12** | Thiếu `company_id` / **`employee_id` UUID hợp lệ** → `HRM-ERR-VALIDATION` | Viewer **must** supply employee UUID to call inbox |
| UC-HRM-12 (else) | List = rows `recipient_employee_id IS NULL` (broadcast CT) **OR** = `employee_id` người xem (tin cá nhân) | Broadcast **still requires** viewer `employee_id` on query |
| UC-HRM-11 fanout | Quyết định dịch vụ: nếu `employee_id` NULL → không tạo inbox đích danh NV; vẫn có broadcast CT | Distinct from “CEO không có employee_id” |
| `ListInboxQueryDto` | `@IsUUID() employee_id` bắt buộc | AS-IS contract |
| `HrmInboxService.listInbox` | Filter `(recipient_employee_id IS NULL OR recipient_employee_id = $viewer)` | B **partially AS-IS** when viewer UUID present |
| `HrmInboxService.markRead` | `UPDATE … WHERE recipient_employee_id = viewerEmployeeId` | **Chỉ tin cá nhân** — broadcast NULL **không** mark được AS-IS |
| `HRM-NT-01` by-uc actors | **NV · QL** | Group CEO rollup ≠ canonical HP |
| AT-12 triage pattern | `EXPECTED_NO_CTA` for `ceo@` as wrong L1 HP | Parity class for NT-01 persona |

**Group CEO (`ceo@xe.vn`):** membership pilot = rollup / governance (`companyId=main`). Không gán làm **NV/QL có employee binding** cho UC đọc/mark inbox. Dashboard widget («Hợp đồng sắp hết hạn») ≠ UC-HRM-12 inbox.

---

## 3. Option evaluation

| Option | Mô tả | Khớp SRS AS-IS? | Verdict governance |
|--------|--------|-----------------|-------------------|
| **A** | Inbox “trống by design” cho `ceo@` (không gọi API) | **Một phần** — đúng hướng **không dùng ceo@ làm HP**; sai nếu diễn giải “API trả empty 200” (thiếu `employee_id` → **validation**, không phải empty list) | **Chọn (persona):** **`EXPECTED_NO_INBOX`** — wrong persona for NT-01 HP · **not** product FAIL |
| **B** | Rollup / chỉ broadcast, **không** cần `employee_id` viewer | **Không** — SRS + DTO bắt buộc viewer UUID; broadcast đã nằm trong list **khi có** viewer id | **Reject** làm AC AS-IS; muốn holding-only list = **SPEC_GAP** (FR mới, SA/Dev) |
| **C** | Bắt buộc map `ceo@` → `employee_id` (data/ops) | Có thể gọi API nếu ops gán NV record | **Reject** làm AC mặc định / bắt buộc pilot; optional dev bootstrap **ngoài** NT-01 HP matrix |

**Khuyến nghị:** **Option A (persona lock)** + giữ **Option B logic** chỉ cho user **có** `employee_id` (NV thấy broadcast + tin cá nhân). **Không** dispatch BE để nới validation cho ceo@ trừ khi sponsor mở SPEC_GAP.

---

## 4. AC delta (locked)

| AC-ID | Acceptance | Pass | Fail |
|-------|------------|------|------|
| **AC-NT01-PERSONA-01** | HP P0 NT-01 = **NV hoặc QL** có `employee_id` UUID trên membership/JWT (vd. `uat.nv####@xe.vn`); **not** Group CEO `ceo@` làm sole HP | Retest với NV/QL + FE-origin fanout row (U65) | Claim NT-01 PASS chỉ với `ceo@` embed |
| **AC-NT01-CEO-01** | `ceo@xe.vn` **không** employee binding → **EXPECTED_NO_INBOX** (skip GET inbox / ACT-HP); dashboard rollup load OK ≠ inbox UC | QA ghi verdict EXPECTED_NO_INBOX · residual FE web inbox vẫn P1 | FAIL product vì “inbox 0” under ceo@ |
| **AC-NT01-API-01** | `GET …/inbox?company_id=&employee_id=` — thiếu UUID → 4xx validation (`HRM-ERR-VALIDATION` family) | Probe/API FD | Coi thiếu param là empty 200 |
| **AC-NT01-LIST-01** | Có viewer UUID hợp lệ → list gồm broadcast (`recipient_employee_id` NULL) **và** tin gửi đích viewer | API/list UI sau FE fanout | Chỉ assert ceo@ |
| **AC-NT01-MARK-01** | `PATCH …/read` HP = **tin cá nhân** (`recipient_employee_id = viewer_employee_id`); broadcast mark = **SPEC_GAP** AS-IS (404) | ACT-HP sau leave/service reject/approve tới NV | PASS mark-read trên hàng broadcast NULL without spec change |
| **AC-NT01-U65-01** | Precond inbox row từ **FE mutate** (nghỉ/dịch vụ/chấm công…) — zero-seed | U65 honored | Seed/API-only inbox |

---

## 5. Recommended HP persona (execution)

| Seat | Account | Password | Scope | Role |
|------|---------|----------|-------|------|
| **Primary NV (inbox recipient)** | `uat.nv0007@xe.vn` | `xevn-uat-2026` | `trsport` (member OU) | NV ESS — nhận tin cá nhân sau QL duyệt/từ chối (U65 chain) |
| **Alternate NV** | `uat.nv####@xe.vn` (1000 pilot) | `xevn-uat-2026` | OU tương ứng JWT | Bất kỳ NV có `employee_id` trong token |
| **QL (broadcast + approve context)** | `uat.nv0002@xe.vn` | `xevn-uat-2026` | `trsport` | Manager — tạo/duyệt nguồn fanout; **not** substitute cho NV mark-read HP |
| **Out of HP (AU/rollup only)** | `ceo@xe.vn` | `Xevn@2026` | `main` | **EXPECTED_NO_INBOX** for NT-01 P0 ACT |

Mobile reference surface: `InAppNotificationsScreen` + `GET/PATCH` inbox (NT-02 push = qa-device).

---

## 6. Residual routing (post-lock)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| `R-W4-B3-NT01-CEO-EMPLOYEE-ID-GAP` | P2 | **ba-process** | **CLOSED** — AC §4 |
| `R-W4-B3-NT01-WEB-INBOX-MARK-READ-FE` | P1 | **dev-fe** | Unchanged — web wire + retest **uat.nv####** |
| Broadcast mark-read | P2 | **ba-process → SA** (defer) | SPEC_GAP if product cần “đã đọc” trên broadcast |

---

## 7. Claims / non-claims

| Claim | Status |
|-------|--------|
| NT-01 UAT PASS | **No** |
| ceo@ must get employee_id (ops) | **No** (optional only) |
| Leave L2 PASS | **No** — SPEC_GAP |
| UAT DONE | **false** |

---

## 8. Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-BA-NT01-CEO-EMPLOYEE-ID-01
evidence_path: docs/qa/evidence/po-uc-tc-w4-ba-nt01-ceo-employee-id-01.md
by_uc_delta: docs/qa/professional/by-uc/HRM-NT-01.md §10
completion_report: Options A/B/C triaged; lock EXPECTED_NO_INBOX for ceo@; HP = uat.nv#### (primary uat.nv0007); B only with viewer UUID; C rejected as mandatory; broadcast mark SPEC_GAP noted.
next_owner: pm
```
