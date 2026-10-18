import { FONT_UPM, FONT_XHEIGHT } from './types'
import { loadGlyphFont } from './glyphs'

export const FONT_FAMILY = 'HP001'

/** Font chữ thường (tiêu đề, số trang). Trên trình duyệt rơi về system-ui; khi xuất PDF được nhúng Liberation Sans. */
export const UI_FONT_FAMILY = 'TapVietSans'
export const UI_FONT_STACK = `${UI_FONT_FAMILY}, system-ui, Arial, sans-serif`

/** Cỡ chữ (đơn vị mm) sao cho x-height = 1 ô ly */
export function fontSizeForOly(oly: number): number {
  return (oly * FONT_UPM) / FONT_XHEIGHT
}

let canvas: HTMLCanvasElement | null = null
const cache = new Map<string, number>()

/** Đo bề rộng chuỗi (mm) với cỡ chữ fontSize (mm). */
export function measureText(text: string, fontSize: number, bold = false, family: string = FONT_FAMILY): number {
  const key = `${family}|${bold ? 'b' : 'n'}|${fontSize}|${text}`
  const hit = cache.get(key)
  if (hit !== undefined) return hit
  if (!canvas) canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return text.length * fontSize * 0.5
  // Đo ở tỷ lệ 10px = 1mm để giảm sai số làm tròn
  ctx.font = `${bold ? '700' : '400'} ${fontSize * 10}px "${family}"`
  const w = ctx.measureText(text).width / 10
  cache.set(key, w)
  return w
}

export function clearMeasureCache() {
  cache.clear()
}

export async function loadFonts(): Promise<void> {
  if (!('fonts' in document)) return
  await Promise.all([
    document.fonts.load(`400 20px "${FONT_FAMILY}"`),
    document.fonts.load(`700 20px "${FONT_FAMILY}"`),
    loadGlyphFont(),
  ])
  clearMeasureCache()
}
