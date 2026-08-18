# QA-PCOMP-W6-PREP-01 — W6 prep browser smoke (post tenant-master reset)

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-PCOMP-W6-PREP-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **W6 readiness** | **READY** |
| **Host** | `http://127.0.0.1:5173` (LOCAL only) |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · JWT `company_id=main` |
| **Reset upstream** | `docs/qa/evidence/d-dev-reset-tenant-master-01-20260730.md` |
| **Locks** | **U65** zero-seed · **HOLD_DEPLOY** · NOT `:8088` · NOT Phase1/PROD |

---

## 0. Verdict

| Gate | Result |
|------|--------|
| L0 `qc:dev-stack` probes | **PASS** — hrm/xbos/portal HTTP **200** (UV abort on Windows exit — known noise) |
| L0 `pnpm run qc:fe-be-health` | **PASS** exit **0** — ALL PASS |
| Login portal 2xx | **PASS** — `POST /api/xbos/auth/login` → **201** |
| No `ECONNREFUSED :28002` | **PASS** — 0 failed `/api/xbos/*` in browser session |
| Command Center load | **PASS** — no ERROR banner / no 409 scope / no 54321 |
| HRM embed tabs (P-CC-03..08 + company) | **PASS** — all load; empty lists valid post-reset |
| Post-reset baseline `employees.total` | **0** (expected) |
| J-HRM-01..07 list→detail | **BLOCKED_NO_DATA** — valid; sponsor creates from FE (U65) |
| J org-foundation spot | **PASS** — `legal-entities` 200 on company tab; GMU API 200 |
| **Sponsor may start W6 FE re-test** | **YES** |
| Phase1 / PROD / sponsor UAT-PASS | **NOT claimed** |

---

## 1. L0 (QA window ~16:58 UTC+7)

| Probe | Result |
|-------|--------|
| `GET :28001/api/hrm` | **200** |
| `GET :28002/api/xbos` | **200** |
| `GET :5173` | **200** |
| `pnpm run qc:fe-be-health` | exit **0** — login + employees/catalog direct + portal proxy |

**Seed:** not run (U65).

---

## 2. Post-reset data baseline

| API | HTTP | Notes |
|-----|------|-------|
| `GET /api/hrm/employees?company_id=main&page_size=5` | **200** | `total=0` · `HRM-EMP-200` |
| `GET /api/hrm/employees/summary?company_id=main` | **200** | `total=0` · headcount cards expect 0 |
| `GET /api/hrm/contracts-insurance/contracts?company_id=main` | **200** | `total=0` |
| `GET /api/xbos/org-foundation/legal-entities` | **200** | org-foundation kept (5 LE per reset evidence) |
| `GET /api/xbos/tenant-scope/group-member-units` | **200** | holding + member units present |

Empty HRM transactional menus = **valid empty**, not FAIL (U65 post-reset).

---

## 3. Browser smoke (Puppeteer)

**Script:** `scripts/qa/qa-pcomp-w6-prep-01-browser.mjs`  
**Runtime:** `docs/qa/evidence/_tmp-qa-pcomp-w6-prep-01-runtime.json`  
**Screens:** `docs/qa/evidence/screens/qa-pcomp-w6-prep-01/`

| Step | Result |
|------|--------|
| Login API inject → `/command-center` | **PASS** — final URL CC; `banner=false` |
| P-CC-03 employees | **PASS** — no Sync ERROR |
| P-CC-04 contracts | **PASS** |
| P-CC-05 insurance | **PASS** — UI no banner (see §5 transient 500) |
| P-CC-06 recruitment | **PASS** — all recruitment lists `total=0` |
| P-CC-07 attendance | **PASS** — overview 200 |
| P-CC-08 payroll | **PASS** — payslips `total=0` |
| P-CC-CO company | **PASS** — summary `total=0`; legal-entities 200 |
| Settings GMU route | **SKIP** — DOM table empty; API has data (route/UI mismatch P3) |

**Network summary (browser session):**

| Metric | Value |
|--------|-------|
| `ECONNREFUSED` / failed `:28002` | **0** |
| HTTP **409** scope | **0** |
| `/api/xbos/*` on CC load | all **2xx** |

---

## 4. J-* spot (L2.5 prep scope)

| J-ID | Status | Notes |
|------|--------|-------|
| J-CC-01 | ✅ | login → CC |
| J-HRM-CO-01 | ✅ EMPTY_VALID | headcount 0 matches reset |
| J-HRM-01..07 | 🟡 BLOCKED_NO_DATA | no employee/contract rows; sponsor FE mutate first |
| J-CC-02 / shareholders | ⬜ | shareholders wiped (`total=0`); create-from-FE in W6 |
| Org-foundation | ✅ | `legal-entities` + `group-member-units` API 200 |

---

## 5. Residual

| ID | Sev | Note |
|----|-----|------|
| **DEF-W6-INS-POL-500-RACE** | **P3** | First browser hit `GET …/insurance-policies` → **500** `HRM-SYS-001` constraint `chk_contract_date_range` already exists; **immediate retry 200**; 3× probe post-run all **200**. No UI banner. Dispatch `dev-be` if reproduces after HRM restart. |
| **P3-SETTINGS-GMU-UI** | P3 | `/command-center/settings/group-member-units` DOM empty while API returns members — sponsor may use Settings → Tổ chức path instead |
| **J-HRM L2.5 mutate** | expected | Blocked until sponsor creates NV/HĐ from FE (U65) |
| `qc:dev-stack` UV abort | noise | Trust probes + fe-be-health |

---

## 6. Locks honored

| Lock | Status |
|------|--------|
| U65 zero-seed | **Honored** |
| HOLD_DEPLOY | **Honored** |
| LOCAL `:5173` only | **Honored** |
| NOT Phase1 DONE / PROD | **Honored** |

---

## 7. Sponsor handoff

| Question | Answer |
|----------|--------|
| **W6 FE re-test ready?** | **YES (READY)** |
| Portal URL | `http://127.0.0.1:5173` |
| Account | `ceo@xe.vn` / `Xevn@2026` |
| Expectation | Empty HRM lists first; create data only via FE clicks (U65) |
| Org-foundation | XBOS legal entities / org units available for settings navigation |
