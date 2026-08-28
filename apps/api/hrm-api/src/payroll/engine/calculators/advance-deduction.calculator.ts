import { ComponentCalculator, CalcContext, ComponentResult } from '../calculator.interface';

export class AdvanceDeductionCalculator implements ComponentCalculator {
  readonly componentType = 'ADVANCE_DEDUCTION';

  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const advanceLog = ctx.inputBag['ADVANCE_REQUEST'] as any;
    const warnings: string[] = [];

    if (!advanceLog || !advanceLog.requested_amount) {
      return {
        component_type: this.componentType,
        amount_vnd: 0n,
        breakdown: { note: 'No advance requested' },
        warnings
      };
    }

    const requestedAmount = BigInt(advanceLog.requested_amount);
    
    // For calculating max allowed, we would ideally need current gross or net.
    // Assuming ctx.accumulated contains the currently calculated total gross/net so far,
    // or we take max_advance_pct of a predefined base salary if gross is not yet known.
    // For simplicity, we assume we have a `current_net_vnd` or similar in ctx, or we limit it against a specific input.
    // In many payroll systems, deductions run last, so we can sum previous components.
    
    let totalIncomeSoFar = 0n;
    if (ctx.accumulated) {
       for (const comp of ctx.accumulated) {
         if (comp.amount_vnd > 0n) {
           totalIncomeSoFar += comp.amount_vnd;
         }
       }
    }

    const maxPct = ctx.component?.params?.max_advance_pct || 100; // default to 100% if not configured
    
    // If totalIncomeSoFar is known, calculate max allowed.
    // If we want to strictly limit by maxPct, we do:
    let maxAllowed = (totalIncomeSoFar * BigInt(Math.floor(maxPct * 100))) / 10000n;

    // If totalIncomeSoFar is 0 (maybe advance runs before income), we might have to rely on standard base salary or skip the limit.
    // Let's assume the user configures the engine to run Advance Deductions AFTER income components.
    
    let finalDeduction = requestedAmount;
    if (totalIncomeSoFar > 0n && requestedAmount > maxAllowed) {
      warnings.push(`Số tiền tạm ứng (${requestedAmount}) vượt quá ${maxPct}% tổng thu nhập (${totalIncomeSoFar}). Giới hạn ở mức: ${maxAllowed}`);
      finalDeduction = maxAllowed;
    }

    // Deductions should be negative in the final sum, but our engine might handle it.
    // Usually, amount_vnd is the magnitude of the deduction, but we will return it as negative.
    
    return {
      component_type: this.componentType,
      amount_vnd: -finalDeduction,
      breakdown: {
        requested_amount: requestedAmount.toString(),
        max_pct: maxPct,
        max_allowed: maxAllowed.toString(),
        total_income_ref: totalIncomeSoFar.toString()
      },
      warnings
    };
  }
}
