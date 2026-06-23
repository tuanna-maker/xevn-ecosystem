# QA — scope CRUD journey note (post-deploy)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QA-SCOPE-DEPLOY-VERIFY-01` |
| **predecessor** | `P1-PHASE1-DO-XBOS-BE-SCOPE-DEPLOY-01` |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-04 |
| **environment** | `https://14-225-217-232.nip.io` · `ceo@xe.vn` |

## Summary

Post **xbos-be** scope deploy, group CEO read path for member legal entity **XE_DU_LICH** (`11d2bb7b-6190-4cb4-b0fe-03d43b5596b8`) with headers `x-tenant-id: xe-du-lich`, `x-company-id: main` returns **200** for both entity and **shareholders** — closes QC **C-RBACQC-02**.

## Probe (authoritative)

```text
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-phase1-be-scope-crud-probe.mjs
→ exit 0 PROBE_OK
  GET legal-entity HTTP 200 XBOS-ORG-200
  GET shareholders HTTP 200 XBOS-SHR-200
  PUT XE_DU_LICH HTTP 200 XBOS-ORG-201
  member CEO rollup block HTTP 409 (negative PASS)
```

## J-CC-02 (optional browser)

| Step | URL / action | Verdict |
|------|----------------|---------|
| L2 | `/command-center?settings=company_member_units` | **PASS** |
| L2.5 | Edit **XE_DU_LICH** → **Hồ sơ pháp nhân** tab | Form loads; **Danh sách Cổ đông** section present |
| Preload | Shareholders block on load | **PASS** — no WARN / 409 / ERROR banner on cổ đông |

**Click path:** Login (session) → CÀI ĐẶT → Đơn vị thành viên → **Chỉnh sửa** on **XE_DU_LICH** row → verify cổ đông section.

## Cross-reference

- Full RBAC pack: `docs/qa/evidence/p1-phase1-qa-full-rbac-20260604.md`
- CRUD matrix: `docs/qa/evidence/p1-phase1-qa-crud-matrix-20260604.md`
- BE handoff: `docs/qa/evidence/p1-phase1-be-scope-crud-20260604.md`
