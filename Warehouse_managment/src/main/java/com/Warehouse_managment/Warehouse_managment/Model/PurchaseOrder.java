package com.Warehouse_managment.Warehouse_managment.Model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
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

    @Column(name = "request_code", length = 50, nullable = false, unique = true)
    String orderCode;

    @Column(name = "purchase_request_id")
    Integer purchaseRequestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_request_id", insertable = false, updatable = false)
    PurchaseRequest purchaseRequest;

    @Column(name = "user_id_requester", nullable = false)
    Long requesterId;

    @Column(name = "warehouse_id", nullable = false)
    Integer warehouseId;

    @Column(name = "request_date", nullable = false)
    LocalDateTime orderDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    OrderStatus status;

    @Column(name = "notes", columnDefinition = "TEXT")
    String notes;

    @Column(name = "supplier_id")
    Long supplierId;

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
        if (orderDate == null) {
            orderDate = now;
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
        received,
        cancelled
    }
}
