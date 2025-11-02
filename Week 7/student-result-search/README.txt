ỨNG DỤNG TRA CỨU KẾT QUẢ HỌC TẬP

QUẢN LÝ STATE:
- Component App.jsx quản lý toàn bộ state: loading, result, error, studentId
- Component SearchForm.jsx chỉ quản lý state local cho input field

useEffect:
- useEffect được kích hoạt mỗi khi studentId thay đổi
- Nếu studentId rỗng, reset kết quả và không fetch dữ liệu
- Nếu studentId có giá trị, tự động gọi fetchStudentResults() để lấy dữ liệu
- Giả lập độ trễ 2 giây trước khi hiển thị kết quả