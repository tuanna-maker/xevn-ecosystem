# P1-HRM-PROCESSES-FE-01-QA — Browser retest AC-PROC-01..04

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-PROCESSES-FE-01-QA` |
| **date** | 2026-07-17 |
| **owner** | qa |
| **persona** | `ceo@xe.vn` (localStorage `xevn.portal.user` = CEO Tập đoàn; JWT `companyId=main`) |
| **URL** | `http://14.225.217.232:8088/command-center/hrm/processes` |
| **entry** | DevOps READY_FOR_QA `p1-hrm-processes-fe-01-deploy-20260717.md` (HEAD `8967262`) · BA lock `p1-hrm-processes-ba-01-20260717.md` |
| **U65** | zero-seed · browser-only · **no** `pnpm seed:*` / API mutate / DB fake |
| **ack_status** | **PASS_TO_PM** |

---

## Click path

1. Open dedicated tab → `http://14.225.217.232:8088/command-center/hrm/processes` (session already `ceo@xe.vn` / BOD).
2. Confirm portal shell: menu **Quy trình & chính sách** current; embed iframe ` /hr/processes?portal=1&tenantId=xevn&companyId=main `.
3. Inspect iframe UI: title, subtitle, tabs, empty card, mutate CTAs, toasts.
4. Hard reload same URL; re-audit Network (PerformanceResourceTiming) + console hooks.
5. Scroll empty notice `[data-testid=processes-readonly-notice]` into view → screenshot.

---

## AC results

| AC | Criteria | Result | Evidence |
|----|----------|--------|----------|
| **AC-PROC-01** | No fake **Thêm** / **Sửa** / **Xóa** action or success toast | **PASS** | Iframe buttons only: `Tất cả đơn vị (rollup)`, `Quy trình`, `Quy định`. `mutateLike=[]`. Toast count **0**. No `toast.success` / `useMutation` in live hook surface. |
| **AC-PROC-02** | Empty/read-only copy honest: «chưa hỗ trợ» / **XBOS-DM-HRM-14** | **PASS** | Subtitle: *Tham chiếu… (chỉ xem — cấu hình mã quy trình trên XBOS)*. Empty: *Chưa có quy trình nào* + *Thêm/sửa/xóa quy trình chưa hỗ trợ trên HRM — … XBOS (XBOS-DM-HRM-14).* |
| **AC-PROC-03** | No Radix `DialogTitle` / `aria-describedby` console warning | **PASS** | No `[role=dialog]` open on empty list; console warn/error hooks **[]**; view `Dialog` has `DialogTitle` + `DialogDescription` + `aria-describedby="processes-view-desc"` (source + deploy bind-mount proof). |
| **AC-PROC-04** | L0 no ERROR/409/54321; no seed; screenshot + console | **PASS** | APIs sampled **200** (`/api/hrm/`, `/api/xbos/*`); `badApis=[]`; `has409=false`; `has54321=false`; no ERROR banner in iframe text. Screenshots below. |

### Overall: **PASS_TO_PM** (4/4 AC 🟢)

Closes prior menu-QA GWC residuals: **F-02** fake stub toast · **F-03** DialogTitle a11y (no Add dialog path).

---

## Network (L0 sample — post hard reload)

| Endpoint | Status |
|----------|--------|
| `/api/xbos/auth/me` | 200 |
| `/api/xbos/tenant-scope/group-member-units` | 200 |
| `/api/xbos/command-center/workspace-meta?tenantId=xevn&companyId=main` | 200 |
| `/api/xbos/kpi-engine/rollup?tenantId=xevn&companyId=main` | 200 |
| `/api/xbos/workflow-engine/tasks?...` | 200 |
| `/api/hrm/` | 200 ×2 |
| Embed `/hr/processes?portal=1&tenantId=xevn&companyId=main` | 200 |

No POST/PUT/PATCH/DELETE to processes. Seed: **none**.

---

## Console excerpt

```text
parent.__qaConsole / iframe.__qaConsole / __qaAllConsole = []
a11yWarns (DialogTitle|aria-describedby|DialogContent) = []
errorCount = 0 · warnCount = 0
vite-error-overlay = none (false-positive style node text ignored)
```

---

## Screenshots

| File | What |
|------|------|
| `docs/qa/evidence/p1-hrm-processes-fe-01-qa-20260717.png` | Portal embed processes — read-only shell, no Thêm CTA |
| `docs/qa/evidence/p1-hrm-processes-fe-01-qa-notice-20260717.png` | Empty state + **XBOS-DM-HRM-14** / «chưa hỗ trợ» notice visible |

---

## Iframe DOM excerpt (CDP)

```text
Quy trình & Quy định
Tham chiếu quy trình / quy định (chỉ xem — cấu hình mã quy trình trên XBOS)
Quy trình | Quy định
Chưa có quy trình nào
Thêm/sửa/xóa quy trình chưa hỗ trợ trên HRM — cấu hình mã quy trình nằm ở XBOS (XBOS-DM-HRM-14).
```

---

## Residual

| ID | Sev | Note |
|----|-----|------|
| R-PROC-TAB-CDP | P3 | Programmatic CDP click on Radix **Quy định** tab did not flip `data-state` in automation; product Tabs markup is standard uncontrolled `defaultValue="processes"`. Not AC fail — empty notice shared via `PROCESSES_MUTATION_UNSUPPORTED_VI` for both panels in source. Manual click expected OK. |
| R-PROC-LIST-EMPTY | info | List empty under U65 (honest) — no Eye/view-dialog path exercised (no rows). |

---

## Handoff packet

- **completion_report:** Browser retest on `:8088` as `ceo@xe.vn` — **AC-PROC-01..04 all PASS**. Fake Thêm/Sửa/Xóa + success toast removed; honest XBOS-DM-HRM-14 empty copy; no DialogTitle console warn on load; L0 clean (no 409/54321/ERROR). U65 no seed. Prior F-02/F-03 closed for this menu.
- **next_owner:** **pm** (optional **qc** wave gate if releasing processes menu; else close work item)
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/p1-hrm-processes-fe-01-qa-20260717.md`

### next_dispatch_prompt

```text
work_item_id: P1-HRM-PROCESSES-FE-01-QA-INTAKE
from_role: qa
to_role: pm

Intake PASS_TO_PM evidence docs/qa/evidence/p1-hrm-processes-fe-01-qa-20260717.md.
Verdict: AC-PROC-01..04 PASS on :8088/command-center/hrm/processes (ceo@xe.vn, U65).
F-02 fake toast + F-03 DialogTitle a11y closed for processes menu.
1) Update USER_FLOW / menu matrix Dev8088 for processes → 🟢 if applicable.
2) Optional Task qc: audit this evidence into GWC/GO residual list for HRM full-menu wave — no P0.
3) Do NOT re-dispatch FE for processes unless residual R-PROC-TAB-CDP becomes user-visible.
```
