package com.Warehouse_managment.Warehouse_managment.Controller;

import com.Warehouse_managment.Warehouse_managment.Dtos.PurchaseRequestRequest;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Enum.PurchaseRequestStatus;
import com.Warehouse_managment.Warehouse_managment.Service.PurchaseRequestDetailService;
import com.Warehouse_managment.Warehouse_managment.Service.PurchaseRequestService;
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

import java.util.Locale;

@RestController
@RequestMapping("/api/purchase-requests")
@RequiredArgsConstructor
public class PurchaseRequestController {

    private final PurchaseRequestService purchaseRequestService;
    private final PurchaseRequestDetailService purchaseRequestDetailService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'PURCHASE_STAFF')")
    public ResponseEntity<Response> createPurchaseRequest(@RequestBody @Valid PurchaseRequestRequest purchaseRequestRequest) {
        return ResponseEntity.ok(purchaseRequestService.createPurchaseRequest(purchaseRequestRequest));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'PURCHASE_STAFF')")
    public ResponseEntity<Response> getAllPurchaseRequests(@RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "10") int size,
                                                           @RequestParam(required = false) Integer warehouseId,
                                                           @RequestParam(required = false) Long supplierId,
                                                           @RequestParam(required = false) Long requesterId,
                                                           @RequestParam(required = false) String requestCode,
                                                           @RequestParam(required = false) String status) {
        return ResponseEntity.ok(purchaseRequestService.getAllPurchaseRequests(
                page, size, warehouseId, supplierId, requesterId, requestCode, resolveStatus(status)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'PURCHASE_STAFF')")
    public ResponseEntity<Response> getPurchaseRequestById(@PathVariable Integer id) {
        return ResponseEntity.ok(purchaseRequestService.getPurchaseRequestById(id));
    }

    @GetMapping("/{id}/details")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'PURCHASE_STAFF')")
    public ResponseEntity<Response> getPurchaseRequestDetails(@PathVariable Integer id) {
        return ResponseEntity.ok(purchaseRequestDetailService.getDetailsByRequestId(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'PURCHASE_STAFF')")
    public ResponseEntity<Response> updatePurchaseRequestStatus(@PathVariable Integer id,
                                                                @RequestParam String status) {
        return ResponseEntity.ok(purchaseRequestService.updatePurchaseRequestStatus(id, resolveStatus(status)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'PURCHASE_STAFF')")
    public ResponseEntity<Response> deletePurchaseRequest(@PathVariable Integer id) {
        return ResponseEntity.ok(purchaseRequestService.deletePurchaseRequest(id));
    }

    private PurchaseRequestStatus resolveStatus(String rawStatus) {
        if (rawStatus == null || rawStatus.isBlank()) {
            return null;
        }

        String normalized = rawStatus.trim().toLowerCase(Locale.ROOT).replace('-', '_');
        for (PurchaseRequestStatus status : PurchaseRequestStatus.values()) {
            if (status.name().equalsIgnoreCase(normalized)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unsupported purchase request status: " + rawStatus);
    }
}
