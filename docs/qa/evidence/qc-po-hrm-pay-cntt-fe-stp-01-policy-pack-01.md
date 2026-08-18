# Evidence — QC-PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-12 |
| **lane** | governance — **narrow C-SLICE** · CHUNG **POLICY-PACK-01** FE only |
| **parent** | `PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01` |
| **qa_ref** | [`qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01-r2.md`](qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01-r2.md) · stamp **`PAYPPQAR2-MSPXZL1G`** |
| **fail_baseline** | [`qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01.md`](qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01.md) · **`PAYPPQA-MSPX1M4T`** (7 defect — CLOSED on R2) |
| **restore_ref** | [`d-pay-cntt-fe-policy-pack-restore-01.md`](d-pay-cntt-fe-policy-pack-restore-01.md) · vitest **20/20** |
| **be_parent** | [`qc-po-hrm-pay-cntt-be-01.md`](qc-po-hrm-pay-cntt-be-01.md) · **`CNTTBEQC1-MSO8HVERQC1`** RETAIN |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | **`PAYPPQC1-MSPXZL1GQC1`** · annotates **`PAYPPQAR2-MSPXZL1G`** |
| **portal_url** | `http://127.0.0.1:5173/hr/payroll/setup?portal=1&…&section=policy-pack` · standalone `:8080` · hrm-api `:28001` |
| **persona** | `ceo@xe.vn` · `company_id=main` · `tenantId=xevn` |
| **U65** | zero-seed · browser FE mutate only — no `pnpm seed:*` |
| **OS honesty** | `payroll_e2e_ready=false` · formula evaluator **HOLD** · `C-SLICE-≠-MODULE` |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** independent QA stamp **`PAYPPQAR2-MSPXZL1G`** on **narrow FE CHUNG POLICY-PACK-01 only** (current code after restore — **not** historical overwrite FAIL):

1. **AC-PAY-STP-01-01** — create CHUNG từ FE · `POST …/pay-policy-packs` **201** · F5 row còn · portal **+** standalone.
2. **AC-PAY-STP-01-02** — edit KPI+BCC · `PATCH` **200** · F5 persist `kpi_threshold=85` · `bcc_std=5000000` · display **5.000.000**.
3. **AC-PAY-STP-01-03** — archive · `POST …/archive` **201** · row ẩn list mặc định + F5.
4. **AC-PAY-STP-01-05** — date order đảo · **NONE** request · message VI «Hiệu lực đến phải sau hiệu lực từ».
5. **AC-PAY-STP-03-01** — KPI=150 · client block · viền đỏ + MSG_KPI_RANGE.
6. **AC-PAY-STP-04-01** — BCC locale vi-VN · body **number thuần** · testid `pay-params-bcc-std` live.
7. **Console / UX hygiene** — 0 Uncaught · không mojibake · không duplicate shell · không GET storm · honesty banner `payroll_e2e_ready=false` retained.
8. **Regression FAIL pack** — 7/7 defect `PAYPPQA-MSPX1M4T` **CLOSED** (create form / onValueChange date+money / KPI string / BCC testid / status labels / vitest 20/20).

**NOT** payroll module UAT · **NOT** `payroll_e2e_ready` flip · **NOT** formula evaluator LIVE · **NOT** RIÊNG / STP-02 / STP-05 / STP-06 · **NOT** UF-HRM-10 · **NOT** Phase 1 DONE · **NOT** J-HRM-07 full promote.

Audited: QA R2 MD + runtime JSON + 32 screens · FAIL baseline · restore handoff · BE GWC parent · `.claude/settings.local.json` path lock · Classification · QC spot-check `qc:fe-be-health` · independent a11y judgement.

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`payroll_e2e_ready`** | **DENY** flip | setup save ≠ kỳ lương E2E |
| **Full UF-HRM-10** | **DENIED** | Settings catalogs ≠ this slice |
| **Formula evaluator LIVE** | **DENIED** | HOLD · FE pass-through only |
| **RIÊNG / STP-02 / 05 / 06** | **DENIED** claim | 5/6 hub nav still placeholder |
| **Seed** | **DENIED** (U65) | rows FE-created · archive FE |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | wording must not imply payroll UAT-ready |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| May PM claim payroll module / UF-HRM-10 UAT DONE? | **NO** |
| May PM claim RIÊNG or STP-02/05/06 DONE? | **NO** |
| May PM annotate **CHUNG POLICY-PACK-01** FE AC-01-01/02/03/05 + 03-01 + 04-01 **CLOSED** with **`PAYPPQAR2-MSPXZL1G`** + **`PAYPPQC1-MSPXZL1GQC1`**? | **YES** (narrow slice only) |
| May PM reopen BE stamp **`CNTTBEQC1-MSO8HVERQC1`**? | **NO** — RETAIN |

---

## Independent judgements (PM-requested)

### (a) Harness FAIL ×2 — có che defect sản phẩm?

| Observation | QC |
|-------------|-----|
| R2 early FAIL = `getByLabel('Tên gói')` hit search · UPPER code vs BE lowercase row testid | **PROCESS / harness** |
| After harness fix (scope fill to `form` · resolve code from POST body) → **6/6 AC PASS** both modes · `defects: []` in JSON | **Product path healthy** |
| Prior FAIL `PAYPPQA-MSPX1M4T` was **real product** (peer overwrite) — closed by restore, **not** by harness | **Product CLOSED** before R2 |

**Verdict (a):** Harness noise **did not** hide open product defects on the **current** code. R2 PASS reflects restored UI. Historical overwrite ≠ design defect; path lock deny `policy-pack/**` confirmed in `.claude/settings.local.json`.

### (b) aria-label — a11y residual?

| Control | Accessible name (live code) |
|---------|-----------------------------|
| Search `Input` | `aria-label="Tìm mã hoặc tên gói"` |
| Name field | `<Label htmlFor="nameVi">Tên gói (VI)</Label>` → **"Tên gói (VI)"** |

Full names **differ** (not identical-name WCAG fail). Playwright / Testing Library **substring** `Tên gói` matches search because that phrase is embedded in the search label → **automation fragility + mild SR ambiguity**.

**QC decision (b):** **YES — residual P2 a11y** (rule `uiux-quality-accessibility`) — **not** product AC blocker.

- **ID:** `DEF-PAY-STP-SEARCH-ARIA-P2`
- **Owner:** `dev-fe`
- **Fix hint:** đổi search `aria-label` → e.g. «Tìm kiếm trong danh sách gói» (tránh substring «Tên gói»); giữ Label form «Tên gói (VI)».
- **Trigger đóng:** vitest/smoke getByLabel('Tên gói (VI)') unique + QA spot harness không nhầm search.

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| L0 portals 200 · login · pay-policy-packs GET 200 | ENV / L0 | **ACCEPT** |
| QC spot `pnpm run qc:fe-be-health` exit **0** | ENV / L0 | **ACCEPT** |
| 6/6 AC mutate FE + F5 both modes | PRODUCT L2.5 | **ACCEPT** |
| Console 0 / no mojibake / no dup header | PRODUCT UX | **ACCEPT** |
| 7 defect FAIL pack CLOSED | PRODUCT P0/P1 | **CLOSED** |
| Harness substring / UPPER code | PROCESS | **OBS** · fixed in R2b · not product NO-GO |
| QA pack verify **2/8** (`command_table` + `journey_l25` missing on QA MD) | PROCESS | **OBS** · QC SoT **8/8** below |
| Search aria substring overlap | PRODUCT a11y P2 | **OPEN residual** · non-blocking |
| Leftover FE rows `qar2porxwdp4` / `qar2staxwdp4` | DATA hygiene | **CARRY** · PM already DISPATCHED QA cleanup |
| RIÊNG + STP-02/05/06 | SCOPE | **OUT** · condition |
| Formula HOLD / `payroll_e2e_ready=false` | GOVERNANCE | **RETAIN** |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01-r2.md` | exit **1** · **2/8** · gap: `command_table`, `journey_l25` on QA MD |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-po-hrm-pay-cntt-fe-stp-01-policy-pack-01.md` | exit **0** · **8/8 PASS** (this SoT) |
| QC spot-check `pnpm run qc:fe-be-health` | **PASS** exit 0 (2026-08-12) |
| QA harness `scripts/qa/_tmp-qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01-r2b.mjs` (cite) | **PASS** · stamp **`PAYPPQAR2-MSPXZL1G`** · `overall: PASS` · `defects: []` |
| Restore vitest 20/20 (cite Dev) | **PASS** |
| BE parent GWC | **RETAIN** **`CNTTBEQC1-MSO8HVERQC1`** |
| Raw JSON | `_tmp-qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01-r2.json` · commit `5ccb26e` |
| Screens | `docs/qa/evidence/screens/qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01-r2/` · **32** files |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` · `:8080` · `:28001` |
| 5 | journey_l25 | ✅ narrow click-path below |
| 6 | crud_or_matrix | ✅ 6 AC matrix |
| 7 | residual_section | ✅ below |
| 8 | timestamp | ✅ 2026-08-12 |

---

## Conditions (GWC)

1. **Honesty:** **DENY** `payroll_e2e_ready` · **DENY** formula LIVE · **DENY** UF-HRM-10 · **DENY** Phase 1 · **DENY** payroll module UAT · seed.
2. **CLOSED (this seat):** CHUNG **POLICY-PACK-01** FE AC-01-01/02/03/05 + 03-01 + 04-01 after **`PAYPPQAR2-MSPXZL1G`** · FAIL pack **CLOSED** · restore path lock retained.
3. **CARRY (out of slice):** RIÊNG + STP-02/05/06 hub placeholders — owner **pm → ba/sa/dev-fe** when program opens next vertical.
4. **CARRY (non-blocking):** Formula evaluator HOLD.
5. **CARRY (non-blocking):** QA cleanup leftover `qar2porxwdp4` / `qar2staxwdp4` via FE «Ngưng áp dụng» (`QA-…-R2-CLEANUP` already DISPATCHED).
6. **OPEN P2:** `DEF-PAY-STP-SEARCH-ARIA-P2` — owner **dev-fe** — disambiguate search `aria-label` (trigger above).
7. **PROCESS (optional):** QA append `command_table` + explicit J-* id to R2 MD for pack verify 8/8 — does not block this GWC.
8. **Parent RETAIN:** **`CNTTBEQC1-MSO8HVERQC1`** BE API slice — not reopened.

---

## J-* / UF (U19)

| ID | Verdict | Notes |
|----|---------|-------|
| **Slice L2.5** hub → Gói chính sách → create/edit/archive/validate (portal + standalone) | **PASS** | Surrogate id **`J-HRM-PAY-STP-01-CHUNG`** (narrow) — click path + Network in QA R2 / JSON; **not** yet a row in `PROGRAM_JOURNEY_MAP.md` |
| **J-HRM-07** (Lương → phiếu lương) | **NOT PROMOTED** | out of slice · payslip journey ≠ setup policy pack |
| **UF-HRM-10** | **NOT PROMOTED** | Settings catalogs · DENIED |
| Register `J-HRM-PAY-STP-01` in journey map | **CARRY** | owner **ba-process** / pm — governance annotate |

**C-SLICE ≠ MODULE:** Sponsor must **not** read this GWC as payroll UAT-ready.

---

## CRUD / AC matrix (narrow)

| AC | Verdict | Evidence |
|----|---------|----------|
| AC-PAY-STP-01-01 create | **PASS** | POST 201 · F5 · both modes · JSON |
| AC-PAY-STP-01-02 edit persist | **PASS** | PATCH 200 · kpi=85 · bcc=5000000 |
| AC-PAY-STP-01-03 archive | **PASS** | POST archive 201 · hide + F5 |
| AC-PAY-STP-01-05 date order | **PASS** | NONE request · VI message |
| AC-PAY-STP-03-01 KPI range | **PASS** | 150 → red border + MSG |
| AC-PAY-STP-04-01 BCC locale | **PASS** | 5.000.000 · number body |
| testid registry | **PASS** | list/save/archive/kpi/bcc/row-{code} |
| RIÊNG / STP-02/05/06 | **NOT_RUN** | out of scope |

---

## Residual

| ID | Sev | Status | Owner | Trigger đóng |
|----|-----|--------|-------|----------------|
| **R-PAY-STP-RIENG** (+ STP-02/05/06) | INFO | OPEN · out of slice | pm → ba/sa → dev-fe | program vertical open + FE screens |
| **formula HOLD** | INFO | OPEN | sa / be per API-01 | HOLD lift decision |
| **`payroll_e2e_ready=false`** | INFO | LOCK | pm | DENY until full payroll gate |
| **`DEF-PAY-STP-SEARCH-ARIA-P2`** | **P2** | OPEN | **dev-fe** | unique search aria; harness spot |
| Leftover `qar2porxwdp4` / `qar2staxwdp4` | P3 | CARRY | qa (cleanup WI) | FE archive both |
| Journey map register STP-01 | PROCESS | CARRY | ba-process | row in `PROGRAM_JOURNEY_MAP.md` |
| QA pack 2/8 on R2 MD | PROCESS | OBS | qa optional | append command_table + J-* |

**No residual PRODUCT P0/P1** blocking this narrow GWC.

---

## must_keep RETAIN (explicit)

| Stamp / lock | Note |
|--------------|------|
| **`CNTTBEQC1-MSO8HVERQC1`** | BE CNTT API · **DENY reopen** |
| **`payroll_e2e_ready=false`** | GOVERNANCE lock |
| Formula HOLD | FE no eval |
| CHUNG-only | ≠ RIÊNG claim |
| Path lock `.claude/settings.local.json` deny `policy-pack/**` | anti-overwrite |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → seal bus · matrix annotate POLICY-PACK-01 CLOSED · dispatch **dev-fe** P2 aria **or** next vertical RIÊNG/STP (U88) |
| **evidence_path** | `docs/qa/evidence/qc-po-hrm-pay-cntt-fe-stp-01-policy-pack-01.md` |
| **completion_report** | GWC after **`PAYPPQAR2-MSPXZL1G`**: CHUNG POLICY-PACK-01 FE 6/6 AC **CLOSED** both surfaces · 7 FAIL defects **CLOSED** · harness noise **non-masking** · **P2** search aria residual · **DENY** payroll module / `payroll_e2e_ready` / RIÊNG/STP-02/05/06 / UF-HRM-10 · BE parent **RETAIN** · stamp **`PAYPPQC1-MSPXZL1GQC1`**. QA pack **2/8 OBS**; QC SoT **8/8**. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: D-PAY-STP-SEARCH-ARIA-P2-01
role: dev-fe
lane: execution
parent: QC-PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01
read_first:
  - docs/qa/evidence/qc-po-hrm-pay-cntt-fe-stp-01-policy-pack-01.md  # GWC PAYPPQC1-MSPXZL1GQC1 · DEF-PAY-STP-SEARCH-ARIA-P2
  - apps/web/hrm/src/components/payroll/policy-pack/PolicyPackSetupScreen.tsx  # aria-label search L187 vs Label nameVi
entry_criteria: QC GWC sealed; change_mode FIX narrow a11y only
scope: Đổi aria-label ô tìm kiếm (vd. «Tìm kiếm trong danh sách gói») để không substring-collide với «Tên gói (VI)»; giữ Label form; không đụng AC mutate / archive / honesty banner
exit_criteria: vitest PolicyPackSetupScreen vẫn PASS; getByLabel('Tên gói (VI)') unique; evidence ngắn
allowed_paths: PolicyPackSetupScreen.tsx (+test nếu cần)
forbidden: apps/api/** · seed · flip payroll_e2e_ready · RIÊNG/STP-02/05/06 scope creep · rewrite form bind
must_keep: PAYPPQC1-MSPXZL1GQC1 · CNTTBEQC1-MSO8HVERQC1 · payroll_e2e_ready=false · CHUNG-only · U65
evidence_path: docs/qa/evidence/d-pay-stp-search-aria-p2-01.md
ack_status target: READY_FOR_QA
```

**Alternate (U88 program vertical — nếu PM ưu tiên mở RIÊNG trước P2):**

```text
work_item_id: BA-PO-HRM-PAY-CNTT-FE-STP-02-RIENG-01
role: ba-process
lane: governance
read_first:
  - docs/qa/evidence/qc-po-hrm-pay-cntt-fe-stp-01-policy-pack-01.md
  - docs/program/specs/PO-HRM-PAY-CNTT-FE-STP-01-SRS-01.md
entry: POLICY-PACK-01 CHUNG GWC sealed; hub 5/6 placeholder
exit: AC pack RIÊNG / STP-02 scope + journey id đề xuất J-HRM-PAY-STP-02
cấm: claim POLICY-PACK-01 reopen; flip payroll_e2e_ready
evidence_path: docs/program/specs/BA-PO-HRM-PAY-CNTT-FE-STP-02-RIENG-01.md
```
