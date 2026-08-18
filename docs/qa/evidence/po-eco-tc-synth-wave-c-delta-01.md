# Evidence — PO-ECO-TC-SYNTH-WAVE-C-DELTA-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-ECO-TC-SYNTH-WAVE-C-DELTA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **mode** | Design-only SYNTH — **no browser** · **no seed** · **no UAT/Phase1 DONE** |

---

## 1. completion_report

**Closed**

- Ingested **3 Wave C stub packs** after `PO-ECO-TC-SYNTH-WAVE-C-01` (28 prior SYNTHED + spine 53 TC).
- **Cross-pack TC-ID collisions (delta packs vs A/B/C batch-1):** **0** — prefixes disjoint (`TC-RST-*`, `TC-MOB-OPS-*`, `TC-MOB-JRN-*`).
- Documented **scenario dedupe** vs **XBOS-CC-HOME-KPI** (`TC-RAIL-*` / widgets) · **MOB-HOME** · **MOB-PROFILE** · **MOB-SETTINGS** (§2–§4).
- Roster §A.5 rail stub rows + **MOB-OPERATIONS** · **MOB-JOURNEY** → **SYNTHED**; `PO_SPEC_TEST_REPORT.md` **§11** appended; `testcases/README.md` + `PO_ECOSYSTEM_TC_DEPTH_STATUS.md` cumulative updated.

**Residual (non-blocking for synth PASS)**

| ID | Item | Owner hint |
|----|------|------------|
| **TC-RST-PTR-003** | Scenario twin **TC-RAIL-HP-004** (business stub) | U78: execute once via **RAIL-STUBS** depth; CC-HOME row = **cross_ref** only |
| **TC-CC-HP-001 / TC-CC-FD-001** | Login precondition in CC-HOME | Unchanged — prefer **XBOS-LOGIN** (`po-eco-tc-synth-wave-c-01.md`) |
| **TC-J-HP-001..003** | ORG-SHARE vs CC-HOME-KPI | Unchanged from B-DELTA |
| **MOB-HOME SCR-HOME-JOURNEY** | Screen inventory only — no `TC-MOB-HOME-*` journey matrix | **MOB-JOURNEY** owns all `TC-MOB-JRN-*`; **J-MOB-08** culture REG stays **MOB-HOME** §4.3 |
| **GWC-13G-01** | Device backlog MOB-UX-13g | **qa-device** when stack up |
| Author vs grep uniq | RST 28 vs matrix echo; OPS/JRN bold rows | Same class as prior waves |

---

## 2. TC-ID collision scan

### 2.1 Method

- Regex: `^\| (TC-[A-Z0-9-]+) \|` on matrix/trace tables; supplement `**TC-* **` in MOB packs.
- Paths: all `docs/qa/testcases/**/*.md` (excl. template/README/roster).
- Spine: `PO_SPEC_TEST_CASE_CATALOG.md` (53 primary IDs — unchanged).

### 2.2 Cross-file (28 depth packs + spine)

| Result | Count |
|--------|------:|
| Pack files | **28** |
| **Globally unique** depth TC-IDs (post C-DELTA) | **1375** |
| Prior post Wave C batch-1 | **1246** |
| **C-DELTA net new unique IDs** | **129** |
| Delta pack unique IDs (3 files) | **93** |
| Depth ID **equals** spine primary string | **0** |
| **Cross-pack same ID involving C-DELTA packs** | **0** |
| **Cross-pack duplicates repo-wide** | **17** | *(9 documented B-DELTA + legacy; no new from delta)* |

Cumulative **claimed** matrix rows: **1396** + **98** = **1494** (author footers).

### 2.3 C-DELTA namespaces (disjoint)

| Prefix / pack | Sample | Cross collision |
|---------------|--------|-----------------|
| `TC-RST-*` | XBOS-RAIL-STUBS | **0** vs `TC-RAIL-*` / `TC-CC-*` |
| `TC-MOB-OPS-*` | MOB-OPERATIONS | **0** vs `TC-MOB-SET-*` / `TC-MOB-HOME-*` |
| `TC-MOB-JRN-*` | MOB-JOURNEY | **0** vs `TC-MOB-HOME-*` |

---

## 3. TC-RST vs CC-HOME / TC-RAIL (scenario neo-map)

| CC-HOME-KPI TC-ID | RAIL-STUBS TC-ID | Resolution |
|-------------------|------------------|------------|
| `TC-RAIL-HP-001` | — | **GROUP** home — **CC-HOME-KPI** canonical; not duplicated in RST pack |
| `TC-RAIL-HP-002` | `TC-RST-HRM-HP-*` (HRM-link) | **Split:** CC-HOME = one-click embed smoke; **RAIL-STUBS** = shell/sidebar/HRM-api banner depth |
| `TC-RAIL-HP-003` | `TC-RST-SYS-HP-*` | **Split:** CC-HOME = settings rail entry; **RAIL-STUBS** = settings **nav inventory** + leaf xref ORG/INBOX/RBAC/CATALOG/WF |
| `TC-RAIL-HP-004` | `TC-RST-HP-004` · `TC-RST-PTR-003` | **Canonical stub filter:** **RAIL-STUBS** (`?module=business` + Action Cards filter); CC-HOME row = **cross_ref** for U78 dedupe |
| `TC-KPI-*` · widget trio | `TC-RST-WDG-*` xref | **CC-HOME-KPI** owns KPI mutate/rollup; stub module **does not** scope KPI widgets |
| Action card row click / inbox depth | `TC-RST-ACT-*` | **CC-HOME** owns full Action Cards matrix; RST = **filtered subset** + empty states per module |
| Legacy `/dashboard/*` pages | `TC-RST-OOS-*` | **OOS** from rail click — honest STUB classification |

**Dedupe rule:** **0** shared TC-ID strings; execute stub module filter + legacy OOS in **XBOS-RAIL-STUBS**; rail happy-path smoke may still use **TC-RAIL-HP-*** in CC-HOME for regression breadth — prefer **RST** when asserting `?module=` + filter helper text.

---

## 4. TC-MOB-OPS vs HOME / PROFILE / SETTINGS

| Edge | Canonical pack | MOB-OPERATIONS role |
|------|----------------|---------------------|
| Settings row **Vận hành** visible (mgr) | **MOB-SETTINGS** `TC-MOB-SET-AU-001` | **NAV stop + screen depth** — `TC-MOB-OPS-NAV-001` after row tap; AU-001 does **not** duplicate tabs/mutate |
| ESS: no Settings row | **MOB-SETTINGS** `TC-MOB-SET-AU-002` (pattern) | **OPS-AU-002** confirms row maps AU-001 downstream for mgr only |
| Home tile **Vận hành** | **MOB-HOME** (entry) | **TC-MOB-OPS-NAV-002** — mount parity without Settings |
| Hub / notification deep link | **MOB-HOME** / **MOB-PROFILE** | **NAV-003/004** stop-at-boundary |
| Task create · PATCH done · service approve/reject | **MOB-OPERATIONS** | **Canonical** UC-HRM-MOB-11 depth |
| Profile ESS tabs · contracts | **MOB-PROFILE** | Name cross-ref only |

**Dedupe rule:** **0** ID collision; **SET-AU-001** = visibility; **OPS-NAV-001+** = OperationsScreen depth.

---

## 5. TC-MOB-JRN vs MOB-HOME / MOB-PROFILE

| Edge | Canonical pack | MOB-JOURNEY role |
|------|----------------|------------------|
| Home load · 4-tab shell | **MOB-HOME** `TC-MOB-HOME-J01-*` | Precond only |
| Journey preview card · «Xem tất cả» | **MOB-JOURNEY** `TC-MOB-JRN-HOME-*` | **Canonical** timeline preview (≤3 rows) |
| Full `JourneyScreen` · groupByYear | **MOB-JOURNEY** `TC-MOB-JRN-FULL-*` | **Canonical** UC-MOB-PERS-08 |
| Grid tile `journey` | **MOB-JOURNEY** `TC-MOB-JRN-NAV-*` | Entry parity with card footer |
| **HomeCelebrationRow** · **J-MOB-08** REG | **MOB-HOME** §4.3 | **MOB-JOURNEY** documents culture strip inventory; regression ID **unchanged** on HOME |
| Payslip/inbox/attendance on timeline | Source packs | **Display-only** rows on compose — no mutate TC duplicate |

**Dedupe rule:** **0** shared `TC-MOB-HOME-*` vs `TC-MOB-JRN-*` IDs; preview depth **moved** from HOME inventory stub to **MOB-JOURNEY** matrix.

---

## 6. Wave C-DELTA rollup (authoritative pack footers)

| pack_path | TCs | Screens | Fields | Functions | Evidence |
|-----------|----:|--------:|-------:|----------:|----------|
| `xbos/XBOS-RAIL-STUBS.md` | 28 | 17 | 45 | 14 | `po-eco-tc-xbos-rail-stubs-01.md` |
| `hrm-mobile/MOB-OPERATIONS.md` | 32 | 14 | 24 | 13 | `po-eco-tc-mob-operations-01.md` |
| `hrm-mobile/MOB-JOURNEY.md` | 38 | 12 | 28 | 17 | `po-eco-tc-mob-journey-01.md` |
| **C-DELTA total** | **98** | **43** | **97** | **44** | — |

All depth TC status: **PLANNED** (catalog) · RST pack includes **STUB/OOS** labeled rows.

### 6.1 Cumulative A + B + DELTA + C + C-DELTA

| Metric | C-DELTA | Prior cumulative | **Total** |
|--------|--------:|-----------------:|----------:|
| Menu writer packs | **3** | 25 | **28** |
| TC matrix (claimed) | **98** | 1396 | **1494** |
| Globally unique depth TC-IDs | **129** net | 1246 | **1375** |
| Cross-pack ID collisions (new) | **0** | 9 (B-DELTA) + neo-maps | **9** unchanged |
| Screen inventory rows | **43** | 456 | **499** |
| Field dictionary rows | **97** | 1178 | **1275** |
| Function inventory rows | **44** | 696 | **740** |

---

## 7. Handoff

```
completion_report: Wave C-DELTA 3 stub packs SYNTHED; RST/MOB-OPS/MOB-JRN dedupe documented; 1375 unique IDs; 1494 claimed rows
next_owner: pm
next_dispatch_prompt: (see §8)
evidence_path: docs/qa/evidence/po-eco-tc-synth-wave-c-delta-01.md
ack_status: PASS_TO_PM
```

## 8. next_dispatch_prompt

```text
work_item_id: PO-ECO-TC-PROGRAM-STATUS-01 (or next roster PLANNED leaf per ECOSYSTEM_MENU_ROSTER.md — e.g. XBOS-MEMBER-SCOPE · MOB-PAYSLIP)
from_role: pm
to_role: qa | ba-docs | qa-device

Mission (pick one):
A) Program status — refresh PO_SPEC_TEST_REPORT.md executive §1: ecosystem depth **1494** PLANNED TC vs spine **53** EVIDENCED; sponsor-facing UAT NOT DONE.
B) Device wave — qa-device MOB-UX-13g / GWC-13G-01 on MOB-JOURNEY L2.5 Home→Journey→Back (U65 · no seed).
C) Next depth author — remaining roster PLANNED packs when PM prioritizes.

read_first: docs/qa/evidence/po-eco-tc-synth-wave-c-delta-01.md · docs/program/PO_ECOSYSTEM_TC_DEPTH_STATUS.md · roster ECOSYSTEM_MENU_ROSTER.md

cấm: apps/** · seed · UAT DONE · wipe prior synth §6–§11
```

---

*PO-ECO-TC-SYNTH-WAVE-C-DELTA-01 · qa PASS_TO_PM*
