# P1-METADATA-APPLY-QA-8088 — Browser propagation QA (:8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-METADATA-APPLY-QA-8088` |
| **role** | qa |
| **executed_at** | 2026-06-20T20:15+07 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · scope `main` |
| **portal** | http://14.225.217.232:8088/ |
| **prior_handoff** | `docs/qa/evidence/p1-metadata-apply-ux-fe-20260620.md` (`READY_FOR_QA`) |
| **matrix** | `docs/qa/METADATA_APPLY_PROPAGATION_MATRIX.md` |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

**PASS (in-scope wave)** — After QA sync + `portal-fe` recreate (VPS was **stale** — `infrastructureFieldsConfigUx.ts` missing pre-deploy), browser U65 on `:8088` confirms **Path A** infra apply UX: busy spinner, emerald page banner, modal close, **PUT 200** `XBOS-INFRA-201`, consumer field visible on site form after chọn **Đơn vị trực thuộc**, **F5** persists defs. **Path B** hint/deep-link logic **deployed + unit PASS**; member-units form has **no modal entry** (spec_gap) — hint verified via code + vitest, not full browser click from ĐVTV form.

---

## Pre-test deploy (QA — stale bundle)

| Check | Pre | Post |
|-------|-----|------|
| VPS `infrastructureFieldsConfigUx.ts` | **MISSING** | **EXISTS** |
| VPS `applyInfrastructureFieldsConfig` count | 0 | **2** |
| Served `/src/integrations/infrastructureFieldsConfigUx.ts` | N/A | **200** |
| `docker compose … portal-fe` recreate | — | **OK** |

---

## Path A — Infra config apply → site form consumer (primary)

**Click path:** Login → CC → **Hạ tầng cơ sở** → tab **2. Điểm hạ tầng** → **Thêm hạ tầng mới** → **Mở cấu hình khối & trường** → add label `QA-META-INF-F5-8088` → **Thêm field** → **Xác nhận (áp dụng)** → chọn **Đơn vị trực thuộc** = Tập đoàn XeVN → observe form → **F5** → re-open add site + chọn entity.

| Step | Observation | Verdict |
|------|-------------|---------|
| Apply UX | Button `[busy]` during save; modal closes; page `[role=status]` emerald: *«Đã áp dụng cấu hình hạ tầng cho pháp nhân (xbos-group-holding-root) — …»* | 🟢 |
| Network | `PUT /api/xbos/infrastructure/settings` → **200** `XBOS-INFRA-201` (probe + FE apply) | 🟢 |
| Consumer | Textbox **`QA-META-INF-F5-8088`** visible in **Khối Thông tin chung** after `operatingEntityId` selected | 🟢 |
| F5 | After reload: field label **`QA-META-INF-F5-8088`** still on site form (CDP probe `hasField:true`) | 🟢 |

**Note:** Custom fields bind via `infraForm.operatingEntityId` — user must chọn **Đơn vị trực thuộc** (not only Pháp nhân sở hữu) before inputs render.

---

## Path B — Member units hint → consumer navigation

**Expected (dev-fe):** Modal opened with `openedFromMenu=company_member_units` shows sky hint + **Mở màn nhập điểm hạ tầng** → `/command-center?settings=company_infrastructure`.

| Step | Observation | Verdict |
|------|-------------|---------|
| Entry | `?settings=company_member_units` → **Chỉnh sửa** pháp nhân — **no** «Cấu hình khối & trường» on legal profile form | 🟡 spec_gap |
| Hint logic | `shouldShowInfraConsumerNavHint('company_member_units')` → vitest **3/3 PASS** | 🟢 |
| Deep link | `infrastructureSiteEntrySettingsUrl()` → `/command-center?settings=company_infrastructure` — vitest PASS | 🟢 |
| Deploy parity | Served `CommandCenterPage.tsx` contains `shouldShowInfraConsumerNavHint`, `navigateToInfrastructureSiteEntry`, `infrastructureApplySuccessBanner` | 🟢 |
| Browser hint+click | Blocked — no UI path to open infra modal while `activeSettingsMenu=company_member_units` | 🟡 PARTIAL |

---

## AC-META-PROP-* verdict table (matrix SoT)

| AC-ID | Scope this wave | Verdict | Evidence |
|-------|-----------------|---------|----------|
| **AC-META-PROP-INF-01** | Path A — infra → điểm HT | 🟢 **PASS** | Steps 1–3 above; field `QA-META-INF-F5-8088` + F5 |
| **AC-META-PROP-LE-01** | Path B — ĐVTV → form pháp nhân | 🟡 **PARTIAL** | Step 1 **FAIL** (by design — no `companyForm` bind); Step 2 hint/CTA **code+unit PASS**, browser entry missing |
| **AC-META-PROP-GHR-01** | Group HR → HRM form | ⚪ **OUT OF SCOPE** | Not in `P1-METADATA-APPLY-UX-FE-01` handoff |
| **AC-META-PROP-DEPT-01** | Dept templates → org tree | ⚪ **OUT OF SCOPE** | Matrix GAP — future wave |
| **AC-META-PROP-FND-01** | Foundation scope → site form | ⚪ **NOT RETESTED** | Prior WIRED; no regression signal this wave |

---

## Automated checks

```text
pnpm --filter web-portal exec vitest run src/integrations/infrastructureFieldsConfigUx.test.ts  → 3/3 PASS
PUT /api/xbos/infrastructure/settings?company_id=main  → 200 XBOS-INFRA-201
GET  /api/xbos/infrastructure/settings?company_id=main  → qa_meta_inf_f5_8088 persisted after FE apply
```

---

## Residual / not promoted

| ID | Severity | Owner | Notes |
|----|----------|-------|-------|
| **SPEC-GAP-MU-INF-MODAL-ENTRY** | P2 | ba-process | ĐVTV legal form lacks button to open infra metadata modal — Path B browser blocked |
| **AC-META-PROP-LE-01 bind** | P1 product | pm → dev-fe | Legal entity form still static vs infra defs (matrix GAP row) |
| **UX-INF-OPERATING-ENTITY** | P3 | dev-fe | Custom fields hidden until **Đơn vị trực thuộc** chosen — document in SRS AC |

---

## Handoff packet

| Field | Value |
|-------|-------|
| **completion_report** | Deployed stale `:8088` bundle; Path A **AC-META-PROP-INF-01 🟢**; Path B hint/deep-link **unit+deploy PASS**, browser **PARTIAL** (no member_units modal entry). Overall wave **PASS_TO_PM**. |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | `work_item_id: P1-METADATA-CONSUMER-PARITY-FE-02 — entry: docs/qa/evidence/p1-metadata-apply-qa-8088-20260620.md residual AC-META-PROP-LE-01 + SPEC-GAP-MU-INF-MODAL-ENTRY. Dispatch dev-fe: (1) add ĐVTV form entry to open infra modal with openedFromMenu=company_member_units OR BA delta UX copy; (2) product decision legal_entity consumer bind. exit: Path B browser hint+nav 🟢; LE-01 documented. evidence: docs/qa/evidence/p1-metadata-consumer-parity-fe-20260620.md ack READY_FOR_QA.` |
| **evidence_path** | `docs/qa/evidence/p1-metadata-apply-qa-8088-20260620.md` |
| **ack_status** | **PASS_TO_PM** |
