# Evidence — R-U84-LEAVE-DL-PERSONA-SCOPE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `R-U84-LEAVE-DL-PERSONA-SCOPE-01` |
| **from_role** | `ba-data` |
| **to_role** | `pm` |
| **date** | 2026-08-03 |
| **lane** | governance (read-only triage) |
| **priority** | P0 |
| **ack_status** | **PASS_TO_PM** |
| **U65** | honored — no `pnpm seed:*`; no INSERT/UPDATE as UAT path · *see §7 diagnostic note* |
| **source FAIL** | `docs/qa/evidence/u78-u84-primary-leave-dl-01.md` |
| **matrix** | `docs/program/matrices/PO_WF_CATALOG_COMPANY_MATRIX.md` §1–§2 |
| **slug map** | `scripts/lib/hrm-company-slug-map.mjs` |
| **persona pack** | `docs/qa/testcases/hrm-web/HRM-WF-INSTANCE-MATRIX.md` §5.4 |
| **scope SoT** | `docs/qa/PILOT_SCOPE_DATA_MATRIX.md` §3–§4 |
| **OS 33** | blocked env ≠ invent EVIDENCED — **TC-HIM-LEAVE-DL-* stay BLOCKED** |

---

## 1. Executive decision (one recommendation)

| Decision | Verdict |
|----------|---------|
| **REMAP** (nv0003/nv0001 → DL) | **REJECT as sole fix** — locked L1 personas are **holding**; no L1 manager on finance band |
| **FIX-PLANE** (wrong slug/UUID) | **REJECT as root cause** — CO-DL ↔ `finance` / UUID `…0004` / org `xe-du-lich` **correct** |
| **BLOCKED-EXTERNAL-BOOTSTRAP** | **RECOMMENDED** — sponsor-explicit bootstrap of **≥1 submitter + ≥1 manager edge** on true CO-DL Plane B (`finance`) before QA retest; web member path needs separate member-tenant rows if `du-lich.ceo` is mandatory |

**Primary recommendation:** `BLOCKED-EXTERNAL-BOOTSTRAP`  
**Secondary (parallel, non-blocking U84):** QA continue next Primary cell `U78-U84-PRIMARY-REC-PLAN-TMDV-01` (P-REC-PLAN @ CO-TMDV) while sponsor decides bootstrap.

---

## 2. CO-DL identity table (SoT)

| Field | Value | Source |
|-------|--------|--------|
| `co_key` | **CO-DL** | matrix §1 |
| Tên (VI) | Công ty TNHH Du lịch X.E Việt Nam | slug-map display |
| Org `companyId` (Plane A) | `xe-du-lich` | matrix §1 · org-seed |
| Member JWT | `tenantId=xe-du-lich`, `companyId=main` | matrix §1 · PILOT_SCOPE §3.3 |
| HRM op slug (Plane B) | **`finance`** | `hrm-company-slug-map.mjs` |
| `company_uuid` | `10000000-0000-4000-8000-000000000004` | slug-map only (no invent) |
| Web persona (matrix) | `du-lich.ceo@xe.vn` / `Xevn@2026` | matrix §1 · pack §5.4 |
| Process Primary | **P-LEAVE** L1 (L2 SPEC_GAP HOLD) | matrix §2 |

**Dual-plane note (matrix §1 + list-scope):**  
Group CEO may filter Plane B slug `finance` under master tenant `xevn`. Member CEO list uses **`memberTenantId=xe-du-lich` + `company_id=main`** — **not** auto-aliased to `finance`. Rows created under master + `company_id=finance` are **invisible** to `du-lich.ceo` `main` list.

`_vibe-team-os/21-DATA-LINKAGE-DUAL-PLANE.md` — **not on disk** this workspace; dual-plane taken from matrix §1 + `hrm-list-scope.ts` member branch.

---

## 3. Live employee count probes (2026-08-03 · L0 up)

Stack: hrm `:28001` · xbos `:28002` · portal `:5173` — HTTP 200.

### 3.1 Baseline (before diagnostic finance login)

| Actor | Query | HTTP / code | **total** |
|-------|-------|-------------|-----------|
| `ceo@xe.vn` · `xevn` | `company_id=holding` | 200 `HRM-EMP-200` | **43** |
| group CEO | `trsport` | 200 | **4** |
| group CEO | `logistics` | 200 | **0** |
| group CEO | **`finance`** | 200 | **0** ← matches U78 |
| group CEO | `services` | 200 | **0** |
| group CEO | `main` (rollup) | 200 | **47** (= holding+trsport) |
| group CEO | UUID `…0004` | 200 | **0** |
| group CEO | `xe-du-lich` | **409** | — (not a company slug) |
| `du-lich.ceo` · `xe-du-lich` | `company_id=main` | 200 | **0** |
| member CEO | `company_id=finance` | **409** `SCOPE_CONTEXT_MISMATCH` | token `main` ≠ request `finance` |
| member CEO | UUID `…0004` | **409** | same |

Summary API (group CEO): `GET /employees/summary?company_id=finance` → `HRM-EMP-SUMMARY-200` · baseline aligned with list **0** (pre-diagnostic).

### 3.2 Persona scope — mobile login (read)

| Email | `default_company_id` / membership | `company_uuid` | `is_manager` | employee_id |
|-------|-----------------------------------|----------------|--------------|-------------|
| `uat.nv0001@xe.vn` | **holding** | `…0001` | **true** | `3796d949-4513-45c0-88fa-33030a062b17` |
| `uat.nv0002@xe.vn` | **trsport** | `…0002` | true | `293b5900-…` |
| `uat.nv0003@xe.vn` | **holding** | `…0001` | false | `2680f15f-02b6-44e1-8b42-92a6aaeb7bfb` |
| `uat.nv0004@xe.vn` | **holding** | `…0001` | false | `c4e2de18-…` |

**Conclusion:** Preferred pack personas for leave L1 (`nv0003` submit / `nv0001` approve) are **CO-HOLD Plane B**, not CO-DL. Holding L1 PASS in U78 is **supporting XREF only** — not Primary co_key evidence (OS 33).

### 3.3 Lazy-ensure band map (code SoT — `uat-mobile-auth-ensure.ts` `personaForSeq`)

| seq | company_id | Notes |
|-----|------------|-------|
| 1 | holding | special · manager-capable |
| 2 | trsport | special · mgr persona |
| 3–200 | holding | staff |
| 201–400 | trsport | staff |
| 401–600 | logistics | staff |
| **601–800** | **finance (= CO-DL)** | staff only · **no mgr special-case** |
| 801–1000 | services | staff |

---

## 4. Option evaluation

| Option | Scope | Complexity | Risk | Fits U65 / OS 33 |
|--------|-------|------------|------|------------------|
| **A REMAP docs only** (nv0003/0001 → DL) | Lie about scope | Low | High — still holding rows | **FAIL** honesty |
| **B REMAP to seq 601+ emails** | Mobile HP on finance after login-ensure | Med | **L1 AP still blocked** (`manager_id=null`, no finance mgr) | Partial — not READY_FOR_QA |
| **C FIX-PLANE slug** | Change matrix finance↔DL | Low | Breaks BR-INT-05 / UUID map | **Wrong diagnosis** |
| **D BLOCKED-EXTERNAL bootstrap** | Sponsor-auth devops/product ensure: finance submitter + manager_id edge (± member-tenant staff for web) | Med | Needs sponsor text | **PASS** path to true co_key TC |
| **E Product WI manager-persona** | `dev-be` extend `personaForSeq` finance mgr + manager_id | Med | Code change; still needs sponsor/U65 clarity | Follow-on after D or instead of bulk seed |

**Trade-off:** B proves Plane B slug works but cannot complete TC-HIM-LEAVE-DL-AP-001. D unblocks HP+AP on true co_key without inventing EVIDENCED. C rejected.

---

## 5. Recommendation detail — BLOCKED-EXTERNAL-BOOTSTRAP

### 5.1 Exact sponsor ask (copy for PM → sponsor)

```text
Sponsor bootstrap (dev env only — không dùng làm bằng chứng UAT cho đến khi QA FE retest):

Primary cell P-LEAVE @ CO-DL cần dữ liệu HRM thật trên Plane B:
- company_id (HRM) = finance
- company_uuid = 10000000-0000-4000-8000-000000000004
- org/ co_key = xe-du-lich / CO-DL

Yêu cầu tối thiểu:
1) ≥1 nhân viên submitter active @ finance
2) ≥1 quản lý L1 @ finance với is_manager/direct reports (manager_id của submitter trỏ tới manager)
3) (Nếu TC web bắt buộc du-lich.ceo) ≥1 NV thuộc partition member tenant xe-du-lich + companyId=main — hiện list member = 0 và finance rows (tenant xevn) không hiện trên main member

Cấm: QA tự seed để PASS · claim TC-HIM-LEAVE-DL EVIDENCED trước retest FE.
```

### 5.2 If REMAP later becomes viable (post-bootstrap / post-mgr WI)

| Role | Email | Expected Plane B | UUID |
|------|-------|------------------|------|
| Submitter | `uat.nv0601@xe.vn` / `xevn-uat-2026` | `finance` | `…0004` |
| L1 approver | **TBD finance mgr** (not `uat.nv0001`) | `finance` | `…0004` |
| Web (optional) | `du-lich.ceo@xe.vn` | JWT `xe-du-lich`/`main` — needs member-partition staff | — |

**Do not** retest packet with `uat.nv0003` + `uat.nv0001` for HIM-LEAVE-DL Primary.

### 5.3 FIX-PLANE residual (not root cause of total=0)

| ID | Issue | Owner WI |
|----|-------|----------|
| `R-U84-LEAVE-DL-MEMBER-VIS` | Member `main` ≠ master `finance` visibility — web CEO path empty even if finance has staff | SA/dev-be after sponsor priority — **not** required to reject wrong-slug theory |

---

## 6. Validation / acceptance after bootstrap

| ID | Condition | Expected |
|----|-----------|----------|
| VAL-DL-01 | group CEO `GET …/employees?company_id=finance` | total ≥ 2 (submitter + manager) |
| VAL-DL-02 | summary `company_id=finance` | active_count ≥ 2 |
| VAL-DL-03 | submitter row `manager_id` = manager emp id | non-null |
| VAL-DL-04 | mobile login submitter | `default_company_id=finance`, uuid `…0004` |
| VAL-DL-05 | mobile login manager | `is_manager=true` on finance |
| VAL-DL-06 | (web path) `du-lich.ceo` `company_id=main` | total ≥ 1 **only if** member partition populated |
| VAL-DL-07 | QA U78-R1 | TC-HIM-LEAVE-DL-HP-001 + AP-001 FE chain · U65 · no invent EVIDENCED pre-run |

---

## 7. Diagnostic note (honesty)

During triage, ba-data executed **mobile login** for `uat.nv0601/0602/0700/0800` to verify `personaForSeq` → finance. Product lazy-ensure **inserted 4 STAFF rows** @ `finance` (`manager_id=null`).  

| Metric | Pre | Post-diagnostic |
|--------|-----|-----------------|
| finance total (group CEO) | **0** | **4** |
| finance L1 manager edge | none | **still none** |
| du-lich.ceo `main` total | **0** | **0** |

This is **not** UAT evidence and **does not** clear BLOCKED for AP. Residual: env now has orphan finance staff without manager — bootstrap should wire `manager_id` (or sponsor-approved cleanup + clean pair).

---

## 8. Traceability

| Layer | Ref |
|-------|-----|
| Matrix Primary | P-LEAVE × CO-DL |
| TC | TC-HIM-LEAVE-DL-HP-001 · AP-001 · SG-L2 HOLD |
| API list/detail scope | `resolveHrmListScope` · member vs group |
| Ensure map | `apps/api/hrm-api/src/auth/uat-mobile-auth-ensure.ts` `personaForSeq` |
| Prior evidence | `u78-u84-primary-leave-dl-01.md` |
| OS 33 | BLOCKED env ≠ EVIDENCED |

---

## completion_report

**Closed:** Read-only SoT triage for Primary P-LEAVE @ CO-DL empty employees; dual-plane table; live counts; persona scope of nv0001/0003; option package with **one** recommendation = BLOCKED-EXTERNAL-BOOTSTRAP; REMAP/FIX-PLANE rejected as sole fix; OS 33 — no invent EVIDENCED.  
**Open:** Sponsor bootstrap text (§5.1); optional member-visibility WI; QA retest only after VAL-DL-01..05.

**ack_status:** PASS_TO_PM  
**next_owner:** pm  
**evidence_path:** `docs/qa/evidence/r-u84-leave-dl-persona-scope-01.md`

### next_dispatch_prompt

```text
work_item_id: R-U84-LEAVE-DL-BOOTSTRAP-SPONSOR-01
role: devops (after sponsor explicit «bootstrap môi trường dev» in same message) — NOT QA invent
priority: P0
u65_zero_seed: true — bootstrap chỉ khi sponsor explicit; kết quả bootstrap ≠ UF 🟢 cho đến QA FE retest
entry: docs/qa/evidence/r-u84-leave-dl-persona-scope-01.md §5.1 ask text · finance had 0 staff at U78; nv0003/0001 = holding; personaForSeq 601–800 = finance STAFF without manager_id
mission: Under sponsor-authorized bootstrap only — ensure CO-DL Plane B pair: ≥1 submitter + ≥1 L1 manager @ company_id=finance (UUID 10000000-0000-4000-8000-000000000004) with manager_id edge; optional member-tenant xe-du-lich/main staff if web du-lich.ceo path required
exit: group CEO GET/summary finance total≥2 · submitter.manager_id set · mobile login finance submitter+mgr is_manager · READY_FOR_QA
then: Task qa U78-U84-PRIMARY-LEAVE-DL-01-R1 — TC-HIM-LEAVE-DL-HP-001 + AP-001 on true co_key (personas finance — cấm nv0003/0001 holding XREF as Primary)
alternate (defer DL): Task qa U78-U84-PRIMARY-REC-PLAN-TMDV-01 — P-REC-PLAN @ CO-TMDV L1 browser
cấm: pnpm seed as UAT evidence · invent HIM-LEAVE-DL EVIDENCED · claim L2 ladder
```
