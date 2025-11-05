"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";

export default function SettingsMenu() {
  const { language, setLanguage, theme, toggleTheme, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "km", name: "ភាសាខ្មែរ", flag: "🇰🇭" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
  ];

  return (
    <div className="relative">
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2 w-full lg:w-auto lg:p-2"
      >
        <span className="text-2xl">⚙️</span>
        <span className="lg:hidden">Settings</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in">
            {/* Theme Toggle */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span className="text-lg">🎨</span>
                Theme
              </h3>
              <button
                onClick={toggleTheme}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-4 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3"
              >
                <span className="text-2xl">{theme === "light" ? "🌙" : "☀️"}</span>
                <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
              </button>
            </div>

            {/* Language Selection */}
            <div className="p-4">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span className="text-lg">🌍</span>
                Language
              </h3>
              <div className="space-y-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as any);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-3 ${
                      language === lang.code
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="flex-1 text-left">{lang.name}</span>
                    {language === lang.code && <span className="text-xl">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
