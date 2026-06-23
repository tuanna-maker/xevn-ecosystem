# P1-CC-DEPT-TPL-SCOPE-01 — U31 VPS redeploy retest (:8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-CC-DEPT-TPL-SCOPE-01-VPS-RET` |
| **Date** | 2026-06-06 |
| **Environment** | `http://14.225.217.232:8088` (authoritative SoT) |
| **Account** | `ceo@xe.vn` / `Xevn@2026` |
| **Prior evidence** | `docs/qa/evidence/p1-qa-u31-dept-infra-retest-20260606.md` (pre-redeploy FAIL) |
| **ack_status** | **PASS_TO_PM** — API pre-check PASS; **L2 browser FAIL** (portal Vite 500) |
| **Phase 1 / PROD** | **Not claimed** |

## Executive summary

DevOps redeploy **partially succeeded**: CEO JWT probe **PASS** (dept templates **2** rows, infra array PUT **200/XBOS-INFRA-201**, custom fields persist). **L2 browser retest FAIL** — Command Center SPA does not mount; Vite returns **HTTP 500** transforming `CommandCenterPage.tsx` because **`OrgGradeOrgChartEditor.tsx` is missing on VPS**. Login + redirect work; all settings UI cases blocked. **Not READY_FOR_QC** until portal tree sync + L2 re-run.

---

## Pre-check — CEO JWT probe (required)

```powershell
$env:PORTAL_DEV_URL='http://14.225.217.232:8088'
node scripts/tmp-p1-qa-u31-dept-infra-probe.mjs
```

**Exit code:** `0` — **VERDICT PASS**

| Check | Result |
|-------|--------|
| login ceo@xe.vn | PASS HTTP 201 |
| GET dept-system-templates | PASS HTTP 200 partition=holding **count=2** `[q@main, PB-ORG-XEVN-01@xevn]` |
| PUT infrastructure/settings (array payload) | PASS HTTP 200 `XBOS-INFRA-201` |
| GET infrastructure/settings | PASS foundationCategories count=1 |
| PUT customFieldDefsByEntity | PASS HTTP 200 |
| GET customFieldDefsByEntity.main persisted | PASS defs=1 |

**Note:** API layer U31 fixes are live on :8088. Probe alone is **insufficient** per U31 policy.

---

## L2 browser retest (MCP — mandatory)

### TC-L2-0 — Login → Command Center shell

| Step | Click path | Result |
|------|------------|--------|
| 1 | `GET /login` | PASS — form renders (Email, Mật khẩu, Đăng nhập) |
| 2 | Fill `ceo@xe.vn` / `Xevn@2026` → **Đăng nhập** | PASS — button → "Đang đăng nhập…", redirect `/command-center` |
| 3 | CC mount `#root` children > 0 | **FAIL** — `rootChildren=0`, `body.innerText` empty after 9s |
| 4 | Console | **FAIL** — `Failed to fetch dynamically imported module: …/CommandCenterPage.tsx` (×3) |

**CDP root cause (Vite transform):**

```
GET /src/pages/command-center/CommandCenterPage.tsx → HTTP 500
Failed to resolve import "../../components/org/OrgGradeOrgChartEditor"
from "src/pages/command-center/CommandCenterPage.tsx". Does the file exist?
```

Deep link `/command-center?settings=company_dept_system` shows Vite error overlay at `CommandCenterPage.tsx:87` (import `OrgGradeOrgChartEditor`).

Source tree has file: `apps/web/web-portal/src/components/org/OrgGradeOrgChartEditor.tsx` — **not synced to VPS portal mount**.

| Verdict | **FAIL** |

---

### TC-L2-1 — Settings → Phòng/Ban → tab **Danh mục khung**

| Step | Click path | Result |
|------|------------|--------|
| 1 | Login → Settings → Phòng/Ban | **BLOCKED** — CC SPA does not load |
| 2 | Tab **Danh mục khung** | N/A |
| 3 | Table ≥1 row + footer DB source count | N/A (API probe confirms **2 khung** if UI were reachable) |

| Verdict | **FAIL** (UI blocked; API would PASS) |

---

### TC-L2-2 — Infrastructure settings save (array payload, UI)

| Step | Click path | Result |
|------|------------|--------|
| 1 | Navigate `/command-center?settings=company_infrastructure` | **FAIL** — same Vite 500 / blank `#root` |
| 2 | Save with array payload → no 400, success feedback | N/A (API probe PUT **200**; browser save not executed) |

| Verdict | **FAIL** (UI blocked; API would PASS) |

---

### TC-L2-3 — Custom fields modal UX (optional)

| Step | Result |
|------|--------|
| Open custom fields modal | **FAIL** — settings UI unreachable |

| Verdict | **FAIL** (optional scope; blocked by TC-L2-0) |

---

## Verdict matrix

| Case | Layer | Verdict |
|------|-------|---------|
| Pre-check JWT probe | API | **PASS** |
| TC-L2-0 Login + CC shell | Browser | **FAIL** |
| TC-L2-1 Danh mục khung | Browser | **FAIL** |
| TC-L2-2 Infra save UI | Browser | **FAIL** |
| TC-L2-3 Custom fields UX | Browser | **FAIL** |
| **Overall U31 VPS retest** | L2 required | **FAIL** |

---

## Defects

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| **D-U31-PORTAL-SYNC-01** | P0 | VPS portal missing `OrgGradeOrgChartEditor.tsx` → Vite 500 on `CommandCenterPage.tsx` → CC blank | devops |
| **D-8088-CC-VITE-500-01** | P0 | Dynamic import `CommandCenterPage.tsx` fails; blocks all L2 settings UI on :8088 | devops → dev-fe if file exists but path wrong |

**Closed vs prior retest:**

| Prior (pre-redeploy) | This retest |
|----------------------|-------------|
| dept 0 items @ holding | **Fixed** — API 2 items |
| infra PUT 400 XBOS-VAL-001 | **Fixed** — API 200 XBOS-INFRA-201 |
| CC blank (missing `applyWorkflowInboxTaskDecision`) | **Partial** — export now present; new blocker = missing org chart editor file |

---

## completion_report

**Closed (API / xbos-api redeploy):**
- U31 dept partition merge and infra `@IsArray()` DTO verified on authoritative :8088 via CEO JWT probe (exit 0).
- Custom field defs persist via API.

**Not closed (L2 browser — gate requirement):**
- Command Center SPA does not render; Vite cannot compile `CommandCenterPage.tsx` without `OrgGradeOrgChartEditor`.
- All three mandatory L2 UI cases **FAIL**; cannot promote to QC on :8088.

---

## next_owner

**devops** — full portal tree sync on `:8088` (include `src/components/org/OrgGradeOrgChartEditor.tsx` + verify `CommandCenterPage.tsx` Vite transform HTTP 200); then **qa** re-run this evidence template.

---

## next_dispatch_prompt

```
work_item_id: P1-CC-DEPT-TPL-SCOPE-01-PORTAL-SYNC
from_role: pm
to_role: devops
entry_criteria: QA docs/qa/evidence/p1-qa-u31-vps-retest-20260606.md — API probe PASS but L2 FAIL; Vite 500 missing OrgGradeOrgChartEditor on :8088
exit_criteria: Sync full web-portal tree to VPS; GET http://14.225.217.232:8088/src/pages/command-center/CommandCenterPage.tsx returns 200 (not 500); browser login ceo@xe.vn → #root children > 0 at /command-center; re-smoke PORTAL_DEV_URL=http://14.225.217.232:8088 node scripts/tmp-p1-qa-u31-dept-infra-probe.mjs exit 0
evidence_path: docs/qa/evidence/p1-u31-portal-sync-smoke-20260606.md
ack_status: READY_FOR_QA
After deploy: dispatch QA work_item_id P1-CC-DEPT-TPL-SCOPE-01-VPS-RET L2 browser only (Danh mục khung + infra save UI); if all PASS → QC spot U31 scope checklist.
```

---

## evidence_path

`docs/qa/evidence/p1-qa-u31-vps-retest-20260606.md`
