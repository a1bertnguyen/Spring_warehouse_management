package com.Warehouse_managment.Warehouse_managment.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "products")
@Data
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @Column(unique = true)
    @NotBlank(message = "SKU is required")
    private String sku;

    @Positive(message = "product price must be a positive value")
    private BigDecimal purchaseprice;

    @Column(name = "sale_price")
    private BigDecimal salePrice;

    @Min(value = 0, message = "stock quantity cannot be negative")
    private Integer stockQuantity;

    @Column(name = "supplier_id")
    Long supplierId;

    @ManyToOne
    @JoinColumn(name = "supplier_id", insertable = false, updatable = false)
    Supplier supplier;

    @Min(value = 0, message = "low stock threshold cannot be negative")
    @Column(name = "low_stock_threshold")
    private Integer lowStockThreshold;


    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    private String description;
    private LocalDateTime expiryDate;
    private String imageUrl;

    private final LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;


    @Override
    public String toString() {
        return "Product{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", sku='" + sku + '\'' +
                ", purchaseprice=" + purchaseprice +
                ", salePrice=" + salePrice +
                ", stockQuantity=" + stockQuantity +
                ", supplierId=" + supplierId +
                ", lowStockThreshold=" + lowStockThreshold +
                ", description='" + description + '\'' +
                ", expiryDate=" + expiryDate +
                ", imageUrl='" + imageUrl + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", categoryId=" + (category != null ? category.getId() : null) +
                '}';
    }
}
