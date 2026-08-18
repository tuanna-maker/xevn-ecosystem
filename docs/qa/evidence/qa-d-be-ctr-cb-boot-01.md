# Evidence — QA-D-BE-CTR-CB-BOOT-01 (L1 API only)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-D-BE-CTR-CB-BOOT-01` |
| **parent** | `D-BE-CTR-CB-BOOT-01` |
| **lane** | execution · **qa** |
| **Date** | 2026-08-12 |
| **stamp** | `CTRCBOOTQA-MSPXI6MA` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (L1 API) |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · AuthZ deny `du-lich.ceo@xe.vn` (`tenant=xe-du-lich`) |
| **env** | hrm-api `:28001` · xbos `:28002` · portal `:5173` · commit `5ccb26e` |
| **U65** | **zero-seed** — no `pnpm seed:*` |
| **Honesty** | `contracts_printable_ready=false` · **C-SLICE** · ≠ UF-HRM-10 · ≠ printable ready |
| **scope** | **L1 API only** — FE bootstrap UI chưa READY |
| **raw JSON** | `docs/qa/evidence/_tmp-qa-d-be-ctr-cb-boot-01.json` |
| **runner** | `scripts/qa/_tmp-qa-d-be-ctr-cb-boot-01.mjs` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS_TO_PM** · L1 closed · **browser NOT_PROMOTED** |
| **L0** | `pnpm run qc:fe-be-health` **exit 0** |
| **Jest** | 3 suites · **28/28** PASS |
| **L1 live** | POST bootstrap **201** · create-context si_base ≠ base · VAL-400 · OVERLAP-409 · AuthZ-403 |
| **Network mutate** | **only** `/api/hrm/contracts-insurance/compensation-packages` · Nest `/core` **0** |
| **J-HRM-CTR-CB-BOOT-01** | **NOT_PROMOTED** — chờ `D-FE-CTR-CB-BOOT-01` |
| **UF-HRM-10 / printable** | **DENY claim** |

---

## L0 / Jest

| Check | Evidence |
|-------|----------|
| `pnpm run qc:fe-be-health` | **exit 0** — hrm/xbos/portal/proxy **200** · portal-login token ok |
| Jest BE cited | `pnpm --filter hrm-api run test -- --runInBand d-be-ctr-cb-boot-01.cb-boot.spec.ts employee-compensation.service.spec.ts po-hrm-mvp-gd1-core-02-cluster-be-01.spec.ts` → **3 suites, 28 tests PASS** |

---

## L1 live API (ceo@ · U65)

**Subject:** NV001 `11111111-1111-4111-8111-111111111111` · `company_id=holding` · pre-state: **0** packages (empty C&B).

| # | AC | Request / assert | Result |
|---|----|------------------|--------|
| 1 | Bootstrap POST | `POST /api/hrm/contracts-insurance/compensation-packages` · `change_reason=ctr_workspace_bootstrap` · lines `base=15_500_000` + `si_base=12_300_000` (khác nhau) | **201** `HRM-COMP-201` · pkg `bfa79c7c-3b6c-4c82-8c27-deee08dd0ef4` |
| 2 | create-context | `GET …/employees/{id}/contract-create-context?company_id=main` | **200** · `base_salary_vnd=15500000` · `insurance_salary_vnd=12300000` (**từ si_base**, không fallback base) · allowance `si_base` |
| 3 | VAL-400 | amount `0` trên base hoặc si_base + bootstrap reason | **400** `HRM-CORE-CB-VAL-400` |
| 4 | OVERLAP-409 | POST lại cùng `effective_from` sau package đã tạo | **409** `HRM-COMP-409-OVERLAP` · alias `HRM-CORE-CB-OVERLAP-409` |
| 5 | AuthZ-403 | `du-lich.ceo@xe.vn` · headers `tenant/company=xe-du-lich` · POST packages | **403** `HRM-CORE-CB-AUTHZ-403` |
| 6 | Network SoT | Mutate paths | **chỉ** `…/compensation-packages` · salary keys trên contract rows **[]** · Nest `/core` **0** |

### Snapshot independence (sponsor §10b / Q-S2)

| Field | Value | Source line |
|-------|-------|-------------|
| `base_salary_vnd` | 15.500.000 | `component_code=base` |
| `insurance_salary_vnd` | 12.300.000 | `component_code=si_base` (**≠** base) |

---

## NOT_PROMOTED / DENY

| Item | Status |
|------|--------|
| **J-HRM-CTR-CB-BOOT-01** (browser FE) | **NOT_PROMOTED** — chờ `D-FE-CTR-CB-BOOT-01` READY_FOR_QA |
| UF-HRM-10 / contracts printable | **false** — không claim |
| Module CTR / C&B UAT DONE | **DENY** — **C-SLICE** |
| Seed / API fake để có inbox | **not used** |

---

## Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| — | — | — | **No P0/P1** on L1 scope |
| OBS | P3 | FE/BA | create-context khi **chưa** có package vẫn trả `compensation_snapshot.cb_masked=true` (AS-IS `!pkg` path) — FE bootstrap empty-detect **không** được tin `cb_masked` một mình |
| Carry | — | PM | Dispatch/continue **D-FE-CTR-CB-BOOT-01** → browser QA `J-HRM-CTR-CB-BOOT-01` |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → ưu tiên `D-FE-CTR-CB-BOOT-01` (nếu chưa READY) hoặc **qa** browser sau FE |
| **evidence_path** | `docs/qa/evidence/qa-d-be-ctr-cb-boot-01.md` |
| **completion_report** | L1 PASS: L0 exit 0; Jest 28/28; live POST packages bootstrap 201 với base≠si_base; GET create-context insurance=si_base; VAL-400; OVERLAP-409 + alias; AuthZ-403 du-lich; mutate chỉ packages path; Nest /core 0; zero-seed. **J-HRM-CTR-CB-BOOT-01 NOT_PROMOTED**. contracts_printable_ready=false · C-SLICE · ≠ UF-HRM-10. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: D-FE-CTR-CB-BOOT-01
role: dev-fe
lane: execution
entry_criteria: D-BE-CTR-CB-BOOT-01 READY + QA-D-BE-CTR-CB-BOOT-01 L1 PASS (docs/qa/evidence/qa-d-be-ctr-cb-boot-01.md · stamp CTRCBOOTQA-MSPXI6MA)
read_first:
  - docs/program/specs/SA-CTR-INSURANCE-SALARY-SOURCE-01.md §3–§5 · §8
  - docs/program/specs/BA-CTR-INSURANCE-SALARY-SOURCE-01.md §3–§5 · §10b
  - docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md §14
  - docs/qa/evidence/qa-d-be-ctr-cb-boot-01.md
task:
  1) ContractCbReadOnlyCard states RO | bootstrap | masked
  2) Bootstrap 2 ô vi-VN (base + si_base độc lập); block Tiếp nếu ≤0
  3) On Tiếp: POST /api/hrm/contracts-insurance/compensation-packages (change_reason=ctr_workspace_bootstrap) rồi GET contract-create-context refresh
  4) Empty detect: pkg empty + null salaries — KHÔNG chỉ tin cb_masked (AS-IS !pkg → cb_masked true)
  5) DENY ghi lương BH SoT lên employee_contracts; G4 seals; printable=false
exit_criteria: READY_FOR_QA · evidence docs/qa/evidence/d-fe-ctr-cb-boot-01.md
must_keep: contracts_printable_ready=false · C-SLICE · U65 zero-seed · ≠ UF-HRM-10
cấm: seed; claim browser DONE trước QA J-HRM-CTR-CB-BOOT-01
```

```text
work_item_id: QA-D-FE-CTR-CB-BOOT-01
role: qa
lane: execution
entry_criteria: D-FE-CTR-CB-BOOT-01 READY_FOR_QA; L0 qc:fe-be-health exit 0; U65 zero-seed
MISSION: Browser J-HRM-CTR-CB-BOOT-01 — login ceo@ → Hợp đồng → NV empty C&B → bootstrap base+si_base khác nhau → Tiếp → POST packages 201 → context RO → F5 còn số; AuthZ mask; VAL/OVERLAP UX; Network chỉ packages path.
exit_criteria: evidence docs/qa/evidence/qa-d-fe-ctr-cb-boot-01.md · PASS_TO_PM hoặc FAIL_TO_PM
must_keep: contracts_printable_ready=false · C-SLICE · ≠ UF-HRM-10
cấm: seed; PASS chỉ L1; claim printable
```
