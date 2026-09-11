import api from './axios';
import { mockStorage } from './mockData';

export const ordersApi = {
  createOrder: async (orderData) => {
    try {
      const res = await api.post('/orders', orderData);
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const orders = mockStorage.getOrders();
        const cart = mockStorage.getCart();
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        const items = (cart.items || []).map((ci) => ({
          id: Date.now() + Math.random(),
          productId: ci.productId,
          quantity: ci.quantity,
          price: ci.product?.price || 100,
          product: {
            id: ci.product?.id,
            name: ci.product?.name,
            imageUrl: ci.product?.imageUrl,
            vendorId: ci.product?.vendorId,
            vendorName: ci.product?.vendor?.name || 'Vendor',
          },
        }));

        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const newOrder = {
          id: 1000 + orders.length + 1,
          userId: user.id || 1,
          customerName: user.name || 'Alex Johnson',
          customerEmail: user.email || 'customer@marketplace.com',
          totalAmount,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          trackingNumber: 'PENDING',
          carrier: 'Standard Ground',
          shippingAddress: orderData?.shippingAddress || {
            fullName: user.name || 'Alex Johnson',
            street: '742 Evergreen Terrace',
            city: 'Seattle',
            state: 'WA',
            postalCode: '98101',
            country: 'United States',
          },
          paymentMethod: orderData?.paymentMethod || 'Credit Card',
          items,
        };

        orders.unshift(newOrder);
        mockStorage.setOrders(orders);
        mockStorage.setCart({ items: [] });

        return { success: true, message: 'Order placed successfully', order: newOrder };
      }
      throw err;
    }
  },

  getMyOrders: async () => {
    try {
      const res = await api.get('/orders/my-orders');
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const orders = mockStorage.getOrders();
        const myOrders = orders.filter((o) => o.userId === (user.id || 1));
        return { success: true, count: myOrders.length, orders: myOrders };
      }
      throw err;
    }
  },

  getOrderById: async (id) => {
    try {
      const res = await api.get(`/orders/${id}`);
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const orders = mockStorage.getOrders();
        const order = orders.find((o) => o.id === Number(id));
        if (order) return { success: true, order };
        throw new Error('Order not found');
      }
      throw err;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status });
      return res;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        const orders = mockStorage.getOrders();
        const idx = orders.findIndex((o) => o.id === Number(orderId));
        if (idx !== -1) {
          orders[idx].status = status;
          if (status === 'DELIVERED') {
            orders[idx].deliveredAt = new Date().toISOString();
          }
          if (status === 'SHIPPED' && orders[idx].trackingNumber === 'PENDING') {
            orders[idx].trackingNumber = `TRK-${Math.floor(1000000 + Math.random() * 9000000)}-US`;
          }
          mockStorage.setOrders(orders);
          return { success: true, order: orders[idx] };
        }
        throw new Error('Order not found');
      }
      throw err;
    }
  },
};
