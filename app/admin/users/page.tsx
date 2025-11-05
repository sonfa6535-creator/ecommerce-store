"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  _count: {
    orders: number;
  };
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user.role !== "admin") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchUsers();
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        setMessage("User role updated successfully");
        fetchUsers();
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update user role");
      }
    } catch (error) {
      setError("An error occurred");
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage("User deleted successfully");
        fetchUsers();
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete user");
      }
    } catch (error) {
      setError("An error occurred");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 py-4 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-10 animate-slide-up">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
            👥 Manage Users
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">View and manage all user accounts</p>
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

        {/* Mobile Cards View */}
        <div className="block lg:hidden space-y-4">
          {users.map((user, index) => (
            <div 
              key={user.id} 
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover-lift animate-slide-up"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className={`p-4 ${user.role === 'admin' ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                    <span className="text-2xl">{user.role === 'admin' ? '👑' : '👤'}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{user.name || 'N/A'}</h3>
                    <p className="text-white text-opacity-90 text-sm">{user.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Role:</span>
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <option value="user">👤 User</option>
                    <option value="admin">👑 Admin</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Orders:</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-bold">{user._count.orders}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Joined:</span>
                  <span className="text-sm font-semibold">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                
                <button
                  onClick={() => deleteUser(user.id)}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2 rounded-xl hover:from-red-600 hover:to-red-700 font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span className="text-lg">🗑️</span>
                  Delete User
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">👤 Name</th>
                  <th className="px-6 py-4 text-left font-bold">📧 Email</th>
                  <th className="px-6 py-4 text-left font-bold">🎭 Role</th>
                  <th className="px-6 py-4 text-left font-bold">🛒 Orders</th>
                  <th className="px-6 py-4 text-left font-bold">📅 Joined</th>
                  <th className="px-6 py-4 text-left font-bold">⚙️ Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all animate-slide-in-left"
                    style={{animationDelay: `${index * 0.05}s`}}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          user.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'
                        }`}>
                          <span className="text-xl">{user.role === 'admin' ? '👑' : '👤'}</span>
                        </div>
                        <span className="font-semibold text-gray-800">{user.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        <option value="user">👤 User</option>
                        <option value="admin">👑 Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 px-4 py-2 rounded-full text-sm font-bold text-gray-700">
                        {user._count.orders}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700 text-sm">
                        {new Date(user.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 font-semibold transition-all shadow-md hover:shadow-lg hover:scale-105 flex items-center gap-2"
                      >
                        <span className="text-lg">🗑️</span>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-16">
              <div className="text-7xl mb-4">👥</div>
              <p className="text-gray-600 text-lg">No users found</p>
            </div>
          )}
        </div>

        {/* Empty State - Mobile */}
        {users.length === 0 && (
          <div className="lg:hidden text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="text-7xl mb-4">👥</div>
            <p className="text-gray-600">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
