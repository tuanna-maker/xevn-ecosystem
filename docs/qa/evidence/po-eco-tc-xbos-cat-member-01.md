# PO-ECO-TC-XBOS-CAT-MEMBER-01 — QA evidence (TC pack authoring)

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-ECO-TC-XBOS-CAT-MEMBER-01` |
| **from_role** | qa |
| **to_role** | qa-synth / pm |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **u65_zero_seed** | true (every chain TC encodes FE-only precond; empty SoT = BLOCKED) |
| **hdsd_align** | true (column on every TC row · CC Áp dụng danh mục HRM · Publish/Lưu · HRM Đồng bộ từ XBOS) |
| **uat_done** | **false** — design pack only; no browser execution |
| **pack_path** | `docs/qa/testcases/xbos/XBOS-CAT-MEMBER-MATRIX.md` |
| **supersedes** | draft `XBOS-CATALOG-MEMBER-MATRIX.md` → stub pointer |

---

## Why re-author (re-dispatch 23:50)

Prior DISPATCHED 23:45 lacked durable SoT alignment. Company matrix + taxonomy are now **PASS_TO_PM** SoT — pack rewritten with:

- Dual-plane `co_key` (§1 org Plane A vs HRM Plane B)
- Field-level AC from matrix **§3.3** (PublishCatalogDto / apply targets / pull)
- Columns: `process_id` · `co_key` · `catalog_key` · `hdsd_align` · HP/FD/XREF
- P0 keys per SRS §16.7: `job_titles` · `departments` · `leave_types` · `recruitment_channels` · `job_grades`
- `positions` = alias of `job_titles` (XREF/ALIAS only)
- P-CAT-EXT XREF → `TC-WFM-CAT-*` + `TC-XIC-EXT-*` / `TC-XIC-CG-*`

---

## completion_report

**Closed**

- Read `PO_WF_CATALOG_COMPANY_MATRIX.md` §1/§3/§4 · `PO_WF_PROCESS_TAXONOMY.md` P-CAT-EXT · program §5–§7 · SRS §16.7 · template + XREF packs (no chrome copy).
- Authored **`XBOS-CAT-MEMBER-MATRIX.md`**: 7 screens · 18 fields · 9 functions · **36 TC** (`TC-XCM-*`) all **PLANNED**.
- Exit matrix: ≥1 publish@HOLD+Lưu ×5 P0 keys · ≥1 apply multi-`co_key` · ≥1 HRM pull/F5 per key family · ≥1 FD empty apply + wrong scope · alias + P-CAT-EXT XREF.
- Stubbed old path `XBOS-CATALOG-MEMBER-MATRIX.md` → canonical.
- No `apps/**` · no seed · `uat_done=false`.

**Residual**

- Synth: merge with `XBOS-WF-PROCESS-MATRIX.md` **TC-WFM-*** (esp. **TC-WFM-CAT-***) + INBOX-CAT + HRM-SETTINGS → `PO-ECO-TC-SYNTH-WF-CAT-01`.
- GAP-XCM-PUB-UI: dedicated CC Publish chrome may be missing — TC allows gov/config-sync FE path.
- GAP-XCM-CT-P1: `contract_types` GWC (VAL-WFCAT-06).
- Browser execution deferred.

---

## Inventory summary

| Layer | Count |
|-------|------:|
| Screens | 7 |
| Fields | 18 |
| Functions | 9 |
| TCs | 36 |

### P0 publish → apply → pull chains

| catalog_key | Publish HP | Apply HP | Pull/F5 HP | Apply `co_key` |
|-------------|------------|----------|------------|----------------|
| `job_titles` | PUB-JT-HP-001 | AP-HP-003 | HRM-JT-HP-001 | CO-TMDV+CO-VISUN |
| `departments` | PUB-DE-HP-001 | AP-DE-HP-001 | HRM-DE-HP-001 | CO-TMDV+CO-DL |
| `leave_types` | PUB-LV-HP-001 | AP-LV-HP-001 | HRM-LV-HP-001 | CO-DL+CO-VISUN |
| `recruitment_channels` | PUB-RC-HP-001 | AP-RC-HP-001 | HRM-RC-HP-001 | CO-TMDV+CO-VISUN |
| `job_grades` | PUB-JG-HP-001 | AP-JG-HP-001 | HRM-JG-HP-001 | CO-TMDV+CO-VN |

### FD / AU / XREF highlights

| Class | TC-IDs |
|-------|--------|
| Empty / wrong-scope FD | AP-FD-001 · AP-FD-003 · HRM-FD-001 · PUB-FD-001 |
| Allow-list CFG-005 | AP-FD-002 · VAL-006 |
| Member AU | PUB-AU-001 · AU-002 · HRM-AU-001 |
| P-CAT-EXT XREF | EXT-XREF-001/002 → TC-WFM-CAT-* · TC-XIC-* |
| Alias | ALIAS-001 (`positions`) · ALIAS-002 (`candidate_sources`) |

---

## spec_ref

- `docs/program/matrices/PO_WF_CATALOG_COMPANY_MATRIX.md` §1 · §3.1–§3.3 · §4 · VAL-WFCAT-01..07
- `docs/program/matrices/PO_WF_PROCESS_TAXONOMY.md` §3 P-CAT-EXT
- `docs/program/PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md` §5–§7
- `docs/hrm/SRS.md` §16.7 P0 allow-list
- `docs/qa/testcases/xbos/XBOS-WF-PROCESS-MATRIX.md` TC-WFM-CAT-*
- `docs/qa/testcases/xbos/XBOS-INBOX-CAT.md` TC-XIC-CG-* / TC-XIC-EXT-*

---

## next_owner

**qa-synth** (or **pm** to dispatch `PO-ECO-TC-SYNTH-WF-CAT-01`)

---

## next_dispatch_prompt

```text
work_item_id: PO-ECO-TC-SYNTH-WF-CAT-01
from_role: pm
to_role: qa
lane: execution
ack_status_target: PASS_TO_PM

Mission: SYNTH merge catalog×member pack with WF process matrix.
- Primary packs: docs/qa/testcases/xbos/XBOS-CAT-MEMBER-MATRIX.md (36× TC-XCM-*) + docs/qa/testcases/xbos/XBOS-WF-PROCESS-MATRIX.md (TC-WFM-*)
- Neo-map P-CAT-EXT: TC-XCM-EXT-XREF-001 ↔ TC-WFM-CAT-HP-001 ↔ TC-XIC-EXT-HP-001 → TC-XIC-CG-HP-001
- Dedupe vs XBOS-INBOX-CAT.md · XBOS-CATALOG-CC.md (OOS) · HRM-SETTINGS.md (TC-SET-C-HP-002 ↔ TC-XCM-HRM-JT-HP-001)
- Update roster XBOS-CATALOG-APPLY + PO_SPEC_TEST_REPORT / depth status; 0 duplicate TC-IDs

read_first (ordered):
1. docs/qa/testcases/xbos/XBOS-CAT-MEMBER-MATRIX.md
2. docs/qa/evidence/po-eco-tc-xbos-cat-member-01.md
3. docs/qa/testcases/xbos/XBOS-WF-PROCESS-MATRIX.md
4. docs/program/matrices/PO_WF_CATALOG_COMPANY_MATRIX.md §3
5. docs/qa/testcases/xbos/XBOS-INBOX-CAT.md (XREF only)

exit_criteria:
- evidence docs/qa/evidence/po-eco-tc-synth-wf-cat-01.md
- synth neo-map table TC-XCM-* × TC-WFM-* × TC-XIC-*
- roster SYNTHED; ack PASS_TO_PM
- no browser run; no UAT DONE; no apps/**; no seed
```

---

## Handoff contract

| Field | Value |
|-------|-------|
| completion_report | See § completion_report |
| next_owner | qa-synth |
| next_dispatch_prompt | See block above |
| evidence_path | `docs/qa/evidence/po-eco-tc-xbos-cat-member-01.md` |
| ack_status | **READY_FOR_SYNTH** |

---

*Authoring only · IEEE 829 execution logs required when TCs move to EVIDENCED*
