package com.Warehouse_managment.Warehouse_managment.Dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class WarehouseDTO {

    private Integer id;

    @NotBlank(message = "Warehouse name is required")
    private String name;

    @NotBlank(message = "Address is required")
    private String address;

    private LocalDateTime createdAt;

    private List<ProductDTO> products;
}
