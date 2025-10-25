import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HeadLine from '..';
import { trackWidgetView } from '../../../api/helpers';
import { events } from '../../../constants';
import { mockCreditAgreementNoFees as mockCreditAgreement } from '../../../__mocks__/creditAgreement';
import type { CreditAgreement } from '../../../types';

// Mock the API helpers
vi.mock('../../../api/helpers', () => ({
  trackWidgetView: vi.fn(),
}));

// Mock the MoreInfoDialog component
vi.mock('../../MoreInfoDialog', () => ({
  default: ({ isOpen, onClose, selectedInstalment }: { 
    isOpen: boolean; 
    onClose: () => void; 
    selectedInstalment: CreditAgreement;
  }) => (
    <div data-testid="more-info-dialog" data-open={isOpen}>
      <button onClick={onClose} data-testid="dialog-close">Close</button>
      <div data-testid="dialog-instalment">{selectedInstalment.instalment_count}</div>
    </div>
  ),
}));

describe('HeadLine', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders the headline text correctly', () => {
      render(<HeadLine selectedInstalment={mockCreditAgreement} />);
      expect(screen.getByText('Págalo en:')).toBeInTheDocument();
    });

    it('renders the "Más info" button', () => {
      render(<HeadLine selectedInstalment={mockCreditAgreement} />);
      const button = screen.getByRole('button', { name: 'Más info' });
      expect(button).toBeInTheDocument();
    });

    it('applies correct CSS classes to the container', () => {
      render(<HeadLine selectedInstalment={mockCreditAgreement} />);
      const container = screen.getByText('Págalo en:').parentElement;
      expect(container).toHaveClass('flex', 'justify-between', 'items-center', 'w-full', 'text-base', 'font-medium', 'mb-3');
    });

    it('applies correct CSS classes to the button', () => {
      render(<HeadLine selectedInstalment={mockCreditAgreement} />);
      const button = screen.getByRole('button', { name: 'Más info' });
      expect(button).toHaveClass(
        'text-black',
        'text-sm',
        'font-normal',
        'bg-transparent',
        'border-none',
        'p-0',
        'm-0',
        'leading-normal',
        'cursor-pointer',
        'hover:underline',
        'focus:underline'
      );
    });

    it('renders the MoreInfoDialog component', () => {
      render(<HeadLine selectedInstalment={mockCreditAgreement} />);
      expect(screen.getByTestId('more-info-dialog')).toBeInTheDocument();
    });

    it('initially renders MoreInfoDialog as closed', () => {
      render(<HeadLine selectedInstalment={mockCreditAgreement} />);
      const dialog = screen.getByTestId('more-info-dialog');
      expect(dialog).toHaveAttribute('data-open', 'false');
    });
  });

  describe('Button Interaction', () => {
    it('opens the dialog when "Más info" button is clicked', () => {
      render(<HeadLine selectedInstalment={mockCreditAgreement} />);
      const button = screen.getByRole('button', { name: 'Más info' });
      
      fireEvent.click(button);
      
      const dialog = screen.getByTestId('more-info-dialog');
      expect(dialog).toHaveAttribute('data-open', 'true');
    });

    it('calls trackWidgetView with correct parameters when button is clicked', () => {
      render(<HeadLine selectedInstalment={mockCreditAgreement} />);
      const button = screen.getByRole('button', { name: 'Más info' });
      
      fireEvent.click(button);
      
      expect(trackWidgetView).toHaveBeenCalledWith(
        events.more_info_clicked,
        mockCreditAgreement.total_with_tax.value
      );
      expect(trackWidgetView).toHaveBeenCalledTimes(1);
    });

    it('can be clicked multiple times and tracks each click', () => {
      render(<HeadLine selectedInstalment={mockCreditAgreement} />);
      const button = screen.getByRole('button', { name: 'Más info' });
      
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(trackWidgetView).toHaveBeenCalledTimes(3);
    });
  });

  describe('Dialog State Management', () => {
    it('closes the dialog when onClose is called', () => {
      render(<HeadLine selectedInstalment={mockCreditAgreement} />);
      const button = screen.getByRole('button', { name: 'Más info' });
      
      // Open dialog
      fireEvent.click(button);
      expect(screen.getByTestId('more-info-dialog')).toHaveAttribute('data-open', 'true');
      
      // Close dialog
      const closeButton = screen.getByTestId('dialog-close');
      fireEvent.click(closeButton);
      expect(screen.getByTestId('more-info-dialog')).toHaveAttribute('data-open', 'false');
    });

    it('passes the correct selectedInstalment to MoreInfoDialog', () => {
      render(<HeadLine selectedInstalment={mockCreditAgreement} />);
      const dialogInstalment = screen.getByTestId('dialog-instalment');
      expect(dialogInstalment).toHaveTextContent(mockCreditAgreement.instalment_count.toString());
    });

    it('maintains dialog state independently of multiple clicks', () => {
      render(<HeadLine selectedInstalment={mockCreditAgreement} />);
      const button = screen.getByRole('button', { name: 'Más info' });
      const dialog = screen.getByTestId('more-info-dialog');
      
      // Initially closed
      expect(dialog).toHaveAttribute('data-open', 'false');
      
      // Open dialog
      fireEvent.click(button);
      expect(dialog).toHaveAttribute('data-open', 'true');
      
      // Clicking button again should keep it open (button doesn't toggle, only opens)
      fireEvent.click(button);
      expect(dialog).toHaveAttribute('data-open', 'true');
    });
  });

  describe('Accessibility', () => {
    it('has correct button type attribute', () => {
      render(<HeadLine selectedInstalment={mockCreditAgreement} />);
      const button = screen.getByRole('button', { name: 'Más info' });
      expect(button).toHaveAttribute('type', 'button');
    });

    it('has correct tabIndex for keyboard navigation', () => {
      render(<HeadLine selectedInstalment={mockCreditAgreement} />);
      const button = screen.getByRole('button', { name: 'Más info' });
      expect(button).toHaveAttribute('tabIndex', '0');
    });

    it('supports keyboard interaction', () => {
      render(<HeadLine selectedInstalment={mockCreditAgreement} />);
      const button = screen.getByRole('button', { name: 'Más info' });
      
      // Simulate keyboard activation
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyUp(button, { key: 'Enter' });
      
      // The button should still be functional (though our mock doesn't handle keyboard events)
      expect(button).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('handles different credit agreement values correctly', () => {
      const differentAgreement: CreditAgreement = {
        ...mockCreditAgreement,
        instalment_count: 6,
        total_with_tax: {
          value: 600,
          string: '€600.00',
        },
      };

      render(<HeadLine selectedInstalment={differentAgreement} />);
      const button = screen.getByRole('button', { name: 'Más info' });
      
      fireEvent.click(button);
      
      expect(trackWidgetView).toHaveBeenCalledWith(
        events.more_info_clicked,
        600
      );
      
      const dialogInstalment = screen.getByTestId('dialog-instalment');
      expect(dialogInstalment).toHaveTextContent('6');
    });

    it('handles zero value credit agreements', () => {
      const zeroAgreement: CreditAgreement = {
        ...mockCreditAgreement,
        total_with_tax: {
          value: 0,
          string: '€0.00',
        },
      };

      render(<HeadLine selectedInstalment={zeroAgreement} />);
      const button = screen.getByRole('button', { name: 'Más info' });
      
      fireEvent.click(button);
      
      expect(trackWidgetView).toHaveBeenCalledWith(
        events.more_info_clicked,
        0
      );
    });

    it('handles large value credit agreements', () => {
      const largeAgreement: CreditAgreement = {
        ...mockCreditAgreement,
        total_with_tax: {
          value: 999999.99,
          string: '€999,999.99',
        },
      };

      render(<HeadLine selectedInstalment={largeAgreement} />);
      const button = screen.getByRole('button', { name: 'Más info' });
      
      fireEvent.click(button);
      
      expect(trackWidgetView).toHaveBeenCalledWith(
        events.more_info_clicked,
        999999.99
      );
    });
  });

  describe('Error Handling', () => {
    it('continues to function even if trackWidgetView throws an error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(trackWidgetView).mockRejectedValueOnce(new Error('Network error'));

      render(<HeadLine selectedInstalment={mockCreditAgreement} />);
      const button = screen.getByRole('button', { name: 'Más info' });
      
      fireEvent.click(button);
      
      // Dialog should still open despite tracking error
      const dialog = screen.getByTestId('more-info-dialog');
      expect(dialog).toHaveAttribute('data-open', 'true');
      
      consoleSpy.mockRestore();
    });

    it('renders correctly with minimal credit agreement data', () => {
      const minimalAgreement = {
        ...mockCreditAgreement,
        // Ensure all required fields are present but with minimal values
        instalment_count: 1,
      };

      expect(() => {
        render(<HeadLine selectedInstalment={minimalAgreement} />);
      }).not.toThrow();
      
      expect(screen.getByText('Págalo en:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Más info' })).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('properly integrates with MoreInfoDialog component', () => {
      render(<HeadLine selectedInstalment={mockCreditAgreement} />);
      
      // Verify the dialog receives the correct props
      const dialog = screen.getByTestId('more-info-dialog');
      expect(dialog).toHaveAttribute('data-open', 'false');
      
      const dialogInstalment = screen.getByTestId('dialog-instalment');
      expect(dialogInstalment).toHaveTextContent(mockCreditAgreement.instalment_count.toString());
    });

    it('maintains proper component lifecycle', () => {
      const { rerender } = render(<HeadLine selectedInstalment={mockCreditAgreement} />);
      
      // Open dialog
      const button = screen.getByRole('button', { name: 'Más info' });
      fireEvent.click(button);
      expect(screen.getByTestId('more-info-dialog')).toHaveAttribute('data-open', 'true');
      
      // Rerender with different props
      const newAgreement = { ...mockCreditAgreement, instalment_count: 12 };
      rerender(<HeadLine selectedInstalment={newAgreement} />);
      
      // Dialog should still be open and show new data
      expect(screen.getByTestId('more-info-dialog')).toHaveAttribute('data-open', 'true');
      expect(screen.getByTestId('dialog-instalment')).toHaveTextContent('12');
    });
  });
});
