package com.Warehouse_managment.Warehouse_managment.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "purchase_request_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequestDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_detail_id")
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    PurchaseRequest purchaseRequest;

    @Column(name = "product_id", nullable = false)
    Long productId;

    @Column(name = "requested_quantity", nullable = false)
    Integer requestedQuantity;

    @Column(name = "unit_price_estimated")
    BigDecimal unitPriceEstimated;

    @Column(name = "supplier_id_suggested")
    Long supplierIdSuggested;

    @Column(name = "note", columnDefinition = "TEXT")
    String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    Product product;
}
