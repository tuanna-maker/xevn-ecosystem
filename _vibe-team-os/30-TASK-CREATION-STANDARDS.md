# 30 — Task Creation Standards (Vibe Code System)

> **Scope:** Chuan tao Task cho moi du an trong Vibe Code ecosystem
> **Doc kem:** `29-UIUX-STANDARDS.md` · `25-SOLID-AND-CODING-CONVENTION.md` · `13-BRD-SRS-TECHSPEC-QUALITY.md`
> **Case studies:** `case-studies/{project}/30-TASK-EXT.md` (project-specific paths & patterns)
>
> **Nguyen tac bat di bat dich:**
> - Task da confirm → TUYET DOI KHONG sua noi dung. Chi cap nhat checkbox `[ ]→[x]`
> - Viet day du NGAY KHI tao — khong de "Chi tiet viet khi den luot"
> - Task = source of truth — agent/dev doc task la du de lam

---

## 1. CAU TRUC BAT BUOC MOI GOAL

9 section theo thu tu sau. Thieu bat ky section = task chua hoan chinh, PHAI bo sung truoc khi code.

```
## Gn — [Ten Goal]
> Muc tieu: [1 cau ro rang]
> Phu thuoc: [Gx, Gy] hoac "Khong co"
> Priority: P0 / P1 / P2
> Lane: FE / BE / Mobile / Full-stack
> Project config: [ten file project extension]

### Gn-SRS
### Gn-TechSpec
### Gn-API Contract
### Gn-UIUX Spec
### Gn-Test Plan
### Gn-Code (BE)       ← TACH RIENG
### Gn-Code (FE)       ← TACH RIENG
### Gn-Code (Mobile)   ← TACH RIENG (neu co)
### Gn-Test Report
### Gn-QA/QC
### Gn-Fix Bug
```

---

## 2. TIEU CHUAN TUNG SECTION

### 2.1 — SRS

**Bat buoc co:**
- Use Cases: UC-Gn-01..n — moi UC: ten, actor, main flow (>=4 buoc), alternative flows
- Business Rules: BR-Gn-01..n — ngan gon, testable
- Fail cases: >= 30% tong UC
- Path file SRS: `docs/{project}/{version}/SRS_Gn_{FEATURE}_v{N}.md`

**Vi du (HRM):**
```
- [ ] SRS G0: UC-G0-01 (List), UC-G0-02 (Create), UC-G0-03 (Update), UC-G0-04 (SoftDelete)
  - Path: docs/brand-new-documents-20270801/SRS_G0_PAY_POLICY_GROUPS_v1.md
- [ ] BR-G0-01..12: platform readonly, tenant scope, soft-delete, cascade null
- [ ] Fail cases: code duplicate, reserved code, platform readonly, tenant isolation
```

**Vi du (E-commerce):**
```
- [ ] SRS G3: UC-G3-01 (Browse), UC-G3-02 (Add to Cart), UC-G3-03 (Checkout)
  - Path: docs/ecom/v1/SRS_G3_CHECKOUT_FLOW_v1.md
- [ ] BR-G3-01..8: stock check, coupon validation, payment gateway timeout
```

---

### 2.2 — TechSpec

**Bat buoc co:**
- Schema DB: ten bang + day du cot (id, business fields, audit: created_at, updated_at, deleted_at, tenant_id neu multi-tenant)
- Migration strategy: idempotent
- Module structure BE: theo framework cua du an (NestJS / FastAPI / Rails...)
- Component tree FE: `PageComponent -> SubComponent -> LeafComponent`
- Error codes: `{PROJECT}-{MODULE}-{CODE}` — dinh nghia >= 5 ma loi
- Traceability matrix: UC -> Endpoint -> Service method -> DB table
- Path file TechSpec: `docs/{project}/{version}/TECHSPEC_Gn_{FEATURE}_v{N}.md`

---

### 2.3 — API Contract

**Bat buoc co:**
- Day du endpoints — KHONG thieu endpoint nao can thiet
- Format: `METHOD /api/{version}/{resource} — mo ta (auth role)`

```
- [ ] GET    /api/{v}/{resource}            — list (filter + pagination)
- [ ] GET    /api/{v}/{resource}/check-{f}  — validate unique real-time
- [ ] POST   /api/{v}/{resource}            — create
- [ ] PUT    /api/{v}/{resource}/:id        — full update
- [ ] PATCH  /api/{v}/{resource}/:id        — partial update
- [ ] DELETE /api/{v}/{resource}/:id        — soft-delete
```

---

### 2.4 — UIUX Spec

**Doc truoc:** `29-UIUX-STANDARDS.md` + `case-studies/{project}/29-UIUX-EXT.md`

**Bat buoc co (theo Section A-F cua 29-UIUX-STANDARDS.md):**
- Layout pattern (A.1 rule nao ap dung)
- Tung field input: component type, label, required(*), placeholder, validation rules
- System rows: badge "He thong", disabled Edit/Delete
- Empty state: icon + text + CTA cu the
- Loading: Skeleton (KHONG spinner toan trang)
- Toast messages: text cu the thanh cong / that bai / canh bao
- Confirm dialog: text cu the

**Vi du (HRM — Nhom Chinh sach):**
```
- [ ] Layout: Settings -> Luong -> Nhom Chinh sach | nut [+ Them nhom]
- [ ] Grid cards 3 cot: icon + ten (bold) + "X chinh sach active" + badge
  - System card: badge "He thong", KHONG co Edit/Delete
  - User card: nut [Edit] + [Xoa] khi hover
- [ ] Right Drawer 480px:
  - * Ma nhom: text uppercase auto, unique check debounce 300ms
  - * Ten nhom: text required
  - Icon: picker grid + search
  - Mau nen: 12 preset + hex
  - Footer sticky: [Huy] [Luu] (disabled khi invalid)
- [ ] Confirm xoa: "Xoa nhom [Ten]? X chinh sach se chuyen ve 'Chua phan nhom'."
- [ ] Empty: icon Layers + "Chua co nhom nao — bam + Them nhom"
- [ ] Toast: "Tao nhom thanh cong" | "That bai — Ma da ton tai" | "Xoa thanh cong"
```

---

### 2.5 — Test Plan

**Bat buoc co:**
- Happy path: moi UC chinh >= 1 case
- Fail/Error path: validate, not found, unauthorized, duplicate
- Edge cases: empty list, system rows readonly, concurrent edit
- Format: "[Hanh dong] -> [Ket qua mong doi]"

---

### 2.6 — Code (BE) — TACH RIENG

**Bat buoc co:**
- Migration file: `{migrations-path}/{YYYYMMDD}_{gn}_{feature}.sql`
- DTOs: create, update, query — ro rang tung file
- Service: ten + list methods
- Controller: ten + so endpoints
- Module registration
- Unit tests: coverage >= 80%

**Placeholder paths (dien theo du an):**
```
{be-app}/src/{domain}/{feature}/
  dto/create-{feature}.dto.ts
  dto/update-{feature}.dto.ts
  {feature}.service.ts
  {feature}.service.spec.ts
  {feature}.controller.ts
{migrations-path}/{YYYYMMDD}_{gn}_{feature}.sql
```

---

### 2.7 — Code (FE) — TACH RIENG

**Bat buoc co:**
- Component files: full path tu `src/`
- Hooks: `src/hooks/use{Feature}.ts` (React Query / SWR / Zustand...)
- API functions: them vao `{fe-app}/src/{integrations-file}`
- Navigation registration (neu Settings): ca 3 cho: union + Set + NavGroup
- Route registration (neu page moi): router config
- Verify HMR/hot-reload: feature hien dung

**Placeholder paths (dien theo du an):**
```
{fe-app}/src/
  components/{domain}/{Feature}Panel.tsx
  components/{domain}/{Feature}Card.tsx
  hooks/use{Feature}.ts
  {integrations-file}        ← them API functions
  {navigation-config}        ← dang ky tab (neu Settings)
  {router-config}            ← dang ky route (neu page moi)
  pages/{domain}/{Feature}Page.tsx
```

**Vi du (HRM):**
```
- [ ] apps/web/hrm/src/components/settings/payroll/PolicyGroupPanel.tsx
- [ ] apps/web/hrm/src/hooks/usePolicyGroup.ts
- [ ] apps/web/hrm/src/integrations/hrmApi.ts — them: list, checkCode, create, update, delete
- [ ] apps/web/hrm/src/lib/settingsNavigation.ts — them 'pay-policy-groups' (union + Set + NavGroup)
- [ ] apps/web/hrm/src/pages/Settings.tsx — import + render case
- [ ] Verify HMR: tab hien trong sidebar, panel render dung
```

---

### 2.8 — Test Report

**Bat buoc co:**
- Unit test: output coverage thuc te (KHONG chi "da chay")
- Manual test tung case -> PASS/FAIL ro rang
- FAIL -> mo ta loi cu the -> chuyen sang Fix Bug

---

### 2.9 — QA/QC

**Nguyen tac TUYET DOI:**
- E2E day du — KHONG hoi hot
- KHONG chi test 1-2 field roi xem Toast OK
- Moi buoc: Hanh dong cu the -> Ket qua mong doi cu the
- PASS khi tat ca buoc dung, KHONG co loi console
- FAIL -> ghi error log -> Fix Bug

**Browser subagent PHAI:**
- Ghi error log vao `browser/error_log_{timestamp}.md` khi gap loi
- Bao path file log ve cho agent cha
- KHONG bo qua bat ky FAIL nao

**Vi du QA steps (HRM — Nhom Chinh sach):**
```
- [ ] Browser E2E:
  - Open Settings -> Nhom Chinh sach -> 6 platform cards hien
  - Hover platform card -> khong co nut Edit/Xoa
  - Bam + Them nhom -> Drawer mo -> dien Ma, Ten, icon, mau -> Luu
  - Card moi hien dung icon/mau/ten trong grid
  - Edit card -> sua ten -> Luu -> cap nhat
  - Nhap code trung -> error inline truoc khi submit
  - Xoa card -> confirm dialog cu the -> xac nhan -> card bien mat
  - Search -> chi hien card khop
```

---

### 2.10 — Fix Bug

```
- [ ] Bug: [mo ta tu QA] -> Fix: [giai phap] -> Verify: [buoc kiem tra lai]
- [ ] Sau fix: chay lai unit test + QA/QC
```

---

## 3. QUY TAC VIET ITEMS

### 3.1 Do chi tiet

| Sai | Dung |
|-----|------|
| `Viet SRS` | `SRS Gn: UC-Gn-01..04, BR-Gn-01..12, path: docs/.../SRS_Gn_v1.md` |
| `Tao component` | `{fe-app}/src/components/{domain}/{Name}.tsx — [mo ta chuc nang]` |
| `Test API` | `GET /api/{v}/{resource} -> {response structure expected}` |
| `Them vao navigation` | `{navigation-file} — them '{tab-id}' vao: union type + Set + NavGroup '{group}'` |

### 3.2 Tach FE/BE

```
# DUNG:
### Gn-Code (FE)
- [ ] {fe-app}/src/...
### Gn-Code (BE)
- [ ] {be-app}/src/...

# SAI:
### Gn-Code (FE + BE)
- [ ] Viet frontend va backend
```

### 3.3 Khong placeholder

```
# DUNG: Viet day du khi tao task
# SAI: - [ ] (Chi tiet viet khi den luot)   ← BI CAM
```

---

## 4. TRANG THAI TASK

| Symbol | Y nghia | Khi nao |
|--------|---------|---------|
| `[ ]` | Chua lam | Default |
| `[/]` | Dang lam | Agent dang implement |
| `[x]` | Xong + verify | SAU KHI implement + test xong |
| `[-]` | Skip | Ghi ro ly do: `[-] item — skip vi [ly do]` |

**Confirm = Immutable:**
- Da confirm: CHI cap nhat checkbox, KHONG sua noi dung
- Them viec moi: them item moi, KHONG sua item cu
- Revise spec da confirm: item moi suffix `(revised-YYYYMMDD)` + ly do

---

## 5. CHECKLIST TRUOC KHI CODE

```
[] SRS confirm (co path file thuc te)
[] TechSpec confirm (schema + module structure)
[] API Contract day du endpoints
[] UIUX Spec day du chi tiet (tung field, component type, toast text)
[] Test Plan >= 5 cases (happy + fail)
[] Khong con open question ve nghiep vu
[] Project config (paths) da dien vao Goal header
```

Thieu bat ky muc nao -> STOP, bo sung spec truoc.

---

## 6. PROJECT CONFIG — DIEN KHI TAO GOAL

Moi du an them file `case-studies/{project}/30-TASK-EXT.md` voi:

```markdown
# 30-EXT — Task Config for {Project Name}

## Paths

### FE App
- fe-app: apps/web/{app-name}
- integrations-file: src/integrations/{api-name}Api.ts
- navigation-config: src/lib/{navigation-file}.ts
- router-config: src/router.tsx

### BE App
- be-app: apps/api/{api-name}
- migrations-path: migrations/{db-name}

### Docs
- docs-path: docs/{project}/{version}/

## Naming Conventions
- Error code prefix: {PROJECT}-{MODULE}-{NNN}
- Test ID prefix: {project}-{screen}-{element}

## Project-specific UIUX extensions
- See: case-studies/{project}/29-UIUX-EXT.md
```

---

## 7. TEMPLATE NHANH

```markdown
## Gn — [Ten Goal]
> Muc tieu: [1 cau]
> Phu thuoc: Gx, Gy
> Priority: P0/P1/P2
> Lane: FE + BE
> Project config: case-studies/{project}/30-TASK-EXT.md

### Gn-SRS
- [ ] SRS Gn: UC-Gn-01 ([ten]),...
  - Path: docs/{project}/{v}/SRS_Gn_[FEATURE]_v1.md
- [ ] BR-Gn-01..n: [liet ke]
- [ ] Fail cases: [liet ke]

### Gn-TechSpec
- [ ] Schema [{table}]: [cac cot]
- [ ] Migration: idempotent
- [ ] BE module: controller/service/dto/spec
- [ ] FE tree: Page -> Sub -> Leaf
- [ ] Error codes: {PRJ}-Gn-001..n

### Gn-API Contract
- [ ] GET    /api/{v}/{res}      — list
- [ ] POST   /api/{v}/{res}      — create
- [ ] PUT    /api/{v}/{res}/:id  — update
- [ ] DELETE /api/{v}/{res}/:id  — soft-delete

### Gn-UIUX Spec
> Theo 29-UIUX-STANDARDS.md + case-studies/{prj}/29-UIUX-EXT.md
- [ ] Layout: [mo ta cu the]
- [ ] [Tung field voi type component + validation]
- [ ] Empty state: [text cu the]
- [ ] Toast: "[success]" / "[error cu the]"
- [ ] Confirm: "[text cu the]"

### Gn-Test Plan
- [ ] [Happy 1]: [hanh dong] -> [ket qua]
- [ ] [Fail 1]: [hanh dong sai] -> [loi mong doi]
- [ ] System rows readonly
- [ ] Empty state

### Gn-Code (BE)
- [ ] Migration: {migrations-path}/{date}_gn_{feature}.sql
- [ ] DTO: create/update/query
- [ ] Service: {feature}.service.ts
- [ ] Controller: {feature}.controller.ts
- [ ] Unit tests: >= 80% coverage

### Gn-Code (FE)
- [ ] {fe-app}/src/components/{domain}/{Name}.tsx
- [ ] {fe-app}/src/hooks/use{Feature}.ts
- [ ] {integrations-file} — them: [api functions]
- [ ] {navigation-config} — dang ky tab/route
- [ ] Verify HMR: hien dung tren UI

### Gn-Test Report
- [ ] Unit test BE: [coverage output]
- [ ] Unit test FE: [coverage output]
- [ ] Manual: tung case PASS/FAIL

### Gn-QA/QC
- [ ] Browser E2E (KHONG hoi hot):
  - [Buoc 1]: [hanh dong] -> [ket qua mong doi]
  - [Buoc N - happy]
  - [Buoc N+1 - fail]

### Gn-Fix Bug
- [ ] Fix loi tu QA -> re-test
```