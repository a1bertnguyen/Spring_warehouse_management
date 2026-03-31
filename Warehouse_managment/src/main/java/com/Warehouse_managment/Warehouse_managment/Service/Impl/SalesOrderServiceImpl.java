package com.Warehouse_managment.Warehouse_managment.Service.Impl;

import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Dtos.SalesOrderDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.SalesOrderDetailDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.SalesOrderRequest;
import com.Warehouse_managment.Warehouse_managment.Enum.SalesOrderStatus;
import com.Warehouse_managment.Warehouse_managment.Exceptions.NotFoundException;
import com.Warehouse_managment.Warehouse_managment.Model.Inventory;
import com.Warehouse_managment.Warehouse_managment.Model.SalesOrder;
import com.Warehouse_managment.Warehouse_managment.Model.SalesOrderDetail;
import com.Warehouse_managment.Warehouse_managment.Model.User;
import com.Warehouse_managment.Warehouse_managment.Repository.InventoryRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.SalesOrderDetailRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.SalesOrderRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.UserRepository;
import com.Warehouse_managment.Warehouse_managment.Service.SalesOrderDetailService;
import com.Warehouse_managment.Warehouse_managment.Service.SalesOrderService;
import com.Warehouse_managment.Warehouse_managment.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class SalesOrderServiceImpl implements SalesOrderService {

    private final SalesOrderRepository salesOrderRepository;
    private final SalesOrderDetailRepository salesOrderDetailRepository;
    private final SalesOrderDetailService salesOrderDetailService;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    private static final Map<SalesOrderStatus, List<SalesOrderStatus>> VALID_TRANSITIONS =
            new EnumMap<>(SalesOrderStatus.class);

    static {
        VALID_TRANSITIONS.put(SalesOrderStatus.pending_stock_check,
                List.of(SalesOrderStatus.awaiting_shipment, SalesOrderStatus.cancelled));
        VALID_TRANSITIONS.put(SalesOrderStatus.awaiting_shipment,
                List.of(SalesOrderStatus.shipped, SalesOrderStatus.cancelled));
        VALID_TRANSITIONS.put(SalesOrderStatus.shipped,
                List.of(SalesOrderStatus.completed));
        VALID_TRANSITIONS.put(SalesOrderStatus.completed, List.of());
        VALID_TRANSITIONS.put(SalesOrderStatus.cancelled, List.of());
    }

    @Override
    @Transactional
    public Response createSalesOrder(SalesOrderRequest salesOrderRequest) {
        User currentUser = userService.getCurrentLoggedInUser();

        SalesOrder salesOrder = new SalesOrder();
        salesOrder.setOrderCode(generateOrderCode());
        salesOrder.setCustomerName(salesOrderRequest.getCustomerName());
        salesOrder.setCustomerEmail(salesOrderRequest.getCustomerEmail());
        salesOrder.setCustomerPhone(salesOrderRequest.getCustomerPhone());
        salesOrder.setShippingAddress(salesOrderRequest.getShippingAddress());
        salesOrder.setCreatedById(currentUser.getId());
        salesOrder.setOrderDate(LocalDateTime.now());
        salesOrder.setStatus(SalesOrderStatus.pending_stock_check);
        salesOrder.setNotes(salesOrderRequest.getNotes());

        SalesOrder savedOrder = salesOrderRepository.save(salesOrder);
        List<SalesOrderDetail> orderDetails = salesOrderDetailService.saveDetails(savedOrder, salesOrderRequest.getItems());
        savedOrder.setOrderDetails(orderDetails);

        return Response.builder()
                .status(200)
                .message("Sales Order Created Successfully")
                .salesOrder(toDto(savedOrder))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Response getAllSalesOrders(int page,
                                      int size,
                                      String orderCode,
                                      String customerName,
                                      SalesOrderStatus status,
                                      Integer warehouseId,
                                      Long createdById) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Specification<SalesOrder> specification = Specification.where(null);

        if (orderCode != null && !orderCode.isBlank()) {
            specification = specification.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("orderCode")), "%" + orderCode.trim().toLowerCase() + "%"));
        }

        if (customerName != null && !customerName.isBlank()) {
            specification = specification.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("customerName")), "%" + customerName.trim().toLowerCase() + "%"));
        }

        if (status != null) {
            specification = specification.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }

        if (createdById != null) {
            specification = specification.and((root, query, cb) -> cb.equal(root.get("createdById"), createdById));
        }

        if (warehouseId != null) {
            specification = specification.and((root, query, cb) -> {
                query.distinct(true);
                return cb.equal(root.join("orderDetails").get("warehouseId"), warehouseId);
            });
        }

        Page<SalesOrder> orderPage = salesOrderRepository.findAll(specification, pageable);
        List<SalesOrderDTO> orders = orderPage.getContent().stream()
                .map(this::toSummaryDto)
                .toList();

        return Response.builder()
                .status(200)
                .message("success")
                .salesOrders(orders)
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Response getSalesOrderById(Integer id) {
        SalesOrder salesOrder = salesOrderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Sales Order Not Found"));

        return Response.builder()
                .status(200)
                .message("success")
                .salesOrder(toDto(salesOrder))
                .build();
    }

    @Override
    @Transactional
    public Response updateSalesOrderStatus(Integer id, SalesOrderStatus status) {
        SalesOrder salesOrder = salesOrderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Sales Order Not Found"));

        SalesOrderStatus currentStatus = salesOrder.getStatus();
        if (status == currentStatus) {
            return Response.builder()
                    .status(200)
                    .message("Sales Order Status Updated Successfully")
                    .salesOrder(toDto(salesOrder))
                    .build();
        }

        validateStatusTransition(currentStatus, status);

        if (status == SalesOrderStatus.awaiting_shipment || status == SalesOrderStatus.shipped) {
            validateInventoryAvailability(salesOrder);
        }

        if (status == SalesOrderStatus.shipped && currentStatus != SalesOrderStatus.shipped) {
            deductInventory(salesOrder);
        }

        salesOrder.setStatus(status);
        SalesOrder updatedOrder = salesOrderRepository.save(salesOrder);

        return Response.builder()
                .status(200)
                .message("Sales Order Status Updated Successfully")
                .salesOrder(toDto(updatedOrder))
                .build();
    }

    @Override
    @Transactional
    public Response deleteSalesOrder(Integer id) {
        SalesOrder salesOrder = salesOrderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Sales Order Not Found"));

        if (salesOrder.getStatus() == SalesOrderStatus.shipped || salesOrder.getStatus() == SalesOrderStatus.completed) {
            throw new IllegalStateException("Cannot delete a sales order that has already been shipped or completed");
        }

        salesOrderRepository.delete(salesOrder);

        return Response.builder()
                .status(200)
                .message("Sales Order Deleted Successfully")
                .build();
    }

    private void validateStatusTransition(SalesOrderStatus currentStatus, SalesOrderStatus nextStatus) {
        List<SalesOrderStatus> allowedTransitions = VALID_TRANSITIONS.getOrDefault(currentStatus, List.of());
        if (!allowedTransitions.contains(nextStatus)) {
            throw new IllegalStateException("Invalid status transition from " + currentStatus + " to " + nextStatus);
        }
    }

    private void validateInventoryAvailability(SalesOrder salesOrder) {
        for (SalesOrderDetail detail : salesOrderDetailRepository.findBySalesOrder_IdOrderByIdAsc(salesOrder.getId())) {
            Inventory inventory = inventoryRepository.findByProduct_IdAndWarehouse_Id(detail.getProductId(), detail.getWarehouseId())
                    .orElseThrow(() -> new NotFoundException("Inventory Not Found For Product/Warehouse"));

            Integer quantityOnHand = inventory.getQuantityOnHand() != null ? inventory.getQuantityOnHand() : 0;
            if (quantityOnHand < detail.getQuantityOrdered()) {
                throw new IllegalStateException("Insufficient inventory for product " + detail.getProductId());
            }
        }
    }

    private void deductInventory(SalesOrder salesOrder) {
        for (SalesOrderDetail detail : salesOrderDetailRepository.findBySalesOrder_IdOrderByIdAsc(salesOrder.getId())) {
            Inventory inventory = inventoryRepository.findByProduct_IdAndWarehouse_Id(detail.getProductId(), detail.getWarehouseId())
                    .orElseThrow(() -> new NotFoundException("Inventory Not Found For Product/Warehouse"));

            inventory.setQuantityOnHand((inventory.getQuantityOnHand() != null ? inventory.getQuantityOnHand() : 0)
                    - detail.getQuantityOrdered());
            inventoryRepository.save(inventory);
        }
    }

    private SalesOrderDTO toSummaryDto(SalesOrder salesOrder) {
        SalesOrderDTO dto = toDto(salesOrder);
        dto.setOrderDetails(null);
        return dto;
    }

    private SalesOrderDTO toDto(SalesOrder salesOrder) {
        SalesOrderDTO dto = new SalesOrderDTO();
        dto.setId(salesOrder.getId());
        dto.setOrderCode(salesOrder.getOrderCode());
        dto.setCustomerName(salesOrder.getCustomerName());
        dto.setCustomerEmail(salesOrder.getCustomerEmail());
        dto.setCustomerPhone(salesOrder.getCustomerPhone());
        dto.setShippingAddress(salesOrder.getShippingAddress());
        dto.setCreatedById(salesOrder.getCreatedById());
        dto.setOrderDate(salesOrder.getOrderDate());
        dto.setStatus(salesOrder.getStatus());
        dto.setNotes(salesOrder.getNotes());
        dto.setCreatedAt(salesOrder.getCreatedAt());
        dto.setUpdatedAt(salesOrder.getUpdatedAt());

        User createdBy = salesOrder.getCreatedById() != null
                ? userRepository.findById(salesOrder.getCreatedById()).orElse(null)
                : null;
        if (createdBy != null) {
            dto.setCreatedByName(createdBy.getName());
        }

        List<SalesOrderDetailDTO> details = salesOrderDetailRepository.findBySalesOrder_IdOrderByIdAsc(salesOrder.getId()).stream()
                .map(salesOrderDetailService::toDto)
                .toList();
        dto.setOrderDetails(details);
        dto.setTotalItems(details.stream()
                .map(SalesOrderDetailDTO::getQuantityOrdered)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum());
        dto.setTotalOrderValue(details.stream()
                .map(SalesOrderDetailDTO::getLineTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        return dto;
    }

    private String generateOrderCode() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        long uniqueSuffix = System.nanoTime() % 10000;
        return "SO-" + timestamp + "-" + uniqueSuffix;
    }
}
