package com.Warehouse_managment.Warehouse_managment.Service;

import com.Warehouse_managment.Warehouse_managment.Dtos.Response;

public interface InventoryService {

    Response getAllInventories();

    Response getInventoryById(Integer id);

    Response getInventoriesByWarehouseId(Integer warehouseId);

    Response searchInventories(Integer warehouseId, String productName);

    Response getInventorySummary();
}
