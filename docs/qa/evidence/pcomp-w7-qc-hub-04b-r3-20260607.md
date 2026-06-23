# PCOMP-W7-QC-HUB-04b-R3 — W7 hub API re-gate @ nip.io (J-MOB-06/08/09)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-QC-HUB-04b-R3` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-06-07 |
| **decision** | **GO WITH CONDITIONS (reduced)** — **W7 mobile hub API slice** promotable **nip.io pilot**; **J-MOB-06/08/09 API CLOSED** holding path; **D-W7-HOME-TASKS-SLUG-01 CLOSED** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — hub-04b R3 @ nip.io)

| In scope | Out of scope |
|----------|--------------|
| `GET /api/hrm/home/summary` @ `https://14-225-217-232.nip.io` holding slug | Phase 1 DONE / `verify:product:completion` program exit |
| Includes: `tasks`, `manager_pending`, `celebrations`, `whos_out`, full hub combine | PROD cutover claim |
| Privacy BR-BDAY-02 — no DOB/birth_year in celebrations JSON | Full W7 program (04c, directory >10, offline cache) |
| whos_out BR-WHO-01 — approved-only; no `reason` in payload | `leave-requests.service` legacy uuid branch (P3) |
| Defect **D-W7-HOME-TASKS-SLUG-01** closure audit on pilot | J-AVT-02 native avatar upload (separate QC track) |

**Upstream QA:** `docs/qa/evidence/pcomp-w7-qa-hub-04b-r3-20260607.md`  
**Deploy chain:** `docs/qa/evidence/pcomp-w7-do-home-summary-01-20260607.md` (DO-HOME-SUMMARY-01-R2)  
**Prior QC (localhost):** `docs/qa/evidence/pcomp-w7-qc-04b-01-20260607.md`  
**Probe JSON:** `docs/qa/evidence/pcomp-w7-qa-04b-01-probe.json`

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/pcomp-w7-qa-hub-04b-r3-20260607.md
# exit 1 — 1/8 checks (2026-06-07 QC audit)
# FAIL: crud_or_matrix
```

**QC adjudication:** **PROCESS NOTE — not product NO-GO.** Single failure is **format / slice-appropriate** (read-only home aggregate GET; no portal CRUD matrix required). Consistent with `PCOMP-W7-QC-04b-01` ruling **C-W7QC-PACK-01**.

Material pack present: nip.io probe **15/15**, L0 `qc:fe-be-health:pilot` **8+13**, J-MOB-06/08/09 journey rows, privacy tables, classification residuals, valid handoff YAML — **auditable**.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| L0 `qc:fe-be-health:pilot` **8/8** + **13/13** (after `:28001` up) | ENV | **PASS** — first run ECONNREFUSED classified ENV, not product |
| QC spot `qc:dev-stack` **3/3** healthy | ENV | **PASS** (2026-06-07 QC) |
| nip.io route `/home/summary` registered (post DO-R2) | PRODUCT / deploy | **PASS** — no 404 on authenticated GET |
| Holding `include=celebrations` HTTP 200; 5 items MM-DD | PRODUCT / J-MOB-08 | **PASS** |
| Holding `include=whos_out` HTTP 200; 1 item; no `reason` | PRODUCT / J-MOB-09 | **PASS** |
| Holding `include=tasks` / `manager_pending` HTTP 200 (was 500) | PRODUCT / J-MOB-06 | **PASS** — **D-W7-HOME-TASKS-SLUG-01 CLOSED** |
| Full hub `tasks,manager_pending,celebrations,whos_out` → tasks_total=10 | PRODUCT / contract | **PASS** |
| Probe privacy: no `date_of_birth`, no `birth_year` | PRODUCT / BR-BDAY-02 | **PASS** — probe JSON `privacy.*` all true |
| `tmp-pcomp-w7-qa-hub-04b-probe.mjs` UUID vs slug 404 | SCRIPT | **Not product** — exit #1 uses `04b-01-probe.mjs` correctly |
| nip.io cold-start 502 | ENV | **INFO** — retry after ~90s per DevOps note |
| qa-device hub UI pixel walk J-MOB-06/07/08/09 | Scope / L2.5 device | **DEFERRED** — **C-W7QC-DEVICE-01** |
| J-AVT-02 native upload on device APK | Separate wave | **OUT OF SCOPE** — see `pcomp-w7-qc-avt-02-20260607.md` |

**Product NO-GO avoided:** Tasks slug uuid-cast regression closed on pilot; celebrations/whos_out privacy contract holds on nip.io (not localhost-only).

---

## L2.5 — J-MOB-06 / 08 / 09 audit (API layer @ nip.io)

| Journey | Requirement | QA R3 | QC verdict | Notes |
|---------|-------------|-------|------------|-------|
| **J-MOB-06** | `include=tasks` holding slug HTTP 200 | PASS | **PASS** | Was D-W7-HOME-TASKS-SLUG-01 (500) |
| **J-MOB-06** | `manager_pending` + combined hub include 200 | PASS | **PASS** | Full hub tasks_total=10 |
| **J-MOB-08** | Celebrations ≥2; MM-DD only | PASS (5) | **PASS** | Probe JSON items `06-07` |
| **J-MOB-08** | No `date_of_birth` / `birth_year` | PASS grep | **PASS** | |
| **J-MOB-09** | whos_out ≥1; approved shape | PASS (1) | **PASS** | `leave_type=annual` |
| **J-MOB-09** | No `reason` in payload | PASS | **PASS** | |
| **J-MOB-07** | Manager «Cần duyệt (n)» card | API via `manager_pending` 200 | **PASS (API)** | Device UI from MOB-UX-04a — see conditions |
| Device UI | Tap paths, banners, avatars, deep link | Not run R3 | **CONDITION** | **C-W7QC-DEVICE-01** |

**Journey map (`PROGRAM_JOURNEY_MAP.md`):** J-MOB-06/07 ✅ from MOB-UX-04a; J-MOB-08/09 ✅ API PASS citing prior QC + QA R2 — **concurred**; R3 adds **nip.io pilot** confirmation for tasks slug (map should note pilot parity when PM syncs).

---

## Privacy + tasks block audit

### Celebrations (BR-BDAY-02)

| Check | nip.io evidence | QC |
|-------|-----------------|-----|
| `date_of_birth` absent | Probe grep + JSON sample | **PASS** |
| `birth_year` absent | Probe grep + JSON sample | **PASS** |
| `month_day` / `display_date` only | 5 items `06-07` / `07/06` | **PASS** |
| `avatar_url` optional null or file path | Sample mix null + `/api/hrm/files/...` | **PASS** — no DOB leak vector |

### whos_out (BR-WHO-01)

| Check | nip.io evidence | QC |
|-------|-----------------|-----|
| HTTP 200 holding slug | QA table + probe | **PASS** |
| Item fields: `leave_request_id`, `employee_id`, `display_name`, `leave_type` | Probe JSON | **PASS** |
| No `reason` key | QA + probe | **PASS** |

### tasks / manager_pending (J-MOB-06/07 API)

| Check | nip.io evidence | QC |
|-------|-----------------|-----|
| `include=tasks` alone → 200 | QA Exit #4 table | **PASS** |
| `include=manager_pending` → 200 | QA Exit #4 table | **PASS** |
| Combined with celebrations/whos_out → 200 | QA + tasks_total=10 | **PASS** |
| No uuid cast on `company_id=holding` | Defect no longer reproduces | **PASS** — **D-W7-HOME-TASKS-SLUG-01 CLOSED** |

Cross-check probe JSON (`pcomp-w7-qa-04b-01-probe.json`): `pass: true`, **15/15** probes, `holding_sample.privacy` all true — **concurred** with QA R3 nip.io retest narrative.

---

## Conditions (bounded)

| ID | Condition | Severity | Owner | Trigger to close |
|----|-----------|----------|-------|------------------|
| **C-W7QC-DEVICE-01** | qa-device hub UI walk — J-MOB-06/07/08/09 tap paths @ nip.io emulator | P2 / GWC | `qa-device` | `PCOMP-W7-QA-DEVICE-04b` with `uat.nv0001@xe.vn` |
| **C-W7QC-PACK-01** | QA pack missing CRUD/R matrix row for verifier 8/8 | Process | `qa` | Minimal R row in next W7 QA pack |
| **C-W7QC-JMAP-02** | Journey map should cite nip.io R3 for J-MOB-06 tasks slug pilot closure | Governance | `pm` | Update J-MOB-06 row with R3 evidence link |
| **C-W7QC-AVT-02** | J-AVT-02 native avatar upload not on hub APK track | P1 separate | `dev-mobile` + `qa-device` | Per `pcomp-w7-qc-avt-02-20260607.md` — not blocking hub API slice |
| **C-W7QC-SCRIPT-01** | `hub-04b-probe.mjs` uses company UUID not slug | P3 | `qa` | Set `company_id=holding` in script |

**Reopen trigger:** Holding tasks/celebrations/whos_out returns 500/409 on nip.io; celebrations JSON contains DOB/birth_year; whos_out includes `reason` or non-approved; tasks slug uuid-cast regression.

---

## Promotable slice (honest)

| Item | Status |
|------|--------|
| **W7 hub API slice** @ nip.io pilot (`14-225-217-232.nip.io`) | **Promotable** |
| **J-MOB-06 API** — tasks/manager_pending holding slug | **CLOSED** @ nip.io |
| **J-MOB-08 API** — celebrations + privacy | **CLOSED** @ nip.io |
| **J-MOB-09 API** — whos_out approved-only | **CLOSED** @ nip.io |
| **D-W7-HOME-TASKS-SLUG-01** | **CLOSED** @ nip.io |
| **D-W7-HOME-WHOS-SLUG-01** | **CLOSED** (reaffirmed from prior wave) |
| Mobile hub device L2.5 (UI pixels, deep link tap) | **NOT promoted** — C-W7QC-DEVICE-01 |
| J-AVT-02 device native upload | **NOT promoted** — separate track |
| Phase 1 DONE / PROD mobile home hub | **NOT claimed** |

---

## QC spot-check (Layer C)

```bash
pnpm run qc:dev-stack
# exit 0 — hrm-api + xbos-api + portal 200 (2026-06-07 QC)

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/pcomp-w7-qa-hub-04b-r3-20260607.md
# exit 1 — 1/8 (crud_or_matrix only)
```

Independent read: `pcomp-w7-qa-04b-01-probe.json` — celebrations/whos_out/privacy aligned with QA R3 tables; tasks closure documented in QA R3 Exit #4 (not in 15-probe JSON — acceptable slice split).

---

## Handoff

```yaml
completion_report: |
  Re-gated PCOMP-W7-QA-HUB-04b-R3 post DO-HOME-SUMMARY-01-R2 nip.io deploy. Evidence pack 1/8 (crud matrix format — process GWC).
  Audited probe 15/15 + QA tasks/manager_pending tables + privacy grep on nip.io holding path.
  J-MOB-06/08/09 API PASS; D-W7-HOME-TASKS-SLUG-01 CLOSED on pilot; whos_out/celebrations privacy contract holds.
  Decision: GO WITH CONDITIONS (reduced) — hub API slice promotable nip.io pilot; device UI + J-AVT-02 remain deferred; NOT Phase 1 DONE / NOT PROD.

next_owner: pm

next_dispatch_prompt: |
  work_item_id: PCOMP-W7-PM-HUB-CLOSE
  from_role: qc
  to_role: pm
  entry_criteria: QC GWC PCOMP-W7-QC-HUB-04b-R3 — docs/qa/evidence/pcomp-w7-qc-hub-04b-r3-20260607.md;
    J-MOB-06/08/09 API CLOSED nip.io; D-W7-HOME-TASKS-SLUG-01 closed; hub API slice promotable pilot.
  exit_criteria: Sync PROGRAM_JOURNEY_MAP J-MOB-06 row with R3 nip.io evidence; mark hub-04b API lane done in
    PHASE1_PRODUCT_COMPLETION_TODO; dispatch qa-device C-W7QC-DEVICE-01 OR advance W7 next item (MOB-UX-04c).
    Bus INTAKE + TEAM_WORKING_NOW update.
  evidence_path: docs/qa/evidence/pcomp-w7-qc-hub-04b-r3-20260607.md
  ack_status: PASS_TO_PM

evidence_path: docs/qa/evidence/pcomp-w7-qc-hub-04b-r3-20260607.md
ack_status: PASS_TO_PM
```
