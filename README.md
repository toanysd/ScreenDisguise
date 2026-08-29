# ScreenDisguise (ScreenCam-Pro) 🛡️📱

Ứng dụng web Progressive Web App (PWA) / GitHub Pages chuyên dụng: **Giả lập Khóa Màn Hình & Trình Duyệt Ngụy Trang Ghi Hình Nền Không Preview**.

## 🌟 Tính năng nổi bật

1. **Khóa Màn Hình Giả Lập (Smart LockScreen & OLED Pure Black)**:
   - Giao diện khóa iOS/Android tinh tế, hiển thị mức pin thực tế (`Battery API`), ngày giờ theo thời gian thực.
   - Chế độ **OLED Pure Black**: biến toàn bộ màn hình thành màu đen kịt tuyệt đối, tắt bóng pixel trên màn hình OLED để tiết kiệm pin và quay lén an toàn.
   - Bàn phím số **Mã PIN bảo mật** (mặc định: `1234`) để mở khóa vào không gian làm việc.

2. **Không gian Ngụy Trang Đa Năng (Disguised Workspaces)**:
   - **Trình duyệt Web ngụy trang**: Lướt web, đọc báo (Wikipedia, Dân Trí, VnExpress, Bing...), tìm kiếm như Safari/Chrome thật.
   - **Máy tính bỏ túi (Calculator)**: Hoạt động tính toán như máy tính thật (nhập `1234` rồi bấm `=` để mở kho video bí mật).
   - **Peek Camera**: Cửa sổ soi góc quay siêu nhỏ ẩn/hiện để căn chỉnh góc máy mà không bị lộ.

3. **Lõi Quay Nền & Chống Tắt Màn Hình (Core Hardware Engine)**:
   - **Zero-Preview Background Recording**: Ghi hình âm thầm qua `MediaRecorder`, không hiển thị luồng video ra màn hình.
   - **Screen Wake Lock**: Tự động giữ màn hình điện thoại không bao giờ tự tắt (sleep).
   - Đổi linh hoạt **Camera Trước / Sau**, bật/tắt thu âm Microphone, chọn độ phân giải (1080p / 720p / 480p).

4. **Kho Video Bảo Mật (Encrypted IndexedDB Vault)**:
   - Tự động lưu luồng video liên tục vào IndexedDB cục bộ (chống mất video khi sập nguồn hoặc lỡ tắt tab).
   - Xem lại video trực tiếp trong app, tải về file `.mp4`/`.webm`, hoặc xóa.

## 🚀 Triển khai & Cài đặt

- **Chạy cục bộ**: `pnpm dev`
- **Build cho GitHub Pages**: `pnpm build` (output tại thư mục `dist/`)
- **Cài đặt PWA trên điện thoại**: Mở trên Safari/Chrome -> Bấm **"Thêm vào màn hình chính (Add to Home Screen)"** để chạy Fullscreen 100% không viền trình duyệt.

## 🤫 Phím tắt & Cử chỉ bí mật:
- **Chạm 3 lần góc trên cùng bên phải**: Bắt đầu / Dừng ghi hình ngầm.
- **Chạm 3 lần góc trên cùng bên trái (hoặc đồng hồ)**: Chuyển sang Màn hình khóa / Màn hình đen OLED.
- **Chạm 2 lần vào màn hình đen OLED**: Trở lại màn hình khóa.
- **Mã PIN mặc định**: `1234` (có thể đổi trong Cài đặt).
- **Mã PIN đặc biệt**: `0000` (truy cập thẳng Kho video từ màn hình khóa).
