package com.Warehouse_managment.Warehouse_managment.Controller;

import com.Warehouse_managment.Warehouse_managment.Dtos.ProductDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping("/add")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Response> saveProduct(
            @RequestParam("imageFile") MultipartFile imageFile,
            @RequestParam("name") String name,
            @RequestParam("sku") String sku,
            @RequestParam(value = "purchaseprice", required = false) BigDecimal purchaseprice,
            @RequestParam(value = "saleprice", required = false) BigDecimal saleprice,
            @RequestParam(value = "price", required = false) BigDecimal price,
            @RequestParam("stockQuantity") Integer stockQuantity,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("expiryDate") String expiryDate,
            @RequestParam(value = "description", required = false) String description

    ) {
        ProductDTO productDTO = new ProductDTO();
        productDTO.setName(name);
        productDTO.setSku(sku);
        productDTO.setPurchaseprice(resolvePrice(purchaseprice, price));
        productDTO.setSaleprice(resolvePrice(saleprice, price));
        productDTO.setStockQuantity(stockQuantity);
        productDTO.setCategoryId(categoryId);
        productDTO.setExpiryDate(parseExpiryDate(expiryDate));
        productDTO.setDescription(description);

        return ResponseEntity.ok(productService.saveProduct(productDTO, imageFile));

    }

    @PutMapping("/update")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Response> updateProduct(
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "sku", required = false) String sku,
            @RequestParam(value = "purchaseprice", required = false) BigDecimal purchaseprice,
            @RequestParam(value = "saleprice", required = false) BigDecimal saleprice,
            @RequestParam(value = "Purchaseprice", required = false) BigDecimal legacyPurchaseprice,
            @RequestParam(value = "Saleprice", required = false) BigDecimal legacySaleprice,
            @RequestParam(value = "price", required = false) BigDecimal price,
            @RequestParam(value = "stockQuantity", required = false) Integer stockQuantity,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "expiryDate", required = false) String expiryDate,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("productId") Long productId
    ) {
        ProductDTO productDTO = new ProductDTO();
        productDTO.setName(name);
        productDTO.setSku(sku);
        productDTO.setPurchaseprice(resolvePrice(purchaseprice, legacyPurchaseprice, price));
        productDTO.setSaleprice(resolvePrice(saleprice, legacySaleprice, price));
        productDTO.setProductId(productId);
        productDTO.setStockQuantity(stockQuantity);
        productDTO.setCategoryId(categoryId);
        if (expiryDate != null && !expiryDate.isBlank()) {
            productDTO.setExpiryDate(parseExpiryDate(expiryDate));
        }
        productDTO.setDescription(description);

        return ResponseEntity.ok(productService.updateProduct(productDTO, imageFile));

    }


    @GetMapping("/all")
    public ResponseEntity<Response> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Response> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }


    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Response> deleteProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.deleteProduct(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Response> searchProduct(@RequestParam String input) {
        return ResponseEntity.ok(productService.searchProduct(input));
    }

    private BigDecimal resolvePrice(BigDecimal primary, BigDecimal fallback) {
        return primary != null ? primary : fallback;
    }

    private BigDecimal resolvePrice(BigDecimal primary, BigDecimal secondary, BigDecimal fallback) {
        if (primary != null) {
            return primary;
        }
        if (secondary != null) {
            return secondary;
        }
        return fallback;
    }

    private LocalDateTime parseExpiryDate(String expiryDate) {
        try {
            return LocalDateTime.parse(expiryDate);
        } catch (DateTimeParseException ignored) {
            return LocalDate.parse(expiryDate).atStartOfDay();
        }
    }
}

