# QA retest — P1-XBOS-W1-SHR-FIX (J-XBOS-04 shareholders)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-XBOS-W1-SHR-FIX` / `D-W1-SHR-01` |
| **from_role** | qa |
| **to_role** | qc |
| **ack_status** | **READY_FOR_QC** |
| **executed_at** | 2026-06-06 |
| **environment** | `http://localhost:5173` ONLY · `ceo@xe.vn` / `Xevn@2026` |
| **prior_fail** | `docs/qa/evidence/p1-xbos-w1-legal-audit-20260606.md` § J-XBOS-04 shareholders |
| **dev_fix** | `docs/qa/evidence/p1-xbos-w1-shr-fix-20260606.md` |
| **journey** | **J-XBOS-04** (shareholders slice) · matrix **P-CC-02** |

## Executive summary

| Check | Verdict |
|-------|---------|
| L0 `qc:dev-stack` | **PASS** — hrm-api + xbos-api + portal `:5173` HTTP 200 |
| **J-XBOS-04** add → **Lưu thay đổi** → F5 → persist | **PASS** |
| API `GET …/shareholders` post-save | **PASS** — `count=1`, holder `QA SHR RETEST 20260606` |
| Regression `test:xbos:cc-member-save` | **PASS** — **4/4** exit 0 |
| Regression scope probe | **PASS** — `PROBE_OK` exit 0 |

**D-W1-SHR-01 CLOSED** on localhost — main save now POSTs shareholders (`XBOS-SHR-201`).

---

## Environment traceability

| Service | Port | Health |
|---------|------|--------|
| web-portal | 5173 | HTTP 200 |
| xbos-api (proxy) | 28002 | `GET /api/xbos/` → 200 |

Account: group CEO JWT `tenantId=xevn`, `companyId=main`.  
Test entity: **XE_DU_LICH** UUID `11d2bb7b-6190-4cb4-b0fe-03d43b5596b8`, tenant `xe-du-lich`.

---

## J-XBOS-04 — Shareholders round-trip (retest scope)

### Click path

| Step | Action | Result |
|------|--------|--------|
| 1 | `http://localhost:5173/command-center?settings=company_member_units` | **PASS** — member list loads |
| 2 | Row **XE_DU_LICH** → **Chỉnh sửa** | **PASS** — detail `Đơn vị thành viên - XE_DU_LICH` |
| 3 | **+ Thêm cổ đông** | **PASS** — inline row |
| 4 | Fill `QA SHR RETEST 20260606` / `079188009888` / **15%** | **PASS** — computed **150.000.000** VNĐ |
| 5 | **Lưu thay đổi** (main save — not per-row Submit only) | **PASS** — see Network below |
| 6 | F5 same URL → reopen **XE_DU_LICH** | **PASS** — shareholder row visible in UI |
| 7 | API `GET …/shareholders` (JWT probe) | **PASS** — HTTP **200** `XBOS-SHR-200`, **count=1** |

### Network (browser hook, save step)

```
PUT /api/xbos/org-foundation/legal-entities/11d2bb7b-6190-4cb4-b0fe-03d43b5596b8 → 200 XBOS-ORG-201
GET …/shareholders (preload) → 200 XBOS-SHR-200 items=[]
POST …/shareholders → 201 XBOS-SHR-201
  holder_name: "QA SHR RETEST 20260606"
  identity_code: "079188009888"
  ratio_percent: "15.00"
  contributed_value: "150000000.00"
```

### Post-F5 UI (reopen detail)

| Field | Value |
|-------|-------|
| Họ tên | `QA SHR RETEST 20260606` |
| Mã định danh | `079188009888` |
| Tỷ lệ | `15` |
| Giá trị góp vốn | `150.000.000` |

### API probe (post-retest)

```text
HTTP 200 code XBOS-SHR-200 count 1
holder QA SHR RETEST 20260606 ratio 15.00 id 079188009888
```

---

## Automated regression

| Command | Result |
|---------|--------|
| `pnpm run qc:dev-stack` | exit **0** |
| `PORTAL_DEV_URL=http://localhost:5173 node scripts/tmp-phase1-be-scope-crud-probe.mjs` | exit **0** — `PROBE_OK` |
| `PORTAL_DEV_URL=http://localhost:5173 pnpm run test:xbos:cc-member-save` | **4/4 PASS** exit **0** |

---

## Defect closure

| ID | Prior | Retest |
|----|-------|--------|
| **D-W1-SHR-01** | P1 — `Lưu thay đổi` did not POST shareholders; F5 count **0** | **CLOSED** — POST **201** on main save; F5 + GET count **≥1** |

## Residual (not in this slice)

- Legal documents still per-row submit only (out of scope per dev handoff).
- Holding root entity skips shareholder preload by design.
- VPS/nip.io deploy not verified in this retest (localhost-only per PM dispatch).

---

## Completion contract

**completion_report:** J-XBOS-04 shareholders add → **Lưu thay đổi** → F5 persist **PASS** on localhost:5173 `ceo@xe.vn`. Network shows POST `XBOS-SHR-201`; API GET count **1**; member-save regression **4/4**. **D-W1-SHR-01 closed.** Documents/RACI not re-run (unchanged from prior W1 audit PASS).

**next_owner:** **qc**

**next_dispatch_prompt:**

```text
@qc — P1-XBOS-W1-SHR-FIX gate (J-XBOS-04 shareholders closed)

work_item_id: P1-XBOS-W1-SHR-FIX
entry_criteria: QA READY_FOR_QC docs/qa/evidence/p1-xbos-w1-shr-qa-retest-20260606.md — D-W1-SHR-01 closed localhost; prior W1 audit docs/RACI PASS in p1-xbos-w1-legal-audit-20260606.md
exit_criteria: QC spot-check J-XBOS-04 shareholders slice on localhost:5173 OR accept QA evidence if W1 wave GWC; confirm no regression on test:xbos:cc-member-save 4/4; GO/GWC for W1 legal wave
evidence_path: docs/qa/evidence/p1-xbos-w1-shr-qa-retest-20260606.md
ack_status target: PASS_TO_PM (GO or GO WITH CONDITIONS for W1)
```

**evidence_path:** `docs/qa/evidence/p1-xbos-w1-shr-qa-retest-20260606.md`
