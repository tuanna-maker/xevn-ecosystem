# PCOMP-W4-QC-AVT-DISPLAY-R4 — L3 re-gate J-AVT-01 web display (nip.io)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W4-QC-AVT-DISPLAY-R4` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-06-07 |
| **decision** | **GO (scoped)** — **J-AVT-01 web display** promotable on nip.io pilot UAT |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — W4 avatar web display R4)

| In scope | Out of scope |
|----------|--------------|
| **J-AVT-01** web — visible holding `<img>` on list row **TCN-0954** + profile deep link | **J-AVT-02** mobile (`PCOMP-W4-PROFILE-AVATAR-01-MOB`) |
| Pilot `https://14-225-217-232.nip.io` · `ceo@xe.vn` / `Xevn@2026` | Upload E2E browser automation (GWC-AVT-03 P3) |
| Evidence chain DO-AVT-WEB-02/03 + FE `companyFilter` fix | Phase 1 DONE / `verify:product:completion` exit |
| Closes **D-W4-AVT-DISPLAY-01** | PROD cutover claim |

**Upstream QA:** `docs/qa/evidence/pcomp-w4-profile-avatar-01-qa-web-display-r4-20260607.md`  
**Dev chain:** `pcomp-w4-fe-employees-filter-01-20260607.md` → `pcomp-w4-do-avt-web-02-20260607.md` → `pcomp-w4-do-avt-web-03-20260607.md`  
**Prior QC:** `pcomp-w7-qc-avt-02-20260607.md` (data path GWC; display blocked until this R4)

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/pcomp-w4-profile-avatar-01-qa-web-display-r4-20260607.md
# exit 1 — 2/8 checks (2026-06-07 QC audit)
# FAIL: crud_or_matrix, residual_section
```

**QC adjudication:** **PROCESS NOTE — not product NO-GO.** Display-retest slice uses L2.5 browser matrix + defect closure table; CRUD § not required for read-only display journey. QA should add minimal R/U row + `## Residual` in next avatar pack for verifier 8/8.

Material pack present: `work_item_id`, `ack_status`, L0 command exit **0**, L2.5 J-AVT-01 steps, PORTAL_DEV_URL nip.io, date, handoff packet — **auditable**.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| L0 `qc:fe-be-health:pilot` **8/8** + **13/13** flows | ENV | **PASS** |
| Vite `Employees.tsx` `selectedSlug` present; `companyFilter` absent | PRODUCT / deploy parity | **PASS** |
| CC embed list `#root` **4** children; TCN-0954 row holding `<img>` **28×28** | PRODUCT / display | **PASS** |
| CC embed profile holding `<img>` **90×90**; **0** Radix fallbacks | PRODUCT / display | **PASS** |
| No `companyFilter is not defined` on list route | PRODUCT / regression | **PASS** |
| Local `:28001` ECONNREFUSED on QA workstation | ENV | **N/A** — pilot proxy path used |

**No PRODUCT defect** remains in bounded web display slice.

---

## Evidence chain audit

| Artifact | Layer | Key claim | QC concurrence |
|----------|-------|-----------|----------------|
| `pcomp-w4-fe-employees-filter-01-20260607.md` | Dev-FE | `companyFilter` → `selectedSlug`; vitest **160/160** | **Concurred** — root cause matches R3 FAIL |
| `pcomp-w4-do-avt-web-02-20260607.md` | DevOps | 11-file FE sync; Vite **200** (was 500) | **Concurred** |
| `pcomp-w4-do-avt-web-03-20260607.md` | DevOps | `Employees.tsx` PSCP; iframe mount **4** children | **Concurred** — unblocked list for R4 |
| `pcomp-w4-do-avt-file-01-20260607.md` | DevOps | GWC-AVT-01 file GET **200** | **Concurred** — prior wave; R4 img src loads |
| `pcomp-w4-profile-avatar-01-qa-web-display-r4-20260607.md` | QA | J-AVT-01 list + profile visible img | **Concurred** — L2.5 mandatory steps PASS |

**Regression arc:** R2 FAIL (blank list / partial FE) → R3 FAIL (`companyFilter` crash) → R4 PASS after FE fix + DO-03 — chain coherent; no contradictions.

---

## L2.5 — J-AVT-01 audit

| Step | Requirement | QA R4 | QC verdict |
|------|-------------|-------|------------|
| Login | `ceo@xe.vn` group scope on nip.io | PASS | **PASS** |
| Employees list | `/command-center/hrm/employees?companyId=main` embed | PASS — iframe **4** children | **PASS** |
| List row avatar | TCN-0954 visible holding `<img>` not initials | PASS — **28×28** | **PASS** |
| Profile deep link | `ecde82b7-a85f-4183-8e1a-bb3f4bcef3de?companyId=main` | PASS | **PASS** |
| Profile avatar | holding `<img>` **90×90**; **0** Radix fallbacks | PASS | **PASS** |
| Cross-nav | list → profile same employee fixture | PASS | **PASS** |

**J-AVT-01 web display:** **CLOSED** @ nip.io pilot UAT.

**J-AVT-02 mobile:** **NOT tested** — separate track per PM exit criteria.

---

## Defect / condition closure

| ID | Prior | After R4 QC |
|----|-------|-------------|
| `D-W4-AVT-DISPLAY-01` | P0 OPEN | **CLOSED** |
| `D-W4-AVT-EMPLOYEES-CRASH-01` | P0 OPEN | **CLOSED** |
| `D-W4-AVT-HRM-BLANK-01` | P1 OPEN | **CLOSED** |
| **GWC-AVT-01** (visible img) | CONDITION from `pcomp-w7-qc-avt-02` | **CLOSED** — R4 L2.5 PASS |
| **GWC-AVT-02** (top-level DTO) | CONDITION | **CLOSED** — `pcomp-w4-do-avt-file-01` + R2 API note |

---

## Carried conditions (non-blocking this slice)

| ID | Condition | Severity | Owner |
|----|-----------|----------|-------|
| **C-W4QC-AVT-MOB-01** | **J-AVT-02** mobile avatar display not gated here | Scope | `qa-device` / `dev-mobile` |
| **C-W4QC-AVT-PACK-01** | QA pack **2/8** — missing CRUD row + `## Residual` | Process | `qa` |
| **C-W4QC-JMAP-01** | **J-AVT-01** row absent in `PROGRAM_JOURNEY_MAP.md` | Governance | `pm` |
| **C-W7QC-AVT-03** | CDP file-input automation in iframe (P3) | P3 | `qa-device` |

**Reopen trigger:** list/profile revert to Radix initials on TCN-0954; `companyFilter` ReferenceError returns; iframe `#root` blank on employees list; file GET 404 regression on holding path.

---

## Promotable slice (honest)

| Item | Status |
|------|--------|
| **J-AVT-01 web display** (visible holding img list + profile) | **Promotable** @ nip.io pilot UAT |
| **J-AVT-01 embed navigation** (CC list → profile deep link) | **Promotable** |
| **D-W4-AVT-DISPLAY-01** closure | **Promotable** |
| **J-AVT-02** mobile avatar | **NOT promoted** |
| Phase 1 DONE / PROD avatar | **NOT claimed** |

---

## pm_dispatch_hint

- Mark **PCOMP-W4-QC-AVT-DISPLAY-R4** `[x]`; promote **J-AVT-01 web** in journey map citing this file + QA R4.
- Continue W4 mobile backlog (**J-AVT-02**) without blocking on web display.
- Optional: QA add CRUD/residual rows to next avatar pack for 8/8 verifier.

---

## completion_report

- Audited QA R4 L0–L2.5 on nip.io; pack verify **2/8** (process format only — not product NO-GO).
- Cross-checked FE filter fix + DO-AVT-WEB-02/03 chain; concurred with R4 browser evidence (TCN-0954 holding img list **28×28** + profile **90×90**, **0** Radix fallbacks).
- **GWC-AVT-01 display condition CLOSED** — supersedes display block in `pcomp-w7-qc-avt-02-20260607.md` for web slice.
- Issued **GO (scoped)** for bounded **J-AVT-01 web display**; **J-AVT-02 mobile** + pack/jmap carry-forwards documented.
- **NOT** Phase 1 DONE / **NOT** PROD.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: PCOMP-W4-PM-JMAP-AVT-01
from_role: pm
to_role: pm
entry_criteria: PCOMP-W4-QC-AVT-DISPLAY-R4 GO (scoped) — J-AVT-01 web display CLOSED nip.io; evidence pcomp-w4-qc-avatar-display-r4-20260607.md
exit_criteria: Add J-AVT-01 web row to docs/program/PROGRAM_JOURNEY_MAP.md (✅ PASS, cite QC R4 + QA R4); update TEAM_LIVE_STATUS / PHASE1_PRODUCT_COMPLETION_TODO W4 avatar web [x]; continue W4 mobile J-AVT-02 per backlog without blocking
evidence_path: docs/program/PROGRAM_JOURNEY_MAP.md
ack_status: PASS_TO_PM
```

Follow-on execution (same program): dispatch **qa-device** or **dev-mobile** for **J-AVT-02** when W4 mobile wave is next P0 — do not re-gate web display unless user reports regression.

## evidence_path

`docs/qa/evidence/pcomp-w4-qc-avatar-display-r4-20260607.md`

## ack_status

**PASS_TO_PM**
