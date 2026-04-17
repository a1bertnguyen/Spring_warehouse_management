package com.Warehouse_managment.Warehouse_managment.Service.Impl;

import com.Warehouse_managment.Warehouse_managment.Dtos.PurchaseRequestDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.PurchaseRequestDetailDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.PurchaseRequestRequest;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Enum.PurchaseRequestStatus;
import com.Warehouse_managment.Warehouse_managment.Exceptions.NotFoundException;
import com.Warehouse_managment.Warehouse_managment.Model.PurchaseRequest;
import com.Warehouse_managment.Warehouse_managment.Model.Supplier;
import com.Warehouse_managment.Warehouse_managment.Model.User;
import com.Warehouse_managment.Warehouse_managment.Model.Warehouse;
import com.Warehouse_managment.Warehouse_managment.Repository.PurchaseRequestDetailRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.PurchaseRequestRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.SupplierRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.UserRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.WarehouseRepository;
import com.Warehouse_managment.Warehouse_managment.Service.PurchaseRequestDetailService;
import com.Warehouse_managment.Warehouse_managment.Service.PurchaseRequestService;
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
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class PurchaseRequestServiceImpl implements PurchaseRequestService {

    private final PurchaseRequestRepository purchaseRequestRepository;
    private final PurchaseRequestDetailRepository purchaseRequestDetailRepository;
    private final PurchaseRequestDetailService purchaseRequestDetailService;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Override
    @Transactional
    public Response createPurchaseRequest(PurchaseRequestRequest purchaseRequestRequest) {
        if (purchaseRequestRequest.getSupplierId() != null) {
            supplierRepository.findById(purchaseRequestRequest.getSupplierId())
                    .orElseThrow(() -> new NotFoundException("Supplier Not Found"));
        }

        warehouseRepository.findById(purchaseRequestRequest.getWarehouseId())
                .orElseThrow(() -> new NotFoundException("Warehouse Not Found"));

        User requester = userService.getCurrentLoggedInUser();

        PurchaseRequest purchaseRequest = new PurchaseRequest();
        purchaseRequest.setRequestCode(generateRequestCode());
        purchaseRequest.setRequesterId(requester.getId());
        purchaseRequest.setWarehouseId(purchaseRequestRequest.getWarehouseId());
        purchaseRequest.setSupplierId(purchaseRequestRequest.getSupplierId());
        purchaseRequest.setNotes(purchaseRequestRequest.getNotes());
        purchaseRequest.setRequestDate(LocalDateTime.now());
        purchaseRequest.setStatus(PurchaseRequestStatus.pending_approval);

        PurchaseRequest savedRequest = purchaseRequestRepository.save(purchaseRequest);
        savedRequest.setRequestDetails(purchaseRequestDetailService.saveDetails(savedRequest, purchaseRequestRequest.getItems()));

        return Response.builder()
                .status(200)
                .message("Purchase Request Created Successfully")
                .data(toDto(savedRequest))
                .build();
    }

    @Override
    public Response getAllPurchaseRequests(int page,
                                           int size,
                                           Integer warehouseId,
                                           Long supplierId,
                                           Long requesterId,
                                           String requestCode,
                                           PurchaseRequestStatus status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Specification<PurchaseRequest> specification = Specification.where(null);

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

        Page<PurchaseRequest> requestPage = purchaseRequestRepository.findAll(specification, pageable);
        List<PurchaseRequestDTO> requests = requestPage.getContent().stream()
                .map(this::toSummaryDto)
                .toList();

        return Response.builder()
                .status(200)
                .message("success")
                .data(requests)
                .meta(Response.Meta.builder()
                        .totalElements(requestPage.getTotalElements())
                        .totalPages(requestPage.getTotalPages())
                        .build())
                .build();
    }

    @Override
    public Response getPurchaseRequestById(Integer id) {
        PurchaseRequest purchaseRequest = getRequestEntity(id);

        return Response.builder()
                .status(200)
                .message("success")
                .data(toDto(purchaseRequest))
                .build();
    }

    @Override
    @Transactional
    public Response updatePurchaseRequestStatus(Integer id, PurchaseRequestStatus status) {
        PurchaseRequest purchaseRequest = getRequestEntity(id);
        PurchaseRequestStatus currentStatus = purchaseRequest.getStatus();

        if (status == currentStatus) {
            return Response.builder()
                    .status(200)
                    .message("Purchase Request Status Updated Successfully")
                    .data(toDto(purchaseRequest))
                    .build();
        }

        validateStatusTransition(currentStatus, status);
        purchaseRequest.setStatus(status);

        if (status == PurchaseRequestStatus.approved) {
            purchaseRequest.setApprovedAt(LocalDateTime.now());
        }

        PurchaseRequest updated = purchaseRequestRepository.save(purchaseRequest);

        return Response.builder()
                .status(200)
                .message("Purchase Request Status Updated Successfully")
                .data(toDto(updated))
                .build();
    }

    @Override
    @Transactional
    public Response deletePurchaseRequest(Integer id) {
        PurchaseRequest purchaseRequest = getRequestEntity(id);

        if (purchaseRequest.getStatus() == PurchaseRequestStatus.converted) {
            throw new IllegalStateException("Cannot delete a purchase request that has already been converted to an order");
        }

        purchaseRequestRepository.delete(purchaseRequest);

        return Response.builder()
                .status(200)
                .message("Purchase Request Deleted Successfully")
                .build();
    }

    private void validateStatusTransition(PurchaseRequestStatus currentStatus, PurchaseRequestStatus nextStatus) {
        if (currentStatus == PurchaseRequestStatus.pending_approval
                && (nextStatus == PurchaseRequestStatus.approved || nextStatus == PurchaseRequestStatus.rejected)) {
            return;
        }
        if (currentStatus == PurchaseRequestStatus.approved && nextStatus == PurchaseRequestStatus.converted) {
            return;
        }
        throw new IllegalStateException("Invalid purchase request status transition from " + currentStatus + " to " + nextStatus);
    }

    private PurchaseRequest getRequestEntity(Integer id) {
        return purchaseRequestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Purchase Request Not Found"));
    }

    private PurchaseRequestDTO toSummaryDto(PurchaseRequest purchaseRequest) {
        PurchaseRequestDTO dto = toDto(purchaseRequest);
        dto.setRequestDetails(null);
        return dto;
    }

    private PurchaseRequestDTO toDto(PurchaseRequest purchaseRequest) {
        PurchaseRequestDTO dto = new PurchaseRequestDTO();
        dto.setId(purchaseRequest.getId());
        dto.setRequestCode(purchaseRequest.getRequestCode());
        dto.setRequesterId(purchaseRequest.getRequesterId());
        dto.setWarehouseId(purchaseRequest.getWarehouseId());
        dto.setSupplierId(purchaseRequest.getSupplierId());
        dto.setRequestDate(purchaseRequest.getRequestDate());
        dto.setStatus(purchaseRequest.getStatus());
        dto.setNotes(purchaseRequest.getNotes());
        dto.setApprovedAt(purchaseRequest.getApprovedAt());
        dto.setCreatedAt(purchaseRequest.getCreatedAt());
        dto.setUpdatedAt(purchaseRequest.getUpdatedAt());

        User requester = purchaseRequest.getRequesterId() != null
                ? userRepository.findById(purchaseRequest.getRequesterId()).orElse(null)
                : null;
        Supplier supplier = purchaseRequest.getSupplierId() != null
                ? supplierRepository.findById(purchaseRequest.getSupplierId()).orElse(null)
                : null;
        Warehouse warehouse = purchaseRequest.getWarehouseId() != null
                ? warehouseRepository.findById(purchaseRequest.getWarehouseId()).orElse(null)
                : null;

        dto.setRequesterName(requester != null ? requester.getName() : null);
        dto.setSupplierName(supplier != null ? supplier.getName() : null);
        dto.setWarehouseName(warehouse != null ? warehouse.getName() : null);

        List<PurchaseRequestDetailDTO> details = purchaseRequestDetailRepository.findByPurchaseRequest_Id(purchaseRequest.getId()).stream()
                .map(purchaseRequestDetailService::toDto)
                .toList();
        dto.setRequestDetails(details);
        dto.setTotalItems(details.stream()
                .map(PurchaseRequestDetailDTO::getRequestedQuantity)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum());
        dto.setTotalEstimatedAmount(details.stream()
                .map(PurchaseRequestDetailDTO::getLineTotalEstimated)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        return dto;
    }

    private String generateRequestCode() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        long uniqueSuffix = System.nanoTime() % 10000;
        return "PR-" + timestamp + "-" + uniqueSuffix;
    }
}
