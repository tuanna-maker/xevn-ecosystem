# TM-U71-PHYSICAL-BACKLOG-CLOSE-01 — U71 physical F.1 backlog close (governance)

| Field | Value |
|-------|--------|
| **work_item_id** | `TM-U71-PHYSICAL-BACKLOG-CLOSE-01` |
| **from_role** | `pm` |
| **to_role** | `technical-manager` |
| **lane** | governance · technical audit (NOT product Dev) |
| **date** | 2026-07-27 |
| **gate** | `.cursor/rules/spec-db-api-design-gate.mdc` · OS `_vibe-team-os/13` §3.4.11.**F** / **F.1** |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Executive verdict

| Decision | Result |
|----------|--------|
| **(a) G-RULE-11 path note = F.1-complete for scanned U71 slices** | **SELECTED** |
| **(b) True missing physical pairs still required** | **NONE** for README §2/§3 listed slices |
| Phase1 / PROD / `:8088` | **NOT claimed** |
| SA wipe / Dev reopen soft P2 | **FORBIDDEN — not opened** |

**Summary:** `docs/tech-spec/README.md` §2 claims **21** COMPLETE F.1 pairs; on-disk audit confirms **21/21** canonical DB+API pairs exist (14 HRM incl. IM-01 N/A-DB + 7 XBOS). §3 listed U71 physical backlog is **empty** (all DONE). Spot-check Admin / Fleet / Import / Auth: canonical + thin pointers present; API_DESIGN sections contain F.1 markers (**Mục đích** · **Nghiệp vụ xử lý** · **Bước SRS** / Diễn biến). Import preview correctly documents **non-persist** (no staging invent). Prior U72 product gates remain **GWC local + HOLD_DEPLOY** — orthogonal to this design-path close.

---

## 2. Audit — README §2 vs disk

### 2.1 Pair count

| Check | Expected | Observed |
|-------|----------|----------|
| README §2 COMPLETE rows | 21 | 21 indexed rows |
| Canonical pairs on disk | 21 | **21/21** `Test-Path` PASS |
| HRM under `docs/hrm/` | 14 (incl. IM-01 N/A DB) | 14 |
| XBOS under `docs/xbos/` | 7 | 7 |

### 2.2 Spot-check (Admin / Fleet / Import / Auth)

| Slice | Canonical DB | Canonical API | Pointers `docs/tech-spec/` | F.1 markers (API) |
|-------|--------------|---------------|----------------------------|-------------------|
| **HRM Admin** | `DB_DESIGN_HRM_ADMIN.md` ✅ | `API_DESIGN_HRM_ADMIN.md` ✅ | DB+API ✅ | Mục đích · Nghiệp vụ · Bước SRS ✅ |
| **HRM Fleet** | `DB_DESIGN_HRM_FLEET.md` ✅ | `API_DESIGN_HRM_FLEET.md` ✅ | DB+API ✅ | ✅ |
| **HRM Import preview** | `DB_DESIGN_HRM_IMPORT_PREVIEW.md` ✅ (**N/A table**) | `API_DESIGN_HRM_IMPORT_PREVIEW.md` ✅ | DB+API ✅ | ✅ |
| **XBOS Auth/Tenant** | `DB_DESIGN_XBOS_AUTH_TENANT.md` ✅ | `API_DESIGN_XBOS_AUTH_TENANT.md` ✅ | DB+API ✅ | ✅ |

### 2.3 Import evidence (entry)

| Artifact | Status |
|----------|--------|
| `docs/qa/evidence/sa-u71-hrm-import-preview-design-01-20260727.md` | **PASS_TO_PM** — F.1 IM-01 non-persist; G-IM-* soft only |
| `DB_DESIGN_HRM_IMPORT_PREVIEW` §0 | Explicit **no physical table** · cấm invent staging |

### 2.4 Prior U72 product gates (context only — not reopened)

| Gate | Verdict | Deploy |
|------|---------|--------|
| `qc-hrm-u72-field-display-01-r3-20260727.md` | **GWC** local | **HOLD_DEPLOY** |
| `qc-xbos-u72-field-display-01-r2-20260727.md` | **GWC** local | **HOLD_DEPLOY** |

---

## 3. G-RULE-11 decision

| Aspect | TM finding |
|--------|------------|
| Path bootstrap | **CLOSED** (unchanged) |
| U71 scanned physical F.1 (README §2 list) | **COMPLETE** — 21 pairs on disk; §3 residual **empty** |
| True missing F.1 pair for listed slices? | **No** → option **(a)** |
| Register update | **G-RULE-11 → CLOSED** for U71 scanned F.1 path (OS §3.4.11 F path + paired designs). Soft OpenAPI / DTO / leave / G-IM-* are **separate execution residuals** — **not** G-RULE-11 reopen / SA wipe |

**Option (b) inventory:** empty for listed U71 physical rows. No new SA physical-design WI required from this audit.

---

## 4. Residual table (execution P2–P3 — NOT SA reopen)

| ID / class | Sev | Owner | Action from this TM gate |
|------------|-----|-------|--------------------------|
| OpenAPI deepen (module yaml vs Nest DTO) | P2–P3 | `dev-be` | **Defer** — execution wave; not U71 physical missing |
| **G-DTO** / DTO↔column harden (e.g. G-ADM-DTO-01) | P2 | `dev-be` | **Defer** — leave soft; no Dev reopen now |
| Leave soft UX (U72 C-U72-LEAVE-P3) | P3 | `dev-fe` / qa | **Defer** — product soft condition OK under GWC |
| **G-IM-01** commit/export leftover | Info | ba optional | Catalog leftover — not F.1 path gap |
| **G-IM-SESSION-01** | Info | ba | SRS «mã phiên» vs non-persist — no invent table |
| **G-IM-CATALOG-01** | P2 | ba / `dev-be` | Preview catalog/dup depth — execution; **not** SA wipe |
| **G-IM-OPENAPI-01** | P2 | `dev-be` | Multipart OpenAPI deepen |
| **HOLD_DEPLOY** (U72) | Condition | pm | Stands — **NOT** Phase1 / PROD / `:8088` |

---

## 5. Explicit non-claims

- **NOT** Phase 1 DONE  
- **NOT** PROD-READY  
- **NOT** `:8088` promote  
- **NOT** seed / invent staging tables  
- **NOT** reopen SA to wipe soft P2  
- **NOT** touch `apps/**`

---

## 6. completion_report

**Closed:** Technical audit `TM-U71-PHYSICAL-BACKLOG-CLOSE-01` — confirmed README §2 **21/21** F.1 pairs on disk; §3 U71 physical backlog empty; spot-check Admin/Fleet/Import/Auth + Import N/A-DB; selected **(a)** G-RULE-11 **CLOSED** for scanned U71 F.1 path; soft OpenAPI/G-DTO/leave/G-IM-* classified execution P2–P3 residual only.

**Residual open (non-blocking for U71 physical path):** table §4; U72 HOLD_DEPLOY; no Phase1/PROD/:8088.

**Artifacts touched:** this evidence · `SPEC_CODE_TRACEABILITY_GAP_REGISTER.md` G-RULE-11 / G-SPEC-OS-02 / matrix K · bus append · README §2 residual one-liner (TM close cite).

---

## 7. next_owner / ack

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | `pm` |
| **evidence_path** | `docs/qa/evidence/tm-u71-physical-backlog-close-01-20260727.md` |

---

## 8. next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-U71-F1-PATH-CLOSED-INTAKE-01
from_role: pm
to_role: pm (intake)
lane: governance
entry_criteria:
  - TM-U71-PHYSICAL-BACKLOG-CLOSE-01 PASS_TO_PM
  - evidence: docs/qa/evidence/tm-u71-physical-backlog-close-01-20260727.md
  - G-RULE-11 CLOSED for scanned U71 F.1 (21 pairs); README §3 empty
exit_criteria:
  1) Bus INTAKE CLOSE U71 physical-design backlog (path/F.1)
  2) Do NOT dispatch SA wipe / invent staging / Dev soft-P2 reopen
  3) Keep HOLD_DEPLOY on U72 GWC local; NOT Phase1/PROD/:8088
  4) Optional later execution (sponsor/wave): OpenAPI deepen · G-DTO · G-IM-CATALOG-01 — separate work_item_ids
evidence_path: docs/qa/evidence/tm-u71-physical-backlog-close-01-20260727.md
cấm: apps/** · seed · invent import staging · Phase1/PROD claim · SA reopen soft P2
```
