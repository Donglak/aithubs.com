import { useCallback, useEffect, useState } from 'react'
import { vendorDb } from '../lib/supabase'
import type { Vendor, VendorSubscription, VendorPlan } from '../types/vendor'
import { useAuth } from './useAuth'

export interface UseVendorReturn {
  vendor: Vendor | null
  subscription: VendorSubscription | null
  plan: VendorPlan | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useVendor(): UseVendorReturn {
  const { user } = useAuth()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [subscription, setSubscription] = useState<VendorSubscription | null>(null)
  const [plan, setPlan] = useState<VendorPlan | null>(null)
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
      // Fetch vendor profile
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
        setLoading(false)
        return
      }

      setVendor(vendorData as Vendor)

      // Fetch subscription + plan in parallel
      const { data: subData, error: subError } = await vendorDb
        .from('vendor_subscriptions')
        .select('*, plan:plan_id(*)')
        .eq('vendor_id', vendorData.id)
        .maybeSingle()

      if (subError && subError.code !== 'PGRST116') throw subError

      if (subData) {
        const sub = subData as VendorSubscription & { plan: VendorPlan }
        setSubscription(sub)
        setPlan(sub.plan)
      } else {
        setSubscription(null)
        setPlan(null)
      }
    } catch (err: any) {
      console.error('useVendor error:', err)
      setError(err?.message || 'Failed to load vendor data')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchVendor()
  }, [fetchVendor])

  return { vendor, subscription, plan, loading, error, refresh: fetchVendor }
}