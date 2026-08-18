# Evidence — QA-PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01` · retest **`QA-PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01-RETEST-04`** |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-11 |
| **stamp** | **`ETCTRQA1-MSNNRUZQ`** (harness) · regression **`QACONPAYST1-MSNNSHOZ`** |
| **ack_status** | **`PASS_TO_PM`** |
| **overall** | **PASS** (L0 + vitest + BE jest + parity + mutate + regression 🟢) |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **portal** | `http://127.0.0.1:5173` · CC embed `/command-center/hrm/contracts` |
| **commit** | `dc930c5` |
| **u65** | zero-seed browser · **no** `settings_catalog_e2e_ready` flip |
| **fe_slice** | `PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-FE-03-CONTRACT-TYPE-HYDRATE-01` |

## Gates

| Gate | Command / artifact | Result |
|------|-------------------|--------|
| **L0** | `pnpm run qc:fe-be-health` | **exit 0** — ALL PASS |
| **BE unit** | `pnpm --filter hrm-api test -- po-hrm-employment-types-consumer-ctr-be-01` | **4/4 PASS** |
| **Unit FE** | `pnpm test` in `apps/web/hrm` — `catalogSearchPicker.test.ts` + `contractCreateWizard.source.test.ts` | **50/50 PASS** |
| **Regression** | `scripts/qa/_tmp-qa-hrm-settings-consumer-pay-stale-01.mjs` | **PASS** stamp **`QACONPAYST1-MSNNSHOZ`** |
| **Parity harness** | `scripts/qa/_tmp-qa-po-hrm-employment-types-consumer-ctr-01.mjs` | **exit 0** · **15=15 EMP** · mutate leg 🟢 · stamp **`ETCTRQA1-MSNNRUZQ`** |
| **Mutate probe** | `scripts/qa/_tmp-qa-po-hrm-employment-types-consumer-ctr-mutate-probe.mjs` | **exit 0** — `patchStatus: 200` · `work_arrangement: fidmzgc71emp` · `f5LabelOk: true` |

## AC-SET-CONSUMER-ET-CTR-01 (narrow)

**spec_ref:** `docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.2 · `BA-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01.md`

| Check | Verdict | Evidence |
|-------|---------|----------|
| Picker options = GET `/employees/employment-types/effective` (EFF>0) | **🟢 PASS** | API **15** codes · picker **15** · `parity_ok: true` · **`ETCTRQA1-MSNNRUZQ`** |
| Không invent hardcoded `remote`/`hybrid` enum | **🟢 PASS** | Vitest + codes `*emp` |
| Chọn → PATCH `work_arrangement` = catalog code (request body) | **🟢 PASS** | Probe + harness · body `work_arrangement` = `fidmzgc71emp` |
| PATCH **2xx** persist + F5 → label trên Sửa | **🟢 PASS** | NV001-HD **PATCH 200** (no `HRM-CON-TYPE-KEY`) · `f5_label_ok: true` · FE-03 maps legacy `contract_type` label → catalog code on save |
| **EFF=0** empty + CTA | **⚪ NOT_RUN** | Pilot EFF=15 |
| **Regression** dept + contract_type consumers | **🟢 PASS** | **`QACONPAYST1-MSNNSHOZ`** |

### UF (browser — mutate)

- **URL:** `http://127.0.0.1:5173/command-center/hrm/contracts`
- **Click path (parity):** Hợp đồng → **Thêm hợp đồng** → bước 1 → **Hình thức làm việc** (`ctr-create-work-arrangement`)
- **Click path (mutate):** **Sửa** `NV001-HD` → đổi `ctr-create-work-arrangement` → **Lưu** (`hdsd-contracts-form-submit`)
- **Network:** `GET …/employment-types/effective?company_id=main` → **200** · `total=15`
- **Network (mutate):** `PATCH …/contracts/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1` → **200**
- **FE sau 2xx:** F5 → Sửa shows WA label (not placeholder «Chọn hình thức»)
- **Console:** no `Uncaught` · harness `consoleErrors: []`

**Artifacts:** `docs/qa/evidence/_tmp-qa-po-hrm-employment-types-consumer-ctr-01.json` · screens under `docs/qa/evidence/screens/qa-po-hrm-employment-types-consumer-ctr-01/`

## Honesty

- **≠** UF-HRM-10 full PASS · `settings_catalog_e2e_ready=false`
- **AC-SET-CONSUMER-ET-CTR-01 narrow slice closed** (picker parity + NV001-HD mutate 2xx + F5)

## Prior retest (archive)

**RETEST-03 (`ETCTRQA1-MSNNCC2O`):** FAIL — PATCH **400** `HRM-CON-TYPE-KEY` (`contract_type` label «Hợp đồng 3 năm»). Fixed by FE-03 hydrate.

## completion_report

**Closed:** FE-03 retest; L0; vitest **50/50**; BE **4/4**; **`QACONPAYST1-MSNNSHOZ`**; harness **exit 0** **`ETCTRQA1-MSNNRUZQ`**; mutate probe **exit 0**; AC-SET-CONSUMER-ET-CTR-01 mutate + parity 🟢.

**Residual:** EFF=0 CTA browser (pilot EFF=15); UF-HRM-10 full out of scope.

## next_owner

`pm` → **`qc`** (narrow gate AC-SET-CONSUMER-ET-CTR-01)

## next_dispatch_prompt

```text
work_item_id: QC-PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01-NARROW-01
role: qc
read_first: docs/qa/evidence/qa-po-hrm-employment-types-consumer-ctr-01.md (RETEST-04 PASS) · docs/qa/evidence/po-hrm-employment-types-consumer-ctr-fe-03.md
entry_criteria: QA RETEST-04 PASS_TO_PM; stamp ETCTRQA1-MSNNRUZQ; QACONPAYST1-MSNNSHOZ; u65 no seed
exit_criteria: Audit AC-SET-CONSUMER-ET-CTR-01 narrow GO/GWC; cite harness JSON + screens; honesty ≠ UF-HRM-10 full; settings_catalog_e2e_ready DENY
evidence_path: docs/qa/evidence/qc-po-hrm-employment-types-consumer-ctr-01.md
ack_status: PASS_TO_PM or NO-GO
```

## pm_dispatch_hint

**QC narrow** — AC-SET-CONSUMER-ET-CTR-01 closed on RETEST-04 (`ETCTRQA1-MSNNRUZQ` + mutate probe exit 0). Do not promote UF-HRM-10 full or settings catalog e2e flip.

**ack_status:** **PASS_TO_PM**
