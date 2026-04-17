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
public class PurchaseRequestDetailRequest {

    @NotNull(message = "Product id is required")
    private Long productId;

    @NotNull(message = "Requested quantity is required")
    @Positive(message = "Requested quantity must be greater than 0")
    private Integer requestedQuantity;

    private BigDecimal unitPriceEstimated;
    private Long supplierIdSuggested;
    private String note;
}
