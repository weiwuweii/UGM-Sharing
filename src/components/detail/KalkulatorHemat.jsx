import { useState } from 'react'
import Icon from '../ui/Icon'
import { rupiah } from '../../lib/format'
import { hitungHemat } from '../../lib/hemat'

export default function KalkulatorHemat({ item }) {
  const [hari, setHari] = useState(3)
  const { biayaPinjam, hemat, titikImpas } = hitungHemat({
    retail: item.retail_price,
    sewaPerHari: item.rent_price_per_day,
    hari,
  })
  const untung = hemat > 0

  return (
    <section aria-label="Kalkulator Hemat" className="rounded-card bg-lime-200 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Kalkulator Hemat</h2>
        <div className="flex items-center gap-2 rounded-full bg-surface p-1">
          <button
            type="button"
            aria-label="Kurangi hari"
            disabled={hari <= 1}
            onClick={() => setHari((h) => Math.max(1, h - 1))}
            className="inline-flex size-8 items-center justify-center rounded-full bg-bg-soft text-ink disabled:opacity-40"
          >
            <Icon name="minus" size={16} />
          </button>
          <span className="tabular min-w-12 text-center text-sm font-semibold">{hari} hari</span>
          <button
            type="button"
            aria-label="Tambah hari"
            disabled={hari >= 30}
            onClick={() => setHari((h) => Math.min(30, h + 1))}
            className="inline-flex size-8 items-center justify-center rounded-full bg-navy-700 text-on-dark disabled:opacity-40"
          >
            <Icon name="plus" size={16} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 items-end gap-x-4 gap-y-3 md:grid-cols-[1fr_1fr_auto]">
        <div>
          <p className="text-sm">Pinjam {hari} hari</p>
          <p className="tabular text-xl font-bold md:text-2xl">{rupiah(biayaPinjam)}</p>
        </div>
        <div>
          <p className="text-sm">Beli baru</p>
          <p className="tabular text-xl font-bold md:text-2xl">{rupiah(item.retail_price)}</p>
        </div>
        <div className="col-span-2 rounded-field bg-lime-400 px-4 py-3 md:col-span-1" aria-live="polite">
          <p className="text-sm">Kamu hemat</p>
          <p className="tabular text-2xl font-bold">{rupiah(untung ? hemat : 0)}</p>
        </div>
      </div>

      <p className="mt-3 text-sm">
        {untung
          ? `Titik impas ${titikImpas} hari: setelah itu membeli lebih murah daripada meminjam.`
          : `Untuk ${hari} hari, lebih murah membeli baru. Titik impas ${titikImpas} hari.`}
      </p>
    </section>
  )
}