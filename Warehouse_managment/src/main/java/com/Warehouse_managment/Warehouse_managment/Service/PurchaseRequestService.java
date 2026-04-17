package com.Warehouse_managment.Warehouse_managment.Service;

import com.Warehouse_managment.Warehouse_managment.Dtos.PurchaseRequestRequest;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Enum.PurchaseRequestStatus;

public interface PurchaseRequestService {
    Response createPurchaseRequest(PurchaseRequestRequest purchaseRequestRequest);

    Response getAllPurchaseRequests(int page,
                                    int size,
                                    Integer warehouseId,
                                    Long supplierId,
                                    Long requesterId,
                                    String requestCode,
                                    PurchaseRequestStatus status);

    Response getPurchaseRequestById(Integer id);

    Response updatePurchaseRequestStatus(Integer id, PurchaseRequestStatus status);

    Response deletePurchaseRequest(Integer id);
}
