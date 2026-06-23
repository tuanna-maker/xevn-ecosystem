# QC gate — P1-CC-QC-MEMBER-LEGAL-SAVE-L25-01 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | P1-CC-QC-MEMBER-LEGAL-SAVE-L25-01 |
| **from_role** | qc |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **qa_evidence_path** | `docs/qa/evidence/p1-cc-qa-member-legal-save-l25-20260604.md` |
| **executed_at** | 2026-06-04 |
| **environment** | Pilot `https://14-225-217-232.nip.io` · `ceo@xe.vn` |

## Scope (bounded)

Command Center **member legal entity save** slice only — not full CC matrix, not Phase 1 program closure, not Production.

| In scope | Out of scope |
|----------|----------------|
| **P-CC-02** tab load + member PUT save | Full HTTPS probe 23/23 |
| **J-CC-02** L2.5 list → edit **XE_DU_LICH** → **Lưu** | Other J-CC-* browser clicks |
| portal-fe **`68ec457`** Content-Type dedupe | Corporate PROD-READY columns |

## Evidence pack verify

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-cc-qa-member-legal-save-l25-20260604.md
```

| Result | Detail |
|--------|--------|
| Exit code | **1** (2/8 checks) |
| Failed checks | `work_item_id`, `ack_status` — table uses `\| **work_item_id** \|` not `work_item_id:` at file top |
| QC adjudication | **Process GWC** — substantive pack complete (commands, J-CC-02, matrix, residual, dates); do **not** product NO-GO on format alone per PM entry + § Retest @ `68ec457` |

## Chain audited

| Artifact | Role | Key signal |
|----------|------|------------|
| `p1-cc-qa-member-legal-save-l25-20260604.md` § Retest @ `68ec457` | QA | **PASS_TO_PM** — browser PUT **200**, single `Content-Type`, success toast |
| `p1-cc-devops-portal-fe-content-type-01-20260604.md` | DevOps | portal-fe **`68ec457`** deployed; probe **4/4** |
| `p1-cc-fe-member-legal-content-type-01-20260604.md` | Dev-FE | `mergeRequestHeaders` + vitest **4/4**, build **0** |
| `p1-cc-devops-member-legal-browser-put-01-20260604.md` | DevOps | xbos-be **`5ae6bca`** (validation order) |
| `p1-cc-be-member-legal-browser-save-20260604.md` | Dev-BE | Read scope + browser PUT envelope specs **229/229** |

## Classification

| Finding | Class | Gate impact |
|---------|-------|-------------|
| Duplicate `content-type` + `Content-Type` → empty body → **400** | **PRODUCT** (closed) | Fixed @ **`68ec457`** |
| Browser PUT **200** + root `code`/`name` present | **PRODUCT** (closed) | J-CC-02 L2.5 **PASS** |
| GET legal-entity by id / shareholders **409** member headers | **PRODUCT** (open, **out of save slice**) | **GWC** — not sole NO-GO per PM |
| `verify:qc:evidence-pack` colon format | **PROCESS** | Condition **C-CCMLEG-02** |

## L2 / L2.5 verdict

| ID | Layer | QC verdict | Basis |
|----|-------|------------|--------|
| **P-CC-02** | L2 + save | **PASS** | Tab load 4 rows; save no ERROR banner (QA § `68ec457`) |
| **J-CC-02** | **L2.5** | **PASS** | Click path: `company_member_units` → **Chỉnh sửa** **XE_DU_LICH** → **Lưu** → PUT **200**; one `Content-Type: application/json` |

**U19:** L2.5 save journey executed with URL + click path + network table in QA evidence — not probe-only.

## QC spot-check (optional)

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
pnpm run test:xbos:cc-member-save
```

| Step | Result |
|------|--------|
| Login | **PASS** |
| GET group-member-units | **200**, members=4 |
| PUT 4 members | **200** `XBOS-ORG-201` each |
| Exit code | **0** (`=== 4/4 member PUT PASS ===`) |

Consistent with QA; supports regression guard — does **not** replace browser L2.5 proof (already in QA § `68ec457`).

## QC decision

**GO WITH CONDITIONS** — promote **P1-CC member legal save L2.5** on pilot nip.io for `ceo@xe.vn` after portal-fe **`68ec457`**.

**NOT** Phase 1 DONE · **NOT** Production GO · **NOT** full Command Center / HTTPS perimeter sign-off.

## Conditions (explicit)

| ID | Condition | Owner | Expiry / trigger |
|----|-----------|-------|------------------|
| **C-CCMLEG-01** | GET by id / shareholders **409** on member-only partition headers (if still reproducible on preload/detail) | **dev-be** | Separate `work_item_id`; reopen save gate only if PUT regresses |
| **C-CCMLEG-02** | QA pack: add top-level `work_item_id:` + `ack_status:` lines so `verify:qc:evidence-pack` exits **0** | **qa** | Next CC evidence file |
| **C-CCMLEG-03** | `PROGRAM_JOURNEY_MAP.md` **J-CC-02** still **L2** only — sync L2.5 save PASS | **pm** | Same sprint governance |

## Residual (not blocking this gate)

| Item | Status |
|------|--------|
| Member GET 409 read path | **Open** — bounded **C-CCMLEG-01** |
| Matrix row P-CC-02 still "PASS (L1/L0)" in `PILOT_BUSINESS_FLOW_MATRIX.md` | PM/QA refresh save column |

## pm_dispatch_hint

- If user reports preload WARN or detail **409** on member edit: dispatch **dev-be** scope read (`xbos-group-legal-scope`) — **not** re-open Content-Type lane unless PUT returns **400** again.
- If save fails with **400** and duplicate Content-Type in DevTools: verify portal-fe image ≥ **`68ec457`** before BE.

## ack_status

**PASS_TO_PM** — **GO WITH CONDITIONS** for **J-CC-02** L2.5 member legal save @ portal-fe **`68ec457`**; residual GET **409** documented, not save-blocking.
