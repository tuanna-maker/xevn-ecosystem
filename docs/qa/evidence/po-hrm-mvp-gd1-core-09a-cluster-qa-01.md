# Evidence — PO-HRM-MVP-GD1-CORE-09A-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09A-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · UC-BP-CORE-09a) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `CORE09AQA-MSLA1C9L` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (PASS_WITH_OBS P2 issued-body bump) |
| **uc_ids** | `UC-BP-CORE-09a` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel/CORE/CTR UAT **false** · **C-SLICE-≠-MODULE** · U65 zero-seed · **CORE-08 ≠ pillar DONE** · **note-CRUD ≠ FR-08 DONE** · **PREV/VER/PDF/TPL ≠ invent DONE** |
| **depends_on** | FE-01 READY · `docs/qa/evidence/po-hrm-mvp-gd1-core-09a-cluster-fe-01.md` · API-01 CONFIRMED RETAIN |
| **env** | portal `:5173` **200** · hrm-api `:28001` **200** · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-core-09a-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-09a-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-core-09a-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · **no CORE / CTR / personnel UAT DONE** · **printable false** |
| **L0** | hrm/xbos/portal **200** (`:5173`) |
| **L1 seal** | GET contract-clauses **200** · Nest `/core/contract-clauses` **404** Cannot GET · L1 PATCH issued **409** `HRM-CTR-CL-CODE-CONFLICT` · publish list **200** · print-version freeze baseline |
| **L2.5 J-*** | **J-HRM-CORE-09A-01..04 PASS** |
| **Nest `/core` browser** | **0 hits** |
| **Physical Network** | All clause mutates on `/contracts-insurance/contract-clauses*` |
| **DENY** | seed unused · honesty false retained · Nest `/core` dual · Settings/XBOS body SoT claim · printable flip · CORE-08=pillar DONE · note=FR-08 DONE · PREV/VER/PDF/TPL invent DONE |

**Ops note:** Portal Settings reload drops tab to **Tài khoản** — QA F5 path re-opens `?tab=contract-legal` + click `settings-tab-contract-legal` (not bare reload alone).

---

## L0 / L1

| Check | Evidence |
|-------|----------|
| HRM / XBOS / portal | **200** / **200** / **200** `:5173` |
| `GET …/contracts-insurance/contract-clauses?company_id=main` | **200** `HRM-CTR-CL-200` · count **39** |
| `GET …/core/contract-clauses` | **404** Cannot GET — DENY dual |
| `GET …/contract-library/publishes` | **200** `HRM-CTR-PUB-200` (RETAIN ≠ body SoT) |
| Issued freeze PV | contract `9cdc6ee6-…` · PV `3c130e8c-…` · code `LEGAL_CTRQA-HPY05Q` body baseline |
| L1 PATCH issued | **409** `HRM-CTR-CL-CODE-CONFLICT` |

---

## Browser U65 — journeys

Persona: auth inject · URL `http://127.0.0.1:5173/command-center/hrm/settings?tab=contract-legal` · **zero-seed**.

**hdsd_align:** Cài đặt → Điều khoản HĐ → Thư viện điều khoản → Thêm/Sửa/Hiệu lực/Ngừng · `{{token}}` body · F5 reopen tab.

| J-* | Click path | Network / FE | Verdict |
|-----|------------|--------------|---------|
| **J-HRM-CORE-09A-01** | Thêm `LEGAL_CORE09A-LA1C9L` + `{{bo_luat}}` → Lưu → F5 → **Hiệu lực** → F5 | POST `/contracts-insurance/contract-clauses` **201** · F5 **Nháp** · POST `…/activate` **201** · F5 **Hiệu lực** · Nest `/core` **0** | **PASS** |
| **J-HRM-CORE-09A-02** | Draft `LEGAL_CORE09AD-LA1C9L` → Sửa body v2 → Lưu → F5 | POST **201** · PATCH `…/contract-clauses/:id` **200** · F5 body **v2** còn | **PASS** |
| **J-HRM-CORE-09A-03** | Active issued `LEGAL_CTRQA-HPY05Q` → Sửa body → Lưu → banner **Tăng phiên bản** | PATCH **409** `HRM-CTR-CL-CODE-CONFLICT` · banner · POST activate bump **201** · `clauses_snapshot_json` **unchanged** vs baseline | **PASS** |
| **J-HRM-CORE-09A-04** | Row active create → **Ngừng** → F5 · Network + seals | POST `…/retire` **201** · F5 **Ngừng dùng** · Nest `/core` **0** · publish panel visible ≠ body SoT · CORE-08/02/01 must_keep · printable **false** | **PASS** |

Mutated samples:
- Activate/retire: `LEGAL_CORE09A-LA1C9L` · id `98aa62c9-7337-46a8-874c-fa6dca1abba3`
- Draft edit: `LEGAL_CORE09AD-LA1C9L` · id `ed2b995a-baa5-492f-9f12-58a0f4865374`
- Issued CONFLICT: `LEGAL_CTRQA-HPY05Q` · id `4c9d4d49-320b-4eda-9d9d-e282333c0c57`
- Freeze: contract `9cdc6ee6-0a71-4b73-89ae-c9f3e952a656` · PV `3c130e8c-9b1c-4b82-a36b-3d959bb25ca2` · body before=after `Căn cứ Bộ luật Lao động 2019 — QA CTRQA-HPY05Q.`

Screens: `01-settings-clause-tab` · `02-j01-form-filled` · `03-j01-after-create` · `04-j01-f5-after-create` · `05-j01-f5-after-activate` · `06-j02-after-patch` · `07-j02-f5-body` · `08-j03-conflict-banner` · `09-j03-after-bump` · `10-j04-open` · `11-j04-f5-retired`.

---

## Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-FE-CORE-09A-ISSUED-BODY** | **P2 OBS** | BE / BA peer | After CONFLICT, activate bumps version but does not apply pending form body (BE RETAIN) — not invent this WI. **Does not block** J-* PASS. |
| **R-FE-CORE-09A-PREV-PDF** | P2 | peer 09b/09c/09d | F-CORE-CTR-PREV/VER/PDF/TPL **OUT** invent as DONE |

**What worked (must not regress):** physical `/contracts-insurance/contract-clauses*` create/activate/PATCH/retire · draft F5 · issued 409→bump · snapshot freeze · Nest `/core` 0 · publish/pull RETAIN ≠ body SoT · C-SLICE honesty false.

---

## DENY / honesty

| Item | Status |
|------|--------|
| Nest `/core/*` clause SoT dual | **DENY** — L1 Cannot * · browser hits **0** |
| Settings/XBOS as body SoT | **DENY** — mutate only Nest contract-clauses* |
| `pnpm seed:*` / API fake for UF pass | **not used** |
| Flip honesty / `contracts_printable_ready` | **false** retained |
| Claim CORE-08 = pillar DONE | **DENY** |
| Claim note-CRUD = FR-08 DONE | **DENY** |
| Claim PREV/VER/PDF/TPL invent DONE | **DENY** |
| Reopen sealed J-CORE-08 / 02 / 01 | **DENY** |
| Module CORE / CTR / personnel UAT / Phase1 DONE | **DENY** — **C-SLICE** |

```text
recruitment_uat_ready=false
jd_dynamic_done=false
contracts_printable_ready=false
personnel / CORE / CTR module UAT = false
C-SLICE ≠ module CORE UAT
U65 zero-seed
Nest /core clause dual DENY · Settings ≠ body SoT · CORE-08 RD ≠ pillar DONE · note-CRUD ≠ FR-08 DONE · no PREV/VER/PDF/TPL invent DONE
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09a-cluster-qa-01.md` |
| **completion_report** | U65 QA PASS — L0 OK; J-01 create+activate F5 Nháp→Hiệu lực POST 201 physical PASS; J-02 draft PATCH 200 F5 body v2 PASS; J-03 issued PATCH 409 CONFLICT→activate bump 201 + snapshot freeze PASS; J-04 retire 201 Ngừng dùng + Nest `/core` 0 + publish≠body SoT + CORE-08/02/01 must_keep PASS. Honesty false · C-SLICE · printable false · no seed · no PREV/VER/PDF/TPL invent DONE. P2 OBS issued-body after bump. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09A-CLUSTER-QC-01
lane: governance · qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09a
depends_on: QA-01 PASS_TO_PM · docs/qa/evidence/po-hrm-mvp-gd1-core-09a-cluster-qa-01.md · stamp CORE09AQA-MSLA1C9L
entry_criteria: QA J-HRM-CORE-09A-01..04 PASS · Nest /core 0 · snapshot freeze · printable false · CORE-08/02/01 must_keep
exit_criteria: GO|GWC with residual list · DENY honesty flip · DENY CORE-08=pillar DONE · DENY note=FR-08 DONE · DENY PREV/VER/PDF/TPL invent DONE · C-SLICE seal ≠ module CORE/CTR UAT · evidence_path docs/qa/evidence/po-hrm-mvp-gd1-core-09a-cluster-qc-01.md
cấm: seed · flip contracts_printable_ready · claim module DONE · reopen J-CORE-08/02/01 rewrite
spec_ref: F-CORE-CTR-CL-01..04 · AC-CORE-09A-* · BR-CTR-CL-01..04
```
