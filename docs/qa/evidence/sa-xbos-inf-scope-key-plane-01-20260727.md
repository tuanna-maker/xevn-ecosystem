# SA-XBOS-INF-SCOPE-KEY-PLANE-01 — Infra `appliesToCompanyIds` key plane

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-XBOS-INF-SCOPE-KEY-PLANE-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance · DATA_LINKAGE §6 residual |
| **date** | 2026-07-27 (ICT) |
| **change_mode** | ADD |
| **preserve_default** | true |
| **ack_status** | **PASS_TO_PM** |
| **U65** | No seed · no `apps/**` · no Phase1 claim |
| **must_keep** | CO-HC / OP / MD GWC — **not** reopened |

---

## 0. read_first ack

| Artifact | Use |
|----------|-----|
| `docs/qa/evidence/ba-dual-plane-audit-02-20260727.md` | Residual #5 infra `appliesToCompanyIds` |
| `docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md` §6 | Matrix + backlog |
| `docs/xbos/INFRA_FOUNDATION_CATEGORY_WIZARD_UX.md` | BR-FCAT-SCOPE · wizard AC |
| `ADR-METADATA-APPLY-CONSUMERS-DELTA-20260620` | Entity-key planes + resolver |
| `ADR-HRM-XBOS-PLANE-A-BRIDGE-4LE-5SLUG-20260727` | A ≠ B ≠ B′ |
| As-built FE | `infrastructureEntityKeyResolver.ts` · holding aliases |
| As-built BE | `InfrastructureService` JSONB upsert — opaque strings |

**Out of scope:** `apps/**` · seed · Phase1 DONE · reopen HRM OP/MD/CO-HC GWC.

---

## 1. Normative SoT (exit 1)

| Plane | Role in `appliesToCompanyIds` |
|-------|-------------------------------|
| **A** | **Member** keys = `xbos_legal_entity.id` UUID — **normative** |
| **C + synthetic** | Holding = prefer `xbos-group-holding-root`; match-equivalent `main` · `holding` |
| **B** | Workforce slugs — **forbidden as member keys** (`trsport|logistics|finance|services`) |
| **B′** | `HRM_COMPANY_UUID_BY_SLUG` — **forbidden** |

**Orthogonal:** settings row `company_id` partition (JWT / `normalizeCompanyId` → often `holding`) ≠ array element SoT.

**Match:** exact LE UUID; holding via `INFRA_HOLDING_ENTITY_ALIASES` / `infraEntityIdsMatch`. No LE↔B′ bridge in infra.

---

## 2. Options + decision

| Option | Summary | Verdict |
|--------|---------|---------|
| **A — Plane A + holding aliases** | Lock as-built wizard/resolver plane | **Accepted** |
| **B — Plane B slug SoT** | Tick workforce slugs; map every site | Reject — conflates COUNT plane; high blast |
| **C — Plane B′ SoT** | Store pilot UUIDs | Reject — ≠ site LE; OP/MD plane confusion |

Full trade-offs: `docs/architecture/ADR-XBOS-INF-APPLIES-TO-COMPANY-IDS-KEY-PLANE-20260727.md`.

---

## 3. Design delta delivered (exit 2)

| Path | Change |
|------|--------|
| `docs/architecture/ADR-XBOS-INF-APPLIES-TO-COMPANY-IDS-KEY-PLANE-20260727.md` | **ADD** Accepted ADR |
| `docs/xbos/API_DESIGN_XBOS_INFRASTRUCTURE.md` | **ADD** F.1 GET/PUT/summary + key plane + AC-INF-KEY-* |
| `docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md` §6.2 #5 / §6.3 / §6.4 | CLOSED design; FE P1 + BE P2 backlog; QA checklist line |
| `docs/xbos/INFRA_FOUNDATION_CATEGORY_WIZARD_UX.md` | **ADD** BR-FCAT-SCOPE-04 |
| `docs/tech-spec/README.md` §2 | Index row Infra key-plane · count **22** |

**No** new DDL · **no** `apps/**` · **no** seed.

**BE immediate?** **No** — as-built accepts opaque JSON; harden = optional P2 validate. Execution next = **dev-fe**.

---

## 4. Exit criteria

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Normative SoT slug vs LE UUID vs B′ | **PASS** — A + holding aliases; not B/B′ |
| 2 | Design note / API_DESIGN residual close or BACKLOG BE | **PASS** — ADR + API_DESIGN; BE WI P2 only |
| 3 | This evidence → PASS_TO_PM | **PASS** |
| 4 | next_dispatch only if BE needed | **PASS** — BE not required; FE P1 queued |

---

## completion_report

**Closed:** DATA_LINKAGE §6 #5 design residual — `appliesToCompanyIds` locked to Plane **A** member LE UUID + holding aliases (`xbos-group-holding-root`/`main`/`holding`); B′ and workforce member slugs forbidden; ADR Accepted; API_DESIGN F.1 ADD; wizard BR-FCAT-SCOPE-04; tech-spec index; CO-HC/OP/MD not reopened; no apps/seed.

**Residual:** P1 FE persist/normalize `D-XBOS-INF-SCOPE-KEY-PLANE-FE-01`; optional P2 BE validate `D-XBOS-INF-SCOPE-KEY-VALIDATE-01`.

### next_owner

`pm` → Task **`dev-fe`** `D-XBOS-INF-SCOPE-KEY-PLANE-FE-01` (not BE)

### next_dispatch_prompt

```text
work_item_id: D-XBOS-INF-SCOPE-KEY-PLANE-FE-01
role: dev-fe
lane: execution
change_mode: ADD
entry_criteria: SA-XBOS-INF-SCOPE-KEY-PLANE-01 PASS_TO_PM — read docs/qa/evidence/sa-xbos-inf-scope-key-plane-01-20260727.md + docs/architecture/ADR-XBOS-INF-APPLIES-TO-COMPANY-IDS-KEY-PLANE-20260727.md + docs/xbos/API_DESIGN_XBOS_INFRASTRUCTURE.md §0/§4 + INFRA_FOUNDATION_CATEGORY_WIZARD_UX BR-FCAT-SCOPE-04.
read_first:
  - docs/architecture/ADR-XBOS-INF-APPLIES-TO-COMPANY-IDS-KEY-PLANE-20260727.md
  - docs/xbos/API_DESIGN_XBOS_INFRASTRUCTURE.md
  - docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md §6.2 #5
  - apps/web/web-portal/src/integrations/infrastructureEntityKeyResolver.ts (must_keep alias match)
must_keep: CO-HC / OP / MD GWC; infraEntityIdsMatch holding aliases; U65 no seed; no BE scope rewrite
forbidden_paths: apps/api/**; reopen OP/MD/CO-HC; seed
exit_criteria:
  1) Wizard/save persists member = Plane A LE UUID; holding prefers xbos-group-holding-root
  2) Never write B′ or trsport|logistics|finance|services into appliesToCompanyIds
  3) AC-INF-KEY-01..05 + unit tests on resolver/scope bind; F5 checkbox round-trip
  4) CODE-MEMORY APPEND cite ADR + API_DESIGN; evidence docs/qa/evidence/fe-xbos-inf-scope-key-plane-01-20260727.md READY_FOR_QA
spec_read_ack required: srs UC-XBOS-INF-01/CC-07 · api_design docs/xbos/API_DESIGN_XBOS_INFRASTRUCTURE.md · adr key plane
```

### evidence_path

`docs/qa/evidence/sa-xbos-inf-scope-key-plane-01-20260727.md`

### ack_status

**PASS_TO_PM**

### pm_dispatch_hint

`D-XBOS-INF-SCOPE-KEY-PLANE-FE-01` — FE persist Plane A + holding root; **not** BE this wave.
