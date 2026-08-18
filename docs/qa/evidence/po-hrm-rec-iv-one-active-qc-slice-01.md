# Evidence — `PO-HRM-REC-IV-ONE-ACTIVE-QC-SLICE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-REC-IV-ONE-ACTIVE-QC-SLICE-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-06 |
| **lane** | L3 execution — narrow **REC-IV one-active** browser slice only |
| **parent** | `PO-HRM-REC-IV-ONE-ACTIVE-QA-02-R4` PASS_TO_PM |
| **portal_url** | `http://127.0.0.1:5173` · `/command-center/hrm/recruitment?tab=candidates` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Verdict** | **GO WITH CONDITIONS** — **REC-IV one-active browser slice only** |
| **ack_status** | `PASS_TO_PM` |
| **U65** | zero-seed · browser-primary · QC observe-only · mutates via FE schedule only (no API pre-cancel / no seed) |
| **spec_ref** | `FR-UC-BP-REC-06a` · AC-01 browser POST · AC-02 badge/F5 · AC-03 duplicate 409 toast |
| **OS honesty** | `C-SLICE-≠-MODULE` — slice GWC ≠ recruitment module UAT |

### Honesty locks (mandatory — all false / denied)

| Flag | Value |
|------|-------|
| **recruitment_uat_ready** | **false** |
| **jd_dynamic_done** | **false** |
| **product_go** | **false** |
| **remaster_program_done** | **false** |
| **Phase 1 DONE** | **false** / **NOT claimed** |
| **Module UAT recruitment** | **NOT certified** — prior process NO-GO [`po-hrm-rec-ux-qc-process-01.md`](po-hrm-rec-ux-qc-process-01.md) **retained** |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT seal for **REC-IV one-active browser lane** on candidate **Tuấn** (`tuanna@unicomhub.com`) only:

1. **AC-01** — Browser `POST /api/hrm/recruitment/interviews` **201** `HRM-REC-203` then duplicate **409** `HRM-REC-IV-409-ACTIVE` (not blocked by date validation)
2. **AC-02** — Badge «Đã có lịch» + vi-VN datetime `07/08/2026 09:00` · **F5 persist** (`f5BadgePersists=true`)
3. **AC-03** — Sonner toast friendly duplicate message («đang hiệu lực» / «đã có lịch»)
4. **P1 carry closure** — `REC-IV-BROWSER-SCHEDULE-POST-P1` + `REC-IV-BROWSER-409-TOAST-P1` **CLOSED** (R3 → R4 delta)
5. **Console OBS** — 2 expected handled-409 logs (**waived P2** — see Residual)

**Conditions (explicit NON-CERTIFIED):**

- **NOT** recruitment module UAT-ready (`recruitment_uat_ready=false`)
- **NOT** full J-HRM-05 recruitment CRUD / requisition / JD / compare / cancel-complete lifecycle
- **NOT** promote prior JD-dynamic GWC or plan-console GWC as «tuyển dụng chạy được»
- Prior process **NO-GO** for module certification **remains**

---

## Entry audit (FE + QA chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| BE-03 spine bridge | [`po-hrm-rec-iv-one-active-be-03.md`](po-hrm-rec-iv-one-active-be-03.md) | READY (R3) | **ACCEPT** — pool↔spine email merge · badge projection |
| Dev-FE FIX | [`po-hrm-rec-iv-browser-schedule-post-fe-01.md`](po-hrm-rec-iv-browser-schedule-post-fe-01.md) | READY_FOR_QA | **ACCEPT** — default date + Sonner + submit testid |
| QA R3 baseline | [`po-hrm-rec-iv-one-active-qa-02-r3.md`](po-hrm-rec-iv-one-active-qa-02-r3.md) | PASS_TO_PM | **ACCEPT** P0 spine · carry P1 documented |
| QA R4 retest | [`po-hrm-rec-iv-one-active-qa-02-r4.md`](po-hrm-rec-iv-one-active-qa-02-r4.md) | PASS_TO_PM | **ACCEPT** in-scope AC matrix 🟢 |

### Machine JSON spot (R4)

| Artifact | Present | QC spot |
|----------|---------|---------|
| [`_tmp-po-hrm-rec-iv-one-active-qa-02-r4.json`](_tmp-po-hrm-rec-iv-one-active-qa-02-r4.json) | ✅ | `postCreates` 201+409 · `conflictToast` populated · `f5BadgePersists: true` · `pageErrors: 0` · `consoleErrors: 2` (handled 409) |
| Screenshots `po-hrm-rec-iv-one-active-qa-02-r4/` | ✅ on disk | QA cites 01–05 — not re-spotted visually (observe-only) |

**Ack honesty note:** JSON `ac["AC-05-console-clean"]="FAIL"` + `overall="FAIL_TO_PM"` vs QA MD **PASS (OBS)** on console — QC **ACCEPT QA MD product classification** for slice; JSON overall field is **stale vs human verdict** (process OBS P3).

---

## AC matrix (slice scope — QC audit)

| AC | Expected | R4 observed | QC |
|----|----------|-------------|-----|
| **AC-01 Schedule POST** | Browser `POST /interviews` **201** or **409**; not VAL-001 blocked | First **201** `HRM-REC-203` · duplicate **409** `HRM-REC-IV-409-ACTIVE` | **PASS** |
| **AC-02 Badge + F5** | «Đã có lịch» + `dd/MM/yyyy HH:mm` · reload persist | Badge `07/08/2026 09:00` · `f5BadgePersists=true` | **PASS** |
| **AC-03 Duplicate toast** | Sonner friendly `HRM-REC-IV-409-ACTIVE` | Toast «…đang hiệu lực…» captured | **PASS** |
| **AC-04 Cancel/complete→create** | Lifecycle after cancel/complete | API PASS in R3 session JSON — **not re-exercised** in R4 browser harness | **deferred** (out of slice) |
| **AC-05 Console** | No Uncaught / no page errors | `pageErrors=0` · 2× expected 409 network + `console.error` in catch | **PASS (OBS waived P2)** |
| **recruitment_uat_ready** | Must stay **false** | false in QA + JSON | **Denied** — honesty lock |

**Score:** 3/3 in-scope browser AC **PASS** · 1 deferred · 1 OBS waived · module flags **not promoted**.

---

## L2.5 J-* audit (U19 — candidates schedule slice only)

| Journey | Scope vs this seal | QC |
|---------|-------------------|-----|
| **J-HRM-05** Tuyển dụng → ứng viên | Candidates list → Tuấn row → schedule dialog → POST 201/409 → badge + F5 · duplicate toast | **PASS** (**REC-IV one-active slice only**) · **NOT** full requisition/JD/compare/DnD |
| **J-REC-WF-04** Roadmap step sync | Out of slice | **deferred** |
| Interview Schedule locale / shell chrome | Prior sponsor defects | **NOT cleared** by this slice — process NO-GO retained |

Mandatory for this gate: browser mutate path on one-active rule + honesty denials. **Not** invent module UAT.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | AC-01 browser POST 201+409 · AC-02 badge vi-VN + F5 · AC-03 Sonner toast — **ACCEPT** after FE-01 + BE-03 chain |
| **PRODUCT (waived P2)** | Expected duplicate **409** → browser network log + `console.error` in `ScheduleInterviewDialog` catch while toast shown — **not blocking** slice GWC per dispatch waiver |
| **PROCESS** | QA seat pack `verify:qc:evidence-pack` **FAIL 3/8** (`journey_l25` · `residual_section` · `timestamp`) — **OBS only**; QC consolidated pack carries J-HRM-05 + Residual + date |
| **PROCESS** | JSON `overall=FAIL_TO_PM` vs QA MD PASS on AC-05 — **OBS P3**; recommend QA align machine `overall` with slice verdict |
| **ENV** | None — L0 `qc:fe-be-health` ALL PASS (`:28001` · `:28002` · `:5173`) |
| **OUT-OF-SCOPE** | Module recruitment UAT · JD dynamic/remaster · DnD storm · mojibake · duplicate shell header · `GET /recruitment/interviews` list · cancel/complete browser UF · Phase 1 DONE |

ENV does not drive NO-GO. Process pack-field gaps on QA seat ≠ product demote when QC consolidates J-* + matrix.

---

## Residual

| Item | Sev | Owner | Blocks slice GWC? |
|------|-----|-------|-------------------|
| `REC-IV-CONSOLE-409-OBS` — suppress `console.error` for known `HRM-REC-IV-409-ACTIVE` when Sonner maps friendly message | **P2** | dev-fe (optional) | **No** — **waived** for slice |
| `REC-IV-NO-LIST-INTERVIEWS-P2` — no `GET /recruitment/interviews` list; cancel flow uses 409 `active_interview_id` details | **P2** | dev-be | **No** — parallel |
| Module recruitment UAT-ready | P0 program honesty | pm / qc process | **No** for slice — **still false** |
| Prior process NO-GO module cert | — | retained | N/A — honesty lock |
| QA seat pack format (journey/residual/timestamp) | P3 process | qa | **No** — OBS |
| QA JSON `overall` vs MD ack mismatch | P3 process | qa | **No** — OBS |

**No product P0/P1 residual** on REC-IV one-active browser slice → **idle-ok** for this narrow lane.

### Not promoted (explicit)

- `recruitment_uat_ready` / module GO
- `REC-IV-NO-LIST-INTERVIEWS-P2` (still open P2)
- Full **J-HRM-05** beyond schedule-one-active on Tuấn
- **J-REC-WF-*** / cancel-complete browser UF
- JD dynamic / remaster / product GO / Phase 1 DONE
- Prior **process NO-GO** overturn on recruitment module certification

---

## Gate commands (QC)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-rec-iv-one-active-qa-02-r4.md
→ FAIL process 3/8 · journey_l25 + residual_section + timestamp — PROCESS OBS only

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-rec-iv-one-active-qc-slice-01.md
→ PASS 8/8 (QC consolidated pack · sealed 2026-08-06)
```

| Check | Result |
|-------|--------|
| `verify:qc:evidence-pack` QA seat R4 | **FAIL process** 3/8 — OBS |
| `verify:qc:evidence-pack` QC pack (this file) | **PASS** 8/8 |
| Unit corroboration FE 14/14 | **PASS** (cited QA) |
| L0 `qc:fe-be-health` | **PASS** (cited QA) |
| Browser POST 201+409 + toast + F5 | **PASS** (JSON spot) |
| Module UAT claim | ❌ absent — ACCEPT honesty |

---

## completion_report

- **Closed:** Narrow **GO WITH CONDITIONS** for REC-IV one-active browser lane — AC-01 POST 201/409 · AC-02 badge+F5 · AC-03 Sonner toast audited via R4 QA MD + machine JSON; P1 browser POST/toast carry **CLOSED**; expected 409 console OBS **waived P2**; honesty denials stamped; prior module process NO-GO **retained**.
- **Open / residual:** optional P2 console.error suppress; `REC-IV-NO-LIST-INTERVIEWS-P2`; `recruitment_uat_ready=false`; QA pack format P3 OBS.
- **NOT claimed:** module UAT · product GO · Phase 1 DONE · full J-HRM-05 · JD/remaster.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-REC-IV-ONE-ACTIVE-QC-SLICE-01 → INTAKE
role: pm
ack: PASS_TO_PM
verdict: GO WITH CONDITIONS — REC-IV one-active browser slice ONLY
evidence: docs/qa/evidence/po-hrm-rec-iv-one-active-qc-slice-01.md
facts:
  - AC-01 browser POST 201+409 · AC-02 badge+F5 · AC-03 Sonner toast PASS on Tuấn
  - P1 REC-IV-BROWSER-SCHEDULE-POST + 409-TOAST CLOSED (R3→R4)
  - console 409 OBS waived P2 · pageErrors=0 · no Uncaught
  - recruitment_uat_ready=false · prior process NO-GO po-hrm-rec-ux-qc-process-01 RETAINED
cấm: promote slice GWC to recruitment UAT-ready / module GO / Phase1 DONE
next_wave (pick one — do NOT re-open slice unless regression):
  1) optional dev-fe P2: suppress console.error for HRM-REC-IV-409-ACTIVE when toast shown
  2) dev-be P2: REC-IV-NO-LIST-INTERVIEWS list endpoint / cancel UX
  3) continue broader recruitment program lanes (JD/header/console process backlog)
```

## evidence_path

- `docs/qa/evidence/po-hrm-rec-iv-one-active-qc-slice-01.md`
- Audit inputs: `docs/qa/evidence/po-hrm-rec-iv-one-active-qa-02-r4.md` · `docs/qa/evidence/_tmp-po-hrm-rec-iv-one-active-qa-02-r4.json`

## ack_status

**PASS_TO_PM**
