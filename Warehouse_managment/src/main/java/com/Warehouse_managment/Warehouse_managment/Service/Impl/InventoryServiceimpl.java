package com.Warehouse_managment.Warehouse_managment.Service.Impl;

import com.Warehouse_managment.Warehouse_managment.Dtos.InventoryDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Exceptions.NotFoundException;
import com.Warehouse_managment.Warehouse_managment.Model.Inventory;
import com.Warehouse_managment.Warehouse_managment.Repository.InventoryRepository;
import com.Warehouse_managment.Warehouse_managment.Service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;

    @Override
    public Response getAllInventories() {
        List<InventoryDTO> inventories = inventoryRepository.findAll(Sort.by(Sort.Direction.DESC, "inventoryId"))
                .stream()
                .map(this::toInventoryDTO)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("success")
                .inventories(inventories)
                .build();
    }

    @Override
    public Response getInventoryById(Integer id) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Inventory Not Found"));

        return Response.builder()
                .status(200)
                .message("success")
                .inventory(toInventoryDTO(inventory))
                .build();
    }

    @Override
    public Response getInventoriesByWarehouseId(Integer warehouseId) {
        List<InventoryDTO> inventories = inventoryRepository.findByWarehouse_Id(warehouseId, Sort.by(Sort.Direction.DESC, "inventoryId"))
                .stream()
                .map(this::toInventoryDTO)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("success")
                .inventories(inventories)
                .build();
    }

    @Override
    public Response searchInventories(Integer warehouseId, String productName) {
        String normalizedProductName = productName == null || productName.isBlank() ? null : productName.trim();

        List<InventoryDTO> inventories = inventoryRepository.findByWarehouseAndProductName(warehouseId, normalizedProductName)
                .stream()
                .map(this::toInventoryDTO)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("success")
                .inventories(inventories)
                .build();
    }

    @Override
    public Response getInventorySummary() {
        return Response.builder()
                .status(200)
                .message("success")
                .totalQuantityOnHand(inventoryRepository.getTotalQuantityOnHand())
                .outOfStockCount(inventoryRepository.countOutOfStock())
                .lowStockCount(inventoryRepository.countLowStock())
                .build();
    }

    private InventoryDTO toInventoryDTO(Inventory inventory) {
        InventoryDTO inventoryDTO = new InventoryDTO();
        inventoryDTO.setInventoryId(inventory.getInventoryId());
        inventoryDTO.setQuantityOnHand(inventory.getQuantityOnHand());
        inventoryDTO.setStatus(inventory.getStatus());
        inventoryDTO.setLastUpdated(inventory.getLastUpdated());

        if (inventory.getProduct() != null) {
            inventoryDTO.setProductId(inventory.getProduct().getId());
            inventoryDTO.setProductName(inventory.getProduct().getName());
            inventoryDTO.setProductSku(inventory.getProduct().getSku());
            inventoryDTO.setProductImageUrl(inventory.getProduct().getImageUrl());
            inventoryDTO.setLowStockThreshold(inventory.getProduct().getLowStockThreshold());
            inventoryDTO.setPurchaseprice(inventory.getProduct().getPurchaseprice());
            inventoryDTO.setSaleprice(inventory.getProduct().getSalePrice());
        }

        if (inventory.getWarehouse() != null) {
            inventoryDTO.setWarehouseId(inventory.getWarehouse().getId());
            inventoryDTO.setWarehouseName(inventory.getWarehouse().getName());
        }

        return inventoryDTO;
    }
}
