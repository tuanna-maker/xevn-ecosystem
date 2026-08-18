# QA — QA-PCOMP-W6-BROWSER-XBOS-DEEP-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PCOMP-W6-BROWSER-XBOS-DEEP-01` |
| **from_role** | `qa` |
| **to_role** | `pm` / `qc` |
| **execution_date** | `2026-07-27` |
| **environment** | Local portal `http://127.0.0.1:5173` · xbos-api `:28002` · hrm-api `:28001` |
| **persona** | Group CEO `ceo@xe.vn` · Member negative `du-lich.ceo@xe.vn` |
| **HOLD_DEPLOY** | **honored** — **NOT** `:8088` · **NOT** Phase1/PROD |
| **U65** | zero-seed — **none** (`pnpm seed:*` / inbox seed **not** run) |
| **HRM freeze** | `dist-uat-w6` PID **27096** — no nest rebuild |
| **Overall** | **PASS_WITH_CONDITIONS** (P0 critical 🟢; UF-08 🟡 U65 BLOCKED) |
| **ack_status** | **PASS_TO_PM** |
| **Matrix :8088 rewrite** | **NOT claimed** |

---

## spec_read_ack

| Artifact | Sections read |
|----------|----------------|
| `_vibe-team-os/09-TEAM-OPERATING-MODEL.md` | §6 QA |
| `_vibe-team-os/roles/qa.md` | L2.5; cấm PASS không chạy |
| `_vibe-team-os/incidents/INC-QA-EVIDENCE-WITHOUT-RUN.md` | command+exit + screens |
| `docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md` | Wave 1 rules + UF-XBOS-01..15 |
| `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` | §2–§3 XBOS |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | J-CC-01..03 · J-XBOS-01 |

---

## Command table

| # | Command | Result / exit |
|---|---------|----------------|
| 1 | `pnpm run qc:dev-stack` | ✓ hrm `:28001` · ✓ xbos `:28002` · ✓ portal `:5173` (Windows UV abort noise after probes) |
| 2 | Process audit `dist-uat-w6` | PID **27096** `node --enable-source-maps dist-uat-w6/main.js` |
| 3 | `pnpm run qc:fe-be-health` | **exit 0** ALL PASS |
| 4 | `NODE_PATH=… node scripts/qa/_tmp-uf05-shr-probe.mjs` | **exit 0** — POST shareholders **201** `XBOS-SHR-201` |
| 5 | `NODE_PATH=… node scripts/qa/qa-pcomp-w6-browser-xbos-deep-01.mjs` | **exit 0** · `PASS_WITH_CONDITIONS` |
| 6 | Runtime JSON | `docs/qa/evidence/_tmp-qa-pcomp-w6-browser-xbos-deep-01-runtime.json` |
| 7 | Screens dir | `docs/qa/evidence/qa-pcomp-w6-browser-xbos-deep-01-screens/` |

**Did not:** `pnpm seed:*` · `seed:workflow:inbox` · touch `:8088` · nest rebuild HRM · rewrite matrix Dev8088 flags.

---

## Rollup (this WI)

| UF-ID | Verdict | Notes |
|-------|---------|-------|
| **UF-XBOS-01** | 🟢 | UI login → CC shell |
| **UF-XBOS-02** | 🟢 | Member units list (TẬP ĐOÀN + members) |
| **UF-XBOS-03** | 🟡 | Form mutate attempted; PUT network not closed this WI |
| **UF-XBOS-05** | 🟢 | Holding shareholder mutate → 2xx → toast → API F5 |
| **UF-XBOS-07** | 🟡 | RACI tab present; cell toggle not completed |
| **UF-XBOS-08** | 🟡 | **U65 BLOCKED** — no FE-created WF→inbox Duyệt; cấm seed |
| **UF-XBOS-10** | 🟢 | KPI rollup **200**; no 409 |
| **UF-XBOS-11** | 🟢 | Member GMU **403** · KPI holding **409** |
| UF-04/06/09/12/13/14/15 | ⬜ | Out of timebox (deep P0 prioritized) |

**P0 must:** 01🟢 · 05🟢 · 08🟡 · 10🟢 · 11🟢

---

## UF evidence blocks

### UF-XBOS-01

- **Persona / URL / click path:** `ceo@xe.vn` · `http://127.0.0.1:5173/login` → fill Email/Mật khẩu → **Đăng nhập** → `/command-center`
- **Before mutate snapshot:** login form (defaults cleared then typed)
- **Action → Lưu:** Đăng nhập (auth)
- **Network:** UI form submit → navigate CC
- **FE sau 2xx:** CC shell `rootLen≈281k`; widgets **Việc cần xử lý** / KPI rail visible; no Vite overlay
- **F5 persist:** session stays on `/command-center` (not bounced to `/login`)
- **Screenshot:** `docs/qa/evidence/qa-pcomp-w6-browser-xbos-deep-01-screens/uf01-command-center.png`
- **Verdict:** 🟢
- **spec_ref:** UC-XBOS-AUTH-01 · J-CC-01

### UF-XBOS-02

- **Persona / URL / click path:** `ceo@xe.vn` · `/command-center?settings=company_member_units`
- **Before:** list load
- **Action:** view Danh sách pháp nhân
- **Network:** GET legal-entities / group-member-units **200**
- **FE sau:** rows **TẬP ĐOÀN**, **XE_DU_LICH**, **Chỉnh sửa** visible
- **F5:** list reload via settings URL
- **Screenshot:** `…/uf02-member-units.png`
- **Verdict:** 🟢
- **spec_ref:** UC-CC-03 · J-XBOS-03

### UF-XBOS-05

- **Persona / URL / click path:** `ceo@xe.vn` · Đơn vị thành viên → row **TẬP ĐOÀN** → **Chỉnh sửa** → **Danh sách Cổ đông** → **+ Thêm cổ đông** → fill → **Lưu cổ đông** (green ✓)
- **Before mutate snapshot:** shareholder section present; holding LE `20109cf3-0621-4921-baf7-f820be944731`
- **Action → Lưu:** stamp `QA-W6-SHR-2MW9J8` · ratio `1.5` · contributed `2.500.000` (vi-VN group) → Lưu cổ đông
- **Network POST/PUT 2xx:**
  - Probe (same day): **POST** `…/legal-entities/20109cf3-…/shareholders` → **201** `XBOS-SHR-201` (`_tmp-uf05-probe.json`)
  - Full harness final: **PUT 200** `…/shareholders/b1fb6e20-…` body `holderName=QA-W6-SHR-2MW9J8` `ratioPercent=1.5` `contributedValue=2500000`
- **FE sau 2xx:** toast **«Đã lưu cổ đông…»**
- **F5 persist:** API GET shareholders contains `QA-W6-SHR-2MW9J8` after reload+re-open (`apiHas=true`; DOM scroll partial)
- **Screenshot:** `…/uf05-after-save.png` · `…/uf05-after-f5.png` · probe `…/uf05-probe.png`
- **Verdict:** 🟢
- **spec_ref:** UC-CC-P0-01 · J-CC-02

### UF-XBOS-08

- **Persona / URL / click path:** `ceo@xe.vn` · `?settings=workflow` → CC **Việc cần xử lý** observe
- **Before:** workflow settings reachable
- **Action → Lưu:** create→inbox→Duyệt **not completed** without seed
- **Network:** workflow-engine tasks / catalog inbox GETs **200** (observe only)
- **FE sau 2xx:** n/a mutate
- **F5:** n/a
- **Screenshot:** `…/uf08-workflow-settings.png` · `…/uf08-inbox.png`
- **Verdict:** 🟡 **BLOCKED U65** — empty FE-created approve chain; **cấm** `seed:workflow:inbox`
- **spec_ref:** UC-XBOS-WF · J-XBOS-01 · U65

### UF-XBOS-10

- **Persona / URL / click path:** `ceo@xe.vn` · `/command-center` KPI rail
- **Before:** n/a read
- **Action:** load dashboard
- **Network:** GET `/api/xbos/kpi-engine/rollup?tenantId=xevn&companyId=main` → **200**; portal-alerts **200**; API corroboration **200**
- **FE sau:** KPI / Việc cần xử lý widgets; **no** 409 banner
- **F5:** reload OK
- **Screenshot:** `…/uf10-kpi-dashboard.png`
- **Verdict:** 🟢
- **spec_ref:** UC-XBOS-KPI · J-CC-03

### UF-XBOS-11

- **Persona / URL / click path:** `du-lich.ceo@xe.vn` · UI login → `/command-center`
- **Before:** n/a negative
- **Action:** attempt holding rollup APIs with member token
- **Network:**
  - GMU → **403** `XBOS-TENANT-403` («Group member units require master tenant membership»)
  - KPI `companyId=main` → **409** `SCOPE_CONTEXT_MISMATCH` (token `xe-du-lich` vs request `xevn`)
- **FE sau:** member CC shell loads (scope enforced at API)
- **F5:** n/a
- **Screenshot:** `…/uf11-member-login.png` · `…/uf11-member-cc.png`
- **Verdict:** 🟢
- **spec_ref:** U28-R2 · UF-XBOS-11

### UF-XBOS-03 (partial)

- **Click path:** XE_DU_LICH → Chỉnh sửa → mutate **Tên tiếng Việt** → Lưu thay đổi
- **Network:** PUT legal-entities **not closed** in harness capture this WI
- **Verdict:** 🟡
- **spec_ref:** UC-XBOS-ORG-03
- **Screenshot:** `…/uf03-after-save.png`

### UF-XBOS-07 (partial)

- **Click path:** holding edit → tab **Nhiệm vụ & RACI**
- **FE:** matrix chrome present
- **Verdict:** 🟡 (tab only; no cell PUT)
- **spec_ref:** UC-CC-RACI
- **Screenshot:** `…/uf07-raci-tab.png`

---

## L2.5 / journey_l25

| J-ID | Slice | Outcome |
|------|-------|---------|
| **J-CC-01** | Login → CC | **PASS** (UF-01) |
| **J-CC-02** | Holding shareholder mutate | **PASS** (UF-05) |
| **J-CC-03** | KPI rollup no 409 | **PASS** (UF-10) |
| **J-XBOS-01** | WF inbox approve | **BLOCKED U65** (UF-08 🟡) |

---

## Residual

| Item | Severity | Owner | Notes |
|------|----------|-------|-------|
| UF-XBOS-08 create WF → inbox → Duyệt full chain from FE | P1 | pm → dev-fe/qa | U65 — no seed; needs FE create path closed |
| UF-XBOS-03 PUT network + F5 | P2 | qa later | Partial form mutate only |
| UF-XBOS-07 RACI cell toggle+PUT | P2 | qa later | Tab present |
| UF-04/06/09/12/13/14/15 deep browser | P2 | qa later | Out of this WI timebox |
| HOLD_DEPLOY / `:8088` / Phase1 / PROD | standing | pm | **Not claimed** |
| Matrix §3 Dev8088 flags | — | — | **Not rewritten** (local W6 only) |

---

## Classification

| Finding | Type | Gate impact |
|---------|------|-------------|
| P0 UF-01/05/10/11 browser PASS local `:5173` | PRODUCT | **PASS_WITH_CONDITIONS** |
| UF-08 U65 BLOCKED (no seed) | PROCESS / U65 | Condition OK — not fake 🟢 |
| HOLD_DEPLOY | Governance | Honored |

---

## Handoff

```yaml
work_item_id: QA-PCOMP-W6-BROWSER-XBOS-DEEP-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/qa-pcomp-w6-browser-xbos-deep-01-20260727.md
next_owner: qc
completion_report: |
  Closed P0 XBOS deep browser on :5173 (U65, HOLD_DEPLOY):
  UF-01/02/05/10/11 🟢; UF-08 🟡 U65 BLOCKED (no inbox seed);
  UF-03/07 🟡 partial. HRM dist-uat-w6 freeze kept. NOT :8088 / Phase1 / PROD.
next_dispatch_prompt: |
  work_item_id: QC-PCOMP-W6-BROWSER-XBOS-DEEP-01
  from_role: pm
  to_role: qc
  entry_criteria: QA PASS_WITH_CONDITIONS evidence docs/qa/evidence/qa-pcomp-w6-browser-xbos-deep-01-20260727.md;
    verify command table + UF blocks + screens; U65 no-seed honored; HOLD_DEPLOY
  exit_criteria: GO or GWC with residual owners (UF-08 U65 condition OK);
    cấm promote matrix :8088; cấm claim Phase1/PROD
  evidence_path: docs/qa/evidence/qc-pcomp-w6-browser-xbos-deep-01-20260727.md
```
