package com.Warehouse_managment.Warehouse_managment.Service;

import com.Warehouse_managment.Warehouse_managment.Dtos.PurchaseRequestDetailDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.PurchaseRequestDetailRequest;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Model.PurchaseRequest;
import com.Warehouse_managment.Warehouse_managment.Model.PurchaseRequestDetail;

import java.util.List;

public interface PurchaseRequestDetailService {
    List<PurchaseRequestDetail> saveDetails(PurchaseRequest purchaseRequest, List<PurchaseRequestDetailRequest> detailRequests);

    Response getDetailsByRequestId(Integer requestId);

    PurchaseRequestDetailDTO toDto(PurchaseRequestDetail detail);
}
