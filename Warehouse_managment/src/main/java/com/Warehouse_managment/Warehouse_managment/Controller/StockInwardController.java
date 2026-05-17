package com.Warehouse_managment.Warehouse_managment.Controller;

import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Enum.StockInwardStatus;
import com.Warehouse_managment.Warehouse_managment.Dtos.StockInwardCreateRequest;
import jakarta.validation.Valid;
import com.Warehouse_managment.Warehouse_managment.Service.StockInwardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Locale;
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

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'PURCHASE_STAFF', 'WAREHOUSE_STAFF')")
    public ResponseEntity<Response> createStockInward(@RequestBody @Valid StockInwardCreateRequest request) {
        return ResponseEntity.ok(stockInwardService.createStockInward(request));
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

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'WAREHOUSE_STAFF')")
    public ResponseEntity<Response> updateStockInwardStatus(@PathVariable Integer id,
                                                            @RequestParam String status) {
        return ResponseEntity.ok(stockInwardService.updateStockInwardStatus(id, resolveStockInwardStatus(status)));
    }

    private Map<String, Object> payload(String key, Object value) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 200);
        body.put("message", "success");
        body.put(key, value);
        return body;
    }

    private StockInwardStatus resolveStockInwardStatus(String rawStatus) {
        if (rawStatus == null || rawStatus.isBlank()) {
            return null;
        }

        String normalized = rawStatus.trim().toUpperCase(Locale.ROOT).replace('-', '_');
        for (StockInwardStatus status : StockInwardStatus.values()) {
            if (status.name().equalsIgnoreCase(normalized)) {
                return status;
            }
        }

        throw new IllegalArgumentException("Unsupported stock inward status: " + rawStatus);
    }
}
