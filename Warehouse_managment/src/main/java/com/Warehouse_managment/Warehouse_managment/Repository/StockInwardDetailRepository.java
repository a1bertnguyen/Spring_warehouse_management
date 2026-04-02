package com.Warehouse_managment.Warehouse_managment.Repository;

import com.Warehouse_managment.Warehouse_managment.Model.StockInwardDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockInwardDetailRepository extends JpaRepository<StockInwardDetail, Integer> {
    List<StockInwardDetail> findByStockInward_StockInwardId(Integer stockInwardId);
}
