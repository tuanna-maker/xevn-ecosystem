import { Injectable, NotFoundException } from '@nestjs/common';
import { HrmDbService } from '../db/hrm-db.service';
import { CreatePaySystemDataDto, UpdatePaySystemDataDto } from './dto/pay-system-data.dto';

@Injectable()
export class PaySystemDataService {
  constructor(private readonly db: HrmDbService) {}

  async list(companyId: string) {
    const res = await this.db.query(
      `SELECT * FROM public.pay_system_data_definitions WHERE company_id = $1 ORDER BY code ASC`,
      [companyId],
    );
    return res.rows;
  }

  async getById(id: string, companyId: string) {
    const res = await this.db.query(
      `SELECT * FROM public.pay_system_data_definitions WHERE id = $1::uuid AND company_id = $2`,
      [id, companyId],
    );
    if (!res.rows[0]) throw new NotFoundException('Pay System Data not found');
    return res.rows[0];
  }

  async create(companyId: string, dto: CreatePaySystemDataDto) {
    const res = await this.db.query(
      `INSERT INTO public.pay_system_data_definitions (company_id, code, name, data_type, description)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [companyId, dto.code, dto.name, dto.data_type ?? 'NUMBER', dto.description],
    );
    return res.rows[0];
  }

  async update(id: string, companyId: string, dto: UpdatePaySystemDataDto) {
    await this.getById(id, companyId);
    const updates: string[] = [];
    const values: any[] = [id, companyId];
    let vIdx = 3;

    if (dto.code !== undefined) {
      updates.push(`code = $${vIdx++}`);
      values.push(dto.code);
    }
    if (dto.name !== undefined) {
      updates.push(`name = $${vIdx++}`);
      values.push(dto.name);
    }
    if (dto.data_type !== undefined) {
      updates.push(`data_type = $${vIdx++}`);
      values.push(dto.data_type);
    }
    if (dto.description !== undefined) {
      updates.push(`description = $${vIdx++}`);
      values.push(dto.description);
    }
    
    if (updates.length === 0) return this.getById(id, companyId);

    updates.push(`updated_at = NOW()`);
    const res = await this.db.query(
      `UPDATE public.pay_system_data_definitions SET ${updates.join(', ')} WHERE id = $1::uuid AND company_id = $2 RETURNING *`,
      values,
    );
    return res.rows[0];
  }

  async delete(id: string, companyId: string) {
    await this.getById(id, companyId);
    await this.db.query(`DELETE FROM public.pay_system_data_definitions WHERE id = $1::uuid AND company_id = $2`, [id, companyId]);
    return { id };
  }
}
