# Evidence — `PO-UC-TC-W4-BE-SYNC-XBOSS-500-QA`

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-UC-TC-W4-BE-SYNC-XBOSS-500-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P0 |
| **ack_status** | **PASS_TO_PM** |
| **u65_zero_seed** | true |
| **hdsd_align** | true |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **portal** | `http://127.0.0.1:5173` |
| **UC** | XBOS-DM-HRM-10 · UC-HRM-06 |
| **prior_be** | [`po-uc-tc-w4-be-sync-xboss-500.md`](po-uc-tc-w4-be-sync-xboss-500.md) READY_FOR_QA |
| **prior_fail** | [`po-uc-tc-w4-qa-e3-hrm-em-rollup.md`](po-uc-tc-w4-qa-e3-hrm-em-rollup.md) FE sync **500** |
| **runtime_json** | `docs/qa/evidence/_tmp-po-uc-tc-w4-be-sync-xboss-500-qa-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-be-sync-xboss-500-qa/` |
| **script** | `scripts/qa/_tmp-po-uc-tc-w4-be-sync-xboss-500-qa-browser.mjs` |

> **Không claim:** Phase1 / UAT DONE · Leave L2 · apply-to-members = pull · clone = sync.

---

## L0 stack

| Probe | Result |
|-------|--------|
| hrm-api `:28001` | **200** |
| xbos-api `:28002` | **200** |
| web-portal `:5173` | **200** |
| Seed | **không** chạy `pnpm seed:*` |

---

## HDSD inventory (U76)

1. Login UI `ceo@xe.vn` / `Xevn@2026` → Command Center (`POST …/auth/login` **201** `XBOS-AUTH-200`)
2. Deep-link HRM **Danh mục cài đặt** `/hr/settings-catalogs?portal=1&tenantId=xevn&companyId=main`
3. Click **Đồng bộ từ XBOS** (pull) — **≠** Áp dụng danh mục · **≠** Sao chép
4. Quan sát toast + Network 2xx + F5 list còn dữ liệu

---

## must_keep — catalog SoT

| Thao tác | UC | Observed | Used as PASS? |
|----------|-----|----------|---------------|
| Pull / sync XBOS→HRM | **XBOS-DM-HRM-10** / **UC-HRM-06** | `POST /api/hrm/settings-catalogs/sync-from-xbos` **201** `HRM-SET-201` | **Yes** |
| Apply-to-members | DM-HRM-07 | **0** hits | — |
| Clone / clone-bundle | DM-09 / LOG-09 | **0** hits | — |
| Leave L2 | — | **not touched** | — |

---

## Browser results (U65)

| Step / TC | Verdict | Evidence |
|-----------|---------|----------|
| L0 | 🟢 PASS | hrm/xbos/portal 200 |
| LOGIN | 🟢 PASS | UI login 201 XBOS-AUTH-200 → `/command-center` |
| OPEN DM-HRM-10 / UC-HRM-06 | 🟢 PASS | `hasSync=true` · not apply/clone panel |
| ACT DM-HRM-10 / UC-HRM-06 | 🟢 PASS | POST sync-from-xbos **201** `HRM-SET-201` · **pulledKeys=74** |
| FE toast | 🟢 PASS | `Đã kéo 74 danh mục vào HRM` |
| RELOAD F5 | 🟢 PASS | GET settings-catalogs **200** `HRM-SET-200` ×3 · list populated |
| NET no apply/clone | 🟢 PASS | apply=0 · clone=0 |

### Sample Network (no secrets)

```text
POST /api/xbos/auth/login → 201 XBOS-AUTH-200
POST /api/hrm/settings-catalogs/sync-from-xbos → 201 HRM-SET-201 { pulledKeys: 74 }
GET  /api/hrm/settings-catalogs → 200 HRM-SET-200  (after F5)
# apply-to-members / clone / clone-bundle: 0 hits
```

### Click path

```text
Login UI → /command-center
→ /hr/settings-catalogs?portal=1&tenantId=xevn&companyId=main
→ click «Đồng bộ từ XBOS»
→ toast «Đã kéo 74 danh mục vào HRM»
→ F5 → catalogs still populated
```

---

## by-uc honesty stamp

Updated:

- `docs/qa/professional/by-uc/XBOS-DM-HRM-10.md` — `execution: UI_PASS` · `uat_done: false`
- `docs/qa/professional/by-uc/UC-HRM-06.md` — `execution: UI_PASS` · `uat_done: false`

Residual **R-E3-SYNC-500** = **CLOSED** (browser retest).

---

## Residual / not promoted

| ID | Sev | Status | Note |
|----|-----|--------|------|
| **R-E3-SYNC-500** | P0 | **CLOSED** | FE sync-from-xbos 201 after BE parallel/fail-fast fix |
| **R-E3-AU-MEMBER-LOGIN** | P1 | open (out of scope) | `du-lich.ceo` login 500 — not this WI |
| Leave L2 | — | — | not invented |
| Phase1 / UAT DONE | — | — | **not claimed** (`uat_done: false`) |

---

## Handoff

```
work_item_id: PO-UC-TC-W4-BE-SYNC-XBOSS-500-QA
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-uc-tc-w4-be-sync-xboss-500-qa.md
completion_report: Browser U65 PASS — CEO settings-catalogs Đồng bộ từ XBOS → 201 HRM-SET-201 pulledKeys=74 · toast · F5 GET 200 · 0 apply/clone. by-uc DM-HRM-10 + UC-HRM-06 UI_PASS; uat_done false. R-E3-SYNC-500 CLOSED.
next_owner: pm
```

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-BE-SYNC-XBOSS-500-QC
from_role: pm
to_role: qc
lane: governance
ack_status_target: PASS_TO_PM
priority: P0

entry_criteria:
- QA PASS docs/qa/evidence/po-uc-tc-w4-be-sync-xboss-500-qa.md
- BE fix docs/qa/evidence/po-uc-tc-w4-be-sync-xboss-500.md
- by-uc XBOS-DM-HRM-10 + UC-HRM-06 execution UI_PASS; uat_done false

exit_criteria:
- Audit browser evidence: POST sync-from-xbos 201 HRM-SET-201 · toast pulled · F5 · 0 apply/clone
- Confirm residual R-E3-SYNC-500 CLOSED; no Leave L2 invent; U65 zero-seed
- Gate note GO/GWC for this P0 only (not Phase1 UAT DONE)
- evidence_path: docs/qa/evidence/po-uc-tc-w4-be-sync-xboss-500-qc.md
```
