# QA-HDSD-BF-XBOS-WF-01 — BF-01 XBOS WF spot (Canvas + Inbox + RACI)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HDSD-BF-XBOS-WF-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · BF-01 |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | UF-XBOS-10 🟢 · CC inbox action cards 🟢 · RACI matrix no 409 🟢 |
| **executed_at** | 2026-08-01 ~01:25 ICT |
| **URL** | `http://127.0.0.1:5173` |
| **persona** | Group CEO `ceo@xe.vn` / `company_id=main` |
| **U65** | zero-seed · browser Puppeteer · no seed · canvas load-only (must_keep TC-HDSD-04-02-01) |
| **spec_ref** | `HDSD_BF_TC_MAP_DELTA.md` §4.1–4.3 · `qa-hdsd-bf-01-canvas-01-20260801.md` (canvas 🟢 preserved) |
| **runtime** | `docs/qa/evidence/_tmp-qa-hdsd-bf-xbos-wf-01-runtime.json` |
| **harness** | `scripts/qa/qa-hdsd-bf-xbos-wf-01-browser.mjs` |

---

## Executive summary

**PASS_TO_PM** — Three BF-01 XBOS spot checks passed on portal `:5173` under U65: **UF-XBOS-10** workflow canvas loads with dots + definitions GET 200 (no save/mutate — TC-HDSD-04-02-01 regression preserved); **CC inbox** shows **22** action cards each with **Xử lý nhanh** (`tasks` GET 200); **RACI matrix** on member **XE_DU_LICH** (legal-entity UUID) tab loads **GET 200** with **0×409** (scope parity OK vs historical P1-FIX-RACI-SCOPE-01).

---

## L0

| Gate | Exit | Notes |
|------|------|-------|
| `pnpm run qc:dev-stack` | **0** | hrm-api :28001 · xbos-api :28002 · portal :5173 HTTP 200 |
| `pnpm run qc:fe-be-health` | **0** | ALL PASS — proxy HRM employees + catalog-sync |

---

## Verdict matrix

| ID | HDSD / UF | Criterion | Verdict | Notes |
|----|-----------|-----------|---------|-------|
| **UF-XBOS-10** | §4.2 Canvas | Workflow canvas load (load-only) | **🟢** | `settings=workflow_designer` → Canvas · dots=true · defs GET 200 · no POST/PUT save |
| **CC-INBOX-ACTION-CARDS** | §4.1 Inbox | Action cards visible | **🟢** | 22 cards · 22 action buttons · GET tasks 200 · no ERROR banner |
| **RACI-MATRIX-NO-409** | §4.3 RACI | Matrix tab load no 409 | **🟢** | XE_DU_LICH edit → tab Nhiệm vụ & RACI · matrix GET 200 · 409=0 |

---

## UF-XBOS-10 — Workflow canvas (must_keep regression)

### Click path

```
Login ceo@xe.vn → /command-center?settings=workflow_designer
→ Canvas / Quy trình sub-nav
→ observe canvas dots + workflow UI (NO Lưu quy trình — load-only)
```

### Network

```http
GET /api/xbos/workflow-engine/definitions → 200
(no POST/PUT definition — must_keep TC-HDSD-04-02-01 from QA-HDSD-BF-01-CANVAS-01)
```

### FE after load

| Check | Result |
|-------|--------|
| Canvas dots | yes |
| Workflow text | yes |
| Save clicked | **no** (regression guard) |
| Console 409 | none |

Screen: `docs/qa/evidence/screens/hdsd-bf-xbos-wf-01-20260801/01-wf-canvas.png`

---

## CC-INBOX-ACTION-CARDS — §4.1 Hộp thư Workflow

### Click path

```
/command-center/inbox
→ observe [data-testid=cc-inbox-task-card] rows + Xử lý nhanh buttons
```

### Network

```http
GET /api/xbos/workflow-engine/tasks?status=pending&assigneeUserId=ceo%40xe.vn → 200
```

### FE

| Check | Result |
|-------|--------|
| Card count | **22** |
| Action buttons (Xử lý nhanh) | **22** |
| Sample card type | hrm_leave · Phê duyệt đơn nghỉ phép HRM |
| ERROR banner | none |

Screen: `docs/qa/evidence/screens/hdsd-bf-xbos-wf-01-20260801/02-inbox.png`

---

## RACI-MATRIX-NO-409 — §4.3 Ma trận RACI

### Click path

```
/command-center?settings=company_member_units
→ row XE_DU_LICH → Chỉnh sửa
→ tab [role=tab] «Nhiệm vụ & RACI»
→ Ma trận RACI sub-view loads
```

### Network

```http
GET /api/xbos/raci-governance/companies/3f379019-dc02-427e-83d0-2bc7871e90f9/matrix?domain=ban_dieu_hanh → 200
GET /api/xbos/raci-governance/companies/3f379019-dc02-427e-83d0-2bc7871e90f9/coverage → 200
GET /api/xbos/raci-governance/catalog → 200
```

| Check | Result |
|-------|--------|
| Member legal-entity UUID | `3f379019-dc02-427e-83d0-2bc7871e90f9` (XE_DU_LICH) |
| HTTP 409 | **0** |
| Tab aria-selected | true |
| Matrix UI | Ma trận RACI visible |

Screen: `docs/qa/evidence/screens/hdsd-bf-xbos-wf-01-20260801/03-raci-matrix.png`

---

## Console

No blocking console errors captured.

---

## Residual / not promoted

| Item | Severity | Owner | Note |
|------|----------|-------|------|
| Full BF-01 e2e (YCTD→inbox→funnel) | — | qa | Out of scope — see `QA-HDSD-BF-01-01` / YCTD form-ready carry |
| RACI cell PUT mutate | — | qa | Load-only this WI — §4.3 TC-XBOS-HDSD-124..131 full matrix in BF-01-01 |
| Canvas save/F5 persist | — | — | Intentionally skipped — must_keep from QA-HDSD-BF-01-CANVAS-01 |

**Promoted:** UF-XBOS-10 load 🟢 · CC inbox cards 🟢 · member RACI matrix scope parity 🟢

---

## completion_report

**Closed:** BF-01 XBOS WF spot — UF-XBOS-10 canvas load (no regression on TC-HDSD-04-02-01), CC inbox 22 action cards with quick-action buttons, RACI matrix tab on XE_DU_LICH member UUID GET 200 / 0×409.

**Open:** Full BF-01 Đ3 spine (55 TC) and YCTD mutate remain on separate WIs.

---

## next_owner

`pm` → chain **QA-HDSD-BF-01-01** full BF-01 e2e when YCTD form-ready unblocked, or parallel **QC** spot audit if release gate

---

## next_dispatch_prompt

```
work_item_id: QA-HDSD-BF-01-01
from_role: pm | to_role: qa
entry_criteria: QA-HDSD-BF-XBOS-WF-01 PASS 🟢; QA-HDSD-BF-01-CANVAS-01 canvas 🟢; L0 :5173 exit 0; YCTD form-ready unblocked (or scope inbox-only subset)
exit_criteria: BF-01 spine Canvas→YCTD→inbox→funnel U65; HDSD §4.1–4.5 + HRM recruitment tabs; evidence docs/qa/evidence/qa-hdsd-bf-01-01-20260801.md
cấm: seed · regression UF-XBOS-10 🟢
ack_status: PASS_TO_PM or FAIL_TO_PM with route/API owner
```

---

## Handoff

```yaml
work_item_id: QA-HDSD-BF-XBOS-WF-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/qa-hdsd-bf-xbos-wf-01-20260801.md
pm_dispatch_hint: BF-01 XBOS spots 🟢 — proceed QA-HDSD-BF-01-01 full path when YCTD unblocked
```
