import React from 'react';
import { ORG_GRADE_LEVELS, type OrgGradeBand } from '../../data/org-grade-reference';

const BAND_SURFACE: Record<OrgGradeBand, string> = {
  yellow: 'border-amber-200/90 bg-amber-50/95',
  orange: 'border-orange-200/90 bg-orange-50/95',
  green: 'border-emerald-200/80 bg-emerald-50/90',
  grey: 'border-slate-300 bg-slate-200/50',
  white: 'border-xevn-border bg-white',
};

/**
 * Sơ đồ tổ chức tham chiếu ORG GRADE — 9 cấp xếp chồng, read-only.
 */
export const OrgGradeOrgChart: React.FC = () => {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-xevn-border bg-slate-50/90 bg-workflow-canvas-dots shadow-inner"
      role="img"
      aria-label="Sơ đồ tổ chức 9 cấp ORG GRADE"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/70 to-transparent" />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 py-8 md:px-8">
        <div className="mb-6 text-center">
          <h3 className="text-base font-semibold text-xevn-text md:text-lg">Sơ đồ tổ chức (ORG GRADE)</h3>
          <p className="mt-1 text-sm text-slate-600">
            Chín tầng từ lãnh đạo tới vận hành — chức danh tham chiếu theo từng cấp
          </p>
        </div>

        <div className="flex w-full flex-col items-center">
          {ORG_GRADE_LEVELS.map((row, index) => (
            <React.Fragment key={row.level}>
              {index > 0 ? (
                <div className="flex flex-col items-center py-1" aria-hidden>
                  <div className="h-6 w-px bg-gradient-to-b from-slate-300 to-xevn-primary/40" />
                  <div
                    className="h-0 w-0 border-x-[7px] border-t-[8px] border-x-transparent border-t-xevn-primary/35"
                    aria-hidden
                  />
                </div>
              ) : null}

              <div
                className={`w-full max-w-[52rem] rounded-xl border-2 shadow-soft transition-shadow ${BAND_SURFACE[row.band]}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] px-4 py-2.5 md:px-5">
                  <span className="inline-flex items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-xevn-primary/10 text-sm font-bold tabular-nums text-xevn-primary">
                      {row.level}
                    </span>
                    <span className="text-[15px] font-semibold text-xevn-text">
                      Cấp {row.level}
                      {row.level === 6 ? (
                        <span className="font-normal text-slate-500"> — ngăn cách (trống)</span>
                      ) : null}
                    </span>
                  </span>
                </div>

                <div className="px-3 py-3 md:px-4 md:py-4">
                  {row.titles.length === 0 ? (
                    <p className="py-3 text-center text-sm italic text-slate-500">
                      Không gán chức danh — giữ khoảng phân tầng trên sơ đồ gốc
                    </p>
                  ) : (
                    <div
                      className={
                        row.titles.length > 8
                          ? 'grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                          : 'flex flex-wrap justify-center gap-2 md:gap-3'
                      }
                    >
                      {row.titles.map((t) => (
                        <div
                          key={t}
                          className={`rounded-lg border border-xevn-border/80 bg-white/90 px-2.5 py-1.5 text-center text-xs leading-snug text-slate-800 shadow-sm md:text-sm ${
                            row.titles.length > 8 ? 'min-h-[2.5rem] content-center' : ''
                          }`}
                        >
                          {t}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>

        <p className="mt-6 max-w-xl text-center text-xs text-slate-500">
          Dữ liệu read-only — dùng làm chuẩn khi cấu hình khung phòng/ban và gán chức danh cho từng pháp nhân.
        </p>
      </div>
    </div>
  );
};
