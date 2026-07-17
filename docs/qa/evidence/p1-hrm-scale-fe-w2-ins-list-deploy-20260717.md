# P1-HRM-SCALE-FE-W2-INS-LIST-DEPLOY — portal-fe + hrm-fe on :8088

**work_item_id:** `P1-HRM-SCALE-FE-W2-INS-LIST-DEPLOY`  
**date:** 2026-07-17  
**owner:** devops  
**ack_status:** READY_FOR_QA  
**U65:** zero-seed (no seed used)  
**NOT claimed:** Phase 1 DONE / PROD-READY

**Source wave:** `P1-HRM-SCALE-FE-W2-INS-LIST` — `docs/qa/evidence/p1-hrm-scale-fe-w2-ins-list-20260717.md`  
**Closes residual (deploy path):** `COND-SCALE-W2-INS-LIST-FANOUT` FE code live on VPS for browser Network retest.

---

## Steps executed

| Step | Result |
|------|--------|
| Allow-list commit | `bf5067b` `fix(hrm): cap insurance list mount to page=1 (no page=1..11 fan-out)` — **6 files only** (`useInsuranceList.ts` + test, `Insurance.tsx`, `en.json`/`vi.json`, FE evidence). Unrelated dirty lanes left unstaged. |
| Push | `origin/main` `5fa030d..bf5067b` |
| VPS audit | `xevn-portal-fe-dev` :8088, `xevn-hrm-fe-dev` :8080 Up; non-xevn (ytexa/hsbx/asms/viconnec) left running. |
| `git pull origin main` | Fast-forward → HEAD `bf5067b78c7308562881cea88987525fed5c43c0` |
| Verify sources on VPS | `HRM_INSURANCE_MOUNT_MAX_PAGES` hits=4; `loadInsuranceListNextPage` hits=2; page `loadMore` hits=3; `cappedHint` in vi.json hits=1 |
| Live Vite modules | `:8080/hr/src/hooks/useInsuranceList.ts` has `HRM_INSURANCE_MOUNT_MAX_PAGES` (3); `Insurance.tsx` has `loadMore` (3) |
| merge-vps-port-env | keep 8088/8080/5173/3001/28002 |
| Recreate | `docker compose --env-file .env up -d --build --no-deps --force-recreate portal-fe hrm-fe` → RECREATE_RC=0 |

**VPS HEAD after deploy:** `bf5067b` (`bf5067b78c7308562881cea88987525fed5c43c0`)  
**Compose:** `/opt/xevn-ecosystem/deploy/xevn-ecosystem`  
**Not touched:** `hrm-be`, `xbos-be`, `xbos-fe`; no `docker compose down`; no seed.

---

## Vite prebundle guard (no react-dom 504 recur)

| Probe | HTTP | Notes |
|-------|------|-------|
| `http://127.0.0.1:8080/hr/node_modules/.vite/deps/react-dom.js` | **200** | `Content-Type: text/javascript` |
| `http://127.0.0.1:8088/hr/node_modules/.vite/deps/react-dom.js` | **200** | portal proxy |
| `http://14.225.217.232:8080/hr/node_modules/.vite/deps/react-dom.js` | **200** | external |
| `http://14.225.217.232:8088/hr/node_modules/.vite/deps/react-dom.js` | **200** | external |
| HRM `#root` mount | **PASS** | HTML has `id="root"`; browser CDP `rootLen=9966` on `/hr/login` (SPA auth redirect from `/hr/insurance` — React mounted, not blank shell) |
| Vite log | ready | `VITE v5.4.21 ready in 524 ms` — no ENOENT optimize abort observed this recreate |

---

## L0 smoke (PASS)

### On-VPS (127.0.0.1)

| Probe | HTTP |
|-------|------|
| `http://127.0.0.1:8088/` | **200** |
| `http://127.0.0.1:8088/command-center` | **200** |
| `http://127.0.0.1:8088/command-center/hrm/insurance` | **200** |
| `http://127.0.0.1:8080/hr/` | **200** |

### External (from devops workstation)

| Probe | HTTP |
|-------|------|
| `http://14.225.217.232:8088/` | **200** |
| `http://14.225.217.232:8088/command-center` | **200** |
| `http://14.225.217.232:8088/command-center/hrm/insurance` | **200** |

Containers after recreate: `xevn-portal-fe-dev` / `xevn-hrm-fe-dev` Up (~1–2 min at smoke time).

---

## Gate table (deploy slice)

| Gate | Verdict |
|------|---------|
| Allow-list commit/push (no unrelated scoop) | PASS |
| VPS pull includes INS-LIST FE | PASS (`bf5067b`) |
| portal-fe + hrm-fe recreated (`--no-deps --force-recreate`) | PASS |
| `:8088/command-center/hrm/insurance` 200 | PASS |
| `react-dom.js` 200 + `#root` mounts | PASS |
| New FE sources live | PASS |
| Non-xevn undisturbed | PASS |
| Seed used | **none** (U65) |
| Phase 1 / PROD claim | **none** |

---

## Residual

- Browser Network checklist (insurance mount GET `page=1` ≤1–2; **0** auto `page=2..11`; **Tải thêm** → +1 `page=2`; honest API total; W2 picker / ATT-NAV / J-HRM-02 smoke) = **QA** — not claimed by DevOps L0.

---

## Handoff

- `completion_report:` Allow-list INS-LIST FE committed+pushed (`bf5067b`); VPS pulled same HEAD; portal-fe + hrm-fe force-recreated; `:8088/.../hrm/insurance` **200**; `react-dom.js` **200**; `#root` mounts. READY_FOR_QA browser Network retest.
- `next_owner:` qa
- `ack_status:` READY_FOR_QA
- `evidence_path:` `docs/qa/evidence/p1-hrm-scale-fe-w2-ins-list-deploy-20260717.md`

### next_dispatch_prompt

```text
work_item_id: P1-HRM-SCALE-FE-W2-INS-LIST-QA
from_role: pm
to_role: qa
subagent_type: qa

entry_criteria: VPS HEAD bf5067b; portal-fe+hrm-fe live; U65 zero-seed; evidence docs/qa/evidence/p1-hrm-scale-fe-w2-ins-list-deploy-20260717.md
persona: ceo@xe.vn / Xevn@2026
URL: http://14.225.217.232:8088/command-center/hrm/insurance

AC (browser Network, iframe /hr/insurance):
1. Mount GET …/contracts-insurance/insurance?…page=1&page_size=100 ≤1–2; 0 auto page=2..11
2. Chip «Tất cả» = API total (honest); if capped → hint + «Tải thêm»
3. Click Tải thêm → +1 GET page=2; rows append
4. Regression smoke: W2 insurance picker typeahead; ATT-NAV soft-nav leave Attendance; J-HRM-02 Employees T-FANOUT

cấm: seed · API-only PASS · Phase1/PROD claim
evidence_path: docs/qa/evidence/p1-hrm-scale-fe-w2-ins-list-qa-20260717.md
exit: PASS_TO_PM or FAIL with residual
```
