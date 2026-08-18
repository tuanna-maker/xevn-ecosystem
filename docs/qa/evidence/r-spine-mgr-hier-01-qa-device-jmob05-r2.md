# R-SPINE-MGR-HIER-01-QA-DEVICE-JMOB05-R2 — J-MOB-05 Option A (device retest)

| Field | Value |
|-------|--------|
| **work_item_id** | `R-SPINE-MGR-HIER-01-QA-DEVICE-JMOB05-R2` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **lane** | execution |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **startedAt** | `2026-08-03T16:03:46.269Z` (preflight) / finish wave `16:09:26Z` |
| **finishedAt** | `2026-08-03T16:10:58.802Z` |
| **ack_status** | **PASS_TO_PM** |
| **spec_ref** | FR-UC-H03 · J-MOB-05 · BA Option A · BR-MOB-MGR-REPORTS-01 |
| **entry** | BE READY [`r-spine-mgr-hier-01-persona-lock.md`](r-spine-mgr-hier-01-persona-lock.md) · Prior FAIL [`r-spine-mgr-hier-01-qa-device-jmob05.md`](r-spine-mgr-hier-01-qa-device-jmob05.md) |
| **U65** | **honored** — no `pnpm seed:*` · no DB fake · no Option C · **not** `ceo@xe.vn` as L1 |
| **U76** | `hdsd_align: true` — inventory below |
| **U78** | [`r-spine-mgr-hier-01-qa-device-jmob05-r2-test-log.md`](r-spine-mgr-hier-01-qa-device-jmob05-r2-test-log.md) · [`.json`](r-spine-mgr-hier-01-qa-device-jmob05-r2-test-log.json) |
| **device** | `emulator-5554` · `vn.xevn.hrm.mobile` 1.0.0 |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` · 71,602,307 B · SHA256 `AB93DA36B9B44776764268F994873FFB2E77A1E1F2B9C1701610C5A65433F5AB` |
| **API** | Host `http://127.0.0.1:28001` · Emulator `http://10.0.2.2:28001` |
| **screens** | `docs/qa/evidence/screens/r-spine-mgr-hier-01-qa-device-jmob05-r2/` |
| **runtime** | `_preflight.json` · `_run.json` · `_finish.json` · `_merged.json` |
| **AT-01** | **not reopened** |

---

## Executive verdict

**🟢 PASS_TO_PM** — After PERSONA-LOCK, `uat.nv0001` mounts **ManagerApprovals**; Duyệt leave `ac9db485` (UAT-0003 → HLD-0001) succeeds; F5 + API queue clear for that đơn.

| AC | Result |
|----|--------|
| AC-1 Login `uat.nv0001` → `is_manager=true` / roles include `manager` | 🟢 `roles=["employee","manager"]` · `home_is_manager=true` |
| AC-2 ManagerApprovals mounts (not only Thông báo) | 🟢 Path A tile **«Duyệt»** → Phê duyệt · Nghỉ phép (2) |
| AC-3 Nghỉ phép ≥1 (submitter leave) | 🟢 reused FE leave `ac9db485…` unpaid pending (U65 — no reseed) |
| AC-4 Duyệt 2xx / UI success | 🟢 confirm «Duyệt đơn?» → «Đã duyệt đơn nghỉ phép» |
| AC-5 F5 queue clear for submitter leave | 🟢 UI Nghỉ phép **(2→1)** · UAT NV 0003 gone · API `knownPending=false` |
| AC-6 Holding UUID (not `main`) | 🟢 `10000000-0000-4000-8000-000000000001` |
| AC-7 U65 / no ceo L1 / no Option C | 🟢 |

**Not claimed:** UAT DONE · Phase 1 DONE · invent leave L2 ladder · Option C.

---

## Persona lock (honored)

| Role | Account | Employee |
|------|---------|----------|
| Submitter (prior FE) | `uat.nv0003@xe.vn` / `xevn-uat-2026` | UAT-0003 · `manager_id`=HLD-0001 |
| Approver L1 | `uat.nv0001@xe.vn` / `xevn-uat-2026` | HLD-0001 |
| **Cấm** | `ceo@xe.vn` as L1 | Option C not used |

---

## Preflight (read-only)

| Probe | Result |
|-------|--------|
| L0 `:28001/api/hrm` | **200** |
| Login `uat.nv0001` | `roles=employee,manager` · `is_manager=true` · JWT roles same |
| Home summary `viewer.is_manager` | **true** · `manager_pending.total_count=2` |
| Leave pending mgr filter | **total=2** incl. `ac9db485` from UAT-0003 |
| Hierarchy UAT-0003→HLD-0001 | **ok** |
| Holding UUID ≠ `main` | **ok** |

---

## Click path (HDSD)

### Approver — HLD-0001

1. Deep-link login → **Trang chủ** · tile label **«Duyệt»** + `home-action-tile-approve` (`f11-home.png` / `30-mgr-home.png`)
2. Tap approve tile → **Phê duyệt** · tabs Tất cả (2) / Nghỉ phép (2) · rows UAT NV 0003 + UAT NV 0020 (`f20-approvals.png`) — **not** Thông báo-only
3. Tab **Nghỉ phép (2)** → tap **Duyệt** on UAT NV 0003 unpaid row
4. Confirm dialog «Duyệt đơn?» → tap button **Duyệt** (`f40-confirm.png`)
5. FE toast/banner: **«Đã duyệt đơn nghỉ phép»** · counts **Tất cả (1) / Nghỉ phép (1)** (`f50-after-confirm.png`)
6. Pull-to-refresh F5 → UAT NV 0003 gone; only UAT NV 0020 remains (`f60-f5.png`)
7. API GET leave pending mgr: **total=1** · `ac9db485` **not** in pending · `fromSub=[]`

### Submitter leave source

- Reused prior U65 FE submit leave `ac9db485-5d4f-4d77-9d25-114b157f70cf` (unpaid) — no new seed; no Option C.

---

## hdsd_inventory (U76)

| # | Surface | Found | Used | Verdict |
|---|---------|-------|------|---------|
| 1 | Trang chủ approver | Yes | Login | 🟢 |
| 2 | Tile «Duyệt» / `home-action-tile-approve` | Yes | Open ManagerApprovals | 🟢 |
| 3 | ManagerApprovals / Nghỉ phép (n) | Yes | Queue ≥1 | 🟢 |
| 4 | Duyệt CTA + confirm «Duyệt đơn?» | Yes | Approve | 🟢 |
| 5 | FE after 2xx «Đã duyệt…» + F5 | Yes | Clear submitter row | 🟢 |
| 6 | ceo as L1 / seed | Not used | — | 🟢 |

---

## case_matrix

| Case | Intent | Verdict | Note |
|------|--------|---------|------|
| **A fail deep** | Prior emp lock → Thông báo | 🟢 closed by PERSONA-LOCK | R1 FAIL root fixed |
| **B success HDSD** | ManagerApprovals Duyệt → F5 | 🟢 | ac9db485 cleared |
| **C logic BR** | L1=direct_manager; BR-MOB-MGR-REPORTS-01; U65 | 🟢 | reports>0 → manager role |

---

## Defects / residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| Harness false-PASS wave1 | P3 process | qa-device | First `_run.json` marked ok without confirm dialog — corrected by `_finish.json` (API assert). Do not trust UI-only leaveAfter≠null. |
| Leave UAT-0020 still pending | P3 out-of-scope | — | Other report leave; not submitter AC |
| Leave balance 0/0 annual (prior) | P2 | data | Unpaid path used in R1 submit — not reopened |

**AT-01 nav QC GWC:** not touched.

---

## completion_report

Closed **J-MOB-05 Option A R2** on device after BE PERSONA-LOCK. `uat.nv0001` login unlocks manager (`is_manager=true`) despite `mobile_persona=emp`. ManagerApprovals mounts via home **Duyệt** tile. Duyệt leave `ac9db485` (UAT-0003) → UI «Đã duyệt đơn nghỉ phép» → F5 Nghỉ phép 2→1 → API pending cleared for that id. Holding UUID verified. U65 / no ceo L1 / no Option C honored. **No UAT/Phase1 DONE claim.**

## next_owner

`pm` → optional **qc** narrow gate on J-MOB-05 R2 evidence; residual UAT-0020 leave out of scope.

## next_dispatch_prompt

```text
work_item_id: R-SPINE-MGR-HIER-01-QC-JMOB05-R2
from_role: pm
to_role: qc
lane: governance
priority: P1
entry: qa-device PASS_TO_PM docs/qa/evidence/r-spine-mgr-hier-01-qa-device-jmob05-r2.md
audit: ManagerApprovals mount + Duyệt ac9db485 cleared (API+F5) · U65 · test-log pair U78
cấm: claim UAT DONE · reopen AT-01 unless regression
evidence_path: docs/qa/evidence/r-spine-mgr-hier-01-qc-jmob05-r2.md
```

## ack_status

**PASS_TO_PM**
