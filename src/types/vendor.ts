// ── Vendor Module Types ──

// Vendor statuses
export type VendorStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'suspended'

// Product statuses
export type ProductStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'suspended' | 'archived'

// Pricing models
export type PriceModel = 'free' | 'paid' | 'freemium' | 'contact'

// Subscription statuses
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired'

// Billing interval
export type BillingInterval = 'month' | 'year'

// Analytics event types
export type AnalyticsEventType = 'impression' | 'click' | 'bookmark' | 'save' | 'outbound_click' | 'lead_capture' | 'share'

// Media types
export type MediaType = 'image' | 'video' | 'embed'

// Team roles
export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer'

// ── Vendor Plan ──
export interface VendorPlan {
  id: string
  name: string
  slug: string
  description: string | null
  price_monthly: number
  price_yearly: number
  max_listings: number
  max_team_members: number
  analytics_enabled: boolean
  leads_enabled: boolean
  featured_listing: boolean
  stripe_price_id_monthly: string | null
  stripe_price_id_yearly: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

// ── Vendor Subscription ──
export interface VendorSubscription {
  id: string
  vendor_id: string
  plan_id: string
  status: SubscriptionStatus
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  trial_end: string | null
  billing_interval: BillingInterval | null
  created_at: string
  updated_at: string
  // Joined
  plan?: VendorPlan
}

// ── Vendor Profile ──
export interface Vendor {
  id: string
  user_id: string
  brand_name: string
  slug: string
  logo_url: string | null
  cover_url: string | null
  bio: string | null
  website: string | null
  support_email: string | null
  social_links: Record<string, string>
  contact_email: string | null
  status: VendorStatus
  rejection_reason: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  total_products: number
  total_views: number
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
}

// ── Product Category ──
export interface ProductCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

// ── Digital Product ──
export interface DigitalProduct {
  id: string
  vendor_id: string
  title: string
  slug: string
  short_description: string | null
  full_description: string | null
  category_id: string | null
  tags: string[]
  price_model: PriceModel
  price: number | null
  external_sales_link: string | null
  demo_url: string | null
  cover_image: string | null
  status: ProductStatus
  rejection_reason: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  featured: boolean
  is_approved: boolean
  seo_title: string | null
  seo_description: string | null
  total_views: number
  total_clicks: number
  total_saves: number
  total_leads: number
  created_at: string
  updated_at: string
  // Joined
  category?: ProductCategory
  media?: ProductMedia[]
  files?: ProductFile[]
}

// ── Product Media ──
export interface ProductMedia {
  id: string
  product_id: string
  url: string
  type: MediaType
  alt_text: string | null
  sort_order: number
  created_at: string
}

// ── Product File ──
export interface ProductFile {
  id: string
  product_id: string
  name: string
  description: string | null
  url: string
  file_size: number | null
  mime_type: string | null
  sort_order: number
  created_at: string
}

// ── Vendor Lead ──
export interface VendorLead {
  id: string
  product_id: string
  vendor_id: string
  name: string
  email: string
  phone: string | null
  message: string | null
  metadata: Record<string, unknown>
  read: boolean
  created_at: string
  // Joined
  product_title?: string
}

// ── Analytics ──
export interface AnalyticsEvent {
  id: string
  product_id: string
  vendor_id: string
  event_type: AnalyticsEventType
  metadata: Record<string, unknown>
  created_at: string
}

export interface AnalyticsDaily {
  product_id: string
  vendor_id: string
  date: string
  impressions: number
  clicks: number
  bookmarks: number
  saves: number
  outbound_clicks: number
  leads: number
}

// ── Vendor Team Member ──
export interface VendorTeamMember {
  id: string
  vendor_id: string
  user_id: string
  role: TeamRole
  invited_at: string
  joined_at: string | null
  created_at: string
}

// ── Profile ──
export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  website: string | null
  role: 'user' | 'vendor' | 'admin'
  created_at: string
  updated_at: string
}

// ── Form input types ──
export interface VendorProfileFormData {
  brand_name: string
  slug: string
  bio: string
  website: string
  support_email: string
  contact_email: string
  logo_url: string
  cover_url: string
  facebook_url: string
  x_url: string
  linkedin_url: string
  youtube_url: string
  instagram_url: string
  discord_url: string
  seo_title: string
  seo_description: string
}

export interface ProductFormData {
  title: string
  slug: string
  short_description: string
  full_description: string
  category_id: string
  tags: string[]
  price_model: PriceModel
  price: string
  external_sales_link: string
  demo_url: string
  cover_image: string
  seo_title: string
  seo_description: string
  media: { url: string; type: MediaType; alt_text: string }[]
}

// ── Helper: default form values ──
export const defaultVendorProfileForm: VendorProfileFormData = {
  brand_name: '',
  slug: '',
  bio: '',
  website: '',
  support_email: '',
  contact_email: '',
  logo_url: '',
  cover_url: '',
  facebook_url: '',
  x_url: '',
  linkedin_url: '',
  youtube_url: '',
  instagram_url: '',
  discord_url: '',
  seo_title: '',
  seo_description: '',
}

export const defaultProductForm: ProductFormData = {
  title: '',
  slug: '',
  short_description: '',
  full_description: '',
  category_id: '',
  tags: [],
  price_model: 'paid',
  price: '',
  external_sales_link: '',
  demo_url: '',
  cover_image: '',
  seo_title: '',
  seo_description: '',
  media: [],
}