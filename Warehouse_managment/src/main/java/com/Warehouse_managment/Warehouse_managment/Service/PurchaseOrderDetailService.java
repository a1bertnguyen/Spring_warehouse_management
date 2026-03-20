package com.Warehouse_managment.Warehouse_managment.Service;

import com.Warehouse_managment.Warehouse_managment.Dtos.PurchaseOrderDetailDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.PurchaseOrderDetailRequest;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Model.PurchaseOrder;
import com.Warehouse_managment.Warehouse_managment.Model.PurchaseOrderDetail;

import java.util.List;

public interface PurchaseOrderDetailService {
    List<PurchaseOrderDetail> saveDetails(PurchaseOrder purchaseOrder, List<PurchaseOrderDetailRequest> detailRequests);

    Response getDetailsByOrderId(Integer orderId);

    PurchaseOrderDetailDTO toDto(PurchaseOrderDetail detail);
}
