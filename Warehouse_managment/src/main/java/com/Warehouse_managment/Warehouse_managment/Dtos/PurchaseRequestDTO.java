package com.Warehouse_managment.Warehouse_managment.Dtos;

import com.Warehouse_managment.Warehouse_managment.Enum.PurchaseRequestStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class PurchaseRequestDTO {
    private Integer id;
    private String requestCode;
    private Long requesterId;
    private String requesterName;
    private Integer warehouseId;
    private String warehouseName;
    private Long supplierId;
    private String supplierName;
    private LocalDateTime requestDate;
    private PurchaseRequestStatus status;
    private String notes;
    private LocalDateTime approvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer totalItems;
    private BigDecimal totalEstimatedAmount;
    private List<PurchaseRequestDetailDTO> requestDetails;
}
