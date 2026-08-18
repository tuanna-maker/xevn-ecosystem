# QA-HRM-CO-EMP-COUNT-01 — Company Management workforce headcount

| Field | Value |
|-------|--------|
| **Date** | 2026-07-27 |
| **Role** | qa |
| **work_item_id** | `QA-HRM-CO-EMP-COUNT-01` |
| **Prior FE** | `docs/qa/evidence/dev-fe-hrm-co-emp-count-01-20260727.md` (`READY_FOR_QA`) |
| **Prior BE** | `docs/qa/evidence/be-hrm-co-emp-count-01-20260727.md` (`READY_FOR_QA`) |
| **BA AC** | `docs/qa/evidence/ba-hrm-co-emp-count-01-20260727.md` (AC-CO-EMP-01..06) |
| **Env** | Portal `:5173` · hrm-api `:28001` · xbos `:28002` · `ceo@xe.vn` / `Xevn@2026` |
| **URL** | `http://127.0.0.1:5173/command-center/hrm/company` → iframe `/hr/company?portal=1&…&companyId=main` |
| **Runner** | `scripts/qa/qa-hrm-co-emp-count-01.mjs` |
| **Runtime** | `docs/qa/evidence/qa-hrm-co-emp-count-01-runtime-20260727.json` |
| **Constraints** | **U65 zero-seed** · **HOLD_DEPLOY** · **NOT** `:8088` · browser-only |
| **Overall** | **PASS** → `ack_status: PASS_TO_PM` |

---

## 0. L0 / stack

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM `:28001` **200** · XBOS `:28002` **200** · portal `:5173` **200** |
| `pnpm run qc:fe-be-health` | **ALL PASS** (login + employees + catalog proxy) |
| Seed | **not used** |

---

## 1. AC matrix (AC-CO-EMP-01..06)

| AC | Criterion | Verdict | Evidence |
|----|-----------|---------|----------|
| **AC-CO-EMP-01** | Card «Tổng nhân viên» > 0 · = summary total | **PASS** | Card DOM **1109** = `GET …/summary?company_id=main` `total=1109` |
| **AC-CO-EMP-02** | Column «Số nhân viên» not all 0 | **PASS** | 5 rows: **229 / 220 / 220 / 220 / 220** (sum **1109**) |
| **AC-CO-EMP-03** | Bridge LE/ĐVTV → slug | **PASS** | Holding→`holding` 229; Visun→`logistics` 220; X.E TMDV→`trsport` 220; X.E Du lịch→`finance` 220; X.E VN→`services` 220 |
| **AC-CO-EMP-04** | No fake all-zero while workforce exists | **PASS** | Not all-zero; unknownRows=0 |
| **AC-CO-EMP-05** | Dashboard parity same session | **PASS** | Company card **1109** = Dashboard UI **1109** = API **1109** (Δ 0%) |
| **AC-CO-EMP-06** | F5 counts remain + CO-BIND | **PASS** | F5 card **1109** · rows still 229/220… · detail founded **19/07/2026** |
| **Network** | `company_id` = main/slug · never LE UUID | **PASS** | cids=`main,holding,trsport,logistics,finance,services` · **0** UUID · all **200** |
| **J-HRM-CO-01** | List → detail → back · headcount OK | **PASS** | Menu → view detail · dialog «Tập đoàn XeVN» · **229 nhân viên** · Escape → list still non-zero |

---

## 2. UF block (browser)

- **Persona / URL / click path:** `ceo@xe.vn` → `http://127.0.0.1:5173/command-center/hrm/company` → iframe Company tab → observe card + table → Dashboard parity → F5 → row ⋯ → `common.viewDetail` → dialog → Đóng
- **Trước:** Incident card/table all 0 vs Dashboard ~1109
- **Action:** Load only (no mutate) + F5 + detail open
- **Network:** `GET /api/hrm/employees/summary?company_id=main` **200** total=1109; then N× slug summaries **200** (interim — see §4)
- **FE sau 2xx:** Card **1109**; table mapped counts; F5 stable
- **F5:** Counts unchanged
- **Verdict:** 🟢
- **spec_ref:** BA AC-CO-EMP-01..06 · matrix `company` · BR-INT-05 · UC-HRM-03

---

## 3. Network proof (authoritative)

### 3.1 Direct API probe (L1 assist — not UF alone)

```http
GET http://127.0.0.1:28001/api/hrm/employees/summary?company_id=main
→ 200 HRM-EMP-SUMMARY-200
company_id=main  total=1109  active_count=1043
by_company=MISSING
```

### 3.2 Browser Network (portal proxy) — Company page load

| Request `company_id` | HTTP | `total` | `by_company` |
|----------------------|------|---------|--------------|
| `main` | **200** | 1109 | absent |
| `holding` | **200** | 229 | absent |
| `trsport` | **200** | 220 | absent |
| `logistics` | **200** | 220 | absent |
| `finance` | **200** | 220 | absent |
| `services` | **200** | 220 | absent |

- **Illegal UUID as count dimension:** **0**
- **Mode:** FE **interim N× slug** (Option B) — live BE **not** serving `by_company` yet (`dist-uat-w6` / process stale vs BE evidence)

### 3.3 Table ↔ Network map

| ĐVTV (UI) | Slug call | Count |
|-----------|-----------|-------|
| Tập đoàn XeVN | `holding` | 229 |
| CP TM&DV X.E | `trsport` | 220 |
| Visun | `logistics` | 220 |
| Du lịch X.E VN | `finance` | 220 |
| X.E Việt Nam | `services` | 220 |
| **Card sum** | `main` + row sum | **1109** |

---

## 4. BE `by_company` note (dispatch residual)

| Item | Status |
|------|--------|
| BE unit evidence claims `by_company` | Present in `be-hrm-co-emp-count-01-20260727.md` |
| Live `:28001` response | **`by_company` MISSING** |
| Product impact this wave | **None for UF** — FE interim N× slug shows correct non-zero counts |
| Hint for PM/DevOps | Restart / redeploy `hrm-api` so live process picks up BE Option A; then FE will auto-prefer `by_company` |

---

## 5. Screenshots

| File | Content |
|------|---------|
| `docs/qa/evidence/qa-hrm-co-emp-count-01-company-20260727.png` | Card 1109 + table non-zero counts |
| `docs/qa/evidence/qa-hrm-co-emp-count-01-dashboard-20260727.png` | Dashboard «Tổng nhân viên» 1109 |
| `docs/qa/evidence/qa-hrm-co-emp-count-01-f5-20260727.png` | After F5 — same counts |
| `docs/qa/evidence/qa-hrm-co-emp-count-01-detail-20260727.png` | J-HRM-CO-01 detail dialog · 229 NV · founded 19/07/2026 |

---

## 6. L2.5

| J-* | Result |
|-----|--------|
| **J-HRM-CO-01** | **PASS** — list → detail dialog (holding) → close → list headcount still 229/220… |

---

## 7. Residuals

| Residual | Sev | Owner | Status |
|----------|-----|--------|--------|
| Live HRM missing `by_company` on summary | P2 | **devops** / **dev-be** | Open — restart hint; UF PASS via FE interim |
| Menu label raw `common.viewDetail` (i18n miss) | P3 | **dev-fe** | Open — does not block headcount AC |
| Holding detail MST shows «-» | P3 | note | Founded date present; Visun/members CO-BIND path unchanged |
| UF-HRM-MENU-15 load-only | — | matrix | Prior load-only PASS **insufficient** — superseded by this AC-CO-EMP PASS |

---

## Completion contract

### completion_report

- **Closed:** AC-CO-EMP-01..06 + Network slug gate + J-HRM-CO-01 on Company Management for Group CEO; U65 zero-seed; browser evidence + screenshots + Network proof.
- **Residual:** Live BE `by_company` not deployed on `:28001` (FE interim OK); P3 i18n `common.viewDetail`.

### next_owner

`pm` → optional **devops** restart hrm-api for `by_company`; **qc** if wave needs gate; matrix note UF-HRM-MENU-15 insufficient unless AC-CO-EMP also cited.

### next_dispatch_prompt

```text
work_item_id: D-HRM-CO-EMP-COUNT-DO-RESTART-01 (optional residual)
from_role: pm
to_role: devops
entry_criteria: QA-HRM-CO-EMP-COUNT-01 PASS_TO_PM — FE interim N× slug PASS; live GET /api/hrm/employees/summary?company_id=main missing by_company
exit_criteria: Restart/rebuild hrm-api :28001 so summary returns by_company[5]; probe total≈1109; no seed.
evidence_path: docs/qa/evidence/devops-hrm-co-emp-by-company-live-20260727.md
ack_status: PASS_TO_PM
Then optional Task qa light retest prefer by_company present OR close residual as defer until next deploy.
```

### evidence_path

`docs/qa/evidence/qa-hrm-co-emp-count-01-20260727.md`

### ack_status

**PASS_TO_PM**
