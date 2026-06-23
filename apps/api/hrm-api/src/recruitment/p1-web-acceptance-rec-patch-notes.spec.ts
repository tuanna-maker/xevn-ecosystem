import { validateSync } from 'class-validator';
import { UpdateJobRequisitionDto } from './dto/update-job-requisition.dto';

/** UF-HRM-12 — PATCH accepts status + optional notes (probe sends both). */
describe('P1-WEB-ACCEPTANCE-FIX-WAVE-02 UF-HRM-12 UpdateJobRequisitionDto', () => {
  it('accepts status on_hold with notes (no forbidNonWhitelisted)', () => {
    const dto = Object.assign(new UpdateJobRequisitionDto(), {
      status: 'on_hold',
      notes: 'UF12-probe-note',
    });
    const errors = validateSync(dto, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors).toHaveLength(0);
  });
});
