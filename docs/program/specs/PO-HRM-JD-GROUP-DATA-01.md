# PO-HRM-JD-GROUP-DATA-01 — Data contract: JD Group + Default Pack + Pack Rules

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-JD-GROUP-DATA-01` |
| **lane** | governance · ba-data |
| **status** | **ALIGNED-BENCHMARK** — WORLD-BENCHMARK §3.5/§3.6/§4 imported · entity + VAL + A2/Q6 |
| **date** | 2026-08-06 |
| **driver** | `PO-HRM-JD-GROUP-MODEL-01` + **`PO-HRM-JD-WORLD-BENCHMARK-01`** (§3.5 pack · §3.6 view order · §4 codes) |
| **base** | `PO-HRM-JD-DYNAMIC-DATA-01` §3–§5 · **§12** (A2/Q2 locks · VAL-JD-*) |
| **arch peer** | `PO-HRM-JD-DYNAMIC-ARCH-02` Q6 L1+snapshot **LOCKED** — group layer APPEND |
| **forbidden** | `apps/**` · migrate · seed UAT density · claim LIVE · dual-write `job_postings` · FE hardcode section list |
| **must_keep** | Option A · Q1 · **Q6** · A2 layout lock · SoT `job_description_templates` · U65 · YCTD soft FK |

---

## 0. Spec read ack

| Artifact | Cite |
|----------|------|
| GROUP-MODEL | `PO-HRM-JD-GROUP-MODEL-01.md` — Lớp 1 Field · Lớp 2 Group · Lớp 3 Default Pack + rule; Q6 snapshot gồm pack + groups |
| **WORLD-BENCHMARK** | `PO-HRM-JD-WORLD-BENCHMARK-01.md` — §3.5 pack membership · §3.6 view scan order · **§4 seedable group codes** |
| DATA-01 §12 | A2 = published default layout + per-JD `layout_snapshot_json`; Q2 select allowlist; VAL-JD-01..22 |
| ARCH-02 | Q6 = L1 company default + snapshot on JD save; view reads snapshot |
| AS-IS | Flat `job_description_templates` — **chưa** group/pack tables |
| Position / family SoT | `job_titles` (XBOS→HRM) — tags `job_family` for pack rule (**primary**; G1 / Greenhouse) |

---

## 1. Purpose & relationship to DATA-01

DATA-01 locks **field defs + flat layout items + values + snapshot**.  
GROUP-MODEL adds a **middle layer**: fields nest inside **Groups**; Groups nest inside a **Default Pack** chosen by **pack_rules**; optional Groups may be dragged onto the JD canvas.

| Layer | Logical entity | Class | Persist surface |
|-------|----------------|-------|-----------------|
| L1 Field | `rec_jd_field_def` | CFG | DATA-01 §3.2 |
| L2 Group | `rec_jd_group_def` + membership fields | CFG | **this doc** |
| L3 Pack | `rec_jd_default_pack` + pack↔group | CFG | **this doc** |
| L3 Rule | `rec_jd_pack_rule` (`pack_rules`) | CFG | **this doc** |
| TXN | JD master + **extended** `layout_snapshot_json` | TXN | DATA-01 + §5 here |

**Non-goals:** invent new JD SoT table; XBOS ownership of tenant groups/packs (Option A); hard-delete; UAT seed density.

---

## 2. Ownership SoT (HRM tenant)

| Concern | Owner write | Owner read/consume | Forbidden |
|---------|-------------|--------------------|-----------|
| **Group definition** (`rec_jd_group_def` + field membership) | **HRM Settings** per `company_id` (tenant CFG) | JD builder palette (groups) + view sections | FE hardcode group list; XBOS overwrite without apply path |
| **Default pack** (`rec_jd_default_pack` + group membership) | **HRM Settings** same LE scope | Create JD: apply pack → always_on groups | One global hardcode pack in FE |
| **Pack rules** (`rec_jd_pack_rule`) | **HRM Settings** | Resolve pack at open-create / đổi chức danh | Hardcode `PACK_IT_OFFICE` in FE |
| **job_family / industry keys** used in rules | Read from XBOS→HRM effective catalogs / LE tags | Rule matcher only | Invent family codes outside catalog allowlist |
| **Snapshot groups on JD** | HRM TXN on save | View TopCV by group order | Live-join CFG only (breaks Q6 history) |
| **Field defs** | Unchanged DATA-01 Option A | Nested under groups | Dual SoT |

**Decision lock (ba-data → SA ADR-ack):**

- Groups / packs / rules = **HRM tenant CFG** (same Option A as field defs).
- System skeleton groups (`kind=system_skeleton`) = **bootstrap config** only (Settings) — **≠** UAT evidence (U65).
- XBOS owns `job_titles` (+ optional family/industry tags); does **not** own pack membership rows in MVP.

---

## 3. Domain map

```text
rec_jd_field_def (CFG)
        ▲ N:N (ordered)
rec_jd_group_def (CFG) ── fields via rec_jd_group_field
        ▲ N:N (ordered, always_on flag)
rec_jd_default_pack (CFG)
        ▲
rec_jd_pack_rule (CFG) ── primary job_family → industry → work_mode → fallback → pack_id

On create JD:
  resolve pack_rules → pack
  clone always_on groups (+ optional dragged) + nested fields
        ▼
job_description_templates / rec_job_description
  layout_snapshot_json  ← includes pack_ref + groups[] + fields[]  (Q6)
  values_json
```

### 3.1 Entity catalog

| Logical | Physical name (proposed) | Class | PK | Scope |
|---------|--------------------------|-------|-----|-------|
| **E-JD-GROUP** | `rec_jd_group_def` | CFG | `id` UUID | `company_id` TEXT |
| **E-JD-GROUP-FIELD** | `rec_jd_group_field` | CFG | `id` UUID | denorm `company_id` |
| **E-JD-PACK** | `rec_jd_default_pack` | CFG | `id` UUID | `company_id` |
| **E-JD-PACK-GROUP** | `rec_jd_pack_group` | CFG | `id` UUID | denorm `company_id` |
| **E-JD-PACK-RULE** | `rec_jd_pack_rule` | CFG | `id` UUID | `company_id` |
| *(existing)* | `rec_jd_field_def` | CFG | | DATA-01 |
| *(existing)* | JD master + JSONB | TXN | | DATA-01 |

---

## 4. Entity field contracts

### 4.1 `rec_jd_group_def`

| Column | Type | Null | Rule |
|--------|------|------|------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | Same resolver list↔get (U19) |
| `code` | text | NO | Stable UPPER_SNAKE; UQ `(company_id, code)` WHERE `archived_at IS NULL` |
| `label` | text | NO | UI section label vi-VN |
| `kind` | text | NO | `system_skeleton` \| `tenant_custom` |
| `usage` | text | NO | `default_eligible` \| `optional_only` |
| `view_style` | text | NO | MVP: `heading` \| `bullets` \| `chips` \| `plain` |
| `sort_order` | int | NO | Default palette order in Settings |
| `is_active` | boolean | NO | Inactive = hidden from drag; snapshots retain copy |
| `archived_at` | timestamptz | YES | Soft-delete |
| `created_at` / `updated_at` | timestamptz | NO | Audit |
| `created_by` / `updated_by` | text | YES | Audit |

**Seedable system skeleton codes (WORLD-BENCHMARK §4 — bootstrap Settings config only; ≠ UAT evidence / U65):**

| code | label (VI) | usage | Pack role |
|------|------------|-------|-----------|
| `SEC_META` | Thông tin đăng tuyển | `default_eligible` | always_on all packs (title + controlled meta fields) |
| `SEC_ABOUT_ROLE` | Giới thiệu vị trí | `default_eligible` | always_on IT / DRIVER / CORP |
| `SEC_RESPONSIBILITIES` | Mô tả / trách nhiệm | `default_eligible` | always_on all packs |
| `SEC_REQ_MIN` | Yêu cầu bắt buộc | `default_eligible` | always_on all packs (Google Minimum) |
| `SEC_REQ_PREF` | Yêu cầu ưu tiên | `default_eligible` | always_on **IT**; optional_on CORP; DRIVER optional |
| `SEC_WORKING` | Thời gian & điều kiện làm việc | `default_eligible` | always_on all packs (office vs shift content differs by pack) |
| `SEC_BENEFITS` | Chế độ đãi ngộ | `default_eligible` | always_on all packs |
| `SEC_GROWTH` | Lộ trình phát triển | `optional_only` | drag IT / CORP |
| `SEC_ABOUT_COMPANY` | Về công ty / đội ngũ | `optional_only` | drag ngắn — không chiếm nửa JD |
| `SEC_LICENSE` | Giấy phép & chứng chỉ | `default_eligible` | always_on **DRIVER** only |
| `SEC_SAFETY` | An toàn & tuân thủ | `default_eligible` | always_on **DRIVER** only |
| `SEC_PHYSICAL` | Yêu cầu thể chất / môi trường | `optional_only` | drag DRIVER / ops |
| `SEC_EEO` | Cam kết đa dạng & cơ hội bình đẳng | `optional_only` | GĐ2 optional |
| `SEC_AI_TOOLS` | Yêu cầu / ưu tiên AI | `optional_only` | drag IT (XeVN Fullstack) |

**Reserved codes:** Codes in §4 table are `kind=system_skeleton` when bootstrapped — tenant may clone/relabel but **must not** reuse code for unrelated meaning (VAL-GRP-21).  
**Legacy aliases (MODEL draft — do not seed new):** `SEC_HEADER`→`SEC_META` · `SEC_DUTIES`→`SEC_RESPONSIBILITIES` · `SEC_REQUIREMENTS`→split `SEC_REQ_MIN`/`SEC_REQ_PREF` · `SEC_TIME_PLACE`→`SEC_WORKING` · `SEC_AI_REQ`→`SEC_AI_TOOLS`. Readers may map aliases → canonical on migrate.

### 4.2 `rec_jd_group_field` — Group membership (fields)

| Column | Type | Null | Rule |
|--------|------|------|------|
| `id` | uuid | NO | PK |
| `group_id` | uuid | NO | FK → `rec_jd_group_def` |
| `field_id` | uuid | NO | FK → `rec_jd_field_def` |
| `company_id` | text | NO | Denorm scope_parity |
| `sort_order` | int | NO | Order **within group**; if group contains `title`, it must be first in that group **and** first in overall hero chain (VAL-GRP-06 / DYN-02) |
| `is_required_in_group` | boolean | NO | May tighten vs field def; cannot loosen system required |

**UQ:** `(group_id, field_id)` WHERE active.  
**Cross-group:** same `field_id` **may** appear in ≤1 active group per company MVP (fail-closed VAL-GRP-05) — avoids duplicate values keys.

### 4.3 `rec_jd_default_pack`

| Column | Type | Null | Rule |
|--------|------|------|------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | Scope |
| `code` | text | NO | e.g. `PACK_IT_OFFICE`; UQ `(company_id, code)` soft-active |
| `label` | text | NO | vi-VN |
| `description` | text | YES | Ops note |
| `is_company_fallback` | boolean | NO | ≤1 `true` active per `company_id` (= `PACK_CORP_DEFAULT`) |
| `is_active` | boolean | NO | |
| `archived_at` | timestamptz | YES | Soft |
| timestamps / audit | | | same pattern |

**Seedable pack codes (WORLD-BENCHMARK §3.5 — SoT; MODEL `PACK_COMPANY_DEFAULT` ≡ `PACK_CORP_DEFAULT`):**

| code | Label (ops) | `is_company_fallback` |
|------|-------------|------------------------|
| `PACK_IT_OFFICE` | IT / văn phòng công nghệ | false |
| `PACK_DRIVER_OPS` | Lái xe / vận hành logistics | false |
| `PACK_CORP_DEFAULT` | Mặc định pháp nhân (Greenhouse-style corp template) | **true** |
| `PACK_WAREHOUSE` | *(optional GĐ2)* kho / bãi | false |

### 4.4 `rec_jd_pack_group` — Pack ↔ Group membership (WORLD-BENCHMARK §3.5)

| Column | Type | Null | Rule |
|--------|------|------|------|
| `id` | uuid | NO | PK |
| `pack_id` | uuid | NO | FK → pack |
| `group_id` | uuid | NO | FK → group; group.`usage` must allow (`default_eligible` for always_on) |
| `company_id` | text | NO | Denorm |
| `sort_order` | int | NO | **Canonical view/canvas order** — must follow §4.6 / BENCHMARK §3.6 within pack |
| `always_on` | boolean | NO | `true` = auto-present when pack applies; `false` = suggested optional (palette) |

**Normative pack membership (bootstrap config):**

| Pack | always_on groups (`sort_order` = view order) | optional (`always_on=false`) |
|------|-----------------------------------------------|------------------------------|
| `PACK_IT_OFFICE` | `SEC_META`(0) · `SEC_ABOUT_ROLE`(1) · `SEC_RESPONSIBILITIES`(2) · `SEC_REQ_MIN`(3) · `SEC_REQ_PREF`(4) · `SEC_WORKING`(5) · `SEC_BENEFITS`(6) | `SEC_AI_TOOLS` · `SEC_GROWTH` · `SEC_ABOUT_COMPANY` · `SEC_EEO` |
| `PACK_DRIVER_OPS` | `SEC_META`(0) · `SEC_ABOUT_ROLE`(1) · `SEC_RESPONSIBILITIES`(2) · `SEC_REQ_MIN`(3) · `SEC_LICENSE`(4) · `SEC_WORKING`(5) · `SEC_SAFETY`(6) · `SEC_BENEFITS`(7) | `SEC_REQ_PREF` · `SEC_PHYSICAL` · `SEC_GROWTH` · `SEC_ABOUT_COMPANY` |
| `PACK_CORP_DEFAULT` | `SEC_META`(0) · `SEC_ABOUT_ROLE`(1) · `SEC_RESPONSIBILITIES`(2) · `SEC_REQ_MIN`(3) · `SEC_WORKING`(4) · `SEC_BENEFITS`(5) | `SEC_REQ_PREF` · `SEC_GROWTH` · `SEC_ABOUT_COMPANY` · `SEC_EEO` |

**Rule:** Pack publish requires `SEC_META` always_on with system `title` field path — VAL-GRP-07.  
**Driver note (BENCHMARK §3.6):** Safety & License sit after Requirements / within Working block — order above is SoT for DRIVER pack.

### 4.5 `rec_jd_pack_rule` (`pack_rules`) — primarily by `job_family`

| Column | Type | Null | Rule |
|--------|------|------|------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | Scope |
| `priority` | int | NO | Lower number = higher precedence (1 before 2…) |
| `match_type` | text | NO | **`job_family`** (MVP primary) \| `industry` (secondary) \| `employment_work_mode` (tertiary) \| `fallback` |
| `match_value` | text | YES | NULL only when `match_type=fallback`; else family/industry/mode code |
| `pack_id` | uuid | NO | FK → active pack same `company_id` |
| `is_active` | boolean | NO | |
| `archived_at` | timestamptz | YES | Soft |
| timestamps / audit | | | |

**Evaluation order (BENCHMARK §3.5 Greenhouse/Workday + MODEL — fail-closed):**

1. **Primary:** active rules `match_type=job_family` where `match_value` = effective family on selected `position_code` / `job_titles` tag — lowest `priority` wins among matches.
2. Else `industry` (LE or position tag) — optional secondary.
3. Else `employment_work_mode` (e.g. `full_time|office`) — tertiary; SA may normalize.
4. Else **exactly one** active `fallback` → pack with `is_company_fallback=true` (`PACK_CORP_DEFAULT`).
5. If no fallback configured → **400** `HRM-JD-PACK-FALLBACK` (do not invent FE pack).

**Illustrative job_family → pack (bootstrap rules — config, not UAT seed):**

| priority | match_type | match_value (example) | pack_code |
|---------:|------------|----------------------|-----------|
| 10 | `job_family` | `IT` / `TECH` / `SOFTWARE` | `PACK_IT_OFFICE` |
| 10 | `job_family` | `DRIVER` / `FLEET` / `LOGISTICS_OPS` | `PACK_DRIVER_OPS` |
| 100 | `fallback` | NULL | `PACK_CORP_DEFAULT` |

Exact `match_value` strings = tenant catalog allowlist (XBOS/HRM job family tags) — invent → skip rule + continue chain (VAL-GRP-20) or 400 if SA chooses strict.

**G4 (đổi chức danh):** Changing `position_code` mid-edit does **not** auto-wipe `values_json` / snapshot groups. API may return `suggested_pack_id` + `pack_changed=true`; FE confirms «Áp pack mới?» — apply = rebuild snapshot groups from new pack **keeping values for intersecting field_keys** (VAL-GRP-14).

### 4.6 View order lock (WORLD-BENCHMARK §3.6)

Candidate scan order — **stored in snapshot `groups[].sort_order`**, not hardcoded in FE:

```text
0 SEC_META          → meta chips (title, loc, salary, type, workplace)
1 SEC_ABOUT_ROLE
2 SEC_RESPONSIBILITIES
3 SEC_REQ_MIN → 4 SEC_REQ_PREF   (DRIVER: insert SEC_LICENSE / SEC_SAFETY per pack membership)
5 SEC_WORKING
6 SEC_BENEFITS
7+ optional: SEC_ABOUT_COMPANY · SEC_EEO · SEC_GROWTH · SEC_AI_TOOLS · SEC_PHYSICAL
```

**Render SoT:** View reads `layout_snapshot_json.groups` sorted by `sort_order` ascending. Reorder on canvas updates snapshot only (Q6).

---

## 5. DATA-LOCK — A2 / Q6 align (pack default + per-JD snapshot)

| Lock | Statement |
|------|-----------|
| **A2 (unchanged)** | One published **default field layout** path may remain for field-level DnD (DATA-01 §12.6). Group layer does **not** replace A2. |
| **Q6 (extended)** | On JD save: persist **`layout_snapshot_json`** that is the **render SoT**. Snapshot **must include groups** (and pack ref), not only flat fields. |
| **Pack default (L3)** | At open-create: resolve `pack_rules` → pack → clone `always_on` groups (+ nested fields) into the **working canvas** (equivalent to L1 clone). |
| **Per-JD override** | Drag optional groups / reorder groups / reorder fields **updates snapshot only**. Does **not** mutate pack CFG unless Settings action. |
| **History** | Changing pack membership / group fields later **must not** rewrite existing JD snapshots (same as field def history). |
| **View (§3.6)** | TopCV/career-site view reads **`layout_snapshot_json.groups[]` sorted by `sort_order`** (BENCHMARK scan order); never live-join only CFG; never FE-hardcoded section sequence. |

### 5.1 Extended `layout_snapshot_json` shape (ADD on DATA-01)

Snapshot **must** persist group order for view (BENCHMARK §3.6). Example after `PACK_IT_OFFICE` resolve:

```json
{
  "layout_version": 2,
  "pack": {
    "pack_id": "…",
    "pack_code": "PACK_IT_OFFICE",
    "pack_label": "IT văn phòng",
    "resolved_by": "job_family",
    "match_value": "IT"
  },
  "groups": [
    {
      "group_id": "…",
      "group_code": "SEC_META",
      "label": "Thông tin đăng tuyển",
      "view_style": "chips",
      "sort_order": 0,
      "source": "pack_always_on",
      "fields": [
        { "field_id": "…", "field_key": "title", "label": "Tiêu đề", "field_type": "short_text", "is_required": true, "sort_order": 0 }
      ]
    },
    {
      "group_id": "…",
      "group_code": "SEC_ABOUT_ROLE",
      "label": "Giới thiệu vị trí",
      "view_style": "plain",
      "sort_order": 1,
      "source": "pack_always_on",
      "fields": []
    },
    {
      "group_id": "…",
      "group_code": "SEC_RESPONSIBILITIES",
      "label": "Mô tả / trách nhiệm",
      "view_style": "bullets",
      "sort_order": 2,
      "source": "pack_always_on",
      "fields": [
        { "field_id": "…", "field_key": "responsibilities", "label": "Trách nhiệm", "field_type": "long_text", "is_required": true, "sort_order": 0 }
      ]
    },
    {
      "group_id": "…",
      "group_code": "SEC_REQ_MIN",
      "label": "Yêu cầu bắt buộc",
      "view_style": "bullets",
      "sort_order": 3,
      "source": "pack_always_on",
      "fields": []
    },
    {
      "group_id": "…",
      "group_code": "SEC_REQ_PREF",
      "label": "Yêu cầu ưu tiên",
      "view_style": "bullets",
      "sort_order": 4,
      "source": "pack_always_on",
      "fields": []
    },
    {
      "group_id": "…",
      "group_code": "SEC_WORKING",
      "label": "Thời gian & điều kiện làm việc",
      "view_style": "plain",
      "sort_order": 5,
      "source": "pack_always_on",
      "fields": []
    },
    {
      "group_id": "…",
      "group_code": "SEC_BENEFITS",
      "label": "Chế độ đãi ngộ",
      "view_style": "bullets",
      "sort_order": 6,
      "source": "pack_always_on",
      "fields": []
    },
    {
      "group_id": "…",
      "group_code": "SEC_AI_TOOLS",
      "label": "Yêu cầu / ưu tiên AI",
      "view_style": "bullets",
      "sort_order": 7,
      "source": "optional_drag",
      "fields": []
    }
  ]
}
```

| `source` | Meaning |
|----------|---------|
| `pack_always_on` | From applied pack |
| `optional_drag` | HR kéo thêm từ catalog |
| `manual` | Edge: admin-forced (rare) |

**Compat:** Readers MUST accept legacy flat `layout_snapshot` array (DATA-01) as `layout_version=1` → treat as single synthetic group `SEC_LEGACY` (migration/read bridge — SA DDL). Writers MVP after group wave emit `layout_version≥2` with `groups[]` + ordered `sort_order`.

**`layout_version`:** bump when group/pack shape in snapshot changes (DATA-01 §12.1).

---

## 6. Lifecycle

| Entity | States | Legal | Invalid |
|--------|--------|-------|---------|
| Group | active ↔ inactive → archived | Soft only; cannot archive if sole carrier of `title` on fallback pack | Hard delete; archive `SEC_META` while still always_on on fallback |
| Pack | active ↔ inactive → archived | Soft; cannot archive company fallback while no replacement | Zero always_on groups |
| Pack rule | active ↔ inactive | Reorder priority | Two active fallbacks |
| JD snapshot | immutable copy at save | PATCH may replace snapshot on intentional apply-pack | Silent pack swap wiping values |

---

## 7. Data interaction matrix

| Surface | Create | Read | Update | Delete / transition |
|---------|--------|------|--------|---------------------|
| Settings — Groups | POST group + fields | GET list/detail scoped | PATCH label/fields/order | Soft archive / deactivate |
| Settings — Packs | POST pack + pack_groups | GET | PATCH membership | Soft; protect fallback |
| Settings — Pack rules | POST rule | GET ordered by priority | PATCH priority/match | Soft |
| Thư viện JD — Thêm | Resolve pack → canvas | — | Drag optional groups | — |
| Thư viện JD — Lưu | Persist snapshot+values | — | — | — |
| Thư viện JD — Xem | — | Snapshot groups | — | — |
| Đổi chức danh | — | `suggested_pack` | Confirm apply pack | No auto wipe |

---

## 8. Validation matrix

| ID | Condition | Rule | Expected | Error code |
|----|-----------|------|----------|------------|
| VAL-GRP-01 | Create group missing `code`/`label`/`kind`/`usage` | Required | **400** | `HRM-JD-GROUP-VAL` |
| VAL-GRP-02 | Duplicate `code` same `company_id` active | UQ | **409** | `HRM-JD-GROUP-DUP` |
| VAL-GRP-03 | `kind` / `usage` / `view_style` ∉ enum | Closed | **400** | `HRM-JD-GROUP-ENUM` |
| VAL-GRP-04 | Group field → unknown/inactive/out-of-scope `field_id` | FK + scope | **400** | `HRM-JD-GROUP-FIELD` |
| VAL-GRP-05 | Same `field_id` in two active groups same company | MVP exclusive | **409** | `HRM-JD-GROUP-FIELD-DUP` |
| VAL-GRP-06 | Snapshot/publish: `title` not first overall (hero chain) | DYN-02 | **400** | `HRM-JD-LAYOUT-TITLE` |
| VAL-GRP-07 | Pack has zero `always_on` groups or no path to `title` | Publish gate | **400** | `HRM-JD-PACK-EMPTY` |
| VAL-GRP-08 | Duplicate pack `code` active | UQ | **409** | `HRM-JD-PACK-DUP` |
| VAL-GRP-09 | Second `is_company_fallback=true` active | ≤1 | **409** | `HRM-JD-PACK-FALLBACK-DUP` |
| VAL-GRP-10 | Pack rule `pack_id` other company / inactive | Scope + FK | **400** | `HRM-JD-PACK-RULE-REF` |
| VAL-GRP-11 | `match_type=fallback` with non-null conflicting match_value | Shape | **400** | `HRM-JD-PACK-RULE-VAL` |
| VAL-GRP-12 | Resolve pack: no match and no fallback | Fail-closed | **400** | `HRM-JD-PACK-FALLBACK` |
| VAL-GRP-13 | JD save: `groups[]` empty or field not in any group | Q6 shape | **400** | `HRM-JD-LAYOUT-EMPTY` / `HRM-JD-VAL-UNKNOWN` |
| VAL-GRP-14 | Apply new pack without confirm flag when pack_changed | G4 | **400** | `HRM-JD-PACK-APPLY-CONFIRM` |
| VAL-GRP-15 | Optional-only group marked `always_on` on pack | usage gate | **400** | `HRM-JD-PACK-GROUP-USAGE` |
| VAL-GRP-16 | Member CEO writes group/pack for other LE | Scope ladder | **403/409** | scope mismatch |
| VAL-GRP-17 | List returns group/pack id; get-by-id different filter | **scope_parity** | Detail **200** same resolver | Flag `scope_parity` |
| VAL-GRP-18 | Attach `optional_only` group as only group (no `SEC_META`/title path) | Title-first | **400** | `HRM-JD-LAYOUT-TITLE` |
| VAL-GRP-19 | Hard-delete group referenced by historical snapshot | Soft only | **409** | `HRM-JD-GROUP-INUSE` |
| VAL-GRP-20 | `job_family` match_value not in allowlist / unknown tag | Closed matcher | **400** or skip rule *(SA: prefer skip + continue chain)* | `HRM-JD-PACK-MATCH` |
| VAL-GRP-21 | Create tenant group reusing reserved §4 `code` with different semantics / without system_skeleton path | Reserved catalog | **409** | `HRM-JD-GROUP-CODE-RESERVED` |
| VAL-GRP-22 | JD save snapshot `groups[]` missing `sort_order` or duplicate sort_order | View order SoT §4.6 | **400** | `HRM-JD-GROUP-ORDER` |
| VAL-GRP-23 | Pack always_on set ≠ BENCHMARK §3.5 required set for that pack_code (when `kind=system` pack) | Pack integrity | **400** | `HRM-JD-PACK-MEMBERSHIP` |
| VAL-GRP-24 | Resolve uses FE-hardcoded pack instead of `job_family` rules | Rules SoT | QA FAIL / reject | — (process) |

**Inherit without redefinition:** VAL-JD-01..22 (fields/values/YCTD/select) still apply inside groups.

---

## 9. Deterministic error envelope

| Code | HTTP | When | FE recovery |
|------|------|------|-------------|
| `HRM-JD-GROUP-VAL` | 400 | Group payload incomplete | Settings form |
| `HRM-JD-GROUP-DUP` | 409 | Duplicate code | Rename |
| `HRM-JD-PACK-EMPTY` | 400 | Pack missing always_on/title | Fix pack membership |
| `HRM-JD-PACK-FALLBACK` | 400 | No resolvable pack | Configure fallback pack + rule |
| `HRM-JD-PACK-APPLY-CONFIRM` | 400 | Đổi chức danh đổi pack | Dialog G4 |
| `HRM-JD-LAYOUT-TITLE` | 400 | Title not first in `SEC_META` | Auto-pin meta group |
| `HRM-JD-GROUP-ORDER` | 400 | Snapshot group order invalid | Re-normalize sort_order |
| `HRM-JD-PACK-MEMBERSHIP` | 400 | Pack missing required §3.5 groups | Settings pack editor |
| scope 409 | 409 | companyId ≠ token | Membership / slug |

Envelope: existing HRM `{ code, message, details? }` — no parallel shape.

---

## 10. scope_parity (U19)

| Resource | List | Get-by-id | Rule |
|----------|------|-----------|------|
| Groups | `GET …/jd-groups?company_id=` | `GET …/jd-groups/:id` | Identical `resolveHrmListScope` / `company_id` TEXT |
| Packs | `GET …/jd-packs` | `GET …/jd-packs/:id` | Same |
| Pack rules | `GET …/jd-pack-rules` | `GET …/:id` | Same |
| JD (unchanged) | F-JD-01 | F-JD-03 | DATA-01 VAL-JD-14 |

| Journey (extend) | Path | Assert |
|------------------|------|--------|
| **J-HRM-JD-01** | Settings → Groups/Packs → Lưu → F5 | list id → detail 200 |
| **J-HRM-JD-02** | Thư viện → Thêm → pack auto groups → kéo optional → Lưu → F5 | snapshot has `groups[]`; create id → GET 200 |
| **J-HRM-JD-03** | List → Xem | Render by **snapshot `groups[].sort_order`** (§3.6); Meta→About→Resp→Req→Working→Benefits; listed id ≠ 404 |

Group CEO `main` rollup: if list includes member-scoped group id, detail **must** use same rollup semantics — else **scope_parity** defect.

---

## 11. API stub map (for SA APPEND ARCH)

> Paths stubs — SA locks OpenAPI + F.1 Diễn biến.

| F-id | Method / path (stub) | Mục đích | DB |
|------|----------------------|----------|-----|
| F-JD-GRP-01 | `GET /settings/jd-groups` | List groups + field membership | `rec_jd_group_def` |
| F-JD-GRP-02 | `POST /settings/jd-groups` | Create group | insert |
| F-JD-GRP-03 | `PATCH /settings/jd-groups/:id` | Update + replace fields | |
| F-JD-GRP-04 | `POST …/:id/archive` | Soft archive | |
| F-JD-PACK-01 | `GET /settings/jd-packs` | List packs + groups | pack + pack_group |
| F-JD-PACK-02 | `POST /settings/jd-packs` | Create pack | |
| F-JD-PACK-03 | `PATCH /settings/jd-packs/:id` | Membership / fallback flag | |
| F-JD-RULE-01 | `GET /settings/jd-pack-rules` | Ordered rules | `rec_jd_pack_rule` |
| F-JD-RULE-02 | `PUT /settings/jd-pack-rules` | Replace ordered set | transactional |
| F-JD-RESOLVE-01 | `GET /recruitment/jd-pack-resolve?company_id=&position_code=` | Preview pack for create | rules eval |
| F-JD-02/03/04 | *(extend)* | Body accepts/returns `layout_snapshot.groups` | JSONB |

**Display-ready:** resolve endpoints return pack+groups+fields labels (no FE multi-join invent) — SPEC §14 / ARCH-02 pattern.

---

## 12. Traceability

| Req / MODEL | API stub | DB | FE | Test |
|-------------|----------|-----|-----|------|
| MODEL §3.1 L2 Group | F-JD-GRP-* | `rec_jd_group_def` + `rec_jd_group_field` | Settings Groups | VAL-GRP-01..06 · J-HRM-JD-01 |
| MODEL §3.1 L3 Pack | F-JD-PACK-* | `rec_jd_default_pack` + `rec_jd_pack_group` | Settings Packs | VAL-GRP-07..09 · 15 |
| MODEL §3.3 rules | F-JD-RULE-* · F-JD-RESOLVE-01 | `rec_jd_pack_rule` | Settings Rules; create open | VAL-GRP-10..12 · 20 |
| MODEL Q6 snapshot groups | F-JD-02/03 | `layout_snapshot_json` v2 | Builder + View | VAL-GRP-13 · 22 · J-HRM-JD-02/03 |
| **BENCHMARK §4 codes** | F-JD-GRP-* | `rec_jd_group_def.code` | Settings bootstrap | VAL-GRP-21 |
| **BENCHMARK §3.5 packs** | F-JD-PACK-* | pack_group membership | Settings Packs | VAL-GRP-07 · 23 |
| **BENCHMARK §3.5 job_family rules** | F-JD-RULE-* · RESOLVE-01 | `match_type=job_family` primary | Create JD open | VAL-GRP-12 · 20 · 24 |
| **BENCHMARK §3.6 view order** | F-JD-03 | `groups[].sort_order` | TopCV view | VAL-GRP-22 · J-HRM-JD-03 |
| A2 + Q6 L1+snapshot | F-JD-LAY-* + snapshot | unchanged ownership | — | must_keep DATA-01 §12.6 |
| G4 đổi chức danh | F-JD-04 + resolve | values keep ∩ keys | confirm dialog | VAL-GRP-14 |
| Option A ownership | all CFG write HRM | tenant `company_id` | — | VAL-GRP-16 |
| U19 scope_parity | list↔get | TEXT slug | deep link | VAL-GRP-17 |
| FR-UC-BP-REC-00 / DYN-* | inherit | field/values | — | VAL-JD-* |
| must_keep no `job_postings` | — | — | — | Lane B forbidden |

---

## 13. Risks & mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Flat snapshot readers break | View empty | Compat `layout_version=1` → synthetic group |
| Pack resolve without fallback | Create blocked | Require company fallback rule (VAL-GRP-12) |
| Auto-apply pack on title change | Data loss | G4 confirm + VAL-GRP-14 |
| Duplicate field across groups | values collision | VAL-GRP-05 exclusive MVP |
| FE hardcode IT pack / section order | Driver JD wrong hours; view ≠ §3.6 | Rules + snapshot `sort_order` only |
| scope_parity groups under `main` | 404 after list | Same resolver as JD/field defs |
| Old MODEL codes (`SEC_DUTIES`…) in seed | Drift vs BENCHMARK §4 | Alias map §4.1; seed only §4 codes |

---

## 14. Residual

| ID | Item | Owner | Status |
|----|------|-------|--------|
| R-JD-GRP-01 | Physical DDL + migrate bridge v1→v2 snapshot | sa → dev-be | OPEN |
| R-JD-GRP-02 | API F.1 Diễn biến map UC group/pack (SPEC delta) | sa (+ ba-process UC if gap) | OPEN |
| R-JD-GRP-03 | `employment_work_mode` match_value canonical form | sa | OPEN |
| R-JD-GRP-04 | Journey map file append group steps | pm | OPEN |
| R-JD-GRP-05 | Whether field-level `rec_jd_form_layout` remains parallel or collapses into pack-only L1 | sa ADR | OPEN — ba-data: **keep both** (A2 field layout optional; pack drives groups) |
| R-JD-GRP-06 | Canonical `job_family` match_value vocabulary (IT/DRIVER/…) vs XBOS tags | sa · ba-data | OPEN — examples in §4.5 only |
| R-JD-GRP-07 | WORLD-BENCHMARK import into GROUP-DATA | ba-data | **CLOSED** — this UPDATE |

---

## 15. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | `sa` |
| **evidence_path** | `docs/program/specs/PO-HRM-JD-GROUP-DATA-01.md` · `docs/qa/evidence/po-hrm-jd-group-data-01.md` |
| **Dev** | **HOLD** until SA APPEND ARCH group/pack + SPEC UC delta if missing |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-JD-GROUP-ARCH-01
role: sa
read_first:
  - docs/program/specs/PO-HRM-JD-WORLD-BENCHMARK-01.md (§3.5 pack · §3.6 view · §4 codes)
  - docs/program/specs/PO-HRM-JD-GROUP-MODEL-01.md
  - docs/program/specs/PO-HRM-JD-GROUP-DATA-01.md (ALIGNED-BENCHMARK — VAL-GRP-01..24 · §4.4–§4.6)
  - docs/program/specs/PO-HRM-JD-DYNAMIC-DATA-01.md §12 (A2/Q2 · must_keep)
  - docs/program/specs/PO-HRM-JD-DYNAMIC-ARCH-02.md (Q6 L1+snapshot LOCKED — APPEND group layer only)
entry_criteria: GROUP-DATA-01 ALIGNED-BENCHMARK; DYNAMIC ARCH-02 Q6 locked; no apps/**
exit_criteria:
  - ADR-ack: §4 seedable SEC_* codes; §3.5 PACK_IT_OFFICE / PACK_DRIVER_OPS / PACK_CORP_DEFAULT membership; rules primary job_family
  - ADR-ack: A2+Q6 — snapshot.groups[].sort_order is view SoT (§3.6); no FE hardcode section sequence
  - TechSpec/API APPEND: F-JD-GRP/PACK/RULE/RESOLVE F.1; extend F-JD-02/03 snapshot v2 with ordered groups
  - DB_DESIGN delta: group/pack/rule tables + reserved code list from BENCHMARK §4
  - scope_parity list↔get; fail-closed fallback → PACK_CORP_DEFAULT; G4 confirm apply pack
  - must_keep: Option A · Q1 · Q6 · job_description_templates SoT · no job_postings dual-write · U65
  - no apps/** code
evidence_path: docs/program/specs/PO-HRM-JD-GROUP-ARCH-01.md (or APPEND section on ARCH-02)
ack_status: PASS_TO_PM
```

---

## 16. DOC-DELTA — Align WORLD-BENCHMARK-01 (2026-08-06)

**change_mode:** UPDATE · **ref:** `PO-HRM-JD-WORLD-BENCHMARK-01.md`  
**closes:** R-JD-GRP-07  
**does not:** apps/** · UAT seed · DDL

| BENCHMARK | GROUP-DATA locus |
|-----------|------------------|
| §4 catalog codes | §4.1 seedable `rec_jd_group_def` + legacy alias map |
| §3.5 pack membership | §4.3–§4.4 `PACK_*` + `rec_jd_pack_group` table |
| §3.5 job family templates | §4.5 rules **primary** `job_family` |
| §3.6 view scan order | §4.6 + §5.1 snapshot `groups[].sort_order` |
| Gap §5 FE hierarchy | VAL-GRP-22 · J-HRM-JD-03 |

---

*End PO-HRM-JD-GROUP-DATA-01.*
