# Evidence — PO-HRM-MVP-GD1-CORE-09A-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09A-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-13 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-CORE-09a` |
| **depends_on** | API-01 **CONFIRMED RETAIN** · DATA-01 HOLD · BA O1–O12 · SA Option A · peer `CORE08QC1-MSL9BFFE` |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | UPGRADE · preserve_default · CODE-MEMORY APPEND · **NO** invent schema/API |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel/CORE/CTR module UAT **false** · **C-SLICE** |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

| Artifact | Ack |
|----------|-----|
| **BA-01** `docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-BA-01.md` | O1–O12 · AC-CORE-09A-* · BR-CTR-CL-01..04 · J-HRM-CORE-09A-01..04 DRAFT |
| **API-01** `docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-API-01.md` | F-CORE-CTR-CL-01..04 RETAIN · physical `/contracts-insurance/contract-clauses*` · paper `/core` alias only |
| **DATA-01** | HOLD RETAIN `hrm_contract_clauses` · `clauses_snapshot_json` freeze · no mega-EAV |
| **CORE-08 / 02 / 01** | stamps `CORE08QC1-MSL9BFFE` · `CORE02QC1-MSL80DU6` · `CORE01QC1-MSL6WMS7` **must_keep** · **≠** pillar DONE · **≠** note=FR-08 DONE |
| **AS-IS UI** | `ContractLegalPrintSettingsPanel` already LIVE-bound — residual CONFLICT UX + VI labels + placeholder gate |

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-09a Diễn biến #1–#5 · BR-CTR-CL-01..04
- tech_spec / api: PO-HRM-MVP-GD1-CORE-09A-CLUSTER-API-01.md F-CORE-CTR-CL-01..04 §5.1–§5.7
- ba: PO-HRM-MVP-GD1-CORE-09A-CLUSTER-BA-01.md O1–O12 · AC-CORE-09A-*
- db_design: DATA-01 HOLD cite — no FE invent
- sponsor_confirm: API-01 CONFIRMED RETAIN 2026-08-09 · BA O1–O12
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Bind Cài đặt → Thư viện ĐK → LIVE `GET/POST/PATCH/activate/retire` `/api/hrm/contracts-insurance/contract-clauses*` | **RETAIN + UPGRADE** |
| `getContractClause` GET-by-id U19 | **ADD** (hrmApi) |
| Draft create = `status: draft`; PATCH omit status invent | **UPGRADE** |
| Draft in-place PATCH toast + F5 hint | **UPGRADE** |
| Issued PATCH → `HRM-CTR-CL-CODE-CONFLICT` banner → POST activate bump CTA | **ADD** |
| Soft retire toast (snapshot readable) | **UPGRADE** |
| `{{field}}` / `{{token}}` client validate · dual syntax FAIL | **ADD** |
| Display-ready VI status / group / pack labels | **ADD** |
| Publish/pull consumer | **RETAIN** (≠ body SoT) |
| DENY Nest `/core` dual · Settings/XBOS body SoT · PREV/VER/PDF/TPL invent DONE · CORE-08=pillar · note=FR-08 · printable flip · seed | **PASS** |
| Snapshot freeze assert path documented | **PASS** (helper + J-03 plan) |
| vitest | **13 PASS** (4 files incl. PATCH regression) |

### Files touched

- `apps/web/hrm/src/lib/contractClauseLibraryUx.ts` (+ test)
- `apps/web/hrm/src/lib/contractLegalPrintConstants.ts` — status VI labels
- `apps/web/hrm/src/lib/apiError.ts` + `apiError.core-09a.test.ts`
- `apps/web/hrm/src/integrations/hrmApi.ts` — `getContractClause`
- `apps/web/hrm/src/components/settings/ContractLegalPrintSettingsPanel.tsx`
- `apps/web/hrm/src/lib/poHrmMvpGd1Core09aClusterFe01.source.test.ts`

### Snapshot freeze assert path (QA)

```text
1) Library mutate: PATCH /api/hrm/contracts-insurance/contract-clauses/:id → 409 HRM-CTR-CL-CODE-CONFLICT (when active+issued)
2) FE: banner ctr-clause-issued-conflict-banner → POST …/activate (bump)
3) Reopen issued print version: GET …/contracts/:contractId/print-versions
4) Assert clauses_snapshot_json body UNCHANGED vs pre-bump library edit attempt
5) Network clause mutate path MUST contain /contracts-insurance/contract-clauses — Nest /core = FAIL
```

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/contractClauseLibraryUx.test.ts \
  src/lib/apiError.core-09a.test.ts \
  src/lib/poHrmMvpGd1Core09aClusterFe01.source.test.ts \
  src/integrations/contractClauseApiPatch.test.ts
# → 4 files · 13 tests PASS
```

---

## 4. U65 browser plan (QA — no seed)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-CORE-09A-01** | Login → Cài đặt → tab Điều khoản HĐ → Thêm (+ `{{token}}`) → Lưu → F5 → **Hiệu lực** → F5 | Network **POST** `/contracts-insurance/contract-clauses` **2xx** · status **Nháp** then **Hiệu lực** · **POST …/activate** **2xx** · path physical · **không** Nest `/core` |
| **J-HRM-CORE-09A-02** | Row **Nháp** → Sửa body → Lưu → F5 | Network **PATCH …/contract-clauses/:id** **2xx** · body mới còn sau F5 |
| **J-HRM-CORE-09A-03** | Row **Hiệu lực** đã gắn HĐ issued → Sửa body → Lưu | Network PATCH **409** `HRM-CTR-CL-CODE-CONFLICT` · banner + **Tăng phiên bản** → **POST …/activate** **2xx** · issued `clauses_snapshot_json` **unchanged** |
| **J-HRM-CORE-09A-04** | Row active → **Ngừng** · Network assert + must_keep | **POST …/retire** **2xx** · label **Ngừng dùng** · Nest `/core` **0** · publish/pull RETAIN ≠ body SoT · CORE-08/02/01 seals · **≠** printable true · **≠** CORE-08=pillar DONE · **≠** PREV/VER/PDF/TPL DONE |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed Settings  
**Prerequisite:** LIVE Nest contract-clauses* (API RETAIN) · optional issued print version for J-03 freeze  
**Cấm:** `pnpm seed:*` · Nest `/core` SoT · Settings/XBOS body writer · honesty flip · reopen J-CORE-08/02/01 rewrite

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-FE-CORE-09A-ISSUED-BODY** | After CONFLICT, activate bumps version but does not apply pending form body (BE RETAIN) — new body = draft row / peer residual, **not** invent this WI | BE / BA peer |
| **R-FE-CORE-09A-PREV-PDF** | F-CORE-CTR-PREV/VER/PDF/TPL **OUT** invent as DONE | peer 09b/09c/09d |
| Honesty | `contracts_printable_ready=false` · C-SLICE · CORE-08 ≠ pillar DONE · note ≠ FR-08 DONE | QC |

---

## 6. Honesty footer

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
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09a-cluster-fe-01.md` |
| **completion_report** | Settings Thư viện điều khoản HĐ residual bound to LIVE `/api/hrm/contracts-insurance/contract-clauses*` (list/create/get/update/activate/retire) · draft in-place + F5 · issued CONFLICT banner → POST activate bump · soft retire · `{{field}}` validate · VI status/group/pack labels · publish/pull RETAIN ≠ body SoT · DENY Nest `/core` · printable false · no PREV/VER/PDF/TPL invent DONE · must_keep CORE-08/02/01 · vitest 13 PASS · U65 browser plan J-HRM-CORE-09A-01..04. |
| **next_dispatch_prompt** | See below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09A-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
depends_on: FE-01 READY_FOR_QA @ docs/qa/evidence/po-hrm-mvp-gd1-core-09a-cluster-fe-01.md · API-01 CONFIRMED RETAIN
uc_ids: UC-BP-CORE-09a
entry_criteria: browser-only; U65 zero-seed; L0 stack up
exit_criteria: J-HRM-CORE-09A-01..04 evidence blocks (FE after 2xx + F5); Network path contains /contracts-insurance/contract-clauses; Nest /core clause = 0; snapshot freeze on J-03; publish/pull ≠ claim body SoT; printable false; CORE-08/02/01 must_keep; ack PASS_TO_PM
cấm: pnpm seed:* · API inbox seed · claim CORE-08=pillar DONE · note=FR-08 DONE · PREV/VER/PDF/TPL invent DONE · honesty flip
spec_ref: F-CORE-CTR-CL-01..04 · AC-CORE-09A-* · BR-CTR-CL-01..04
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-core-09a-cluster-qa-01.md
persona: ceo@xe.vn / Xevn@2026
```
