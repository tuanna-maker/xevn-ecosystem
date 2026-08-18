# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BA-01 (ba-process AC pack)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BA-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-SA-01` CONFIRMED Option B RETAIN Nest `hrm_contract_templates` |
| **change_mode** | ADD · **no_code** true |
| **date** | 2026-08-08 |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **spec_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BA-01.md` |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-template-ba-01.md` |

---

## 1. HARD EXIT GATE — byte sizes

| File | Path | Size (bytes) | ≥3072 (3KB) |
|------|------|-------------:|:-----------:|
| Spec | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BA-01.md` | **19980** | **PASS** |
| Evidence | `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-template-ba-01.md` | **10514** | **PASS** |

Measurement (PowerShell, canonical NFD repo):

```powershell
(Get-Item 'docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BA-01.md').Length
(Get-Item 'docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-template-ba-01.md').Length
```

**Empty seat = INVALID** — both files must exist on disk with measured sizes ≥ 3072 bytes before CONFIRMED.

### 1.1 Shell-measured (same session) — HARD EXIT **PASS**

| File | Bytes | ≥3KB |
|------|------:|:----:|
| Spec `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BA-01.md` | **19980** | **PASS** |
| Evidence `po-hrm-dynamic-config-platform-ctr-template-ba-01.md` | **10514** | **PASS** |

Empty seat = INVALID — **DENIED** (both files on disk, both ≥3KB).

---

## 2. spec_read_ack

| Artifact | Sections read | Result |
|----------|---------------|--------|
| **SA-01 FULL** | Decision Option B LOCK · §1 AS-IS · §4.1 gates · §5 L-CTR-TPL-01..10 · §6 F.1 · §7 invent stamp · §8 OUT · §9 ba-data HOLD · §10 AC stubs | **CONFIRMED parent** |
| **SA evidence** | Option B RETAIN · KEY invent · ba-process UNLOCK · BE/FE HOLD until BA | Grounding |
| **BA platform** | §3.2 Template CRUD · AC-PLT-CTR-01/03/04/06 · BR-CTR-TPL-DYN · BR-PLT-02..05 | Map TPL↔platform |
| **Journey map** | J-HRM-CTR-04..07 DRAFT · UF-HRM-02 must_keep | UF/J-* enumeration |
| **Peer CTR-CLAUSE BA** | body_vi RETAIN · ba-data HOLD pattern | **cấm reopen** |
| **Code LIVE (grep)** | `createTemplate` · `bootstrapXevnMatrixDrafts` · constants TPL-404/NONE/CODE-INVALID · FE «Tạo mẫu #9+» · print spine open picker | GAP analysis |

**change_mode:** ADD AC wording only. **Forbidden:** `apps/**` · seed · flip printable · reopen clause/ATT · invent FE HOLDs · module CTR UAT · Phase1 · empty seat.

---

## 3. Deliverables authored (CONFIRMED)

| Item | Status |
|------|--------|
| **AC-PLT-CTR-TPL-01** admin CREATE 9th → 2xx · F5 · selectable | CONFIRMED · maps **AC-PLT-CTR-01** ≡ AC-CTR-XEVN-11 |
| **AC-PLT-CTR-TPL-02** starter soft warn ≠ block · catalog >8 | CONFIRMED · maps **AC-PLT-CTR-06** |
| **AC-PLT-CTR-TPL-03** issued print freeze RETAIN | CONFIRMED · maps **AC-PLT-CTR-04** |
| **AC-PLT-CTR-TPL-04** consumer invent → **`HRM-CTR-TPL-KEY`** when EFF>0 | CONFIRMED · BR-PLT-02 |
| **AC-PLT-CTR-TPL-05** soft-retire hide · history OK | CONFIRMED · BR-PLT-04 |
| **AC-PLT-CTR-TPL-06** UF-HRM-02 nullable template | CONFIRMED · must_keep |
| **AC-PLT-CTR-TPL-07** scope parity list↔id↔mutate | CONFIRMED · U19 |
| **AC-PLT-CTR-TPL-H** honesty · C-SLICE · U65 | CONFIRMED |
| **VAL-CTR-TPL-01..06** | CONFIRMED (CODE-INVALID format · PACK-MISMATCH · KEY · NONE · 404≠KEY · retire) |
| UF/J-* table | UF-CTR-TPL-* + **J-HRM-CTR-07** / **J-HRM-CTR-04** / **UF-HRM-02** |
| DnD | **DENY** seat — cite **AC-PLT-CTR-03** |
| DOCX GĐ2 · reopen clause · flip printable · seed · mega-EAV | **DENY** |

---

## 4. Decisions locked this seat

### 4.1 Invent KEY class
- **Canonical invent wire:** `HRM-CTR-TPL-KEY` when catalog active EFF>0 and consumer free-text / unknown code used as SoT.
- **Distinct from:** `HRM-CTR-TPL-404` (get-by-id miss) · `HRM-CTR-TPL-NONE` (empty catalog require-template).
- **LIVE gap:** preview/unknown currently emits `HRM-CTR-TPL-404` — **not** accepted as permanent invent taxonomy.
- **BA verdict:** narrow **BE CNS deepen optional** (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BE-01`) — ADD KEY constant + map invent; no schema; no Settings SoT.

### 4.2 ba-data
- **HOLD confirmed** — Nest table + freeze + lineage LIVE (RETAIN class = peer clause). No DATA-01.

### 4.3 BE / FE
- **FE HOLD** — Settings «Tạo mẫu #9+» + open picker LIVE; **FORBIDDEN** invent FE HOLDs / LVRULE 01g reopen.
- **BE HOLD schema**; **optional unlock** only for KEY wire CNS (§4.1).
- Admin CREATE / starter / freeze paths: **NO build GAP** proven vs LIVE.

### 4.4 Seals / honesty RETAIN
- CTR-CLAUSE `body_vi` Option B — **cấm reopen**
- ATT leave-balance CNS-WIRE CLOSED · FE LVRULE **01g HOLD** cite ≠ copy
- ATT SHIFT/CODE/WS · EMP · SI · PAY · DEC · MergeToken EXT — **RETAIN**
- `contracts_printable_ready=false` · `payroll_e2e_ready=false` · **C-SLICE-≠-MODULE** · U65

---

## 5. GAP summary (for PM)

| Area | Verdict | Next |
|------|---------|------|
| Admin CREATE N+1 / F5 / picker | LIVE · NO GAP | QA browser when opened |
| Starter ≠ ceiling soft warn | LIVE · verify-only | QA TPL-02 |
| Issued freeze | LIVE · NO GAP | QA TPL-03 |
| Invent KEY wire | **GAP narrow** | Optional BE-01 CNS |
| Physical schema | HOLD | No ba-data |
| DnD / clause body | OUT peer | Do not dispatch here |

---

## 6. Honesty & FORBIDDEN checklist

| Check | Status |
|-------|--------|
| No `apps/**` touched | PASS |
| No seed | PASS |
| No flip printable / payroll e2e | PASS |
| No reopen clause / ATT / invent FE HOLDs | PASS |
| No module CTR UAT / Phase1 claim | PASS |
| No mega-EAV / Settings sole SoT | PASS |
| DnD cited OUT AC-PLT-CTR-03 | PASS |
| Both files ≥3KB | **Shell-gated** |
| Empty seat | **DENIED** |

---

## 7. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Closed: AC pack **AC-PLT-CTR-TPL-01..07+H** + **VAL-CTR-TPL-01..06** CONFIRMED from SA Option B stubs; mapped to AC-PLT-CTR-01/06/04; invent KEY **`HRM-CTR-TPL-KEY`** locked (LIVE 404 = narrow BE residual); UF/J-* enumerated (J-HRM-CTR-07/04 · UF-HRM-02); ba-data HOLD; FE HOLD; BE schema HOLD / KEY CNS optional; DENY DnD·DOCX·reopen clause·ATT·flip·seed·mega-EAV; honesty false · C-SLICE · no apps/**. Residual: optional BE KEY wire + QA U65 browser slice. |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | See §8 copy-ready |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-template-ba-01.md` |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 8. next_dispatch_prompt (copy-ready → PM)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BE-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1
change_mode: ADD
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BA-01 CONFIRMED
entry_criteria:
  - Read docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BA-01.md §4.3 · §8.1
  - Read SA Option B RETAIN docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-SA-01.md
  - LIVE: createTemplate / freeze / open catalog RETAIN — cấm schema invent
task:
  - ADD wire constant HRM-CTR-TPL-KEY
  - When catalog active EFF>0: consumer invent / unknown template_code as SoT → HRM-CTR-TPL-KEY (not permanent alias of 404)
  - KEEP HRM-CTR-TPL-404 for get-by-id miss; KEEP HRM-CTR-TPL-NONE for empty require-template
  - Jest: invent → KEY; get-by-id miss → 404; CODE-INVALID still format-only (≠ not-in-8)
forbidden:
  - apps/web/** FE HOLDs · ba-data physicalize · Settings sole SoT · reopen clause body_vi · reopen ATT/LVRULE 01g
  - DnD AC-PLT-CTR-03 fold · DOCX GĐ2 · flip contracts_printable_ready · seed · mega-EAV · module CTR UAT
exit_criteria:
  - READY_FOR_QA · evidence docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-template-be-01.md
  - honesty flags stay false · C-SLICE
```

**Alternate (if PM defers BE):** dispatch **QA** browser slice on TPL-01/02/03/05/06/07 only; mark TPL-04/VAL-03 🟡 residual until BE-01.

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-QA-01
from_role: pm
to_role: qa
lane: execution
change_mode: verify
entry_criteria: U65 zero-seed · L0 stack · read BA-01 §4 · §6 UF/J-*
task:
  - UF-CTR-TPL-CREATE-9 / J-HRM-CTR-07: Tạo mẫu #9+ → POST 2xx → F5 → picker
  - TPL-02 soft warn ≠ block
  - TPL-03 issue freeze
  - TPL-05 retire · TPL-06 UF-HRM-02 nullable · TPL-07 scope
  - TPL-04: if KEY not shipped → 🟡 residual (do not fake PASS)
forbidden: seed · flip printable · reopen clause/ATT · claim module UAT
exit: PASS_TO_PM · evidence with URL+click+Network+F5 per AC
```

**ba-data remains HOLD.** PM may also seal seat and continue U88 governance to next vertical without opening BE/QA immediately.

---

## 9. Process diagram (logic)

```text
Admin Settings ──CREATE N+1 (mã 9+)──► hrm_contract_templates (Nest SoT · RETAIN)
                      │
         starter 8 bootstrap (optional ≠ ceiling · soft warn)
                      │
Consumer picker (EFF>0) ──bind──► template_code
     invent free-text ──► HRM-CTR-TPL-KEY (FAIL)   [LIVE today may 404 → BE residual]
                      │
Issue ──freeze──► print_versions.template_code + layout/clause snapshot
Later template edit ──► does NOT mutate issued (AC-PLT-CTR-TPL-03 ≡ AC-04)
UF-HRM-02 without template ──► still OK (TPL-06)
DnD clause_ids ──► peer AC-PLT-CTR-03 (OUT)
Clause body_vi ──► peer CTR-CLAUSE RETAIN (OUT reopen)
```

---

## 10. Residual for PM (zero-idle hint)

| Residual | Owner | Priority |
|----------|-------|----------|
| KEY wire CNS | dev-be (optional BE-01) | P1 taxonomy honesty |
| Browser U65 TPL-01..03/05..07 | qa (optional QA-01) | P1 when pilot click needed |
| ba-data | HOLD | — |
| Next U88 vertical | pm / sa / ba | After seal — **không** claim module CTR DONE |

---

*End evidence — ba-process PASS_TO_PM · CONFIRMED · Option B RETAIN open catalog AC pack.*
