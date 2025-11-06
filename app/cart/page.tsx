"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useApp();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      loadCart();
    }
  }, [status, router]);

  const loadCart = async () => {
    const savedCart = localStorage.getItem("cart");
    if (!savedCart) {
      setCartItems([]);
      return;
    }

    const cart = JSON.parse(savedCart);
    const response = await fetch("/api/products");
    if (response.ok) {
      const products = await response.json();
      const items: CartItem[] = [];

      for (const [productId, quantity] of Object.entries(cart)) {
        const product = products.find((p: Product) => p.id === productId);
        if (product) {
          items.push({ product, quantity: quantity as number });
        }
      }

      setCartItems(items);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const savedCart = localStorage.getItem("cart");
    if (!savedCart) return;

    const cart = JSON.parse(savedCart);
    if (quantity <= 0) {
      delete cart[productId];
    } else {
      cart[productId] = quantity;
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
  };

  const clearCart = () => {
    localStorage.removeItem("cart");
    setCartItems([]);
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const items = cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, paymentMethod }),
      });

      const data = await response.json();

      if (response.ok) {
        clearCart();
        setShowSuccessModal(true);
        // Redirect to receipt page after 2 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
          router.push(`/receipt/${data.id}`);
        }, 2000);
      } else {
        setError(data.error || "Failed to place order");
      }
    } catch (error) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-slide-up">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            🛒 {t('shoppingCart')}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">{t('yourCart')}</p>
        </div>

      {message && (
        <div className="bg-gradient-to-r from-green-400 to-green-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl mb-6 shadow-lg animate-bounce-in">
          <p className="flex items-center text-sm sm:text-base">
            <span className="text-xl sm:text-2xl mr-2">✅</span>
            {message}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-gradient-to-r from-red-400 to-red-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl mb-6 shadow-lg animate-bounce-in">
          <p className="flex items-center text-sm sm:text-base">
            <span className="text-xl sm:text-2xl mr-2">❌</span>
            {error}
          </p>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="text-center py-16 sm:py-24 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl max-w-md mx-auto">
            <div className="text-7xl sm:text-8xl mb-6 animate-bounce-in">🛒</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">{t('emptyCart')}</h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">{t('startShopping')}</p>
            <a
              href="/"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              🏪 {t('backToShop')}
            </a>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <div 
                key={item.product.id} 
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover-lift animate-slide-up"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Product Image */}
                  <div className="w-full sm:w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={item.product.image || "https://via.placeholder.com/150"}
                      alt={item.product.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-grow">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{item.product.name}</h3>
                    <p className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                      ${item.product.price.toFixed(2)}
                    </p>
                    
                    {/* Quantity Controls */}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="text-gray-700 font-semibold">{t('quantity')}:</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full hover:from-gray-300 hover:to-gray-400 transition-all font-bold text-gray-700 flex items-center justify-center shadow-md hover:scale-110"
                      >
                        −
                      </button>
                      <span className="w-12 sm:w-16 text-center text-lg sm:text-xl font-bold text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:from-blue-600 hover:to-purple-600 transition-all font-bold disabled:from-gray-300 disabled:to-gray-400 flex items-center justify-center shadow-md hover:scale-110 disabled:hover:scale-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => updateQuantity(item.product.id, 0)}
                    className="self-start sm:self-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105 shadow-md text-sm sm:text-base"
                  >
                    🗑️ {t('remove')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl sticky top-24 animate-scale-in">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                {t('total')}
              </h2>
              
              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-3 text-sm sm:text-base">
                  💳 Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-800 font-medium transition-all hover:border-blue-300 text-sm sm:text-base"
                  style={{ backgroundColor: '#ffffff', color: '#000000', borderColor: '#333333', fontWeight: 'bold' }}
                >
                  <option value="credit_card" style={{ backgroundColor: '#ffffff', color: '#000000', fontWeight: 'bold' }}>💳 Credit Card</option>
                  <option value="paypal" style={{ backgroundColor: '#ffffff', color: '#000000', fontWeight: 'bold' }}>🅿️ PayPal</option>
                  <option value="bank_transfer" style={{ backgroundColor: '#ffffff', color: '#000000', fontWeight: 'bold' }}>🏦 Bank Transfer</option>
                  <option value="cash_on_delivery" style={{ backgroundColor: '#ffffff', color: '#000000', fontWeight: 'bold' }}>💵 Cash on Delivery</option>
                </select>
              </div>

              {/* Total */}
              <div className="border-t-2 border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-semibold text-base sm:text-lg">{t('subtotal')}:</span>
                  <span className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 sm:py-4 rounded-xl hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 font-bold text-base sm:text-lg transition-all shadow-lg hover:shadow-2xl hover:scale-105 disabled:hover:scale-100 mb-4"
              >
                {loading ? "Processing..." : `💳 ${t('proceedCheckout')}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full mx-4 text-center animate-fade-in">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-green-500 flex items-center justify-center mx-auto mb-4 animate-scale-in">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 animate-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{t('orderPlaced')}</h2>
            <p className="text-gray-600 text-sm sm:text-base">Redirecting to your receipt...</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
