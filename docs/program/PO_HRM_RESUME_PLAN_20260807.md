# PO HRM — Pause / Resume Plan (sponsor tắt máy 2026-08-07 ~17:31+07)

**Trạng thái:** **PLAN EXIT IDLE** (2026-08-07T19:47+07) — K1–K6 chain CLOSED (slice GWC)  
**Orch:** `PM_ORCHESTRATION_MODE=STOP` · idle-ok this program · `pm:idle:check` exit 2 = **stale** superseded handoffs (do not re-open)  
**Honesty LOCKED:** `payroll_e2e_ready=false` · `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `C-SLICE-≠-MODULE`  
**DENY:** AMIS DONE · Phase1 · module UAT · formula LIVE · J-HRM-07 e2e

**Honesty (không đụng):**
- `payroll_e2e_ready=false`
- `contracts_printable_ready=false`
- `attendance_uat_ready=false`
- `C-SLICE-≠-MODULE`
- **DENY:** AMIS DONE · Phase1 DONE · module UAT · formula LIVE · J-HRM-07 process DONE

---

## 0. Resume protocol (PM — lượt đầu sau reboot)

1. `pnpm run pm:idle:check` (+ đọc đuôi bus ~80 dòng).
2. Set `.cursor/team/PM_ORCHESTRATION_MODE` = `RUN` **chỉ khi** sponsor muốn auto-followup; mặc định giữ `STOP` + dispatch thủ công.
3. **Không** re-dispatch seat đã **SEAL / GWC** dưới đây.
4. Chạy **một khúc** (K1→K2→…) tối đa 2–3 Task song song **trong cùng khúc**; xong khúc mới mở khúc sau.
5. Mỗi Task: `work_item_id` + evidence + U65 zero-seed + honesty locks.

---

## 1. Đã SEAL / GWC hôm nay — cấm reopen

| Khúc | Seat | Evidence / stamp |
|------|------|------------------|
| Formula L1 | EVAL · FE-EVAL · CB-BAG · ATT coerce+AC4 · Payslip GET | `po-hrm-payroll-formula-run-gap-qc-*.md` |
| AMIS TPL | DATA→QC | `po-hrm-amis-parity-pay-tpl-qc-02.md` |
| Platform CTR | MergeToken | `po-hrm-dynamic-config-platform-qc-01.md` |
| Contract XEVN-TPL | QC-EDIT | (prior) |
| W3 TDZ | showAddDialog | `po-hrm-payroll-formula-run-gap-qc-w3-j-hrm-07-01.md` · `PAYW3J07-R2-*` |
| ESS Step6 | L1 API | `po-hrm-amis-parity-pay-ess-qc-01.md` · `PAYESS-*` |
| Wire Step7 | L1 API | `po-hrm-amis-parity-pay-payment-wire-qc-01.md` · `PAYWIRE-MSIRV99D` |
| PAY catalog platform | UF+API | `po-hrm-dynamic-config-platform-pay-catalog-qc-01.md` |
| PAY-CFG O4 picker | AC-PAY-COMP-01 | `po-hrm-e2e-link-pay-cfg-qc-03.md` · `PAYCFGQA03-*` |
| Allowance dual SoT | L1 AC5 | `po-hrm-allowance-catalog-sync-qc-01.md` |
| Settings defaults | L1 TAX/SI/POS | `po-hrm-settings-defaults-qc-02.md` |
| Input pack Step4 | L1 API | `po-hrm-amis-parity-pay-input-pack-qc-01.md` · `PAYINPQA2-*` |
| SRC-02 PROCESS | emp_cb amounts | `po-hrm-amis-parity-emp-salary-history-qc-src-02-01.md` · `SRCSRC02-*` |
| source_tier field | GET lines | `po-hrm-amis-parity-emp-salary-history-qc-tier-01.md` · `SRCTIER-*` |
| **PAY-SRC-QC-02** | D-PAY-SRC-01 · emp_cb 9.5M · ATT-412 | `po-hrm-amis-parity-pay-src-qc-02.md` · stamp `PAYSRCQA2-ISVZ0J` **GWC SEAL 17:34** |
| **ATT catalog L1** | leave-types API | `po-hrm-dynamic-config-platform-att-qc-01.md` · stamp `ATTPLATQA-MSISVY4L` **GWC SEAL 17:34** |
| **QA FE-CB click** | Đãi ngộ POST 201 + `component_code` | `po-hrm-amis-parity-emp-salary-history-qa-src-02-02.md` · `SRCSRC0202-ISYBOK` |
| **QC FE-CB K1** | R-EMP-SH-FE-CB-CLICK SEALED | `po-hrm-amis-parity-emp-salary-history-qc-src-02-02.md` · **GWC SEAL 18:26** |
| **QA W3 PROCESS-POST** | Fresh draft POST /process 201 | `po-hrm-payroll-formula-run-gap-w3-qa-process-post-02.md` · `PAYW3PROC2-MSIT867S` |
| **QC W3 PROCESS-POST K2** | R-PAY-W3-PROCESS-POST CLOSED | `po-hrm-payroll-formula-run-gap-w3-qc-process-post-02.md` · **GWC SEAL 18:27** |
| **QA INPUT-PACK-03** | Thêm NV advance browser | `po-hrm-amis-parity-pay-input-pack-qa-03.md` · `PAYINPQA3-IT3RY3` |
| **QC INPUT-PACK K3** | FE Thêm NV · FE-01 CLOSED | `po-hrm-amis-parity-pay-input-pack-qc-02.md` · **GWC SEAL 18:27** |
| **QA PERIOD-BIND-02** | AC-PAY-TPL-03 F5 mẫu name | `po-hrm-amis-parity-pay-period-bind-qa-02.md` · `PAYBINDQA2-IT9Y27` |
| **QC PERIOD-BIND K4** | R-PAY-PERIOD-LIST-TPL CLOSED | `po-hrm-amis-parity-pay-period-bind-qc-02.md` · **GWC SEAL 18:27** |

**OBS idle-ok (không forced Task):** Nest POST 201 vs paper 200 · overview name P3 · XBOS 404 P2 HOLD · FE Chi trả wire OOS · `R-PAY-SRC-FRESH-PROCESS-SLOT` · OBS-PAYSLIP-DEEP-LINK P3 · `R-PAY-SRC-05-PROBE-NARROW`

---

## 2. Việc song song — trạng thái lúc PAUSE (cập nhật 17:34 late-notify)

| work_item_id | Role | Status 17:34 | Action khi resume |
|--------------|------|--------------|-------------------|
| `…-QA-SRC-02-02` | qa | **PASS** `SRCSRC0202-ISYBOK` | **Task qc** `…-QC-SRC-02-02` (K1 #1) |
| `…-PAY-SRC-QC-02` | qc | **GWC SEAL** | **cấm reopen** |
| `…-ATT-QC-01` | qc | **GWC SEAL** L1 | **cấm reopen**; `attendance_uat_ready=false` |
| `…-ATT-FE-01` | dev-fe | **READY_FOR_QA** | **Task qa** `…-ATT-QA-02` browser (K5) |
| `…-QA-PROCESS-POST-02` | qa | **PASS** `PAYW3PROC2-MSIT867S` | **Task qc** `…-QC-PROCESS-POST-02` (K2) |
| `…-PAY-INPUT-PACK-QA-03` | qa | **PASS** `PAYINPQA3-IT3RY3` | **Task qc** `…-INPUT-PACK-QC-02` (K3) |
| `…-PAY-PERIOD-BIND-QA-02` | qa | **PASS** `PAYBINDQA2-IT9Y27` | **Task qc** `…-PERIOD-BIND-QC-02` (K4) |

> Subagent có thể **bị cắt khi tắt máy**. Resume: grep bus/evidence mới nhất theo `work_item_id`; thiếu verdict → **re-dispatch cùng ID** với `entry=prior incomplete`.

---

## 3. Plan nối tiếp theo khúc (tuần tự — SoT resume)

### K1 — Đóng residual FE C&B + SRC honesty (P0) — **CLOSED GWC 18:26**

```
[DONE] PAY-SRC-QC-02 GWC SEAL
[DONE] QA-SRC-02-02 PASS (FE-CB-COMPONENT)
[DONE] QC-SRC-02-02 GWC — R-EMP-SH-FE-CB-CLICK SEALED
    evidence: docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qc-src-02-02.md
    CONDITION: C-SLICE-≠-MODULE only
    honesty: payroll_e2e_ready=false · no AMIS DONE
```

**Exit K1:** ✅ SRC-02 + tier + FE-CB QC GWC · `payroll_e2e_ready=false`

---

### K2 — W3 process POST (P0 J-HRM-07 path) — **CLOSED GWC 18:27**

```
[DONE] QA-PROCESS-POST-02 PASS PAYW3PROC2-MSIT867S
[DONE] QC-PROCESS-POST-02 GWC — R-PAY-W3-PROCESS-POST / FORMULA-412-VARS CLOSED
    evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qc-process-post-02.md
    OBS idle-ok: summary-cards-zero · bad-tpl-D · Sep 409
    honesty: payroll_e2e_ready=false · LIVE DENIED · J-HRM-07 e2e DENIED
```

**Exit K2:** ✅ process-post GWC · vẫn DENY formula LIVE / e2e_ready

---

### K3 — Input pack FE browser (P1) — **CLOSED GWC 18:27**

```
[DONE] QA-03 PASS PAYINPQA3-IT3RY3
[DONE] INPUT-PACK-QC-02 GWC — FE Thêm NV · FE-01 CLOSED
    evidence: docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qc-02.md
    OOS idle-ok: mark-paid picker · removeEmployee stubs
    honesty: payroll_e2e_ready=false · no AMIS DONE
```

**Exit K3:** ✅ Step4 API+FE Thêm NV GWC

---

### K4 — Period template bind F5 (P0) — **CLOSED GWC 18:27**

```
[DONE] QA-02 PASS PAYBINDQA2-IT9Y27
[DONE] PERIOD-BIND-QC-02 GWC — AC-PAY-TPL-03 · R-PAY-PERIOD-LIST-TPL CLOSED
    evidence: docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-qc-02.md
    OBS idle-ok: filter UX · picker label
    honesty: payroll_e2e_ready=false
```

**Exit K4:** ✅ AC-PAY-TPL-03 GWC · period bind SEAL

---

### K5 — Platform ATT vertical (P2) — **CLOSED GWC 18:52**

```
[DONE] ATT-QC-01 L1 GWC SEAL (ATTPLATQA-MSISVY4L)
[DONE] ATT-FE-01 READY_FOR_QA
[DONE] ATT-QA-02 PASS ATTPLATQA2-MSIVNE4A
[DONE] ATT-QC-02 GWC — browser AC-PLT-ATT-01..02 SEAL
    evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-qc-02.md
attendance_uat_ready=false · DENY module UAT / J-* / Phase1
```

**Exit K5:** ✅ L1+FE picker browser GWC · DENY full ATT UAT

---

### K6 — Residual + platform next (P2) — **CLOSED 19:47**

| Order | work_item_id | Role | Status |
|-------|--------------|------|--------|
| 6.1 | INS-TIMELINE | — | **SEAL skip** EMP D5 |
| 6.2→2e | REC SA→DATA→BE→QA/QC L1→FE→QA/QC browser | — | **GWC** (QC-02 stamp RECPLATQA2-MSIXNFE2) |
| 6.3 | SETTINGS-DEFAULTS FE UF | — | **GWC** |
| 6.4 | PAY-WIRE-FE browser | — | **GWC** |
| 6.5 | SUMMARY-CARDS | — | **GWC** |

**Exit K6:** ✅ all seats GWC/SEAL · DENY payroll_e2e / module UAT / Phase1

**Plan exit:** ✅ K1–K6 CLOSED — idle-ok this program (stale `pm:idle:check` noise = superseded; do not re-dispatch).

---

## 4. Copy-ready — message đầu phiên sau reboot

```text
Resume PO HRM theo docs/program/PO_HRM_RESUME_PLAN_20260807.md
1) pm:idle:check + bus tail
2) Intake mọi seat §2 còn OPEN
3) Chạy K1 rồi K2 (không mở K6)
4) Giữ payroll_e2e_ready=false · U65 zero-seed
5) PM_ORCHESTRATION_MODE=STOP trừ khi tôi nói RUN
```

---

## 5. Bus / working now

- Board cũ `PO_HRM_OPEN_WAVES_20260807.md` = snapshot 16:31 — **superseded bởi plan này**.
- Live: `docs/program/TEAM_WORKING_NOW.md` = **PAUSE**.
- Hook auto: **STOP** — không inject followup khi tắt máy.
