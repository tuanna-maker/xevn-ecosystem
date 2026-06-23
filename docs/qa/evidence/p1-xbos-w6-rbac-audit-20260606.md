# QA evidence — P1-XBOS-W6-RBAC-AUDIT (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | P1-XBOS-W6-RBAC-AUDIT |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-06 |
| **environment** | `http://localhost:5173` ONLY · `ceo@xe.vn` / `Xevn@2026` |
| **mental_model** | `docs/program/XBOS_CC_BUSINESS_MENTAL_MODEL.md` § J-XBOS-09 |
| **journey** | **J-XBOS-09** — Phân quyền: toggle → debounce 600ms → F5 → matrix sticky |
| **wave** | W6 `P1-XBOS-W6-RBAC` |

## Executive summary

| Check | Verdict | Notes |
|-------|---------|-------|
| **J-XBOS-09** toggle → debounce → F5 persist | **PASS** | `pm-org-3` / **Xóa** for role `raci_hdqt`: false→true→PUT 200→F5 sticky; reverse true→false→F5 sticky |
| **Separation** from legal-entity **Nhiệm vụ & RACI** tab | **PASS** | Different route, UI, API (`position-rbac` vs `raci-governance`); 0 view/write/delete checkboxes on entity RACI |
| API unit regression | **PASS** | `position-rbac.controller.spec.ts` 7/7 exit 0 |

**Overall:** Journey **PASS** with **P2 UX defects** (click intercept overlay; no save feedback). No P0/P1 blocker on matrix persistence.

---

## Environment traceability

| Service | Port | Health |
|---------|------|--------|
| web-portal | 5173 | HTTP 200 |
| xbos-api (proxy) | 28002 | `GET /api/xbos/` → 200 |

Account: group CEO JWT `tenantId=xevn`, `companyId=main`.

---

## J-XBOS-09 — Settings → Hệ thống phân quyền

### Click path

| Step | Action | Result |
|------|--------|--------|
| 1 | `http://localhost:5173/command-center?settings=permission` | **PASS** — menu *Hệ thống phân quyền* active; role tab **HĐQT (RACI)** selected |
| 2 | Expand **Quản trị tổ chức** → row *Phê duyệt thay đổi cấu trúc tập đoàn & đăng ký kinh doanh* | **PASS** |
| 3 | Toggle **Xóa** checkbox (`pm-org-3`, index 10) `false → true` | **PASS** UI state updates |
| 4 | Wait **≥600ms** debounce | **PASS** — `PUT /api/xbos/position-rbac/matrix` **HTTP 200** (~700ms after toggle) |
| 5 | F5 same URL | **PASS** — **Xóa** remains **checked** |
| 6 | Reverse toggle `true → false`, wait 700ms, F5 | **PASS** — **Xóa** remains **unchecked** |

### API (browser fetch hook)

```
PUT /api/xbos/position-rbac/matrix  → 200
GET /api/xbos/position-rbac/matrix?roleId=raci_hdqt  → 200 (post-F5 hydrate)
```

Payload contract: `{ roleId: "raci_hdqt", rows: [{ rowId: "pm-org-3", view, write, delete, approve, dataScope }, …] }`.

BE table: `public.xbos_cc_permission_matrix_cell` (`PositionRbacService.savePermissionMatrix`).

### Debounce evidence

FE `schedulePermissionMatrixSave` uses `setTimeout(..., 600)` in `CommandCenterPage.tsx`. Observed single PUT per toggle burst after 600–700ms wait.

### Console

No `409 companyId mismatches`, no `54321`, no *permission matrix save failed* banner on successful toggles.

---

## Separation — Settings phân quyền vs legal-entity RACI tab

| Dimension | Settings **Hệ thống phân quyền** | Legal entity **Nhiệm vụ & RACI** |
|-----------|-----------------------------------|----------------------------------|
| URL | `?settings=permission` | `?settings=company_member_units` → detail → tab *Nhiệm vụ & RACI* |
| UI | Module accordion; checkboxes **Xem/Ghi/Xóa/Duyệt** + phạm vi | Activity catalog; matrix cells **R/A/C/I** letters |
| API | `/api/xbos/position-rbac/matrix` | `/api/xbos/raci-governance/companies/{uuid}/matrix?domain=…` |
| Entity scope | Tenant-wide role templates (`raci_hdqt`, …) | Per legal entity UUID `11d2bb7b-…` (XE_DU_LICH) |
| Checkbox count on RACI tab | N/A (not rendered) | **0** permission-matrix checkboxes |

Entity RACI load (XE_DU_LICH): 235 hoạt động, matrix `ban_dieu_hanh` **200** — no `position-rbac` calls on that tab.

**Note:** Settings permission page includes read-only block *Chuẩn RACI & cột chức danh* (catalog reference). This is **metadata**, not the entity RACI editor — documented as UX clarity item (D-W6-RBAC-UX-02).

---

## Defect table

| ID | Severity | Journey | Symptom | Owner | Evidence |
|----|----------|---------|---------|-------|----------|
| **D-W6-RBAC-UI-01** | **P2** | J-XBOS-09 | `browser_click` on matrix checkbox and member **Chỉnh sửa** intercepted by overlay `<div>` at `top=76, left=0, 851×421`; requires `scrollIntoView` + programmatic click | **dev-fe** | This file § J-XBOS-09 step 3; same class as W1 detail hydration race |
| **D-W6-RBAC-UX-01** | P3 | J-XBOS-09 | No toast/spinner/*Đã lưu* after debounced PUT succeeds — user cannot confirm save without network tab | dev-fe | Toggle + PUT 200 with silent UI |
| **D-W6-RBAC-UX-02** | P3 | J-XBOS-09 / separation | *Chuẩn RACI & cột chức danh* table inside Settings permission may be confused with entity *Nhiệm vụ & RACI* tab (different APIs) | ba-process + dev-fe | § Separation table |
| **D-W6-RBAC-NET-01** | P3 | J-XBOS-09b (RACI tab spot-check) | Duplicate `GET raci-governance/.../matrix` and `coverage` (4× each) on entity RACI tab open | dev-fe | § Separation — net log during XE_DU_LICH RACI tab |

No `scope_parity` issue: list/matrix GET and PUT use same `roleId` + `rowId`.

---

## Regression commands

```bash
# API (xbos-api package)
pnpm --filter xbos-api test -- position-rbac.controller.spec.ts   # 7/7 PASS

# Stack (already up for audit)
curl -s -o NUL -w "%{http_code}" http://localhost:5173/          # 200
curl -s -o NUL -w "%{http_code}" http://localhost:28002/api/xbos/ # 200
```

---

## Completion contract

**completion_report:** J-XBOS-09 matrix toggle debounce persist **PASS** (bidirectional). Settings permission matrix **separate** from legal-entity RACI tab **PASS** (distinct routes/APIs/UI). Logged **4 defects** (1× P2, 3× P3); no P0/P1 on persistence path.

**next_owner:** **pm** → optional **qc** W6 gate; **dev-fe** for D-W6-RBAC-UI-01 if PM promotes overlay fix before QC.

**next_dispatch_prompt:**

```text
@qc — P1-XBOS-W6-RBAC-QC (J-XBOS-09)

work_item_id: P1-XBOS-W6-RBAC-QC
entry_criteria: QA PASS docs/qa/evidence/p1-xbos-w6-rbac-audit-20260606.md — J-XBOS-09 toggle persist + RACI separation verified on localhost:5173 ceo@xe.vn
exit_criteria: QC concurs L2 J-XBOS-09 PASS; GWC only for D-W6-RBAC-UI-01 P2 + P3 UX items with owner/expiry; no dispatch block on matrix persist
evidence_path: docs/qa/evidence/qc-p1-xbos-w6-20260606.md
ack_status target: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/p1-xbos-w6-rbac-audit-20260606.md`

**ack_status:** **PASS_TO_PM**

**pm_dispatch_hint:** P1-XBOS-W6-RBAC-UI-FIX — D-W6-RBAC-UI-01 overlay click intercept (optional before UAT polish).
