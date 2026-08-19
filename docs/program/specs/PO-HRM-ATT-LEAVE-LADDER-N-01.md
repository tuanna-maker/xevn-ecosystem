# PO-HRM-ATT-LEAVE-LADDER-N-01 — Chốt N ngày cắt L1/L2 hoặc WAIVE L2 Phase-1

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-ATT-LEAVE-LADDER-N-01` |
| from_role | sa |
| to_role | pm |
| lane | governance |
| change_mode | ADD decision SoT · **NO CODE** `apps/**` |
| date | 2026-08-06 |
| parent | `PO-HRM-E2E-LINK-ATT-SPEC-01` §4.1 · §5 P0-1 · `GAP-LEAVE-LADDER-01` |
| prior pack | `PO-E2E-LEAVE-LADDER-SA-01` … `QC-DOCS-01` (Option A configurable · Dev HOLD) |
| honesty | `attendance_uat_ready=false` · LV-02 not 🟢 · U65 zero-seed |
| ack_status | **PASS_TO_PM** |

---

## 0. Decision lock (SA recommendation)

| Item | Value |
|------|--------|
| **CHOSEN option** | **(2) WAIVE L2 Phase-1** — giữ AS-IS WF **1 bước** `direct_manager`; AC nghiệm thu Phase-1 = L1-only (LV-01) |
| **Production `N` / `T_L1`** | **NOT LOCKED** — **cấm** invent từ ASSUMPTION `T_L1=3` |
| **BR-LEAVE-LADDER-01 numeric cut** | **WAIVED for Phase-1 acceptance** — khung configurable Option A **giữ làm backlog GĐ1.5/GĐ2** (không wipe prior design) |
| **PM action same session** | Stamp bus: `PM CONFIRM PO-HRM-ATT-LEAVE-LADDER-N-01 = WAIVE_L2_PHASE1` (hoặc REJECT + sponsor số) |
| **attendance_uat_ready** | **false** (không claim) |

---

## 1. Evidence facts (no invention)

| # | Fact | Source |
|---|------|--------|
| F1 | FR-UC-H03 / FR-UC-B03 intent «phê duyệt **hai cấp**» — **không** ghi số ngày cắt L1 vs L2 | `po-e2e-ba-case-matrix-01.md` GAP-LEAVE-LADDER-01 · A/B |
| F2 | Enterprise **FR-UC-BP-ATT-09** Diễn biến / sequence = **một** Quản lý duyệt + hold quỹ — **không** ngưỡng ngày → L2 | `SRS_HRM_ENTERPRISE.md` FR-UC-BP-ATT-09 |
| F3 | WF catalog `hrm_leave_approval` = **đúng 1 bước** `manager_approval` · `resolver_type: direct_manager` · fallback `hrbp` — `conditions` chỉ `businessType: hrm_leave` — **không** `total_days` | `workflow-catalog.constants.ts` `buildHrmLeaveApprovalWorkflowDefinition()` |
| F4 | `LeaveWorkflowBridge` spawn/callback terminal sau instance complete — **không** nhánh ngày / L2 | `leave-workflow.bridge.ts` · matrix D |
| F5 | ốm ≥3 ngày attachment + phép năm báo trước ≥3 ngày lịch = **validation submit** — **≠** ngưỡng ladder | BR-LEAVE-ATT-01 · BR-LEAVE-NOTICE-01 LOCKED |
| F6 | HDSD HRM (CH06 skim) **không** có bảng «Số ngày → người duyệt» | matrix GAP-LEAVE-LADDER-02 · HDSD inventory |
| F7 | Prior SA **Option A** = configurable `leave_l1_max_days` / `T_L1` + WF 2 bước + skipWhen — **không** khóa production `N` | `po-e2e-leave-ladder-sa-01.md` |
| F8 | Pilot `T_L1 = 3` chỉ **ASSUMPTION** / `Q-LEAVE-LADDER-01` OPEN — QC GWC **cấm** 🟢 LV-02 / Dev unlock trên ASSUMPTION alone | `po-e2e-leave-ladder-qc-docs-01.md` · `C-LEAVE-DEV-UNLOCK-01` |
| F9 | Bus/program: **không** có dòng sponsor CONFIRM giá trị `T_L1` / `N` | `AGENT_MESSAGE_BUS.md` leave-ladder entries |
| F10 | AS-IS runtime vẫn 1 bước (2026-08-06 disk) | F3 re-read |

**Implication:** Option matrix ô **(1) N=X từ evidence** = **NOT AVAILABLE** — không có X evidence-locked. Chọn X=3 từ ASSUMPTION = **invent** → **REJECT** theo lệnh seat.

---

## 2. Option matrix

### (1) Lock `N = X` days from evidence

| Dimension | Detail |
|-----------|--------|
| **Summary** | Ghi cứng `N` vào BR-LEAVE-LADDER-01 từ artifact đã có (WF / HDSD / sponsor stamp / enterprise FR). |
| **Evidence of X** | **None.** Không X trong WF graph; không bảng HDSD; không sponsor CONFIRM; ASSUMPTION 3 ≠ SoT. |
| **Verdict this seat** | **INELIGIBLE / REJECT** — cấm invent X. |
| **If later unlocked** | Chỉ khi sponsor ghi rõ số nguyên trên bus **hoặc** config-from-FE + U65 set `leave_l1_max_days` rồi mới Dev ladder (prior Option A). |
| **Risk if forced** | Toàn hệ duyệt sai; QA 🟢 giả; CR sớm giữa CT thành viên. |

### (2) WAIVE L2 Phase-1 — keep 1-step + AC honesty (**RECOMMENDED**)

| Dimension | Detail |
|-----------|--------|
| **Summary** | Phase-1 **không** yêu cầu L2 theo ngày. Nghiệm thu leave approval = AS-IS **1 bước** QL trực tiếp. Intent «hai cấp» / LV-02 / BR numeric cut = **WAIVED Phase-1** (deferred). |
| **Scope** | ATT E2E spine leave L7 PASS-able; L8 / LV-02 / ATT-SB-01 / ATT-SS-01 = honesty **out_mvp / waived_p1** |
| **Complexity** | Lowest — docs honesty only; **no** WF 2-step Dev này wave |
| **Pros** | Khớp runtime + FR-UC-BP-ATT-09 một QL; unblocks ba-docs merge ATT §4.1 với text WAIVE; không invent N; LV-01 vẫn U65; giữ prior Option A pack làm backlog không mâu thuẫn |
| **Cons** | Intent FR-UC-H03 «hai cấp» chưa ship; competitive gap ladder còn; phải AC honesty rõ để QC không đọc nhầm UAT-ready |
| **Failure modes** | (a) Team vẫn claim «hai cấp LIVE» → mitigate: matrix / HDSD / UF copy WAIVE. (b) Dev hardcode N=3 «cho nhanh» → TM reject. (c) Sponsor sau muốn L2 → reopen Option A path, không đè WAIVE im lặng |

### (3) Other found in WF / prior architecture (not a numeric N)

| Sub-option | Detail | This seat |
|------------|--------|-----------|
| **3a AS-IS WF only** | Catalog đã là 1 bước — không «other ladder» runtime | = nền của (2) |
| **3b Always L1+L2 (no day cut)** | Prior SA Option C — mọi đơn 2 bước | **Not chosen** — UX overload; không đóng «ngày→cấp»; vẫn cần Dev WF; không có sponsor ask |
| **3c Configurable `T_L1` (prior Option A)** | Physical docs pack + Dev HOLD `C-LEAVE-DEV-UNLOCK-01` | **PRESERVE as backlog** — **không** thay WAIVE Phase-1; **không** = chốt N |
| **3d Config-from-FE unlock without numeric sponsor** | QC condition (b) | **Out of this seat** — cần PM/sponsor explicit unlock riêng; vẫn không invent default N |

**Trade-off (Phase-1 gate)**

| Criterion | (1) N=X | (2) WAIVE L2 P1 | (3c) Config A now |
|-----------|---------|-----------------|-------------------|
| Evidence-backed | **No** | **Yes** (AS-IS) | Design yes; runtime no |
| No invent N | Fail | **Pass** | Pass (no number) |
| Unblock ATT ba-docs P0-1 | Blocked | **Yes** | Partial (still no N) |
| Match WF today | No | **Yes** | No until Dev |
| Multi-entity future | N/A | Deferred via 3c | Best long-term |
| attendance_uat_ready | Still false | Still false | Still false |

---

## 3. Recommendation + rationale + residual risk

### Recommend **(2) WAIVE L2 Phase-1**

**Rationale (ordered):**

1. **No invent:** Seat cấm invent N; evidence không cung cấp X → (1) illegal.
2. **Runtime honesty:** WF + bridge = 1 bước; FR-UC-BP-ATT-09 một QL — Phase-1 AC phải khớp ship được, không khớp intent H03 chưa implement.
3. **Prior ASSUMPTION ≠ lock:** `T_L1=3` đã bị QC gắn ASSUMPTION / Dev HOLD — dùng làm production N = vi phạm `C-LEAVE-DEV-UNLOCK-01`.
4. **Unblock P0-1 docs:** ATT SPEC §5 cho phép «chốt N **hoặc** WAIVE L2 Phase-1» — WAIVE là đường duy nhất evidence-clean hôm nay.
5. **Preserve Option A:** Không wipe `BR-LEAVE-LADDER-01` khung configurable / TechSpec skipWhen — đánh dấu **Phase-1 WAIVED / GĐ1.5 HOLD** đến sponsor số hoặc config-from-FE.

### Residual risks

| ID | Risk | Severity | Mitigation |
|----|------|----------|------------|
| R1 | Stakeholder đọc «hai cấp» trên H03 là LIVE | P1 | ba-docs WAIVE + HDSD honesty; matrix LV-02 = WAIVED_P1 / ⬜ |
| R2 | Dev implement ladder với N=3 im lặng | P0 | Keep `C-LEAVE-DEV-UNLOCK-01`; no Dev ladder until reopen |
| R3 | ATT UAT claimed vì sheet 🟢 + leave L1 | P0 | `attendance_uat_ready=false` until SB-02/03 + honesty ladder |
| R4 | Option A docs orphan nếu `SRS_NEW` path missing on disk | P2 | ba-docs merge WAIVE vào SoT **đang sống** (Enterprise + team SRS / ATT SPEC); pointer prior evidence |
| R5 | Sponsor muốn L2 ngay | P1 product | PM reopen: stamp N **or** config-from-FE → DOCS reopen → WF-01 — không dùng seat này |

---

## 4. What WAIVE means (AC honesty — ba-docs must merge)

| Surface | Phase-1 AC |
|---------|------------|
| **LV-01** | Đơn nghỉ (mọi `total_days` AS-IS) → L1 `direct_manager` → terminal `approved`/`rejected` — **in-scope** U65 |
| **LV-02** | L2 theo ngưỡng ngày — **WAIVED Phase-1** — verdict tối đa ⬜ / WAIVED_P1 — **cấm** 🟢 |
| **BR-LEAVE-LADDER-01** | Numeric cut `total_days ? N` — **không enforce Phase-1**; text WAIVE + pointer Option A backlog |
| **WF graph** | Remain 1 step; **không** bắt Dev 2 bước dưới WAIVE |
| **HDSD** | Không bảng ngày→cấp Phase-1; ADD dòng honesty: «Phê duyệt đơn nghỉ GĐ1 = quản lý trực tiếp (một cấp)» |
| **FR-UC-H03 «hai cấp»** | Intent **deferred** / GĐ1.5 — không xóa FR; DOC-DELTA honesty |
| **FR-UC-BP-ATT-09** | Hold quỹ + một QL — **must_keep** Phase-1 SoT ATT |
| **Reopen trigger** | Sponsor bus CONFIRM `N=<int>` **or** `config-from-FE unlock` → supersede WAIVE → `PO-HRM-ATT-LEAVE-LADDER-WF-01` |

**Cấm dưới WAIVE:** seed inbox; claim ladder LIVE; claim `attendance_uat_ready`; hardcode Nest `const N = 3`.

---

## 5. Relation to prior leave-ladder pack (must_keep)

| Artifact | Status under WAIVE |
|----------|-------------------|
| `po-e2e-leave-ladder-sa-01` Option A | **PRESERVED** backlog — not contradicted |
| SRS/TechSpec/DB/API physical keys (`leave_l1_max_days`, skipWhen, `HRM-LEAVE-CFG-LADDER`) | **HOLD implement** — docs may stay; runtime not required Phase-1 |
| `C-LEAVE-DEV-UNLOCK-01` | **REMAINS** — WAIVE strengthens «no Dev ladder now» |
| `Q-LEAVE-LADDER-01` | Stays OPEN until sponsor — WAIVE không đóng bằng số giả |
| `R-PO-LEAVE-DAY-LADDER` | **CLOSE as WAIVED_P1** (process) **or** rename residual `R-LEAVE-LADDER-GĐ15` — PM stamp; **không** CLOSE as IMPLEMENTED |

---

## 6. PM stamp (copy-ready bus — same session)

```text
## 2026-08-06 | pm -> all | CONFIRM PO-HRM-ATT-LEAVE-LADDER-N-01
- decision: WAIVE_L2_PHASE1
- N / T_L1 production: NOT_LOCKED (cấm invent; ASSUMPTION T_L1=3 không dùng)
- Phase-1 leave approval AC: 1-step direct_manager only (LV-01)
- LV-02 / day-ladder L2: WAIVED_P1 · reopen = sponsor N or config-from-FE
- next: ba-docs PO-HRM-ATT-LEAVE-LADDER-DOCS-01 (merge WAIVE text)
- honesty: attendance_uat_ready=false
- ref: docs/program/specs/PO-HRM-ATT-LEAVE-LADDER-N-01.md
```

Nếu sponsor **REJECT** WAIVE và đưa số: stamp `N=<int>` + Option (1) path — **không** để SA đoán.

---

## 7. Copy-ready next_dispatch — ba-docs

```text
work_item_id: PO-HRM-ATT-LEAVE-LADDER-DOCS-01
from_role: pm
to_role: ba-docs
lane: governance
priority: P0
ack_target: PASS_TO_PM
change_mode: ADD / DOC-DELTA only · no wipe FR ATT/H03 · no_prompt_echo: true
CHOSEN: WAIVE_L2_PHASE1 (SA PO-HRM-ATT-LEAVE-LADDER-N-01 — PM stamp confirm-on-bus trước hoặc cùng wave)

ENTRY:
- Read: docs/program/specs/PO-HRM-ATT-LEAVE-LADDER-N-01.md
- Read: docs/program/specs/PO-HRM-E2E-LINK-ATT-SPEC-01.md §4.1 §5 P0-1
- Read: docs/qa/evidence/po-e2e-ba-case-matrix-01.md GAP-LEAVE-LADDER-01
- Read: docs/qa/evidence/po-e2e-leave-ladder-sa-01.md (Option A PRESERVE backlog)
- PM bus CONFIRM WAIVE_L2_PHASE1 (hoặc attach stamp trong packet)

MISSION (docs only — NO apps/**):
1) Merge WAIVE text vào SoT sống (Enterprise SRS / team SRS / ATT linkage):
   - Phase-1 phê duyệt đơn nghỉ = một cấp QL trực tiếp (khớp WF hrm_leave_approval 1 bước).
   - BR-LEAVE-LADDER-01 numeric cut + LV-02 = WAIVED Phase-1; intent «hai cấp» deferred GĐ1.5.
   - CẤM ghi production N / T_L1=3 vào BR body.
2) HDSD delta honesty (BR-LEAVE-LADDER-HDSD-01 Phase-1): «GĐ1 = QL trực tiếp»; không bảng ngày→cấp đến khi reopen.
3) Pointer giữ Option A configurable (`leave_l1_max_days` + WF L2 skipWhen) = backlog — không wipe prior evidence.
4) Update ATT SPEC §4.1 / matrix rows: LV-02 WAIVED_P1; ATT-SB-01 / ATT-SS-01 honesty under WAIVE.
5) Explicit: attendance_uat_ready=false; không claim ladder LIVE / Phase-1 leave L2 DONE.

EXIT:
- evidence: docs/qa/evidence/po-hrm-att-leave-ladder-docs-01.md
- ack_status: PASS_TO_PM
- completion_report + next_dispatch_prompt (sau WAIVE docs: PM → qa spine LV-01 honesty / hoặc funnel-sign seats — CẤM PO-HRM-ATT-LEAVE-LADDER-WF-01 Dev trừ reopen)

CẤM: invent N · seed · apps/** · wipe FR-UC-BP-ATT-09 · claim attendance_uat_ready
```

---

## 8. Cascade after WAIVE docs

```text
PM stamp WAIVE_L2_PHASE1
 → PO-HRM-ATT-LEAVE-LADDER-DOCS-01 (ba-docs)  [THIS next]
 → (optional) matrix/QA stamp LV-02 WAIVED_P1
 → PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01 / SIGN-QA / SPINE web  [parallel ATT P0 — not ladder Dev]
 → PO-HRM-ATT-LEAVE-LADDER-WF-01  [BLOCKED until reopen N or config-from-FE]
```

---

## 9. Honesty locks

| Flag | Value |
|------|--------|
| `attendance_uat_ready` | **false** |
| Leave L2 ladder Phase-1 | **WAIVED** |
| Production `N` / `T_L1` | **NOT_LOCKED** |
| ASSUMPTION `T_L1=3` usable as BR | **false** |
| WF AS-IS steps | **1** |
| Option A backlog preserved | **true** |
| U65 zero-seed | **true** |

---

## Completion contract

- `completion_report`: Closed Option matrix (1 ineligible / 2 recommended WAIVE / 3c preserve backlog); locked SA recommendation **WAIVE_L2_PHASE1**; no production N; copy-ready ba-docs DOCS-01; no apps/**; no attendance_uat_ready claim.
- `next_owner`: **pm** (bus CONFIRM stamp) → **ba-docs** `PO-HRM-ATT-LEAVE-LADDER-DOCS-01`
- `next_dispatch_prompt`: §7 above
- `evidence_path`: `docs/program/specs/PO-HRM-ATT-LEAVE-LADDER-N-01.md` · `docs/qa/evidence/po-hrm-att-leave-ladder-n-01.md`
- `ack_status`: **PASS_TO_PM**
)
