# P1-INFRA-FCAT-CONSUMER-FE-01 — Infra site consumer field bind

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-INFRA-FCAT-CONSUMER-FE-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **entry** | `docs/qa/evidence/p1-infra-fcat-wizard-qa-20260620.md` R-QA-FCAT-01 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` |
| **URL** | `http://14.225.217.232:8088/command-center?settings=company_infrastructure` |
| **executed_at** | 2026-06-21 |
| **spec_ref** | `METADATA_APPLY_PROPAGATION_MATRIX.md` AC-META-PROP-INF-01 · `INFRA_FOUNDATION_CATEGORY_WIZARD_UX.md` AC-FCAT-S3-02 |
| **ack_status** | **READY_FOR_QA** |

---

## Problem (R-QA-FCAT-01)

Wizard step 3 saved custom fields (`QA-FCAT-FLD-*`) for holding (`xbos-group-holding-root`) — modal count showed **3 trường** — but tab **2. Điểm hạ tầng** site form did not render custom field labels in DOM.

Root cause class: consumer read path on site detail did not share the same **effective foundation scope** as wizard preview (draft category scope + `resolveInfraScopedRecord` alias plane); stale PUT/GET snapshot after wizard save (BR-META-PROP-01); new site opened with empty `operatingEntityId`.

---

## Fix

| Check | Implementation |
|-------|----------------|
| **K1** | New `infraSiteConsumerContext.ts` — unified site consumer reads via `resolveMetadataFieldDefs` / `resolveMetadataCustomBlocks` |
| **K2** | `effectiveInfraFoundationCategories` merges in-flight wizard draft into resolver scope (wizard ≡ site) |
| **K3** | `applyInfrastructureSettingsFromPayload` — apply PUT/GET snapshot before re-fetch (wizard + modal apply) |
| **K4** | `openNewInfrastructureSite` pre-fills `operatingEntityId` from foundation scope / wizard preview entity |
| **K5** | Hide custom fields when entity ∉ foundation scope; hint when chưa chọn đơn vị |

## Files

- `apps/web/web-portal/src/integrations/infraSiteConsumerContext.ts` (new)
- `apps/web/web-portal/src/integrations/infraSiteConsumerContext.test.ts` (new)
- `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` (consumer bind + save sync)

---

## Verify (agent)

```text
pnpm --filter web-portal exec vitest run src/integrations/infraSiteConsumerContext.test.ts src/integrations/metadataConsumerResolver.test.ts src/integrations/infrastructureEntityKeyResolver.test.ts  → 15/15 PASS
pnpm --filter web-portal build                                                                                                        → exit 0
```

## Deploy (:8088)

| File | Remote |
|------|--------|
| `CommandCenterPage.tsx` | `/opt/xevn-ecosystem/apps/web/web-portal/src/pages/command-center/` |
| `infraSiteConsumerContext.ts` | `/opt/xevn-ecosystem/apps/web/web-portal/src/integrations/` |
| `metadataConsumerResolver.ts` | same |
| `infrastructureEntityKeyResolver.ts` | same |

`docker compose --env-file .env up -d --force-recreate portal-fe` — smoke: `8088/` **200**, `/command-center` **200**; container verify: `infraSiteConsumerContext.ts` 3681 B, `CommandCenterPage.tsx` 486502 B.

---

## QA browser retest (U65 — FE-only)

### AC-UF-INF-FCAT-01 step 6 + AC-META-PROP-INF-01

1. **Hạ tầng cơ sở** → tab **1. Danh mục nền** → wizard holding → field `QA-FCAT-FLD-{ts}` → **Xác nhận & áp dụng**.
2. Tab **2. Điểm hạ tầng** → **Thêm hạ tầng mới** (expect holding pre-selected) **or** **Sửa** site → **Đơn vị trực thuộc = Tập đoàn**.
3. **Expect:** label custom field visible in capacity/general block; Network prior PUT **200** `XBOS-INFRA-201`.
4. **F5** → field defs persist on site detail.

**Verdict target:** step 6 🟢 (closes R-QA-FCAT-01).

---

## Handoff packet

**completion_report:** Closed R-QA-FCAT-01 consumer bind — unified infra site consumer context, effective foundation scope (wizard draft merge), BR-META-PROP-01 save snapshot sync, default operating entity on new site. vitest 15/15; build exit 0; deployed :8088 portal-fe recreate + smoke 200.

**next_owner:** **qa**

**next_dispatch_prompt:** `work_item_id: P1-INFRA-FCAT-CONSUMER-QA-01 — entry: docs/qa/evidence/p1-infra-fcat-consumer-20260621.md READY_FOR_QA. Retest AC-UF-INF-FCAT-01 step 6 + AC-META-PROP-INF-01 on http://14.225.217.232:8088 — U65 browser-only zero-seed; ceo@xe.vn / Xevn@2026; wizard holding field QA-FCAT-FLD-* must render on tab 2 Điểm hạ tầng after save + F5. exit: R-QA-FCAT-01 🟢; update p1-infra-fcat-wizard-qa evidence; ack PASS_TO_PM.`

**evidence_path:** `docs/qa/evidence/p1-infra-fcat-consumer-20260621.md`

**ack_status:** **READY_FOR_QA**
