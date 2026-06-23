# QA evidence — P1-XBOS-W1-LEGAL-AUDIT (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | P1-XBOS-W1-LEGAL-AUDIT |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-06 |
| **environment** | `http://localhost:5173` ONLY · `ceo@xe.vn` / `Xevn@2026` |
| **mental_model** | `docs/program/XBOS_CC_BUSINESS_MENTAL_MODEL.md` § J-XBOS-03, J-XBOS-04 |
| **matrix** | P-CC-02 · journeys J-XBOS-03 / J-XBOS-04 / J-XBOS-03b |

## Executive summary

| Journey | Verdict | Notes |
|---------|---------|-------|
| **J-XBOS-03** Member legal save → F5 | **PASS** | PUT 200; list + detail round-trip same `name` |
| **J-XBOS-04** Cổ đông CRUD | **FAIL** | UI add row + Lưu; GET shareholders count **0** after reload |
| **J-XBOS-04** Tài liệu CRUD | **PASS** | Submit row → API `data.items[1]` with audit doc |
| **J-XBOS-03b** RACI tab | **PASS** | Matrix loads (235 activities); no silent empty mock |

**Mock audit:** `VITE_ALLOW_MOCK_FALLBACK=false` in `.env.local`. Member list + legal PUT use live `/api/xbos/*` (not static fallback). RACI panel uses `raci-governance` API (catalog + company matrix).

**API regression:** `PORTAL_DEV_URL=http://localhost:5173 pnpm run test:xbos:cc-member-save` → **4/4 PASS** exit 0.

---

## Environment traceability

| Service | Port | Health |
|---------|------|--------|
| web-portal | 5173 | HTTP 200 |
| xbos-api (proxy) | 28002 | `GET /api/xbos/` → 200 XBOS-HEALTH-200 |

Account: group CEO JWT `tenantId=xevn`, `companyId=main`. Test entity: **XE_DU_LICH** UUID `11d2bb7b-6190-4cb4-b0fe-03d43b5596b8`, tenant `xe-du-lich`.

---

## J-XBOS-03 — Member unit legal profile

### Click path

| Step | Action | Result |
|------|--------|--------|
| 1 | `http://localhost:5173/command-center?settings=company_member_units` | **PASS** — list 5 rows (TẬP ĐOÀN + 4 members) |
| 2 | Row **XE_DU_LICH** → **Chỉnh sửa** | **PASS** — detail `Đơn vị thành viên - XE_DU_LICH`; no *chưa có hồ sơ pháp nhân* banner |
| 3 | **Tên tiếng Việt** → `QA W1 XBOS legal audit 20260606-1525` | **PASS** |
| 4 | **Lưu thay đổi** | **PASS** — PUT `/api/xbos/org-foundation/legal-entities/11d2bb7b-6190-4cb4-b0fe-03d43b5596b8` **HTTP 200** |
| 5 | F5 same URL | **PASS** — list row shows new name |
| 6 | **Chỉnh sửa** again | **PASS** — form field + MST/vốn điều lệ match DB |

### API (browser hook)

```
GET /api/xbos/org-foundation/legal-entities → 200
GET .../11d2bb7b-.../shareholders → 200
GET .../11d2bb7b-.../documents → 200
PUT .../11d2bb7b-... → 200
```

### Screenshot notes

- List load: 4 member units + holding; no ERROR banner.
- Detail save: no red validation banner (contrast pilot 2026-06-04 400).
- Post-F5 list: `XE_DU_LICH` column shows audit name string.

### UUID resolution

No *«chưa có hồ sơ pháp nhân»* or 409 on member **XE_DU_LICH** preload/detail in this run.

---

## J-XBOS-04 — Shareholders / legal documents

### Tab Cổ đông (shareholders)

| Step | Action | Result |
|------|--------|--------|
| 1 | **+ Thêm cổ đông** | **PASS** — inline row (name / ID / % / giá trị) |
| 2 | Fill `QA W1 Co Dong 20260606`, `079188009999`, **15%** | **PASS** — computed 150.000.000 VNĐ |
| 3 | **Lưu thay đổi** | **PASS** UI (Đang lưu… completes) |
| 4 | F5 → reopen **XE_DU_LICH** detail | **FAIL** — shareholder row **absent** |
| 5 | API `GET .../shareholders` | **FAIL** — HTTP 200, **count 0** |

**Defect:** D-W1-SHR-01 — `Lưu thay đổi` does not persist shareholders (no POST/PUT observed; separate `legalEntityProfileApi` shareholder endpoints unused on main save).

### Tab Tài liệu (documents)

| Step | Action | Result |
|------|--------|--------|
| 1 | **+ Thêm tài liệu** | **PASS** — row with Upload/View/Submit |
| 2 | Title `QA W1 Giay phep KD 20260606`, code `GP-2026-W1-001` | **PASS** |
| 3 | **Submit** (row) + **Lưu thay đổi** | **PASS** — toast *Đã lưu tài liệu pháp lý lên hệ thống.* |
| 4 | Reopen detail after navigation | **PASS** — row visible in UI |
| 5 | API `GET .../documents` | **PASS** — `data.items[1]` document persisted |

```json
{"document_code":"GP-2026-W1-001","document_name":"QA W1 Giay phep KD 20260606","status":"active"}
```

Upload binary not exercised (metadata round-trip only).

---

## J-XBOS-03b — RACI tab (same entity, after legal save)

| Step | Action | Result |
|------|--------|--------|
| 1 | Tab **Nhiệm vụ & RACI** on XE_DU_LICH | **PASS** |
| 2 | Matrix visible | **PASS** — stats: 235 hoạt động, 235 có chữ RACI, 12 gắn phân hệ (5%) |
| 3 | Activity rows | **PASS** — e.g. BDH-001..014 with R/A/C/I columns |
| 4 | Error state | **PASS** — no silent empty table; no *Không tải ma trận RACI* banner |

FE path: `/api/xbos/raci-governance/companies/{companyId}/matrix` (via `CompanyRaciPanel`).

---

## Defect table

| ID | Severity | Journey | Symptom | Owner | Evidence |
|----|----------|---------|---------|-------|----------|
| **D-W1-SHR-01** | **P1** | J-XBOS-04 | Shareholder row added in UI; **Lưu thay đổi** completes; after F5 **GET shareholders = 0**; row gone | **dev-fe** (wire save to `legalEntityProfileApi` POST/PUT shareholders) + **dev-be** verify contract if POST fails silently | This file § J-XBOS-04 shareholders |
| D-W1-DETAIL-01 | P2 | J-XBOS-03 | Detail form fields (MST/vốn) briefly empty ~1–3s before async GET hydrates | dev-fe | Browser snapshot race on reopen |
| D-W1-CC-KPI-01 | P2 | CC home | *Không tải KPI rollup (JWT companyId=main)* on dashboard | dev-fe | Out of W1 slice; note for CC wave |

No mock-fallback masquerading as DB on legal list/save/RACI in this audit.

---

## Completion contract

**completion_report:** J-XBOS-03 legal name save→F5 **PASS**; J-XBOS-04 documents **PASS**; J-XBOS-03b RACI **PASS**. **FAIL:** J-XBOS-04 shareholders round-trip (D-W1-SHR-01 P1). API probe 4/4 member PUT PASS on localhost.

**next_owner:** pm → dispatch **dev-fe** P1 shareholder save wiring; then **qa** retest J-XBOS-04 only.

**next_dispatch_prompt:**

```text
@dev-fe — P1-XBOS-W1-SHR-FIX (blocks J-XBOS-04)

work_item_id: P1-XBOS-W1-SHR-FIX
entry_criteria: QA FAIL docs/qa/evidence/p1-xbos-w1-legal-audit-20260606.md D-W1-SHR-01
exit_criteria: On localhost:5173, XE_DU_LICH → + Thêm cổ đông → fill → Lưu thay đổi → F5 → GET /api/xbos/org-foundation/legal-entities/{id}/shareholders returns ≥1 row with same name; browser row visible after reload
evidence_path: docs/qa/evidence/p1-xbos-w1-shr-fix-20260606.md
Files: apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx (member legal save), apps/web/web-portal/src/integrations/legalEntityProfileApi.ts
ack_status target: READY_FOR_QA
```

**evidence_path:** `docs/qa/evidence/p1-xbos-w1-legal-audit-20260606.md`

**ack_status:** **PASS_TO_PM** (audit complete; P1 defect logged for PM dispatch)
