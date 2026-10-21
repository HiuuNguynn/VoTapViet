import { useId } from 'react'
import type { Page as PageData } from '../lib/layout'
import { computeMetrics, rowBaseline } from '../lib/layout'
import type { Lesson } from '../lib/types'
import { PAGE_H, PAGE_W, SLANT_DEG } from '../lib/types'
import { FONT_FAMILY, UI_FONT_STACK } from '../lib/measure'
import { traceDotsPathData } from '../lib/glyphs'

/**
 * Nét đứt của chữ tô: một hàng chấm theo tim nét. Đường kính chấm tỷ lệ với cỡ chữ
 * (≈ 3.6% cỡ chữ: ô ly 2 mm → 0.18, 2.5 mm → 0.22, cỡ vừa 2.5 mm → 0.45 mm),
 * kẹp trong [TRACE_MIN, TRACE_MAX]; khoảng cách chấm = 2 lần đường kính.
 */
const TRACE_RATIO = 0.036
const TRACE_MIN = 0.18
const TRACE_MAX = 0.5

interface Props {
  lesson: Lesson
  page: PageData
  pageIndex: number
  pageCount: number
  className?: string
  /** Vẽ lưới ô ly bằng các <line> thay cho <pattern> (dùng khi xuất PDF). */
  plainGrid?: boolean
  /**
   * Chỉ truyền khi hiển thị TRÊN MÀN HÌNH: tỷ lệ thu nhỏ của bản xem (tab Xem trước = 1,
   * bản xem bên tab Soạn bài = 0.62). Chấm nét đứt được phóng to để trên màn hình mỗi
   * chấm tối thiểu ~2 px. Bản in và PDF KHÔNG truyền, dùng kích thước chấm chuẩn.
   */
  previewScale?: number
}

/** Số px CSS trên 1 mm (96 dpi) và đường kính chấm tối thiểu trên màn hình (px) */
const PX_PER_MM = 96 / 25.4
const MIN_DOT_PX = 2

export function Page({
  lesson,
  page,
  pageIndex,
  pageCount,
  className = '',
  plainGrid = false,
  previewScale,
}: Props) {
  const s = page.settings
  // Kích thước chấm theo cỡ chữ; trên màn hình phóng to để mỗi chấm >= MIN_DOT_PX
  const traceDims = (fontSize: number) => {
    const base = Math.min(TRACE_MAX, Math.max(TRACE_MIN, fontSize * TRACE_RATIO))
    const k =
      previewScale === undefined ? 1 : Math.max(1, MIN_DOT_PX / (base * PX_PER_MM * Math.max(0.1, previewScale)))
    return { stroke: base * k, gap: base * 2 * k }
  }
  const m = computeMetrics(s)
  const gridId = useId()
  const gridH = m.rowsPerPage * m.rowH

  // Xếp các dòng vào các "khe" dòng kẻ cơ bản; dòng cỡ 2 ô ly chiếm 2 khe
  interface Slot {
    unit: number
    span: number
    row?: PageData['rows'][number]
  }
  const slots: Slot[] = []
  let unit = 0
  for (const row of page.rows) {
    const span = Math.min(row.span, m.rowsPerPage)
    slots.push({ unit, span, row })
    unit += span
  }
  for (; unit < m.rowsPerPage; unit++) slots.push({ unit, span: 1 })

  // Đường kẻ đậm ngang: ở ranh giới dòng, bỏ các đường nằm trong lòng một dòng cao 2 khe
  const interior = new Set<number>()
  for (const sl of slots) for (let k = 1; k < sl.span; k++) interior.add(sl.unit + k)
  const boldLines: number[] = []
  for (let r = 0; r <= m.rowsPerPage; r++) if (!interior.has(r)) boldLines.push(m.contentY + r * m.rowH)

  // Lưới chia ô của vở: đường dọc mỗi "ô vở" trên MỌI dòng, không bao giờ bị gộp.
  // Ô chữ cái / cụm từ luôn rộng bằng bội số ô vở nên khung ô trùng với lưới này.
  const cellUnitW = s.rowOly * s.oly
  const cellXs: number[] = []
  for (let x = m.contentX + cellUnitW; x < m.contentX + m.contentW - 1e-6; x += cellUnitW) cellXs.push(x)

  // Toạ độ các đường kẻ ô ly khi vẽ bằng <line> (plainGrid)
  const gridXs: number[] = []
  const gridYs: number[] = []
  if (plainGrid) {
    for (let x = m.contentX; x <= m.contentX + m.contentW + 1e-6; x += s.oly) gridXs.push(x)
    for (let y = m.contentY; y <= m.contentY + gridH + 1e-6; y += s.oly) gridYs.push(y)
  }

  return (
    <svg
      className={`print-page bg-white ${className}`}
      width={`${PAGE_W}mm`}
      height={`${PAGE_H}mm`}
      viewBox={`0 0 ${PAGE_W} ${PAGE_H}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {!plainGrid && (
      <defs>
        <pattern
          id={gridId}
          x={m.contentX}
          y={m.contentY}
          width={s.oly}
          height={s.oly}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${s.oly} 0 L 0 0 0 ${s.oly}`}
            fill="none"
            stroke={s.gridColor}
            strokeWidth={0.12}
          />
        </pattern>
      </defs>
      )}

      {/* Tiêu đề */}
      <text
        x={s.marginLeft}
        y={s.marginTop + 6}
        fontFamily={UI_FONT_STACK}
        fontSize={4.6}
        fontWeight={700}
        fill="#1f2937"
      >
        {lesson.title}
      </text>
      <text
        x={PAGE_W / 2}
        y={s.marginTop + 6}
        fontFamily={UI_FONT_STACK}
        fontSize={4.6}
        fontWeight={700}
        textAnchor="middle"
        fill={s.sampleColor}
      >
        {page.subtitle}
      </text>
      {s.showNameLine && (
        <text
          x={PAGE_W - s.marginRight}
          y={s.marginTop + 6}
          fontFamily={UI_FONT_STACK}
          fontSize={3.2}
          textAnchor="end"
          fill="#6b7280"
        >
          Họ và tên: ......................................
        </text>
      )}

      {/* Lưới ô ly */}
      {plainGrid ? (
        <g stroke={s.gridColor} strokeWidth={0.12} fill="none">
          {gridXs.map((x) => (
            <line key={`x${x}`} x1={x} x2={x} y1={m.contentY} y2={m.contentY + gridH} />
          ))}
          {gridYs.map((y) => (
            <line key={`y${y}`} x1={m.contentX} x2={m.contentX + m.contentW} y1={y} y2={y} />
          ))}
        </g>
      ) : (
        <rect x={m.contentX} y={m.contentY} width={m.contentW} height={gridH} fill={`url(#${gridId})`} />
      )}
      <rect
        x={m.contentX}
        y={m.contentY}
        width={m.contentW}
        height={gridH}
        fill="none"
        stroke={s.gridBoldColor}
        strokeWidth={0.3}
      />
      {boldLines.map((y) => (
        <line
          key={y}
          x1={m.contentX}
          x2={m.contentX + m.contentW}
          y1={y}
          y2={y}
          stroke={s.gridBoldColor}
          strokeWidth={0.28}
        />
      ))}

      {/* Lưới chia ô của vở trên toàn bộ phần nội dung */}
      {cellXs.map((x) => (
        <line
          key={`c${x}`}
          x1={x}
          x2={x}
          y1={m.contentY}
          y2={m.contentY + gridH}
          stroke={s.gridBoldColor}
          strokeWidth={0.22}
        />
      ))}

      {/* Chữ */}
      {slots.map((sl) => {
        if (!sl.row) return null
        const top = m.contentY + sl.unit * m.rowH
        const baseline = rowBaseline(top, sl.span, m)
        const fontSize = m.fontSize * sl.row.scale
        return (
          <g key={`t${sl.unit}`}>
            {sl.row.cells.map((c, i) => {
              if (!c.glyphs) return null
              const transform = sl.row!.slant
                ? `translate(${c.x} ${baseline}) skewX(${-SLANT_DEG}) translate(${-c.x} ${-baseline})`
                : undefined
              if (c.isSample) {
                return (
                  <text
                    key={i}
                    x={c.x}
                    y={baseline}
                    fontFamily={`"${FONT_FAMILY}"`}
                    fontSize={fontSize}
                    fontWeight={700}
                    fill={s.sampleColor}
                    textAnchor={c.anchor}
                    xmlSpace="preserve"
                    transform={transform}
                  >
                    {c.glyphs}
                  </text>
                )
              }
              // Chữ tô: một hàng chấm theo tim nét (mỗi chấm là một đoạn 0.01 mm, nắp tròn)
              const { stroke: traceStroke, gap: traceGap } = traceDims(fontSize)
              const d = traceDotsPathData(c.glyphs, c.x, baseline, fontSize, c.anchor, traceGap)
              if (!d) return null
              return (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke={s.traceColor}
                  strokeWidth={traceStroke}
                  strokeLinecap="round"
                  transform={transform}
                />
              )
            })}
          </g>
        )
      })}

      {/* Số trang */}
      <text
        x={PAGE_W / 2}
        y={PAGE_H - 5}
        fontFamily={UI_FONT_STACK}
        fontSize={3}
        textAnchor="middle"
        fill="#9ca3af"
      >
        {pageIndex + 1} / {pageCount}
      </text>
    </svg>
  )
}
