package com.Warehouse_managment.Warehouse_managment.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stock_take_details")
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

    @Column(name = "product_id", nullable = false)
    private Long productId;

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
}
