"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image: string;
  };
}

interface Order {
  id: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  orderItems: OrderItem[];
  user?: {
    email: string;
    name: string;
  };
}

export default function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState("");
  const [sendingToTelegram, setSendingToTelegram] = useState(false);
  const [telegramMessage, setTelegramMessage] = useState("");

  useEffect(() => {
    params.then((p) => {
      setOrderId(p.id);
    });
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && orderId) {
      fetchOrder();
    }
  }, [status, router, orderId]);

  // Auto-send to Telegram when order loads
  useEffect(() => {
    if (order && !sendingToTelegram && !telegramMessage) {
      sendToTelegram();
    }
  }, [order]);

  const fetchOrder = async () => {
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const orders = await response.json();
        const foundOrder = orders.find((o: Order) => o.id === orderId);
        if (foundOrder) {
          setOrder(foundOrder);
        }
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  const downloadReceipt = async () => {
    // First try html2canvas
    const receiptElement = document.getElementById('receipt-content');
    if (!receiptElement) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(receiptElement, {
        scale: 4, // Increased scale for better quality
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff', // Ensure white background
        width: receiptElement.scrollWidth,
        height: receiptElement.scrollHeight
      });

      // Convert to image and download
      const link = document.createElement('a');
      link.download = `receipt-${order?.id.substring(0, 8)}.png`;
      link.href = canvas.toDataURL('image/png', 1.0); // Highest quality PNG
      link.click();
    } catch (error) {
      console.error('Download error:', error);
      // Fallback to print
      window.print();
    }
  };

  const downloadReceiptAsPDF = async () => {
    try {
      // Use jsPDF for better PDF generation
      const receiptElement = document.getElementById('receipt-content');
      if (!receiptElement) return;

      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = await import('jspdf');
      
      // Capture the receipt as canvas
      const canvas = await html2canvas(receiptElement, {
        scale: 3,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF.jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      
      // Download PDF
      pdf.save(`receipt-${order?.id.substring(0, 8)}.pdf`);
    } catch (error) {
      console.error('PDF download error:', error);
      // Fallback to print
      window.print();
    }
  };

  const sendToTelegram = async () => {
    if (!order) return;
    
    setSendingToTelegram(true);
    setTelegramMessage("");

    try {
      const orderDetails = {
        createdAt: order.createdAt,
        status: order.status,
        paymentMethod: getPaymentMethodLabel(order.paymentMethod),
        customerName: order.user?.name || session?.user?.name || 'Customer',
        customerEmail: order.user?.email || session?.user?.email || 'N/A',
        items: order.orderItems.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: order.total,
      };

      const response = await fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          orderDetails,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTelegramMessage("✅ Receipt sent to Telegram successfully!");
      } else {
        setTelegramMessage("❌ Failed to send to Telegram: " + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Telegram send error:', error);
      setTelegramMessage("❌ Error sending to Telegram");
    } finally {
      setSendingToTelegram(false);
      // Clear message after 5 seconds
      setTimeout(() => setTelegramMessage(""), 5000);
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

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Receipt not found</h1>
          <Link href="/orders" className="text-blue-600 hover:underline">
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Animated Header Banner */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl shadow-2xl mb-4 animate-pulse-slow">
            <div className="text-6xl mb-2 animate-bounce-in">🎉</div>
            <h1 className="text-3xl sm:text-4xl font-bold">ORDER CONFIRMED!</h1>
            <p className="text-blue-100 text-sm mt-1">Thank you for your purchase</p>
          </div>
        </div>

        {/* Main Receipt Card */}
        <div id="receipt-content" className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in print:shadow-none print:rounded-none print:border-2 print:border-black">
          {/* Gradient Top Bar */}
          <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 print:hidden"></div>
          
          {/* Receipt Header */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 border-b-4 border-gradient print:bg-white print:border-b-4 print:border-black">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl print:text-black print:text-3xl">🧾</span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 print:text-black print:text-2xl">RECEIPT</h2>
                </div>
                <p className="text-gray-600 print:text-gray-800 print:text-lg">E-Commerce Store</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wide print:text-gray-700 print:text-sm">Order ID</p>
                <p className="text-lg font-mono font-bold text-blue-600 print:text-black print:text-xl">#{order.id.substring(0, 12)}</p>
              </div>
            </div>
          </div>
          {/* Order & Customer Info Cards */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Order Info Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all hover-lift print:bg-white print:border-2 print:border-black print:shadow-none">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-2xl shadow-lg print:bg-white print:text-black print:border print:border-gray-300">
                    📋
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 print:text-black">Order Details</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      <span>📅</span> Date
                    </span>
                    <span className="font-semibold text-gray-800">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      <span>⏰</span> Time
                    </span>
                    <span className="font-semibold text-gray-800">
                      {new Date(order.createdAt).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center gap-2">
                        <span>⚡</span> Status
                      </span>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${
                        order.status === 'paid' ? 'bg-green-500 text-white' :
                        order.status === 'shipped' ? 'bg-blue-500 text-white' :
                        order.status === 'delivered' ? 'bg-purple-500 text-white' :
                        'bg-yellow-500 text-white'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Info Card */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-2xl border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all hover-lift print:bg-white print:border-2 print:border-black print:shadow-none">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-2xl shadow-lg print:bg-white print:text-black print:border print:border-gray-300">
                    👤
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 print:text-black">Customer Info</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">👨‍💼 Name</p>
                    <p className="font-semibold text-gray-800">{order.user?.name || session?.user?.name || 'Customer'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">📧 Email</p>
                    <p className="font-semibold text-gray-800 break-all">{order.user?.email || session?.user?.email || 'N/A'}</p>
                  </div>
                  <div className="pt-2 border-t border-purple-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">💳 Payment</p>
                    <p className="font-semibold text-gray-800">{getPaymentMethodLabel(order.paymentMethod)}</p>
                  </div>
                </div>
              </div>
            </div>

          {/* Order Items */}
          <div className="mb-8">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center text-lg sm:text-xl print:text-black print:text-xl">
              <span className="text-2xl sm:text-3xl mr-2 print:text-black">🛍️</span> Order Items
            </h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200 print:border-2 print:border-black">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-200 print:bg-gray-200 print:border-b-2 print:border-black">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-700 print:text-black print:text-base print:border-r print:border-gray-400">Item</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-bold text-gray-700 print:text-black print:text-base print:border-r print:border-gray-400">Qty</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-bold text-gray-700 print:text-black print:text-base print:border-r print:border-gray-400">Price</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-bold text-gray-700 print:text-black print:text-base">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 print:divide-gray-400 print:border-b-2 print:border-gray-400">
                  {order.orderItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition print:hover:bg-white print:border-b print:border-gray-300">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 print:py-2">
                        <div className="text-sm sm:text-base font-medium text-gray-800 print:text-black print:text-base">{item.product.name}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-center print:py-2">
                        <span className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold print:bg-white print:text-black print:border print:border-black">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-sm sm:text-base text-gray-700 print:text-black print:text-base print:py-2">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-sm sm:text-base font-semibold text-gray-900 print:text-black print:text-base print:py-2">
                        ${(item.quantity * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 sm:p-8 border-2 border-blue-200 print:bg-white print:border-2 print:border-black">
            <div className="flex justify-end">
              <div className="w-full sm:w-80 space-y-3">
                <div className="flex justify-between text-sm sm:text-base text-gray-700 print:text-black print:text-lg">
                  <span>Subtotal:</span>
                  <span className="font-semibold print:text-black print:text-lg">${order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-gray-700 print:text-black print:text-lg">
                  <span>Tax (0%):</span>
                  <span className="font-semibold print:text-black print:text-lg">$0.00</span>
                </div>
                <div className="border-t-2 border-gray-300 pt-3 print:border-black">
                  <div className="flex justify-between items-center">
                    <span className="text-lg sm:text-2xl font-bold text-gray-900 print:text-black print:text-xl">Total:</span>
                    <span className="text-2xl sm:text-3xl font-bold text-blue-600 print:text-black print:text-xl">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t-2 border-gray-200">
            <p className="text-gray-600 text-sm mb-2">If you have any questions about this receipt, please contact us.</p>
            <p className="text-gray-800 font-semibold text-sm sm:text-base">Thank you for shopping with us! 🎉</p>
          </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-4xl mx-auto mt-6">
        {/* Success/Error Message */}
        {telegramMessage && (
          <div className={`mb-4 p-4 rounded-xl text-center font-semibold animate-bounce-in ${
            telegramMessage.includes('✅') 
              ? 'bg-green-100 text-green-800 border-2 border-green-300' 
              : 'bg-red-100 text-red-800 border-2 border-red-300'
          }`}>
            {telegramMessage}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={downloadReceipt}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 sm:py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <span className="text-xl sm:text-2xl">📥</span>
            Download Image
          </button>

          <button
            onClick={downloadReceiptAsPDF}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 sm:py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <span className="text-xl sm:text-2xl">📄</span>
            Download PDF
          </button>

          <button
            onClick={sendToTelegram}
            disabled={sendingToTelegram}
            className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 sm:py-4 rounded-xl hover:from-green-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            {sendingToTelegram ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Sending...
              </>
            ) : (
              <>
                <span className="text-xl sm:text-2xl">✈️</span>
                Send to Telegram
              </>
            )}
          </button>

          <Link
            href="/orders"
            className="flex-1 bg-white text-gray-800 py-3 sm:py-4 rounded-xl hover:bg-gray-100 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 border-2 border-gray-300"
          >
            <span className="text-xl sm:text-2xl">📋</span>
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
