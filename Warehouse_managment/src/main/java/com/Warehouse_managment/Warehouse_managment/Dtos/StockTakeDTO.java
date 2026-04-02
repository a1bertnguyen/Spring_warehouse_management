package com.Warehouse_managment.Warehouse_managment.Dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Date;
import java.sql.Timestamp;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockTakeDTO {
    private Integer stockTakeId;
    private String stockTakeCode;
    private Integer userId;
    private String userFullName;
    private Date stockTakeDate;
    private String status;
    private String notes;
    private Timestamp createdAt;
    private Integer totalProducts;
    private Integer completedProducts;
    private Integer discrepancyCount;
    private List<StockTakeDetailDTO> details;
}
