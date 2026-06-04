# Phase 1 — Kế hoạch tự động PM (điều phối full team)

**Owner:** PM · **Cập nhật:** 2026-05-30  
**Chính sách:** PM tự lên kế hoạch + dispatch — sponsor không cần chọn TM vs QC vs mobile.

**Mục tiêu:** Q1–Q7 trong [`PHASE1_QUALITY_FIRST.md`](./PHASE1_QUALITY_FIRST.md) → **Program QC GO/GWC** → báo cáo user trung thực.

---

## Đã xong (không lặp)

| Wave | Nội dung |
|------|----------|
| Catalog / G2 | 245 matrix, G2 104/104, G9 catalog |
| Web gap | Q1 **PASS** — 0 `notifyHrmApiGap` callers |
| Mobile APK | Build + device shell GWC |
| Pilot | HTTPS, Supabase zero, P-CC L2 |

---

## Wave 4 — Web chất lượng đóng (song song)

| ID | Owner | Exit |
|----|-------|------|
| **P1-QUAL-TM-01** | TM | Scope parity W3 + sample SOLID; evidence `p1-qual-tm-01-*.md` |
| **P1-QUAL-QA-W4** | QA | Q2: J-HRM-01..07 L2.5 retest; Q6: `ceo@xe.vn` + `du-lich.ceo@xe.vn`; `test:system:uat` exit 0 |
| **P1-QUAL-BE-SEED-01** | Dev-BE | Seed sales/bonus/catalog-extensions để UI không 404 trống trên pilot slice |

## Wave 5 — Mobile chất lượng (Q3)

| ID | Owner | Exit |
|----|-------|------|
| **P1-QUAL-QA-MOB-01** | QA | J-MOB-03..05 detail + action trên emulator; cập nhật `PROGRAM_JOURNEY_MAP` |
| **P1-QUAL-MOB-FIX-01** | Dev-Mobile | Chỉ nếu QA FAIL — fix + rebuild APK |

## Wave 6 — Program sign-off

| ID | Owner | Exit |
|----|-------|------|
| **P1-QUAL-QC-PROGRAM-02** | QC | GO/GWC Q1–Q7; không claim PROD corp |
| **P1-QUAL-PM-CLOSE-01** | PM | `PROJECT_STATUS_REPORT` + `USER_SERVICE_STATUS` + bus USER brief |

---

## Thứ tự dispatch PM

```
W4: TM + QA-W4 + BE-SEED (parallel)
  → W5: QA-MOB → [MOB-FIX if FAIL]
  → W6: QC-PROGRAM-02 → PM-CLOSE
```

**Cấm:** `phase1:gate` lặp; re-dispatch closed IDs trong `PM_ORCHESTRATION_STATE.json`.

---

## Báo cáo sponsor (khi W6 xong)

- **UAT-READY:** Q1–Q6 GWC/GO + pilot URL/account  
- **Không nói:** PROD-READY / 373 UC / «mọi UC UAT tay»
