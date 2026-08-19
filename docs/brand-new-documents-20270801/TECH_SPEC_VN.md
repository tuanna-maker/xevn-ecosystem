# Tài liệu Đặc tả Kỹ thuật — Hệ sinh thái XeVN OS v1

## 1. Môi trường chạy
Node.js 20+, TypeScript 5.x, Express với định tuyến mô-đun hóa. React 18, React Native 0.76+.

## 2. Xác thực và danh tính
JWT RS256 truy cập 2 giờ, refresh token luân phiên 30 ngày. Redis blacklist cho đăng xuất và hủy bỏ. Đường dẫn xác thực nằm trong xbos-api.

## 3. Hiệu năng và bộ nhớ đệm
Pool kết nối mỗi dịch vụ: tối thiểu 5, tối đa 20, hết thời gian chờ không hoạt động 10 phút. PgBouncer tùy chọn. Mục catalog được bộ nhớ đệm theo tenant và khóa phiên bản.

## 4. Tác vụ nền và nhắn tin
Cron bảng lương hàng loạt vào ngày 25 hàng tháng. Lịch trình lan truyền catalog. Hàng đợi BullMQ cho thông báo, nhắc nhở, khóa bảng lương.

## 5. Lưu trữ
Lưu trữ đối tượng tương thích S3 cho tài liệu nhân viên và PDF phiếu lương. MinIO cho môi trường phát triển, AWS S3 cho môi trường sản xuất.

## 6. Đặc điểm Mobile
Thông báo đẩy FCM, Google Maps hoặc Mapbox cho geofence, Play Integrity phát hiện GPS giả mạo trên Android.
