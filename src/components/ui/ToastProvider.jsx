import { useCallback, useRef, useState } from 'react'
import { ToastContext } from './toast'
import Icon from './Icon'

// Notifikasi singkat di bawah layar (di atas bottom nav pada HP).
export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const push = useCallback((message, tone = 'success') => {
    if (!message) return
    const id = ++idRef.current
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === 'error' ? 5000 : 3000)
  }, [])

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(96px+env(safe-area-inset-bottom,0px))] z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className={`animate-sheet-up flex max-w-md items-center gap-2.5 rounded-full py-3 pr-5 pl-4 text-sm font-semibold shadow-float ${
              t.tone === 'error' ? 'bg-surface text-danger ring-[1.5px] ring-tint-coral' : 'bg-navy-900 text-on-dark'
            }`}
          >
            <Icon name={t.tone === 'error' ? 'alert' : 'check'} size={18} className={t.tone === 'error' ? '' : 'text-lime-400'} />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
