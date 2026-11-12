import { useId } from 'react'

// Kolom isian dengan label, petunjuk, dan pesan error. Sesuai komponen Field di Figma.
// as="textarea" | "select" untuk jenis lain. Prefix "Rp" otomatis kalau prefix diisi.

const BOX =
  'w-full rounded-field bg-surface px-4 text-[15px] font-medium text-ink ring-[1.5px] ring-inset ring-line ' +
  'placeholder:font-normal placeholder:text-ink-2/70 transition focus:outline-none focus:ring-2 focus:ring-navy-500 ' +
  'disabled:bg-bg-soft disabled:text-ink-2'

export default function Field({ label, hint, error, as = 'input', prefix, className = '', id, children, ...rest }) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const descId = hint || error ? `${fieldId}-desc` : undefined
  const ring = error ? 'ring-danger focus:ring-danger' : ''

  let control
  if (as === 'textarea') {
    control = <textarea id={fieldId} rows={3} className={`${BOX} ${ring} resize-y py-3 leading-relaxed`} aria-invalid={!!error} aria-describedby={descId} {...rest} />
  } else if (as === 'select') {
    control = (
      <select id={fieldId} className={`${BOX} ${ring} h-12 appearance-none bg-[length:16px] bg-[right_14px_center] bg-no-repeat pr-10`} style={{ backgroundImage: CHEVRON }} aria-invalid={!!error} aria-describedby={descId} {...rest}>
        {children}
      </select>
    )
  } else {
    control = (
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[15px] font-medium text-ink-2">{prefix}</span>}
        <input id={fieldId} className={`${BOX} ${ring} h-12 ${prefix ? 'pl-11' : ''}`} aria-invalid={!!error} aria-describedby={descId} {...rest} />
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label htmlFor={fieldId} className="text-xs font-medium text-ink-2">{label}</label>}
      {control}
      {(error || hint) && (
        <p id={descId} className={`text-xs ${error ? 'text-danger' : 'text-ink-2'}`}>{error || hint}</p>
      )}
    </div>
  )
}

const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235A6788' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`

// Pilihan bersegmen (Pinjam | Jual | Keduanya, Masuk | Daftar)
export function Segmented({ options, value, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1 rounded-full bg-bg-soft p-1">
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value
        const text = typeof o === 'string' ? o : o.label
        const on = v === value
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(v)}
            className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${on ? 'bg-surface text-navy-700 shadow-card' : 'text-ink-2 hover:text-ink'}`}
          >
            {text}
          </button>
        )
      })}
    </div>
  )
}
