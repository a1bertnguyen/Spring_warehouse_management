package com.Warehouse_managment.Warehouse_managment.Repository;

import com.Warehouse_managment.Warehouse_managment.Model.StockTakeDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockTakeDetailRepository extends JpaRepository<StockTakeDetail, Integer> {
    java.util.List<StockTakeDetail> findByStockTakeId(Integer stockTakeId);
}
