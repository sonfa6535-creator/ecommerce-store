"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  images?: string; // JSON string of image array
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    params.then((p) => {
      setProductId(p.id);
      fetchProduct(p.id);
    });
  }, []);

  // Auto-slide images every 4 seconds
  useEffect(() => {
    if (productImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [productImages]);

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        
        // Parse images array
        const images: string[] = [];
        if (data.image) images.push(data.image);
        if (data.images) {
          try {
            const parsedImages = JSON.parse(data.images);
            images.push(...parsedImages);
          } catch (e) {
            console.error("Failed to parse images");
          }
        }
        setProductImages(images.length > 0 ? images : ["https://via.placeholder.com/500"]);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
    
    // Fetch related products
    fetchRelatedProducts(id);
  };

  const fetchRelatedProducts = async (currentProductId: string) => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const allProducts = await response.json();
        // Filter out current product and get random 4 products
        const others = allProducts.filter((p: Product) => p.id !== currentProductId);
        const shuffled = others.sort(() => 0.5 - Math.random());
        setRelatedProducts(shuffled.slice(0, 4));
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleAddToCart = () => {
    if (!session) {
      // Silent fail - no message shown
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    if (!product) return;

    const savedCart = localStorage.getItem("cart");
    const cart = savedCart ? JSON.parse(savedCart) : {};
    
    cart[product.id] = (cart[product.id] || 0) + quantity;
    localStorage.setItem("cart", JSON.stringify(cart));
    
    // Silent operation - no message shown
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center py-8 px-4">
        <div className="text-center bg-white rounded-3xl p-8 sm:p-12 shadow-2xl max-w-md animate-bounce-in">
          <div className="text-7xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            🏪 Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 py-4 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6 animate-slide-in-left">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold transition-all hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to shop
          </Link>
        </div>

        {/* Product Detail Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Product Image Gallery */}
            <div className="relative bg-gradient-to-br from-indigo-100 to-purple-100 p-6 sm:p-12 flex items-center justify-center animate-scale-in">
              <div className="relative w-full max-w-lg">
                {/* Main Image */}
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  <img
                    src={productImages[currentImageIndex]}
                    alt={product?.name}
                    className="w-full h-[400px] sm:h-[500px] object-cover transition-all duration-500"
                  />
                  
                  {product?.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg sm:text-xl shadow-xl">
                        🚫 Out of Stock
                      </span>
                    </div>
                  )}

                  {/* Navigation Arrows */}
                  {productImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 sm:p-3 shadow-lg transition-all hover:scale-110"
                      >
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 sm:p-3 shadow-lg transition-all hover:scale-110"
                      >
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  {productImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      {currentImageIndex + 1} / {productImages.length}
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {productImages.length > 1 && (
                  <div className="mt-4 flex gap-2 sm:gap-3 overflow-x-auto pb-2">
                    {productImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-4 transition-all hover:scale-105 ${
                          index === currentImageIndex
                            ? 'border-indigo-600 shadow-lg'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-6 sm:p-12 flex flex-col justify-center animate-slide-in-right">
              {/* Product Name */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mb-6">
                <p className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  ${product.price.toFixed(2)}
                </p>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  Description
                </h2>
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Stock */}
              <div className="mb-8">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📦</span>
                  {product.stock > 0 ? (
                    <span className="text-green-600 font-bold text-lg">
                      In Stock ({product.stock} available)
                    </span>
                  ) : (
                    <span className="text-red-600 font-bold text-lg">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="block text-gray-700 font-bold mb-3 flex items-center gap-2 text-base sm:text-lg">
                  <span className="text-xl sm:text-2xl">🔢</span>
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full hover:from-gray-300 hover:to-gray-400 transition-all font-bold text-xl text-gray-700 flex items-center justify-center shadow-md hover:scale-110"
                  >
                    −
                  </button>
                  <span className="w-20 text-center text-2xl sm:text-3xl font-bold text-gray-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full hover:from-indigo-600 hover:to-purple-600 transition-all font-bold text-xl disabled:from-gray-300 disabled:to-gray-400 flex items-center justify-center shadow-md hover:scale-110 disabled:hover:scale-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || !session}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 sm:py-5 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 font-bold text-lg sm:text-xl transition-all shadow-lg hover:shadow-2xl hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-3 mb-4"
              >
                {product.stock === 0 ? (
                  <>
                    <span className="text-2xl">🚫</span>
                    Out of Stock
                  </>
                ) : !session ? (
                  <>
                    <span className="text-2xl">🔐</span>
                    Login to Purchase
                  </>
                ) : (
                  <>
                    <span className="text-2xl">🛒</span>
                    Add to Cart
                  </>
                )}
              </button>

              {/* Login Prompt */}
              {!session && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200 animate-pulse-slow">
                  <p className="text-sm text-gray-700 text-center">
                    Please{" "}
                    <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline">
                      login
                    </Link>
                    {" "}to add items to your cart
                  </p>
                </div>
              )}

              {/* Features */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                    <div className="text-3xl mb-2">🚚</div>
                    <p className="text-xs font-semibold text-gray-700">Free Shipping</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                    <div className="text-3xl mb-2">🔒</div>
                    <p className="text-xs font-semibold text-gray-700">Secure Payment</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                    <div className="text-3xl mb-2">✅</div>
                    <p className="text-xs font-semibold text-gray-700">Quality Guaranteed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="mt-8 text-center animate-slide-up" style={{animationDelay: '0.3s'}}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white text-gray-800 px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-gray-100 font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 border-2 border-gray-200"
          >
            <span className="text-xl sm:text-2xl">🏪</span>
            Continue Shopping
          </Link>
        </div>

        {/* Related Products / More Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 animate-slide-up" style={{animationDelay: '0.5s'}}>
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="text-3xl sm:text-4xl">🛍️</span>
                More Products You Might Like
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/product/${relatedProduct.id}`}
                    className="group bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-105"
                  >
                    {/* Product Image */}
                    <div className="relative h-48 sm:h-56 bg-white overflow-hidden">
                      <img
                        src={relatedProduct.image || "https://via.placeholder.com/300"}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {relatedProduct.stock === 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            🚫 Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-2 text-base sm:text-lg line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                          ${relatedProduct.price.toFixed(2)}
                        </span>
                        {relatedProduct.stock > 0 && (
                          <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                            <span>📦</span>
                            {relatedProduct.stock}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
