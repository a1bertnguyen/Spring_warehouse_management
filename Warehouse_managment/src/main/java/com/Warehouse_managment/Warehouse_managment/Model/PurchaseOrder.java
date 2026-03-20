package com.Warehouse_managment.Warehouse_managment.Model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "purchase_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    Integer id;

    @Column(name = "request_code", length = 50)
    String requestCode;

    @Column(name = "user_id_requester", nullable = false)
    Long requesterId;

    @Column(name = "warehouse_id", nullable = false)
    Integer warehouseId;

    @Column(name = "request_date", nullable = false)
    LocalDateTime requestDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    OrderStatus status;

    @Column(name = "notes", columnDefinition = "TEXT")
    String notes;

    @Column(name = "supplier_id")
    Long supplierId;

    @Column(name = "approved_at")
    LocalDateTime approvedAt;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    List<PurchaseOrderDetail> orderDetails = new ArrayList<>();

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (requestDate == null) {
            requestDate = now;
        }
        if (status == null) {
            status = OrderStatus.pending_approval;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum OrderStatus {
        pending_approval,
        approved,
        rejected,
        ordered,
        partially_received,
        received
    }
}
