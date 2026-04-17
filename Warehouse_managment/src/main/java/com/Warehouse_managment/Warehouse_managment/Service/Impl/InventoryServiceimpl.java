package com.Warehouse_managment.Warehouse_managment.Service.Impl;

import com.Warehouse_managment.Warehouse_managment.Dtos.InventoryDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Exceptions.NotFoundException;
import com.Warehouse_managment.Warehouse_managment.Model.Inventory;
import com.Warehouse_managment.Warehouse_managment.Repository.InventoryRepository;
import com.Warehouse_managment.Warehouse_managment.Service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;
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
                .data(inventories)
                .build();
    }

    @Override
    public Response getInventoryById(Integer id) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Inventory Not Found"));

        return Response.builder()
                .status(200)
                .message("success")
                .data(toInventoryDTO(inventory))
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
                .data(inventories)
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
                .data(inventories)
                .build();
    }

    @Override
    public Response getInventorySummary() {
        return Response.builder()
                .status(200)
                .message("success")
                .data(Map.of(
                        "totalQuantityOnHand", inventoryRepository.getTotalQuantityOnHand(),
                        "outOfStockCount", inventoryRepository.countOutOfStock(),
                        "lowStockCount", inventoryRepository.countLowStock()
                ))
                .meta(Response.Meta.builder()
                        .totalQuantityOnHand(inventoryRepository.getTotalQuantityOnHand())
                        .outOfStockCount(inventoryRepository.countOutOfStock())
                        .lowStockCount(inventoryRepository.countLowStock())
                        .build())
                .build();
    }

    @Override
    public byte[] exportInventoriesToExcel(Integer warehouseId, String productName) {
        String normalizedProductName = productName == null || productName.isBlank() ? null : productName.trim();

        List<InventoryDTO> inventories = inventoryRepository.findByWarehouseAndProductName(warehouseId, normalizedProductName)
                .stream()
                .map(this::toInventoryDTO)
                .collect(Collectors.toList());

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Inventories");

            String[] headers = {
                    "Inventory ID",
                    "Warehouse",
                    "Product ID",
                    "Product Name",
                    "SKU",
                    "Quantity On Hand",
                    "Low Stock Threshold",
                    "Purchase Price",
                    "Sale Price",
                    "Status",
                    "Last Updated"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            int rowIndex = 1;
            for (InventoryDTO inventory : inventories) {
                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(inventory.getInventoryId());
                row.createCell(1).setCellValue(defaultString(inventory.getWarehouseName()));
                row.createCell(2).setCellValue(inventory.getProductId() != null ? inventory.getProductId() : 0L);
                row.createCell(3).setCellValue(defaultString(inventory.getProductName()));
                row.createCell(4).setCellValue(defaultString(inventory.getProductSku()));
                row.createCell(5).setCellValue(inventory.getQuantityOnHand() != null ? inventory.getQuantityOnHand() : 0);
                row.createCell(6).setCellValue(inventory.getLowStockThreshold() != null ? inventory.getLowStockThreshold() : 0);
                row.createCell(7).setCellValue(inventory.getPurchaseprice() != null ? inventory.getPurchaseprice().doubleValue() : 0);
                row.createCell(8).setCellValue(inventory.getSaleprice() != null ? inventory.getSaleprice().doubleValue() : 0);
                row.createCell(9).setCellValue(inventory.getStatus() != null ? inventory.getStatus().getLabel() : "");
                row.createCell(10).setCellValue(inventory.getLastUpdated() != null ? inventory.getLastUpdated().toString() : "");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to export inventories to Excel", e);
        }
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

    private String defaultString(String value) {
        return value != null ? value : "";
    }
}
