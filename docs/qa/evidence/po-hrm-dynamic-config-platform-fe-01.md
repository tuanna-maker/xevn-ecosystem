# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-FE-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-FE-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-07 |
| **change_mode** | **ADD** |
| **prior** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BE-01` READY_FOR_QA |
| **honesty** | `contracts_printable_ready=false` — **no** module UAT flip |
| **must_keep** | UF-HRM-02 · print-spine · soft-delete · U65 · DYNAMIC-LOCK open catalog |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| BE-01 evidence | `docs/qa/evidence/po-hrm-dynamic-config-platform-be-01.md` — F-PLT-TOK-01..03 `/api/hrm/merge-tokens` |
| API-01 | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md` F-PLT-TOK · **AC-PLT-CTR-05** |
| TechSpec | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md` §1.1C MergeToken · §6 |
| ADR | `ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md` Option **B** |
| Pattern neo | Settings tab `contract-legal` · `ContractLegalPrintSettingsPanel` (sibling ADD — no DnD rewrite) |
| DYNAMIC-LOCK | Format-only `tokenKey` validation — **no** closed token_key enum blocking #9+ |

---

## 2. Deliverable (apps)

| Path | Role |
|------|------|
| `apps/web/hrm/src/lib/mergeTokenCatalog.ts` | Format + vi-VN labels · display-ready helper |
| `apps/web/hrm/src/lib/mergeTokenCatalog.test.ts` | Open-catalog format tests (5 PASS) |
| `apps/web/hrm/src/components/settings/MergeTokenSettingsPanel.tsx` | List · upsert · retire · resolve-preview smoke |
| `apps/web/hrm/src/pages/Settings.tsx` | Wire panel under tab **Điều khoản HĐ** |
| `apps/web/hrm/src/integrations/hrmApi.ts` | F-PLT-TOK client (GET/PUT/POST/PATCH/retire/resolve-preview) |
| `apps/web/hrm/src/lib/apiError.ts` | Friendly `HRM-PLT-*` |
| `ContractLegalPrintSettingsPanel.tsx` | CODE-MEMORY APPEND only (sibling neo) |

**Cấm / not done:** seed demo · rewrite JD DnD · invent printable · claim module UAT · closed token enum.

---

## 3. Routes / click path (QA — AC-PLT-CTR-05)

| Step | Action |
|------|--------|
| 0 | Account: `ceo@xe.vn` / `Xevn@2026` · scope `company_id=main` (portal OU) |
| 1 | Mở HRM Settings → tab **Điều khoản HĐ** (`data-testid=settings-tab-contract-legal`) |
| 2 | Cuộn tới card **Token merge hợp đồng** (`data-testid=settings-merge-tokens`) |
| 3 | Nhập: `tokenKey` (vd. `custom.emp.badge`) · **Nhãn tiếng Việt** bắt buộc · `sourcePath` · ring/domain/origin · nếu origin=`extension_field` → `extensionFieldRef` |
| 4 | Bấm **Đăng ký / Upsert** (`hdsd-merge-token-save`) → Network **PUT** `/api/hrm/merge-tokens` **2xx** |
| 5 | **Tải lại (F5 list)** hoặc F5 trang → row hiện với **labelVi** + `{{tokenKey}}` (`settings-merge-tokens-table`) — **không** raw-key-only |
| 6 | (Optional) **Kiểm tra resolve (registry)** → badge nguồn = **Registry MergeToken** khi row active |
| 7 | PREV path: màn **Hợp đồng** → ContractPrintSpine **Preview** — BE shared resolve: registry wins khi token có trong registry; empty registry → keyword_map fallback (print-spine must_keep) |
| 8 | Retire: nút Ngừng → soft-delete; list active ẩn token (BR-PLT-04) |

**HDSD inventory (U76):**

- `settings-tab-contract-legal`
- `settings-merge-tokens`
- `hdsd-merge-token-key` · `hdsd-merge-token-label` · `hdsd-merge-token-source`
- `hdsd-merge-token-ring` · `hdsd-merge-token-domain` · `hdsd-merge-token-origin` · `hdsd-merge-token-ext-ref`
- `hdsd-merge-token-save` · `hdsd-merge-token-reload` · `hdsd-merge-token-resolve-preview`
- `settings-merge-tokens-table` · `settings-merge-token-row-{tokenKey}`

---

## 4. Verification (dev)

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/mergeTokenCatalog.test.ts --reporter=dot
→ Test Files: 1 passed · Tests: 5 passed
```

---

## 5. Honesty

| Flag | Value |
|------|-------|
| `contracts_printable_ready` | **false** |
| U65 seed in evidence | **none** |
| Module / Phase1 UAT flip | **none** |

---

## 6. completion_report

**Closed:** Settings MergeToken surface under contract-legal neo; wire F-PLT-TOK-01..03 (list/upsert/retire/resolve-preview); display-ready `labelVi` + `{{tokenKey}}`; format-only validation (DYNAMIC-LOCK); vitest 5 PASS; CODE-MEMORY; honesty false.

**Residual:** EMP extension-item → auto upsert same-txn (R-PLT-API-01 / BE); holding publish tokens GĐ1.5; full PREV browser with live contract values still QA after FE ready.

**next_owner:** **qa**

---

## 7. next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-QA-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-01
residual_auto_fix: true
entry_criteria: FE-01 READY_FOR_QA · BE-01 READY_FOR_QA · U65 zero-seed · browser-only
read_first:
  - docs/qa/evidence/po-hrm-dynamic-config-platform-fe-01.md (routes/click path §3)
  - docs/qa/evidence/po-hrm-dynamic-config-platform-be-01.md
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md AC-PLT-CTR-05
task:
  - Browser AC-PLT-CTR-05: login ceo@xe.vn → Settings → Điều khoản HĐ → Token merge
  - Register/upsert token (labelVi + tokenKey) → Network PUT 2xx → Tải lại/F5 → row in list with label (not raw-key-only)
  - Optional: Kiểm tra resolve → source=registry; then Contracts Preview path consumes registry when present
  - Confirm no closed-enum block on custom.#9+ style keys (DYNAMIC-LOCK)
  - If PLATFORM-QA-01 already ran L1-only: retest browser slice and supersede L1-only note
  - Honesty: contracts_printable_ready=false · no seed
exit: PASS_TO_PM · evidence docs/qa/evidence/po-hrm-dynamic-config-platform-qa-01.md
must_keep: UF-HRM-02 · print-spine · soft-delete · U65 · DYNAMIC-LOCK
```

---

## 8. ack_status

**READY_FOR_QA**
