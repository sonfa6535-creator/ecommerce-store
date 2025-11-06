"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import SettingsMenu from "./SettingsMenu";
import { useApp } from "@/contexts/AppContext";

export default function Navbar() {
  const { data: session } = useSession();
  const { t } = useApp();
  const [cartCount, setCartCount] = useState(0);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    updateCartCount();
    // Listen for storage changes to update cart count
    window.addEventListener("storage", updateCartCount);
    // Also check periodically
    const interval = setInterval(updateCartCount, 1000);
    
    return () => {
      window.removeEventListener("storage", updateCartCount);
      clearInterval(interval);
    };
  }, []);

  const updateCartCount = () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      const total = Object.values(cart).reduce((sum: number, qty) => sum + (qty as number), 0);
      setCartCount(total);
    } else {
      setCartCount(0);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-white rounded-full overflow-hidden group-hover:scale-110 transition-transform shadow-lg">
              <Image 
                src="/logo.png" 
                alt="E-Commerce Store Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-lg sm:text-2xl font-bold bg-white bg-opacity-20 px-3 py-1 rounded-lg backdrop-blur-sm group-hover:bg-opacity-30 transition">
              E-Commerce Store
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link href="/" className="hover:text-blue-200 transition-all hover:scale-110 font-medium flex items-center gap-1">
              <span>🏪</span> {t('shop')}
            </Link>

            {session ? (
              <>
                <Link href="/cart" className="hover:text-blue-200 transition-all hover:scale-110 relative font-medium flex items-center gap-1">
                  <span>🛒</span> {t('cart')}
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-bounce">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <Link href="/orders" className="hover:text-blue-200 transition-all hover:scale-110 font-medium flex items-center gap-1">
                  <span>📋</span> {t('myOrders')}
                </Link>

                <Link href="/profile" className="hover:text-blue-200 transition-all hover:scale-110 font-medium flex items-center gap-1">
                  <span>👤</span> {t('profile')}
                </Link>

                {session.user.role === "admin" && (
                  <Link href="/admin" className="hover:text-blue-200 transition-all hover:scale-110 font-bold bg-white bg-opacity-20 px-3 py-2 rounded-lg backdrop-blur-sm flex items-center gap-1">
                    <span>🏛️</span> {t('adminDashboard')}
                  </Link>
                )}

                {/* Settings Menu */}
                <SettingsMenu />

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg flex items-center gap-1"
                >
                  <span>🚪</span> {t('logout')}
                </button>
              </>
            ) : (
              <>
                {/* Settings Menu for non-logged-in users */}
                <SettingsMenu />
                
                <Link href="/login" className="hover:text-blue-200 transition-all hover:scale-110 font-medium flex items-center gap-1">
                  <span>🔐</span> {t('login')}
                </Link>
                <Link
                  href="/register"
                  className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg flex items-center gap-1"
                >
                  <span>✨</span> {t('register')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`block h-0.5 w-full bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block h-0.5 w-full bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block h-0.5 w-full bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-screen pb-4' : 'max-h-0'}`}>
          <div className="flex flex-col space-y-3 pt-2">
            {/* Settings Menu - Mobile */}
            <SettingsMenu />
            
            <Link 
              href="/" 
              className="hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>🏪</span> {t('shop')}
            </Link>

            {session ? (
              <>
                <Link 
                  href="/cart" 
                  className="hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all relative font-medium flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>🛒</span> {t('cart')}
                  {cartCount > 0 && (
                    <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <Link 
                  href="/orders" 
                  className="hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>📋</span> {t('myOrders')}
                </Link>

                <Link 
                  href="/profile" 
                  className="hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>👤</span> {t('profile')}
                </Link>

                {session.user.role === "admin" && (
                  <Link 
                    href="/admin" 
                    className="bg-white bg-opacity-20 px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>🏛️</span> {t('adminDashboard')}
                  </Link>
                )}

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                >
                  <span>🚪</span> {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>🔐</span> {t('login')}
                </Link>
                <Link
                  href="/register"
                  className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>✨</span> {t('register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
