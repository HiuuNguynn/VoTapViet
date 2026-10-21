# Vở tập viết – soạn bài tập viết lớp 1

Web app giúp giáo viên soạn trang tập viết chữ cái tiếng Việt theo mẫu chữ Bộ GD,
hiển thị trên lưới ô ly và in / lưu PDF để phát cho học sinh tô.

## Chạy

```bash
npm install
npm run dev      # mở http://localhost:5173
npm run build    # build tĩnh vào dist/, deploy lên Vercel/Netlify/GitHub Pages
```

## Cách dùng

1. **Soạn bài**: đặt tiêu đề, thêm các mục. Mỗi mục là một chữ, một từ hoặc một câu:
   - *Từng ô*: lặp chữ trong các ô cố định (dùng cho chữ cái đơn).
   - *Viết liền*: viết từ / câu, lặp đến hết dòng (dùng cho từ, câu ngắn).
   - Ô đầu mỗi dòng in đậm màu đỏ làm mẫu, các ô sau in xám nhạt để tô.
2. **Xem trước**: xem đúng khổ A4 như khi in.
3. **Tải PDF**: tải thẳng file `<tên bài>.pdf` khổ A4, font đã nhúng, in được ở bất kỳ máy nào.
4. **In / Lưu PDF**: mở hộp thoại in của trình duyệt, chọn máy in hoặc "Save as PDF".
   Lề in phải để 0 (app đã tự canh lề), khổ A4.

Bài soạn được lưu tự động trong trình duyệt (localStorage). Dùng *Xuất JSON* /
*Nhập JSON* để sao lưu hoặc chuyển sang máy khác.

## Kỹ thuật

- Vite + React + TypeScript + Tailwind, không có backend.
- Trang được vẽ bằng SVG theo đơn vị mm (`viewBox 0 0 210 297`), nên màn hình và bản in giống nhau.
- Font **HP001 5 hàng** (`public/fonts/`): font chữ tập viết Unicode được chia sẻ rộng rãi
  cho mục đích giáo dục. Metric: 2048 unitsPerEm, x-height 824 = 1 ô ly, chữ hoa 2060 = 2.5 ô ly. Ô ly theo loại vở: 4 ô ly = 2,5 mm, 5 ô ly = 2 mm, dòng kẻ đậm 10 mm.
  Cỡ chữ (mm) = ô ly × 2048 / 824 (ô ly 2,5 mm → 6,21 mm ≈ 17,6 pt).
- Nối nét (oa, oi, qu, r đầu từ...): bảng thay thế trong `src/lib/noinet.ts`, chuyển thể từ
  tool [LuyenChuTieuHoc](https://github.com/langmaninternet/LuyenChuTieuHoc) sang glyph đặc biệt của HP001.
- Tải PDF: `src/lib/pdf.ts` render từng trang (`Page` với `plainGrid`, lưới vẽ bằng `<line>` thay cho
  `<pattern>`) ra SVG rồi dùng jsPDF + svg2pdf.js; nhúng HP001 (400/700) và Liberation Sans (OFL,
  `public/fonts/LiberationSans-*.ttf`) cho tiêu đề vì font chuẩn của PDF không có dấu tiếng Việt.
- Dòng kẻ: mỗi dòng viết = 4/5/6 ô ly, baseline cách đáy dòng 1.5 ô ly để chứa nét xuống của g, y, p, q.
