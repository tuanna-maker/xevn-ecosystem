# Evidence — `PO-HRM-CONTRACT-LEGAL-PRINT-QC-Q-CTR-01`

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-QC-Q-CTR-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | L3 narrow re-gate — **CONDITION Q-CTR-01 group library publish/pull/apply only** (`C-SLICE-≠-MODULE`) |
| **priority** | Close Q-CTR-01 · retain honesty · deny printable module UAT |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` |
| **Verdict** | **GO WITH CONDITIONS** — Q-CTR-01 **CLOSED**; print-spine + PDF binary must_keep retained; module UAT **DENIED** |
| **ack_status** | `PASS_TO_PM` |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-QA-05` `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-contract-legal-print-qa-05.md`](po-hrm-contract-legal-print-qa-05.md) |
| **machine** | [`_tmp-po-hrm-contract-legal-print-qa-05.FINAL.json`](_tmp-po-hrm-contract-legal-print-qa-05.FINAL.json) · stamp **`CTR5-IBM3SF`** |
| **parent_gwc** | [`po-hrm-contract-legal-print-qc-01.md`](po-hrm-contract-legal-print-qc-01.md) · [`po-hrm-contract-legal-print-qc-02.md`](po-hrm-contract-legal-print-qc-02.md) |
| **screens** | `docs/qa/evidence/screens/po-hrm-contract-legal-print-qa-05/` (00–10 · **11/11** on disk) |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — closing group publish ≠ contracts printable module UAT |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **contracts_printable_ready** | **false** | **DENIED** — cấm claim printable module GO / UAT |
| **Module printable UAT** | **DENIED** | Invent GO full contracts **FORBIDDEN** |
| **product_go / production GO** | **DENIED** | Out of scope |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Machine `denied[]` includes `seed` · `api_only_pass` · `invent_printable_uat` · `synced_catalogs` |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT close of parent CONDITION **Q-CTR-01** (group template / clause library publish → member pull → apply + origin badge + query-only `company_id`) under U65 stamp **`CTR5-IBM3SF`**.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Holding Phát hành → POST 201 + row v3 | POST `…/publishes?company_id=main` → **201** `HRM-CTR-PUB-201` · `publish_version=3` · label `QA-05 FE phát hành CTR5-IBM3SF` · PNG 01 toast «Đã phát hành phiên bản 3» · PNG 02 F5 row | 🟢 **ACCEPT** |
| Member Kéo gói → Áp dụng | OU `trsport` · pull **201** `HRM-CTR-PULL-200` upserted=6 · apply **201** `HRM-CTR-APPLY-200` · PNG 05 toast «Đã áp dụng v3» | 🟢 **ACCEPT** |
| Origin badge Tập đoàn · vN | Machine `originOk=true` · CL×4 + TPL×2 · sample `Tập đoàn · v3` · AC-ORIGIN-BADGE **PASS** | 🟢 **ACCEPT** |
| `company_id` query-only | 3 library mutates: `qsHasCompanyId=true` · `bodyHasCompanyId=false` · keys ⊆ `{label_vi,publish_version}` | 🟢 **ACCEPT** |
| NOTHING-TO-APPLY neg | finance apply → **400** `HRM-CTR-PUB-NOTHING-TO-APPLY` · PNG 07 | 🟢 **ACCEPT** |
| CODE-CONFLICT | Not reproducible without invent collide (U65) | 🟡 **OBS** — exit allowed |
| Settings OU chip discoverability | `/settings` hides OU chip; member path uses `sessionStorage['hrm:operating-unit-filter']` | 🟡 **OBS soft** — **not** NO-GO / not reopen P0 |
| must_keep UF-HRM-02 + print-spine | Create **201** `HD-BN37L` · spine chrome PNG 10 · honesty false visible | 🟢 **ACCEPT** re-smoke |
| Process gate | dndStorm=0 · uncaught=0 · mojibake=false · console 400 = expected neg apply | 🟢 **ACCEPT** |
| Honesty false | Settings + spine PNGs + machine | 🟢 **RETAIN** |

**Cấm:** `contracts_printable_ready=true` · printable module UAT · invent GO full contracts · Phase 1 DONE · seed · XBOS `synced_catalogs` as legal-body SoT.

**Scope note:** This seal **only** closes Q-CTR-01 group publish/pull/apply. Parent QC-01 print-spine GWC + QC-02 PDF binary **CLOSED** remain binding must_keep. **NOT** Phase 1 DONE. **NOT** contracts printable module UAT-ready.

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QC-01 GWC print-spine | `po-hrm-contract-legal-print-qc-01.md` | PASS_TO_PM · CONDITION Q-CTR-01 OPEN | **ACCEPT** baseline |
| QC-02 Q-CTR-02 CLOSED | `po-hrm-contract-legal-print-qc-02.md` | PASS_TO_PM · Q-CTR-01 still OPEN | **ACCEPT** — PDF binary must_keep |
| QA-05 browser publish/pull/apply | `po-hrm-contract-legal-print-qa-05.md` | PASS_TO_PM | **ACCEPT** U65 + stamp `CTR5-IBM3SF` |
| Machine FINAL | `_tmp-po-hrm-contract-legal-print-qa-05.FINAL.json` | overall **PASS** | **ACCEPT** |

### Machine JSON spot (stamp `CTR5-IBM3SF`)

| Signal | Value | QC |
|--------|-------|-----|
| `env.STAMP` | `CTR5-IBM3SF` | 🟢 |
| `l0` portal/hrm/xbos | 200 | 🟢 |
| `honesty.contracts_printable_ready` | **false** | 🟢 |
| `denied[]` | seed · api_only · invent_printable_uat · ready=true · synced_catalogs | 🟢 |
| `ac.AC-HOLDING-PUBLISH` | POST **201** `HRM-CTR-PUB-201` · v3 · bodyClean | 🟢 |
| `ac.AC-MEMBER-PULL-APPLY` | pull **201** · apply **201** · originOk | 🟢 |
| `ac.AC-ORIGIN-BADGE` | CL4 + TPL2 · `Tập đoàn · v3` | 🟢 |
| `ac.AC-COMPANY-ID-QUERY-ONLY` | n=3 allQueryOnly | 🟢 |
| `ac.AC-NEG-NOTHING-TO-APPLY` | finance · `HRM-CTR-PUB-NOTHING-TO-APPLY` | 🟢 |
| `ac.AC-NEG-CODE-CONFLICT` | **OBS** | 🟡 accepted |
| `uf.UF-HRM-02` / print-spine / process | PASS · PASS · dndStorm=0 | 🟢 |
| `overall` / `ack_status` | **PASS** / **PASS_TO_PM** | 🟢 slice |

### Screenshot visual spot

| File | QC observation |
|------|----------------|
| `01-after-publish.png` | Holding Settings · honesty **false** · toast **Đã phát hành phiên bản 3** · row v3 `CTR5-IBM3SF` · DnD tab chrome |
| `05-after-apply.png` | Member apply path · v3 selected · toast **Đã áp dụng v3** · honesty **false** |
| `06-origin-badges.png` | Member zone publish UI + pull/apply chrome after apply wave |
| `10-print-spine-chrome.png` | Edit **HD-BN37L** · work_location stamp · honesty **false** · `ctr-print-spine` chrome |
| Screens dir | **11/11** PNG present on disk (00–10) |

---

## Gate AC audit (Q-CTR-01 group publish)

| # | AC / Check | Spec / dispatch | QA-05 | QC |
|---|------------|-----------------|-------|-----|
| 1 | Holding publish freeze version | Q-CTR-01 / ADR Option A | 🟢 v3 201 | 🟢 **ACCEPT** → **CLOSED** |
| 2 | Member pull then apply (pull ≠ apply) | same | 🟢 201/201 | 🟢 **ACCEPT** → **CLOSED** |
| 3 | Origin badge Tập đoàn · vN | same | 🟢 | 🟢 **ACCEPT** → **CLOSED** |
| 4 | company_id query-only | FE–BE boundary | 🟢 | 🟢 **ACCEPT** → **CLOSED** |
| 5 | NOTHING-TO-APPLY | neg path | 🟢 | 🟢 **ACCEPT** |
| 6 | Honesty false + must_keep spine | mandatory | 🟢 | 🟢 **RETAIN** |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this seal | QC |
|---------|-------------------|-----|
| **J-HRM-03** | Host contracts list → create/edit modal · must_keep UF-HRM-02 + print-spine chrome on `HD-BN37L` | 🟢 **PASS** re-smoke (QA-05 UF-02 + PNG 08–10) · prior H12 / QC-01/02 retained |
| Settings library publish/pull/apply | Narrow Q-CTR-01 slice (Settings Điều khoản HĐ) | 🟢 **PASS** browser AC (not a separate J-* id) |
| Module contracts printable UAT | Out of scope | **DENIED** |

---

## Commands (gate / spot)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-contract-legal-print-qa-05.md` | **FAIL** 2/8 (`journey_l25` · `residual_section` heading form) | **PROCESS OBS** — not product demote; QC consolidates this file |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-contract-legal-print-qc-q-ctr-01.md` | **PASS** exit **0** (8/8) | PRODUCT gate OK |
| QA-05 cited `qc:dev-stack` + BE restart `start:prod` | L0 200 at capture · publishes probe 200 | ENV OK at capture |
| QA harness `node scripts/qa/_tmp-po-hrm-contract-legal-print-qa-05.mjs` | exit **0** · overall PASS · stamp CTR5-IBM3SF | PRODUCT OK |
| QC visual spot PNG 01/05/10 | publish toast · apply toast · spine honesty false | PRODUCT OK |

---

## Classification

| Item | Class | Disposition |
|------|-------|-------------|
| Q-CTR-01 holding publish → member pull/apply + origin + query-only | PRODUCT | **CLOSED** this re-gate |
| Settings OU chip discoverability | PRODUCT P3 UX | **OBS soft** — not NO-GO; product works via stored OU |
| CODE-CONFLICT toast | OBS | U65 no invent collide — non-blocking |
| Console 400 on finance apply | PROCESS OBS | Expected NOTHING-TO-APPLY path |
| QA pack verify 2/8 format | **PROCESS OBS** | QC file consolidates 8/8 |
| Print-spine GWC (QC-01) | must_keep | **RETAINED** |
| Q-CTR-02 PDF binary (QC-02) | must_keep | **RETAINED CLOSED** |
| Honesty / module UAT | GOVERNANCE | **DENIED** ready=true |

---

## Conditions (GWC — bounded)

1. **`Q-CTR-01` group-level template publish** — **CLOSED** (this QC). Holding Phát hành freeze + member pull/apply + origin badge + query-only `company_id` proven under stamp `CTR5-IBM3SF`.
2. **`Q-CTR-02` PDF binary engine** — remains **CLOSED** (QC-02 must_keep). Not reopened.
3. **Print-spine GWC (QC-01)** — remains **binding** must_keep (UF-HRM-02 · FE-01 DnD · FE-03 work_location · BE-02 PDF).
4. **Honesty** — `contracts_printable_ready=false`; **NOT** Phase 1 DONE; **NOT** printable module UAT-ready; **NOT** invent GO full contracts.
5. **Soft OBS (non-blocking):** Settings OU chip discoverability · CODE-CONFLICT invent path.

---

## Residual

| ID | Sev | Owner | Status |
|----|-----|-------|--------|
| `Q-CTR-01` group template publish | P2 was | — | **CLOSED** (QA-05 + this QC) |
| `Q-CTR-02` PDF binary | — | — | **CLOSED** (QC-02 retained) |
| Print-spine GWC | — | — | **RETAINED** (QC-01) |
| Settings OU chip discoverability | P3 UX OBS | fe / pm | **OPEN soft** — optional UX; not slice FAIL |
| CODE-CONFLICT toast | OBS | — | **OBS** (U65) |
| Printable module UAT | — | — | **DENIED** (`contracts_printable_ready=false`) |

**No P0/P1 open on Q-CTR-01 → GWC allowed for this residual close.**

---

## completion_report

QC L3 narrow re-gate **GO WITH CONDITIONS**: CONDITION **Q-CTR-01 CLOSED**. Audited QA-05 MD + FINAL JSON stamp `CTR5-IBM3SF` + PNG 00–10 (11/11 disk) + parent QC-01/QC-02. Proven: holding publish **201** v3 · member `trsport` pull **201** / apply **201** · origin **Tập đoàn · v3** · `company_id` query-only on 3 mutates · finance NOTHING-TO-APPLY · UF-HRM-02 `HD-BN37L` + print-spine must_keep · honesty **false**. Soft OBS only: Settings OU chip discoverability + CODE-CONFLICT. QA pack 2/8 = PROCESS OBS; this QC pack targeted 8/8. No seed · no apps/** · **DENIED** `contracts_printable_ready=true` / invent printable module UAT / Phase 1 DONE.

## next_owner

**pm** — bus INTAKE; keep honesty false; no further Q-CTR-01 reopen unless product defect claimed — **do not** claim contracts printable UAT.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-QC-Q-CTR-01-INTAKE
from_role: qc
to_role: pm
lane: governance
parent: PO-HRM-CONTRACT-LEGAL-PRINT-QC-Q-CTR-01 GO WITH CONDITIONS
evidence_path: docs/qa/evidence/po-hrm-contract-legal-print-qc-q-ctr-01.md
honesty: contracts_printable_ready=false — DENIED printable module GO / UAT

task:
1) Bus INTAKE: Q-CTR-01 group publish/pull/apply CLOSED (stamp CTR5-IBM3SF · v3 · trsport pull/apply · origin Tập đoàn · v3 · query-only company_id)
2) Honesty lock: contracts_printable_ready=false · cấm invent module printable UAT · NOT Phase 1 DONE
3) Retain CLOSED: Q-CTR-02 PDF binary (QC-02) · print-spine GWC (QC-01) · UF-HRM-02 / FE-01 DnD / FE-03 work_location / BE-02 PDF
4) Soft OBS only (non-blocking): Settings OU chip discoverability — do not reopen as P0
5) Continue pm:idle:check — do not idle claiming contracts printable ready

ack_status: PASS_TO_PM
```
