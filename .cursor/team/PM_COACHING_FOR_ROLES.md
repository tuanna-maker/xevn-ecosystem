# PM coaching — truyền kinh nghiệm cho từng vai (xevn-ecosystem)

> PM (Composer) **chỉ điều phối** — không sửa `apps/`, `packages/`. Mọi dispatch ghi `work_item_id` + block coaching dưới đây khi liên quan.

## Dev-BE
- Scope mobile/portal: `company_id` UUID vs slug — `companyScopeMatches` + claim `company_uuid`.
- **Scope parity (U19):** list và get-by-id cùng `resolveHrmListScope`; test CEO+main→holding.
- Portal JWT: `expiresInSec` và `signServiceJwt` TTL **cùng một hằng** (24h pilot = 86400).
- `tenant-scope/group-member-units`: chỉ user có **membership tenant master** (`xevn`).

## PM (Composer)
- Sau mỗi delivery: **dispatch QA → QC** (`pm-post-delivery-verification.mdc`); không tự sửa `apps/`.
- User screenshot lỗi = **PM orchestration gap (U19)** — cập nhật `PROGRAM_JOURNEY_MAP.md` + rule/prompt **cùng phiên**, không chỉ hotfix Dev.
- **Zero-defect gate:** L0 → L1 → L2 → **L2.5 J-*** → L3 QC. Rules: `business-flow-zero-defect-gate.mdc`, `uat-production-readiness-orchestration.mdc`.
- Đọc `UAT_PRODUCTION_OPERATING_PLAN.md` trước mỗi wave; nói user trạng thái UAT-READY / UAT-PASS / PROD — không «Phase 1 DONE» khi QC program NO-GO.
- Không GO pilot khi chỉ L1/L2 PASS mà L2.5 J-* FAIL (vd. contracts→employee 404).

## Dev-FE
- Login mặc định pilot Command Center: **`ceo@xe.vn`**, không `du-lich.ceo@xe.vn`.
- HRM embed: `page_size` ≤ 100; portal JWT → iframe `/api/hrm`; tắt Supabase `54321` khi `VITE_HRM_USE_API=true`.
- `RequireAuth`: `/command-center` **không** dev-bypass internal key.
- Lưu `tokenExpiresAt`; 401 → logout + `/login`; reload data khi `accessToken` đổi.
- `VITE_REQUIRE_LOGIN=true` trên pilot.

## Dev-Mobile
- `EXPO_PUBLIC_HRM_API_BASE_URL` = `HRM_BE_PORT` local; mobile JWT body `company_id` = UUID từ token.

## DevOps
- User không chạy lệnh; agent chạy migrate/seed/smoke. VPS chỉ khi có `deploy/.vps-ssh.env` + network OK.
- Không `docker compose down` trên VPS; chỉ `up -d --build` service `xevn-*`.

## QA
- Distinguish 403 (wrong tenant/user) vs 000/timeout (service down).
- Evidence path bắt buộc; matrix: ceo@xe.vn PASS, du-lich.ceo 403 expected for group-member-units.
- `pnpm test:system:uat` khi API local up.
- **L2.5 (U19):** Mỗi wave HRM/embed — chạy J-HRM-* trong `PROGRAM_JOURNEY_MAP.md`; **J-HRM-01** contracts→employee bắt buộc; L2 PASS không đủ cho `PASS_TO_PM`.
- Báo `scope_parity` khi list có row nhưng GET by id 404 với `company_id=main`.

## QC
- Không GO nếu thiếu evidence path hoặc user phải tự SSH/deploy.
- **HRM embed UAT:** matrix P-CC-* **+ J-HRM-01..07 L2.5**; chỉ PASS tab load **không** đủ GO Command Center slice.
- **BLOCKER (cùng ngày):** bất kỳ route pilot nào hiển thị trống/không dữ liệu **và** console có `ERR_CONNECTION_REFUSED` (vd. `127.0.0.1:54321`) hoặc API **409** scope — QC ghi **NO-GO**, `qc -> PM` **FAIL** trong `docs/qa/evidence/` + bus; không chờ user nhắc lại; escalate `technical-manager` nếu xuyên Supabase/Nest/portal scope.
- GO WITH CONDITIONS phải ghi rõ route nào đã/không đã kiểm (`Evidence`: `docs/qa/evidence/qc-hrm-embed-regression-20260522.md`).

## BA / ba-docs
- HDSD: hai họ mật khẩu (UAT `xevn-uat-2026` vs portal `Xevn@2026`); ai xem đơn vị tập đoàn phải `ceo@xe.vn`.

## SA / TM
- NFR: `SERVICE_JWT_SECRET` đồng bộ giữa ký và verify; không hardcode secret trong docs.

---

*Cập nhật khi PM học bài mới từ incident — append ngắn, có `Evidence` link.*
