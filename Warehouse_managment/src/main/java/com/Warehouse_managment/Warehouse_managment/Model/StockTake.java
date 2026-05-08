package com.Warehouse_managment.Warehouse_managment.Model;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;
import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "stock_takes",
        indexes = {
                @Index(name = "idx_stock_takes_user_id", columnList = "user_id"),
                @Index(name = "idx_stock_takes_created_at", columnList = "created_at")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockTake {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stock_take_id")
    private Integer stockTakeId;

    @Column(name = "stock_take_code", nullable = false, unique = true)
    private String stockTakeCode;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            referencedColumnName = "id",
            nullable = false,
            insertable = false,
            updatable = false,
            foreignKey = @ForeignKey(name = "fk_stock_takes_user")
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @Column(name = "stock_take_date", nullable = false)
    private Date stockTakeDate;

    @Column(name = "status", nullable = false)
    private String status; // pending, in_progress, completed, reconciled

    @Column(name = "notes")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private Timestamp createdAt;

    @Builder.Default
    @OneToMany(mappedBy = "stockTake", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<StockTakeDetail> details = new ArrayList<>();

    // Các field chỉ dùng để hiển thị (không mapping DB)
    @Transient
    private String userFullName;

    @Transient
    private Integer totalProducts;

    @Transient
    private Integer completedProducts;

    @Override
    public String toString() {
        return "StockTake{" +
                "stockTakeId=" + stockTakeId +
                ", stockTakeCode='" + stockTakeCode + '\'' +
                ", userId=" + userId +
                ", stockTakeDate=" + stockTakeDate +
                ", status='" + status + '\'' +
                ", notes='" + notes + '\'' +
                ", createdAt=" + createdAt +
                ", detailCount=" + (details != null ? details.size() : 0) +
                ", userFullName='" + userFullName + '\'' +
                ", totalProducts=" + totalProducts +
                ", completedProducts=" + completedProducts +
                '}';
    }
}
