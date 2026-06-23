# P1-XBOS-W5 — L3 QC gate (HRM catalog · J-XBOS-08 · localhost)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-XBOS-W5-HRM-CAT` |
| **qc_work_item_id** | `P1-XBOS-W5-HRM-CAT-QC-01` |
| **journey_id** | **J-XBOS-08** — Danh mục NS: configure field → sync immediate → GET read-back → HRM embed |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **qa_evidence_path** | `docs/qa/evidence/p1-xbos-w5-hrm-cat-qa-retest-20260606.md` |
| **prior_chain** | `p1-xbos-w5-hrm-cat-audit-20260606.md` (FAIL) · `p1-xbos-w5-hrm-cat-be-fix-20260606.md` |
| **environment** | `http://localhost:5173` (authoritative SoT for this gate) |
| **account** | `ceo@xe.vn` / `Xevn@2026` (`company_id=main`) |
| **executed_at** | 2026-06-06 |
| **decision** | **GO WITH CONDITIONS** — **J-XBOS-08** promotable on localhost:5173 group CEO slice |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — W5 HRM catalog sync / read-back only)

| In scope | Out of scope |
|----------|--------------|
| **J-XBOS-08** L2.5 settings + API read-back (7 steps) | nip.io / VPS `:8088` deploy parity |
| `POST …/extension-items` immediate → `GET settings-catalogs` parity | Full HRM embed iframe field-level verify (MCP limitation) |
| Settings **Cấu hình chi tiết** modal shows synced field | J-XBOS-02 catalog governance approve seed (**D-W5-CAT-GOV-SEED-01**) |
| HRM embed `/command-center/hrm/employees` shell (no Sync ERROR / 409) | Full `phase1:gate --strict` |
| L0 `qc:dev-stack` + `qc:fe-be-health` + jest scope regression | Re-proving W1–W4/W6 journeys (prior gates stand) |
| **D-W5-HRM-CAT-SYNC-01** closure (scope_parity main→holding) | Corporate PROD-READY columns |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-xbos-w5-hrm-cat-qa-retest-20260606.md
```

| File | Result | Failed checks |
|------|--------|---------------|
| `p1-xbos-w5-hrm-cat-qa-retest-20260606.md` | Exit **0** — **8/8** | — |

**QC adjudication:** **PASS** — full pack integrity; no process GWC required for pack format on this wave.

---

## Chain audited

| Artifact | Role | Key signal |
|----------|------|------------|
| `p1-xbos-w5-hrm-cat-audit-20260606.md` | QA (audit) | **J-XBOS-08 FAIL** — POST **201** but GET `effectiveItems` missing field; scope_parity write `main` vs read `holding` |
| `p1-xbos-w5-hrm-cat-be-fix-20260606.md` | Dev-BE | `appendExtension` + `requestFieldRemoval` use `resolveHrmSettingsCatalogCompanyId`; jest **49/49** |
| `p1-xbos-w5-hrm-cat-qa-retest-20260606.md` | QA (retest) | **J-XBOS-08 PASS** — API read-back + browser modal + HRM embed shell; **D-W5-HRM-CAT-SYNC-01 CLOSED** |

**Authoritative retest:** QA § *J-XBOS-08 — Configure field → sync immediate → GET shows field* — POST **201** → GET/portal proxy field **true** → modal lists `QA W5 HRM Cat BE Fix 20260606` → embed route **PASS**.

---

## Classification

| Signal | Type | QC adjudication |
|--------|------|-----------------|
| POST immediate extension-items **201** → GET `effectiveItems` shows field | **PRODUCT** | **PASS** — **D-W5-HRM-CAT-SYNC-01 CLOSED** |
| Portal proxy `GET /api/hrm/settings-catalogs` read-back | **PRODUCT** | **PASS** — scope_parity write/read aligned (`main` JWT → `holding` partition) |
| Browser **Cấu hình chi tiết** modal lists synced field | **PRODUCT** | **PASS** — J-XBOS-08 consumer path |
| HRM embed `/command-center/hrm/employees` — no Sync ERROR / 409 | **PRODUCT** | **PASS** — shell slice; iframe field N/A (MCP) |
| `settings-catalogs.controller.spec.ts` + `hrm-list-scope.spec.ts` **49/49** | **PRODUCT / unit** | **PASS** — concurs QA + QC spot |
| Summary card **3 trường** vs modal live count (**D-W5-HRM-CAT-LIST-01**) | **UX / P2** | **GWC** — non-blocking; not scope_parity |
| Catalog governance dev seed **409** (**D-W5-CAT-GOV-SEED-01**) | **PRODUCT / seed** | **GWC** — out of W5 sync slice; blocks J-XBOS-02 approve only |
| `pnpm run qc:dev-stack` exit **0** | **ENV** | **PASS** — QC spot 2026-06-06 |
| localhost-only; nip.io / `:8088` not verified | **DEPLOY** | **GWC** — **C-W5QC-01** |
| Pack verify **8/8** | **PROCESS** | **PASS** |
| `PROGRAM_JOURNEY_MAP.md` J-XBOS-08 row FAIL | **PROCESS / U19** | **CLOSED** — QC ref synced 2026-06-06 |

---

## L0 — Dev stack health

| Check | QC spot (2026-06-06) | Result |
|-------|----------------------|--------|
| `pnpm run qc:dev-stack` | exit **0** | **PASS** |
| hrm-api `:28001` | HTTP **200** | **PASS** |
| xbos-api `:28002` | HTTP **200** | **PASS** |
| web-portal `:5173` | HTTP **200** | **PASS** |

**L0 verdict:** **PASS** (concurs QA environment traceability).

---

## L2.5 — Journey matrix (J-XBOS-08)

| Step | Click path | Verdict | Basis |
|------|------------|---------|-------|
| 1 | Session `ceo@xe.vn` | **PASS** | QA § Browser step 1 |
| 2 | Settings → **Danh mục hồ sơ nhân sự** (`?settings=company_group_hr`) | **PASS** | QA § Step 2 — scope Tập đoàn XeVN |
| 3 | **Cấu hình chi tiết** — modal `#group-hr-fields-config-title` | **PASS** | QA § Step 3 — live HRM catalog |
| 4 | Verify synced field in modal list | **PASS** | QA § Step 4 — `QA W5 HRM Cat BE Fix 20260606` |
| 5 | `POST …/extension-items` + `x-catalog-write-mode: immediate` | **PASS** | QA § API step 5 — **201** `HRM-SET-202` |
| 6 | `GET /api/hrm/settings-catalogs` + portal proxy read-back | **PASS** | QA § API step 6/6b — field in `effectiveItems` |
| 7 | HRM embed `/command-center/hrm/employees` — shell load | **PASS** | QA § Step 7 — no Sync ERROR / 409 |

**L2.5 verdict:** **PASS** — all seven **J-XBOS-08** steps on localhost. U19: settings-admin catalog-sync journey (not J-CC/J-HRM deep link); concurs W1–W4/W6 XBOS settings L2.5 classification. Step 7 iframe field-level deferred (tooling); API+modal read-back authoritative for sync closure.

---

## QC independent spot-check

| Command | QC run | Result |
|---------|--------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-xbos-w5-hrm-cat-qa-retest-20260606.md` | 2026-06-06 | **8/8 PASS** exit **0** |
| `pnpm run qc:dev-stack` | 2026-06-06 | exit **0** |
| `pnpm --filter hrm-api test -- settings-catalogs.controller.spec.ts hrm-list-scope.spec.ts` | 2026-06-06 | **49/49 PASS** exit **0** |

QC did **not** re-run full browser J-XBOS-08 click-path (authoritative QA retest artifact sufficient; L0 + scope unit regression green).

---

## Defect disposition

| ID | Prior | QC verdict |
|----|-------|------------|
| **D-W5-HRM-CAT-SYNC-01** | P0 — scope_parity write `main` vs read `holding` | **CLOSED** — retest API+modal read-back PASS |
| **D-W5-HRM-CAT-LIST-01** | P2 — summary card **3 trường** vs modal live count | **GWC OPEN** — optional **dev-fe** card refresh |
| **D-W5-CAT-GOV-SEED-01** | P1 — catalog governance dev seed **409** | **GWC OPEN** — out of W5 slice; **dev-be** for J-XBOS-02 approve |

---

## Conditions (bounded)

| ID | Condition | Owner | Trigger to close |
|----|-----------|-------|------------------|
| **C-W5QC-01** | VPS/nip.io or `:8088` deploy + retest **J-XBOS-08** (7 steps) before pilot promotion beyond localhost | devops → qa | Browser PASS on `:8088` or nip.io |
| **C-W5QC-02** | Optional **dev-fe** fix **D-W5-HRM-CAT-LIST-01** summary card count before UAT polish | dev-fe | Card count matches modal/API |
| **C-W5QC-03** | Sync `PROGRAM_JOURNEY_MAP.md` J-XBOS-08 row with QC ref | pm | **CLOSED** — row updated 2026-06-06 QC gate |

**Reopen trigger:** POST immediate sync **201** but GET `effectiveItems` missing field; **409** on settings-catalogs GET for group CEO `main`; HRM embed Sync ERROR banner on employees route; or `settings-catalogs.controller.spec.ts` / `hrm-list-scope.spec.ts` **<49/49**.

---

## Promotable slice (honest)

| Item | Status |
|------|--------|
| **J-XBOS-08** steps 1–7 (configure → sync → read-back → embed shell) | **Promotable** localhost group CEO |
| **D-W5-HRM-CAT-SYNC-01** | **CLOSED** on `:5173` |
| **D-W5-HRM-CAT-LIST-01**, **D-W5-CAT-GOV-SEED-01** | **OPEN (GWC)** — non-blocking W5 sync slice |
| Phase 1 DONE / PROD / nip.io pilot / `:8088` | **NOT claimed** |

---

## pm_dispatch_hint

- Sponsor message: **J-XBOS-08 HRM catalog sync journey PASS on local dev** — verify on `:5173` → **CÀI ĐẶT HỆ THỐNG** → **Danh mục hồ sơ nhân sự** → **Cấu hình chi tiết**; field `QA W5 HRM Cat BE Fix 20260606` visible after immediate sync; **:8088** unchanged until **C-W5QC-01**.
- Dispatch **pm** to close W5 wave on bus + refresh `XBOS_CC_WAVE_EXECUTION_PLAN.md` W5 row → **✅ GWC local**.
- After git merge + VPS deploy, dispatch **qa** for **C-W5QC-01** (same 7 steps on pilot URL).
- Optional **dev-fe** **D-W5-HRM-CAT-LIST-01** in parallel; **dev-be** **D-W5-CAT-GOV-SEED-01** when W7 J-XBOS-02 approve needed.
- W6 **J-XBOS-09** already **GWC local** — do not conflate with W5 closure.

---

## Completion contract

**completion_report:** W5 HRM catalog QC **GO WITH CONDITIONS** on `localhost:5173`. Audited QA retest in `p1-xbos-w5-hrm-cat-qa-retest-20260606.md` after BE fix chain. **J-XBOS-08** all 7 L2.5/API steps **PASS**; P0 **D-W5-HRM-CAT-SYNC-01 CLOSED**. QC spot: pack **8/8**, L0 exit **0**, jest **49/49**. **C-W5QC-03 CLOSED** (journey map QC ref synced). Residual: localhost-only (**C-W5QC-01**), P2 card count (**D-W5-HRM-CAT-LIST-01**), governance seed (**D-W5-CAT-GOV-SEED-01**).

**next_owner:** **pm**

**next_dispatch_prompt:**

```text
@pm — P1-XBOS-W5 post-QC governance (local slice closed)

work_item_id: P1-XBOS-W5-PM-01
entry_criteria: QC PASS_TO_PM docs/qa/evidence/qc-p1-xbos-w5-hrm-cat-20260606.md — GO WITH CONDITIONS localhost J-XBOS-08; D-W5-HRM-CAT-SYNC-01 CLOSED
exit_criteria: (1) Bus W5 wave closed; (2) Refresh TEAM_WORKING_NOW / XBOS_CC_WAVE_EXECUTION_PLAN W5 → ✅ GWC local; (3) Dispatch devops+qa C-W5QC-01 nip.io/:8088 retest OR defer with owner+expiry; (4) Optional dev-fe D-W5-HRM-CAT-LIST-01; (5) Continue W7 J-XBOS-10 workflow audit per wave plan — NOT Phase 1 DONE
evidence_path: docs/qa/evidence/qc-p1-xbos-w5-hrm-cat-20260606.md
ack_status target: PASS_TO_PM or DISPATCHED next wave
```

**evidence_path:** `docs/qa/evidence/qc-p1-xbos-w5-hrm-cat-20260606.md`

**ack_status:** **PASS_TO_PM**
