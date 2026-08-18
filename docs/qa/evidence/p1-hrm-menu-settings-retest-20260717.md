# P1-HRM-MENU-QA-SETTINGS-RETEST — UF-HRM-10 (:8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-MENU-QA-SETTINGS-RETEST` |
| **date** | 2026-07-17 |
| **owner** | qa |
| **prior FAIL** | `docs/qa/evidence/p1-hrm-menu-settings-20260717.md` (RATE-429) |
| **mitigation** | `docs/qa/evidence/d-p1-hrm-rate-429-20260717.md` (`HRM_RATE_LIMIT_MAX` 600→**10000**) |
| **env** | `http://14.225.217.232:8088` |
| **URL** | Portal `…/command-center/hrm/settings` · FE deep-link `…/hr/settings-catalogs?portal=1&tenantId=xevn&companyId=main` |
| **persona** | `ceo@xe.vn` · Group CEO · `companyId=main` |
| **spec** | HRM-SC-01..03 · UF-HRM-10 |
| **U65** | zero-seed · sequential FE (exclusive browser tab `d5b29b`); session Bearer probes only |
| **ack_status** | **PASS_TO_PM** (verdict **FAIL**) |

---

## Verdict

**FAIL** — Prior **RATE-429** blocker is **closed** under sequential UAT (L0/overview stable **200**, item POST **201**, `x-ratelimit-limit: 10000`, no portal 429 banner). However **UF-HRM-10 U65 mutate→F5 still FAIL**: FE **Thêm / cập nhật mục** gets **201** `HRM-SET-201` (`upserted:1`) but **GET overview does not return the item** (create or edit), so FE after 2xx / F5 never shows the row.

| Gate | Result |
|------|--------|
| L0 tab load / no ERROR banner / no 409 / no 54321 | **PASS** — no HTTP 429 banner on settings / catalogs |
| L2 UI data (catalog rows) | **PASS** — XBOS catalog tables render (e.g. ACM_01..03, ALW_*, …); overview **76** keys |
| Network primary 2xx | **PASS** — GET overview **200** `HRM-SET-200` (~0.9–1.1s); POST items **201** `HRM-SET-201` (~0.4s) |
| RATE-429 regression | **PASS** — 0×429 observed; remaining ~9965–9999 / 10000 |
| Mutate U65 (item + F5 persists) | **FAIL** — POST 201 but overview `hrmExtensionItems` stays empty; F5 no QAFE/ADDR/edit label |
| Optional Đồng bộ XBOS | **⬜ not re-run** this wave (prior wave sync **201**/74 keys; optional per exit) |

---

## Click path (U65 sequential)

1. Login `ceo@xe.vn` / `Xevn@2026` on portal `:8088`.
2. Portal → **Cấu hình HRM** → `/command-center/hrm/settings` — embed `/hr/settings` loads; **no** 429 banner.
3. Exclusive tab deep-link `/hr/settings-catalogs?portal=1&tenantId=xevn&companyId=main` (shared portal tab was soft-nav stolen by concurrent menu QA).
4. Overview: title «Danh mục cài đặt», UF-HRM-10 copy, **Đồng bộ từ XBOS**, form **Thêm / cập nhật mục**, catalog rows visible.
5. Bearer probe `GET /api/hrm/settings-catalogs?company_id=main` → **200** / 76 catalogs / limit **10000**.
6. FE fill Mã=`QAFE071710` · Nhãn=`QA FE Retest 0717` · catalog `activity_capability_map` → **Thêm / cập nhật mục**.
7. Network: `POST …/settings-catalogs/items` → **201** `HRM-SET-201` body `upserted:1, item_key=QAFE071710`.
8. Immediate GET overview + **F5** → **QAFE071710 absent**; ACM `hrmExtensionItems: []`; UI still «HRM +: 0 mục».
9. Repeat create `ADDR_QA993255` on `company_form_presets` → **201**; still absent after refresh probe.
10. Edit existing `ACM_01` → label `HRM-QA-EDIT-16137` → **201**; overview still label **HRM** (XBOS).

Screenshot: `p1-hrm-menu-settings-retest-20260717.png` (agent capture).

---

## UF-HRM-10 / HRM-SC matrix

| UC | Action | Evidence | Verdict |
|----|--------|----------|---------|
| **HRM-SC-01** | `GET /api/hrm/settings-catalogs?company_id=main` | **200** `HRM-SET-200`, **76** catalogs, ~**900–1100 ms**, `x-ratelimit-limit: 10000`. FE tables render. | **PASS** |
| **HRM-SC-02** | `POST …/sync-from-xbos` | Optional — **not re-run** (prior FAIL evidence sync **201**/74 keys). | **⬜ optional** |
| **HRM-SC-03** | `POST …/items` + FE after 2xx + F5 | POST **201** `HRM-SET-201` (create+edit). Overview/F5 **do not** show item / new label. | **FAIL** (persist) |

---

## Network excerpts (no secrets)

```text
GET  /api/hrm/          → 200  x-ratelimit-limit: 10000  (L0 smoke)
GET  /api/hrm/settings-catalogs?company_id=main
  → 200 HRM-SET-200  catalogCount=76  (~1099ms)  remaining≈9999

POST /api/hrm/settings-catalogs/items
  req: {"company_id":"main","category_key":"activity_capability_map",
        "item_key":"QAFE071710","item_name":"QA FE Retest 0717"}
  → 201 HRM-SET-201  {"upserted":1,"item_key":"QAFE071710",
                      "category_key":"activity_capability_map"}

GET  /api/hrm/settings-catalogs?company_id=main  (after POST + F5)
  → 200 HRM-SET-200  — blob has NO "QAFE071710";
     activity_capability_map.hrmExtensionItems = []

POST …/items ACM_01 rename HRM-QA-EDIT-16137 → 201
GET overview ACM_01.label still "HRM" (origin xbos)
```

**0× RATE-429** in this sequential retest.

---

## Defects

| ID | Severity | Summary | Owner hint |
|----|----------|---------|------------|
| **D-HRM-SET-429-01** | — | Concurrent RATE-429 on settings | **CLOSED** by `D-P1-HRM-RATE-429` (limit 10000) under sequential retest |
| **D-HRM-SET-ITEM-PERSIST-01** | **P0** | FE/API POST items returns **201** `HRM-SET-201` but GET overview never includes create/edit (`hrmExtensionItems` empty; XBOS label unchanged). Blocks UF-HRM-10 F5. | **dev-be** |
| **D-HRM-SET-PERF-01** | P1 | Prior sync ~95s — not re-measured | SA NFR / BE (carry) |
| **D-HRM-SET-TAB-NAV-01** | P2 | Portal soft-nav from settings→other HRM menus during concurrent QA; exclusive tab required | FE / QA note |

---

## Residual / not promoted

- UF-HRM-10 🟢 blocked until item create/edit visible after F5
- Optional sync re-run this wave
- HRM-SC-04 removal request FE
- Matrix UF-HRM-10 remains 🔴 (reason: persist, not 429)

---

## Handoff

- **completion_report:** Retest after RATE-429 tune. L0+HRM-SC-01 **PASS** (200/76, no 429). HRM-SC-03 POST **201** but **F5/overview persist FAIL** → overall **FAIL**. Evidence this file.
- **next_owner:** `pm` → **dev-be** `D-HRM-SET-ITEM-PERSIST-01` then **qa** retest
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/p1-hrm-menu-settings-retest-20260717.md`

### next_dispatch_prompt

```text
work_item_id: D-HRM-SET-ITEM-PERSIST-01
to_role: dev-be
entry_criteria: QA retest p1-hrm-menu-settings-retest-20260717.md — RATE-429 closed; POST /api/hrm/settings-catalogs/items returns 201 HRM-SET-201 upserted:1 but GET /api/hrm/settings-catalogs overview does not include created/edited item (hrmExtensionItems empty; ACM_01 label edit not applied). U65 reproduce: ceo@xe.vn → /hr/settings-catalogs → Thêm mục QAFE* → 201 → F5 → row missing.
exit_criteria: Create + edit persist in overview GET and FE after F5; jest/regression on settings-catalogs items write+read; READY_FOR_QA. Evidence docs/qa/evidence/d-hrm-set-item-persist-01-*.md. No seed.
spec_ref: HRM-SC-03 · UF-HRM-10 · docs/hrm/SRS.md settings catalogs
```
