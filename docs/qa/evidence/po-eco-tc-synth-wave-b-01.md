# Evidence — PO-ECO-TC-SYNTH-WAVE-B-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-ECO-TC-SYNTH-WAVE-B-01` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **mode** | Design-only SYNTH — **no browser** · **no seed** · **no UAT/Phase1 DONE** |

---

## 1. completion_report

**Closed**

- Scanned **7 Wave B packs** + **6 Wave A packs** + spine `PO_SPEC_TEST_CASE_CATALOG.md` (53 TC) for TC-ID collisions.
- **Cross-pack collisions:** **0** (exclude header row `TC-ID`; prior false-positive `TC-ID` in all files).
- Documented **XREF / neo-map** edges: MOB-HOME/ATT ↔ MOB-LEAVE-APPR; RACI (UF-07) vs RBAC matrix (UF-13); spine **TC-HP-11** ↔ **TC-PAY-SPINE-HP-001**; Contracts menu (**J-HRM-01/03**) vs Employees §4.6 profile tab (**TC-EMP-C-HP-001**).
- Roster Wave B **7 writer packs** (+ gộp embed/FAB rows) → **SYNTHED**.
- `PO_SPEC_TEST_REPORT.md` §8 Wave B rollup appended; **MENU-05 density ≠ UC-27 DONE** preserved.
- `testcases/README.md` index updated.

**Residual (non-blocking for synth PASS)**

| ID | Item | Owner hint |
|----|------|------------|
| **LV-02 / TC-LV-03** | Ladder `T_L1`/`N` — **SPEC_GAP** | SA/BA · unchanged from Wave A |
| **MENU-05 / UC-27** | Density GWC ≠ product DONE | `TC-DEC-DEN-BLK-001` governance only |
| TC row count vs grep | Author footers **394** TC vs **371** unique `\| TC-* \|` (excl. `TC-ID`) | §4 matrix + §5 trace echo — same class as Wave A |
| **MOB-ATTENDANCE** | Author **39** TC (36 PLANNED + 2 **XREF** + 1 MANUAL) vs 41 matrix rows | **XREF** rows intentional — not duplicate execution |
| Wave B writers still **READY** (not in this synth batch) | HRM-INSURANCE · HRM-SETTINGS · … | PM dispatch or **SYNTH-B-DELTA** when seats return |

---

## 2. TC-ID collision scan

### 2.1 Method

- Regex: `^\| (TC-[A-Z0-9-]+) \|` on each pack matrix/trace tables; filter `id !== 'TC-ID'`.
- Spine: catalog §2–§6 primary IDs (`**TC-…**`).

### 2.2 Cross-file (Wave A + Wave B + spine)

| Result | Count |
|--------|------:|
| Unique depth IDs across **13** packs (deduped globally) | **768** |
| IDs shared by **two different pack files** | **0** |
| Depth ID **equals** spine primary ID (same string) | **0** |

### 2.3 Rename table

**No renames applied** — prefix namespaces disjoint (`TC-CON-*`, `TC-PAY-*`, `TC-DEC-*`, `TC-RACI-*`, `TC-XRM-*`, `TC-MOB-HOME-*`, `TC-MOB-ATT-*` vs Wave A + spine).

### 2.4 Intra-pack duplicate rows (§4 + §5 trace echo)

| Pack | Duplicate ID count (rows − uniq) |
|------|-------------------------------:|
| HRM-CONTRACTS.md | 8 |
| HRM-PAYROLL.md | 11 |
| HRM-DECISIONS.md | 8 |
| XBOS-RACI.md | 8 |
| XBOS-RBAC-MATRIX.md | 6 |
| MOB-HOME.md | 8 |
| MOB-ATTENDANCE.md | 7 |

### 2.5 Spine ↔ depth neo map (Wave B additions — not collisions)

| Spine TC-ID | Depth pack TC-ID(s) | Theme |
|-------------|---------------------|-------|
| **TC-HP-10** | `TC-CON-J01-HP-001` · `TC-CON-J03-*` · `TC-EMP-C-HP-001` (profile tab — **EMP** pack) | J-HRM-01 / contracts surface |
| **TC-HP-11** | **`TC-PAY-SPINE-HP-001`** | HP-06 payroll / payslip honest empty |
| **TC-AT-01..06** | `TC-MOB-HOME-FAB-*` (nav entry) · `TC-MOB-ATT-*` (check-in / update-request) | Mobile ESS — execution depth split HOME vs ATT vs LEAVE-APPR |
| **TC-LV-02** | `TC-MOB-ATT-MGR-UX-001` (**XREF** → MOB-LEAVE-APPR) | Leave approve not duplicated in ATT pack |
| UF-XBOS-07 🟢 | `TC-RACI-*` | Entity RACI cell PUT |
| UF-XBOS-13 🟢 | `TC-XRM-*` | Position-RBAC checkbox matrix — **BR-UF-RACI-SPLIT-01** |

Spine **53 TC unchanged** — Wave A **465** + Wave B **394** claimed catalog PLANNED = **859** author rows; **768** globally unique depth IDs.

---

## 3. Cross-ref (XREF) rows — documented splits

### 3.1 MOB-HOME / MOB-ATTENDANCE ↔ MOB-LEAVE-APPR (Wave A)

| Pack | TC-ID | Role |
|------|-------|------|
| MOB-HOME | `TC-MOB-HOME-FAB-HP-003` · `TC-MOB-HOME-FAB-HP-005` | **Entry only** → stop at wizard / ManagerApprovals |
| MOB-ATTENDANCE | `TC-MOB-ATT-NAV-006` · `TC-MOB-ATT-MGR-UX-001` | **XREF** — execute in **MOB-LEAVE-APPR** §4.1 / §4.6 |
| MOB-LEAVE-APPR | `TC-MOB-LV-NAV-001` · §4.6 MGR leave tab | **Canonical** leave wizard + approve depth |

**Dedupe rule:** No second full wizard TC in HOME/ATT; count **XREF** in ATT pack toward roster **39** author total, not toward duplicate execution.

### 3.2 RACI vs RBAC matrix

| UF | Pack | API lane | TC prefix |
|----|------|----------|-----------|
| **UF-XBOS-07** | XBOS-RACI | `raci-governance/.../matrix/cell` | `TC-RACI-*` |
| **UF-XBOS-13** | XBOS-RBAC-MATRIX | `position-rbac/matrix` | `TC-XRM-*` |

Cross-refs: `TC-RACI-HP-040` (view) · `TC-XRM-SPL-HP-001` (separation) · `SET-RACI-REF` in RACI inventory — **no shared TC-ID**.

### 3.3 Payroll ↔ spine TC-HP-11

- **Canonical depth:** `TC-PAY-SPINE-HP-001` in `HRM-PAYROLL.md` maps catalog **TC-HP-11** / HP-06 / FR-UC-H04.
- Execution policy: CC embed + menu mount; row NV **or** honest empty; **not** blank pane / Vite 500 (cite spine W5 evidence).

### 3.4 Contracts menu vs Employees §4.6

| Surface | Owner pack | Primary TC | Journey |
|---------|------------|------------|---------|
| Menu `/contracts` list → NV / HĐ detail | **HRM-CONTRACTS** | `TC-CON-J01-*` · `TC-CON-J03-*` | **J-HRM-01** · **J-HRM-03** |
| Profile tab **Hợp đồng** nested CRUD | **HRM-EMPLOYEES** §4.6 | `TC-EMP-C-HP-001` (+ §4.6 block **20** TC) | MENU-02b · UF-03 |

**Dedupe rule:** Same business entity, different routes — **no ID collision**; cross-ref in CON §6 + EMP §4.6 index.

---

## 4. Wave B rollup (authoritative pack footers)

| Pack | Screens | Fields | Functions | TCs (claimed) | Evidence |
|------|--------:|-------:|----------:|--------------:|----------|
| `hrm-web/HRM-CONTRACTS.md` | 28 | 52 | 43 | **96** | `po-eco-tc-hrm-contracts-01.md` |
| `hrm-web/HRM-PAYROLL.md` | 38 | 78 | 52 | **96** | `po-eco-tc-hrm-payroll-01.md` |
| `hrm-web/HRM-DECISIONS.md` | 15 | 38 | 27 | **59** | `po-eco-tc-hrm-decisions-01.md` |
| `xbos/XBOS-RACI.md` | 10 | 51 | 13 | **32** | `po-eco-tc-xbos-raci-01.md` |
| `xbos/XBOS-RBAC-MATRIX.md` | 8 | 65 | 13 | **38** | `po-eco-tc-xbos-rbac-01.md` |
| `hrm-mobile/MOB-HOME.md` | 18 | 32 | 19 | **34** | `po-eco-tc-mob-home-01.md` |
| `hrm-mobile/MOB-ATTENDANCE.md` | 14 | 38 | 24 | **39** | `po-eco-tc-mob-attendance-01.md` |
| **Wave B total** | **131** | **354** | **191** | **394** | — |

All depth TC status: **PLANNED** (catalog only).

### 4.1 Combined Wave A + B (synth cumulative)

| Metric | Wave A | Wave B | **A+B sum** |
|--------|-------:|-------:|------------:|
| Menu writer packs | 6 | 7 | **13** |
| TC matrix (claimed) | 465 | 394 | **859** |
| Globally unique depth TC-IDs | (397 A-only) | (371 B-only) | **768** combined |
| Cross-pack ID collisions | 0 | 0 | **0** |

---

## 5. next_owner

**pm** — intake remaining Wave B writers (Insurance, Settings, Performance, …) or **`PO-ECO-TC-SYNTH-WAVE-B-DELTA-01`** when additional READY packs land.

## 6. next_dispatch_prompt

```text
work_item_id: PO-ECO-TC-HRM-INSURANCE-01 (or PO-ECO-TC-SYNTH-WAVE-B-DELTA-01 when Insurance + Settings both READY_FOR_SYNTH)
from_role: pm
to_role: qa

Mission: Remaining Wave B menu TC pack author intake OR delta-SYNTH second batch — dedupe with Wave A+B spine; roster SYNTHED; append PO_SPEC_TEST_REPORT §8 delta; no wipe Wave A/B content.

read_first: docs/qa/evidence/po-eco-tc-synth-wave-b-01.md · docs/qa/evidence/po-eco-tc-synth-wave-a-01.md · roster ECOSYSTEM_MENU_ROSTER.md

cấm: apps/** · seed · UAT DONE · delete prior synth sections
```

---

*PO-ECO-TC-SYNTH-WAVE-B-01 · qa PASS_TO_PM*
