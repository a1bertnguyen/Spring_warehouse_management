package com.Warehouse_managment.Warehouse_managment.Controller;

import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventories")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getAllInventories() {
        return ResponseEntity.ok(inventoryService.getAllInventories());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getInventoryById(@PathVariable Integer id) {
        return ResponseEntity.ok(inventoryService.getInventoryById(id));
    }

    @GetMapping("/warehouse/{warehouseId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getInventoriesByWarehouseId(@PathVariable Integer warehouseId) {
        return ResponseEntity.ok(inventoryService.getInventoriesByWarehouseId(warehouseId));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Response> searchInventories(@RequestParam(required = false) Integer warehouseId,
                                                      @RequestParam(required = false) String productName) {
        return ResponseEntity.ok(inventoryService.searchInventories(warehouseId, productName));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Response> getInventorySummary() {
        return ResponseEntity.ok(inventoryService.getInventorySummary());
    }
}
