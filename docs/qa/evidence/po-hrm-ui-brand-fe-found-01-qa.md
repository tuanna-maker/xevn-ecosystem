# PO-HRM-UI-BRAND-FE-FOUND-01-QA — W2 modal chrome + shell (browser)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-FE-FOUND-01-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Lane** | execution · U65 zero-seed |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §7 · §10 **Accepted** |
| **FE evidence (entry)** | `docs/qa/evidence/po-hrm-ui-brand-fe-found-01.md` (`READY_FOR_QA`) |
| **R1 fix entry** | `docs/qa/evidence/po-hrm-ui-brand-fe-found-01-r1.md` (`READY_FOR_QA`) |
| **Sibling** | `docs/qa/evidence/po-hrm-ui-brand-fe-foundation-01-qa.md` (token gate PASS — not re-opened) |
| **ack_status** | **PASS_TO_PM** (R1 closed) |
| **commit** | `dc930c5` |

---

## 0. R1 retest closed (2026-08-05)

| Field | Value |
|-------|--------|
| **Prior FAIL** | DialogTitle computed **17.5px** / weight **600** (§4 below — historical) |
| **R1 fix** | absolute `20px` floor + weight **700** under html 14px root |
| **R1 verdict** | **PASS** — title **20px** / **700** / `#111827`; bar chrome kept |

### R1 commands

```bash
pnpm run verify:xevn:theme-contrast -- --strict
# exit 0 — token lockstep PASS · STRICT PASS 0 pale hits (scanned 598)

node scripts/qa/_tmp-po-hrm-ui-brand-fe-found-01-qa.mjs
# exit 0 — verdict PASS · ack_status PASS_TO_PM
```

Machine JSON: `docs/qa/evidence/_tmp-po-hrm-ui-brand-fe-found-01-qa.json`  
Screens: `docs/qa/evidence/screens/po-hrm-ui-brand-fe-found-01-qa/`

### R1 browser — EMP Import (ceo@xe.vn)

| Check | Evidence | Verdict |
|-------|----------|---------|
| Path | `/hr/employees?portal=1&…` → click **Import** → «Import nhân viên từ Excel» | — |
| L0 | hrm / xbos / portal all **HTTP 200** | **PASS** |
| `.xevn-dialog-surface` | **true** | **PASS** (kept) |
| Thin primary bar `::before` | `rgb(30, 64, 175)` = **`#1E40AF`** · **height 3px** | **PASS** (kept) |
| Title color | `rgb(17, 24, 39)` = **`#111827`** | **PASS** |
| Title weight | computed **`700`** | **PASS** (was 600) |
| Title size ≥20px | computed **`20px`** | **PASS** (was 17.5px) |

### R1 matrix rollup

| # | Exit criteria | Result |
|---|---------------|--------|
| 1 | `verify:xevn:theme-contrast --strict` exit 0 | **PASS** |
| 2 | Portal shell primary `#1E40AF` / sharp text / no purple AI | **PASS** |
| 3a | Dialog thin primary brand bar + surface | **PASS** |
| 3b | Dialog title ≥20 bold ~`#111827` | **PASS** (20px / 700 / `#111827`) |

**Overall R1:** **PASS_TO_PM** — residual R1 title floor **closed**.

**Cấm honored:** no remaster DONE · no Attendance CLOSED · no product GO · no seed · no W3 reopen.

---

## 1. Scope

| In scope | Out of scope (cấm claim) |
|----------|--------------------------|
| `verify:xevn:theme-contrast -- --strict` regression | Remaster DONE / 177 screens |
| Portal shell primary `#1E40AF` + sharp text | Attendance product CLOSED |
| HRM embed Dialog: `.xevn-dialog-surface` + thin primary bar + title ≥20 bold `#111827` | Product / QC GO |
| | W3 `text-muted-foreground` label debt |
| | Seed / re-dispatch W3 |

---

## 2. L0 + commands (initial wave — historical)

| Check | Result |
|-------|--------|
| L0 entry (initial) | **PARTIAL** — hrm `:28001` 200; xbos `:28002` down (`dist/main` MODULE_NOT_FOUND under nest `--watch`); portal later recovered |
| L0 before browser | **PASS** — hrm / xbos / portal `:5173` all **HTTP 200** |
| Seed | **none** (U65) |

```bash
pnpm run verify:xevn:theme-contrast -- --strict
# exit 0 — token lockstep PASS · STRICT PASS 0 pale hits (scanned 598)
```

Browser harness: `node scripts/qa/_tmp-po-hrm-ui-brand-fe-found-01-qa.mjs`  
Machine JSON: `docs/qa/evidence/_tmp-po-hrm-ui-brand-fe-found-01-qa.json`  
Screens: `docs/qa/evidence/screens/po-hrm-ui-brand-fe-found-01-qa/`

---

## 3. Browser — portal shell (ceo@xe.vn)

| Check | Evidence | Verdict |
|-------|----------|---------|
| Persona | `ceo@xe.vn` / API login via portal proxy → inject session | PASS |
| URL | `http://127.0.0.1:5173/command-center?tenantId=xevn&companyId=main` | — |
| `--xevn-color-primary` | `#1e40af` → **`#1E40AF`** | **PASS** |
| `--xevn-color-text` / body | `#111827` / `rgb(17, 24, 39)` | **PASS** |
| Secondary / muted tokens | `#4b5563` / `#6b7280` | PASS (spot) |
| Purple AI theme | primary locked `#1E40AF`; no purple/indigo palette on shell | **PASS** |

---

## 4. Browser — HRM Dialog chrome (EMP Import) — pre-R1 FAIL (historical)

| Check | Evidence | Verdict |
|-------|----------|---------|
| Path | `/hr/employees` → click **Import** → dialog «Import nhân viên từ Excel» | — |
| `.xevn-dialog-surface` on content | **true** (classes include `xevn-dialog-surface`) | **PASS** |
| Thin primary bar `::before` | `background-color: rgb(30, 64, 175)` = **`#1E40AF`** · **height 3px** | **PASS** |
| Title color | `rgb(17, 24, 39)` = **`#111827`** | **PASS** |
| Title weight | computed **`600`** (class has `font-bold`; not 700) | **WARN** → **closed in R1** (now 700) |
| Title size ≥20px | computed **`17.5px`** | **FAIL** → **closed in R1** (now 20px) |

### Root cause (title floor) — fixed in R1

| Fact | Value |
|------|-------|
| `html` / `body` font-size | **14px** (ops density root) |
| DialogTitle classes (pre-R1) | `xevn-type-title text-xl font-bold … text-xevn-text` |
| `--xevn-type-title-min` (pre-R1) | `1.25rem` |
| Computed (pre-R1) | `1.25rem × 14px = **17.5px**` &lt; ADR/skill **≥20px absolute** |
| R1 fix | `--xevn-type-title-min: 20px` + `text-[20px]` + weight **700** |

ADR §7 type floors + §10 modal: title ≥20 bold `#111827`. Rem-based floor under 14px root does **not** meet absolute 20px — addressed by absolute `px` floor in R1.

---

## 5. Matrix rollup (pre-R1 — historical)

| # | Exit criteria | Result (pre-R1) | R1 |
|---|---------------|-----------------|-----|
| 1 | `verify:xevn:theme-contrast --strict` exit 0 | **PASS** | **PASS** |
| 2 | Portal shell primary `#1E40AF` / sharp text / no purple AI | **PASS** | **PASS** |
| 3a | Dialog thin primary brand bar + surface | **PASS** | **PASS** |
| 3b | Dialog title ≥20 bold ~`#111827` | **FAIL** (17.5px; weight 600) | **PASS** (20px / 700) |

**Pre-R1 overall:** **FAIL_TO_PM** — foundation contrast + bar chrome OK; title absolute floor not met.  
**R1 overall:** **PASS_TO_PM** — see §0.

**Cấm honored:** no remaster DONE · no Attendance CLOSED · no product GO · no seed · no W3 re-dispatch · W3 muted-foreground debt not failed here.

---

## 6. Residual

| ID | Item | Owner | Priority |
|----|------|-------|----------|
| ~~**R1**~~ | DialogTitle / `.xevn-type-title` absolute ≥20px + bold ≥700 | **dev-fe** | **CLOSED** (R1 retest PASS) |
| R2 | nest `--watch` often empties `dist/main` — use durable start (OBS; devops wave separate) | devops (OBS) | P2 |
| R3 | W3 label remaster (`text-muted-foreground`) | already in flight — **do not** re-dispatch | — |

---

## 7. Handoff

```yaml
work_item_id: PO-HRM-UI-BRAND-FE-FOUND-01-QA
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-ui-brand-fe-found-01-qa.md
completion_report: |
  R1 retest PASS. theme-contrast --strict exit 0.
  EMP Import dialog «Import nhân viên từ Excel»:
  title computed 20px / font-weight 700 / #111827;
  .xevn-dialog-surface + 3px #1E40AF bar kept PASS.
  Prior FAIL 17.5px/600 CLOSED. Not remaster DONE / ATT CLOSED / product GO.
next_owner: pm
next_dispatch_prompt: |
  work_item_id: PO-HRM-UI-BRAND-FE-FOUND-01-QA
  from_role: qa
  to_role: pm
  ack_status: PASS_TO_PM
  evidence: docs/qa/evidence/po-hrm-ui-brand-fe-found-01-qa.md §0 R1 CLOSED
  computed: DialogTitle 20px / 700 / #111827 · bar 3px #1E40AF · surface PASS
  next: continue W3 brand seats already DISPATCHED (e.g. W3-ATT-B) or next open brand backlog seat;
        do NOT invent remaster DONE / Attendance CLOSED / reopen W3 for this residual
  optional: QC spot-check modal chrome only if wave gate needs it — not product GO
  cấm: remaster DONE · Attendance CLOSED · seed · reopen closed R1
```
