# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DATA-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DATA-01` |
| **parent** | SA-01 Option B **CONFIRMED** · BA-01 **CONFIRMED** · BE-01 already **DISPATCHED** (deepen) |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED EXPAND** |
| **date** | 2026-08-08 |
| **change_mode** | EXPAND / CONFIRM · docs-only · **no** `apps/**` · **no** migrate execute · **no** seed |
| **honesty** | `attendance_uat_ready=false` · printable/personnel **false** · `payroll_e2e_ready=false` · DENIED invent module ATT UAT · **`C-SLICE-≠-MODULE`** · U65 |
| **BE gate** | **SUPPORT** in-flight BE-01 — **cấm** invent/re-dispatch duplicate BE · DATA does **not** block |

---

## 1. spec_read_ack

| Artifact | Sections used |
|----------|---------------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01.md` | Option B LOCK · L-ATT-WS-01..10 · soft-retire · list filter · GEO/KEY · ba-data HOLD = no second table |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01.md` | BR-PLT-ATT-WS-* · VAL-ATT-WS-CNS-03b/04 · SITE-UNKNOWN HOLD · soft-retire · ensureDefault OUT |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md` | §3 LIVE work-sites note — **RETAIN** + deepen pointer |
| `DB_DESIGN_HRM_ENTERPRISE.md` | §4.4c AS-IS columns |
| `ADR-HRM-ATTENDANCE-CFG-PERSIST` D3 | Geofence SoT · empty skip · no seed default |
| AS-IS Nest (read-only truth) | `ensureWorkSitesSchema` columns · list/assert `active=TRUE` · soft DELETE deepen in-flight |
| Peer SI-INSURER QC-02 | SEAL RETAIN · R-PLT-SI-INR-03 CLOSED — **no reopen** |

**no_prompt_echo:** Client DOC-DELTA uses Vietnamese enterprise wording only — no chat/prompt paste.

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DATA-01.md) | **CONFIRMED EXPAND** soft-retire · list active · IX note · GEO soft-ref · VAL · OUT |
| [`docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) | **DOC-DELTA CONFIRMED** §4.4c EXPAND + footer stamp |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md` §3 | **ADD pointer** deepen — **no wipe** leave ADD |

**Không đụng:** `apps/**` · migrate execute · seed · flip ready · second table · fold leave · reopen SI/ATT-LEAVE/CTR seals · invent duplicate BE-01.

---

## 3. Verdict stamps (summary)

| Topic | Stamp |
|-------|--------|
| Physical | **LIVE RETAIN** `public.attendance_work_sites` |
| HOLD class | **NO second table** · **FORBIDDEN** fold into `att_leave_type` |
| Product retire SoT | **`active=false`** · hard DELETE residual only |
| `archived_at` / `site_code` | **NOT required GĐ1** · GĐ1.5 HOLD |
| List default | `active = TRUE` · `include_inactive=true` audit |
| IX note | Recommend `(company_id, active)` — optional BE ensure |
| Consumer | Soft-ref lat/lon · **`HRM-ATT-GEO-001` RETAIN** |
| SITE-UNKNOWN | **HOLD** — no invent assert without UF |
| OUT | ensureDefault · seed · flip UAT · Settings/`gps_locations` sole SoT · mega-EAV |
| Seals | ATT-LEAVE GWC · SI type/insurer L1 · CTR · enrollment · EMPTY-DATE **RETAIN** |
| Honesty | `attendance_uat_ready=false` · printable/personnel false · `C-SLICE-≠-MODULE` |
| BE-01 | **Supported** — soft-retire + list filter deepen · **no** re-dispatch |

---

## 4. Quality gates (ba-data)

| Check | Result |
|-------|--------|
| No second table / no fold into leave | **PASS** |
| Soft-retire = product SoT · hard DELETE residual | **PASS** |
| List default active filter + IX note documented | **PASS** |
| GEO-001 soft-ref retain · SITE-UNKNOWN HOLD | **PASS** |
| DOC-DELTA §4.4c ADD-only · no wipe ATT leave / SI | **PASS** |
| Explicit OUT ensureDefault / seed / flip UAT | **PASS** |
| BE-01 in-flight supported · no invent duplicate BE | **PASS** |
| scope_parity U19 list↔get↔assert noted | **PASS** |
| Honesty false · peer seals RETAIN | **PASS** |
| No `apps/**` / migrate / seed this seat | **PASS** |

---

## 5. Data domain map (narrow)

| Entity | Lifecycle | Consumer |
|--------|-----------|----------|
| `attendance_work_sites` | CREATE active → PATCH/UPDATE soft-retire `active=false` → (optional hard DELETE residual) | Geofence assert when active>0 + gps_enabled |
| `attendance_rules.gps_enabled` | Gate flag — **not** sites SoT | — |
| `attendance_rules.gps_locations` | REF/legacy only | **FORBIDDEN** sole SoT |
| Punch / records | Soft membership coords | **GEO-001** · no site FK GĐ1 |

---

## 6. Residual

| ID | Item | Owner |
|----|------|-------|
| — | Soft-retire + list filter impl | **BE-01 in-flight** (await READY_FOR_QA) |
| R-ATT-WS-DATA-01 | Optional IX `(company_id, active)` ensure | BE if missing — non-blocking |
| R-ATT-WS-DATA-02 | `site_code` / `archived_at` | **HOLD GĐ1.5** — only if BA proves |
| R-ATT-WS-DATA-03 | SITE-UNKNOWN assert | **HOLD** until consumer UF binds `work_site_id` |

---

## 7. Completion contract

### completion_report

**Closed:** CONFIRMED EXPAND physical DOC-DELTA for LIVE `public.attendance_work_sites` deepen under AC-PLT-ATT-WORKSITE-01*: product retire SoT = `active=false` (hard DELETE residual only; `archived_at` not required GĐ1); list default `active=TRUE` + `include_inactive` audit; IX note `(company_id, active)`; consumer soft-ref geofence **`HRM-ATT-GEO-001` RETAIN**; **`HRM-ATT-SITE-UNKNOWN` HOLD**; DOC-DELTA DB_DESIGN §4.4c ADD-only + ATT-DATA §3 pointer (no wipe leave/SI); explicit OUT second table · fold into `att_leave_type` · ensureDefault · seed · flip UAT; peer seals ATT-LEAVE / SI type+insurer / CTR / enrollment / EMPTY-DATE RETAIN; honesty `attendance_uat_ready=false` · printable/personnel false · `C-SLICE-≠-MODULE`; **supports** in-flight BE-01 — does **not** block/reopen/invent duplicate BE; no `apps/**` / migrate / seed.

**Residual:** Await BE-01 READY_FOR_QA → QA U65 AC-PLT-ATT-WORKSITE-01*; optional IX ensure non-blocking; SITE-UNKNOWN / site_code GĐ1.5 HOLD.

### next_owner

**pm** — await `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BE-01` **READY_FOR_QA** → dispatch **qa** (do **not** re-dispatch BE).

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
entry_criteria: ATT-WORKSITE-CATALOG-BE-01 READY_FOR_QA · DATA-01 CONFIRMED EXPAND · BA-01 CONFIRMED · SA Option B LOCKED · U65 zero-seed · L0 stack up
ref_data: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DATA-01.md
ref_ba: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01.md
ref_evidence_data: docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-data-01.md
task: Browser U65 retest AC-PLT-ATT-WORKSITE-01/01b/01c/01d/01H + VAL-ATT-WS-CNS-01/03b/04/05 — soft-retire active=false (not hard-delete-only) · list default active-only · invent OOS → HRM-ATT-GEO-001 · empty skip no seed · admin CREATE N+1 · SITE-UNKNOWN HOLD (no invent) · FE sau 2xx/4xx + F5 · Nest SoT ≠ gps_locations sole
cấm: seed · ensureDefault · flip attendance_uat_ready · reopen ATT-LEAVE GWC · reopen SI-INSURER/SI type · invent module ATT UAT · C-SLICE claim module GO · probe-only PASS
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-qa-01.md
exit: PASS_TO_PM or FAIL_TO_PM · completion_report · next_dispatch_prompt · ack_status
```

### evidence_path

`docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-data-01.md`

### ack_status

**PASS_TO_PM** · **CONFIRMED EXPAND**
