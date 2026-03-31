package com.Warehouse_managment.Warehouse_managment.Dtos;

import com.Warehouse_managment.Warehouse_managment.Enum.SalesOrderStatus;
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
public class SalesOrderDTO {

    private Integer id;
    private String orderCode;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String shippingAddress;
    private Long createdById;
    private String createdByName;
    private LocalDateTime orderDate;
    private SalesOrderStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer totalItems;
    private BigDecimal totalOrderValue;
    private List<SalesOrderDetailDTO> orderDetails;
}
