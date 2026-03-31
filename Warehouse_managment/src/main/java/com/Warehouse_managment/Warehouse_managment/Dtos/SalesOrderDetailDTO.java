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
public class SalesOrderDetailDTO {

    private Integer id;
    private Integer salesOrderId;
    private Long productId;
    private String productName;
    private String productSku;
    private Integer warehouseId;
    private String warehouseName;
    private Integer quantityOrdered;
    private BigDecimal unitSalePrice;
    private BigDecimal lineTotal;
}
