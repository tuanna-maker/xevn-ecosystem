# 🎯 PAYROLL SYNTHESIS — Sponsor Action Required (2026-08-13)

## 📋 Executive Summary
PM + BA team extracted + analyzed sponsor's payroll package (**Gửi P.CNTT.rar**, 67 files) and compiled into professional Excel review file.

**File ready:** [`SYNTHESIS-CNTT-PAYROLL-67FILES-20260813.xlsx`](SYNTHESIS-CNTT-PAYROLL-67FILES-20260813.xlsx)

---

## ✅ What's Complete
- ✅ 67 files extracted from sponsor's package (30 PDF policies + 39 XLSX data files)
- ✅ 6 business units analyzed (ĐPHH, TĐHK, Lương-giờ VP, LX-tuyến, LX-tải, VP-tỉnh)
- ✅ 30 policy documents catalogued
- ✅ 39 data files mapped (structure, columns, row count)
- ✅ 37 catalog entries proposed (ready for Settings menu)
- ✅ 19 key sponsor questions identified (gaps + conflicts to clarify)

---

## 🚀 Action Required From Sponsor (You)

### **STEP 1: Open & Review Excel File**
📁 File: `SYNTHESIS-CNTT-PAYROLL-67FILES-20260813.xlsx`

**5 Sheets to review:**
1. **"Guide"** — Read instructions (2 min)
2. **"Chính sách"** (30 rows) — All policies identified. Quick scan to verify completeness.
3. **"Dữ liệu"** (39 rows) — All data files mapped. Verify column names + row counts match your records.
4. **"Danh mục"** (37 rows) ← **CRITICAL** — Proposed catalog entries for Settings. **You must Approve (Y) or Reject (?) each row in "Duyệt" column.**
5. **"Xác nhận"** (19 rows) ← **MUST ANSWER** — 19 questions about ambiguities/conflicts. **Fill "Sponsor's Answer" column.**

---

### **STEP 2: Priority Questions to Answer** ⚠️ **BEFORE** Insert

**HIGH PRIORITY (must clarify):**
| # | Question | Impact |
|---|----------|--------|
| **Q2** | **KPI 1500 vs 1731 — what's the difference?** | Salary formula depends on this; wrong answer = wrong payroll calculation |
| **Q1** | Ca làm việc (schedule): Same code "S"/"HC" but different hours per region? SHARED or SEPARATE? | If separate, catalog needs region tag; if shared, need data conversion |
| **Q9** | Thưởng chuyên cần LX Tuyến: "0 bản tin" = bao nhiêu VNĐ? | Need amount to populate salary formula |
| **Q15** | QĐ 127A điều chỉnh Phụ lục Quy chế số 17 — can you provide that Phụ lục file? | Without it, we don't know what was changed |
| **Q18** | Tạm ứng lương: % of salary? (30%? 50%? 80%?) | Affects advance payment calculation |

**Fill other questions (Q3-8, 10-14, 16-17, 19) on Sheet 5 as well.**

---

### **STEP 3: Approve Catalog Entries (Sheet 4)**

Scan **"Danh mục"** sheet. For each row, decide:
- **Y** = Approve this catalog entry (add to Settings)
- **N** = Reject (don't add)
- **?** = Need clarification (write note in "Chú thích")

**Focus buckets:**
- THÀNH PHẦN LƯƠNG (salary components)
- LOẠI QUYẾT ĐỊNH (decision types)
- CA LÀM VIỆC (schedules)

If anything looks wrong, use "Chú thích" column to add notes.

---

### **STEP 4: Send Excel Back to PM**
Once complete:
1. Save file (keep same name)
2. Send to PM
3. PM will trigger autotest insert into system

---

## 🚫 CRITICAL: DO NOT INSERT DB YET
**NO automatic insert will happen until sponsor approval.** This is a safety gate to ensure payroll rules are 100% correct before going live.

---

## 📞 If You Have Questions
PM team standing by. Refer to:
- Full evidence: [`docs/journal/2026-08-13.md`](../journal/2026-08-13.md)
- 67 files location: [`docs/từ khách hàng/Gửi P.CNTT/`](../từ%20khách%20hàng/Gửi%20P.CNTT/)
- API catalog design: `docs/hrm/API_DESIGN_HRM_SETTINGS_E1B.md`

---

## ⏰ Timeline
- **Today (2026-08-13):** Excel file ready, sponsor review starts
- **Target:** Sponsor answers + approvals within 1-2 days
- **Then:** PM triggers insert wave (autotest, no manual DB edit)

---

**Status: AWAITING SPONSOR REVIEW ✋**

