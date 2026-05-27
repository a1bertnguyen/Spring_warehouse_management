INSERT INTO users (id, active, created_at, email, name, password, phone_number, role)
VALUES
  (1, b'1', CURRENT_TIMESTAMP(6), 'admin@warehouse.local', 'System Admin', '$2a$10$LzeEo1Pgalybft459m/3w.cBaoF./lHR7hvwrlVbn3QtAW0BD/ZS.', '0900000001', 'ADMIN'),
  (2, b'1', CURRENT_TIMESTAMP(6), 'manager@warehouse.local', 'Operations Manager', '$2a$10$LzeEo1Pgalybft459m/3w.cBaoF./lHR7hvwrlVbn3QtAW0BD/ZS.', '0900000002', 'MANAGER'),
  (3, b'1', CURRENT_TIMESTAMP(6), 'purchase@warehouse.local', 'Purchase Staff', '$2a$10$LzeEo1Pgalybft459m/3w.cBaoF./lHR7hvwrlVbn3QtAW0BD/ZS.', '0900000003', 'PURCHASE_STAFF'),
  (4, b'1', CURRENT_TIMESTAMP(6), 'sales@warehouse.local', 'Sales Staff', '$2a$10$LzeEo1Pgalybft459m/3w.cBaoF./lHR7hvwrlVbn3QtAW0BD/ZS.', '0900000004', 'SALE_STAFF'),
  (5, b'1', CURRENT_TIMESTAMP(6), 'warehouse@warehouse.local', 'Warehouse Staff', '$2a$10$LzeEo1Pgalybft459m/3w.cBaoF./lHR7hvwrlVbn3QtAW0BD/ZS.', '0900000005', 'WAREHOUSE_STAFF')
ON DUPLICATE KEY UPDATE
  active = VALUES(active),
  name = VALUES(name),
  password = VALUES(password),
  phone_number = VALUES(phone_number),
  role = VALUES(role);

INSERT INTO categories (id, deleted, name)
VALUES
  (1, b'0', 'Beverages'),
  (2, b'0', 'Electronics'),
  (3, b'0', 'Office Supplies'),
  (4, b'0', 'Packaging')
ON DUPLICATE KEY UPDATE
  deleted = VALUES(deleted),
  name = VALUES(name);

INSERT INTO suppliers (id, address, contact_info, name)
VALUES
  (1, '123 Nguyen Hue, Ho Chi Minh City', 'beverages@supplier.local | 028-1111-2222', 'Fresh Drinks Co.'),
  (2, '88 Hai Ba Trung, Ho Chi Minh City', 'electronics@supplier.local | 028-3333-4444', 'Tech Source Ltd.'),
  (3, '15 Le Loi, Da Nang', 'office@supplier.local | 0236-555-7777', 'Office Hub Vietnam')
ON DUPLICATE KEY UPDATE
  address = VALUES(address),
  contact_info = VALUES(contact_info),
  name = VALUES(name);

INSERT INTO warehouses (warehouse_id, address, created_at, deleted, warehouse_name)
VALUES
  (1, 'Lot A, Thu Duc Logistics Park, Ho Chi Minh City', CURRENT_TIMESTAMP(6), b'0', 'Main Warehouse'),
  (2, '45 Tran Phu, Da Nang', CURRENT_TIMESTAMP(6), b'0', 'Central Warehouse')
ON DUPLICATE KEY UPDATE
  address = VALUES(address),
  deleted = VALUES(deleted),
  warehouse_name = VALUES(warehouse_name);

INSERT INTO products (
  id, created_at, deleted, description, expiry_date, image_url, low_stock_threshold,
  name, purchaseprice, sale_price, sku, status, stock_quantity, supplier_id, unit, updated_at, category_id
)
VALUES
  (1, CURRENT_TIMESTAMP(6), b'0', '330ml canned cola for retail sale', '2099-12-31 00:00:00', NULL, 20, 'Cola 330ml', 6.50, 9.50, 'BEV-COLA-330', 'active', 140, 1, 'can', CURRENT_TIMESTAMP(6), 1),
  (2, CURRENT_TIMESTAMP(6), b'0', 'Orange juice bottle 1L', '2099-12-31 00:00:00', NULL, 15, 'Orange Juice 1L', 18.00, 25.00, 'BEV-OJ-1L', 'active', 95, 1, 'bottle', CURRENT_TIMESTAMP(6), 1),
  (3, CURRENT_TIMESTAMP(6), b'0', 'Wireless barcode scanner for warehouse staff', '2099-12-31 00:00:00', NULL, 5, 'Barcode Scanner X2', 420.00, 550.00, 'ELE-SCAN-X2', 'active', 18, 2, 'unit', CURRENT_TIMESTAMP(6), 2),
  (4, CURRENT_TIMESTAMP(6), b'0', 'Thermal label printer 4 inch', '2099-12-31 00:00:00', NULL, 4, 'Label Printer LP-420', 1250.00, 1490.00, 'ELE-PRN-LP420', 'active', 9, 2, 'unit', CURRENT_TIMESTAMP(6), 2),
  (5, CURRENT_TIMESTAMP(6), b'0', 'A4 copy paper 70gsm pack', '2099-12-31 00:00:00', NULL, 25, 'A4 Paper Pack', 52.00, 68.00, 'OFF-PAPER-A4', 'active', 220, 3, 'pack', CURRENT_TIMESTAMP(6), 3),
  (6, CURRENT_TIMESTAMP(6), b'0', 'Carton sealing tape clear 48mm', '2099-12-31 00:00:00', NULL, 30, 'Sealing Tape 48mm', 11.00, 16.00, 'PKG-TAPE-48', 'active', 180, 3, 'roll', CURRENT_TIMESTAMP(6), 4)
ON DUPLICATE KEY UPDATE
  deleted = VALUES(deleted),
  description = VALUES(description),
  expiry_date = VALUES(expiry_date),
  image_url = VALUES(image_url),
  low_stock_threshold = VALUES(low_stock_threshold),
  name = VALUES(name),
  purchaseprice = VALUES(purchaseprice),
  sale_price = VALUES(sale_price),
  status = VALUES(status),
  stock_quantity = VALUES(stock_quantity),
  supplier_id = VALUES(supplier_id),
  unit = VALUES(unit),
  updated_at = VALUES(updated_at),
  category_id = VALUES(category_id);

INSERT INTO inventory (inventory_id, last_updated, quantity_on_hand, product_id, warehouse_id)
VALUES
  (1, CURRENT_TIMESTAMP(6), 90, 1, 1),
  (2, CURRENT_TIMESTAMP(6), 50, 1, 2),
  (3, CURRENT_TIMESTAMP(6), 60, 2, 1),
  (4, CURRENT_TIMESTAMP(6), 35, 2, 2),
  (5, CURRENT_TIMESTAMP(6), 12, 3, 1),
  (6, CURRENT_TIMESTAMP(6), 6, 3, 2),
  (7, CURRENT_TIMESTAMP(6), 5, 4, 1),
  (8, CURRENT_TIMESTAMP(6), 4, 4, 2),
  (9, CURRENT_TIMESTAMP(6), 150, 5, 1),
  (10, CURRENT_TIMESTAMP(6), 70, 5, 2),
  (11, CURRENT_TIMESTAMP(6), 110, 6, 1),
  (12, CURRENT_TIMESTAMP(6), 70, 6, 2)
ON DUPLICATE KEY UPDATE
  last_updated = VALUES(last_updated),
  quantity_on_hand = VALUES(quantity_on_hand),
  product_id = VALUES(product_id),
  warehouse_id = VALUES(warehouse_id);

INSERT INTO customers (
  id, created_at, default_shipping_address, email, name, phone_number, updated_at
)
VALUES
  (1, CURRENT_TIMESTAMP(6), '12 Le Thanh Ton, District 1, Ho Chi Minh City', 'buyer1@client.local', 'Minh Retail', '0911000001', CURRENT_TIMESTAMP(6)),
  (2, CURRENT_TIMESTAMP(6), '98 Bach Dang, Hai Chau, Da Nang', 'buyer2@client.local', 'Da Nang Mart', '0911000002', CURRENT_TIMESTAMP(6)),
  (3, CURRENT_TIMESTAMP(6), '25 Tran Hung Dao, Ninh Kieu, Can Tho', 'buyer3@client.local', 'Can Tho Trading', '0911000003', CURRENT_TIMESTAMP(6))
ON DUPLICATE KEY UPDATE
  default_shipping_address = VALUES(default_shipping_address),
  email = VALUES(email),
  name = VALUES(name),
  phone_number = VALUES(phone_number),
  updated_at = VALUES(updated_at);

INSERT INTO purchase_requests (
  request_id, approved_at, created_at, notes, request_code, request_date,
  user_id_requester, status, supplier_id, updated_at, warehouse_id
)
VALUES
  (1, CURRENT_TIMESTAMP(6) - INTERVAL 10 DAY, CURRENT_TIMESTAMP(6) - INTERVAL 11 DAY,
   'Replenish scanning devices for inbound and cycle count operations.',
   'PR-202605-001', CURRENT_TIMESTAMP(6) - INTERVAL 11 DAY, 3, 'converted', 2,
   CURRENT_TIMESTAMP(6) - INTERVAL 9 DAY, 1),
  (2, CURRENT_TIMESTAMP(6) - INTERVAL 6 DAY, CURRENT_TIMESTAMP(6) - INTERVAL 7 DAY,
   'Prepare office and packaging materials for June promotions.',
   'PR-202605-002', CURRENT_TIMESTAMP(6) - INTERVAL 7 DAY, 3, 'approved', 3,
   CURRENT_TIMESTAMP(6) - INTERVAL 5 DAY, 2),
  (3, NULL, CURRENT_TIMESTAMP(6) - INTERVAL 2 DAY,
   'Need additional beverage stock for the weekend sales push.',
   'PR-202605-003', CURRENT_TIMESTAMP(6) - INTERVAL 2 DAY, 3, 'pending_approval', 1,
   CURRENT_TIMESTAMP(6) - INTERVAL 2 DAY, 1)
ON DUPLICATE KEY UPDATE
  approved_at = VALUES(approved_at),
  created_at = VALUES(created_at),
  notes = VALUES(notes),
  request_code = VALUES(request_code),
  request_date = VALUES(request_date),
  user_id_requester = VALUES(user_id_requester),
  status = VALUES(status),
  supplier_id = VALUES(supplier_id),
  updated_at = VALUES(updated_at),
  warehouse_id = VALUES(warehouse_id);

INSERT INTO purchase_request_details (
  request_detail_id, note, product_id, requested_quantity, supplier_id_suggested, unit_price_estimated, request_id
)
VALUES
  (1, 'For receiving team handheld devices', 3, 6, 2, 420.00, 1),
  (2, 'For product labeling station', 4, 3, 2, 1250.00, 1),
  (3, 'Buffer stock for admin office', 5, 40, 3, 52.00, 2),
  (4, 'Packing station resupply', 6, 30, 3, 11.00, 2),
  (5, 'Weekend campaign beverage demand', 2, 50, 1, 18.00, 3)
ON DUPLICATE KEY UPDATE
  note = VALUES(note),
  product_id = VALUES(product_id),
  requested_quantity = VALUES(requested_quantity),
  supplier_id_suggested = VALUES(supplier_id_suggested),
  unit_price_estimated = VALUES(unit_price_estimated),
  request_id = VALUES(request_id);

INSERT INTO purchase_orders (
  request_id, created_at, notes, request_code, request_date, purchase_request_id,
  user_id_requester, status, supplier_id, updated_at, warehouse_id
)
VALUES
  (1, CURRENT_TIMESTAMP(6) - INTERVAL 9 DAY,
   'Converted from approved purchase request for scanners and printers.',
   'PO-202605-001', CURRENT_TIMESTAMP(6) - INTERVAL 9 DAY, 1,
   3, 'received', 2, CURRENT_TIMESTAMP(6) - INTERVAL 8 DAY, 1),
  (2, CURRENT_TIMESTAMP(6) - INTERVAL 4 DAY,
   'Office and packaging materials split delivery.',
   'PO-202605-002', CURRENT_TIMESTAMP(6) - INTERVAL 4 DAY, 2,
   3, 'partially_received', 3, CURRENT_TIMESTAMP(6) - INTERVAL 1 DAY, 2)
ON DUPLICATE KEY UPDATE
  created_at = VALUES(created_at),
  notes = VALUES(notes),
  request_code = VALUES(request_code),
  request_date = VALUES(request_date),
  purchase_request_id = VALUES(purchase_request_id),
  user_id_requester = VALUES(user_id_requester),
  status = VALUES(status),
  supplier_id = VALUES(supplier_id),
  updated_at = VALUES(updated_at),
  warehouse_id = VALUES(warehouse_id);

INSERT INTO purchase_order_details (
  request_detail_id, note, requested_quantity, product_id, supplier_id_suggested, unit_price_estimated, request_id
)
VALUES
  (1, 'Inbound device replenishment', 6, 3, 2, 420.00, 1),
  (2, 'Labeling printer replenishment', 3, 4, 2, 1250.00, 1),
  (3, 'Office paper partial delivery expected first', 40, 5, 3, 52.00, 2),
  (4, 'Tape delivery can be split across batches', 30, 6, 3, 11.00, 2)
ON DUPLICATE KEY UPDATE
  note = VALUES(note),
  requested_quantity = VALUES(requested_quantity),
  product_id = VALUES(product_id),
  supplier_id_suggested = VALUES(supplier_id_suggested),
  unit_price_estimated = VALUES(unit_price_estimated),
  request_id = VALUES(request_id);

INSERT INTO stockinwards (
  stock_inward_id, created_at, inward_code, inward_date, notes, status,
  purchase_order_id, supplier_id, user_id, warehouse_id
)
VALUES
  (1, CURRENT_TIMESTAMP(6) - INTERVAL 8 DAY, 'SI-202605-001', CURRENT_TIMESTAMP(6) - INTERVAL 8 DAY,
   'Full receipt for scanner and printer order.', 'COMPLETED', 1, 2, 5, 1),
  (2, CURRENT_TIMESTAMP(6) - INTERVAL 1 DAY, 'SI-202605-002', CURRENT_TIMESTAMP(6) - INTERVAL 1 DAY,
   'First batch for office and packaging materials.', 'COMPLETED', 2, 3, 5, 2)
ON DUPLICATE KEY UPDATE
  created_at = VALUES(created_at),
  inward_code = VALUES(inward_code),
  inward_date = VALUES(inward_date),
  notes = VALUES(notes),
  status = VALUES(status),
  purchase_order_id = VALUES(purchase_order_id),
  supplier_id = VALUES(supplier_id),
  user_id = VALUES(user_id),
  warehouse_id = VALUES(warehouse_id);

INSERT INTO stockinwarddetails (
  inward_detail_id, product_id, quantity_received, unit_price_negotiated, unit_purchase_price, stock_inward_id
)
VALUES
  (1, 3, 6, 415.00, 420.00, 1),
  (2, 4, 3, 1230.00, 1250.00, 1),
  (3, 5, 20, 50.00, 52.00, 2),
  (4, 6, 10, 10.50, 11.00, 2)
ON DUPLICATE KEY UPDATE
  product_id = VALUES(product_id),
  quantity_received = VALUES(quantity_received),
  unit_price_negotiated = VALUES(unit_price_negotiated),
  unit_purchase_price = VALUES(unit_purchase_price),
  stock_inward_id = VALUES(stock_inward_id);

INSERT INTO sales_orders (
  sales_order_id, created_at, user_id, customer_email, customer_id, customer_name,
  customer_phone, notes, order_code, order_date, shipping_address, status, updated_at
)
VALUES
  (1, CURRENT_TIMESTAMP(6) - INTERVAL 5 DAY, 4, 'buyer1@client.local', 1, 'Minh Retail',
   '0911000001', 'Urgent city-center replenishment.', 'SO-202605-001',
   CURRENT_TIMESTAMP(6) - INTERVAL 5 DAY, '12 Le Thanh Ton, District 1, Ho Chi Minh City',
   'completed', CURRENT_TIMESTAMP(6) - INTERVAL 4 DAY),
  (2, CURRENT_TIMESTAMP(6) - INTERVAL 2 DAY, 4, 'buyer2@client.local', 2, 'Da Nang Mart',
   '0911000002', 'Awaiting final carrier handoff confirmation.', 'SO-202605-002',
   CURRENT_TIMESTAMP(6) - INTERVAL 2 DAY, '98 Bach Dang, Hai Chau, Da Nang',
   'shipped', CURRENT_TIMESTAMP(6) - INTERVAL 1 DAY),
  (3, CURRENT_TIMESTAMP(6) - INTERVAL 12 HOUR, 4, 'buyer3@client.local', 3, 'Can Tho Trading',
   '0911000003', 'Stock check pending before confirmation.', 'SO-202605-003',
   CURRENT_TIMESTAMP(6) - INTERVAL 12 HOUR, '25 Tran Hung Dao, Ninh Kieu, Can Tho',
   'pending_stock_check', CURRENT_TIMESTAMP(6))
ON DUPLICATE KEY UPDATE
  created_at = VALUES(created_at),
  user_id = VALUES(user_id),
  customer_email = VALUES(customer_email),
  customer_id = VALUES(customer_id),
  customer_name = VALUES(customer_name),
  customer_phone = VALUES(customer_phone),
  notes = VALUES(notes),
  order_code = VALUES(order_code),
  order_date = VALUES(order_date),
  shipping_address = VALUES(shipping_address),
  status = VALUES(status),
  updated_at = VALUES(updated_at);

INSERT INTO sales_order_details (
  order_detail_id, product_id, quantity_ordered, unit_sale_price, warehouse_id, sales_order_id
)
VALUES
  (1, 1, 20, 9.50, 1, 1),
  (2, 5, 10, 68.00, 1, 1),
  (3, 2, 12, 25.00, 2, 2),
  (4, 6, 15, 16.00, 1, 2),
  (5, 3, 2, 550.00, 1, 3)
ON DUPLICATE KEY UPDATE
  product_id = VALUES(product_id),
  quantity_ordered = VALUES(quantity_ordered),
  unit_sale_price = VALUES(unit_sale_price),
  warehouse_id = VALUES(warehouse_id),
  sales_order_id = VALUES(sales_order_id);

INSERT INTO stock_takes (
  stock_take_id, created_at, notes, status, stock_take_code, stock_take_date, user_id
)
VALUES
  (1, CURRENT_TIMESTAMP(6) - INTERVAL 1 DAY,
   'Cycle count completed for high-value and fast-moving items.',
   'completed', 'ST-202605-001', CURRENT_DATE - INTERVAL 1 DAY, 5),
  (2, CURRENT_TIMESTAMP(6),
   'Monthly count in progress for central warehouse items.',
   'in_progress', 'ST-202605-002', CURRENT_DATE, 5)
ON DUPLICATE KEY UPDATE
  created_at = VALUES(created_at),
  notes = VALUES(notes),
  status = VALUES(status),
  stock_take_code = VALUES(stock_take_code),
  stock_take_date = VALUES(stock_take_date),
  user_id = VALUES(user_id);

INSERT INTO stock_take_details (
  stock_take_detail_id, counted_quantity, discrepancy, product_id, stock_take_id, system_quantity
)
VALUES
  (1, 88, -2, 1, 1, 90),
  (2, 12, 0, 3, 1, 12),
  (3, 4, -1, 4, 1, 5),
  (4, 150, 0, 5, 2, 150),
  (5, 70, 0, 6, 2, 70)
ON DUPLICATE KEY UPDATE
  counted_quantity = VALUES(counted_quantity),
  discrepancy = VALUES(discrepancy),
  product_id = VALUES(product_id),
  stock_take_id = VALUES(stock_take_id),
  system_quantity = VALUES(system_quantity);

INSERT INTO tasks (
  id, created_at, deadline, description, name, status, product_id, user_id
)
VALUES
  (1, CURRENT_TIMESTAMP(6) - INTERVAL 2 DAY, CURRENT_TIMESTAMP(6) + INTERVAL 1 DAY,
   'Arrange shelf placement and confirm accessory packs for new scanners.',
   'Restock Barcode Scanner', 0, 3, 5),
  (2, CURRENT_TIMESTAMP(6) - INTERVAL 1 DAY, CURRENT_TIMESTAMP(6) + INTERVAL 6 HOUR,
   'Investigate discrepancy found during cycle count and recount if needed.',
   'Verify Label Printer Count', 1, 4, 5),
  (3, CURRENT_TIMESTAMP(6) - INTERVAL 2 DAY, CURRENT_TIMESTAMP(6) - INTERVAL 1 DAY,
   'Prepare outbound paperwork and customer confirmation for shipped order.',
   'Prepare Shipment SO-202605-002', 2, 2, 4),
  (4, CURRENT_TIMESTAMP(6) - INTERVAL 3 HOUR, CURRENT_TIMESTAMP(6) + INTERVAL 2 DAY,
   'Review supplier quote and compare split-delivery terms.',
   'Review Packaging Supplier Quote', 0, 6, 3)
ON DUPLICATE KEY UPDATE
  created_at = VALUES(created_at),
  deadline = VALUES(deadline),
  description = VALUES(description),
  name = VALUES(name),
  status = VALUES(status),
  product_id = VALUES(product_id),
  user_id = VALUES(user_id);

INSERT INTO inventory_movements (
  movement_id, actor_user_id, actor_user_name, created_at, movement_type, note,
  product_id, product_name, product_sku, quantity_after, quantity_before, quantity_delta,
  reference_code, reference_id, reference_type, warehouse_id, warehouse_name
)
VALUES
  (100, 5, 'Warehouse Staff', CURRENT_TIMESTAMP(6) - INTERVAL 8 DAY, 'PURCHASE_RECEIPT',
   'Received scanner shipment for main warehouse.',
   3, 'Barcode Scanner X2', 'ELE-SCAN-X2', 12, 6, 6, 'PO-202605-001', '1', 'PURCHASE_ORDER', 1, 'Main Warehouse'),
  (101, 5, 'Warehouse Staff', CURRENT_TIMESTAMP(6) - INTERVAL 8 DAY, 'PURCHASE_RECEIPT',
   'Received label printers for main warehouse.',
   4, 'Label Printer LP-420', 'ELE-PRN-LP420', 5, 2, 3, 'PO-202605-001', '1', 'PURCHASE_ORDER', 1, 'Main Warehouse'),
  (102, 4, 'Sales Staff', CURRENT_TIMESTAMP(6) - INTERVAL 5 DAY, 'SALES_SHIPMENT',
   'Completed shipment for SO-202605-001.',
   1, 'Cola 330ml', 'BEV-COLA-330', 90, 110, -20, 'SO-202605-001', '1', 'SALES_ORDER', 1, 'Main Warehouse'),
  (103, 4, 'Sales Staff', CURRENT_TIMESTAMP(6) - INTERVAL 5 DAY, 'SALES_SHIPMENT',
   'Completed shipment for SO-202605-001.',
   5, 'A4 Paper Pack', 'OFF-PAPER-A4', 150, 160, -10, 'SO-202605-001', '1', 'SALES_ORDER', 1, 'Main Warehouse'),
  (104, 4, 'Sales Staff', CURRENT_TIMESTAMP(6) - INTERVAL 1 DAY, 'SALES_SHIPMENT',
   'Shipped order line for SO-202605-002.',
   2, 'Orange Juice 1L', 'BEV-OJ-1L', 35, 47, -12, 'SO-202605-002', '2', 'SALES_ORDER', 2, 'Central Warehouse'),
  (105, 5, 'Warehouse Staff', CURRENT_TIMESTAMP(6) - INTERVAL 12 HOUR, 'MANUAL_STOCK_OUT',
   'Adjusted stock after cycle count discrepancy.',
   4, 'Label Printer LP-420', 'ELE-PRN-LP420', 4, 5, -1, 'ST-202605-001', '1', 'MANUAL', 2, 'Central Warehouse')
ON DUPLICATE KEY UPDATE
  actor_user_id = VALUES(actor_user_id),
  actor_user_name = VALUES(actor_user_name),
  created_at = VALUES(created_at),
  movement_type = VALUES(movement_type),
  note = VALUES(note),
  product_id = VALUES(product_id),
  product_name = VALUES(product_name),
  product_sku = VALUES(product_sku),
  quantity_after = VALUES(quantity_after),
  quantity_before = VALUES(quantity_before),
  quantity_delta = VALUES(quantity_delta),
  reference_code = VALUES(reference_code),
  reference_id = VALUES(reference_id),
  reference_type = VALUES(reference_type),
  warehouse_id = VALUES(warehouse_id),
  warehouse_name = VALUES(warehouse_name);

INSERT INTO activity_logs (
  id, action_type, after_state, before_state, timestamp, domain, ip_address,
  metadata, note, reference_id, reference_type, user_id
)
VALUES
  (100, 'LOGIN', NULL, NULL, CURRENT_TIMESTAMP(6) - INTERVAL 3 DAY, 'AUTH', '172.18.0.1',
   JSON_OBJECT('channel', 'web', 'result', 'success'), 'Admin signed in for dashboard review.', 1, 'USER', 1),
  (101, 'LOGIN', NULL, NULL, CURRENT_TIMESTAMP(6) - INTERVAL 2 DAY, 'AUTH', '172.18.0.1',
   JSON_OBJECT('channel', 'web', 'result', 'success'), 'Purchase staff signed in to create requests.', 3, 'USER', 3),
  (102, 'LOGOUT', NULL, NULL, CURRENT_TIMESTAMP(6) - INTERVAL 2 DAY + INTERVAL 3 HOUR, 'AUTH', '172.18.0.1',
   JSON_OBJECT('channel', 'web', 'result', 'success'), 'Purchase staff signed out after order review.', 3, 'USER', 3),
  (103, 'LOGIN', NULL, NULL, CURRENT_TIMESTAMP(6) - INTERVAL 1 DAY, 'AUTH', '172.18.0.1',
   JSON_OBJECT('channel', 'web', 'result', 'success'), 'Sales staff signed in to process orders.', 4, 'USER', 4),
  (104, 'LOGIN', NULL, NULL, CURRENT_TIMESTAMP(6) - INTERVAL 6 HOUR, 'AUTH', '172.18.0.1',
   JSON_OBJECT('channel', 'mobile', 'result', 'success'), 'Warehouse staff signed in for stock take.', 5, 'USER', 5)
ON DUPLICATE KEY UPDATE
  action_type = VALUES(action_type),
  after_state = VALUES(after_state),
  before_state = VALUES(before_state),
  timestamp = VALUES(timestamp),
  domain = VALUES(domain),
  ip_address = VALUES(ip_address),
  metadata = VALUES(metadata),
  note = VALUES(note),
  reference_id = VALUES(reference_id),
  reference_type = VALUES(reference_type),
  user_id = VALUES(user_id);
