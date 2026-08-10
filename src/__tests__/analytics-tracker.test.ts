import {
  trackPageView,
  trackViewItem,
  trackAddToCart,
  trackRemoveFromCart,
  trackBeginCheckout,
  trackPurchase,
} from '@/lib/analytics-tracker';

describe('Analytics Tracker Unit Tests', () => {
  beforeEach(() => {
    // Reset window tracking functions
    delete (window as any).gtag;
    delete (window as any).fbq;
    delete (window as any).ttq;
    delete (window as any).snaptr;
    delete (window as any).lintrk;
  });

  it('trackPageView dispatches events to window globals if available', () => {
    const gtagMock = jest.fn();
    const fbqMock = jest.fn();
    const ttqMock = { page: jest.fn() };
    const snaptrMock = jest.fn();

    (window as any).gtag = gtagMock;
    (window as any).fbq = fbqMock;
    (window as any).ttq = ttqMock;
    (window as any).snaptr = snaptrMock;

    trackPageView('https://zenvro.com/shop');

    expect(gtagMock).toHaveBeenCalledWith('event', 'page_view', { page_location: 'https://zenvro.com/shop' });
    expect(fbqMock).toHaveBeenCalledWith('track', 'PageView');
    expect(ttqMock.page).toHaveBeenCalled();
    expect(snaptrMock).toHaveBeenCalledWith('track', 'PAGE_VIEW');
  });

  it('trackViewItem dispatches view_item & ViewContent to tracking scripts', () => {
    const gtagMock = jest.fn();
    const fbqMock = jest.fn();
    const ttqMock = { track: jest.fn() };
    const snaptrMock = jest.fn();

    (window as any).gtag = gtagMock;
    (window as any).fbq = fbqMock;
    (window as any).ttq = ttqMock;
    (window as any).snaptr = snaptrMock;

    const item = { id: 'p-1', name: 'Leather Jacket', category: 'Outerwear', price: 299 };
    trackViewItem(item);

    expect(gtagMock).toHaveBeenCalledWith('event', 'view_item', expect.objectContaining({
      currency: 'USD',
      value: 299,
      items: [expect.objectContaining({ item_id: 'p-1', item_name: 'Leather Jacket' })],
    }));
    expect(fbqMock).toHaveBeenCalledWith('track', 'ViewContent', expect.objectContaining({
      content_ids: ['p-1'],
      content_name: 'Leather Jacket',
    }));
    expect(ttqMock.track).toHaveBeenCalledWith('ViewContent', expect.objectContaining({
      content_id: 'p-1',
    }));
    expect(snaptrMock).toHaveBeenCalledWith('track', 'VIEW_CONTENT', expect.objectContaining({
      item_ids: ['p-1'],
    }));
  });

  it('trackAddToCart dispatches add_to_cart & AddToCart events correctly', () => {
    const gtagMock = jest.fn();
    const fbqMock = jest.fn();

    (window as any).gtag = gtagMock;
    (window as any).fbq = fbqMock;

    const item = { id: 'p-2', name: 'Sneakers', price: 120, quantity: 2 };
    trackAddToCart(item);

    expect(gtagMock).toHaveBeenCalledWith('event', 'add_to_cart', expect.objectContaining({
      value: 240,
    }));
    expect(fbqMock).toHaveBeenCalledWith('track', 'AddToCart', expect.objectContaining({
      content_ids: ['p-2'],
      value: 240,
    }));
  });

  it('trackRemoveFromCart dispatches remove_from_cart event to GA4', () => {
    const gtagMock = jest.fn();
    (window as any).gtag = gtagMock;

    const item = { id: 'p-2', name: 'Sneakers', price: 120, quantity: 1 };
    trackRemoveFromCart(item);

    expect(gtagMock).toHaveBeenCalledWith('event', 'remove_from_cart', expect.objectContaining({
      value: 120,
    }));
  });

  it('trackBeginCheckout dispatches initiate checkout across platforms', () => {
    const gtagMock = jest.fn();
    const fbqMock = jest.fn();

    (window as any).gtag = gtagMock;
    (window as any).fbq = fbqMock;

    const items = [{ id: 'p-1', name: 'Item 1', price: 100, quantity: 1 }];
    trackBeginCheckout(items, 100);

    expect(gtagMock).toHaveBeenCalledWith('event', 'begin_checkout', expect.objectContaining({
      value: 100,
    }));
    expect(fbqMock).toHaveBeenCalledWith('track', 'InitiateCheckout', expect.objectContaining({
      value: 100,
    }));
  });

  it('trackPurchase dispatches purchase & payment complete events', () => {
    const gtagMock = jest.fn();
    const fbqMock = jest.fn();
    const ttqMock = { track: jest.fn() };
    const snaptrMock = jest.fn();

    (window as any).gtag = gtagMock;
    (window as any).fbq = fbqMock;
    (window as any).ttq = ttqMock;
    (window as any).snaptr = snaptrMock;

    const items = [{ id: 'p-1', name: 'Item 1', price: 100, quantity: 1 }];
    trackPurchase('ORDER-12345', items, 100, 'USD');

    expect(gtagMock).toHaveBeenCalledWith('event', 'purchase', expect.objectContaining({
      transaction_id: 'ORDER-12345',
      value: 100,
    }));
    expect(fbqMock).toHaveBeenCalledWith('track', 'Purchase', expect.objectContaining({
      value: 100,
    }));
    expect(ttqMock.track).toHaveBeenCalledWith('CompletePayment', expect.objectContaining({
      value: 100,
    }));
    expect(snaptrMock).toHaveBeenCalledWith('track', 'PURCHASE', expect.objectContaining({
      transaction_id: 'ORDER-12345',
      price: 100,
    }));
  });
});
