package com.Warehouse_managment.Warehouse_managment.Repository;

import com.Warehouse_managment.Warehouse_managment.Model.Inventory;
import com.Warehouse_managment.Warehouse_managment.Model.Product;
import com.Warehouse_managment.Warehouse_managment.Model.Warehouse;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Integer> {

    @Query("SELECT COALESCE(SUM(i.quantityOnHand), 0) FROM Inventory i")
    long getTotalQuantityOnHand();

    @Query("SELECT COALESCE(SUM(i.quantityOnHand), 0) FROM Inventory i WHERE i.product.id = :productId")
    long getTotalQuantityOnHandByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.quantityOnHand = 0")
    long countOutOfStock();

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.quantityOnHand <= i.product.lowStockThreshold AND i.quantityOnHand > 0")
    long countLowStock();

    Optional<Inventory> findByProductAndWarehouse(Product product, Warehouse warehouse);

    List<Inventory> findByWarehouse(Warehouse warehouse);

    List<Inventory> findByProduct(Product product);

    boolean existsByProduct(Product product);

    List<Inventory> findByWarehouse_Id(Integer warehouseId);

    List<Inventory> findByWarehouse_Id(Integer warehouseId, Sort sort);

    Optional<Inventory> findByProduct_IdAndWarehouse_Id(Long productId, Integer warehouseId);

    @Query("""
            SELECT i
            FROM Inventory i
            WHERE (:warehouseId IS NULL OR i.warehouse.id = :warehouseId)
              AND (:productName IS NULL OR LOWER(i.product.name) LIKE CONCAT('%', LOWER(:productName), '%'))
            ORDER BY i.inventoryId DESC
            """)
    List<Inventory> findByWarehouseAndProductName(@Param("warehouseId") Integer warehouseId,
                                                  @Param("productName") String productName);
}
