package com.Warehouse_managment.Warehouse_managment.Repository;

import com.Warehouse_managment.Warehouse_managment.Model.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Integer>,
        JpaSpecificationExecutor<PurchaseOrder> {

    Optional<PurchaseOrder> findByOrderCode(String orderCode);

    Optional<PurchaseOrder> findByPurchaseRequestId(Integer purchaseRequestId);
}	
