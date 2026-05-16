package com.Warehouse_managment.Warehouse_managment.Dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class StockInwardCreateRequest {

    @NotBlank(message = "Stock inward code is required")
    private String inwardCode;

    @NotNull(message = "Warehouse id is required")
    private Integer warehouseId;

    @NotNull(message = "Purchase order id is required")
    private Integer purchaseOrderId;

    private String notes;

    @Valid
    @NotEmpty(message = "At least one stock inward item is required")
    private List<StockInwardCreateItemRequest> items;
}
