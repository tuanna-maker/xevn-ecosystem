# BA-XBOS-SRS-BATECO-W1-SPINE-01 — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-XBOS-SRS-BATECO-W1-SPINE-01` |
| **from_role** | ba-docs |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-07-22 |
| **ack_status** | `PASS_TO_PM` |
| **queue** | `BMINUTES_MEMBER_SEQUENTIAL_QUEUE.md` #6 → ✅ |

---

## 0. Verdict

**W1 spine PASS (skeleton + 12 FR).** SoT khách tách giống HRM W1; **không** remaster 373 FR; **không** claim Phase1 / PROD / ecosystem 100%. TechSpec XBOS vẫn **`ref_srs` = 0** → SA follow-up.

---

## 1. Micro-checklist

| # | Item | Result |
|---|------|--------|
| 1 | Inventory XBOS spine UC ≤15 map BRD/UF | **PASS** — 12 UC trong `docs/xbos/UC_INVENTORY_BRD_SRS.md` |
| 2 | ADD-only SRS skeleton Ch.1–6 + FR 7 mục | **PASS** — `docs/client-delivery/xbos/SRS_XBOS_KHACH.md` + `BRD_XBOS_KHACH.md`; không wipe HTML 373 / UF 🟢 |
| 3 | Note TechSpec `ref_srs` gaps cho SA | **PASS** — §3 dưới + pointer đầu `docs/xbos/TECHSPEC.md` |
| 4 | Evidence path này | **PASS** |
| 5 | PASS_TO_PM + next_dispatch SA hoặc W2 | **PASS** — copy-ready §5 |

---

## 2. Deliverables

| Artifact | Path |
|----------|------|
| Inventory freeze | `docs/xbos/UC_INVENTORY_BRD_SRS.md` |
| BRD khách | `docs/client-delivery/xbos/BRD_XBOS_KHACH.md` |
| SRS khách Ch.1–6 + 12 FR | `docs/client-delivery/xbos/SRS_XBOS_KHACH.md` |
| Annex pointer | `docs/xbos/SRS.md` (đầu file) |
| TechSpec gap pointer | `docs/xbos/TECHSPEC.md` (đầu file) |

### Spine FR (12) ↔ UF

| FR / UC | UF |
|---------|-----|
| AUTH-01 | UF-XBOS-01 |
| TENANT-01 | UF-XBOS-01 · 11 |
| ECO-SCOPE-02 | UF-XBOS-11 |
| ORG-01 | UF-XBOS-02 |
| ORG-03 | UF-XBOS-03 · 06 |
| CC-P0-01 | UF-XBOS-04 · 05 |
| ORG-02 | UF-XBOS-12 |
| WF-01 · 03 · 04 | UF-XBOS-08 |
| CAT-02 · CAT-05 | UF-XBOS-15 · 09 |

**Leftover W2 (không viết thân):** RACI (UF-07), RBAC (UF-13), Catalog CC (UF-14), KPI (UF-10), CAT/WF reject & phụ, DM-*.

---

## 3. Gate §3.4.8 (skeleton W1)

| Check | Result |
|-------|--------|
| Body `## 4.` `## 5.` `## 6.` | **PASS** |
| E2E bảng trước §3 FR | **PASS** (§2.4) |
| Số Mã UC = số Kết quả trả về | **12 = 12 PASS** (script đếm) |
| sequenceDiagram / FR | **12 / 12** (+ 1 E2E tổng) |
| Prompt-echo / work_item trong narrative FR | **PASS** (meta chỉ inventory/evidence nội bộ) |
| Wipe 373 HTML / UF 🟢 | **PASS** — không đụng `02_SRS_XeVN_OS.html` |

---

## 4. TechSpec `ref_srs` gaps (SA)

| Gap ID | Mô tả | Owner |
|--------|--------|-------|
| G-REF-01 | `docs/xbos/TECHSPEC.md` — **0** dòng `ref_srs` khớp FR khách | sa |
| G-REF-02 | Map 12 spine → OpenAPI/DTO/endpoint (org, shareholders, org-units, auth/membership, workflow-engine, catalog-governance) | sa |
| G-REF-03 | `COMMAND_CENTER_P0_TECHSPEC.md` — gắn `ref_srs` FR-CC-P0-01 / ORG-03 / ORG-02; không mâu thuẫn UF 🟢 | sa |
| G-REF-04 | ECO-SCOPE: align ecosystem TechSpec với FR-ECO-SCOPE-02 | sa |

**Không** claim TechSpec đã khóa ở wave BA này.

---

## 5. completion_report

| | |
|--|--|
| **Closed** | Inventory 12 spine; BRD+SRS khách Bateco Ch.1–6; 12 FR đủ 7 mục + Kết quả trả về; pointer annex; TechSpec gap note; queue #6 ✅ |
| **Open** | SA `ref_srs`; W2 catalog (RACI/RBAC/KPI/CAT leftover…); HTML build khách XBOS (optional wave) |
| **Not claimed** | Phase1 DONE · PROD · ecosystem 100% · 97/373 remaster |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **next_owner** | `pm` → dispatch **`sa`** (ưu tiên) hoặc **`ba-docs` W2** |
| **ack_status** | `PASS_TO_PM` |
| **evidence_path** | `docs/qa/evidence/ba-xbos-srs-bateco-w1-spine-01-20260722.md` |

### next_dispatch_prompt — SA (ưu tiên sau W1)

```text
work_item_id: SA-XBOS-TECHSPEC-REF-SRS-01
from_role: pm
to_role: sa
lane: governance
priority: P1
entry_criteria: SRS_XBOS_KHACH.md v1.0-W1-SPINE (12 FR); UC_INVENTORY_BRD_SRS.md freeze; docs/xbos/TECHSPEC.md ref_srs=0
exit_criteria: Mỗi UC spine có ref_srs → FR khách; ghi endpoint/DTO khớp Kết quả trả về; residual gap có owner; không đè UF-XBOS 🟢; không claim Phase1
evidence_path: docs/qa/evidence/sa-xbos-techspec-ref-srs-01-YYYYMMDD.md
ack_status: PASS_TO_PM
cấm: apps/** rewrite · wipe FR khách · full 373
```

### next_dispatch_prompt — W2 catalog (song song sau SA hoặc khi PM chọn)

```text
work_item_id: BA-XBOS-SRS-BATECO-W2-CATALOG-01
from_role: pm
to_role: ba-docs
lane: governance
entry_criteria: W1 PASS evidence ba-xbos-srs-bateco-w1-spine-01; inventory planned_W2
exit_criteria: ADD FR 7 mục cho RACI-02 · CC-P0-04 · CC-P0-05 · KPI-03 (+ CAT/WF leftover ưu tiên UF); số Mã UC = Kết quả trả về; không wipe 12 FR W1 / UF 🟢
evidence_path: docs/qa/evidence/ba-xbos-srs-bateco-w2-catalog-01-YYYYMMDD.md
ack_status: PASS_TO_PM
cấm: full 373 · claim Phase1 · apps/**
```

### pm_dispatch_hint

Ưu tiên **SA-XBOS-TECHSPEC-REF-SRS-01** để đóng gap `ref_srs=0`; W2 ba-docs chỉ khi cần đủ UF-07/10/13/14 trên SRS khách.
