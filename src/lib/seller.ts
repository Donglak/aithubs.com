import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Seller {
  id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  social_links: Record<string, string> | null;
  status: 'pending' | 'approved' | 'rejected';
  commission_rate: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string | null;
  cover_image: string | null;
  preview_images: string[];
  price: number;
  compare_at_price: number | null;
  product_type: 'ebook' | 'course' | 'template' | 'software';
  category_id: string | null;
  tags: string[];
  file_url: string | null;
  file_size: number | null;
  file_type: string | null;
  preview_url: string | null;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived';
  seo_title: string | null;
  seo_description: string | null;
  sales_count: number;
  rating_avg: number;
  review_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  category?: Category;
  files?: ProductFile[];
  seller?: Seller;
}

export interface ProductFile {
  id: string;
  product_id: string;
  name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  sort_order: number;
  is_preview: boolean;
}

export interface Order {
  id: string;
  buyer_id: string;
  status: 'pending' | 'paid' | 'completed' | 'refunded' | 'cancelled';
  subtotal: number;
  platform_fee: number;
  total: number;
  payment_intent_id: string | null;
  payment_method: string | null;
  created_at: string;
  completed_at: string | null;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  seller_id: string;
  price: number;
  commission_rate: number;
  seller_earnings: number;
  platform_earnings: number;
  download_expires_at: string | null;
  download_count: number;
  product?: Product;
}

export interface Review {
  id: string;
  product_id: string;
  buyer_id: string;
  order_item_id: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parent_id: string | null;
  sort_order: number;
}

// Seller API
export const sellerApi = {
  // Get current seller profile
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .eq('id', user.id)
      .single();

    return { data, error };
  },

  // Apply to become seller
  async apply(profile: Partial<Seller>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('sellers')
      .insert({ id: user.id, ...profile })
      .select()
      .single();

    return { data, error };
  },

  // Update seller profile
  async updateProfile(updates: Partial<Seller>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('sellers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();

    return { data, error };
  },

  // Products
  async getProducts(filters?: {
    status?: Product['status'];
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: 'Not authenticated', count: 0 };

    let query = supabase
      .from('products')
      .select('*, category:categories(*)', { count: 'exact' })
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }
    if (filters?.page && filters?.limit) {
      const from = (filters.page - 1) * filters.limit;
      const to = from + filters.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;
    return { data: data || [], error, count: count || 0 };
  },

  async getProduct(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), files:product_files(*)')
      .eq('id', id)
      .single();

    return { data, error };
  },

  async createProduct(product: Omit<Product, 'id' | 'seller_id' | 'created_at' | 'updated_at' | 'sales_count' | 'rating_avg' | 'review_count'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const slug = product.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

    const { data, error } = await supabase
      .from('products')
      .insert({ ...product, seller_id: user.id, slug })
      .select()
      .single();

    return { data, error };
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('seller_id', user.id)
      .select()
      .single();

    return { data, error };
  },

  async deleteProduct(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('seller_id', user.id);

    return { error };
  },

  async submitForReview(id: string) {
    return this.updateProduct(id, { status: 'pending_review' });
  },

  // File uploads
  async uploadProductFile(productId: string, file: File, isPreview = false) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-files')
      .upload(fileName, file, { upsert: false });

    if (uploadError) return { data: null, error: uploadError };

    const { data: fileData, error: fileError } = await supabase
      .from('product_files')
      .insert({
        product_id: productId,
        name: file.name,
        file_url: uploadData.path,
        file_size: file.size,
        file_type: file.type,
        is_preview: isPreview,
      })
      .select()
      .single();

    return { data: fileData, error: fileError };
  },

  async deleteProductFile(fileId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    // Get file info first
    const { data: fileData } = await supabase
      .from('product_files')
      .select('file_url, product_id')
      .eq('id', fileId)
      .single();

    if (fileData) {
      // Delete from storage
      await supabase.storage.from('product-files').remove([fileData.file_url]);

      // Delete from db
      await supabase.from('product_files').delete().eq('id', fileId);
    }

    return { error: null };
  },

  // Orders
  async getOrders(filters?: { status?: Order['status']; page?: number; limit?: number }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: 'Not authenticated', count: 0 };

    let query = supabase
      .from('order_items')
      .select(`
        *,
        order:orders(*),
        product:products(*)
      `, { count: 'exact' })
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false, referencedTable: 'orders' });

    if (filters?.status) {
      query = query.eq('order.status', filters.status);
    }
    if (filters?.page && filters?.limit) {
      const from = (filters.page - 1) * filters.limit;
      const to = from + filters.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;
    return { data: data || [], error, count: count || 0 };
  },

  // Analytics
  async getAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data: orders } = await supabase
      .from('order_items')
      .select(`
        price,
        seller_earnings,
        created_at,
        product:products(title)
      `)
      .eq('seller_id', user.id)
      .gte('created_at', since);

    const { data: products } = await supabase
      .from('products')
      .select('id, title, sales_count, rating_avg, status')
      .eq('seller_id', user.id);

    const totalRevenue = orders?.reduce((sum, o) => sum + (o.seller_earnings || 0), 0) || 0;
    const totalOrders = orders?.length || 0;
    const totalProducts = products?.length || 0;
    const publishedProducts = products?.filter(p => p.status === 'approved').length || 0;

    // Sales by day
    const salesByDay: Record<string, { revenue: number; orders: number }> = {};
    orders?.forEach(o => {
      const day = o.created_at.split('T')[0];
      if (!salesByDay[day]) salesByDay[day] = { revenue: 0, orders: 0 };
      salesByDay[day].revenue += o.seller_earnings || 0;
      salesByDay[day].orders += 1;
    });

    // Top products
    const topProducts = products
      ?.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
      .slice(0, 5) || [];

    return {
      data: {
        summary: {
          totalRevenue,
          totalOrders,
          totalProducts,
          publishedProducts,
          avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        },
        salesByDay: Object.entries(salesByDay).map(([date, data]) => ({ date, ...data })),
        topProducts,
      },
      error: null,
    };
  },

  // Payouts
  async getPayouts() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('seller_payouts')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  },

  async requestPayout(amount: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('seller_payouts')
      .insert({
        seller_id: user.id,
        amount,
        period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        period_end: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    return { data, error };
  },
};

// Public API (for buyers browsing marketplace)
export const marketplaceApi = {
  async getProducts(filters?: {
    category?: string;
    product_type?: Product['product_type'];
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sort?: 'newest' | 'popular' | 'price_asc' | 'price_desc' | 'rating';
    page?: number;
    limit?: number;
  }) {
    let query = supabase
      .from('products')
      .select('*, category:categories(*), seller:sellers(display_name, avatar_url)', { count: 'exact' })
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category_id', filters.category);
    }
    if (filters?.product_type) {
      query = query.eq('product_type', filters.product_type);
    }
    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,tags.cs.{${filters.search}}`);
    }
    if (filters?.sort) {
      const sortMap = {
        newest: { column: 'created_at', ascending: false },
        popular: { column: 'sales_count', ascending: false },
        price_asc: { column: 'price', ascending: true },
        price_desc: { column: 'price', ascending: false },
        rating: { column: 'rating_avg', ascending: false },
      };
      query = query.order(sortMap[filters.sort].column, { ascending: sortMap[filters.sort].ascending });
    }
    if (filters?.page && filters?.limit) {
      const from = (filters.page - 1) * filters.limit;
      const to = from + filters.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;
    return { data: data || [], error, count: count || 0 };
  },

  async getProduct(slug: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), seller:sellers(*), files:product_files(*), reviews(rating, title, content, created_at, buyer:auth.users(display_name, avatar_url))')
      .eq('slug', slug)
      .eq('status', 'approved')
      .single();

    return { data, error };
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order');

    return { data: data || [], error };
  },

  async purchaseProduct(productId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Please login to purchase' };

    // Get product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('status', 'approved')
      .single();

    if (productError || !product) {
      return { data: null, error: 'Product not found' };
    }

    // Create Stripe checkout session (edge function)
    const { data: session, error } = await supabase.functions.invoke('create-checkout', {
      body: { productId, buyerId: user.id },
    });

    return { data: session, error };
  },
};