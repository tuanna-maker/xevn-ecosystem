import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { HrmDbService, HrmDbQueryFn } from '../db/hrm-db.service';
import { CreatePayPolicyDto, ClonePayPolicyDto, UpsertComponentDto } from './dto/policy.dto';

@Injectable()
export class PolicyService {
  constructor(private readonly db: HrmDbService) {}

  async listPolicies(tenantId: string, companyId: string, payGroupCode?: string, status?: string) {
    let sql = `
      SELECT p.id, p.pay_group_code, p.name, p.status, p.version, 
             TO_CHAR(p.effective_from, 'YYYY-MM-DD') as effective_from, 
             TO_CHAR(p.effective_to, 'YYYY-MM-DD') as effective_to,
             (
               SELECT COALESCE(json_agg(
                 json_build_object(
                   'id', c.id, 
                   'component_type', c.component_type,
                   'name', c.name,
                   'params', c.params
                 ) ORDER BY c.sort_order ASC
               ), '[]')
               FROM payroll_policy_components c
               WHERE c.policy_id = p.id AND c.deleted_at IS NULL
             ) as components
      FROM payroll_policies p
      WHERE p.company_id = $1 AND p.deleted_at IS NULL
    `;
    const params: any[] = [companyId];
    
    if (payGroupCode) {
      params.push(payGroupCode);
      sql += ` AND pay_group_code = $${params.length}`;
    }
    
    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }
    
    sql += ` ORDER BY pay_group_code, version DESC`;
    
    const res = await this.db.query(sql, params);
    return res.rows;
  }

  async getPolicyWithComponents(tenantId: string, companyId: string, policyId: string) {
    const policyRes = await this.db.query(
      `SELECT id, pay_group_code, name, status, version, 
              TO_CHAR(effective_from, 'YYYY-MM-DD') as effective_from, 
              TO_CHAR(effective_to, 'YYYY-MM-DD') as effective_to 
       FROM payroll_policies 
       WHERE company_id = $1 AND id = $2 AND deleted_at IS NULL`,
      [companyId, policyId]
    );
    
    if (policyRes.rows.length === 0) {
      throw new NotFoundException('Policy not found');
    }
    const policy = policyRes.rows[0];

    const compRes = await this.db.query(
      `SELECT id, component_type, name, sort_order, is_deduction, input_source, params 
       FROM payroll_policy_components 
       WHERE policy_id = $1 AND deleted_at IS NULL 
       ORDER BY sort_order ASC`,
      [policyId]
    );

    return {
      ...policy,
      components: compRes.rows
    };
  }

  async createPolicy(tenantId: string, companyId: string, dto: CreatePayPolicyDto, createdBy: string) {
    return this.db.withTransaction(async (query: HrmDbQueryFn) => {
      // Create draft policy
      const res = await query(
        `INSERT INTO payroll_policies (company_id, pay_group_code, name, status, version, effective_from)
         VALUES ($1, $2, $3, $4, 1, $5)
         RETURNING id, version`,
        [companyId, dto.pay_group_code, dto.name, dto.status || 'ACTIVE', dto.effective_from]
      );
      return res.rows[0];
    });
  }

  async updatePolicy(tenantId: string, companyId: string, policyId: string, dto: any) {
    const policy = await this.db.queryOne(
      `SELECT status FROM payroll_policies WHERE id = $1 AND company_id = $2 AND deleted_at IS NULL`,
      [policyId, companyId]
    );
    
    if (!policy) throw new NotFoundException('Policy not found');
    if (policy.status === 'ACTIVE') throw new ConflictException('Cannot modify ACTIVE policy. Please clone it instead.');

    const fields: string[] = [];
    const params: any[] = [policyId, companyId];
    
    if (dto.name) {
      fields.push(`name = $${params.length + 1}`);
      params.push(dto.name);
    }
    if (dto.effective_from) {
      fields.push(`effective_from = $${params.length + 1}`);
      params.push(dto.effective_from);
    }
    if (dto.status) {
      fields.push(`status = $${params.length + 1}`);
      params.push(dto.status);
    }

    if (fields.length === 0) return { success: true };

    await this.db.query(
      `UPDATE payroll_policies SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $1 AND company_id = $2`,
      params
    );
    return { success: true };
  }

  async addComponent(tenantId: string, companyId: string, policyId: string, dto: UpsertComponentDto) {
    // Check policy status (BR-E2-01: Cannot edit ACTIVE)
    const policy = await this.db.queryOne(
      `SELECT status FROM payroll_policies WHERE id = $1 AND company_id = $2 AND deleted_at IS NULL`,
      [policyId, companyId]
    );
    
    if (!policy) throw new NotFoundException('Policy not found');
    if (policy.status === 'ACTIVE') throw new ConflictException('Cannot modify ACTIVE policy. Please clone it instead.');

    // Wipe old components for this policy to ensure a 1-to-1 sync with UI
    await this.db.query(
      `DELETE FROM payroll_policy_components WHERE policy_id = $1`,
      [policyId]
    );

    const res = await this.db.query(
      `INSERT INTO payroll_policy_components 
         (policy_id, component_type, name, sort_order, is_deduction, input_source, params)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [policyId, dto.component_type, dto.name, dto.sort_order, dto.is_deduction, dto.input_source, dto.params]
    );
    
    return { success: true };
  }

  async togglePolicyStatus(tenantId: string, companyId: string, policyId: string) {
    const policy = await this.db.queryOne(
      `SELECT status FROM payroll_policies WHERE id = $1 AND company_id = $2 AND deleted_at IS NULL`,
      [policyId, companyId]
    );
    if (!policy) throw new NotFoundException('Policy not found');
    
    const newStatus = policy.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    if (policy.status === 'ACTIVE') {
      const hasPayslips = await this.db.queryOne(
        `SELECT COUNT(*) as count FROM public.payroll_payslips WHERE formula_definition_id = $1::uuid`,
        [policyId]
      );
      if (hasPayslips && parseInt(hasPayslips.count, 10) > 0) {
        throw new ConflictException('Cannot deactivate policy because it has already been applied to payroll runs.');
      }
    }

    await this.db.query(
      `UPDATE payroll_policies SET status = $1, updated_at = NOW() WHERE id = $2 AND company_id = $3`,
      [newStatus, policyId, companyId]
    );
    
    return { success: true, policy_id: policyId, status: newStatus };
  }

  async deletePolicy(tenantId: string, companyId: string, policyId: string) {
    const policy = await this.db.queryOne(
      `SELECT status FROM payroll_policies WHERE id = $1 AND company_id = $2 AND deleted_at IS NULL`,
      [policyId, companyId]
    );
    if (!policy) throw new NotFoundException('Policy not found');

    const hasPayslips = await this.db.queryOne(
      `SELECT COUNT(*) as count FROM public.payroll_payslips WHERE formula_definition_id = $1::uuid`,
      [policyId]
    );
    if (hasPayslips && parseInt(hasPayslips.count, 10) > 0) {
      throw new ConflictException('Cannot delete policy because it has already been applied to payroll runs.');
    }

    await this.db.query(
      `UPDATE payroll_policies SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND company_id = $2`,
      [policyId, companyId]
    );

    return { success: true };
  }

  async clonePolicy(tenantId: string, companyId: string, policyId: string, dto: ClonePayPolicyDto, createdBy: string) {
    return this.db.withTransaction(async (query: HrmDbQueryFn) => {
      const policyRes = await query(
        `SELECT pay_group_code, version 
         FROM payroll_policies 
         WHERE id = $1 AND company_id = $2 AND deleted_at IS NULL`,
        [policyId, companyId]
      );
      
      if (policyRes.rows.length === 0) throw new NotFoundException('Source policy not found');
      const src = policyRes.rows[0];

      const insertPolicyRes = await query(
        `INSERT INTO payroll_policies (company_id, pay_group_code, name, status, version, effective_from)
         VALUES ($1, $2, $3, 'DRAFT', $4, $5)
         RETURNING id, version`,
        [companyId, src.pay_group_code, dto.name, src.version + 1, dto.effective_from]
      );
      
      const newPolicyId = insertPolicyRes.rows[0].id;
      
      // Clone components
      await query(
        `INSERT INTO payroll_policy_components 
         (policy_id, component_type, name, sort_order, is_deduction, input_source, params)
         SELECT $1, component_type, name, sort_order, is_deduction, input_source, params
         FROM payroll_policy_components
         WHERE policy_id = $2 AND deleted_at IS NULL`,
        [newPolicyId, policyId]
      );

      return {
        new_policy_id: newPolicyId,
        version: insertPolicyRes.rows[0].version,
        cloned_from: policyId,
        status: 'DRAFT'
      };
    });
  }

  async listGrades(tenantId: string, companyId: string) {
    const res = await this.db.query(
      `SELECT 
         pg.id as master_id, 
         pg.code as grade_code, 
         pg.name as grade_name, 
         COALESCE(prg.pay_group_code, 'VP_HN') as pay_group_code, 
         COALESCE(prg.steps, '[]'::jsonb) as steps,
         prg.id as id
       FROM pay_grades pg
       LEFT JOIN payroll_grades prg ON prg.grade_code = pg.code AND prg.company_id = $2 AND prg.deleted_at IS NULL
       WHERE pg.tenant_id = $1 AND pg.deleted_at IS NULL
       ORDER BY pg.code ASC`,
      [tenantId, companyId]
    );
    
    return res.rows.map(row => ({
      id: row.id || row.master_id,
      grade_code: row.grade_code,
      grade_name: row.grade_name,
      pay_group_code: row.pay_group_code,
      steps: typeof row.steps === 'string' ? JSON.parse(row.steps) : (row.steps || [])
    }));
  }

  async saveGrade(companyId: string, dto: any) {
    const existing = await this.db.query(
      `SELECT id FROM payroll_grades WHERE company_id = $1 AND grade_code = $2 AND deleted_at IS NULL`,
      [companyId, dto.grade_code]
    );

    if (existing.rows.length > 0) {
      const res = await this.db.query(
        `UPDATE payroll_grades 
         SET grade_name = $1, pay_group_code = $2, steps = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING id`,
        [dto.grade_name, dto.pay_group_code, JSON.stringify(dto.steps), existing.rows[0].id]
      );
      return res.rows[0];
    } else {
      const res = await this.db.query(
        `INSERT INTO payroll_grades (company_id, grade_code, grade_name, pay_group_code, steps)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [companyId, dto.grade_code, dto.grade_name, dto.pay_group_code, JSON.stringify(dto.steps)]
      );
      return res.rows[0];
    }
  }
}
