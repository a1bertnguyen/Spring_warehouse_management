package com.Warehouse_managment.Warehouse_managment.Service.Impl;

import com.Warehouse_managment.Warehouse_managment.Dtos.PurchaseOrderDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.PurchaseOrderDetailDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.PurchaseOrderRequest;
import com.Warehouse_managment.Warehouse_managment.Dtos.PurchaseOrderUpdateRequest;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Enum.InventoryMovementType;
import com.Warehouse_managment.Warehouse_managment.Enum.InventoryReferenceType;
import com.Warehouse_managment.Warehouse_managment.Enum.PurchaseRequestStatus;
import com.Warehouse_managment.Warehouse_managment.Exceptions.NotFoundException;
import com.Warehouse_managment.Warehouse_managment.Model.Inventory;
import com.Warehouse_managment.Warehouse_managment.Model.Product;
import com.Warehouse_managment.Warehouse_managment.Model.PurchaseOrder;
import com.Warehouse_managment.Warehouse_managment.Model.PurchaseOrderDetail;
import com.Warehouse_managment.Warehouse_managment.Model.PurchaseRequest;
import com.Warehouse_managment.Warehouse_managment.Model.PurchaseRequestDetail;
import com.Warehouse_managment.Warehouse_managment.Model.Supplier;
import com.Warehouse_managment.Warehouse_managment.Model.User;
import com.Warehouse_managment.Warehouse_managment.Model.Warehouse;
import com.Warehouse_managment.Warehouse_managment.Repository.InventoryRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.ProductRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.PurchaseOrderDetailRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.PurchaseOrderRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.PurchaseRequestDetailRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.PurchaseRequestRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.SupplierRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.UserRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.WarehouseRepository;
import com.Warehouse_managment.Warehouse_managment.Service.InventoryMovementService;
import com.Warehouse_managment.Warehouse_managment.Service.PurchaseOrderDetailService;
import com.Warehouse_managment.Warehouse_managment.Service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.EnumMap;
import java.util.List;
import java.util.Set;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderDetailRepository purchaseOrderDetailRepository;
    private final PurchaseOrderDetailService purchaseOrderDetailService;
    private final PurchaseRequestRepository purchaseRequestRepository;
    private final PurchaseRequestDetailRepository purchaseRequestDetailRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryStockSyncService inventoryStockSyncService;
    private final InventoryMovementService inventoryMovementService;

    private static final Map<PurchaseOrder.OrderStatus, List<PurchaseOrder.OrderStatus>> VALID_TRANSITIONS =
            new EnumMap<>(PurchaseOrder.OrderStatus.class);

    static {
        VALID_TRANSITIONS.put(PurchaseOrder.OrderStatus.pending_approval,
                List.of(PurchaseOrder.OrderStatus.approved, PurchaseOrder.OrderStatus.ordered, PurchaseOrder.OrderStatus.cancelled, PurchaseOrder.OrderStatus.rejected));
        VALID_TRANSITIONS.put(PurchaseOrder.OrderStatus.approved,
                List.of(PurchaseOrder.OrderStatus.ordered, PurchaseOrder.OrderStatus.cancelled));
        VALID_TRANSITIONS.put(PurchaseOrder.OrderStatus.rejected, List.of());
        VALID_TRANSITIONS.put(PurchaseOrder.OrderStatus.ordered,
                List.of(PurchaseOrder.OrderStatus.partially_received, PurchaseOrder.OrderStatus.received, PurchaseOrder.OrderStatus.cancelled));
        VALID_TRANSITIONS.put(PurchaseOrder.OrderStatus.partially_received,
                List.of(PurchaseOrder.OrderStatus.received, PurchaseOrder.OrderStatus.cancelled));
        VALID_TRANSITIONS.put(PurchaseOrder.OrderStatus.received, List.of());
        VALID_TRANSITIONS.put(PurchaseOrder.OrderStatus.cancelled, List.of());
    }

    @Override
    @Transactional
    public Response createPurchaseOrder(PurchaseOrderRequest purchaseOrderRequest) {
        PurchaseRequest purchaseRequest = purchaseRequestRepository.findById(purchaseOrderRequest.getPurchaseRequestId())
                .orElseThrow(() -> new NotFoundException("Purchase Request Not Found"));

        if (purchaseRequest.getStatus() != PurchaseRequestStatus.approved) {
            throw new IllegalStateException("Purchase order can only be created from an approved purchase request");
        }

        purchaseOrderRepository.findByPurchaseRequestId(purchaseRequest.getId()).ifPresent(existing -> {
            throw new IllegalStateException("Purchase request has already been converted into a purchase order");
        });

        Long supplierId = purchaseOrderRequest.getSupplierId() != null
                ? purchaseOrderRequest.getSupplierId()
                : purchaseRequest.getSupplierId();

        if (supplierId != null) {
            supplierRepository.findById(supplierId)
                    .orElseThrow(() -> new NotFoundException("Supplier Not Found"));
        }

        PurchaseOrder purchaseOrder = new PurchaseOrder();
        purchaseOrder.setOrderCode(generateOrderCode());
        purchaseOrder.setPurchaseRequestId(purchaseRequest.getId());
        purchaseOrder.setRequesterId(purchaseRequest.getRequesterId());
        purchaseOrder.setWarehouseId(purchaseRequest.getWarehouseId());
        purchaseOrder.setSupplierId(supplierId);
        purchaseOrder.setNotes(purchaseOrderRequest.getNotes() != null ? purchaseOrderRequest.getNotes() : purchaseRequest.getNotes());
        purchaseOrder.setOrderDate(LocalDateTime.now());
        purchaseOrder.setStatus(PurchaseOrder.OrderStatus.approved);

        PurchaseOrder savedOrder = purchaseOrderRepository.save(purchaseOrder);
        List<PurchaseRequestDetail> requestDetails = purchaseRequestDetailRepository.findByPurchaseRequest_Id(purchaseRequest.getId());
        savedOrder.setOrderDetails(purchaseOrderDetailService.saveDetailsFromRequest(savedOrder, requestDetails));

        purchaseRequest.setStatus(PurchaseRequestStatus.converted);
        purchaseRequestRepository.save(purchaseRequest);

        return Response.builder()
                .status(200)
                .message("Purchase Order Created Successfully")
                .data(toDto(savedOrder))
                .build();
    }

    @Override
    public Response getAllPurchaseOrders(int page,
                                         int size,
                                         Integer warehouseId,
                                         Long supplierId,
                                         Long requesterId,
                                         String orderCode,
                                         PurchaseOrder.OrderStatus status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Specification<PurchaseOrder> specification = Specification.where((root, query, cb) -> cb.isNotNull(root.get("purchaseRequestId")));

        if (warehouseId != null) {
            specification = specification.and((root, query, cb) -> cb.equal(root.get("warehouseId"), warehouseId));
        }
        if (supplierId != null) {
            specification = specification.and((root, query, cb) -> cb.equal(root.get("supplierId"), supplierId));
        }
        if (requesterId != null) {
            specification = specification.and((root, query, cb) -> cb.equal(root.get("requesterId"), requesterId));
        }
        if (orderCode != null && !orderCode.isBlank()) {
            specification = specification.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("orderCode")), "%" + orderCode.trim().toLowerCase() + "%"));
        }
        if (status != null) {
            specification = specification.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }

        Page<PurchaseOrder> orderPage = purchaseOrderRepository.findAll(specification, pageable);
        List<PurchaseOrderDTO> orderDTOs = orderPage.getContent().stream()
                .map(this::toSummaryDto)
                .toList();

        return Response.builder()
                .status(200)
                .message("success")
                .data(orderDTOs)
                .meta(Response.Meta.builder()
                        .totalElements(orderPage.getTotalElements())
                        .totalPages(orderPage.getTotalPages())
                        .build())
                .build();
    }

    @Override
    public Response getPurchaseOrderById(Integer id) {
        PurchaseOrder purchaseOrder = getOrderEntity(id);

        return Response.builder()
                .status(200)
                .message("success")
                .data(toDto(purchaseOrder))
                .build();
    }

    @Override
    @Transactional
    public Response updatePurchaseOrder(Integer id, PurchaseOrderUpdateRequest purchaseOrderUpdateRequest) {
        PurchaseOrder purchaseOrder = getOrderEntity(id);

        if (purchaseOrder.getStatus() == PurchaseOrder.OrderStatus.partially_received
                || purchaseOrder.getStatus() == PurchaseOrder.OrderStatus.received
                || purchaseOrder.getStatus() == PurchaseOrder.OrderStatus.rejected
                || purchaseOrder.getStatus() == PurchaseOrder.OrderStatus.cancelled) {
            throw new IllegalStateException("Cannot edit a purchase order that has already been received");
        }

        if (purchaseOrderUpdateRequest.getSupplierId() != null) {
            supplierRepository.findById(purchaseOrderUpdateRequest.getSupplierId())
                    .orElseThrow(() -> new NotFoundException("Supplier Not Found"));
            purchaseOrder.setSupplierId(purchaseOrderUpdateRequest.getSupplierId());
        }

        if (purchaseOrderUpdateRequest.getNotes() != null) {
            purchaseOrder.setNotes(purchaseOrderUpdateRequest.getNotes().trim());
        }

        applyPurchaseOrderStatusChange(purchaseOrder, purchaseOrderUpdateRequest.getStatus());
        PurchaseOrder updatedOrder = purchaseOrderRepository.save(purchaseOrder);

        return Response.builder()
                .status(200)
                .message("Purchase Order Updated Successfully")
                .data(toDto(updatedOrder))
                .build();
    }

    @Override
    @Transactional
    public Response updatePurchaseOrderStatus(Integer id, PurchaseOrder.OrderStatus status) {
        PurchaseOrder purchaseOrder = getOrderEntity(id);
        applyPurchaseOrderStatusChange(purchaseOrder, status);

        PurchaseOrder updatedOrder = purchaseOrderRepository.save(purchaseOrder);

        return Response.builder()
                .status(200)
                .message("Purchase Order Status Updated Successfully")
                .data(toDto(updatedOrder))
                .build();
    }

    private void applyPurchaseOrderStatusChange(PurchaseOrder purchaseOrder, PurchaseOrder.OrderStatus status) {
        PurchaseOrder.OrderStatus previousStatus = purchaseOrder.getStatus();

        if (status == null || status == previousStatus) {
            return;
        }

        validateStatusTransition(previousStatus, status);
        enforcePurchaseOrderRoleTransition(previousStatus, status);
        purchaseOrder.setStatus(status);

        if (status == PurchaseOrder.OrderStatus.received && previousStatus != PurchaseOrder.OrderStatus.received) {
            applyReceivedInventory(purchaseOrder);
        }
    }

    @Override
    @Transactional
    public Response deletePurchaseOrder(Integer id) {
        PurchaseOrder purchaseOrder = getOrderEntity(id);

        if (purchaseOrder.getStatus() == PurchaseOrder.OrderStatus.received
                || purchaseOrder.getStatus() == PurchaseOrder.OrderStatus.partially_received) {
            throw new IllegalStateException("Cannot delete a purchase order that has already been received");
        }

        if (purchaseOrder.getPurchaseRequestId() != null) {
            PurchaseRequest purchaseRequest = purchaseRequestRepository.findById(purchaseOrder.getPurchaseRequestId()).orElse(null);
            if (purchaseRequest != null && purchaseRequest.getStatus() == PurchaseRequestStatus.converted) {
                purchaseRequest.setStatus(PurchaseRequestStatus.approved);
                purchaseRequestRepository.save(purchaseRequest);
            }
        }

        purchaseOrderRepository.delete(purchaseOrder);

        return Response.builder()
                .status(200)
                .message("Purchase Order Deleted Successfully")
                .build();
    }

    private void validateStatusTransition(PurchaseOrder.OrderStatus currentStatus,
                                          PurchaseOrder.OrderStatus nextStatus) {
        List<PurchaseOrder.OrderStatus> allowedTransitions = VALID_TRANSITIONS.getOrDefault(currentStatus, List.of());
        if (!allowedTransitions.contains(nextStatus)) {
            throw new IllegalStateException("Invalid purchase order status transition from "
                    + currentStatus + " to " + nextStatus);
        }
    }

    private void enforcePurchaseOrderRoleTransition(PurchaseOrder.OrderStatus currentStatus,
                                                    PurchaseOrder.OrderStatus nextStatus) {
        if (hasAuthority("ADMIN")) {
            return;
        }

        if (hasAuthority("MANAGER")) {
            throw new IllegalStateException("Manager does not approve purchase orders in the current workflow");
        }

        if (hasAuthority("PURCHASE_STAFF")) {
            boolean purchaseStaffTransition =
                    ((currentStatus == PurchaseOrder.OrderStatus.pending_approval
                            || currentStatus == PurchaseOrder.OrderStatus.approved)
                            && (nextStatus == PurchaseOrder.OrderStatus.ordered
                            || nextStatus == PurchaseOrder.OrderStatus.cancelled))
                            || (currentStatus == PurchaseOrder.OrderStatus.ordered
                            && nextStatus == PurchaseOrder.OrderStatus.cancelled);
            if (!purchaseStaffTransition) {
                throw new IllegalStateException("Purchase staff can only send or cancel supplier purchase orders");
            }
            return;
        }

        throw new IllegalStateException("You are not allowed to update this purchase order status");
    }

    private void applyReceivedInventory(PurchaseOrder purchaseOrder) {
        Warehouse warehouse = warehouseRepository.findByIdAndDeletedFalse(purchaseOrder.getWarehouseId())
                .orElseThrow(() -> new NotFoundException("Warehouse Not Found"));

        for (PurchaseOrderDetail detail : purchaseOrderDetailRepository.findByPurchaseOrder_Id(purchaseOrder.getId())) {
            Product product = productRepository.findByIdAndDeletedFalse(detail.getProductId())
                    .orElseThrow(() -> new NotFoundException("Product Not Found"));

            Inventory inventory = inventoryRepository.findByProductAndWarehouse(product, warehouse)
                    .orElse(Inventory.builder()
                            .product(product)
                            .warehouse(warehouse)
                            .quantityOnHand(0)
                            .lastUpdated(new Timestamp(System.currentTimeMillis()))
                            .build());

            int quantityBefore = inventory.getQuantityOnHand() != null ? inventory.getQuantityOnHand() : 0;
            int quantityDelta = detail.getOrderedQuantity() != null ? detail.getOrderedQuantity() : 0;
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
                    String.valueOf(purchaseOrder.getId()),
                    purchaseOrder.getOrderCode(),
                    "Inventory increased after purchase order receipt"
            );
            inventoryStockSyncService.syncProductStock(product.getId());
        }
    }

    private PurchaseOrder getOrderEntity(Integer id) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Purchase Order Not Found"));
        if (purchaseOrder.getPurchaseRequestId() == null) {
            throw new NotFoundException("Purchase Order Not Found");
        }
        return purchaseOrder;
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

    private PurchaseOrderDTO toSummaryDto(PurchaseOrder purchaseOrder) {
        PurchaseOrderDTO dto = toDto(purchaseOrder);
        dto.setOrderDetails(null);
        return dto;
    }

    private PurchaseOrderDTO toDto(PurchaseOrder purchaseOrder) {
        PurchaseOrderDTO dto = new PurchaseOrderDTO();
        dto.setId(purchaseOrder.getId());
        dto.setOrderCode(purchaseOrder.getOrderCode());
        dto.setPurchaseRequestId(purchaseOrder.getPurchaseRequestId());
        dto.setRequesterId(purchaseOrder.getRequesterId());
        dto.setWarehouseId(purchaseOrder.getWarehouseId());
        dto.setSupplierId(purchaseOrder.getSupplierId());
        dto.setOrderDate(purchaseOrder.getOrderDate());
        dto.setStatus(purchaseOrder.getStatus());
        dto.setNotes(purchaseOrder.getNotes());
        dto.setCreatedAt(purchaseOrder.getCreatedAt());
        dto.setUpdatedAt(purchaseOrder.getUpdatedAt());

        PurchaseRequest purchaseRequest = purchaseOrder.getPurchaseRequestId() != null
                ? purchaseRequestRepository.findById(purchaseOrder.getPurchaseRequestId()).orElse(null)
                : null;
        User requester = purchaseOrder.getRequesterId() != null
                ? userRepository.findById(purchaseOrder.getRequesterId()).orElse(null)
                : null;
        Supplier supplier = purchaseOrder.getSupplierId() != null
                ? supplierRepository.findById(purchaseOrder.getSupplierId()).orElse(null)
                : null;
        Warehouse warehouse = purchaseOrder.getWarehouseId() != null
                ? warehouseRepository.findById(purchaseOrder.getWarehouseId()).orElse(null)
                : null;

        dto.setPurchaseRequestCode(purchaseRequest != null ? purchaseRequest.getRequestCode() : null);
        dto.setRequesterName(requester != null ? requester.getName() : null);
        dto.setSupplierName(supplier != null ? supplier.getName() : null);
        dto.setWarehouseName(warehouse != null ? warehouse.getName() : null);

        List<PurchaseOrderDetailDTO> details = purchaseOrderDetailRepository.findByPurchaseOrder_Id(purchaseOrder.getId()).stream()
                .map(purchaseOrderDetailService::toDto)
                .toList();
        dto.setOrderDetails(details);
        dto.setTotalItems(details.stream()
                .map(PurchaseOrderDetailDTO::getOrderedQuantity)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum());
        dto.setTotalEstimatedAmount(details.stream()
                .map(PurchaseOrderDetailDTO::getLineTotalEstimated)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        return dto;
    }

    private String generateOrderCode() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        long uniqueSuffix = System.nanoTime() % 10000;
        return "PO-" + timestamp + "-" + uniqueSuffix;
    }
}
