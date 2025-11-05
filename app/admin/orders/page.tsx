"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
  };
}

interface Order {
  id: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  user: {
    email: string;
    name: string;
  };
  orderItems: OrderItem[];
}

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user.role !== "admin") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchOrders();
    }
  }, [status, session, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setMessage(`Order marked as ${newStatus} successfully`);
        fetchOrders();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError("Failed to update order status");
        setTimeout(() => setError(""), 3000);
      }
    } catch (error) {
      setError("An error occurred");
      setTimeout(() => setError(""), 3000);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage("Order deleted successfully");
        fetchOrders();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError("Failed to delete order");
        setTimeout(() => setError(""), 3000);
      }
    } catch (error) {
      setError("An error occurred");
      setTimeout(() => setError(""), 3000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: { [key: string]: string } = {
      credit_card: "Credit Card",
      paypal: "PayPal",
      bank_transfer: "Bank Transfer",
      cash_on_delivery: "Cash on Delivery",
    };
    return methods[method] || method;
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-4 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-10 animate-slide-up">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-2">
            📋 Manage Orders
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">View and manage all customer orders</p>
        </div>

        {message && (
          <div className="mb-6 animate-bounce-in">
            <div className="bg-gradient-to-r from-green-400 to-green-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-lg">
              <p className="flex items-center text-sm sm:text-base">
                <span className="text-xl sm:text-2xl mr-2">✅</span>
                {message}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 animate-bounce-in">
            <div className="bg-gradient-to-r from-red-400 to-red-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-lg">
              <p className="flex items-center text-sm sm:text-base">
                <span className="text-xl sm:text-2xl mr-2">❌</span>
                {error}
              </p>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-16 sm:py-24 animate-fade-in">
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl max-w-md mx-auto">
              <div className="text-7xl sm:text-8xl mb-6 animate-bounce-in">📭</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">No orders yet</h2>
              <p className="text-gray-600 text-sm sm:text-base">Orders will appear here when customers make purchases</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order, index) => (
              <div 
                key={order.id} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden hover-lift animate-slide-up"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <span className="text-2xl">🧾</span>
                        Order #{order.id.substring(0, 12)}
                      </h3>
                      <div className="space-y-1 text-purple-100 text-xs sm:text-sm">
                        <p className="flex items-center gap-2">
                          <span>👤</span>
                          <span className="font-semibold">Customer:</span> {order.user.name || 'N/A'}
                        </p>
                        <p className="flex items-center gap-2">
                          <span>📧</span>
                          <span className="font-semibold">Email:</span> {order.user.email}
                        </p>
                        <p className="flex items-center gap-2">
                          <span>📅</span>
                          <span className="font-semibold">Date:</span> {new Date(order.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="flex items-center gap-2">
                          <span>💳</span>
                          <span className="font-semibold">Payment:</span> {getPaymentMethodLabel(order.paymentMethod)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start lg:items-end gap-3">
                      <div className="text-right">
                        <p className="text-purple-100 text-xs sm:text-sm mb-1">Total Amount</p>
                        <p className="text-3xl sm:text-4xl font-bold text-white">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                      
                      <span className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg ${
                        order.status === 'pending' ? 'bg-yellow-400 text-yellow-900' :
                        order.status === 'paid' ? 'bg-green-400 text-green-900' :
                        order.status === 'shipped' ? 'bg-blue-400 text-blue-900' :
                        order.status === 'delivered' ? 'bg-purple-400 text-purple-900' :
                        'bg-gray-400 text-gray-900'
                      }`}>
                        {order.status === 'pending' && '⏳'}
                        {order.status === 'paid' && '✅'}
                        {order.status === 'shipped' && '🚚'}
                        {order.status === 'delivered' && '📦'}
                        {' '}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 sm:p-6">
                  <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">🛍️</span>
                    Order Items:
                  </h4>
                  <div className="space-y-3 mb-6">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl hover:from-purple-100 hover:to-blue-100 transition-all">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg flex items-center justify-center shadow-md">
                            <span className="text-2xl sm:text-3xl">📦</span>
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-800 text-sm sm:text-base">{item.product.name}</h5>
                            <p className="text-xs sm:text-sm text-gray-600">
                              <span className="font-bold text-purple-600">{item.quantity}</span> × 
                              <span className="font-bold text-blue-600"> ${item.price.toFixed(2)}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                            ${(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'paid')}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-green-700 font-semibold transition-all shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <span className="text-lg">✅</span>
                        Mark Paid
                      </button>
                    )}
                    {order.status === 'paid' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 font-semibold transition-all shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <span className="text-lg">🚚</span>
                        Mark Shipped
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 font-semibold transition-all shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <span className="text-lg">📦</span>
                        Mark Delivered
                      </button>
                    )}
                    
                    <Link
                      href={`/receipt/${order.id}`}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-600 font-semibold transition-all shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2 text-center"
                    >
                      <span className="text-lg">🧾</span>
                      View Receipt
                    </Link>
                    
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl hover:from-red-600 hover:to-red-700 font-semibold transition-all shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <span className="text-lg">🗑️</span>
                      Delete Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
