package com.Warehouse_managment.Warehouse_managment.Service.Impl;

import com.Warehouse_managment.Warehouse_managment.Dtos.PurchaseOrderDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.PurchaseOrderDetailDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.PurchaseOrderRequest;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Exceptions.NotFoundException;
import com.Warehouse_managment.Warehouse_managment.Model.Inventory;
import com.Warehouse_managment.Warehouse_managment.Model.Product;
import com.Warehouse_managment.Warehouse_managment.Model.PurchaseOrder;
import com.Warehouse_managment.Warehouse_managment.Model.PurchaseOrderDetail;
import com.Warehouse_managment.Warehouse_managment.Model.Supplier;
import com.Warehouse_managment.Warehouse_managment.Model.User;
import com.Warehouse_managment.Warehouse_managment.Model.Warehouse;
import com.Warehouse_managment.Warehouse_managment.Repository.InventoryRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.ProductRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.PurchaseOrderDetailRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.PurchaseOrderRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.SupplierRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.UserRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.WarehouseRepository;
import com.Warehouse_managment.Warehouse_managment.Service.PurchaseOrderDetailService;
import com.Warehouse_managment.Warehouse_managment.Service.PurchaseOrderService;
import com.Warehouse_managment.Warehouse_managment.Service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderDetailRepository purchaseOrderDetailRepository;
    private final PurchaseOrderDetailService purchaseOrderDetailService;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final UserService userService;

    @Override
    public Response createPurchaseOrder(PurchaseOrderRequest purchaseOrderRequest) {
        Supplier supplier = supplierRepository.findById(purchaseOrderRequest.getSupplierId())
                .orElseThrow(() -> new NotFoundException("Supplier Not Found"));

        warehouseRepository.findById(purchaseOrderRequest.getWarehouseId())
                .orElseThrow(() -> new NotFoundException("Warehouse Not Found"));

        User requester = userService.getCurrentLoggedInUser();

        PurchaseOrder purchaseOrder = new PurchaseOrder();
        purchaseOrder.setRequestCode(generateRequestCode());
        purchaseOrder.setRequesterId(requester.getId());
        purchaseOrder.setWarehouseId(purchaseOrderRequest.getWarehouseId());
        purchaseOrder.setSupplierId(supplier.getId());
        purchaseOrder.setNotes(purchaseOrderRequest.getNotes());
        purchaseOrder.setRequestDate(LocalDateTime.now());
        purchaseOrder.setStatus(PurchaseOrder.OrderStatus.pending_approval);

        PurchaseOrder savedOrder = purchaseOrderRepository.save(purchaseOrder);
        List<PurchaseOrderDetail> details = purchaseOrderDetailService.saveDetails(savedOrder, purchaseOrderRequest.getItems());
        savedOrder.setOrderDetails(details);

        return Response.builder()
                .status(200)
                .message("Purchase Order Created Successfully")
                .purchaseOrder(toDto(savedOrder))
                .build();
    }

    @Override
    public Response getAllPurchaseOrders(int page,
                                         int size,
                                         Integer warehouseId,
                                         Long supplierId,
                                         Long requesterId,
                                         String requestCode,
                                         PurchaseOrder.OrderStatus status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Specification<PurchaseOrder> specification = Specification.where(null);

        if (warehouseId != null) {
            specification = specification.and((root, query, cb) -> cb.equal(root.get("warehouseId"), warehouseId));
        }

        if (supplierId != null) {
            specification = specification.and((root, query, cb) -> cb.equal(root.get("supplierId"), supplierId));
        }

        if (requesterId != null) {
            specification = specification.and((root, query, cb) -> cb.equal(root.get("requesterId"), requesterId));
        }

        if (requestCode != null && !requestCode.isBlank()) {
            specification = specification.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("requestCode")), "%" + requestCode.trim().toLowerCase() + "%"));
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
                .purchaseOrders(orderDTOs)
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .build();
    }

    @Override
    public Response getPurchaseOrderById(Integer id) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Purchase Order Not Found"));

        return Response.builder()
                .status(200)
                .message("success")
                .purchaseOrder(toDto(purchaseOrder))
                .build();
    }

    @Override
    public Response updatePurchaseOrderStatus(Integer id, PurchaseOrder.OrderStatus status) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Purchase Order Not Found"));

        PurchaseOrder.OrderStatus previousStatus = purchaseOrder.getStatus();
        purchaseOrder.setStatus(status);

        if (status == PurchaseOrder.OrderStatus.approved) {
            purchaseOrder.setApprovedAt(LocalDateTime.now());
        }

        if (status == PurchaseOrder.OrderStatus.received && previousStatus != PurchaseOrder.OrderStatus.received) {
            applyReceivedInventory(purchaseOrder);
        }

        PurchaseOrder updatedOrder = purchaseOrderRepository.save(purchaseOrder);

        return Response.builder()
                .status(200)
                .message("Purchase Order Status Updated Successfully")
                .purchaseOrder(toDto(updatedOrder))
                .build();
    }

    @Override
    public Response deletePurchaseOrder(Integer id) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Purchase Order Not Found"));

        purchaseOrderRepository.delete(purchaseOrder);

        return Response.builder()
                .status(200)
                .message("Purchase Order Deleted Successfully")
                .build();
    }

    private void applyReceivedInventory(PurchaseOrder purchaseOrder) {
        Warehouse warehouse = warehouseRepository.findById(purchaseOrder.getWarehouseId())
                .orElseThrow(() -> new NotFoundException("Warehouse Not Found"));

        for (PurchaseOrderDetail detail : purchaseOrderDetailRepository.findByPurchaseOrder_Id(purchaseOrder.getId())) {
            Product product = productRepository.findById(detail.getProductId())
                    .orElseThrow(() -> new NotFoundException("Product Not Found"));

            product.setStockQuantity((product.getStockQuantity() != null ? product.getStockQuantity() : 0)
                    + detail.getRequestedQuantity());
            productRepository.save(product);

            Inventory inventory = inventoryRepository.findByProductAndWarehouse(product, warehouse)
                    .orElse(Inventory.builder()
                            .product(product)
                            .warehouse(warehouse)
                            .quantityOnHand(0)
                            .lastUpdated(new Timestamp(System.currentTimeMillis()))
                            .build());

            inventory.setQuantityOnHand((inventory.getQuantityOnHand() != null ? inventory.getQuantityOnHand() : 0)
                    + detail.getRequestedQuantity());
            inventory.setLastUpdated(new Timestamp(System.currentTimeMillis()));
            inventoryRepository.save(inventory);
        }
    }

    private PurchaseOrderDTO toSummaryDto(PurchaseOrder purchaseOrder) {
        PurchaseOrderDTO dto = toDto(purchaseOrder);
        dto.setOrderDetails(null);
        return dto;
    }

    private PurchaseOrderDTO toDto(PurchaseOrder purchaseOrder) {
        PurchaseOrderDTO dto = new PurchaseOrderDTO();
        dto.setId(purchaseOrder.getId());
        dto.setRequestCode(purchaseOrder.getRequestCode());
        dto.setRequesterId(purchaseOrder.getRequesterId());
        dto.setWarehouseId(purchaseOrder.getWarehouseId());
        dto.setSupplierId(purchaseOrder.getSupplierId());
        dto.setRequestDate(purchaseOrder.getRequestDate());
        dto.setStatus(purchaseOrder.getStatus());
        dto.setNotes(purchaseOrder.getNotes());
        dto.setApprovedAt(purchaseOrder.getApprovedAt());
        dto.setCreatedAt(purchaseOrder.getCreatedAt());
        dto.setUpdatedAt(purchaseOrder.getUpdatedAt());

        User requester = purchaseOrder.getRequesterId() != null
                ? userRepository.findById(purchaseOrder.getRequesterId()).orElse(null)
                : null;
        Supplier supplier = purchaseOrder.getSupplierId() != null
                ? supplierRepository.findById(purchaseOrder.getSupplierId()).orElse(null)
                : null;
        Warehouse warehouse = purchaseOrder.getWarehouseId() != null
                ? warehouseRepository.findById(purchaseOrder.getWarehouseId()).orElse(null)
                : null;

        dto.setRequesterName(requester != null ? requester.getName() : null);
        dto.setSupplierName(supplier != null ? supplier.getName() : null);
        dto.setWarehouseName(warehouse != null ? warehouse.getName() : null);

        List<PurchaseOrderDetailDTO> details = purchaseOrderDetailRepository.findByPurchaseOrder_Id(purchaseOrder.getId()).stream()
                .map(purchaseOrderDetailService::toDto)
                .toList();
        dto.setOrderDetails(details);
        dto.setTotalItems(details.stream()
                .map(PurchaseOrderDetailDTO::getRequestedQuantity)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum());
        dto.setTotalEstimatedAmount(details.stream()
                .map(PurchaseOrderDetailDTO::getLineTotalEstimated)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        return dto;
    }

    private String generateRequestCode() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        long uniqueSuffix = System.nanoTime() % 10000;
        return "PO-" + timestamp + "-" + uniqueSuffix;
    }
}
