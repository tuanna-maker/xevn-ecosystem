# Evidence rollup — PO-UC-TC-W4-QA-E3-HRM-EM

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-E3-HRM-EM` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-04 |
| **u65_zero_seed** | true |
| **hdsd_align** | true |
| **persona** | `ceo@xe.vn` holding (`companyId=main`) |
| **portal** | `http://127.0.0.1:5173` |
| **commit** | `dc930c5` |
| **runtime_json** | `docs/qa/evidence/_tmp-po-uc-tc-w4-qa-e3-hrm-em-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e3-hrm-em/` |
| **script** | `scripts/qa/_tmp-po-uc-tc-w4-qa-e3-hrm-em-browser.mjs` |

> **Không claim:** Phase1 / UAT DONE · Leave L2 · apply-to-members (DM-HRM-07) = pull/sync · clone (DM-09) = sync.

---

## L0 stack

| Probe | Result |
|-------|--------|
| hrm-api `:28001` | **200** (restarted mid-wave after JWT flap) |
| xbos-api `:28002` | **200** (must load `deploy/xevn-ecosystem/.env` — bare `node dist/main` without env → JWT mismatch) |
| web-portal `:5173` | **200** |
| Seed | **không** chạy `pnpm seed:*` |

---

## HDSD inventory (U76)

1. Login UI `ceo@xe.vn` / `Xevn@2026` → Command Center  
2. HRM **Nhân viên** `/hr/employees?portal=1&companyId=main` — list · **Thêm nhân viên** · Lưu · row→profile (J-HRM-02) · Sửa/PATCH  
3. HRM **Danh mục cài đặt** `/hr/settings-catalogs` — nút **Đồng bộ từ XBOS** (`POST …/settings-catalogs/sync-from-xbos`) — **≠** Áp dụng danh mục · **≠** Sao chép  
4. Cùng màn — form **Thêm / cập nhật mục** (`#ext-code` / `#ext-label`) → extension mutate  
5. AU member: `du-lich.ceo@xe.vn` vs `companyId=main` (attempted)

---

## must_keep — catalog SoT (DOMAIN §2)

| Thao tác | UC | Path observed this wave | Used as PASS? |
|----------|-----|-------------------------|---------------|
| Pull / sync XBOS→HRM | **XBOS-DM-HRM-10** / **UC-HRM-06** | `POST /api/hrm/settings-catalogs/sync-from-xbos` | Attempted (see FAIL 500) |
| Tenant extension | **XBOS-DM-HRM-03** | `POST /api/hrm/settings-catalogs/items` → `HRM-SET-201` (prior iter) | Yes when green |
| Apply-to-members | DM-HRM-07 | **not** navigated / **0** apply hits | — |
| Clone / clone-bundle | DM-09 / LOG-09 | **0** clone hits | — |

---

## UC verdicts (browser P0)

| UC | Verdict | P0 evidence |
|----|---------|-------------|
| **HRM-EM-01** | 🟢 **PASS** | OPEN · FD empty required · POST **201** `HRM-EMP-201` · F5 stamp visible |
| **HRM-EM-02** | 🟡 **PARTIAL** | LIST GET **200** total≥53 · DETAIL/J-HRM-02 GET **200** profile · AU member **BLOCKED** (`du-lich.ceo` login HTTP **500**) |
| **HRM-EM-03** | 🟢 **PASS** | OPEN profile · FD empty name · PATCH **200** `HRM-EMP-202` · F5 |
| **XBOS-DM-HRM-03** | 🟡 **PARTIAL** | OPEN+FD disabled empty 🟢 · HP **201** `HRM-SET-201` evidenced earlier same work_item; final iter flake (add disabled after sync 500) |
| **XBOS-DM-HRM-10** | 🔴 **FAIL** | OPEN 🟢 · FE click **Đồng bộ từ XBOS** → Network **500** on `sync-from-xbos` (not apply/clone) · F5 GET catalogs still 2xx |
| **UC-HRM-06** | 🔴 **FAIL** | Same consumer surface/path as DM-HRM-10 — ACT FAIL with sync **500** |

### Sample Network (no secrets)

```text
POST /api/hrm/employees → 201 HRM-EMP-201
PATCH /api/hrm/employees/{id} → 200 HRM-EMP-202
POST /api/hrm/settings-catalogs/items → 201 HRM-SET-201   (prior green iter)
POST /api/hrm/settings-catalogs/sync-from-xbos → 500       (final browser — FAIL)
# apply-to-members /clone: 0 hits
```

### Aux probe (not UF PASS alone)

After XBOS restarted **with** deploy `.env`: API `POST sync-from-xbos` → **201** `HRM-SET-201` `pulledKeys=74`. Browser session later still observed **500** — residual product/runtime, not “wrong panel”.

---

## by-uc honesty stamp

Updated `docs/qa/professional/by-uc/{HRM-EM-01,HRM-EM-02,HRM-EM-03,XBOS-DM-HRM-03,XBOS-DM-HRM-10,UC-HRM-06}.md`:

- `execution` per UC table above  
- `uat_done`: **false** (design pack ≠ full UAT / Phase1)

---

## Residual → PM dispatch

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-E3-SYNC-500** | P0 | **dev-be** (+ devops if env) | FE `POST …/sync-from-xbos` **500** under CEO session; confirm stack env JWT + Nest error log; must_keep ≠ apply/clone |
| **R-E3-AU-MEMBER-LOGIN** | P1 | **dev-be** / devops | `du-lich.ceo@xe.vn` login **500** — blocks EM-02 AU |
| **R-E3-DM03-FLAKE** | P2 | qa | Extension HP green earlier; retest after sync-500 recovery |
| Leave L2 | — | — | **not touched** |
| Phase1 / UAT DONE | — | — | **not claimed** |

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-QA-E3-HRM-EM
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e3-hrm-em-rollup.md
next_owner: pm
```

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-QA-E3-HRM-EM-INTAKE
from_role: pm
to_role: dev-be
lane: execution
ack_status_target: READY_FOR_QA
priority: P0
u65_zero_seed: true

INTAKE QA PASS_TO_PM rollup:
  evidence: docs/qa/evidence/po-uc-tc-w4-qa-e3-hrm-em-rollup.md
  PASS: HRM-EM-01, HRM-EM-03 (browser U65)
  PARTIAL: HRM-EM-02 (AU member login 500); XBOS-DM-HRM-03 (HP green earlier, flake after sync fail)
  FAIL P0: XBOS-DM-HRM-10 + UC-HRM-06 — FE POST /api/hrm/settings-catalogs/sync-from-xbos → 500
  must_keep: ≠ apply-to-members · ≠ clone · Leave L2 untouched
  entry: reproduce CEO /hr/settings-catalogs → Đồng bộ từ XBOS; capture Nest stack for 500
  exit: browser sync 2xx HRM-SET-201 + FE toast + F5; READY_FOR_QA
  parallel optional: fix du-lich.ceo login 500 for AU
```
