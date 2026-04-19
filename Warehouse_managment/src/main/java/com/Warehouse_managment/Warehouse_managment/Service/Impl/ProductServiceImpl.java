package com.Warehouse_managment.Warehouse_managment.Service.Impl;


import com.Warehouse_managment.Warehouse_managment.Exceptions.NotFoundException;
import com.Warehouse_managment.Warehouse_managment.Model.Category;
import com.Warehouse_managment.Warehouse_managment.Model.Product;
import com.Warehouse_managment.Warehouse_managment.Repository.CategoryRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.InventoryMovementRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.InventoryRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.ProductRepository;
import com.Warehouse_managment.Warehouse_managment.Dtos.ProductDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.nio.file.Paths;
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
    private final InventoryRepository inventoryRepository;
    private final InventoryMovementRepository inventoryMovementRepository;

    private static final String IMAGE_DIRECTORY = System.getProperty("user.dir") + "/product-images/";

    //AFTER YOUR FRONTEND IS SETUP CHANGE THE IMAGE DIRECTORY TO YHE FRONTEND YOU ARE USING
    private static final String IMAGE_DIRECTORY_2 =
            System.getProperty("user.home") + "\\Downloads\\";


    @Override
    public Response saveProduct(ProductDTO productDTO, MultipartFile imageFile) {

        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category Not Found"));

        //map our dto to product entity
        Product productToSave = Product.builder()
                .name(productDTO.getName())
                .sku(productDTO.getSku())
                .purchaseprice(productDTO.getPurchaseprice())
                .salePrice(productDTO.getSaleprice())
                .stockQuantity(0)
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

        //check if product fields is to be changed and update
        if (productDTO.getName() != null && !productDTO.getName().isBlank()) {
            existingProduct.setName(productDTO.getName());
        }

        if (productDTO.getSku() != null && !productDTO.getSku().isBlank()) {
            existingProduct.setSku(productDTO.getSku());
        }

        if (productDTO.getDescription() != null && !productDTO.getDescription().isBlank()) {
            existingProduct.setDescription(productDTO.getDescription());
        }

        if (productDTO.getPurchaseprice() != null && productDTO.getPurchaseprice().compareTo(BigDecimal.ZERO) >= 0) {
            existingProduct.setPurchaseprice(productDTO.getPurchaseprice());
        }
        if (productDTO.getSaleprice() != null && productDTO.getSaleprice().compareTo(BigDecimal.ZERO) >= 0) {
            existingProduct.setSalePrice(productDTO.getSaleprice());
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
        productDTO.setDescription(product.getDescription());
        productDTO.setExpiryDate(product.getExpiryDate());
        productDTO.setImageUrl(product.getImageUrl());
        productDTO.setCreatedAt(product.getCreatedAt());

        if (product.getCategory() != null) {
            productDTO.setCategoryId(product.getCategory().getId());
        }

        return productDTO;
    }


    // Save image to folder
    private String saveImage(MultipartFile imageFile) {
        // Validate image
        if (!imageFile.getContentType().startsWith("image/") || imageFile.getSize() > 1024 * 1024 * 1024) {
            throw new IllegalArgumentException("Only image files under 1GB are allowed");
        }

        Path currentPath = Paths.get(System.getProperty("user.dir"));
        if (currentPath.endsWith("backend")) {
            currentPath = currentPath.getParent();
        }

        // 3. Construct the full path to frontend/public/products
        Path imageDir = currentPath.resolve("warehouse-app")
                           .resolve("src")
                           .resolve("assets")
                           .resolve("products");

        // 4. Create the directory if it doesn't exist
        File directory = imageDir.toFile();

        if (!directory.exists()) {
            boolean created = directory.mkdirs(); // mkdirs() creates parent folders too if missing
            if(created) log.info("Directory was created: " + directory.getAbsolutePath());
        }

        // 5. Generate unique file name
        String uniqueFileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();

        // 6. Combine directory path and filename
        Path destinationPath = imageDir.resolve(uniqueFileName);

        try {
            // Transfer the file
            imageFile.transferTo(destinationPath.toFile());
        } catch (Exception e) {
            throw new IllegalArgumentException("Error saving Image: " + e.getMessage());
        }

        return "/assets/products/" + uniqueFileName;
    }
}
