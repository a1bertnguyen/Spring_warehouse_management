package com.Warehouse_managment.Warehouse_managment.Controller;

import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Dtos.WarehouseDTO;
import com.Warehouse_managment.Warehouse_managment.Service.WarehouseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/warehouses")
@RequiredArgsConstructor
public class WarehouseController {

    private final WarehouseService warehouseService;

    @PostMapping("/add")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Response> createWarehouse(@RequestBody @Valid WarehouseDTO warehouseDTO) {
        return ResponseEntity.ok(warehouseService.createWarehouse(warehouseDTO));
    }

    @GetMapping("/all")
    public ResponseEntity<Response> getAllWarehouses() {
        return ResponseEntity.ok(warehouseService.getAllWarehouses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Response> getWarehouseById(@PathVariable Integer id) {
        return ResponseEntity.ok(warehouseService.getWarehouseById(id));
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Response> updateWarehouse(@PathVariable Integer id,
                                                    @RequestBody @Valid WarehouseDTO warehouseDTO) {
        return ResponseEntity.ok(warehouseService.updateWarehouse(id, warehouseDTO));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Response> deleteWarehouse(@PathVariable Integer id) {
        return ResponseEntity.ok(warehouseService.deleteWarehouse(id));
    }

    @GetMapping("/{id}/products")
    public ResponseEntity<Response> getProductsByWarehouse(@PathVariable Integer id) {
        return ResponseEntity.ok(warehouseService.getProductsByWarehouseId(id));
    }

    @PostMapping("/{id}/products")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Response> addProductToWarehouse(@PathVariable Integer id,
                                                          @RequestParam Long productId,
                                                          @RequestParam Integer quantity) {
        return ResponseEntity.ok(warehouseService.addProductToWarehouse(id, productId, quantity));
    }

    @DeleteMapping("/{warehouseId}/products/{productId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Response> removeProductFromWarehouse(@PathVariable Integer warehouseId,
                                                               @PathVariable Long productId) {
        return ResponseEntity.ok(warehouseService.removeProductFromWarehouse(warehouseId, productId));
    }
}
