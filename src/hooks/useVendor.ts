import { useCallback, useEffect, useState } from 'react'
import { vendorDb } from '../lib/supabase'
import { isSubscriptionActive, type Vendor, type VendorSubscription, type VendorPlan } from '../types/vendor'
import { useAuth } from './useAuth'

export interface UseVendorReturn {
  vendor: Vendor | null
  subscription: VendorSubscription | null
  plan: VendorPlan | null
  /** Gói còn hiệu lực -> được tạo/gửi duyệt sản phẩm và sản phẩm được hiển thị */
  listingActive: boolean
  /** Số sản phẩm đang chiếm slot (mọi trạng thái trừ archived/rejected) */
  usedListings: number
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useVendor(): UseVendorReturn {
  const { user } = useAuth()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [subscription, setSubscription] = useState<VendorSubscription | null>(null)
  const [plan, setPlan] = useState<VendorPlan | null>(null)
  const [usedListings, setUsedListings] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVendor = useCallback(async () => {
    if (!user) {
      setVendor(null)
      setSubscription(null)
      setPlan(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: vendorData, error: vendorError } = await vendorDb
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (vendorError) throw vendorError

      if (!vendorData) {
        setVendor(null)
        setSubscription(null)
        setPlan(null)
        return
      }

      setVendor(vendorData as Vendor)

      const [subRes, countRes] = await Promise.all([
        // vendor_subscriptions.vendor_id là auth user id (không phải vendors.id)
        vendorDb
          .from('vendor_subscriptions')
          .select('*, plan:plan_id(*)')
          .eq('vendor_id', user.id)
          .maybeSingle(),
        vendorDb
          .from('digital_products')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_id', vendorData.id)
          .not('status', 'in', '(archived,rejected)'),
      ])

      if (subRes.error) throw subRes.error
      if (subRes.data) {
        const sub = subRes.data as VendorSubscription & { plan: VendorPlan }
        setSubscription(sub)
        setPlan(sub.plan)
      } else {
        setSubscription(null)
        setPlan(null)
      }
      setUsedListings(countRes.count ?? 0)
    } catch (err) {
      console.error('useVendor error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load vendor data')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchVendor()
  }, [fetchVendor])

  return {
    vendor,
    subscription,
    plan,
    listingActive: isSubscriptionActive(subscription),
    usedListings,
    loading,
    error,
    refresh: fetchVendor,
  }
}
