package com.Warehouse_managment.Warehouse_managment.Dtos;

import com.Warehouse_managment.Warehouse_managment.Enum.InventoryMovementType;
import com.Warehouse_managment.Warehouse_managment.Enum.InventoryReferenceType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryMovementDTO {
    private Long movementId;
    private Long productId;
    private String productName;
    private String productSku;
    private Integer warehouseId;
    private String warehouseName;
    private Long actorUserId;
    private String actorUserName;
    private InventoryMovementType movementType;
    private InventoryReferenceType referenceType;
    private String referenceId;
    private String referenceCode;
    private Integer quantityBefore;
    private Integer quantityDelta;
    private Integer quantityAfter;
    private String note;
    private LocalDateTime createdAt;
}
