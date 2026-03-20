package com.Warehouse_managment.Warehouse_managment.Dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.Valid;
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
public class PurchaseOrderRequest {

    @NotNull(message = "Warehouse id is required")
    private Integer warehouseId;

    @NotNull(message = "Supplier id is required")
    private Long supplierId;

    private String notes;

    @Valid
    @NotEmpty(message = "Purchase order must contain at least one item")
    private List<PurchaseOrderDetailRequest> items;
}
