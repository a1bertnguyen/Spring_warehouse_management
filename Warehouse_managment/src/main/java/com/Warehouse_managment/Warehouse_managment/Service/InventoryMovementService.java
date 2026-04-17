package com.Warehouse_managment.Warehouse_managment.Service;

import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Enum.InventoryMovementType;
import com.Warehouse_managment.Warehouse_managment.Enum.InventoryReferenceType;
import com.Warehouse_managment.Warehouse_managment.Model.Product;
import com.Warehouse_managment.Warehouse_managment.Model.Warehouse;

public interface InventoryMovementService {

    void recordMovement(Product product,
                        Warehouse warehouse,
                        Integer quantityBefore,
                        Integer quantityDelta,
                        Integer quantityAfter,
                        InventoryMovementType movementType,
                        InventoryReferenceType referenceType,
                        String referenceId,
                        String referenceCode,
                        String note);

    Response getInventoryMovements(Integer warehouseId,
                                   Long productId,
                                   InventoryMovementType movementType,
                                   InventoryReferenceType referenceType,
                                   String referenceId);
}
