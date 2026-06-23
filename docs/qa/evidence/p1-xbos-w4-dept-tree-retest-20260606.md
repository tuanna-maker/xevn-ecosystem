# P1-XBOS-W4-DEPT-TREE-RETEST — J-XBOS-07 retest after dev-be+fe fixes

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-XBOS-W4-DEPT-TREE` |
| **journey_id** | **J-XBOS-07** |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **FAIL_TO_PM** |
| **date** | 2026-06-06 |
| **environment** | `http://localhost:5173` (U32 local) |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **prerequisites** | `docs/qa/evidence/p1-xbos-w4-dept-be-fix-20260606.md`, `docs/qa/evidence/p1-xbos-w4-dept-fe-fix-20260606.md` |
| **prior audit** | `docs/qa/evidence/p1-xbos-w4-dept-tree-audit-20260606.md` |

## Executive summary

Retest after W4 dev-be+fe fixes: **FE head-picker + member hydrate PASS**; **holding save→F5 round-trip still FAIL**. Root cause chain: (1) stale `xbos-api` process served pre-W4 code until QA restarted `node dist/main.js`; (2) after restart `group-org-overview` returns **5 trees** but holding tree exposes only `segment` nodes — `QA-W4-PB-*` units exist in DB (`duplicate key` on re-save) yet **not** returned by `listOrgTreeByLegalEntity` for the holding legal-entity id selected in overview (`LIMIT 1` mismatch across 4 holding legal entities). **Do not promote J-XBOS-07 to QC.**

| Step | Verdict |
|------|---------|
| L0 `qc:dev-stack` | **PASS** (exit 0) |
| Settings → Phòng/Ban pháp nhân open | **PASS** |
| Trưởng bộ phận — HRM not mock | **PASS** |
| Holding: save `QA-W4-PB-003` | **FAIL** (HTTP 500 duplicate — row already in DB from prior attempt; no user-visible success) |
| Holding: F5 reload persist | **FAIL** (blank scaffold row; marker not hydrated) |
| Member tab dept rows | **PASS** (X.E TM-DV: `XUONG-DICH-VU`, `BAN-GIAM-OC`) |
| API `group-org-overview` post-restart | **PASS** (trees=5, `xbos-group-holding-root` present) |

**Overall J-XBOS-07:** **FAIL** → dispatch **dev-be** (holding legal-entity tree parity) + **dev-fe** (upsert-on-duplicate UX).

---

## Pre-check (L0)

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | **exit 0** — hrm `:28001`, xbos `:28002`, portal `:5173` HTTP 200 |
| Stack remediation | Killed stale PID **11408** (`node dist/main.js` pre-W4); rebuilt + started fresh xbos-api (`docs/qa/evidence/p1-xbos-w0-stack-20260606.md` pattern) |

---

## API corroboration

### Before xbos-api restart (stale process)

```text
GET /api/xbos/tenant-scope/group-org-overview → trees: []
```

Matches prior audit FAIL — W4 BE code not active at runtime.

### After xbos-api restart (W4 build)

```text
GET group-org-overview → trees: 5
  xbos-group-holding-root → tree nodes: 1 (segment pilot-segment-tourism only)
  f01bb8dc-… (X.E TM-DV) → departments: XUONG-DICH-VU, BAN-GIAM-OC
  … (3 more member legal entities with seed nodes)

GET org-units/tree (holding) → mode: group; QA-W4-PB-* codes: NOT in tree JSON
POST org-units QA-W4-PB-003 → HTTP 500 duplicate key
  detail: (tenant_id, company_id, code)=(xevn, holding, QA-W4-PB-003) already exists
```

**Interpretation:** Save path writes units; reload path queries holding overview tree keyed to **first** holding `legal_entity` row — saved units linked to a **different** holding UUID are invisible to FE hydrate (`flattenOrgTreeToDeptRows` → empty → blank scaffold).

---

## J-XBOS-07 — L2.5 browser

**URL:** `http://localhost:5173/command-center?settings=tenant_departments`  
**Click path:** CC → **CÀI ĐẶT HỆ THỐNG** → **Phòng/Ban pháp nhân**

### Step 1 — Trưởng bộ phận mock audit (D-W4-DEPT-HEAD-MOCK-01)

| Item | Observed |
|------|----------|
| Dropdown options | HRM employees, e.g. `Lê Minh An — CEO (HLD-0051)`, `Võ Minh An — HR_SPECIALIST (VTH-0057)` — **no** `head-1`…`head-6` |
| **Verdict** | **PASS** — FE fix confirmed |

### Step 2 — Holding tab save + F5 (`QA-W4-PB-003`)

| Item | Value |
|------|-------|
| Fields | code `QA-W4-PB-003`, name `QA W4 Dept Tree Retest 20260606`, function `QA-W4 retest function J-XBOS-07`, head `Lê Minh An — CEO (HLD-0051)` |
| Action | **Lưu dòng** |
| Network | `POST /api/xbos/org-foundation/org-units` → **500** duplicate key (unit already persisted) |
| UI banner | `org-foundation.org-units.create failed: duplicate key … (HTTP 500)` |
| F5 reload | Single **blank** row (empty code/name) — **QA-W4-PB-003 not visible** |
| **Verdict** | **FAIL** — D-W4-DEPT-RELOAD-01 **OPEN** |

### Step 3 — Member tab rows (D-W4-DEPT-MEMBER-EMPTY-01)

| Item | Value |
|------|-------|
| Tab | **X.E TM-DV** (`f01bb8dc-99fd-46bf-9653-21ae9f696e5a`) |
| Rows observed | `XUONG-DICH-VU` / Xưởng dịch vụ; `BAN-GIAM-OC` / Ban Giám đốc |
| Head picker | Disabled on member tab — banner: `tenantId mismatches token scope` (**GWC**, not J-XBOS-07 blocker) |
| **Verdict** | **PASS** — member tree hydrated from overview |

---

## Defect register (post-retest)

| ID | Severity | Status | Summary | Owner |
|----|----------|--------|---------|-------|
| **D-W4-DEPT-RELOAD-01** | **P0** | **OPEN** | Holding F5: DB has `QA-W4-PB-*` but UI blank after reload | dev-be |
| **D-W4-DEPT-OVERVIEW-01** | P0 | **CLOSED** *runtime* | Overview trees non-empty after xbos restart; code OK | — |
| **D-W4-DEPT-HEAD-MOCK-01** | P1 | **CLOSED** | HRM employee picker on holding tab | — |
| **D-W4-DEPT-MEMBER-EMPTY-01** | P1 | **CLOSED** | Member tab shows seed dept rows | — |
| **D-W4-DEPT-LEGAL-MATCH-01** | **P0** | **NEW** | Holding overview uses `LIMIT 1` legal entity; saved units use another holding UUID → tree/hydrate gap | dev-be |
| **D-W4-DEPT-DUP-SAVE-01** | P1 | **NEW** | Re-save existing code → HTTP 500; FE should PUT/upsert not POST | dev-fe |
| **D-W4-XBOS-STALE-RUNTIME-01** | P1 | **GWC** | `nest start --watch` crashed; stale `node dist/main.js` masked W4 BE fix | devops/qa runbook |

---

## Residual / not promoted

- **J-XBOS-07** journey map row remains **FAIL** until holding F5 PASS.
- Probe rows `QA-W4-PB-001`, `QA-W4-PB-002`, `QA-W4-PB-003` in DB — Dev cleanup optional.
- Member head picker scope (**GWC**) — separate from this wave closure.

---

## Handoff

- **completion_report:** Closed: L0, screen open, HRM head picker, member dept hydrate, overview API after restart. **Open:** holding save→F5 FAIL; legal-entity id mismatch in holding tree query; duplicate POST UX.
- **next_owner:** **pm** → **dev-be** (D-W4-DEPT-LEGAL-MATCH-01 + D-W4-DEPT-RELOAD-01)
- **next_dispatch_prompt:** See below.
- **evidence_path:** `docs/qa/evidence/p1-xbos-w4-dept-tree-retest-20260606.md`

### next_dispatch_prompt (copy-ready)

```text
P1-XBOS-W4-DEPT-HOLDING-TREE — fix D-W4-DEPT-LEGAL-MATCH-01 + D-W4-DEPT-RELOAD-01

Entry: QA FAIL docs/qa/evidence/p1-xbos-w4-dept-tree-retest-20260606.md

dev-be:
- listGroupOrgTreesForUser / listOrgTreeByLegalEntity: aggregate ALL holding legal_entity rows (or match resolveDepartmentSaveContext UUID), include department org_units with legal_entity_id in holding set.
- Regression: after POST org-unit with holding legalEntityId, group-org-overview holding tree contains code on GET.
- Ensure xbos-api W4 build running (not stale dist/main).

dev-fe (parallel):
- submitDepartmentRow: on duplicate key → PUT existing unit id instead of raw 500 banner (D-W4-DEPT-DUP-SAVE-01).

Exit: QA retest J-XBOS-07 — QA-W4-PB-004 save → F5 → row persists on Tập đoàn tab.
ack_status: READY_FOR_QA
```

---

## R2 retest — P1-XBOS-W4-DEPT-FINAL-RET (2026-06-06)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-XBOS-W4-DEPT-FINAL-RET` |
| **journey_id** | **J-XBOS-07** |
| **from_role** | qa |
| **to_role** | qc |
| **ack_status** | **READY_FOR_QC** |
| **environment** | `http://localhost:5173` (U32 local) |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **fixes verified** | `p1-xbos-w4-dept-holding-be-fix`, `p1-xbos-w4-dept-dup-fe-fix`, `p1-xbos-w4-dept-fe-fix` |

### Executive summary

Final retest after all W4 fixes: **J-XBOS-07 PASS** — holding save→F5 round-trip, existing probe rows hydrate, HRM head picker, member tab rows, duplicate re-save via PUT (no HTTP 500). Promote to **QC** for L3 gate.

| Step | Verdict |
|------|---------|
| L0 `qc:dev-stack` | **PASS** (exit 0) — hrm `:28001`, xbos `:28002`, portal `:5173` |
| Stack remediation | Killed stale xbos PID **16408**; clean `tsc -p tsconfig.build.json` + restart `node dist/main.js` on `:28002` |
| Settings → Phòng/Ban pháp nhân open | **PASS** |
| Holding: existing `QA-W4-PB-001/002/003` after F5 | **PASS** (4 dept rows hydrated — not blank scaffold) |
| Holding: save new `QA-W4-PB-FINAL` → F5 | **PASS** (`POST` **201**; row persists with name/function/HRM head) |
| Trưởng bộ phận — HRM not mock | **PASS** (`Lê Minh An — CEO (HLD-0051)`, no `head-1`…`head-6`) |
| Re-save existing code `QA-W4-PB-003` | **PASS** (`PUT …/org-units/{id}` **200**; toast «Đã lưu phòng ban»; no 500 banner) |
| Member tab **X.E TM-DV** rows | **PASS** (`XUONG-DICH-VU`, `BAN-GIAM-OC`) |
| API `group-org-overview` holding tree | **PASS** (`xbos-group-holding-root` tree contains `QA-W4-PB-001/002/003/FINAL`) |

**Overall J-XBOS-07:** **PASS** → **READY_FOR_QC**

---

### Pre-check (L0)

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | **exit 0** (hrm `:28001`, xbos `:28002`, portal `:5173`) |
| xbos-api rebuild | Removed `dist` + `tsconfig.build.tsbuildinfo`; `pnpm build` (nest) → `dist/main.js` present |
| xbos-api runtime | Fresh `node dist/main.js` on `:28002` after killing stale listener |
| Independent live verify | QA session re-run 2026-06-06 — browser + API `tree[]` field corroboration |

---

### API corroboration (post W4 holding-be-fix)

```text
GET /api/xbos/tenant-scope/group-org-overview (via :5173 proxy, ceo@xe.vn JWT)
  HTTP 200; trees=5
  xbos-group-holding-root.tree[] QA codes:
    QA-W4-PB-003, QA-W4-PB-FINAL, QA-W4-PB-002, QA-W4-PB-001
  f01bb8dc-… (X.E TM-DV).tree[]:
    root, XUONG-DICH-VU, BAN-GIAM-OC

Browser re-save QA-W4-PB-003:
  PUT /api/xbos/org-foundation/org-units/8fffb64c-e0fe-41af-84ac-d0e342b5e5a8 (no duplicate POST 500)
```

Note: probe script `tmp-p1-w4-dept-retest-probe.mjs` reads `trees[].units` — API field is **`tree`**; script exits 1 on field-name mismatch only; product behaviour **PASS** via browser + corrected tree walk above.

---

### J-XBOS-07 — L2.5 browser

**URL:** `http://localhost:5173/command-center?settings=tenant_departments`  
**Click path:** CC → **CÀI ĐẶT HỆ THỐNG** → **Phòng/Ban pháp nhân** → tab **Tập đoàn XeVN**

#### Step 1 — Existing rows hydrate after F5 (D-W4-DEPT-RELOAD-01)

| Item | Observed |
|------|----------|
| Initial load | Rows `QA-W4-PB-003`, `QA-W4-PB-002`, `QA-W4-PB-001` with name/function/head populated |
| F5 reload | Same 3 rows + no blank scaffold |
| **Verdict** | **PASS** — **D-W4-DEPT-RELOAD-01 CLOSED** |

#### Step 2 — New save `QA-W4-PB-FINAL` → F5

| Item | Value |
|------|-------|
| Fields | code `QA-W4-PB-FINAL`, name `QA W4 Final Retest 20260606`, function `QA-W4 FINAL retest function J-XBOS-07 R2`, head `Lê Minh An — CEO (HLD-0051)` |
| Action | **Lưu dòng** |
| Network | `POST /api/xbos/org-foundation/org-units` → **201** |
| UI | Toast «Đã lưu phòng ban lên org-foundation.» |
| F5 reload | Row `QA-W4-PB-FINAL` visible (4 dept rows total) |
| **Verdict** | **PASS** |

#### Step 3 — HRM head picker (D-W4-DEPT-HEAD-MOCK-01)

| Item | Observed |
|------|----------|
| Dropdown | HRM employees (`Lê Minh An — CEO (HLD-0051)`, `Võ Minh An — HR_SPECIALIST (VTH-0057)`, …) |
| **Verdict** | **PASS** — regression confirmed closed |

#### Step 4 — Duplicate re-save (D-W4-DEPT-DUP-SAVE-01)

| Item | Value |
|------|-------|
| Action | **Lưu dòng** on existing `QA-W4-PB-003` (unchanged fields) |
| Network | `PUT /api/xbos/org-foundation/org-units/8fffb64c-e0fe-41af-84ac-d0e342b5e5a8` → **200** |
| UI | Success toast; **no** duplicate-key HTTP 500 banner |
| **Verdict** | **PASS** — **D-W4-DEPT-DUP-SAVE-01 CLOSED** |

#### Step 5 — Member tab (D-W4-DEPT-MEMBER-EMPTY-01)

| Item | Value |
|------|-------|
| Tab | **X.E TM-DV** |
| Rows | `XUONG-DICH-VU` / Xưởng dịch vụ; `BAN-GIAM-OC` / Ban Giám đốc |
| **Verdict** | **PASS** |

#### Step 6 — Holding legal-entity aggregate (D-W4-DEPT-LEGAL-MATCH-01)

| Item | Observed |
|------|----------|
| API | Holding tree includes units linked to **multiple** holding `legal_entity_id` UUIDs (`bad45b73-…`, `14f0a473-…`, null segment) |
| **Verdict** | **PASS** — **D-W4-DEPT-LEGAL-MATCH-01 CLOSED** |

---

### Defect register (post-R2)

| ID | Severity | Status | Summary |
|----|----------|--------|---------|
| **D-W4-DEPT-RELOAD-01** | P0 | **CLOSED** | Holding F5 hydrate shows saved rows |
| **D-W4-DEPT-LEGAL-MATCH-01** | P0 | **CLOSED** | All holding legal_entity UUIDs aggregated in overview tree |
| **D-W4-DEPT-DUP-SAVE-01** | P1 | **CLOSED** | Re-save → PUT 200, no duplicate 500 |
| **D-W4-DEPT-HEAD-MOCK-01** | P1 | **CLOSED** | HRM employee picker |
| **D-W4-DEPT-MEMBER-EMPTY-01** | P1 | **CLOSED** | Member tab seed rows |
| **D-W4-DEPT-OVERVIEW-01** | P0 | **CLOSED** | Overview trees non-empty |
| **D-W4-XBOS-STALE-RUNTIME-01** | P1 | **GWC** | QA runbook: kill stale `:28002` + clean tsc before retest |

---

### Residual / GWC

- Member head picker disabled + `tenantId mismatches token scope` banner on member tab — **GWC** (pre-existing; not J-XBOS-07 blocker).
- Probe script field-name mismatch (`units` vs `tree`) — update script optional; not product defect.
- QA probe rows `QA-W4-PB-*` remain in DB for regression; Dev cleanup optional before prod.

---

### Handoff

- **completion_report:** All J-XBOS-07 acceptance steps **PASS** on localhost after W4 BE holding aggregate + FE hydrate/dup-fix. Closed D-W4-DEPT-RELOAD-01, D-W4-DEPT-LEGAL-MATCH-01, D-W4-DEPT-DUP-SAVE-01. Residual: member head scope GWC only.
- **next_owner:** **qc**
- **next_dispatch_prompt:** See below.
- **evidence_path:** `docs/qa/evidence/p1-xbos-w4-dept-tree-retest-20260606.md` (§ R2 retest)
- **ack_status:** **READY_FOR_QC**

### next_dispatch_prompt (copy-ready)

```text
P1-XBOS-W4-DEPT-QC-GATE — J-XBOS-07 L3 Go/No-Go

Entry: QA R2 PASS docs/qa/evidence/p1-xbos-w4-dept-tree-retest-20260606.md § R2 retest
Evidence: L0 exit 0; holding QA-W4-PB-FINAL save→F5; PUT duplicate no 500; member X.E TM-DV rows; HRM head picker.

QC: Re-audit L0–L2.5 for J-XBOS-07; confirm defect closures D-W4-DEPT-*; GO or GO WITH CONDITIONS (member head scope GWC acceptable).

Exit: Update PROGRAM_JOURNEY_MAP J-XBOS-07 → PASS; PHASE1_CRUD matrix if applicable.
ack_status: PASS_TO_PM or FAIL_TO_PM
```
