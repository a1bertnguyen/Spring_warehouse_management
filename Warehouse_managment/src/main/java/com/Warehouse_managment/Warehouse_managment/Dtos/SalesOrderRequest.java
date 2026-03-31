package com.Warehouse_managment.Warehouse_managment.Dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SalesOrderRequest {

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @Email(message = "Customer email is invalid")
    private String customerEmail;

    private String customerPhone;

    private String shippingAddress;

    private String notes;

    @Valid
    @NotEmpty(message = "Sales order must contain at least one item")
    private List<SalesOrderDetailRequest> items;
}
