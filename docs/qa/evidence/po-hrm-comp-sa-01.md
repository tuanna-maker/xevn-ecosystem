# PO-HRM-COMP-SA-01 — Architecture / NFR boundary (competitive expand)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-COMP-SA-01` |
| **Role** | sa · lane governance |
| **Date** | 2026-08-03 |
| **Priority** | P1 |
| **Status** | BOUNDARY LOCKED (docs) · `ack_status: PASS_TO_PM` |
| **Inputs** | `PO_HRM_COMPETITIVE_CAPABILITY_MAP.md` · `SRS_NEW.md` §3.7.3 · `TECH_SPEC_NEW.md` v1.2 · `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE` · `ADR-HRM-RBAC-SCOPE-LADDER` |
| **Cấm** | `apps/**` code · claim parity Workday / SAP SF · mở FR/DDL cho OUT GĐ1 không có CR sponsor |

> Mục đích: cho phép mở rộng năng lực cạnh tranh (MISA localization + pattern ESS) **mà không** phình thành clone AMIS / Workday, và **không** làm vỡ bất biến nền tảng XeVN.

---

## 1. Context summary

| Fact (từ SoT) | Implication |
|---------------|-------------|
| PO map định vị XeVN = **đa pháp nhân logistics + CC + XBOS WF**, không phải MISA full suite | Expand theo **khác biệt XeVN** trước; localization VN chỉ tới mức GĐ1 đã khóa |
| SRS §3.7.3 + TS §4.12.1 khóa OUT: OT, Đào tạo, FaceID, 360/OKR liên tục, formula builder, offer/checklist đầy đủ | Dev/BA **không** mở FR sâu / endpoint NEW / DDL cho nhóm này trong wave GĐ1 |
| TS ownership: XBOS = catalog SoT + JWT + WF; HRM = tiêu thụ catalog + giao dịch HR | Cấm HRM publish catalog tập đoàn; cấm XBOS ghi bảng giao dịch HRM |
| ADR scope: `scope_parity` list↔get-by-id↔mutate; soft-delete; JWT plane `main` | Mọi feature mới (kể cả BHXH depth) phải giữ resolver + soft-delete |

**Non-goals (explicit):** parity Workday talent/global payroll; native accounting MISA; Face/QR clocks; productize attrition AI trong GĐ1.

---

## 2. Architecture logic (GĐ1 — giữ nguyên topology)

```text
[Portal / Command Center] ──embed──► [HRM FE]
         │ JWT (xbos-api RS256)
         ▼
   [xbos-api] ──catalog publish / WF tasks──► [hrm-api]
     SoT: tenant · RBAC · WF · catalog · org/legal
                                              │
                                              ▼
                                   HR ops: employee · leave · time(GPS)
                                   payroll batch (fixed formula) · decisions
                                              ▲
                                   [Mobile ESS] ──offline idempotent──┘
```

**Differentiator spine (IN — bảo vệ khi “đuổi MISA”):**

1. Multi-entity + scope ladder (`main` / member / memberships[])  
2. Workflow engine dùng chung (CC → leave / recruit / catalog gov)  
3. Catalog 2-tier (XBOS publish → HRM pull/`synced_catalogs`)  
4. ESS leave/time (web + mobile GPS/geofence — **không** FaceID)  
5. Payroll batch + công thức tham chiếu cố định (không formula builder)

---

## 3. IN GĐ1 (architecture acceptance)

| Capability | Architecture rule | Spec anchor | Competitive note |
|------------|-------------------|-------------|------------------|
| **Multi-entity / holding** | JWT + named scope helpers; group rollup ≠ member filter; 409 default on mismatch | ADR-GROUP-CEO · ADR-SCOPE-LADDER · TS §2.2 | XeVN DNA — **phải E2E**, không downgrade vì feature mới |
| **Workflow (XBOS)** | Instance/task trên xbos-api; HRM bridge sự kiện; **cấm** seed inbox để pass | FR-UC-B03 · TS-WF | Hơn mid-market VN khi liên phân hệ |
| **Catalog 2-tier** | XBOS SoT versioned publish; HRM chỉ sync/consume; picker dùng `catalogKey`+version | FR-UC-B04 · TS-CAT | Điểm khác biệt — **không** để HRM tự SoT danh mục tập đoàn |
| **ESS leave / balance** | leave-requests + leave-balance; WF ladder ngày = BR (BA khóa); scope self/manager | FR-UC-H03/M03 · AC-MMAP-LV-FUND | Bám Personio/Bamboo UX; ladder = P0 BA |
| **ESS time GPS** | Check-in/out geofence; late/update-requests; mobile blur payslip riêng | UC-H02/M02 · AC-MMAP-ATT-GPS | MISA có Face/QR — XeVN GĐ1 = GPS only |
| **Payroll batch fixed formula** | Period → compute → lock; công thức tham chiếu FR-UC-H04; NFR-03 batch 500 NV | FR-UC-H04 · AC-MMAP-PR-FORM · NFR-03 | Giải thích dòng phiếu = P1 copy/lines — **không** AI builder |
| **Hire → employee tối thiểu** | HIRED → link hồ sơ NV; checklist đầy đủ OUT | AC-MMAP-RC-01 | Onboard checklist = P1 SRS delta riêng, không kéo G-P2 |
| **Performance density** | Cycle/KPI gắn đợt; **không** OKR continuous / 360 | AC-MMAP-PF-01 | P1 density OK; talent suite = Sau |
| **Statutory VN (honest)** | List HĐ/BH chuyên biệt hoặc waiver Q-INS-01; **không** claim cổng BHXH/TNCN | FR-UC-HRM-25 · Q-INS-01 | MISA mạnh ở đây — GĐ1 trung thực depth list/export tối thiểu |

---

## 4. OUT / deferred (cấm pretend GĐ1)

| ID | Capability | Classification | Why locked |
|----|------------|----------------|------------|
| G-P2-ACCT-NATIVE | Native accounting / GL kiểu MISA | **OUT GĐ1** · phase tích hợp sau | BRD/TS boundary: XeVN ecosystem riêng; D-INT = API+WF only |
| G-P2-FACE-QR | FaceID / QR / WiFi hard clocks | **OUT** SRS §3.7.3 · TS §4.12.1 | GPS giữ IN; cấm gộp Face vào Pass GPS |
| G-P2-TNCN-PORTAL | Full TNCN kê khai portal | **Sau GĐ1** | Xem §5 options — chưa chọn |
| G-P2-BHXH-GATEWAY | Cổng BHXH điện tử / tờ khai full | **Sau GĐ1** | List/export tối thiểu ≠ cổng |
| G-P2-GOAL-OKR | OKR / goal continuous | **OUT** | AC-MMAP-PF-01 chỉ KPI/chu kỳ |
| G-P2-LND | L&D / succession / đào tạo khóa | **OUT** | SRS §3.7.3 |
| G-P2-ATTRITION-AI | Attrition AI productize | **OUT** | Dashboard counters ≠ AI product |
| G-P2-FORMULA | Formula builder / AI tạo CT lương | **OUT** | AC-MMAP-PR-FORM |
| G-P2-OT-FULL | OT đăng ký + hệ số ×1,5/×2… | **OUT** mặc định | Q-OT-TR; cần CR kéo vào GĐ1 |
| G-P2-OFFER-CHK | Offer formal + checklist onboard đầy đủ | **OUT** (tối thiểu hire vẫn IN) | AC-MMAP-RC-01 |
| — | Workday/SF talent / global payroll / workforce planning | **Never claim** | PO map §1 — không cam kết parity |

**PO rule (enforce):** mở rộng P1 (onboard chk tối thiểu, shift/OT *nếu CR*, perf density, pay explain, VN-ins depth) chỉ qua **SRS ADD + sponsor confirm** — không “làm cho bằng MISA” trên menu stub.

---

## 5. Integration options — BHXH / TNCN (Sau GĐ1) — **no pick**

Sponsor chưa chọn. SA ghi **ba phương án** để PO/BA không mặc định code vào GĐ1.

### Option A — Adapter outbound (file / API partner)

| | |
|--|--|
| **Shape** | HRM giữ SoT hồ sơ BH/thuế tối thiểu; job xuất CSV/XML/JSON theo schema đối tác (BHXH / đại lý thuế / MISA kế toán nếu có) |
| **Pros** | Ít phụ thuộc runtime; giữ soft-delete & scope trong HRM; rollout theo tenant |
| **Cons** | UX “một nút nộp” yếu hơn MISA; mapping schema thay đổi theo năm |
| **NFR impact** | Batch job + audit export; không phá catalog publisher; scope = company của kỳ |
| **Cost / timeline** | Thấp–trung · sau GĐ1 khi Q-INS đóng |
| **Failure** | Schema drift → export FAIL rõ; không silent partial submit |

### Option B — Embedded statutory module (in-app portal)

| | |
|--|--|
| **Shape** | Module TNCN/BHXH trong HRM (tờ khai, trạng thái nộp) — vẫn gọi cổng ngoài qua connector |
| **Pros** | UX cạnh tranh MISA; audit trong app |
| **Cons** | Scope creep cao; cần FR/DB/API đầy đủ; rủi ro compliance ownership |
| **NFR impact** | Nhiều mutate mới → **bắt buộc** scope_parity tests; secrets cổng ngoài; không hardcode credential |
| **Cost / timeline** | Cao · program riêng Sau GĐ1 |
| **Failure** | Coi UI mock “đã nộp” khi connector down = **FAIL** (BR-MOCK) |

### Option C — XBOS Integration Hub + event bridge

| | |
|--|--|
| **Shape** | XBOS sở hữu connector registry / secrets; HRM emit `PAYROLL_LOCKED` / `INSURANCE_PERIOD_READY`; hub đẩy partner; status event về HRM |
| **Pros** | Khớp DNA XeVN (XBOS orchestration); tái dùng cho kế toán / máy công sau; tách secret khỏi hrm-api |
| **Cons** | Phức tạp hơn A; cần contract sự kiện + DLQ; không sẵn trong GĐ1 |
| **NFR impact** | At-least-once + DLQ (TS §3); **cấm** XBOS ghi trực tiếp bảng payslip/insurance HRM — chỉ status/ack |
| **Cost / timeline** | Trung–cao · align platform hub |
| **Failure** | Duplicate submit → idempotency key bắt buộc |

**SA recommendation (non-binding until sponsor):** ưu tiên đánh giá **A (MVP Sau GĐ1)** rồi nâng **C** nếu ≥2 đối tác (BHXH + kế toán). **B** chỉ khi sponsor yêu cầu UX parity MISA có ngân sách FR riêng.  
**Không** chọn A/B/C trong wave này — không mở Dev.

---

## 6. Solid NFR — bất biến khi chase feature parity

Mọi wave P1/P2 cạnh tranh **FAIL architecture review** nếu vi phạm:

| Invariant | Rule | Gate |
|-----------|------|------|
| **scope_parity** | List / get-by-id / mutate cùng resolver (`resolveHrmListScope` / XBOS tương đương) | Jest scope + QA J-* L2.5; 409 đúng ≠ data leak |
| **soft-delete** | Không hard-delete business rows; ngưng = soft | DB_DESIGN + API contract |
| **XBOS catalog publisher SoT** | HRM **consume only**; publish/approve trên xbos catalog-governance | TS-CAT · FR-UC-B04 |
| **JWT issuer** | Chỉ xbos-api phát RS256; hrm validate | TS §2.2 · NFR-09 |
| **Cross-service DB** | Cấm đọc/ghi DB qua biên XBOS↔HRM | Events + DLQ |
| **No FaceID in GPS Pass** | AC-MMAP-ATT-GPS độc lập Face/QR | QA evidence tách |
| **No formula builder** | Fixed formula + line explain tối đa | AC-MMAP-PR-FORM |
| **No seed for UF** | U65 FE-only nghiệm thu | sponsor-zero-seed |
| **Observability** | JSON log + `http_requests_total`; không log token/secret | NFR baseline |
| **Display-ready** | Labels từ BE; FE không aggregate domain | OS 28 / senior-engineering |

**Latency / batch (giữ):** NFR-01/02 gateway non-batch; NFR-03 payroll 500 NV < 30 phút — không đánh đổi bằng tắt scope check.

---

## 7. Decision options (program stance) — trade-off

| Option | Scope | Risk | SA verdict |
|--------|-------|------|------------|
| **A. Freeze GĐ1 boundary (this doc)** | IN §3 + OUT §4; P1 chỉ qua SRS ADD | Thấp — tránh clone MISA | **Recommend** |
| **B. Pull MISA parity into GĐ1** | Face, TNCN portal, formula, L&D | Cao — vỡ timeline + NFR | Reject |
| **C. Claim global HCM parity** | Workday-class talent/analytics | Rất cao — mất định vị | Reject |

**Recommended:** Option A. Differentiator = multi-entity + catalog 2-tier + shared WF + ESS GPS/leave + honest VN list — không phải feature count vs AMIS.

---

## 8. Impacted systems & dependencies

| System | Impact if boundary ignored |
|--------|----------------------------|
| hrm-api | Scope bugs, Face/OT DDL premature, catalog write drift |
| xbos-api | Loss of publisher SoT; WF bypass |
| portal embed | Mock/empty dishonest; 409 storm |
| mobile | Face SDK bloat; offline integrity |
| BA/SRS | FR sâu cho OUT → NO-GO QC docs |
| QA spine | False green nếu seed / Face stub |

**Dependencies for P1 expand (not this SA task):** ba-process leave ladder BR; Q-INS-01 product chốt; PO spine E2E.

---

## 9. Rollout / checkpoint

| Checkpoint | Owner | Exit |
|------------|-------|------|
| SA boundary published (this evidence) | sa | PASS_TO_PM |
| BA backlog từ PO map §3 + ladder | ba-process | SRS ADD đề xuất P1 only |
| PO/sponsor chốt integration A/B/C (Sau GĐ1) | pm + sponsor | Không Dev statutory portal trước chốt |
| QA spine P0 (hire-pay, leave, late) | qa | U78 browser; zero-seed |
| TM/QC | technical-manager / qc | NO-GO nếu OUT bị code hoặc claim Workday parity |

---

## 10. Validation & acceptance evidence plan

| Claim | Evidence required |
|-------|-------------------|
| IN multi-entity / catalog / WF | Existing ADR + spine/matrix J-* / UF — không reopen bằng competitive wave |
| OUT Face/OKR/L&D/AI/accounting | Grep FR/DDL/apps không mở; SRS §3.7.3 + TS R-MMAP-OUT còn LOCK |
| BHXH/TNCN not picked | Không có `work_item` Dev statutory portal không CR |
| NFR invariants | scope_parity tests green trên module đụng; soft-delete + catalog pull-only trong review |

---

## 11. Residual / open

| ID | Item | Owner | Expiry / trigger |
|----|------|-------|------------------|
| R-COMP-INT-01 | Chọn Option A/B/C BHXH·TNCN | sponsor + pm | Sau GĐ1 / khi Q-INS đóng + nhu cầu kê khai |
| R-COMP-OT-01 | OT có CR kéo GĐ1? | sponsor (Q-OT-TR) | Mặc định OUT |
| R-COMP-BA-01 | Leave day→ladder BR + P1 onboard chk SRS delta | ba-process | Trước Dev P1 |
| R-COMP-ADR | ADR stub dài hạn (optional) | sa | Chỉ nếu sponsor muốn promote §3–§6 → `docs/architecture/` |

**Không residual P0 architecture** cho GĐ1 topology — đã khóa bởi TS v1.2 + ADR scope.

---

## completion_report

**Closed**
- Khóa IN GĐ1 architecture: multi-entity, WF, catalog 2-tier, ESS leave/time (GPS), payroll batch fixed formula, hire tối thiểu, VN list honesty.
- Khóa OUT/deferred: native accounting MISA, Face/QR clocks, full TNCN/BHXH portal, OKR/L&D, attrition AI productize, formula builder, OT/đào tạo/360 (SRS §3.7.3).
- Ghi 3 integration options A/B/C cho BHXH/TNCN — **không pick**.
- NFR bất biến: scope_parity, soft-delete, XBOS publisher SoT, no cross-DB, no Face-in-GPS-Pass, U65.
- Reject claim Workday parity và reject kéo MISA full vào GĐ1.

**Residual:** R-COMP-INT-01 (sponsor pick), R-COMP-BA-01 (ba-process), optional ADR promote.

**Not done / cấm:** không sửa `apps/**`; không chọn A/B/C; không claim Phase 1 DONE / Workday parity.

---

## Handoff

| Field | Value |
|-------|--------|
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | `pm` (intake) → **`ba-process`** (backlog BR/UC + leave ladder; không code) |
| **evidence_path** | `docs/qa/evidence/po-hrm-comp-sa-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-COMP-BA-01
role: ba-process
priority: P1
lane: governance

## Mission
Chuẩn hóa PO_HRM_COMPETITIVE_CAPABILITY_MAP §3 → backlog BR/UC; khóa leave day→approval ladder; đề xuất SRS ADD chỉ cho P1 GĐ1 (onboard chk tối thiểu, shift/OT nếu còn mở Q-OT, pay explain, VN-ins depth). Tôn trọng SA boundary PO-HRM-COMP-SA-01.

## Read first
1. docs/qa/evidence/po-hrm-comp-sa-01.md (IN/OUT + NFR — BẮT BUỘC)
2. docs/program/PO_HRM_COMPETITIVE_CAPABILITY_MAP.md
3. SRS_NEW.md §3.7 (AC-MMAP-*) + §3.7.3 OUT
4. TECH_SPEC_NEW.md §4.12.1 R-MMAP-OUT

## Deliverable
docs/qa/evidence/po-hrm-comp-ba-01.md:
- Bảng capability → BR/UC đề xuất (P0 spine vs P1 ADD vs P2 deferred)
- Leave day ladder BR draft (measurable AC)
- Cấm FR sâu cho FaceID / TNCN portal / OKR / L&D / formula builder / native accounting
- Không pick integration A/B/C (SA giữ mở cho sponsor)

entry_criteria: SA PASS_TO_PM PO-HRM-COMP-SA-01
exit_criteria: backlog traceable; no apps/**; no claim Workday parity
ack_status: PASS_TO_PM
```

**pm_dispatch_hint:** Sau BA — tiếp `qa` spine E2E đã mở; **không** Dev feature OUT; statutory portal chỉ sau sponsor pick R-COMP-INT-01.
