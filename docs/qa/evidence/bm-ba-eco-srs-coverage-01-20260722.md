# BM-BA-ECO-SRS-COVERAGE-01 — Ecosystem SRS coverage heatmap

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-BA-ECO-SRS-COVERAGE-01` |
| **from_role** | ba-docs |
| **to_role** | pm |
| **lane** | governance |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **date** | 2026-07-22 |
| **ack_status** | `PASS_TO_PM` |
| **question** | «SRS đủ hết case toàn hệ sinh thái chưa?» |

---

## 0. Verdict (sponsor one-liner)

**Chưa đủ 100%.** Ecosystem có **373 FR** trong SRS HTML (`pnpm docs:srs:audit` → **373/373** cấu trúc 7 mục) và Phase 1 matrix **245/245** FR “Có”, nhưng đó là **lớp số lượng / generator**. Chuẩn khách Bateco sâu (inventory + E2E + FR đồng nhất + `ref_srs`) **chỉ khóa spine HRM 44 FR** — **GWC skeleton**, không phải catalog HRM 120/119 đầy đủ. XBOS / Command Center / portal embed / mobile **không** có đợt remaster Bateco tương đương. **Không** claim Phase 1 DONE / PROD từ evidence này.

---

## 1. Hai lớp đọc SRS (cấm gộp)

| Lớp | Nghĩa | Trạng thái |
|-----|--------|------------|
| **A — Quantity / generator** | Mỗi mã UC catalog có khối FR trong `02_SRS_XeVN_OS.html`; audit 7 tiêu đề mục | **PASS** 373/373 (`docs:srs:audit` 2026-07-22) · Phase1 ma trận 245 FR “Có” |
| **B — Bateco remaster depth** | BRD Yêu cầu→inventory · Ch.1–6 · E2E spine · FR 7 mục + Kết quả trả về · TechSpec `ref_srs` · UF map | **PARTIAL / GWC** — chỉ HRM khách **44 FR** (`SRS_HRM_KHACH.md` v3.0-W2c) · XBOS TechSpec **`ref_srs` = 0** |

Sponsor hỏi “đủ hết case” theo **lớp B** → trả lời **không**. Lớp A đủ số → **không** đồng nghĩa nghiệp vụ khách đã remaster xong.

---

## 2. Heatmap modules

Legend cột:

| Ký hiệu | Nghĩa |
|---------|--------|
| ✅ | Đủ / khóa cho phạm vi cột |
| 🟡 | Một phần / GWC / pattern-only |
| ❌ | Thiếu hoặc chưa remaster |
| ⚪ | Ngoài nghiệm thu web :8088 / Phase 2 |

| Module | BRD YC mapped? | SRS FR (lớp A) | SRS Bateco sâu (lớp B) | TechSpec `ref_srs`? | Code sample? | QA UF? |
|--------|----------------|----------------|-------------------------|---------------------|--------------|--------|
| **XBOS org** (ORG-01..03, CC legal/dept) | 🟡 BRD hệ + BRD XBOS; **không** inventory Bateco riêng | ✅ FR trong HTML 373 | ❌ chưa remaster Bateco | ❌ `docs/xbos/TECHSPEC.md` **0** `ref_srs` | ✅ controllers org/shareholders/dept | ✅ UF-XBOS-02..06,12 |
| **XBOS catalog / DM** (DM-*, CAT-*) | 🟡 BRD hệ (183 DM); CAT có trong Phase1 | ✅ | ❌ | 🟡 module TECHSPEC_HE §7–8; chi tiết **Một phần** nhiều dòng matrix | ✅ catalog-governance / settings | ✅ UF-XBOS-09,14,15 |
| **XBOS WF** (WF-01..06, 13/14) | 🟡 | ✅ | ❌ | 🟡 endpoint một phần | ✅ workflow-engine | ✅ UF-XBOS-08 |
| **Command Center / portal** (CC-P0, RACI, ECO-SCOPE, AUTH) | 🟡 BRD hệ § phạm vi | ✅ | ❌ | 🟡 TECHSPEC_HE §8; nhiều **Một phần** | ✅ web-portal + xbos-api | ✅ UF-XBOS-01,07,10,11,13 |
| **HRM (khách 44 FR)** | ✅ Yêu cầu-01..30 → inventory; **Cao body_ready** | ✅ (ecosystem + khách) | 🟡 **44/120** = **GWC skeleton** (W1–W2c) | 🟡 **44** mã FR nêu trong `docs/hrm/TECHSPEC.md` (độ sâu API **PARTIAL/ALIGNED** theo FR) | ✅ hrm-api + embed | ✅ UF-HRM-01..06,09..13,16 + MENU load |
| **HRM leftover catalog** (76 UC ngoài 44) | 🟡 primary map / `planned_W2` còn 5 YC TB–Thấp | ✅ lớp A (nếu trong 373/119) | ❌ chưa FR khách 7 mục | ❌ / mỏng | 🟡 lệch FR | 🟡 MENU load ≠ mutate UF |
| **Portal embed HRM** | ✅ YC-22 slice (FR-20/21/23) | ✅ | 🟡 slice W2c; leftover tab embed | 🟡 qua FR embed | ✅ iframe embed | ✅ J-HRM-* / UF-HRM-* |
| **Mobile ESS** | ✅ YC-23; FR-MOB-01/04/06/08 | ✅ M06 15 UC Phase1 | 🟡 **4/15** FR khách; team `SRS_MOBILE` có body rộng hơn | 🟡 `TECHSPEC_MOBILE` | ✅ hrm-mobile | ⚪ UF-HRM-07/08 ngoài :8088; J-MOB có evidence riêng |
| **Logistic nghiệp vụ (Phase 2)** | ✅ BRD Phụ lục / 128 UC | ✅ trong **373** FR | ❌ không remaster vận hành | ❌ / pattern DM-LOG | ⚪ chưa go-live P1 | ⚪ không UF nghiệm thu P1 |

**Nguồn đếm chính:** `docs/hrm/UC_INVENTORY_BRD_SRS.md` · `docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` · `docs/client-delivery/hrm/SRS_HRM_KHACH.md` · audit `373/373`.

---

## 3. Explicit locks (sponsor)

1. **HRM 44 FR Cao = GWC skeleton** — Ch.1–6 PASS; catalog đầy đủ **120** UC = đợt sau (W2d leftover). Yêu cầu Cao primary đã `body_ready`; leftover mã UC trong nhóm Cao vẫn thiếu FR khách (EM-02..05, MD-02..05, IM-02..04, MOB còn lại, embed 22/24.., CI/SC/RC/PR/PF dư).  
2. **Ecosystem NOT 100%** — 373 FR generator ≠ remaster Bateco toàn hệ; XBOS **0** `ref_srs`; TechSpec chi tiết **~85 UC “Một phần”** trên Phase1 matrix.  
3. **Không** Phase1 DONE / PROD-READY từ coverage docs alone.

---

## 4. Top 10 missing high-priority UC (ngoài HRM spine 44)

Ưu tiên: nghiệp vụ điều hành tập đoàn / nền tảng đã có UF hoặc ảnh hưởng HRM, nhưng **thiếu FR Bateco sâu + `ref_srs`**.

| # | Mã UC | Lý do ưu tiên | Gap chính |
|---|-------|---------------|-----------|
| 1 | `UC-XBOS-ORG-01` | Cây pháp nhân / đơn vị — nền mọi scope | Lớp B ❌ · `ref_srs` ❌ |
| 2 | `UC-XBOS-ORG-03` / `UC-CC-03`·`04` | Hồ sơ pháp nhân + cổ đông (UF-XBOS-03..05) | FR generator mỏng · TechSpec partial |
| 3 | `UC-XBOS-ORG-02` / `UC-CC-P0-03` | Phòng ban CRUD (UF-XBOS-12) | Chưa remaster Bateco |
| 4 | `UC-XBOS-WF-01` + `WF-03`/`WF-04` | Canvas + khởi tạo + duyệt (UF-XBOS-08) | Chưa spine Bateco WF |
| 5 | `UC-XBOS-CAT-01`..`05` | Duyệt danh mục HRM (UF-XBOS-09/15) — XBOS→HRM | Matrix “Một phần” · không `ref_srs` XBOS |
| 6 | `UC-RACI-02` (+ `UC-CC-P0-04`) | Ma trận RACI / RBAC (UF-XBOS-07/13) | Depth FR + TechSpec partial |
| 7 | `UC-ECO-SCOPE-01` / `02` | Phạm vi đăng nhập / tenant — ADR scope ladder | TechSpec **Một phần** · không remaster |
| 8 | `UC-XBOS-AUTH-01` + `UC-XBOS-TENANT-01` | Login portal + membership (UF-XBOS-01/11) | Chưa FR khách Bateco riêng module |
| 9 | `XBOS-DM-03` / `DM-12`·`13` | Thêm giá trị DM + gửi/duyệt thay đổi nhạy cảm | Pattern API · thiếu DB/API design theo UC |
| 10 | `UC-XBOS-KPI-03` / `UC-XBOS-DASH-01` | Rollup KPI CC (UF-XBOS-10) | TechSpec partial · chưa remaster |

**Ngoài top 10 (ghi nhận, không xếp P0 remaster P1):** `XBOS-DM-LOG-*` (22) + **128** UC Logistic Phase 2 — có trong 373 FR nhưng **không** go-live P1; `UC-XBOS-16` / AR / AST (tài sản 5 bước) — TechSpec partial.

**HRM leftover (không đếm vào top 10 “ngoài spine” nhưng W2d):** EM-02..05, MD-02..05, IM-02..04, MOB-02/03/05/…, UC-HRM-22/24..27, CI/SC/RC/PR/PF dư — xem inventory §5–§7.

---

## 5. Recommended waves only (không rewrite HTML toàn hệ)

| Wave | Owner | Mục tiêu |
|------|-------|----------|
| **W2d** (HRM) | ba-docs (+ ba-process inventory) | ADD leftover Trung bình/Thấp + leftover embed/MOB/EM/CI/SC… — **không wipe** 44 FR / AC-ATT-SHEET |
| **XBOS remaster W1** | ba-docs | Inventory BRD XBOS/CC Yêu cầu → UC; skeleton khách ORG+AUTH+SCOPE+WF spine (mirror HRM W1) |
| **XBOS remaster W2** | ba-docs | CAT + DM + RACI + KPI/DASH FR sâu |
| **SA TechSpec** | sa | Sau mỗi batch: `ref_srs` XBOS/CC (hiện **0**) |
| **QC** | qc | Gate GWC skeleton từng module — **không** GO Phase1 từ docs |

**Cấm wave này:** wipe FR · HTML full rewrite · `apps/**` · claim Phase1/PROD.

---

## 6. Evidence commands / artifacts read

```text
pnpm docs:srs:audit  → 373/373 pass (100.0%)
```

| Artifact | Role |
|----------|------|
| `docs/hrm/UC_INVENTORY_BRD_SRS.md` | HRM 30 YC · 120 UC · **44** FR · planned_W2 |
| `docs/client-delivery/hrm/SRS_HRM_KHACH.md` | SoT khách HRM v3.0-W2c |
| `docs/program/HRM_SPEC_REMASTER_BATECO_PROGRAM.md` | Remaster program · W5 no Phase1 claim |
| `docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md` | 245 UC · TechSpec partial ~85 |
| `docs/ecosystem/BRD_TONG_HOP_HE_SINH_THAI_XEVN.md` | 373 UC · P1 245 · P2 Logistic 128 |
| `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` | UF-XBOS-01..15 · UF-HRM web · mobile ⚪ |
| `docs/xbos/TECHSPEC.md` | **0** `ref_srs` |
| `docs/hrm/TECHSPEC.md` | 44 mã FR nêu + depth PARTIAL/ALIGNED |
| Prior | `docs/qa/evidence/ba-hrm-spec-quality-audit-01-20260721.md` |

---

## 7. completion_report

| | |
|--|--|
| **Closed** | Heatmap coverage ecosystem (XBOS org/catalog/WF/CC · HRM 44 · embed · mobile · Logistic P2 note); explicit **NOT 100%** + HRM **44 = GWC skeleton**; top 10 UC ngoài HRM spine; recommend **W2d + XBOS remaster** only; evidence path này. |
| **Open** | Chưa mở Task remaster XBOS / W2d trong wave này (PM dispatch). |
| **Not claimed** | Phase1 DONE · PROD-READY · “SRS đủ hết case”. |

---

## 8. next_owner / next_dispatch_prompt

**next_owner:** `pm`

```text
work_item_id: BM-BA-ECO-SRS-COVERAGE-01
from_role: ba-docs
ack_status: PASS_TO_PM
evidence: docs/qa/evidence/bm-ba-eco-srs-coverage-01-20260722.md

PM INTAKE:
1) Brief sponsor: SRS ecosystem NOT 100% — 373 FR generator PASS ≠ Bateco remaster; HRM 44 FR = GWC skeleton; XBOS ref_srs=0.
2) Do NOT claim Phase1/PROD.
3) Dispatch (parallel ≤2 when ready):
   A) BA-HRM-SRS-BATECO-W2D-LEFTOVER-01 (ba-docs) — ADD leftover HRM catalog only; no wipe 44 FR.
   B) BA-XBOS-SRS-BATECO-W1-SPINE-01 (ba-docs) — inventory + skeleton ORG/AUTH/SCOPE/WF; mirror HRM W1; no HTML wipe 373.
4) After XBOS W1: SA-XBOS-TECHSPEC-REF-SRS-01 (sa) — add ref_srs for spine UC.
5) Optional QC: QC-ECO-SRS-COVERAGE-GWC-01 — audit heatmap wording only.

entry_criteria: evidence BM-BA-ECO-SRS-COVERAGE-01 PASS_TO_PM
exit_criteria: bus DISPATCHED ≥1 remaster wave OR explicit defer_reason on backlog
cấm: wipe FR · claim Phase1 · apps/**
```

---

## 9. Handoff fields

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-BA-ECO-SRS-COVERAGE-01` |
| **from_role** | ba-docs |
| **to_role** | pm |
| **entry_criteria** | PM narrow inventory heatmap — no full SRS rewrite |
| **exit_criteria** | Heatmap + top 10 + explicit NOT 100% / GWC 44 + recommend W2d/XBOS only |
| **evidence_path** | `docs/qa/evidence/bm-ba-eco-srs-coverage-01-20260722.md` |
| **ack_status** | `PASS_TO_PM` |
| **pm_dispatch_hint** | `BA-XBOS-SRS-BATECO-W1-SPINE-01` + `BA-HRM-SRS-BATECO-W2D-LEFTOVER-01` |
