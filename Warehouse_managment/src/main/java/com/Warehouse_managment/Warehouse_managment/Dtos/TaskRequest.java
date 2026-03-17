package com.Warehouse_managment.Warehouse_managment.Dtos;

import com.Warehouse_managment.Warehouse_managment.Enum.TaskStatus;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TaskRequest {
    @Positive(message = "product id is required")
    private Long productId;

    @Positive(message = "user id is required")
    private Long userId;

    private String name;

    private String description;

    private TaskStatus status;

    private LocalDateTime deadline;
}
