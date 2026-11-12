// Pelacak mata googly untuk semua Buddy di layar.
// Satu set listener global, satu perhitungan per frame untuk semua pupil.
// Desktop: ikut kursor. HP: ikut jari saat menyentuh/menggeser. Diam: kembali ke tengah.

const pupils = new Set()
let target = null
let frame = 0
let idleTimer = 0
let started = false

const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function render() {
  frame = 0
  for (const p of pupils) {
    let dx = 0
    let dy = 0
    if (target && !reduceMotion()) {
      const svg = p.ownerSVGElement
      if (!svg) continue
      const r = svg.getBoundingClientRect()
      if (r.width === 0) continue
      const s = r.width / 120 // piksel per satuan viewBox
      const cx = Number(p.dataset.cx)
      const cy = Number(p.dataset.cy)
      const max = Number(p.dataset.max)
      const ex = r.left + cx * s
      const ey = r.top + cy * s
      const ang = Math.atan2(target.y - ey, target.x - ex)
      const dist = Math.hypot(target.x - ex, target.y - ey) / s
      const d = Math.min(max, dist / 6)
      dx = Math.cos(ang) * d
      dy = Math.sin(ang) * d
    }
    p.style.transform = `translate(${dx}px, ${dy}px)`
  }
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(render)
}

function rest() {
  target = null
  document.documentElement.classList.add('buddy-rest')
  schedule()
}

function look(x, y) {
  target = { x, y }
  document.documentElement.classList.remove('buddy-rest')
  clearTimeout(idleTimer)
  idleTimer = setTimeout(rest, 1200)
  schedule()
}

function start() {
  if (started || typeof window === 'undefined') return
  started = true
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') look(e.clientX, e.clientY)
  })
  const fromTouch = (e) => {
    const t = e.touches[0]
    if (t) look(t.clientX, t.clientY)
  }
  window.addEventListener('touchstart', fromTouch, { passive: true })
  window.addEventListener('touchmove', fromTouch, { passive: true })
  window.addEventListener('touchend', rest)
  document.addEventListener('mouseleave', rest)
}

export function registerPupils(elements) {
  start()
  elements.forEach((el) => pupils.add(el))
  schedule()
  return () => elements.forEach((el) => pupils.delete(el))
}
