# Evidence — PO-ECO-TC-SYNTH-WAVE-C-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-ECO-TC-SYNTH-WAVE-C-01` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **mode** | Design-only SYNTH — **no browser** · **no seed** · **no UAT/Phase1 DONE** |

---

## 1. completion_report

**Closed**

- Scanned **4 Wave C packs** + prior **21 SYNTHED packs** + spine `PO_SPEC_TEST_CASE_CATALOG.md` (53 TC).
- **Cross-pack TC-ID collisions (Wave C vs A/B/DELTA):** **0** — prefixes disjoint (`TC-DASH-*`, `TC-LGN-*`, `TC-MOB-TEAM-*`, `TC-GUIDE-*`).
- Resolved **Login ↔ CC-HOME-KPI** scenario overlap via neo-map (different IDs — §2.3); **MOB-TEAM** vs **MOB-PROFILE / MOB-HOME / MOB-ATTENDANCE** via entry/XREF (§3).
- Roster Wave C leaf rows → **SYNTHED**; `PO_SPEC_TEST_REPORT.md` **§10** appended; `testcases/README.md` index updated.

**Residual (non-blocking for synth PASS)**

| ID | Item | Owner hint |
|----|------|------------|
| **TC-CC-HP-001 / TC-CC-FD-001** | Login happy/fail still listed in **XBOS-CC-HOME-KPI** §4.1 | Optional author refresh → `cross_ref: TC-LGN-HP-001` / `TC-LGN-FD-001` only |
| **TC-J-HP-001..003** | ORG-SHARE vs CC-HOME-KPI (from B-DELTA) | Unchanged — KPI pack rename `TC-CC-J-HP-*` on refresh |
| **LV-02 / TC-LV-03** | Ladder `T_L1`/`N` | SA/BA |
| **BUILD_GAP-MD-PANEL-01** | HRM-SETTINGS execution | dev-fe |
| **HRM-GUIDE thin_ui** | STUB testids · XSS TM review `TC-GUIDE-OV-STUB-001` | dev-fe + TM |
| Author vs grep uniq | DASH 54 vs 57; GUIDE 42 vs 34 matrix rows | §4+§5 trace echo + OOS/STUB rows — same class as prior waves |

---

## 2. TC-ID collision scan

### 2.1 Method

- Regex: `^\| (TC-[A-Z0-9-]+) \|` on matrix/trace tables; filter header `TC-ID`.
- Paths normalized (`testcases/` relative) on Windows.
- Spine: catalog §2–§6 primary IDs.

### 2.2 Cross-file (25 depth packs + spine)

| Result | Count |
|--------|------:|
| Pack files (excl. template/README) | **25** |
| **Globally unique** depth TC-IDs (post Wave C) | **1246** |
| Prior A+B+DELTA unique | **1095** |
| **Wave C net new unique IDs** | **151** |
| Depth ID **equals** spine primary string | **0** |
| **Cross-pack same ID, different files** (Wave C involved) | **0** |

Cumulative **claimed** matrix rows: **1240** + **156** = **1396** (author footers).

### 2.3 Login ↔ CC-HOME-KPI — scenario neo-map (not ID collision)

| CC-HOME-KPI TC-ID | XBOS-LOGIN TC-ID | Resolution |
|-------------------|------------------|------------|
| `TC-CC-HP-001` · `AUTH-FN-LOGIN` | `TC-LGN-HP-001` | **Canonical auth depth:** **LOGIN** owns form, POST **201**, redirect, membership chip. CC-HOME row = **precondition** for widget suite; execute login once via **LGN** pack; CC-HOME asserts shell/widgets only (`TC-CC-HP-002+`). |
| `TC-CC-FD-001` | `TC-LGN-FD-001` | **Canonical fail-deep:** **LOGIN** (401, banner, no JWT). CC-HOME duplicate scenario **deprecated** for execution — pointer only. |
| `TC-CC-HP-003` · `TC-J-HP-001` (home load) | `TC-LGN-HP-003` · J-CC-01 | **Split:** **LGN** = session persist F5 after login; **CC-HOME** = CC workspace + widgets reload (same journey step, different assertions). |
| `TC-AU-PTR-001` | `TC-LGN-AU-003` | Member CEO login OK; full UF-11 matrix stays CC-HOME / future MEMBER-SCOPE — **LGN** pointer only. |

**Dedupe rule:** No shared TC-ID string; UF-XBOS-01 browser matrix 🟢 remains satisfied by **either** legacy CC row **or** **LGN-HP-001..003** — prefer **LGN** for auth regression, **CC-HOME** for KPI/rail/L2.5 J-CC-02+.

### 2.4 Wave C namespaces (disjoint)

| Prefix / pack | Sample | Cross collision |
|---------------|--------|-----------------|
| `TC-DASH-*` | HRM-DASHBOARD | **0** |
| `TC-LGN-*` | XBOS-LOGIN | **0** vs `TC-CC-*` |
| `TC-MOB-TEAM-*` | MOB-TEAM | **0** |
| `TC-GUIDE-*` | HRM-GUIDE | **0** |

### 2.5 Spine ↔ depth neo map (Wave C additions)

| Spine TC-ID | Depth pack TC-ID(s) | Theme |
|-------------|---------------------|-------|
| UF-XBOS-01 · J-CC-01 | `TC-LGN-HP-*` · xref `TC-CC-HP-*` | Portal login → CC |
| UF-HRM-MENU-01 | `TC-DASH-L-HP-001` · `TC-DASH-L-HP-002` | Dashboard standalone + embed |
| **TC-LV-09** adjacency | `TC-DASH-REM-HP-002` | Web approve from dashboard reminders (U65 FE) |
| **TC-HP-10** / J-HRM-03 adjacency | `TC-DASH-EXP-HP-003` | Expiring contract → employee profile |
| **TC-AT-01** entry | `TC-MOB-TEAM-NAV-CHK-001` → **MOB-ATTENDANCE** | Self check-in from team tab link |
| — | `TC-GUIDE-L-HP-005` | Public `/hr/guide` (no auth crash) |

Spine **53 TC unchanged**.

---

## 3. MOB-TEAM vs PROFILE / HOME / ATTENDANCE

| Edge | Canonical pack | MOB-TEAM role |
|------|----------------|---------------|
| **TeamDirectory** · **TeamColleagueDetail** | **MOB-TEAM** | **Canonical** J-MOB-30 / J-MOB-16 · `TC-MOB-TEAM-J30-*` |
| Att stack listed Team screens | **MOB-ATTENDANCE** §1 | **OOS** — execute directory in MOB-TEAM only |
| Home quick tile → team | **MOB-HOME** | **Entry** — `TC-MOB-TEAM-NAV-HOME-001` parity with tab |
| Profile ESS · self CheckIn tile | **MOB-PROFILE** | **Contrast** — `TC-MOB-TEAM-NAV-PROF-001` (colleague detail ≠ self profile) |
| CheckIn / history depth | **MOB-ATTENDANCE** | **NAV stop** — `TC-MOB-TEAM-NAV-CHK-001` → `TC-MOB-ATT-*` |
| Leave / MGR approve | **MOB-LEAVE-APPR** (Wave A) | **No** team pack duplicate |

**Dedupe rule:** **0** shared TC-ID with MOB-HOME / MOB-PROFILE / MOB-ATTENDANCE; NAV rows are **stop-at-boundary** only.

---

## 4. Wave C rollup (authoritative pack footers)

| pack_path | TCs | Screens | Fields | Functions | Evidence |
|-----------|----:|--------:|-------:|----------:|----------|
| `hrm-web/HRM-DASHBOARD.md` | 54 | 19 | 42 | 18 | `po-eco-tc-hrm-dashboard-01.md` |
| `xbos/XBOS-LOGIN.md` | 28 | 8 | 18 | 12 | `po-eco-tc-xbos-login-01.md` |
| `hrm-mobile/MOB-TEAM.md` | 32 | 16 | 35 | 14 | `po-eco-tc-mob-team-01.md` |
| `hrm-web/HRM-GUIDE.md` | 42 | 12 | 22 | 18 | `po-eco-tc-hrm-guide-01.md` |
| **Wave C total** | **156** | **55** | **117** | **62** | — |

All depth TC status: **PLANNED** (catalog only) except GUIDE **1 OOS** · **1 STUB**.

### 4.1 Cumulative A + B + DELTA + C

| Metric | Wave C | Prior cumulative | **Total** |
|--------|-------:|-----------------:|----------:|
| Menu writer packs | **4** | 21 | **25** |
| TC matrix (claimed) | **156** | 1240 | **1396** |
| Globally unique depth TC-IDs | **151** | 1095 | **1246** |
| Cross-pack ID collisions (new) | **0** | 9 (documented B-DELTA) | **9** (unchanged) |
| Screen inventory rows | **55** | 401 | **456** |
| Field dictionary rows | **117** | 1061 | **1178** |
| Function inventory rows | **62** | 634 | **696** |

---

## 5. Handoff

```
completion_report: Wave C 4 packs SYNTHED; Login/CC-HOME neo-map; MOB-TEAM cross-ref documented; 1246 unique IDs
next_owner: pm
next_dispatch_prompt: (see §6)
evidence_path: docs/qa/evidence/po-eco-tc-synth-wave-c-01.md
ack_status: PASS_TO_PM
```

## 6. next_dispatch_prompt

```text
work_item_id: PO-ECO-TC-PROGRAM-STATUS-01 (or next Wave C stub author: XBOS-RAIL-STUBS / MOB-OPERATIONS / MOB-JOURNEY per ECOSYSTEM_MENU_ROSTER.md Wave C PLANNED rows)
from_role: pm
to_role: qa | ba-docs | dev-fe (per item)

Mission (pick one):
A) Program status — refresh docs/qa/reports/PO_SPEC_TEST_REPORT.md executive §1 with ecosystem depth 1396 PLANNED TC vs spine 53 EVIDENCED/AUTOMATED; sponsor-facing UAT NOT DONE.
B) Wave C remaining stubs — depth pack author for XBOS-RAIL-STUBS.md / MOB-OPERATIONS.md / MOB-JOURNEY.md when PM prioritizes; then PO-ECO-TC-SYNTH-WAVE-C-DELTA-01.

read_first: docs/qa/evidence/po-eco-tc-synth-wave-c-01.md · docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md · roster ECOSYSTEM_MENU_ROSTER.md

cấm: apps/** · seed · UAT DONE · wipe prior synth §6–§10
```

---

*PO-ECO-TC-SYNTH-WAVE-C-01 · qa PASS_TO_PM*
