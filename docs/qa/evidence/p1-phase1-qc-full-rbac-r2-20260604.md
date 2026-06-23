# QC Gate Decision — P1-PHASE1-QC-FULL-RBAC-01-R2 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QC-FULL-RBAC-01-R2` |
| **parent** | `P1-PHASE1-QC-FULL-RBAC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **execution_date** | `2026-06-04` |
| **ack_status** | **PASS_TO_PM** |

## Adjudication request

Reconcile **QC-01 GO WITH CONDITIONS** (API RBAC PASS on nip.io, J-CC-02 browser accepted @ `68ec457`) vs **QA FAIL_TO_PM** on **J-CC-02** browser PUT **400** (`p1-cc-qa-member-legal-save-l25-20260604.md` § `0ea889d` / `5ae6bca`) while API probe **4/4 PASS**.

**Verdict shape (mandated):** **split** — promote **API RBAC** separately from **browser CC save**; do not bundle browser into RBAC GO while FE chain open.

---

## Evidence consumed

| # | Artifact | Role | Used for |
|---|----------|------|----------|
| 1 | `docs/qa/evidence/p1-phase1-qa-full-rbac-20260604.md` | QA | U28 API slice — **PASS_TO_PM** |
| 2 | `docs/qa/evidence/p1-phase1-qc-full-rbac-20260604.md` | QC (prior) | QC-01 GWC baseline |
| 3 | `docs/qa/evidence/p1-cc-qa-member-legal-save-l25-20260604.md` | QA | J-CC-02 browser timeline FAIL → PASS |
| 4 | `docs/qa/evidence/qc-p1-cc-member-legal-save-l25-20260604.md` | QC (prior) | Browser-only GWC @ `68ec457` |

## Evidence pack gate

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-full-rbac-20260604.md
```

| Result | Detail |
|--------|--------|
| Exit | **0** (**8/8**) |
| QC adjudication | **C-RBACQC-01 CLOSED** — consolidated QA RBAC pack published; process condition from QC-01 satisfied |

Member-legal pack (`p1-cc-qa-member-legal-save-l25-20260604.md`) remains **2/8** format — substantive only; **not** re-required for API RBAC slice.

---

## Classification (ENV vs PRODUCT)

| Signal | Class | Gate impact |
|--------|-------|-------------|
| QC spot-check probe `P-CC-01-login` **502** (2026-06-04 R2 session) | **ENV** | Does **not** overturn QA same-day probe **exit 0** when nip.io was up |
| HTTPS probe **23/23 + 7/7** (QA table #1) | **PRODUCT — PASS** | API RBAC perimeter |
| `test:xbos:cc-member-save` **4/4 PUT 200** | **PRODUCT — PASS** | Group CEO mutate (API) |
| Member CEO GMU **403**, KPI holding **409** | **PRODUCT — PASS (negative)** | U28 member block |
| GET shareholders member headers **409** | **PRODUCT — closed** | **C-RBACQC-02 CLOSED** — deploy retest **200** `XBOS-SHR-200` (`p1-phase1-qa-full-rbac-20260604.md`, `p1-phase1-qc-crud-journey-20260604.md`, `P1-PHASE1-QC-CRUD-GATE-01`) |
| Browser PUT **400** `XBOS-VAL-001` @ `0ea889d` / `5ae6bca` | **PRODUCT — FAIL** (historical) | **Blocks RBAC bundle** until FE fix deployed |
| Duplicate `content-type` + `Content-Type` (QA isolation) | **PRODUCT — closed** | **dev-fe** `68ec457` |
| Browser PUT **200** @ portal-fe **`68ec457`** | **PRODUCT — PASS** | **Out of RBAC work_item** — see slice B |

---

## Split decision (authoritative)

### Slice A — Phase 1 **U28 API RBAC** (`P1-PHASE1-QA-FULL-RBAC-01`)

| Decision | **GO WITH CONDITIONS** |
|----------|-------------------------|
| Scope | Group CEO `ceo@xe.vn` nip.io API: JWT **86400**, probe L2 **23/23**, L2.5 **7/7**, member legal **PUT 4/4**, persona density, member CEO negatives **403/409** |
| **NOT claimed** | Phase 1 program DONE; PROD-READY; full browser matrix; member HRBP nip.io depth |

**Conditions (carry-forward + closure):**

| ID | Condition | Status |
|----|-----------|--------|
| **C-RBACQC-01** | QA pack + `verify:qc:evidence-pack` **0** | **CLOSED** |
| **C-RBACQC-02** | Group CEO GET shareholders with member tenant headers **409** on nip.io | **CLOSED** — probe shareholders **200** on current pilot (`p1-phase1-qa-scope-crud-journey-20260604.md`, QC CRUD gates 2026-06-04) |
| **C-RBACQC-04** | Member CEO + HRBP full P-CC + J-HRM **browser** L2.5 on nip.io | **OPEN** — **qa** |

### Slice B — **J-CC-02 browser** CC member legal save (same user journey, **different gate**)

| Phase | QA ack | QC R2 verdict |
|-------|--------|---------------|
| Pre-FE fix (`0ea889d`, `5ae6bca`) | **FAIL_TO_PM** — PUT **400**, probe still **4/4** | **NO-GO** for browser L2.5 — **must not** inherit into Slice A GO |
| Post-FE `68ec457` | **PASS_TO_PM** — PUT **200**, single `Content-Type` | **GO WITH CONDITIONS** only under **`P1-CC-QC-MEMBER-LEGAL-SAVE-L25-01`** (`qc-p1-cc-member-legal-save-l25-20260604.md`) — **not** re-claimed inside RBAC-01-R2 |

**QC-01 correction:** Bundling “J-CC-02 browser **PASS (GWC chain)**” into **P1-PHASE1-QC-FULL-RBAC-01** while member-legal QA still showed **FAIL_TO_PM** on **400** was **process drift** — acceptable only as **cross-reference**, not as RBAC slice closure. R2 **splits** the verdicts.

**pm rule:** USER_SERVICE_STATUS / “RBAC UAT-ready” may cite **API slice A**; **browser save** requires **CC member-legal QC** or fresh QA L2.5 after any portal-fe regression.

---

## U28 / RBAC table (API slice A only)

### Group CEO (`ceo@xe.vn`) — API

| Capability | QA / QC | R2 |
|------------|---------|-----|
| JWT **86400** | PASS | **PASS** |
| L2 **23/23**, L2.5 **7/7** (probe) | PASS | **PASS** |
| Member legal **PUT** ×4 API | **4/4** **200** | **PASS** |
| J-CC-02 **browser** save | Separate file | **Excluded from Slice A** |

### Member CEO (`du-lich.ceo@xe.vn`) — API negatives

| Check | Expected | R2 |
|-------|----------|-----|
| GMU list | **403** | **PASS (negative)** |
| KPI `companyId=holding` | **409** | **PASS (negative)** |

---

## L2.5 journey coverage (U19) — split

| Journey | Slice A (API RBAC) | Slice B (browser CC) |
|---------|-------------------|----------------------|
| **J-CC-02** | API mutate **PASS** (probe/script) | **NO-GO** until FE `68ec457`; then **PASS** via CC QC gate only |
| **J-CC-03** | **PASS** + member negative **409** | N/A |
| **J-HRM-01..07** | Probe **7/7 PASS** | Member browser **deferred** (**C-RBACQC-04**) |

**L2 PASS + L2.5 browser FAIL** on member legal → **overall QA FAIL** on browser work_item — does **not** NO-GO Slice A API when classified per shared lesson `probe-pass-ui-fail`.

---

## QC reproduction (R2 session)

| # | Check | Result | Class |
|---|-------|--------|-------|
| 1 | `verify:qc:evidence-pack` on QA RBAC MD | **0** (8/8) | PROCESS |
| 2 | `tmp-p1-ex-qa-https-01-probe.mjs` nip.io | **FAIL** login **502** | **ENV** — stack/pilot transient |

---

## Residual

| ID | Item | Owner | Blocks Slice A? | Blocks Slice B? |
|----|------|-------|-----------------|-----------------|
| **C-RBACQC-02** | Shareholders GET **409** | — | **CLOSED** | No |
| **C-RBACQC-04** | Member persona browser depth | qa | No | Partial coverage |
| Browser **400** chain | Closed @ **68ec457** | dev-fe (done) | No | Was **Yes** until FE deploy |
| Program / PROD | G4/G5 / PROD columns | pm | Yes for **Program DONE** only | — |

---

## completion_report

- **Closed:** **C-RBACQC-01**; split adjudication — **Slice A** **GO WITH CONDITIONS** (U28 API RBAC on nip.io); **Slice B** **NO-GO** for browser within RBAC bundle during **400** FAIL chain; **GWC PASS** for browser only via **`P1-CC-QC-MEMBER-LEGAL-SAVE-L25-01`** after **`68ec457`**.
- **Open:** **C-RBACQC-04**; pilot **502** at QC spot-check (ENV monitor). **Closed:** **C-RBACQC-02** (shareholders **200**).

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-BE-SCOPE-CRUD-02
from_role: pm
to_role: dev-be
lane: execution

QC R2 split: API RBAC Slice A **GO WITH CONDITIONS** — do not wait on browser. Close C-RBACQC-02: Group CEO ceo@xe.vn GET /org-foundation/legal-entities/{id}/shareholders with member registry headers (x-tenant-id: xe-du-lich, x-company-id: main) must return HTTP 200 on https://14-225-217-232.nip.io (QA: entity GET 200, shareholders 409 on id 11d2bb7b-6190-4cb4-b0fe-03d43b5596b8).

Entry: docs/qa/evidence/p1-phase1-qa-full-rbac-20260604.md; docs/qa/evidence/p1-phase1-qc-full-rbac-r2-20260604.md
Verify: PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-phase1-be-scope-crud-probe.mjs exit 0 (shareholders row PASS); pnpm --filter xbos-api test; keep test:xbos:cc-member-save 4/4.
Exit: READY_FOR_QA; evidence_path docs/qa/evidence/p1-phase1-be-scope-crud-20260604.md

Parallel (coverage, not RBAC blocker): qa P1-PHASE1-QA-MEMBER-PERSONA-NIPIO-01 — C-RBACQC-04 member CEO + HRBP J-* browser on nip.io.
Browser save already PASS @ 68ec457 — cite qc-p1-cc-member-legal-save-l25-20260604.md; do not re-open dev-fe unless PUT 400 regresses.
```

## evidence_path

`docs/qa/evidence/p1-phase1-qc-full-rbac-r2-20260604.md`

## ack_status

**PASS_TO_PM** — **Split:** Slice A **GO WITH CONDITIONS** (API U28 RBAC); Slice B browser **NO-GO** in RBAC bundle during **400** FAIL; browser **GWC PASS** only via **P1-CC-QC-MEMBER-LEGAL-SAVE-L25-01** @ **`68ec457`**. **NOT** Phase 1 DONE · **NOT** PROD.
