# GOV-HRM-SETTINGS-POST-ATT-SA-01 — Settings vertical kế sau ATT LVT dual SoT (sealed)

| Field | Value |
|-------|--------|
| **work_item_id** | `GOV-HRM-SETTINGS-POST-ATT-SA-01` |
| **lane** | governance · sa |
| **date** | 2026-08-10 |
| **change_mode** | **ADD** disposition only · **no** `apps/**` |
| **depends_on** | QC GWC **`ATTLVTSOTQC1-MSNGQC01`** · PM seal `PM-HRM-SC-01-ATT-LVT-SEAL-01` |
| **Honesty (RETAIN)** | `settings_catalog_e2e_ready=false` · `attendance_uat_ready` **not flipped** · `C-SLICE-≠-MODULE` · **DENY** reopen `SETFIDQC1-MSN8VQ3L` · `SETW3QC1-MSN9KGQC1` |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Context (facts)

| Signal | Value |
|--------|--------|
| **Closed slice** | HRM-SC-01 **ATT LVT dual SoT** — settings REF read-only + `tenantWriter` + Nest ATT writer + consumer **effective** (8 UF 🟢; stamps `ATTLVTSOTQA-MSNG88NH` + `ATTLVTSOTFEQA-MSNGJ8T2`) |
| **Parent gates** | SETFID fidelity GWC · SETW3 narrow F5 4/4 — **independent**; full 18-tab W3 sweep **not** promoted |
| **U1 backlog** | `PHASE1_UC_CLOSURE_BACKLOG.md` §3 — HRM-SC-02/03 · orphan JD · CTR tpl · portal tabs still `fidelity_P0` |
| **Peer pattern** | ATT LVT → **catalog spine** (UF-HRM-10 consumers) → **W3 extension mutate** (non-LVT ATT + EMP + SI) → **orphan SRS tabs** (JD master · CTR composer) → **portal mock** (P2) |

```text
  [SEALED C-SLICE] att-leave-types dual SoT + effective consumer
         │
         ├─► HRM-SC-02 catalogs / UF-HRM-10 consumers (Employee · REC · Contracts dept…)
         │
         ├─► HRM-SC-03 W3 mutate residual (att-codes/ot/comp · EMP · SI · DEC · REC-stage…)
         │
         ├─► FR-UC-BP-REC-00 jd-master-list · FR-09d contract-templates composer
         │
         └─► portal tabs mock (account/branding/security/system) — P2 defer
```

---

## 2. OUT OF SCOPE — sealed ATT LVT slice (cấm reopen)

PM/Dev/QA **must not** dispatch work that **redefines** or **regresses** the following under any new `work_item_id` without explicit sponsor + new SA seat:

| Artifact / behavior | Lock |
|---------------------|------|
| Tab `att-leave-types` · `AttLeaveTypeSettingsPanel` | **must_keep** — Nest PUT admin · retire · U65 CREATE+F5 |
| `GET …/leave-types/effective` · invent `HRM-LEAVE-TYPE-UNKNOWN` | **must_keep** consumer SoT |
| Settings overview / extension on key `leave_types` | **REF-only** · `HRM-SC-LEAVE-REF-ONLY` **409** on extension mutate |
| Master-data / catalogs **Loại nghỉ** | REF banner · CTA → `tab=att-leave-types` · **no** extension POST on browse |
| Cross-nav spine | Settings MD/catalogs → ATT tab → leave create effective GET (**verified L2.5**) |
| Honesty | **DENY** `settings_catalog_e2e_ready` · **DENY** `attendance_uat_ready` flip from this slice |
| BA-02 row 14 `R-PLT-ATT-LEAVE-FE-ADMIN-01` | **HOLD** polish only — **≠** next vertical · **≠** reopen dual SoT |
| QC stamps | **RETAIN** `ATTLVTSOTQC1-MSNGQC01` — annotate matrix **C-SLICE only** |

**W3 mutate wave:** tab `att-leave-types` is **excluded** from `allowed_paths`; regression **only** if shared shell/file touch — run UF-ATT-ADMIN-CREATE-F5 + effective consumer smoke.

---

## 3. Options — next Settings vertical

| Option | Scope | Pros | Cons / risk | SA rank |
|--------|--------|------|-------------|---------|
| **A — W3 mutate residual (HRM-SC-03)** | `PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-01` — P0 tabs **ATT codes/OT/COMP** · **EMP** · **SI** (+ peer W3 shells per `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01` §2) | Closes SRS AC-PLT-* mutate + FE-after-2xx+F5; aligns SETW3 parent without full 18-tab sweep; **no** LVT SoT conflict if paths scoped | Touch shared `Settings.tsx` / shell → regression risk on LVT; **not** module UAT | **1 — RECOMMENDED primary execution** |
| **B — Catalog consumer fidelity (HRM-SC-02)** | `PO-HRM-SETTINGS-CATALOG-CONSUMER-FE-01` audit + **`PO-HRM-SETTINGS-FIDELITY-QA-02`** narrow UF-HRM-10 | Unblocks REC/Employee spine (peer ATT→REC); O4 SRS §16 | Audit may be **DONE** (`po-hrm-settings-catalog-consumer-audit-fe-01.md`); value = **QA promote** not re-implement | **2 — QA lane** if audit DONE; else FE gaps only |
| **C — REC / CTR orphan P0 screens** | `PO-HRM-SETTINGS-JD-MASTER-LIST-FE-01` · `PO-HRM-SETTINGS-CTR-TPL-COMPOSER-FE-01` | High sponsor visibility (JD library · HĐ composer) | Does not close W3 mutate class; parallel OK if capacity | **3 — parallel dev-fe** after A started or sponsor names JD/CTR |
| **D — Portal tabs mock** | `PO-HRM-SETTINGS-PORTAL-TABS-FE-02` | SRS §16 account/security/system | C-SPEC-SHALLOW · no API · QC defer P2; **blocks** nothing critical for embed catalog spine | **4 — P2 defer** (QC GWC explicit) |

### Recommendation — **Option A LOCK** + conditional B

1. **Dispatch `PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-01`** with packet:
   - `read_first`: `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01` §2 rows **att-attendance-codes · att-ot-types · att-ot-comp-types · emp-* · si-* · dec-decision-types · rec-pipeline-stages** (not `att-leave-types`)
   - `must_keep`: §2 OUT OF SCOPE table above + SETW3 F5 pattern
   - `forbidden_paths`: `att-leave-types` panel logic · `hrm-settings-leave-type-sot` · MD `leaveTypes` REF UX
2. **Then `PO-HRM-SETTINGS-FIDELITY-QA-02`** — U65 browser slice: W3 mutate tabs + existing SETFID legs (dept picker etc.); **DENY** claim `settings_catalog_e2e_ready`.
3. **Do not** dispatch full `QA-PO-HRM-SETTINGS-W3-FULL-SWEEP-01` (18 tab) until U1 exit criteria or new QC narrow gate.

**REC catalog consumers:** treat as **HRM-SC-02** — if consumer audit evidence PASS, **QA retest** not FE redo; REC **settings** tab `rec-pipeline-stages` mutates belong to **Option A** W3 bundle, not LVT slice.

---

## 4. Rollout checkpoints

| Step | Owner | Exit |
|------|-------|------|
| 1 | pm | Bus seal `ATTLVTSOTQC1` on matrix row **dual SoT only** |
| 2 | dev-fe | W3 mutate FE-01 · vitest + `solid_convention_ack` · no LVT path diff |
| 3 | qa | FIDELITY-QA-02 · U65 · UF-HRM-10 + W3 P0 tabs · L2.5 where tab→consumer |
| 4 | qc | Narrow GWC **or** annotate SETFID residual — **DENY** module flip |
| 5 | ba-process | Optional AC pack for remaining SETFID tabs **not** in A (portal · subscription) |

---

## 5. Risks

| Risk | Mitigation |
|------|------------|
| W3 shell edit breaks LVT | `forbidden_paths` + mandatory regression UF-ATT-ADMIN + effective |
| False Settings module DONE | Honesty flags + QC narrow scope |
| Parallel CTR/JD steals W3 | PM caps 2–4 Task; W3 mutate = U1 exit blocker per backlog §8 #1 |

---

## completion_report

**Closed:** Post-ATT LVT Settings sequencing — Option A (W3 mutate residual) **LOCKED** as primary execution; HRM-SC-02 consumers → QA fidelity; portal tabs **P2 OUT**; explicit **OUT OF SCOPE** for sealed dual SoT slice and honesty flags.

**Residual:** Execution not started; `settings_catalog_e2e_ready=false`; full W3 18-tab sweep and BA portal AC pack remain program-open.

---

## Handoff

| Field | Value |
|-------|--------|
| **next_owner** | `pm` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/GOV-HRM-SETTINGS-POST-ATT-SA-01.md` · cite `docs/qa/evidence/qc-hrm-settings-att-lvt-sot-gwc-01.md` |
| **next_dispatch_prompt** | PM: (1) **`PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-01`** → dev-fe — P0 W3 mutate ATT codes/OT/COMP + EMP + SI shells per `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01` §2; `must_keep` `GOV-HRM-SETTINGS-POST-ATT-SA-01` §2 OUT OF SCOPE + `ATTLVTSOTQC1` seals; `forbidden_paths` tab `att-leave-types` + MD/catalogs LVT REF. (2) After READY_FOR_QA → **`PO-HRM-SETTINGS-FIDELITY-QA-02`** qa — U65 W3 P0 tabs + UF-HRM-10 legs; **DENY** `settings_catalog_e2e_ready`. **Cấm** reopen ATT LVT slice · flip honesty · full 18-tab W3 sweep without new QC gate. |

---

*Evidence footer: `GOV-HRM-SETTINGS-POST-ATT-SA-01` · inputs `qc-hrm-settings-att-lvt-sot-gwc-01.md` · `PM-HRM-SC-01-ATT-LVT-SEAL-01.md` · `PHASE1_UC_CLOSURE_BACKLOG.md` §3 · `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` · 2026-08-10.*
