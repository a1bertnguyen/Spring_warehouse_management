package com.Warehouse_managment.Warehouse_managment.Service.Impl;

import com.Warehouse_managment.Warehouse_managment.Dtos.PurchaseOrderDetailDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.PurchaseOrderDetailRequest;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Exceptions.NotFoundException;
import com.Warehouse_managment.Warehouse_managment.Model.Product;
import com.Warehouse_managment.Warehouse_managment.Model.PurchaseOrder;
import com.Warehouse_managment.Warehouse_managment.Model.PurchaseOrderDetail;
import com.Warehouse_managment.Warehouse_managment.Repository.ProductRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.PurchaseOrderDetailRepository;
import com.Warehouse_managment.Warehouse_managment.Service.PurchaseOrderDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseOrderDetailServiceImpl implements PurchaseOrderDetailService {

    private final PurchaseOrderDetailRepository detailRepository;
    private final ProductRepository productRepository;

    @Override
    public List<PurchaseOrderDetail> saveDetails(PurchaseOrder purchaseOrder, List<PurchaseOrderDetailRequest> detailRequests) {
        List<PurchaseOrderDetail> details = new ArrayList<>();

        for (PurchaseOrderDetailRequest request : detailRequests) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new NotFoundException("Product Not Found"));

            PurchaseOrderDetail detail = new PurchaseOrderDetail();
            detail.setPurchaseOrder(purchaseOrder);
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
    public Response getDetailsByOrderId(Integer orderId) {
        List<PurchaseOrderDetailDTO> details = detailRepository.findByPurchaseOrder_Id(orderId).stream()
                .map(this::toDto)
                .toList();

        return Response.builder()
                .status(200)
                .message("success")
                .purchaseOrderDetails(details)
                .build();
    }

    @Override
    public PurchaseOrderDetailDTO toDto(PurchaseOrderDetail detail) {
        PurchaseOrderDetailDTO dto = new PurchaseOrderDetailDTO();
        dto.setId(detail.getId());
        dto.setPurchaseOrderId(detail.getPurchaseOrder() != null ? detail.getPurchaseOrder().getId() : null);
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
