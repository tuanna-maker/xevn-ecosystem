# PO-HRM-SETTINGS-W3-F5-LIST-FE-03 — F5 list focus (localStorage / CC parent reload)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-W3-F5-LIST-FE-03` |
| **prior_qa** | `SETW3RT4-MSN252HL` · `docs/qa/evidence/po-hrm-settings-w3-browser-01-retry-04.md` |
| **prior_dev** | `PO-HRM-SETTINGS-W3-F5-LIST-FE-02` (sessionStorage — F5 0/4 on parent reload) |
| **Date** | 2026-08-10 |
| **ack_status** | **READY_FOR_QA** |

## Root cause (FE-03)

QA runner: `page.reload()` on **Command Center parent**, then `goto ?tab=` only (no `&focus=`).

- FE-02 persisted focus in **iframe `sessionStorage`**.
- Parent full reload **destroys the iframe browsing context** → sessionStorage cleared → post-F5 hook had no slug → pagination stayed page 1 / row off-page → **0/4** DOM asserts.
- Portal embed is same-origin (`/hr/` proxy); **`localStorage` is shared** parent ↔ iframe (`paths.ts` — JWT bridge). Focus must use `localStorage`, not iframe sessionStorage.

**BE triage:** POST 200 + GET list on same tab must include slug. If GET missing row → `dev-be` scope/tenant; if GET has row → FE pagination/filter.

## Fix

| Change | Detail |
|--------|--------|
| `settingsCatalogFocusStore()` | `localStorage` for read/write/clear focus keys |
| `useSettingsCatalogFocusPage` | Unchanged contract; consumes shared store after GET |
| Tests | `localStorage.clear()` + assert focus not in `sessionStorage` |

## Files (stage for commit — were untracked at `dc930c5`)

- `apps/web/hrm/src/lib/settingsCatalogPagination.ts`
- `apps/web/hrm/src/lib/settingsCatalogPagination.test.ts`
- `apps/web/hrm/src/hooks/useSettingsCatalogFocusPage.ts`
- `apps/web/hrm/src/components/settings/AttAttendanceCodeSettingsPanel.tsx`
- `apps/web/hrm/src/components/settings/EmpDocumentTypeSettingsPanel.tsx`
- `apps/web/hrm/src/components/settings/EmpEmploymentTypeSettingsPanel.tsx`
- `apps/web/hrm/src/components/settings/RecPipelineStageSettingsPanel.tsx`

## Verify (agent)

```text
cd apps/web/hrm
pnpm test src/lib/settingsCatalogPagination.test.ts src/components/settings/AttCodeOtFeAdminSettingsPanels.test.ts
→ 14 tests PASS
```

```text
pnpm run qc:fe-be-health
→ exit 0 ALL PASS
```

## BE probe — GET includes slug after PUT (not FE pagination)

Persona: `ceo@xe.vn` / portal `http://127.0.0.1:5173`

```bash
# 1) Token (portal proxy)
curl -s -X POST "http://127.0.0.1:5173/api/xbos/auth/login" \
  -H "content-type: application/json" \
  -d "{\"email\":\"ceo@xe.vn\",\"password\":\"Xevn@2026\"}"

# 2) PUT upsert (slug lowercase)
curl -s -X PUT "http://127.0.0.1:5173/api/hrm/attendance/attendance-codes" \
  -H "authorization: Bearer <accessToken>" \
  -H "x-tenant-id: xevn" -H "x-company-id: main" \
  -H "content-type: application/json" \
  -d "{\"companyId\":\"main\",\"code\":\"f5fe03probeatt\",\"nameVi\":\"F5 FE03 probe\",\"symbol\":\"P\",\"sortOrder\":100,\"countsAs\":\"work\",\"dayWeight\":1,\"isPaid\":true,\"isPresent\":true,\"status\":\"active\"}"
# → HTTP 200 · code HRM-ATT-CODE-200

# 3) GET list (same as FE loadRows — hard reload path)
curl -s "http://127.0.0.1:5173/api/hrm/attendance/attendance-codes?company_id=main&status=active" \
  -H "authorization: Bearer <accessToken>" \
  -H "x-tenant-id: xevn" -H "x-company-id: main"
# → HTTP 200 · data.data[] contains "code":"f5fe03probeatt"
```

**Agent run (2026-08-10):** PUT **200**; GET **200**; slug `f5fe03probeatt` present in `response.data.data[]` (6 rows). **Conclusion: BE list OK — F5 defect class = FE focus store (fixed).**

**Network (QA):** After Lưu, DevTools → reload parent → filter `attendance-codes` GET → response body must include lowercase slug in `data.data`; table row visible after FE-03 localStorage jump.

## Manual F5 repro (U65)

1. `http://127.0.0.1:5173/command-center/hrm/settings?tab=att-attendance-codes`
2. Thêm → Lưu slug lowercase → POST 2xx → row pre-F5 visible.
3. **F5 parent** (same URL `?tab=` only).
4. Post-F5: `data-testid` / `tr` shows slug; optional `localStorage` key `hrm-settings-catalog-focus:v1:att-attendance-codes` cleared after page jump.
5. Repeat: `emp-document-types`, `emp-employment-types`, `rec-pipeline-stages`.

## completion_report

- **Closed:** localStorage focus persistence for CC parent F5; vitest 14 PASS; BE GET proof slug in list after PUT.
- **Open:** QA browser re-run `QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03` (expect F5 4/4); commit/stage FE paths above.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03
role: qa
entry_criteria: dev-fe READY_FOR_QA docs/qa/evidence/po-hrm-settings-w3-f5-list-fe-03.md; FE files staged/committed; L0 qc:fe-be-health exit 0; portal :5173
exit_criteria: scripts/qa/_tmp-po-hrm-settings-w3-browser-retry-02.mjs — 4 catalog tabs POST 2xx + pre-F5 + F5 lowercase slug 4/4; contract-templates ctr-tpl-canvas PASS; stamp retry-04 or new; on F5 fail capture GET response includes slug (BE vs FE)
persona: ceo@xe.vn / Xevn@2026 · company main
evidence_path: docs/qa/evidence/po-hrm-settings-w3-browser-01-retry-04.md
cấm: seed
```
