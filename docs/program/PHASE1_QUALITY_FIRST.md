# Phase 1 — Chất lượng sản phẩm trước (sponsor lock)

**Ngày:** 2026-05-30 · **Owner:** PM  
**Ưu tiên user:** *Quan trọng nhất là chất lượng sản phẩm* — không coi catalog `covered` hay ma trận `e2e_pass` là «xong».

---

## Định nghĩa DONE (chất lượng)

| # | Tiêu chí | PASS khi | Owner |
|---|----------|----------|-------|
| Q1 | **Không lừa user** | **PASS** khi `notifyHrmApiGap(` **0** call site trong `apps/web/hrm/src` (chỉ export `lib/hrmApiGap.ts`); QA xác nhận P-CC-03..08 load không gap toast / không `54321` | Dev-FE + QA |
| Q2 | **L2.5 journey** | Mọi J-HRM-* + J-CC-* bắt buộc: click path, detail 200, không 404 scope | QA |
| Q3 | **Mobile thật** | J-MOB-03..05: list **và** detail/action trên device (không chỉ API proxy) | Dev-Mobile + QA |
| Q4 | **Stack ổn định** | `qc:dev-stack` + `qc:fe-be-health` 8/8; không 500/409/54321 trên pilot | DevOps + QA |
| Q5 | **Scope parity** | List và GET-by-id cùng resolver (`main` rollup) | Dev-BE |
| Q6 | **Persona** | `ceo@xe.vn` + `du-lich.ceo@xe.vn` slice đã ký evidence | QA |
| Q7 | **QC Program** | GO/GWC có danh sách Q1–Q6 + residual có owner | QC |

**Thứ yếu (không thay Q1–Q7):** `test:uc:catalog` covered count, tag UC trong jest title.

---

## Hiện trạng chất lượng (2026-05-30)

| Signal | Trạng thái | Rủi ro user |
|--------|------------|-------------|
| P-CC-01..08 L2 | PASS | Thấp trên tab chính |
| J-HRM-01..07 L2.5 | **PASS** (W4 2026-05-30 — `p1-qual-qa-w4-20260530.md`) | Thấp trên embed CC |
| Q6 persona `du-lich.ceo` | **PASS** (W4 — negatives 403/409 + P-CC-03..08) | Member slice signed |
| `notifyHrmApiGap` còn lại | **0 callers** (W3 2026-05-30 QA) — **1 file** export only | **Đã đóng Q1** — xem `p1-qual-qa-w3-20260530.md` |
| J-MOB-03..05 | **PASS** API pilot `:3001` (QA-02); device row tap **GWC** | PM Wave 8: mobile header + device |
| C-QUAL-01..02 | **CLOSED** (upload scope, asset guard) | `p1-resid-c-qc-01-20260530.md` |
| C-QUAL-03..04 | **CLOSED (API)** · device **GWC** | Pilot seed + approve 201 UUID |
| Mobile APK | Pilot API parity OK | Wave 8 đóng Q3 device |
| Q7 Program QC | **GWC** (residual wave cập nhật) | `p1-resid-c-qc-01-20260530.md` |
| PROD | 🔴 | PM defer đến hết P0 Q3 — không hỏi sponsor |

---

## Wave chất lượng (không loop catalog)

### Wave Q2 — đang mở

| ID | Owner | Deliverable |
|----|-------|-------------|
| **P1-QUAL-FE-W2** | Dev-FE | Wire batch 2: employee profile, recruitment dialogs, company members, platform admin — **0 gap** trên các file này |
| **P1-QUAL-QA-01** | QA | Product audit: L2.5 spot 3 journey + J-MOB detail + `grep notifyHrmApiGap` before/after + `qc:fe-be-health` |

### Wave Q3 (sau Q2 PASS)

| ID | Owner | Deliverable |
|----|-------|-------------|
| P1-QUAL-FE-W3 | Dev-FE | Batch 3 — hết gap còn lại |
| P1-QUAL-TM-01 | TM | Scope parity + SOLID sample modules |
| **P1-100-QC-01** | QC | Program GO chỉ khi Q1–Q7 |

---

## Cấm

- Báo «245/245 xong» khi Q1 còn gap toast trên luồng user
- Chỉ chạy `test:uc:catalog` để tăng số
- QC GO Program khi J-MOB detail chưa kiểm

Tham chiếu: `business-flow-zero-defect-gate.mdc`, `PROGRAM_JOURNEY_MAP.md`
