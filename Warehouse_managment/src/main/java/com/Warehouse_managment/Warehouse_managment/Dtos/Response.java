package com.Warehouse_managment.Warehouse_managment.Dtos;

import com.Warehouse_managment.Warehouse_managment.Enum.UserRole;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Response<T> {

    private int status;
    private String message;
    private T data;
    private Meta meta;

    // Kept for the current auth response shape.
    private String token;
    private UserRole role;
    private String expirationTime;
    private Long userId;

    @Builder.Default
    private final LocalDateTime timestamp = LocalDateTime.now();

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Meta {
        private Integer totalPages;
        private Long totalElements;
        private Long totalQuantityOnHand;
        private Long outOfStockCount;
        private Long lowStockCount;
    }
}
