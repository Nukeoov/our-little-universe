# Our Little Universe ♡

Website lưu giữ kỷ niệm của hai bạn (HTML + CSS + JavaScript thuần, GitHub Pages).

## 1. Chạy thử trên máy

1. Mở **toàn bộ folder** bằng VS Code.
2. Cài extension **Live Server**.
3. Chuột phải `index.html` → **Open with Live Server**.
4. Không mở `index.html` qua `file://`, vì trình duyệt sẽ chặn việc tải `data/site.json`.

## 2. Publish lên GitHub Pages

1. Tạo một **public** GitHub repository mới, ví dụ `our-little-universe`.
2. Upload **toàn bộ nội dung** folder vào **root** của repository, gồm `index.html`, `style.css`, `script.js`, `data/`, `assets/`, `.nojekyll`.
3. Trong repo, vào **Settings → Pages**.
4. Chọn **Deploy from a branch**, branch `main`, folder `/(root)`, rồi **Save**.
5. Link dự kiến: `https://USERNAME.github.io/our-little-universe/`.

Có thể push qua VS Code Terminal:

```bash
git init
git branch -M main
git add .
git commit -m "Our little universe"
git remote add origin https://github.com/USERNAME/our-little-universe.git
git push -u origin main
```

## 3. Chỉnh sửa trực tiếp trên website và tự commit GitHub

Website là trang tĩnh nên không thể tự lưu thay đổi vào repo mà không có quyền GitHub. Trang có một trình chỉnh sửa cho **người sở hữu repo**:

1. Nhấn **✎** trên thanh điều hướng → **⚙ Chỉnh ảnh & thông tin**. Cập nhật tên, vị trí, đoạn giới thiệu, ngày bắt đầu yêu và ảnh đại diện.
2. Nhấn **+** phía cuối timeline để chọn ảnh từ máy, ngày, địa điểm, mô tả.
3. Trong form, nhập **GitHub username**, **repository name**, **branch** (thường `main`) và **fine-grained Personal Access Token**.
4. Nhấn Save. Trình duyệt upload ảnh (được giảm kích thước, đổi thành JPEG) vào `assets/` và cập nhật `data/site.json` qua GitHub Contents API, tự tạo commit. Đợi GitHub Pages deploy rồi refresh.

### Tạo GitHub token

- GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
- **Repository access:** Only select repositories → chọn đúng repo website.
- **Repository permissions → Contents: Read and write**; các quyền không cần thiết để mức thấp nhất.
- Dùng **thời hạn ngắn**, thu hồi token khi không cần nữa.
- **Không** bao giờ đưa token vào source code, commit, chat, ảnh chụp màn hình hoặc chia sẻ cho người khác.
- Token không được lưu vào localStorage, cookies hay source code bởi website này. Token chỉ nằm trong ô nhập trên phiên trang hiện tại, được xoá sau khi lưu thành công. Tốt nhất sử dụng trên thiết bị riêng đáng tin cậy.
- **Bất kỳ ai mở website đều nhìn thấy nút chỉnh sửa, nhưng không thể ghi vào repo nếu không có token hợp lệ có quyền.** Đây không phải hệ thống đăng nhập/admin bảo mật thật sự.

### Quan trọng về quyền riêng tư

- Một trang GitHub Pages public sẽ hiển thị công khai ảnh, địa điểm, ngày tháng, lời nhắn. **Đừng upload ảnh hay thông tin nhạy cảm**.
- Repo có lịch sử commit: xoá ảnh khỏi timeline **không có nghĩa ảnh đã biến mất khỏi lịch sử Git**.
- Trang không có backend, không có database, và không có quyền truy cập repo tự động khi không có token.
- Các ảnh được thêm qua form tối đa 20MB trước khi nén, và xuất thành JPEG tối đa chiều dài 1600px. Khi mạng lỗi sau khi upload ảnh nhưng trước khi cập nhật JSON, ảnh có thể còn tồn tại trong `assets/` và bạn có thể xóa thủ công trên GitHub.

## 4. Chỉnh sửa thủ công (không dùng token)

Mở `data/site.json`:

- `startDate`: ngày bắt đầu yêu, định dạng `YYYY-MM-DD` (ví dụ `2025-06-12`). Ban đầu để trống để không bịa ngày.
- `personOne`, `personTwo`: tên, thành phố, đường dẫn ảnh.
- `loveNote`: đoạn giới thiệu giữa hai tấm hình.
- `memories`: từng dòng chứa `date`, `place`, `caption`, `image`.

Bỏ ảnh vào `assets/`, sửa `site.json`, commit/push. Ảnh gallery được lấy từ `memories`, xáo trộn mỗi lần tải trang rồi tự động cuộn từ phải sang trái. Timeline được sắp theo ngày tăng dần.

## 5. File trong website

```text
index.html
style.css
script.js
data/site.json
assets/person-one.svg
assets/person-two.svg
assets/memory-01.svg
assets/memory-02.svg
assets/memory-03.svg
.nojekyll
.gitignore
README.md
```

Trang dùng font Google Fonts (có fallback nếu offline), không yêu cầu cài package/Node.js.
