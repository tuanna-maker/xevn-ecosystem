# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-DOCS-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-DOCS-01` |
| **from_role** | `ba-docs` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — client DOC-DELTA (SRS bump + HDSD chương) ADD-only — **not** module ATT/PAY UAT |
| **priority** | P0 (prior seat 43675324 turn_ended empty → re-dispatch) |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `OT-TYPE-CATALOG-QC-01` GWC · U88 · BA `OT-TYPE-CATALOG-BA-01` CONFIRMED Option B Nest `att_ot_type` open catalog |
| **change_mode** | **ADD** (EXPAND FR-UC-BP-PLT-01 → FR-UC-BP-ATT-06 · new HDSD Chương 5f · peer pointer CH05) — no wipe CODE/SHIFT/CTR FR — no reopen ATT L1 — no HTML rebuild — no apps/** |
| **portal_url** | N/A — documentation seat (no browser UF) |
| **journey_l25** | **N/A deferred** — J-HRM-ATT-OT-* **not** promoted by docs — `C-SLICE-≠-MODULE` — formula LIVE HOLD |
| **crud_or_matrix** | Client-doc DOC-DELTA maps SA Option B open catalog + BA AC-PLT-ATT-OT-01..01H into customer SRS/HDSD wording |
| **no_prompt_echo** | **true** — no work_item / stamp / pipeline meta / chat metaphor in client text |
| **ack_status** | `PASS_TO_PM` — **ACCEPT** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-docs-01.md` |
| **sa_ref** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01.md` Option **B** LOCKED (Nest DEFINE) |
| **ba_ref** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BA-01.md` AC pack CONFIRMED (AC-PLT-ATT-OT-01/01b/01c/01d/01e/01f/01H) |
| **qc_ref** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-qc-01.md` GWC — KEY LIVE noted; module NOT promoted |

---

## HARD EXIT GATE — files written on disk (byte sizes)

| # | File | Type | Bytes | ≥ target |
|---|------|------|------:|:--------:|
| 1 | `docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-docs-01.md` | Evidence (this file) | see console `(Get-Item).Length` below | ≥ 3KB ✔ |
| 2 | `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH05f_HRM_DANH_MUC_LOAI_TANG_CA.md` | Client DOC-DELTA — HDSD Chương 5f (new) | **11086** | ≥ 2KB ✔ |
| 3 | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` | Client DOC-DELTA — SRS bump v0.39 → **v0.40** (ADD-only) | **366963** (delta **+4044** from pre-patch 362919) | version bump ✔ |

Supporting ADD (peer pointer, not a gate file): `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH05_HRM_CHAM_CONG_PHEP.md` — DOC-DELTA line + Peer HDSD link → CH05f (6757 → 7236 bytes).

Byte-size verified via Shell `(Get-Item $rel).Length` on the canonical NFD repo disk (`git rev-parse --show-toplevel` = `xevn-ecosystem`). UTF-8 (no BOM) round-trip probe MATCH=True before writing Vietnamese content.

---

## What was written (business content — no meta echo)

### SRS bump — `SRS_HRM_ENTERPRISE.md` v0.40 (ADD-only)

- **Header (line 5)** bumped **0.39 → 0.40**; retains 0.39 (mẫu HĐ) · 0.38 (điều khoản) · 0.37 (quỹ phép) · CORE-09* · PLT-01.
- **EXPAND FR-UC-BP-PLT-01 "Luồng chính" step 4** — ADD sentence "**Với loại tăng ca (OT type):**" — SoT = Nest danh mục loại tăng ca theo đơn vị; Cài đặt = tham chiếu hợp nhất chỉ đọc; đơn tăng ca chọn loại khi còn loại hiệu lực; quản trị mở loại mới (mã — tên — hệ số hiển thị); ba loại khởi tạo (ngày thường/cuối tuần/ngày lễ) = ví dụ ≠ trần; hệ số hiển thị = gợi ý ≠ công thức lương / nghỉ bù; ngừng dùng = ẩn mềm; ⊘ gộp vào ký hiệu công / ca / loại phép / điểm GPS. (Cross-refs FR-UC-BP-ATT-06 nghỉ bù từ tăng ca.)
- **ADD acceptance rows** after AC-PLT-ATT-SHIFT-01e (before AC-PLT-CTR): **AC-PLT-ATT-OT-01 / 01b / 01c / 01d / 01e / 01f / 01H** — bind Nest khi EFF>0 → từ chối loại lạ → empty CTA (hardcode ba loại chỉ khi trống, no seed) → admin CREATE N+1 → soft-retire ẩn mềm → hệ số hiển thị = gợi ý ≠ formula → honesty non-claim.
- **Version-log ADD row 0.40** + closing marker bump **v0.39 → v0.40** (ADD-only wording).
- Prior FR CODE (0.35) · SHIFT (0.36) · quỹ phép (0.37) · điều khoản (0.38) · mẫu HĐ (0.39) **RETAINED** (no wipe / no reopen).

### HDSD — new `HDSD_XEVN_CH05f_HRM_DANH_MUC_LOAI_TANG_CA.md` (Chương 5f)

- Hai vai trò: quản trị catalog vs người nộp đơn tăng ca (consumer ≠ tạo loại).
- Thêm loại N+1 / loại thứ chín trở lên; Lưu → tải lại còn; picker đơn tăng ca chọn được + hệ số gợi ý.
- Ba loại khởi tạo = ví dụ ≠ trần; cảnh báo mềm không chặn thêm.
- Chọn loại trên đơn tăng ca; từ chối loại không thuộc danh mục — phân biệt "không tìm thấy theo định danh" / "chưa có loại hiệu lực" / "catalog trống"; không im lặng lưu thành công.
- §5 Hệ số hiển thị ≠ công thức lương (gợi ý; quy đổi tiền/nghỉ bù là giai đoạn sau; sửa hệ số không đổi kỳ đã chốt).
- Ngừng dùng = ẩn mềm giữ lịch sử đơn; empty state không bịa / không seed; hardcode ba loại chỉ khi danh mục trống.
- §8 Phạm vi: ⊘ khẳng định module chấm công/bảng lương nghiệm thu · ⊘ hệ số = formula LIVE · khác ca / ký hiệu công / loại phép.

### Peer pointer — `HDSD_XEVN_CH05_HRM_CHAM_CONG_PHEP.md` (ADD-only)

- Peer HDSD line + new DOC-DELTA line → CH05f; không thay thế chương; không claim nghiệm thu.

---

## Honesty locks (mandatory — RETAINED, no flip)

| Flag / seal | State | Note |
|-------------|-------|------|
| `attendance_uat_ready` | **false** | not flipped by docs |
| `payroll_e2e_ready` | **false** | not flipped — hệ số hiển thị ≠ công thức lương LIVE |
| `contracts_printable_ready` | **false** | not flipped |
| Formula LIVE / `default_coefficient` as engine GO | **DENIED** | client wording = "hệ số hiển thị = gợi ý" only |
| invent KEY `HRM-ATT-OT-TYPE-KEY` | **noted class only** | client wording = "từ chối loại không thuộc danh mục"; **DENY** claim Network KEY sealed by docs |
| ba-data (DATA-01) / dev-be / dev-fe | **HOLD/parallel** | docs only — not claimed sealed by this seat |
| ATT CODE / SHIFT / WS / leave / quỹ phép L1 seals | **SEAL RETAIN** | not reopened; OT type orthogonal OWN |
| CTR KEY / clause seals | **SEAL RETAIN** | not reopened |
| Module ATT/PAY UAT / Phase 1 DONE | **DENIED** | `C-SLICE-≠-MODULE` |
| Seed (U65) | **none** | doc-only; empty CTA OK; hardcode ba loại chỉ khi catalog trống |
| flip ready | **DENIED** | no readiness flag flipped from this slice |
| `no_prompt_echo` | **true** | no work_item / stamp / meta in client text |

---

## Command table

| Command | Result | Class |
|---------|--------|-------|
| `git rev-parse --show-toplevel` | `xevn-ecosystem` (NFD canonical) | PATH ok |
| UTF-8 (no BOM) round-trip probe | MATCH=True | ENCODING ok |
| Write HDSD CH05f (`[IO.File]::WriteAllText` UTF8) | on disk **11086** bytes | WRITE ok |
| SRS v0.40 ADD-only line-indexed splice (asserts pass) | 362919 → **366963** (+4044) | WRITE ok |
| CH05 peer pointer + DOC-DELTA ADD | 6757 → **7236** | WRITE ok |
| Verify: header v0.40 · AC-OT rows · vlog 0.40 · closing v0.40 · step4 OT sentence | all True | GATE ok |

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| invent KEY `HRM-ATT-OT-TYPE-KEY` Network wire | P2 | **pm → dev-be / qa** | Do **not** claim AC-PLT-ATT-OT-01b sealed until KEY distinct from 404/VAL or waiver — per BA VAL-ATT-OT-CNS-01 |
| Optional browser AC slice | P2 | **pm → qa** | Only if PM opens `OT-TYPE-CATALOG-QA-01` — U65 zero-seed — not claimed by docs |
| HTML deliverable rebuild | later | ba-docs | Rebuild from markdown sources if client HTML SRS/HDSD regenerated (no hand-edit) |
| `C-SLICE-≠-MODULE` | — | **pm** | Keep attendance/payroll/printable = false; no module ATT/PAY UAT / Phase1 claim |
| Journey rows `J-HRM-ATT-OT-*` / UF-HRM-ATT-OT-* | later | ba-docs / qa | Promote into BA_TRACE after Nest consumer LIVE + QA stamp — **not** this seat |

---

## completion_report

**ACCEPT** — Client DOC-DELTA ADD-only delivered on canonical NFD repo disk (fixes prior empty seat 43675324):

1. **HDSD Chương 5f** (new, 11086 bytes) — danh mục loại tăng ca mở: admin thêm N+1 / loại thứ chín trở lên ↔ ba loại khởi tạo (ngày thường/cuối tuần/ngày lễ) = ví dụ ≠ trần; đơn tăng ca chọn loại từ danh mục khi còn loại hiệu lực; từ chối loại không thuộc danh mục; hệ số hiển thị = gợi ý ≠ công thức lương; soft-retire ẩn mềm; empty CTA; no seed.
2. **SRS `SRS_HRM_ENTERPRISE.md` v0.40** (+4044 bytes) — EXPAND FR-UC-BP-PLT-01 → FR-UC-BP-ATT-06 + AC-PLT-ATT-OT-01..01H (peer CODE/SHIFT catalog style) + version-log 0.40 + closing bump.
3. **CH05 pointer** ADD-only → CH05f.

Mapped from SA Option B (Nest `att_ot_type` open catalog) + BA AC pack. Invent KEY class noted in business wording only — **not** claimed Network sealed. Honesty flags unchanged false; formula LIVE HOLD; ATT/CODE/SHIFT/WS/leave/CTR seals retained; ba-data/BE/FE HOLD respected; no seed (U65); no apps/**; no_prompt_echo on client text. DENY claim ATT/PAY UAT · Phase 1 · printable · formula LIVE · flip ready.

**next_owner:** **pm**

**next_dispatch_prompt:**
```
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-QA-01   # OPTIONAL — only if PM opens browser slice after BE KEY wire
# OR U88 continuous next vertical (peer ATT → REC → EMP → QSĐ…) — docs seat CLOSED
from_role: pm
to_role: qa | sa | ba-process
lane: execution|governance
note: docs PASS_TO_PM ACCEPT; formula LIVE stays HOLD; hệ số hiển thị ≠ công thức lương; invent KEY not sealed by docs; BE/FE/ba-data HOLD unless QA finds concrete gap; C-SLICE-≠-MODULE keep flags false
cấm: seed · flip attendance/payroll/printable · reopen CODE/SHIFT/CTR/leave L1 · claim formula LIVE · module ATT/PAY UAT · Phase1
```

**ack_status:** PASS_TO_PM