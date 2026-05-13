/** Gợi ý tenant / company trên form đăng nhập; runtime từ phiên. Giá trị build-time qua EXPO_PUBLIC_* (xem .env.example). */
export const EXPO_DEFAULT_TENANT_ID = process.env.EXPO_PUBLIC_DEFAULT_TENANT_ID?.trim() ?? '';
export const EXPO_DEFAULT_COMPANY_ID = process.env.EXPO_PUBLIC_DEFAULT_COMPANY_ID?.trim() ?? '';
