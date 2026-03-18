package com.Warehouse_managment.Warehouse_managment.Model;

import com.Warehouse_managment.Warehouse_managment.Enum.InventoryStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "inventory")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inventory_id")
    Integer inventoryId;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    Product product;

    @ManyToOne
    @JoinColumn(name = "warehouse_id", nullable = false)
    Warehouse warehouse;

    @Column(name = "quantity_on_hand")
    Integer quantityOnHand;

    @Column(name = "last_updated")
    Timestamp lastUpdated;

    @PrePersist
    @PreUpdate
    void touchTimestamp() {
        lastUpdated = Timestamp.valueOf(LocalDateTime.now());
    }

    @Transient
    public InventoryStatus getStatus() {
        if (product == null || product.getLowStockThreshold() == null || quantityOnHand == null) {
            return InventoryStatus.UNKNOWN;
        }

        int threshold = product.getLowStockThreshold();

        if (quantityOnHand == 0) {
            return InventoryStatus.OUT_OF_STOCK;
        } else if (quantityOnHand <= threshold) {
            return InventoryStatus.LOW_STOCK;
        } else {
            return InventoryStatus.AVAILABLE;
        }
    }
}
