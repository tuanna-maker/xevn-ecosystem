# P1-XBOS-W4-DEPT-TREE-AUDIT — J-XBOS-07 localhost audit

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-XBOS-W4-DEPT-TREE` |
| **journey_id** | **J-XBOS-07** — PB pháp nhân: thêm/sửa node → Lưu dòng → F5 reload cây |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **Date** | 2026-06-06 |
| **Environment** | `http://localhost:5173` (U32 local) |
| **Stack** | web-portal `:5173` · xbos-api `:28002` · hrm-api `:28001` |
| **Account** | `ceo@xe.vn` / `Xevn@2026` (`company_id=main`) |
| **Mental model** | `docs/program/XBOS_CC_BUSINESS_MENTAL_MODEL.md` § J-XBOS-07 |
| **Phase 1 / PROD** | **Not claimed** |

## Executive summary

W4 audit **FAIL** for **J-XBOS-07** round-trip on **Tập đoàn XeVN** holding scope: row-level **Lưu dòng** returns success toast and `POST /api/xbos/org-foundation/org-units`, but **F5 reload** shows an **empty** dept row — audit marker `QA-W4-PB-001` **not** visible. Root cause chain: `tenant-scope/group-org-overview` returns `trees: []` for master tenant (holding tree not aggregated); FE `loadLegalEntityDepartmentTree` cannot hydrate saved units; **Trưởng bộ phận** remains **static mock** (`DEPT_HEAD_OPTIONS`). **Do not** promote J-XBOS-07 to QC until reload PASS.

| Step | Verdict |
|------|---------|
| L0 stack | **PASS** |
| Open Settings → Phòng/Ban pháp nhân | **PASS** |
| Add node + Lưu dòng (holding) | **PASS** (toast + POST) |
| F5 reload — same entity | **FAIL** |
| Edit persisted row after reload | **BLOCKED** (no row) |
| DEPT_HEAD mock audit | **FAIL** (P1 spec_gap) |
| Member entity (XE Du lịch) empty tree | **FAIL** (no rows loaded) |

**Overall J-XBOS-07:** **FAIL** → PM dispatch **dev-be** + **dev-fe**.

---

## Pre-check (L0)

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | **exit 0** — hrm `:28001`, xbos `:28002`, portal `:5173` HTTP 200 |
| Login `ceo@xe.vn` | **PASS** — `/command-center` |
| CC shell | **PASS** — no Vite overlay |

---

## Mock / static audit (mandatory W4)

| Item | Source | Verdict |
|------|--------|---------|
| **Trưởng bộ phận** dropdown | `DEPT_HEAD_OPTIONS` in `CommandCenterPage.tsx` L884–892 — hardcoded `head-1`…`head-6` (Nguyễn Văn An, Trần Thị Bích, …) | **FAIL** — not wired to employees / org positions API |
| Dept row seed fallback | `seedDepartmentsForCompany()` mock rows when API empty | **GWC** — not triggered this run (blank row only) |
| `VITE_ALLOW_MOCK_FALLBACK` | Not required for dept save path; save uses live `orgFoundationApi.saveOrgUnit` | **PASS** (save path live) |

**Browser snapshot (Trưởng bộ phận options):**

```text
— Chọn trưởng bộ phận —, Nguyễn Văn An — TGĐ (head-1), Trần Thị Bích — Phó TGĐ (head-2),
Lê Văn Cường — GĐ HCNS (head-3), Phạm Minh Duy — GĐ CN Hà Nội (head-4),
Hoàng Thu E — GĐ CN Đà Nẵng (head-5), Đỗ Quân F — Trưởng phòng NS (head-6)
```

---

## J-XBOS-07 — L2.5 browser (Settings → tenant_departments)

**Test marker:** `QA-W4-PB-001` / `QA W4 Dept Tree Audit 20260606`  
**Click path:** CC → **CÀI ĐẶT HỆ THỐNG** → **Phòng/Ban pháp nhân** → tab **Tập đoàn XeVN**

### Step 1 — Open screen

| Item | Value |
|------|-------|
| URL | `http://localhost:5173/command-center?settings=tenant_departments` |
| Scope bar | **Tập đoàn XeVN** selected |
| Initial row state | One blank editable row (code/name empty) |
| Error banner | None |
| **Verdict** | **PASS** |

### Step 2 — Add node + save

| Item | Value |
|------|-------|
| Fields | code `QA-W4-PB-001`, name `QA W4 Dept Tree Audit 20260606`, head `head-3` (Lê Văn Cường — GĐ HCNS), function `QA-W4 audit function text` |
| Action | **Lưu dòng** (per-row save) |
| Toast | `Đã lưu phòng ban lên org-foundation.` |
| Network | `POST http://localhost:5173/api/xbos/org-foundation/org-units` (~149ms) |
| **Verdict** | **PASS** (create path) |

### Step 3 — F5 reload (round-trip)

| Item | Value |
|------|-------|
| Action | Full page reload same URL |
| Expected | Row shows `QA-W4-PB-001` + saved name/head/function |
| Observed | Single **blank** row again (empty code/name; head `— Chọn trưởng bộ phận —`) |
| **Verdict** | **FAIL** |

### Step 4 — Edit after reload

| Item | Value |
|------|-------|
| Action | N/A — no persisted row to edit |
| **Verdict** | **BLOCKED** |

### Step 5 — Member legal entity slice (XE Du lịch)

| Item | Value |
|------|-------|
| Click path | Scope tab **X.E Du lịch VN** (W1 audit name) |
| Observed | **Zero** dept rows rendered (only add buttons; no inputs) |
| **Verdict** | **FAIL** — member tree not hydrated from org-foundation |

---

## API corroboration (QA probe, same session)

| Probe | Result |
|-------|--------|
| `GET /tenant-scope/group-org-overview` | **200** — `trees: []` (memberships include master only) |
| `POST /org-foundation/org-units` duplicate `QA-W4-PB-001` | **500** `duplicate key` — confirms prior save in DB under `tenant_id=xevn` |
| `POST` with `legalEntityId=14f0a473-…` (holding UUID) | **201** — unit `QA-W4-PB-002` saved `company_id=holding` |
| Re-fetch `group-org-overview` after 201 | Still `trees: []` — holding/master tree **not** in overview aggregate |

**Root-cause notes (for Dev):**

1. **BE** `listGroupOrgTreesForUser` only loads `tenant_kind = 'member'` trees — holding/master `xevn` dept units saved under `company_id=main|holding` never appear in overview (`org-foundation.service.ts` L240–263).
2. **FE** `loadLegalEntityDepartmentTree` matches `trees.find(t => t.tenantId === legalEntityId)` — `legalEntityId` is UI company id, not member `tenantId`; fallback `flatMap` still empty when overview `trees` empty.
3. **FE** `submitDepartmentRow` sets `legalEntityId` only when `isPersistedApiId(key)` (UUID); holding tab id may be non-UUID → save with `legalEntityId: null`.
4. **FE** `useEffect` hydrate skips reload when `departmentRowsByEntity[entityId]` already has length — stale blank row blocks re-fetch after failed initial load.

---

## Defect register

| ID | Severity | Status | Summary | Owner |
|----|----------|--------|---------|-------|
| **D-W4-DEPT-RELOAD-01** | **P0** | **OPEN** | J-XBOS-07 FAIL: save toast PASS but F5 shows empty row; audit marker lost | dev-be + dev-fe |
| **D-W4-DEPT-OVERVIEW-01** | **P0** | **OPEN** | `group-org-overview` returns `trees:[]` — holding/master org units not aggregated | dev-be |
| **D-W4-DEPT-HEAD-MOCK-01** | **P1** | **OPEN** | `DEPT_HEAD_OPTIONS` static mock — user believes real managers integrated | dev-fe |
| **D-W4-DEPT-LEGAL-ID-01** | **P1** | **OPEN** | Save omits `legalEntityId` when scope entity id is not UUID | dev-fe |
| **D-W4-DEPT-MEMBER-EMPTY-01** | **P1** | **OPEN** | Member legal entity tab shows no dept rows after scope switch | dev-be + dev-fe |

---

## Residual / PM dispatch

| Item | Action |
|------|--------|
| Journey map | Add **J-XBOS-07** row → **FAIL** in `PROGRAM_JOURNEY_MAP.md` |
| Matrix | Add `tenant_departments` / P-CC row to `PILOT_BUSINESS_FLOW_MATRIX.md` (spec_gap) |
| QC | **Hold** W4 QC until J-XBOS-07 retest PASS |
| Cleanup | QA probe rows `QA-W4-PB-001`, `QA-W4-PB-002` in DB — Dev may delete or reuse on retest |

---

## Handoff

- **completion_report:** J-XBOS-07 audited on `:5173` with `ceo@xe.vn`. Closed: L0, screen open, per-row save API. **Open:** F5 reload FAIL, DEPT_HEAD mock, member empty tree, overview aggregation gap.
- **next_owner:** **pm** → dispatch **dev-be** (overview + holding tree) + **dev-fe** (hydrate + legalEntityId + DEPT_HEAD API).
- **next_dispatch_prompt:** See below.
- **evidence_path:** `docs/qa/evidence/p1-xbos-w4-dept-tree-audit-20260606.md`

### next_dispatch_prompt (copy-ready)

```text
P1-XBOS-W4-DEPT-TREE — Dev fix D-W4-DEPT-RELOAD-01 + D-W4-DEPT-OVERVIEW-01 + D-W4-DEPT-HEAD-MOCK-01

Entry: QA evidence docs/qa/evidence/p1-xbos-w4-dept-tree-audit-20260606.md (J-XBOS-07 FAIL).

dev-be:
- Include holding/master tenant org units in group-org-overview (or dedicated holding tree endpoint) for ceo@xe.vn.
- Ensure listMemberOrgTree returns units for company_id main AND holding where legal_entity_id matches.
- Regression: org-foundation integration spec for overview non-empty after org-unit POST.

dev-fe:
- loadLegalEntityDepartmentTree: resolve legal entity UUID from group-member-units / legal-entities; re-fetch on F5 (do not skip when stale blank row).
- submitDepartmentRow: always pass legalEntityId for holding + member entities.
- Replace DEPT_HEAD_OPTIONS with employee/position picker (or disable until API ready + banner).
- Files: CommandCenterPage.tsx, orgFoundationApi.ts.

Exit: QA retest J-XBOS-07 — add QA-W4-PB-001 → Lưu dòng → F5 → row persists with head/function; no static head mock.
Evidence: docs/qa/evidence/p1-xbos-w4-dept-tree-retest-YYYYMMDD.md
ack_status: READY_FOR_QA
```
