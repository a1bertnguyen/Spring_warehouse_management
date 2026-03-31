package com.Warehouse_managment.Warehouse_managment.Service.Impl;

import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Dtos.SalesOrderDetailDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.SalesOrderDetailRequest;
import com.Warehouse_managment.Warehouse_managment.Exceptions.NotFoundException;
import com.Warehouse_managment.Warehouse_managment.Model.Product;
import com.Warehouse_managment.Warehouse_managment.Model.SalesOrder;
import com.Warehouse_managment.Warehouse_managment.Model.SalesOrderDetail;
import com.Warehouse_managment.Warehouse_managment.Model.Warehouse;
import com.Warehouse_managment.Warehouse_managment.Repository.ProductRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.SalesOrderDetailRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.WarehouseRepository;
import com.Warehouse_managment.Warehouse_managment.Service.SalesOrderDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalesOrderDetailServiceImpl implements SalesOrderDetailService {

    private final SalesOrderDetailRepository salesOrderDetailRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;

    @Override
    @Transactional
    public List<SalesOrderDetail> saveDetails(SalesOrder salesOrder, List<SalesOrderDetailRequest> detailRequests) {
        List<SalesOrderDetail> details = new ArrayList<>();

        for (SalesOrderDetailRequest request : detailRequests) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new NotFoundException("Product Not Found"));

            warehouseRepository.findById(request.getWarehouseId())
                    .orElseThrow(() -> new NotFoundException("Warehouse Not Found"));

            SalesOrderDetail detail = new SalesOrderDetail();
            detail.setSalesOrder(salesOrder);
            detail.setProductId(product.getId());
            detail.setWarehouseId(request.getWarehouseId());
            detail.setQuantityOrdered(request.getQuantityOrdered());
            BigDecimal unitSalePrice = request.getUnitSalePrice() != null
                    ? request.getUnitSalePrice()
                    : product.getSalePrice();
            if (unitSalePrice == null) {
                throw new IllegalStateException("Unit sale price is required for product " + product.getId());
            }
            detail.setUnitSalePrice(unitSalePrice);

            details.add(salesOrderDetailRepository.save(detail));
        }

        return details;
    }

    @Override
    @Transactional(readOnly = true)
    public Response getDetailsByOrderId(Integer orderId) {
        List<SalesOrderDetailDTO> details = salesOrderDetailRepository.findBySalesOrder_IdOrderByIdAsc(orderId).stream()
                .map(this::toDto)
                .toList();

        return Response.builder()
                .status(200)
                .message("success")
                .salesOrderDetails(details)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public SalesOrderDetailDTO toDto(SalesOrderDetail detail) {
        SalesOrderDetailDTO dto = new SalesOrderDetailDTO();
        dto.setId(detail.getId());
        dto.setSalesOrderId(detail.getSalesOrder() != null ? detail.getSalesOrder().getId() : null);
        dto.setProductId(detail.getProductId());
        dto.setWarehouseId(detail.getWarehouseId());
        dto.setQuantityOrdered(detail.getQuantityOrdered());
        dto.setUnitSalePrice(detail.getUnitSalePrice());

        Product product = productRepository.findById(detail.getProductId()).orElse(null);
        if (product != null) {
            dto.setProductName(product.getName());
            dto.setProductSku(product.getSku());
        }

        Warehouse warehouse = warehouseRepository.findById(detail.getWarehouseId()).orElse(null);
        if (warehouse != null) {
            dto.setWarehouseName(warehouse.getName());
        }

        if (detail.getUnitSalePrice() != null && detail.getQuantityOrdered() != null) {
            dto.setLineTotal(detail.getUnitSalePrice().multiply(BigDecimal.valueOf(detail.getQuantityOrdered())));
        }

        return dto;
    }
}
