# ADR: HRM 4-Pillar Architecture & API Gateway Boundary

| Field | Value |
|-------|--------|
| **ADR-ID** | ADR-HRM-4-PILLAR-API-BOUNDARY |
| **work_item_id** | `PO-HRM-BP-ARCH-API-BOUNDARY-01` |
| **Status** | Proposed (governance — HOLD implement until SRS confirm) |
| **Date** | 2026-08-04 |
| **Decision owner** | SA |
| **Source** | `docs/program/customer-blueprint/HRM_System_Architectural_Blueprint.pptx` slides **3, 10, 11, 14** · media `C:\xevn-tmp\hrm-blueprint-media\image{3,10,11,14}.png` |
| **Companion** | [`API_BOUNDARY_MAP.md`](./API_BOUNDARY_MAP.md) · [`TECHSPEC_OUTLINE_HRM_ENTERPRISE.md`](./TECHSPEC_OUTLINE_HRM_ENTERPRISE.md) |
| **Preserve** | Không rewrite Phase 1 ADRs scope (`ADR-GROUP-CEO-MAIN-HOLDING-SCOPE`, `ADR-HRM-RBAC-SCOPE-LADDER`) — ADR này **bổ sung** ranh giới module nghiệp vụ |
| **Evidence** | `docs/qa/evidence/po-hrm-bp-arch-api-boundary-01.md` · APPEND `docs/qa/evidence/po-hrm-bp-adr-q-pay-formula-01.md` (§10–§11) |

---

## 1. Decision Context

- **Decision title:** Khóa kiến trúc 4 trụ HRM + ranh giới gọi API / sự kiện giữa REC · CORE · ATT · PAY.
- **Requestor:** PM (`PO-HRM-BP-PROGRAM-01` intake).
- **Related requirements (PPT):**
  - Slide 3 — mỗi khối phát triển / kiểm thử / vận hành **độc lập**; liên kết qua API.
  - Slide 10 — **[Bảng Công chốt]** là SoT **độc nhất** cho tính lương; PAY **không** gọi API OT / Phép trực tiếp.
  - Slide 11 — Dev **không hardcode** công thức; xây Engine để HR lắp biến số; PAY đọc bảng công chốt + lương cơ sở / phụ cấp / giảm trừ từ CORE.
  - Slide 14 — Gateway: **Tuyển dụng không giao tiếp trực tiếp với Lương**; duyệt 100% logic trên giấy trước code tiếp.

**Clarification vs slide 3 visual:** mũi tên cong REC→PAY trên diagram khái niệm **không** phải contract API. Slide 14 **cấm** gọi đồng bộ REC→PAY. Luồng nghiệp vụ «ứng viên → lương» chỉ đi qua **CORE** (và sau đó ATT→PAY khi đã có bảng công).

---

## 2. Problem to Solve

### Current state (as-built monorepo — ngữ cảnh, không rewrite)

- `hrm-api` là Nest modular monolith: recruitment / employees / attendance / payroll cùng process.
- Hire path đã neo soft-link REC→CORE (`hire-employee-link`, FR-HRM-INT-01) — đúng hướng CORE là cổng nhân sự.
- Attendance sheets / leave / OT cùng module ATT; payroll consumer chưa bị khóa cứng «chỉ đọc sheet `closed`».
- Formula / allowance logic còn rủi ro hardcode theo tenant nếu không có engine metadata.

### Constraints

- Blueprint program: **Stop Coding, Start Architecting** — chưa Dev `apps/**` cho wave này.
- Multi-tenant scope ladder Phase 1 **giữ nguyên** (JWT `main` / slug member / soft-delete).
- XBOS = SoT catalog khung tập đoàn; HRM trụ không trở thành SoT catalog nhóm.
- U65: nghiệm thu FE; không seed để «giả» chốt công / payroll.

### Failure impact if unresolved

- PAY đọc OT/leave live → lương sai khi đơn chưa duyệt / kỳ chưa chốt.
- REC ghi thẳng payroll / payslip → bỏ qua hợp đồng & kích hoạt hồ sơ → lỗ hổng tuân thủ.
- Hardcode công thức → mỗi CT một fork code; không scale 5+ pháp nhân XeVN.

---

## 3. Options

### Option A — Modular monolith + biên giới module + Gateway policy (khuyến nghị)

- **Description:** Giữ một deployable `hrm-api` (và portal embed). Bốn trụ = **bounded contexts** (Nest modules + package/folder ownership). Cross-pillar **đồng bộ chỉ qua facade/API nội bộ đã liệt kê**; còn lại **domain events** (in-process bus → sau có thể outbox). API Gateway / BFF (portal proxy) enforce **forbidden route pairs** ở lớp edge (deny list) + lint/CI grep chống import chéo.
- **Benefits:** Khớp as-built; chi phí thấp; độc lập *phát triển/test* qua contract; dễ rollout dần.
- **Costs:** Cần discipline (module boundary tests, CODEOWNERS); event bus nội bộ phải có schema version.
- **Risks:** «Fake microservice» nếu team vẫn `import` service PAY từ REC — mitig bằng CI boundary + ADR map.

### Option B — Microservice 4 deployables + async-only cross-pillar

- **Description:** Tách REC/CORE/ATT/PAY thành 4 service + message broker; Gateway chỉ route; không sync call cross-pillar.
- **Benefits:** Isolation vận hành mạnh; scale độc lập.
- **Costs:** Ops/NFR lớn (auth, saga, dual-write, observability); vượt GĐ blueprint hiện tại.
- **Risks:** Over-engineering; chậm SRS→code; phá timeline Phase 1 UAT.

### Option C — Shared DB + FE/BFF orchestration (anti-pattern cho enterprise)

- **Description:** FE hoặc BFF join bảng OT/leave/candidates rồi POST payroll; DB foreign keys tự do giữa trụ.
- **Benefits:** Nhanh demo.
- **Costs/Risks:** Vi phạm slide 10/14; không test độc lập; lương phụ thuộc uptime OT/leave; **reject**.

---

## 4. Trade-off Matrix

| Criteria | Weight | Option A | Option B | Option C |
|----------|-------:|:--------:|:--------:|:--------:|
| Business value (đúng PPT) | 25 | 5 | 5 | 1 |
| Time to deliver (docs→SRS→impl) | 20 | 5 | 2 | 4 |
| Complexity / ops | 15 | 4 | 1 | 3 |
| Security / blast radius | 15 | 4 | 5 | 1 |
| Reliability (PAY vs ATT down) | 15 | 4 | 5 | 1 |
| Maintainability (formula / WBS) | 10 | 5 | 4 | 1 |
| **Weighted (max 5)** | | **~4.6** | **~3.5** | **~1.8** |

---

## 5. Decision (Recommended: **Option A**)

### Selected

**Option A — Modular monolith với 4 bounded contexts + API Gateway deny-list + domain events cho handoff bất đồng bộ.**

### Why

1. Khớp mandate slide 14 (ranh giới rõ) mà không đòi rewrite deploy model Phase 1.
2. Slide 10/11 enforce được bằng **contract đọc** (`timesheet.closed` snapshot) + **formula engine metadata** — không cần tách process ngay.
3. REC↛PAY và PAY↛OT/Leave là **invariant kiểm thử được** (matrix + unit boundary).

### Assumptions

- Program file `PO_HRM_ENTERPRISE_BLUEPRINT_PROGRAM.md` sẽ được PM/ba-docs bổ sung; ADR neo PPT + media path đã có.
- «API Gateway» GĐ1 = portal Vite proxy + Nest global guards + (sau) edge deny rules — chưa bắt buộc Kong/Apigee.
- Formula engine UI kéo-thả = **GĐ2 product surface**; GĐ1 khóa **engine runtime + variable catalog** (không hardcode hệ số OT/thuế trong service PAY).

### Rejected

- **B:** trì hoãn đến khi 4 trụ có DB/API design ổn định và NFR tách service được sponsor approve.
- **C:** vi phạm blueprint; QC phải NO-GO nếu phát hiện.

---

## 6. Architecture invariants (locked)

```text
                    ┌─────────────────────────────────────┐
                    │     API Gateway / Portal BFF         │
                    │  deny: REC↔PAY sync · PAY→OT/Leave   │
                    └───────────────┬─────────────────────┘
                                    │
         ┌──────────┬───────────────┼───────────────┬──────────┐
         ▼          ▼               ▼               ▼
      [ REC ]    [ CORE ]        [ ATT ]         [ PAY ]
    Tuyển dụng  Hồ sơ HR      Chấm công      Tiền lương
         │          ▲               │               ▲
         │ hire /   │               │ timesheet     │ read-only
         │ offer.*  │ employee.*    │ .closed       │ closed sheet
         └─────────►┘               └───────────────┘
              (no REC ──────────X──────────► PAY)
```

| ID | Invariant | PPT |
|----|-----------|-----|
| **I-1** | 4 trụ độc lập: develop / test / (logical) run; không shared write table xuyên trụ trừ qua contract publish | 3, 14 |
| **I-2** | **REC ↛ PAY** sync (HTTP/service call/import). Handoff chỉ REC→CORE | 14 |
| **I-3** | **PAY chỉ đọc bảng công trạng thái chốt** (`closed` / tương đương). Cấm PAY→Leave API, PAY→OT API | 10 |
| **I-4** | PAY đọc hồ sơ cần thiết từ **CORE** (lương CB, phụ cấp CFG, giảm trừ gia cảnh) — không đọc candidates | 11 |
| **I-5** | Payroll **formula engine** = metadata + evaluator; **cấm** hardcode công thức tenant trong code path tính lương | 11 |
| **I-6** | ATT tổng hợp OT (đã hệ số) + phép có/không lương + công chuẩn **trước** khi emit `timesheet.closed` | 10 |
| **I-7** | Scope parity list↔get↔mutate giữ ADR Phase 1; mỗi trụ dùng cùng resolver trong module | U19 |

### Pillar ownership (WBS align — slide 14 Task 1)

| Pillar | Code | Owns (logical) | Does **not** own |
|--------|------|----------------|------------------|
| Tuyển dụng | **REC** | Định biên, chiến dịch, nguồn UV, đánh giá, offer, pipeline | Employee master, payroll lines |
| Hồ sơ HR | **CORE** | PII, HĐLĐ, tài sản NV, bảo mật hồ sơ, kích hoạt/chấm dứt | Raw punch, payslip calc |
| Chấm công | **ATT** | Ca, lễ, phép, OT, records, **bảng công + chốt** | PIT/BHXH formula |
| Tiền lương | **PAY** | Công thức engine, phụ cấp/khấu trừ CFG, thuế/BHXH apply, kỳ lương | Leave approve, hire stage |

---

## 7. Failure Modes and Mitigation

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| PAY gọi leave/OT để «tính lại» công | Code review / CI import deny `payroll→leave-requests\|overtime` | Chỉ `GET` closed timesheet snapshot; QA TC-PAY-ATT-CLOSED-* |
| REC tạo payslip / salary line khi hired | Gateway deny + service boundary test | Event `offer.accepted` → CORE activate → (sau) ATT enroll; PAY chỉ khi có kỳ + sheet |
| Tính lương trên sheet `draft`/`open` | BE reject `HRM-PAY-ATT-412` (proposed) | State machine ATT: open→submitted→closed; PAY precondition |
| Hardcode hệ số 150%/200% trong PAY | Grep / formula unit golden | Hệ số OT **đã nướng trong ATT** trước chốt; PAY chỉ biến `paid_hours`, `ot_hours_weighted` |
| ATT down lúc chạy lương | PAY đọc snapshot đã persist | Closed sheet = immutable document; không live join |
| Dual-write employee từ REC và CORE | Hire-link already soft FK | CORE owns `employees`; REC chỉ set `employee_id` / emit event |
| Slide 3 hiểu nhầm REC→PAY được phép | ADR + boundary map + BA UC | Training: mũi tên = luồng nghiệp vụ qua CORE, không API |

---

## 8. Implementation and Validation Plan (HOLD code)

### Rollout (governance → execution sau SRS confirm)

1. **Now (this ADR):** boundary map + TechSpec outline HOLD.
2. **ba-docs / ba-process:** SRS FR theo 4 trụ; UC chéo (phép×lễ, payroll mượt) — slide 14 Task 2.
3. **ba-data:** ownership bảng / event payload (cùng program `PO-HRM-BP-DATA-OWNERSHIP-01`).
4. **SA depth:** sau SRS confirm → TechSpec full + API_DESIGN F.1 per cross-pillar call.
5. **Dev-BE (later):** Nest module fences + event names + PAY precondition closed sheet; **không** bắt đầu trước unlock.

### Rollback

- ADR status → Superseded; không đụng `apps/**` trong wave này nên rollback = docs only.

### Validation checkpoints

| Gate | Evidence |
|------|----------|
| Docs | ADR + `API_BOUNDARY_MAP.md` reviewed PM/SA |
| SRS | Mỗi FR pillar ghi `allowed_consumers` / `forbidden_calls` |
| QA (later) | Matrix: attempt PAY←REC sync = **blocked**; PAY on open sheet = **4xx**; formula from CFG not const |
| QC | GO blueprint chỉ khi I-1…I-5 có AC đo được |

### Success criteria

- [x] Option A/B/C + recommend ghi ADR
- [x] Forbidden REC→PAY và PAY→OT/Leave khóa
- [x] Events gợi ý: `offer.accepted`, `employee.activated`, `timesheet.closed`, `termination.started`
- [ ] SRS confirm sponsor (ba-docs) — **open**
- [ ] TechSpec DB/API depth — **HOLD**

---

## 9. Non-goals

- Không đổi JWT scope / `main`↔`holding` (Phase 1 ADR).
- Không tách microservice GĐ1.
- Không thiết kế chi tiết UI kéo-thả formula (GĐ2); chỉ khóa triết lý engine.
- Không claim Phase 1 / Attendance CLOSED / Payroll DONE từ ADR này.

---

## 10. Decision **Q-PAY-FORMULA** (APPEND — `PO-HRM-BP-ADR-Q-PAY-FORMULA-01`)

| Field | Value |
|-------|--------|
| **Decision-ID** | Q-PAY-FORMULA |
| **Status** | **ANSWERED / LOCKED Option A** — sponsor FILL+REMAINING (`DECISION_PACKET_Q_PAY_FORMULA.md` · R-PAY-DD-01 Form GĐ1 + DnD GĐ2 · Q-PAY-F-3 closed sheet). Residual = **product fidelity** (TechSpec/DB/API/Dev/QA) — **cấm** re-workshop. |
| **Date** | 2026-08-04 · status APPEND **2026-08-07** (`PO-HRM-PAYROLL-FORMULA-RUN-GAP-SA-01`) |
| **work_item_id** | `PO-HRM-BP-ADR-Q-PAY-FORMULA-01` · unlock path `PO-HRM-PAYROLL-FORMULA-RUN-GAP-SA-01` |
| **Partner** | `REQ_L_002` — *«công thức do kỹ thuật thiết lập trên DB»* |
| **PPT** | Slide 11 — HR lắp biến số / engine; Dev **không hardcode** |
| **UC / BR** | UC-BP-PAY-02 · BR-BP-PAY-01 · invariant **I-5** |
| **Evidence** | `docs/qa/evidence/po-hrm-bp-adr-q-pay-formula-01.md` · unlock `docs/qa/evidence/po-hrm-payroll-formula-run-gap-sa-01.md` |

### 10.1 Conflict (facts)

| Plane | Claim | Risk nếu chọn một phía |
|-------|-------|-------------------------|
| Partner Excel `REQ_L_002` | IT/Dev thiết lập công thức trên DB | HR không tự vận hành; dễ thành «script/SQL mỗi kỳ» nếu thiếu quy trình publish |
| PPT slide 11 | Formula engine; HR kéo-thả / lắp biến; cấm hardcode | UI designer sớm → scope GĐ2; hoặc FE tự tính → phá I-3/I-5 |

**Không** giải bằng «chỉ Excel» hoặc «chỉ PPT». Cả hai cùng hướng **cấu hình**, khác **ai soạn / ai publish / surface UI**.

### 10.2 Options

#### Option A — Dual-control metadata engine (khuyến nghị)

- **Description:** Runtime PAY chỉ **evaluate** định nghĩa công thức **versioned** (metadata DB/CFG), không nhúng hệ số/tenant formula trong code path tính kỳ lương. **C&B (hoặc Payroll Admin)** soạn bản nháp; **Technical Publisher** (IT/DevOps role hoặc C&B+IT dual-sign) **publish** → bản `active` theo legal entity + effective date. GĐ1: CFG API + evaluator + audit. GĐ2: UI kéo-thả (PPT) trên cùng metadata — không đổi runtime.
- **Benefits:** Hòa Excel (IT vẫn kiểm soát publish/DB) + PPT (engine, không hardcode); audit/rollback version; multi-entity scale.
- **Costs:** Model version + quyền soạn/publish; golden tests biến số.
- **Risks:** Publish sai → lương sai hàng loạt — mitig bằng dry-run preview + dual-control + immutable version sau khi kỳ đã chạy.

#### Option B — IT-only DB scripts / SQL views (bám chữ Excel hẹp)

- **Description:** Mỗi CT/kỳ: IT sửa SQL/view hoặc patch DB; không có authoring HR.
- **Benefits:** Nhanh pilot 1 pháp nhân.
- **Costs/Risks:** Fork theo CT; không AC «không hardcode kỳ»; vi phạm I-5 tinh thần PPT; **reject** làm SoT dài hạn.

#### Option C — HR UI kéo-thả GĐ1 + publish tức thì không dual-control

- **Description:** Ship designer sớm; HR publish một mình.
- **Benefits:** Khớp visual PPT sớm.
- **Costs/Risks:** Blast radius cao; thiếu gate kỹ thuật Excel đòi; UI GĐ2 đội lên critical path — **reject** GĐ1.

### 10.3 Trade-off (rút gọn)

| Criteria | A | B | C |
|----------|:-:|:-:|:-:|
| Khớp REQ_L_002 (IT kiểm soát kỹ thuật) | 5 | 5 | 2 |
| Khớp PPT / I-5 (engine, no hardcode) | 5 | 1 | 4 |
| An toàn vận hành đa CT | 5 | 2 | 2 |
| Time-to-GĐ1 (không UI designer) | 4 | 5 | 1 |
| **Recommend** | **✓** | | |

### 10.4 Decision (Recommended: **Option A**)

**Selected:** Dual-control — **C&B author** + **technical publish**; runtime = **metadata formula engine**; **cấm hardcode công thức / hệ số tenant trong code path tính kỳ lương**.

**Reconcile Excel ↔ PPT:**

| Concern | Resolution |
|---------|------------|
| «IT thiết lập trên DB» | IT/Technical Publisher sở hữu **publish** + schema/seed ban đầu + review kỹ thuật; dữ liệu nằm DB/CFG (đúng Excel) |
| «HR kéo-thả» | HR/C&B sở hữu **soạn** biến & công thức trên engine; **UI kéo-thả = GĐ2** cùng contract metadata (PPT surface), không bắt buộc GĐ1 |
| Hardcode kỳ lương | **Forbidden** — mọi thay đổi = version mới + publish; PAY run chỉ đọc `formula_definition` active tại cutoff kỳ |

**Assumptions (product fidelity — Option A already ANSWERED):**

- Vai trò «Technical Publisher» map RBAC Phase 1 (membership + permission) — chi tiết SRS FR / API F.1 depth.
- Biến số chuẩn tối thiểu từ ATT closed sheet + CORE compensation (I-3/I-4) — ba-data ownership / DATA unlock wave.
- OT hệ số đã nướng trong ATT trước `timesheet.closed` (I-6); PAY không tái hardcode 150%/200%.
- **R-PAY-DD-01:** GĐ1 = **form** author; GĐ2 = kéo-thả; cùng `expression_json` — **cấm invent GĐ1 DnD**.

**Rejected:** B (không scale / lệch I-5); C (GĐ1 blast + thiếu dual-control). **Do not reopen.**

### 10.5 Failure modes & mitigation

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| Dev nhúng `%` / biểu thức trong service PAY | CI grep / code review; unit golden «no tenant const» | Mọi hệ số từ definition version hoặc biến ATT đã chốt |
| C&B sửa draft → kỳ đang chạy dùng nhầm | Run bind `formula_version_id` tại mở/chốt kỳ | Immutable bind; draft không ảnh hưởng kỳ đã bind |
| Publish không dual-control | AuthZ: author ≠ publish permission | Deny self-publish nếu policy dual; audit trail |
| FE tự tính Net rồi POST | Boundary + QA | FE chỉ preview qua API evaluate; SoT Net = PAY BE |
| IT «hotfix» SQL thẳng prod giữa kỳ | Ops policy + immutability | Correction = adjustment doc / kỳ sau; không silent rewrite definition đã bind |
| UI GĐ2 làm lệch metadata GĐ1 | Contract test biến số | Designer chỉ CRUD cùng schema evaluator |
| Open / draft timesheet vars on process | `HRM-PAY-ATT-412` | Q-PAY-F-3 · I-3 — closed sheet only |
| REC→PAY sync hire→payslip | Gateway deny · I-2 | Hire→CORE→ATT closed→PAY only |

### 10.6 Validation (HOLD code — product fidelity unlock)

| Gate | Evidence / AC sketch |
|------|----------------------|
| Docs | ADR §10 Option A **ANSWERED** + unlock checklist `po-hrm-payroll-formula-run-gap-sa-01.md` |
| TechSpec/DB/API | Lift `F-PAY-FORMULA-*` HOLD only after expression schema + F.1 AUTHOR/PUBLISH/EVAL + open component catalog |
| SRS | FR PAY-02/06 author / publish / evaluate / version bind — GĐ1 form not DnD |
| QA (later) | U65: hardcode path absent; draft≠active; dual-control deny; evaluate dùng closed sheet only; **no FE net** |
| QC | Không GO PAY formula nếu còn const tenant; `payroll_e2e_ready` stays false until explicit QC |

**Non-claim:** Paper Option A is **ANSWERED**. This ADR does **not** claim LIVE formula engine, `payroll_e2e_ready=true`, or Dev unlock without DATA+API CONFIRMED.

### 10.7 DOC-DELTA APPEND — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-SA-01` (2026-08-07)

- Status header §10 → **ANSWERED / LOCKED Option A** (cite decision packet; R-PAY-DD-01; Q-PAY-F-3).
- Residual renamed: partner workshop **closed** → **product fidelity** path (DATA → API → BE ensureSchema+eval → FE form → QA U65).
- Platform PAY vertical: cite `ADR-HRM-DYNAMIC-CONFIG-PLATFORM` Option B (`salary_components` / `pay_types` open catalog) — **no** Option rewrite.
- **Cấm:** replace Option A; invent GĐ1 DnD; re-ask Q-PAY-FORMULA workshop.

---

## 11. Decision **Q-ASSET-MODULE** (outline — boundary only)

| Field | Value |
|-------|--------|
| **Decision-ID** | Q-ASSET-MODULE |
| **Status** | **SA Recommended (phase stub)** — chờ confirm phạm vi Asset SoT |
| **Partner** | `HR-006` — tham chiếu module Tài sản (mã, serial, BB, thu hồi nghỉ) |
| **UC / BR** | UC-BP-CORE-05/06 · BR-BP-AST-01/02 |

| Phase | Scope | Boundary |
|-------|-------|----------|
| **GĐ1 / Phase stub** | CORE giữ **assignment stub**: `asset_ref` (mã/serial), trạng thái Đang dùng / Cần thu hồi, BB bàn giao (metadata + chữ ký theo capability sẵn có); emit checklist khi `termination.started` | **Không** trở thành SoT kho/CCDC toàn tập đoàn; không thay XBOS/Asset module nếu có sau |
| **Full Asset SoT (sau)** | Module Tài sản (hoặc XBOS asset) = master mã/serial/lifecycle; CORE chỉ consume ref + trạng thái gán NV | Handoff qua API/event — không dual-write master |

**Invariant:** Thu hồi khi nghỉ (BR-BP-AST-02) bắt buộc trên stub **hoặc** full SoT — không được bỏ checklist chỉ vì Asset chưa full.
