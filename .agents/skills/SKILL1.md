# Warehouse Manager Flow Guide

## Mục tiêu

Tài liệu này mô tả luồng chạy thực tế trong code cho các phần liên quan đến `warehouse_manager`, gồm:

- product management
- warehouse management
- inventory management
- purchase order
- stock inward
- sales order / stock out có ảnh hưởng trực tiếp đến tồn kho

Tài liệu bám theo controller, service, model, template hiện có trong project Spring Boot này.

## 1. Bản đồ vai trò

Các vai trò đang tham gia vào flow kho:

- `warehouse_manager`: quản lý danh mục, sản phẩm, kho, tồn kho, duyệt đơn mua hàng, duyệt phiếu nhập kho, theo dõi đơn bán hàng.
- `warehouse_staff`: kiểm hàng nhập thực tế và cập nhật tồn kho; xử lý giao hàng cho đơn bán.
- `purchasing_staff`: chọn nhà cung cấp, gửi đơn mua hàng, tạo phiếu nhập kho.
- `sales_staff`: tạo đơn bán hàng, chọn kho xuất.

Sidebar cho `warehouse_manager` nằm ở `src/main/resources/templates/fragments/sidebar.html` và đang dẫn tới các module:

- `/manager/manage-category`
- `/manager/warehouse`
- `/manager/manage-supplier`
- `/manager/manage-product`
- `/manager/inventory`
- `/manager/salesOrder/list`
- `/manager/purchase-orders`
- `/manager/stock-inward/list`

## 2. Chuỗi xử lý tổng quát

Pattern chung của project:

`Request -> Controller -> Service -> Repository/Entity -> Thymeleaf View`

Ví dụ:

- Manager mở danh sách sản phẩm.
- `ManageProductController` nhận request.
- Controller gọi `ProductService`.
- `ProductServiceImpl` gọi `ProductRepository`.
- Dữ liệu được đẩy ra view `manager/product/product`.

## 3. Các controller liên quan tới Warehouse Manager

### 3.1 `ManageCategoryController`

File: `src/main/java/org/clotheswarehouse_hsf/controller/manager/ManageCategoryController.java`

Route gốc:

- `/manager/manage-category`

Luồng chính:

- `GET ?action=list`
  - lấy danh sách category có phân trang và search
  - trả về `manager/category/category`
- `GET ?action=create`
  - mở form tạo mới
  - trả về `manager/category/addCategory`
- `GET ?action=edit&id=...`
  - lấy category theo id
  - trả về `manager/category/editCategory`
- `GET ?action=delete&id=...`
  - kiểm tra category có đang được dùng không qua `categoryService.isInUse(id)`
  - nếu không dùng thì xóa
  - redirect về danh sách
- `POST action=create`
  - validate tên
  - kiểm tra trùng tên
  - tạo category
- `POST action=edit`
  - validate tên
  - kiểm tra trùng tên trừ chính nó
  - cập nhật category

Ý nghĩa trong flow kho:

- Category là master data cho sản phẩm.
- `Product.getUnit()` lấy đơn vị tính từ category.

### 3.2 `ManageSupplierController`

File: `src/main/java/org/clotheswarehouse_hsf/controller/manager/ManageSupplierController.java`

Route gốc:

- `/manager/manage-supplier`

Luồng chính:

- `GET`
  - search + phân trang supplier
  - trả về `manager/suppliers/supplier`
- `POST /create`
  - validate tên, contact person, phone, email, address
  - lưu supplier
- `POST /edit`
  - validate lại dữ liệu
  - cập nhật supplier
- `GET /delete?id=...`
  - xóa supplier

Ý nghĩa trong flow kho:

- Supplier là master data dùng lại trong product, purchase order và stock inward.

### 3.3 `ManageProductController`

File: `src/main/java/org/clotheswarehouse_hsf/controller/manager/ManageProductController.java`

Route gốc:

- `/manager/manage-product`

Luồng chính:

- `GET`
  - lọc theo `keyword`, `active`, `page`, `size`
  - gọi `productService.countSearchWithFilter(...)`
  - gọi `productService.searchWithFilter(...)`
  - nạp thêm category để filter/form
  - trả về `manager/product/product`
- `GET /create`
  - nạp form thêm sản phẩm
  - nạp category + supplier
  - trả về `manager/product/addProduct`
- `POST /create`
  - set `createdAt`, `updatedAt`
  - `productService.save(product)`
  - redirect về danh sách
- `GET /get/{id}`
  - trả JSON sản phẩm theo id
  - thường dùng cho modal/form edit
- `POST /edit`
  - save thẳng object product
  - redirect về danh sách có giữ filter/page
- `GET /delete/{id}`
  - xóa sản phẩm
- `GET /export`
  - export toàn bộ sản phẩm ra Excel
- `POST /import`
  - import Excel
  - map category theo tên
  - map supplier theo tên
  - bỏ qua mã sản phẩm bị trùng
  - save từng product hợp lệ

Ý nghĩa trong flow kho:

- Product là dữ liệu lõi của toàn bộ flow nhập, xuất, tồn.
- `lowStockThreshold` được dùng để đánh giá mức tồn thấp.
- `purchasePrice` được dùng để ước tính giá trong purchase request.
- `salePrice` được dùng ở sales order.

### 3.4 `WarehouseController`

File: `src/main/java/org/clotheswarehouse_hsf/controller/manager/WarehouseController.java`

Route gốc:

- `/manager/warehouse`

Luồng chính:

- `GET`
  - liệt kê kho
  - filter bằng tên kho hoặc địa chỉ
  - trả về `manager/warehouse/warehouse`
- `POST /create`
  - set `createdAt`
  - lưu kho mới
- `POST /update`
  - cập nhật kho
- `GET /{id}/products`
  - mở màn hình sản phẩm trong một kho cụ thể
  - đọc warehouse theo id
  - lọc inventory theo tên sản phẩm và trạng thái stock
  - lấy danh sách sản phẩm chưa có trong kho để add thêm
  - trả về `manager/warehouse/ProductWarehouse`
- `POST /product/add`
  - gọi `warehouseService.addProductToWarehouse(warehouseId, productId, 0)`
  - thực chất là tạo record `Inventory` mới với `quantityOnHand = 0`
- `POST /product/remove`
  - xóa liên kết product ra khỏi kho bằng cách xóa record inventory tương ứng

Ý nghĩa trong flow kho:

- Warehouse quản lý danh sách kho.
- Mối quan hệ giữa product và warehouse đang được thể hiện thông qua bảng `inventory`.
- Thêm product vào kho không cộng tồn ngay; chỉ tạo dòng tồn kho ban đầu bằng 0.

### 3.5 `InventoryController`

File: `src/main/java/org/clotheswarehouse_hsf/controller/manager/InventoryController.java`

Route gốc:

- `/manager/inventory`

Luồng chính:

- `GET`
  - lọc theo `productName`, `warehouseId`, `stockStatus`, `page`, `size`
  - gọi `inventoryService.countFilteredInventories(...)`
  - gọi `inventoryService.findFilteredInventories(...)`
  - nạp thêm list product và warehouse để làm filter
  - trả về `manager/warehouse/inventory`
- `GET /find/{id}`
  - trả JSON inventory theo id
- `GET /export`
  - xuất Excel tồn kho

Ý nghĩa trong flow kho:

- Đây là màn hình manager xem tồn kho tổng hợp.
- Dữ liệu lấy từ bảng `inventory`.
- `quantityOnHand` là số tồn thực tế hiện tại.

### 3.6 `ManagePurchaseOrderController`

File: `src/main/java/org/clotheswarehouse_hsf/controller/manager/ManagePurchaseOrderController.java`

Route gốc:

- `/manager/purchase-orders`

Luồng chính:

- `GET`
  - filter theo `requesterId`, `requestCode`, `status`, `fromDate`, `toDate`
  - gọi `purchaseOrderService.filterAndPaginate(...)`
  - trả về `manager/purchaseOrder/managePurchaseOrder`
- `POST /{id}/approve`
  - gọi `purchaseOrderService.approve(id)`
  - chuyển trạng thái PO sang `approved`
- `POST /{id}/reject`
  - gọi `purchaseOrderService.reject(id)`
  - chuyển trạng thái PO sang `rejected`
- `GET /{id}`
  - mở chi tiết đơn mua hàng
  - trả về `manager/purchaseOrder/viewPurchaseOrder`

Ý nghĩa trong flow kho:

- Đây là bước duyệt chính thức của manager cho yêu cầu mua hàng từ kho.

### 3.7 `ManageStockInwardController`

File: `src/main/java/org/clotheswarehouse_hsf/controller/manager/ManageStockInwardController.java`

Route gốc:

- `/manager/stock-inward`

Luồng chính:

- `GET /list`
  - filter theo `status`, `inwardCode`, khoảng ngày, `userId`, `supplierId`
  - gọi `stockInwardService.filterByManager(...)`
  - trả về `manager/stockInward/manageStockInward`
- `POST /approve`
  - chỉ cho duyệt khi trạng thái là `DRAFT` hoặc `PENDING_CHECK`
  - set status thành `APPROVED`
- `POST /reject`
  - chỉ cho từ chối khi trạng thái là `DRAFT` hoặc `PENDING_CHECK`
  - set status thành `CANCELLED`

Ý nghĩa trong flow kho:

- Manager duyệt phiếu nhập trước khi warehouse staff xác nhận hàng vào kho thực tế.

### 3.8 `ManagerSalesOrderController`

File: `src/main/java/org/clotheswarehouse_hsf/controller/manager/ManagerSalesOrderController.java`

Route gốc:

- `/manager/salesOrder`

Luồng chính:

- `GET /list`
  - filter đơn bán theo trạng thái và khách hàng
  - trả về `manager/saleOrder/manageSalesOrderList`
- `POST /approve`
  - gọi `salesOrderService.approveOrder(id)`
  - đổi trạng thái từ `pending_stock_check` sang `awaiting_shipment`
- `POST /cancel`
  - đổi trạng thái sang `cancelled`
- `GET /view/{id}`
  - xem chi tiết đơn bán
  - tính tổng tiền đơn
  - trả về `manager/saleOrder/viewSaleOrder`

Ý nghĩa trong flow kho:

- Manager có vai trò duyệt đơn bán trước khi warehouse staff thực hiện xuất kho/giao hàng.

## 4. Flow Product Management

Flow thực tế:

1. Manager tạo category và supplier trước.
2. Manager vào `/manager/manage-product`.
3. Form thêm sản phẩm nạp sẵn category + supplier.
4. Khi tạo sản phẩm:
   - set timestamp
   - save vào bảng `products`
5. Khi cần gán sản phẩm vào kho:
   - manager vào `/manager/warehouse/{id}/products`
   - add product vào warehouse
   - hệ thống tạo một dòng `inventory` với số lượng ban đầu bằng 0
6. Sau này hàng nhập thực tế mới cộng tồn vào chính dòng `inventory` này.

Các bảng/model liên quan:

- `Category`
- `Supplier`
- `Product`
- `Inventory`

## 5. Flow Warehouse Management

Flow thực tế:

1. Manager tạo kho tại `/manager/warehouse`.
2. Manager mở từng kho bằng `/manager/warehouse/{id}/products`.
3. Tại đây manager:
   - xem các inventory record của kho đó
   - add product chưa có trong kho
   - remove product khỏi kho
4. Việc add product chỉ tạo chỗ chứa tồn kho, chưa làm tăng số lượng.

Điểm quan trọng:

- Trong code, quan hệ `warehouse <-> product` không có bảng trung gian riêng ngoài `inventory`.
- Vì vậy một sản phẩm được xem là “có trong kho” khi tồn tại dòng `inventory(product_id, warehouse_id)`.

## 6. Flow Inventory Management

Flow thực tế:

1. Manager mở `/manager/inventory`.
2. Controller lấy dữ liệu tồn từ `InventoryRepository`.
3. Manager có thể lọc theo:
   - tên sản phẩm
   - kho
   - tình trạng tồn
4. Có thể export ra Excel.

Nguồn cập nhật tồn:

- Nhập kho: cộng tồn ở `WareStaffStockInwardController.submitCheckForm(...)`
- Xuất kho: trừ tồn ở `SalesOrderServiceImpl.markAsShippedAndSendEmail(...)`

Logic trạng thái tồn kho hiện có:

- `Inventory.getStatus()`
  - `0` -> hết hàng
  - `<= lowStockThreshold` -> sắp hết
  - còn lại -> khả dụng

Lưu ý:

- Màn hình filter tồn kho trong `InventoryRepository` đang dùng rule cứng:
  - `enough` -> `quantity_on_hand > 10`
  - `low` -> `1..10`
  - `out` -> `0`
- Trong khi `Inventory.getStatus()` lại dùng `product.lowStockThreshold`.
- Nghĩa là filter UI và status tính trong entity có thể không đồng nhất.

## 7. Flow Đơn Mua Hàng

### 7.1 Bước 1: tạo yêu cầu mua hàng từ phía kho

Controller:

- `src/main/java/org/clotheswarehouse_hsf/controller/warehouseStaff/WarehouseStaffController.java`

Route:

- `GET /manager/warehouse/order-request`
- `POST /manager/warehouse/order-request/create`

Flow:

1. Người dùng chọn kho.
2. Hệ thống load inventory của kho đó.
3. Người dùng nhập `requestedQuantities[productId]`.
4. Controller tạo `PurchaseOrder`:
   - `requestCode = REQ-<timestamp>`
   - `warehouseId`
   - `requesterId`
   - `requestDate`
   - `status = pending_approval`
   - `notes`
5. Với mỗi sản phẩm có quantity > 0:
   - tạo `PurchaseOrderDetail`
   - `requestedQuantity`
   - `unitPriceEstimated = purchasePrice * quantity`
6. Save toàn bộ order + details.

Kết quả:

- Một yêu cầu mua hàng mới chờ manager duyệt.

### 7.2 Bước 2: warehouse manager duyệt hoặc từ chối

Controller:

- `ManagePurchaseOrderController`

Flow:

1. Manager vào `/manager/purchase-orders`.
2. Hệ thống list các PO theo filter.
3. Nếu chọn duyệt:
   - `PurchaseOrderServiceImpl.approve(id)`
   - status -> `approved`
   - set `approvedAt`
   - update `updatedAt`
4. Nếu chọn từ chối:
   - `PurchaseOrderServiceImpl.reject(id)`
   - status -> `rejected`
   - set `approvedAt`
   - update `updatedAt`

### 7.3 Bước 3: purchasing staff xử lý PO đã duyệt

Controller:

- `src/main/java/org/clotheswarehouse_hsf/controller/purchaseStaff/PurchaseOrderController.java`

Route:

- `GET /purchaseStaff/purchaseOrder`
- `GET /purchaseStaff/purchaseOrder/form?id=...`
- `POST /purchaseStaff/purchaseOrder/update`

Flow:

1. Purchasing staff xem danh sách PO.
2. Chỉ các PO không còn `pending_approval` và không `rejected` mới được lọc ra mặc định.
3. Mở form chi tiết:
   - hiện thông tin kho
   - người yêu cầu
   - supplier list
4. Người mua chọn supplier, sửa notes.
5. Nếu bấm `save`:
   - chỉ lưu supplier/notes
6. Nếu bấm `send`:
   - set status -> `ordered`
   - save
   - gửi email cho supplier bằng `purchaseOrderService.sendOrderEmailToSupplier(existing)`

### 7.4 Trạng thái PO đang có trong code

Enum:

- `pending_approval`
- `approved`
- `rejected`
- `ordered`
- `partially_received`
- `received`

Flow trạng thái thực sự đang chạy:

- `pending_approval -> approved`
- `pending_approval -> rejected`
- `approved -> ordered`

Lưu ý:

- `partially_received` và `received` đã khai báo nhưng hiện chưa thấy nơi nào trong code cập nhật sang 2 trạng thái này.

## 8. Flow Phiếu Nhập Kho

### 8.1 Bước 1: purchasing staff tạo phiếu nhập

Controller:

- `src/main/java/org/clotheswarehouse_hsf/controller/purchaseStaff/StockInwardController.java`

Route:

- `GET /purchaseStaff/stockInward`
- `GET /purchaseStaff/stockInward/create`
- `POST /purchaseStaff/stockInward/create`

Flow:

1. Mở form tạo phiếu nhập.
2. Hệ thống generate `inwardCode = INW<yyyyMMddHHmmss>`.
3. Hệ thống load:
   - warehouse list
   - supplier list
   - product list
   - purchase order list đủ điều kiện
4. Điều kiện lấy PO trong form hiện tại:
   - PO phải có status `approved`
   - PO chưa từng được dùng để tạo stock inward chưa bị `CANCELLED`
5. Khi submit:
   - lấy user hiện tại từ session
   - verify purchase order tồn tại
   - lấy supplier từ `purchaseOrder.supplierId`
   - build `StockInwardDetail` từ các list `productIds`, `quantities`, `negotiatedPrices`, `purchasePrices`
   - set `createdAt = now`
   - set `status = DRAFT`
   - save phiếu nhập

Kết quả:

- Phiếu nhập mới ở trạng thái `DRAFT`.

### 8.2 Bước 2: warehouse manager duyệt phiếu nhập

Controller:

- `ManageStockInwardController`

Flow:

1. Manager vào `/manager/stock-inward/list`.
2. Filter theo người tạo, supplier, trạng thái, mã phiếu, ngày.
3. Nếu duyệt:
   - `DRAFT/PENDING_CHECK -> APPROVED`
4. Nếu từ chối:
   - `DRAFT/PENDING_CHECK -> CANCELLED`

### 8.3 Bước 3: warehouse staff kiểm hàng và cộng tồn

Controller:

- `src/main/java/org/clotheswarehouse_hsf/controller/warehouseStaff/WareStaffStockInwardController.java`

Route:

- `GET /ware-staff/stock-inward/check-list`
- `GET /ware-staff/stock-inward/check/{id}`
- `POST /ware-staff/stock-inward/check`

Flow:

1. Warehouse staff chỉ nhìn thấy phiếu nhập `APPROVED`.
2. Mở form kiểm hàng:
   - load stock inward
   - load inventory hiện tại theo từng product trong warehouse tương ứng
3. Khi submit:
   - nhận `actualQuantities`
   - duyệt từng `StockInwardDetail`
   - set lại `quantityReceived` bằng số thực tế
   - tìm `Inventory` theo `(product, warehouse)`
   - nếu chưa có thì tạo mới với `quantityOnHand = 0`
   - cộng thêm số lượng nhận thực tế
   - update `lastUpdated`
   - save inventory
4. Sau khi xong:
   - set `inwardDate = now`
   - set `status = COMPLETED`
   - save stock inward

Kết quả:

- Tồn kho tăng lên thật sự ở bước này.

### 8.4 Trạng thái stock inward đang có trong code

Enum:

- `DRAFT`
- `PENDING_CHECK`
- `APPROVED`
- `COMPLETED`
- `CANCELLED`

Flow trạng thái thực sự đang chạy:

- `DRAFT -> APPROVED -> COMPLETED`
- `DRAFT -> CANCELLED`

Lưu ý:

- `PENDING_CHECK` có trong enum và được manager cho phép duyệt/từ chối, nhưng hiện chưa thấy controller/service nào set phiếu sang `PENDING_CHECK`.

## 9. Flow liên quan tới Đơn Bán Hàng và Xuất Kho

Phần này không phải mua hàng/nhập kho, nhưng có liên quan trực tiếp tới tồn kho nên warehouse manager vẫn cần nắm.

### 9.1 Tạo đơn bán

Controller:

- `src/main/java/org/clotheswarehouse_hsf/controller/saleStaff/SalesOrderController.java`

Flow:

1. Sales staff tạo đơn bán.
2. Chọn warehouse và product theo inventory hiện có.
3. Đơn mới được set:
   - `status = pending_stock_check`
4. Chi tiết đơn lưu kèm warehouse và product.

### 9.2 Manager duyệt đơn bán

Controller:

- `ManagerSalesOrderController`

Flow:

1. Manager xem list sales order.
2. Nếu duyệt:
   - `pending_stock_check -> awaiting_shipment`
3. Nếu hủy:
   - chuyển sang `cancelled`

### 9.3 Warehouse staff giao hàng và trừ tồn

Controller:

- `src/main/java/org/clotheswarehouse_hsf/controller/warehouseStaff/SaleWareStaffController.java`

Flow:

1. Warehouse staff chỉ nhìn đơn `awaiting_shipment`.
2. Khi bấm giao hàng:
   - gọi `salesOrderService.markAsShippedAndSendEmail(orderId)`
3. Trong service:
   - set order thành `shipped`
   - duyệt từng dòng `SalesOrderDetail`
   - tìm inventory theo `(product, warehouse)`
   - trừ `quantityOrdered`
   - save inventory
   - gửi email thông báo cho khách
4. Khi khách xác nhận thanh toán:
   - endpoint `GET /wareStaff/salesOrder/salesOrder/confirm?id=...`
   - order chuyển sang `completed`

Kết luận:

- Nhập kho cộng tồn ở `WareStaffStockInwardController`.
- Xuất kho trừ tồn ở `SalesOrderServiceImpl.markAsShippedAndSendEmail(...)`.

## 10. Quan hệ giữa các model chính

### Product

- thuộc `Category`
- tham chiếu `Supplier`
- có `purchasePrice`, `salePrice`, `lowStockThreshold`

### Warehouse

- chứa nhiều `Inventory`

### Inventory

- là điểm giao giữa `Product` và `Warehouse`
- giữ `quantityOnHand`

### PurchaseOrder

- đại diện yêu cầu mua hàng cho kho
- chứa nhiều `PurchaseOrderDetail`

### StockInward

- gắn với `PurchaseOrder`
- gắn với `Warehouse`
- gắn với `Supplier`
- chứa nhiều `StockInwardDetail`

### SalesOrder

- gắn với `SalesOrderDetail`
- mỗi detail chọn warehouse xuất hàng cụ thể

## 11. Các bất thường cần lưu ý khi đọc code

### 11.1 `WarehouseStaffController` đang nằm trong package warehouse staff nhưng route lại là manager

Class:

- `controller/warehouseStaff/WarehouseStaffController.java`

Route:

- `/manager/warehouse/order-request`

Điều này cho thấy flow “tạo yêu cầu mua hàng” đang đi chung namespace với manager, dù class nằm ở package warehouse staff.

### 11.2 Flow PO và Stock Inward đang lệch trạng thái

Hiện tại:

- purchasing staff bấm gửi đơn -> PO đổi sang `ordered`
- nhưng form tạo stock inward chỉ load PO có status `approved`

Điều đó có nghĩa là:

- nếu PO đã được gửi và đổi thành `ordered`, nó có thể không còn xuất hiện ở màn tạo phiếu nhập
- flow business hiện tại trong code chưa thật sự khớp hoàn toàn

### 11.3 `purchaseOrderDetailsMap` trong template không khớp model attribute

Trong `createStockInward.html` script đang đọc:

- `purchaseOrderDetailsMap`

Nhưng controller lại add:

- `orderDetailMap`

Ngoài ra phần script hiện cũng không còn dùng dữ liệu PO để auto đổ sản phẩm nữa.

### 11.4 Trạng thái nhận hàng của PO chưa được cập nhật

`partially_received` và `received` có trong enum nhưng chưa có đoạn code nào update sau khi stock inward hoàn tất.

### 11.5 Logic tồn kho thấp chưa thống nhất

- filter inventory dùng ngưỡng cứng `1..10`
- entity `Inventory.getStatus()` dùng `product.lowStockThreshold`

Vì vậy cùng một record có thể hiển thị khác nhau ở các chỗ khác nhau.

## 12. Tóm tắt flow end-to-end quan trọng nhất

### Flow nhập hàng đầy đủ

1. Kho phát sinh nhu cầu bổ sung hàng.
2. Tạo `PurchaseOrder` ở `/manager/warehouse/order-request`.
3. Manager duyệt tại `/manager/purchase-orders`.
4. Purchasing staff chọn supplier và gửi đơn tại `/purchaseStaff/purchaseOrder`.
5. Purchasing staff tạo `StockInward` tại `/purchaseStaff/stockInward/create`.
6. Manager duyệt phiếu nhập tại `/manager/stock-inward/list`.
7. Warehouse staff kiểm hàng thực tế tại `/ware-staff/stock-inward/check/{id}`.
8. Hệ thống cộng tồn kho và hoàn tất phiếu nhập.

### Flow xuất hàng đầy đủ

1. Sales staff tạo `SalesOrder`.
2. Manager duyệt đơn bán.
3. Warehouse staff giao hàng.
4. Hệ thống trừ tồn kho.
5. Khách xác nhận thanh toán, đơn hoàn tất.

## 13. File nên đọc đầu tiên nếu muốn trace tiếp

- `src/main/resources/templates/fragments/sidebar.html`
- `src/main/java/org/clotheswarehouse_hsf/controller/manager/ManageProductController.java`
- `src/main/java/org/clotheswarehouse_hsf/controller/manager/WarehouseController.java`
- `src/main/java/org/clotheswarehouse_hsf/controller/manager/InventoryController.java`
- `src/main/java/org/clotheswarehouse_hsf/controller/manager/ManagePurchaseOrderController.java`
- `src/main/java/org/clotheswarehouse_hsf/controller/manager/ManageStockInwardController.java`
- `src/main/java/org/clotheswarehouse_hsf/controller/warehouseStaff/WarehouseStaffController.java`
- `src/main/java/org/clotheswarehouse_hsf/controller/purchaseStaff/PurchaseOrderController.java`
- `src/main/java/org/clotheswarehouse_hsf/controller/purchaseStaff/StockInwardController.java`
- `src/main/java/org/clotheswarehouse_hsf/controller/warehouseStaff/WareStaffStockInwardController.java`
- `src/main/java/org/clotheswarehouse_hsf/service/impl/PurchaseOrderServiceImpl.java`
- `src/main/java/org/clotheswarehouse_hsf/service/impl/StockInwardServiceImpl.java`
- `src/main/java/org/clotheswarehouse_hsf/service/impl/SalesOrderServiceImpl.java`
