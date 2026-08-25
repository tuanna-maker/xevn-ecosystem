import {
  sumEvalLinesGross,
  sumResolvedLinesGross,
  VP_GROSS_EARNING_COMPONENT_CODES,
} from './pay-gross-rules';

describe('pay-gross-rules', () => {
  it('sums only VP gross earning whitelist', () => {
    const gross = sumResolvedLinesGross([
      {
        component_code: 'LUONG_CO_BAN',
        sign: 'earning',
        amount: 8_600_000,
        include_in_gross: false,
      },
      {
        component_code: 'LUONG_THEO_CONG',
        sign: 'earning',
        amount: 5_000_000,
      },
      {
        component_code: 'THUONG_P4',
        sign: 'earning',
        amount: 1_000_000,
      },
      {
        component_code: 'TONG_THU_NHAP',
        sign: 'earning',
        amount: 99_000_000,
      },
    ]);
    expect(gross).toBe(6_000_000);
  });

  it('honours explicit earning_component_codes on eval lines', () => {
    const gross = sumEvalLinesGross(
      [
        { component_code: 'LUONG_THEO_CONG', sign: 'earning', amount: 4_000_000 },
        { component_code: 'LUONG_CO_BAN', sign: 'earning', amount: 8_000_000 },
      ],
      { earningComponentCodes: VP_GROSS_EARNING_COMPONENT_CODES },
    );
    expect(gross).toBe(4_000_000);
  });
});
