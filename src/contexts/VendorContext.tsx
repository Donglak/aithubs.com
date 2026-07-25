import { createContext, useContext, type ReactNode } from 'react'
import { useVendor } from '../hooks/useVendor'
import type { UseVendorReturn } from '../hooks/useVendor'

const VendorContext = createContext<UseVendorReturn | null>(null)

export function useVendorContext() {
  const ctx = useContext(VendorContext)
  if (!ctx) throw new Error('useVendorContext must be used within VendorProvider')
  return ctx
}

export function VendorProvider({ children }: { children: ReactNode }) {
  const vendorState = useVendor()
  return (
    <VendorContext.Provider value={vendorState}>
      {children}
    </VendorContext.Provider>
  )
}