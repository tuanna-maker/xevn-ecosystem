# QC Zero-Defect Reform Plan (2026-06-03)

**Trigger:** User feedback — QC «làm ăn chán»: GO khi UI vẫn hỏng; sau đó nhiều vòng GO WITH CONDITIONS / NO-GO vì thiếu file evidence hoặc nhầm lỗi port với lỗi sản phẩm.

**Owner:** PM + TA (QC/TM) · **Execution:** QA (pack) · QC (audit only)

---

## 1) Root causes (honest)

| # | Symptom user saw | Process gap |
|---|------------------|-------------|
| R1 | Tab load 200 nhưng HRM trống / 500 | QA/QC dừng ở L1/L2, không bắt buộc L2.5 J-* + footer CRUD |
| R2 | «Lưu thay đổi» không hoạt động nhưng wave vẫn «PASS» | Không có CRUD matrix bắt buộc theo module (C/R/U/D + negative) |
| R3 | Nhiều vòng QC NO-GO vì thiếu `*-rerun-*.md` | Bus/hook ghi tên file chưa tạo; không có script sinh artifact duy nhất |
| R4 | Strict gate FAIL vì 5175 vs 5173 | ENV drift xử lý như PRODUCT defect |
| R5 | GO WITH CONDITIONS lặp lại, user không tin «xong» | QC không phân tách **bounded scope GO** vs **program DONE** |

---

## 2) Three-layer model (triệt để)

```text
Layer A — Product truth (QA owns)
  L0 stack → L1 UAT → L2 matrix → L2.5 J-* → CRUD matrix
  FAIL = không READY_FOR_QC

Layer B — Evidence pack (automated, fail-closed)
  pnpm run qa:strict-minigate:crud  → 1 file MD
  QA bổ sung J-* + CRUD rows
  pnpm run verify:qc:evidence-pack -- --evidence <path>
  exit 0 = PM được dispatch QC

Layer C — QC audit (read-only + independent spot-check)
  QC KHÔNG chạy lại full suite trừ 1–2 lệnh spot (qc:dev-stack, 1 J-*)
  QC verify: pack pass + classification ENV vs PRODUCT + scope statement
  GO / GO WITH CONDITIONS / NO-GO với lý do 1 trang, không wave mơ hồ
```

---

## 3) Mandatory rules (effective immediately)

### QA — before `READY_FOR_QC`

1. Chạy `pnpm run qa:strict-minigate:crud` (hoặc wave script tương đương).
2. Điền J-* và CRUD matrix vào **cùng file** output.
3. Chạy `pnpm run verify:qc:evidence-pack -- --evidence <path>` → exit 0.
4. Ghi bus `ack_status: READY_FOR_QC` + **exact** `evidence_path`.

### PM — before dispatch QC

1. **Cấm** dispatch QC nếu `verify:qc:evidence-pack` chưa PASS.
2. Dispatch QC kèm `evidence_path` duy nhất (không list 4 file rời).

### QC — verdict rules

| Condition | Verdict |
|-----------|---------|
| Pack verify FAIL hoặc file missing | **NO-GO** (process) — reject to QA, không audit sản phẩm |
| PRODUCT command/J-*/CRUD FAIL | **NO-GO** — dispatch Dev |
| Chỉ ENV FAIL, stack PASS sau retry | **GWC** env note, không block product slice |
| Bounded slice PASS, program gates open | **GO WITH CONDITIONS** + explicit «NOT Phase 1 DONE» |
| L0–L2.5 + pack + no P0/P1 product | **GO** (scoped) |

**Cấm:** GO khi evidence chỉ có HTTP 200 / hook completed without file.

**Cấm:** NO-GO program-level khi chỉ thiếu artifact naming — fix process (Layer B).

---

## 4) Artifacts

| Artifact | Path |
|----------|------|
| Evidence pack template | `.cursor/templates/QC_EVIDENCE_PACK_TEMPLATE.md` |
| Pack verifier | `scripts/verify-qc-evidence-pack.mjs` |
| Auto minigate writer | `scripts/qa-strict-minigate-crud.mjs` |
| Cursor rule | `.cursor/rules/qc-evidence-pack-gate.mdc` |
| QC agent prompt | `.cursor/agents/qc.md` (§ Evidence pack gate) |
| Journey SoT | `docs/program/PROGRAM_JOURNEY_MAP.md` |
| UI matrix | `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` |

---

## 5) Commands (copy-ready)

```bash
# QA — one shot artifact
pnpm run qa:strict-minigate:crud

# QA — after filling J-* / CRUD in generated file
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-crud-qa-strict-minigate-YYYYMMDD.md

# QC spot-check (optional)
pnpm run qc:dev-stack
pnpm run qc:fe-be-health
```

---

## 6) Success metrics (4 weeks)

- **0** QC NO-GO solely for missing evidence filename (target: 0).
- **100%** QC dispatches reference pack that passed `verify:qc:evidence-pack`.
- User-reported P0 on in-scope J-* **≤1** per sprint after adoption.
- GO WITH CONDITIONS must state **scope boundary** in every verdict.

---

## 7) Not in scope of this reform

- Replacing human UAT sign-off for Phase 1 DONE (`phase1:gate`, G4/G5).
- Waiving security/production checklist.

---

## 8) Governance loop

After each user-visible QC miss → update this doc §1 table + `ROLE_SPRINT_IMPROVEMENT_LOG.md` QC row.
