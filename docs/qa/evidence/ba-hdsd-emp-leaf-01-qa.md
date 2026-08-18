# Evidence — BA-HDSD-EMP-LEAF-01-QA

| Meta | Value |
|------|--------|
| **work_item_id** | `BA-HDSD-EMP-LEAF-01-QA` |
| **role** | `qa` |
| **from_role** | `pm` |
| **date** | 2026-08-03 |
| **method** | Doc trace spot-check (no browser · no seed · no product UAT DONE) |
| **hdsd_align** | true (design-time — Steps/Expected vs CH06 prose) |
| **hdsd_sot** | `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH06_HRM_NHAN_SU.md` |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** (3/3 TC ↔ HDSD section align) |

## Intake

| Source | Path |
|--------|------|
| BA handoff | `docs/qa/evidence/ba-hdsd-emp-leaf-01.md` |
| HDSD leaf | `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH06_HRM_NHAN_SU.md` |
| TC pack | `docs/qa/testcases/hrm-web/HRM-EMPLOYEES.md` |
| Gap closed (claim) | `SPEC_GAP-HDSD-EMP-01` |

## Pack meta (U76 SoT)

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| Leaf HDSD path in meta | `hdsd/hrm/HDSD_XEVN_CH06_HRM_NHAN_SU.md` | Line 8 meta **HDSD** → leaf path present | **PASS** |
| Pilot shell pointer | `03_HUONG_DAN…` §5.5 | Meta cites pilot §5.5 | **PASS** |
| SPEC_GAP row in pack §6 | Removed / not open | §6 = OOS/stub only; no `SPEC_GAP-HDSD-EMP` grep hit | **PASS** |
| §5 trace → CH06 | Representative rows cite CH06 § | All §5 rows use `CH06 §2`–`§7` (no legacy pilot §4-only for spot TCs) | **PASS** |

## Spot-check 1 — TC-EMP-L-HP-001 ↔ CH06 §2.1

| Dimension | TC pack (§4.1) | HDSD CH06 §2.1 | Align |
|-----------|----------------|----------------|-------|
| **Menu / màn (U76)** | Menu **Nhân sự** | Tab/menu **Nhân sự** · bảng danh sách | **Y** |
| **Steps** | 1. Đăng nhập 2. Menu **Nhân sự** | 1. Đăng nhập Cổng Web 2. (Tuỳ chọn tenant) 3. Mở **Nhân sự** | **Y** (HP omits optional step 2 — acceptable) |
| **Expected — load** | Bảng load | Hiển thị bảng danh sách | **Y** |
| **Expected — Sync ERROR** | Không banner Sync ERROR | Lưu ý: banner đỏ / «Sync ERROR» = chưa đạt | **Y** |
| **Expected — total** | Subtitle đếm total | Tiêu đề kèm tổng số bản ghi (nếu API trả về) | **Y** |
| **§5 trace** | `CH06 §2` | §2.1 là vào màn hình trong §2 | **Y** |
| **Fn coverage** | `FN-LIST-LOAD` | §2.1 entry flow | **Y** |

**Note (non-blocking):** §3 function table `FN-LIST-LOAD` HDSD column still says `§4 pilot` — outside this 3-TC gate; suggest BA/dev-fe synth pass retarget to `CH06 §2.1`.

## Spot-check 2 — TC-EMP-F-HP-001 ↔ CH06 §3.1

| Dimension | TC pack (§4.2) | HDSD CH06 §3.1 | Align |
|-----------|----------------|----------------|-------|
| **Entry** | **Thêm NV** | **Thêm nhân viên** | **Y** (same control) |
| **Tab** | Tab **Thông tin cơ bản** | Tab **Thông tin cơ bản** | **Y** |
| **Required fields** | Mã + Họ tên + PB + Chức vụ catalog | Bước 2–3: Mã, Họ tên bắt buộc; PB/Chức vụ từ danh mục | **Y** |
| **Submit** | **Lưu** | **Lưu** / **Thêm** | **Y** |
| **Expected — persist** | Row list; **F5** còn | Dòng mới trên danh sách; **F5** vẫn thấy | **Y** |
| **Expected — API** | POST 201 | HDSD user-facing (no HTTP) — consistent with QA layer | **Y** |
| **§5 trace** | `CH06 §3.1 · UF-HRM-03` | §3.1 Tạo mới | **Y** |

Optional HDSD steps (QL trực tiếp, lương) omitted in TC Steps — valid for HP narrow path per §3.1 rows 4–5 marked tuỳ chọn.

## Spot-check 3 — TC-EMP-D-HP-001 ↔ CH06 §4.1

| Dimension | TC pack (§4.3) | HDSD CH06 §4.1 | Align |
|-----------|----------------|----------------|-------|
| **Entry** | ⋯ **Xóa** | **⋯ → Xóa** trên dòng | **Y** |
| **Reason** | Nhập lý do | Hộp thoại (có thể nhập lý do) | **Y** |
| **Confirm** | **Xóa** | **Xóa** / xác nhận | **Y** |
| **Expected — list** | Mất khỏi list | Biến mất khỏi bảng chính | **Y** |
| **Expected — F5** | F5 | **F5** vẫn không thấy trên active | **Y** |
| **Expected — API** | POST archive 2xx | User doc only — QA API layer OK | **Y** |
| **§5 trace** | `CH06 §4.1` | §4.1 Xóa mềm | **Y** |

## §5 trace rows (spot TCs)

| TC-ID | Pack §5 HDSD § | Maps to CH06 section | Result |
|-------|------------------|------------------------|--------|
| TC-EMP-L-HP-001 | CH06 §2 | §2 Màn danh sách / §2.1 | **PASS** |
| TC-EMP-F-HP-001 | CH06 §3.1 · UF-HRM-03 | §3.1 Tạo mới | **PASS** |
| TC-EMP-D-HP-001 | CH06 §4.1 | §4.1 Xóa mềm | **PASS** |

## SPEC_GAP-HDSD-EMP-01 closure

| Criterion | Status |
|-----------|--------|
| Dedicated leaf HDSD exists | **Y** — CH06 file present |
| Pack meta points to leaf | **Y** |
| 3 representative TC Steps/Expected match HDSD § | **Y** — 3/3 |
| Browser UAT / product DONE | **Not claimed** (doc gate only) |

## Residual (non-blocking for this WI)

| ID | Severity | Note | Owner hint |
|----|----------|------|------------|
| FN-HDSD-PILOT-REF | P3 | §3 `FN-LIST-LOAD` HDSD column `§4 pilot` vs CH06 §2.1 | synth / ba-docs cleanup |
| TC-STEPS-CITE | P3 | Steps cells do not embed literal `CH06 §x.x` text — trace via §5 + content align sufficient for governance spot-check | optional pack polish |

## Out of scope (explicit)

- Browser execution · test-log · L0–L2.5 J-* · seed · `apps/**` changes
- Full U76 inventory of all CH06 §2.5–§8 buttons (156 TC matrix — future browser wave)

## Handoff

```
completion_report: Doc spot-check PASS 3/3 (L-HP-001↔§2.1, F-HP-001↔§3.1, D-HP-001↔§4.1); pack meta + §5 CH06 trace verified; SPEC_GAP-HDSD-EMP-01 trace quality OK for governance closure. Residual P3: FN-LIST-LOAD HDSD column still §4 pilot.
next_owner: pm
next_dispatch_prompt: PM — accept BA-HDSD-EMP-LEAF-01 governance closure; optional dispatch ba-docs or synth to retarget HRM-EMPLOYEES.md §3 fn HDSD column from §4 pilot → CH06 §2.1 for all list-load fns. Do NOT mark Employees product UAT DONE until browser UF-HRM-01/03 + J-HRM-02 with hdsd_coverage table per U76.
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/ba-hdsd-emp-leaf-01-qa.md
pm_dispatch_hint: PO-ECO-TC-SYNTH or QC — confirm SPEC_GAP-HDSD-EMP-01 closed on PO_SPEC_TEST_REPORT matches this QA evidence
```
