# P1-HRM-SCALE-FE-W2-INS-LIST — Insurance list mount capped (no page=1..11 fan-out)

**work_item_id:** `P1-HRM-SCALE-FE-W2-INS-LIST`  
**date:** 2026-07-17  
**owner:** dev-fe  
**ack_status:** READY_FOR_QA  
**U65:** zero-seed (no seed used)  
**Closes condition:** `COND-SCALE-W2-INS-LIST-FANOUT` (P2 residual from Scale W2 / ATT-NAV QC GWC)  
**NOT claimed:** Phase 1 DONE / PROD-READY

---

## spec_read_ack

| Artifact | Sections | Notes |
|----------|----------|-------|
| `docs/hrm/SRS.md` | §UC-HRM-25 Embed HĐ/BHXH | List via contracts-insurance; insurance menu fidelity |
| `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` | §2.1 `insurance` · §4.3 H-INS | `GET /contracts-insurance/insurance`; BR-LINK-07 |
| `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` | §5.2 page_size · §5.5 **T-FANOUT** · §6 W2 residual | Mount ≤1–2 list GETs; no auto `page=1..N` dump |
| `docs/qa/evidence/p1-hrm-scale-qa-w2-20260717.md` | Residual INS list fan-out | Browser: `/hr/insurance` → insurance `page=1..11` ×`page_size=100` |
| QC | `qc-d-hrm-att-nav-stall-01-20260717.md` | ATT-NAV CLOSED; INS-LIST still open |

**UC / BR:** UC-HRM-25 · UF-HRM-04 · J-HRM-04 · BR-INS-01 · BR-LINK-07  
**change_mode:** **REPLACE** — unbounded progressive `while (accumulated < total)` → mount `maxPages=1` + explicit `loadMore`  
**must_keep:** Insurance UI fidelity; W2 employee picker (`AddInsuranceDialog` typeahead); ATT-NAV soft-nav; J-HRM-02 Employees path  
**forbidden:** iframe `key` by path; `listAllEmployees` picker regression; `listAllInsuranceRecords` on mount

**spec says:** T-FANOUT ≤1–2 insurance list GETs on mount; honest totals (API `total`); no fake subtype/summary counts when data is capped.  
**code does (after):** Mount calls `listInsuranceRecords` **page=1 only**; `hasMore` + «Tải thêm»; «Tất cả» chip uses API `total`; BHXH/BHYT/BHTN chips use `~N` from loaded sample when capped; summary amounts labeled partial (no summary endpoint).

---

## Changes

| File | Change |
|------|--------|
| `apps/web/hrm/src/hooks/useInsuranceList.ts` | **REPLACE** auto page loop → `HRM_INSURANCE_MOUNT_MAX_PAGES=1`; `loadInsuranceListNextPage` + hook `loadMore` / `isCapped` / `hasMore` |
| `apps/web/hrm/src/hooks/useInsuranceList.test.ts` | Mount ≤1 GET; explicit maxPages=2; nextPage; source guard |
| `apps/web/hrm/src/pages/Insurance.tsx` | Capped hint + Load more; partial summary note; `~` subtype counts |
| `apps/web/hrm/src/i18n/locales/vi.json` · `en.json` | `cappedHint` / `loadMore` / `summary.partialNote` / loading strings |

**Unchanged (must stay green):**
- `AddInsuranceDialog` W2 typeahead picker
- ATT-NAV soft-nav / `embedScopeKey`
- Employees J-HRM-02 / `useEmployeesPage`
- `listAllInsuranceRecords` remains API helper (not called from mount hook)

---

## Verification

```text
pnpm --filter vite_react_shadcn_ts test -- src/hooks/useInsuranceList.test.ts src/lib/insuranceSummary.test.ts src/hooks/useEmployeePicker.test.ts
→ 3 files / 28 tests PASS

pnpm --filter vite_react_shadcn_ts exec tsc --noEmit -p tsconfig.json
→ exit 0
```

---

## QA checklist (browser `:8088`, U65)

Persona: `ceo@xe.vn` / `Xevn@2026`

### COND-SCALE-W2-INS-LIST-FANOUT

1. Soft/hard nav → `/command-center/hrm/insurance` (iframe `/hr/insurance`).
2. Network (iframe `PerformanceResourceTiming`): **`GET …/contracts-insurance/insurance?…page=1&page_size=100` ≤1–2** on mount — **0** `page=2..11` auto chain.
3. UI: table paints; chip «Tất cả» shows API **total** (honest); if `total > loaded`, capped hint + **Tải thêm** visible; subtype chips `~N` when capped.
4. Click **Tải thêm** → **+1** insurance list GET (`page=2`); rows append; no dump of remaining pages unless user keeps clicking.
5. Error path: non-2xx still shows banner + retry (not silent empty).

### Regression (must_keep)

| Check | Expect |
|-------|--------|
| Insurance **Thêm** dialog picker | ≤1 employees GET page=1 (+ keyword); **0** `listAllEmployees` |
| Soft-nav leave Attendance → Employees/Contracts | view updates; `_v` stable (ATT-NAV) |
| J-HRM-02 Employees | T-FANOUT ≤1 list GET; profile ≤1 detail |

---

## Residual

| Item | Severity | Owner |
|------|----------|-------|
| No insurance **summary** endpoint — financial cards partial when capped | P3 product | `dev-be` if sponsor wants full-scope sums |
| Contracts list still auto-progressive (same class as old INS) | P2 backlog | separate work_item if QA flags |
| T-CONC 1000 VU | NFR W3 | devops |

---

## Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `devops` (deploy HRM FE) → `qa` (browser Network)
- **evidence_path:** `docs/qa/evidence/p1-hrm-scale-fe-w2-ins-list-20260717.md`
