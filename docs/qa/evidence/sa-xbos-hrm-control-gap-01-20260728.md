# SA-XBOS-HRM-CONTROL-GAP-01 — XBOS control of HRM master data

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-XBOS-HRM-CONTROL-GAP-01` |
| **from_role** | pm |
| **to_role** | sa |
| **lane** | governance G0 — architecture/docs only · **no** `apps/**` |
| **date** | 2026-07-28 |
| **program** | `P-HRM-MD-PICKER-01` |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Question & verdict

**Q:** Does XBOS currently have enough catalog/governance capabilities to **CONTROL** HRM module master data along:

`group library → copy to company → company extension → HRM consume`?

| Verdict | **PARTIAL** |
|---------|-------------|
| Meaning | **Spine L0→L1→L2a exists** (publish / apply-to-members / pull / extension WF) for a **narrow allow-list** of keys — enough to control **chức danh (`job_titles`)** end-to-end at API/design level. **Not enough** to claim full DANH_MUC (72 STT + 15 XBOS-DM-HRM UC) as controlled SoT for every HRM picker field (leave/dept/decision/pay/fleet/…). |
| Phase1 / PROD | **Not claimed** · HOLD_DEPLOY unchanged |

### Top gaps (P0 → P2)

| # | Gap | Severity |
|---|-----|----------|
| G1 | `apply-to-members` allow-list = `job_titles`, `recruitment_channels`, `job_grades` only — **excludes** P0 Settings keys `departments`, `leave_types` (+ DEC/PAY) | **P0 control coverage** |
| G2 | `apply-to-members` in `API_DESIGN_XBOS_CATALOG_GOV.md` = **F.1-lite cite only** (no Mục đích / Diễn biến / DTO↔DB full) while OpenAPI has op | **P1 U71 depth** |
| G3 | Dual SoT surfaces: `config-sync` L0 vs `business-master/positions` (UC-XBOS-MD-01) — risk of fork for «chức danh» | **P1 arch** |
| G4 | DANH_MUC STT 15–54 / DM-HRM-02..06,11–15 = matrix «Một phần — pattern API» · no canonical key map for full catalog set | **P1 breadth** |
| G5 | FE apply-to-members historically **ABSENT** (QA 2026-07-22); governance cannot claim ops UI complete without G1 FE AC | **P2 UX** (execution later) |
| G6 | HRM **consumer picker bind** (AC-HRM-PICKER-01) orphan on Work History — **HRM FE gap**, not XBOS L0 missing | **P0 product** (E1 after G1) |

---

## 2. Spec says (normative chain)

| Layer | Artifact | Lock |
|-------|----------|------|
| Ownership | `TECHSPEC.md` §18.1 · ADR Settings SoT S1 | Group master = **XBOS**; HRM = snapshot + extension; **cấm** HRM invent master |
| DANH_MUC | `docs/hrm/DANH_MUC_XBOS_CHO_HRM.md` §1–§14 | STT 7–10 chức danh/phòng/vị trí; UC **XBOS-DM-HRM-07..10** copy/publish/sync |
| HRM picker | `SRS.md` §16.0 **BR-HRM-MD-01** · **AC-HRM-PICKER-01** · FR-HRM-SC-* | Consumer = Select/combo; free-text SoT forbidden |
| XBOS L0 API | `API_DESIGN_XBOS_CATALOG_GOV.md` A–G | publish · get/list · start/inbox/approve |
| HRM L1/L2a | `API_DESIGN_HRM_SETTINGS_CATALOG.md` · `DB_DESIGN_HRM_SETTINGS_CATALOG.md` | `synced_catalogs` + `hrm_catalog_extension_*` · keys `leave_types` / `departments` / `job_titles` |
| OpenAPI | `docs/api/openapi/xbos-api.yaml` | `configSyncPublishCatalog` · `configSyncApplyCatalogToMembers` · `catalogGovernance*` |

### Target control flow (architecture)

```text
XBOS FE / CC
  │ POST …/config-sync/catalog/{key}/publish          → L0 config_catalogs (holding)
  │ POST …/config-sync/catalog/{key}/apply-to-members → L0 copy → member partitions
  ▼
GET …/config-sync/catalog/{key}?target=hrm            → pull upstream
  ▼
HRM POST …/catalog-sync/pull/:key | sync-from-xbos    → L1 synced_catalogs
  │ optional: company extension request + WF
  │   POST …/catalog-governance/workflows/start
  │   POST …/catalog-governance/tasks/{id}/approve    → L2a extension items
  ▼
GET …/settings-catalogs[/{key}/items]                 → effectiveItems
  ▼
Consumer forms (picker bind)                          → persist catalog code (not free-text)
```

---

## 3. Capability matrix

| Capability | Spec UC / FR | Impl / design status | Risk | Recommended WI |
|------------|--------------|----------------------|------|----------------|
| Group job-title library (L0 publish) | DANH_MUC STT 7 · UC-XBOS-02/05 · FR-XBOS-CAT-* | **HAS** — OpenAPI publish + API_DESIGN A F.1 + DB L0 | Low if ops use config-sync not BM fork | Keep; G1 clarify SoT vs BM |
| Copy library → member company | **XBOS-DM-HRM-07** · G-BM-REC-01 | **PARTIAL** — OpenAPI `apply-to-members` + `XBOS-CFG-204`; allow-list narrow; API_DESIGN F.1-lite; FE wizard residual | Holding→member ops incomplete for dept/leave | `BA-HRM-MD-SRS-DELTA-01` (AC copy keys) · `SA-HRM-MD-TECHSPEC-01` · `BA-HRM-MD-DB-API-01` (expand allow-list F.1) |
| Per-company position overlay | STT 8–10 · FR-HRM-SC-POS-01 · FR-HRM-SC-EXT-01 | **HAS** (pattern) — HRM extension + CAT-02/05 WF approve | Silent overwrite master without policy | Keep ADR S1; G1 AC extension≠L0 |
| Publish version (L0 checksum) | XBOS-DM-HRM-09 · UC-XBOS-05 | **HAS** — `POST …/publish` · version/checksum | Confusion with `/version/publish` (SRS table) vs catalog publish | `SA-HRM-MD-TECHSPEC-01` alias note |
| Sync XBOS → HRM pull | XBOS-DM-HRM-10 · UC-HRM-06/08 · FR-HRM-06/08 | **HAS** — Settings F/G + catalog-sync ALIGNED TechSpec §16.2 | Empty honest OK (U65) | Keep must_keep Settings pair |
| Extension approve governance | XBOS-DM-HRM-04/05 · FR-XBOS-CAT-02/05 · UF-09/15 | **HAS** — start/inbox/approve F.1; reject P3 residual | Empty inbox valid | Keep; BA reject Diễn biến optional P3 |
| Assign catalogs to HRM target | XBOS-DM-HRM-08 · `assigned_systems` ∋ `hrm` | **HAS** (publish DTO) | Mis-assign → pull miss | G1 validation AC |
| Canonical keys leave/dept/job_titles | FR-HRM-SC-LEAVE/POS · DB_DESIGN §2.1 | **HAS** design | Alias `positions` vs `job_titles` confusion | G1 lock publish canonical |
| Fan-out leave_types / departments | same FR · DM-07 analog | **MISSING** on allow-list | Company cannot inherit group leave/dept via same API | `BA-HRM-MD-DB-API-01` expand allow-list |
| Decision / pay / contract catalogs | STT 27–36 · FR-SC-DEC/PAY | **PARTIAL** — DB cite-only keys; no XBOS F.1 catalog set | Pickers invent free-text | G1 key inventory + TechSpec map |
| Field-group presets (6 nhóm HS) | STT 15–20 · DM-HRM-02/12 | **PARTIAL** — CC `groupHrCatalogApi` + extension-items (TechSpec §11.4) | Parallel to L0 config-sync | G1 boundary: field defs vs code catalogs |
| Import pre-check missing catalogs | XBOS-DM-HRM-11 | **PARTIAL** / pattern | Import without gate | Later IM lane (out of picker G0) |
| Catalog change history | XBOS-DM-HRM-15 · `catalog_audit_logs` | **PARTIAL** — L0 audit table; FE history UC thin | Audit not productized | P2 |
| Dual BM positions surface | UC-XBOS-MD-01 `business-master/positions` | **PARTIAL** / fork risk | Two «chức danh» SoTs | `SA-HRM-MD-TECHSPEC-01` **must_keep**: L0 `job_titles` = HRM picker SoT |
| Consumer picker bind (WH Vị trí) | BR-HRM-MD-01 · AC-HRM-PICKER-01 | **MISSING** (HRM FE) — Settings may exist; form Input free-text | Orphan picker = sponsor symptom | E1 `D-FE-HRM-WH-POSITION-PICKER-01` **after** G1 (not this WI) |
| OpenAPI HRM settings-catalogs | UC-HRM-06..08 | **PARTIAL** — design in API_DESIGN; `hrm-api.yaml` grep thin / path variance | Contract drift | `BA-HRM-MD-DB-API-01` OpenAPI sync cite |
| Full DANH_MUC 72 STT control | DANH_MUC §2–§12 | **MISSING** as unified control plane | Over-claim «XBOS đủ» | G1 scope: P0 picker keys first |

**Status legend:** HAS = design + OpenAPI/API_DESIGN sufficient for control claim on that capability · PARTIAL = exists but incomplete coverage/depth/UX · MISSING = no enforceable control path.

---

## 4. OpenAPI vs DANH_MUC / TechSpec (read-only)

| OpenAPI op | Path | Maps to | Gap note |
|------------|------|---------|----------|
| `configSyncPublishCatalog` | `POST /config-sync/catalog/{catalogKey}/publish` | DM-09 · UC-02/05 | HAS |
| `configSyncApplyCatalogToMembers` | `POST …/apply-to-members` | **DM-07** | Allow-list ≠ P0 Settings keys full set |
| `configSyncGetCatalog` / `ListCatalogs` | GET catalog(s) | UC-03/04 · HRM pull upstream | HAS |
| `configSyncBootstrapXevn` | bootstrap | Dev only | **Cấm** U65 evidence |
| `catalogGovernanceStartWorkflow` / `Inbox` / `ApproveTask` | catalog-governance/* | DM-04/05 · FR-CAT-02/05 | HAS |
| `catalogGovernanceListPending` | extension-requests | UC-CAT-01 | HAS (proxy HRM) |
| business-master positions | `/business-master/…` | UC-XBOS-MD-01 | **Not** same as L0 `job_titles` — fork risk |

Matrix `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` STT 248–262: only **DM-09/10** marked «Có — endpoint»; **DM-01..08,11..15** = «Một phần — pattern API» — **aligns with PARTIAL verdict**.

---

## 5. Facts vs assumptions

### Facts (from docs)

1. Ownership model §18.1 + Settings/CATALOG_GOV F.1 pairs exist (U71 2026-07-27).
2. OpenAPI documents apply-to-members with explicit allow-list of **3 keys**.
3. HRM P0 canonical keys are **leave_types / departments / job_titles** — only `job_titles` overlaps allow-list.
4. Extension WF path (start → inbox → approve → HRM review) is F.1-complete for CAT-02/05.
5. Program symptom (Work History Vị trí Input) is **consumer bind** failure under BR-HRM-MD-01 — Settings/catalog path may already exist.

### Assumptions

1. Runtime Nest controllers still match OpenAPI allow-list (docs-only WI — not re-probed live this seat).
2. FE apply CTA may have landed after 2026-07-22 sync WI — **does not** close G1 allow-list breadth.

### Non-goals this WI

- No `apps/**` · no Dev · no Phase1/PROD · no seed · no claim picker E1 ready.

---

## 6. Decision options (control sufficiency)

| Option | Summary | Trade-off |
|--------|---------|-----------|
| **A — Claim YES** | Spine exists for job_titles | **Reject** — over-claims DANH_MUC + leave/dept fan-out |
| **B — Claim NO** | Force rebuild XBOS catalog | **Reject** — destroys UF-09/15 🟢 + U71 pairs |
| **C — PARTIAL + G1 key-scope** *(recommended)* | Keep spine; G1 locks P0 key set, expand apply allow-list + F.1, resolve BM vs L0, then E1 picker | Minimal blast; U71-safe |

**Recommendation: Option C.**

---

## 7. G1 dispatch package (docs only — no Dev)

Ordered pipeline after SYNTH + sponsor chốt (U74):

1. `BA-HRM-MD-SRS-DELTA-01` — ADD AC: allow-list keys · copy DM-07 Diễn biến · picker persist `code` · dual-surface BM forbidden for HRM picker  
2. `SA-HRM-MD-TECHSPEC-01` — TechSpec `ref_srs` picker contract + L0 key map + apply-to-members F.1 full  
3. `BA-HRM-MD-DB-API-01` — DB_DESIGN + API_DESIGN delta (expand allow-list; OpenAPI cite; no Nest yet)

**Exit G1:** sponsor confirm → then E1 FE/BE picker WIs.

---

## 8. Handoff

### completion_report

**Closed:** G0 SA control-gap vs DANH_MUC + TechSpec §18.1 + CATALOG_GOV/Settings pairs + OpenAPI config-sync/catalog-governance — verdict **PARTIAL** with capability matrix + top gaps G1–G6.  
**Residual:** G1 spec/design depth; peer Claude SA seat may contradict — SYNTH before Dev; E1 picker blocked until G1.

### next_owner

`pm` (SYNTH / U74) → then `ba-process` G1

### next_dispatch_prompt

```text
work_item_id: BA-HRM-MD-SRS-DELTA-01
from_role: pm
to_role: ba-process
lane: governance G1 — docs only; NO apps/**; NO Dev
entry_criteria:
  - SA-XBOS-HRM-CONTROL-GAP-01 PASS_TO_PM evidence docs/qa/evidence/sa-xbos-hrm-control-gap-01-20260728.md
  - Peer SYNTH or sponsor chốt Option C (PARTIAL + expand control keys) — U74
  - read_first: docs/hrm/SRS.md §16.0 BR-HRM-MD-01 · FR-HRM-SC-* · docs/hrm/DANH_MUC_XBOS_CHO_HRM.md XBOS-DM-HRM-07..10 · evidence SA gap §3 matrix
exit_criteria:
  1. ADD-only SRS delta: AC for (a) apply-to-members keys must cover P0 leave_types+departments+job_titles; (b) consumer persist catalog code; (c) business-master/positions ≠ HRM picker SoT
  2. Diễn biến for XBOS-DM-HRM-07 copy library → member → HRM pull
  3. evidence_path: docs/qa/evidence/ba-hrm-md-srs-delta-01-20260728.md
  4. PASS_TO_PM + next_dispatch_prompt for SA-HRM-MD-TECHSPEC-01 then BA-HRM-MD-DB-API-01
  5. cấm apps/** · cấm Phase1/PROD claim · cấm wipe stub FR
```

### evidence_path

`docs/qa/evidence/sa-xbos-hrm-control-gap-01-20260728.md`

### ack_status

**PASS_TO_PM**
