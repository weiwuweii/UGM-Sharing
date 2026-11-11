import { useEffect, useState } from 'react'
import { getItems } from './lib/api/items'

function App() {
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    getItems().then(({ data, error }) => {
      setItems(data)
      setError(error)
    })
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-blue-900">Tes Katalog</h1>
      {error && <p className="text-red-600">Error: {error}</p>}
      <ul className="mt-4 space-y-2">
        {items.map((i) => (
          <li key={i.id} className="rounded-lg border p-3">
            <b>{i.title}</b> | {i.location} | Rp {i.rent_price_per_day}/hari | pemilik: {i.owner?.full_name}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App