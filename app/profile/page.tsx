"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useApp();
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    avatar: string;
    role?: string;
    createdAt?: string;
  }>({ name: "", email: "", avatar: "" });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile({ name: data.name || "", email: data.email, avatar: data.avatar || "" });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name, avatar: profile.avatar }),
      });

      if (response.ok) {
        setMessage("Profile updated successfully");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError("Failed to update profile");
      }
    } catch (error) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setProfile({ ...profile, avatar: data.url });
        setMessage("Image uploaded successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError(data.error || "Failed to upload image");
      }
    } catch (error) {
      setError("An error occurred while uploading");
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Password changed successfully");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setError(data.error || "Failed to change password");
      }
    } catch (error) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 py-4 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-10 animate-slide-up">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
            👤 My Profile
          </h1>
          <p className="text-gray-600 dark:text-white text-sm sm:text-base">Manage your account settings</p>
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

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Update Profile Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 animate-slide-in-left hover-lift">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-3xl">📝</span>
              Update Profile
            </h2>

            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-gradient-to-r from-indigo-500 to-purple-500 shadow-xl group-hover:scale-105 transition-transform">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                      <span className="text-6xl sm:text-7xl text-white">👤</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-semibold">
                    Change Photo
                  </span>
                </div>
              </div>
              
              <label className="mt-4 cursor-pointer">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center gap-2 text-sm sm:text-base">
                  <span className="text-lg sm:text-xl">📷</span>
                  Upload Photo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Email Field */}
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-white font-bold mb-2 flex items-center gap-2 text-sm sm:text-base">
                <span className="text-lg sm:text-xl">📧</span>
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 text-sm sm:text-base"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Name Field */}
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-white font-bold mb-2 flex items-center gap-2 text-sm sm:text-base">
                <span className="text-lg sm:text-xl">✏️</span>
                Name
              </label>
              <input
                type="text"
                value={profile.name || ""}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-800 font-medium transition-all hover:border-indigo-300 text-sm sm:text-base"
                placeholder="Enter your name"
              />
            </div>

            {/* Update Button */}
            <button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 sm:py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 font-bold text-base sm:text-lg transition-all shadow-lg hover:shadow-2xl hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <span className="text-xl sm:text-2xl">💾</span>
                  Update Profile
                </>
              )}
            </button>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 animate-slide-in-right hover-lift">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-3xl">🔐</span>
              Change Password
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-gray-700 dark:text-white font-bold mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <span className="text-lg sm:text-xl">🔑</span>
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-800 font-medium transition-all hover:border-indigo-300 text-sm sm:text-base"
                  placeholder="Enter current password"
                  required
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-gray-700 dark:text-white font-bold mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <span className="text-lg sm:text-xl">🆕</span>
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-800 font-medium transition-all hover:border-indigo-300 text-sm sm:text-base"
                  placeholder="Enter new password"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-gray-700 dark:text-white font-bold mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <span className="text-lg sm:text-xl">✅</span>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-800 font-medium transition-all hover:border-indigo-300 text-sm sm:text-base"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              {/* Security Tips */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200">
                <p className="text-xs sm:text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-base sm:text-lg">💡</span>
                  <span>
                    <strong>Security Tips:</strong> Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.
                  </span>
                </p>
              </div>

              {/* Change Password Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 sm:py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 font-bold text-base sm:text-lg transition-all shadow-lg hover:shadow-2xl hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Changing...
                  </>
                ) : (
                  <>
                    <span className="text-xl sm:text-2xl">🔒</span>
                    Change Password
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Account Info */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 sm:p-8 animate-slide-up" style={{animationDelay: '0.3s'}}>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">ℹ️</span>
            Account Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Account Type</p>
              <p className="text-lg font-bold text-indigo-600 capitalize flex items-center gap-2">
                {profile.role === 'admin' ? '👑' : '👤'}
                {profile.role}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Member Since</p>
              <p className="text-lg font-bold text-purple-600">
                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
