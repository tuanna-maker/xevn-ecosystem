# Tieu chi kich hoat Hybrid Warehouse (Giai doan 2)

## Muc tieu
- Xac dinh nguong van hanh de chuyen tu OLTP-first sang mo hinh Hybrid Warehouse co kiem soat.
- Tranh nang cap som gay tang chi phi va tang do phuc tap van hanh.

## Nguong bat buoc kich hoat
- p95 API cau hinh (`/api/xbos/infrastructure/settings`) > 500ms trong 3 ngay lien tiep.
- p95 dashboard tong quan > 5s trong 3 ngay lien tiep.
- p95 bao cao drill-down > 20s trong 3 ngay lien tiep.
- Tong ban ghi nguon nghiep vu vuot 10 trieu ban ghi hoac toc do tang > 500k ban ghi/ngay.
- So luong truy van tong hop nang (group by + json parse lon) > 30% tong request gio cao diem.

## Dieu kien tien quyet
- Da bat telemetry slow-request va benchmark latency theo chu ky.
- Da co rollup job va bang read-model de kiem soat dashboard read-path.
- Da xac nhan index trong OLTP khong con du de dam bao SLA.

## Quyet dinh Go/No-Go
- PM + SA + Technical Manager duyet bang evidence tu:
  - script benchmark latency
  - log slow request
  - report khoi luong du lieu
- Neu 2/3 nhom metric (latency, volume, query pressure) deu vuot nguong -> Go cho Hybrid Warehouse.

## Ke hoach kich hoat
1. Dung ETL theo batch 5-15 phut tu PostgreSQL OLTP sang kho phan tich.
2. Chuyen dashboard tong hop sang read-model warehouse.
3. Giu OLTP cho giao dich online, khoa truy van tong hop nang o OLTP.

