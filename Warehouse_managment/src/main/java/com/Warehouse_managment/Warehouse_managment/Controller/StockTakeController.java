package com.Warehouse_managment.Warehouse_managment.Controller;

import com.Warehouse_managment.Warehouse_managment.Service.StockTakeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stock-takes")
@RequiredArgsConstructor
public class StockTakeController {

    private final StockTakeService stockTakeService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'WAREHOUSE_STAFF')")
    public ResponseEntity<Map<String, Object>> getAllStockTakes() {
        return ResponseEntity.ok(payload("stockTakes", stockTakeService.getAllStockTakes()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'WAREHOUSE_STAFF')")
    public ResponseEntity<Map<String, Object>> getStockTakeById(@PathVariable Integer id) {
        return ResponseEntity.ok(payload("stockTake", stockTakeService.getStockTakeById(id)));
    }

    @GetMapping("/{id}/details")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'WAREHOUSE_STAFF')")
    public ResponseEntity<Map<String, Object>> getStockTakeDetails(@PathVariable Integer id) {
        return ResponseEntity.ok(payload("stockTakeDetails", stockTakeService.getDetailsByStockTakeId(id)));
    }

    private Map<String, Object> payload(String key, Object value) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 200);
        body.put("message", "success");
        body.put(key, value);
        return body;
    }
}
