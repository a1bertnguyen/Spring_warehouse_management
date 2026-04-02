package com.Warehouse_managment.Warehouse_managment.Service;

import com.Warehouse_managment.Warehouse_managment.Dtos.StockTakeDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.StockTakeDetailDTO;

import java.util.List;

public interface StockTakeService {
    List<StockTakeDTO> getAllStockTakes();

    StockTakeDTO getStockTakeById(Integer id);

    List<StockTakeDetailDTO> getDetailsByStockTakeId(Integer stockTakeId);
}
