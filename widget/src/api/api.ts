import type { CreditAgreement, EventPayload } from '../types';

// API Configuration
const API_BASE_URL = 'http://localhost:8080';

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      console.error('[SeQura Widget] - API error:', response);
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
}

export async function getCreditAgreement(totalPrice: number): Promise<CreditAgreement[]> {
  if (!totalPrice || totalPrice <= 0) {
    throw new Error('Total price must be a positive number');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/credit_agreements?totalWithTax=${totalPrice}`
    );
    
    return handleApiResponse<CreditAgreement[]>(response);
  } catch (error) {
    console.error('Failed to fetch credit agreements:', error);
    throw error;
  }
}

export async function sendEvent(payload: EventPayload): Promise<void> {
  if (!payload.event) {
    throw new Error('Event payload must include an event name');
  }

  // Add timestamp if not provided
  const eventPayload: EventPayload = {
    timestamp: new Date().toISOString(),
    ...payload,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to send event:', error);
    throw error;
  }
}
