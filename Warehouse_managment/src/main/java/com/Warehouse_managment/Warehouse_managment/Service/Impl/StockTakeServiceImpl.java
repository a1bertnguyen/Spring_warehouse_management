package com.Warehouse_managment.Warehouse_managment.Service.Impl;

import com.Warehouse_managment.Warehouse_managment.Dtos.StockTakeDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.StockTakeDetailDTO;
import com.Warehouse_managment.Warehouse_managment.Exceptions.NotFoundException;
import com.Warehouse_managment.Warehouse_managment.Model.Product;
import com.Warehouse_managment.Warehouse_managment.Model.StockTake;
import com.Warehouse_managment.Warehouse_managment.Model.StockTakeDetail;
import com.Warehouse_managment.Warehouse_managment.Model.User;
import com.Warehouse_managment.Warehouse_managment.Repository.ProductRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.StockTakeDetailRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.StockTakeRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.UserRepository;
import com.Warehouse_managment.Warehouse_managment.Service.StockTakeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockTakeServiceImpl implements StockTakeService {

    private final StockTakeRepository stockTakeRepository;
    private final StockTakeDetailRepository stockTakeDetailRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public List<StockTakeDTO> getAllStockTakes() {
        return stockTakeRepository.findAll().stream()
                .sorted((left, right) -> {
                    var rightCreated = right.getCreatedAt() != null ? right.getCreatedAt().toInstant() : java.time.Instant.MIN;
                    var leftCreated = left.getCreatedAt() != null ? left.getCreatedAt().toInstant() : java.time.Instant.MIN;
                    return rightCreated.compareTo(leftCreated);
                })
                .map(this::toDto)
                .toList();
    }

    @Override
    public StockTakeDTO getStockTakeById(Integer id) {
        StockTake stockTake = stockTakeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Stock take not found"));
        return toDto(stockTake);
    }

    @Override
    public List<StockTakeDetailDTO> getDetailsByStockTakeId(Integer stockTakeId) {
        stockTakeRepository.findById(stockTakeId)
                .orElseThrow(() -> new NotFoundException("Stock take not found"));

        return stockTakeDetailRepository.findByStockTakeId(stockTakeId).stream()
                .map(this::toDetailDto)
                .toList();
    }

    private StockTakeDTO toDto(StockTake stockTake) {
        List<StockTakeDetailDTO> details = stockTakeDetailRepository.findByStockTakeId(stockTake.getStockTakeId()).stream()
                .map(this::toDetailDto)
                .toList();

        User user = stockTake.getUserId() != null
                ? userRepository.findById(Long.valueOf(stockTake.getUserId())).orElse(null)
                : null;

        StockTakeDTO dto = new StockTakeDTO();
        dto.setStockTakeId(stockTake.getStockTakeId());
        dto.setStockTakeCode(stockTake.getStockTakeCode());
        dto.setUserId(stockTake.getUserId());
        dto.setUserFullName(user != null ? user.getName() : null);
        dto.setStockTakeDate(stockTake.getStockTakeDate());
        dto.setStatus(stockTake.getStatus());
        dto.setNotes(stockTake.getNotes());
        dto.setCreatedAt(stockTake.getCreatedAt());
        dto.setDetails(details);
        dto.setTotalProducts(details.size());
        dto.setCompletedProducts((int) details.stream()
                .filter(detail -> detail.getCountedQuantity() != null)
                .count());
        dto.setDiscrepancyCount((int) details.stream()
                .filter(detail -> detail.getDiscrepancy() != null && detail.getDiscrepancy() != 0)
                .count());
        return dto;
    }

    private StockTakeDetailDTO toDetailDto(StockTakeDetail detail) {
        Product product = productRepository.findById(Long.valueOf(detail.getProductId())).orElse(null);
        return new StockTakeDetailDTO(
                detail.getStockTakeDetailId(),
                detail.getStockTakeId(),
                detail.getProductId(),
                product != null ? product.getSku() : detail.getProductCode(),
                product != null ? product.getName() : detail.getProductName(),
                detail.getUnit(),
                detail.getSystemQuantity(),
                detail.getCountedQuantity(),
                detail.getDiscrepancy()
        );
    }
}
