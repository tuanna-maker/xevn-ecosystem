# BA-U72-FIELD-DISPLAY-XBOS-SRS-01 — Field Display Spec XBOS (U72) · reclaim LANE B

| Field | Value |
|-------|-------|
| **work_item_id** | `BA-U72-FIELD-DISPLAY-XBOS-SRS-01` |
| **Date** | 2026-07-27 |
| **lane** | governance · ba-data · reclaim Claude LANE B · U72 |
| **change_mode** | ADD |
| **Sponsor** | U72 — định nghĩa hiển thị mọi field XBOS; không raw key |
| **ack_status** | `PASS_TO_PM` |
| **no_prompt_echo** | true |
| **preserve_default** | true |

---

## 1. Entry / read_first

| Artifact | Result |
|----------|--------|
| `docs/qa/evidence/ba-display-xbos-review-01-20260727.md` | Read — F-XBOS-01..11 + UNKNOWN (affiliate / legacy LF / publish status) + toast holding |
| `docs/qa/evidence/qc-xbos-u72-field-display-01-r2-20260727.md` | Read — **GWC**; AC-F-XBOS-01..11 · F-09/F-10 **CLOSED** local; **C-XBOS-U72-P2** soft OK; **cấm** reopen 🟢 |
| `docs/xbos/SRS_FIELD_DISPLAY.md` (prior ADD) | Present — F/H tables + AC; **thiếu** Catalog SoT đầy đủ + UNKNOWN 5-cột + GWC must_keep |
| `docs/xbos/SRS.md` §1.1 / §13 | Pointer FR-XBOS-U72-LABEL-01 — UPDATED catalog + GWC note |
| `docs/xbos/DB_DESIGN_XBOS_ORG_LEGAL.md` §2.3 | `business_lines` value contract |
| HRM `INDUSTRY_CATALOG_VI` (consumer mirror) | Keys → VI cho C-XBOS-BL |
| U72 rule | `.cursor/rules/display-label-no-raw-key.mdc` |

**cấm honored:** không wipe UC · không invent Phase1 · không `apps/**` · không seed · không reopen XBOS U72 GWC không có FAIL mới.

---

## 2. Deliverables (ADD this reclaim)

| Path | Nội dung ADD |
|------|----------------|
| **`docs/xbos/SRS_FIELD_DISPLAY.md`** | Banner GWC must_keep; **§3.1 Catalog SoT** C-XBOS-ET / C-XBOS-BL / C-XBOS-LF (5 cột + full label VI); **§3.2** U-XBOS-01..04 + R-XBOS-P2-*; **§4.3b** AC-C-* / AC-U-*; handoff «no Dev reopen GWC» |
| **`docs/xbos/SRS.md` §13** | Phạm vi + AC tóm tắt catalog / UNKNOWN / GWC |
| **Evidence (this file)** | Coverage + handoff PASS_TO_PM |

**Không** đè / reopen bảng F-XBOS-01..11 đã GWC (must_keep). Soft toast `(holding)` = **U-XBOS-04** / C-XBOS-U72-P2 — không đổi AC-F-XBOS-10 CLOSED.

---

## 3. Coverage check

| Inventory / residual | Spec |
|----------------------|------|
| F-XBOS-01..11 (GWC CLOSED) | §2 retained — **must_keep**; không dispatch FE reopen |
| `entity_type` catalog | **C-XBOS-ET** §3.1 — holding/subsidiary/parent/affiliate/associate/division/department/org_unit |
| `business_lines` catalog | **C-XBOS-BL** §3.1 — 12 keys VI + free-text + blocklist → «—» |
| `legal_form` / `enterpriseType` | **C-XBOS-LF** §3.1 — joint-stock / llc-* / state-owned + legacy jsc/llc/sole |
| Toast «holding» soft | **U-XBOS-04** — VI copy; soft P2 không reopen F-10 |
| UNKNOWN affiliate / legacy LF / publish status | **U-XBOS-01..03** |
| Soft P2 dataType EN / job_titles paren | **R-XBOS-P2-01/02** (GWC condition OK) |

### Dictionary SoT (tóm tắt khóa)

| Catalog | Label VI (mẫu) |
|---------|----------------|
| entity_type `holding` | Tập đoàn / (CC) Công ty mẹ qua `parent` |
| entity_type `subsidiary` | Công ty thành viên / (CC) Công ty con |
| business_lines `tourism` | Du lịch - Khách sạn |
| business_lines `logistics` | Vận tải - Logistics |
| enterpriseType `joint-stock` | Công ty cổ phần |
| legacy `jsc` | Công ty cổ phần (= joint-stock) |

---

## 4. Validation / error expectations (deterministic)

| Rule | Condition | Expected |
|------|-----------|----------|
| VAL-XBOS-ET-01/02 | UI cấp bậc/org hoặc cột ngành | VI dictionary; không entity_type làm ngành |
| VAL-XBOS-LF-01/02 | Loại hình DN | VI; không `joint-stock`/`jsc` raw |
| BR-U72-NULL-01 | miss map / null | **«—»** |
| BR-XBOS-COPY-01 | Toast / panel | Không EN `holding` user-facing |
| Wire OK | Network `companyId=holding` | **Allowed** (C-XBOS-U72-WIRE-OK) — không FAIL display |

---

## 5. completion_report

**Closed**

- Reclaim LANE B: ADD Catalog SoT 5-cột cho `entity_type`, `business_lines`, `legal_form` (C-XBOS-ET/BL/LF) với label VI đầy đủ.
- ADD UNKNOWN + soft residual tables U-XBOS-01..04 + R-XBOS-P2-* (toast holding / dataType EN / job_titles paren) — **không** reopen GWC 🟢 F-XBOS-01..11 / F-09 / F-10.
- AC-C-XBOS-* / AC-U-XBOS-* + cập nhật pointer `docs/xbos/SRS.md` §13.
- Evidence path này → **PASS_TO_PM**.

**Residual**

- **C-XBOS-U72-P2** soft (toast holding ngoài Apply, dataType EN, job_titles paren) — GWC **condition OK**; **không** mở Dev trừ sponsor ưu tiên.
- HOLD_DEPLOY / NOT Phase1 / NOT PROD / NOT :8088 — stands (QC).
- U-XBOS-01 associate parity — spot nếu live FAIL; chưa có FAIL mới → không Dev.

**FE residual after GWC:** không còn P0 FAIL mở bắt buộc → **không** `next_dispatch` Dev-FE trong wave này.

---

## 6. next_owner

**pm**

### next_dispatch_prompt

```text
work_item_id: PM-XBOS-U72-CATALOG-SOT-INTAKE-01
from_role: ba-data
to_role: pm
lane: governance · intake after BA reclaim LANE B
entry_criteria:
  - Evidence: docs/qa/evidence/ba-u72-field-display-xbos-srs-01-20260727.md PASS_TO_PM
  - Spec ADD: docs/xbos/SRS_FIELD_DISPLAY.md §3.1 Catalog SoT (entity_type / business_lines / legal_form) + §3.2 UNKNOWN/soft
  - QC GWC R2 stands: docs/qa/evidence/qc-xbos-u72-field-display-01-r2-20260727.md — F-XBOS-01..11 CLOSED; C-XBOS-U72-P2 soft OK
exit_criteria:
  1) Bus INTAKE catalog SoT closed; index evidence nếu cần
  2) Do NOT dispatch Dev-FE for GWC-closed F-09/F-10/F-01..11
  3) Soft P2 (U-XBOS-04 / R-XBOS-P2-*) chỉ mở Dev khi sponsor ưu tiên tường minh
  4) Keep HOLD_DEPLOY · no Phase1/PROD/:8088 claim
evidence_path: docs/qa/evidence/ba-u72-field-display-xbos-srs-01-20260727.md
cấm: seed · reopen GWC 🟢 · apps/** từ PM
```

> **Không** kèm parallel `D-XBOS-LABEL-FE-*` — residual FE P0 không mở sau GWC.

---

## 7. Handoff packet

```yaml
work_item_id: BA-U72-FIELD-DISPLAY-XBOS-SRS-01
from_role: ba-data
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/ba-u72-field-display-xbos-srs-01-20260727.md
completion_report: |
  Closed reclaim: Catalog SoT VI for entity_type / business_lines / legal_form (§3.1);
  UNKNOWN+soft U-XBOS-01..04 + R-P2; GWC F-XBOS-01..11 must_keep; no apps/seed.
  Residual soft P2 defer; no Dev-FE dispatch required.
next_owner: pm
next_dispatch_prompt: |
  work_item_id: PM-XBOS-U72-CATALOG-SOT-INTAKE-01
  role: pm
  entry_criteria: ba-u72-field-display-xbos-srs-01-20260727.md; SRS_FIELD_DISPLAY §3.1–§3.2; QC GWC R2 stands
  exit_criteria: INTAKE; no Dev reopen GWC 🟢; soft P2 only if sponsor prioritizes; HOLD_DEPLOY
```
