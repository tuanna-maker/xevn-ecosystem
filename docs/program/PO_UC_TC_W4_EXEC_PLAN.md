# W4 — Thực thi test theo `by-uc/` (U65)

| Meta | Value |
|------|--------|
| **Doc ID** | `PO-UC-TC-W4-EXEC-01` |
| **Date** | 2026-08-04 |
| **Trigger** | Sponsor: *by-uc đủ UC → cho members test* |
| **SoT cases** | `docs/qa/professional/by-uc/<UC-ID>.md` |
| **Master** | `MASTER_COVERAGE_REPORT.md` — design 245/3334; **uat_done false** |
| **Locks** | U65 · U76 · U78 · không invent Leave L2 PASS · không seed |

---

## 1. Phạm vi honest

| Có | Không |
|----|-------|
| Chạy **P0 TC** (HP + ≥1 FD + AU nếu có) trên UC `LIKELY_IMPL` trước | Claim Phase1 DONE vì 245 file design |
| Browser FE click path | Seed inbox/catalog để có data |
| Cập nhật by-uc `execution` + rollup W4 | Invent PASS `HRM-AT-12` L2 |
| FAIL → `pm_dispatch_hint` Dev cùng ngày | Test hết 3334 case trong 1 wave |

**Chiến lược:** Wave **W4-A** (batch P0 mutate/spine) → intake → W4-B tiếp LIKELY_IMPL còn lại → PARTIAL sau khi GAP đóng.

---

## 2. W4-A — 4 squad QA + 1 mobile (song song)

| Squad | work_item_id | UC (P0 pack) | Owner |
|-------|--------------|--------------|-------|
| **E1** XBOS-CC/WF | `PO-UC-TC-W4-QA-E1-XBOS` | `UC-XBOS-AUTH-01`, `UC-CC-P0-01`, `UC-CC-P0-03`, `UC-CC-P0-06`, `UC-RACI-02`, `UC-XBOS-CC-06` | qa |
| **E2** HRM ATT/Leave | `PO-UC-TC-W4-QA-E2-HRM-AT` | `HRM-AT-01`, `HRM-AT-04`, `HRM-AT-07`, `HRM-AT-10`, `HRM-AT-11`, `HRM-AT-13` (**không** PASS L2 trên AT-12) | qa |
| **E3** HRM Emp + Catalog | `PO-UC-TC-W4-QA-E3-HRM-EM` | `HRM-EM-01`, `HRM-EM-02`, `HRM-EM-03`, `XBOS-DM-HRM-03`, `XBOS-DM-HRM-10`, `UC-HRM-06` | qa |
| **E4** Recruit + Contract | `PO-UC-TC-W4-QA-E4-HRM-RC` | `HRM-RC-01`, `HRM-RC-02`, `HRM-RC-03`, `HRM-CI-01`, `HRM-CI-03`, `UC-HRM-22` | qa |
| **E5** Mobile ESS | `PO-UC-TC-W4-QA-E5-MOB` | `UC-HRM-MOB-01`, `UC-HRM-MOB-02`, `UC-HRM-MOB-04`, `UC-HRM-MOB-06` (L1 only nếu L2 SPEC_GAP) | qa-device |

**Đã đóng W3 (không retest trừ regression):** `XBOS-DM-09` browser R2 · `XBOS-DM-LOG-09` (xem evidence R2).

---

## 3. DoD mỗi UC trong seat

```text
1) L0 stack OK
2) Đọc by-uc — chọn TC P0 (HP+FD+AU)
3) Persona: ceo@xe.vn (holding); member khi AU
4) Browser: login → menu HDSD → thao tác → Network → FE sau 2xx → F5
5) Ghi docs/qa/evidence/po-uc-tc-w4-<squad>-<uc>.md hoặc rollup seat
6) Cập nhật by-uc execution: PASS|FAIL|BLOCKED|PARTIAL + note
7) Residual → next_dispatch_prompt Dev nếu FAIL product
```

**Rollup seat:** `docs/qa/evidence/po-uc-tc-w4-<squad>-rollup.md` + `PASS_TO_PM`.

---

## 4. Sau W4-A

PM intake → Task Dev cho FAIL P0 → QA retest → mở W4-B (UC LIKELY_IMPL tiếp theo theo manifest S1→S6).

---

*PO-UC-TC-W4-EXEC-01*
