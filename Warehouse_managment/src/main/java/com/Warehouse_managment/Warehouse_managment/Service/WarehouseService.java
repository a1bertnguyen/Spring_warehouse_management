package com.Warehouse_managment.Warehouse_managment.Service;

import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Dtos.WarehouseDTO;

public interface WarehouseService {

    Response createWarehouse(WarehouseDTO warehouseDTO);

    Response getAllWarehouses();

    Response getWarehouseById(Integer id);

    Response updateWarehouse(Integer id, WarehouseDTO warehouseDTO);

    Response deleteWarehouse(Integer id);

    Response getProductsByWarehouseId(Integer warehouseId);

    Response addProductToWarehouse(Integer warehouseId, Long productId, Integer quantity);

    Response removeProductFromWarehouse(Integer warehouseId, Long productId);
}
