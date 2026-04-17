package com.Warehouse_managment.Warehouse_managment.Model;

import com.Warehouse_managment.Warehouse_managment.Enum.PurchaseRequestStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
@Table(name = "purchase_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    Integer id;

    @Column(name = "request_code", length = 50, nullable = false, unique = true)
    String requestCode;

    @Column(name = "user_id_requester", nullable = false)
    Long requesterId;

    @Column(name = "warehouse_id", nullable = false)
    Integer warehouseId;

    @Column(name = "supplier_id")
    Long supplierId;

    @Column(name = "request_date", nullable = false)
    LocalDateTime requestDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    PurchaseRequestStatus status;

    @Column(name = "notes", columnDefinition = "TEXT")
    String notes;

    @Column(name = "approved_at")
    LocalDateTime approvedAt;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @OneToMany(mappedBy = "purchaseRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    List<PurchaseRequestDetail> requestDetails = new ArrayList<>();

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
            status = PurchaseRequestStatus.pending_approval;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
