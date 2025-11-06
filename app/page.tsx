"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { useApp } from "@/contexts/AppContext";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}

export default function HomePage() {
  const { data: session } = useSession();
  const { t } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProducts();
    loadCart();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart: { [key: string]: number }) => {
    localStorage.setItem("cart", JSON.stringify(newCart));
    setCart(newCart);
  };

  const addToCart = (productId: string) => {
    if (!session) {
      // Silent fail - no message shown
      return;
    }

    const newCart = { ...cart };
    newCart[productId] = (newCart[productId] || 0) + 1;
    saveCart(newCart);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredProducts(products);
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-900 py-4 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-10 animate-slide-up welcome-container">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
            {t('welcomeStore')}
          </h1>
          <p className="text-gray-600 dark:text-white text-base sm:text-lg mb-6">{t('discoverProducts')} 🛍️</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={t('searchPlaceholder')}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 pl-12 sm:pl-14 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-sm sm:text-base shadow-md"
                />
                <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-xl sm:text-2xl">🔍</span>
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all"
                  >
                    <span className="text-xl">✕</span>
                  </button>
                )}
              </div>
              <button
                onClick={handleSearch}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold text-sm sm:text-base transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
              >
                <span className="text-lg sm:text-xl">🔎</span>
                <span className="hidden sm:inline">{t('search')}</span>
              </button>
            </div>
            {searchQuery && (
              <p className="text-sm text-gray-600 mt-2 text-center">
                {t('found')} <span className="font-bold text-blue-600">{filteredProducts.length}</span> {t('products')}
              </p>
            )}
          </div>
        </div>

      {!session && (
        <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white px-4 sm:px-6 py-4 rounded-xl mb-6 shadow-lg animate-slide-up">
          <p className="text-sm sm:text-base">
            <span className="text-xl sm:text-2xl mr-2">🔐</span>
            {t('pleaseLogin')} <Link href="/login" className="underline font-bold hover:text-blue-100">{t('login')}</Link> {t('pleaseLogin').includes('purchase') ? '' : t('pleaseLogin').split('login')[1]}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredProducts.map((product, index) => (
          <div 
            key={product.id} 
            className="group bg-white rounded-2xl shadow-lg overflow-hidden hover-lift animate-slide-up"
            style={{animationDelay: `${index * 0.1}s`}}
          >
            <div className="relative overflow-hidden">
              <img
                src={product.image || "https://via.placeholder.com/300"}
                alt={product.name}
                className="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm sm:text-base">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-2 text-gray-800 group-hover:text-blue-600 transition">
                {product.name}
              </h2>
              <p className="text-gray-600 dark:text-white mb-4 text-sm sm:text-base line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                  ${product.price.toFixed(2)}
                </span>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold text-gray-700">
                  📦 {product.stock}
                </span>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => addToCart(product.id)}
                  disabled={product.stock === 0 || !session}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 sm:py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 font-semibold text-sm sm:text-base transition-all shadow-md hover:shadow-lg"
                >
                  {product.stock === 0 ? `🚫 ${t('outOfStock')}` : `🛒 ${t('addToCart')}`}
                </button>
                <Link
                  href={`/product/${product.id}`}
                  className="block w-full bg-gray-100 text-gray-800 py-2 sm:py-3 rounded-xl hover:bg-gray-200 text-center font-semibold text-sm sm:text-base transition-all border-2 border-gray-200 hover:border-gray-300"
                >
                  🔍 {t('viewDetails')}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16 sm:py-20 animate-fade-in">
          <div className="text-6xl sm:text-8xl mb-4">{searchQuery ? '🔍' : '📦'}</div>
          <p className="text-gray-600 text-lg sm:text-xl">
            {searchQuery ? `${t('noSearchResults')} "${searchQuery}"` : t('noProducts')}
          </p>
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
            >
              ← {t('clearSearch')}
            </button>
          )}
        </div>
      )}
      </div>
    </div>
    <Footer />
    </>
  );
}
