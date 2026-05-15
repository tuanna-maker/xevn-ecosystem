# Checklist Expo / EAS (tuỳ chọn)

**Mặc định trong repo:** build APK **local** với Android Studio / Gradle — xem **`LOCAL_ANDROID_BUILD.md`**.

File này chỉ cần khi bạn dùng **EAS Build** (cloud) hoặc `eas login` / token cho CI. **Không dán mật khẩu / token vào chat** — chỉ lưu vào máy hoặc GitHub Secrets.

## 1. Tài khoản Expo

| Thông tin | Lấy ở đâu | Ghi chú |
|-----------|-----------|---------|
| Email đăng nhập | expo.dev → Profile | Dùng cho `eas login` |
| Mật khẩu / SSO | (bạn tự biết) | Chỉ nhập trên máy bạn |

## 2. Access token (khuyến nghị cho máy/CI)

| Thông tin | Lấy ở đâu | Dùng làm gì |
|-----------|-----------|-------------|
| **EXPO_TOKEN** | Expo Dashboard → Account (avatar) → **Access tokens** | Biến môi trường khi chạy `eas build` (không cần login tương tác). URL dạng: `https://expo.dev/accounts/<slug-của-bạn>/settings/access-tokens` |

Tạo token kiểu **Granular** hoặc classic, quyền tối thiểu: build/read nếu có tùy chọn.

## 3. Project EAS (sau khi link repo)

Trong thư mục `apps/mobile/hrm-mobile`, chạy một lần (sau khi đã `eas login`):

```bash
cd apps/mobile/hrm-mobile
npx eas-cli@latest project:init
```

Sau đó kiểm tra:

| Thông tin | Ở đâu | Ghi chú |
|-----------|--------|---------|
| **Project ID** (`extra.eas.projectId` trong `app.json`) | Expo Dashboard → project **xevn-hrm-mobile** → General | `eas project:init` thường tự ghi vào `app.json` |
| **Account / Organization slug** | URL dashboard: `expo.dev/accounts/<slug>/projects/...` | Cần khi xem build logs |

App hiện tại: **slug** `xevn-hrm-mobile`, Android **package** `vn.xevn.hrm.mobile` (xem `app.json`).

## 4. Android (APK) — EAS thường tự quản lý

Lần build Android đầu, EAS có thể hỏi tạo keystore trên cloud Expo.

| Thông tin | Lấy ở đâu |
|-----------|-----------|
| Keystore (nếu tự quản) | Credentials chỉ tải khi bạn chủ động export — mặc định để Expo quản lý cho dev |
| **Google Service Account** (tuỳ chọn) | Chỉ cần nếu bạn bật Play internal track tự động; APK nội bộ thường **không cần** |

## 5. Push notification (tuỳ chọn — không bắt buộc để có APK)

| Thông tin | Lấy ở đâu |
|-----------|-----------|
| **FCM / Google Services** | Firebase Console → project Android → `google-services.json` | Chỉ khi cần push production ổn định; xem [Expo push credentials](https://docs.expo.dev/push-notifications/fcm-credentials/) |

## 6. File `.env` trên máy build (trỏ API dev)

Tạo `apps/mobile/hrm-mobile/.env` (không commit), ví dụ:

```env
EXPO_PUBLIC_HRM_API_BASE_URL=http://14.225.217.232:3001
EXPO_PUBLIC_DEFAULT_TENANT_ID=xevn
EXPO_PUBLIC_DEFAULT_COMPANY_ID=holding
```

**Lưu ý:** URL phải là chuỗi đầy đủ (có port `3001`), không dùng biến shell kiểu `${HRM_API_PORT}` trong file `.env` của Expo.

## 7. Lệnh build APK (sau khi đã login hoặc có `EXPO_TOKEN`)

```bash
cd apps/mobile/hrm-mobile
pnpm install
npx eas-cli@latest build --platform android --profile preview
```

Kết quả: link tải APK trên trang build Expo (và email nếu bật thông báo).

---

## 8. Xử lý lỗi thường gặp

### `Cannot find 'expo-modules-autolinking' package` khi chạy `expo prebuild`

**Nguyên nhân:** Monorepo dùng **pnpm**: gói `expo-modules-autolinking` là dependency lồng nhau của `expo`, nhưng CLI prebuild lại `require` trực tiếp từ thư mục app → không thấy trong `node_modules` của `hrm-mobile`.

**Cách xử lý:** Repo đã khai báo thêm `expo-modules-autolinking` trực tiếp trong `apps/mobile/hrm-mobile/package.json`. Từ **gốc monorepo** chạy:

```bash
pnpm install
```

Sau đó chạy lại `npx expo prebuild --platform android` trong `apps/mobile/hrm-mobile`.

### `The required package expo-asset cannot be found` khi `expo start`

**Nguyên nhân:** Giống trên — `@expo/metro-config` cần `require('expo-asset')` từ phạm vi app; pnpm monorepo đôi khi không link gói đó vào `hrm-mobile`.

**Cách xử lý:** Repo đã khai báo `expo-asset` trực tiếp trong `package.json` của `hrm-mobile`. Chạy `pnpm install` từ gốc monorepo rồi `npx expo start` lại.

### `Cannot find module '@react-native/assets-registry/registry.js'`

**Nguyên nhân:** Metro/Expo resolve từ thư mục app; với **pnpm** gói `@react-native/assets-registry` (dependency của `react-native`) không được link vào `node_modules` của `hrm-mobile`.

**Cách xử lý:** Repo đã thêm `@react-native/assets-registry` (phiên bản khớp RN 0.74.x, ví dụ `0.74.87`) trực tiếp vào `hrm-mobile/package.json`. Chạy `pnpm install` từ gốc monorepo rồi `npx expo start` lại.

### `EPERM: operation not permitted, rmdir '...\eas-cli-nodejs\...\.vscode'` khi `eas build`

**Nguyên nhân:** Thường gặp trên Windows khi thư mục tạm / bản shallow clone bị **OneDrive**, **antivirus**, hoặc **Cursor/VS Code** giữ lock thư mục `.vscode`.

**Gợi ý:** Tạm tắt sync OneDrive cho thư mục project (hoặc clone repo ra ổ không đồng bộ), chạy terminal **Run as administrator** hoặc thêm thư mục project vào exclusion AV; thử lại `eas build`. Hoặc dùng **WSL** / máy Linux để upload tarball.

### `assembleRelease` / Gradle: `Included build '...\@react-native\gradle-plugin' does not exist` (Windows, đường dẫn có dấu / OneDrive)

**Nguyên nhân:** Gradle (JVM) trên Windows đôi khi **không coi đường dẫn đầy đủ tới `node_modules\.pnpm\...` là tồn tại** khi project nằm dưới thư mục Unicode (ví dụ `OneDrive\Tài liệu\...`), dù Explorer và `Test-Path` vẫn thấy đúng.

**Cách xử lý (theo thứ tự):**

1. **Trong repo:** chạy `pnpm run android:link-plugin` (junction `android/.rn-gradle-plugin`) rồi sync/build lại — xem **`LOCAL_ANDROID_BUILD.md`**.
2. **Clone / copy repo** ra đường dẫn **chỉ ASCII**, ví dụ `C:\dev\xevn-ecosystem`, rồi chạy lại `.\gradlew.bat assembleRelease` trong `apps\mobile\hrm-mobile\android`.
3. **WSL** (Ubuntu) clone repo và chạy Gradle từ Linux filesystem (`~/projects/...`), tránh lỗi mã hóa đường dẫn của Windows.
4. **Tuỳ chọn:** EAS cloud — `npx eas-cli@latest build --platform android --profile preview` (cần `eas login` hoặc `EXPO_TOKEN`).

`android/settings.gradle` ưu tiên thư mục `.rn-gradle-plugin` khi có; không có thì dùng `require.resolve(..., { paths: [require.resolve('react-native/package.json')] })` cho **pnpm**.

---

## Tóm tắt “cần copy mang về”

1. **EXPO_TOKEN** (từ Access tokens) — để chạy build không cần nhập mật khẩu mỗi lần.  
2. **Project đã `eas project:init`** — có `projectId` trong `app.json`.  
3. **`.env`** với `EXPO_PUBLIC_HRM_API_BASE_URL` trỏ đúng server dev.  

Còn lại (email Expo, package name) bạn đã có trong tài khoản và trong repo.
