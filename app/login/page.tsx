"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/contexts/AppContext";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md">
        {/* Animated Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="text-6xl sm:text-7xl mb-4 animate-bounce-in">🔐</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            {t('welcomeBack')}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">{t('loginAccount')}</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 animate-scale-in hover-lift">
          {searchParams.get("registered") && (
            <div className="mb-6 bg-gradient-to-r from-green-400 to-green-500 text-white px-4 py-3 rounded-xl shadow-lg animate-bounce-in">
              <p className="flex items-center text-sm">
                <span className="text-xl mr-2">✅</span>
                Registration successful! Please login.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-gradient-to-r from-red-400 to-red-500 text-white px-4 py-3 rounded-xl shadow-lg animate-bounce-in">
              <p className="flex items-center text-sm">
                <span className="text-xl mr-2">❌</span>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="animate-slide-in-left" style={{animationDelay: '0.1s'}}>
              <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2 text-sm sm:text-base">
                <span className="text-lg sm:text-xl">📧</span>
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-800 font-medium transition-all hover:border-blue-300 text-sm sm:text-base"
                placeholder={t('enterEmail')}
                required
              />
            </div>

            {/* Password Field */}
            <div className="animate-slide-in-right" style={{animationDelay: '0.2s'}}>
              <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2 text-sm sm:text-base">
                <span className="text-lg sm:text-xl">🔒</span>
                {t('password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-800 font-medium transition-all hover:border-blue-300 text-sm sm:text-base"
                  placeholder={t('enterPassword')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-all hover:scale-110"
                >
                  {showPassword ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="animate-slide-up" style={{animationDelay: '0.3s'}}>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 font-bold text-base sm:text-lg transition-all shadow-lg hover:shadow-2xl hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Logging in...
                  </>
                ) : (
                  <>
                    <span className="text-xl sm:text-2xl">🚀</span>
                    {t('login')}
                  </>
                )}
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center pt-4 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <p className="text-gray-600 text-sm sm:text-base">
                {t('noAccount')}{" "}
                <Link href="/register" className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-all">
                  {t('registerHere')}
                </Link>
              </p>
            </div>
          </form>

          {/* Admin Login Info */}
          <div className="mt-6 pt-6 border-t border-gray-200 animate-fade-in" style={{animationDelay: '0.5s'}}>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
              <p className="text-xs sm:text-sm text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <span className="text-lg">👑</span>
                Admin Login:
              </p>
              <p className="text-xs text-gray-600">Email: <span className="font-mono font-bold">admin001@gmail.com</span></p>
              <p className="text-xs text-gray-600">Password: <span className="font-mono font-bold">admin123</span></p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 pt-6 border-t border-gray-200 animate-fade-in" style={{animationDelay: '0.6s'}}>
            <div className="flex items-center justify-center gap-6 text-xs sm:text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <span className="text-base sm:text-lg">🔒</span>
                Secure
              </span>
              <span className="flex items-center gap-1">
                <span className="text-base sm:text-lg">⚡</span>
                Fast
              </span>
              <span className="flex items-center gap-1">
                <span className="text-base sm:text-lg">✅</span>
                Trusted
              </span>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-8 grid grid-cols-3 gap-4 animate-slide-up" style={{animationDelay: '0.7s'}}>
          <div className="bg-white rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all hover-lift">
            <div className="text-3xl mb-2">🛍️</div>
            <p className="text-xs font-semibold text-gray-700">Shop Now</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all hover-lift">
            <div className="text-3xl mb-2">💳</div>
            <p className="text-xs font-semibold text-gray-700">Easy Pay</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all hover-lift">
            <div className="text-3xl mb-2">📦</div>
            <p className="text-xs font-semibold text-gray-700">Track Order</p>
          </div>
        </div>
      </div>
    </div>
  );
}
