import opentype, { type Font, type Glyph } from 'opentype.js'

/**
 * Chữ tô nét đứt: một hàng chấm chạy theo TIM NÉT của chữ (như font tập đồ),
 * tính từ đường viền glyph của font HP001 bằng opentype.js.
 *
 * Cách tính: lấy mẫu các điểm trên viền glyph, từ mỗi điểm bắn tia vuông góc
 * với viền xuyên qua nét; giao điểm gần nhất với viền bên kia cho bề dày nét,
 * điểm giữa hai bên chính là tim nét. Rải chấm cách đều trên các điểm giữa đó.
 * Nhờ vậy mọi ký tự (kể cả glyph nối nét) đều có nét đứt, không phụ thuộc font
 * nét đứt có sẵn (HP001TD4H bỏ trống nhiều chữ: t, s, v, w, chữ hoa có dấu...).
 */
let font: Font | null = null
let loading: Promise<Font> | null = null

export function loadGlyphFont(): Promise<Font> {
  if (!loading) {
    loading = fetch(`${import.meta.env.BASE_URL}fonts/HP001-5hang.ttf`)
      .then((r) => {
        if (!r.ok) throw new Error(`Không tải được font HP001 (${r.status})`)
        return r.arrayBuffer()
      })
      .then((buf) => {
        font = opentype.parse(buf)
        return font
      })
    loading.catch(() => {
      loading = null
    })
  }
  return loading
}

export function glyphFontReady(): boolean {
  return font !== null
}

interface Pt {
  x: number
  y: number
}
interface Seg {
  a: Pt
  b: Pt
}

/** Làm phẳng đường viền glyph (đơn vị font) thành các đa giác. */
function flatten(glyph: Glyph): Pt[][] {
  const contours: Pt[][] = []
  let cur: Pt[] = []
  let last: Pt = { x: 0, y: 0 }
  const push = (p: Pt) => {
    const prev = cur[cur.length - 1]
    if (!prev || Math.hypot(prev.x - p.x, prev.y - p.y) > 1e-6) cur.push(p)
  }
  const curveSteps = (len: number) => Math.max(4, Math.min(24, Math.ceil(len / 25)))
  for (const c of glyph.path.commands) {
    switch (c.type) {
      case 'M':
        if (cur.length > 1) contours.push(cur)
        cur = [{ x: c.x, y: c.y }]
        last = { x: c.x, y: c.y }
        break
      case 'L':
        push({ x: c.x, y: c.y })
        last = { x: c.x, y: c.y }
        break
      case 'Q': {
        const n = curveSteps(Math.hypot(c.x - last.x, c.y - last.y) + Math.hypot(c.x1 - last.x, c.y1 - last.y))
        for (let i = 1; i <= n; i++) {
          const t = i / n
          const u = 1 - t
          push({ x: u * u * last.x + 2 * u * t * c.x1 + t * t * c.x, y: u * u * last.y + 2 * u * t * c.y1 + t * t * c.y })
        }
        last = { x: c.x, y: c.y }
        break
      }
      case 'C': {
        const n = curveSteps(Math.hypot(c.x - last.x, c.y - last.y) * 1.5)
        for (let i = 1; i <= n; i++) {
          const t = i / n
          const u = 1 - t
          push({
            x: u * u * u * last.x + 3 * u * u * t * c.x1 + 3 * u * t * t * c.x2 + t * t * t * c.x,
            y: u * u * u * last.y + 3 * u * u * t * c.y1 + 3 * u * t * t * c.y2 + t * t * t * c.y,
          })
        }
        last = { x: c.x, y: c.y }
        break
      }
      case 'Z':
        if (cur.length > 1) contours.push(cur)
        cur = []
        break
    }
  }
  if (cur.length > 1) contours.push(cur)
  return contours
}

/** Giao của tia P + t·d (t ≠ 0) với đoạn ab; trả về t hoặc null. */
function rayHit(p: Pt, d: Pt, s: Seg): number | null {
  const ex = s.b.x - s.a.x
  const ey = s.b.y - s.a.y
  const den = d.x * ey - d.y * ex
  if (Math.abs(den) < 1e-9) return null
  const wx = s.a.x - p.x
  const wy = s.a.y - p.y
  const t = (wx * ey - wy * ex) / den
  const u = (wx * d.y - wy * d.x) / den
  if (u < 0 || u > 1) return null
  return t
}

/** Điểm tim nét của một glyph (đơn vị font), chấm cách nhau ~step đơn vị. */
function centerlineDots(glyph: Glyph, step: number): Pt[] {
  const contours = flatten(glyph)
  if (!contours.length) return []
  const segs: Seg[] = []
  for (const c of contours) for (let i = 0; i < c.length; i++) segs.push({ a: c[i], b: c[(i + 1) % c.length] })

  // Lấy mẫu đều trên viền (bước nhỏ hơn step để tim nét đủ dày rồi lọc sau)
  const sampleStep = step / 2
  const samples: { p: Pt; n: Pt }[] = []
  for (const c of contours) {
    let carry = 0
    for (let i = 0; i < c.length; i++) {
      const a = c[i]
      const b = c[(i + 1) % c.length]
      const len = Math.hypot(b.x - a.x, b.y - a.y)
      if (len < 1e-6) continue
      const tx = (b.x - a.x) / len
      const ty = (b.y - a.y) / len
      let s = carry
      while (s < len) {
        samples.push({ p: { x: a.x + tx * s, y: a.y + ty * s }, n: { x: -ty, y: tx } })
        s += sampleStep
      }
      carry = s - len
    }
  }

  // Với mỗi điểm viền: khoảng cách ngắn nhất xuyên nét sang viền bên kia
  const hits: { p: Pt; n: Pt; t: number }[] = []
  for (const sm of samples) {
    let best = Infinity
    for (const sg of segs) {
      const t = rayHit(sm.p, sm.n, sg)
      if (t === null || Math.abs(t) < 1) continue
      if (Math.abs(t) < Math.abs(best)) best = t
    }
    if (Number.isFinite(best)) hits.push({ p: sm.p, n: sm.n, t: best })
  }
  if (!hits.length) return []

  // Bề dày nét ≈ trung vị; bỏ các tia xuyên quá xa (qua chỗ nét giao nhau, vòng khuyết)
  const ds = hits.map((h) => Math.abs(h.t)).sort((a, b) => a - b)
  const stroke = ds[Math.floor(ds.length / 2)]
  const maxT = stroke * 1.6
  const mids: Pt[] = []
  for (const h of hits) {
    if (Math.abs(h.t) > maxT) continue
    mids.push({ x: h.p.x + (h.n.x * h.t) / 2, y: h.p.y + (h.n.y * h.t) / 2 })
  }

  // Lọc để các chấm cách nhau tối thiểu ~step (hai mép nét cho ra điểm giữa trùng nhau)
  const minD = step * 0.85
  const kept: Pt[] = []
  for (const m of mids) {
    let ok = true
    for (const k of kept) {
      if (Math.hypot(k.x - m.x, k.y - m.y) < minD) {
        ok = false
        break
      }
    }
    if (ok) kept.push(m)
  }
  return kept
}

const dotCache = new Map<string, Pt[]>()

function glyphDots(glyph: Glyph, step: number): Pt[] {
  const key = `${glyph.index}|${Math.round(step)}`
  let d = dotCache.get(key)
  if (!d) {
    d = centerlineDots(glyph, step)
    dotCache.set(key, d)
  }
  return d
}

/**
 * Path data SVG (đơn vị mm) gồm các chấm theo tim nét của chuỗi `text`, đặt tại
 * baseline (x, y), cỡ chữ fontSize (mm), chấm cách nhau gapMm. Vẽ bằng stroke tròn
 * (stroke-linecap="round") với stroke-width = đường kính chấm. Null nếu font chưa tải.
 */
export function traceDotsPathData(
  text: string,
  x: number,
  baseline: number,
  fontSize: number,
  anchor: 'start' | 'middle',
  gapMm: number,
): string | null {
  if (!font) return null
  const scale = fontSize / font.unitsPerEm
  const step = gapMm / scale
  const w = font.getAdvanceWidth(text, fontSize, { kerning: true })
  const x0 = anchor === 'middle' ? x - w / 2 : x
  const parts: string[] = []
  font.forEachGlyph(text, x0, baseline, fontSize, { kerning: true }, (glyph, gx, gy) => {
    for (const d of glyphDots(glyph, step)) {
      parts.push(`M${(gx + d.x * scale).toFixed(2)} ${(gy - d.y * scale).toFixed(2)}h0.01`)
    }
  })
  return parts.join('')
}
