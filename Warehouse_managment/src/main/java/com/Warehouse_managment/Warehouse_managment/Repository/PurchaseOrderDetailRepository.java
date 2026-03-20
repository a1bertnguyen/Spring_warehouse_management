package com.Warehouse_managment.Warehouse_managment.Repository;


import com.Warehouse_managment.Warehouse_managment.Model.PurchaseOrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PurchaseOrderDetailRepository extends JpaRepository<PurchaseOrderDetail,Integer> {
    java.util.List<PurchaseOrderDetail> findByPurchaseOrder_Id(Integer orderId);
}
