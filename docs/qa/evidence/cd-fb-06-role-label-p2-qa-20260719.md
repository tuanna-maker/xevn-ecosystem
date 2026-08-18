# QA — CD-FB-06-ROLE-LABEL-P2 — subsidiary_ceo VI chip — 2026-07-19

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-06-ROLE-LABEL-P2` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **entry** | `docs/qa/evidence/cd-fb-06-role-label-p2-20260719.md` READY_FOR_QA |
| **parent_f3** | `docs/qa/evidence/cd-fb-06-role-switch-qc-20260719.md` (GWC) · residual `R-CD-FB-06-01` |
| **spec_ref** | AC-CD-F3-01 (narrow label polish only) · R-CD-FB-06-01 |
| **sponsor_lock** | U65 zero-seed · no Phase1/PROD · no reopen AC-CD-F3-02..06 without regression |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-07-19 |

---

## Verdict

**PASS_TO_PM** — Narrow browser smoke closed **R-CD-FB-06-01**: `du-lich.ceo@xe.vn` JWT `roleCode=subsidiary_ceo` renders VI chip **TGĐ công ty thành viên** (not English `subsidiary ceo`). `ceo@xe.vn` chip remains **Tổng giám đốc tập đoàn** (`group_ceo`). No seed. Did **not** re-execute AC-CD-F3-02..06 / J-HRM-INT-05 (out of narrow slice; F3 green ACs untouched).

**Not** Phase 1 DONE / **not** PROD-READY.

---

## Environment

| Item | Value |
|------|-------|
| L0 | `pnpm run qc:dev-stack` — hrm `:28001` + xbos `:28002` + portal `:5173` **HTTP 200** (Windows UV assert after healthy print — known ENV flake, not product) |
| Portal | `http://127.0.0.1:5173` |
| Personas | `du-lich.ceo@xe.vn` / `Xevn@2026` · `ceo@xe.vn` / `Xevn@2026` |
| Seed | **None** (U65) |

---

## AC / exit matrix (narrow)

| Exit / AC | Expect | Evidence | Verdict |
|-----------|--------|----------|---------|
| **R-CD-FB-06-01** / member chip | VI «TGĐ công ty thành viên»; not English `subsidiary ceo` | Login member → `/command-center/hrm/employees`; portal + iframe chips; JWT decode `roleCode=subsidiary_ceo` | **PASS** |
| **group_ceo regression** | Chip «Tổng giám đốc tập đoàn» unchanged vs F3 PASS | Login group CEO → same route; JWT `roleCode=group_ceo` | **PASS** |
| **AC-CD-F3-02..06** | Do not reopen without regression proof | Not re-run (narrow label-only) | **N/A** — prior F3 QA/QC stand |

---

## Click paths (U65 browser)

### A. Member CEO — VI label (primary)

1. Clear storage → `http://127.0.0.1:5173/login`
2. Login `du-lich.ceo@xe.vn` / `Xevn@2026` → Command Center
3. Navigate `http://127.0.0.1:5173/command-center/hrm/employees`
4. **Observe** scope chips:
   - Tenant: **Công ty TNHH Du lịch X.E Việt Nam**
   - Role: **TGĐ công ty thành viên** (portal bar + iframe «Ngữ cảnh»)
5. **Assert** body has **no** `/subsidiary\s*ceo/i`
6. JWT decode (localStorage): `roleCode=subsidiary_ceo` · `tenantId=xe-du-lich` · `companyId=main` · email `du-lich.ceo@xe.vn`

**FE after:** Chip VI bound despite SoT role code `subsidiary_ceo` — closes English fallback.

### B. Group CEO — regression smoke

1. Clear storage → login `ceo@xe.vn` / `Xevn@2026`
2. Navigate `/command-center/hrm/employees`
3. **Observe** chips: **Tập đoàn XeVN** · **Tổng giám đốc tập đoàn**
4. JWT: `roleCode=group_ceo` · `tenantId=xevn` · `companyId=main`
5. **Assert** no English `group ceo` / `subsidiary ceo`; member VI string not shown

---

## Residual

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| — | — | **R-CD-FB-06-01 closed** | — |
| **R-CD-FB-06-02** | Info | AC-CD-F3-04 multi-hat still N/A (unchanged from F3 GWC **C-CD-FB-06-01**) | defer — no seed |

---

## command_table

| Command | Exit / result |
|---------|----------------|
| `pnpm run qc:dev-stack` | Healthy lines **200** ×3; process UV assert after (ENV flake) |
| Browser U65 (no seed) | Member VI chip + group regression **PASS** |

---

## L2.5 / J-*

Narrow polish — **no** new J-* required. Parent F3 **J-HRM-INT-05** remains as previously PASS; not re-executed this wave.

---

## completion_report

Closed `CD-FB-06-ROLE-LABEL-P2`: browser proved `subsidiary_ceo` → **TGĐ công ty thành viên** for `du-lich.ceo@xe.vn`; `group_ceo` chip unchanged for `ceo@xe.vn`. Residual R-CD-FB-06-01 **closed**. Did not reopen AC-CD-F3-02..06. No seed. No Phase1/PROD claim.

## next_owner

pm (optional: qc close GWC residual note on R-CD-FB-06-01)

## next_dispatch_prompt

```text
work_item_id: CD-FB-06-ROLE-LABEL-P2
from_role: pm
to_role: qc
entry_criteria: docs/qa/evidence/cd-fb-06-role-label-p2-qa-20260719.md PASS_TO_PM; closes R-CD-FB-06-01 on parent F3 GWC
exit_criteria: QC acknowledge residual closed; do not reopen AC-CD-F3-02..06; no Phase1/PROD claim
evidence_path: docs/qa/evidence/cd-fb-06-role-label-p2-qc-20260719.md (or annotate parent qc)
ack_status: PASS_TO_PM
cấm: seed · reopen F3 green ACs without regression
```

## ack_status

**PASS_TO_PM**
