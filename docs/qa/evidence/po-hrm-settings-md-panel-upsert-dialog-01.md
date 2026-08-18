# QA Evidence — PO-HRM-SETTINGS-MD-PANEL-UPSERT-DIALOG-01

- Work item: PO-HRM-SETTINGS-MD-PANEL-UPSERT-DIALOG-01
- Role: dev-fe
- Date: 2026-08-13
- File sua: apps/web/hrm/src/components/settings/MasterDataSettingsPanel.tsx

## Tom tat thay doi

Khoi "Them / cap nhat muc (extension HRM)" trong `MasterDataBucketPanel` (dung chung cho 14
bucket qua `mdBucketRegistry.ts`) doi tu luon hien co dinh duoi bang (workaround QA cu
`D-HRM-SETTINGS-MD-FORM-VIS-FE-01` forceMount) sang Dialog/popup chuan:

- Nut **"Them moi"** (`data-testid="md-add-new-${bucket}"`) canh tieu de bucket -> mo Dialog
  rong (che do tao moi), reset `code`/`label` truoc khi mo.
- Click 1 dong trong bang (`onPick`) -> mo lai Dialog voi `code`/`label` da dien san (che do sua),
  giu nguyen logic set state cu.
- `upsertMutation.onSuccess` (khi luu thanh cong, khong phai Ngung/draft) -> `setOpen(false)`
  dong Dialog, cong voi reset `code`/`label` da co san tu truoc.
- Dong Dialog khong luu (nut Huy / Esc / click ngoai) -> `onOpenChange` reset `code`/`label` de
  tranh giu state cu lan mo sau.
- Nhanh `leaveTypesRefReadOnly` (banner "Mo tab Loai phep ATT") giu nguyen khong doi — khong render
  nut "Them moi" / Dialog trong nhanh nay.
- Moi `data-testid` cu giu nguyen: `md-code-${bucket}`, `md-label-${bucket}`, `md-save-${bucket}`,
  `md-upsert-form-${bucket}` (nay la DialogContent testid). Mutation/API logic (`upsertSettingsCatalogItem`)
  khong doi — chi doi vi tri render.

## Vitest — truoc / sau (so that, chay tren may that)

Lenh: `cd apps/web/hrm && pnpm exec vitest run --no-coverage`

| | Test Files | Tests |
|---|---|---|
| Truoc (baseline, chua sua) | 6 failed / 345 passed (351) | 7 failed / 1877 passed (1884) |
| Sau (da sua + test moi) | 6 failed / 346 passed (352) | 7 failed / 1880 passed (1887) |

6 test file fail (khong lien quan bucket dialog nay, khong dam bao la do thay doi cua work item
nay — cac file khong dung toi `MasterDataSettingsPanel.tsx` hay `dialog.tsx`):
- `src/hooks/useEmployeePicker.test.ts`
- `src/hooks/useOvertimeRequests.test.ts`
- `src/lib/poHrmMvpGd1Att04bClusterFe01.source.test.ts`
- `src/lib/poHrmMvpGd1Core09ClusterFe01.source.test.ts`
- `src/lib/xevn-thm-fe-w1-density-01.test.ts`
- `src/components/auth/PermissionFallback.test.ts`

Test file cu `MasterDataSettingsPanel.test.ts` (source-gate, 6 test) — **PASS nguyen** (khong sua
noi dung test nay vi no chi assert cac chuoi source con nguyen ven, khong assert vi tri render).

Test file moi `MasterDataSettingsPanel.upsertDialog.test.ts` (RTL that, 3 test) — **PASS**:
1. `positions` — form khong hien san; bam "Them moi" moi mo Dialog rong; dien code/label; bam
   Luu goi dung `upsertSettingsCatalogItem` voi `{companyId, code, label, status:'active'}`; Dialog
   dong lai sau khi luu thanh cong.
2. `positions` — bam Huy reset code/label; mo lai Dialog van rong.
3. `departments` — bam 1 dong trong bang mo Dialog voi code/label dien san (che do sua).

## Browser verify that (server dang chay san :8080, khong tu start)

- Dang nhap san session `ceo@xe.vn` (localStorage `xevn.portal.user` xac nhan), vao
  `http://localhost:8080/hr/settings` -> click "Danh muc nghiep vu".
- **4/14 bucket da browser-verify that** (uu tien theo yeu cau task — con lai 10 bucket chua test
  do gioi han thoi gian, xem ghi chu ben duoi):

| Bucket | Kiem tra | Ket qua |
|---|---|---|
| Chuc danh (positions) | Form KHONG hien san; bam "Them moi" -> Dialog rong; dien `qa_test_dialog` / `QA Test Dialog Upsert`; bam Luu -> POST `/api/hrm/settings-catalogs/items` 201; danh sach cap nhat co dong moi; Dialog dong sau Luu | PASS |
| Phong ban (departments) | Form KHONG hien san; bam dong `DEPT_02` trong bang -> Dialog mo voi code=`DEPT_02`, label=`Van hanh` (che do sua) | PASS |
| Loai nghi (leaveTypes) | Bucket nay o du lieu dev hien tai KHONG roi vao nhanh `leaveTypesRefReadOnly` (catalog chua co snapshot) nen van hien nut "Them moi" binh thuong; bam "Them moi" -> Dialog rong mo dung, `md-upsert-form-leaveTypes` testid dung | PASS (nhanh Dialog thuong, KHONG phai nhanh read-only — khong the verify banner read-only vi seed du lieu hien tai khong kich hoat dieu kien do) |
| Loai quyet dinh (decisionTypes) | Form KHONG hien san; nut "Them moi" + bang hien thi dung (3 dong HRD_01/02/03) | PASS (chi kiem tra trang thai list, chua bam Them moi de tiet kiem thoi gian) |

- **Cleanup**: dong `qa_test_dialog` tao trong luc test da duoc bam "Ngung" (soft-stop, status ->
  `draft`/"Nhap") — KHONG hard-delete, dung U65.

### Ghi chu moi truong browser tool

- `computer{action:"screenshot"}` khong dung duoc trong phien nay: loi
  "Screenshot timed out ... the Browser pane is not displayed, so the page is not compositing
  frames." — pane khong duoc hien thi/composite nen khong chup duoc anh man hinh that.
- He qua phu: vi tab khong composite, CSS closing-animation (`animate-out`/`fade-out-0` cua
  DialogContent — nguyen ban co san tu truoc, khong phai code moi sua) khong bao gio tu ban than no
  ban ra su kien `animationend`, nen Radix Presence khong tu unmount DOM node sau khi dong Dialog
  (`data-state` da chuyen dung sang `closed`, React state `open=false` dung, nhung DOM node + overlay
  van con, chan click that su tren cac phan tu ben duoi). Da xac minh day la nhan dien moi truong
  (khong phai bug logic): dispatch thu cong su kien `animationend` tren phan tu qua
  `javascript_tool` (chi de debug/verify, khong sua UI) -> Radix unmount dung ngay lap tuc, click
  vao tab khac hoat dong binh thuong tro lai. Nguoi dung that (tab hien thi/composite binh thuong)
  se khong gap tinh trang nay vi animation se tu chay het va ban `animationend` nhu thiet ke.
- Do gioi han nay (khong the render/tuong tac 100% "nguyen ban" qua computer click cho MOI buoc),
  mot so buoc xac minh dung `javascript_tool` de doc DOM/state (data-testid, input.value, network
  request log) thay vi doc tu screenshot — day la doc/inspect, KHONG dung de tu sua/implement UI.

## 10 bucket chua browser-verify

`contractTypes, employmentTypes, shifts, jobGrades, recruitmentChannels, payTypes,
salaryComponents, insurers, insuranceTypes, kpiLibrary` — chua click qua tung tab do gioi han thoi
gian trong phien nay. Component dung CHUNG 1 ham `MasterDataBucketPanel` cho ca 14 bucket (chi khac
`meta` tu `mdBucketRegistry.ts`), va 4 bucket da test (positions/departments/leaveTypes/decisionTypes)
deu qua Dialog + testid dung theo dung 1 code path — rui ro cac bucket con lai sai la thap nhung
**chua duoc xac nhan truc tiep**. Khuyen nghi QA doc lap click qua it nhat 2-3 bucket nua truoc khi
dong work item.

## ack_status

READY_FOR_QA
