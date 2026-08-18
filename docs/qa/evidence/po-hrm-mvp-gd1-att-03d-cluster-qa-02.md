# Evidence — PO-HRM-MVP-GD1-ATT-03D-CLUSTER-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-03D-CLUSTER-QA-02` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · U89 Wave-32 · residual closeout |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `ATT03DQA2-MSM21VKS` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (narrow J-03 status/CODE-KEY **CLOSED**) |
| **depends_on** | FE-02 `po-hrm-mvp-gd1-att-03d-cluster-fe-02.md` · QA-01 `ATT03DQA1-MSM1826M` · QC **`ATT03DQC1-MSM1CR19`** RETAIN |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&companyId=main` |
| **env** | hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| **runner** | Patched U65 Playwright (QA-01 harness · **no POST status rewrite** · picker click on `clock-in-gps-attendance-code`) |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-03d-cluster-qa-01.json` (run tag `qa02_no_rewrite=1`) |
| **unit** | `pnpm --dir apps/web/hrm exec vitest run` FE-02 tests **19 PASS** |

---

## Honesty (mandatory)

| Flag | Value |
|------|--------|
| `attendance_uat_ready` | **false** · **≠ ATT-03d module UAT** · **≠ ATT module UAT DONE** |
| `contracts_printable_ready` | **false** RETAIN |
| PAY / printable invent | **OUT** |
| Nest `/core` geofence SoT | **0** non-404 |
| U65 | **zero-seed** · no `pnpm seed:*` · ensureDefault **0** |
| Seals RETAIN | **`ATT03DQC1-MSM1CR19`** · ATT03BQC1-MSM0891H · ATT01/11/10/09/08/02 · PLT/CORE · ATTWSQA* |
| **C-SLICE** | **≠** reopen full ATT-03d module UAT |

---

## Verdict (narrow exit)

| Gate | Result |
|------|--------|
| **L0** | hrm **200** · xbos **200** · portal **200** · Nest `/core/attendance/work-sites` **404** |
| **J-HRM-ATT-03D-03** (status/CODE-KEY) | **PASS** — EFF>0 · GPS confirm · **POST** `…/records` **201** `HRM-ATT-201` · **no** `HRM-ATT-CODE-KEY` · method=gps · lat/lon · eff=`wfh_qa_fe_mskcja95` · **no QA rewrite** |
| **J-HRM-ATT-03D-04** (regression GEO) | **PASS** — **400** `HRM-ATT-GEO-001` |
| **J-HRM-ATT-03D-05** (regression GEO-REQ) | **PASS** — **400** `HRM-ATT-GEO-REQ` · no silent 2xx |
| **Nest `/core` geofence** | **0** |
| **Residual R-ATT-03D-CNS-STATUS-CODE** | **CLOSED** |

---

## UF block — J-HRM-ATT-03D-03

- **Click path:** Login inject → Chấm công → Clock-In → GPS → chọn NV → **Mở xác nhận** → (picker mã effective khi hiển thị) → **Check-in** → Network **POST** `/api/hrm/attendance/records` **201**.
- **Trước mutate:** NV chưa vào ca hôm nay (emp index 1 trong combobox).
- **Network:** POST **201** `HRM-ATT-201` · `check_in_method=gps` · lat/lon in body · response code ≠ `HRM-ATT-CODE-KEY`.
- **FE sau 2xx:** toast thành công · không banner lỗi CODE-KEY.
- **F5:** không bắt buộc full module (narrow slice); punch path verified same session.
- **Verdict:** **PASS**
- **spec_ref:** FE-02 · `UC-BP-ATT-03d` · QA-01 residual `R-ATT-03D-CNS-STATUS-CODE`

---

## completion_report

**Closed:** Residual **`R-ATT-03D-CNS-STATUS-CODE`** — GPS punch binds Nest effective attendance code (FE-02); browser retest **without** QA POST rewrite; **201** without **HRM-ATT-CODE-KEY**; J-04/J-05 regression PASS; Nest `/core` **0**; vitest FE-02 **PASS**.

**Residual:** OVERLAP/SITE/MOB **HOLD** · R-ATT-01-ASSIGN **open** · manual/QR/Face picker bind out of slice · **≠ ATT-03d DONE** · **≠ ATT module UAT**.

**Honesty stamps retained:** ATT03DQC1-MSM1CR19 · ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM · peer ATT-11/10/09/08/02 · PLT/CORE · ATTWSQA* · printable false · PAY OUT.

---

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-ATT-03D-CLUSTER-QC-02-RESIDUAL-SEAL
role: qc
entry_criteria: QA-02 PASS_TO_PM @ docs/qa/evidence/po-hrm-mvp-gd1-att-03d-cluster-qa-02.md · stamp ATT03DQA2-MSM21VKS · R-ATT-03D-CNS-STATUS-CODE CLOSED · prior GWC ATT03DQC1-MSM1CR19 RETAIN · L0 200 · Nest /core 0 · U65
exit_criteria: Micro-GWC — audit QA-02 narrow evidence only (J-03 status + J-04/J-05 regression) · confirm residual CLOSED · honesty ≠ ATT-03d module UAT · seals RETAIN · DENY invent ATT DONE/UAT · PASS_TO_PM seal note
cấm: reopen full ATT-03d UAT · seed · claim module DONE
persona: ceo@xe.vn / Xevn@2026 · portal :5173
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-att-03d-cluster-qc-02-residual-seal.md
```

**ack_status:** `PASS_TO_PM`  
**next_owner:** `qc`
