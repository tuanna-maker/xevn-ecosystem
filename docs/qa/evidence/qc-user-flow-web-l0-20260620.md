# QC gate — P1-USER-FLOW-WEB-QC-L0 (local web user-flow)

| Field | Value |
|-------|-------|
| work_item_id | `P1-USER-FLOW-WEB-QC-L0` |
| from_role | qc |
| to_role | pm |
| date | 2026-06-20 |
| wave | `docs/program/WEB_UAT_DEV8088_WAVE.md` W2 |
| matrix | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §3–§4 |
| ack_status | **PASS_TO_PM** |

---

## 1. Evidence pack audit (Layer B)

| Evidence file | `verify:qc:evidence-pack` | Role | Notes |
|---------------|---------------------------|------|-------|
| `docs/qa/evidence/user-flow-e2e-audit-20260616.md` | **FAIL 2/8** | QA audit (PM cite) | Missing machine-parseable `work_item_id:` / `ack_status:` lines (table-only). UF-XBOS-05 🔴 P0 snapshot **superseded** by holding fix + W1 retest. |
| `docs/qa/evidence/user-flow-web-qa-l0-20260616.md` | **PASS 8/8** | QA W1 authoritative | `ack_status: FAIL_TO_PM` — 2× P1 in web scope; L0 stack PASS. |
| `docs/qa/evidence/p1-xbos-holding-shr-fix-20260620.md` | N/A (dev) | dev-fe | `READY_FOR_QA`; scope helper + vitest 15/15 + build PASS. |

**Process finding:** PM dispatch cited audit file; **W1 SoT** per wave doc is `user-flow-web-qa-l0-20260616.md`. QC audited both; gate decision uses W1 pack + matrix cross-check. QA should normalize audit MD to pack template or retire duplicate SoT.

---

## 2. Scope statement (bounded)

**In scope (web-only, local `:5173`):**

- UF-XBOS-03..09 (Command Center org/settings mutate paths)
- UF-HRM-01..06 (HRM embed read/mutate — group CEO)
- UF-HRM-09 / UF-HRM-13 (member CEO / HRBP web personas)

**Explicitly out of scope (do not block):**

- UF-HRM-07 / UF-HRM-08 (mobile J-MOB — ⚪ N/A in W1 evidence)
- `:8088` Dev8088 column (W4/W5 — not this gate)
- Phase 1 program closure / PROD cutover

---

## 3. UF operability verdict (Local column)

### XBOS (UF-XBOS-03..09)

| UF-ID | Matrix (pre-QC) | QC concurrence | Classification |
|-------|-----------------|----------------|----------------|
| UF-XBOS-03 | 🟢 | **PASS** | PRODUCT — member legal PUT + re-GET |
| UF-XBOS-04 | 🟢 | **PASS** | PRODUCT — member shareholder POST |
| UF-XBOS-05 | 🔴→🟢 | **GWC** | PRODUCT — API holding UUID path 🟢 post `P1-XBOS-HOLDING-SHR-01`; **browser L2.5 «Lưu + F5» on TẬP ĐOÀN not in dedicated QA R2 file** |
| UF-XBOS-06 | 🟢 | **PASS** | PRODUCT — legal doc POST + GET |
| UF-XBOS-07 | 🟢 | **PASS** | PRODUCT — RACI matrix GET |
| UF-XBOS-08 | 🟢 | **PASS** | PRODUCT — workflow read (empty inbox OK) |
| UF-XBOS-09 | 🟢 | **PASS** | PRODUCT — catalog inbox 200 (empty alternate) |

### HRM web (UF-HRM-01..06, 09, 13)

| UF-ID | Matrix / W1 | QC concurrence | Classification |
|-------|-------------|----------------|----------------|
| UF-HRM-01 | 🟢 | **PASS** | PRODUCT — list→detail scope parity |
| UF-HRM-02 | 🟡 | **FAIL (P1)** | PRODUCT — POST `HRM-CON-201` OK; GET-by-id omits `notes` → F5 verify blocked |
| UF-HRM-03 | 🟢 | **PASS** | PRODUCT — PATCH full_name persist |
| UF-HRM-04 | 🟢 | **PASS** | PRODUCT — contract list 200 |
| UF-HRM-05 | 🟢 | **PASS** | PRODUCT — attendance records |
| UF-HRM-06 | 🟢 | **PASS** | PRODUCT — payslips |
| UF-HRM-07 | ⚪ | **N/A** | Out of web wave |
| UF-HRM-08 | ⚪ | **N/A** | Out of web wave |
| UF-HRM-09 | 🟡 | **FAIL (P1)** | PRODUCT — HRBP list 200; PATCH employee **403** |
| UF-HRM-13 | ⬜ | **UNTESTED** | Process gap — member mutate UI not executed in W1 |

**Slice score (in-scope web):** 12 🟢 · 2 🟡 P1 · 1 GWC (UF-XBOS-05 browser) · 1 ⬜ (UF-HRM-13)

---

## 4. L2.5 / journey coverage

| Journey | Web relevance | W1 evidence | QC audit |
|---------|---------------|-------------|----------|
| J-CC-01..03 | CC login / units / KPI | UF-XBOS-01,02,10 🟢 | Concurred |
| J-HRM-01..07 | HRM embed | UF-HRM-01..06 API + iframe load spot | **GWC** — iframe list→detail click not automated (MCP limit); API parity PASS |
| J-MOB-01..05 | Mobile | ⚪ N/A | Not gated |

L2.5 browser click paths for CC «Lưu thay đổi» and HRM iframe remain **API-surrogate + spot screenshot** — acceptable for **local GWC**; **not** sufficient for sponsor :8088 demo without manual/browser R2.

---

## 5. Classification (ENV vs PRODUCT)

| Item | Class | Disposition |
|------|-------|-------------|
| UF-XBOS-05 holding UI-id (audit 🔴) | PRODUCT | **Mitigated** — dev-fe fix landed; W1 API path 🟢 |
| UF-HRM-02 contract `notes` | PRODUCT P1 | **Open** — `P1-HRM-CON-NOTES-PERSIST-01` → dev-be |
| UF-HRM-09 HRBP PATCH 403 | PRODUCT P1 | **Open** — `P1-HRM-HRBP-EMP-PATCH-01` → dev-be |
| UF-HRM-08 mobile leave 400 (audit) | PRODUCT (mobile) | **Deferred** — out of web scope |
| xbos-api `dist/main` dev startup | ENV P2 | **Open** — `P1-DEVOPS-XBOS-NEST-DEV-01`; L0 recovered via ts-node |
| Audit pack verify FAIL | PROCESS | QA normalize evidence template |

---

## 6. QC verdict

### **GO WITH CONDITIONS (bounded local web slice — W2)**

**Promoted:** Local `:5173` web user-flow slice for **read + majority mutate paths** (UF-XBOS-03..04,06..09; UF-HRM-01,03..06) with L0 stack PASS.

**NOT promoted:**

- **NOT** `:8088` sponsor demo GO (W5)
- **NOT** Phase 1 DONE / UAT-READY full HRM web mutate
- **NOT** UF-XBOS-05 holding screen for live demo until **C1** closed

### Conditions (mandatory closure before next GO tier)

| ID | Condition | Owner | Trigger |
|----|-----------|-------|---------|
| **C1** | UF-XBOS-05 **🟢** with browser path: CC → Cài đặt → **TẬP ĐOÀN** → Thêm cổ đông → Lưu → **F5** persist; Network POST 2xx on holding UUID (not `xbos-group-holding-root` 404) | **qa** | `P1-XBOS-HOLDING-SHR-01-QA` R2 **before** `P1-USER-FLOW-WEB-QC-8088` / demo on `:8088` |
| **C2** | UF-HRM-02 🟢 — contract GET returns persisted `notes` after create | **dev-be** → qa | `P1-HRM-CON-NOTES-PERSIST-01` |
| **C3** | UF-HRM-09 🟢 — `du-lich.hr@xe.vn` scoped PATCH within member unit | **dev-be** → qa | `P1-HRM-HRBP-EMP-PATCH-01` |
| **C4** | UF-HRM-13 executed — member CEO contract/employee mutate UI + F5 | **qa** | Before claiming full member web slice USER-OK |
| **C5** | Evidence pack — single SoT MD passes `verify:qc:evidence-pack` | **qa** | Next READY_FOR_QC handoff |
| **C6** | Dev8088 column — retest all in-scope UF on `:8088` after W3 deploy | **qa** → qc | `P1-USER-FLOW-WEB-QA-8088` / W5 |

---

## 7. Residual risk (PM dispatch)

1. **Demo script:** Avoid TẬP ĐOÀN shareholder screen until **C1** 🟢; use member unit (XE_DU_LICH) workaround per matrix §5.
2. **HRBP persona:** Sponsor demo with `du-lich.hr@xe.vn` employee edit will fail until **C3**.
3. **Contract F5 demo:** Any «ghi chú hợp đồng» narrative fails until **C2**.
4. **Program gates:** `phase1:gate`, G4/G5, 111 UC matrix — unchanged; this gate is **wave-local only**.

---

## 8. Command spot-check (QC read-only)

| Command | Exit | Notes |
|---------|------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/user-flow-web-qa-l0-20260616.md` | **0** | 8/8 PASS |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/user-flow-e2e-audit-20260616.md` | **1** | 2/8 FAIL (process) |

Full `qc:dev-stack` not re-run this QC turn — W1 documents L0 PASS; ENV P2 xbos dev startup tracked separately.

---

## Handoff

**completion_report:** Audited W1 web user-flow evidence (pack PASS on `user-flow-web-qa-l0-20260616.md`). Issued **GO WITH CONDITIONS** for bounded local web slice: 12/15 in-scope UF 🟢, 2 P1 open (UF-HRM-02, UF-HRM-09), UF-XBOS-05 API-fixed but browser R2 pending (**C1**), UF-HRM-13 untested. Mobile UF-HRM-07/08 not gated. Audit file cited by PM fails pack verify — process note only.

**next_owner:** pm

**next_dispatch_prompt:**

```
Dispatch dev-be in parallel: (1) P1-HRM-CON-NOTES-PERSIST-01 — persist/return `notes` on contract GET for UF-HRM-02 F5; (2) P1-HRM-HRBP-EMP-PATCH-01 — allow du-lich.hr@xe.vn scoped employee PATCH per ADR scope ladder for UF-HRM-09. After READY_FOR_QA, dispatch qa P1-USER-FLOW-WEB-QA-L0-R2 retest UF-HRM-02/09 only + P1-XBOS-HOLDING-SHR-01-QA browser R2 for UF-XBOS-05 (C1). Then W3 P1-DEPLOY-8088-WEB-UAT-01. Do NOT claim :8088 demo GO until C1–C3 closed and W5 QC-8088.
```

**evidence_path:** `docs/qa/evidence/qc-user-flow-web-l0-20260620.md`

**ack_status:** **PASS_TO_PM**
