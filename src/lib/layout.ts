import type { Lesson, LessonItem, LessonPage, PageSettings } from './types'
import { PAGE_H, PAGE_W, SLANT_DEG } from './types'
import { fontSizeForOly, measureText } from './measure'
import { noiNet } from './noinet'

export interface Cell {
  x: number
  /** Chuỗi đưa vào font HP001 (đã nối nét nếu bật); chữ mẫu in đậm, chữ tô vẽ nét đứt từ viền glyph */
  glyphs: string
  anchor: 'start' | 'middle'
  isSample: boolean
  /** Bề rộng ô (mm) khi có khung ô (chữ cái, cụm từ) */
  boxW?: number
  /** Mép trái ô (mm) */
  boxX?: number
}

export interface Row {
  itemId: string
  cells: Cell[]
  /** Số dòng kẻ cơ bản mà dòng này chiếm (cỡ chữ 2 ô ly chiếm 2 dòng) */
  span: number
  /** Hệ số cỡ chữ so với cỡ 1 ô ly */
  scale: number
  slant: boolean
}

/** Một tờ giấy in ra */
export interface Page {
  rows: Row[]
  /** Cài đặt đã gộp (chung + riêng của trang soạn) dùng để vẽ tờ này */
  settings: PageSettings
  /** Tên bài hiển thị ở đầu tờ */
  subtitle: string
}

/** Cài đặt thực tế của một trang soạn = cài đặt chung + phần ghi đè của trang */
export function pageSettings(lesson: Lesson, pg: LessonPage): PageSettings {
  return pg.rowOly ? { ...lesson.settings, rowOly: pg.rowOly } : lesson.settings
}

export interface Metrics {
  /** Cỡ chữ (mm) cho cỡ 1 ô ly */
  fontSize: number
  rowH: number
  contentX: number
  contentW: number
  contentY: number
  contentH: number
  rowsPerPage: number
}

export function computeMetrics(s: PageSettings): Metrics {
  const rowH = s.rowOly * s.oly
  const contentX = s.marginLeft
  // Vùng viết rộng đúng bằng một số nguyên ô vở, phần dư dồn vào lề phải
  // để không bao giờ thừa một dải ô lẻ ở mép phải trang
  const unit = s.rowOly * s.oly
  const maxW = PAGE_W - s.marginLeft - s.marginRight
  const contentW = Math.max(unit, Math.floor(maxW / unit + 1e-6) * unit)
  const contentY = s.marginTop + s.headerHeight
  const contentH = PAGE_H - contentY - s.marginBottom
  return {
    fontSize: fontSizeForOly(s.oly),
    rowH,
    contentX,
    contentW,
    contentY,
    contentH,
    rowsPerPage: Math.max(1, Math.floor(contentH / rowH)),
  }
}

/** Chữ ngồi sát đường kẻ đậm dưới của dòng (baseline = đáy phần dòng chiếm). */
export function rowBaseline(top: number, span: number, m: Metrics): number {
  return top + span * m.rowH
}

/** Chuỗi đưa vào font từ văn bản gốc (nối nét nếu bật) */
function toGlyphs(text: string, useNoiNet: boolean): string {
  const t = text.trim()
  return useNoiNet ? noiNet(t) : t
}

/** Bề rộng lớn nhất của chữ (mm) giữa font đậm (chữ mẫu) và font thường (chữ tô) */
function glyphsWidth(g: string, fontSize: number): number {
  return Math.max(measureText(g, fontSize, true), measureText(g, fontSize))
}

/** Bề rộng chữ (mm), tính cả phần nghiêng nếu chữ nghiêng (chữ hoa cao 2.5 ô ly). */
function textWidth(g: string, fontSize: number, oly: number, scale: number, slant: boolean): number {
  const extra = slant ? Math.tan((SLANT_DEG * Math.PI) / 180) * 2.5 * oly * scale : 0
  return glyphsWidth(g, fontSize) + extra
}

/**
 * Tách văn bản gốc thành các dòng vừa bề rộng maxW (ngắt theo từ, từ quá dài thì
 * ngắt theo ký tự). Đo sau khi nối nét, trả về các dòng văn bản gốc.
 */
function wrapWords(text: string, useNoiNet: boolean, fontSize: number, maxW: number): string[] {
  const lines: string[] = []
  let cur = ''
  const fits = (t: string) => glyphsWidth(toGlyphs(t, useNoiNet), fontSize) <= maxW
  const pushWord = (word: string) => {
    const probe = cur ? cur + ' ' + word : word
    if (fits(probe)) {
      cur = probe
      return
    }
    if (cur) lines.push(cur)
    cur = ''
    if (fits(word)) {
      cur = word
      return
    }
    for (const ch of word) {
      if (!cur || fits(cur + ch)) cur += ch
      else {
        lines.push(cur)
        cur = ch
      }
    }
  }
  for (const word of text.split(/\s+/).filter(Boolean)) pushWord(word)
  if (cur) lines.push(cur)
  return lines
}

/**
 * Cỡ vừa (2 ô ly): chữ hoa cao 5 ô ly chiếm trọn dòng, nét xuống rủ 3 ô ly xuống
 * dòng dưới, nên giữa hai dòng chữ phải cách một dòng kẻ trống.
 */
function withSpacers(rows: Row[], item: LessonItem): Row[] {
  if (item.sizeOly !== 2) return rows
  const out: Row[] = []
  for (const r of rows) {
    out.push(r)
    out.push({ itemId: item.id, cells: [], span: 1, scale: 1, slant: false })
  }
  return out
}

function buildRows(item: LessonItem, s: PageSettings, m: Metrics): Row[] {
  return withSpacers(buildTextRows(item, s, m), item)
}

function buildTextRows(item: LessonItem, s: PageSettings, m: Metrics): Row[] {
  const text = item.text.trim()
  const g = toGlyphs(text, item.noiNet)
  const rows: Row[] = []
  if (!text) return rows
  const reps = Math.max(1, item.rows)
  const scale = item.sizeOly === 2 ? 2 : 1
  // Ô ly và dòng kẻ KHÔNG BAO GIỜ đổi theo cỡ chữ: chữ cỡ 2 ô ly vẫn nằm trong
  // một dòng kẻ bình thường, chỉ cao gấp đôi (chữ hoa 5 ô ly = trọn dòng 5 ô ly)
  const span = 1
  const slant = !!item.slant
  const fontSize = m.fontSize * scale
  const base = { itemId: item.id, span, scale, slant }

  if (item.mode === 'paragraph') {
    // Đoạn văn: tự xuống dòng; mỗi lần chép lại là một bộ dòng, lần đầu là mẫu đỏ
    const slantExtra = slant ? Math.tan((SLANT_DEG * Math.PI) / 180) * 2.5 * s.oly * scale : 0
    const lines = wrapWords(text, item.noiNet, fontSize, m.contentW - slantExtra).map((ln) =>
      toGlyphs(ln, item.noiNet),
    )
    for (let r = 0; r < reps; r++) {
      for (const ln of lines) {
        const isSample = r === 0
        const show = isSample || item.showTrace !== false
        rows.push({
          ...base,
          cells: [{ x: m.contentX, glyphs: show ? ln : '', anchor: 'start', isSample }],
        })
      }
    }
    return rows
  }

  for (let r = 0; r < reps; r++) {
    const cells: Cell[] = []
    const textW = textWidth(g, fontSize, s.oly, scale, slant)
    // Mọi ô chữ đều bo tròn lên theo bội số "ô vở" để khung ô luôn trùng
    // lưới chia ô của trang (lưới này kẻ trên mọi dòng, không bao giờ bị gộp)
    const unit = s.rowOly * s.oly
    let rawW: number
    if (item.mode === 'cells') {
      // Chữ cái: mỗi chữ một ô vở; chữ rộng hơn thì tự nới ô (theo bội số ô vở)
      rawW = Math.max(unit, textW + s.oly)
    } else {
      // Cụm từ: bề rộng chữ + lề chừa bên phải cố định 1 ô ly
      rawW = textW + s.oly
    }
    const cellW = Math.min(Math.ceil(rawW / unit - 1e-6) * unit, m.contentW)
    const n = Math.max(1, Math.floor(m.contentW / cellW + 1e-6))
    // Chữ cái: căn giữa ô. Cụm từ: viết sát mép trái ô (chừa 0.5 ô ly) như viết vở,
    // không căn giữa để khỏi dư khoảng trống hai bên
    const inset = 0.5 * s.oly
    for (let i = 0; i < n; i++) {
      const left = m.contentX + i * cellW
      cells.push({
        x: item.mode === 'cells' ? left + cellW / 2 : left + inset,
        glyphs: g,
        anchor: item.mode === 'cells' ? 'middle' : 'start',
        isSample: i === 0 && (item.sampleEveryRow || r === 0),
        boxW: cellW,
        boxX: left,
      })
    }
    rows.push({ ...base, cells })
  }
  if (item.showTrace === false) {
    // Không hiện chữ tô: ô không phải mẫu để trống cho học sinh tự viết
    for (const row of rows) for (const c of row.cells) if (!c.isSample) c.glyphs = ''
  }
  return rows
}

export function paginate(lesson: Lesson): Page[] {
  const pages: Page[] = []
  // Mỗi trang soạn luôn bắt đầu ở một tờ mới; dài quá thì tràn sang tờ tiếp theo
  for (const pg of lesson.pages) {
    const settings = pageSettings(lesson, pg)
    const subtitle = pg.subtitle.trim() || lesson.subtitle
    const m = computeMetrics(settings)
    const all = pg.items.flatMap((it) => buildRows(it, settings, m))
    let cur: Row[] = []
    let used = 0
    for (const row of all) {
      const span = Math.min(row.span, m.rowsPerPage)
      if (used + span > m.rowsPerPage) {
        pages.push({ rows: cur, settings, subtitle })
        cur = []
        used = 0
      }
      cur.push(row)
      used += span
    }
    pages.push({ rows: cur, settings, subtitle })
  }
  if (pages.length === 0) pages.push({ rows: [], settings: lesson.settings, subtitle: lesson.subtitle })
  const copies = Math.max(1, Math.floor(lesson.pageCopies || 1))
  if (copies === 1) return pages
  const out: Page[] = []
  for (let c = 0; c < copies; c++) out.push(...pages)
  return out
}
