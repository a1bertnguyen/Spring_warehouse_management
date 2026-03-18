package com.Warehouse_managment.Warehouse_managment.Repository;

import com.Warehouse_managment.Warehouse_managment.Model.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Integer> {
}

