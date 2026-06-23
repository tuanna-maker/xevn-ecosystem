# QA evidence — P1-CC-QA-MEMBER-LEGAL-SAVE-01 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | P1-CC-QA-MEMBER-LEGAL-SAVE-01 |
| **depends_on** | P1-CC-DEVOPS-MEMBER-LEGAL-SAVE-01 (VPS `HEAD` `89efcdd`) |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-04 (independent QA, post DevOps deploy) |
| **environment** | Pilot VPS — `https://14-225-217-232.nip.io`, optional `http://14.225.217.232:8088` |

## Scope

Close QA for group CEO **member unit legal-entity save** on Command Center (`company_member_units`). Prior defect: **HTTP 409** `tenantId mismatches token scope` and user-reported **502** when saving **XE_DU_LICH** / **XE_TMDV**.

| Layer | Check |
|-------|--------|
| L1 | Authenticated PUT via portal proxy (same headers as FE) |
| L2 | `P-CC-02` settings / member units load + save path |
| L2.5 | **J-CC-02** — group-member-units registry + member save (API probe mirrors FE `x-tenant-id` per member slug) |

**Account:** `ceo@xe.vn` / `Xevn@2026` (JWT `tenantId=xevn`, `companyId=main`).

## UI path (documented — operator retest)

| Step | Action |
|------|--------|
| 1 | Open `https://14-225-217-232.nip.io/login` → sign in `ceo@xe.vn` |
| 2 | Navigate `https://14-225-217-232.nip.io/command-center?settings=company_member_units` |
| 3 | Select member row **XE_DU_LICH** or **XE_TMDV** (Khối Định danh & Trụ sở / legal entity form) |
| 4 | Edit fields (tax code, charter capital, short name) → **Save** |
| **Expect** | No red banner; network **PUT** `/api/xbos/org-foundation/legal-entities/{id}` → **200** with `XBOS-ORG-201`; **no 409** scope, **no 502** gateway |

FE headers on save (verified by probe): `Authorization: Bearer`, `x-tenant-id: {member slug}` (e.g. `xe-du-lich`, `xe-tmdv`), `x-company-id: main`.

## Primary gate — `test:xbos:cc-member-save` (exit 0 required)

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
pnpm run test:xbos:cc-member-save
```

**Script:** `scripts/tmp-cc-legal-entity-member-save-probe.mjs` (package.json `test:xbos:cc-member-save`).

| Step | Result |
|------|--------|
| Login | **PASS** |
| GET `/tenant-scope/group-member-units` | **200**, `members=4` |
| PUT `XE_TMDV` (`xe-tmdv`) | **200** `XBOS-ORG-201` |
| PUT `VISUN` (`visun`) | **200** `XBOS-ORG-201` |
| PUT `XE_DU_LICH` (`xe-du-lich`) | **200** `XBOS-ORG-201` |
| PUT `XE_VIETNAM` (`xe-vietnam`) | **200** `XBOS-ORG-201` |
| POST-save reload group-member-units | **200** |
| **409** on any PUT | **none** |
| **502** on any PUT | **none** |
| **Exit code** | **0** (`4/4 member PUT PASS`) |

## Optional — HTTP :8088 (same probe)

```powershell
$env:PORTAL_DEV_URL='http://14.225.217.232:8088'
pnpm run test:xbos:cc-member-save
```

| Result | **PASS** — exit **0**, same **4/4** member PUT + reload |

## Matrix / journey

| ID | Verdict | Notes |
|----|---------|--------|
| **P-CC-02** | **PASS** (pilot API slice) | Member units list + save via proxy |
| **J-CC-02** | **PASS** (API L2.5) | All registry members save without scope 409 |

## Residual (not blocking this wave)

| Item | Owner | Note |
|------|-------|------|
| GET `legal-entities/:id` with member partition headers | dev-be (future) | DevOps note: read path may still **409**; **PUT save fixed** on `89efcdd` |
| Browser screenshot L2 | optional QC | API probe PASS; UI path documented above |

## References

- BE fix: `docs/qa/evidence/p1-cc-be-member-legal-save-01-20260604.md`
- DevOps deploy: `docs/ops/evidence/p1-cc-devops-member-legal-save-01-20260604.md`
- Test gap closure: `docs/qa/evidence/p1-cc-xbos-legal-entity-test-gap-20260604.md`

## ack_status

**PASS_TO_PM** — pilot member legal save **409/502 closed** on HTTPS nip.io and HTTP :8088; ready for QC spot-check or PM closure.
