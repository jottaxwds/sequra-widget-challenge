import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCreditAgreement, sendEvent } from '../api';
import { mockCreditAgreement } from '../../__mocks__/creditAgreement';
import type { EventPayload } from '../../types';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCreditAgreement', () => {
    it('should fetch credit agreements successfully', async () => {
      const mockResponse = [mockCreditAgreement];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getCreditAgreement(300);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/credit_agreements?totalWithTax=300'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error for invalid total price (zero)', async () => {
      await expect(getCreditAgreement(0)).rejects.toThrow(
        'Total price must be a positive number'
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should throw error for invalid total price (negative)', async () => {
      await expect(getCreditAgreement(-100)).rejects.toThrow(
        'Total price must be a positive number'
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle API error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'Invalid total price' }),
      });

      await expect(getCreditAgreement(300)).rejects.toThrow('Invalid total price');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getCreditAgreement(300)).rejects.toThrow('Network error');
    });
  });

  describe('sendEvent', () => {
    const validPayload: EventPayload = {
      event: 'widget_opened',
      timestamp: Date.now(),
      context: { price: 300 },
    };

    it('should send event successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await expect(sendEvent(validPayload)).resolves.toBeUndefined();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validPayload),
      });
    });

    it('should handle payload without event name', async () => {
      const invalidPayload = { event: '' } as EventPayload;
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      // Should not throw but should log error
      await expect(sendEvent(invalidPayload)).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(
        '[SeQura Widget] - Event payload must include an event name'
      );
    });

    it('should handle API error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(sendEvent(validPayload)).rejects.toThrow(
        'HTTP 500: Internal Server Error'
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(sendEvent(validPayload)).rejects.toThrow('Network error');
    });
  });
});
