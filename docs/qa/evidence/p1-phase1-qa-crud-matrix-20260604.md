# QA — P1-PHASE1-QA-CRUD-JOURNEY-01 (Phase 1 CRUD matrix execution)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QA-CRUD-JOURNEY-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | `2026-06-04T10:56:00Z` (approx.) |
| **matrix SoT** | `docs/program/PHASE1_CRUD_ACCEPTANCE_MATRIX.md` |
| **BE handoff** | `docs/qa/evidence/p1-phase1-be-scope-crud-20260604.md` (`P1-PHASE1-BE-SCOPE-CRUD-01`) |

## Environment

| Target | Result | Notes |
|--------|--------|-------|
| **HTTPS pilot** `https://14-225-217-232.nip.io` | **Primary** | `ceo@xe.vn` / `Xevn@2026` |
| **Local** `127.0.0.1:28001/28002/5173` | **ENV FAIL** | `pnpm run qc:dev-stack` exit **1** — APIs not running |
| **Transient** | Observed | Intermittent **502** on `xbos` login/nginx between runs; retry after ~8s succeeded |

## Commands executed

```text
pnpm run qc:dev-stack                                    → exit 1 (local down)
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-phase1-be-scope-crud-probe.mjs
  → final run PROBE_OK (5/5)
PORTAL_DEV_URL=https://14-225-217-232.nip.io pnpm run test:xbos:cc-member-save
  → exit 0 (4/4 member PUT)
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs
  → exit 0 — L2 23/23, L2.5 7/7
node inline portal HRM/XBOS probes (contracts CRUD chain, insurance list, settings holding)
```

`scripts/tmp-c-w2qc-01-crud-matrix-close.mjs` **not run** on nip.io — `portalLogin()` uses `127.0.0.1:28002` (ECONNREFUSED). Inline portal probes substitute for P0 HRM cells.

---

## P0 gap register — QA verdict (2026-06-04)

| Gap ID | Matrix symptom | QA verdict (nip.io) | AC-ID | Notes |
|--------|----------------|---------------------|-------|-------|
| **P0-CRUD-01** | Member legal **Read detail** **409** | **PASS** | AC-CRUD-CC-ORG-G-RD-01 | `GET …/legal-entities/11d2bb7b-…` **200** `XBOS-ORG-200`; `GET …/shareholders` **200** `XBOS-SHR-200` (headers `xe-du-lich` / `main`). First probe run **409** shareholders — **closed** after pilot `xbos-be` includes scope fix (aligns with BE READY_FOR_QA). |
| **P0-CRUD-02** | Contracts **POST/PATCH** **400** | **PASS** | AC-CRUD-HRM-CON-G-C-01, G-U-01 | `POST` **201** `HRM-CON-201`; `PATCH` **200** `HRM-CON-200`; `GET` detail **200**; `DELETE` **200**. List **200** `HRM-CON-200` (total 777). |
| **P0-CRUD-03** | Insurance native list **404** | **PASS** | AC-CRUD-HRM-INS-G-RL-01 | `GET …/insurance-policy-participants?company_id=main` **200** `HRM-INS-200`. L2 probe P-CC-05 still **200** via contracts surface. |
| **P0-CRUD-04** | Settings `company_id=holding` **200** | **GWC** | AC-CRUD-SET (NEG) | **200** `HRM-SET-200` — frozen policy **D16-FROZEN-ALLOW-200** per matrix §11 / prior QC; not product FAIL unless PM tightens negative. |
| **P0-CRUD-05** | RACI matrix save **409** | **UNTESTED** | AC-CRUD-CC-RACI-G-U-01 | No regression probe this wave — reopen only if user reports. |
| **P0-CRUD-06** | Workflow approve / mock inbox | **UNTESTED** | AC-CRUD-CC-WF-G-U-01 | `J-XBOS-01-tasks` **200** `XBOS-WF-203` on L2 probe only; approve step not exercised. |

**Closed (regression guard):** Member legal **Update** — `test:xbos:cc-member-save` **4/4** **200** `XBOS-ORG-201`; **J-CC-02** browser save **PASS** @ portal-fe `68ec457` (prior QA/QC evidence).

---

## J-CC-02 — Command Center member unit (read detail after BE)

| Layer | Step | HTTP | Code | Verdict |
|-------|------|------|------|---------|
| **L2** | `GET /api/xbos/tenant-scope/group-member-units` (`xevn`/`main`) | 200 | XBOS-TENANT-200 | **PASS** |
| **L2.5 API** | Select **XE_DU_LICH** → `GET /api/xbos/org-foundation/legal-entities/{id}` (`xe-du-lich`/`main`) | 200 | XBOS-ORG-200 | **PASS** — scope parity read |
| **L2.5 API** | Shareholders tab preload `GET …/shareholders` (same headers) | 200 | XBOS-SHR-200 | **PASS** (was **409** before deploy) |
| **L2.5 API** | Save mutate `PUT …/legal-entities/{id}` | 200 | XBOS-ORG-201 | **PASS** |
| **L2.5 browser** | Settings → `company_member_units` → edit **XE_DU_LICH** → **Lưu** | — | — | **PASS** (cited) · `p1-cc-qa-member-legal-save-l25-20260604.md` @ `68ec457` — not re-clicked this wave (API read path unblocked) |

**Click path (API-equivalent):** Login → `/command-center?settings=company_member_units` → row **XE_DU_LICH** → detail fetch uses member registry headers → shareholders preload must not **409**.

**U28-R4 scope parity:** List (`group-member-units`) shows `XE_DU_LICH` id; GET-by-id + shareholders same partition → **200** (no list/detail split).

---

## Matrix module snapshot (group CEO — nip.io)

| Module | Read list | Read detail | Create | Update | QA slice |
|--------|-----------|-------------|--------|--------|----------|
| Auth | PASS | PASS | N/A | N/A | JWT via `p1-ex` probe |
| CC org / legal | PASS | **PASS** (P0-01 closed) | GWC | **PASS** | § J-CC-02 above |
| CC KPI | PASS | PASS | N/A | N/A | J-CC-03 probe |
| HRM contracts | PASS | PASS (drawer/J-HRM-03 probe) | **PASS** | **PASS** | P0-02 closed |
| HRM insurance | **PASS** (native) | PASS (J-HRM-04 probe) | UNTESTED | UNTESTED | P0-03 closed |
| HRM employees | PASS | PASS | UNTESTED | UNTESTED | L2.5 J-HRM-02 probe |
| Settings catalogs | PASS (main) | — | — | — | P0-04 **GWC** holding **200** |

Member CEO / subordinate columns: **not executed** on nip.io this wave (matrix § residual).

---

## L0–L2.5 gate summary

| Layer | Command / artifact | Verdict |
|-------|-------------------|---------|
| **L0** | `qc:dev-stack` local | **FAIL** (ENV) |
| **L1** | `test:system:uat` | **SKIP** (local HRM/XBOS down) |
| **L2** | `tmp-p1-ex-qa-https-01-probe.mjs` | **PASS** 23/23 |
| **L2.5** | Same probe + J-CC-02 API read | **PASS** 7/7 + member legal read chain |
| **CRUD P0** | § P0 table | **3 closed**, **1 GWC**, **2 UNTESTED** |

---

## Residual (PM dispatch — not blocking this QA wave closure)

| Priority | Item | Owner | pm_dispatch_hint |
|----------|------|-------|------------------|
| P1 | Local **L0/L1** when stack available | devops + qa | `pnpm run qc:dev-stack` then `test:system:uat` + `tmp-c-w2qc-01-crud-matrix-close.mjs` @ `PORTAL_DEV_URL=http://127.0.0.1:5175` |
| P2 | Pilot **502** flaps on `xbos` login | devops | Health-check/restart `xbos-be` nginx upstream; attach deploy SHA to bus |
| P3 | **P0-CRUD-05** RACI group CEO save | dev-be | Regression only if matrix 409 reappears |
| P4 | **P0-CRUD-06** workflow approve + seed | dev-fe + devops | BR-INBOX-01 — real pending task, no mock-only approve |
| P5 | Member CEO CRUD columns **UNTESTED** | qa | `du-lich.ceo@xe.vn` negative + member mutate slice on nip.io |
| P6 | Update matrix doc cells P0→PASS | ba-process / pm | Reflect § P0 verdicts above in `PHASE1_CRUD_ACCEPTANCE_MATRIX.md` |

---

## completion_report

- Executed **PHASE1_CRUD_ACCEPTANCE_MATRIX** P0 focus on HTTPS pilot after **P1-PHASE1-BE-SCOPE-CRUD-01**.
- **Closed on nip.io:** P0-CRUD-01 (read detail + shareholders), P0-CRUD-02 (contract C/R/U/D), P0-CRUD-03 (insurance list).
- **J-CC-02** read-detail API path **PASS**; mutate regression **4/4 PASS**; browser save cited from prior wave.
- **GWC:** P0-CRUD-04 holding settings **200** (policy).
- **ENV:** local stack down; L1 skipped.
- **Open:** RACI + workflow approve UNTESTED; member persona CRUD UNTESTED; pilot 502 intermittent.

## next_owner

**pm**

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-PM-CRUD-MATRIX-02
PM: INTAKE QA PASS_TO_PM from docs/qa/evidence/p1-phase1-qa-crud-matrix-20260604.md.
1) Task devops — stabilize nip.io xbos-be (502 flaps); confirm deploy includes legal-entity-profile read scope (shareholders 200).
2) Task ba-process — update PHASE1_CRUD_ACCEPTANCE_MATRIX.md P0-CRUD-01..03 cells to PASS; keep P0-04 GWC D16 note.
3) Task qa (when local up) — qc:dev-stack + test:system:uat + tmp-c-w2qc-01-crud-matrix-close.mjs; member CEO du-lich.ceo CRUD negative column.
4) Task dev-fe + seed — P0-CRUD-06 workflow approve BR-INBOX-01 if still UNTESTED for Phase 1 gate.
5) Task qc — re-gate U28 CRUD slice with this evidence + prior p1-phase1-qc-full-rbac if matrix promotion requested.
residual_auto_fix: true
```

## pm_dispatch_hint

`P1-PHASE1-BE-SCOPE-CRUD-01` **verified PASS on nip.io** — no further dev-be for P0-01/02/03 unless regression. Dispatch **devops** (502 + local stack), **qa** (member CEO + local crud-matrix-close), **dev-fe** (P0-CRUD-06 workflow), **ba-process** (matrix doc sync).
