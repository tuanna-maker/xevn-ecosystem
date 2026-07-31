import React, { useMemo, useState } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { ORG_GRADE_LEVELS, type OrgGradeBand } from '../../data/org-grade-reference';
import {
  addGradeTitle,
  buildLayoutForEnabledLevels,
  moveGradeTitle,
  removeGradeTitle,
  type GradeTitleLayout,
} from '../../utils/orgGradeLayout';

const BAND_SURFACE: Record<OrgGradeBand, string> = {
  yellow: 'border-amber-200/90 bg-amber-50/95',
  orange: 'border-orange-200/90 bg-orange-50/95',
  green: 'border-emerald-200/80 bg-emerald-50/90',
  grey: 'border-slate-300 bg-slate-200/50',
  white: 'border-xevn-border bg-white',
};

const DRAG_MIME = 'application/xevn-org-grade-title';

type DragPayload = { level: number; index: number };

function encodeDrag(payload: DragPayload): string {
  return JSON.stringify(payload);
}

function decodeDrag(raw: string): DragPayload | null {
  try {
    const parsed = JSON.parse(raw) as DragPayload;
    if (typeof parsed.level !== 'number' || typeof parsed.index !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

export type OrgGradeOrgChartEditorProps = {
  enabledLevels: number[];
  titleLayout: GradeTitleLayout;
  onTitleLayoutChange: (next: GradeTitleLayout) => void;
};

/** Sơ đồ ORG GRADE có CRUD + kéo thả vị trí chức danh theo cấp đã bật. */
export const OrgGradeOrgChartEditor: React.FC<OrgGradeOrgChartEditorProps> = ({
  enabledLevels,
  titleLayout,
  onTitleLayoutChange,
}) => {
  const [draftByLevel, setDraftByLevel] = useState<Record<number, string>>({});

  const layout = useMemo(
    () => buildLayoutForEnabledLevels(enabledLevels, titleLayout),
    [enabledLevels, titleLayout],
  );

  const rows = useMemo(
    () =>
      ORG_GRADE_LEVELS.filter((r) => enabledLevels.includes(r.level)).sort((a, b) => a.level - b.level),
    [enabledLevels],
  );

  function handleDrop(toLevel: number, toIndex: number, dataTransfer: DataTransfer) {
    const raw = dataTransfer.getData(DRAG_MIME);
    const payload = decodeDrag(raw);
    if (!payload) return;
    onTitleLayoutChange(moveGradeTitle(layout, payload.level, payload.index, toLevel, toIndex));
  }

  if (!enabledLevels.length) {
    return (
      <p className="rounded-input border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
        Chọn ít nhất một cấp ORG GRADE ở trên để cấu hình sơ đồ khung phòng/ban.
      </p>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-xevn-border bg-slate-50/90 bg-workflow-canvas-dots shadow-inner"
      role="region"
      aria-label="Sơ đồ khung phòng ban — kéo thả chức danh"
    >
      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 py-6 md:px-8">
        <div className="mb-4 text-center">
          <h3 className="text-base font-semibold text-xevn-text md:text-lg">Sơ đồ khung phòng/ban</h3>
          <p className="mt-1 text-sm text-slate-600">
            Kéo thả chức danh trong cùng cấp hoặc sang cấp khác · Thêm / xóa · Lưu khung để ghi DB
          </p>
        </div>

        <div className="flex w-full flex-col items-center">
          {rows.map((row, index) => {
            const titles = layout[row.level] ?? [];
            const draft = draftByLevel[row.level] ?? '';
            return (
              <React.Fragment key={row.level}>
                {index > 0 ? (
                  <div className="flex flex-col items-center py-1" aria-hidden>
                    <div className="h-5 w-px bg-gradient-to-b from-slate-300 to-xevn-primary/40" />
                    <div className="h-0 w-0 border-x-[6px] border-t-[7px] border-x-transparent border-t-xevn-primary/35" />
                  </div>
                ) : null}

                <div
                  className={`w-full max-w-[52rem] rounded-xl border-2 shadow-soft ${BAND_SURFACE[row.band]}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(row.level, titles.length, e.dataTransfer);
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] px-4 py-2.5">
                    <span className="inline-flex items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-xevn-primary/10 text-sm font-bold tabular-nums text-xevn-primary">
                        {row.level}
                      </span>
                      <span className="text-[15px] font-semibold text-xevn-text">Cấp {row.level}</span>
                    </span>
                    <span className="text-xs text-slate-500">{titles.length} vị trí</span>
                  </div>

                  <div className="space-y-3 px-3 py-3 md:px-4">
                    {titles.length ? (
                      <div className="flex flex-wrap gap-2">
                        {titles.map((title, titleIndex) => (
                          <div
                            key={`${row.level}-${titleIndex}-${title}`}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData(
                                DRAG_MIME,
                                encodeDrag({ level: row.level, index: titleIndex }),
                              );
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDrop(row.level, titleIndex, e.dataTransfer);
                            }}
                            className="group inline-flex max-w-full cursor-grab items-center gap-1 rounded-lg border border-xevn-border/80 bg-white/95 px-2 py-1.5 text-xs shadow-sm active:cursor-grabbing md:text-sm"
                          >
                            <GripVertical
                              className="h-3.5 w-3.5 shrink-0 text-xevn-textMuted"
                              strokeWidth={2}
                              aria-hidden
                            />
                            <span className="min-w-0 truncate text-slate-800">{title}</span>
                            <button
                              type="button"
                              onClick={() =>
                                onTitleLayoutChange(removeGradeTitle(layout, row.level, titleIndex))
                              }
                              className="rounded p-0.5 text-rose-600 opacity-70 transition hover:bg-rose-50 hover:opacity-100"
                              aria-label={`Xóa ${title}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="py-2 text-center text-sm italic text-slate-500">
                        Chưa có chức danh — thêm bên dưới hoặc kéo từ cấp khác
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 border-t border-black/[0.05] pt-2">
                      <input
                        value={draft}
                        onChange={(e) =>
                          setDraftByLevel((prev) => ({ ...prev, [row.level]: e.target.value }))
                        }
                        placeholder="Tên chức danh / vị trí mới"
                        className="min-w-[12rem] flex-1 rounded-input border border-xevn-border bg-white px-3 py-1.5 text-sm outline-none"
                        aria-label={`Thêm chức danh cấp ${row.level}`}
                        onKeyDown={(e) => {
                          if (e.key !== 'Enter') return;
                          e.preventDefault();
                          onTitleLayoutChange(addGradeTitle(layout, row.level, draft));
                          setDraftByLevel((prev) => ({ ...prev, [row.level]: '' }));
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          onTitleLayoutChange(addGradeTitle(layout, row.level, draft));
                          setDraftByLevel((prev) => ({ ...prev, [row.level]: '' }));
                        }}
                        className="inline-flex items-center gap-1 rounded-input border border-xevn-border bg-white px-3 py-1.5 text-sm font-medium text-xevn-primary transition hover:bg-slate-50"
                      >
                        <Plus className="h-4 w-4" strokeWidth={2} />
                        Thêm
                      </button>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
