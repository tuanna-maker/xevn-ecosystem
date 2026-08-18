# Evidence — PO-ECO-TC-SYNTH-WAVE-B-DELTA-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-ECO-TC-SYNTH-WAVE-B-DELTA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **mode** | Design-only SYNTH — **no browser** · **no seed** · **no UAT/Phase1 DONE** |

---

## 1. completion_report

**Closed**

- Scanned **8 Wave B-DELTA packs** + prior **13 SYNTHED packs** + spine `PO_SPEC_TEST_CASE_CATALOG.md` (53 TC).
- Documented **9 cross-pack ID overlaps** (supersede / journey split — see §2.3); **0** depth ID equals spine primary string.
- Roster leaf rows for INS · SETTINGS · PERF · CC-HOME/KPI · WF · CATALOG-CC · MOB-PROFILE/SETTINGS/SCOPE gộp → **SYNTHED**.
- `PO_SPEC_TEST_REPORT.md` **§9** Wave B-DELTA rollup appended (incl. **BUILD_GAP-MD-PANEL-01**).
- `testcases/README.md` index + cumulative totals updated.

**Residual (non-blocking for synth PASS)**

| ID | Item | Owner hint |
|----|------|------------|
| **TC-J-HP-001..003** | Same ID in **XBOS-ORG-SHARE** (Wave A) vs **XBOS-CC-HOME-KPI** (J-CC-01/03 L2.5) | Author refresh → `TC-CC-J-HP-00n` in KPI pack; ORG-SHARE remains canonical for settings/shareholder J-CC-02 chain |
| **TC-XIC-CC-*** | Legacy rows in **INBOX-CAT** §4.4 vs **TC-CCC-*** in **CATALOG-CC** | Execution UF-14 → **CATALOG-CC**; INBOX rows = deprecated pointer (§6 supersede table) |
| **BUILD_GAP-MD-PANEL-01** | `MasterDataSettingsPanel.tsx` missing — SETTINGS TC **PLANNED** design only | **dev-fe** restore before MD bucket execution |
| **SPEC_GAP-HDSD-EMP-01** | HDSD leaf Nhân sự | **ba-docs** (unchanged) |
| **LV-02 / TC-LV-03** | Ladder `T_L1`/`N` | **SA/BA** (unchanged) |
| TC row grep vs author footer | Bold `**TC-* **` rows in MOB packs; §4+§5 trace echo | Same class as Wave A/B — **defer** optional pack cleanup |

---

## 2. TC-ID collision scan

### 2.1 Method

- Regex: `^\| (TC-[A-Z0-9-]+) \|` on matrix/trace tables; filter header `TC-ID`.
- Supplement: MOB packs also use `| **TC-* **` — author footer counts authoritative for those files.
- Spine: catalog §2–§6 primary IDs.

### 2.2 Cross-file (21 depth packs + spine)

| Result | Count |
|--------|------:|
| Pack files (excl. template/README) | **21** |
| **Globally unique** depth TC-IDs | **1095** |
| Matrix `\| TC-* \|` rows (all packs, incl. echo) | **1247** |
| Depth ID **equals** spine primary ID | **0** |
| **Cross-pack same ID, different files** | **9** |

Prior A+B batch-1: **768** unique · **859** claimed rows → after DELTA: **+327** net unique IDs · **+381** author claimed rows → **1240** cumulative claimed · **1095** unique.

### 2.3 Resolve table (cross-pack — no renames applied in synth)

| TC-ID | Pack A | Pack B | Resolution |
|-------|--------|--------|------------|
| `TC-XIC-CC-HP-001` | `XBOS-INBOX-CAT.md` | `XBOS-CATALOG-CC.md` | **Supersede:** canonical UF-14 CC catalog mutate = **`TC-CCC-DOC-HP-001`**; legacy ID = pointer only |
| `TC-XIC-CC-HP-002` | INBOX-CAT | CATALOG-CC | → **`TC-CCC-DOC-HP-002`** |
| `TC-XIC-CC-HP-003` | INBOX-CAT | CATALOG-CC | → **`TC-CCC-MEAS-HP-001`** |
| `TC-XIC-CC-HP-004` | INBOX-CAT | CATALOG-CC | → **`TC-CCC-PRC-HP-001`** |
| `TC-XIC-CC-FD-001` | INBOX-CAT | CATALOG-CC | → **`TC-CCC-LOAD-FD-001`** |
| `TC-XIC-CC-BD-001` | INBOX-CAT | CATALOG-CC | → **`TC-CCC-DOC-BD-001`** |
| `TC-J-HP-001` | `XBOS-ORG-SHARE.md` (J-CC-02 settings chain) | `XBOS-CC-HOME-KPI.md` (J-CC-01 home load) | **Split by journey:** keep ORG-SHARE ID for UF-02/05; KPI pack should adopt **`TC-CC-J-HP-001`** on author refresh |
| `TC-J-HP-002` | ORG-SHARE | CC-HOME-KPI (J-CC-03 KPI) | → **`TC-CC-J-HP-002`** / **`TC-KPI-J-HP-002`** proposed for KPI pack |
| `TC-J-HP-003` | ORG-SHARE | CC-HOME-KPI (L2.5 back nav) | → **`TC-CC-J-HP-003`** proposed for KPI pack |

**Synth counting:** Unique ID map counts each of the 9 IDs **once** globally; author **claimed** row totals include both files until pack cleanup.

### 2.4 Delta pack namespaces (disjoint from each other)

| Prefix / pack | Sample IDs | Cross delta collision |
|---------------|--------------|------------------------|
| `TC-INS-*` | HRM-INSURANCE | **0** |
| `TC-SET-*` | HRM-SETTINGS | **0** |
| `TC-PERF-*` | HRM-PERFORMANCE | **0** |
| `TC-CC-*` · `TC-KPI-*` · `TC-ACT-*` · `TC-AU-PTR-*` | CC-HOME-KPI | **0** (except `TC-J-HP-*` vs ORG) |
| `TC-WFD-*` | WF-DESIGNER | **0** |
| `TC-CCC-*` | CATALOG-CC | **0** vs delta (XIC legacy vs INBOX only) |
| `TC-MOB-PROF-*` | MOB-PROFILE | **0** |
| `TC-MOB-SET-*` · `TC-MOB-SCP-*` | MOB-SETTINGS | **0** |

### 2.5 Spine ↔ depth neo map (DELTA additions)

| Spine TC-ID | Depth pack TC-ID(s) | Theme |
|-------------|---------------------|-------|
| **TC-HP-01** | `TC-WFD-CRT-HP-*` · `TC-WFD-PST-HP-001` | WF designer create/publish |
| **TC-HP-03** | `TC-WFD-CHAIN-HP-002` · **XREF** `TC-XIC-WF-*` (INBOX pack) | Inbox complete chain |
| **TC-HP-04** | `TC-WFD-CHAIN-FD-001` | Self-approve BR-WF-04 |
| **TC-X-03** | `TC-CCC-*` (UF-14) · gov `TC-XIC-CG-*` (INBOX) | Catalog publish vs CC autosave |
| **TC-AT-01** | `TC-MOB-PROF-SET-HP-003` · `TC-MOB-SET-HP-004` | Settings → update-request entry |
| **TC-MOB-006** · **032** · **033** | `TC-MOB-SET-REG-006/032/033` · `TC-MOB-SCP-REG-033` | Mobile scope/settings registry |
| UF-XBOS-10 | `TC-KPI-HP-*` · `TC-CC-HP-*` | CC home KPI rail |
| **J-HRM-04** | `TC-INS-NAV-HP-001` | Insurance ↔ employee profile |

Spine **53 TC unchanged**.

---

## 3. FK / cross-menu (DELTA highlights)

| Edge | Canonical pack | Notes |
|------|----------------|-------|
| WF designer → Inbox approve | **XBOS-WF-DESIGNER** → **XBOS-INBOX-CAT** | 4 inbox **XREF** TC in WF pack |
| UF-14 CC catalog vs UF-09 gov | **XBOS-CATALOG-CC** vs **XBOS-INBOX-CAT** | `TC-CCC-XREF-001` pointer |
| Insurance policy ↔ employee | **HRM-INSURANCE** ↔ **HRM-EMPLOYEES** | Profile tab OOS duplicate · `TC-INS-PROF-X-001` spot |
| Performance CC CTA | **HRM-PERFORMANCE** | Not full iframe — `TC-PERF-L-HP-002` |
| MOB Profile ↔ Leave/ATT | **MOB-PROFILE** | Entry-only tiles → **MOB-LEAVE-APPR** · **MOB-ATTENDANCE** |
| MOB Settings ↔ Scope | **MOB-SETTINGS** | `TC-MOB-SCP-*` gộp roster **MOB-SCOPE** |
| SETTINGS MD buckets | **HRM-SETTINGS** | **BLOCKED execution** until **BUILD_GAP-MD-PANEL-01** closed |

---

## 4. Wave B-DELTA rollup (authoritative pack handoffs)

| pack_path | TCs | Screens | Fields | Functions | Synth |
|-----------|----:|--------:|-------:|----------:|-------|
| `hrm-web/HRM-INSURANCE.md` | 87 | 13 | 62 | 39 | **SYNTHED** |
| `hrm-web/HRM-SETTINGS.md` | 76 | 33 | 86 | 56 | **SYNTHED** |
| `hrm-web/HRM-PERFORMANCE.md` | 58 | 13 | 28 | 15 | **SYNTHED** |
| `xbos/XBOS-CC-HOME-KPI.md` | 36 | 12 | 38 | 16 | **SYNTHED** |
| `xbos/XBOS-WF-DESIGNER.md` | 30 | 7 | 22 | 12 | **SYNTHED** |
| `xbos/XBOS-CATALOG-CC.md` | 28 | 6 | 28 | 13 | **SYNTHED** |
| `hrm-mobile/MOB-PROFILE.md` | 36 | 14 | 42 | 30 | **SYNTHED** |
| `hrm-mobile/MOB-SETTINGS.md` | 30 | 14 | 36 | 18 | **SYNTHED** |
| **Wave B-DELTA total** | **381** | **112** | **302** | **189** | — |

**Cumulative Wave A + B batch-1 + B-DELTA:** **21** packs · **1240** claimed TC rows · **1095** globally unique depth IDs · **401** screen rows · **1061** field rows · **634** function rows.

---

## 5. Handoff

```
completion_report: Wave B-DELTA 8 packs SYNTHED; collision resolve documented; BUILD_GAP noted
next_owner: pm
next_dispatch_prompt: (see PM packet — Wave C stubs OR ba-docs SPEC_GAP-HDSD-EMP-01 OR qa after MD panel restore)
evidence_path: docs/qa/evidence/po-eco-tc-synth-wave-b-delta-01.md
ack_status: PASS_TO_PM
```
