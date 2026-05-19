package com.Warehouse_managment.Warehouse_managment.Repository;

import com.Warehouse_managment.Warehouse_managment.Model.Category;
import com.Warehouse_managment.Warehouse_managment.Model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByIdAndDeletedFalse(Long id);

    List<Product> findByDeletedFalse(Sort sort);

    @Query("""
            SELECT p
            FROM Product p
            WHERE p.deleted = false
              AND (
                    LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))
                    OR LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :description, '%'))
              )
            """)
    List<Product> findByNameContainingOrDescriptionContaining(@Param("name") String name,
                                                              @Param("description") String description);

    List<Product> findByCategoryAndDeletedFalse(Category category);

    List<Product> findByCategory(Category category);

    Optional<Product> findBySkuIgnoreCaseAndDeletedFalse(String sku);

    @Query(value = "SELECT * FROM products WHERE deleted = false ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Optional<Product> findRandomProduct();
}
