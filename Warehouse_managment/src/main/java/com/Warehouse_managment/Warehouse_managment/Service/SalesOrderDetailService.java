package com.Warehouse_managment.Warehouse_managment.Service;

import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Dtos.SalesOrderDetailDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.SalesOrderDetailRequest;
import com.Warehouse_managment.Warehouse_managment.Model.SalesOrder;
import com.Warehouse_managment.Warehouse_managment.Model.SalesOrderDetail;

import java.util.List;

public interface SalesOrderDetailService {

    List<SalesOrderDetail> saveDetails(SalesOrder salesOrder, List<SalesOrderDetailRequest> detailRequests);

    Response getDetailsByOrderId(Integer orderId);

    SalesOrderDetailDTO toDto(SalesOrderDetail detail);
}
