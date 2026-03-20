package com.Warehouse_managment.Warehouse_managment.Dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class PurchaseOrderDetailDTO {

    private Integer id;
    private Integer purchaseOrderId;
    private Long productId;
    private String productName;
    private String productSku;
    private Integer requestedQuantity;
    private BigDecimal unitPriceEstimated;
    private BigDecimal lineTotalEstimated;
    private Long supplierIdSuggested;
    private String note;
}
