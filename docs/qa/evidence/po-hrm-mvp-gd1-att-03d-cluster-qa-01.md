# Evidence — PO-HRM-MVP-GD1-ATT-03D-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-03D-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-32 · UC-BP-ATT-03d) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `ATT03DQA1-MSM1826M` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (J-03 **PASS_WITH_RESIDUAL**) |
| **uc_ids** | `UC-BP-ATT-03d` · `FR-UC-BP-ATT-03d` · **BR-BP-GPS-01** |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `attendance_uat_ready=false` · **≠ ATT-03d DONE** · PLT WS / CNS-05 ≠ FR-03d DONE · ≠ residual/thin=ATT-03b DONE · ≠ catalog=ATT-01 · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ soft/ATT-08=ATT-09 · ≠ ATT module UAT · CFG≠ATT-02 · printable false · PAY OUT · Nest `/core` DENY · R-ATT-01-ASSIGN **open** · DENY `att_leave_hold` · DENY `ensureDefaultWorkSite` · DENY `gps_locations` sole · OVERLAP/SITE/MOB HOLD · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | FE-01 READY · API-01 CONFIRMED RETAIN · BA J-HRM-ATT-03D-01..06 · HDSD CH05b · must_keep ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P ≠ ATT-03d DONE |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-att-03d-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-03d-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-att-03d-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · **DENY** claim PLT WS / thin CRUD = ATT-03d DONE · **DENY** residual/thin=ATT-03b DONE · **DENY** catalog/LIVE/AGG DONE · **DENY** ATT module UAT · **DENY** invent PAY/printable · **DENY** invent ASSIGN / `att_leave_hold` · **DENY** honesty flip · **DENY** seed / ensureDefault |
| **L0** | hrm **200** · xbos **200** · portal `:5173` **200** · Nest `/core/attendance/work-sites` **404** |
| **L2.5 J-*** | **J-01 PASS** · **J-02 PASS** · **J-03 PASS_WITH_RESIDUAL** · **J-04 PASS** · **J-05 PASS** · **J-06 PASS** |
| **Nest `/core` geofence** | probe **404** · Network SoT non-404 **= 0** |
| **Seed / ensureDefault** | **none** (U65) · ensureDefault hits **0** · gps_locations sole mutate **0** |

**Explicit ≠ DONE:** FE GPS Nest bind + punch geofence **≠** ATT-03d / FR-03d module DONE · PLT WS / CNS-05 ≠ ATT-03d DONE · **≠** ATT module UAT · printable **false** · PAY **OUT** · **C-SLICE**.

---

## Spec / seal cite

| Artifact | Cite |
|----------|------|
| BA-01 | `PO-HRM-MVP-GD1-ATT-03D-CLUSTER-BA-01.md` J-HRM-ATT-03D-01..06 · AC-ATT-03D-* · O1–O12 |
| API-01 | F-ATT-CAT-WS-01/02 physical `…/attendance/work-sites*` · F-ATT-PUNCH-01 `…/records` · Nest `/core` DENY |
| FE-01 | `docs/qa/evidence/po-hrm-mvp-gd1-att-03d-cluster-fe-01.md` READY_FOR_QA |
| HDSD | `HDSD_XEVN_CH05b_HRM_DANH_MUC_DIEM_GPS.md` — Thiết lập → Điểm GPS · chấm GPS · ngừng · empty |
| ATT-03b QC | **`ATT03BQC1-MSM0891H`** RETAIN · ≠ residual/thin=DONE |
| ATT-01 QC | **`ATT01QC1-MSLZ3KIM`** RETAIN · ≠ catalog=DONE · R-ATT-01-ASSIGN **open** |
| ATT-11/10/09/08/02 | RETAIN stamps · ≠ LIVE/AGG/soft DONE · CFG≠DONE |
| PLT / CORE | RETAIN · printable false · soft≠CORE-06 |
| PLT WS / CNS-05 | **`ATTWSQA-MSJC3IN9`** · **`ATTWSQA2-MSJCG47P`** · **≠** ATT-03d DONE |
| PAY | **OUT invent DONE** |

---

## Browser U65 — journeys

Persona: portal auth inject · `/hr/attendance?portal=1&companyId=main` → **Thiết lập** (HDSD «Cài đặt») → **Quy định chấm công** → **Ứng dụng** → `att-gps-sites-card` · Clock-In → GPS · **zero-seed**.

**hdsd_align:** `att-settings-shell-precision` · `hdsd-att-rules-tab-app` · `att-gps-sites-card` · `att-gps-add-open` · `att-gps-retire-*` · `att-03d-empty-cta` · `att-03d-honesty` · `clock-in-method-gps` · `clock-in-gps-confirm-checkin` · `att-03d-punch-empty-cta`.

| J-* | Click path / assert | Network / FE | Verdict |
|-----|---------------------|--------------|---------|
| **J-HRM-ATT-03D-01** | Thiết lập → Quy định → Ứng dụng → Thêm điểm tên·lat·lon·bán kính → **Lưu** · F5 | **POST** `/api/hrm/attendance/work-sites` **201** · statusLabelVi **Đang hiệu lực** · Nest `/core` **0** · ≠ PLT WS=DONE | **PASS** |
| **J-HRM-ATT-03D-02** | **Ngừng theo dõi** → list mặc định ẩn · F5 | **PATCH** `…/work-sites/:id` **200** `active=false` · Nest **0** | **PASS** |
| **J-HRM-ATT-03D-03** | Clock-In GPS · tọa độ ∈ bán kính → Check-in | **POST** `…/records` **201** `HRM-ATT-201` · method=gps · lat/lon · Nest **0** · residual FE status hardcode (below) | **PASS_WITH_RESIDUAL** |
| **J-HRM-ATT-03D-04** | GPS OOS → Check-in | **400** `HRM-ATT-GEO-001` · toast ngoài vùng · no silent 2xx · Nest **0** | **PASS** |
| **J-HRM-ATT-03D-05** | FE Check-in GPS · strip lat/lon on POST (method=gps) | **400** `HRM-ATT-GEO-REQ` · silent2xx=false · Nest **0** | **PASS** |
| **J-HRM-ATT-03D-06** | Soft-retire all → empty CTA Settings + punch · honesty footer | `att-03d-empty-cta` + `att-03d-punch-empty-cta` · ensureDefault **0** · seals RETAIN · printable false · PAY OUT · ≠ ATT-03d DONE · Nest **0** | **PASS** |

Screens: `01-j01-gps-before` … `11-j06-punch`.

---

## AC map

| AC / exit row | Result |
|---------------|--------|
| Admin CRUD · Network `/attendance/work-sites*` · Nest `/core` 0 · F5 · statusLabelVi | **PASS** (J-01) |
| Soft-retire `active=false` · ẩn list mặc định | **PASS** (J-02) |
| In-radius records 2xx · method=gps · lat/lon | **PASS_WITH_RESIDUAL** (J-03) |
| OOS → `HRM-ATT-GEO-001` | **PASS** (J-04) |
| method=gps thiếu lat/lon → `HRM-ATT-GEO-REQ` · FAIL silent 2xx | **PASS** (J-05) |
| Empty skip+CTA · DENY ensureDefault/seed · honesty ≠ DONE · seals | **PASS** (J-06) |
| Nest `/core` geofence SoT | **PASS** (0 non-404) |
| U65 zero-seed | **PASS** |

---

## Network summary

| Metric | Value |
|--------|-------|
| `…/attendance/work-sites*` | GET/POST/PATCH observed · POST **201** · PATCH **200** |
| `…/attendance/records` POST | **201** `HRM-ATT-201` (in) · **400** `HRM-ATT-GEO-001` · **400** `HRM-ATT-GEO-REQ` |
| Nest `/core` geofence SoT non-404 | **0** |
| `ensureDefaultWorkSite` | **0** |
| `gps_locations` sole mutate | **0** |
| Seed | **none** |

---

## Residual / must_keep (RETAIN)

| Class | Status |
|-------|--------|
| **R-ATT-03D-CNS-STATUS-CODE** (P2 · `dev-fe`) | **OPEN** — GPS `checkIn` hardcodes `status=present` → **`HRM-ATT-CODE-KEY`** when EFF>0; QA rewrote body status → effective `wfh_qa_fe_mskcja95` only to prove geofence **201** · peer ATT-CODE · **≠** invent ATT-03d DONE · **≠** catalog=ATT-01 DONE |
| OVERLAP / SITE / MOB | **HOLD** |
| R-ATT-01-ASSIGN | **open** (must_keep) |
| ATT-03b `ATT03BQC1-MSM0891H` ≠ residual/thin=DONE | **RETAIN** |
| ATT-01 `ATT01QC1-MSLZ3KIM` ≠ catalog=DONE | **RETAIN** |
| ATT-11/10/09/08/02 / PLT / CORE · printable false | **RETAIN** |
| ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P ≠ ATT-03d DONE | **RETAIN** |
| Nest `/core` | **ABSENT** (Network 0) |
| Honesty / C-SLICE | **false** — ≠ ATT-03d DONE · ≠ ATT UAT |
| PAY / printable | **OUT invent** / **false** |

---

## Explicit ≠ DONE

- **≠ ATT-03d module DONE / UAT** · `attendance_uat_ready=false`
- **≠ PLT WS / CNS-05 alone = FR-03d DONE**
- **≠ residual/thin = ATT-03b DONE**
- **≠ catalog = ATT-01 DONE** · R-ATT-01-ASSIGN open
- **≠ LIVE = ATT-11 DONE** · **≠ AGG = ATT-10 DONE**
- **≠ soft/ATT-08 = ATT-09 DONE** · **≠ CFG = ATT-02 DONE**
- **printable false RETAIN** · **PAY OUT** · **C-SLICE**

---

## completion_report

**Closed:** U65 browser J-HRM-ATT-03D-01..06 against FE-01 — admin work-sites CRUD+F5 · soft-retire PATCH · GEO-001 · GEO-REQ · empty CTA · honesty seals · Nest `/core` 0 · zero-seed · ensureDefault 0. J-03 in-radius **201** with residual FE status→EFF catalog.

**Residual:** `R-ATT-03D-CNS-STATUS-CODE` P2 → `dev-fe` (GPS punch bind Nest attendance-codes/effective; stop hardcode `present`). OVERLAP/SITE/MOB HOLD. Explicit ≠ ATT-03d module UAT.

**Honesty stamps retained:** ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 · CORE07QC1-KZJTSHNT · ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P ≠ ATT-03d DONE.

---

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-ATT-03D-CLUSTER-QC-01
role: qc
entry_criteria: QA-01 PASS_TO_PM @ docs/qa/evidence/po-hrm-mvp-gd1-att-03d-cluster-qa-01.md · stamp ATT03DQA1-MSM1826M · L0 200 · Nest /core geofence 0 · U65 zero-seed
exit_criteria: GWC C-SLICE only — audit J-HRM-ATT-03D-01..06 evidence · Network work-sites* + records · GEO-001/GEO-REQ · empty CTA · soft-retire · honesty ≠ ATT-03d DONE · seals RETAIN · printable false · PAY OUT · residual R-ATT-03D-CNS-STATUS-CODE noted (P2 FE) · DENY claim PLT WS=ATT-03d DONE · DENY catalog/LIVE/AGG/ATT UAT · DENY invent ASSIGN/att_leave_hold/PAY/printable · DENY honesty flip
cấm: reopen sealed ATT-03b/01/11/10/09/08/02/PLT/CORE · seed · Nest /core SoT · claim module UAT
persona: ceo@xe.vn / Xevn@2026 · portal :5173
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-att-03d-cluster-qc-01.md
```

**ack_status:** `PASS_TO_PM`  
**next_owner:** `qc`
