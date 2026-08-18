# QC Gate Decision — P1-EX-QC-J-HRM-06-NIPIO-CLOSE

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QC-J-HRM-06-NIPIO-CLOSE` |
| from_role | `qc` |
| to_role | `pm` |
| execution_date | `2026-07-19` |
| decision | **GO WITH CONDITIONS** |
| slice | Close **C-RES03R3R3-04** — J-HRM-06 L2.5 browser click on nip.io (leave list → detail) |
| pilot_url | `https://14-225-217-232.nip.io` |
| persona | `ceo@xe.vn` · `companyId=main` |
| parent_gate | `P1-EX-QC-HTTPS-RESIDUAL-03-R3-R3` GWC (`p1-ex-qc-https-residual-03-r3-r3-20260719.md`) |
| ack_status | **PASS_TO_PM** |
| U65 | zero-seed · browser-only · no `pnpm seed:*` in audited chain |

## Scope audited

QC close of deferred condition **C-RES03R3R3-04** after QA `P1-EX-QA-J-HRM-06-NIPIO-CLICK` **PASS** / `PASS_TO_PM`.

**In scope:** J-HRM-06 list→detail (yêu cầu nghỉ phép) on Command Center attendance embed · same-day nip.io freshness.

**Explicitly not approved:** Phase 1 Program DONE · PROD-READY · UF promote from NFR alone · full HTTPS RESIDUAL-03 program closure · reopen of residual-03 product gates already PASS (Auth 5/5, fallbackAllCount 0/0, HRM-ATT-200).

## Evidence consumed

| # | Artifact | Role | Verdict used |
|---|----------|------|--------------|
| 1 | `docs/qa/evidence/p1-ex-qa-j-hrm-06-nipio-20260719.md` | QA | **Authoritative** — PASS / `PASS_TO_PM` |
| 2 | `docs/qa/evidence/p1-ex-qa-j-hrm-06-nipio-20260719-leave-detail.png` | QA | Screenshot corroborates modal Chi tiết (Nguyen NhanSu0002 / NV0002 / Đã duyệt) |
| 3 | `docs/qa/evidence/p1-ex-qa-j-hrm-06-nipio-20260719-profile.png` | QA | Supporting artifact present |
| 4 | `docs/qa/evidence/p1-ex-qc-https-residual-03-r3-r3-20260719.md` | QC (parent) | GWC — **C-RES03R3R3-04** was Deferred |
| 5 | `docs/program/PROGRAM_JOURNEY_MAP.md` | Journey SoT | J-HRM-06 ✅ PASS (R6 historical + this refresh) |

## Evidence pack integrity

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ex-qa-j-hrm-06-nipio-20260719.md
→ exit 1 (2/8 checks FAIL)
```

| Missing check (script) | QC adjudication |
|------------------------|-----------------|
| `command_table` | **Process GWC** — L0/network tables present; no consolidated pnpm exit-code command table |
| `residual_section` | **Process GWC** — handoff residual implicit; no `## Residual` heading |

**Not NO-GO (process):** file exists, readable, screenshots present, click path + Network 2xx + FE-after-action table are executable in-artifact. Same adjudication pattern as residual-03 R3-R3 pack gaps (out-of-slice / format only).

### Command table (QC this wave)

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ex-qa-j-hrm-06-nipio-20260719.md` | exit **1** (2/8) | **PROCESS** — not product NO-GO |
| `curl.exe` `https://14-225-217-232.nip.io/` | **200** | L0 spot |
| `curl.exe` `/hr/attendance?portal=1&companyId=main` | **200** | L0 spot |
| `curl.exe` `/api/hrm/` | **200** | L0 spot |
| `curl.exe` `/command-center/hrm/attendance?companyId=main` | **200** | L0 spot |

## Gate matrix (C-RES03R3R3-04 close)

| Gate | Expected | Actual | QC verdict |
|------|----------|--------|------------|
| Browser L2.5 J-HRM-06 on nip.io | Click path leave/request → detail | CC attendance → Nghỉ phép → Danh sách yêu cầu → eye → modal Chi tiết | **PASS** |
| FE after action | Modal + employee identity; no not-found | Nguyen NhanSu0002 · NV0002 · Ban Điều hành · Đã duyệt; not-found **absent** | **PASS** |
| Network leave-requests | **200** `HRM-LEAVE-200` | QA PerformanceResourceTiming | **PASS** |
| Network records | **200** `HRM-ATT-200` | QA | **PASS** |
| Network employees/:id | **200** `HRM-EMP-200` | QA scope parity | **PASS** |
| U65 zero-seed | No seed in evidence chain | QA declares browser-only; late-list alternate N/A without seed | **PASS** |
| Zero localhost Supabase | No `127.0.0.1:54321` | QA scan aligned with residual-03 R3 | **PASS** (no reopen) |
| Residual-03 product gates | Do not reopen if no contradiction | Auth/fallback/records already PASS; no contradiction found | **PASS** — not reopened |

## L2.5 journey coverage audit (U19)

| Journey | This wave | QC |
|---------|-----------|-----|
| **J-HRM-06** leave list → request detail (yêu cầu) | Fresh browser click 2026-07-19 · screenshot + Network 2xx | **PASS** — closes **C-RES03R3R3-04** |
| J-HRM-06 late-list → profile (R6 path) | Not re-clicked (late list empty today; U65) | **Deferred alternate** — primary journey accept path MET via leave detail |
| Full J-HRM 7/7 | Not in this wave | **Out of slice** |
| Member CEO | Not in slice | **Out of scope** |

**U19:** Mandatory L2.5 for this condition = same-day J-HRM-06 list→detail on nip.io. **Met.**

## Classification

| Finding | Type | Gate impact |
|---------|------|-------------|
| Evidence pack 2/8 (command_table / residual_section) | **Process** | **GWC** — do not drive product NO-GO |
| Leave reason text contains historical seed label in data | **Informational** | Pre-existing row content; QA did not run seed this wave (U65) |
| Residual-03 Auth / fallback / records | **PRODUCT** | Already **PASS** — **not reopened** |
| J-HRM-06 click freshness | **PRODUCT** | **PASS** → **C-RES03R3R3-04 CLOSED** |

## Parent condition register (updated)

| ID | Condition | Owner | Status |
|----|-----------|-------|--------|
| C-RES03R3R3-01 | Persona/route nip.io main | QA | **MET** (prior) |
| C-RES03R3R3-02 | Evidence pack format gaps | QA | **Open** (process) — carries |
| C-RES03R3R3-03 | CC embed L0 200 | QA | **MET** (prior + QC spot 200) |
| **C-RES03R3R3-04** | J-HRM-06 list→detail browser click | QA | **CLOSED** — fresh 2026-07-19 |
| C-RES03R3R3-05 | Production / Phase 1 DONE | PM/QC | **NOT MET** — forbidden claim |

## Decision rationale

**GO WITH CONDITIONS** — Condition **C-RES03R3R3-04** is **CLOSED**:

1. QA browser path on `https://14-225-217-232.nip.io` is complete and consistent (click path, FE-after-action, Network `HRM-LEAVE-200` / `HRM-ATT-200` / `HRM-EMP-200`).
2. Screenshot `…-leave-detail.png` corroborates modal **Chi tiết yêu cầu nghỉ phép** for Nguyen NhanSu0002 / NV0002 / Đã duyệt.
3. QC L0 spot **200×4** on nip.io; no product contradiction vs residual-03 R3-R3 attendance lane PASS.
4. Process pack 2/8 remains **GWC** only (does not reopen product gates).

**Bounded promotion:** J-HRM-06 freshness on `ceo@xe.vn` / `companyId=main` / nip.io — **NOT** Phase 1 DONE · **NOT** PROD-READY · **no UF promote from NFR alone**.

## Residual (not promoted)

- Process pack completeness (**C-RES03R3R3-02** still open).
- Full HTTPS RESIDUAL-03 program bundle / member personas.
- **NOT** Phase 1 DONE · **NOT** PROD-READY (**C-RES03R3R3-05**).

## completion_report

- **closed_scope:**
  - Audited QA `p1-ex-qa-j-hrm-06-nipio-20260719.md` + leave-detail screenshot vs parent GWC R3-R3.
  - Confirmed J-HRM-06 L2.5 leave list→detail on nip.io **PASS** (Network leave/records/emp **200**).
  - Closed **C-RES03R3R3-04**.
  - Did **not** reopen residual-03 Auth/fallback/records product PASS.
  - Issued **GO WITH CONDITIONS** for this condition-close slice.
- **residual:**
  - Process pack format (**C-RES03R3R3-02**).
  - **NOT** Phase 1 / **NOT** PROD (**C-RES03R3R3-05**).

## Handoff Packet

- **next_owner:** `pm`
- **next_dispatch_prompt:** See YAML below.
- **evidence_path:** `docs/qa/evidence/qc-p1-ex-j-hrm-06-nipio-20260719.md`
- **ack_status:** `PASS_TO_PM`

```yaml
completion_report: |
  P1-EX-QC-J-HRM-06-NIPIO-CLOSE — GO WITH CONDITIONS.
  C-RES03R3R3-04 CLOSED: J-HRM-06 L2.5 leave list→eye→detail modal PASS on
  https://14-225-217-232.nip.io (ceo@xe.vn / companyId=main). QA Network
  HRM-LEAVE-200 / HRM-ATT-200 / HRM-EMP-200 corroborated; QC L0 spot 200×4;
  residual-03 product gates NOT reopened. Process pack 2/8 = GWC only
  (C-RES03R3R3-02 still open). NOT Phase1/PROD; no UF promote from NFR alone.
next_owner: pm
next_dispatch_prompt: |
  work_item_id: P1-EX-PM-INTAKE-J-HRM-06-NIPIO-CLOSE
  from_role: qc
  to_role: pm
  lane: governance
  entry_criteria: QC GWC docs/qa/evidence/qc-p1-ex-j-hrm-06-nipio-20260719.md;
    C-RES03R3R3-04 CLOSED; parent residual-03 R3-R3 attendance lane still GWC
  exit_criteria: Update bus / TEAM_WORKING_NOW — mark C-RES03R3R3-04 CLOSED;
    keep C-RES03R3R3-02 process pack open; keep C-RES03R3R3-05 forbidden;
    do NOT claim Phase1 DONE or PROD-READY; do NOT promote UF from NFR alone;
    continue open HTTPS/matrix backlog or process-pack QA polish if prioritized
  ack_status: PASS_TO_PM
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/qc-p1-ex-j-hrm-06-nipio-20260719.md
```
