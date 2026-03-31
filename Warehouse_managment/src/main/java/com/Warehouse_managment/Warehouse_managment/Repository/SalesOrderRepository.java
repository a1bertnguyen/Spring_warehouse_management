package com.Warehouse_managment.Warehouse_managment.Repository;

import com.Warehouse_managment.Warehouse_managment.Enum.SalesOrderStatus;
import com.Warehouse_managment.Warehouse_managment.Model.SalesOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder, Integer>, JpaSpecificationExecutor<SalesOrder> {

    Optional<SalesOrder> findByOrderCode(String orderCode);

    long countByStatus(SalesOrderStatus status);
}
