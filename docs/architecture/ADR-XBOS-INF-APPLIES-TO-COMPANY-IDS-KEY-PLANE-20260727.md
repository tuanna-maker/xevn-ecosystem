# ADR: XBOS Infra `appliesToCompanyIds` key plane

| Field | Value |
|-------|--------|
| **ADR-ID** | ADR-XBOS-INF-APPLIES-TO-COMPANY-IDS-KEY-PLANE-20260727 |
| **work_item_id** | `SA-XBOS-INF-SCOPE-KEY-PLANE-01` |
| **Status** | **Accepted** |
| **Date** | 2026-07-27 |
| **Decision owner** | SA |
| **Closes** | DATA_LINKAGE §6.2 #5 — foundation scope key plane residual |
| **Related** | `ADR-METADATA-APPLY-CONSUMERS-DELTA-20260620` · `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE` · `ADR-HRM-XBOS-PLANE-A-BRIDGE-4LE-5SLUG-20260727` · `ADR-HRM-RBAC-SCOPE-LADDER` §4 |
| **Evidence** | `docs/qa/evidence/sa-xbos-inf-scope-key-plane-01-20260727.md` · `ba-dual-plane-audit-02-20260727.md` |
| **must_keep** | CO-HC / OP / MD GWC CLOSED · U65 no seed · no Phase1 claim |

---

## 1. Context

Foundation category wizard (UC-XBOS-INF-01 / UC-XBOS-CC-07) persists `foundationCategories[].appliesToCompanyIds` inside `PUT /api/xbos/infrastructure/settings`. Consumers (`isOperatingEntityInFoundationScope`, `resolveInfraScopedRecord`) hide/show custom fields by matching **site `operatingEntityId`** to that array.

BA dual-plane audit flagged **mixed keys** in the wild: Plane A LE UUID, synthetic `xbos-group-holding-root`, JWT alias `main`, partition `holding` — and risk that teams confuse these with Plane B workforce slugs or Plane B′ `HRM_COMPANY_UUID_BY_SLUG`.

Partition row key `xbos_infrastructure_settings.company_id` (JWT / `normalizeCompanyId` → often `holding`) is **orthogonal** to array element identity.

---

## 2. Problem statement

| Symptom | Cause | Impact |
|---------|--------|--------|
| Checkbox 0 ticks after GET | Persist `["main"]` while UI chip id = `xbos-group-holding-root` without alias match on tick bind | Operator thinks scope empty |
| Member site missing custom fields | Scope has only holding alias; member LE UUID not in array; inheritance only within same category keys | Wrong hide |
| Silent undercount / wrong show | Store Plane B′ or workforce slug as “company” | Never equals site LE UUID |

---

## 3. Options

### Option A — Plane A + holding alias set (RECOMMENDED)

| Dimension | Assessment |
|-----------|------------|
| Scope | Governance + FE write AC; optional BE validate later |
| Complexity | Low |
| Risk | Low — matches as-built resolver + wizard chips |
| Cost | Immediate ADR + API_DESIGN note |

**Pros:** Aligns with `legalEntityList` checkboxes, site `operatingEntityId`, `INFRA_HOLDING_ENTITY_ALIASES`.  
**Cons:** Holding has three string aliases (by design).  
**Failure modes:** FE saves only `main` → mitigate write-prefer root + match aliases.

### Option B — Plane B slug as SoT

Rewrite wizard to tick `holding|trsport|…`; map every site LE → slug before match.  
**Reject:** Breaks metadata consumer ADR; conflates workforce COUNT plane with legal/infra entity plane; high FE+BE blast.

### Option C — Plane B′ UUID as SoT

Store `HRM_COMPANY_UUID_BY_SLUG` in scope.  
**Reject:** B′ ≠ LE UUID (ADR bridge); OP/MD already fail-closed on LE↔B′ mix; infra sites use Plane A.

---

## 4. Decision — Accept Option A

### 4.1 Normative key plane for `appliesToCompanyIds[]`

| Role in array | Allowed key | Plane |
|---------------|-------------|-------|
| Member pháp nhân | `xbos_legal_entity.id` UUID from org / `legalEntityList` | **A** |
| Holding / tập đoàn chip | Prefer **`xbos-group-holding-root`**; also accept `main` · `holding` as **match-equivalent** | **C + synthetic A presentation** |
| Forbidden | Any `HRM_COMPANY_UUID_BY_SLUG` value | **B′** |
| Forbidden (members) | Workforce slugs `trsport` · `logistics` · `finance` · `services` | **B** |
| Holding slug only | `holding` allowed **only** as holding alias (not a member key) | **C** |

### 4.2 Related maps (same plane)

| Artifact | Key plane |
|----------|-----------|
| `customFieldDefsByEntity` / `customBlocksByEntity` / `blockTitleOverridesByEntity` object keys | Same as scope keys (A + holding aliases) |
| Site `operatingEntityId` / `ownerLegalEntityId` | Plane **A** (member) or holding alias |
| Settings row `company_id` (partition) | JWT partition (`holding` / `main` normalize) — **not** an `appliesToCompanyIds` element SoT |

### 4.3 Match rules (normative)

1. **Exact string match** for member LE UUID.
2. **Holding alias set** = `{ xbos-group-holding-root, main, holding }` — any pair in set matches (`infraEntityIdsMatch`).
3. **No** slug→UUID bridge and **no** LE↔B′ bridge inside infra resolver.
4. Category inheritance of defs across entities in the same `appliesToCompanyIds` list remains as today — still requires correct Plane A ids for members.

### 4.4 Write preferences (FE AC)

| Action | Rule |
|--------|------|
| Tick holding in wizard | Persist **`xbos-group-holding-root`** (canonical UI id) |
| Tick member | Persist that row’s **LE UUID** only |
| Legacy GET with `main`/`holding` only | Tick holding chip via alias; do **not** invent member ticks |
| Save | Never write B′; never write `trsport|logistics|finance|services` |

### 4.5 Invariants

1. Infra scope ≠ HRM `employees.company_id` Plane B.
2. Infra scope ≠ OP/MD/mobile Plane B′.
3. CO-HC / OP / MD GWC **not** reopened by this ADR.
4. Bridge LE↔slug (ADR 4LE–5SLUG) is for workforce/display — **not** for `appliesToCompanyIds` storage.

---

## 5. Impacted systems

| System | Impact |
|--------|--------|
| FoundationCategoryWizard / CC infra | Write AC §4.4 |
| `infrastructureEntityKeyResolver.ts` | Already alias-aware for holding — keep; document as SoT |
| `PUT …/infrastructure/settings` | Opaque JSON today; optional validate WI |
| HRM OP/MD/mobile | Out of scope — must_keep |

---

## 6. Rollout / backlog

| Checkpoint | Owner | Exit |
|------------|-------|------|
| ADR + API_DESIGN residual + DATA_LINKAGE §6.2 #5 CLOSED | sa | This wave |
| FE harden persist/normalize | dev-fe | `D-XBOS-INF-SCOPE-KEY-PLANE-FE-01` |
| Optional BE reject forbidden keys | dev-be | `D-XBOS-INF-SCOPE-KEY-VALIDATE-01` **P2** |

**No immediate BE required** to close this governance WI.

---

## 7. Validation

| Check | PASS |
|-------|------|
| SoT = Plane A members + holding aliases; not B / B′ | Yes §4.1 |
| Options A/B/C with reject rationale | Yes §3 |
| FE AC write preference | Yes §4.4 |
| No apps/** / seed / OP-MD-CO-HC reopen | Yes |
