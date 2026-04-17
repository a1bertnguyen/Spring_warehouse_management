package com.Warehouse_managment.Warehouse_managment.Controller;

import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Dtos.SalesOrderRequest;
import com.Warehouse_managment.Warehouse_managment.Enum.SalesOrderStatus;
import com.Warehouse_managment.Warehouse_managment.Service.SalesOrderDetailService;
import com.Warehouse_managment.Warehouse_managment.Service.SalesOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sales-orders")
@RequiredArgsConstructor
public class SalesOrderController {

    private final SalesOrderService salesOrderService;
    private final SalesOrderDetailService salesOrderDetailService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Response> createSalesOrder(@RequestBody @Valid SalesOrderRequest salesOrderRequest) {
        return ResponseEntity.ok(salesOrderService.createSalesOrder(salesOrderRequest));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getAllSalesOrders(@RequestParam(defaultValue = "0") int page,
                                                      @RequestParam(defaultValue = "10") int size,
                                                      @RequestParam(required = false) String orderCode,
                                                      @RequestParam(required = false) String customerName,
                                                      @RequestParam(required = false) Long customerId,
                                                      @RequestParam(required = false) SalesOrderStatus status,
                                                      @RequestParam(required = false) Integer warehouseId,
                                                      @RequestParam(required = false) Long createdById) {
        return ResponseEntity.ok(salesOrderService.getAllSalesOrders(
                page, size, orderCode, customerName, customerId, status, warehouseId, createdById));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getSalesOrderById(@PathVariable Integer id) {
        return ResponseEntity.ok(salesOrderService.getSalesOrderById(id));
    }

    @GetMapping("/{id}/details")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getSalesOrderDetails(@PathVariable Integer id) {
        return ResponseEntity.ok(salesOrderDetailService.getDetailsByOrderId(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Response> updateSalesOrderStatus(@PathVariable Integer id,
                                                           @RequestParam SalesOrderStatus status) {
        return ResponseEntity.ok(salesOrderService.updateSalesOrderStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Response> deleteSalesOrder(@PathVariable Integer id) {
        return ResponseEntity.ok(salesOrderService.deleteSalesOrder(id));
    }
}
