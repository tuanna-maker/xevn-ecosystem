# Evidence — PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01` |
| **lane** | governance · sa |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-10 seat **#12**) |
| **uc_ids** | `UC-BP-CORE-01` |
| **Date** | 2026-08-09 |
| **depends_on** | DATA-01 CONFIRMED · BA-01 O1–O12 · SA Option A · peer seal **`REC07QC1-MSL5WXU5`** |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01.md` |
| **ack_status** | **PASS_TO_PM** · API **CONFIRMED** |
| **change_mode** | DOC-DELTA F.1 · **NO** `apps/**` · **no seed** · **no honesty flip** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| UPGRADE F-CORE-EMP-01 GET/PATCH/list on `/api/hrm/employees*` | **PASS** §5.1 |
| Public-only serializer from DATA §4 allow-list · strip §4.3 | **PASS** §4 · §6.1 |
| PATCH/POST CB deny-list → **403** `HRM-CORE-CB-403` · no silent strip | **PASS** §1 CORE-PUB-REJECT · §4.2 · §7 |
| F5 no leak (AC-CORE-PUB-02) | **PASS** §1 CORE-PUB-F5 · §8 sequence |
| Paper `/api/hrm/core/employees/{id}` = alias only | **PASS** §3 |
| ADD F-CORE-DEP-01 GET/POST/PATCH/(soft)DELETE `…/dependents*` | **PASS** §5.2 |
| Mint `HRM-CORE-DEP-VAL-400` / `HRM-CORE-DEP-404` · `relation_label` | **PASS** §5.2 · §6.2 · §7 |
| U19 list=get=patch=deps | **PASS** §8 CORE-S-SCOPE |
| RETAIN HTP-05 · F-REC-HIRE-01 · soft `candidate_id` · CF/status | **PASS** §5.3–§5.5 · §10 |
| DENY Nest `/core` dual EMP · Nest `/rec` dual · second deps · CORE-02 write · hire=CORE DONE · seed · honesty · apps/** | **PASS** §1/§10 |
| Unlock Dev-BE/FE after CONFIRMED (not before) | **PASS** §11 · §13 |
| ba-data already CONFIRMED (no re-invent) | **PASS** §9 |
| F.1 Mục đích · Nghiệp vụ · bước SRS #1–#4 | **PASS** §5.1–§5.2 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| DATA-01 | §4 public allow/deny strip · §5 `employee_dependents` · DV-CORE-* · VAL-CORE-* · paper `/core` alias |
| BA-01 | O1–O12 · AC-CORE-01-* · VAL-CORE-PUB-* · primary `/employees*` · deps path · CB-403 · DEP-* mint |
| SA-01 | Option A LOCKED · UPGRADE EMP public ring + ADD deps · paper `/core` alias · REJECT B/C |
| SRS | FR-UC-BP-CORE-01 Diễn biến #1–#4 · BR-BP-SEC-01 · AC-CORE-PUB-01/02 · AC-CORE-CB-MAP-01 |
| Paper API | F-CORE-EMP-01 · F-CORE-DEP-01 · `/core` = alias |
| AS-IS Nest (read-only) | `@Controller('employees')` LIVE · `mapEmployee` returns **raw `custom_fields`** · summary salary bands LIVE · **ABSENT** dependents · **ABSENT** Nest `/core` EMP · HTP-05 LIVE · REC-07 soft `candidate_id` SEALED |
| Peer style | REC-07 CLUSTER-API-01 F.1 physical prefer |

---

## 3. Decisions summary

| Topic | Decision |
|-------|----------|
| Path | Physical `/api/hrm/employees*` · paper `/core/employees*` alias only |
| EMP SoT | ONE LIVE `public.employees` — UPGRADE serializer + CB-403 |
| CB | Fail-closed 403 — silent strip-and-200 = FAIL O3 |
| Dependents | ONE `employee_dependents` ADD — soft `archived_at` · `relation_label` |
| Summary | Salary bands gated — not public-ring default SoT (VAL-D-06) |
| Hire / HTP | RETAIN · ≠ CORE DONE |
| Peers OUT | CORE-02 write · CORE-01a · Nest `/rec` dual |
| Unlock | **dev-be** + **dev-fe** after this CONFIRMED |

---

## 4. Deliverables inventory

| Artifact | Path |
|----------|------|
| API F.1 DOC | `docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01.md` |
| This evidence | `docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-api-01.md` |

---

## 5. Honesty / DENY footer

| Flag / claim | Status |
|--------------|--------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| CORE / personnel module UAT | **false** |
| C-SLICE | GWC CORE-01 ≠ module UAT ≠ Phase1 DONE |
| hire = CORE DONE | **DENY** |
| Nest `/core` dual EMP | **DENY** |
| Nest `/rec` dual | **DENY** |
| Second deps SoT / PAY person CRUD | **DENY** |
| CORE-02 write this seat | **OUT** |
| Seed / honesty flip / apps/** this seat | **DENY** |
| Reopen sealed J-HRM-REC-07-* | **DENY** without regression |

---

## 6. Completion handoff

| Field | Value |
|-------|--------|
| **completion_report** | F.1 Option A CONFIRMED — UPGRADE F-CORE-EMP-01 public ring + ADD F-CORE-DEP-01 dependents · unlock Dev-BE/FE · residual QA J-HRM-CORE-01-01..04 · QC GWC C-SLICE |
| **next_owner** | **pm** → **dev-be** + **dev-fe** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-api-01.md` |

### next_dispatch_prompt (BE)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-01-CLUSTER-BE-01
lane: execution · dev-be
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-01
depends_on: API-01 CONFIRMED — docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01.md · DATA-01 · BA-01 O1–O12 · SA Option A
entry_criteria: F.1 CONFIRMED; honesty false; C-SLICE; U65; cấm Nest /core dual EMP · Nest /rec dual · second deps SoT · CORE-02 write · hire=CORE DONE · seed · honesty flip · reopen sealed J-07
MISSION: Implement physical Nest /api/hrm/employees* — UPGRADE F-CORE-EMP-01 public-only serializer (DATA §4 allow-list + strip §4.3); PATCH/POST CB deny-list → 403 HRM-CORE-CB-403 (no silent strip); ADD F-CORE-DEP-01 GET/POST/PATCH/soft-DELETE /employees/:id/dependents* on employee_dependents (DATA §5); mint HRM-CORE-DEP-VAL-400 / DEP-404; display-ready relation_label; gate summary salary for non-C&B; U19 list=get=patch=deps; RETAIN HTP-05 · F-REC-HIRE-01 · soft candidate_id · CF/status consumers; ensureSchema; jest. Parallel FE-01.
exit: docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-be-01.md · READY_FOR_QA
cấm: Nest /core dual · Nest /rec dual · second EMP/deps SoT · hard FK hire · CORE-02 write · claim hire=CORE DONE · seed · honesty flip · reopen sealed J-07 · silent CB strip-and-200
```

### next_dispatch_prompt (FE)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-01-CLUSTER-FE-01
lane: execution · dev-fe
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-01
depends_on: API-01 CONFIRMED · BE-01 in parallel OK for UI bind stubs
MISSION: Bind hồ sơ vòng công khai → GET/PATCH /api/hrm/employees/:id only (public fields); hide/redirect C&B (AC-CORE-CB-MAP-01); dependents UI → /employees/:id/dependents*; relation_label + DOB dd/MM/yyyy; toast CB-403 / DEP-*; F5 no C&B leak; DENY Nest /core SoT · same-form salary · FE invent salary aggregate · hire=CORE DONE · seed · honesty.
exit: docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-fe-01.md · READY_FOR_QA
```
