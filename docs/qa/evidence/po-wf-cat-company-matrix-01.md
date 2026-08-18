# PO-WF-CAT-COMPANY-MATRIX-01 — BA-Data evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-WF-CAT-COMPANY-MATRIX-01` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **u65_zero_seed** | true (matrix AC only; no seed execution) |
| **deliverable** | `docs/program/matrices/PO_WF_CATALOG_COMPANY_MATRIX.md` |

---

## completion_report

**Closed**

- Published normative matrix: **§1** `co_key` ↔ org tenant/slug/UUID/persona (dual-plane A/B); **§2** `process_id` × `co_key` aligned to program §5 with AS-IS/GAP WF codes; **§3** catalog_key × company publish/apply/pull + field-level AC; **§4** API trace config-sync / catalog-governance / catalog-sync / settings-catalogs.
- Refined §1 from SoT data: HRM operating slugs (`trsport`, `logistics`, `finance`, `services`) vs org `companyId` (`xe-tmdv`, `visun`, `xe-du-lich`, `xe-vietnam`) — **no invented UUIDs** (from `HRM_COMPANY_UUID_BY_SLUG` only).
- Catalog P0 keys locked to SRS §16.7 + program §5: `job_titles`, `departments`, `leave_types`, `recruitment_channels`, `job_grades`; `positions` documented as alias; `contract_types` flagged P1 per SRS.
- Trace rows linked to J-XBOS-02, J-XBOS-CTRL-01..03, UF-XBOS-09/15.

**Residual**

- `docs/program/deltas/BA_ERP_XBOS_CTRL_SPEC_01_20260728.md` **not present** on workspace — allow-list taken from `docs/hrm/SRS.md` §16.7 + `PILOT_BUSINESS_FLOW_BA_TRACE.md` §22 (R-WFCAT-04).
- **P-ATT-ADJ** / **CANDIDATE** process WF codes — SPEC_GAP; `PO-WF-CAT-TAXONOMY-01` (ba-process) before instance TC matrix.
- Member CEO personas for CO-TMDV / CO-VISUN / CO-VN not fully seeded in HDSD — apply targets use tenant ids from org-seed; QA may use group CEO apply + member pull probes.

**Not in scope (cấm)**

- No `apps/**` edits · no seed · no UAT DONE claim.

---

## spec_read_ack

| Artifact | Sections used |
|----------|----------------|
| `docs/program/PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md` | §4 company table · §5 process + catalog keys |
| `docs/qa/PILOT_SCOPE_DATA_MATRIX.md` | §2–§4 scope `main` vs `holding` |
| `scripts/lib/hrm-company-slug-map.mjs` | `GROUP_MEMBER_SLUGS`, `HRM_COMPANY_UUID_BY_SLUG`, display names |
| `apps/api/xbos-api/data/org-seed-member-companies.json` | holding + subsidiary `companyId` |
| `docs/hrm/SRS.md` | §16.7 E-XBOS-CTRL P0/P1 allow-list |
| `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` | §22 J-XBOS-CTRL-* |
| `apps/api/xbos-api/src/config-sync/config-sync.controller.ts` | publish / apply / get routes |
| `apps/api/hrm-api/src/catalog-sync/catalog-sync.controller.ts` | pull / status / get routes |
| `apps/api/hrm-api/src/settings-catalogs/hrm-settings-master-keys.ts` | catalog families / aliases |

---

## Verification (read-only)

- Matrix file exists and contains 4 required table groups (co, process×co, catalog×co, API trace).
- UUID count = 5 — all match slug map file (grep `10000000-0000-4000-8000`).

---

## next_owner

**pm** → dispatch **qa** (`PO-ECO-TC-XBOS-CAT-MEMBER-01`) and **ba-process** (`PO-WF-CAT-TAXONOMY-01`) in parallel where quota allows.

---

## next_dispatch_prompt

```text
work_item_id: PO-ECO-TC-XBOS-CAT-MEMBER-01
from_role: pm
to_role: qa
lane: execution

read_first: docs/program/matrices/PO_WF_CATALOG_COMPANY_MATRIX.md §3–§4 · docs/qa/testcases/_TEMPLATE_MENU_TC_PACK.md · PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md §6

Mission: Author TC pack publish + apply-to-members × co_key (CO-HOLD → CO-TMDV/CO-VISUN/CO-DL/CO-VN) for P0 catalog keys job_titles, departments, leave_types per matrix §3.3 field AC. U65: full FE chain, F5 after pull; cấm seed. Columns: process_id (P-CAT-EXT where relevant), co_key, catalog_key, hdsd_align.

exit_criteria: Pack under docs/qa/testcases/xbos/ (or program path §6); evidence docs/qa/evidence/po-eco-tc-xbos-cat-member-01.md; ack READY_FOR_SYNTH or PASS_TO_PM with residual list.

Parallel (governance): PO-WF-CAT-TAXONOMY-01 → ba-process — map CANDIDATE/GAP process_id to WF code or SPEC_GAP row; do not invent codes.
```

---

## Handoff

| Field | Value |
|-------|-------|
| evidence_path | `docs/qa/evidence/po-wf-cat-company-matrix-01.md` |
| matrix_path | `docs/program/matrices/PO_WF_CATALOG_COMPANY_MATRIX.md` |
| ack_status | **PASS_TO_PM** |
