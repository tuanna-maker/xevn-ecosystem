# Evidence — PO-HRM-MVP-GD1-CORE-02B-CLUSTER-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-02B-CLUSTER-API-01` |
| **lane** | governance · sa |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-17 seat **#19**) |
| **uc_ids** | `UC-BP-CORE-02b` |
| **Date** | 2026-08-09 |
| **depends_on** | DATA-01 CONFIRMED HOLD · BA-01 O1–O12 · SA Option A · EMPCF **`EMPCFQA-MSK14LUH`** · EXT **`EMPTOKEXTQA-MSJ57PE1`** · peer **`CORE09DQC1-MSLDR8I3`** |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-02B-CLUSTER-API-01.md` |
| **ack_status** | **PASS_TO_PM** · API **CONFIRMED RETAIN** |
| **change_mode** | DOC-DELTA F.1 RETAIN cite · **HOLD invent** · **NO** `apps/**` · **no seed** · **no honesty flip** |
| **artifact_size** | SPEC_LEN=38492 · EVID_LEN=6306 (NFD) |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| RETAIN cite LIVE GET/POST …/settings-catalogs* (+ `:catalogKey/extension-items`) + soft-retire + POST/PUT/PATCH /employees* custom_fields — F.1 Mục đích · Nghiệp vụ · bước SRS FR-02b Diễn biến # · DTO↔DB DATA-01 · `HRM-EMP-CUSTOM-FIELD-KEY` · admin format/UQ · `HRM-SCOPE-409` · ESS 403 | **PASS** §5.1–§5.6 · §4 · §6 |
| LOCK: groups=four catalogs · field-def=extension-items · TOK origin=`extension_field` same-TX · CNS invent when EFF>0 · U19 Settings↔employees · soft-retire `status=draft` | **PASS** §1 · §4.1–§4.5 · §7 |
| DENY Nest `/core` dual EMP-CF · invent Nest `emp_custom_field` endpoints/schema · invent `profile_groups_json` primary · claim EMPCF=CORE-02b/personnel UAT · claim CORE-09d printable/closed-8 DONE | **PASS** §1 · §3 · §8 |
| RETAIN must_keep CORE-09d TPL+clause · 09c VER/PDF ≠ printable · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 · EMPCF/EXT seals | **PASS** §5.7 · §8 |
| Honesty: `hrm_personnel_uat_ready=false` · `contracts_printable_ready=false` · C-SLICE · no apps/** · no seed | **PASS** header · §8 · §10 |
| Unlock FE P2 HOLD (`R-PLT-EMP-CF-FE-01`) only if residual · Dev-BE HOLD unless wire gap proven · not Dev invent | **PASS** §11 · §12 |
| ba-data already CONFIRMED HOLD (no re-invent) | **PASS** header · §2 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| DATA-01 | HOLD RETAIN `hrm_catalog_extension_items` + `hrm_merge_tokens` + `employees.custom_fields` · four catalogs = groups · no `profile_groups_json` · no Nest `emp_custom_field` · soft `status=draft` · ORDER BY code · VAL-CORE-02B-DATA-* |
| BA-01 | O1–O12 · AC-CORE-02B-* · AC-PLT-EMP-CUSTOM-01* · VAL-EMP-CF-* · J-HRM-CORE-02B-01..04 DRAFT · R-PLT-EMP-CF-FE-01 P2 HOLD |
| SA-01 | Option A LOCKED · LIVE settings-catalogs* + employees* · paper `/core` alias · REJECT Nest dual / mega-EAV / profile_groups_json primary / honesty |
| SRS | FR-UC-BP-CORE-02b Diễn biến #1–#4 · AC-PLT-EMP-CUSTOM-01* · BR-PLT-01/02/04/05 |
| Paper API | F-EMP-CF-01..03 · F-EMP-TOK-03 · F-EMP-CF-CNS-01/02 RETAIN · CORE-09d..01 must_keep |
| AS-IS Nest (read-only) | `SettingsCatalogsController` `@Controller('settings-catalogs')` overview · `:catalogKey/items` · `:catalogKey/extension-items` · `DELETE items` · `SettingsCatalogsService.appendExtensionItems` / `deleteCatalogItem` soft-draft + TOK · `emp-merge-token-register.ts` `EMP_EXTENSION_FIELD_CATALOG_KEYS` · `emp-custom-field-consumer-assert.ts` `HRM-EMP-CUSTOM-FIELD-KEY` · `employees` mutate `custom_fields` · Nest `/core` EMP-CF **ABSENT** · Nest `emp_custom_field*` **ABSENT** |
| Peer style | CORE-09D CLUSTER-API-01 F.1 RETAIN · this seat = **RETAIN/HOLD** (not UPGRADE invent) |

---

## 3. Decisions summary

| Topic | Decision |
|-------|----------|
| Path | Physical `/settings-catalogs*` + `/employees*` · paper `/core/…` alias only |
| Groups | Four allow-list catalogs = FR-02b nhóm |
| Field-def | LIVE `hrm_catalog_extension_items` ONE SoT · DENY Nest `emp_custom_field` |
| TOK | F-EMP-TOK-03 same-TX · `origin=extension_field` · seal EXT |
| CNS | Invent KEY when EFF>0 · seal EMPCF · ESS narrow 403 |
| Soft-retire | `status=draft` + token soft |
| JSON | `profile_groups_json` HOLD invent / OUT primary |
| Errors | RETAIN KEY · admin format/UQ · SCOPE-409 · ESS 403 · SET-200/202/209/404 |
| Peers | CORE-09d..01 must_keep · ≠ printable · ≠ closed-8 DONE |
| Unlock | **qa** cite/smoke preferred · **FE P2 HOLD** optional · **Dev-BE invent HOLD** |

---

## 4. Deliverables inventory

| Artifact | Path |
|----------|------|
| API F.1 DOC | `docs/program/specs/PO-HRM-MVP-GD1-CORE-02B-CLUSTER-API-01.md` |
| This evidence | `docs/qa/evidence/po-hrm-mvp-gd1-core-02b-cluster-api-01.md` |

---

## 5. Honesty / DENY footer

| Flag / claim | Status |
|--------------|--------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| `contracts_printable_ready` | **false** |
| `hrm_personnel_uat_ready` | **false** |
| personnel / CORE / CTR module UAT | **false** |
| C-SLICE ≠ module UAT | **LOCKED** |
| Claim EMPCF = CORE-02b / personnel UAT | **DENIED** |
| Claim CORE-09d printable / closed-8 DONE | **DENIED** |
| Nest `/core` EMP-CF dual | **DENIED** |
| Nest `emp_custom_field` invent | **DENIED** |
| `profile_groups_json` primary | **DENIED invent GĐ1** |
| Seed / apps/** | **DENIED this seat** |

---

## 6. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | API F.1 CONFIRMED RETAIN UC-BP-CORE-02b — F-EMP-CF-01..03 + TOK-03 + CNS-01/02 on LIVE `/settings-catalogs*` + `/employees*` · four catalogs = groups · soft-retire draft · U19 · DTO↔DB DATA-01 · DENY Nest dual / emp_custom_field / profile_groups_json primary / EMPCF=personnel UAT / 09d printable · must_keep CORE-09d..01 + EMPCF/EXT · unlock QA cite preferred · FE P2 HOLD only if residual · Dev-BE HOLD · no apps/** · no seed |
| **next_owner** | **pm** → **qa** |
| **next_dispatch_prompt** | See API-01 §12 (QA-01 copy-ready) |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-02B-CLUSTER-API-01.md` · `docs/qa/evidence/po-hrm-mvp-gd1-core-02b-cluster-api-01.md` |
| **ack_status** | **PASS_TO_PM** |

---

*End evidence · Wave-17 CORE-02b API-01 · 2026-08-09*
