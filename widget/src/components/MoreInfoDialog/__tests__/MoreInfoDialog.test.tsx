import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MoreInfoDialog from '..';
import { mockCreditAgreement } from '../../../__mocks__/creditAgreement';

describe('MoreInfoDialog', () => {
  const mockOnClose = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    selectedInstalment: mockCreditAgreement,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = 'unset';
  });

  afterEach(() => {
    document.body.style.overflow = 'unset';
  });

  describe('Dialog Visibility', () => {
    it('should not render when isOpen is false', () => {
      render(<MoreInfoDialog {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<MoreInfoDialog {...defaultProps} />);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should set body overflow to hidden when dialog opens', () => {
      render(<MoreInfoDialog {...defaultProps} />);
      
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should reset body overflow when dialog closes', () => {
      const { rerender } = render(<MoreInfoDialog {...defaultProps} />);
      
      expect(document.body.style.overflow).toBe('hidden');
      
      rerender(<MoreInfoDialog {...defaultProps} isOpen={false} />);
      
      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Close Button Interactions', () => {
    it('should call onClose when header close button is clicked', () => {
      render(<MoreInfoDialog {...defaultProps} />);
      
      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when footer close button is clicked', () => {
      render(<MoreInfoDialog {...defaultProps} />);
      
      const footerCloseButton = screen.getByText('Close');
      fireEvent.click(footerCloseButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard Interactions', () => {
    it('should call onClose when Escape key is pressed', () => {
      render(<MoreInfoDialog {...defaultProps} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when other keys are pressed', () => {
      render(<MoreInfoDialog {...defaultProps} />);
      
      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Space' });
      fireEvent.keyDown(document, { key: 'Tab' });
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should not add escape key listener when dialog is closed', () => {
      render(<MoreInfoDialog {...defaultProps} isOpen={false} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should remove escape key listener when dialog closes', () => {
      const { rerender } = render(<MoreInfoDialog {...defaultProps} />);
      
      rerender(<MoreInfoDialog {...defaultProps} isOpen={false} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Click Outside Interactions', () => {
    it('should call onClose when clicking on backdrop', () => {
      render(<MoreInfoDialog {...defaultProps} />);
      
      const backdrop = screen.getByRole('dialog');
      fireEvent.mouseDown(backdrop);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when clicking on modal content', () => {
      render(<MoreInfoDialog {...defaultProps} />);
      
      const modalContent = screen.getByText('seQura');
      fireEvent.mouseDown(modalContent);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should not call onClose when clicking inside modal content area', () => {
      render(<MoreInfoDialog {...defaultProps} />);
      
      const modalTitle = screen.getByText('Fracciona tu pago');
      fireEvent.mouseDown(modalTitle);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should not add click outside listener when dialog is closed', () => {
      render(<MoreInfoDialog {...defaultProps} isOpen={false} />);
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Event Propagation', () => {
    it('should stop propagation when clicking on modal content', () => {
      render(<MoreInfoDialog {...defaultProps} />);
      
      const modalContent = screen.getByText('seQura').closest('div');
      const stopPropagationSpy = vi.fn();
      
      const clickEvent = new MouseEvent('click', { bubbles: true });
      clickEvent.stopPropagation = stopPropagationSpy;
      
      if (modalContent) {
        fireEvent(modalContent, clickEvent);
      }
      
      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      render(<MoreInfoDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('should have accessible modal title', () => {
      render(<MoreInfoDialog {...defaultProps} />);
      
      const title = screen.getByText('seQura');
      
      expect(title).toHaveAttribute('id', 'modal-title');
    });

    it('should have accessible close button with aria-label', () => {
      render(<MoreInfoDialog {...defaultProps} />);
      
      const closeButton = screen.getByLabelText('Close modal');
      
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveAttribute('aria-label', 'Close modal');
    });
  });

  describe('Component Lifecycle', () => {
    it('should clean up event listeners when component unmounts', () => {
      const { unmount } = render(<MoreInfoDialog {...defaultProps} />);
      
      unmount();
      
      fireEvent.keyDown(document, { key: 'Escape' });
      fireEvent.mouseDown(document.body);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should update event listeners when isOpen prop changes', async () => {
      const { rerender } = render(<MoreInfoDialog {...defaultProps} isOpen={false} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).not.toHaveBeenCalled();
      
      rerender(<MoreInfoDialog {...defaultProps} isOpen={true} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should update event listeners when onClose prop changes', () => {
      const newOnClose = vi.fn();
      const { rerender } = render(<MoreInfoDialog {...defaultProps} />);
      
      rerender(<MoreInfoDialog {...defaultProps} onClose={newOnClose} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(newOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Responsive Behavior', () => {
    it('should render footer close button only on mobile screens', () => {
      render(<MoreInfoDialog {...defaultProps} />);
      
      const footerCloseButton = screen.getByText('Close');
      const footerContainer = footerCloseButton.closest('div');
      
      expect(footerContainer).toHaveClass('block', 'md:hidden');
    });

    it('should handle multiple close button interactions correctly', () => {
      render(<MoreInfoDialog {...defaultProps} />);
      
      const headerCloseButton = screen.getByLabelText('Close modal');
      fireEvent.click(headerCloseButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      
      const footerCloseButton = screen.getByText('Close');
      fireEvent.click(footerCloseButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(2);
    });
  });
});
