# Sales Order Flow Guide

## Mục tiêu

Tài liệu này mô tả riêng flow `phiếu bán hàng` trong project, gồm:

- đơn bán hàng được tạo ở đâu
- ai xử lý từng bước
- controller nào chạy
- service nào đổi trạng thái
- lúc nào tồn kho bị trừ
- lúc nào đơn hoàn tất
- các điểm cần lưu ý trong code hiện tại

## 1. Phiếu bán hàng là gì trong project này

Trong project, phiếu bán hàng được biểu diễn bằng:

- `SalesOrder`
- `SalesOrderDetail`

File:

- `src/main/java/org/clotheswarehouse_hsf/model/SalesOrder.java`
- `src/main/java/org/clotheswarehouse_hsf/model/SalesOrderDetail.java`

`SalesOrder` là phần đầu đơn:

- `salesOrderId`
- `orderCode`
- `customerName`
- `customerEmail`
- `customerPhone`
- `shippingAddress`
- `createdBy`
- `orderDate`
- `status`
- `notes`
- `createdAt`

`SalesOrderDetail` là từng dòng hàng trong đơn:

- sản phẩm nào
- lấy hàng từ kho nào
- số lượng bao nhiêu
- giá bán tại thời điểm tạo đơn

## 2. Các vai trò tham gia vào flow

### `sales_staff`

Vai trò:

- tạo đơn bán hàng
- chỉnh sửa đơn trước khi hoàn tất luồng bán

Controller:

- `src/main/java/org/clotheswarehouse_hsf/controller/saleStaff/SalesOrderController.java`

### `warehouse_manager`

Vai trò:

- duyệt đơn bán
- hoặc hủy đơn bán

Controller:

- `src/main/java/org/clotheswarehouse_hsf/controller/manager/ManagerSalesOrderController.java`

### `warehouse_staff`

Vai trò:

- xử lý xuất kho
- xác nhận giao hàng
- làm bước trừ tồn kho thực tế

Controller:

- `src/main/java/org/clotheswarehouse_hsf/controller/warehouseStaff/SaleWareStaffController.java`

## 3. Flow tổng quát

Luồng bán hàng đầy đủ đang chạy trong code:

1. Sales staff tạo `SalesOrder`.
2. Đơn mới có trạng thái `pending_stock_check`.
3. Warehouse manager duyệt đơn.
4. Đơn chuyển sang `awaiting_shipment`.
5. Warehouse staff mở đơn chờ giao.
6. Warehouse staff xác nhận giao hàng.
7. Hệ thống trừ tồn kho trong `Inventory`.
8. Đơn chuyển sang `shipped`.
9. Khi khách xác nhận thanh toán, đơn chuyển sang `completed`.

## 4. Bước 1: Sales staff tạo phiếu bán hàng

Controller:

- `src/main/java/org/clotheswarehouse_hsf/controller/saleStaff/SalesOrderController.java`

Route chính:

- `GET /saleStaff/salesOrder/salesOrderList`
- `GET /saleStaff/salesOrder/createSaleOrder`
- `POST /saleStaff/salesOrder/createSaleOrder`
- `GET /saleStaff/salesOrder/products`
- `POST /saleStaff/salesOrder/update`

### 4.1 Xem danh sách đơn bán

Method:

- `listOrders(...)`

Luồng:

1. Lấy user hiện tại từ session.
2. Filter đơn theo:
   - `status`
   - `customer`
   - `page`
3. Chỉ lấy đơn của chính sales staff hiện tại.
4. Trả về view:
   - `saleStaff/salesOrder/salesOrderList`

### 4.2 Mở form tạo đơn

Method:

- `showCreateForm(...)`

Luồng:

1. Load toàn bộ warehouse.
2. Load danh sách sản phẩm đang active.
3. Nếu đã chọn kho:
   - load `Inventory` của kho đó
4. Generate mã đơn bằng:
   - `salesOrderService.generateOrderCode()`
5. Trả về view:
   - `saleStaff/salesOrder/createSaleOrder`

### 4.3 Load sản phẩm theo kho

Method:

- `loadProductsByWarehouse(...)`

Luồng:

1. Lấy warehouse theo id.
2. Lấy toàn bộ inventory của kho đó.
3. Chỉ giữ những item có `quantityOnHand > 0`.
4. Có thể search theo tên sản phẩm.
5. Trả HTML động hiển thị:
   - product
   - tồn kho hiện tại
   - trạng thái tồn
   - ô nhập số lượng đặt

Ý nghĩa:

- sales staff chỉ chọn sản phẩm còn tồn trong kho để lên đơn.

### 4.4 Submit tạo đơn bán

Method:

- `handleCreateOrder(...)`

Luồng chi tiết:

1. Nhận dữ liệu:
   - `orderCode`
   - `customerName`
   - `customerEmail`
   - `notes`
   - list `warehouseIds`
   - list `productIds`
   - list `quantities`
2. Kiểm tra user đăng nhập.
3. Kiểm tra phải có ít nhất một sản phẩm.
4. Tạo `SalesOrder` mới:
   - `orderCode`
   - `customerName`
   - `customerEmail`
   - `orderDate = now`
   - `notes`
   - `status = pending_stock_check`
   - `createdAt = now`
   - `createdBy = currentUser`
5. Save `SalesOrder`.
6. Duyệt từng dòng hàng:
   - lấy `Product`
   - lấy `Warehouse`
   - lấy `quantity`
   - tạo `SalesOrderDetail`
   - gán `unitSalePrice = product.getSalePrice()`
7. Save từng detail.

Kết quả:

- Một phiếu bán hàng mới được tạo.
- Trạng thái ban đầu là `pending_stock_check`.

## 5. Bước 2: Warehouse manager duyệt phiếu bán hàng

Controller:

- `src/main/java/org/clotheswarehouse_hsf/controller/manager/ManagerSalesOrderController.java`

Route:

- `GET /manager/salesOrder/list`
- `POST /manager/salesOrder/approve`
- `POST /manager/salesOrder/cancel`
- `GET /manager/salesOrder/view/{id}`

### 5.1 Xem danh sách đơn bán

Method:

- `viewSalesOrderList(...)`

Luồng:

1. Nhận filter:
   - `page`
   - `status`
   - `customer`
2. Gọi:
   - `salesOrderService.filterOrders(customer, status, null, page)`
3. Tính tổng số trang bằng:
   - `salesOrderService.getTotalPages(customer, status, null)`
4. Trả về view:
   - `manager/saleOrder/manageSalesOrderList`

### 5.2 Duyệt đơn bán

Method:

- `approveOrder(...)`

Luồng:

1. Gọi `salesOrderService.approveOrder(id)`.
2. Trong service:
   - chỉ cho duyệt khi status hiện tại là `pending_stock_check`
   - đổi sang `awaiting_shipment`
3. Redirect về list.

### 5.3 Hủy đơn bán

Method:

- `cancelOrder(...)`

Luồng:

1. Gọi `salesOrderService.updateStatus(id, SalesOrder.OrderStatus.cancelled)`.
2. Đơn chuyển sang `cancelled`.

### 5.4 Xem chi tiết đơn

Method:

- `viewOrder(@PathVariable Integer id, Model model)`

Luồng:

1. Lấy `SalesOrder` theo id.
2. Tính tổng giá trị đơn:
   - `quantityOrdered * unitSalePrice`
3. Trả về view:
   - `manager/saleOrder/viewSaleOrder`

## 6. Bước 3: Warehouse staff xử lý xuất kho

Controller:

- `src/main/java/org/clotheswarehouse_hsf/controller/warehouseStaff/SaleWareStaffController.java`

Route:

- `GET /wareStaff/salesOrder/list`
- `GET /wareStaff/salesOrder/edit/{id}`
- `POST /wareStaff/salesOrder/edit`
- `GET /wareStaff/salesOrder/salesOrder/confirm?id=...`

### 6.1 Danh sách đơn chờ giao

Method:

- `listOrders(Model model, @RequestParam(defaultValue = "1") int page)`

Luồng:

1. Chỉ load các đơn có trạng thái:
   - `awaiting_shipment`
2. Gọi:
   - `salesOrderService.findByStatus("awaiting_shipment", page)`
3. Trả về view:
   - `wareStaff/saleOrder/saleOrderList`

Ý nghĩa:

- chỉ khi manager đã duyệt thì warehouse staff mới thấy đơn để xuất kho.

### 6.2 Mở màn hình xử lý giao hàng

Method:

- `editOrder(@PathVariable Integer id, Model model, RedirectAttributes ra)`

Luồng:

1. Tìm đơn theo id.
2. Nếu không tồn tại:
   - báo lỗi
   - redirect về list
3. Nếu trạng thái khác `awaiting_shipment`:
   - báo là đơn đã được giao hoặc không đúng trạng thái
   - redirect về list
4. Nếu hợp lệ:
   - đưa `order` ra view
   - đưa `statusDisplayNames` ra view
5. Trả về:
   - `wareStaff/saleOrder/editSaleOrder`

### 6.3 Warehouse staff cập nhật số lượng giao thực tế

Method:

- `updateOrder(@ModelAttribute SalesOrder orderForm, @RequestParam String action, RedirectAttributes ra)`

Luồng:

1. Load lại `SalesOrder` từ DB theo `salesOrderId`.
2. Kiểm tra order tồn tại và đúng trạng thái `awaiting_shipment`.
3. Nếu form có `orderDetails`:
   - duyệt từng dòng detail gửi lên
   - tìm detail tương ứng trong order gốc
   - cập nhật lại `quantityOrdered`

Ý nghĩa:

- warehouse staff có thể chỉnh số lượng thực tế trước khi xác nhận giao hàng.

### 6.4 Xác nhận giao hàng và trừ tồn kho

Trong cùng method `updateOrder(...)`:

- nếu `action = markDelivered`
  - set order status = `shipped`
  - gọi `salesOrderService.markAsShippedAndSendEmail(order.getSalesOrderId())`

Tuy nhiên bước trừ tồn thực tế nằm trong service.

## 7. Nơi trừ tồn kho thật sự

Service:

- `src/main/java/org/clotheswarehouse_hsf/service/impl/SalesOrderServiceImpl.java`

Method quan trọng nhất:

- `markAsShippedAndSendEmail(Integer orderId)`

Luồng chi tiết:

1. Tìm order theo id.
2. Nếu không có order:
   - throw exception
3. Set order status = `shipped`.
4. Save order.
5. Duyệt từng `SalesOrderDetail`.
6. Với mỗi detail:
   - lấy `Product`
   - lấy `Warehouse`
   - lấy `quantityOrdered`
7. Tìm `Inventory` theo `(product, warehouse)`.
8. Nếu không tìm thấy inventory:
   - throw exception
9. Tính:
   - `newQuantity = inventory.getQuantityOnHand() - qty`
10. Nếu `newQuantity < 0`:
   - throw exception vì không đủ hàng
11. Nếu hợp lệ:
   - update `inventory.setQuantityOnHand(newQuantity)`
   - save inventory
12. Sau đó gửi email thông báo cho khách hàng.

Kết luận:

- Tồn kho bị trừ ở bước `markAsShippedAndSendEmail(...)`.
- Đây là thời điểm “xuất kho” thật sự trong hệ thống.

## 8. Bước 4: Hoàn tất đơn sau thanh toán

Controller:

- `SaleWareStaffController.confirmPaymentFromEmail(...)`

Route:

- `GET /wareStaff/salesOrder/salesOrder/confirm?id=...`

Luồng:

1. Nhận `orderId`.
2. Gọi `salesOrderService.markAsCompleted(orderId)`.
3. Trong service:
   - chỉ cho phép nếu đơn đang ở trạng thái `shipped`
   - đổi sang `completed`
4. Trả HTML xác nhận thành công hoặc lỗi.

Ý nghĩa:

- `shipped` nghĩa là đã giao và đã trừ tồn.
- `completed` nghĩa là giao dịch đã hoàn tất sau xác nhận thanh toán.

## 9. Các trạng thái của phiếu bán hàng

Enum trong `SalesOrder`:

- `pending_stock_check`
- `awaiting_shipment`
- `shipped`
- `completed`
- `cancelled`

### Flow trạng thái chính

Luồng chuẩn đang chạy:

- `pending_stock_check -> awaiting_shipment -> shipped -> completed`

Các nhánh khác:

- `pending_stock_check -> cancelled`
- `awaiting_shipment -> cancelled`

### Ý nghĩa từng trạng thái

- `pending_stock_check`
  - sales staff vừa tạo đơn
  - chờ manager duyệt
- `awaiting_shipment`
  - manager đã duyệt
  - warehouse staff có thể xuất kho
- `shipped`
  - hàng đã giao
  - tồn kho đã bị trừ
- `completed`
  - khách xác nhận thanh toán
- `cancelled`
  - đơn bị hủy

## 10. View nào đi với từng bước

### Sales staff

- danh sách đơn:
  - `src/main/resources/templates/saleStaff/salesOrder/salesOrderList.html`
- tạo đơn:
  - `src/main/resources/templates/saleStaff/salesOrder/createSaleOrder.html`
- chỉnh sửa:
  - `src/main/resources/templates/saleStaff/salesOrder/editSaleOrder.html`
- xem chi tiết:
  - `src/main/resources/templates/saleStaff/salesOrder/viewSalesOrder.html`

### Warehouse manager

- danh sách quản lý:
  - `src/main/resources/templates/manager/saleOrder/manageSalesOrderList.html`
- xem chi tiết:
  - `src/main/resources/templates/manager/saleOrder/viewSaleOrder.html`

### Warehouse staff

- danh sách chờ giao:
  - `src/main/resources/templates/wareStaff/saleOrder/saleOrderList.html`
- màn giao hàng:
  - `src/main/resources/templates/wareStaff/saleOrder/editSaleOrder.html`

## 11. Các điểm cần lưu ý trong code hiện tại

### 11.1 Không có entity phiếu xuất kho riêng

Hệ thống đang dùng luôn `SalesOrder` để đại diện cho flow xuất kho.

Nghĩa là:

- chưa có model kiểu `StockOut`
- chưa có bảng riêng cho phiếu xuất kho
- logic xuất kho nằm trong service của sales order

### 11.2 Bước duyệt manager không kiểm tra tồn kho thật

Khi manager duyệt đơn, service chỉ đổi:

- `pending_stock_check -> awaiting_shipment`

Chưa thấy đoạn code nào check cứng tổng tồn kho ở bước duyệt này.

Việc kiểm tra đủ hàng thật sự chỉ xảy ra khi warehouse staff xác nhận giao và service đi trừ `Inventory`.

### 11.3 `updateOrder(...)` có set status `shipped` hai lần

Trong `SaleWareStaffController.updateOrder(...)`:

- controller set `order.setStatus(shipped)`
- rồi lại gọi `salesOrderService.markAsShippedAndSendEmail(...)`

Mà trong service đó cũng set `shipped` thêm lần nữa.

Điều này không hỏng lớn, nhưng đang bị lặp.

### 11.4 Nếu tồn kho không đủ, service sẽ throw lỗi lúc giao hàng

Tức là:

- đơn đã tới bước `awaiting_shipment`
- nhưng vẫn có thể fail ở bước giao hàng nếu tồn kho thật sự không đủ

## 12. End-to-end ngắn gọn

### Flow đầy đủ

1. Sales staff tạo đơn bán.
2. Đơn ở trạng thái `pending_stock_check`.
3. Warehouse manager duyệt đơn.
4. Đơn chuyển sang `awaiting_shipment`.
5. Warehouse staff mở đơn để xử lý giao.
6. Warehouse staff xác nhận giao hàng.
7. Hệ thống trừ tồn kho trong `Inventory`.
8. Đơn chuyển sang `shipped`.
9. Khách xác nhận thanh toán.
10. Đơn chuyển sang `completed`.

### Bước quan trọng nhất cần nhớ

Nếu chỉ cần nhớ đúng 1 điểm:

- `Inventory` không bị trừ khi sales staff tạo đơn
- không bị trừ khi manager duyệt đơn
- chỉ bị trừ khi warehouse staff giao hàng và gọi `markAsShippedAndSendEmail(...)`

## 13. Các file nên đọc đầu tiên nếu muốn trace sâu hơn

- `src/main/java/org/clotheswarehouse_hsf/controller/saleStaff/SalesOrderController.java`
- `src/main/java/org/clotheswarehouse_hsf/controller/manager/ManagerSalesOrderController.java`
- `src/main/java/org/clotheswarehouse_hsf/controller/warehouseStaff/SaleWareStaffController.java`
- `src/main/java/org/clotheswarehouse_hsf/service/impl/SalesOrderServiceImpl.java`
- `src/main/java/org/clotheswarehouse_hsf/model/SalesOrder.java`
- `src/main/java/org/clotheswarehouse_hsf/model/SalesOrderDetail.java`
- `src/main/java/org/clotheswarehouse_hsf/model/Inventory.java`

## 14. Kết luận

Trong project này, flow `phiếu bán hàng` đang đi qua 3 vai trò:

- `sales_staff` tạo đơn
- `warehouse_manager` duyệt đơn
- `warehouse_staff` giao hàng và trừ tồn kho

Điểm mấu chốt là:

- manager chỉ duyệt trạng thái
- warehouse staff mới là người kích hoạt bước xuất kho thật sự
- service `SalesOrderServiceImpl.markAsShippedAndSendEmail(...)` là nơi tồn kho bị trừ
