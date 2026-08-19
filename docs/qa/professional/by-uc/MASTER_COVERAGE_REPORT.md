# Master Coverage Report — UC × Test Case × Code readiness

| Meta | Value |
|------|--------|
| **Doc ID** | `PO-UC-TC-MASTER-REPORT-01` |
| **Updated** | 2026-08-04T08:30+07:00 (**W2 FINAL**) |
| **work_item_id** | `PO-UC-TC-W2-SYNTH-01` |
| **Program** | `docs/program/PO_FULL_ECOSYSTEM_UC_TC_PROGRAM.md` |
| **Inventory** | `docs/qa/professional/by-uc/_INVENTORY_PHASE1.md` — **245** UC |
| **Evidence** | `docs/qa/evidence/po-uc-tc-w2-synth-01.md` |
| **uat_done** | **false** |
| **phase1_product_done** | **false** |
| **design_complete_w1** | **true** (6/6 squads READY_FOR_SYNTH) |

---

## 1. Executive (Sponsor U86)

| Metric | Value |
|--------|------:|
| UC Phase 1 (inventory) | **245** |
| UC files `by-uc/<UC-ID>.md` | **245** |
| Missing UC files | **0** |
| Tổng **cases_designed** (manifest Σ) | **3334** |
| Unique TC-ID strings (corpus scan) | **3281** |
| Cross-file TC-ID collisions | **0** |
| W1 squads READY_FOR_SYNTH | **6 / 6** |
| W2 Synth | **CLOSED** |
| UAT / Phase1 product DONE | **false** (cấm claim) |

**Kết luận honest:** Toàn bộ 245 UC đã có design pack + cây case. Đây là **thiết kế kiểm thử**, không phải nghiệm thu FE (U65) và **không** = sản phẩm đã đúng hết / UAT DONE / Phase1 DONE.

Arithmetic verified (pre-dedupe = final, no case rows removed):

`374 + 267 + 302 + 192 + 1236 + 963 = 3334`

---

## 2. Theo squad W1

| Squad | STT | UC | Cases designed | Status |
|-------|-----|---:|---------------:|--------|
| W1-S1-XBOS-CORE | 1–40 | 40 | **374** | READY_FOR_SYNTH |
| W1-S2-XBOS-ORG-WF | 41–80 | 40 | **267** | READY_FOR_SYNTH |
| W1-S3-XBOS-CAT-TAIL | 81–97 · 367–373 | 24 | **302** | READY_FOR_SYNTH |
| W1-S4-DM-LOG | 98–119 | 22 | **192** | READY_FOR_SYNTH |
| W1-S5-HRM-A | 248–300 | 53 | **1236** | READY_FOR_SYNTH |
| W1-S6-HRM-B-MOB | 301–366 | 66 | **963** | READY_FOR_SYNTH |
| **Sum** | | **245** | **3334** | **W1 CLOSED** |

Manifest SoT:

- `_squad/W1-S1-XBOS-CORE_MANIFEST.md`
- `_squad/W1-S2-XBOS-ORG-WF_MANIFEST.md`
- `_squad/W1-S3-XBOS-CAT-TAIL_MANIFEST.md`
- `_squad/W1-S4-DM-LOG_MANIFEST.md`
- `_squad/W1-S5-HRM-A_MANIFEST.md`
- `_squad/W1-S6-HRM-B-MOB_MANIFEST.md`

---

## 3. code_readiness rollup (UC count — design-time)

Nguồn: hàng `code_readiness` trên từng manifest (không suy từ `e2e_pass` matrix).

| Verdict | S1 | S2 | S3 | S4 | S5 | S6 | **Σ** |
|---------|---:|---:|---:|---:|---:|---:|----:|
| LIKELY_IMPL | 38 | 27 | 11 | 0 | 41 | 33 | **150** |
| LIKELY_PARTIAL | 2 | 13 | 12 | 12 | 12 | 31 | **82** |
| GAP | 0 | 0 | 1 | 2 | 0 | 2 | **5** |
| UNKNOWN | 0 | 0 | 0 | 8 | 0 | 0 | **8** |
| **Σ UC** | 40 | 40 | 24 | 22 | 53 | 66 | **245** |

### Cách đọc

| Verdict | Ý nghĩa |
|---------|---------|
| LIKELY_IMPL | Controller/route/matrix có tín hiệu khớp UC — **chưa** UAT U65 |
| LIKELY_PARTIAL | Có API hoặc FE nhưng thiếu nhánh BR/role/UI depth |
| GAP | Spec/UC có, code/endpoint chưa neo hoặc backlog rõ |
| UNKNOWN | Wave thiết kế chưa đọc code đủ (chủ yếu S4 TechSpec mỏng) |

**Cấm:** suy `impl_status: e2e_pass` trên matrix Phase1 = đã nghiệm thu FE.

---

## 4. TC-ID integrity (W2 synth)

| Check | Result |
|-------|--------|
| Sample-scan 245 files for `TC-*` | Unique IDs **3281** |
| Same TC-ID in ≥2 UC files | **0 collisions** |
| Naming neo | Prefix theo UC: `TC-XBOS-01-…`, `TC-HRM-AT-12-…`, `TC-XBOS-DM-09-…` (canonical = owning `by-uc/<UC-ID>.md`) |
| Δ cases_designed − unique TC-ID | **53** — narrative re-mention skipped within-file và/hoặc hàng case thiếu TC-ID extractable; **SoT số case = manifest Σ 3334** |

Không cần remap TC-ID giữa packs ở W2.

---

## 5. SRS cũ vs SRS mới (`srs_new`)

| Gói | Vai trò |
|-----|---------|
| SRS / BANG_TONG_HOP / PHASE1 matrix | SoT **UC inventory 245** + `srs_old` |
| `SRS_VN` + `TECH_SPEC_VN` + `API_CONTRACT_VN` | Delta — map khi overlap; ghi **N/A-DELTA** khi pack mới chưa tách FR |

### File-level `srs_new` (scan header / trace)

| Squad | N/A-DELTA | Mapped / cited SRS_VN | UC |
|-------|----------:|----------------------:|---:|
| S1 XBOS-CORE | 22 | 18 | 40 |
| S2 ORG-WF | 37 | 3 | 40 |
| S3 CAT-TAIL | 14 | 10 | 24 |
| S4 DM-LOG | **22** | **0** | 22 |
| S5 HRM-A | 5 | 48 | 53 |
| S6 HRM-B-MOB | 23 | 43 | 66 |
| **Σ** | **123** | **122** | **245** |

**Đọc ngắn:** HRM (S5/S6) map SRS_VN dày hơn; XBOS ORG-WF + **toàn S4 logistics** gần như **N/A-DELTA** (TECHSPEC_M03 pattern / bang tong hop). Gap SRS_new ≠ thiếu TC — TC đã DESIGN từ `srs_old` + TechSpec pattern.

---

## 6. P0 residual queue → W3 (U86 auto-fix)

### 6.1 GAP (code_readiness = GAP) — 5 UC

| Priority | uc_id | Squad | Cases | Note / spec_ref |
|---------:|-------|-------|------:|-----------------|
| **P0-1** | `XBOS-DM-09` | S3 | 10 | Sao chép bộ danh mục — clone API chưa neo · `BANG_TONG_HOP` STT 85 · TECHSPEC_HE §8.1 · `api_contract` TBD |
| **P0-2** | `XBOS-DM-LOG-09` | S4 | 8 | Clone DM Logistic CT→CT · TECHSPEC_M03 §2 · SRS_VN **N/A-DELTA** |
| **P0-3** | `UC-HRM-27` | S6 | 16 | Embed Quyết định & báo cáo — backlog/waiver honest · TECHSPEC_HE §9.3 · `srs_new` N/A-DELTA backlog |
| P1 | `XBOS-DM-LOG-18` | S4 | 8 | Notify spoke Logistic — P2 stub / GAP |
| P2 | `UC-HRM-MOB-14` | S6 | 12 | Offline controlled — SRS_MOBILE P2 · TECHSPEC_MOBILE §8 |

### 6.2 SPEC_GAP (không invent PASS)

| ID | UC | Note |
|----|-----|------|
| **SG-LEAVE-L2** | `HRM-AT-12` (+ MOB-06/08 SG) | Ladder L2 AS-IS 1 bước — exemplar `UC-FR-H03_LEAVE` · **cấm** invent `T_L1`/L2 PASS |
| SG-DM-FORM-PRESET | `XBOS-DM-HRM-12` | Form preset CC↔HRM PARTIAL |
| SG-INVITE-BULK | `UC-HRM-04` | Bulk invite FE vs single API |

### 6.3 Top PARTIAL / UNKNOWN clusters (W3 spot sau GAP)

| Cluster | Count | Squad | Gợi ý |
|---------|------:|-------|-------|
| S6 PARTIAL (mobile/OP/PF/RC interview/embed) | 31 | S6 | Spot P0 embed + ESS approve sau GAP |
| S4 PARTIAL + UNKNOWN | 12 + 8 | S4 | SA/BA depth TECHSPEC_M03 hoặc accept UNKNOWN |
| S5 DM-HRM + leave/invite PARTIAL | 12 | S5 | DM-HRM-07/12/13 + AT-12 L2 |
| S3 catalog PARTIAL | 12 | S3 | Import/export/hierarchy sau DM-09 |
| S2 CC/RACI/DASH PARTIAL | 13 | S2 | Widget empty-policy + RACI version |
| S1 WF canvas / AR ladder | 2 | S1 | `UC-XBOS-WF-01`, `UC-XBOS-16` |

---

## 7. W3 backlog (copy queue cho PM)

```text
1) PO-UC-TC-W3-BE-DM09 — dev-be: XBOS-DM-09 clone catalog (spec_read_ack STT85 + TECHSPEC_HE §8.1)
2) PO-UC-TC-W3-BE-LOG09 — dev-be|dev-fe: XBOS-DM-LOG-09 twin clone (TECHSPEC_M03) — hoặc gộp epic clone sau DM-09
3) PO-UC-TC-W3-FE-HRM27 — ba-process confirm backlog vs ship → rồi dev-fe embed Quyết định/báo cáo
4) Leave L2 — BA/SA delta only (SG-LEAVE-L2) — không Dev invent PASS
5) QA U65 retest per UC sau READY_FOR_QA — cấm seed
```

---

## 8. Change log

| Date | Event |
|------|--------|
| 2026-08-04 | Skeleton + 6 squad DISPATCHED |
| 2026-08-04 | S1–S5 manifests · partial rollup 179 / 2371 |
| 2026-08-04 | S6 READY · pre-synth 245 / 3334 |
| **2026-08-04** | **W2 SYNTH FINAL** — 245/245 files · 3334 cases · readiness 150/82/5/8 · 0 TC collisions · uat_done false |

---

*PO-UC-TC-MASTER-REPORT-01 · W2 FINAL · design ≠ UAT*
