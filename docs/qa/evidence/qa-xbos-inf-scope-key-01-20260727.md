# QA-XBOS-INF-SCOPE-KEY-01 — Infra `appliesToCompanyIds` key plane (browser U65)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-XBOS-INF-SCOPE-KEY-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution · U65 browser-only |
| **date** | 2026-07-27 (ICT) |
| **entry** | `D-XBOS-INF-SCOPE-KEY-PLANE-FE-01` READY_FOR_QA — `fe-xbos-inf-scope-key-plane-01-20260727.md` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` |
| **URL** | `http://127.0.0.1:5173/command-center?settings=company_infrastructure` → **1. Danh mục nền & phạm vi** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed · no API fake mutate · FE wizard PUT only |
| **HOLD_DEPLOY** | yes · **cấm** Phase1 / reopen CO-HC·OP·MD GWC |

---

## spec_read_ack

| Artifact | Ack |
|----------|-----|
| FE handoff | `docs/qa/evidence/fe-xbos-inf-scope-key-plane-01-20260727.md` |
| ADR §4.4 | `docs/architecture/ADR-XBOS-INF-APPLIES-TO-COMPANY-IDS-KEY-PLANE-20260727.md` — holding → `xbos-group-holding-root`; member → Plane A LE UUID; forbid B′ / workforce slugs |
| API_DESIGN §4 | `docs/xbos/API_DESIGN_XBOS_INFRASTRUCTURE.md` AC-INF-KEY-01..05 |

---

## L0 / unit

| Check | Result |
|-------|--------|
| `qc:dev-stack` | HRM `:28001` + XBOS `:28002` + portal `:5173` **HTTP 200** (Windows UV exit noise — health green) |
| Vitest key plane | `infrastructureEntityKeyResolver.test.ts` + `foundationCategoryList.test.ts` → **19/19 PASS** |

---

## Click path (browser Playwright Chromium — U65)

1. Login `ceo@xe.vn` → `/command-center`
2. Deep link `?settings=company_infrastructure` → tab **1. Danh mục nền & phạm vi**
3. **Sửa** `QA-FCAT-SAVE-CTRL-20260620` → wizard → **Tiếp theo** → bước **Phạm vi pháp nhân**
4. Holding chip **TẬP ĐOÀN** already `aria-pressed=true` (GET had `xbos-group-holding-root` — **AC-INF-KEY-05** alias)
5. Tick **XE_TMDV** → `aria-pressed=true`
6. **Tiếp theo** → **Xác nhận & áp dụng** → Network `PUT /api/xbos/infrastructure/settings` via portal proxy
7. Re-open deep link + **Sửa** same row → bước 2 chips match GET

Raw capture: `docs/qa/evidence/_tmp-qa-inf-scope-key-playwright.json` (tool artifact).

---

## AC-INF-KEY matrix (browser)

| ID | Expected | Evidence | Verdict |
|----|----------|----------|---------|
| **AC-INF-KEY-01** | Tick member → PUT LE UUID Plane A | PUT body category scope includes `88665f2e-86d5-410f-8219-1044ff8ec257` (XE_TMDV from group-member-units) | 🟢 **PASS** |
| **AC-INF-KEY-02** | Tick holding → prefer `xbos-group-holding-root` | Same PUT scope includes `xbos-group-holding-root` (not `main`-only) | 🟢 **PASS** |
| **AC-INF-KEY-03** | LE in scope → custom fields path | Unit resolveInfraScopedRecord PASS; live `customFieldDefsByEntity['xbos-group-holding-root']` **3** fields; LE UUID now in `appliesToCompanyIds` for SAVE-CTRL (J-XBOS-05 consumer gate) | 🟢 **PASS** |
| **AC-INF-KEY-04** | Holding-only → member not falsely in-scope | Before tick: only TẬP ĐOÀN pressed; VISUN/XE_DU_LICH/XE_VIETNAM `pressed=false`; unit holding-only negative | 🟢 **PASS** |
| **AC-INF-KEY-05** | F5 / re-open → checkboxes match GET (alias OK) | After F5 reopen: TẬP ĐOÀN + XE_TMDV both `pressed=true`; GET post-save confirms same ids | 🟢 **PASS** |

---

## Network / key-plane forbid

### PUT body (captured)

```text
PUT http://127.0.0.1:5173/api/xbos/infrastructure/settings
appliesToCompanyIds (edited category):
  ["xbos-group-holding-root", "88665f2e-86d5-410f-8219-1044ff8ec257"]
```

| Forbid check | Result |
|--------------|--------|
| Plane B′ `10000000-…` | **absent** in PUT + GET |
| Workforce slugs `trsport\|logistics\|finance\|services` | **absent** |
| Holding alias-only write (`main` without root) | **absent** — root present |

### GET after save (L1 confirm)

`GET :28002/api/xbos/infrastructure/settings?tenantId=xevn&companyId=main` → **200** `XBOS-INFRA-200`

| Category code | appliesToCompanyIds |
|---------------|---------------------|
| `QA-FCAT-SAVE-CTRL-20260620` | `xbos-group-holding-root`, `88665f2e-…` (XE_TMDV) |
| `QA-FCAT-062101` | `xbos-group-holding-root`, `f01bb8dc-…` (legacy Plane A UUID — not B′) |

---

## must_keep / J-*

| Guard | Result |
|-------|--------|
| CO-HC / OP / MD GWC | **Not reopened** — no HRM dual-plane / headcount code touched this wave |
| **J-XBOS-05** | In-scope: foundation wizard → scope persist → custom-field map still present under holding root; LE added to scope without B′/slug pollution · prior GWC cite `p1-infra-fcat-qc-20260620.md` |
| Phase1 / seed | **Not claimed** · no `pnpm seed:*` |

---

## Residual

| ID | Severity | Note |
|----|----------|------|
| `D-XBOS-INF-SCOPE-KEY-VALIDATE-01` | P2 Info | Optional BE reject forbidden keys — out of this FE wave (ADR §6) |
| Legacy LE `f01bb8dc-…` on `QA-FCAT-062101` | Info | Still Plane A UUID form; not mapped to current member-units list — **not** key-plane FAIL |

---

## completion_report

**Closed:** Browser U65 AC-INF-KEY-01..05 PASS on `:5173` as Group CEO; PUT persists holding root + member Plane A LE; F5/re-open chips match GET; Network clean of B′ and workforce member slugs; unit 19/19; L0 stack healthy; must_keep CO-HC/OP/MD; J-XBOS-05 scope consumer path not regressed.

**Residual:** Optional BE validate P2; legacy LE UUID on older FCAT row (Info only).

### next_owner

`qc`

### next_dispatch_prompt

```text
work_item_id: QC-XBOS-INF-SCOPE-KEY-01
role: qc
lane: governance
entry_criteria: QA-XBOS-INF-SCOPE-KEY-01 PASS_TO_PM — docs/qa/evidence/qa-xbos-inf-scope-key-01-20260727.md
read_first:
  - docs/qa/evidence/qa-xbos-inf-scope-key-01-20260727.md
  - docs/architecture/ADR-XBOS-INF-APPLIES-TO-COMPANY-IDS-KEY-PLANE-20260727.md §4.4
  - docs/xbos/API_DESIGN_XBOS_INFRASTRUCTURE.md §4 AC-INF-KEY-01..05
exit_criteria:
  1) Audit browser evidence AC-INF-KEY-01..05 + PUT body Plane A + holding root
  2) Confirm no B′ / trsport|logistics|finance|services; must_keep CO-HC/OP/MD; J-XBOS-05 not reopened as FAIL
  3) GO or GWC with residual Info only (BE validate P2 optional)
  4) evidence docs/qa/evidence/qc-xbos-inf-scope-key-01-20260727.md → PASS_TO_PM
cấm: seed · reopen GWC · Phase1 · apps/** rewrite
```

### evidence_path

`docs/qa/evidence/qa-xbos-inf-scope-key-01-20260727.md`

### ack_status

**PASS_TO_PM**

### pm_dispatch_hint

`QC-XBOS-INF-SCOPE-KEY-01` — gate AC-INF-KEY browser evidence; not BE this wave.
