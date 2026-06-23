# Phase 1 — Product excellence orchestration (RBAC + CRUD + unified journeys)

**Owner:** PM  
**Date:** 2026-06-04  
**Trigger:** Sponsor (U28 + U29) — Phase 1 phải chạy đúng **cột lõi RBAC**, mỗi chức năng **CRUD tối thiểu**, tối đa là **màn hình + logic liên kết một thể**.

**Không thay thế:** `PHASE1_COMPLETION_PLAN.md` (245 UC / G1–G9) · `PHASE1_EXCELLENCE_PROGRAM.md` (T1–T6) — document này là **lớp sản phẩm** đặt lên trên gate kỹ thuật.

---

## 1. Cột lõi RBAC (U28 — bắt buộc mọi wave)

| Persona | Account mẫu | Quyền | FAIL nếu |
|---------|-------------|-------|----------|
| **CEO tập đoàn** | `ceo@xe.vn` | Cao nhất — read rollup `company_id=main` / `holding` KPI; **mutate** mọi đơn vị thành viên, catalog tập đoàn, workflow inbox | 409/403 khi PUT/POST hợp lệ trên member unit; empty che 5xx |
| **CEO công ty thành viên** | `du-lich.ceo@xe.vn` | Chỉ `tenant=xe-du-lich` (và công ty con trong membership); **không** rollup tập đoàn | 200 trên API group-only (`holding` rollup, master vendors, seed catalog tập đoàn) |
| **Cấp dưới** | `uat.nv0001@xe.vn`, HRBP mobile | Hẹp hơn JWT `roleCode` + `memberships[]` | Thấy dữ liệu tenant khác |

**SoT kỹ thuật:** `docs/architecture/ADR-HRM-RBAC-SCOPE-LADDER.md` (nếu path khác → `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md`) · `resolveHrmListScope` / `resolveXbosGroupLegal*` parity list = get-by-id.

**QA bắt buộc:** matrix **3 persona** mỗi wave; negative test member CEO trên path tập đoàn = **PASS**.

---

## 2. Ba lớp chất lượng sản phẩm

```text
L1 RBAC & scope     → Ai được làm gì (không lệch token/header)
L2 CRUD tối thiểu   → Create / Read / Update / Delete (hoặc archive) trên entity chính mỗi module
L3 Thể thống nhất   → List → detail → tab liên quan → quay lại; FK/scope nhất quán; không màn orphan
```

| Lớp | PASS khi | Owner chính |
|-----|----------|-------------|
| **L1** | Persona matrix xanh; không 409 oan cho group CEO | Dev-BE scope + Dev-FE headers |
| **L2** | Mỗi module dưới có ≥1 entity CRUD proven (API + UI hoặc API+probe) | Dev-BE + Dev-FE |
| **L3** | Mọi **J-*** trong `PROGRAM_JOURNEY_MAP.md` L2.5 PASS (browser hoặc API+QC audit) | QA + Dev-FE embed |

**Sponsor line:** L2 alone ≠ đẳng cấp; L3 + L1 mới đạt «sản phẩm một thể».

---

## 3. Bản đồ module Phase 1 — CRUD tối thiểu & luồng thống nhất

### 3.1 Command Center / XBOS

| Module | Entity chính | CRUD tối thiểu (group CEO) | J-/P-CC | Trạng thái gần nhất |
|--------|--------------|----------------------------|---------|-------------------|
| Auth / session | JWT | Login, TTL 86400 | P-CC-01 | PASS nip.io |
| Đơn vị thành viên | Legal entity | **R** list, **U** save (PUT), **C** thêm đơn vị | P-CC-02, **J-CC-02** | Save PASS @ 68ec457; GET detail/shareholders có thể 409 — **P0 scope** |
| KPI / dashboard | Rollup KPI | **R** rollup `holding` | J-CC-03 | PASS API probe |
| Catalog governance | Inbox task | **R** inbox, **U** approve | P-CC-09 | PASS S2 |
| Workflow | Task | **R** list, **R** detail | J-XBOS-01 | Partial |
| Master / settings | Catalogs, dept | **R** + **U** where SRS | P-CC settings | Một số 409/empty đã từng FAIL — retest |

### 3.2 HRM embed (portal + iframe)

| Module | Entity | CRUD tối thiểu | J- | Ghi chú |
|--------|--------|-----------------|-----|---------|
| Nhân sự | Employee | **R** list, **R** detail, **U** profile fields | J-HRM-02 | Scope parity list↔detail |
| Hợp đồng | Contract | **R** list, **R** detail/drawer | J-HRM-01, 03 | Cross-nav → NV |
| Bảo hiểm | Insurance row | **R** + link NV | J-HRM-04 | |
| Tuyển dụng | Requisition | **R** list, **R** detail | J-HRM-05 | Deep create có thể gated — BA ghi AC |
| Chấm công | Attendance | **R** records | J-HRM-06 | |
| Lương | Payslip | **R** list, **R** detail | J-HRM-07 | |

**Member CEO:** cùng module nhưng CRUD chỉ trong `tenant` member; counts > 0 sau seed satellite (G5).

### 3.3 Mobile HRM

| Module | CRUD | J- | Trạng thái |
|--------|------|-----|------------|
| Chấm công / leave / payslip / approve | **R** + write where UC | J-MOB-03..05 | **FAIL** device — C-W12QC-01 |

### 3.4 Data / catalog (G5)

| Hạng mục | CRUD SoT | Owner |
|----------|----------|-------|
| 183 danh mục | Publish trên XBOS → pull HRM | Dev-BE + DevOps seed |
| 1000+ NV fidelity | Menu density, FK | `verify:hrm:menu-density` |

---

## 4. Phân tích khoảng trống (PM — 2026-06-04)

| Gap | Ảnh hưởng sponsor | Wave |
|-----|-------------------|------|
| Group CEO bị 409 khi đọc/sửa member legal entity (list≠GET) | «Quyền cao nhất mà không sửa được» | **W1-BE** scope parity |
| Member CEO chưa có CRUD slice đầy đủ + seed | «CEO công ty không chạy được nghiệp vụ» | **W1-BE/DO seed** + **W2-QA** persona |
| Chỉ probe API, chưa browser iframe | L3 chưa đạt | **W2-QA** L2.5 browser |
| Mobile J-MOB-03..05 FAIL | C-W12QC-01 | **W3-MOB** |
| G4 DM-LOG 22, G5 183 | Catalog/logistic chưa một thể | **W4-DATA** |
| Production domain | T6 | DevOps |

---

## 5. Điều phối team — wave (execution lane trước)

### Wave A — Baseline & acceptance (song song, governance hẹp)

| work_item_id | Role | Deliverable |
|--------------|------|-------------|
| **P1-PHASE1-QA-FULL-RBAC-01** | QA | L0–L2.5 + persona; `p1-phase1-qa-full-rbac-20260604.md` |
| **P1-PHASE1-BA-CRUD-MATRIX-01** | BA-Process | `PHASE1_CRUD_ACCEPTANCE_MATRIX.md` — từng module: C/R/U/D + persona + AC |
| **P1-PHASE1-SA-SCOPE-PARITY-01** | SA | Checklist GET-by-id = list scope; delta ADR nếu lệch |

### Wave B — Sửa P0 (execution, tối đa 3 Task song song)

| work_item_id | Role | Phạm vi |
|--------------|------|---------|
| **P1-PHASE1-BE-SCOPE-CRUD-01** | Dev-BE | Scope parity HRM + XBOS org-foundation; member GET; KPI; jest |
| **P1-PHASE1-FE-UNIFIED-01** | Dev-FE | Header merge; embed scope; CRUD forms CC+HRM; vitest |
| **P1-PHASE1-DO-SEED-01** | DevOps | Seed member satellite + menu density; VPS align HEAD |

### Wave C — Chốt chất lượng

| work_item_id | Role | Exit |
|--------------|------|------|
| **P1-PHASE1-QA-CRUD-JOURNEY-01** | QA | CRUD matrix + J-* browser nip.io + local |
| **P1-PHASE1-QC-FULL-RBAC-01** | QC | GO/GWC vs L1–L3; không claim PROD DONE |
| **P1-PHASE1-TM-GATE-01** | TM | Scope parity sign-off + NFR |

### Wave D — Governance cập nhật Cursor

PM + BA + SA: retro → rule/KB nếu lesson lặp (scope parity, persona mandatory).

---

## 6. Tiêu chí «đẳng cấp» (sponsor đọc)

1. **Đúng quyền:** CEO tập đoàn sửa được những gì bạn mô tả; CEO member không «thấy» tập đoàn.
2. **Đúng nghiệp vụ:** Mỗi menu chính không chỉ load — có CRUD hoặc lý do disabled có copy.
3. **Đúng trải nghiệm:** Đi từ danh sách → chi tiết → màn liên quan không gãy scope / 404 / ngày 1970.
4. **Đúng bằng chứng:** Một evidence chain QA → QC → bus; không «xong» chỉ HTTP 200.

**Không claim:** Phase 1 DONE 245/245 sponsor · Production `portal.xe.vn` — cho đến khi `PHASE1_MASTER_TODO` + QC strict xanh.

---

## 7. Evidence index (wave này)

| Artifact | Path |
|----------|------|
| QA full RBAC | `docs/qa/evidence/p1-phase1-qa-full-rbac-20260604.md` |
| QC full RBAC | `docs/qa/evidence/p1-phase1-qc-full-rbac-20260604.md` |
| BA CRUD matrix | `docs/program/PHASE1_CRUD_ACCEPTANCE_MATRIX.md` |
| SA scope audit | `docs/architecture/PHASE1_SCOPE_PARITY_AUDIT.md` |
| Bus | `.cursor/team/AGENT_MESSAGE_BUS.md` |
