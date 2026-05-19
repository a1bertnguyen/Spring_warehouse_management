package com.Warehouse_managment.Warehouse_managment.Service.Impl;

import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Dtos.StockInwardCreateItemRequest;
import com.Warehouse_managment.Warehouse_managment.Dtos.StockInwardCreateRequest;
import com.Warehouse_managment.Warehouse_managment.Dtos.StockInwardDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.StockInwardDetailDTO;
import com.Warehouse_managment.Warehouse_managment.Enum.InventoryMovementType;
import com.Warehouse_managment.Warehouse_managment.Enum.InventoryReferenceType;
import com.Warehouse_managment.Warehouse_managment.Enum.StockInwardStatus;
import com.Warehouse_managment.Warehouse_managment.Model.Inventory;
import com.Warehouse_managment.Warehouse_managment.Exceptions.NotFoundException;
import com.Warehouse_managment.Warehouse_managment.Model.Product;
import com.Warehouse_managment.Warehouse_managment.Model.PurchaseOrder;
import com.Warehouse_managment.Warehouse_managment.Model.PurchaseOrderDetail;
import com.Warehouse_managment.Warehouse_managment.Model.StockInward;
import com.Warehouse_managment.Warehouse_managment.Model.StockInwardDetail;
import com.Warehouse_managment.Warehouse_managment.Model.Supplier;
import com.Warehouse_managment.Warehouse_managment.Model.User;
import com.Warehouse_managment.Warehouse_managment.Model.Warehouse;
import com.Warehouse_managment.Warehouse_managment.Repository.InventoryRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.ProductRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.PurchaseOrderDetailRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.PurchaseOrderRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.StockInwardDetailRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.StockInwardRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.SupplierRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.UserRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.WarehouseRepository;
import com.Warehouse_managment.Warehouse_managment.Service.InventoryMovementService;
import com.Warehouse_managment.Warehouse_managment.Service.StockInwardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockInwardServiceImpl implements StockInwardService {

    private final StockInwardRepository stockInwardRepository;
    private final StockInwardDetailRepository stockInwardDetailRepository;
    private final ProductRepository productRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderDetailRepository purchaseOrderDetailRepository;
    private final InventoryRepository inventoryRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryMovementService inventoryMovementService;
    private final InventoryStockSyncService inventoryStockSyncService;

    private static final Map<StockInwardStatus, List<StockInwardStatus>> VALID_TRANSITIONS =
            new EnumMap<>(StockInwardStatus.class);

    static {
        VALID_TRANSITIONS.put(StockInwardStatus.DRAFT,
                List.of(StockInwardStatus.APPROVED, StockInwardStatus.CANCELLED));
        VALID_TRANSITIONS.put(StockInwardStatus.APPROVED,
                List.of(StockInwardStatus.COMPLETED, StockInwardStatus.CANCELLED));
        VALID_TRANSITIONS.put(StockInwardStatus.COMPLETED, List.of());
        VALID_TRANSITIONS.put(StockInwardStatus.CANCELLED, List.of());
    }

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
    @Transactional
    public Response updateStockInwardStatus(Integer id, StockInwardStatus status) {
        StockInward inward = stockInwardRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Stock inward not found"));

        StockInwardStatus currentStatus = inward.getStatus();
        if (status == null || status == currentStatus) {
            return Response.builder()
                    .status(200)
                    .message("Stock inward status updated successfully")
                    .data(toDto(inward))
                    .build();
        }

        validateStatusTransition(currentStatus, status);
        enforceStockInwardRoleTransition(currentStatus, status);

        if (status == StockInwardStatus.COMPLETED) {
            inward.setInwardDate(LocalDateTime.now());
        }
        inward.setStatus(status);
        StockInward updatedInward = stockInwardRepository.save(inward);

        if (status == StockInwardStatus.COMPLETED && currentStatus != StockInwardStatus.COMPLETED) {
            applyReceivedInventory(updatedInward);
        }

        if (updatedInward.getPurchaseOrder() != null) {
            updatePurchaseOrderReceiptStatus(updatedInward.getPurchaseOrder());
        }

        return Response.builder()
                .status(200)
                .message("Stock inward status updated successfully")
                .data(toDto(updatedInward))
                .build();
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

    @Override
    @Transactional
    public Response createStockInward(StockInwardCreateRequest request) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(request.getPurchaseOrderId())
                .orElseThrow(() -> new NotFoundException("Purchase order not found"));
        Warehouse warehouse = warehouseRepository.findByIdAndDeletedFalse(request.getWarehouseId())
                .orElseThrow(() -> new NotFoundException("Warehouse not found"));
        User currentUser = getCurrentUser();
        Supplier supplier = resolveSupplier(purchaseOrder);

        if (purchaseOrder.getStatus() != PurchaseOrder.OrderStatus.ordered
                && purchaseOrder.getStatus() != PurchaseOrder.OrderStatus.partially_received) {
            throw new IllegalStateException("Stock inward can only be created from ordered purchase orders");
        }

        if (purchaseOrder.getWarehouseId() != null
                && !Objects.equals(purchaseOrder.getWarehouseId(), warehouse.getId())) {
            throw new IllegalArgumentException("Selected warehouse must match the purchase order warehouse");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("At least one stock inward item is required");
        }

        LocalDateTime now = LocalDateTime.now();
        StockInward stockInward = new StockInward();
        stockInward.setInwardCode(request.getInwardCode().trim());
        stockInward.setSupplier(supplier);
        stockInward.setUser(currentUser);
        stockInward.setWarehouse(warehouse);
        stockInward.setPurchaseOrder(purchaseOrder);
        stockInward.setNotes(normalizeText(request.getNotes()));
        stockInward.setCreatedAt(now);
        stockInward.setStatus(StockInwardStatus.DRAFT);

        StockInward savedStockInward = stockInwardRepository.save(stockInward);
        List<StockInwardDetail> details = new ArrayList<>();

        for (StockInwardCreateItemRequest item : request.getItems()) {
            Product product = productRepository.findByIdAndDeletedFalse(item.getProductId())
                    .orElseThrow(() -> new NotFoundException("Product not found"));

            StockInwardDetail detail = new StockInwardDetail();
            detail.setStockInward(savedStockInward);
            detail.setProductId(product.getId());
            detail.setQuantityReceived(item.getQuantityReceived());
            detail.setUnitPriceNegotiated(normalizeAmount(item.getUnitPriceNegotiated()));
            detail.setUnitPurchasePrice(normalizeAmount(item.getUnitPurchasePrice()));
            details.add(detail);
        }

        stockInwardDetailRepository.saveAll(details);
        savedStockInward.setDetails(details);

        return Response.builder()
                .status(200)
                .message("Stock inward created and awaiting manager approval")
                .data(toDto(savedStockInward))
                .build();
    }

    private void validateStatusTransition(StockInwardStatus currentStatus, StockInwardStatus nextStatus) {
        List<StockInwardStatus> allowedTransitions = VALID_TRANSITIONS.getOrDefault(currentStatus, List.of());
        if (!allowedTransitions.contains(nextStatus)) {
            throw new IllegalStateException("Invalid stock inward status transition from "
                    + currentStatus + " to " + nextStatus);
        }
    }

    private void enforceStockInwardRoleTransition(StockInwardStatus currentStatus, StockInwardStatus nextStatus) {
        if (hasAuthority("ADMIN")) {
            return;
        }

        if (hasAuthority("MANAGER")) {
            boolean managerTransition =
                    (currentStatus == StockInwardStatus.DRAFT
                            && (nextStatus == StockInwardStatus.APPROVED
                            || nextStatus == StockInwardStatus.CANCELLED))
                            || (currentStatus == StockInwardStatus.APPROVED
                            && nextStatus == StockInwardStatus.CANCELLED);

            if (!managerTransition) {
                throw new IllegalStateException("Manager can only approve or cancel stock inwards before receipt");
            }
            return;
        }

        if (hasAuthority("WAREHOUSE_STAFF")) {
            boolean warehouseTransition =
                    currentStatus == StockInwardStatus.APPROVED
                            && nextStatus == StockInwardStatus.COMPLETED;

            if (!warehouseTransition) {
                throw new IllegalStateException("Warehouse staff can only complete approved stock inwards");
            }
            return;
        }

        throw new IllegalStateException("You are not allowed to update this stock inward status");
    }

    private void applyReceivedInventory(StockInward stockInward) {
        Warehouse warehouse = resolveWarehouse(stockInward);

        for (StockInwardDetail detail : stockInwardDetailRepository.findByStockInward_StockInwardId(stockInward.getStockInwardId())) {
            Product product = productRepository.findByIdAndDeletedFalse(detail.getProductId())
                    .orElseThrow(() -> new NotFoundException("Product not found"));

            Inventory inventory = inventoryRepository.findByProductAndWarehouse(product, warehouse)
                    .orElse(Inventory.builder()
                            .product(product)
                            .warehouse(warehouse)
                            .quantityOnHand(0)
                            .lastUpdated(new Timestamp(System.currentTimeMillis()))
                            .build());

            int quantityBefore = inventory.getQuantityOnHand() != null ? inventory.getQuantityOnHand() : 0;
            int quantityDelta = detail.getQuantityReceived() != null ? detail.getQuantityReceived() : 0;
            int quantityAfter = quantityBefore + quantityDelta;

            inventory.setQuantityOnHand(quantityAfter);
            inventory.setLastUpdated(new Timestamp(System.currentTimeMillis()));
            inventoryRepository.save(inventory);

            inventoryMovementService.recordMovement(
                    product,
                    warehouse,
                    quantityBefore,
                    quantityDelta,
                    quantityAfter,
                    InventoryMovementType.PURCHASE_RECEIPT,
                    InventoryReferenceType.PURCHASE_ORDER,
                    String.valueOf(stockInward.getPurchaseOrder() != null ? stockInward.getPurchaseOrder().getId() : stockInward.getStockInwardId()),
                    stockInward.getInwardCode(),
                    "Inventory increased after stock inward approval"
            );
            inventoryStockSyncService.syncProductStock(product.getId());
        }
    }

    private Warehouse resolveWarehouse(StockInward stockInward) {
        if (stockInward.getWarehouse() == null || stockInward.getWarehouse().getId() == null) {
            throw new NotFoundException("Warehouse not found for stock inward");
        }

        return warehouseRepository.findByIdAndDeletedFalse(stockInward.getWarehouse().getId())
                .orElseThrow(() -> new NotFoundException("Warehouse not found"));
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
                ? stockInward.getPurchaseOrder().getOrderCode()
                : null);

        return dto;
    }

    private void updatePurchaseOrderReceiptStatus(PurchaseOrder purchaseOrder) {
        List<PurchaseOrderDetail> orderDetails = purchaseOrderDetailRepository.findByPurchaseOrder_Id(purchaseOrder.getId());
        if (orderDetails.isEmpty()) {
            return;
        }

        Map<Long, Integer> receivedQuantityByProduct = stockInwardDetailRepository
                .findByStockInward_PurchaseOrder_Id(purchaseOrder.getId())
                .stream()
                .filter(detail -> detail.getStockInward() != null
                        && detail.getStockInward().getStatus() == StockInwardStatus.COMPLETED)
                .collect(Collectors.groupingBy(
                        StockInwardDetail::getProductId,
                        Collectors.summingInt(detail -> detail.getQuantityReceived() != null ? detail.getQuantityReceived() : 0)
                ));

        boolean hasAnyReceivedQuantity = receivedQuantityByProduct.values().stream()
                .anyMatch(quantity -> quantity != null && quantity > 0);
        if (!hasAnyReceivedQuantity) {
            purchaseOrder.setStatus(PurchaseOrder.OrderStatus.ordered);
            purchaseOrderRepository.save(purchaseOrder);
            return;
        }

        Map<Long, Integer> orderedQuantityByProduct = orderDetails.stream()
                .collect(Collectors.toMap(
                        PurchaseOrderDetail::getProductId,
                        detail -> detail.getOrderedQuantity() != null ? detail.getOrderedQuantity() : 0,
                        Integer::sum
                ));

        boolean fullyReceived = orderedQuantityByProduct.entrySet().stream()
                .allMatch(entry -> receivedQuantityByProduct.getOrDefault(entry.getKey(), 0) >= entry.getValue());

        purchaseOrder.setStatus(
                fullyReceived
                        ? PurchaseOrder.OrderStatus.received
                        : PurchaseOrder.OrderStatus.partially_received
        );
        purchaseOrderRepository.save(purchaseOrder);
    }

    private boolean hasAuthority(String authority) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }

        Set<String> authorities = authentication.getAuthorities().stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority())
                .collect(java.util.stream.Collectors.toSet());
        return authorities.contains(authority);
    }

    private Supplier resolveSupplier(PurchaseOrder purchaseOrder) {
        if (purchaseOrder.getSupplierId() == null) {
            throw new NotFoundException("Supplier not found for this purchase order");
        }

        return supplierRepository.findById(purchaseOrder.getSupplierId())
                .orElseThrow(() -> new NotFoundException("Supplier not found"));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new NotFoundException("Authenticated user not found");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new NotFoundException("Authenticated user not found"));
    }

    private String normalizeText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private BigDecimal normalizeAmount(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
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
