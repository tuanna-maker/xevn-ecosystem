# Evidence — PO-HRM-MVP-GD1-CORE-09-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-22 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-CORE-09` · `J-HRM-CORE-09-01..06` DRAFT |
| **depends_on** | API-01 **CONFIRMED RETAIN** · DATA-01 HOLD · BA-01 O1–O12 · SA Option A · `CORE07QC1-KZJTSHNT` · printable **false** · Word/DOCX **OUT** |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **ADD** · preserve_default · CODE-MEMORY **APPEND** |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · `hrm_personnel_uat_ready=false` · **C-SLICE** · **DENY** registry/09a–d = CORE-09 DONE · **DENY** invent PAY/ATT/printable DONE · **DENY** soft=CORE-06 DONE · **DENY** claim CORE-07 DONE |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-09 Luồng #1–#5 · Diễn biến #1–#4 · AC-CTR-TPL-01..05 · AC-CTR-XEVN-08 · BR-BP-CTR-01
- tech_spec / api: docs/program/specs/PO-HRM-MVP-GD1-CORE-09-CLUSTER-API-01.md
  F-CORE-CTR-01 registry · F-CORE-CTR-PREV-01 ephemeral · R-CORE-09-DISP-01 FE-derive · peers VER/TPL/CL/PACK RETAIN cite
- ba: docs/program/specs/PO-HRM-MVP-GD1-CORE-09-CLUSTER-BA-01.md O1–O12 · AC-CORE-09-* · J-HRM-CORE-09-01..06 DRAFT
- data: DATA-01 HOLD · employee_contracts + keyword_map + merge tokens RETAIN · Word OUT · no schema invent
- must_keep: CORE-07 GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE · CORE-09d..01 seals · printable false
- sponsor_confirm: API-01 CONFIRMED RETAIN 2026-08-09 · prefer FE+QA · Dev-BE only if DISP cannot derive
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| PREV bind `merged_fields` / `missing_*` / `can_issue` / `cb_masked` / `template_code` | **RETAIN + UPGRADE** fidelity |
| ZERO-TPL CTA `ctr-core09-zero-tpl-cta` · disable fake VER save when 0 templates | **ADD** |
| Mandatory block · `isPreviewMandatoryBlocked` · save-version gate | **ADD** |
| Registry without template (omit blank `template_id` · AC-CTR-XEVN-08 note) | **ADD** |
| Network physical `/contracts-insurance/*` only · Nest `/core` CTR = 0 | **PASS** (source lock) |
| Footer 09a–d≠DONE · printable false · CORE-07 GATE/ACT RETAIN | **ADD** |
| R-CORE-09-DISP-01 FE-derive `statusLabelVi` · preserve `terminated` | **ADD** (no BE invent) |
| DENY Word invent · PAY/ATT/printable DONE · wipe CORE-07 · soft=CORE-06 DONE · seed | **PASS** |
| CODE-MEMORY APPEND | **PASS** |
| vitest | **7 files · PASS** (see §3) |

### Files touched

- `apps/web/hrm/src/lib/contractCore09Ring.ts` (+ test) — path/DISP/ZERO-TPL/mandatory/honesty helpers
- `apps/web/hrm/src/lib/poHrmMvpGd1Core09ClusterFe01.source.test.ts` — Nest `/core` 0 · honesty locks
- `apps/web/hrm/src/components/contracts/ContractPrintSpinePanel.tsx` — ZERO-TPL CTA · honesty · cb_masked banner · VER gate
- `apps/web/hrm/src/hooks/useContracts.ts` (+ test) — omitBlank template · statusLabelVi · terminated preserve
- `apps/web/hrm/src/pages/Contracts.tsx` — registry honesty + no-tpl note · badge bind
- `apps/web/hrm/src/integrations/hrmApi.ts` — `statusLabelVi` on `HrmContractRecord` · CODE-MEMORY APPEND

### Network assert path (QA)

```text
1) Hợp đồng list/create → GET/POST /api/hrm/contracts-insurance/contracts*  (no Nest /core)
2) Create without template_id → 2xx · F5 còn (AC-CTR-XEVN-08 / J-06)
3) 0 active TPL → ctr-core09-zero-tpl-cta · Lưu phiên bản disabled (J-01)
4) ≥1 mẫu → Xem trước → POST …/contracts/:id/preview → merged_fields + missing_* + can_issue + cb_masked (J-02/03/04)
5) can_issue=false → không silent VER; ISSUE-BLOCKED / missing list (J-03)
6) can_issue=true → POST …/print-versions → F5 còn · printable=false (J-05)
7) Footer: 09a–d≠DONE · registry≠DONE · CORE-07 GATE/ACT RETAIN · soft≠CORE-06 DONE
```

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/contractCore09Ring.test.ts \
  src/lib/poHrmMvpGd1Core09ClusterFe01.source.test.ts \
  src/hooks/useContracts.test.ts \
  src/lib/contractPackPreviewUx.test.ts \
  src/lib/poHrmMvpGd1Core09bClusterFe01.source.test.ts \
  src/lib/poHrmMvpGd1Core09cClusterFe01.source.test.ts \
  src/lib/contractPrintVersionUx.test.ts
# → exit 0 · contractCore09Ring 6 · source lock 4 · useContracts 13+ · peers RETAIN
```

**R-CORE-09-DISP-01:** FE derives `active→Hiệu lực` · `expired→Hết hạn` · `terminated→Chấm dứt` when BE omits `statusLabelVi`. **No Dev-BE dispatch required** for this residual (FE can derive safely).

---

## 4. U65 browser plan (QA-01 — no seed)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-CORE-09-01** | 0 mẫu active → spine CTA · cố Lưu VER | `ctr-core09-zero-tpl-cta` · save-version disabled · Nest `/core` **0** · no fake VER |
| **J-HRM-CORE-09-02** | Chọn mẫu → Xem trước | POST `…/preview` **200** · `merged_fields` populated · Nest `/core` 0 · ephemeral |
| **J-HRM-CORE-09-03** | Thiếu field bắt buộc → Lưu VER | `can_issue=false` + missing list / ISSUE-BLOCKED · no silent 2xx |
| **J-HRM-CORE-09-04** | Non-C&B PREV | `cb_masked` banner · không lộ lương/MST · CORE-02 must_keep |
| **J-HRM-CORE-09-05** | PREV đủ → Lưu VER → F5 | POST print-versions 2xx · F5 còn · **≠** printable flip |
| **J-HRM-CORE-09-06** | CRUD sổ **không** mẫu · seals | POST/PATCH contracts without template_id · F5 · Nest `/core` 0 · footer 09a–d≠DONE · registry≠DONE · CORE-07 GATE/ACT RETAIN · soft≠CORE-06 DONE · Word OUT · no reopen sealed J-* |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed `/hr/contracts`  
**Cấm:** `pnpm seed:*` · Nest `/core` SoT · Word/DOCX invent · claim registry/09a–d/VER = CORE-09 DONE · invent PAY/ATT/printable DONE · wipe CORE-07 · claim soft=CORE-06 DONE · honesty flip

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-CORE-09-DISP-01** | FE-derive OK — **no BE invent** unless QA wants BE envelope prefer-only | optional thin BE later |
| **R-FE-CORE-09-BE-LIVE** | Preview/VER browser 🟢 needs LIVE Nest contracts-insurance | QA / BE if FAIL |
| Honesty | printable=false · C-SLICE · 09a–d≠DONE · registry≠DONE · CORE-07≠DONE · soft≠CORE-06 DONE | QC |
| Peers | 09a–d ADD seals must_keep · ≠ parent CORE-09 DONE | QC |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09-cluster-fe-01.md` |
| **next_dispatch_prompt** | See below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09 · J-HRM-CORE-09-01..06 DRAFT
depends_on: FE-01 READY_FOR_QA · docs/qa/evidence/po-hrm-mvp-gd1-core-09-cluster-fe-01.md · API-01 CONFIRMED RETAIN
entry_criteria: browser-only; U65 zero-seed; L0 stack up; persona ceo@xe.vn
exit_criteria: J-HRM-CORE-09-01..06 evidence blocks; Network physical /contracts-insurance/* only · Nest /core CTR=0; PREV ephemeral; ZERO-TPL CTA; mandatory block; registry without template; footer 09a–d≠DONE · printable false · CORE-07 GATE/ACT RETAIN · soft≠CORE-06 DONE; DENY claim registry/09a–d=CORE-09 DONE · invent PAY/ATT/printable DONE · Word invent · seed
cấm: pnpm seed:* · Nest /core SoT · claim printable flip · reopen sealed J-HRM-CORE-07/06/05/03/02B/09D..01
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-core-09-cluster-qa-01.md
ack_status target: PASS_TO_PM
```

### completion_report

Closed: CORE-09 parent FE residual — PREV bind fidelity, ZERO-TPL CTA, mandatory gate, registry-without-template, Nest `/core` 0 lock, honesty footers (09a–d≠DONE · printable false · CORE-07 RETAIN), FE-derive `statusLabelVi` without schema invent.  
Open: U65 browser QA J-01..06; LIVE Nest for green journeys.
