import { getCreditAgreement, sendEvent } from "./api";
import type { EventPayload } from "../types";

// Example 1: Getting credit agreements for a product
export async function fetchInstallmentOptions(totalPrice: number) {
  try {
    const agreements = await getCreditAgreement(totalPrice);
    console.log("Available installment options:", agreements);
    return agreements;
  } catch (error) {
    console.error("Failed to fetch installment options:", error);
    throw error;
  }
}

export async function trackWidgetView(productId: string, totalPrice: number) {
  const payload: EventPayload = {
    event: "widget_viewed",
    context: {
      productId,
      totalPrice,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    },
  };

  try {
    await sendEvent(payload);
    console.log("Widget view event sent successfully");
  } catch (error) {
    console.error("Failed to send widget view event:", error);
  }
}

export async function trackInstallmentSelection(
  eventId: string,
  selectedInstallments: number,
  totalPrice: number
) {
  const payload: EventPayload = {
    event: "installment_selected",
    context: {
      eventId,
      selectedInstallments,
      totalPrice,
      selectionTime: new Date().toISOString(),
    },
  };

  try {
    await sendEvent(payload);
    console.log("Installment selection event sent successfully");
  } catch (error) {
    console.error("Failed to send installment selection event:", error);
  }
}

export async function trackError(
  errorType: string,
  errorMessage: string,
  context?: Record<string, string | number | undefined>
) {
  const payload: EventPayload = {
    event: "error_occurred",
    context: {
      errorType,
      errorMessage,
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...context,
    },
  };

  try {
    await sendEvent(payload);
    console.log("Error event sent successfully");
  } catch (error) {
    console.error("Failed to send error event:", error);
  }
}
