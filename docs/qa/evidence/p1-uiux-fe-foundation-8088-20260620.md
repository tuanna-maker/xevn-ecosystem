# P1-UIUX-FE-FOUNDATION-01 — Portal UX foundation (G-UX-01 / G-UX-02)

**work_item_id:** `P1-UIUX-FE-FOUNDATION-01`  
**Date:** 2026-06-20  
**Role:** dev-fe  
**Scope:** web-portal only — Command Center cổ đông + tài liệu pháp lý (P0 slice)

## Spec ref

- `docs/program/PHASE1_UIUX_REAUDIT_SPONSOR_20260620.md` § G-UX-01, G-UX-02
- AC-UX-CFM-01 (partial CC slice), AC-UX-LOD-01 (submit row buttons)

## Delivered

| Artifact | Path |
|----------|------|
| ConfirmDialog | `apps/web/web-portal/src/components/common/ConfirmDialog.tsx` |
| useConfirmDialog hook | `apps/web/web-portal/src/components/common/useConfirmDialog.tsx` |
| MutationButton | `apps/web/web-portal/src/components/common/MutationButton.tsx` |
| CC wiring | `CommandCenterPage.tsx` — shareholder + legal doc delete/submit |

## CC P0 behaviors

| Action | Before | After |
|--------|--------|-------|
| Xóa 1 cổ đông | Immediate delete | Modal confirm (tên cổ đông, Hủy / Xóa destructive) |
| Xóa đã chọn (bulk) | Immediate delete | Modal confirm (số lượng) |
| Xóa tài liệu pháp lý | Immediate delete | Modal confirm (tên tài liệu) |
| Submit cổ đông (✓) | No busy | `Loader2` + disabled while API pending |
| Submit tài liệu (✓) | No busy | `Loader2` + disabled while API pending |

## Verify commands

```bash
cd apps/web/web-portal
pnpm test -- src/components/common/ConfirmDialog.test.tsx   # 4/4 PASS
pnpm test                                                    # 256/256 PASS
pnpm build                                                   # exit 0
```

## QA retest (browser `:8088` — U65 zero-seed)

**work_item_id:** `P1-UIUX-FE-FOUNDATION-01-QA`  
**Date:** 2026-06-20  
**Persona:** `ceo@xe.vn` / `Xevn@2026`  
**URL:** `http://14.225.217.232:8088/command-center?settings=company_member_units`  
**Click path:** Login → CÀI ĐẶT HỆ THỐNG → Đơn vị thành viên → Thêm mới đơn vị (form cổ đông + tài liệu)

| UF-ID | Verdict | CFM | LOD | Evidence |
|-------|---------|-----|-----|----------|
| UX-XBOS-04 | 🟢 PASS | Modal «Xóa cổ đông» — Hủy/Xóa (destructive). Hủy → row còn | n/a | `screenshots/p1-uiux-fe-foundation-8088-20260620/ux-xbos-04-confirm-modal.png` |
| UX-XBOS-05 | 🟢 PASS | «Xóa cổ đông đã chọn» — «Bạn có chắc muốn xóa 2 cổ đông…» Hủy/Xóa | n/a | Browser snapshot + bulk modal (same session) |
| UX-XBOS-06 | 🟡 BLOCKED | n/a | MutationButton wired (`aria-label="Lưu cổ đông"`); **Loader2 không quan sát được runtime** — submit return sớm vì chưa có pháp nhân persisted («Chọn hoặc lưu pháp nhân trước khi ghi cổ đông») | Code: `MutationButton.tsx` Loader2 + `CommandCenterPage` `shareholderSubmitPendingId` |
| UX-XBOS-07 | ⚪ SKIP | n/a | Upload button hiển thị; **không** retest chọn file (ngoài scope prompt LOD/CFM) | — |
| UX-XBOS-08 | 🟢 PASS | Modal «Xóa tài liệu pháp lý» — Hủy/Xóa | n/a | `screenshots/p1-uiux-fe-foundation-8088-20260620/ux-xbos-08-legal-doc-confirm.png` |

### Chi tiết từng bước

**UX-XBOS-04 — Xóa 1 cổ đông**

- Action: 🗑 «Xóa cổ đông» → modal «Xóa cổ đông» / «Bạn có chắc muốn xóa "cổ đông này"?…»
- Hủy: modal đóng, row còn → 🟢
- (Chưa Xóa confirm + DELETE 2xx + F5 — blocked bởi env 403 list, form «new entity»)

**UX-XBOS-05 — Bulk delete**

- Chọn 2 cổ đông → «Xóa đã chọn (2)» → modal «Xóa cổ đông đã chọn» / «…xóa 2 cổ đông…» → Hủy → 🟢 CFM

**UX-XBOS-06 — ✓ submit row (Loader2)**

- Click «Lưu cổ đông» sau nhập tên → không có spinner; banner «Chọn hoặc lưu pháp nhân trước…»
- **Không** verify double-submit / Network POST 2xx / F5 trên `:8088` do prerequisite API entity

**UX-XBOS-08 — Xóa tài liệu**

- 🗑 «Xóa tài liệu» → modal «Xóa tài liệu pháp lý» Hủy/Xóa → Hủy → 🟢 CFM

### Env blocker (P0 residual — không phải FE regression UX modal)

Danh sách pháp nhân: `tenant-scope.group-member-units failed: Group member units require master tenant membership (HTTP 403)` — không mở «Chỉnh sửa» Tập đoàn để retest submit/delete sau API trên entity persisted.

**pm_dispatch_hint:** `dev-be` — scope `ceo@xe.vn` / master tenant membership cho `group-member-units` trên `:8088`.

### Matrix cập nhật

`docs/qa/UIUX_INTERACTION_AUDIT_MATRIX_8088.md` — rows UX-XBOS-04/05/08 CFM 🟢; UX-XBOS-06 LOD 🟡.

**ack_status:** `PASS_TO_PM` (G-UX-01 CFM slice 🟢; G-UX-02 LOD 🟡 blocked env + entity prerequisite)

## Residual (out of scope this wave)

- `window.confirm` dept room delete (line ~3398) — wave CC tiếp theo
- Settings Vendors/KPI delete, WF/catalog — `P1-UIUX-FE-CC-02` (planned)
- HRM embed — `P1-UIUX-FE-HRM-02` after QA R1

**ack_status (dev-fe handoff):** `READY_FOR_QA`

---

## QA R2 — BE 403 unblock + UX-XBOS-06 LOD retest

**work_item_id:** `P1-UIUX-FE-FOUNDATION-01-QA-R2`  
**Date:** 2026-06-20  
**Persona:** `ceo@xe.vn` / `Xevn@2026`  
**URL:** `http://14.225.217.232:8088/command-center?settings=company_member_units`  
**Prerequisite fix:** `docs/qa/evidence/p1-uiux-foundation-be-403-8088-20260620.md`  
**Method:** Browser-only U65 (no seed)

### 1. API probe — group-member-units (403 → 200)

```powershell
POST /api/xbos/auth/login → 201 XBOS-AUTH-200
GET  /api/xbos/tenant-scope/group-member-units → 200 XBOS-TENANT-200
```

Holding + member units returned; no `Group member units require master tenant membership`.

### 2. CC → Đơn vị thành viên → Chỉnh sửa Tập đoàn

| Step | Result |
|------|--------|
| Login `ceo@xe.vn` | Session active on `:8088` |
| CÀI ĐẶT → Đơn vị thành viên | List loads (5 rows + holding); no 403 banner |
| «Chỉnh sửa» row Tập đoàn | Form opens — «Đơn vị thành viên - TẬP ĐOÀN»; legal entity `bad45b73-55b3-4898-baae-d55c5ac2cc2a` hydrated |

### 3. UX-XBOS-06 — ✓ submit cổ đông (Loader2 + POST + F5)

| AC | Evidence |
|----|----------|
| **LOD** — MutationButton busy | Click «Lưu cổ đông» on new row `QA-R2-SH-1781949800000` → button `states: [disabled, busy]`; peer row submit buttons disabled during pending |
| **Network** | `POST /api/xbos/org-foundation/legal-entities/bad45b73-55b3-4898-baae-d55c5ac2a/shareholders` → **201** |
| **FE sau 2xx** | Row remains in Danh sách Cổ đông; no error banner |
| **F5** | Navigate reload → «Chỉnh sửa» Tập đoàn → after hydrate (~4s) row `QA-R2-SH-1781949800000` visible in DOM + GET shareholders API 200 |

**Verdict UX-XBOS-06:** 🟢 **PASS** (G-UX-02 LOD slice closed for holding shareholder submit)

### Matrix delta (R2)

| UF-ID | R1 | R2 |
|-------|----|----|
| UX-XBOS-06 | 🟡 BLOCKED (403 env) | 🟢 PASS |

`docs/qa/UIUX_INTERACTION_AUDIT_MATRIX_8088.md` — UX-XBOS-06 LOD → **PASS** (foundation QA R2).

### Residual

- UX-XBOS-07 upload LOD — still ⚪ SKIP (out of R2 scope).
- Holding form cold-open sometimes shows empty shell ~2s before entity hydrate (timing only; data loads).

**ack_status:** `PASS_TO_PM`

**completion_report:** Closed R2 scope — `group-member-units` 200 on `:8088`; «Chỉnh sửa Tập đoàn» unblocked; UX-XBOS-06 Loader2 + POST 201 + F5 persistence verified browser + API.

**next_owner:** `qc`

**next_dispatch_prompt:**

```text
work_item_id: P1-UIUX-FE-FOUNDATION-01-QC-R2
entry: docs/qa/evidence/p1-uiux-fe-foundation-8088-20260620.md § QA R2 — QA PASS UX-XBOS-04/05/06/08 on :8088
exit: QC audit L3 — confirm UX-XBOS-06 🟢 promoted; G-UX-01 CFM slice GO for foundation wave; no open P0 on CC shareholder path
evidence: append qc verdict to same file + UIUX matrix
ack_status: GO or GO WITH CONDITIONS
cấm: seed; browser-only U65
```

---

## QC R2 — L3 verdict (referenced)

**work_item_id:** `P1-UIUX-FE-FOUNDATION-01-QC-R2`  
**Verdict:** **GO WITH CONDITIONS (scoped — G-UX-01 CFM CC shareholder + legal doc)**  
**Evidence:** `docs/qa/evidence/p1-uiux-fe-foundation-01-qc-r2-20260620.md`  
**Promoted:** UX-XBOS-04/05/08 CFM + UX-XBOS-06 LOD @ `:8088`  
**Open:** foundation-02 (03/09/11/12), G-UX-03 NAV P1 — NOT Phase 1 DONE
