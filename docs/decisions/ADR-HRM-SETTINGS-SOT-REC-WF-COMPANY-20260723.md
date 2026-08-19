# ADR: HRM Settings SoT + REC-WF company binding + resolver scope (governance)

| Field | Value |
|-------|--------|
| **ADR-ID** | ADR-HRM-SETTINGS-SOT-REC-WF-COMPANY-20260723 |
| **work_item_id** | `SA-HRM-SETTINGS-REC-WF-01` |
| **Program** | `HRM_SRS_ORPHAN_SETTINGS_RECWF_PROGRAM` |
| **Status** | **Accepted** (governance lock — **không** claim product DONE) |
| **Date** | 2026-07-23 |
| **Decision owner** | SA |
| **change_mode** | **ADD** — không REPLACE F4 leave ADR · không REPLACE REC-WF bridge ADR |
| **Related** | `ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620.md` (pilot = **leave**) · `ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md` · delta F4/F6 · `DANH_MUC_XBOS_CHO_HRM.md` §1 |
| **Evidence** | `docs/qa/evidence/sa-hrm-settings-rec-wf-01-20260723.md` |
| **TechSpec pointer** | `docs/hrm/TECHSPEC.md` §18 (ADD) |

---

## 1. Decision context

Sponsor hỏi (2026-07-23):

1. Tạo **quy trình tuyển dụng** HRM đã **ăn theo quy trình theo từng công ty** chưa?
2. Linh hoạt kiểu benchmark Luxury/Bay.vn (resolver: chức danh, cấp trên, song song) — **đã cho team sửa chưa** hay còn gap?
3. Settings master-data: SoT **XBOS** vs **HRM Settings CRUD** (architecture only).
4. Tham chiếu luồng khách trong delta demo + ADR.

**Cấm wave này:** sửa `apps/**` · seed · deploy · claim Phase1/PROD.

---

## 2. Problem to solve

| Area | As-is (code/docs truth) | Failure if unclear |
|------|-------------------------|--------------------|
| REC-WF company | Spawn + `applyingEntityId` tồn tại; lookup def = `tenant_id` + `workflow_code` (không 1 row / `company_id`) | Sponsor hiểu nhầm «đã per company» = DONE |
| Resolver linh hoạt | Registry F4 **có**; pilot AC live = leave `direct_manager`; REC soft-fallback `GROUP_APPROVER` khi resolve fail | Claim Bay.vn parity giả |
| Settings | XBOS master + HRM pull/extension; thiếu FR Settings CRUD + filter/search picker | Dev hardcode free-text / seed catalog |

---

## 3. Options — REC-WF binding per company

### Option A — Single active def / `workflow_code` + `applyingEntityId` filter (as-is)

- **Description:** `findActiveDefinitionByCode(tenantId, code)`; graph.`applyingEntityId` = empty/holding/main → group-wide; member UUID/slug → bound member (Group CEO spawn vẫn được — G-BM-REC-02).
- **Benefits:** Đã ship; J-REC-WF-01/02/03 GWC/PASS slices.
- **Costs / Risks:** Không phải «1 định nghĩa độc lập / công ty»; hai ĐVTV không thể giữ 2 graph khác nhau cùng code mà không version/override phức tạp.

### Option B — **Normative target** — binding matrix `workflow_code` × `company_id` (partition)

- **Description:** Active definition resolve ưu tiên `(tenant_id, workflow_code, company_id|applyingEntity)`; fallback group-wide chỉ khi không có member override. Spawn HRM truyền `company_id` entity → engine chọn def đúng partition.
- **Benefits:** Đúng câu sponsor «theo từng công ty»; giữ Option A bridge spawn.
- **Costs:** Schema/API canvas «Đơn vị áp dụng» + QA matrix member vs holding; OpenAPI delta.

### Option C — Copy định nghĩa khi «Áp dụng ĐVTV» (fan-out clone)

- **Description:** Publish/apply tạo N copies per member (BM Option B fan-out).
- **Benefits:** Ops rõ «mỗi công ty một bản».
- **Risks:** Drift graph; N× maintenance; trùng BR-REC-WF.

### 3.1 Trade-off (REC-WF)

| Criteria | A (as-is) | **B (target)** | C |
|----------|:---------:|:--------------:|:-:|
| Sponsor «per company» | Partial | Full | Full |
| Complexity | Low | Med | High |
| Regression J-REC-WF-* | Lowest | Med (need AC) | High |
| Maintainability | Med | High | Low |

**Decision:** **Keep A as runtime as-is** · **Accept B as To-be normative** (planned execution wave — **không** fake DONE). Option C deferred unless BM apply-members productizes clone.

---

## 4. Options — Dynamic resolver leave → recruitment

### Option R1 — Leave-only pilot (ADR F4 as written)

Consumer SoT = `hrm_leave` / `hrm_leave_approval`. REC dùng engine nhưng **không** claim F4 AC matrix.

### Option R2 — Shared registry, REC **must** same fail-closed as leave (**target**)

REC spawn: không soft-fallback `GROUP_APPROVER` khi `resolver_type` đã cấu hình; escalate theo BR-CD-F4-04; businessType context mở rộng (`hrm_requisition` | plan | candidate).

### Option R3 — Fork REC-only resolver

**Rejected** — vi phạm must_keep F4 path / bridge ADR.

**Decision:** **R1 = as-is documented pilot** · **R2 = planned** (sau F4 C-03 leave position/parallel đóng + SRS promote). Soft-fallback REC hiện tại = **explicit gap**, không phải Bay.vn parity.

**Benchmark map (không copy UI Bay.vn/Luxury):**

| Benchmark capability | XeVN normative | Status 2026-07-23 |
|----------------------|----------------|-------------------|
| Chức danh / position | `resolver_type=position_template` | Engine + canvas soft; **live leave AC-CD-F4-03** còn mở (program C-03) |
| Cấp trên | `direct_manager` | Leave pilot GWC AC-CD-F4-01/02; REC reuse + soft-fallback |
| Song song | `parallel_group` all/any | Jest + canvas soft; **live leave AC-CD-F4-04** còn mở |
| Automation điều kiện tiền/phòng ban | UC-XBOS-13 conditions | Out of F4 pilot (ADR §1.3) |

---

## 5. Decision — Settings master-data SoT

### Layer ownership (normative — ADD)

```text
┌──────────────────────────────────────────────────────────────┐
│ L0 XBOS Catalog SoT (DANH_MUC §1–§6)                         │
│  Thư viện chức danh, loại nghỉ, vị trí chuẩn, STT 37–42 TD  │
│  Mutate master tập đoàn = XBOS FE / catalog governance WF    │
└────────────────────────────┬─────────────────────────────────┘
                             │ pull / sync-from-xbos
                             ▼
┌──────────────────────────────────────────────────────────────┐
│ L1 HRM effective snapshot                                    │
│  synced_catalogs + settings-catalogs overview (FR-HRM-SC-01) │
│  HRM KHÔNG SoT mã master mới ngoài extension policy          │
└────────────────────────────┬─────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
┌─────────────────────────┐   ┌─────────────────────────────────┐
│ L2a HRM extension       │   │ L2b Settings CRUD (sponsor To-be)│
│ overlay / request       │   │ Picker filter/search bind forms  │
│ (as-is API)             │   │ job_titles, leave_types, …       │
│                         │   │ = consume L1 keys — NOT fork SoT │
└─────────────────────────┘   └─────────────────────────────────┘
```

| Option | Description | Verdict |
|--------|-------------|---------|
| **S1** | XBOS SoT + HRM pull/extension only (as-is TechSpec §14.8) | **Keep** for group master |
| **S2** | HRM Settings trở thành SoT độc lập (CRUD đè XBOS) | **Reject** — phá DANH_MUC §1 · J-XBOS-02/08 |
| **S3** | Settings UI = **CRUD UX trên L1/L2a** + filter/search picker; write path = extension hoặc XBOS redirect theo catalog_key scope | **Accept To-be** — BA FR wave; Dev sau sponsor |

**Invariant:** Free-text field làm SoT chức danh / loại nghỉ / vị trí TD = **cấm**. Picker bắt buộc `catalog_key` + filter/search AC (BA-HRM-SETTINGS-MASTER-DATA-01).

---

## 6. Implementation & validation (planned — không Dev trong wave này)

| Wave | Owner | Exit |
|------|-------|------|
| BA promote SRS § Settings CRUD + REC-WF per-company AC | ba-process / ba-docs | FR/BR/AC trong SRS team + khách pointer |
| BA-D field → catalog_key matrix | ba-data | `BA-HRM-SETTINGS-MASTER-DATA-01` |
| TechSpec §18 cite this ADR | sa (this) | Pointer CLOSED |
| Execution (sau sponsor) | dev-be / fe | Option B def resolve + R2 REC fail-closed; U65 J-* |

**Rollback:** N/A docs-only.

---

## 7. Traceability

| Source | Cite |
|--------|------|
| Delta F4 | `CUSTOMER_DEMO_HRM_DELTA_20260620.md` §4 |
| Delta F6 | same §6 (JD/dashboard — **không** = REC-WF per company) |
| F4 ADR | `ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620.md` §1.3 pilot leave |
| REC bridge | `ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md` Option A |
| Apply scope | `workflow-apply-scope.ts` G-BM-REC-02 |
| Program status | `P1-CUSTOMER-DEMO-HRM-FEEDBACK-PROGRAM.md` F4 GWC C-03 · F6 GWC |
| Orphan program | `HRM_SRS_ORPHAN_SETTINGS_RECWF_PROGRAM.md` |

---

## 8. Sign-off

| Role | Status | Date |
|------|--------|------|
| SA | **Accepted** (governance) | 2026-07-23 |
| PM | Intake → BA promote | — |
| Dev | **Blocked** until sponsor opens execution | — |

**Residual (explicit — planned, not DONE):**

1. REC-WF Option B binding per `company_id`.
2. Resolver R2: REC fail-closed + close F4 C-03 leave position/parallel live.
3. Settings S3 FR + filter/search AC in SRS khách.
4. OpenAPI def resolve by applying entity (when B executes).
