import { useEffect, useMemo, useRef, useState } from 'react'
import { Editor } from './components/Editor'
import { Page } from './components/Page'
import { paginate } from './lib/layout'
import { loadFonts } from './lib/measure'
import { exportJson, loadLessons, parseImport, saveLessons } from './lib/storage'
import type { Lesson } from './lib/types'
import { newLesson, uid } from './lib/types'

type Tab = 'edit' | 'preview'

/** Tỷ lệ thu nhỏ của bản xem bên tab Soạn bài */
const EDIT_PREVIEW_ZOOM = 0.62

export default function App() {
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const saved = loadLessons()
    return saved.length ? saved : [newLesson({ title: 'Bài 16', subtitle: 'Chữ n' })]
  })
  const [currentId, setCurrentId] = useState<string>(() => lessons[0].id)
  const [tab, setTab] = useState<Tab>('edit')
  const [fontTick, setFontTick] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const [pdfBusy, setPdfBusy] = useState(false)

  useEffect(() => {
    loadFonts().then(() => setFontTick((t) => t + 1))
  }, [])

  useEffect(() => {
    saveLessons(lessons)
  }, [lessons])

  const lesson = lessons.find((l) => l.id === currentId) ?? lessons[0]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pages = useMemo(() => paginate(lesson), [lesson, fontTick])

  const setLesson = (l: Lesson) => setLessons((ls) => ls.map((x) => (x.id === l.id ? l : x)))
  const addLesson = () => {
    const l = newLesson({ title: `Bài ${lessons.length + 1}`, subtitle: '' })
    setLessons((ls) => [...ls, l])
    setCurrentId(l.id)
    setTab('edit')
  }
  const duplicateLesson = () => {
    const l: Lesson = {
      ...lesson,
      id: uid(),
      title: lesson.title + ' (bản sao)',
      pages: lesson.pages.map((pg) => ({ ...pg, id: uid(), items: pg.items.map((it) => ({ ...it, id: uid() })) })),
      updatedAt: Date.now(),
    }
    setLessons((ls) => [...ls, l])
    setCurrentId(l.id)
  }
  const deleteLesson = () => {
    if (!confirm(`Xoá "${lesson.title}"?`)) return
    const rest = lessons.filter((l) => l.id !== lesson.id)
    const next = rest.length ? rest : [newLesson()]
    setLessons(next)
    setCurrentId(next[0].id)
  }
  const doExport = () => {
    const blob = new Blob([exportJson(lessons)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'tap-viet.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const doImport = async (file: File) => {
    try {
      const imported = parseImport(await file.text())
      setLessons((ls) => [...ls, ...imported])
      if (imported[0]) setCurrentId(imported[0].id)
    } catch {
      alert('File không hợp lệ.')
    }
  }
  // Các hàm dưới đang tạm ẩn khỏi giao diện (khối nút trong sidebar đã comment).
  // Dòng này chỉ để TypeScript không báo "declared but never read"; xoá khi hiện lại nút.
  void [fileRef, duplicateLesson, deleteLesson, doExport, doImport]
  const doPrint = () => {
    setTab('preview')
    setTimeout(() => window.print(), 150)
  }
  const doDownloadPdf = async () => {
    if (pdfBusy) return
    setPdfBusy(true)
    try {
      const { lessonToPdf, pdfFileName } = await import('./lib/pdf')
      const pdf = await lessonToPdf(lesson, pages)
      pdf.save(pdfFileName(lesson.title))
    } catch (err) {
      console.error(err)
      alert('Không tạo được PDF: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setPdfBusy(false)
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="no-print flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2">
        <h1 className="text-base font-bold text-slate-800">Vở tập viết</h1>
        <nav className="ml-4 flex rounded-md border border-slate-300 text-sm">
          <button
            className={`px-3 py-1 ${tab === 'edit' ? 'bg-blue-600 text-white' : 'hover:bg-slate-50'}`}
            onClick={() => setTab('edit')}
          >
            Soạn bài
          </button>
          <button
            className={`px-3 py-1 ${tab === 'preview' ? 'bg-blue-600 text-white' : 'hover:bg-slate-50'}`}
            onClick={() => setTab('preview')}
          >
            Xem trước
          </button>
        </nav>
        <span className="ml-auto text-xs text-slate-500">
          {pages.length} trang · tự động lưu trên trình duyệt
        </span>
        <button
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
          onClick={doDownloadPdf}
          disabled={pdfBusy}
        >
          {pdfBusy ? 'Đang tạo PDF…' : 'Tải PDF'}
        </button>
        <button
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          onClick={doPrint}
        >
          In / Lưu PDF
        </button>
      </header>

      <div className="no-print flex min-h-0 flex-1">
        {/* Danh sách bài */}
        <aside className="flex w-56 flex-col border-r border-slate-200 bg-white">
          <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500">
            BÀI ĐÃ SOẠN
            <button className="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-50" onClick={addLesson}>
              + Mới
            </button>
          </div>
          <ul className="min-h-0 flex-1 overflow-auto">
            {lessons.map((l) => (
              <li key={l.id}>
                <button
                  className={`w-full px-3 py-2 text-left text-sm ${
                    l.id === lesson.id ? 'bg-blue-50 font-medium text-blue-700' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => setCurrentId(l.id)}
                >
                  <div className="truncate">{l.title || '(chưa đặt tên)'}</div>
                  <div className="truncate text-xs text-slate-500">{l.subtitle}</div>
                </button>
              </li>
            ))}
          </ul>
          {/* Tạm ẩn: Nhân bản / Xoá / Xuất JSON / Nhập JSON. Bỏ comment khối này để hiện lại.
          <div className="flex flex-wrap gap-1 border-t border-slate-200 p-2 text-xs">
            <button className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50" onClick={duplicateLesson}>
              Nhân bản
            </button>
            <button className="rounded border border-slate-300 px-2 py-1 text-red-600 hover:bg-red-50" onClick={deleteLesson}>
              Xoá
            </button>
            <button className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50" onClick={doExport}>
              Xuất JSON
            </button>
            <button
              className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50"
              onClick={() => fileRef.current?.click()}
            >
              Nhập JSON
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) doImport(f)
                e.target.value = ''
              }}
            />
          </div>
          */}
        </aside>

        {tab === 'edit' ? (
          <>
            <main className="w-[440px] shrink-0 overflow-auto border-r border-slate-200 bg-white p-4">
              <Editor lesson={lesson} onChange={setLesson} />
            </main>
            <section className="min-w-0 flex-1 overflow-auto bg-slate-200 p-4">
              <div className="origin-top-left" style={{ zoom: EDIT_PREVIEW_ZOOM }}>
                <div className="flex flex-col items-start gap-6">
                  {pages.map((p, i) => (
                    <Page
                      key={i}
                      lesson={lesson}
                      page={p}
                      pageIndex={i}
                      pageCount={pages.length}
                      className="shadow-lg"
                      previewScale={EDIT_PREVIEW_ZOOM}
                    />
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="flex-1 overflow-auto bg-slate-200 p-6">
            <div className="mx-auto flex w-fit flex-col gap-6">
              {pages.map((p, i) => (
                <Page
                  key={i}
                  lesson={lesson}
                  page={p}
                  pageIndex={i}
                  pageCount={pages.length}
                  className="shadow-lg"
                  previewScale={1}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Bản dành riêng cho in: ẩn trên màn hình, chỉ hiện khi in */}
      <div className="print-root hidden">
        {pages.map((p, i) => (
          <Page key={i} lesson={lesson} page={p} pageIndex={i} pageCount={pages.length} />
        ))}
      </div>
    </div>
  )
}
