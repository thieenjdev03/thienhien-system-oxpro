# Thiện Hiền

Website và trang quản trị của CÔNG TY TNHH SẢN XUẤT THIỆN HIỀN, xưởng sản xuất phụ kiện sắt và sắt mỹ thuật. Trang công khai giới thiệu sản phẩm; trang quản trị quản lý bán hàng và công nợ.

## Language

**Nhóm sản phẩm**:
Cách phân loại sản phẩm (pano sắt, bản lề, chông sắt…), do người dùng tự thêm, sửa, xoá.
_Avoid_: Danh mục, category

**Sản phẩm**:
Một mặt hàng công ty bán, nhận diện bằng mã hàng, thuộc một nhóm sản phẩm, có đơn vị tính và giá bán mặc định.
_Avoid_: Hàng hoá, item

**Mã hàng**:
Mã định danh duy nhất của một sản phẩm.
_Avoid_: SKU, mã SP

**Đơn vị tính**:
Đơn vị đo số lượng của sản phẩm (cái, bộ, mét, kg), quản lý như một danh sách riêng.
_Avoid_: ĐVT, unit

**Hiện trên web**:
Cờ của sản phẩm quyết định có xuất hiện ở trang công khai hay không. Giá không bao giờ hiển thị công khai.

**Lưu trữ**:
Cách ẩn khách hàng, sản phẩm, nhóm sản phẩm hay đơn vị tính đã có phiếu liên quan khỏi danh sách chọn mà vẫn giữ lịch sử; chỉ mục chưa từng được dùng mới xoá hẳn được.
_Avoid_: Xoá mềm

**Khách hàng**:
Cá nhân hoặc đơn vị mua hàng của công ty, có lịch sử phiếu bán hàng và công nợ.
_Avoid_: Client, đối tác

**Khách lẻ**:
Khách hàng mặc định có sẵn cho người mua vãng lai, không theo dõi công nợ nên phải trả đủ khi lập phiếu.

## Bán hàng và công nợ

**Phiếu bán hàng**:
Chứng từ nội bộ ghi khách hàng, các dòng hàng, chiết khấu, VAT (nếu có) và tổng tiền; xuất PDF để đối chiếu với khách và giao kế toán thuê ngoài lập hoá đơn điện tử. Không có giá trị pháp lý như hoá đơn điện tử.
_Avoid_: Hoá đơn (dành cho hoá đơn điện tử của kế toán)

**Chiết khấu**:
Giảm giá theo phần trăm trên từng dòng hàng, cộng thêm một khoản giảm cả phiếu bằng số tiền. VAT (một ô phần trăm cho cả phiếu, mặc định 0) tính sau chiết khấu.

**Số phiếu**:
Mã liên tục không nhảy số của phiếu bán hàng, dạng `PBH-2026-0001`, đánh lại từ 0001 mỗi năm.

**Trạng thái phiếu**:
Phiếu bán hàng là **Nháp** (sửa tự do), **Đã xuất** (khoá nội dung, chỉ xem và in PDF) hoặc **Đã huỷ** (giữ số phiếu và lý do, không tính vào công nợ). Phiếu sai thì huỷ rồi lập phiếu mới, không sửa đè.

**Dòng hàng**:
Một dòng trên phiếu bán hàng: sản phẩm (hoặc tên nhập tay), đơn vị tính, số lượng, đơn giá. Đơn giá được sao chép từ giá mặc định lúc lập phiếu và sửa được, nên đổi giá sau không làm sai phiếu cũ.

**Thu tiền**:
Một lần khách trả tiền (ngày, số tiền, hình thức), gắn vào khách và tự trừ vào phiếu cũ nhất trước, có thể chỉnh tay sang phiếu khác. Khoản "khách trả trước" khi lập phiếu cũng là một lần thu tiền gắn vào phiếu đó.
_Avoid_: Thanh toán, payment

**Số dư đầu kỳ**:
Khoản khách còn nợ trước khi dùng phần mềm, do người dùng nhập tay cho từng khách.

**Công nợ**:
Số tiền khách còn nợ = số dư đầu kỳ + tổng phần chưa trả của các phiếu bán hàng − thu tiền.
_Avoid_: Nợ, debt

**Yêu cầu báo giá**:
Danh sách sản phẩm khách chọn trên trang công khai để hỏi giá. Khác với phiếu bán hàng: không có giá và không ghi nhận bán.
_Avoid_: Đơn hàng

**Sao kê công nợ**:
Trang của một khách hàng liệt kê phiếu bán hàng, thu tiền và số dư đầu kỳ theo thời gian kèm công nợ luỹ kế, lọc được theo khoảng ngày và xuất PDF.

## Người dùng

**Admin**:
Vai trò làm được mọi thứ: quản lý tài khoản, giá và nhóm sản phẩm, huỷ phiếu, sửa số dư đầu kỳ.

**Kế toán**:
Vai trò xem tất cả, tạo phiếu, thu tiền và xuất PDF; không quản lý tài khoản, không huỷ phiếu, không sửa giá, nhóm sản phẩm hay số dư đầu kỳ.
