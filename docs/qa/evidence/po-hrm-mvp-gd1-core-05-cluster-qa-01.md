# Evidence — PO-HRM-MVP-GD1-CORE-05-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-05-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · UC-BP-CORE-05) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `CORE05QA-MSLGFOXU` |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** |
| **uc_ids** | `UC-BP-CORE-05` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · emp mutate `holding` |
| **Honesty** | `hrm_personnel_uat_ready=false` · `contracts_printable_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | FE-01 READY · BE-01 READY · API-01 CONFIRMED · BA O1–O12 · SA Option A · seals `CORE03QC1-MSLFJH0K` · `CORE02BQC1-MSLEFQC1` · peer `CORE09DQC1..CORE01QC1` · `EMPPLATQA` · `EMPTOKQA` · OBS P2 idle-ok |
| **env** | portal `:5173` · hrm-api `:28001` (**rebuild+restart seal LIVE** — entry dist missing SERIAL/BB) · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-core-05-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-05-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-core-05-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **FAIL** · `FAIL_TO_PM` · **C-SLICE** · **DENY** CRUD=CORE-05 DONE · **DENY** CORE-06/07 / printable / closed-8 / personnel DONE |
| **L0** | hrm/xbos/portal **200** |
| **L2.5 J-*** | **J-01..04 FAIL** · **J-05 PASS** |
| **P0 blocker** | Profile Tài sản **Thêm cấp phát → Lưu** → Network **POST** `/api/hrm/employees/:id/assets` **500** `HRM-SYS-001` — `invalid input syntax for type date: ""` (empty `assignedDate`/`returnDate`) |
| **Physical Network** | `/employees/:id/assets*` hits observed (**18**) |
| **Nest `/core` AST SoT** | probe **404** `Cannot GET` · **non-404 SoT hits = 0** |
| **Seed** | **none** |

---

## Spec / seal cite

| Artifact | Cite |
|----------|------|
| BA-01 | `docs/program/specs/PO-HRM-MVP-GD1-CORE-05-CLUSTER-BA-01.md` · AC-CORE-05-* · J-HRM-CORE-05-01..05 DRAFT |
| API-01 | F-CORE-AST-01 RETAIN · F-CORE-AST-BB-01 ADD · serial 409 · soft DELETE-FORBIDDEN |
| FE-01 | `docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-fe-01.md` READY_FOR_QA |
| BE-01 | `docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-be-01.md` READY_FOR_QA |
| CORE-03 QC | **`CORE03QC1-MSLFJH0K`** RETAIN · ≠ personnel |
| CORE-02b QC | **`CORE02BQC1-MSLEFQC1`** must_keep |
| CORE-09d..01 | peer stamps RETAIN · ≠ printable/closed-8 |
| EMP PLAT / TOK | **`EMPPLATQA-MSIZXHIM`** · **`EMPTOKQA-MSJ290VB`** RETAIN |

**Src/dist spot (after QA rebuild):** SERIAL-CONFLICT · DELETE-FORBIDDEN · `handover_confirmed_at` **LIVE in dist** · Nest `@Controller('core')` AST **ABSENT**.

**FE spot:** `EmployeeAssets` · Profile `?tab=assets` · physical `/employees/:id/assets*` · BB CTA · soft thu hồi · serial toast map · notes≠BB · `data-hdsd=hdsd-emp-assets*` · Nest `/core` path **DENY**.

**LIVE seal note:** Entry DIST missing CORE-05 codes → QA `pnpm run build` + restart `:28001` before browser (same class as prior CORE waves). Dist seal **PASS**; runtime create still **FAIL** on empty date.

---

## L0 / L1 seal

| Check | Evidence |
|-------|----------|
| Portal / HRM / XBOS | **200** |
| GET `…/employees/:id/assets` | **200** (empty OK before mutate) |
| GET Nest `/core/…/assets` | **404** DENY dual |
| POST FE default body (`assignedDate=""`, `returnDate=""`) | **500** `HRM-SYS-001` |
| L1 diag (≠ U65 PASS): omit dates / `null` | **201** `HRM-EMP-PROFILE-201` (proves spine works when dates omitted) |

---

## Browser U65 — journeys

Persona: portal auth inject · Profile **`/hr/employees/{id}?tab=assets`** · **zero-seed**.

**hdsd_align:** Hồ sơ NV → tab **Tài sản** · **Thêm cấp phát** · **Xác nhận nhận** · **Thu hồi (đổi trạng thái)** · hooks `hdsd-emp-assets*` · CH11 «Công cụ dụng cụ» = report stats only (no invent dedicated assets HDSD chapter).

| J-* | Click path / assert | Network / FE | Verdict |
|-----|---------------------|--------------|---------|
| **J-HRM-CORE-05-01** | Profile Tài sản → Thêm cấp phát → name/code/serial → Lưu → F5 | POST `/employees/:id/assets` **500** · no row · toast PG date error · Nest `/core` **0** | **FAIL** |
| **J-HRM-CORE-05-02** | Xác nhận nhận / notes≠BB / handoverDocId=id F5 | **BLOCKED** — no assetId after J-01 | **FAIL** |
| **J-HRM-CORE-05-03** | duplicate serial → 409 SERIAL-CONFLICT + toast | browser POST also **500** (same empty-date) · FE toast map present · cannot assert 409 path | **FAIL** |
| **J-HRM-CORE-05-04** | soft returned prefer · DELETE issued → 409 DELETE-FORBIDDEN | **BLOCKED** — no issued row | **FAIL** |
| **J-HRM-CORE-05-05** | Nest `/core` 0 · seals · honesty · DENY invent CORE-06/07 | nest404 · sot_non404=0 · physical hits>0 · seals cited · dist LIVE · honesty false · C-SLICE | **PASS** |

Emp under test: `2b4cbc90-fb74-4a2d-9fef-d188d4e48d61` (`HIRE-HOLDIN-MSL5T540DDDE8E`).

Screens: `01-assets-tab` … `09-done`.

---

## Root cause (P0)

| ID | Layer | Detail |
|----|-------|--------|
| **R-CORE-05-EMPTY-DATE-500** | **BE** (primary) + **FE** (payload) | FE `useEmployeeAssets` / form defaults send `assigned_date: ''` / `return_date: ''`. BE `normalizeAssetWritePayload` does **not** coerce `''` → `null` for DATE cols → PG `invalid input syntax for type date: ""` → **500**. Optional dates blank is valid UX (fields not required). |

**Diag (L1 only — not U65 PASS):**

| Body | Result |
|------|--------|
| `assignedDate: ""`, `returnDate: ""` | **500** `HRM-SYS-001` |
| omit date keys | **201** |
| `assignedDate: null`, `returnDate: null` | **201** |

Diag rows soft-returned (`status=returned`) after probe — **≠** seed; **≠** promote.

---

## AC map (smoke)

| AC | Result |
|----|--------|
| **AC-CORE-05-01** create 201 + assigned + statusLabelVi F5 | **FAIL** (500) |
| **AC-CORE-05-04** BB confirm + handoverDocId=id | **FAIL** blocked |
| **AC-CORE-05-05** notes-only ≠ BB | **FAIL** blocked |
| **AC-CORE-05-07** serial 409 | **FAIL** blocked by 500 |
| **AC-CORE-05-08** soft status / DELETE-FORBIDDEN | **FAIL** blocked |
| **Nest `/core` DENY** | **PASS** |
| **must_keep** CORE-03/02b/09d..01 | **PASS** cite · not reopened |
| **Honesty / C-SLICE** | **PASS** (false · no flip) |

---

## Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-CORE-05-EMPTY-DATE-500** | **P0** | **dev-be** (+ FE omit empty) | Coerce `''` DATE → `null` in `normalizeAssetWritePayload`; FE omit blank assigned/return on POST/PATCH; jest empty-date create **201** |
| **R-CORE-05-J01-04-RETEST** | P0 | **qa** after BE/FE | Retest J-01..04 full U65 after fix |
| **R-CORE-05-HONESTY** | INFO | QC | C-SLICE · personnel/printable/CORE module UAT **false** · CRUD ≠ CORE-05 DONE · CORE-06/07 OUT invent DONE |

**What worked (must not regress):** Nest `/core` AST DENY · physical `/employees/:id/assets*` path on FE · dist SERIAL/BB/DELETE codes LIVE after rebuild · seal cites CORE-03/02b/09d..01 · honesty false · C-SLICE · panel `hdsd-emp-assets` mounts on `/hr/employees/:id?tab=assets`.

---

## Honesty footer

```text
recruitment_uat_ready=false
jd_dynamic_done=false
contracts_printable_ready=false
hrm_personnel_uat_ready=false
personnel / CORE / CTR module UAT = false
C-SLICE ≠ module CORE UAT
U65 zero-seed · empty assets OK
Nest /core AST dual DENY · FE invent Asset SoT DENY · notes≠BB · CORE-06/07 / printable DONE DENY
CRUD create path FAIL ≠ claim CORE-05 DONE
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **FAIL_TO_PM** |
| **next_owner** | **dev-be** (primary) · **dev-fe** parallel omit empty dates |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-qa-01.md` |
| **completion_report** | J-05 **PASS** (Nest deny + seals + honesty). J-01..04 **FAIL** — P0 empty DATE `""` → POST **500** blocks create/BB/serial/soft-delete U65. Dist rebuilt LIVE. No seed. No honesty flip. No claim CORE-05 DONE. |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-05-CLUSTER-BE-02
lane: execution · dev-be
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-05
depends_on: QA-01 FAIL — docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-qa-01.md · stamp CORE05QA-MSLGFOXU · P0 R-CORE-05-EMPTY-DATE-500
entry_criteria: BE-01 spine LIVE; U65 FE sends assignedDate/returnDate as "" when blank
MISSION: In employee-profile.service normalizeAssetWritePayload — coerce empty-string DATE fields (assigned_date/return_date and camelCase aliases) to null before INSERT/UPDATE; never pass "" to PG DATE. Add jest: create with assignedDate:'' / returnDate:'' → 201 (or VAL-400 if product chooses reject — prefer null 201 to match omit/null diag). RETAIN serial 409 · BB confirm · DELETE-FORBIDDEN · Nest /core DENY. DENY invent CORE-06/07 · honesty flip · reopen sealed J-*.
Parallel FE-02 (optional same wave): omit blank assigned_date/return_date on createEmployeeAsset/update payload in useEmployeeAssets.
exit: docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-be-02.md · READY_FOR_QA
cấm: seed · Nest /core SoT · claim CORE-05 DONE · honesty flip
```

```text
work_item_id: PO-HRM-MVP-GD1-CORE-05-CLUSTER-QA-02
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
depends_on: BE-02 READY_FOR_QA (+ FE-02 if dispatched)
entry_criteria: L0; U65 zero-seed; browser-only; honesty false; C-SLICE
MISSION: Retest J-HRM-CORE-05-01..05 — Thêm→Lưu 201 without filling dates; F5 assigned+statusLabelVi; BB confirm+handoverDocId; notes≠BB; serial 409 toast; soft returned + DELETE-FORBIDDEN; Nest /core 0.
exit: docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-qa-02.md · PASS_TO_PM or FAIL
cấm: seed · API-only PASS · honesty flip
```
