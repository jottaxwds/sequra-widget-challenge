import { getCreditAgreement, sendEvent } from "./api";
import type { CreditAgreement, EventPayload } from "../types";
import { events } from "../constants";

const sortInstalments = (instalments: CreditAgreement[]) => instalments.sort((a, b) => a.instalment_count - b.instalment_count);

export async function getSortedInstallmentOptions(totalPrice: number) {
  try {
    const agreements = await getCreditAgreement(totalPrice);
    return agreements && agreements.length ? sortInstalments(agreements) : [];
  } catch (error) {
    console.error("[SeQura Widget] - Failed to fetch installment options:", error);
    throw error;
  }
}

export async function trackWidgetView(action: string, totalPrice: number) {
  const payload: EventPayload = {
    event: "widget_viewed",
    context: {
      action,
      totalPrice,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    },
  };

  try {
    await sendEvent(payload);
  } catch (error) {
    console.error("[SeQura Widget] - Failed to send widget view event:", error);
  }
}

export async function trackInstallmentSelection(
  selectedInstallments: number,
  totalPrice: number
) {
  const payload: EventPayload = {
    event: "user_action",
    context: {
      action: events.instalment_selected,
      selectedInstallments,
      totalPrice,
      selectionTime: new Date().toISOString(),
    },
  };

  try {
    await sendEvent(payload);
  } catch (error) {
    console.error("[SeQura Widget] - Failed to send installment selection event:", error);
  }
}

export async function trackError(
  errorType: string,
  errorMessage: string,
  context?: Record<string, string | number | undefined>
) {
  const payload: EventPayload = {
    event: 'error',
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
  } catch (error) {
    console.error("[SeQura Widget] - Failed to send error event:", error);
  }
}
