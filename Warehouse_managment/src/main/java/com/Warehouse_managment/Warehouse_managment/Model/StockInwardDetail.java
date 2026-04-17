package com.Warehouse_managment.Warehouse_managment.Model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "stockinwarddetails")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockInwardDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inward_detail_id")
    Integer inwardDetailId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_inward_id", nullable = false)
    StockInward stockInward;

    @Column(name = "product_id", nullable = false)
    Long productId;

    @Column(name = "quantity_received", nullable = false)
    Integer quantityReceived;

    @Column(name = "unit_price_negotiated")
    BigDecimal unitPriceNegotiated;

    @Column(name = "unit_purchase_price")
    BigDecimal unitPurchasePrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    Product product;

    @Override
    public String toString() {
        return "StockInwardDetail{" +
                "inwardDetailId=" + inwardDetailId +
                ", stockInwardId=" + (stockInward != null ? stockInward.getStockInwardId() : null) +
                ", productId=" + productId +
                ", quantityReceived=" + quantityReceived +
                ", unitPriceNegotiated=" + unitPriceNegotiated +
                ", unitPurchasePrice=" + unitPurchasePrice +
                '}';
    }
}
