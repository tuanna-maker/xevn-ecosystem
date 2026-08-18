# Evidence — QC-HRM-SETTINGS-ATT-LVT-SOT-GWC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-SETTINGS-ATT-LVT-SOT-GWC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-10 |
| **lane** | governance — **narrow C-SLICE** · HRM-SC-01 **ATT LVT dual SoT** only (paired BE+FE QA) |
| **qa_be** | [`qa-hrm-settings-att-lvt-sot-01.md`](qa-hrm-settings-att-lvt-sot-01.md) · stamp **`ATTLVTSOTQA-MSNG88NH`** |
| **qa_fe** | [`qa-hrm-settings-att-lvt-sot-fe-01.md`](qa-hrm-settings-att-lvt-sot-fe-01.md) · stamp **`ATTLVTSOTFEQA-MSNGJ8T2`** |
| **pm_seal** | [`docs/program/dispatch/PM-HRM-SC-01-ATT-LVT-SEAL-01.md`](../program/dispatch/PM-HRM-SC-01-ATT-LVT-SEAL-01.md) |
| **dev_ref** | [`po-hrm-settings-att-lvt-sot-be-01.md`](po-hrm-settings-att-lvt-sot-be-01.md) · [`po-hrm-settings-att-lvt-sot-fe-01.md`](po-hrm-settings-att-lvt-sot-fe-01.md) |
| **settings_parent** | [`qc-po-hrm-settings-fidelity-gate-01.md`](qc-po-hrm-settings-fidelity-gate-01.md) · **`SETFIDQC1-MSN8VQ3L`** — **RETAIN** |
| **w3_parent** | [`po-hrm-settings-w3-qc-narrow-gate-01.md`](po-hrm-settings-w3-qc-narrow-gate-01.md) · **`SETW3QC1-MSN9KGQC1`** — **RETAIN** |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | **`ATTLVTSOTQC1-MSNGQC01`** · annotates **`ATTLVTSOTQA-MSNG88NH`** + **`ATTLVTSOTFEQA-MSNGJ8T2`** |
| **portal_url** | `http://127.0.0.1:5173` · settings `hr/settings?portal=1` · hrm-api `:28001` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **U65** | zero-seed · browser + authenticated API (invent probe only) · **RETAINED** |
| **OS honesty** | `settings_catalog_e2e_ready=false` · `attendance_uat_ready` **not flipped** · `C-SLICE-≠-MODULE` |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** paired QA stamps on **HRM-SC-01 dual SoT slice only**:

1. **BE** — overview `tenantWriter` · REF extension **409** `HRM-SC-LEAVE-REF-ONLY` · ATT admin PUT+F5 · consumer **GET effective** + invent **400** `HRM-LEAVE-TYPE-UNKNOWN` (4/4 UF).
2. **FE** — master-data **Loại nghỉ** REF-only UX · catalogs overview REF block · deep-link CTAs → **Loại phép ATT** · **no** extension POST on REF browse · ATT admin + effective consumer regressions (4/4 UF).

**NOT** full Settings module UAT · **NOT** `settings_catalog_e2e_ready` · **NOT** 18-tab W3 sweep · **NOT** Phase 1 DONE.

Audited: both QA MD · PM seal · dev handoffs · parent SETFID/SETW3 honesty · Classification · U19 cross-nav spine (settings ↔ ATT tab ↔ leave create).

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`settings_catalog_e2e_ready` / Settings module UAT** | **`false`** | **DENIED** flip |
| **Claim full HRM Settings / HRM-SC-01 module DONE** | **DENIED** | dual SoT `leave_types` only |
| **`attendance_uat_ready` / full ATT module UAT** | **not flipped** | C-SLICE ATT writer + effective legs only |
| **Phase 1 DONE** | **DENIED** | narrow GWC |
| **Reopen `SETFIDQC1` · `SETW3QC1` · consumer PAY stale GWC** | **DENIED** | independent slice |
| **Seed** | **DENIED** (U65) | QA paths FE-first |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | narrow GWC |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `settings_catalog_e2e_ready=true`? | **NO** |
| May PM claim Settings module / full HRM-SC-01 UAT? | **NO** |
| May PM claim Phase 1 DONE from this seat? | **NO** |
| May PM annotate matrix with **`ATTLVTSOTQC1-MSNGQC01`** on HRM-SC-01 **ATT LVT dual SoT** row (BE+FE pair)? | **YES** |
| May PM treat **8 UF** below as **CLOSED** for this slice? | **YES** — this GWC |
| May PM flip `attendance_uat_ready`? | **NO** |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| UF-HRM-SC-01-OVERVIEW · REF-409 (BE) | PRODUCT L1+L2 | **ACCEPT** |
| UF-MD-LEAVE-TYPES-REF · UF-CATALOGS-LEAVE-TYPES-REF (FE) | PRODUCT L2 | **ACCEPT** |
| UF-ATT-ADMIN-CREATE-F5 (BE+FE regression) | PRODUCT L2.5 | **ACCEPT** · retain open slug N+1 |
| UF-LEAVE-CONSUMER-EFFECTIVE (BE+FE) | PRODUCT L2.5 | **ACCEPT** · effective SoT |
| Cross-nav MD/catalogs → `tab=att-leave-types` | PRODUCT L2.5 | **ACCEPT** · journey spine |
| Remaining Settings tabs / W3 density / portal tabs mock | PRODUCT scope | **OUT OF SCOPE** · SETFID · SETW3 · `PO-HRM-SETTINGS-PORTAL-TABS-FE-02` |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-settings-att-lvt-sot-01.md` | exit **0** · **8/8 PASS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-settings-att-lvt-sot-fe-01.md` | exit **0** · **8/8 PASS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-settings-att-lvt-sot-gwc-01.md` | *(post-write QC SoT)* |
| QA L0 `qc:fe-be-health` (cite QA) | **PASS** exit 0 · `:5173` · `:28001` · `:28002` |
| QA BE jest `hrm-settings-leave-type-sot` + `att-leave-type` | **14/14** PASS |
| QA FE vitest `hrmSettingsLeaveTypeSot` + `MasterDataSettingsPanel` | **10/10** PASS |
| Git HEAD (cite QA) | `dc930c5` |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` · `:28001` |
| 5 | journey_l25 | ✅ cross-nav + effective spine · § J-* below |
| 6 | crud_or_matrix | ✅ 8 UF table · **PASS** rows |
| 7 | residual_section | ✅ § Residual |
| 8 | timestamp | ✅ 2026-08-10 |

---

## UF matrix (in-scope — CLOSED this seat)

| UF-ID | Lane | Verdict | Notes |
|-------|------|---------|-------|
| **UF-HRM-SC-01-OVERVIEW** | BE | **PASS** | `tenantWriter` on `leave_types` |
| **UF-HRM-SC-01-REF-409** | BE | **PASS** | `HRM-SC-LEAVE-REF-ONLY` |
| **UF-MD-LEAVE-TYPES-REF** | FE | **PASS** | no extension form/POST |
| **UF-CATALOGS-LEAVE-TYPES-REF** | FE | **PASS** | REF block + CTA |
| **UF-ATT-ADMIN-CREATE-F5** | BE+FE | **PASS** | PUT 200 · F5 row retain |
| **UF-LEAVE-CONSUMER-EFFECTIVE** | BE+FE | **PASS** | GET effective · UNKNOWN guard |

---

## J-* / L2.5 (U19)

| ID | Verdict | Notes |
|----|---------|-------|
| **Settings → ATT leave-types tab** (cross-nav) | **PASS** | MD + catalogs CTAs · `tab=att-leave-types` |
| **Leave create → effective GET** | **PASS** | Chấm công → Nghỉ phép → Tạo |
| **PROGRAM_JOURNEY_MAP** mandatory J-* (full Settings) | **NOT PROMOTED** | slice ≠ module |
| **J-CTR / J-PAY / W3 catalog mutate sweep** | **RETAIN** | parent seals |

Wave scope per QA: **no new mandatory J-* beyond dual SoT spine** — L2 tab load alone **insufficient**; REF mutate UX + effective SoT **verified**.

---

## Conditions (GWC)

1. **Honesty:** `settings_catalog_e2e_ready=false` · **DENY** Settings module UAT · **DENY** Phase 1 · **DENY** `attendance_uat_ready` flip · U65 seed.
2. **Parent RETAIN:** **`SETFIDQC1-MSN8VQ3L`** · **`SETW3QC1-MSN9KGQC1`** · **`QACONPAYSTQC1-MSNG1JQC1`** — not reopened.
3. **CLOSED (this seat):** HRM-SC-01 **ATT LVT dual SoT** — settings REF read-only + `tenantWriter` stamp + Nest ATT writer + consumer **effective** (paired **`ATTLVTSOTQA-MSNG88NH`** + **`ATTLVTSOTFEQA-MSNGJ8T2`**).
4. **must_keep:** `AttLeaveTypeSettingsPanel` · `GET …/leave-types/effective` · `HRM-LEAVE-TYPE-UNKNOWN` · `HRM-SC-LEAVE-REF-ONLY` · ATT QC peer seals (ATT05..ATT12 stack) per continuous program.
5. **OUT OF SCOPE defer:** `PO-HRM-SETTINGS-PORTAL-TABS-FE-02` · full 18-tab W3 · remaining catalog keys consumer audit gaps.

---

## Residual / not promoted

| Item | Severity | Owner |
|------|----------|-------|
| Full Settings module UAT · W3 sweep | Program | PM / future waves |
| `settings_catalog_e2e_ready` | Honesty | **DENY** |
| `attendance_uat_ready` | Honesty | **not flipped** |
| Portal settings tabs mock | P2 | `PO-HRM-SETTINGS-PORTAL-TABS-FE-02` |
| UC matrix annotate HRM-SC-01 row | Program | PM post-GWC |

---

## completion_report

**Closed:** QC narrow **GO WITH CONDITIONS** on HRM-SC-01 **ATT LVT dual SoT** — audited paired BE+FE QA (8/8 UF 🟢), PM seal, dev PO handoffs, U65 retained, QA packs **8/8** each, honesty locks aligned with SETFID/SETW3 parents.

**Residual:** Program honesty flags unchanged; full Settings UAT and Phase 1 **DENIED**; PM may annotate matrix row only for this slice stamp **`ATTLVTSOTQC1-MSNGQC01`**.

---

## Handoff

| Field | Value |
|-------|--------|
| **next_owner** | `pm` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/qc-hrm-settings-att-lvt-sot-gwc-01.md` |
| **next_dispatch_prompt** | PM: append bus seal **`ATTLVTSOTQC1-MSNGQC01`** on `PM-HRM-SC-01-ATT-LVT-SEAL-01`; annotate PILOT/UC matrix HRM-SC-01 **dual SoT** row 🟢 **C-SLICE only** — **do not** set `settings_catalog_e2e_ready`. U88: dispatch **`sa`** narrow delta on HRM dynamic-config vertical kế (peer ATT→REC catalog consumers) **or** **`ba-process`** AC for remaining Settings tabs per `SETFIDQC1` residual — **not** reopen ATT LVT slice. Optional P2: `PO-HRM-SETTINGS-PORTAL-TABS-FE-02` when portal mock blocks sponsor UF. |
