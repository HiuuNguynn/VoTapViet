# Quy tắc dự án Vở tập viết (TapViet)

Tài liệu này ghi lại mọi quyết định và quy tắc đã chốt với chủ dự án, từ lúc bắt đầu
(17/10/2026) đến nay. **Mọi thay đổi sau này phải tuân theo các quy tắc ở đây**; nếu
cần đổi một quy tắc thì sửa file này trước, rồi mới sửa code.

## 1. Mục tiêu sản phẩm

- Web hỗ trợ giáo viên lớp 1 soạn trang tập viết chữ cái tiếng Việt, thay cho việc
  tạo ô ly và chữ mờ trong Word (rất khó canh).
- Hai màn chính: **Soạn bài** (nhập chữ, từ, câu) và **Xem trước** (đúng khổ in).
- Đầu ra: in trực tiếp hoặc file PDF A4 tải về, phát cho học sinh tô.
- Không backend, không tài khoản. Bài soạn lưu trên trình duyệt (localStorage),
  có Xuất / Nhập JSON để sao lưu, chuyển máy.

## 2. Quy tắc trang và lưới ô ly

| Quy tắc | Giá trị mặc định | Ghi chú |
| --- | --- | --- |
| Khổ giấy | A4 dọc, 210 × 297 mm | SVG `viewBox 0 0 210 297`, 1 đơn vị = 1 mm |
| Ô ly | **4 mm, CỐ ĐỊNH** | Không có ô chỉnh; dữ liệu cũ bị ghi đè về 4. Ô ly 2.5 mm của vở in sẵn quá nhỏ, học sinh lớp 1 không viết được |
| Dòng kẻ viết | 5 ô ly / dòng (vở 5 ô ly) | Chỉ có 2 lựa chọn: vở 4 ô ly hoặc vở 5 ô ly, không có 6 |
| Ô vở (bề rộng ô) | = số ô ly của dòng kẻ (5 hoặc 4) | Không có ô chỉnh riêng |
| Lề trái / phải | **15 mm / tối thiểu 10 mm, CỐ ĐỊNH** | Không có ô chỉnh. Vùng viết rộng đúng bội số ô vở (A4: 9 ô vở = 180 mm), phần dư dồn sang lề phải, không để dải ô lẻ ở mép phải |
| Lề trên / dưới | **6 mm / 8 mm, CỐ ĐỊNH** | Tiêu đề cao **12 mm, CỐ ĐỊNH**. Không có ô chỉnh |
| Lưới | kẻ mảnh mỗi ô ly, kẻ đậm ở ranh giới mỗi dòng viết | Màu chỉnh được |

- **Lưới luôn phủ kín phần nội dung của trang**, kể cả khi bài có ít chữ hoặc không có
  chữ. Trang trống vẫn phải trông như một trang vở.
- **Trang vở luôn luôn chia ô**: đường dọc chia ô (bề rộng "ô vở" = số ô ly của dòng
  kẻ, tức ô vuông 5×5 hoặc 4×4 ô ly) kẻ trên **mọi dòng**, có chữ hay không, kể cả
  dòng đoạn văn.
  Không bao giờ để một dòng chỉ có kẻ ngang.
- **Lưới ô vở không bao giờ bị gộp hay che**: đường dọc mỗi ô vở kẻ xuyên suốt mọi
  dòng, kể cả bên trong một ô chữ rộng 2 ô vở trở lên. Không vẽ thêm khung ô riêng
  đè lên lưới (chỗ trùng sẽ đậm hơn, gây đậm nhạt không đều). Thay vào đó, **bề rộng
  mọi ô chữ (chữ cái lẫn cụm từ) luôn bo tròn lên theo bội số ô vở** để khung ô trùng
  khít với lưới.
- Mỗi trang có tiêu đề trái, tên bài giữa (màu chữ mẫu), dòng "Họ và tên" bên phải
  (tắt được), số trang ở chân.

## 3. Quy tắc chữ (theo mẫu chữ Bộ GD)

Tham chiếu kỹ thuật đầy đủ: [quy-chuan-chu-viet-tay.md](quy-chuan-chu-viet-tay.md)
(tổng hợp theo QĐ 31/2002/QĐ-BGDĐT: chiều cao từng nhóm chữ, chữ hoa, chữ số, dấu
thanh, khoảng cách chữ và từ, nối nét, kích thước ô ly khi in). Khi có mâu thuẫn giữa
font và tài liệu đó, ưu tiên tài liệu đó và ghi lại quyết định ở mục 8.

- **Chữ ngồi sát đường kẻ đậm dưới của dòng** (baseline = đáy dòng viết). Không để
  chữ lơ lửng giữa dòng. Nét xuống của g, y, p, q rủ xuống phần trên của dòng kế tiếp,
  đúng như vở tập viết thật.
- Chiều cao theo quy định: chữ thường 1 ô ly; chữ hoa và b, l, h, k, g, y 2.5 ô ly;
  d, đ, p, q 2 ô ly; t 1.5 ô ly; chữ số 2 ô ly. Font HP001 đã làm đúng tỷ lệ này, nên
  **chỉ cần giữ công thức cỡ chữ**: `cỡ chữ (mm) = ô ly × 2048 / 824`
  (ô ly 4 mm → 9.94 mm ≈ 28.2 pt).
- **Cỡ chữ** chọn theo từng mục: *cỡ nhỏ* (chữ thường 1 ô ly, chữ hoa 2.5 ô ly) hoặc
  *cỡ vừa* (chữ thường 2 ô ly, chữ hoa 5 ô ly). **Ô ly và dòng kẻ không bao giờ đổi
  theo cỡ chữ**: chữ cỡ vừa vẫn nằm trong một dòng kẻ bình thường, chỉ cao gấp đôi
  (chữ hoa chiếm trọn dòng 5 ô ly, nét xuống rủ sang dòng dưới). **Mục cỡ vừa tự chèn
  một dòng kẻ trống sau mỗi dòng chữ** để nét xuống (g, y, 3 ô ly) không chạm chữ dòng
  dưới; "Số dòng" vẫn là số dòng có chữ. Một trang được trộn nhiều cỡ.
- **Kiểu chữ** chọn theo từng mục: *chữ đứng* (mặc định, font HP001 gốc) hoặc *chữ
  nghiêng* 15° (skewX quanh chân dòng, chân chữ không đổi vị trí). Khi nghiêng, bề
  rộng ô tính thêm phần ngả của chữ hoa.
- Chữ mẫu: ô đầu mỗi dòng in **đậm, màu đỏ** (`#c0392b`) bằng font HP001 5 hàng bold.
  Có tuỳ chọn chỉ in mẫu ở dòng đầu. **Chữ mẫu đỏ luôn hiện**, kể cả khi tắt chữ tô.
- Mỗi mục có tuỳ chọn **Chữ tô**: *Hiện nét đứt để tô* (mặc định) hoặc *Không hiện,
  để trống* (các ô sau chữ mẫu bỏ trống cho học sinh tự viết; lưới và khung ô giữ nguyên).
- **Chữ tô (chữ mờ) phải là nét đứt: MỘT hàng chấm chạy theo tim nét** (như font tập
  đồ), không phải hai hàng chấm theo viền, và không bao giờ là chữ nét liền tô màu
  nhạt. Cách làm (`src/lib/glyphs.ts`): lấy viền glyph HP001 bằng opentype.js, từ mỗi
  điểm viền bắn tia vuông góc xuyên nét, điểm giữa hai mép là tim nét; rải chấm tròn
  0.35 mm cách nhau 0.7 mm trên tim nét, vẽ bằng `<path>` nhiều đoạn 0.01 mm nắp tròn,
  màu xám (`#7a7a7a`, chỉnh được). Mọi ký tự, glyph nối nét, chữ nghiêng và PDF đều
  ra nét đứt giống nhau. Trên màn hình (tab Xem trước và bản xem thu nhỏ 62% bên tab
  Soạn bài) chấm được phóng to để mỗi chấm tối thiểu 2 px (prop `previewScale`); bản
  in và PDF không truyền prop này, dùng kích thước chấm chuẩn.
- Không dùng font nét đứt có sẵn HP001TD4H: font đó bỏ nét liền ở rất nhiều chữ
  (t, s, v, w, f, j, chữ hoa có mũ/dấu như Ă Â Ê Ô Ơ Ư Đ, dấu câu) và không có bộ glyph
  thay thế nối nét (n→w, m→j, hoà→◆).

## 4. Quy tắc nội dung

- Mỗi bài gồm nhiều **trang soạn**. Mỗi trang soạn **luôn bắt đầu ở một tờ giấy mới**,
  có danh sách mục riêng, tên bài riêng (để trống thì dùng tên bài chung) và loại vở
  riêng (4 hoặc 5 ô ly, để trống thì theo cài đặt chung). Nội dung một trang dài quá
  thì tự tràn sang tờ tiếp theo. Ví dụ: trang 1 chỉ chữ cái, trang 2 chỉ cụm từ.
- Mỗi trang gồm nhiều **mục**; mỗi mục là một chữ cái, một từ hoặc một câu ngắn, có số dòng riêng.
- Ba loại mục, **tách riêng rõ ràng**, không dùng lẫn:
  - **Chữ cái** (từng ô): mỗi chữ một ô vở (5 ô ly), **không có ô chỉnh bề rộng**.
    Nếu chữ rộng hơn một ô vở, ô **tự nới rộng** theo bội số ô vở để không bao giờ
    chồng chữ. Dùng cho chữ cái đơn, chữ hoa, chữ số, vần ngắn.
  - **Cụm từ** (lặp hết dòng): mỗi lần lặp nằm trong **một ô riêng** (giống chữ cái),
    bề rộng ô = bề rộng cụm từ + lề chừa bên phải **cố định 1 ô ly** (không có ô
    chỉnh), bo tròn lên theo bội số ô vở để khung ô trùng lưới chia ô của trang. Chữ **viết sát mép trái ô**
    (chừa 0.5 ô ly), không căn giữa, để không dư khoảng trống. Chữ cái đơn thì căn
    giữa ô. Dùng cho từ, cụm từ ngắn vừa một dòng.
  - **Đoạn văn** (tự xuống dòng): ngắt dòng theo từ cho vừa bề rộng trang; "Số lần
    chép" = số lần chép lại cả đoạn, lần đầu in đỏ làm mẫu, các lần sau in xám.
    Dùng cho câu dài, tên đầy đủ, đoạn văn.
- Hỗ trợ chữ thường, chữ hoa, chữ số, từ và câu ngắn có dấu đầy đủ.
- **Nối nét** (bật mặc định): các tổ hợp oa, oi, qu, r đầu từ... được thay bằng glyph
  nối nét của font HP001 theo bảng trong `src/lib/noinet.ts`. Thứ tự các cặp thay
  thế là quan trọng, không được sắp xếp lại.
- **Số trang** (trong Thông tin bài) = số lần nhân bản toàn bộ nội dung. Đặt 30 để in
  cho 30 học sinh. Nội dung dài hơn một trang tự động tràn sang trang sau.

## 5. Quy tắc font

- Font chữ tập viết: **HP001 5 hàng** (normal + bold) tại `public/fonts/`, Unicode,
  2048 unitsPerEm, x-height 824 = 1 ô ly, cap height 2060 = 2.5 ô ly. Chữ mẫu dùng
  bản bold qua `<text>`; chữ tô dùng viền glyph bản normal qua opentype.js.
- Lưu ý: bản HP001 5 hàng normal **không có glyph "z"** (outline rỗng).
- Nguồn: repo github.com/langmaninternet/LuyenChuTieuHoc. Font được chia sẻ cho mục
  đích giáo dục, không có giấy phép chính thức. Không dùng cho mục đích thương mại khi
  chưa xin phép tác giả.
- Font tiêu đề trong PDF: Liberation Sans (OFL) vì Helvetica mặc định của PDF không có
  dấu tiếng Việt. Trên màn hình dùng font hệ thống.
- Không đổi font nếu chưa kiểm tra lại metric (x-height, cap height) và bảng nối nét.

## 6. Quy tắc in và PDF

- Màn hình, bản in và PDF phải **giống nhau tuyệt đối**: cùng một component `Page`
  (SVG theo mm) dùng cho cả ba.
- Nút **In / Lưu PDF**: `window.print()` với `@page { size: A4; margin: 0 }`. Khi in
  phải để lề 0 và tắt "Fit to page".
- Nút **Tải PDF**: jsPDF + svg2pdf.js, nhúng font HP001 và Liberation Sans, lưới vẽ
  bằng `<line>` (prop `plainGrid`) vì svg2pdf không hỗ trợ `<pattern>` tốt.
- Kiểm tra bản in bằng Chrome headless: `google-chrome --headless=new --print-to-pdf=out.pdf http://localhost:5173/`.

## 7. Quy tắc kỹ thuật

- Stack: Vite + React + TypeScript + Tailwind v4. Không thêm backend.
- Cấu trúc: `src/lib` (types, layout, measure, noinet, storage, pdf), `src/components`
  (Page, Editor), `src/App.tsx`.
- Dữ liệu bài lưu dưới khoá `tapviet.lessons.v1`. Khi thêm trường mới phải có giá trị
  mặc định trong `DEFAULT_SETTINGS` / `newLesson()` để bài cũ vẫn mở được (hàm `normalize`).
  Bài cũ chỉ có `items` phẳng được gói thành một trang soạn khi đọc.
- Trước khi báo xong: `npx tsc -b`, `npm run build`, và xem trên trình duyệt.

## 8. Lịch sử quyết định

| Ngày | Quyết định |
| --- | --- |
| 17/10/2026 | Chốt: vở 5 ô ly, chữ mờ xám nhạt, chữ thường + hoa + số + từ/câu, A4, lưu trình duyệt |
| 17/10/2026 | Chọn font HP001 5 hàng, chuyển bảng nối nét từ tool LuyenChuTieuHoc |
| 18/10/2026 | Thêm nút Tải PDF (jsPDF + svg2pdf.js) |
| 18/10/2026 | Chữ phải sát chân dòng kẻ (baseline = đáy dòng), không lơ lửng |
| 18/10/2026 | Thêm "Số trang" để nhân bản nội dung |
| 18/10/2026 | Dòng trống vẫn phải kẻ khung ô, trang luôn giống vở kể cả khi không có chữ |
| 18/10/2026 | Tách 3 loại mục: Chữ cái / Cụm từ / Đoạn văn; ô chữ cái tự nới rộng, đoạn văn tự xuống dòng |
| 18/10/2026 | Trang luôn chia ô trên mọi dòng (kể cả đoạn văn); cụm từ mỗi lần lặp một ô riêng, không viết liền |
| 18/10/2026 | Đường chia ô mỗi dòng chỉ một bộ, cùng nét; bỏ khung ô vẽ đè lên lưới ô vở |
| 18/10/2026 | Thêm cỡ chữ 2 ô ly (chiếm 2 dòng) và chữ đứng / nghiêng 15°, chọn theo từng mục |
| 18/10/2026 | Lưới ô vở kẻ xuyên suốt mọi dòng, không gộp ô; mọi ô chữ bo theo bội số ô vở (sửa bug cụm từ gộp 2 ô) |
| 18/10/2026 | Cỡ chữ 2 ô ly KHÔNG làm dòng cao gấp đôi nữa: ô ly, dòng kẻ giữ nguyên, chỉ chữ to lên |
| 18/10/2026 | Cố định ô ly 2.5 mm, lề trái 15 mm, lề phải 10 mm; bỏ ô chỉnh. Thêm tài liệu quy chuẩn QĐ 31/2002 vào docs |
| 18/10/2026 | Ô ly cố định nâng từ 2.5 mm lên 4 mm vì 2.5 mm quá bé và dày, học sinh không viết được |
| 18/10/2026 | Bỏ ô chỉnh "Rộng ô tối thiểu" của chữ cái; ô chữ cái luôn = 1 ô vở, tự nới khi chữ dài |
| 18/10/2026 | Vùng viết rộng bằng số nguyên ô vở, bỏ dải ô thừa ở mép phải |
| 18/10/2026 | Cụm từ viết sát mép trái ô (chừa 0.5 ô ly) thay vì căn giữa; lề chừa mặc định 1 ô ly |
| 18/10/2026 | Cố định lề trên 6, lề dưới 8, tiêu đề 12 mm; bỏ ô "Ô vở rộng" (ô vở = số ô ly dòng kẻ); bỏ lựa chọn 6 ô ly |
| 18/10/2026 | Bài gồm nhiều trang soạn, mỗi trang có mục, tên bài và loại vở riêng, luôn bắt đầu tờ mới |
| 18/10/2026 | Chữ tô đổi sang nét đứt: vẽ viền glyph HP001 bằng chấm qua opentype.js (không còn xám nhạt nét liền); chữ mẫu đỏ giữ HP001 bold |
| 18/10/2026 | Thêm tuỳ chọn Chữ tô: hiện nét đứt / để trống (chữ đỏ luôn hiện); bỏ ô "Chừa bên phải chữ", cố định 1 ô ly |
| 18/10/2026 | Nét đứt đổi từ hai hàng chấm theo viền sang một hàng chấm theo tim nét (tự tính, phủ mọi chữ) |
| 18/10/2026 | Cỡ vừa 2 ô ly: giữa hai dòng chữ cách một dòng kẻ trống (tự chèn) |
