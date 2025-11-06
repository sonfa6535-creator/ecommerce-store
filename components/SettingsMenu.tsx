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
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          {/* Theme Toggle */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-2">Theme</h3>
            <button
              onClick={() => {
                toggleTheme();
                setIsOpen(false);
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-medium transition-colors"
            >
              {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </button>
          </div>

          {/* Language Selection */}
          <div className="p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-2">Language</h3>
            <div className="space-y-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as any);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    language === lang.code
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
