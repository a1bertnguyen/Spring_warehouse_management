package com.Warehouse_managment.Warehouse_managment.Dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockTakeDetailDTO {
    private Integer stockTakeDetailId;
    private Integer stockTakeId;
    private Integer productId;
    private String productCode;
    private String productName;
    private String unit;
    private Integer systemQuantity;
    private Integer countedQuantity;
    private Integer discrepancy;
}
