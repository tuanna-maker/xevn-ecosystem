# QC Gate — DOC-ENT-HRM-MMAP-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `DOC-ENT-HRM-MMAP-QC-01` |
| **role** | qc (governance) |
| **lane** | docs-wave / HRM customer mindmap PARTIAL GĐ1 |
| **date** | 2026-08-03 |
| **scope** | Chain SRS v1.2 §3.7 AC-MMAP-* → TECH_SPEC v1.2 §4.12 → ba-data **no-delta** API/DB v1.1 |
| **prior** | `doc-ent-hrm-mmap-srs-01` · `doc-ent-hrm-mmap-ts-01` · `doc-ent-hrm-mmap-api-db-01` (no delta PASS) |
| **ack_status** | `PASS_TO_PM` |
| **verdict** | **GO WITH CONDITIONS** |

---

## Gate checklist (independent audit)

| # | Criterion | Result | Proof |
|---|-----------|--------|-------|
| 1 | ba-data no-delta PASS | **PASS** | `doc-ent-hrm-mmap-api-db-01.md`: không sửa API/DB; versions giữ **v1.1**; residual deferred có owner |
| 2 | TECH_SPEC / SRS v1.2 AC-MMAP locked | **PASS** | Disk: `SRS_NEW.md` **v1.2** §3.7.1–3.7.3 · `TECH_SPEC_NEW.md` **v1.2** `ref_srs` → SRS v1.2 §3.7 · §4.12 + §4.12.1 OUT |
| 3 | BRD §6.1 v1.4 align | **PASS** | `BRD_NEW.md` **v1.4** §6.1 — OT/Đào tạo/FaceID/360/builder → Sau GĐ1; khớp SRS §3.7.3 |
| 4 | API_CONTRACT stays **v1.1** (no silent wipe) | **PASS** | Header `# API_CONTRACT_NEW v1.1` · ~32 174 B · mtime **15:38** (trước TS 17:19) · §1–§9 F.1 11 FR intact · §11 defer recruitment/performance pointer |
| 5 | DB_DESIGN stays **v1.1** (no silent wipe) | **PASS** | Header `# DB_DESIGN_NEW v1.1` · ~26 435 B · mtime **15:27** · §4.1–4.8 spine · §6 FR→table · §7 defer (no invent) |
| 6 | No GĐ2 DDL invented | **PASS** | Grep API/DB: **không** có `employee_work_history` / `face_id` / `formula_builder` / `training_` / 360 tables. OT/attendance chỉ trong **§ defer**. TS §4.12.1 OUT locked |
| 7 | LV-FUND → leave-balance spine | **PASS** | API §4.1 `GET …/leave-balance` F.1 + §4.2 leave-requests · DB §4.3 `employee_leave_balances` · TS §4.12 row AC-MMAP-LV-FUND → TS-LEAVE · SRS AC-MMAP-LV-FUND (số dư ≠ admin/rollover) |
| 8 | RC / WH pointers OK | **PASS** | API §11: `/recruitment/*` «Phân hệ SoT riêng» · TS §4.12 RC-01/02/03 → recruitment→employees · WH-01 → employees/decisions inventory · **không** bắt buộc F.1 encyclopedia / bảng timeline Nest |
| 9 | 11 deep P0 FR spine intact | **PASS** | TS §4.1–§4.11 present + §4.12 ADD-only stub · API §1–§9 F.1 · DB §4 + §6 map 11 FR · SRS §6.2 «vẫn 11 FR» |
| 10 | Forbidden respected | **PASS** | No apps/** · no e2e_pass invent · no product UAT DONE claim in chain evidence |

---

## Version / size spot-check (disk 2026-08-03)

| File | Version | Size (B) | mtime (local) | MMAP touch? |
|------|---------|----------|---------------|-------------|
| `BRD_NEW.md` | **1.4** | 25 027 | 16:50 | §6.1 prior BRD wave |
| `SRS_NEW.md` | **1.2** | 47 383 | 17:05 | ADD §3.7 AC-MMAP |
| `TECH_SPEC_NEW.md` | **1.2** | 22 214 | 17:19 | ADD §4.12 / R-MMAP-* |
| `API_CONTRACT_NEW.md` | **1.1** | 32 174 | **15:38** | **Unchanged** (no-delta) |
| `DB_DESIGN_NEW.md` | **1.1** | 26 435 | **15:27** | **Unchanged** (no-delta) |

---

## Residual disposition (GWC — documented)

| ID | Severity | Owner | Expiry / reopen trigger | QC note |
|----|----------|-------|-------------------------|---------|
| **R-MMAP-API-RC** | P2 docs depth | ba-data + sa | CR: lean F.1 recruitment trên NEW pack (QC/PM yêu cầu encyclopedia) | **Deferred OK** — pointer §11 + TS §4.12 đủ Pass PARTIAL; không chặn GĐ1 inventory |
| **R-MMAP-DB-LV** | P2 product | ba-data | Sponsor/product kéo admin quỹ / rollover vào GĐ1 | **Deferred OK** — Pass LV-FUND = số dư + trừ đơn (H03 spine); **không claim** admin quỹ |
| **R-MMAP-API-ORG** | P3 | product / FE later | Chart UI Nhân sự | Ngoài Pass cây XBOS — không DDL |
| **R-MMAP-PF** | P3 | ba-data later | Performance depth | Pointer only; cấm 360/OKR DDL |
| **R-MMAP-OUT** | LOCK | pm / sponsor | CR mở OT · Đào tạo · FaceID · 360 · formula builder · offer formal · roster đầy đủ | **LOCKED OUT** — reopen = NO-GO nếu invent vào NEW pack không CR |
| **C-MMAP-API-SRS-REF** | P3 hygiene | sa optional | Khi bump API meta | API §0.4 vẫn ghi «SRS_NEW v1.1 on disk» trong khi SRS disk = **v1.2** — footnote stale; **không** wipe F.1 |

---

## Classification

| Class | Items |
|-------|--------|
| **ENV** | N/A — docs-only gate; no stack / no browser |
| **PROCESS** | Product `verify:qc:evidence-pack` checks (portal_url · J-*) **N/A** cho docs-wave (4/8 FAIL expected trên pack product) — gate này = disk + evidence chain, không L2.5 |
| **PRODUCT / SPEC residual** | R-MMAP-API-RC · R-MMAP-DB-LV deferred (above) |
| **PROGRAM** | **NOT** Phase 1 product DONE · **NOT** e2e_pass · **NOT** UAT/PROD-READY · **NOT** unlock Dev feature OT/Đào tạo/… |

---

## Evidence pack note

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/doc-ent-hrm-mmap-api-db-01.md
→ FAIL 4/8 (ack format / command_table / portal_url / journey_l25)
```

**Adjudication:** Docs governance gate (cùng class `DOC-ENT-QC-DOCS-01`). Product pack fields không áp dụng; QC dùng independent disk spot-check + member evidence chain thay cho L2.5. **Không** NO-GO process vì thiếu J-* trên docs-wave.

---

## Explicit non-claims

- **NOT** product UAT DONE / UF green  
- **NOT** Phase 1 / PROD-READY  
- **NOT** recruitment F.1 encyclopedia complete on NEW pack  
- **NOT** leave admin quỹ / rollover complete  
- **NOT** GĐ2 modules in scope  

---

## Verdict

### **GO WITH CONDITIONS**

**Accepted (bounded):** HRM customer mindmap PARTIAL GĐ1 docs chain — SRS **v1.2** AC-MMAP-* → TECH_SPEC **v1.2** §4.12 → API/DB **v1.1** no-delta — approved for governance close of inventory wave. 11 FR deep P0 intact; LV-FUND spine OK; RC/WH pointer policy OK; GĐ2 DDL **not** invented.

**Conditions (owner + expiry):**

1. **R-MMAP-API-RC** — deferred; owner **ba-data + sa**; expiry = until CR for lean F.1 recruitment on NEW pack (không bắt buộc để Pass PARTIAL).  
2. **R-MMAP-DB-LV** — deferred; owner **ba-data**; expiry = until sponsor pulls admin quỹ/rollover into GĐ1 claim.  
3. **R-MMAP-OUT** — remain LOCKED; any invent DDL/FR for OT/Đào tạo/FaceID/360/builder/offer formal/full roster **without** sponsor CR → reopen **NO-GO**.  
4. Program: **NOT** Phase 1 / UAT product DONE.

**Reopen → NO-GO if:** API/DB wipe or version regress; 11 FR F.1 removed; GĐ2 tables/endpoints invented into NEW pack; AC-MMAP chain deleted from SRS/TS.

---

## completion_report

**Closed:** L3 docs QC `DOC-ENT-HRM-MMAP-QC-01` — independent spot-check versions/sizes/mtime; LV-FUND leave-balance spine; RC/WH pointers; no GĐ2 invent; 11 FR intact; chain SRS→TS→ba-data no-delta verified; verdict **GO WITH CONDITIONS**; residuals R-MMAP-API-RC / R-MMAP-DB-LV deferred with owner+expiry.

**Residual open:** see table (R-MMAP-* deferred + C-MMAP-API-SRS-REF P3 hygiene).

---

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: DOC-ENT-HRM-MMAP-PM-CLOSE-01
role: pm
lane: governance
Mission: Intake DOC-ENT-HRM-MMAP-QC-01 GO WITH CONDITIONS.
Update TEAM_WORKING_NOW / PROJECT_STATUS_REPORT / bus:
  - HRM mindmap PARTIAL GĐ1 docs chain APPROVED bounded
  - SRS_NEW v1.2 §3.7 AC-MMAP-* · TECH_SPEC_NEW v1.2 §4.12 · API_CONTRACT + DB_DESIGN remain v1.1 (no-delta)
  - Residuals deferred (not blocking inventory): R-MMAP-API-RC · R-MMAP-DB-LV · R-MMAP-OUT LOCKED
Do NOT claim Phase 1 product DONE / UAT DONE / e2e_pass.
Optional P3 hygiene (non-blocking): sa footnote API §0.4 «SRS v1.1» → v1.2 (C-MMAP-API-SRS-REF) — meta only, no F.1 rewrite.
evidence: docs/qa/evidence/doc-ent-hrm-mmap-qc-01.md
ack: PASS_TO_PM from qc — pm INTAKE + status update.
```

**evidence_path:** `docs/qa/evidence/doc-ent-hrm-mmap-qc-01.md`  
**ack_status:** `PASS_TO_PM`

---

*DOC-ENT-HRM-MMAP-QC-01 — qc — 2026-08-03*
