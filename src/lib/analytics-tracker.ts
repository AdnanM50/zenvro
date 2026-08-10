/**
 * Client-side E-Commerce Analytics Event Dispatcher
 * Dispatches standard e-commerce events across GA4, Meta/Facebook Pixel, TikTok, Snapchat, and LinkedIn.
 */

export interface EcommerceItem {
  id: string;
  name: string;
  category?: string;
  price?: number;
  quantity?: number;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq?: (...args: any[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ttq?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    snaptr?: (...args: any[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lintrk?: (...args: any[]) => void;
  }
}

/**
 * Track page view across platforms
 */
export function trackPageView(url?: string): void {
  if (typeof window === 'undefined') return;

  const currentUrl = url || window.location.href;

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', { page_location: currentUrl });
  }
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
  if (window.ttq && typeof window.ttq.page === 'function') {
    window.ttq.page();
  }
  if (typeof window.snaptr === 'function') {
    window.snaptr('track', 'PAGE_VIEW');
  }
}

/**
 * Track Product / Item View
 */
export function trackViewItem(item: EcommerceItem): void {
  if (typeof window === 'undefined') return;

  // Google Analytics 4
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'view_item', {
      currency: 'USD',
      value: item.price || 0,
      items: [
        {
          item_id: item.id,
          item_name: item.name,
          item_category: item.category,
          price: item.price,
          quantity: item.quantity || 1,
        },
      ],
    });
  }

  // Facebook Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'ViewContent', {
      content_ids: [item.id],
      content_name: item.name,
      content_category: item.category,
      value: item.price || 0,
      currency: 'USD',
    });
  }

  // TikTok Pixel
  if (window.ttq && typeof window.ttq.track === 'function') {
    window.ttq.track('ViewContent', {
      content_id: item.id,
      content_name: item.name,
      content_category: item.category,
      price: item.price,
      quantity: item.quantity || 1,
      currency: 'USD',
    });
  }

  // Snapchat Pixel
  if (typeof window.snaptr === 'function') {
    window.snaptr('track', 'VIEW_CONTENT', {
      item_ids: [item.id],
      price: item.price || 0,
      currency: 'USD',
    });
  }
}

/**
 * Track Add to Cart
 */
export function trackAddToCart(item: EcommerceItem): void {
  if (typeof window === 'undefined') return;

  const quantity = item.quantity || 1;
  const value = (item.price || 0) * quantity;

  // GA4
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'add_to_cart', {
      currency: 'USD',
      value,
      items: [
        {
          item_id: item.id,
          item_name: item.name,
          item_category: item.category,
          price: item.price,
          quantity,
        },
      ],
    });
  }

  // FB Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'AddToCart', {
      content_ids: [item.id],
      content_name: item.name,
      content_type: 'product',
      value,
      currency: 'USD',
    });
  }

  // TikTok Pixel
  if (window.ttq && typeof window.ttq.track === 'function') {
    window.ttq.track('AddToCart', {
      content_id: item.id,
      content_name: item.name,
      price: item.price,
      quantity,
      currency: 'USD',
    });
  }

  // Snapchat Pixel
  if (typeof window.snaptr === 'function') {
    window.snaptr('track', 'ADD_CART', {
      item_ids: [item.id],
      price: value,
      currency: 'USD',
    });
  }
}

/**
 * Track Remove from Cart
 */
export function trackRemoveFromCart(item: EcommerceItem): void {
  if (typeof window === 'undefined') return;

  const quantity = item.quantity || 1;
  const value = (item.price || 0) * quantity;

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'remove_from_cart', {
      currency: 'USD',
      value,
      items: [
        {
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity,
        },
      ],
    });
  }
}

/**
 * Track Begin Checkout
 */
export function trackBeginCheckout(items: EcommerceItem[], totalValue: number): void {
  if (typeof window === 'undefined') return;

  // GA4
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'begin_checkout', {
      currency: 'USD',
      value: totalValue,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
      })),
    });
  }

  // FB Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: items.map((i) => i.id),
      num_items: items.reduce((acc, i) => acc + (i.quantity || 1), 0),
      value: totalValue,
      currency: 'USD',
    });
  }

  // TikTok Pixel
  if (window.ttq && typeof window.ttq.track === 'function') {
    window.ttq.track('InitiateCheckout', {
      contents: items.map((i) => ({
        content_id: i.id,
        content_name: i.name,
        quantity: i.quantity || 1,
        price: i.price,
      })),
      value: totalValue,
      currency: 'USD',
    });
  }

  // Snapchat Pixel
  if (typeof window.snaptr === 'function') {
    window.snaptr('track', 'START_CHECKOUT', {
      item_ids: items.map((i) => i.id),
      price: totalValue,
      currency: 'USD',
    });
  }
}

/**
 * Track Purchase / Conversion
 */
export function trackPurchase(
  transactionId: string,
  items: EcommerceItem[],
  totalValue: number,
  currency = 'USD'
): void {
  if (typeof window === 'undefined') return;

  // GA4
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: totalValue,
      currency,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
      })),
    });
  }

  // FB Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Purchase', {
      content_ids: items.map((i) => i.id),
      value: totalValue,
      currency,
    });
  }

  // TikTok Pixel
  if (window.ttq && typeof window.ttq.track === 'function') {
    window.ttq.track('CompletePayment', {
      contents: items.map((i) => ({
        content_id: i.id,
        content_name: i.name,
        quantity: i.quantity || 1,
        price: i.price,
      })),
      value: totalValue,
      currency,
    });
  }

  // Snapchat Pixel
  if (typeof window.snaptr === 'function') {
    window.snaptr('track', 'PURCHASE', {
      transaction_id: transactionId,
      item_ids: items.map((i) => i.id),
      price: totalValue,
      currency,
    });
  }
}
