package com.Warehouse_managment.Warehouse_managment.Controller;

import com.Warehouse_managment.Warehouse_managment.Dtos.PurchaseOrderRequest;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Model.PurchaseOrder;
import com.Warehouse_managment.Warehouse_managment.Service.PurchaseOrderDetailService;
import com.Warehouse_managment.Warehouse_managment.Service.PurchaseOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;
    private final PurchaseOrderDetailService purchaseOrderDetailService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'PURCHASE_STAFF')")
    public ResponseEntity<Response> createPurchaseOrder(@RequestBody @Valid PurchaseOrderRequest purchaseOrderRequest) {
        return ResponseEntity.ok(purchaseOrderService.createPurchaseOrder(purchaseOrderRequest));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'PURCHASE_STAFF')")
    public ResponseEntity<Response> getAllPurchaseOrders(@RequestParam(defaultValue = "0") int page,
                                                         @RequestParam(defaultValue = "10") int size,
                                                         @RequestParam(required = false) Integer warehouseId,
                                                         @RequestParam(required = false) Long supplierId,
                                                         @RequestParam(required = false) Long requesterId,
                                                         @RequestParam(required = false) String requestCode,
                                                         @RequestParam(required = false) String status) {
        return ResponseEntity.ok(purchaseOrderService.getAllPurchaseOrders(
                page, size, warehouseId, supplierId, requesterId, requestCode, resolvePurchaseOrderStatus(status)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'PURCHASE_STAFF')")
    public ResponseEntity<Response> getPurchaseOrderById(@PathVariable Integer id) {
        return ResponseEntity.ok(purchaseOrderService.getPurchaseOrderById(id));
    }

    @GetMapping("/{id}/details")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'PURCHASE_STAFF')")
    public ResponseEntity<Response> getPurchaseOrderDetails(@PathVariable Integer id) {
        return ResponseEntity.ok(purchaseOrderDetailService.getDetailsByOrderId(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'PURCHASE_STAFF')")
    public ResponseEntity<Response> updatePurchaseOrderStatus(@PathVariable Integer id,
                                                              @RequestParam String status) {
        return ResponseEntity.ok(purchaseOrderService.updatePurchaseOrderStatus(id, resolvePurchaseOrderStatus(status)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'PURCHASE_STAFF')")
    public ResponseEntity<Response> deletePurchaseOrder(@PathVariable Integer id) {
        return ResponseEntity.ok(purchaseOrderService.deletePurchaseOrder(id));
    }

    private PurchaseOrder.OrderStatus resolvePurchaseOrderStatus(String rawStatus) {
        if (rawStatus == null || rawStatus.isBlank()) {
            return null;
        }

        String normalized = rawStatus.trim()
                .toLowerCase(Locale.ROOT)
                .replace('-', '_');

        return switch (normalized) {
            case "pending" -> PurchaseOrder.OrderStatus.pending_approval;
            case "approved" -> PurchaseOrder.OrderStatus.approved;
            case "received" -> PurchaseOrder.OrderStatus.received;
            default -> {
                for (PurchaseOrder.OrderStatus status : PurchaseOrder.OrderStatus.values()) {
                    if (status.name().equalsIgnoreCase(normalized)) {
                        yield status;
                    }
                }
                throw new IllegalArgumentException(
                        "Unsupported purchase order status: " + rawStatus
                                + ". Supported values include pending, approved, received.");
            }
        };
    }
}
