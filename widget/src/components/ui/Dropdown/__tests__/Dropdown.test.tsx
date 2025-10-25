import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dropdown from '..';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Dropdown', () => {
  const items = [
    { label: 'First', value: 'first' },
    { label: 'Second', value: 'second' },
    { label: 'Third', value: 'third' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders the dropdown button with default placeholder', () => {
      render(<Dropdown options={items} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Select...')).toBeInTheDocument();
    });

    it('renders the dropdown button with custom placeholder', () => {
      render(<Dropdown options={items} placeholder="Choose option" />);
      expect(screen.getByText('Choose option')).toBeInTheDocument();
    });

    it('renders without label when not provided', () => {
      render(<Dropdown options={items} />);
      expect(screen.queryByText('Select an option')).not.toBeInTheDocument();
    });
  });

  describe('Dropdown Interaction', () => {
    it('shows the dropdown items when button is clicked', () => {
      render(<Dropdown options={items} />);
      fireEvent.click(screen.getByRole('button'));
      
      items.forEach(item => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      });
    });

    it('hides the dropdown items initially', () => {
      render(<Dropdown options={items} />);
      
      items.forEach(item => {
        expect(screen.queryByText(item.label)).not.toBeInTheDocument();
      });
    });

    it('toggles dropdown visibility when button is clicked multiple times', () => {
      render(<Dropdown options={items} />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      expect(screen.getByText('First')).toBeInTheDocument();
      
      fireEvent.click(button);
      expect(screen.queryByText('First')).not.toBeInTheDocument();
    });
  });

  describe('Selection Behavior', () => {
    it('calls onChange with correct value when item is selected', () => {
      const onChange = vi.fn();
      render(<Dropdown options={items} onChange={onChange} />);
      
      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Second'));
      
      expect(onChange).toHaveBeenCalledWith('second');
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('closes the dropdown after selecting an item', () => {
      render(<Dropdown options={items} />);
      
      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('First'));
      
      items.forEach(item => {
        expect(screen.queryByText(item.label)).not.toBeInTheDocument();
      });
    });

    it('displays selected value in button', () => {
      render(<Dropdown options={items} value="second" />);
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.queryByText('Select...')).not.toBeInTheDocument();
    });

    it('highlights selected option in dropdown', () => {
      render(<Dropdown options={items} value="second" />);
      
      fireEvent.click(screen.getByRole('button'));
      
      const selectedOption = screen.getByRole('option', { name: 'Second' });
      expect(selectedOption).toHaveAttribute('aria-selected', 'true');
      expect(selectedOption.classList).toContain('bg-blue-50');
    });

    it('works without onChange handler', () => {
      render(<Dropdown options={items} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(() => {
        fireEvent.click(screen.getByText('First'));
      }).not.toThrow();
    });
  });

  describe('Keyboard Navigation', () => {
    it('closes dropdown when Escape key is pressed', async () => {
      render(<Dropdown options={items} />);
      
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('First')).toBeInTheDocument();
      
      fireEvent.keyDown(window, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByText('First')).not.toBeInTheDocument();
      });
    });

    it('focuses button after closing with Escape', async () => {
      render(<Dropdown options={items} />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      fireEvent.keyDown(window, { key: 'Escape' });
      
      await waitFor(() => {
        expect(button).toHaveFocus();
      });
    });

    it('selects option when Enter key is pressed', () => {
      const onChange = vi.fn();
      render(<Dropdown options={items} onChange={onChange} />);
      
      fireEvent.click(screen.getByRole('button'));
      const option = screen.getByRole('option', { name: 'Second' });
      fireEvent.keyDown(option, { key: 'Enter' });
      
      expect(onChange).toHaveBeenCalledWith('second');
    });

    it('selects option when Space key is pressed', () => {
      const onChange = vi.fn();
      render(<Dropdown options={items} onChange={onChange} />);
      
      fireEvent.click(screen.getByRole('button'));
      const option = screen.getByRole('option', { name: 'Third' });
      fireEvent.keyDown(option, { key: ' ' });
      
      expect(onChange).toHaveBeenCalledWith('third');
    });

    it('focuses button after selecting option with keyboard', async () => {
      render(<Dropdown options={items} />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      const option = screen.getByRole('option', { name: 'First' });
      fireEvent.keyDown(option, { key: 'Enter' });
      
      await waitFor(() => {
        expect(button).toHaveFocus();
      });
    });
  });

  describe('Click Outside Behavior', () => {
    it('closes the dropdown when clicking outside', async () => {
      render(<Dropdown options={items} />);
      
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('First')).toBeInTheDocument();
      
      fireEvent.mouseDown(document.body);
      
      await waitFor(() => {
        expect(screen.queryByText('First')).not.toBeInTheDocument();
      });
    });

    it('does not close when clicking inside the dropdown', () => {
      render(<Dropdown options={items} />);
      
      fireEvent.click(screen.getByRole('button'));
      const dropdown = screen.getByRole('listbox');
      fireEvent.mouseDown(dropdown);
      
      expect(screen.getByText('First')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes on button', () => {
      render(<Dropdown options={items} />);
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('updates aria-expanded when dropdown is opened', () => {
      render(<Dropdown options={items} />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('has correct role attributes on dropdown and options', () => {
      render(<Dropdown options={items} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      items.forEach(item => {
        expect(screen.getByRole('option', { name: item.label })).toBeInTheDocument();
      });
    });

    it('sets aria-selected correctly on options', () => {
      render(<Dropdown options={items} value="first" />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByRole('option', { name: 'First' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('option', { name: 'Second' })).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByRole('option', { name: 'Third' })).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className to container', () => {
      render(<Dropdown options={items} className="custom-dropdown" />);
      const container = screen.getByRole('button').parentElement;
      expect(container).toHaveClass('custom-dropdown');
    });

    it('applies custom optionClassName to options', () => {
      render(<Dropdown options={items} optionClassName="custom-option" />);
      
      fireEvent.click(screen.getByRole('button'));
      
      items.forEach(item => {
        expect(screen.getByRole('option', { name: item.label })).toHaveClass('custom-option');
      });
    });

    it('applies custom menuClassName to dropdown menu', () => {
      render(<Dropdown options={items} menuClassName="custom-menu" />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByRole('listbox')).toHaveClass('custom-menu');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty options array', () => {
      render(<Dropdown options={[]} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.queryByRole('option')).not.toBeInTheDocument();
    });

    it('handles options with duplicate values', () => {
      const duplicateItems = [
        { label: 'First', value: 'same' },
        { label: 'Second', value: 'same' },
      ];
      
      render(<Dropdown options={duplicateItems} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getAllByRole('option')).toHaveLength(2);
    });

    it('handles very long option labels', () => {
      const longLabelItems = [
        { label: 'This is a very long option label that might overflow', value: 'long' },
      ];
      
      render(<Dropdown options={longLabelItems} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByText('This is a very long option label that might overflow')).toBeInTheDocument();
    });

    it('handles special characters in option labels', () => {
      const specialItems = [
        { label: 'Option with "quotes"', value: 'quotes' },
        { label: 'Option with <tags>', value: 'tags' },
        { label: 'Option with & ampersand', value: 'ampersand' },
      ];
      
      render(<Dropdown options={specialItems} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      specialItems.forEach(item => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      });
    });
  });

  describe('Visual States', () => {
    it('shows placeholder text in gray when no value selected', () => {
      render(<Dropdown options={items} placeholder="Choose..." />);
      const placeholderText = screen.getByText('Choose...');
      expect(placeholderText).toHaveClass('text-gray-400');
    });

    it('shows selected value in normal color', () => {
      render(<Dropdown options={items} value="first" />);
      const selectedText = screen.getByText('First');
      expect(selectedText).not.toHaveClass('text-gray-400');
    });

    it('rotates chevron icon when dropdown is open', () => {
      render(<Dropdown options={items} />);
      const button = screen.getByRole('button');
      const chevron = button.querySelector('svg');
      
      expect(chevron).not.toHaveClass('rotate-180');
      
      fireEvent.click(button);
      expect(chevron).toHaveClass('rotate-180');
    });
  });
});

