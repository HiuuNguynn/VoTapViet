import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { jsPDF } from 'jspdf'
import { svg2pdf } from 'svg2pdf.js'
import { Page } from '../components/Page'
import type { Page as PageData } from './layout'
import type { Lesson } from './types'
import { PAGE_H, PAGE_W } from './types'
import { FONT_FAMILY, UI_FONT_FAMILY } from './measure'

interface FontFile {
  file: string
  family: string
  style: 'normal' | 'bold'
}

const FONT_FILES: FontFile[] = [
  { file: 'HP001-5hang.ttf', family: FONT_FAMILY, style: 'normal' },
  { file: 'HP001-5hang-bold.ttf', family: FONT_FAMILY, style: 'bold' },
  { file: 'LiberationSans-Regular.ttf', family: UI_FONT_FAMILY, style: 'normal' },
  { file: 'LiberationSans-Bold.ttf', family: UI_FONT_FAMILY, style: 'bold' },
]

let fontDataPromise: Promise<Map<string, string>> | null = null

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.readAsDataURL(blob)
  })
}

/** Tải các file font (một lần) và trả về map tên file → base64. */
function loadFontData(): Promise<Map<string, string>> {
  if (!fontDataPromise) {
    fontDataPromise = (async () => {
      const out = new Map<string, string>()
      await Promise.all(
        FONT_FILES.map(async (f) => {
          const url = `${import.meta.env.BASE_URL}fonts/${f.file}`
          const res = await fetch(url)
          if (!res.ok) throw new Error(`Không tải được font ${f.file} (${res.status})`)
          out.set(f.file, await blobToBase64(await res.blob()))
        }),
      )
      return out
    })()
    fontDataPromise.catch(() => {
      fontDataPromise = null
    })
  }
  return fontDataPromise
}

function registerFonts(pdf: jsPDF, data: Map<string, string>) {
  for (const f of FONT_FILES) {
    pdf.addFileToVFS(f.file, data.get(f.file) ?? '')
    pdf.addFont(f.file, f.family, f.style)
  }
}

/**
 * Tạo file PDF A4 từ danh sách chuỗi SVG (mỗi chuỗi là một trang 210×297mm).
 * Font HP001 và font tiêu đề được nhúng vào PDF.
 */
export async function buildPdf(svgPages: string[]): Promise<jsPDF> {
  const fontData = await loadFontData()
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true })
  registerFonts(pdf, fontData)

  // svg2pdf cần phần tử nằm trong document để đọc được style; dùng vùng chứa ẩn.
  const host = document.createElement('div')
  host.style.cssText = 'position:fixed;left:-10000px;top:0;width:0;height:0;overflow:hidden;visibility:hidden'
  document.body.appendChild(host)
  try {
    for (let i = 0; i < svgPages.length; i++) {
      if (i > 0) pdf.addPage('a4', 'portrait')
      const doc = new DOMParser().parseFromString(svgPages[i], 'image/svg+xml')
      const svg = document.importNode(doc.documentElement, true) as unknown as SVGSVGElement
      host.replaceChildren(svg)
      await svg2pdf(svg, pdf, { x: 0, y: 0, width: PAGE_W, height: PAGE_H })
    }
  } finally {
    host.remove()
  }
  return pdf
}

/** Render từng trang của bài thành SVG rồi đóng gói thành PDF. */
export function lessonToPdf(lesson: Lesson, pages: PageData[]): Promise<jsPDF> {
  const svgs = pages.map((page, i) =>
    renderToStaticMarkup(
      createElement(Page, { lesson, page, pageIndex: i, pageCount: pages.length, plainGrid: true }),
    ),
  )
  return buildPdf(svgs)
}

/** Tên file an toàn từ tiêu đề bài. */
export function pdfFileName(title: string): string {
  const base = title.trim().replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim()
  return `${base || 'tap-viet'}.pdf`
}
