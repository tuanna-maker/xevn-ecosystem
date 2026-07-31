# QA-REC-13-S2-SUBMIT-INBOX-RET-01 — Retest S2 «Gửi duyệt QT» → Inbox

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-REC-13-S2-SUBMIT-INBOX-RET-01` |
| **program** | `P-REC-E2E-13STEP-01` · U65 + **U76 HDSD-align** |
| **from_role** | pm → **qa** |
| **date** | 2026-08-01 (runtime UTC 2026-07-31) |
| **prior** | `D-REC-13-S2-SUBMIT-INBOX-01` READY_FOR_QA · `docs/qa/evidence/d-rec-13-s2-submit-inbox-01-20260801.md` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **hdsd_align** | **true** · SoT `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH07_HRM_TUYEN_DUNG.md` §3 |
| **ack_status** | **FAIL_TO_PM** |
| **seed** | **none** (U65) |
| **harness** | `scripts/qa/qa-rec-13-s2-submit-inbox-ret-01-browser.mjs` |
| **runtime** | `docs/qa/evidence/_tmp-qa-rec-13-s2-submit-inbox-ret-01-runtime.json` |
| **screens** | `docs/qa/evidence/screens/qa-rec-13-s2-submit-inbox-ret-01-20260801/` |

---

## Verdict (executive)

**FAIL_TO_PM** — cannot observe create / «Gửi duyệt QT» / submit-workflow / Inbox on live FE.

| Layer | Result |
|-------|--------|
| L0 portal `:8088` | **200** |
| L0 HRM API via `:8088` (auth) | **list requisitions 200** (API healthy) |
| FE `/hr/recruitment?tab=requisitions` | **white screen** — Vite module graph FAIL |
| UF-HRM-12 create POST 201 (this wave) | **not observed** (page never mounts) |
| CTA «Gửi duyệt QT» / testids | **not observable** |
| POST `…/submit-workflow` 2xx | **none** |
| Inbox recruitment task | **not reached** |
| Full 13-step DONE | **not claimed** |
| Historic UF-HRM-12 / J-REC-WF greens | **not demoted** (env blocker — prior wave had POST **201** id `8571bd03-…`) |

---

## Root cause (blocker — FE compile/encoding)

Vite transform of `@/lib/labelMaps` fails on **both** envs:

```text
Failed / Unexpected character ''
labelMaps.ts:1 — file is UTF-16 LE (BOM FF FE) with NUL bytes between ASCII
```

| Env | `JobRequisitionsTab.tsx` | `labelMaps.ts` |
|-----|--------------------------|----------------|
| `http://14.225.217.232:8088` | 200 (source) | **500** parse UTF-16 |
| `http://127.0.0.1:5173` | 200 (source) | **500** parse UTF-16 |

`git show HEAD:apps/web/hrm/src/lib/labelMaps.ts` blob is also **UTF-16 LE** (commit `b39ed2d` «restore labelMaps» shipped bad encoding). Browser console: React crash under `PermissionRoute` / Lazy recruitment → blank white screens (`02-req-tab.png`, `04-create-dialog.png`, …).

**Secondary (local only):** `pnpm run dev:hrm-api` fails (`ensure-dist.mjs` missing); `node dist/main.js` fails `LeaveWorkflowBridge` DI — local API not usable. VPS API OK → primary blocker is FE `labelMaps` encoding, not BE for this wave.

---

## Env note (U65 prefer :8088)

| Target | Used | Note |
|--------|------|------|
| Prefer `:8088` | **Yes first** | CTA / tab unreachable — Vite 500 on `labelMaps` |
| Fallback `:5173` | Attempted | Same `labelMaps` UTF-16 blocker; local HRM API down |

DO-REC-13-S2-SUBMIT-DEPLOY-01 CTA wire **cannot be validated** until encoding fixed + FE redeployed.

---

## HDSD coverage (U76) — screen/button inventory this wave

SoT: `HDSD_XEVN_CH07_HRM_TUYEN_DUNG.md` §3 Tab **Yêu cầu tuyển dụng**.

| HDSD item | Label / control | Click path attempted | Verdict | Note |
|-----------|-----------------|----------------------|---------|------|
| Menu **Tuyển dụng** | Nav / `/hr/recruitment` | deep-link + nav | 🟡 | Route hit; shell may load; tab content crash |
| Tab **Yêu cầu tuyển dụng** | HDSD §3 | `?tab=requisitions` | 🔴 | White screen — module fail |
| **Thêm yêu cầu** / Tạo yêu cầu | HDSD §3 | `hdsd-requisition-create-btn` | 🔴 | Control not reachable |
| Form Lưu → POST create | UF-HRM-12 | — | 🔴 | No POST this wave |
| **Gửi duyệt QT** | HDSD troubleshooting / J-REC-WF-02 | `hdsd-requisition-submit-wf` · `hdsd-requisition-post-create-submit` | 🔴 | CTA not in DOM |
| Inbox after submit | J-REC-WF-03 | `/command-center/inbox` | ⬜ | Not earned (no submit) |

---

## Steps attempted (browser-only)

1. Login API `ceo@xe.vn` → inject portal token · `portal=1` · `companyId=main`
2. `/hr/recruitment?tab=requisitions` (HDSD: Tuyển dụng → Yêu cầu tuyển dụng)
3. Create YCTD / Gửi duyệt QT — **blocked** (blank page)
4. Fallback local `:5173` — **same blocker**
5. No `pnpm seed:*` · no inbox seed · no DB fake

### Network (this wave)

- Create `POST /requisitions` — **none**
- `POST …/submit-workflow` — **none**
- Prior historic (not re-proven): create **201** id `8571bd03-…` · submit **not observed** (`qa-rec-e2e-13step-01-20260801.md`)

---

## Residuals (for PM)

| ID | Owner | Priority | Action |
|----|-------|----------|--------|
| **D-REC-13-S2-LABELMAPS-UTF8-01** | **dev-fe** | **P0** | Re-save / rewrite `apps/web/hrm/src/lib/labelMaps.ts` as **UTF-8** (no UTF-16 BOM); verify Vite `GET /hr/src/lib/labelMaps.ts` → **200** transform; keep exports used by `JobRequisitionsTab` |
| **DO-REC-13-S2-SUBMIT-DEPLOY-01** (re-run) | **devops** | **P0** | After UTF-8 fix: deploy HRM FE to `:8088`; smoke Vite module + tab **Yêu cầu tuyển dụng** mounts |
| **QA-REC-13-S2-SUBMIT-INBOX-RET-01** (retest) | **qa** | **P0** | Same AC: create 201+F5 → click «Gửi duyệt QT» → submit-workflow 2xx → Inbox (no seed) OR FE PASS + BE residual `D-REC-13-S2-SUBMIT-INBOX-BE-01` |
| Local hrm-api bootstrap | devops/dev-be | P2 | `ensure-dist.mjs` missing · `LeaveWorkflowBridge` DI — optional for :8088 path |

**Cấm:** seed inbox · claim 13-step DONE · demote UF-HRM-12 / J-REC-WF without regression after FE healthy.

---

## Handoff contract

### completion_report

Closed: U65 browser attempt on `:8088` + fallback `:5173`; U76 HDSD inventory for Tuyển dụng / YCTD / Gửi duyệt QT; harness + screens + runtime JSON; root-caused white screen to **`labelMaps.ts` UTF-16 LE** (git + VPS); VPS HRM API still lists requisitions; no seed; historic UF-HRM-12 not demoted.

Open: S2 FE wire («Gửi duyệt QT» → submit-workflow → Inbox) **not verifiable** until UTF-8 fix + redeploy.

### next_owner

**dev-fe** (P0 encoding) → **devops** redeploy → **qa** retest same `work_item_id`

### ack_status

**FAIL_TO_PM**

### evidence_path

`docs/qa/evidence/qa-rec-13-s2-submit-inbox-ret-01-20260801.md`

### next_dispatch_prompt

```text
work_item_id: D-REC-13-S2-LABELMAPS-UTF8-01
from_role: pm | to_role: dev-fe
priority: P0
program: P-REC-E2E-13STEP-01
entry_criteria: QA-REC-13-S2-SUBMIT-INBOX-RET-01 FAIL_TO_PM · docs/qa/evidence/qa-rec-13-s2-submit-inbox-ret-01-20260801.md
task: Rewrite apps/web/hrm/src/lib/labelMaps.ts as UTF-8 (remove UTF-16 LE BOM FF FE). Verify local Vite GET /hr/src/lib/labelMaps.ts returns 200 (no "Unexpected character"). Confirm JobRequisitionsTab mounts on /hr/recruitment?tab=requisitions. Do not demote UF-HRM-12. Preserve Gửi duyệt QT wire from D-REC-13-S2-SUBMIT-INBOX-01.
exit_criteria: READY_FOR_QA evidence path; then PM → devops redeploy :8088 → Task QA-REC-13-S2-SUBMIT-INBOX-RET-01 retest (create 201 + Gửi duyệt QT + submit-workflow 2xx + Inbox U65).
cấm: seed:* · inbox seed · claim 13-step DONE
```
