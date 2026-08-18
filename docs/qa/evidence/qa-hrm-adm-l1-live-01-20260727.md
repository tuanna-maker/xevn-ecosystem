# QA-HRM-ADM-L1-LIVE-01 — Close Info L1-live wires (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-ADM-L1-LIVE-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution · L1-live · U65 zero-seed · HOLD_DEPLOY |
| **date** | `2026-07-27` (ICT) |
| **entry** | `DO-HRM-L0-STACK-01` PASS — L0 up (`:28001` / `:28002` / `:5173`) · evidence `do-hrm-l0-stack-01-20260727.md` |
| **spec_ref** | `docs/hrm/API_DESIGN_HRM_ADMIN.md` §D · Errors · Policy lock G-ADM-SCOPE-01 Option A |
| **prior_qc** | `qc-hrm-adm-audit-01` · `qc-hrm-adm-05-01` · `qc-hrm-adm-scope-01` (GWC; L1-live Info deferred ENV) |
| **ack_status** | **PASS_TO_PM** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** · NOT `:8088` |
| **deploy** | **HOLD_DEPLOY** |

---

## 1. Scope / cấm

| In | Out |
|----|-----|
| Live HTTP **404** missing UUID → `HRM-ERR-USER-NOT-FOUND` (not ECONNREFUSED) | Invent user / seed |
| Live **401**/`HRM-AUTH-001` unauth + **403**/`HRM-AUTH-002` non-platform | Invent admin membership mutate for fake PASS |
| Honest skip of privileged reset mutate (audit INSERT) when password-break risk | Claim **G-ADM-01-READ** GET list DONE |
| Clear ENV Info for 404 + scope wires | Deploy `:8088` · Phase1/PROD · reopen CLOSED G-ADM without FAIL |

---

## 2. Environment (L0 recheck)

| Probe | Result |
|-------|--------|
| `GET http://127.0.0.1:28001/api/hrm` | **200** |
| `GET http://127.0.0.1:28002/api/xbos` | **200** |
| `GET http://127.0.0.1:5173/` | **200** |
| Seed | **none** (U65) |
| Workspace | `C:\xevn-ecosystem` |

---

## 3. Auth personas (JWT payload only — tokens redacted)

| Account | `roleCode` | `companyId` | Used for |
|---------|------------|-------------|----------|
| `ceo@xe.vn` / `Xevn@2026` | `group_ceo` | `main` | Platform path — missing-UUID **404** only |
| `du-lich.ceo@xe.vn` / `Xevn@2026` | `subsidiary_ceo` | `main` | Non-platform — **403** gate only |

Login: `POST http://127.0.0.1:28002/api/xbos/auth/login` → nested `data.accessToken`.

---

## 4. AC / wire matrix (L1-live)

### Wire A — L1-live-404-wire (G-ADM-05 Info)

| Step | Request | HTTP | Code | Verdict |
|------|---------|------|------|---------|
| Missing profile UUID | `POST /api/hrm/admin/reset-user-password` · Bearer **group_ceo** · body `user_id=00000000-0000-4000-8000-000000000099` · `new_password=TempSafe404Probe!` | **404** | **`HRM-ERR-USER-NOT-FOUND`** · message `User not found` | **PASS** |
| Contrast prior ENV | Was ECONNREFUSED / SKIPPED when stack DOWN | — | — | **cleared** (live product wire observed) |

**Notes:** UUID is synthetic non-existent — **no** invent user. Gate reached past auth (not 401). No silent 2xx. Aligns API_DESIGN §D step 8 / Errors.

### Wire B — L1-live-scope-wire (G-ADM-SCOPE-01 Info)

| Step | Request | HTTP | Code | Verdict |
|------|---------|------|------|---------|
| No Bearer reset | `POST …/reset-user-password` | **401** | **`HRM-AUTH-001`** | **PASS** |
| No Bearer company-admin | `POST …/company-admin` | **401** | **`HRM-AUTH-001`** | **PASS** |
| Member JWT → company-admin | Bearer `subsidiary_ceo` · probe body (gate-only) | **403** | **`HRM-AUTH-002`** | **PASS** |
| Member JWT → reset | Bearer `subsidiary_ceo` · same missing UUID body | **403** | **`HRM-AUTH-002`** | **PASS** |
| Platform success mutate (AC-02 invent) | — | — | — | **SKIPPED** — U65 · no invent membership / credential write |

**Notes:** Fail = **403** not **409**. No `resolveHrmListScope` exercised. Option A platform-only honored on live wire.

### Wire C — L1-live-audit-row (G-ADM-01 write Info)

| Step | Result | Verdict |
|------|--------|---------|
| Privileged reset on **existing** persona to observe `admin_audit_logs` INSERT | **SKIPPED** — would mutate live password; risk leaving broken credential; U65 prefers no invent mutate; exit criteria allow skip | **Info remain OPEN** (honest) |
| Unit/contract audit write | Prior QA/QC already **CLOSED** G-ADM-01 write (`qa-hrm-adm-audit-01` · `qc-hrm-adm-audit-01`) | must_keep — **not reopened** |

**Primary PASS for this WI** = read-only / 404 / 401 / 403 wires (A+B). Audit live row is optional residual, **not** product FAIL.

### Anti-goals

| Claim | Status |
|-------|--------|
| **G-ADM-01-READ** GET `/admin/audit*` DONE | **NOT claimed** (Info OPEN) |
| Seed / invent admin membership | **NOT done** |
| Reopen G-ADM-01 / G-ADM-05 / G-ADM-SCOPE-01 | **NOT done** — CLOSED product gates stay CLOSED |
| Phase1 / PROD / `:8088` | **NOT claimed** |

---

## 5. Command / probe table (redacted)

```text
GET :28001/api/hrm → 200
GET :28002/api/xbos → 200
GET :5173/ → 200

POST /api/hrm/admin/reset-user-password (no Bearer) → 401 HRM-AUTH-001
POST /api/hrm/admin/company-admin (no Bearer) → 401 HRM-AUTH-001

POST /api/xbos/auth/login ceo@xe.vn → 200 (group_ceo / main)
POST /api/xbos/auth/login du-lich.ceo@xe.vn → 200 (subsidiary_ceo)

POST /api/hrm/admin/reset-user-password (group_ceo + missing UUID)
  → 404 HRM-ERR-USER-NOT-FOUND

POST /api/hrm/admin/company-admin (subsidiary_ceo)
  → 403 HRM-AUTH-002
POST /api/hrm/admin/reset-user-password (subsidiary_ceo)
  → 403 HRM-AUTH-002

Audit INSERT live mutate → SKIPPED (U65 risk honesty)
```

---

## 6. Classification (ENV vs PRODUCT)

| Signal | Type | Finding |
|--------|------|---------|
| Live 404 `HRM-ERR-USER-NOT-FOUND` | PRODUCT wire (was ENV Info) | **PASS** — **L1-live-404-wire CLEARED** |
| Live 401/403 privilege | PRODUCT wire (was ENV Info) | **PASS** — **L1-live-scope-wire CLEARED** |
| Live audit INSERT row | ENV/ops optional | **SKIPPED** — **L1-live-audit-row remains Info** |
| G-ADM-01 / 05 / SCOPE-01 CLOSED units | PRODUCT (prior) | **unchanged** — no reopen |
| G-ADM-01-READ | Info non-goal | **OPEN** — not invented |

---

## 7. Residual

| ID | Severity | Status | Owner |
|----|----------|--------|-------|
| ~~**L1-live-404-wire**~~ | Info | **CLEARED** this QA | — |
| ~~**L1-live-scope-wire**~~ | Info | **CLEARED** this QA | — |
| **L1-live-audit-row** | Info | **OPEN** (skipped mutate) | optional later browser UF with safe restore — **not** reopen G-ADM-01 |
| **G-ADM-01-READ** | Info | OPEN | `dev-be` optional — **cấm** invent DONE |
| Option B membership admin | HOLD | OPEN | Sponsor CR only |
| Phase1 / PROD / `:8088` | — | **NOT claimed** | HOLD_DEPLOY |

---

## 8. Verdict

**PASS** (L1-live primary wires)

- Missing UUID reset over live `:28001` → **404** `HRM-ERR-USER-NOT-FOUND` (not ECONNREFUSED).
- Unauth → **401** `HRM-AUTH-001`; non-platform `subsidiary_ceo` → **403** `HRM-AUTH-002` on company-admin + reset (Option A).
- Audit live INSERT **honestly SKIPPED** (no password mutate risk).
- **No** G-ADM-01-READ claim · **no** seed · **no** invent membership · HOLD_DEPLOY · **NOT** Phase1/PROD/:8088.

---

## 9. Handoff

### completion_report

**Closed:** `QA-HRM-ADM-L1-LIVE-01` — ENV Info wires **L1-live-404-wire** and **L1-live-scope-wire** cleared with live HTTP on L0-up stack: platform + missing UUID → **404** `HRM-ERR-USER-NOT-FOUND`; unauth → **401** `HRM-AUTH-001`; `subsidiary_ceo` → **403** `HRM-AUTH-002` (company-admin + reset). Audit live INSERT **SKIPPED** (U65 risk honesty) — **L1-live-audit-row** remains Info; prior G-ADM-01 write GWC **not** reopened. **G-ADM-01-READ** not claimed. No seed · no invent admin mutate · HOLD_DEPLOY · NOT Phase1/PROD/:8088.

**Residual:** L1-live-audit-row Info (optional); G-ADM-01-READ Info; Option B HOLD.

### next_owner

`qc` (formal clear Info conditions on prior GWC packets) **or** `pm` intake if QC wave deferred

### next_dispatch_prompt

```text
work_item_id: QC-HRM-ADM-L1-LIVE-01
role: qc
lane: governance · Info-condition clear · HOLD_DEPLOY · U65
entry: QA-HRM-ADM-L1-LIVE-01 PASS — docs/qa/evidence/qa-hrm-adm-l1-live-01-20260727.md
prior GWC: qc-hrm-adm-05-01 · qc-hrm-adm-scope-01 · qc-hrm-adm-audit-01
goal:
  1) Formal CLEAR L1-live-404-wire Info (live 404 HRM-ERR-USER-NOT-FOUND observed)
  2) Formal CLEAR L1-live-scope-wire Info (live 401/403 Option A observed)
  3) Keep L1-live-audit-row Info OPEN (QA skipped privileged reset mutate — honesty OK; do NOT reopen G-ADM-01 write without FAIL)
  4) Keep G-ADM-01-READ Info OPEN — do NOT invent GET audit DONE
  5) Do NOT reopen G-ADM-05 / G-ADM-SCOPE-01 / G-ADM-01 without FAIL
exit: evidence docs/qa/evidence/qc-hrm-adm-l1-live-01-20260727.md → PASS_TO_PM
cấm: seed · invent admin mutate · Phase1/PROD/:8088 · reopen CLOSED G-ADM · claim G-ADM-01-READ
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/qa-hrm-adm-l1-live-01-20260727.md`

### pm_dispatch_hint

`QC-HRM-ADM-L1-LIVE-01` — clear ENV Info 404+scope from QA live wires; leave audit-row Info; HOLD_DEPLOY · NOT Phase1/PROD/:8088.
