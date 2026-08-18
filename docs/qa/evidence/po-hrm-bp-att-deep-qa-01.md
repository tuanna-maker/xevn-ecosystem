# PO-HRM-BP-ATT-DEEP-QA-01 — Evidence (browser RO deep walk)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-DEEP-QA-01` |
| **Program** | `PO-HRM-BP-UC-GAP-01` · D4 browser |
| **ack_status** | **PASS_TO_PM** |
| **uat_done** | `false` |
| **Attendance CLOSED** | **false** (not claimed) |
| **Account** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **commit** | `dc930c5` |
| **hdsd_align** | CC → HRM embed → **Chấm công** · U76 inventory vs matrix + `ATT_SURFACE_INVENTORY_DEEP.md` |
| **U65** | zero-seed · read-only (open dialogs when CTA visible · Hủy/Escape · no Lưu/Duyệt/POST) |
| **Code inventory** | `ATT_SURFACE_INVENTORY_DEEP.md` · `po-hrm-bp-att-deep-code-01.md` |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-hrm-bp-att-deep-qa-01-browser.json` |
| **Script** | `scripts/qa/_tmp-po-hrm-bp-att-deep-qa-01.mjs` |
| **Screenshots** | `docs/qa/evidence/screens/po-hrm-bp-att-deep-qa-01/` (**44** PNG) |
| **Runtime log** | `docs/qa/professional/menu-fidelity/ATT_DEEP_QA_RUNTIME_LOG.md` |

## L0 stack

| When | Check | Result |
|------|-------|--------|
| Entry | `pnpm run qc:fe-be-health` | **PASS** |
| Exit | `pnpm run qc:fe-be-health` | **PASS** |

## Method (U65 · U76 · read-only)

1. Login portal API → inject token → open `/hr/attendance?portal=1&companyId=main`.
2. Walk **44** probes covering fidelity matrix clusters: Overview · Clock-in methods · Sheets/Records/Weekly/Summary · Shifts · All request types · Leave tab · Reports + **Xuất dialog** · Settings employees + **all rules tabs** + overtime/leave-rules/late-early/request-rules/users/roles/system.
3. Classify `LIVE` / `PARTIAL` / `STUB_UI` / `GĐ2-HOLD` / `BROKEN` from body honesty (`featureInDev` **or** `att-cfg-stub-*` redirect) + Network GETs.
4. Screenshot every probe; open export dialog (#30) without download; attempt sheets Thêm dialog (#12) without Lưu.
5. Unexpected non-GET `/api/hrm/*`: **0**. pageErrors: **0**. networkBad: **0**.

## Probe rollup (44 surfaces)

| Stamp | Count | Notes |
|-------|------:|-------|
| **LIVE** | 28 | GET 2xx · mounts · no 5xx |
| **PARTIAL** | 3 | #8 QR shell · #30 export dialog (client empty fetch) · #33 columns static |
| **GĐ2-HOLD** | 1 | #9 Face `featureInDev` + GĐ2 |
| **STUB_UI** | 12 | #17–18 schedule/OT · #37–39 tablet/proxy/auto · #40–43 cfgRedirect · #44–46 featureInDev |
| **BROKEN** | 0 | — |

| Metric | Value |
|--------|------:|
| networkOk GETs | 401 |
| networkBad (≥400) | 0 |
| unexpected mutates | 0 |
| pageErrors | 0 |
| screenshots | 44 |
| CTA surfaces noted | 29 |

## Surface checklist (matrix #)

| Cluster | Probes | Runtime stamps |
|---------|--------|----------------|
| Overview #1–5 | `tab-overview` | LIVE |
| Clock-in #6–10 | hub · manual · QR · Face · GPS | LIVE / PARTIAL / GĐ2-HOLD / LIVE |
| Sheets/Records #11–15 | sheets · Thêm CTA · records · weekly · summary | LIVE (wire) |
| Shifts #16–18 | list · schedule · OT | LIVE / **STUB_UI** / **STUB_UI** |
| Requests #19–27 | leave · late-early · OT · trip · update · shift-change · summaries · plan | LIVE |
| Leave tab #28 | `tab-leave` | LIVE |
| Reports #29–30 | reports · **Xuất dialog open** | LIVE / **PARTIAL** |
| Settings #31–46 | employees · rules LIVE tabs · stubs | LIVE / PARTIAL / **STUB_UI** |

### Settings honesty detail

| # | Surface | Honesty observed |
|---|---------|------------------|
| 31 | Nhân viên | LIVE list |
| 32–36 | Rules Chung/standard/customize/device/app | LIVE · #33 PARTIAL columns |
| 37–39 | Tablet / Chấm hộ / Tự động | **STUB_UI** `featureInDev` |
| 40–43 | OT / nghỉ / muộn-sớm / đơn | **STUB_UI** `att-cfg-stub-*` redirect → Cài đặt HRM (not fake LIVE form) |
| 44–46 | Users / roles / system | **STUB_UI** `featureInDev` |

### Popups / CTAs (RO)

| Surface | CTA visible | Dialog this seat |
|---------|-------------|------------------|
| Sheets | Thêm | Screenshot `att-sheets-add-dialog.png` · no Lưu |
| Reports | Xuất báo cáo | **Dialog open confirmed** (`dialogOpen=true`) · Hủy · no download |
| Requests | Tạo/Thêm đơn* | Noted · **not clicked** (must_keep mutate GWC) |
| Shifts list | Thêm | Noted · not mutate |
| Records/clock | Xuất báo cáo | Nested export CTA on table · not double-mutated |

## Reconcile vs `ATT_SURFACE_INVENTORY_DEEP.md` MISSING

Browser NAV walk covers matrix **#1–46**. Code inventory **18 MISSING** candidates — status this seat:

| inv_id | Status vs deep QA |
|--------|-------------------|
| S02–S04, S07 | Overview nested — not separate probe; overview LIVE covers shell |
| S15–S16 EmployeeQR | **not opened** this seat (QR PARTIAL shell only) → residual |
| S25 sheet delete / S28 record delete | **not opened** (mutate Alert) → residual RO |
| S29 records export | Matrix #30 reports export **opened**; records-side export CTA visible nested |
| S32–S33 weekly cell / no-op icons | weekly LIVE; no-op icons not asserted click |
| S39 Copy shift no-op | list LIVE; copy not clicked |
| S43 leave balance panel | leave tab LIVE; panel not isolated stamp |
| S65 Import dialog | settings emp LIVE; Import not re-opened (SETTINGS-EMP GWC kept) |
| S66/S70/S71 no-op CTAs | noted as STUB candidates · not FAIL |
| S74–S75 GPS work-sites under App | App rules #36 LIVE; add-site dialog **not** opened (would mutate CFG) |

No inventory row contradicted STUB/featureInDev honesty for #17–18 · #37–46.

## SPEC_GAP / STUB / UNMAPPED vs meeting SYNTHESIS A1–A6

| Meeting | Want | Browser stamp | Gap class |
|---------|------|---------------|-----------|
| **A1** | Ca + quy định muộn/sớm | #16 LIVE · #17–18 **STUB_UI** · #42 **STUB_UI** (cfgRedirect) | **PRODUCT_STUB** late CFG · roster STUB |
| **A2** | Bảng công tổng hợp → lương | #11–15 LIVE wire · #15 OBS same-as-records · #30 PARTIAL export | **SPEC_GAP** dedicated summary API · PAY bind out-of-seat |
| **A3** | 5 loại phép (năm/thâm niên/bù/chuyển/ứng) | #41 leave-rules **STUB_UI** · leave TXN #19/#28 LIVE | **PRODUCT_STUB** CFG · **SRS_THIN** types |
| **A4** | Nghỉ ốm + BH | Leave LIVE TXN · no BH deep panel in ATT | **SRS_THIN** / cross CORE |
| **A5** | Rule ca/lịch bộ phận · accrual · holiday | #17 STUB · holiday calendar **PRODUCT_MISSING** (ATT-03b) · accrual not in UI | **PRODUCT_STUB** + **PRODUCT_MISSING** |
| **A6** | Mobile punch channels | Manual/GPS LIVE · QR PARTIAL · Face **GĐ2-HOLD** | Face GĐ2 · QR depth SPEC_GAP |

## J-* / UF (scope this seat)

| ID | Result |
|----|--------|
| Attendance module deep NAV | **PASS** RO inventory |
| Mutate J-* (leave WF / records edit / clock POST) | **not reopened** (prior GWC must_keep) |
| Attendance CLOSED | **false** |

## Residuals (honest)

| ID | Note | Owner |
|----|------|-------|
| R-ATT-DEEP-MISSING-NESTED | Inventory MISSING S15–16, S25, S28, S74–75 not dialog-walked | ba-process / qa P2 |
| R-ATT-A1-A5-CFG-STUB | #17–18 · #40–43 · #37–39 block meeting CFG depth | ba-process gap |
| R-ATT-A2-SUMMARY-EXPORT | #15 same-as-records · #30 client export empty fetch | ba-process / dev-fe P2 |
| #9 Face | GĐ2-HOLD | pm |
| Attendance UAT | **uat_done false** · not CLOSED | pm |

## Artifacts updated

- `docs/qa/professional/menu-fidelity/ATT_DEEP_QA_RUNTIME_LOG.md` (new)
- `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_FIDELITY_MATRIX.md` (deep overlay APPEND)
- Screenshots folder above

---

### completion_report

Closed **PO-HRM-BP-ATT-DEEP-QA-01**: U65 browser RO deep walk of entire Attendance module (44 probes · 401 GET 2xx · 0 mutates · 0 bad · 44 screenshots). Confirmed STUB honesty for shifts #17–18, rules #37–39, settings #40–43 (cfgRedirect) + #44–46 (featureInDev). Export dialog #30 opened PARTIAL. Reconciled vs `ATT_SURFACE_INVENTORY_DEEP` MISSING (nested residuals listed). Mapped A1–A6 gaps. **uat_done false** · **Attendance not CLOSED**.

### next_owner

**ba-process**

### next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-ATT-DEEP-GAP-BA-01
from_role: pm
to_role: ba-process
lane: governance
priority: P0

entry_criteria: evidence docs/qa/evidence/po-hrm-bp-att-deep-qa-01.md PASS_TO_PM; ATT_DEEP_QA_RUNTIME_LOG.md; ATT_SURFACE_INVENTORY_DEEP.md; UC_MEETING_PRODUCT_GAP_MATRIX.md v1.1; SYNTHESIS A1–A6
exit_criteria: delta gap rows for A1–A6 PRODUCT_STUB/SPEC_GAP/PRODUCT_MISSING with matrix # + inv_id; propose UC expands for 18 MISSING (at least S15 QR card, S74 GPS sites, S43 leave balance); do NOT invent Attendance CLOSED; uat_done stays false; no apps/**
must_keep: U65 · D7 paper HOLD · Face #9 GĐ2
cấm: seed · claim Attendance CLOSED · wipe SRS
```

### evidence_path

`docs/qa/evidence/po-hrm-bp-att-deep-qa-01.md`

### ack_status

**PASS_TO_PM**
