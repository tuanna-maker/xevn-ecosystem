import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PolicyPackSetupScreen } from './PolicyPackSetupScreen';

const MOCK_CHUNG = [
  {
    id: '1',
    code: 'F-PLT-PAY-COMP-BASE',
    nameVi: 'Thang bac QD 2A',
    scope: 'CHUNG',
    status: 'active',
  },
];

describe('STP-01 CHUNG - PolicyPackSetupScreen', () => {
  it('AC-PAY-STP-01: hien thi danh sach CHUNG va tao moi 2xx', async () => {
    const listMock = vi.fn(() => ({ data: MOCK_CHUNG, isLoading: false, isError: false }));
    const createMock = vi.fn(() => Promise.resolve({ id: '2', code: 'NEW' }));
    vi.mock('./usePolicyPackApi', () => ({
      useListPolicyPacks: () => listMock(),
      useCreatePolicyPack: () => ({ mutateAsync: createMock, isPending: false, isError: false, error: null, isSuccess: false }),
    }));

    render(<PolicyPackSetupScreen />);

    expect(screen.getByTestId('pay-policy-pack-list')).toBeDefined();
    expect(screen.getByText('F-PLT-PAY-COMP-BASE')).toBeDefined();

    await userEvent.type(screen.getByPlaceholderText('VD: F-PLT-PAY-COMP-BASE'), 'NEW-PACK');
    await userEvent.click(screen.getByRole('button', { name: "Luu go'i chinh sach" }));
    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
  });
});
