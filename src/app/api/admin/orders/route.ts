import { NextResponse } from 'next/server';
import { OrderModel } from '@/models/order.model';
import type { Order } from '@/types/order';

// Mock seed orders if DB has none
const MOCK_ADMIN_ORDERS: Order[] = [
  {
    _id: "ord_101",
    orderNumber: "VL-3896228591",
    userEmail: "selixiw785@gexige.com",
    items: [
      {
        key: "studio-coat-m",
        slug: "studio-hanger-coat",
        name: "Studio Hanger Coat",
        category: "Women",
        price: 164.0,
        image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=400",
        size: "M",
        quantity: 1
      }
    ],
    subtotal: 164.0,
    shipping: 15.0,
    total: 179.0,
    paymentMethod: "stripe",
    paymentStatus: "paid",
    orderStatus: "shipped",
    shippingAddress: {
      fullName: "Adnan Islam",
      email: "selixiw785@gexige.com",
      address: "123 Fashion Blvd",
      city: "New York",
      postalCode: "10001",
      country: "USA"
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    _id: "ord_102",
    orderNumber: "VL-6138621180",
    userEmail: "nafip82705@hideam.com",
    items: [
      {
        key: "black-puffer-l",
        slug: "black-cloud-puffer",
        name: "Black Cloud Puffer",
        category: "Men",
        price: 212.0,
        image: "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=400",
        size: "L",
        quantity: 1
      }
    ],
    subtotal: 212.0,
    shipping: 0.0,
    total: 212.0,
    paymentMethod: "stripe",
    paymentStatus: "paid",
    orderStatus: "delivered",
    shippingAddress: {
      fullName: "Adnan X",
      email: "nafip82705@hideam.com",
      address: "456 Velvet Ave",
      city: "Los Angeles",
      postalCode: "90001",
      country: "USA"
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    _id: "ord_103",
    orderNumber: "VL-9921473210",
    userEmail: "customer3@velora.com",
    items: [
      {
        key: "studio-coat-s",
        slug: "studio-hanger-coat",
        name: "Studio Hanger Coat",
        category: "Women",
        price: 164.0,
        image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=400",
        size: "S",
        quantity: 1
      }
    ],
    subtotal: 164.0,
    shipping: 15.0,
    total: 179.0,
    paymentMethod: "cod",
    paymentStatus: "pending",
    orderStatus: "processing",
    shippingAddress: {
      fullName: "Sophia Miller",
      email: "customer3@velora.com",
      address: "789 Silk Street",
      city: "Chicago",
      postalCode: "60601",
      country: "USA"
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  }
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const orderStatus = searchParams.get('orderStatus') || 'all';
    const paymentStatus = searchParams.get('paymentStatus') || 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const dbResult = await OrderModel.findAll({
      search,
      orderStatus,
      paymentStatus,
      page,
      limit
    });

    let ordersList = dbResult.orders;
    let totalCount = dbResult.total;

    // Fallback to seeded orders if DB is empty
    if (ordersList.length === 0 && !search && orderStatus === 'all' && paymentStatus === 'all') {
      ordersList = MOCK_ADMIN_ORDERS;
      totalCount = MOCK_ADMIN_ORDERS.length;
    }

    // Filter seed orders in memory if needed
    if (ordersList === MOCK_ADMIN_ORDERS) {
      if (orderStatus !== 'all') {
        ordersList = ordersList.filter(o => o.orderStatus === orderStatus);
      }
      if (paymentStatus !== 'all') {
        ordersList = ordersList.filter(o => o.paymentStatus === paymentStatus);
      }
      if (search) {
        const q = search.toLowerCase();
        ordersList = ordersList.filter(
          o =>
            o.orderNumber.toLowerCase().includes(q) ||
            o.userEmail.toLowerCase().includes(q) ||
            o.shippingAddress.fullName.toLowerCase().includes(q)
        );
      }
      totalCount = ordersList.length;
    }

    // Calculate metrics summary
    const summary = {
      totalOrders: totalCount,
      confirmed: ordersList.filter(o => o.orderStatus === 'confirmed').length,
      processing: ordersList.filter(o => o.orderStatus === 'processing').length,
      shipped: ordersList.filter(o => o.orderStatus === 'shipped').length,
      delivered: ordersList.filter(o => o.orderStatus === 'delivered').length,
      cancelled: ordersList.filter(o => o.orderStatus === 'cancelled').length,
      paidRevenue: ordersList.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0)
    };

    return NextResponse.json({
      success: true,
      data: ordersList,
      total: totalCount,
      summary
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch admin orders';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { orderId, orderStatus, paymentStatus } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required' },
        { status: 400 }
      );
    }

    const updated = await OrderModel.updateOrderStatus(orderId, orderStatus, paymentStatus);

    // If mock order or DB fallback
    if (!updated) {
      const mock = MOCK_ADMIN_ORDERS.find(o => o.orderNumber === orderId || o._id === orderId);
      if (mock) {
        if (orderStatus) mock.orderStatus = orderStatus;
        if (paymentStatus) mock.paymentStatus = paymentStatus;
        mock.updatedAt = new Date().toISOString();
        return NextResponse.json({
          success: true,
          message: 'Order status updated successfully',
          data: mock
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      data: updated
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update order status';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required' },
        { status: 400 }
      );
    }

    const deleted = await OrderModel.delete(orderId);

    return NextResponse.json({
      success: true,
      deleted
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to delete order';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
