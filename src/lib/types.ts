/**
 * cells: Chữ cái, mỗi chữ một ô cố định (ô tự nới rộng nếu chữ dài hơn ô).
 * flow: Cụm từ, viết liền và lặp cho đến hết dòng.
 * paragraph: Đoạn văn, tự xuống dòng theo từ; `rows` = số lần chép lại cả đoạn.
 */
export type ItemMode = 'cells' | 'flow' | 'paragraph'

export interface LessonItem {
  id: string
  /** Chữ / từ / câu cần tập viết */
  text: string
  /** Số dòng kẻ dành cho mục này (với paragraph: số lần chép lại cả đoạn) */
  rows: number
  mode: ItemMode
  /** Không dùng nữa (ô chữ cái luôn = 1 ô vở, tự nới); giữ để dữ liệu cũ đọc được */
  cellOly: number
  /** Không dùng nữa (lề chừa bên phải chữ cố định 1 ô ly); giữ để dữ liệu cũ đọc được */
  gapOly: number
  /** Chữ mẫu đậm ở đầu mỗi dòng (true) hay chỉ dòng đầu (false) */
  sampleEveryRow: boolean
  /** Dùng glyph nối nét của font HP001 */
  noiNet: boolean
  /** Cỡ chữ: chữ thường cao 1 ô ly (cỡ nhỏ) hoặc 2 ô ly (cỡ vừa); dòng cao gấp đôi */
  sizeOly: 1 | 2
  /** Chữ nghiêng (15°) thay vì chữ đứng */
  slant: boolean
  /** Hiện chữ tô nét đứt (true) hay để trống ô cho học sinh tự viết (false). Chữ mẫu đỏ luôn hiện */
  showTrace: boolean
}

export interface PageSettings {
  /** Kích thước 1 ô ly (mm). Luôn = olyForRowOly(rowOly), không có ô chỉnh */
  oly: number
  /** Số ô ly cho một dòng kẻ viết: 4 hoặc 5. Ô vở rộng cũng bằng đúng số này */
  rowOly: RowOly
  /** CỐ ĐỊNH = FIXED_MARGIN_TOP */
  marginTop: number
  /** CỐ ĐỊNH = FIXED_MARGIN_BOTTOM */
  marginBottom: number
  /** CỐ ĐỊNH = FIXED_MARGIN_LEFT */
  marginLeft: number
  /** CỐ ĐỊNH = FIXED_MARGIN_RIGHT */
  marginRight: number
  /** Chiều cao phần tiêu đề (mm). CỐ ĐỊNH = FIXED_HEADER_HEIGHT */
  headerHeight: number
  /** Không dùng nữa: ô vở luôn rộng = rowOly. Giữ để dữ liệu cũ đọc được */
  emptyCellOly: number
  traceColor: string
  sampleColor: string
  gridColor: string
  gridBoldColor: string
  showNameLine: boolean
}

/** Một trang soạn: luôn bắt đầu ở một tờ giấy mới, có mục và cài đặt riêng */
export interface LessonPage {
  id: string
  /** Tên bài riêng của trang (để trống thì dùng tên bài chung) */
  subtitle: string
  /** Loại vở riêng của trang (để trống thì dùng loại vở chung) */
  rowOly?: RowOly
  items: LessonItem[]
}

export interface Lesson {
  id: string
  title: string
  subtitle: string
  /** Số lần lặp lại toàn bộ nội dung (mỗi lần = thêm một bộ trang) */
  pageCopies: number
  pages: LessonPage[]
  settings: PageSettings
  updatedAt: number
}

export const PAGE_W = 210
export const PAGE_H = 297

/** Các thông số CỐ ĐỊNH của vở, không cho người dùng chỉnh (xem docs/QUY-TAC.md) */
/**
 * Ô ly theo loại vở, đúng chuẩn vở in sẵn (TCVN 1580, vở Hồng Hà School):
 * vở 4 ô ly dùng ô 2,5 mm, vở 5 ô ly dùng ô 2 mm; cả hai cho dòng kẻ đậm 10 mm.
 */
export const OLY_BY_ROW: Record<RowOly, number> = { 4: 2.5, 5: 2 }
export function olyForRowOly(rowOly: RowOly): number {
  return OLY_BY_ROW[rowOly]
}
/** Khoảng cách hai đường kẻ đậm (mm), luôn cố định */
export const ROW_HEIGHT_MM = 10
export const FIXED_MARGIN_LEFT = 15
export const FIXED_MARGIN_RIGHT = 10
export const FIXED_MARGIN_TOP = 6
export const FIXED_MARGIN_BOTTOM = 8
export const FIXED_HEADER_HEIGHT = 12
/** Chỉ có vở 4 ô ly và vở 5 ô ly */
export type RowOly = 4 | 5
export function normalizeRowOly(v: unknown): RowOly {
  return Number(v) === 4 ? 4 : 5
}

/** Font HP001: unitsPerEm 2048, x-height 824 = 1 ô ly */
export const FONT_UPM = 2048
export const FONT_XHEIGHT = 824
/** Góc nghiêng chữ (độ) khi bật chữ nghiêng */
export const SLANT_DEG = 15

export const DEFAULT_SETTINGS: PageSettings = {
  oly: olyForRowOly(5),
  rowOly: 5,
  marginTop: FIXED_MARGIN_TOP,
  marginBottom: FIXED_MARGIN_BOTTOM,
  marginLeft: FIXED_MARGIN_LEFT,
  marginRight: FIXED_MARGIN_RIGHT,
  headerHeight: FIXED_HEADER_HEIGHT,
  emptyCellOly: 5,
  traceColor: '#7a7a7a',
  sampleColor: '#c0392b',
  gridColor: '#c9d6e6',
  gridBoldColor: '#7f97b5',
  showNameLine: true,
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function newItem(partial: Partial<LessonItem> = {}): LessonItem {
  return {
    id: uid(),
    text: 'n',
    rows: 4,
    mode: 'cells',
    cellOly: 5,
    gapOly: 1,
    sampleEveryRow: true,
    noiNet: true,
    sizeOly: 1,
    slant: false,
    showTrace: true,
    ...partial,
  }
}

export function newPage(partial: Partial<LessonPage> = {}): LessonPage {
  return { id: uid(), subtitle: '', items: [], ...partial }
}

export function newLesson(partial: Partial<Lesson> = {}): Lesson {
  return {
    id: uid(),
    title: 'Bài 1',
    subtitle: 'Chữ n',
    pageCopies: 1,
    pages: [newPage({ items: [newItem({ text: 'n', rows: 8 })] })],
    settings: { ...DEFAULT_SETTINGS },
    updatedAt: Date.now(),
    ...partial,
  }
}
