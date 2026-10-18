import { useState } from 'react'
import type { Lesson, LessonItem, LessonPage, PageSettings } from '../lib/types'
import { newItem, newPage, normalizeRowOly } from '../lib/types'

interface Props {
  lesson: Lesson
  onChange: (l: Lesson) => void
}

const label = 'block text-xs font-medium text-slate-600 mb-1'
const input =
  'w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none'
const btn =
  'rounded border border-slate-300 bg-white px-2 py-1 text-xs hover:bg-slate-50 disabled:opacity-40'

export function Editor({ lesson, onChange }: Props) {
  const [pageIdx, setPageIdx] = useState(0)
  const pi = Math.min(pageIdx, lesson.pages.length - 1)
  const page = lesson.pages[pi]

  const update = (patch: Partial<Lesson>) => onChange({ ...lesson, ...patch, updatedAt: Date.now() })
  const updateSettings = (patch: Partial<PageSettings>) =>
    update({ settings: { ...lesson.settings, ...patch } })
  const updatePage = (patch: Partial<LessonPage>) =>
    update({ pages: lesson.pages.map((pg, i) => (i === pi ? { ...pg, ...patch } : pg)) })
  const updateItems = (items: LessonItem[]) => updatePage({ items })
  const updateItem = (id: string, patch: Partial<LessonItem>) =>
    updateItems(page.items.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  const moveItem = (idx: number, dir: -1 | 1) => {
    const items = [...page.items]
    const j = idx + dir
    if (j < 0 || j >= items.length) return
    ;[items[idx], items[j]] = [items[j], items[idx]]
    updateItems(items)
  }
  const addPage = () => {
    update({ pages: [...lesson.pages, newPage()] })
    setPageIdx(lesson.pages.length)
  }
  const removePage = () => {
    if (lesson.pages.length <= 1) return
    if (!confirm(`Xoá trang ${pi + 1} và toàn bộ mục trong đó?`)) return
    update({ pages: lesson.pages.filter((_, i) => i !== pi) })
    setPageIdx(Math.max(0, pi - 1))
  }
  const movePage = (dir: -1 | 1) => {
    const pages = [...lesson.pages]
    const j = pi + dir
    if (j < 0 || j >= pages.length) return
    ;[pages[pi], pages[j]] = [pages[j], pages[pi]]
    update({ pages })
    setPageIdx(j)
  }
  const s = lesson.settings

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Thông tin bài</h2>
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <div>
            <span className={label}>Tiêu đề (trái)</span>
            <input className={input} value={lesson.title} onChange={(e) => update({ title: e.target.value })} />
          </div>
          <div>
            <span className={label}>Tên bài (giữa)</span>
            <input
              className={input}
              value={lesson.subtitle}
              onChange={(e) => update({ subtitle: e.target.value })}
            />
          </div>
          <div className="w-24">
            <span className={label} title="Lặp lại toàn bộ nội dung bấy nhiêu lần">
              Số trang
            </span>
            <input
              type="number"
              min={1}
              max={100}
              className={input}
              value={lesson.pageCopies}
              onChange={(e) => update({ pageCopies: clampInt(e.target.value, 1, 100) })}
            />
          </div>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Số trang = số lần nhân bản toàn bộ nội dung (ví dụ in cho 30 học sinh thì đặt 30).
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Các trang</h2>
        <div className="mb-2 flex flex-wrap items-center gap-1">
          {lesson.pages.map((pg, i) => (
            <button
              key={pg.id}
              className={`rounded border px-2 py-1 text-xs ${
                i === pi
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-300 bg-white hover:bg-slate-50'
              }`}
              onClick={() => setPageIdx(i)}
              title={pg.subtitle || `Trang ${i + 1}`}
            >
              Trang {i + 1}
              {pg.items.length ? ` (${pg.items.length})` : ''}
            </button>
          ))}
          <button className={btn} onClick={addPage}>
            + Thêm trang
          </button>
        </div>
        <p className="mb-3 text-xs text-slate-500">
          Mỗi trang soạn luôn bắt đầu ở một tờ giấy mới, có mục và cài đặt riêng. Nội dung dài quá
          thì tự tràn sang tờ tiếp theo.
        </p>
        <div className="mb-3 rounded-md border border-slate-200 bg-white p-3">
          <div className="mb-2 flex items-center gap-1">
            <h3 className="mr-auto text-sm font-semibold text-slate-700">Cài đặt trang {pi + 1}</h3>
            <button className={btn} title="Chuyển lên trước" disabled={pi === 0} onClick={() => movePage(-1)}>
              ←
            </button>
            <button
              className={btn}
              title="Chuyển ra sau"
              disabled={pi === lesson.pages.length - 1}
              onClick={() => movePage(1)}
            >
              →
            </button>
            <button className={`${btn} text-red-600`} disabled={lesson.pages.length <= 1} onClick={removePage}>
              Xoá trang
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className={label}>Tên bài của trang</span>
              <input
                className={input}
                placeholder={`Để trống = "${lesson.subtitle || 'tên bài chung'}"`}
                value={page.subtitle}
                onChange={(e) => updatePage({ subtitle: e.target.value })}
              />
            </div>
            <div>
              <span className={label}>Loại vở của trang</span>
              <select
                className={input}
                value={page.rowOly ?? ''}
                onChange={(e) =>
                  updatePage({ rowOly: e.target.value === '' ? undefined : normalizeRowOly(e.target.value) })
                }
              >
                <option value="">Theo chung ({s.rowOly} ô ly)</option>
                <option value={4}>Vở 4 ô ly</option>
                <option value={5}>Vở 5 ô ly</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Nội dung trang {pi + 1}</h2>
          <div className="flex gap-1">
            <button
              className={btn}
              onClick={() => updateItems([...page.items, newItem({ text: '', rows: 4, mode: 'cells' })])}
            >
              + Chữ cái
            </button>
            <button
              className={btn}
              onClick={() => updateItems([...page.items, newItem({ text: '', rows: 2, mode: 'flow' })])}
            >
              + Cụm từ
            </button>
            <button
              className={btn}
              onClick={() => updateItems([...page.items, newItem({ text: '', rows: 1, mode: 'paragraph' })])}
            >
              + Đoạn văn
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {page.items.map((it, idx) => (
            <div key={it.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-center gap-1">
                {it.mode === 'paragraph' ? (
                  <textarea
                    className={`${input} font-tapviet text-xl`}
                    rows={4}
                    placeholder="Nhập đoạn văn. Nhấn Enter để xuống dòng, trên trang cũng xuống dòng y hệt; dòng dài quá tự ngắt tiếp."
                    value={it.text}
                    onChange={(e) => updateItem(it.id, { text: e.target.value })}
                  />
                ) : (
                  <input
                    className={`${input} font-tapviet text-xl`}
                    placeholder={it.mode === 'cells' ? 'Một chữ cái hoặc chữ số...' : 'Nhập từ hoặc cụm từ...'}
                    value={it.text}
                    onChange={(e) => updateItem(it.id, { text: e.target.value })}
                  />
                )}
                <button className={btn} title="Lên" disabled={idx === 0} onClick={() => moveItem(idx, -1)}>
                  ↑
                </button>
                <button
                  className={btn}
                  title="Xuống"
                  disabled={idx === page.items.length - 1}
                  onClick={() => moveItem(idx, 1)}
                >
                  ↓
                </button>
                <button
                  className={`${btn} text-red-600`}
                  title="Xoá"
                  onClick={() => updateItems(page.items.filter((x) => x.id !== it.id))}
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className={label}>Loại</span>
                  <select
                    className={input}
                    value={it.mode}
                    onChange={(e) => updateItem(it.id, { mode: e.target.value as LessonItem['mode'] })}
                  >
                    <option value="cells">Chữ cái (từng ô)</option>
                    <option value="flow">Cụm từ (lặp hết dòng)</option>
                    <option value="paragraph">Đoạn văn (tự xuống dòng)</option>
                  </select>
                </div>
                <div>
                  <span className={label}>{it.mode === 'paragraph' ? 'Số lần chép' : 'Số dòng'}</span>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    className={input}
                    value={it.rows}
                    onChange={(e) => updateItem(it.id, { rows: clampInt(e.target.value, 1, 40) })}
                  />
                </div>
                {it.mode === 'paragraph' ? (
                  <div className="self-end text-xs text-slate-500">Lần chép đầu in đỏ làm mẫu</div>
                ) : it.mode === 'cells' ? (
                  <div className="self-end text-xs text-slate-500">Mỗi chữ một ô vở, tự nới nếu chữ dài</div>
                ) : (
                  <div className="self-end text-xs text-slate-500">Mỗi lần lặp một ô, bo theo ô vở</div>
                )}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div>
                  <span className={label}>Cỡ chữ</span>
                  <select
                    className={input}
                    value={it.sizeOly}
                    onChange={(e) => updateItem(it.id, { sizeOly: Number(e.target.value) === 2 ? 2 : 1 })}
                  >
                    <option value={1}>Cỡ nhỏ (1 ô ly)</option>
                    <option value={2}>Cỡ vừa (2 ô ly)</option>
                  </select>
                </div>
                <div>
                  <span className={label}>Chữ tô</span>
                  <select
                    className={input}
                    value={it.showTrace === false ? 'none' : 'dots'}
                    onChange={(e) => updateItem(it.id, { showTrace: e.target.value !== 'none' })}
                  >
                    <option value="dots">Hiện nét đứt để tô</option>
                    <option value="none">Không hiện, để trống</option>
                  </select>
                </div>
                <div>
                  <span className={label}>Kiểu chữ</span>
                  <select
                    className={input}
                    value={it.slant ? 'slant' : 'upright'}
                    onChange={(e) => updateItem(it.id, { slant: e.target.value === 'slant' })}
                  >
                    <option value="upright">Chữ đứng</option>
                    <option value="slant">Chữ nghiêng</option>
                  </select>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
                {it.mode !== 'paragraph' && (
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={it.sampleEveryRow}
                    onChange={(e) => updateItem(it.id, { sampleEveryRow: e.target.checked })}
                  />
                  Chữ mẫu đỏ ở mỗi dòng
                </label>
                )}
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={it.noiNet}
                    onChange={(e) => updateItem(it.id, { noiNet: e.target.checked })}
                  />
                  Nối nét (oa, oi, qu...)
                </label>
              </div>
            </div>
          ))}
          {page.items.length === 0 && (
            <p className="text-xs text-slate-500">
              Trang này chưa có mục nào. Bấm "+ Chữ cái", "+ Cụm từ" hoặc "+ Đoạn văn".
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Trang & ô ly</h2>
        <p className="mb-2 text-xs text-slate-500">
          Cố định: khổ A4, ô ly 4 mm, lề trái 15, phải 10, trên 6, dưới 8 mm, tiêu đề cao 12 mm.
          Ô vở rộng bằng đúng số ô ly của dòng kẻ.
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className={label}>Loại vở (chung)</span>
            <select
              className={input}
              value={s.rowOly}
              onChange={(e) => updateSettings({ rowOly: normalizeRowOly(e.target.value) })}
            >
              <option value={4}>Vở 4 ô ly</option>
              <option value={5}>Vở 5 ô ly</option>
            </select>
          </div>
          <div>
            <span className={label}>Dòng họ tên</span>
            <select
              className={input}
              value={s.showNameLine ? '1' : '0'}
              onChange={(e) => updateSettings({ showNameLine: e.target.value === '1' })}
            >
              <option value="1">Hiện</option>
              <option value="0">Ẩn</option>
            </select>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2">
          <ColorField label="Chữ mờ" value={s.traceColor} onChange={(v) => updateSettings({ traceColor: v })} />
          <ColorField label="Chữ mẫu" value={s.sampleColor} onChange={(v) => updateSettings({ sampleColor: v })} />
          <ColorField label="Ô ly" value={s.gridColor} onChange={(v) => updateSettings({ gridColor: v })} />
          <ColorField label="Kẻ đậm" value={s.gridBoldColor} onChange={(v) => updateSettings({ gridBoldColor: v })} />
        </div>
      </section>
    </div>
  )
}

function ColorField({ label: l, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <span className={label}>{l}</span>
      <input
        type="color"
        className="h-8 w-full cursor-pointer rounded border border-slate-300 bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function clampInt(v: string, lo: number, hi: number) {
  const n = Math.round(Number(v))
  if (Number.isNaN(n)) return lo
  return Math.min(hi, Math.max(lo, n))
}
