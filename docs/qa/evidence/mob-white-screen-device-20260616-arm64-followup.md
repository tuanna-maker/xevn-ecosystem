# MOB-P0-WHITE-SCREEN-DEVICE-02 — Arm64 follow-up (2026-06-16)

## Scope

- work_item_id: `MOB-P0-WHITE-SCREEN-DEVICE-02`
- from_role: `pm`
- to_role: `dev-mobile`
- Target: fix physical-device blank white screen after splash.

## Root cause (confirmed)

Physical arm64 build was affected by ABI forcing in mobile build script:

- `apps/mobile/hrm-mobile/scripts/build-apk.cjs` always prepended `-PreactNativeArchitectures=x86_64` on Windows.
- That packaging path produced a QA-device APK where `arm64-v8a` missed critical native libs:
  - `libexpo-modules-core.so`
  - `libreanimated.so`
  - `librnscreens.so`
- Missing these startup/runtime libs on physical arm64 devices can result in blank screen after splash (while x86_64 emulator may still boot).

## Patch applied

File changed:

- `apps/mobile/hrm-mobile/scripts/build-apk.cjs`

Changes:

1. Removed unconditional x86_64 ABI forcing for Windows release/qa-device builds.
2. Added explicit opt-in ABI override through env var:
   - `REACT_NATIVE_ARCHITECTURES=<comma-separated-abis>`
3. Default behavior now uses `reactNativeArchitectures` from `android/gradle.properties` (multi-ABI).
4. Added build log output showing active ABI mode.

## Verification commands executed

```bash
pnpm run android:apk:qa-device
python -c "import zipfile,collections; p=r'apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk'; z=zipfile.ZipFile(p); libs=collections.defaultdict(set); [libs[n.split('/')[1]].add(n.split('/')[-1]) for n in z.namelist() if n.startswith('lib/') and n.endswith('.so')]; print(sorted(libs)); print({k: len(v) for k,v in libs.items()})"
python -c "import hashlib,pathlib; p=pathlib.Path(r'apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk'); print(hashlib.sha256(p.read_bytes()).hexdigest().upper())"
```

## Verification result

- Build: `BUILD SUCCESSFUL`
- Output APK: `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk`
- Size: `74,557,711 bytes`
- ABI coverage:
  - `arm64-v8a`: 47 native libs
  - `armeabi-v7a`: 47 native libs
  - `x86`: 47 native libs
  - `x86_64`: 47 native libs
- Critical libs now present on arm64: `libexpo-modules-core.so`, `libreanimated.so`, `librnscreens.so`.

## SHA256

- `1AAF23494C52887986213896F26CAE74FE40B5EFC0A77D5D0F4AFDDB8F0CBB9B`

## Handoff contract

- ack_status: `READY_FOR_QA`
- next_owner: `qa-device`
- next_action: install this APK on physical arm64 device and rerun white-screen reproduction matrix.
