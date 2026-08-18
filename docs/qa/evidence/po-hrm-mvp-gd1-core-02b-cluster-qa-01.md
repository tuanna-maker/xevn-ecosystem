# Evidence — PO-HRM-MVP-GD1-CORE-02B-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-02B-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · UC-BP-CORE-02b) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `CORE02BQA-MSLEDIAQ` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** |
| **uc_ids** | `UC-BP-CORE-02b` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · employees mutate `holding` |
| **Honesty** | `hrm_personnel_uat_ready=false` · `contracts_printable_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | API-01 **CONFIRMED RETAIN** · DATA-01 HOLD · BA-01 O1–O12 · SA Option A · **`EMPCFQA-MSK14LUH`** · **`EMPTOKEXTQA-MSJ57PE1`** · peer **`CORE09DQC1-MSLDR8I3`** must_keep |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-core-02b-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-02b-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-core-02b-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · **DENY** EMPCF=CORE-02b/personnel UAT · **DENY** CORE-09d printable/closed-8 DONE |
| **L0** | hrm/xbos/portal **200** |
| **L2.5 J-*** | **J-HRM-CORE-02B-01..04 PASS** |
| **Physical Network** | `/settings-catalogs*` (15) + `/employees*` (7) |
| **Nest `/core` EMP-CF SoT** | probe + browser **404** `Cannot GET` · **non-404 SoT hits = 0** |
| **Cite seals** | EMPCF **`EMPCFQA-MSK14LUH`** · EXT **`EMPTOKEXTQA-MSJ57PE1`** · peer QC **`CORE09DQC1-MSLDR8I3`** (+ 09c/09b/09a/08/02/01) **RETAIN · not reopened** |
| **FE CTA** | **`R-PLT-EMP-CF-FE-01` P2 HOLD** (≠ mount FAIL) |
| **Dev** | **Dev-BE HOLD** · FE P2 HOLD unless PM promotes — **no invent this seat** |
| **Seed** | **none** |

---

## Spec / seal cite

| Artifact | Cite |
|----------|------|
| API-01 | `docs/program/specs/PO-HRM-MVP-GD1-CORE-02B-CLUSTER-API-01.md` · F-EMP-CF-01..03 · TOK-03 · CNS-01/02 RETAIN |
| BA-01 | AC-CORE-02B-* · AC-PLT-EMP-CUSTOM-01* · J-HRM-CORE-02B-01..04 DRAFT |
| EMPCF QA | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-qa-01.md` · **`EMPCFQA-MSK14LUH`** |
| EXT QA | `docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-ext-qa-01.md` · **`EMPTOKEXTQA-MSJ57PE1`** |
| CORE-09d QC | `docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-qc-01.md` · **`CORE09DQC1-MSLDR8I3`** must_keep |

**Src/dist spot:** `HRM-EMP-CUSTOM-FIELD-KEY` present · `upsertEmpExtensionFieldMergeToken` + `extension_field` · soft `status=draft` · Nest `emp_custom_field` **ABSENT** · Nest `@Controller('core')` EMP-CF **ABSENT** · `profile_groups_json` ensureSchema **ABSENT**.

**FE spot:** `EmployeeFormDialog` binds four catalogs + dynamic fields · `groupHrCatalogApi` → `extension-items` · no Nest `emp_custom_field/effective`.

---

## L0 / L1 seal

| Check | Evidence |
|-------|----------|
| Portal / HRM / XBOS | **200** |
| Four allow-list catalogs GET `…/items` | basic/personal/work/finance → **200** `HRM-SET-200` |
| `GET /api/hrm/core/settings-catalogs/…` | **404** `Cannot GET` — DENY dual |
| `GET /api/hrm/core/employees/me` | **404** `Cannot GET` — DENY dual |
| Scope spot `company_id=du-lich` | **409** `SCOPE_CONTEXT_MISMATCH` (HRM-SCOPE-409 class) |
| POST `…/extension-items` (header scope; **no** body `company_id`) | **201** `HRM-SET-209` · DENY apply KEY on admin CREATE |
| F5 list after CREATE | code `qa_c02b_mslediaq` **active** on `main` |
| TOK `custom.emp.qa_c02b_mslediaq` | origin=`extension_field` · ring=`custom` · domain=`EMP` · status=`active` |
| PATCH invent `zz_invent_c02b_*` | **422** `HRM-EMP-CUSTOM-FIELD-KEY` · **not persisted** |
| Soft-retire DELETE `…/items` | **200** `HRM-SET-200` · `status=draft` · hidden from `active=true` · **no hard wipe** |

---

## Browser U65 — journeys

Persona: portal auth inject · URL `http://127.0.0.1:5173/command-center?settings=company_group_hr` + `/command-center/hrm/employees/{id}` · **zero-seed**.

**hdsd_align:** Command Center → Danh mục hồ sơ nhân sự (Group HR) → Settings EMP field catalogs · Employee form · invent reject · soft-retire.

| J-* | Click path / assert | Network / FE | Verdict |
|-----|---------------------|--------------|---------|
| **J-HRM-CORE-02B-01** | Settings Group HR · four catalogs · CREATE N+1 · F5 | POST `…/hrm_employee_basic_fields/extension-items` **201** `HRM-SET-209` · F5 active · Nest `/core` **0 SoT** · settings_hits≥1 | **PASS** |
| **J-HRM-CORE-02B-02** | Same CREATE → TOK smoke · FE form bind | `custom.emp.qa_c02b_mslediaq` origin=`extension_field` · cite **`EMPTOKEXTQA-MSJ57PE1`** · EmployeeForm four-catalog bind | **PASS** |
| **J-HRM-CORE-02B-03** | EFF>0 invent free-text on employee save | L1+browser PATCH → **422** `HRM-EMP-CUSTOM-FIELD-KEY` · F5 no invent · cite **`EMPCFQA-MSK14LUH`** | **PASS** |
| **J-HRM-CORE-02B-04** | Soft-retire · CB/public seals · honesty · CTA HOLD | DELETE → `draft` + picker hide · Nest `/core` DENY · peers CORE-09d..01 cite · **`R-PLT-EMP-CF-FE-01` P2 HOLD** · honesty false | **PASS** |

Mutated samples (evidence only — **≠** personnel UAT DONE):
- Extension: `qa_c02b_mslediaq` / catalog `hrm_employee_basic_fields` → soft-retired `draft`
- Token: `custom.emp.qa_c02b_mslediaq` (active at CREATE; soft after retire)
- Invent reject: `zz_invent_c02b_mslediaq` on employee `2b4cbc90-fb74-4a2d-9fef-d188d4e48d61`
- Employee: `HIRE-HOLDIN-MSL5T540DDDE8E` (holding)

Screens: `01-group-hr` · `02-employees` · `03-after-invent-attempt` · `04-done`.

---

## AC map (smoke)

| AC | Result |
|----|--------|
| **AC-CORE-02B-01** groups=four catalogs | **PASS** |
| **AC-CORE-02B-02** CREATE N+1 F5 · no Nest `/core` | **PASS** `201`/`HRM-SET-209` |
| **AC-CORE-02B-03** TOK origin=`extension_field` | **PASS** + cite EXT |
| **AC-CORE-02B-04** form bind EFF | **PASS** FE spot + employees Network |
| **AC-CORE-02B-05** `profile_groups_json` OUT | **PASS** HOLD invent (src spot absent) |
| **AC-CORE-02B-06** invent KEY | **PASS** `422` + cite EMPCF |
| **AC-CORE-02B-07** soft-retire draft + hide | **PASS** |
| **AC-CORE-02B-08** finance/public must_keep | **PASS** cite CORE-02/01 seals (no reopen) |
| **AC-CORE-02B-FE-HOLD** CTA P2 | **PASS_HOLD** `R-PLT-EMP-CF-FE-01` |
| **AC-CORE-02B-H** honesty / ≠ EMPCF DONE / ≠ 09d printable | **PASS** |

---

## Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-PLT-EMP-CF-FE-01** | P2 | PM / FE (only if promoted) | Empty EFF CTA banner **HOLD** — soft omit PASS · ≠ mount FAIL · **DENY** Dev invent |
| — | — | — | **No P0/P1** this seat · Dev-BE **HOLD** |

**What worked (must not regress):** physical `/settings-catalogs*` + `/employees*` only · four catalogs = groups · CREATE omit body `company_id` · TOK `extension_field` same-TX · invent KEY when EFF>0 · soft-retire `draft` · Nest `/core` DENY · Nest `emp_custom_field` DENY · C-SLICE honesty false.

---

## DENY / honesty

| Item | Status |
|------|--------|
| Nest `/core/*` EMP-CF SoT dual | **DENY** — L1+browser **404** · non-404 SoT **0** |
| Nest `emp_custom_field` / mega-EAV | **DENY** |
| `profile_groups_json` primary | **HOLD invent / OUT** |
| Apply `HRM-EMP-CUSTOM-FIELD-KEY` on admin CREATE | **DENY** (CREATE 2xx without KEY) |
| Hard wipe on retire | **DENY** — row remains `draft` |
| Claim EMPCF L1/FE = CORE-02b / personnel UAT | **DENY** |
| Claim CORE-09d printable / closed-8 DONE | **DENY** |
| Flip `hrm_personnel_uat_ready` / `contracts_printable_ready` | **false** LOCKED |
| Reopen sealed J-HRM-CORE-09D/09C/09B/09A/08/02/01 | **DENY** |
| `pnpm seed:*` / API fake for UF pass | **not used** |
| Module CORE / personnel UAT / Phase1 DONE | **DENY** — **C-SLICE** |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-02b-cluster-qa-01.md` |
| **completion_report** | U65 cite/smoke PASS — L0 OK; J-01 CREATE extension **201** `HRM-SET-209` + F5 four-catalog groups + Nest `/core` 0; J-02 TOK `custom.emp.*` origin=`extension_field` (cite `EMPTOKEXTQA-MSJ57PE1`); J-03 invent **422** `HRM-EMP-CUSTOM-FIELD-KEY` no persist (cite `EMPCFQA-MSK14LUH`) + browser same; J-04 soft-retire `draft` + picker hide · CTA **P2 HOLD** · peer CORE-09d..01 must_keep · honesty false · C-SLICE · no seed · Dev-BE HOLD · DENY EMPCF=personnel UAT · DENY 09d printable/closed-8. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-02B-CLUSTER-QC-01
lane: governance · qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-02b
depends_on: QA-01 PASS_TO_PM · docs/qa/evidence/po-hrm-mvp-gd1-core-02b-cluster-qa-01.md · stamp CORE02BQA-MSLEDIAQ · API-01 CONFIRMED RETAIN · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 · peer CORE09DQC1-MSLDR8I3 must_keep
entry_criteria: QA J-HRM-CORE-02B-01..04 PASS; physical /settings-catalogs*+/employees*; Nest /core EMP-CF 0; invent KEY; soft-retire draft; honesty false; C-SLICE; R-PLT-EMP-CF-FE-01 P2 HOLD; no seed
MISSION: QC GWC slice CORE-02b EMP-CF RETAIN — audit browser+L1 evidence U65; confirm C-SLICE ≠ module CORE/personnel UAT; confirm ≠ EMPCF DONE; confirm ≠ CORE-09d printable/closed-8 DONE; DENY honesty flip · Nest /core dual · Nest emp_custom_field · profile_groups_json primary · reopen J-CORE-09D..01 · seed · Dev invent.
exit: docs/qa/evidence/po-hrm-mvp-gd1-core-02b-cluster-qc-01.md · PASS_TO_PM GWC|GO|NO-GO
```

---

*End evidence · Wave-17 CORE-02b QA-01 · stamp `CORE02BQA-MSLEDIAQ` · 2026-08-09*
