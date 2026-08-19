# DB_DESIGN — HRM Contracts + Insurance (paired Plane B)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-CONTRACTS-INS-DESIGN-01` |
| **change_mode** | ADD |
| **ref_srs** | khách `SRS_HRM_KHACH.md` **§3.2 FR-HRM-CI-01** Diễn biến #1–#9 · **§3.3 FR-HRM-CI-02** Diễn biến #1–#9 · team `docs/hrm/SRS.md` **UC-HRM-25** · INT `FR-HRM-INT-02` · display `SRS_FIELD_DISPLAY.md` **F-04 / F-05 / U-03** (FE labels — out of BE persist) |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§14.2** FR-CI-01 · **§14.3** FR-CI-02 · §17 spine `employee_contracts` / `employee_insurance_records` · G-CI-01 CLOSED · G-DB-02 soft FK |
| **ref_api** | `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md` |
| **ref_align** | `docs/hrm/DB_DESIGN_HRM_EMPLOYEES.md` — soft `employee_id` + **same** TEXT `company_id` slug Plane B (must_keep) |
| **Template** | `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md` |
| **U71** | Physical DB slice before Dev claim on Contracts / Insurance mutate |
| **Date** | 2026-07-27 |
| **Runtime ensure** | `ContractsInsuranceService.ensureSchema` (`CREATE TABLE IF NOT EXISTS` + indexes + TEXT migrate) |

> **must_keep:** `company_id` = **TEXT operating slug** ∈ `{holding, trsport, logistics, finance, services}` — **never** XBOS LE UUID. Soft `employee_id` (no DB `REFERENCES employees`) — app-enforced + list JOIN active employees. BR-CD-F5-01 — salary **not** required / not SoT on contract row. U72 `contract_type` / `status` / insurance type labels = **FE dictionary**.

> **Paired pack:** TechSpec couples CI-01/CI-02 under UC-HRM-25 and INT-02 spine — one DB file covers both tables. Compensation packages (F5) = related annex tables, not redefined here.

---

## 1. Table SoT — `public.employee_contracts`

| Item | Value |
|------|--------|
| Schema | `public` |
| Table | **`employee_contracts`** |
| Owner service | HRM (`hrm-api` · `ContractsInsuranceService`) |
| Consumers | Embed UC-HRM-25 contracts · EmployeeContracts tab · expiring alerts · INT-02 · soft link compensation package |
| Non-owner | XBOS LE; payroll salary SoT (F5 packages) |

### 1.1 Columns (physical)

| Column | Type | Null | Meaning (VI) | Scope / CRUD role | `ref_srs` |
|--------|------|------|--------------|-------------------|-----------|
| `id` | UUID PK | NO | Khóa hợp đồng | Path `:contractId`; khóa mang #9 | FR-CI-01 #9 |
| **`company_id`** | **TEXT NOT NULL** | NO | Operating slug Plane B | Persist `resolveHrmPersistCompanyIdText`; list/get `resolveHrmListScope` | FR-CI-01 · INT-02 · VAL-CO-HC-02 |
| `employee_id` | UUID NOT NULL | NO | Hồ sơ NV — **soft FK** → `employees.id` | App resolve + scope; list JOIN active emp | FR-CI-01 #2/#3 · INT-02 |
| `contract_code` | TEXT | YES | Mã HĐ (optional) | Create optional; khóa mang | FR-CI-01 #9 |
| `contract_type` | TEXT NOT NULL | NO | Mã / nhãn loại HĐ (catalog or enum code) | Persist raw; **F-04** FE map VI | FR-CI-01 #4/#6 · F-04 |
| `start_date` | DATE NOT NULL | NO | Ngày bắt đầu | Required | FR-CI-01 #4 |
| `end_date` | DATE | YES | Ngày kết thúc — **NULL** = open-ended (G-CI-01) | Service `assertContractEndDateForCreate` by type | FR-CI-01 #5 · «Theo loại» |
| `status` | TEXT NOT NULL DEFAULT `'active'` | NO | `active` \| `expired` \| `terminated` (CHECK) | List filter; **F-05** FE badge | FR-CI-01 trạng thái · F-05 |
| `notes` | TEXT | YES | Ghi chú | Create/update optional | — |
| `compensation_package_id` | UUID | YES | Soft link gói lương F5 | Update may set; salary **not** on this row | BR-CD-F5-01 |
| `created_at` / `updated_at` | TIMESTAMPTZ NOT NULL | NO | Audit | List ORDER BY `created_at DESC` | — |

### 1.2 Constraints / indexes

| Name / definition | Purpose |
|-------------------|---------|
| `PRIMARY KEY (id)` | Row identity |
| `chk_employee_contract_status` (`active` \| `expired` \| `terminated`) | Status domain · F-05 codes |
| `chk_contract_date_range` (`end_date IS NULL OR start_date <= end_date`) | Diễn biến #5 → `HRM-CON-001` |
| `idx_employee_contracts_company_end_date` `(company_id, end_date)` | Expiring list / alerts |
| Soft FK `employee_id` | **No** `REFERENCES employees` (G-DB-02) — app + JOIN `e.archived_at IS NULL` |
| Soft `compensation_package_id` | No hard FK this wave |

**Cấm:** hard FK cascade from XBOS LE; persist LE UUID into `company_id`; require salary column on contract (F5).

### 1.3 `end_date` by contract type (G-CI-01 — CLOSED)

| `contract_type` class | `end_date` on create | Codes / labels (policy) |
|-----------------------|----------------------|-------------------------|
| Open-ended | Optional → store **NULL** if omitted | `indefinite`, `permanent`, `HDLD_KTH`, labels chứa «không thời hạn» / «vô thời hạn»… (`isOpenEndedContractType`) |
| Fixed / other | **Required** else `HRM-CON-002` | `fixed_term`, `HDLD_*` term, probation, … |
| Any with end set | Must `start_date <= end_date` else `HRM-CON-001` | Diễn biến #5 |

### 1.4 Soft FKs / catalog

| Field | Target | Enforcement | Reject |
|-------|--------|-------------|--------|
| `employee_id` | `employees.id` same slug scope | Create: UUID or name resolve in scope; list/get JOIN non-archived | Out of scope / missing → 400/404 family |
| `company_id` | Plane B slug set | Persist + list expand (`main` → five slugs) | Scope 409 / filter drop LE UUID |
| `contract_type` | Settings `contract_types` | Soft assert on create/update (**E2 lock** — closes R-E1A-A8-CTYPE) | **`HRM-CON-TYPE-KEY`** — `DB_DESIGN_HRM_ERP_E2.md` §5 · `API_DESIGN_HRM_ERP_E2.md` §6–7 |
| `compensation_package_id` | F5 package row | Soft link on update | Package APIs own SoT salary |
| **`position_key`** / **`signer_position_key`** | Settings `job_titles` / `positions` | Soft assert on create/update when Vị trí / người ký shown (**E1-A**) | **`HRM-CON-POS-KEY`** / **`HRM-CON-SIGNER-POS-KEY`** — `DB_DESIGN_HRM_MD_BIND_E1A.md` §7 · `API_DESIGN_HRM_MD_BIND_E1A.md` |

> **DOC-DELTA 2026-07-28 (`BA-ERP-E1A-DB-API-01`):** FE `EmployeeContracts` already collects `position` / `signer_position` but baseline `employee_contracts` DDL thiếu cột. E1-A ADD: `position`, `position_key`, `department`, `department_key`, `signer_name`, `signer_position`, `signer_position_key` (design only — **cấm apply migration** trong WI BA). Residual: full FE bag (probation/file) parity may need CI UX WI.

---

## 2. Table SoT — `public.employee_insurance_records`

| Item | Value |
|------|--------|
| Schema | `public` |
| Table | **`employee_insurance_records`** |
| Owner service | Same `ContractsInsuranceService` |
| Consumers | UC-HRM-25 insurance tab · expiring insurance · INT spine after HĐ |
| W1 slice | «Ghi nhận» — provider / policy / expiry (TechSpec ALIGNED); rich BHXH type catalog = batch sau |

### 2.1 Columns (physical)

| Column | Type | Null | Meaning (VI) | Scope / CRUD role | `ref_srs` |
|--------|------|------|--------------|-------------------|-----------|
| `id` | UUID PK | NO | Khóa bản ghi BH | Khóa mang #9 | FR-CI-02 #9 |
| **`company_id`** | **TEXT NOT NULL** | NO | Operating slug Plane B | Same helpers as contracts | FR-CI-02 · INT |
| `employee_id` | UUID NOT NULL | NO | Soft FK → `employees.id` | Required on create DTO | FR-CI-02 #2 |
| `provider` | TEXT NOT NULL | NO | Nhà cung cấp / loại snapshot W1 | List paint; FE may map health heuristics | FR-CI-02 input · U-03 |
| `policy_number` | TEXT NOT NULL | NO | Số sổ / mã BH | Unique soft (app) when product locks #5 | FR-CI-02 #5 |
| `expiry_date` | DATE NOT NULL | NO | Ngày hết hạn (W1 required on DTO) | Expiring queries | FR-CI-02 #4 (runtime stricter than «optional hết hạn» SRS — note residual) |
| `status` | TEXT NOT NULL DEFAULT `'active'` | NO | `active` \| `expired` \| `cancelled` (CHECK) | List filter; **U-03** FE | U-03 |
| `created_at` / `updated_at` | TIMESTAMPTZ NOT NULL | NO | Audit; list may derive `effective_date` from created | — |

### 2.2 Constraints / indexes

| Name / definition | Purpose |
|-------------------|---------|
| `PRIMARY KEY (id)` | Row identity |
| `chk_employee_insurance_status` | Status domain · U-03 |
| `idx_employee_insurance_company_expiry_date` `(company_id, expiry_date)` | Expiring list |
| Soft `employee_id` | No DB `REFERENCES` (G-DB-02) |

**API list enrich (not stored columns):** `social_insurance_number` ← `policy_number`; optional `health_insurance_number` heuristic from provider text — wire DTO only.

### 2.3 SRS vs runtime residual (document — not invent)

| Topic | SRS says | Runtime / this design | Severity |
|-------|----------|----------------------|----------|
| Loại BH catalog | Bắt buộc theo danh mục | Persist `provider` TEXT; no separate `type` column W1 | P2 batch |
| Ngày hết hạn | Optional if present ≥ hiệu lực | DTO `@IsDateString` required `expiry_date` | Info / G residual |
| Trùng sổ | Reject if forbidden | Soft — enforce when product locks #5 | P2 |
| PATCH/GET by id insurance | Not explicit W1 | **No** get/update insurance routes today | Document as out-of-slice |

---

## 3. Identity dual-plane + INT-02

```text
Plane A (XBOS):  xbos_legal_entity.id UUID — Company profile
Plane B (HRM):   employees.company_id / employee_contracts.company_id / employee_insurance_records.company_id
                 = TEXT operating slug
Bridge:          LE → slug before any workforce filter (never LE UUID as SoT key)
INT-02:          contract.employee_id → employees.id AND contract.company_id matches employee slug scope
```

| Pattern | Verdict |
|---------|---------|
| Persist / filter via slug ladder | **REQUIRED** |
| `company_id = xbos_legal_entity.id` | **FORBIDDEN** |
| Hard `REFERENCES employees` without backfill wave | **OUT OF SCOPE** this ADD (G-DB-02 standing) |

---

## 4. Scope keys (list ↔ get parity)

| Helper | Use |
|--------|-----|
| `resolveHrmListScope` / `resolveContractsListScope` | List contracts, get-by-id, list insurance, expiring |
| `resolveHrmPersistCompanyIdText` | Create contract / insurance persist (`main` → `holding`) |
| `pushCompanyIdFilter` + employee resolvable scope | SQL `company_id = ANY(…)` + employee visibility |
| `assertResourceInHrmScope` | Update/delete contract — 404 vs 409 |

**Invariant (U19):** `GET …/contracts/{id}` **must** use the **same** scope family as `GET …/contracts`. Divergence = block TM/QC GO.

---

## 5. Acceptance (DB plane)

| Check | PASS |
|-------|------|
| Both tables `company_id` type TEXT | information_schema |
| `end_date` nullable on contracts | `\d` + G-CI-01 |
| Indexes on `(company_id, end_date)` / `(company_id, expiry_date)` | `\d` |
| Sample rows only five slugs (orphans owned) | GROUP BY |
| Soft employee_id — no hard REFERENCES required this wave | `\d` |
| U65 | **Không** dùng `ensureSeedData` / `pnpm seed:*` làm evidence UF |

**Read-only probe:**

```sql
SELECT company_id, COUNT(*) FROM public.employee_contracts
WHERE company_id = ANY (ARRAY['holding','trsport','logistics','finance','services'])
GROUP BY 1 ORDER BY 1;

SELECT COUNT(*) AS wrongly_keyed FROM public.employee_contracts
WHERE company_id ~* '^[0-9a-f]{8}-';

SELECT COUNT(*) AS orphanish
FROM public.employee_contracts c
LEFT JOIN public.employees e ON e.id = c.employee_id AND e.archived_at IS NULL
WHERE e.id IS NULL;
```

---

## 6. Out of scope / must_keep

| must_keep | forbidden / out of scope |
|-----------|--------------------------|
| `DB_DESIGN_HRM_EMPLOYEES` soft employee + TEXT slug | Wipe employees / CO-HC / industry pairs |
| G-CI-01 nullable `end_date` + type policy | Re-require end_date for indefinite |
| BR-CD-F5-01 — no salary SoT on contract | Re-add required salary column |
| U72 F-04/F-05/U-03 as FE maps | Invent BE `*_label` columns this wave |
| Compensation package physical tables | Full F.1 here — annex / separate if U71 opens |
| Insurance PATCH/GET-by-id | Not in W1 runtime — residual product if sponsor expands |

**Gaps retained:** insurance type column vs `provider`; duplicate policy_number enforce; optional migration ADD hard FK (G-DB-02) = separate wave.

> **DOC-DELTA 2026-07-28 (`BA-ERP-E2-DB-API-01`):** `contract_type` catalog assert **promoted** from residual → E2 normative (`HRM-CON-TYPE-KEY`). Persist **code** from effective `contract_types` (E1-B Settings). HARDCODE FE `CONTRACT_TYPES_KEYS` forbidden when items > 0. Position keys remain E1-A must_keep.

> **DOC-DELTA 2026-07-28 (`BA-ERP-E3-DB-API-01`):** Insurance depth — ADD master `hrm_insurance_policies` + soft `insurer_key` / `policy_id` on `employee_insurance_records` + participants. Catalog family **`insurers`**. Closes thin residual «Insurance PATCH/GET-by-id; policy master». SoT: `DB_DESIGN_HRM_ERP_E3.md` · `API_DESIGN_HRM_ERP_E3.md`. **Cấm** migration apply in BA WI.
