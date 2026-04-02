package com.Warehouse_managment.Warehouse_managment.Dtos;

import com.Warehouse_managment.Warehouse_managment.Enum.StockInwardStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockInwardDTO {
    private Integer stockInwardId;
    private String inwardCode;
    private Long supplierId;
    private String supplierName;
    private Long userId;
    private String userName;
    private Integer warehouseId;
    private String warehouseName;
    private Integer purchaseOrderId;
    private String purchaseOrderCode;
    private String notes;
    private LocalDateTime inwardDate;
    private LocalDateTime createdAt;
    private StockInwardStatus status;
    private Integer totalItems;
    private Integer totalReceivedQuantity;
    private List<StockInwardDetailDTO> details;
}
