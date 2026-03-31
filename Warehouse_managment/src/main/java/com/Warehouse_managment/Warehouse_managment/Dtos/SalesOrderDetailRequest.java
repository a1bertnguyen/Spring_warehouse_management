package com.Warehouse_managment.Warehouse_managment.Dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SalesOrderDetailRequest {

    @NotNull(message = "Product id is required")
    private Long productId;

    @NotNull(message = "Warehouse id is required")
    private Integer warehouseId;

    @NotNull(message = "Quantity ordered is required")
    @Positive(message = "Quantity ordered must be greater than 0")
    private Integer quantityOrdered;

    @Positive(message = "Unit sale price must be greater than 0")
    private BigDecimal unitSalePrice;
}
