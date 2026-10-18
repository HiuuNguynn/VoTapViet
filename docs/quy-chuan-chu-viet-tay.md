# Quy Chuẩn Kỹ Thuật Chữ Viết Tay Tiếng Việt (Theo QĐ 31/2002/QĐ-BGDĐT)

Tài liệu tổng hợp các thông số kỹ thuật phục vụ việc lập trình, thiết kế hệ thống rendering (SVG/Canvas) và thuật toán tạo vở tập viết tiếng Việt.

---

## 1. Phân Loại Cỡ Chữ & Lưới Ô Ly

Chương trình Tiểu học quy định 2 hệ cỡ chữ tiêu chuẩn:

*   **Chữ cỡ vừa (Dành cho Lớp 1):** Dùng lưới 4 ô ly hoặc 5 ô ly. Tất cả thông số chiều cao/chiều rộng gấp đôi cỡ nhỏ.
*   **Chữ cỡ nhỏ (Từ Lớp 2 đến Lớp 5 & Thực tế):** Dùng làm căn bản chuẩn cho chữ viết thông thường.

---

## 2. Quy Chuẩn Chiều Cao Chữ Thường (Cỡ Nhỏ)

| Phân loại | Chiều cao (ô ly) | Danh sách chữ cái | Ghi chú Lập trình / Render |
| :--- | :---: | :--- | :--- |
| **Nhóm 1** | **1.0** | `a, ă, â, c, e, ê, i, m, n, o, ô, ơ, u, ư, v, x` | Chiều cao cơ sở 1 đơn vị. |
| **Nhóm 2** | **1.25** | `r, s` | Nhô cao hơn đường kẻ 2 khoảng 0.25 ô ly (nét xoắn/móc trên). |
| **Nhóm 3** | **1.5** | `t` | Nét đứng cao 1.5 ô ly. |
| **Nhóm 4** | **2.0** | `d, đ, p, q` | • `d, đ`: Cao 2 ô ly lên trên baseline.<br>• `p, q`: Chân kéo xuống dưới baseline 1 ô ly. |
| **Nhóm 5** | **2.5** | `b, g, h, k, l, y` | • `b, h, k, l`: Nét khuyết trên cao 2.5 ô ly.<br>• `g, y`: Nét khuyết dưới kéo xuống 1.5 ô ly (tổng cao 2.5 ô ly). |

> **Lưu ý:** Chữ cỡ vừa = (Số ô ly cỡ nhỏ) × 2.

---

## 3. Quy Chuẩn Chữ Hoa & Chữ Số

### 3.1. Chữ Hoa
*   **Chữ hoa thông thường (Cỡ nhỏ):** Cao **2.5 ô ly**.
*   **Chữ hoa kiểu lớn (Chữ `G` và `Y` kiểu truyền thống):** Cao **4.0 ô ly** (Gồm 2.5 ô ly phía trên baseline + 1.5 ô ly nét khuyết dưới baseline).
*   **Chữ hoa cỡ vừa (Lớp 1):** Cao **5.0 ô ly** (Riêng `G`, `Y` cao **8.0 ô ly**).

### 3.2. Chữ Số
*   **Chữ số cỡ nhỏ:** Cao **2.0 ô ly**, rộng **1.0 ô ly**.
*   **Chữ số cỡ vừa:** Cao **4.0 ô ly**, rộng **2.0 ô ly**.

---

## 4. Quy Chuẩn Dấu Thanh & Dấu Phụ

*   **Chiều cao dấu thanh (`á, à, ả, ã, ạ`):** Chiều cao không vượt quá **0.5 ô ly**.
*   **Vị trí dấu thanh:** Đặt ở trung tâm ngay phía trên âm chính.
*   **Dấu phụ:**
    *   **Mũ (`â, ê, ô`):** Đặt cân đối phía trên đỉnh chữ, khoảng cách từ 0.25 đến 0.5 ô ly.
    *   **Móc / Râu (`ơ, ư`):** Đặt ở góc trên bên phải của con chữ.

---

## 5. Quy Chuẩn Độ Rộng & Nối Nét (Ligature & Kerning)

1.  **Khoảng cách giữa hai con chữ trong một từ:**
    *   **Cỡ nhỏ:** Từ **0.5 đến 0.75 ô ly**.
    *   **Cỡ vừa:** Từ **1.0 đến 1.5 ô ly**.
2.  **Khoảng cách giữa hai từ (Khoảng trắng / Space):**
    *   Tương đương độ rộng của 1 con chữ `o` (**1 ô ly** đối với cỡ nhỏ, **2 ô ly** đối với cỡ vừa).
3.  **Quy tắc Nối nét (Ligature):**
    *   **Nét móc/hất sang nét móc (vd: `i-n`, `u-a`):** Nối trực tiếp từ điểm dừng bút sang điểm bắt đầu chữ sau (khoảng cách 0.5 ô ly).
    *   **Nét sang chữ cong/tròn (`o, ô, ơ, a, ă, â, d, đ, q, c`):** Thêm nét nối phụ kéo dài khoảng 0.25 - 0.5 ô ly để chạm vào viền con chữ tiếp theo.

---

## 6. Quy Chuẩn Đường Kẻ & Ô Ly (Grid System)

*   **Đường kẻ đậm (Baseline):** Đường kẻ ngang chính làm chân cho các chữ cái.
*   **Khoảng cách ô ly thực tế khi in:**
    *   **Dòng kẻ 4/5 ô ly:** Kích thước mỗi ô vuông nhỏ thường là **2.0 mm** hoặc **2.5 mm**.