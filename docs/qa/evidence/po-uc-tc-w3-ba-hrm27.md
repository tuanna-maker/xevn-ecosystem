# Evidence — PO-UC-TC-W3-BA-HRM27

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W3-BA-HRM27` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-08-04 |
| **priority** | P0 |
| **ack_status** | **PASS_TO_PM** |
| **u65_zero_seed** | true |
| **uat_done** | **false** |
| **verdict** | **BACKLOG-HOLD** |

---

## 1. Mission

W2 synth flagged `UC-HRM-27` as `code_readiness: GAP` (STT 351 «Embed — Quyết định và báo cáo (backlog)»). BA must decide **SHIP-NOW / BACKLOG-HOLD / SPEC_GAP** before any Dev rewrite.

**Cấm đã giữ:** không `apps/**` · không invent UAT PASS · không invent Leave L2.

---

## 2. Spec says / code does

### 2.1 Spec says (SoT conflict — resolve)

| Source | Says |
|--------|------|
| `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` STT **351** | `UC-HRM-27` · **Embed — Quyết định và báo cáo (backlog)** · TechSpec HE §9.3 · API «Một phần» · **waived** · FE |
| `BANG_TONG_HOP_USECASE_XEVN.md` / BRD ecosystem STT 351 | Same backlog label «Quyết định **và báo cáo**» |
| **`docs/hrm/SRS.md` UC-HRM-27** (SoT module) | **Embed: quyết định nhân sự** — live REST; empty OK; **Báo cáo `/reports` = UC/menu khác** — cấm gộp DONE với quyết định |
| `docs/hrm/BANG_TONG_HOP_USECASE_HRM.md` STT **104** | `UC-HRM-27` · Quyết định nhân sự · **Implemented-empty; fidelity open** |
| `docs/hrm/TECHSPEC.md` §11.2 / §16.5 #50 / G-DEC-01 | `decisions` live CRUD codes `HRM-DEC-200/201`; **G-DEC-01 density CLOSED** 2026-07-22; product DONE = **AC-DEC-DONE** only; **`reports` = Mock; backlog BRD** |
| AC measurable (SRS) | **AC-DEC-01..04** + **AC-DEC-DENSITY** + **AC-DEC-DONE gate** — đủ cho decisions; không còn «API chưa có» |
| TECHSPEC_HE §9.3 | Layering HRM generic (Controller→Service) — **không** mô tả decisions/reports product slice |
| SRS_VN / brand-new SRS_VN | **Không** map riêng UC-HRM-27 trong sweep grep — `srs_new` = **N/A-DELTA** (đúng inventory W1) |
| UF matrix | **UF-HRM-MENU-05** Decisions 🟢 density 2026-07-22 (**không** = UC-27 product DONE); **UF-HRM-MENU-16** Reports load 🟢 sweep — menu **tách** |

**Resolution (BA):** SoT nghiệp vụ UC-HRM-27 = **`docs/hrm/SRS.md` + TECHSPEC HRM + menu matrix** — decisions only. Ecosystem STT 351 name «…và báo cáo (backlog)» = **stale alias / waived** — không được dùng làm brief Dev rewrite gộp 2 menu.

### 2.2 Code does (read-only)

| Surface | Evidence |
|---------|----------|
| FE Decisions | `apps/web/hrm/src/pages/Decisions.tsx` · route `/decisions` · `@CODE-MEMORY` UC-HRM-27 / FR-HRM-27 |
| FE hooks/lib | `useDecisions.ts` · `decisionListUi.ts` (+ tests) |
| Nav / embed | `AppSidebar` `nav.decisions` → `/decisions`; portal `hrmWorkspaceEmbedApi` loads metadata on `decisions` view |
| BE | `apps/api/hrm-api/src/decisions/decisions.controller.ts` + `.service.ts` (+ spec) |
| FE Reports (OUT of UC-27) | `pages/Reports.tsx` · `/reports` · module `reports` — tách route; TECHSPEC mock/backlog |
| Runtime QA | `build-gap-decision-list-ui-01-qa.md` L2 load + empty honesty; `qc-hrm-g-dec-01-density-01` GWC density |

**code_readiness correction:** W1 by-uc `GAP` là **sai honest** khi API+UI+density evidence đã tồn tại → phải **`PARTIAL`** (product DONE vẫn mở theo AC-DEC-DONE — **không** claim IMPL/UAT DONE).

---

## 3. Verdict

### **BACKLOG-HOLD** (W3 Dev rewrite / GAP greenfield)

| Dimension | Decision |
|-----------|----------|
| **Primary W3** | **BACKLOG-HOLD** — **không** dispatch Dev rewrite «UC-HRM-27 backlog» như GAP greenfield |
| **Not SPEC_GAP** | Decisions đã có SRS AC + BR + TechSpec map + OpenAPI path — đủ neo; thiếu không phải «không biết làm gì» |
| **Not SHIP-NOW (W3 rewrite)** | Spine decisions đã live; G-DEC-01 CLOSED; residual = **product DONE gate / fidelity** (AC-DEC-DONE), không phải thiếu scaffold |
| **«và báo cáo»** | **OUT of UC-HRM-27** — HOLD riêng; trigger = BRD/UC reports live API (không gắn STT 351 Dev) |

### defer_reason

1. Ecosystem STT 351 label gộp «Quyết định và báo cáo (backlog)» **lệch** HRM SoT (decisions only; reports separate).
2. Runtime **đã có** FE+BE decisions; matrix PHASE1 đánh **waived**; UF-HRM-MENU-05 density 🟢 — GAP inventory W1 = false positive.
3. Dev rewrite trên brief STT 351 rủi ro **đè** vùng 🟢 decisions / invent gộp reports vào UC-27 (vi phạm preserve + SRS split).
4. TECHSPEC_HE §9.3 không đủ product contract cho «reports ship»; reports vẫn mock per TECHSPEC §11.2.

### trigger_to_reopen

| # | Trigger | Then |
|---|---------|------|
| **T1** | Sponsor / PM mở wave **AC-DEC-DONE** (product fidelity: AC-DEC-01..04 + density + QC evidence U65 FE mutate, zero-seed) | **SHIP-NOW** slice **decisions-only** — Dev/QA theo SRS AC-DEC-*; **không** đụng `/reports` |
| **T2** | BRD/SRS mở UC riêng **Reports live API** (thay mock §11.2) + TechSpec/DB/API | New `work_item_id` (không reuse GAP rewrite UC-27) |
| **T3** | Governance rename STT 351 alias → khớp `BANG_TONG_HOP_USECASE_HRM` «Quyết định nhân sự» | ba-docs / matrix hygiene — không bắt Dev |

---

## 4. SHIP-NOW packet (chỉ khi T1 — copy sẵn, không dispatch W3)

Nếu PM reopen T1:

**AC (decisions-only — đã có trong SRS; không invent):**

| AC | Pass (measurable) |
|----|-------------------|
| AC-DEC-01 | Menu Quyết định → GET `/api/hrm/decisions` 200 `HRM-DEC-200`; không Sync ERROR |
| AC-DEC-02 | `total:0` → copy «Không có quyết định nào»; cấm «chưa triển khai API» |
| AC-DEC-03 | `total≥1` → row thật; list→detail GET `:id` 200; scope parity |
| AC-DEC-04 | FE Lưu → POST 201 → FE sau 2xx + **F5** còn row (U65) |
| AC-DEC-DENSITY | ≥1 QSĐ / pilot company sau FE create (hoặc seed chỉ khi sponsor bootstrap cùng message) |
| AC-DEC-DONE | QC/QA evidence đủ AC trên — mới claim UC-27 product DONE |

**allowed_paths hint (T1 only):**

```text
apps/web/hrm/src/pages/Decisions.tsx
apps/web/hrm/src/hooks/useDecisions.ts
apps/web/hrm/src/lib/decisionListUi.ts
apps/api/hrm-api/src/decisions/**
# OUT: apps/web/hrm/src/pages/Reports.tsx · reports components
```

**must_keep:** empty copy BR-DEC-03; scope ladder; decision_types picker; U65 zero-seed; không claim Phase1/PROD.

---

## 5. by-uc update

| Field | Before (W1) | After (W3 BA) |
|-------|-------------|---------------|
| `code_readiness` | `GAP` | **`PARTIAL`** |
| `code_note` | Matrix waived/FE backlog — GAP honest | Decisions live FE+BE; G-DEC-01 CLOSED; product DONE = AC-DEC-DONE; reports OUT; W3 **BACKLOG-HOLD** rewrite |
| `uat_done` | false | **false** (unchanged) |
| name_vi note | backlog gộp báo cáo | Align SoT: quyết định nhân sự; «và báo cáo» = stale ecosystem alias |

File: `docs/qa/professional/by-uc/UC-HRM-27.md`

---

## 6. Impact on W2 GAP rollup

- W2 MASTER GAP count có thể giảm **1** khi re-synth/hygiene (150/82/**4**/8) — PM optional MASTER delta; **không** claim UAT.
- W3 P0 execution ưu tiên vẫn **XBOS-DM-09** / **XBOS-DM-LOG-09**; **không** Task Dev UC-HRM-27 rewrite trên brief STT 351.

---

## 7. completion_report

**Closed**

- Triage UC-HRM-27: spec vs code; SoT = HRM SRS decisions-only.
- Verdict **BACKLOG-HOLD** cho W3 Dev rewrite; không SPEC_GAP; không SHIP-NOW greenfield.
- `code_readiness` GAP→**PARTIAL**; defer_reason + trigger_to_reopen T1–T3.
- Evidence path này + by-uc updated.

**Residual / open**

- AC-DEC-DONE product gate vẫn mở (fidelity) — chỉ reopen khi T1.
- Reports mock backlog — UC/menu riêng (T2).
- Ecosystem STT 351 name hygiene (T3) — ba-docs optional.
- Leave L2 vẫn SPEC_GAP riêng — không liên quan HRM-27.

---

## 8. next_owner

**pm**

---

## 9. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-UC-TC-W3-PM-HRM27-HOLD
from_role: ba-process
to_role: pm
lane: governance
priority: P0
ack_status_target: recorded

## CONTEXT
PO-UC-TC-W3-BA-HRM27 CLOSED. Verdict: BACKLOG-HOLD — do NOT dispatch Dev rewrite for UC-HRM-27 as GAP greenfield.

## FACTS
- SoT: docs/hrm/SRS.md UC-HRM-27 = quyết định nhân sự (live API+UI); /reports OUT of UC-27
- code_readiness: PARTIAL (was false GAP); G-DEC-01 density CLOSED; uat_done false; AC-DEC-DONE still open
- STT 351 ecosystem label «Quyết định và báo cáo (backlog)» = stale/waived alias
- evidence: docs/qa/evidence/po-uc-tc-w3-ba-hrm27.md
- by-uc: docs/qa/professional/by-uc/UC-HRM-27.md

## PM ACTIONS (same session)
1) Bus INTAKE: UC-HRM-27 W3 = BACKLOG-HOLD; remove from Dev GAP rewrite queue
2) Continue W3 execution: PO-UC-TC-W3-BE-DM09 / LOG-09 (not HRM-27 Dev)
3) Optional hygiene (not blocking): ba-docs rename STT 351 alias to match BANG_TONG_HOP_HRM «Quyết định nhân sự»
4) Do NOT open Dev for Reports under UC-HRM-27
5) Reopen SHIP-NOW decisions-only only if sponsor/PM triggers AC-DEC-DONE wave (T1 in evidence §3)

## CẤM
Dev rewrite STT 351 gộp reports · invent UAT PASS · Leave L2 invent · seed for evidence
```

---

## 10. Handoff fields

| Field | Value |
|-------|--------|
| completion_report | §7 |
| next_owner | pm |
| next_dispatch_prompt | §9 |
| evidence_path | `docs/qa/evidence/po-uc-tc-w3-ba-hrm27.md` |
| ack_status | **PASS_TO_PM** |
| verdict | **BACKLOG-HOLD** |
| code_readiness | **PARTIAL** |

---

*PO-UC-TC-W3-BA-HRM27 · ba-process · 2026-08-04*
