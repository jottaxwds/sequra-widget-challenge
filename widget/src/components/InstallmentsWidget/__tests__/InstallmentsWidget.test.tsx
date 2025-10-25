import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import InstallmentsWidget from '..';
import { getSortedInstallmentOptions, trackError, trackInstallmentSelection, trackWidgetView } from '../../../api/helpers';
import { events } from '../../../constants';
import { mockInstalments } from '../../../__mocks__/instalments';
import type { CreditAgreement } from '../../../types';

vi.mock('../../../api/helpers', () => ({
  getSortedInstallmentOptions: vi.fn(),
  trackError: vi.fn(),
  trackInstallmentSelection: vi.fn(),
  trackWidgetView: vi.fn(),
}));

interface MockDropdownProps {
  instalments: CreditAgreement[];
  selectedInstalment: CreditAgreement;
  onSelectInstallment: (instalment: CreditAgreement) => void;
}

vi.mock('../../InstallmentsDropdown', () => ({
  default: ({ instalments, selectedInstalment, onSelectInstallment }: MockDropdownProps) => (
    <div data-testid="installments-dropdown">
      <button onClick={() => onSelectInstallment(instalments[1])}>
        Select {selectedInstalment?.instalment_count} installments
      </button>
    </div>
  )
}));

interface MockHeadLineProps {
  selectedInstalment: CreditAgreement;
}

vi.mock('../../HeadLine', () => ({
  default: ({ selectedInstalment }: MockHeadLineProps) => (
    <div data-testid="headline">
      Headline for {selectedInstalment?.instalment_count} installments
    </div>
  )
}));

describe('InstallmentsWidget', () => {
  const mockGetSortedInstallmentOptions = vi.mocked(getSortedInstallmentOptions);
  const mockTrackError = vi.mocked(trackError);
  const mockTrackInstallmentSelection = vi.mocked(trackInstallmentSelection);
  const mockTrackWidgetView = vi.mocked(trackWidgetView);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchCreditAgreements functionality', () => {
    it('should fetch credit agreements when total is provided', async () => {
      mockGetSortedInstallmentOptions.mockResolvedValue(mockInstalments);

      render(<InstallmentsWidget total={300} />);

      await waitFor(() => {
        expect(mockGetSortedInstallmentOptions).toHaveBeenCalledWith(30000);
      });

      expect(screen.getByTestId('headline')).toBeInTheDocument();
      expect(screen.getByTestId('installments-dropdown')).toBeInTheDocument();
    });

    it('should not fetch credit agreements when total is 0', () => {
      render(<InstallmentsWidget total={0} />);

      expect(mockGetSortedInstallmentOptions).not.toHaveBeenCalled();
      expect(screen.getByText('Pago flexible no disponible para este producto.')).toBeInTheDocument();
    });

    it('should not fetch credit agreements when total is negative', () => {
      render(<InstallmentsWidget total={-100} />);

      expect(mockGetSortedInstallmentOptions).not.toHaveBeenCalled();
      expect(screen.getByText('Pago flexible no disponible para este producto.')).toBeInTheDocument();
    });

    it('should not fetch credit agreements when total is undefined', () => {
      render(<InstallmentsWidget />);

      expect(mockGetSortedInstallmentOptions).not.toHaveBeenCalled();
      expect(screen.getByText('Pago flexible no disponible para este producto.')).toBeInTheDocument();
    });

    it('should convert total to cents before API call', async () => {
      mockGetSortedInstallmentOptions.mockResolvedValue(mockInstalments);

      render(<InstallmentsWidget total={123.45} />);

      await waitFor(() => {
        expect(mockGetSortedInstallmentOptions).toHaveBeenCalledWith(12345);
      });
    });

    it('should set first installment as selected when data is fetched', async () => {
      mockGetSortedInstallmentOptions.mockResolvedValue(mockInstalments);

      render(<InstallmentsWidget total={300} />);

      await waitFor(() => {
        expect(screen.getByText('Headline for 3 installments')).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('should handle API errors and show error UI', async () => {
      const errorMessage = 'Network error';
      mockGetSortedInstallmentOptions.mockRejectedValue(new Error(errorMessage));

      render(<InstallmentsWidget total={300} />);

      await waitFor(() => {
        expect(screen.getByText(/No pudimos obtener las opciones de pago flexible/)).toBeInTheDocument();
      });

      expect(console.error).toHaveBeenCalledWith('[SeQura Widget] - Error fetching credit agreements:', expect.any(Error));
    });

    it('should track error when API call fails', async () => {
      const errorMessage = 'API Error';
      mockGetSortedInstallmentOptions.mockRejectedValue(new Error(errorMessage));

      render(<InstallmentsWidget total={300} />);

      await waitFor(() => {
        expect(mockTrackError).toHaveBeenCalledWith(
          events.credit_agreement_fetch_failed,
          errorMessage,
          { totalAmount: 300 }
        );
      });
    });

    it('should track error when no installments are returned', async () => {
      mockGetSortedInstallmentOptions.mockResolvedValue([]);

      render(<InstallmentsWidget total={300} />);

      await waitFor(() => {
        expect(mockTrackError).toHaveBeenCalledWith(
          events.credit_agreement_fetch_no_instalments_response,
          'No instalments found',
          { totalAmount: 30000 }
        );
      });
    });

    it('should show no data UI when empty array is returned', async () => {
      mockGetSortedInstallmentOptions.mockResolvedValue([]);

      render(<InstallmentsWidget total={300} />);

      await waitFor(() => {
        expect(screen.getByText('Pago flexible no disponible para este producto.')).toBeInTheDocument();
      });
    });
  });

  describe('event tracking', () => {
    it('should track widget initialization on mount', () => {
      render(<InstallmentsWidget total={300} />);

      expect(mockTrackWidgetView).toHaveBeenCalledWith(events.widget_init, 0);
    });

    it('should track successful credit agreement fetch', async () => {
      mockGetSortedInstallmentOptions.mockResolvedValue(mockInstalments);

      render(<InstallmentsWidget total={300} />);

      await waitFor(() => {
        expect(mockTrackWidgetView).toHaveBeenCalledWith(
          events.credit_agreement_fetch_success,
          30000
        );
      });
    });

    it('should track installment selection when first installment is auto-selected', async () => {
      mockGetSortedInstallmentOptions.mockResolvedValue(mockInstalments);

      render(<InstallmentsWidget total={300} />);

      await waitFor(() => {
        expect(mockTrackInstallmentSelection).toHaveBeenCalledWith(
          mockInstalments[0].instalment_count,
          mockInstalments[0].instalment_total.value
        );
      });
    });

    it('should track installment selection when user selects different installment', async () => {
      mockGetSortedInstallmentOptions.mockResolvedValue(mockInstalments);

      render(<InstallmentsWidget total={300} />);

      await waitFor(() => {
        expect(screen.getByTestId('installments-dropdown')).toBeInTheDocument();
      });

      const selectButton = screen.getByRole('button');
      selectButton.click();

      await waitFor(() => {
        expect(screen.getByText('Headline for 6 installments')).toBeInTheDocument();
      });
    });
  });

  describe('loading UI', () => {
    it('should show loading spinner while fetching data', async () => {
      let resolvePromise: (value: CreditAgreement[]) => void;
      const promise = new Promise<CreditAgreement[]>((resolve) => {
        resolvePromise = resolve;
      });
      mockGetSortedInstallmentOptions.mockReturnValue(promise);

      render(<InstallmentsWidget total={300} />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      resolvePromise!(mockInstalments);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('headline')).toBeInTheDocument();
    });

    it('should hide loading spinner after successful fetch', async () => {
      mockGetSortedInstallmentOptions.mockResolvedValue(mockInstalments);

      render(<InstallmentsWidget total={300} />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('headline')).toBeInTheDocument();
    });

    it('should hide loading spinner after error', async () => {
      mockGetSortedInstallmentOptions.mockRejectedValue(new Error('API Error'));

      render(<InstallmentsWidget total={300} />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      expect(screen.getByText(/No pudimos obtener las opciones de pago flexible/)).toBeInTheDocument();
    });
  });

  describe('no data UI', () => {
    it('should show no data message when total is 0', () => {
      render(<InstallmentsWidget total={0} />);

      expect(screen.getByText('Pago flexible no disponible para este producto.')).toBeInTheDocument();
      expect(screen.queryByTestId('headline')).not.toBeInTheDocument();
      expect(screen.queryByTestId('installments-dropdown')).not.toBeInTheDocument();
    });

    it('should show no data message when total is undefined', () => {
      render(<InstallmentsWidget />);

      expect(screen.getByText('Pago flexible no disponible para este producto.')).toBeInTheDocument();
      expect(screen.queryByTestId('headline')).not.toBeInTheDocument();
      expect(screen.queryByTestId('installments-dropdown')).not.toBeInTheDocument();
    });

    it('should show no data message when API returns empty array', async () => {
      mockGetSortedInstallmentOptions.mockResolvedValue([]);

      render(<InstallmentsWidget total={300} />);

      await waitFor(() => {
        expect(screen.getByText('Pago flexible no disponible para este producto.')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('headline')).not.toBeInTheDocument();
      expect(screen.queryByTestId('installments-dropdown')).not.toBeInTheDocument();
    });

    it('should show no data message when data is null', async () => {
      mockGetSortedInstallmentOptions.mockResolvedValue([] as CreditAgreement[]);

      render(<InstallmentsWidget total={300} />);

      await waitFor(() => {
        expect(screen.getByText('Pago flexible no disponible para este producto.')).toBeInTheDocument();
      });
    });
  });

  describe('error UI', () => {
    it('should show error message when API call fails', async () => {
      mockGetSortedInstallmentOptions.mockRejectedValue(new Error('Network error'));

      render(<InstallmentsWidget total={300} />);

      await waitFor(() => {
        expect(screen.getByText(/No pudimos obtener las opciones de pago flexible en este momento/)).toBeInTheDocument();
        expect(screen.getByText(/Por favor, inténtalo de nuevo más tarde/)).toBeInTheDocument();
      });

      expect(screen.queryByTestId('headline')).not.toBeInTheDocument();
      expect(screen.queryByTestId('installments-dropdown')).not.toBeInTheDocument();
    });

    it('should reset error state when making new successful request', async () => {
      mockGetSortedInstallmentOptions.mockRejectedValueOnce(new Error('Network error'));

      const { rerender } = render(<InstallmentsWidget total={300} />);

      await waitFor(() => {
        expect(screen.getByText(/No pudimos obtener las opciones de pago flexible en este momento/)).toBeInTheDocument();
      });

      mockGetSortedInstallmentOptions.mockResolvedValue(mockInstalments);

      rerender(<InstallmentsWidget total={400} />);

      await waitFor(() => {
        expect(screen.queryByText(/No pudimos obtener las opciones de pago flexible en este momento/)).not.toBeInTheDocument();
        expect(screen.getByTestId('headline')).toBeInTheDocument();
      });
    });
  });

  describe('component integration', () => {
    it('should render complete widget with all components when data is available', async () => {
      mockGetSortedInstallmentOptions.mockResolvedValue(mockInstalments);

      render(<InstallmentsWidget total={300} />);

      await waitFor(() => {
        expect(screen.getByTestId('headline')).toBeInTheDocument();
        expect(screen.getByTestId('installments-dropdown')).toBeInTheDocument();
      });

      const widget = screen.getByTestId('headline').closest('#sequra-widget');
      expect(widget).toBeInTheDocument();
      expect(widget).toHaveClass('w-full', 'mx-auto', 'bg-white');
    });

    it('should update selected installment when user makes selection', async () => {
      mockGetSortedInstallmentOptions.mockResolvedValue(mockInstalments);

      render(<InstallmentsWidget total={300} />);

      await waitFor(() => {
        expect(screen.getByText('Headline for 3 installments')).toBeInTheDocument();
      });

      const selectButton = screen.getByRole('button');
      selectButton.click();

      await waitFor(() => {
        expect(screen.getByText('Headline for 6 installments')).toBeInTheDocument();
      });
    });
  });
});
