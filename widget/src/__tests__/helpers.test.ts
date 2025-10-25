/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  parsePrice,
  extractPriceFromElement,
  isFormElement,
  extractQuantityFromElement,
  calculateTotal,
  setupPriceObserver,
  setupQuantityObserver,
  setupObservers
} from '../helpers';

Object.defineProperty(window, 'MutationObserver', {
  writable: true,
  value: vi.fn(),
});

describe('parsePrice', () => {
  it('should parse simple numeric strings', () => {
    expect(parsePrice('123')).toBe(123);
    expect(parsePrice('123.45')).toBe(123.45);
    expect(parsePrice('0')).toBe(0);
  });

  it('should handle currency symbols and formatting', () => {
    expect(parsePrice('$123.45')).toBe(123.45);
    expect(parsePrice('€99,99')).toBe(99.99);
    expect(parsePrice('£1,234.56')).toBe(1234.56);
    expect(parsePrice('¥1000')).toBe(1000);
  });

  it('should handle various separators', () => {
    expect(parsePrice('1,234.56')).toBe(1234.56);
    expect(parsePrice('1.234,56')).toBe(1234.56);
    expect(parsePrice('1 234.56')).toBe(1234.56);
  });

  it('should handle complex formatting with text', () => {
    expect(parsePrice('Price: $123.45 USD')).toBe(123.45);
    expect(parsePrice('Total: €99,99 (incl. tax)')).toBe(99.99);
    expect(parsePrice('From $50.00')).toBe(50.00);
  });

  it('should return null for invalid inputs', () => {
    expect(parsePrice('')).toBeNull();
    expect(parsePrice('abc')).toBeNull();
    expect(parsePrice('No price here')).toBeNull();
    expect(parsePrice('$')).toBeNull();
  });

  it('should handle edge cases', () => {
    expect(parsePrice('0.00')).toBe(0);
    expect(parsePrice('-123.45')).toBe(-123.45);
    expect(parsePrice('+123.45')).toBe(123.45);
  });
});

describe('extractPriceFromElement', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should extract price from element with valid selector', () => {
    document.body.innerHTML = '<div class="price">$123.45</div>';
    expect(extractPriceFromElement('.price')).toBe(123.45);
  });

  it('should return null for non-existent selector', () => {
    expect(extractPriceFromElement('.non-existent')).toBeNull();
  });

  it('should handle elements with complex content', () => {
    document.body.innerHTML = '<span id="total">Total: €99,99 (incl. VAT)</span>';
    expect(extractPriceFromElement('#total')).toBe(99.99);
  });

  it('should handle empty elements', () => {
    document.body.innerHTML = '<div class="empty"></div>';
    expect(extractPriceFromElement('.empty')).toBeNull();
  });

  it('should handle nested elements', () => {
    document.body.innerHTML = '<div class="container"><span>Price: </span><strong>$50.00</strong></div>';
    expect(extractPriceFromElement('.container')).toBe(50.00);
  });
});

describe('isFormElement', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should identify HTMLInputElement', () => {
    const input = document.createElement('input');
    expect(isFormElement(input)).toBe(true);
  });

  it('should identify HTMLSelectElement', () => {
    const select = document.createElement('select');
    expect(isFormElement(select)).toBe(true);
  });

  it('should identify HTMLTextAreaElement', () => {
    const textarea = document.createElement('textarea');
    expect(isFormElement(textarea)).toBe(true);
  });

  it('should not identify other elements as form elements', () => {
    const div = document.createElement('div');
    const span = document.createElement('span');
    const button = document.createElement('button');
    
    expect(isFormElement(div)).toBe(false);
    expect(isFormElement(span)).toBe(false);
    expect(isFormElement(button)).toBe(false);
  });
});

describe('extractQuantityFromElement', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should extract quantity from input element', () => {
    document.body.innerHTML = '<input type="number" class="qty" value="5">';
    expect(extractQuantityFromElement('.qty')).toBe(5);
  });

  it('should extract quantity from select element', () => {
    document.body.innerHTML = '<select class="qty"><option value="3" selected>3</option></select>';
    expect(extractQuantityFromElement('.qty')).toBe(3);
  });

  it('should extract quantity from textarea element', () => {
    document.body.innerHTML = '<textarea class="qty">7</textarea>';
    expect(extractQuantityFromElement('.qty')).toBe(7);
  });

  it('should extract quantity from data-value attribute', () => {
    document.body.innerHTML = '<div class="qty" data-value="4">Quantity: 4</div>';
    expect(extractQuantityFromElement('.qty')).toBe(4);
  });

  it('should extract quantity from text content', () => {
    document.body.innerHTML = '<span class="qty">2</span>';
    expect(extractQuantityFromElement('.qty')).toBe(2);
  });

  it('should return null for non-existent selector', () => {
    expect(extractQuantityFromElement('.non-existent')).toBeNull();
  });

  it('should return null for invalid quantities', () => {
    document.body.innerHTML = '<div class="qty">abc</div>';
    expect(extractQuantityFromElement('.qty')).toBeNull();
  });

  it('should return null for zero or negative quantities', () => {
    document.body.innerHTML = '<input class="qty" value="0">';
    expect(extractQuantityFromElement('.qty')).toBeNull();
    
    document.body.innerHTML = '<input class="qty" value="-1">';
    expect(extractQuantityFromElement('.qty')).toBeNull();
  });

  it('should handle empty values gracefully', () => {
    document.body.innerHTML = '<input class="qty" value="">';
    expect(extractQuantityFromElement('.qty')).toBe(1);
    
    document.body.innerHTML = '<div class="qty"></div>';
    expect(extractQuantityFromElement('.qty')).toBe(1);
  });

  it('should prioritize data-value over text content for non-form elements', () => {
    document.body.innerHTML = '<div class="qty" data-value="5">Text content: 10</div>';
    expect(extractQuantityFromElement('.qty')).toBe(5);
  });
});

describe('calculateTotal', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should return 0 when no selectors provided', () => {
    expect(calculateTotal()).toBe(0);
  });

  it('should calculate total with price only', () => {
    document.body.innerHTML = '<div class="price">$100.00</div>';
    expect(calculateTotal('.price')).toBe(100);
  });

  it('should calculate total with quantity only (price defaults to 0)', () => {
    document.body.innerHTML = '<input class="qty" value="3">';
    expect(calculateTotal(undefined, '.qty')).toBe(0);
  });

  it('should calculate total with both price and quantity', () => {
    document.body.innerHTML = `
      <div class="price">$25.50</div>
      <input class="qty" value="4">
    `;
    expect(calculateTotal('.price', '.qty')).toBe(102);
  });

  it('should handle missing price element (defaults to 0)', () => {
    document.body.innerHTML = '<input class="qty" value="2">';
    expect(calculateTotal('.non-existent-price', '.qty')).toBe(0);
  });

  it('should handle missing quantity element (defaults to 1)', () => {
    document.body.innerHTML = '<div class="price">$50.00</div>';
    expect(calculateTotal('.price', '.non-existent-qty')).toBe(50);
  });

  it('should handle invalid price (defaults to 0)', () => {
    document.body.innerHTML = `
      <div class="price">Invalid price</div>
      <input class="qty" value="3">
    `;
    expect(calculateTotal('.price', '.qty')).toBe(0);
  });

  it('should handle invalid quantity (defaults to 1)', () => {
    document.body.innerHTML = `
      <div class="price">$30.00</div>
      <div class="qty">Invalid quantity</div>
    `;
    expect(calculateTotal('.price', '.qty')).toBe(30);
  });

  it('should handle complex real-world scenario', () => {
    document.body.innerHTML = `
      <div class="product-price">Price: €199,99 (incl. VAT)</div>
      <select class="quantity-selector">
        <option value="1">1 item</option>
        <option value="2" selected>2 items</option>
        <option value="3">3 items</option>
      </select>
    `;
    expect(calculateTotal('.product-price', '.quantity-selector')).toBe(399.98);
  });
});

describe('setupPriceObserver', () => {
  let mockObserver: any;
  let mockCallback: any;

  beforeEach(() => {
    document.body.innerHTML = '';
    mockCallback = vi.fn();
    mockObserver = {
      observe: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(),
    };
    vi.mocked(window.MutationObserver).mockImplementation(function(this: any) {
      return Object.assign(this, mockObserver);
    });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should set up observer for existing element', () => {
    document.body.innerHTML = '<div class="price">$100.00</div>';
    
    setupPriceObserver('.price', mockCallback);
    
    expect(window.MutationObserver).toHaveBeenCalledWith(mockCallback);
    expect(mockObserver.observe).toHaveBeenCalledWith(
      document.querySelector('.price'),
      {
        childList: true,
        characterData: true,
        subtree: true,
      }
    );
  });

  it('should warn and return early for non-existent element', () => {
    vi.mocked(window.MutationObserver).mockClear();
    setupPriceObserver('.non-existent', mockCallback);
    
    expect(console.warn).toHaveBeenCalledWith('SequraWidget: priceSelector not found →', '.non-existent');
    expect(window.MutationObserver).not.toHaveBeenCalled();
  });
});

describe('setupQuantityObserver', () => {
  let mockObserver: any;
  let mockCallback: any;
  let mockSetInterval: any;

  beforeEach(() => {
    document.body.innerHTML = '';
    mockCallback = vi.fn();
    mockObserver = {
      observe: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(),
    };
    vi.mocked(window.MutationObserver).mockImplementation(function(this: any) {
      return Object.assign(this, mockObserver);
    });
    mockSetInterval = vi.spyOn(window, 'setInterval').mockImplementation(() => 123 as any);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should set up event listeners for form elements', () => {
    const input = document.createElement('input');
    input.className = 'qty';
    input.value = '1';
    document.body.appendChild(input);
    
    const addEventListenerSpy = vi.spyOn(input, 'addEventListener');
    
    setupQuantityObserver('.qty', mockCallback);
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('input', mockCallback);
    expect(addEventListenerSpy).toHaveBeenCalledWith('change', mockCallback);
    expect(addEventListenerSpy).toHaveBeenCalledWith('keyup', mockCallback);
    expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 100);
  });

  it('should set up MutationObserver for non-form elements', () => {
    document.body.innerHTML = '<div class="qty">2</div>';
    
    setupQuantityObserver('.qty', mockCallback);
    
    expect(window.MutationObserver).toHaveBeenCalledWith(mockCallback);
    expect(mockObserver.observe).toHaveBeenCalledWith(
      document.querySelector('.qty'),
      {
        childList: true,
        characterData: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['value', 'data-value']
      }
    );
  });

  it('should handle jQuery integration when available', () => {
    const input = document.createElement('input');
    input.className = 'qty';
    document.body.appendChild(input);
    
    const mockJQuery = vi.fn().mockReturnValue({
      on: vi.fn()
    });
    (window as any).jQuery = mockJQuery;
    
    setupQuantityObserver('.qty', mockCallback);
    
    expect(mockJQuery).toHaveBeenCalledWith(input);
    expect(mockJQuery().on).toHaveBeenCalledWith('change input', mockCallback);
    
    delete (window as any).jQuery;
  });

  it('should warn and return early for non-existent element', () => {
    vi.mocked(window.MutationObserver).mockClear();
    setupQuantityObserver('.non-existent', mockCallback);
    
    expect(console.warn).toHaveBeenCalledWith('SequraWidget: quantitySelector not found →', '.non-existent');
    expect(window.MutationObserver).not.toHaveBeenCalled();
  });

  it('should handle polling for programmatic changes in form elements', () => {
    const input = document.createElement('input');
    input.className = 'qty';
    input.value = '1';
    document.body.appendChild(input);
    
    setupQuantityObserver('.qty', mockCallback);
    
    const pollingFunction = mockSetInterval.mock.calls[0][0];
    
    input.value = '2';
    pollingFunction();
    
    expect(mockCallback).toHaveBeenCalled();
  });
});

describe('setupObservers', () => {
  let mockCallback: any;
  let mockObserver: any;

  beforeEach(() => {
    document.body.innerHTML = '';
    mockCallback = vi.fn();
    mockObserver = {
      observe: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(),
    };

    vi.mocked(window.MutationObserver).mockImplementation(function(this: any) {
      return Object.assign(this, mockObserver);
    });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should set up both price and quantity observers when selectors provided', () => {
    document.body.innerHTML = `
      <div class="price">$100.00</div>
      <input class="qty" value="1">
    `;
    
    setupObservers('.price', '.qty', mockCallback);
    
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should set up only price observer when quantity selector is undefined', () => {
    document.body.innerHTML = '<div class="price">$100.00</div>';
    
    setupObservers('.price', undefined, mockCallback);
    
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should set up only quantity observer when price selector is undefined', () => {
    document.body.innerHTML = '<input class="qty" value="1">';
    
    setupObservers(undefined, '.qty', mockCallback);
    
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should handle both selectors being undefined', () => {
    setupObservers(undefined, undefined, mockCallback);
    
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should warn for non-existent selectors', () => {
    setupObservers('.non-existent-price', '.non-existent-qty', mockCallback);
    
    expect(console.warn).toHaveBeenCalledWith('SequraWidget: priceSelector not found →', '.non-existent-price');
    expect(console.warn).toHaveBeenCalledWith('SequraWidget: quantitySelector not found →', '.non-existent-qty');
  });
});
