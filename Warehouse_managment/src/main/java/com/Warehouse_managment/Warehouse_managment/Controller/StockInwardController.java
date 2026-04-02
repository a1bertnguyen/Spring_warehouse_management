package com.Warehouse_managment.Warehouse_managment.Controller;

import com.Warehouse_managment.Warehouse_managment.Service.StockInwardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stock-inwards")
@RequiredArgsConstructor
public class StockInwardController {

    private final StockInwardService stockInwardService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'PURCHASE_STAFF', 'WAREHOUSE_STAFF')")
    public ResponseEntity<Map<String, Object>> getAllStockInwards() {
        return ResponseEntity.ok(payload("stockInwards", stockInwardService.getAllStockInwards()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'PURCHASE_STAFF', 'WAREHOUSE_STAFF')")
    public ResponseEntity<Map<String, Object>> getStockInwardById(@PathVariable Integer id) {
        return ResponseEntity.ok(payload("stockInward", stockInwardService.getStockInwardById(id)));
    }

    @GetMapping("/{id}/details")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'PURCHASE_STAFF', 'WAREHOUSE_STAFF')")
    public ResponseEntity<Map<String, Object>> getStockInwardDetails(@PathVariable Integer id) {
        return ResponseEntity.ok(payload("stockInwardDetails", stockInwardService.getDetailsByStockInwardId(id)));
    }

    private Map<String, Object> payload(String key, Object value) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 200);
        body.put("message", "success");
        body.put(key, value);
        return body;
    }
}
