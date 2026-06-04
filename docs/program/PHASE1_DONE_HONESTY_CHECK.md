# Phase 1 — Kiểm tra trung thực «100% DONE» (2026-05-29)

**Yêu cầu sponsor:** FE + BE + **mobile APK** đủ; **245/245 UC**; member chủ chốt đảm bảo chất lượng.

---

## Kết luận một dòng

| Câu hỏi | Trả lời |
|---------|---------|
| **Ma trận 245 UC đóng catalog?** | **Có** — 243 `e2e_pass` + 2 `waived` |
| **Phase 1 Program DONE 100% (G1–G9 + chất lượng thật)?** | **Không** — **GO WITH CONDITIONS** |
| **FE + BE + Mobile APK «đủ 100%»?** | **Chưa** — pilot slice mạnh; nhiều màn HRM còn gap; APK chưa có evidence build gần đây trong continuous run |

**Không nói với sponsor:** «Phase 1 xong 100%» hoặc «mọi UC đã code đủ FE/BE/mobile».

---

## Bảng gate G1–G9 (SoT: QC + matrix)

| Gate | Mục tiêu | Thực tế | DONE 100%? |
|------|----------|---------|------------|
| **G1** | 245 UC | 245/245 (243+2 waived) | ✅ **Catalog** |
| **G2** | XBOS 104 e2e | **103/104** + waived `UC-ECO-MASTER-01` | ❌ |
| **G3** | HRM 119 QA | Matrix + L2.5 (GWC persona) | 🟡 **GWC** |
| **G4** | DM-LOG 22 | Master todo **[ ]** | ❌ |
| **G5** | 183 DM publish | Master todo **[ ]** | ❌ |
| **G6** | Mobile 15 UC | 15/15 trong `phase1-impl-status` + MOBILE_BACKLOG DONE | 🟡 **Catalog**; APK/smoke cũ |
| **G7** | `phase1:gate --strict` | PASS (2026-05-29 SUPA/QA) | ✅ **Automation** |
| **G8** | UAT zero-defect pilot | P-CC + J-HRM + persona GWC | 🟡 **Slice** |
| **G9** | Traceability | P1 none=0/245 (`test:uc:catalog`) | ✅ **Catalog** |

Nguồn: `p1-r4-qc-01-20260529.md`, `PHASE1_MASTER_TODO.md`, `phase1-impl-status.json`.

---

## FE / BE / Mobile — theo lane

| Lane | Đã có | Chưa đủ «100% chất lượng» |
|------|-------|---------------------------|
| **BE** | hrm-api + xbos-api jest xanh; Nest thay Supabase; scope parity pilot | G4/G5 DM-LOG; một số module chỉ list chưa full CRUD; internal-key create scope (advance) |
| **FE** | Portal CC embed; HRM pilot P-CC; 0 import Supabase client | **~35+ file** vẫn `notifyHrmApiGap` (màn phụ: salary components, recruitment PATCH, platform admin, …) |
| **Mobile** | 15 UC `e2e_pass` trong ma trận; `mobile-hrm-smoke` S0; code `apps/mobile/hrm-mobile` | **Không** có evidence **APK release build** trong wave 2026-05-29; SVC-11 UAT-PASS 🟡; `P1-S3-MOB-01` regression **[ ]** trên master todo |

APK: script `pnpm run android:apk` / `eas:apk` có trong repo — **chưa** chứng minh PM giao «APK đủ» trong phiên gần nhất.

---

## 245 UC vs «làm đủ nghiệp vụ»

- **245/245** = trạng thái **impl_status** trên ma trận (automation + promote QA), **không** = đã UAT tay từng UC trên FE+BE+mobile.
- Chỉ **132** UC P1 `covered` trực tiếp bởi test catalog; **113** `partial` (`p1-g9-qa-01` / QC repro).
- **373 UC** toàn SRS = **Phase 2+**, không nằm Phase 1.

---

## Member chủ chốt — đánh giá trách nhiệm

| Role | Đã đóng gì (evidence) | Gap chất lượng |
|------|----------------------|----------------|
| **Dev-BE** | Gate strict, Supabase zero, advance OT/BT APIs, mobile auth | G4/G5; parity toàn module; không phải mọi bảng legacy |
| **Dev-FE** | Embed pilot, Supabase zero, wire ưu tiên | ~35 gap stub; không phải full SPA |
| **Dev-Mobile** | MOB backlog DONE; smoke 2026-05-23 | APK build + regression S3 **chưa** đóng master todo |
| **QA** | L0–L2.5 pilot, persona, SUPA zero | Không matrix UAT 245 UC tay |
| **QC** | P1-R4 **GWC** — từ chối «100% DONE» ngầm | Production corp 🔴 |
| **PM** | Continuous + bounded backlog | PSR cần đồng bộ honesty doc này |

---

## Để đạt «100%» sponsor (ước lượng)

| # | Việc | Owner |
|---|------|-------|
| 1 | Đóng **G2** 104/104 hoặc waiver có expiry rõ | Dev-BE + QC |
| 2 | **G4/G5** DM-LOG + 183 catalog | Dev-BE + DevOps |
| 3 | Burn-down **hrmApiGap** còn lại hoặc waiver theo UC | Dev-FE + BA |
| 4 | **Mobile:** `mobile-hrm-smoke` + **APK release** artifact + QA device | Dev-Mobile + QA |
| 5 | UAT-PASS / PROD-READY (nếu cần production) | QA + QC + DevOps |

WBS đề xuất: mở `PHASE1_COMPLETION_GAP_WBS.md` (PM) — **không** lặp gate đã PASS (`pm-continuous-no-infinite-loop.mdc`).

---

## Tham chiếu

- `docs/qa/evidence/p1-r4-qc-01-20260529.md`
- `docs/program/PHASE1_COMPLETION_PLAN.md`
- `docs/program/PHASE1_MASTER_TODO.md`
- `docs/program/SERVICE_READINESS_UAT_PRODUCTION.md` (SVC-11 mobile 🟡)
