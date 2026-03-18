package com.Warehouse_managment.Warehouse_managment.Dtos;

import com.Warehouse_managment.Warehouse_managment.Enum.InventoryStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class InventoryDTO {

    private Integer inventoryId;

    private Long productId;
    private String productName;
    private String productSku;
    private String productImageUrl;

    private Integer warehouseId;
    private String warehouseName;

    private Integer quantityOnHand;
    private Integer lowStockThreshold;
    private BigDecimal purchaseprice;
    private BigDecimal saleprice;
    private InventoryStatus status;
    private Timestamp lastUpdated;
}
