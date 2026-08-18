# SA-U71-XBOS-AUTH-TENANT-DESIGN-01 — Physical DB_DESIGN + API_DESIGN (F.1)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-XBOS-AUTH-TENANT-DESIGN-01` |
| **lane** | governance · U71 P2 |
| **date** | 2026-07-27 |
| **change_mode** | ADD · preserve_default |
| **forbidden** | `apps/**` (not touched) |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Spec read ack

| Layer | Path · section |
|-------|----------------|
| Gap scan | `docs/qa/evidence/sa-u71-spec-gap-scan-01-20260727.md` — Auth + tenant-scope **P2** |
| TechSpec | `docs/xbos/TECHSPEC.md` **§14.1–14.3** FR-XBOS-AUTH-01 · FR-XBOS-TENANT-01 · FR-ECO-SCOPE-02 |
| SRS khách | `SRS_XBOS_KHACH.md` **§3.1–3.3** Diễn biến AUTH #1–8 · TENANT #1–7 · ECO #1–7 |
| OpenAPI | `docs/api/openapi/xbos-api.yaml` — `xbosAuthLogin` · `xbosAuthSelectMembership` · `tenantScopeAccessible` |
| must_keep | RACI · Workflow · Catalog-gov · KPI U71 pairs · UF-XBOS-01/11 🟢 · U65 · G-OA-02 CLOSED |
| Gate | `.cursor/rules/spec-db-api-design-gate.mdc` · OS `13` §3.4.11.F/F.1 |
| Runtime truth | `AuthService` (`xbos_portal_user`) · `TenantScopeService.listAccessible` · `resolveScopeContext` · JWT TTL 86400 |

---

## 2. Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| DB_DESIGN | `docs/xbos/DB_DESIGN_XBOS_AUTH_TENANT.md` | **ADD** — portal_user · tenant_registry · membership · JWT session logical |
| API_DESIGN | `docs/xbos/API_DESIGN_XBOS_AUTH_TENANT.md` | **ADD** — Endpoints A–E F.1 |
| Pointers | `docs/tech-spec/DB_DESIGN_XBOS_AUTH_TENANT.md` · `API_DESIGN_XBOS_AUTH_TENANT.md` | **ADD** thin |
| Index | `docs/tech-spec/README.md` §2 + §3 + §5 | **Promoted** · count **16** pairs |
| TechSpec pointer | `docs/xbos/TECHSPEC.md` §14.1–14.3 | **ADD** U71 physical links |

### F.1 checklist (API)

| Endpoint | Mục đích | Nghiệp vụ | Bước SRS | DTO↔DB | Errors |
|----------|----------|-----------|----------|--------|--------|
| POST `…/auth/login` | ✅ | ✅ | **FR-AUTH-01 #2–8** · UF-01 | ✅ portal + memberships | AUTH-200 · 401 · 403 |
| GET `…/auth/me` | ✅ | ✅ | AUTH hydrate / #7 | ✅ | AUTH-200 · 401 |
| GET `…/tenant-scope/accessible` | ✅ | ✅ | **FR-TENANT-01 #1–3** | ✅ JOIN | TENANT-200 |
| POST `…/auth/select-membership` | ✅ | ✅ | **FR-TENANT-01 #4–7** | ✅ JWT re-issue | AUTH-201 · 403 |
| ECO scope contract (`resolveScopeContext` + group gates) | ✅ | ✅ | **FR-ECO-SCOPE-02 #1–7** · UF-11 | ✅ claims | 409 · TENANT-403 |

---

## 3. Architecture notes (facts)

- Login SoT = `xbos_portal_user` + membership JOIN; default JWT membership prefers `roleCode` chứa `ceo`.
- Select-membership **re-issues JWT only** — no membership row UPDATE; OpenAPI G-OA-02 remains **CLOSED**.
- Session = HS256 JWT (no session table); TTL default 86400; `expiresInSec` === `exp−iat`.
- Plane B: JWT/`default_company_id` TEXT slug — cấm LE UUID as company claim.
- ECO-SCOPE-02 = cross-cutting resolver; group endpoints 403 for non-master; mismatch 409 không remap im lặng.
- **must_keep:** RACI/WF/catalog-gov/KPI pairs untouched; UF-01/11 🟢; U65 zero-seed.

---

## 4. Residual

| Item | Owner | Priority |
|------|-------|----------|
| G-SCOPE-01 list↔get-by-id parity on-touch | `dev-be` per module | P1 when touched |
| OpenAPI login `requestBody` schema depth | `dev-be` optional | P2 |
| Next U71 P2 batch | HRM Performance / decisions / metadata / mobile | `SA-U71-HRM-W2-SLICE-DESIGN-01` |
| Prior OpenAPI RACI/CC/KPI DTO | still execution | G-OA-W2-* / G-DTO-W2-KPI-01 |

---

## 5. Handoff

### completion_report

**Closed:** U71 P2 physical F.1 pair for XBOS Auth + tenant-scope + ECO scope — `DB_DESIGN_XBOS_AUTH_TENANT.md` + `API_DESIGN_XBOS_AUTH_TENANT.md` with Mục đích · Nghiệp vụ · bước SRS (FR-AUTH/TENANT/ECO Diễn biến) · DTO↔DB · errors; must_keep RACI/WF/catalog-gov/KPI; tech-spec thin pointers + README §2 promote (16 pairs); TechSpec §14.1–14.3 pointers; no `apps/**`.

**Residual:** G-SCOPE-01 on-touch; optional login OpenAPI body depth; next HRM W2 P2 batch.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: SA-U71-HRM-W2-SLICE-DESIGN-01
role: sa (lane governance · U71 P2)
read_first:
  - docs/tech-spec/README.md §3 residual
  - docs/qa/evidence/sa-u71-spec-gap-scan-01-20260727.md — HRM Performance / decisions / metadata / mobile P2
  - docs/hrm/TECHSPEC.md §16.* + TECHSPEC_MOBILE.md (relevant FR)
  - docs/xbos/DB_DESIGN_XBOS_AUTH_TENANT.md · API_DESIGN (must_keep — do not rewrite)
  - .cursor/rules/spec-db-api-design-gate.mdc
change_mode: ADD · forbidden apps/**
deliver:
  - Physical DB_DESIGN + API_DESIGN F.1 for in-scope HRM W2 slices (batch or split per PM U69)
  - Promote docs/tech-spec/README.md §2 + thin pointers
exit: F.1 complete; PASS_TO_PM
evidence_path: docs/qa/evidence/sa-u71-hrm-w2-slice-design-01-YYYYMMDD.md
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/sa-u71-xbos-auth-tenant-design-01-20260727.md`

### pm_dispatch_hint

`SA-U71-HRM-W2-SLICE-DESIGN-01` — next U71 P2 physical design batch; Auth/Tenant F.1 CLOSED.
