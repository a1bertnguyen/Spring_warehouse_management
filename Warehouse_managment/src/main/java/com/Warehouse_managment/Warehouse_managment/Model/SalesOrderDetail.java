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
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Entity
@Table(name = "sales_order_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SalesOrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_detail_id")
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_order_id", nullable = false)
    SalesOrder salesOrder;

    @Column(name = "product_id", nullable = false)
    Long productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    Product product;

    @Column(name = "warehouse_id", nullable = false)
    Integer warehouseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", insertable = false, updatable = false)
    Warehouse warehouse;

    @Column(name = "quantity_ordered", nullable = false)
    Integer quantityOrdered;

    @Column(name = "unit_sale_price", nullable = false)
    BigDecimal unitSalePrice;

    @Override
    public String toString() {
        return "SalesOrderDetail{" +
                "id=" + id +
                ", salesOrderId=" + (salesOrder != null ? salesOrder.getId() : null) +
                ", productId=" + productId +
                ", warehouseId=" + warehouseId +
                ", quantityOrdered=" + quantityOrdered +
                ", unitSalePrice=" + unitSalePrice +
                '}';
    }
}
