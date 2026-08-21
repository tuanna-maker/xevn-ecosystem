/**
 * @CODE-MEMORY
 * Screen:     HRM ATT-02 late-penalty XOR / evaluate unit tests
 * UC:         UC-BP-ATT-02 · FR-UC-BP-ATT-02
 * WorkItem:   PO-HRM-MVP-GD1-ATT-02-CLUSTER-BE-01
 * Coded:      2026-08-09
 */
import { ApiException } from '../common/api.exception';
import {
  assertBandsNoOverlap,
  assertXorLatePenaltyMode,
  evaluateLatePenaltyHours,
  modeLabelVi,
  pickBestSpecificityRule,
} from './late-penalty.util';

describe('late-penalty.util (ATT-02)', () => {
  describe('XOR mode (BR-BP-SHF-02 / AC-ATT-02-XOR)', () => {
    it('accepts single mode minute|block|tier (band→tier)', () => {
      expect(assertXorLatePenaltyMode({ mode: 'minute' })).toBe('minute');
      expect(assertXorLatePenaltyMode({ mode: 'block' })).toBe('block');
      expect(assertXorLatePenaltyMode({ mode: 'band' })).toBe('tier');
      expect(modeLabelVi('minute')).toBe('Theo phút');
      expect(modeLabelVi('tier')).toBe('Theo bậc/khoảng');
    });

    it('rejects mixed modes array → HRM-VAL-400', () => {
      expect(() =>
        assertXorLatePenaltyMode({ modes: ['minute', 'block'] }),
      ).toThrow(ApiException);
      try {
        assertXorLatePenaltyMode({ mode: ['minute', 'tier'] });
        fail('expected throw');
      } catch (e) {
        expect(e).toBeInstanceOf(ApiException);
        expect((e as ApiException).code).toBe('HRM-VAL-400');
      }
    });

    it('rejects mixed mode flags → HRM-VAL-400', () => {
      expect(() =>
        assertXorLatePenaltyMode({ modeMinute: true, modeBlock: true }),
      ).toThrow(ApiException);
    });
  });

  describe('bands overlap', () => {
    it('rejects overlapping bands → HRM-VAL-400', () => {
      expect(() =>
        assertBandsNoOverlap([
          { fromMinutes: 1, toMinutes: 15, penaltyHours: 0.5 },
          { fromMinutes: 10, toMinutes: 30, penaltyHours: 1 },
        ]),
      ).toThrow(ApiException);
      try {
        assertBandsNoOverlap([
          { fromMinutes: 1, toMinutes: 15, penaltyHours: 0.5 },
          { fromMinutes: 15, toMinutes: 30, penaltyHours: 1 },
        ]);
        fail('expected overlap at boundary');
      } catch (e) {
        expect((e as ApiException).code).toBe('HRM-VAL-400');
      }
    });

    it('accepts contiguous non-overlapping bands', () => {
      expect(() =>
        assertBandsNoOverlap([
          { fromMinutes: 1, toMinutes: 14, penaltyHours: 0.5 },
          { fromMinutes: 15, toMinutes: 30, penaltyHours: 1 },
        ]),
      ).not.toThrow();
    });
  });

  describe('evaluateLatePenaltyHours (Diễn biến #3/#5)', () => {
    const bands = [
      { fromMinutes: 1, toMinutes: 15, penaltyHours: 0.5 },
      { fromMinutes: 16, toMinutes: 30, penaltyHours: 1 },
      { fromMinutes: 31, toMinutes: 60, penaltyHours: 2 },
    ];

    it('latePenaltyEnabled=false → 0 (notifyLate orthogonal)', () => {
      expect(
        evaluateLatePenaltyHours({
          latePenaltyEnabled: false,
          mode: 'minute',
          bands,
          lateMinutes: 20,
        }),
      ).toBe(0);
    });

    it('tier mode picks matching band', () => {
      expect(
        evaluateLatePenaltyHours({
          latePenaltyEnabled: true,
          mode: 'tier',
          bands,
          lateMinutes: 20,
        }),
      ).toBe(1);
    });

    it('minute mode without bands → lateMinutes/60', () => {
      expect(
        evaluateLatePenaltyHours({
          latePenaltyEnabled: true,
          mode: 'minute',
          bands: [],
          lateMinutes: 30,
        }),
      ).toBe(0.5);
    });

    it('block mode ceil(late/block)*penalty', () => {
      expect(
        evaluateLatePenaltyHours({
          latePenaltyEnabled: true,
          mode: 'block',
          bands: [
            {
              fromMinutes: 1,
              toMinutes: 999,
              penaltyHours: 0.5,
              blockMinutes: 30,
            },
          ],
          lateMinutes: 45,
        }),
      ).toBe(1);
    });
  });

  describe('specificity resolve order', () => {
    it('dept+shift > dept > company', () => {
      const rows = [
        { department_id: null, shift_id: null, mode: 'minute' },
        { department_id: 'dept-a', shift_id: null, mode: 'block' },
        { department_id: 'dept-a', shift_id: 'shift-1', mode: 'tier' },
      ];
      const hit = pickBestSpecificityRule(rows, {
        departmentId: 'dept-a',
        shiftId: 'shift-1',
      });
      expect(hit?.mode).toBe('tier');
      const deptOnly = pickBestSpecificityRule(rows, {
        departmentId: 'dept-a',
        shiftId: null,
      });
      expect(deptOnly?.mode).toBe('block');
    });
  });
});
