# QA-HDSD-MUTATE-RET-01 — HDSD mutate retest (BE + FE wave)

| Field | Value |
|-------|--------|
| **Date** | 2026-07-30 |
| **Role** | qa |
| **work_item_id** | `QA-HDSD-MUTATE-RET-01` |
| **Program** | `P-HDSD-QA-SRS-01` |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Env** | portal `http://127.0.0.1:5173` · hrm-api `:28001` (fresh `dist/` build) · xbos `:28002` |
| **Policy** | U65 zero-seed · browser mutate only · no manual catalog pull |

---

## 1. Entry / L0

| Gate | Result |
|------|--------|
| hrm-api restart (D-HDSD-MUTATE-BE-01 build) | QA started `node dist/main.js` `HRM_BE_PORT=28001` from post-`pnpm --filter hrm-api build` |
| `node scripts/qc-dev-stack.mjs` | **exit 0** — hrm/xbos/portal 200 |
| `node scripts/qc-fe-be-api-health.mjs` | **exit 0** — ALL PASS (direct + proxy employees/catalog) |

**Note:** Portal `:5173` required manual vite restart mid-session (prior process hung); hrm-api showed transient down after long Puppeteer run — insurance re-probe OK when listener recovered.

---

## 2. P0 exit criteria (BE residuals)

### TC-HDSD-08-02-01 / UF-HRM-09 — Leave POST LVT_01

**Verdict: 🟢 PASS**

| Step | Evidence |
|------|----------|
| Login → `/hr/attendance` (portal embed) → Nghỉ phép → Tạo yêu cầu nghỉ | `scripts/qa/qa-hrm-leave-req-create-01.mjs` with `HRM_FE_URL=http://127.0.0.1:5173` |
| Pick employee PORTAL-GCEO · leave type **LVT_01** · Gửi yêu cầu | Network **POST `/api/hrm/attendance/leave-requests` → 201** |
| Response | `HRM-LEAVE-201` · id `4c716e4c-0555-4c04-aceb-61b943f6730e` |
| Catalog | L1 `leave_types` count=4 (LVT_01…04) — **no manual pull** in test script |
| F5 / list tab | Switched to «Danh sách yêu cầu» PASS (API list verify interrupted by hrm-api blip) |

Runtime: `docs/qa/evidence/_tmp-qa-hrm-leave-req-create-01-runtime.json`

**Mutate harness note:** `qa-hdsd-mutate-ret-01-browser.mjs` leave block returned `no-post` (automation gap — employee combobox pick); **does not downgrade** dedicated UF-HRM-09 evidence above.

### TC-HDSD-06-03-01 / UF-HRM-06 — Insurance stable 200

**Verdict: 🟢 PASS**

| Probe | Result |
|-------|--------|
| `GET /api/hrm/contracts-insurance/insurance?company_id=main` ×3 (authenticated) | **200 / 200 / 200** · `HRM-CON-200` |
| `chk_contract_date_range` console / 500 | **none** on insurance list path |

Script: `scripts/qa/_tmp-insurance-probe-3x.mjs` (exit 0)

**Browser note:** Mutate harness on `/hr/insurance` logged mixed **404** on non-list routes (e.g. detail stubs) alongside **200** on list — scored 🟡 in harness; **L1 insurance list criterion satisfied** by 3× API probe.

---

## 3. FE mutate wave (`qa-hdsd-mutate-ret-01-browser.mjs`)

Runtime: `docs/qa/evidence/_tmp-qa-hdsd-mutate-ret-01-runtime.json`  
Screens: `docs/qa/evidence/screens/hdsd-mutate-ret-20260730/`

| TC | UF | Verdict | Detail |
|----|-----|---------|--------|
| TC-HDSD-03-02-01 | UF-XBOS-05 | 🔴 | Shareholder row add/save automation — no POST (holding edit UI; save btn not found) |
| TC-HDSD-04-02-01 | UF-XBOS-10 | 🟢 | `?settings=workflow_designer` loads workflow text · net 200 |
| TC-HDSD-05-03-01 | UF-HRM-02 | 🟢 | **POST employees 201** · F5 name search soft |
| TC-HDSD-06-02-01 | UF-HRM-05 | 🟡 | Dialog opens · **no POST** (validation/catalog prefill) |
| TC-HDSD-07-02-01 | UF-HRM-07 | 🟡 | Form opens · **no POST** (JD template U65 — expected soft) |
| TC-HDSD-10-04-01 | UF-HRM-MENU | 🟢 | `/hr/internal_services` → `/internal-services` · no console 404 |
| TC-HDSD-06-03-01 | UF-HRM-06 | 🟡* | Harness mixed 404+200 — **promoted 🟢 via L1 probe §2** |
| TC-HDSD-08-02-01 | UF-HRM-09 | 🔴* | Harness no-post — **promoted 🟢 via §2 dedicated leave run** |

**Summary (harness only):** 3🟢 · 3🟡 · 2🔴  
**Summary (with P0 promotions):** **5🟢 · 2🟡 · 1🔴**

---

## 4. Residual / not promoted

| ID | Owner | Note |
|----|-------|------|
| R-QA-SHR-AUTO-01 | dev-fe / qa | TC-HDSD-03-02-01 Puppeteer cannot locate shareholder input row / Lưu cổ đông — manual UI may work |
| R-QA-HD-CREATE-01 | dev-fe | TC-HDSD-06-02-01 contract create dialog — no POST without employee/type selection |
| R-QA-YCTD-JD-U65 | policy | TC-HDSD-07-02-01 blocked by empty JD catalog — U65 no seed |
| R-OPS-HRM-STABILITY | devops | hrm-api intermittent down after long browser sessions; needs D-OPS-HRM-API-RESTART-01 hardening |

---

## 5. Handoff

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `pm`
- **evidence_path:** `docs/qa/evidence/qa-hdsd-mutate-ret-01-20260730.md`

### completion_report

**Closed:** P0 BE residuals R-HDSD-W2-02 (leave **POST 201** LVT_01, lazy catalog path) and R-HDSD-W2-03 (insurance list **3×200**, no constraint 500). FE wave partial: employee create **201**, workflow deep link, internal_services redirect **PASS**. L0 **PASS**.

**Open:** Shareholder mutate automation 🔴; contract/YCTD 🟡 U65; hrm-api stability under sustained Puppeteer; consolidate leave steps into mutate harness.

### next_dispatch_prompt

```
work_item_id: PM-HDSD-MUTATE-CLOSE-01
from_role: qa | to_role: pm
entry_criteria: docs/qa/evidence/qa-hdsd-mutate-ret-01-20260730.md PASS_TO_PM — P0 leave+insurance closed
exit_criteria: Update HDSD matrix TC-HDSD-08-02-01 + 06-03-01 to 🟢; dispatch dev-fe R-QA-SHR-AUTO-01 if sponsor wants UF-XBOS-05 mutate; optional qc spot on insurance browser tab
residual: shareholder harness · contract create · YCTD JD U65 · hrm-api restart SLO
ack_status: PASS_TO_USER summary
```
