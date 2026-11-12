import { useEffect, useRef } from 'react'
import { registerPupils } from './googlyEyes'

// Maskot Buddy. Bentuk dan posisi mata sama dengan komponen Buddy di Figma.
// Pupil (kelas buddy-pupil) bergerak mengikuti kursor/sentuhan lewat googlyEyes.js.
// data-max = jari-jari mata - jari-jari pupil - 1,5 (satuan viewBox 120).

const INK = '#0B1633'

function Pupil({ cx, cy, r, max }) {
  return <circle className="buddy-pupil" cx={cx} cy={cy} r={r} fill={INK} data-cx={cx} data-cy={cy} data-max={max} />
}

const SHAPES = {
  kalkulator: (
    <>
      <rect x="14" y="12" width="92" height="98" rx="30" fill="#5AA9FF" />
      <rect x="32" y="24" width="56" height="16" rx="6" fill="#E8F3FF" />
      <circle cx="44" cy="62" r="14" fill="#fff" />
      <circle cx="76" cy="62" r="14" fill="#fff" />
      <Pupil cx={44} cy={62} r={6.5} max={6} />
      <Pupil cx={76} cy={62} r={6.5} max={6} />
      <path d="M50 88C54 95 66 95 70 88" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
    </>
  ),
  kamera: (
    <>
      <rect x="8" y="34" width="104" height="76" rx="26" fill="#FF8FD0" />
      <rect x="40" y="18" width="40" height="22" rx="10" fill="#FF8FD0" />
      <circle cx="42" cy="68" r="15" fill="#fff" />
      <circle cx="78" cy="68" r="15" fill="#fff" />
      <Pupil cx={42} cy={68} r={7} max={6.5} />
      <Pupil cx={78} cy={68} r={7} max={6.5} />
      <path d="M52 94C56 100 64 100 68 94" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
    </>
  ),
  charger: (
    <>
      <ellipse cx="60" cy="72" rx="48" ry="40" fill="#FFC93C" />
      <polygon points="68,2 44,40 58,40 52,62 80,24 64,24 72,2" fill="#7B5CFF" />
      <circle cx="42" cy="74" r="13" fill="#fff" />
      <circle cx="78" cy="74" r="13" fill="#fff" />
      <Pupil cx={42} cy={74} r={6} max={5.5} />
      <Pupil cx={78} cy={74} r={6} max={5.5} />
      <path d="M48 92C52 104 68 104 72 92Z" fill={INK} />
    </>
  ),
  jaslab: (
    <>
      <rect x="16" y="10" width="88" height="100" rx="44" fill="#FF6B5B" />
      <path d="M40 16L60 46L80 16" stroke="#fff" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" fill="none" />
      <circle cx="44" cy="72" r="13" fill="#fff" />
      <circle cx="76" cy="72" r="13" fill="#fff" />
      <Pupil cx={44} cy={72} r={6} max={5.5} />
      <Pupil cx={76} cy={72} r={6} max={5.5} />
      <path d="M50 94C54 100 66 100 70 94" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
    </>
  ),
  violet: (
    <>
      <circle cx="60" cy="62" r="48" fill="#7B5CFF" />
      <circle cx="60" cy="56" r="24" fill="#fff" />
      <Pupil cx={60} cy={56} r={11} max={11.5} />
      <circle cx="30" cy="80" r="7" fill="#FF8FD0" fillOpacity="0.7" />
      <circle cx="90" cy="80" r="7" fill="#FF8FD0" fillOpacity="0.7" />
      <path d="M52 92C56 97 64 97 68 92" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" />
    </>
  ),
}

export default function Buddy({ type = 'violet', size = 64, track = true, className = '', title }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!track || !ref.current) return
    return registerPupils([...ref.current.querySelectorAll('.buddy-pupil')])
  }, [track, type])

  return (
    <svg
      ref={ref}
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={`shrink-0 overflow-visible ${className}`}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {SHAPES[type] ?? SHAPES.violet}
    </svg>
  )
}
