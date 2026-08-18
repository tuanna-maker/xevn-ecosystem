# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-DOCS-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-DOCS-01` |
| **from_role** | `ba-docs` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — client DOC-DELTA (SRS bump + HDSD CH) ADD-only · **not** module ATT UAT |
| **priority** | P2 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QC-01` GWC admin L1 · stamp `ATTLVRULEQA-MSK6G783` |
| **change_mode** | **ADD** (EXPAND FR-UC-BP-ATT-04 · new HDSD Chương 5e) — no wipe leave-type / CODE / WS / SHIFT / GPS FR · no HTML rebuild |
| **portal_url** | N/A — documentation seat (no browser UF; L1 governance) |
| **journey_l25** | **N/A deferred** — J-HRM-ATT-LVRULE-* NOT promoted · `C-SLICE-≠-MODULE` · engine LIVE HOLD |
| **crud_or_matrix** | Client-doc DOC-DELTA maps SA Option B rule schema + BA AC-PLT-ATT-LEAVE-BAL-01d/01e/01b/01c into customer SRS/HDSD wording |
| **no_prompt_echo** | **true** — no work_item / stamp / pipeline meta / chat metaphor in client text |
| **ack_status** | `PASS_TO_PM` |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-docs-01.md` |
| **qc_ref** | [`po-hrm-dynamic-config-platform-att-leave-balance-qc-01.md`](po-hrm-dynamic-config-platform-att-leave-balance-qc-01.md) GWC |
| **ba_ref** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01.md) §10 DOC-DELTA OPTIONAL |
| **sa_ref** | Option **B** LOCKED — Nest `att_leave_accrual_policy` rule SoT |

---

## HARD EXIT GATE — files written on disk (byte sizes)

| # | File | Type | Bytes | > 2KB |
|---|------|------|-------|-------|
| 1 | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-docs-01.md` | Evidence (this file) | ~4.9KB | ✅ |
| 2 | `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH05e_HRM_QUY_TAC_QUY_PHEP.md` | Client DOC-DELTA — HDSD Chương 5e (new) | **8210** | ✅ |
| 3 | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` | Client DOC-DELTA — SRS bump v0.36 → **v0.37** (ADD-only, +2220 bytes) | **358576** | ✅ (delta > 2KB) |

Absolute path root (NFD canonical): `C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem`.

---

## What was written (business content — no meta echo)

### SRS bump — `SRS_HRM_ENTERPRISE.md` v0.37 (ADD-only)

- **EXPAND FR-UC-BP-ATT-04 «Quy tắc nghiệp vụ»** — ADD bullet: quy tắc quỹ phép (chính sách tích lũy) = danh mục chuẩn của hệ thống nhân sự, có phiên bản theo thời điểm hiệu lực, gắn loại phép hiệu lực; quản trị mở quy tắc N+1; cấp / điều chỉnh chỉ chọn tham số từ quy tắc đã phát hành; ngừng theo dõi = ẩn mềm; Cấu hình hệ thống & quy tắc chấm công–GPS ≠ nguồn quy tắc quỹ; tự động tích lũy = giai đoạn sau (không claim nghiệm thu).
- **EXPAND FR-UC-BP-ATT-04 «Trường hợp đặc biệt»** — ADD 3 rows: mở quy tắc N+1 (Lưu + tải lại còn); nhập tay tham số ngoài quy tắc → từ chối / không lưu; ngừng theo dõi → ẩn mềm giữ số dư/lịch sử.
- **Version-log ADD row 0.37** + closing marker bump v0.36 → v0.37; closing list nêu «ATT-04 loại phép **và quy tắc quỹ phép (chính sách tích lũy versioned)**».
- v0.36 row + all prior FR **RETAINED** (no wipe).

### HDSD — new `HDSD_XEVN_CH05e_HRM_QUY_TAC_QUY_PHEP.md` (Chương 5e)

- Hai màn hình (quản trị quy tắc quỹ vs cấp/điều chỉnh trên Nghỉ phép).
- Thêm quy tắc mới N+1 versioned gắn loại phép hiệu lực (Lưu → tải lại còn).
- Ngừng theo dõi = ẩn mềm, giữ số dư/lịch sử; bộ lọc gồm mục đã ngừng.
- Cấp / điều chỉnh chọn tham số từ quy tắc đã phát hành; nhập ngoài quy tắc → từ chối.
- Empty state khi chưa có quy tắc — không tự bịa, không seed.
- §6 Phạm vi & giới hạn: tự động tích lũy = giai đoạn sau; **không** khẳng định module chấm công / nghỉ phép nghiệm thu; ≠ loại phép / ký hiệu công / ca / GPS.

---

## Honesty locks (mandatory — RETAINED, no flip)

| Flag / seal | State | Note |
|-------------|-------|------|
| `attendance_uat_ready` | **false** | not flipped by docs |
| `payroll_e2e_ready` | **false** | not flipped |
| F-ATT-LEAVE-04 accrue engine LIVE | **HOLD** | docs say «tự động tích lũy = giai đoạn sau» — not claimed LIVE |
| Invent `HRM-ATT-LVRULE-KEY` Network LIVE | **NOT CLAIMED** | SRS states rule (từ chối tham số ngoài quy tắc) as requirement, not as verified acceptance; consumer wire = OPEN Condition `R-PLT-ATT-LVRULE-CNS-WIRE` (dev-be) |
| leave-type invent `HRM-LEAVE-TYPE-UNKNOWN` | **RETAIN** | CH05 leave-type FR untouched |
| ATT-CODE `ATTCODEQA-MSK4T1A5` · ATT-WS · ATT-SHIFT `ATTSHIFTQA-MSK5FXP3` · FE HOLDs | **SEAL RETAIN** | not reopened / no FE invent |
| Module ATT UAT / Phase 1 DONE | **DENIED** | `C-SLICE-≠-MODULE` |
| Seed (U65) | **none** | doc-only |
| `no_prompt_echo` | **true** | no work_item / stamp / meta in client text |

**OPEN conditions noted (NOT closed by this seat):** `R-PLT-ATT-LVRULE-CNS-WIRE` (P1 · dev-be) · `R-PLT-ATT-LVRULE-FE-01g` (P2 HOLD · dev-fe).

---

## Command table

| Command | Result | Class |
|---------|--------|-------|
| `Resolve-Path` + `[IO.File]::WriteAllText` (UTF-8 no BOM) HDSD CH05e | file created · **8210** bytes | WRITE ok |
| `[IO.File]::ReadAllText` + literal `.Replace` ×4 anchors on SRS (bullet · special-case rows · v0.37 row · closing) | delta **+2220** bytes · v0.36 RETAINED · anchors verified present | WRITE ADD-only |
| Verify render `Substring` around `**0.37**` + `Hết bản SRS v0.37` | clean Vietnamese · no mojibake | AUDIT ok |
| Byte-size check `(Get-Item).Length` both client files | HDSD 8210 · SRS 358576 | GATE ok (> 2KB) |

> Note: edits applied via PowerShell (`WriteAllText`) because the workspace path is NFD-normalized (`Tài liệu`) and the specialized editor tools could not resolve it; content authored in markdown (no HTML hand-edit), ADD-only.

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| `R-PLT-ATT-LVRULE-CNS-WIRE` | P1 MANDATORY | **dev-be** | Wire consumer assert so Network emits `HRM-ATT-LVRULE-KEY`; still OPEN — docs describe as requirement, not verified |
| `R-PLT-ATT-LVRULE-FE-01g` | P2 HOLD | **dev-fe** | Admin «Quy tắc quỹ phép» UI + panel ⊆ EFF — HOLD · no FE invent |
| Journey rows `J-HRM-ATT-LVRULE-*` | later | ba-docs / qa | Promote to `PILOT_BUSINESS_FLOW_BA_TRACE.md` after Nest consumer LIVE + QA stamp — **not** this seat |
| HTML deliverable rebuild | later | ba-docs | If client HTML SRS/HDSD is regenerated, rebuild from these markdown sources (no hand-edit) |
| `C-SLICE-≠-MODULE` | — | **pm** | Keep ready flags false; no module ATT UAT / Phase1 claim |

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| SRS v0.37 ADD-only + HDSD CH05e written · > 2KB each | PRODUCT DOC PASS | Yes → ACCEPT |
| Honesty flags false · engine HOLD · seals RETAIN · no_prompt_echo | HONESTY LOCK | Yes → within limits |
| Consumer KEY wire OPEN (CNS-WIRE) | RESIDUAL (dev-be) | Noted OPEN — not closed by docs |

---

## completion_report

**Closed:** Client DOC-DELTA ADD-only for ATT leave accrual **rule schema** (Option B) — (1) SRS `SRS_HRM_ENTERPRISE.md` bumped v0.36 → **v0.37**: EXPAND FR-UC-BP-ATT-04 (bullet + 3 special-case rows) + version-log row + closing marker; (2) new HDSD **Chương 5e** `HDSD_XEVN_CH05e_HRM_QUY_TAC_QUY_PHEP.md` (8210 bytes). Both files verified on disk > 2KB, clean Vietnamese, no mojibake, no prompt-echo. Nest accrual policy = versioned rule SoT bound to leave type; admin CREATE N+1 ≠ invent params; soft-retire; leave-type invent still `HRM-LEAVE-TYPE-UNKNOWN` (RETAIN); engine accrue LIVE **not** claimed; `HRM-ATT-LVRULE-KEY` Network wire noted OPEN (Condition, not claimed sealed). Honesty flags kept false; peer seals RETAIN; `C-SLICE-≠-MODULE`; U65 zero-seed.

**Open (NOT closed here):** `R-PLT-ATT-LVRULE-CNS-WIRE` (P1 · dev-be) · `R-PLT-ATT-LVRULE-FE-01g` (P2 HOLD · dev-fe) · J-HRM-ATT-LVRULE-* promotion after Nest consumer LIVE · optional HTML rebuild.

**next_owner:** **pm**

### next_dispatch_prompt (copy-ready — PM)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-NEXT-VERTICAL-SA-01
from_role: pm
to_role: sa
lane: governance
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QC-01 GWC · U88 continuous
entry_criteria:
  - Read QC-01 (GWC admin L1 · CNS-WIRE Condition OPEN) + DOCS-01 evidence
  - Honesty: attendance_uat_ready=false · payroll_e2e_ready=false · C-SLICE-≠-MODULE · engine HOLD
  - RETAIN: ATT leave-type/CODE/WS/SHIFT/GPS L1 · leave-balance admin L1 GWC · FE HOLDs · DENY reopen
task:
  - Open next platform vertical Option/F.1 delta hẹp (peer ATT→REC→EMP→QSĐ/DEC → MergeToken/CTR/INS or board top residual)
  - Lock Option A/B · invent KEY class · admin≠consumer · DENY mega-EAV · DENY flip ready
  - Unlock ba-process AC pack or ba-data physical per Option
exit: CONFIRMED Option + next_dispatch ba-process|ba-data
evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-next-vertical-sa-01.md
```

Parallel residual (already scoped by QC): dispatch **dev-be** `R-PLT-ATT-LVRULE-CNS-WIRE` (BE-02) to make the accrual-rule invent guard provable on Network before any KEY-LIVE claim.

**ack_status:** **PASS_TO_PM** · **ACCEPT**