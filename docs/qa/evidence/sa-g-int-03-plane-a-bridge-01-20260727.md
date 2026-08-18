# SA-G-INT-03-PLANE-A-BRIDGE-01 — Plane A ↔ Plane B bridge lock

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-G-INT-03-PLANE-A-BRIDGE-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance · dual-plane residual |
| **date** | 2026-07-27 (ICT) |
| **change_mode** | ADD |
| **preserve_default** | true |
| **ack_status** | **PASS_TO_PM** |
| **U65** | No seed · no `apps/**` · no Phase1 claim |
| **must_keep** | CO-HC / OP / MD GWC — not reopened |

---

## 0. read_first ack

| Artifact | Use |
|----------|-----|
| `docs/qa/evidence/ba-dual-plane-audit-02-20260727.md` | G-INT-03 / 4 LE ↔ 5 slug residual |
| `docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md` §6 | Residual matrix + backlog |
| `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` | `main`↔`holding` · five-slug rollup |
| `ADR-HRM-RBAC-SCOPE-LADDER.md` §4 | slug vs holding vs `company_uuid` |
| TECHSPEC §19 · `hrm-operating-unit-registry` · `HRM_COMPANY_UUID_BY_SLUG` | Interim bridge + B′ ladder |
| `org-seed-member-companies.json` | LE `code` SoT (XEVN-HOLDING, XE_TMDV, VISUN, …) |
| `HRM_XBOS_PRODUCT_INTEGRITY_PROGRAM.md` G-INT-03 | Plane A OPEN → CLOSED design |

---

## 1. SoT clarification — 4 LE UUID vs 5 OU slugs

### 1.1 Fact (not a bug)

| Plane | Count | Identity |
|-------|-------|----------|
| **A — Legal / ĐVTV** | **4 member LE** + **1 holding presentation** (synthetic `xbos-group-holding-root` and/or `companyId=holding` under tenant `xevn`) | `xbos_legal_entity.id` UUID for members; holding often not a “5th member LE” |
| **B — Operating OU** | **Exactly 5** TEXT slugs | `holding`, `trsport`, `logistics`, `finance`, `services` |
| **B′ — Pilot UUID** | **Exactly 5** map UUIDs | `HRM_COMPANY_UUID_BY_SLUG` `…0001`…`…0005` — **≠** any Plane A LE UUID |

**Gap vs interim map:** TECHSPEC/BA called the bridge “interim name-order.” Live UAT already binds by ĐVTV **names** in registry order (Visun→`logistics`, …). Risk = **ordinal/name drift**, not missing 5th LE.

### 1.2 Locked bridge (code-keyed)

| `code` | Display (VI) | slug (B) | B′ UUID |
|--------|--------------|----------|---------|
| `XEVN-HOLDING` (+ synthetic root) | Tập đoàn XeVN | `holding` | `…0001` |
| `XE_TMDV` | Công ty Cổ phần Thương mại và Dịch vụ X.E | `trsport` | `…0002` |
| `VISUN` | Công ty TNHH Du lịch Visun | `logistics` | `…0003` |
| `XE_DU_LICH` | Công ty TNHH Du lịch X.E Việt Nam | `finance` | `…0004` |
| `XE_VIETNAM` | Công ty TNHH X.E Việt Nam | `services` | `…0005` |

Array order from `group-member-units` is **non-normative**.

---

## 2. Options A / B / C + recommendation

| Option | Summary | Verdict |
|--------|---------|---------|
| **A — Keep map** | Lock 4 member LE + synthetic/holding ↔ 5 slugs; resolve by **LE `code`**; B′ stays separate | **RECOMMENDED / Accepted** |
| **B — Expand LE** | Create/align 5 real LE UUID 1:1 with slugs | Reject unless sponsor org redesign |
| **C — Deprecate B′** | Migrate OP/MD/mobile UUID → TEXT slug | Reject for this WI — deferred P2; orthogonal to cardinality |

**Rationale:** Matches UAT + CO-HC GWC; avoids org/shareholder blast; OP/MD already `HRM-PLANE-409` on LE UUID. Full trade-offs: ADR §3.

---

## 3. Design delta delivered

| Path | Change |
|------|--------|
| `docs/architecture/ADR-HRM-XBOS-PLANE-A-BRIDGE-4LE-5SLUG-20260727.md` | **ADD** Accepted ADR Option A |
| `docs/hrm/TECHSPEC.md` §19.1 | **ADD** code column; supersede “interim name-order”; cite ADR |
| `docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md` §6.2 #3 / §6.3 | Mark SA WI DONE; optional P2 BE |
| `docs/program/HRM_XBOS_PRODUCT_INTEGRITY_PROGRAM.md` G-INT-03 Plane A | CLOSED design |

**No** full API_DESIGN rewrite · **no** `apps/**` · **no** seed.

---

## 4. Backlog BE

| work_item_id | Priority | Dispatch now? |
|--------------|----------|---------------|
| `D-HRM-BRIDGE-LE-CODE-MAP-01` | P2 optional | **No** — only before PROD if resolve still name/index-based |
| Expand LE / deprecate B′ | — | **No** from this WI |

---

## 5. Exit criteria checklist

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Clarify SoT 4 LE ↔ 5 slug vs interim | **PASS** §1 |
| 2 | Recommend A/B/C with trade-offs | **PASS** §2 + ADR §3 |
| 3 | Design delta ADR / TECHSPEC note | **PASS** §3 |
| 4 | Backlog BE only if recommended | **PASS** — P2 optional only |
| 5 | This evidence → PASS_TO_PM | **PASS** |

**Cấm kept:** no apps · no seed · no Phase1 · no reopen OP/MD/CO-HC GWC.

---

## completion_report

**Closed:** G-INT-03 Plane A design residual — Option A Accepted; code-keyed 4+holding↔5 bridge SoT; ADR + TECHSPEC §19.1 + DATA_LINKAGE §6 + integrity program updated; interim name-order superseded; B′ explicitly ≠ Plane A; no product code; CO-HC/OP/MD not reopened.

**Residual:** Optional P2 `D-HRM-BRIDGE-LE-CODE-MAP-01` (PROD harden); Option B/C only on sponsor; remaining DATA_LINKAGE §6 P1: `QA-HRM-MOB-UUID-PLANE-01`, `SA-XBOS-INF-SCOPE-KEY-PLANE-01`; G-INT-02 charts P2.

### next_owner

`pm` → Task **`qa`** `QA-HRM-MOB-UUID-PLANE-01` (next open P1 in §6.2) · parallel-ok **`sa`** `SA-XBOS-INF-SCOPE-KEY-PLANE-01`

### next_dispatch_prompt

```text
work_item_id: QA-HRM-MOB-UUID-PLANE-01
role: qa
lane: execution
change_mode: ADD
entry_criteria: SA-G-INT-03-PLANE-A-BRIDGE-01 PASS_TO_PM — Plane A LE ≠ B′ map locked in docs/architecture/ADR-HRM-XBOS-PLANE-A-BRIDGE-4LE-5SLUG-20260727.md; read DATA_LINKAGE §6.2#4 + ADR-HRM-RBAC-SCOPE-LADDER §4 company_uuid.
read_first:
  - docs/qa/evidence/sa-g-int-03-plane-a-bridge-01-20260727.md
  - docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md §6
  - docs/architecture/ADR-HRM-XBOS-PLANE-A-BRIDGE-4LE-5SLUG-20260727.md §4.3
must_keep: CO-HC / OP / MD GWC; U65 zero-seed; do not treat LE UUID as attendance company_uuid
forbidden_paths: apps/** product patches for test; seed inbox/attendance; reopen CO-HC
exit_criteria:
  1) Mobile/attendance path: body company_uuid = JWT claim B′ map UUID (∈ HRM_COMPANY_UUID_BY_SLUG)
  2) Body = representative Plane A LE UUID (e.g. 78b8a663-…) → 409 HRM-PLANE-409 or documented SCOPE mismatch — not 2xx silent
  3) Evidence docs/qa/evidence/qa-hrm-mob-uuid-plane-01-20260727.md → PASS_TO_PM or FAIL_TO_PM with owner
  4) Browser/device per U65; no seed
parallel_ok: SA-XBOS-INF-SCOPE-KEY-PLANE-01 (sa) — normative appliesToCompanyIds plane
```

### evidence_path

`docs/qa/evidence/sa-g-int-03-plane-a-bridge-01-20260727.md`

### ack_status

**PASS_TO_PM**
