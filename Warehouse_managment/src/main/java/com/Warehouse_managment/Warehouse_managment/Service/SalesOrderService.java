package com.Warehouse_managment.Warehouse_managment.Service;

import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Dtos.SalesOrderRequest;
import com.Warehouse_managment.Warehouse_managment.Enum.SalesOrderStatus;

public interface SalesOrderService {

    Response createSalesOrder(SalesOrderRequest salesOrderRequest);

    Response getAllSalesOrders(int page,
                               int size,
                               String orderCode,
                               String customerName,
                               Long customerId,
                               SalesOrderStatus status,
                               Integer warehouseId,
                               Long createdById);

    Response getSalesOrderById(Integer id);

    Response updateSalesOrderStatus(Integer id, SalesOrderStatus status);

    Response deleteSalesOrder(Integer id);
}
