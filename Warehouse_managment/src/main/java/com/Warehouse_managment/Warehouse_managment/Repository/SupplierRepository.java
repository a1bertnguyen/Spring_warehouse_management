package com.Warehouse_managment.Warehouse_managment.Repository;

import com.Warehouse_managment.Warehouse_managment.Model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    java.util.Optional<Supplier> findByNameIgnoreCase(String name);
}
