const rupiah = (n) =>
  n == null ? '-' : 'Rp' + n.toLocaleString('id-ID')

export default function ItemCard({ item }) {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <img
        src={item.photos[0]}
        alt={item.title}
        loading="lazy"
        className="aspect-[4/3] w-full object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-slate-900">{item.title}</h3>
        <p className="mt-1 text-sm text-slate-500">{item.location}</p>
        {item.rent_price_per_day && (
          <p className="mt-2 font-semibold text-[#0B2A5B]">
            {rupiah(item.rent_price_per_day)}
            <span className="text-sm font-normal text-slate-500"> / hari</span>
          </p>
        )}
        {item.status !== 'tersedia' && (
          <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
            {item.status}
          </span>
        )}
      </div>
    </article>
  )
}