import { createHmac, randomUUID } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import type { HrmRealtimeEventEnvelope } from '../realtime/hrm-realtime.service';

@Injectable()
export class WebhookOutboundService {
  private readonly logger = new Logger(WebhookOutboundService.name);

  dispatchAttendanceEvent(envelope: HrmRealtimeEventEnvelope): void {
    const raw = process.env.HRM_EVENT_WEBHOOK_URLS?.trim();
    if (!raw) return;
    const urls = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!urls.length) return;

    const secret = process.env.HRM_EVENT_WEBHOOK_SECRET?.trim();
    const body = JSON.stringify({
      source: 'hrm-api',
      envelope,
    });
    const deliveryId = randomUUID();

    void Promise.all(
      urls.map(async (url) => {
        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-HRM-Delivery-Id': deliveryId,
            'X-HRM-Event-Type': envelope.type,
          };
          if (secret) {
            const sig = createHmac('sha256', secret).update(body).digest('hex');
            headers['X-HRM-Signature'] = `sha256=${sig}`;
          }
          const res = await fetch(url, {
            method: 'POST',
            headers,
            body,
            signal: AbortSignal.timeout(8_000),
          });
          if (!res.ok) {
            this.logger.warn(`Webhook ${url} returned HTTP ${res.status}`);
          }
        } catch (e) {
          this.logger.warn(
            `Webhook ${url} failed: ${e instanceof Error ? e.message : String(e)}`,
          );
        }
      }),
    );
  }
}
