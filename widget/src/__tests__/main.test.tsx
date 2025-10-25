import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ReactDOM from 'react-dom/client';
import main from '../main';
import { calculateTotal, setupObservers } from '../helpers';
import type { Envs } from '../types';

vi.mock('react-dom/client', () => ({
  default: {
    createRoot: vi.fn(() => ({
      render: vi.fn(),
      unmount: vi.fn(),
    })),
  },
}));

vi.mock('../helpers', () => ({
  calculateTotal: vi.fn(),
  setupObservers: vi.fn(),
}));

vi.mock('../components/InstallmentsWidget', () => ({
  default: vi.fn(() => null),
}));

describe('main', () => {
  const mockCreateRoot = vi.mocked(ReactDOM.createRoot);
  const mockRender = vi.fn();
  const mockCalculateTotal = vi.mocked(calculateTotal);
  const mockSetupObservers = vi.mocked(setupObservers);

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateRoot.mockReturnValue({ render: mockRender, unmount: vi.fn() });
    mockCalculateTotal.mockReturnValue(100);
    
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('init function', () => {
    it('should initialize widget successfully with valid container', () => {
      const container = document.createElement('div');
      container.id = 'test-container';
      document.body.appendChild(container);

      const props = {
        environment: 'dev' as Envs,
        priceSelector: '.price',
        quantitySelector: '.quantity'
      };

      main.init('#test-container', props);

      expect(mockCreateRoot).toHaveBeenCalledWith(container);
      expect(mockRender).toHaveBeenCalled();
      expect(mockCalculateTotal).toHaveBeenCalledWith('.price', '.quantity');
      expect(mockSetupObservers).toHaveBeenCalledWith('.price', '.quantity', expect.any(Function));
      expect(console.info).toHaveBeenCalledWith('[SeQura Widget] - Initialized', props);
    });

    it('should handle missing container gracefully', () => {
      const props = {
        environment: 'prod' as Envs,
        priceSelector: '.price'
      };

      main.init('#non-existent', props);

      expect(console.error).toHaveBeenCalledWith('[SeQura Widget] - Container not found');
      expect(mockCreateRoot).not.toHaveBeenCalled();
      expect(mockRender).not.toHaveBeenCalled();
    });

    it('should initialize with minimal props', () => {
      const container = document.createElement('div');
      container.id = 'minimal-container';
      document.body.appendChild(container);

      main.init('#minimal-container', {});

      expect(mockCreateRoot).toHaveBeenCalledWith(container);
      expect(mockRender).toHaveBeenCalled();
      expect(mockCalculateTotal).toHaveBeenCalledWith(undefined, undefined);
      expect(mockSetupObservers).toHaveBeenCalledWith(undefined, undefined, expect.any(Function));
    });

    it('should handle React root creation errors', () => {
      const container = document.createElement('div');
      container.id = 'error-container';
      document.body.appendChild(container);

      const error = new Error('Root creation failed');
      mockCreateRoot.mockImplementation(() => {
        throw error;
      });

      main.init('#error-container', {});

      expect(console.error).toHaveBeenCalledWith('[SeQura Widget] - Initialization failed', error);
    });

    it('should handle render errors gracefully', () => {
      const container = document.createElement('div');
      container.id = 'render-error-container';
      document.body.appendChild(container);

      const renderError = new Error('Render failed');
      mockRender.mockImplementation(() => {
        throw renderError;
      });

      main.init('#render-error-container', {});

      expect(console.error).toHaveBeenCalledWith('[SeQura Widget] - Render error', renderError);
    });

    it('should pass correct total to InstallmentsWidget', () => {
      const container = document.createElement('div');
      container.id = 'total-container';
      document.body.appendChild(container);

      mockCalculateTotal.mockReturnValue(250);

      main.init('#total-container', { priceSelector: '.price' });

      expect(mockRender).toHaveBeenCalled();
      const renderCall = mockRender.mock.calls[0][0];
      expect(renderCall.props.children.props.total).toBe(250);
    });

    it('should pass environment prop to InstallmentsWidget', () => {
      const container = document.createElement('div');
      container.id = 'env-container';
      document.body.appendChild(container);

      const props = { environment: 'prod' as Envs };

      main.init('#env-container', props);

      expect(mockRender).toHaveBeenCalled();
      const renderCall = mockRender.mock.calls[0][0];
      expect(renderCall.props.children.props.environment).toBe('prod');
    });

    it('should update widget when total changes', () => {
      const container = document.createElement('div');
      container.id = 'update-container';
      document.body.appendChild(container);

      mockCalculateTotal
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(200);

      main.init('#update-container', { priceSelector: '.price' });

      expect(mockRender).toHaveBeenCalledTimes(1);

      const updateCallback = mockSetupObservers.mock.calls[0][2];
      updateCallback();

      expect(mockRender).toHaveBeenCalledTimes(2);
      const secondRenderCall = mockRender.mock.calls[1][0];
      expect(secondRenderCall.props.children.props.total).toBe(200);
    });

    it('should not re-render when total remains the same', () => {
      const container = document.createElement('div');
      container.id = 'no-update-container';
      document.body.appendChild(container);

      mockCalculateTotal
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(100);

      main.init('#no-update-container', { priceSelector: '.price' });

      expect(mockRender).toHaveBeenCalledTimes(1);

      const updateCallback = mockSetupObservers.mock.calls[0][2];
      updateCallback();

      expect(mockRender).toHaveBeenCalledTimes(1);
    });

    it('should work with class selectors', () => {
      const container = document.createElement('div');
      container.className = 'widget-container';
      document.body.appendChild(container);

      main.init('.widget-container', { priceSelector: '.price' });

      expect(mockCreateRoot).toHaveBeenCalledWith(container);
      expect(mockRender).toHaveBeenCalled();
    });

    it('should work with attribute selectors', () => {
      const container = document.createElement('div');
      container.setAttribute('data-widget', 'sequra');
      document.body.appendChild(container);

      main.init('[data-widget="sequra"]', { quantitySelector: '.qty' });

      expect(mockCreateRoot).toHaveBeenCalledWith(container);
      expect(mockCalculateTotal).toHaveBeenCalledWith(undefined, '.qty');
    });

    it('should handle setupObservers with only priceSelector', () => {
      const container = document.createElement('div');
      container.id = 'price-only-container';
      document.body.appendChild(container);

      main.init('#price-only-container', { priceSelector: '.price' });

      expect(mockSetupObservers).toHaveBeenCalledWith('.price', undefined, expect.any(Function));
    });

    it('should handle setupObservers with only quantitySelector', () => {
      const container = document.createElement('div');
      container.id = 'quantity-only-container';
      document.body.appendChild(container);

      main.init('#quantity-only-container', { quantitySelector: '.quantity' });

      expect(mockSetupObservers).toHaveBeenCalledWith(undefined, '.quantity', expect.any(Function));
    });

    it('should handle multiple consecutive updates correctly', () => {
      const container = document.createElement('div');
      container.id = 'multiple-updates-container';
      document.body.appendChild(container);

      mockCalculateTotal
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(200)
        .mockReturnValueOnce(300)
        .mockReturnValueOnce(400);

      main.init('#multiple-updates-container', { priceSelector: '.price' });

      const updateCallback = mockSetupObservers.mock.calls[0][2];
      
      updateCallback();
      updateCallback();
      updateCallback();

      expect(mockRender).toHaveBeenCalledTimes(4);
      
      const lastRenderCall = mockRender.mock.calls[3][0];
      expect(lastRenderCall.props.children.props.total).toBe(400);
    });

    it('should render widget in React.StrictMode', () => {
      const container = document.createElement('div');
      container.id = 'strict-mode-container';
      document.body.appendChild(container);

      main.init('#strict-mode-container', {});

      expect(mockRender).toHaveBeenCalled();
      const renderCall = mockRender.mock.calls[0][0];
      expect(renderCall.type).toBeDefined();
      expect(renderCall.props.children).toBeDefined();
    });
  });
});
