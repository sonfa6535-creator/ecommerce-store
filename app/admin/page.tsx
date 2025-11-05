"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    paidOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user.role !== "admin") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchStats();
    }
  }, [status, session, router]);

  const fetchStats = async () => {
    try {
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/products"),
        fetch("/api/orders"),
      ]);

      if (usersRes.ok && productsRes.ok && ordersRes.ok) {
        const users = await usersRes.json();
        const products = await productsRes.json();
        const orders = await ordersRes.json();

        setStats({
          totalUsers: users.length,
          totalProducts: products.length,
          totalOrders: orders.length,
          pendingOrders: orders.filter((o: any) => o.status === "pending").length,
          paidOrders: orders.filter((o: any) => o.status === "paid").length,
          shippedOrders: orders.filter((o: any) => o.status === "shipped").length,
          deliveredOrders: orders.filter((o: any) => o.status === "delivered").length,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const orderStatusData = [
    { name: 'Pending', value: stats.pendingOrders, color: '#FCD34D' },
    { name: 'Paid', value: stats.paidOrders, color: '#34D399' },
    { name: 'Shipped', value: stats.shippedOrders, color: '#60A5FA' },
    { name: 'Delivered', value: stats.deliveredOrders, color: '#A78BFA' },
  ];

  const COLORS = ['#FCD34D', '#34D399', '#60A5FA', '#A78BFA'];

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-4 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-slide-up">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-2">
            🎛️ Admin Dashboard
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your e-commerce store</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 sm:p-6 rounded-2xl shadow-lg hover-lift animate-bounce-in">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-semibold opacity-90">Total Users</h3>
              <span className="text-2xl sm:text-3xl">👥</span>
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold">{stats.totalUsers}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 sm:p-6 rounded-2xl shadow-lg hover-lift animate-bounce-in" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-semibold opacity-90">Total Products</h3>
              <span className="text-2xl sm:text-3xl">📦</span>
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold">{stats.totalProducts}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 sm:p-6 rounded-2xl shadow-lg hover-lift animate-bounce-in" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-semibold opacity-90">Total Orders</h3>
              <span className="text-2xl sm:text-3xl">🛒</span>
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold">{stats.totalOrders}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 sm:p-6 rounded-2xl shadow-lg hover-lift animate-bounce-in" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-semibold opacity-90">Pending Orders</h3>
              <span className="text-2xl sm:text-3xl">⏳</span>
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold">{stats.pendingOrders}</p>
          </div>
        </div>

        {/* Charts and Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Order Status Chart */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl animate-slide-in-left hover-lift">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl sm:text-3xl mr-2">📊</span>
              Order Status Overview
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stats */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl animate-slide-in-right hover-lift">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl sm:text-3xl mr-2">⚡</span>
              Quick Stats
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                <span className="text-sm sm:text-base font-medium text-gray-700">Pending</span>
                <span className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pendingOrders}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <span className="text-sm sm:text-base font-medium text-gray-700">Paid</span>
                <span className="text-xl sm:text-2xl font-bold text-green-600">{stats.paidOrders}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <span className="text-sm sm:text-base font-medium text-gray-700">Shipped</span>
                <span className="text-xl sm:text-2xl font-bold text-blue-600">{stats.shippedOrders}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                <span className="text-sm sm:text-base font-medium text-gray-700">Delivered</span>
                <span className="text-xl sm:text-2xl font-bold text-purple-600">{stats.deliveredOrders}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Link
            href="/admin/products"
            className="group bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover-lift text-center animate-slide-up"
          >
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform">📦</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Manage Products</h3>
            <p className="text-gray-600 text-sm sm:text-base">Add, edit, or delete products</p>
          </Link>

          <Link
            href="/admin/orders"
            className="group bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover-lift text-center animate-slide-up"
            style={{animationDelay: '0.1s'}}
          >
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform">🛒</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Manage Orders</h3>
            <p className="text-gray-600 text-sm sm:text-base">View and update order status</p>
          </Link>

          <Link
            href="/admin/users"
            className="group bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover-lift text-center animate-slide-up sm:col-span-2 lg:col-span-1"
            style={{animationDelay: '0.2s'}}
          >
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform">👥</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Manage Users</h3>
            <p className="text-gray-600 text-sm sm:text-base">View and manage user accounts</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
