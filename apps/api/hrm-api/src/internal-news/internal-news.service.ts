import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
  resolveHrmPersistTenantId,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { CreateInternalNewsDto } from './dto/create-news.dto';
import { ListInternalNewsQueryDto } from './dto/list-news.query.dto';
import { UpdateInternalNewsDto } from './dto/update-news.dto';
import type { HrmInternalNewsRow, InternalNewsListResult } from './dto/news-response.dto';

const ROW_SELECT = `
  id, company_id, tenant_id,
  title, slug, summary, content,
  featured_image_url, attachments,
  category, tags,
  status, published_at, pinned,
  visibility, department_ids,
  author_id, author_name,
  view_count,
  created_at, updated_at
`;

@Injectable()
export class InternalNewsService {
  constructor(private readonly db: HrmDbService) {}

  private async ensureSchema(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_internal_news (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        tenant_id TEXT,
        title TEXT NOT NULL,
        slug TEXT NOT NULL,
        summary TEXT,
        content TEXT,
        featured_image_url TEXT,
        attachments JSONB DEFAULT '[]'::jsonb,
        category TEXT DEFAULT 'general',
        tags JSONB DEFAULT '[]'::jsonb,
        status TEXT NOT NULL DEFAULT 'draft',
        published_at TIMESTAMPTZ,
        pinned BOOLEAN DEFAULT FALSE,
        visibility TEXT DEFAULT 'all',
        department_ids JSONB DEFAULT '[]'::jsonb,
        author_id UUID,
        author_name TEXT NOT NULL,
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_internal_news_company_slug
        ON public.hrm_internal_news (company_id, slug);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_hrm_internal_news_company_status_published
        ON public.hrm_internal_news (company_id, status, published_at DESC);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_hrm_internal_news_company_category
        ON public.hrm_internal_news (company_id, category, published_at DESC);
    `);
  }

  private resolvePage(page: string | number | undefined, fallback: number): number {
    const parsed = Number(page);
    if (!Number.isFinite(parsed) || parsed < 1) return fallback;
    return Math.min(100, Math.trunc(parsed));
  }

  private resolvePageSize(size: string | number | undefined, fallback: number): number {
    const parsed = Number(size);
    if (!Number.isFinite(parsed) || parsed < 1) return fallback;
    return Math.min(100, Math.trunc(parsed));
  }

  private generateSlug(title: string, companyId: string): string {
    const base = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 100);
    const timestamp = Date.now().toString(36);
    return `${base}-${timestamp}`;
  }

  private mapRow(row: HrmInternalNewsRow): HrmInternalNewsRow {
    return {
      id: row.id,
      company_id: row.company_id,
      tenant_id: row.tenant_id,
      title: row.title,
      slug: row.slug,
      summary: row.summary ?? null,
      content: row.content ?? null,
      featured_image_url: row.featured_image_url ?? null,
      attachments: row.attachments ?? [],
      category: row.category ?? 'general',
      tags: row.tags ?? [],
      status: row.status ?? 'draft',
      published_at: row.published_at ? String(row.published_at) : null,
      pinned: Boolean(row.pinned),
      visibility: row.visibility ?? 'all',
      department_ids: row.department_ids ?? [],
      author_id: row.author_id ?? null,
      author_name: row.author_name,
      view_count: Number(row.view_count) ?? 0,
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
    };
  }

  async listNews(query: ListInternalNewsQueryDto, authorization?: string): Promise<InternalNewsListResult> {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, query.company_id ?? '');
    const page = this.resolvePage(query.page, 1);
    const pageSize = this.resolvePageSize(query.page_size, 20);
    const offset = (page - 1) * pageSize;

    const filters: string[] = [];
    const values: unknown[] = [];

    // Apply scope filter
    if (scope.companyIds?.length > 0) {
      filters.push(`company_id = $${values.length + 1}`);
      values.push(scope.companyIds[0]);
    }

    // Category filter
    if (query.category) {
      filters.push(`category = $${values.length + 1}`);
      values.push(query.category);
    }

    // Status filter
    if (query.status) {
      filters.push(`status = $${values.length + 1}`);
      values.push(query.status);
    } else if (query.include_drafts !== 'true') {
      // Default: only show published news
      filters.push(`status = 'published'`);
    }

    const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const orderBy = `ORDER BY pinned DESC, published_at DESC NULLS LAST, created_at DESC`;

    const countRes = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM public.hrm_internal_news ${where};`,
      values,
    );
    const total = parseInt(countRes.rows[0]?.count ?? '0', 10);

    values.push(pageSize, offset);
    const res = await this.db.query<HrmInternalNewsRow>(
      `SELECT ${ROW_SELECT}
       FROM public.hrm_internal_news
       ${where}
       ${orderBy}
       LIMIT $${values.length - 1} OFFSET $${values.length};`,
      values,
    );

    return {
      total,
      page,
      page_size: pageSize,
      data: res.rows.map((row) => this.mapRow(row)),
    };
  }

  async createNews(payload: CreateInternalNewsDto, authorization?: string): Promise<HrmInternalNewsRow> {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    const tenantId = resolveHrmPersistTenantId(authorization, payload.company_id);
    const id = randomUUID();
    const slug = payload.slug ?? this.generateSlug(payload.title, companyId);
    const now = new Date().toISOString();

    const status = payload.status ?? 'published';
    const publishedAt = payload.published_at?.toISOString() ?? (status === 'published' ? now : null);

    const res = await this.db.query<HrmInternalNewsRow>(
      `INSERT INTO public.hrm_internal_news (
        id, company_id, tenant_id,
        title, slug, summary, content,
        featured_image_url, attachments,
        category, tags,
        status, published_at, pinned,
        visibility, department_ids,
        author_id, author_name,
        view_count,
        created_at, updated_at
      ) VALUES (
        $1::uuid, $2, $3,
        $4, $5, $6, $7,
        $8, $9,
        $10, $11,
        $12, $13, $14,
        $15, $16,
        $17, $18,
        0,
        $19, $20
      )
      ON CONFLICT (company_id, slug) DO UPDATE SET
        slug = EXCLUDED.slug || '-' || EXTRACT(EPOCH FROM NOW())::text
      RETURNING ${ROW_SELECT};`,
      [
        id,
        companyId,
        tenantId,
        payload.title,
        slug,
        payload.summary ?? null,
        payload.content ?? null,
        payload.featured_image_url ?? null,
        JSON.stringify(payload.attachments ?? []),
        payload.category ?? 'general',
        JSON.stringify(payload.tags ?? []),
        status,
        publishedAt,
        payload.pinned ?? false,
        payload.visibility ?? 'all',
        JSON.stringify(payload.department_ids ?? []),
        payload.author_id ?? null,
        payload.author_name ?? 'HR Admin',
        now,
        now,
      ],
    );

    return this.mapRow(res.rows[0]);
  }

  private async getNewsScoped(id: string, companyId: string, authorization?: string) {
    const scope = resolveHrmListScope(authorization, companyId);
    const res = await this.db.query<HrmInternalNewsRow>(
      `SELECT ${ROW_SELECT} FROM public.hrm_internal_news WHERE id = $1::uuid LIMIT 1;`,
      [id],
    );
    return res.rows[0] ? this.mapRow(res.rows[0]) : null;
  }

  async getNewsById(id: string, companyId: string, authorization?: string): Promise<HrmInternalNewsRow> {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const existing = await this.getNewsScoped(id, companyId, authorization);

    if (!existing) {
      throw new ApiException('HRM-NEWS-404', 'News not found', HttpStatus.NOT_FOUND);
    }

    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-NEWS-404',
      mismatchCode: 'HRM-NEWS-409',
    });

    return existing;
  }

  async updateNews(
    id: string,
    payload: UpdateInternalNewsDto,
    authorization?: string,
  ): Promise<HrmInternalNewsRow> {
    await this.ensureSchema();
    if (!payload.company_id?.trim()) {
      throw new ApiException('HRM-NEWS-002', 'company_id is required', HttpStatus.BAD_REQUEST);
    }
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id.trim());
    const scope = resolveHrmListScope(authorization, companyId);
    const existing = await this.getNewsScoped(id, companyId, authorization);

    if (!existing) {
      throw new ApiException('HRM-NEWS-404', 'News not found', HttpStatus.NOT_FOUND);
    }

    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-NEWS-404',
      mismatchCode: 'HRM-NEWS-409',
    });

    const fields: string[] = ['updated_at = $1'];
    const values: unknown[] = [new Date().toISOString()];
    let paramIdx = 2;

    const updates: Record<string, unknown> = {
      title: payload.title,
      slug: payload.slug,
      summary: payload.summary,
      content: payload.content,
      featured_image_url: payload.featured_image_url,
      attachments: payload.attachments ? JSON.stringify(payload.attachments) : undefined,
      category: payload.category,
      tags: payload.tags ? JSON.stringify(payload.tags) : undefined,
      status: payload.status,
      published_at: payload.published_at?.toISOString(),
      pinned: payload.pinned,
      visibility: payload.visibility,
      department_ids: payload.department_ids ? JSON.stringify(payload.department_ids) : undefined,
      author_id: payload.author_id,
      author_name: payload.author_name,
    };

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIdx}`);
        values.push(value);
        paramIdx++;
      }
    }

    values.push(id);
    const res = await this.db.query<HrmInternalNewsRow>(
      `UPDATE public.hrm_internal_news SET ${fields.join(', ')} WHERE id = $${paramIdx}::uuid RETURNING ${ROW_SELECT};`,
      values,
    );

    return this.mapRow(res.rows[0]);
  }

  async deleteNews(id: string, companyId: string, authorization?: string): Promise<{ id: string }> {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const existing = await this.getNewsScoped(id, companyId, authorization);

    if (!existing) {
      throw new ApiException('HRM-NEWS-404', 'News not found', HttpStatus.NOT_FOUND);
    }

    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-NEWS-404',
      mismatchCode: 'HRM-NEWS-409',
    });

    await this.db.query(`DELETE FROM public.hrm_internal_news WHERE id = $1::uuid;`, [id]);
    return { id };
  }

  async incrementViewCount(id: string, companyId: string): Promise<{ view_count: number }> {
    await this.ensureSchema();
    const res = await this.db.query<{ view_count: number }>(
      `UPDATE public.hrm_internal_news
       SET view_count = view_count + 1
       WHERE id = $1::uuid AND company_id = $2
       RETURNING view_count;`,
      [id, companyId],
    );

    if (!res.rows[0]) {
      throw new ApiException('HRM-NEWS-404', 'News not found', HttpStatus.NOT_FOUND);
    }

    return { view_count: res.rows[0].view_count };
  }
}
