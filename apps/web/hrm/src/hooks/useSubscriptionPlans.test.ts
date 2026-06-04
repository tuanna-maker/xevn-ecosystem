import { describe, expect, it } from 'vitest';

import {
  useActiveSubscriptionPlans,
  useSubscriptionPlans,
} from './useSubscriptionPlans';

describe('useSubscriptionPlans (P1-INC-P0-HRM-DASH-01)', () => {
  it('exports hooks without referencing undefined isSupabaseConfigured', () => {
    expect(typeof useSubscriptionPlans).toBe('function');
    expect(typeof useActiveSubscriptionPlans).toBe('function');
  });
});
