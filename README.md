# 🛠️ Hướng Dẫn Thiết Lập Ứng Dụng Webhook Trading (Windows)

## 📦 1. Cài đặt Node.js

* Cài Node.js phiên bản **24 hoặc mới hơn** từ [https://nodejs.org/en/download/current](https://nodejs.org/en/download/current).
* Sau khi cài đặt, mở PowerShell và kiểm tra:

```bash
node -v
npm -v
```

> ✅ Đảm bảo `npm` nằm trong `PATH` hệ thống. Nếu không, bạn sẽ gặp lỗi khi cài thư viện.

---

## ⚙️ 2. Cho phép thực thi script PowerShell

Mở **PowerShell với quyền Administrator**, chạy lệnh:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

* Khi được hỏi, chọn `Y` để đồng ý.
* Lệnh này tạm thời cho phép PowerShell thực thi các script `.bat` hoặc `.ps1` mà không bị chặn.

---

## 📁 3. Cài đặt dự án

* Di chuyển đến thư mục dự án đã giải nén (bất kỳ vị trí nào bạn đặt).
* Chạy các lệnh sau:

```bash
cd ~/my-trading-app
npm install
```

> Lệnh `npm install` sẽ cài đặt toàn bộ các thư viện cần thiết để ứng dụng hoạt động.

---

## ⚙️ 4. Cấu hình tệp `.env`

* Mở file `.env` nằm trong thư mục gốc của dự án.
* Thêm dòng sau vào file (hoặc sửa nếu đã có):

```env
TRADING_ACCOUNT_ID=your-account-id
```

> 🔒 Thay `your-account-id` bằng ID tiểu khoản thực tế của bạn.

---

## 🚀 5. Khởi chạy ứng dụng

Chạy file khởi động bằng:

```bash
.\launcher.bat
```

Nếu khởi động thành công, bạn sẽ thấy log như sau:

```
[2025-08-07T00:45:51.002] [INFO] server - 🚀 HTTPS Server running at https://localhost:3000
```

> ✅ Ứng dụng đã chạy dưới dạng HTTPS trên cổng 3000.

---

## 🔐 6. Đăng nhập hệ thống

* Truy cập: [https://localhost:3000/login](https://localhost:3000/login)
* Nhập **username/password** đã được cấp để đăng nhập.

---

## 📲 7. Xác thực với Smart Token

* Mở mobile app liên quan để lấy **smart-token**.
* Dán token vào form → Bấm nút **\[Verify]**.

---

## ⏳ 8. Kiểm tra xác thực thành công

Nếu xác thực thành công, sẽ hiển thị:

```
✅ Verify Successfully
```

* Đồng thời hiện thông tin `trading_token`.
* Giao diện sẽ giữ phiên đăng nhập trong **8 tiếng**.
* 👉 **Đừng đóng hoặc refresh trang này!**

---

## 🧪 9. Test gửi lệnh trading

* Truy cập: [https://localhost:3000/testForm](https://localhost:3000/testForm)
* Nhập các thông tin lệnh như `symbol`, `action`, `volume`, `price`, `orderType`...
* Bấm **\[Tạo lệnh]**

> ✅ Nếu lệnh được tạo thành công bên hệ thống BNSE, tức webhook đã hoạt động đúng.

> ❌ Nếu có lỗi, hệ thống sẽ hiển thị rõ lỗi ngay trên giao diện. Bạn có thể điều chỉnh lại thông tin rồi bấm gửi lại.

---

## 🔒 Lưu ý Bảo Mật

* Đây là **mã nguồn dùng để test**, chưa tích hợp các biện pháp bảo mật nâng cao.
* Sau khi test xong, bấm nút **\[Logout]** tại bước (8) để:

  * Xoá smart-token
  * Kết thúc phiên đăng nhập
  * Tạm coi là an toàn với dữ liệu cá nhân

---

## ✅ Tổng Kết

| Bước | Mô tả                                             |
| ---- | ------------------------------------------------- |
| 1    | Cài Node.js và npm                                |
| 2    | Cho phép chạy script PowerShell                   |
| 3    | Cài thư viện Node.js                              |
| 4    | Thiết lập `.env` với ID tiểu khoản                |
| 5    | Khởi động ứng dụng bằng `.bat`                    |
| 6    | Đăng nhập người dùng                              |
| 7    | Xác thực smart-token                              |
| 8    | Giao diện đăng nhập thành công với trading\_token |
| 9    | Gửi lệnh test từ `testForm`                       |

---

> 📄 Tài liệu này dùng để hướng dẫn nội bộ. Đừng chia sẻ token/ID tiểu khoản ra ngoài để tránh rò rỉ dữ liệu.
