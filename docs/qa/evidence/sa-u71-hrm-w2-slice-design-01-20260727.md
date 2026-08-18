# SA-U71-HRM-W2-SLICE-DESIGN-01 — Physical DB + API (Performance · Decisions · Metadata · Mobile)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-W2-SLICE-DESIGN-01` |
| **from_role** | `pm` |
| **to_role** | `sa` |
| **lane** | governance · U71 P2 physical design |
| **change_mode** | ADD · preserve_default |
| **date** | 2026-07-27 |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| DB_DESIGN (canonical) | `docs/hrm/DB_DESIGN_HRM_W2_SLICE.md` | **ADD** |
| API_DESIGN (canonical) | `docs/hrm/API_DESIGN_HRM_W2_SLICE.md` | **ADD** |
| Pointer DB | `docs/tech-spec/DB_DESIGN_HRM_W2_SLICE.md` | **ADD** |
| Pointer API | `docs/tech-spec/API_DESIGN_HRM_W2_SLICE.md` | **ADD** |
| Index promote | `docs/tech-spec/README.md` §2 → **17** pairs · §3 W2 DONE + OP/FL/admin residual | **UPDATED** |

**forbidden_paths:** `apps/**` — **not touched**.

---

## 2. F.1 checklist (API_DESIGN)

| § | Endpoint | Mục đích | Nghiệp vụ xử lý | Bước SRS (UC/FR + Diễn biến) | Verdict |
|---|----------|----------|-----------------|------------------------------|---------|
| A1 | `POST /performance/cycles` | ✅ Tạo chu kỳ | ✅ validate + TEXT slug + no bulk eval | FR-HRM-PF-01 #1/#3/#4/#5/#6/#8/#9 | **PASS** |
| A2 | `GET /performance/cycles` | ✅ List chu kỳ | ✅ resolveHrmListScope + empty | PF-01 #8/#9 · SCOPE | **PASS** |
| A3/A4 | evaluations POST/GET | ✅ Unlock PF phiếu | ✅ hard cycle + soft emp | PF-01 Kết quả → PF-03 | **PASS** (brief) |
| B1 | `GET /decisions` | ✅ List / empty QSĐ | ✅ scope + honest empty | FR-HRM-27 #2/#3/#4/#7 | **PASS** |
| B2 | `POST /decisions` | ✅ Tạo QSĐ | ✅ catalog decision_types | FR-27 #5/#6 · SC-DEC-01 | **PASS** |
| B3 | `GET /decisions/:id` | ✅ Chi tiết scope | ✅ assertResourceInHrmScope parity | FR-27 #8/#9 | **PASS** |
| B4/B5 | PATCH/DELETE | ✅ Mutate in scope | ✅ same resolver | FR-27 Kết quả | **PASS** (brief) |
| C1 | `POST …/change-requests` | ✅ Gửi YC metadata | ✅ slug→UUID · pending · no apply | FR-HRM-MD-01 #1–#8 | **PASS** |
| C2 | `GET …/change-requests` | ✅ Queue / status | ✅ list scope | MD-01 #7 · MD-02 | **PASS** |
| C3/C4 | approve / reject | ✅ Duyệt/từ chối | ✅ scope + values on approve | MD-03/04 · UC-26 | **PASS** (brief) |
| D1 | `POST …/auth/mobile/login` | ✅ Phiên mobile | ✅ JWT no session table | FR-HRM-MOB-01 #2–#8 | **PASS** |
| D2 | `POST …/select-membership` | ✅ Chọn ĐV | ✅ re-issue Plane B claims | MOB-01 #5 | **PASS** |
| D3 | `POST …/refresh` | ✅ Làm mới phiên | ✅ refresh JWT | MOB-01 #6 · MOB TS §5.2 | **PASS** |
| D′ | MOB-04/06/08 | ✅ Cross-cite | ✅ shared ATT/Leave | MOB FR + ATT/Leave pairs | **PASS** (cite) |

---

## 3. must_keep (verified not rewritten)

| Pair | Path |
|------|------|
| XBOS Auth/Tenant | `docs/xbos/DB_DESIGN_XBOS_AUTH_TENANT.md` · API |
| XBOS KPI | `docs/xbos/DB_DESIGN_XBOS_KPI.md` · API |
| XBOS RACI/RBAC | `docs/xbos/DB_DESIGN_XBOS_RACI_RBAC.md` · API |
| XBOS WF | `docs/xbos/DB_DESIGN_XBOS_WORKFLOW.md` · API |
| XBOS catalog-gov | `docs/xbos/DB_DESIGN_XBOS_CATALOG_GOV.md` · API |
| HRM Payroll | `docs/hrm/DB_DESIGN_HRM_PAYROLL.md` · API |
| HRM CO-HC | `docs/hrm/DB_DESIGN_HRM_CO_HC.md` · summary API |
| HRM Employees / Leave / ATT / Settings / Recruitment / CI | prior U71 pairs — untouched |

---

## 4. Architecture facts (evidence-based)

| Fact | Source |
|------|--------|
| `performance_cycles.company_id` TEXT slug | `PerformanceService.ensureSchema` |
| `performance_evaluations.cycle_id` HARD FK | same |
| `hr_decisions.company_id` TEXT + catalog type | `DecisionsService` |
| Metadata `company_id` UUID + API map | `EmployeeMetadataRepository` + `resolveHrmCompanyUuidForSlug` |
| Mobile JWT session (no table) | `TECHSPEC_MOBILE.md` §5.2 · `MobileAuthController` |

---

## 5. Residual

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **G-MD-PLANE-01** | P2 | `dev-be` | Metadata UUID persist vs TEXT spine — optional migrate |
| **G-PF-OVERLAP** | P2 | `dev-be` | PF-01 #5 overlap enforce VERIFY |
| **G-SCOPE-01** | P0 standing | `dev-be`+`qa` | on-touch decisions/metadata |
| **G-MOB-LEFT** | Info | ba/pm | leftover MOB FR non-goal |
| **SA-U71-HRM-OPERATIONS-DESIGN-01** | P2 | `sa` | next backlog OP-01..04 |
| **SA-U71-HRM-FLEET-DESIGN-01** | P2 | `sa` | FL-01 |
| OpenAPI deepen W2 paths | P2 | `dev-be` | when execution opens |

**Non-claims:** Phase 1 DONE · PROD-READY · UF 🟢 bulk · seed for evidence.

---

## 6. Handoff

### completion_report

**Closed:** U71 P2 HRM W2 batch physical design — one coherent pair `DB_DESIGN_HRM_W2_SLICE` + `API_DESIGN_HRM_W2_SLICE` covering Performance (cycles+evaluations), Decisions (CRUD+scope parity), Metadata (submit/list/decide + UUID plane documented), Mobile auth (login/membership/refresh) with MOB-04/06/08 cross-cite to ATT/Leave; thin pointers; README §2 count **17**; F.1 checklist complete; must_keep pairs preserved; no `apps/**`.

**Residual:** G-MD-PLANE-01 · G-PF-OVERLAP · G-SCOPE-01 on-touch · next SA OP/FL/admin backlog · OpenAPI deepen when Dev opens.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: SA-U71-HRM-OPERATIONS-DESIGN-01
role: sa
lane: governance · U71 P2
read_first:
  - docs/hrm/TECHSPEC.md §16.5 FR-HRM-OP-01..04
  - docs/hrm/DB_DESIGN_HRM_W2_SLICE.md (must_keep sibling — do not wipe)
  - docs/tech-spec/README.md §3 residual OP/FL
  - templates TECHSPEC_PHYSICAL_DB_TABLE + TECHSPEC_API_CONTRACT
deliver:
  - docs/hrm/DB_DESIGN_HRM_OPERATIONS.md (hrm_tasks + reports aggregate cite)
  - docs/hrm/API_DESIGN_HRM_OPERATIONS.md F.1 POST/GET tasks · PATCH status · GET reports/summary
  - thin pointers + README §2 promote
  - evidence docs/qa/evidence/sa-u71-hrm-operations-design-01-YYYYMMDD.md
exit: F.1 complete; G-OP-01/02 documented residual; PASS_TO_PM
cấm: apps/** · wipe W2 slice / payroll / leave / ATT pairs · seed
Parallel optional: SA-U71-HRM-FLEET-DESIGN-01 (FL-01 list only)
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/sa-u71-hrm-w2-slice-design-01-20260727.md`

### pm_dispatch_hint

`SA-U71-HRM-OPERATIONS-DESIGN-01` (+ optional `SA-U71-HRM-FLEET-DESIGN-01`) — next U71 P2 physical writes; do not dispatch Dev Perf/Dec/Meta/Mobile feature without this pair in `read_first`.
