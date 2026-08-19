# PO — Kế hoạch đóng Use Case (D1 → D2 → không nhảy D3)

| Meta | Value |
|------|--------|
| **Doc ID** | `PO-UC-CLOSURE-PLAN-01` |
| **Updated** | 2026-08-04T06:58+07:00 |
| **Owner** | PM |
| **Rollup SoT** | `docs/qa/reports/PO_UC_TESTCASE_STATUS_ROLLUP.md` §7–§9 |
| **Locks** | U65 · U76 · U78 · U84 · U85 |
| **uat_done** | false |
| **phase1_done** | false |

---

## 1. Mục tiêu

Đóng dần các UC spine (HP/LV/AT/MGR) + Primary U84 theo **DoD D1/D2** trong rollup §7 — **không** claim Phase1/UAT (D3) khi còn FAIL/EXTERNAL/SPEC_GAP P0.

---

## 2. DoD (tóm — chi tiết ở rollup §7)

| Mức | Tên | Điều kiện tối thiểu |
|-----|-----|---------------------|
| **D1** | UC DONE slice | Happy path FE/mobile EVIDENCED + F5 + U78 log |
| **D2** | UC DONE full AC | D1 + fail-deep/scope AC của UC |
| **D3** | UAT / Phase1 | Toàn spine P0 D2 + Primary 7/7 + QC không C P0 |

✅ trên dashboard = **D1**, không phải D3.

---

## 3. Wave plan

| Wave | work_item_id | Scope | Owner | Entry | Exit | Status |
|------|--------------|-------|-------|-------|------|--------|
| **W0** | `PO-UC-DOD-LOCK-01` | DoD + rollup + plan | pm | — | Docs published | **CLOSED** |
| **W1** | `PO-UC-W1-HP02-RETEST-01` | Retest `TC-HP-02` / HP-02 | qa → (dev-fe nếu FAIL) | Stack up · U65 | EVIDENCED **hoặc** FAIL + defect Dev | **HOLD** — chờ sponsor lệnh chạy (PM đã rút DISPATCH hỏi-only) |
| **W2a** | `PO-UC-W2-HP03-FD-01` | `TC-HP-04` self-approve (+ optional HP-13) | qa | Task tồn tại từ FE | EVIDENCED / BLOCKED honest | PLANNED |
| **W2b** | `PO-UC-W2-HP05-CONTRACT-01` | `TC-HP-10` HĐ sau hire | qa | HP-04 context | EVIDENCED / soft residual | PLANNED |
| **W3a** | `PO-UC-W3-LV01-MOB-APPR-01` | `TC-LV-02` / J-MOB-05 | qa-device | mgr hier READY | EVIDENCED / BLOCKED | PLANNED |
| **W3b** | `PO-UC-W3-AT01-MOB-SUBMIT-01` | AT mobile full submit+approve | qa-device · dev-mobile | Nav GWC đã có | EVIDENCED | PLANNED |
| **W4** | `PO-UC-W4-LEAVE-DL-01` | P-LEAVE @ CO-DL Primary | devops → qa | **Sponsor:** «bootstrap môi trường dev» | HIM leave EVIDENCED · Primary 7/7 | **HOLD-EXTERNAL** |
| **W5a** | `PO-UC-W5-HP06-PAY-01` | `TC-HP-11` | qa | — | EVIDENCED / empty hợp lệ | PLANNED |
| **W5b** | `PO-UC-W5-LV-AT-FD-01` | LV-05/06 · AT-02/03 | qa | — | EVIDENCED | PLANNED |
| **W5c** | `PO-UC-W5-LV02-LADDER-01` | LV-02 ladder | sa → ba → dev → qa | Sponsor chốt `N` | SPEC_GAP đóng hoặc EVIDENCED L2 | **HOLD-SPEC** |
| **W6** | `PO-UC-W6-QC-HONESTY-01` | QC honesty D1/D2 rollup | qc | W1–W4 P0 closed | GWC/GO · không claim D3 mù | PLANNED |

---

## 4. Thứ tự ưu tiên (P0 → P2)

1. **P0** W1 HP-02 — evidence stale vs U84 Primary plan/req  
2. **P0** W4 leave DL — chỉ sau sponsor bootstrap  
3. **P1** W3 mobile approve leave + AT submit  
4. **P1** W2 HP-03/05  
5. **P2** W5 payroll / fail-deep / ladder  

Depth 1473 TC: **sau** P0/P1 spine — không xen vào W1.

---

## 5. Cấm

- Seed inbox/DB để “đủ task” (U65)  
- Invent leave EVIDENCED / invent `T_L1`  
- Gọi ✅ = UAT DONE  
- PM tự sửa `apps/**` (trừ sponsor «tự sửa»)

---

## 6. Handoff hiện tại

| Next | Action |
|------|--------|
| **sponsor** | Đọc DoD (rollup §7) + plan này — **chốt / chỉnh** nếu cần; lệnh rõ khi muốn chạy wave |
| **pm** | **Không** auto-dispatch khi sponsor chỉ hỏi · W1 đã WITHDRAW |
| **W4** | Chỉ khi sponsor: «bootstrap môi trường dev» leave CO-DL |

---

*PO-UC-CLOSURE-PLAN-01 · HOLD chờ sponsor*
