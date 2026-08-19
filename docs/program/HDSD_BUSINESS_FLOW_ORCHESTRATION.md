# HDSD — Điều phối theo luồng nghiệp vụ (BF clusters)

**Program:** `P-HDSD-QA-SRS-01` · **Orchestration ID:** `PM-HDSD-BF-ORCH-01`  
**Sponsor lock:** U65 zero-seed · **parallel 4–6** sub-agent + Claude CLI cùng lúc (2026-08-01 sponsor) · tối ưu công suất máy

## Vấn đề đã thấy (retro)

| Triệu chứng | Nguyên nhân | Khắc phục |
|-------------|-------------|-----------|
| >50 sub-agent trong một phiên | Chia theo **bước HDSD** / TC lẻ (mutate spot, port fix, PNG…) | Chuyển sang **BF cluster** — 1 luồng = 1 squad |
| R5 chạy trước BUILD SHA | Không có **dependency graph** trên checklist | Mỗi đợt có **entry gate** rõ; cấm QA device trước APK pin |
| QA/QC lặp cùng WI | Bus không đóng đợt trước khi mở đợt kế | **Drain đợt N** → checklist ✅ → mới **Đ(N+1)** |

**SoT theo dõi:** bảng checklist §4 (cập nhật sau mỗi verdict) · `TEAM_WORKING_NOW.md` chỉ mirror **đợt active + in-flight**.

---

## Ba luồng nghiệp vụ chính — 11 doanh nghiệp (tập đoàn XeVN)

Mô hình: **1 holding (`main`) + 10 công ty thành viên** — mỗi DN cần cùng **3 quy trình HRM** dưới đây (khác persona, cùng pattern).

| BF ID | Tên luồng | Ai dùng (persona) | Quy trình XBOS↔HRM | Màn HRM chính |
|-------|-----------|-------------------|---------------------|---------------|
| **BF-01** | **Tuyển dụng & biên chế** | HR tập đoàn, Trưởng ĐVTV | Canvas QT tuyển dụng → Gửi YCTD → Inbox duyệt → Dashboard funnel | Ch07 Tuyển dụng · Ch10 YCTD · CC Inbox |
| **BF-02** | **Chấm công & nghỉ phép** | NV (`uat.nv####`) · QL (`uat.nv0002`) | Đơn nghỉ HRM → CC workflow inbox → Duyệt → Cập nhật chấm công | Ch08 Chấm công · Mobile Ch12 · CC Inbox |
| **BF-03** | **Hợp đồng & lương** | HR · Kế toán lương | Tạo NV → Ký HĐ → Chạy lương → Phiếu lương mobile | Ch05 Nhân sự · Ch06 HĐ/BH · Ch09 Lương · Mobile payslip |

### BF-01 — Kịch bản QA (1 agent = full path)

```text
1. ceo@xe.vn → XBOS Settings → Canvas QT tuyển dụng (active) → Lưu → F5
2. HRM embed → Tuyển dụng → Tạo YCTD → Gửi duyệt (POST 2xx)
3. CC Inbox → task tuyển dụng → Hoàn thành / Từ chối → F5
4. HRM dashboard funnel + headcount công ty thành viên (INT-02)
```

**J-* / TC map:** J-REC-WF-01..06 · TC-ECO-INT-02 · TC-HRM-HDSD-055 · TC-HDSD-07-* · UF-XBOS-10 inbox

### BF-02 — Kịch bản QA

```text
1. uat.nv0001 mobile → Đơn nghỉ phép → Gửi (FE → POST 2xx)
2. ceo@xe.vn CC Inbox → duyệt đơn (INT-03) → F5
3. uat.nv0001 mobile → tab Nghỉ / Chấm công — không ERR-NETWORK
4. uat.nv0002 → tab Duyệt (J-MOB-05) → Duyệt 1 pending
```

**J-* / TC map:** J-MOB-03/04/05 · TC-ECO-INT-03 · TC-HDSD-08-* · Ch08 HDSD

### BF-03 — Kịch bản QA

```text
1. ceo@xe.vn HRM → Nhân sự → Thêm NV → F5 (TC-HDSD-05-03-01)
2. Hợp đồng → Tạo HĐ (prefill NV + contract_type) → POST → F5
3. Chấm công → Tổng quan → marker đơn nghỉ (overview panel)
4. Lương kỳ · Mobile phiếu lương (nv0001)
```

**J-* / TC map:** J-HRM-01/03 · TC-HDSD-06-* · TC-HDSD-08-* · TC-HRM-HDSD-096 · J-MOB-04

---

## Ma trận phủ HDSD (không bỏ màn — gom theo BF)

| HDSD chương | BF-01 | BF-02 | BF-03 | Ghi chú |
|-------------|-------|-------|-------|---------|
| Ch05 Nhân sự | ○ | ○ | ● | NV create = spine BF-03 |
| Ch06 HĐ/BH | ○ | ○ | ● | HĐ mutate |
| Ch07 Tuyển dụng | ● | ○ | ○ | |
| Ch08 Chấm công | ○ | ● | ○ | Leave + overview |
| Ch09 Lương | ○ | ○ | ● | |
| Ch10 CO/QĐ/CV/WF | ● | ○ | ○ | YCTD |
| Ch11 Settings | ○ | ○ | ○ | Sweep đợt 5 |
| Ch12 Mobile | ○ | ● | ● | ESS |
| XBOS Ch04 WF/Inbox | ● | ● | ○ | Canvas + inbox |
| W4 INT-01..03 | ○ | ● | ○ | Catalog · headcount · WF bridge |

● = luồng chính · ○ = regression spot trong cùng đợt hoặc sweep sau

---

## Lịch chạy theo đợt (checklist)

**Quy tắc:** Mỗi đợt = **1 BF** hoặc **drain** · tối đa **4** Task · **QC 1 lần / đợt** (không QC từng TC lẻ).

### Đ0 — DRAIN + PARALLEL (4–6 agent — sponsor 2026-08-01)

| ☐ | WI | Owner | BF | Exit gate |
|---|-----|-------|-----|-----------|
| ☐ | `QA-HDSD-MOB-CH12-01-R6` | qa-device | BF-02 | J-MOB-04 🟢 · 03 GWC · **05 → R7** |
| ☒ | `D-HDSD-MOB-JMOB05-APPROVALS-NAV-01` | dev-mobile | BF-02 | READY_FOR_QA |
| ☒ | `D-HDSD-MOB-BUILD-R7-01` | dev-mobile | BF-02 | SHA EF82AED…4681 |
| ☒ | `QA-HDSD-MOB-CH12-01-R7` | qa-device | BF-02 | J-MOB-03/04/05 🟢 · EF82AED APK |
| ☐ | `QA-HDSD-MUTATE-RET-03-HRM-R3` | qa | BF-03 | R9 **PARTIAL** TC-06 🟢 · → FE-12 |
| ☒ | `QA-HDSD-BF-02-CC-INT03-01` | qa | BF-02 | **TC-ECO-INT-03 portal 🟢** · await R7 mobile |
| ☒ | `QA-HDSD-BF-01-CANVAS-01` | qa | BF-01 | **J-REC-WF-01 🟢** · YCTD → FE-06 |
| ☒ | `QA-HDSD-BF-SWEEP-01` | qa | sweep | **27🟢 4🟡** · matrix +25 |

**Cấm duplicate** cùng `work_item_id` đã DISPATCHED chưa verdict. **Đ1–Đ3** mở khi Đ0 mobile R7 + mutate R3 có verdict (PASS hoặc owner fix dispatched).

### Đ1 — BF-02 Mobile + INT-03 (sau Đ0) ✅ GWC

| ☒ | WI | Owner | Phụ thuộc |
|---|-----|-------|------------|
| ☐ | `QA-HDSD-BF-02-01` | qa-device | optional full E2E chain (C-BF02-E2E-01) |
| ☒ | `QC-HDSD-BF-02-GATE-01` | qc | **GWC** · J-MOB-03/04/05 + INT-03 🟢 |

**Một Task qa-device** — full script § BF-02 (không tách J-MOB riêng lẻ nữa).

### Đ2 — BF-03 Hợp đồng & lương (sau Đ0 mutate R2)

| ☐ | WI | Owner | Phụ thuộc |
|---|-----|-------|------------|
| ☐ | `QA-HDSD-BF-03-01` | qa | R2 PASS |
| ☒ | `QA-HDSD-MUTATE-RET-03-HRM-R14` | qa | **TC-06+07+08 🟢** FE-16 U65 JD→YCTD |
| ☒ | `QC-HDSD-BF-03-GATE-01` | qc | **GWC** · Đ2 mutate slice closed 2026-08-01 |
| ☒ | **Đ2 mutate slice** | — | TC-06/07/08 🟢 · Ch09 salary GWC |
| ☒ | `QA-HDSD-BF-03-BULK-01` | qa | **59/59** · 307🟢 · mutate GWC preserved · 2026-08-01 |
| ☒ | `QC-HDSD-BF-03-FULL-GATE-01` | qc | **GWC** · BF-03 full bucket closed · 2026-08-01 |
| ☒ | **BF-03 full bucket** | — | 59/59 · 307🟢 · 22🟡 defer |

### Đ3 — BF-01 Tuyển dụng & WF (sau Đ1+Đ2)

| ☐ | WI | Owner | Ghi chú |
|---|-----|-------|---------|
| ☒ | `QA-HDSD-BF-01-01` | qa | **PASS** 2026-08-01 · submit-workflow 201 · inbox +1 |
| ☒ | `QC-HDSD-BF-01-GATE-01` | qc | **GWC** 2026-08-01 · Đ3 spine closed |
| ☒ | **Đ3 BF-01 spine** | — | J-REC-WF-01 🟢 · UF-XBOS-10 load-only · GWC residual → Đ4/sweep |
| ☒ | `QC-HDSD-BF-01-GATE-01-R2` | qc | **GWC** · Đ3+approve CLOSED · C-BF01-JRECWF03 ☑ |
| ☒ | **BF-01 Đ3+approve** | — | J-REC-WF-01+03 🟢 · AC-REC-WF-03 PASS |
| ☒ | `QA-HDSD-BF-01-BULK-01` | qa | **55/55** · +40🟢 +15🟡 · C-BF01-FULL-TC mapped · 2026-08-01 |
| ☒ | `QC-HDSD-BF-01-FULL-GATE-01` | qc | **GWC** · C-BF01-FULL-TC bounded closed · 2026-08-01 |
| ☒ | **BF-01 full bucket** | — | 55/55 · 40🟢+15🟡 · J-REC-WF-01/03 spine |
| ☒ | `QA-HDSD-BF-02-BULK-01` | qa | **19/19** · +12🟢 +7🟡 · Ch08 portal · 2026-08-01 |
| ☒ | `QC-HDSD-BF-02-FULL-GATE-01` | qc | **GWC** · BF-02 full bucket closed · 2026-08-01 |
| ☒ | **BF-02 full bucket** | — | 19/19 · 270🟢 · 7🟡 defer |

### Đ4 — HDSD sweep (phần còn ⬜ trong matrix)

| ☐ | WI | Owner | Scope |
|---|-----|-------|-------|
| ☒ | `BA-HDSD-BF-MAP-01` | ba-process | **257 TC ⬜ → BF map** · `HDSD_BF_TC_MAP_DELTA.md` · R-SWEEP-02/03 §8 |
| ☒ | `QA-HDSD-BF-SWEEP-01` | qa | **27🟢 4🟡** · matrix +25 (supersedes QA-HDSD-SWEEP-01) |
| ☒ | `QA-HDSD-BF-SWEEP-02` | qa | **117🟢 11🟡 0🔴** · 122 TC §7 · 2026-08-01 |
| ☒ | `QA-HDSD-MATRIX-PROMOTE-SWEEP-02` | qa | **+113🟢 +10🟡** · matrix 212🟢 · 2026-08-01 |
| ☒ | `QA-HDSD-BF-SWEEP-02-MOB-01` | qa-device | **3/7 🟢** · 4🟡 Settings/Scope gap · 2026-08-01 |
| ☒ | `MOB-NAV-SETTINGS-01` | dev-fe | Profile→Settings→Scope · vitest 13/13 · 2026-08-01 |
| ☒ | `QA-MOB-NAV-SETTINGS-01-RET` | qa-device | **6/7 🟢** · 006/032/033 promoted · 2026-08-01 |
| ☒ | **MOB-NAV chain** | — | Settings/Scope nav closed · TC-MOB-007 🟡 P2 defer |

### Đ5 — Gate Phase 2 tổng

| ☐ | WI | Owner | Entry |
|---|-----|-------|-------|
| ☒ | `QC-HDSD-P2-GATE-01-R4` | qc | **GWC** 2026-08-01 · Đ0–Đ4 bounded closed |
| ☒ | **P2 slice Đ0–Đ4** | — | 218🟢 · 132⬜ BF bulk open · NOT PROD |
| ☒ | `QA-HDSD-W5-SCOPE-01` | qa | **2/2 🟢** · member scope 403/409 · 2026-08-01 |
| ☒ | **W5 bucket** | — | 0⬜ · TC-M01 pair closed |
| ☒ | `QC-HDSD-P2-GATE-01-R5` | qc | **GWC** · P2 refresh · 135 TC · 2026-08-01 |
| ☒ | **P2 program refresh** | — | BF+W5 mapped · 309🟢 delta · NOT PROD |
| ☒ | `QA-HDSD-MATRIX-SYNC-01` | qa | **C-P2-MATRIX-SYNC ☑** · 309🟢 header · 2026-08-01 |
| ☒ | `QA-DEVICE-HDSD-FIG-CH12-01` | qa-device | **C-R2-02 ☑** · 8/8 hrm-12 PNG · 2026-08-01 |
| ☒ | `BA-HDSD-CLIENT-REBUILD-01` | ba-docs | **PASS** R3 · HTML+PDF · 8/8 hrm-12 · 2026-08-01 |
| ☒ | `QC-HDSD-CLIENT-FINAL-01` | qc | **GWC** client-final doc · C-R2-02 CLOSED · 2026-08-01 |
| ☒ | `QA-HDSD-BF-03-PROFILE-DEPTH-01` | qa | **TC-028..034 🟢** · 317🟢 · 2026-08-01 |
| ☒ | `QC-HDSD-BF-03-PROFILE-CLOSE-01` | qc | **GWC** · C-BF03-PROFILE-01 CLOSED · R-PROFILE-DENY-01 P3 · 2026-08-01 |
| ☒ | `QA-HDSD-MOB-BF03-DEPTH-01` | qa-device | **4/4 🟢** · C-BF03-MOB-DEPTH-01 CLOSED · 2026-08-01 |
| ☒ | `QC-HDSD-MOB-BF03-CLOSE-01` | qc | **GO** · mobile depth CLOSED · 2026-08-01 |
| ☒ | `QA-HDSD-BF-03-MUTATE-DEFER-01` | qa | **TC-041 🟢** · 025/049 🟡 · 322🟢 · 2026-08-01 |
| ☒ | `QC-HDSD-BF-03-MUTATE-DEFER-CLOSE-01` | qc | **GWC** · 041🟢 · 025/049 🟡 · 2026-08-01 |
| ☒ | `D-HDSD-BF-03-SOFTDEL-FE-01` | dev-fe | READY_FOR_QA · DataTable menu fix · 2026-08-01 |
| ☒ | `QA-HDSD-BF-03-SOFTDEL-RET-01` | qa | PASS · TC-025 🟢 archive 201 · 2026-08-01 |
| ☒ | `QC-HDSD-BF-03-SOFTDEL-CLOSE-01` | qc | **GWC CLOSED** R-MUTATE-SOFTDEL-01 · 2026-08-01 |
| ☒ | `D-HDSD-BF-03-BH-400-01` | dev-be | READY_FOR_QA · soft-resolve policy · 2026-08-01 |
| ☒ | `QA-HDSD-BF-03-BH-RET-01` | qa | FAIL · TC-049 🟡 0 policy → 404 · 2026-08-01 |
| ☒ | `D-HDSD-BF-03-BH-FE-PICKER-01` | dev-fe | READY_FOR_QA · picker + CTA · 2026-08-01 |
| ☒ | `QA-HDSD-BF-03-BH-RET-02` | qa | PASS · TC-049 🟢 POST 201 · 2026-08-01 |
| ☒ | `QC-HDSD-BF-03-BH-CLOSE-01` | qc | **GWC CLOSED** R-MUTATE-BH-400-01 · 2026-08-01 |
| ☒ | `D-HDSD-BF-03-BH-POL-DTO-01` | dev-fe | READY_FOR_QA · DTO builders · 2026-08-01 |
| ☒ | `QA-HDSD-BF-03-BH-POL-DTO-RET-01` | qa | PASS · create 201 + SM 200 · 2026-08-01 |
| ☒ | `QC-HDSD-BF-03-BH-POL-DTO-CLOSE-01` | qc | **GWC CLOSED** R-INS-POL-* · 2026-08-01 |
| ☒ | `DO-HDSD-MUTATE-SOFTDEL-BH-DEPLOY-01` | devops | **PASS** VPS 424ddaf · enroll slice · 2026-08-01 |
| ☒ | `DO-HDSD-BF-03-BH-POL-DTO-DEPLOY-01` | devops | **PASS** VPS 294b969 · C-HOLD-DEPLOY-DTO CLOSED · 2026-08-01 |
| ☐ | `QA-HDSD-MUTATE-SOFTDEL-BH-8088-SMOKE-01` | qa | SoftDel+BH :8088 smoke — **IN FLIGHT** |
| ☐ | `DO-VPS-XBOS-NODE-PLINK-01` | devops | xbos-node.yml on main + plink `$tmp` fix — **DISPATCHED** |

---

## Roster sub-agent / đợt (không HDSD-step)

| Role | Cursor | Claude CLI (`--dangerously-skip-permissions`) |
|------|--------|-----------------------------------------------|
| dev-fe / dev-be / dev-mobile | Đ0–Đ3 BF (segment file) | **BF song song** — fix bug QA phát hiện · **không** trùng file Cursor đang sửa |
| qa / qa-device | Đ0–Đ5 · mobile=qa-device | **QA/QC HDSD + testcase** theo `CLAUDE_CLI_HDSD_RESUME_PACKET` §3 |
| qc | BF gates | **QC spot** BF-01/03 khi Cursor qa bận mobile |
| ba-process | — | BF-MAP · TC→BF |
| ba-docs / rebuild | — | P2-REBUILD sau Đ5 |

**2026-08-01 sponsor:** Claude **được** sửa code + chạy QA/QC — heartbeat bắt buộc · Cursor giữ mobile qa-device + dispatch không trùng WI.

| Role | Đ0 | Đ1 | Đ2 | Đ3 | Đ4 | Đ5 |
|------|----|----|----|----|----|-----|
| dev-fe | — | — | fix nếu R2 FAIL | — | — | — |
| dev-be | — | — | — | — | — | — |
| dev-mobile | — | — | — | — | — | — |
| qa | R2 | — | BF-03 | BF-01 | SWEEP | — |
| qa-device | R6 | BF-02 | — | — | — | — |
| qc | — | BF-02 | BF-03 | BF-01 | — | P2-R4 |
| ba-process | — | — | — | — | MAP | — |
| ba-docs | — | — | — | — | — | rebuild sau Đ5 GWC |

**Dev chỉ vào khi BF QA FAIL** — không dispatch Dev+QA song song “phòng hờ”.

---

## Cập nhật checklist (PM)

Sau mỗi verdict: đổi ☐ → ✅ tại §4 · ghi bus `PM -> ALL | BF-ORCH đợt DN closed` · `TEAM_WORKING_NOW` chỉ hiện **1 đợt active**.

**Peer Claude (B3 HDSD rebuild):** chạy sau **Đ5 GWC** — không song song BF QA.

---

## TC ⬜ → BF map (Đ4 — BA-HDSD-BF-MAP-01)

**Companion SoT:** `docs/program/HDSD_BF_TC_MAP_DELTA.md`

| BF | TC ⬜ | Đợt QA | Residual |
|----|-------|--------|----------|
| BF-01 | 55 | Đ3 | — |
| BF-02 | 19 | Đ1 | mobile J-MOB pending depth |
| BF-03 | 59 | Đ2 | Ch05/06/09 dialog mutate |
| sweep | 122 | Đ4 batch 2 | **R-SWEEP-02** 2FA stub · **R-SWEEP-03** in-app guide |
| W5 | 2 | Đ5 | member scope negative |

**R-SWEEP-02** (`TC-HRM-HDSD-152`): Tab Bảo mật — đổi mật khẩu 🟢 · UI 2FA chưa ship → defer W5 hoặc spec_gap → dev-fe.  
**R-SWEEP-03** (`TC-HRM-HDSD-173`..`176`): In-app guide chưa implement → defer W5 / OUT P2; TC 174–176 blocked 🟢.

---

## Tham chiếu

- Matrix TC: `docs/qa/HDSD_SRS_TESTCASE_MATRIX.md`
- **BF ↔ TC delta:** `docs/program/HDSD_BF_TC_MAP_DELTA.md`
- Journey: `docs/program/PROGRAM_JOURNEY_MAP.md` (J-REC-WF, J-MOB, J-HRM)
- Program cũ (wave W0–W4): `docs/program/HDSD_QA_PROGRAM.md` — **BF clusters thay cách dispatch**, không thay coverage goal
