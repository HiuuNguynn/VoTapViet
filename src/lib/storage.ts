import type { Lesson } from './types'
import {
  DEFAULT_SETTINGS,
  FIXED_HEADER_HEIGHT,
  FIXED_MARGIN_BOTTOM,
  FIXED_MARGIN_LEFT,
  FIXED_MARGIN_RIGHT,
  FIXED_MARGIN_TOP,
  olyForRowOly,
  newItem,
  newLesson,
  newPage,
  normalizeRowOly,
} from './types'
import type { LessonItem, LessonPage } from './types'

const KEY = 'tapviet.lessons.v1'

export function loadLessons(): Lesson[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as Lesson[]
    if (!Array.isArray(data)) return []
    return data.map(normalize)
  } catch {
    return []
  }
}

export function saveLessons(lessons: Lesson[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lessons))
  } catch {
    /* bộ nhớ đầy hoặc bị chặn: bỏ qua */
  }
}

/** Bổ sung trường còn thiếu cho dữ liệu cũ */
export function normalize(l: Partial<Lesson> & { items?: LessonItem[] }): Lesson {
  const base = newLesson()
  const baseItem = newItem()
  const normItems = (items: unknown): LessonItem[] =>
    Array.isArray(items) ? items.map((it) => ({ ...baseItem, ...(it as LessonItem) })) : []
  // Dữ liệu cũ chỉ có `items` phẳng: gói thành một trang
  const rawPages: Partial<LessonPage>[] = Array.isArray(l.pages)
    ? l.pages
    : [{ items: l.items ?? base.pages[0].items }]
  const pages: LessonPage[] = rawPages.map((pg) => ({
    ...newPage(),
    ...pg,
    rowOly: pg.rowOly === undefined ? undefined : normalizeRowOly(pg.rowOly),
    items: normItems(pg.items),
  }))
  const { items: _legacy, ...rest } = l
  void _legacy
  return {
    ...base,
    ...rest,
    pages: pages.length ? pages : [newPage()],
    settings: {
      ...DEFAULT_SETTINGS,
      ...(l.settings ?? {}),
      // Thông số cố định của vở: luôn ghi đè, kể cả dữ liệu cũ đã lưu giá trị khác
      marginLeft: FIXED_MARGIN_LEFT,
      marginRight: FIXED_MARGIN_RIGHT,
      marginTop: FIXED_MARGIN_TOP,
      marginBottom: FIXED_MARGIN_BOTTOM,
      headerHeight: FIXED_HEADER_HEIGHT,
      rowOly: normalizeRowOly(l.settings?.rowOly),
      oly: olyForRowOly(normalizeRowOly(l.settings?.rowOly)),
    },
  }
}

export function exportJson(lessons: Lesson[]): string {
  return JSON.stringify(lessons, null, 2)
}

export function parseImport(text: string): Lesson[] {
  const data = JSON.parse(text)
  const arr = Array.isArray(data) ? data : [data]
  return arr.map(normalize)
}
