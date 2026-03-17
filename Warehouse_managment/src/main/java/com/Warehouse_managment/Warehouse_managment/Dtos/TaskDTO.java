package com.Warehouse_managment.Warehouse_managment.Dtos;


import com.Warehouse_managment.Warehouse_managment.Enum.TaskStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class TaskDTO {
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    private TaskStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime deadline;

    @JsonIgnoreProperties({"transactions", "password"})
    private UserDTO user;

    private ProductDTO product;

}
