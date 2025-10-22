import "./types";

/**
 * Parses price from text content, handling various formats
 */
export function parsePrice(text: string): number | null {
  if (!text || typeof text !== 'string') return null;
  
  const cleaned = text.replace(/[^\d,.-]/g, "");
  
  if (!cleaned) return null;
  
  // Handle different number formats
  if (/^\d{1,3}(\.\d{3})*,\d+$/.test(cleaned)) {
    // European format
    const normalized = cleaned.replace(/\./g, "").replace(",", ".");
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? null : parsed;
  }
  
  // US format
  if (/^\d{1,3}(,\d{3})*\.?\d*$/.test(cleaned) || /^\d+\.?\d*$/.test(cleaned)) {
    const normalized = cleaned.replace(/,/g, "");
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? null : parsed;
  }
  
  // Other formats
  const fallback = cleaned.replace(/,/g, ".");
  const parsed = parseFloat(fallback);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Extracts price from a DOM element
 */
export function extractPriceFromElement(selector: string): number | null {
  const element = document.querySelector(selector);
  if (!element) return null;
  
  const text = element.textContent || "";
  return parsePrice(text);
}

/**
 * Determines if an element is a form input element
 */
export function isFormElement(element: Element): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  return element instanceof HTMLInputElement || 
         element instanceof HTMLSelectElement || 
         element instanceof HTMLTextAreaElement;
}

/**
 * Extracts quantity value from any element (form input or regular element)
 */
export function extractQuantityFromElement(selector: string): number | null {
  const element = document.querySelector(selector);
  if (!element) return null;
  
  let quantityText = "";
  
  if (isFormElement(element)) {
    quantityText = element.value;
  } else {
    // If we're not using a input element, get the text content then
    quantityText = element.getAttribute('data-value') || 
                   element.textContent || "";
  }
  
  const val = parseInt(quantityText || "1", 10);
  return (!isNaN(val) && val > 0) ? val : null;
}

/**
 * Calculates total price based on base price, price selector, and quantity selector
 */
export function calculateTotal(
  priceSelector?: string,
  quantitySelector?: string
): number {
  let price = 0;
  let quantity = 1;

  // Extract price if selector provided
  if (priceSelector) {
    const extractedPrice = extractPriceFromElement(priceSelector);
    if (extractedPrice !== null) {
      price = extractedPrice;
    }
  }

  // Extract quantity if selector provided
  if (quantitySelector) {
    const extractedQuantity = extractQuantityFromElement(quantitySelector);
    if (extractedQuantity !== null) {
      quantity = extractedQuantity;
    }
  }

  return price * quantity;
}

/**
 * Sets up price observation using MutationObserver
 */
export function setupPriceObserver(selector: string, callback: () => void): void {
  const element = document.querySelector(selector);
  if (!element) {
    console.warn("SequraWidget: priceSelector not found →", selector);
    return;
  }

  const observer = new MutationObserver(callback);
  observer.observe(element, {
    childList: true,
    characterData: true,
    subtree: true,
  });
}

/**
 * Sets up quantity observation with multiple strategies regarding the element type
 */
export function setupQuantityObserver(selector: string, callback: () => void): void {
  const element = document.querySelector(selector);
  if (!element) {
    console.warn("SequraWidget: quantitySelector not found →", selector);
    return;
  }

  if (isFormElement(element)) {
    // Native events
    element.addEventListener('input', callback);
    element.addEventListener('change', callback);
    element.addEventListener('keyup', callback);
    
    // Polling for programmatic changes
    let lastValue = element.value;
    const pollForChanges = () => {
      const currentValue = element.value;
      if (currentValue !== lastValue) {
        lastValue = currentValue;
        callback();
      }
    };
    
    setInterval(pollForChanges, 100);
    
    // jQuery events if available
    if (window.jQuery) {
      window.jQuery(element).on('change input', callback);
    }
    
  } else {
    // Non-form elements:
    const observer = new MutationObserver(callback);
    observer.observe(element, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['value', 'data-value']
    });
  }
}

/**
 * Sets up all observers for price and quantity changes
 */
export function setupObservers(
  priceSelector: string | undefined,
  quantitySelector: string | undefined,
  callback: () => void
): void {
  if (priceSelector) {
    setupPriceObserver(priceSelector, callback);
  }
  
  if (quantitySelector) {
    setupQuantityObserver(quantitySelector, callback);
  }
}
