package com.Warehouse_managment.Warehouse_managment.Service.Impl;

import com.Warehouse_managment.Warehouse_managment.Dtos.ProductDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Dtos.WarehouseDTO;
import com.Warehouse_managment.Warehouse_managment.Enum.InventoryMovementType;
import com.Warehouse_managment.Warehouse_managment.Enum.InventoryReferenceType;
import com.Warehouse_managment.Warehouse_managment.Exceptions.NotFoundException;
import com.Warehouse_managment.Warehouse_managment.Model.Inventory;
import com.Warehouse_managment.Warehouse_managment.Model.Product;
import com.Warehouse_managment.Warehouse_managment.Model.Warehouse;
import com.Warehouse_managment.Warehouse_managment.Repository.InventoryRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.ProductRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.WarehouseRepository;
import com.Warehouse_managment.Warehouse_managment.Service.InventoryMovementService;
import com.Warehouse_managment.Warehouse_managment.Service.WarehouseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WarehouseServiceImpl implements WarehouseService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final ModelMapper modelMapper;
    private final InventoryStockSyncService inventoryStockSyncService;
    private final InventoryMovementService inventoryMovementService;

    @Override
    public Response createWarehouse(WarehouseDTO warehouseDTO) {
        Warehouse warehouseToSave = modelMapper.map(warehouseDTO, Warehouse.class);
        warehouseRepository.save(warehouseToSave);

        return Response.builder()
                .status(200)
                .message("Warehouse Saved Successfully")
                .build();
    }

    @Override
    public Response getAllWarehouses() {
        List<Warehouse> warehouses = warehouseRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        warehouses.forEach(warehouse -> warehouse.setInventories(null));

        List<WarehouseDTO> warehouseDTOList = modelMapper.map(warehouses, new TypeToken<List<WarehouseDTO>>() {
        }.getType());

        return Response.builder()
                .status(200)
                .message("success")
                .data(warehouseDTOList)
                .build();
    }

    @Override
    public Response getWarehouseById(Integer id) {
        Warehouse warehouse = getWarehouseEntity(id);
        WarehouseDTO warehouseDTO = modelMapper.map(warehouse, WarehouseDTO.class);
        warehouseDTO.setProducts(mapProductsByWarehouse(warehouse));

        return Response.builder()
                .status(200)
                .message("success")
                .data(warehouseDTO)
                .build();
    }

    @Override
    public Response updateWarehouse(Integer id, WarehouseDTO warehouseDTO) {
        Warehouse existingWarehouse = getWarehouseEntity(id);

        if (warehouseDTO.getName() != null && !warehouseDTO.getName().isBlank()) {
            existingWarehouse.setName(warehouseDTO.getName());
        }

        if (warehouseDTO.getAddress() != null && !warehouseDTO.getAddress().isBlank()) {
            existingWarehouse.setAddress(warehouseDTO.getAddress());
        }

        warehouseRepository.save(existingWarehouse);

        return Response.builder()
                .status(200)
                .message("Warehouse Was Successfully Updated")
                .build();
    }

    @Override
    @Transactional
    public Response deleteWarehouse(Integer id) {
        Warehouse warehouse = getWarehouseEntity(id);
        List<Inventory> inventories = inventoryRepository.findByWarehouse(warehouse);
        Set<Long> affectedProductIds = inventories.stream()
                .map(Inventory::getProduct)
                .filter(product -> product != null && product.getId() != null)
                .map(Product::getId)
                .collect(Collectors.toSet());

        if (!inventories.isEmpty()) {
            for (Inventory inventory : inventories) {
                int quantityBefore = safeQuantity(inventory.getQuantityOnHand());
                inventoryMovementService.recordMovement(
                        inventory.getProduct(),
                        warehouse,
                        quantityBefore,
                        -quantityBefore,
                        0,
                        InventoryMovementType.WAREHOUSE_DELETION,
                        InventoryReferenceType.WAREHOUSE,
                        String.valueOf(warehouse.getId()),
                        warehouse.getName(),
                        "Inventory row removed because warehouse was deleted"
                );
            }
            inventoryRepository.deleteAll(inventories);
            affectedProductIds.forEach(inventoryStockSyncService::syncProductStock);
        }

        warehouseRepository.delete(warehouse);

        return Response.builder()
                .status(200)
                .message("Warehouse Was Successfully Deleted")
                .build();
    }

    @Override
    public Response getProductsByWarehouseId(Integer warehouseId) {
        Warehouse warehouse = getWarehouseEntity(warehouseId);

        return Response.builder()
                .status(200)
                .message("success")
                .data(mapProductsByWarehouse(warehouse))
                .build();
    }

    @Override
    @Transactional
    public Response addProductToWarehouse(Integer warehouseId, Long productId, Integer quantity) {
        Warehouse warehouse = getWarehouseEntity(warehouseId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product Not Found"));

        Inventory inventory = inventoryRepository.findByProductAndWarehouse(product, warehouse)
                .orElse(Inventory.builder()
                        .warehouse(warehouse)
                        .product(product)
                        .quantityOnHand(0)
                        .lastUpdated(new Timestamp(System.currentTimeMillis()))
                        .build());

        int quantityToAdd = quantity != null ? quantity : 0;
        int quantityBefore = safeQuantity(inventory.getQuantityOnHand());
        int quantityAfter = quantityBefore + quantityToAdd;
        inventory.setQuantityOnHand(quantityAfter);
        inventory.setLastUpdated(new Timestamp(System.currentTimeMillis()));
        inventoryRepository.save(inventory);
        inventoryMovementService.recordMovement(
                product,
                warehouse,
                quantityBefore,
                quantityToAdd,
                quantityAfter,
                InventoryMovementType.MANUAL_STOCK_IN,
                InventoryReferenceType.MANUAL,
                null,
                null,
                "Product quantity was added manually to warehouse"
        );
        inventoryStockSyncService.syncProductStock(product.getId());

        return Response.builder()
                .status(200)
                .message("Product Was Added To Warehouse Successfully")
                .build();
    }

    @Override
    @Transactional
    public Response removeProductFromWarehouse(Integer warehouseId, Long productId) {
        Warehouse warehouse = getWarehouseEntity(warehouseId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product Not Found"));

        Inventory inventory = inventoryRepository.findByProductAndWarehouse(product, warehouse)
                .orElseThrow(() -> new NotFoundException("Product Not Found In Warehouse"));

        int quantityBefore = safeQuantity(inventory.getQuantityOnHand());
        inventoryMovementService.recordMovement(
                product,
                warehouse,
                quantityBefore,
                -quantityBefore,
                0,
                InventoryMovementType.MANUAL_STOCK_OUT,
                InventoryReferenceType.WAREHOUSE,
                String.valueOf(warehouse.getId()),
                warehouse.getName(),
                "Product was removed from warehouse"
        );
        inventoryRepository.delete(inventory);
        inventoryStockSyncService.syncProductStock(product.getId());

        return Response.builder()
                .status(200)
                .message("Product Was Removed From Warehouse Successfully")
                .build();
    }

    private Warehouse getWarehouseEntity(Integer id) {
        return warehouseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Warehouse Not Found"));
    }

    private List<ProductDTO> mapProductsByWarehouse(Warehouse warehouse) {
        return inventoryRepository.findByWarehouse(warehouse).stream()
                .map(this::toProductDTO)
                .collect(Collectors.toList());
    }

    private ProductDTO toProductDTO(Inventory inventory) {
        Product product = inventory.getProduct();

        ProductDTO productDTO = new ProductDTO();
        productDTO.setId(product.getId());
        productDTO.setProductId(product.getId());
        productDTO.setName(product.getName());
        productDTO.setSku(product.getSku());
        productDTO.setPurchaseprice(product.getPurchaseprice());
        productDTO.setSaleprice(product.getSalePrice());
        productDTO.setStockQuantity(inventory.getQuantityOnHand());
        productDTO.setSupplierId(product.getSupplierId());
        productDTO.setDescription(product.getDescription());
        productDTO.setExpiryDate(product.getExpiryDate());
        productDTO.setImageUrl(product.getImageUrl());
        productDTO.setCreatedAt(product.getCreatedAt());

        if (product.getCategory() != null) {
            productDTO.setCategoryId(product.getCategory().getId());
        }

        return productDTO;
    }

    private int safeQuantity(Integer quantity) {
        return quantity != null ? quantity : 0;
    }
}
