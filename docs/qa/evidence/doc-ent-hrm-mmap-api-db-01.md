# Evidence — DOC-ENT-HRM-MMAP-API-DB-01

| Mục | Giá trị |
|-----|---------|
| work_item_id | DOC-ENT-HRM-MMAP-API-DB-01 |
| role | ba-data |
| lane | governance |
| date | 2026-08-03 |
| change_mode | **no delta** (ADD-only waived — không có gap vật lý chặn Pass) |
| sources | `doc-ent-hrm-mmap-ts-01.md` · TECH_SPEC_NEW **v1.2** §4.12 · §8 R-MMAP-* · SRS_NEW **v1.2** §3.7 AC-MMAP-* · API_CONTRACT_NEW **v1.1** · DB_DESIGN_NEW **v1.1** · Nest `recruitment/*` (read-only skim) |
| ack_status | **PASS_TO_PM** |
| next_owner | pm → optional **qc** docs spot |

## Verdict

**Không ADD** `API_CONTRACT_NEW` / `DB_DESIGN_NEW`.  
Pass AC-MMAP-RC-* · LV-FUND · WH-01 (và lá PARTIAL liên quan đã khóa hướng) **không** bị chặn bởi thiếu hợp đồng vật lý trên NEW pack — đủ **pointer / spine hiện có** theo chính sách SRS «Một phần» + TechSpec «không invent DDL».

Versions giữ: API_CONTRACT **v1.1** · DB_DESIGN **v1.1** (không bump).

---

## 1. Trace Pass → physical / pointer

| AC (SRS §3.7.2) | Pass GĐ1 (kỹ thuật) | SoT vật lý / pointer đã có | Gap chặn Pass? | Quyết định |
|----------------|---------------------|----------------------------|----------------|------------|
| **AC-MMAP-LV-FUND** | Xem số dư theo loại; gửi đơn trừ đúng số dư (≠ admin quỹ / rollover) | **API** §4.1 `GET …/leave-balance` + §4.2–4.5 leave-requests · **DB** `employee_leave_balances` + `leave_requests` · catalog loại nghỉ qua sync (TS-CAT / B04) | **Không** | No delta. Admin/rollover = **R-MMAP-DB-LV** deferred (không claim) |
| **AC-MMAP-RC-01** | HIRED → tạo/liên kết hồ sơ NV; list có mã sau refresh | **Pointer** TECH_SPEC §4.12 → `/api/hrm/recruitment/*` + `employees` (API §3 POST/GET) · Nest: `hire-employee-link` / pool stage `hired` + soft `employee_id` · API §11 «Recruitment … Phân hệ SoT riêng» | **Không** | No F.1 encyclopedia trên NEW pack — pointer đủ PARTIAL. Offer formal **OUT** (§4.12.1) |
| **AC-MMAP-RC-02** | Pipeline cố định NEW→…→HIRED/REJECTED/WITHDRAWN; list↔detail cùng scope | Nest `recruitment_candidates` status CHECK + `GET …/candidates` / `:id` (scope_parity evidence CRUD) · pointer §11 | **Không** | Không invent pipeline 13 bước / DDL NEW |
| **AC-MMAP-RC-03** | Tạo/cập nhật kết quả lịch PV; list→chi tiết | Nest `POST/PATCH /api/hrm/recruitment/interviews` (+ catalog twin ngoài SoT primary) · pointer §11 | **Không** | Không claim E2E UI thiếu bước sau lưu (SRS Fail path) |
| **AC-MMAP-WH-01** | List→dòng lịch sử vị trí / thuyên chuyển trên NV | **Pointer** TS-INV-WH → `employees` + `hr_decisions` (subtype điều chuyển = AC-MMAP-DEC-TR / API §7) · **không** bắt buộc bảng timeline mới | **Không** | Cấm invent `employee_work_history` Nest DDL trong wave này (ADR embed: tab Supabase = P3 ngoài spine NEW). «Timeline đầy đủ» ngoài Pass |
| AC-MMAP-ORG-01 | Cây XBOS publish đủ Pass | API B04 / synced_catalogs + operating-units (ngoài encyclopedia) · **R-MMAP-API-ORG** chart UI không bắt buộc DDL | Không (Pass tối thiểu) | No delta |
| AC-MMAP-ATT-GPS | GPS/geofence | API §11 attendance pointer · FaceID **OUT** | Không (inventory) | No delta / no FaceID DDL |
| AC-MMAP-SHIFT-01 | Catalog ca tiêu thụ | synced catalog + gắn ca · roster đầy đủ **OUT** | Không | No roster DDL |
| AC-MMAP-PF-01 | KPI/chu kỳ hướng | API §11 `/performance/*` pointer · 360/OKR **OUT** · **R-MMAP-PF** | Không | No 360 DDL |
| AC-MMAP-DEC-KT / DEC-TR | Loại quyết định KT/KL / điều chuyển | API §7 + DB `hr_decisions` (spine 11 FR) | Không | No delta |
| AC-MMAP-PR-FORM / PAY-01 | Công thức cố định + payslip mật | API §5 payroll + payslips · formula builder **OUT** | Không | No builder DDL |

---

## 2. R-MMAP-* disposition (TechSpec §8)

| Residual | Disposition ba-data |
|----------|---------------------|
| **R-MMAP-API-RC** | **Deferred — không chặn Pass.** F.1 sâu recruitment giữ ở phân hệ / Nest CODE-MEMORY; NEW pack giữ pointer §11 + TS §4.12. Owner: ba-data/sa chỉ nếu QC/PM yêu cầu encyclopedia lean F.1 (CR riêng) — **không** trong WI này |
| **R-MMAP-DB-LV** | **Deferred — không claim.** Pass LV-FUND = số dư + trừ đơn (đã đủ spine H03). Owner: ba-data khi product kéo admin quỹ/rollover vào GĐ1 |
| **R-MMAP-API-ORG** | Ngoài Pass cây XBOS — không DDL |
| **R-MMAP-PF** | Pointer performance — không DDL 360/OKR |
| **R-MMAP-OUT** | OT · Đào tạo · FaceID · 360 · formula builder · offer formal · roster đầy đủ — **LOCKED OUT** · cấm invent |

---

## 3. must_keep / forbidden (spot-check)

| Check | Status |
|-------|--------|
| 11 FR deep API F.1 (§1–§9) không wipe | Intact — không sửa file |
| DB spine §4.1–4.8 / FR map §6 không wipe | Intact — không sửa file |
| Không invent DDL GĐ2 (OT/Đào tạo/FaceID/360/builder/offer/roster) | Confirmed |
| Không apps/** · không seed · không e2e_pass invent | Confirmed |
| Prefer pointer over new tables | Confirmed (RC · WH · PF · GPS · SHIFT) |

---

## 4. Files touched

| Path | Action |
|------|--------|
| `docs/brand-new-documents-20270801/API_CONTRACT_NEW.md` | **Không đổi** |
| `docs/brand-new-documents-20270801/DB_DESIGN_NEW.md` | **Không đổi** |
| `docs/qa/evidence/doc-ent-hrm-mmap-api-db-01.md` | CREATE (file này) |

---

## completion_report

### Đã đóng
- Review TECH_SPEC v1.2 §4.12 / R-MMAP-* vs API_CONTRACT v1.1 + DB_DESIGN v1.1 + Nest recruitment skim.
- Kết luận **no physical gap blocking Pass** cho AC-MMAP-RC-* / LV-FUND / WH-01.
- Residual R-MMAP-API-RC / R-MMAP-DB-LV **deferred với owner** (không claim Pass admin quỹ; không encyclopedia F.1 RC trên NEW pack).
- Evidence no-delta ghi tại path này.

### Residual mở (không trong WI)
| ID | Owner | Trigger reopen |
|----|-------|----------------|
| R-MMAP-API-RC | ba-data + sa | QC/PM yêu cầu lean F.1 recruitment trên NEW pack (CR) |
| R-MMAP-DB-LV | ba-data | Sponsor/product kéo admin quỹ / rollover vào GĐ1 |
| Nest `employee_work_history` | product / ADR P3 | CR timeline Nest — **không** tự mở từ MMAP inventory |

### next_owner
pm

### next_dispatch_prompt (copy-ready)

```text
work_item_id: DOC-ENT-HRM-MMAP-QC-01
role: qc
lane: governance
read_first:
  - docs/qa/evidence/doc-ent-hrm-mmap-api-db-01.md
  - docs/qa/evidence/doc-ent-hrm-mmap-ts-01.md
  - docs/qa/evidence/doc-ent-hrm-mmap-srs-01.md
  - docs/brand-new-documents-20270801/TECH_SPEC_NEW.md §4.12 · §8
  - docs/brand-new-documents-20270801/API_CONTRACT_NEW.md §11 (recruitment pointer)
  - docs/brand-new-documents-20270801/DB_DESIGN_NEW.md §4.3 leave balances · §4.8 decisions
entry_criteria: ba-data DOC-ENT-HRM-MMAP-API-DB-01 = no delta PASS; TECH_SPEC v1.2 + SRS v1.2 AC-MMAP locked; 11 FR spine intact
exit_criteria:
  - Spot-check: API/DB versions vẫn 1.1; không DDL GĐ2; LV-FUND trỏ leave-balance; RC/WH pointer OK
  - GO / GWC docs wave MMAP inventory (SRS→TS→API/DB) với residual R-MMAP-* deferred ghi rõ
  - evidence: docs/qa/evidence/doc-ent-hrm-mmap-qc-01.md (hoặc path QC chọn)
forbidden: invent DDL · reopen 11 FR wipe · apps/**
ack_status target: PASS_TO_PM
```

### ack_status
**PASS_TO_PM**

### evidence_path
`docs/qa/evidence/doc-ent-hrm-mmap-api-db-01.md`

---

*DOC-ENT-HRM-MMAP-API-DB-01 — ba-data — 2026-08-03*
