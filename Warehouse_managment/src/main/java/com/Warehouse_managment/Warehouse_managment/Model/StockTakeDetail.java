package com.Warehouse_managment.Warehouse_managment.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "stock_take_details",
        indexes = {
                @Index(name = "idx_stock_take_details_stock_take_id", columnList = "stock_take_id"),
                @Index(name = "idx_stock_take_details_product_id", columnList = "product_id")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockTakeDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stock_take_detail_id")
    private Integer stockTakeDetailId;

    @Column(name = "stock_take_id", nullable = false)
    private Integer stockTakeId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "stock_take_id",
            referencedColumnName = "stock_take_id",
            nullable = false,
            insertable = false,
            updatable = false,
            foreignKey = @ForeignKey(name = "fk_stock_take_details_stock_take")
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private StockTake stockTake;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "product_id",
            referencedColumnName = "id",
            nullable = false,
            insertable = false,
            updatable = false,
            foreignKey = @ForeignKey(name = "fk_stock_take_details_product")
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Product product;

    @Column(name = "system_quantity", nullable = false)
    private Integer systemQuantity;

    @Column(name = "counted_quantity", nullable = false)
    private Integer countedQuantity;

    @Column(name = "discrepancy", nullable = false)
    private Integer discrepancy;

    // Không lưu trong DB, chỉ dùng để hiển thị
    @Transient
    private String productCode;

    @Transient
    private String productName;

    @Transient
    private String unit;

    @Override
    public String toString() {
        return "StockTakeDetail{" +
                "stockTakeDetailId=" + stockTakeDetailId +
                ", stockTakeId=" + stockTakeId +
                ", productId=" + productId +
                ", systemQuantity=" + systemQuantity +
                ", countedQuantity=" + countedQuantity +
                ", discrepancy=" + discrepancy +
                ", productCode='" + productCode + '\'' +
                ", productName='" + productName + '\'' +
                ", unit='" + unit + '\'' +
                '}';
    }
}
