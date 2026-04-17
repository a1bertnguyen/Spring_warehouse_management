package com.Warehouse_managment.Warehouse_managment.Controller;

import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Enum.InventoryMovementType;
import com.Warehouse_managment.Warehouse_managment.Enum.InventoryReferenceType;
import com.Warehouse_managment.Warehouse_managment.Service.InventoryMovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory-movements")
@RequiredArgsConstructor
public class InventoryMovementController {

    private final InventoryMovementService inventoryMovementService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'PURCHASE_STAFF', 'WAREHOUSE_STAFF')")
    public ResponseEntity<Response> getInventoryMovements(@RequestParam(required = false) Integer warehouseId,
                                                          @RequestParam(required = false) Long productId,
                                                          @RequestParam(required = false) InventoryMovementType movementType,
                                                          @RequestParam(required = false) InventoryReferenceType referenceType,
                                                          @RequestParam(required = false) String referenceId) {
        return ResponseEntity.ok(inventoryMovementService.getInventoryMovements(
                warehouseId,
                productId,
                movementType,
                referenceType,
                referenceId
        ));
    }
}
