# Báo cáo bài tập tuần 6

## Mô tả dự án

Dự án là một trang web đơn giản cho phép tra cứu kết quả học tập của sinh viên. Trang web mô phỏng việc lấy dữ liệu một cách bất đồng bộ, xử lý trạng thái tải và lỗi, đồng thời sử dụng `localStorage` để cache (lưu trữ tạm) kết quả nhằm tăng tốc độ cho các lần tra cứu sau.

---

## Cấu trúc mã nguồn

Dự án bao gồm hai phần chính:

1.  `phần HTML`
    *   **Chức năng:** Chứa giao diện người dùng (UI) bao gồm ô nhập liệu, nút bấm và bảng hiển thị kết quả.

2.  `Phần script`
    *   **Chức năng:** Hoạt động như một "cơ sở dữ liệu" giả lập.
    *   **Nội dung:** Chứa 3 mảng dữ liệu chính: `sinhvien`, `hocphan`, và `ketqua`.
    *   **Xử lý bất đồng bộ:** Cung cấp các hàm (`findStudent`, `getFullStudentResults`) để truy xuất dữ liệu. Các hàm này sử dụng `Promise` và `setTimeout` để giả lập độ trễ mạng, trả về dữ liệu một cách bất đồng bộ.
    *   **Logic:** Tích hợp mã JavaScript để xử lý các sự kiện của người dùng (như click nút), quản lý trạng thái (tải, lỗi), thực hiện việc gọi hàm lấy dữ liệu, xử lý cache và cập nhật dữ liệu lên giao diện.

---

## Xử lý bất đồng bộ

Cơ chế bất đồng bộ là trọng tâm của bài tập, được xử lý như sau:

1.  **Mô phỏng độ trễ:** Hàm `setTimeout` được dùng để trì hoãn việc trả về dữ liệu, giả lập thời gian chờ khi gọi một API thực tế.

2.  **Sử dụng Promise:** Các hàm lấy dữ liệu (`findStudent`, `getFullStudentResults`) được bọc trong một `Promise`.
    *   Khi tìm thấy dữ liệu, `Promise` sẽ `resolve` và trả về kết quả.
    *   Khi không tìm thấy (ví dụ: sai mã sinh viên), `Promise` sẽ `reject` và trả về một `Error`.

3.  **Sử dụng Async/Await:** Hàm `handleSearch` được khai báo là một hàm `async`. Điều này cho phép sử dụng từ khóa `await` để đợi `Promise` từ các hàm lấy dữ liệu hoàn thành.

4.  **Xử lý lỗi:** Toàn bộ logic lấy dữ liệu được đặt trong một khối `try...catch`. Nếu bất kỳ `Promise` nào bị `reject`, khối `catch` sẽ được thực thi, cho phép bắt lỗi và hiển thị thông báo thân thiện cho người dùng.

---

## Quy trình hoạt động (Workflow)

Luồng hoạt động khi người dùng tra cứu mã sinh viên:

1.  Người dùng nhập Mã số sinh viên (MSSV) vào ô input và nhấn nút **"Tra cứu"**.

2.  Hàm `handleSearch` được kích hoạt.

3.  Giao diện ngay lập tức cập nhật trạng thái: Bảng kết quả hiển thị thông báo **"Đang tải..."**.

4.  Hệ thống kiểm tra `localStorage` để xem kết quả của MSSV này đã được lưu trước đó hay chưa.

5.  **Trường hợp có cache (Cache Hit):**
    *   Nếu có, dữ liệu được lấy trực tiếp từ `localStorage`, parse và hiển thị lên bảng.
    *   Quá trình kết thúc nhanh chóng mà không cần giả lập việc gọi API.

6.  **Trường hợp không có cache (Cache Miss):**
    *   Hệ thống gọi hàm `findStudent` và `getFullStudentResults` từ `index.js` bằng `await`.
    *   Trong quá trình này, `setTimeout` sẽ trì hoãn việc trả về kết quả để mô phỏng độ trễ mạng.
    *   Sau khi các hàm `Promise` hoàn thành và trả về dữ liệu, kết quả này sẽ được lưu vào `localStorage` dưới dạng chuỗi JSON để sử dụng cho lần tra cứu tiếp theo.
    *   Dữ liệu được hiển thị lên bảng kết quả.

7.  **Xử lý lỗi:** Nếu ở bước 6, hàm `findStudent` không tìm thấy sinh viên, nó sẽ trả về một `reject`. Khối `try...catch` sẽ bắt được lỗi này và hiển thị thông báo lỗi lên giao diện (ví dụ: "Lỗi: Không tìm thấy sinh viên.").
