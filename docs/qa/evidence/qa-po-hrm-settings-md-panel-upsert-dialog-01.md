# QA Evidence — QA-PO-HRM-SETTINGS-MD-PANEL-UPSERT-DIALOG-01

- Work item: QA-PO-HRM-SETTINGS-MD-PANEL-UPSERT-DIALOG-01
- Role: qa
- Date: 2026-08-13
- Muc tieu: phu not 10/14 bucket con lai chua browser-verify tu evidence dev-fe
  (`docs/qa/evidence/po-hrm-settings-md-panel-upsert-dialog-01.md`) cho work item goc
  `PO-HRM-SETTINGS-MD-PANEL-UPSERT-DIALOG-01`.

## Moi truong

- Server dang chay san (KHONG tu start): `netstat -ano` xac nhan LISTENING tren `:8080` (PID 25504)
  va `:28001` (PID 5272).
- Truy cap `http://localhost:8080` — session da dang nhap san (localStorage giu session tu phien
  truoc, avatar "AD" hien thi o goc). Vao `Cai dat` -> `Danh muc nghiep vu` (`?tab=master-data`).
- **Cung han che moi truong nhu dev-fe da ghi nhan**: `computer{action:"screenshot"}` va
  `read_page` tra ve viewport `0x0` / loi "Browser pane is not displayed, so the page is not
  compositing frames" trong suot phien nay — pane khong composite frame nen KHONG chup duoc anh
  man hinh that va KHONG dung duoc click toa do qua `computer` tool.
- **Workaround dung**: tuong tac qua `javascript_tool` (khong phai de sua UI, chi de doc DOM/state
  va dispatch DOM event that — click/pointerdown/pointerup dung `data-testid` on dinh co san tu
  code, khong doan class). Xac nhan cach nay hoat dong dung: click tab chuyen dung bucket (kiem tra
  bang du lieu doi dung theo tab), click "Them moi" mo dung Dialog voi `md-upsert-form-${bucket}`,
  input `md-code-${bucket}` / `md-label-${bucket}` dung gia tri rong hoac prefill dung theo dong
  duoc click.
- Cung ghi nhan lai hien tuong dev-fe da neu: sau khi dong Dialog (Esc hoac nut "Huy"),
  `data-state` chuyen dung sang `closed` (React state dung) nhung DOM node khong tu unmount vi
  animation `animationend` khong tu ban ra duoc trong moi truong khong composite frame nay — day la
  gioi han moi truong test tool, KHONG phai bug logic. De tranh DOM cu chan click o buoc sau, da
  dispatch thu cong `animationend` (chi de cleanup giua cac buoc test, khong sua UI) va xac nhan
  Radix unmount dung ngay.
- Console 404: `GET http://localhost:8080/xevn-logo.png` lap lai nhieu lan (moi lan chuyen tab) —
  da kiem tra qua `read_network_requests`, la asset logo tinh bi thieu tu truoc (khong lien quan
  Dialog fix nay, khong phai loi moi phat sinh). Khong co console error nao khac (khong co React
  warning/error, khong co exception tu Dialog/mutation) trong suot 10 bucket test.

## Ket qua — 10/10 bucket con lai da test

| Bucket (key) | Ten VN | Co du lieu? | Form KHONG hien san | "Them moi" -> Dialog rong | Click dong -> prefill dung | Dong Dialog dung (Huy/Esc) | Ket qua |
|---|---|---|---|---|---|---|---|
| contractTypes | Loai hop dong | Co (5 dong) | OK | OK (code/label = "") | OK (dong 1: `HDHV` / "Hop dong hoc viec") | OK (Esc va Huy deu test, `data-state=closed` dung) | PASS |
| employmentTypes | Loai hinh lao dong | Khong (empty state "Chua co muc") | OK | OK (code/label = "") | N/A (khong co dong de test prefill — trang thai rong hop le, khong phai bug) | OK (Huy) | PASS |
| shifts | Ca lam viec | Co (3 dong) | OK | OK (code/label = "") | OK (dong 2: `SHF_02` / "Ca dem") | OK (Huy) | PASS |
| jobGrades | Ngach bac | Khong (empty state) | OK | OK (code/label = "") | N/A (rong hop le) | OK (Huy) | PASS |
| recruitmentChannels | Kenh tuyen dung | Co (4 dong) | OK | OK (code/label = "") | OK (dong 1: `CSO_01` / "Website") | OK (Huy) | PASS |
| payTypes | Ban chat / loai TP luong | Co (3 dong) | OK | OK (code/label = "", chi 2 input code+label, KHONG co field payroll dac biet nao khac) | OK (dong 2: `luong` / "Luong") | OK (Huy) | PASS |
| salaryComponents | Thanh phan luong (danh muc) | Khong (empty state) | OK | OK (code/label = "", chi 2 input, khong co field phuc tap) | N/A (rong hop le) | OK (Huy) | PASS |
| insurers | Nha bao hiem | Khong (empty state) | OK | OK (code/label = "") | N/A (rong hop le) | OK (Huy) | PASS |
| insuranceTypes | Loai BH | Khong (empty state) | OK | OK (code/label = "") | N/A (rong hop le) | OK (Huy) | PASS |
| kpiLibrary | Thu vien KPI | Co (3 dong) | OK | OK (code/label = "") | OK (dong 3: `KPI_OTIF` / "Ty le giao dung han OTIF") | OK (Huy) | PASS |

Ghi chu rieng cho `payTypes` va `salaryComponents` (nghi co nhanh dac biet lien quan payroll theo
yeu cau task): da kiem tra danh sach input trong Dialog qua DOM
(`dialog.querySelectorAll('input, select, textarea')`) — ca hai chi co dung 2 input
`md-code-${bucket}` / `md-label-${bucket}`, giong het cac bucket khac. Khong phat hien nhanh dac
biet, field an, hay logic khac trong Dialog cho 2 bucket nay — dung chung 100% component
`MasterDataBucketPanel` nhu 12 bucket con lai.

Khong bucket nao trong 10 bucket nay roi vao nhanh dac biet kieu `leaveTypesRefReadOnly`
(banner thay vi form) — tat ca deu hien nut "Them moi" va Dialog binh thuong.

## Cleanup

Khong tao record moi nao trong phien QA nay (chi mo Dialog "Them moi" roi bam "Huy"/Esc de kiem
tra form rong, khong bam "Luu" o bat ky bucket nao) — khong co du lieu rac can don.

## Tong ket voi evidence dev-fe (4/14 bucket truoc do)

positions, departments, leaveTypes, decisionTypes (dev-fe, PASS) + contractTypes,
employmentTypes, shifts, jobGrades, recruitmentChannels, payTypes, salaryComponents, insurers,
insuranceTypes, kpiLibrary (qa, PASS) = **14/14 bucket da browser-verify, tat ca PASS**. Khong phat
hien bug logic nao trong Dialog fix nay o bat ky bucket nao.

## ack_status

PASS_TO_PM
