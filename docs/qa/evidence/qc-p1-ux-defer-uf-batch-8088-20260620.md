# P1-UX-DEFER-UF-BATCH-8088-QC — L3 gate (G-UX-03 NAV defer close + UF-XBOS-06)

**work_item_id:** `P1-UX-DEFER-UF-BATCH-8088-QC`  
**Date:** 2026-06-20  
**Role:** qc  
**PORTAL_DEV_URL:** `http://14.225.217.232:8088/`  
**Personas:** `ceo@xe.vn` · `du-lich.hr@xe.vn` / `Xevn@2026`  
**QA SoT:** `docs/qa/evidence/p1-ux-defer-uf-batch-8088-20260620.md`  
**Prior GWC:** `docs/qa/evidence/qc-p1-uiux-fe-hrm-02-8088-20260620.md` — C2 UX-XBOS-10 RACI NAV · C3 UX-HRM-09 member persona  
**Spec ref:** `docs/program/PHASE1_UIUX_REAUDIT_SPONSOR_20260620.md` G-UX-03; UC-XBOS-ORG-03 / AC-UF-XBOS-06

---

## Command table

| Command | Exit | Verdict | Notes |
|---------|------|---------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ux-defer-uf-batch-8088-20260620.md` | 1 | FAIL 3/8 | Process — missing command table, portal_url, J-* rows on QA SoT |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-p1-ux-defer-uf-batch-8088-20260620.md` | 0 | PASS | This QC gate artifact |
| `pnpm run qc:dev-stack` | — | Not re-run | L0 assumed PASS from prior `:8088` waves; spot not required per pack gate |

**portal_url:** `http://14.225.217.232:8088/` (VPS pilot — sponsor nghiệm thu U65 browser-only)

---

## L2.5 J-* journeys

| Journey ID | Account | Click path | Expected | Actual | Verdict |
|------------|---------|------------|----------|--------|---------|
| J-CC-02 | ceo@xe.vn | CC → member unit edit → Hồ sơ pháp nhân ↔ Nhiệm vụ & RACI | Panel swap without blank flash / error banner | UX-XBOS-10 ~403ms / ~309ms; Ma trận RACI visible; Tài liệu đính kèm on return | **PASS** (G-UX-03 NAV) |
| J-HRM-01 | du-lich.hr@xe.vn | `/command-center/hrm/employees` → sidebar Chấm công / Hợp đồng / Nhân sự | Embed iframe routes switch; no 403/500/Sync ERROR | iframe `hr/attendance`, `hr/contracts`, `hr/employees`; tenantId=xe-du-lich; ~803ms each | **PASS** (UX-HRM-09 member NAV) |
| J-CC-02 | ceo@xe.vn | Legal doc upload → GET file → F5 | Upload persist; file stream 200; metadata after reload | POST upload OK; GET `/legal-documents/{id}/file` **200** `%PDF`; F5 row `QA-UF06-DEFER-8088` | **PASS** (UF-XBOS-06 core) |

**Deferred J-* (out of defer-batch scope):** Full J-CC legal-doc **Xem** new-tab UX — covered under ENV/config condition R-UF06-FILE-URL only.

---

## Classification (ENV vs PRODUCT)

| Class | Item | QC treatment |
|-------|------|--------------|
| **PRODUCT (closed)** | G-UX-03 NAV — UX-XBOS-10 RACI panel swap | **CLOSED** — Hồ sơ ↔ RACI ~403/309ms; no blank flash; matrix cell BDH-001×HĐQT **R** visible |
| **PRODUCT (closed)** | G-UX-03 NAV — UX-HRM-09 member embed sidebar | **CLOSED** — `du-lich.hr@xe.vn`; attendance/contracts/employees iframe routes; login 201; no sync banner |
| **PRODUCT (closed)** | UF-XBOS-06 upload + proxy GET file + F5 metadata | **CLOSED** — PDF upload; GET **200** not `XBOS-DOC-404`; F5 code + file indicator persist |
| **PRODUCT (closed)** | KPI delete F5 — `/dashboard/settings/kpi-metrics` | **CLOSED** — ABSENCE removed; F5 still 1 metric (OTIF only); scope-parity class |
| **ENV / CONFIG (open P2)** | R-UF06-FILE-URL — Xem `window.open` → `127.0.0.1:28002` on `:8088` | **GWC carry** — proxy GET **200** works; new-tab host misconfigured (`XBOS_PUBLIC_BASE_URL`) |
| **PROCESS (open P2)** | QA SoT pack 3/8 on `p1-ux-defer-uf-batch-8088-20260620.md` | Non-blocking for substance — normalize command table + J-* before next UX READY_FOR_QC |

---

## UX / UF matrix audit (in-scope rows)

| ID | Wave | Dimension | QA | QC promote | Notes |
|----|------|-----------|-----|------------|-------|
| UX-XBOS-10 | defer-batch | NAV | **PASS** | **PROMOTED** | Closes prior HRM-02 **C2** |
| UX-HRM-09 | defer-batch | NAV | **PASS** | **PROMOTED** | Member persona; closes prior HRM-02 **C3** |
| UF-XBOS-06 | defer-batch | UF mutate + F5 | **PASS** (GWC URL) | **PROMOTED** | Core AC met; Xem tab → **C1** below |
| UX-XBOS-13 KPI F5 | defer-batch | D + F5 | **PASS** | **PROMOTED** | Aligns vendor F5 fix class (not re-opening HRM-02 C1 if vendor already closed) |

**Matrix files updated by QA (QC audit confirms):**

- `docs/qa/UIUX_INTERACTION_AUDIT_MATRIX_8088.md` — UX-XBOS-10 NAV **PASS**; UX-HRM-09 NAV **PASS**; G-UX-03 gap **CLOSED (scoped)** including XBOS-10 + HRM-09
- `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` — UF-XBOS-06 🟢 Dev8088 defer-batch + evidence link + GWC note

---

## Gap closure summary

| gap_id | Prior (HRM-02 GWC) | After this gate on `:8088` |
|--------|--------------------|----------------------------|
| **G-UX-03** | OPEN — UX-XBOS-10, UX-HRM-09 member | **CLOSED (scoped)** — XBOS-01,02,**10**; HRM-01,**09**,10 per matrix gap summary |
| **UF-XBOS-06** | 🟡 / partial file view | **CLOSED (GWC)** — upload + GET 200 + F5; Xem new-tab host carry |

---

## QC verdict

**GO WITH CONDITIONS (scoped — G-UX-03 NAV defer batch + UF-XBOS-06 on `:8088`)**

### Promoted (closed)

- **G-UX-03 NAV:** UX-XBOS-10 RACI panel swap — smooth Hồ sơ ↔ RACI; no error banner (U65 browser).
- **G-UX-03 NAV:** UX-HRM-09 — member `du-lich.hr@xe.vn` embed sidebar cross-tab NAV.
- **UF-XBOS-06:** Legal doc upload, proxy file GET **200**, F5 metadata persistence.
- **KPI delete F5:** ABSENCE removal survives reload (regression spot in same batch).

### Conditions (carry)

| ID | Condition | Severity | Owner | Trigger |
|----|-----------|----------|-------|---------|
| **C1** | R-UF06-FILE-URL — Eye/Xem opens `127.0.0.1:28002` instead of portal proxy on `:8088` | P2 | devops | Set `XBOS_PUBLIC_BASE_URL=http://14.225.217.232:8088` on xbos-be; retest Xem new-tab |
| **C2** | QA SoT evidence pack format 3/8 | Process | qa | Append command table + PORTAL_DEV_URL + J-* before next UX READY_FOR_QC |

### Closes prior HRM-02 GWC conditions

| Prior ID | Status |
|----------|--------|
| C2 (UX-XBOS-10 RACI NAV) | **CLOSED** |
| C3 (UX-HRM-09 member persona) | **CLOSED** |

### Explicitly NOT granted

- **NOT** full UF-XBOS-06 «Xem file» UX until **C1** closed (API/proxy OK; new-tab host only).
- **NOT** overall UX UAT-ready — G-UX-04 FBK, G-UX-05, HRM LOD partial rows remain open.
- **NOT Phase 1 DONE** — program gates / excellence unchanged.

---

## Residual

- **C1** R-UF06-FILE-URL (P2 devops) — config-only; does not block G-UX-03 NAV closure.
- **C2** QA pack normalization (process).
- Vendor F5 if still open elsewhere — out of defer-batch scope; KPI F5 in this batch PASS.

---

**ack_status:** `PASS_TO_PM`

**completion_report:** L3 QC defer-batch — **GWC scoped GO** for G-UX-03 NAV (**UX-XBOS-10**, **UX-HRM-09**) + **UF-XBOS-06** core on `:8088`; closes HRM-02 C2/C3; single carry **C1** file-view localhost URL (P2 devops); NOT Phase 1 DONE.

**next_owner:** `pm`

**next_dispatch_prompt:**

```text
work_item_id: P1-UX-DEFER-UF-BATCH-8088-PM-CLOSE
entry: QC GWC — docs/qa/evidence/qc-p1-ux-defer-uf-batch-8088-20260620.md; G-UX-03 NAV XBOS-10 + HRM-09 CLOSED; UF-XBOS-06 promoted :8088
exit: PM close defer-batch wave on bus; optional devops C1 XBOS_PUBLIC_BASE_URL on :8088 if sponsor demos Eye/Xem new-tab
evidence: docs/qa/evidence/qc-p1-ux-defer-uf-batch-8088-20260620.md
ack_status: PASS_TO_PM
residual: R-UF06-FILE-URL P2 devops only
```

**evidence_path:** `docs/qa/evidence/qc-p1-ux-defer-uf-batch-8088-20260620.md`
