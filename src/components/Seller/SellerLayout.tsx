import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  DollarSign,
  Settings,
  Star,
  LogOut,
  ChevronLeft,
  UserPlus,
  Bell,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { sellerApi, Seller } from '../../lib/seller';
import { cn } from '../../utils/cn';

const navigation = [
  { name: 'Tổng quan', href: '/seller/dashboard', icon: LayoutDashboard },
  { name: 'Sản phẩm', href: '/seller/products', icon: Package },
  { name: 'Đơn hàng', href: '/seller/orders', icon: ShoppingBag },
  { name: 'Phân tích', href: '/seller/analytics', icon: BarChart3 },
  { name: 'Thu nhập', href: '/seller/payouts', icon: DollarSign },
  { name: 'Đánh giá', href: '/seller/reviews', icon: Star },
  { name: 'Cài đặt', href: '/seller/settings', icon: Settings },
];

export function SellerLayout() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [sellerLoading, setSellerLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      loadSellerProfile();
    } else if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const loadSellerProfile = async () => {
    setSellerLoading(true);
    const { data, error } = await sellerApi.getProfile();
    if (!error && data) {
      setSeller(data);
    } else if (error && error !== 'Not authenticated') {
      // Not a seller yet, redirect to apply
      navigate('/seller/apply');
    }
    setSellerLoading(false);
  };

  if (authLoading || sellerLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;
  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-6">
              <UserPlus className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Chưa có tài khoản người bán
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Đăng ký để bắt đầu bán sản phẩm số trên DigitalToolsHub
              </p>
            </div>
            <button
              onClick={() => navigate('/seller/apply')}
              className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
            >
              Đăng ký làm người bán
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Seller dashboard navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white">Seller Hub</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">DigitalToolsHub</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                {seller.status === 'approved' ? 'Đã duyệt' : seller.status === 'pending' ? 'Chờ duyệt' : 'Bị từ chối'}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Main navigation">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 px-3 py-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                {seller.avatar_url ? (
                  <img src={seller.avatar_url} alt="" className="w-full h-full rounded-full" />
                ) : (
                  <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {seller.display_name || 'Chưa đặt tên'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button className="text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                Hồ sơ
              </button>
              <button className="text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                Thông báo
              </button>
              <button
                onClick={() => signOut()}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 relative" aria-label="Notifications">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
                <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="font-medium text-gray-900 dark:text-white">$1,234.56</span>
                <span className="text-xs text-green-600 dark:text-green-400">+12.5%</span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-4 sm:p-6 lg:p-8" id="main-content" tabIndex={-1}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}