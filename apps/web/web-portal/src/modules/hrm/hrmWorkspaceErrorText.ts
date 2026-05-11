import { ScopeContextError } from '../../integrations/identityScope';
import { HrmApiClientError } from './hrmApiErrors';

/** Deterministic user-visible strings for governed HRM workspace flows (metadata queue). */
export function formatHrmMetadataQueueError(error: unknown, fallbackMessage: string): string {
  if (error instanceof ScopeContextError) {
    return `${fallbackMessage} [${error.code}]`;
  }
  if (error instanceof HrmApiClientError) {
    const detailsSuffix =
      error.details && typeof error.details === 'object'
        ? ` — ${JSON.stringify(error.details)}`
        : '';
    return `${fallbackMessage} [${error.code}]${detailsSuffix}`;
  }
  return fallbackMessage;
}
