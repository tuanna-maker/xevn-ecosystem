# PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-ENGINE-SA-01 — Option/F.1 · leave accrual **engine** residual **F-ATT-LEAVE-04** (formula runtime HOLD)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-ENGINE-SA-01` |
| **Parent chain** | ATT-LEAVE-BALANCE QC-02 **GWC SEALED** · `R-PLT-ATT-LVRULE-CNS-WIRE` **CLOSED** · [`ATT-LVRULE-FE-01G-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-FE-01G-SA-01.md) Option **B LOCKED** · [`FE-ADMIN-REOPEN-GATE-BA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-FE-ADMIN-REOPEN-GATE-BA-01.md) **CONFIRMED** SPEC 20612 |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` · U88 continuous governance after FE-ADMIN reopen-gate |
| **lane** | governance · sa |
| **priority** | P2 |
| **change_mode** | **ADD** Option/F.1 disposition for **accrue engine / formula runtime** · **NO CODE** `apps/**` · **no seed** · **no wipe** L1/CNS/KEY seals · **no reopen** FE 01g |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — Option **B** **LOCKED** · **ACCEPT_AS_IS_P2 HOLD** · mint residual **`R-PLT-ATT-LVRULE-ENGINE-01`** |
| **prior_seals** | ATT leave-type L1 · ATT-CODE `ATTCODEQA-MSK4T1A5` · ATT-WS · ATT-SHIFT `ATTSHIFTQA-MSK5FXP3` · admin L1 `ATTLVRULEQA-MSK6G783` · CNS-WIRE `ATTLVRULEQA2-MSK79F2F` · COMP OTC-03 CLOSED · OT-TYPE L1 · EMP/SI/CTR/PAY — **RETAIN** |
| **ref_schema_sa** | [`ATT-LEAVE-BALANCE-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md) Option B DEFINE `att_leave_accrual_policy` · **L-ATT-LVRULE-08 Engine OUT** |
| **ref_fe_residual** | [`ATT-LVRULE-FE-01G-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-FE-01G-SA-01.md) — **R-PLT-ATT-LVRULE-FE-01g** ACCEPT_AS_IS_P2 HOLD · **≠** unlock path for engine |
| **ref_ba** | [`ATT-LEAVE-BALANCE-BA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01.md) **BR-PLT-ATT-LVRULE-09** · **UC-PLT-ATT-LVRULE-08** Engine non-claim |
| **ref_api** | [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) **F-ATT-LEAVE-04** accrue outline · F-ATT-LVRULE-01..04 **LIVE** (catalog) |
| **ref_peer_engine** | PAY-CATALOG Option B — catalog SoT **≠** formula LIVE · OT-TYPE default coeff **≠** payroll formula — **cite engine HOLD class** |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · F-ATT-LEAVE-04 **HOLD** · formula runtime **HOLD** · **`C-SLICE-≠-MODULE`** · U65 · **DENIED** module ATT UAT · Phase1 DONE |
| **must_keep** | Nest policy CRUD L1 · invent **`HRM-ATT-LVRULE-KEY`** via assert-consumer · TYPE **`HRM-LEAVE-TYPE-UNKNOWN`** orthogonal · ledger read/hold TXN · FE 01g Condition HOLD · admin CREATE open N+1 · engine separation in `att-leave-accrual-policy.service.ts` |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option pack §1)

| | |
|--|--|
| **Decision title** | Disposition for **F-ATT-LEAVE-04** accrual **engine / formula runtime** after catalog + consumer KEY wire are **LIVE** |
| **Requestor** | pm · U88 after FE-ADMIN-REOPEN-GATE-BA-01 SEALED · named OPEN residual **engine HOLD** |
| **Decision owner** | sa |
| **Related** | FR-UC-BP-ATT-04 / 04b · Q-LEAVE-ACCRUAL partial · S-ATT-LVRULE-CNS-05 ENGINE HOLD · BR-PLT-ATT-LVRULE-09 |

### 1.1 Sealed upstream vs remaining gap

| Layer | Evidence (2026-08-08) | Seat status |
|-------|----------------------|-------------|
| **Rule schema SoT** | Nest `att_leave_accrual_policy` · F-ATT-LVRULE-01..04 CRUD/effective/retire | **LIVE** — QC-01/02 admin + CNS-WIRE |
| **Consumer invent KEY** | `POST …/leave-accrual-policies/assert-consumer` → **400 `HRM-ATT-LVRULE-KEY`** when active>0 | **CLOSED** `R-PLT-ATT-LVRULE-CNS-WIRE` |
| **Type invent** | Leave TXN → **`HRM-LEAVE-TYPE-UNKNOWN`** | **RETAIN** — orthogonal |
| **FE panel / admin** | Panel partial · Settings admin «Quy tắc quỹ phép» **ABSENT** | **HOLD P2** `R-PLT-ATT-LVRULE-FE-01g` — **not** engine unlock |
| **Accrue engine** | API_DESIGN F-ATT-LEAVE-04 outline · **Q-LEAVE-ACCRUAL chờ chốt** · no production `POST …/leave-balances/accrue` GO | **HOLD** — **this seat** |
| **Code cite (read-only)** | `attendance.controller.ts` documents assert-consumer **NOT** F-ATT-LEAVE-04 · `@CODE-MEMORY` engine HOLD on policy service | **RETAIN separation** |

**Failure if mis-governed:** PM/Dev claim **attendance UAT** or **module ATT ready** because policy rows exist; implement **dual accrual engines** (Settings job + Nest job); wire **monthly/yearly grant** without Q-LEAVE-ACCRUAL component lock; reopen **FE 01g** as excuse to ship engine; **seed** accrue runs for UF; flip **`payroll_e2e_ready`** because entitled column exists.

### 1.2 Constraints (sponsor + program)

| Bắt buộc | Cấm tuyệt đối |
|----------|----------------|
| Docs-only governance · fail-closed HOLD default | `apps/**` · migration · seed (U65) |
| **UNLOCK engine** only if sponsor UF + closable BE gap + BA/SA depth on Q-LEAVE-ACCRUAL | Invent formula LIVE «cho đủ demo» |
| RETAIN all LVRULE L1 + CNS-WIRE + KEY stamps | Reopen ATT-LEAVE/CODE/WS/SHIFT L1 |
| FE 01g remains **separate Condition** — **DENY** reopen as engine dependency | Nest **dual engine** (cron + inline + Settings KV) |
| Honesty flags **LOCKED false** until module gate program | `attendance_uat_ready=true` · `payroll_e2e_ready=true` |

### 1.3 Decision heuristic

| Heuristic | Application |
|-----------|-------------|
| Catalog LIVE **≠** engine LIVE (peer PAY) | Policy CRUD + KEY assert **do not** authorize accrue job GO |
| Q-LEAVE-ACCRUAL open in API_DESIGN | F-ATT-LEAVE-04 remains **outline** until dedicated BA+SA+BE wave |
| C-SLICE honesty | LVRULE vertical slice **≠** module ATT UAT |
| U88 continuous | This seat **names** residual **`R-PLT-ATT-LVRULE-ENGINE-01`** — **does not** dispatch dev-be |

---

## 2. Problem to solve (ADR §2)

### 2.1 Current state (AS-IS — evidence-backed)

| Component | AS-IS | Not claimed |
|-----------|-------|-------------|
| **`att_leave_accrual_policy` rows** | Admin CREATE · list · effective resolve · retire · jest/controller Network class | Automatic entitlement mutation |
| **`employee_leave_balances.entitled`** | Read/panel · hold/settle on leave TXN path | Scheduled accrue from policy evaluator |
| **F-ATT-LEAVE-04 path** | Documented `POST /api/hrm/att/leave-balances/accrue` *(job)* — **skeleton / HOLD detail** | `{ accrued_employees }` UF with FE observe + F5 |
| **SRS FR-UC-BP-ATT-04** | Lịch cấp quỹ (cuối tháng / đầu năm / 6 tháng…) — business intent | Deterministic component formula in Nest |
| **Consumers** | assert-consumer gates **invent params** | Product grant UI · accrue bind on approve |

### 2.2 Target state (architecture — deferred)

| Target (future wave — **not** this seat) | Owner |
|------------------------------------------|-------|
| Single **ATT-owned** accrual evaluator reading **published EFF policy** | dev-be + ba-process |
| Idempotent accrue job / manual trigger with scope parity | dev-be |
| Component matrix: seniority · position · pro-rata · carry expire | ba-process + SA |
| UF browser: policy published → job/trigger → ledger entitled delta → panel reflects | qa U65 |
| PAY read-only on entitled — **no** PAY calling accrue | ADR PAY boundary RETAIN |

### 2.3 Failure impact if unresolved (governance)

| Risk | Impact |
|------|--------|
| Silent «engine LIVE» claim | QC GO on wrong module · sponsor trust loss |
| Dual engine | Inconsistent entitled · payroll dispute |
| Engine before Q-LEAVE-ACCRUAL lock | Rework migrations · formula drift |
| Engine bundled into FE 01g reopen | Scope creep · violates FE SA Option B |

---

## 3. Options (ADR §3)

### Option A — UNLOCK F-ATT-LEAVE-04 LIVE now (full accrue evaluator + HTTP/job surface)

| | |
|--|--|
| **Description** | Implement `POST …/leave-balances/accrue` (and/or scheduler) that evaluates `accrual_mode`, `annual_days`, seniority/position components per published policy; mutate `employee_leave_balances.entitled`; optional FE admin trigger; claim slice/module readiness. |
| **Benefits** | Closes FR-UC-BP-ATT-04 automation gap; panel entitled becomes policy-driven without manual grant API. |
| **Costs** | Requires **Q-LEAVE-ACCRUAL** component lock · BA AC pack for accrue · regression across ledger/hold/PAY read · jest + L1 + browser UF · scope parity on job company scope. |
| **Risks** | **Premature** without sponsor UF; violates **BR-PLT-ATT-LVRULE-09** / UC-PLT-ATT-LVRULE-08 non-claim discipline; collides with **FE 01g HOLD** (grant product FE OUT). |

**UNLOCK gate (all required — else DENY):**

1. Sponsor message explicit: accrue engine wave + named UF-ID (e.g. UF-HRM-ATT-ACCRUE-01).
2. ba-process delta: AC for accrue modes · empty policy · idempotency · partial month · carry expire.
3. SA F.1 refresh: F-ATT-LEAVE-04 **full** API_DESIGN rows (mục đích · nghiệp vụ · bước SRS · lỗi).
4. ba-data: confirm ledger columns if EXPAND needed (companion only — no second ledger table).
5. QC honesty: still **C-SLICE** until module matrix says otherwise.

### Option B — **ACCEPT_AS_IS_P2 HOLD** on accrue engine · mint **`R-PLT-ATT-LVRULE-ENGINE-01`** — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | **Retain** F-ATT-LEAVE-04 as **outline HOLD**. Catalog + KEY + admin L1 remain **LIVE** and **SEALED**. Register residual **`R-PLT-ATT-LVRULE-ENGINE-01`** on W8 board: P2 HOLD · owner **none until sponsor** · unlock trigger = Option A gate pack. **No** dev-be dispatch from this seat. **No** ba-process invent for accrue AC now. Peer: PAY formula engine HOLD · ATT-LVRULE-FE-01g HOLD — parallel residuals, not blockers to each other. |
| **Benefits** | Honest architecture: schema/contract LIVE vs runtime deferred; zero regression risk on ledger; preserves SOLID split (policy service ≠ accrue engine). |
| **Costs** | Entitled still manual/ad-hoc outside future job; panel may show static entitled until accrue wave. |
| **Risks** | Misread as «ATT broken» — mitigated by explicit board residual + SRS «giai đoạn sau» alignment (DOCS-01). |

### Option C — Hybrid / dual engine / Settings-sole accrue / invent LIVE without UF — **REJECT**

| | |
|--|--|
| **Description** | (C1) Nest accrue + Settings cron both write entitled; (C2) inline accrue on every policy PATCH; (C3) claim engine LIVE because assert-consumer exists; (C4) reopen FE 01g to «finish» engine; (C5) seed accrue for QA UF. |
| **Benefits** | Short-term demo only — **not** enterprise-safe. |
| **Costs** | Dual SoT · U65 violation · seal churn · PAY boundary breach. |
| **Risks** | **REJECT** — DENY per program DENY row · `e2e-no-fake-db-production-guard` · sponsor-zero-seed. |

---

## 4. Trade-off matrix (ADR §4)

| Criteria | Weight | A UNLOCK LIVE | **B HOLD (ENGINE-01)** | C Hybrid / invent |
|----------|-------:|--------------:|-----------------------:|------------------:|
| Honesty / C-SLICE safety | 5 | 2 | **5** | 0 |
| Business value (FR-ATT-04 automation) | 5 | 5 | **2** | 1 |
| Delivery risk (ledger/PAY regression) | 5 | 2 | **5** | 0 |
| Spec readiness (Q-LEAVE-ACCRUAL) | 4 | 1 | **5** | 0 |
| Time to deliver (W8 continuous) | 4 | 1 | **5** | 3 |
| Maintainability (single evaluator) | 4 | 4 | **4** | 0 |
| Security / scope parity on job | 3 | 3 | **5** | 1 |
| **Weighted total** | | 58 | **118** | 12 |

---

## 5. Failure modes and mitigation (ADR §5)

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| **B HOLD** | PM marks ATT module UAT because policy CRUD works | QC audit honesty flags · matrix `C-SLICE` | **DENY** ready flip; cite this spec + QC-02 |
| **B HOLD** | Dev adds accrue route «nhỏ» without SA | grep `leave-balances/accrue` · preflight CODE-MEMORY | TM NO-GO · revert · dispatch SA first |
| **B HOLD** | QA uses seed/SQL to bump entitled | U65 browser-only gate | FAIL QA · no PASS_TO_PM |
| **A LIVE** | Accrue double-runs same period | idempotency key / period UQ tests | BA AC + jest before READY_FOR_QA |
| **A LIVE** | Scope 409 on job vs list | `hrm-list-scope.spec` | U19 parity mandatory |
| **C dual** | entitled mismatch panel vs payroll | reconciliation report | **REJECT** Option C upfront |
| **Any** | Reopen CNS-WIRE because grant FE missing | Bus seal `ATTLVRULEQA2-MSK79F2F` | **FORBIDDEN** — FE 01g separate |

---

## 6. Decision (ADR §6)

| | |
|--|--|
| **Selected option** | **Option B** — **LOCKED** |
| **Seat verdict** | **ACCEPT_AS_IS_P2 HOLD** on accrue engine |
| **Mint residual** | **`R-PLT-ATT-LVRULE-ENGINE-01`** — P2 HOLD · **Condition KEEP** (not CLOSED · not WAIVED) |
| **Why B** | Q-LEAVE-ACCRUAL still open in API_DESIGN; catalog/KEY slice explicitly **sealed** without engine GO (BA-01 BR-09 · SA L-08 · QC-02); no sponsor UF for accrue LIVE; peer PAY engine HOLD class; FE 01g remains independent HOLD; implementing engine now would violate **C-SLICE** honesty and risk ledger regression without AC pack. |
| **Rejected** | **A** without sponsor UF pack · **C** dual/invent/seed/reopen FE |
| **Assumptions** | Manual entitled adjustments (if any) remain out of scope; panel read path RETAIN; when sponsor opens engine wave, **Option A gate** applies — **not** automatic from this CONFIRM. |

### 6.1 Physical / BA / BE / FE gates (this seat)

| Question | Answer |
|----------|--------|
| Unlock dev-be accrue? | **NO** — HOLD until Option A gates |
| Unlock ba-process accrue AC? | **NO** — HOLD |
| Unlock ba-data for engine? | **NO** — optional EXPAND only with accrue wave |
| Unlock dev-fe for engine? | **NO** — FE 01g remains separate |
| Close **`R-PLT-ATT-LVRULE-ENGINE-01`**? | **NO** — mint HOLD |
| Reopen **`R-PLT-ATT-LVRULE-FE-01g`**? | **FORBIDDEN** as engine dependency |

### 6.2 Layer map (engine vs catalog)

```text
  att_leave_type (SEALED) ──► leave_type_key
           │
           ▼
  att_leave_accrual_policy (LIVE L1+KEY) ──► RULE SoT · CRUD · assert-consumer
           │
           ├──► assert-consumer / invent KEY ──► LIVE (CNS-WIRE CLOSED)
           │
           ├──► F-ATT-LEAVE-04 accrue evaluator ──► HOLD (R-PLT-ATT-LVRULE-ENGINE-01)
           │         │
           │         └──► employee_leave_balances.entitled (mutate via job) ──► DEFERRED
           │
           └──► FE panel / admin ──► R-PLT-ATT-LVRULE-FE-01g HOLD (parallel)
```

---

## 7. Implementation and validation plan (ADR §7)

### 7.1 Rollout steps (Option B — governance only)

| Step | Action | Owner |
|------|--------|-------|
| 1 | Append W8 board row: **`R-PLT-ATT-LVRULE-ENGINE-01`** P2 HOLD | pm |
| 2 | RETAIN honesty: `attendance_uat_ready=false` · `payroll_e2e_ready=false` | pm/qc |
| 3 | **DENY** dispatch dev-be «accrue skeleton» without Option A | pm |
| 4 | Continue U88 next vertical per continuous board (not engine) | pm |
| 5 | On sponsor UF: open **new** work_item `…-ATT-LVRULE-ENGINE-BA-01` → SA R2 → BE | pm |

### 7.2 Rollback plan

| Trigger | Action |
|---------|--------|
| Accidental accrue route merged | Revert BE · TM audit · restore HOLD stamp |
| False LIVE claim in evidence | QC NO-GO · bus CORRECTION |

### 7.3 Validation checkpoints (this seat PASS)

| Checkpoint | PASS when |
|------------|-----------|
| Spec Length ≥8192 NFD | PowerShell `(Get-Item).Length` |
| Option LOCKED | **B** ACCEPT_AS_IS_P2 HOLD |
| Residual minted | **`R-PLT-ATT-LVRULE-ENGINE-01`** documented |
| Seals RETAIN | CNS-WIRE · admin L1 · FE 01g HOLD · KEY · honesty |
| No apps diff | git clean for engine dispatch |

### 7.4 Success criteria

- PM can point sponsor to **named HOLD** without inventing engine Tasks.
- QC can reject module GO citing **BR-PLT-ATT-LVRULE-09** + this spec.
- Dev boundary clear: **`att-leave-accrual-policy.service.ts`** = schema/resolve/assert only until accrue module extracted (future).

---

## 8. F.1 API / DB disposition notes (§F.1 — governance HOLD · no physical unlock)

### 8.1 F-ATT-LEAVE-04 — accrue apply (RETAIN OUTLINE · HOLD LIVE)

| Field | Disposition this seat |
|-------|----------------------|
| **Cap ID** | **F-ATT-LEAVE-04** |
| **METHOD / path** | `POST /api/hrm/att/leave-balances/accrue` *(job)* — paper alias; Nest physical path TBD on UNLOCK wave |
| **Mục đích** | Cấp quỹ theo chính sách đã publish (lịch tháng/năm/6 tháng…) — **business intent RETAIN** |
| **Nghiệp vụ xử lý** | **HOLD** — API_DESIGN states **Q-LEAVE-ACCRUAL chờ chốt** · **không khóa một policy** in outline · **FORBIDDEN** partial LIVE evaluator without full F.1 row set |
| **Tham chiếu bước SRS** | FR-UC-BP-ATT-04 / 04b — **AC for accrue mutate deferred** |
| **Request → DB** | policy resolve → `employee_leave_balances.entitled` (+ carry rules) — **NO implementation GO** |
| **Response** | `{ accrued_employees }` — **NOT** verified acceptance |
| **Lỗi** | `409 policy missing` — detail HOLD |
| **Runtime status** | **ABSENT** as GO endpoint — grep hrm-api: no accrue controller method shipped as LIVE |

### 8.2 LIVE capabilities (RETAIN — do not conflate with engine)

| Cap ID | Status | Note |
|--------|--------|------|
| F-ATT-LVRULE-01 | LIVE | List policies |
| F-ATT-LVRULE-02 | LIVE | Admin CREATE |
| F-ATT-LVRULE-03 | LIVE | PATCH / retire |
| F-ATT-LVRULE-04 | LIVE | effective resolve |
| F-ATT-LVRULE-CNS-01 | LIVE | assert-consumer KEY |
| F-ATT-LEAVE-BAL-* | LIVE | ledger/panel read |
| S-ATT-LVRULE-CNS-05 | **ENGINE HOLD** | accrue bind **OUT LIVE GO** |

### 8.3 DB disposition

| Table | Engine seat |
|-------|-------------|
| `att_leave_accrual_policy` | **RETAIN** — no accrue-specific columns required for HOLD |
| `employee_leave_balances` | **RETAIN** — entitled mutation via job **DEFERRED** |
| New `accrue_run` / outbox | **NOT ADD** this seat — Option A ba-data only |

### 8.4 SoT / REF (F.1 class table)

| Surface | Class |
|---------|-------|
| Policy rows | **SoT** rules (LIVE) |
| Accrue evaluator | **OUT HOLD** — not SoT until UNLOCK |
| Settings / attendance_rules | **NOT** accrue engine SoT |
| PAY formulas | **Peer HOLD** — separate program |

---

## 9. Residual registry

| Residual ID | Priority | Disposition | Unlock trigger |
|-------------|----------|-------------|----------------|
| **`R-PLT-ATT-LVRULE-ENGINE-01`** | **P2 HOLD** | **ACCEPT_AS_IS** · Condition **KEEP** | Sponsor UF + BA accrue AC + SA F.1 LIVE + BE wave |
| `R-PLT-ATT-LVRULE-FE-01g` | P2 HOLD | **RETAIN** separate | Sponsor FE wave — **not** engine |
| `F-ATT-LEAVE-04` (capability) | OUT HOLD | **RETAIN** | Same as ENGINE-01 |
| Honesty flags | LOCK | false | Module program only |

---

## 10. RETAIN / DENY summary

| Stamp | Action |
|-------|--------|
| `R-PLT-ATT-LVRULE-CNS-WIRE` | **RETAIN CLOSED** |
| `ATTLVRULEQA-MSK6G783` / `ATTLVRULEQA2-MSK79F2F` | **RETAIN** |
| `R-PLT-ATT-LVRULE-FE-01g` Option B | **RETAIN HOLD** — **DENY** reopen for engine |
| ATT-CODE / WS / SHIFT / COMP OTC-03 / OT-TYPE | **RETAIN seals** |
| FE-ADMIN reopen-gate BA-01 inventory | **RETAIN** — engine row = HOLD class |
| Invent formula LIVE · Nest dual engine · seed · flip ready | **DENY** |

---

## 11. Scope parity / journey (U19)

| Check | Engine HOLD impact |
|-------|-------------------|
| list ↔ get-by-id policy | **RETAIN** — already LIVE |
| Future accrue job company scope | **MUST** use same resolver when Option A — **pre-declared** |
| J-* promotion | **NO** J-HRM-ATT-ACCRUE until UF defined |
| L2.5 | Accrue UF **not** in matrix as 🟢 |

---

## 12. completion_report

**Closed:** SA Option/F.1 for **F-ATT-LEAVE-04 / accrue engine** after L1+CNS-WIRE+FE-01g disposition — inventory AS-IS (catalog LIVE · engine ABSENT as GO) · Options **A/B/C** · trade-off · failure modes · **Option B LOCKED ACCEPT_AS_IS_P2 HOLD** · mint **`R-PLT-ATT-LVRULE-ENGINE-01`** · F.1 §8 HOLD disposition · RETAIN all seals · DENY invent LIVE · no `apps/**`.

**Open / residual:** **`R-PLT-ATT-LVRULE-ENGINE-01`** P2 HOLD on board; **`R-PLT-ATT-LVRULE-FE-01g`** parallel HOLD; honesty false; Q-LEAVE-ACCRUAL open.

**selected_option:** **B** — ACCEPT_AS_IS_P2 HOLD

**next_owner:** **pm**

**ack_status:** **PASS_TO_PM** · **CONFIRMED**

**evidence_path:** `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-ENGINE-SA-01.md`

### next_dispatch_prompt (copy-ready — pm seal ENGINE HOLD)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-ENGINE-SA-01
from_role: sa
to_role: pm
lane: governance · U88 · PO-HRM-CONTINUOUS-W8-20260807
ack_status: PASS_TO_PM
verdict: Option B LOCKED — ACCEPT_AS_IS_P2 HOLD · mint R-PLT-ATT-LVRULE-ENGINE-01
action:
  1) Update PO_HRM_CONTINUOUS_W8_20260807.md row ENGINE-SA-01 → CONFIRMED Option B HOLD
  2) Board: R-PLT-ATT-LVRULE-ENGINE-01 = P2 ACCEPT_AS_IS HOLD (KEEP — not CLOSED)
  3) RETAIN: CNS-WIRE CLOSED · admin L1 stamps · FE-01g HOLD · honesty false · C-SLICE · all ATT L1 seals
  4) DENY: dev-be accrue / invent formula LIVE / reopen FE 01g as engine unlock / flip attendance_uat_ready
  5) Continue U88 next governance or execution vertical per board (ATT-COMP · OT · EMP · DEC…) — not engine unless sponsor UF
sponsor_gated_unlock: explicit «mở wave F-ATT-LEAVE-04 accrue» + UF-ID → ba-process AC → SA R2 F.1 LIVE → dev-be (Option A gate)
evidence: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-ENGINE-SA-01.md
cross_ref: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-FE-01G-SA-01.md
         docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-qc-02.md
```

---

## 13. Machine handback block

| Key | Value |
|-----|-------|
| **SPEC_LEN** | *(verify after WriteAllText)* |
| **selected_option** | **B** LOCKED |
| **residual** | **`R-PLT-ATT-LVRULE-ENGINE-01`** P2 HOLD |
| **F-ATT-LEAVE-04** | OUT HOLD RETAIN |
| **next_owner** | **pm** |

---

*End of PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-ENGINE-SA-01*
