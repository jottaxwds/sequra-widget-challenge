import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InstallmentsDropdown from '..';
import type { CreditAgreement } from '../../../types';
import { trackInstallmentSelection, trackWidgetView } from '../../../api/helpers';
import { events } from '../../../constants';
import { mockInstalments } from '../../../__mocks__/instalments';

vi.mock('../../../api/helpers', () => ({
  trackInstallmentSelection: vi.fn(),
  trackWidgetView: vi.fn(),
}));

describe('InstallmentsDropdown', () => {
  const mockOnSelectInstallment = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows dropdown with given instalments', () => {
    render(
      <InstallmentsDropdown
        instalments={mockInstalments}
        selectedInstalment={mockInstalments[0]}
        onSelectInstallment={mockOnSelectInstallment}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByRole('option', { name: '3 cuotas de 100€' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '6 cuotas de 110€' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '12 cuotas de 120€' })).toBeInTheDocument();
  });

  it('triggers event when dropdown is shown', () => {
    render(
      <InstallmentsDropdown
        instalments={mockInstalments}
        selectedInstalment={mockInstalments[1]}
        onSelectInstallment={mockOnSelectInstallment}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(trackWidgetView).toHaveBeenCalledWith(
      events.dropdown_opened,
      mockInstalments[1].total_with_tax.value
    );
    expect(trackWidgetView).toHaveBeenCalledTimes(1);
  });

  it('triggers event when selecting instalment', () => {
    render(
      <InstallmentsDropdown
        instalments={mockInstalments}
        selectedInstalment={mockInstalments[0]}
        onSelectInstallment={mockOnSelectInstallment}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const option = screen.getByRole('option', { name: '6 cuotas de 110€' });
    fireEvent.click(option);

    expect(trackInstallmentSelection).toHaveBeenCalledWith(6, 110);
    expect(trackInstallmentSelection).toHaveBeenCalledTimes(1);
  });

  it('calls onSelectInstalment when instalment is selected in the dropdown', () => {
    render(
      <InstallmentsDropdown
        instalments={mockInstalments}
        selectedInstalment={mockInstalments[0]}
        onSelectInstallment={mockOnSelectInstallment}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const option = screen.getByRole('option', { name: '12 cuotas de 120€' });
    fireEvent.click(option);

    expect(mockOnSelectInstallment).toHaveBeenCalledWith(mockInstalments[2]);
    expect(mockOnSelectInstallment).toHaveBeenCalledTimes(1);
  });

  it('shows right label as for the given instalments in the dropdown', () => {
    const customInstalments: CreditAgreement[] = [
      {
        ...mockInstalments[0],
        instalment_count: 4,
        instalment_total: { value: 75.25, string: '75,25€' },
      },
      {
        ...mockInstalments[0],
        instalment_count: 8,
        instalment_total: { value: 37.63, string: '37,63€' },
      },
    ];

    render(
      <InstallmentsDropdown
        instalments={customInstalments}
        selectedInstalment={customInstalments[0]}
        onSelectInstallment={mockOnSelectInstallment}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByRole('option', { name: '4 cuotas de 75,25€' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '8 cuotas de 37,63€' })).toBeInTheDocument();
  });
});
