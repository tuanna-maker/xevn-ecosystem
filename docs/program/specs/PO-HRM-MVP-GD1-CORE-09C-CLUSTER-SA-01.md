# PO-HRM-MVP-GD1-CORE-09C-CLUSTER-SA-01 — Option/F.1 · Lưu phiên bản và in / PDF HĐLĐ — ADD

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09C-CLUSTER-SA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock BA AC → (ba-data HOLD default) → API residual only if BA proves gap → Dev |
| **depends_on** | QC-01 GWC Wave-14 UC-BP-CORE-09b **SEALED** — stamp `CORE09BQC1-MSLB05DZ` · evidence `docs/qa/evidence/po-hrm-mvp-gd1-core-09b-cluster-qc-01.md` · peer QA `CORE09BQA-MSLAWKV6` · `ver_insert_posts=0` · printable **false** |
| **uc_ids** | `UC-BP-CORE-09c` |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#17** after CORE-09b (#16 SEALED) |
| **ref_sa_spine** | Peer pack+PREV [`PO-HRM-MVP-GD1-CORE-09B-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-09B-CLUSTER-SA-01.md) · clause [`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-09A-CLUSTER-SA-01.md) · RD [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01.md) · C&B [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md) · public [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md) · print spine [`PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md) **E.3** · TECHSPEC [`PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md) **§9 F-CORE-CTR-VER/PDF** — **reuse · DENY reopen sealed J-HRM-CORE-09B-01..04 / J-HRM-CORE-09A-01..04 / J-HRM-CORE-08-* / J-HRM-CORE-02-* / J-HRM-CORE-01-* without regression** |
| **ref_honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · **`contracts_printable_ready=false`** · personnel / CORE / CTR module UAT **false** · 16 program honesty flags **false** · **DENY claim CORE-09b pack+preview = printable DONE** · **DENY invent 09d TPL catalog as this seat DONE** · carry OBS **`R-QA-CORE-09B-CLAUSE-FP-EMPTY`** → peer **09d** (idle-ok this seat) |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-09c** · Diễn biến **#1–#5** · **BR-CTR-CL-01** · **BR-CTR-CL-02** · **BR-CTR-CL-04** · **AC-CTR-PRINT-01** · **04** · **05** · **06** · **08** · peers CORE-09 · 09a · 09b (**must_keep**) · 09d **OUT invent this seat** |
| **ref_paper_api** | `API_DESIGN` / TECHSPEC **F-CORE-CTR-VER-01** · **F-CORE-CTR-VER-02** · **F-CORE-CTR-PDF-01** · RETAIN **F-CORE-CTR-PACK-01** · **F-CORE-CTR-PREV-01** (ephemeral) · RETAIN **F-CORE-CTR-CL-01..04** · peers **F-CORE-CTR-TPL** **OUT invent DONE** as 09d this seat |
| **ref_code** | `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.controller.ts` (`POST/GET …/contracts/:id/print-versions*` · `GET …/print-versions/:versionId/pdf`) · `contract-legal-print.service.ts` (`createPrintVersion` · `listPrintVersions` · `getPrintVersionById` · `renderPrintVersionPdf` · re-run `previewContract` + `can_issue` gate) · `contract-print-pdf.renderer.ts` (pdfkit from snapshot) · table `hrm_contract_print_versions` |
| **OUT** | Invent **09d** open TPL catalog DONE · Nest `/core` dual VER/PDF SoT · reopen rewrite CORE-09b PREV to INSERT VER · reopen rewrite CORE-09a CL · claim CORE-09b = printable · flip `contracts_printable_ready` / recruitment / jd / module CORE·CTR·personnel UAT · seed · honesty flip |
| **Honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · **`contracts_printable_ready=false`** · **C-SLICE** · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-15 architecture unlock: **issued print-version persist + PDF/print of HĐLĐ** vs AS-IS Nest VER INSERT path + PDF renderer |
| **Requestor** | PM · program `PO-HRM-MVP-GD1-CONTINUOUS` · U89 after CORE-09b QC-01 GWC (`CORE09BQC1-MSLB05DZ`) |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-CORE-09c · AC-CTR-PRINT-04/05 (+ 01/06/08 regression) · F-CORE-CTR-VER-01/02 · F-CORE-CTR-PDF-01 · must_keep CORE-09b F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 ephemeral physical `/contracts-insurance/contracts*` · must_keep CORE-09a F-CORE-CTR-CL-01..04 · CORE-08 RD+payroll_link · CORE-02 AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY · U19 scope_parity · snapshot freeze BR-CTR-CL-01 · `can_issue` gate from CORE-09b |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **CORE-09b SEALED (`CORE09BQC1-MSLB05DZ`):** pack-resolve + **ephemeral** `POST …/preview` · `ver_insert_posts=0` · Nest `/core` 0 · **printable false** · **≠** module CORE/CTR UAT · **≠** claim CORE-09a printable · OBS **`R-QA-CORE-09B-CLAUSE-FP-EMPTY`** (IT/DRIVER empty `clause_ids`) → **peer 09d** idle-ok. **VER + PDF AS-IS (Nest PRESENT):** (1) Table `hrm_contract_print_versions` (`version_no` · `pack_code` · `template_*` · `merged_fields_json` · `clauses_snapshot_json` · `compensation_snapshot_json` · `status` issued/superseded · `issued_at`/`issued_by` · `pdf_artifact_ref`). (2) `POST /api/hrm/contracts-insurance/contracts/:contractId/print-versions` → **re-run** `previewContract` server-side · if `!can_issue` → `HRM-CTR-ISSUE-BLOCKED` / DRIVER / TERM · else supersede prior `issued` → INSERT `status=issued` freeze snapshots · denorm pack/template on `employee_contracts` · `HRM-CTR-VER-201`. (3) `GET …/print-versions` + `GET …/print-versions/:versionId` → F5 list/detail. (4) `GET /api/hrm/contracts-insurance/print-versions/:versionId/pdf` → pdfkit from **snapshot only** (not live library) · `application/pdf` · `?format=html` debug. (5) **No** Nest `@Controller('core')` VER/PDF SoT. (6) Preview path **must remain** ephemeral (CORE-09b must_keep — DENY rewrite PREV to INSERT VER). |
| **Paper target** | FR-UC-BP-CORE-09c: từ preview đủ điều kiện → **Lưu phiên bản** (ảnh chụp + gói + phiên bản điều khoản) → list/detail cập nhật → **In / Tải PDF** khớp preview đã lưu → F5 còn → phụ lục = phiên bản mới (không ghi đè im lặng). Không claim module printable UAT / 09d TPL catalog DONE; không thay sổ đăng ký CRUD. |
| **Gap class** | **fidelity / AC-FE residual on LIVE VER+PDF spine** — **not** greenfield dual: (1) board #17 needs GĐ1 Option lock + BA AC for U65 save→F5→PDF path; (2) risk invent Nest `/core` dual or claim CORE-09b pack+preview GWC = printable DONE; (3) risk invent 09d TPL catalog as this seat DONE; (4) conflate LIVE VER API = FR-09c DONE without BA AC / PDF-match-preview / amend-supersede journeys; (5) reopen rewrite PREV to issue or reopen CORE-09a CL; (6) flip `contracts_printable_ready` / module CTR UAT prematurely. |
| **Constraints** | U89 continuous · **preserve** CORE-09b pack+ephemeral PREV · CORE-09a clause library + snapshot freeze · CORE-08 RD + payroll_link · CORE-02 packages/eins + AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY · REC seals · C-SLICE · DENY claim CORE-09b = printable DONE · DENY invent 09d TPL as DONE · DENY seed · **cấm code until Option CONFIRMED** · carry clause-empty OBS → **09d** (not invent TPL DONE here) |
| **Failure impact if unresolved** | Board #17 stalls; Dev invents `/core` dual or folds TPL into 09c; honesty flip; regression CORE-09b/09a/08/02/01; silent overwrite issued snapshots |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-CORE-01 (SEALED)     UC-BP-CORE-02 (SEALED)     UC-BP-CORE-08 (SEALED)
  /employees* public         compensation-packages*     /rewards*+/discipline*
  HRM-CORE-CB-403            AuthZ-403 · CB-403         payroll_link
  Nest /core DENY            Nest /core DENY            Nest /core DENY
       │                            │                          │
       └──────────── must_keep ─────┴──────────────────────────┘
                                         │
  UC-BP-CORE-09a (SEALED)          UC-BP-CORE-09b (SEALED)
  /contract-clauses*               GET pack-resolve · POST …/preview
  body SoT · snapshot freeze       ephemeral · can_issue · cb_masked
  Nest /core DENY                  NO VER INSERT · Nest /core DENY
       │                                  │
       └──────── must_keep ───────────────┘
                         │
                         ▼
  ┌──────────────── FR-UC-BP-CORE-09c (this seat) ──────────────────────────────┐
  │                                                                               │
  │  F-CORE-CTR-VER-01 RETAIN physical                                            │
  │    POST /api/hrm/contracts-insurance/contracts/:id/print-versions             │
  │    → re-run PREV validation (server) · !can_issue → ISSUE-BLOCKED             │
  │    → INSERT issued · freeze merged_fields + clauses_snapshot + comp snap      │
  │    → prior issued → superseded · denorm pack/template on employee_contracts   │
  │                                                                               │
  │  F-CORE-CTR-VER-02 RETAIN physical                                            │
  │    GET …/print-versions · GET …/print-versions/:versionId                     │
  │    → F5 list/detail · display-ready version_no · pack_code · status           │
  │                                                                               │
  │  F-CORE-CTR-PDF-01 RETAIN physical                                            │
  │    GET /api/hrm/contracts-insurance/print-versions/:versionId/pdf             │
  │    → render from SNAPSHOT only (DENY live-library re-merge) · pdfkit          │
  │    → must match issued preview content (AC-CTR-PRINT-05)                      │
  │                                                                               │
  │  Gate lock (from CORE-09b — must_keep)                                        │
  │    can_issue=false → DENY VER INSERT · list missing_* (AC-CTR-PRINT-06)       │
  │    0 template → TPL-NONE · DENY fake issue (AC-CTR-PRINT-01 · BR-CTR-CL-04)   │
  │                                                                               │
  │  Snapshot lock (from CORE-09a — must_keep)                                    │
  │    clauses_snapshot_json freeze at issue · amend = NEW version (BR-CTR-CL-01) │
  │    PREV remains ephemeral — DENY reopen rewrite PREV→INSERT VER               │
  │                                                                               │
  │  Registry lock (AC-CTR-PRINT-08)                                              │
  │    employee_contracts CRUD RETAIN — VER/PDF ADD-only overlay                  │
  │                                                                               │
  │  RETAIN: CORE-09b PACK+PREV · CORE-09a CL · CORE-08 · CORE-02 · CORE-01       │
  │          Nest /core DENY                                                      │
  └───────────────────────────────────────────────────────────────────────────────┘
       │
       │  OUT this seat (peer board #18)
       ▼
  F-CORE-CTR-TPL catalog invent DONE   = UC-BP-CORE-09d
  Carry R-QA-CORE-09B-CLAUSE-FP-EMPTY  = peer 09d (not invent TPL DONE here)
  Flip contracts_printable_ready       = DENY this SA seat (QA/QC later only)

  DENY: Nest /core dual VER/PDF · claim CORE-09b = printable DONE
  DENY: invent 09d TPL catalog as CORE-09c DONE · reopen sealed J-09B/09A/08/02/01
  Honesty: C-SLICE ≠ recruitment_uat_ready · ≠ jd_dynamic_done · ≠ CORE/CTR UAT
```

**Label lock:** «Lưu phiên bản và in / PDF hợp đồng» = **issued VER persist + PDF from snapshot** — **not** ephemeral preview rewrite; not open template catalog invent; not clause-library reopen; not pack-resolve rewrite.  
**Spine lock:** Physical prefer `/api/hrm/contracts-insurance/contracts/:id/print-versions*` + `/api/hrm/contracts-insurance/print-versions/:versionId/pdf` — any paper `/core/…` path = **alias only** — **DENY** Nest `/core` second SoT.  
**Issue lock:** VER INSERT **MUST** re-run server preview + honor `can_issue` from CORE-09b — **DENY** FE-trusted issue.  
**PDF lock:** Render from **issued snapshot** only — **DENY** re-merge live library at print time (BR-CTR-CL-01).  
**Preview lock:** CORE-09b `POST …/preview` **MUST remain** ephemeral — **DENY** reopen rewrite PREV to INSERT VER.  
**Honesty lock:** Slice GWC later **≠** auto-flip `contracts_printable_ready=true` without named QA printable U65 · **≠** module CORE/personnel/CTR UAT · **≠** claim CORE-09b = printable DONE · **≠** invent 09d TPL DONE.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / API) | AS-IS LIVE | Verdict |
|------------|-------------------|------------|---------|
| Save print version | F-CORE-CTR-VER-01 · 09c #1/#5 | `POST …/print-versions` + `can_issue` gate + snapshot INSERT | **RETAIN** |
| Re-validate on issue | TECHSPEC §9.1 | `createPrintVersion` → `previewContract` | **RETAIN** must_keep |
| Supersede prior issued | BR-CTR-CL-01 · 09c #5 | UPDATE prior `issued` → `superseded` | **RETAIN** |
| List/get versions F5 | F-CORE-CTR-VER-02 · 09c #3/#4 | `GET …/print-versions*` | **RETAIN** |
| PDF from snapshot | F-CORE-CTR-PDF-01 · 09c #2 · AC-CTR-PRINT-05 | `GET …/print-versions/:id/pdf` pdfkit | **RETAIN** / fidelity UPGRADE |
| Block issue when missing | AC-CTR-PRINT-06 · BR-CTR-CL-02 | `HRM-CTR-ISSUE-BLOCKED` + DRIVER/TERM | **RETAIN** |
| 0 template block | AC-CTR-PRINT-01 · BR-CTR-CL-04 | `HRM-CTR-TPL-NONE` via preview | **RETAIN** |
| Pack+ephemeral PREV | CORE-09b F-PACK/PREV | SEALED · `ver_insert_posts=0` | **must_keep RETAIN** — **no reopen rewrite** |
| Clause library SoT | CORE-09a | `/contract-clauses*` SEALED | **must_keep RETAIN** |
| Snapshot freeze | BR-CTR-CL-01 | `clauses_snapshot_json` on VER | **must_keep** |
| Registry CRUD | AC-CTR-PRINT-08 | Contracts CRUD LIVE | **must_keep RETAIN** |
| C&B ACL on snapshots | AC-CTR-PRINT-07 / CORE-02 | `can_view_cb` / mask on display | **RETAIN** must_keep |
| Open TPL catalog 09d | 09d F-CORE-CTR-TPL | LIVE peer / empty clause_ids OBS | **OUT invent DONE** — carry OBS to 09d |
| Nest `/core` VER/PDF | paper alias? | **DENY** dual | **DENY** |
| Module / honesty | program | C-SLICE | **DENY flip** · **DENY claim 09b=printable** |

---

## 3. Options

### Option A — ACCEPT_AS_IS_RETAIN: LIVE VER INSERT + list/get + PDF-from-snapshot + can_issue gate (RECOMMENDED)

| | |
|--|--|
| **Description** | **Preserve** CORE-09b F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 on physical `/contracts-insurance/contracts*` (**ephemeral** PREV — **no reopen rewrite** to INSERT VER) · CORE-09a F-CORE-CTR-CL-01..04 + snapshot freeze · CORE-08 rewards/discipline + payroll_link · CORE-02 packages/eins + AuthZ-403 + CB-403 · CORE-01 public strip · Nest `/core` DENY. **Preserve** LIVE Nest **F-CORE-CTR-VER-01** (`POST …/contracts/:id/print-versions`) + **F-CORE-CTR-VER-02** (list/get) + **F-CORE-CTR-PDF-01** (`GET …/print-versions/:versionId/pdf`) as **single issued-print SoT**. **LOCK issue path:** server re-runs preview · `!can_issue` → 400 + missing lists (`HRM-CTR-ISSUE-BLOCKED` / DRIVER / TERM / TPL-NONE) · INSERT `issued` with frozen `merged_fields_json` + `clauses_snapshot_json` (+ compensation snapshot when ACL) · prior issued → `superseded` · denorm pack/template on registry. **LOCK PDF:** render from issued snapshot only (pdfkit) — **DENY** live-library re-merge. **LOCK registry:** employee_contracts create/edit/F5 **RETAIN** (AC-CTR-PRINT-08). Paper `/core/…` = **alias / DOC-DELTA only**. **OUT** invent 09d TPL catalog **as this seat DONE** — carry `R-QA-CORE-09B-CLAUSE-FP-EMPTY` to peer 09d. **DENY** claim CORE-09b = printable DONE · reopen sealed J-HRM-CORE-09B-01..04 / J-HRM-CORE-09A / 08/02/01 · flip `contracts_printable_ready` in this SA seat. |
| **Benefits** | Aligns FR-09c + F-CORE-CTR-VER/PDF + LIVE code; zero dual SoT; unlocks U89 #17 BA without greenfield; preserves W10–W14 must_keep; clear peer boundary to 09d; snapshot immutability + can_issue continuity from 09b |
| **Costs** | BA AC pack (O1–O12) + U65 FE residual if save/PDF UX gap vs AC-CTR-PRINT-04/05; DOC-DELTA path cite if paper alias; ba-data HOLD default (table LIVE) |
| **Risks** | Dev invents Nest `/core` dual or folds TPL into 09c — **mitigate:** DENY + O8. Claims CORE-09b=printable / flips ready — **mitigate:** O9/O10. PDF re-merges live clauses — **mitigate:** O3 + QA AC-05 |

### Option B — Greenfield Nest `/core` dual · OR wipe VER/PDF for second engine · OR invent 09d TPL catalog as CORE-09c DONE · OR rewrite PREV to INSERT VER

| | |
|--|--|
| **Description** | Implement paper `/api/hrm/core/…/print-versions` as primary Nest SoT; **or** treat open TPL catalog + clause-empty fix as “print DONE”; **or** change CORE-09b preview to persist issued versions; **or** wipe LIVE `hrm_contract_print_versions` for a second store. |
| **Benefits** | Paper path fidelity / one-seat mega delivery illusion |
| **Costs** | Dual writers · board #18 collapse · Nest `/core` DENY break · U89 delay · breaks ephemeral PREV seal · printable honesty break |
| **Risks** | Snapshot/issue regression · CORE-09b/09a/08/02/01 regression · honesty flip — **REJECT** |

### Option C — HOLD / LIVE VER = FR-09c DONE / CORE-09b = printable / honesty flip / reopen sealed

| | |
|--|--|
| **Description** | Treat LIVE VER/PDF API or CORE-09b GWC as FR-UC-BP-CORE-09c complete without BA AC; or HOLD board; or flip `contracts_printable_ready` / recruitment / personnel UAT; or reopen sealed J-HRM-CORE-09B-01..04 / J-HRM-CORE-09A / 08/02/01. |
| **Benefits** | Short-term idle |
| **Costs** | AC-CTR-PRINT-04/05 unmet (save F5 / PDF match); board #17 false DONE or stuck; violates U89 + honesty |
| **Risks** | C-SLICE violation · sponsor idle — **REJECT** |

---

## 4. Trade-off Matrix

| Criteria | Weight | Option A | Option B | Option C |
|----------|-------:|:--------:|:--------:|:--------:|
| Business value (FR-CORE-09c + AC-CTR-PRINT-04/05) | 25 | **9** | 5 | 2 |
| Time to deliver (U89 continuous) | 20 | **9** | 2 | 1 |
| Complexity / blast radius | 15 | **9** | 2 | 6 |
| Security / snapshot freeze + CORE-01·02·08·09a·09b + U19 | 15 | **9** | 3 | 2 |
| Reliability (ONE VER SoT · can_issue · no PREV rewrite) | 15 | **9** | 2 | 2 |
| Maintainability (RETAIN LIVE · Nest DENY · peer 09d split) | 10 | **9** | 2 | 2 |
| **Weighted (≈)** | 100 | **9.00** | **2.90** | **2.35** |

---

## 5. Failure Modes and Mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Nest `/core/…/print-versions` as second SoT | Grep routes | **DENY** dual Nest; paper = alias only |
| A | Rewrite PREV to INSERT issued VER | Diff CORE-09b seal | **DENY reopen rewrite** · must_keep ephemeral |
| A | Issue without re-running preview / ignoring `can_issue` | Contract test | RETAIN `createPrintVersion` → `previewContract` |
| A | PDF re-merges live clause library | Content diff vs snapshot | **LOCK** pdfkit from snapshot only |
| A | Silent overwrite issued row | Amend path | RETAIN superseded + new `version_no` |
| A | Claim CORE-09b = printable DONE | Review | **DENY** · O9 |
| A | Invent 09d TPL catalog as CORE-09c DONE | Scope | **OUT** O8 · peer 09d · carry OBS |
| A | Flip `contracts_printable_ready` / recruitment / jd / CORE UAT | QC honesty | **DENY** · O10 |
| A | Break registry CRUD | AC-CTR-PRINT-08 | **must_keep** O7 |
| A | Reopen rewrite CORE-09a / 09b / 08 / 02 / 01 | Diff/bus | **DENY reopen** without regression |
| A | Seed for U65 | QA evidence | **DENY** seed |
| B | Dual SoT + Nest `/core` / TPL invent / PREV rewrite | Integration | Reject B |
| C | Board idle / false DONE / honesty flip | U89 | Reject C |

---

## 6. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_RETAIN**: LIVE `POST/GET …/print-versions*` + `GET …/print-versions/:id/pdf` on `/contracts-insurance/*`; server re-validate + `can_issue` gate; snapshot freeze; PDF-from-snapshot; paper `/core` alias only; **RETAIN** CORE-09b PACK+PREV ephemeral · CORE-09a/08/02/01 · Nest `/core` DENY; **OUT** invent 09d TPL as this seat DONE; **DENY** claim CORE-09b = printable DONE |
| **Why selected** | AS-IS already implements VER INSERT with preview re-run, supersede, snapshot freeze, list/get F5, and pdfkit PDF from snapshot; residual is **GĐ1 BA AC + U65 save→PDF fidelity** under U89 — not greenfield Nest dual, not TPL invent, not PREV/CL reopen; preserves W10–W14 must_keep; unlocks board #17 |
| **Assumptions** | CORE-09b F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 **SEALED RETAIN** (`CORE09BQC1-MSLB05DZ` · QA `CORE09BQA-MSLAWKV6`). CORE-09a F-CORE-CTR-CL-01..04 **RETAIN** (`CORE09AQC1-MSLA4LX9`). CORE-08 F-CORE-RD-01 **RETAIN** (`CORE08QC1-MSL9BFFE`). CORE-02 packages/eins + AuthZ/CB-403 **RETAIN**. CORE-01 public + CB-403 **RETAIN**. Nest `/core` DENY **RETAIN**. `contracts_printable_ready=false` · `jd_dynamic_done=false` · `recruitment_uat_ready=false`. Carry OBS `R-QA-CORE-09B-CLAUSE-FP-EMPTY` → **09d**. |
| **Rejected** | **B** — Nest `/core` dual / invent 09d as 09c DONE / wipe VER / rewrite PREV→INSERT · **C** — HOLD / LIVE=FR-09c DONE / CORE-09b=printable / honesty flip / reopen sealed |

### 6.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|----------------------|-----------------|
| **O1** | Physical path | Prefer `POST/GET …/contracts/:id/print-versions*` + `GET …/print-versions/:versionId/pdf`; any `/core/…` = alias / DOC-DELTA only — **DENY** Nest `/core` dual | Cite Network paths on HĐ save/print spine |
| **O2** | Issue gate | VER INSERT **only** when server re-preview `can_issue=true`; else 400 + `missing_*` (ISSUE-BLOCKED / DRIVER / TERM / TPL-NONE) | AC-CTR-PRINT-01/06 · BR-CTR-CL-02/04 |
| **O3** | Snapshot freeze | Freeze `merged_fields` + `clauses_snapshot` (+ comp snap) at issue; PDF/print **from snapshot only** — DENY live re-merge | AC-CTR-PRINT-05 · BR-CTR-CL-01 |
| **O4** | Amend / phụ lục | New `version_no`; prior `issued` → `superseded` — **no** silent overwrite | FR-09c #5 |
| **O5** | PREV must_keep | CORE-09b `POST …/preview` stays **ephemeral** — DENY reopen rewrite PREV→INSERT VER | must_keep CORE-09b · `ver_insert_posts` on preview stays 0 |
| **O6** | FE after 2xx | After VER 201 → list/detail show pack + version_no; **F5 còn**; PDF 200 matches issued preview | AC-CTR-PRINT-04/05 |
| **O7** | Registry must_keep | Create/edit/F5 sổ đăng ký HĐ vẫn PASS — VER/PDF is ADD overlay | AC-CTR-PRINT-08 |
| **O8** | Peers OUT | UC-BP-CORE-09d TPL catalog invent as this WI DONE · DOCX · ATT · CORE-02b — **peer** seats only; carry `R-QA-CORE-09B-CLAUSE-FP-EMPTY` → 09d | Scope note |
| **O9** | must_keep CORE-09b / 09a / 08 / 02 / 01 | RETAIN PACK+PREV ephemeral · CL physical · RD payroll_link · packages/eins · AuthZ/CB-403 · public strip · Nest `/core` DENY · **DENY** claim CORE-09b = printable DONE · **DENY** reopen J-HRM-CORE-09B-01..04 / J-HRM-CORE-09A / 08/02/01 without regression | Footer |
| **O10** | Honesty | All flags false · C-SLICE · **DENY** flip `recruitment_uat_ready` / `jd_dynamic_done` / `contracts_printable_ready` / module CORE·personnel·CTR UAT in this SA/BA seat (printable flag only after named QA/QC printable U65 — **not** auto from Option A) | Footer every evidence |
| **O11** | Display-ready | VER DTO display-ready (version_no · pack label · status · issued_at · template_code · cb mask on snapshot read) — PDF Blob download | FE bind |
| **O12** | Journeys | DRAFT `J-HRM-CORE-09C-01..04` (preview→save VER→F5 · PDF match snapshot · issue blocked when missing · Nest `/core` 0 + CORE-09b/09a/08/02/01 regression) | BA mint J-* |

### 6.2 must_keep / DENY

| Class | Rule |
|-------|------|
| **must_keep** | LIVE `POST/GET …/print-versions*` · `GET …/print-versions/:id/pdf` · `hrm_contract_print_versions` · server re-preview + `can_issue` · snapshot freeze · superseded amend · LIVE `GET …/pack-resolve` · `POST …/preview` **ephemeral** (CORE-09b) · LIVE `/contracts-insurance/contract-clauses*` (CORE-09a) · LIVE `/employees/:id/rewards*` + `/discipline*` + payroll_link (CORE-08) · LIVE compensation-packages* + employee-insurances* · **`HRM-CORE-CB-AUTHZ-403`** · **`HRM-CORE-CB-403`** · CORE-01 public strip · Nest `/core` DENY · employee_contracts registry CRUD · soft-delete · `resolveHrmListScope` U19 · stamps **`CORE09BQC1-MSLB05DZ`** · **`CORE09AQC1-MSLA4LX9`** · **`CORE08QC1-MSL9BFFE`** · **`CORE02QC1-MSL80DU6`** · **`CORE01QC1-MSL6WMS7`** · REC seals · honesty false |
| **DENY invent** | Nest `/api/hrm/core/**` as **second** VER/PDF SoT · reopen rewrite CORE-09b PREV to INSERT VER · reopen rewrite CORE-09a clause library · invent 09d TPL catalog as CORE-09c DONE · claim CORE-09b pack+preview = printable DONE · claim printable/contract module UAT from this SA alone · flip `contracts_printable_ready` / `jd_dynamic_done` / `recruitment_uat_ready` · seed · reopen sealed J-HRM-CORE-09B/09A/08/02/01 without regression |
| **OUT** | UC-BP-CORE-09d **implementation invent as this WI DONE** · DOCX · DnD layout reorder seat · CORE-05/06/07 · ATT · CORE-02b · PAY |
| **HOLD peer** | `contracts_printable_ready` (until named printable QA/QC) · recruitment module UAT · personnel / CORE / CTR module UAT · `payroll_e2e_ready` · `R-PLT-JD-DYNAMIC-DONE-01` · OBS clause-empty → **09d** |
| **Honesty** | All flags **false** until named waves · **C-SLICE** |

### 6.3 Sealed peers (RETAIN — do not reopen)

| Wave | Stamp / residual | Rule |
|------|------------------|------|
| W1–W9 REC | prior GWC stamps | RETAIN |
| W10 CORE-01 | stamp **`CORE01QC1-MSL6WMS7`** · J-HRM-CORE-01-* | RETAIN — **DENY reopen without regression** |
| W11 CORE-02 | stamp **`CORE02QC1-MSL80DU6`** · J-HRM-CORE-02-01..04 | RETAIN — packages **≠** CORE pillar DONE |
| W12 CORE-08 | stamp **`CORE08QC1-MSL9BFFE`** · J-HRM-CORE-08-01..04 | RETAIN — RD **≠** print · **≠** CORE pillar DONE |
| W13 CORE-09a | stamp **`CORE09AQC1-MSLA4LX9`** · J-HRM-CORE-09A-01..04 | RETAIN — **DENY reopen rewrite** · clause library **≠** printable DONE |
| W14 CORE-09b | stamp **`CORE09BQC1-MSLB05DZ`** · QA `CORE09BQA-MSLAWKV6` · J-HRM-CORE-09B-01..04 | RETAIN — **DENY reopen rewrite** · pack+PREV **≠** printable DONE · PREV ephemeral **must_keep** · OBS clause-empty → **09d** |
| Print TPL peer | 09d / empty clause_ids | **OUT invent as CORE-09c DONE** · printable flag **false** this SA |

---

## 7. F.1 API map (intent — unlock BA; physical lock at API-01 if residual)

| Cap | F-id | change | Physical prefer (Option A) | Paper alias | SRS bước |
|-----|------|--------|----------------------------|-------------|----------|
| Save print version | **F-CORE-CTR-VER-01** | **RETAIN** (+ FE AC residual) | `POST /api/hrm/contracts-insurance/contracts/:id/print-versions` | `/core/…` alias only | FR-CORE-09c Diễn biến **#1** · **#5** · AC-CTR-PRINT-04/06 |
| List/get versions | **F-CORE-CTR-VER-02** | **RETAIN** | `GET …/contracts/:id/print-versions` · `GET …/print-versions/:versionId` | alias | **#3–#4** · AC-CTR-PRINT-04 |
| PDF / print | **F-CORE-CTR-PDF-01** | **RETAIN** (+ FE AC residual) | `GET /api/hrm/contracts-insurance/print-versions/:versionId/pdf` | alias | **#2** · AC-CTR-PRINT-05 |
| Pack resolve | **F-CORE-CTR-PACK-01** | **RETAIN SEALED** | `GET …/contracts/pack-resolve` | alias | FR-CORE-09b — **must_keep · no rewrite** |
| Merge preview | **F-CORE-CTR-PREV-01** | **RETAIN SEALED ephemeral** | `POST …/contracts/:id/preview` | alias | FR-CORE-09b — **must_keep · DENY INSERT VER** |
| Clause library | **F-CORE-CTR-CL-01..04** | **RETAIN SEALED** | `/contracts-insurance/contract-clauses*` | `/core/…/clauses` alias | FR-CORE-09a — **must_keep · no rewrite** |
| Registry CRUD | **F-CORE-CTR-01** family | **RETAIN** | `/contracts-insurance/contracts*` | — | AC-CTR-PRINT-08 · CORE-09 |
| Template catalog | **F-CORE-CTR-TPL-*** | **OUT invent DONE** | peer 09d (RETAIN consume existing active template for issue resolve) | — | **OUT invent as 09c DONE** — issue **may** resolve existing active template |
| CORE-08 RD | **F-CORE-RD-01** | **RETAIN SEALED** | `/employees/:id/rewards*` + `/discipline*` | `/core/reward-discipline` alias | FR-CORE-08 — **≠ 09c** |
| CORE-02 C&B | **F-CORE-EMP-02** | **RETAIN SEALED** | compensation-packages* | `/core/…/compensation` alias | FR-CORE-02 · snapshot ACL |
| CORE-01 public | **F-CORE-EMP-01** | **RETAIN SEALED** | `/api/hrm/employees*` | `/core/employees` alias | FR-CORE-01 |

**Wire codes (RETAIN — no invent rewrite):** `HRM-CTR-VER-201` · `HRM-CTR-VER-200` · `HRM-CTR-ISSUE-BLOCKED` · `HRM-CTR-DRIVER-REQUIRED` · `HRM-CTR-TERM-INVALID` · `HRM-CTR-TPL-NONE` · `HRM-CTR-VERSION-NOT-ISSUED` · `HRM-CTR-PACK-INVALID` · `HRM-CTR-TPL-PACK-MISMATCH` · `HRM-CTR-UNIT-SCOPE` · `HRM-SCOPE-409` · RETAIN PREV/PACK `HRM-CTR-PREV-200` · `HRM-CTR-PACK-200` · RETAIN CORE-09a `HRM-CTR-CL-*` · CORE-08/02/01 codes.

**U19:** contract get-by-id ↔ print-version create/list/get ↔ PDF = **same** contracts-insurance / hrm list-scope resolver family as pack-resolve + preview.

**Serializer / boundary rule:** Issued version responses **MAY** include snapshot fields for authorized roles. Without C&B → **MUST** mask salary/MST/allowance on snapshot read. Public `/employees*` **MUST NOT** grow C&B dumps (CORE-01/02 must_keep). Preview **MUST NOT** persist issued snapshot (CORE-09b). CORE-09c seat **MUST NOT** flip printable readiness or invent 09d TPL catalog DONE.

**F.1 VER-01 purpose (lock):**
1. **Mục đích** — Lưu phiên bản HĐ kèm ảnh chụp nội dung + gói + version điều khoản; cập nhật list/detail sau 2xx.
2. **Nghiệp vụ xử lý** — Re-run preview validation; `!can_issue` → 400 + missing; INSERT issued + freeze snapshots; supersede prior; denorm pack/template on contract.
3. **Bước SRS** — FR-UC-BP-CORE-09c Diễn biến **#1** · **#5** · AC-CTR-PRINT-04/06.

**F.1 VER-02 purpose (lock):**
1. **Mục đích** — Sau Lưu / F5: còn `version_no`, `pack_code`, snapshot metadata.
2. **Nghiệp vụ xử lý** — scope_parity get-by-id; C&B fields in snapshot respect read ACL.
3. **Bước SRS** — FR-UC-BP-CORE-09c Diễn biến **#3–#4** · AC-CTR-PRINT-04.

**F.1 PDF-01 purpose (lock):**
1. **Mục đích** — Xuất bản in/PDF khớp snapshot phiên bản đã lưu (không merge live library).
2. **Nghiệp vụ xử lý** — Load issued version; render from `merged_fields_json` + `clauses_snapshot_json`; optional `pdf_artifact_ref`; block if not issued.
3. **Bước SRS** — FR-UC-BP-CORE-09c Diễn biến **#2** · AC-CTR-PRINT-05.

---

## 8. ba-data / API unlock ladder

```text
SA-01 Option A CONFIRMED (this seat)
  → ba-process BA-01 AC (O1–O12) CONFIRMED
  → ba-data DATA-01 HOLD default (table LIVE: hrm_contract_print_versions + denorm cols)
       └─ conditional UNLOCK only if BA proves physical column gap for VER/PDF fields
  → sa API-01 F.1 physical LOCK only if BA/QA prove residual wire gap
       └─ else RETAIN cite F-CORE-CTR-VER-01/02 + F-CORE-CTR-PDF-01 → Dev FE save/print fidelity
  → Dev BE (HOLD unless residual) + FE-01 save VER + PDF U65
  → QA U65 · QC GWC C-SLICE
```

**cấm code** `apps/**` until BA (+ DATA when required) + API contracts CONFIRMED per program gate.  
**cấm invent** 09d full TPL catalog as CORE-09c DONE until board #18.  
**cấm** honesty flip / Nest `/core` dual / reopen sealed CORE-09b/09a/08/02/01 / claim CORE-09b = printable DONE.

---

## 9. Validation / acceptance evidence plan (for BA→QA)

| Layer | PASS when |
|-------|-----------|
| L0 | Stack health |
| L1 | POST print-versions 201 when `can_issue` · 400 ISSUE-BLOCKED when missing · list/get 200 with version_no+pack · PDF 200 `%PDF` from snapshot · preview still **0** VER INSERT · Nest `/core` DENY · CORE-09b PACK+PREV + CORE-09a CL + CORE-08 RD + CORE-02 AuthZ/CB-403 + CORE-01 public still PASS · amend creates new version + supersedes prior |
| L2.5 J-* | Preview đủ → Lưu phiên bản → list/detail + F5 còn · In/PDF khớp snapshot · missing → chặn lưu · Nest `/core` 0 · no CORE-09b/09a/08/02/01 regression · registry CRUD F5 |
| L3 QC | GWC C-SLICE only · honesty false · DENY module CORE/personnel/CTR UAT · DENY auto-flip `contracts_printable_ready` without named printable gate · DENY claim CORE-09b = printable DONE · DENY invent 09d DONE · DENY reopen J-HRM-CORE-09B/09A/08/02/01 without regression |

**Proposed journeys (DRAFT for BA):**  
`J-HRM-CORE-09C-01` preview đủ → POST print-version 201 → list/detail + F5 · `J-HRM-CORE-09C-02` GET PDF 200 khớp snapshot (field+clause) · `J-HRM-CORE-09C-03` missing mandatory → ISSUE-BLOCKED + list · `J-HRM-CORE-09C-04` Nest `/core` 0 + CORE-09b PREV still ephemeral + CORE-09a/08/02/01 must_keep regression (+ amend supersede optional).

---

## 10. Completion

| Field | Value |
|-------|--------|
| **completion_report** | Option **A LOCKED** for UC-BP-CORE-09c: RETAIN LIVE `F-CORE-CTR-VER-01/02` + `F-CORE-CTR-PDF-01` on `/contracts-insurance/*` (server re-preview + `can_issue` · snapshot freeze · superseded amend · PDF-from-snapshot); **must_keep** CORE-09b PACK+PREV ephemeral (**no reopen rewrite**) · CORE-09a CL · CORE-08 RD+payroll_link · CORE-02 AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY; **OUT** invent 09d TPL as this seat DONE (carry `R-QA-CORE-09B-CLAUSE-FP-EMPTY` → 09d); **DENY** claim CORE-09b = printable DONE · flip `contracts_printable_ready` / recruitment / jd / module UAT; REJECT B Nest dual/TPL invent/PREV rewrite + C HOLD/LIVE=DONE/honesty; unlock **ba-process** BA-01; **no** `apps/**`; honesty false · C-SLICE · `contracts_printable_ready=false`. |
| **next_owner** | **ba-process** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-SA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09C-CLUSTER-BA-01
lane: governance · ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09c
depends_on: SA-01 Option A CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-SA-01.md · peer QC CORE09BQC1-MSLB05DZ
spec_ref: SRS FR-UC-BP-CORE-09c · AC-CTR-PRINT-01/04/05/06/08 · BR-CTR-CL-01/02/04 · SPEC-01 E.3 · TECHSPEC §9 F-CORE-CTR-VER-01/02 · F-CORE-CTR-PDF-01 · must_keep F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 ephemeral · F-CORE-CTR-CL-01..04 · SA O1–O12

MISSION — BA AC pack (narrow):
1) Confirm O1–O12 under Option A — physical POST/GET print-versions* + GET …/pdf · server can_issue gate · snapshot freeze · amend supersede · PREV remains ephemeral · PDF from snapshot only
2) AC matrix U65: preview đủ→Lưu VER→list/detail F5 · PDF khớp snapshot · missing→ISSUE-BLOCKED · Nest /core 0
3) Mint DRAFT J-HRM-CORE-09C-01..04 · must_keep CORE-09b pack+PREV · CORE-09a CL · CORE-08 RD+payroll_link · CORE-02 AuthZ/CB-403 · CORE-01 public · Nest /core DENY
4) DENY invent 09d TPL catalog as this WI DONE · DENY claim CORE-09b=printable DONE · contracts_printable_ready flip · reopen sealed J-HRM-CORE-09B/09A/08/02/01 · seed · apps/**
5) Carry OBS R-QA-CORE-09B-CLAUSE-FP-EMPTY → peer 09d (not invent TPL DONE here)

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-BA-01.md · PASS_TO_PM · next ba-data HOLD default (or sa API-01 if residual)
```
