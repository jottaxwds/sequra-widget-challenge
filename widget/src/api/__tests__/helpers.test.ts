import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  getSortedInstallmentOptions, 
  trackWidgetView, 
  trackInstallmentSelection, 
  trackError 
} from '../helpers';
import { getCreditAgreement, sendEvent } from '../api';
import { mockCreditAgreement, mockCreditAgreementNoFees } from '../../__mocks__/creditAgreement';
import { events } from '../../constants';
import type { CreditAgreement } from '../../types';

// Mock the API functions
vi.mock('../api', () => ({
  getCreditAgreement: vi.fn(),
  sendEvent: vi.fn(),
}));

// Mock console methods
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock navigator.userAgent
Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Test Browser)',
  configurable: true,
});

// Mock window.location.href
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://example.com/test-page',
  },
  configurable: true,
});

describe('API Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleError.mockClear();
    // Mock Date.now() for consistent timestamps in tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('getSortedInstallmentOptions', () => {
    const mockGetCreditAgreement = vi.mocked(getCreditAgreement);

    it('should return sorted installment options successfully', async () => {
      const mockAgreements: CreditAgreement[] = [
        { ...mockCreditAgreement, instalment_count: 6 },
        { ...mockCreditAgreement, instalment_count: 3 },
        { ...mockCreditAgreement, instalment_count: 12 },
      ];
      
      mockGetCreditAgreement.mockResolvedValueOnce(mockAgreements);

      const result = await getSortedInstallmentOptions(300);

      expect(mockGetCreditAgreement).toHaveBeenCalledWith(300);
      expect(result).toHaveLength(3);
      expect(result[0].instalment_count).toBe(3);
      expect(result[1].instalment_count).toBe(6);
      expect(result[2].instalment_count).toBe(12);
    });

    it('should return empty array when no agreements are returned', async () => {
      mockGetCreditAgreement.mockResolvedValueOnce([]);

      const result = await getSortedInstallmentOptions(300);

      expect(result).toEqual([]);
    });

    it('should return empty array when null is returned', async () => {
      mockGetCreditAgreement.mockResolvedValueOnce(null as unknown as CreditAgreement[]);

      const result = await getSortedInstallmentOptions(300);

      expect(result).toEqual([]);
    });

    it('should return empty array when undefined is returned', async () => {
      mockGetCreditAgreement.mockResolvedValueOnce(undefined as unknown as CreditAgreement[]);

      const result = await getSortedInstallmentOptions(300);

      expect(result).toEqual([]);
    });

    it('should handle single installment option', async () => {
      const mockAgreements: CreditAgreement[] = [mockCreditAgreement];
      
      mockGetCreditAgreement.mockResolvedValueOnce(mockAgreements);

      const result = await getSortedInstallmentOptions(300);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockCreditAgreement);
    });

    it('should maintain sorting with duplicate installment counts', async () => {
      const mockAgreements: CreditAgreement[] = [
        { ...mockCreditAgreement, instalment_count: 6 },
        { ...mockCreditAgreementNoFees, instalment_count: 3 },
        { ...mockCreditAgreement, instalment_count: 3 },
      ];
      
      mockGetCreditAgreement.mockResolvedValueOnce(mockAgreements);

      const result = await getSortedInstallmentOptions(300);

      expect(result).toHaveLength(3);
      expect(result[0].instalment_count).toBe(3);
      expect(result[1].instalment_count).toBe(3);
      expect(result[2].instalment_count).toBe(6);
    });
  });

  describe('trackWidgetView', () => {
    const mockSendEvent = vi.mocked(sendEvent);

    it('should send widget view event with correct payload', async () => {
      mockSendEvent.mockResolvedValueOnce(undefined);

      await trackWidgetView('dropdown_opened', 300);

      expect(mockSendEvent).toHaveBeenCalledWith({
        event: 'widget_viewed',
        context: {
          action: 'dropdown_opened',
          totalPrice: 300,
          userAgent: 'Mozilla/5.0 (Test Browser)',
          timestamp: '2023-01-01T00:00:00.000Z',
        },
      });
    });

    it('should handle different action types', async () => {
      mockSendEvent.mockResolvedValueOnce(undefined);

      await trackWidgetView('widget_init', 150);

      expect(mockSendEvent).toHaveBeenCalledWith({
        event: 'widget_viewed',
        context: {
          action: 'widget_init',
          totalPrice: 150,
          userAgent: 'Mozilla/5.0 (Test Browser)',
          timestamp: '2023-01-01T00:00:00.000Z',
        },
      });
    });

    it('should handle zero total price', async () => {
      mockSendEvent.mockResolvedValueOnce(undefined);

      await trackWidgetView('test_action', 0);

      expect(mockSendEvent).toHaveBeenCalledWith({
        event: 'widget_viewed',
        context: {
          action: 'test_action',
          totalPrice: 0,
          userAgent: 'Mozilla/5.0 (Test Browser)',
          timestamp: '2023-01-01T00:00:00.000Z',
        },
      });
    });
  });

  describe('trackInstallmentSelection', () => {
    const mockSendEvent = vi.mocked(sendEvent);

    it('should send installment selection event with correct payload', async () => {
      mockSendEvent.mockResolvedValueOnce(undefined);

      await trackInstallmentSelection(6, 300);

      expect(mockSendEvent).toHaveBeenCalledWith({
        event: 'user_action',
        context: {
          action: events.instalment_selected,
          selectedInstallments: 6,
          totalPrice: 300,
          selectionTime: '2023-01-01T00:00:00.000Z',
        },
      });
    });

    it('should handle different installment counts', async () => {
      mockSendEvent.mockResolvedValueOnce(undefined);

      await trackInstallmentSelection(12, 500);

      expect(mockSendEvent).toHaveBeenCalledWith({
        event: 'user_action',
        context: {
          action: events.instalment_selected,
          selectedInstallments: 12,
          totalPrice: 500,
          selectionTime: '2023-01-01T00:00:00.000Z',
        },
      });
    });

    it('should handle zero values', async () => {
      mockSendEvent.mockResolvedValueOnce(undefined);

      await trackInstallmentSelection(0, 0);

      expect(mockSendEvent).toHaveBeenCalledWith({
        event: 'user_action',
        context: {
          action: events.instalment_selected,
          selectedInstallments: 0,
          totalPrice: 0,
          selectionTime: '2023-01-01T00:00:00.000Z',
        },
      });
    });
  });

  describe('trackError', () => {
    const mockSendEvent = vi.mocked(sendEvent);

    it('should send error event with basic payload', async () => {
      mockSendEvent.mockResolvedValueOnce(undefined);

      await trackError('validation_error', 'Invalid input provided');

      expect(mockSendEvent).toHaveBeenCalledWith({
        event: 'error',
        context: {
          errorType: 'validation_error',
          errorMessage: 'Invalid input provided',
          url: 'https://example.com/test-page',
          userAgent: 'Mozilla/5.0 (Test Browser)',
        },
      });
    });

    it('should send error event with additional context', async () => {
      mockSendEvent.mockResolvedValueOnce(undefined);

      const additionalContext = {
        userId: 'user123',
        totalPrice: 300,
        step: 'checkout',
      };

      await trackError('api_error', 'Failed to fetch data', additionalContext);

      expect(mockSendEvent).toHaveBeenCalledWith({
        event: 'error',
        context: {
          errorType: 'api_error',
          errorMessage: 'Failed to fetch data',
          url: 'https://example.com/test-page',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          userId: 'user123',
          totalPrice: 300,
          step: 'checkout',
        },
      });
    });

    it('should handle context with undefined values', async () => {
      mockSendEvent.mockResolvedValueOnce(undefined);

      const contextWithUndefined = {
        userId: 'user123',
        optionalField: undefined,
        totalPrice: 300,
      };

      await trackError('test_error', 'Test message', contextWithUndefined);

      expect(mockSendEvent).toHaveBeenCalledWith({
        event: 'error',
        context: {
          errorType: 'test_error',
          errorMessage: 'Test message',
          url: 'https://example.com/test-page',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          userId: 'user123',
          optionalField: undefined,
          totalPrice: 300,
        },
      });
    });

    it('should handle empty error type and message', async () => {
      mockSendEvent.mockResolvedValueOnce(undefined);

      await trackError('', '');

      expect(mockSendEvent).toHaveBeenCalledWith({
        event: 'error',
        context: {
          errorType: '',
          errorMessage: '',
          url: 'https://example.com/test-page',
          userAgent: 'Mozilla/5.0 (Test Browser)',
        },
      });
    });

    it('should handle no additional context', async () => {
      mockSendEvent.mockResolvedValueOnce(undefined);

      await trackError('network_error', 'Connection timeout');

      expect(mockSendEvent).toHaveBeenCalledWith({
        event: 'error',
        context: {
          errorType: 'network_error',
          errorMessage: 'Connection timeout',
          url: 'https://example.com/test-page',
          userAgent: 'Mozilla/5.0 (Test Browser)',
        },
      });
    });
  });
});
