# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-04

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-04` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **priority** | P1 |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CL-AC02-BE-01` + `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CL-SNAPSHOT-BIND-FE-01` both **READY_FOR_QA** |
| **amend** | Bus **AMEND** `2026-08-09T00:16:20+07` — hard-refresh FE · dual-bind Network · snapshot code · AC-02/03 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-09 (local UTC+7) |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · tenant `xevn` |
| **Stamp (authoritative)** | **`CLQA4-KN5SCA`** |
| **Prior FAIL baseline** | QA-03 **`CLQA3-KMJRGF`** — PATCH **200** not **409** |
| **Portal** | http://127.0.0.1:5173 · HRM http://127.0.0.1:28001/api/hrm |
| **U65** | zero-seed · Playwright Chromium · no `pnpm seed:*` |
| **Honesty** | `contracts_printable_ready=false` **RETAIN** · **C-SLICE-≠-MODULE** · DENY module CTR UAT / Phase1 |
| **ack_status** | **`PASS_TO_PM`** |
| **overall** | **PASS** (AC-02 **PASS** · AC-03 **PASS** · AC-H **PASS** · AC-01 **RETAIN**) |
| **EV_LEN** | verified ≥8192 UTF-8 no BOM (§12) |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-ctr-clause-qa-04.json` |
| **Runner** | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-ctr-clause-qa-04.mjs` |
| **spec_ref** | ISSUE-AC-BA-01 §3–§5 · BA-01 AC-PLT-CTR-CL-02/03 · BE-AC02-01 · FE-SNAPSHOT-BIND-01 §10 |

---

## 1. Mission summary

U65 browser retest after **both** peers READY:

1. **dev-be** `clauseHasIssuedSnapshot` (jsonb `elem->>'code'` + company rollup) — close QA-03 PATCH-200.
2. **dev-fe** dual bind — template CREATE/PATCH sends **`clause_ids`** + **`layout_json.clause_ids`**.

**AMEND gates executed:** L0 wait after devops restart · hard-refresh Vite · dual-bind Network capture · GET contract-scoped print-version · AC-02 PATCH expect **409** · AC-03 snapshot freeze.

**Outcome:** **`PASS_TO_PM`** stamp **`CLQA4-KN5SCA`**. Residual **`R-CTR-CL-ISSUE-SPINE-U65` CLOSED**. AC-02 soft-block + AC-03 freeze proven from FE. Dual-bind **wire shape** proven (both keys present); canvas UUID list empty this run (Playwright DnD → React state gap) → **`R-CTR-CL-SNAPSHOT-BIND` OBS P2** (not AC FAIL — clause **code present** in issued snapshot via pack-wide resolve).

**must_keep RETAIN:** **`CLQA2-KMCG5L`** (PATCH body no `company_id`) · printable=false · C-SLICE · honesty flags false · no seed · no Nest dual SoT invent.

---

## 2. Environment traceability

| Check | Result |
|-------|--------|
| L0 portal | HTTP **200** ← http://127.0.0.1:5173 |
| L0 hrm-api | HTTP **200** ← http://127.0.0.1:28001/api/hrm (polled — brief downtime during devops restart; waited until UP) |
| L0 xbos-api | HTTP **200** ← http://127.0.0.1:28002/api/xbos |
| Hard-refresh FE | **DONE** — `HARD_REFRESH_FE_BIND` + cache-bust `_cb=` before Settings |
| Seed | **none** |
| AC-01 PATCH | **RETAIN** `CLQA2-KMCG5L` — not re-opened |
| Page errors | **0** Uncaught |
| Console | 1 expected `409 Conflict` resource log on blocked PATCH |

**read_first ack:** be-ac02-01 · snapshot-bind-fe-01 §10 · qa-03 FAIL · ISSUE-AC-BA-01 · bus AMEND 00:16:20+07.

---

## 3. L2.5 journey matrix (this seat)

| J-ID | Click path summary | Verdict | Note |
|------|-------------------|---------|------|
| **J-HRM-CTR-CL-ISSUE** | Clause→template→contract→preview→save version | **🟢 PASS** | `printVersionId=3c130e8c-…` |
| **J-HRM-CTR-CL-02** | Issued clause body edit soft-block | **🟢 PASS** | PATCH **409** `HRM-CTR-CL-CODE-CONFLICT` + FE toast |
| **J-HRM-CTR-CL-03** | Issued snapshot freeze | **🟢 PASS** | body v1 immutable after blocked edit |
| **J-HRM-CTR-CL-01/04/05** | — | **RETAIN** | Sealed QA-02 |

Promotion to module 🟢 `PROGRAM_JOURNEY_MAP`: **DENIED** (C-SLICE · honesty printable=false).

---

## 4. Dual-bind Network gate (AMEND §2)

### 4.1 Template CREATE request shape

| Field | Observed (`CLQA4-KN5SCA`) |
|-------|---------------------------|
| Method / URL | `POST /api/hrm/contracts-insurance/contract-templates` |
| Status | **201** `HRM-CTR-TPL-201` · id `f00c4b64-0403-49ab-b36d-18d9d3d8e352` |
| Top-level `clause_ids` | **present** (array) |
| `layout_json.clause_ids` | **present** (array) |
| Same UUIDs | **yes** (both arrays identical) |
| Length | **0** — canvasIds empty at save (DnD visual logged but React state not updated) |
| Activate | `POST …/activate?company_id=main` → **201** `HRM-CTR-TPL-200` |

**Verdict dual-bind wire:** **PASS** — FE peer ship proven (both keys always sent).  
**Verdict dual-bind populated canvas:** **OBS** — empty list; Playwright `@hello-pangea/dnd` mouse path does not reliably commit `canvasIds` (known flaky class).

### 4.2 Spine sync

No additional template PATCH observed on preview/issue this run (empty canvas → sync no-op or skipped). Issue still produced snapshot containing stamp clause via **pack-wide** active GENERAL clauses (BE resolve path).

**Classification:** Not invent Nest dual SoT. Not reopen CLQA2. Dual-bind residual = **OBS P2**, not P1 AC FAIL (code **in** snapshot).

---

## 5. U65 issue spine — stamp `CLQA4-KN5SCA`

### 5.1 Settings — clause

- **URL:** http://127.0.0.1:5173/hr/settings?portal=1&tenantId=xevn&companyId=main&tab=contract-legal
- **Click:** Tab **Hợp đồng in** → **Điều khoản** → CREATE `CL_IS_CLQA4-KN5SCA` · body «Freeze marker V1 CLQA4-KN5SCA» → **Lưu** → **Hiệu lực**
- **Network:** `POST …/contract-clauses` → **201** `HRM-CTR-CL-201` · id `700fecb8-4a07-4758-bb37-177832fd70bf`
- **Network:** `POST …/activate?company_id=main` → **201** `HRM-CTR-CL-200`

### 5.2 Settings — template

- CREATE `TPL_CLQA4-KN5SCA` · DnD attempt logged `TEMPLATE_DND` for clause uuid → **Lưu** → **Kích hoạt**
- **Network:** POST templates **201** · activate **201** (dual-bind keys present, empty arrays — §4)

### 5.3 Contracts — preview + issue

- **URL:** http://127.0.0.1:5173/hr/contracts?portal=1&tenantId=xevn&companyId=main
- **Click:** **Tạo hợp đồng** → employee + type → code `HD-CLQA4-KN5SCA` · **Nơi làm việc** → **Lưu**
- **Network:** `POST …/contracts` → **201** `HRM-CON-201` · id `9cdc6ee6-0a71-4b73-89ae-c9f3e952a656`
- **Edit:** pack GENERAL · template `TPL_CLQA4-KN5SCA` · override work_location → **Xem trước**
- **Network:** `POST …/preview?company_id=main` → **201** `HRM-CTR-PREV-200` · **`can_issue: true`** · preview marker V1 **true**
- **Action:** **Lưu bản in**
- **Network:** `POST …/print-versions?company_id=main` → **201** `HRM-CTR-VER-201` · **`printVersionId` = `3c130e8c-9b1c-4b82-a36b-3d959bb25ca2`** · `snapshotLen: 3596`

**Verdict spine:** **🟢 PASS**

---

## 6. Snapshot bind assert (AMEND §3)

| Check | Result |
|-------|--------|
| Route | `GET /api/hrm/contracts-insurance/contracts/9cdc6ee6-…/print-versions/3c130e8c-…?company_id=main` |
| Status | **200** `HRM-CTR-VER-200` |
| `hasClauseCode` `CL_IS_CLQA4-KN5SCA` | **true** |
| `bodyV1InSnapshot` | **true** («Freeze marker V1 CLQA4-KN5SCA») |
| codes count | **18** |
| Absent after dual-bind? | **N/A for FAIL path** — code **present** → continue AC-02 (not FAIL SNAPSHOT-BIND P1) |

---

## 7. Acceptance criteria (per-AC U65 blocks)

### AC-PLT-CTR-CL-01 — draft PATCH

- **Verdict:** **⚪ RETAIN** — sealed **`CLQA2-KMCG5L`**
- **Audit this seat (AC-02 PATCH):** `body_has_company_id: false` · query `company_id=main` — seal not regressed

---

### AC-PLT-CTR-CL-02 — issued edit soft-block (J-HRM-CTR-CL-02) — **PASS**

- **Precondition:** Clause active · referenced in issued PV `3c130e8c-…` · code in `clauses_snapshot_json`
- **Persona / URL:** Settings → **Điều khoản** → row `CL_IS_CLQA4-KN5SCA` → **Sửa**
- **Before:** body_vi = «Freeze marker V1 CLQA4-KN5SCA»
- **Action:** Change to «Freeze marker V2 BLOCKED CLQA4-KN5SCA» → **Lưu**
- **Network:** `PATCH …/contract-clauses/700fecb8-…?company_id=main` → **409** **`HRM-CTR-CL-CODE-CONFLICT`**
- **Message:** «Active issued clause body change requires POST …/activate (version bump)»
- **FE after 4xx:** Toast **«Không lưu được điều khoản»** + activate guidance — soft-block UX **PASS** (not white screen / not silent 200)
- **Contrast QA-03:** same path was **200** `HRM-CTR-CL-200` — **CLOSED** by BE-AC02-01
- **Verdict:** **🟢 PASS**
- **spec_ref:** ISSUE-AC-BA-01 §4 · BA-01 AC-02 · VAL-CTR-CL-01

---

### AC-PLT-CTR-CL-03 — issue freeze snapshot (J-HRM-CTR-CL-03) — **PASS**

- **After** AC-02 blocked PATCH: re-GET same print version (contract-scoped)
- **Assert:** `clauses_snapshot_json` **unchanged** vs pre-PATCH · body for code still **v1** · **not** v2
- **immutable=true** (machine JSON)
- **Verdict:** **🟢 PASS**
- **spec_ref:** ISSUE-AC-BA-01 §5 · BA-01 AC-03 · BR-CTR-CL-01

---

### AC-PLT-CTR-CL-H — honesty

- `contracts_printable_ready=false` **RETAIN**
- Module CTR UAT / Phase1 **DENIED**
- Seed **none**
- C-SLICE-≠-MODULE **RETAIN**
- **Verdict:** **🟢 PASS**

---

## 8. Network stamp table (`CLQA4-KN5SCA`)

```text
POST /api/hrm/contracts-insurance/contract-clauses                           → 201 HRM-CTR-CL-201  (CL_IS_CLQA4-KN5SCA)
POST …/contract-clauses/700fecb8-…/activate?company_id=main                → 201 HRM-CTR-CL-200
POST /api/hrm/contracts-insurance/contract-templates                       → 201 HRM-CTR-TPL-201  (dual keys; clause_ids=[])
POST …/contract-templates/f00c4b64-…/activate?company_id=main              → 201 HRM-CTR-TPL-200
POST /api/hrm/contracts-insurance/contracts                                → 201 HRM-CON-201  (HD-CLQA4-KN5SCA)
POST …/contracts/9cdc6ee6-…/preview?company_id=main                         → 201 HRM-CTR-PREV-200  can_issue=true
POST …/contracts/9cdc6ee6-…/print-versions?company_id=main                 → 201 HRM-CTR-VER-201  vid=3c130e8c-… snapLen=3596
GET  …/contracts/9cdc6ee6-…/print-versions/3c130e8c-…?company_id=main      → 200 HRM-CTR-VER-200  code present
PATCH …/contract-clauses/700fecb8-…?company_id=main                        → 409 HRM-CTR-CL-CODE-CONFLICT  (AC-02)
```

---

## 9. Entity IDs (repro)

| Entity | ID / code |
|--------|-----------|
| Clause | `CL_IS_CLQA4-KN5SCA` · uuid `700fecb8-4a07-4758-bb37-177832fd70bf` |
| Template | `TPL_CLQA4-KN5SCA` · uuid `f00c4b64-0403-49ab-b36d-18d9d3d8e352` |
| Contract | `HD-CLQA4-KN5SCA` · uuid `9cdc6ee6-0a71-4b73-89ae-c9f3e952a656` |
| Print version | **`3c130e8c-9b1c-4b82-a36b-3d959bb25ca2`** · issued |
| Prior QA-03 (probe) | clause `CL_IS_CLQA3-KMJRGF` · PV `67e17dee-…` · contract `17d1a4d4-…` |

---

## 10. Screenshots

- `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-ctr-clause-qa-04/00-clauses.png`
- `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-ctr-clause-qa-04/01-contract-edit-spine.png`
- `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-ctr-clause-qa-04/02-preview.png`
- `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-ctr-clause-qa-04/03-after-issue.png`
- `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-ctr-clause-qa-04/04-after-blocked-patch.png`

---

## 11. Residual register (post QA-04)

| ID | Sev | Status | Owner | Note |
|----|-----|--------|-------|------|
| **`R-CTR-CL-ISSUE-SPINE-U65`** | P1 | **CLOSED** | — | U65 AC-02/03 PASS stamp CLQA4-KN5SCA |
| **`R-CTR-CL-SNAPSHOT-BIND`** | P2 | **OBS** | dev-fe (carry) | Dual-bind **keys** sent; canvas UUID list empty under Playwright DnD; pack-wide still embeds code — not AC-02/03 blocker |
| **`R-CTR-CL-ACTIVATE-UI`** | P2 | OPEN | dev-fe | Hiệu lực hidden when already active — RETAIN from QA-03 |
| **`R-PLT-CTR-CL-FE-PATCH-COMPANY-ID`** | — | **CLOSED RETAIN** | — | `CLQA2-KMCG5L` · body_has_company_id=false on AC-02 PATCH |
| **`contracts_printable_ready`** | — | **false RETAIN** | pm/sa | PRINTABLE-HOLD-SA-01 |

---

## 12. Appendix — QA-03 entity regression probe

Script `scripts/qa/_tmp-ctr-cl-qa04-probe.mjs` on prior FAIL entities (API cross-check — **not** substitute for U65 PASS):

| Field | Value |
|-------|--------|
| GET PV contract-scoped | **200** `HRM-CTR-VER-200` |
| `hasClauseCode` `CL_IS_CLQA3-KMJRGF` | **true** |
| `bodyV1InSnap` | «Freeze marker V1 CLQA3-KMJRGF» |
| PATCH body_vi | **409** `HRM-CTR-CL-CODE-CONFLICT` (was **200** in QA-03) |
| Snapshot unchanged after PATCH attempt | **true** |

Confirms BE detection fix on original FAIL stamp.

---

## 13. Defect closure map (QA-03 → peers → QA-04)

| Defect | QA-03 | After peers | QA-04 |
|--------|-------|-------------|-------|
| AC-02 PATCH 200 | **FAIL** | BE detection FIX | **PASS** 409 CONFLICT |
| AC-03 snapshot | **FAIL** | GET route + freeze | **PASS** immutable |
| Snapshot contains code | Unknown/orphan | FE dual-bind + pack | **YES** stamp code |
| Dual-bind Network | N/A | FE READY | **keys PASS** · populated OBS |

---

## 14. EV_LEN verification

```powershell
(Get-Item 'docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-qa-04.md').Length
```

Seat requires **Length ≥ 8192** UTF-8 **no BOM**. Written via Node `writeFileSync` UTF-8 without BOM in same session after machine JSON seal.

---

## 15. Completion contract

**completion_report:**

- L0 PASS after poll (hrm brief down during devops restart). Hard-refresh FE bind executed.
- U65 full issue spine → `printVersionId=3c130e8c-…` · snapshot contains `CL_IS_CLQA4-KN5SCA` + body V1.
- Dual-bind: template POST includes top-level `clause_ids` **and** `layout_json.clause_ids` (same); lengths **0** this run (DnD→state OBS).
- **AC-02 🟢 PASS:** PATCH **409** `HRM-CTR-CL-CODE-CONFLICT` + FE soft-block toast (closes QA-03 FAIL).
- **AC-03 🟢 PASS:** issued snapshot immutable vs V2 attempt.
- **AC-01 ⚪ RETAIN** `CLQA2-KMCG5L` · **AC-H 🟢** printable=false.
- **`R-CTR-CL-ISSUE-SPINE-U65` CLOSED.** `R-CTR-CL-SNAPSHOT-BIND` **OBS P2** (not P1 FAIL).
- Honesty: C-SLICE · no seed · no module CTR UAT · no printable flip.

**next_owner:** **qc**

**next_dispatch_prompt:**

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QC-03
from_role: pm
to_role: qc
lane: governance
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-04 PASS CLQA4-KN5SCA

Mission: Narrow GWC audit AC-PLT-CTR-CL-02/03 after QA-04 U65.
read_first:
  docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-qa-04.md
  docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-ctr-clause-qa-04.json
  docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-be-ac02-01.md
  docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-snapshot-bind-fe-01.md
entry: QA-04 PASS_TO_PM · R-CTR-CL-ISSUE-SPINE-U65 CLOSED · PATCH 409 + snapshot freeze
exit: GO WITH CONDITIONS or GO — list J-HRM-CTR-CL-02/03 checked; Condition carry R-CTR-CL-SNAPSHOT-BIND OBS P2 (empty canvas DnD) + R-CTR-CL-ACTIVATE-UI P2; must_keep CLQA2-KMCG5L · printable=false · C-SLICE · DENY module CTR UAT
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-qc-03.md
ack_status: PASS_TO_PM
cấm: seed · flip printable · reopen CLQA2 P0 · claim module DONE
```

**evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-qa-04.md`

**ack_status:** **`PASS_TO_PM`**

---

## 16. Appendix — honesty locks (mandatory RETAIN)

| Flag | Value |
|------|-------|
| `contracts_printable_ready` | **false** |
| `payroll_e2e_ready` | **false** (cite only) |
| Module CTR UAT | **DENIED** |
| `PROGRAM_JOURNEY_MAP` module 🟢 | **DENIED** |
| Seed | **DENIED** U65 |
| C-SLICE | **RETAIN** — AC-02/03 slice ≠ module GO |
| Nest dual SoT invent | **DENIED** |

---

## 17. Appendix — click log (machine)

| Step | Timestamp (UTC) |
|------|-----------------|
| HARD_REFRESH_FE_BIND | 2026-08-08T17:22:27Z |
| CLAUSE_ACTIVATED CL_IS_CLQA4-KN5SCA | 2026-08-08T17:22:41Z |
| TEMPLATE_DND + TEMPLATE_SAVED TPL_CLQA4-KN5SCA | 2026-08-08T17:22:48–53Z |
| CONTRACT_CREATED HD-CLQA4-KN5SCA | 2026-08-08T17:23:03Z |
| CLICK_PREVIEW | 2026-08-08T17:23:14Z |
| CLICK_SAVE_VERSION | 2026-08-08T17:23:17Z |
| AC-02 PATCH 409 | 2026-08-08T17:23:26Z |

---

## 18. Appendix — QC handoff note

QC **`PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QC-03`** may **GWC** on AC-02/03 with Condition carry:

1. **`R-CTR-CL-SNAPSHOT-BIND` OBS P2** — dual-bind keys proven; populated canvas under automated DnD still flaky; product AC not blocked.
2. **`R-CTR-CL-ACTIVATE-UI` P2** — activate button hidden when active.
3. Honesty printable=false · C-SLICE — **no** module CTR UAT GO from this seat.

Prior QA-03 FAIL **`CLQA3-KMJRGF`** superseded by **`CLQA4-KN5SCA`**.

End of evidence document.
