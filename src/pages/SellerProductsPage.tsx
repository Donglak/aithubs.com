import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  ChevronDown,
  ArrowUpDown,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { sellerApi, Product } from '../../lib/seller';
import { cn } from '../../utils/cn';

const statusOptions = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'draft', label: 'Nháp' },
  { value: 'pending_review', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Bị từ chối' },
  { value: 'archived', label: 'Lưu kho' },
];

const typeOptions = [
  { value: '', label: 'Tất cả loại' },
  { value: 'ebook', label: 'Ebook' },
  { value: 'course', label: 'Khóa học' },
  { value: 'template', label: 'Template' },
  { value: 'software', label: 'Phần mềm' },
];

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'sales', label: 'Bán chạy nhất' },
];

function StatusBadge({ status }: { status: Product['status'] }) {
  const styles = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    pending_review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    archived: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 line-through',
  };

  const labels = {
    draft: 'Nháp',
    pending_review: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Bị từ chối',
    archived: 'Lưu kho',
  };

  const icons = {
    draft: <FileText className="w-3 h-3" />,
    pending_review: <Clock className="w-3 h-3" />,
    approved: <CheckCircle className="w-3 h-3" />,
    rejected: <XCircle className="w-3 h-3" />,
    archived: <FileText className="w-3 h-3" />,
  };

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', styles[status])}>
      {icons[status]}
      {labels[status]}
    </span>
  );
}

function TypeBadge({ type }: { type: Product['product_type'] }) {
  const styles = {
    ebook: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    course: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    template: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    software: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };

  const labels = {
    ebook: 'Ebook',
    course: 'Khóa học',
    template: 'Template',
    software: 'Phần mềm',
  };

  return (
    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', styles[type])}>
      {labels[type]}
    </span>
  );
}

function ProductRow({ product, onEdit, onDelete, onView }: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}) {
  const coverUrl = product.cover_image || 'https://via.placeholder.com/60x80?text=No+Cover';

  return (
    <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <img
            src={coverUrl}
            alt={product.title}
            className="w-12 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
            loading="lazy"
          />
          <div className="min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{product.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
              {product.short_description || product.description?.slice(0, 80) + '...'}
            </p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <TypeBadge type={product.product_type} />
      </td>
      <td className="py-4 px-4 hidden md:table-cell">
        <StatusBadge status={product.status} />
      </td>
      <td className="py-4 px-4 text-right font-medium text-gray-900 dark:text-white">
        {product.price === 0 ? (
          <span className="text-green-600 dark:text-green-400 font-semibold">Miễn phí</span>
        ) : (
          `$${product.price.toLocaleString()}`
        )}
      </td>
      <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-400">
        {product.sales_count || 0}
      </td>
      <td className="py-4 px-4 text-center">
        <div className="flex items-center justify-center gap-1 text-yellow-500">
          <FileText className="w-3 h-3 fill-current" />
          {(product.rating_avg || 0).toFixed(1)}
        </div>
      </td>
      <td className="py-4 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onView}
            className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={`Xem ${product.title}`}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={`Chỉnh sửa ${product.title}`}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={`Xóa ${product.title}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function SellerProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error, count } = await sellerApi.getProducts({
      status: statusFilter || undefined,
      page,
      limit: pageSize,
      search: searchQuery || undefined,
    });
    if (!error) {
      setProducts(data);
      setTotalCount(count);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [page, statusFilter, typeFilter, searchQuery, sortBy]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    setDeletingId(id);
    const { error } = await sellerApi.deleteProduct(id);
    if (!error) {
      setProducts(prev => prev.filter(p => p.id !== id));
      setTotalCount(prev => prev - 1);
    } else {
      alert('Lỗi khi xóa: ' + error.message);
    }
    setDeletingId(null);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý sản phẩm</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Tạo, chỉnh sửa và quản lý các sản phẩm số của bạn
          </p>
        </div>
        <Link
          to="/seller/products/new"
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm sản phẩm mới
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="search"
              placeholder="Tìm kiếm theo tên, mô tả..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer min-w-[180px]"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer min-w-[160px]"
          >
            {typeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer min-w-[160px]"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading && products.length === 0 ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Chưa có sản phẩm nào
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Hãy tạo sản phẩm đầu tiên của bạn để bắt đầu bán hàng
            </p>
            <Link
              to="/seller/products/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              Tạo sản phẩm mới
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sản phẩm</th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Loại</th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Trạng thái</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Giá</th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lượt bán</th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Đánh giá</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      onEdit={() => window.location.href = `/seller/products/${product.id}/edit`}
                      onDelete={() => handleDelete(product.id)}
                      onView={() => window.open(`/products/${product.slug}`, '_blank')}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Hiển thị {products.length} / {totalCount} sản phẩm
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5) {
                        if (page <= 3) pageNum = i + 1;
                        else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={cn(
                            'w-8 h-8 text-sm font-medium rounded-lg transition-colors',
                            page === pageNum
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}