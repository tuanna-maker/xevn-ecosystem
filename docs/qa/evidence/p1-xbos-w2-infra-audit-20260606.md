# P1-XBOS-W2-INFRA-AUDIT — J-XBOS-05 Infrastructure (local :5173)

**Date:** 2026-06-06  
**work_item_id:** `P1-XBOS-W2-INFRA-AUDIT`  
**Journey:** J-XBOS-05 — Hạ tầng: nền → gán DN → điểm  
**QA:** qa-lead  
**Account:** `ceo@xe.vn` / `Xevn@2026`  
**Environment:** `http://localhost:5173` → xbos-api proxy `:28002` (dev stack running)

## Executive verdict

| Layer | Verdict | Notes |
|-------|---------|-------|
| **L2 UI journey (4 steps)** | **GWC PASS** | Steps 1+3 PASS; Step 2 soft-gate only; Step 4 entity-key gap |
| **L1 API probe** | **PASS** | Array payload PUT 200 `XBOS-INFRA-201` |
| **Mock policy** | **PASS (strict)** | No `VITE_ALLOW_MOCK_FALLBACK`; catalog from API |

**ack_status:** `PASS_TO_PM` — local W2 infra journey executable; **2 defects** for dev-fe before QC GO.

---

## Environment traceability

| Check | Result |
|-------|--------|
| Portal `GET /` | **200** |
| Login `POST /api/xbos/auth/login` | **201** + JWT |
| CC shell `#root` children | **>0** (full Command Center) |
| `GET /api/xbos/infrastructure/settings` | **200** `XBOS-INFRA-200` |
| `allowMockFallback()` | **false** (`DEV` only; env flag unset) |
| `infrastructureApi.test.ts` | **4/4 PASS** |

**Click path (L2.5):**  
`/login` → `/command-center?settings=company_infrastructure` → **Hạ tầng cơ sở** → tabs **1. Danh mục nền & phạm vi** / **2. Điểm hạ tầng** → detail / modal / F5.

**Repro probe:**

```bash
PORTAL_DEV_URL=http://localhost:5173 node scripts/tmp-p1-qa-u31-dept-infra-probe.mjs
# exit 0 — PUT array payload XBOS-INFRA-201
```

---

## Step-by-step results

### Step 1 — Tab danh mục nền: create/edit foundation, assign company scope, save

| Sub-check | Verdict | Evidence |
|-----------|---------|----------|
| Navigate Settings → Hạ tầng | **PASS** | URL `?settings=company_infrastructure`; sidebar **Hạ tầng cơ sở** active |
| Tab **1. Danh mục nền & phạm vi** loads | **PASS** | Table row `QA-U31`; no `ApiLoadBanner` error |
| Open **Chi tiết & cấu hình** | **PASS** | CDP click (MCP click intercepted by overlay — automation GWC) |
| Assign scope (TẬP ĐOÀN + VISUN) | **PASS** | Checkboxes ticked; OUT entities unticked |
| **Lưu danh mục nền** | **PASS** | `PUT /api/xbos/infrastructure/settings` **200** `XBOS-INFRA-201`; toast **Đã lưu danh mục nền và phạm vi áp dụng.** |
| Console DB-write | **PASS** | Response body includes `foundationCategories` with `appliesToCompanyIds`: `main`, `xbos-group-holding-root`, `eb3fb3fc-0081-446b-8d99-2b398dddc709` |

**Step 1 verdict:** **PASS**

**Note (pre-save state):** Rows saved earlier with probe-only `appliesToCompanyIds: ["main"]` rendered **0 ticks** in UI until re-saved via UI (ID `main` ≠ UI checkbox id `xbos-group-holding-root`). Not a blocker after UI round-trip.

---

### Step 2 — Tab điểm hạ tầng: IN scope enter values; OUT of scope blocked

| Sub-check | Verdict | Evidence |
|-----------|---------|----------|
| Tab **2. Điểm hạ tầng** | **PASS** | Tab switch OK |
| **IN scope** — VISUN (`eb3fb3fc-…`) | **PASS** | No amber warning; **Lưu hạ tầng** → PUT **200** `XBOS-INFRA-201`; list row shows **VISUN — Công ty TNHH Du lịch Visun** |
| **OUT scope** — XE_DU_LICH (`11d2bb7b-…`) | **GWC** | Amber banner: *Pháp nhân đang chọn chưa nằm trong phạm vi…* — **but** form inputs remain enabled and **Lưu hạ tầng** not disabled |
| Hard block on OUT scope | **FAIL** | `saveInfrastructureSite()` has no `operatingEntityInFoundationScope` guard — warning-only |

**Step 2 verdict:** **GWC** (business intent = block; implementation = warn only)

---

### Step 3 — Save → F5 / tab switch → data persists

| Sub-check | Verdict | Evidence |
|-----------|---------|----------|
| Foundation scope after F5 | **PASS** | TẬP ĐOÀN + VISUN checkboxes remain checked |
| Site row after F5 | **PASS** | Tab 2 list: site `inf-1780734762692` + VISUN column persists |
| Tab switch foundation ↔ sites | **PASS** | No data loss observed |
| API GET after reload | **PASS** | `sites[1]` with `operatingEntityId: eb3fb3fc-0081-446b-8d99-2b398dddc709` |

**Step 3 verdict:** **PASS**

---

### Step 4 — Custom field config → save reflects on detail form

| Sub-check | Verdict | Evidence |
|-----------|---------|----------|
| **Cấu hình khối & trường** modal reachable | **PASS** | From foundation detail; modal opens |
| Add field **QA W2 Infra Custom** | **PASS** | Listed in modal; **Thêm field** + **Xác nhận** + **Lưu danh mục nền** → PUT **200** |
| API persist | **PASS** | `GET customFieldDefsByEntity.main` → defs=2 (`QA U31 Custom Field`, `QA W2 Infra Custom`) |
| Detail form (site edit, VISUN) shows field | **FAIL** | No label/input **QA W2 Infra Custom** on **Chi tiết hạ tầng** after modal closed |
| Detail form (operating entity TẬP ĐOÀN) | **FAIL** | Still no custom field — lookup key `xbos-group-holding-root` ≠ stored key `main` |

**Root cause:** `infraCustomFieldDefsForEntity` indexes `infrastructureCustomFieldDefsByEntity[infraForm.operatingEntityId]`; BE normalizes holding saves to `main`, but site detail never resolves `main` / holding root / member UUID.

**Step 4 verdict:** **FAIL** (config saves; consumer form does not reflect)

---

## Mock / data-source flags

| Flag | Observed | Impact |
|------|----------|--------|
| `VITE_ALLOW_MOCK_FALLBACK` | **unset / false** | Strict API mode |
| `infrastructureCatalogSource` | **api** (inferred) | Row `QA-U31` from DB PUT, not static seed |
| Inline UI copy `Mock: mở biểu mẫu theo pháp nhân đầu tiên đã tick.` | **present** in foundation detail | Dev hint only — **not** mock data source |
| `ApiLoadBanner` UC-XBOS-CC-07 | **absent** | No catalog load failure |

---

## Defects

| ID | Severity | Owner | Summary |
|----|----------|-------|---------|
| **D-INFRA-SCOPE-SOFT-01** | P2 | `dev-fe` | OUT-of-scope pháp nhân on site detail shows amber warning but allows save (`operatingEntityInFoundationScope` not enforced in `saveInfrastructureSite`) |
| **D-INFRA-CUSTOM-ENTITY-KEY-01** | P1 | `dev-fe` | Custom field defs persist under `customFieldDefsByEntity.main` but site detail resolves defs by `operatingEntityId` UUID / `xbos-group-holding-root` — fields never render on **Chi tiết hạ tầng** |

**Not opened (informational):** `platform-audit/events` returned 0 upserts on probe tail — audit trail optional spot; PUT success confirmed via GET round-trip.

---

## Network / console excerpt (sanitized)

```
PUT /api/xbos/infrastructure/settings → 200 XBOS-INFRA-201 "Infrastructure settings saved"
GET /api/xbos/infrastructure/settings → 200 foundationCategories=1 sites=1
```

No **409** `companyId mismatches token scope`. No **400** `must be an object` (DTO array fix confirmed on local).

---

## Gate summary

| Journey step | Verdict |
|--------------|---------|
| 1 Foundation create/edit/scope/save | **PASS** |
| 2 Sites IN scope / OUT scope gate | **GWC** |
| 3 Persist F5 / tab switch | **PASS** |
| 4 Custom field → detail form | **FAIL** |

**J-XBOS-05 overall (local :5173):** **GWC** — PM may close W2 audit wave; dispatch **dev-fe** for P1 entity-key fix before QC GO on infra custom fields.

---

## PM dispatch hint

- Retest J-XBOS-05 Step 4 after `D-INFRA-CUSTOM-ENTITY-KEY-01` fix with VISUN site + holding site.
- Optional: hard-block save on `D-INFRA-SCOPE-SOFT-01` per SRS Tab2 gate.

**evidence_path:** `docs/qa/evidence/p1-xbos-w2-infra-audit-20260606.md`  
**ack_status:** `PASS_TO_PM`
