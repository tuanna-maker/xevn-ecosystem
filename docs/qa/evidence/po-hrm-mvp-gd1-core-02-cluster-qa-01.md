# Evidence — PO-HRM-MVP-GD1-CORE-02-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-02-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · UC-BP-CORE-02) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `CORE02QA-MSL7X7SJ` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** |
| **uc_ids** | `UC-BP-CORE-02` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · AuthZ deny `du-lich.ceo@xe.vn` (`subsidiary_ceo` · tenant `xe-du-lich`) |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · personnel/CORE UAT **false** · **C-SLICE-≠-MODULE** · U65 zero-seed · **CORE-01 ≠ C&B DONE** |
| **depends_on** | BE-01 READY · `docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-be-01.md` · FE-01 READY · `docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-fe-01.md` |
| **env** | portal `:5173` · hrm-api `:28001` **rebuild+restart** (stale dist rejected `bank_*` DTO) · HRM FE `:8080` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-core-02-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-02-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-core-02-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · **no CORE / personnel UAT DONE** · **CORE-01 ≠ C&B DONE** |
| **L0** | hrm/xbos/portal **200** |
| **L1 seal** | packages* LIVE · AuthZ **403** `HRM-CORE-CB-AUTHZ-403` · public CF **403** `HRM-CORE-CB-403` · Nest `/core` **Cannot GET** · SI PATCH **400** `HRM-CORE-CB-VAL-400` · actions `change_rate` **201** |
| **L2.5 J-*** | **J-HRM-CORE-02-01..04 PASS** |
| **Nest `/core` browser** | **0 hits** |
| **Physical Network** | `/contracts-insurance/compensation-packages*` + `/employee-insurances*` only |
| **DENY** | seed unused · honesty false retained · Nest `/core` dual · reopen sealed J-CORE-01 · claim CORE-01=C&B DONE · module CORE UAT |

**Ops note (intake):** LIVE dist at entry **pre-BE-01** (`property bank_account should not exist`) → QA **rebuild** `pnpm --filter hrm-api run build` + restart `dist/main` → seal LIVE before browser.

---

## L0 / L1

| Check | Evidence |
|-------|----------|
| Portal / HRM / XBOS | **200** |
| `GET …/compensation-packages` (ceo) | **200** `HRM-COMP-200` |
| `GET …/compensation-packages/active` | **200** · bank/MST on header |
| `GET …/compensation-history` | **200** · total ≥2 after revise |
| `GET packages` as `subsidiary_ceo` (`xe-du-lich`) | **403** `HRM-CORE-CB-AUTHZ-403` |
| `GET /api/hrm/core/employees/{id}/compensation` | **404** Cannot GET — DENY dual |
| `PATCH` public CF salary/bank/tax | **403** `HRM-CORE-CB-403` (must_keep CORE-01) |
| `PATCH …/employee-insurances/{id}` contrib delta | **400** `HRM-CORE-CB-VAL-400` · `redirect_action=change_rate` |
| `POST …/employee-insurances/{id}/actions` `change_rate` | **201** `HRM-EINS-200` |

---

## Browser U65 — journeys

Persona: portal auth inject · URL `http://127.0.0.1:5173/command-center/hrm/employees/{id}` · HRM iframe · **zero-seed**.

**hdsd_align:** HĐ–BH → tab Đãi ngộ → form bank/MST → Revise → F5 · public general strip · forced CF · BH → Đổi mức (`change_rate`).

| J-* | Click path | Network / FE | Verdict |
|-----|------------|--------------|---------|
| **J-HRM-CORE-02-01** | Profile → HĐ → **Đãi ngộ** | GET `/api/hrm/contracts-insurance/compensation-packages*` **200** · L1 non-C&B **403** `HRM-CORE-CB-AUTHZ-403` · Nest `/core` **0** | **PASS** |
| **J-HRM-CORE-02-02** | Fill lương+PC+NH+MST → **Revise** → F5 | POST `…/compensation-packages/{id}/revise?company_id=main` **201** `HRM-COMP-201` · history **≥2** (total **4**) · F5 bank=`1122334455` | **PASS** |
| **J-HRM-CORE-02-03** | Public general → F5 · forced CF salary/bank/tax | Public GET strip · PATCH CF → **403** `HRM-CORE-CB-403` · F5 still clean · Nest `/core` **0** | **PASS** |
| **J-HRM-CORE-02-04** | Tab BH → **Đổi mức** submit · L1 PATCH contrib | Browser POST `…/employee-insurances/{id}/actions?company_id=main` **201** `action=change_rate` · PATCH contrib **400** `HRM-CORE-CB-VAL-400` · Nest `/core` **0** | **PASS** |

Mutated samples:
- Employee: `2b4cbc90-fb74-4a2d-9fef-d188d4e48d61` (UV UAT REC soft-hire — **≠** CORE/personnel UAT DONE)
- Package revise browser: bank `1122334455` · MST `0109876543` · base `17.000.000`
- SI enroll: `eb4a84b1-759d-4290-8182-ae948e21f208` · type catalog `hr_si_cat_msja2z7h`

Screens: `01-dai-ngo-open` · `02-comp-form-filled` · `03-after-mutate` · `04-f5-dai-ngo` · `05-public-general` · `06-f5-public-after-cb403` · `07-insurance-tab` · `08-j04-done`.

---

## Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| — | — | — | **No P0/P1 residual** for this seat |

**OBS (non-blocking):** SI enrollment create requires Nest insurance-type **effective catalog** key (`HRM-INS-TYPE-KEY` if free-text `social`) — FE picker SoT already binds catalog; L1 seal used effective type.

**What worked (must not regress):** packages physical path · bank/MST revise F5 · AuthZ-403 ≠ public CB-403 · public strip must_keep · SI actions `change_rate` · PATCH contrib fail-closed VAL-400 · Nest `/core` 0 · C-SLICE honesty false.

---

## DENY / honesty

| Item | Status |
|------|--------|
| Nest `/core/*` SoT dual | **DENY** — L1 Cannot * · browser hits **0** |
| Same-form public+salary / reopen J-CORE-01 | **DENY** |
| `pnpm seed:*` / API fake for UF pass | **not used** (L1 probes only; browser mutate FE) |
| Flip honesty / recruitment_uat_ready / jd_dynamic_done | **false** retained |
| Claim CORE-01 public = C&B DONE | **DENY** |
| Module CORE / personnel UAT / Phase1 DONE | **DENY** — **C-SLICE** |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-qa-01.md` |
| **completion_report** | U65 QA PASS — L0 OK; rebuild+restart seal BE-01 LIVE; J-01 packages GET 200 + AuthZ-403 PASS; J-02 revise bank/MST 201 + history≥2 F5 PASS; J-03 public strip + CB-403 must_keep PASS; J-04 browser change_rate 201 + PATCH VAL-400 PASS; Nest `/core` 0; physical packages/eins only. Honesty false · C-SLICE · no seed · CORE-01 ≠ C&B DONE · no module CORE UAT. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-02-CLUSTER-QC-01
lane: governance · qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-02
depends_on: QA-01 PASS_TO_PM · docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-qa-01.md · stamp CORE02QA-MSL7X7SJ
entry_criteria: QA J-HRM-CORE-02-01..04 PASS; honesty false; C-SLICE; Nest /core 0; physical packages/eins; CORE-01 public must_keep; no seed in evidence
MISSION: QC GWC slice CORE-02 — audit browser evidence U65; confirm C-SLICE ≠ module CORE/personnel UAT; confirm CORE-01 ≠ C&B DONE; DENY honesty flip · Nest /core dual · reopen J-CORE-01 · seed.
exit: docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-qc-01.md · GO WITH CONDITIONS (C-SLICE) or NO-GO
cấm: claim CORE/personnel UAT DONE · flip honesty · seed · Nest /core dual · reopen sealed J-CORE-01
```
