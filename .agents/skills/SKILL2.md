# Stock Inward Flow Guide

## Mục tiêu

Tài liệu này chỉ tập trung vào `phiếu nhập kho` trong project, gồm:

- phiếu nhập kho được tạo từ đâu
- ai xử lý từng bước
- controller nào chạy
- service nào cập nhật dữ liệu
- lúc nào tồn kho được cộng thật
- các trạng thái của `StockInward`
- các điểm bất thường hiện có trong code

## 1. Phiếu nhập kho là gì trong project này

Trong code, phiếu nhập kho được biểu diễn bằng model:

- `StockInward`
- `StockInwardDetail`

File:

- `src/main/java/org/clotheswarehouse_hsf/model/StockInward.java`
- `src/main/java/org/clotheswarehouse_hsf/model/StockInwardDetail.java`

`StockInward` giữ thông tin đầu phiếu:

- `stockInwardId`
- `inwardCode`
- `supplier`
- `user`
- `warehouse`
- `purchaseOrder`
- `notes`
- `inwardDate`
- `createdAt`
- `status`

`StockInwardDetail` giữ chi tiết từng sản phẩm:

- `productId`
- `quantityReceived`
- `unitPriceNegotiated`
- `unitPurchasePrice`

## 2. Các vai trò tham gia vào flow nhập kho

### `purchasing_staff`

Vai trò:

- tạo phiếu nhập kho từ đơn mua hàng

Controller:

- `purchaseStaff/StockInwardController`

### `warehouse_manager`

Vai trò:

- duyệt hoặc từ chối phiếu nhập kho

Controller:

- `manager/ManageStockInwardController`

### `warehouse_staff`

Vai trò:

- kiểm hàng thực tế
- nhập số lượng thực nhận
- cộng tồn kho
- hoàn tất phiếu nhập

Controller:

- `warehouseStaff/WareStaffStockInwardController`

## 3. Flow tổng quát của phiếu nhập kho

Luồng đầy đủ đang chạy trong code:

1. Có `PurchaseOrder` trước đó.
2. Purchasing staff tạo `StockInward`.
3. Phiếu nhập được lưu với trạng thái `DRAFT`.
4. Warehouse manager vào màn hình duyệt phiếu nhập.
5. Nếu duyệt thì phiếu chuyển sang `APPROVED`.
6. Warehouse staff mở phiếu đã duyệt để kiểm hàng thực tế.
7. Warehouse staff nhập `actualQuantities`.
8. Hệ thống cộng số lượng vào `Inventory`.
9. Phiếu nhập chuyển sang `COMPLETED`.

## 4. Bước 1: Purchasing staff tạo phiếu nhập kho

Controller:

- `src/main/java/org/clotheswarehouse_hsf/controller/purchaseStaff/StockInwardController.java`

Route:

- `GET /purchaseStaff/stockInward`
- `GET /purchaseStaff/stockInward/create`
- `POST /purchaseStaff/stockInward/create`

### 4.1 Danh sách phiếu nhập

Method:

- `listStockInwards(Model model)`

Luồng:

- gọi `stockInwardService.findAll()`
- đẩy list phiếu nhập ra view
- trả về `purchaseStaff/stockInward/stockInwardList`

### 4.2 Mở form tạo phiếu nhập

Method:

- `showCreateForm(Model model, HttpSession session)`

Luồng:

1. Tạo object `StockInward` mới.
2. Generate mã phiếu bằng `generateInwardCode()`.
3. Load danh sách supplier.
4. Load danh sách warehouse.
5. Load danh sách product.
6. Tìm các `PurchaseOrder` có thể dùng để tạo phiếu nhập.

Điều kiện lấy `PurchaseOrder` hiện tại:

- lấy toàn bộ stock inward
- loại các phiếu đã `CANCELLED`
- lấy `purchaseOrder.id` đã từng dùng
- chỉ giữ các `PurchaseOrder` có status `approved`
- và chưa nằm trong danh sách đã dùng

Kết quả:

- form tạo phiếu nhập hiển thị tại `purchaseStaff/stockInward/createStockInward`

### 4.3 Submit tạo phiếu nhập

Method:

- `createStockInward(...)`

Luồng chi tiết:

1. Nhận dữ liệu:
   - `stockInward`
   - `productIds`
   - `quantities`
   - `negotiatedPrices`
   - `purchasePrices`
2. Kiểm tra kích thước các list phải khớp nhau.
3. Lấy user hiện tại từ session và gán vào `stockInward.setUser(currentUser)`.
4. Lấy lại `PurchaseOrder` từ DB theo id.
5. Từ `purchaseOrder.getSupplierId()` tìm ra `Supplier`.
6. Gán `purchaseOrder` và `supplier` vào `stockInward`.
7. Tạo danh sách `StockInwardDetail`:
   - `productId`
   - `quantityReceived`
   - `unitPriceNegotiated`
   - `unitPurchasePrice`
   - `stockInward`
8. Gán `details` vào `stockInward`.
9. Set:
   - `createdAt = LocalDateTime.now()`
   - `status = DRAFT`
10. Gọi `stockInwardService.save(stockInward)`.

Kết quả:

- Một phiếu nhập kho mới được tạo ở trạng thái `DRAFT`.

## 5. Bước 2: Warehouse manager duyệt phiếu nhập

Controller:

- `src/main/java/org/clotheswarehouse_hsf/controller/manager/ManageStockInwardController.java`

Route:

- `GET /manager/stock-inward/list`
- `POST /manager/stock-inward/approve`
- `POST /manager/stock-inward/reject`

### 5.1 Xem danh sách phiếu nhập

Method:

- `list(...)`

Luồng:

1. Nhận filter:
   - `page`
   - `size`
   - `status`
   - `inwardCode`
   - `startDate`
   - `endDate`
   - `userId`
   - `supplierId`
2. Chuyển `startDate`, `endDate` sang `LocalDateTime`.
3. Gọi `stockInwardService.filterByManager(...)`.
4. Load thêm:
   - `StockInwardStatus.values()`
   - list purchasing staff
   - list supplier
5. Trả về view `manager/stockInward/manageStockInward`.

### 5.2 Duyệt phiếu nhập

Method:

- `approveStockInward(@RequestParam("id") Integer id, ...)`

Luồng:

1. Tìm `StockInward` theo id.
2. Chỉ cho duyệt nếu status là:
   - `PENDING_CHECK`
   - hoặc `DRAFT`
3. Nếu hợp lệ:
   - set status = `APPROVED`
   - save lại
4. Redirect về list.

### 5.3 Từ chối phiếu nhập

Method:

- `rejectStockInward(@RequestParam("id") Integer id, ...)`

Luồng:

1. Tìm `StockInward`.
2. Chỉ cho từ chối nếu status là:
   - `PENDING_CHECK`
   - hoặc `DRAFT`
3. Nếu hợp lệ:
   - set status = `CANCELLED`
   - save lại
4. Redirect về list.

## 6. Bước 3: Warehouse staff kiểm hàng và nhập kho

Controller:

- `src/main/java/org/clotheswarehouse_hsf/controller/warehouseStaff/WareStaffStockInwardController.java`

Route:

- `GET /ware-staff/stock-inward/check-list`
- `GET /ware-staff/stock-inward/check/{id}`
- `POST /ware-staff/stock-inward/check`

### 6.1 Danh sách phiếu chờ kiểm

Method:

- `showApprovedList(...)`

Luồng:

1. Tạo `Pageable` sắp xếp theo `createdAt desc`.
2. Gọi `stockInwardService.pageByStatus(StockInwardStatus.APPROVED, pageable)`.
3. Chỉ phiếu `APPROVED` mới xuất hiện cho warehouse staff.
4. Trả về view `wareStaff/stockInward/checkList`.

### 6.2 Mở form kiểm hàng

Method:

- `showCheckForm(@PathVariable("id") Integer id, ...)`

Luồng:

1. Tìm `StockInward` theo id.
2. Nếu không tồn tại hoặc status khác `APPROVED`:
   - báo lỗi
   - redirect về list
3. Duyệt từng `StockInwardDetail`.
4. Với mỗi detail:
   - lấy `productId`
   - lấy `warehouseId` từ `stock.getWarehouse()`
   - tìm inventory hiện có theo `(productId, warehouseId)`
5. Tạo `inventoryMap` để hiển thị số lượng hiện tại.
6. Đẩy `stock` và `inventoryMap` ra view `wareStaff/stockInward/checkForm`.

Ý nghĩa:

- Đây là bước kiểm tra thực tế trước khi cộng tồn.

### 6.3 Submit kiểm hàng và cộng tồn

Method:

- `submitCheckForm(...)`

Đây là bước quan trọng nhất của flow nhập kho.

Luồng chi tiết:

1. Nhận:
   - `stockInwardId`
   - `actualQuantities`
2. Tìm `StockInward` theo id.
3. Lấy danh sách `StockInwardDetail`.
4. Kiểm tra số lượng input có khớp số dòng detail hay không.
5. Duyệt từng detail:
   - lấy `quantity = actualQuantities.get(i)`
   - set `detail.setQuantityReceived(quantity)`
6. Với mỗi detail:
   - tìm `Inventory` theo `(product, warehouse)`
   - nếu chưa có thì tạo mới:
     - `product`
     - `warehouse`
     - `quantityOnHand = 0`
7. Cộng tồn:
   - `inventory.setQuantityOnHand(inventory.getQuantityOnHand() + quantity)`
8. Set:
   - `inventory.setLastUpdated(new Timestamp(...))`
9. Save `Inventory`.
10. Sau khi xong tất cả detail:
    - `stock.setInwardDate(LocalDateTime.now())`
    - `stock.setStatus(StockInwardStatus.COMPLETED)`
11. Save lại `StockInward`.

Kết luận:

- Tồn kho chỉ được cộng thật ở bước này.
- Trước đó tạo phiếu hay manager duyệt chưa làm tăng tồn.

## 7. Service đứng sau flow nhập kho

Service:

- `src/main/java/org/clotheswarehouse_hsf/service/impl/StockInwardServiceImpl.java`

Các method quan trọng:

### `save(StockInward stockInward)`

Luồng:

- nếu status null thì set `DRAFT`
- nếu `createdAt` null thì set thời gian hiện tại
- save qua repository

### `findById(Integer id)`

Luồng:

- lấy phiếu nhập theo id

### `pageByStatus(StockInwardStatus status, Pageable pageable)`

Luồng:

- dùng cho warehouse staff lấy danh sách phiếu `APPROVED`

### `filterByManager(...)`

Luồng:

- manager lọc phiếu theo trạng thái, mã phiếu, ngày, user, supplier

## 8. Repository và nơi lưu dữ liệu

Repository:

- `src/main/java/org/clotheswarehouse_hsf/repository/StockInwardRepository.java`

Các method chính:

- `findByStatus(...)`
- `findAllByStatus(...)`
- `filter(...)`
- `findAll(Specification, pageable)`

Phiếu nhập được lưu vào:

- bảng `stockinwards`
- bảng `stockinwarddetails`

Khi hoàn tất nhập kho, tồn được cập nhật vào:

- bảng `inventory`

## 9. Trạng thái của phiếu nhập kho

Enum:

- `DRAFT`
- `PENDING_CHECK`
- `APPROVED`
- `COMPLETED`
- `CANCELLED`

File:

- `src/main/java/org/clotheswarehouse_hsf/model/enums/StockInwardStatus.java`

### Flow trạng thái đang chạy thực tế

Flow đang thấy rõ trong code:

- `DRAFT -> APPROVED -> COMPLETED`
- `DRAFT -> CANCELLED`

### Trạng thái `PENDING_CHECK`

Trạng thái này có trong enum và manager có thể duyệt/từ chối khi phiếu ở `PENDING_CHECK`, nhưng hiện chưa thấy đoạn code nào chủ động chuyển phiếu sang trạng thái này.

Nói cách khác:

- enum có hỗ trợ
- controller manager có hỗ trợ
- nhưng flow tạo phiếu hiện tại đang đi thẳng `DRAFT -> APPROVED`

## 10. Quan hệ giữa phiếu nhập kho và đơn mua hàng

`StockInward` có quan hệ:

- `@ManyToOne PurchaseOrder purchaseOrder`

Ý nghĩa:

- một phiếu nhập đang được gắn với một đơn mua hàng
- purchasing staff phải chọn `PurchaseOrder` khi tạo `StockInward`

Điểm đáng chú ý:

- controller tạo phiếu nhập hiện tại chỉ load `PurchaseOrder` có status `approved`
- trong khi ở flow mua hàng, purchasing staff khi gửi đơn cho supplier lại đổi `PurchaseOrder` sang `ordered`

Điều này tạo ra khả năng lệch flow:

- PO đã `ordered` có thể không còn xuất hiện trong form tạo stock inward

## 11. View nào đi với từng bước

### Purchasing staff

- danh sách: `src/main/resources/templates/purchaseStaff/stockInward/stockInwardList.html`
- form tạo: `src/main/resources/templates/purchaseStaff/stockInward/createStockInward.html`

### Warehouse manager

- màn duyệt: `src/main/resources/templates/manager/stockInward/manageStockInward.html`

### Warehouse staff

- danh sách chờ kiểm: `src/main/resources/templates/wareStaff/stockInward/checkList.html`
- form kiểm hàng: `src/main/resources/templates/wareStaff/stockInward/checkForm.html`

## 12. End-to-end ngắn gọn

### Flow đầy đủ

1. `PurchaseOrder` đã được tạo trước đó.
2. Purchasing staff mở form tạo phiếu nhập.
3. Chọn kho, chọn PO, nhập danh sách sản phẩm.
4. Submit và tạo `StockInward` ở trạng thái `DRAFT`.
5. Warehouse manager duyệt phiếu.
6. Phiếu chuyển sang `APPROVED`.
7. Warehouse staff mở phiếu để kiểm hàng thực tế.
8. Nhập số lượng thực nhận.
9. Hệ thống cộng tồn vào `Inventory`.
10. Phiếu nhập chuyển sang `COMPLETED`.

### Bước cộng tồn thật sự

Nếu cần nhớ đúng 1 điểm quan trọng nhất:

- `StockInward` không cộng tồn ở bước tạo
- không cộng tồn ở bước manager duyệt
- chỉ cộng tồn ở `WareStaffStockInwardController.submitCheckForm(...)`

## 13. Những chỗ nên đọc đầu tiên nếu muốn trace sâu hơn

- `src/main/java/org/clotheswarehouse_hsf/controller/purchaseStaff/StockInwardController.java`
- `src/main/java/org/clotheswarehouse_hsf/controller/manager/ManageStockInwardController.java`
- `src/main/java/org/clotheswarehouse_hsf/controller/warehouseStaff/WareStaffStockInwardController.java`
- `src/main/java/org/clotheswarehouse_hsf/service/impl/StockInwardServiceImpl.java`
- `src/main/java/org/clotheswarehouse_hsf/model/StockInward.java`
- `src/main/java/org/clotheswarehouse_hsf/model/StockInwardDetail.java`
- `src/main/java/org/clotheswarehouse_hsf/model/Inventory.java`
- `src/main/java/org/clotheswarehouse_hsf/model/enums/StockInwardStatus.java`

## 14. Kết luận

Trong project này, `phiếu nhập kho` là một flow 3 lớp vai trò:

- `purchasing_staff` tạo phiếu
- `warehouse_manager` duyệt phiếu
- `warehouse_staff` kiểm hàng và cộng tồn

Nơi quyết định hàng đã thực sự vào kho hay chưa không nằm ở bước tạo phiếu, mà nằm ở bước warehouse staff xác nhận và cập nhật `Inventory`.
