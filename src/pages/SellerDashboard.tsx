import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Star,
  Clock,
  ArrowRight,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  href?: string;
}

function StatCard({ title, value, change, changeType, icon, href }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <p className={cn(
              'text-sm mt-1 flex items-center gap-1',
              changeType === 'positive' ? 'text-green-600 dark:text-green-400' :
              changeType === 'negative' ? 'text-red-600 dark:text-red-400' :
              'text-gray-500 dark:text-gray-500'
            )}>
              <TrendingUp className={cn('w-3 h-3', changeType === 'negative' && 'rotate-180')} />
              {change}
            </p>
          )}
        </div>
        <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400">
          {icon}
        </div>
      </div>
      {href && (
        <Link
          to={href}
          className="mt-4 block text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
        >
          Xem chi tiết <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

interface RecentOrderProps {
  id: string;
  product: string;
  buyer: string;
  amount: number;
  status: 'pending' | 'completed' | 'refunded' | 'cancelled';
  date: string;
}

function RecentOrderRow({ id, product, buyer, amount, status, date }: RecentOrderProps) {
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    refunded: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const statusLabels = {
    pending: 'Chờ xử lý',
    completed: 'Hoàn tất',
    refunded: 'Đã hoàn tiền',
    cancelled: 'Đã hủy',
  };

  return (
    <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="py-3 px-4">
        <div className="font-medium text-gray-900 dark:text-white">#{id.slice(0, 8)}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{date}</div>
      </td>
      <td className="py-3 px-4">
        <div className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{product}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Khách: {buyer}</div>
      </td>
      <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
        ${amount.toLocaleString()}
      </td>
      <td className="py-3 px-4">
        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', statusStyles[status])}>
          {statusLabels[status]}
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400" aria-label="Xem đơn hàng">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

interface TopProductProps {
  name: string;
  sales: number;
  revenue: number;
  rating: number;
  status: 'approved' | 'pending' | 'rejected' | 'draft';
}

function TopProductRow({ name, sales, revenue, rating, status }: TopProductProps) {
  const statusIcons = {
    approved: <CheckCircle className="w-4 h-4 text-green-500" />,
    pending: <Clock className="w-4 h-4 text-yellow-500" />,
    rejected: <XCircle className="w-4 h-4 text-red-500" />,
    draft: <FileText className="w-4 h-4 text-gray-500" />,
  };

  const statusLabels = {
    approved: 'Đã duyệt',
    pending: 'Chờ duyệt',
    rejected: 'Bị từ chối',
    draft: 'Nháp',
  };

  return (
    <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="py-3 px-4">
        <div className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{name}</div>
      </td>
      <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">{sales}</td>
      <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">${revenue.toLocaleString()}</td>
      <td className="py-3 px-4 text-center">
        <div className="flex items-center justify-center gap-1 text-yellow-500">
          <Star className="w-4 h-4 fill-current" />
          {rating.toFixed(1)}
        </div>
      </td>
      <td className="py-3 px-4 text-center">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
          {statusIcons[status]}
          {statusLabels[status]}
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400" aria-label="Chỉnh sửa">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400" aria-label="Xóa">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function SellerDashboard() {
  // Mock data - replace with real API calls
  const stats = [
    { title: 'Tổng sản phẩm', value: 12, change: '+3', changeType: 'positive' as const, icon: <Package className="w-6 h-6" />, href: '/seller/products' },
    { title: 'Đơn hàng tháng này', value: 47, change: '+12%', changeType: 'positive' as const, icon: <ShoppingBag className="w-6 h-6" />, href: '/seller/orders' },
    { title: 'Doanh thu tháng này', value: '$2,847', change: '+23%', changeType: 'positive' as const, icon: <DollarSign className="w-6 h-6" />, href: '/seller/payouts' },
    { title: 'Đánh giá trung bình', value: '4.8', change: '+0.2', changeType: 'positive' as const, icon: <Star className="w-6 h-6 fill-current" />, href: '/seller/reviews' },
  ];

  const recentOrders = [
    { id: 'ord_abc123', product: 'Complete Guide to AI Tools', buyer: 'nguyenvan...@gmail.com', amount: 29.99, status: 'completed' as const, date: '2024-06-28 14:30' },
    { id: 'ord_def456', product: 'Digital Marketing Mastery', buyer: 'tranthib...@yahoo.com', amount: 49.99, status: 'completed' as const, date: '2024-06-28 10:15' },
    { id: 'ord_ghi789', product: 'Web Development Course', buyer: 'lehoang...@outlook.com', amount: 99.00, status: 'pending' as const, date: '2024-06-28 09:45' },
    { id: 'ord_jkl012', product: 'Photography Fundamentals', buyer: 'phamvan...@gmail.com', amount: 0, status: 'completed' as const, date: '2024-06-27 16:20' },
    { id: 'ord_mno345', product: 'Data Science with Python', buyer: 'vothi...@gmail.com', amount: 39.99, status: 'refunded' as const, date: '2024-06-27 11:10' },
  ];

  const topProducts = [
    { name: 'Complete Guide to AI Tools', sales: 156, revenue: 4680, rating: 4.8, status: 'approved' as const },
    { name: 'Digital Marketing Mastery', sales: 89, revenue: 4450, rating: 4.6, status: 'approved' as const },
    { name: 'Web Development Complete Course', sales: 234, revenue: 23166, rating: 4.9, status: 'approved' as const },
    { name: 'Business Strategy for Startups', sales: 45, revenue: 1350, rating: 4.7, status: 'pending' as const },
    { name: 'Photography Fundamentals', sales: 67, revenue: 0, rating: 4.5, status: 'approved' as const },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bảng điều khiển</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Tổng quan hiệu suất bán hàng của bạn</p>
        </div>
        <div className="flex gap-3">
          <Link to="/seller/products/new" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" />
            Thêm sản phẩm
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts & Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Đơn hàng gần đây</h2>
            <Link to="/seller/orders" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mã đơn</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sản phẩm</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Doanh thu</th>
                  <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <RecentOrderRow key={order.id} {...order} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sản phẩm bán chạy nhất</h2>
            <Link to="/seller/products" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sản phẩm</th>
                  <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lượt bán</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Doanh thu</th>
                  <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Đánh giá</th>
                  <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <TopProductRow key={index} {...product} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Thao tác nhanh</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/seller/products/new" className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 transition-colors text-center group">
            <div className="w-12 h-12 mx-auto mb-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
              <Plus className="w-6 h-6 text-primary-600 dark:text-primary-400 group-hover:text-white" />
            </div>
            <p className="font-medium text-gray-900 dark:text-white">Tạo sản phẩm mới</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ebook, khóa học, template...</p>
          </Link>
          <Link to="/seller/payouts" className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 transition-colors text-center group">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400 group-hover:text-white" />
            </div>
            <p className="font-medium text-gray-900 dark:text-white">Rút tiền</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">$1,234.56 sẵn sàng rút</p>
          </Link>
          <Link to="/seller/analytics" className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 transition-colors text-center group">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-white" />
            </div>
            <p className="font-medium text-gray-900 dark:text-white">Xem phân tích</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Biểu đồ doanh thu, traffic</p>
          </Link>
          <Link to="/seller/settings" className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 transition-colors text-center group">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center group-hover:bg-gray-600 group-hover:text-white transition-colors">
              <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-white" />
            </div>
            <p className="font-medium text-gray-900 dark:text-white">Cài đặt tài khoản</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Hồ sơ, thanh toán, thông báo</p>
          </Link>
        </div>
      </div>
    </div>
  );
}