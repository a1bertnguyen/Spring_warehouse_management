package com.Warehouse_managment.Warehouse_managment.Dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockInwardDetailDTO {
    private Integer inwardDetailId;
    private Integer stockInwardId;
    private Long productId;
    private String productName;
    private String productSku;
    private Integer quantityReceived;
    private BigDecimal unitPriceNegotiated;
    private BigDecimal unitPurchasePrice;
    private BigDecimal lineValue;
}
