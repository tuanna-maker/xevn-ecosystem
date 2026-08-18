# Claude CLI — hàng đợi cuốn chiếu (rolling queue)

| Meta | Value |
|------|--------|
| **work_item_id** | `CLAUDE-ROLLING-QUEUE-01` |
| **owner** | **CURSOR-PM** (2026-08-10 reclaim) — Claude lane **PARKED** |
| **SoT UC** | `docs/program/PHASE1_UC_CLOSURE_BACKLOG.md` · matrix `docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md` |

---

## 1. SRS / matrix — còn bao nhiêu UC «chưa done»?

| Lớp | Số lượng | Ghi chú |
|-----|----------|---------|
| **Matrix `impl_status=planned`** | **1** | `UC-HRM-CO-01` — cần QA headcount browser + promote matrix sau BE/FE |
| **Matrix `waived`** | **1** | `UC-HRM-27` — không burn trừ PM mở waiver |
| **Matrix `e2e_pass`** | **244** | Jest/capability pass — **≠** nghiệm thu SRS đủ AC |
| **Fidelity P0 (sponsor)** | **~15+ nhóm** | Settings · CTR · PAY · REC/CORE · J-* DRAFT — xem backlog §3–§6 |

**Không claim Phase 1 DONE** khi còn fidelity + `UC-HRM-CO-01` planned + honesty flags (`payroll_e2e_ready`, `settings_catalog_e2e_ready`, …).

Gate: `pnpm phase1:gate` → `docs/qa/PHASE1_GATE_REPORT.md` (regenerate khi PM cần số mới).

---

## 2. Quy tắc cuốn chiếu (bắt buộc mỗi WI)

```text
Làm WI → test PASS → evidence docs/qa/evidence/<wi>.md
  → trong evidence: next_wi_id = <dòng queue kế>
  → TEAM_CLAUDE_STATUS: WI = DONE; active_wi = next_wi_id
  → PEER_PM_COLLAB §5 DONE + 1 dòng NEXT=<id>
  → ĐỌC NGAY mục «Queue» dưới — bắt đầu next_wi_id (không hỏi sponsor)
```

**Lead / teammate:** sau `TeammateIdle` hoặc task done → `Read docs/program/TEAM_CLAUDE_ROLLING_QUEUE.md` → lấy hàng `status=QUEUED` đầu tiên.

### 2b. Code gate (sponsor lock — không chỉ markdown)

- WI **dev-fe / dev-be** → DONE chỉ khi evidence có **`code_diff`** (path trong `apps/**`) + test exit 0 **trong phiên WI**.
- «Verified complete — no code changes» → **`VERIFY-ONLY`** (peer), **không** đánh DONE execution trên §3.
- Queue/status/peer **không** thay cho implement.

---

## 3. Queue (thứ tự execution — Claude `apps/web/hrm` + `apps/api/hrm-api`)

| # | work_item_id | status | lane | read_first (ngắn) | evidence mẫu |
|---|--------------|--------|------|-------------------|--------------|
| 1 | `PO-HRM-SETTINGS-CATALOG-CONSUMER-FE-01` | **DONE** | dev-fe | `UI-CATALOG-CONSUMER-EMP-REC.md` | `po-hrm-settings-catalog-consumer-audit-fe-01.md` |
| 2 | `HRM-CTR-U65-TPL-UV-FE-PATH-01` | **DONE** | dev-fe | `UI-CTR-CREATE-U65-TEMPLATE-PATH.md` | `hrm-ctr-u65-tpl-uv-fe-path-01.md` |
| 3 | `FE-PAY09-CATALOG-LIST-STALE` | **DONE** | dev-fe | QC residual PAY09FEQA1 | `po-hrm-mvp-gd1-pay-09-fe-catalog-stale-01.md` |
| 4 | `PO-HRM-SETTINGS-JD-MASTER-LIST-FE-01` | **DONE** | dev-fe | `UI-SETTINGS-JD-MASTER-LIST.md` | `po-hrm-jd-ia-list-detail-fe-01.md` |
| 5 | `PO-HRM-SETTINGS-CTR-TPL-COMPOSER-FE-01` | **DONE** | dev-fe | `UI-SETTINGS-CTR-TEMPLATE-COMPOSER.md` | `hrm-ctr-u65-tpl-uv-fe-path-01.md` (covers composer) |
| 6 | `PO-HRM-SETTINGS-ATT-LVT-SOT-BE-01` | **RECLAIMED → Cursor dev-be** | dev-be | ATT LVT dual SoT · `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md` | `po-hrm-settings-att-lvt-sot-be-01.md` |
| 6b | `D-HRM-CO-01-FE-HEADCOUNT-BIND-01` | **RECLAIMED → Cursor dev-fe** | dev-fe | `UI-CO-COMPANY-HEADCOUNT.md` | Cursor wave 01 |
| 7 | `HRM-CTR-CREATE-REDESIGN-FE-BE-02` | **PARKED** (collision) | dev-fe+be | — | Cursor đang giữ `ContractCreateStep1GeneralGrid` + `ContractCbReadOnlyCard` (`D-FE-CTR-CB-BOOT-01`) — **không** mở lại khi chưa có PM |
| 8 | `PO-HRM-MVP-GD1-REC-01-BE-01` | **DONE** | dev-be | `BA-MINDMAP-GAP-DELTA-01` ⚠ pipeline 5-state | `po-hrm-mvp-gd1-rec-01-be-01.md` · READY_FOR_QA |
| 9 | `QA-HRM-CO-01-HEADCOUNT-01` | **DONE** | qa | `UI-CO-COMPANY-HEADCOUNT.md` | `qa-hrm-co-01-headcount-01-test-log.md` · PASS_TO_PM |
| 10 | `BA-CTR-TPL-8-CLAUSE-MAP-01` | **DONE** | ba-process (docs-only) | `docs/program/specs/BA-CTR-INSURANCE-SALARY-SOURCE-01.md` §7 + `docs/từ khách hàng/2026.08.07. Hợp đồng mẫu X.E.xlsx` | `docs/program/specs/BA-CTR-TPL-8-CLAUSE-MAP-01.md` — **không** ghi `apps/**` |
| 11 | `PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-01` | **DONE** | dev-fe | P0 tabs ATT/EMP/SI catalog mutate · `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01` tab mutate | `po-hrm-settings-w3-mutate-fix-fe-01.md` · READY_FOR_QA |
| 12 | `PO-HRM-SETTINGS-FIDELITY-QA-02` | **DONE** | qa | Sau #11 · UF-HRM-10 · JD + ctr tpl · U65 FE→2xx→F5 | `po-hrm-settings-fidelity-qa-02.md` · PASS_TO_PM (stamp `SETFID02W3-MSNHB5VD`) |
| 12b | `QC-PO-HRM-SETTINGS-W3-MUTATE-GATE-01` | **DONE** | qc | GWC W3 P0 mutate 8/8 U65 + ATTLVTSOT smoke | `qc-po-hrm-settings-w3-mutate-gate-01.md` · PASS_TO_PM (stamp `SETW3MUTQC1-MSNHB5QC1`) |
| 13 | `HRM-CTR-CREATE-REDESIGN-FE-BE-02` | **PARKED** (collision) | dev-fe+be | `HRM-CI-01` · BA-02 AC-CTR-UX-06/07 · scope parity · allowed_paths slice | Cursor đang giữ `ContractCreateStep1GeneralGrid` + `ContractCbReadOnlyCard` |
| 14 | `QA-PO-HRM-SETTINGS-W3-BROWSER-01` | **DONE** | qa | Full 18-tab W3 browser sweep per §6.1 · stamp `SETW3SWP-MSNHWVTO` | `po-hrm-settings-w3-browser-01.md` · PASS_TO_PM |
| 15 | `QC-PO-HRM-SETTINGS-W3-SWEEP-GATE-01` | **DONE** | qc | GWC audit sweep vs AC-SWEEP-BOUNDARY · DENY settings_catalog_e2e_ready | `qc-po-hrm-settings-w3-sweep-gate-01.md` · PASS_TO_PM (stamp `SETW3SWPQC1-MSNHWVTOQC1`) |
| 16 | `HRM-CTR-PICKER-INLINE-PORTAL-01-RETEST-DND` | **DONE** | qa | U65 · không seed · DND Gỡ confirm · evidence `po-hrm-ctr-create-*` | `hrm-ctr-picker-inline-portal-01-retest-dnd.md` · **FAIL_TO_PM** (search testid missing, list shell visible) |
| 16b | `D-FE-CTR-TESTID-FIX-01` | **DONE** | dev-fe | Fix missing test IDs on ContractLegalPrintSettingsPanel (clauses + templates views) | `READY_FOR_QA` — build passed, all testids added |
| 16c | `HRM-CTR-PICKER-INLINE-PORTAL-01-RETEST-DND-V2` | **DONE** | qa | Re-run CTR clauses/templates retest after testid fix | `hrm-ctr-picker-inline-portal-01-retest-dnd-v2.md` · **PASS_TO_PM** (2026-08-18) |
| 15 | `HRM-MVP-GD1-PAY-09-CLUSTER-01` | **DONE** | dev-be | `po-hrm-mvp-gd1-pay-09-data-01.md` (§5.5 DONE) · agent a3754bebd2a359ebd | `po-hrm-mvp-gd1-pay-09-cluster-qa-01.md` · PASS_TO_PM · `po-hrm-mvp-gd1-pay-09-cluster-fe-qa-01.md` · PASS_TO_PM |
| 16 | `PO-HRM-MVP-GD1-PAY-09-DATA-01` | **DONE** | ba-data (PM-written, docs-only) | `pay_payroll_group` · DB_DESIGN §5.5 · unlock BE #15 | `po-hrm-mvp-gd1-pay-09-data-01.md` |
| 17 | `D-HRM-CO-01-INDUSTRY-FE-01` | **DONE** | dev-fe | `UC-HRM-CO-01` · FR-HRM-CO-IND-01 · promote matrix | `qa-d-hrm-co-01-industry-fe-01.md` · **PASS_TO_PM** (HOLD cleared 2026-08-18: XBOS BE :3002 live · AC-CO-IND-01..03 all PASS · Summary BE `qa-d-hrm-co-01-summary-be-01.md` PASS_TO_PM) |
| 18 | `UC-HRM-CO-01-PROMOTE` | **DONE** | pm (docs-only) | Promote UC-HRM-CO-01: industry+headcount+summary-be all QA PASS_TO_PM | `qa-d-hrm-co-01-industry-fe-01.md` · `qa-hrm-co-01-headcount-01.md` · `qa-d-hrm-co-01-summary-be-01.md` · **PASS_TO_PM** (2026-08-18) |
| 19 | `BA-CTR-TPL-8-CLAUSE-MAP-01-S7-IMPL-01` | **DONE** | dev-be | `docs/program/specs/BA-CTR-TPL-8-CLAUSE-MAP-01-S7-IMPL-01.md` — template_clause_override table + 5 BE endpoints | dispatched 2026-08-18 · BE live on :28001 (6 bound codes, HRM-VAL-001 path, soft warning) |
| 20 | `QA-BA-CTR-TPL-8-CLAUSE-MAP-01-S7-FE-01` | **DONE** | qa | ContractClauseOverrideEditor browser QA TC-S7-FE-01..05 | `docs/qa/evidence/qa-ba-ctr-tpl-8-clause-map-01-s7-fe-01.md` · **FAIL_TO_PM** (BUG-1 UUID 400, BUG-2 PK collision) |
| 20b | `BA-CTR-TPL-8-CLAUSE-MAP-01-S7-BE-FIX-01` | **DONE** | dev-be | Fix BUG-1 UUID accept + BUG-2 UUID PK | `ba-ctr-tpl-8-clause-map-01-s7-be-fix-01.md` · READY_FOR_QA |
| 21 | `QA-BA-CTR-TPL-8-CLAUSE-MAP-01-S7-FE-RETEST-01` | **DONE** | qa | Retest TC-S7-FE-01..05 after BUG fixes | `qa-ba-ctr-tpl-8-clause-map-01-s7-fe-01-retest.md` · **PASS_TO_PM** (PM-recovered retest, 2026-08-18) |

**S7 cluster CLOSED 2026-08-18** — BE ✅ · FE ✅ · QC ✅ · dev-be fix ✅ · QA retest ✅. Also closed this turn: **XBOS sync banner** (`XbosApiSyncBanner.tsx` now passes `tenantId`+`moduleId`; banner reads "Đã kết nối. Có 72 danh mục đã đồng bộ từ XBOS.").

**cursor:** S7 done → **no QUEUED item remains in §3** (all #1–#21 DONE). Next source: `docs/program/PHASE1_UC_CLOSURE_BACKLOG.md` fidelity P0 (~15 nhóm). **Blocker: 4 dead agents** (a0be5814 JD-BE, a4f73082 JD-FE, a5fdadd0 QA retest, a0c00f7b promote-matrix BE) all 0-byte transcripts — need re-dispatch or handoff to antigravity.

### 3b. Path lock Claude (sponsor 2026-08-12 — sau incident overwrite)

`.claude/settings.local.json` `permissions.deny` chặn Edit/Write vào vùng Cursor đang giữ:

| Vùng khoá | Owner Cursor |
|---|---|
| `apps/web/hrm/src/components/payroll/policy-pack/**` | `D-PAY-CNTT-FE-POLICY-PACK-RESTORE-01` |
| `ContractCreateStep1GeneralGrid.tsx` · `ContractCbReadOnlyCard.tsx` · `ContractCreateWizardDialog.tsx` | `D-FE-CTR-CB-BOOT-01` |
| `apps/api/hrm-api/src/contracts-insurance/**` | `D-BE-CTR-CB-BOOT-01` |
| `apps/api/hrm-api/src/payroll/**` | `PO-HRM-PAY-CNTT-BE-02` |

`WebSearch` + `WebFetch` đã **allow** ở permission, **nhưng** `web_search` là **server tool của Anthropic** — Claude Code đang chạy qua gateway `ANTHROPIC_BASE_URL=claude-api.zunef.com` nên bị trả `400 ENABLE_WEB_SERVER_TOOLS=false`. Đã thêm env `ENABLE_WEB_SERVER_TOOLS=1` (thử), nhưng **không bảo đảm**.

Fallback đang dùng: **WebFetch** (tool client-side, không phải server tool) với URL cụ thể; hoặc Cursor tra cứu hộ. Căn cứ luật cho #10 đã có sẵn: `docs/program/specs/REF-VN-LABOR-CONTRACT-CLAUSE-BASIS-01.md` (BLLĐ 2019 Đ.21/Đ.24 + **TT 10/2020/TT-BLĐTBXH Đ.3** — không phải NĐ 145/2020). **Luật ≠ SoT sản phẩm**: kết luận phải trích lại SRS/TechSpec + file khách.

---

## 4. Cấm (U65 + seal)

- `pnpm seed:*` · flip honesty flags · sửa W3 F5 sealed (`settingsCatalogFocus*`)
- OT / đào tạo / FaceID / formula builder GĐ1 (`BA-MINDMAP-GAP-DELTA-01` ⚠ P0-MAP)
- Claim module UAT / Phase 1 DONE

---

## 5. Agent team (1 lead — cuốn chiếu §3)

Sponsor **2026-08-10:** **một team** (terminal 27). Không Team B / terminal 2 trừ PM mở lại peer.

| Cách làm | Ghi chú |
|----------|---------|
| **Tuần tự (mặc định)** | Lead làm hoặc 1 teammate — xong WI → §3 DONE → **WI kế ngay** |
| **2 teammate** | Chỉ khi # và #+1 **khác path** (consumer vs CTR) — cùng path = một người |

Lead cập nhật bảng §3 `status` khi xong; Cursor QA song song (không chặn queue).

---

## 6. Paste ngắn (cuốn chiếu)

```text
Sau mỗi WI: evidence + DONE peer + cập nhật TEAM_CLAUDE_ROLLING_QUEUE.md §3 status.
Ngay lập tức: Read TEAM_CLAUDE_ROLLING_QUEUE.md → làm work_item_id QUEUED/IN_PROGRESS kế — không dừng hỏi sponsor.
```
