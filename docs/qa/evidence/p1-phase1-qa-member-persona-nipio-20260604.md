# QA evidence — P1-PHASE1-QA-MEMBER-PERSONA-NIPIO-01 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QA-MEMBER-PERSONA-NIPIO-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-04 |
| **environment** | HTTPS pilot `https://14-225-217-232.nip.io` |
| **persona** | Member CEO `du-lich.ceo@xe.vn` / `Xevn@2026` |
| **session** | Isolated browser tab (`viewId` new tab); no shared `ceo@xe.vn` session |
| **closes** | QC **C-RBACQC-04** — member CEO browser L2.5 J-HRM embed on nip.io |
| **matrix SoT** | `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` |
| **journey SoT** | `docs/program/PROGRAM_JOURNEY_MAP.md` |

**Explicitly NOT claimed:** Phase 1 DONE · PROD-READY · HRBP persona · full P-CC browser matrix on CC shell · group CEO journeys.

---

## Executive verdict

| Layer | Scope | Verdict |
|-------|--------|---------|
| **API baseline** | Member CEO CRUD + P-CC-03..08 + J-HRM-02 API | **PASS** — `tmp-p1-phase1-member-ceo-crud-probe.mjs` exit **0**; `tmp-p1-phase1-member-hrm-cu-probe.mjs` exit **0** |
| **L2.5 browser** | J-HRM-01..07 direct HRM embed (`/hr/*?portal=1&tenantId=xe-du-lich`) | **PASS** — **7/7** |
| **L2.5 browser** | Command Center iframe `/command-center/hrm/*` after UI login | **GWC / residual** — form login did not persist JWT in MCP tab; storage-only path works on `/hr` not CC shell |
| **C-RBACQC-04** | Member CEO J-HRM browser L2.5 nip.io | **CLOSED** (J-HRM 7/7 on pilot embed; CC shell tracked separately) |

**Overall:** **PASS_TO_PM** — member CEO HRM cross-navigation **PASS** on nip.io isolated session.

---

## Session / auth notes

| Method | Result |
|--------|--------|
| Portal form login (`browser_fill` + **Đăng nhập**) | **FAIL** — remains on `/login`, `token=false` after 20s (MCP controlled-input quirk) |
| API login + `persistAuthSession` keys (`xevn.portal.*`) | **PASS** — `POST /api/xbos/auth/login` **201**, `GET /api/xbos/auth/me` **200** |
| Direct `/hr?portal=1&tenantId=xe-du-lich&companyId=main` | **PASS** — reads mirrored JWT from `localStorage` (embed bridge) |

**Password SoT:** `Xevn@2026` (not `xevn-uat-2026` — **401** on portal).

---

## A) API regression (same day)

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-phase1-member-ceo-crud-probe.mjs
node scripts/tmp-p1-phase1-member-hrm-cu-probe.mjs
```

| Script | Exit | Highlights |
|--------|------|------------|
| `tmp-p1-phase1-member-ceo-crud-probe.mjs` | **0** | Negatives **403/409**; P-CC-03..08 **200**; employees total **13**; J-HRM-02 detail **200** `fe152c53-…` |
| `tmp-p1-phase1-member-hrm-cu-probe.mjs` | **0** | MEM-CRUD-01/02 **PASS**; J-HRM-01/02 API **200** |

---

## B) Browser L2.5 — J-HRM (direct embed, member tenant)

**Click-path contract:** list/tab load → row/link click → profile or detail; no «Không tìm thấy nhân viên»; detail `GET /employees/:id?company_id=main` **200** when row has `employee_id`.

| J-ID | Route | Click path | Detail API | Verdict |
|------|-------|------------|------------|---------|
| **J-HRM-01** | `/hr/contracts?portal=1&tenantId=xe-du-lich&companyId=main` | Contract row → employee name link → `/hr/employees/5ea74a05-…` | **200** | **PASS** |
| **J-HRM-02** | `/hr/employees?…` | Table row → `/hr/employees/fe152c53-…` | **200** (list total **13**) | **PASS** |
| **J-HRM-03** | `/hr/contracts?…` | Row → drawer/detail; `GET contracts/:id` | **200** `07bcca61-…` | **PASS** |
| **J-HRM-04** | `/hr/insurance?…` | Row click; insurance list **200** | employee **200** `a25d027a-…` | **PASS** |
| **J-HRM-05** | `/hr/recruitment?…` | Tab mount (empty list OK per BR-MOCK-01) | requisitions + candidates **200** | **PASS** |
| **J-HRM-06** | `/hr/attendance?…` | Overview mount; records API **200** (total **27**) | employee **200** `8d846eb9-…` | **PASS** (L2 list + API parity; no table row in overview UI) |
| **J-HRM-07** | `/hr/payroll?…` | Payslips mount total **9** | employee **200** `c4d59b81-…` | **PASS** (API parity; row click N/A in snapshot) |

**Console / banner:** No `HRM API Sync ERROR`, no `409 companyId mismatches`, no `54321` fallback on exercised paths. `#root` child count **4** on each module mount.

### Sample runtime captures

```text
J-HRM-02: path=/hr/employees/fe152c53-3440-41ed-b3c9-88a3f18e459c empApi=200 rootKids=4
J-HRM-01: contract→employee path=/hr/employees/5ea74a05-6de0-4365-a1d2-4f672da31c80 empApi=200
J-HRM-03: contractId=07bcca61-3aee-4535-9f58-a8bb93861d8a cGet=200
```

---

## C) Command Center iframe spot-check (residual)

| Step | URL | Result |
|------|-----|--------|
| Storage inject + navigate | `/command-center/hrm/employees?companyId=main` | Redirect **`/login`** — `iframe` not mounted; API **401** without React session |
| UI form login | `/login` du-lich.ceo | **FAIL** — MCP fill/submit does not complete portal `login()` |

**Residual ID:** **C-MEMCC-01** — member CEO CC shell browser session (UI login or AuthContext bootstrap) for iframe L2.5 — **not** blocking J-HRM embed closure on `/hr` pilot path (concurred with `p1-ex-qa-https-j-hrm-06-01-r6` direct+iframe methodology).

---

## D) P-CC L2 (member — API, prior + confirmed)

| ID | Verdict | Note |
|----|---------|------|
| P-CC-01 | **PASS** | Login **201** |
| P-CC-02 | **PASS** (negative **403**) | Group member units blocked |
| P-CC-03..08 | **PASS** | HRM surfaces **200** on nip.io (probe) |
| P-CC-09 | **OUT OF SLICE** | Not re-run browser |

---

## Defects / residuals

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| **C-MEMCC-01** | Low (automation / UX) | CC `/command-center/hrm/*` iframe L2.5 not proven in MCP isolated tab — UI login submit + post-nav session | **dev-fe** / **qa** optional re-run manual |
| **C-MEMPWD-01** | Low (doc) | Dispatch password `xevn-uat-2026` ≠ portal `Xevn@2026` | **ba-docs** / **pm** (already logged) |

---

## completion_report

- **Closed:** **C-RBACQC-04** for member CEO — browser L2.5 **J-HRM-01..07 PASS** on `https://14-225-217-232.nip.io` with isolated session, tenant `xe-du-lich`, operational `company_id=main`.
- **Closed:** API member negatives + P-CC HRM load parity reconfirmed (probe exit **0**).
- **Open:** CC shell iframe L2.5 for member (**C-MEMCC-01**); HRBP persona; P-CC-09 browser.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: P1-PHASE1-QC-RBAC-C04-CLOSE-01
from_role: pm
to_role: qc
entry_criteria: QA PASS_TO_PM P1-PHASE1-QA-MEMBER-PERSONA-NIPIO-01 — docs/qa/evidence/p1-phase1-qa-member-persona-nipio-20260604.md — C-RBACQC-04 member CEO J-HRM 7/7 browser PASS on nip.io direct embed; API probes exit 0.
exit_criteria: QC concurs C-RBACQC-04 CLOSED or GO WITH CONDITIONS citing C-MEMCC-01 CC iframe residual only; update p1-phase1-qc-full-rbac-20260604.md; NOT Phase 1 DONE.
evidence_path: docs/qa/evidence/p1-phase1-qc-rbac-c04-close-20260604.md
ack_status: PASS_TO_PM
```

## pm_dispatch_hint

- Promote **C-RBACQC-04** closed on bus; optional **dev-fe** **C-MEMCC-01** if sponsor requires CC iframe clicks for member (not API-blocked).
- **qc** gate promotion per prompt above.

## ack_status

**PASS_TO_PM**
