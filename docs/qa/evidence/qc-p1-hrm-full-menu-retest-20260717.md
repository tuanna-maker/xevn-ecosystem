# QC Gate — P1-HRM-FULL-MENU-QA-RETEST-QC-01

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-FULL-MENU-QA-RETEST-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-07-17 |
| **environment** | VPS Dev8088 `http://14.225.217.232:8088` · portal-fe `8088→5173` · `PORTAL_DEV_URL` equivalent |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **decision** | **GO WITH CONDITIONS** |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **full_menu_program_done_claim** | **NO** — wave-2 post-deploy-02 QA still open |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed verified across chain — no seed in evidence |

---

## Scope (bounded)

| In scope (this gate) | Out of scope / open conditions |
|----------------------|--------------------------------|
| Fix-bundle residual close **4b–7** after xbos restore | Full `P1-HRM-FULL-MENU-QA-PROGRAM` roster closure |
| **J-HRM-02** list→profile (Employees W1) | Wave-2 post-`DEPLOY-02` browser QA (decisions coalesce, performance portal deep-link, company Phòng ban stub, contracts progressive F5) |
| **J-HRM-04** insurance→employee profile | Phase 1 DONE / `phase1:gate --strict` / PROD-READY |
| UniAI L0 retest PASS (rate-limit raise) | Member-CEO persona matrix |
| Deploy SoT `ea6ea06` + wave-2 deploy `9dd029c` L0 | Claiming wave-2 menu UF DONE without post-fix QA |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/p1-hrm-full-menu-qa-retest-resume-20260717.md` | QA resume | **PASS_TO_PM** — residual **4b–7** 🟢 |
| `docs/qa/evidence/p1-hrm-full-menu-qa-retest-20260717.md` | QA partial | Attendance leave 🟢; Insurance ERROR-mask 🟢; blocked mid-wave by xbos `:28002` |
| `docs/qa/evidence/d-xbos-auth-28002-restore-20260717.md` | DevOps | xbos-be healthy; portal login **201** |
| `docs/qa/evidence/p1-hrm-menu-hrm_ai-retest-20260717.md` | QA | UniAI **PASS** — `D-P1-HRM-AI-429-01` CLOSED |
| `docs/qa/evidence/p1-hrm-full-menu-fix-bundle-deploy-20260717.md` | DevOps | HEAD `ea6ea06`; hrm-be/hrm-fe/portal-fe recreate; summary `active_count=1041` / `total=1107` |
| `docs/qa/evidence/p1-hrm-full-menu-fix-bundle-deploy-02-20260717.md` | DevOps | HEAD `9dd029c`; rate-limit 10000; wave-2 FE bundle **READY_FOR_QA** (browser not claimed) |
| Screenshot | QA | `p1-hrm-full-menu-qa-retest-resume-reports-20260717.png` — Biến động NS **1041** |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-full-menu-qa-retest-resume-20260717.md
# → FAIL 3/8 (command_table, portal_url regex, crud_or_matrix format)

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-p1-hrm-full-menu-retest-20260717.md
# → see Command table below (this QC pack)
```

**QC adjudication:** **PROCESS GWC** on QA resume pack — auditable browser L2.5 click paths, Network 2xx, U65 no-seed, handoff contract complete. Script misses are format/regex (portal `:8088` vs `5173`/`nip.io`; no `pnpm` command table in QA MD), **not** product FAIL. Authoritative QA anchor: `p1-hrm-full-menu-qa-retest-resume-20260717.md`. Precedent: H13 regate PROCESS GWC.

### Command table (QC gate)

| Command | Result | Notes |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-full-menu-qa-retest-resume-20260717.md` | **FAIL** exit **1** (3/8) | PROCESS GWC — format only |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-p1-hrm-full-menu-retest-20260717.md` | **PASS** exit **0** (8/8) | This gate file — verified 2026-07-17 |
| Deploy L0 (carry) `GET http://127.0.0.1:8088/` | **PASS** **200** | `p1-hrm-full-menu-fix-bundle-deploy-20260717.md` |
| DevOps restore `POST …/api/xbos/auth/login` | **PASS** **201** | `d-xbos-auth-28002-restore-20260717.md` |
| QA resume browser login smoke | **PASS** **201** | resume evidence |

Portal URL: `http://14.225.217.232:8088` (VPS) · compose maps `portal-fe` **8088→5173** · smoke also `http://127.0.0.1:8088/` · `PORTAL_DEV_URL` Dev8088.

---

## Classification

| Signal | Type | QC verdict |
|--------|------|------------|
| xbos `:28002` down → portal auth 500 (prior wave) | **ENV** | **CLOSED** — restore evidence + resume login **201** |
| Insurance happy + **J-HRM-04** profile 200 | **PRODUCT** / L2.5 | **PASS** — residual **4b** closed |
| Employees W1 + **J-HRM-02** ≤1 detail GET | **PRODUCT** / L2.5 | **PASS** — residual **6** closed |
| Internal services list+detail dialog | **PRODUCT** / L2 | **PASS** — **4c** |
| Payroll header «Trạng thái» (no `[object Object]`) | **PRODUCT** / L2 | **PASS** — **5** header AC |
| Reports: no `attendanceError`; recon wired; no payslips dump; Biến động NS **1041** (not ~95) | **PRODUCT** / L2 | **PASS** — **7** |
| UniAI shell after rate-limit 10000 | **PRODUCT** / L0 | **PASS** |
| Seed used | **PROCESS** | **PASS** — none |
| Reports active **1041** vs employees list **1107** | **PRODUCT** / P2 data semantics | **OPEN** — non-blocking GWC |
| Payroll cell raw `processed` | **PRODUCT** / P2 i18n | **OPEN** — non-blocking GWC |
| Wave-2 menus post-`DEPLOY-02` QA | **COVERAGE** | **OPEN** — not required to block this residual gate |

---

## L2.5 — J-* cited (mandatory this gate)

| J-ID | Journey | QA evidence | L2.5 verdict | Promotable this slice |
|------|---------|-------------|--------------|------------------------|
| **J-HRM-02** | Nhân sự list → Hồ sơ | Resume §6 — list page=1 + summary; profile `ff16d855-…`; **1** detail GET; **0** list-page chain | **PASS** | **YES** Dev8088 group CEO |
| **J-HRM-04** | Bảo hiểm → NV linked | Resume §4b — BHYT list; click Trần Quốc Chi → profile `177f9058-…`; GET employee **200**; no 404 | **PASS** | **YES** Dev8088 group CEO |
| J-HRM-03 | Hợp đồng → chi tiết | Prior menu QA PASS then F5 RATE-429 FAIL; FE fix `P1-HRM-CON-PERF-01` **READY_FOR_QA** only | **NOT RE-GATED** | **NO** until post-deploy-02 QA |
| J-HRM-07 | Lương → phiếu | Header i18n PASS this wave; cell label residual P2 | **PARTIAL** (header only) | Header YES; cell label NO |

Read-only module / residual checklist matrix (resume 4b–7):

| Module AC | Create | Read | Update | Delete | Verdict |
|-----------|--------|------|--------|--------|---------|
| Insurance happy + J-HRM-04 | N/A | **PASS** | N/A | N/A | 🟢 |
| Internal services list/detail | N/A | **PASS** | N/A | N/A | 🟢 |
| Payroll status header | N/A | **PASS** | N/A | N/A | 🟢 |
| Employees J-HRM-02 | N/A | **PASS** | N/A | N/A | 🟢 |
| Reports overview + Biến động NS | N/A | **PASS** | N/A | N/A | 🟢 |

---

## Condition register (GO WITH CONDITIONS)

### Closed this gate (fix-bundle residual)

| ID | Item | Status |
|----|------|--------|
| Residual **4b** | Insurance happy + **J-HRM-04** | **CLOSED** |
| Residual **4c** | Internal services list/detail | **CLOSED** |
| Residual **5** | Payroll column header «Trạng thái» | **CLOSED** |
| Residual **6** | Employees W1 + **J-HRM-02** | **CLOSED** |
| Residual **7** | Báo cáo AC (error/recon/payslips/turnover≠95) | **CLOSED** |
| `D-P1-HRM-RETEST-XBOS-28002-DOWN-01` | Auth blocker | **CLOSED** |
| `D-P1-HRM-AI-429-01` | UniAI 429 | **CLOSED** |

### Open conditions (non-blocking for this residual gate)

| Condition ID | Severity | Owner | Summary | Trigger to reopen / close |
|--------------|----------|-------|---------|---------------------------|
| **GWC-HRM-RPT-HEADCOUNT-01** | P2 | **ba-data** (+ **dev-be** if contract wrong) | Reports/turnover **Nhân viên hiện tại = 1041** (`active_count`) vs Nhân sự list **1107** (`total`). Not the prior page_size undercount class. Document semantics or align UI label. | BA delta or FE label fix → QA spot-check |
| **GWC-HRM-PAY-STATUS-CELL-01** | P2 | **dev-fe** | Payroll StatusBadge / cell still raw `processed` (header «Trạng thái» already PASS) | FE i18n map → QA payroll column spot |
| **GWC-HRM-WAVE2-QA-01** | P1 coverage | **qa** | Post-`DEPLOY-02` (`9dd029c`) browser QA not closed for: PERF-HRM-DEC-01, COND-PF-PORTAL-01, COMPANY-DEPT-STUB, P1-HRM-CON-PERF-01 (+ D-DASH-FE-STORM). Dev evidence only **READY_FOR_QA**. Prior: decisions PASS GWC empty; performance portal redirect GWC; company Phòng ban stub; contracts F5 FAIL. | QA wave on `:8088` after deploy-02 → PASS/FAIL evidence |
| **GWC-HRM-DASH-01** | P2 | **qa** / **dev-fe** | Dashboard D-DASH-01 still 🟡 in prior partial (ops consumer paint / soft-nav) — not re-opened in resume | Optional follow-up; not in 4b–7 close |
| **GWC-HRM-REC-429-01** | P2 | **qa** | Recruitment mutate/Sửa not proven under RATE-429 | Retest after rate-limit 10000 |

---

## Verdict rationale

1. **Product residuals 4b–7** have browser U65 evidence with Network **2xx** and FE observation — including mandatory **J-HRM-02** and **J-HRM-04**.
2. Env blocker that caused prior **FAIL_TO_PM** is closed (xbos restore + login **201**).
3. UniAI and deploy SoT corroborate rate-limit / bundle readiness for the residual slice.
4. P2 headcount semantics and payroll cell i18n do **not** reopen P0 on closed ACs.
5. Wave-2 menu fixes are **deployed** but **not** QA-closed — listed as **GWC-HRM-WAVE2-QA-01**; per PM entry, do **not** require them for this residual gate.
6. **NOT** Phase 1 DONE · **NOT** full-menu program DONE · **NOT** PROD-READY.

**Decision: GO WITH CONDITIONS** (bounded: fix-bundle residual 4b–7 + J-HRM-02/04 on Dev8088 group CEO).

---

## Residual

| Item | Owner | Blocking this GO? |
|------|-------|-------------------|
| GWC-HRM-RPT-HEADCOUNT-01 (1041 vs 1107) | ba-data → dev-be/fe as needed | **No** (P2) |
| GWC-HRM-PAY-STATUS-CELL-01 (raw `processed`) | dev-fe | **No** (P2) |
| GWC-HRM-WAVE2-QA-01 (post-deploy-02 browser) | qa | **No** for this residual gate; **Yes** for full-menu program close |
| GWC-HRM-DASH-01 / GWC-HRM-REC-429-01 | qa / fe | **No** (carry) |

No P0 product residual open on the closed 4b–7 slice.

---

## Handoff packet

- `work_item_id:` `P1-HRM-FULL-MENU-QA-RETEST-QC-01`
- `from_role:` qc
- `to_role:` pm
- `ack_status:` **PASS_TO_PM**
- `evidence_path:` `docs/qa/evidence/qc-p1-hrm-full-menu-retest-20260717.md`
- `completion_report:` |
  QC **GO WITH CONDITIONS** on HRM full-menu fix-bundle residual close. Audited resume **4b–7** 🟢 + xbos restore + UniAI PASS + deploy `ea6ea06` / deploy-02 `9dd029c`. **J-HRM-02** and **J-HRM-04** PASS on Dev8088. P2: reports 1041 vs list 1107 (ba-data); payroll cell raw `processed` (dev-fe). Wave-2 post-deploy-02 QA open as coverage condition (not required to block this gate). U65 no seed. **NOT** Phase 1 DONE · **NOT** full-menu program DONE.
- `next_owner:` **pm**
- `next_dispatch_prompt:` |
  ```text
  work_item_id: P1-HRM-FULL-MENU-WAVE2-QA-01
  from_role: pm
  to_role: qa
  entry_criteria: QC GWC docs/qa/evidence/qc-p1-hrm-full-menu-retest-20260717.md; deploy-02 READY_FOR_QA docs/qa/evidence/p1-hrm-full-menu-fix-bundle-deploy-02-20260717.md (HEAD 9dd029c); U65 zero-seed browser-only on http://14.225.217.232:8088; ceo@xe.vn / Xevn@2026
  task: Browser retest post-deploy-02 only:
    1) PERF-HRM-DEC-01 — decisions list coalesce + employees picker deferred
    2) COND-PF-PORTAL-01 — /command-center/hrm/performance stays on performance (no dashboard redirect)
    3) P1-HRM-MENU-COMPANY-DEPT-STUB — Company tab Phòng ban real API / banner on fail
    4) P1-HRM-CON-PERF-01 — contracts F5 progressive; RATE-429 shows banner not silent empty; cite J-HRM-03
    5) optional D-DASH-FE-STORM spot
  Parallel P2 (do not block wave2 start): dispatch ba-data GWC-HRM-RPT-HEADCOUNT-01 (1041 vs 1107); dispatch dev-fe GWC-HRM-PAY-STATUS-CELL-01 (StatusBadge processed → VN label)
  cấm: seed
  exit_criteria: evidence docs/qa/evidence/p1-hrm-full-menu-fix-bundle-qa-02-20260717.md; PASS_TO_PM or FAIL_TO_PM with residual ids
  ```

---

## QC sign-off

| Role | Name | Decision | Date |
|------|------|----------|------|
| QC | QC Manager (subagent) | **GO WITH CONDITIONS** | 2026-07-17 |
