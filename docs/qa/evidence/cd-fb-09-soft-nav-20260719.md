# CD-FB-09-SOFT-NAV — Soft-nav iframe Tuyển dụng (FE fix)

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-09-SOFT-NAV` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution |
| **change_mode** | UPGRADE |
| **date** | `2026-07-19` |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | QC **C-CD-FB-09-01** · `docs/qa/evidence/cd-fb-09-recruit-qc-20260719.md` · F6 AC-CD-F6-01..04 must_keep · J-HRM-05 · P-CC-06 hard path |
| **U65** | zero-seed — no seed in this wave |
| **NOT claimed** | Phase 1 DONE · PROD-READY · F-DELIVERY · reopen F6 product ACs · XBOS WF / J-REC-WF |

---

## Defect (C-CD-FB-09-01)

Soft click **Tuyển dụng** from Attendance (or similar embed tab) left iframe on `/hr/attendance` while portal URL already showed `/command-center/hrm/recruitment`. Hard reload / dedicated URL worked. F6 product ACs PASS on hard path.

---

## Root cause (class)

1. **Parent race:** While iframe still loading, soft-nav effect skipped (`!softNavReadyRef`); `onLoad` then set `lastSoftNavPathRef = softNavPath` **without** posting navigate → parent believed catch-up done while document stayed on prior route.
2. **Failed / dropped soft-nav:** `lastSoftNavPathRef` advanced even when content stayed on Attendance — no verify / document fallback.
3. **Stale page tree (belt):** Heavy Attendance + embed soft-nav family — portal embed Outlet lacked pathname key remount when location did commit.

---

## Fix (minimal UPGRADE)

| File | Change |
|------|--------|
| `apps/web/web-portal/src/modules/hrm/portalEmbedSoftNavGuard.ts` | Pure path match + `shouldForceEmbedSrcReload` |
| `apps/web/web-portal/src/modules/hrm/HrmWorkspaceRoute.tsx` | Pending soft-nav while loading; onLoad catch-up; postMessage + 400ms path verify; **document `src` fallback** (content remount) **without** changing `embedScopeKey`; CODE-MEMORY |
| `apps/web/hrm/src/components/layout/AppLayout.tsx` | Portal embed `<Outlet key={location.pathname} />` + CODE-MEMORY |
| `apps/web/hrm/src/lib/portalEmbedSoftNavigate.ts` | CODE-MEMORY-CHANGE (applicator unchanged) |
| `apps/web/hrm/src/components/layout/PortalEmbedRouterSync.tsx` | CODE-MEMORY-CHANGE note |
| Tests | Guard + Attendance→recruitment soft-nav regressions |

**must_keep:** `key={embedScopeKey}` never includes path; F6 JD CRUD / funnel / ĐVTV filter; P-CC-06 hard-nav; no seed; no XBOS WF.

---

## Tests

```text
pnpm --filter web-portal exec vitest run \
  src/modules/hrm/portalEmbedSoftNavGuard.test.ts \
  src/modules/hrm/portalEmbedNavBridge.test.ts \
  src/modules/hrm/paths.test.ts
→ 18 passed

pnpm --filter vite_react_shadcn_ts exec vitest run \
  src/lib/portalEmbedSoftNavigate.test.ts \
  src/lib/portalEmbedNavBridge.test.ts \
  src/components/layout/PortalEmbedRouterSync.test.ts
→ 9 passed (includes Attendance → /recruitment)
```

---

## QA retest (browser, U65 — narrow soft-nav)

Env: portal + hrm-api L0. Persona: Group CEO `ceo@xe.vn` · JWT `main`.

| # | Click path | Expect |
|---|------------|--------|
| 1 | `/command-center/hrm/attendance` → soft click **Tuyển dụng** | Iframe shows recruitment (funnel / JD tabs) **without** hard browser reload; not stuck on Attendance |
| 2 | Repeat #1 once (Att → Rec) | Same PASS |
| 3 | Soft-nav Rec → Att → Rec | Recruitment content remounts each soft click to Tuyển dụng |
| 4 | Hard-nav P-CC-06 | `/command-center/hrm/recruitment` still shows 6-stage funnel (regression) |
| 5 | Smoke F6 | Thư viện JD / Yêu cầu / funnel visible — do **not** re-run full AC-CD-F6-01..04 mutate unless visual break |

**cấm:** seed · reopen PASS F6 ACs without regression · require J-REC-WF · Phase1/PROD claim

---

## completion_report

Closed **C-CD-FB-09-01** FE side: soft-nav parent race + path verify/src fallback + portal Outlet remount. Vitest portal 18 + HRM 9 PASS. F6 product code paths untouched. Ready for narrow browser soft-nav QA.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: CD-FB-09-SOFT-NAV
from_role: pm
to_role: qa
subagent_type: qa
lane: execution
residual_auto_fix: true

Retest C-CD-FB-09-01 after FE soft-nav UPGRADE (pending catch-up + src fallback + Outlet key).
entry_criteria: FE deploy/HMR with HrmWorkspaceRoute + AppLayout changes; L0 stack; U65 zero-seed; browser-only
read_first: docs/qa/evidence/cd-fb-09-soft-nav-20260719.md
exit_criteria:
  1) Soft click Attendance → Tuyển dụng shows /hr/recruitment content without hard browser reload
  2) Repeat soft-nav Att↔Rec OK
  3) Hard-nav P-CC-06 funnel still visible (must_keep)
  4) Do NOT reopen F6 AC-CD-F6-01..04 unless broken; no seed; no J-REC-WF
evidence_path: docs/qa/evidence/cd-fb-09-soft-nav-qa-20260719.md
ack_status: PASS_TO_PM or FAIL_TO_PM
```

**ack_status:** **READY_FOR_QA**  
**evidence_path:** `docs/qa/evidence/cd-fb-09-soft-nav-20260719.md`
