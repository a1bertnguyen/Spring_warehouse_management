package com.Warehouse_managment.Warehouse_managment.Service.Impl;


import com.Warehouse_managment.Warehouse_managment.Exceptions.NotFoundException;
import com.Warehouse_managment.Warehouse_managment.Enum.ProductStatus;
import com.Warehouse_managment.Warehouse_managment.Model.Category;
import com.Warehouse_managment.Warehouse_managment.Model.Inventory;
import com.Warehouse_managment.Warehouse_managment.Model.Product;
import com.Warehouse_managment.Warehouse_managment.Model.Supplier;
import com.Warehouse_managment.Warehouse_managment.Repository.CategoryRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.InventoryMovementRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.InventoryRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.ProductRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.SupplierRepository;
import com.Warehouse_managment.Warehouse_managment.Dtos.ProductDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.File;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryMovementRepository inventoryMovementRepository;

    @Override
    public Response saveProduct(ProductDTO productDTO, MultipartFile imageFile) {

        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category Not Found"));

        if (productDTO.getSupplierId() != null) {
            supplierRepository.findById(productDTO.getSupplierId())
                    .orElseThrow(() -> new NotFoundException("Supplier Not Found"));
        }

        //map our dto to product entity
        Product productToSave = Product.builder()
                .name(productDTO.getName())
                .sku(productDTO.getSku())
                .purchaseprice(productDTO.getPurchaseprice())
                .salePrice(productDTO.getSaleprice())
                .stockQuantity(safeInteger(productDTO.getStockQuantity(), 0))
                .supplierId(productDTO.getSupplierId())
                .lowStockThreshold(safeInteger(productDTO.getLowStockThreshold(), 0))
                .status(productDTO.getStatus() != null ? productDTO.getStatus() : ProductStatus.active)
                .unit(trimToNull(productDTO.getUnit()))
                .description(productDTO.getDescription())
                .expiryDate(productDTO.getExpiryDate())
                .category(category)
                .build();

        if (imageFile != null && !imageFile.isEmpty()) {
            String imagePath = saveImage(imageFile);
            productToSave.setImageUrl(imagePath);
        }

        //save the product entity
        productRepository.save(productToSave);

        return Response.builder()
                .status(200)
                .message("Product successfully saved")
                .build();
    }

    @Override
    public Response updateProduct(ProductDTO productDTO, MultipartFile imageFile) {

        //check if product exisit
        Product existingProduct = productRepository.findById(productDTO.getProductId())
                .orElseThrow(() -> new NotFoundException("Product Not Found"));

        // update image
        if (imageFile != null && !imageFile.isEmpty()) {
            String imagePath = saveImage(imageFile);
            existingProduct.setImageUrl(imagePath);
        }

        //check if category is to be chanegd for the products
        if (productDTO.getCategoryId() != null && productDTO.getCategoryId() > 0) {
            Category category = categoryRepository.findById(productDTO.getCategoryId())
                    .orElseThrow(() -> new NotFoundException("Category Not Found"));
            existingProduct.setCategory(category);
        }

        if (productDTO.getSupplierId() != null) {
            supplierRepository.findById(productDTO.getSupplierId())
                    .orElseThrow(() -> new NotFoundException("Supplier Not Found"));
        }

        //check if product fields is to be changed and update
        if (productDTO.getName() != null && !productDTO.getName().isBlank()) {
            existingProduct.setName(productDTO.getName());
        }

        if (productDTO.getSku() != null && !productDTO.getSku().isBlank()) {
            existingProduct.setSku(productDTO.getSku());
        }

        if (productDTO.getDescription() != null) {
            existingProduct.setDescription(trimToNull(productDTO.getDescription()));
        }

        if (productDTO.getSupplierId() != null) {
            existingProduct.setSupplierId(productDTO.getSupplierId());
        }

        if (productDTO.getPurchaseprice() != null && productDTO.getPurchaseprice().compareTo(BigDecimal.ZERO) >= 0) {
            existingProduct.setPurchaseprice(productDTO.getPurchaseprice());
        }
        if (productDTO.getSaleprice() != null && productDTO.getSaleprice().compareTo(BigDecimal.ZERO) >= 0) {
            existingProduct.setSalePrice(productDTO.getSaleprice());
        }

        if (productDTO.getLowStockThreshold() != null && productDTO.getLowStockThreshold() >= 0) {
            existingProduct.setLowStockThreshold(productDTO.getLowStockThreshold());
        }

        if (productDTO.getStatus() != null) {
            existingProduct.setStatus(productDTO.getStatus());
        }

        if (productDTO.getUnit() != null) {
            existingProduct.setUnit(trimToNull(productDTO.getUnit()));
        }

        if (productDTO.getExpiryDate() != null) {
            existingProduct.setExpiryDate(productDTO.getExpiryDate());
        }

        //update the product
        productRepository.save(existingProduct);

        //Build our response
        return Response.builder()
                .status(200)
                .message("Product Updated successfully")
                .build();


    }

    @Override
    public Response getAllProducts() {

        List<Product> productList = productRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));

        List<ProductDTO> productDTOList = productList.stream()
                .map(this::toProductDTO)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("success")
                .data(productDTOList)
                .build();
    }

    @Override
    public Response getProductById(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product Not Found"));

        return Response.builder()
                .status(200)
                .message("success")
                .data(toProductDTO(product))
                .build();
    }

    @Override
    public Response deleteProduct(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product Not Found"));

        if (inventoryMovementRepository.existsByProductId(id)) {
            throw new IllegalStateException("Cannot delete product because it has inventory movement history");
        }

        if (inventoryRepository.existsByProduct(product)) {
            throw new IllegalStateException("Cannot delete product because it is assigned to warehouse inventory");
        }

        productRepository.delete(product);

        return Response.builder()
                .status(200)
                .message("Product Deleted successfully")
                .build();
    }

    @Override
    public Response searchProduct(String input) {

        List<Product> products = productRepository.findByNameContainingOrDescriptionContaining(input, input);

        if (products.isEmpty()) {
            throw new NotFoundException("Product Not Found");
        }

        List<ProductDTO> productDTOList = products.stream()
                .map(this::toProductDTO)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("success")
                .data(productDTOList)
                .build();
    }

    @Override
    public byte[] exportProductsToExcel(String search, String status, Integer warehouseId) {
        String normalizedSearch = search == null || search.isBlank() ? null : search.trim().toLowerCase();
        ProductStatus parsedStatus = null;

        if (status != null && !status.isBlank()) {
            parsedStatus = ProductStatus.valueOf(status.trim().toLowerCase());
        }
        final ProductStatus normalizedStatus = parsedStatus;

        List<Product> productsToExport =
                warehouseId != null
                        ? inventoryRepository.findByWarehouse_Id(warehouseId).stream()
                        .map(Inventory::getProduct)
                        .filter(product -> product != null && product.getId() != null)
                        .distinct()
                        .toList()
                        : productRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));

        List<ProductDTO> productDTOList = productsToExport.stream()
                .filter(product -> matchesSearch(product, normalizedSearch))
                .filter(product -> normalizedStatus == null || product.getStatus() == normalizedStatus)
                .map(this::toProductDTO)
                .collect(Collectors.toList());

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Products");

            String[] headers = {
                    "No.",
                    "Code",
                    "Product Name",
                    "Purchase Price",
                    "Sale Price",
                    "Status",
                    "Supplier",
                    "Category",
                    "Unit",
                    "Minimum Stock"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            int rowIndex = 1;
            for (ProductDTO product : productDTOList) {
                Row row = sheet.createRow(rowIndex);
                row.createCell(0).setCellValue(rowIndex);
                row.createCell(1).setCellValue(defaultString(product.getSku()));
                row.createCell(2).setCellValue(defaultString(product.getName()));
                row.createCell(3).setCellValue(product.getPurchaseprice() != null ? product.getPurchaseprice().doubleValue() : 0);
                row.createCell(4).setCellValue(product.getSaleprice() != null ? product.getSaleprice().doubleValue() : 0);
                row.createCell(5).setCellValue(formatStatus(product.getStatus()));
                row.createCell(6).setCellValue(defaultString(product.getSupplierName()));
                row.createCell(7).setCellValue(defaultString(product.getCategoryName()));
                row.createCell(8).setCellValue(defaultString(product.getUnit()));
                row.createCell(9).setCellValue(product.getLowStockThreshold() != null ? product.getLowStockThreshold() : 0);
                rowIndex++;
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to export products to Excel", e);
        }
    }

    @Override
    public Response importProductsFromExcel(MultipartFile excelFile) {
        if (excelFile == null || excelFile.isEmpty()) {
            throw new IllegalArgumentException("Excel file is required");
        }

        int importedCount = 0;
        DataFormatter formatter = new DataFormatter();

        try (InputStream inputStream = excelFile.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {
            Sheet sheet = workbook.getNumberOfSheets() > 0 ? workbook.getSheetAt(0) : null;

            if (sheet == null) {
                throw new IllegalArgumentException("Excel file does not contain any sheet");
            }

            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null || isImportRowEmpty(row, formatter)) {
                    continue;
                }

                String sku = normalizeImportText(readCell(row, 1, formatter));
                String name = normalizeImportText(readCell(row, 2, formatter));
                String purchasePriceValue = normalizeImportText(readCell(row, 3, formatter));
                String salePriceValue = normalizeImportText(readCell(row, 4, formatter));
                String statusValue = normalizeImportText(readCell(row, 5, formatter));
                String supplierName = normalizeImportText(readCell(row, 6, formatter));
                String categoryName = normalizeImportText(readCell(row, 7, formatter));
                String unit = normalizeImportText(readCell(row, 8, formatter));
                String lowStockThresholdValue = normalizeImportText(readCell(row, 9, formatter));

                if (sku == null || name == null || categoryName == null) {
                    continue;
                }

                if (productRepository.findBySkuIgnoreCase(sku).isPresent()) {
                    continue;
                }

                Category category = categoryRepository.findByNameIgnoreCase(categoryName)
                        .orElseThrow(() -> new NotFoundException("Category Not Found: " + categoryName));

                Supplier supplier = supplierName != null
                        ? supplierRepository.findByNameIgnoreCase(supplierName)
                        .orElseThrow(() -> new NotFoundException("Supplier Not Found: " + supplierName))
                        : null;

                Product product = Product.builder()
                        .sku(sku)
                        .name(name)
                        .purchaseprice(parseDecimalValue(purchasePriceValue))
                        .salePrice(parseDecimalValue(salePriceValue))
                        .status(resolveImportedStatus(statusValue))
                        .supplierId(supplier != null ? supplier.getId() : null)
                        .lowStockThreshold(parseIntegerValue(lowStockThresholdValue, 0))
                        .unit(unit)
                        .category(category)
                        .stockQuantity(0)
                        .build();

                productRepository.save(product);
                importedCount++;
            }
        } catch (RuntimeException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to import products from Excel", exception);
        }

        return Response.builder()
                .status(200)
                .message("Imported " + importedCount + " products successfully")
                .build();
    }

    private ProductDTO toProductDTO(Product product) {
        ProductDTO productDTO = new ProductDTO();
        productDTO.setId(product.getId());
        productDTO.setProductId(product.getId());
        productDTO.setName(product.getName());
        productDTO.setSku(product.getSku());
        productDTO.setPurchaseprice(product.getPurchaseprice());
        productDTO.setSaleprice(product.getSalePrice());
        productDTO.setStockQuantity(product.getStockQuantity());
        productDTO.setSupplierId(product.getSupplierId());
        productDTO.setLowStockThreshold(product.getLowStockThreshold());
        productDTO.setStatus(product.getStatus());
        productDTO.setUnit(product.getUnit());
        productDTO.setDescription(product.getDescription());
        productDTO.setExpiryDate(product.getExpiryDate());
        productDTO.setImageUrl(product.getImageUrl());
        productDTO.setCreatedAt(product.getCreatedAt());

        if (product.getCategory() != null) {
            productDTO.setCategoryId(product.getCategory().getId());
            productDTO.setCategoryName(product.getCategory().getName());
        }

        if (product.getSupplierId() != null) {
            supplierRepository.findById(product.getSupplierId())
                    .map(Supplier::getName)
                    .ifPresent(productDTO::setSupplierName);
        }

        return productDTO;
    }

    private boolean matchesSearch(Product product, String normalizedSearch) {
        if (normalizedSearch == null) {
            return true;
        }

        return containsValue(product.getSku(), normalizedSearch)
                || containsValue(product.getName(), normalizedSearch)
                || containsValue(product.getDescription(), normalizedSearch);
    }

    private boolean containsValue(String value, String normalizedSearch) {
        return value != null && value.toLowerCase().contains(normalizedSearch);
    }

    private Integer safeInteger(Integer value, Integer fallback) {
        return value != null ? value : fallback;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String defaultString(String value) {
        return value != null ? value : "";
    }

    private String formatStatus(ProductStatus status) {
        if (status == null) {
            return "";
        }

        return status == ProductStatus.active ? "Active" : "Inactive";
    }

    private boolean isImportRowEmpty(Row row, DataFormatter formatter) {
        for (int cellIndex = 1; cellIndex <= 9; cellIndex++) {
            if (normalizeImportText(readCell(row, cellIndex, formatter)) != null) {
                return false;
            }
        }

        return true;
    }

    private String readCell(Row row, int cellIndex, DataFormatter formatter) {
        Cell cell = row.getCell(cellIndex);
        return cell == null ? "" : formatter.formatCellValue(cell);
    }

    private String normalizeImportText(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private BigDecimal parseDecimalValue(String value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }

        String normalizedValue = value.replace(",", "").trim();
        return normalizedValue.isEmpty() ? BigDecimal.ZERO : new BigDecimal(normalizedValue);
    }

    private Integer parseIntegerValue(String value, Integer fallback) {
        if (value == null) {
            return fallback;
        }

        String normalizedValue = value.replace(",", "").trim();
        return normalizedValue.isEmpty() ? fallback : Integer.parseInt(normalizedValue);
    }

    private ProductStatus resolveImportedStatus(String rawStatus) {
        if (rawStatus == null) {
            return ProductStatus.active;
        }

        String normalizedStatus = rawStatus.trim().toLowerCase(Locale.ROOT).replace('-', '_').replace(' ', '_');
        for (ProductStatus status : ProductStatus.values()) {
            if (status.name().equalsIgnoreCase(normalizedStatus)) {
                return status;
            }
        }

        if ("active".equals(normalizedStatus)) {
            return ProductStatus.active;
        }
        if ("inactive".equals(normalizedStatus)) {
            return ProductStatus.inactive;
        }

        throw new IllegalArgumentException("Unsupported product status: " + rawStatus);
    }


    // Save image to folder
    private String saveImage(MultipartFile imageFile) {
        // Validate image
        if (!imageFile.getContentType().startsWith("image/") || imageFile.getSize() > 1024 * 1024 * 1024) {
            throw new IllegalArgumentException("Only image files under 1GB are allowed");
        }

        Path imageDir = resolveImageDirectory();

        File directory = imageDir.toFile();

        if (!directory.exists()) {
            boolean created = directory.mkdirs();
            if(created) log.info("Directory was created: " + directory.getAbsolutePath());
        }

        String uniqueFileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();

        Path destinationPath = imageDir.resolve(uniqueFileName);

        try {
            imageFile.transferTo(destinationPath.toFile());
            syncLegacyWarehouseAssetCopy(destinationPath, uniqueFileName);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error saving Image: " + e.getMessage());
        }

        return "/assets/products/" + uniqueFileName;
    }

    private Path resolveImageDirectory() {
        Path currentPath = Paths.get(System.getProperty("user.dir"));

        if (currentPath.endsWith("backend")) {
            currentPath = currentPath.getParent();
        }

        return currentPath.resolve("product-images").toAbsolutePath().normalize();
    }

    private void syncLegacyWarehouseAssetCopy(Path sourceFile, String fileName) {
        try {
            Path currentPath = Paths.get(System.getProperty("user.dir"));
            if (currentPath.endsWith("backend")) {
                currentPath = currentPath.getParent();
            }

            Path legacyAssetDirectory = currentPath.resolve("warehouse-app")
                    .resolve("src")
                    .resolve("assets")
                    .resolve("products");

            File legacyDirectory = legacyAssetDirectory.toFile();
            if (!legacyDirectory.exists()) {
                legacyDirectory.mkdirs();
            }

            java.nio.file.Files.copy(
                    sourceFile,
                    legacyAssetDirectory.resolve(fileName),
                    StandardCopyOption.REPLACE_EXISTING
            );
        } catch (Exception exception) {
            log.warn("Could not sync legacy product image copy: {}", exception.getMessage());
        }
    }
}
