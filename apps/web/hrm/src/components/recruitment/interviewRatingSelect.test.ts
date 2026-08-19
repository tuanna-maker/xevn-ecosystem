import { describe, expect, it } from 'vitest';
import {
  INTERVIEW_RATING_NONE_SENTINEL,
  ratingApiValue,
  ratingFormValue,
} from './interviewRatingSelect';

describe('interviewRatingSelect (PO-HRM-REC-INTERVIEW-SELECT-FE-01)', () => {
  it('never uses empty string as form Select value', () => {
    expect(ratingFormValue(null)).toBe(INTERVIEW_RATING_NONE_SENTINEL);
    expect(ratingFormValue(undefined)).toBe(INTERVIEW_RATING_NONE_SENTINEL);
    expect(ratingFormValue(0)).toBe(INTERVIEW_RATING_NONE_SENTINEL);
    expect(ratingFormValue(null)).not.toBe('');
    expect(INTERVIEW_RATING_NONE_SENTINEL.length).toBeGreaterThan(0);
  });

  it('maps 1–5 to string form values', () => {
    expect(ratingFormValue(3)).toBe('3');
    expect(ratingFormValue(5)).toBe('5');
  });

  it('maps sentinel / empty / garbage to API null', () => {
    expect(ratingApiValue(INTERVIEW_RATING_NONE_SENTINEL)).toBeNull();
    expect(ratingApiValue('')).toBeNull();
    expect(ratingApiValue(undefined)).toBeNull();
    expect(ratingApiValue('abc')).toBeNull();
  });

  it('maps numeric form strings to API number', () => {
    expect(ratingApiValue('1')).toBe(1);
    expect(ratingApiValue('5')).toBe(5);
  });
});
