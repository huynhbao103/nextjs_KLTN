ở trang home thì có nút bắt đầu khám phá,
- 1 hãy kiểm tra xem người dùng có thông tin hay chưa về user về  Tuổi, cân nặng, giới tính, cường độ vận động trung bình, bệnh lý ,... 
 + 1.1 nếu CHƯA thì chuyển sang trang để  người dùng nhập dữ liệu được lưu vào LongTermDB
   + 1.1.1 tiếp đến Nhập những dữ liệu khác như là tâm trạng hiện tại ,(thời tiết vị trí hiện tại khi nãy đã làm openweather.api),những dữ liệu nhập tiếp khi nãy được lưu vào ShortTermDB
 + 1.2 nếu CÓ dữ liệu người dùng rồi thì hỏi xem người dùng có muốn cập nhật thông tin cá nhân không
   + 1.2.1 nếu KHÔNG thì Lấy dữ liệu của người dùng từ LongTerm DB của tôi.
   + 1.2.2 nếu CÓ thì nhập lại Nhập dữ liệu đầu vào: Tuổi, cân nặng, giới tính, cường độ vận động trung bình, bệnh lý,....
   +1.2.3 tiếp đến Nhập những dữ liệu khác như là tâm trạng hiện tại ,(thời tiết vị trí hiện tại khi nãy đã làm openweather.api),những dữ liệu nhập tiếp khi nãy được lưu vào ShortTermDB
