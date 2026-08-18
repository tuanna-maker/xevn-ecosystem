# Evidence — `PO-HRM-JD-DYNAMIC-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-JD-DYNAMIC-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-06 |
| **lane** | L3 gate — JD dynamic CFG + Thư viện JD L2.5 (`J-HRM-JD-01..03` + G4) |
| **priority** | P1 |
| **portal_url** | `http://127.0.0.1:5173` · persona `ceo@xe.vn` · `company_id=main` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-hrm-jd-dynamic-qa-03.md`](po-hrm-jd-dynamic-qa-03.md) PASS_TO_PM |
| **runtime** | [`_tmp-po-hrm-jd-dynamic-qa-03.FINAL.json`](_tmp-po-hrm-jd-dynamic-qa-03.FINAL.json) verdict **PASS** · `failReasons=[]` · mutates_count=6 |
| **fe_ref** | [`po-hrm-jd-dynamic-fe-03.md`](po-hrm-jd-dynamic-fe-03.md) READY_FOR_QA (FE-RESOLVE-GROUPS-MAP + FE-RULES-PUT-STRIP) |
| **be_ref** | [`po-hrm-jd-dynamic-be-02.md`](po-hrm-jd-dynamic-be-02.md) READY (BE-COMPILE-BLOCK CLOSED) |
| **prior_fail** | [`po-hrm-jd-dynamic-qa-02.md`](po-hrm-jd-dynamic-qa-02.md) FAIL — residuals closed by FE-03 + QA-03 |
| **screens** | `docs/qa/evidence/screens/po-hrm-jd-dynamic-qa-03/` (15 PNG: 01–12, 14–16) |
| **spec_ref** | `PO-HRM-JD-DYNAMIC-SPEC-01` · GROUP-SPEC AC resolve · ARCH §3.6 snapshot · U65 |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · no dual-write `job_postings` |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · `remaster_program_done` · `face_live` · `jd_dynamic_done` · full program GO |
| **jd_dynamic_done** | **false** (must_keep honesty) |
| **remaster_program_done** | **false** |
| **face_live** | **false** |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded JD-dynamic L2.5 slice: **J-HRM-JD-01** Settings field create **201** + rules PUT **200** + F5 persist; **J-HRM-JD-02** pack resolve + canvas `jd-writer-group-*=6` + POST `job-templates` **201** + GET snapshot `groupsLen=6` + F5 row `QAH1BVIR`; **J-HRM-JD-03** wave Xem hierarchy (`jd-view-group-*` ≥1); **G4** pack-confirm + title kept. Prior QA-02 P0/P1 FE residuals **CLOSED**. Soft OBS (IT catalog → `PACK_CORP_DEFAULT`; Driver Settings preview miss) = **conditions only**. **NOT** `jd_dynamic_done` / remaster / face / Phase 1 / product GO.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `po-hrm-jd-dynamic-qa-03.md` | PASS_TO_PM · J01..03+G4 🟢 · residuals FE CLOSED · soft OBS open · honesty flags false | **ACCEPT** |
| `_tmp-po-hrm-jd-dynamic-qa-03.FINAL.json` | verdict PASS · critical checks all true · mutates=6 · pageErrors=[] · seed_used=false · jd_dynamic_done_claimed=false | **ACCEPT** Network SoT |
| `po-hrm-jd-dynamic-fe-03.md` | READY_FOR_QA · normalize always_on + rules PUT strip · vitest 10/10 | **ACCEPT** upstream |
| `po-hrm-jd-dynamic-be-02.md` | READY · CFG/resolve 200 · compile 0 errors | **ACCEPT** upstream |
| `po-hrm-jd-dynamic-qa-02.md` | FAIL · FE-RESOLVE-GROUPS-MAP P0 · FE-RULES-PUT-STRIP P1 | **CLOSED** by FE-03 + QA-03 |
| Screens 01–12, 14–16 | 15 files on disk | **ACCEPT** |

---

## Gate AC audit

| # | AC | Runtime / evidence | QC |
|---|-----|---------------------|-----|
| 1 | J-HRM-JD-01 rules PUT 2xx + F5 | JSON `J01_rules_save_2xx` PUT **200** · `J01_rules_f5_persist` afterLen=3137 · field POST **201** · fieldRows 7→8 | 🟢 **PASS** |
| 2 | J-HRM-JD-02 create + snapshot groups + F5 | canvas groups=6 · POST job-templates **201** · GET `b284e4cd-…` groupsLen=6 · F5 row `QAH1BVIR` · PNG 09/12 | 🟢 **PASS** |
| 3 | J-HRM-JD-03 wave hierarchy view | `J03_hierarchy_from_snapshot` panel=true viewGroups=1 hardcodeSmell=0 · PNG 14 | 🟢 **PASS** (scoped — wave Xem; YCTD attach **not** in this pack) |
| 4 | G4 confirm + merge keep title | `G4_confirm_dialog` confirm shown · kept=true · PNG 15 | 🟢 **PASS** |
| 5 | FE-RESOLVE-GROUPS-MAP CLOSED | QA-02 FAIL → FE-03 normalize → QA-03 canvas=6 + create 201 | 🟢 **CLOSED** |
| 6 | FE-RULES-PUT-STRIP CLOSED | QA-02 PUT 400 → FE-03 strip → QA-03 PUT 200 + F5 | 🟢 **CLOSED** |
| 7 | U65 · no seed · no dual-write | honesty seed_used=false · dual_write_job_postings=false · mutates via FE | 🟢 **PASS** |
| 8 | Honesty no remaster/face/jd_dynamic_done | JSON + QA + QC all **false** | 🟢 **PASS** |
| 9 | Soft OBS not NO-GO | OBS-IT-POSITION-CONFIG · OBS-DRIVER-UI-PREVIEW | 🟡 **CONDITION** |

---

## L2.5 J-* audit (U19)

| Journey | Evidence | QC stamp |
|---------|----------|----------|
| **J-HRM-JD-01** | Settings Cấu hình JD · field 201 · rules PUT 200 · F5 · PNG 01–06 | ✅ **PASS** (browser L2.5) |
| **J-HRM-JD-02** | Thêm JD · resolve · canvas groups=6 · create 201 · snapshot GET · F5 · PNG 07–12 | ✅ **PASS** (create+snapshot path; optional DnD palette item OBS — not blocker) |
| **J-HRM-JD-03** | Wave row Xem · `jd-view-group-*` · hardcodeSmell=0 · PNG 14 | ✅ **PASS scoped** (hierarchy view from wave create). **YCTD gắn JD** step in journey map text → **deferred soft** (not exercised this pack) |
| **G4** | Đổi chức danh → `jd-writer-pack-confirm` · Áp pack mới · title kept · PNG 15 | ✅ **PASS** |
| remaster / face / jd_dynamic_done / product GO | Forbidden | **Denied** |

Mandatory in-scope for this gate: **J-HRM-JD-01..03 + G4** browser evidence **PASS** (J03 scoped to wave view). Soft OBS listed as GWC conditions — **not** NO-GO.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | J01 field+rules mutate+F5 · J02 create+snapshot+F5 · J03 wave view · G4 confirm · HDSD testids undefined=0 · FE residuals CLOSED |
| **PROCESS** | QA entry pack `verify:qc:evidence-pack` **8/8 PASS** · this QC pack targets **8/8** |
| **ENV** | L0 hrm/xbos/portal **200** · no ENV blocker |
| **OUT-OF-SCOPE / OBS** | OBS-IT-POSITION-CONFIG (catalog CEO → `PACK_CORP_DEFAULT`; API `job_family=IT` still OK) · OBS-DRIVER-UI-PREVIEW (Settings `position_code=DRIVER` → CORP; API DRIVER → `PACK_DRIVER_OPS`) · YCTD attach step · optional DnD exercise · remaster/face/jd_dynamic_done/Phase1 |

Soft OBS = **GWC conditions** (owners below), not product NO-GO for core J-*.

---

## Residual

| Id | Status | Sev | Owner | Blocks this GO? |
|----|--------|-----|-------|-----------------|
| **FE-RESOLVE-GROUPS-MAP** | **CLOSED** | was P0 | — | No |
| **FE-RULES-PUT-STRIP** | **CLOSED** | was P1 | — | No |
| **BE-COMPILE-BLOCK** | **CLOSED** (prior) | — | — | No |
| **OBS-IT-POSITION-CONFIG** | OPEN soft | P2 | **ba-data / catalog** (or PM config) — map position→`job_family` / rule match; **no seed** | No — CONDITION |
| **OBS-DRIVER-UI-PREVIEW** | OPEN soft | P3 | **dev-fe** (Settings preview resolve by `position_code`) | No — CONDITION |
| J-HRM-JD-03 YCTD attach | OPEN soft | P2 | **qa** later / product wave | No — scoped PASS view-only |
| `jd_dynamic_done` / remaster / face / Phase1 DONE | — | — | — | No — **not claimed** |

**No residual product P0/P1 FAIL** for in-scope J-HRM-JD-01..03 + G4.

---

## Conditions (explicit)

1. **NOT** Phase 1 DONE · **NOT** product UAT DONE · **NOT** PROD-READY from this GWC alone.
2. **Do not** set `jd_dynamic_done=true` · `remaster_program_done=true` · `face_live=true` · invent product GO.
3. **OBS-IT-POSITION-CONFIG** (P2) — catalog pick without IT `job_family` falls to `PACK_CORP_DEFAULT`; API resolve IT still OK. Owner: catalog/BA — **no seed**.
4. **OBS-DRIVER-UI-PREVIEW** (P3) — Settings preview by `position_code=DRIVER` misses `PACK_DRIVER_OPS`; API path PASS. Owner: **dev-fe** (optional follow-up).
5. **J-HRM-JD-03** stamped PASS for **wave Xem hierarchy** only; YCTD «gắn JD» remains soft deferred until a dedicated UF pack.
6. U65: **no seed** · **no dual-write** `job_postings` in acceptance path.
7. Journey map stamp cites this QC evidence — **not** full JD program closed.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-jd-dynamic-qa-03.md
→ PASS: QC evidence pack ready (8/8)
```

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-jd-dynamic-qc-01.md
→ PASS: QC evidence pack ready (8/8)
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-jd-dynamic-qc-01.md --check-assets
→ PASS: asset check (3 PNG reference(s) OK) · pack 8/8
```

---

## Command / spot table (QC)

| Check | Result |
|-------|--------|
| QA pack verify 8/8 | **PASS** exit 0 |
| FINAL.json critical J01/J02/J03/G4 | **PASS** all true · failReasons=[] |
| FE-03 / BE-02 / QA-02 chain | **ACCEPT** · P0/P1 CLOSED |
| Disk PNG 15 files | **PASS** |
| Spot visual `docs/qa/evidence/screens/po-hrm-jd-dynamic-qa-03/09-jd-writer-after-position.png` | **PASS** — canvas PACK_ALWAYS_ON · pack label · title QAH1BVIR |
| Spot visual `docs/qa/evidence/screens/po-hrm-jd-dynamic-qa-03/12-jd-library-after-f5.png` | **PASS** — row `JD-QA-QAH1BVIR` visible |
| Spot visual `docs/qa/evidence/screens/po-hrm-jd-dynamic-qa-03/15-g4-confirm.png` | **PASS** — dialog «Áp gói mặc định mới?» · Áp pack mới |
| Honesty flags | **PASS** · all denied claims false |

---

## Journey map stamp (optional — done this seat)

`docs/program/PROGRAM_JOURNEY_MAP.md` **J-HRM-JD-01..03** status updated to QC GWC (cite `po-hrm-jd-dynamic-qc-01.md` + QA-03). **Not** full program done.

---

## completion_report

**Closed:** L3 GWC on JD-dynamic browser slice — J-HRM-JD-01..03 + G4 ACCEPT; FE-RESOLVE-GROUPS-MAP + FE-RULES-PUT-STRIP CLOSED; U65 honesty upheld; QA pack 8/8; visual spot 09/12/15 PASS.

**Open / residual:** OBS-IT-POSITION-CONFIG (P2 catalog) · OBS-DRIVER-UI-PREVIEW (P3 FE) · J03 YCTD attach soft deferred · jd_dynamic_done/remaster/face/Phase1 Denied.

**ack_status:** `PASS_TO_PM`

**next_owner:** `pm`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-JD-DYNAMIC-PM-INTAKE-01
role: pm
entry_criteria:
  - QC GWC: docs/qa/evidence/po-hrm-jd-dynamic-qc-01.md
  - J-HRM-JD-01..03 + G4 ACCEPT; FE residuals CLOSED
  - Conditions soft only: OBS-IT-POSITION-CONFIG · OBS-DRIVER-UI-PREVIEW · J03 YCTD deferred
exit_criteria:
  - Update TEAM_WORKING_NOW / pulse — JD dynamic L3 GWC (not jd_dynamic_done)
  - Optional backlog: catalog job_family map (no seed) OR FE Driver preview — defer unless sponsor P0
  - Do NOT claim remaster_program_done · face_live · jd_dynamic_done · product GO · Phase1 DONE
  - Idle-ok on this lane if no P0 residual; continue other open backlog via pm:idle:check
ack_status: PASS_TO_PM | idle-ok
```
