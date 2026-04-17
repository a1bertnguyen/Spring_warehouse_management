package com.Warehouse_managment.Warehouse_managment.Dtos;

import com.Warehouse_managment.Warehouse_managment.Enum.ActivityAction;
import com.Warehouse_managment.Warehouse_managment.Enum.ActivityDomain;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ActivityLogDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private ActivityAction action;
    private ActivityDomain domain;
    private String referenceType;
    private Long referenceId;
    private String beforeState;
    private String afterState;
    private String metadata;
    private String entityType;
    private Long entityId;
    private String oldValue;
    private String newValue;
    private String ipAddress;
    private String note;
    private LocalDateTime createdAt;
}
