import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import type { DraggableProvided } from '@hello-pangea/dnd';
import { sameNodeDragBind } from './jdDndSameNodeProps';

const hrmRoot = join(__dirname, '..');

function stubProvided(
  overrides: Partial<DraggableProvided> = {},
): DraggableProvided {
  const innerRef = vi.fn();
  return {
    innerRef,
    draggableProps: {
      'data-rfd-draggable-context-id': 'ctx-1',
      'data-rfd-draggable-id': 'canvas-SEC_META',
      style: { transform: undefined },
      onTransitionEnd: undefined,
    },
    dragHandleProps: {
      tabIndex: 0,
      role: 'button',
      'aria-describedby': 'rfd-usage',
      'data-rfd-drag-handle-draggable-id': 'canvas-SEC_META',
      'data-rfd-drag-handle-context-id': 'ctx-1',
      draggable: false,
      onDragStart: vi.fn(),
    },
    ...overrides,
  } as DraggableProvided;
}

describe('sameNodeDragBind (PO-HRM-UI-HEADER-JD-DND-FE-01 · PO-UAT-REC-JD-DND-FE-01)', () => {
  it('returns ref + merged draggable/handle props (no nested button)', () => {
    const provided = stubProvided();
    const bind = sameNodeDragBind(provided);
    expect(bind.ref).toBe(provided.innerRef);
    expect(bind.props['data-rfd-draggable-id']).toBe('canvas-SEC_META');
    expect(bind.props['data-rfd-drag-handle-draggable-id']).toBe('canvas-SEC_META');
    expect(bind.props.role).toBe('button');
    expect(bind.props.tabIndex).toBe(0);
  });

  it('throws when dragHandleProps is null (disabled draggable)', () => {
    const provided = stubProvided({ dragHandleProps: null });
    expect(() => sameNodeDragBind(provided)).toThrow(/dragHandleProps missing/);
  });

  it('merges handle onto host for canvas-SEC_* ids (storm class)', () => {
    const provided = stubProvided({
      draggableProps: {
        'data-rfd-draggable-context-id': 'ctx-1',
        'data-rfd-draggable-id': 'canvas-SEC_RESPONSIBILITIES',
        style: { transform: undefined },
        onTransitionEnd: undefined,
      },
      dragHandleProps: {
        tabIndex: 0,
        role: 'button',
        'aria-describedby': 'rfd-usage',
        'data-rfd-drag-handle-draggable-id': 'canvas-SEC_RESPONSIBILITIES',
        'data-rfd-drag-handle-context-id': 'ctx-1',
        draggable: false,
        onDragStart: vi.fn(),
      },
    });
    const bind = sameNodeDragBind(provided);
    expect(bind.props['data-rfd-draggable-id']).toBe('canvas-SEC_RESPONSIBILITIES');
    expect(bind.props['data-rfd-drag-handle-draggable-id']).toBe(
      'canvas-SEC_RESPONSIBILITIES',
    );
  });

  it('ContractCreate Step2 passes full DraggableProvided (D-PO-HRM-CTR-CREATE-DND-PALETTE-01)', () => {
    const step2 = readFileSync(
      join(hrmRoot, 'components/contracts/ContractCreateStep2ClausePreview.tsx'),
      'utf8',
    );
    expect(step2).toContain('const bind = sameNodeDragBind(dragProvided)');
    expect(step2).not.toMatch(/sameNodeDragBind\s*\(\s*dragProvided\.dragHandleProps\s*\)/);
    expect(step2).toMatch(/<HrmDragDropContext onDragEnd=\{onDragEnd\}>[\s\S]*ctr-create-palette[\s\S]*ctr-create-canvas/);
  });
});
