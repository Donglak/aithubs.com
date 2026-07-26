// src/lib/paypal.ts
// PayPal SDK dynamic loading & button rendering

declare global {
  interface Window {
    paypal: any;
  }
}

/**
 * Load PayPal SDK động
 */
export async function loadPayPalSDK(): Promise<void> {
  if (window.paypal) return;

  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  if (!clientId) {
    throw new Error('Missing VITE_PAYPAL_CLIENT_ID');
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD,VND&components=buttons,marks&locale=vi_VN`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
    document.head.appendChild(script);
  });
}

/**
 * Render PayPal Button cho one-time payment
 */
export function renderPayPalButton(
  container: HTMLElement,
  options: {
    createOrder: () => Promise<string>; // Trả về orderID từ backend
    onApprove: (data: { orderID: string }) => Promise<void>;
    onError: (err: Error) => void;
    amount?: number;
    currency?: 'USD' | 'VND';
  }
): void {
  window.paypal.Buttons({
    style: {
      layout: 'vertical',
      color: 'blue',
      shape: 'rect',
      label: 'paypal',
    },
    createOrder: async () => {
      const orderID = await options.createOrder();
      return orderID;
    },
    onApprove: async (data) => {
      await options.onApprove(data);
    },
    onError: (err) => {
      options.onError(err);
    },
  }).render(container);
}

/**
 * Render PayPal Subscribe Button cho subscription
 */
export function renderPayPalSubscribeButton(
  container: HTMLElement,
  options: {
    planId: string; // Plan ID từ PayPal Dashboard
    onApprove: (data: { subscriptionID: string }) => Promise<void>;
    onCancel: () => void;
    onError: (err: Error) => void;
  }
): void {
  window.paypal.Buttons({
    style: {
      layout: 'vertical',
      color: 'blue',
      shape: 'rect',
      label: 'subscribe',
    },
    createSubscription: (_, actions) => {
      return actions.subscription.create({
        plan_id: options.planId,
      });
    },
    onApprove: async (data) => {
      await options.onApprove(data);
    },
    onCancel: options.onCancel,
    onError: options.onError,
  }).render(container);
}