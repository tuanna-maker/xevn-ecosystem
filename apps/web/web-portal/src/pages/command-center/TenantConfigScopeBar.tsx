import React from 'react';
import type { Company } from '../../data/mock-data';
import { companyFullName, companyPrimaryLabel } from '../../utils/company-display';
import {
  SETTINGS_CONTROL_TEXT,
  SETTINGS_PAGE_SUBTITLE_CLASS,
  SETTINGS_RADIUS_CARD,
} from './settings-form-pattern';

export type TenantConfigScopeBarProps = {
  entities: Company[];
  selectedEntityId: string | null;
  onSelectEntityId: (id: string) => void;
  loading?: boolean;
  notice?: string | null;
  title?: string;
  subtitle?: string;
};

/**
 * Thanh chọn pháp nhân — dùng cho menu cấu hình ngoài chi tiết đơn vị thành viên.
 */
export const TenantConfigScopeBar: React.FC<TenantConfigScopeBarProps> = ({
  entities,
  selectedEntityId,
  onSelectEntityId,
  loading,
  notice,
  title = 'Chọn công ty',
  subtitle = 'Chọn đơn vị thành viên để xem và cấu hình danh mục riêng của công ty đó.',
}) => {
  const selected = entities.find((e) => e.id === selectedEntityId) ?? entities[0] ?? null;

  return (
    <div className={`space-y-3 border border-xevn-border p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
      <div>
        <h4 className="text-[0.9375rem] font-semibold text-xevn-text">{title}</h4>
        <p className={`mt-1 ${SETTINGS_PAGE_SUBTITLE_CLASS}`}>{subtitle}</p>
      </div>
      {loading ? (
        <p className={`${SETTINGS_CONTROL_TEXT} text-slate-500`}>Đang tải danh sách pháp nhân…</p>
      ) : null}
      {notice ? <p className="text-sm text-amber-700">{notice}</p> : null}
      {entities.length === 0 && !loading ? (
        <p className={`${SETTINGS_CONTROL_TEXT} text-slate-500`}>
          Chưa có pháp nhân từ XBOS. Kiểm tra seed org hoặc quyền tập đoàn.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Chọn công ty">
            {entities.map((entity) => {
              const active = entity.id === (selectedEntityId ?? entities[0]?.id);
              const primary = companyPrimaryLabel(entity);
              const full = companyFullName(entity);
              return (
                <button
                  key={entity.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSelectEntityId(entity.id)}
                  className={`rounded-input border px-3 py-2 text-left text-[0.9375rem] transition active:scale-95 ${
                    active
                      ? 'border-xevn-primary bg-xevn-primary/10 font-semibold text-xevn-primary'
                      : 'border-xevn-border bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block">{primary}</span>
                  {full !== primary ? (
                    <span className="block text-xs font-normal text-slate-500">{full}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
          {selected ? (
            <p className={`${SETTINGS_CONTROL_TEXT} text-slate-600`}>
              Đang cấu hình cho:{' '}
              <strong className="text-xevn-text">{companyFullName(selected)}</strong>
            </p>
          ) : null}
        </>
      )}
    </div>
  );
};
