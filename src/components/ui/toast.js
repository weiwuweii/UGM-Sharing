import { createContext, useContext } from 'react'

export const ToastContext = createContext(() => {})

// Pakai: const toast = useToast(); toast('Request disetujui') atau toast(pesanError, 'error')
export function useToast() {
  return useContext(ToastContext)
}
