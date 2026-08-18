# Evidence — PO-HRM-MVP-GD1-CORE-05-CLUSTER-FE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-05-CLUSTER-FE-02` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-CORE-05` |
| **depends_on** | QA-01 **FAIL** `CORE05QA-MSLGFOXU` · peer BE-02 coerce empty→null · FE-01 RETAIN |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **FIX** · preserve_default · CODE-MEMORY **APPEND** |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · **C-SLICE** · **DENY** CORE-05 DONE / CORE-06/07 invent |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-05 Luồng #1–#4 · Diễn biến #1–#2
- tech_spec / api: PO-HRM-MVP-GD1-CORE-05-CLUSTER-API-01.md F-CORE-AST-01 · F-CORE-AST-BB-01
- ba: PO-HRM-MVP-GD1-CORE-05-CLUSTER-BA-01.md AC-CORE-05-* · J-HRM-CORE-05-01..05
- qa_fail: docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-qa-01.md · R-CORE-05-EMPTY-DATE-500 · stamp CORE05QA-MSLGFOXU
- sponsor_confirm: FIX blank-date omit · peer BE coerce · RETAIN BB/serial/soft
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Create/update payload **omit** blank `assigned_date` / `return_date` (snake + camel) | **FIX** |
| Never send `assignedDate`/`returnDate` as `""` | **PASS** |
| RETAIN BB CTA · serial 409 toast · soft thu hồi · Network `/employees/:id/assets*` | **PASS** |
| Nest `/core` AST SoT | **0** (source lock) |
| DENY notes=BB · invent Asset SoT · claim CORE-05 DONE · honesty flip · seed · invent CORE-06/07 | **PASS** |
| vitest | **5 files · 25 PASS** |

### Files touched

- `apps/web/hrm/src/lib/empCoreAstRing.ts` — `buildAssetWritePayload` · `isBlankAssetDate` · CODE-MEMORY APPEND
- `apps/web/hrm/src/hooks/useEmployeeAssets.ts` — add/update use omit helper · CODE-MEMORY APPEND
- `apps/web/hrm/src/components/employee/EmployeeAssets.tsx` — CODE-MEMORY APPEND (UI form still holds `""`; write path omits)
- `apps/web/hrm/src/lib/empCoreAstRing.test.ts` — blank-date omit regression
- `apps/web/hrm/src/lib/poHrmMvpGd1Core05ClusterFe02.source.test.ts` — source lock

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/empCoreAstRing.test.ts \
  src/lib/apiError.core-05.test.ts \
  src/lib/poHrmMvpGd1Core05ClusterFe01.source.test.ts \
  src/lib/poHrmMvpGd1Core05ClusterFe02.source.test.ts \
  src/hooks/useEmployeeAssets.mapAsset.test.ts
# → 5 files · 25 tests PASS · exit 0
```

**Payload contract (FE):**

| Form state | POST/PATCH body |
|------------|-----------------|
| `assigned_date: ""`, `return_date: ""` | keys **omitted** |
| `assignedDate: ""`, `returnDate: "  "` | keys **omitted** |
| ISO date filled | key kept as ISO `yyyy-MM-dd` |

Peer BE-02: coerce remaining `""` → `null` (defense in depth).

---

## 4. U65 browser plan (QA-02 — no seed)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-CORE-05-01** | Hồ sơ NV → tab **Tài sản** → Thêm cấp phát (leave dates blank) → Lưu → F5 | Network **POST** `/api/hrm/employees/:id/assets` **2xx** · body **no** `assignedDate:""` / `returnDate:""` · row on list · Nest `/core` **0** |
| **J-HRM-CORE-05-02** | **Xác nhận nhận** → F5 | PATCH confirm flags **2xx** · BB badge · notes≠BB |
| **J-HRM-CORE-05-03** | duplicate serial | Toast **`HRM-EMP-ASSET-SERIAL-CONFLICT`** |
| **J-HRM-CORE-05-04** | **Thu hồi (đổi trạng thái)** | PATCH `status=returned` · soft prefer |
| **J-HRM-CORE-05-05** | Network + seals | Nest `/core` **0** · honesty false · C-SLICE · **DENY** CORE-05/06/07 DONE |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed  
**Prerequisite:** BE-02 empty→null LIVE (parallel) + dist rebuild if needed  
**Cấm:** `pnpm seed:*` · Nest `/core` SoT · honesty flip · invent CORE-06/07

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-FE-CORE-05-QA02** | Browser U65 retest J-01..05 after FE omit + BE coerce | **qa** |
| Honesty / C-SLICE | flags false · CRUD ≠ CORE-05 DONE · CORE-06 OUT | QC |
| Peer BE-02 | coerce `""` DATE → null must be LIVE for belt-and-suspenders | BE / QA |

---

## 6. Handoff

```yaml
work_item_id: PO-HRM-MVP-GD1-CORE-05-CLUSTER-FE-02
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-fe-02.md
completion_report: |
  FIX R-CORE-05-EMPTY-DATE-500 FE side: buildAssetWritePayload omits blank
  assigned/return dates on create/update. RETAIN BB CTA · serial 409 toast ·
  soft status · Nest /core = 0. DENY CORE-05 DONE · honesty flip · seed ·
  invent CORE-06/07. vitest 5 files · 25 PASS.
next_owner: qa
next_dispatch_prompt: |
  work_item_id: PO-HRM-MVP-GD1-CORE-05-CLUSTER-QA-02
  lane: execution · qa
  program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
  uc_ids: UC-BP-CORE-05
  depends_on: FE-02 READY · BE-02 READY (empty→null) · prior FAIL CORE05QA-MSLGFOXU
  entry_criteria: L0 PASS; browser-only U65; zero-seed; portal CEO
  exit_criteria: J-HRM-CORE-05-01..05 retest; POST blank dates → 2xx (no 500);
    Network body omits ""; BB/serial/soft RETAIN; Nest /core = 0;
    DENY honesty flip · CORE-05/06/07 DONE; evidence QA-02
  evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-qa-02.md
  cấm: pnpm seed:* · API inbox seed · claim module DONE on slice
```

**ack_status:** `READY_FOR_QA`
