# BA AC pack — Wave-45 PAY cluster · UC-BP-PAY-09 (Phân nhóm bảng lương — RETAIN PAY-01..08 order · GAP F-PAY-GROUP-01)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-09-CLUSTER-BA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 — Wave-45 seat **#50**) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O20 **CONFIRMED** · unlock **ba-data DATA-01** + **sa API-01** next · dev-fe/dev-be **HOLD** until DATA/API stamp · **DENY** CRUD stub alone = PAY-09 DONE · **DENY** hardcode VP/KD/TX/VH · **DENY** PAY-09 PATCH payslip lifecycle/amounts · **DENY** PAY module UAT · **printable false RETAIN** · **C-SLICE** |
| **change_mode** | **ADD** (align SA PAY-09 gap-only RETAIN — **no** reorder PAY-01..08 pipeline · **no** PAY-09 PATCH calculator/publish/TT fields · **no** wipe **`PAY01QC1-MSMBGWC1`** … **`PAY08QC1-MSMFFXGWC1`** / **`ATT12QC1-MSMAIGWC1`** / **`ATT11QC1-MSLXTH9P`** peer seals · **DENY reopen** J-HRM-PAY-01..08-* without regression bus) |
| **uc_ids** | `UC-BP-PAY-09` · `FR-UC-BP-PAY-09` · **BR-BP-PAY-04** (matrix · REQ_L_006) · SRS alias **BR-BP-PAY-GRP-01** → **normalized BR-BP-PAY-04** · peer **FR-UC-BP-PAY-01..08** (normative process order §4.2) |
| **depends_on** | `PO-HRM-MVP-GD1-PAY-09-CLUSTER-SA-01` **Option A LOCKED** · PAY-08 QC **`PAY08QC1-MSMFFXGWC1`** · **`PAY08QA1-MSMFFXAZ`** · PAY-01..07 QC seals · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT10..CORE07 chain |
| **ref_sa** | `PO-HRM-MVP-GD1-PAY-09-CLUSTER-SA-01.md` · `PO-HRM-MVP-GD1-PAY-08-CLUSTER-SA-01.md` (**O19** wire-batch HOLD peer) · `PO-HRM-MVP-GD1-PAY-04-CLUSTER-SA-01.md` (mid-month → split) · PAY-01..08 CLUSTER-SA/Ba peers |
| **ref_srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-09** · Luồng **#1–#3** · Diễn biến **#1–#2 + Thành công** · đặc biệt «NV đổi nhóm giữa kỳ» |
| **ref_api** | `API_DESIGN_HRM_ENTERPRISE.md` optional `payroll_group_id` on period · index PAY-09 · **GAP** dedicated **F-PAY-GROUP-01** (API-01) |
| **ref_db** | `DB_DESIGN_HRM_ENTERPRISE.md` **`pay_payroll_group`** §5.5 · `payroll_group_id` on period §5.4 · payslip snapshot §5.6 |
| **ref_evidence** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-08-cluster-qc-01.md` (**PAY08QC1** · unlock seat #50) |
| **Honesty** | `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE-≠-MODULE** · **DENY** period field mention alone = PAY-09 DONE · **DENY** PAY / PAY module UAT DONE |
| **Cấm** | Reorder PAY-01..08 pipeline · PAY-09 PATCH gross/net/tax/si/gtgc/publish/TT · FE group/net SoT · hardcode four group codes · flip `payroll_e2e_ready` · reopen sealed PAY-01..08 journeys · wipe peer seals · seed · apps/** · honesty flip |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE (U65)** cho Wave-45 seat **#50** — **gap-only RETAIN** LIVE **`F-PAY-PROCESS-01`** + sealed **PAY-01..08** normative order SA §4.2 — **GAP** **F-PAY-GROUP-01** (tenant CRUD · rule resolve · period scope · payslip snapshot · enroll/list/report filter) · mint **J-HRM-PAY-09-*** + regression **J-HRM-PAY-01..08**:

1. **Calculator SoT** — Chỉ **`F-PAY-PROCESS-01`** ghi số tiền — PAY-09 **CFG/filter/snapshot only** (**O1**).
2. **Tenant catalog** — **`pay_payroll_group`** CRUD per company — **cấm** hardcode VP/KD/TX/VH enum (**O2** · SRS quy tắc nghiệp vụ).
3. **Assignment model** — `match_rule_json` (dept / position_key / `employee_ids`) + **priority** — **one** effective group per NV per period (**O3** · **O4** · **BR-BP-PAY-04**).
4. **Period scope** — Optional **`payroll_group_id`** on period = run/filter scope (**O5**).
5. **Payslip snapshot** — At **process**, set **`payroll_group_id`** on payslip — **immutable** after calculate (**O6**).
6. **Formula per group** — BIND **PAY-02** published formula via period/group pointer — **cấm** FE unpublished pick (**O7**).
7. **Enroll filter** — Eligibility/enroll list `payroll_group_id` filter + U19 scope (**O8**).
8. **Report filter** — List/export breakdown by group + `name_vi` label (**O9**).
9. **Mid-month change** — NV đổi nhóm giữa kỳ → **PAY-04 split** if formula differs — **cấm** PAY-09 second payslip (**O10**).
10. **Explicit override** — `employee_ids` in rule overrides dept/position (**O11**).
11. **Retire group** — `status=retired` → **cấm** new period bind · historical snapshots retain (**O12**).
12. **Dual membership** — Two active groups same NV same period without priority → **`409` `HRM-PAY-GROUP-409`** (**O13**).
13. **Display-ready** — DTO `payroll_group_id`, `code`, `name_vi` on period/payslip GET — read-only (**O14** · PAY-08 bind).
14. **Scope parity** — Group catalog list ≡ period list ≡ payslip list (U19) (**O15**).
15. **Regression** — **DENY reopen** J-HRM-PAY-01..08 sealed (**O16**).
16. **must_keep stamps** — PAY01..08 QC + ATT12 + ATT11 (**O17**).
17. **Honesty** — Mint **J-HRM-PAY-09-*** DRAFT · `payroll_e2e_ready=false` (**O18**).
18. **Wire batch peer** — **HOLD** one SoT rule in PAY-08 API-01 (**O19**).
19. **AMIS / bank depth** — **HOLD** beyond group slice (**O20**).
20. **Payslip lifecycle** — Publish/TT/void = **PAY-08** — PAY-09 **cấm** PATCH (**O1** boundary).

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| C&B / Ban lãnh đạo | CRUD danh mục nhóm tenant · gán rule / danh sách NV · chọn nhóm khi tạo kỳ · lọc chạy/báo cáo |
| HCNS | Xem báo cáo phân nhóm theo scope |
| Hệ thống PAY | Resolve NV→group @ period boundary · snapshot at process · filter enroll/list · 409 deterministic |
| PAY-01..08 (peer) | Closed sheet → formula → GTCG → split → SI → TNCN → process → final pay → payslip lifecycle — **must_keep order** |

### Scope

| In (this seat) | Out |
|----------------|-----|
| O1–O20 CONFIRM · AC-PAY-GROUP-* · residuals **R-PAY-09-*** | Impl `apps/**` / seed |
| RETAIN process spine + PAY01..08 seals | Full AMIS wire UI (**O20 HOLD**) |
| GAP F-PAY-GROUP-01 + journeys U65 | PAY-09 owns publish/TT/wire (**O19 HOLD peer**) |
| Unlock **ba-data** `pay_payroll_group` + FK wire | Flip `payroll_e2e_ready` · PAY module UAT |
| BIND PAY-08 read labels on payslip | Hardcode four groups |

### SA Option A — BA CONFIRM (đóng O1–O20)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | Calculator SoT | **YES** — **Only** **`F-PAY-PROCESS-01`** writes **`gross`**, **`net`**, tax/SI/GTCG header fields · PAY-09 **cấm** PATCH payslip amounts · publish · **`payment_status`** · void — cite PAY-06/08 · **AC-PAY-GROUP-CALC-SOT** |
| **O2** | Catalog SoT | **YES** — **`pay_payroll_group`** per `company_id` tenant catalog · examples office/sales/driver/ops on paper only · **cấm** fixed enum in `apps/**` · SRS «không hardcode bốn nhóm cố định» · **AC-PAY-GROUP-CATALOG-SOT** |
| **O3** | Assignment model | **YES** — `match_rule_json`: `department_ids[]` · `position_keys[]` · optional `employee_ids[]` · resolve at enroll/process boundary · **one** effective group per NV per period unless **O4** priority · **BR-BP-PAY-04** · **AC-PAY-GROUP-RESOLVE** |
| **O4** | Priority | **YES** — When multiple group rules match → higher **`priority` int** wins (DB §5.5) · deterministic · overlap without priority → **O13** · **AC-PAY-GROUP-PRIORITY** |
| **O5** | Period scope | **YES** — Optional **`payroll_group_id`** on **payroll period** create/update = run scope + list filter for that kỳ (paper API) · label `payroll_group_label_vi` on period DTO · Diễn biến **#2** chạy/lọc · **AC-PAY-GROUP-PERIOD-SCOPE** |
| **O6** | Payslip snapshot | **YES** — At **`POST …/process`**, writer sets **`payroll_group_id`** on payslip header from resolved effective group · **immutable** after calculate — group change mid-period policy = new process/split (**O10**) not silent PATCH snapshot · DB §5.6 · **AC-PAY-GROUP-SNAPSHOT** |
| **O7** | Formula per group | **YES BIND PAY-02** — Optional **`formula_definition_id`** on period **or** group-level default pointer · **only published** formula from PAY-02 · **cấm** FE pick unpublished · **cấm** second net engine · **AC-PAY-GROUP-FORMULA-BIND** |
| **O8** | Enroll filter | **YES** — **`GET eligibility`** / enroll list accepts `payroll_group_id` query · same U19 scope as payslip/period list · NV «đã gán nhóm» for scoped run · Diễn biến **#2** · **AC-PAY-GROUP-ENROLL-FILTER** |
| **O9** | Report filter | **YES** — Payslip list + period list + export support filter `payroll_group_id` · breakdown row counts / totals by group + **`name_vi`** · Luồng **#3** báo cáo · **AC-PAY-GROUP-REPORT-FILTER** |
| **O10** | Mid-month change | **YES BIND PAY-04** — NV đổi nhóm giữa kỳ với **effective_date** → if formula differs invoke **F-PAY-SPLIT-01** / segment boundary (**PAY04QC1**) · **cấm** PAY-09 invent second payslip or overwrite snapshot without process policy · SRS đặc biệt · **AC-PAY-GROUP-MID-MONTH** |
| **O11** | Explicit list override | **YES** — `match_rule_json.employee_ids` **overrides** dept/position for listed NV · matrix «danh sách đặc thù» · **AC-PAY-GROUP-EXPLICIT-LIST** |
| **O12** | Retire group | **YES** — `status=retired` (+ `archived_at`) → **409** or validation on **new** period bind to retired group · historical payslips **retain** snapshot id · CRUD AC · **AC-PAY-GROUP-RETIRE** |
| **O13** | DENY dual membership | **YES** — Two active groups matching same NV same period without resolvable priority → **`409` `HRM-PAY-GROUP-409`** + stable `reason_code` · **cấm** enroll both · **AC-PAY-GROUP-DUAL-409** |
| **O14** | Display-ready read | **YES GAP AC** — GET period/payslip: `{ payroll_group_id, payroll_group_code, payroll_group_name_vi }` read-only · **BIND PAY-08** payslip GET enrich · OS 28 · **L2.5** list→detail · **AC-PAY-GROUP-DISPLAY** |
| **O15** | Scope parity | **YES must_keep U19** — **`listPayrollGroups`** (or catalog) · **`listPeriods`** · **`listPayslips`** share same company scope resolver · group CEO `main` rollup per ADR · **AC-PAY-GROUP-SCOPE-PARITY** |
| **O16** | Regression | **YES must_keep** — **DENY reopen** **J-HRM-PAY-01-01..08** · **J-HRM-PAY-02-05..07** · **J-HRM-PAY-03-01..08** · **J-HRM-PAY-04-05/06/08** · **J-HRM-PAY-05-01..08** · **J-HRM-PAY-06-01..08** · **J-HRM-PAY-07-01..08** · **J-HRM-PAY-08-01..08** without regression bus + stamps · **AC-PAY-GROUP-≠-REOPEN-JOURNEYS** |
| **O17** | must_keep stamps | **YES** — **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`PAY05QC1-MSMDU2GWC1`** · **`PAY06QC1-MSMECGWC1`** · **`PAY07QC1-MSMEY7GWC1`** · **`PAY08QC1-MSMFFXGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT10..CORE07 chain · **DENY** merge buckets · **DENY** `att_leave_hold` · **AC-PAY-GROUP-MK-PEERS** |
| **O18** | Honesty / journeys | **YES** — Mint **`J-HRM-PAY-09-01..08` DRAFT** · U65 FE-after-2xx+F5 · regression PAY-01..08 subsets · `payroll_e2e_ready=false` · **≠ PAY module UAT** · **≠ FR-UC-BP-PAY-09 module DONE** · **C-SLICE** · **AC-PAY-GROUP-H** |
| **O19** | Wire batch peer | **YES HOLD footer** — LIVE **`wire-payment-batch`** may set **`payment_status=paid`** — **one** SoT rule locked in **PAY-08 API-01** (**PAY08 BA O19**) · PAY-09 **does not** own batch wire · AMIS step depth **≠** PAY-09 DONE alone · **AC-PAY-GROUP-WIRE-HOLD** |
| **O20** | AMIS / bank depth | **YES HOLD footer** — Full payment batch UI + bank file export beyond group CFG slice · cite LIVE routes **≠** FR-PAY-09 DONE · **AC-PAY-GROUP-AMIS-HOLD** |

### Primary API surface (BA lock — normative targets for API-01)

| Intent | Physical (normative) | F-id | SRS Diễn biến |
|--------|----------------------|------|---------------|
| CRUD catalog (GAP) | **`GET/POST/PATCH /api/hrm/payroll/groups`** | **F-PAY-GROUP-01** | **#1** |
| Resolve preview (GAP) | **`GET …/groups/:id/members`** or internal at enroll | **F-PAY-GROUP-01** resolve | **#2** |
| Period scope (GAP) | Period create/update **`payroll_group_id?`** | **F-PAY-GROUP-01** period | Luồng **#3** |
| Enroll filter (GAP) | **`GET …/eligibility?payroll_group_id=`** | **F-PAY-GROUP-01** filter | **#2** |
| List filter (GAP) | Payslip/period list query `payroll_group_id` | **F-PAY-GROUP-01** filter | **#3** |
| Snapshot (GAP) | Writer at **`POST …/process`** | **F-PAY-GROUP-01** snapshot | Thành công |
| Process (RETAIN peer) | **`POST …/process`** | **F-PAY-PROCESS-01** | **O1** |
| Payslip read (RETAIN+BIND) | **`GET payslips*`** + group labels | **F-PAY-PAYSLIP-01** | **O14** PAY-08 |

**Invariant PAY-09-PATH:** Group CFG + resolve **MUST** exist **before** «chạy lương theo nhóm» scoped run — SRS tiên quyết «NV được gán nhóm».

**Invariant PAY-09-≠-CRUD-DONE:** Catalog CRUD stub alone = FR-PAY-09 DONE = **FAIL O18**.

**Invariant PAY-09-≠-PERIOD-FIELD-DONE:** Paper optional period field unwired / partial wire alone = PAY-09 DONE = **FAIL O18**.

**Invariant PAY-09-≠-FE-SOT:** FE resolves group membership or recomputes net by group = **FAIL O2/O1**.

**Invariant PAY-09-≠-HARDCODE:** Code enum `office|sales|driver|ops` fixed = **FAIL O2**.

**Invariant PAY-09-≠-LIFECYCLE-PATCH:** PAY-09 PATCH publish/TT/void/amounts = **FAIL O1** (PAY-08 boundary).

**Invariant PAY-09-PROCESS-ORDER:** Reorder vs PAY-08 §4.2 steps (0)–(15) = **FAIL O17** (regression PAY-01..08).

**Invariant PAY-09-≠-REOPEN:** Demote sealed PAY-01..08 journeys without bus = **FAIL O16/O18**.

---

## Footer — honesty (every section)

> **honesty:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **C-SLICE**  
> **≠ PAY-09 / FR-UC-BP-PAY-09 module DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **≠** full CRUD→process→report browser e2e · printable false · `pay_payroll_group` / resolver / snapshot **GAP** until DATA/Dev expected · must_keep **`PAY01QC1-MSMBGWC1`** … **`PAY08QC1-MSMFFXGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **RETAIN PAY-01..08 order §4.2** · **CFG/filter/snapshot only PAY-09** · DENY CRUD alone DONE · DENY hardcode four groups · DENY payslip lifecycle PATCH · DENY FE group SoT · DENY reopen sealed J-* · **RETAIN PAY-08 O19 wire HOLD** (**O19**) · **O20 AMIS HOLD** · no seed · no apps/**

---

## 1. As-is vs to-be

| | AS-IS (LIVE + seals) | TO-BE (Wave-45 #50 · Option A) |
|---|----------------------|--------------------------------|
| PAY-01..08 pipeline | **SEALED** | **must_keep RETAIN order** (**O17**) |
| `pay_payroll_group` table/API | **ABSENT** grep 0 | **GAP** DATA + API + FE (**O2**) |
| `match_rule_json` resolve | **ABSENT** | **GAP** BE service (**O3/O4**) |
| Period `payroll_group_id` | paper **unwired** | **GAP** (**O5**) |
| Payslip snapshot | **unwired** | **GAP** at process (**O6**) |
| Enroll/list/report filter | **ABSENT** | **GAP** (**O8/O9**) |
| Payslip GET group labels | **ABSENT** field | **GAP BIND PAY-08** (**O14**) |
| Mid-month group change | PAY-04 split peer | **BIND** (**O10**) |
| Wire batch / TT paid | LIVE (**PAY-08 O19**) | **HOLD peer** (**O19**) |

### 1.1 Residual map **R-PAY-09-*** (payroll group unlock)

| ID | Scope | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **R-PAY-09-CRUD** | Tenant group catalog | **IN-SCOPE GAP** | **dev-be** + **ba-data** |
| **R-PAY-09-RESOLVE** | Rule + priority service | **IN-SCOPE GAP** | **dev-be** |
| **R-PAY-09-PERIOD-BIND** | Period scope field | **IN-SCOPE GAP** | **dev-be** + **ba-data** |
| **R-PAY-09-SNAPSHOT** | Payslip writer at process | **IN-SCOPE GAP** | **dev-be** + **ba-data** |
| **R-PAY-09-ENROLL-FILTER** | Eligibility query param | **IN-SCOPE GAP** | **dev-be** + **dev-fe** |
| **R-PAY-09-REPORT-FILTER** | List/export by group | **IN-SCOPE GAP** | **dev-be** + **dev-fe** |
| **R-PAY-09-MID-MONTH** | Group change → PAY-04 | **BIND** | **qa** + **PAY04QC1** |
| **R-PAY-09-DENY-UI** | No hardcode four groups | **IN-SCOPE AC** | **dev-fe** + **qa** |
| **R-PAY-09-DUAL-409** | HRM-PAY-GROUP-409 | **IN-SCOPE AC** | **dev-be** + **qa** |
| **R-PAY-09-JOURNEY** | J-HRM-PAY-09-* + regression | **IN-SCOPE** (this pack) | **qa** |
| **H-PAY-09-WIRE** | Wire-batch SoT | **HOLD** | **O19** · PAY-08 API-01 |
| **H-PAY-09-AMIS** | Bank file / AMIS depth | **HOLD** | **O20** |

---

## 2. Business rule table (normative)

| Rule ID | Condition | Action | Outcome | Test hook |
|---------|-----------|--------|---------|-----------|
| **BR-BP-PAY-04** | NV trong kỳ | One effective group or priority winner | **409** if dual | AC-PAY-GROUP-DUAL-409 · J-09-07 |
| **BR-BP-PAY-GRP-01** (SRS alias) | Tenant catalog | CRUD per company | **≠** hardcode four | O2 · AC-PAY-GROUP-CATALOG-SOT |
| **REQ_L_006** | Group matrix PARTIAL | PAY-09 slice closes CFG gap | **≠** module UAT alone | O18 |
| **R-PAY-04-PEER** | Mid-month formula change | PAY-04 split | **BIND** not duplicate | O10 · J-09-06 |
| **R-PAY-08-PEER** | Payslip display/TT | PAY-08 owns lifecycle | PAY-09 read-only enrich | O1 · O14 |
| **R-PAY-08-O19** | Wire batch paid | PAY-08 SoT | **HOLD** not PAY-09 | O19 |

---

## 3. SRS trace — Diễn biến → AC → J-* → API

| SRS | Nội dung | AC pack | Journey | API (LIVE/GAP) |
|-----|----------|---------|---------|----------------|
| Luồng **#1** | Cấu hình danh mục | **CATALOG-SOT** · **RETIRE** | **J-HRM-PAY-09-01** | CRUD GAP |
| **#1** Diễn biến | CRUD nhóm | **RETIRE** · **PRIORITY** | **J-HRM-PAY-09-01** | CRUD GAP |
| **#2** Diễn biến | Gán NV / rule | **RESOLVE** · **EXPLICIT-LIST** | **J-HRM-PAY-09-02** | resolve GAP |
| **#2** Diễn biến | Chạy / lọc | **PERIOD-SCOPE** · **ENROLL-FILTER** | **J-HRM-PAY-09-03** | period GAP |
| Luồng **#3** | Báo cáo theo nhóm | **REPORT-FILTER** | **J-HRM-PAY-09-04** | list GAP |
| Thành công | Snapshot + báo cáo đúng | **SNAPSHOT** · **DISPLAY** | **J-HRM-PAY-09-05** | process GAP |
| Đặc biệt | Đổi nhóm giữa kỳ | **MID-MONTH** | **J-HRM-PAY-09-06** | PAY-04 BIND |
| FAIL | Dual group / thiếu catalog | **DUAL-409** · **≠-HARDCODE** | **J-HRM-PAY-09-07** | 409/412 |
| Peer PAY-02 | Công thức khác nhóm | **FORMULA-BIND** | **J-HRM-PAY-09-03** | PAY-02 BIND |
| Peer PAY-08 | Label on payslip | **DISPLAY** | **J-HRM-PAY-09-05** | GET BIND |

### 3.1 AC-PAY-GROUP pack (normative)

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-PAY-GROUP-CALC-SOT** | Period processed | Group slice touches payslip | Amounts still **only** from process · **no** PAY-09 PATCH math/TT/publish | O1 · U65 |
| **AC-PAY-GROUP-CATALOG-SOT** | C&B catalog | CRUD group **2xx** | Row in tenant list · code/name_vi editable · **≠** fixed four enum in UI seed | O2 · J-09-01 |
| **AC-PAY-GROUP-RESOLVE** | Rules + NV attrs | Enroll/process preview | Resolved set matches dept/position/list · **F5** stable | O3 · J-09-02 |
| **AC-PAY-GROUP-PRIORITY** | Overlapping rules | Resolve | Higher `priority` wins · logged winner id | O4 · J-09-02 |
| **AC-PAY-GROUP-PERIOD-SCOPE** | Open period | Create/update with `payroll_group_id` | Period shows label · enroll scoped | O5 · J-09-03 |
| **AC-PAY-GROUP-SNAPSHOT** | Scoped process | **POST process** **2xx** | Payslip `payroll_group_id` set · **F5** · immutable without re-process policy | O6 · J-09-05 |
| **AC-PAY-GROUP-FORMULA-BIND** | Group/period formula pointer | Process | Published formula only · **≠** unpublished pick | O7 · J-09-03 |
| **AC-PAY-GROUP-ENROLL-FILTER** | Period scoped | **GET eligibility** filter | Only NV in group scope · U19 parity | O8 · J-09-03 |
| **AC-PAY-GROUP-REPORT-FILTER** | Payslips exist | List filter by group | Counts/totals match scope · export includes `name_vi` | O9 · J-09-04 |
| **AC-PAY-GROUP-MID-MONTH** | Group change mid-period | Process with formula change | **PAY-04** split path · **≠** second payslip invent | O10 · J-09-06 |
| **AC-PAY-GROUP-EXPLICIT-LIST** | `employee_ids` in rule | Resolve | Listed NV in group regardless of dept | O11 · J-09-02 |
| **AC-PAY-GROUP-RETIRE** | Group retired | Bind new period | **409** or validation · old payslips keep snapshot | O12 · J-09-01 |
| **AC-PAY-GROUP-DUAL-409** | Two groups match | Enroll/process | **409** `HRM-PAY-GROUP-409` · stable message | O13 · J-09-07 |
| **AC-PAY-GROUP-DISPLAY** | GET payslip/period | UI read | `payroll_group_*` read-only vi-VN · **L2.5** | O14 · J-09-05 |
| **AC-PAY-GROUP-SCOPE-PARITY** | Group CEO persona | list vs get-by-id | Same visibility catalog/period/payslip | O15 · U19 |
| **AC-PAY-GROUP-≠-REOPEN-JOURNEYS** | Sealed J-PAY | Reopen without bus | **FAIL** | O16 |
| **AC-PAY-GROUP-MK-PEERS** | Footer | Stamps | PAY01..08QC1 + ATT11/12 | O17 |
| **AC-PAY-GROUP-WIRE-HOLD** | Footer | AC text | wire SoT = PAY-08 API-01 O19 | O19 |
| **AC-PAY-GROUP-AMIS-HOLD** | Footer | AC text | AMIS/bank defer O20 | O20 |
| **AC-PAY-GROUP-≠-CRUD-DONE** | Only CRUD stub | DONE claim | **FAIL** | O18 |
| **AC-PAY-GROUP-≠-HARDCODE** | Code grep/UI | Four fixed groups | **FAIL** | O2 · J-09-07 |
| **AC-PAY-GROUP-H** | Program | QC GWC | `payroll_e2e_ready=false` · **≠ PAY-09 DONE** | O18 · J-09-08 |

---

## 4. J-HRM-PAY-09-* DRAFT (narrow · U65 · Nest `/core` dual SoT 0)

| Journey ID | Slice | Title | Click path (browser · U65) | AC / lock |
|------------|-------|-------|----------------------------|-----------|
| **J-HRM-PAY-09-01** | **catalog-crud** | **CRUD danh mục nhóm tenant — FE sau 2xx + F5** | Login `ceo@xe.vn` → HRM → **Tiền lương** → **Nhóm bảng lương** (menu SRS) → **Thêm** nhóm (mã · tên vi-VN · priority) → **Lưu** **2xx** → row trong bảng → **F5** còn · **≠** chỉ 4 nhóm cố định UI | AC-PAY-GROUP-CATALOG-SOT · RETIRE · **DRAFT** |
| **J-HRM-PAY-09-02** | **rule-resolve** | **Gán rule / danh sách NV — preview membership** | Mở nhóm → cấu hình `match_rule_json` (phòng ban / chức vụ / NV đặc thù) → **Lưu** **2xx** → preview danh sách NV khớp · explicit `employee_ids` override · **F5** | AC-PAY-GROUP-RESOLVE · PRIORITY · EXPLICIT-LIST · **DRAFT** |
| **J-HRM-PAY-09-03** | **period-scope-run** | **Kỳ lương theo nhóm + enroll lọc** | Tạo/sửa kỳ → chọn **Nhóm bảng lương** (optional scope) → **Lưu** **2xx** → **Đăng ký / eligibility** chỉ NV trong nhóm khi scoped → **Chạy tính lương** path khi LIVE (**J-PAY-06-04**) với formula published (**PAY-02**) | AC-PAY-GROUP-PERIOD-SCOPE · ENROLL-FILTER · FORMULA-BIND · **DRAFT** |
| **J-HRM-PAY-09-04** | **report-filter** | **Lọc phiếu / báo cáo theo nhóm** | Màn danh sách phiếu kỳ → filter **Nhóm** → chỉ rows snapshot nhóm · breakdown/export có `name_vi` · **F5** | AC-PAY-GROUP-REPORT-FILTER · **DRAFT** |
| **J-HRM-PAY-09-05** | **snapshot-display** | **Snapshot trên phiếu + list→detail** | Sau process **2xx** → mở phiếu NV → badge/label nhóm read-only · **GET** **2xx** · **L2.5** list→detail · **F5** · **cấm** PATCH nhóm trên phiếu | AC-PAY-GROUP-SNAPSHOT · DISPLAY · **DRAFT** |
| **J-HRM-PAY-09-06** | **mid-month-bind** | **Đổi nhóm giữa kỳ — PAY-04 peer** | NV chuyển nhóm giữa kỳ (effective_date SRS) → khi công thức khác → **split** path (**J-PAY-04-01** when LIVE) · **≠** PAY-09 tạo phiếu thứ hai | AC-PAY-GROUP-MID-MONTH · **PAY04QC1** · **DRAFT** |
| **J-HRM-PAY-09-07** | **deny-fail** | **409 dual group · retired bind · cấm hardcode** | (a) Cấu hình overlap không priority → enroll/process **409** `HRM-PAY-GROUP-409` (b) Bind kỳ vào nhóm **retired** → **409** (c) UI chỉ 4 nhóm cố định không CRUD → **FAIL** (d) 4xx → **không** toast success | AC-PAY-GROUP-DUAL-409 · RETIRE · **≠-HARDCODE** · **DRAFT** |
| **J-HRM-PAY-09-08** | **cross** | **Seals · honesty · ≠DONE** | (a) Nest `/core` dual SoT **0** (b) **≠ PAY-09 / FR-PAY-09 DONE** · **≠ PAY module UAT** · `payroll_e2e_ready=false` (c) must_keep **PAY01..08QC1** · ATT12+ATT11 (d) **DENY** CRUD alone DONE · **DENY** payslip PATCH · **DENY reopen** sealed J-* | AC-PAY-GROUP-H · MK-PEERS · **DRAFT** |

### 4.1 Mandatory regression (attach to PAY-09 QC — do not reopen sealed PAY-01..08)

| Journey ID | Slice | Title | Click path | AC / lock |
|------------|-------|-------|------------|-----------|
| **J-HRM-PAY-01-01** | **regression** | **PAY-01 period scope — non-regression** | Re-run **PAY01QC1** subset when group touches process | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-02** | **regression** | **Closed bind — non-regression** | Bind closed **2xx** · **ATT11QC1** cite | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-04** | **regression** | **Process ATT-412 — non-regression** | No closed → **412** | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-01-06** | **regression** | **Cross-read 0 — non-regression** | No leave/OT HTTP on process | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-02-05..07** | **regression** | **Formula order — non-regression** | ATT-412 → formula → … | **`PAY02QC1`** · **DRAFT** |
| **J-HRM-PAY-03-01..08** | **regression** | **GTCG on payslip — non-regression** | **PAY03QC1** subset | **`PAY03QC1`** · **DRAFT** |
| **J-HRM-PAY-04-05/06/08** | **regression** | **Segments + one net — non-regression** | Mid-month group/split | **`PAY04QC1`** · **DRAFT** |
| **J-HRM-PAY-05-01..08** | **regression** | **SI display — non-regression** | **PAY05QC1** subset | **`PAY05QC1`** · **DRAFT** |
| **J-HRM-PAY-06-01..08** | **regression** | **TNCN + process writer — non-regression** | **PAY06QC1** subset | **`PAY06QC1`** · **DRAFT** |
| **J-HRM-PAY-07-01..08** | **regression** | **Final pay read — non-regression** | **PAY07QC1** subset | **`PAY07QC1`** · **DRAFT** |
| **J-HRM-PAY-08-01..08** | **regression** | **Payslip lifecycle — non-regression** | Publish/TT/ESS subset when group label on GET | **`PAY08QC1`** · **DRAFT** |

**Promotion:** Journeys remain **DRAFT** until QA U65 browser evidence · QC GWC **C-SLICE** only · **≠** auto-flip `payroll_e2e_ready` · **narrow ≠ full PAY module**.

**BA trace:** `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` **§71** (minted with this pack).

---

## 5. HOLD / GAP rows (explicit — QC/Dev must not claim LIVE)

| ID | Topic | BA verdict | Unlock owner |
|----|-------|------------|--------------|
| **G-PAY-09-CRUD-BE** | Group CRUD routes | **GAP** | **dev-be** + **ba-data** |
| **G-PAY-09-DB** | `pay_payroll_group` physical | **GAP** | **ba-data** DATA-01 |
| **G-PAY-09-RESOLVE** | Resolver service | **GAP** | **dev-be** |
| **G-PAY-09-PERIOD-FK** | Period `payroll_group_id` wire | **GAP** | **dev-be** + **ba-data** |
| **G-PAY-09-SNAPSHOT** | Payslip writer | **GAP** | **dev-be** |
| **G-PAY-09-FE-CATALOG** | Catalog UI | **GAP AC** | **dev-fe** + **qa** |
| **G-PAY-09-FE-FILTER** | Period picker + report filter | **GAP AC** | **dev-fe** + **qa** |
| **G-PAY-09-409** | HRM-PAY-GROUP-409 | **GAP AC** | **dev-be** + **qa** |
| **H-PAY-09-WIRE** | wire-payment-batch SoT | **HOLD** | **O19** · PAY-08 |
| **H-PAY-09-AMIS** | Bank file / AMIS UI | **HOLD** | **O20** |

---

## 6. Handoff package

| To | Expectation | Done when |
|----|-------------|-----------|
| **ba-data** | **UNLOCK** — `pay_payroll_group` §5.5 physical · period/payslip FK wire · `match_rule_json` schema closable · **RETAIN** PAY-01..08 tables | DATA-01 PASS_TO_PM |
| **sa** | API-01 F.1 deepen **F-PAY-GROUP-01** · RETAIN PAY-08 O19 wire HOLD pointer · Mục đích · bước SRS | API cluster spec LOCK |
| **dev-be** | **HOLD** until DATA/API — CRUD · resolver · snapshot at process · filters · deny lifecycle PATCH | READY_FOR_QA when stamped |
| **dev-fe** | **HOLD** catalog UI · period group picker · report filter · read-only payslip badge | READY_FOR_QA when stamped |
| **qa** | U65 **J-HRM-PAY-09-01..08** mandatory · regression **J-PAY-01..08** subsets | PASS_TO_PM |
| **qc** | GWC C-SLICE · **≠ PAY-09 module UAT** · **≠ payroll_e2e_ready flip** · must_keep **PAY01..08** + ATT11/12 | PASS_TO_PM |

---

## 7. completion_report

| | |
|--|--|
| **Closed** | BA AC pack **O1–O20 CONFIRMED** for UC-BP-PAY-09 / FR-UC-BP-PAY-09 / **BR-BP-PAY-04** (SRS **BR-BP-PAY-GRP-01** normalized) / REQ_L_006 against SA Option A: **RETAIN** **F-PAY-PROCESS-01** + **PAY01QC1..PAY08QC1** normative order §4.2 + **ATT12QC1+ATT11QC1**; **GAP** **R-PAY-09-CRUD/RESOLVE/PERIOD-BIND/SNAPSHOT/ENROLL-FILTER/REPORT-FILTER/MID-MONTH/DENY-UI/JOURNEY**; **BIND** PAY-02 formula · PAY-04 mid-month · PAY-08 read labels; **CONFIRM O19–O20 HOLD** wire-batch peer PAY-08 · AMIS depth; AC-PAY-GROUP-*; mint **J-HRM-PAY-09-01..08 DRAFT** + regression **J-HRM-PAY-01..08** subsets (U65 FE-after-2xx+F5 · HRM-PAY-GROUP-409); unlock **ba-data DATA-01** + **sa API-01**; explicit **≠ PAY-09 / FR-PAY-09 DONE** · **≠ payroll_e2e_ready** · **≠ PAY module UAT** · **C-SLICE** · **DENY** CRUD alone DONE · **DENY** hardcode four groups · **DENY** payslip lifecycle PATCH · **DENY** FE group SoT · **DENY** reorder pipeline · **DENY reopen** sealed journeys |
| **Residual (open)** | ba-data DATA-01 · sa API-01 · dev-be/FE wire · QA J-* · QC GWC · O19–O20 footers |
| **next_owner** | **ba-data** (DATA-01 `pay_payroll_group`) · **sa** (API-01) · **pm** orchestration |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-BA-01.md` |

### 7.1 next_dispatch_prompt (copy-ready — ba-data DATA-01)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-09-CLUSTER-DATA-01
role: ba-data
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-45 seat #50)
lane: governance · UC-BP-PAY-09 · BA-01 PASS_TO_PM
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-SA-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md pay_payroll_group §5.5 · payroll_group_id on period §5.4 · pay_payslip §5.6 snapshot
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-DATA-01.md (payslip FK pattern)
entry_criteria: BA O1–O20 CONFIRMED · must_keep PAY01QC1-MSMBGWC1 + PAY02QC1-MSMC4GWC1 + PAY03QC1-MSMDDGWC1 + PAY04QC1-MSMCR4GWC1 + PAY05QC1-MSMDU2GWC1 + PAY06QC1-MSMECGWC1 + PAY07QC1-MSMEY7GWC1 + PAY08QC1-MSMFFXGWC1 + ATT12QC1-MSMAIGWC1 + ATT11QC1-MSLXTH9P · payroll_e2e_ready=false · U65
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-DATA-01.md
  - ADD migration plan for pay_payroll_group (code · name_vi · priority · match_rule_json · status)
  - Wire payroll_group_id FK on payroll_period + pay_payslip snapshot at process (writer PAY process only)
  - RETAIN PAY-01..08 physical tables · RETAIN process-written amount columns
  - ack_status PASS_TO_PM · unlock sa API-01 F-PAY-GROUP-01
cấm: apps/** · seed · honesty flip · flip payroll_e2e_ready · reopen sealed J-* · wipe PAY seals · hardcode four group enum · claim PAY-09 module DONE
```
