# PO-ECO-TC-XBOS-CATALOG-CC-01 — QA evidence (TC pack authoring)

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-ECO-TC-XBOS-CATALOG-CC-01` |
| **from_role** | qa |
| **to_role** | qa-synth / pm |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **u65_zero_seed** | true — every TC precond uses FE **+ Thêm dòng** or edit existing row after login |
| **hdsd_align** | true — sidebar paths document / measurement / pricing under CC Cài đặt |
| **uat_done** | **false** — TC pack only; no browser execution this task |
| **pack_path** | `docs/qa/testcases/xbos/XBOS-CATALOG-CC.md` |
| **cross_ref** | `docs/qa/testcases/xbos/XBOS-INBOX-CAT.md` — UF-09/15 gov; §4.3 TC-XIC-CC-* mapped to TC-CCC-* |

---

## completion_report

**Closed**

- Dedicated **WORLD-STANDARD depth** pack for **UF-XBOS-14** only (Command Center catalog autosave: **document** · **measurement** · **pricing**).
- **6 screen classes** (shell + 3 tabs + loading/empty + error notice); **28 fields**; **13 functions**; **28 TCs** (HP/FD/BD/AU/UX/REG/XREF).
- Coverage check §5 **0 GAP**; depth_gate all ☑ on pack meta.
- Governance approve path (**UF-XBOS-09**) and extension→inbox (**UF-XBOS-15**) **not** rewritten — **TC-CCC-XREF-001** points to `TC-XIC-EXT-HP-002` / `TC-XIC-CG-*` in inbox pack.
- Synth supersession table: `TC-XIC-CC-*` → `TC-CCC-*` for dedupe with `XBOS-INBOX-CAT.md`.
- Cited prior UF-14 browser PASS (`p1-qa-uf14-8088-retest-20260620.md`) as *Prior evidence* only — **no** re-execution claim.

**Residual**

- **qa-synth:** merge `TC-CCC-*` into `docs/qa/PO_SPEC_TEST_CASE_CATALOG.md` + `docs/qa/reports/PO_SPEC_TEST_REPORT.md` Ecosystem depth §; update roster rows to **READY_FOR_SYNTH**.
- **R-UF14-TITLE-TYPE** (P3): title column automation quirk — carry in TC-CCC-DOC-UX-001 area; version path remains primary AC.
- Browser execution **deferred** (U78 / world-standard test log) — all matrix **PLANNED**.

---

## Inventory summary (for synth)

| Tab | Route | API partition | Default new row |
|-----|-------|---------------|-----------------|
| Văn bản/Quy định | `?settings=document` | `regulations` | `QĐ-{timestamp}`, version `v1.0`, active true |
| Đo lường/Tiền tệ | `?settings=measurement` | `measurements` | `METRIC-{ts}`, currency VND, precision 2 |
| Thiết lập giá | `?settings=pricing` | `pricing` | `PRC-{ts}`, amount 0 |

| Mechanism | Value |
|-----------|--------|
| Debounce autosave | **800ms** after row state change |
| Post-save | `saveCcCatalogRows` → `loadCcCatalogRows` (hydrate merge flat + partition) |
| Envelope | GET `XBOS-MASTER-200` · PUT `XBOS-MASTER-201` |
| Scope | `companyId=holding` group CEO (`ceo@xe.vn`) |

---

## spec_ref

- `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` DoD §2
- `docs/qa/testcases/_TEMPLATE_MENU_TC_PACK.md`
- `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` UF-XBOS-14
- `docs/xbos/TECHSPEC.md` FR-CC-P0-05 / UF-XBOS-14
- `docs/api/openapi/xbos-api.yaml` CommandCenterCatalog* schemas
- `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md` (execution deferred)

---

## next_owner

**qa-synth** (or **pm** to dispatch synth wave including this pack + inbox pack)

---

## next_dispatch_prompt

```text
work_item_id: PO-ECO-TC-SYNTH-XBOS-WAVE-B-CATALOG-01
from_role: pm
to_role: qa

Mission: SYNTH dedupe TC pack `docs/qa/testcases/xbos/XBOS-CATALOG-CC.md` (28× TC-CCC-*) vs `XBOS-INBOX-CAT.md` (retire overlapping TC-XIC-CC-* rows to pointers) + `docs/qa/PO_SPEC_TEST_CASE_CATALOG.md`; update `docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md` rows XBOS-CATALOG-CC-* → READY_FOR_SYNTH/EXEC; append Ecosystem depth § in `docs/qa/reports/PO_SPEC_TEST_REPORT.md`.

read_first: XBOS-CATALOG-CC.md · XBOS-INBOX-CAT.md §4.3 supersession table · evidence po-eco-tc-xbos-catalog-cc-01.md · po-eco-tc-xbos-inbox-cat-01.md

entry_criteria: both packs ack READY_FOR_SYNTH
exit_criteria: no duplicate TC-ID; UF-XBOS-14 trace complete; roster updated; synth evidence path written
cấm: claim UAT DONE; seed precond in merged TCs (U65)
```

---

## Handoff packet (contract)

- **completion_report:** (see above)
- **next_owner:** qa-synth
- **next_dispatch_prompt:** (see block above)
- **evidence_path:** `docs/qa/evidence/po-eco-tc-xbos-catalog-cc-01.md`
- **ack_status:** **READY_FOR_SYNTH**
