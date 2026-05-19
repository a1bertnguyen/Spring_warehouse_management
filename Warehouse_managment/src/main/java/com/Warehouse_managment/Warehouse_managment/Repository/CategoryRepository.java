package com.Warehouse_managment.Warehouse_managment.Repository;

import com.Warehouse_managment.Warehouse_managment.Model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByIdAndDeletedFalse(Long id);

    List<Category> findByDeletedFalse(Sort sort);

    Optional<Category> findByNameIgnoreCaseAndDeletedFalse(String name);
}
