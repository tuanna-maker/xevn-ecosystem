# BA-XBOS-SRS-BATECO-W2-CATALOG-01 — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-XBOS-SRS-BATECO-W2-CATALOG-01` |
| **from_role** | ba-docs |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-07-22 |
| **ack_status** | `PASS_TO_PM` |
| **queue** | `BMINUTES_MEMBER_SEQUENTIAL_QUEUE.md` #15 → ✅ |

---

## 0. Verdict

**W2 catalog batch PASS (4 FR ADD).** SRS khách **v1.0-W2-CATALOG** = **16 FR** (12 W1 giữ nguyên + 4 W2). Đủ UF-XBOS-07 / 10 / 13 / 14 trên thân FR. **Không** remaster 373; **không** claim Phase1 / PROD. TechSpec `ref_srs` cho 4 FR W2 → SA follow-up.

---

## 1. Micro-checklist

| # | Item | Result |
|---|------|--------|
| 1 | List W2 FR targets (RACI · RBAC · KPI · CAT/CC) — không wipe 12 FR W1 | **PASS** — §2 dưới |
| 2 | ADD FR 7 mục + Kết quả trả về (batch UF-07/10/13/14) | **PASS** — §3.13–3.16 `SRS_XBOS_KHACH.md` |
| 3 | Inventory `planned_W2` → `body_ready` cho 4 UC | **PASS** — `UC_INVENTORY_BRD_SRS.md` v1.0-W2-CATALOG |
| 4 | Evidence path này | **PASS** |
| 5 | PASS_TO_PM → `SA-XBOS-TECHSPEC-W2-REF-01` | **PASS** — §5 |

---

## 2. W2 FR targets (batch tối thiểu)

| FR | Mã UC | UF | Nhóm |
|----|-------|-----|------|
| FR-XBOS-RACI-02 | UC-RACI-02 (alias UC-CC-RACI) | UF-XBOS-07 | RACI |
| FR-CC-P0-04 | UC-CC-P0-04 | UF-XBOS-13 | RBAC Settings |
| FR-CC-P0-05 | UC-CC-P0-05 | UF-XBOS-14 | Catalog CC autosave |
| FR-XBOS-KPI-03 | UC-XBOS-KPI-03 | UF-XBOS-10 | KPI rollup |

**Giữ nguyên W1 (12):** AUTH-01 · TENANT-01 · ECO-SCOPE-02 · ORG-01 · ORG-03 · CC-P0-01 · ORG-02 · WF-01 · WF-03 · WF-04 · CAT-02 · CAT-05.

**Leftover → `planned_W3`:** CAT-01/03/04/06/07 · WF-02/05/06 · RACI-01/03..06 · DM-*.

---

## 3. Deliverables

| Artifact | Path |
|----------|------|
| SRS khách v1.0-W2-CATALOG | `docs/client-delivery/xbos/SRS_XBOS_KHACH.md` |
| BRD khách v1.0-W2 | `docs/client-delivery/xbos/BRD_XBOS_KHACH.md` |
| Inventory | `docs/xbos/UC_INVENTORY_BRD_SRS.md` |
| Annex pointer | `docs/xbos/SRS.md` (đầu file) |
| TechSpec gap note W2 | `docs/xbos/TECHSPEC.md` (đầu file) |
| Queue #15 | `docs/program/BMINUTES_MEMBER_SEQUENTIAL_QUEUE.md` ✅ |

### Gate §3.4.8 (script đếm)

| Check | Result |
|-------|--------|
| Body `## 4.` `## 5.` `## 6.` | **PASS** |
| FR headers | **16** |
| Mã UC = Kết quả trả về | **16 = 16 PASS** |
| sequenceDiagram | **17** (16 FR + 1 E2E tổng) |
| Prompt-echo / work_item / Phase1 / 373 trong narrative FR | **PASS** (grep sạch trên SRS khách) |
| Wipe 12 FR W1 / UF 🟢 / apps/** | **PASS** — ADD-only |

---

## 4. completion_report

| | |
|--|--|
| **Closed** | 4 FR W2 đủ 7 mục + Kết quả trả về; BRD Yêu cầu-09..12; inventory body_ready; queue #15 ✅; TechSpec pointer W2 gap |
| **Open** | SA `ref_srs` 4 FR W2; leftover CAT/WF/RACI sâu (`planned_W3`); HTML build khách XBOS (optional) |
| **Not claimed** | Phase1 DONE · PROD · ecosystem 100% · 97/373 remaster |

---

## 5. Handoff

| Field | Value |
|-------|--------|
| **next_owner** | `pm` → dispatch **`sa`** |
| **ack_status** | `PASS_TO_PM` |
| **evidence_path** | `docs/qa/evidence/ba-xbos-srs-bateco-w2-catalog-01-20260722.md` |

### next_dispatch_prompt

```text
work_item_id: SA-XBOS-TECHSPEC-W2-REF-01
from_role: pm
to_role: sa
lane: governance
priority: P1
queue: docs/program/BMINUTES_MEMBER_SEQUENTIAL_QUEUE.md #17
entry_criteria: SRS_XBOS_KHACH.md v1.0-W2-CATALOG (16 FR); evidence ba-xbos-srs-bateco-w2-catalog-01-20260722; W1 ref_srs §14 đã có (SA-XBOS-TECHSPEC-REF-SRS-01)
exit_criteria: ref_srs + endpoint/DTO cho FR-XBOS-RACI-02 · FR-CC-P0-04 · FR-CC-P0-05 · FR-XBOS-KPI-03 khớp Kết quả trả về; không đè 12 FR W1 / UF-XBOS 🟢; residual gap có owner
evidence_path: docs/qa/evidence/sa-xbos-techspec-w2-ref-01-YYYYMMDD.md
ack_status: PASS_TO_PM
cấm: apps/** rewrite · wipe FR khách · full 373 · claim Phase1/PROD
```

### pm_dispatch_hint

Dispatch **SA-XBOS-TECHSPEC-W2-REF-01** ngay (queue #17). Không cần ba-docs W3 trừ khi PM muốn CAT/WF leftover.
