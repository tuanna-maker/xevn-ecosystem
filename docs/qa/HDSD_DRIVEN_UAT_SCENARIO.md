# Kịch bản UAT — HDSD hệ sinh thái (XBOS · HRM · Mobile)

**Program:** `HDSD-P2-FULL-01` v2.0  
**Ma trận TC:** [`HDSD_SRS_TESTCASE_MATRIX.md`](./HDSD_SRS_TESTCASE_MATRIX.md) — **360 TC** (scan 30/07/2026)  
**Nguyên tắc:** Test **từng bộ HDSD** — XBOS và HRM là **hai sản phẩm**, không gom một luồng HRM embed.

## Chuẩn bị L0

```bash
pnpm run qc:dev-stack      # hrm-api :28001 + xbos-api :28002
pnpm run qc:fe-be-health   # portal + proxy
pnpm run dev:web-only      # portal :5173 (W2b embed)
pnpm --filter vite_react_shadcn_ts dev   # HRM standalone :8080/hr/ (W2a canonical)
# Tùy chọn W2a alt: pnpm run dev:hrm-standalone → :5175 base /
```

---

## Waves

| Wave | Bộ HDSD | TC range (v2) | Path đọc | Persona | Evidence |
|------|---------|---------------|----------|---------|----------|
| **W0** | Cổng chung | `TC-ECO-001` … `TC-ECO-008` | `ecosystem/HDSD_ECOSYSTEM_CH01_*` | ceo@xe.vn | `hdsd-uat-eco-*.md` |
| **W1** | **XBOS** | `TC-XBOS-HDSD-001` … `TC-XBOS-HDSD-138` | `xbos/HDSD_XBOS_*`, `HDSD_XEVN_CH03_*`, `CH04_*` | ceo@xe.vn | `hdsd-uat-xbos-*.md` |
| **W2a** | **HRM standalone** | `TC-HRM-HDSD-*` @ Entry **standalone** | `hrm/*` + `http://127.0.0.1:8080/hr/*` | ceo@xe.vn | `hdsd-uat-hrm-standalone-*.md` |
| **W2b** | **HRM embed** | `TC-HRM-HDSD-*` @ Entry **embed** | `hrm/*` + `http://127.0.0.1:5173/command-center/hrm/*` | ceo@xe.vn | `hdsd-uat-hrm-embed-*.md` |
| **W3** | Mobile | `TC-MOB-001` … `TC-MOB-033` | `hrm/HDSD_XEVN_CH12_MOBILE_HRM.md` | uat.nv0001@xe.vn | `hdsd-uat-mobile-*.md` |
| **W4** | Liên thông | `TC-ECO-INT-01` … `TC-ECO-INT-03` | Catalog · headcount · WF | ceo@xe.vn | `hdsd-uat-integration-*.md` |
| **W5** | Scope member | `TC-XBOS-HDSD-M01`, `TC-HRM-HDSD-M01` | XBOS+HRM negative | du-lich.ceo@xe.vn | `hdsd-uat-member-*.md` |

---

## W0 Cổng chung — checklist

- [ ] `TC-ECO-001` — Mục đích & phạm vi portal
- [ ] `TC-ECO-002` … `TC-ECO-004` — Login Cổng (cách vào · nút · persona)
- [ ] `TC-ECO-005` — Sau login chọn sản phẩm (CC / dashboard / HRM)
- [ ] `TC-ECO-006` — Rail phân hệ GROUP vs NHÂN SỰ
- [ ] `TC-ECO-007` — Phiên & lỗi chung (timeout, 401)
- [ ] `TC-HRM-HDSD-001` … `005` (Ch.0) — Entry standalone + embed menu parity

## W1 XBOS — checklist

### Command Center (Ch.1)

- [ ] `TC-XBOS-HDSD-001` … `008` — CC tổng quan GROUP + UF map
- [ ] `TC-XBOS-HDSD-009` — Rail XBOS vs HRM

### Dashboard vận hành (Ch.4)

- [ ] `TC-XBOS-HDSD-010` … `014` — Cockpit `/cockpit` (UF-XBOS-10)
- [ ] `TC-XBOS-HDSD-015` … `017` — `/dashboard/organization`
- [ ] `TC-XBOS-HDSD-018` … `019` — customers · partners
- [ ] `TC-XBOS-HDSD-020` … `022` — kpi-policy · kpi-dashboard
- [ ] `TC-XBOS-HDSD-023` — catalog-governance
- [ ] `TC-XBOS-HDSD-024` … `026` — settings/* pattern · hr stub

### Legacy CC & phiên (CH02)

- [ ] `TC-XBOS-HDSD-027` … `056` — Login · phiên · CC legacy · HRM embed rail

### Cài đặt tổ chức (CH03)

- [ ] `TC-XBOS-HDSD-057` … `086` — Shell · đơn vị · pháp nhân · cổ đông (UF-XBOS-02..04)
- [ ] `TC-XBOS-HDSD-087` … `107` — Phòng ban · RBAC · RACI tab (UF-XBOS-06,07,12,13)

### Workflow · Catalog · KPI (CH04 WF)

- [ ] `TC-XBOS-HDSD-108` … `131` — Inbox · Canvas WF · RACI matrix (UF-XBOS-08,07)
- [ ] `TC-XBOS-HDSD-132` … `133` — Catalog sync · governance (UF-XBOS-09,14,15)
- [ ] `TC-XBOS-HDSD-134` … `138` — KPI widget CC (UF-XBOS-10)

> **Cấm** dừng W1 ở tab HRM embed — phải đủ TC-XBOS trước khi W2.

### W2a / W2b — bảng entry (dual-entry)

| Entry | Wave | Base URL | Ghi chú |
|-------|------|----------|---------|
| **Standalone W2a** | HRM độc lập | `http://127.0.0.1:8080/hr/*` | Cổ mặc định `apps/web/hrm/vite.config.ts` (`port: 8080`, `base: /hr/`). |
| **Embed W2b** | HRM nhúng CC | `http://127.0.0.1:5173/command-center/hrm/*` | Portal `:5173` bắt buộc trước khi mở rail NHÂN SỰ. |
| *(tùy chọn)* | W2a alt | `http://127.0.0.1:5175/*` | `pnpm run dev:hrm-standalone` — chỉ khi QA cần base `/`; không thay W2a canonical. |

## W2 HRM — checklist (chạy **2 lần**: standalone + embed)

### Ch.0 Entry

- [ ] `TC-HRM-HDSD-001` … `005` — Vào app standalone vs embed; shell nút (embed only)

### Ch.1 Nhân sự

- [ ] `TC-HRM-HDSD-006` … `035` — List · dialog Tạo/Sửa · hồ sơ chi tiết (UF-HRM-01,03 · J-HRM-01/02)

### Ch.2 HĐ · BH

- [ ] `TC-HRM-HDSD-036` … `053` — Hợp đồng CRUD · BHXH (UF-HRM-02,04)

### Ch.3 Tuyển dụng

- [ ] `TC-HRM-HDSD-054` … `071` — 11 tab + dialog kế hoạch (UF-HRM-12)

### Ch.4 Chấm công

- [ ] `TC-HRM-HDSD-072` … `088` — Bảng chấm · ca · đơn nghỉ (UF-HRM-05,16 · J-HRM-06)

### Ch.5 Lương

- [ ] `TC-HRM-HDSD-089` … `105` — Kỳ lương · phiếu lương · tạm ứng (UF-HRM-06)

### Ch.6 Công ty · QĐ · CV · DVC · Fleet

- [ ] `TC-HRM-HDSD-106` … `146` — Headcount · quyết định · tasks · DVC · fleet (UF-HRM-MENU-05,15)

### Ch.7 Settings · Báo cáo

- [ ] `TC-HRM-HDSD-147` … `176` — Settings tabs · catalog sync · reports · in-app guide (UF-HRM-10,11 · MENU-16,17)

**Ghi rõ entry mode** mỗi block evidence: `standalone` (`http://127.0.0.1:8080/hr/*`) | `embed` (`http://127.0.0.1:5173/command-center/hrm/*`)

**Mutate AC (U65):** Tạo NV → Lưu → F5 — map `TC-HRM-HDSD-*` dialog rows.

## W3 Mobile — checklist

- [ ] `TC-MOB-001` … `008` — Login · Scope · Home · FAB
- [ ] `TC-MOB-009` … `015` — Check-in · history · team directory (J-MOB-02)
- [ ] `TC-MOB-016` … `020` — Leave wizard · update requests (J-MOB-03)
- [ ] `TC-MOB-021` … `024` — Payslip list/detail/summary (J-MOB-04)
- [ ] `TC-MOB-025` … `028` — Manager approvals · reject dialog (J-MOB-05)
- [ ] `TC-MOB-029` … `032` — Profile tabs · contracts/BHXH (J-MOB-06)
- [ ] `TC-MOB-033` — Notifications + settings (J-MOB-07,08)

## W4 Liên thông — checklist

- [ ] `TC-ECO-INT-01` — XBOS catalog publish → HRM settings pull (UF-HRM-10)
- [ ] `TC-ECO-INT-02` — Headcount công ty ↔ XBOS đơn vị (UF-HRM-MENU-15)
- [ ] `TC-ECO-INT-03` — HRM request → CC workflow inbox (UF-XBOS-08)

## W5 Scope member — checklist

- [ ] `TC-XBOS-HDSD-M01` — Member CEO CC rollup 403/409 (UF-XBOS-11)
- [ ] `TC-HRM-HDSD-M01` — Member CEO HRM mutate blocked (UF-HRM-13)

---

## Mẫu evidence

```markdown
### [XBOS] HDSD Ch.3 §3.1 — Danh sách đơn vị
- Bộ: XBOS
- TC: TC-XBOS-HDSD-0XX
- UF: UF-XBOS-02
- FR: FR-UC-XBOS-ORG-02
...
```

```markdown
### [HRM-standalone] HDSD Ch.5 §5.1 — Danh sách NV
- Bộ: HRM
- TC: TC-HRM-HDSD-0XX
- Entry: http://127.0.0.1:8080/hr/employees
...
```

```markdown
### [HRM-embed] HDSD Ch.5 §5.1 — Danh sách NV
- Bộ: HRM
- TC: TC-HRM-HDSD-0XX
- Entry: http://127.0.0.1:5173/command-center/hrm/employees
...
```

## QC gate

1. Inventory `HDSD_ECOSYSTEM_INDEX` — màn XBOS vs HRM tách cột  
2. W0–W5 đều có evidence gắn **TC ID** từ matrix v2  
3. Matrix [`HDSD_SRS_TESTCASE_MATRIX.md`](./HDSD_SRS_TESTCASE_MATRIX.md) cập nhật verdict ⬜→🟢 theo wave  
4. Coverage summary **360 TC** — PASS count khớp evidence folder
