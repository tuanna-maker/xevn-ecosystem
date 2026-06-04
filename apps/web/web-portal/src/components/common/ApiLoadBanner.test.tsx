import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApiLoadBanner } from './ApiLoadBanner';

describe('ApiLoadBanner (UC-CC-P0-09 consistency)', () => {
  it('renders info message when strict empty hint without loadFailed/mock', () => {
    render(
      <ApiLoadBanner
        loadFailed={false}
        usingMockFallback={false}
        message="Inbox trống — chạy seed."
      />,
    );
    expect(screen.getByText('Inbox trống — chạy seed.')).toBeTruthy();
  });

  it('renders nothing when all flags false and no message', () => {
    const { container } = render(<ApiLoadBanner loadFailed={false} usingMockFallback={false} />);
    expect(container.firstChild).toBeNull();
  });
});
