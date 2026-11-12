import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon'

// Modal yang tampil sebagai bottom sheet di HP dan dialog di tengah layar di desktop.
// Dipakai untuk Ajukan Pinjam, Ulasan, Laporkan, dan konfirmasi.
// Tutup dengan Esc, klik latar, atau tombol X. Fokus dikunci di dalam sheet.
export default function Sheet({ open, onClose, title, description, children, footer }) {
  const panelRef = useRef(null)
  const lastFocus = useRef(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    lastFocus.current = document.activeElement
    const body = document.body
    const prevOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    const panel = panelRef.current
    const focusables = () =>
      [...panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(
        (el) => !el.disabled,
      )
    ;(focusables()[1] ?? focusables()[0] ?? panel).focus()

    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        const els = focusables()
        if (els.length === 0) return
        const first = els[0]
        const last = els[els.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      body.style.overflow = prevOverflow
      lastFocus.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
      <div className="animate-fade-in absolute inset-0 bg-navy-900/60" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="animate-sheet-up pb-safe relative flex max-h-[92dvh] w-full flex-col rounded-t-sheet bg-surface shadow-sheet md:max-w-lg md:rounded-sheet"
      >
        <div className="flex justify-center pt-2.5 md:hidden" aria-hidden="true">
          <span className="h-1.5 w-10 rounded-full bg-line" />
        </div>
        <div className="flex items-start gap-3 px-5 pt-3 md:px-6 md:pt-6">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-xl font-bold">{title}</h2>
            {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup" className="-mr-1 inline-flex size-9 items-center justify-center rounded-full text-ink-2 hover:bg-bg-soft">
            <Icon name="x" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-4 pb-5 md:px-6">{children}</div>
        {footer && <div className="border-t border-line px-5 pt-3 pb-4 md:px-6 md:pb-6">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
