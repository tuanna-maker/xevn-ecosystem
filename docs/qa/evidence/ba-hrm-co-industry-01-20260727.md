# BA-Process — D-HRM-CO-INDUSTRY-BA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-CO-INDUSTRY-BA-01` |
| **from_role** | pm |
| **to_role** | ba-process |
| **lane** | governance |
| **change_mode** | ADD |
| **date** | 2026-07-27 |
| **ack_status** | **PASS_TO_PM** |
| **no_prompt_echo** | true |

## 1. Incident (sponsor)

Company Management table column **«Ngành nghề»** shows raw English key **`subsidiary`** for member companies. Holding shows **«—»**. Employee counts OK (~1109) — out of scope for this delta (AC-CO-EMP already locked).

## 2. Root cause (confirmed — as-is)

| Layer | Spec says (after this ADD) | Code does (pre-fix) |
|-------|----------------------------|---------------------|
| FE mapper | `industry` ← `business_lines` / companyForm industry → VI dictionary | `mapGroupMemberUnitsToHrmCompanies` set `industry: member.entity_type` |
| Semantics | `entity_type` = org class (`holding` / `subsidiary`) | Treated as industry label |
| XBOS SoT | `xbos_legal_entity.business_lines` (TEXT) exists on LE | `listGroupMemberUnits` SELECT **omits** `business_lines` (only `id,code,name,entity_type,payload`) |
| Form UI | Select uses catalog keys + i18n `industries.*` (VI) | List cell rendered raw `company.industry` without dictionary |

**Class:** dual-field conflation + missing API field + missing label dictionary on list surface. Same family as Plane A/B headcount mistake (wrong SoT field → honest-looking wrong UI).

## 3. Scope delivered (ADD-only)

| Artifact | Delta |
|----------|--------|
| `docs/hrm/SRS.md` | §1.1 industry row; UC-HRM-CO-01 Purpose/Usecases/BR/anti-pattern/Data Interaction; **FR-HRM-CO-IND-01**; **AC-CO-IND-01..06**; **BR-CO-IND-01** / **BR-CO-TYPE-01** / **BR-CO-LABEL-01**; VAL-CO-IND-01..03; §15.4 BR rows |
| `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` | `company` / `/company` cite FR-HRM-CO-IND-01 + AC-CO-IND; §5 AC table; §6 BR-CO-IND/TYPE/LABEL |
| `docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md` | Row **351a** description ADD industry FR (impl still `planned`) |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | **J-HRM-CO-01** extends industry AC |
| `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` | J-HRM-CO-01 AC-CO-IND + BR-CO-LABEL |
| `docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md` | R4 + UF-HRM-CO-IND sample |

**Must keep:** AC-CO-EMP-01..06 / FR-HRM-CO-HC-01 / headcount bridge — **not wiped**.

**Forbidden:** Edit `apps/**` (this wave).

## 4. Acceptance criteria (normative summary)

| AC | Pass |
|----|------|
| **AC-CO-IND-01** | «Ngành nghề» = human-readable industry/business line (VI) when SoT has value |
| **AC-CO-IND-02** | NEVER raw `entity_type` (`subsidiary` / `holding`) in that column |
| **AC-CO-IND-03** | NEVER untranslated catalog key (`tourism`, …) — must use dictionary VI |
| **AC-CO-IND-04** | Empty SoT → **«—»** |
| **AC-CO-IND-05** | Optional separate «Loại đơn vị»: Tập đoàn / Công ty thành viên |
| **AC-CO-IND-06** | F5 stable; API exposes `business_lines` when DB has value |

**Anti-pattern BR-CO-LABEL-01:** Bind technical FK/enum/org-class codes to user-facing labels **without** dictionary = FAIL.

## 5. Residual / next owners

| Gap | Owner | Note |
|-----|-------|------|
| XBOS `listGroupMemberUnits` thiếu `business_lines` (+ optional tax/founded already known) | **sa** → **dev-be** | API_DESIGN + SELECT ADD; ref Diễn biến Ngành nghề |
| FE stop `industry←entity_type`; resolve dictionary; holding enrich from LE | **dev-fe** | may parallel after SA contract; must_keep CO-EMP-COUNT + CO-BIND MST/founded |
| Browser retest J-HRM-CO-01 industry slice | **qa** | After FE READY_FOR_QA; U65 zero-seed |

## 6. completion_report

**Closed:** Governance ADD for Company «Ngành nghề» AC/BR/anti-pattern; matrix + journey + BA trace aligned; evidence filed.

**Open residual:** Execution SA DB/API + FE bind; QA browser not run this wave.

## 7. next_owner

**pm** → dispatch **sa** (API/DB expose `business_lines`) then/parallel **dev-fe** (label bind).

## 8. next_dispatch_prompt (copy-ready)

```text
work_item_id: D-HRM-CO-INDUSTRY-SA-01
from_role: pm
to_role: sa
lane: governance
change_mode: ADD
residual_auto_fix: true

read_first (ordered):
1. docs/qa/evidence/ba-hrm-co-industry-01-20260727.md
2. docs/hrm/SRS.md — UC-HRM-CO-01 / FR-HRM-CO-IND-01 / AC-CO-IND-01..06 / BR-CO-IND-01 / BR-CO-LABEL-01
3. docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md — § Company Management Ngành nghề
4. docs/hrm/TECHSPEC.md §19 (headcount — extend pattern for industry field)
5. apps/api/xbos-api/src/org-foundation/org-foundation.service.ts listGroupMemberUnits SELECT (as-is omits business_lines)

entry_criteria: BA PASS_TO_PM D-HRM-CO-INDUSTRY-BA-01; U65 zero-seed; no wipe AC-CO-EMP.
exit_criteria:
- API_DESIGN slice (or TECHSPEC delta) for GET group-member-units / legal enrich: purpose + nghiệp vụ + bước SRS Diễn biến «Ngành nghề»; DTO includes business_lines
- DB_DESIGN cite: xbos_legal_entity.business_lines TEXT already exists — document map to response
- Spec says / code does: SELECT must include business_lines (and document holding enrich path)
- Hand-off prompt for D-HRM-CO-INDUSTRY-BE-01 + D-HRM-CO-INDUSTRY-FE-01
- evidence: docs/qa/evidence/sa-hrm-co-industry-01-20260727.md
- ack_status: PASS_TO_PM
must_keep: FR-HRM-CO-HC-01 headcount; entity_type remains for org class only
forbidden: invent new industry SoT table; map entity_type as industry; apps/** unless PM says (SA docs only preferred)
```

```text
work_item_id: D-HRM-CO-INDUSTRY-FE-01
from_role: pm
to_role: dev-fe
lane: execution
change_mode: FIX
entry_criteria: Prefer SA D-HRM-CO-INDUSTRY-SA-01 contract OR parallel if API already returns business_lines via enrich; read BA evidence + SRS FR-HRM-CO-IND-01.
spec_read_ack required: srs UC-HRM-CO-01 FR-HRM-CO-IND-01; tech_spec / API_DESIGN after SA.
exit_criteria:
- mapGroupMemberUnitsToHrmCompanies NEVER sets industry from entity_type
- industry display = business_lines / companyForm industry → VI dictionary (industries.*); empty → «—»
- optional: separate Loại đơn vị column with Tập đoàn / Công ty thành viên if product keeps org class visible
- unit tests: subsidiary/holding blocked; tourism→VI; null→null
- must_keep: CO-EMP-COUNT enrich; tax/founded/MST bind; GROUP_HOLDING_ROOT_ID
- forbidden: seed to pass QA; wipe headcount AC
- evidence: docs/qa/evidence/dev-fe-hrm-co-industry-01-20260727.md
- ack_status: READY_FOR_QA
- next: QA J-HRM-CO-01 industry slice U65 browser ceo@xe.vn /command-center/hrm/company
```

## 9. ack_status

**PASS_TO_PM**
