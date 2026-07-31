# Báo cáo trạng thái dự án — XeVN OS Phase 1

**Báo cáo số:** `PSR-2026-06-09-MOB-UX-16-PM-01`  
**Ngày:** 2026-06-09  
**Người lập:** PM (mobile layout composition governance)  
**work_item_id:** `MOB-UX-16-PROGRAM`

> **Kết luận một dòng:** Product Completion ~90% **nhưng mobile partner slice CHƯA ĐẠT** — rubric **ILA layout composition** trung bình **~14.5/20** (cần ≥16); gate **G8** mới bổ sung; **không** Phase 1 DONE · **không** partner-ready.

---

## 1) Product Completion snapshot (P1-PRODUCT-COMPLETE)

| Wave | Trạng thái | Evidence |
|------|------------|----------|
| **W1** HRM embed zero-mock | **Closed (localhost GWC)** | M-HRM-01..11 — `pcomp-w1-qc-01/02-20260607.md` |
| **W2** Portal legacy mock batch | **Closed (localhost GO scoped)** | M-CC-01..15 **15/15** — `pcomp-w2-qc-06-20260607.md`; residual **C-PCOMPQC-W2-02** shell gate P2 |
| **W3** BE integrity & scope | **Closed (localhost GWC)** | P0-1..4 live + R3 — `qc-p1-prod-int-gate-r3-20260607.md` |
| **W4** Mobile scope parity | **API PASS** | `pcomp-w4-qa-01-20260607.md` — vitest **50/50**, live probes; device L2.5 **deferred** |
| **W5** Verification & QC | **GO WITH CONDITIONS** | `pcomp-w5-qc-01-20260607.md` — `verify:product:completion` exit **0**; L0+L1+L2 **13/13**; TM scope_parity **PASS** |
| **W6** Sponsor UAT | **Pending sponsor** | PM docs synced (`pcomp-w6-pm-01-20260607.md`); **PCOMP-W6-SP-01** chưa chạy |

**Tiến độ tổng thể:** ~**90%** product completion (W1–W5 localhost slice closed với residuals có owner; W6 chờ sponsor).

**PM sync (`PCOMP-W6-PM-01`):** Hoàn tất 2026-06-07 — `pnpm run verify:product:completion` exit **0** (W1×3 + W2 + W3 integrity); upstream W5 QC **GO WITH CONDITIONS** (`pcomp-w5-qc-01-20260607.md`).

---

## 2) W5 QC GO WITH CONDITIONS — đã đóng vs còn mở

### Đã đóng (promotable localhost U32)

| Hạng mục | Verdict | Evidence |
|----------|---------|----------|
| Automated completion script | **PASS** | `verify:product:completion` exit **0** — W1 grep + W2 mock zero + W3 integrity |
| W5 QA regression | **PASS** | L0 `qc:dev-stack` **0**; `qc:fe-be-health:pilot` **13/13**; persona group **1107** / **5** slugs |
| J-HRM-INT-01..05 (API L2.5) | **PASS** | `pcomp-w5-qa-01-20260607.md` |
| TM scope_parity | **PASS** | gaps **0** — `pcomp-w5-tm-01-20260607.md` |
| W1 mock cluster M-HRM-01..11 | **CLOSED** | W1 QC chain |
| W2 strict mock M-CC-01..06 | **CLOSED** | W2 QC-02 |

### Còn mở (chặn program exit / PROD / sponsor UAT-PASS)

| ID | Severity | Owner |
|----|----------|-------|
| M-CC-11/12 GlobalFilter + CC page mock | P1 | dev-fe (`PCOMP-W2-FE-04`) |
| J-MOB-01..05 device smoke | P1 | qa-device (sau W4 API PASS) |
| G-INT-02/05/06/08 browser depth | P1 program | dev-fe + qa |
| PCOMP-W6-SP-01 sponsor UAT | W6 gate | sponsor |
| Evidence pack format C-PCOMPQC-W5-02 | process | qa |

---

## 3) UAT vs Production statement

| Level | Verdict | Ghi chú |
|-------|---------|---------|
| **Localhost UAT** (127.0.0.1:5173 + APIs) | **Sẵn sàng UAT (GWC)** | W5 QC GWC — cần bật `hrm-api` :28001 |
| **Sponsor UAT sign-off (W6)** | **Chưa mở** | Chờ `PCOMP-W6-SP-01` sau PM sync |
| **UAT HTTPS** (nip.io) | **Slice PASS** (prior gates) | Không thay thế W6 localhost sponsor session |
| **Production corp** (`portal.xe.vn`) | **Chưa sẵn sàng** | DNS/TLS **BLOCKED** (W14 lane) |
| **Phase 1 DONE** | **NO** | Residuals + W6 + legacy program gates |

**Sponsor-safe line:** ~90% product completion ≠ hoàn thành dự án; không công bố PROD fully live.

---

## 4) Legacy program closure (W12–W14 — tham chiếu)

| Hạng mục | Trạng thái | Evidence |
|----------|------------|----------|
| W12 formal program closure | **GO WITH CONDITIONS** | `p1-p100-w12-qc-final-20260531.md` |
| W13 partner prep + metrics | **PASS** | `p1-p100-w13-qa-01`, `p1-p100-w13-qa-metrics-01` |
| W14 QC prod gate (nip.io) | **GO WITH CONDITIONS** | `p1-p100-w14-qc-prod-20260601.md` |
| Corp domain `portal.xe.vn` | **BLOCKED** | `p1-p100-w14-do-domain-01-20260601.md` |
| S5 QC pre-gate | **GO WITH CONDITIONS** | `p1-s5-qc-pre-01-20260605.md` — G8/PROD **NOT MET** |

Các condition W12 (`C-W12QC-01` mobile P5, `C-W12QC-02` contracts ratio) **CLOSED** 2026-06-05; corp domain vẫn mở.

---

## 5) Mobile UI layout composition pulse (G8 — 2026-06-09)

**SoT:** `docs/program/MOBILE_UI_LAYOUT_COMPOSITION_AUDIT.md` · **Gate:** `pnpm run verify:mobile:layout`

| Màn bắt buộc | ILA /20 | Trạng thái | work_item |
|--------------|---------|------------|-----------|
| Home | 12 | FAIL | MOB-UX-16a, 14-R6 |
| Thông báo | 18 | PASS | MOB-UX-15a ✅ |
| Nghỉ phép | 14 | GWC | MOB-UX-16b |
| Phê duyệt | 13 | FAIL | MOB-UX-16b |
| Chấm công | 15 | GWC | 13a ✅ |
| Đội nhóm / Đồng nghiệp | 16–17 | PASS | SET G ✅ |

**Trung bình partner slice:** ~**14.5/20** — chặn `MOB-PARTNER-QC-01` cho đến `MOB-UX-16-QC` GO.

**Căn cứ sponsor:** ảnh Home (scroll/grid), Nghỉ phép (tab sát card), Phê duyệt (chip sát header) → map ILA-01/02/03 trong audit §6.

---

## 5b) Pilot `:8088` waves (2026-06-20)

| Slice | Verdict | Honest counts | Evidence |
|-------|---------|---------------|----------|
| **Screen-action catalog** W2 | **GO WITH CONDITIONS** | P0 **20/20 🟢**; uf map **52/52** verdicts (**36🟢 · 13🟡 · 3⬜**) — **not** all green | `p1-screen-action-qc-slice-01-20260620.md` |
| **Infra FCAT wizard** | **GO WITH CONDITIONS** | J-XBOS-05 consumer bind PASS; R-QA-FCAT-02 waived P2 | `p1-infra-fcat-qc-20260620.md` |

**Carry (P2/P3 — không block slice):** R-W2-HRM-03, R-W2-UF12, R-W2-UF15, R-W2-ACT-REG, R-W2-LEAVE, R-UF06-FILE-URL.

**NOT Phase 1 DONE** — program gates G4/G5 + full UF matrix remain open.

---

## 6) PM dispatch focus (W6+)

1. **MOB-UX-16** — layout composition: dev-mobile 16a–c + qa-device ILA scorecard.
2. **Sponsor** — `PCOMP-W6-SP-01` sau G8 ≥16/20 trên màn bắt buộc.
3. **Không** claim partner-ready khi ILA < 16 hoặc chỉ có vitest PASS.
4. Giữ lane corp domain W14 cho PROD cutover sau product completion.

---

## 7) Evidence references

**Product completion (2026-06-07):**

- `docs/qa/evidence/pcomp-w5-qc-01-20260607.md`
- `docs/qa/evidence/pcomp-w5-qa-01-20260607.md`
- `docs/qa/evidence/pcomp-w5-do-01-20260607.md`
- `docs/qa/evidence/pcomp-w5-tm-01-20260607.md`
- `docs/qa/evidence/pcomp-w4-qa-01-20260607.md`
- `docs/program/evidence/pcomp-w6-pm-01-20260607.md`

**Legacy program:**

- `docs/qa/evidence/p1-p100-w12-qc-final-20260531.md`
- `docs/qa/evidence/p1-p100-w14-qc-prod-20260601.md`
- `docs/ops/evidence/p1-p100-w14-do-domain-01-20260601.md`

---
## Pulse 2026-07-27 ~17:32 — U71 F.1 path + U72 GWC local
- U71: 21 physical F.1 pairs · G-RULE-11 CLOSED (tm-u71-physical-backlog-close-01-20260727.md)
- U72: HRM R3 + XBOS R2 GWC local · HOLD_DEPLOY · NOT Phase1/PROD/:8088
- Soft OpenAPI/G-DTO/leave/G-IM deferred P2–P3
