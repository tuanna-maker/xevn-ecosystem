# Evidence — PO-HRM-MVP-GD1-PLT-01-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PLT-01-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-24 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-PLT-01` · `FR-UC-BP-PLT-01` · `J-HRM-PLT-01-01..06` DRAFT |
| **depends_on** | API-01 **CONFIRMED RETAIN** · DATA-01 HOLD · BA-01 O1–O12 · SA Option A · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` printable false · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Dev-BE HOLD |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **UPGRADE** · preserve_default · CODE-MEMORY **APPEND** |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · `hrm_personnel_uat_ready=false` · **C-SLICE** · peer catalog≠PLT DONE · merge LIVE≠platform UAT · catalog/CRUD/LIVE≠CORE-10 DONE · ≠ CORE-10/09/07 DONE · PAY/ATT OUT · **DENY** mega-EAV · Nest `/core` DENY · no seed |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-PLT-01 Diễn biến #1–#5 · Thành công · BR-PLT-01..06
- tech_spec / api: docs/program/specs/PO-HRM-MVP-GD1-PLT-01-CLUSTER-API-01.md
  F-PLT-TOK-01 list/get · F-PLT-TOK-02 upsert/retire · F-PLT-TOK-03 resolve-preview
  R-PLT-01-DISP FE-derive labelVi · Nest /core DENY · paper /core alias only
- ba: docs/program/specs/PO-HRM-MVP-GD1-PLT-01-CLUSTER-BA-01.md O1–O12 · AC-PLT-01-* · J-HRM-PLT-01-01..06 DRAFT
- data: DATA-01 HOLD · hrm_merge_tokens RETAIN · no schema invent · no mega-EAV
- must_keep: CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE
- sponsor_confirm: API-01 CONFIRMED RETAIN 2026-08-09 · prefer FE+QA · Dev-BE HOLD
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Bind MergeToken admin → physical `/api/hrm/merge-tokens*` (list/get · upsert · retire · resolve-preview) | **RETAIN + UPGRADE** fidelity |
| labelVi primary · display tokenKey/status/ring/domain/archivedAt | **UPGRADE** — R-PLT-01-DISP |
| Soft-retire only (`POST …/retire`) · include_archived admin · **no** hard-delete | **UPGRADE** |
| resolve-preview smoke · ≠ VER/print SoT invent | **UPGRADE** honesty copy |
| Nest `/core` TOK/PLT SoT = 0 (source lock) | **PASS** |
| Honesty footer catalog≠PLT · merge≠UAT · catalog≠CORE-10 · CORE-10/09/07 RETAIN · printable false · PAY/ATT OUT | **ADD** `plt-01-honesty` |
| DENY mega-EAV · Nest `/core` invent · seed · honesty flip · claim PLT/CORE DONE | **PASS** |
| CODE-MEMORY APPEND | **PASS** |
| vitest | **3 files · 13 PASS** (see §3) |

### Files touched

- `apps/web/hrm/src/lib/pltTokRing.ts` (+ test) — path/DISP/honesty/archived helpers
- `apps/web/hrm/src/lib/poHrmMvpGd1Plt01ClusterFe01.source.test.ts` — Nest `/core` 0 · honesty locks
- `apps/web/hrm/src/lib/mergeTokenCatalog.ts` (+ test) — CODE-MEMORY APPEND · printable false RETAIN
- `apps/web/hrm/src/components/settings/MergeTokenSettingsPanel.tsx` — LIVE DTO bind · include_archived · archivedAt · honesty · soft-retire
- `apps/web/hrm/src/integrations/hrmApi.ts` — CODE-MEMORY APPEND (RETAIN physical paths)

### Network assert path (QA)

```text
1) Settings → tab Điều khoản HĐ / Token merge → GET /api/hrm/merge-tokens*  (no Nest /core)
2) Đăng ký / Upsert → PUT /api/hrm/merge-tokens → 2xx · F5 list · labelVi primary
3) Soft-retire → POST …/:id/retire → archivedAt set · picker hide (default list) · include_archived shows row
4) Resolve preview → POST …/resolve-preview · registry wins · ≠ VER write / print SoT
5) Footer plt-01-honesty: peer catalog≠PLT DONE · merge≠platform UAT · catalog/CRUD/LIVE≠CORE-10 DONE · printable false · PAY/ATT OUT · CORE-10/09/07 RETAIN · soft≠CORE-06 DONE
```

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/pltTokRing.test.ts \
  src/lib/poHrmMvpGd1Plt01ClusterFe01.source.test.ts \
  src/lib/mergeTokenCatalog.test.ts
# → exit 0 · 3 files · 13 tests PASS
```

**R-PLT-01-DISP:** FE uses LIVE `labelVi` as primary · `{{tokenKey}}` secondary · archivedAt column. **No Dev-BE dispatch** — display-ready PRESENT.

---

## 4. U65 browser plan (QA-01 — no seed)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-PLT-01-01** | Login → Cài đặt → catalog hẹp peer (EMP DOC/ET cite) → N+1 Lưu 2xx → F5 · Nest `/core` **0** · ≠ PLT DONE | AC-PLT-01-LOAD/CAT/CNS/PATH · U65 |
| **J-HRM-PLT-01-02** | Soft-retire token (or catalog peer) → picker ẩn · include_archived/history OK · **no** hard-delete · Nest 0 | AC-PLT-01-RETIRE |
| **J-HRM-PLT-01-03** | Lưu schema hẹp EMP-CF/JD/CTR cite → F5 · no mega-EAV · jd_dynamic=false · Nest 0 | AC-PLT-01-SCHEMA |
| **J-HRM-PLT-01-04** | Settings MergeToken → GET `/api/hrm/merge-tokens` 200 · labelVi · empty OK · Nest 0 · ≠ platform UAT alone | AC-PLT-01-TOK-LIST |
| **J-HRM-PLT-01-05** | Upsert token (hoặc Lưu DOC/ET/CF active) → F5 list refresh · Nest 0 | AC-PLT-01-TOK-REG |
| **J-HRM-PLT-01-06** | Resolve-preview smoke + honesty footer · cite CORE-09 freeze ≠ printable · seals CORE-10/09/07 RETAIN · PAY/ATT OUT · soft≠CORE-06 DONE · no reopen sealed J-* | AC-PLT-01-FREEZE/≠-*/H/MK-* |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed → Settings → Điều khoản HĐ / Token merge  
**Cấm:** `pnpm seed:*` · Nest `/core` TOK/PLT SoT · claim peer catalog = PLT DONE · claim merge LIVE = platform UAT · claim catalog/CRUD/LIVE = CORE-10 DONE · invent PAY/ATT/printable/Word DONE · mega-EAV · hard-delete · honesty flip · reopen sealed J-*

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-PLT-01-DISP** | FE-derive OK — **no BE invent** | — |
| **R-FE-PLT-01-BE-LIVE** | Browser 🟢 needs LIVE Nest merge-tokens | QA / BE if FAIL |
| Honesty | printable=false · C-SLICE · ≠ PLT/platform UAT · ≠ CORE-10/09/07 DONE · soft≠CORE-06 DONE · PAY/ATT OUT | QC |
| Peers | CORE-10/09/07/06..01 seals must_keep · ≠ claim DONE from this seat | QC |
| L1/L2 journeys | J-01/J-03 span peer Settings panels (not MergeToken-only) | QA |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-plt-01-cluster-fe-01.md` |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PLT-01-CLUSTER-QA-01
role: qa
entry_criteria: FE-01 READY_FOR_QA @ docs/qa/evidence/po-hrm-mvp-gd1-plt-01-cluster-fe-01.md · API-01 CONFIRMED RETAIN · U65 zero-seed · L0 stack up · Dev-BE HOLD
exit_criteria: J-HRM-PLT-01-01..06 browser evidence · Network /api/hrm/merge-tokens* (+ settings-catalogs/domain Nest peers) · Nest /core TOK/PLT = 0 · labelVi primary · soft-retire no hard-delete · resolve-preview ≠ VER/print SoT · honesty footers peer catalog≠PLT DONE · merge≠platform UAT · catalog/CRUD/LIVE≠CORE-10 DONE · printable false · PAY/ATT OUT · CORE-10/09/07 RETAIN · soft≠CORE-06 DONE · no seed · PASS_TO_PM or FAIL with residual
must_keep: CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE
cấm: seed · Nest /core TOK/PLT SoT · claim peer catalog = PLT DONE · claim merge LIVE = platform UAT · claim catalog/CRUD/LIVE = CORE-10 DONE · invent PAY/ATT/printable/Word DONE · mega-EAV · honesty flip · reopen sealed J-*
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-plt-01-cluster-qa-01.md
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-plt-01-cluster-fe-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PLT-01-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PLT-01-CLUSTER-API-01.md
```

---

## Footer — honesty

> **honesty:** `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PLT/personnel/CTR module UAT **false** · **C-SLICE**  
> peer catalog ≠ PLT-01 DONE · merge LIVE ≠ platform UAT · catalog/CRUD/LIVE ≠ CORE-10 DONE · ≠ CORE-10/09/07 DONE · PAY/ATT OUT invent DONE · must_keep CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · no mega-EAV · no seed
