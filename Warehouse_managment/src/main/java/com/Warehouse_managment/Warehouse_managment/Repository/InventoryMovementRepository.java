package com.Warehouse_managment.Warehouse_managment.Repository;

import com.Warehouse_managment.Warehouse_managment.Enum.InventoryMovementType;
import com.Warehouse_managment.Warehouse_managment.Enum.InventoryReferenceType;
import com.Warehouse_managment.Warehouse_managment.Model.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {

    @Query("""
            SELECT m
            FROM InventoryMovement m
            WHERE (:warehouseId IS NULL OR m.warehouseId = :warehouseId)
              AND (:productId IS NULL OR m.productId = :productId)
              AND (:movementType IS NULL OR m.movementType = :movementType)
              AND (:referenceType IS NULL OR m.referenceType = :referenceType)
              AND (:referenceId IS NULL OR m.referenceId = :referenceId)
            ORDER BY m.createdAt DESC, m.movementId DESC
            """)
    List<InventoryMovement> search(@Param("warehouseId") Integer warehouseId,
                                   @Param("productId") Long productId,
                                   @Param("movementType") InventoryMovementType movementType,
                                   @Param("referenceType") InventoryReferenceType referenceType,
                                   @Param("referenceId") String referenceId);
}
