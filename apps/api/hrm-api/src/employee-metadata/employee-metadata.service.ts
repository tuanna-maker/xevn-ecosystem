/**
 * @CODE-MEMORY
 * Screen:     Embed Metadata queue — `/employee-metadata/change-requests` (+ audit-logs)
 * UC:         HRM-MD-01..05 · UC-HRM-26 · FR-HRM-MD-01
 * BR:         DATA_LINKAGE §6 Plane B′ · BA-DUAL-PLANE-AUDIT-02 §2#2 · G-MD-PLANE-01
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.31 · FR-HRM-MD-01
 * TechSpec:   docs/hrm/TECHSPEC.md §16.2 · docs/hrm/DB_DESIGN_HRM_W2_SLICE.md §C (UUID company_id)
 * Purpose:    Hàng chờ đổi metadata hồ sơ: submit/list/approve/reject/audit trên Plane B′
 *             (HRM_COMPANY_UUID_BY_SLUG). Wire chấp nhận slug/main; persist UUID map.
 * WorkItem:   D-HRM-MD-DUAL-PLANE-GUARD-01
 * Coded:      2026-07-27
 *
 * Callers:
 *   - employee-metadata.controller.ts → submit / list / approve / reject / audit
 *
 * Callees:
 *   - resolveHrmCompanyUuidForSlug · assertHrmMappedCompanyUuidOrThrow · resolveHrmListScope
 *   - EmployeeMetadataRepository (employee_metadata_* UUID columns)
 *
 * FEActions:
 *   | Thao tác | Handler | Lib | RPC |
 *   | Gửi YC | submitChangeRequest | resolveMetadataCompanyUuid | INSERT change_requests |
 *   | List queue | listChangeRequests | assertMetadataCompanyWire | SELECT scoped |
 *   | Duyệt/Từ chối | approve/reject | assertResourceInHrmScope | UPDATE + values |
 *
 * BEChain:
 *   slug|main → map UUID → employee_metadata_* · LE UUID ∉ map → HRM-PLANE-409
 *
 * Impact:     Bỏ guard → LE UUID list/mutate miss / silent empty queue
 * must_keep:  OP dual-plane GWC · CO-HC GWC · U65 · HOLD_DEPLOY · Admin/Fleet closed
 * SOLID:      Guard wire ở service — không đổi companyIdsToUuidList (home/inbox must_keep)
 * LastVerified: employee-metadata/be-hrm-md-dual-plane-guard-01.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-HRM-MD-DUAL-PLANE-GUARD-01
 * change_mode: ADD
 * What: Fail-closed LE UUID ∉ HRM_COMPANY_UUID_BY_SLUG → HRM-PLANE-409 trên persist
 *       (resolveMetadataCompanyUuid) và list/audit/decide wire (assertMetadataCompanyWire).
 *       Happy slug/main/mapped UUID không đổi. Reuse assertHrmMappedCompanyUuidOrThrow (OP).
 * Why:  BA dual-plane residual #2 — cùng class OP anti-join; G-MD-PLANE-01 UUID DDL.
 * SRS:  FR-HRM-MD-01 #6/#7 · UC-HRM-26
 * TechSpec: DB_DESIGN_HRM_W2_SLICE §C · API_DESIGN_HRM_W2_SLICE C1/C2
 * must_keep: OP GWC · CO-HC · resolveHrmCompanyUuidForSlug slug path · home UUID pass-through
 */
import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import {
  assertHrmMappedCompanyUuidOrThrow,
  assertResourceInHrmScope,
  isHrmMappedCompanyUuid,
  resolveHrmCompanyUuidForSlug,
  resolveHrmListScope,
} from '../common/hrm-list-scope';
import { DecideEmployeeMetadataChangeDto } from './dto/decide-employee-metadata-change.dto';
import { ListEmployeeMetadataChangeRequestsQueryDto } from './dto/list-employee-metadata-change-requests.query.dto';
import { SubmitEmployeeMetadataChangeDto } from './dto/submit-employee-metadata-change.dto';
import { EmployeeMetadataRepository } from './employee-metadata.repository';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class EmployeeMetadataService {
  constructor(private readonly repository: EmployeeMetadataRepository) {}

  /**
   * Fail-closed when wire `company_id` is a UUID outside Plane B′ map (XBOS LE).
   * Slugs (`holding`/`main`/…) pass through — map happens on persist / UUID filter.
   */
  private assertMetadataCompanyWire(requestedCompanyId: string): void {
    const trimmed = requestedCompanyId.trim();
    if (UUID_RE.test(trimmed) && !isHrmMappedCompanyUuid(trimmed)) {
      assertHrmMappedCompanyUuidOrThrow(trimmed);
    }
  }

  /** Persist path: slug→map UUID; mapped UUID OK; LE / unknown UUID → HRM-PLANE-409. */
  private resolveMetadataCompanyUuid(rawCompanyId: string): string {
    const trimmed = rawCompanyId.trim();
    // Xử lý: UUID wire chỉ chấp nhận Plane B′ — reject LE trước khi INSERT (G-MD-PLANE-01).
    if (UUID_RE.test(trimmed)) {
      return assertHrmMappedCompanyUuidOrThrow(trimmed);
    }
    const resolved = resolveHrmCompanyUuidForSlug(trimmed);
    if (!resolved) {
      throw new ApiException(
        'HRM-VAL-001',
        'company_id must be a UUID or known operating slug (holding, finance, …)',
        HttpStatus.BAD_REQUEST,
        { company_id: rawCompanyId },
      );
    }
    return resolved;
  }

  async submitChangeRequest(payload: SubmitEmployeeMetadataChangeDto) {
    const companyId = this.resolveMetadataCompanyUuid(payload.company_id);
    return this.repository.submitChange({
      company_id: companyId,
      employee_id: payload.employee_id,
      legal_entity_id: payload.legal_entity_id,
      field_key: payload.field_key.trim(),
      current_value: payload.current_value
        ? JSON.parse(payload.current_value)
        : null,
      requested_value: JSON.parse(payload.requested_value),
      reason: payload.reason,
      actor_user_id: payload.actor_user_id,
      actor_name: payload.actor_name,
      workflow_code: payload.workflow_code ?? 'xbos.employee_metadata.default',
      source_catalog_key: payload.source_catalog_key ?? 'employee_profile',
    });
  }

  async listChangeRequests(
    query: ListEmployeeMetadataChangeRequestsQueryDto,
    authorization?: string,
  ) {
    // Xử lý: LE wire → 409 trước list SQL — không silent empty queue.
    this.assertMetadataCompanyWire(query.company_id);
    return this.repository.listChangeRequests(
      {
        employee_id: query.employee_id,
        legal_entity_id: query.legal_entity_id,
        status: query.status,
        field_key: query.field_key?.trim(),
        page: query.page ?? 1,
        page_size: query.page_size ?? 20,
      },
      authorization,
      query.company_id,
    );
  }

  async approveChangeRequest(
    changeRequestId: string,
    decision: DecideEmployeeMetadataChangeDto,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    this.assertMetadataCompanyWire(requestedCompanyId);
    const scope = resolveHrmListScope(authorization, requestedCompanyId);
    const pending = await this.repository.getChangeRequestById(changeRequestId);
    assertResourceInHrmScope(pending, scope, {
      notFoundCode: 'HRM-META-404',
      mismatchCode: 'HRM-META-409',
    });
    const request = await this.repository.approveChangeRequest(
      changeRequestId,
      decision,
    );
    if (!request) {
      throw new ApiException(
        'HRM-META-404',
        'Metadata change request not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (request.status !== 'approved') {
      throw new ApiException(
        'HRM-META-409',
        'Metadata change request is not pending',
        HttpStatus.CONFLICT,
      );
    }
    return request;
  }

  async rejectChangeRequest(
    changeRequestId: string,
    decision: DecideEmployeeMetadataChangeDto,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    this.assertMetadataCompanyWire(requestedCompanyId);
    const scope = resolveHrmListScope(authorization, requestedCompanyId);
    const pending = await this.repository.getChangeRequestById(changeRequestId);
    assertResourceInHrmScope(pending, scope, {
      notFoundCode: 'HRM-META-404',
      mismatchCode: 'HRM-META-409',
    });
    const request = await this.repository.rejectChangeRequest(
      changeRequestId,
      decision,
    );
    if (!request) {
      throw new ApiException(
        'HRM-META-404',
        'Metadata change request not found or not pending',
        HttpStatus.NOT_FOUND,
      );
    }
    return request;
  }

  async listAuditLogs(
    companyId: string,
    employeeId: string | undefined,
    authorization?: string,
  ) {
    this.assertMetadataCompanyWire(companyId);
    const data = await this.repository.listAuditLogs(
      companyId,
      employeeId,
      authorization,
    );
    return {
      total: data.length,
      data,
    };
  }
}
