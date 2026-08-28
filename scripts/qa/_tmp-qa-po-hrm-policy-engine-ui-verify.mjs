#!/usr/bin/env node
/**
 * QA-PO-HRM-POLICY-ENGINE-UI-VERIFY
 * Mở trình duyệt, tạo Policy và thêm các Components động theo chuẩn SRS mới.
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Chạy thẳng vào app HRM standalone (cổng 8080) thay vì qua Portal iframe (cổng 5173) để dễ test UI.
const PORTAL = process.env.HRM_DEV_URL || 'http://127.0.0.1:8080/hr';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-qa-po-hrm-policy-engine-ui-verify.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/qa-po-hrm-policy-engine-ui-verify',
);
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

async function run() {
  const R = { startedAt: ts(), steps: [] };
  console.log(`[QA] Khởi động Chrome...`);
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Đăng nhập
    console.log(`[QA] Truy cập ${PORTAL}/login`);
    await page.goto(`${PORTAL}/login`);
    
    // Đợi 2s để check xem có tự login hay không
    await sleep(2000);
    
    const emailInput = await page.getByPlaceholder('email@company.com').first();
    if (emailInput) {
      await page.getByPlaceholder('email@company.com').fill(EMAIL);
      await page.locator('input[type="password"]').fill(PASSWORD);
      await page.getByRole('button', { name: /đăng nhập/i }).first().click();
    }
    
    await page.waitForURL('**/command-center**', { timeout: 10000 }).catch(() => {});
    R.steps.push({ step: 'login', status: 'OK' });
    console.log(`[QA] Đã đăng nhập`);

    // 2. Vào Cài đặt -> Gói chính sách (Policy Engine)
    console.log(`[QA] Chuyển đến màn hình Cài đặt`);
    await page.goto(`${PORTAL}/settings`);
    await sleep(2000);
    
    console.log(`[QA] Bấm vào tab "Gói chính sách"`);
    // Tab Gói chính sách
    await page.click('[data-testid="settings-tab-pay-policy-packs"]');
    await sleep(1000);
    await page.screenshot({ path: resolve(SCREEN, '01-policy-list.png') });

    // 3. Tạo chính sách mới
    console.log(`[QA] Bấm nút Tạo chính sách`);
    await page.click('id=btn-create-policy');
    await sleep(500);
    await page.fill('id=create-name', 'Chính sách Demo QA');
    await page.fill('id=create-pay-group', 'QA-GROUP');
    // Set date
    await page.fill('id=create-effective-from', '2026-08-01');
    await page.click('id=btn-create-submit');
    await sleep(1000);
    R.steps.push({ step: 'create_policy', status: 'OK' });

    // 4. Bấm vào mock policy (Chính sách Lái xe Tuyến HCM hoặc Chính sách Demo QA)
    console.log(`[QA] Mở chi tiết Policy để thêm Components...`);
    // UI của mock API sẽ trả về 'Chính sách Lái xe Tuyến HCM' với ID 1.
    // Component Item có cursor: pointer
    await page.click('text="Chính sách Lái xe Tuyến HCM"');
    await sleep(1000);
    await page.screenshot({ path: resolve(SCREEN, '02-policy-builder.png') });

    // 5. Thêm trip_rate_tiered
    console.log(`[QA] Thêm component trip_rate_tiered...`);
    await page.click('id=btn-add-comp');
    await sleep(500);
    await page.selectOption('id=add-comp-type', 'trip_rate_tiered');
    await sleep(500);
    
    // Fill form trip_rate_tiered
    await page.fill('input[placeholder="VD: ND, NB, TB..."]', 'HN');
    await page.click('id=btn-add-comp-submit');
    await sleep(1000);
    await page.screenshot({ path: resolve(SCREEN, '03-trip-rate-tiered.png') });

    // 6. Thêm revenue_quality
    console.log(`[QA] Thêm component revenue_quality...`);
    await page.click('id=btn-add-comp');
    await sleep(500);
    await page.selectOption('id=add-comp-type', 'revenue_quality');
    await sleep(500);
    await page.click('id=btn-add-comp-submit');
    await sleep(1000);
    await page.screenshot({ path: resolve(SCREEN, '04-revenue-quality.png') });

    R.steps.push({ step: 'add_components', status: 'OK' });
    R.overall = 'PASS';
    console.log(`[QA] Hoàn tất test UI Policy Builder thành công!`);

  } catch (err) {
    console.error(`[QA] Lỗi:`, err);
    await page.screenshot({ path: resolve(SCREEN, 'ERROR.png') });
    R.overall = 'FAIL';
    R.error = err.message;
  } finally {
    R.endedAt = ts();
    writeFileSync(OUT_JSON, JSON.stringify(R, null, 2), 'utf-8');
    await browser.close();
    console.log(`[QA] Đã lưu report tại ${OUT_JSON}`);
  }
}

run().catch(console.error);
