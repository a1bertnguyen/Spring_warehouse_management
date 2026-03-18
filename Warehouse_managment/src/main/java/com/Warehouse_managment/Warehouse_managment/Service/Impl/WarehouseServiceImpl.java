package com.Warehouse_managment.Warehouse_managment.Service.Impl;

import com.Warehouse_managment.Warehouse_managment.Dtos.ProductDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Dtos.WarehouseDTO;
import com.Warehouse_managment.Warehouse_managment.Exceptions.NotFoundException;
import com.Warehouse_managment.Warehouse_managment.Model.Inventory;
import com.Warehouse_managment.Warehouse_managment.Model.Product;
import com.Warehouse_managment.Warehouse_managment.Model.Warehouse;
import com.Warehouse_managment.Warehouse_managment.Repository.InventoryRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.ProductRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.WarehouseRepository;
import com.Warehouse_managment.Warehouse_managment.Service.WarehouseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WarehouseServiceImpl implements WarehouseService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final ModelMapper modelMapper;

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
                .warehouses(warehouseDTOList)
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
                .warehouse(warehouseDTO)
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
    public Response deleteWarehouse(Integer id) {
        Warehouse warehouse = getWarehouseEntity(id);
        List<Inventory> inventories = inventoryRepository.findByWarehouse(warehouse);

        if (!inventories.isEmpty()) {
            inventoryRepository.deleteAll(inventories);
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
                .products(mapProductsByWarehouse(warehouse))
                .build();
    }

    @Override
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
        inventory.setQuantityOnHand(inventory.getQuantityOnHand() + quantityToAdd);
        inventory.setLastUpdated(new Timestamp(System.currentTimeMillis()));
        inventoryRepository.save(inventory);

        return Response.builder()
                .status(200)
                .message("Product Was Added To Warehouse Successfully")
                .build();
    }

    @Override
    public Response removeProductFromWarehouse(Integer warehouseId, Long productId) {
        Warehouse warehouse = getWarehouseEntity(warehouseId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product Not Found"));

        Inventory inventory = inventoryRepository.findByProductAndWarehouse(product, warehouse)
                .orElseThrow(() -> new NotFoundException("Product Not Found In Warehouse"));

        inventoryRepository.delete(inventory);

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
}
