package com.Warehouse_managment.Warehouse_managment.Service.Impl;

import com.Warehouse_managment.Warehouse_managment.Dtos.StockInwardDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.StockInwardDetailDTO;
import com.Warehouse_managment.Warehouse_managment.Enum.StockInwardStatus;
import com.Warehouse_managment.Warehouse_managment.Exceptions.NotFoundException;
import com.Warehouse_managment.Warehouse_managment.Model.Product;
import com.Warehouse_managment.Warehouse_managment.Model.StockInward;
import com.Warehouse_managment.Warehouse_managment.Model.StockInwardDetail;
import com.Warehouse_managment.Warehouse_managment.Model.Supplier;
import com.Warehouse_managment.Warehouse_managment.Model.User;
import com.Warehouse_managment.Warehouse_managment.Model.Warehouse;
import com.Warehouse_managment.Warehouse_managment.Repository.ProductRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.StockInwardDetailRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.StockInwardRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.SupplierRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.UserRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.WarehouseRepository;
import com.Warehouse_managment.Warehouse_managment.Service.StockInwardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StockInwardServiceImpl implements StockInwardService {

    private final StockInwardRepository stockInwardRepository;
    private final StockInwardDetailRepository stockInwardDetailRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final WarehouseRepository warehouseRepository;

    @Override
    public List<StockInward> findAll() {
        return stockInwardRepository.findAll();
    }

    @Override
    public Optional<StockInward> findById(Integer id) {
        return stockInwardRepository.findById(id);
    }

    @Override
    public StockInward save(StockInward stockInward) {
        if (stockInward.getStatus() == null) {
            stockInward.setStatus(StockInwardStatus.DRAFT);
        }
        if (stockInward.getCreatedAt() == null) {
            stockInward.setCreatedAt(LocalDateTime.now());
        }
        return stockInwardRepository.save(stockInward);
    }

    @Override
    public void deleteById(Integer id) {
        stockInwardRepository.deleteById(id);
    }

    @Override
    public void updateStatus(Integer id, StockInwardStatus status) {
        StockInward inward = stockInwardRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Stock inward not found"));
        inward.setStatus(status);
        stockInwardRepository.save(inward);
    }
    @Override
    public List<StockInward> findByStatus(StockInwardStatus status) {
        return stockInwardRepository.findByStatus(status);
    }
    @Override
    public Page<StockInward> filter(
            StockInwardStatus status,
            String inwardCode,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {
        return stockInwardRepository.filter(
                status,
                inwardCode,
                startDate,
                endDate,
                pageable
        );
    }
    @Override
    public Page<StockInward> pageByStatus(StockInwardStatus status, Pageable pageable) {
        return stockInwardRepository.findAllByStatus(status, pageable);
    }
    @Override
    public Page<StockInward> filterByManager(
            StockInwardStatus status,
            String inwardCode,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Integer userId,
            Integer supplierId,
            Pageable pageable) {

        return stockInwardRepository.findAll((root, query, cb) -> {
            var predicates = cb.conjunction();

            if (status != null)
                predicates = cb.and(predicates, cb.equal(root.get("status"), status));

            if (inwardCode != null && !inwardCode.isEmpty())
                predicates = cb.and(predicates, cb.like(root.get("inwardCode"), "%" + inwardCode + "%"));

            if (startDate != null)
                predicates = cb.and(predicates, cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));

            if (endDate != null)
                predicates = cb.and(predicates, cb.lessThanOrEqualTo(root.get("createdAt"), endDate));

            if (userId != null)
                predicates = cb.and(predicates, cb.equal(root.get("user").get("id"), Long.valueOf(userId)));

            if (supplierId != null)
                predicates = cb.and(predicates, cb.equal(root.get("supplier").get("id"), Long.valueOf(supplierId)));

            return predicates;
        }, pageable);
    }
    @Override
    public long count() {
        return stockInwardRepository.count();
    }

    @Override
    public List<StockInwardDTO> getAllStockInwards() {
        return stockInwardRepository.findAll().stream()
                .sorted((left, right) -> {
                    LocalDateTime rightCreated = right.getCreatedAt() != null ? right.getCreatedAt() : LocalDateTime.MIN;
                    LocalDateTime leftCreated = left.getCreatedAt() != null ? left.getCreatedAt() : LocalDateTime.MIN;
                    return rightCreated.compareTo(leftCreated);
                })
                .map(this::toDto)
                .toList();
    }

    @Override
    public StockInwardDTO getStockInwardById(Integer id) {
        StockInward stockInward = stockInwardRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Stock inward not found"));
        return toDto(stockInward);
    }

    @Override
    public List<StockInwardDetailDTO> getDetailsByStockInwardId(Integer stockInwardId) {
        stockInwardRepository.findById(stockInwardId)
                .orElseThrow(() -> new NotFoundException("Stock inward not found"));

        return stockInwardDetailRepository.findByStockInward_StockInwardId(stockInwardId).stream()
                .map(this::toDetailDto)
                .toList();
    }

    private StockInwardDTO toDto(StockInward stockInward) {
        List<StockInwardDetailDTO> details = stockInwardDetailRepository
                .findByStockInward_StockInwardId(stockInward.getStockInwardId()).stream()
                .map(this::toDetailDto)
                .toList();

        StockInwardDTO dto = new StockInwardDTO();
        dto.setStockInwardId(stockInward.getStockInwardId());
        dto.setInwardCode(stockInward.getInwardCode());
        dto.setNotes(stockInward.getNotes());
        dto.setInwardDate(stockInward.getInwardDate());
        dto.setCreatedAt(stockInward.getCreatedAt());
        dto.setStatus(stockInward.getStatus());
        dto.setDetails(details);
        dto.setTotalItems(details.size());
        dto.setTotalReceivedQuantity(details.stream()
                .map(StockInwardDetailDTO::getQuantityReceived)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum());

        Supplier supplier = stockInward.getSupplier() != null
                ? supplierRepository.findById(stockInward.getSupplier().getId()).orElse(null)
                : null;
        User user = stockInward.getUser() != null
                ? userRepository.findById(stockInward.getUser().getId()).orElse(null)
                : null;
        Warehouse warehouse = stockInward.getWarehouse() != null
                ? warehouseRepository.findById(stockInward.getWarehouse().getId()).orElse(null)
                : null;

        dto.setSupplierId(supplier != null ? supplier.getId() : null);
        dto.setSupplierName(supplier != null ? supplier.getName() : null);
        dto.setUserId(user != null ? user.getId() : null);
        dto.setUserName(user != null ? user.getName() : null);
        dto.setWarehouseId(warehouse != null ? warehouse.getId() : null);
        dto.setWarehouseName(warehouse != null ? warehouse.getName() : null);
        dto.setPurchaseOrderId(stockInward.getPurchaseOrder() != null ? stockInward.getPurchaseOrder().getId() : null);
        dto.setPurchaseOrderCode(stockInward.getPurchaseOrder() != null
                ? stockInward.getPurchaseOrder().getRequestCode()
                : null);

        return dto;
    }

    private StockInwardDetailDTO toDetailDto(StockInwardDetail detail) {
        Product product = detail.getProduct() != null
                ? detail.getProduct()
                : productRepository.findById(detail.getProductId()).orElse(null);

        BigDecimal price = detail.getUnitPurchasePrice() != null
                ? detail.getUnitPurchasePrice()
                : detail.getUnitPriceNegotiated();

        BigDecimal lineValue = null;
        if (price != null && detail.getQuantityReceived() != null) {
            lineValue = price.multiply(BigDecimal.valueOf(detail.getQuantityReceived()));
        }

        return new StockInwardDetailDTO(
                detail.getInwardDetailId(),
                detail.getStockInward() != null ? detail.getStockInward().getStockInwardId() : null,
                detail.getProductId(),
                product != null ? product.getName() : null,
                product != null ? product.getSku() : null,
                detail.getQuantityReceived(),
                detail.getUnitPriceNegotiated(),
                detail.getUnitPurchasePrice(),
                lineValue
        );
    }
}
