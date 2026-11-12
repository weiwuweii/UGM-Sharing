import ItemCard from '../components/items/ItemCard'
import { mockItems } from '../mocks/items'

// Halaman Katalog (C). Versi awal dari branch feat/katalog, sekarang memakai
// ItemCard bersama dan token desain. Data masih mock: ganti mockItems dengan
// getItems(filters) dari '../lib/api' saat siap.
export default function Katalog() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-6 md:px-6 md:py-10">
      <h1 className="mb-1 text-2xl font-bold md:text-[32px]">Katalog</h1>
      <p className="mb-5 text-sm text-ink-2">{mockItems.length} barang (data contoh)</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {mockItems.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
