package com.Warehouse_managment.Warehouse_managment.Service.Impl;



import com.Warehouse_managment.Warehouse_managment.Exceptions.NotFoundException;
import com.Warehouse_managment.Warehouse_managment.Model.Category;
import com.Warehouse_managment.Warehouse_managment.Model.Product;
import com.Warehouse_managment.Warehouse_managment.Repository.CategoryRepository;
import com.Warehouse_managment.Warehouse_managment.Dtos.CategoryDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Repository.InventoryMovementRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.InventoryRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.ProductRepository;
import com.Warehouse_managment.Warehouse_managment.Service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ModelMapper modelMapper;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryMovementRepository inventoryMovementRepository;


    @Override
    public Response createCategory(CategoryDTO categoryDTO) {

        Category categoryToSave = modelMapper.map(categoryDTO, Category.class);

        categoryRepository.save(categoryToSave);

        return Response.builder()
                .status(200)
                .message("Category Saved Successfully")
                .build();

    }

    @Override
    public Response getAllCategories() {
        List<Category> categories = categoryRepository.findByDeletedFalse(Sort.by(Sort.Direction.DESC, "id"));

        categories.forEach(category -> category.setProducts(null));

        List<CategoryDTO> categoryDTOList = modelMapper.map(categories, new TypeToken<List<CategoryDTO>>() {
        }.getType());

        return Response.builder()
                .status(200)
                .message("success")
                .data(categoryDTOList)
                .build();
    }

    @Override
    public Response getCategoryById(Long id) {

        Category category = getActiveCategory(id);

        CategoryDTO categoryDTO = modelMapper.map(category, CategoryDTO.class);

        return Response.builder()
                .status(200)
                .message("success")
                .data(categoryDTO)
                .build();
    }

    @Override
    public Response updateCategory(Long id, CategoryDTO categoryDTO) {

        Category existingCategory = getActiveCategory(id);

        existingCategory.setName(categoryDTO.getName());

        categoryRepository.save(existingCategory);

        return Response.builder()
                .status(200)
                .message("Category Was Successfully Updated")
                .build();

    }

    @Override
    public Response deleteCategory(Long id) {

        Category category = getActiveCategory(id);
        List<Product> linkedProducts = productRepository.findByCategory(category);
        List<Product> activeProducts = linkedProducts.stream()
                .filter(product -> !Boolean.TRUE.equals(product.getDeleted()))
                .collect(Collectors.toList());

        boolean hasWarehouseInventory = activeProducts.stream()
                .anyMatch(inventoryRepository::existsByProduct);
        if (hasWarehouseInventory) {
            category.setDeleted(true);
            categoryRepository.save(category);

            return Response.builder()
                    .status(200)
                    .message("Category archived successfully because linked products are still assigned to warehouse inventory")
                    .build();
        }

        boolean hasInventoryMovementHistory = linkedProducts.stream()
                .anyMatch(product -> inventoryMovementRepository.existsByProductId(product.getId()));
        boolean hasArchivedLinkedProducts = linkedProducts.stream()
                .anyMatch(product -> Boolean.TRUE.equals(product.getDeleted()));
        if (hasInventoryMovementHistory || hasArchivedLinkedProducts) {
            category.setDeleted(true);
            categoryRepository.save(category);

            return Response.builder()
                    .status(200)
                    .message("Category archived successfully because linked products still have historical references")
                    .build();
        }

        categoryRepository.delete(category);

        return Response.builder()
                .status(200)
                .message("Category Was Successfully Deleted")
                .build();
    }

    private Category getActiveCategory(Long id) {
        return categoryRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Category Not Found"));
    }
}
