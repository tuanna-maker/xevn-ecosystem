/**
 * @CODE-MEMORY
 * Screen: Mobile HRM API base (release/dev fallback)
 * UC: UC-HRM-MOB-01
 * BR: BR-MOB-API-BASE
 * SRS: docs/hrm/SRS_MOBILE.md · UC-HRM-MOB-01
 * TechSpec: docs/hrm/TECHSPEC_MOBILE.md · API base via EXPO_PUBLIC
 * Purpose: Origin mặc định khi không có EXPO_PUBLIC — chỉ local hoặc VPS/dev theo deploy (HRM_BE_PORT).
 * WorkItem: D-MOB-REMOVE-NIPIO-01
 * Coded: 2026-07-28
 * Callers: hrmApiClient.getDefaultBaseUrl · hrmApiClient.test
 * Callees: (const)
 * FEActions: (env) → getDefaultBaseUrl → hrmRequest
 * BEChain: HRM_BE_PORT host (deploy) → /api/hrm/*
 * Impact: Sai URL → mobile gọi nhầm host/port.
 * must_keep: Không hardcode DNS tạm; EXPO_PUBLIC ưu tiên; __DEV__ localhost trong hrmApiClient.
 * SOLID: Một hằng số origin tách khỏi client HTTP.
 * LastVerified: docs/qa/evidence/d-mob-remove-nipio-01-20260728.md
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: D-MOB-REMOVE-NIPIO-01 · 2026-07-28
 * Change: Xóa hostname DNS tạm; fallback = VPS/dev HTTP theo deploy HRM_BE_PORT=3001.
 * must_keep: EXPO_PUBLIC ưu tiên; __DEV__ vẫn localhost trong hrmApiClient.
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: D-OPS-REMOVE-NIPIO-01 · 2026-07-28
 * Change: Scrub mọi chuỗi hostname DNS tạm khỏi comment/source; giữ fallback `http://14.225.217.232:3001`.
 * must_keep: Chỉ local + deploy SoT host/port.
 */
/** Dev HRM API origin (VPS) when EXPO_PUBLIC unset outside __DEV__. deploy HRM_BE_PORT=3001. */
export const RELEASE_PILOT_HRM_API_BASE_URL = 'http://14.225.217.232:3001';
