# P1-UX-DEFER-UF-BATCH-8088 — QA browser action-level retest

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-UX-DEFER-UF-BATCH-8088-QA` |
| **role** | qa |
| **executed_at** | 2026-06-20 |
| **target** | `http://14.225.217.232:8088/` |
| **personas** | `ceo@xe.vn` / `du-lich.hr@xe.vn` · `Xevn@2026` |
| **rule** | Browser U65 · zero-seed |
| **ack_status** | **PASS_TO_PM** (GWC: UF-XBOS-06 Xem new-tab URL) |

---

## Summary

| Action ID | Verdict | Owner hint (if FAIL) |
|-----------|---------|----------------------|
| **UF-XBOS-06** | 🟢 **PASS** (GWC Xem URL) | devops — `XBOS_PUBLIC_BASE_URL` on `:8088` |
| **UX-XBOS-10** | 🟢 **PASS** | — |
| **UX-HRM-09** | 🟢 **PASS** | — |
| **KPI-delete-F5** | 🟢 **PASS** | — |

**Overall:** 4/4 action-level 🟢 · 1 GWC residual (file view `window.open` host)

---

## UF-XBOS-06 — CC legal docs upload + file view + F5

**Persona:** `ceo@xe.vn`  
**Click path:** CC → Cài đặt → Đơn vị thành viên → XE_DU_LICH **Chỉnh sửa** → Tài liệu đính kèm → **+ Thêm tài liệu** → Upload PDF

| Step | Result |
|------|--------|
| Metadata | `QA-UF06-DEFER-8088` / `GP-DEFER-UF06-20260620` → **Lưu tài liệu** → FE «Đã lưu tài liệu pháp lý lên hệ thống.» |
| Upload | PDF `qa-uf06-defer-8088.pdf` → FE «Đã upload: qa-uf06-defer-8088.pdf» |
| GET file (proxy) | `GET /api/xbos/org-foundation/legal-documents/824b3528-9735-4671-8c86-102ecb96dac4/file` → **200** `application/pdf` · body `%PDF-1.4` · **not** `XBOS-DOC-404` |
| Xem (Eye) | `window.open` → `http://127.0.0.1:28002/api/xbos/.../file` — **unreachable from VPS browser** (config) |
| F5 | Reload → re-open XE_DU_LICH → row **QA-UF06-DEFER-8088** + code **GP-DEFER-UF06-20260620** + file indicator **Đã tải lên** · Eye enabled |

**Verdict:** 🟢 — upload + API file 200 + F5 metadata persist. **GWC:** Xem new-tab uses localhost base URL instead of portal proxy.

**spec_ref:** UC-XBOS-ORG-03 · AC-UF-XBOS-06

---

## UX-XBOS-10 — RACI panel NAV (G-UX-03)

**Persona:** `ceo@xe.vn`  
**Click path:** XE_DU_LICH edit → tab **Hồ sơ pháp nhân** ↔ **Nhiệm vụ & RACI**

| Check | Result |
|-------|--------|
| Hồ sơ → RACI | ~403 ms · **Ma trận RACI** shell visible · sub-tab **Ma trận RACI** selected |
| RACI → Hồ sơ | ~309 ms · **Tài liệu đính kèm** block visible |
| Blank flash / error banner | **None** |
| Matrix cells | BDH-001×HĐQT **R** visible after switch |

**Verdict:** 🟢 **PASS** — smooth panel swap; G-UX-03 RACI NAV **closed** for UX-XBOS-10.

---

## UX-HRM-09 — Member `du-lich.hr@xe.vn` embed employees NAV

**Persona:** `du-lich.hr@xe.vn`  
**Click path:** Login → `/command-center/hrm/employees` → **Mở menu HRM** → sidebar links

| Tab click | URL after | iframe route | ms | Error |
|-----------|-----------|--------------|-----|-------|
| Chấm công | `/command-center/hrm/attendance` | `hr/attendance` | 807 | none |
| Hợp đồng | `/command-center/hrm/contracts` | `hr/contracts` | 803 | none |
| Nhân sự | `/command-center/hrm/employees` | `hr/employees` | 803 | none |

**Session:** login **201** · iframe `tenantId=xe-du-lich` · no **403/500/Sync ERROR** banner.

**Verdict:** 🟢 **PASS** — member persona embed NAV; G-UX-03 HRM-09 **closed**.

---

## KPI delete F5 — `/dashboard/settings/kpi-metrics`

**Persona:** `ceo@xe.vn`  
**Click path:** Settings → KPI & Metric → delete **ABSENCE** («Tỷ lệ vắng mặt»)

| Step | Result |
|------|--------|
| Pre | **Tổng: 2 metric** — OTIF + ABSENCE |
| Delete | AlertDialog **Xóa metric KPI** → **Xóa** → Loader2 «Đang xử lý…» |
| FE post-delete | **Tổng: 1 metric** — OTIF only · ABSENCE absent |
| F5 | Reload → **Tổng: 1 metric** · ABSENCE **still absent** |

**Verdict:** 🟢 **PASS** — scope-parity delete persistence (same class as vendor F5 fix).

---

## Matrix updates

- `docs/qa/UIUX_INTERACTION_AUDIT_MATRIX_8088.md` — UX-XBOS-10 NAV **PASS**; UX-HRM-09 NAV **PASS**
- `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` — UF-XBOS-06 row: file view **200** + upload F5 evidence link

---

## Residual (GWC)

| ID | Item | Severity | Owner |
|----|------|----------|-------|
| R-UF06-FILE-URL | `file_url` / Xem opens `127.0.0.1:28002` on `:8088` — proxy GET **200** works | P2 | devops — set `XBOS_PUBLIC_BASE_URL=http://14.225.217.232:8088` on xbos-be |

---

## completion_report

Closed defer batch: UF-XBOS-06 upload+file GET 200+F5, UX-XBOS-10 RACI NAV, UX-HRM-09 member embed NAV, KPI delete F5 — all browser 🟢 on `:8088`. Residual: Xem new-tab localhost file URL (API/proxy OK).

## next_owner

`pm` → optional `devops` for R-UF06-FILE-URL · `qc` scoped G-UX-03 close

## next_dispatch_prompt

```text
work_item_id: P1-UX-DEFER-UF-BATCH-8088-QC
entry: QA PASS_TO_PM — docs/qa/evidence/p1-ux-defer-uf-batch-8088-20260620.md; 4/4 action 🟢; GWC R-UF06-FILE-URL P2
exit: QC scoped GO/GWC for G-UX-03 UX-XBOS-10 + UX-HRM-09 NAV closure; audit matrix rows promoted
evidence: docs/qa/evidence/p1-ux-defer-uf-batch-8088-20260620.md
ack_status: GO or GO WITH CONDITIONS (file URL only)
```

## evidence_path

`docs/qa/evidence/p1-ux-defer-uf-batch-8088-20260620.md`
