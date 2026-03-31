package com.Warehouse_managment.Warehouse_managment.Dtos;


import com.Warehouse_managment.Warehouse_managment.Enum.UserRole;
import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.persistence.Id;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Response {

    //Generic
    private int status;
    private String message;
    //for login
    private String token;
    private UserRole role;
    private String expirationTime;
    private Long  userId;

    //for pagination
    private Integer totalPages;
    private Long totalElements;
    private Long totalQuantityOnHand;
    private Long outOfStockCount;
    private Long lowStockCount;

    //data output optionals
    private UserDTO user;
    private List<UserDTO> users;

    private SupplierDTO supplier;
    private List<SupplierDTO> suppliers;

    private WarehouseDTO warehouse;
    private List<WarehouseDTO> warehouses;

    private CategoryDTO category;
    private List<CategoryDTO> categories;

    private ProductDTO product;
    private List<ProductDTO> products;

    private InventoryDTO inventory;
    private List<InventoryDTO> inventories;

    private PurchaseOrderDTO purchaseOrder;
    private List<PurchaseOrderDTO> purchaseOrders;

    private PurchaseOrderDetailDTO purchaseOrderDetail;
    private List<PurchaseOrderDetailDTO> purchaseOrderDetails;

    private SalesOrderDTO salesOrder;
    private List<SalesOrderDTO> salesOrders;

    private SalesOrderDetailDTO salesOrderDetail;
    private List<SalesOrderDetailDTO> salesOrderDetails;

    private TransactionDTO transaction;
    private List<TransactionDTO> transactions;

    private TaskDTO task;
    private List<TaskDTO> tasks;

    private ActivityLogDTO activityLog;
    private List<ActivityLogDTO> activityLogs;

    private final LocalDateTime timestamp = LocalDateTime.now();


}
