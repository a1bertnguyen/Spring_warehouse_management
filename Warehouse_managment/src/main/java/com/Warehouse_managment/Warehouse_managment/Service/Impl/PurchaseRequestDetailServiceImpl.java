package com.Warehouse_managment.Warehouse_managment.Service.Impl;

import com.Warehouse_managment.Warehouse_managment.Dtos.PurchaseRequestDetailDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.PurchaseRequestDetailRequest;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Exceptions.NotFoundException;
import com.Warehouse_managment.Warehouse_managment.Model.Product;
import com.Warehouse_managment.Warehouse_managment.Model.PurchaseRequest;
import com.Warehouse_managment.Warehouse_managment.Model.PurchaseRequestDetail;
import com.Warehouse_managment.Warehouse_managment.Repository.ProductRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.PurchaseRequestDetailRepository;
import com.Warehouse_managment.Warehouse_managment.Service.PurchaseRequestDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseRequestDetailServiceImpl implements PurchaseRequestDetailService {

    private final PurchaseRequestDetailRepository detailRepository;
    private final ProductRepository productRepository;

    @Override
    public List<PurchaseRequestDetail> saveDetails(PurchaseRequest purchaseRequest, List<PurchaseRequestDetailRequest> detailRequests) {
        List<PurchaseRequestDetail> details = new ArrayList<>();

        for (PurchaseRequestDetailRequest request : detailRequests) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new NotFoundException("Product Not Found"));

            PurchaseRequestDetail detail = new PurchaseRequestDetail();
            detail.setPurchaseRequest(purchaseRequest);
            detail.setProductId(product.getId());
            detail.setRequestedQuantity(request.getRequestedQuantity());
            detail.setUnitPriceEstimated(request.getUnitPriceEstimated() != null
                    ? request.getUnitPriceEstimated()
                    : product.getPurchaseprice());
            detail.setSupplierIdSuggested(request.getSupplierIdSuggested());
            detail.setNote(request.getNote());

            details.add(detailRepository.save(detail));
        }

        return details;
    }

    @Override
    public Response getDetailsByRequestId(Integer requestId) {
        List<PurchaseRequestDetailDTO> details = detailRepository.findByPurchaseRequest_Id(requestId).stream()
                .map(this::toDto)
                .toList();

        return Response.builder()
                .status(200)
                .message("success")
                .data(details)
                .build();
    }

    @Override
    public PurchaseRequestDetailDTO toDto(PurchaseRequestDetail detail) {
        PurchaseRequestDetailDTO dto = new PurchaseRequestDetailDTO();
        dto.setId(detail.getId());
        dto.setPurchaseRequestId(detail.getPurchaseRequest() != null ? detail.getPurchaseRequest().getId() : null);
        dto.setProductId(detail.getProductId());
        dto.setRequestedQuantity(detail.getRequestedQuantity());
        dto.setUnitPriceEstimated(detail.getUnitPriceEstimated());
        dto.setSupplierIdSuggested(detail.getSupplierIdSuggested());
        dto.setNote(detail.getNote());

        if (detail.getProduct() != null) {
            dto.setProductName(detail.getProduct().getName());
            dto.setProductSku(detail.getProduct().getSku());
        }

        if (detail.getUnitPriceEstimated() != null && detail.getRequestedQuantity() != null) {
            dto.setLineTotalEstimated(detail.getUnitPriceEstimated().multiply(BigDecimal.valueOf(detail.getRequestedQuantity())));
        }

        return dto;
    }
}
