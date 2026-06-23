# P1 — Plan song song nghiệm thu browser (:8088)

**Ngày:** 2026-06-20  
**Sponsor:** U63/U65 — FE-only, **cấm seed**  
**URL:** `http://14.225.217.232:8088/`  
**Hai việc còn lại:**

| # | Việc | Hiện trạng | Exit |
|---|------|------------|------|
| **A** | **XBOS Wave 1** (UF-01..15) | **10/15 🟢**, 4 🟡, 1 🔴 | **15/15 🟢** browser trên :8088 |
| **B** | **HRM Wave 2** (UF-HRM-01..13) | Chưa browser U63 đủ trên :8088 | **13/13 🟢** browser (web, trừ ⚪ mobile) |

**Thay đổi so với trước:** Sponsor yêu cầu **song song** — Track A (XBOS đóng gap) và Track B (HRM browser) **chạy cùng lúc**, không chờ A xong 100% mới mở B. QC cuối vẫn cần cả hai PASS.

---

## Timeline (ước lượng thực tế)

| Mốc | Thời gian | Việc | Owner |
|-----|-----------|------|-------|
| **T0** | **Ngay (phiên này)** | 4 lane execution song song (bảng dưới) | DevOps + Dev-BE + Dev-FE + QA |
| **T+1** | Sau deploy UF-14 (~30–60 phút agent) | QA **R5 XBOS** retest UF-07..09, 14, 15 | QA |
| **T+1** | Song song T0→T+1 | QA **HRM Wave 2** browser 13 UF (account CEO + member) | QA (lane riêng) |
| **T+2** | Cùng ngày / phiên kế | QC gate `:8088` — audit matrix + residual | QC |
| **Done sponsor** | **~1–2 ngày làm việc agent** (4 lane parallel) | Báo «sẵn sàng nghiệm thu» chỉ khi A+B exit | PM |

*Không hẹn tuần — bottleneck là deploy :8088 + fix inbox/RACI, không phải viết plan.*

---

## Track A — XBOS 15/15 (gap còn 5 UF)

| UF | Verdict R4 | Root cause / việc | Owner | work_item_id |
|----|------------|-------------------|-------|--------------|
| UF-07 | 🟡 | RACI PUT không persist F5 | **dev-fe** (+ BE nếu API) | `P1-BROWSER-E2E-RACI-07-01` |
| UF-08 | 🟡 | WF tạo được; chuỗi spawn→inbox→Duyệt chưa đủ | **dev-be** + dev-fe | `P1-BROWSER-E2E-WF-INBOX-08-01` |
| UF-09 | 🟡 | Extension FE ok; inbox (0) — không seed U64 | **dev-be** | `P1-BROWSER-E2E-CAT-INBOX-09-01` |
| UF-14 | 🔴 | GET catalog **409** scope — fix local READY, **chưa deploy** | **devops** | `P1-DEPLOY-UF14-8088-01` |
| UF-15 | 🟡 | Giống UF-09 — extension + approve path | **dev-be** (gộp 09) | (cùng lane cat/inbox) |

**QA R5** (`P1-BROWSER-E2E-XBOS-R5-8088`): Chạy **sau** devops UF-14 + song song retest 07 khi dev-fe READY — **không seed**.

---

## Track B — HRM 13/13 (browser U63)

| Nhóm | UF | Ghi chú QA |
|------|-----|------------|
| Core HR | UF-HRM-01..06 | List→detail, hợp đồng, NV, BH, chấm công, lương — **browser** mutate+F5 |
| Scope | UF-HRM-09, 13 | Member CEO / HRBP — negative + mutate |
| Settings | UF-HRM-10, 11 | Catalog sync + metadata queue approve |
| Ops | UF-HRM-12 | Tuyển dụng UI |

**work_item_id:** `P1-BROWSER-E2E-HRM-WAVE-8088`  
**Evidence:** append `p1-browser-e2e-xbos-hrm-20260620.md` §HRM-W2  
**Cấm:** downgrade probe cũ thành 🟢 — mỗi UF block U63 đủ 7 bước.

---

## Dispatch song song T0 (4 sub-agent)

```text
Lane 1  devops   P1-DEPLOY-UF14-8088-01     pscp xbos-be fix → rebuild :8088
Lane 2  dev-be   P1-BROWSER-E2E-INBOX-08-09 inbox spawn từ FE (WF + catalog) — NO SEED
Lane 3  dev-fe   P1-BROWSER-E2E-RACI-07-01  RACI matrix persist F5
Lane 4  qa       P1-BROWSER-E2E-HRM-WAVE-8088  HRM 13 UF browser :8088 (parallel Track B)
```

Sau T0 handoff `READY_FOR_QA`:

```text
Lane 5  qa       P1-BROWSER-E2E-XBOS-R5-8088  XBOS retest 07,08,09,14,15
Lane 6  qc       P1-USER-FLOW-WEB-QC-8088-R2   GO khi A+B exit
```

---

## Definition of Done (sponsor)

- [ ] `USER_FLOW_OPERABILITY_MATRIX.md` §3: **15/15 🟢** Dev8088 (XBOS)
- [ ] `USER_FLOW_OPERABILITY_MATRIX.md` §4: **13/13 🟢** Dev8088 (HRM web)
- [ ] Evidence `p1-browser-e2e-xbos-hrm-20260620.md` — §R5 + §HRM-W2
- [ ] **Zero** seed trong mọi evidence block (U65)
- [ ] QC GO `:8088` (hoặc GWC có owner+expiry)

---

## Rủi ro

| Rủi ro | Giảm thiểu |
|--------|------------|
| VPS pscp drift | devops full package rebuild + smoke |
| Inbox không spawn từ FE | dev-be fix engine — **không** seed workaround |
| QA quota / 4 Task billing | PM chain R5 ngay sau deploy; không idle giữa lane |

**Bus / pulse:** `TEAM_WORKING_NOW.md` cập nhật sau mỗi PASS_TO_PM.
