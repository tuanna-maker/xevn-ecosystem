# P1-XBOS-W2-INFRA-QA-RET — J-XBOS-05 steps 2+4 retest (local :5173)

**Date:** 2026-06-06  
**work_item_id:** `P1-XBOS-W2-INFRA-QA-RET`  
**Journey:** J-XBOS-05 — Hạ tầng: nền → gán DN → điểm → custom field detail  
**QA:** qa-lead  
**Account:** `ceo@xe.vn` / `Xevn@2026`  
**Environment:** `http://localhost:5173` → xbos-api `:28002`  
**Prior fix:** `docs/qa/evidence/p1-xbos-w2-infra-fix-20260606.md` (D-INFRA-CUSTOM-ENTITY-KEY-01, D-INFRA-SCOPE-SOFT-01)

## Executive verdict

| Step | Verdict | Notes |
|------|---------|-------|
| **Step 2** — OUT-of-scope site gate | **PASS** | D-INFRA-SCOPE-SOFT-01 **CLOSED** |
| **Step 4a** — Holding (`xbos-group-holding-root`) custom fields | **PASS** | D-INFRA-CUSTOM-ENTITY-KEY-01 **CLOSED** (main alias) |
| **Step 4b** — VISUN member custom fields | **GWC** | Field not rendered when DB scope is `main`-only |

**ack_status:** `PASS_TO_PM` — retest scope steps 2 + 4a **PASS**; step 4b VISUN **GWC** (foundation scope data); dispatch QC optional on holding slice or dev-fe scope follow-up.

---

## Environment traceability

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | **exit 0** — hrm `:28001`, xbos `:28002`, portal `:5173` |
| Login `ceo@xe.vn` | **PASS** — CC shell loads |
| `infrastructureEntityKeyResolver.test.ts` | **5/5 PASS** |
| API GET `customFieldDefsByEntity.main` | **2 defs** — `QA U31 Custom Field`, `QA W2 Infra Custom` |
| API `foundationCategories[0].appliesToCompanyIds` | `["main"]` (probe + post UI save) |

**Click path (L2.5):**  
`/command-center?settings=company_infrastructure` → **Hạ tầng cơ sở** → Tab **2. Điểm hạ tầng** → **Thêm hạ tầng mới** → select pháp nhân → verify **Chi tiết hạ tầng** custom inputs.

---

## Step 2 — OUT-of-scope pháp nhân blocked (D-INFRA-SCOPE-SOFT-01)

| Sub-check | Verdict | Evidence |
|-----------|---------|----------|
| Tab **2. Điểm hạ tầng** → **Thêm hạ tầng mới** | **PASS** | Form **Chi tiết hạ tầng** opens |
| Select **XE_DU_LICH** (`11d2bb7b-6190-4cb4-b0fe-03d43b5596b8`) OUT of foundation scope | **PASS** | `Đơn vị trực thuộc` = XE_DU_LICH |
| Amber scope warning | **PASS** | *Pháp nhân đang chọn chưa nằm trong phạm vi bất kỳ danh mục nền nào — hãy gán pháp nhân trong tab 1…* |
| **Lưu hạ tầng** disabled | **PASS** | `states: [disabled]`; CDP `saveDisabled: true` |
| PUT blocked | **PASS** | No save action when disabled |

**Step 2 verdict:** **PASS** — hard gate replaces prior warn-only (audit GWC).

**Defect:** **D-INFRA-SCOPE-SOFT-01** → **CLOSED**

---

## Step 4 — Custom field config → detail form (D-INFRA-CUSTOM-ENTITY-KEY-01)

### Setup (browser)

1. Tab **1** → foundation **QA-U31** → **Cấu hình khối & trường** → add **QA W2 Infra Custom** → **Xác nhận** → **Lưu danh mục nền** → toast *Đã lưu danh mục nền và phạm vi áp dụng.*
2. API confirms defs under `customFieldDefsByEntity.main` (2 fields).

### 4a — Holding site (`TẬP ĐOÀN` / `xbos-group-holding-root`)

| Sub-check | Verdict | Evidence |
|-----------|---------|----------|
| Tab 2 → **Thêm hạ tầng mới** → `Đơn vị trực thuộc` = **TẬP ĐOÀN** | **PASS** | Entity `xbos-group-holding-root` |
| **QA W2 Infra Custom** input on detail form | **PASS** | Snapshot `textbox name: QA W2 Infra Custom` ref `e155`; heading `QA W2 Infra Custom` |
| Resolver alias `main` ↔ holding | **PASS** | Matches unit test `resolveInfraScopedRecord reads defs stored under main for holding site` |

**4a verdict:** **PASS**

### 4b — VISUN member site (`eb3fb3fc-0081-446b-8d99-2b398dddc709`)

| Sub-check | Verdict | Evidence |
|-----------|---------|----------|
| Tab 2 → **Thêm hạ tầng mới** → `Đơn vị trực thuộc` = **VISUN** | **PASS** | Entity selected |
| **QA W2 Infra Custom** on detail form | **FAIL (GWC)** | CDP `hasW2: false`; no custom `textbox` in a11y tree |
| Root cause | **data/scope** | `appliesToCompanyIds: ["main"]` only — resolver inherits `main` defs for members only when member UUID is in same foundation category (`infrastructureEntityKeyResolver.test.ts` L40–49) |

**4b verdict:** **GWC** — fix works for holding alias; member VISUN needs foundation scope row including VISUN (UI save showed all ticks readonly; persisted scope remained `main`-only).

**Defect:** **D-INFRA-CUSTOM-ENTITY-KEY-01** → **CLOSED** (holding path) · VISUN member path **GWC** pending scope persistence or resolver rollup policy.

---

## Automated regression

```bash
pnpm run qc:dev-stack                                    # exit 0
cd apps/web/web-portal
pnpm exec vitest run src/integrations/infrastructureEntityKeyResolver.test.ts  # 5/5 PASS
```

---

## Defect status

| ID | Prior | Retest |
|----|-------|--------|
| **D-INFRA-SCOPE-SOFT-01** | P2 warn-only | **CLOSED** — save disabled + warning |
| **D-INFRA-CUSTOM-ENTITY-KEY-01** | P1 no render | **CLOSED** holding · **GWC** VISUN when scope DB = `main` only |

---

## Residual / PM dispatch

1. **GWC-4b:** Re-save foundation scope with **VISUN** in `appliesToCompanyIds` via UI (checkboxes were `readonly` during retest) or fix scope persistence `main` vs `xbos-group-holding-root` vs member UUID parity — then re-run 4b only.
2. Optional **QC** `P1-XBOS-W2-QC` on holding slice (steps 2 + 4a) if PM accepts GWC on 4b.

---

## Handoff

**completion_report:** Step **2 PASS** (scope hard-block). Step **4a PASS** (holding custom field render). Step **4b GWC** (VISUN member — DB scope `main`-only). Unit tests **5/5**. L0 stack healthy.

**next_owner:** `pm` → `qc` (GWC GO) or `dev-fe` (foundation scope save if 4b must be strict PASS)

**next_dispatch_prompt:**

```text
PM → QC: work_item_id P1-XBOS-W2-QC — Gate J-XBOS-05 W2 on evidence docs/qa/evidence/p1-xbos-w2-infra-qa-retest-20260606.md. GO WITH CONDITIONS: Step 2 + 4a PASS (D-INFRA-SCOPE-SOFT-01 + D-INFRA-CUSTOM-ENTITY-KEY-01 holding CLOSED); condition C-W2QC-01 = VISUN member custom-field render after foundation appliesToCompanyIds includes eb3fb3fc-… (retest 4b only). Local :5173 ceo@xe.vn.
```

**evidence_path:** `docs/qa/evidence/p1-xbos-w2-infra-qa-retest-20260606.md`  
**ack_status:** `PASS_TO_PM`
