package com.Warehouse_managment.Warehouse_managment.Service;

import com.Warehouse_managment.Warehouse_managment.Dtos.PurchaseOrderRequest;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Model.PurchaseOrder;

public interface PurchaseOrderService {

    Response createPurchaseOrder(PurchaseOrderRequest purchaseOrderRequest);

    Response getAllPurchaseOrders(int page,
                                  int size,
                                  Integer warehouseId,
                                  Long supplierId,
                                  Long requesterId,
                                  String orderCode,
                                  PurchaseOrder.OrderStatus status);

    Response getPurchaseOrderById(Integer id);

    Response updatePurchaseOrderStatus(Integer id, PurchaseOrder.OrderStatus status);

    Response deletePurchaseOrder(Integer id);

}
