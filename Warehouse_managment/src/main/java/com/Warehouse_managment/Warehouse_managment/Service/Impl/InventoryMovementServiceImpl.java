package com.Warehouse_managment.Warehouse_managment.Service.Impl;

import com.Warehouse_managment.Warehouse_managment.Dtos.InventoryMovementDTO;
import com.Warehouse_managment.Warehouse_managment.Dtos.Response;
import com.Warehouse_managment.Warehouse_managment.Enum.InventoryMovementType;
import com.Warehouse_managment.Warehouse_managment.Enum.InventoryReferenceType;
import com.Warehouse_managment.Warehouse_managment.Model.InventoryMovement;
import com.Warehouse_managment.Warehouse_managment.Model.Product;
import com.Warehouse_managment.Warehouse_managment.Model.User;
import com.Warehouse_managment.Warehouse_managment.Model.Warehouse;
import com.Warehouse_managment.Warehouse_managment.Repository.InventoryMovementRepository;
import com.Warehouse_managment.Warehouse_managment.Repository.UserRepository;
import com.Warehouse_managment.Warehouse_managment.Service.InventoryMovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryMovementServiceImpl implements InventoryMovementService {

    private final InventoryMovementRepository inventoryMovementRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void recordMovement(Product product,
                               Warehouse warehouse,
                               Integer quantityBefore,
                               Integer quantityDelta,
                               Integer quantityAfter,
                               InventoryMovementType movementType,
                               InventoryReferenceType referenceType,
                               String referenceId,
                               String referenceCode,
                               String note) {
        int before = safeQuantity(quantityBefore);
        int delta = safeQuantity(quantityDelta);
        int after = safeQuantity(quantityAfter);

        if (delta == 0) {
            return;
        }

        User actor = getCurrentUserOrNull();

        InventoryMovement movement = InventoryMovement.builder()
                .productId(product.getId())
                .product(product)
                .productName(product.getName())
                .productSku(product.getSku())
                .warehouseId(warehouse.getId())
                .warehouse(warehouse)
                .warehouseName(warehouse.getName())
                .actorUserId(actor != null ? actor.getId() : null)
                .actorUser(actor)
                .actorUserName(actor != null ? actor.getName() : null)
                .movementType(movementType)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .referenceCode(referenceCode)
                .quantityBefore(before)
                .quantityDelta(delta)
                .quantityAfter(after)
                .note(note)
                .build();

        inventoryMovementRepository.save(movement);
    }

    @Override
    @Transactional(readOnly = true)
    public Response getInventoryMovements(Integer warehouseId,
                                          Long productId,
                                          InventoryMovementType movementType,
                                          InventoryReferenceType referenceType,
                                          String referenceId) {
        List<InventoryMovementDTO> movements = inventoryMovementRepository
                .search(warehouseId, productId, movementType, referenceType, normalize(referenceId))
                .stream()
                .map(this::toDto)
                .toList();

        return Response.builder()
                .status(200)
                .message("success")
                .data(movements)
                .meta(Response.Meta.builder()
                        .totalElements((long) movements.size())
                        .build())
                .build();
    }

    private InventoryMovementDTO toDto(InventoryMovement movement) {
        return new InventoryMovementDTO(
                movement.getMovementId(),
                movement.getProductId(),
                movement.getProductName(),
                movement.getProductSku(),
                movement.getWarehouseId(),
                movement.getWarehouseName(),
                movement.getActorUserId(),
                movement.getActorUserName(),
                movement.getMovementType(),
                movement.getReferenceType(),
                movement.getReferenceId(),
                movement.getReferenceCode(),
                movement.getQuantityBefore(),
                movement.getQuantityDelta(),
                movement.getQuantityAfter(),
                movement.getNote(),
                movement.getCreatedAt()
        );
    }

    private User getCurrentUserOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return null;
        }

        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }

    private int safeQuantity(Integer quantity) {
        return quantity != null ? quantity : 0;
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
