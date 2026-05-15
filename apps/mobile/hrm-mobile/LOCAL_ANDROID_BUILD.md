# Build APK local (Android Studio / Gradle) — mặc định

Luồng chuẩn trong repo: **không phụ thuộc EAS/Expo cloud** để ra file APK; dùng **Android Studio** hoặc **`gradlew`** trên máy.

## 1. Chuẩn bị một lần

- **JDK 17** (Android Studio / Temurin).
- **Android Studio** + SDK (đặt `ANDROID_HOME` / `ANDROID_SDK_ROOT` trỏ tới SDK, ví dụ `C:\Users\<you>\AppData\Local\Android\Sdk`).
- Từ **gốc monorepo**: `pnpm install`.

## 2. Liên kết Gradle plugin (Windows + pnpm — bắt buộc trước khi sync Gradle)

Gradle trên Windows thường lỗi `includeBuild` với đường dài trong `node_modules\.pnpm\@react-native+...`. Script sau tạo **junction** `android/.rn-gradle-plugin` trỏ tới plugin thật (đã gitignore):

```bash
cd apps/mobile/hrm-mobile
pnpm run android:link-plugin
```

Sau mỗi lần `pnpm install` / đổi phiên bản `react-native`, nên chạy lại lệnh này.

## 3. Cách A — Android Studio (khuyến nghị)

1. **File → Open** → chọn thư mục `apps/mobile/hrm-mobile/android` (không mở cả monorepo nếu không quen multi-module).
2. Đợi Gradle sync xong.
3. **Build → Generate Signed Bundle / APK** hoặc **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
4. Bản **release** ký bằng keystore của bạn; bản **debug** dùng keystore mặc định của project để thử nhanh.

## 4. Cách B — dòng lệnh (APK release)

Từ `apps/mobile/hrm-mobile` (đã set `ANDROID_HOME`):

```bash
pnpm run android:apk
```

Lệnh này: `android:link-plugin` → `gradlew assembleRelease --no-daemon`. APK thường ở:

`android/app/build/outputs/apk/release/`

(Lần đầu có thể cần cấu hình signing trong `android/app/build.gradle` cho `release`.)

## 5. Biến môi trường app (API dev)

Tạo `apps/mobile/hrm-mobile/.env` (không commit), ví dụ:

```env
EXPO_PUBLIC_HRM_API_BASE_URL=http://<host-dev>:3001
EXPO_PUBLIC_DEFAULT_TENANT_ID=xevn
EXPO_PUBLIC_DEFAULT_COMPANY_ID=holding
```

Giá trị `EXPO_PUBLIC_*` được bundle vào lúc build — chỉnh trước khi build APK.

## 6. Nếu vẫn lỗi Gradle trên Windows

- Lỗi **`Could not find or load main class org.gradle.wrapper.GradleWrapperMain`** hoặc Gradle không đọc được script trong `node_modules` (đường dẫn **Unicode**, ví dụ `OneDrive\...\Tài liệu\...`): script `pnpm run android:apk` / `node scripts/gradle.cjs` dùng **`subst`**: gán tạm một ổ đĩa (Z:→…) trỏ tới **gốc monorepo** rồi chạy `gradlew` từ `ổ:\apps\mobile\hrm-mobile\android` (toàn ASCII). Sau build, ổ được gỡ (`subst … /d`).
- Tuỳ chọn: đặt repo dưới đường dẫn **ASCII** (ví dụ `C:\dev\xevn-ecosystem`) rồi mở lại `android/`.
- Hoặc dùng **WSL** (Linux) mở cùng repo và chạy `./gradlew assembleRelease`.

## 7. EAS / Expo cloud (tuỳ chọn)

Chỉ dùng khi không muốn cài Android Studio hoặc cần build trên máy chủ Expo. Chi tiết token / project: `EXPO_BUILD_CHECKLIST.md`.
