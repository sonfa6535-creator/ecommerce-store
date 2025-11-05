import Link from "next/link";
import { useApp } from "@/contexts/AppContext";

export default function Footer() {
  const { t } = useApp();
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div className="animate-slide-in-left">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🛍️</span>
              {t('aboutUs')}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t('aboutDesc')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="animate-slide-in-left" style={{animationDelay: '0.1s'}}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-xl">🔗</span>
              {t('quickLinks')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block">
                  → {t('shopProducts')}
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block">
                  → {t('myOrders')}
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block">
                  → {t('profile')}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block">
                  → {t('cart')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="animate-slide-in-right" style={{animationDelay: '0.2s'}}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-xl">💬</span>
              {t('customerService')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-300 flex items-center gap-2">
                <span>📧</span>
                {t('supportEmail')}
              </li>
              <li className="text-gray-300 flex items-center gap-2">
                <span>📞</span>
                {t('phone')}: +855 12 345 678
              </li>
              <li className="text-gray-300 flex items-center gap-2">
                <span>⏰</span>
                {t('businessHours')}
              </li>
              <li className="text-gray-300 flex items-center gap-2">
                <span>🌍</span>
                {t('worldwideShipping')}
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="animate-slide-in-right" style={{animationDelay: '0.3s'}}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-xl">✨</span>
              {t('whyShopUs')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-300 flex items-center gap-2">
                <span>✅</span>
                {t('securePayments')}
              </li>
              <li className="text-gray-300 flex items-center gap-2">
                <span>🚚</span>
                {t('freeShipping')}
              </li>
              <li className="text-gray-300 flex items-center gap-2">
                <span>↩️</span>
                {t('easyReturns')}
              </li>
              <li className="text-gray-300 flex items-center gap-2">
                <span>⭐</span>
                {t('qualityGuaranteed')}
              </li>
            </ul>
          </div>
        </div>

        {/* Map Section */}
        <div className="mb-8 animate-fade-in">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">📍</span>
            {t('ourLocation')}
          </h3>
          <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white border-opacity-10">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959142.7424929775!2d102.51734047656251!3d12.565679399999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310787bfd4dc3743%3A0x1a68d75f88ce81d!2sCambodia!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale hover:grayscale-0 transition-all duration-500"
            ></iframe>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Social Media */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">{t('followUs')}</span>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full flex items-center justify-center transition-all hover:scale-110">
                  <span className="text-xl">📘</span>
                </a>
                <a href="#" className="w-10 h-10 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full flex items-center justify-center transition-all hover:scale-110">
                  <span className="text-xl">📷</span>
                </a>
                <a href="#" className="w-10 h-10 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full flex items-center justify-center transition-all hover:scale-110">
                  <span className="text-xl">🐦</span>
                </a>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-sm text-gray-400 text-center sm:text-right">
              <p>© 2025 {t('copyright')}</p>
              <p className="mt-1">{t('madeWithLove')}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
